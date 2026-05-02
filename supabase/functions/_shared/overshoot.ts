import { DEFAULT_MODEL } from "./policy.ts";

const OVERSHOOT_BASE = "https://api.overshoot.ai/v1";

export async function selectOvershootModel(preferred = DEFAULT_MODEL) {
  try {
    const response = await fetch(`${OVERSHOOT_BASE}/models`);
    const payload = await response.json();
    const models = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const ready = models.filter((model: any) => model?.status === "ready");
    const preferredReady = ready.find((model: any) => model?.id === preferred || model?.name === preferred);
    const selected = preferredReady || ready[0];
    return {
      model: selected?.id || selected?.name || preferred,
      status: {
        ok: Boolean(selected),
        preferred,
        ready_count: ready.length,
        selected: selected?.id || selected?.name || preferred,
      },
    };
  } catch (error) {
    return {
      model: preferred,
      status: {
        ok: false,
        preferred,
        selected: preferred,
        error: error instanceof Error ? error.message : "Unable to list Overshoot models.",
      },
    };
  }
}

export async function moderateFrameWithOvershoot(input: {
  apiKey: string;
  model: string;
  prompt: string;
  imageJpegBase64: string;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 1500);
  try {
    const response = await fetch(`${OVERSHOOT_BASE}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a strict broadcast safety classifier. Return only JSON with decision, categories, confidence, reason, and recommended_action.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `${input.prompt}\nRespond as JSON: {"decision":"allow|review|block","categories":["..."],"confidence":0.0,"reason":"...","recommended_action":"none|blackout|hold_last_safe|slate|end_stream"}.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${input.imageJpegBase64}` },
              },
            ],
          },
        ],
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.detail || payload?.error?.message || "Overshoot request failed.");
    }
    const content = payload?.choices?.[0]?.message?.content ?? payload?.output_text ?? payload;
    if (typeof content === "string") return JSON.parse(content);
    return content;
  } finally {
    clearTimeout(timeout);
  }
}
