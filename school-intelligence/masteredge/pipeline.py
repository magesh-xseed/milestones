"""End-to-end research pipeline: queue -> research -> evidence -> resolution -> analysis -> outputs."""

from __future__ import annotations

import logging
import re
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from urllib.parse import urlsplit

import jsonschema

from . import analysis as A
from .adapters import ezyschooling, official_site, registries
from .adapters.base import Context, registrable_host
from .config import Config, load_config
from .history import research_history
from .http import Fetcher, SnapshotStore
from .quality import compute_metrics
from .records import apply_retractions, merge_evidence, mark_superseded, new_school_record, resolve_fields
from .schema import MASTER_SCHEMA
from .store import Store
from .util import read_json, utc_now

log = logging.getLogger("masteredge")
TEMPLATE_TEXT_RE = re.compile(
    r"example\.(?:com|org)|lorem ipsum|\bdummy (?:text|data|school)\b|\bplaceholder\b|\bmock (?:data|school|record)\b"
    r"|\bfake (?:data|school)\b|\bmysite\.com\b|\b123[-. ]456[-. ]7890\b", re.I)

MANDATORY_CHECKS = ["official_website_identity", "official_site_crawl", "fee_research", "curriculum_research",
                    "enrollment_research", "founding_year_research", "registry_curriculum_check",
                    "third_party_crosscheck", "curriculum_history_research"]


def load_retractions(cfg: Config) -> dict[str, dict]:
    """Evidence retracted through the audited remediation step (manual_audit.json)."""
    audit = read_json(cfg.paths.manual_audit, default={}) or {}
    out = {}
    for r in audit.get("results", []):
        for eid in r.get("retract_evidence_ids", []):
            out[eid] = {"reason": r.get("note"), "audit_key": r.get("audit_key"), "at": r.get("audited_at")}
    return out


def build_context(cfg: Config, offline: bool = False) -> Context:
    store = SnapshotStore(cfg.paths.raw_dir)
    h = cfg.http
    fetcher = Fetcher(store, h["user_agent"], h["per_host_delay_seconds"], h["timeout_seconds"], h["max_retries"],
                      cfg.research.get("refresh_interval_days"), cfg.paths.output_dir / "access_log.jsonl", offline,
                      h.get("per_host_delay_overrides"))
    return Context(cfg, fetcher)


# ------------------------------------------------------------------ sources

def probe_sources(ctx: Context, store: Store, offline: bool) -> dict:
    prev = read_json(ctx.cfg.paths.source_registry, default={}) or {}
    status = {}
    if offline:
        status = {s["id"]: s for s in prev.get("sources", [])}
    else:
        for src in ctx.cfg.sources["sources"]:
            st = registries.probe_source(ctx, src)
            status[src["id"]] = st
            store.log("source_probe", source_id=src["id"], access=st["access"], reason=st.get("reason"))
    ctx.source_status = status
    return status


# ------------------------------------------------------------------ discovery

