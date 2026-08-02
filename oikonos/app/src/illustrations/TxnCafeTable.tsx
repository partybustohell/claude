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

const SEAT_D = 'M141 250A55 12.5 0 0 1 251 250A55 12.5 0 0 1 141 250Z';

const CHAIR: { d: string; cap?: number }[] = [
  /* back legs, behind everything */
  { d: taper(172, 250, 7, 158, 290, 4.5) },
  { d: taper(220, 250, 7, 234, 290, 4.5) },
  /* the hoop that is the whole back — one steamed length of beech */
  { d: 'M154 254C150 202 164 161 196 161C228 161 242 202 238 254L230 254C234 205 220 170 196 170C172 170 158 205 162 254Z' },
  /* the cross slat */
  { d: 'M162 197C178 203 214 203 230 197L230 208.5C214 214.5 178 214.5 162 208.5Z' },
  /* arms — a short bentwood sweep out of the hoop, dropped onto the seat
     by a stub post, so the window under them stays small and the chair
     never reads as a basket */
  { d: 'M165 210C151 209.6 142 214 135.5 222.5', cap: 6 },
  { d: 'M227 210C241 209.6 250 214 256.5 222.5', cap: 6 },
  { d: taper(136, 221, 6.4, 143, 248, 5.4) },
  { d: taper(256, 221, 6.4, 249, 248, 5.4) },
  /* ring stretcher */
  { d: 'M152 282C172 293 220 293 240 282', cap: 4.5 },
  /* the round seat */
  { d: SEAT_D },
  /* seat rim */
  { d: 'M141 250A55 12.5 0 0 0 251 250L251 255.5A55 12.5 0 0 1 141 255.5Z' },
  /* front legs */
  { d: taper(163, 254, 8.5, 139, 304, 5.5) },
  { d: taper(229, 254, 8.5, 253, 304, 5.5) },
];

/** Cane weave inside the seat, as one path. */
function buildCane(): string {
  const out: string[] = [];
  for (let k = -16; k <= 16; k++) {
    const x = CX + k * 6.5;
    out.push(`M${x - 10} 234L${x + 8} 268`);
    out.push(`M${x + 10} 234L${x - 8} 268`);
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

      {/* ---------------- the chair ----------------
           pushed right of the table's axis so the still life is composed,
           not mirrored, and the pedestal reads through the hoop */}
      <motion.g {...rise(0.4, 22)}>
       <g transform="translate(14 0)">
        {/* the cobalt plate, printed a hair low and right */}
        <g transform="translate(2.6 1.9)" opacity="0.8" filter="url(#tc-ink)">
          <ChairPlate ink="var(--ink)" />
        </g>
        <g filter="url(#tc-ink)">
          <ChairPlate ink="var(--vermilion)" />
        </g>
        {/* cane weave */}
        <g clipPath="url(#tc-seatclip)">
          <path d={CANE_D} fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.2" />
          <path d={CANE_D} fill="none" stroke="#ffbdad" strokeWidth="0.7" opacity="0.3"
            transform="translate(-1.1 -0.8)" />
        </g>
        {/* light rakes the left face of every upright */}
        {/* the light rakes the left flank of the hoop and the near legs */}
        {/* the light rakes the left flank of the hoop and the near leg */}
        <g fill="none" stroke="#ffab96" strokeLinecap="round" opacity="0.6">
          <path d="M156.4 250C152.6 204 167 165.4 196 164.4" strokeWidth="2.2" />
        </g>
        <g fill="#ff9179" opacity="0.5">
          <path d={taper(160.6, 256, 2.5, 137, 303, 2)} />
          <path d={taper(231.6, 256, 1.5, 255, 303, 1.3)} />
        </g>
        {/* the seat turns away from the light along its far rim */}
        <g clipPath="url(#tc-seatclip)">
          <ellipse cx={214} cy={258} rx={55} ry={12.5} fill="var(--ink)" opacity="0.13" />
          <ellipse cx={174} cy={243} rx={38} ry={7.6} fill="#ffbcac" opacity="0.22" />
        </g>
       </g>
      </motion.g>
    </svg>
  );
}
