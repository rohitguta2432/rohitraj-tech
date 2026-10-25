"use client";

import { useEffect, useRef } from "react";

// Points per second along the rail, and per full stride (a step with each foot).
// A thigh swing of SWING degrees on an 18-point leg carries the planted foot back
// half a STRIDE, so the feet keep pace with the rail instead of skating along it.
const SPEED = 36;
const STRIDE = 24;
const SWING = 20;
// How far the knee folds to clear the rail as each foot comes forward, in degrees.
const LIFT = 34;

/** Joint positions in the drawing's own units (viewBox 0 0 64 80), facing right. */
const LEGS = {
    back: { hip: [23, 55], knee: [27.5, 64.5], ankle: [23, 73] },
    front: { hip: [32, 55], knee: [36.5, 64.5], ankle: [32, 73] },
} as const;
const LEG_LENGTH = LEGS.front.ankle[1] - LEGS.front.hip[1];

type Side = keyof typeof LEGS;

/**
 * A small walking duck robot that patrols a rail: the line its parent draws along
 * its top edge. It is drawn after Pollen Robotics' Microduck (the white-shell one):
 * a helmet head with one camera eye over an orange bill, a neck and legs of bare
 * servos, chunky orange feet. The servos carry a thin light rim, or they would
 * vanish into the night film behind them. It steps properly (thighs swing, knees fold to lift
 * each foot, feet stay level, the body dips as the legs spread), walks end to end,
 * stops to turn round, now and then stops to look about, and hops and quacks when
 * hovered. It only walks while `walking` is true (the hero ties that to the film
 * playing) and while it is on screen; with reduced motion it stands still at the
 * start of the rail. Purely decorative.
 */
export default function DuckBot({ walking }: { walking: boolean }) {
    const railRef = useRef<HTMLDivElement>(null);
    const duckRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rail = railRef.current;
        const duck = duckRef.current;
        if (!rail || !duck || !walking) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

        const part = (name: string) => duck.querySelector<SVGGElement>(`[data-part="${name}"]`)!;
        const body = part("body");
        const nod = part("nod");
        const legs = (["front", "back"] as const).map((side, i) => ({
            joints: LEGS[side],
            thigh: part(`${side}-thigh`),
            shin: part(`${side}-shin`),
            foot: part(`${side}-foot`),
            // The legs work in opposition, half a stride apart.
            offset: i * Math.PI,
        }));

        let x = Number(duck.dataset.x ?? 0);
        let dir = Number(duck.dataset.dir ?? 1);
        let phase = 0;
        // 0 standing, 1 full stride; eased, so it sets off and pulls up gently.
        let amp = 0;
        let frame = 0;
        let then = 0;
        let walkLeft = 4 + Math.random() * 5;
        let restLeft = 0;
        let turning = false;
        let visible = true;

        const pose = () => {
            for (const { joints, thigh, shin, foot, offset } of legs) {
                const q = phase + offset;
                // Positive swings the foot back; the knee folds only while the foot comes forward.
                const swing = SWING * amp * Math.sin(q);
                const lift = LIFT * amp * Math.max(0, -Math.cos(q));
                thigh.setAttribute("transform", `rotate(${swing.toFixed(2)} ${joints.hip.join(" ")})`);
                shin.setAttribute("transform", `rotate(${lift.toFixed(2)} ${joints.knee.join(" ")})`);
                foot.setAttribute("transform", `rotate(${(-swing - lift).toFixed(2)} ${joints.ankle.join(" ")})`);
            }
            // A tilted leg is shorter top to bottom, so the body drops to keep the planted foot down.
            const spread = ((SWING * amp * Math.sin(phase)) * Math.PI) / 180;
            body.setAttribute("transform", `translate(0 ${(LEG_LENGTH * (1 - Math.cos(spread))).toFixed(2)})`);
            // A small nod with each step.
            nod.setAttribute("transform", `rotate(${(-1.5 * amp * Math.sin(2 * phase)).toFixed(2)} 35 24)`);
        };

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
                if (restLeft <= 0) {
                    // Turn round only once stopped, then set off the other way.
                    if (turning) dir = -dir;
                    turning = false;
                    duck.dataset.state = "walk";
                }
            } else {
                walkLeft -= dt;
                if (walkLeft <= 0) {
                    walkLeft = 4 + Math.random() * 5;
                    restLeft = 1.2 + Math.random() * 1.2;
                    duck.dataset.state = "look";
                }
            }

            amp += ((restLeft > 0 ? 0 : 1) - amp) * Math.min(1, dt * 7);
            const step = SPEED * amp * dt;
            x += dir * step;
            phase += (step / STRIDE) * 2 * Math.PI;
            x = Math.max(0, Math.min(room, x));
            // Turn round only at the end it is walking into, not the one it is leaving.
            if ((dir > 0 && x >= room) || (dir < 0 && x <= 0)) {
                if (!turning) {
                    turning = true;
                    restLeft = Math.max(restLeft, 0.45);
                    duck.dataset.state = "stand";
                }
            }

            place();
            pose();
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
            // Stand square when the walk stops.
            amp = 0;
            pose();
            duck.dataset.state = "stand";
        };
    }, [walking]);

    const hop = () => {
        const duck = duckRef.current;
        if (!duck || duck.dataset.hop !== undefined) return;
        duck.dataset.hop = "";
        window.setTimeout(() => delete duck.dataset.hop, 560);
    };

    return (
        <div ref={railRef} className="duck-rail" aria-hidden="true">
            <div ref={duckRef} className="duck" data-state="stand" onPointerEnter={hop}>
                <svg className="duck-svg" viewBox="0 0 64 80">
                    <ellipse className="duck-ground" cx="30" cy="79.4" rx="16" ry="1.5" />
                    <g className="duck-hop">
                        <g data-part="body">
                            <Leg side="back" />

                            <path className="duck-rim duck-neck-rim" d="M31 44 L29 37 L32 30 L35 24" />
                            <path className="duck-neck" d="M31 44 L29 37 L32 30 L35 24" />
                            <circle className="duck-joint" cx="29" cy="37" r="3.3" />
                            <circle className="duck-screw" cx="29" cy="37" r="1" />
                            <circle className="duck-joint" cx="32" cy="30" r="3.3" />
                            <circle className="duck-screw" cx="32" cy="30" r="1" />

                            <rect className="duck-shell" x="13" y="40" width="28" height="15" rx="4.5" />
                            <path className="duck-seam" d="M14 48.5 H40" />
                            <rect className="duck-servo" x="18" y="51.5" width="19" height="6.5" rx="1.6" />

                            <Leg side="front" />

                            <g className="duck-head">
                                <g data-part="nod">
                                    <path className="duck-mouth" d="M31 21.4 L60.6 18.1 L60.4 21.6 L33 24.2 Z" />
                                    <g className="duck-bill">
                                        <path
                                            className="duck-orange"
                                            d="M31.5 21.6 L60.8 18.4 Q63.4 18.4 63 20.6 L62 22.9 Q47 25.6 33 25.2 Q31 24.8 31.5 21.6 Z"
                                        />
                                    </g>
                                    <path
                                        className="duck-shell"
                                        d="M27 21.8 C21.5 14.5 26 4.2 37.5 3.6 C49.5 3 58.6 8.4 61 16.4 L61 18 L30 22.2 Z"
                                    />
                                    <path className="duck-seam" d="M28.5 17.5 Q44 13.6 60 15" />
                                    <circle className="duck-eye-ring" cx="48" cy="11.6" r="5.4" />
                                    <circle className="duck-lens" cx="48" cy="11.6" r="3.5" />
                                    <circle className="duck-iris" cx="48" cy="11.6" r="2.1" />
                                    <circle className="duck-glint" cx="49.3" cy="10.3" r="1.1" />
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    );
}

