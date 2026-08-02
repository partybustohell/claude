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
 *     lattice — a repeating rosette, four cobalt arms about a clay
 *     heart. A real pavement is mostly its ground colour with a figure
 *     laid into it, and the ground here is cream by a wide margin.
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

/**
 * The column count is CONSTANT, and that is the whole reason the motif
 * works.
 *
 * The first floor narrowed each row's column count with depth, on the
 * reasoning that nearer rows hold fewer, larger chips. It does not
 * survive contact with a pattern: with a different divisor per row, a
 * diagonal computed from the column index lands at a different physical
 * x in every row, so the diamonds sheared into plain alternating
 * stripes. Holding the count fixed makes (column, row) a real lattice.
 *
 * It is also the more correct drawing. This floor spans the full plate
 * width at every depth — it recedes, but it does not converge to a
 * vanishing point at the sides. So a tile keeps its WIDTH going away
 * from you and loses its HEIGHT, which is exactly what foreshortening
 * does to a square. Constant columns with row height falling out of
 * rowY() gives that for free: the far chips are letterbox-thin, the
 * near ones nearly square.
 */
const COLS = 20;
const CW = (W + 40) / COLS;

/** Rows from here forward carry the motif; behind it, distance has
 *  taken the pattern and left only the ground and a little colour. */
const NEAR = 4;

/** Rows bunch toward the far edge. Depth is the whole illusion. */
function rowY(i: number) {
  const t = i / ROWS;
  /* 1.42 threw so much depth into the last two rows that the front of
     the floor was three chips tall and the back was a smear. */
  return FAR + (H - FAR) * Math.pow(t, 1.24);
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

    for (let c = 0; c < COLS; c++) {
      const x = -20 + c * CW + (rnd() - 0.5) * 1.6;
      const y = y0 + (rnd() - 0.5) * 1.2;

      /* THE MOTIF — a rosette: a clay centre with four cobalt arms,
         repeating every five columns and every three rows.
         Crossed diagonals were tried first and do not survive this
         floor. The rows compress hard with depth, so a line stepping
         one column per row has a steep slope at the front and a nearly
         flat one at the back; the "diamonds" bent into scattered
         alternation. A rosette is a closed figure — it keeps its shape
         whatever the row spacing does, and it leaves the cream ground
         dominant at about a quarter coverage rather than the 44% two
         crossing diagonals were laying down. */
      let set = INKS.ground;
      if (r >= NEAR) {
        const px = c % 5;
        const py = (r - NEAR) % 3;
        if (px === 2 && py === 1) set = INKS.heart;
        else if ((px === 1 || px === 3) && py === 1) set = INKS.figure;
        else if (px === 2 && (py === 0 || py === 2)) set = INKS.figure;
        else if (px === 0 && py === 0) set = INKS.leaf;
      } else if ((c * 3 + r * 5) % 11 === 0) {
        /* Distance eats detail before it eats colour. The far field
           keeps a scatter of single chips and drops the figure. */
        set = c % 2 ? INKS.figure : INKS.leaf;
      }

      out.push({ x, y, w: CW * 0.84, h, fill: set.fill, hi: set.hi });
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
      </defs>

      {/* ============================================================
          1 — THE BEDDING
          ============================================================ */}
      <motion.g {...layer(6, 0.02)}>
        {/* The mortar the chips are bedded in, and it shows in every
            grout line, so its colour is not a detail. It was the cobalt
            stone at 0.42, which composites to rgb(219,218,219) — a dead
            neutral, and a floor grouted in grey is a floor with grey in
            it. Lime mortar is warm. */}
        <rect x="0" y={FAR} width={W} height={H - FAR}
          fill="var(--g-wall-lit)" filter={ink(ID, 'grain')} />
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
        {/* There was a haze gradient here to take the light out of the
            far rows. It composited to rgb(214,215,218) — grey again, and
            a pale film over cream cannot be anything else. Depth is
            already carried honestly: the rows foreshorten, and the motif
            drops out past NEAR. Nothing needed to replace it. */}
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
