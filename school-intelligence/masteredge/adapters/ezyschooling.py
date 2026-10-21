"""Ezyschooling adapter (third-party tier): discovery listings, profiles, fee tables.

Third-party values are cross-checks only. They never outrank the official site and
any disagreement is surfaced as a conflict.
"""

from __future__ import annotations

import json
import re
from urllib.parse import urljoin

from .. import normalize as N
from ..extract import Extraction
from ..http import AccessBlocked, FetchError
from ..textify import excerpt
from .base import Context, to_evidence

SOURCE_ID = "ezyschooling"
TIER = "third_party"
BASE = "https://ezyschooling.com"
PROFILE_RE = re.compile(r"^https://ezyschooling\.com/school/([a-z0-9-]+)/?$")


def _raw_jsonld_excerpt(raw_html: str, key: str, value: str) -> str | None:
    """Locate '"key":"value"' exactly as serialised in the raw page."""
    for cand in (json.dumps(value, ensure_ascii=False), json.dumps(value)):
        m = re.search(rf'"{re.escape(key)}"\s*:\s*{re.escape(cand)}', raw_html)
        if m:
            return m.group(0)
    # value was whitespace-trimmed: allow trailing escaped whitespace ("…College\r") in the serialised source
    for cand in (json.dumps(value, ensure_ascii=False), json.dumps(value)):
        m = re.search(rf'"{re.escape(key)}"\s*:\s*{re.escape(cand[:-1])}(?:\\[rnt]|\s)*"', raw_html)
        if m:
            return m.group(0)
    return None


def _school_node(doc) -> dict | None:
    for item in doc.jsonld:
        t = item.get("@type")
        if t == "School" or (isinstance(t, list) and "School" in t):
            return item
    return None


def _profile_page_name(doc) -> str | None:
    for item in doc.jsonld:
        if item.get("@type") == "ProfilePage" and item.get("name"):
            return item["name"]
    return None


def parse_profile_identity(doc) -> dict:
    """Name / locality / city / official website / geo from a profile page."""
    node = _school_node(doc) or {}
    full = _profile_page_name(doc) or ""
    parts = [p.strip() for p in full.split(",")]
    same_as = node.get("sameAs")
    if isinstance(same_as, list):
        same_as = next((u for u in same_as if isinstance(u, str) and u.startswith("http")), None)
    geo = node.get("geo") or {}
    return {
        "name": (node.get("name") or (parts[0] if parts else "")).strip() or None,
        "locality": parts[1] if len(parts) >= 3 else None,
        "city": parts[-1] if len(parts) >= 2 else None,
        "official_website": same_as if isinstance(same_as, str) and same_as.startswith("http") else None,
        "lat": geo.get("latitude"), "lon": geo.get("longitude"),
        "profile_name": full,
    }


def state_from_address(addr: str, states: list[str]) -> tuple[str, str, int, int] | None:
    """Indian state/UT named as the last address component ('…, Tirupati , Andhra Pradesh - 517507').

    Returns (raw text, canonical state name, start, end) within addr, or None.
    """
    best = None
    for name in states:
        for m in re.finditer(rf"(?<![A-Za-z]){re.escape(name)}(?![A-Za-z])", addr, re.I):
            if best is None or m.start() > best[2]:
                best = (m.group(0), name, m.start(), m.end())
    if best and re.fullmatch(r"[\s,.\-–]*(?:\d{6})?[\s,.]*", addr[best[3]:]):
        return best
    return None


