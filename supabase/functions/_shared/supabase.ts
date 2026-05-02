import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: { persistSession: false },
    },
  );
}

export function userClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    },
  );
}

export async function requireUser(req: Request) {
  const client = userClient(req);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing Authorization bearer token.");
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error(error?.message || "Unauthorized.");
  return data.user;
}
