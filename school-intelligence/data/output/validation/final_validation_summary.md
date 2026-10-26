# Final Independent Validation Summary

- **Release status:** `PASSED_WITH_UNMET_TARGETS`
- Validated at: 2026-10-21T03:47:45+00:00 (dataset run `run-20261021T003553Z`)
- Validator: masteredge.validate_final (read-only, independent re-derivation)

## Totals

| Item | Count |
|---|---|
| records checked | 587 |
| fields checked | 15849 |
| populated factual values | 8578 |
| verified values | 4383 |
| missing values | 7271 |
| conflicts | 417 |
| source errors blocked or failed checks | 874 |
| evidence records | 37892 |

## Coverage (recalculated from final JSON)

| Metric | % |
|---|---|
| field_coverage_pct | 70.2 |
| evidence_coverage_pct | 100.0 |
| official_source_verification_pct | 51.1 |
| curriculum_verification_pct | 6.5 |
| curriculum_official_site_pct | 77.9 |
| fee_verification_pct | 0.0 |
| fee_official_any_pct | 5.1 |
| enrollment_verification_pct | 0.0 |
| research_completion_pct | 81.2 |

## Accuracy

- Automated re-check (all populated facts): 8578/8578 = 100.0%
- Manual audit sample: 40/40 audited (sample size 40) = 100.0%
- Accuracy claims apply to the audited sample only.

## Pre-remediation (first-look) audit rounds

| Round | Slice | Facts reviewed | Value mismatches | First-look accuracy % |
|---|---|---|---|---|
| 1 | 1 | 17 | 3 | 82.4 |
| 2 | 2 | 4 | 0 | 100.0 |
| 3 | 3 | 36 | 7 | 80.6 |
| 4 | 4 | 42 | 8 | 81.0 |
| 5 | 4 | 32 | 3 | 90.6 |
| 6 | 5 | 36 | 1 | 97.2 |
| 7 | 6 | 37 | 5 | 86.5 |
| 8 | 6 | 66 | 38 | None |

## Audit findings remediated before this validation

