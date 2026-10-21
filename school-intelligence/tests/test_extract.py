from masteredge import extract as X
from masteredge.adapters.ezyschooling import parse_fee_table
from masteredge.textify import Document


def doc(text, url="https://school.in/about/", title="About"):
    return Document(url=url, title=title, text=text)


def by_field(exs, name):
    return [e for e in exs if e.field_name == name]


def test_fee_range_with_year_and_period():
    exs = X.extract_fees(doc("The annual tuition fee for the academic year 2025-26 ranges from ₹4.5 Lakhs to ₹7.2 Lakhs per annum for day scholars."))
    fee = by_field(exs, "annual_fee")[0]
    assert fee.normalized_value["min"] == 450000 and fee.normalized_value["max"] == 720000
    assert fee.normalized_value["academic_year"] == "2025-26"
    assert fee.normalized_value["period"] == "annual"
    assert fee.normalized_value["fee_type"] == "day"
    assert fee.raw_value in fee.evidence_excerpt


def test_fee_period_not_assumed():
    fee = by_field(X.extract_fees(doc("Fee Details Nursery to Grade 12 ranges from ₹3.6 Lakhs to ₹10.5 Lakhs *")), "annual_fee")[0]
    assert fee.normalized_value["period"] == "unspecified"
    assert fee.normalized_value["academic_year"] is None
    assert (fee.normalized_value["grade_min"], fee.normalized_value["grade_max"]) == (-2, 12)


def test_monthly_fee_never_annualised():
    assert by_field(X.extract_fees(doc("Transport fee is ₹6,000 per month.")), "annual_fee") == []


def test_application_fee_is_admission_charge():
    exs = X.extract_fees(doc("A one-time application fee of ₹5,000 is payable at registration."))
    assert by_field(exs, "annual_fee") == []
    assert by_field(exs, "admission_charges")[0].normalized_value["amount"] == 5000


def test_missing_fee_yields_nothing():
    assert X.extract_fees(doc("Please contact the admissions office for fee details.")) == []


def test_curricula_ignored_on_editorial_pages():
    d = doc("Parents compare Cambridge A Levels, ISC and CBSE.", url="https://school.in/blog/ib-vs-cbse/")
    assert X.extract_curricula(d) == []


def test_curriculum_by_grade():
    exs = X.extract_curriculum_by_grade(doc("IB Primary Years Programme Nursery to 5th Grade IB Middle Years Programme 6th Grade to 10th Grade"))
    got = {(e.normalized_value["code"], e.normalized_value["grade_min"], e.normalized_value["grade_max"]) for e in exs}
    assert ("IB_PYP", -2, 5) in got and ("IB_MYP", 6, 10) in got


def test_student_count_scope_and_year():
    exs = X.extract_student_counts(doc("Our campus has 1,800 students as of 2025."), standalone_domain=True)
    e = by_field(exs, "campus_student_count")[0]
    assert e.normalized_value == 1800 and e.qualifiers["scope"] == "campus" and e.qualifiers["reporting_year"] == "2025"


def test_group_count_never_campus():
    exs = X.extract_student_counts(doc("We educate 25,000 students across 30 campuses in India."), standalone_domain=True)
    assert by_field(exs, "campus_student_count") == []
    assert by_field(exs, "group_student_count")[0].qualifiers["scope"] == "group"


def test_participation_figures_are_not_enrollment():
    t = "More than 5000+ students from across Oakridge International Schools in India, recorded over 7.89 Lakh online sessions since August 2020"
    assert X.extract_student_counts(doc(t), standalone_domain=False) == []


def test_unspecified_scope_on_shared_domain():
    e = X.extract_student_counts(doc("The school has 1,200 students."), standalone_domain=False)[0]
    assert e.qualifiers["scope"] == "unspecified"


def test_founding_year():
    e = X.extract_founding_year(doc("Greenfield was established in 1998 in Pune."))[0]
    assert e.normalized_value == 1998


def test_contacts_exclude_named_people():
    d = doc("Landline: 020-26123456 For Admissions: Ramesh – 9876543210 Email: admissions@greenfieldschool.in or ramesh.k@greenfieldschool.in",
            url="https://school.in/contact/", title="Contact Us")
    vals = {e.normalized_value["value"] for e in X.extract_contacts(d)}
    assert "020-26123456" in vals and "admissions@greenfieldschool.in" in vals
    assert "9876543210" not in vals and "ramesh.k@greenfieldschool.in" not in vals


def test_subjects_require_subject_context_and_skip_institutions():
    d = doc("Subjects Studied English Mathematics Physics. Alumni joined the London School of Economics and Political Science.",
            url="https://school.in/academics/senior/", title="Academics")
    subj = {e.normalized_value for e in X.extract_academics(d) if e.field_name == "subjects_offered"}
    assert {"English", "Mathematics", "Physics"} <= subj
    assert "Political Science" not in subj and "Economics" not in subj


