#!/usr/bin/env python3
"""Report each URL's REAL index status via the Search Console URL Inspection API.

Why this exists: the Google Indexing API returns HTTP 200 for any well-formed
request, and Google only officially acts on it for JobPosting / BroadcastEvent
pages. Between 2026-06-28 and 2026-08-23 the daily SEO pipeline reported
"Google Index: 200 OK" on every run while Google had discovered nothing —
16 of 20 sampled posts came back "URL is unknown to Google", and the sitemap
had not been fetched in eight weeks. This script is the honest signal.

Usage:
    python3 gsc-inspect.py <service-account.json> <url> [url ...]

The service account must be added as an owner/full user of the
sc-domain:rohitraj.tech property in Search Console.
"""
from __future__ import annotations

import base64
import json
import sys
import time
import urllib.parse
import urllib.request

SITE_URL = "sc-domain:rohitraj.tech"
TOKEN_URL = "https://oauth2.googleapis.com/token"
INSPECT_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"


def _b64(raw: bytes) -> bytes:
    return base64.urlsafe_b64encode(raw).rstrip(b"=")


def get_token(key_file: str) -> str | None:
    with open(key_file) as fh:
        sa = json.load(fh)

    now = int(time.time())
    header = _b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claim = _b64(
        json.dumps(
            {
                "iss": sa["client_email"],
                "scope": SCOPE,
                "aud": TOKEN_URL,
                "exp": now + 3600,
                "iat": now,
            }
        ).encode()
    )

    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding
    except ImportError:
        print("    SKIPPED — pip install --user cryptography")
        return None

    pk = serialization.load_pem_private_key(sa["private_key"].encode(), password=None)
    sig = _b64(pk.sign(header + b"." + claim, padding.PKCS1v15(), hashes.SHA256()))
    assertion = (header + b"." + claim + b"." + sig).decode()

    body = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        }
    ).encode()
    resp = urllib.request.urlopen(urllib.request.Request(TOKEN_URL, data=body), timeout=20)
    return json.loads(resp.read())["access_token"]


def inspect(token: str, url: str) -> dict:
    req = urllib.request.Request(
        INSPECT_URL,
        data=json.dumps({"inspectionUrl": url, "siteUrl": SITE_URL}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    payload = json.loads(urllib.request.urlopen(req, timeout=45).read())
    return payload["inspectionResult"]["indexStatusResult"]


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print(__doc__)
        return 2

    key_file = argv[1]
    urls = [u for u in argv[2:] if "sitemap.xml" not in u]
    if not urls:
        return 0

    try:
        token = get_token(key_file)
    except Exception as exc:  # noqa: BLE001 — non-fatal diagnostic script
        print(f"    SKIPPED — token error: {exc}")
        return 0
    if not token:
        return 0

    unknown = 0
    for url in urls:
        try:
            result = inspect(token, url)
        except Exception as exc:  # noqa: BLE001
            print(f"    INSPECT-ERROR {str(exc)[:70]}  {url}")
            continue

        state = result.get("coverageState", "?")
        crawl = (result.get("lastCrawlTime") or "never")[:10]
        print(f"    {state:34} last-crawl {crawl}  {url}")
        if "unknown" in state.lower():
            unknown += 1

    if unknown:
        print()
        print(f"    WARNING: {unknown}/{len(urls)} URL(s) unknown to Google.")
        print("    A URL published minutes ago is normally unknown for a few days.")
        print("    If it persists across runs, discovery is broken, not slow. Check:")
        print("      - sitemap lastDownloaded in GSC (stale = Google stopped fetching)")
        print("      - untranslated locale duplicates re-appearing in hreflang")
        print("      - Manual Actions in the GSC UI (not exposed via any API)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
