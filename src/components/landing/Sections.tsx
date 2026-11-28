import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Motes } from "@/components/landing/HeroMagic";
import { agents } from "@/data/agents";
import { projects } from "@/data/projects";
import portrait from "../../../public/images/rohit.jpg";
import city from "../../../public/images/megacity/full-city.webp";

const shortName = (name: string) => name.split(/\s+—\s+/)[0];
const tagline = (name: string) => name.split(/\s+—\s+/).slice(1).join(" — ");

// The three things founders actually say, each landing on the service page that
// answers it. The detail lines keep the terms those pages are found by.
const ASKS = [
    {
        say: "Build my MVP.",
        href: "/services/6-week-mvp",
        detail: "Idea to a live product real users can sign up for.",
        link: "See the 6-week sprint",
    },
    {
        say: "Put AI in my product.",
        href: "/services/forward-deployed-engineer",
        detail: "Agents, MCP integrations and LLM features, built inside your codebase.",
        link: "Hire a forward deployed engineer",
    },
    {
        say: "Join my team.",
        href: "/services/fractional-ai-engineer",
        detail: "A freelance AI engineer in your Slack and your repo, two days a week.",
        link: "Freelance AI engineer",
    },
];

const ALSO = [
    { href: "/services/mcp-integration-consultant", label: "MCP integration consultant" },
    { href: "/notes/what-does-a-forward-deployed-engineer-do-2026", label: "What is a forward deployed engineer?" },
    { href: "/hire", label: "How an engagement runs" },
];

