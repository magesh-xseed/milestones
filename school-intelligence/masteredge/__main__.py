"""Command line interface.

  python -m masteredge run --slice 1            # one seed school, official site only
  python -m masteredge run --slice 5            # full 100-school run
  python -m masteredge run --slice 6            # every Ezyschooling city: sitemap screen + premium deep research
  python -m masteredge run --slice 5 --offline  # rebuild outputs from stored snapshots only
  python -m masteredge dashboard                # rebuild the shareable HTML dashboard
  python -m masteredge validate                 # independent read-only final validation
  python -m masteredge audit-sample             # print the audit sample for manual review
"""

from __future__ import annotations

import argparse
import json
import logging
import sys


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="masteredge")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="run a research slice")
    r.add_argument("--slice", type=int, required=True, choices=[1, 2, 3, 4, 5, 6])
    r.add_argument("--limit", type=int, default=None, help="override max schools for the slice")
    r.add_argument("--offline", action="store_true", help="use stored snapshots only (no network)")
    r.add_argument("--refresh", action="store_true", help="re-research schools already done")
    v = sub.add_parser("validate", help="independent read-only final validation")
    v.add_argument("--audit-size", type=int, default=None)
    sub.add_parser("dashboard", help="rebuild the HTML dashboard from current output files (works mid-run)")
    a = sub.add_parser("audit-sample", help="print the deterministic audit sample")
    a.add_argument("--size", type=int, default=None)
    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if args.cmd == "run":
        from .pipeline import run

        res = run(args.slice, limit=args.limit, offline=args.offline, refresh=args.refresh)
        print(json.dumps(res, indent=2))
        return 0
    if args.cmd == "validate":
        from .validate_final import main as vmain

        return vmain(audit_size=args.audit_size)
    if args.cmd == "dashboard":
        from .config import load_config
        from .dashboard import build_dashboard
        from .util import read_json

        cfg = load_config()
        print(build_dashboard(cfg, (read_json(cfg.paths.schools_master, default=None) or {}).get("schools", [])))
        return 0
    if args.cmd == "audit-sample":
        from .validate_final import print_audit_sample

        print_audit_sample(args.size)
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
