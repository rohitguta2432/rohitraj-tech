import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import { IndexRow, type Row } from "@/components/WorkIndex";

/**
 * The buyer-intent writing index.
 *
 * This section exists for one measurable reason. Search Console's URL
 * Inspection API reports `/en/notes` as "Discovered - currently not indexed,
 * last crawled: never", and the same for nearly every post behind it — while
 * `/en` is crawled regularly. Googlebot reaches the homepage and stops, so 141
 * posts sit two hops away behind a hub it has never fetched, and the sitemap
 * alone has not been enough to pull it deeper.
 *
 * The homepage carried 91 links and not one of them pointed at a post. These
 * rows are that missing path: real anchors, on the only page that is reliably
 * crawled, pointing at the posts that answer a buying question rather than a
 * debugging one.
 *
 * Curated deliberately, not sliced from the latest N. A recency slice would
 * fill this with whatever the daily pipeline shipped that morning; what belongs
 * here is the comparison cluster a founder reads while deciding whether to buy
 * a builder tool or hire a person. Keep it short — the value is a strong signal
 * to a few pages, and that dilutes as the list grows.
 */
const FEATURED_SLUGS = [
    "founding-engineer-equity-percentage-2026",
    "bolt-new-vs-hire-developer-2026",
    "cursor-ai-vs-hire-developer-2026",
    "v0-by-vercel-vs-hire-developer-2026",
    "devin-ai-vs-hire-developer-2026",
    "replit-agent-vs-hire-developer-2026",
    "claude-code-vs-hire-developer-2026",
    "founding-engineer-vs-lovable-when-to-hire-2026",
    "founding-engineer-india-vs-toptal-arc-uplers-2026",
    "india-vs-us-mvp-developer-cost-2026",
    "what-15k-mvp-actually-includes-vs-50k-agency-quote",
    "hire-freelance-developer-vs-agency-india",
] as const;

/** "2026-02-14" → "Feb 2026" */
function formatMonth(iso: string): string {
    const [y, m] = iso.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[Number(m) - 1] ?? ""} ${y}`.trim();
}

/** "Bolt.new vs Hiring a Developer: ..." → ["Bolt.new vs Hiring a Developer", "..."] */
function splitTitle(title: string): [string, string] {
    const parts = title.split(/\s*[:—]\s+/);
    if (parts.length < 2) return [title, ""];
    return [parts[0], parts.slice(1).join(" — ")];
}

const POST_ROWS: Row[] = FEATURED_SLUGS.map((slug) => {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return null;
    const [name, descriptor] = splitTitle(post.title);
    return {
        id: post.slug,
        name,
        // Fall back to the excerpt's first clause when the title has no subtitle,
        // so the middle column is never blank.
        descriptor: descriptor || post.excerpt.split(/\.\s/)[0],
        note: post.readingTime,
        // The tag column is sized for short labels (WorkIndex puts "React 19"
        // here). Post keywords are full long-tail phrases and would wrap into a
        // paragraph, so this carries freshness instead — which is what actually
        // matters on a dated comparison.
        stack: [formatMonth(post.updated ?? post.date)],
        href: `/notes/${post.slug}`,
    };
}).filter((r): r is Row => r !== null);

export default function WritingIndex() {
    return (
        <section id="writing" className="widx">
            <div className="container">
                <header className="widx-head">
                    <h2 className="widx-h2">The arguments, written down.</h2>
                    <p className="widx-sub">
                        {blogPosts.length} engineering notes. These are the ones worth reading
                        before you decide whether to buy a builder tool or hire a person — each one
                        costed, with the tradeoff stated plainly rather than sold.
                    </p>
                </header>

                <div className="widx-group">
                    <h3 className="widx-group-title">
                        Build vs hire <span aria-hidden="true">/ {POST_ROWS.length}</span>
                    </h3>
                    <ol className="widx-list">
                        {POST_ROWS.map((row, i) => (
                            <IndexRow key={row.id} row={row} n={i + 1} />
                        ))}
                    </ol>
                    <Link href={`/notes`} className="widx-more">
                        Every note, in full <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
