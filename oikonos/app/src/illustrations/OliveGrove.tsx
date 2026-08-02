import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32 } from './press';
import { Ridge, Cypress } from './parts';

/**
 * OLIVE GROVE — the long crop.
 *
 * One of the four covers a goal can be given, and the right one for the
 * goals that are not a holiday: an olive takes seven years to bear and
 * then bears for three hundred, which is the only picture in this app of
 * money that is not going anywhere soon.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. Every canopy is lit on its upper-left shoulder and closes
 * to the deep pine underneath; every trunk is lit on its left; every
 * tree throws a short shadow down and to the right onto the terrace it
 * stands on. The dry-stone walls take the sun on their coping and fall
 * to shade on the face below.
 *
 * ── THE GROVE IS PLANTED, NOT SCATTERED ──────────────────────────
 * Trees sit in rows on terraces, jittered off the row by a seeded PRNG.
 * A grid reads as an orchard diagram and a scatter reads as scrub; a
 * row with a wobble in it reads as a grove somebody planted and has
 * been pruning ever since. Rows recede: canopies shrink, values close
 * up, and the far rows lose their trunks entirely.
 *
 * Plate: 390 × 470, bleeding off both edges and the bottom.
 */

const ID = 'og';
const HORIZON = 168;

type Tree = { x: number; y: number; r: number; row: number };

/** Five terraces, receding. Each row is higher, smaller and paler. */
const ROWS = [
  { y: 214, r: 15, n: 7 },
  { y: 258, r: 19, n: 6 },
  { y: 312, r: 24, n: 5 },
  { y: 380, r: 30, n: 4 },
  { y: 456, r: 37, n: 4 },
];

const TREES: Tree[] = (() => {
  const rnd = mulberry32(311);
  const out: Tree[] = [];
  ROWS.forEach((row, i) => {
    const gap = 420 / row.n;
    for (let c = 0; c < row.n; c++) {
      out.push({
        x: -14 + c * gap + gap / 2 + (rnd() - 0.5) * gap * 0.34,
        y: row.y + (rnd() - 0.5) * 7,
        r: row.r * (0.86 + rnd() * 0.28),
        row: i,
      });
    }
  });
  return out;
})();

/** The terrace wall in front of each row. */
function wall(y: number) {
  return `M-10 ${y}C60 ${y - 6} 140 ${y - 3} 200 ${y}C270 ${y + 3} 330 ${y - 2} 400 ${y - 6}`;
}

/**
 * A canopy. Three overlapping lobes, not a circle — an olive's crown is
 * open and irregular, and a filled circle on a stick is a lollipop.
 */
function canopy(t: Tree) {
  const { x, y, r } = t;
  return (
    `M${x - r} ${y}`
    + `C${x - r} ${y - r * 0.86} ${x - r * 0.44} ${y - r * 1.1} ${x - r * 0.1} ${y - r * 0.94}`
    + `C${x + r * 0.2} ${y - r * 1.24} ${x + r * 0.86} ${y - r * 1.06} ${x + r * 0.88} ${y - r * 0.6}`
    + `C${x + r * 1.2} ${y - r * 0.4} ${x + r * 1.06} ${y + r * 0.16} ${x + r * 0.6} ${y + r * 0.2}`
    + `C${x + r * 0.2} ${y + r * 0.38} ${x - r * 0.7} ${y + r * 0.34} ${x - r} ${y}Z`
  );
}

