"use client";

import { useEffect } from "react";

/**
 * Moves the light across every holographic surface (the flap board, the
 * stickers) with the pointer, through three custom properties on the root.
 * One listener, at most one style write per frame; reduced motion leaves the
 * foil lit from a fixed angle.
 */
export default function HoloLight() {
    useEffect(() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const root = document.documentElement.style;
        let frame = 0;
        let x = 0.3;
        let y = 0.25;
        const apply = () => {
            frame = 0;
            root.setProperty("--holo-x", `${(x * 100).toFixed(1)}%`);
            root.setProperty("--holo-y", `${(y * 100).toFixed(1)}%`);
            root.setProperty("--holo-a", `${Math.round(x * 300 - 60)}deg`);
        };
        const move = (e: PointerEvent) => {
            x = e.clientX / window.innerWidth;
            y = e.clientY / window.innerHeight;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => {
            window.removeEventListener("pointermove", move);
            cancelAnimationFrame(frame);
        };
    }, []);

    return null;
}
