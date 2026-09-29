"use client";

import Script from "next/script";
import { useEffect } from "react";
import CookieConsent, { CONSENT_KEY, CONSENT_REGIONS } from "./CookieConsent";
import { getContactMethod, getTrackingIds } from "@/lib/contact-tracking";

// GA4 + Google Ads via a single gtag.js load. IDs come from build-time env
// vars; with none set this renders nothing, so local dev and forks stay clean.
const { gaId: GA_ID, adsId: ADS_ID, tagId } = getTrackingIds(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  useEffect(() => {
    if (!tagId) return;

    // One delegated listener covers every contact link on every page,
    // including ones rendered from src/data.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link || !window.gtag) return;
      const href = link.getAttribute("href") ?? "";
      const method = getContactMethod(href);
      if (!method) return;

      // Opening an email composer, WhatsApp or a booking page cannot prove
      // that an enquiry or booking was actually received.
      window.gtag("event", "contact_click", {
        contact_method: method,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!tagId) return null;

  const configs = [GA_ID, ADS_ID]
    .filter(Boolean)
    .map((id) => `gtag('config', '${id}');`)
    .join("\n");

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`} strategy="afterInteractive" />
      {/* Consent defaults must precede config: denied in CONSENT_REGIONS,
          granted elsewhere, then any stored choice from the banner. */}
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var denied = {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'};
gtag('consent', 'default', Object.assign({region: ${JSON.stringify(CONSENT_REGIONS)}}, denied));
gtag('consent', 'default', {ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
gtag('set', 'ads_data_redaction', true);
try {
  var c = localStorage.getItem('${CONSENT_KEY}');
  if (c === 'granted' || c === 'denied') gtag('consent', 'update', {ad_storage:c,ad_user_data:c,ad_personalization:c,analytics_storage:c});
} catch (e) {}
gtag('js', new Date());
${configs}`}
      </Script>
      <CookieConsent />
    </>
  );
}
