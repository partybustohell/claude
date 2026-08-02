import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32 } from './press';
import { Water, WaterDefs, Ridge, Cypress, Dome, Block, Void, Gulls } from './parts';

/**
 * SANTORINI — the caldera.
 *
 * One of the four covers a goal can be given. The town is built DOWN a
 * cliff rather than along a street: every house stands on the roof of
 * the one below it, which is the only structural idea in the drawing and
 * the one that has to survive being reduced to a thumbnail.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. Each cube gets a lit west wall, a shaded south return and
 * a roof brighter than either, and the terrace it stands on throws a
 * short shadow onto the roof below — which is what welds the town to
 * the rock instead of leaving it stuck on like a decal, the exact fault
 * the round-one notes caught on the welcome cliff.
 *
 * ── THE CLIFF ────────────────────────────────────────────────────
 * A single mass, rising from the bottom-left to the right edge, with
 * the houses reading down its spine. Three silhouettes, not thirty
 * beziers: the crest, the shaded gullies raking the face, and the far
 * headland across the water.
 *
 * Plate: 390 × 470, bleeding off the bottom and the right.
 */

const ID = 'sa';
const HORIZON = 236;

const CLIFF =
  'M0 470'
  + 'C22 430 44 386 72 344'
  + 'C96 308 124 274 158 248'
  + 'C186 226 216 210 250 202'
  + 'C292 192 340 194 390 206'
  + 'V470Z';

/**
 * The crest, sampled. Everything in the town is placed against this
 * rather than by eye — the first pull put the houses at hand-chosen
 * coordinates and they came back as a pile of white boxes floating on
 * the green, because none of them was standing on anything.
 */
const CREST = [[158, 248], [186, 230], [214, 215], [250, 202],
  [290, 196], [330, 198], [390, 206]];

function crestAt(x: number) {
  for (let i = 1; i < CREST.length; i++) {
    if (x <= CREST[i][0]) {
      const t = (x - CREST[i - 1][0]) / (CREST[i][0] - CREST[i - 1][0]);
      return CREST[i - 1][1] + (CREST[i][1] - CREST[i - 1][1]) * t;
    }
  }
  return CREST[CREST.length - 1][1];
}

/**
 * The town, in three courses down the face.
 *
 * `drop` is how far below the crest a house's FOOT sits, so every house
 * stands on the rock at a known depth instead of hovering at an
 * arbitrary y. Three courses at increasing drop is what makes the town
 * step down the cliff — the single structural idea in the drawing.
 */
const HOUSES = ([
  [174, 12, 34, 22, 8], [212, 10, 40, 24, 9], [258, 9, 34, 21, 8],
  [300, 11, 38, 25, 9], [344, 13, 32, 21, 7],
  [190, 44, 42, 24, 10], [240, 42, 36, 22, 9], [286, 45, 44, 26, 10],
  [336, 47, 34, 22, 8],
  [212, 78, 38, 22, 9], [264, 82, 42, 24, 10], [318, 79, 34, 21, 8],
] as const).map(([x, drop, w, h, d]) => ({
  x, w, h, d, y: crestAt(x) + drop - h,
}));

/** Gullies raking the cliff face, laid by seed so they never drift. */
const GULLIES = (() => {
  const rnd = mulberry32(88);
  return Array.from({ length: 9 }, (_, i) => {
    const x = 20 + i * 42 + rnd() * 14;
    const y = 300 + rnd() * 60 - i * 12;
    const len = 120 + rnd() * 130;
    const w = 10 + rnd() * 16;
    return { d: `M${x} ${y}c${-w * 0.4} ${len * 0.4} ${-w * 0.2} ${len * 0.7} ${-w * 0.7} ${len}`
      + `h${w * 1.7}c${w * 0.3} ${-len * 0.3} ${w * 0.1} ${-len * 0.66} ${w * 0.2} ${-len}Z`,
      o: 0.16 + rnd() * 0.2, lit: i % 3 === 0 };
  });
})();

