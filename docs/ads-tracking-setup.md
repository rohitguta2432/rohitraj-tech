# Contact enquiries and advertising measurement

The hire and service pages send visitors to the existing `/contact` page.
Visitors can use its email, WhatsApp and social links. No Calendar or Google Meet
booking integration is required.

## Production configuration

Set these **public, build-time** variables on the existing Amplify app or its
`main` branch, preserving other variables, then rebuild and deploy:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: the website stream's `G-…` measurement ID.
- `NEXT_PUBLIC_GOOGLE_ADS_ID`: the Google tag's `AW-…` ID. A Google Ads customer
  number is a different identifier and must not be used here.

Check the configuration with `npm run check:marketing` in the build environment.
Missing or invalid values return a nonzero exit status. The site can still build
without analytics for local development and forks. An empty GA4 variable does
not prevent a correctly configured Ads tag from loading.

Use GA4 Admin → Data streams to obtain the measurement ID. Obtain the Ads tag ID
from the intended account's Google tag setup. Do not generate placeholder IDs.

## What gets measured

The delegated click listener emits `contact_click` with `contact_method` equal
to `email`, `whatsapp` or `booking` for recognized external scheduling links,
plus the current page's pathname. It does not send the destination URL, email
address or query-string contents as event parameters. Visiting `/contact`
alone does not emit a contact-click or completed-lead event.

Contact clicks do **not** emit `generate_lead` or an Ads `conversion`. The old
`NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` is intentionally unused. Keep contact clicks
secondary if importing them into Google Ads; do not optimize lead bidding for
opening an email composer or WhatsApp page.

This site cannot observe whether an enquiry was actually received in email or
WhatsApp. Report completed or qualified enquiries through an independently
verified integration or an appropriate offline-conversion process. Do not count
an outbound click or revisiting `/contact` as a completed enquiry.

If importing both GA4 and direct Ads conversions in future, ensure the same
business action is not counted as two primary conversions.

## Verification before paid traffic

1. Confirm that the hire and service CTAs lead to `/contact` and that the existing
   contact links work.
2. Verify the published site has the expected tag IDs using Tag Assistant and
   confirm that GA4 receives a contact-click event when tested intentionally.
3. Confirm that no completed-lead or Ads conversion is emitted by a contact
   click, and that the campaign's primary goal represents an actual outcome.
4. Review the Ads campaign's budget, geography, keywords and bidding separately.
   A successful website deployment does not publish an Ads campaign.

Reference: [Google Ads primary/secondary conversions](https://support.google.com/google-ads/answer/11461796).
