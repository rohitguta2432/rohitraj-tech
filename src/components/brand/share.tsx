/* eslint-disable @next/next/no-img-element -- satori draws <img>, not next/image */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projects } from "@/data/projects";
import { burstRays } from "@/components/brand/burst";

/*
 * The brand marks drawn for the image routes: the share cards and the app
 * icons. Server-only (it reads font files), and rendered at build time.
 * Satori cannot read globals.css, so the colours repeat its tokens.
 */
const CLOTH = "#A3290E"; // --cloth
const PAGE = "#FFFCFA"; // --bg
const INK = "#1A1512"; // --text-primary
const BODY = "#4E453D"; // --text-secondary
const MUTED = "#6E6358"; // --text-muted
const ACCENT = "#B7300F"; // --accent
const ARROW = "#A02709"; // --brand-deep, the flap board's arrow
const CREAM = "#FFF4E8"; // --on-brand
const CREAM_MUTED = "rgba(255, 244, 232, 0.82)"; // --on-cloth-muted

// The foil, flattened: satori has no conic gradients and no pointer to follow.
const FOIL =
    "radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0) 46%), linear-gradient(115deg, #ffb7cb, #ffe39a, #b9f6cf, #a3ddff, #d3b7ff)";
const WEAVE =
    "repeating-linear-gradient(0deg, rgba(40, 4, 0, 0.06) 0px, rgba(40, 4, 0, 0.06) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(255, 230, 210, 0.05) 0px, rgba(255, 230, 210, 0.05) 1px, transparent 1px, transparent 3px)";
const STITCH = "repeating-linear-gradient(180deg, rgba(255, 244, 232, 0.7) 0px, rgba(255, 244, 232, 0.7) 10px, transparent 10px, transparent 18px)";

export const SHARE_SIZE = { width: 1200, height: 630 };

const STACKS = projects.map((p) => p.techStack.length);

const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/**
 * The proof mark as an image: one ray per product, as long as its stack.
 * `lit` lights one product's ray in the accent and dims the rest, the way the
 * live mark's sweep does; `weight` thickens the strokes for small sizes.
 */
function burstImage({ color, lit, weight = 9 }: { color: string; lit?: number; weight?: number }) {
    const lines = burstRays(STACKS).map((r, i) => {
        const stroke = i === lit ? ACCENT : color;
        const opacity = lit === undefined || i === lit ? 1 : 0.3;
        return `<line x1="${r.x1}" y1="${r.y1}" x2="${r.x2}" y2="${r.y2}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${weight}" stroke-linecap="round"/>`;
    });
    return svgUri(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-160 -160 320 320">${lines.join("")}<circle r="26" fill="none" stroke="${color}" stroke-width="${weight}"/></svg>`
    );
}

const ARROW_IMAGE = svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 12h16M13 6l6 6-6 6" fill="none" stroke="${ARROW}" stroke-width="3.2" stroke-linecap="square"/></svg>`
);

/**
 * The app icon: the burst in cream on the cloth. Small sizes get rounded
 * corners for the browser tab; install sizes stay full-bleed so the platform
 * can mask them, with the burst inside the maskable safe zone.
 */
export function brandIcon(size: number) {
    const tab = size <= 48;
    const mark = Math.round(size * (tab ? 0.96 : 0.8));
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: CLOTH,
                    borderRadius: tab ? Math.round(size * 0.22) : 0,
                }}
            >
                <img src={burstImage({ color: CREAM, weight: tab ? 17 : 11 })} width={mark} height={mark} alt="" />
            </div>
        ),
        { width: size, height: size }
    );
}

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 800; style: "normal" }[]> | undefined;

// Static cuts of the site's variable faces (satori reads TTF, not woff2).
function loadFonts() {
    fonts ??= Promise.all([
        readFile(join(process.cwd(), "src/app/fonts/big-shoulders-800.ttf")),
        readFile(join(process.cwd(), "src/app/fonts/chivo-400.ttf")),
    ]).then(([display, body]) => [
        { name: "Big Shoulders", data: display, weight: 800, style: "normal" },
        { name: "Chivo", data: body, weight: 400, style: "normal" },
    ]);
    return fonts;
}

const TEXT_WIDTH = 620;
// Big Shoulders 800 caps average under 0.47em, measured. Enough to keep each
// title line on one row and the longest word unbroken.
const CAP_EM = 0.47;

