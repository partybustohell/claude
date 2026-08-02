import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32 } from './press';

/**
 * MOSAIC — the pavement.
 *
 * For the categories cluster. A category is a tessera: on its own it is
 * a chip of one colour, and the only place it means anything is the
 * floor the whole set makes.
 *
 * ── WHY IT IS A FLOOR AND NOT A PATTERN ──────────────────────────
 * The first pull of this plate laid every chip on a flat grid and dealt
 * the four inks at random. It came back as confetti — no ground, no
 * depth, nothing for the eye to rest on, and it would have fought every
 * line of type put near it. Two things fix that and both are structural:
 *
 *   · PERSPECTIVE. The rows recede. Each row is shorter, its chips
 *     narrower, its grout tighter, so the field reads as a surface
 *     going away from you rather than as wallpaper.
 *   · A MOTIF. The coloured chips are not scattered, they sit on a
 *     lattice — a repeating diamond, cobalt with a clay heart. A real
 *     pavement is mostly its ground colour with a figure laid into it,
 *     and the ground here is cream by a wide margin.
 *
 * The jitter that remains is small and is only there because tesserae
 * are bedded by hand: enough to kill the graph paper, not enough to
 * lose the lattice.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left, raking low. Every chip takes a lit top-left edge and
 * drops its shadow down and right into the grout, which is what gives
 * a flat field of squares real relief.
 *
 * Plate: 390 × 210, bleeding off both edges and the bottom.
 */

const ID = 'mo';
const W = 390;
const H = 210;
const ROWS = 11;
const FAR = 42;           // the far edge of the floor — the border sits here

/** Rows bunch toward the far edge. Depth is the whole illusion. */
function rowY(i: number) {
  const t = i / ROWS;
  return FAR + (H - FAR) * Math.pow(t, 1.42);
}

const INKS = {
  ground: { fill: 'var(--g-stone)', hi: 'var(--g-stone-hi)' },
  figure: { fill: 'var(--g-sea)', hi: 'var(--g-sea-lift)' },
  heart: { fill: 'var(--g-clay)', hi: 'var(--g-clay-lit)' },
  leaf: { fill: 'var(--g-green)', hi: 'var(--g-green-lit)' },
};

type Chip = { x: number; y: number; w: number; h: number; fill: string; hi: string };

const CHIPS: Chip[] = (() => {
  const rnd = mulberry32(1907);
  const out: Chip[] = [];

  for (let r = 0; r < ROWS; r++) {
    const y0 = rowY(r);
    const y1 = rowY(r + 1);
    const h = (y1 - y0) * 0.82;
    /* nearer rows hold fewer, larger chips */
    const cols = Math.round(26 - r * 1.1);
    const cw = (W + 40) / cols;

    for (let c = 0; c < cols; c++) {
      const x = -20 + c * cw + (rnd() - 0.5) * 1.6;
      const y = y0 + (rnd() - 0.5) * 1.2;

      /* the lattice: a diamond every four chips, offset row by row */
      const m = (c * 2 + r) % 8;
      let set = INKS.ground;
      if (m === 0) set = INKS.figure;
      else if (m === 4) set = INKS.heart;
      else if (m === 2 && r % 3 === 0) set = INKS.leaf;

      out.push({ x, y, w: cw * 0.84, h, fill: set.fill, hi: set.hi });
    }
  }
  return out;
})();

/**
 * A Greek key. One unit, repeated — the border is a rhythm, and the
 * first attempt at it broke into unreadable glyphs because the unit did
 * not close. This one is a single continuous meander.
 */
function meander(y: number, u: number) {
  let d = '';
  for (let x = -4 * u; x < W + 4 * u; x += 4 * u) {
    d += `M${x} ${y + 3 * u}V${y}H${x + 3 * u}V${y + 2 * u}H${x + u}V${y + u}`;
  }
  return d;
}

export function Mosaic({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={W} h={H}
      label="A tessellated pavement receding into the distance, a cobalt and clay lattice laid into a cream ground, under a Greek key border"
    >
      <defs>
        <Press id={ID} seed={37} />
        {/* the far end of the floor loses light, as a floor does */}
        <linearGradient id={`${ID}-depth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--g-stone-mid)" stopOpacity="0.5" />
          <stop offset="0.42" stopColor="var(--g-stone-mid)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ============================================================
          1 — THE BEDDING
          ============================================================ */}
      <motion.g {...layer(6, 0.02)}>
        <rect x="0" y={FAR} width={W} height={H - FAR}
          fill="var(--g-stone-shade)" opacity="0.42" filter={ink(ID, 'grain')} />
      </motion.g>

      {/* ============================================================
          2 — THE FIELD
          ============================================================ */}
      <motion.g {...layer(12, 0.06)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* one shadow pass for the whole floor, so the relief is uniform */}
          <g opacity="0.3">
            {CHIPS.map((c, i) => (
              <rect key={i} x={c.x + 1.1} y={c.y + 1.1} width={c.w} height={c.h}
                rx="0.8" fill="var(--g-stone-dark)" />
            ))}
          </g>
          {CHIPS.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="0.8" fill={c.fill} />
              <rect x={c.x} y={c.y} width={c.w} height="0.9" fill={c.hi} opacity="0.7" />
              <rect x={c.x} y={c.y} width="0.9" height={c.h} fill={c.hi} opacity="0.5" />
            </g>
          ))}
        </g>
        {/* distance takes the light out of the far rows */}
        <rect x="0" y={FAR} width={W} height={H - FAR} fill={`url(#${ID}-depth)`} />
      </motion.g>

      {/* ============================================================
          3 — THE BORDER, along the far edge
          ============================================================ */}
      <motion.g {...layer(8, 0.24)}>
        <rect x="0" y={FAR - 26} width={W} height="26" fill="var(--g-stone)"
          filter={ink(ID, 'grain-fine')} />
        <path d={meander(FAR - 21, 5)} fill="none" stroke="var(--g-sea)"
          strokeWidth="2.6" strokeLinecap="square" />
        <rect x="0" y={FAR - 27} width={W} height="2" fill="var(--g-stone-hi)" />
        <rect x="0" y={FAR - 2.4} width={W} height="2.4" fill="var(--g-clay)" opacity="0.9" />
      </motion.g>
    </Plate>
  );
}
