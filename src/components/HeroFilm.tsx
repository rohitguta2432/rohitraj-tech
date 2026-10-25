"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Film } from "@/components/megacity/engine";
import { FILM_DURATION } from "@/components/megacity/timeline";

type Status = "idle" | "loading" | "ready" | "failed";

interface FilmControls {
    status: Status;
    playing: boolean;
    togglePlay: () => void;
}

const FilmContext = createContext<FilmControls | null>(null);

/**
 * The hero's moving background: Megacity Awakening, drawn live behind the copy.
 *
 * The hero text stays server-rendered on top, so the headline is still the first
 * thing to paint and the page reads the same with the film off. Underneath sits a
 * poster frame (the film's opening shot) that the live canvas cross-fades over once
 * it is ready. Starting the film is deliberately late: three.js is only fetched after
 * the page has loaded — soon after on desktops, and on phones only at the visitor's
 * first touch, or after a few seconds — so it never competes with the hero for
 * bandwidth or main-thread time. It pauses whenever the hero is off screen, and
 * reduced-motion visitors get the film's final frame as a still until they press play.
 */
export function HeroFilm({ className, children }: { className: string; children: ReactNode }) {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const filmRef = useRef<Film | null>(null);
    const userPaused = useRef(false);
    const [status, setStatus] = useState<Status>("idle");
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        const canvas = canvasRef.current;
        if (!section || !canvas) return;
        if (typeof window.matchMedia !== "function" || typeof IntersectionObserver === "undefined") return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lite = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 600;
        // Real input only: a touch or wheel always precedes a user's scroll, while bare
        // scroll events also fire from the router's own scroll handling on load.
        const triggers = ["pointerdown", "touchstart", "keydown", "wheel"] as const;
        let cancelled = false;
        let booted = false;
        let onScreen = true;
        let autoPaused = false;
        let timer = 0;

        const disarm = () => {
            window.clearTimeout(timer);
            for (const t of triggers) window.removeEventListener(t, soon);
        };
        const boot = () => {
            if (booted || cancelled) return;
            booted = true;
            disarm();
            setStatus("loading");
            import("@/components/megacity/engine")
                // A background sits under copy, so it runs a touch brighter with a lighter vignette.
                .then(({ createFilm }) => createFilm(canvas, { lite, exposure: 1.45, vignette: 0.78, onPlayState: setPlaying }))
                .then((film) => {
                    if (cancelled) {
                        film.dispose();
                        return;
                    }
                    filmRef.current = film;
                    setStatus("ready");
                    if (reduce) film.seek(FILM_DURATION);
                    else if (onScreen) film.play();
                    else autoPaused = true;
                })
                .catch(() => {
                    if (!cancelled) setStatus("failed");
                });
        };
        function soon() {
            if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(boot, { timeout: 2000 });
            else window.setTimeout(boot, 50);
        }
        const arm = () => {
            timer = window.setTimeout(soon, lite ? 3500 : 900);
            for (const t of triggers) window.addEventListener(t, soon, { once: true, passive: true });
        };
        if (document.readyState === "complete") arm();
        else window.addEventListener("load", arm, { once: true });

        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                onScreen = e.isIntersecting;
                const film = filmRef.current;
                if (!film) continue;
                if (!onScreen && film.isPlaying()) {
                    film.pause();
                    autoPaused = true;
                } else if (onScreen && autoPaused && !userPaused.current && !reduce) {
                    autoPaused = false;
                    film.play();
                }
            }
        });
        io.observe(section);

        return () => {
            cancelled = true;
            disarm();
            window.removeEventListener("load", arm);
            io.disconnect();
            filmRef.current?.dispose();
            filmRef.current = null;
        };
    }, []);

    const controls = useMemo<FilmControls>(
        () => ({
            status,
            playing,
            togglePlay: () => {
                const film = filmRef.current;
                if (!film) return;
                if (film.isPlaying()) {
                    film.pause();
                    userPaused.current = true;
                } else {
                    film.play();
                    userPaused.current = false;
                }
            },
        }),
        [status, playing],
    );

    return (
        <FilmContext.Provider value={controls}>
            <section ref={sectionRef} className={className} data-film={status}>
                <div className="poster-film" aria-hidden="true">
                    {/* The opening frame, painted before the film exists; it doubles as the no-WebGL fallback. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/megacity/poster.webp" alt="" width={1600} height={900} fetchPriority="high" decoding="async" />
                    <canvas ref={canvasRef} />
                </div>
                <div className="poster-scrim" aria-hidden="true" />
                {children}
            </section>
        </FilmContext.Provider>
    );
}

interface HeroFilmControlsProps {
    playLabel: string;
    pauseLabel: string;
}

/**
 * The pause control for the background film. It stays out of sight until keyboard
 * focus reaches it — the first stop in the hero — so the hero carries no visible
 * chrome while moving content still has a pause (WCAG 2.2.2).
 */
export function HeroFilmControls({ playLabel, pauseLabel }: HeroFilmControlsProps) {
    const film = useContext(FilmContext);
    if (!film || film.status !== "ready") return null;
    const label = film.playing ? pauseLabel : playLabel;
    return (
        <button type="button" className="poster-film-pause" onClick={film.togglePlay}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
                {film.playing ? <path d="M8 5v14M16 5v14" /> : <path d="M7 5l12 7-12 7z" />}
            </svg>
            {label}
        </button>
    );
}

const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>";
const SCRAMBLE_MS = 1100;
const SCRAMBLE_STEP_MS = 45;

/**
 * Headline text that decodes over the film. The server paints the plain words; when
 * the film starts playing behind them, each letter cycles through glyphs and settles
 * left to right, so the copy "tunes in" with the picture. Hovering the headline
 * replays it. Each letter keeps its real glyph in place (hidden) under the cycling
 * one, so the line never changes width mid-scramble. Screen readers only ever get
 * the words, and reduced-motion visitors never see the scramble.
 */
export function FilmScramble({ text }: { text: string }) {
    const film = useContext(FilmContext);
    const [frame, setFrame] = useState<string[] | null>(null);
    const raf = useRef(0);
    const played = useRef(false);

    const run = useCallback(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        cancelAnimationFrame(raf.current);
        const chars = [...text];
        // Letters settle in order, each one after a short spin of its own.
        const settleAt = chars.map((_, i) => (SCRAMBLE_MS * 0.35) + (SCRAMBLE_MS * 0.65 * i) / Math.max(1, chars.length - 1));
        const start = performance.now();
        let last = -Infinity;
        const tick = (now: number) => {
            const t = now - start;
            if (t >= SCRAMBLE_MS) {
                setFrame(null);
                return;
            }
            if (now - last >= SCRAMBLE_STEP_MS) {
                last = now;
                setFrame(chars.map((c, i) => (c === " " || t >= settleAt[i] ? "" : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)])));
            }
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
    }, [text]);

    // Decode once, the moment the film starts playing behind the copy.
    useEffect(() => {
        if (played.current || !film?.playing) return;
        played.current = true;
        run();
    }, [film?.playing, run]);

    useEffect(() => () => cancelAnimationFrame(raf.current), []);

    return (
        <span className="film-scramble" onPointerEnter={(e) => e.pointerType === "mouse" && run()}>
            {frame ? (
                <>
                    <span className="sr-only">{text}</span>
                    <span aria-hidden="true">
                        {[...text].map((c, i) =>
                            frame[i] ? (
                                <span key={i} className="film-scramble-cell">
                                    <span className="film-scramble-real">{c}</span>
                                    <span className="film-scramble-glyph">{frame[i]}</span>
                                </span>
                            ) : (
                                c
                            ),
                        )}
                    </span>
                </>
            ) : (
                text
            )}
        </span>
    );
}
