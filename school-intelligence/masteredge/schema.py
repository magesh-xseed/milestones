"""JSON Schemas for output files (specification only; no side effects)."""

EVIDENCE_SCHEMA = {
    "type": "object",
    "required": ["evidence_id", "school_id", "field_name", "raw_value", "normalized_value", "source_url",
                 "source_title", "source_type", "publication_date", "retrieved_at", "evidence_excerpt",
                 "verification_status", "confidence_score", "extraction_method"],
    "properties": {
        "evidence_id": {"type": "string", "pattern": "^ev-[0-9a-f]{16}$"},
        "school_id": {"type": "string"},
        "field_name": {"type": "string"},
        "raw_value": {"type": "string", "minLength": 1},
        "source_url": {"type": "string", "pattern": "^https?://"},
        "source_title": {"type": "string"},
        "source_type": {"enum": ["official_registry", "official_school_site", "archive", "third_party"]},
        "publication_date": {"type": ["string", "null"]},
        "retrieved_at": {"type": "string"},
        "evidence_excerpt": {"type": "string", "minLength": 1},
        "verification_status": {"enum": ["official_registry_verified", "official_source", "archive_source",
                                         "third_party_source", "unverified"]},
        "confidence_score": {"type": "number", "minimum": 0, "maximum": 1},
        "extraction_method": {"type": "string"},
        "snapshot_sha256": {"type": ["string", "null"]},
        "superseded": {"type": "boolean"},
    },
}

FIELD_STATUSES = ["official_registry_verified", "official_source", "archive_only", "third_party_only", "conflict",
                  "not_found", "needs_review", "analysis"]

FACT_SCHEMA = {
    "type": "object",
    "required": ["value", "status", "evidence_ids"],
    "properties": {
        "status": {"enum": FIELD_STATUSES},
        "evidence_ids": {"type": "array", "items": {"type": "string"}},
    },
}

SCHOOL_SCHEMA = {
    "type": "object",
    "required": ["school_id", "record_version", "created_at", "updated_at", "content_hash", "input", "origin",
                 "fields", "evidence", "research_checks", "analysis", "data_gaps"],
    "properties": {
        "school_id": {"type": "string", "pattern": "^IN-[a-z0-9-]+-[0-9a-f]{6}$"},
        "record_version": {"type": "integer", "minimum": 1},
        "fields": {"type": "object", "additionalProperties": FACT_SCHEMA},
        "evidence": {"type": "array", "items": EVIDENCE_SCHEMA},
        "research_checks": {"type": "object", "additionalProperties": {
            "type": "object", "required": ["status"],
            "properties": {"status": {"enum": ["done", "not_publicly_available", "blocked", "failed", "skipped", "not_applicable"]}}}},
        "analysis": {"type": "object"},
        "data_gaps": {"type": "array"},
    },
}

MASTER_SCHEMA = {
    "type": "object",
    "required": ["schema_version", "generated_at", "run_id", "schools"],
    "properties": {
        "schema_version": {"const": "1.0"},
        "schools": {"type": "array", "items": SCHOOL_SCHEMA},
    },
}

GROUPS_SCHEMA = {
    "type": "object",
    "required": ["schema_version", "groups"],
    "properties": {"groups": {"type": "array", "items": {
        "type": "object", "required": ["group_id", "basis", "member_school_ids", "campuses_in_dataset"]}}},
}

QUEUE_SCHEMA = {
    "type": "object",
    "required": ["items"],
    "properties": {"items": {"type": "array", "items": {
        "type": "object", "required": ["school_id", "status", "seed"],
        "properties": {"status": {"enum": ["pending", "in_progress", "done", "failed", "rejected"]}}}}},
}
