/**
 * HOME — "Into the sunset"
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────────
 * The sun is the only light in this picture. It is low, it is LEFT of
 * the sloop, and it is behind it. Everything is derived from that one
 * fact and nothing contradicts it:
 *
 *   · the sloop is a back-lit silhouette. Its lit plane is the port bow
 *     — the jib, whose luff carries a knocked-out paper rim; its mid
 *     plane is the mainsail, which turns away from the light as it
 *     runs aft; its shadow plane is the leech, the transom and the
 *     turn of the bilge, which stay solid ink with no speck at all;
 *   · the paper grain on every shape is densest where the light rakes
 *     it and closes to solid ink in the turn away, per shape, with its
 *     own density law — there is no filter over this drawing;
 *   · the trap (the paper knock-out that separates boat from sun) is
 *     misregistered up-and-LEFT, towards the light, everywhere;
 *   · the reflection — the boat's cast shadow on its ground — falls
 *     straight down the line between the light and the eye, and it is
 *     shaped by the boat's own silhouette, not by a gaussian blob;
 *   · the sun's lower limb is CUT by the water. It is setting.
 *
 * ── GROUND CONTACT ───────────────────────────────────────────────────
 * Nothing sits on the cut line. The hull's keel is 3px under it, a
 * paper boot-top marks where the water crosses the planking, a crest
 * of dots piles at the raked stem and a wake trails aft of the square
 * transom, so the vessel has a heading and a disturbance.
 *
 * ── MATERIAL ─────────────────────────────────────────────────────────
 * Three water scales, not one: a fine tight tooth at the horizon
 * (far material), a mid band with wave striation, and a coarse loose
 * near field in a lifted value that dies inside 50px. Dot size grows
 * and value lifts with distance from the horizon, so the field has
 * real atmospheric decay. Everything is placed by a seeded PRNG at
 * module load — deterministic, one <path> per pass.
 */

const W = 390;
const H = 210;
const Y0 = 150;              // the waterline

const SUN_CX = 306;
const SUN_CY = 108;
const SUN_R = 48;            // lower limb at 156 — 6px under the water

const BX = 328;              // mast foot, standing on the waterline
const RX = 326;              // reflection axis (hull centroid)
const REACH = 52;            // the water dies here. It never reaches type.

/* ---------------------------------------------------------------- */
/* Deterministic scatter                                             */
/* ---------------------------------------------------------------- */

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rnd = () => number;

const n1 = (v: number) => Math.round(v * 10) / 10;
const sq = (x: number, y: number, s: number) =>
  `M${n1(x)} ${n1(y)}h${n1(s)}v${n1(s)}h${n1(-s)}z`;

const gauss = (t: number) => Math.exp(-t * t);
const cl01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Lay a field of square specks whose probability AND size are functions
 *  of position — the only texture mechanism in this file. */
function scatter(
  rnd: Rnd, out: string[],
  x0: number, x1: number, y0: number, y1: number, step: number,
  density: (x: number, y: number) => number,
  size: (p: number, x: number, y: number) => number,
) {
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const p = density(x, y);
      if (p <= 0.005) continue;
      if (rnd() > p) continue;
      out.push(sq(
        x + (rnd() - 0.5) * step,
        y + (rnd() - 0.5) * step,
        size(p, x, y) * (0.78 + 0.44 * rnd()),
      ));
    }
  }
}

/* ---------------------------------------------------------------- */
/* The sloop — drawn, not struck from a geometry tool                */
/* Local origin: mast foot, sitting on the waterline.                */
/* Bow to the left (into the sun), transom to the right.             */
/* ---------------------------------------------------------------- */

/* raked stem forward · sprung sheer · squared, aft-raking transom ·
   rockered keel that is deepest just abaft amidships */
const HULL =
  'M-26 -11 C-16.4 -9.2 4 -8.1 22 -9.6 L20 -0.6 ' +
  'C12 3.2 -6 3.4 -18 -1.6 C-21.6 -3.6 -25.1 -7 -26 -11 Z';
const STEM  = 'M-18 -1.6 C-21.6 -3.6 -25.1 -7 -26 -11';
const SHEER = 'M-26 -11 C-19 -9.7 -8 -8.7 2 -8.3';
const BOOT  = 'M-17.4 -0.15 C-8 0.5 8 0.6 20 -0.6';
const TRANSOM = 'M22 -9.6 L20 -0.6';

