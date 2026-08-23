import Link from "next/link";
import type { HomeDictionary } from "@/lib/i18n";
import { aiProjectSummaries } from '@/data/ai-projects';
import ShowcaseCard from "@/components/ShowcaseCard";

interface AIProjectsProps {
    dict: HomeDictionary;
    locale: string;
}

/**
 * How many projects the home page shows before handing off to /projects.
 * The full write-up for each one lives at /projects/<slug>; reprinting all of
 * them here is what made the landing page 24.7 screens tall.
 */
const TEASER_COUNT = 6;

export default function AIProjects({ dict, locale }: AIProjectsProps) {
    const shown = aiProjectSummaries.slice(0, TEASER_COUNT);
    const remaining = aiProjectSummaries.length - shown.length;

    return (
        <section id="ai-projects" className="ai-projects-section">
            <div className="container">
                <div className="ai-projects-header">
                    <span className="ai-projects-eyebrow">{dict.aiProjects.sectionTitle}</span>
                    <h2 className="ai-projects-heading">{dict.aiProjects.sectionHeading}</h2>
                    <p className="ai-projects-subheading">{dict.aiProjects.sectionDescription}</p>
                </div>

                <div className="showcase-grid">
                    {shown.map((project) => (
                        <ShowcaseCard
                            key={project.slug}
                            title={project.title}
                            href={`/${locale}/projects/${project.slug}`}
                            status={project.status}
                            highlight={
                                project.metrics?.[0]
                                    ? `${project.metrics[0].label}: ${project.metrics[0].value}`
                                    : undefined
                            }
                            techStack={project.techStack}
                            liveUrl={project.liveUrl}
                            repoUrl={project.repoUrl}
                        />
                    ))}
                </div>

                <div className="showcase-actions">
                    <Link href={`/${locale}/projects`} className="btn btn-primary">
                        {remaining > 0 ? `All ${aiProjectSummaries.length} projects` : "All projects"} &rarr;
                    </Link>
                    <Link href={`/${locale}/notes`} className="btn btn-secondary">
                        {dict.aiProjects.readNotes} &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
}
