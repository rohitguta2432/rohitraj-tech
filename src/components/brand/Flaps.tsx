"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Visitor timezone → the big airport they would fly from. Intl only exposes the
// zone, so nothing is asked of the visitor and nothing leaves the page.
const AIRPORTS: Record<string, string> = {
    "America/Los_Angeles": "SFO",
    "America/Vancouver": "YVR",
    "America/Denver": "DEN",
    "America/Chicago": "ORD",
    "America/New_York": "JFK",
    "America/Toronto": "YYZ",
    "America/Sao_Paulo": "GRU",
    "Europe/London": "LHR",
    "Europe/Dublin": "DUB",
    "Europe/Paris": "CDG",
    "Europe/Berlin": "BER",
    "Europe/Amsterdam": "AMS",
    "Europe/Madrid": "MAD",
    "Europe/Stockholm": "ARN",
    "Europe/Zurich": "ZRH",
    "Asia/Dubai": "DXB",
    "Asia/Singapore": "SIN",
    "Asia/Tokyo": "HND",
    "Asia/Hong_Kong": "HKG",
    "Australia/Sydney": "SYD",
    "Australia/Melbourne": "MEL",
};

interface FlapsProps {
    text: string;
    /** Pad or cut to a fixed number of tiles, like a real board row. */
    width?: number;
    /** Roll the tiles through random letters on every change. */
    animate?: boolean;
    className?: string;
}

/**
 * A split-flap row. When `text` changes and `animate` is on, each tile rolls
 * through random letters and settles left to right, like an airport departures
 * board. Reduced motion swaps the text in place. Decorative: callers expose
 * the real text to assistive tech themselves.
 */
export function Flaps({ text, width, animate = false, className = "" }: FlapsProps) {
    const target = (width ? text.padEnd(width).slice(0, width) : text).toUpperCase();
    // The in-between letters of a roll, tagged with the text they are rolling to,
    // so a roll that a newer text interrupts is never shown.
    const [roll, setRoll] = useState<{ to: string; text: string } | null>(null);

    useEffect(() => {
        if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const steps = [...target].map((c, i) =>
            c === " " || c === "→" ? 0 : 2 + Math.floor(i * 0.6) + Math.floor(Math.random() * 3)
        );
        let n = 0;
        const id = setInterval(() => {
            n += 1;
            const settled = steps.every((s) => n >= s);
            setRoll(
                settled
                    ? null
                    : {
                          to: target,
                          text: [...target]
                              .map((c, i) => (n >= steps[i] ? c : CHARSET[Math.floor(Math.random() * CHARSET.length)]))
                              .join(""),
                      }
            );
            if (settled) clearInterval(id);
        }, 60);
        return () => clearInterval(id);
    }, [target, animate]);

    const shown = roll && roll.to === target ? roll.text : target;

    return (
        <span className={`flaps ${className}`} aria-hidden="true">
            {[...shown].map((c, i) => (
                <span key={`${i}-${c}`} className={c === "→" ? "flap flap-arrow" : "flap"}>
                    {c === " " ? " " : c}
                </span>
            ))}
        </span>
    );
}

const noSubscription = () => () => {};

const visitorAirport = () => AIRPORTS[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? "YOU";

// Read once per page load: has this browser session already watched the flip?
let flipThisLoad: boolean | undefined;
const firstLoadThisSession = () => {
    if (flipThisLoad === undefined) {
        try {
            flipThisLoad = sessionStorage.getItem("rr-flaps") !== "1";
            sessionStorage.setItem("rr-flaps", "1");
        } catch {
            flipThisLoad = true;
        }
    }
    return flipThisLoad;
};

/**
 * The logo: BLR → the visitor's own city. The server renders the destination
 * blank; hydration fills it in, which is the flip. Pages reached by in-app
 * navigation mount with the city already there, and later loads in the same
 * session skip the roll, so moving around the site is not a show every time.
 */
export function DepartureLogo() {
    const dest = useSyncExternalStore(noSubscription, visitorAirport, () => "   ");
    const animate = useSyncExternalStore(noSubscription, firstLoadThisSession, () => false);
    return <Flaps text={`BLR→${dest}`} animate={animate} className="flaps-logo" />;
}