def test_assessment_requires_adjacent_context():
    d = doc("To plan and manage their own learning through reflective logs, independent study, dissertations, work placement and "
            "portfolio development To test ideas and evidences through seminars, presentations, literature reviewing, and peer assessments")
    assert not [e for e in X.extract_academics(d) if e.field_name == "assessment_methodology" and e.normalized_value == "portfolio"]


def test_ib_code_from_link():
    d = Document(url="https://school.in/", title="Home", text="IB World School",
                 links=[("https://www.ibo.org/school/051234/", "Our IB page")])
    e = [x for x in X.extract_affiliations(d) if x.normalized_value["type"] == "ib_school_code"][0]
    assert e.normalized_value["id"] == "051234"


def test_campus_count_ignores_seo_and_network_text():
    d = doc("Top 10 schools in Gachibowli. Part of an elite group of 81 schools in five continents.")
    assert X.extract_campus_count(d) == []


def test_ezyschooling_fee_table():
    text = ("Fee Structure for 2027-2028 Academic Session 2026-2027 2027-2028 Class Admission Status Fee Fee Details "
            "Nursery Ongoing Total Fee ₹30,000 /month ₹3,60,000 /year ₹3,60,000 /year View Fee "
            "Class 12 Yet to Begin Total Fee ₹40,000 /month ₹4,80,000 /year View Fee These fee structures are accurate")
    ex = parse_fee_table(text)
    assert ex.normalized_value["min"] == 360000 and ex.normalized_value["max"] == 480000
    assert ex.normalized_value["academic_year"] == "2027-28" and ex.normalized_value["period"] == "annual"
    assert all(p in ex.evidence_excerpt for p in ex.raw_value.split(" … "))


def test_admission_balance_in_pdf_text_is_not_tuition():
    """Regression from the slice-3 audit: PDF text without punctuation mixed an admission balance into 'Fees'."""
    t = ("Admission Fees - INR 50,000/- per application for Early Years. The balance of INR 150,000/- is payable to the "
         "school when the student enter year 1 of the Primary Programme All of the above amounts are in Indian Rupees "
         "Fees 1st Sibling 10% 2nd Sibling 20%")
    exs = X.extract_fees(doc(t, url="https://school.in/fees.pdf"))
    assert by_field(exs, "annual_fee") == []


def test_amount_far_from_fee_keyword_ignored():
    t = "Fee details are available on request " + "x " * 120 + "Our new block cost ₹5 Crore."
    assert X.extract_fees(doc(t)) == []


def test_candidate_status_and_noise_not_curricula():
    d = doc("Kunskapsskolan Gurgaon is an IBDP and IBMYP Authorised school and PYP candidate school*. Read the PYP Newsletter.",
            url="https://school.in/academics/")
    codes = {e.normalized_value["code"] for e in X.extract_curricula(d)}
    assert "IB_PYP" not in codes and "IB_DP" in codes


def test_staff_bios_not_curricula():
    d = doc("In Mexico and Morocco, she took on the roles of Academic Dean and PYP Coordinator.",
            url="https://school.in/about-us/meet-the-leadership/")
    assert X.extract_curricula(d) == []


def test_curriculum_grade_range_not_borrowed_from_next_programme():
    d = doc("Primary Years Programme (PYP) Class I-V Middle Years Programme (MYP) Class VI-X IB Diploma Programme (DP) Grade 11-12")
    got = {e.normalized_value["code"]: (e.normalized_value["grade_min"], e.normalized_value["grade_max"]) for e in X.extract_curriculum_by_grade(d)}
    assert got.get("IB_PYP") in (None, (1, 5)) and got.get("IB_MYP") in (None, (6, 10))
    assert got.get("IB_PYP") != (6, 10)


def test_roles_must_belong_to_school():
    d = doc("Lt Gen Ray, Founder MD & CEO of Indus Trust, spoke at the event. Message from the Principal: welcome.",
            url="https://school.in/", title="Home")
    roles = {e.normalized_value for e in X.extract_roles(d)}
    assert "CEO" not in roles and "Principal" in roles


def test_facilities_are_not_subjects():
    d = doc("Subjects and spaces include Music classrooms, Science Laboratories and English as an Additional Language support.",
            url="https://school.in/academics/", title="Academics")
    assert [e for e in X.extract_academics(d) if e.field_name == "subjects_offered"] == []