function titleSize(lines: string[]) {
    const longest = Math.max(...lines.map((l) => (lines.length > 1 ? l : l.split(/\s+/).reduce((a, w) => (w.length > a.length ? w : a), "")).length));
    let size = Math.min(124, Math.floor(TEXT_WIDTH / (CAP_EM * longest)));
    // A single wrapping title (a long project name, a sentence) also has to fit
    // the page's height: at most three rows.
    if (lines.length === 1) {
        while (size > 56 && Math.ceil((CAP_EM * size * lines[0].length) / TEXT_WIDTH) > 3) size -= 4;
    }
    return size;
}

function Board({ text }: { text: string }) {
    return (
        <div style={{ display: "flex", gap: 3, padding: 4, borderRadius: 5, backgroundColor: "#110E0C" }}>
            {[...text].map((c, i) => (
                <div
                    key={i}
                    style={{
                        width: 36,
                        height: 50,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 3,
                        backgroundImage: FOIL,
                        fontFamily: "Big Shoulders",
                        fontSize: 38,
                        color: INK,
                    }}
                >
                    {c === "→" ? <img src={ARROW_IMAGE} width={24} height={24} alt="" /> : c}
                    <div style={{ position: "absolute", left: 0, right: 0, top: 24, height: 2, backgroundColor: "rgba(17, 14, 12, 0.5)" }} />
                </div>
            ))}
        </div>
    );
}

interface ShareCardProps {
    /** What the page is, in a few words. */
    kicker: string;
    /** The poster line. "\n" sets lines that must not wrap. */
    title: string;
    /** One sentence under the title. */
    line: string;
    /** A product's index in projects.ts: lights its ray on the sticker. */
    lit?: number;
}

/**
 * A 1200×630 share card that looks like the site: the header printed on the
 * cloth, one page bound into it and running off the bottom edge, and the proof
 * mark as a holographic sticker on that page.
 */
export async function shareCard({ kicker, title, line, lit }: ShareCardProps) {
    const lines = title.toUpperCase().split("\n");
    const size = titleSize(lines);
    const label = lit === undefined ? `${projects.length} running` : `${String(lit + 1).padStart(2, "0")} of ${projects.length}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: CLOTH,
                    backgroundImage: WEAVE,
                    fontFamily: "Chivo",
                    color: INK,
                }}
            >
                <div style={{ height: 112, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <Board text="BLR→YOU" />
                        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Big Shoulders" }}>
                            <div style={{ fontSize: 46, lineHeight: 1, color: CREAM }}>ROHIT RAJ</div>
                            <div style={{ fontSize: 16, lineHeight: 1, marginTop: 6, letterSpacing: 2.4, color: CREAM_MUTED }}>
                                FORWARD DEPLOYED ENGINEER
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: 24, color: CREAM_MUTED }}>rohitraj.tech</div>
                </div>

                <div style={{ position: "absolute", left: 49, top: 112, bottom: 0, width: 2, backgroundImage: STITCH }} />
                <div style={{ position: "absolute", left: 1149, top: 112, bottom: 0, width: 2, backgroundImage: STITCH }} />

                <div
                    style={{
                        flex: 1,
                        position: "relative",
                        display: "flex",
                        margin: "0 64px",
                        padding: "52px 0 0 64px",
                        backgroundColor: PAGE,
                        boxShadow: "0 0 0 1px rgba(40, 6, 0, 0.3)",
                    }}
                >
                    <div style={{ width: TEXT_WIDTH, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 24, color: MUTED }}>{kicker}</div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: 14, fontFamily: "Big Shoulders", fontSize: size, lineHeight: 0.92 }}>
                            {lines.map((l) => (
                                <div key={l}>{l}</div>
                            ))}
                        </div>
                        <div style={{ marginTop: 26, fontSize: 26, lineHeight: 1.4, color: BODY }}>{line}</div>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            right: 56,
                            top: 44,
                            width: 300,
                            height: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 150,
                            backgroundColor: "#FFFFFF",
                            boxShadow: "0 12px 26px rgba(40, 6, 0, 0.26), 0 1px 3px rgba(40, 6, 0, 0.3)",
                            transform: "rotate(-8deg)",
                        }}
                    >
                        <div
                            style={{
                                width: 276,
                                height: 276,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 138,
                                backgroundImage: FOIL,
                            }}
                        >
                            <img src={burstImage({ color: INK, lit })} width={190} height={190} alt="" />
                            <div style={{ marginTop: 4, fontFamily: "Big Shoulders", fontSize: 30, letterSpacing: 1.5 }}>{label.toUpperCase()}</div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...SHARE_SIZE, fonts: await loadFonts() }
    );
}
