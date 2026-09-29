/** @jest-environment node */
import { blogPosts } from '@/data/blog-posts';
import { projects } from '@/data/projects';
import { blogPostSchema } from '@/types/blog';
import { projectSchema } from '@/types/project';
import { createPageMetadata, personSchema, professionalServiceSchema } from '@/lib/seo-config';
import { getRelatedWork } from '@/lib/related-work';

describe('SEO metadata and related-work links', () => {
    it('preserves complete descriptions in search and social metadata', () => {
        const description = 'A practical guide to integrating agents with your existing systems, covering authentication, evaluation, deployment, observability and the ownership boundaries your team needs in production.';
        const metadata = createPageMetadata('AI Integration | Rohit Raj', 'Fallback.', '/notes/integration', { metaDescription: description });
        expect(metadata.description).toBe(description);
        expect(metadata.openGraph?.description).toBe(description);
        expect(metadata.twitter?.description).toBe(description);
        expect(metadata.title).toBe('AI Integration');
        expect(metadata.openGraph?.title).toBe('AI Integration | Rohit Raj');
        expect(metadata.alternates?.canonical).toBe('https://rohitraj.tech/notes/integration');
    });

    it('links catalog projects and dedicated agent pages without inventing paths', () => {
        expect(getRelatedWork({ relatedProject: 'rohitraj-site' })?.href).toBe('/projects/rohitraj-site');
        expect(getRelatedWork({ relatedAgent: 'resolvr' })?.href).toBe('/agents/resolvr');
        expect(getRelatedWork({ relatedProject: 'not-a-project' })).toBeUndefined();
        expect(getRelatedWork({ relatedAgent: 'not-an-agent' })).toBeUndefined();
    });

    it('keeps every published article association resolvable', () => {
        for (const post of blogPosts) {
            expect(blogPostSchema.safeParse(post).success).toBe(true);
            if (post.relatedProject || post.relatedAgent) {
                expect({ slug: post.slug, resolved: Boolean(getRelatedWork(post)) })
                    .toEqual({ slug: post.slug, resolved: true });
            }
        }
        for (const project of projects) {
            expect(projectSchema.safeParse(project).success).toBe(true);
        }
    });

    it('uses the same business location without unverified coordinates', () => {
        expect(professionalServiceSchema.address).toEqual(personSchema.address);
        expect(professionalServiceSchema).not.toHaveProperty('geo');
        expect(personSchema).not.toHaveProperty('award');
    });
});
