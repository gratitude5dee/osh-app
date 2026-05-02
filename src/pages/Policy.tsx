import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shell/PageHeader";
import { PolicyForm, type PolicyFormValues } from "@/components/policy/PolicyForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type Policy = {
  id: string;
  name: string;
  prompt: string;
  threshold: number;
  sample_fps: number;
  block_mode: string;
  fail_open: boolean;
  model: string;
};

export default function Policy() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("stream_policies").select("*").order("created_at", { ascending: true });
    if (data) {
      setPolicies(data as Policy[]);
      if (!editing && data[0]) setEditing(data[0] as Policy);
    }
  };

  useEffect(() => {
    document.title = "Policies | Ohhh.SH";
    load();
  }, []);

  const handleSave = async (values: PolicyFormValues) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (editing) {
        const { error } = await supabase
          .from("stream_policies")
          .update({
            name: values.name, prompt: values.prompt, threshold: values.threshold,
            sample_fps: values.sample_fps, block_mode: values.block_mode,
            fail_open: values.fail_open, model: values.model,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Policy saved" });
      } else {
        const { error } = await supabase.from("stream_policies").insert({
          owner_id: user.id, ...values,
        });
        if (error) throw error;
        toast({ title: "Policy created" });
      }
      await load();
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Policies"
        description="Configure prompts, thresholds and enforcement modes."
        actions={<Button variant="outline" onClick={() => setEditing(null)}>New policy</Button>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6">
        <Card className="lg:col-span-4">
          <CardContent className="p-3 space-y-1">
            {policies.map((p) => (
              <button
                key={p.id}
                onClick={() => setEditing(p)}
                className={`w-full text-left rounded-md px-3 py-2 hover:bg-accent ${editing?.id === p.id ? "bg-accent" : ""}`}
              >
                <div className="text-sm font-medium">{p.name}</div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">{p.block_mode}</Badge>
                  <Badge variant="outline" className="text-[10px]">{p.model}</Badge>
                </div>
              </button>
            ))}
            {policies.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">No policies yet — create one.</p>
            ) : null}
          </CardContent>
        </Card>
        <div className="lg:col-span-8">
          <PolicyForm
            key={editing?.id ?? "new"}
            initialValues={editing ? { ...editing, block_mode: editing.block_mode as never } : undefined}
            onSubmit={handleSave}
            submitting={submitting}
          />
        </div>
      </div>
    </>
  );
}
