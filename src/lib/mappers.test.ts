import { describe, it, expect } from "vitest";
import { decisionToAction, decisionBadgeVariant, formatLatency, type BlockMode } from "@/lib/mappers";

const blockModes: BlockMode[] = ["blackout", "hold_last_safe", "slate", "replace"];

describe("decisionToAction", () => {
  for (const bm of blockModes) {
    for (const failOpen of [true, false]) {
      it(`allow → pass (${bm}, failOpen=${failOpen})`, () => {
        expect(decisionToAction("allow", bm, failOpen, false)).toBe("pass");
      });
      it(`review → flag (${bm}, failOpen=${failOpen})`, () => {
        expect(decisionToAction("review", bm, failOpen, false)).toBe("flag");
      });
      it(`block → ${bm} (failOpen=${failOpen})`, () => {
        expect(decisionToAction("block", bm, failOpen, false)).toBe(bm);
      });
      it(`errored + failOpen=${failOpen} (${bm})`, () => {
        expect(decisionToAction("allow", bm, failOpen, true)).toBe(failOpen ? "pass" : bm);
      });
    }
  }
});

describe("decisionBadgeVariant", () => {
  it("maps decisions", () => {
    expect(decisionBadgeVariant("allow")).toBe("secondary");
    expect(decisionBadgeVariant("review")).toBe("outline");
    expect(decisionBadgeVariant("block")).toBe("destructive");
  });
});

describe("formatLatency", () => {
  it("handles null", () => expect(formatLatency(null)).toBe("—"));
  it("ms under 1s", () => expect(formatLatency(450)).toBe("450ms"));
  it("seconds", () => expect(formatLatency(1500)).toBe("1.50s"));
});
