"""Derived analysis: premium category, MASTEREDGE fit, groups, data gaps.

Everything here is ANALYSIS, computed only from resolved facts and configuration.
No purchasing intent, budget or conversion probability is ever produced.
"""

from __future__ import annotations

from .normalize import curriculum_family, grade_label
from .records import FIELD_STATUS_BY_TIER, VERIFIED_FIELD_STATUSES, display_value

ANALYSIS_LABEL = "ANALYSIS - derived from evidenced facts and configurable rules; not a fact or a purchase prediction"


# ---------------------------------------------------------------- premium

def _category_for(max_fee: int, rules: dict) -> dict:
    for c in rules["categories"]:
        if max_fee >= c["min_annual_fee_max"]:
            return c
    return rules["categories"][-1]


def classify_premium(record: dict, rules: dict) -> dict:
    fee = record["fields"].get("annual_fee") or {}
    if not fee.get("value"):
        return {"value": rules["unclassified_id"], "label": "Unclassified (no fee evidence)", "status": "analysis",
                "basis": None, "provisional": True, "conflict": None, "evidence_ids": []}
    best = fee["value"]
    cat = _category_for(best["max"], rules)
    cands = fee.get("candidates") or []
    cand_cats = sorted({_category_for(c["value"]["max"], rules)["id"] for c in cands})
    conflict = None
    if rules.get("conflict_if_sources_disagree_on_category") and len(cand_cats) > 1:
        conflict = {"summary": "fee sources imply different categories", "categories": cand_cats,
                    "values": [{"max": c["value"]["max"], "tier": c["best_tier"], "sources": c["source_urls"]} for c in cands]}
    provisional = fee["status"] == "third_party_only" or (best.get("period") != "annual")
    reasons = []
    if fee["status"] == "third_party_only":
        reasons.append("fee from third-party source only")
    if best.get("period") != "annual":
        reasons.append("source does not state the fee period")
    return {
        "value": cat["id"], "label": cat["label"], "status": "conflict" if conflict else "analysis",
        "basis": {"max_annual_fee_inr": best["max"], "threshold_inr": cat["min_annual_fee_max"],
                  "fee_status": fee["status"], "fee_display": display_value("annual_fee", fee)},
        "provisional": provisional, "provisional_reasons": reasons, "conflict": conflict,
        "evidence_ids": fee.get("evidence_ids", []),
    }


# ---------------------------------------------------------------- fit score

def _verified_items(fact: dict | None, allow_third_party: bool = True) -> list[dict]:
    if not fact:
        return []
    items = fact.get("items") or []
    ok = set(VERIFIED_FIELD_STATUSES) | ({"third_party_only"} if allow_third_party else set())
    return [i for i in items if i["status"] in ok]