- IN-oakridge-international-school-gachibowli-hyderabad-e91962 `group_student_count`: MISMATCH — Source says 'More than 5000+ students from across Oakridge International Schools in India, recorded over 7.89 Lakh online sessions since August 2020' - a participation figure for online sessions, not group enrollment; '2020' is not a reporting year. Evidence retracted. (retracted: ev-5d97961bb9560a11)
- IN-indus-international-school-sarjapur-road-bengaluru-7e313a `student_teacher_ratio`: MISMATCH — Source: '25:2' applies only to Grades 1-3; Grades 3-12 are '25:1'. A single school-wide ratio misrepresents the source. Evidence retracted. (retracted: ev-cbc91580875ca088)
- IN-kunskapsskolan-dlf-phase-i-gurugram-6b053a `founding_year`: MISMATCH — 'The Kunskapsskolan Education program was founded in 1999' dates the Swedish education programme, not the Gurugram school. Evidence retracted. (retracted: ev-076dfa5d4a5efafc)
- IN-canadian-international-school-yelahanka-bengaluru-28c23a `subjects_offered`: MISMATCH — Item 'English' came from 'The working languages of IB are English, French and Spanish' (describes the IB, not CIS subjects). That evidence is retracted; Hindi/French/Spanish are correct ('option between Hindi, French, Mandarin and Spanish'). (retracted: ev-b0997a4ca34face2, ev-d141fc7e816a7412)
- IN-canadian-international-school-yelahanka-bengaluru-28c23a `school_type`: MISMATCH — Held 'boarding' came from facility text ('2 gender specific boarding...') under earlier rules; the school is day cum boarding per third-party profile, so 'boarding' alone is incomplete. Evidence retracted. (retracted: ev-521439f1a92a64ad, ev-71ddfe6c07e8eba1)
- IN-genesis-global-school-sector-132-noida-0e0ae3 `school_type`: MISMATCH — Held 'boarding' came from a residences contact line ('Head – Residences ... Best Bo[arding]'); Genesis also admits day students, so 'boarding' alone is incomplete. Evidence retracted. (retracted: ev-d43ba61110da8c8d)
- IN-the-aga-khan-academy-kurmalguda-hyderabad-ddb90b `subjects_offered`: MISMATCH — 'should have mastered at least two languages, including English' is an admission expectation, not a subject offered. Item evidence retracted. (retracted: ev-5b2c50d93c657ba2)
- IN-neev-academy-yemalur-yemalur-bengaluru-23a2c1 `teaching_methodology`: MISMATCH — 'STEAM precinct' is a facility name, not a stated methodology; other items (experiential, inquiry-based, Reggio Emilia) are correct. Item evidence retracted. (retracted: ev-d763f70e65e1afea)
- IN-the-international-school-bangalore-dommasandra-bengaluru-44ca38 `teaching_methodology`: MISMATCH — 'NPS Global Montessori Centres' is a sister institution in a list; 'concept-based curriculum' is correct. Item evidence retracted. (retracted: ev-d5a6c3cae51ae418)
- IN-indus-international-school-sarjapur-road-bengaluru-7e313a `grades_offered`: MISMATCH — 'Grade 3 to Grade 12 the ratio is 25:1' is a ratio statement, not the school's grade span. Evidence retracted; extractor rule added. (retracted: ev-f3225757bdc9a064)
- IN-ascend-international-school-bandra-east-mumbai-ee9af2 `founding_year`: MISMATCH — 'My kids started at Ascend in 2012' is a parent testimonial, not a founding date. Evidence retracted; extractor rule added. (retracted: ev-25b7c661bad02b92, ev-c03ec3e4e36efb51)
- IN-ascend-international-school-bandra-east-mumbai-ee9af2 `founding_year`: MISMATCH — 'The school newspaper ... was set up at the start of the 2017/18 academic year' dates the newspaper, not the school. Evidence retracted; extractor rule extended. (retracted: ev-e87f3b533b675b02, ev-1b76e33429fb90ac)
- IN-ascend-international-school-bandra-east-mumbai-ee9af2 `founding_year`: SOURCE_ERROR — Ezyschooling 'Estd. 1945' is read correctly, but the official site attributes 1945 to the parent Kasegaon Education Society ('Established in Maharashtra in 1945 by Shri Rajarambapu Patil'); the aggregator appears to have copied the society's date. Retracted so the field shows 'not publicly available' rather than a wrong year. (retracted: ev-ef15e9d824121e51)
- IN-10x-international-school-sarjapur-bengaluru-6c9648 `curriculum_by_grade`: MISMATCH — 'MYP year 4 & 5' parsed as grades 4-5 (fixed by rule). The site card 'IB MYP Grades 11 & 12' is a source typo contradicted on the same site ('IB Diploma Programme in Grades 11–12'); that item is retracted as SOURCE_ERROR. (retracted: ev-2a3d593b0742fb4c)
- IN-the-international-school-bangalore-dommasandra-bengaluru-44ca38 `decision_maker_roles`: MISMATCH — 'IBDP Coordinator' came from a staff member's career list ('Boarding House Master, IBDP Coordinator, Deputy Principal – Pastoral, and now'); ownership of the current role is unclear. Item retracted. Principal/Director/Chairman items are correct. (retracted: ev-9db698f811ff95b1)
- IN-ascend-international-school-bandra-east-mumbai-ee9af2 `campus_student_count`: MISMATCH — 'Kasegaon Society runs 46 institutes ... provides education to more than 26,000 students' - parent society total, not campus enrollment. Caught by the independent validator (R05); evidence retracted and extractor rules added. (retracted: ev-7d89356bfa80656a)
- IN-indus-international-school-sarjapur-road-bengaluru-7e313a `campus_student_count`: MISMATCH — 'Established on July 14th, 2003 with an initial enrollment of 135 students' - historical founding enrollment, not current. Caught by the independent validator (R05); evidence retracted and extractor rules added. (retracted: ev-57893d8b09ed633b)
- IN-inventure-academy-sarjapur-road-bengaluru-f8edb8 `campus_student_count`: MISMATCH — '3 Campuses ... 1500+ Students' - total across three campuses, not this campus. Caught by the independent validator (R05); evidence retracted and extractor rules added. (retracted: ev-ee147053c2f049ec, ev-8a2b576b1d029e67)
- IN-treamis-world-school-electronic-city-bengaluru-63ce3c `campus_student_count`: MISMATCH — 'Bharatiya Samskriti Vidyapith, an institution founded in 1957 ... over 3000 students from preschool to college' - parent institution's count. Caught by the independent validator (R05); evidence retracted and extractor rules added. (retracted: ev-ef2720978434d0ce)
- IN-amity-global-school-sector-46-gurugram-de177f `group_student_count`: MISMATCH — 'Amity Education Group 200,000 Students Enrolled ... 12 Universities' includes universities; misleading as school-group reach. Evidence retracted. (retracted: ev-cb41412cd1833aa6)
- IN-dlrc-school-baner-pune-93d77f `group_student_count`: MISMATCH — Artifact of an intermediate scope rule: '300 students' is this single campus, not a group count. Evidence retracted. (retracted: ev-320ad0078cdc589f)
- IN-indus-international-school-sarjapur-road-bengaluru-7e313a `group_student_count`: MISMATCH — 'established on 14th July 2003 with 135 students' is the founding enrollment, not a group count. Evidence retracted. (retracted: ev-b419c50cb16d4e34)
- IN-solitaire-global-schools-upperpally-hyderabad-ce6673 `group_student_count`: MISMATCH — Artifact of an intermediate scope rule: 'student body comprising about 1500 students' is this school, not a group count. Evidence retracted. (retracted: ev-9bc09ec8cd34c435)
- IN-universal-wisdom-school-balewadi-pune-1dfa04 `group_student_count`: MISMATCH — 'The Wakad campus celebrates 15 successful years with over 5,000 students' describes another campus (and likely cumulative), not this Balewadi campus. Evidence retracted. (retracted: ev-4fde3d610ca71625)
- IN-discovery-den-micro-school-nallagandla-hyderabad-0e703d `curricula`: MISMATCH — 'Primary Years Program (Grades 1-5)' on a page that never mentions the IB is a generic label, not evidence of IB PYP. Item retracted; rule added (IB codes require an IB mention on the page). IGCSE item is third-party only. (retracted: ev-012662417e1a9768)
- IN-jg-international-school-ahmedabad-65aa6f `curriculum_by_grade`: MISMATCH — Page lists 'Classes IX and X: : IGCSE Classes XI and XII: : AS and A Levels Classes VII to X: : ICSE' — each range labels the programme that FOLLOWS it; 'AS/A Levels 7–10' pairs the wrong range. Fixed by extractor rule (ranges followed by ':' label the next programme). (retracted: none)
- IN-ryan-global-school-kundalahalli-bengaluru-069227 `subjects_offered`: MISMATCH — 'Hindi' came from admission documents '(Hindi/English language) Birth Certificate', not a subject offered. Fixed by extractor rule (document/certificate context ignored). (retracted: none)
- IN-ram-ratna-vidya-mandir-mumbai-a05880 `city`: MISMATCH — Fee PDF line 'Transportation Charges: Mira Bhayander … and Mumbai Students - Rs. 56500/-' describes where students travel from, not the school's city. School address is Uttan, Bhayander (W), Thane district. Fixed by extractor rule (city mentions in transport/fee context ignored). Previously shown value is kept by the regression guard, so the evidence is retracted (audited). (retracted: ev-08f4329762aed0bb)
- IN-pragyanam-school-sector-65-gurugram-059503 `student_teacher_ratio`: MISMATCH — '1:10 for pre-primary, 1:15 for Grade 1-5, and 1:30 for Grade 6 onwards' — 1:10 is the pre-primary ratio only; a single school-wide ratio misrepresents the source. Fixed by extractor rule (stage-scoped ratios ignored). (retracted: none)
- IN-vishwashanti-gurukul-world-school-pune-722d3c `curriculum_by_grade`: MISMATCH — 'Explore MYP' is a link label before 'Diploma Programme (DP) … (Grade 11-12)'; MYP 11–12 is wrong. Fixed by extractor rule (link labels such as 'Explore X' ignored). (retracted: none)
- IN-b-d-somani-international-school-cuffe-parade-mumbai-19201a `campus_student_count`: MISMATCH — 'The IGCSE program … currently has 130 students' — one programme, not the school. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-86f6105e53d63f87, ev-e06b2edf42f4cad9)
- IN-bishop-cotton-school-shimla-24671b `campus_student_count`: MISMATCH — '120 children supported since 2015' — outreach/sponsorship, not enrolment. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-2d6072d6fb337974)
- IN-chaman-bhartiya-school-kannuru-bengaluru-5b7b07 `campus_student_count`: MISMATCH — 'can comfortably accommodate 500 learners' — facility capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-4c6f104a1145bb89)
- IN-colonel-satsangi-s-kiran-memorial-public-school-chattarpur-delhi-8e738a `campus_student_count`: MISMATCH — 'seating for about 1500 children' — gallery seating capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-1a363fda07407202)
- IN-delhi-international-school-sinhasa-indore-ef8d12 `campus_student_count`: MISMATCH — 'dining hall that accommodates up to 1,000 students' — capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-083a15a4783138bc)
- IN-elpro-international-school-chinchwad-pune-03e545 `campus_student_count`: MISMATCH — '238 Students Scoring 90%+' — exam result, not enrolment. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-53be50c5614a6ec6)
- IN-harvest-international-school-ludhiana-8bca59 `campus_student_count`: MISMATCH — 'Join Over 5,000 Students, It Will be Your Best Move Ever!' — marketing slogan. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-2dc2b1ee28b560f2)
- IN-kiit-international-school-bhubaneswar-bbsr-6b3127 `campus_student_count`: MISMATCH — 'presentation in front of more than 600 children' — event audience. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-42f2e8a7891099c1)
- IN-kuriakose-elias-english-medium-school-mannanam-kottayam-d4988c `campus_student_count`: MISMATCH — 'Chavara Hall which accommodates around 2000 students' — hall capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-24e3f5fa2f1c47ce)
- IN-manthan-international-school-tellapur-hyderabad-34d543 `campus_student_count`: MISMATCH — 'fleet of over 50 buses … more than 1,400 students every day' — transport ridership. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-8b1d71ed53b6ab1d)
- IN-modern-high-school-international-ballygunge-kolkata-511ae0 `campus_student_count`: MISMATCH — '5th Oct 2026 Students visited Patuapara' — a date, not a count. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-07da89f6169cc530)
- IN-modern-public-school-sector-37-faridabad-943feb `campus_student_count`: MISMATCH — 'on 21/10/ 2022 Students from classes 10 to 12 went' — a date, not a count. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-62035132b1dd0b21, ev-aaca76ff093d8e67)
- IN-national-academy-school-kodagu-coorg-773903 `campus_student_count`: MISMATCH — 'Join Over 500,000 Students Enjoying National Academy Now' — website template/marketing copy. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-135480f412c0acb6)
- IN-paramjyoti-school-east-godavari-a3dcad `campus_student_count`: MISMATCH — 'around 100 students from Reception to Grade 5' — Junior School section only. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-ba441b8d01693cba)
- IN-rose-manor-international-school-santacruz-west-mumbai-965a3f `campus_student_count`: MISMATCH — '2026 Students Council 2026 – 2027' — gallery heading, a year. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-297ba9148c7ab000, ev-128dd4bdcae11358, ev-d5de6ba623e2bcc8, ev-98b766ea1d82528b, ev-698cb764a03967de, ev-67fc2183fc9933b4, ev-1e4be6120d4665bc, ev-4dd026308f78e2f1, ev-0e171c1c866a6084, ev-d1ac2732736f99c0)
- IN-spring-buds-international-preschool-juhu-mumbai-85de7f `campus_student_count`: MISMATCH — '35000 + Students' across multiple locations — group total, not this campus. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-76469280027d7238)
- IN-sree-vidyanikethan-international-school-tirupati-93e8c2 `campus_student_count`: MISMATCH — 'Student Strength 2026-27' — document title, a year. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-b37f946bce9eea9d, ev-6a08cb8152da8bee)
- IN-st-josephs-international-school-hisar-c08adc `campus_student_count`: MISMATCH — 'With a capacity for 2,000 students' — capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-f721e42b481f292b)
- IN-st-xavier-s-high-school-fort-mumbai-6253a9 `campus_student_count`: MISMATCH — 'The Hall … had a capacity for 700 children' (1930s history) — capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-66a476c8221e4317)
- IN-svkm-international-school-vile-parle-west-mumbai-080ab9 `campus_student_count`: MISMATCH — 'more than 40,000 students through over 25 prestigious institutions' — trust-wide total. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-22b9c899e59cfcb8)
- IN-the-amaatra-academy-haralur-bengaluru-70dd4e `campus_student_count`: MISMATCH — 'November 16, 2023 Children's Day' — a date, not a count. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-de0d9066d9d918c0)
- IN-the-lawrence-school-sanawar-sanawar-tls-solan-78542e `campus_student_count`: MISMATCH — 'By 1853 the strength had grown to 195 pupils' — historical. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-6fbedc94ad83de44)
- IN-the-polymath-school-bhiwandi-thane-4b3b25 `campus_student_count`: MISMATCH — 'auditorium which can sit 400 students' — capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-191559286cc08c6d, ev-14230e379a3ab907)
- IN-delhi-public-school-udaipur-e4864a `campus_student_count`: MISMATCH — 'Near about 125 children have taken up this sport' — skating participants. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-e1df78238c232d2f)
- IN-oberoi-international-school-btm-layout-mumbai-8cc73b `campus_student_count`: MISMATCH — 'roughly 110 students per grade' — per-grade figure. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-9a91bee0c814b089)
- IN-sagebrook-international-school-puppalguda-hyderabad-86cd81 `campus_student_count`: MISMATCH — 'Suchitra is home to over 2,200 students' — the founder's other school. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-10553cba1d779b52)
- IN-sri-shakthi-international-school-tiruppur-dc2685 `campus_student_count`: MISMATCH — 'Institute of Engineering and Technology … 240 students' — engineering college. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-add1889a0aceff2c)
- IN-universal-wisdom-school-balewadi-pune-1dfa04 `campus_student_count`: MISMATCH — 'the school saw phenomenal growth … over 2,200 students in 5 years' — in a staff biography; refers to another campus/school, not Balewadi. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-a69bb0818a0f8e64)
- IN-the-beacon-school-sector-64-gurugram-f8fa12 `campus_student_count`: MISMATCH — 'Delhi World Public School Noida Extension With 3,000+ students' — another school. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-a4377d7cd1bb4148, ev-4c27b39019cc417e)
- IN-paul-george-global-school-alaknanda-delhi-bd1774 `group_student_count`: MISMATCH — 'with a capacity of nearly 2000 students' — capacity. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-a23ca0f522d1691f)
- IN-ryan-global-school-andheri-west-mumbai-c5b960 `group_student_count`: MISMATCH — 'nearly 2,50,000+ students' read as 50,000 (Indian digit grouping) — misread number. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-608ef2a8606badec)
- IN-ryan-global-school-kharghar-navi-mumbai-35f3b0 `group_student_count`: MISMATCH — 'nearly 2,50,000+ students' read as 50,000 (Indian digit grouping) — misread number. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-f461c765f57de229)
- IN-podar-international-school-ayodhya-nagar-bhopal-f59f45 `group_student_count`: MISMATCH — 'more than 2,75,000 students' read as 75,000 (Indian digit grouping) — misread number. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-c93cf3dacc9bcc2e, ev-ef30f173bbca1fbb)
- IN-gitanjali-senior-school-begumpet-hyderabad-c9632a `group_student_count`: MISMATCH — 'from a school with 500 students to 5 campuses' — historical starting size. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-fc171e6876640c54)
- IN-mount-abu-public-school-sector-5-sector-5-maps-delhi-1367cf `group_student_count`: MISMATCH — 'a group of 150 students showcased' — event participants. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-51c5a17ecb8085a6, ev-8924eaaf9153c4d9)
- IN-shishukunj-international-school-bypass-road-indore-146134 `group_student_count`: MISMATCH — 'The Ei ASSET is taken by over 350,000 students' — test-takers nationally. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-a40b708f03aaad2a, ev-abd7c2b4a88789ff)
- IN-singapore-international-school-dahisar-east-mumbai-eb7491 `group_student_count`: MISMATCH — 'IB diploma section serving over 200 students' — one section. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-bb7c934cdf603fec)
- IN-the-international-school-of-thrissur-thrissur-369ee0 `group_student_count`: MISMATCH — 'More than 250,000 students worldwide sat for the Cambridge IGCSE' — worldwide exam candidates. Found reviewing the dashboard after slice 6 (round 8); extractor rule added and evidence retracted. (retracted: ev-0c0b7c3bd9709b14)
- IN-the-beacon-school-sector-64-gurugram-f8fa12 `campus_student_count`: MISMATCH — Leadership biography: 'steering several educational institutions that currently have an enrolment of over 11,000 students' — total across several institutions, not The Beacon School. Rule fixed (plural 'institutions') and evidence retracted. (retracted: ev-f235c5075ea49eb5)

