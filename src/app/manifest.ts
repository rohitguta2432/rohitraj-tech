import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Rohit Raj — Forward Deployed Engineer',
        short_name: 'Rohit Raj',
        description:
            'AI consultant · forward deployed engineer — embeds with your team and ships agents, MCP integrations, and LLM features to production, on any stack.',
        start_url: '/',
        display: 'standalone',
        // The cloth the site is bound in (--cloth), so the splash screen and the
        // browser chrome sit on the same ground as the icon.
        background_color: '#A3290E',
        theme_color: '#A3290E',
        orientation: 'portrait-primary',
        categories: ['portfolio', 'technology', 'developer'],
        icons: [
            {
                src: '/icon/192',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon/512',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon/512',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
