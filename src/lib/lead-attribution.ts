import { z } from "zod";

export const CONSENT_KEY = "rr-consent";
export const CONSENT_EVENT = "rr-consent-change";
export const VISIT_CONSENT_KEY = "rr-visit-consent-v1";
export const VISIT_KEY = "rr-enquiry-visit";
const MAX_AGE_MS = 30 * 60 * 1000;
export const discoverySources = ["google", "other_search", "linkedin", "github", "referral", "other"] as const;
export const visitSources = ["google_search", "bing_search", "other_search", "social", "github", "referral", "paid", "campaign", "direct_or_unknown"] as const;
export const visitSchema = z.object({
  landingPath: z.string().max(250).regex(/^\/[a-zA-Z0-9/_-]*$/),
  source: z.enum(visitSources),
  capturedAt: z.number().int().nonnegative(),
});
export type VisitAttribution = z.infer<typeof visitSchema>;

/** A coarse browser hint, never proof of SEO attribution. No query values leave the browser. */
export function classifyVisit(href: string, referrer: string, now = Date.now()): VisitAttribution {
  const url = new URL(href);
  let source: VisitAttribution["source"] = "direct_or_unknown";
  const medium = (url.searchParams.get("utm_medium") ?? "").toLowerCase();
  if (["gclid", "dclid", "msclkid", "gbraid", "wbraid"].some(key => url.searchParams.has(key)) || /^(cpc|ppc|paid|paid_social|display|cpm)$/.test(medium)) {
    source = "paid";
  } else if (["utm_source", "utm_medium", "utm_campaign"].some(key => url.searchParams.has(key))) {
    source = "campaign";
  } else {
    try {
      const ref = new URL(referrer);
      const host = ref.hostname.toLowerCase();
      const is = (domain: string) => host === domain || host.endsWith(`.${domain}`);
      if (ref.origin !== url.origin) {
        if (/^(www\.)?google\.(com|co\.in|co\.uk|de|fr|ca|com\.au)$/.test(host)) source = "google_search";
        else if (is("bing.com")) source = "bing_search";
        else if (is("duckduckgo.com") || is("search.yahoo.com")) source = "other_search";
        else if (["linkedin.com", "x.com", "t.co", "facebook.com", "instagram.com", "reddit.com"].some(is)) source = "social";
        else if (is("github.com")) source = "github";
        else source = "referral";
      }
    } catch { /* Empty or unavailable referrer remains unknown. */ }
  }
  const landingPath = /^\/[a-zA-Z0-9/_-]{0,249}$/.test(url.pathname) ? url.pathname : "/";
  return { landingPath, source, capturedAt: now };
}

export function clearVisit() {
  try { sessionStorage.removeItem(VISIT_KEY); } catch { /* Storage can be blocked. */ }
}

export function readVisit(now = Date.now()): VisitAttribution | undefined {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "granted" || localStorage.getItem(VISIT_CONSENT_KEY) !== "granted") { clearVisit(); return; }
    const parsed = visitSchema.safeParse(JSON.parse(sessionStorage.getItem(VISIT_KEY) ?? "null"));
    if (parsed.success && now >= parsed.data.capturedAt && now - parsed.data.capturedAt < MAX_AGE_MS) return parsed.data;
    clearVisit();
  } catch { clearVisit(); }
}

export function captureVisit(href: string, referrer: string, now = Date.now()) {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "granted" || localStorage.getItem(VISIT_CONSENT_KEY) !== "granted") { clearVisit(); return; }
    if (!readVisit(now)) sessionStorage.setItem(VISIT_KEY, JSON.stringify(classifyVisit(href, referrer, now)));
  } catch { /* Attribution must never block navigation or an enquiry. */ }
}
