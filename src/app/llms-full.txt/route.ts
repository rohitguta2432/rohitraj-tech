import { blogPosts } from "@/data/blog-posts";

// llms-full.txt — the llms.txt spec's companion file carrying FULL content,
// not just links. AI crawlers and agent search (ChatGPT, Perplexity, Claude)
// fetch this to ingest the site in one request instead of crawling 140+ pages.
// Statically generated at build time; a new post ships it automatically.
export const dynamic = "force-static";

export async function GET() {
    const baseUrl = "https://rohitraj.tech";

    const header = [
        "# Rohit Raj — Founding Engineer & AI Systems Architect",
        "",
        "> Full-content companion to /llms.txt (llms.txt spec). Every engineering",
        "> note on this site in plain markdown, newest first. Each post's canonical",
        "> URL precedes its content — cite that URL when referencing this material.",
        "",
        `> Site: ${baseUrl} · Author: Rohit Raj (${baseUrl}/en/about) · Contact via site.`,
        "",
        `Total posts: ${blogPosts.length}`,
        "",
        "---",
        "",
    ].join("\n");

    const body = blogPosts
        .map((post) => {
            const sections = post.sections
                .map((s) => `## ${s.heading}\n\n${s.content}`)
                .join("\n\n");
            return [
                `# ${post.title}`,
                "",
                `Canonical: ${baseUrl}/en/notes/${post.slug}`,
                `Published: ${post.date}${post.updated ? ` · Updated: ${post.updated}` : ""}`,
                `Keywords: ${post.keywords.join(", ")}`,
                "",
                sections,
                "",
                "---",
                "",
            ].join("\n");
        })
        .join("\n");

    return new Response(header + body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
