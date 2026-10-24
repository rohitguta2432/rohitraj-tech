/**
 * Timeline facts shared by the film engine and its controls.
 *
 * Kept in its own module, free of three.js, so the landing-page component can
 * label the scrubber without pulling the engine (and three.js) into the page's
 * first bundle — the engine is only ever loaded through a dynamic import.
 */
export const FILM_DURATION = 15;

export const FILM_PHASES: ReadonlyArray<readonly [number, string]> = [
    [0, "Today"],
    [3, "First signs"],
    [6, "Acceleration"],
    [10, "Full city"],
    [13, "Reveal"],
];

export function phaseAt(t: number): string {
    let name = FILM_PHASES[0][1];
    for (const [start, label] of FILM_PHASES) if (t >= start) name = label;
    return name;
}
