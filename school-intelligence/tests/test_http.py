"""Compliance behaviour of the fetcher: robots.txt, blocks, challenges, offline mode."""

import pytest

from masteredge.http import AccessBlocked, FetchError, Fetcher, SnapshotStore


class FakeResp:
    def __init__(self, status, body=b"", headers=None, url="https://x.test/"):
        self.status_code = status
        self.content = body
        self.text = body.decode()
        self.headers = headers or {"content-type": "text/html"}
        self.url = url


class FakeSession:
    def __init__(self, routes):
        self.routes = routes
        self.calls = []
        self.headers = {}

    def get(self, url, **kw):
        self.calls.append(url)
        return self.routes.get(url, FakeResp(404))


def fetcher(tmp_path, routes, offline=False):
    f = Fetcher(SnapshotStore(tmp_path / "raw"), "TestBot/1.0", per_host_delay=0, max_retries=0, offline=offline)
    sess = FakeSession(routes)
    f._session_local.s = sess
    return f, sess


def test_robots_disallow_blocks_without_fetching(tmp_path):
    f, sess = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(200, b"User-agent: *\nDisallow: /private/")})
    with pytest.raises(AccessBlocked):
        f.fetch("https://x.test/private/page")
    assert "https://x.test/private/page" not in sess.calls


def test_403_is_blocked_not_retried(tmp_path):
    f, sess = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(404), "https://x.test/a": FakeResp(403)})
    with pytest.raises(AccessBlocked):
        f.fetch("https://x.test/a")
    assert sess.calls.count("https://x.test/a") == 1


def test_cloudflare_challenge_detected(tmp_path):
    f, _ = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(404),
                              "https://x.test/a": FakeResp(503, b"<html>challenge-platform</html>", {"cf-mitigated": "challenge"})})
    with pytest.raises(AccessBlocked):
        f.fetch("https://x.test/a")


def test_robots_5xx_fails_closed(tmp_path):
    f, sess = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(503)})
    with pytest.raises(AccessBlocked):
        f.fetch("https://x.test/a")
    assert "https://x.test/a" not in sess.calls


def test_unavailable_site(tmp_path):
    f, _ = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(404), "https://x.test/a": FakeResp(404)})
    with pytest.raises(FetchError):
        f.fetch("https://x.test/a")


def test_snapshot_stored_and_reused(tmp_path):
    f, sess = fetcher(tmp_path, {"https://x.test/robots.txt": FakeResp(404), "https://x.test/a": FakeResp(200, b"<p>hello</p>")})
    s1 = f.fetch("https://x.test/a")
    s2 = f.fetch("https://x.test/a")
    assert s1.sha256 == s2.sha256 and s2.from_cache
    assert sess.calls.count("https://x.test/a") == 1
    assert s1.read_text(f.store.raw_dir) == "<p>hello</p>"


def test_offline_without_snapshot_fails(tmp_path):
    f, _ = fetcher(tmp_path, {}, offline=True)
    with pytest.raises(FetchError):
        f.fetch("https://x.test/never")


def test_invalid_pdf_yields_no_facts(tmp_path):
    from masteredge.extract import extract_all
    from masteredge.textify import snapshot_to_document
    try:
        d = snapshot_to_document(b"%PDF-1.4 garbage", "https://x.test/f.pdf", "application/pdf")
    except Exception:
        return  # raising is acceptable: the crawler catches and logs it (see integration test)
    assert extract_all(d, True) == []
