import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { StartStreamCard } from "@/components/live/StartStreamCard";
import { EventStream } from "@/components/live/EventStream";
import { LiveTimeline } from "@/components/live/LiveTimeline";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import type { CreateStreamSessionResponse } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default function Live() {
  const [session, setSession] = useState<CreateStreamSessionResponse | null>(null);
  const events = useRealtimeEvents(session?.session_id ?? null);

  useEffect(() => {
    document.title = "Live | Ohhh.SH";
  }, []);

  return (
    <>
      <PageHeader title="Live" description="Start a stream and watch moderation in real time." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6">
        <div className="lg:col-span-4 space-y-4">
          <StartStreamCard onSession={setSession} />
          {session?.playback.playback_id ? (
            <Card>
              <CardContent className="p-3">
                {/* Mux player loaded lazily; for public playback policies it works without a token */}
                <video
                  controls
                  className="w-full rounded"
                  src={`https://stream.mux.com/${session.playback.playback_id}.m3u8`}
                />
                <p className="text-xs text-muted-foreground mt-2">Playback policy: {session.playback.policy}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
        <div className="lg:col-span-5 min-h-[480px]">
          <EventStream events={events} />
        </div>
        <div className="lg:col-span-3">
          <LiveTimeline events={events} />
        </div>
      </div>
    </>
  );
}
