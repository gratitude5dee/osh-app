## Status check

Sections 2 (DB), 3 (edge functions), 4 (frontend), and 5 (tests) from the spec are already implemented and on disk. Verified:

- **DB**: 17 tables with RLS, `search_all` RPC, `bootstrap_default_policy` trigger, `updated_at` triggers, realtime publication on event tables.
- **Edge functions** (9): `create-stream-session`, `moderate-frame`, `obs-config`, `mux-webhook`, `playback-token`, `robots-moderate-asset`, `fal-replacement-job`, `search-index-backfill`, `models-list`.
- **Frontend**: `Auth`, `Live`, `Policy`, `Review`, `Recordings`, `Search`, `Integrations`, `Marketing` (+ shell, realtime hook, Mux playback, Recharts timeline).
- **Tests**: `mappers.test.ts`, `PolicyForm.test.tsx`, `EventStream.test.tsx`, `Search.test.tsx`.

The only spec deliverable not yet done is the **README**.

## What's left

### 1. Rewrite `README.md`
Replace the placeholder with:
- Project overview (Ohhh.SH live moderation console)
- Architecture diagram (ASCII): OBS plugin → `moderate-frame` → DB → Realtime → Console; Mux ingest → `mux-webhook` → DB; Console → `playback-token` → Mux signed playback
- **Env vars table** (runtime secrets used by edge functions):
  - `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`
  - `MUX_PLAYBACK_SIGNING_KEY_ID`, `MUX_PLAYBACK_SIGNING_PRIVATE_KEY`
  - `OVERSHOOT_API_KEY`, `FAL_KEY`, `LOVABLE_API_KEY`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Edge function reference table (path, method, auth, purpose)
- Local run instructions: `bun install` → `bun run dev`
- Test instructions: `bunx vitest run`
- Database migration note (auto-applied by Lovable Cloud)
- Out-of-scope callouts (Twitch, billing, OBS plugin source)

### 2. (Optional) Quick smoke check
Confirm tests still pass after no code changes — skip if harness already runs them.

## Out of scope

No code or schema changes — everything else from the spec is already merged.
