import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface AuthorBioProps {
    locale: Locale;
}

export default function AuthorBio({ locale }: AuthorBioProps) {
    return (
        <aside
            aria-label="About the author"
            style={{
                marginTop: "3rem",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.5rem",
            }}
        >
            <div style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.35rem" }}>
                Rohit Raj — AI Consultant · Forward Deployed Engineer
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 0.75rem" }}>
                I embed with teams and ship AI to production: agents, MCP integrations, and LLM
                features — with evals proving they work. Fractional retainer or fixed-scope pilot.
            </p>
            <Link
                href={`/${locale}/hire`}
                style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
            >
                Work with me &rarr;
            </Link>
        </aside>
    );
}
