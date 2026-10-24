import { shareCard } from '@/components/brand/share';

export const alt = 'Rohit Raj — AI consultant and forward deployed engineer. One engineer. Whole product.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return shareCard({
        kicker: 'AI consultant · forward deployed engineer',
        title: 'One engineer.\nWhole product.',
        line: 'Agents, MCP integrations and LLM features, shipped to production with evals proving they work.',
    });
}
