import { json, options, readJson } from "../_shared/http.ts";
import { robotsRequest } from "../_shared/mux.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return json({ error: "method" }, { status: 405 });

  const body = await readJson<{ mux_asset_id?: string }>(req);
  if (!body.mux_asset_id) return json({ error: "mux_asset_id required" }, { status: 400 });
  const supabase = serviceClient();

  try {
    const result = await robotsRequest("/jobs", {
      method: "POST",
      body: JSON.stringify({ asset_id: body.mux_asset_id, workflow: "moderate" }),
    }).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));

    const { data: asset } = await supabase
      .from("mux_assets")
      .select("id")
      .eq("mux_asset_id", body.mux_asset_id)
      .maybeSingle();

    await supabase.from("robots_jobs").insert({
      mux_asset_id: body.mux_asset_id,
      asset_row_id: asset?.id ?? null,
      mux_job_id: (result as any)?.data?.id ?? null,
      status: (result as any)?.error ? "failed" : "running",
      error: (result as any)?.error ?? null,
      raw_result: result,
    });

    return json({ ok: true, result });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});
