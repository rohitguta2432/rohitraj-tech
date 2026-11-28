"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import city from "../../../public/images/megacity/full-city.webp";

const WORDS = ["MVP", "AI AGENT", "CHATBOT", "BACKLOG"];
const TILES = 8;

/**
 * The line above the headline: a small split-flap board that turns through the
 * things founders ask for. The server paints the first word, and screen readers
 * get the whole list once instead of a word that keeps changing.
 */
export function HeroFlap() {
    const [turn, setTurn] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        const id = window.setInterval(() => setTurn((t) => t + 1), 2400);
        return () => window.clearInterval(id);
    }, []);

    const word = WORDS[turn % WORDS.length].padEnd(TILES, " ");

    return (
        <span className="nx-flap">
            <span className="sr-only">MVP, AI agent, chatbot or backlog</span>
            <span className="nx-flap-board" aria-hidden="true">
                {[...word].map((ch, i) => (
                    <span key={`${turn}-${i}`} className="nx-flap-tile" style={{ "--i": i } as CSSProperties}>
                        {ch === " " ? " " : ch}
                    </span>
                ))}
            </span>
        </span>
    );
}

/**
 * A lens that follows the pointer over the film and shows the finished city
 * through it. Mouse only: it writes two custom properties on the hero and never
 * touches React state, so it costs the film nothing. Decorative throughout.
 */
export function HeroLens() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lens = ref.current;
        const hero = lens?.closest<HTMLElement>(".poster");
        if (!lens || !hero || typeof window.matchMedia !== "function") return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let x = 0;
        let y = 0;
        const paint = () => {
            frame = 0;
            lens.style.setProperty("--lx", `${x}px`);
            lens.style.setProperty("--ly", `${y}px`);
            lens.dataset.on = "";
        };
        const move = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const box = hero.getBoundingClientRect();
            x = e.clientX - box.left;
            y = e.clientY - box.top;
            frame ||= requestAnimationFrame(paint);
        };
        const leave = () => {
            delete lens.dataset.on;
        };
        hero.addEventListener("pointermove", move, { passive: true });
        hero.addEventListener("pointerleave", leave);
        return () => {
            cancelAnimationFrame(frame);
            hero.removeEventListener("pointermove", move);
            hero.removeEventListener("pointerleave", leave);
        };
    }, []);

    return (
        <div ref={ref} className="nx-lens" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={city.src} alt="" width={city.width} height={city.height} loading="lazy" decoding="async" />
            <span className="nx-lens-ring">
                <span className="nx-lens-tag">Week 6</span>
            </span>
        </div>
    );
}

/** Slow motes of light rising over a dark scene. Pure CSS, decorative. */
export function Motes({ count = 16 }: { count?: number }) {
    return (
        <div className="nx-motes" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
                <span
                    key={i}
                    className="nx-mote"
                    style={{ "--x": `${(i * 37 + 5) % 100}%`, "--d": `${-((i * 0.83) % 9)}s`, "--t": `${6 + (i % 5) * 1.3}s` } as CSSProperties}
                />
            ))}
        </div>
    );
}
