import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventStream } from "@/components/live/EventStream";
import type { ModerationEvent } from "@/hooks/useRealtimeEvents";

const make = (decision: "allow" | "review" | "block"): ModerationEvent => ({
  id: `id-${decision}`,
  session_id: "s1",
  source_ts_ms: Date.now(),
  frame_index: 1,
  decision,
  action: "pass",
  confidence: 0.9,
  categories: ["x"],
  reason: "r",
  latency_ms: 200,
  model: "m",
  created_at: new Date().toISOString(),
});

describe("EventStream", () => {
  it("renders empty state", () => {
    render(<EventStream events={[]} />);
    expect(screen.getByText(/Waiting for the OBS plugin/i)).toBeInTheDocument();
  });

  it("renders one row per event with the decision label", () => {
    render(<EventStream events={[make("allow"), make("review"), make("block")]} />);
    expect(screen.getByTestId("event-allow")).toBeInTheDocument();
    expect(screen.getByTestId("event-review")).toBeInTheDocument();
    expect(screen.getByTestId("event-block")).toBeInTheDocument();
  });
});
