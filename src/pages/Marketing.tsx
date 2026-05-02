import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ShieldCheck, Radio, Zap } from "lucide-react";

export default function Marketing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/live" replace />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="px-8 py-5 flex items-center justify-between border-b border-border">
        <div className="font-semibold tracking-tight">Ohhh.SH</div>
        <div className="flex gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm">Get started</Button></Link>
        </div>
      </header>
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Live moderation that beats the broadcast.</h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          Sub-second vision moderation for live streams. Powered by Overshoot, delivered through Mux,
          and decided before your audience ever sees a frame.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Link to="/auth"><Button size="lg">Open the console</Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          {[
            { icon: Zap, title: "Sub-1s decisions", body: "Frame-level moderation runs inside the OBS publish delay so blocks land before broadcast." },
            { icon: ShieldCheck, title: "Policy you control", body: "Prompt, threshold, and block mode are configurable per team — defaults to Qwen/Qwen3.5-9B." },
            { icon: Radio, title: "Built for live", body: "Mux ingest and playback, Robots for VOD, Fal for async replacement assets." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-border p-5">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
