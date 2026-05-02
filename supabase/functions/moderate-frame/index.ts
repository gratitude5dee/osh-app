import { json, options, readJson } from "../_shared/http.ts";
import { requireObsClient } from "../_shared/obs.ts";
import { confidence, normalizeAction, normalizeDecision, stringArray } from "../_shared/policy.ts";
import { moderateFrameWithOvershoot } from "../_shared/overshoot.ts";
import { serviceClient } from "../_shared/supabase.ts";

type Body = {
  session_id?: string;
  source_ts_ms?: number;
  frame_index?: number;
  image_jpeg_base64?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });

  const started = Date.now();
  const supabase = serviceClient();

  try {
    const body = await readJson<Body>(req);
    if (!body.session_id || !body.source_ts_ms || !body.image_jpeg_base64) {
      return json({ error: "session_id, source_ts_ms, and image_jpeg_base64 are required." }, { status: 400 });
    }

    const obsClient = await requireObsClient(req, body.session_id);

    const { data: session, error: sessionError } = await supabase
      .from("stream_sessions")
      .select("id, policy_id, selected_model, status")
      .eq("id", body.session_id)
      .single();
    if (sessionError) throw sessionError;

    const { data: policy, error: policyError } = await supabase
      .from("stream_policies")
      .select("*")
      .eq("id", session.policy_id)
      .single();
    if (policyError) throw policyError;

    let rawResult: any;
    const overshootKey = Deno.env.get("OVERSHOOT_API_KEY");
    if (!overshootKey) {
      rawResult = {
        decision: policy.fail_open ? "allow" : "block",
        categories: ["integration_missing"],
        confidence: 1,
        reason: "OVERSHOOT_API_KEY is not configured.",
        recommended_action: policy.fail_open ? "none" : policy.block_mode,
      };
    } else {
      rawResult = await moderateFrameWithOvershoot({
        apiKey: overshootKey,
        model: session.selected_model || policy.model,
        prompt: policy.prompt,
        imageJpegBase64: body.image_jpeg_base64,
        timeoutMs: 1500,
      });
    }

    const decision = normalizeDecision(rawResult?.decision);
    const action = normalizeAction(rawResult?.recommended_action ?? rawResult?.action, decision, policy.block_mode);
    const score = confidence(rawResult?.confidence, decision === "allow" ? 0 : 1);
    const categories = stringArray(rawResult?.categories);
    const reason = typeof rawResult?.reason === "string" ? rawResult.reason : "";
    const latencyMs = Date.now() - started;

    const { error: insertError } = await supabase.from("moderation_events").insert({
      session_id: body.session_id,
      obs_client_id: obsClient.id,
      source_ts_ms: body.source_ts_ms,
      frame_index: body.frame_index ?? null,
      model: session.selected_model || policy.model,
      decision,
      action,
      confidence: score,
      categories,
      reason,
      latency_ms: latencyMs,
      raw_result: rawResult,
    });
    if (insertError) throw insertError;

    if (decision === "allow") {
      await supabase
        .from("moderation_windows")
        .update({ end_ts_ms: body.source_ts_ms, status: "closed" })
        .eq("session_id", body.session_id)
        .eq("status", "open");
    } else {
      const { data: openWindow } = await supabase
        .from("moderation_windows")
        .select("id, highest_confidence, categories")
        .eq("session_id", body.session_id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (openWindow) {
        await supabase.from("moderation_windows").update({
          end_ts_ms: body.source_ts_ms,
          highest_confidence: Math.max(Number(openWindow.highest_confidence ?? 0), score),
          categories: Array.from(new Set([...(openWindow.categories ?? []), ...categories])),
        }).eq("id", openWindow.id);
      } else {
        await supabase.from("moderation_windows").insert({
          session_id: body.session_id,
          start_ts_ms: body.source_ts_ms,
          end_ts_ms: body.source_ts_ms,
          highest_confidence: score,
          categories,
        });
      }
    }

    return json({ decision, action, confidence: score, categories, reason, latency_ms: latencyMs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Moderation failed.";
    return json({ error: message, decision: "block", action: "blackout", confidence: 1, categories: ["system_error"], reason: message }, { status: 500 });
  }
});
