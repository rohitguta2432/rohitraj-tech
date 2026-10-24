/** Curated reading paths: one intent per article; shared posts can bridge topics.
 *  `code` is the route's three-letter board code on /notes. */
export const blogTopics = [
  {
    id: 'fde', code: 'FDE', name: 'Forward deployed engineering',
    description: 'Understand the role, choose an engagement and define what delivery includes.',
    articles: ['what-does-a-forward-deployed-engineer-do-2026', 'ai-project-delivery-roadmap', 'forward-deployed-engineer-hiring-process-2026', 'fractional-forward-deployed-engineer-engagement-model-2026'],
    services: [{ label: 'Hire an FDE', href: '/services/forward-deployed-engineer' }, { label: 'Fractional FDE engagement', href: '/services/fractional-forward-deployed-engineer' }],
    project: { label: 'StellarMIND: chat-to-SQL', href: '/projects/stellarmind' },
  },
  {
    id: 'ai-engineering', code: 'AIE', name: 'AI engineering',
    description: 'Scope useful AI features, integrate existing systems and agree on acceptance tests.',
    articles: ['ai-project-delivery-roadmap', 'freelance-ai-engineer-project-scope-2026', 'how-to-integrate-ai-existing-business-app', 'rag-evaluation-harness-retrieval-permissions'],
    services: [{ label: 'Work with an AI engineer', href: '/services/fractional-ai-engineer' }],
    project: { label: 'StellarMIND architecture', href: '/projects/stellarmind' },
  },
  {
    id: 'ai-consulting', code: 'AIC', name: 'AI consulting',
    description: 'Make build decisions, assess delivery risks and budget a bounded implementation.',
    articles: ['ai-project-delivery-roadmap', 'why-ai-pilots-fail-production-2026', 'rag-implementation-cost-worked-budget', 'freelance-ai-engineer-project-scope-2026'],
    services: [{ label: 'AI delivery consulting', href: '/services/fractional-ai-engineer' }, { label: 'MCP integration consulting', href: '/services/mcp-integration-consultant' }],
    project: { label: 'Review the project portfolio', href: '/projects' },
  },
  {
    id: 'rag', code: 'RAG', name: 'RAG systems',
    description: 'Build retrieval over your data, evaluate access boundaries and model operating costs.',
    articles: ['rag-evaluation-harness-retrieval-permissions', 'rag-implementation-cost-worked-budget', 'rag-for-sql', 'pinecone-vs-qdrant-vs-pgvector-india-rag-mvp-2026'],
    services: [{ label: 'Discuss a RAG implementation', href: '/services/fractional-ai-engineer' }],
    project: { label: 'StellarMIND: RAG for SQL', href: '/projects/stellarmind' },
  },
] as const;

export function getPostTopics(slug: string) {
  return blogTopics.filter((topic) => (topic.articles as readonly string[]).includes(slug));
}
