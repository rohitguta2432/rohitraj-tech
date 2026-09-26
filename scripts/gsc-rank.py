#!/usr/bin/env python3
"""Search Analytics snapshot for the daily seo-rank-grind (its Step 2 rank check).

Why this exists: until 2026-09-26 every grind run hand-wrote this query. The
first attempt usually imported google.oauth2, which the system python3 does not
have (ModuleNotFoundError on 09-24 and 09-26), before falling back to the JWT
signer in gsc-inspect.py. This script is that fallback, made permanent, plus
snapshots so deltas come from data instead of re-reading old log entries.

Usage:
    python3 gsc-rank.py <service-account.json> [--no-save]

Prints the 28d no-dimension total (the canonical metric; page-dimension sums
overcount and 7d query rows are anonymization-thresholded to near zero at this
volume), the grind's head terms, adjacent query-family rows, the 28d top-10
queries and 7d page rows for the owning pages. Deltas are against the newest
earlier snapshot in ~/.config/gsc/rank-snapshots/. `site:` queries (our own
inspection traffic) are excluded everywhere.
"""
from __future__ import annotations

import datetime
import importlib.util
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SITE_URL = "sc-domain:rohitraj.tech"
API_URL = (
    "https://www.googleapis.com/webmasters/v3/sites/"
    f"{urllib.parse.quote(SITE_URL, safe='')}/searchAnalytics/query"
)
SNAP_DIR = Path.home() / ".config" / "gsc" / "rank-snapshots"
HOME = "https://rohitraj.tech"

# The grind's keyword → owning-page map. Exact-match rows; usually absent
# until a term clears Google's anonymization threshold.
HEAD_TERMS = [
    "ai consultant",
    "ai consultant india",
    "hire a forward deployed engineer",
    "fractional forward deployed engineer",
    "mcp integration consultant",
    "claude code consultant",
    "founding engineer for hire in india",
    "forward deployed engineer",
    # Secondary, report-only (added 2026-09-26) → /services/fractional-ai-engineer
    "freelance ai engineer",
    "hire ai engineer",
    "freelance ai architect",
]
# Substrings for the target and adjacent query families.
FAMILIES = [
    "ai consultant", "forward deployed", "fractional forward", "mcp integration",
    "claude code consultant", "founding engineer", "fractional cto",
    "part-time cto", "part time cto", "mcp server", "mcp consultant",
    "engineer india", "fde ", "freelance", "ai engineer", "ai architect",
]
OWNING_NOTE = "/notes/what-does-a-forward-deployed-engineer-do-2026"


