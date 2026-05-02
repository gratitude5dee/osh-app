import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PolicyForm, POLICY_DEFAULTS } from "@/components/policy/PolicyForm";

describe("PolicyForm", () => {
  it("uses spec defaults", () => {
    expect(POLICY_DEFAULTS.threshold).toBe(0.7);
    expect(POLICY_DEFAULTS.block_mode).toBe("blackout");
    expect(POLICY_DEFAULTS.fail_open).toBe(false);
    expect(POLICY_DEFAULTS.model).toBe("Qwen/Qwen3.5-9B");
  });

  it("renders the default model badge and threshold", () => {
    render(<PolicyForm onSubmit={() => {}} />);
    expect(screen.getByText("Qwen/Qwen3.5-9B")).toBeInTheDocument();
    expect(screen.getByText(/Threshold \(0\.70\)/)).toBeInTheDocument();
  });

  it("submits the current values", async () => {
    const onSubmit = vi.fn();
    render(<PolicyForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /save policy/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      block_mode: "blackout",
      threshold: 0.7,
      fail_open: false,
      model: "Qwen/Qwen3.5-9B",
    }));
  });
});
