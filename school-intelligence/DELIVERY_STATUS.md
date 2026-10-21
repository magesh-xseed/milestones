# MASTEREDGE School Intelligence: Delivery Status

Run date: 2026-10-20 · Dataset: 100 Indian schools (9 cities) · Independent validation: **`PASSED_WITH_UNMET_TARGETS`**

Statuses: `DONE` = implemented, tested, validated · `PARTIAL` = implemented but incomplete ·
`BLOCKED` = external access restriction · `FAILED` · `NOT_STARTED`.

## 0. Slice 6 update (2026-10-21): every Ezyschooling school screened, 587 researched

* **Screened:** 11,705 of 11,712 school profiles in Ezyschooling's public sitemaps (31 cities + boarding schools). Listing "load more"
  API returns 403 and was not bypassed; sitemaps are robots-allowed. Screening data is third-party prioritisation data, never facts.
* **Researched in depth:** 587 schools (100 original + 487 that list ≥ ₹2.5 L/yr or IB/Cambridge, with a website).
  By published fee: 44 ultra-premium, 98 premium, 226 upper-mid, 69 below premium, 150 publish no fee. 315 have a public phone or role mailbox.
* **Target grades:** Nursery, LKG, UKG and Grade 1–8 (confirmed by Mahesh R, 2026-10-20); fit scores and sales views use this range.
* **Shareable dashboard:** `data/output/premium_schools_dashboard.html` (self-contained; priority list with sales detail + full directory).
  Rebuild any time with `python -m masteredge dashboard`.
* **Independent validation:** `PASSED_WITH_UNMET_TARGETS` — all critical gates met; curriculum-registry and dated-fee targets remain NOT MET (blocked sources / disclosure).
* **Audit rounds 7–8:** first-look accuracy on the new 37-fact sample 86.5% (5 wrong, all fixed by rules + tests). A full review of every
  student count found 39 wrong values (years, capacity, slogans, sections, other schools, Indian digit grouping) — rules added, evidence retracted.
  Template filler (Lorem ipsum, `info@mysite.com`, `123-456-7890`) next to a value now discards that evidence.

## 1. Headline for the CEO (slice 5, 100 schools)

* 100 schools researched end-to-end; 89 official websites identity-confirmed; 9,923 evidence records.
* **42 schools are premium or ultra-premium by published fee** (19 ultra-premium ≥ ₹8 L max, 23 premium ≥ ₹3.5 L).
  **All 42 are provisional.** Either the fee is published only by a third party (Ezyschooling), or the official
  site does not say whether the amount is annual or which year it applies to. 3 have source conflicts on category.
* Only **7 schools publish any fee on their own website**, and none of those states the academic year.
  Verified-and-dated fee coverage is therefore **0%**. That is a fact about the market's disclosure, not a pipeline defect.
* Curriculum is stated on the official website for **87%** of schools, but registry-verified for only **11%**.
  Live IB, CBSE (SARAS) and Cambridge registries refuse automated access, and those blocks were not bypassed.
  The 11 registry-verified schools come from the official CISCE locator.
* Campus enrollment is published for only **6** schools and never with a reporting year. Verified enrollment is **0%**.
  Student reach is therefore scored 0 in the fit model, not estimated.
* MASTEREDGE fit scores are **analysis**. They rank research-based priority, and do not predict a purchase.
  The curriculum-compatibility values and target grades in `config/research_config.json` are placeholders that
  the MASTEREDGE product team must confirm.

## 2. Quality gates (recalculated by the independent validator)

| Gate | Target | Actual | Status |
|---|---|---|---|
| Automated tests pass rate | 100% | 104/104 (100%) | MET |
| JSON schema validation | 100% | 100% | MET |
| Evidence coverage of reported facts | 100% | 100% (1,620/1,620) | MET |
| Audited factual accuracy (sample of 40, after remediation) | 100% | 100% (40/40) | MET |
| Duplicate canonical campus IDs | 0 | 0 | MET |
| Conflicts presented as verified | 0 | 0 | MET |
| Unsupported values presented as facts | 0 | 0 | MET |
| Required-field coverage | report | 75.8% | REPORTED |
| Official (registry) curriculum verification | 95% | **11.0%** | **NOT MET**: IB/CBSE/Cambridge registries blocked |
| Verified, dated fee coverage | 80% | **0.0%** | **NOT MET**: no official site states fee + academic year |
| Verified enrollment coverage | report | 0.0% | REPORTED |
| Research completion (mandatory checks) | report | 84.7% | REPORTED: blocked registry checks count as incomplete |

**Accuracy is reported honestly in two layers:**

* Automated re-derivation of every fact from its stored source snapshot: 1,620/1,620 (100%).
  This proves that values match their sources. It does not prove that the values were interpreted correctly.