## Quality gates

| Gate | Actual | Target | Status |
|---|---|---|---|
| JSON schema validation | 100.0 | 100 | MET |
| Evidence coverage for reported factual claims | 100.0 | 100 | MET |
| Independently audited factual accuracy (audited sample) | 100.0 | 100 | MET |
| Duplicate canonical campus IDs | 0 | 0 | MET |
| Unresolved conflicts presented as verified | 0 | 0 | MET |
| Unsupported values presented as facts | 0 | 0 | MET |
| Required-field coverage | 70.2 | report | REPORTED |
| Official (registry) curriculum verification | 6.5 | 95 | NOT MET |
| Verified, dated fee coverage | 0.0 | 80 | NOT MET |
| Verified enrollment coverage | 0.0 | report | REPORTED |

## Validation rules

| Rule | Critical | Checked | Failed | Status |
|---|---|---|---|---|
| R15_structure: All output files pass structural validation | True | 6715 | 0 | PASS |
| R02_unique_campus: Every school has a unique campus identity | True | 587 | 0 | PASS |
| R01_india: Every school is physically located in India | True | 587 | 0 | PASS |
| R03_groups: Every group-to-campus relationship is supported | True | 64 | 0 | PASS |
| R04_fees: Every fee matches its source, academic year and fee type | True | 437 | 0 | PASS |
| R05_enrollment: Every student count matches its source and reporting year | True | 14 | 0 | PASS |
| R06_curriculum: Every curriculum marked verified matches official evidence | True | 573 | 0 | PASS |
| R07_history: Every historical event has dated supporting evidence | True | 3016 | 0 | PASS |
| R14_supported: No fabricated, unsupported or mock values presented as facts | True | 8578 | 0 | PASS |
| R13_conflicts: Every unresolved conflict is visible and none is presented as verified | True | 417 | 0 | PASS |
| R08_premium_rules: Every premium category follows the configured rules | True | 587 | 0 | PASS |
| R09_fit_analysis: Every MASTEREDGE fit assessment is labelled analysis and recomputable | True | 587 | 0 | PASS |
| R12_percentages: Every reported percentage is recalculated from the final data | True | 18 | 0 | PASS |
| R10_report_numbers: Every CEO report number matches the final JSON | True | 590 | 0 | PASS |
| R11_report_sources: Every factual report row includes its source reference | True | 12914 | 0 | PASS |
| R16_audit: Independently audited factual accuracy on the audited sample | True | 40 | 0 | PASS |
| R00_read_only: Validator did not modify any validated file | True | 7 | 0 | PASS |

## Failed validation rules (first 40)

- none
