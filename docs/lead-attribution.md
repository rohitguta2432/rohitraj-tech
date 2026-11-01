# Enquiry sources and qualification

The form page, how someone says they found the site, and the browser's visit
source are different fields. None alone proves organic-search attribution.

- `source_path`: the page containing the submitted form (existing field).
- `discovery_source`: an optional, visitor-selected category. Never infer it.
- `landing_path`, `visit_source`, `attribution_basis`: coarse first-entry hints
  saved only after an explicit choice on the updated consent notice
  (`rr-consent=granted` and `rr-visit-consent-v1=granted`). Old analytics
  consent alone never enables this new feature. Consent denial
  clears them. Session storage expires logically after 30 minutes, is local
  to the tab and is cleared on the next check. No raw referrer, query values,
  search terms, campaign names, click IDs or identifiers are saved.
- `lead_status`: new, qualified, call_scheduled, won, not_fit, spam_test.
  Legacy entries without a status appear as unreviewed.

Unknown/no consent/blocked storage is unavailable, not direct traffic. Even a
Google referrer is only a hint: referrers can be absent or forged, and paid
markers may be missing. Known paid markers take precedence; campaign-tagged
visits stay separate from search. Self-report and browser hints stay separate
when they disagree. A visitor accepting consent after client-side navigation
uses the entry URL captured for that page lifecycle; a reload without previous
consent can lose the original landing page. Consent choices remain governed by
the existing cookie controls; outside banner regions visitors can opt in via
Cookie settings. With no configured analytics tags, no automatic attribution
is collected; the optional form answer still works.

The API discards invalid, future-dated or expired attribution rather than
failing an otherwise valid enquiry. Storage retains the existing 90-day TTL.
No personal fields or new attribution fields are sent to Google by this change.
The notifier remains unchanged and sends no new messages on status updates:
its handler processes INSERT events only, not MODIFY events.

## Review an enquiry

Read the existing notification, then classify it manually. `qualified` means
you have reviewed it as a relevant potential project; `won` means an agreed
project, not merely a call. Never automatically qualify a form submission.

```sh
python3 scripts/enquiry-status.py RECEIPT_UUID qualified --from-status new
# After reviewing the preview, add --apply to make the conditional update.
```

For old records use `--from-status unreviewed`. The conditional write fails if
the receipt is absent or another operator changed its status. It cannot create
a new enquiry. No contact details are printed. Review-only operation needs no
AWS call; live updates use the existing `mine` AWS profile and table.

`seo-weekly-report.py` reports counts by form page, self-reported discovery,
consented browser source, landing page and reviewed status. Qualified counts
include qualified/call_scheduled/won, but exclude new/unreviewed/spam/test.
Status is the current status of each cohort, not a historical conversion log.
Older leads cannot be retrospectively attributed; do not backfill guesses.

## Release and measurement

The branch is prepared for review; no production submissions or status writes
are needed to test it. Unit tests mock DynamoDB and browser storage. Before
release, compare this branch with current main, run build/tests and deploy only
within the user's publishing authorization. After deployment, verify the live
form and cookie text. Any live test submission must be explicitly identified
as a test and later marked spam_test; it would trigger the existing notification.

Baseline (report 2026-10-31, finalized dates Oct 2–29): five received forms,
all at /contact; qualified and SEO-attributed counts unknown. Check collection
seven days after deployment, then compare complete 28-day windows. First assess
source coverage and reviewed leads; do not call a missing source “direct” or a
successful deployment an SEO improvement.
