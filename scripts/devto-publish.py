#!/usr/bin/env python3
# Cross-post a blog post to dev.to via API as a backlink-attribution stub.
# Reads post metadata from src/data/posts/<slug>.ts and creates a short
# dev.to article with canonical_url pointing to rohitraj.tech (dofollow backlink).
#
# Usage:
#   export DEV_TO_API_KEY="..."
#   python3 scripts/devto-publish.py --slug spring-boot-mcp           # publish one
#   python3 scripts/devto-publish.py --slug spring-boot-mcp --dry-run # preview
#   python3 scripts/devto-publish.py --slug spring-boot-mcp --tags java,ai,mcp,backend  # override tags
#   python3 scripts/devto-publish.py --slug spring-boot-mcp --fix-tags  # retag the LIVE article, no new post
#
# Tags come from scripts/crosspost_tags.py — topic signals mapped onto a curated
# allowlist of real dev.to tags, max 4, `ai` always included. Off-allowlist tags
# are rejected rather than emitted.
#
# Called automatically by daily-seo-content skill (Step 13: cross-post for backlink).
#
# API docs: https://developers.forem.com/api/v1#tag/articles
# Rate limit: 9 articles per 30s (new accounts may be lower; script retries once on 429)

import os
import re
import sys
import json
import time
import argparse
import urllib.request
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from crosspost_tags import devto_tags, filter_devto_tags  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "src" / "data" / "posts"
BASE_URL = "https://rohitraj.tech/notes"
API = "https://dev.to/api/articles"
COVER_BASE = "https://rohitraj.tech/images/notes"
SERVICES_FILE = REPO / "src" / "data" / "services.ts"
MAX_SERVICE_LINKS = 3


def read_post_meta(slug: str) -> dict:
    """Extract title, excerpt, keywords from src/data/posts/<slug>.ts via regex."""
    path = POSTS_DIR / f"{slug}.ts"
    if not path.exists():
        raise FileNotFoundError(f"Post file not found: {path}")
    text = path.read_text(encoding="utf-8")

    def grab(field):
        m = re.search(rf"{field}:\s*['\"](.+?)['\"]\s*,", text)
        return m.group(1).replace("\\'", "'").replace('\\"', '"') if m else None

    title = grab("title")
    excerpt = grab("excerpt")
    if not title or not excerpt:
        raise ValueError(f"Missing title or excerpt in {path}")

    # keywords: ['a','b','c']
    kw_match = re.search(r"keywords:\s*\[(.*?)\]", text, re.DOTALL)
    keywords = []
    if kw_match:
        keywords = re.findall(r"['\"]([^'\"]+)['\"]", kw_match.group(1))

    return {"title": title, "excerpt": excerpt, "keywords": keywords}


# Tag derivation lives in scripts/crosspost_tags.py: keyword phrases are
# matched against topic signals and mapped onto a curated allowlist of real
# dev.to tags. Never tokenize keyword phrases into words — that produced
# meaningless tags like ['model', 'price', 'war', 'august'] with zero reach.


def service_links(slug: str) -> list:
    """(title, url) for each /services/* page the post links to, in order, max 3.

    The teaser alone sends no external links to the service pages; reusing the
    ones the post already chose keeps them topical instead of a fixed block.
    """
    post = (POSTS_DIR / f"{slug}.ts").read_text(encoding="utf-8")
    titles = dict(
        re.findall(r'slug:\s*"([^"]+)",\s*title:\s*"([^"]+)"', SERVICES_FILE.read_text(encoding="utf-8"))
    )
    links = []
    for s in re.findall(r"/services/([a-z0-9-]+)", post):
        if s in titles and s not in [l[0] for l in links]:
            links.append((s, titles[s]))
    return [(t, f"https://rohitraj.tech/services/{s}") for s, t in links[:MAX_SERVICE_LINKS]]


def build_payload(slug: str, meta: dict, tags: list) -> dict:
    canonical = f"{BASE_URL}/{slug}"
    cover_file = REPO / "public" / "images" / "notes" / f"{slug}-cover.jpg"
    cover_url = f"{COVER_BASE}/{slug}-cover.jpg" if cover_file.exists() else None
    body = (
        f"> Originally published on [rohitraj.tech]({canonical})\n\n"
        f"{meta['excerpt']}\n\n"
        f"---\n"
        f"**Read the full version with code samples, diagrams, and architecture details:** "
        f"[{meta['title']}]({canonical})\n\n"
    )
    services = service_links(slug)
    if services:
        body += "**Work with me:** " + " · ".join(f"[{t}]({u})" for t, u in services) + "\n\n"
    body += (
        f"More engineering notes: [rohitraj.tech/notes](https://rohitraj.tech/notes)\n"
    )
    article = {
        "title": meta["title"],
        "published": True,
        "body_markdown": body,
        "tags": tags,
        "canonical_url": canonical,
        "description": meta["excerpt"][:200],
    }
    if cover_url:
        article["main_image"] = cover_url
    return {"article": article}


