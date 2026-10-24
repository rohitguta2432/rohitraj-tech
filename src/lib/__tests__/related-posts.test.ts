/** @jest-environment node */
import { getRelatedPosts } from '@/lib/related-posts';
import { blogPosts } from '@/data/blog-posts';
import { services } from '@/data/services';
import { blogTopics } from '@/data/blog-topics';
import { projects } from '@/data/projects';

const post = (slug: string, title: string, keywords: string[], date = '2026-01-01') => ({ slug, title, keywords, date });

describe('Topical article discovery', () => {
    it('keeps every curated reading path and service/project destination valid', () => {
        expect(blogTopics).toHaveLength(4);
        for (const topic of blogTopics) {
            for (const slug of topic.articles) expect(blogPosts.some((post) => post.slug === slug)).toBe(true);
            for (const link of topic.services) expect(services.some((service) => link.href === `/services/${service.slug}`)).toBe(true);
            expect(topic.project.href === '/projects' || projects.some((project) => topic.project.href === `/projects/${project.slug}`)).toBe(true);
        }
    });
    it('prefers related gateway articles over newer unrelated posts and excludes itself', () => {
        const current = post('omniroute', 'OmniRoute vs OpenRouter', ['AI gateway routing']);
        const related = post('gateways', 'OpenRouter vs LiteLLM', ['AI gateway routing']);
        const unrelated = post('mobile', 'React Native app deployment', ['mobile app development'], '2026-10-24');
        expect(getRelatedPosts(current, [unrelated, current, related])).toEqual([related]);
    });

    it('does not fill empty recommendations with unrelated articles', () => {
        const current = post('memory', 'Agent memory architecture', ['shared context']);
        expect(getRelatedPosts(current, [current, post('food', 'Restaurant booking', ['table reservation'])])).toEqual([]);
        expect(getRelatedPosts(current, [current], 0)).toEqual([]);
    });

    it('is deterministic for equal relevance and respects the requested limit', () => {
        const current = post('gateway', 'LLM gateway routing', []);
        const old = post('old', 'LLM gateway routing', [], '2026-01-01');
        const recent = post('recent', 'LLM gateway routing', [], '2026-10-24');
        expect(getRelatedPosts(current, [old, current, recent], 1)).toEqual([recent]);
    });

    it('links every curated service guide to an existing service and article', () => {
        const priorityServices = services.filter((service) => ['forward-deployed-engineer', 'fractional-ai-engineer', 'mcp-integration-consultant'].includes(service.slug));
        expect(priorityServices).toHaveLength(3);
        for (const service of priorityServices) {
            const reading = service.related?.filter((link) => link.href.startsWith('/notes/')) ?? [];
            expect(reading.length).toBeGreaterThan(0);
            for (const article of reading) {
                expect(blogPosts.some((candidate) => `/notes/${candidate.slug}` === article.href)).toBe(true);
            }
        }
    });
});
