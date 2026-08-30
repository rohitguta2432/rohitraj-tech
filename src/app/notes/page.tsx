import { getDictionary } from "@/lib/i18n";
import { createPageMetadata, generateCollectionPageSchema, SITE_CONFIG } from "@/lib/seo-config";
import { blogPosts } from "@/data/blog-posts";
import type { Metadata } from "next";
import NotesPageClient from "./NotesPageClient";


export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return createPageMetadata(
        dict.meta.notes.title,
        dict.meta.notes.description,
        '/notes'
            );
}

export default async function NotesPage() {
    const dict = await getDictionary();

    const collectionSchema = generateCollectionPageSchema({
        name: dict.meta.notes.title,
        description: dict.meta.notes.description,
        url: `${SITE_CONFIG.url}/notes`,
        items: blogPosts.map((p) => ({
            name: p.title,
            url: `${SITE_CONFIG.url}/notes/${p.slug}`,
        })),
    });
    const collectionJson = JSON.stringify(collectionSchema);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: collectionJson }}
            />
            <NotesPageClient
                commonDict={dict.common}
                pagesDict={dict.pages}
            />
        </>
    );
}
