import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, ShieldCheck, ListChecks, Film, Search, Plug, LogOut, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/live", label: "Live", icon: Radio },
  { to: "/policy", label: "Policies", icon: ShieldCheck },
  { to: "/review", label: "Review", icon: ListChecks },
  { to: "/recordings", label: "Recordings", icon: Film },
  { to: "/search", label: "Search", icon: Search },
  { to: "/integrations", label: "Integrations", icon: Plug },
];

export default function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 border-r border-border bg-sidebar flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-sidebar-primary" />
            <span className="font-semibold tracking-tight">Ohhh.SH</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live moderation console</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
