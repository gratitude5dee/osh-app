# Ohhh.SH — Live Moderation Console

Web console for **Ohhh.SH**, a live-stream moderation product. Operators define
safety policies, watch live streams with real-time AI moderation overlays,
triage flagged windows, and search across recordings.

Stack: Vite + React 18 + TypeScript + Tailwind + shadcn/ui on the frontend;
Lovable Cloud (Supabase) Postgres + RLS + Edge Functions on the backend.

---

## Architecture

```text
                  ┌──────────────────┐
   OBS plugin ───▶│  moderate-frame  │──┐
   (sampled JPEG) │  (edge function) │  │
                  └──────────────────┘  │
                                        ▼
                                ┌───────────────┐
   Mux ingest ───▶ mux-webhook ▶│  Postgres +   │◀── Console (Vite)
                                │     RLS       │   • realtime events
                                └───────────────┘   • policy CRUD
                                        ▲           • review queue
                                        │           • search
                  ┌──────────────────┐  │
   fal.ai     ◀──│ fal-replacement- │──┘
   (remediation)  │      job         │
                  └──────────────────┘

   Console ──▶ playback-token ──▶ Mux signed playback (HLS)
   Console ──▶ obs-config      ──▶ OBS plugin bootstrap config
```

The browser subscribes to Postgres Realtime on `moderation_events`,
`moderation_windows`, `stream_sessions`, and `review_queue_items` for
instantaneous UI updates.

---

## Routes

| Path             | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `/`              | Marketing splash                                              |
| `/auth`          | Email + password sign-in / sign-up                            |
| `/live`          | Start a stream, watch Mux player + live event feed + timeline |
| `/policy`        | CRUD safety policies (model, fps, thresholds, categories)     |
| `/review`        | Triage queue for flagged moderation windows                   |
| `/recordings`    | List of completed Mux assets                                  |
| `/search`        | Full-text search across sessions, events, recordings          |
| `/integrations`  | OBS plugin bootstrap; Twitch placeholder                      |

---

## Edge functions

| Function                  | Method | Auth         | Purpose                                                      |
| ------------------------- | ------ | ------------ | ------------------------------------------------------------ |
| `create-stream-session`   | POST   | user JWT     | Provision a Mux live stream + DB session row                 |
| `moderate-frame`          | POST   | OBS token    | Score a sampled frame, write `moderation_events` / windows   |
| `obs-config`              | GET    | OBS token    | Returns sample fps, threshold, endpoint URLs for OBS plugin  |
| `mux-webhook`             | POST   | Mux signature| Verify + persist `video.live_stream` / `video.asset` events  |
| `playback-token`          | POST   | user JWT     | Issue Mux signed JWT (RSASSA-PKCS1-v1_5)                     |
| `robots-moderate-asset`   | POST   | user JWT     | Submit an asset to Overshoot for post-stream moderation      |
| `fal-replacement-job`     | POST   | user JWT     | Queue an async fal.ai generation for remediation             |
| `search-index-backfill`   | POST   | user JWT     | Reindex `search_documents` for the calling user              |
| `models-list`             | GET    | user JWT     | Catalog of available moderation models                       |

---

## Environment variables

All secrets are stored in Lovable Cloud (Supabase) → Project Settings → Edge
Function Secrets. They are never bundled into the frontend.

| Variable                            | Used by                              | Purpose                                  |
| ----------------------------------- | ------------------------------------ | ---------------------------------------- |
| `MUX_TOKEN_ID`                      | `create-stream-session`, `mux-webhook` | Mux API access token ID                |
| `MUX_TOKEN_SECRET`                  | `create-stream-session`, `mux-webhook` | Mux API access token secret            |
| `MUX_WEBHOOK_SECRET`                | `mux-webhook`                        | HMAC secret for Mux signature header     |
| `MUX_PLAYBACK_SIGNING_KEY_ID`       | `playback-token`                     | Mux playback signing key ID (`kid`)      |
| `MUX_PLAYBACK_SIGNING_PRIVATE_KEY`  | `playback-token`                     | RSA private key (PEM) for signed JWTs    |
| `OVERSHOOT_API_KEY`                 | `robots-moderate-asset`              | Overshoot Robots API key                 |
| `FAL_KEY`                           | `fal-replacement-job`                | fal.ai API key                           |
| `LOVABLE_API_KEY`                   | `moderate-frame` (LLM fallback)      | Lovable AI Gateway key                   |
| `SUPABASE_URL`                      | all functions                        | Project URL (auto-injected)              |
| `SUPABASE_ANON_KEY`                 | all functions                        | Public anon key (auto-injected)          |
| `SUPABASE_SERVICE_ROLE_KEY`         | privileged functions                 | Service role key (auto-injected)         |

The frontend uses only the publishable Supabase URL + anon key, exposed via
`.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

---

## Local development

```bash
bun install
bun run dev          # Vite dev server on http://localhost:8080
```

### Tests

```bash
bunx vitest run
```

Covers:
- `src/lib/mappers.test.ts` — `decisionToAction` (decision × block_mode → action)
- `src/components/policy/PolicyForm.test.tsx`
- `src/components/live/EventStream.test.tsx`
- `src/pages/Search.test.tsx`

### Database migrations

Migrations live under `supabase/migrations/` and are auto-applied by Lovable
Cloud. Schema includes 17 RLS-protected tables, a `search_all` RPC, the
`bootstrap_default_policy` trigger (seeds a policy for each new user), and
`updated_at` triggers across mutable tables.

---

## Out of scope (this build)

- The OBS plugin source lives in a separate repo — only its API contracts
  matter here (`/obs-config`, `/moderate-frame`).
- Twitch direct ingest — surfaced as "coming soon" on `/integrations`.
- Billing / usage metering — placeholder card only.
