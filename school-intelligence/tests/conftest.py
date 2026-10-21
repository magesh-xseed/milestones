"""Shared fixtures: a local HTTP server for the fixture site and a throwaway project root."""

from __future__ import annotations

import functools
import http.server
import json
import shutil
import socket
import threading
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parent.parent
FIXTURES = Path(__file__).resolve().parent / "fixtures"


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture()
def site(tmp_path):
    """Serve a private copy of tests/fixtures/site; yields (base_url, site_dir)."""
    site_dir = tmp_path / "site"
    shutil.copytree(FIXTURES / "site", site_dir)
    port = _free_port()
    base = f"http://127.0.0.1:{port}/"
    prof = site_dir / "ezy" / "school" / "greenfield-pune" / "index.html"
    prof.write_text(prof.read_text(encoding="utf-8").replace("OFFICIAL_URL", base), encoding="utf-8")
    handler = functools.partial(_QuietHandler, directory=str(site_dir))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    yield base, site_dir
    srv.shutdown()
    srv.server_close()


def make_project(tmp_path: Path, seeds: list[dict], *, slices_override: dict | None = None) -> Path:
    """Copy config into a temp project root with test-friendly settings and the given seeds."""
    root = tmp_path / "project"
    shutil.copytree(REPO / "config", root / "config")
    (root / "data" / "input").mkdir(parents=True)
    (root / "data" / "input" / "schools.json").write_text(json.dumps({"schools": seeds}), encoding="utf-8")
    rc = json.loads((root / "config" / "research_config.json").read_text())
    rc["http"].update({"per_host_delay_seconds": 0, "timeout_seconds": 5, "max_retries": 0, "workers": 2})
    rc["audit"]["sample_size"] = 5
    if slices_override:
        for k, v in slices_override.items():
            rc["slices"][k].update(v)
    (root / "config" / "research_config.json").write_text(json.dumps(rc), encoding="utf-8")
    src = json.loads((root / "config" / "sources.json").read_text())
    for s in src["sources"]:
        if s["id"] not in ("official_site", "ezyschooling"):
            s["enabled"] = False  # tests never touch real third-party services
        elif s["id"] == "ezyschooling":
            s["probe_url"] = None
            s["url"] = None  # never probe the real service from tests
    (root / "config" / "sources.json").write_text(json.dumps(src), encoding="utf-8")
    return root


def greenfield_seed(base: str, with_profile: bool = False) -> dict:
    seed = {"name": "Greenfield International School", "campus": "Baner", "city": "Pune", "state": "Maharashtra",
            "official_website": base}
    if with_profile:
        seed["ezyschooling_url"] = base + "ezy/school/greenfield-pune/"
    return seed