def research_profile(ctx: Context, record: dict, profile_url: str) -> dict:
    sid = record["school_id"]
    out = {"evidence": [], "checks": {}, "identity": None}
    try:
        snap = ctx.fetcher.fetch(profile_url)
    except (AccessBlocked, FetchError) as exc:
        out["checks"]["third_party_crosscheck"] = {"status": "blocked" if isinstance(exc, AccessBlocked) else "failed",
                                                   "detail": f"ezyschooling profile: {exc.reason}"}
        return out
    doc = ctx.load_document(snap)
    raw = snap.read_text(ctx.fetcher.store.raw_dir)
    ident = parse_profile_identity(doc)
    out["identity"] = ident
    exs: list[Extraction] = []
    t = doc.text

    def raw_ex(field, key, value, normalized, method, conf=0.7, extra=None):
        ex_txt = _raw_jsonld_excerpt(raw, key, value)
        if ex_txt:
            q = {"excerpt_location": "raw_document"}
            q.update(extra or {})
            exs.append(Extraction(field, str(value), normalized, ex_txt, method, conf, q))

    if ident["name"]:
        raw_ex("school_name", "name", ident["name"], ident["name"], "jsonld:School.name")
    if ident["official_website"]:
        raw_ex("official_website", "sameAs", ident["official_website"], ident["official_website"], "jsonld:School.sameAs", 0.7)
    if ident["lat"] and ident["lon"]:
        try:
            lat, lon = float(ident["lat"]), float(ident["lon"])
            raw_ex("geo_coordinates", "latitude", ident["lat"], {"lat": lat, "lon": lon}, "jsonld:School.geo", 0.7,
                   {"longitude_raw": ident["lon"]})
        except ValueError:
            pass
    m = re.search(r"Estd\.?\s*((?:18|19|20)\d{2})", t)
    if m:
        exs.append(Extraction("founding_year", m.group(0), int(m.group(1)), excerpt(t, m.start(), m.end(), 80, 60),
                              "text:ezyschooling_estd", 0.7))
    m = re.search(r"book_2\s+(.{2,80}?)\s+local_library\s+(.{2,40}?)\s+(?:push_pin|visibility)", t)
    if m:
        boards_raw = m.group(1)
        for code, fam, s, e in N.detect_curricula(boards_raw.replace(" Board", "")):
            exs.append(Extraction("curricula", boards_raw, {"code": code, "family": fam},
                                  excerpt(t, m.start(1), m.end(1), 60, 60), "text:ezyschooling_board_badge", 0.7))
        if re.search(r"\bIB\b", boards_raw) and not any(x.field_name == "curricula" and x.normalized_value["family"] == "IB" for x in exs):
            exs.append(Extraction("curricula", boards_raw, {"code": "IB", "family": "IB"},
                                  excerpt(t, m.start(1), m.end(1), 60, 60), "text:ezyschooling_board_badge", 0.7))
        g = N.parse_grade_range(m.group(2))
        if g:
            exs.append(Extraction("grades_offered", m.group(2), {"grade_min": g[0], "grade_max": g[1]},
                                  excerpt(t, m.start(2), m.end(2), 60, 60), "text:ezyschooling_classes_badge", 0.7))
    m = re.search(r"Student Teacher Ratio\s+(\d{1,2}\s*:\s*\d{1,2})", t)
    if m:
        exs.append(Extraction("student_teacher_ratio", m.group(0), m.group(1).replace(" ", ""),
                              excerpt(t, m.start(), m.end(), 60, 60), "text:ezyschooling_ratio", 0.5))
    m = re.search(r"Day/Boarding\s+(Day School|Boarding School|Day cum Boarding|Day Boarding|[A-Za-z ]{3,25}?)\s+(?:Fees|Admission|$)", t)
    if m:
        v = m.group(1).lower()
        val = "day_and_boarding" if "cum" in v or ("day" in v and "boarding" in v) else ("boarding" if "boarding" in v else ("day" if "day" in v else None))
        if val:
            exs.append(Extraction("school_type", m.group(0), val, excerpt(t, m.start(), m.end(), 40, 40),
                                  "text:ezyschooling_day_boarding", 0.7))
    m = re.search(r"location_on\s+(.{10,200}?)\s+Call School", t)
    if m:
        exs.append(Extraction("address", m.group(1), N_ws(m.group(1)),
                              excerpt(t, m.start(1), m.end(1), 20, 20), "text:ezyschooling_location", 0.7))
        st = state_from_address(m.group(1), ctx.cfg.validation_rules.get("india_states", []))
        if st:
            exs.append(Extraction("state", st[0], st[1], excerpt(t, m.start(1) + st[2], m.start(1) + st[3], 60, 20),
                                  "text:ezyschooling_address_state", 0.7))
    for ex in exs:
        out["evidence"].append(to_evidence(sid, ex, snap, doc, source_type=TIER, source_id=SOURCE_ID, raw_html=raw))

    # fee table -----------------------------------------------------------------
    fee_url = profile_url.rstrip("/") + "/fees-structure"
    try:
        fsnap = ctx.fetcher.fetch(fee_url)
        fdoc = ctx.load_document(fsnap)
        fee = parse_fee_table(fdoc.text)
        if fee:
            out["evidence"].append(to_evidence(sid, fee, fsnap, fdoc, source_type=TIER, source_id=SOURCE_ID))
    except (AccessBlocked, FetchError) as exc:
        out["checks"]["third_party_fee"] = {"status": "failed", "detail": exc.reason}
    out["checks"]["third_party_crosscheck"] = {"status": "done", "detail": f"ezyschooling profile parsed: {len(out['evidence'])} evidence records"}
    return out


