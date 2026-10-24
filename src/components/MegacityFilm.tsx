"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeDictionary } from "@/lib/i18n";
import type { Film } from "@/components/megacity/engine";
import { FILM_DURATION, FILM_PHASES, phaseAt } from "@/components/megacity/timeline";

interface MegacityFilmProps {
    dict: HomeDictionary;
}

const FALLBACK: NonNullable<HomeDictionary["film"]> = {
    eyebrow: "Motion lab",
    heading: "A city, rendered live in your browser.",
    intro:
        "Megacity Awakening is a 15-second film your device draws in real time with WebGL, so there is no video file to download. Every raindrop, rickshaw and tower is generated in code. One drone shot follows a rainy South Asian street at night as it rebuilds itself into an AI-connected city.",
    meta: "Three.js and hand-written GLSL shaders, built solo",
    canvasLabel:
        "Animation: a drone shot down a rainy, aging South Asian street at night as it transforms into a glowing, AI-connected city",
    posterAlt: "Rainy night street in an aging South Asian city, with sodium streetlights, buses and auto-rickshaws",
    fallback: "This browser didn't start WebGL, so this is a still from the film.",
};

type Status = "idle" | "loading" | "ready" | "failed";

const pct = (t: number) => `${(t / FILM_DURATION) * 100}%`;

/**
 * Megacity Awakening on the landing page.
 *
 * The engine (and three.js with it) is fetched only when the section comes within a
 * few hundred pixels of the viewport, and only once the browser is idle, so the hero's
 * first paint never waits on it. Until then — and for anyone whose browser can't start
 * WebGL — the screen shows a poster frame. Playback pauses whenever the screen leaves
 * the viewport and never starts on its own for reduced-motion visitors, who get the
 * final frame as a still until they press play.
 */
