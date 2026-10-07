"use client";

import { useRef, useState, type FormEvent } from "react";
import { trackConfirmedEnquiry } from "@/lib/contact-tracking";

export default function EnquiryForm({ sourcePath }: { sourcePath: string }) {
  const requestId = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "received">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "received") return;
    setError("");
    setStatus("sending");
    const fields = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId.current, name: fields.get("name"), email: fields.get("email"), message: fields.get("message"), website: fields.get("website"), sourcePath }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || result.receiptId !== requestId.current) {
        throw new Error(result.error || "Your enquiry could not be sent. Please try again or contact me directly.");
      }
      setStatus("received");
      try { trackConfirmedEnquiry(result.receiptId, sourcePath); } catch { /* A blocked analytics request must not undo a received enquiry. */ }
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Please try again or contact me directly.");
      setStatus("idle");
    }
  }

  return (
    <section id="enquiry" className="enquiry-card" aria-labelledby="enquiry-title">
      <h2 id="enquiry-title">Tell me what you’re building</h2>
      <p>Share the problem, your timeline, and what you need help with. I’ll reply to your email.</p>
      {status === "received" ? (
        <div className="enquiry-success" role="status">
          <h3>Your enquiry has been received.</h3>
          <p>Thanks for the brief. I’ll get back to you by email. If you’d rather talk now, <a href="tel:+918130313297">call me</a> or <a href="https://wa.me/918130313297" target="_blank" rel="noopener noreferrer">message me on WhatsApp</a>.</p>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={status === "sending"}>
          <div className="enquiry-field-row">
            <label htmlFor="enquiry-name">Your name<input id="enquiry-name" name="name" autoComplete="name" minLength={2} maxLength={120} required disabled={status === "sending"} /></label>
            <label htmlFor="enquiry-email">Email<input id="enquiry-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={status === "sending"} /></label>
          </div>
          <label htmlFor="enquiry-message">What do you need help with?<textarea id="enquiry-message" name="message" rows={4} minLength={10} maxLength={2000} placeholder="For example: an AI agent for our support team, with a first pilot this month." required disabled={status === "sending"} /></label>
          <div className="enquiry-honeypot" aria-hidden="true"><label htmlFor="enquiry-website">Website<input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="enquiry-privacy">Your details are used only to respond to this enquiry.</p>
          {error && <p className="enquiry-error" role="alert">{error} You can also <a href="mailto:rohitgupta2432@gmail.com">email me directly</a>.</p>}
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send project brief"}</button>
        </form>
      )}
    </section>
  );
}
