/** @jest-environment node */
import { getContactMethod, getTrackingIds } from "@/lib/contact-tracking";

describe("Contact attribution", () => {
  it("recognizes real contact channels without treating unrelated links as enquiries", () => {
    expect(getContactMethod("mailto:hello@example.com?subject=Private%20details")).toBe("email");
    expect(getContactMethod("https://wa.me/911234567890")).toBe("whatsapp");
    expect(getContactMethod("tel:+918130313297")).toBe("phone");
    expect(getContactMethod("https://calendly.com/example")).toBe("booking");
    expect(getContactMethod("https://calendly.com.evil.example/example")).toBeUndefined();
    expect(getContactMethod("https://example.com")).toBeUndefined();
    expect(getContactMethod("/contact")).toBeUndefined();
  });

  it("loads the Ads tag even if the optional GA4 variable is empty", () => {
    expect(getTrackingIds("  ", " AW-123456789 ")).toEqual({
      gaId: undefined, adsId: "AW-123456789", tagId: "AW-123456789",
    });
    expect(getTrackingIds().tagId).toBeUndefined();
    expect(() => getTrackingIds("not-a-measurement-id")).toThrow();
    expect(() => getTrackingIds(undefined, "123-456-7890")).toThrow();
  });

});