export default function MegacityFilm({ dict }: MegacityFilmProps) {
    const copy = dict.film ?? FALLBACK;
    const screenRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);
    const clockRef = useRef<HTMLSpanElement>(null);
    const filmRef = useRef<Film | null>(null);
    const phaseRef = useRef<string>(FILM_PHASES[0][1]);
    const userPaused = useRef(false);
    const autoPaused = useRef(false);
    const scrubbing = useRef(false);
    const idleTimer = useRef<number | undefined>(undefined);
    const [status, setStatus] = useState<Status>("idle");
    const [playing, setPlaying] = useState(false);
    const [sound, setSound] = useState(false);
    const [phase, setPhase] = useState<string>(FILM_PHASES[0][1]);
    const [idle, setIdle] = useState(false);

    const onFrame = useCallback((t: number) => {
        const p = pct(t);
        if (fillRef.current) fillRef.current.style.width = p;
        if (knobRef.current) knobRef.current.style.left = p;
        if (clockRef.current) clockRef.current.textContent = `${t.toFixed(1).padStart(4, "0")} / ${FILM_DURATION.toFixed(1)}`;
        const name = phaseAt(t);
        if (trackRef.current) {
            trackRef.current.setAttribute("aria-valuenow", t.toFixed(1));
            trackRef.current.setAttribute("aria-valuetext", `${t.toFixed(1)} seconds, ${name}`);
        }
        if (name !== phaseRef.current) {
            phaseRef.current = name;
            setPhase(name);
        }
    }, []);

    useEffect(() => {
        const screen = screenRef.current;
        const canvas = canvasRef.current;
        if (!screen || !canvas) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lite = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 600;
        let cancelled = false;
        let requested = false;
        let onScreen = false;

        const load = () => {
            if (requested) return;
            requested = true;
            setStatus("loading");
            const boot = () => {
                import("@/components/megacity/engine")
                    .then(({ createFilm }) => {
                        if (cancelled) return;
                        const film = createFilm(canvas, { lite, onFrame, onPlayState: setPlaying });
                        filmRef.current = film;
                        setStatus("ready");
                        if (reduce) film.seek(FILM_DURATION);
                        else if (onScreen) film.play();
                        else autoPaused.current = true;
                    })
                    .catch(() => {
                        if (!cancelled) setStatus("failed");
                    });
            };
            if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(boot, { timeout: 1500 });
            else window.setTimeout(boot, 200);
        };

        const nearby = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) load();
        }, { rootMargin: "400px 0px" });
        const inView = new IntersectionObserver((entries) => {
            for (const e of entries) {
                onScreen = e.isIntersecting;
                const film = filmRef.current;
                if (!film) continue;
                if (!onScreen && film.isPlaying()) {
                    film.pause();
                    autoPaused.current = true;
                } else if (onScreen && autoPaused.current && !userPaused.current && !reduce) {
                    autoPaused.current = false;
                    film.play();
                }
            }
        }, { threshold: 0.2 });
        nearby.observe(screen);
        inView.observe(screen);

        return () => {
            cancelled = true;
            nearby.disconnect();
            inView.disconnect();
            filmRef.current?.dispose();
            filmRef.current = null;
        };
    }, [onFrame]);

    // The control rail steps aside while the film plays and the pointer is still.
    const wake = useCallback(() => {
        setIdle(false);
        window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
    }, []);
    useEffect(() => {
        // Also step aside once playback starts, so touch screens without hover still see the film clear.
        if (status !== "ready" || !playing) return;
        idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
        return () => window.clearTimeout(idleTimer.current);
    }, [status, playing]);

    const togglePlay = () => {
        const film = filmRef.current;
        if (!film) return;
        if (film.isPlaying()) {
            film.pause();
            userPaused.current = true;
        } else {
            film.play();
            userPaused.current = false;
        }
        wake();
    };
    const restart = () => {
        filmRef.current?.restart();
        userPaused.current = false;
        wake();
    };
    const toggleSound = async () => {
        const film = filmRef.current;
        if (!film) return;
        setSound(await film.setSound(!sound));
    };
    const toggleFullscreen = () => {
        const screen = screenRef.current;
        if (!screen) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        } else if (typeof screen.requestFullscreen === "function") {
            screen.requestFullscreen().catch(() => undefined);
        }
    };
    const seekFrom = (clientX: number) => {
        const track = trackRef.current;
        if (!track || !filmRef.current) return;
        const r = track.getBoundingClientRect();
        filmRef.current.seek(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * FILM_DURATION);
    };
    const nudge = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const film = filmRef.current;
        if (!film) return;
        const now = Number(trackRef.current?.getAttribute("aria-valuenow") ?? 0);
        const step = ({ ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 } as Record<string, number>)[e.key];
        if (step !== undefined) film.seek(now + step);
        else if (e.key === "Home") film.seek(0);
        else if (e.key === "End") film.seek(FILM_DURATION);
        else return;
        e.preventDefault();
    };

    const ready = status === "ready";
    const hudHidden = ready && playing && idle;

    return (
        <section className="mfilm" aria-labelledby="mfilm-heading">
            <div className="container">
                <header className="mfilm-head">
                    <span className="mfilm-eyebrow">{copy.eyebrow}</span>
                    <h2 id="mfilm-heading" className="mfilm-h2">{copy.heading}</h2>
                    <p className="mfilm-sub">{copy.intro}</p>
                </header>

                <div
                    ref={screenRef}
                    className={`mfilm-screen${hudHidden ? " is-idle" : ""}`}
                    data-ready={ready ? "true" : "false"}
                    onPointerMove={wake}
                    onFocus={wake}
                >
                    {/* A poster, not content: next/image would add nothing for one fixed-size still. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="mfilm-poster"
                        src="/images/megacity/poster.webp"
                        alt={copy.posterAlt}
                        width={1600}
                        height={900}
                        loading="lazy"
                        decoding="async"
                    />
                    <canvas
                        ref={canvasRef}
                        className="mfilm-canvas"
                        role="img"
                        aria-label={copy.canvasLabel}
                        onClick={() => (hudHidden ? wake() : togglePlay())}
                    />

                    {status === "failed" && <p className="mfilm-note">{copy.fallback}</p>}

                    {ready && (
                        <div className="mfilm-hud" role="group" aria-label="Film controls">
                            <button type="button" className="mfilm-btn mfilm-icon" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    {playing ? <path d="M8 5v14M16 5v14" /> : <path d="M7 5l12 7-12 7z" />}
                                </svg>
                            </button>
                            <button type="button" className="mfilm-btn mfilm-icon" onClick={restart} aria-label="Play from the start">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 12a8 8 0 1 0 2.3-5.6" />
                                    <path d="M4 4v4h4" />
                                </svg>
                            </button>
                            <div className="mfilm-scrub">
                                <div className="mfilm-phases" aria-hidden="true">
                                    {FILM_PHASES.map(([start, label]) => (
                                        <span key={label} className={label === phase ? "is-on" : undefined} style={{ left: pct(start) }}>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                                <div
                                    ref={trackRef}
                                    className="mfilm-track"
                                    role="slider"
                                    tabIndex={0}
                                    aria-label="Timeline"
                                    aria-valuemin={0}
                                    aria-valuemax={FILM_DURATION}
                                    aria-valuenow={0}
                                    onKeyDown={nudge}
                                    onPointerDown={(e) => {
                                        scrubbing.current = true;
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        filmRef.current?.setScrubbing(true);
                                        seekFrom(e.clientX);
                                    }}
                                    onPointerMove={(e) => {
                                        if (scrubbing.current) seekFrom(e.clientX);
                                    }}
                                    onPointerUp={() => {
                                        scrubbing.current = false;
                                        filmRef.current?.setScrubbing(false);
                                    }}
                                    onPointerCancel={() => {
                                        scrubbing.current = false;
                                        filmRef.current?.setScrubbing(false);
                                    }}
                                >
                                    <div ref={fillRef} className="mfilm-fill" />
                                    {FILM_PHASES.slice(1).map(([start]) => (
                                        <div key={start} className="mfilm-tick" style={{ left: pct(start) }} />
                                    ))}
                                    <div ref={knobRef} className="mfilm-knob" />
                                </div>
                            </div>
                            <div className="mfilm-readout">
                                <b>{phase}</b>
                                <span ref={clockRef}>00.0 / 15.0</span>
                            </div>
                            <button type="button" className="mfilm-btn" onClick={toggleSound} aria-pressed={sound}>
                                Sound
                            </button>
                            <button type="button" className="mfilm-btn mfilm-icon" onClick={toggleFullscreen} aria-label="Full screen">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <p className="mfilm-meta">{copy.meta}</p>
            </div>
        </section>
    );
}