def api_get(url: str, api_key: str) -> tuple:
    req = urllib.request.Request(
        url,
        method="GET",
        headers={
            "api-key": api_key,
            "Accept": "application/vnd.forem.api-v1+json",
            "User-Agent": "rohitraj-tech-crosspost/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return True, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, {"status": e.code, "error": e.read().decode("utf-8", "ignore")}
    except Exception as e:
        return False, {"error": str(e)}


def find_my_article(slug: str, api_key: str) -> dict:
    """Locate an already-published dev.to article by its canonical_url.

    Matching on canonical_url (not title) is what makes --fix-tags safe: it
    resolves to the exact existing article id, and PUT /articles/{id} edits
    that record in place. No POST is issued, so no duplicate can be created.
    """
    canonical = f"{BASE_URL}/{slug}"
    for page in range(1, 6):
        ok, body = api_get(f"{API}/me/published?per_page=100&page={page}", api_key)
        if not ok:
            raise RuntimeError(f"dev.to list failed: {body}")
        if not body:
            break
        for art in body:
            if (art.get("canonical_url") or "").rstrip("/") == canonical:
                return art
    return {}


def update_tags(article_id: int, tags: list, api_key: str) -> tuple:
    """PUT /articles/{id} with tags only — in-place edit, never a new post."""
    data = json.dumps({"article": {"tags": tags}}).encode("utf-8")
    req = urllib.request.Request(
        f"{API}/{article_id}",
        data=data,
        method="PUT",
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/vnd.forem.api-v1+json",
            "User-Agent": "rohitraj-tech-crosspost/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return True, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, {"status": e.code, "error": e.read().decode("utf-8", "ignore")}
    except Exception as e:
        return False, {"error": str(e)}


def fix_tags(slug: str, tags: list, api_key: str, assume_yes: bool) -> int:
    try:
        art = find_my_article(slug, api_key)
    except RuntimeError as e:
        print(f"ERROR: {e}")
        return 2
    if not art:
        print(f"ERROR: no published dev.to article with canonical_url {BASE_URL}/{slug}")
        print("       Nothing updated. (Not publishing a new one — use the default mode for that.)")
        return 2

    print(f"--- Fixing tags on existing dev.to article (no new post) ---")
    print(f"    id:      {art['id']}")
    print(f"    url:     {art.get('url')}")
    print(f"    before:  {art.get('tag_list')}")
    print(f"    after:   {tags}")
    if not assume_yes:
        if input("Apply this in-place update? [y/N] ").strip().lower() not in ("y", "yes"):
            print("  aborted, nothing changed.")
            return 1

    ok, body = update_tags(art["id"], tags, api_key)
    if not ok:
        print(f"  ✗ {body}")
        return 2
    if body.get("id") != art["id"]:
        print(f"  ✗ UNEXPECTED: response id {body.get('id')} != {art['id']} — verify manually.")
        return 2
    print(f"  ✓ updated in place: id {body['id']} → tags {body.get('tag_list')}")
    print(f"  ✓ {body.get('url')}")
    return 0


def publish(payload: dict, api_key: str, retry_on_rate_limit: bool = True) -> tuple:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API,
        data=data,
        method="POST",
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/vnd.forem.api-v1+json",
            "User-Agent": "rohitraj-tech-crosspost/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = json.loads(r.read().decode("utf-8"))
            return True, body
    except urllib.error.HTTPError as e:
        err_text = e.read().decode("utf-8", "ignore")
        if e.code == 429 and retry_on_rate_limit:
            print("  ⏳ rate-limited (429), waiting 90s + retry...")
            time.sleep(90)
            return publish(payload, api_key, retry_on_rate_limit=False)
        return False, {"status": e.code, "error": err_text}
    except Exception as e:
        return False, {"error": str(e)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="Post slug (matches src/data/posts/<slug>.ts)")
    ap.add_argument("--dry-run", action="store_true", help="Print payload, no API call")
    ap.add_argument("--tags", help="Comma-separated tag override (max 4, allowlisted)")
    ap.add_argument("--fix-tags", action="store_true",
                    help="Update tags on the ALREADY-published article (PUT /articles/{id}). "
                         "Never creates a new post.")
    ap.add_argument("--yes", action="store_true", help="Skip the --fix-tags confirmation prompt")
    args = ap.parse_args()

    try:
        meta = read_post_meta(args.slug)
    except (FileNotFoundError, ValueError) as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    if args.tags:
        tags, rejected = filter_devto_tags(args.tags.split(","))
        if rejected:
            print(f"  ! dropped non-dev.to tags: {rejected}")
        if not tags:
            print("ERROR: no valid dev.to tags in --tags. See DEVTO_TOP_TAGS in "
                  "scripts/crosspost_tags.py for the allowlist.")
            sys.exit(1)
    else:
        tags = devto_tags(meta["keywords"], meta["title"])

    if args.dry_run and not args.fix_tags:
        print(json.dumps(build_payload(args.slug, meta, tags), indent=2))
        print(f"\nDry-run done. Tags: {tags}")
        return

    api_key = os.environ.get("DEV_TO_API_KEY", "").strip()
    if not api_key:
        print("ERROR: DEV_TO_API_KEY not set.")
        print("Get key at: https://dev.to/settings/extensions")
        print("Then: export DEV_TO_API_KEY='your_key' (add to ~/.config/fish/config.fish for persistence)")
        sys.exit(1)

    if args.fix_tags:
        sys.exit(fix_tags(args.slug, tags, api_key, args.yes))

    payload = build_payload(args.slug, meta, tags)
    print(f"--- Cross-posting to dev.to: {args.slug} ---")
    print(f"    title: {meta['title']}")
    print(f"    tags:  {tags}")
    ok, body = publish(payload, api_key)
    if ok:
        url = body.get("url", "(no url returned)")
        print(f"  ✓ {url}")
        print(f"  ✓ Backlink attribution: canonical_url → https://rohitraj.tech/notes/{args.slug}")
    else:
        print(f"  ✗ {body}")
        sys.exit(2)


if __name__ == "__main__":
    main()
