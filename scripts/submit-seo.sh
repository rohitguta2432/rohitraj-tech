#!/usr/bin/env bash
# Notify IndexNow about changed pages and show supported Google discovery links.
# Google does not support the Indexing API for ordinary articles/services.
# Usage: ./scripts/submit-seo.sh [--dry-run] [changed-url ...]
# With a GSC key, the closing URL Inspection call reports real index status.

set -euo pipefail

HOST="rohitraj.tech"
KEY="fa4a18743acca1eb87d790a528b762fb"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
SITEMAP_URL="https://${HOST}/sitemap.xml"
GOOGLE_INDEXING_KEY_FILE="${GOOGLE_INDEXING_KEY_FILE:-$HOME/.config/gsc/indexing-sa.json}"

DEFAULT_URLS=(
  "https://${HOST}"
  "https://${HOST}/notes"
  "https://${HOST}/services"
)

# Always append homepage + notes index when explicit URLs are passed —
# refreshes the link graph + freshens listing page on every ship.
ALWAYS_INCLUDE=(
  "https://${HOST}"
  "https://${HOST}/notes"
)

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  shift
fi

if [ $# -gt 0 ]; then
  URLS=("$@")
  # De-dupe: only append ALWAYS_INCLUDE entries not already in $@
  for inc in "${ALWAYS_INCLUDE[@]}"; do
    skip=0
    for u in "${URLS[@]}"; do
      [ "$u" = "$inc" ] && skip=1 && break
    done
    [ $skip -eq 0 ] && URLS+=("$inc")
  done
else
  URLS=("${DEFAULT_URLS[@]}")
fi

echo "==> SEO submission pipeline"
echo "    host=${HOST}"
echo "    submitting ${#URLS[@]} URL(s)"

# ---------- IndexNow (Bing + Yandex + ChatGPT-web-search crawl) ----------
URL_JSON=$(printf '"%s",' "${URLS[@]}" | sed 's/,$//')
PAYLOAD=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": [${URL_JSON}]
}
EOF
)

echo
if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY RUN: IndexNow payload (no requests sent)"
  printf '%s\n' "$PAYLOAD"
  echo "Google: sitemap ${SITEMAP_URL}; use Search Console URL Inspection for changed pages."
  exit 0
fi

echo "--- IndexNow → api.indexnow.org ---"
curl --connect-timeout 10 --max-time 45 -s -o /tmp/indexnow.out -w "HTTP %{http_code}\n" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "${PAYLOAD}"
cat /tmp/indexnow.out; echo

echo "--- IndexNow → Bing mirror ---"
curl --connect-timeout 10 --max-time 45 -s -o /tmp/indexnow-bing.out -w "HTTP %{http_code}\n" \
  -X POST "https://www.bing.com/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "${PAYLOAD}"
cat /tmp/indexnow-bing.out; echo

echo "--- IndexNow → Yandex mirror ---"
curl --connect-timeout 10 --max-time 45 -s -o /tmp/indexnow-yandex.out -w "HTTP %{http_code}\n" \
  -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "${PAYLOAD}" || true
cat /tmp/indexnow-yandex.out 2>/dev/null; echo

# ---------- Supported Google discovery ----------
echo
echo "==> Google: sitemap ${SITEMAP_URL}"
echo "    Ordinary pages use sitemap discovery and Search Console Request Indexing."
echo "    No Google Indexing API request is sent; IndexNow does not submit to Google."

# ---------- GSC inspection links ----------
echo
  echo "==> Google Search Console inspection links"
  echo "    For meaningfully changed pages, inspect then use Request Indexing if appropriate:"
  SC_PROPERTY=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "sc-domain:${HOST}")
  for u in "${URLS[@]}"; do
    if [[ "$u" == *"sitemap.xml"* ]]; then
      continue
    fi
    encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "${u}")
    echo "    → https://search.google.com/search-console/inspect?resource_id=${SC_PROPERTY}&id=${encoded}"
  done

# ---------- Real indexation check (URL Inspection API) ----------
# The only signal that tells the truth about whether Google has the URL.
# Between 2026-06-28 and 2026-08-23 this pipeline printed "Google Index: 200 OK"
# on every run while Google had discovered nothing: 16 of 20 sampled posts came
# back "URL is unknown to Google". Never treat the Indexing API 200 as proof.
echo
if [ -f "${GOOGLE_INDEXING_KEY_FILE}" ]; then
  echo "==> URL Inspection (actual index status)"
  python3 "$(dirname "$0")/gsc-inspect.py" "${GOOGLE_INDEXING_KEY_FILE}" "${URLS[@]}"
fi
echo
echo "==> Done."