def test_history_claims_specific_codes_and_lists():
    d = doc("We were authorised by the IB to offer the Diploma Programme in 2010, the Primary Years Programme in 2011 "
            "and the Middle Years Programme in 2012. MIS has continuously offered the five years IB Middle Years Programme since 1999.",
            url="https://school.in/about/")
    got = {(e.normalized_value["code"], e.normalized_value["year"]) for e in X.extract_history_claims(d)}
    assert {("IB_DP", 2010), ("IB_PYP", 2011), ("IB_MYP", 2012), ("IB_MYP", 1999)} <= got


def test_history_claims_ignore_staff_careers():
    d = doc("A Visual Arts specialist, IB Examiner and Examination Team Leader since 2015.", url="https://school.in/school-leadership-team")
    assert X.extract_history_claims(d) == []


def test_grades_offered_ignores_intake_and_sections():
    for t in ("Applications are open for KG to Grade 9 for the academic year.",
              "HIXS Primary (Nursery to Grade 2) HIXS Middle & Senior (Grade 3 to Grade 11)",
              "Contingency Deposit: Grades 1 – 12 (Day Students): 20,000"):
        assert X.extract_grades_offered(doc(t)) == [], t
    assert X.extract_grades_offered(doc("We offer classes from Nursery to Grade 12."))[0].normalized_value == {"grade_min": -2, "grade_max": 12}


def test_roles_on_leadership_page_and_corporate_roles_excluded():
    d = doc("HEAD OF SCHOOL Dr Caroline Pascoe Head of School Harrow International School Bengaluru. "
            "Shri X has been the Managing Director of the Travancore Rayons Ltd and also served as a Director on boards.",
            url="https://school.in/about/leadership/", title="Leadership")
    roles = {e.normalized_value for e in X.extract_roles(d)}
    assert "Head of School" in roles and "Managing Director" not in roles and "Director" not in roles


def test_programme_years_and_careers_not_curriculum_facts():
    d = doc("We offer a comprehensive 2-year program in Grades 9 & 10, known as MYP year 4 & 5.", url="https://school.in/academics/")
    assert not [e for e in X.extract_curriculum_by_grade(d) if e.normalized_value["grade_min"] == 4]
    d2 = doc("Jyothi has worked in leading CBSE and IB schools for twenty years.", url="https://school.in/")
    assert X.extract_curricula(d2) == []
    assert X.extract_grades_offered(doc("The CBSE curriculum for Grades 1 to 12 at GGS is designed under NEP.")) == []


def test_board_comparisons_and_boarding_eligibility_ignored():
    assert X.extract_curricula(doc("Depth all the way to Grade 12, which becomes compromised in higher classes in CBSE.", url="https://s.in/")) == []
    assert X.extract_grades_offered(doc("The GGS Boarding is a residential facility where students from Grades 1 -12 can choose to live.")) == []


def test_multi_campus_and_parent_counts_not_campus_enrollment():
    t = "3 Campuses Three distinct campuses. One way of thinking about learning. 1500+ Students Growing into thinkers."
    assert X.extract_student_counts(doc(t), standalone_domain=True)[0].field_name == "group_student_count"
    t2 = "Bharatiya Samskriti Vidyapith, an institution founded in 1957, which provides educational services to over 3000 students from preschool to college."
    assert X.extract_student_counts(doc(t2), standalone_domain=True) == []


def test_council_name_is_cisce_not_isc():
    codes = {c for c, _, _, _ in __import__("masteredge.normalize", fromlist=["x"]).detect_curricula(
        "governed by the Council for the Indian School Certificate Examinations (CISCE)")}
    assert "ISC" not in codes and "CISCE" in codes


def test_initial_enrollment_and_unrelated_across_handled():
    assert X.extract_student_counts(doc("Established in 2003 with an initial enrollment of 135 students."), True) == []
    t = "We started with high school but admitted students across grades as we expanded. We now have 300 students and a team of 50 facilitators."
    e = X.extract_student_counts(doc(t), True)[0]
    assert e.field_name == "campus_student_count" and e.normalized_value == 300


def test_generic_primary_years_label_is_not_ib():
    assert X.extract_curricula(doc("Primary Years Program (Grades 1-5): curiosity deepens.", url="https://s.in/our-programmes/")) == []
    codes = {e.normalized_value["code"] for e in X.extract_curricula(doc("Our IB Primary Years Programme runs from Grade 1.", url="https://s.in/academics/"))}
    assert "IB_PYP" in codes


def test_audit7_grade_range_labelling_next_programme():
    t = ("Curriculum Classes IX and X: : IGCSE Classes XI and XII: : AS and A Levels Classes VII to X: : ICSE "
         "Classes XI and XII: : ISC Diploma Programme")
    exs = X.extract_curriculum_by_grade(doc(t, url="https://school.in/curriculum/"))
    assert not any(e.normalized_value["code"].startswith("CAMBRIDGE_AS") and e.normalized_value["grade_min"] == 7 for e in exs)


