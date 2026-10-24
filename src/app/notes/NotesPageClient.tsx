import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IndexRow, type Row } from "@/components/WorkIndex";
import { formatMonth, splitTitle } from "@/components/WritingIndex";
import { blogSummaries } from "@/data/blog-summaries.generated";
import { blogTopics } from "@/data/blog-topics";
import type { CommonDictionary } from "@/lib/i18n";

interface NotesPageClientProps {
    commonDict: CommonDictionary;
}

/**
 * The notes index: the curated reading paths by topic, then every post, newest
 * first, as a row of the same index the home page uses. The posts used to be a
 * stack of ~150 bordered cards with cover images, followed by a GitHub
 * contribution feed, repo cards and "project notes" from a January snapshot
 * that duplicated /projects; all of that is gone.
 */
export default function NotesPageClient({ commonDict }: NotesPageClientProps) {
    const rows: Row[] = blogSummaries.map((post) => {
        const [name, descriptor] = splitTitle(post.title);
        return {
            id: post.slug,
            name,
            descriptor: descriptor || post.excerpt.split(/\.\s/)[0],
            note: post.readingTime,
            stack: [formatMonth(post.updated ?? post.date)],
            href: `/notes/${post.slug}`,
        };
    });

    return (
        <>
            <Header dict={commonDict} />
            <main id="main" className="sheet-notes">
                <header style={{ marginBottom: '3rem' }}>
                    <h1 className="headline" style={{ marginBottom: '0.5rem' }}>
                        AI engineering notes & guides
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Forward deployed engineering, AI consulting and RAG — with practical examples, project decisions and implementation notes.
                    </p>
                </header>

                <section aria-labelledby="topic-heading" style={{ padding: 0, marginBottom: '4rem' }}>
                    <h2 id="topic-heading" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Explore AI delivery by topic</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.25rem' }}>Practical guides for building AI systems and choosing the right engineering support.</p>
                    {/* Each topic is a reading route on the departures board: its stops
                        are the guides in order, and a guide several routes share is an
                        interchange, marked as one instead of looking like a repeat. */}
                    <div className="routes">
                        {blogTopics.map((topic) => (
                            <section key={topic.id} id={topic.id} className="route" aria-labelledby={`${topic.id}-name`}>
                                <header className="route-head">
                                    <span className="flaps route-code" aria-hidden="true">
                                        {[...topic.code].map((c, i) => (
                                            <span key={i} className="flap">{c}</span>
                                        ))}
                                    </span>
                                    <h3 id={`${topic.id}-name`} className="route-name">{topic.name}</h3>
                                </header>
                                <p className="route-desc">{topic.description}</p>
                                <ol className="route-stops">
                                    {topic.articles.map((slug) => {
                                        const post = blogSummaries.find((item) => item.slug === slug);
                                        if (!post) return null;
                                        const also = blogTopics.filter((t) => t.id !== topic.id && (t.articles as readonly string[]).includes(slug)).map((t) => t.code);
                                        return (
                                            <li key={slug} className={also.length ? "route-stop route-interchange" : "route-stop"}>
                                                <Link href={`/notes/${slug}`}>{post.title}</Link>
                                                <span className="route-meta">
                                                    {post.readingTime}
                                                    {also.length > 0 && <> · change for {also.join(", ")}</>}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ol>
                                <p className="route-onward">
                                    <span>Onward</span>
                                    <Link href={topic.project.href}>{topic.project.label}</Link>
                                    {topic.services.map((service) => (
                                        <Link key={service.href} href={service.href}>{service.label}</Link>
                                    ))}
                                </p>
                            </section>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="all-articles-heading" style={{ padding: 0 }}>
                    <h2 id="all-articles-heading" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>All articles</h2>
                    <ol className="widx-list notes-index">
                        {rows.map((row, i) => (
                            <IndexRow key={row.id} row={row} n={i + 1} />
                        ))}
                    </ol>
                </section>
            </main>
            <Footer dict={commonDict} />
        </>
    );
}
