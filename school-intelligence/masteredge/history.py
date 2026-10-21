"""Curriculum history from dated evidence.

Event types (all carry dated evidence):
* archive_first_observed     - earliest examined Wayback snapshot of an official page
                               that mentions the curriculum. NOT an adoption date.
* archive_not_yet_observed   - an examined earlier snapshot of the same page that did
                               not mention it (bounds the first-observed date).
* archive_no_longer_observed - mentioned in an earlier snapshot, absent from later
                               examined snapshots of the same page.
* official_site_claim        - dated statement on the live official site
                               (e.g. "IB World School since 2008").
* ib_registry_authorisation / ib_registry_school_since - from archived IB directory pages.
"""

from __future__ import annotations

from . import normalize as N
from .extract import Extraction, extract_curricula
from .http import AccessBlocked, FetchError
from .textify import excerpt
from .adapters import wayback
from .adapters.base import Context, to_evidence


def research_history(ctx: Context, record: dict, urls: list[str], current_codes: set[str] | None = None) -> dict:
    cfg = ctx.cfg.research["historical_research"]
    out = {"evidence": [], "check": None, "observations": [], "examined_urls": set()}
    sid = record["school_id"]
    examined = 0
    errors = []
    for url in [u for u in dict.fromkeys(urls) if u]:
        try:
            rows = wayback.cdx_snapshots(ctx, url, from_year=cfg.get("earliest_year"))
        except (AccessBlocked, FetchError) as exc:
            errors.append(f"CDX {url}: {exc.reason}")
            continue
        rows = wayback.pick_evenly(rows, cfg.get("max_snapshots_per_url", 4))
        obs = []
        for r in rows:
            snap = wayback.fetch_snapshot(ctx, r["timestamp"], r["original"])
            if not snap:
                errors.append(f"snapshot {r['timestamp']} {r['original']} unavailable")
                continue
            examined += 1
            out["examined_urls"].add(snap.final_url or snap.url)
            doc = ctx.load_document(snap)
            # same filters as live extraction (candidate status, bios, newsletters, blogs are not offerings)
            codes = {}
            for ex in extract_curricula(doc):
                s = doc.text.find(ex.raw_value, max(0, doc.text.find(ex.evidence_excerpt)))
                if s >= 0:
                    codes.setdefault(ex.normalized_value["code"], (ex.normalized_value["family"], s, s + len(ex.raw_value)))
            obs.append({"ts": r["timestamp"], "date": wayback.ts_to_date(r["timestamp"]), "snap": snap, "doc": doc,
                        "codes": codes, "page": url})
        out["observations"].append({"page": url, "snapshots": [{"date": o["date"], "codes": sorted(o["codes"])} for o in obs]})
        out["evidence"].extend(_events_for_page(sid, obs, current_codes or set()))
    if examined == 0:
        status = "failed" if errors else "not_publicly_available"
        out["check"] = {"status": status, "detail": "; ".join(errors[:3]) or "no archived snapshots of official pages"}
    else:
        out["check"] = {"status": "done", "detail": f"{examined} archived snapshots examined across {len(out['observations'])} pages",
                        "errors": errors[:5]}
    return out


def _events_for_page(sid: str, obs: list[dict], current_codes: set[str] = frozenset()) -> list[dict]:
    evidence = []
    if not obs:
        return evidence
    all_codes = sorted({c for o in obs for c in o["codes"]})
    for code in all_codes:
        present = [o for o in obs if code in o["codes"]]
        first = present[0]
        fam, s, e = first["codes"][code]
        ex = Extraction("curriculum_history", first["doc"].text[s:e],
                        {"event_type": "archive_first_observed", "code": code, "family": fam,
                         "date": first["date"], "year": int(first["date"][:4]), "page": first["page"]},
                        excerpt(first["doc"].text, s, e, 100, 120), "archive:wayback_curriculum_mention", 0.7,
                        {"archive_snapshot": first["ts"],
                         "caveat": "earliest examined snapshot mentioning this curriculum; not an adoption date"})
        evidence.append(to_evidence(sid, ex, first["snap"], first["doc"], source_type="archive", source_id="wayback",
                                    pub_date=first["date"]))
        before = [o for o in obs if o["ts"] < first["ts"] and code not in o["codes"] and len(o["doc"].text) > 500]
        if before:
            b = before[-1]
            evidence.append(_absence_event(sid, b, code, fam, "archive_not_yet_observed"))
        last = present[-1]
        after = [o for o in obs if o["ts"] > last["ts"] and code not in o["codes"] and len(o["doc"].text) > 500]
        # A redesigned page that stops listing a curriculum the live official site still states is not a change.
        if after and code not in current_codes:
            evidence.append(_absence_event(sid, after[0], code, fam, "archive_no_longer_observed"))
    return evidence


def _absence_event(sid: str, o: dict, code: str, fam: str, event_type: str) -> dict:
    """Absence evidence: excerpt is the page title / opening text proving which page was examined."""
    t = o["doc"].text
    raw = t[:120]
    ex = Extraction("curriculum_history", raw,
                    {"event_type": event_type, "code": code, "family": fam, "date": o["date"],
                     "year": int(o["date"][:4]), "page": o["page"]},
                    raw, "archive:wayback_absence_check", 0.5,
                    {"archive_snapshot": o["ts"], "caveat": "absence of a mention on one archived page; weak evidence"})
    return to_evidence(sid, ex, o["snap"], o["doc"], source_type="archive", source_id="wayback", pub_date=o["date"])
