/**
 * WELCOME — the cliff village.
 *
 * Built to the art director's supplied reference, whose whole character
 * comes from three decisions:
 *
 *   1. The headland is not a filled shape with a curved top. It is a
 *      ridge crest with a run of erosion flutes falling down-slope from
 *      it, each flute a scalloped wedge in one of four greens. The
 *      alternation of those greens is what makes the mass read as
 *      terrain rather than as a slab — the earlier version's single
 *      filled path is exactly what lost the first blind duel.
 *
 *   2. The village cascades. Every house is a cream front face, a
 *      shadowed return on the side the light cannot reach, and a bright
 *      top plane — stepping down the crest at the crest's own rake, so
 *      the settlement follows the land instead of sitting on it.
 *
 *   3. One sun, upper left. Flute shading, house returns, the dome's
 *      terminator and every cast shadow derive from that one direction,
 *      and nothing contradicts it.
 *
 * Everything is deterministic — a seeded PRNG generates the flute edges
 * and the grain speckle — so the drawing is identical on every render
 * and can be diffed between screenshots.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { gentle } from '../lib/motion';

const W = 390;
const H = 646;

/* ---- the greens and creams, light to dark ---- */
const G_LIT = '#4a8a5d';    // flute turned toward the sun
const G_MID = '#37764a';    // the body of the hill
const G_DEEP = '#28603a';   // flute turned away
const G_DARK = '#1d4a2c';   // deepest gullies, cypress, dome, openings
const CREAM = '#f0e6c8';    // lit house face
const CREAM_HI = '#fbf5e4'; // top planes catching the sky
const CREAM_MID = '#dfd0aa';// the plane the sun only grazes

/* ================================================================
   Deterministic noise
   ================================================================ */

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r2 = (v: number) => Math.round(v * 10) / 10;

/* ================================================================
   The ridge crest
   ----------------------------------------------------------------
   A polyline from the bottom-left corner up to the right edge. Every
   other shape is positioned by sampling it, so the village and the
   flutes can never drift off the land.
   ================================================================ */

const CREST: [number, number][] = [
  [-14, 640], [26, 566], [62, 505], [96, 452], [128, 402],
  [158, 356], [186, 315], [214, 276], [242, 240], [270, 208],
  [298, 180], [326, 158], [352, 142], [378, 130], [404, 124],
];

