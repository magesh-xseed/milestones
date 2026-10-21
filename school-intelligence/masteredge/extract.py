"""Rule-based extractors for school facts from document text.

Every extraction carries the exact raw text matched, the excerpt it was cut from
(a substring of Document.text) and the rule that produced it. Extractors never
assign verification status; that happens in evidence.py based on the source tier
and an excerpt re-check against the stored snapshot.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date
from typing import Any

from . import normalize as N
from .textify import Document, excerpt, sentence_window


@dataclass
class Extraction:
    field_name: str
    raw_value: str
    normalized_value: Any
    evidence_excerpt: str
    extraction_method: str
    confidence: float
    qualifiers: dict[str, Any] = field(default_factory=dict)


CURRENT_YEAR = date.today().year

# Pages whose content is commentary rather than statements about this school.
EDITORIAL_URL_RE = re.compile(r"/(?:blogs?|news|events?|articles?|press|media|stories|newsletter|tag|category|author)/", re.I)
CURRICULUM_PAGE_RE = re.compile(r"curricul|academic|programme|program|\bib\b|cbse|icse|igcse|cambridge|pyp|myp|diploma|board|about|overview|glance", re.I)


NON_ACADEMIC_URL_RE = re.compile(r"placement|beyond|extra-?curricular|co-?curricular|activit|sport|club|trip|alumni|career", re.I)


PEOPLE_URL_RE = re.compile(r"leader|team|faculty|staff|principal|director|people|bio|profile|governance|board-of|trustee|meet-", re.I)
CURRICULUM_NOISE_AFTER_RE = re.compile(r"^\W{0,3}(?:candidate|newsletter|blog|coordinator|co-ordinator|teacher|educator|workshop|training|conference|specialist)", re.I)


def is_editorial(url: str, title: str = "") -> bool:
    return bool(EDITORIAL_URL_RE.search(url)) or bool(re.search(r"\bblogs?\b|\bnewsletter\b", title, re.I))


def is_curricular_page(doc: Document) -> bool:
    return bool(CURRICULUM_PAGE_RE.search(doc.url + " " + doc.title)) and not NON_ACADEMIC_URL_RE.search(doc.url)


# ------------------------------------------------------------------ fees

ADMISSION_CHARGE_RE = re.compile(r"application|registration|admission fee|admission charge|one[\s-]?time|caution|security deposit|refundable|enrol?ment fee|balance of|instal(?:l)?ment|deposit", re.I)
NOT_TUITION_RE = re.compile(r"sibling|discount|concession|waiver|refund|scholarship|late fee|fine|penalt", re.I)
MAX_FEE_KEYWORD_DISTANCE = 120
PERIOD_ANNUAL_RE = re.compile(r"per annum|p\.a\.|annual|annually|/\s*year|per year|yearly|a year", re.I)
PERIOD_OTHER_RE = re.compile(r"per month|/\s*month|monthly|per term|termly|per quarter|quarterly|half[\s-]?yearly", re.I)
BOARDING_RE = re.compile(r"\bboarding\b|\bresidential\b|\bhostel\b", re.I)
DAY_RE = re.compile(r"\bday (?:school|scholars?|students?)\b", re.I)


def extract_fees(doc: Document) -> list[Extraction]:
    out: list[Extraction] = []
    text = doc.text
    seen_spans: set[int] = set()
    for m in re.finditer(r"\bfees?\b|\btuition\b", text, re.I):
        ws, we = sentence_window(text, m.start(), m.end(), limit=260)
        window = text[ws:we]
        # amounts must sit close to the fee keyword (PDF text often has no sentence punctuation)
        kpos = m.start() - ws
        amounts = [a for a in N.find_money(window) if abs(a[2] - kpos) <= MAX_FEE_KEYWORD_DISTANCE]
        if not amounts:
            continue
        local = window[max(0, kpos - MAX_FEE_KEYWORD_DISTANCE): kpos + MAX_FEE_KEYWORD_DISTANCE]
        if NOT_TUITION_RE.search(local) and not re.search(r"tuition|annual fee", local, re.I):
            continue
        rng = N.parse_money_range(window)
        if ADMISSION_CHARGE_RE.search(local) and not (rng and re.search(r"tuition|annual", local, re.I)):
            v, raw, s, e = amounts[0]
            if ws + s not in seen_spans:
                seen_spans.add(ws + s)
                out.append(Extraction(
                    "admission_charges", raw, {"amount": v, "currency": "INR"},
                    excerpt(text, ws + s, ws + e), "regex:fee_window/admission_charge", 0.6,
                    {"window_terms": ADMISSION_CHARGE_RE.search(local).group(0)}))
            continue
        if PERIOD_OTHER_RE.search(window) and not PERIOD_ANNUAL_RE.search(window):
            # Monthly/term amounts are never annualised (not a lossless transform).
            continue
        if rng and abs(window.find(rng[2]) - kpos) <= MAX_FEE_KEYWORD_DISTANCE:
            lo, hi, raw = rng
            s = window.find(raw)
        else:
            rng = None
            if len(amounts) != 1:
                continue  # ambiguous list of amounts without a range expression
            lo = hi = amounts[0][0]
            raw = amounts[0][1]
            s = amounts[0][2]
        if hi < 10_000:
            continue  # implausible as annual tuition; likely a small charge
        if ws + s in seen_spans:
            continue
        seen_spans.add(ws + s)
        grade = N.parse_grade_range(window)
        period = "annual" if PERIOD_ANNUAL_RE.search(window) else "unspecified"
        # Fee type only when stated in the fee phrase itself (from the fee keyword onwards).
        fee_phrase = text[m.start():we]
        fee_type = "boarding" if BOARDING_RE.search(fee_phrase) else ("day" if DAY_RE.search(fee_phrase) else "unspecified")
        out.append(Extraction(
            "annual_fee", raw,
            {"min": lo, "max": hi, "currency": "INR", "period": period, "fee_type": fee_type,
             "academic_year": N.parse_academic_year(window),
             "grade_min": grade[0] if grade else None, "grade_max": grade[1] if grade else None,
             "grade_basis_raw": grade[2] if grade else None},
            excerpt(text, ws + s, ws + s + len(raw), before=200, after=200),
            "regex:fee_window/range" if rng else "regex:fee_window/single", 0.75 if rng else 0.6,
            {"window": window[:400]}))
    return _dedupe(out)


# ------------------------------------------------------------------ curriculum

AFFIRMATIVE_RE = re.compile(r"affiliat|authori[sz]|accredit|offer|follow|curricul|programme|program|board|we are|recogni", re.I)


def extract_curricula(doc: Document) -> list[Extraction]:
    # Staff bios and leadership pages describe people's careers (often at other schools), not this school.
    if is_editorial(doc.url, doc.title) or PEOPLE_URL_RE.search(doc.url):
        return []
    text = doc.text
    seen: set[str] = set()
    out = []
    page_is_curricular = bool(CURRICULUM_PAGE_RE.search(doc.url + " " + doc.title))
    page_mentions_ib = bool(re.search(r"\bIB\b|Baccalaur[eé]at|\bIBO\b|\bIBDP\b|\bIBCP\b", text))
    for code, family, s, e in N.detect_curricula(text):
        if code in seen:
            continue
        if family == "IB" and not page_mentions_ib:
            continue  # "Primary Years Program" alone is a generic label, not IB authorisation
        # "PYP candidate school" is not authorisation; "PYP Newsletter/Coordinator" is not a curriculum statement
        if CURRICULUM_NOISE_AFTER_RE.search(text[e:e + 20]) or re.search(r"candidate", text[e:e + 40], re.I):
            continue
        if re.search(r"(?:has |have )?worked (?:in|at|with)|years of experience|experience (?:in|at|across)|previously|formerly|examiner|alumn",
                     text[max(0, s - 60):s], re.I):
            continue  # someone's career ("has worked in leading CBSE and IB schools")
        if re.search(r"unlike|compared (?:to|with)|versus|\bvs\.?|compromised|instead of|rather than|other boards|switch(?:ing)? from|difference between",
                     text[max(0, s - 80):e + 20], re.I):
            continue  # comparison with another board is not a statement of what this school offers
        seen.add(code)
        ex = excerpt(text, s, e, before=100, after=140)
        conf = 0.85 if (page_is_curricular or AFFIRMATIVE_RE.search(ex)) else 0.6
        out.append(Extraction("curricula", text[s:e], {"code": code, "family": family}, ex,
                              "regex:curriculum_vocabulary", conf))
    return out


def extract_curriculum_by_grade(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    text = doc.text
    out = []
    mentions = N.detect_curricula(text)
    for idx, (code, family, s, e) in enumerate(mentions):
        if re.search(r"\b(?:explore|learn more about|read more about|know more about|discover)\s*$", text[max(0, s - 25):s], re.I):
            continue  # link label ("Explore MYP") followed by the next programme's block
        nxt = next((m[2] for m in mentions[idx + 1:] if m[2] >= e), len(text))
        tail = text[e:min(e + 90, nxt)]   # never borrow the next programme's grade range
        if re.match(r"\W{0,3}years?\s*\d", tail, re.I):
            continue  # "MYP year 4 & 5" numbers programme years, not school grades
        g = N.parse_grade_range(tail)
        if not g:
            continue
        gs = tail.find(g[2])
        if gs > 45:
            continue
        if re.match(r"\s*:", tail[gs + len(g[2]):]):
            continue  # "Classes VII to X: : ICSE" — the range labels the programme that follows it
        raw = text[s:e + gs + len(g[2])]
        out.append(Extraction("curriculum_by_grade", raw,
                              {"code": code, "family": family, "grade_min": g[0], "grade_max": g[1]},
                              excerpt(text, s, e + gs + len(g[2]), before=60, after=60),
                              "regex:curriculum_then_grade_range", 0.8))
    return _dedupe(out)


# ------------------------------------------------------------------ identity

FOUNDED_RE = re.compile(
    r"\b(?:established|founded|estd\.?|est\.|inception|set up|started|began)\b[^.]{0,40}?\b(?:in|on|since)?\s*(?:the year\s*)?((?:18|19|20)\d{2})\b", re.I)


def extract_founding_year(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    out = []
    for m in FOUNDED_RE.finditer(doc.text):
        year = int(m.group(1))
        if not 1800 <= year <= CURRENT_YEAR:
            continue
        window = doc.text[max(0, m.start() - 80):m.end() + 40]
        if re.search(r"\b(?:my|our) (?:kids?|child(?:ren)?|son|daughter)\b|\bparent since\b|testimonial|\bjoined\b", window, re.I):
            continue  # parent testimonials ("My kids started at X in 2012")
        if re.search(r"\b(?:IB|CBSE|ICSE|Cambridge|authori[sz]|affiliat|programme|program|club|council|lab|centre|center|wing|block|society|trust|group|foundation|organi[sz]ation|company|education program|newspaper|magazine|journal|newsletter|team|band|choir|house|chapter|association)\b", window, re.I):
            conf = 0.45  # may refer to a programme, facility or parent organisation rather than the school
        else:
            conf = 0.7
        out.append(Extraction("founding_year", m.group(0), year, excerpt(doc.text, m.start(), m.end()),
                              "regex:founded_phrase", conf))
    return out


GROUP_SCOPE_RE = re.compile(r"\bacross\b|\bcampuses\b|\bschools\b|\bnetwork\b|\bgroup\b|\bglobally\b|\bworldwide\b|\bcities\b|\bcountries\b|\bfamily of\b|\bchain\b", re.I)
MULTI_CAMPUS_RE = re.compile(r"\b\d+\s+campuses\b|\bthree campuses\b|\btwo campuses\b|\bbranches\b|\bnetwork of\b|\bgroup of schools\b|\bchain of\b|\ball (?:our )?campuses\b", re.I)
HISTORICAL_COUNT_RE = re.compile(r"\binitial(?:ly)?\b|\bstarted with\b|\bbegan with\b|\bfirst batch\b|\bfounding batch\b|\bopened (?:its doors )?(?:to|with)\b", re.I)
PARENT_INSTITUTION_RE = re.compile(r"\b(?:institutions?|vidyapith|society|trust|foundation|college|universit\w*|from preschool to college|founded in (?:18|19)\d\d)\b", re.I)
STUDENT_COUNT_RE = re.compile(
    r"(?:(?:over|more than|around|about|nearly|approximately|approx\.?)\s+)?(\d{1,2}(?:,\d{2})+,\d{3}|\d{1,3}(?:,\d{3})+|\d{3,6})\s*\+?\s*(?:students|learners|pupils|children|kids)\b"
    r"|student (?:strength|population|enrol(?:l)?ment)\s*(?:of|is|:)?\s*(?:over|more than|around|about)?\s*(\d{1,3}(?:,\d{3})+|\d{3,6})", re.I)
STUDENT_EXCLUDE_RE = re.compile(r"\b(?:alumni|teachers?|faculty|staff|graduat\w*|placed|placements?|scholarships?|attended|trained|nationalit\w*|countries|applications?|appeared|admitted|participa\w*|volunteer\w*|events?|competitions?|olympiads?|camps?|sessions?|recorded|online|registered|took part|engag\w*|webinars?|reached|impacted|benefit\w*)\b", re.I)
CLASS_LEVEL_RE = re.compile(r"per (?:class|section|batch|teacher|grade|year group|standard)|in each (?:class|section)|class size|ratio|\d\s*:\s*\d", re.I)
# Audit round 8 (slice 6): counts that are not the school's current enrolment.
COUNT_CAPACITY_RE = re.compile(r"accommodat\w*|seating|capacity|can (?:comfortably )?(?:sit|seat|hold|house)|\bseats?\b|\bhall\b|auditorium|dining|buses|fleet", re.I)
COUNT_NOT_CURRENT_RE = re.compile(r"\bwill\b|\bsoon\b|\baim(?:s|ing)? to\b|\btarget\b|\bplan(?:s|ning)? to\b|\bvision\b|"
                                  r"\bby (?:1[89]\d\d|20[0-2]\d)\b|\bin (?:1[89]\d\d)\b|\bjoin\b|\bscor(?:ing|ed)\b|\bsecured\b|"
                                  r"\bselected\b|\bqualified\b|\btoppers?\b|\d\s*%|\bsupported\b|\bsponsor\w*|\bin front of\b|\bout of\b|"
                                  r"\bvisited\b|\bwent\b|\bcelebrat\w*|\btaken (?:up|by)\b|\bsat for\b|\bshowcas\w*|\bworldwide\b|\bengineering\b|"
                                  r"\binstitute of\b|\bfounder of\b|\ba group of\b|\bfrom a school with\b", re.I)
# A sentence that states the present ("current strength of 540", "over 2200 students today") is current despite history words
COUNT_CURRENT_RE = re.compile(r"current(?:ly)? (?:strength|enrol\w*|has|have)|\btoday\b|\bpresently\b|\bwe now have\b", re.I)
COUNT_SUBSET_RE = re.compile(r"\b(?:programme|program|elementary school|junior school|middle school|senior school|high school section|"
                             r"primary (?:school|section|wing)|pre-?primary|kindergarten section|boarding (?:house|block)|hostel)\b|"
                             r"\b(?:in|from)\s+(?:pre-?k|reception|nursery|kg|classes?|grades?|std\.?)\s*[\w.]*\s*(?:-|–|to)\s*(?:grade|class|std)?\s*\w+", re.I)
MAX_CAMPUS_STUDENTS = 12_000  # larger single-campus figures are group/brand totals or marketing copy
REPORTING_YEAR_RE = re.compile(r"\b(?:as (?:of|on)|in the (?:academic )?year|for the (?:academic )?year|academic year|session)\s*(?:[A-Z][a-z]+\s+)?(20[0-3]\d(?:\s*[-–/]\s*\d{2,4})?)", re.I)


def extract_student_counts(doc: Document, standalone_domain: bool) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    out = []
    for m in STUDENT_COUNT_RE.finditer(doc.text):
        num_raw = m.group(1) or m.group(2)
        n = int(num_raw.replace(",", ""))
        if n < 50 or n > 500_000:
            continue
        if 1900 <= n <= 2039 and "," not in num_raw and not re.match(r"(?:over|more than|around|about|nearly|approx)", m.group(0), re.I):
            continue  # a year next to "Students" ("21/10/2022 Students went…", "Student Strength 2026-27")
        ws, we = sentence_window(doc.text, m.start(), m.end(), limit=160)
        window = doc.text[ws:we]
        if STUDENT_EXCLUDE_RE.search(window):
            continue
        local = doc.text[max(0, m.start() - 30):m.end() + 30]
        if CLASS_LEVEL_RE.search(local):
            continue  # "24 students per class", "class size of 30 students", ratios
        wide = doc.text[max(0, m.start() - 200):m.end() + 200]
        if PARENT_INSTITUTION_RE.search(window):
            continue  # a parent institution's count ("... Vidyapith ... provides services to over 3000 students")
        if HISTORICAL_COUNT_RE.search(doc.text[max(0, m.start() - 60):m.end() + 10]):
            continue  # "initial enrollment of 135 students" is history, not current enrollment
        # same sentence only (a neighbouring sentence's year or grade range says nothing about this count);
        # initials such as "B.D. Somani" do not end a sentence
        pre = doc.text[max(0, m.start() - 120):m.start()]
        ends = list(re.finditer(r"[a-z0-9)]{2}[.!?]\s+(?=[A-Z])", pre))
        near = (pre[ends[-1].end():] if ends else pre) + doc.text[m.start():we]
        if COUNT_CAPACITY_RE.search(near):
            continue  # "dining hall that accommodates up to 1,000 students" is capacity, not enrolment
        if COUNT_NOT_CURRENT_RE.search(near) and not (COUNT_CURRENT_RE.search(near) and not re.search(r"\bjoin\b|\bwill\b", near, re.I)):
            continue  # aspiration, history, results, charity, events, marketing ("Join over 500,000 students")
        if COUNT_SUBSET_RE.search(near):
            continue  # one programme or section ("The IGCSE program … has 130 students", "500 students in Pre-K–Grade 5")
        if GROUP_SCOPE_RE.search(window) or MULTI_CAMPUS_RE.search(wide) or n > MAX_CAMPUS_STUDENTS:
            scope, field_name, conf = "group", "group_student_count", 0.6
        elif standalone_domain:
            scope, field_name, conf = "campus", "campus_student_count", 0.55
        else:
            scope, field_name, conf = "unspecified", "campus_student_count", 0.3
        # Only an explicitly stated reporting period counts ("as of 2025", "academic year 2025-26").
        ym = REPORTING_YEAR_RE.search(window)
        year = (N.parse_academic_year(ym.group(1)) or ym.group(1)) if ym else None
        out.append(Extraction(field_name, m.group(0).strip(), n,
                              excerpt(doc.text, m.start(), m.end()), "regex:student_count", conf,
                              {"scope": scope, "reporting_year": year,
                               "approximate": bool(re.match(r"(?:over|more than|around|about|nearly|approx)", m.group(0), re.I) or "+" in m.group(0)),
                               "scope_basis": "group keywords in sentence" if scope == "group" else (
                                   "standalone official domain, no group keywords" if scope == "campus" else
                                   "shared multi-campus domain; scope not stated")}))
    return out


RATIO_RE = re.compile(r"(?:student|pupil)[\s-]*(?:to[\s-]*)?teacher\s+ratio\s*(?:of|is|:|-)?\s*(?:approximately|about|around)?\s*(\d{1,2}\s*:\s*\d{1,2})"
                      r"|(\d{1,2}\s*:\s*\d{1,2})\s*(?:student|pupil)[\s-]*(?:to[\s-]*)?teacher\s+ratio"
                      r"|teacher[\s-]*(?:to[\s-]*)?student\s+ratio\s*(?:of|is|:|-)?\s*(\d{1,2}\s*:\s*\d{1,2})", re.I)
CLASS_SIZE_RE = re.compile(r"average\s+class\s+size\s*(?:of|is|:|-)?\s*(\d{1,2})\b", re.I)


def extract_ratios(doc: Document) -> list[Extraction]:
    out = []
    for m in RATIO_RE.finditer(doc.text):
        if re.match(r"\s*(?:for|in|at)\s+(?:the\s+)?(?:pre[\s-]?primary|pre[\s-]?school|primary|kindergarten|KG|nursery|early years|"
                    r"junior|middle|senior|secondary|higher secondary|grades?\s*\d|classes?\s*\d|std)", doc.text[m.end():m.end() + 30], re.I):
            continue  # ratio for one stage only ("1:10 for pre-primary, 1:15 for Grade 1-5") is not a school-wide ratio
        raw = next(g for g in m.groups() if g)
        val = re.sub(r"\s+", "", raw)
        if m.group(3):  # teacher:student order -> flip to student:teacher
            a, b = val.split(":")
            val = f"{b}:{a}"
        out.append(Extraction("student_teacher_ratio", m.group(0), val, excerpt(doc.text, m.start(), m.end()),
                              "regex:student_teacher_ratio", 0.75,
                              {"order_flipped": bool(m.group(3))}))
    for m in CLASS_SIZE_RE.finditer(doc.text):
        out.append(Extraction("average_class_size", m.group(0), int(m.group(1)),
                              excerpt(doc.text, m.start(), m.end()), "regex:average_class_size", 0.8))
    return _dedupe(out)


def extract_school_type(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    out = []
    t = doc.text
    pats = [
        ("day_and_boarding", r"\bday (?:and|&|cum|-cum-) ?boarding\b|\bday-cum-boarding\b|\bday and residential\b"),
        ("day_boarding", r"\bday[\s-]boarding\b"),
        ("boarding", r"\b(?:is|are|as) an? (?:\w+ ){0,3}(?:fully\s+)?(?:residential|boarding) school\b"),
        ("day", r"\bday school\b"),
    ]
    for value, p in pats:
        m = re.search(p, t, re.I)
        if m:
            ws, we = sentence_window(t, m.start(), m.end(), 140)
            if re.search(r"\b(?:no|not|without|unlike|vs\.?|versus|compared)\b", t[ws:we], re.I):
                continue
            out.append(Extraction("school_type", m.group(0), value, excerpt(t, m.start(), m.end()),
                                  "regex:school_type_phrase", 0.65))
    return out


PARENT_RE = re.compile(
    r"\b(?:part of|member of|a member of|run by|managed by|promoted by|an initiative of|a unit of|owned by|a school of|belongs to)\s+(?:the\s+)?"
    r"((?:[A-Z][\w&'\.-]*\s+){0,6}?(?:Education|Educational|Group|Trust|Society|Foundation|Schools|Network|Limited|Ltd\.?|Pvt\.? Ltd\.?|Private Limited)(?:\s+(?:Trust|Society|Foundation|Group|Limited|Ltd\.?))?)\b")
A_SCHOOL_OF_RE = re.compile(r"\b(?:an?|the)\s+((?:[A-Z][\w&'-]*\s+){1,4}?Education)\s+school\b")


def extract_parent_org(doc: Document) -> list[Extraction]:
    out = []
    for rx in (PARENT_RE, A_SCHOOL_OF_RE):
        for m in rx.finditer(doc.text):
            org = re.sub(r"\s+", " ", m.group(1)).strip()
            if len(org.split()) < 2:
                continue
            out.append(Extraction("parent_organization", m.group(0), org, excerpt(doc.text, m.start(), m.end()),
                                  "regex:parent_org_phrase", 0.6))
    return _dedupe(out)


# Only explicit "N campuses" phrasing: "N schools in ..." is too often SEO text ("Top 10 schools in X")
# or a parent network's global count (e.g. "81 schools in five continents").
CAMPUS_COUNT_RE = re.compile(r"(?<!top )(?<!best )\b(\d{1,3})\+?\s+campuses\b", re.I)


def extract_campus_count(doc: Document) -> list[Extraction]:
    out = []
    for m in CAMPUS_COUNT_RE.finditer(doc.text):
        n = int(m.group(1))
        if n < 2:
            continue
        out.append(Extraction("number_of_campuses", m.group(0), n, excerpt(doc.text, m.start(), m.end()),
                              "regex:campus_count", 0.55, {"scope": "group", "approximate": "+" in m.group(0)}))
    return out


# ------------------------------------------------------------------ affiliation

AFFIL_NO_RE = re.compile(r"affiliation\s*(?:no\.?|number|code)\s*[:.\-–]?\s*(\d{5,8})\b", re.I)
SCHOOL_CODE_RE = re.compile(r"school\s*code\s*[:.\-–]?\s*(\d{5})\b", re.I)
IB_CODE_TEXT_RE = re.compile(r"IB\s+school\s+code\s*[:.\-–]?\s*(\d{6})\b", re.I)
IB_CODE_LINK_RE = re.compile(r"ibo\.org/(?:en/)?school/(\d{6})", re.I)
CAMBRIDGE_CENTRE_RE = re.compile(r"(?:Cambridge\s+)?(?:centre|center)\s*(?:no\.?|number|code)\s*[:.\-–]?\s*([A-Z]{2}\s?\d{3})\b", re.I)
CISCE_CODE_RE = re.compile(r"(?:CISCE|ICSE|council)\s*(?:school\s*)?code\s*[:.\-–]?\s*([A-Z]{2}\s?\d{3})\b", re.I)


def extract_affiliations(doc: Document) -> list[Extraction]:
    out = []
    t = doc.text
    for m in AFFIL_NO_RE.finditer(t):
        window = t[max(0, m.start() - 150):m.end() + 150]
        board = "CBSE" if re.search(r"CBSE|Central Board", window) else (
            "CISCE" if re.search(r"CISCE|ICSE|Council", window) else "unspecified")
        out.append(Extraction("affiliation_details", m.group(0), {"board": board, "type": "affiliation_number", "id": m.group(1)},
                              excerpt(t, m.start(), m.end()), "regex:affiliation_number", 0.8))
    for m in SCHOOL_CODE_RE.finditer(t):
        window = t[max(0, m.start() - 150):m.end() + 150]
        if re.search(r"CBSE|Central Board", window):
            out.append(Extraction("affiliation_details", m.group(0), {"board": "CBSE", "type": "school_code", "id": m.group(1)},
                                  excerpt(t, m.start(), m.end()), "regex:cbse_school_code", 0.7))
    for m in IB_CODE_TEXT_RE.finditer(t):
        out.append(Extraction("affiliation_details", m.group(0), {"board": "IB", "type": "ib_school_code", "id": m.group(1)},
                              excerpt(t, m.start(), m.end()), "regex:ib_school_code", 0.85))
    for href, anchor in doc.links:
        m = IB_CODE_LINK_RE.search(href)
        if m:
            out.append(Extraction("affiliation_details", href, {"board": "IB", "type": "ib_school_code", "id": m.group(1)},
                                  f"link: {href} [{anchor}]", "link:ibo_school_page", 0.85,
                                  {"excerpt_location": "hyperlink"}))
    for m in CAMBRIDGE_CENTRE_RE.finditer(t):
        window = t[max(0, m.start() - 120):m.end() + 60]
        if re.search(r"Cambridge|CAIE|IGCSE", window, re.I):
            out.append(Extraction("affiliation_details", m.group(0), {"board": "CAMBRIDGE", "type": "centre_number", "id": m.group(1).replace(" ", "")},
                                  excerpt(t, m.start(), m.end()), "regex:cambridge_centre", 0.75))
    for m in CISCE_CODE_RE.finditer(t):
        out.append(Extraction("affiliation_details", m.group(0), {"board": "CISCE", "type": "school_code", "id": m.group(1).replace(" ", "")},
                              excerpt(t, m.start(), m.end()), "regex:cisce_code", 0.7))
    return _dedupe(out)


HISTORY_CLAIM_RE = re.compile(
    r"\b(IB World School|IB(?:\s+(?:PYP|MYP|DP|Diploma))?|International Baccalaureate|CBSE|ICSE|ISC|IGCSE|Cambridge|Primary Years Programme|Middle Years Programme|Diploma Programme)\b"
    r"[^.]{0,80}?\b(?:since|in|from)\s+((?:19|20)\d{2})\b", re.I)
HISTORY_VERB_RE = re.compile(r"authori[sz]|accredit|affiliat|introduc|launch|start|began|offer|since|became|upgraded|recogni", re.I)


def extract_history_claims(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url, doc.title) or PEOPLE_URL_RE.search(doc.url):
        return []
    out = []
    for m in HISTORY_CLAIM_RE.finditer(doc.text):
        year = int(m.group(2))
        if not 1960 <= year <= CURRENT_YEAR:
            continue
        # the verb may precede a list ("authorised by the IB to offer the DP in 2010, the PYP in 2011 ...")
        if not HISTORY_VERB_RE.search(doc.text[max(0, m.start() - 100):m.end()]):
            continue
        if re.search(r"examiner|team leader|coordinator|teacher|trainer|workshop leader", doc.text[max(0, m.start() - 60):m.end()], re.I):
            continue  # a person's career, not the school's history
        codes = N.detect_curricula(m.group(0))
        if codes:
            specific = [c for c in codes if "_" in c[0]] or codes   # IB_MYP beats generic IB
            code, fam = specific[0][0], specific[0][1]
        else:
            fam = "IB" if "ib" in m.group(1).lower() else m.group(1).upper()
            code = fam
        if code == "IB" and re.search(r"Diploma Program", m.group(0), re.I):
            code = "IB_DP"   # "authorised by the IB to offer the Diploma Programme"
        out.append(Extraction("curriculum_history", m.group(0), {"event_type": "official_site_claim", "code": code,
                                                                 "family": fam, "year": year},
                              excerpt(doc.text, m.start(), m.end()), "regex:curriculum_history_claim", 0.6))
    return _dedupe(out)


# ------------------------------------------------------------------ academics detail

SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "Business Studies",
            "Accountancy", "Psychology", "History", "Geography", "Political Science", "Sociology", "English",
            "Hindi", "French", "Spanish", "German", "Sanskrit", "Telugu", "Kannada", "Tamil", "Marathi", "Bengali",
            "Environmental Systems", "Visual Arts", "Music", "Theatre", "Design Technology", "Information Technology",
            "Artificial Intelligence", "Robotics", "Coding", "Physical Education", "Global Perspectives",
            "Theory of Knowledge", "Science", "Social Studies", "Commerce", "Humanities"]
METHODS = {
    "inquiry_based": r"inquiry[\s-]based|enquiry[\s-]based|inquiry[\s-]led",
    "experiential": r"experiential learning|hands[\s-]on learning|learning by doing",
    "project_based": r"project[\s-]based learning|\bPBL\b",
    "montessori": r"\bMontessori\b",
    "reggio_emilia": r"Reggio Emilia",
    "steam_stem": r"\bSTEAM\b|\bSTEM\b",
    "differentiated": r"differentiated (?:instruction|learning|teaching)",
    "concept_based": r"concept[\s-]based",
    "blended_digital": r"blended learning|flipped classroom|digital learning",
    "personalised": r"personali[sz]ed learning",
    "competency_based": r"competency[\s-]based",
}
ASSESSMENTS = {
    "formative": r"formative assessment",
    "summative": r"summative assessment",
    "continuous_evaluation": r"continuous and comprehensive evaluation|\bCCE\b|continuous assessment",
    "criterion_referenced": r"criteri(?:on|a)[\s-](?:based|referenced|related)",
    "portfolio": r"\bportfolios?\b",
    "standardised_benchmark": r"\bASSET\b|\bCAT4\b|\bMAP test|standardi[sz]ed (?:tests?|assessments?)",
    "board_examinations": r"board exam(?:ination)?s",
}


def extract_academics(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    out = []
    t = doc.text
    if is_curricular_page(doc):
        for subj in SUBJECTS:
            for m in re.finditer(rf"\b{re.escape(subj)}\b", t):
                before, after = t[max(0, m.start() - 120):m.start()], t[m.end():m.end() + 40]
                # institution names: "School of Economics and Political Science", "College of Commerce"
                if INSTITUTION_CONTEXT_RE.search(t[max(0, m.start() - 28):m.start()]) or \
                        re.match(r"\s*(?:universit|college|institute|club|fest|exhibition|olympiad)", t[m.end():m.end() + 14], re.I):
                    continue
                if not SUBJECT_CONTEXT_RE.search(before + " " + after):
                    continue
                if re.search(r"certificate|aadhaa?r|affidavit|photo ?cop|passport|documents? required|transfer certificate",
                             t[max(0, m.start() - 70):m.end() + 50], re.I):
                    continue  # admission paperwork ("Birth Certificate (Hindi/English language)") is not a subject list
                if re.match(r"\s*(?:medium|classrooms?|laborator\w*|labs?\b|rooms?\b|studios?\b|as an additional|department|wing|block|teachers?\b|faculty)", t[m.end():m.end() + 25], re.I):
                    continue
                out.append(Extraction("subjects_offered", m.group(0), subj, excerpt(t, m.start(), m.end(), 80, 80),
                                      "vocabulary:subjects_with_subject_list_context", 0.6))
                break
    for key, p in METHODS.items():
        m = re.search(p, t, re.I)
        if m:
            out.append(Extraction("teaching_methodology", m.group(0), key, excerpt(t, m.start(), m.end(), 80, 100),
                                  "vocabulary:teaching_methodology", 0.6))
    for key, p in ASSESSMENTS.items():
        # assessment wording must be adjacent (+-50 chars); list pages often lack sentence punctuation
        m = next((mm for mm in re.finditer(p, t, re.I)
                  if ASSESSMENT_CONTEXT_RE.search(t[max(0, mm.start() - 50):mm.end() + 50])), None)
        if m:
            out.append(Extraction("assessment_methodology", m.group(0), key, excerpt(t, m.start(), m.end(), 80, 100),
                                  "vocabulary:assessment_methodology", 0.6))
    return out


SUBJECT_CONTEXT_RE = re.compile(r"subjects?|languages?|electives?|courses?|studied|offered|offer|options|streams?|disciplines|groups? \d|curriculum includes", re.I)
INSTITUTION_CONTEXT_RE = re.compile(r"universit|college|institute|school of|academy of|club|fest|exhibition|olympiad|competition|society", re.I)
ASSESSMENT_CONTEXT_RE = re.compile(r"assess|evaluat|exam|grading|graded|report card|marks|criteria|moderat", re.I)

ROLES = ["Principal", "Vice Principal", "Head of School", "Headmistress", "Headmaster", "Director", "Academic Director",
         "Director of Academics", "Dean", "IB Coordinator", "PYP Coordinator", "MYP Coordinator", "DP Coordinator",
         "IBDP Coordinator", "Curriculum Coordinator", "Academic Coordinator", "Chairman", "Chairperson",
         "Managing Director", "CEO", "Chief Executive Officer", "Trustee", "Correspondent", "Head of Primary",
         "Head of Secondary", "Head of Mathematics", "Head of Academics", "Admissions Head"]


ROLE_COMPANY_RE = re.compile(r"\b(?:Ltd|Limited|Pvt|Private Limited|Developers|Industries|Corporation|Bank|board member|boards of|has been the|has served as|served as|took on|previously|formerly|worked (?:as|in))\b", re.I)
ROLE_BEFORE_RE = re.compile(r"(?:\bour|message from (?:the |our )?|desk of (?:the |our )?|meet (?:the |our )?|note from (?:the |our )?|from the)\s*$", re.I)
ROLE_AFTER_RE = re.compile(r"^\s*(?:'s|’s)?\s*(?:message|desk|note|speaks|welcome)", re.I)


def extract_roles(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url, doc.title):
        return []
    out = []
    people_page = bool(PEOPLE_URL_RE.search(doc.url))

    def owned(mm) -> bool:
        before, after = doc.text[max(0, mm.start() - 25):mm.start()], doc.text[mm.end():mm.end() + 25]
        if re.match(r"\s*(?:of|at|@|for)\s+(?!the school|our school)", after, re.I):
            return False  # "CEO of Indus Trust", "Director Marketing @ Sterling"
        sw, se = sentence_window(doc.text, mm.start(), mm.end(), 120)
        if ROLE_COMPANY_RE.search(doc.text[sw:se]):
            return False  # corporate directorships and past careers
        if ROLE_BEFORE_RE.search(before) or ROLE_AFTER_RE.search(after):
            return True
        # leadership pages list "<Name> <Role>" / "<Role> <Name>" for this school's staff
        return people_page and re.match(r"\s*(?:[A-Z][a-z]+\.?\s){1,3}|\s*,?\s*[A-Z][a-z]+", after) is not None

    for role in ROLES:
        m = next((mm for mm in re.finditer(rf"\b{re.escape(role)}\b", doc.text) if owned(mm)), None)
        if m:
            out.append(Extraction("decision_maker_roles", m.group(0), role, excerpt(doc.text, m.start(), m.end(), 40, 40),
                                  "vocabulary:leadership_roles", 0.6))
    return out


PHONE_LABEL_RE = re.compile(r"(?:landline|phone|tel|telephone|office|reception|mobile no\.?|contact no\.?|call us|helpline|board ?line|enquiry|enquiries)\s*(?:no\.?|number)?\s*[:\-–]?\s*$", re.I)
GENERIC_EMAIL_LOCAL = re.compile(r"^(?:info|admissions?|enquir(?:y|ies)|inquir(?:y|ies)|contact|office|principal|reception|hello|school|frontoffice|admin|careers)\b", re.I)
EMAIL_RE = re.compile(r"\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")
PHONE_RE = re.compile(r"(?<![\d+])(?:\+91[\s-]?|0)?(?:[6-9]\d{4}[\s-]?\d{5}|\d{2,4}[\s-]\d{6,8})(?!\d)")


def extract_contacts(doc: Document) -> list[Extraction]:
    """Role-based business contacts only; personal mailboxes are not collected."""
    out = []
    for m in EMAIL_RE.finditer(doc.text):
        if GENERIC_EMAIL_LOCAL.match(m.group(1)) and not m.group(2).lower().endswith(("png", "jpg", "webp")):
            out.append(Extraction("public_contact", m.group(0), {"type": "email", "value": m.group(0).lower()},
                                  excerpt(doc.text, m.start(), m.end(), 60, 60), "regex:role_email", 0.8))
    if re.search(r"contact", doc.url + doc.title, re.I):
        for m in PHONE_RE.finditer(doc.text):
            digits = re.sub(r"\D", "", m.group(0))
            if len(digits) < 10:
                continue
            if not PHONE_LABEL_RE.search(doc.text[max(0, m.start() - 30):m.start()]):
                continue  # unlabelled or attached to a named individual -> not collected
            out.append(Extraction("public_contact", m.group(0), {"type": "phone", "value": m.group(0).strip()},
                                  excerpt(doc.text, m.start(), m.end(), 60, 60), "regex:phone_on_contact_page", 0.7))
    return _dedupe(out)[:8]


GRADE_NOT_SPAN_RE = re.compile(r"ratio|boarding|hostel|residential facility|can choose to live|admission|application|applicant|apply|intake|enrol|deposit|uniform|waiting list|seats?|vacanc|transfer|eligib|age criteria|withdraw|refund", re.I)
GRADE_SECTION_RE = re.compile(r"(?:curriculum (?:for|from)|primary|middle|senior|secondary|junior|early years|pre-primary|section|wing|division|programme|program|years|school)\s*(?:&\s*\w+\s*)?\(?\s*$", re.I)


def extract_grades_offered(doc: Document) -> list[Extraction]:
    if is_editorial(doc.url):
        return []
    out = []
    # Whole-school spans only (>= 8 grade levels); programme sub-ranges are curriculum_by_grade.
    for m in re.finditer(r"\b(?:grades?|classes|from|offer(?:s|ing)?|fee details|students? of|level|caters? to)\b|(?=\b(?:pre[\s-]?nursery|nursery|pre[\s-]?k|kg|lkg)\b)", doc.text, re.I):
        tail = doc.text[m.start():m.start() + 80]
        g = N.parse_grade_range(tail)
        if not g or (g[1] - g[0]) < 8:
            continue
        s = m.start() + tail.find(g[2])
        ws, we = sentence_window(doc.text, s, s + len(g[2]), 160)
        if GRADE_NOT_SPAN_RE.search(doc.text[ws:we]):
            continue  # admission intake, deposits, uniforms: not a statement of the school's span
        if GRADE_SECTION_RE.search(doc.text[max(0, s - 30):s]):
            continue  # a section/division span ("Middle & Senior (Grade 3 to Grade 11)")
        out.append(Extraction("grades_offered", g[2], {"grade_min": g[0], "grade_max": g[1]},
                              excerpt(doc.text, s, s + len(g[2])), "regex:grade_range", 0.6))
    return _dedupe(out)


def extract_all(doc: Document, standalone_domain: bool) -> list[Extraction]:
    out: list[Extraction] = []
    for fn in (extract_fees, extract_curricula, extract_curriculum_by_grade, extract_founding_year,
               extract_ratios, extract_school_type, extract_parent_org, extract_campus_count,
               extract_affiliations, extract_history_claims, extract_academics, extract_roles,
               extract_contacts, extract_grades_offered):
        out.extend(fn(doc))
    out.extend(extract_student_counts(doc, standalone_domain))
    return out


def _dedupe(items: list[Extraction]) -> list[Extraction]:
    seen = set()
    out = []
    for x in items:
        key = (x.field_name, repr(x.normalized_value), x.raw_value)
        if key in seen:
            continue
        seen.add(key)
        out.append(x)
    return out
