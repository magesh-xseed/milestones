"""Curriculum history events from dated archive observations."""

from masteredge.history import _events_for_page
from masteredge.http import Snapshot
from masteredge.textify import Document


def obs(ts, text):
    snap = Snapshot(url=f"https://web.archive.org/web/{ts}id_/https://s.in/", final_url=f"https://web.archive.org/web/{ts}id_/https://s.in/",
                    status=200, content_type="text/html", sha256="0" * 64, retrieved_at="2026-10-20T00:00:00+00:00", raw_path="x")
    doc = Document(url=snap.url, title="Home", text=text)
    from masteredge.extract import extract_curricula
    codes = {}
    for ex in extract_curricula(doc):
        s = text.find(ex.raw_value)
        codes.setdefault(ex.normalized_value["code"], (ex.normalized_value["family"], s, s + len(ex.raw_value)))
    return {"ts": ts, "date": f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}", "snap": snap, "doc": doc, "codes": codes, "page": "https://s.in/"}


FILLER = " Welcome to our school community with sports, arts and a large library." * 10


def test_first_observed_bounded_and_dropped():
    o = [obs("20150101000000", "We follow the CBSE curriculum." + FILLER),
         obs("20180101000000", "We follow the CBSE curriculum and the IB Diploma Programme (IBDP)." + FILLER),
         obs("20220101000000", "We now offer the IB Diploma Programme (IBDP) only." + FILLER)]
    ev = _events_for_page("IN-s-000000", o)
    got = {(e["normalized_value"]["event_type"], e["normalized_value"]["code"], e["normalized_value"]["date"]) for e in ev}
    assert ("archive_first_observed", "CBSE", "2015-01-01") in got
    assert ("archive_first_observed", "IB_DP", "2018-01-01") in got
    assert ("archive_not_yet_observed", "IB_DP", "2015-01-01") in got
    assert ("archive_no_longer_observed", "CBSE", "2022-01-01") in got
    for e in ev:
        assert e["publication_date"]                      # every event carries dated evidence
        assert e["source_type"] == "archive"
        assert e["verification_status"] == "archive_source"
        if e["normalized_value"]["event_type"] == "archive_first_observed":
            assert "not an adoption date" in e["qualifiers"]["caveat"]


def test_no_snapshots_no_events():
    assert _events_for_page("IN-s-000000", []) == []


def test_no_longer_observed_suppressed_when_live_site_still_states_it():
    o = [obs("20150101000000", "We follow the CBSE curriculum." + FILLER),
         obs("20220101000000", "Welcome to our new website." + FILLER)]
    ev = _events_for_page("IN-s-000000", o, current_codes={"CBSE"})
    assert not any(e["normalized_value"]["event_type"] == "archive_no_longer_observed" for e in ev)


def test_archive_candidate_mention_not_observed_as_offering():
    o = [obs("20210101000000", "Knowledgeum Academy is a candidate school for the IB Diploma Programme (IBDP candidate)." + FILLER)]
    codes = {e["normalized_value"]["code"] for e in _events_for_page("IN-s-000000", o)}
    assert "IB_DP" not in codes
