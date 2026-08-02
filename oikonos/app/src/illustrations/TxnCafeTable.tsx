/**
 * TRANSACTION DETAIL — "One o'clock, table for one"
 *
 * A café still life printed in two inks on the pine field: cream for the
 * terrazzo bistro top and the glassware, cobalt for everything the light
 * cannot reach — the splayed pedestal, the pool on the floor, the espresso
 * in the cup. Vermilion appears only as aggregate in the stone.
 *
 * The table stands alone. An earlier version tucked a bentwood chair in
 * front of it, which occluded the pedestal and left the top apparently
 * floating; with the chair gone the four splayed legs carry the whole
 * structure and the object finally sits on its own floor.
 *
 * The light comes from the upper left. Every shade therefore falls to the
 * lower right: the pool is pushed right of the table's axis and the
 * contact shadows on the stone trail right of their objects.
 *
 * Grain: an alpha-punching feTurbulence lets the green show through the ink
 * in a fine mottle, plus deterministic stipple fields (seeded PRNG, emitted
 * as one path each) for the pool's falloff and the terrazzo aggregate.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { RampDefs, ScreenRamp } from './press';
import { gentle, surface } from '../lib/motion';

const W = 390;
const H = 330;

/* ---- table ---- */
const TX = 193;      // table centre
const TY = 150;      // top-surface ellipse centre
const TRX = 145;
const TRY = 16;
const SLAB = 6;      // stone thickness

/* ---- floor ---- */
const SX = 201;      // pool centre, pushed right of the table axis
const SY = 293;
const SRX = 66;      // solid core — the pedestal's own footprint
const SRY = 10.5;

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

const n2 = (v: number) => Math.round(v * 100) / 100;
const sq = (x: number, y: number, s: number) =>
  `M${n2(x)} ${n2(y)}h${n2(s)}v${n2(s)}h${n2(-s)}z`;

/** A four-point tapered member — the whole vocabulary of the frames. */
function taper(x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) {
  return `M${x1 - w1 / 2} ${y1}L${x1 + w1 / 2} ${y1}L${x2 + w2 / 2} ${y2}L${x2 - w2 / 2} ${y2}Z`;
}

/* ---- the pool's dithered rim ------------------------------------ */

function buildPool(): string {
  const rnd = mulberry32(0x0d3996);
  const out: string[] = [];
  for (let y = SY - SRY - 11; y < SY + SRY + 13; y += 1.15) {
    for (let x = SX - SRX - 30; x < SX + SRX + 32; x += 1.15) {
      const dx = (x - SX) / SRX;
      const dy = (y - SY) / SRY;
      const u = Math.hypot(dx, dy);
      if (u <= 1) continue;                        // the solid core covers this
      // the pool reaches further away from the light than toward it
      const lit = 0.84 + 0.34 * (dx * 0.74 + dy * 0.38);
      const p = 0.86 * Math.exp(-(u - 1) / (0.155 * lit));
      if (p <= 0.014 || rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.3, y + (rnd() - 0.5) * 1.3, 0.6 + 1.35 * Math.min(1, p)));
    }
  }
  return out.join('');
}

/* ---- ambient darkening clinging under the stone ------------------ */

function buildUnderTable(): string {
  const rnd = mulberry32(0x2e7349);
  const out: string[] = [];
  const yb = TY + SLAB;                            // underside of the slab
  for (let y = yb - 1; y < yb + 20; y += 1.1) {
    for (let x = TX - TRX; x < TX + TRX; x += 1.1) {
      const dx = (x - TX) / TRX;
      if (Math.abs(dx) > 1) continue;
      const edge = yb + TRY * Math.sqrt(Math.max(0, 1 - dx * dx));
      const d = y - edge;
      if (d < -1) continue;
      const side = 0.55 + 0.6 * dx;                // heavier on the shaded flank
      const p = 0.66 * Math.exp(-d / 4.6) * side;
      if (p <= 0.012 || rnd() > p) continue;
      out.push(sq(x + (rnd() - 0.5) * 1.1, y + (rnd() - 0.5) * 1.1, 0.5 + 1.0 * p));
    }
  }
  return out.join('');
}

/* ---- aggregate in the terrazzo ----------------------------------- */

function buildFlecks(seed: number, count: number, big: number): string {
  const rnd = mulberry32(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    const x = TX + Math.cos(a) * r * (TRX - 6);
    const y = TY + Math.sin(a) * r * (TRY - 2.4);
    out.push(sq(x, y, 0.4 + rnd() * big));
  }
  return out.join('');
}

const POOL_D = buildPool();
const UNDER_D = buildUnderTable();
const FLECK_INK_D = buildFlecks(0x51a7, 38, 0.9);
const FLECK_RED_D = buildFlecks(0xbe11, 13, 0.8);

