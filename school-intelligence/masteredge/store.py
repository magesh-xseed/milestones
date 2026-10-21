"""Persistence: master records, research queue, history log, versioning, dedupe."""

from __future__ import annotations

import threading
from pathlib import Path
from urllib.parse import urlsplit

import jsonschema

from .config import Paths
from .normalize import normalize_name
from .records import compute_content_hash, make_school_id
from .schema import GROUPS_SCHEMA, MASTER_SCHEMA, QUEUE_SCHEMA
from .util import append_jsonl, atomic_write_json, read_json, utc_now

SCHEMA_VERSION = "1.0"


class SchemaValidationError(Exception):
    pass


def norm_url(url: str | None) -> str | None:
    if not url:
        return None
    p = urlsplit(url.strip())
    host = p.netloc.lower()
    host = host[4:] if host.startswith("www.") else host
    return host + p.path.rstrip("/").lower()


class Store:
    def __init__(self, paths: Paths, run_id: str):
        self.paths = paths
        self.run_id = run_id
        self.lock = threading.RLock()
        master = read_json(paths.schools_master, default=None)
        self.records: dict[str, dict] = {r["school_id"]: r for r in (master or {}).get("schools", [])}
        queue = read_json(paths.research_queue, default=None)
        self.queue: list[dict] = (queue or {}).get("items", [])
        self._saved_hash = {sid: r.get("content_hash") for sid, r in self.records.items()}

    # ------------------------------------------------------------- history
    def log(self, event: str, school_id: str | None = None, **detail) -> None:
        append_jsonl(self.paths.research_history, {"at": utc_now(), "run_id": self.run_id, "event": event,
                                                   "school_id": school_id, **detail})

    # ------------------------------------------------------------- queue / dedupe
    def find_duplicate(self, seed: dict) -> tuple[str | None, str | None]:
        u = norm_url(seed.get("official_website"))
        ez = norm_url(seed.get("ezyschooling_url"))
        key = (normalize_name(seed["name"]), normalize_name(seed.get("campus") or ""), (seed.get("city") or "").lower())
        for item in self.queue:
            s = item["seed"]
            if u and norm_url(s.get("official_website")) == u:
                return item["school_id"], "same official website"
            if ez and norm_url(s.get("ezyschooling_url")) == ez:
                return item["school_id"], "same ezyschooling profile"
            k2 = (normalize_name(s["name"]), normalize_name(s.get("campus") or ""), (s.get("city") or "").lower())
            if k2 == key:
                return item["school_id"], "same name, campus and city"
        return None, None

    def possible_duplicates(self, seed: dict) -> list[str]:
        """Same name + city but different campus: NOT merged, flagged for review."""
        n, c = normalize_name(seed["name"]), (seed.get("city") or "").lower()
        return [i["school_id"] for i in self.queue
                if normalize_name(i["seed"]["name"]) == n and (i["seed"].get("city") or "").lower() == c
                and normalize_name(i["seed"].get("campus") or "") != normalize_name(seed.get("campus") or "")]

    def enqueue(self, seed: dict, origin: dict, priority: float = 0.0) -> tuple[str, bool, str | None]:
        with self.lock:
            dup, reason = self.find_duplicate(seed)
            if dup:
                item = next(i for i in self.queue if i["school_id"] == dup)
                # enrich missing seed attributes from the new observation (never overwrite)
                for k, v in seed.items():
                    if v and not item["seed"].get(k):
                        item["seed"][k] = v
                item.setdefault("also_seen_in", []).append(origin)
                return dup, False, reason
            sid = make_school_id(seed["name"], seed.get("campus"), seed["city"])
            if any(i["school_id"] == sid for i in self.queue):
                raise ValueError(f"school_id collision for distinct identity: {sid}")
            self.queue.append({"school_id": sid, "seed": seed, "origin": origin, "status": "pending", "attempts": 0,
                               "priority": priority, "last_error": None, "updated_at": utc_now(),
                               "possible_duplicates": self.possible_duplicates(seed)})
            return sid, True, None

    def set_status(self, school_id: str, status: str, error: str | None = None) -> None:
        with self.lock:
            for i in self.queue:
                if i["school_id"] == school_id:
                    i["status"] = status
                    i["updated_at"] = utc_now()
                    if status == "in_progress":
                        i["attempts"] += 1
                    i["last_error"] = error
            self.save_queue()

    def save_queue(self) -> None:
        with self.lock:
            obj = {"schema_version": SCHEMA_VERSION, "updated_at": utc_now(), "items": self.queue}
            jsonschema.validate(obj, QUEUE_SCHEMA)
            atomic_write_json(self.paths.research_queue, obj)

    # ------------------------------------------------------------- master
    def finalize_record(self, rec: dict) -> None:
        """Bump version (and archive the previous version) only when content changed."""
        h = compute_content_hash(rec)
        prev_hash = self._saved_hash.get(rec["school_id"])
        if h != prev_hash:
            if prev_hash is not None and rec["school_id"] in self._prev_versions:
                append_jsonl(self.paths.output_dir / "record_versions" / f"{rec['school_id']}.jsonl",
                             self._prev_versions[rec["school_id"]])
            rec["record_version"] = rec.get("record_version", 0) + 1
            rec["updated_at"] = utc_now()
            rec["content_hash"] = h
            self._saved_hash[rec["school_id"]] = h

    @property
    def _prev_versions(self) -> dict:
        if not hasattr(self, "_pv"):
            master = read_json(self.paths.schools_master, default=None) or {}
            self._pv = {r["school_id"]: r for r in master.get("schools", [])}
        return self._pv

    def save_master(self, schools: list[dict]) -> None:
        with self.lock:
            obj = {"schema_version": SCHEMA_VERSION, "generated_at": utc_now(), "run_id": self.run_id,
                   "schools": sorted(schools, key=lambda r: r["school_id"])}
            try:
                jsonschema.validate(obj, MASTER_SCHEMA)
            except jsonschema.ValidationError as exc:
                raise SchemaValidationError(f"schools_master failed schema validation at "
                                            f"{list(exc.absolute_path)}: {exc.message}") from exc
            ids = [r["school_id"] for r in schools]
            if len(ids) != len(set(ids)):
                raise SchemaValidationError("duplicate school_id in master")
            atomic_write_json(self.paths.schools_master, obj)

    def save_groups(self, groups: list[dict]) -> None:
        obj = {"schema_version": SCHEMA_VERSION, "generated_at": utc_now(), "run_id": self.run_id, "groups": groups}
        jsonschema.validate(obj, GROUPS_SCHEMA)
        atomic_write_json(self.paths.school_groups, obj)

    def save_json(self, path: Path, obj) -> None:
        atomic_write_json(path, obj)