export function Asks() {
    return (
        <section className="nx-night nx-asks" id="founding-engineer-for-hire" aria-labelledby="nx-asks-h">
            <div className="container">
                <h2 id="nx-asks-h" className="nx-eyebrow nx-amber">
                    Founders usually say one of these
                </h2>
                <Reveal as="ul" className="nx-asks-list" move="rows" items=".nx-ask">
                    {ASKS.map((a) => (
                        <li key={a.href} className="nx-ask">
                            <Link href={a.href} className="nx-ask-hit">
                                <span className="nx-ask-say">&ldquo;{a.say}&rdquo;</span>
                                <span className="nx-ask-detail">
                                    {a.detail}{" "}
                                    <span className="nx-cyan">
                                        {a.link} <span aria-hidden="true">→</span>
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </Reveal>
                <p className="nx-asks-also">
                    {ALSO.map((l) => (
                        <Link key={l.href} href={l.href}>
                            {l.label}
                        </Link>
                    ))}
                </p>
            </div>
        </section>
    );
}

// Products that ship with a recorded demo carry a poster frame; those are the billboards.
const BILLBOARDS = projects.filter((p) => p.videoUrl && p.image);

function Billboard({ slug, name, image, hidden = false, i }: { slug: string; name: string; image: string; hidden?: boolean; i: number }) {
    return (
        <Link
            href={`/projects/${slug}`}
            className="nx-bill"
            data-tilt={i % 2 ? "r" : "l"}
            aria-hidden={hidden || undefined}
            tabIndex={hidden ? -1 : undefined}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={hidden ? "" : `${shortName(name)} running`} width={1440} height={810} loading="lazy" decoding="async" />
            <span className="nx-bill-name">{shortName(name)}</span>
            <span className="nx-bill-desc">{tagline(name)}</span>
        </Link>
    );
}

export function Billboards() {
    return (
        <section id="work" className="nx-bills" aria-labelledby="nx-bills-h">
            <div className="container nx-bills-head">
                <Reveal as="h2" id="nx-bills-h" className="nx-h2" move="rise">
                    {projects.length} still running.
                    <br />
                    Open any of them.
                </Reveal>
                <p>
                    {projects.length} products and {agents.length} autonomous agents. Every one has a live URL or an
                    open repo, so you can read my code before you ever email me.
                </p>
            </div>

            <div className="nx-bills-track">
                <div className="nx-bills-run">
                    {BILLBOARDS.map((p, i) => (
                        <Billboard key={p.slug} slug={p.slug} name={p.name} image={p.image!} i={i} />
                    ))}
                    {BILLBOARDS.map((p, i) => (
                        <Billboard key={`dup-${p.slug}`} slug={p.slug} name={p.name} image={p.image!} i={i} hidden />
                    ))}
                </div>
            </div>

            <div className="container">
                <nav className="nx-bills-all" aria-label="Every product and agent">
                    {projects.map((p) => (
                        <Link key={p.slug} href={`/projects/${p.slug}`}>
                            {shortName(p.name)}
                        </Link>
                    ))}
                    {agents.map((a) => (
                        <Link key={a.slug} href={a.detailPath ?? `/agents#${a.slug}`}>
                            {shortName(a.name)}
                        </Link>
                    ))}
                </nav>
                <div className="nx-bills-more">
                    <Link href="/projects">
                        Every project, in full <span aria-hidden="true">→</span>
                    </Link>
                    <Link href="/agents">
                        Run an agent in the browser <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

// Each promise is one the site already makes elsewhere, restated in one place.
const PROMISES = [
    "You own the code, the IP and the repo from week one.",
    "First production commit inside 5 days.",
    "Daily Slack or WhatsApp access.",
    "Agents, MCP servers and LLM features shipped with evaluation suites, not vibes.",
];

export function Who() {
    return (
        <section className="nx-night nx-who" aria-labelledby="nx-who-h">
            <div className="container nx-who-inner">
                <Reveal className="nx-who-photo" move="lay">
                    <Image src={portrait} alt="Rohit Raj" sizes="(max-width: 720px) 80vw, 380px" />
                </Reveal>
                <div className="nx-who-body">
                    <span className="nx-eyebrow nx-amber">The person you actually talk to</span>
                    <Reveal as="h2" id="nx-who-h" className="nx-h2" move="rise">
                        No agency.
                        <br />
                        Just Rohit.
                    </Reveal>
                    <p className="nx-who-lede">
                        AI consultant and forward deployed engineer, based in Bengaluru, India, working with companies
                        worldwide. I work inside your repo, your standups and your infrastructure from day one.
                    </p>
                    <Reveal as="ol" className="nx-who-terms" move="rows" items="li">
                        {PROMISES.map((p, i) => (
                            <li key={p}>
                                <span className="nx-cyan" aria-hidden="true">
                                    §{i + 1}
                                </span>
                                {p}
                            </li>
                        ))}
                    </Reveal>
                    <div className="nx-bills-more">
                        <Link href="/about">
                            More about Rohit <span aria-hidden="true">→</span>
                        </Link>
                        <Link href="/hire">
                            Hire me <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/** The closing ask, set in the finished city. */
export function StreetNext() {
    return (
        <section className="nx-next" id="start" aria-labelledby="nx-next-h">
            <div className="nx-next-film" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={city.src} alt="" width={city.width} height={city.height} loading="lazy" decoding="async" />
                <span className="nx-ring" />
                <span className="nx-ring" />
                <span className="nx-ring" />
            </div>
            <Motes count={14} />
            <Reveal className="container nx-next-inner" move="rise">
                <h2 id="nx-next-h" className="nx-next-h2">
                    Your street
                    <br />
                    <span className="nx-shimmer">is next.</span>
                </h2>
                <p className="nx-next-body">
                    Tell me what you are shipping and I will tell you, on the call, whether six weeks is realistic and
                    what I would cut to get there. If it is not a fit I will say so.
                </p>
                <div className="nx-next-actions">
                    <Link href="/contact" className="poster-cta nx-cta">
                        Book a free 30-min call <span aria-hidden="true">→</span>
                    </Link>
                    <a href="https://wa.me/918130313297" target="_blank" rel="noopener noreferrer" className="nx-ghost">
                        WhatsApp Rohit
                    </a>
                </div>
                <p className="nx-next-fine">
                    You own the code, the IP and the repo from week one · First production commit inside 5 days · Daily
                    Slack or WhatsApp access
                </p>
            </Reveal>
        </section>
    );
}
