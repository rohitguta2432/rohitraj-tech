"use client";

import { inView } from "motion";
import { animate } from "motion/mini";
import { useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

/**
 * Scroll entrances for the home page, one per kind of thing being revealed.
 *
 * Built on Motion's WAAPI animate, so the animations run on the compositor and
 * stay smooth while the hero film keeps the main thread busy.
 *
 * The server renders everything visible. After hydration, only what is still
 * below the fold is set back to its starting pose to wait for the scroll;
 * anything the visitor can already see is left alone. Reduced motion, no
 * JavaScript, crawlers (which render one tall viewport) and print all get the
 * plain page.
 */
const MOVES = {
    // A sheet of paper laid down on the desk.
    lay: { from: "translateY(72px) rotate(-1.4deg)", to: "translateY(0px) rotate(0deg)", duration: 1.1, gap: 0 },
    // A block settling into place.
    rise: { from: "translateY(36px)", to: "translateY(0px)", duration: 0.9, gap: 0 },
    // Tickets dealt onto the table, one at a time.
    deal: { from: "translateX(48px) rotate(2.5deg)", to: "translateX(0px) rotate(0deg)", duration: 0.8, gap: 0.12 },
    // Index rows ticking in down the list.
    rows: { from: "translateY(18px)", to: "translateY(0px)", duration: 0.65, gap: 0.06 },
    // Rubber stamps thunking down onto the page, one after another.
    stamp: { from: "scale(1.45) rotate(-9deg)", to: "scale(1) rotate(0deg)", duration: 0.5, gap: 0.16 },
} as const;

// Expo out: a quick start and a long, gentle settle.
const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps extends HTMLAttributes<HTMLElement> {
    move: keyof typeof MOVES;
    /** Reveal these descendants one by one instead of the element itself. */
    items?: string;
    as?: ElementType;
    children: ReactNode;
}

export default function Reveal({ move, items, as: Tag = "div", children, ...rest }: RevealProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const { from, to, duration, gap } = MOVES[move];
        const targets = items ? Array.from(root.querySelectorAll<HTMLElement>(items)) : [root];
        const waiting = targets.filter((el) => el.getBoundingClientRect().top > innerHeight);
        if (!waiting.length) return;

        // Each target keeps its own resting transform (the terms sheet is tilted),
        // so the move is composed in front of it rather than replacing it.
        const poses = new Map(
            waiting.map((el) => {
                const own = getComputedStyle(el).transform;
                const tail = own === "none" ? "" : ` ${own}`;
                return [el, [`${from}${tail}`, `${to}${tail}`]] as const;
            })
        );
        for (const [el, [start]] of poses) {
            el.dataset.revealWait = "";
            el.style.opacity = "0";
            el.style.transform = start;
        }

        // Targets that enter together are staggered together, in page order.
        let batch: HTMLElement[] = [];
        let frame = 0;
        const play = () => {
            frame = 0;
            batch
                .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
                .forEach((el, i) => {
                    const [start, end] = poses.get(el)!;
                    delete el.dataset.revealWait;
                    animate(el, { opacity: [0, 1], transform: [start, end] }, { duration, ease: EASE, delay: i * gap }).finished.then(() => {
                        // Hand the element back to its stylesheet (hover nudges and all).
                        el.style.removeProperty("opacity");
                        el.style.removeProperty("transform");
                    });
                });
            batch = [];
        };

        const stop = inView(
            waiting,
            (el) => {
                batch.push(el as HTMLElement);
                frame ||= requestAnimationFrame(play);
            },
            { margin: "0px 0px -12% 0px" }
        );

        return () => {
            stop();
            cancelAnimationFrame(frame);
        };
    }, [move, items]);

    return (
        <Tag ref={ref} {...rest}>
            {children}
        </Tag>
    );
}
