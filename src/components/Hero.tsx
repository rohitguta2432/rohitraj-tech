import ContactActions from "@/components/ContactActions";
import { FilmScramble, HeroFilm, HeroFilmControls } from "@/components/HeroFilm";
import Link from "next/link";
import type { HomeDictionary } from "@/lib/i18n";
import { projects } from "@/data/projects";
import { agents } from "@/data/agents";

interface HeroProps {
    dict: HomeDictionary;
}

const FILM_FALLBACK: NonNullable<HomeDictionary["film"]> = {
    play: "Play the background film",
    pause: "Pause the background film",
};

/**
 * Hero — the "poster" direction, now set over a live film.
 *
 * One enormous condensed headline over Megacity Awakening, a 15-second WebGL film of a
 * rainy South Asian street rebuilding itself into an AI-connected city. The headline
 * answers the objection that actually blocks hiring a solo engineer ("can one person
 * really do all of it?"); the deck and the counters answer the second one ("can I
 * check any of this?") by pointing at repos rather than asking to be believed. The
 * film is the proof of craft running underneath, and the copy reads the same without it.
 *
 * Counters are derived from the project and agent data so a hand-typed number can
 * never drift out of agreement with the index below — which is exactly what had
 * happened before (copy claimed 29, data held 26).
 */
export default function Hero({ dict }: HeroProps) {
    const documented = projects.length + agents.length;
    const film = dict.film ?? FILM_FALLBACK;

    const counters = [
        { value: String(projects.length), label: "Products still running" },
        { value: String(agents.length), label: "Agents you can try" },
        { value: String(documented), label: "Repos you can read" },
        { value: "5", label: "Days to first commit" },
    ];

    return (
        <HeroFilm className="poster">
            <div className="container poster-inner">
                <HeroFilmControls playLabel={film.play} pauseLabel={film.pause} />

                <div className="poster-body">
                    <h1 className="poster-title">
                        <FilmScramble text={dict.hero.titleLine1} />
                        <br />
                        <FilmScramble text={dict.hero.titleLine2} />
                    </h1>

                    <p className="poster-deck">{dict.hero.deck ?? dict.hero.subtitle}</p>

                    <ContactActions poster />
                    <div className="poster-actions">
                        <Link href="#work" className="poster-alt">See what shipped <span aria-hidden="true">→</span></Link>
                    </div>
                </div>

                <dl className="poster-counters">
                    {counters.map((c) => (
                        <div key={c.label} className="poster-counter">
                            <dt className="sr-only">{c.label}</dt>
                            <dd className="poster-counter-value">{c.value}</dd>
                            <dd className="poster-counter-label" aria-hidden="true">
                                {c.label}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </HeroFilm>
    );
}
