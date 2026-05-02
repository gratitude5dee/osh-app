// Fixed full-viewport film grain. Decorative.
// Uses a single tiny inline SVG (feTurbulence) repeated as a background tile.
// Honors prefers-reduced-motion via the .osh-grain CSS rule.

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
         <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`,
  );

export function GrainOverlay() {
  return (
    <div
      className="osh-grain"
      aria-hidden="true"
      style={{
        backgroundImage: `url("${GRAIN_SVG}")`,
        backgroundSize: "220px 220px",
      }}
    />
  );
}
