"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

export type ReelItem = {
    id: string;
    kind: "product" | "agent";
    name: string;
    descriptor: string;
    note: string;
    /** The first few tools in its stack, shown on the plate when there is no footage. */
    stack: string[];
    href: string;
    liveUrl?: string;
    repoUrl?: string;
    /** A short muted demo loop; `image` is its poster frame. */
    video?: string;
    image?: string;
    /** The agent runs on this site, in the visitor's browser. */
    runsHere?: boolean;
};

type Filter = "all" | "video" | "product" | "agent";

const FILTERS: { key: Filter; label: string; match: (item: ReelItem) => boolean }[] = [
    { key: "all", label: "All", match: () => true },
    { key: "video", label: "Demos", match: (item) => !!item.video },
    { key: "product", label: "Products", match: (item) => item.kind === "product" },
    { key: "agent", label: "Agents", match: (item) => item.kind === "agent" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The shipped work as one swipeable reel, products and agents together.
 *
 * The cards sit in a scroll-snapped strip, so a phone swipes and a trackpad
 * scrolls with no carousel library; the arrows, the arrow keys and a click on a
 * neighbouring card all bring a card to the middle. Only the card in the middle
 * plays its demo, muted and looping, and only while the reel is on screen: every
 * video is `preload="none"` behind its poster, so the 21 demos cost nothing
 * until one is actually looked at. One control pauses them all (WCAG 2.2.2), and
 * reduced-motion visitors start paused. Every card is a server-rendered link to
 * its project or agent page, so nothing is lost to crawlers or to no-JS.
 */
export default function WorkReel({ items }: { items: ReelItem[] }) {
    const stripRef = useRef<HTMLUListElement>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [onScreen, setOnScreen] = useState(false);

    const shown = useMemo(() => items.filter(FILTERS.find((f) => f.key === filter)!.match), [items, filter]);
    const counts = useMemo(
        () => Object.fromEntries(FILTERS.map((f) => [f.key, items.filter(f.match).length])) as Record<Filter, number>,
        [items],
    );

    // Reduced motion: no demo starts on its own.
    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            const id = requestAnimationFrame(() => setPaused(true));
            return () => cancelAnimationFrame(id);
        }
    }, []);

    // The card whose centre is nearest the strip's centre is the active one.
    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const mid = strip.scrollLeft + strip.clientWidth / 2;
            let best = 0;
            let bestGap = Infinity;
            Array.from(strip.children).forEach((card, i) => {
                const el = card as HTMLElement;
                const gap = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
                if (gap < bestGap) {
                    bestGap = gap;
                    best = i;
                }
            });
            setActive(best);
        };
        const onScroll = () => {
            frame ||= requestAnimationFrame(measure);
        };
        strip.scrollLeft = 0;
        onScroll();
        strip.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            strip.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(frame);
        };
    }, [shown]);

    // Demos only run while the reel is actually on screen.
    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 });
        io.observe(strip);
        return () => io.disconnect();
    }, []);

    // Play the middle card's demo; hold every other one where it is.
    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        strip.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
            const card = video.closest<HTMLElement>("[data-index]");
            if (onScreen && !paused && card && Number(card.dataset.index) === active) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, [active, paused, onScreen, shown]);

    const goTo = useCallback((i: number) => {
        const strip = stripRef.current;
        const card = strip?.children[i] as HTMLElement | undefined;
        if (!strip || !card) return;
        const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        strip.scrollTo({ left: card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
    }, []);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(Math.max(0, Math.min(shown.length - 1, active + (e.key === "ArrowRight" ? 1 : -1))));
        }
    };

    // A click on a neighbouring card brings it to the middle instead of leaving the page.
    const onCardClick = (e: MouseEvent<HTMLLIElement>, i: number) => {
        if (i === active) return;
        e.preventDefault();
        goTo(i);
    };

    return (
        <div className="reel" role="region" aria-roledescription="carousel" aria-label="Shipped work" onKeyDown={onKeyDown}>
            <div className="reel-bar">
                <div className="reel-filters" role="group" aria-label="Show">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            className="reel-filter"
                            aria-pressed={filter === f.key}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label} <span>/ {counts[f.key]}</span>
                        </button>
                    ))}
                </div>
                <div className="reel-nav">
                    <span className="reel-count" aria-live="polite">
                        {pad(active + 1)} / {pad(shown.length)}
                    </span>
                    <button type="button" className="reel-btn" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous">
                        ←
                    </button>
                    <button type="button" className="reel-btn" onClick={() => goTo(active + 1)} disabled={active >= shown.length - 1} aria-label="Next">
                        →
                    </button>
                    <button type="button" className="reel-btn reel-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                        {paused ? "Play demos" : "Pause demos"}
                    </button>
                </div>
            </div>

            <ul ref={stripRef} className="reel-strip">
                {shown.map((item, i) => (
                    <li
                        key={item.id}
                        className="reel-card"
                        data-index={i}
                        data-active={i === active ? "" : undefined}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${shown.length}: ${item.name}`}
                        onClickCapture={(e) => onCardClick(e, i)}
                    >
                        <div className="reel-media">
                            {item.video ? (
                                <video src={item.video} poster={item.image} muted loop playsInline preload="none" aria-label={`${item.name} demo`} />
                            ) : item.image ? (
                                <Image src={item.image} alt={`${item.name} screenshot`} fill sizes="(max-width: 720px) 86vw, 680px" />
                            ) : (
                                <div className="reel-plate" aria-hidden="true">
                                    <span className="reel-plate-num">{pad(i + 1)}</span>
                                    <span className="reel-plate-label">Built with</span>
                                    <span className="reel-plate-stack">
                                        {item.stack.map((t) => (
                                            <span key={t}>{t}</span>
                                        ))}
                                    </span>
                                </div>
                            )}
                            <span className="reel-tag">
                                {item.kind === "agent" ? (item.runsHere ? "Agent · runs here" : "Agent") : item.video ? "Product · demo" : "Product"}
                            </span>
                        </div>

                        <div className="reel-body">
                            <h3 className="reel-name">
                                <Link href={item.href} className="reel-hit">
                                    {item.name}
                                </Link>
                            </h3>
                            <p className="reel-desc">{item.descriptor}</p>
                            <div className="reel-foot">
                                <span className="reel-note">{item.note}</span>
                                <span className="reel-links">
                                    {item.liveUrl && (
                                        <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`${item.name}, open the live site`}>
                                            Live
                                        </a>
                                    )}
                                    {item.repoUrl && (
                                        <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${item.name}, view source on GitHub`}>
                                            Code
                                        </a>
                                    )}
                                    <span className="reel-arrow" aria-hidden="true">
                                        →
                                    </span>
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