/** One leg: a servo thigh with its shell panel, a shin, and a chunky foot. */
function Leg({ side }: { side: Side }) {
    const {
        hip: [hx, hy],
        knee: [kx, ky],
        ankle: [ax, ay],
    } = LEGS[side];
    return (
        <g data-part={`${side}-thigh`} className={side === "back" ? "duck-far" : undefined}>
            <path className="duck-rim duck-thigh-rim" d={`M${hx} ${hy} L${kx} ${ky}`} />
            <path className="duck-limb duck-thigh" d={`M${hx} ${hy} L${kx} ${ky}`} />
            <rect className="duck-panel" x={hx - 3.6} y={hy + 1.5} width="7.2" height="6" rx="1.8" transform={`rotate(-25 ${hx} ${hy})`} />
            <g data-part={`${side}-shin`}>
                <path className="duck-rim duck-shin-rim" d={`M${kx} ${ky} L${ax} ${ay}`} />
                <path className="duck-limb duck-shin" d={`M${kx} ${ky} L${ax} ${ay}`} />
                <g data-part={`${side}-foot`}>
                    <rect className="duck-orange" x={ax - 5} y={ay - 0.5} width="13.5" height="6" rx="2.4" />
                    <rect className="duck-sole" x={ax - 5} y={ay + 4.3} width="13.5" height="1.9" rx="0.9" />
                </g>
                <circle className="duck-joint" cx={ax} cy={ay} r="2.4" />
            </g>
            <circle className="duck-joint" cx={kx} cy={ky} r="3.4" />
            <circle className="duck-screw" cx={kx} cy={ky} r="1" />
            <circle className="duck-joint" cx={hx} cy={hy} r="3.4" />
        </g>
    );
}
