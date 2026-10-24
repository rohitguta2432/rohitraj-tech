import { shareCard } from '@/components/brand/share';

export const alt = 'Contact Rohit Raj — send me the brief.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return shareCard({
        kicker: 'Contact',
        title: 'Send me the brief.',
        line: 'Call, WhatsApp, or send a brief about your project.',
    });
}
