"use client";

import { useEffect, useRef } from "react";

// Points per second along the rail: an unhurried waddle.
const SPEED = 42;

/**
 * A small walking duck robot that patrols a rail: the line its parent draws along
 * its top edge. It waddles end to end, turns round, and now and then stops to
 * look about. It only walks while `walking` is true (the hero ties that to the
 * film playing) and while it is on screen; with reduced motion it stands still at
 * the start of the rail. Hovering it makes it hop. Purely decorative.
 */
export default function DuckBot({ walking }: { walking: boolean }) {
    const railRef = useRef<HTMLDivElement>(null);
    const duckRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rail = railRef.current;
        const duck = duckRef.current;
        if (!rail || !duck || !walking) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

        let x = Number(duck.dataset.x ?? 0);
        let dir = Number(duck.dataset.dir ?? 1);
        let frame = 0;
        let then = 0;
        // Walk for a while, then stop and look about for a moment.
        let walkLeft = 4 + Math.random() * 5;
        let restLeft = 0;
        let visible = true;

        const place = () => {
            duck.dataset.x = String(x);
            duck.dataset.dir = String(dir);
            duck.style.transform = `translateX(${x.toFixed(1)}px) scaleX(${dir})`;
        };

        const tick = (now: number) => {
            frame = 0;
            if (!visible) return;
            const dt = Math.min(now - (then || now), 100) / 1000;
            then = now;
            const room = rail.clientWidth - duck.offsetWidth;

            if (restLeft > 0) {
                restLeft -= dt;
                if (restLeft <= 0) duck.dataset.state = "walk";
            } else {
                x += dir * SPEED * dt;
                if (x >= room || x <= 0) {
                    x = Math.max(0, Math.min(room, x));
                    dir = -dir;
                }
                walkLeft -= dt;
                if (walkLeft <= 0) {
                    walkLeft = 4 + Math.random() * 5;
                    restLeft = 1.2 + Math.random() * 1.2;
                    duck.dataset.state = "look";
                }
            }
            place();
            frame = requestAnimationFrame(tick);
        };

        const start = () => {
            if (frame) return;
            then = 0;
            duck.dataset.state = restLeft > 0 ? "look" : "walk";
            frame = requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else duck.dataset.state = "stand";
        });
        io.observe(rail);
        start();

        return () => {
            io.disconnect();
            cancelAnimationFrame(frame);
            duck.dataset.state = "stand";
        };
    }, [walking]);

    const hop = () => {
        const duck = duckRef.current;
        if (!duck || duck.dataset.hop !== undefined) return;
        duck.dataset.hop = "";
        window.setTimeout(() => delete duck.dataset.hop, 520);
    };

    return (
        <div ref={railRef} className="duck-rail" aria-hidden="true">
            <div ref={duckRef} className="duck" data-state="stand" onPointerEnter={hop}>
                <svg className="duck-svg" viewBox="0 0 48 60">
                    <g className="duck-leg duck-leg-back">
                        <path d="M20 40 L18 48 L20 55" />
                        <path className="duck-foot" d="M17 55 h8 l-2 2.5 h-6z" />
                    </g>
                    <g className="duck-bob">
                        <path className="duck-shell" d="M6 30 l-5 -6 l7 1z" />
                        <ellipse className="duck-shell" cx="21" cy="31" rx="15" ry="11.5" />
                        <path className="duck-seam" d="M10 30 q9 8 20 1" />
                        <circle className="duck-bolt" cx="15" cy="27" r="1.3" />
                        <rect className="duck-shell" x="25" y="18" width="7" height="9" rx="2" />
                        <g className="duck-head">
                            <circle className="duck-shell" cx="30" cy="13" r="9" />
                            <path className="duck-beak" d="M37.5 11.5 L46 14.5 L37.5 17.5z" />
                            <circle className="duck-lens" cx="32.5" cy="11.5" r="3.4" />
                            <circle className="duck-glint" cx="33.6" cy="10.4" r="1" />
                            <path className="duck-antenna" d="M28 4.5 V1" />
                            <circle className="duck-led" cx="28" cy="1" r="1.6" />
                        </g>
                    </g>
                    <g className="duck-leg duck-leg-front">
                        <path d="M25 40 L23 48 L25 55" />
                        <path className="duck-foot" d="M22 55 h8 l-2 2.5 h-6z" />
                    </g>
                </svg>
            </div>
        </div>
    );
}
