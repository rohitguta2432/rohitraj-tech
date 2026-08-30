import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { repos } from "@/data/projects";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return createPageMetadata(
        dict.meta.repos.title,
        dict.meta.repos.description,
        '/repos'
            );
}

export default async function ReposPage() {
    const dict = await getDictionary();

    return (
        <>
            <Header dict={dict.common} />
            <main id="main">
                <div className="page-header">
                    <div className="container">
                        <h1 className="page-title">{dict.pages.repos.title}</h1>
                        <p className="page-description">{dict.pages.repos.description}</p>
                    </div>
                </div>

                <section>
                    <div className="container">
                        <div className="repo-list">
                            {repos.map((repo) => (
                                <article key={repo.name} className="repo-item">
                                    <div>
                                        <h3 className="repo-name">{repo.name}</h3>
                                        <p className="repo-description">{repo.description}</p>
                                        <div className="project-tags" style={{ marginTop: "0.75rem" }}>
                                            {repo.modules.map((mod) => (
                                                <span key={mod} className="tag">
                                                    {mod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        View ↗
                                    </a>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
