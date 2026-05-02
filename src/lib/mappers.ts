export type Decision = "allow" | "review" | "block";
export type BlockMode = "blackout" | "hold_last_safe" | "slate" | "replace";
export type Action = "pass" | "flag" | "blackout" | "hold_last_safe" | "slate" | "replace";

export function decisionToAction(
  decision: Decision,
  blockMode: BlockMode,
  failOpen: boolean,
  errored = false,
): Action {
  if (errored) return failOpen ? "pass" : blockMode;
  if (decision === "allow") return "pass";
  if (decision === "review") return "flag";
  return blockMode;
}

export function decisionBadgeVariant(decision: Decision): "default" | "secondary" | "destructive" | "outline" {
  if (decision === "allow") return "secondary";
  if (decision === "review") return "outline";
  return "destructive";
}

export function formatLatency(ms: number | null | undefined) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
