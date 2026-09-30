import { NextResponse } from "next/server";
import { collect, InputError } from "@/lib/chainlens/collect";
import { buildReport, type Report } from "@/lib/chainlens/report";
import { isChainKey } from "@/lib/chainlens/chains";

export const runtime = "nodejs";
export const maxDuration = 30;

// Live scan: unlike the other agents this one reads public chain data
// (Blockscout + public JSON-RPC, no keys). Results are cached briefly and
// scans are rate-limited per IP so the demo can't be used to hammer the APIs.

const CACHE_TTL_MS = 5 * 60_000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; report: Report }>();

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return false;
}

export async function POST(request: Request) {
    let body: { address?: unknown; chain?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const input = typeof body.address === "string" ? body.address.trim() : "";
    const chain = body.chain ?? "ethereum";
    if (!input || input.length > 100) {
        return NextResponse.json({ error: "Enter a 0x… address or an ENS name" }, { status: 400 });
    }
    if (!isChainKey(chain)) {
        return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
    }

    const key = `${chain}:${input.toLowerCase()}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        return NextResponse.json({ report: cached.report, cached: true });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
        return NextResponse.json({ error: "Too many scans — try again in a minute." }, { status: 429 });
    }

    try {
        const snapshot = await collect(input, chain, { budgetMs: 22_000, timeoutMs: 8_000 });
        const report = buildReport(snapshot);
        if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
        cache.set(key, { at: Date.now(), report });
        return NextResponse.json({ report, cached: false });
    } catch (e) {
        if (e instanceof InputError) return NextResponse.json({ error: e.message }, { status: 400 });
        const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
        return NextResponse.json(
            { error: timedOut ? "The chain data source was too slow — try again." : "Chain data source unavailable — try again shortly." },
            { status: 502 },
        );
    }
}
