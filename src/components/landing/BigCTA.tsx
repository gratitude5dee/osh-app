import { Link } from "react-router-dom";
import { ArrowRight } from "./icons";

export function BigCTA() {
  return (
    <section
      className="border-y border-osh-rule bg-osh-surface-2 flex items-center justify-center"
      style={{ minHeight: 480 }}
    >
      <div className="text-center px-6 py-20">
        <div className="osh-mono text-[11px] uppercase tracking-[0.18em] text-osh-ink-faint mb-6">
          §05 — sign in
        </div>
        <h2
          className="osh-display text-osh-ink"
          style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 1.02, fontWeight: 500 }}
        >
          ready when you are.
        </h2>
        <p className="osh-mono text-[12px] text-osh-ink-mute mt-6">
          magic link · oauth · no card
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/auth"
            className="group inline-flex items-center gap-3 h-[72px] px-8 rounded-full border border-osh-ink text-osh-ink text-[18px] transition-all hover:border-osh-accent hover:text-osh-accent"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 8px color-mix(in oklab, hsl(var(--osh-accent)) 18%, transparent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            sign in <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
