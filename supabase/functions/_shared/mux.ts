const MUX_API_BASE = "https://api.mux.com/video/v1";
const MUX_ROBOTS_BASE = "https://api.mux.com/robots/v0";

function authHeaders() {
  const tokenId = Deno.env.get("MUX_TOKEN_ID");
  const tokenSecret = Deno.env.get("MUX_TOKEN_SECRET");
  if (!tokenId || !tokenSecret) throw new Error("Mux credentials are not configured.");
  return {
    Authorization: `Basic ${btoa(`${tokenId}:${tokenSecret}`)}`,
    "Content-Type": "application/json",
  };
}

export async function muxRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${MUX_API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error?.messages?.join(", ") || body?.message || "Mux request failed.");
  }
  return body;
}

export async function robotsRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${MUX_ROBOTS_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error?.messages?.join(", ") || body?.message || "Mux Robots request failed.");
  }
  return body;
}

export function normalizeLiveStream(data: Record<string, any>) {
  const playbackId = data.playback_ids?.find((entry: any) => entry.policy === "signed")?.id ||
    data.playback_ids?.find((entry: any) => entry.policy === "public")?.id ||
    data.playback_ids?.[0]?.id ||
    null;
  return {
    id: data.id,
    status: data.status,
    streamKey: data.stream_key,
    playbackId,
    playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : "",
    activeAssetId: data.active_asset_id || null,
    latencyMode: data.latency_mode || "low",
    reconnectWindow: data.reconnect_window ?? 60,
    ingest: {
      rtmp: "rtmp://global-live.mux.com:5222/app",
      rtmps: "rtmps://global-live.mux.com:443/app",
    },
    raw: data,
  };
}
