"""Official school website adapter: identity check, focused crawl, extraction."""

from __future__ import annotations

import re
from urllib.parse import urlsplit

from .. import extract as X
from ..extract import Extraction
from ..http import AccessBlocked, FetchError
from ..textify import excerpt
from .base import (Context, city_variants, name_tokens, registrable_host, to_evidence)

SOURCE_ID = "official_site"
TIER = "official_school_site"

LINK_KEYWORDS = [
    (r"fee", 10), (r"curricul", 9), (r"academic", 8), (r"about|overview|at-a-glance|glance|who-we-are", 8),
    (r"disclosure|mandatory", 8), (r"admission", 7), (r"programme|program|\bib\b|pyp|myp|diploma|cbse|icse|igcse|cambridge|a-level", 6),
    (r"contact", 5), (r"history|legacy|journey|milestone", 5), (r"leadership|principal|management|team", 4),
    (r"facilit|infrastructure|campus", 2),
]
SKIP_RE = re.compile(r"/(?:blogs?|news|events?|articles?|press|media|gallery|photos?|videos?|careers?|jobs|login|"
                     r"thank-you|wp-admin|wp-json|feed|tag|category|author|page/\d+|cart|privacy|cookie|terms)(?:/|$)|"
                     r"\.(?:jpg|jpeg|png|gif|webp|svg|zip|docx?|xlsx?|pptx?|mp4|mp3)$", re.I)
PDF_KEYWORDS_RE = re.compile(r"fee|disclosure|prospectus|affiliation", re.I)


def _in_scope(url: str, home: str) -> bool:
    if registrable_host(url) != registrable_host(home):
        return False
    hp = urlsplit(home).path.rstrip("/")
    if hp and not urlsplit(url).path.lower().startswith(hp.lower()):
        return False
    return url.startswith(("http://", "https://"))


def _score_link(url: str, anchor: str) -> int:
    hay = (urlsplit(url).path + " " + anchor).lower()
    return sum(w for p, w in LINK_KEYWORDS if re.search(p, hay))


# One page per information need first, then fill remaining slots by score.
CATEGORY_PATTERNS = [
    ("fees", r"fee"), ("curriculum", r"curricul|programme|program|\bib\b|cbse|icse|igcse|cambridge"),
    ("about", r"about|overview|glance|who-we-are"), ("disclosure", r"disclosure|mandatory"),
    ("admissions", r"admission"), ("contact", r"contact"), ("history", r"history|legacy|journey|milestone"),
    ("leadership", r"leadership|principal|management|team"), ("academics", r"academic"),
]
LOW_VALUE_RE = re.compile(r"trip|sport|wellness|communit|placement|club|cultural|literary|testimonial|alumni|calendar|holiday|transport|uniform|canteen|menu", re.I)


def _select_pages(candidates: dict[str, int], n: int) -> list[str]:
    scored = {u: sc - (6 if LOW_VALUE_RE.search(urlsplit(u).path) else 0) for u, sc in candidates.items()}
    ordered = sorted(scored, key=lambda u: (-scored[u], len(u)))
    picked: list[str] = []
    for _, pat in CATEGORY_PATTERNS:
        for u in sorted(ordered, key=len):
            if u not in picked and re.search(pat, urlsplit(u).path, re.I) and not LOW_VALUE_RE.search(urlsplit(u).path):
                picked.append(u)
                break
    for u in ordered:
        if len(picked) >= n:
            break
        if u not in picked and scored[u] > 0:
            picked.append(u)
    return picked[:n]


def identity_check(doc, name: str, campus: str | None) -> dict:
    head = (doc.title + " " + doc.meta.get("og:site_name", "") + " " + doc.text[:6000]).lower()
    toks = name_tokens(name)
    found = [t for t in toks if re.search(rf"\b{re.escape(t)}\b", head)]
    ratio = len(found) / len(toks) if toks else 0.0
    campus_found = None
    if campus:
        campus_found = bool(re.search(rf"\b{re.escape(campus.lower())}\b", doc.text.lower()))
    # The brand may only appear in a logo image: accept when every distinctive name token is part of the
    # official domain AND also occurs somewhere in the page text.
    domain = registrable_host(doc.url).replace("-", "")
    domain_match = bool(toks) and all(t in domain for t in toks) and all(t in doc.text.lower() for t in toks)
    return {"passed": ratio >= 0.5 or domain_match, "domain_match": domain_match, "name_tokens": toks, "tokens_found": found, "token_ratio": round(ratio, 2),
            "campus_found": campus_found, "title": doc.title}


