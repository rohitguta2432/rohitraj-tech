"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Reveal from "@/components/Reveal";
import today from "../../../public/images/megacity/poster.webp";
import city from "../../../public/images/megacity/full-city.webp";

// Every line here restates a promise the site already makes (the closing call
// and the 6-week sprint page), so the slider cannot promise something new.
const STAGES = [
    { from: 0, stamp: "Day 0", title: "30-min call", detail: "You tell me what you are shipping. If it is not a fit, I will say so." },
    { from: 12, stamp: "Day 5", title: "First commit", detail: "First production commit, in your repo, inside five days." },
    { from: 35, stamp: "Weeks 2–5", title: "Building in the open", detail: "Daily Slack or WhatsApp access while it takes shape." },
    { from: 88, stamp: "Week 6", title: "Live in production", detail: "Shipped. You own the code, the IP and the repo." },
] as const;

const stageAt = (p: number) => STAGES.reduce((found, s, i) => (p >= s.from ? i : found), 0);

/**
 * The six weeks as one drag: the film's opening street on the right, the finished
 * city wiping in from the left. It plays itself while on screen until the visitor
 * takes the handle. The wipe is a custom property written straight to the DOM;
 * React only re-renders when the stage caption changes.
 */
export default function SixWeeks() {
    const frame = useRef<HTMLDivElement>(null);
    const range = useRef<HTMLInputElement>(null);
    const readout = useRef<HTMLSpanElement>(null);
    const touched = useRef(false);
    const [stage, setStage] = useState(2);
    const [driving, setDriving] = useState(false);

    const apply = (p: number) => {
        frame.current?.style.setProperty("--p", String(p));
        if (readout.current) readout.current.textContent = `${Math.round(p)}%`;
        setStage(stageAt(p));
    };

    useEffect(() => {
        const el = frame.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

        let pos = 55;
        let dir = 1;
        let raf = 0;
        let last = 0;
        let visible = false;
        const tick = (now: number) => {
            raf = 0;
            if (touched.current || !visible) return;
            if (now - last > 40) {
                last = now;
                pos += dir * 0.5;
                if (pos >= 97) dir = -1;
                if (pos <= 3) dir = 1;
                if (range.current) range.current.value = String(pos);
                apply(pos);
            }
            raf = requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !raf && !touched.current) raf = requestAnimationFrame(tick);
        });
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        touched.current = true;
        setDriving(true);
        apply(Number(e.target.value));
    };

    const s = STAGES[stage];

    return (
        <section id="weeks" className="nx-night nx-weeks">
            <div className="container">
                <div className="nx-weeks-head">
                    <Reveal as="h2" className="nx-h2" move="rise">
                        Drag through
                        <br />
                        the 6 weeks.
                    </Reveal>
                    <div className="nx-weeks-stage" aria-live="off">
                        <span className="nx-eyebrow nx-cyan">{s.stamp}</span>
                        <span className="nx-weeks-title">{s.title}</span>
                        <span className="nx-weeks-detail">{s.detail}</span>
                    </div>
                </div>

                <div ref={frame} className="nx-weeks-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={today.src} alt="Day 0: a dim, rainy street" width={today.width} height={today.height} loading="lazy" decoding="async" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="nx-weeks-city" src={city.src} alt="Week 6: the same street as a lit, connected city" width={city.width} height={city.height} loading="lazy" decoding="async" />
                    <span className="nx-weeks-beam" aria-hidden="true" />
                    <span className="nx-weeks-tag nx-cyan" data-at="l">Built so far</span>
                    <span className="nx-weeks-tag nx-amber" data-at="r">Still an idea</span>
                </div>

                <div className="nx-weeks-control">
                    <label htmlFor="nx-weeks-range" className="nx-eyebrow nx-cyan">
                        {driving ? "You are driving" : "Auto-playing · drag to take over"} · <span ref={readout}>55%</span> built
                    </label>
                    <input
                        ref={range}
                        id="nx-weeks-range"
                        className="nx-range"
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={55}
                        onChange={onChange}
                        aria-valuetext={`${s.stamp}: ${s.title}`}
                    />
                    <ol className="nx-weeks-marks">
                        {STAGES.map((m) => (
                            <li key={m.stamp}>
                                <span>{m.stamp}</span>
                                {m.title}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
