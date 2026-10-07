import { getTrackingIds } from "../src/lib/contact-tracking";

try {
  const tracking = getTrackingIds(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  );
  const checks = [
    ["GA4 measurement ID", Boolean(tracking.gaId)],
    ["Google Ads tag ID", Boolean(tracking.adsId)],
    ["Confirmed enquiry conversion label", Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ENQUIRY_LABEL?.trim())],
  ] as const;
  for (const [name, ready] of checks) console.log(`${ready ? "READY" : "MISSING"}: ${name}`);
  console.log("Contact clicks are observational; saved enquiry receipts emit the primary lead conversion.");
  if (checks.some(([, ready]) => !ready)) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid marketing configuration");
  process.exitCode = 1;
}
