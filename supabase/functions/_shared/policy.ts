export const DEFAULT_MODEL = "Qwen/Qwen3.5-9B";

export const DEFAULT_CATEGORIES = [
  "sexual_explicit",
  "graphic_nudity",
  "violence_graphic",
  "self_harm",
  "hate_symbols",
  "weapon_threat",
  "copyright_sports_rebroadcast",
  "brand_safety_custom",
];

export const DEFAULT_PROMPT =
  "You are a strict live broadcast safety classifier. Classify only visible content in this frame or short clip. Return JSON with decision, categories, confidence, reason, and recommended_action. Block explicit nudity, pornographic content, visible genitals, graphic sexual content, graphic violence, self-harm in progress, hate symbols, or immediate weapon threat. Use review for ambiguous content. Do not block ordinary faces, clothing, fitness, gameplay UI, or non-graphic discussion.";

export function normalizeDecision(value: unknown): "allow" | "review" | "block" {
  return value === "block" || value === "review" || value === "allow" ? value : "review";
}

export function normalizeAction(value: unknown, decision: "allow" | "review" | "block", blockMode = "hold_last_safe") {
  if (value === "blackout" || value === "hold_last_safe" || value === "slate" || value === "end_stream" || value === "none") {
    return value;
  }
  return decision === "block" ? blockMode : "none";
}

export function confidence(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

export function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
