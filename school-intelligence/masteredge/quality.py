"""Data-quality metrics computed from the school records (pipeline view).

The final validator recomputes these independently from the written files.
"""

from __future__ import annotations

from .records import VERIFIED_FIELD_STATUSES


def is_populated(name: str, fact: dict | None) -> bool:
    if not fact:
        return False
    v = fact.get("value")
    if v in (None, [], "", {}):
        return False
    if name == "premium_category" and v == "unclassified":
        return False
    return fact.get("status") != "not_found"


def pct(num: int, den: int) -> float | None:
    return round(100.0 * num / den, 1) if den else None


def compute_metrics(schools: list[dict], field_defs: list[dict]) -> dict:
    req = [f["name"] for f in field_defs if f.get("required")]
    factual = [f["name"] for f in field_defs if f.get("factual")]
    n = len(schools)
    req_total = n * len(req)
    req_pop = sum(1 for s in schools for f in req if is_populated(f, s["fields"].get(f)))
    fact_pop = 0
    fact_with_ev = 0
    fact_official = 0
    for s in schools:
        ev_ok = {e["evidence_id"] for e in s["evidence"] if e.get("source_url") and e["verification_status"] != "unverified"}
        for f in factual:
            fact = s["fields"].get(f)
            if not is_populated(f, fact):
                continue
            fact_pop += 1
            if fact.get("evidence_ids") and all(i in ev_ok for i in fact["evidence_ids"]):
                fact_with_ev += 1
            if fact.get("status") in VERIFIED_FIELD_STATUSES:
                fact_official += 1

    def curriculum_registry(s):
        items = (s["fields"].get("curricula") or {}).get("items") or []
        return any(i["status"] == "official_registry_verified" for i in items)

    def curriculum_official(s):
        items = (s["fields"].get("curricula") or {}).get("items") or []
        return any(i["status"] in VERIFIED_FIELD_STATUSES for i in items)

    def fee_verified(s):
        fee = s["fields"].get("annual_fee") or {}
        return fee.get("status") in VERIFIED_FIELD_STATUSES and bool((fee.get("value") or {}).get("academic_year"))

    def fee_official_any(s):
        fee = s["fields"].get("annual_fee") or {}
        return bool(fee.get("value")) and any(c["best_tier"] in ("official_school_site", "official_registry")
                                             for c in fee.get("candidates") or [])

    def enrollment_verified(s):
        c = s["fields"].get("campus_student_count") or {}
        if c.get("status") not in VERIFIED_FIELD_STATUSES:
            return False
        ev = {e["evidence_id"]: e for e in s["evidence"]}
        return any((ev.get(i) or {}).get("qualifiers", {}).get("reporting_year") for i in c.get("evidence_ids", []))

    checks_total = checks_done = 0
    for s in schools:
        for cid, chk in s["research_checks"].items():
            if chk["status"] in ("not_applicable",):
                continue
            checks_total += 1
            if chk["status"] in ("done", "not_publicly_available"):
                checks_done += 1
    conflicts = sum(1 for s in schools for f, fact in s["fields"].items() if fact.get("status") == "conflict" or fact.get("conflict"))
    return {
        "schools": n,
        "required_field_instances": req_total,
        "required_field_populated": req_pop,
        "field_coverage_pct": pct(req_pop, req_total),
        "factual_field_instances_populated": fact_pop,
        "evidence_coverage_pct": pct(fact_with_ev, fact_pop),
        "official_source_verification_pct": pct(fact_official, fact_pop),
        "curriculum_verification_pct": pct(sum(curriculum_registry(s) for s in schools), n),
        "curriculum_official_site_pct": pct(sum(curriculum_official(s) for s in schools), n),
        "fee_verification_pct": pct(sum(fee_verified(s) for s in schools), n),
        "fee_official_any_pct": pct(sum(fee_official_any(s) for s in schools), n),
        "enrollment_verification_pct": pct(sum(enrollment_verified(s) for s in schools), n),
        "research_completion_pct": pct(checks_done, checks_total),
        "research_checks_total": checks_total,
        "research_checks_completed": checks_done,
        "fields_in_conflict": conflicts,
        "definitions": {
            "curriculum_verification_pct": "schools with >=1 curriculum confirmed by an official registry (live or archived registry page)",
            "curriculum_official_site_pct": "schools with curriculum stated on the school's own official website",
            "fee_verification_pct": "schools whose displayed fee is from an official source AND states the academic year",
            "fee_official_any_pct": "schools with any fee published on the official site (dated or not)",
            "enrollment_verification_pct": "schools with official campus enrollment AND a stated reporting year",
            "research_completion_pct": "mandatory checks completed (done or genuinely not publicly available) / applicable checks; blocked/failed count as incomplete",
        },
    }