export function OliveGrove({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={470}
      label="An olive grove planted in rows on dry-stone terraces, climbing a hillside"
    >
      <defs>
        <Press id={ID} seed={83} />
        <linearGradient id={`${ID}-slope`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="var(--g-lime)" />
          <stop offset="0.34" stopColor="var(--g-green-far)" />
          <stop offset="1" stopColor="var(--g-green)" />
        </linearGradient>
      </defs>

      {/* ---- 1. the ridge closing the valley ---- */}
      <motion.g {...layer(8, 0.02)}>
        <Ridge id={ID} y={HORIZON} lift={30} opacity={0.7} />
      </motion.g>

      {/* ---- 2. the hillside ---- */}
      <motion.g {...layer(24, 0.04)}>
        <g filter={ink(ID, 'grain')}>
          <path d={`M0 ${HORIZON}H390V470H0Z`} fill={`url(#${ID}-slope)`} />
          {/* the ground between the rows, ploughed along the contour */}
          <g fill="none" stroke="var(--g-green-deep)" strokeWidth="1.4" opacity="0.18">
            {[196, 238, 288, 348, 424].map((y) => (
              <path key={y} d={wall(y)} />
            ))}
          </g>
        </g>
      </motion.g>

      {/* ---- 3. the terraces and the trees, back to front ---- */}
      {ROWS.map((row, i) => (
        <motion.g key={i} {...layer(14, 0.1 + i * 0.06)}>
          {/* the dry-stone wall holding this terrace up */}
          <g filter={ink(ID, 'grain-fine')}>
            <path d={wall(row.y + row.r * 0.36)} fill="none"
              stroke="var(--g-stone-shade)" strokeWidth={5 + i * 1.6} opacity="0.85" />
            <path d={wall(row.y + row.r * 0.36 - (2 + i * 0.7))} fill="none"
              stroke="var(--g-stone-hi)" strokeWidth={1.6 + i * 0.4} opacity="0.8" />
          </g>

          {TREES.filter((t) => t.row === i).map((t, j) => (
            <g key={j}>
              {/* the shadow it throws, right and downslope */}
              <ellipse cx={t.x + t.r * 0.5} cy={t.y + t.r * 0.3}
                rx={t.r * 0.86} ry={t.r * 0.2}
                fill="var(--g-green-deep)" opacity="0.24" />
              <g filter={ink(ID, 'grain')}>
                {/* the trunk — the near rows only; distance eats it first */}
                {i >= 2 && (
                  <>
                    <path
                      d={`M${t.x - t.r * 0.12} ${t.y + t.r * 0.26}`
                        + `q${t.r * 0.06} ${-t.r * 0.3} ${t.r * 0.02} ${-t.r * 0.5}`
                        + `h${t.r * 0.2}q${t.r * 0.04} ${t.r * 0.2} ${t.r * 0.1} ${t.r * 0.5}Z`}
                      fill="var(--g-green-deep)"
                    />
                    <path d={`M${t.x - t.r * 0.12} ${t.y + t.r * 0.26}q${t.r * 0.06} ${-t.r * 0.3} ${t.r * 0.02} ${-t.r * 0.5}`}
                      stroke="var(--g-lime)" strokeWidth="1.2" fill="none" opacity="0.5" />
                  </>
                )}
                <path d={canopy(t)} fill="var(--g-green-deep)" />
                {/* the lit shoulder, upper left */}
                <path
                  d={`M${t.x - t.r} ${t.y}`
                    + `C${t.x - t.r} ${t.y - t.r * 0.86} ${t.x - t.r * 0.44} ${t.y - t.r * 1.1} ${t.x - t.r * 0.1} ${t.y - t.r * 0.94}`
                    + `C${t.x - t.r * 0.3} ${t.y - t.r * 0.5} ${t.x - t.r * 0.6} ${t.y - t.r * 0.2} ${t.x - t.r} ${t.y}Z`}
                  fill="var(--g-green-lit)" opacity="0.9"
                />
                {/* the silver underside olives are known for */}
                <path d={canopy(t)} fill="var(--g-lime)" opacity="0.22"
                  filter={ink(ID, 'stipple')} />
              </g>
            </g>
          ))}
        </motion.g>
      ))}

      {/* ---- 4. a cypress marking the head of the track ---- */}
      <motion.g {...layer(10, 0.5)}>
        <Cypress id={ID} x={44} base={214} h={74} />
      </motion.g>
    </Plate>
  );
}
