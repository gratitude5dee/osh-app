## Goal

Replace the current placeholder `Marketing` page with an editorial, 5-Dee-inspired landing page at `/` that explains Ohhh.SH in seven seconds and routes visitors to `/auth`. Authenticated users hitting `/` continue to redirect to `/live`.

## Design tokens (added to `index.css` + `tailwind.config.ts`)

Scoped to the landing surface only — adds named HSL tokens without disturbing the existing app theme:

- `--osh-bg #0A0A0B`, `--osh-surface #111113`, `--osh-surface-2 #16171A`
- `--osh-ink #F5F4F1`, `--osh-ink-mute #A6A39C`, `--osh-ink-faint #5A5853`
- `--osh-rule #232327`
- `--osh-accent #E8FF5C` (chartreuse), `--osh-allow #6BE39A`, `--osh-review #F6C453`, `--osh-block #FF5E5E`

Tailwind extends with `osh-*` color families, font families (`display`, `sans`, `mono`), keyframes (`osh-underline`, `osh-pulse`, `osh-grain`, `osh-marquee`), and matching animations honoring `prefers-reduced-motion`.

Fonts loaded via `<link rel="preload">` for one woff2 each — Inter (display + body) and JetBrains Mono — with `font-display: swap`.

## Files to create

```
src/pages/Landing.tsx
src/components/landing/LandingNav.tsx
src/components/landing/Hero.tsx
src/components/landing/LiveRibbon.tsx
src/components/landing/HowGrid.tsx
src/components/landing/WhyTable.tsx
src/components/landing/TerminalCard.tsx
src/components/landing/IntegrationsGrid.tsx
src/components/landing/BigCTA.tsx
src/components/landing/LandingFooter.tsx
src/components/landing/GrainOverlay.tsx
src/components/landing/icons.tsx          // inline SVG marks: aperture, branch, shutter, integration logos
src/lib/landing/ribbon.ts                 // deterministic seed → 24 ticks w/ 78/16/6 ratio
src/components/landing/LiveRibbon.test.tsx
src/pages/Landing.test.tsx                // snapshot
```

## Files to edit

- `src/App.tsx` — swap `<Route path="/" element={<Marketing />} />` → `<Landing />`. Remove the now-unused `Marketing` import.
- `src/index.css` — add `osh-*` tokens, grain SVG data URI background, font preload class, focus-ring rule, scroll-behavior smooth.
- `tailwind.config.ts` — extend `colors.osh.*`, `fontFamily`, `keyframes`, `animation`.
- `index.html` — add the woff2 preload links + meta description.

## Component behavior

- **`LandingNav`** — fixed, transparent → solid (`backdrop-blur` + 1px hairline) past 80px scroll via a small `useScrollY` hook. Wordmark `ohhh` in display 500, `.sh` in mono `--osh-ink-mute`. Right side: `docs · pricing · sign in →`. <768px collapses links into a shadcn `Sheet`.
- **`Hero`** — `<h1>` clamp(48px, 7vw, 112px), word `before` wrapped in `<em>` with a 2px chartreuse underline that scales-x from 0 → 1 over 600ms after a 300ms delay. CTA cluster: primary pill `Sign in →` (`<Link to="/auth">`) + secondary `See it live` (smooth-scrolls to `#how`).
- **`LiveRibbon`** — 220px tall band (140px <768px). Three lanes (frame ticks, decision badges, model trace ticker) marqueeing right-to-left at 24px/s (16px/s mobile) via CSS `@keyframes osh-marquee` (transform-only). Pauses on hover/focus with a `paused` mono chip. `aria-hidden="true"`. Reduced-motion → static composition (no animation, just one rendered frame). Lazy-mounted via `requestIdleCallback` after first paint.
- **`HowGrid`** — three cards (`see` aperture, `decide` branch, `act` shutter). Inline SVG plays a one-shot draw animation when card crosses 60% viewport (IntersectionObserver, fire once).
- **`WhyTable`** — left editorial paragraph, right data card with three mono rows; model name is a shadcn `Tooltip` chip ("active when status==ready · falls back on 503").
- **`TerminalCard`** — three-dot window chrome, typewriter using `requestAnimationFrame` over a fixed character buffer, runs once, then a small counter (`0 blocks · 2 reviews · 184 frames`) increments deterministically every 4s via `setInterval` (cleared on unmount, paused under reduced motion).
- **`IntegrationsGrid`** — 3×2 inline-SVG outlines: Mux, Overshoot, Fal, OBS, Twitch, Supabase. Hover lifts to `--osh-ink` and reveals one-line mono caption.
- **`BigCTA`** — 480px band, `--osh-surface-2`, hairline top + bottom. H2 + 72px primary button → `/auth`.
- **`LandingFooter`** — three-row 1px-ruled grid: wordmark + status pill (`all systems normal` + `--osh-allow` dot), three short link columns (placeholders to `#`), copyright + `v0.1.0` chip + the `.sh` dot easter-egg (hover bumps grain opacity for 280ms).
- **`GrainOverlay`** — fixed full-viewport SVG `<feTurbulence>` at 0.03 opacity, `pointer-events: none`, hidden under `prefers-reduced-motion`.

## Routing & redirect

`Landing` reuses `useAuth()`. While `loading` → render nothing. If `user` exists → `<Navigate to="/live" replace />`. Otherwise the landing page renders. All "sign in" CTAs use `<Link to="/auth">`.

## Tests

- `src/lib/landing/ribbon.ts` exposes `generateTicks(count = 24, seed = 1)` — pure, deterministic. Test asserts exactly 24 entries, allow/review/block ratio 78/16/6 (so 19/4/1 for n=24, with rounding rules documented), and same seed → same output.
- `src/pages/Landing.test.tsx` — snapshot of rendered Landing (mock `useAuth` to return `{ user: null, loading: false }`, mock `requestIdleCallback`).

## Accessibility

- One `<h1>`, then `<h2>` per band.
- Skip-link (`Skip to content`) at top, visible on focus, jumps to `#main`.
- Focus ring: `outline: 2px solid hsl(var(--osh-accent)); outline-offset: 4px;` applied via a `.osh-focus` utility.
- `LiveRibbon` and `TerminalCard` are `aria-hidden="true"`; their information is duplicated in adjacent prose.
- Italic `before` keeps an underline so emphasis isn't color-only.
- All animations gated by `@media (prefers-reduced-motion: reduce)` → opacity-only or static.

## Performance

- Single woff2 preload for Inter and JetBrains Mono (subset to Latin).
- All decorative SVG inline + minified, no `<img>`.
- `LiveRibbon` and `TerminalCard` mount via `requestIdleCallback` (with `setTimeout` fallback) so they don't block LCP.
- No third-party scripts, no analytics on this page.

## Out of scope (per spec)

- No pricing/docs/blog content.
- No light-mode toggle on this page (rest of app keeps current theme; landing is hard-dark via local tokens).
- No video assets — all motion generated in-browser.
- Lighthouse run, axe sweep, and `/docs/screenshots/landing-*.png` capture deferred (no headless Chrome in this sandbox); will spot-check via the preview viewport.
