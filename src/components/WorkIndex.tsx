import Link from "next/link";
import { aiProjectSummaries } from "@/data/ai-projects";
import { agents } from "@/data/agents";
import { projects } from "@/data/projects";
import ProofMark from "@/components/brand/ProofMark";
import Reveal from "@/components/Reveal";
import WorkReel, { type ReelItem } from "@/components/WorkReel";

/**
 * The shipped-work index.
 *
 * This replaces two identical card grids that between them reprinted every project and
 * agent on the home page. Cards were the wrong affordance twice over: they made the two
 * sections indistinguishable from each other, and a grid of equal-weight boxes flattens
 * the one thing that actually differentiates a solo engineer from an agency — the sheer
 * length of the list, with a clickable repo behind every line.
 *
 * It was then an index of numbered rows, which read well until the list passed forty
 * entries and became most of the page's scroll. Now products and agents share one
 * swipeable reel (components/WorkReel), demos first: the work is shown running rather
 * than listed, and the page's length no longer grows with every product shipped. The
 * row (IndexRow) stays here because the writing index and /notes still use it.
 */

export type Row = {
    id: string;
    name: string;
    descriptor: string;
    note: string;
    stack: string[];
    href: string;
    liveUrl?: string;
    repoUrl?: string;
};

/** "PropCheck — AI Property Trust Score" → ["PropCheck", "AI Property Trust Score"] */
function splitTitle(title: string): [string, string] {
    const parts = title.split(/\s+—\s+/);
    if (parts.length < 2) return [title, ""];
    return [parts[0], parts.slice(1).join(" — ")];
}

const SUMMARIES = new Map(aiProjectSummaries.map((s) => [s.slug, s]));

const PRODUCT_ITEMS: ReelItem[] = projects.map((p) => {
    const [name, descriptor] = splitTitle(p.name);
    const metric = SUMMARIES.get(p.slug)?.metrics?.[0];
    return {
        id: p.slug,
        kind: "product",
        name,
        descriptor,
        note: metric ? `${metric.label}: ${metric.value}` : p.techStack.slice(0, 3).join(" · "),
        href: `/projects/${p.slug}`,
        liveUrl: p.liveUrl,
        repoUrl: p.repoUrl,
        video: p.videoUrl,
        image: p.image,
    };
});

const AGENT_ITEMS: ReelItem[] = agents.map((a) => {
    const [name, descriptor] = splitTitle(a.name);
    return {
        id: `agent-${a.slug}`,
        kind: "agent",
        name,
        descriptor,
        // The market line is the only short field agents carry; strip the CAGR tail so
        // it stays a glance, not a paragraph.
        note: a.marketSize.split(" · ")[0].split(",")[0],
        href: a.detailPath ?? `/agents#${a.slug}`,
        liveUrl: a.liveUrl,
        repoUrl: a.repoUrl,
        image: a.screenshot,
        runsHere: !!a.demo,
    };
});

// Running demos lead, then the agents, then the rest of the products.
const REEL: ReelItem[] = [
    ...PRODUCT_ITEMS.filter((p) => p.video),
    ...AGENT_ITEMS,
    ...PRODUCT_ITEMS.filter((p) => !p.video),
];

export function IndexRow({ row, n }: { row: Row; n: number }) {
    return (
        <li className="widx-row" style={{ "--row-i": n } as React.CSSProperties}>
            <Link href={`${row.href}`} className="widx-hit">
                <span className="sr-only">{`Open ${row.name}`}</span>
            </Link>

            <span className="widx-num" aria-hidden="true">
                {String(n).padStart(2, "0")}
            </span>

            <span className="widx-title">
                <span className="widx-name">{row.name}</span>
                <span className="widx-desc">{row.descriptor}</span>
            </span>

            <span className="widx-note">{row.note}</span>

            <span className="widx-stack">
                {row.stack.map((t) => (
                    <span key={t}>{t}</span>
                ))}
            </span>

            <span className="widx-links">
                {row.liveUrl && (
                    <a href={row.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`${row.name} — open the live site`}>
                        Live
                    </a>
                )}
                {row.repoUrl && (
                    <a href={row.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${row.name} — view source on GitHub`}>
                        Code
                    </a>
                )}
                <span className="widx-arrow" aria-hidden="true">
                    →
                </span>
            </span>
        </li>
    );
}

// The proof mark: one ray per product, sized by its stack, named on the board.
const PROOF = projects.map((p) => ({ name: splitTitle(p.name)[0], stack: p.techStack.length }));

export default function WorkIndex() {
    return (
        <section id="work" className="widx">
            <div className="container">
                <Reveal className="widx-top" move="rise">
                    <header className="widx-head">
                        <h2 className="widx-h2">All of it is public.</h2>
                        <p className="widx-sub">
                            {projects.length} products and {agents.length} autonomous agents. Every one
                            has a live URL or an open repo, so nothing here is a case study you have to
                            take my word for.
                        </p>
                    </header>
                    <ProofMark products={PROOF} />
                </Reveal>

                <Reveal move="rise">
                    <WorkReel items={REEL} />
                </Reveal>

                <div className="reel-more">
                    <Link href="/projects" className="widx-more">
                        Every project, in full <span aria-hidden="true">→</span>
                    </Link>
                    <Link href="/agents" className="widx-more">
                        Run an agent in the browser <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
