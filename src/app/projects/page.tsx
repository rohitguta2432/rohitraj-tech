import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return createPageMetadata(
        dict.meta.projects.title,
        dict.meta.projects.description,
        '/projects'
            );
}

export default async function ProjectsPage() {
    const dict = await getDictionary();

    const activeProjects = projects.filter((p) => p.status === "active");
    const iteratingProjects = projects.filter((p) => p.status === "iterating");
    const pausedProjects = projects.filter((p) => p.status === "paused");

    return (
        <>
            <Header dict={dict.common} />
            <main id="main">
                <div className="page-header">
                    <div className="container">
                        <h1 className="page-title">{dict.pages.projects.title}</h1>
                        <p className="page-description">{dict.pages.projects.description}</p>
                    </div>
                </div>

                <section>
                    <div className="container">
                        {activeProjects.length > 0 && (
                            <>
                                <div className="section-header">
                                    <h2 className="section-title">{dict.pages.projects.active}</h2>
                                    <p className="section-description">{dict.pages.projects.activeDescription}</p>
                                </div>
                                <div className="project-grid">
                                    {activeProjects.map((project) => (
                                        <ProjectCard key={project.slug} project={project} />
                                    ))}
                                </div>
                            </>
                        )}

                        {iteratingProjects.length > 0 && (
                            <>
                                <div className="divider" />
                                <div className="section-header">
                                    <h2 className="section-title">{dict.pages.projects.iterating}</h2>
                                    <p className="section-description">{dict.pages.projects.iteratingDescription}</p>
                                </div>
                                <div className="project-grid">
                                    {iteratingProjects.map((project) => (
                                        <ProjectCard key={project.slug} project={project} />
                                    ))}
                                </div>
                            </>
                        )}

                        {pausedProjects.length > 0 && (
                            <>
                                <div className="divider" />
                                <div className="section-header">
                                    <h2 className="section-title">{dict.pages.projects.paused}</h2>
                                    <p className="section-description">{dict.pages.projects.pausedDescription}</p>
                                </div>
                                <div className="project-grid">
                                    {pausedProjects.map((project) => (
                                        <ProjectCard key={project.slug} project={project} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
