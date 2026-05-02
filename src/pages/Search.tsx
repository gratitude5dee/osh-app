import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export type SearchRow = {
  id: string;
  object_type: string;
  object_id: string;
  title: string | null;
  body: string | null;
  tags: string[];
  rank: number;
  created_at: string;
};

export function SearchResults({ rows }: { rows: SearchRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No results.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="rounded-md border border-border p-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-sm font-medium">{r.title || r.object_id}</div>
              {r.body ? <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.body}</p> : null}
              {r.tags?.length ? (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {r.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
              ) : null}
            </div>
            <Badge variant="secondary">{r.object_type}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Search() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [tab, setTab] = useState("all");

  const search = async () => {
    const data = await api.searchAll(q);
    setRows(data as SearchRow[]);
  };

  const filtered = tab === "all" ? rows : rows.filter((r) => r.object_type === tab);

  return (
    <>
      <PageHeader title="Search" description="Search across sessions, events, recordings, and replacements." />
      <div className="p-6 space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); search(); }}
        >
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Query…" />
          <Button type="submit">Search</Button>
        </form>
        <Card>
          <CardContent className="p-3">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="event">Events</TabsTrigger>
                <TabsTrigger value="session">Sessions</TabsTrigger>
                <TabsTrigger value="recording">Recordings</TabsTrigger>
                <TabsTrigger value="replacement">Replacements</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} className="mt-4">
                <SearchResults rows={filtered} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
