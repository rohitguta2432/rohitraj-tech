"use client";

import { useEffect, useState } from "react";

// Google Consent Mode v2. Analytics.tsx sets the defaults: denied in the
// regions below (Google geolocates the visitor), granted everywhere else.
// This banner records the visitor's choice and pushes it as a consent update.
export const CONSENT_KEY = "rr-consent";
const OPEN_EVENT = "rr-open-cookie-settings";

// EEA + UK + Switzerland: where Google Ads requires consent for ad cookies.
export const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "GB", "CH",
];

type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

// The client can't see the visitor's country, so the timezone decides who is
// asked. Misses fail safe: a European on a non-European clock gets Google's
// regional "denied" default and no banner, i.e. no ad cookies.
function inConsentRegion(): boolean {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  return tz.startsWith("Europe/") || /^Atlantic\/(Reykjavik|Canary|Madeira|Azores)$/.test(tz);
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    // Deferred a frame so the check runs after hydration without a
    // synchronous state update in the effect body.
    const frame = requestAnimationFrame(() => {
      if (!readChoice() && inConsentRegion()) show();
    });
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, []);

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // Storage blocked: the choice still applies for this page view.
    }
    window.gtag?.("consent", "update", {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <section className="consent" role="dialog" aria-labelledby="consent-title" aria-live="polite">
      <p id="consent-title" className="consent-label">Cookies</p>
      <p className="consent-text">
        Google Analytics and Google Ads cookies tell me which pages and ads bring people here.
        Nothing loads that tracks you until you say yes.
      </p>
      <div className="consent-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => choose("denied")}>
          Reject
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => choose("granted")}>
          Accept
        </button>
      </div>
    </section>
  );
}

// Footer link so a visitor can change their mind later (GDPR: withdrawing
// consent must be as easy as giving it). Hidden when no tags are configured.
export function CookieSettingsLink() {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) return null;
  return (
    <button
      type="button"
      className="footer-link consent-settings"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      Cookie settings
    </button>
  );
}
