"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flaps } from "@/components/brand/Flaps";
import { burstRays, type BurstRay } from "@/components/brand/burst";

/**
 * A leader line off the tip of a ray: out along it past the longest ray, so the
 * label clears its neighbours, then level, away from the hub, ending at the stack
 * count, as in an annotated diagram.
 */
function leader(ray: BurstRay, reach: number) {
    const run = 14;
    const ex = Math.cos(ray.angle) * reach;
    const ey = Math.sin(ray.angle) * reach;
    const dir = Math.cos(ray.angle) >= -0.01 ? 1 : -1;
    return {
        x0: ray.x2,
        y0: ray.y2,
        points: `${ray.x2},${ray.y2} ${ex.toFixed(1)},${ey.toFixed(1)} ${(ex + dir * run).toFixed(1)},${ey.toFixed(1)}`,
        tx: +(ex + dir * (run + 5)).toFixed(1),
        ty: +(ey + 6).toFixed(1),
        anchor: dir > 0 ? ("start" as const) : ("end" as const),
    };
}

interface ProofMarkProps {
    products: { name: string; stack: number }[];
}

// Three seconds per ray, whatever the display's refresh rate: the board settles
// in under a second, so each name then stands readable for two more.
const MS_PER_RAY = 3000;

/**
 * The mark made of the work: one ray per product still running, as long as its
 * stack. A slow sweep lights the rays in turn and a departures board reads out
 * the product under it. Paused while off screen; with reduced motion it rests
 * on the total instead of sweeping.
 */
export default function ProofMark({ products }: ProofMarkProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [current, setCurrent] = useState<number | null>(null);
    // Stable across the re-render each readout change causes, or the sweep restarts.
    const rays = useMemo(() => burstRays(products.map((p) => p.stack)), [products]);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const lines = Array.from(svg.querySelectorAll<SVGLineElement>(".proof-ray"));
        const step = (2 * Math.PI) / lines.length;
        let sweep = -Math.PI / 2;
        let frame = 0;
        let last = -1;
        let visible = false;
        let then = 0;

        const tick = (now: number) => {
            frame = 0;
            if (!visible) return;
            // Cap the step so a tab coming back from the background does not jump.
            sweep += (Math.min(now - (then || now), 100) * step) / MS_PER_RAY;
            then = now;
            lines.forEach((line, i) => {
                const near = Math.max(0, Math.cos(rays[i].angle - sweep));
                line.style.opacity = (0.38 + 0.62 * near ** 14).toFixed(3);
            });
            const i = (((Math.round((sweep + Math.PI / 2) / step) % lines.length) + lines.length) % lines.length);
            if (i !== last) {
                last = i;
                setCurrent(i);
            }
            frame = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !frame) {
                then = 0;
                frame = requestAnimationFrame(tick);
            }
        });
        io.observe(svg);
        return () => {
            io.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [rays]);

    const label = current === null ? `${products.length} running` : products[current].name;
    const reach = useMemo(() => Math.max(...rays.map((r) => Math.hypot(r.x2, r.y2))) + 14, [rays]);
    const callout = current === null ? null : leader(rays[current], reach);

    return (
        <figure className="proof">
            <svg ref={svgRef} className="proof-burst" viewBox="-160 -160 320 320" aria-hidden="true">
                {rays.map((r, i) => (
                    <line key={i} className="proof-ray" x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
                ))}
                <circle className="proof-hub" r="26" />
                <text className="proof-count" y="10" textAnchor="middle">
                    {products.length}
                </text>
                {callout && current !== null && (
                    // Keyed to the ray, so the leader draws itself out again for each product.
                    <g key={current} className="proof-callout">
                        <circle cx={callout.x0} cy={callout.y0} r="5" />
                        <polyline points={callout.points} pathLength={1} />
                        <text x={callout.tx} y={callout.ty} textAnchor={callout.anchor}>
                            {products[current].stack} tools
                        </text>
                    </g>
                )}
            </svg>
            <figcaption className="proof-readout">
                <span className="proof-label">Running</span>
                <Flaps text={label} width={14} animate className="flaps-readout" />
                <span className="sr-only">{`${products.length} products still running, one ray each.`}</span>
            </figcaption>
        </figure>
    );
}