/* tapering spar with a touch of aft rake — 2.0 at the partners, 0.8 at the
   truck, and standing 4px proud of the sail heads so the rig has a point */
const MAST = 'M-1 -9.4 L0.5 -60 L1.3 -60 L1 -9.4 Z';
const BOOM = 'M0.6 -9.3 L20 -10.8 L20 -12.2 L0.6 -10.7 Z';

/* mainsail: luff on the mast, foot on the boom, convex roach in the leech */
const MAIN = 'M2.1 -55.4 L2.3 -10.9 L19.4 -12.3 C17.8 -26 11.4 -42.6 2.1 -55.4 Z';
/* jib: luff straight on the forestay from truck to stemhead, clew inboard,
   sheeted in hard so the slot to the mainsail is a hairline */
const JIB  = 'M-1.1 -53.4 L-24.2 -10.6 C-18 -11.7 -10 -11.4 -3.3 -10.3 ' +
             'C-2.9 -24.6 -2 -39.4 -1.1 -53.4 Z';
const LUFF = 'M-1.1 -53.4 L-24.2 -10.6';
/* Knock-outs. The slot between jib leech and mainsail luff, and the strip
   between the sails' feet and the deck, are lifted out of whatever is
   behind the rig — so the rig always reads as rig, never as one blue mass
   with the sun leaking through it. The ink is laid back over the top. */
const SLOT =
  'M-1.1 -53.4 L2.1 -55.4 L2.3 -9.6 L-3.6 -9.6 C-2.9 -24.6 -2 -39.4 -1.1 -53.4 Z' +
  'M-25 -11 C-18 -12 -10 -11.7 -3.3 -10.5 L0.6 -10.6 L20.4 -11.7 L20.4 -8.6 ' +
  'C10 -7.6 -6 -7.8 -25 -10.6 Z';

/* ---- per-shape grain --------------------------------------------- */

/** jib — the lit plane. Paper opens up along the luff, closes aft. */
function buildJibGrain(): string {
  const rnd = mulberry32(0x1b7f21);
  const out: string[] = [];
  scatter(rnd, out, -25, 0.4, -54, -9.6, 1.0,
    (x, y) => {
      const w = 1 - cl01((x + 24.2) / 24);      // 1 at the luff
      const v = cl01((-y - 10) / 45);           // 1 at the head
      return 0.46 * Math.pow(w, 1.2) * (0.3 + 0.7 * v);
    },
    () => 0.46);
  return out.join('');
}

/** mainsail — the mid plane. Belly catches it, leech turns away to solid. */
function buildMainGrain(): string {
  const rnd = mulberry32(0x2c40a9);
  const out: string[] = [];
  scatter(rnd, out, 1.6, 20, -56, -10.4, 1.05,
    (x, y) => {
      const u = 1 - cl01((x - 2.2) / 17);       // 1 at the luff, 0 at the leech
      const v = cl01((-y - 11) / 45);
      return 0.32 * Math.pow(u, 1.45) * (0.26 + 0.74 * v);
    },
    () => 0.46);
  return out.join('');
}

/** hull — sheer and port bow lit, turn of the bilge and counter solid. */
function buildHullGrain(): string {
  const rnd = mulberry32(0x3f9d55);
  const out: string[] = [];
  scatter(rnd, out, -26, 22, -11.5, 3.6, 0.85,
    (x, y) => {
      const fwd = 1 - cl01((x + 26) / 48);      // 1 at the bow
      const up = cl01((-y) / 11);               // 1 at the sheer
      return 0.36 * (0.2 + 0.8 * fwd) * (0.18 + 0.82 * up * up);
    },
    () => 0.42);
  return out.join('');
}

/* ---------------------------------------------------------------- */
/* The sun — ink laid thick at the core, opening at the limb         */
/* ---------------------------------------------------------------- */

function buildSunGrain(): string {
  const rnd = mulberry32(0xd8511a);
  const out: string[] = [];
  scatter(rnd, out,
    SUN_CX - SUN_R, SUN_CX + SUN_R, SUN_CY - SUN_R, Y0, 2.0,
    (x, y) => {
      const rad = Math.hypot(x - SUN_CX, y - SUN_CY) / SUN_R;
      if (rad > 1) return 0;
      // radial: the pass is solid at the core and opens towards the limb
      const drift = 0.88 + 0.12 * ((y - SUN_CY) / SUN_R);   // faintest of biases
      return (0.035 + 0.34 * Math.pow(rad, 2.6)) * drift;
    },
    (p) => 0.58 + 0.6 * p);
  return out.join('');
}

