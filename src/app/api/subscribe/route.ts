import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_LOCALES = new Set(['en', 'hi', 'fr', 'de', 'ar']);

/**
 * Shown when the storage backend itself is unreachable or misconfigured.
 * Deliberately different from the generic retry copy: on 2026-08-23 the Supabase
 * project behind this endpoint had been deleted (its hostname returned NXDOMAIN)
 * and every visitor saw "Failed to subscribe. Please try again." — advice that
 * could never work. Tell people the truth and give them a route that does.
 */
const OUTAGE_MESSAGE =
    'Newsletter signup is temporarily unavailable — email rohitgupta2432@gmail.com and I will add you.';

export const runtime = 'nodejs';

/** Postgres error codes that mean "the backend is broken", not "your input is bad". */
const BACKEND_FAULT_CODES = new Set([
    '42P01', // undefined_table — the subscribers table does not exist
    '42501', // insufficient_privilege — RLS or a key without insert rights
    '3D000', // invalid_catalog_name — database missing
    '28P01', // invalid_password — rotated/invalid credentials
]);

function isNetworkFailure(message: string): boolean {
    const m = message.toLowerCase();
    return (
        m.includes('fetch failed') ||
        m.includes('enotfound') ||
        m.includes('econnrefused') ||
        m.includes('getaddrinfo') ||
        m.includes('timeout') ||
        m.includes('network')
    );
}

export async function POST(request: Request) {
    let body: { email?: unknown; locale?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const localeRaw = typeof body.locale === 'string' ? body.locale : 'en';
    const locale = ALLOWED_LOCALES.has(localeRaw) ? localeRaw : 'en';

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
        return NextResponse.json(
            { success: false, error: 'Please enter a valid email address' },
            { status: 400 },
        );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        console.error('[subscribe] missing env', {
            hasUrl: Boolean(url),
            hasServiceKey: Boolean(serviceKey),
        });
        return NextResponse.json(
            { success: false, error: OUTAGE_MESSAGE },
            { status: 503 },
        );
    }

    const admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    let insertError: { code?: string; message?: string; details?: string } | null = null;
    try {
        const { error } = await admin.from('subscribers').insert([{ email, locale }]);
        insertError = error;
    } catch (thrown) {
        insertError = { message: thrown instanceof Error ? thrown.message : String(thrown) };
    }

    if (insertError) {
        if (insertError.code === '23505') {
            return NextResponse.json(
                { success: false, error: 'Email already subscribed!' },
                { status: 409 },
            );
        }

        // Log the real cause. Without this, a dead backend is indistinguishable from
        // a transient blip in the response body, and can rot unnoticed for months.
        console.error('[subscribe] insert failed', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
        });

        const message = insertError.message ?? '';
        if (
            (insertError.code && BACKEND_FAULT_CODES.has(insertError.code)) ||
            isNetworkFailure(message)
        ) {
            return NextResponse.json(
                { success: false, error: OUTAGE_MESSAGE },
                { status: 503 },
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to subscribe. Please try again.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ success: true });
}

/**
 * Coarse health probe so a dead backend surfaces before a visitor finds it.
 * Reports reachability only — never credentials, hostnames, or row data.
 * Result is cached in module scope for 60s so this cannot be used to hammer the DB.
 */
let healthCache: { at: number; status: string; ok: boolean } | null = null;

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        return NextResponse.json({ ok: false, backend: 'unconfigured' }, { status: 503 });
    }

    const now = Date.now();
    if (healthCache && now - healthCache.at < 60_000) {
        return NextResponse.json(
            { ok: healthCache.ok, backend: healthCache.status, cached: true },
            { status: healthCache.ok ? 200 : 503 },
        );
    }

    let status = 'reachable';
    let ok = true;
    try {
        const admin = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error } = await admin.from('subscribers').select('id', { head: true, count: 'exact' }).limit(1);
        if (error) {
            ok = false;
            status = isNetworkFailure(error.message ?? '') ? 'unreachable' : `error:${error.code ?? 'unknown'}`;
        }
    } catch (thrown) {
        ok = false;
        status = isNetworkFailure(thrown instanceof Error ? thrown.message : String(thrown))
            ? 'unreachable'
            : 'error';
    }

    healthCache = { at: now, status, ok };
    return NextResponse.json({ ok, backend: status }, { status: ok ? 200 : 503 });
}
