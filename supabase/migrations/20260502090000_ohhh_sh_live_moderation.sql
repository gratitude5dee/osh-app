-- Ohhh.SH live moderation foundation.

DO $$
BEGIN
  CREATE TYPE public.stream_status AS ENUM ('draft', 'starting', 'live', 'degraded', 'ended', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.moderation_decision AS ENUM ('allow', 'review', 'block');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.moderation_action AS ENUM ('none', 'blackout', 'hold_last_safe', 'slate', 'end_stream');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'escalated', 'auto_rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('owner', 'admin', 'moderator', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.stream_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'Qwen/Qwen3.5-9B',
  fallback_models TEXT[] NOT NULL DEFAULT '{}',
  sample_fps INT NOT NULL DEFAULT 4 CHECK (sample_fps BETWEEN 1 AND 10),
  threshold NUMERIC NOT NULL DEFAULT 0.8 CHECK (threshold >= 0 AND threshold <= 1),
  review_threshold NUMERIC NOT NULL DEFAULT 0.6 CHECK (review_threshold >= 0 AND review_threshold <= 1),
  block_mode TEXT NOT NULL DEFAULT 'hold_last_safe' CHECK (block_mode IN ('blackout', 'hold_last_safe', 'slate')),
  fail_open BOOLEAN NOT NULL DEFAULT false,
  categories JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.stream_policies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status public.stream_status NOT NULL DEFAULT 'draft',
  mux_live_stream_id TEXT,
  mux_playback_id TEXT,
  mux_active_asset_id TEXT,
  mux_latency_mode TEXT NOT NULL DEFAULT 'low' CHECK (mux_latency_mode IN ('standard', 'reduced', 'low')),
  mux_reconnect_window INT NOT NULL DEFAULT 60 CHECK (mux_reconnect_window BETWEEN 0 AND 1800),
  playback_policy TEXT NOT NULL DEFAULT 'signed' CHECK (playback_policy IN ('signed', 'public')),
  twitch_enabled BOOLEAN NOT NULL DEFAULT false,
  obs_delay_ms INT NOT NULL DEFAULT 60000 CHECK (obs_delay_ms >= 0),
  obs_sample_fps INT NOT NULL DEFAULT 4 CHECK (obs_sample_fps BETWEEN 1 AND 10),
  selected_model TEXT NOT NULL DEFAULT 'Qwen/Qwen3.5-9B',
  model_status JSONB NOT NULL DEFAULT '{}'::JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.obs_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.stream_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'OBS Studio',
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  config_version UUID NOT NULL DEFAULT gen_random_uuid(),
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.stream_sessions(id) ON DELETE CASCADE,
  obs_client_id UUID REFERENCES public.obs_clients(id) ON DELETE SET NULL,
  source_ts_ms BIGINT NOT NULL,
  frame_index BIGINT,
  model TEXT NOT NULL,
  decision public.moderation_decision NOT NULL,
  action public.moderation_action NOT NULL DEFAULT 'none',
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  categories TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT,
  latency_ms INT,
  raw_result JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.stream_sessions(id) ON DELETE CASCADE,
  start_ts_ms BIGINT NOT NULL,
  end_ts_ms BIGINT,
  highest_confidence NUMERIC NOT NULL DEFAULT 0 CHECK (highest_confidence >= 0 AND highest_confidence <= 1),
  categories TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mux_live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.stream_sessions(id) ON DELETE SET NULL,
  mux_live_stream_id TEXT NOT NULL UNIQUE,
  status TEXT,
  playback_id TEXT,
  active_asset_id TEXT,
  stream_key_last4 TEXT,
  ingest_url TEXT,
  latency_mode TEXT,
  reconnect_window INT,
  raw JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mux_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.stream_sessions(id) ON DELETE SET NULL,
  mux_asset_id TEXT NOT NULL UNIQUE,
  mux_live_stream_id TEXT,
  playback_id TEXT,
  status TEXT,
  duration_seconds NUMERIC,
  playback_policy TEXT NOT NULL DEFAULT 'signed',
  raw JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mux_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mux_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  object_id TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.robots_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mux_asset_id TEXT NOT NULL,
  asset_row_id UUID REFERENCES public.mux_assets(id) ON DELETE SET NULL,
  workflow TEXT NOT NULL DEFAULT 'moderate',
  status public.job_status NOT NULL DEFAULT 'pending',
  mux_job_id TEXT UNIQUE,
  thresholds JSONB NOT NULL DEFAULT '{"sexual":0.7,"violence":0.8}'::JSONB,
  sampling_interval INT,
  max_samples INT,
  max_scores JSONB,
  thumbnail_scores JSONB,
  exceeds_threshold BOOLEAN,
  units_consumed INT,
  error TEXT,
  raw_result JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.review_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.stream_sessions(id) ON DELETE SET NULL,
  moderation_window_id UUID REFERENCES public.moderation_windows(id) ON DELETE SET NULL,
  mux_asset_id TEXT,
  robots_job_id UUID REFERENCES public.robots_jobs(id) ON DELETE SET NULL,
  status public.review_status NOT NULL DEFAULT 'pending',
  priority INT NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_queue_item_id UUID NOT NULL REFERENCES public.review_queue_items(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision public.review_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fal_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_queue_item_id UUID REFERENCES public.review_queue_items(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.stream_sessions(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'replacement',
  endpoint TEXT NOT NULL,
  status public.job_status NOT NULL DEFAULT 'pending',
  fal_request_id TEXT,
  input JSONB NOT NULL DEFAULT '{}'::JSONB,
  output JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.generated_replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fal_job_id UUID REFERENCES public.fal_jobs(id) ON DELETE SET NULL,
  review_queue_item_id UUID REFERENCES public.review_queue_items(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'video_replacement',
  source_url TEXT,
  output_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.search_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.stream_sessions(id) ON DELETE CASCADE,
  mux_asset_id TEXT,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  title TEXT,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  tsv TSVECTOR NOT NULL DEFAULT ''::TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (object_type, object_id)
);

CREATE OR REPLACE FUNCTION public.update_search_documents_tsv()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.tsv = to_tsvector(
    'english',
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.body, '') || ' ' || array_to_string(NEW.tags, ' ')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_search_documents_tsv ON public.search_documents;
CREATE TRIGGER update_search_documents_tsv
BEFORE INSERT OR UPDATE ON public.search_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_search_documents_tsv();

CREATE INDEX IF NOT EXISTS teams_owner_id_idx ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS stream_policies_owner_id_idx ON public.stream_policies(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stream_sessions_owner_created_idx ON public.stream_sessions(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stream_sessions_status_idx ON public.stream_sessions(status);
CREATE INDEX IF NOT EXISTS obs_clients_session_id_idx ON public.obs_clients(session_id);
CREATE INDEX IF NOT EXISTS moderation_events_session_created_idx ON public.moderation_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_events_session_decision_idx ON public.moderation_events(session_id, decision, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_windows_session_status_idx ON public.moderation_windows(session_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS mux_assets_mux_asset_id_idx ON public.mux_assets(mux_asset_id);
CREATE INDEX IF NOT EXISTS robots_jobs_asset_workflow_status_idx ON public.robots_jobs(mux_asset_id, workflow, status);
CREATE INDEX IF NOT EXISTS review_queue_status_created_idx ON public.review_queue_items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS fal_jobs_status_created_idx ON public.fal_jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS search_documents_tsv_idx ON public.search_documents USING GIN(tsv);
CREATE INDEX IF NOT EXISTS search_documents_owner_created_idx ON public.search_documents(owner_id, created_at DESC);

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'teams', 'team_members', 'stream_policies', 'stream_sessions', 'obs_clients',
    'moderation_windows', 'mux_live_streams', 'mux_assets', 'robots_jobs',
    'review_queue_items', 'fal_jobs'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      tbl,
      tbl
    );
  END LOOP;
END $$;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obs_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mux_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mux_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mux_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robots_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fal_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their teams" ON public.teams;
CREATE POLICY "Users can manage their teams" ON public.teams
FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view team memberships" ON public.team_members;
CREATE POLICY "Users can view team memberships" ON public.team_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Team owners can manage memberships" ON public.team_members;
CREATE POLICY "Team owners can manage memberships" ON public.team_members
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their policies" ON public.stream_policies;
CREATE POLICY "Users can manage their policies" ON public.stream_policies
FOR ALL TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = stream_policies.team_id AND tm.user_id = auth.uid())
)
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their stream sessions" ON public.stream_sessions;
CREATE POLICY "Users can manage their stream sessions" ON public.stream_sessions
FOR ALL TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = stream_sessions.team_id AND tm.user_id = auth.uid())
)
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their obs clients" ON public.obs_clients;
CREATE POLICY "Users can view their obs clients" ON public.obs_clients
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view moderation events for their sessions" ON public.moderation_events;
CREATE POLICY "Users can view moderation events for their sessions" ON public.moderation_events
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view moderation windows for their sessions" ON public.moderation_windows;
CREATE POLICY "Users can view moderation windows for their sessions" ON public.moderation_windows
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view mux live streams for their sessions" ON public.mux_live_streams;
CREATE POLICY "Users can view mux live streams for their sessions" ON public.mux_live_streams
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view mux assets for their sessions" ON public.mux_assets;
CREATE POLICY "Users can view mux assets for their sessions" ON public.mux_assets
FOR SELECT TO authenticated
USING (
  session_id IS NULL
  OR EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view robots jobs for their assets" ON public.robots_jobs;
CREATE POLICY "Users can view robots jobs for their assets" ON public.robots_jobs
FOR SELECT TO authenticated
USING (
  asset_row_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.mux_assets a
    JOIN public.stream_sessions s ON s.id = a.session_id
    WHERE a.id = asset_row_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage their review queue" ON public.review_queue_items;
CREATE POLICY "Users can manage their review queue" ON public.review_queue_items
FOR ALL TO authenticated
USING (
  session_id IS NULL
  OR EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid())
)
WITH CHECK (
  session_id IS NULL
  OR EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create review decisions" ON public.review_decisions;
CREATE POLICY "Users can create review decisions" ON public.review_decisions
FOR INSERT TO authenticated
WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Users can view review decisions" ON public.review_decisions;
CREATE POLICY "Users can view review decisions" ON public.review_decisions
FOR SELECT TO authenticated
USING (
  reviewer_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.review_queue_items q
    LEFT JOIN public.stream_sessions s ON s.id = q.session_id
    WHERE q.id = review_queue_item_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view fal jobs for their sessions" ON public.fal_jobs;
CREATE POLICY "Users can view fal jobs for their sessions" ON public.fal_jobs
FOR SELECT TO authenticated
USING (
  session_id IS NULL
  OR EXISTS (SELECT 1 FROM public.stream_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view generated replacements" ON public.generated_replacements;
CREATE POLICY "Users can view generated replacements" ON public.generated_replacements
FOR SELECT TO authenticated
USING (
  review_queue_item_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.review_queue_items q
    LEFT JOIN public.stream_sessions s ON s.id = q.session_id
    WHERE q.id = review_queue_item_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can search their documents" ON public.search_documents;
CREATE POLICY "Users can search their documents" ON public.search_documents
FOR SELECT TO authenticated
USING (owner_id = auth.uid());

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
