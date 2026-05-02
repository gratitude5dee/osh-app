-- 1. Allow all four block_mode values on stream_policies (relax any existing CHECK)
DO $$
DECLARE c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.stream_policies'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%block_mode%'
  LOOP
    EXECUTE format('ALTER TABLE public.stream_policies DROP CONSTRAINT %I', c);
  END LOOP;
END$$;

ALTER TABLE public.stream_policies
  ADD CONSTRAINT stream_policies_block_mode_check
  CHECK (block_mode IN ('blackout','hold_last_safe','slate','replace'));

-- 2. Add event_id to review_decisions (nullable; either event or queue item)
ALTER TABLE public.review_decisions
  ADD COLUMN IF NOT EXISTS event_id uuid;

ALTER TABLE public.review_decisions
  ALTER COLUMN review_queue_item_id DROP NOT NULL;

-- 3. Search RPC
CREATE OR REPLACE FUNCTION public.search_all(q text)
RETURNS TABLE (
  id uuid,
  object_type text,
  object_id text,
  title text,
  body text,
  tags text[],
  metadata jsonb,
  rank real,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id, object_type, object_id, title, body, tags, metadata,
         ts_rank(tsv, plainto_tsquery('english', q)) AS rank,
         created_at
  FROM public.search_documents
  WHERE owner_id = auth.uid()
    AND (q IS NULL OR q = '' OR tsv @@ plainto_tsquery('english', q))
  ORDER BY rank DESC NULLS LAST, created_at DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.search_all(text) TO authenticated;

-- 4. Default policy bootstrap on signup
CREATE OR REPLACE FUNCTION public.bootstrap_default_policy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.stream_policies (
    owner_id, name, prompt, model, sample_fps, threshold, review_threshold,
    block_mode, fail_open, categories
  ) VALUES (
    NEW.id,
    'Default',
    'You are a strict live broadcast safety classifier. Block explicit nudity, graphic violence, hate symbols, self-harm in progress, or weapon threats. Use review for ambiguous content.',
    'Qwen/Qwen3.5-9B',
    2,
    0.7,
    0.5,
    'blackout',
    false,
    '["sexual_explicit","graphic_nudity","violence_graphic","self_harm","hate_symbols","weapon_threat"]'::jsonb
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_default_policy ON auth.users;
CREATE TRIGGER on_auth_user_created_default_policy
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_default_policy();

-- 5. Realtime publications
DO $$
BEGIN
  PERFORM 1 FROM pg_publication WHERE pubname = 'supabase_realtime';
  IF FOUND THEN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_windows; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_sessions; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.review_queue_items; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;

ALTER TABLE public.moderation_events REPLICA IDENTITY FULL;
ALTER TABLE public.moderation_windows REPLICA IDENTITY FULL;
ALTER TABLE public.stream_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.review_queue_items REPLICA IDENTITY FULL;