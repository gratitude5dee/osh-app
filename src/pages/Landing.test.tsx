import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, loading: false, session: null }),
}));

describe("Landing", () => {
  it("renders the hero headline and primary CTA", () => {
    const { getByRole, getAllByRole } = render(
      <MemoryRouter>
        <TooltipProvider>
          <Landing />
        </TooltipProvider>
      </MemoryRouter>,
    );

    const h1 = getByRole("heading", { level: 1 });
    expect(h1.textContent).toContain("moderation that runs");
    expect(h1.textContent).toContain("before");

    const signInLinks = getAllByRole("link", { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    for (const link of signInLinks) {
      expect(link.getAttribute("href")).toBe("/auth");
    }
  });
});