/** A symmetric dissolve at the limb — the same all the way round, so it
 *  reads as ink falling off a curve and never as stray pixels. */
function buildSunLimb(): string {
  const rnd = mulberry32(0xa2371f);
  const out: string[] = [];
  scatter(rnd, out,
    SUN_CX - SUN_R - 5, SUN_CX + SUN_R + 5, SUN_CY - SUN_R - 5, Y0, 0.85,
    (x, y) => {
      const rad = Math.hypot(x - SUN_CX, y - SUN_CY);
      if (rad <= SUN_R - 0.3) return 0;
      return 0.58 * Math.exp(-(rad - SUN_R) / 0.9);
    },
    (p) => 0.4 + 0.5 * p);
  return out.join('');
}

/* ---------------------------------------------------------------- */
/* The water                                                         */
/* ---------------------------------------------------------------- */

/** A whisper-fine dotted rule that dissolves at both frame edges. */
function buildWaterline(): string {
  const rnd = mulberry32(0x77b1c3);
  const out: string[] = [];
  for (let x = -4; x < W + 4; x += 0.8) {
    const edge = cl01((x + 10) / 40) * cl01((W + 10 - x) / 40);
    const p = (0.26 + 0.36 * gauss((x - RX) / 230)) * (0.3 + 0.7 * edge);
    if (rnd() > p) continue;
    out.push(sq(x, Y0 - 0.5 + (rnd() - 0.5) * 0.9, 0.42 + rnd() * 0.5));
  }
  return out.join('');
}

/** Low-frequency swell. Without it the field is statistically uniform,
 *  which is exactly how a stamped texture looks — this gives the water
 *  clumps and clearings, the way a real dither pools. */
const swell = (x: number, y: number) =>
  0.5 + 0.5 * Math.sin(x * 0.079 + Math.sin(y * 0.14) * 1.7 + Math.cos(x * 0.029) * 2.3);

/** Far material: tight, fine tooth hugging the horizon. */
function buildSeaFar(): string {
  const rnd = mulberry32(0x51a30d);
  const out: string[] = [];
  scatter(rnd, out, -6, W + 6, Y0 + 0.3, Y0 + 19, 1.1,
    (x, y) => {
      const d = y - Y0;
      const lat = 0.4 + 0.6 * gauss((x - RX) / 400);
      const band = 0.8 + 0.3 * Math.sin(d * 1.2 + 0.6);
      return 0.62 * Math.exp(-d / 6.6) * lat * band * (0.42 + 0.86 * swell(x, y));
    },
    () => 0.56);
  // a breath of atmosphere clinging to the line from above
  scatter(rnd, out, -6, W + 6, Y0 - 13, Y0, 1.9,
    (x, y) => {
      const d = Y0 - y;
      return 0.2 * Math.exp(-d / 4.3) * (0.32 + 0.68 * gauss((x - 280) / 240));
    },
    () => 0.52);
  return out.join('');
}

/** Mid material: wave striation, coarser dot, half the density. */
function buildSeaMid(): string {
  const rnd = mulberry32(0x93ce41);
  const out: string[] = [];
  scatter(rnd, out, -6, W + 6, Y0 + 0.5, Y0 + 40, 1.5,
    (x, y) => {
      const d = y - Y0;
      const band = 0.62 + 0.46 * Math.sin(d * 0.62 + Math.cos(x * 0.045) * 1.1);
      const broad = 0.56 * Math.exp(-d / 13) * (0.22 + 0.78 * gauss((x - 300) / 250));
      return broad * band * cl01((42 - d) / 13) * (0.5 + 0.8 * swell(x * 0.8, y));
    },
    (p, _x, y) => 0.56 + 0.009 * (y - Y0) + 0.3 * p);
  return out.join('');
}

/** The boat's own half-beam at a given height — the profile the
 *  reflection borrows so it keeps the vessel's silhouette. */
