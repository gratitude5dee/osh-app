import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { decisionBadgeVariant } from "@/lib/mappers";
import { toast } from "@/hooks/use-toast";

type Event = {
  id: string;
  session_id: string;
  decision: "allow" | "review" | "block";
  action: string;
  confidence: number;
  categories: string[];
  reason: string | null;
  source_ts_ms: number;
  created_at: string;
};

export default function Review() {
  const [events, setEvents] = useState<Event[]>([]);
  const [active, setActive] = useState<Event | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("moderation_events")
      .select("*")
      .in("decision", ["review", "block"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setEvents(data as Event[]);
  };

  useEffect(() => {
    document.title = "Review | Ohhh.SH";
    load();
  }, []);

  const decide = async (decision: "approved" | "rejected" | "escalated") => {
    if (!active) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("review_decisions").insert({
      event_id: active.id, reviewer_id: user.id, decision, notes,
    });
    if (error) {
      toast({ title: "Decision failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Marked as ${decision}` });
      setActive(null);
      setNotes("");
    }
  };

  return (
    <>
      <PageHeader title="Review queue" description="Triage flagged and blocked frames." />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">No events to review.</div>
            ) : (
              <ul className="divide-y divide-border">
                {events.map((e) => (
                  <li key={e.id}>
                    <button onClick={() => setActive(e)} className="w-full text-left px-4 py-3 hover:bg-accent">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <Badge variant={decisionBadgeVariant(e.decision)}>{e.decision}</Badge>
                          <span className="text-xs text-muted-foreground">{e.action}</span>
                          <span className="text-xs text-muted-foreground">{Math.round(e.confidence * 100)}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                      </div>
                      {e.reason ? <p className="text-xs text-muted-foreground mt-1 truncate">{e.reason}</p> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Event detail</SheetTitle>
          </SheetHeader>
          {active ? (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Badge variant={decisionBadgeVariant(active.decision)}>{active.decision}</Badge>
                <Badge variant="outline">{active.action}</Badge>
                <Badge variant="outline">{Math.round(active.confidence * 100)}%</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Reason</div>
                <p className="text-sm text-muted-foreground">{active.reason || "—"}</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Categories</div>
                <div className="flex flex-wrap gap-1">
                  {active.categories.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                </div>
              </div>
              <div className="space-y-2">
                <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide("approved")}>Uphold</Button>
                  <Button size="sm" variant="outline" onClick={() => decide("rejected")}>Overturn</Button>
                  <Button size="sm" variant="destructive" onClick={() => decide("escalated")}>Escalate</Button>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
