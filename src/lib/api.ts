import { supabase } from "@/integrations/supabase/client";

export type CreateStreamSessionResponse = {
  session_id: string;
  provider_ready: boolean;
  provider_error: string | null;
  mux_live_stream_id: string | null;
  ingest: { rtmps_url: string | null; stream_key: string | null };
  obs: {
    client_id: string;
    delay_ms: number;
    plugin_session_token: string;
    sample_fps: number;
    block_mode: string;
    config_endpoint: string;
    moderation_endpoint: string;
  };
  playback: { playback_id: string | null; url: string | null; policy: string };
  policy: { id: string; model: string; model_status: Record<string, unknown> };
};

async function invoke<T>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || `Function ${name} failed`);
  return data as T;
}

export const api = {
  createStreamSession: (input: { policy_id?: string; title?: string }) =>
    invoke<CreateStreamSessionResponse>("create-stream-session", input),
  listModels: () => invoke<{ models: Array<{ id: string; status: string }> }>("models-list"),
  submitReplacementJob: (input: {
    review_queue_item_id?: string;
    session_id?: string;
    prompt: string;
    model_slug?: string;
    target_duration_ms?: number;
  }) => invoke<{ job_id: string; status: string }>("fal-replacement-job", input),
  playbackToken: (input: { playback_id: string }) =>
    invoke<{ token: string; expires_at: string }>("playback-token", input),
  searchAll: async (q: string) => {
    const { data, error } = await supabase.rpc("search_all", { q });
    if (error) throw error;
    return data ?? [];
  },
};
