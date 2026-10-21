# MASTEREDGE — India Premium School Intelligence Engine

Evidence-first research engine that discovers, researches, verifies and ranks premium Indian schools
for MASTEREDGE sales prioritisation, and produces a CEO-ready Excel report plus a JSON database in
which **every fact is traceable to a stored source snapshot**.

> Results of the delivered run, gate outcomes and known limitations are in
> [`DELIVERY_STATUS.md`](DELIVERY_STATUS.md) and
> [`data/output/validation/final_validation_summary.md`](data/output/validation/final_validation_summary.md).

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Python 3.11+ (developed on 3.14). No API keys are required; Google Search / Maps adapters activate only
if `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` / `GOOGLE_MAPS_API_KEY` are set, and are reported `BLOCKED` otherwise.

## Run

```bash
# Vertical slices (each is cumulative and resumable)
.venv/bin/python -m masteredge run --slice 1        # one seed school, official site only
.venv/bin/python -m masteredge run --slice 2        # + third-party cross-check + registry checks
.venv/bin/python -m masteredge run --slice 3        # + discovery, 20 schools, dedupe
.venv/bin/python -m masteredge run --slice 4        # + curriculum history (Wayback)
.venv/bin/python -m masteredge run --slice 5        # 100 schools + full CEO report

# Options
--limit N      override the slice's school count
--refresh      re-research schools already completed (default: resume, skip completed)
--offline      rebuild everything from stored raw snapshots, no network

# Independent read-only validation of the final files
.venv/bin/python -m masteredge validate

# Print the deterministic manual-audit sample (for data/audit/manual_audit.json)
.venv/bin/python -m masteredge audit-sample

# Tests (deterministic, local fixtures only; no internet needed)
.venv/bin/python -m pytest -q
```

An interrupted run resumes automatically: the queue (`research_queue.json`) records per-school status
and every write is atomic, so re-running the same command continues where it stopped.

## Configuration (no code changes needed)

| File | Controls |
|---|---|
| `config/research_config.json` | India-only, target count, cities/states, slices, discovery boards, history depth, refresh interval, HTTP politeness, MASTEREDGE product profile, scoring weights, audit sample size |
| `config/fields.json` | Field registry: required / factual / derived, mandatory research checks |
| `config/sources.json` | Source registry, tiers, priorities, enable/disable, API-key env vars |
| `config/premium_rules.json` | Premium category thresholds (max published annual fee) |
| `config/validation_rules.json` | Quality gates and targets, Indian states/UTs, India bounding box |
| `data/input/schools.json` | Operator seed schools (inputs, not results — identity-checked at runtime) |

## Outputs (`data/output/`)

| File | Content |
|---|---|
| `schools_master.json` | One versioned record per campus: resolved fields, every evidence record, research checks, analysis, data gaps |
| `school_groups.json` | Groups evidenced by a shared official domain (similar names are never grouped) |
| `research_queue.json` | Discovery/seed queue with status, attempts, duplicates and possible-duplicate flags |
| `research_history.jsonl` | Append-only event log (probes, enqueues, duplicates, research, failures) |
| `validation_report.json` | Pipeline self-check: schema validity + all quality metrics |
| `source_registry.json` | Live access status of every source this run (robots.txt + probe) and adapter status |
| `data_gaps.json` | Missing / conflicting / unverified / undated / doubtful / blocked items per school |
| `record_versions/*.jsonl` | Previous versions of each record whenever content changed |
| `access_log.jsonl` | Every HTTP fetch outcome (ok / blocked / error) |
| `MASTEREDGE_India_Premium_School_Opportunity_Report.xlsx` | CEO report (10 required sheets + Evidence + Source Registry) |
| `validation/final_validation_report.json`, `final_validation_summary.md` | Independent read-only validation |

Raw source snapshots are stored content-addressed in `data/raw/` (gzip, SHA-256) with an index; evidence
excerpts are re-located in these snapshots by the validator.

## Architecture

