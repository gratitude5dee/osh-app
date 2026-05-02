// Inline, monochrome SVG marks. Single color via currentColor so they pick up
// whatever Tailwind text-* class their parent sets. Decorative — every consumer
// adds aria-hidden when appropriate.

import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 64 64",
};

export const ApertureMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="32" cy="32" r="22" />
    <path d="M32 10 L40 30 L18 30 Z" />
    <path d="M51 24 L34 36 L42 16 Z" />
    <path d="M51 42 L30 38 L46 50 Z" />
    <path d="M32 54 L24 34 L46 34 Z" />
    <path d="M13 42 L30 30 L22 50 Z" />
    <path d="M13 24 L34 28 L18 16 Z" />
  </svg>
);

export const BranchMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M16 16 L32 32" />
    <path d="M32 32 L48 18" />
    <path d="M32 32 L48 32" />
    <path d="M32 32 L48 46" />
    <circle cx="16" cy="16" r="3" />
    <circle cx="48" cy="18" r="3" />
    <circle cx="48" cy="32" r="3" />
    <circle cx="48" cy="46" r="3" />
  </svg>
);

export const ShutterMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="10" y="14" width="44" height="24" rx="2" />
    <line x1="10" y1="22" x2="54" y2="22" />
    <line x1="10" y1="30" x2="54" y2="30" />
    <line x1="10" y1="38" x2="54" y2="38" />
    <line x1="20" y1="46" x2="44" y2="46" />
    <line x1="26" y1="52" x2="38" y2="52" />
  </svg>
);

const wm: SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 96 32",
};

// Stylized wordmarks — outline-only, monochrome, currentColor.
export const MuxMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <path d="M6 24 V8 L18 22 L30 8 V24" />
    <path d="M40 8 V18 a6 6 0 0 0 12 0 V8" />
    <path d="M62 8 L82 24 M82 8 L62 24" />
  </svg>
);

export const OvershootMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <circle cx="14" cy="16" r="7" />
    <path d="M28 22 V12 a4 4 0 0 1 8 0 V22" />
    <path d="M28 16 H36" />
    <path d="M44 22 L52 10 L60 22" />
    <path d="M46 18 H58" />
    <path d="M68 22 V10 M68 16 H78 M78 10 V22" />
  </svg>
);

export const FalMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <path d="M10 24 V8 H24" />
    <path d="M10 16 H22" />
    <path d="M34 24 L42 8 L50 24" />
    <path d="M37 19 H47" />
    <path d="M60 8 V24 H74" />
  </svg>
);

export const ObsMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <circle cx="20" cy="16" r="9" />
    <circle cx="20" cy="16" r="3" />
    <path d="M40 12 a4 4 0 0 1 8 0 v8 a4 4 0 0 1 -8 0 z" />
    <path d="M56 22 c0 -3 8 -3 8 -6 c0 -3 -8 -3 -8 -6" />
  </svg>
);

export const TwitchMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <path d="M8 6 L8 22 L14 22 L14 26 L18 22 L24 22 L30 16 V6 Z" />
    <line x1="18" y1="11" x2="18" y2="17" />
    <line x1="24" y1="11" x2="24" y2="17" />
    <path d="M40 8 V24 H50" />
    <path d="M58 8 L66 24 M66 8 L58 24" />
    <path d="M76 8 V24 M72 8 H80" />
  </svg>
);

export const SupabaseMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...wm} {...p}>
    <path d="M18 4 L6 22 H18 V30 L30 12 H18 Z" />
    <path d="M40 22 c0 -3 8 -3 8 -6 c0 -3 -8 -3 -8 -6" />
    <path d="M54 8 V24 a4 4 0 0 0 8 0 V8" />
    <path d="M70 22 V12 a4 4 0 0 1 8 0 V22" />
    <path d="M70 16 H78" />
  </svg>
);

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M3 8 H13" />
    <path d="M9 4 L13 8 L9 12" />
  </svg>
);
