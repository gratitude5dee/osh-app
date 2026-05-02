import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type Asset = {
  id: string;
  mux_asset_id: string;
  playback_id: string | null;
  duration_seconds: number | null;
  status: string | null;
  session_id: string | null;
  created_at: string;
};

export default function Recordings() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [active, setActive] = useState<Asset | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Recordings | Ohhh.SH";
    supabase
      .from("mux_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setAssets(data as Asset[]));
  }, []);

  const generate = async () => {
    if (!active || !prompt.trim()) return;
    setSubmitting(true);
    try {
      await api.submitReplacementJob({
        session_id: active.session_id ?? undefined,
        prompt,
        target_duration_ms: duration,
      });
      toast({ title: "Replacement job queued" });
      setActive(null);
      setPrompt("");
    } catch (e) {
      toast({ title: "Job failed", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Recordings" description="Mux assets, Robots scores, and replacement assets." />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{a.mux_asset_id.slice(0, 12)}…</span>
                <Badge variant="outline">{a.status ?? "pending"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {a.playback_id ? (
                <video controls className="w-full rounded" src={`https://stream.mux.com/${a.playback_id}.m3u8`} />
              ) : (
                <div className="aspect-video rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  No playback yet
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {a.duration_seconds ? `${Math.round(a.duration_seconds)}s` : "—"} · {new Date(a.created_at).toLocaleString()}
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setActive(a)}>
                Generate replacement
              </Button>
            </CardContent>
          </Card>
        ))}
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-12">
            No recordings yet — go live and end a session to populate this list.
          </p>
        ) : null}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate replacement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rprompt">Prompt</Label>
              <Textarea id="rprompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rduration">Target duration (ms)</Label>
              <Input id="rduration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <Button onClick={generate} disabled={submitting || !prompt.trim()}>
              {submitting ? "Submitting…" : "Submit to Fal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
