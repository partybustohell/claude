import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32, RampDefs, ScreenRamp } from './press';
import { Ridge, Cypress, Contact } from './parts';

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
        <RampDefs id={ID} name="slope" w={390} h={470} x1={0.1} y1={0} x2={0.8} y2={1} />
      </defs>

      {/* ---- 1. the ridge closing the valley ---- */}
      <motion.g {...layer(8, 0.02)}>
        <Ridge id={ID} y={HORIZON} lift={30} opacity={0.7} />
      </motion.g>

      {/* ---- 2. the hillside ---- */}
      <motion.g {...layer(24, 0.04)}>
        <g filter={ink(ID, 'grain')}>
          <ScreenRamp id={ID} name="slope" d={`M0 ${HORIZON}H390V470H0Z`} w={390} h={470}
            base="var(--g-green-far)" lit="var(--g-lime)" deep="var(--g-green)" />
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
          {/* The dry-stone wall holding this terrace up.
              Warm rubble, not whitewash — in the cream stone values
              these read as chalk streaks scored across the hill. The
              face sits in the grove's own shadow, the coping takes the
              sun, and the far rows lose contrast rather than width so
              the near wall stays the heaviest. */}
          <g filter={ink(ID, 'grain-fine')}>
            <path d={wall(row.y + row.r * 0.36 + 1)} fill="none"
              stroke="var(--g-wall-deep)" strokeWidth={5 + i * 1.6}
              opacity={0.5 + i * 0.08} />
            <path d={wall(row.y + row.r * 0.36)} fill="none"
              stroke="var(--g-wall)" strokeWidth={3.4 + i * 1.2}
              opacity={0.62 + i * 0.07} />
            <path d={wall(row.y + row.r * 0.36 - (2 + i * 0.7))} fill="none"
              stroke="var(--g-wall-lit)" strokeWidth={1.4 + i * 0.35}
              opacity={0.5 + i * 0.09} />
          </g>

          {TREES.filter((t) => t.row === i).map((t, j) => (
            <g key={j}>
              {/* the shadow it throws, right and downslope — it sits at
                  the FOOT of the trunk, not under the canopy, or the
                  tree reads as floating on its own shade */}
              <Contact cx={t.x} cy={t.y + t.r * 0.62} rx={t.r * 0.8} ry={t.r * 0.17}
                id={ID} opacity={0.34} />
              <g filter={ink(ID, 'grain')}>
                {/* The trunk — near rows only; distance eats it first.
                    It has to clear the canopy, whose lowest lobe reaches
                    y + 0.34r. Drawn inside that, as it was, a trunk is
                    perfectly hidden and the grove is a row of bushes. */}
                {i >= 2 && (
                  <>
                    <path
                      d={`M${t.x - t.r * 0.11} ${t.y + t.r * 0.62}`
                        + `C${t.x - t.r * 0.09} ${t.y + t.r * 0.46} ${t.x - t.r * 0.13} ${t.y + t.r * 0.4} ${t.x - t.r * 0.08} ${t.y + t.r * 0.2}`
                        + `h${t.r * 0.17}`
                        + `C${t.x + t.r * 0.14} ${t.y + t.r * 0.4} ${t.x + t.r * 0.1} ${t.y + t.r * 0.46} ${t.x + t.r * 0.13} ${t.y + t.r * 0.62}Z`}
                      fill="var(--g-green-deep)"
                    />
                    {/* lit on its left, like everything else in the app */}
                    <path
                      d={`M${t.x - t.r * 0.1} ${t.y + t.r * 0.6}`
                        + `C${t.x - t.r * 0.08} ${t.y + t.r * 0.44} ${t.x - t.r * 0.12} ${t.y + t.r * 0.38} ${t.x - t.r * 0.07} ${t.y + t.r * 0.24}`}
                      stroke="var(--g-wall)" strokeWidth={t.r * 0.05}
                      fill="none" opacity="0.55" strokeLinecap="round"
                    />
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
