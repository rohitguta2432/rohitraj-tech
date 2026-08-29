This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

Hosted on AWS Amplify Hosting (app `d222exnwyksjmg`, `ap-south-1`). Every push to `main` triggers a build + deploy automatically — no manual deploy step.

Watch a build:

```bash
aws amplify list-jobs --app-id d222exnwyksjmg --branch-name main --profile mine
```

Note: blog posts are prerendered for `en` only (other locales render on demand) to stay under Amplify's 220 MB deploy-bundle limit — see `src/app/[locale]/notes/[slug]/page.tsx`.

---

### 🤝 Work with me

I'm an **AI Consultant · Forward Deployed Engineer** — I embed with teams and ship AI to production: agents, MCP integrations, and LLM features, with evals proving they work.

**→ [rohitraj.tech/en/hire](https://rohitraj.tech/en/hire)**
