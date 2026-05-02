import { json, options, readJson } from "../_shared/http.ts";
import { requireUser, serviceClient } from "../_shared/supabase.ts";

const FAL_BASE = "https://queue.fal.run";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "method" }, { status: 405 });
  try {
    const user = await requireUser(req);
    const body = await readJson<{
      review_queue_item_id?: string;
      session_id?: string;
      prompt: string;
      model_slug?: string;
      target_duration_ms?: number;
    }>(req);
    if (!body?.prompt) return json({ error: "prompt required" }, { status: 400 });
    const supabase = serviceClient();
    const modelSlug = body.model_slug || "fal-ai/fast-svd";
    const falKey = Deno.env.get("FAL_KEY");

    let falResponse: any = { error: "FAL_KEY not configured" };
    if (falKey) {
      const resp = await fetch(`${FAL_BASE}/${modelSlug}`, {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: body.prompt }),
      });
      falResponse = await resp.json().catch(() => ({}));
    }

    // Optionally validate ownership of the session
    if (body.session_id) {
      const { data: s } = await supabase
        .from("stream_sessions")
        .select("id")
        .eq("id", body.session_id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!s) return json({ error: "session not found" }, { status: 404 });
    }

    const { data: jobRow, error } = await supabase
      .from("fal_jobs")
      .insert({
        session_id: body.session_id ?? null,
        review_queue_item_id: body.review_queue_item_id ?? null,
        endpoint: modelSlug,
        kind: "replacement",
        status: falResponse?.error ? "failed" : "pending",
        input: { prompt: body.prompt, target_duration_ms: body.target_duration_ms ?? null },
        output: falResponse,
        fal_request_id: falResponse?.request_id ?? null,
        error: falResponse?.error ?? null,
      })
      .select("id, status")
      .single();
    if (error) throw error;

    return json({ job_id: jobRow.id, status: jobRow.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, { status: msg.includes("Unauthorized") ? 401 : 500 });
  }
});
