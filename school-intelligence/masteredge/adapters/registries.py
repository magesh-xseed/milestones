"""Official registry adapters and access probes.

Live registry access is attempted only through public, unauthenticated pages that
robots.txt permits. Anti-bot challenges, CAPTCHAs, 403s and robots disallows are
recorded as BLOCKED; nothing is done to get around them.
"""

from __future__ import annotations

import os
import re

from .. import normalize as N
from ..extract import Extraction
from ..http import AccessBlocked, FetchError
from ..textify import excerpt
from . import wayback
from .base import Context, name_tokens, to_evidence


# ---------------------------------------------------------------- probes

def probe_source(ctx: Context, src: dict) -> dict:
    """Check robots.txt + a single GET for a registry source. Never retries around a block."""
    from ..util import utc_now

    base = {"id": src["id"], "name": src["name"], "url": src.get("url"), "tier": src["tier"],
            "responsibility": src.get("responsibility"), "checked_at": utc_now()}
    if not src.get("enabled", True):
        return {**base, "access": "DISABLED", "reason": "disabled in config/sources.json"}
    if src.get("adapter") == "api_key":
        missing = [k for k in src.get("api_key_env", []) if not os.environ.get(k)]
        if missing:
            return {**base, "access": "BLOCKED", "reason": f"API credentials not configured: {', '.join(missing)}"}
        return {**base, "access": "ACCESSIBLE", "reason": "API credentials present"}
    probe = src.get("probe_url") or src.get("url")
    if not probe:
        return {**base, "access": "ACCESSIBLE", "reason": "per-school source (checked per fetch)"}
    allowed, note = ctx.fetcher.robots_allowed(probe)
    if not allowed:
        return {**base, "access": "BLOCKED", "reason": f"robots.txt disallows {probe} ({note})", "robots": note}
    try:
        snap = ctx.fetcher.fetch(probe, use_cache=False, check_robots=False)
        return {**base, "access": "ACCESSIBLE", "reason": f"HTTP {snap.status}", "robots": note}
    except AccessBlocked as exc:
        return {**base, "access": "BLOCKED", "reason": exc.reason, "robots": note}
    except FetchError as exc:
        return {**base, "access": "ERROR", "reason": exc.reason, "robots": note}


# ---------------------------------------------------------------- CBSE SARAS

SARAS_URL = "https://saras.cbse.gov.in/SARAS/AffiliatedList/ListOfSchdirReport"


def saras_search(ctx: Context, record: dict) -> dict:
    """Keyword search on the public SARAS directory form. Returns check + evidence."""
    from bs4 import BeautifulSoup

    out = {"evidence": [], "check": None}
    if not ctx.source_accessible("cbse_saras"):
        st = ctx.source_status.get("cbse_saras", {})
        out["check"] = {"status": "blocked", "detail": f"CBSE SARAS: {st.get('reason', 'not accessible')}"}
        return out
    seed = record["input"]
    try:
        allowed, note = ctx.fetcher.robots_allowed(SARAS_URL)
        if not allowed:
            raise AccessBlocked(SARAS_URL, f"robots.txt disallows ({note})")
        sess = ctx.fetcher.session
        r = sess.get(SARAS_URL, timeout=ctx.fetcher.timeout)
        soup = BeautifulSoup(r.text, "lxml")
        form = soup.find("form", action="/SARAS/AffiliatedList/ListOfSchdirReport")
        token = form.find("input", {"name": "__RequestVerificationToken"})["value"] if form else ""
        kw = name_tokens(seed["name"])[0].upper()
        resp = sess.post(SARAS_URL, data={"MainRadioValue": "SearchMainRadioKeyword_wise", "InstName_orAddress": kw,
                                          "__RequestVerificationToken": token, "__Invariant": "RegiAffNo"},
                         headers={"Referer": SARAS_URL}, timeout=ctx.fetcher.timeout)
        if resp.status_code in (401, 403, 429):
            raise AccessBlocked(SARAS_URL, f"HTTP {resp.status_code} on directory search")
        if resp.status_code != 200:
            raise FetchError(SARAS_URL, f"HTTP {resp.status_code}")
    except AccessBlocked as exc:
        ctx.source_status["cbse_saras"] = {**ctx.source_status.get("cbse_saras", {}), "access": "BLOCKED",
                                           "reason": f"search: {exc.reason}"}
        out["check"] = {"status": "blocked", "detail": f"CBSE SARAS search: {exc.reason}"}
        return out
    except Exception as exc:  # network errors, missing form
        out["check"] = {"status": "failed", "detail": f"CBSE SARAS search error: {type(exc).__name__}: {exc}"}
        return out
    # Successful response: keep the raw result page as a snapshot so evidence is re-checkable.
    snap = ctx.fetcher.store.put(SARAS_URL + f"#q={kw}", resp.url, resp.status_code,
                                 resp.headers.get("content-type", ""), resp.content, None)
    doc = ctx.load_document(snap)
    city = seed.get("city", "").upper()
    rows = 0
    for m in re.finditer(r"(\d{6,8})\s*(?:/|\s)\s*(\d{5})?[^|]{0,400}?" + re.escape(kw), doc.text, re.I):
        rows += 1
        window = doc.text[m.start(): m.end() + 400]
        if city and city.lower() not in window.lower():
            continue
        ex = Extraction("affiliation_details", m.group(1), {"board": "CBSE", "type": "affiliation_number", "id": m.group(1)},
                        excerpt(doc.text, m.start(), m.end(), 20, 300), "registry:saras_keyword_search", 0.6,
                        {"note": "keyword+city match; confirm name in excerpt"})
        out["evidence"].append(to_evidence(record["school_id"], ex, snap, doc, source_type="official_registry", source_id="cbse_saras"))
    out["check"] = {"status": "done", "detail": f"SARAS keyword '{kw}': {rows} rows, {len(out['evidence'])} city matches"}
    return out