def test_audit7_explore_link_label_is_not_a_programme():
    t = ("IB continuum. Explore MYP Diploma Programme (DP) For ages 16-19 (Grade 11-12) A rigorous academic framework "
         "for International Baccalaureate students")
    exs = X.extract_curriculum_by_grade(doc(t, url="https://school.in/ib/"))
    assert not any(e.normalized_value["code"] == "IB_MYP" for e in exs)


def test_audit7_stage_scoped_ratio_is_not_school_wide():
    t = "with a student-teacher ratio of 1:10 for pre-primary, 1:15 for Grade 1-5, and 1:30 for Grade 6 onwards."
    assert by_field(X.extract_ratios(doc(t)), "student_teacher_ratio") == []
    assert by_field(X.extract_ratios(doc("Our student-teacher ratio is 12:1 across the school.")), "student_teacher_ratio")


def test_audit7_admission_document_language_is_not_a_subject():
    t = ("Academics curriculum subjects offered. Documents required: Attested photo copy of Birth Certificate of the child "
         "(Hindi/English language) Medical certificate of the child")
    exs = X.extract_academics(doc(t, url="https://school.in/academics/curriculum/", title="Academics"))
    assert "Hindi" not in [e.normalized_value for e in by_field(exs, "subjects_offered")]


def test_audit7_city_in_transport_context_is_ignored():
    import re as _re
    text = "Transportation Charges :- Mira Bhayander - Rs.21000/- per year and Mumbai Students - Rs. 56500/- per year."
    hits = [x for x in _re.finditer(r"\bMumbai\b", text)
            if not _re.search(r"transport|bus (?:route|fee|charges)|pick[\s-]?up|drop", text[max(0, x.start() - 80):x.end() + 30], _re.I)
            and not _re.match(r"\s*students?\b", text[x.end():x.end() + 12], _re.I)]
    assert hits == []  # mirrors the official_site city guard


def _counts(t, standalone=True):
    return [(e.field_name, e.normalized_value) for e in X.extract_student_counts(doc(t), standalone)]


def test_audit8_student_count_false_positives():
    bad = [
        "Join Over 500,000 Students Enjoying National Academy Now",
        "Shutterbugs Visit to Patuapara 5th Oct 2026 Students visited Patuapara to photograph Durga idols",
        "a spacious dining hall that accommodates up to 1,000 students.",
        "an auditorium which can sit 400 students",
        "The IGCSE program at B.D. Somani International School currently has 130 students.",
        "Our Elementary School serves approximately 500 students in Pre-K–Grade 5.",
        "We will soon educate 1000 children who will achieve greatness.",
        "By 1853 the strength had grown to 195 pupils",
        "100% Pass Rate (X & XII) 238 Students Scoring 90%+",
        "120 children supported since 2015",
        "a presentation in front of more than 600 children sitting on the ground",
        "a fleet of over 50 buses, ensuring a safe journey for more than 1,400 students every day",
        "Over 2800 students from Montessori to Class XII celebrated International Yoga Day",
    ]
    for t in bad:
        assert not [c for c in _counts(t) if c[0] == "campus_student_count"], t


def test_audit8_student_count_true_positives_kept():
    assert ("campus_student_count", 300) in _counts("We now have 300 students and a team of 50 facilitators.")
    assert ("campus_student_count", 2200) in _counts("The school has grown from a mere 80 students in its first year to over 2200 students today.")
    assert ("campus_student_count", 1500) in _counts("The student body comprising about 1500 students, reflects the cultural diversity of India.")


def test_audit8_more_count_cases():
    assert not [c for c in _counts("There are a maximum of six sections at each grade level with roughly 110 students per grade.") if c[0] == "campus_student_count"]
    assert not [c for c in _counts("More than 250,000 students worldwide sat for the Cambridge IGCSE.") if c[0] == "campus_student_count"]
    assert not [c for c in _counts("Near about 125 children have taken up this sport.") if c[0] == "campus_student_count"]
    assert ("campus_student_count", 540) in _counts("The Welham community has grown from a mere ten students at its inception in 1957 to its current strength of 540 students.")
    grp = [c for c in _counts("Today, the Ryan International Group of Institutions has nearly 2,50,000+ students and 16,000+ educators")]
    # Indian digit grouping is never misread as 50,000; parent-institution totals are not kept at all
    assert not any(v == 50000 for _, v in grp) and not any(f == "campus_student_count" for f, _ in grp)
    from masteredge.extract import STUDENT_COUNT_RE
    assert STUDENT_COUNT_RE.search("nearly 2,50,000+ students").group(1) == "2,50,000"


def test_audit8_count_across_several_institutions():
    t = "Since 2011, he has been steering several educational institutions that currently have an enrolment of over 11,000 students."
    assert not [c for c in _counts(t) if c[0] == "campus_student_count"]
