import React from "react";
import { fireEvent, render, cleanup } from "@testing-library/react";

jest.mock("next/script", () => ({ __esModule: true, default: () => null }));
jest.mock("../CookieConsent", () => ({
  __esModule: true, default: () => null, CONSENT_KEY: "rr-consent", CONSENT_REGIONS: [],
}));
jest.mock("@/lib/contact-tracking", () => ({
  ...jest.requireActual("@/lib/contact-tracking"),
  getTrackingIds: () => ({ gaId: "G-TEST123", adsId: "AW-123456789", tagId: "G-TEST123" }),
}));

import Analytics from "../Analytics";

afterEach(() => { cleanup(); delete window.gtag; });

it("records a WhatsApp click without reporting a completed lead or Ads conversion", () => {
  window.gtag = jest.fn();
  const { getByText } = render(<><Analytics /><a href="https://wa.me/911234567890"><span>Contact</span></a></>);
  getByText("Contact").closest("a")!.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(getByText("Contact"));
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.gtag).toHaveBeenCalledWith("event", "contact_click", { contact_method: "whatsapp", page_path: "/" });
  const calls = (window.gtag as jest.Mock).mock.calls;
  expect(calls.some((call) => ["conversion", "generate_lead"].includes(call[1]))).toBe(false);
});

it("does not send email addresses or query strings in contact-click parameters", () => {
  window.gtag = jest.fn();
  const { getByText } = render(<><Analytics /><a href="mailto:private@example.com?subject=Confidential">Email</a></>);
  getByText("Email").addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(getByText("Email"));
  expect(window.gtag).toHaveBeenCalledWith("event", "contact_click", { contact_method: "email", page_path: "/" });
});
