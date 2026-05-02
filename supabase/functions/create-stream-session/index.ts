import { json, options, readJson } from "../_shared/http.ts";
import { randomToken, sha256Hex } from "../_shared/crypto.ts";
import { muxRequest, normalizeLiveStream } from "../_shared/mux.ts";
import { DEFAULT_CATEGORIES, DEFAULT_MODEL, DEFAULT_PROMPT } from "../_shared/policy.ts";
import { requireUser, serviceClient } from "../_shared/supabase.ts";
import { selectOvershootModel } from "../_shared/overshoot.ts";

type Body = {
  title?: string;
  policy_id?: string;
  policy?: {
    name?: string;
    prompt?: string;
    threshold?: number;
    review_threshold?: number;
    sample_fps?: number;
    block_mode?: string;
    fail_open?: boolean;
    categories?: string[];
  };
  latency_mode?: "standard" | "reduced" | "low";
  twitch_enabled?: boolean;
  playback_policy?: "signed" | "public";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });

  const supabase = serviceClient();

  try {
    const user = await requireUser(req);
    const body = await readJson<Body>(req);
    const title = body.title?.trim() || "Ohhh.SH live session";
    const latencyMode = body.latency_mode || "low";
    const playbackPolicy = body.playback_policy || "signed";

    let policyId = body.policy_id;
    let policy: any = null;

    if (policyId) {
      const { data, error } = await supabase
        .from("stream_policies")
        .select("*")
        .eq("id", policyId)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Policy not found." }, { status: 404 });
      policy = data;
    } else {
      const policyInput = body.policy ?? {};
      const { data, error } = await supabase
        .from("stream_policies")
        .insert({
          owner_id: user.id,
          name: policyInput.name || "Default live policy",
          prompt: policyInput.prompt || DEFAULT_PROMPT,
          model: DEFAULT_MODEL,
          sample_fps: policyInput.sample_fps ?? 4,
          threshold: policyInput.threshold ?? 0.8,
          review_threshold: policyInput.review_threshold ?? 0.6,
          block_mode: policyInput.block_mode || "hold_last_safe",
          fail_open: policyInput.fail_open ?? false,
          categories: policyInput.categories ?? DEFAULT_CATEGORIES,
        })
        .select("*")
        .single();
      if (error) throw error;
      policy = data;
      policyId = data.id;
    }

    const modelSelection = await selectOvershootModel(policy.model || DEFAULT_MODEL);
    const token = randomToken("osh_obs");
    const tokenHash = await sha256Hex(token);
    let stream: ReturnType<typeof normalizeLiveStream> | null = null;
    let muxError: string | null = null;

    try {
      const simulcastTargets = body.twitch_enabled && Deno.env.get("TWITCH_RTMP_URL") && Deno.env.get("TWITCH_STREAM_KEY")
        ? [{ url: Deno.env.get("TWITCH_RTMP_URL"), stream_key: Deno.env.get("TWITCH_STREAM_KEY"), passthrough: "twitch" }]
        : undefined;

      const muxPayload = {
        latency_mode: latencyMode,
        reconnect_window: 60,
        playback_policies: [playbackPolicy],
        new_asset_settings: { playback_policies: [playbackPolicy] },
        simulcast_targets: simulcastTargets,
        meta: { title },
      };
      const muxResponse = await muxRequest("/live-streams", {
        method: "POST",
        body: JSON.stringify(muxPayload),
      });
      stream = normalizeLiveStream(muxResponse.data);
    } catch (error) {
      muxError = error instanceof Error ? error.message : "Mux stream creation failed.";
    }

    const { data: session, error: sessionError } = await supabase
      .from("stream_sessions")
      .insert({
        owner_id: user.id,
        policy_id: policyId,
        title,
        status: stream ? "starting" : "draft",
        mux_live_stream_id: stream?.id ?? null,
        mux_playback_id: stream?.playbackId ?? null,
        mux_active_asset_id: stream?.activeAssetId ?? null,
        mux_latency_mode: latencyMode,
        mux_reconnect_window: 60,
        playback_policy: playbackPolicy,
        twitch_enabled: Boolean(body.twitch_enabled),
        obs_delay_ms: 60000,
        obs_sample_fps: policy.sample_fps,
        selected_model: modelSelection.model,
        model_status: modelSelection.status,
      })
      .select("*")
      .single();
    if (sessionError) throw sessionError;

    const { data: obsClient, error: obsError } = await supabase
      .from("obs_clients")
      .insert({
        session_id: session.id,
        token_hash: tokenHash,
        token_prefix: token.slice(0, 12),
      })
      .select("id")
      .single();
    if (obsError) throw obsError;

    if (stream) {
      await supabase.from("mux_live_streams").upsert({
        session_id: session.id,
        mux_live_stream_id: stream.id,
        status: stream.status,
        playback_id: stream.playbackId,
        active_asset_id: stream.activeAssetId,
        stream_key_last4: stream.streamKey?.slice(-4) ?? null,
        ingest_url: stream.ingest.rtmps,
        latency_mode: stream.latencyMode,
        reconnect_window: stream.reconnectWindow,
        raw: stream.raw,
      }, { onConflict: "mux_live_stream_id" });
    }

    return json({
      session_id: session.id,
      provider_ready: Boolean(stream),
      provider_error: muxError,
      mux_live_stream_id: stream?.id ?? null,
      ingest: {
        rtmps_url: stream?.ingest.rtmps ?? null,
        stream_key: stream?.streamKey ?? null,
      },
      obs: {
        client_id: obsClient.id,
        delay_ms: 60000,
        plugin_session_token: token,
        sample_fps: policy.sample_fps,
        block_mode: policy.block_mode,
        config_endpoint: `${Deno.env.get("SUPABASE_URL")}/functions/v1/obs-config`,
        moderation_endpoint: `${Deno.env.get("SUPABASE_URL")}/functions/v1/moderate-frame`,
      },
      playback: {
        playback_id: stream?.playbackId ?? null,
        url: stream?.playbackUrl ?? null,
        policy: playbackPolicy,
      },
      policy: {
        id: policyId,
        model: modelSelection.model,
        model_status: modelSelection.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create stream session.";
    return json({ error: message }, { status: message.includes("Unauthorized") ? 401 : 500 });
  }
});
