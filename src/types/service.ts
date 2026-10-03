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
  /**
   * Long-form body rendered between "What You Get" and "Tech Stack", so a
   * money page carries page-specific depth instead of only the shared
   * template blocks.
   */
  sections: z.array(z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.string()),
    bullets: z.array(z.string()).optional(),
  })).optional(),
  /** Side-by-side comparison table, e.g. FDE vs agency vs in-house hire. */
  comparison: z.object({
    heading: z.string().min(1),
    intro: z.string().optional(),
    columns: z.array(z.string()).min(2),
    rows: z.array(z.array(z.string())),
  }).optional(),
  /** Concrete first-engagement shapes: what gets built and how it is judged. */
  engagementExamples: z.object({
    heading: z.string().min(1),
    intro: z.string().optional(),
    items: z.array(z.object({
      title: z.string().min(1),
      situation: z.string(),
      build: z.array(z.string()),
      doneMeans: z.string(),
    })),
  }).optional(),
  /** Sibling money pages / cluster notes rendered as a "Related" section. */
  related: z.array(z.object({
    href: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
  })).optional(),
});

export type Service = z.infer<typeof serviceSchema>;
