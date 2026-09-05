import { z } from 'zod';

export const serviceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  problem: z.string().min(1),
  whatYouGet: z.array(z.string()),
  techStack: z.array(z.string()),
  timeline: z.string(),
  costRange: z.string(),
  portfolioSlugs: z.array(z.string()),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  cta: z.string(),
  /** ISO date of the last meaningful copy change — feeds sitemap lastmod. */
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** Sibling money pages / cluster notes rendered as a "Related" section. */
  related: z.array(z.object({
    href: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
  })).optional(),
});

export type Service = z.infer<typeof serviceSchema>;
