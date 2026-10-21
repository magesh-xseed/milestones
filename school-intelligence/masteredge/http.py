"""Compliant HTTP fetching.

* Honours robots.txt for the configured user agent (fails closed if robots.txt
  says no; treats unreachable robots.txt per RFC 9309: 4xx = allowed, 5xx = disallowed).
* Per-host politeness delay shared across threads.
* Detects access controls (403/401/429, Cloudflare challenge, CAPTCHA markers)
  and raises AccessBlocked instead of trying to get around them.
* Stores every successful response body as an immutable raw snapshot
  (data/raw/<sha256>.gz) plus an index entry, so evidence can be re-checked offline.
"""

from __future__ import annotations

import gzip
import json
import threading
import time
import urllib.robotparser
from dataclasses import dataclass, asdict
from pathlib import Path
from urllib.parse import urlsplit

import requests

from .util import append_jsonl, sha256_bytes, utc_now

CHALLENGE_MARKERS = (
    "cf-mitigated", "challenge-platform", "cf_chl_", "g-recaptcha", "hcaptcha",
    "captcha-delivery", "px-captcha", "are you a robot", "verify you are human",
)


class FetchError(Exception):
    def __init__(self, url: str, reason: str, status: int | None = None):
        super().__init__(f"{reason}: {url}")
        self.url = url
        self.reason = reason
        self.status = status


class AccessBlocked(FetchError):
    """Robots.txt disallow, authentication, CAPTCHA or anti-bot control. Never bypassed."""


@dataclass
class Snapshot:
    url: str
    final_url: str
    status: int
    content_type: str
    sha256: str
    retrieved_at: str
    raw_path: str
    last_modified: str | None = None
    from_cache: bool = False

    def read_bytes(self, raw_root: Path) -> bytes:
        with gzip.open(raw_root / self.raw_path, "rb") as fh:
            return fh.read()

    def read_text(self, raw_root: Path) -> str:
        return self.read_bytes(raw_root).decode("utf-8", errors="replace")


