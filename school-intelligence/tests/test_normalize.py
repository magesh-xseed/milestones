import pytest

from masteredge import normalize as N


@pytest.mark.parametrize("text,expected", [
    ("₹3,60,000 /year", 360000),
    ("Rs. 1.2 Cr", 12000000),
    ("INR 4,50,000", 450000),
    ("₹ 30 K", 30000),
    ("₹3.6 Lakhs", 360000),
    ("rupees 75000", 75000),
    ("4,50,000", None),          # bare numbers are never treated as money
    ("", None),
])
def test_parse_money(text, expected):
    assert N.parse_money(text) == expected


def test_parse_money_range_lakhs():
    assert N.parse_money_range("ranges from ₹3.6 Lakhs to ₹10.5 Lakhs *") == (360000, 1050000, "₹3.6 Lakhs to ₹10.5 Lakhs")


def test_parse_money_range_shared_unit():
    lo, hi, _ = N.parse_money_range("between ₹3.6 to 10.5 Lakhs")
    assert (lo, hi) == (360000, 1050000)


@pytest.mark.parametrize("text,expected", [
    ("Fee Structure for 2027-2028 Academic", "2027-28"),
    ("AY 2025-26", "2025-26"),
    ("2025/26 session", "2025-26"),
    ("2019-2024 strategic plan", None),  # not consecutive -> not an academic year
])
def test_academic_year(text, expected):
    assert N.parse_academic_year(text) == expected


@pytest.mark.parametrize("text,expected", [
    ("Nursery to 5th Grade IB", (-2, 5)),
    ("6th Grade to 10th Grade", (6, 10)),
    ("Nursery - 12 Class", (-2, 12)),
    ("Classes I to XII", (1, 12)),
    ("Pre-K to Grade 12", (-1, 12)),
    ("KG to Grade 12", (-1, 12)),
    ("11th Grade & 12th Grade", (11, 12)),
    ("K-12 school", (0, 12)),
    ("Age Range: 2 to 16", None),          # ages are not grades
    ("Grade 1 to 5 years old", None),
])
def test_grade_range(text, expected):
    r = N.parse_grade_range(text)
    assert (r[:2] if r else None) == expected


def test_curriculum_mapping():
    t = "Curriculum: IB, CBSE. IB Diploma Programme for 11-12. IGCSE and AS & A Levels. ICSE and ISC."
    codes = {c for c, _, _, _ in N.detect_curricula(t)}
    assert {"IB", "CBSE", "IB_DP", "CAMBRIDGE_IGCSE", "CAMBRIDGE_AS_A_LEVEL", "ICSE", "ISC"} <= codes
    assert N.curriculum_family("IB_PYP") == "IB"
    assert N.curriculum_family("ISC") == "CISCE"


def test_curriculum_no_false_positive_on_plain_words():
    codes = {c for c, _, _, _ in N.detect_curricula("We visited the ISCO office and a cambridge-style building.")}
    assert "ISC" not in codes
