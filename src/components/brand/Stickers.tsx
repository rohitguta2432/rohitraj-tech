import type { CSSProperties, ReactNode } from "react";
import { projects } from "@/data/projects";
import { burstRays } from "@/components/brand/burst";

type Shape = "round" | "pill" | "rect" | "app";

/** One die-cut holographic sticker: a cream cut margin around a foil face. */
function Sticker({ shape, tilt, size, children }: { shape: Shape; tilt: number; size?: number; children: ReactNode }) {
    const style = { "--tilt": `${tilt}deg`, ...(size ? { width: size, height: size } : {}) } as CSSProperties;
    return (
        <span className={`sticker sticker-${shape}`} style={style}>
            <span className="sticker-face holo">{children}</span>
        </span>
    );
}

const ink = { fill: "none", stroke: "currentColor", strokeLinecap: "square" as const };

const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" {...ink} strokeWidth="2.6"><circle cx="12" cy="12" r="9" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>
);
const PlugIcon = () => (
    <svg width="44" height="44" viewBox="0 0 64 64" {...ink} strokeWidth="5"><path d="M24 8v12M40 8v12" /><path d="M16 20h32v14a16 16 0 0 1-32 0z" /><path d="M32 50v10" /></svg>
);
const PinIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" {...ink} strokeWidth="2.4"><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.6" /></svg>
);
const ShellIcon = () => (
    <svg width="30" height="30" viewBox="0 0 64 64" {...ink} strokeWidth="5"><rect x="8" y="12" width="48" height="40" /><path d="M8 22h48M18 32l7 6-7 6M30 44h12" /></svg>
);

/** The proof mark, printed small: one ray per product still running. */
function BurstSticker({ tilt }: { tilt: number }) {
    const rays = burstRays(projects.map((p) => p.techStack.length));
    return (
        <Sticker shape="round" tilt={tilt} size={112}>
            <svg width="76" height="76" viewBox="-160 -160 320 320">
                {rays.map((r, i) => (
                    <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
                ))}
                <circle r="26" fill="none" stroke="currentColor" strokeWidth="9" />
            </svg>
            <b className="sticker-small">{projects.length} running</b>
        </Sticker>
    );
}

/** The full set, laid on the cloth above the footer. */
export function StickerSheet() {
    return (
        <div className="sticker-sheet" aria-hidden="true">
            <Sticker shape="round" tilt={-8} size={124}>
                <b className="sticker-big">RR</b>
                <b className="sticker-small">Fwd deployed</b>
            </Sticker>
            <Sticker shape="pill" tilt={5}><CheckIcon /><b>Evals, not vibes</b></Sticker>
            <BurstSticker tilt={-4} />
            <Sticker shape="app" tilt={9} size={96}><PlugIcon /><b>MCP</b></Sticker>
            <Sticker shape="round" tilt={11} size={96}><PinIcon /><b>BLR</b></Sticker>
            <Sticker shape="rect" tilt={6}><ShellIcon /><b>Ships to prod</b></Sticker>
        </div>
    );
}

/**
 * Two stickers slapped across the page's long edges, half on the paper and half
 * on the cloth, like stickers on a case. They sit in the page margin, which is
 * wider than half a sticker on every sheet width, so they never cover text.
 */
export function EdgeStickers() {
    return (
        <div className="edge-stickers" aria-hidden="true">
            <span className="edge-sticker edge-sticker-right">
                <Sticker shape="round" tilt={-8} size={112}>
                    <b className="sticker-big">RR</b>
                    <b className="sticker-small">Fwd deployed</b>
                </Sticker>
            </span>
            <span className="edge-sticker edge-sticker-left">
                <BurstSticker tilt={10} />
            </span>
        </div>
    );
}
