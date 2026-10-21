"""Resolution, conflicts, regression guard, dedupe, premium rules and scoring."""

import json

import pytest

from masteredge import analysis as A
from masteredge.config import Paths, load_config
from masteredge.records import (apply_retractions, make_evidence, make_school_id, new_school_record, resolve_fields,
                                resolve_list, resolve_scalar)
from masteredge.store import Store

SID = "IN-test-school-pune-abcdef"


def ev(field, value, tier="official_school_site", conf=0.8, url="https://s.in/a", raw="x", q=None, excerpt=None):
    return make_evidence(SID, field, raw, value, source_url=url, source_title="t", source_type=tier, source_id="t",
                         publication_date=None, retrieved_at="2026-10-20T00:00:00+00:00", evidence_excerpt=excerpt or f"{raw} {value}",
                         confidence=conf, extraction_method="test", snapshot_sha256="0" * 64, qualifiers=q or {})


def test_tier_precedence_and_conflict_kept():
    res = resolve_scalar("founding_year", [ev("founding_year", 1999, "third_party", url="https://tp"), ev("founding_year", 1998)])
    assert res["value"] == 1998 and res["status"] == "conflict"
    assert {v["value"] for v in res["conflict"]["values"]} == {1998, 1999}


def test_agreement_is_not_conflict():
    res = resolve_scalar("founding_year", [ev("founding_year", 1998, "third_party", url="https://tp"), ev("founding_year", 1998)])
    assert res["status"] == "official_source" and res["conflict"] is None and len(res["evidence_ids"]) == 2


def test_conflicting_student_counts():
    q = {"scope": "campus"}
    res = resolve_scalar("campus_student_count", [ev("campus_student_count", 1800, q=q), ev("campus_student_count", 2100, url="https://s.in/b", q=q)])
    assert res["status"] == "conflict"


def test_group_enrollment_never_used_as_campus():
    res = resolve_scalar("campus_student_count", [ev("campus_student_count", 25000, q={"scope": "group"}),
                                                  ev("campus_student_count", 900, q={"scope": "unspecified"})])
    assert res["value"] is None and res["status"] == "not_found"


def test_low_confidence_not_promoted():
    assert resolve_scalar("founding_year", [ev("founding_year", 1990, conf=0.45)])["value"] is None


def test_curricula_union_and_third_party_flag():
    res = resolve_list("curricula", [ev("curricula", {"code": "CBSE", "family": "CBSE"}),
                                     ev("curricula", {"code": "CAMBRIDGE_IGCSE", "family": "CAMBRIDGE"}, "third_party", url="https://tp")])
    assert {i["value"]["code"] for i in res["items"]} == {"CBSE", "CAMBRIDGE_IGCSE"}
    assert res["conflict"] is not None  # third-party-only curriculum flagged


def _rec_with(evs):
    rec = new_school_record(SID, {"name": "Test", "city": "Pune"}, {"type": "test"})
    rec["evidence"] = evs
    return rec


def test_verified_value_not_silently_replaced():
    e1 = ev("founding_year", 1998)
    rec = _rec_with([e1])
    resolve_fields(rec, ["founding_year"])
    assert rec["fields"]["founding_year"]["status"] == "official_source"
    e1["superseded"] = True                        # source no longer states it
    rec["evidence"].append(ev("founding_year", 2001, "third_party", url="https://tp"))
    resolve_fields(rec, ["founding_year"])
    f = rec["fields"]["founding_year"]
    assert f["status"] == "needs_review" and f["value"] == 1998 and f["regression_warning"]["previous_value"] == 1998


def test_retraction_is_the_only_way_to_drop_verified_value():
    e1 = ev("founding_year", 1998)
    rec = _rec_with([e1])
    resolve_fields(rec, ["founding_year"])
    e1["superseded"] = True
    resolve_fields(rec, ["founding_year"])
    assert rec["fields"]["founding_year"]["status"] == "needs_review"
    apply_retractions(rec, {e1["evidence_id"]: {"reason": "audit mismatch"}})
    resolve_fields(rec, ["founding_year"])
    assert rec["fields"]["founding_year"]["value"] is None
    assert any(e.get("retracted") for e in rec["evidence"])  # evidence kept, not deleted


def test_school_id_stable():
    a = make_school_id("Oakridge International School", "Gachibowli", "Hyderabad")
    assert a == make_school_id("Oakridge International School", "Gachibowli", "Hyderabad")
    assert a != make_school_id("Oakridge International School", "Bachupally", "Hyderabad")


def test_dedupe_and_possible_duplicates(tmp_path):
    paths = Paths.from_root(tmp_path)
    paths.output_dir.mkdir(parents=True)
    st = Store(paths, "run-test")
    s1 = {"name": "Oakridge International School", "campus": "Gachibowli", "city": "Hyderabad", "official_website": "https://www.oakridge.in/gachibowli/"}
    sid, new, _ = st.enqueue(dict(s1), {"type": "seed"})
    assert new
    _, new2, reason = st.enqueue({"name": "Oakridge Intl", "campus": "X", "city": "Hyderabad", "official_website": "https://oakridge.in/gachibowli"}, {"type": "d"})
    assert not new2 and reason == "same official website"
    _, new3, reason3 = st.enqueue({"name": "Oakridge International School", "campus": "Gachibowli", "city": "Hyderabad"}, {"type": "d"})
    assert not new3 and reason3 == "same name, campus and city"
    sid4, new4, _ = st.enqueue({"name": "Oakridge International School", "campus": "Bachupally", "city": "Hyderabad"}, {"type": "d"})
    assert new4 and sid4 != sid
    assert sid in next(i for i in st.queue if i["school_id"] == sid4)["possible_duplicates"]


