"""School records, evidence records and field resolution.

Resolution rules (documented, deterministic):
* Each field collects candidate values from evidence records.
* Candidates are compared by a field-specific key. Identical values from several
  sources reinforce each other.
* The displayed value comes from the highest-tier source (registry > official site
  > archive > third party), then highest confidence.
* If any two candidates disagree, the field status becomes "conflict" and every
  candidate is kept and listed. Conflicts are never resolved silently.
* Values below a minimum confidence are kept as evidence but not promoted.
* List-valued fields (curricula, subjects, roles, ...) are unions of items; each
  item carries its own best status.
"""

from __future__ import annotations

import hashlib
from typing import Any

from .normalize import curriculum_family, grade_label
from .util import slugify
from .util import canonical_json, sha256_text, utc_now

TIER_RANK = {"official_registry": 0, "official_school_site": 1, "archive": 2, "third_party": 3}
EVIDENCE_STATUS_BY_TIER = {
    "official_registry": "official_registry_verified",
    "official_school_site": "official_source",
    "archive": "archive_source",
    "third_party": "third_party_source",
}
FIELD_STATUS_BY_TIER = {
    "official_registry": "official_registry_verified",
    "official_school_site": "official_source",
    "archive": "archive_only",
    "third_party": "third_party_only",
}
VERIFIED_FIELD_STATUSES = {"official_registry_verified", "official_source"}
MIN_PROMOTE_CONFIDENCE = 0.5

LIST_FIELDS = {"curricula", "curriculum_by_grade", "subjects_offered", "teaching_methodology",
               "assessment_methodology", "affiliation_details", "decision_maker_roles", "public_contact",
               "curriculum_history"}


def make_school_id(name: str, campus: str | None, city: str) -> str:
    slug = slugify(" ".join(x for x in [name, campus or "", city] if x))[:70].strip("-")
    return f"IN-{slug}-{hashlib.sha1(slug.encode()).hexdigest()[:6]}"


def make_evidence(school_id: str, field_name: str, raw_value: str, normalized_value: Any, *,
                  source_url: str, source_title: str, source_type: str, source_id: str,
                  publication_date: str | None, retrieved_at: str, evidence_excerpt: str,
                  confidence: float, extraction_method: str, snapshot_sha256: str | None,
                  qualifiers: dict | None = None, excerpt_verified: bool = True) -> dict:
    status = EVIDENCE_STATUS_BY_TIER[source_type] if excerpt_verified else "unverified"
    key = canonical_json([school_id, field_name, source_url, raw_value, normalized_value, evidence_excerpt])
    return {
        "evidence_id": "ev-" + sha256_text(key)[:16],
        "school_id": school_id,
        "field_name": field_name,
        "raw_value": raw_value,
        "normalized_value": normalized_value,
        "source_url": source_url,
        "source_title": source_title,
        "source_type": source_type,
        "source_id": source_id,
        "publication_date": publication_date,
        "retrieved_at": retrieved_at,
        "evidence_excerpt": evidence_excerpt,
        "verification_status": status,
        "confidence_score": round(float(confidence), 2),
        "extraction_method": extraction_method,
        "snapshot_sha256": snapshot_sha256,
        "qualifiers": qualifiers or {},
        "first_seen_at": utc_now(),
        "last_seen_at": utc_now(),
        "superseded": False,
    }


def new_school_record(school_id: str, seed: dict, origin: dict) -> dict:
    now = utc_now()
    return {
        "school_id": school_id,
        "record_version": 0,
        "created_at": now,
        "updated_at": now,
        "content_hash": None,
        "input": seed,
        "origin": origin,
        "official_website_url": seed.get("official_website"),
        "group_id": None,
        "fields": {},
        "evidence": [],
        "research_checks": {},
        "analysis": {},
        "data_gaps": [],
        "possible_duplicates": [],
    }


# ---------------------------------------------------------------- merging

