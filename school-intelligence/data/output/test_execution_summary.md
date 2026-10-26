# Test Execution Summary

- Run at: 2026-10-20T10:23:33+00:00
- Command: `python -m pytest -q`
- Result: **104/104 passed**, 0 failed (100.0% pass rate)
- Automated tests use deterministic local fixtures only. Live-source behaviour is exercised by the
  vertical-slice runs and checked by the independent validator (see final_validation_summary.md).

| Module | Scope | Passed | Failed |
|---|---|---|---|
| `test_extract` | Unit + negative: extraction rules and context guards | 35 | 0 |
| `test_history` | Unit: curriculum history events | 4 | 0 |
| `test_http` | Negative/compliance: robots.txt, 403, challenges, offline, invalid PDF | 8 | 0 |
| `test_normalize` | Unit: normalization, fee parsing, grades, curriculum mapping | 26 | 0 |
| `test_pipeline_integration` | Integration + E2E + regression + negative over a local HTTP fixture site | 13 | 0 |
| `test_records_scoring` | Unit + regression: resolution, conflicts, dedupe, scoring, config validation | 18 | 0 |

## Test cases

### test_extract
- ✅ `test_fee_range_with_year_and_period`
- ✅ `test_fee_period_not_assumed`
- ✅ `test_monthly_fee_never_annualised`
- ✅ `test_application_fee_is_admission_charge`
- ✅ `test_missing_fee_yields_nothing`
- ✅ `test_curricula_ignored_on_editorial_pages`
- ✅ `test_curriculum_by_grade`
- ✅ `test_student_count_scope_and_year`
- ✅ `test_group_count_never_campus`
- ✅ `test_participation_figures_are_not_enrollment`
- ✅ `test_unspecified_scope_on_shared_domain`
- ✅ `test_founding_year`
- ✅ `test_contacts_exclude_named_people`
- ✅ `test_subjects_require_subject_context_and_skip_institutions`
- ✅ `test_assessment_requires_adjacent_context`
- ✅ `test_ib_code_from_link`
- ✅ `test_campus_count_ignores_seo_and_network_text`
- ✅ `test_ezyschooling_fee_table`
- ✅ `test_admission_balance_in_pdf_text_is_not_tuition`
- ✅ `test_amount_far_from_fee_keyword_ignored`
- ✅ `test_candidate_status_and_noise_not_curricula`
- ✅ `test_staff_bios_not_curricula`
- ✅ `test_curriculum_grade_range_not_borrowed_from_next_programme`
- ✅ `test_roles_must_belong_to_school`
- ✅ `test_facilities_are_not_subjects`
- ✅ `test_history_claims_specific_codes_and_lists`
- ✅ `test_history_claims_ignore_staff_careers`
- ✅ `test_grades_offered_ignores_intake_and_sections`
- ✅ `test_roles_on_leadership_page_and_corporate_roles_excluded`
- ✅ `test_programme_years_and_careers_not_curriculum_facts`
- ✅ `test_board_comparisons_and_boarding_eligibility_ignored`
- ✅ `test_multi_campus_and_parent_counts_not_campus_enrollment`
- ✅ `test_council_name_is_cisce_not_isc`
- ✅ `test_initial_enrollment_and_unrelated_across_handled`
- ✅ `test_generic_primary_years_label_is_not_ib`

### test_history
- ✅ `test_first_observed_bounded_and_dropped`
- ✅ `test_no_snapshots_no_events`
- ✅ `test_no_longer_observed_suppressed_when_live_site_still_states_it`
- ✅ `test_archive_candidate_mention_not_observed_as_offering`

### test_http
- ✅ `test_robots_disallow_blocks_without_fetching`
- ✅ `test_403_is_blocked_not_retried`
- ✅ `test_cloudflare_challenge_detected`
- ✅ `test_robots_5xx_fails_closed`
- ✅ `test_unavailable_site`
- ✅ `test_snapshot_stored_and_reused`
- ✅ `test_offline_without_snapshot_fails`
- ✅ `test_invalid_pdf_yields_no_facts`

