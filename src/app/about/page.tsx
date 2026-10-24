import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { burstRays } from "@/components/brand/burst";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo-config";
import { projects } from "@/data/projects";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return createPageMetadata(
        dict.meta.about.title,
        dict.meta.about.description,
        '/about',
        { ownCard: true }
    );
}

// A machine-readable zone line: 44 characters, padded with filler chevrons.
const mrz = (text: string) => text.padEnd(44, "<").slice(0, 44);

/**
 * The about page as the passport that goes with the departures-board logo.
 *
 * The first spread is the data page (photo under a holographic film, the
 * fields, a signature and the machine-readable zone) facing the holder's
 * statement. The second spread stamps the numbers in as visas and keeps the
 * longer story as observations. The closing ask is a boarding pass from BLR
 * to the visitor's team. Every field states a fact the site already makes.
 */
export default async function AboutPage() {
    const dict = await getDictionary();
    const about = dict.pages.about;

    const shippedCount = projects.length;
    const activeCount = projects.filter(p => p.status === 'active').length;
    // The page's watermark is the proof mark: one ray per product.
    const rays = burstRays(projects.map((p) => p.techStack.length));

    const stamps = [
        { shape: 'round', value: '10+', top: 'Years', bottom: 'Shipping production', href: null },
        { shape: 'rect', value: `${shippedCount}+`, top: 'Systems', bottom: 'Built and shipped', href: `/projects` },
        { shape: 'oval', value: `${activeCount}`, top: 'Active', bottom: 'Still running', href: `/projects` },
        { shape: 'wide', value: 'Worldwide', top: 'Admitted', bottom: 'India · clients globally', href: null },
    ];

    const observations = [
        { title: 'What I build', body: about.bio2 },
        { title: 'How I got here', body: about.bio3 },
        { title: 'Why this site exists', body: about.bio4 },
    ].filter((o) => o.body);

    const stack = [
        {
            group: 'Backend & Infra',
            items: ['Spring Boot 3.x', 'Java 21', 'Kafka', 'PostgreSQL 16', 'Redis 7', 'Docker', 'Flyway'],
        },
        {
            group: 'Mobile & Frontend',
            items: ['React Native + Expo', 'Kotlin', 'Jetpack Compose', 'Next.js 16', 'TypeScript', 'Tailwind 4'],
        },
        {
            group: 'AI & Data',
            items: ['Spring AI', 'OpenAI', 'AWS Bedrock', 'Gemma 4', 'LiteRT', 'RAG + pgvector', 'LLM orchestration'],
        },
    ];

    const socials = [
        { label: 'GitHub', href: 'https://github.com/rohitguta2432' },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/rohitraj2482' },
        { label: 'X', href: 'https://x.com/rohitraj2482' },
        { label: 'Email', href: 'mailto:rohitgupta2432@gmail.com' },
    ];

    return (
        <>
            <Header dict={dict.common} />
            <main id="main" className="passport">
                <section className="pp-spread" aria-labelledby="pp-name">
                    <div className="container">
                        <div className="pp-book">
                            <article className="pp-page pp-data">
                                <svg className="pp-watermark" viewBox="-160 -160 320 320" aria-hidden="true">
                                    {rays.map((r, i) => (
                                        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
                                    ))}
                                    <circle r="26" />
                                </svg>

                                <p className="pp-data-head">
                                    <span>Engineer&apos;s passport</span>
                                    <span lang="hi">पासपोर्ट</span>
                                    <span>Type P · BLR</span>
                                </p>

                                <div className="pp-data-body">
                                    <figure className="pp-photo">
                                        <Image
                                            src="/images/rohit-passport.jpg"
                                            alt="Rohit Raj"
                                            width={304}
                                            height={380}
                                            sizes="(min-width: 900px) 180px, 136px"
                                            priority
                                        />
                                        <span className="pp-film holo" aria-hidden="true" />
                                    </figure>

                                    <dl className="pp-fields">
                                        <div className="pp-field">
                                            <dt><span lang="hi">नाम</span> / Name</dt>
                                            <dd><h1 id="pp-name" className="pp-name">Rohit Raj</h1></dd>
                                        </div>
                                        <div className="pp-field">
                                            <dt><span lang="hi">व्यवसाय</span> / Profession</dt>
                                            <dd>Forward Deployed Engineer · AI Consultant</dd>
                                        </div>
                                        <div className="pp-field pp-field-half">
                                            <dt><span lang="hi">स्थान</span> / Based in</dt>
                                            <dd>Bengaluru, India</dd>
                                        </div>
                                        <div className="pp-field pp-field-half">
                                            <dt><span lang="hi">अनुभव</span> / In production</dt>
                                            <dd>10+ years</dd>
                                        </div>
                                        <div className="pp-field">
                                            <dt><span lang="hi">वैधता</span> / Valid for</dt>
                                            <dd>Remote · on-site · worldwide</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="pp-sign">
                                    <Image className="pp-ghost" src="/images/rohit-passport.jpg" alt="" width={304} height={380} sizes="56px" aria-hidden="true" />
                                    <div>
                                        <span className="pp-label">Holder&apos;s signature</span>
                                        {/* The same hand that signs the terms sheet on the home page. */}
                                        <svg className="pp-signature" viewBox="0 0 176 60" aria-hidden="true">
                                            <path
                                                pathLength={1}
                                                d="M4 46 C 14 10, 30 6, 26 34 C 24 50, 10 52, 14 38 C 20 22, 40 28, 44 40 C 48 52, 56 30, 62 26 C 68 22, 66 44, 72 42 C 80 40, 82 18, 90 20 C 98 22, 92 46, 100 44 C 108 42, 112 28, 120 30 C 128 32, 124 46, 134 44 C 146 42, 156 38, 172 34"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <p className="pp-mrz" aria-hidden="true">
                                    <span>{mrz("P<BLRRAJ<<ROHIT")}</span>
                                    <span>{mrz(`FDE${String(shippedCount).padStart(3, "0")}<<AI<CONSULTANT<<SHIPS<TO<PROD`)}</span>
                                </p>
                            </article>

                            <div className="pp-page pp-facing">
                                <p className="pp-label">Holder&apos;s statement · <span lang="hi">वक्तव्य</span></p>
                                <p className="pp-lead">{about.bio1}</p>
                                <div className="pp-actions">
                                    <Link href={`/contact`} className="btn btn-primary">Start a project</Link>
                                    <Link href={`/projects`} className="btn btn-secondary">See current work</Link>
                                </div>
                                <ul className="pp-socials">
                                    {socials.map(s => (
                                        <li key={s.label}>
                                            <a href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{s.label}</a>
                                        </li>
                                    ))}
                                </ul>
                                <span className="pp-folio" aria-hidden="true">02</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pp-spread" aria-labelledby="pp-visas-title">
                    <div className="container">
                        <div className="pp-book">
                            <div className="pp-page pp-visas">
                                <p className="pp-label">Visas · <span lang="hi">वीज़ा</span></p>
                                <h2 id="pp-visas-title" className="pp-page-title">Stamped so far</h2>
                                <Reveal className="pp-stamps" move="stamp" items=".pp-stamp">
                                    {stamps.map((s) => {
                                        const inner = (
                                            <>
                                                <span className="pp-stamp-top">{s.top}</span>
                                                <span className="pp-stamp-value">{s.value}</span>
                                                <span className="pp-stamp-bottom">{s.bottom}</span>
                                            </>
                                        );
                                        const className = `pp-stamp pp-stamp-${s.shape}`;
                                        return s.href ? (
                                            <Link key={s.top} href={s.href} className={className}>{inner}</Link>
                                        ) : (
                                            <div key={s.top} className={className}>{inner}</div>
                                        );
                                    })}
                                </Reveal>
                                <span className="pp-folio" aria-hidden="true">03</span>
                            </div>

                            <div className="pp-page pp-observations">
                                <p className="pp-label">Observations · <span lang="hi">टिप्पणियाँ</span></p>
                                <ol className="pp-notes">
                                    {observations.map((o) => (
                                        <li key={o.title}>
                                            <h2 className="pp-note-title">{o.title}</h2>
                                            <p>{o.body}</p>
                                        </li>
                                    ))}
                                </ol>
                                <span className="pp-folio" aria-hidden="true">04</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pp-declared" aria-labelledby="pp-declared-title">
                    <div className="container">
                        <Reveal className="pp-declared-head" move="rise">
                            <p className="pp-label">Declared · <span lang="hi">घोषित</span></p>
                            <h2 id="pp-declared-title" className="pp-page-title">The stack I ship with</h2>
                            <p className="pp-declared-sub">Production-grade tools, picked per project. No framework-of-the-week churn.</p>
                        </Reveal>
                        <Reveal as="dl" className="pp-declared-list" move="rows" items=".pp-declared-row">
                            {stack.map(g => (
                                <div key={g.group} className="pp-declared-row">
                                    <dt>{g.group}</dt>
                                    <dd>
                                        {g.items.map((item) => (
                                            <span key={item}>{item}</span>
                                        ))}
                                    </dd>
                                </div>
                            ))}
                        </Reveal>
                    </div>
                </section>

                <section className="pp-boarding-section" aria-labelledby="pp-boarding-title">
                    <div className="container">
                        <Reveal className="boarding" move="lay">
                            <div className="boarding-main">
                                <p className="boarding-kicker">
                                    <span>Boarding pass</span>
                                    <span>Flight RR {String(shippedCount).padStart(3, "0")}</span>
                                </p>
                                <p className="boarding-route" aria-label="From Bengaluru to your team">
                                    <span>BLR</span>
                                    <svg viewBox="0 0 48 24" aria-hidden="true"><path d="M2 12h40M34 4l8 8-8 8" /></svg>
                                    <span>YOU</span>
                                </p>
                                <h2 id="pp-boarding-title" className="boarding-title">Stuck between demo and production?</h2>
                                <p className="boarding-body">Most AI products stall there. If you&apos;re trying to cross that gap, I&apos;d like to hear about it.</p>
                                <dl className="boarding-fields">
                                    <div><dt>Gate</dt><dd>Your Slack</dd></div>
                                    <div><dt>Seat</dt><dd>Embedded</dd></div>
                                    <div><dt>Boards</dt><dd>Day one</dd></div>
                                </dl>
                                <div className="pp-actions">
                                    <Link href={`/contact`} className="btn btn-primary">Book a call</Link>
                                    <Link href={`/services`} className="btn btn-secondary">See services</Link>
                                </div>
                            </div>
                            <div className="boarding-stub" aria-hidden="true">
                                <span className="boarding-stub-route">BLR → YOU</span>
                                <span className="boarding-barcode" />
                                <span className="boarding-stub-foot">Admit one · RR {String(shippedCount).padStart(3, "0")}</span>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
