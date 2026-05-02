import { useEffect, useRef, useState } from "react";
import { ApertureMark, BranchMark, ShutterMark } from "./icons";

const cards = [
  {
    n: "01",
    title: "see",
    sub: "every frame, sampled at 2 fps.",
    body:
      "the OBS plugin pulls JPEG frames from your encoder and ships them to a private Supabase function. nothing client-side ever touches the model key.",
    Icon: ApertureMark,
  },
  {
    n: "02",
    title: "decide",
    sub: "Qwen 3.5-9B, by default.",
    body:
      "the function asks Overshoot for a structured verdict — allow, review, or block — with a confidence score and category. fallbacks on 503, fail-open optional.",
    Icon: BranchMark,
  },
  {
    n: "03",
    title: "act",
    sub: "blackout, hold, slate, or replace.",
    body:
      "the plugin reacts inside your 60-second publish delay. your audience sees the policy you wrote, not the moment you didn't.",
    Icon: ShutterMark,
  },
];

function HowCard({
  card,
}: {
  card: (typeof cards)[number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setPlay(true);
            obs.disconnect();
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="bg-osh-surface border border-osh-rule rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <span className="osh-mono text-[11px] text-osh-ink-faint">{card.n}</span>
        <div
          className="osh-draw text-osh-ink-mute"
          data-play={play ? "true" : "false"}
          aria-hidden="true"
        >
          <card.Icon className="w-10 h-10" />
        </div>
      </div>
      <div>
        <h3 className="osh-display text-osh-ink text-2xl">{card.title}</h3>
        <p className="osh-mono text-[12px] text-osh-ink-mute mt-1">{card.sub}</p>
      </div>
      <p className="text-[15px] leading-relaxed text-osh-ink-mute">{card.body}</p>
    </article>
  );
}

export function HowGrid() {
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="osh-mono text-[11px] uppercase tracking-[0.18em] text-osh-ink-faint mb-8">
        §02 — how
      </div>
      <h2 className="sr-only">How Ohhh.SH works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {cards.map((c) => (
          <HowCard key={c.n} card={c} />
        ))}
      </div>
    </section>
  );
}
