import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IndexRow, type Row } from "@/components/WorkIndex";
import { formatMonth, splitTitle } from "@/components/WritingIndex";
import { blogSummaries } from "@/data/blog-summaries.generated";
import type { CommonDictionary, PagesDictionary } from "@/lib/i18n";

interface NotesPageClientProps {
    commonDict: CommonDictionary;
    pagesDict: PagesDictionary;
}

/**
 * The notes index: every post, newest first, as a row of the same index the
 * home page uses. It used to be a stack of ~150 bordered cards with cover
 * images, followed by a GitHub contribution feed, repo cards and "project
 * notes" from a January snapshot that duplicated /projects; all of that is gone.
 */
export default function NotesPageClient({ commonDict, pagesDict }: NotesPageClientProps) {
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
                        {pagesDict.notes.title}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {pagesDict.notes.description}
                    </p>
                </header>

                <ol className="widx-list notes-index">
                    {rows.map((row, i) => (
                        <IndexRow key={row.id} row={row} n={i + 1} />
                    ))}
                </ol>
            </main>
            <Footer dict={commonDict} />
        </>
    );
}