* Manual semantic audit, first look, before fixes: 82.4% → 80.6% → 81.0% → 90.6% → **97.2%** across six rounds
  (167 facts reviewed, 22 wrong values found). Each error was fixed by an extractor rule plus a regression test,
  or by an audited retraction. The 100% figure applies to the current audited sample only. Unaudited records are
  not claimed to be 100% accurate.

## 3. Vertical slices

| Slice | Scope | Status | Notes |
|---|---|---|---|
| 1 | Oakridge Gachibowli, official site → JSON → Excel → validation | **DONE** | Fee ₹3.6–10.5 L, IB PYP/MYP/DP + CBSE by grade, all evidence-backed |
| 2 | IB / Cambridge / CBSE / CISCE verification | **PARTIAL** | CISCE locator DONE; IB via archived registry pages DONE but needs an IB code on the school site (none found for the 100); IB live, CBSE SARAS and Cambridge are **BLOCKED** |
| 3 | Discovery + 20 schools + dedupe | **DONE** | 236 candidates; duplicates rejected on URL/profile/name+campus+city; same-name campuses kept separate and flagged |
| 4 | Curriculum history (Wayback) | **DONE** | 827 dated events for 82 schools; caveated as observations, never as adoption dates |
| 5 | 100 schools + CEO report | **DONE** (gates as above) | 100 schools; 2 targets NOT MET for external reasons |

## 4. Source adapters

| Source | Status | Reason |
|---|---|---|
| Official school websites | DONE | robots.txt-compliant crawl, identity check, PDF parsing |
| Ezyschooling | DONE | discovery listings, profiles, fee tables (third-party tier) |
| Wayback Machine | DONE | CDX + raw snapshots |
| CISCE (locate.cisce.org) | DONE | official locator, per-state lookup |
| IB directory (archived pages) | DONE | used when an IB school code is published by the school |
| IB directory (live) | BLOCKED | Cloudflare anti-bot challenge |
| CBSE SARAS | BLOCKED | directory search returns 403 to automated requests (adapter implemented) |
| Cambridge school finder | BLOCKED | results live under robots-disallowed `/search` |
| EducationWorld | BLOCKED | anti-bot challenge |
| LinkedIn | BLOCKED | robots.txt disallows all; no permitted API configured |
| MCA | BLOCKED | 403 |
| Google Search / Maps | BLOCKED | no API credentials configured (set env vars to enable) |
| Cfore, Edustoke, UniApply, Careers360, SchoolMyKids, Tofler, TheCompanyCheck | PARTIAL | accessible this run; only access probes implemented, no profile parsers |

## 5. Requirement checklist

| Requirement | Status |
|---|---|
| Config-driven research (6 config/input files, no code changes needed) | DONE |
| Evidence record per field, with all 13 required attributes | DONE |
| Raw vs normalized values, lossless normalization (₹ lakh/crore, grades, years) | DONE |
| Conflict tracking, never silently resolved | DONE |
| Never overwrite verified data with weaker evidence (guard + audited retraction) | DONE |
| Stable IDs, atomic writes, versioned records, resume, append-only evidence | DONE |
| Duplicate prevention | DONE |
| Premium classification rules | DONE |
| MASTEREDGE fit model, transparent and labelled analysis | DONE (product-profile values need confirmation) |
| CEO Excel report (10 required sheets + Evidence + Source Registry) | DONE |
| Independent read-only validator and reports | DONE |
| Unit / integration / E2E / regression / negative tests | DONE (104 tests, deterministic local fixtures) |
| School identity: group & parent organization | PARTIAL: groups only by shared official domain (3 groups); parent org only when explicitly stated |
| Corporate entity research (MCA / Tofler / Company Check) | NOT_STARTED beyond access probes |
| Decision-maker research | PARTIAL: role titles on official pages only; no personal data collected; LinkedIn blocked |
| Fee / enrollment verification targets | BLOCKED by source disclosure (see §1) |

## 6. Known limitations

* Discovery uses Ezyschooling IB/Cambridge/IGCSE/International listings in 9 cities, ranked by listed fee.
  32 of the 100 fall below the premium threshold by published fee. They remain in the dataset but rank lower.
* Rule-based extraction: the first-look audit error rate fell from about 19% to under 3%, but residual errors are possible in
  unaudited records. Data Gaps lists 615 facts that only third parties support. 56 "item no longer supported"
  entries record items withdrawn as extraction rules tightened.
* Third-party values that are doubtful but accurately read are kept as third-party-only and flagged.
  Example: Ezyschooling ratios that equal the official class size.
* 11 schools failed the official-website identity check (site blocked or brand not found). Their data is third-party only.
