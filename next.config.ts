import type { NextConfig } from "next";

// Google Ads conversion beacons go to the visitor's country Google domain
// (google.co.in, google.co.uk, …) and CSP can't wildcard a TLD, so list the
// domains for the geos we advertise in. Other countries still convert via
// googleadservices.com; they just lose the first-party beacon.
const googleCountryDomains = [
  'com', 'co.in', 'co.uk', 'ca', 'com.au', 'ae', 'com.sg', 'de', 'fr', 'nl', 'ie',
].map((tld) => `https://www.google.${tld}`).join(' ');

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    // Google hosts per Google's GA4 + Google Ads CSP guidance (gtag.js loads
    // from googletagmanager.com, then beacons/frames to the Ads hosts).
    value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com ${googleCountryDomains} https://api.indexnow.org https://api.openai.com https://api.anthropic.com; frame-src https://td.doubleclick.net https://bid.g.doubleclick.net https://www.googletagmanager.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests`,
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root so builds inside git worktrees don't resolve
  // files from the main checkout (multiple lockfiles confuse the inference).
  turbopack: {
    root: new URL('.', import.meta.url).pathname,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Historical article references now resolve to their catalog destinations.
      { source: '/projects/rohitrajtech', destination: '/projects/rohitraj-site', permanent: true },
      { source: '/projects/rag-for-sql', destination: '/projects/stellarmind', permanent: true },
      { source: '/projects/resolvr', destination: '/agents/resolvr', permanent: true },
      { source: '/ai-projects', destination: '/projects', permanent: true },
      // Site is English-only at bare paths now. Locale-prefixed URLs
      // (/en/*, /hi/*, …) are the previously indexed URLs — 301 them to the
      // bare path so link equity consolidates on one URL per page.
      {
        source: '/:locale(en|hi|fr|de|ar)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:locale(en|hi|fr|de|ar)/blog/:slug*',
        destination: '/notes/:slug*',
        permanent: true,
      },
      {
        source: '/:locale(en|hi|fr|de|ar)/:path*',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/notes',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/notes/:slug*',
        permanent: true,
      },
      // Weekly roundups pruned 2026-09-26 (stale news, zero impressions, never
      // crawled). Old crosspost links land on the notes hub instead of a 404.
      {
        source: '/notes/:slug(ai-dev-week-2026-22|ai-dev-week-2026-25|ai-dev-week-2026-27|ai-dev-week-2026-28|ai-dev-week-2026-29|ai-dev-week-2026-30)',
        destination: '/notes',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