def research(ctx: Context, record: dict, standalone_domain: bool) -> dict:
    cfg = ctx.cfg
    sid = record["school_id"]
    seed = record["input"]
    home = record.get("official_website_url")
    result = {"evidence": [], "checks": {}, "pages": [], "ib_codes": [], "curriculum_page": None,
              "refetched_urls": set(), "identity": None}
    if not home:
        result["checks"]["official_website_identity"] = {"status": "failed", "detail": "No official website known"}
        result["checks"]["official_site_crawl"] = {"status": "skipped", "detail": "No official website"}
        return result
    try:
        snap = ctx.fetcher.fetch(home)
    except AccessBlocked as exc:
        result["checks"]["official_website_identity"] = {"status": "blocked", "detail": exc.reason}
        result["checks"]["official_site_crawl"] = {"status": "blocked", "detail": exc.reason}
        return result
    except FetchError as exc:
        result["checks"]["official_website_identity"] = {"status": "failed", "detail": exc.reason}
        result["checks"]["official_site_crawl"] = {"status": "failed", "detail": exc.reason}
        return result
    doc = ctx.load_document(snap)
    ident = identity_check(doc, seed["name"], seed.get("campus"))
    result["identity"] = ident
    if not ident["passed"]:
        result["checks"]["official_website_identity"] = {
            "status": "failed", "detail": f"Name tokens {ident['name_tokens']} not found on {home} (title: {doc.title!r})"}
        result["checks"]["official_site_crawl"] = {"status": "skipped", "detail": "identity not confirmed"}
        return result
    result["checks"]["official_website_identity"] = {
        "status": "done", "detail": f"tokens found {ident['tokens_found']} in title/header; campus_found={ident['campus_found']}"}

    # identity evidence ----------------------------------------------------
    id_ex: list[Extraction] = []
    title_pos = doc.text.find(doc.title) if doc.title else -1
    if title_pos >= 0:
        id_ex.append(Extraction("official_website", doc.title, snap.final_url or home,
                                excerpt(doc.text, title_pos, title_pos + len(doc.title), 0, 40),
                                "identity:title_token_match", 0.9, {"identity": ident}))
    for fname, value in (("school_name", seed["name"]), ("campus", seed.get("campus"))):
        if not value:
            continue
        m = re.search(re.escape(value), doc.text, re.I)
        if m:
            id_ex.append(Extraction(fname, m.group(0), value, excerpt(doc.text, m.start(), m.end(), 40, 80),
                                    "identity:exact_phrase_on_official_site", 0.9))
    pages = [(snap, doc)]

    # focused crawl -----------------------------------------------------------
    max_pages = cfg.http["max_pages_per_official_site"]
    candidates: dict[str, int] = {}
    pdfs: dict[str, int] = {}
    for href, anchor in doc.links:
        if not _in_scope(href, home) or href.rstrip("/") == home.rstrip("/"):
            continue
        if href.lower().endswith(".pdf"):
            if PDF_KEYWORDS_RE.search(href + " " + anchor):
                pdfs[href] = _score_link(href, anchor)
            continue
        if SKIP_RE.search(href) or X.is_editorial(href):
            continue
        sc = _score_link(href, anchor)
        if sc > 0:
            candidates[href] = max(candidates.get(href, 0), sc)
    ordered = _select_pages(candidates, max_pages - 1)
    errors = []
    for url in ordered:
        try:
            s = ctx.fetcher.fetch(url)
        except FetchError as exc:
            errors.append(f"{url}: {exc.reason}")
            continue
        if "html" not in (s.content_type or "html") and "pdf" not in (s.content_type or ""):
            continue
        pages.append((s, ctx.load_document(s)))
        # PDFs linked from subpages (fee structures / mandatory disclosure)
        for href, anchor in pages[-1][1].links:
            if href.lower().endswith(".pdf") and registrable_host(href) == registrable_host(home) and PDF_KEYWORDS_RE.search(href + " " + anchor):
                pdfs.setdefault(href, _score_link(href, anchor))
    for url, _ in sorted(pdfs.items(), key=lambda kv: -kv[1])[: cfg.http["max_pdfs_per_official_site"]]:
        try:
            s = ctx.fetcher.fetch(url, max_bytes=cfg.http["max_pdf_bytes"])
            pages.append((s, ctx.load_document(s)))
        except FetchError as exc:
            errors.append(f"{url}: {exc.reason}")
        except Exception as exc:  # malformed PDF -> logged, never fatal
            errors.append(f"{url}: PDF parse error {type(exc).__name__}")

    # Re-extract every previously examined page from its stored snapshot so that rule
    # changes apply consistently (stale evidence is then superseded, never deleted).
    fetched = {s.final_url or s.url for s, _ in pages} | {s.url for s, _ in pages}
    prior_urls = {p["url"] for p in record.get("analysis", {}).get("official_pages_examined", [])}
    prior_urls |= {e["source_url"] for e in record.get("evidence", []) if e["source_type"] == TIER}
    for prev_url in sorted(prior_urls):
        if prev_url in fetched:
            continue
        old = ctx.fetcher.store.latest(prev_url)
        if old is not None:
            try:
                pages.append((old, ctx.load_document(old)))
                fetched.add(prev_url)
            except Exception as exc:  # unreadable legacy snapshot is logged, not fatal
                errors.append(f"{prev_url}: re-extract failed {type(exc).__name__}")

    # extraction --------------------------------------------------------------
    best_curr = (0, None)
    for s, d in pages:
        result["refetched_urls"].add(s.final_url or s.url)
        exs = X.extract_all(d, standalone_domain)
        if s is snap:
            exs = id_ex + exs
        # city / state mentions (identity facts with excerpts)
        for city in city_variants(seed.get("city", "")):
            # a city named in transport/fee context ("Mumbai Students - Rs. 56500/- per year") says where pupils
            # travel from, not where the school is
            m = next((x for x in re.finditer(rf"\b{re.escape(city)}\b", d.text, re.I)
                      if not re.search(r"transport|bus (?:route|fee|charges)|pick[\s-]?up|drop", d.text[max(0, x.start() - 80):x.end() + 30], re.I)
                      and not re.match(r"\s*students?\b", d.text[x.end():x.end() + 12], re.I)), None)
            if m:
                exs.append(Extraction("city", m.group(0), seed["city"], excerpt(d.text, m.start(), m.end(), 80, 80),
                                      "identity:city_mention_on_official_site", 0.75))
                break
        if seed.get("state"):
            m = re.search(rf"\b{re.escape(seed['state'])}\b", d.text, re.I)
            if m:
                exs.append(Extraction("state", m.group(0), seed["state"], excerpt(d.text, m.start(), m.end(), 80, 80),
                                      "identity:state_mention_on_official_site", 0.75))
        ncurr = len({e.normalized_value["code"] for e in exs if e.field_name == "curricula"})
        if ncurr > best_curr[0] and d.kind == "html":
            best_curr = (ncurr, s.final_url or s.url)
        for ex in exs:
            ev = to_evidence(sid, ex, s, d, source_type=TIER, source_id=SOURCE_ID)
            result["evidence"].append(ev)
            if ex.field_name == "affiliation_details" and ex.normalized_value.get("type") == "ib_school_code":
                result["ib_codes"].append(ex.normalized_value["id"])
        result["pages"].append({"url": s.final_url or s.url, "title": d.title[:150], "sha256": s.sha256,
                                "kind": d.kind, "retrieved_at": s.retrieved_at})
    result["curriculum_page"] = best_curr[1]
    result["ib_codes"] = sorted(set(result["ib_codes"]))
    result["checks"]["official_site_crawl"] = {
        "status": "done", "detail": f"{len(pages)} documents ({sum(1 for _, d in pages if d.kind == 'pdf')} PDF); errors: {len(errors)}",
        "errors": errors[:10]}
    return result
