"""Documented, lossless normalisations. Raw text is always kept by the caller.

Money:  "₹3.6 Lakhs" -> 360000, "Rs. 1.2 Cr" -> 12000000, "₹3,60,000" -> 360000
Grades: Nursery=-2, LKG/KG1/Pre-K=-1, UKG/KG2/Kindergarten=0, Grade/Class/Year n = n
        (Pre-nursery / toddler / playgroup = -3)
"""

from __future__ import annotations

import re
from decimal import Decimal, InvalidOperation

# ---------------------------------------------------------------- money

_UNIT_MULTIPLIERS = {
    "lakh": 100_000, "lakhs": 100_000, "lac": 100_000, "lacs": 100_000, "l": 100_000,
    "crore": 10_000_000, "crores": 10_000_000, "cr": 10_000_000,
    "k": 1_000, "thousand": 1_000,
}

CURRENCY = r"(?:₹|rs\.?|inr|rupees)"
NUMBER = r"\d{1,3}(?:,\d{2,3})+(?:\.\d+)?|\d+(?:\.\d+)?"
UNIT = r"lakhs?|lacs?|crores?|cr|k|thousand|l(?![a-z])"
MONEY_RE = re.compile(
    rf"(?P<cur>{CURRENCY})\s*(?P<num>{NUMBER})\s*(?P<unit>{UNIT})?\.?(?![\w])",
    re.IGNORECASE,
)


def parse_money(text: str) -> int | None:
    """Parse a single INR amount. Returns integer rupees or None if not parseable.

    Requires an explicit currency marker so that bare numbers are never treated as fees.
    """
    if not text:
        return None
    m = MONEY_RE.search(text)
    if not m:
        return None
    return _amount(m.group("num"), m.group("unit"))


def _amount(num: str, unit: str | None) -> int | None:
    try:
        value = Decimal(num.replace(",", ""))
    except InvalidOperation:
        return None
    if unit:
        value *= _UNIT_MULTIPLIERS[unit.lower().rstrip(".")]
    if value != value.to_integral_value():
        # e.g. "₹3.65 Lakhs" -> 365000 is integral; fractional rupees are not expected
        value = value.quantize(Decimal(1))
    return int(value)


def find_money(text: str) -> list[tuple[int, str, int, int]]:
    """All INR amounts in text: (value, raw_match, start, end)."""
    out = []
    for m in MONEY_RE.finditer(text or ""):
        v = _amount(m.group("num"), m.group("unit"))
        if v is not None:
            out.append((v, m.group(0).strip(), m.start(), m.end()))
    return out


FEE_RANGE_RE = re.compile(
    rf"(?P<a>{CURRENCY}\s*(?:{NUMBER})\s*(?:{UNIT})?)\.?\s*(?:to|-|–|—|and)\s*(?P<b>(?:{CURRENCY})?\s*(?:{NUMBER})\s*(?:{UNIT})?)",
    re.IGNORECASE,
)


def parse_money_range(text: str) -> tuple[int, int, str] | None:
    """Parse '₹3.6 Lakhs to ₹10.5 Lakhs' -> (360000, 1050000, raw). Second currency marker optional.

    If the second number lacks a unit but the first has one, the first unit is applied
    (e.g. '₹3.6 to 10.5 Lakhs' style is handled by the unit on the second value instead).
    """
    m = FEE_RANGE_RE.search(text or "")
    if not m:
        return None
    a_raw, b_raw = m.group("a"), m.group("b")
    a = parse_money(a_raw)
    b_m = re.match(rf"\s*(?:{CURRENCY})?\s*(?P<num>{NUMBER})\s*(?P<unit>{UNIT})?", b_raw, re.IGNORECASE)
    if a is None or not b_m:
        return None
    a_unit = MONEY_RE.search(a_raw).group("unit")
    b_unit = b_m.group("unit")
    if b_unit is None and a_unit is not None:
        b_unit = a_unit
    b = _amount(b_m.group("num"), b_unit)
    if b is None:
        return None
    if a_unit is None and b_unit is not None and a < 1000:
        # '₹3.6 to 10.5 Lakhs' -> unit belongs to both
        a = _amount(MONEY_RE.search(a_raw).group("num"), b_unit)
    return (min(a, b), max(a, b), m.group(0).strip())


