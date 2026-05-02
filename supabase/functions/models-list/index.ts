import { json, options } from "../_shared/http.ts";

const BASE = Deno.env.get("OVERSHOOT_BASE_URL") || "https://api.overshoot.ai";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  try {
    const apiKey = Deno.env.get("OVERSHOOT_API_KEY");
    const headers: Record<string, string> = {};
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const resp = await fetch(`${BASE}/v1/models`, { headers });
    const payload = await resp.json().catch(() => ({}));
    const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const models = list
      .map((m: any) => ({ id: m?.id || m?.name, status: m?.status || "unknown" }))
      .filter((m: any) => m.id);
    return json({ models });
  } catch (e) {
    return json({ models: [], error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});
