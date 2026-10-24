import { shareCard } from '@/components/brand/share';

export const alt = 'Hire Rohit Raj — I embed with your team and ship AI to production.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return shareCard({
        kicker: 'Hire',
        title: 'I embed with your team and ship AI to production.',
        line: 'Agents, MCP integrations and LLM features, with evals proving they work.',
    });
}
