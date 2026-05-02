import { sha256Hex } from "./crypto.ts";
import { serviceClient } from "./supabase.ts";

export async function requireObsClient(req: Request, sessionId: string) {
  const token =
    req.headers.get("x-obs-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing OBS session token.");

  const tokenHash = await sha256Hex(token);
  const supabase = serviceClient();
  const { data: client, error } = await supabase
    .from("obs_clients")
    .select("id, session_id, revoked_at")
    .eq("session_id", sessionId)
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!client) throw new Error("Invalid OBS session token.");

  await supabase.from("obs_clients").update({ last_seen_at: new Date().toISOString() }).eq("id", client.id);
  return client as { id: string; session_id: string };
}
