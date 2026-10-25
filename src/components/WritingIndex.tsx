import Link from "next/link";
import { blogPosts, type BlogPost } from "@/data/blog-posts";
import Reveal from "@/components/Reveal";

/**
 * The buyer-intent writing, set as a bout card.
 *
 * This section exists for a measured reason. After the locale migration Google
 * crawled the homepage and stopped: `/notes` and nearly every post behind it sat
 * "Discovered - currently not indexed", two hops from the only page it fetched.
 * The homepage carried 91 links and not one pointed at a post. These anchors are
 * that path, and the homepage is still the strongest internal link on the site,
 * so they stay: the comparison cluster a founder reads while deciding whether to
 * buy a builder tool or hire a person, plus the forward deployed engineer
 * explainer that heads the consulting cluster.
 *
 * Curated, not sliced from the latest N: a recency slice would fill this with
 * whatever the daily pipeline shipped that morning. Keep it short, since the
 * signal to each page dilutes as the list grows.
 *
 * It used to be a thirteen-row index. Now the seven "tool vs a hire" notes are a
 * fight card in the poster face (seven challengers, one outlined VS), with the
 * explainer and the money questions beside it: every link kept, about half the
 * scroll.
 */
const BOUTS: { slug: string; tool: string; against?: string }[] = [
    { slug: "bolt-new-vs-hire-developer-2026", tool: "Bolt.new" },
    { slug: "cursor-ai-vs-hire-developer-2026", tool: "Cursor" },
    { slug: "v0-by-vercel-vs-hire-developer-2026", tool: "v0" },
    { slug: "devin-ai-vs-hire-developer-2026", tool: "Devin" },
    { slug: "replit-agent-vs-hire-developer-2026", tool: "Replit Agent" },
    { slug: "claude-code-vs-hire-developer-2026", tool: "Claude Code" },
    { slug: "founding-engineer-vs-lovable-when-to-hire-2026", tool: "Lovable", against: "a founding engineer" },
];

// The head term of the forward deployed engineer cluster.
const LEAD = "what-does-a-forward-deployed-engineer-do-2026";

// Short, descriptive anchors, without the price figures some of the titles carry.
const MONEY: { slug: string; label: string }[] = [
    { slug: "founding-engineer-equity-percentage-2026", label: "Founding engineer equity: how much to negotiate" },
    { slug: "india-vs-us-mvp-developer-cost-2026", label: "India vs US: what an MVP developer costs" },
    { slug: "what-15k-mvp-actually-includes-vs-50k-agency-quote", label: "What a fixed-price MVP includes, vs an agency quote" },
    { slug: "hire-freelance-developer-vs-agency-india", label: "Freelance developer vs agency, in India" },
    { slug: "founding-engineer-india-vs-toptal-arc-uplers-2026", label: "Founding engineer in India: direct vs Toptal, Arc, Uplers" },
];

/** "2026-02-14" → "Feb 2026" */
export function formatMonth(iso: string): string {
    const [y, m] = iso.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[Number(m) - 1] ?? ""} ${y}`.trim();
}

/** "Bolt.new vs Hiring a Developer: ..." → ["Bolt.new vs Hiring a Developer", "..."] */
export function splitTitle(title: string): [string, string] {
    const parts = title.split(/\s*[:—]\s+/);
    if (parts.length < 2) return [title, ""];
    return [parts[0], parts.slice(1).join(" — ")];
}

const bySlug = new Map(blogPosts.map((p) => [p.slug, p]));
// "12 min read" → "12 min"
const minutes = (post: BlogPost) => post.readingTime.replace(/\s*read$/, "");

const bouts = BOUTS.flatMap((b) => {
    const post = bySlug.get(b.slug);
    return post ? [{ ...b, post }] : [];
});
const lead = bySlug.get(LEAD);
const money = MONEY.flatMap((m) => {
    const post = bySlug.get(m.slug);
    return post ? [{ ...m, post }] : [];
});

export default function WritingIndex() {
    return (
        <section id="writing" className="widx">
            <div className="container">
                <Reveal as="header" className="widx-head" move="rise">
                    <h2 className="widx-h2">The arguments, written down.</h2>
                    <p className="widx-sub">
                        {blogPosts.length} engineering notes, each one costed and dated. If you are
                        deciding between a builder tool and a person, start with these.
                    </p>
                </Reveal>

                <div className="args">
                    <div className="args-bouts">
                        <p className="args-label">
                            <span>Builder tool vs a hire</span>
                            <span aria-hidden="true">{bouts.length} bouts</span>
                        </p>
                        <span className="args-vs" aria-hidden="true">
                            VS
                        </span>
                        <Reveal as="ol" className="args-list" move="rows" items=".args-bout">
                            {bouts.map((b) => (
                                <li key={b.slug} className="args-bout">
                                    <Link href={`/notes/${b.slug}`}>
                                        <span className="args-tool">{b.tool}</span>
                                        <span className="args-meta">
                                            vs {b.against ?? "hiring a developer"} · {minutes(b.post)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </Reveal>
                    </div>

                    <Reveal className="args-side" move="rise">
                        {lead && (
                            <Link href={`/notes/${lead.slug}`} className="args-lead">
                                <span className="args-kicker">Start here · {minutes(lead)}</span>
                                <span className="args-lead-title">{lead.title}</span>
                                <span className="args-lead-text">{lead.excerpt.split(/(?<=\.)\s/)[0]}</span>
                                <span className="args-go">
                                    Read it <span aria-hidden="true">→</span>
                                </span>
                            </Link>
                        )}

                        <div className="args-money">
                            <p className="args-label">
                                <span>The money questions</span>
                                <span aria-hidden="true">{money.length}</span>
                            </p>
                            <ol className="args-money-list">
                                {money.map((m) => (
                                    <li key={m.slug}>
                                        <Link href={`/notes/${m.slug}`}>
                                            <span>{m.label}</span>
                                            <span className="args-meta">{minutes(m.post)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </Reveal>
                </div>

                <Link href={`/notes`} className="widx-more">
                    Every note, in full <span aria-hidden="true">→</span>
                </Link>
            </div>
        </section>
    );
}