def fit_assessment(record: dict, cfg_research: dict, group: dict | None) -> dict:
    prof = cfg_research["masteredge_profile"]
    w = cfg_research["scoring_weights"]
    f = record["fields"]
    comps = {}

    # Curriculum compatibility ------------------------------------------------
    items = _verified_items(f.get("curricula"))
    fams = {}
    for i in items:
        fam = curriculum_family(i["value"]["code"])
        if fam in prof["curriculum_compatibility"]:
            fams[fam] = max(fams.get(fam, 0), 1.0 if i["status"] in VERIFIED_FIELD_STATUSES else 0.5)
    if fams:
        best_fam = max(fams, key=lambda k: prof["curriculum_compatibility"][k] * fams[k])
        s = prof["curriculum_compatibility"][best_fam] * fams[best_fam]
        comps["curriculum_compatibility"] = {
            "score": s, "explanation": f"best compatible curriculum {best_fam} (configured compatibility "
                                       f"{prof['curriculum_compatibility'][best_fam]}) x evidence factor {fams[best_fam]} "
                                       f"(1.0 official, 0.5 third-party only)",
            "supporting_facts": [f"curricula: {display_value('curricula', f.get('curricula'))}"],
            "missing_evidence": [] if fams[best_fam] == 1.0 else ["official confirmation of curriculum"]}
    else:
        comps["curriculum_compatibility"] = {"score": 0.0, "explanation": "no evidenced curriculum", "supporting_facts": [],
                                             "missing_evidence": ["curriculum"]}

    # Premium positioning ------------------------------------------------------
    pc = record["analysis"].get("premium_category") or {}
    pmap = {"ultra_premium": 1.0, "premium": 0.75, "upper_mid": 0.4, "not_premium_by_fee": 0.1}
    ps = pmap.get(pc.get("value"), 0.0)
    if pc.get("provisional"):
        ps *= 0.8
    comps["premium_positioning"] = {
        "score": ps, "explanation": f"category {pc.get('value')} -> {pmap.get(pc.get('value'), 0.0)}"
                                    + (" x 0.8 provisional" if pc.get("provisional") else ""),
        "supporting_facts": [f"fee: {(pc.get('basis') or {}).get('fee_display')}"] if pc.get("basis") else [],
        "missing_evidence": [] if pc.get("basis") else ["published fee"]}

    # Student reach --------------------------------------------------------------
    cnt = f.get("campus_student_count") or {}
    n = cnt.get("value")
    if n:
        s = next((b["score"] for b in cfg_research["student_reach_bands"] if n >= b["min"]), 0.0)
        comps["student_reach"] = {"score": s, "explanation": f"campus students {n} -> band score {s}",
                                  "supporting_facts": [f"campus_student_count: {n} ({cnt.get('status')})"], "missing_evidence": []}
    else:
        comps["student_reach"] = {"score": 0.0, "explanation": "campus enrollment not published in checked sources; scored 0 (not estimated)",
                                  "supporting_facts": [], "missing_evidence": ["campus student count"]}

    # Academic alignment -----------------------------------------------------------
    g = f.get("grades_offered") or {}
    if g.get("value"):
        lo, hi = g["value"]["grade_min"], g["value"]["grade_max"]
        tlo, thi = prof["target_grade_min"], prof["target_grade_max"]
        overlap = max(0, min(hi, thi) - max(lo, tlo) + 1)
        s = overlap / (thi - tlo + 1)
        comps["academic_alignment"] = {"score": round(s, 3),
                                       "explanation": f"grade overlap {overlap}/{thi - tlo + 1} with target grades {tlo}-{thi}",
                                       "supporting_facts": [f"grades: {display_value('grades_offered', g)}"], "missing_evidence": []}
    else:
        comps["academic_alignment"] = {"score": 0.0, "explanation": "grades offered unknown", "supporting_facts": [],
                                       "missing_evidence": ["grades offered"]}

    # Group expansion -----------------------------------------------------------------
    if group and group.get("campuses_in_dataset", 0) >= 2:
        k = group["campuses_in_dataset"]
        s = min(1.0, 0.4 + 0.15 * k)
        comps["group_expansion_potential"] = {"score": s, "explanation": f"{k} campuses of the same group in dataset (basis: {group['basis']})",
                                              "supporting_facts": [f"group {group['group_id']}"], "missing_evidence": []}
    else:
        comps["group_expansion_potential"] = {"score": 0.0, "explanation": "no evidenced multi-campus group in dataset",
                                              "supporting_facts": [], "missing_evidence": ["group membership evidence"]}

    # Sales readiness -------------------------------------------------------------------
    comps["confirmed_sales_readiness"] = {"score": 0.0, "explanation": "no confirmed sales-readiness signal collected (none inferred)",
                                          "supporting_facts": [], "missing_evidence": ["confirmed buying signal (e.g. tender, RFP, stated initiative)"]}

    total = sum(comps[k]["score"] * w[k] for k in w)
    available = sum(w[k] for k in w if not comps[k]["missing_evidence"])
    return {
        "label": ANALYSIS_LABEL,
        "score": round(total, 1),
        "max_score": 100,
        "weights": w,
        "components": comps,
        "evidence_completeness_pct": round(100 * available / sum(w.values()), 1),
    }