### test_normalize
- ✅ `test_parse_money[\u20b93,60,000 /year-360000]`
- ✅ `test_parse_money[Rs. 1.2 Cr-12000000]`
- ✅ `test_parse_money[INR 4,50,000-450000]`
- ✅ `test_parse_money[\u20b9 30 K-30000]`
- ✅ `test_parse_money[\u20b93.6 Lakhs-360000]`
- ✅ `test_parse_money[rupees 75000-75000]`
- ✅ `test_parse_money[4,50,000-None]`
- ✅ `test_parse_money[-None]`
- ✅ `test_parse_money_range_lakhs`
- ✅ `test_parse_money_range_shared_unit`
- ✅ `test_academic_year[Fee Structure for 2027-2028 Academic-2027-28]`
- ✅ `test_academic_year[AY 2025-26-2025-26]`
- ✅ `test_academic_year[2025/26 session-2025-26]`
- ✅ `test_academic_year[2019-2024 strategic plan-None]`
- ✅ `test_grade_range[Nursery to 5th Grade IB-expected0]`
- ✅ `test_grade_range[6th Grade to 10th Grade-expected1]`
- ✅ `test_grade_range[Nursery - 12 Class-expected2]`
- ✅ `test_grade_range[Classes I to XII-expected3]`
- ✅ `test_grade_range[Pre-K to Grade 12-expected4]`
- ✅ `test_grade_range[KG to Grade 12-expected5]`
- ✅ `test_grade_range[11th Grade & 12th Grade-expected6]`
- ✅ `test_grade_range[K-12 school-expected7]`
- ✅ `test_grade_range[Age Range: 2 to 16-None]`
- ✅ `test_grade_range[Grade 1 to 5 years old-None]`
- ✅ `test_curriculum_mapping`
- ✅ `test_curriculum_no_false_positive_on_plain_words`

### test_pipeline_integration
- ✅ `test_e2e_official_site_extraction`
- ✅ `test_e2e_metrics_and_excel`
- ✅ `test_independent_validation_requires_manual_audit`
- ✅ `test_validator_is_read_only`
- ✅ `test_validator_detects_tampered_value`
- ✅ `test_rerun_is_stable_and_preserves_evidence`
- ✅ `test_verified_fee_not_silently_removed_when_page_changes`
- ✅ `test_third_party_conflicts_are_flagged_not_resolved`
- ✅ `test_unavailable_website_is_reported_not_fabricated`
- ✅ `test_wrong_website_identity_rejected`
- ✅ `test_missing_curriculum_history_reported`
- ✅ `test_cisce_registry_lookup_with_campus_disambiguation`
- ✅ `test_excel_survives_control_characters`

### test_records_scoring
- ✅ `test_tier_precedence_and_conflict_kept`
- ✅ `test_agreement_is_not_conflict`
- ✅ `test_conflicting_student_counts`
- ✅ `test_group_enrollment_never_used_as_campus`
- ✅ `test_low_confidence_not_promoted`
- ✅ `test_curricula_union_and_third_party_flag`
- ✅ `test_verified_value_not_silently_replaced`
- ✅ `test_retraction_is_the_only_way_to_drop_verified_value`
- ✅ `test_school_id_stable`
- ✅ `test_dedupe_and_possible_duplicates`
- ✅ `test_similar_names_different_domains_not_grouped`
- ✅ `test_premium_thresholds`
- ✅ `test_premium_third_party_is_provisional`
- ✅ `test_premium_category_conflict`
- ✅ `test_unclassified_without_fee`
- ✅ `test_fit_score_transparent_and_no_sales_inference`
- ✅ `test_config_validation_rejects_bad_weights`
- ✅ `test_dropped_verified_list_item_is_recorded`
