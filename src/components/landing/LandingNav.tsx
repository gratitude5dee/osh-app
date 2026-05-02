import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight } from "./icons";

const DOCS_URL = (import.meta.env.VITE_DOCS_URL as string | undefined) ?? "#";

const links = [
  { label: "docs", href: DOCS_URL, external: true },
  { label: "pricing", href: "#", external: false },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "fixed top-0 inset-x-0 z-40 h-16 transition-colors duration-300",
        scrolled
          ? "bg-osh-bg/80 backdrop-blur-md border-b border-osh-rule"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
      aria-label="Primary"
    >
      <div className="mx-auto h-full max-w-[1280px] px-6 md:px-14 lg:px-24 flex items-center justify-between">
        <Link to="/" className="osh-display text-osh-ink text-[19px] leading-none">
          ohhh<span className="osh-mono text-osh-ink-mute font-normal">.sh</span>
        </Link>

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-6 text-[14px] text-osh-ink-mute">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-osh-ink transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <a key={l.label} href={l.href} className="hover:text-osh-ink transition-colors">
                {l.label}
              </a>
            ),
          )}
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-osh-rule text-osh-ink text-[14px] hover:border-osh-accent hover:text-osh-accent transition-colors"
          >
            sign in <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* mobile sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="p-2 text-osh-ink-mute hover:text-osh-ink"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-osh-bg border-l border-osh-rule text-osh-ink"
            >
              <div className="flex flex-col gap-6 mt-12 text-lg">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noreferrer" : undefined}
                    className="text-osh-ink-mute hover:text-osh-ink"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 px-4 h-11 rounded-full border border-osh-rule text-osh-ink hover:border-osh-accent hover:text-osh-accent transition-colors w-fit"
                >
                  sign in <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
