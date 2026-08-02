/**
 * TRANSACTION DETAIL — "One o'clock, table for one"
 *
 * A café still life printed in three inks on the pine field: cream for the
 * terrazzo bistro top and the glassware, cobalt for everything the light
 * cannot reach — the splayed pedestal, the pool on the floor, the espresso
 * in the cup — and vermilion for the bentwood chair pushed in against it.
 *
 * The light comes from the upper left. Every shade therefore falls to the
 * lower right: the pool is pushed right of the table's axis, the contact
 * shadows on the stone trail right of their objects, and the cobalt pass
 * sits a hair right-and-down of the cream pass so the two plates read as
 * two runs through the press.
 *
 * The chair is drawn twice from one path set — once in cobalt, once in
 * vermilion two units up and left of it — so every bentwood member carries
 * a shadowed edge without a single extra path. That deliberate
 * misregistration is the whole trick of the drawing.
 *
 * Grain: an alpha-punching feTurbulence lets the green show through the ink
 * in a fine mottle, plus deterministic stipple fields (seeded PRNG, emitted
 * as one path each) for the pool's falloff and the terrazzo aggregate.
 */
import { motion, useReducedMotion } from 'framer-motion';
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
const SX = 206;      // pool centre, pushed right of the table axis
const SY = 292;
const SRX = 120;     // solid core
const SRY = 15;

/* ---- chair ---- */
const CX = 196;

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

/* ================================================================
   The chair — one path set, printed twice
   ================================================================ */

const SEAT_D = 'M134 244A62 14 0 0 1 258 244A62 14 0 0 1 134 244Z';

const CHAIR: { d: string; cap?: number }[] = [
  /* back legs, behind everything */
  { d: taper(172, 250, 6.5, 158, 286, 4.5) },
  { d: taper(220, 250, 6.5, 234, 286, 4.5) },
  /* the bent hoop that is the whole back — one steamed length of beech */
  { d: 'M152 244C150 202 160 166.5 196 166.5C232 166.5 242 202 240 244L232 244C234 204 225 175 196 175C167 175 158 204 160 244Z' },
  /* the inner flourish hanging off the crown */
  { d: 'M172 177C165 215 178 234 196 234C214 234 227 215 220 177', cap: 5.5 },
  /* arms sweeping down to the seat rim */
  { d: 'M158 200C136 203 128 221 137 241', cap: 6 },
  { d: 'M234 200C256 203 264 221 255 241', cap: 6 },
  /* ring stretcher */
  { d: 'M154 278C174 289 218 289 238 278', cap: 4.5 },
  /* the round seat */
  { d: SEAT_D },
  /* seat rim */
  { d: 'M134 244A62 14 0 0 0 258 244L258 249.5A62 14 0 0 1 134 249.5Z' },
  /* front legs */
  { d: taper(162, 250, 8, 140, 302, 5.5) },
  { d: taper(230, 250, 8, 252, 302, 5.5) },
];

/** Cane weave inside the seat, as one path. */
function buildCane(): string {
  const out: string[] = [];
  for (let k = -16; k <= 16; k++) {
    const x = CX + k * 6;
    out.push(`M${x - 11} 228L${x + 9} 262`);
    out.push(`M${x + 11} 228L${x - 9} 262`);
  }
  return out.join('');
}
const CANE_D = buildCane();

function ChairPlate({ ink }: { ink: string }) {
  return (
    <g>
      {CHAIR.map((m, i) =>
        m.cap
          ? <path key={i} d={m.d} fill="none" stroke={ink} strokeWidth={m.cap}
              strokeLinecap="round" strokeLinejoin="round" />
          : <path key={i} d={m.d} fill={ink} />,
      )}
    </g>
  );
}

/* ---- crockery paths shared with their clip regions ---------------- */

