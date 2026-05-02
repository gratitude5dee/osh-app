import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function WhyTable() {
  return (
    <section className="py-20 md:py-28 border-t border-osh-rule">
      <div className="osh-mono text-[11px] uppercase tracking-[0.18em] text-osh-ink-faint mb-8">
        §03 — why
      </div>
      <h2 className="sr-only">Why Ohhh.SH</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <p className="lg:col-span-7 text-osh-ink text-[20px] md:text-[22px] leading-[1.5] max-w-[42ch]">
          low-latency HLS still ships in seconds. moderation cannot. so we made a decision budget
          that fits inside a frame's lifetime — and a buffer long enough to use it.
        </p>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="border border-osh-rule rounded-xl bg-osh-surface divide-y divide-osh-rule">
            <Row label="decision budget" value="< 800 ms" />
            <Row label="publish delay" value="60.000 s" />
            <Row
              label="default model"
              value={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="osh-mono text-[13px] px-2 py-1 -my-1 -mr-2 rounded border border-osh-rule text-osh-ink hover:border-osh-accent hover:text-osh-accent transition-colors">
                      Qwen/Qwen3.5-9B
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-osh-surface-2 border border-osh-rule text-osh-ink-mute osh-mono text-[11px]"
                  >
                    active when status==ready · falls back on 503
                  </TooltipContent>
                </Tooltip>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="osh-mono text-[12px] text-osh-ink-mute uppercase tracking-wider">
        {label}
      </span>
      <span className="osh-mono text-[14px] text-osh-ink tabular-nums">{value}</span>
    </div>
  );
}