/** Crest y at a given x, by linear interpolation between vertices. */
function crestY(x: number): number {
  for (let i = 0; i < CREST.length - 1; i++) {
    const [x0, y0] = CREST[i];
    const [x1, y1] = CREST[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return CREST[CREST.length - 1][1];
}

/** The crest drawn as a smoothed path. */
function crestPath(): string {
  let d = `M${CREST[0][0]} ${CREST[0][1]}`;
  for (let i = 0; i < CREST.length - 1; i++) {
    const [x0, y0] = CREST[i];
    const [x1, y1] = CREST[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` Q${r2(x0 + (mx - x0) * 0.6)} ${r2(y0 - (y0 - y1) * 0.18)} ${r2(mx)} ${r2((y0 + y1) / 2)}`;
    d += ` Q${r2(x1 - (x1 - mx) * 0.6)} ${r2(y1 + (y0 - y1) * 0.18)} ${r2(x1)} ${r2(y1)}`;
  }
  return d;
}

const CREST_D = crestPath();
const MASS_D = `${CREST_D} L${W + 14} ${H + 14} L-14 ${H + 14} Z`;

/* ================================================================
   Erosion flutes
   ----------------------------------------------------------------
   Each flute starts on the crest and falls down-slope on a wavy edge.
   Scallop amplitude grows with distance from the crest, so the ribs
   spread the way real gullies do instead of running as parallel
   stripes.
   ================================================================ */

interface Flute { d: string; fill: string }

function buildFlutes(): Flute[] {
  const rnd = mulberry32(0x5a17a);
  const out: Flute[] = [];
  const palette = [G_LIT, G_DEEP, G_MID, G_DARK, G_LIT, G_MID, G_DEEP, G_MID];

  let i = 0;
  for (let cx = -20; cx < W + 40; cx += 24 + rnd() * 10) {
    const width = 19 + rnd() * 17;
    const cy = crestY(cx);
    const cy2 = crestY(cx + width);
    const drop = H + 30 - Math.min(cy, cy2);
    const drift = -16 - rnd() * 26;    // gullies lean back toward the left
    const steps = 7;
    const phase = rnd() * 6.28;

    const edge = (sx: number, sy: number, ph: number) => {
      const pts: string[] = [];
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const amp = 8.5 * t * t + 1.6;                  // scallops grow downhill
        const wob = Math.sin(ph + t * 5.4) * amp
                  + Math.sin(ph * 1.7 + t * 11) * amp * 0.35;
        pts.push(`${r2(sx + drift * t + wob)} ${r2(sy + drop * t)}`);
      }
      return pts;
    };

    const left = edge(cx, cy, phase);
    const right = edge(cx + width, cy2, phase + 1.9);

    let d = `M${r2(cx)} ${r2(cy)}`;
    for (const p of left) d += ` L${p}`;
    d += ` L${r2(cx + width + drift)} ${H + 30}`;
    for (const p of [...right].reverse()) d += ` L${p}`;
    d += ` L${r2(cx + width)} ${r2(cy2)} Z`;

    out.push({ d, fill: palette[i % palette.length] });
    i++;
  }
  return out;
}

const FLUTES = buildFlutes();

/* ---- speckle, denser in the shadowed body than at the lit crest ---- */

function buildSpeckle(seed: number, count: number, dark: boolean): string {
  const rnd = mulberry32(seed);
  const out: string[] = [];
  let placed = 0;
  let guard = 0;
  while (placed < count && guard++ < count * 26) {
    const x = rnd() * (W + 30) - 15;
    const y = rnd() * (H + 20);
    const cy = crestY(x);
    if (y < cy + 4) continue;                        // stay on the land
    const depth = (y - cy) / (H - cy + 1);           // 0 at crest, 1 at foot
    const p = dark ? 0.22 + depth * 0.78 : 0.82 - depth * 0.64;
    if (rnd() > p) continue;
    const s = 0.5 + rnd() * 1.3;
    out.push(`M${r2(x)} ${r2(y)}h${r2(s)}v${r2(s)}h-${r2(s)}Z`);
    placed++;
  }
  return out.join('');
}

const SPECK_DARK = buildSpeckle(0x2e7349, 900, true);
const SPECK_LIGHT = buildSpeckle(0x9f31a, 520, false);

/** Sky tooth, so the cobalt field is never mathematically flat. */
function buildSky(): string {
  const rnd = mulberry32(0x13a8);
  const out: string[] = [];
  for (let n = 0; n < 900; n++) {
    const x = rnd() * W;
    const y = rnd() * (H * 0.86);
    if (y > crestY(x) - 6) continue;
    const s = 0.5 + rnd() * 1.1;
    out.push(`M${r2(x)} ${r2(y)}h${r2(s)}v${r2(s)}h-${r2(s)}Z`);
  }
  return out.join('');
}
const SKY_SPECK = buildSky();

/* ================================================================
   The village
   ----------------------------------------------------------------
   Each house is an axonometric box: front face, a right return the sun
   cannot see, and a top plane. `lift` nudges a house off the crest so
   the settlement stacks rather than sitting in one row.
   ================================================================ */

interface House {
  x: number; w: number; h: number;
  lift?: number;
  depth?: number;
  /** [dx, dy, w, h, arched?] relative to the front face's top-left */
  holes?: [number, number, number, number, boolean?][];
}

/* `lift` is always positive: a house sits ON the ridge or below it, never
   above it. A negative lift floated the box clear of the land, which was
   the most visible fault in the first pass. */
const HOUSES: House[] = [
  { x: 182, w: 44, h: 38, lift: 44, holes: [[9, 15, 9, 13, true], [27, 19, 8, 9]] },
  { x: 206, w: 34, h: 29, lift: 74, holes: [[12, 11, 8, 12, true]] },
  { x: 216, w: 50, h: 44, lift: 30, holes: [[10, 17, 10, 15, true], [31, 13, 9, 10]] },
  { x: 244, w: 38, h: 32, lift: 54, holes: [[13, 12, 9, 13, true]] },
  { x: 254, w: 54, h: 48, lift: 16, holes: [[12, 19, 11, 17, true], [35, 15, 9, 11]] },
  { x: 292, w: 42, h: 36, lift: 50, holes: [[15, 14, 9, 14, true]] },
  { x: 302, w: 56, h: 52, lift: 14, holes: [[13, 21, 11, 17, true], [37, 17, 10, 12]] },
  { x: 340, w: 46, h: 40, lift: 46, holes: [[15, 15, 10, 15, true]] },
  { x: 348, w: 56, h: 62, lift: 10, holes: [[14, 25, 11, 18, true], [35, 19, 10, 12]] },
];

/** Low cream platforms. The projection is shallow — an earlier version
    offset the top plane by 30% of the slab's width, which cantilevered it
    into the sky and read as a diving board. */
const TERRACES: [number, number, number, number][] = [
  [214, 46, 44, 7], [266, 34, 42, 7], [318, 28, 40, 7],
];

/**
 * The wall that carries a house.
 *
 * The ridge rises to the right, so an axis-aligned box seated on the
 * crest is buried on its uphill side and hangs in the air on its
 * downhill one. Real hill villages solve this with tall retaining walls
 * on the downhill face, and so does the comp. This samples the crest
 * across the house's footprint and fills everything between the flat
 * base and the land — which is nothing at all on the uphill side, and a
 * full storey of whitewashed wall on the downhill one.
 */
function footing(x: number, w: number, ground: number): string {
  const steps = 8;
  let d = `M${x} ${r2(ground)} L${x + w} ${r2(ground)}`;
  for (let i = steps; i >= 0; i--) {
    const sx = x + (w * i) / steps;
    d += ` L${r2(sx)} ${r2(Math.max(ground, crestY(sx) + 4))}`;
  }
  return d + ' Z';
}

/* ================================================================ */

export function WelcomeCliff({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();

  const rise = (delay: number, y = 18) =>
    reduce
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { ...gentle, delay },
        };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="A whitewashed Greek village cascading down a steep green headland, with a domed church and a cypress at its crown"
      preserveAspectRatio="xMidYMax slice"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Riso mottle: the field shows through the ink unevenly. */}
        <filter id="wc-grain" x="-6%" y="-6%" width="112%" height="112%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.62"
            numOctaves="4" seed="11" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.30 0.20 0 0 0.66" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        {/* A finer plate for the whitewash, which stays crisper. */}
        <filter id="wc-grain-fine" x="-6%" y="-6%" width="112%" height="112%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.05"
            numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.20 0.14 0 0 0.80" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        <clipPath id="wc-mass"><path d={MASS_D} /></clipPath>
      </defs>

      {/* ---------------- sky tooth ---------------- */}
      <path d={SKY_SPECK} fill="#5f83d6" opacity="0.28" />

      {/* ---------------- the headland ---------------- */}
      <motion.g {...rise(0.12, 26)}>
        <g filter="url(#wc-grain)">
          <path d={MASS_D} fill={G_MID} />
          <g clipPath="url(#wc-mass)">
            {FLUTES.map((f, i) => <path key={i} d={f.d} fill={f.fill} />)}
          </g>
        </g>

        <g clipPath="url(#wc-mass)">
          <path d={SPECK_LIGHT} fill="#8fc79f" opacity="0.22" />
          <path d={SPECK_DARK} fill="#12331f" opacity="0.30" />
          {/* the foot of the hill falls away from the light */}
          <path
            d={`M-14 ${H * 0.64}L${W + 14} ${H * 0.32}L${W + 14} ${H + 14}L-14 ${H + 14}Z`}
            fill="#0f2f1c" opacity="0.15"
          />
        </g>

        {/* the crest catches a hairline of sun */}
        <path d={CREST_D} fill="none" stroke="#9ed4ad" strokeWidth="1.5"
          opacity="0.45" strokeLinecap="round" />
      </motion.g>

      {/* ---------------- terraces ---------------- */}
      <motion.g {...rise(0.24, 20)} filter="url(#wc-grain-fine)">
        {TERRACES.map(([x, dy, w, h], i) => {
          const y = crestY(x) + dy;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y}L${x + w} ${r2(y - w * 0.12)}L${x + w} ${r2(y - w * 0.12 + h)}L${x} ${y + h}Z`}
                fill={CREAM_MID}
              />
              <path
                d={`M${x} ${y}L${x + w} ${r2(y - w * 0.12)}L${x + w - 3} ${r2(y - w * 0.12 + 2.4)}L${x - 3} ${y + 2.4}Z`}
                fill={CREAM_HI}
              />
            </g>
          );
        })}
      </motion.g>

      {/* ---------------- the village ---------------- */}
      <motion.g {...rise(0.34, 24)}>
        <g filter="url(#wc-grain-fine)">
          {HOUSES.map((hs, i) => {
            const ground = crestY(hs.x) + (hs.lift ?? 0);
            const top = ground - hs.h;
            const d = hs.depth ?? 11;
            return (
              <g key={i}>
                {/* the retaining wall that carries it on the downhill side */}
                <path d={footing(hs.x, hs.w, ground)} fill={CREAM_MID} />
                <path d={footing(hs.x, hs.w, ground)} fill={G_DARK} opacity="0.14" />
                {/* the shadow the house throws downhill and right */}
                <path
                  d={`M${hs.x + hs.w} ${r2(ground)}L${hs.x + hs.w + d + 5} ${r2(ground + 4)}` +
                     `L${hs.x + hs.w + d} ${r2(ground + 9)}L${hs.x + hs.w - 10} ${r2(ground + 4)}Z`}
                  fill={G_DARK} opacity="0.34"
                />
                {/* return face — the side the sun cannot reach */}
                <path
                  d={`M${hs.x + hs.w} ${r2(top)}L${hs.x + hs.w + d} ${r2(top - d * 0.55)}` +
                     `L${hs.x + hs.w + d} ${r2(ground - d * 0.55)}L${hs.x + hs.w} ${r2(ground)}Z`}
                  fill={G_DEEP}
                />
                {/* top plane, catching the sky */}
                <path
                  d={`M${hs.x} ${r2(top)}L${hs.x + hs.w} ${r2(top)}` +
                     `L${hs.x + hs.w + d} ${r2(top - d * 0.55)}L${hs.x + d} ${r2(top - d * 0.55)}Z`}
                  fill={CREAM_HI}
                />
                {/* front face */}
                <rect x={hs.x} y={r2(top)} width={hs.w} height={hs.h} fill={CREAM} />
                {(hs.holes ?? []).map(([dx, dy, w, hh, arch], k) =>
                  arch ? (
                    <path key={k}
                      d={`M${hs.x + dx} ${r2(top + dy + hh)}L${hs.x + dx} ${r2(top + dy + w / 2)}` +
                         `A${w / 2} ${w / 2} 0 0 1 ${hs.x + dx + w} ${r2(top + dy + w / 2)}` +
                         `L${hs.x + dx + w} ${r2(top + dy + hh)}Z`}
                      fill={G_DARK} />
                  ) : (
                    <rect key={k} x={hs.x + dx} y={r2(top + dy)}
                      width={w} height={hh} fill={G_DARK} />
                  ),
                )}
              </g>
            );
          })}
        </g>
      </motion.g>

      {/* ---------------- the stair ---------------- */}
      <motion.g {...rise(0.44, 16)} filter="url(#wc-grain-fine)">
        {Array.from({ length: 13 }, (_, i) => {
          const x = 244 - i * 5.6;
          const y = crestY(244) - 30 + i * 7.4;
          return (
            <g key={i}>
              <path d={`M${r2(x)} ${r2(y)}L${r2(x + 15)} ${r2(y - 4.4)}L${r2(x + 15)} ${r2(y - 0.6)}L${r2(x)} ${r2(y + 3.8)}Z`}
                fill={CREAM_HI} />
              <path d={`M${r2(x)} ${r2(y + 3.8)}L${r2(x + 15)} ${r2(y - 0.6)}L${r2(x + 15)} ${r2(y + 3.2)}L${r2(x)} ${r2(y + 7.6)}Z`}
                fill={CREAM_MID} />
            </g>
          );
        })}
      </motion.g>

      {/* ---------------- the church ---------------- */}
      <motion.g {...rise(0.5, 20)}>
        <Church x={294} y={crestY(294) - 64} />
      </motion.g>

      {/* ---------------- the cypress ---------------- */}
      <motion.g {...rise(0.58, 14)}>
        <Cypress x={276} ground={crestY(276) + 8} />
      </motion.g>
    </svg>
  );
}

/* ================================================================
   The church — drum, dome, cross
   ================================================================ */

function Church({ x, y }: { x: number; y: number }) {
  const dw = 46;
  const dh = 34;
  const depth = 12;
  const cx = x + dw / 2;
  const domeR = 21;
  const domeTop = y - domeR * 0.92;

  return (
    <g>
      {/* the shadow it throws onto the roofs downhill */}
      <path
        d={`M${cx - 14} ${y + dh + 1}L${cx + 40} ${y + dh + 15}` +
           `L${cx + 34} ${y + dh + 23}L${cx - 18} ${y + dh + 8}Z`}
        fill={G_DARK} opacity="0.3"
      />

      <g filter="url(#wc-grain-fine)">
        <path d={`M${x + dw} ${y}L${x + dw + depth} ${r2(y - depth * 0.55)}` +
                 `L${x + dw + depth} ${r2(y + dh - depth * 0.55)}L${x + dw} ${y + dh}Z`}
          fill={G_DEEP} />
        <rect x={x} y={y} width={dw} height={dh} fill={CREAM} />
        {[0, 1, 2].map((i) => {
          const aw = 8;
          const ax = x + 6 + i * 14;
          return (
            <path key={i}
              d={`M${ax} ${y + 25}L${ax} ${y + 14}A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw} ${y + 14}L${ax + aw} ${y + 25}Z`}
              fill={G_DARK} />
          );
        })}
      </g>

      {/* dome: dark by default, with the sun on its upper-left quarter */}
      <g filter="url(#wc-grain)">
        <path d={`M${cx - domeR} ${y}A${domeR} ${r2(domeR * 0.92)} 0 0 1 ${cx + domeR} ${y}Z`}
          fill={G_DARK} />
        <path
          d={`M${cx - domeR} ${y}A${domeR} ${r2(domeR * 0.92)} 0 0 1 ${cx - 3} ${r2(domeTop + 1)}` +
             `A${r2(domeR * 0.74)} ${r2(domeR * 0.7)} 0 0 0 ${r2(cx - domeR * 0.6)} ${y}Z`}
          fill={G_DEEP}
        />
      </g>
      {/* the rim the dome sits on */}
      <rect x={cx - domeR - 2} y={y} width={domeR * 2 + 4} height={3.4} fill={CREAM_HI} />

      <g fill={CREAM_HI}>
        <rect x={cx - 1} y={r2(domeTop - 13)} width={2} height={14} />
        <rect x={cx - 4.5} y={r2(domeTop - 9.5)} width={9} height={2} />
      </g>
    </g>
  );
}

/* ================================================================
   The cypress — a taper with an irregular tip, not a symmetric drop
   ================================================================ */

function Cypress({ x, ground }: { x: number; ground: number }) {
  const top = ground - 82;
  return (
    <g>
      <ellipse cx={x + 9} cy={ground + 1} rx={12} ry={3.6}
        fill={G_DARK} opacity="0.38" />
      <path
        d={`M${x - 5} ${ground}
            C${x - 10} ${ground - 26} ${x - 8} ${ground - 56} ${x - 0.5} ${top}
            C${x + 1.5} ${r2(top - 5)} ${x + 2.5} ${r2(top - 2)} ${x + 3} ${r2(top + 4)}
            C${x + 9} ${ground - 54} ${x + 9} ${ground - 24} ${x + 5} ${ground}Z`}
        fill={G_DARK} filter="url(#wc-grain)"
      />
      {/* the sun grazes its left flank */}
      <path
        d={`M${x - 4} ${ground - 3}
            C${x - 8.4} ${ground - 27} ${x - 6.6} ${ground - 55} ${x - 0.6} ${r2(top + 5)}
            L${x - 0.6} ${ground - 3}Z`}
        fill={G_DEEP} opacity="0.8"
      />
    </g>
  );
}
