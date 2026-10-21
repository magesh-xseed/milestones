"""Slice 6: sitemap screening, shortlisting rule, and dashboard build."""

import json

from masteredge.adapters.ezyschooling import _LOC_RE, PROFILE_RE, parse_listed_fee
from masteredge.config import load_config
from masteredge.dashboard import build_dashboard, directory_rows
from masteredge.pipeline import screen_qualifies

QUALIFY = {"min_listed_annual_fee_max": 250000, "board_families_always": ["IB", "CAMBRIDGE"],
           "require_official_website": True}


def entry(**kw):
    e = {"status": "done", "name": "Test School", "official_website": "https://test.school/",
         "board_families": ["CBSE"], "listed_fee": {"min": 90000, "max": 240000}}
    e.update(kw)
    return e


def test_profile_fee_table_monthly_annual_columns():
    t = ("Fee Structure for 2027-2028 Academic Session 2026-2027 2027-2028 Class Monthly Annual Total cost for first year "
         "Pre-school Nursery ₹7,500 ₹90,000 ₹90,000 LKG (K1) ₹7,500 ₹90,000 ₹90,000 "
         "Primary Class 1 ₹11,667 ₹1,40,000 ₹1,40,000 Class 10 ₹20,000 ₹2,40,000 ₹2,40,000")
    fee = parse_listed_fee(t)
    assert fee == {"min": 90000, "max": 240000, "session": "2027-2028", "rows": 4,
                   "by_grade": {"-2": 90000, "-1": 90000, "1": 140000, "10": 240000}}


def test_profile_fee_table_per_year_layout_and_missing():
    t = "Fee Structure for 2027-2028 Nursery Ongoing Total Fee ₹30,000 /month ₹3,60,000 /year View Fee"
    assert parse_listed_fee(t)["max"] == 360000
    assert parse_listed_fee("No fee table on this profile ₹1,500 application fee") is None


def test_sitemap_keeps_profiles_only():
    xml = ("<urlset><url><loc>https://ezyschooling.com/school/abc-school-pune</loc></url>"
           "<url><loc>https://ezyschooling.com/school/abc-school-pune/fees-structure</loc></url>"
           "<url><loc>https://ezyschooling.com/school/abc-school-pune/reviews</loc></url></urlset>")
    assert [u for u in _LOC_RE.findall(xml) if PROFILE_RE.match(u)] == ["https://ezyschooling.com/school/abc-school-pune"]


def test_qualifies_on_fee_threshold():
    assert screen_qualifies(entry(listed_fee={"min": 1, "max": 250000}), QUALIFY)[0]
    assert not screen_qualifies(entry(), QUALIFY)[0]


def test_qualifies_on_ib_or_cambridge_without_fee():
    ok, why = screen_qualifies(entry(listed_fee=None, board_families=["CAMBRIDGE", "CBSE"]), QUALIFY)
    assert ok and "CAMBRIDGE" in why


def test_rejects_without_website_or_failed_screen():
    assert not screen_qualifies(entry(official_website=None, listed_fee={"max": 900000}), QUALIFY)[0]
    assert not screen_qualifies({"status": "blocked"}, QUALIFY)[0]


def test_directory_marks_researched_and_maps_city():
    screen = {"https://ezyschooling.com/school/a-blr": entry(sitemap_city_slug="bangalore", locality="HSR",
                                                             listed_fee={"min": 1, "max": 500000}),
              "https://ezyschooling.com/school/b-blr": entry(sitemap_city_slug="bangalore", name="B School"),
              "https://ezyschooling.com/school/c-x": {"status": "failed"}}
    rows = directory_rows(screen, {"bangalore": ["Bengaluru", "Karnataka"]}, {"https://ezyschooling.com/school/a-blr"})
    assert [r["n"] for r in rows] == ["Test School", "B School"]  # sorted by listed fee, failed screens dropped
    assert rows[0]["city"] == "Bengaluru" and rows[0]["s"] is True and rows[1]["s"] is False


