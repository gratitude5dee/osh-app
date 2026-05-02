import { useEffect, useMemo, useRef, useState } from "react";
import { generateTicks, type RibbonTick } from "@/lib/landing/ribbon";

const TICK_WIDTH = 200; // px per frame slot (incl. gap)
const SPEED_DESKTOP = 24; // px/s
const SPEED_MOBILE = 16; // px/s

function FrameSlot({ tick }: { tick: RibbonTick }) {
  const dotColor =
    tick.verdict === "allow"
      ? "hsl(var(--osh-allow))"
      : tick.verdict === "review"
      ? "hsl(var(--osh-review))"
      : "hsl(var(--osh-block))";

  return (
    <div
      className="shrink-0"
      style={{ width: TICK_WIDTH - 16, marginRight: 16 }}
    >
      <div
        className="aspect-video rounded border border-osh-rule overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tick.gradient[0]} 0%, ${tick.gradient[1]} 100%)`,
        }}
      />
      <div className="osh-mono mt-2 flex items-center gap-2 text-[11px] text-osh-ink-mute">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: dotColor }}
          aria-hidden="true"
        />
        <span className="text-osh-ink">{tick.verdict}</span>
        <span className="text-osh-ink-faint">·</span>
        <span>{tick.confidence.toFixed(2)}</span>
        {tick.verdict !== "allow" ? (
          <>
            <span className="text-osh-ink-faint">·</span>
            <span>{tick.category}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TraceLine({ tick }: { tick: RibbonTick }) {
  const ts = (tick.tsMs / 1000).toFixed(3);
  return (
    <div
      className="shrink-0 osh-mono text-[11px] text-osh-ink-faint"
      style={{ width: TICK_WIDTH - 16, marginRight: 16 }}
    >
      t={ts}s · qwen3.5-9b · conf {tick.confidence.toFixed(2)} · {tick.verdict}
      {tick.verdict !== "allow" ? ` · ${tick.category}` : ""}
    </div>
  );
}

export function LiveRibbon() {
  const ticks = useMemo(() => generateTicks(24, 7), []);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Duration: distance / speed. Distance = ticks.length * TICK_WIDTH.
  const speed = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
  const duration = (ticks.length * TICK_WIDTH) / speed;

  // Duplicate the track so the marquee loops seamlessly at -50%.
  const doubled = [...ticks, ...ticks];

  return (
    <section
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-osh-rule"
      style={{ height: isMobile ? 140 : 220 }}
    >
      {/* live status overlay */}
      <div className="absolute top-3 left-4 z-10 osh-mono text-[11px] text-osh-ink-mute flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full bg-osh-allow osh-pulse"
          aria-hidden="true"
        />
        streaming · 60s buffer
      </div>
      {paused ? (
        <div className="absolute top-3 right-4 z-10 osh-mono text-[11px] text-osh-accent border border-osh-accent/40 px-2 py-0.5 rounded">
          paused
        </div>
      ) : null}

      {/* edge fades */}
      <div
        className="absolute inset-y-0 left-0 w-24 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--osh-bg)) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, hsl(var(--osh-bg)) 0%, transparent 100%)",
        }}
      />

      <div
        ref={containerRef}
        className="osh-marquee absolute inset-0 flex items-center px-4"
        data-paused={paused ? "true" : "false"}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        tabIndex={-1}
      >
        <div
          className="osh-marquee-track"
          style={{ ["--osh-marquee-duration" as string]: `${duration}s` }}
        >
          {/* lane 1: frame ticks + decision badges */}
          <div className="flex flex-col justify-center pr-4">
            <div className="flex">
              {doubled.map((t, i) => (
                <FrameSlot key={`f-${i}`} tick={t} />
              ))}
            </div>
            {!isMobile ? (
              <div className="flex mt-3">
                {doubled.map((t, i) => (
                  <TraceLine key={`tr-${i}`} tick={t} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
