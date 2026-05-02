import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModerationEvent } from "@/hooks/useRealtimeEvents";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts";

export function LiveTimeline({ events }: { events: ModerationEvent[] }) {
  const buckets = useMemo(() => {
    const now = Date.now();
    const windows = Array.from({ length: 12 }, (_, i) => {
      const end = now - i * 5000;
      return { t: end, allow: 0, review: 0, block: 0, latency: 0, count: 0 };
    }).reverse();
    for (const ev of events) {
      const ts = new Date(ev.created_at).getTime();
      const idx = windows.findIndex((w) => ts <= w.t && ts > w.t - 5000);
      if (idx === -1) continue;
      windows[idx][ev.decision] += 1;
      windows[idx].latency += ev.latency_ms ?? 0;
      windows[idx].count += 1;
    }
    return windows.map((w) => ({
      label: new Date(w.t).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
      allow: w.allow,
      review: w.review,
      block: w.block,
      latency: w.count ? Math.round(w.latency / w.count) : 0,
    }));
  }, [events]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">60s timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip cursor={{ fill: "hsl(var(--accent))" }} />
              <Bar dataKey="allow" stackId="a" fill="hsl(var(--secondary-foreground) / 0.4)" />
              <Bar dataKey="review" stackId="a" fill="hsl(var(--primary) / 0.6)" />
              <Bar dataKey="block" stackId="a" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Latency (ms)</div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets}>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
