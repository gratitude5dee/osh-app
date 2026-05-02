import { useState } from "react";

const columns = [
  {
    title: "product",
    links: [
      { label: "live", href: "/auth" },
      { label: "policies", href: "/auth" },
      { label: "review", href: "/auth" },
    ],
  },
  {
    title: "company",
    links: [
      { label: "about", href: "#" },
      { label: "careers", href: "#" },
      { label: "contact", href: "#" },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "terms", href: "#" },
      { label: "privacy", href: "#" },
      { label: "dpa", href: "#" },
    ],
  },
];

export function LandingFooter() {
  const [grainBoost, setGrainBoost] = useState(false);

  const onShhh = () => {
    setGrainBoost(true);
    document.documentElement.style.setProperty("--osh-grain-opacity", "0.09");
    window.setTimeout(() => {
      document.documentElement.style.setProperty("--osh-grain-opacity", "0.03");
      setGrainBoost(false);
    }, 280);
  };

  return (
    <footer className="border-t border-osh-rule">
      {/* row 1: wordmark + status */}
      <div className="flex items-center justify-between py-6 border-b border-osh-rule">
        <div className="osh-display text-osh-ink text-[18px]">
          ohhh
          <button
            onMouseEnter={onShhh}
            onFocus={onShhh}
            aria-label="shhh"
            className="osh-mono text-osh-ink-mute font-normal inline-flex items-baseline"
          >
            .s
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mx-[1px] translate-y-[-1px]"
              style={{
                background: grainBoost
                  ? "hsl(var(--osh-accent))"
                  : "hsl(var(--osh-ink-mute))",
                transition: "background 200ms",
              }}
            />
            h
          </button>
        </div>
        <div className="osh-mono text-[11px] text-osh-ink-mute flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-osh-allow osh-pulse"
            aria-hidden="true"
          />
          all systems normal
        </div>
      </div>

      {/* row 2: link columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-10 border-b border-osh-rule">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="osh-mono text-[10px] uppercase tracking-[0.2em] text-osh-ink-faint mb-4">
              {col.title}
            </h3>
            <ul className="space-y-2 text-[14px]">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-osh-ink-mute hover:text-osh-ink transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* row 3: copyright */}
      <div className="flex items-center justify-between py-6 osh-mono text-[11px] text-osh-ink-faint">
        <span>© 2026 5-dee studio</span>
        <span className="px-2 py-0.5 border border-osh-rule rounded text-osh-ink-mute">
          v0.1.0
        </span>
      </div>
    </footer>
  );
}