def recommendations(record: dict, cfg_research: dict, fit: dict) -> dict:
    prof = cfg_research["masteredge_profile"]
    f = record["fields"]
    g = (f.get("grades_offered") or {}).get("value")
    rec_grades = None
    if g:
        lo, hi = max(g["grade_min"], prof["target_grade_min"]), min(g["grade_max"], prof["target_grade_max"])
        rec_grades = f"{grade_label(lo)} – {grade_label(hi)}" if lo <= hi else None
    curr = sorted({curriculum_family(i["value"]["code"]) for i in _verified_items(f.get("curricula"))})
    n_fam = len(curr)
    complexity = "unknown" if not curr else ("high" if n_fam >= 3 else ("medium" if n_fam == 2 else "low"))
    roles = (f.get("decision_maker_roles") or {}).get("value") or []
    default_roles = ["Principal / Head of School", "Academic Director / Head of Academics", "Curriculum or IB Coordinator"]
    pc = record["analysis"].get("premium_category") or {}
    angle_bits = []
    if "IB" in curr and ("CBSE" in curr or "CISCE" in curr):
        angle_bits.append("multi-board school (IB + Indian board): position MASTEREDGE as a common mastery layer across boards")
    elif "IB" in curr or "CAMBRIDGE" in curr:
        angle_bits.append("international curriculum: emphasise conceptual mastery aligned to inquiry-based programmes")
    elif curr:
        angle_bits.append(f"{'/'.join(curr)} school: emphasise board-aligned mastery and outcomes")
    if pc.get("value") in ("ultra_premium", "premium"):
        angle_bits.append("premium positioning: lead with differentiated learning outcomes and parent-visible progress")
    if (f.get("teaching_methodology") or {}).get("value"):
        angle_bits.append("stated pedagogy: " + ", ".join((f["teaching_methodology"]["value"])[:3]))
    return {
        "label": ANALYSIS_LABEL,
        "recommended_grades": rec_grades,
        "recommended_subjects": prof["target_subjects"],
        "implementation_complexity": complexity,
        "implementation_complexity_basis": f"{n_fam} curriculum families evidenced: {', '.join(curr) or 'none'}",
        "decision_maker_roles_evidenced": roles,
        "decision_maker_roles_suggested": default_roles,
        "pitch_angle": "; ".join(angle_bits) or "insufficient evidence for a tailored angle",
        "note": "Roles 'suggested' are generic targets, not evidence that these people exist at the school.",
    }


# ---------------------------------------------------------------- groups

def build_groups(records: list[dict]) -> list[dict]:
    """Group campuses that share an official registrable domain. No name-similarity grouping."""
    from .adapters.base import registrable_host

    by_domain: dict[str, list[dict]] = {}
    for r in records:
        url = r.get("official_website_url")
        ident_ok = (r["research_checks"].get("official_website_identity") or {}).get("status") == "done"
        if url and ident_ok:
            by_domain.setdefault(registrable_host(url), []).append(r)
    groups = []
    for domain, members in sorted(by_domain.items()):
        if len(members) < 2:
            for m in members:
                m["group_id"] = None
            continue
        gid = "GRP-" + domain.replace(".", "-")
        parents = {}
        for m in members:
            po = m["fields"].get("parent_organization") or {}
            if po.get("value"):
                parents.setdefault(po["value"], []).extend(po.get("evidence_ids", []))
        group_students = []
        for m in members:
            gs = m["fields"].get("group_student_count") or {}
            if gs.get("value"):
                group_students.append({"value": gs["value"], "school_id": m["school_id"], "evidence_ids": gs["evidence_ids"],
                                       "status": gs["status"]})
        stated_campuses = []
        for m in members:
            nc = m["fields"].get("number_of_campuses") or {}
            if nc.get("value"):
                stated_campuses.append({"value": nc["value"], "school_id": m["school_id"], "evidence_ids": nc["evidence_ids"]})
        groups.append({
            "group_id": gid,
            "brand_domain": domain,
            "basis": "shared_official_domain",
            "basis_evidence": [{"school_id": m["school_id"], "official_website": m["official_website_url"]} for m in members],
            "member_school_ids": [m["school_id"] for m in members],
            "campuses_in_dataset": len(members),
            "parent_organization_candidates": [{"name": k, "evidence_ids": v} for k, v in parents.items()],
            "stated_number_of_campuses": stated_campuses,
            "group_student_count_candidates": group_students,
            "note": "Grouping is based only on a shared official website domain. Similar names are never grouped.",
        })
        for m in members:
            m["group_id"] = gid
    return groups


