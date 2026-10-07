import Link from "next/link";

export default function ContactActions({ enquiryHref = "/contact#enquiry", poster = false }: { enquiryHref?: string; poster?: boolean }) {
  return (
    <div className={`contact-actions${poster ? " contact-actions-poster" : ""}`} aria-label="Contact Rohit">
      <a href="tel:+918130313297" className="btn btn-primary">Call Rohit</a>
      <a href="https://wa.me/918130313297" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">WhatsApp Rohit</a>
      <Link href={enquiryHref} className="contact-brief-link">Send a project brief <span aria-hidden="true">→</span></Link>
    </div>
  );
}
