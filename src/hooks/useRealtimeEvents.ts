import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModerationEvent = {
  id: string;
  session_id: string;
  source_ts_ms: number;
  frame_index: number | null;
  decision: "allow" | "review" | "block";
  action: string;
  confidence: number;
  categories: string[];
  reason: string | null;
  latency_ms: number | null;
  model: string;
  created_at: string;
};

export function useRealtimeEvents(sessionId: string | null, limit = 100) {
  const [events, setEvents] = useState<ModerationEvent[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setEvents([]);
      return;
    }
    let cancelled = false;

    supabase
      .from("moderation_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (!cancelled && data) setEvents(data as ModerationEvent[]);
      });

    const channel = supabase
      .channel(`mod-events-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "moderation_events", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setEvents((prev) => [payload.new as ModerationEvent, ...prev].slice(0, limit));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId, limit]);

  return events;
}
