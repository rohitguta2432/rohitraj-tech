import Link from "next/link";
import type { HomeDictionary, Locale } from "@/lib/i18n";
import { projects } from "@/data/projects";
import { agents } from "@/data/agents";

interface HeroProps {
    dict: HomeDictionary;
    locale: Locale;
}

/**
 * Hero — the "poster" direction, picked from four on a design canvas.
 *
 * One vermilion field, one enormous condensed headline, one button. The headline
 * answers the objection that actually blocks hiring a solo engineer ("can one person
 * really do all of it?"); the deck and the counters answer the second one ("can I
 * check any of this?") by pointing at repos rather than asking to be believed.
 *
 * Counters are derived from the project and agent data so a hand-typed number can
 * never drift out of agreement with the index below — which is exactly what had
 * happened before (copy claimed 29, data held 26).
 */
export default function Hero({ dict, locale }: HeroProps) {
    const bookCallCta = dict.hero.bookCallCta ?? "Book a free 30-min call";
    const documented = projects.length + agents.length;

    const counters = [
        { value: String(projects.length), label: "Products still running" },
        { value: String(agents.length), label: "Agents you can try" },
        { value: String(documented), label: "Repos you can read" },
        { value: "5", label: "Days to first commit" },
    ];

    return (
        <section className="poster">
            <div className="poster-orb" aria-hidden="true" />

            <div className="container poster-inner">
                <div className="poster-eyebrow">
                    <span>Rohit Raj</span>
                    <span>Founding engineer · India</span>
                </div>

                <div className="poster-body">
                    <h1 className="poster-title">
                        {dict.hero.titleLine1}
                        <br />
                        {dict.hero.titleLine2}
                    </h1>

                    <p className="poster-deck">{dict.hero.deck ?? dict.hero.subtitle}</p>

                    <div className="poster-actions">
                        <Link href={`/${locale}/contact`} className="poster-cta">
                            {bookCallCta}
                        </Link>
                        <Link href={`/${locale}#work`} className="poster-alt">
                            or see what shipped <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>

                <dl className="poster-counters">
                    {counters.map((c) => (
                        <div key={c.label} className="poster-counter">
                            <dt className="sr-only">{c.label}</dt>
                            <dd className="poster-counter-value">{c.value}</dd>
                            <dd className="poster-counter-label" aria-hidden="true">
                                {c.label}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
