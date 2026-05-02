// Deterministic generator for the LiveRibbon. Pure, no DOM, no Date.now().
// Distribution target: ~78% allow / ~16% review / ~6% block.
// For the documented n=24 default this rounds to 19 / 4 / 1.

export type Verdict = "allow" | "review" | "block";

export interface RibbonTick {
  /** 0-based index in the generated sequence */
  index: number;
  /** Decision verdict */
  verdict: Verdict;
  /** Confidence 0–1, two decimals */
  confidence: number;
  /** Synthetic timecode in milliseconds, monotonic */
  tsMs: number;
  /** Category label, only meaningful for review/block */
  category: string;
  /** Two CSS color stops driving the deterministic gradient thumbnail */
  gradient: [string, string];
}

/** Seeded PRNG (mulberry32). Identical seed → identical sequence. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES_REVIEW = ["nudity?", "weapon", "graphic?", "hate?"];
const CATEGORIES_BLOCK = ["weapon", "explicit", "violence"];

/**
 * Build a deterministic decision sequence with the documented 78/16/6 ratio.
 * For n=24 this is exactly 19 allow / 4 review / 1 block.
 *
 * The verdict slots are placed first (so counts are exact), then shuffled
 * with the same seeded PRNG that fills the rest of the fields.
 */
export function generateTicks(count = 24, seed = 1): RibbonTick[] {
  const rng = mulberry32(seed);

  const blocks = Math.max(1, Math.round(count * 0.06));
  const reviews = Math.max(1, Math.round(count * 0.16));
  const allows = Math.max(0, count - blocks - reviews);

  const verdicts: Verdict[] = [
    ...Array<Verdict>(allows).fill("allow"),
    ...Array<Verdict>(reviews).fill("review"),
    ...Array<Verdict>(blocks).fill("block"),
  ];

  // Fisher–Yates with the same RNG stream
  for (let i = verdicts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [verdicts[i], verdicts[j]] = [verdicts[j], verdicts[i]];
  }

  return verdicts.map((verdict, index) => {
    const r = rng();
    const confidence =
      verdict === "allow"
        ? 0.85 + r * 0.14
        : verdict === "review"
        ? 0.45 + r * 0.2
        : 0.7 + r * 0.25;

    const category =
      verdict === "review"
        ? CATEGORIES_REVIEW[Math.floor(rng() * CATEGORIES_REVIEW.length)]
        : verdict === "block"
        ? CATEGORIES_BLOCK[Math.floor(rng() * CATEGORIES_BLOCK.length)]
        : "ok";

    const hueA = Math.floor(rng() * 360);
    const hueB = (hueA + 24 + Math.floor(rng() * 60)) % 360;

    return {
      index,
      verdict,
      confidence: Math.round(confidence * 100) / 100,
      tsMs: 12_480 + index * 2_500,
      category,
      gradient: [
        `hsl(${hueA} 30% 22%)`,
        `hsl(${hueB} 25% 12%)`,
      ],
    };
  });
}
