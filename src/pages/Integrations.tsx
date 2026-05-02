import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const integrations = [
  {
    name: "OBS Studio plugin",
    status: "Required",
    description: "Install the Ohhh.SH plugin in OBS, paste your stream's session token, and let it ship sampled frames.",
  },
  { name: "Mux", status: "Server-side", description: "Ingest, low-latency HLS playback, and Robots VOD scoring." },
  { name: "Overshoot", status: "Vision model", description: "Default model: Qwen/Qwen3.5-9B (auto-selected at stream start)." },
  { name: "Fal", status: "Async", description: "Replacement asset generation for VOD remediation." },
  { name: "Twitch", status: "Coming soon", description: "Native simulcast to Twitch via Mux simulcast targets." },
];

export default function Integrations() {
  const refreshModels = async () => {
    try {
      const res = await api.listModels();
      toast({ title: `${res.models.length} ready models` });
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" });
    }
  };

  return (
    <>
      <PageHeader title="Integrations" description="Connections used by the moderation pipeline." />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((i) => (
          <Card key={i.name}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                {i.name}
                <Badge variant="outline">{i.status}</Badge>
              </CardTitle>
              <CardDescription>{i.description}</CardDescription>
            </CardHeader>
            {i.name === "Overshoot" ? (
              <CardContent>
                <Button size="sm" variant="outline" onClick={refreshModels}>Refresh model list</Button>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
