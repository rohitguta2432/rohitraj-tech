export type ContactMethod = "email" | "whatsapp" | "booking";

/** A navigation to a contact channel is not a completed enquiry or booking. */
export function getContactMethod(href: string): ContactMethod | undefined {
  if (/^mailto:/i.test(href)) return "email";

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
