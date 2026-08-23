import Link from "next/link";
import { aiProjectSummaries } from "@/data/ai-projects";
import { agents } from "@/data/agents";
import { projects } from "@/data/projects";

/**
 * The shipped-work index.
 *
 * This replaces two identical card grids that between them reprinted every project and
 * agent on the home page. Cards were the wrong affordance twice over: they made the two
 * sections indistinguishable from each other, and a grid of equal-weight boxes flattens
 * the one thing that actually differentiates a solo engineer from an agency — the sheer
 * length of the list, with a clickable repo behind every line.
 *
 * So the section is built as an index rather than a gallery: numbered rows, aligned
 * columns, one accent, no boxes. It reads as a catalogue of receipts, it scans in a
 * single vertical sweep, and it degrades to a two-line row on a phone instead of a
 * 300px-wide card that has to be scrolled past twelve times.
 */

type Row = {
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

const PRODUCT_ROWS: Row[] = aiProjectSummaries.map((p) => {
    const [name, descriptor] = splitTitle(p.title);
    return {
        id: p.slug,
        name,
        descriptor,
        note: p.metrics?.[0] ? `${p.metrics[0].label}: ${p.metrics[0].value}` : "",
        stack: p.techStack.slice(0, 3),
        href: `/projects/${p.slug}`,
        liveUrl: p.liveUrl,
        repoUrl: p.repoUrl,
    };
});

const AGENT_ROWS: Row[] = agents.slice(0, 6).map((a) => {
    const [name, descriptor] = splitTitle(a.name);
    return {
        id: a.slug,
        name,
        descriptor,
        // The market line is the only short field agents carry; strip the CAGR tail so
        // the column stays a glance, not a paragraph.
        note: a.marketSize.split(" · ")[0].split(",")[0],
        stack: a.techStack.slice(0, 3),
        href: `/agents#${a.slug}`,
        liveUrl: a.liveUrl,
        repoUrl: a.repoUrl,
    };
});

function IndexRow({ row, n, locale }: { row: Row; n: number; locale: string }) {
    return (
        <li className="widx-row" style={{ "--row-i": n } as React.CSSProperties}>
            <Link href={`/${locale}${row.href}`} className="widx-hit">
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

export default function WorkIndex({ locale }: { locale: string }) {
    return (
        <section id="work" className="widx">
            <div className="container">
                <header className="widx-head">
                    <h2 className="widx-h2">All of it is public.</h2>
                    <p className="widx-sub">
                        {projects.length} products and {agents.length} autonomous agents. Every one
                        has a live URL or an open repo, so nothing here is a case study you have to
                        take my word for.
                    </p>
                </header>

                <div className="widx-group">
                    <h3 className="widx-group-title">
                        Products <span aria-hidden="true">/ {projects.length}</span>
                    </h3>
                    <ol className="widx-list">
                        {PRODUCT_ROWS.map((row, i) => (
                            <IndexRow key={row.id} row={row} n={i + 1} locale={locale} />
                        ))}
                    </ol>
                    <Link href={`/${locale}/projects`} className="widx-more">
                        Every project, in full <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <div className="widx-group">
                    <h3 className="widx-group-title">
                        Autonomous agents <span aria-hidden="true">/ {agents.length}</span>
                    </h3>
                    <ol className="widx-list">
                        {AGENT_ROWS.map((row, i) => (
                            <IndexRow key={row.id} row={row} n={i + 1} locale={locale} />
                        ))}
                    </ol>
                    <Link href={`/${locale}/agents`} className="widx-more">
                        Run one in the browser <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
