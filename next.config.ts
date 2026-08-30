import type { NextConfig } from "next";

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
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://api.indexnow.org https://api.openai.com https://api.anthropic.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests",
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
    ];
  },
};

export default nextConfig;
