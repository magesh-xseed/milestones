"""Run the test suite and write data/output/test_execution_summary.md (+ junit XML)."""

from __future__ import annotations

import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "output"


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    junit = OUT / "test_results.xml"
    proc = subprocess.run([sys.executable, "-m", "pytest", "-q", f"--junitxml={junit}"], cwd=ROOT,
                          capture_output=True, text=True)
    suites = ET.parse(junit).getroot()
    suite = suites if suites.tag == "testsuite" else suites.find("testsuite")
    by_module: dict[str, list] = {}
    for case in suite.iter("testcase"):
        mod = case.get("classname", "").split(".")[-1]
        status = "failed" if case.find("failure") is not None or case.find("error") is not None else (
            "skipped" if case.find("skipped") is not None else "passed")
        by_module.setdefault(mod, []).append((case.get("name"), status, float(case.get("time", 0))))
    total = sum(len(v) for v in by_module.values())
    passed = sum(1 for v in by_module.values() for _, s, _ in v if s == "passed")
    failed = sum(1 for v in by_module.values() for _, s, _ in v if s == "failed")
    kinds = {"test_normalize": "Unit: normalization, fee parsing, grades, curriculum mapping",
             "test_extract": "Unit + negative: extraction rules and context guards",
             "test_records_scoring": "Unit + regression: resolution, conflicts, dedupe, scoring, config validation",
             "test_http": "Negative/compliance: robots.txt, 403, challenges, offline, invalid PDF",
             "test_history": "Unit: curriculum history events",
             "test_pipeline_integration": "Integration + E2E + regression + negative over a local HTTP fixture site"}
    lines = ["# Test Execution Summary", "",
             f"- Run at: {datetime.now(timezone.utc).replace(microsecond=0).isoformat()}",
             f"- Command: `python -m pytest -q`",
             f"- Result: **{passed}/{total} passed**, {failed} failed ({round(100 * passed / total, 1) if total else 0}% pass rate)",
             "- Automated tests use deterministic local fixtures only. Live-source behaviour is exercised by the",
             "  vertical-slice runs and checked by the independent validator (see final_validation_summary.md).", "",
             "| Module | Scope | Passed | Failed |", "|---|---|---|---|"]
    for mod, cases in sorted(by_module.items()):
        lines.append(f"| `{mod}` | {kinds.get(mod, '')} | {sum(1 for c in cases if c[1] == 'passed')} | {sum(1 for c in cases if c[1] == 'failed')} |")
    lines += ["", "## Test cases", ""]
    for mod, cases in sorted(by_module.items()):
        lines.append(f"### {mod}")
        lines += [f"- {'✅' if s == 'passed' else ('⏭' if s == 'skipped' else '❌')} `{n}`" for n, s, _ in cases]
        lines.append("")
    if failed:
        lines += ["## Failure output", "", "```", proc.stdout[-6000:], "```"]
    (OUT / "test_execution_summary.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"{passed}/{total} passed, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