def merge_evidence(record: dict, new_items: list[dict]) -> None:
    """Append-only merge: existing evidence is never deleted; repeats update last_seen_at."""
    index = {e["evidence_id"]: e for e in record["evidence"]}
    for item in new_items:
        old = index.get(item["evidence_id"])
        if old:
            old["last_seen_at"] = item["retrieved_at"]
            old["superseded"] = False
            # raw value/excerpt are identical by construction (they form the id); refresh only the
            # machine-derived judgement so improved rules apply to existing evidence
            for k in ("confidence_score", "qualifiers", "extraction_method", "verification_status"):
                old[k] = item[k]
        else:
            record["evidence"].append(item)
            index[item["evidence_id"]] = item


def mark_superseded(record: dict, source_urls_refetched: set[str], seen_ids: set[str]) -> None:
    """Evidence from a re-fetched URL that was not re-observed is marked superseded (kept, not deleted)."""
    for e in record["evidence"]:
        if e["source_url"] in source_urls_refetched and e["evidence_id"] not in seen_ids:
            e["superseded"] = True


# ---------------------------------------------------------------- resolution

def _value_key(field_name: str, v: Any) -> str:
    if field_name == "official_website" and isinstance(v, str):
        from urllib.parse import urlsplit
        p = urlsplit(v.strip().lower())
        host = p.netloc[4:] if p.netloc.startswith("www.") else p.netloc
        return host + p.path.rstrip("/")
    if field_name == "annual_fee" and isinstance(v, dict):
        return canonical_json([v.get("min"), v.get("max")])
    if field_name == "grades_offered" and isinstance(v, dict):
        return canonical_json([v.get("grade_min"), v.get("grade_max")])
    if field_name in ("campus_student_count", "group_student_count", "founding_year", "average_class_size",
                      "number_of_campuses"):
        return canonical_json(v)
    if isinstance(v, str):
        return v.strip().lower()
    return canonical_json(v)


def _item_key(field_name: str, v: Any) -> str:
    if field_name in ("curricula",):
        return v["code"]
    if field_name == "curriculum_by_grade":
        return canonical_json([v["code"], v["grade_min"], v["grade_max"]])
    if field_name == "affiliation_details":
        return canonical_json([v["board"], v["type"], v["id"]])
    if field_name == "public_contact":
        return canonical_json([v["type"], v["value"]])
    if field_name == "curriculum_history":
        return canonical_json([v.get("event_type"), v.get("code"), v.get("year"), v.get("date")])
    return _value_key(field_name, v)


def _rank(e: dict) -> tuple:
    return (TIER_RANK[e["source_type"]], -e["confidence_score"])


def _usable(e: dict) -> bool:
    return (not e.get("superseded") and not e.get("retracted") and e["verification_status"] != "unverified"
            and e["confidence_score"] >= MIN_PROMOTE_CONFIDENCE)


def apply_retractions(record: dict, retractions: dict[str, dict]) -> None:
    """Mark evidence retracted by an audited remediation step (kept for history, excluded from facts)."""
    for e in record["evidence"]:
        r = retractions.get(e["evidence_id"])
        if r:
            e["retracted"] = {"reason": r.get("reason"), "audit_key": r.get("audit_key"), "at": r.get("at")}