# ---------------------------------------------------------------- IB (archived registry pages)

IB_PROG = [("IB_PYP", r"Primary Years Programme"), ("IB_MYP", r"Middle Years Programme"),
           ("IB_DP", r"Diploma Programme"), ("IB_CP", r"Career-related Programme")]


def ib_lookup(ctx: Context, record: dict, ib_code: str) -> dict:
    """Verify IB authorisation from the newest Wayback copy of the school's IB directory page."""
    out = {"evidence": [], "check": None, "history": []}
    sid = record["school_id"]
    rows = []
    try:
        for pattern in (f"ibo.org/school/{ib_code}/", f"ibo.org/en/school/{ib_code}/"):
            rows += wayback.cdx_snapshots(ctx, pattern, collapse_year=True)
    except (AccessBlocked, FetchError) as exc:
        out["check"] = {"status": "failed", "detail": f"Wayback CDX for IB {ib_code}: {exc.reason}"}
        return out
    if not rows:
        out["check"] = {"status": "not_publicly_available", "detail": f"No archived IB directory page for code {ib_code}"}
        return out
    rows.sort(key=lambda r: r["timestamp"])
    latest = rows[-1]
    snap = wayback.fetch_snapshot(ctx, latest["timestamp"], latest["original"])
    if not snap:
        out["check"] = {"status": "failed", "detail": "archived IB page could not be retrieved"}
        return out
    doc = ctx.load_document(snap)
    t = doc.text
    pub = wayback.ts_to_date(latest["timestamp"])
    country = re.search(r"Country\s*/\s*territory:\s*([A-Z ]+?)\s+Region", t)
    if not country or "INDIA" not in country.group(1).upper():
        out["check"] = {"status": "failed", "detail": f"IB code {ib_code}: archived page country is {country.group(1) if country else 'unknown'}"}
        return out
    toks = name_tokens(record["input"]["name"])
    head = (doc.title + " " + t[:800]).lower()
    if sum(1 for tk in toks if tk in head) / max(1, len(toks)) < 0.5:
        out["check"] = {"status": "failed", "detail": f"IB code {ib_code}: archived page name does not match ({doc.title})"}
        return out
    exs = []
    for code, pat in IB_PROG:
        m = re.search(pat, t)
        if m:
            exs.append(Extraction("curricula", m.group(0), {"code": code, "family": "IB"},
                                  excerpt(t, m.start(), m.end(), 60, 160), "registry:ib_archived_directory_page", 0.85,
                                  {"archive_snapshot": latest["timestamp"], "ib_code": ib_code}))
            am = re.search(r"Authori[sz]ed:\s*(\d{1,2} \w+ \d{4})", t[m.end(): m.end() + 200])
            if am:
                exs.append(Extraction("curriculum_history", am.group(0),
                                      {"event_type": "ib_registry_authorisation", "code": code, "family": "IB",
                                       "date": am.group(1), "year": int(am.group(1)[-4:])},
                                      excerpt(t, m.start(), m.end() + am.end(), 20, 40), "registry:ib_archived_authorised_date", 0.85,
                                      {"archive_snapshot": latest["timestamp"], "ib_code": ib_code}))
    sm = re.search(r"IB School since:\s*(\d{1,2} \w+ \d{4})", t)
    if sm:
        exs.append(Extraction("curriculum_history", sm.group(0),
                              {"event_type": "ib_registry_school_since", "code": "IB", "family": "IB",
                               "date": sm.group(1), "year": int(sm.group(1)[-4:])},
                              excerpt(t, sm.start(), sm.end(), 40, 40), "registry:ib_archived_school_since", 0.85,
                              {"archive_snapshot": latest["timestamp"], "ib_code": ib_code}))
    exs.append(Extraction("affiliation_details", f"IB School code: {ib_code}" if f"IB School code: {ib_code}" in t else ib_code,
                          {"board": "IB", "type": "ib_school_code", "id": ib_code},
                          excerpt(t, max(0, t.find(ib_code)), max(0, t.find(ib_code)) + len(ib_code), 40, 40),
                          "registry:ib_archived_school_code", 0.85, {"archive_snapshot": latest["timestamp"]}))
    for ex in exs:
        out["evidence"].append(to_evidence(sid, ex, snap, doc, source_type="official_registry", source_id="ib_archive", pub_date=pub))
    out["check"] = {"status": "done", "detail": f"IB {ib_code}: archived directory page {pub}, {len(exs)} facts"}
    return out