function boatHalf(d: number): number {
  if (d <= 2.5) return 19;              // hull, at the waterline
  if (d <= 10) return 19 - (d - 2.5) * 0.8;
  if (d <= 15) return 13;               // boom and the foot of the sails
  return Math.max(1.5, 13 - (d - 15) * 0.31);     // rig, tapering to the truck
}

/** Near material. `lift` splits the pass in two values so the field
 *  loses weight as it falls, not just density. */
function buildSeaNear(from: number, to: number, seed: number): string {
  const rnd = mulberry32(seed);
  const out: string[] = [];
  scatter(rnd, out, RX - 88, RX + 88, Y0 + from, Y0 + to, 1.35,
    (x, y) => {
      const d = y - Y0;
      const hw = boatHalf(d) * (1 + d * 0.006);
      const t = Math.abs(x - RX) / hw;
      const core = Math.exp(-d / 38) * (t < 1 ? 1 : Math.exp(-(t - 1) * (t - 1) * 3.1));
      const ripple = 0.44 + 0.56 * Math.abs(Math.sin(d * 0.52 + 0.4));
      // the shadow the hull casts on its own ground: near-solid at contact
      const contact = 1.3 * Math.exp(-d / 3.2) * (t < 1.02 ? 1 : 0);
      return (1.45 * core * ripple * (0.55 + 0.72 * swell(x, y * 1.3)) + contact)
        * cl01((REACH - d) / 17);
    },
    (p, _x, y) => 0.62 + 0.011 * (y - Y0) + 0.35 * p);
  // the broad haze to port: sparse, coarse, gone by two thirds of REACH
  scatter(rnd, out, -6, RX - 40, Y0 + from, Y0 + to, 2.0,
    (x, y) => {
      const d = y - Y0;
      const ripple = 0.5 + 0.5 * Math.abs(Math.sin(d * 0.44 + x * 0.01));
      return 0.34 * Math.exp(-d / 15.5) * gauss((x - 150) / 185) * ripple
        * (0.55 + 0.72 * swell(x * 0.7, y * 0.8)) * cl01((REACH - 6 - d) / 17);
    },
    (_p, _x, y) => 0.56 + 0.012 * (y - Y0));
  return out.join('');
}

/** Ground contact: a crest piling at the raked stem, a wake streaming
 *  aft of the transom. Both agree with a boat making way to port. */
function buildWake(): string {
  const rnd = mulberry32(0x0be417);
  const out: string[] = [];
  scatter(rnd, out, BX - 42, BX + 58, Y0 - 1.2, Y0 + 6, 0.9,
    (x, y) => {
      const d = Math.abs(y - Y0 - 0.6);
      const bow = 0.85 * gauss((x - (BX - 27)) / 6.5);
      const aft = x > BX + 20 ? 0.6 * Math.exp(-(x - BX - 20) / 17) : 0;
      return (bow + aft) * Math.exp(-d / 1.7);
    },
    () => 0.62);
  return out.join('');
}

/** Where the limb goes under, the vermilion carries a couple of pixels
 *  into the water and stops dead — a wet edge, not a spray. Anything
 *  looser than this reads as dirt on the scanner. */
function buildGlitter(): string {
  const rnd = mulberry32(0xef422d);
  const out: string[] = [];
  scatter(rnd, out, SUN_CX - 22, SUN_CX + 22, Y0 + 0.2, Y0 + 4.2, 0.8,
    (x, y) => {
      const d = y - Y0;
      return 1.25 * Math.exp(-d / 1.5) * gauss((x - SUN_CX) / 19);
    },
    () => 0.7);
  return out.join('');
}

/* ---- baked once at module load ---------------------------------- */

const D_WATERLINE = buildWaterline();
const D_SEA_FAR = buildSeaFar();
const D_SEA_MID = buildSeaMid();
const D_SEA_NEAR_A = buildSeaNear(0.4, 24, 0x6d1cf3);
const D_SEA_NEAR_B = buildSeaNear(24, REACH, 0x21ae08);
const D_WAKE = buildWake();
const D_GLITTER = buildGlitter();
const D_SUN_GRAIN = buildSunGrain();
const D_SUN_LIMB = buildSunLimb();
const D_JIB_GRAIN = buildJibGrain();
const D_MAIN_GRAIN = buildMainGrain();
const D_HULL_GRAIN = buildHullGrain();

/* ---------------------------------------------------------------- */