FEE_ROW_RE = re.compile(
    r"(Pre[\s-]?Nursery|Nursery|LKG|UKG|Pre[\s-]?KG|KG|Class \d{1,2}|Grade \d{1,2})\s+(?:[A-Za-z ]{0,25}?)\s*Total Fee\s+"
    r"(?:₹([\d,]+)\s*/month\s+)?₹([\d,]+)\s*/year")  # some fee pages show only the /year total


def parse_fee_table(text: str) -> Extraction | None:
    head = re.search(r"Fee Structure for ((?:20\d{2})\s*-\s*(?:20\d{2}))", text)
    if not head:
        return None
    region_end = text.find("These fee structures", head.end())
    region = text[head.start(): region_end if region_end > 0 else head.end() + 6000]
    rows = []
    for m in FEE_ROW_RE.finditer(region):
        annual = int(m.group(3).replace(",", ""))
        rows.append((m.group(1), annual, m))
    if not rows:
        return None
    lo = min(rows, key=lambda r: r[1])
    hi = max(rows, key=lambda r: r[1])
    first, last = rows[0][2], rows[-1][2]
    s = head.start()
    e = head.start() + last.end()
    raw_excerpt = text[s:e]
    # raw_value = the exact row text(s) carrying the min and max annual amounts
    raw_value = lo[2].group(0) if lo is hi or lo[1] == hi[1] else f"{lo[2].group(0)} … {hi[2].group(0)}"
    return Extraction(
        "annual_fee", raw_value,
        {"min": lo[1], "max": hi[1], "currency": "INR", "period": "annual", "fee_type": "unspecified",
         "academic_year": N.parse_academic_year(head.group(1)),
         "grade_min": N.grade_to_number(lo[0]), "grade_max": N.grade_to_number(hi[0]),
         "grade_basis_raw": f"min at {lo[0]}, max at {hi[0]}; {len(rows)} grade rows"},
        raw_excerpt if len(raw_excerpt) <= 3000 else raw_excerpt[:3000],
        "text:ezyschooling_fee_table", 0.7,
        {"rows": [{"grade": r[0], "annual": r[1]} for r in rows], "raw_value_note": "min/max of per-grade '/year' totals",
         "excerpt_location": "text"})


# ---------------------------------------------------------------- discovery

def listing_url(board_slug: str, city_slug: str) -> str:
    return f"{BASE}/admissions/{board_slug}-school-admission-in-{city_slug}"


def discover(ctx: Context, board_slug: str, city: dict, limit: int) -> tuple[list[dict], dict]:
    """Return candidate dicts from one listing page plus a check record."""
    url = listing_url(board_slug, city["ezyschooling_slug"])
    try:
        snap = ctx.fetcher.fetch(url)
    except (AccessBlocked, FetchError) as exc:
        return [], {"url": url, "status": "blocked" if isinstance(exc, AccessBlocked) else "failed", "detail": exc.reason}
    from bs4 import BeautifulSoup

    html = snap.read_text(ctx.fetcher.store.raw_dir)
    soup = BeautifulSoup(html, "lxml")
    found: dict[str, dict] = {}
    for a in soup.find_all("a", href=True):
        href = urljoin(BASE, a["href"].split("?")[0])
        m = PROFILE_RE.match(href)
        if not m or href in found:
            continue
        node, card = a, None
        for _ in range(8):
            node = node.parent
            if node is None:
                break
            txt = N_ws(node.get_text(" "))
            if ("Monthly Fees" in txt or "Board:" in txt) and len(txt) < 2500:
                card = txt
                break
        if not card:
            continue
        fee_m = re.search(r"Monthly Fees\s*₹\s*([\d.]+)\s*([KkLl])?", card)
        monthly = None
        if fee_m:
            mult = {"k": 1000, "l": 100000}.get((fee_m.group(2) or "").lower(), 1)
            monthly = int(float(fee_m.group(1)) * mult)
        board_m = re.search(r"Board:\s*(.+?)\s+Classes:", card)
        found[href] = {
            "profile_url": href,
            "card_text": card[:400],
            "listing_monthly_fee_inr": monthly,
            "listing_boards": board_m.group(1) if board_m else None,
            "listing_url": url,
            "listing_board": board_slug,
            "city": city["city"], "state": city["state"],
        }
        if len(found) >= limit:
            break
    return list(found.values()), {"url": url, "status": "done", "detail": f"{len(found)} candidates"}