def test_dashboard_embeds_data_safely(tmp_path):
    cfg = load_config(output_dir=tmp_path)
    rec = {"school_id": "IN-x", "input": {"name": "X</script> School", "city": "Pune"}, "official_website_url": None,
           "fields": {"annual_fee": {"value": {"min": 400000, "max": 900000}}, "curricula": {"value": [{"family": "IB"}]},
                      "grades_offered": {"value": {"grade_min": -2, "grade_max": 12}}},
           "analysis": {"premium_category": {"value": "ultra_premium", "provisional": True},
                        "masteredge_fit": {"score": 50.0, "weights": {"academic_alignment": 15}, "components": {"academic_alignment": {"score": 1.0, "explanation": "x"}}}}}
    html = build_dashboard(cfg, [rec]).read_text(encoding="utf-8")
    assert "/*__DATA_SRC__*/" not in html and '<script src="premium_schools_data.js"></script>' in html
    js = (tmp_path / "premium_schools_data.js").read_text(encoding="utf-8")
    assert "X<\\/script> School" in js
    assert "const META" not in html
    data = json.loads(js.removeprefix("const DATA = ").split(";\nconst META = ", 1)[0])
    assert data[0]["t"] == "ultra_premium" and data[0]["cur"] == ["IB"]


def test_dashboard_lists_only_target_grade_schools(tmp_path):
    cfg = load_config(output_dir=tmp_path)
    mk = lambda sid, name, g: {"school_id": sid, "input": {"name": name, "city": "Pune"}, "official_website_url": None,
                               "fields": {"grades_offered": {"value": g}} if g else {},
                               "analysis": {"premium_category": {"value": "premium"},
                                            "masteredge_fit": {"score": 50.0, "weights": {"academic_alignment": 15}, "components": {"academic_alignment": {"score": 1.0, "explanation": "x"}}}}}
    build_dashboard(cfg, [mk("IN-a", "Primary School", {"grade_min": -3, "grade_max": 8}),
                          mk("IN-b", "Junior College", {"grade_min": 11, "grade_max": 12}),
                          mk("IN-c", "Unknown Grades School", None)])
    js = (tmp_path / "premium_schools_data.js").read_text(encoding="utf-8")
    assert "Primary School" in js and "Junior College" not in js and "Unknown Grades School" not in js


def test_listing_grade_span_reads_bare_class_ranges():
    from masteredge.dashboard import _grade_span
    assert _grade_span("1 - 12 Class", None) == (1, 12)
    assert _grade_span("Pre Nursery", None) == (-3, -3)
    assert _grade_span("-", None) is None


def test_priority_row_carries_sales_detail():
    from masteredge.dashboard import priority_rows
    rec = {"school_id": "IN-y", "input": {"name": "Y School", "city": "Pune", "ezyschooling_url": "https://ezyschooling.com/school/y"},
           "official_website_url": "https://y.school/",
           "fields": {"public_contact": {"value": [{"type": "phone", "value": "+91 20 1234 5678"},
                                                   {"type": "email", "value": "admissions@y.school"}], "status": "official_source"},
                      "grades_offered": {"value": {"grade_min": -2, "grade_max": 12}, "status": "official_source"},
                      "annual_fee": {"value": {"min": 400000, "max": 900000}, "status": "conflict"},
                      "teaching_methodology": {"value": ["steam_stem"], "status": "official_source"}},
           "data_gaps": [{"field": "campus_student_count", "gap_type": "missing"}],
           "analysis": {"premium_category": {"value": "ultra_premium", "provisional": True},
                        "recommendations": {"pitch_angle": "premium positioning: lead with outcomes; stated pedagogy: steam_stem",
                                            "recommended_grades": "Grade 1 – Grade 8"},
                        "masteredge_fit": {"score": 60.0, "weights": {"academic_alignment": 15},
                                           "components": {"academic_alignment": {"score": 1.0, "explanation": "x"}}}}}
    row = priority_rows([rec], (1, 8))[0]
    assert row["ph"] == ["+91 20 1234 5678"] and row["em"] == ["admissions@y.school"]
    assert row["tgt"] is True and row["g"] == "Nursery – Grade 12" and row["feeSrc"] == "sources differ"
    assert row["pitch"] == ["Premium positioning: lead with outcomes", "School describes its teaching as STEAM/STEM"]
    assert row["gaps"] == ["student enrolment"] and row["comps"][0]["k"] == "Nursery – Grade 8 overlap"