const CUP_D = 'M97 148.6C94.4 141.6 92.4 133.6 91.4 127.5L124.6 127.5C123.6 133.6 121.6 141.6 119 148.6C117 151.6 99 151.6 97 148.6Z';
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
      aria-label="A round terrazzo café table set with an espresso cup and a water bottle, a red bentwood armchair tucked in front of it"
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

        {/* The stone is not one flat cream: light gathers at the left rim. */}
        <linearGradient id="tc-stone" x1="0.05" y1="0" x2="0.98" y2="0.95">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.44" stopColor="#fbf4e4" />
          <stop offset="1" stopColor="#f0e3c6" />
        </linearGradient>

        <linearGradient id="tc-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--paper-warm)" />
          <stop offset="0.46" stopColor="#e0cfa9" />
          <stop offset="1" stopColor="#bda880" />
        </linearGradient>

        <clipPath id="tc-topclip">
          <ellipse cx={TX} cy={TY} rx={TRX} ry={TRY} />
        </clipPath>
        <clipPath id="tc-seatclip"><path d={SEAT_D} /></clipPath>
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
          <ellipse cx={SX} cy={SY} rx={SRX} ry={SRY} fill="var(--ink)" opacity="0.86" />
        </g>
        <path d={POOL_D} fill="var(--ink)" opacity="0.78" />
      </motion.g>

      {/* ---------------- table ---------------- */}
      <motion.g {...rise(0.3, 14)}>
        {/* pedestal — four splayed legs under a cast collar */}
        <g fill="var(--ink)" filter="url(#tc-ink)">
          <path d="M175 152L211 152L206 170L180 170Z" opacity="0.86" />
          <path d={taper(193, 166, 21, 193, 252, 13)} />
          <path d={taper(193, 246, 13, 150, 286, 5)} opacity="0.9" />
          <path d={taper(193, 246, 13, 236, 286, 5)} opacity="0.9" />
          <path d={taper(193, 250, 11, 194, 292, 8)} opacity="0.94" />
        </g>

        {/* stone slab — the edge first, the surface printed over it */}
        <g filter="url(#tc-ink-soft)">
          <path
            d={`M${TX - TRX} ${TY}A${TRX} ${TRY} 0 0 0 ${TX + TRX} ${TY}` +
               `L${TX + TRX} ${TY + SLAB}A${TRX} ${TRY} 0 0 1 ${TX - TRX} ${TY + SLAB}Z`}
            fill="url(#tc-edge)"
          />
          <ellipse cx={TX} cy={TY} rx={TRX} ry={TRY} fill="url(#tc-stone)" />
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
        <path d={UNDER_D} fill="var(--ink)" opacity="0.42" />
      </motion.g>

      {/* ---------------- what is on the table ---------------- */}
      <motion.g {...rise(0.46, 10)}>
        {/* contact shadows, trailing right of the light */}
        <g fill="var(--ink)">
          <ellipse cx={116} cy={156} rx={32} ry={6} opacity="0.15" />
          <ellipse cx={264} cy={145} rx={17} ry={4} opacity="0.22" />
          <ellipse cx={286} cy={146} rx={28} ry={4.4} opacity="0.08" />
        </g>

        {/* saucer */}
        <g filter="url(#tc-ink-fine)">
          <ellipse cx={108} cy={155.4} rx={30} ry={6} fill="#e7d8b4" />
          <ellipse cx={108} cy={153.8} rx={30} ry={6} fill="#fffbf2" />
        </g>
        <ellipse cx={108} cy={154.2} rx={19.5} ry={3.6} fill="none"
          stroke="var(--ink)" strokeWidth="1.3" opacity="0.4" />

        {/* espresso cup */}
        <path d="M122 131.5C133.5 130.6 138 137.4 134.8 142.4C133 145 129.2 145.5 126.4 144"
          fill="none" stroke="var(--paper)" strokeWidth="3.1" strokeLinecap="round" />
        <g filter="url(#tc-ink-fine)">
          <path d={CUP_D} fill="var(--paper)" />
          <g clipPath="url(#tc-cupclip)">
            <rect x="89" y="126" width="13" height="28" fill="#fffdf6" opacity="0.85" />
            <rect x="114" y="126" width="13" height="28" fill="var(--ink)" opacity="0.12" />
          </g>
          <ellipse cx={108} cy={127.5} rx={17} ry={4.4} fill="#fffbf2" />
        </g>
        <g clipPath="url(#tc-cupclip)">
          <ellipse cx={108} cy={131.2} rx={16} ry={4.1} fill="none"
            stroke="var(--ink)" strokeWidth="1.6" opacity="0.66" />
        </g>
        <ellipse cx={108} cy={127.7} rx={13.4} ry={3.2} fill="var(--ink)" opacity="0.8" />
        <ellipse cx={105.4} cy={127.2} rx={6.2} ry={1.3} fill="var(--paper)" opacity="0.24" />

        {/* water bottle */}
        <g clipPath="url(#tc-bottleclip)">
          <rect x="239" y="68" width="34" height="78" fill="var(--paper)" opacity="0.14" />
          <rect x="239" y="114" width="34" height="32" fill="var(--paper)" opacity="0.36" />
          <rect x="239" y="114" width="34" height="32" fill="var(--ink)" opacity="0.13" />
          <ellipse cx={256} cy={114} rx={15} ry={3} fill="#fffaf0" opacity="0.7" />
          <rect x="264" y="68" width="9" height="78" fill="var(--ink)" opacity="0.11" />
        </g>
        <g filter="url(#tc-ink-fine)">
          <path d={BOTTLE_D} fill="none" stroke="var(--paper)" strokeWidth="2.7"
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

      {/* ---------------- the chair ---------------- */}
      <motion.g {...rise(0.4, 22)}>
        {/* the cobalt plate, printed a hair low and right */}
        <g transform="translate(2.6 1.9)" opacity="0.8" filter="url(#tc-ink)">
          <ChairPlate ink="var(--ink)" />
        </g>
        <g filter="url(#tc-ink)">
          <ChairPlate ink="var(--vermilion)" />
        </g>
        {/* cane weave */}
        <g clipPath="url(#tc-seatclip)">
          <path d={CANE_D} fill="none" stroke="var(--ink)" strokeWidth="1.2" opacity="0.24" />
          <path d={CANE_D} fill="none" stroke="#ffb4a4" strokeWidth="0.8" opacity="0.4"
            transform="translate(-1.2 -0.9)" />
        </g>
        {/* light rakes the left face of every upright */}
        {/* the light rakes the left flank of the hoop and the near legs */}
        <g fill="none" stroke="#ffab96" strokeLinecap="round" opacity="0.6">
          <path d="M154.4 240C152.6 203 162 170.4 196 169.4" strokeWidth="2.2" />
          <path d="M174.4 179C168.2 214 179 231.4 195 231.6" strokeWidth="1.5" opacity="0.7" />
        </g>
        <g fill="#ff9179" opacity="0.5">
          <path d={taper(159.6, 252, 2.4, 138, 301, 2)} />
          <path d={taper(232.6, 252, 1.5, 254, 301, 1.3)} />
        </g>
        {/* the seat turns away from the light along its far rim */}
        <g clipPath="url(#tc-seatclip)">
          <ellipse cx={214} cy={252} rx={62} ry={14} fill="var(--ink)" opacity="0.14" />
          <ellipse cx={172} cy={236} rx={44} ry={9} fill="#ffb9a8" opacity="0.24" />
        </g>
      </motion.g>
    </svg>
  );
}