def N_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


# ------------------------------------------------------- sitemap discovery

# Listing pages show ~27 schools; their "load more" API refuses non-browser requests (HTTP 403,
# not bypassed). The public sitemaps (robots.txt: Allow /) enumerate every profile instead.
SITEMAP_INDEX = f"{BASE}/sitemap.xml"
_LOC_RE = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>")
_SITEMAP_SLUG_RE = re.compile(r"/all-schools-sitemap-([a-z0-9-]+)\.xml$")


def sitemap_city_slugs(ctx: Context) -> tuple[list[str], dict]:
    """City slugs that have an all-schools sitemap, in sitemap-index order."""
    try:
        snap = ctx.fetcher.fetch(SITEMAP_INDEX)
    except (AccessBlocked, FetchError) as exc:
        return [], {"url": SITEMAP_INDEX, "status": "blocked" if isinstance(exc, AccessBlocked) else "failed",
                    "detail": exc.reason}
    slugs = []
    for loc in _LOC_RE.findall(snap.read_text(ctx.fetcher.store.raw_dir)):
        m = _SITEMAP_SLUG_RE.search(loc)
        if m and m.group(1) not in slugs:
            slugs.append(m.group(1))
    return slugs, {"url": SITEMAP_INDEX, "status": "done", "detail": f"{len(slugs)} city sitemaps"}


def sitemap_profile_urls(ctx: Context, city_slug: str) -> tuple[list[str], dict]:
    """Unique school profile URLs (no /fees-structure, /reviews sub-pages) from one city sitemap."""
    url = f"{BASE}/all-schools-sitemap-{city_slug}.xml"
    try:
        snap = ctx.fetcher.fetch(url)
    except (AccessBlocked, FetchError) as exc:
        return [], {"url": url, "status": "blocked" if isinstance(exc, AccessBlocked) else "failed", "detail": exc.reason}
    out: list[str] = []
    seen: set[str] = set()
    for loc in _LOC_RE.findall(snap.read_text(ctx.fetcher.store.raw_dir)):
        if PROFILE_RE.match(loc):
            u = loc.rstrip("/")
            if u not in seen:
                seen.add(u)
                out.append(u)
    return out, {"url": url, "status": "done", "detail": f"{len(out)} profiles"}


_PROFILE_FEE_ROW_RE = re.compile(
    r"(Pre[\s-]?Nursery|Play\s?group|Nursery|LKG|UKG|Pre[\s-]?KG|KG|Class \d{1,2}|Grade \d{1,2})"
    r"(?:\s*\([^)]{1,10}\))?\s+₹([\d,]+)\s+₹([\d,]+)")


def parse_listed_fee(text: str) -> dict | None:
    """Annual fee range shown in a profile's fee table (third-party; used for screening only).

    Profile tables read 'Class 1 ₹11,667 ₹1,40,000 …' (monthly, annual, first-year total);
    the /fees-structure page reads '… Total Fee ₹x /month ₹y /year'.
    """
    head = re.search(r"Fee Structure for ((?:20\d{2})\s*-\s*(?:20\d{2}))", text)
    if not head:
        return None
    region = text[head.start(): head.start() + 8000]
    by_grade: dict[int, int] = {}
    annual: list[int] = []
    for m in list(_PROFILE_FEE_ROW_RE.finditer(region)) + list(FEE_ROW_RE.finditer(region)):
        a = int(m.group(3).replace(",", ""))
        if a <= 0:
            continue
        annual.append(a)
        g = N.grade_to_number(m.group(1))
        if g is not None:
            by_grade[g] = max(by_grade.get(g, 0), a)  # several sessions may be listed; keep the higher
    if not annual:
        return None
    return {"min": min(annual), "max": max(annual), "session": N_ws(head.group(1)), "rows": len(annual),
            "by_grade": {str(k): v for k, v in sorted(by_grade.items())}}