def resolve_scalar(field_name: str, evidence: list[dict]) -> dict:
    usable = [e for e in evidence if _usable(e)]
    if field_name == "campus_student_count":
        usable = [e for e in usable if e["qualifiers"].get("scope") == "campus"]
    if not usable:
        return {"value": None, "status": "not_found", "evidence_ids": [], "candidates": [],
                "conflict": None, "weak_evidence_ids": [e["evidence_id"] for e in evidence]}
    groups: dict[str, list[dict]] = {}
    for e in usable:
        groups.setdefault(_value_key(field_name, e["normalized_value"]), []).append(e)
    candidates = []
    for key, items in groups.items():
        items.sort(key=_rank)
        candidates.append({
            "value": items[0]["normalized_value"],
            "best_tier": items[0]["source_type"],
            "evidence_ids": [i["evidence_id"] for i in items],
            "source_urls": sorted({i["source_url"] for i in items}),
        })
    candidates.sort(key=lambda c: (TIER_RANK[c["best_tier"]], -len(c["evidence_ids"])))
    best = candidates[0]
    if field_name == "grades_offered":
        # Several official pages may state sub-spans; the widest official span is the school span.
        same_tier = [c for c in candidates if c["best_tier"] == best["best_tier"]]
        best = max(same_tier, key=lambda c: (c["value"]["grade_max"] - c["value"]["grade_min"]))
        disagreeing = [c for c in candidates if c is not best and c["best_tier"] != best["best_tier"]
                       and _value_key(field_name, c["value"]) != _value_key(field_name, best["value"])]
    else:
        disagreeing = [c for c in candidates if c is not best]
    conflict = None
    status = FIELD_STATUS_BY_TIER[best["best_tier"]]
    if disagreeing:
        status = "conflict"
        conflict = {
            "summary": f"{len(disagreeing) + 1} differing values across sources",
            "values": [{"value": c["value"], "tier": c["best_tier"], "source_urls": c["source_urls"]}
                       for c in [best] + disagreeing],
            "display_policy": "highest-tier value shown, flagged; not resolved",
        }
    return {"value": best["value"], "status": status, "evidence_ids": best["evidence_ids"],
            "candidates": candidates, "conflict": conflict}


def resolve_list(field_name: str, evidence: list[dict]) -> dict:
    usable = [e for e in evidence if _usable(e)]
    if not usable:
        return {"value": [], "status": "not_found", "evidence_ids": [], "items": [], "conflict": None}
    items: dict[str, dict] = {}
    for e in sorted(usable, key=_rank):
        k = _item_key(field_name, e["normalized_value"])
        it = items.get(k)
        if it is None:
            items[k] = {"value": e["normalized_value"], "best_tier": e["source_type"],
                        "status": FIELD_STATUS_BY_TIER[e["source_type"]], "evidence_ids": [e["evidence_id"]]}
        else:
            it["evidence_ids"].append(e["evidence_id"])
    item_list = list(items.values())
    best_rank = min(TIER_RANK[i["best_tier"]] for i in item_list)
    status = FIELD_STATUS_BY_TIER[[t for t, r in TIER_RANK.items() if r == best_rank][0]]
    conflict = None
    if field_name == "curricula":
        official_fams = {curriculum_family(i["value"]["code"]) for i in item_list if TIER_RANK[i["best_tier"]] <= 1}
        tp_only = [i for i in item_list if i["best_tier"] == "third_party"
                   and curriculum_family(i["value"]["code"]) not in official_fams]
        if official_fams and tp_only:
            conflict = {"summary": "third-party source lists curriculum not found on official site",
                        "values": [i["value"] for i in tp_only],
                        "display_policy": "official items shown as verified; third-party-only items flagged"}
    return {"value": [i["value"] for i in item_list], "status": status,
            "evidence_ids": [eid for i in item_list for eid in i["evidence_ids"]],
            "items": item_list, "conflict": conflict}


def resolve_fields(record: dict, field_names: list[str]) -> None:
    by_field: dict[str, list[dict]] = {}
    for e in record["evidence"]:
        by_field.setdefault(e["field_name"], []).append(e)
    for name in field_names:
        ev = by_field.get(name, [])
        if name in ("premium_category",):
            continue
        res = resolve_list(name, ev) if name in LIST_FIELDS else resolve_scalar(name, ev)
        prev = record["fields"].get(name)
        retracted = {e["evidence_id"] for e in record["evidence"] if e.get("retracted")}
        if prev and not prev.get("evidence_ids") and prev.get("value") not in (None, []):
            # recover supporting evidence ids for a value carried forward without them
            pv = (prev.get("regression_warning") or {}).get("previous_value", prev.get("value"))
            prev = dict(prev, evidence_ids=[e["evidence_id"] for e in ev if e["normalized_value"] == pv])
        if name not in LIST_FIELDS:
            _guard_verified_downgrade(name, prev, res, retracted)
        if name in LIST_FIELDS and prev and prev.get("status") == "needs_review":
            prev = None  # legacy held list from an earlier rule version; dropped items are tracked below
        if name in LIST_FIELDS and prev and prev.get("items"):
            # list items previously verified but no longer supported are recorded, never dropped silently
            new_keys = {_item_key(name, i["value"]) for i in res.get("items", [])}
            dropped = [dict(i, dropped_at=utc_now()) for i in prev["items"]
                       if i["status"] in VERIFIED_FIELD_STATUSES and _item_key(name, i["value"]) not in new_keys]
            keep_prior = [d for d in prev.get("dropped_items", []) if _item_key(name, d["value"]) not in new_keys]
            known = {_item_key(name, d["value"]) for d in keep_prior}
            all_dropped = keep_prior + [d for d in dropped if _item_key(name, d["value"]) not in known]
            if all_dropped:
                res["dropped_items"] = all_dropped
        elif prev and prev.get("dropped_items"):
            res["dropped_items"] = prev["dropped_items"]
        record["fields"][name] = res


