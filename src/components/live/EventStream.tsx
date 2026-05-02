import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decisionBadgeVariant, formatLatency } from "@/lib/mappers";
import type { ModerationEvent } from "@/hooks/useRealtimeEvents";

export function EventStream({ events }: { events: ModerationEvent[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Moderation events</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        {events.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Waiting for the OBS plugin to send frames…
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((ev) => (
              <li key={ev.id} data-testid={`event-${ev.decision}`} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={decisionBadgeVariant(ev.decision)}>{ev.decision}</Badge>
                    <span className="text-xs text-muted-foreground">{ev.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatLatency(ev.latency_ms)} · {Math.round(ev.confidence * 100)}%
                  </span>
                </div>
                {ev.reason ? (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{ev.reason}</p>
                ) : null}
                {ev.categories?.length ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ev.categories.slice(0, 4).map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