export function HomeHorizon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="A sloop crossing a low sun that is setting into the sea"
      style={{ display: 'block', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        {/* the sea's edge cuts the sun's lower limb */}
        <clipPath id="hz-abovewater" clipPathUnits="userSpaceOnUse">
          <rect x={-8} y={0} width={W + 16} height={Y0} />
        </clipPath>
        <clipPath id="hz-disc" clipPathUnits="userSpaceOnUse">
          <circle cx={SUN_CX} cy={SUN_CY} r={SUN_R} />
        </clipPath>
        {/* per-shape grain masks, in the boat's own user space */}
        <clipPath id="hz-jib" clipPathUnits="userSpaceOnUse"><path d={JIB} /></clipPath>
        <clipPath id="hz-main" clipPathUnits="userSpaceOnUse"><path d={MAIN} /></clipPath>
        <clipPath id="hz-hull" clipPathUnits="userSpaceOnUse"><path d={HULL} /></clipPath>
      </defs>

      {/* ---- sun: a disc the water cuts ---- */}
      <g clipPath="url(#hz-abovewater)">
        <path d={D_SUN_LIMB} fill="var(--vermilion)" opacity="0.92" />
        <circle cx={SUN_CX} cy={SUN_CY} r={SUN_R} fill="var(--vermilion)" />
        <g clipPath="url(#hz-disc)">
          <path d={D_SUN_GRAIN} fill="var(--paper)" opacity="0.9" />
        </g>
      </g>

      {/* ---- water: vermilion glitter first, cobalt over it ---- */}
      <path d={D_GLITTER} fill="var(--vermilion)" opacity="0.78" />
      <path d={D_WATERLINE} fill="var(--ink)" opacity="0.92" />
      <path d={D_SEA_FAR} fill="var(--ink)" opacity="0.95" />
      <path d={D_SEA_MID} fill="var(--ink)" opacity="0.82" />

      {/* ---- the sloop ---- */}
      <g transform={`translate(${BX} ${Y0})`}>
        {/* trap: paper knocked out around the silhouette, misregistered
            up-and-left towards the light */}
        <path d={SLOT} fill="var(--paper)" opacity="0.97" />
        <g
          transform="translate(-0.6 -0.4)"
          fill="var(--paper)" stroke="var(--paper)" strokeWidth="0.95"
          strokeLinejoin="round" strokeLinecap="round" opacity="0.97"
        >
          <path d={HULL} />
          <path d={MAST} />
          <path d={BOOM} />
          <path d={MAIN} />
          <path d={JIB} />
        </g>

        {/* ink */}
        <g fill="var(--ink)">
          <path d={HULL} />
          <path d={MAST} />
          <path d={BOOM} />
          <path d={MAIN} />
          <path d={JIB} />
        </g>

        {/* per-shape grain: lit planes open, shadow planes stay solid */}
        <g clipPath="url(#hz-jib)"><path d={D_JIB_GRAIN} fill="var(--paper)" opacity="0.95" /></g>
        <g clipPath="url(#hz-main)"><path d={D_MAIN_GRAIN} fill="var(--paper)" opacity="0.9" /></g>
        <g clipPath="url(#hz-hull)"><path d={D_HULL_GRAIN} fill="var(--paper)" opacity="0.85" /></g>

        {/* rim: only on edges the sun can see */}
        <g fill="none" stroke="var(--paper)" strokeLinecap="round">
          <path d={LUFF} strokeWidth="0.85" opacity="0.85" />
          <path d={STEM} strokeWidth="0.9" opacity="0.7" />
          <path d={SHEER} strokeWidth="0.8" opacity="0.5" />
          <path d={BOOT} strokeWidth="0.85" opacity="0.62" />
        </g>
        {/* and the one edge it cannot: the transom stays shut */}
        <path d={TRANSOM} fill="none" stroke="var(--ink-deep)" strokeWidth="0.9" opacity="0.6" />
      </g>

      {/* ---- near water, over the submerged planking ---- */}
      <path d={D_WAKE} fill="var(--ink)" opacity="0.8" />
      <path d={D_SEA_NEAR_A} fill="var(--ink)" opacity="0.86" />
      <path d={D_SEA_NEAR_B} fill="var(--ink-lift)" opacity="0.74" />
    </svg>
  );
}
