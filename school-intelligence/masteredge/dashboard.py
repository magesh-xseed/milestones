"""Shareable HTML dashboard (page + premium_schools_data.js; host both together) built from the master records.

Priority list = researched schools in report rank order, with the sales detail a rep needs to make
first contact. Directory = every screened Ezyschooling profile with its *listed* board and fee
(third-party listing data, labelled as such on the page).
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

from .config import Config
from .normalize import grade_label
from .report_excel import ranked
from .util import read_json

TEMPLATE = Path(__file__).parent / "templates" / "dashboard.html"
FILENAME = "premium_schools_dashboard.html"
DATA_FILENAME = "premium_schools_data.js"  # DATA + META; loaded by the page, must be hosted alongside it
BOARD_LABEL = {"IB": "IB", "CAMBRIDGE": "Cambridge", "CBSE": "CBSE", "CISCE": "ICSE", "STATE": "State", "NIOS": "NIOS"}
PROGRAMME_LABEL = {"IB_PYP": "IB PYP", "IB_MYP": "IB MYP", "IB_DP": "IB DP", "IB_CP": "IB CP", "CAMBRIDGE_IGCSE": "IGCSE",
                   "CAMBRIDGE_PRIMARY": "Cambridge Primary", "CAMBRIDGE_LOWER_SECONDARY": "Cambridge Lower Secondary",
                   "CAMBRIDGE_AS_A": "Cambridge AS/A Level", "ICSE": "ICSE", "ISC": "ISC"}
PEDAGOGY_LABEL = {"steam_stem": "STEAM/STEM", "inquiry_based": "inquiry-based", "blended_digital": "blended/digital",
                  "personalised": "personalised", "experiential": "experiential", "montessori": "Montessori",
                  "project_based": "project-based", "waldorf": "Waldorf", "reggio_emilia": "Reggio Emilia"}
SCHOOL_TYPE_LABEL = {"day": "Day school", "boarding": "Boarding", "day_and_boarding": "Day & boarding",
                     "day_boarding": "Day boarding"}
FIT_LABEL = {"curriculum_compatibility": "Curriculum match", "premium_positioning": "Premium positioning",
             "student_reach": "Student reach", "academic_alignment": "Nursery – Grade 8 overlap",
             "group_expansion_potential": "Group expansion", "confirmed_sales_readiness": "Buying signal"}
HIDDEN_FIT = {"student_reach", "confirmed_sales_readiness"}  # still scored; not shown in the "Why this fit score" breakdown
GAP_FIELDS = {"campus_student_count": "student enrolment", "annual_fee": "current fee & academic year",
              "decision_maker_roles": "decision-maker names", "public_contact": "contact details",
              "grades_offered": "grades offered", "curricula": "board / curriculum", "number_of_campuses": "number of campuses"}


CITY_ALIAS = {"bangalore": "Bengaluru", "gurgaon": "Gurugram", "bombay": "Mumbai", "madras": "Chennai", "calcutta": "Kolkata",
              "mysore": "Mysuru", "cochin": "Kochi", "trivandrum": "Thiruvananthapuram", "vizag": "Visakhapatnam",
              "new delhi": "Delhi", "secunderabad": "Secunderabad", "pune-dist": "Pune"}


def city_display(city: str | None) -> str | None:
    """One spelling per city for filters: drop '(Vizag)'-style suffixes, apply common aliases, title-case."""
    if not city:
        return city
    c = re.sub(r"\s*\([^)]*\)\s*", " ", city).strip()
    c = CITY_ALIAS.get(c.lower(), c)
    return c if any(ch.isupper() for ch in c) else c.title()


def _boards(families) -> list[str]:
    out: list[str] = []
    for f in families:
        lab = BOARD_LABEL.get(f, f)
        if lab not in out:
            out.append(lab)
    return out


def _v(fields: dict, name: str):
    return (fields.get(name) or {}).get("value")


def _src(fields: dict, name: str) -> str | None:
    st = (fields.get(name) or {}).get("status")
    if not st or st == "not_found":
        return None
    return {"official_source": "official", "official_registry_verified": "official", "third_party_only": "listing",
            "conflict": "sources differ", "needs_review": "under review", "archive_only": "archived page"}.get(st, st)


def _grades(g: dict | None) -> str | None:
    if not g:
        return None
    lo, hi = grade_label(g.get("grade_min")), grade_label(g.get("grade_max"))
    return lo if lo == hi else f"{lo} – {hi}"


def _pedagogy(vals) -> list[str]:
    return [PEDAGOGY_LABEL.get(p, p.replace("_", " ")) for p in vals or []]


def _pitch(text: str | None) -> list[str]:
    """Split the engine's pitch angle into readable sentences; pedagogy codes become words."""
    out = []
    for part in (text or "").split("; "):
        if part.startswith("stated pedagogy:"):
            part = "school describes its teaching as " + ", ".join(_pedagogy(p.strip() for p in part[16:].split(",")))
        if part:
            out.append(part[0].upper() + part[1:])
    return out


