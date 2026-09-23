#!/usr/bin/env python3
"""Daily rank snapshot from the Search Console Search Analytics API.

Pulls average position, clicks and impressions per query and per page for the
last 28 days (ending 3 days ago — GSC data lags ~2-3 days), saves a dated JSON
snapshot, and prints each row with its position change vs the previous one.

Usage:
    python3 gsc-rank.py [service-account.json]

Snapshots land in ~/.local/share/rohitraj-seo/ranks/YYYY-MM-DD.json.
Auth reuses get_token() from gsc-inspect.py (same service account).
"""
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

SITE_URL = "sc-domain:rohitraj.tech"
KEY_FILE = os.environ.get(
    "GOOGLE_INDEXING_KEY_FILE", str(Path.home() / ".config/gsc/indexing-sa.json")
)
SNAP_DIR = Path.home() / ".local/share/rohitraj-seo/ranks"
ROW_LIMIT = 50
WINDOW_DAYS = 28
LAG_DAYS = 3


def load_get_token():
    path = Path(__file__).with_name("gsc-inspect.py")
    spec = importlib.util.spec_from_file_location("gsc_inspect", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.get_token


def query(token: str, dimension: str, start: str, end: str) -> list[dict]:
    url = (
        "https://searchconsole.googleapis.com/webmasters/v3/sites/"
        f"{urllib.parse.quote(SITE_URL, safe='')}/searchAnalytics/query"
    )
    body = json.dumps(
        {
            "startDate": start,
            "endDate": end,
            "dimensions": [dimension],
            "rowLimit": ROW_LIMIT,
        }
    ).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    rows = json.loads(urllib.request.urlopen(req, timeout=30).read()).get("rows", [])
    return [
        {
            "key": r["keys"][0],
            "position": round(r["position"], 1),
            "clicks": r["clicks"],
            "impressions": r["impressions"],
        }
        for r in rows
    ]


def previous_snapshot(today: str) -> dict | None:
    snaps = sorted(p for p in SNAP_DIR.glob("*.json") if p.stem < today)
    return json.loads(snaps[-1].read_text()) if snaps else None


def print_table(title: str, rows: list[dict], prev_rows: list[dict] | None) -> None:
    prev = {r["key"]: r["position"] for r in (prev_rows or [])}
    print(f"\n--- {title} (top {len(rows)} by clicks) ---")
    if not rows:
        print("    no data yet")
        return
    print(f"    {'pos':>5} {'Δ':>6} {'clicks':>6} {'impr':>6}  key")
    for r in rows:
        if r["key"] not in prev:
            delta = "new"
        else:
            # Positive = moved up (lower position number is better)
            d = round(prev[r["key"]] - r["position"], 1)
            delta = f"{d:+.1f}" if d else "0"
        key = r["key"].replace("https://rohitraj.tech", "") or "/"
        print(f"    {r['position']:>5} {delta:>6} {r['clicks']:>6} {r['impressions']:>6}  {key}")


def main() -> int:
    key_file = sys.argv[1] if len(sys.argv) > 1 else KEY_FILE
    token = load_get_token()(key_file)
    if not token:
        print("ERROR: failed to obtain access token")
        return 1

    today = dt.date.today()
    end = today - dt.timedelta(days=LAG_DAYS)
    start = end - dt.timedelta(days=WINDOW_DAYS - 1)
    snap = {
        "date": today.isoformat(),
        "range": [start.isoformat(), end.isoformat()],
        "queries": query(token, "query", start.isoformat(), end.isoformat()),
        "pages": query(token, "page", start.isoformat(), end.isoformat()),
    }

    SNAP_DIR.mkdir(parents=True, exist_ok=True)
    prev = previous_snapshot(snap["date"])
    (SNAP_DIR / f"{snap['date']}.json").write_text(json.dumps(snap, indent=2))

    print(f"==> Rank snapshot {snap['date']}  range={start}..{end}")
    print(f"    compared with: {prev['date'] if prev else 'none (first run)'}")
    print_table("Queries", snap["queries"], prev and prev["queries"])
    print_table("Pages", snap["pages"], prev and prev["pages"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