def discover(ctx: Context, store: Store, target: int) -> dict:
    dcfg = ctx.cfg.research["discovery"]
    summary = {"listings": [], "candidates_seen": 0, "profiles_fetched": 0, "enqueued": 0, "duplicates": 0,
               "rejected_no_website": 0, "rejected_outside_india": 0}
    if not ctx.source_accessible("ezyschooling"):
        summary["blocked"] = "ezyschooling not accessible"
        return summary
    cands: dict[str, dict] = {}
    for city in ctx.cfg.research["cities"]:
        for board in dcfg["listing_boards"]:
            found, chk = ezyschooling.discover(ctx, board, city, dcfg["max_candidates_per_listing"])
            summary["listings"].append(chk)
            for c in found:
                cur = cands.get(c["profile_url"])
                if cur is None:
                    cands[c["profile_url"]] = c
                else:
                    cur.setdefault("also_listed_in", []).append(c["listing_url"])
    summary["candidates_seen"] = len(cands)
    # Prioritise by the listing's published monthly fee (third-party; prioritisation only, never a fact).
    ordered = sorted(cands.values(), key=lambda c: -(c["listing_monthly_fee_inr"] or 0))
    have = sum(1 for i in store.queue if i["status"] != "rejected")
    for c in ordered:
        if have >= target:
            break
        try:
            snap = ctx.fetcher.fetch(c["profile_url"])
        except Exception as exc:  # FetchError/AccessBlocked: logged and skipped
            store.log("discovery_profile_error", url=c["profile_url"], error=str(exc))
            continue
        summary["profiles_fetched"] += 1
        ident = ezyschooling.parse_profile_identity(ctx.load_document(snap))
        if not ident["name"]:
            continue
        if ident["lat"] and ident["lon"]:
            b = ctx.cfg.validation_rules["india_bbox"]
            try:
                lat, lon = float(ident["lat"]), float(ident["lon"])
                if not (b["lat_min"] <= lat <= b["lat_max"] and b["lon_min"] <= lon <= b["lon_max"]):
                    summary["rejected_outside_india"] += 1
                    continue
            except ValueError:
                pass
        seed = {"name": ident["name"], "campus": ident["locality"], "city": c["city"], "state": c["state"],
                "official_website": ident["official_website"], "ezyschooling_url": c["profile_url"]}
        origin = {"type": "discovery", "source_id": "ezyschooling", "listing_url": c["listing_url"],
                  "listing_monthly_fee_inr": c["listing_monthly_fee_inr"], "listing_boards": c["listing_boards"],
                  "discovered_at": utc_now()}
        if dcfg.get("require_official_website") and not ident["official_website"]:
            summary["rejected_no_website"] += 1
            store.log("discovery_rejected", reason="no official website on profile", url=c["profile_url"], name=ident["name"])
            continue
        sid, new, reason = store.enqueue(seed, origin, priority=float(c["listing_monthly_fee_inr"] or 0))
        if new:
            summary["enqueued"] += 1
            have += 1
            store.log("enqueued", sid, origin="discovery", name=ident["name"])
        else:
            summary["duplicates"] += 1
            store.log("duplicate_candidate", sid, reason=reason, url=c["profile_url"])
    store.save_queue()
    return summary


def screen_qualifies(entry: dict, qcfg: dict) -> tuple[bool, str]:
    """Shortlisting rule for deep research (prioritisation on third-party listing data, never a fact)."""
    if entry.get("status") != "done" or not entry.get("name"):
        return False, "profile not screened"
    if qcfg.get("require_official_website") and not entry.get("official_website"):
        return False, "no official website on profile"
    fee_max = (entry.get("listed_fee") or {}).get("max")
    if fee_max and fee_max >= qcfg["min_listed_annual_fee_max"]:
        return True, f"listed annual fee up to {fee_max}"
    boards = set(entry.get("board_families") or []) & set(qcfg.get("board_families_always", []))
    if boards:
        return True, f"listed board {', '.join(sorted(boards))}"
    return False, "listed fee below threshold and no IB/Cambridge board"


