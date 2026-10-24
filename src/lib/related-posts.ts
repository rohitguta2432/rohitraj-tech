import type { BlogPost } from '@/types/blog';

type RelatedPost = Pick<BlogPost, 'slug' | 'title' | 'keywords' | 'date'>;

const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'your', 'that', 'this', 'what', 'how',
    'why', 'when', 'which', 'does', 'into', 'can', 'you', 'are', 'its', 'use',
    'guide', 'review', 'best', 'new', 'vs',
]);

function topicTerms(post: RelatedPost): Set<string> {
    const words = `${post.title} ${post.keywords.join(' ')}`.toLowerCase().match(/[a-z][a-z0-9]*/g) ?? [];
    return new Set(words.filter((word) => word.length > 2 && !stopWords.has(word)));
}

/** Recommend topical neighbours; don't send every article to the latest posts. */
export function getRelatedPosts<T extends RelatedPost>(post: T, posts: readonly T[], limit = 3): T[] {
    if (limit <= 0) return [];
    const termsByPost = posts.map((candidate) => ({ post: candidate, terms: topicTerms(candidate) }));
    const currentTerms = topicTerms(post);
    const frequency = new Map<string, number>();
    for (const { terms } of termsByPost) {
        for (const term of terms) frequency.set(term, (frequency.get(term) ?? 0) + 1);
    }

    return termsByPost
        .filter((candidate) => candidate.post.slug !== post.slug)
        .map((candidate) => {
            const shared = [...candidate.terms].filter((term) => currentTerms.has(term));
            // Rare topic terms carry more weight than site-wide words such as "coding".
            const score = shared.reduce((sum, term) => sum + Math.log(1 + posts.length / (frequency.get(term) ?? 1)), 0);
            return { post: candidate.post, shared: shared.length, score };
        })
        .filter((candidate) => candidate.shared >= 2)
        .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
        .slice(0, limit)
        .map((candidate) => candidate.post);
}
