import {
  MuxMark,
  OvershootMark,
  FalMark,
  ObsMark,
  TwitchMark,
  SupabaseMark,
} from "./icons";

const items = [
  { name: "Mux", role: "ingest", Icon: MuxMark },
  { name: "Overshoot", role: "vision", Icon: OvershootMark },
  { name: "Fal", role: "remediation", Icon: FalMark },
  { name: "OBS", role: "encoder", Icon: ObsMark },
  { name: "Twitch", role: "destination", Icon: TwitchMark },
  { name: "Supabase", role: "data", Icon: SupabaseMark },
];

export function IntegrationsGrid() {
  return (
    <div className="grid grid-cols-3 gap-px bg-osh-rule border border-osh-rule rounded-xl overflow-hidden">
      {items.map(({ name, role, Icon }) => (
        <div
          key={name}
          className="group bg-osh-surface p-6 flex flex-col items-center justify-center min-h-[110px] transition-colors hover:bg-osh-surface-2"
        >
          <Icon className="w-20 h-7 text-osh-ink-mute group-hover:text-osh-ink transition-colors" />
          <span className="osh-mono text-[10px] uppercase tracking-wider mt-3 text-osh-ink-faint opacity-0 group-hover:opacity-100 transition-opacity">
            {role}
          </span>
          <span className="sr-only">{name} — {role}</span>
        </div>
      ))}
    </div>
  );
}
