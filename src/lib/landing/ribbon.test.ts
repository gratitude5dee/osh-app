import { describe, expect, it } from "vitest";
import { generateTicks } from "@/lib/landing/ribbon";

describe("generateTicks", () => {
  it("returns exactly 24 ticks by default", () => {
    expect(generateTicks()).toHaveLength(24);
  });

  it("produces the documented 19/4/1 distribution at n=24", () => {
    const ticks = generateTicks();
    const counts = ticks.reduce(
      (acc, t) => ({ ...acc, [t.verdict]: acc[t.verdict] + 1 }),
      { allow: 0, review: 0, block: 0 } as Record<string, number>,
    );
    // 24 * 0.78 = 18.72 → 19, 24 * 0.16 = 3.84 → 4, 24 * 0.06 = 1.44 → 1
    expect(counts.allow).toBe(19);
    expect(counts.review).toBe(4);
    expect(counts.block).toBe(1);
  });

  it("is deterministic for a given seed", () => {
    const a = generateTicks(24, 7);
    const b = generateTicks(24, 7);
    expect(a).toEqual(b);
  });

  it("varies output across different seeds", () => {
    const a = generateTicks(24, 1);
    const b = generateTicks(24, 999);
    expect(a).not.toEqual(b);
  });

  it("returns confidence scores between 0 and 1", () => {
    for (const t of generateTicks(48, 3)) {
      expect(t.confidence).toBeGreaterThanOrEqual(0);
      expect(t.confidence).toBeLessThanOrEqual(1);
    }
  });
});
