import { NextResponse } from 'next/server';
import {
    DynamoDBClient,
    PutItemCommand,
    DescribeTableCommand,
    ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';

/**
 * Newsletter signup.
 *
 * History worth keeping: this endpoint used to write to Supabase. On 2026-08-23 that
 * project turned out to have been deleted — its hostname returned NXDOMAIN — so every
 * signup had been failing with a generic "try again" for weeks while the pipeline
 * reported success. Storage now lives in DynamoDB in the same AWS account that already
 * hosts the site, reached with the Amplify compute role, so there is no third-party
 * project to expire and no key to rotate.
 *
 * Table: rohitraj-tech-subscribers (partition key `email`, on-demand billing)
 * Role:  rohitraj-tech-amplify-compute (dynamodb:PutItem on that table only)
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_LOCALES = new Set(['en', 'hi', 'fr', 'de', 'ar']);

const TABLE = process.env.SUBSCRIBERS_TABLE ?? 'rohitraj-tech-subscribers';
const REGION = process.env.SUBSCRIBERS_REGION ?? process.env.AWS_REGION ?? 'ap-south-1';

const OUTAGE_MESSAGE =
    'Newsletter signup is temporarily unavailable — email rohitgupta2432@gmail.com and I will add you.';

export const runtime = 'nodejs';

let client: DynamoDBClient | null = null;
function db(): DynamoDBClient {
    // Credentials come from the Amplify compute role via the default provider chain.
    if (!client) client = new DynamoDBClient({ region: REGION });
    return client;
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

    try {
        await db().send(
            new PutItemCommand({
                TableName: TABLE,
                Item: {
                    email: { S: email },
                    locale: { S: locale },
                    subscribed_at: { S: new Date().toISOString() },
                    is_active: { BOOL: true },
                },
                // Makes a repeat signup a distinguishable outcome rather than a silent overwrite.
                ConditionExpression: 'attribute_not_exists(email)',
            }),
        );
    } catch (thrown) {
        if (thrown instanceof ConditionalCheckFailedException) {
            return NextResponse.json(
                { success: false, error: 'Email already subscribed!' },
                { status: 409 },
            );
        }

        // Log the real cause. A silent generic error is exactly how the previous
        // backend stayed dead for weeks without anyone noticing.
        const err = thrown as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
        console.error('[subscribe] put failed', {
            name: err.name,
            message: err.message,
            status: err.$metadata?.httpStatusCode,
            table: TABLE,
            region: REGION,
        });

        return NextResponse.json({ success: false, error: OUTAGE_MESSAGE }, { status: 503 });
    }

    return NextResponse.json({ success: true });
}

/**
 * Coarse health probe so a dead backend surfaces before a visitor finds it.
 * Reports reachability only — never credentials or subscriber data.
 * Cached 60s in module scope so it cannot be used to hammer the table.
 */
let healthCache: { at: number; status: string; ok: boolean } | null = null;

export async function GET() {
    const now = Date.now();
    if (healthCache && now - healthCache.at < 60_000) {
        return NextResponse.json(
            { ok: healthCache.ok, backend: healthCache.status, cached: true },
            { status: healthCache.ok ? 200 : 503 },
        );
    }

    let ok = true;
    let status = 'reachable';
    try {
        const out = await db().send(new DescribeTableCommand({ TableName: TABLE }));
        if (out.Table?.TableStatus !== 'ACTIVE') {
            ok = false;
            status = `table:${out.Table?.TableStatus ?? 'unknown'}`;
        }
    } catch (thrown) {
        ok = false;
        const err = thrown as { name?: string };
        status = err.name === 'AccessDeniedException' ? 'unauthorized' : `error:${err.name ?? 'unknown'}`;
    }

    healthCache = { at: now, status, ok };
    return NextResponse.json({ ok, backend: status }, { status: ok ? 200 : 503 });
}