def test_profile_details_from_jsonld_excludes_contact_point():
    from masteredge.adapters.ezyschooling import profile_details
    from masteredge.textify import Document
    node = {"@type": "School", "name": "Z School", "alternateName": "ZS",
            "email": "person.name@z.school", "contactPoint": {"telephone": "9999999999", "email": "person.name@z.school"},
            "address": {"streetAddress": "Road 1, Guttala_Begumpet", "addressLocality": "Jubilee Hills",
                        "addressRegion": "Hyderabad", "postalCode": "500033"},
            "additionalProperty": [{"name": "Classes Available", "value": "Nursery - 10 Class"},
                                   {"name": "Smart Classes", "value": "Yes"}, {"name": "Gym", "value": "No"},
                                   {"name": "School Gender", "value": "Co-educational"}],
            "interactionStatistic": {"userInteractionCount": 42}}
    d = profile_details(Document(url="u", title="t", text="Admissions Ongoing Estd. 2002 Write a Review 4.0 / 5 verified 3 Verified",
                                 jsonld=[node]))
    assert d["addr"] == "Road 1, Guttala Begumpet, Jubilee Hills, Hyderabad 500033"
    assert d["facilities"] == ["Smart Classes"] and d["estd"] == 2002 and d["admissions"] == "Ongoing"
    assert (d["rating"], d["reviews"], d["views"]) == (4.0, 3, 42)
    assert "9999999999" not in json.dumps(d) and "person.name" not in json.dumps(d)


def test_directory_target_grade_fee_and_runs():
    from masteredge.dashboard import _fee_runs
    bg = {"-2": 90000, "-1": 90000, "1": 140000, "2": 140000, "8": 200000, "9": 220000}
    assert _fee_runs(bg) == [[-2, -1, 90000], [1, 2, 140000], [8, 8, 200000], [9, 9, 220000]]
    screen = {"https://ezyschooling.com/school/z": entry(sitemap_city_slug="hyderabad",
              listed_fee={"min": 90000, "max": 220000, "by_grade": bg},
              details={"classes": "Nursery - 10 Class", "facilities": ["Smart Classes"], "admissions": "Ongoing"})}
    row = directory_rows(screen, {}, set(), (-2, 8), {"Smart Classes": 0})[0]
    assert row["f18"] == [90000, 200000] and row["tgt"] is True and row["fac"] == [0] and row["gr"] == "Nursery – Grade 10"
    assert row["fr"] == [[-2, -1, 90000], [1, 2, 140000], [8, 8, 200000]]  # Grade 9+ fees left out


def test_annual_only_fee_rows():
    from masteredge.adapters.ezyschooling import parse_fee_table
    t = ("Fee Structure for 2027-2028 Class Admission Status Fee Fee Details Class 4 Ongoing Total Fee ₹2,60,000 /year "
         "View Fee Class 12 Ongoing Total Fee ₹3,70,000 /year View Fee These fee structures are accurate")
    ex = parse_fee_table(t)
    assert (ex.normalized_value["min"], ex.normalized_value["max"]) == (260000, 370000)


def test_state_from_address_last_component_only():
    from masteredge.adapters.ezyschooling import state_from_address
    states = ["Andhra Pradesh", "Uttar Pradesh", "Delhi", "Telangana"]
    assert state_from_address("R.C. Road , Tirupati , Andhra Pradesh - 517507", states)[1] == "Andhra Pradesh"
    assert state_from_address("Delhi Road, Meerut , Uttar Pradesh - 250001", states)[1] == "Uttar Pradesh"
    assert state_from_address("Khajaguda, Gachibowli , Hyderabad , - 500008", states) is None
    assert state_from_address("Delhi Public School Road, Hyderabad - 500008", states) is None  # state not last


def test_template_filler_evidence_is_rejected():
    from masteredge.pipeline import TEMPLATE_TEXT_RE
    assert TEMPLATE_TEXT_RE.search("Lorem Ipsum Email info@mysite.com Call 123-456-7890")
    assert TEMPLATE_TEXT_RE.search("Call 123-456-7890 today")
    assert not TEMPLATE_TEXT_RE.search("Call +91 40 6817 4111 or admissions@oakridge.in")


def test_city_display_aliases():
    from masteredge.dashboard import city_display
    assert [city_display(c) for c in ["Bangalore", "Gurgaon", "Visakhapatnam (Vizag)", "dharmapuri", "Kochi (Cochin)", "Pune"]] == \
        ["Bengaluru", "Gurugram", "Visakhapatnam", "Dharmapuri", "Kochi", "Pune"]


def test_jsonld_name_with_trailing_carriage_return():
    from masteredge.adapters.ezyschooling import _raw_jsonld_excerpt
    raw = '{"@type":"School","name":"Shaheen\'s Falcon PU College\\r","url":"x"}'
    ex = _raw_jsonld_excerpt(raw, "name", "Shaheen's Falcon PU College")
    assert ex == '"name":"Shaheen\'s Falcon PU College\\r"' and "Shaheen's Falcon PU College" in ex