export function Santorini({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={470}
      label="A Cycladic town stepping down a caldera cliff above the sea, its chapels domed in cobalt"
    >
      <defs>
        <Press id={ID} seed={71} />
        <WaterDefs id={ID} y={HORIZON} h={470 - HORIZON} />
        <clipPath id={`${ID}-cliff`}><path d={CLIFF} /></clipPath>
        <linearGradient id={`${ID}-rock`} x1="0.05" y1="0.05" x2="0.9" y2="1">
          <stop offset="0" stopColor="var(--g-green-lit)" />
          <stop offset="0.28" stopColor="var(--g-green)" />
          <stop offset="1" stopColor="var(--g-green-deep)" />
        </linearGradient>
      </defs>

      {/* ---- 1. the far headland, across the water ---- */}
      <motion.g {...layer(8, 0.04)}>
        <Ridge id={ID} y={HORIZON} lift={26} opacity={0.8} />
      </motion.g>

      {/* ---- 2. the caldera ---- */}
      <motion.g {...layer(12, 0.02)}>
        <Water id={ID} y={HORIZON} h={470 - HORIZON} />
      </motion.g>

      {/* ---- 3. the cliff ---- */}
      <motion.g {...layer(40, 0.1)}>
        <g filter={ink(ID, 'grain')}>
          <path d={CLIFF} fill={`url(#${ID}-rock)`} />
          <g clipPath={`url(#${ID}-cliff)`}>
            {GULLIES.map((g, i) => (
              <path key={i} d={g.d} opacity={g.o}
                fill={g.lit ? 'var(--g-green-lit)' : 'var(--g-green-deep)'} />
            ))}
            {GULLIES.filter((g) => !g.lit).map((g, i) => (
              <path key={`s${i}`} d={g.d} opacity={g.o * 0.8}
                fill="var(--g-green-deep)" filter={ink(ID, 'stipple')} />
            ))}
            {/* the mass turns away to the right and loses the sun */}
            <path d="M300 198c40 22 70 60 82 116 8 38 8 100 8 156H300Z"
              fill="var(--g-green-deep)" opacity="0.26" />
          </g>
          {/* the crest keeps the light along its whole length */}
          <path
            d="M0 470C22 430 44 386 72 344C96 308 124 274 158 248C186 226 216 210 250 202C292 192 340 194 390 206"
            fill="none" stroke="var(--g-green-lit)" strokeWidth="3"
            strokeLinecap="round" opacity="0.9"
          />
        </g>
        {/* surf at the foot of the cliff */}
        <g clipPath={`url(#${ID}-cliff)`}>
          <path d="M0 470C22 430 44 386 72 344" fill="none" stroke="var(--g-foam)"
            strokeWidth="8" strokeLinecap="round" opacity="0.5"
            filter={ink(ID, 'stipple')} />
        </g>
      </motion.g>

      {/* ---- 4. the town ---- */}
      <motion.g {...layer(18, 0.3)}>
        {/* The three terraces the courses stand on. Without these the
            houses read as boxes dropped on a hillside.
            They run only under the town — carried the full length of the
            crest they read as pale streaks scored across bare rock. */}
        <g clipPath={`url(#${ID}-cliff)`}>
          {[12, 44, 78].map((drop, i) => {
            const span = CREST.filter(([x]) => x >= 166);
            const d = span.map(([x, y], j) => `${j ? 'L' : 'M'}${x} ${y + drop}`).join('');
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--g-stone-hi)"
                  strokeWidth={2.4 + i * 0.5} opacity={0.45} strokeLinecap="round" />
                <path d={span.map(([x, y], j) => `${j ? 'L' : 'M'}${x} ${y + drop + 3}`).join('')}
                  fill="none" stroke="var(--g-green-deep)"
                  strokeWidth={3} opacity={0.26} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        <g filter={ink(ID, 'grain-fine')}>
          {HOUSES.map((h, i) => (
            <g key={i}>
              {/* the terrace this one stands on throws onto the roof below */}
              <path d={`M${h.x + h.w} ${h.y + h.h}l${h.d + 6} ${-h.d * 0.3}l0 4l-${h.w + h.d + 6} ${1}Z`}
                fill="var(--g-green-deep)" opacity="0.3" />
              <Block x={h.x} y={h.y} w={h.w} h={h.h} d={h.d} />
              {/* one window each — a wall of windows reads as an office */}
              <Void x={h.x + h.w * 0.3} y={h.y + h.h * 0.36} w={h.w * 0.2} h={h.h * 0.42} />
            </g>
          ))}
          {/* two chapels, and only two */}
          {/* two chapels, and only two — one on each of the upper courses */}
          <Dome x={232} base={crestAt(232) + 42} r={14} />
          <Dome x={306} base={crestAt(306) + 76} r={11} />
        </g>
      </motion.g>

      {/* ---- 5. the cypresses ---- */}
      <motion.g {...layer(12, 0.5)}>
        <Cypress id={ID} x={158} base={crestAt(158) + 58} h={62} />
        <Cypress id={ID} x={372} base={crestAt(372) + 46} h={48} />
      </motion.g>

      <motion.g {...layer(0, 0.66)}>
        <Gulls x={70} y={130} scale={0.9} />
      </motion.g>
    </Plate>
  );
}