# ---------------------------------------------------------------- data gaps

def data_gaps(record: dict, field_defs: list[dict]) -> list[dict]:
    gaps = []
    for fd in field_defs:
        name = fd["name"]
        if not fd.get("factual"):
            continue
        fact = record["fields"].get(name) or {}
        st = fact.get("status", "not_found")
        if st in ("not_found",):
            if fd.get("required"):
                gaps.append({"field": name, "gap_type": "missing", "detail": "not published in checked sources",
                             "weak_evidence_count": len(fact.get("weak_evidence_ids", []))})
        elif st == "conflict" or fact.get("conflict"):
            gaps.append({"field": name, "gap_type": "conflict", "detail": (fact.get("conflict") or {}).get("summary"),
                         "values": (fact.get("conflict") or {}).get("values")})
        elif st in ("third_party_only", "archive_only"):
            gaps.append({"field": name, "gap_type": "unverified_official", "detail": f"only {st.replace('_only', '')} evidence"})
        elif st == "needs_review":
            gaps.append({"field": name, "gap_type": "regression", "detail": fact.get("regression_warning", {}).get("note")})
    for name, fact in record["fields"].items():
        for d in fact.get("dropped_items") or []:
            gaps.append({"field": name, "gap_type": "item_no_longer_supported",
                         "detail": f"previously {d['status']} item {d['value']} is no longer supported by current evidence (kept in history)"})
    fee = (record["fields"].get("annual_fee") or {}).get("value")
    if fee and not fee.get("academic_year"):
        gaps.append({"field": "annual_fee", "gap_type": "undated", "detail": "fee source does not state the academic year"})
    if fee and fee.get("period") != "annual":
        gaps.append({"field": "annual_fee", "gap_type": "ambiguous", "detail": "fee source does not state that the amount is annual"})
    cnt = record["fields"].get("campus_student_count") or {}
    if cnt.get("value"):
        ev = {e["evidence_id"]: e for e in record["evidence"]}
        if not any((ev.get(i) or {}).get("qualifiers", {}).get("reporting_year") for i in cnt.get("evidence_ids", [])):
            gaps.append({"field": "campus_student_count", "gap_type": "undated", "detail": "enrollment reporting year not stated"})
    # Consistency rule: an unverified ratio "N:1" equal to the official average class size N is
    # a common aggregator mislabel; flag it rather than present it as a ratio.
    ratio = record["fields"].get("student_teacher_ratio") or {}
    acs = record["fields"].get("average_class_size") or {}
    if ratio.get("status") == "third_party_only" and acs.get("status") in VERIFIED_FIELD_STATUSES and acs.get("value"):
        try:
            if int(str(ratio["value"]).split(":")[0]) == int(acs["value"]):
                gaps.append({"field": "student_teacher_ratio", "gap_type": "doubtful",
                             "detail": f"third-party ratio {ratio['value']} equals the official average class size {acs['value']}; likely mislabelled"})
        except (ValueError, TypeError):
            pass
    pc = record["analysis"].get("premium_category") or {}
    if pc.get("conflict"):
        gaps.append({"field": "premium_category", "gap_type": "conflict", "detail": pc["conflict"]["summary"],
                     "values": pc["conflict"].get("values")})
    for cid, chk in record["research_checks"].items():
        if chk.get("status") in ("blocked", "failed"):
            gaps.append({"field": f"check:{cid}", "gap_type": chk["status"], "detail": chk.get("detail")})
    return gaps


__all__ = ["classify_premium", "fit_assessment", "recommendations", "build_groups", "data_gaps", "ANALYSIS_LABEL",
           "FIELD_STATUS_BY_TIER"]
