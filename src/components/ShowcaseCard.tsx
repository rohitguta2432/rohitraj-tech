import Link from "next/link";

/**
 * Compact showcase card used by the landing page for both AI projects and agents.
 *
 * The landing page previously rendered every project and agent at full length —
 * 17 cards between 700px and 1,435px each, stacked one per row. That was 17,060px,
 * 77% of a 22,212px page. The full write-ups already live on their own indexable
 * routes (/projects/<slug> and /agents), so the home page's job is to make the work
 * scannable and send people there, not to reprint it.
 *
 * Each card answers three questions in about two seconds: what is it, is it real,
 * what is it built with.
 */

export interface ShowcaseCardProps {
    /** Full title, usually "Name — descriptor". Split on the em dash for hierarchy. */
    title: string;
    href: string;
    status: "live" | "development" | "production" | "active";
    /** One short proof line: a headline metric, or the market being addressed. */
    highlight?: string;
    techStack: string[];
    /** Optional outbound links rendered as secondary actions. */
    liveUrl?: string;
    repoUrl?: string;
}

const MAX_CHIPS = 3;

/** "PropCheck — AI Property Trust Score" → ["PropCheck", "AI Property Trust Score"] */
function splitTitle(title: string): [string, string | null] {
    const parts = title.split(/\s+—\s+/);
    if (parts.length < 2) return [title, null];
    return [parts[0], parts.slice(1).join(" — ")];
}

export default function ShowcaseCard({
    title,
    href,
    status,
    highlight,
    techStack,
    liveUrl,
    repoUrl,
}: ShowcaseCardProps) {
    const [name, descriptor] = splitTitle(title);
    const chips = techStack.slice(0, MAX_CHIPS);
    const overflow = techStack.length - chips.length;

    return (
        <article className="showcase-card">
            {/* Stretched link: the whole card is the primary target, but the outbound
                links below stay individually clickable via z-index. */}
            <Link href={href} className="showcase-card-link">
                <span className="sr-only">{`Open ${name}`}</span>
            </Link>

            <div className="showcase-card-top">
                <h3 className="showcase-card-name">{name}</h3>
                <span
                    className={`ai-project-status ai-project-status--${status}`}
                    aria-label={`Status: ${status}`}
                >
                    {status}
                </span>
            </div>

            {descriptor && <p className="showcase-card-descriptor">{descriptor}</p>}

            {highlight && <p className="showcase-card-highlight">{highlight}</p>}

            <div className="showcase-card-foot">
                <div className="showcase-card-tech">
                    {chips.map((tech) => (
                        <span key={tech} className="showcase-chip">
                            {tech}
                        </span>
                    ))}
                    {overflow > 0 && (
                        <span
                            className="showcase-chip showcase-chip--more"
                            title={techStack.slice(MAX_CHIPS).join(", ")}
                        >
                            <span aria-hidden="true">+{overflow}</span>
                            <span className="sr-only">{`and ${overflow} more: ${techStack.slice(MAX_CHIPS).join(", ")}`}</span>
                        </span>
                    )}
                </div>

                {(liveUrl || repoUrl) && (
                    <div className="showcase-card-links">
                        {liveUrl && (
                            <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="showcase-card-out"
                            >
                                Live
                            </a>
                        )}
                        {repoUrl && (
                            <a
                                href={repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="showcase-card-out"
                            >
                                Source
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