def _load_get_token():
    path = Path(__file__).with_name("gsc-inspect.py")
    spec = importlib.util.spec_from_file_location("gsc_inspect", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.get_token


def query(token: str, days: int, dims: list[str] | None = None, limit: int = 1000) -> list[dict]:
    today = datetime.date.today()
    body: dict = {
        "startDate": str(today - datetime.timedelta(days=days)),
        "endDate": str(today),
        "rowLimit": limit,
    }
    if dims:
        body["dimensions"] = dims
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    return json.loads(urllib.request.urlopen(req, timeout=45).read()).get("rows", [])


def _metrics(row: dict) -> dict:
    return {
        "impressions": row.get("impressions", 0),
        "clicks": row.get("clicks", 0),
        "position": round(row.get("position", 0.0), 1),
    }


def _delta(now: float, before: float | None, digits: int = 0) -> str:
    if before is None:
        return ""
    diff = round(now - before, digits)
    if diff == 0:
        return " (=)"
    return f" ({'+' if diff > 0 else ''}{diff:.{digits}f})"


def _fmt(m: dict, prev: dict | None) -> str:
    p = prev or {}
    return (
        f"imp {m['impressions']}{_delta(m['impressions'], p.get('impressions'))}  "
        f"clicks {m['clicks']}{_delta(m['clicks'], p.get('clicks'))}  "
        f"pos {m['position']:.1f}{_delta(m['position'], p.get('position'), 1)}"
    )


def _previous_snapshot(today: str) -> dict | None:
    if not SNAP_DIR.is_dir():
        return None
    older = sorted(p for p in SNAP_DIR.glob("*.json") if p.stem < today)
    return json.loads(older[-1].read_text()) if older else None


def _is_owning_page(url: str) -> bool:
    return "/services/" in url or url.rstrip("/") == HOME or url.endswith(OWNING_NOTE)


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        return 2
    save = "--no-save" not in argv

    try:
        token = _load_get_token()(args[0])
    except Exception as exc:  # noqa: BLE001 — report and let the grind log it
        print(f"RANK-CHECK FAILED — token error: {exc}")
        return 1
    if not token:
        print("RANK-CHECK FAILED — no token (see message above)")
        return 1

    try:
        total_rows = query(token, 28)
        query_rows = [r for r in query(token, 28, ["query"]) if "site:" not in r["keys"][0]]
        page_rows = query(token, 7, ["page"], 500)
    except urllib.error.HTTPError as exc:
        print(f"RANK-CHECK FAILED — HTTP {exc.code}: {exc.read()[:160]!r}")
        return 1
    except Exception as exc:  # noqa: BLE001
        print(f"RANK-CHECK FAILED — {exc}")
        return 1

    today = str(datetime.date.today())
    prev = _previous_snapshot(today)
    prev_queries = (prev or {}).get("queries", {})
    snap = {
        "date": today,
        "total": _metrics(total_rows[0]) if total_rows else _metrics({}),
        "queries": {},
        "pages7d": {},
    }

    since = f" vs {prev['date']}" if prev else " (no earlier snapshot — deltas start next run)"
    print(f"CANONICAL 28d no-dim{since}: {_fmt(snap['total'], (prev or {}).get('total'))}")

    by_query = {r["keys"][0].lower(): r for r in query_rows}
    print("\nHEAD TERMS (28d exact query):")
    for term in HEAD_TERMS:
        row = by_query.get(term)
        print(f"  {term:40} " + (_fmt(_metrics(row), prev_queries.get(term)) if row else "—"))

    hits = sorted(
        (r for r in query_rows if any(f in r["keys"][0].lower() for f in FAMILIES)),
        key=lambda r: -r["impressions"],
    )
    print(f"\nFAMILY ROWS (28d, {len(hits)} of {len(query_rows)} query rows):")
    for row in hits[:25]:
        q = row["keys"][0].lower()
        snap["queries"][q] = _metrics(row)
        tag = "" if not prev else ("  NEW" if q not in prev_queries else "")
        print(f"  {_fmt(snap['queries'][q], prev_queries.get(q))}  {q}{tag}")
    if not hits:
        print("  (none)")
    gone = sorted(set(prev_queries) - set(snap["queries"])) if prev else []
    if gone:
        print(f"  GONE since {prev['date']}: {', '.join(gone)}")

    print("\nTOP-10 QUERIES (28d, all):")
    for row in sorted(query_rows, key=lambda r: -r["impressions"])[:10]:
        m = _metrics(row)
        print(f"  imp {m['impressions']:>4}  pos {m['position']:>5.1f}  {row['keys'][0]}")

    print("\nOWNING / SERVICE PAGES (7d page-dim):")
    shown = 0
    for row in sorted(page_rows, key=lambda r: -r["impressions"]):
        url = row["keys"][0]
        if _is_owning_page(url):
            snap["pages7d"][url] = _metrics(row)
            print(f"  {_fmt(snap['pages7d'][url], None)}  {url}")
            shown += 1
    if not shown:
        print("  (none)")

    if save:
        SNAP_DIR.mkdir(parents=True, exist_ok=True)
        (SNAP_DIR / f"{today}.json").write_text(json.dumps(snap, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
