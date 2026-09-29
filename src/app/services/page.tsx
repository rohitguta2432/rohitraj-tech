import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/services";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata, generateBreadcrumbSchema, SITE_CONFIG } from "@/lib/seo-config";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    return createPageMetadata(
        "AI Consulting and Engineering Services",
        "Explore AI consulting, fractional engineering, MCP integration, Claude Code training and MVP sprints. Work directly with a senior engineer who ships.",
        "/services"
            );
}

export default async function ServicesPage() {
    const dict = await getDictionary();

    const servicesListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Engineering Services by Rohit Raj',
        url: `${SITE_CONFIG.url}/services`,
        itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Service',
                name: service.title,
                description: service.subheadline,
                url: `${SITE_CONFIG.url}/services/${service.slug}`,
            },
        })),
    };

    const breadcrumb = generateBreadcrumbSchema([
        { name: 'Home', url: `${SITE_CONFIG.url}` },
        { name: 'Services', url: `${SITE_CONFIG.url}/services` },
    ]);

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(servicesListSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
            <Header dict={dict.common} />
            <main id="main">
                <div className="page-header">
                    <div className="container">
                        <h1 className="page-title">Services</h1>
                        <p className="page-description">
                            AI shipped to production by an embedded forward deployed engineer, plus founding-engineer sprints for pre-seed startups. Pick what you need, or let&apos;s scope something custom.
                        </p>
                    </div>
                </div>

                <section>
                    <div className="container">
                        {/* How AI engagements chain together */}
                        <ol
                            aria-label="How I work with engineering teams"
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: "0 0 2rem",
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "0.75rem",
                            }}
                        >
                            {[
                                { step: "1", title: "Foundations", text: "Train the team: specs, models, effort, context files.", href: "/services/ai-engineering-foundations" },
                                { step: "2", title: "Measure & roll out", text: "Tool setup, guardrails and a productivity baseline.", href: "/services/claude-code-consultant" },
                                { step: "3", title: "Build", text: "AI systems shipped inside your product.", href: "/services/fractional-ai-engineer" },
                            ].map((s) => (
                                <li key={s.step}>
                                    <Link
                                        href={s.href}
                                        style={{
                                            display: "flex",
                                            gap: "0.75rem",
                                            alignItems: "flex-start",
                                            height: "100%",
                                            background: "var(--card-bg)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "12px",
                                            padding: "1rem 1.25rem",
                                            textDecoration: "none",
                                        }}
                                    >
                                        <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.2 }}>{s.step}</span>
                                        <span>
                                            <span style={{ display: "block", color: "var(--text-primary)", fontWeight: 600 }}>{s.title} &rarr;</span>
                                            <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>{s.text}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {services.map((service) => (
                                <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    style={{
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "12px",
                                        padding: "1.75rem",
                                        textDecoration: "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                        transition: "border-color 0.2s, transform 0.2s",
                                    }}
                                >
                                    <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
                                        {service.title}
                                    </h2>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0, flex: 1 }}>
                                        {service.subheadline}
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                {service.timeline}
                                            </span>
                                            <span style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 500 }}>
                                                Learn more &rarr;
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                color: "var(--text-tertiary, var(--text-secondary))",
                                                fontSize: "0.72rem",
                                                opacity: 0.75,
                                                letterSpacing: "0.02em",
                                            }}
                                        >
                                            Senior engineer &middot; Fast launch &middot; Full GitHub
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
