export type ContactMethod = "email" | "whatsapp" | "booking" | "phone";

/** A navigation to a contact channel is not a completed enquiry or booking. */
export function getContactMethod(href: string): ContactMethod | undefined {
  if (/^mailto:/i.test(href)) return "email";
  if (/^tel:/i.test(href)) return "phone";

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:") return undefined;

  if (["wa.me", "api.whatsapp.com"].includes(url.hostname)) return "whatsapp";
  if (
    ["cal.com", "calendly.com"].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  ) return "booking";

  return undefined;
}

export function getTrackingIds(gaId?: string, adsId?: string) {
  const ga = gaId?.trim() || undefined;
  const ads = adsId?.trim() || undefined;
  if (ga && !/^G-[A-Z0-9]+$/.test(ga)) throw new Error("Invalid GA4 measurement ID");
  if (ads && !/^AW-\d+$/.test(ads)) throw new Error("Invalid Google Ads tag ID");
  return { gaId: ga, adsId: ads, tagId: ga ?? ads };
}

export function trackConfirmedEnquiry(receiptId: string, sourcePath: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  // No names, email addresses or project descriptions are sent to Google.
  window.gtag("event", "generate_lead", { lead_source: "website_enquiry", page_path: sourcePath });
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENQUIRY_LABEL;
  if (adsId && label) {
    window.gtag("event", "conversion", { send_to: `${adsId}/${label}`, transaction_id: receiptId });
  }
}
