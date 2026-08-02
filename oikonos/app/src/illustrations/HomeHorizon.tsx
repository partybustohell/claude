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
const BX = 342;            // boat mast

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

const REACH = 84;          // how far the reflection can fall before it dies

function buildSea(): string {
  const rnd = mulberry32(0x0d3996);
  const out: string[] = [];

  // Reflection + haze below the waterline.
  for (let y = Y0 + 0.4; y < Y0 + REACH; y += 1.75) {
    const d = y - Y0;
    // gentle horizontal striation — water, not static
    const band = 0.82 + 0.26 * Math.sin(d * 0.66 + 0.4);
    // a clean death at the bottom so the drawing never reaches the type
    const life = Math.min(1, Math.max(0, (REACH - d) / 30)) ** 1.6;
    for (let x = -8; x < W + 16; x += 1.75) {
      const spread = 13 + d * 0.86;
      const plume = 1.35 * Math.exp(-d / 25) * gauss((x - BX) / spread);
      // the waterline itself: dense everywhere, densest under the boat
      const skin = 0.86 * Math.exp(-d / 6.6) * (0.12 + 0.88 * gauss((x - BX) / 196));
      const haze = 0.4 * Math.exp(-d / 16) * gauss((x - BX) / 140);
      const p = (plume + skin + haze) * band * life;
      if (p <= 0.014) continue;
      if (rnd() > p) continue;
      const s = 0.68 + 1.55 * Math.min(1, p) * (0.6 + 0.55 * rnd());
      out.push(sq(x + (rnd() - 0.5) * 1.6, y + (rnd() - 0.5) * 1.6, s));
    }
  }

  // A whisper of atmosphere clinging to the line from above.
  for (let y = Y0 - 13; y < Y0; y += 1.8) {
    const d = Y0 - y;
    for (let x = -6; x < W + 12; x += 2.2) {
      const p = 0.26 * Math.exp(-d / 4.2) * (0.3 + 0.7 * gauss((x - BX) / 220));
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.3, y + (rnd() - 0.5) * 1.3, 0.6 + rnd() * 0.75));
    }
  }
  return out.join('');
}

/* ---- sun glitter on the water: vermilion ------------------------ */

function buildGlitter(): string {
  const rnd = mulberry32(0xef422d);
  const out: string[] = [];
  for (let y = Y0 + 0.6; y < Y0 + 40; y += 1.9) {
    const d = y - Y0;
    const band = 0.66 + 0.48 * Math.sin(d * 0.8);
    const life = Math.min(1, (40 - d) / 14);
    for (let x = SUN_CX - 86; x < SUN_CX + 86; x += 1.9) {
      const col = 1.05 * Math.exp(-d / 12) * gauss((x - SUN_CX) / (8 + d * 0.6));
      const wash = 0.36 * Math.exp(-d / 5) * gauss((x - SUN_CX) / 72);
      const p = (col + wash) * band * life;
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.5, y + (rnd() - 0.5) * 1.5, 0.62 + 1.2 * p));
    }
  }
  return out.join('');
}

/* ---- the sun's own ink lay-down falloff: vermilion -------------- */

function buildSunEdge(): string {
  const rnd = mulberry32(0xc96a3f);
  const out: string[] = [];
  const R = SUN_R;
  for (let y = SUN_CY - R - 9; y < SUN_CY + R + 11; y += 1.3) {
    for (let x = SUN_CX - R - 9; x < SUN_CX + R + 11; x += 1.3) {
      const dx = x - SUN_CX;
      const dy = y - SUN_CY;
      const rad = Math.hypot(dx, dy);
      if (rad <= R - 0.2) continue;
      // heavier below: the ink pools away from the light
      // the ink pools away from the light: almost clean at the crown,
      // ragged along the lower-left shoulder where the pass ran out
      const bias = 0.03 + 0.97 * Math.min(1, Math.max(0, (dy - dx * 0.35) / R + 0.3));
      const p = 0.78 * Math.exp(-(rad - R) / 1.7) * bias;
      if (rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.0, y + (rnd() - 0.5) * 1.0, 0.55 + 1.0 * p));
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
          <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="3"
            seed="11" result="n" />
          <feColorMatrix
            in="n" type="matrix" result="sp"
            values="0 0 0 0 0.980
                    0 0 0 0 0.949
                    0 0 0 0 0.882
                    2.3 0 0 0 -1.62" />
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
          <stop offset="0" stopColor="var(--ink)" stopOpacity="0.34" />
          <stop offset="0.32" stopColor="var(--ink)" stopOpacity="0.56" />
          <stop offset="0.85" stopColor="var(--ink)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--ink)" stopOpacity="0.5" />
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
      <rect x={-4} y={Y0 - 0.5} width={W + 8} height="1" fill="url(#hz-line)" />
      <path d={SEA_D} fill="var(--ink)" />

      {/* ---- a far sail, for depth ---- */}
      <g transform={`translate(104 ${Y0})`} fill="var(--ink)" opacity="0.5">
        <path d="M0 -9 L0 -1.6 L4.8 -1.6 C3.2 -4.6 1.5 -7.3 0 -9 Z" />
        <path d="M-3.6 -1.3 L5.6 -1.3 C4.4 0.7 2.4 1.4 0.5 1.4 C-1.4 1.4 -2.9 0.7 -3.6 -1.3 Z" />
      </g>

      {/* ---- sloop: cobalt overprinting the sun ---- */}
      <g
        transform={`translate(${BX} ${Y0}) scale(1.08)`}
        fill="var(--ink)"
        filter="url(#hz-riso-fine)"
      >
        <rect x="-0.8" y="-52" width="1.6" height="44" rx="0.8" />
        {/* mainsail — vertical luff, bellied leech */}
        <path d="M2 -51.5 L2 -10 L17.4 -10 C13 -26.4 7.8 -40.6 2 -51.5 Z" />
        {/* jib */}
        <path d="M-2 -41 L-2 -10 L-14 -10 C-9 -22.4 -4.8 -33.4 -2 -41 Z" />
        {/* hull */}
        <path d="M-21.5 -8.6 L20.5 -8.6 C16.6 -1 8.4 1.8 -0.8 1.8 C-10 1.8 -17.4 -1.2 -21.5 -8.6 Z" />
      </g>
    </svg>
  );
}
