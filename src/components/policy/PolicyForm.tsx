import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PolicyFormValues = {
  name: string;
  prompt: string;
  threshold: number;
  sample_fps: number;
  block_mode: "blackout" | "hold_last_safe" | "slate" | "replace";
  fail_open: boolean;
  model: string;
};

export const POLICY_DEFAULTS: PolicyFormValues = {
  name: "Default",
  prompt:
    "You are a strict live broadcast safety classifier. Block explicit nudity, graphic violence, hate symbols, self-harm in progress, or weapon threats. Use review for ambiguous content.",
  threshold: 0.7,
  sample_fps: 4,
  block_mode: "blackout",
  fail_open: false,
  model: "Qwen/Qwen3.5-9B",
};

export function PolicyForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<PolicyFormValues>;
  onSubmit: (values: PolicyFormValues) => void;
  submitting?: boolean;
}) {
  const { register, handleSubmit, watch, setValue } = useForm<PolicyFormValues>({
    defaultValues: { ...POLICY_DEFAULTS, ...initialValues },
  });

  // Force re-render on slider/switch changes by reading values
  const threshold = watch("threshold");
  const sample_fps = watch("sample_fps");
  const block_mode = watch("block_mode");
  const fail_open = watch("fail_open");
  const model = watch("model");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" rows={5} {...register("prompt", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Threshold ({threshold.toFixed(2)})</Label>
            <Slider
              aria-label="threshold"
              min={0}
              max={1}
              step={0.05}
              value={[threshold]}
              onValueChange={(v) => setValue("threshold", v[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>Sample FPS ({sample_fps})</Label>
            <Slider
              aria-label="sample_fps"
              min={1}
              max={10}
              step={1}
              value={[sample_fps]}
              onValueChange={(v) => setValue("sample_fps", v[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>Block mode</Label>
            <RadioGroup
              value={block_mode}
              onValueChange={(v) => setValue("block_mode", v as PolicyFormValues["block_mode"])}
              className="grid grid-cols-2 gap-2"
            >
              {(["blackout", "hold_last_safe", "slate", "replace"] as const).map((mode) => (
                <Label key={mode} className="flex items-center gap-2 border border-border rounded-md px-3 py-2 cursor-pointer">
                  <RadioGroupItem value={mode} />
                  <span className="text-sm">{mode}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="fail_open">Fail open</Label>
              <p className="text-xs text-muted-foreground">Allow frames if moderation errors out.</p>
            </div>
            <Switch id="fail_open" checked={fail_open} onCheckedChange={(v) => setValue("fail_open", v)} />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <div><Badge variant="secondary">{model}</Badge></div>
            <p className="text-xs text-muted-foreground">Default model is selected at stream start from Overshoot's ready list.</p>
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save policy"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
