// Synced from github.com/rohitguta2432/chainlens (src/http.ts) — edit there, then run scripts/sync-to-site.sh.
// Tiny fetch helpers: per-request timeout, one polite retry on 429/5xx, and an
// optional outer AbortSignal so a whole scan can be cancelled on a budget.

const USER_AGENT = "chainlens/0.1 (+https://github.com/rohitguta2432/chainlens)";

export class HttpError extends Error {
    constructor(
        message: string,
        readonly status?: number,
    ) {
        super(message);
        this.name = "HttpError";
    }
}

export interface RequestOptions {
    timeoutMs?: number;
    retries?: number;
    signal?: AbortSignal;
}

function withTimeout(timeoutMs: number, outer?: AbortSignal): AbortSignal {
    const t = AbortSignal.timeout(timeoutMs);
    return outer ? AbortSignal.any([outer, t]) : t;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getJson<T = unknown>(url: string, opts: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 8000, retries = 1, signal } = opts;
    let lastError: unknown = new HttpError(`request failed: ${url}`);
    for (let attempt = 0; attempt <= retries; attempt++) {
        if (signal?.aborted) throw signal.reason ?? new HttpError("aborted");
        try {
            const res = await fetch(url, {
                headers: { accept: "application/json", "user-agent": USER_AGENT },
                signal: withTimeout(timeoutMs, signal),
            });
            if (res.status === 429 || res.status >= 500) {
                lastError = new HttpError(`HTTP ${res.status} from ${new URL(url).host}`, res.status);
                await sleep(500 * (attempt + 1));
                continue;
            }
            if (!res.ok) throw new HttpError(`HTTP ${res.status} from ${new URL(url).host}`, res.status);
            return (await res.json()) as T;
        } catch (e) {
            // 4xx other than 429 is a definitive answer — don't retry it.
            if (e instanceof HttpError && e.status !== undefined && e.status < 500 && e.status !== 429) throw e;
            lastError = e;
        }
    }
    throw lastError;
}

export async function postJson<T = unknown>(url: string, body: unknown, opts: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 8000, signal } = opts;
    const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": USER_AGENT },
        body: JSON.stringify(body),
        signal: withTimeout(timeoutMs, signal),
    });
    if (!res.ok) throw new HttpError(`HTTP ${res.status} from ${new URL(url).host}`, res.status);
    return (await res.json()) as T;
}

/** Run async jobs with bounded concurrency; failures resolve to undefined. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<(R | undefined)[]> {
    const out: (R | undefined)[] = new Array(items.length);
    let next = 0;
    async function worker() {
        while (next < items.length) {
            const i = next++;
            try {
                out[i] = await fn(items[i]);
            } catch {
                out[i] = undefined;
            }
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return out;
}
