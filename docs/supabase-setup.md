# Supabase setup for `/api/subscribe`

The newsletter form is the only thing on this site backed by Supabase. If it starts
returning "Newsletter signup is temporarily unavailable", the backend is gone or
misconfigured — this file is the fix.

## Incident 2026-08-23 — project deleted

`https://ivacwojpuhsssyfcfgjx.supabase.co` returned **NXDOMAIN**: the project no longer
existed, so every signup failed with a generic "Failed to subscribe. Please try again."
The Amplify env vars were still set and still pointed at the dead host, so nothing looked
broken from the outside. (The swarm project's Supabase host was dead too — likely the same
free-tier cleanup.)

Free-tier projects pause after ~1 week idle and are **deleted** after ~90 days paused. A
paused project still resolves in DNS and returns an error; a deleted one does not resolve
at all. `dig +short <ref>.supabase.co` returning nothing means deleted, not paused.

## Health check (no junk rows)

```bash
curl -s https://rohitraj.tech/api/subscribe | python3 -m json.tool
```

- `{"ok": true, "backend": "reachable"}` — healthy
- `{"ok": false, "backend": "unreachable"}` — project deleted, paused, or DNS gone
- `{"ok": false, "backend": "unconfigured"}` — Amplify env vars missing
- `{"ok": false, "backend": "error:42P01"}` — project alive, `subscribers` table missing

Result is cached 60s server-side. The POST path logs the real Postgres code and message
to CloudWatch under `[subscribe] insert failed`.

## Recreating the backend

1. Create a project at <https://supabase.com/dashboard>. Pick the region closest to your
   readers; note the project ref.
2. Run this in the SQL editor:

```sql
create table if not exists public.subscribers (
    id              uuid primary key default gen_random_uuid(),
    email           text not null unique,
    locale          text not null default 'en',
    subscribed_at   timestamptz not null default now(),
    is_active       boolean not null default true,
    unsubscribed_at timestamptz
);

-- The API route uses the service-role key, which bypasses RLS. Enabling RLS with no
-- permissive policy therefore keeps the table writable by the server and unreadable by
-- anyone holding the public anon key.
alter table public.subscribers enable row level security;

create index if not exists subscribers_subscribed_at_idx
    on public.subscribers (subscribed_at desc);
```

The unique constraint on `email` is what produces Postgres code `23505`, which the route
translates into the friendly "Email already subscribed!" 409.

3. Update the Amplify env vars (app `d222exnwyksjmg`, AWS profile `mine`):

```bash
aws amplify update-app --app-id d222exnwyksjmg --profile mine --environment-variables \
  NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co,\
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>,\
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`update-app` **replaces** the whole environment-variable map — pass every key you want to
keep, not just the changed ones.

4. Redeploy so the compute picks up the new values, then re-run the health check:

```bash
aws amplify start-job --app-id d222exnwyksjmg --branch-name main --job-type RELEASE --profile mine
```

## Guardrails

- `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed `NEXT_PUBLIC_` — that would ship a
  full-access key to every browser.
- Free-tier projects die from inactivity. A monthly hit on the health-check URL above is
  enough to notice, and cheap enough to wire into any existing cron.