def test_similar_names_different_domains_not_grouped():
    def r(sid, url):
        rec = new_school_record(sid, {"name": "Delhi Public School", "city": "X"}, {})
        rec["official_website_url"] = url
        rec["research_checks"]["official_website_identity"] = {"status": "done"}
        return rec
    recs = [r("IN-a-000001", "https://dpsrkp.net/"), r("IN-b-000002", "https://dpsbangalore.edu.in/")]
    assert A.build_groups(recs) == []
    recs2 = [r("IN-c-000003", "https://www.oakridge.in/gachibowli/"), r("IN-d-000004", "https://oakridge.in/bachupally/")]
    g = A.build_groups(recs2)
    assert len(g) == 1 and g[0]["campuses_in_dataset"] == 2 and g[0]["basis"] == "shared_official_domain"


@pytest.fixture()
def cfg():
    return load_config()


def _fee_rec(cands, status="official_source"):
    rec = new_school_record(SID, {"name": "T", "city": "Pune"}, {})
    best = cands[0]
    rec["fields"]["annual_fee"] = {"value": best["value"], "status": status, "evidence_ids": ["ev-x"], "candidates": cands}
    return rec


def test_premium_thresholds(cfg):
    rec = _fee_rec([{"value": {"min": 400000, "max": 900000, "period": "annual"}, "best_tier": "official_school_site", "source_urls": []}])
    pc = A.classify_premium(rec, cfg.premium_rules)
    assert pc["value"] == "ultra_premium" and not pc["provisional"]


def test_premium_third_party_is_provisional(cfg):
    rec = _fee_rec([{"value": {"min": 400000, "max": 400000, "period": "annual"}, "best_tier": "third_party", "source_urls": []}],
                   status="third_party_only")
    pc = A.classify_premium(rec, cfg.premium_rules)
    assert pc["value"] == "premium" and pc["provisional"]


def test_premium_category_conflict(cfg):
    rec = _fee_rec([{"value": {"min": 360000, "max": 1050000, "period": "unspecified"}, "best_tier": "official_school_site", "source_urls": []},
                    {"value": {"min": 360000, "max": 360000, "period": "annual"}, "best_tier": "third_party", "source_urls": []}],
                   status="conflict")
    pc = A.classify_premium(rec, cfg.premium_rules)
    assert pc["value"] == "ultra_premium" and pc["conflict"] and pc["status"] == "conflict"


def test_unclassified_without_fee(cfg):
    rec = new_school_record(SID, {"name": "T", "city": "Pune"}, {})
    assert A.classify_premium(rec, cfg.premium_rules)["value"] == "unclassified"


def test_fit_score_transparent_and_no_sales_inference(cfg):
    rec = _fee_rec([{"value": {"min": 400000, "max": 900000, "period": "annual"}, "best_tier": "official_school_site", "source_urls": []}])
    rec["fields"]["curricula"] = {"value": [{"code": "CBSE", "family": "CBSE"}], "status": "official_source", "evidence_ids": ["e"],
                                  "items": [{"value": {"code": "CBSE", "family": "CBSE"}, "status": "official_source", "best_tier": "official_school_site", "evidence_ids": ["e"]}]}
    rec["fields"]["grades_offered"] = {"value": {"grade_min": -2, "grade_max": 12}, "status": "official_source", "evidence_ids": ["e"]}
    rec["analysis"]["premium_category"] = A.classify_premium(rec, cfg.premium_rules)
    fit = A.fit_assessment(rec, cfg.research, None)
    w = cfg.research["scoring_weights"]
    assert fit["score"] == round(sum(fit["components"][k]["score"] * w[k] for k in w), 1)
    assert fit["components"]["confirmed_sales_readiness"]["score"] == 0
    assert fit["components"]["student_reach"]["score"] == 0  # no enrollment -> not estimated
    assert "ANALYSIS" in fit["label"]
    assert fit["score"] == 30 + 25 + 15  # CBSE 1.0, ultra 1.0, grades 1-10 fully covered


def test_config_validation_rejects_bad_weights(tmp_path):
    import shutil
    from masteredge.config import ConfigError
    from tests.conftest import REPO
    root = tmp_path / "p"
    shutil.copytree(REPO / "config", root / "config")
    rc = json.loads((root / "config" / "research_config.json").read_text())
    rc["scoring_weights"]["premium_positioning"] = 40
    (root / "config" / "research_config.json").write_text(json.dumps(rc))
    with pytest.raises(ConfigError):
        load_config(root)


def test_dropped_verified_list_item_is_recorded():
    e1 = ev("curricula", {"code": "IB_PYP", "family": "IB"})
    e2 = ev("curricula", {"code": "IB_DP", "family": "IB"}, url="https://s.in/b")
    rec = _rec_with([e1, e2])
    resolve_fields(rec, ["curricula"])
    e1["superseded"] = True
    resolve_fields(rec, ["curricula"])
    f = rec["fields"]["curricula"]
    assert [i["value"]["code"] for i in f["items"]] == ["IB_DP"]
    assert f["dropped_items"][0]["value"]["code"] == "IB_PYP"
    rec["data_gaps"] = A.data_gaps(rec, [])
    assert any(g["gap_type"] == "item_no_longer_supported" for g in rec["data_gaps"])
