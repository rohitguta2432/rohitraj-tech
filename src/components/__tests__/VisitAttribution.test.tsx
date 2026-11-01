import { fireEvent, render, screen } from "@testing-library/react";
import CookieConsent from "../CookieConsent";
import VisitAttribution from "../VisitAttribution";
import { CONSENT_KEY, VISIT_CONSENT_KEY, readVisit } from "@/lib/lead-attribution";

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  window.history.replaceState({}, "", "/notes/rag-for-sql?utm_campaign=private");
  window.gtag = jest.fn();
});

it("captures the original landing after explicit consent, then clears it on rejection", () => {
  localStorage.setItem(CONSENT_KEY, "granted"); // Old consent cannot enable attribution.
  render(<><VisitAttribution /><CookieConsent /></>);
  expect(readVisit()).toBeUndefined();
  window.history.replaceState({}, "", "/contact");
  fireEvent(window, new Event("rr-open-cookie-settings"));
  expect(screen.getByText(/remember your landing page/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Accept", exact: true }));
  expect(localStorage.getItem(VISIT_CONSENT_KEY)).toBe("granted");
  expect(readVisit()).toMatchObject({ landingPath: "/notes/rag-for-sql", source: "campaign" });
  expect(JSON.stringify(readVisit())).not.toContain("private");
  fireEvent(window, new Event("rr-open-cookie-settings"));
  fireEvent.click(screen.getByRole("button", { name: "Reject", exact: true }));
  expect(readVisit()).toBeUndefined();
});