# ---------------------------------------------------------------- CISCE school locator

CISCE_RESULT = "https://locate.cisce.org/result"
CISCE_STATE_NAMES = {"Delhi": "New Delhi"}
_cisce_cache: dict[str, list[dict]] = {}


def _cisce_state_cards(ctx: Context, state: str, max_pages: int) -> list[dict]:
    """All school cards for one state (paginated, cached per run)."""
    from urllib.parse import urlencode

    from bs4 import BeautifulSoup

    key = CISCE_STATE_NAMES.get(state, state)
    if key in _cisce_cache:
        return _cisce_cache[key]
    cards = []
    for page in range(1, max_pages + 1):
        url = CISCE_RESULT + "?" + urlencode({"country": "India", "state": key, "page": page})
        snap = ctx.fetcher.fetch(url)
        html = snap.read_text(ctx.fetcher.store.raw_dir)
        doc = ctx.load_document(snap)
        found = 0
        seen_codes = {c["code"] for c in cards}
        for card in BeautifulSoup(html, "lxml").select("div.school-card"):
            text = re.sub(r"\s+", " ", card.get_text(" ")).strip()
            head = card.find("h6")
            m = re.match(r"\s*([A-Z]{2}\d{3})\s*-\s*(.+)", re.sub(r"\s+", " ", head.get_text(" ")) if head else "")
            if not m or m.group(1) in seen_codes:
                continue
            found += 1
            badges = [b.get_text(strip=True) for b in card.select(".school-badges .badge")]
            site = card.find("a", href=True, string=re.compile("Website", re.I))
            cards.append({"code": m.group(1), "name": m.group(2).strip(), "text": text, "badges": badges,
                          "website": site["href"] if site else None, "snap": snap, "doc": doc})
        if found == 0:
            break
    _cisce_cache[key] = cards
    return cards


def cisce_lookup(ctx: Context, record: dict, max_pages: int = 150) -> dict:
    """Confirm ICSE/ISC affiliation on the official CISCE school locator (public, robots-permitted)."""
    out = {"evidence": [], "check": None}
    seed = record["input"]
    if not ctx.source_accessible("cisce"):
        st = ctx.source_status.get("cisce", {})
        out["check"] = {"status": "blocked", "detail": f"CISCE: {st.get('reason', 'not accessible')}"}
        return out
    try:
        cards = _cisce_state_cards(ctx, seed.get("state", ""), max_pages)
    except (AccessBlocked, FetchError) as exc:
        out["check"] = {"status": "blocked" if isinstance(exc, AccessBlocked) else "failed", "detail": f"CISCE locator: {exc.reason}"}
        return out
    toks = name_tokens(seed["name"])
    city = (seed.get("city") or "").lower()
    matches = []
    for c in cards:
        nm = c["name"].lower()
        if all(re.search(rf"\b{re.escape(t)}\b", nm) for t in toks) and city and city in c["text"].lower():
            matches.append(c)
    if len(matches) > 1 and seed.get("campus"):
        narrowed = [c for c in matches if seed["campus"].lower() in c["text"].lower()]
        matches = narrowed or matches
    if len(matches) != 1:
        detail = "no matching school" if not matches else f"{len(matches)} ambiguous matches ({', '.join(m['code'] for m in matches)}) - not resolved"
        out["check"] = {"status": "done" if not matches else "failed",
                        "detail": f"CISCE locator {seed.get('state')}: {len(cards)} schools scanned; {detail}", "matched": False}
        return out
    c = matches[0]
    t = c["doc"].text
    pos = t.find(c["text"][:60])
    ex_txt = c["text"] if c["text"] in t else (t[pos:pos + len(c["text"])] if pos >= 0 else c["text"])
    for badge in c["badges"]:
        code = {"ICSE": "ICSE", "ISC": "ISC"}.get(badge)
        if code:
            out["evidence"].append(to_evidence(record["school_id"], Extraction(
                "curricula", badge, {"code": code, "family": "CISCE"}, ex_txt, "registry:cisce_locator_card", 0.9,
                {"cisce_code": c["code"]}), c["snap"], c["doc"], source_type="official_registry", source_id="cisce"))
    out["evidence"].append(to_evidence(record["school_id"], Extraction(
        "affiliation_details", c["code"], {"board": "CISCE", "type": "school_code", "id": c["code"]}, ex_txt,
        "registry:cisce_locator_card", 0.9), c["snap"], c["doc"], source_type="official_registry", source_id="cisce"))
    out["check"] = {"status": "done", "detail": f"CISCE locator: matched {c['code']} {c['name']}", "matched": True}
    return out
