"""Load and sanity-check the editable JSON configuration."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .util import PROJECT_ROOT, read_json


class ConfigError(ValueError):
    pass


@dataclass
class Paths:
    root: Path
    config_dir: Path
    input_dir: Path
    output_dir: Path
    raw_dir: Path

    @classmethod
    def from_root(cls, root: Path, output_dir: Path | None = None) -> "Paths":
        out = output_dir or root / "data" / "output"
        return cls(
            root=root,
            config_dir=root / "config",
            input_dir=root / "data" / "input",
            output_dir=out,
            raw_dir=root / "data" / "raw",
        )

    @property
    def schools_master(self) -> Path:
        return self.output_dir / "schools_master.json"

    @property
    def school_groups(self) -> Path:
        return self.output_dir / "school_groups.json"

    @property
    def research_queue(self) -> Path:
        return self.output_dir / "research_queue.json"

    @property
    def research_history(self) -> Path:
        return self.output_dir / "research_history.jsonl"

    @property
    def validation_report(self) -> Path:
        return self.output_dir / "validation_report.json"

    @property
    def source_registry(self) -> Path:
        return self.output_dir / "source_registry.json"

    @property
    def manual_audit(self) -> Path:
        return self.root / "data" / "audit" / "manual_audit.json"


@dataclass
class Config:
    research: dict[str, Any]
    fields: dict[str, Any]
    sources: dict[str, Any]
    premium_rules: dict[str, Any]
    validation_rules: dict[str, Any]
    seeds: list[dict[str, Any]]
    paths: Paths
    _field_index: dict[str, dict] = field(default_factory=dict, repr=False)

    def field_def(self, name: str) -> dict:
        return self._field_index[name]

    @property
    def field_names(self) -> list[str]:
        return [f["name"] for f in self.fields["fields"]]

    @property
    def required_fields(self) -> list[str]:
        return [f["name"] for f in self.fields["fields"] if f.get("required")]

    @property
    def factual_fields(self) -> list[str]:
        return [f["name"] for f in self.fields["fields"] if f.get("factual")]

    def source(self, source_id: str) -> dict | None:
        for s in self.sources["sources"]:
            if s["id"] == source_id:
                return s
        return None

    def source_enabled(self, source_id: str) -> bool:
        s = self.source(source_id)
        return bool(s and s.get("enabled", True))

    def slice_settings(self, slice_no: int) -> dict:
        try:
            return self.research["slices"][str(slice_no)]
        except KeyError as exc:
            raise ConfigError(f"Unknown slice {slice_no}") from exc

    @property
    def http(self) -> dict:
        return self.research["http"]


def _require(cond: bool, msg: str) -> None:
    if not cond:
        raise ConfigError(msg)


def validate_config(cfg: Config) -> None:
    r = cfg.research
    _require(r.get("india_only") is True, "research_config.india_only must be true for this engine")
    _require(isinstance(r.get("target_school_count"), int) and r["target_school_count"] > 0,
             "target_school_count must be a positive integer")
    weights = r.get("scoring_weights", {})
    _require(abs(sum(weights.values()) - 100) < 1e-9, f"scoring_weights must sum to 100, got {sum(weights.values())}")
    names = [f["name"] for f in cfg.fields.get("fields", [])]
    _require(len(names) == len(set(names)), "fields.json contains duplicate field names")
    tiers = set(cfg.sources.get("tier_precedence", []))
    for s in cfg.sources.get("sources", []):
        _require("id" in s and "tier" in s, f"source entry missing id/tier: {s}")
        _require(s["tier"] in tiers or s["tier"] == "search_api", f"unknown tier {s['tier']} for {s['id']}")
    cats = cfg.premium_rules.get("categories", [])
    thresholds = [c["min_annual_fee_max"] for c in cats]
    _require(thresholds == sorted(thresholds, reverse=True), "premium categories must be ordered by descending threshold")
    for seed in cfg.seeds:
        _require(bool(seed.get("name")) and bool(seed.get("city")), f"seed missing name/city: {seed}")


def load_config(root: Path | None = None, output_dir: Path | None = None) -> Config:
    root = Path(root or PROJECT_ROOT)
    paths = Paths.from_root(root, output_dir)
    try:
        research = read_json(paths.config_dir / "research_config.json")
        fields = read_json(paths.config_dir / "fields.json")
        sources = read_json(paths.config_dir / "sources.json")
        premium = read_json(paths.config_dir / "premium_rules.json")
        validation = read_json(paths.config_dir / "validation_rules.json")
        seeds = read_json(paths.input_dir / "schools.json", default={"schools": []})
    except ValueError as exc:  # json.JSONDecodeError subclasses ValueError
        raise ConfigError(f"Invalid JSON in configuration: {exc}") from exc
    for name, obj in [("research_config", research), ("fields", fields), ("sources", sources),
                      ("premium_rules", premium), ("validation_rules", validation)]:
        if obj is None:
            raise ConfigError(f"Missing config file: {name}.json")
    cfg = Config(research, fields, sources, premium, validation, seeds.get("schools", []), paths)
    cfg._field_index = {f["name"]: f for f in fields["fields"]}
    validate_config(cfg)
    return cfg
