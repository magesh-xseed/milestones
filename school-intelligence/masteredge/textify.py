"""Deterministic document -> text conversion.

Evidence excerpts are cut from exactly this text so they can be re-located in the
stored raw snapshot later. Only non-visible elements are removed.
"""

from __future__ import annotations

import io
import json
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin, urldefrag

from bs4 import BeautifulSoup

from .util import collapse_ws

NON_VISIBLE = ["script", "style", "noscript", "template", "svg", "iframe"]


@dataclass
class Document:
    url: str
    title: str
    text: str
    links: list[tuple[str, str]] = field(default_factory=list)  # (absolute_url, anchor_text)
    jsonld: list[dict] = field(default_factory=list)
    meta: dict[str, str] = field(default_factory=dict)
    kind: str = "html"


def html_to_document(html: str, url: str) -> Document:
    soup = BeautifulSoup(html, "lxml")
    jsonld = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "")
        except (ValueError, TypeError):
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and "@graph" in item:
                jsonld.extend(x for x in item["@graph"] if isinstance(x, dict))
            elif isinstance(item, dict):
                jsonld.append(item)
    meta = {}
    for m in soup.find_all("meta"):
        key = m.get("property") or m.get("name")
        if key and m.get("content"):
            meta[key.lower()] = m["content"]
    title = collapse_ws(soup.title.get_text()) if soup.title else ""
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            links.append((href, collapse_ws(a.get_text(" "))))
            continue
        absu = urldefrag(urljoin(url, href))[0]
        links.append((absu, collapse_ws(a.get_text(" "))))
    for t in soup(NON_VISIBLE):
        t.decompose()
    text = collapse_ws(soup.get_text(" "))
    return Document(url=url, title=title, text=text, links=links, jsonld=jsonld, meta=meta)


def pdf_to_document(data: bytes, url: str) -> Document:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    parts = []
    for page in reader.pages[:30]:
        try:
            parts.append(page.extract_text() or "")
        except Exception:  # pypdf raises many types on malformed PDFs
            parts.append("")
    text = collapse_ws(" ".join(parts))
    title = ""
    try:
        if reader.metadata and reader.metadata.title:
            title = str(reader.metadata.title)
    except Exception:
        title = ""
    return Document(url=url, title=title, text=text, kind="pdf")


def snapshot_to_document(raw: bytes, url: str, content_type: str) -> Document:
    if "pdf" in (content_type or "").lower() or raw[:5] == b"%PDF-":
        return pdf_to_document(raw, url)
    return html_to_document(raw.decode("utf-8", errors="replace"), url)


def excerpt(text: str, start: int, end: int, before: int = 120, after: int = 160) -> str:
    """Cut an excerpt around [start, end) on word boundaries; always a substring of text."""
    s = max(0, start - before)
    e = min(len(text), end + after)
    if s > 0:
        sp = text.find(" ", s)
        if sp != -1 and sp < start:
            s = sp + 1
    if e < len(text):
        sp = text.rfind(" ", end, e)
        if sp != -1:
            e = sp
    return text[s:e].strip()


def sentence_window(text: str, start: int, end: int, limit: int = 300) -> tuple[int, int]:
    """Indices of a window around a match bounded by sentence punctuation."""
    def is_boundary(i: int) -> bool:
        ch = text[i]
        if ch in "!?|":
            return True
        if ch == ".":
            # '3.6' or 'Rs.' followed by a digit/space-digit is not a sentence end
            nxt = text[i + 1] if i + 1 < len(text) else " "
            prv = text[i - 1] if i > 0 else " "
            if nxt.isdigit() or (prv.isdigit() and nxt.isdigit()):
                return False
            prev_word = re.search(r"(\w+)$", text[max(0, i - 6):i])
            if prev_word and prev_word.group(1).lower() in ("rs", "no", "st", "nos", "approx", "estd", "est", "dr", "mr", "ms", "mrs"):
                return False
            return nxt == " " or i + 1 == len(text)
        return False

    s = start
    floor = max(0, start - limit)
    while s > floor and not is_boundary(s - 1):
        s -= 1
    e = end
    ceil = min(len(text), end + limit)
    while e < ceil and not is_boundary(e):
        e += 1
    return s, e


def find_ci(text: str, needle: str) -> int:
    return text.lower().find(needle.lower())


WORD_RE = re.compile(r"[a-z0-9]+")
