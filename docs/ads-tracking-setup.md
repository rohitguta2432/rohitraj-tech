# Contact enquiries and advertising measurement

The homepage, hire page and service pages offer direct call and WhatsApp links.
Visitors can also send a project brief from the hire, contact and service pages.

## Production configuration

Set these public, build-time variables on the existing Amplify main branch,
preserving its other variables, then rebuild:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: the website stream's `G-…` ID.
- `NEXT_PUBLIC_GOOGLE_ADS_ID`: the installed Google tag's `AW-…` ID.
- `NEXT_PUBLIC_GOOGLE_ADS_ENQUIRY_LABEL`: the label for the primary
  **Website enquiry received** action in Google Ads.

Run `npm run check:marketing` in the build environment. Local builds can omit
analytics. The old `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` remains unused.

## Confirmed enquiries

`POST /api/enquiry` validates a same-origin submission, rejects the honeypot,
limits submissions to five per IP per hour, and saves it in DynamoDB table
`rohitraj-tech-enquiries` in `ap-south-1`. A UUID receipt makes retries
idempotent. Success is returned only after the enquiry has been saved. Failed
submissions retain the form contents and offer direct email contact.

The table stream invokes `rohitraj-tech-enquiry-notifier`. It emails the site
owner and sets Reply-To to the enquirer's address. SMTP credentials stay in
AWS Secrets Manager. The Lambda retries failures; exhausted failures go to its
SQS failure queue. Enquiries expire after 90 days; rate buckets expire after
one to two hours. CloudWatch logs retain only error types, never form contents.

Provision or update the backend with `python3 scripts/setup-enquiries.py`.
The Amplify compute role needs the narrow DynamoDB policy this script installs.
The notifier has its own role for the stream, table, secret, logs and failure
queue. The existing owner SMTP configuration is required on first setup; do not
commit credentials or use public environment variables for them.

## What gets measured

Call, email, WhatsApp and recognised booking links emit the observational
`contact_click` event with `contact_method` and page pathname. They do not emit
an Ads conversion or prove that a conversation occurred.

After a valid saved receipt, the form emits GA4 `generate_lead` and the direct
Ads **Website enquiry received** conversion, with the receipt as
`transaction_id`. No names, email addresses, brief contents or query strings
are sent to Google. An analytics blocker cannot undo a received enquiry.

Use **Website enquiry received** as the primary action under **Submit lead
form**, counting one lead per ad interaction with zero assigned monetary value.
Keep contact clicks secondary. Do not import GA4 generate_lead as another
primary action for the same enquiry. Enhanced conversions are not enabled.

## Verification

1. Run the enquiry API, form and contact tracking tests, typecheck and build.
2. Submit a clearly labelled verification brief without firing live advertising
   events. Confirm a persisted receipt and the notification_sent marker.
3. Verify the published form, direct links and deferred Google tag load.
4. Confirm the campaign uses the Submit lead form goal. Review lead quality
   separately from contact clicks and account for the campaign's limited traffic.

Reference: [Google Ads primary/secondary conversions](https://support.google.com/google-ads/answer/11461796).