class SnapshotStore:
    """Content-addressed, append-only store of raw responses."""

    def __init__(self, raw_dir: Path):
        self.raw_dir = Path(raw_dir)
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.raw_dir / "index.jsonl"
        self._lock = threading.Lock()
        self._latest: dict[str, Snapshot] = {}
        if self.index_path.exists():
            with open(self.index_path, encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if line:
                        d = json.loads(line)
                        self._latest[d["url"]] = Snapshot(**{k: v for k, v in d.items() if k != "from_cache"})

    def put(self, url: str, final_url: str, status: int, content_type: str, body: bytes,
            last_modified: str | None) -> Snapshot:
        digest = sha256_bytes(body)
        rel = f"{digest[:2]}/{digest}.gz"
        path = self.raw_dir / rel
        with self._lock:
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                tmp = path.with_suffix(".tmp")
                with gzip.open(tmp, "wb") as fh:
                    fh.write(body)
                tmp.replace(path)
            snap = Snapshot(url=url, final_url=final_url, status=status, content_type=content_type,
                            sha256=digest, retrieved_at=utc_now(), raw_path=rel, last_modified=last_modified)
            append_jsonl(self.index_path, asdict(snap))
            self._latest[url] = snap
        return snap

    def latest(self, url: str) -> Snapshot | None:
        return self._latest.get(url)

    def by_sha(self, sha: str) -> Path:
        return self.raw_dir / sha[:2] / f"{sha}.gz"


class Fetcher:
    def __init__(self, store: SnapshotStore, user_agent: str, per_host_delay: float = 1.5,
                 timeout: float = 30, max_retries: int = 2, cache_max_age_days: float | None = 30,
                 access_log: Path | None = None, offline: bool = False,
                 per_host_delay_overrides: dict[str, float] | None = None):
        self.store = store
        self.user_agent = user_agent
        self.per_host_delay = per_host_delay
        self.per_host_delay_overrides = per_host_delay_overrides or {}
        self.timeout = timeout
        self.max_retries = max_retries
        self.cache_max_age_days = cache_max_age_days
        self.access_log = access_log
        self.offline = offline
        self._session_local = threading.local()
        self._host_locks: dict[str, threading.Lock] = {}
        self._host_last: dict[str, float] = {}
        self._robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
        self._robots_status: dict[str, str] = {}
        self._meta_lock = threading.Lock()

    # -- plumbing ---------------------------------------------------------
    @property
    def session(self) -> requests.Session:
        s = getattr(self._session_local, "s", None)
        if s is None:
            s = requests.Session()
            s.headers.update({"User-Agent": self.user_agent, "Accept-Language": "en-IN,en;q=0.8"})
            self._session_local.s = s
        return s

    def _host_lock(self, host: str) -> threading.Lock:
        with self._meta_lock:
            return self._host_locks.setdefault(host, threading.Lock())

    def _wait_turn(self, host: str) -> None:
        lock = self._host_lock(host)
        with lock:
            last = self._host_last.get(host, 0.0)
            delay = self.per_host_delay_overrides.get(host.removeprefix("www."), self.per_host_delay)
            wait = delay - (time.monotonic() - last)
            if wait > 0:
                time.sleep(wait)
            self._host_last[host] = time.monotonic()

    def _log(self, **entry) -> None:
        if self.access_log:
            append_jsonl(self.access_log, {"at": utc_now(), **entry})

    # -- robots -----------------------------------------------------------
    def robots_allowed(self, url: str) -> tuple[bool, str]:
        parts = urlsplit(url)
        base = f"{parts.scheme}://{parts.netloc}"
        with self._host_lock("robots:" + base):
            if base not in self._robots:
                rp = urllib.robotparser.RobotFileParser()
                robots_url = base + "/robots.txt"
                status_note = ""
                if self.offline:
                    snap = self.store.latest(robots_url)
                    if snap is None:
                        rp = None
                        status_note = "offline-no-robots-snapshot"
                    else:
                        rp.parse(snap.read_text(self.store.raw_dir).splitlines())
                        status_note = "offline-cached"
                else:
                    try:
                        self._wait_turn(parts.netloc)
                        resp = self.session.get(robots_url, timeout=self.timeout, allow_redirects=True)
                        if resp.status_code >= 500:
                            rp = None
                            status_note = f"robots-{resp.status_code}-treated-as-disallow"
                        elif resp.status_code >= 400:
                            rp.parse([])
                            status_note = f"robots-{resp.status_code}-treated-as-allow"
                        else:
                            self.store.put(robots_url, resp.url, resp.status_code,
                                           resp.headers.get("content-type", ""), resp.content,
                                           resp.headers.get("last-modified"))
                            rp.parse(resp.text.splitlines())
                            status_note = "robots-ok"
                    except requests.RequestException as exc:
                        rp = None
                        status_note = f"robots-unreachable:{type(exc).__name__}"
                self._robots[base] = rp
                self._robots_status[base] = status_note
        rp = self._robots[base]
        note = self._robots_status[base]
        if rp is None:
            return False, note
        return rp.can_fetch(self.user_agent, url), note

    # -- fetch ------------------------------------------------------------
    def _cache_fresh(self, snap: Snapshot) -> bool:
        if self.offline:
            return True
        if self.cache_max_age_days is None:
            return True
        from datetime import datetime, timezone
        age = datetime.now(timezone.utc) - datetime.fromisoformat(snap.retrieved_at)
        return age.total_seconds() < self.cache_max_age_days * 86400

    def fetch(self, url: str, *, use_cache: bool = True, check_robots: bool = True,
              accept_statuses: tuple[int, ...] = (200,), max_bytes: int | None = None) -> Snapshot:
        if use_cache:
            snap = self.store.latest(url)
            if snap and self._cache_fresh(snap):
                snap.from_cache = True
                return snap
        if self.offline:
            raise FetchError(url, "offline-mode-no-cached-snapshot")
        if check_robots:
            allowed, note = self.robots_allowed(url)
            if not allowed:
                self._log(url=url, outcome="blocked", reason=f"robots.txt disallow ({note})")
                raise AccessBlocked(url, f"robots.txt disallows ({note})")
        host = urlsplit(url).netloc
        last_exc: Exception | None = None
        for attempt in range(self.max_retries + 1):
            self._wait_turn(host)
            try:
                resp = self.session.get(url, timeout=self.timeout, allow_redirects=True, stream=max_bytes is not None)
                if max_bytes is not None:
                    body = resp.raw.read(max_bytes + 1, decode_content=True)
                    if len(body) > max_bytes:
                        raise FetchError(url, f"response exceeds {max_bytes} bytes")
                else:
                    body = resp.content
            except requests.RequestException as exc:
                last_exc = exc
                time.sleep(2 ** attempt)
                continue
            status = resp.status_code
            head = body[:20000].decode("utf-8", errors="ignore").lower()
            challenged = resp.headers.get("cf-mitigated") or any(m in head for m in CHALLENGE_MARKERS[1:4])
            if status in (401, 403, 407, 429) or (challenged and status != 200):
                reason = f"HTTP {status}" + (" (anti-bot challenge)" if challenged else "")
                self._log(url=url, outcome="blocked", status=status, reason=reason)
                raise AccessBlocked(url, reason, status)
            if status >= 500:
                last_exc = FetchError(url, f"HTTP {status}", status)
                time.sleep(2 ** attempt)
                continue
            if status not in accept_statuses:
                self._log(url=url, outcome="error", status=status)
                raise FetchError(url, f"HTTP {status}", status)
            snap = self.store.put(url, resp.url, status, resp.headers.get("content-type", ""), body,
                                  resp.headers.get("last-modified"))
            self._log(url=url, outcome="ok", status=status, sha256=snap.sha256)
            return snap
        reason = f"failed after retries: {last_exc}"
        self._log(url=url, outcome="error", reason=reason)
        if isinstance(last_exc, FetchError):
            raise last_exc
        raise FetchError(url, reason)