def discover_sitemap(ctx: Context, store: Store, target: int) -> dict:
    """Screen every Ezyschooling sitemap profile (resumable), then enqueue every qualifying school."""
    scfg = ctx.cfg.research["discovery"]["sitemap"]
    summary = {"mode": "sitemap", "listings": [], "profiles_listed": 0, "profiles_screened_now": 0,
               "profiles_screened_total": 0, "screen_failed": 0, "qualified": 0, "enqueued": 0, "duplicates": 0,
               "rejected_outside_india": 0}
    if not ctx.source_accessible("ezyschooling"):
        summary["blocked"] = "ezyschooling not accessible"
        return summary
    screen_path = ctx.cfg.paths.output_dir / "discovery_screen.json"
    screen: dict[str, dict] = (read_json(screen_path, default=None) or {}).get("profiles", {})

    slugs, chk = ezyschooling.sitemap_city_slugs(ctx)
    summary["listings"].append(chk)
    prio = scfg.get("priority_city_slugs", [])
    slugs = [s for s in slugs if s not in scfg.get("exclude_city_slugs", [])]
    slugs.sort(key=lambda s: prio.index(s) if s in prio else len(prio))
    todo: list[tuple[str, str]] = []
    listed: set[str] = set()
    for slug in slugs:
        urls, chk = ezyschooling.sitemap_profile_urls(ctx, slug)
        summary["listings"].append(chk)
        for u in urls:
            if u in listed:
                continue
            listed.add(u)
            prev = screen.get(u, {})
            # re-screen failures, and entries screened before profile details existed (served from the snapshot cache)
            if prev.get("status") != "done" or "details" not in prev:
                todo.append((u, slug))
    summary["profiles_listed"] = len(listed)
    store.log("sitemap_screen_start", listed=len(listed), already_screened=len(listed) - len(todo), to_screen=len(todo))

    import threading
    lock = threading.Lock()

    def save():
        store.save_json(screen_path, {"generated_at": utc_now(), "run_id": store.run_id,
                                      "note": "Ezyschooling profile screening: listed fee/boards are third-party prioritisation data, not facts.",
                                      "profiles": screen})

    def work(u: str, slug: str):
        res = ezyschooling.screen_profile(ctx, u)
        res.update({"profile_url": u, "sitemap_city_slug": slug, "screened_at": utc_now()})
        with lock:
            screen[u] = res
            summary["profiles_screened_now"] += 1
            if summary["profiles_screened_now"] % 200 == 0:
                save()
                log.info("screened %d/%d profiles", summary["profiles_screened_now"], len(todo))

    with ThreadPoolExecutor(max_workers=scfg.get("screen_workers", 4)) as pool:
        for f in as_completed([pool.submit(work, u, s) for u, s in todo]):
            f.result()
    save()

    city_map = scfg.get("city_map", {})
    b = ctx.cfg.validation_rules["india_bbox"]
    cands = []
    for u in listed:
        e = screen.get(u) or {}
        if e.get("status") != "done":
            summary["screen_failed"] += 1
            continue
        summary["profiles_screened_total"] += 1
        ok, why = screen_qualifies(e, scfg["qualify"])
        if not ok:
            continue
        try:
            if e.get("lat") and e.get("lon") and not (b["lat_min"] <= float(e["lat"]) <= b["lat_max"]
                                                     and b["lon_min"] <= float(e["lon"]) <= b["lon_max"]):
                summary["rejected_outside_india"] += 1
                continue
        except ValueError:
            pass
        cands.append((e, why))
    summary["qualified"] = len(cands)
    cands.sort(key=lambda c: -((c[0].get("listed_fee") or {}).get("max") or 0))
    have = sum(1 for i in store.queue if i["status"] != "rejected")
    for e, why in cands:
        if have >= target:
            break
        city, state = city_map.get(e["sitemap_city_slug"], [None, None])
        if not city:  # boarding-schools sitemap: city from the profile, state only if the city is mapped
            city = e.get("city")
            state = next((st for c, st in city_map.values() if c.lower() == (city or "").lower()), None)
        if not city:
            continue
        fee = e.get("listed_fee") or {}
        seed = {"name": e["name"], "campus": e.get("locality"), "city": city, "state": state,
                "official_website": e["official_website"], "ezyschooling_url": e["profile_url"]}
        origin = {"type": "discovery", "source_id": "ezyschooling", "listing_url":
                  f"{ezyschooling.BASE}/all-schools-sitemap-{e['sitemap_city_slug']}.xml",
                  "listed_annual_fee_max_inr": fee.get("max"), "listing_boards": e.get("boards_raw"),
                  "shortlist_reason": why, "discovered_at": utc_now()}
        sid, new, reason = store.enqueue(seed, origin, priority=float(fee.get("max") or 0))
        if new:
            summary["enqueued"] += 1
            have += 1
            store.log("enqueued", sid, origin="sitemap_screen", name=e["name"], reason=why)
        else:
            summary["duplicates"] += 1
    store.save_queue()
    return summary


# ------------------------------------------------------------------ per school

def _standalone(url: str | None, domain_counts: dict[str, int]) -> bool:
    if not url:
        return False
    return domain_counts.get(registrable_host(url), 0) <= 1 and urlsplit(url).path.strip("/") == ""


