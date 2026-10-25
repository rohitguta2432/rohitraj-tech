"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Film } from "@/components/megacity/engine";
import { FILM_DURATION, phaseAt } from "@/components/megacity/timeline";

type Status = "idle" | "loading" | "ready" | "failed";

interface FilmControls {
    status: Status;
    playing: boolean;
    togglePlay: () => void;
    /** Hear the film's clock every frame, without re-rendering anything. */
    onFrame: (listener: (t: number) => void) => () => void;
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
    const frameListeners = useRef(new Set<(t: number) => void>());
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
                .then(({ createFilm }) => createFilm(canvas, {
                    lite,
                    exposure: 1.45,
                    vignette: 0.78,
                    onPlayState: setPlaying,
                    onFrame: (t) => frameListeners.current.forEach((listener) => listener(t)),
                }),
            )
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
            onFrame: (listener) => {
                frameListeners.current.add(listener);
                return () => frameListeners.current.delete(listener);
            },
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
                <FilmHud />
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

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>";
const DIGITS = "0123456789";
// How many cycling glyphs run ahead of the decoded text.
const EDGE = 4;
const STEP_MS = 45;

/** One frame of a decode: "" shows the real letter, a glyph cycles over it, null holds its place blank. */
type Cell = string | null;

interface FilmScrambleProps {
    text: string;
    /** Wait this long after the film starts before decoding, to stagger lines. */
    delay?: number;
    /** Cycle digits only, for figures. */
    digits?: boolean;
}

/**
 * Text that decodes over the film. The server paints the plain words; when the
 * film starts playing behind them, the line clears and types back in from the
 * left behind a short edge of cycling glyphs, so the copy "tunes in" with the
 * picture. Hovering replays it. Every letter keeps its real glyph in place
 * (hidden) while it is blank or cycling, so the line never changes width.
 * Screen readers only ever get the words, and reduced-motion visitors never see
 * the decode.
 */
export function FilmScramble({ text, delay = 0, digits = false }: FilmScrambleProps) {
    const film = useContext(FilmContext);
    const [frame, setFrame] = useState<Cell[] | null>(null);
    const raf = useRef(0);
    const wait = useRef(0);
    const played = useRef(false);

    const run = useCallback(
        (after = 0) => {
            if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
            cancelAnimationFrame(raf.current);
            window.clearTimeout(wait.current);
            const chars = [...text];
            const glyphs = digits ? DIGITS : LETTERS;
            const duration = Math.min(1100, 260 + chars.length * 55);
            const blank = chars.map((c) => (c === " " ? "" : null));
            const tick = (now: number, start: number, last: number) => {
                const p = (now - start) / duration;
                if (p >= 1) {
                    setFrame(null);
                    return;
                }
                if (now - last >= STEP_MS) {
                    last = now;
                    // The edge runs from off the left to past the end, so the first
                    // and last letters both get a full spin.
                    const head = p * (chars.length + EDGE);
                    setFrame(
                        chars.map((c, i) =>
                            c === " " || i < head - EDGE ? "" : i < head ? glyphs[Math.floor(Math.random() * glyphs.length)] : null,
                        ),
                    );
                }
                raf.current = requestAnimationFrame((n) => tick(n, start, last));
            };
            const begin = () => {
                raf.current = requestAnimationFrame((now) => tick(now, now, -Infinity));
            };
            if (after > 0) {
                // Clear a staggered line with the first one, so it does not sit decoded, then blank, then decode.
                raf.current = requestAnimationFrame(() => {
                    setFrame(blank);
                    wait.current = window.setTimeout(begin, after);
                });
            } else begin();
        },
        [text, digits],
    );

    // Decode once, the moment the film starts playing behind the copy.
    useEffect(() => {
        if (played.current || !film?.playing) return;
        played.current = true;
        run(delay);
    }, [film?.playing, run, delay]);

    useEffect(
        () => () => {
            cancelAnimationFrame(raf.current);
            window.clearTimeout(wait.current);
        },
        [],
    );

    return (
        <span className="film-scramble" onPointerEnter={(e) => e.pointerType === "mouse" && run()}>
            {frame ? (
                <>
                    <span className="sr-only">{text}</span>
                    <span aria-hidden="true">
                        {[...text].map((c, i) =>
                            frame[i] === "" ? (
                                c
                            ) : (
                                <span key={i} className="film-scramble-cell">
                                    <span className="film-scramble-real">{c}</span>
                                    {frame[i] && <span className="film-scramble-glyph">{frame[i]}</span>}
                                </span>
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

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A camera operator's frame over the film: corner marks, where the shot is from,
 * and the film's own clock and chapter, read straight off the engine each frame
 * (written to the DOM, not through React state). Decorative, so hidden from
 * assistive tech; the chapter names come from the shared timeline.
 */
function FilmHud() {
    const film = useContext(FilmContext);
    const clock = useRef<HTMLSpanElement>(null);
    const onFrame = film?.onFrame;

    useEffect(() => {
        if (!onFrame) return;
        let shown = "";
        return onFrame((t) => {
            const text = `T+${pad(Math.floor(t))}.${Math.floor((t % 1) * 10)} / ${phaseAt(t).toUpperCase()}`;
            if (text !== shown && clock.current) clock.current.textContent = shown = text;
        });
    }, [onFrame]);

    return (
        <div className="poster-hud" aria-hidden="true">
            <span className="poster-hud-corner" data-at="tl" />
            <span className="poster-hud-corner" data-at="tr" />
            <span className="poster-hud-corner" data-at="bl" />
            <span className="poster-hud-corner" data-at="br" />
            <span className="poster-hud-read" data-at="tl">
                <FilmScramble text="BLR 12.97N 77.59E" delay={200} />
            </span>
            <span className="poster-hud-read" data-at="tr">
                <span className="poster-hud-live" />
                <span ref={clock}>T+00.0 / {phaseAt(0).toUpperCase()}</span>
            </span>
        </div>
    );
}
