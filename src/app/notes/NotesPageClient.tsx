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

                <section aria-labelledby="topic-heading" style={{ marginBottom: '4rem' }}>
                    <h2 id="topic-heading" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Explore AI delivery by topic</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Practical guides for building AI systems and choosing the right engineering support.</p>
                    <div className="notes-topics">
                        {blogTopics.map((topic) => (
                            <section key={topic.id} id={topic.id} className="notes-topic">
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{topic.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{topic.description}</p>
                                <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.6, margin: '1rem 0' }}>
                                    {topic.articles.map((slug) => {
                                        const post = blogSummaries.find((item) => item.slug === slug);
                                        return post ? <li key={slug} style={{ marginBottom: '0.6rem' }}><Link href={`/notes/${slug}`}>{post.title}</Link></li> : null;
                                    })}
                                </ul>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}><Link href={topic.project.href}>{topic.project.label} →</Link></p>
                                {topic.services.map((service) => <p key={service.href} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><Link href={service.href} style={{ color: 'var(--accent)' }}>{service.label} →</Link></p>)}
                            </section>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="all-articles-heading">
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
