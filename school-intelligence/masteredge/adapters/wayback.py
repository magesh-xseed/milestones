"""Wayback Machine adapter: CDX listing and raw ('id_') snapshot retrieval."""

from __future__ import annotations

import json
from datetime import datetime

from ..http import AccessBlocked, FetchError
from .base import Context

CDX = "https://web.archive.org/cdx/search/cdx"


def cdx_snapshots(ctx: Context, url: str, from_year: int | None = None, match_prefix: bool = False,
                  collapse_year: bool = True) -> list[dict]:
    from urllib.parse import urlencode

    params = {"url": url, "output": "json", "fl": "timestamp,original,statuscode,mimetype",
              "filter": "statuscode:200"}
    if collapse_year:
        params["collapse"] = "timestamp:4"
    if from_year:
        params["from"] = str(from_year)
    if match_prefix:
        params["matchType"] = "prefix"
    q = CDX + "?" + urlencode(params)
    snap = ctx.fetcher.fetch(q, check_robots=True)
    try:
        rows = json.loads(snap.read_text(ctx.fetcher.store.raw_dir) or "[]")
    except ValueError:
        return []
    if not rows:
        return []
    header, body = rows[0], rows[1:]
    out = [dict(zip(header, r)) for r in body]
    return [r for r in out if "html" in r.get("mimetype", "html")]


def pick_evenly(rows: list[dict], n: int) -> list[dict]:
    if len(rows) <= n:
        return rows
    if n <= 1:
        return [rows[-1]]
    idx = sorted({round(i * (len(rows) - 1) / (n - 1)) for i in range(n)})
    return [rows[i] for i in idx]


def archive_url(ts: str, original: str) -> str:
    return f"https://web.archive.org/web/{ts}id_/{original}"


def ts_to_date(ts: str) -> str:
    return datetime.strptime(ts[:8], "%Y%m%d").date().isoformat()


def fetch_snapshot(ctx: Context, ts: str, original: str):
    try:
        return ctx.fetcher.fetch(archive_url(ts, original))
    except (AccessBlocked, FetchError):
        return None
