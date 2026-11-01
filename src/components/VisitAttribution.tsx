"use client";

import { useEffect } from "react";
import { captureVisit, clearVisit, CONSENT_EVENT } from "@/lib/lead-attribution";

export default function VisitAttribution() {
  useEffect(() => {
    const entryUrl = window.location.href;
    const entryReferrer = document.referrer;
    const capture = () => captureVisit(entryUrl, entryReferrer);
    const onChoice = (event: Event) => {
      if ((event as CustomEvent).detail === "granted") capture();
      else clearVisit();
    };
    capture();
    window.addEventListener(CONSENT_EVENT, onChoice);
    return () => window.removeEventListener(CONSENT_EVENT, onChoice);
  }, []);
  return null;
}
