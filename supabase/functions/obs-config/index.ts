import { json, options, readJson } from "../_shared/http.ts";
import { requireObsClient } from "../_shared/obs.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await readJson<{ session_id?: string }>(req) : {};
    const sessionId = body.session_id || url.searchParams.get("session_id") || "";
    if (!sessionId) return json({ error: "session_id is required." }, { status: 400 });

    await requireObsClient(req, sessionId);
    const supabase = serviceClient();
    const { data: session, error: sessionError } = await supabase
      .from("stream_sessions")
      .select("id, status, selected_model, policy_id")
      .eq("id", sessionId)
      .single();
    if (sessionError) throw sessionError;

    const { data: policy, error: policyError } = await supabase
      .from("stream_policies")
      .select("*")
      .eq("id", session.policy_id)
      .single();
    if (policyError) throw policyError;

    return json({
      session_id: session.id,
      session_status: session.status,
      model: session.selected_model || policy.model,
      prompt: policy.prompt,
      sample_fps: policy.sample_fps,
      threshold: policy.threshold,
      review_threshold: policy.review_threshold,
      block_mode: policy.block_mode,
      fail_open: policy.fail_open,
      categories: policy.categories,
      expires_at: new Date(Date.now() + 20_000).toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load OBS config.";
    return json({ error: message }, { status: message.includes("token") ? 401 : 500 });
  }
});
