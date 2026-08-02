/**
 * HOME — "Landfall"
 *
 * A low vermilion sun sitting a finger's width above a hairline horizon,
 * a cobalt sloop crossing in front of it, and the sea beneath rendered
 * entirely as a graded dither: a dense plume directly under the hull that
 * widens and thins as it falls, plus a broad haze skimming the waterline.
 *
 * Two inks only — vermilion and cobalt — with the boat overprinting the
 * sun in `multiply` so the crossing reads as a real second pass on press.
 * The dither is generated once at module load from a seeded PRNG and
 * emitted as a single <path>, so the drawing is deterministic across
 * renders and costs one DOM node instead of two thousand.
 */

const W = 390;
const H = 274;
const Y0 = 152;            // horizon
const SUN_CX = 302;
const SUN_R = 52;
const SUN_CY = Y0 - 13 - SUN_R;
const BX = 330;            // boat mast

/* ---------------------------------------------------------------- */
/* Deterministic noise                                                */
/* ---------------------------------------------------------------- */

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n2 = (v: number) => Math.round(v * 100) / 100;
const sq = (x: number, y: number, s: number) =>
  `M${n2(x)} ${n2(y)}h${n2(s)}v${n2(s)}h${n2(-s)}z`;

const gauss = (t: number) => Math.exp(-t * t);

/* ---- the sea: cobalt ------------------------------------------- */

function buildSea(): string {
  const rnd = mulberry32(0x0d3996);
  const out: string[] = [];

  // Reflection + haze below the waterline.
  for (let y = Y0 + 0.4; y < H + 26; y += 1.95) {
    const d = y - Y0;
    // gentle horizontal striation — water, not static
    const band = 0.78 + 0.34 * Math.sin(d * 0.62 + 0.4);
    for (let x = -8; x < W + 16; x += 1.95) {
      const spread = 17 + d * 0.92;
      const plume = 1.02 * Math.exp(-d / 23) * gauss((x - BX) / spread);
      const haze = 0.66 * Math.exp(-d / 10.5) * gauss((x - BX) / 205);
      // a faint far-left drift so the dither reaches the gutter
      const drift = 0.1 * Math.exp(-d / 5.5) * gauss((x - 60) / 170);
      const p = (plume + haze + drift) * band;
      if (p <= 0.012) continue;
      if (rnd() > p) continue;
      const s = 0.62 + 1.45 * Math.min(1, p) * (0.62 + 0.5 * rnd());
      out.push(sq(x + (rnd() - 0.5) * 1.7, y + (rnd() - 0.5) * 1.7, s));
    }
  }

  // A whisper of atmosphere clinging to the line from above.
  for (let y = Y0 - 15; y < Y0; y += 1.9) {
    const d = Y0 - y;
    for (let x = -6; x < W + 12; x += 2.4) {
      const p = 0.2 * Math.exp(-d / 4.6) * gauss((x - BX) / 235);
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.4, y + (rnd() - 0.5) * 1.4, 0.6 + rnd() * 0.7));
    }
  }
  return out.join('');
}

/* ---- sun glitter on the water: vermilion ------------------------ */

function buildGlitter(): string {
  const rnd = mulberry32(0xef422d);
  const out: string[] = [];
  for (let y = Y0 + 0.6; y < Y0 + 46; y += 2.1) {
    const d = y - Y0;
    const band = 0.7 + 0.44 * Math.sin(d * 0.78);
    for (let x = SUN_CX - 90; x < SUN_CX + 90; x += 2.1) {
      const col = 0.72 * Math.exp(-d / 12) * gauss((x - SUN_CX) / (8 + d * 0.62));
      const wash = 0.2 * Math.exp(-d / 5.2) * gauss((x - SUN_CX) / 74);
      const p = (col + wash) * band;
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.6, y + (rnd() - 0.5) * 1.6, 0.6 + 1.15 * p));
    }
  }
  return out.join('');
}

/* ---- the sun's own ink lay-down falloff: vermilion -------------- */