def research_school(ctx: Context, rec: dict, settings: dict, standalone: bool) -> dict:
    sid = rec["school_id"]
    seed = rec["input"]
    checks = {}
    new_ev: list[dict] = []
    refetched: set[str] = set()

    # third-party profile first: may supply the official website for discovered schools
    tp_ident = None
    if settings["third_party"] and seed.get("ezyschooling_url") and ctx.source_accessible("ezyschooling"):
        res = ezyschooling.research_profile(ctx, rec, seed["ezyschooling_url"])
        new_ev += res["evidence"]
        checks.update(res["checks"])
        tp_ident = res["identity"]
    elif settings["third_party"]:
        checks["third_party_crosscheck"] = {"status": "not_publicly_available" if not seed.get("ezyschooling_url") else "blocked",
                                            "detail": "no third-party profile known" if not seed.get("ezyschooling_url") else "source blocked"}
    else:
        checks["third_party_crosscheck"] = {"status": "skipped", "detail": "outside slice scope"}
    if not rec.get("official_website_url") and tp_ident and tp_ident.get("official_website"):
        rec["official_website_url"] = tp_ident["official_website"]

    off = official_site.research(ctx, rec, standalone)
    new_ev += off["evidence"]
    checks.update(off["checks"])
    refetched |= off["refetched_urls"]
    rec["analysis"]["official_pages_examined"] = off["pages"]

    # registry checks -------------------------------------------------------
    if settings["registry_checks"]:
        reg_notes = []
        reg_done = False
        for code in off["ib_codes"]:
            r = registries.ib_lookup(ctx, rec, code)
            new_ev += r["evidence"]
            reg_notes.append(r["check"]["detail"])
            reg_done |= r["check"]["status"] == "done"
        fams = {e["normalized_value"]["family"] for e in new_ev if e["field_name"] == "curricula"}
        if "IB" in fams and not off["ib_codes"]:
            st = ctx.source_status.get("ib", {})
            reg_notes.append(f"IB live directory: {st.get('access', 'unknown')} ({st.get('reason', '')}); no IB school code on official site for archived lookup")
        if "CBSE" in fams:
            r = registries.saras_search(ctx, rec)
            new_ev += r["evidence"]
            reg_notes.append(r["check"]["detail"])
            reg_done |= r["check"]["status"] == "done" and bool(r["evidence"])
        if "CISCE" in fams:
            r = registries.cisce_lookup(ctx, rec)
            new_ev += r["evidence"]
            reg_notes.append(r["check"]["detail"])
            reg_done |= r["check"]["status"] == "done" and bool(r["evidence"])
        if "CAMBRIDGE" in fams:
            st = ctx.source_status.get("cambridge", {})
            reg_notes.append(f"CAMBRIDGE registry: {st.get('access', 'unknown')} ({st.get('reason', '')})")
        if reg_done:
            checks["registry_curriculum_check"] = {"status": "done", "detail": "; ".join(reg_notes)}
        elif not fams:
            checks["registry_curriculum_check"] = {"status": "failed", "detail": "no curriculum evidence to verify"}
        else:
            checks["registry_curriculum_check"] = {"status": "blocked", "detail": "; ".join(reg_notes)}
    else:
        checks["registry_curriculum_check"] = {"status": "skipped", "detail": "outside slice scope"}

    # history -----------------------------------------------------------------
    if settings["history"] and ctx.cfg.research["historical_research"]["enabled"]:
        if checks.get("official_website_identity", {}).get("status") == "done":
            urls = [rec["official_website_url"], off.get("curriculum_page")]
            current = {e["normalized_value"]["code"] for e in new_ev if e["field_name"] == "curricula"
                       and e["source_type"] in ("official_school_site", "official_registry")}
            h = research_history(ctx, rec, urls, current)
            new_ev += h["evidence"]
            refetched |= h["examined_urls"]
            checks["curriculum_history_research"] = h["check"]
            rec["analysis"]["archive_observations"] = h["observations"]
        else:
            checks["curriculum_history_research"] = {"status": "skipped", "detail": "official website not confirmed"}
    else:
        checks["curriculum_history_research"] = {"status": "skipped", "detail": "outside slice scope"}

    # merge / resolve -----------------------------------------------------------
    # Website-template filler next to a value (Lorem ipsum, info@mysite.com, 123-456-7890) means the value may be
    # a template placeholder rather than the school's own data: such evidence is not kept.
    kept = [e for e in new_ev if not TEMPLATE_TEXT_RE.search(f"{e['source_url']} {e['evidence_excerpt']} {e.get('raw_value', '')}")]
    rec["analysis"]["template_text_evidence_dropped"] = len(new_ev) - len(kept)
    new_ev = kept
    merge_evidence(rec, new_ev)
    mark_superseded(rec, refetched | {e["source_url"] for e in new_ev}, {e["evidence_id"] for e in new_ev})
    apply_retractions(rec, load_retractions(ctx.cfg))
    resolve_fields(rec, [f for f in ctx.cfg.field_names if f != "premium_category"])

    crawl_ok = checks.get("official_site_crawl", {}).get("status") == "done"
    for check_id, field in (("fee_research", "annual_fee"), ("curriculum_research", "curricula"),
                            ("enrollment_research", "campus_student_count"), ("founding_year_research", "founding_year")):
        fact = rec["fields"].get(field) or {}
        if fact.get("value") not in (None, []):
            checks[check_id] = {"status": "done", "detail": f"{field}: {fact['status']}"}
        elif crawl_ok:
            checks[check_id] = {"status": "not_publicly_available",
                                "detail": f"not found on {len(off['pages'])} official documents"
                                          + (" or third-party profile" if settings["third_party"] else "")}
        else:
            checks[check_id] = {"status": "failed", "detail": "official site not crawled"}
    now = utc_now()
    for k, v in checks.items():
        v["at"] = now
    rec["research_checks"] = {k: checks[k] for k in MANDATORY_CHECKS if k in checks}
    rec["research_checks"].update({k: v for k, v in checks.items() if k not in MANDATORY_CHECKS})
    return rec


