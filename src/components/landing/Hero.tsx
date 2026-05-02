import { Link } from "react-router-dom";
import { ArrowRight } from "./icons";

export function Hero() {
  const handleSeeItLive = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="relative pt-36 md:pt-44 pb-10 md:pb-16">
      {/* mono left-rail caption */}
      <div className="osh-mono text-[11px] uppercase tracking-[0.18em] text-osh-ink-faint mb-8">
        §01 — live
      </div>

      <h1
        className="osh-display text-osh-ink"
        style={{
          fontSize: "clamp(48px, 7vw, 112px)",
          lineHeight: 0.96,
          maxWidth: "14ch",
          fontWeight: 500,
        }}
      >
        moderation that runs
        <br />
        <em className="osh-underline-em not-italic-fallback">before</em> the audience does.
      </h1>

      <p
        className="osh-mono text-osh-ink-mute mt-8 max-w-[60ch]"
        style={{ fontSize: 14, lineHeight: 1.65 }}
      >
        live-stream moderation in the 60-second gap between your encoder and your audience. one
        model, one queue, zero surprises.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          to="/auth"
          className="group inline-flex items-center gap-3 h-14 px-7 rounded-full border border-osh-ink text-osh-ink text-[15px] transition-all hover:border-osh-accent hover:text-osh-accent"
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 0 6px color-mix(in oklab, hsl(var(--osh-accent)) 18%, transparent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <a
          href="#how"
          onClick={handleSeeItLive}
          className="osh-mono text-[13px] text-osh-ink-mute hover:text-osh-ink transition-colors inline-flex items-center gap-2"
        >
          See it live <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}
