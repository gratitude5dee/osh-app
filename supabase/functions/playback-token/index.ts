import { json, options, readJson } from "../_shared/http.ts";
import { requireUser, serviceClient } from "../_shared/supabase.ts";

function base64Url(input: ArrayBuffer | Uint8Array | string) {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : input instanceof Uint8Array ? input : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function importPkcs8(pem: string) {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der.buffer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  try {
    const user = await requireUser(req);
    const { playback_id } = await readJson<{ playback_id?: string }>(req);
    if (!playback_id) return json({ error: "playback_id required" }, { status: 400 });

    const supabase = serviceClient();
    const { data: asset } = await supabase
      .from("mux_assets")
      .select("session_id, playback_id, stream_sessions(owner_id)")
      .eq("playback_id", playback_id)
      .maybeSingle();
    if (!asset) return json({ error: "not found" }, { status: 404 });
    const owner = (asset as any)?.stream_sessions?.owner_id;
    if (owner && owner !== user.id) return json({ error: "forbidden" }, { status: 403 });

    const keyId = Deno.env.get("MUX_PLAYBACK_SIGNING_KEY_ID");
    const privateKey = Deno.env.get("MUX_PLAYBACK_SIGNING_PRIVATE_KEY");
    if (!keyId || !privateKey) return json({ error: "Mux signing key not configured" }, { status: 503 });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId }));
    const payload = base64Url(JSON.stringify({ sub: playback_id, aud: "v", exp }));
    const data = `${header}.${payload}`;
    const key = await importPkcs8(privateKey);
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
    const token = `${data}.${base64Url(new Uint8Array(sig))}`;

    return json({ token, expires_at: new Date(exp * 1000).toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, { status: msg.includes("Unauthorized") ? 401 : 500 });
  }
});