def _sales_detail(r: dict, target: tuple[int, int]) -> dict:
    f, a = r["fields"], r["analysis"]
    rec = a.get("recommendations") or {}
    contacts = _v(f, "public_contact") or []
    geo = _v(f, "geo_coordinates") or {}
    g = _v(f, "grades_offered")
    grp = a.get("school_group") or {}
    fit = a["masteredge_fit"]
    gaps = []
    for gap in r.get("data_gaps") or []:
        lab = GAP_FIELDS.get(gap["field"])
        if lab and gap["gap_type"] in ("missing", "undated", "conflict") and lab not in gaps:
            gaps.append(lab)
    return {
        "st": _v(f, "state") or r["input"].get("state"),
        "ph": [c["value"] for c in contacts if c["type"] == "phone"],
        "em": [c["value"] for c in contacts if c["type"] == "email"],
        "addr": _v(f, "address"), "addrSrc": _src(f, "address"),
        "geo": [geo["lat"], geo["lon"]] if geo.get("lat") is not None else None,
        "ez": r["input"].get("ezyschooling_url"),
        "feeSrc": _src(f, "annual_fee"),
        "roles": _v(f, "decision_maker_roles") or [],
        "sroles": rec.get("decision_maker_roles_suggested") or [],
        "rg": rec.get("recommended_grades"),
        "cx": rec.get("implementation_complexity"),
        "pitch": _pitch(rec.get("pitch_angle")),
        "g": _grades(g),
        "tgt": bool(g and g.get("grade_min") is not None and g["grade_min"] <= target[1] and g["grade_max"] >= target[0]),
        "cbg": [{"p": PROGRAMME_LABEL.get(c["code"], BOARD_LABEL.get(c["family"], c["code"])), "g": _grades(c)}
                for c in (_v(f, "curriculum_by_grade") or [])
                if c.get("grade_min") is None or c["grade_min"] <= target[1]],  # programmes that start above the target grades are omitted
        "type": SCHOOL_TYPE_LABEL.get(_v(f, "school_type")),
        "est": _v(f, "founding_year"),
        "ratio": _v(f, "student_teacher_ratio"),
        "cls": _v(f, "average_class_size"),
        "enr": _v(f, "campus_student_count"),
        "grp": grp.get("value"),
        "camp": _v(f, "number_of_campuses"),
        "parent": _v(f, "parent_organization"),
        "ped": _pedagogy(_v(f, "teaching_methodology")),
        "gaps": gaps,
        "comps": [{"k": FIT_LABEL.get(k, k), "s": c["score"], "w": fit["weights"][k], "x": c["explanation"]}
                  for k, c in fit.get("components", {}).items() if k not in HIDDEN_FIT],
    }


def priority_rows(schools: list[dict], target: tuple[int, int] = (1, 8)) -> list[dict]:
    rows = []
    for r in ranked(schools):
        f = r["fields"]
        fee = _v(f, "annual_fee") or {}
        pc = r["analysis"]["premium_category"]
        row = {
            "n": _v(f, "school_name") or r["input"]["name"],
            "c": _v(f, "campus") or r["input"].get("campus"),
            "city": city_display(_v(f, "city") or r["input"].get("city")),
            "cur": _boards(c["family"] for c in (_v(f, "curricula") or [])),
            "t": pc["value"], "lo": fee.get("min"), "hi": fee.get("max"), "prov": bool(pc.get("provisional")),
            "fit": r["analysis"]["masteredge_fit"]["score"],
            "w": r.get("official_website_url") or r["input"].get("official_website"),
        }
        if r["analysis"]["masteredge_fit"].get("components"):
            row.update(_sales_detail(r, target))
        rows.append(row)
    return rows


def _fee_runs(by_grade: dict | None) -> list[list[int]]:
    """{'-2': 90000, '-1': 90000, '1': 140000, …} -> [[-2, -1, 90000], [1, 1, 140000], …] (compact for the page)."""
    runs: list[list[int]] = []
    for g, a in sorted(((int(k), v) for k, v in (by_grade or {}).items())):
        if runs and runs[-1][2] == a and runs[-1][1] == g - 1:
            runs[-1][1] = g
        else:
            runs.append([g, g, a])
    return runs


def _grade_span(classes: str | None, by_grade: dict | None) -> tuple[int, int] | None:
    from .normalize import grade_to_number, parse_grade_range
    if classes:
        g = parse_grade_range(classes.replace(" Class", ""))
        if g:
            return g
        # Listing classes field is a grade field, so a bare "1 - 12 Class" is grades (not ages) here.
        m = re.fullmatch(r"\s*(\d{1,2})\s*-\s*(\d{1,2})\s*Class\s*", classes)
        if m and 1 <= int(m[1]) <= int(m[2]) <= 12:
            return int(m[1]), int(m[2])
        n = grade_to_number(classes) if not re.search(r"\d", classes) else None
        if n is not None:
            return n, n
    keys = [int(k) for k in (by_grade or {})]
    return (min(keys), max(keys)) if keys else None


