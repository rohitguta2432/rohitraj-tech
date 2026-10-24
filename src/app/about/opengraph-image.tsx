import { shareCard } from '@/components/brand/share';

export const alt = 'About Rohit Raj — forward deployed engineer and AI consultant in Bengaluru.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return shareCard({
        kicker: 'About',
        title: 'Rohit Raj',
        line: 'Forward deployed engineer and AI consultant in Bengaluru, shipping agents and LLM features to production.',
    });
}
