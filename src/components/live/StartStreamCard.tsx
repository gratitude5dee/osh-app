import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { api, type CreateStreamSessionResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Radio, RadioTower } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Policy = { id: string; name: string; model: string; sample_fps: number; block_mode: string };

export function StartStreamCard({ onSession }: { onSession: (s: CreateStreamSessionResponse) => void }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyId, setPolicyId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [session, setSession] = useState<CreateStreamSessionResponse | null>(null);

  useEffect(() => {
    supabase
      .from("stream_policies")
      .select("id, name, model, sample_fps, block_mode")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setPolicies(data);
          if (!policyId && data[0]) setPolicyId(data[0].id);
        }
      });
  }, []);

  const handleStart = async () => {
    if (!policyId) return;
    setPending(true);
    try {
      const res = await api.createStreamSession({ policy_id: policyId, title: title || undefined });
      setSession(res);
      onSession(res);
      if (res.provider_error) {
        toast({ title: "Mux not configured", description: res.provider_error, variant: "destructive" });
      } else {
        toast({ title: "Stream session ready", description: "Paste the RTMPS URL + key into OBS." });
      }
    } catch (e) {
      toast({ title: "Failed to start session", description: String(e), variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  const copy = (label: string, value: string | null) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: `Copied ${label}` });
  };

  const selectedPolicy = policies.find((p) => p.id === policyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Radio className="h-4 w-4" /> Start a stream</CardTitle>
        <CardDescription>Spin up a Mux live stream with moderation enabled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="policy">Policy</Label>
          <Select value={policyId} onValueChange={setPolicyId}>
            <SelectTrigger id="policy" aria-label="policy">
              <SelectValue placeholder="Select policy" />
            </SelectTrigger>
            <SelectContent>
              {policies.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPolicy ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary">model: {selectedPolicy.model}</Badge>
              <Badge variant="outline">{selectedPolicy.sample_fps} fps</Badge>
              <Badge variant="outline">{selectedPolicy.block_mode}</Badge>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Friday Night Stream" />
        </div>
        <Button className="w-full" onClick={handleStart} disabled={!policyId || pending}>
          {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RadioTower className="h-4 w-4 mr-2" />}
          {pending ? "Generating…" : "Generate stream key"}
        </Button>

        {session ? (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label>RTMPS URL</Label>
              <div className="flex gap-2">
                <Input readOnly value={session.ingest.rtmps_url ?? ""} />
                <Button size="icon" variant="outline" onClick={() => copy("URL", session.ingest.rtmps_url)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Stream key</Label>
              <div className="flex gap-2">
                <Input readOnly type="password" value={session.ingest.stream_key ?? ""} />
                <Button size="icon" variant="outline" onClick={() => copy("key", session.ingest.stream_key)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>OBS plugin token</Label>
              <div className="flex gap-2">
                <Input readOnly type="password" value={session.obs.plugin_session_token} />
                <Button size="icon" variant="outline" onClick={() => copy("token", session.obs.plugin_session_token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Delay: {session.obs.delay_ms / 1000}s · Model: {session.policy.model}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
