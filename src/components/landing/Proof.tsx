import { TerminalCard } from "./TerminalCard";
import { IntegrationsGrid } from "./IntegrationsGrid";

export function Proof() {
  return (
    <section className="py-20 md:py-28 border-t border-osh-rule">
      <div className="osh-mono text-[11px] uppercase tracking-[0.18em] text-osh-ink-faint mb-8">
        §04 — proof
      </div>
      <h2 className="sr-only">Built on the tools you already trust</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-7">
          <TerminalCard />
          <p className="osh-mono text-[11px] text-osh-ink-faint mt-3">
            handshake · obs plugin → supabase function → overshoot
          </p>
        </div>
        <div className="lg:col-span-5">
          <IntegrationsGrid />
          <p className="osh-mono text-[11px] text-osh-ink-faint mt-3">
            ingest · vision · remediation · encoder · destination · data
          </p>
        </div>
      </div>
    </section>
  );
}
