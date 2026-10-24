import { notFound } from 'next/navigation';
import { shareCard } from '@/components/brand/share';
import { projects } from '@/data/projects';

export const alt = 'A product by Rohit Raj, forward deployed engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Image routes pass named exports through, so this renders every project's
// card once at build, like the project pages themselves.
export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

/** Cut at the last word boundary before `max` characters. */
function clip(text: string, max: number) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '')}…`;
}

/** The leading stack items that fit one line of the card. */
function fitStack(items: string[], max = 52) {
    const out: string[] = [];
    for (const item of items) {
        if ([...out, item].join('  /  ').length > max) break;
        out.push(item);
    }
    return out;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const lit = projects.findIndex((p) => p.slug === slug);
    if (lit === -1) notFound();

    const project = projects[lit];
    const [name, ...rest] = project.name.split(/\s+—\s+/);
    return shareCard({
        kicker: `Project ${String(lit + 1).padStart(2, '0')} of ${projects.length}`,
        title: name,
        line: rest.length ? rest.join(' — ') : clip(project.solves, 110),
        lit,
        stack: fitStack(project.techStack),
    });
}
