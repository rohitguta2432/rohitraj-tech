import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { blogPosts } from "@/data/blog-posts";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://rohitraj.tech";
    const now = new Date();

    // Static routes — anchor bumps when the homepage/static sections get a meaningful update
    const staticAnchor = new Date("2026-08-29");
    const staticRoutes = [
        "",
        "/about",
        "/contact",
        "/hire",
        "/agents",
        "/agents/resolvr",
        "/projects",
        "/repos",
        "/notes",
        "/reliability",
        "/reliability/api-testing",
        "/reliability/kafka-testing",
        "/reliability/load-testing",
        "/reliability/observability",
    ];

    const projectRoutes = projects.map((project) => `/projects/${project.slug}`);
    const serviceRoutes = ["/services", ...services.map((service) => `/services/${service.slug}`)];

    // Hub routes are generated from data files, so their real lastmod is the
    // freshest item they list — not the date someone last touched the page
    // component. Deriving it keeps these dates honest without anyone
    // remembering to bump an anchor.
    const maxDate = (dates: Date[], fallback: Date) =>
        dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : fallback;

    // Build a slug → real-date map for projects that carry an explicit `updated`
    // date, so a newly added project advertises a real lastmod instead of the
    // static anchor. Google treats a stale lastmod on a brand-new URL as a
    // reason to deprioritise the recrawl.
    const projectDateBySlug = new Map<string, Date>();
    for (const project of projects) {
        if (project.updated) projectDateBySlug.set(project.slug, new Date(project.updated));
    }

    // Build a slug → real-date map for posts so each post has its own lastModified
    const postDateBySlug = new Map<string, Date>();
    for (const post of blogPosts) {
        const real = post.updated ?? post.date;
        if (real) postDateBySlug.set(post.slug, new Date(real));
    }
    const blogRoutes = blogPosts.map((post) => `/notes/${post.slug}`);

    const latestProjectDate = maxDate([...projectDateBySlug.values()], staticAnchor);
    const latestPostDate = maxDate([...postDateBySlug.values()], staticAnchor);
    const hubDates: Record<string, Date> = {
        "": maxDate([latestProjectDate, latestPostDate], staticAnchor),
        "/projects": latestProjectDate,
        "/repos": latestProjectDate,
        "/notes": latestPostDate,
    };

    const allRoutes = [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...blogRoutes];

    const sitemap: MetadataRoute.Sitemap = [];

    for (const route of allRoutes) {
        let lastModified: Date = hubDates[route] ?? staticAnchor;
        if (route.startsWith("/notes/")) {
            const slug = route.replace("/notes/", "");
            lastModified = postDateBySlug.get(slug) ?? now;
        } else if (route.startsWith("/projects/")) {
            const slug = route.replace("/projects/", "");
            lastModified = projectDateBySlug.get(slug) ?? staticAnchor;
        } else if (route.startsWith("/services/")) {
            lastModified = staticAnchor;
        }

        sitemap.push({
            url: `${baseUrl}${route}`,
            lastModified,
        });
    }

    return sitemap;
}
