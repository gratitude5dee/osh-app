import { json, options } from "../_shared/http.ts";
import { serviceClient } from "../_shared/supabase.ts";

async function verifyMuxSignature(req: Request, raw: string): Promise<boolean> {
  const secret = Deno.env.get("MUX_WEBHOOK_SECRET");
  if (!secret) return true; // no secret configured → accept (dev)
  const header = req.headers.get("mux-signature") || "";
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  if (!parts.t || !parts.v1) return false;
  const signed = `${parts.t}.${raw}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === parts.v1;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "method" }, { status: 405 });

  const raw = await req.text();
  const ok = await verifyMuxSignature(req, raw);
  const supabase = serviceClient();

  let payload: any = {};
  try { payload = JSON.parse(raw); } catch { /* ignore */ }

  const eventType = payload?.type ?? "unknown";
  const objectId = payload?.object?.id ?? payload?.data?.id ?? null;

  await supabase.from("mux_webhook_events").insert({
    mux_event_id: payload?.id ?? null,
    event_type: eventType,
    object_id: objectId,
    payload,
    verified: ok,
  });

  if (!ok) return json({ error: "invalid signature" }, { status: 401 });

  try {
    if (eventType === "video.live_stream.active" || eventType === "video.live_stream.idle" || eventType === "video.live_stream.disconnected") {
      const status = eventType === "video.live_stream.active" ? "live"
        : eventType === "video.live_stream.idle" ? "idle"
        : "disconnected";
      await supabase.from("mux_live_streams")
        .update({ status, raw: payload?.data ?? payload })
        .eq("mux_live_stream_id", objectId);
      const newSessionStatus = status === "live" ? "live" : status === "idle" ? "ended" : "errored";
      await supabase.from("stream_sessions")
        .update({ status: newSessionStatus, ...(status === "live" ? { started_at: new Date().toISOString() } : { ended_at: new Date().toISOString() }) })
        .eq("mux_live_stream_id", objectId);
    } else if (eventType === "video.asset.ready") {
      const data = payload?.data ?? {};
      const liveStreamId = data?.live_stream_id ?? null;
      let sessionId: string | null = null;
      if (liveStreamId) {
        const { data: ls } = await supabase
          .from("mux_live_streams")
          .select("session_id")
          .eq("mux_live_stream_id", liveStreamId)
          .maybeSingle();
        sessionId = ls?.session_id ?? null;
      }
      const playbackId = data?.playback_ids?.[0]?.id ?? null;
      await supabase.from("mux_assets").upsert({
        mux_asset_id: data.id,
        mux_live_stream_id: liveStreamId,
        session_id: sessionId,
        status: data.status,
        playback_id: playbackId,
        duration_seconds: data.duration ?? null,
        playback_policy: data?.playback_ids?.[0]?.policy ?? "public",
        raw: data,
      }, { onConflict: "mux_asset_id" });

      // Index for search
      await supabase.from("search_documents").insert({
        object_type: "recording",
        object_id: data.id,
        title: `Recording ${data.id.slice(0, 8)}`,
        body: `Mux asset duration ${Math.round(data.duration || 0)}s`,
        tags: ["recording"],
        session_id: sessionId,
        mux_asset_id: data.id,
        metadata: { playback_id: playbackId },
      });
    }
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  return json({ ok: true });
});
