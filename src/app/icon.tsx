import { brandIcon } from '@/components/brand/share';

// Every size is the site's proof mark, one ray per product in projects.ts:
// 32 for the browser tab, 192 and 512 for installs and the JSON-LD logo.
const SIZES = [32, 192, 512];

export function generateImageMetadata() {
    return SIZES.map((n) => ({ id: String(n), size: { width: n, height: n }, contentType: 'image/png' }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
    return brandIcon(Number(await id));
}
