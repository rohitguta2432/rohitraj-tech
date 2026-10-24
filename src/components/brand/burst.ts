/**
 * Geometry for the proof mark: one ray per product still running, evenly
 * spaced from 12 o'clock, each as long as that product's tech stack. Pure, so
 * the server-rendered sticker and the live mark draw the same shape.
 */
export interface BurstRay {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number;
}

export function burstRays(stackSizes: number[], inner = 40): BurstRay[] {
    return stackSizes.map((size, i) => {
        const angle = ((-90 + (i * 360) / stackSizes.length) * Math.PI) / 180;
        const outer = inner + 22 + size * 6.4;
        return {
            x1: +(Math.cos(angle) * inner).toFixed(1),
            y1: +(Math.sin(angle) * inner).toFixed(1),
            x2: +(Math.cos(angle) * outer).toFixed(1),
            y2: +(Math.sin(angle) * outer).toFixed(1),
            angle,
        };
    });
}