# ------------------------------------------------------------------ run

def run(slice_no: int, *, limit: int | None = None, offline: bool = False, root=None, output_dir=None,
        refresh: bool = False) -> dict:
    cfg = load_config(root, output_dir)
    settings = cfg.slice_settings(slice_no)
    run_id = datetime.now(timezone.utc).strftime("run-%Y%m%dT%H%M%SZ")
    store = Store(cfg.paths, run_id)
    ctx = build_context(cfg, offline)
    store.log("run_started", slice=slice_no, settings=settings, offline=offline)
    src_status = probe_sources(ctx, store, offline)

    for seed in cfg.seeds:
        sid, new, reason = store.enqueue(dict(seed), {"type": "seed", "source": "data/input/schools.json"}, priority=1e12)
        store.log("enqueued" if new else "duplicate_seed", sid, origin="seed", reason=reason)
    store.save_queue()

    max_schools = limit or settings["max_schools"]
    disc = None
    if settings["discovery"]:
        disc = (discover_sitemap if settings.get("discovery_mode") == "sitemap" else discover)(ctx, store, max_schools)
        store.log("discovery_summary", **{k: v for k, v in disc.items() if k != "listings"})

    active = [i for i in store.queue if i["status"] != "rejected"]
    active.sort(key=lambda i: -i.get("priority", 0))
    selected = active[:max_schools]
    domain_counts: dict[str, int] = {}
    for i in active:
        u = i["seed"].get("official_website")
        if u:
            d = registrable_host(u)
            domain_counts[d] = domain_counts.get(d, 0) + 1

    def work(item):
        sid = item["school_id"]
        rec = store.records.get(sid) or new_school_record(sid, item["seed"], item["origin"])
        rec["input"] = item["seed"]
        rec["possible_duplicates"] = item.get("possible_duplicates", [])
        if item["seed"].get("official_website") and not rec.get("official_website_url"):
            rec["official_website_url"] = item["seed"]["official_website"]
        store.set_status(sid, "in_progress")
        try:
            research_school(ctx, rec, settings, _standalone(rec.get("official_website_url"), domain_counts))
            with store.lock:
                store.records[sid] = rec
            store.set_status(sid, "done")
            store.log("school_researched", sid, evidence=len(rec["evidence"]))
        except Exception as exc:
            store.set_status(sid, "failed", f"{type(exc).__name__}: {exc}")
            store.log("school_failed", sid, error=traceback.format_exc()[-2000:])
        return sid

    todo = [i for i in selected if refresh or i["status"] != "done" or i["school_id"] not in store.records]
    store.log("selection", selected=len(selected), to_research=len(todo), resumed_done=len(selected) - len(todo))
    with ThreadPoolExecutor(max_workers=cfg.http["workers"]) as pool:
        futs = [pool.submit(work, i) for i in todo]
        for f in as_completed(futs):
            f.result()

    selected_ids = {i["school_id"] for i in selected}
    schools = [r for sid, r in store.records.items() if sid in selected_ids]
    finalize(cfg, store, schools, src_status, disc, slice_no)
    return {"run_id": run_id, "schools": len(schools), "slice": slice_no}


