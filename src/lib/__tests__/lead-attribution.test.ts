import { captureVisit, classifyVisit, clearVisit, CONSENT_KEY, readVisit, VISIT_KEY, VISIT_CONSENT_KEY } from "../lead-attribution";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
const now = 1_800_000_000_000;

it("separates search, tagged campaigns, paid clicks and missing evidence", () => {
  expect(classifyVisit("https://rohitraj.tech/notes/rag-for-sql", "https://www.google.com/search?q=private", now).source).toBe("google_search");
  expect(classifyVisit("https://rohitraj.tech/?gclid=private", "https://google.com", now).source).toBe("paid");
  expect(classifyVisit("https://rohitraj.tech/?utm_campaign=private", "https://google.com", now).source).toBe("campaign");
  expect(classifyVisit("https://rohitraj.tech/", "", now).source).toBe("direct_or_unknown");
  expect(classifyVisit("https://rohitraj.tech/", "https://google.com.evil.test", now).source).toBe("referral");
  expect(classifyVisit("https://rohitraj.tech/contact", "https://rohitraj.tech/notes", now).source).toBe("direct_or_unknown");
});

it("does not retain referrer queries, campaign values, fragments or identifiers", () => {
  const visit = classifyVisit("https://rohitraj.tech/notes/rag-for-sql?utm_campaign=secret#email=secret", "https://example.com/private?email=secret", now);
  expect(visit).toEqual({ landingPath: "/notes/rag-for-sql", source: "campaign", capturedAt: now });
  expect(JSON.stringify(visit)).not.toContain("secret");
});

it("never stores or returns attribution without affirmative consent", () => {
  captureVisit("https://rohitraj.tech/", "https://google.com", now);
  expect(sessionStorage.getItem(VISIT_KEY)).toBeNull();
  localStorage.setItem(CONSENT_KEY, "granted");
  localStorage.setItem(VISIT_CONSENT_KEY, "granted");
  captureVisit("https://rohitraj.tech/notes/rag-for-sql", "https://google.com", now);
  expect(readVisit(now)?.source).toBe("google_search");
  localStorage.setItem(CONSENT_KEY, "denied");
  expect(readVisit(now)).toBeUndefined();
  expect(sessionStorage.getItem(VISIT_KEY)).toBeNull();
});

it("preserves the first landing during the tab visit and expires it", () => {
  localStorage.setItem(CONSENT_KEY, "granted");
  localStorage.setItem(VISIT_CONSENT_KEY, "granted");
  captureVisit("https://rohitraj.tech/notes/rag-for-sql", "https://google.com", now);
  captureVisit("https://rohitraj.tech/contact", "https://rohitraj.tech/notes/rag-for-sql", now + 100);
  expect(readVisit(now + 200)?.landingPath).toBe("/notes/rag-for-sql");
  expect(readVisit(now + 30 * 60 * 1000)).toBeUndefined();
});

it("tolerates blocked, corrupt or future-dated storage without breaking forms", () => {
  localStorage.setItem(CONSENT_KEY, "granted");
  localStorage.setItem(VISIT_CONSENT_KEY, "granted");
  sessionStorage.setItem(VISIT_KEY, "broken");
  expect(readVisit(now)).toBeUndefined();
  sessionStorage.setItem(VISIT_KEY, JSON.stringify(classifyVisit("https://rohitraj.tech/", "", now + 1)));
  expect(readVisit(now)).toBeUndefined();
  const blocked = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  expect(() => captureVisit("https://rohitraj.tech/", "", now)).not.toThrow();
  expect(readVisit(now)).toBeUndefined();
  expect(() => clearVisit()).not.toThrow();
  blocked.mockRestore();
});

it("does not reuse old analytics consent for newly introduced visit attribution", () => {
  localStorage.setItem(CONSENT_KEY, "granted");
  captureVisit("https://rohitraj.tech/", "https://google.com", now);
  expect(sessionStorage.getItem(VISIT_KEY)).toBeNull();
});
