import { projects } from '@/data/projects';
import { agents } from '@/data/agents';

/** Resolve catalog entries instead of inventing a URL from an unchecked string. */
export function getRelatedWork(post: { relatedProject?: string; relatedAgent?: string }) {
    const project = projects.find((item) => item.slug === post.relatedProject?.toLowerCase());
    if (project) return { name: project.name, href: `/projects/${project.slug}` };

    const agent = agents.find((item) => item.slug === post.relatedAgent);
    if (agent?.detailPath) return { name: agent.name, href: agent.detailPath };

    return undefined;
}