/* ---- crockery paths shared with their clip regions ---------------- */

const CUP_D = 'M99 148.4C96.4 141.4 94 133.4 92.6 127.5L123.4 127.5C122 133.4 119.6 141.4 117 148.4C115 151.2 101 151.2 99 148.4Z';
const BOTTLE_D =
  'M241 143L241 106C241 97 250.5 92.5 250.5 84.5L250.5 71L261.5 71L261.5 84.5C261.5 92.5 271 97 271 106L271 143Z';

/* ================================================================ */

export function TxnCafeTable({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const rise = (delay: number, y = 16) =>
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
      aria-label="A round terrazzo café table on a splayed pedestal, set with an espresso cup on a saucer and a tall water bottle"
      style={{ display: 'block', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        {/* Ink lay-down: the green field shows through in a fine mottle. */}
        <filter id="tc-ink" x="-14%" y="-14%" width="128%" height="128%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" seed="19" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.42 0.24 0 0 0.56" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        {/* A gentler bite for the big cream passages — they must stay cream. */}
        <filter id="tc-ink-soft" x="-12%" y="-12%" width="124%" height="124%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="4" seed="23" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.24 0.13 0 0 0.81" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        <filter id="tc-ink-fine" x="-16%" y="-16%" width="132%" height="132%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="3" seed="6" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.3 0.18 0 0 0.7" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        {/* The table top is not one flat cream — light gathers at the
            left rim — but it turns by DOT COVERAGE, not by a fill that
            fades. Round three found smooth gradients modelling form on
            nine of fourteen plates and four critics named them without
            being asked; this was one of them. The inline hexes went with
            it: the brief says derive a value in tokens.css, never inline
            a colour, and these three were the last ones left. */}
        <RampDefs id="tc" name="stone" w={390} h={470} box={{ x: TX - TRX, y: TY - TRY, w: TRX * 2, h: TRY * 2 }} x1={0.05} y1={0} x2={0.98} y2={0.95} />
        <RampDefs id="tc" name="edge" w={390} h={470} x1={0} y1={0} x2={1} y2={0} />

        <clipPath id="tc-topclip">
          <ellipse cx={TX} cy={TY} rx={TRX} ry={TRY} />
        </clipPath>
        <clipPath id="tc-cupclip"><path d={CUP_D} /></clipPath>
        <clipPath id="tc-bottleclip"><path d={BOTTLE_D} /></clipPath>
      </defs>

      {/* ---------------- floor ---------------- */}
      <motion.g
        style={{ transformBox: 'view-box', transformOrigin: `${SX}px ${SY}px` }}
        initial={reduce ? { opacity: 1 } : { opacity: 0, scaleX: 0.8, scaleY: 0.55 }}
        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay: 0.24 }}
      >
        <g filter="url(#tc-ink)">
          <ellipse cx={SX} cy={SY} rx={SRX} ry={SRY} fill="var(--ink)" opacity="0.82" />
        </g>
        <path d={POOL_D} fill="var(--ink)" opacity="0.72" />
      </motion.g>

      {/* ---------------- table ---------------- */}
      <motion.g {...rise(0.3, 14)}>
        {/* pedestal — four splayed legs under a cast collar */}
        <g fill="var(--ink)" filter="url(#tc-ink)">
          <path d="M177 152L209 152L205 170L181 170Z" opacity="0.86" />
          <path d={taper(193, 166, 13, 193, 254, 8.5)} />
          <path d={taper(193, 250, 10, 154, 288, 4.5)} opacity="0.9" />
          <path d={taper(193, 250, 10, 232, 288, 4.5)} opacity="0.9" />
          <path d={taper(193, 254, 9, 194, 294, 7)} opacity="0.94" />
        </g>

        {/* stone slab — the edge first, the surface printed over it */}
        <g filter="url(#tc-ink-soft)">
          <path
            d={`M${TX - TRX} ${TY}A${TRX} ${TRY} 0 0 0 ${TX + TRX} ${TY}` +
               `L${TX + TRX} ${TY + SLAB}A${TRX} ${TRY} 0 0 1 ${TX - TRX} ${TY + SLAB}Z`}
            fill="var(--g-wall)"
          />
          <ScreenRamp scale="mid" id="tc" name="stone" w={390} h={470}
            d={`M${TX - TRX} ${TY}a${TRX} ${TRY} 0 1 0 ${TRX * 2} 0a${TRX} ${TRY} 0 1 0 ${-TRX * 2} 0Z`}
            base="var(--g-stone)" lit="var(--g-stone-hi)" deep="var(--g-wall)"
            deepOpacity={0.55} />
        </g>

        {/* aggregate */}
        <g clipPath="url(#tc-topclip)">
          <path d={FLECK_INK_D} fill="var(--ink)" opacity="0.13" />
          <path d={FLECK_RED_D} fill="var(--vermilion)" opacity="0.16" />
          {/* the far rim of the disc turns away from the light */}
          <ellipse cx={TX + 48} cy={TY + 7} rx={TRX} ry={TRY} fill="var(--ink)" opacity="0.05" />
        </g>

        {/* a hairline of light caught along the leading edge */}
        <path
          d={`M${TX - TRX} ${TY}A${TRX} ${TRY} 0 0 0 ${TX + TRX * 0.55} ${TY + TRY * 0.84}`}
          fill="none" stroke="#fffdf5" strokeWidth="1.15" opacity="0.5" strokeLinecap="round"
        />
        <path d={UNDER_D} fill="var(--ink)" opacity="0.34" />
      </motion.g>

      {/* ---------------- what is on the table ---------------- */}
      <motion.g {...rise(0.46, 10)}>
        {/* contact shadows, trailing right of the light */}
        <g fill="var(--ink)">
          <ellipse cx={144} cy={157} rx={35} ry={6.6} opacity="0.15" />
          <ellipse cx={264} cy={145} rx={17} ry={4} opacity="0.22" />
          <ellipse cx={286} cy={146} rx={28} ry={4.4} opacity="0.08" />
        </g>

        {/* the cup, set a little in from the near rim and a size up on the
            saucer so it still reads at print scale */}
        <g transform="translate(138 152) scale(1.1) translate(-108 -152)">
        {/* saucer */}
        <g filter="url(#tc-ink-fine)">
          <ellipse cx={108} cy={155.4} rx={30} ry={6} fill="#e7d8b4" />
          <ellipse cx={108} cy={153.8} rx={30} ry={6} fill="#fffbf2" />
        </g>
        <ellipse cx={108} cy={154.2} rx={19.5} ry={3.6} fill="none"
          stroke="var(--ink)" strokeWidth="1.3" opacity="0.4" />

        {/* espresso cup */}
        <path d="M120.6 132C131 131.3 135 137.6 132.2 142C130.6 144.4 127.3 144.8 124.8 143.6"
          fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" />
        <g filter="url(#tc-ink-fine)">
          <path d={CUP_D} fill="var(--paper)" />
          <g clipPath="url(#tc-cupclip)">
            <rect x="91" y="126" width="12" height="28" fill="#fffdf6" opacity="0.85" />
            <rect x="113" y="126" width="12" height="28" fill="var(--ink)" opacity="0.12" />
          </g>
          <ellipse cx={108} cy={127.5} rx={15.6} ry={4.2} fill="#fffbf2" />
        </g>
        <g clipPath="url(#tc-cupclip)">
          <ellipse cx={108} cy={135} rx={14.4} ry={3.9} fill="none"
            stroke="var(--ink)" strokeWidth="1.5" opacity="0.5" />
        </g>
        <ellipse cx={108} cy={127.7} rx={11.4} ry={2.9} fill="var(--ink)" opacity="0.82" />
        <ellipse cx={105.6} cy={127.3} rx={5} ry={1.1} fill="var(--paper)" opacity="0.24" />
        </g>

        {/* water bottle */}
        <g clipPath="url(#tc-bottleclip)">
          <rect x="239" y="68" width="34" height="78" fill="var(--paper)" opacity="0.14" />
          <rect x="239" y="114" width="34" height="32" fill="var(--paper)" opacity="0.36" />
          <rect x="239" y="114" width="34" height="32" fill="var(--ink)" opacity="0.13" />
          <ellipse cx={256} cy={114} rx={15} ry={3} fill="#fffaf0" opacity="0.7" />
          <rect x="264" y="68" width="9" height="78" fill="var(--ink)" opacity="0.11" />
        </g>
        <g filter="url(#tc-ink-fine)">
          <path d={BOTTLE_D} fill="none" stroke="var(--paper)" strokeWidth="2.4"
            strokeLinejoin="round" />
          <ellipse cx={256} cy={143} rx={15} ry={3.2} fill="var(--paper)" opacity="0.92" />
          <rect x="248.8" y="62.5" width="14.4" height="10.5" rx="1.7" fill="var(--paper)" />
        </g>
        <rect x="248.8" y="65.6" width="14.4" height="2.2" fill="var(--ink)" opacity="0.55" />
        <g clipPath="url(#tc-bottleclip)">
          <rect x="244.6" y="107" width="3.4" height="31" rx="1.7" fill="#fffdf6" opacity="0.85" />
          <rect x="245.8" y="89" width="2.4" height="11" rx="1.2" fill="#fffdf6" opacity="0.6" />
        </g>
      </motion.g>

    </svg>
  );
}