function buildSunEdge(): string {
  const rnd = mulberry32(0xc96a3f);
  const out: string[] = [];
  const R = SUN_R;
  for (let y = SUN_CY - R - 16; y < SUN_CY + R + 18; y += 1.7) {
    for (let x = SUN_CX - R - 16; x < SUN_CX + R + 18; x += 1.7) {
      const dx = x - SUN_CX;
      const dy = y - SUN_CY;
      const rad = Math.hypot(dx, dy);
      if (rad <= R + 0.4) continue;
      // heavier below: the ink pools away from the light
      const bias = 0.24 + 0.76 * Math.min(1, Math.max(0, dy / R + 0.55));
      const p = 0.92 * Math.exp(-(rad - R) / 4.2) * bias;
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.4, y + (rnd() - 0.5) * 1.4, 0.6 + 1.2 * p));
    }
  }
  return out.join('');
}

const SEA_D = buildSea();
const GLITTER_D = buildGlitter();
const SUN_EDGE_D = buildSunEdge();

/* ---------------------------------------------------------------- */

export function HomeHorizon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="A low sun over a hairline sea horizon with a small sailboat"
      style={{ display: 'block', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        {/* Riso ink lay-down: paper-coloured specks knocked out of the field. */}
        <filter id="hz-riso" x="-6%" y="-6%" width="112%" height="112%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.58" numOctaves="4"
            seed="11" result="n" />
          <feColorMatrix
            in="n" type="matrix" result="sp"
            values="0 0 0 0 0.980
                    0 0 0 0 0.949
                    0 0 0 0 0.882
                    2.35 0 0 0 -1.42" />
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="spc" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="spc" />
          </feMerge>
        </filter>

        <filter id="hz-riso-fine" x="-8%" y="-8%" width="116%" height="116%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="3"
            seed="4" result="n" />
          <feColorMatrix
            in="n" type="matrix" result="sp"
            values="0 0 0 0 0.980
                    0 0 0 0 0.949
                    0 0 0 0 0.882
                    2.0 0 0 0 -1.30" />
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="spc" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="spc" />
          </feMerge>
        </filter>

        {/* The horizon rule thins as it runs away from the boat. */}
        <linearGradient id="hz-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--ink)" stopOpacity="0.16" />
          <stop offset="0.34" stopColor="var(--ink)" stopOpacity="0.30" />
          <stop offset="0.86" stopColor="var(--ink)" stopOpacity="0.44" />
          <stop offset="1" stopColor="var(--ink)" stopOpacity="0.24" />
        </linearGradient>
      </defs>

      {/* ---- sun ---- */}
      <g>
        <path d={SUN_EDGE_D} fill="var(--vermilion)" opacity="0.9" />
        <circle
          cx={SUN_CX} cy={SUN_CY} r={SUN_R}
          fill="var(--vermilion)" filter="url(#hz-riso)"
        />
      </g>

      {/* ---- sea ---- */}
      <path d={GLITTER_D} fill="var(--vermilion)" opacity="0.74" />
      <rect x={-4} y={Y0 - 0.55} width={W + 8} height="1.1" fill="url(#hz-line)" />
      <path d={SEA_D} fill="var(--ink)" />

      {/* ---- a far sail, for depth ---- */}
      <g transform={`translate(96 ${Y0})`} fill="var(--ink)" opacity="0.3">
        <path d="M0 -11.5 L0 -2 L6.6 -2 C4.4 -6 2 -9.4 0 -11.5 Z" />
        <path d="M-5 -1.6 L7.6 -1.6 C6 1 3.2 2 0.6 2 C-2 2 -4 1 -5 -1.6 Z" />
      </g>

      {/* ---- sloop: cobalt overprinting the sun ---- */}
      <g
        transform={`translate(${BX} ${Y0})`}
        fill="var(--ink)"
        style={{ mixBlendMode: 'multiply' }}
        filter="url(#hz-riso-fine)"
      >
        <rect x="-0.85" y="-52" width="1.7" height="44" rx="0.85" />
        {/* mainsail — vertical luff, bellied leech */}
        <path d="M1.5 -51.5 L1.5 -10 L17 -10 C12.6 -26.4 7.4 -40.6 1.5 -51.5 Z" />
        {/* jib */}
        <path d="M-1.5 -41 L-1.5 -10 L-13.6 -10 C-8.6 -22.4 -4.4 -33.4 -1.5 -41 Z" />
        {/* hull */}
        <path d="M-21.5 -8.6 L20.5 -8.6 C16.6 -1 8.4 1.8 -0.8 1.8 C-10 1.8 -17.4 -1.2 -21.5 -8.6 Z" />
      </g>
    </svg>
  );
}