def _guard_verified_downgrade(name: str, prev: dict | None, res: dict, retracted: set[str] = frozenset()) -> None:
    """Never let weaker evidence silently replace a previously verified value.

    The only way to drop a previously verified value is an explicit retraction of all
    of its supporting evidence (data/audit/manual_audit.json -> retract_evidence_ids).
    """
    if prev and prev.get("status") == "needs_review" and prev.get("regression_warning"):
        rw = prev["regression_warning"]
        prev = {"status": rw["previous_status"], "value": rw["previous_value"],
                "evidence_ids": rw.get("previous_evidence_ids") or prev.get("evidence_ids", [])}
    if not prev or prev.get("status") not in VERIFIED_FIELD_STATUSES:
        return
    if prev.get("evidence_ids") and set(prev["evidence_ids"]) <= retracted:
        return
    if res["status"] in VERIFIED_FIELD_STATUSES or res["status"] == "conflict":
        return
    if prev.get("value") in (None, []):
        return
    res["regression_warning"] = {
        "previous_value": prev.get("value"),
        "previous_status": prev.get("status"),
        "previous_evidence_ids": prev.get("evidence_ids", []),
        "note": "Previously verified value no longer supported by current evidence; kept for review.",
    }
    res["value"] = prev.get("value")
    res["status"] = "needs_review"
    res["evidence_ids"] = prev.get("evidence_ids", [])


def display_value(field_name: str, fact: dict | None) -> str:
    if not fact:
        return ""
    v = fact.get("value")
    if v in (None, [], ""):
        return ""
    if field_name == "annual_fee":
        lo, hi = v["min"], v["max"]
        s = f"₹{lo:,}" if lo == hi else f"₹{lo:,} – ₹{hi:,}"
        bits = []
        if v.get("academic_year"):
            bits.append(f"AY {v['academic_year']}")
        if v.get("period") and v["period"] != "annual":
            bits.append("period not stated" if v["period"] == "unspecified" else v["period"])
        if v.get("fee_type") and v["fee_type"] != "unspecified":
            bits.append(v["fee_type"])
        return s + (f" ({'; '.join(bits)})" if bits else "")
    if field_name == "grades_offered":
        return f"{grade_label(v['grade_min'])} – {grade_label(v['grade_max'])}"
    if field_name == "curricula":
        return ", ".join(sorted({i["code"] for i in v}))
    if field_name == "curriculum_by_grade":
        return "; ".join(f"{i['code']}: {grade_label(i['grade_min'])}–{grade_label(i['grade_max'])}" for i in v)
    if field_name == "affiliation_details":
        return "; ".join(f"{i['board']} {i['type']} {i['id']}" for i in v)
    if field_name == "public_contact":
        return "; ".join(i["value"] for i in v)
    if field_name == "admission_charges" and isinstance(v, dict):
        return f"₹{v['amount']:,}"
    if field_name == "curriculum_history":
        return f"{len(v)} events"
    if isinstance(v, list):
        return ", ".join(str(x) for x in v)
    return str(v)


def compute_content_hash(record: dict) -> str:
    stable = {k: record[k] for k in ("fields", "analysis", "group_id", "official_website_url")}
    stable["evidence_ids"] = sorted(e["evidence_id"] for e in record["evidence"])
    return sha256_text(canonical_json(stable))
