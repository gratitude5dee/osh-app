# Ohhh.SH Live Moderation Console — Build Plan

## Current state

The Supabase backend is partially scaffolded:
- DB has most tables: `profiles`, `teams`, `team_members`, `stream_policies`, `stream_sessions`, `obs_clients`, `moderation_events`, `moderation_windows`, `mux_assets`, `mux_live_streams`, `mux_webhook_events`, `robots_jobs`, `review_queue_items`, `review_decisions`, `fal_jobs`, `generated_replacements`, `search_documents` — all with RLS.
- Edge functions exist: `create-stream-session`, `moderate-frame`, `obs-config` (with shared helpers for crypto, Mux, Overshoot, policy, OBS auth).
- Frontend is auth + a placeholder `Index` page only.

Gaps vs. spec: missing `mux-webhook`, `robots-moderate-asset`, `fal-replacement-job`, `playback-token`, `search-index-backfill` functions; default-policy bootstrap; full console UI; tests for mappers and components; secrets configuration; small schema additions (replacements table aliasing, search RPC, default-policy trigger).

## Schema migration (single file)

Add a migration that:
1. Creates `app.search_all(q text)` RPC returning typed rows from `search_documents` filtered by `auth.uid()` ownership/team membership, ranked by `ts_rank`.
2. Adds a `bootstrap_default_team_and_policy()` trigger on `auth.users` (after `handle_new_user`) that creates a personal team + a default `stream_policies` row (`model='Qwen/Qwen3.5-9B'`, `threshold=0.7`, `sample_fps=4`, `block_mode='blackout'`, `fail_open=false`, `prompt='Detect nudity, graphic violence, hate symbols, and self-harm.'`, `name='Default'`).
3. Adds `updated_at` triggers where missing.
4. Tightens column nullability on `stream_sessions.policy_id` (nullable allowed; default lookup happens server-side).

No destructive changes; existing rows preserved.

## Secrets to add (Edge Functions)

Required before functions work end-to-end. I'll request via `add_secret` once you approve:
`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`, `MUX_PLAYBACK_SIGNING_KEY_ID`, `MUX_PLAYBACK_SIGNING_PRIVATE_KEY`, `OVERSHOOT_API_KEY`, `OVERSHOOT_BASE_URL` (optional), `FAL_KEY`, `SESSION_JWT_SECRET`.

Already present: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

## Edge functions to add

Each: CORS, Zod input validation, JWT verification (where applicable), service-role DB writes.

- **`mux-webhook`** — verify `Mux-Signature` HMAC; insert into `mux_webhook_events`; switch on event type to update `stream_sessions.status`, `mux_live_streams`, `mux_assets`; on `video.asset.ready` invoke `robots-moderate-asset`.
- **`robots-moderate-asset`** — service-only; calls Mux Robots API for an asset, persists to `robots_jobs`, on completion creates a `search_documents` row.
- **`fal-replacement-job`** — user JWT + team check; submits to Fal queue, persists `fal_jobs`; second handler (polled from frontend or webhook) finalizes and creates `generated_replacements`.
- **`playback-token`** — user JWT + RLS check; mints signed Mux playback JWT (RS256) for private playback IDs.
- **`search-index-backfill`** — service-only utility; recomputes `search_documents` rows idempotently.
- **`models-list`** (small addition) — proxy to Overshoot `/v1/models` so the policy editor never holds the Overshoot key.

Existing `create-stream-session` and `moderate-frame` will be reviewed and (if needed) reshaped to match the exact response contracts in the spec (RTMPS URL/key, session token, model, policy block).

## Frontend

### Routing & shell
- `src/App.tsx` updated to mount: `/` (marketing if unauth, redirect to `/live` if auth), `/auth`, `/live`, `/policy`, `/review`, `/recordings`, `/search`, `/integrations`, `*`.
- `src/components/shell/{AppShell,Sidebar,TopBar,TeamSwitcher}.tsx` — collapsible sidebar nav, top bar with team switcher (reads `team_members` for current user) + user menu (sign out).
- `src/hooks/{useAuth,useTeam,useRealtimeEvents}.ts`.

### Pages
- **`Marketing.tsx`** — replaces current Index welcome content; CTA → `/auth`.
- **`Live.tsx`** — three-pane:
  - Left: `StartStreamCard` (policy select, "Generate stream key" button → `createStreamSession`); after creation shows RTMPS URL + key (copy buttons), session token (collapsed), Mux player (loaded via `@mux/mux-player-react`, new dep).
  - Center: `EventStream` — Realtime subscription on `moderation_events` filtered by session.
  - Right: `LiveTimeline` — stacked bar chart from `moderation_windows` + sparkline of `latency_ms` (recharts, already installed).
- **`Policy.tsx`** — table + `PolicyForm` (CRUD on `stream_policies`); model picker fed by `models-list` function.
- **`Review.tsx`** — filters + table over `moderation_events` (decision in review/block); drawer writes `review_decisions`.
- **`Recordings.tsx`** — list `mux_assets` joined with `robots_jobs`; embedded Mux player; "Generate replacement" dialog → `fal-replacement-job`.
- **`Search.tsx`** — input → `search_all` RPC; tabs filter by `kind`; result rows link out.
- **`Integrations.tsx`** — status cards for OBS plugin (download placeholder + setup snippet), Twitch (coming soon), Mux, Overshoot (refresh models), Fal. No secret values shown.

### Lib
- `src/lib/supabase.ts` — re-export the existing client.
- `src/lib/api.ts` — typed `supabase.functions.invoke` wrappers.
- `src/lib/mappers.ts` — pure `decisionToAction` per the spec.
- `src/lib/types.ts` — local enums; defer generated types (the existing `integrations/supabase/types.ts` is auto-managed).

### Dependencies to add
- `@mux/mux-player-react` for playback embeds.

## Tests (Vitest)

- `mappers.test.ts` — table-driven coverage of `decisionToAction` (3×4×2×2).
- `PolicyForm.test.tsx` — verifies defaults (threshold 0.7, sample_fps 4, blackout, fail_open false, model `Qwen/Qwen3.5-9B`).
- `StartStreamCard.test.tsx` — disabled without policy; pending state.
- `EventStream.test.tsx` — badge color per decision.
- `SearchResults.test.tsx` — mixed-kind row rendering + empty state.

Edge function tests are skipped in this pass (would require Deno test harness and external mocking) but the function code remains exercise-able via `supabase--curl_edge_functions`.

## Out of scope (per spec)

- OBS plugin source.
- Twitch ingest (placeholder card).
- Billing UI.

## Technical notes

- Realtime: enable replication on `moderation_events` and `moderation_windows` via the migration (`alter publication supabase_realtime add table ...`).
- The existing `stream_policies.sample_fps` default is 4 — keeping that and updating spec defaults accordingly (spec said 2; will use 4 to match the existing schema unless you say otherwise).
- `block_mode` enum currently uses `'hold_last_safe'` literal; we'll align the form's RadioGroup to the four values: `blackout | hold_last_safe | slate | replace`. May require a CHECK-constraint relax migration if currently restricted.
- All Edge functions use `verify_jwt = false` config-level + in-code `getClaims()` validation, except `mux-webhook` (signature only).

## Open question

Spec says `sample_fps` default is 2; existing DB default is 4. Confirm preferred default before I run the migration (I'll default to **2** per spec unless told otherwise, and update the existing default).