def directory_rows(screen: dict, city_map: dict, researched_profiles: set[str],
                   target: tuple[int, int] = (1, 8), facility_index: dict[str, int] | None = None) -> list[dict]:
    facility_index = facility_index or {}
    rows = []
    for u, e in screen.items():
        if e.get("status") != "done" or not e.get("name"):
            continue
        fee = e.get("listed_fee") or {}
        mapped = city_map.get(e.get("sitemap_city_slug")) or [e.get("city"), None]
        geo = None
        try:
            if e.get("lat") and e.get("lon"):
                geo = [round(float(e["lat"]), 6), round(float(e["lon"]), 6)]
        except ValueError:
            pass
        row = {"n": e["name"], "c": e.get("locality"), "city": city_display(mapped[0] or e.get("city")), "st": mapped[1],
               "b": _boards(e.get("board_families") or []), "lo": fee.get("min"), "hi": fee.get("max"),
               "w": e.get("official_website"), "ez": u, "geo": geo, "s": u.rstrip("/") in researched_profiles}
        d = e.get("details")
        if d:
            bg = fee.get("by_grade") or {}
            bg_target = {k: v for k, v in bg.items() if target[0] <= int(k) <= target[1]}
            in_target = list(bg_target.values())
            span = _grade_span(d.get("classes"), bg)
            row.update({k: v for k, v in {
                "a": d.get("addr"), "alt": d.get("alt"), "gr": _grades({"grade_min": span[0], "grade_max": span[1]}) if span else d.get("classes"),
                "gs": [span[0], span[1]] if span else None,
                "tgt": bool(span and span[0] <= target[1] and span[1] >= target[0]),
                "gen": d.get("gender"), "ty": d.get("type"), "med": d.get("medium"), "est": d.get("estd"),
                "adm": d.get("admissions"), "rt": d.get("rating"), "rv": d.get("reviews"), "vw": d.get("views"),
                "fac": [facility_index[f] for f in d.get("facilities") or [] if f in facility_index],
                "fr": _fee_runs(bg_target),
                "f18": [min(in_target), max(in_target)] if in_target else None,
            }.items() if v not in (None, [], "")})
        rows.append(row)
    rows.sort(key=lambda r: (-(r["hi"] or 0), r["n"]))
    return rows


def build_dashboard(cfg: Config, schools: list[dict]) -> Path:
    screen = (read_json(cfg.paths.output_dir / "discovery_screen.json", default=None) or {}).get("profiles", {})
    city_map = cfg.research["discovery"].get("sitemap", {}).get("city_map", {})
    prof = cfg.research["masteredge_profile"]
    # The dashboard lists only schools teaching the listing range (product target grades, optionally widened
    # downward via listing_grade_min); fit scores still use the product target grades.
    target = (prof.get("listing_grade_min", prof["target_grade_min"]), prof["target_grade_max"])
    researched = {(r["input"].get("ezyschooling_url") or "").rstrip("/") for r in schools}
    data = priority_rows(schools, target)
    from .adapters.ezyschooling import FACILITY_NAMES
    directory = directory_rows(screen, city_map, researched, target, {f: i for i, f in enumerate(FACILITY_NAMES)})
    screened = len(directory)
    by_profile = {r["ez"].rstrip("/"): r for r in directory}
    for r in data:  # no grades found on the school's website: fall back to the listing's grades
        d = by_profile.get((r.get("ez") or "").rstrip("/"))
        if not r.get("g") and d and d.get("gs"):
            r.update(g=d["gr"], gSrc="listing", tgt=d["tgt"])
    data = [r for r in data if r.get("tgt")]
    directory = [r for r in directory if r.get("tgt")]
    cities = {r["city"] for r in data + directory if r["city"]}
    meta = {"generated": date.today().strftime("%-d %B %Y"), "cities": len(cities), "screened": screened, "directory": directory,
            "target": f"{grade_label(target[0])} – {grade_label(target[1])}", "targetRange": list(target),
            "facilities": FACILITY_NAMES}
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = TEMPLATE.read_text(encoding="utf-8")
    html = html.replace("/*__DATA_SRC__*/", DATA_FILENAME, 1)
    js = f"const DATA = {dump(data)};\nconst META = {dump(meta)};\n"
    out = cfg.paths.output_dir / FILENAME
    for path, text in ((cfg.paths.output_dir / DATA_FILENAME, js), (out, html)):
        tmp = path.with_suffix(".tmp")
        tmp.write_text(text, encoding="utf-8")
        tmp.replace(path)
    return out
