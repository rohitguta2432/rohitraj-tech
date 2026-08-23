import Link from "next/link";
import type { HomeDictionary, Locale } from "@/lib/i18n";
import { projects } from "@/data/projects";
import { agents } from "@/data/agents";

interface HeroProps {
    dict: HomeDictionary;
    locale: Locale;
}

/**
 * Hero.
 *
 * Three things were wrong with the previous version and all three were structural,
 * not cosmetic:
 *
 * 1. A `<p>` rendered above the `<h1>` and restated it, so the reading order was
 *    small paragraph → giant headline saying the same thing.
 * 2. The right third was a 320px decorative PNG of generic "AI architecture" nodes.
 *    It occupied the most valuable space on the page and communicated nothing.
 * 3. Three CTAs, two of which were navigation, competing with the one that matters.
 *
 * The PNG is replaced by the only visual this page has actually earned: a count of
 * shipped work, derived from the same data that renders the index below, so the
 * number can never drift from the list that backs it up.
 */
export default function Hero({ dict, locale }: HeroProps) {
    const bookCallCta = dict.hero.bookCallCta ?? "Book free 30-min call";
    const trustPills = dict.hero.trustPills ?? [
        "Senior engineer · GitHub from day one",
        "You own the code",
        "Daily Slack / WhatsApp access",
        "First production commit in 5 days",
    ];

    const documented = projects.length + agents.length;

    return (
        <section className="hero">
            <div className="container hero-grid">
                <div className="hero-lede">
                    <h1 className="hero-title">
                        {dict.hero.titleLine1}
                    </h1>
                    <p className="hero-deck">{dict.hero.titleLine2}</p>

                    <div className="hero-actions">
                        <Link href={`/${locale}/contact`} className="btn btn-primary">
                            {bookCallCta}
                        </Link>
                        <Link href={`/${locale}#work`} className="hero-alt">
                            See the shipped work <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <ul className="hero-trust-pills" aria-label="Trust signals">
                        {trustPills.map((pill) => (
                            <li key={pill} className="hero-trust-pill">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                                <span>{pill}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="hero-ledger" aria-label="Shipped work at a glance">
                    <dl className="hero-ledger-list">
                        <div className="hero-ledger-row">
                            <dt>Products shipped</dt>
                            <dd>{projects.length}</dd>
                        </div>
                        <div className="hero-ledger-row">
                            <dt>Autonomous agents</dt>
                            <dd>{agents.length}</dd>
                        </div>
                        <div className="hero-ledger-row">
                            <dt>Publicly documented</dt>
                            <dd>{documented}</dd>
                        </div>
                        <div className="hero-ledger-row">
                            <dt>Weeks to production</dt>
                            <dd>6</dd>
                        </div>
                    </dl>
                    <p className="hero-ledger-foot">
                        Every line below links to a live URL or a public repo.
                    </p>
                </aside>
            </div>
        </section>
    );
}
