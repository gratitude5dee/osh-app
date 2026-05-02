import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResults, type SearchRow } from "@/pages/Search";

const rows: SearchRow[] = [
  { id: "1", object_type: "event", object_id: "e1", title: "Frame block", body: "graphic violence", tags: ["block"], rank: 1, created_at: new Date().toISOString() },
  { id: "2", object_type: "recording", object_id: "r1", title: null, body: null, tags: [], rank: 0.5, created_at: new Date().toISOString() },
];

describe("SearchResults", () => {
  it("renders empty state", () => {
    render(<SearchResults rows={[]} />);
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  it("renders mixed kinds", () => {
    render(<SearchResults rows={rows} />);
    expect(screen.getByText("Frame block")).toBeInTheDocument();
    expect(screen.getByText("event")).toBeInTheDocument();
    expect(screen.getByText("recording")).toBeInTheDocument();
  });
});
