"""Independent, read-only final validation.

Design constraints:
* Reads only the final output files (schools_master.json, school_groups.json,
  research_queue.json, validation_report.json, the Excel report) and raw snapshots.
* Never writes to any of them. SHA-256 of every input is taken before and after the
  run; a difference fails validation.
* Does not import the pipeline's resolution / quality / store code. Text extraction
  and value parsing are re-implemented here so the check is independent.
* Writes only data/output/validation/final_validation_report.json and
  final_validation_summary.md.
"""

from __future__ import annotations

import gzip
import hashlib
import io
import json
import random
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "output"
RAW = ROOT / "data" / "raw"
VAL_DIR = OUT / "validation"
REQUIRED_SHEETS = ["CEO Dashboard", "Top 100 Schools", "Premium School Groups", "School Intelligence",
                   "Curriculum History", "MASTEREDGE Fit", "Top 20 Sales Targets", "Data Gaps", "Source References",
                   "Validation Report"]
VERIFIED = {"official_registry_verified", "official_source"}


# ------------------------------------------------------------------ io helpers (read-only)

def _read_json(p: Path):
    with open(p, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _sha(p: Path) -> str | None:
    if not p.exists():
        return None
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _cfg(name: str):
    return _read_json(ROOT / "config" / name)


def set_root(root: Path | None) -> None:
    """Point the validator at another project root (used by tests)."""
    global ROOT, OUT, RAW, VAL_DIR
    if root is None:
        return
    ROOT = Path(root)
    OUT = ROOT / "data" / "output"
    RAW = ROOT / "data" / "raw"
    VAL_DIR = OUT / "validation"
    _text_cache.clear()


# ------------------------------------------------------------------ independent text + parsing

_text_cache: dict[str, tuple[str, str]] = {}


def snapshot_texts(sha: str) -> tuple[str, str] | None:
    """(visible_text, raw_text) re-derived from the stored raw snapshot."""
    if sha in _text_cache:
        return _text_cache[sha]
    p = RAW / sha[:2] / f"{sha}.gz"
    if not p.exists():
        return None
    with gzip.open(p, "rb") as fh:
        data = fh.read()
    if hashlib.sha256(data).hexdigest() != sha:
        return None
    if data[:5] == b"%PDF-":
        from pypdf import PdfReader

        try:
            reader = PdfReader(io.BytesIO(data))
            txt = " ".join((pg.extract_text() or "") for pg in reader.pages[:30])
        except Exception:
            txt = ""
        vis = re.sub(r"\s+", " ", txt).strip()
        res = (vis, vis)
    else:
        from bs4 import BeautifulSoup

        html = data.decode("utf-8", errors="replace")
        soup = BeautifulSoup(html, "lxml")
        for t in soup(["script", "style", "noscript", "template", "svg", "iframe"]):
            t.decompose()
        vis = re.sub(r"\s+", " ", soup.get_text(" ")).strip()
        res = (vis, html)
    _text_cache[sha] = res
    return res


_UNITS = {"lakh": 10**5, "lakhs": 10**5, "lac": 10**5, "lacs": 10**5, "l": 10**5, "crore": 10**7, "crores": 10**7,
          "cr": 10**7, "k": 10**3, "thousand": 10**3}


def v_money_all(text: str) -> list[int]:
    out = []
    for m in re.finditer(r"(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand|l(?![a-z]))?", text, re.I):
        num = float(m.group(1).replace(",", ""))
        unit = (m.group(2) or "").lower()
        out.append(int(round(num * _UNITS.get(unit, 1))))
    # '₹3.6 to 10.5 Lakhs' style: bare second number sharing a unit
    for m in re.finditer(r"(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|cr)", text, re.I):
        unit = _UNITS[m.group(3).lower().rstrip("s") if m.group(3).lower().rstrip("s") in _UNITS else m.group(3).lower()]
        out += [int(round(float(m.group(1)) * unit)), int(round(float(m.group(2)) * unit))]
    return out


def v_year(text: str) -> list[int]:
    return [int(y) for y in re.findall(r"(?<!\d)((?:18|19|20)\d{2})(?!\d)", text)]


def v_ints(text: str) -> list[int]:
    return [int(x.replace(",", "")) for x in re.findall(r"\d[\d,]*", text)]


# ------------------------------------------------------------------ evidence re-check

def recheck_evidence(e: dict) -> tuple[bool, str]:
    """Independently confirm one evidence record against its stored snapshot."""
    if not e.get("snapshot_sha256"):
        return False, "no snapshot reference"
    texts = snapshot_texts(e["snapshot_sha256"])
    if texts is None:
        return False, "snapshot missing or hash mismatch"
    vis, raw = texts
    ex = e["evidence_excerpt"]
    loc = (e.get("qualifiers") or {}).get("excerpt_location")
    if loc == "hyperlink":
        if e["raw_value"] not in raw and e["raw_value"].replace("https://", "").replace("http://", "") not in raw:
            return False, "hyperlink not present in raw document"
    elif ex not in vis and ex not in raw:
        return False, "excerpt not found in stored source"
    parts = e["raw_value"].split(" … ")
    if loc != "hyperlink" and not all(p.lower() in ex.lower() for p in parts):
        return False, "raw value not inside excerpt"
    f, nv, rv = e["field_name"], e["normalized_value"], e["raw_value"]
    if f == "annual_fee":
        amounts = v_money_all(rv)
        if not amounts:
            return False, "no money amount re-parsed from raw value"
        if nv["min"] not in amounts or nv["max"] not in amounts:
            return False, f"re-parsed amounts {sorted(set(amounts))} do not contain min/max {nv['min']}/{nv['max']}"
        if nv.get("academic_year"):
            y1 = nv["academic_year"][:4]
            if y1 not in ex:
                return False, "academic year not in excerpt"
        if nv.get("period") == "annual" and not re.search(r"/\s*year|annual|per annum|yearly|per year", ex, re.I):
            return False, "period 'annual' not supported by excerpt"
    elif f == "admission_charges":
        if nv["amount"] not in v_money_all(rv):
            return False, "admission charge amount mismatch"
    elif f == "founding_year":
        if nv not in v_year(rv):
            return False, "year mismatch"
    elif f in ("campus_student_count", "group_student_count", "number_of_campuses", "average_class_size"):
        if nv not in v_ints(rv):
            return False, "integer mismatch"
        if f == "campus_student_count" and (e.get("qualifiers") or {}).get("scope") == "campus":
            if re.search(r"\b\d+\s+campuses\b|\b(?:two|three|four|five) campuses\b|across (?:our|all|\d+) (?:campuses|schools)|\bnetwork of\b|\bgroup of schools\b|\bbranches\b", ex, re.I) and (e.get("qualifiers") or {}).get("scope_basis", "").startswith("standalone"):
                return False, "campus scope but excerpt contains group language"
    elif f == "student_teacher_ratio":
        a, b = nv.split(":")
        if not re.search(rf"{a}\s*:\s*{b}|{b}\s*:\s*{a}", rv):
            return False, "ratio mismatch"
    elif f == "curricula":
        code = nv["code"]
        fam = nv["family"]
        kw = {"IB": r"IB|Baccalaureate|Primary Years?|Middle Years?|Diploma|Career|PYP|MYP|\bDP\b", "CBSE": r"CBSE|Central Board",
              "CISCE": r"ICSE|ISC|CISCE|Council|Indian (?:School )?Certificate", "CAMBRIDGE": r"Cambridge|IGCSE|GCSE|A[\s-]Level|CAIE|Checkpoint|Lower Secondary|Primary",
              "STATE": r"State|SSC", "NIOS": r"NIOS|Open Schooling"}.get(fam, re.escape(code))
        if not re.search(kw, rv, re.I):
            return False, f"curriculum keyword for {fam} not in raw value"
    elif f == "curriculum_history":
        if not e.get("publication_date") and not (isinstance(nv, dict) and str(nv.get("year", "")) in ex):
            return False, "history event without dated evidence"
    return True, "ok"


# ------------------------------------------------------------------ metrics (independent)

def populated(name: str, fact: dict | None) -> bool:
    if not fact:
        return False
    v = fact.get("value")
    if v in (None, [], "", {}):
        return False
    if name == "premium_category" and v == "unclassified":
        return False
    return fact.get("status") != "not_found"


def recompute_metrics(schools, fields_cfg) -> dict:
    req = [f["name"] for f in fields_cfg if f.get("required")]
    factual = [f["name"] for f in fields_cfg if f.get("factual")]
    n = len(schools)
    rp = sum(1 for s in schools for f in req if populated(f, s["fields"].get(f)))
    fp = fe = fo = 0
    for s in schools:
        ok_ids = {e["evidence_id"] for e in s["evidence"] if e.get("source_url") and e["verification_status"] != "unverified"}
        for f in factual:
            fact = s["fields"].get(f)
            if not populated(f, fact):
                continue
            fp += 1
            if fact.get("evidence_ids") and all(i in ok_ids for i in fact["evidence_ids"]):
                fe += 1
            if fact.get("status") in VERIFIED:
                fo += 1

    def p(a, b):
        return round(100.0 * a / b, 1) if b else None

    def items(s, f):
        return (s["fields"].get(f) or {}).get("items") or []

    cur_reg = sum(any(i["status"] == "official_registry_verified" for i in items(s, "curricula")) for s in schools)
    cur_off = sum(any(i["status"] in VERIFIED for i in items(s, "curricula")) for s in schools)
    fee_ver = sum(1 for s in schools if (s["fields"].get("annual_fee") or {}).get("status") in VERIFIED
                  and ((s["fields"]["annual_fee"].get("value") or {}).get("academic_year")))
    fee_any = sum(1 for s in schools if (s["fields"].get("annual_fee") or {}).get("value")
                  and any(c["best_tier"] in ("official_school_site", "official_registry") for c in s["fields"]["annual_fee"].get("candidates") or []))
    enr = 0
    for s in schools:
        c = s["fields"].get("campus_student_count") or {}
        if c.get("status") in VERIFIED:
            ev = {e["evidence_id"]: e for e in s["evidence"]}
            if any((ev.get(i) or {}).get("qualifiers", {}).get("reporting_year") for i in c.get("evidence_ids", [])):
                enr += 1
    ct = cd = 0
    for s in schools:
        for chk in s["research_checks"].values():
            if chk["status"] == "not_applicable":
                continue
            ct += 1
            cd += chk["status"] in ("done", "not_publicly_available")
    return {"field_coverage_pct": p(rp, n * len(req)), "evidence_coverage_pct": p(fe, fp),
            "official_source_verification_pct": p(fo, fp), "curriculum_verification_pct": p(cur_reg, n),
            "curriculum_official_site_pct": p(cur_off, n), "fee_verification_pct": p(fee_ver, n),
            "fee_official_any_pct": p(fee_any, n), "enrollment_verification_pct": p(enr, n),
            "research_completion_pct": p(cd, ct), "_counts": {"required_instances": n * len(req), "required_populated": rp,
                                                              "factual_populated": fp, "factual_with_evidence": fe,
                                                              "factual_official": fo, "checks_total": ct, "checks_completed": cd}}


# ------------------------------------------------------------------ audit sample

def fact_instances(schools, fields_cfg):
    factual = [f["name"] for f in fields_cfg if f.get("factual")]
    out = []
    for s in sorted(schools, key=lambda x: x["school_id"]):
        for f in factual:
            fact = s["fields"].get(f)
            if populated(f, fact):
                out.append((s, f, fact))
    return out


def audit_key(school_id: str, field: str, value) -> str:
    return hashlib.sha256(json.dumps([school_id, field, value], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def audit_sample(schools, fields_cfg, size: int, seed: int):
    """Deterministic, stable sample: rank fact instances by a seeded hash of (school_id, field).

    Unlike a positional random sample, adding or removing one fact does not reshuffle the
    rest, so audit verdicts stay attached to the same facts across re-runs.
    """
    inst = fact_instances(schools, fields_cfg)
    rank = lambda t: hashlib.sha256(f"{seed}|{t[0]['school_id']}|{t[1]}".encode()).hexdigest()
    return sorted(inst, key=rank)[:min(size, len(inst))]


def print_audit_sample(size: int | None = None) -> None:
    master = _read_json(OUT / "schools_master.json")
    rc = _cfg("research_config.json")["audit"]
    fields_cfg = _cfg("fields.json")["fields"]
    for s, f, fact in audit_sample(master["schools"], fields_cfg, size or rc["sample_size"], rc["seed"]):
        ev = {e["evidence_id"]: e for e in s["evidence"]}
        e = ev[fact["evidence_ids"][0]] if fact.get("evidence_ids") else None
        print(json.dumps({"audit_key": audit_key(s["school_id"], f, fact["value"]), "school_id": s["school_id"],
                          "field": f, "value": fact["value"], "status": fact["status"],
                          "source_url": e and e["source_url"], "excerpt": e and e["evidence_excerpt"][:400],
                          "qualifiers": e and e.get("qualifiers")}, ensure_ascii=False))


# ------------------------------------------------------------------ main validation

def validate(audit_size: int | None = None, root: Path | None = None) -> dict:
    set_root(root)
    rcfg = _cfg("research_config.json")
    fields_cfg = _cfg("fields.json")["fields"]
    vrules = _cfg("validation_rules.json")
    prem = _cfg("premium_rules.json")
    report_path = OUT / rcfg["report"]["filename"]
    inputs = [OUT / "schools_master.json", OUT / "school_groups.json", OUT / "research_queue.json",
              OUT / "validation_report.json", OUT / "source_registry.json", report_path, OUT / "research_history.jsonl"]
    before = {str(p.relative_to(ROOT)): _sha(p) for p in inputs}

    failures: list[dict] = []
    warnings: list[dict] = []
    rules: dict[str, dict] = {}

    def rule(rid, desc, critical=True):
        rules[rid] = {"id": rid, "description": desc, "critical": critical, "checked": 0, "failed": 0, "status": "PASS"}
        return rules[rid]

    def fail(rid, school_id, detail):
        r = rules[rid]
        r["failed"] += 1
        r["status"] = "FAIL"
        (failures if r["critical"] else warnings).append({"rule": rid, "school_id": school_id, "detail": detail})

    # 15. structural ---------------------------------------------------------------
    rule("R15_structure", "All output files pass structural validation")
    import jsonschema
    from .schema import GROUPS_SCHEMA, MASTER_SCHEMA, QUEUE_SCHEMA

    master = _read_json(OUT / "schools_master.json")
    groups = _read_json(OUT / "school_groups.json")
    queue = _read_json(OUT / "research_queue.json")
    pipeline_report = _read_json(OUT / "validation_report.json")
    for name, obj, sch in (("schools_master.json", master, MASTER_SCHEMA), ("school_groups.json", groups, GROUPS_SCHEMA),
                           ("research_queue.json", queue, QUEUE_SCHEMA)):
        rules["R15_structure"]["checked"] += 1
        try:
            jsonschema.validate(obj, sch)
        except jsonschema.ValidationError as exc:
            fail("R15_structure", None, f"{name}: {exc.message} at {list(exc.absolute_path)[:6]}")
    with open(OUT / "research_history.jsonl", encoding="utf-8") as fh:
        for ln, line in enumerate(fh, 1):
            rules["R15_structure"]["checked"] += 1
            try:
                json.loads(line)
            except ValueError:
                fail("R15_structure", None, f"research_history.jsonl line {ln} invalid JSON")
    schools = master["schools"]
    by_id = {s["school_id"]: s for s in schools}

    # 2. unique campus identity ------------------------------------------------------
    rule("R02_unique_campus", "Every school has a unique campus identity")
    ids = [s["school_id"] for s in schools]
    rules["R02_unique_campus"]["checked"] = len(ids)
    dup_ids = {i for i in ids if ids.count(i) > 1}
    for d in dup_ids:
        fail("R02_unique_campus", d, "duplicate school_id")
    seen_url, seen_key = {}, {}
    for s in schools:
        u = (s.get("official_website_url") or "").lower().replace("://www.", "://").rstrip("/")
        if u:
            if u in seen_url:
                fail("R02_unique_campus", s["school_id"], f"same official website as {seen_url[u]}: {u}")
            seen_url[u] = s["school_id"]
        k = (re.sub(r"\W+", " ", s["input"]["name"].lower()).strip(), (s["input"].get("campus") or "").lower(), s["input"]["city"].lower())
        if k in seen_key:
            fail("R02_unique_campus", s["school_id"], f"same name/campus/city as {seen_key[k]}")
        seen_key[k] = s["school_id"]

    # 1. India --------------------------------------------------------------------------
    rule("R01_india", "Every school is physically located in India")
    states = {x.lower() for x in vrules["india_states"]}
    bb = vrules["india_bbox"]
    for s in schools:
        rules["R01_india"]["checked"] += 1
        st = ((s["fields"].get("state") or {}).get("value") or s["input"].get("state") or "").lower()
        if st not in states:
            fail("R01_india", s["school_id"], f"state '{st}' not an Indian state/UT")
        geo = (s["fields"].get("geo_coordinates") or {}).get("value")
        if geo and not (bb["lat_min"] <= geo["lat"] <= bb["lat_max"] and bb["lon_min"] <= geo["lon"] <= bb["lon_max"]):
            fail("R01_india", s["school_id"], f"geo {geo} outside India bounding box")
        has_loc_evidence = any(e["field_name"] in ("city", "state", "address", "geo_coordinates") and e["verification_status"] != "unverified"
                               for e in s["evidence"])
        if not has_loc_evidence:
            fail("R01_india", s["school_id"], "no location evidence (city/state/address/geo)")

    # 3. groups -----------------------------------------------------------------------------
    rule("R03_groups", "Every group-to-campus relationship is supported")
    for g in groups["groups"]:
        for m in g["member_school_ids"]:
            rules["R03_groups"]["checked"] += 1
            s = by_id.get(m)
            if not s:
                fail("R03_groups", m, f"group {g['group_id']} member not in master")
                continue
            host = re.sub(r"^www\.", "", re.sub(r"^https?://", "", s.get("official_website_url") or "").split("/")[0].lower())
            if g["basis"] == "shared_official_domain" and host != g["brand_domain"]:
                fail("R03_groups", m, f"official domain {host} != group domain {g['brand_domain']}")
            if s.get("group_id") != g["group_id"]:
                fail("R03_groups", m, "record group_id does not match group file")

    # 4-7, 14. evidence-backed facts ---------------------------------------------------------
    rule("R04_fees", "Every fee matches its source, academic year and fee type")
    rule("R05_enrollment", "Every student count matches its source and reporting year")
    rule("R06_curriculum", "Every curriculum marked verified matches official evidence")
    rule("R07_history", "Every historical event has dated supporting evidence")
    rule("R14_supported", "No fabricated, unsupported or mock values presented as facts")
    rule("R13_conflicts", "Every unresolved conflict is visible and none is presented as verified")
    factual = [f["name"] for f in fields_cfg if f.get("factual")]
    auto_checked = auto_matched = 0
    fact_results: dict[tuple, bool] = {}
    for s in schools:
        ev = {e["evidence_id"]: e for e in s["evidence"]}
        for f in factual:
            fact = s["fields"].get(f)
            if not populated(f, fact):
                continue
            rules["R14_supported"]["checked"] += 1
            ok_all = True
            if not fact.get("evidence_ids"):
                fail("R14_supported", s["school_id"], f"{f}: populated value without evidence")
                ok_all = False
            for eid in fact.get("evidence_ids", []):
                e = ev.get(eid)
                if e is None:
                    fail("R14_supported", s["school_id"], f"{f}: evidence {eid} missing")
                    ok_all = False
                    continue
                if re.search(r"example\.(?:com|org)|lorem ipsum|\bdummy (?:text|data|school)\b|\bplaceholder\b|\bmock (?:data|school|record)\b|\bfake (?:data|school)\b", e["source_url"] + e["evidence_excerpt"][:200], re.I):
                    fail("R14_supported", s["school_id"], f"{f}: mock-looking source {e['source_url']}")
                    ok_all = False
                ok, why = recheck_evidence(e)
                if not ok:
                    ok_all = False
                    rid = {"annual_fee": "R04_fees", "campus_student_count": "R05_enrollment", "curricula": "R06_curriculum",
                           "curriculum_history": "R07_history"}.get(f, "R14_supported")
                    fail(rid, s["school_id"], f"{f} {eid}: {why}")
            # tier consistency for verified statuses
            if fact.get("status") in VERIFIED:
                tiers = {ev[i]["source_type"] for i in fact.get("evidence_ids", []) if i in ev}
                need = "official_registry" if fact["status"] == "official_registry_verified" else "official_school_site"
                if f in ("curricula", "curriculum_by_grade", "subjects_offered", "teaching_methodology", "assessment_methodology",
                         "affiliation_details", "decision_maker_roles", "public_contact", "curriculum_history"):
                    for it in fact.get("items", []):
                        it_tiers = {ev[i]["source_type"] for i in it["evidence_ids"] if i in ev}
                        need_i = {"official_registry_verified": "official_registry", "official_source": "official_school_site"}.get(it["status"])
                        if need_i and need_i not in it_tiers:
                            fail("R06_curriculum" if f == "curricula" else "R14_supported", s["school_id"],
                                 f"{f} item {it['value']} status {it['status']} lacks {need_i} evidence")
                            ok_all = False
                elif need not in tiers:
                    fail("R14_supported", s["school_id"], f"{f} status {fact['status']} without {need} evidence")
                    ok_all = False
            if fact.get("conflict") and fact.get("status") in VERIFIED and f != "curricula":
                fail("R13_conflicts", s["school_id"], f"{f}: conflict presented with verified status")
            auto_checked += 1
            auto_matched += ok_all
            fact_results[(s["school_id"], f)] = ok_all
            if f == "annual_fee":
                rules["R04_fees"]["checked"] += 1
            if f == "campus_student_count":
                rules["R05_enrollment"]["checked"] += 1
                for eid in fact.get("evidence_ids", []):
                    q = ev[eid].get("qualifiers", {}) if eid in ev else {}
                    if q.get("scope") != "campus":
                        fail("R05_enrollment", s["school_id"], f"campus count backed by {q.get('scope')}-scope evidence")
            if f == "curricula":
                rules["R06_curriculum"]["checked"] += 1
            if f == "curriculum_history":
                for it in fact.get("items", []):
                    rules["R07_history"]["checked"] += 1
                    e = ev.get(it["evidence_ids"][0])
                    if not e or not (e.get("publication_date") or (it["value"].get("year") and str(it["value"]["year"]) in e["evidence_excerpt"])):
                        fail("R07_history", s["school_id"], f"history item {it['value']} lacks dated evidence")

    # 8. premium category rules ------------------------------------------------------------------
    rule("R08_premium_rules", "Every premium category follows the configured rules")
    cats = prem["categories"]
    for s in schools:
        rules["R08_premium_rules"]["checked"] += 1
        pc = s["analysis"]["premium_category"]
        fee = (s["fields"].get("annual_fee") or {}).get("value")
        if not fee:
            expected = prem["unclassified_id"]
        else:
            expected = next(c["id"] for c in cats if fee["max"] >= c["min_annual_fee_max"])
        if pc["value"] != expected:
            fail("R08_premium_rules", s["school_id"], f"category {pc['value']} != expected {expected}")
        fs = (s["fields"].get("annual_fee") or {}).get("status")
        if fee and fs == "third_party_only" and not pc.get("provisional"):
            fail("R08_premium_rules", s["school_id"], "third-party-only fee not marked provisional")

    # 9. fit labelled as analysis + recomputable -------------------------------------------------
    rule("R09_fit_analysis", "Every MASTEREDGE fit assessment is labelled analysis and recomputable")
    w = rcfg["scoring_weights"]
    for s in schools:
        rules["R09_fit_analysis"]["checked"] += 1
        fit = s["analysis"]["masteredge_fit"]
        if "ANALYSIS" not in fit.get("label", ""):
            fail("R09_fit_analysis", s["school_id"], "fit not labelled ANALYSIS")
        tot = round(sum(fit["components"][k]["score"] * w[k] for k in w), 1)
        if abs(tot - fit["score"]) > 0.05:
            fail("R09_fit_analysis", s["school_id"], f"score {fit['score']} != recomputed {tot}")
        if fit["components"]["confirmed_sales_readiness"]["score"] > 0 and not fit["components"]["confirmed_sales_readiness"]["supporting_facts"]:
            fail("R09_fit_analysis", s["school_id"], "sales readiness scored without supporting facts")
        if "ANALYSIS" not in s["analysis"]["recommendations"].get("label", ""):
            fail("R09_fit_analysis", s["school_id"], "recommendations not labelled ANALYSIS")

    # 12. percentages recalculated -----------------------------------------------------------------
    rule("R12_percentages", "Every reported percentage is recalculated from the final data")
    metrics = recompute_metrics(schools, fields_cfg)
    pm = pipeline_report["metrics"]
    for k, v in metrics.items():
        if k.startswith("_"):
            continue
        rules["R12_percentages"]["checked"] += 1
        if pm.get(k) != v:
            fail("R12_percentages", None, f"{k}: reported {pm.get(k)} vs recalculated {v}")

    # 10 / 11 / 13. Excel checks -------------------------------------------------------------------
    rule("R10_report_numbers", "Every CEO report number matches the final JSON")
    rule("R11_report_sources", "Every factual report row includes its source reference")
    from openpyxl import load_workbook

    wb = load_workbook(report_path, read_only=False)
    missing = [sh for sh in REQUIRED_SHEETS if sh not in wb.sheetnames]
    rules["R15_structure"]["checked"] += 1
    if missing:
        fail("R15_structure", None, f"Excel missing sheets: {missing}")
    ws = wb["Top 100 Schools"]
    hdr = [c.value for c in ws[1]]
    col = {h: i for i, h in enumerate(hdr)}
    for row in ws.iter_rows(min_row=2):
        sid = row[col["School ID"]].value
        s = by_id.get(sid)
        rules["R10_report_numbers"]["checked"] += 1
        if not s:
            fail("R10_report_numbers", sid, "report row for unknown school")
            continue
        if row[col["Fit score /100 (ANALYSIS)"]].value != s["analysis"]["masteredge_fit"]["score"]:
            fail("R10_report_numbers", sid, "fit score mismatch")
        fee = (s["fields"].get("annual_fee") or {}).get("value")
        if row[col["Max annual fee (INR)"]].value != (fee or {}).get("max"):
            fail("R10_report_numbers", sid, f"max fee {row[col['Max annual fee (INR)']].value} != {(fee or {}).get('max')}")
        cnt = (s["fields"].get("campus_student_count") or {}).get("value")
        if row[col["Campus students"]].value != cnt:
            fail("R10_report_numbers", sid, "campus students mismatch")
        if row[col["Premium category"]].value != s["analysis"]["premium_category"]["label"]:
            fail("R10_report_numbers", sid, "premium category mismatch")
        rules["R11_report_sources"]["checked"] += 1
        if fee and not (row[col["Fee source"]].hyperlink or row[col["Fee source"]].value):
            fail("R11_report_sources", sid, "fee shown without source link")
        if populated("curricula", s["fields"].get("curricula")) and not row[col["Curriculum source"]].value:
            fail("R11_report_sources", sid, "curriculum shown without source link")
    # School Intelligence: every populated value has a source cell
    ws = wb["School Intelligence"]
    hdr = [c.value for c in ws[1]]
    for row in ws.iter_rows(min_row=2):
        sid = row[0].value
        for i, h in enumerate(hdr):
            if h and h.endswith(" status"):
                val = row[i - 1].value
                src = row[i + 1].value
                rules["R11_report_sources"]["checked"] += 1
                if val not in (None, "") and not src:
                    fail("R11_report_sources", sid, f"{h[:-7]} value without source")
    # Dashboard KPI
    ws = wb["CEO Dashboard"]
    kv = {r[0].value: r[1].value for r in ws.iter_rows(min_row=1) if r[0].value}
    rules["R10_report_numbers"]["checked"] += 3
    if kv.get("Schools researched") != len(schools):
        fail("R10_report_numbers", None, "dashboard school count mismatch")
    n_ultra = sum(1 for s in schools if s["analysis"]["premium_category"]["value"] == "ultra_premium")
    n_prem = sum(1 for s in schools if s["analysis"]["premium_category"]["value"] == "premium")
    if kv.get("Ultra-premium by published fee") != n_ultra:
        fail("R10_report_numbers", None, "dashboard ultra-premium count mismatch")
    if kv.get("Premium by published fee") != n_prem:
        fail("R10_report_numbers", None, "dashboard premium count mismatch")
    # Dashboard / Validation sheet percentages vs recalculation
    ws = wb["Validation Report"]
    for r in ws.iter_rows(min_row=2):
        k, v = r[0].value, r[1].value
        if k in metrics and not k.startswith("_"):
            rules["R12_percentages"]["checked"] += 1
            if v != metrics[k]:
                fail("R12_percentages", None, f"Excel {k}={v} vs recalculated {metrics[k]}")
    # conflicts visible in Data Gaps
    ws = wb["Data Gaps"]
    gap_rows = {(r[0].value, r[2].value, r[3].value) for r in ws.iter_rows(min_row=2)}
    for s in schools:
        for f, fact in s["fields"].items():
            if fact.get("status") == "conflict" or fact.get("conflict"):
                rules["R13_conflicts"]["checked"] += 1
                if (s["school_id"], f, "conflict") not in gap_rows:
                    fail("R13_conflicts", s["school_id"], f"conflict on {f} not visible in Data Gaps sheet")
    wb.close()

    # manual (semantic) audit sample --------------------------------------------------------------
    acfg = rcfg["audit"]
    size = audit_size or acfg["sample_size"]
    sample = audit_sample(schools, fields_cfg, size, acfg["seed"])
    manual_path = ROOT / "data" / "audit" / "manual_audit.json"
    manual = _read_json(manual_path) if manual_path.exists() else {"results": []}
    verdicts = {m["audit_key"]: m for m in manual.get("results", [])}
    audited = matched = 0
    sample_rows = []
    for s, f, fact in sample:
        key = audit_key(s["school_id"], f, fact["value"])
        v = verdicts.get(key)
        row = {"audit_key": key, "school_id": s["school_id"], "field": f, "automated_recheck": fact_results.get((s["school_id"], f)),
               "manual_verdict": v["verdict"] if v else "PENDING", "manual_note": v.get("note") if v else None}
        if v:
            audited += 1
            matched += v["verdict"] == "MATCH"
        sample_rows.append(row)
    rule("R16_audit", "Independently audited factual accuracy on the audited sample")
    rules["R16_audit"]["checked"] = audited
    if audited < len(sample):
        fail("R16_audit", None, f"{len(sample) - audited} of {len(sample)} sampled facts have no manual audit verdict")
    if audited and matched < audited:
        for r in sample_rows:
            if r["manual_verdict"] not in ("MATCH", "PENDING"):
                fail("R16_audit", r["school_id"], f"{r['field']}: manual verdict {r['manual_verdict']} ({r['manual_note']})")

    # gates ----------------------------------------------------------------------------------------------
    conflicts_as_verified = sum(1 for x in failures if x["rule"] == "R13_conflicts")
    unsupported = sum(1 for x in failures if x["rule"] == "R14_supported")
    gate_vals = {
        "json_schema_validation_pct": 100.0 if rules["R15_structure"]["failed"] == 0 else 0.0,
        "evidence_coverage_pct": metrics["evidence_coverage_pct"],
        "audited_accuracy_pct": round(100.0 * matched / audited, 1) if audited else None,
        "duplicate_campus_ids": rules["R02_unique_campus"]["failed"],
        "conflicts_presented_as_verified": conflicts_as_verified,
        "unsupported_values_as_facts": unsupported,
        "required_field_coverage_pct": metrics["field_coverage_pct"],
        "curriculum_verification_pct": metrics["curriculum_verification_pct"],
        "fee_verification_pct": metrics["fee_verification_pct"],
        "enrollment_verification_pct": metrics["enrollment_verification_pct"],
    }
    gate_results = []
    critical_gate_fail = False
    for g in vrules["gates"]:
        v = gate_vals.get(g["id"])
        if g.get("report_only"):
            st = "REPORTED"
        elif "target" in g:
            st = "MET" if v is not None and v >= g["target"] else "NOT MET"
        else:
            st = "MET" if v is not None and v <= g["target_max"] else "NOT MET"
        if st == "NOT MET" and g.get("critical"):
            critical_gate_fail = True
        gate_results.append({**g, "actual": v, "status": st})

    after = {str(p.relative_to(ROOT)): _sha(p) for p in inputs}
    mutated = [k for k in before if before[k] != after[k]]
    rule("R00_read_only", "Validator did not modify any validated file")
    rules["R00_read_only"]["checked"] = len(before)
    for k in mutated:
        fail("R00_read_only", None, f"{k} changed during validation")

    critical_rule_fail = any(r["status"] == "FAIL" and r["critical"] for r in rules.values())
    if critical_rule_fail or critical_gate_fail:
        release = "FAILED_VALIDATION"
    elif any(g["status"] == "NOT MET" for g in gate_results):
        release = "PASSED_WITH_UNMET_TARGETS"
    else:
        release = "PASSED"
    total_fields = len(schools) * len([f for f in fields_cfg if f.get("factual")])
    verified_vals = sum(1 for s in schools for f in factual if populated(f, s["fields"].get(f)) and s["fields"][f]["status"] in VERIFIED)
    missing_vals = sum(1 for s in schools for f in factual if not populated(f, s["fields"].get(f)))
    conflicts = sum(1 for s in schools for fact in s["fields"].values() if fact.get("status") == "conflict" or fact.get("conflict"))
    src_errors = sum(1 for s in schools for c in s["research_checks"].values() if c["status"] in ("blocked", "failed"))
    report = {
        "validated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "validator": "masteredge.validate_final (read-only, independent re-derivation)",
        "release_status": release,
        "dataset_run_id": master.get("run_id"),
        "input_file_sha256": before,
        "totals": {
            "records_checked": len(schools),
            "fields_checked": total_fields,
            "populated_factual_values": auto_checked,
            "verified_values": verified_vals,
            "missing_values": missing_vals,
            "conflicts": conflicts,
            "source_errors_blocked_or_failed_checks": src_errors,
            "evidence_records": sum(len(s["evidence"]) for s in schools),
        },
        "coverage_pct": {k: v for k, v in metrics.items() if not k.startswith("_")},
        "coverage_counts": metrics["_counts"],
        "automated_recheck": {"fact_instances_checked": auto_checked, "fact_instances_matching_source": auto_matched,
                              "automated_accuracy_pct": round(100.0 * auto_matched / auto_checked, 1) if auto_checked else None,
                              "method": "excerpt re-located in stored raw snapshot + independent re-parse of value"},
        "remediation_history": [{"audit_key": m["audit_key"], "school_id": m.get("school_id"), "field": m.get("field"),
                                 "verdict": m["verdict"], "note": m.get("note"),
                                 "retracted_evidence_ids": m.get("retract_evidence_ids", [])}
                                for m in manual.get("results", []) if m["verdict"] != "MATCH"],
        "pre_remediation_audit_rounds": (_read_json(ROOT / "data" / "audit" / "audit_rounds.json")["rounds"]
                                         if (ROOT / "data" / "audit" / "audit_rounds.json").exists() else []),
        "manual_audit": {"sample_size": len(sample), "audited": audited, "matched": matched,
                         "audited_accuracy_pct": gate_vals["audited_accuracy_pct"], "seed": acfg["seed"], "sample": sample_rows,
                         "note": "Accuracy applies to the audited sample only; unaudited records are not claimed accurate."},
        "rules": list(rules.values()),
        "gates": gate_results,
        "failures": failures,
        "warnings": warnings,
    }
    return report


def write_reports(report: dict) -> None:
    VAL_DIR.mkdir(parents=True, exist_ok=True)
    tmp = VAL_DIR / ".final_validation_report.json.tmp"
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(VAL_DIR / "final_validation_report.json")
    t = report["totals"]
    lines = [
        "# Final Independent Validation Summary", "",
        f"- **Release status:** `{report['release_status']}`",
        f"- Validated at: {report['validated_at']} (dataset run `{report['dataset_run_id']}`)",
        f"- Validator: {report['validator']}", "",
        "## Totals", "",
        "| Item | Count |", "|---|---|",
        *[f"| {k.replace('_', ' ')} | {v} |" for k, v in t.items()], "",
        "## Coverage (recalculated from final JSON)", "",
        "| Metric | % |", "|---|---|",
        *[f"| {k} | {v} |" for k, v in report["coverage_pct"].items()], "",
        "## Accuracy", "",
        f"- Automated re-check (all populated facts): {report['automated_recheck']['fact_instances_matching_source']}/"
        f"{report['automated_recheck']['fact_instances_checked']} = {report['automated_recheck']['automated_accuracy_pct']}%",
        f"- Manual audit sample: {report['manual_audit']['matched']}/{report['manual_audit']['audited']} audited "
        f"(sample size {report['manual_audit']['sample_size']}) = {report['manual_audit']['audited_accuracy_pct']}%",
        "- Accuracy claims apply to the audited sample only.", "",
        "## Pre-remediation (first-look) audit rounds", "",
        "| Round | Slice | Facts reviewed | Value mismatches | First-look accuracy % |", "|---|---|---|---|---|",
        *[f"| {r['round']} | {r['slice']} | {r['facts_reviewed']} | {r['value_mismatches']} | {r['first_look_accuracy_pct']} |"
          for r in report["pre_remediation_audit_rounds"]], "",
        "## Audit findings remediated before this validation", "",
        *([f"- {m['school_id']} `{m['field']}`: {m['verdict']} — {m['note']} (retracted: {', '.join(m['retracted_evidence_ids']) or 'none'})"
           for m in report["remediation_history"]] or ["- none"]), "",
        "## Quality gates", "",
        "| Gate | Actual | Target | Status |", "|---|---|---|---|",
        *[f"| {g['label']} | {g['actual']} | {g.get('target', g.get('target_max', 'report'))} | {g['status']} |" for g in report["gates"]], "",
        "## Validation rules", "",
        "| Rule | Critical | Checked | Failed | Status |", "|---|---|---|---|---|",
        *[f"| {r['id']}: {r['description']} | {r['critical']} | {r['checked']} | {r['failed']} | {r['status']} |" for r in report["rules"]], "",
        "## Failed validation rules (first 40)", "",
        *([f"- `{x['rule']}` {x['school_id'] or ''}: {x['detail']}" for x in report["failures"][:40]] or ["- none"]), "",
    ]
    tmp = VAL_DIR / ".final_validation_summary.md.tmp"
    tmp.write_text("\n".join(lines), encoding="utf-8")
    tmp.replace(VAL_DIR / "final_validation_summary.md")


def main(audit_size: int | None = None, root: Path | None = None) -> int:
    report = validate(audit_size, root)
    write_reports(report)
    print(json.dumps({"release_status": report["release_status"], "totals": report["totals"],
                      "failed_rules": [r["id"] for r in report["rules"] if r["status"] == "FAIL"],
                      "gates": {g["id"]: [g["actual"], g["status"]] for g in report["gates"]}}, indent=2))
    return 0 if report["release_status"] != "FAILED_VALIDATION" else 1
