import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EnquiryForm from "../EnquiryForm";

const receiptId = "d9a494e4-b663-42d2-9a60-f62727096535";
const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  Object.defineProperty(global.crypto, "randomUUID", { configurable: true, value: () => receiptId });
  window.gtag = jest.fn();
});

function fill() {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "A founder" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "founder@example.com" } });
  fireEvent.change(screen.getByLabelText("What do you need help with?"), { target: { value: "Build an AI support agent." } });
}

it("waits for a confirmed server receipt before counting a lead, without sending personal details to Google", async () => {
  let resolve!: (value: unknown) => void;
  fetchMock.mockReturnValue(new Promise(done => { resolve = done; }));
  render(<EnquiryForm sourcePath="/contact" />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
  expect(window.gtag).not.toHaveBeenCalled();
  resolve({ ok: true, json: async () => ({ success: true, receiptId }) });
  await screen.findByText("Your enquiry has been received.");
  expect(window.gtag).toHaveBeenCalledWith("event", "generate_lead", { lead_source: "website_enquiry", page_path: "/contact" });
  expect(JSON.stringify((window.gtag as jest.Mock).mock.calls)).not.toContain("founder@example.com");
});

it("shows a retry on failure, reuses the receipt, and records no conversion for failed requests", async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ success: false, error: "Temporarily unavailable." }) });
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, receiptId }) });
  render(<EnquiryForm sourcePath="/contact" />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
  await screen.findByRole("alert");
  expect(window.gtag).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
  await screen.findByText("Your enquiry has been received.");
  const ids = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).requestId);
  expect(ids).toEqual([receiptId, receiptId]);
  expect(window.gtag).toHaveBeenCalledTimes(1);
});

it("keeps the success message if analytics is blocked", async () => {
  window.gtag = jest.fn(() => { throw new Error("blocked"); });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, receiptId }) });
  render(<EnquiryForm sourcePath="/contact" />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  await screen.findByText("Your enquiry has been received.");
});