# Profile 'additionalProperty' flags shown to Sales (Yes/No facilities). Ratings are reported separately.
FACILITY_NAMES = [
    "Smart Classes", "Robotics Lab", "Computer Lab", "Language Lab", "Science Lab", "Wifi", "Student Tracking App",
    "GPS Bus Tracking App", "AC Classes", "Library/Reading Room", "Auditorium/Media Room", "CCTV", "Transportation",
    "Meals", "Day care", "Boys Hostel", "Girls Hostel", "Swimming Pool", "Gym", "Horse Riding", "Playground",
    "Outdoor Sports", "Indoor Sports", "Medical Room", "Alumni Association", "Ramps", "Elevators", "Music", "Dance",
    "Drama", "Art and Craft", "Debate", "Yoga", "Skating", "Karate", "Taekwondo", "Gardening", "Picnics and excursion",
    "Cafeteria/Canteen", "Washrooms"]


def profile_details(doc) -> dict:
    """Descriptive profile facts for the directory (third-party listing data; never merged into school facts).

    Deliberately excludes the profile's contactPoint phone/email: Ezyschooling gates phone numbers behind a
    lead form and the email is sometimes a named person's address (engine rule: no personal contact data).
    """
    node = _school_node(doc) or {}
    props = {p.get("name"): p.get("value") for p in node.get("additionalProperty") or [] if isinstance(p, dict)}
    addr = node.get("address") or {}
    if isinstance(addr, dict):
        parts = [addr.get(k) for k in ("streetAddress", "addressLocality", "addressRegion")]
        addr_txt = ", ".join(N_ws(str(x)).replace("_", " ") for x in parts if x)
        if addr.get("postalCode"):
            addr_txt += f" {addr['postalCode']}"
    else:
        addr_txt = N_ws(str(addr)) or None
    certs = [c.get("name") for c in node.get("hasCertification") or [] if isinstance(c, dict) and c.get("name")]
    views = (node.get("interactionStatistic") or {}) if isinstance(node.get("interactionStatistic"), dict) else {}
    t = doc.text
    estd = re.search(r"Estd\.?\s*((?:18|19|20)\d{2})", t)
    rating = re.search(r"Write a Review\s+([0-5](?:\.\d)?)\s*/\s*5\s+verified\s+(\d+)\s+Verified", t)
    adm = re.search(r"Admissions\s+(Ongoing|Closed|Open|Upcoming|Not Started)\b", t)
    return {
        "addr": addr_txt or None,
        "alt": node.get("alternateName") if isinstance(node.get("alternateName"), str) else None,
        "certs": certs,
        "classes": props.get("Classes Available"),
        "gender": props.get("School Gender"),
        "type": props.get("School Type"),
        "medium": props.get("Medium of Instruction"),
        "session": props.get("Academic Session"),
        "ratio": props.get("Student Teacher Ratio"),
        "estd": int(estd.group(1)) if estd else None,
        "admissions": adm.group(1) if adm else None,
        "rating": float(rating.group(1)) if rating else None,
        "reviews": int(rating.group(2)) if rating else None,
        "views": views.get("userInteractionCount"),
        "facilities": [f for f in FACILITY_NAMES if props.get(f) == "Yes"],
    }


def screen_profile(ctx: Context, profile_url: str) -> dict:
    """One fetch per profile: identity, listed boards, listed annual fee. Prioritisation data, never facts."""
    try:
        snap = ctx.fetcher.fetch(profile_url)
    except (AccessBlocked, FetchError) as exc:
        return {"status": "blocked" if isinstance(exc, AccessBlocked) else "failed", "detail": exc.reason}
    doc = ctx.load_document(snap)
    ident = parse_profile_identity(doc)
    m = re.search(r"book_2\s+(.{2,80}?)\s+local_library", doc.text)
    boards_raw = m.group(1) if m else None
    families = sorted({fam for _c, fam, _s, _e in N.detect_curricula((boards_raw or "").replace(" Board", ""))})
    if boards_raw and re.search(r"\bIB\b", boards_raw) and "IB" not in families:
        families = sorted(families + ["IB"])
    return {"status": "done", "name": ident["name"], "locality": ident["locality"], "city": ident["city"],
            "official_website": ident["official_website"], "lat": ident["lat"], "lon": ident["lon"],
            "boards_raw": boards_raw, "board_families": families, "listed_fee": parse_listed_fee(doc.text),
            "details": profile_details(doc), "snapshot_sha256": snap.sha256}