def finalize(cfg: Config, store: Store, schools: list[dict], src_status: dict, disc: dict | None, slice_no: int) -> None:
    groups = A.build_groups(schools)
    gmap = {g["group_id"]: g for g in groups}
    for rec in schools:
        if rec.get("group_id"):
            g = gmap[rec["group_id"]]
            rec["analysis"]["school_group"] = {"value": g["brand_domain"], "status": "analysis", "basis": g["basis"],
                                               "group_id": g["group_id"]}
        pc = A.classify_premium(rec, cfg.premium_rules)
        rec["analysis"]["premium_category"] = pc
        rec["fields"]["premium_category"] = {"value": pc["value"], "status": "conflict" if pc.get("conflict") else "analysis",
                                             "evidence_ids": pc["evidence_ids"], "label": pc["label"],
                                             "provisional": pc["provisional"], "conflict": pc.get("conflict")}
        fit = A.fit_assessment(rec, cfg.research, gmap.get(rec.get("group_id")))
        rec["analysis"]["masteredge_fit"] = fit
        rec["analysis"]["recommendations"] = A.recommendations(rec, cfg.research, fit)
        rec["data_gaps"] = A.data_gaps(rec, cfg.fields["fields"])
        store.finalize_record(rec)
    store.save_master(schools)
    store.save_groups(groups)
    metrics = compute_metrics(schools, cfg.fields["fields"])
    store.save_json(cfg.paths.output_dir / "data_gaps.json", {
        "generated_at": utc_now(), "run_id": store.run_id,
        "note": "Missing, conflicting, unverified, undated, doubtful and blocked items per school. Missing numbers are null, never estimated.",
        "summary": _gap_summary(schools),
        "schools": [{"school_id": r["school_id"], "name": r["input"]["name"], "campus": r["input"].get("campus"),
                     "gaps": r["data_gaps"]} for r in sorted(schools, key=lambda x: x["school_id"])],
    })
    store.save_json(cfg.paths.source_registry, {
        "generated_at": utc_now(), "run_id": store.run_id,
        "sources": list(src_status.values()),
        "adapter_status": adapter_status(src_status),
    })
    master = read_json(cfg.paths.schools_master)
    schema_ok = True
    schema_error = None
    try:
        jsonschema.validate(master, MASTER_SCHEMA)
    except jsonschema.ValidationError as exc:
        schema_ok, schema_error = False, exc.message
    store.save_json(cfg.paths.validation_report, {
        "generated_at": utc_now(), "run_id": store.run_id, "slice": slice_no,
        "kind": "pipeline self-check (the independent final validation is masteredge.validate_final)",
        "schema_valid": schema_ok, "schema_error": schema_error, "metrics": metrics,
        "discovery": disc, "groups": len(groups),
    })
    from .report_excel import build_report
    build_report(cfg, schools, groups, metrics, list(src_status.values()))
    from .dashboard import build_dashboard
    build_dashboard(cfg, schools)
    store.log("run_finished", schools=len(schools), metrics={k: v for k, v in metrics.items() if k.endswith("_pct")})


def _gap_summary(schools: list[dict]) -> dict:
    out: dict[str, dict[str, int]] = {}
    for r in schools:
        for g in r["data_gaps"]:
            out.setdefault(g["gap_type"], {}).setdefault(g["field"], 0)
            out[g["gap_type"]][g["field"]] += 1
    return out


def adapter_status(src_status: dict) -> list[dict]:
    """Implementation/execution status per registry source (DONE / PARTIAL / BLOCKED)."""
    implemented = {
        "official_site": ("DONE", "identity check, focused crawl, PDF parsing, extraction"),
        "ezyschooling": ("DONE", "discovery listings, profile, fee table"),
        "wayback": ("DONE", "CDX + raw snapshots for curriculum history"),
        "ib_archive": ("DONE", "archived IB directory page lookup when an IB code is published on the official site"),
        "ib": ("BLOCKED", "live directory behind anti-bot challenge; archived lookup used instead"),
        "cbse_saras": ("PARTIAL", "keyword search implemented; server rejects automated search"),
        "cambridge": ("BLOCKED", "finder results under robots-disallowed /search"),
        "cisce": ("DONE", "official CISCE school locator (locate.cisce.org) per-state lookup"),
        "google_search": ("BLOCKED", "requires GOOGLE_API_KEY and GOOGLE_CSE_ID"),
        "google_maps": ("BLOCKED", "requires GOOGLE_MAPS_API_KEY"),
        "linkedin": ("BLOCKED", "robots.txt disallows all crawling; no permitted API access configured"),
        "mca": ("BLOCKED", "no permitted programmatic access confirmed"),
    }
    out = []
    for sid, st in src_status.items():
        status, note = implemented.get(sid, ("PARTIAL", "access probe only; no profile parser implemented"))
        if st.get("access") == "BLOCKED" and status in ("DONE", "PARTIAL") and sid not in ("official_site",):
            status = "BLOCKED"
        out.append({"id": sid, "implementation_status": status, "note": note, "access": st.get("access"),
                    "access_reason": st.get("reason")})
    return out
