# Google Search Console discovery and inspection

The site uses its sitemap and Search Console to monitor discovery and index status.

Google's Indexing API supports pages containing JobPosting or BroadcastEvent markup; it is not a general submission API for this site's articles or services. A successful notification response does not prove that a URL was crawled, indexed or ranked.

## Existing setup

- Property: `sc-domain:rohitraj.tech`.
- Sitemap: `https://rohitraj.tech/sitemap.xml`, already submitted in Search Console.
- Service-account key: `~/.config/gsc/indexing-sa.json` (keep private, mode 600).
- Enable the Search Console API in the account's Google Cloud project. The existing service account needs access to the property for inspection; the scripts use the read-only webmasters scope.
- Python requires `cryptography` to sign the OAuth assertion. No Google SDK package is required by these scripts.

## After meaningful page changes

Keep the sitemap's lastmod tied to actual content changes. For a few important changed URLs, use Search Console URL Inspection and its Request Indexing control. For many URLs, use the sitemap. Repeating a request does not make crawling faster, and requesting a crawl does not guarantee inclusion.

```bash
./scripts/submit-seo.sh --dry-run https://rohitraj.tech/services/forward-deployed-engineer
python3 scripts/gsc-inspect.py ~/.config/gsc/indexing-sa.json https://rohitraj.tech/services/forward-deployed-engineer
```

`submit-seo.sh` notifies IndexNow for supported participating engines, prints Google inspection links and, when configured, checks current Google index status. IndexNow does not submit URLs to Google. The command sends no Google Indexing API notifications and no deprecated sitemap pings.

Check the three priority owners first: Hire a Forward Deployed Engineer, Freelance AI Engineer and informational Forward Deployed Engineer. Track matching query impressions, clicks, position, first crawl and index status separately from whole-site traffic.

## References

- [Google: request a recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google: Indexing API eligibility](https://developers.google.com/search/apis/indexing-api/v3/using-api)
- [Google: URL Inspection API](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect)
