import type { Testimonial } from '@/types/testimonial';

// Real client quotes only — never placeholders. Each entry needs a real person who
// said it, their permission to publish it with their name and role, and something a
// prospect could check (a LinkedIn recommendation, a case study they signed off on).
// While this array is empty, <Testimonials /> renders nothing on every page.
export const testimonials: Testimonial[] = [];
