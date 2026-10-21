"""Shared adapter context and helpers."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from urllib.parse import urlsplit

from ..config import Config
from ..extract import Extraction
from ..http import Fetcher, Snapshot
from ..records import make_evidence
from ..textify import Document, snapshot_to_document


@dataclass
class Context:
    cfg: Config
    fetcher: Fetcher
    source_status: dict = field(default_factory=dict)  # source_id -> status dict from probes

    def load_document(self, snap: Snapshot) -> Document:
        raw = snap.read_bytes(self.fetcher.store.raw_dir)
        return snapshot_to_document(raw, snap.final_url or snap.url, snap.content_type)

    def source_accessible(self, source_id: str) -> bool:
        st = self.source_status.get(source_id)
        return st is None or st.get("access") == "ACCESSIBLE"


def registrable_host(url: str) -> str:
    host = urlsplit(url).netloc.lower().split(":")[0]
    return host[4:] if host.startswith("www.") else host


def publication_date(doc: Document) -> str | None:
    for key in ("article:modified_time", "og:updated_time", "article:published_time", "dateModified"):
        if doc.meta.get(key.lower()):
            return doc.meta[key.lower()]
    for item in doc.jsonld:
        for key in ("dateModified", "datePublished"):
            if isinstance(item.get(key), str):
                return item[key]
    return None


def to_evidence(school_id: str, ex: Extraction, snap: Snapshot, doc: Document, *, source_type: str,
                source_id: str, pub_date: str | None = None, raw_html: str | None = None) -> dict:
    """Build an evidence record and confirm the excerpt really occurs in the stored source."""
    loc = ex.qualifiers.get("excerpt_location")
    if loc == "hyperlink":
        ok = any(ex.raw_value == href for href, _ in doc.links)
    elif loc == "raw_document":
        ok = raw_html is not None and ex.evidence_excerpt in raw_html
    else:
        parts = ex.raw_value.split(" … ")  # multi-part raw values (e.g. min row … max row)
        ok = ex.evidence_excerpt in doc.text and all(p.lower() in ex.evidence_excerpt.lower() for p in parts)
    return make_evidence(
        school_id, ex.field_name, ex.raw_value, ex.normalized_value,
        source_url=snap.final_url or snap.url, source_title=doc.title[:200], source_type=source_type,
        source_id=source_id, publication_date=pub_date if pub_date is not None else publication_date(doc),
        retrieved_at=snap.retrieved_at, evidence_excerpt=ex.evidence_excerpt, confidence=ex.confidence,
        extraction_method=ex.extraction_method, snapshot_sha256=snap.sha256, qualifiers=ex.qualifiers,
        excerpt_verified=ok)


STOP_TOKENS = {"the", "school", "schools", "international", "public", "academy", "of", "and", "high", "senior",
               "secondary", "global", "world", "a", "for", "in", "at", "&", "residential", "day", "boarding"}


def name_tokens(name: str) -> list[str]:
    toks = re.findall(r"[a-z0-9]+", name.lower())
    distinctive = [t for t in toks if t not in STOP_TOKENS and len(t) > 1]
    return distinctive or toks


CITY_ALIASES = {
    "bengaluru": ["bengaluru", "bangalore"], "bangalore": ["bengaluru", "bangalore"],
    "gurugram": ["gurugram", "gurgaon"], "gurgaon": ["gurugram", "gurgaon"],
    "mumbai": ["mumbai", "bombay"], "delhi": ["delhi", "new delhi"], "new delhi": ["delhi", "new delhi"],
    "chennai": ["chennai", "madras"], "kolkata": ["kolkata", "calcutta"],
}


def city_variants(city: str) -> list[str]:
    c = city.lower().strip()
    return CITY_ALIASES.get(c, [c])