# ---------------------------------------------------------------- academic year

ACADEMIC_YEAR_RE = re.compile(r"(?<!\d)(20\d{2})\s*[-–/]\s*(20\d{2}|\d{2})(?!\d)")


def parse_academic_year(text: str) -> str | None:
    """'2025-26' / '2025-2026' / '2025/26' -> '2025-26'. Only consecutive years are accepted."""
    for m in ACADEMIC_YEAR_RE.finditer(text or ""):
        start = int(m.group(1))
        end_raw = m.group(2)
        end = int(end_raw) if len(end_raw) == 4 else (start // 100) * 100 + int(end_raw)
        if end == start + 1:
            return f"{start}-{str(end)[-2:]}"
    return None


def all_academic_years(text: str) -> list[str]:
    out = []
    for m in ACADEMIC_YEAR_RE.finditer(text or ""):
        y = parse_academic_year(m.group(0))
        if y and y not in out:
            out.append(y)
    return out


# ---------------------------------------------------------------- grades

_ROMAN = {"i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10,
          "xi": 11, "xii": 12}

_ROMAN_RX = r"(?:xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)"
_GRADE_PREFIXED = (
    r"(?:pre[\s-]?nursery|toddlers?|playgroup|play\s?school|nursery|pre[\s-]?k(?:g|indergarten)?|"
    r"lkg|ukg|kg\s?[12]|k\s?[12]|kindergarten|kg\b|"
    rf"(?:grades?|class(?:es)?|years?|std\.?|standards?)\s*(?:\d{{1,2}}|{_ROMAN_RX})\b|"
    r"\d{1,2}(?:st|nd|rd|th)?\s*(?:grade|class|std|standard)\b)"
)
# Right-hand side may be bare ("Grades 1-12", "Classes I to XII") but never an age/duration.
_GRADE_BARE = r"(?:\d{1,2}|xii|xi|ix|viii|vii|vi|iv|iii|ii|x|v)\b(?!\s*(?:years?|yrs|months?|%|\d|\+))"
GRADE_TOKEN = rf"(?:{_GRADE_PREFIXED}|{_GRADE_BARE})"
GRADE_RANGE_RE = re.compile(
    rf"(?:from\s+)?(?P<a>{_GRADE_PREFIXED})\s*(?:to|till|through|upto|up to|-|–|—|&)\s*(?P<b>{GRADE_TOKEN})",
    re.IGNORECASE,
)
K12_RE = re.compile(r"\b(?:K\s?-\s?12|K12|Pre-?K\s?-\s?12)\b", re.IGNORECASE)


def grade_to_number(token: str) -> int | None:
    t = token.strip().lower()
    t = re.sub(r"\s+", " ", t)
    if re.match(r"pre[\s-]?nursery|toddler|playgroup|play\s?school", t):
        return -3
    if t.startswith("nursery"):
        return -2
    if re.match(r"pre[\s-]?k|lkg|kg\s?1|k\s?1$|kg$", t):
        return -1
    if re.match(r"ukg|kg\s?2|k\s?2$|kindergarten", t):
        return 0
    m = re.search(r"(\d{1,2})", t)
    if m:
        n = int(m.group(1))
        return n if 1 <= n <= 12 else None
    m = re.search(r"\b(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b", t)
    if m:
        return _ROMAN[m.group(1)]
    return None


def grade_label(n: int | None) -> str | None:
    if n is None:
        return None
    return {-3: "Pre-Nursery", -2: "Nursery", -1: "LKG/Pre-K", 0: "UKG/KG"}.get(n, f"Grade {n}")


def parse_grade_range(text: str) -> tuple[int, int, str] | None:
    """Return (min_grade, max_grade, raw) for the first grade range in text."""
    for m in GRADE_RANGE_RE.finditer(text or ""):
        a, b = grade_to_number(m.group("a")), grade_to_number(m.group("b"))
        if a is None or b is None or a > b:
            continue
        # Bare numbers on both sides (e.g. '2 to 16' ages) are not grades unless prefixed.
        if re.fullmatch(r"\d{1,2}", m.group("a").strip()) and re.fullmatch(r"\d{1,2}", m.group("b").strip()):
            continue
        return a, b, m.group(0).strip()
    m = K12_RE.search(text or "")
    if m:
        return 0, 12, m.group(0)
    return None


# ---------------------------------------------------------------- curriculum

# (code, family, regex). Codes are stable identifiers used in scoring and reports.
CURRICULUM_PATTERNS: list[tuple[str, str, re.Pattern]] = [
    ("IB_PYP", "IB", re.compile(r"\bPrimary Years Program(?:me)?\b|\bIB\s?PYP\b|\bPYP\b")),
    ("IB_MYP", "IB", re.compile(r"\bMiddle Years Program(?:me)?\b|\bIB\s?MYP\b|\bMYP\b")),
    ("IB_DP", "IB", re.compile(r"\bIB\s?Diploma\b|\bIBDP\b|\bIB\s?DP\b|\bDiploma Program(?:me)?\b(?=[^.]{0,80}(?:IB|International Baccalaureate))|(?<=IB )Diploma Program(?:me)?")),
    ("IB_CP", "IB", re.compile(r"\bCareer[-\s]related Program(?:me)?\b|\bIBCP\b")),
    ("IB", "IB", re.compile(r"\bInternational Baccalaureate\b|\bIB (?:World School|curriculum|programme|program|board)\b|\bIB\b(?=\s*(?:,|/|and|&)\s*(?:CBSE|ICSE|IGCSE|Cambridge))|(?<=CBSE[,/&] )IB\b|(?<=CBSE and )IB\b|(?<=CBSE & )IB\b")),
    ("CBSE", "CBSE", re.compile(r"\bCBSE\b|Central Board of Secondary Education")),
    ("ICSE", "CISCE", re.compile(r"\bICSE\b|Indian Certificate of Secondary Education")),
    ("ISC", "CISCE", re.compile(r"\bISC\b(?!\w)|(?<!Council for the )Indian School Certificate(?! Examinations)")),
    ("CISCE", "CISCE", re.compile(r"\bCISCE\b|Council for the Indian School Certificate Examinations")),
    ("CAMBRIDGE_IGCSE", "CAMBRIDGE", re.compile(r"\bI\.?GCSE\b")),
    ("CAMBRIDGE_AS_A_LEVEL", "CAMBRIDGE", re.compile(r"\bAS\s*(?:&|and|/)\s*A[\s-]Levels?\b|\bCambridge (?:International )?A[\s-]Levels?\b|\bA[\s-]Levels?\b(?=[^.]{0,60}Cambridge)")),
    ("CAMBRIDGE_CHECKPOINT", "CAMBRIDGE", re.compile(r"\bCambridge (?:Primary|Lower Secondary)\b|\bCheckpoint\b")),
    ("CAMBRIDGE", "CAMBRIDGE", re.compile(r"Cambridge Assessment International Education|\bCAIE\b|\bCambridge International\b|\bCambridge curriculum\b|\bCambridge board\b")),
    ("STATE", "STATE", re.compile(r"\bState Board\b|\bSSC board\b", re.IGNORECASE)),
    ("NIOS", "NIOS", re.compile(r"\bNIOS\b|National Institute of Open Schooling")),
]


def detect_curricula(text: str) -> list[tuple[str, str, int, int]]:
    """All curriculum mentions: (code, family, start, end)."""
    out = []
    for code, family, rx in CURRICULUM_PATTERNS:
        for m in rx.finditer(text or ""):
            out.append((code, family, m.start(), m.end()))
    return sorted(out, key=lambda x: x[2])


def curriculum_family(code: str) -> str:
    for c, fam, _ in CURRICULUM_PATTERNS:
        if c == code:
            return fam
    return code


# ---------------------------------------------------------------- integers

def parse_int(text: str) -> int | None:
    m = re.search(r"\d[\d,]*", text or "")
    if not m:
        return None
    try:
        return int(m.group(0).replace(",", ""))
    except ValueError:
        return None


def normalize_name(name: str) -> str:
    """Name key for duplicate detection; never used to merge on its own."""
    n = (name or "").lower()
    n = re.sub(r"[’'`\.]", "", n)
    n = re.sub(r"[^a-z0-9]+", " ", n)
    n = re.sub(r"\b(the)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()
