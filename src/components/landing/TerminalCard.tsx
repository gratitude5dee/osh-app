import { useEffect, useRef, useState } from "react";

const SCRIPT = [
  "$ obs-ohhhsh start",
  "→ session 01HXR…   policy default",
  "→ model  Qwen/Qwen3.5-9B   ready",
  "→ delay  60_000 ms          ok",
  "→ ingest rtmps://global-live.mux.com:443/app",
  "streaming · {blocks} blocks · {reviews} reviews · {frames} frames",
];

const TYPE_SPEED_MS = 14; // per character
const COUNTER_INTERVAL_MS = 4000;

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function TerminalCard() {
  const baseScript = SCRIPT.slice(0, -1).join("\n");
  const [typed, setTyped] = useState(reducedMotion() ? baseScript : "");
  const [counters, setCounters] = useState({ blocks: 0, reviews: 2, frames: 184 });
  const rafRef = useRef<number | null>(null);

  // typewriter: one-shot, no loop
  useEffect(() => {
    if (reducedMotion()) return;
    let start: number | null = null;
    const total = baseScript.length;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const chars = Math.min(total, Math.floor(elapsed / TYPE_SPEED_MS));
      setTyped(baseScript.slice(0, chars));
      if (chars < total) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [baseScript]);

  // deterministic counter increments
  useEffect(() => {
    if (reducedMotion()) return;
    const id = setInterval(() => {
      setCounters((c) => ({
        blocks: c.blocks + (Math.random() < 0.06 ? 1 : 0),
        reviews: c.reviews + (Math.random() < 0.18 ? 1 : 0),
        frames: c.frames + 8,
      }));
    }, COUNTER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const lastLine = SCRIPT[SCRIPT.length - 1]
    .replace("{blocks}", String(counters.blocks))
    .replace("{reviews}", String(counters.reviews))
    .replace("{frames}", String(counters.frames));

  const typedDone = typed.length >= baseScript.length;

  return (
    <div
      className="bg-osh-surface border border-osh-rule rounded-xl overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-osh-rule">
        <span className="w-2.5 h-2.5 rounded-full bg-osh-ink-faint" />
        <span className="w-2.5 h-2.5 rounded-full bg-osh-ink-faint" />
        <span className="w-2.5 h-2.5 rounded-full bg-osh-ink-faint" />
        <span className="osh-mono text-[11px] text-osh-ink-faint ml-3">obs-ohhhsh</span>
      </div>
      <pre className="osh-mono text-[12.5px] leading-[1.7] text-osh-ink-mute p-5 whitespace-pre-wrap min-h-[200px]">
        <code>
          {typed}
          {typedDone ? (
            <>
              {"\n"}
              <span className="text-osh-ink">{lastLine}</span>
            </>
          ) : (
            <span className="inline-block w-2 h-4 -mb-0.5 ml-0.5 bg-osh-accent osh-pulse align-middle" />
          )}
        </code>
      </pre>
    </div>
  );
}