```
seeds / Ezyschooling discovery ─► research_queue (dedupe: URL, profile, name+campus+city)
        │
        ▼ per school (thread pool, per-host rate limits, robots.txt honoured)
 third-party profile ─► official website identity check ─► focused crawl (+PDF) ─► extractors
 registry checks (CISCE locator, IB archived pages, SARAS attempt) ─► Wayback history
        │
        ▼
 evidence records (raw value, normalized value, excerpt, snapshot hash, tier, confidence)
        │  merge (append-only), supersede, audited retractions
        ▼
 field resolution (tier precedence; disagreements kept as CONFLICT; verified values never silently replaced)
        │
        ▼
 analysis (premium category, MASTEREDGE fit — labelled ANALYSIS) ─► JSON + Excel
        │
        ▼
 independent validator (separate parsers, read-only, hashes inputs before/after)
```

| Module | Role |
|---|---|
| `masteredge/http.py` | Compliant fetcher: robots.txt (fail-closed on 5xx), per-host delay, block/challenge detection, raw snapshot store |
| `masteredge/textify.py` | Deterministic HTML/PDF → text used for both extraction and excerpt checks |
| `masteredge/normalize.py` | Lossless normalisation: ₹ lakh/crore, academic years, grade ranges, curriculum codes |
| `masteredge/extract.py` | Rule-based extractors with context guards (editorial pages, institution names, participation figures, named-person contacts) |
| `masteredge/adapters/` | Official site, Ezyschooling, CISCE locator, IB (archived), CBSE SARAS, Wayback, access probes |
| `masteredge/records.py` | Evidence records, resolution, conflicts, regression guard, retractions |
| `masteredge/analysis.py` | Premium classification, MASTEREDGE fit, recommendations, groups, data gaps |
| `masteredge/quality.py` | Quality metrics |
| `masteredge/report_excel.py` | CEO workbook |
| `masteredge/validate_final.py` | Independent, read-only final validator |

## Data-integrity rules enforced in code

* A value is a fact only if an evidence record holds the exact raw text, an excerpt that re-occurs in
  the stored snapshot, the source URL/title/type, retrieval time and extraction method.
* Status vocabulary: `official_registry_verified` (IB/CBSE/CISCE/Cambridge registry page),
  `official_source` (school's own website), `archive_only`, `third_party_only`, `conflict`,
  `needs_review`, `not_found`. Extraction alone never makes a value "verified".
* Conflicts are never resolved silently: the highest-tier value is displayed, flagged `CONFLICT`, and
  every candidate is listed in Data Gaps.
* Group enrollment is never used as campus enrollment (scope recorded per evidence; only `campus`
  scope can populate `campus_student_count`).
* Monthly fees are never annualised; an unstated fee period or academic year is recorded as such.
* Missing numbers are `null`. Nothing is estimated.
* Previously verified values cannot be replaced by weaker evidence; they become `needs_review`.
  The only way to remove one is an audited retraction (`data/audit/manual_audit.json`).
* Evidence is append-only: stale evidence is marked `superseded`, retracted evidence `retracted`;
  neither is deleted.
* Personal contact details are not collected (role mailboxes and labelled school lines only).
* Access controls are never bypassed: robots.txt disallow, 401/403/429, Cloudflare challenges and
  CAPTCHAs are logged as `BLOCKED`.

## Verification tiers and what "verified" means in the metrics

| Metric | Definition |
|---|---|
| Curriculum Verification % | schools with ≥1 curriculum confirmed on an official registry page (live or archived) |
| Curriculum (official site) % | schools whose own website states the curriculum |
| Fee Verification % | displayed fee from an official source **and** an academic year stated in the source |
| Enrollment Verification % | official campus enrollment **and** a stated reporting year |
| Data Accuracy % | manual semantic audit of a deterministic random sample (plus automated re-derivation of every fact) |

## MASTEREDGE fit (ANALYSIS, not prediction)

Weights (configurable): curriculum compatibility 30, premium positioning 25, student reach 15,
academic alignment 15, group expansion 10, confirmed sales-readiness 5. Each component lists its
calculation, supporting facts and missing evidence. Missing inputs score 0 — they are never estimated.
No purchase intent, budget or conversion probability is produced. The curriculum compatibility
values and target grades/subjects in `masteredge_profile` are **operator assumptions** to be confirmed
by the MASTEREDGE product team.
