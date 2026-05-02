import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { HowGrid } from "@/components/landing/HowGrid";
import { WhyTable } from "@/components/landing/WhyTable";
import { Proof } from "@/components/landing/Proof";
import { BigCTA } from "@/components/landing/BigCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GrainOverlay } from "@/components/landing/GrainOverlay";

// Lazy-mounted after first paint so the hero LCP is text-only.
const LiveRibbon = lazy(() =>
  import("@/components/landing/LiveRibbon").then((m) => ({ default: m.LiveRibbon })),
);

function useDeferredMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const handle = w.requestIdleCallback
      ? w.requestIdleCallback(() => setReady(true))
      : window.setTimeout(() => setReady(true), 200);
    return () => {
      const ww = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (ww.cancelIdleCallback) ww.cancelIdleCallback(handle as number);
      else window.clearTimeout(handle as number);
    };
  }, []);
  return ready;
}

export default function Landing() {
  const { user, loading } = useAuth();
  const showRibbon = useDeferredMount();

  if (loading) {
    return <div className="osh-root min-h-screen" aria-hidden="true" />;
  }
  if (user) return <Navigate to="/live" replace />;

  return (
    <div className="osh-root min-h-screen relative">
      <a href="#main" className="osh-skip">Skip to content</a>
      <GrainOverlay />
      <LandingNav />

      <main id="main" className="relative">
        <div className="mx-auto max-w-[1280px] px-6 md:px-14 lg:px-24">
          <Hero />
        </div>

        {showRibbon ? (
          <Suspense fallback={<div style={{ height: 220 }} aria-hidden="true" />}>
            <LiveRibbon />
          </Suspense>
        ) : (
          <div style={{ height: 220 }} aria-hidden="true" className="border-y border-osh-rule" />
        )}

        <div className="mx-auto max-w-[1280px] px-6 md:px-14 lg:px-24">
          <HowGrid />
          <WhyTable />
          <Proof />
        </div>

        <BigCTA />

        <div className="mx-auto max-w-[1280px] px-6 md:px-14 lg:px-24">
          <LandingFooter />
        </div>
      </main>
    </div>
  );
}
