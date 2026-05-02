import { json, options } from "../_shared/http.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  const supabase = serviceClient();
  let inserted = 0;

  // Sessions
  const { data: sessions } = await supabase.from("stream_sessions").select("id, title, owner_id, created_at");
  for (const s of sessions ?? []) {
    await supabase.from("search_documents").upsert({
      object_type: "session",
      object_id: s.id,
      owner_id: s.owner_id,
      session_id: s.id,
      title: s.title,
      body: `session ${s.id}`,
      tags: ["session"],
    }, { onConflict: "object_type,object_id" }).then(() => inserted++);
  }
  // Assets
  const { data: assets } = await supabase.from("mux_assets").select("mux_asset_id, session_id, duration_seconds");
  for (const a of assets ?? []) {
    await supabase.from("search_documents").upsert({
      object_type: "recording",
      object_id: a.mux_asset_id,
      mux_asset_id: a.mux_asset_id,
      session_id: a.session_id,
      title: `Recording ${a.mux_asset_id.slice(0, 8)}`,
      body: `duration ${Math.round(a.duration_seconds || 0)}s`,
      tags: ["recording"],
    }, { onConflict: "object_type,object_id" }).then(() => inserted++);
  }
  return json({ ok: true, inserted });
});
