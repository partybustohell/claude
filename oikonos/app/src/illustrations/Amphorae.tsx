import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';

/**
 * AMPHORAE — the store room.
 *
 * For the budgets cluster. An envelope is a jar: it holds a measure,
 * you fill it once, and what you can see at a glance is how far down
 * the oil has gone. The plate is the budgets screen said in clay —
 * four jars standing on one shelf, each at its own level, and one
 * lying empty on its side for the categories with no envelope at all.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. Every jar carries a lit crescent down its left flank and
 * closes to shade on the right; every jar throws its shadow to the
 * right along the shelf; the shelf's top surface is lit and its front
 * face is the darkest stone in the picture. The levels inside are the
 * one thing that does not obey the sun — they are ink, flat, because
 * they are a reading and not a lit surface.
 *
 * ── WHY THE LEVELS DIFFER ────────────────────────────────────────
 * Four jars at four heights is decoration. Four jars at four *levels*
 * is a chart. The fills below run 0.72, 0.41, 0.88, 0.24 — a spread
 * wide enough that the eye reads them as measurements, and no two
 * close enough to look like a mistake.
 *
 * Plate: 390 × 236, bleeding off both edges and the bottom.
 */

const ID = 'am';
const SHELF = 186;          // the top surface the jars stand on
const SHELF_FACE = 198;

type Jar = { x: number; h: number; w: number; fill: number; ink: string };

/** Left to right, and deliberately not in size order. */
const JARS: Jar[] = [
  { x: 46, h: 96, w: 54, fill: 0.72, ink: 'var(--g-sea)' },
  { x: 124, h: 68, w: 42, fill: 0.41, ink: 'var(--g-green)' },
  { x: 196, h: 112, w: 62, fill: 0.88, ink: 'var(--g-sea)' },
  { x: 288, h: 78, w: 46, fill: 0.24, ink: 'var(--g-clay)' },
];

/**
 * The body of a jar.
 *
 * The first pull of this plate came back as a row of light bulbs. The
 * fault was proportion, not drawing: the neck was a fifth of the height
 * and nearly as wide as the belly, so there was no waist, and without a
 * waist an amphora is a balloon. A storage jar's neck is long and
 * NARROW — a third of the belly's width — and the shoulder breaks
 * sharply out of it. That break is the whole silhouette.
 */
const NECK_TOP = 0.26;      // the neck occupies the top quarter
const NECK_W = 0.34;        // ...at a third of the belly's width

function body(j: Jar) {
  const { x, h, w } = j;
  const base = SHELF;
  const top = base - h;
  const nw = w * NECK_W;
  const neckFoot = top + h * NECK_TOP;
  const belly = top + h * 0.52;
  const foot = w * 0.3;
  return (
    `M${x - nw / 2} ${top}`
    /* the neck runs straight down, barely tapering */
    + `L${x - nw / 2 - w * 0.02} ${neckFoot}`
    /* then the shoulder breaks hard out to the belly */
    + `C${x - w * 0.42} ${neckFoot + h * 0.06} ${x - w / 2} ${belly - h * 0.1} ${x - w / 2} ${belly}`
    + `C${x - w / 2} ${base - h * 0.2} ${x - foot / 2} ${base - h * 0.06} ${x - foot / 2} ${base}`
    + `L${x + foot / 2} ${base}`
    + `C${x + foot / 2} ${base - h * 0.06} ${x + w / 2} ${base - h * 0.2} ${x + w / 2} ${belly}`
    + `C${x + w / 2} ${belly - h * 0.1} ${x + w * 0.42} ${neckFoot + h * 0.06} ${x + nw / 2 + w * 0.02} ${neckFoot}`
    + `L${x + nw / 2} ${top}Z`
  );
}

/**
 * A handle. It runs from the NECK out and down to the SHOULDER, which
 * is where a jar is actually gripped and lifted — the earlier version
 * looped inside the neck's own width and read as wire.
 */
function handle(j: Jar, side: 1 | -1) {
  const top = SHELF - j.h;
  const nw = (j.w * NECK_W) / 2;
  const y0 = top + j.h * 0.06;
  const y1 = top + j.h * 0.38;
  const out = j.w * 0.52;
  return (
    `M${j.x + side * nw} ${y0}`
    + `C${j.x + side * out} ${y0 + j.h * 0.02} ${j.x + side * out} ${y1 - j.h * 0.1} ${j.x + side * (j.w * 0.4)} ${y1}`
  );
}

export function Amphorae({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={236}
      label="Four storage jars on a stone shelf, each filled to a different level, and one lying empty"
    >
      <defs>
        <Press id={ID} seed={11} />
        {JARS.map((j, i) => (
          <clipPath key={i} id={`${ID}-jar${i}`}><path d={body(j)} /></clipPath>
        ))}
      </defs>

      {/* ============================================================
          1 — THE WALL these stand against
          ============================================================ */}
      <motion.g {...layer(6, 0.02)}>
        <g filter={ink(ID, 'grain-fine')} opacity="0.5">
          {/* a course of blocks, drawn only where a jar will not cover it */}
          <g stroke="var(--g-stone-shade)" strokeWidth="1" opacity="0.4">
            <path d="M0 118H390" />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE JARS
          ============================================================ */}
      {JARS.map((j, i) => {
        const top = SHELF - j.h;
        const bellyTop = top + j.h * NECK_TOP;
        const level = SHELF - (SHELF - bellyTop) * j.fill;
        return (
          <motion.g key={i} {...layer(18, 0.1 + i * 0.07)}>
            {/* the shadow it throws along the shelf, to the right */}
            <ellipse cx={j.x + j.w * 0.34} cy={SHELF + 1.5}
              rx={j.w * 0.62} ry="3.4"
              fill="var(--g-stone-dark)" opacity="0.3" />

            <g filter={ink(ID, 'grain-fine')}>
              <path d={body(j)} fill="var(--g-stone)" />

              {/* WHAT IS IN IT. Flat ink to a level — this is the reading,
                  so it takes no highlight and no shading. */}
              <g clipPath={`url(#${ID}-jar${i})`}>
                <rect x={j.x - j.w} y={level} width={j.w * 2} height={j.h}
                  fill={j.ink} opacity="0.9" />
                {/* the meniscus, dithered, so the surface is a liquid */}
                <rect x={j.x - j.w} y={level - 3} width={j.w * 2} height="6"
                  fill={j.ink} opacity="0.55" filter={ink(ID, 'stipple')} />
                {/* the flank turning away from the sun, over the fill too */}
                <path d={`M${j.x + j.w * 0.1} ${top}H${j.x + j.w}V${SHELF}H${j.x + j.w * 0.1}Z`}
                  fill="var(--g-stone-dark)" opacity="0.16" />
              </g>

              {/* lit crescent, left flank */}
              <path
                d={`M${j.x - j.w * 0.5} ${top + j.h * 0.46}`
                  + `C${j.x - j.w * 0.5} ${SHELF - j.h * 0.2} ${j.x - j.w * 0.15} ${SHELF - j.h * 0.06} ${j.x - j.w * 0.15} ${SHELF}`}
                fill="none" stroke="var(--g-stone-hi)" strokeWidth="2.6"
                strokeLinecap="round" opacity="0.9"
              />

              {/* the rim flares wider than the neck it caps */}
              <rect x={j.x - (j.w * NECK_W) / 2 - 4.5} y={top - 4}
                width={j.w * NECK_W + 9} height="5.6" rx="2.4"
                fill="var(--g-stone)" />
              <rect x={j.x - (j.w * NECK_W) / 2 - 4.5} y={top - 4}
                width={j.w * NECK_W + 9} height="1.8" rx="0.9"
                fill="var(--g-stone-hi)" />
              <rect x={j.x + (j.w * NECK_W) / 2 + 1} y={top - 4}
                width="3.5" height="5.6" fill="var(--g-stone-shade)" />

              {/* handles */}
              <g fill="none" stroke="var(--g-stone)" strokeWidth="6" strokeLinecap="round">
                <path d={handle(j, 1)} />
                <path d={handle(j, -1)} />
              </g>
              <g fill="none" strokeWidth="1.8" strokeLinecap="round">
                <path d={handle(j, -1)} stroke="var(--g-stone-hi)" />
                <path d={handle(j, 1)} stroke="var(--g-stone-shade)" />
              </g>

              {/* a band around the widest part of the belly, in the clay
                  ink — the one warm mark, and it sits where a potter
                  would actually run it rather than around the throat */}
              <path
                d={`M${j.x - j.w * 0.47} ${top + j.h * 0.56}Q${j.x} ${top + j.h * 0.6} ${j.x + j.w * 0.47} ${top + j.h * 0.56}`}
                fill="none" stroke="var(--g-clay)" strokeWidth="2.4" opacity="0.85"
              />
            </g>
          </motion.g>
        );
      })}

      {/* ============================================================
          3 — THE JAR ON ITS SIDE — the categories with no envelope
          ============================================================ */}
      <motion.g {...layer(14, 0.42)}>
        <g transform="translate(350 168) rotate(-74)" filter={ink(ID, 'grain-fine')}>
          <path
            d="M-8 0C-13 8 -21 10 -21 21C-21 34 -13 44 -8 46L8 46C13 44 21 34 21 21C21 10 13 8 8 0Z"
            fill="var(--g-stone)"
          />
          <path d="M-8 0C-13 8 -21 10 -21 21C-21 34 -13 44 -8 46"
            fill="none" stroke="var(--g-stone-hi)" strokeWidth="2.2" />
          <path d="M8 0C13 8 21 10 21 21C21 34 13 44 8 46"
            fill="none" stroke="var(--g-stone-shade)" strokeWidth="2.2" />
          <rect x="-9" y="-4" width="18" height="4" rx="1.6" fill="var(--g-stone)" />
          {/* the mouth is empty and dark */}
          <ellipse cx="0" cy="-3" rx="8" ry="2.6" fill="var(--g-void)" opacity="0.72" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE SHELF
          ============================================================ */}
      <motion.g {...layer(20, 0.06)}>
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="0" y={SHELF} width="390" height={SHELF_FACE - SHELF}
            fill="var(--g-stone-hi)" />
          {/* Full opacity, deliberately. Dropping this to 0.62 to lighten
              it composited to rgb(204,207,216) — 5.6% saturation, a grey,
              which is the same defect the token layer was fixed for. The
              rule applies to OPACITY as well as to fills: any pale wash
              over cream trends to neutral whatever ink it started from. */}
          <rect x="0" y={SHELF_FACE} width="390" height={236 - SHELF_FACE}
            fill="var(--g-stone-shade)" />
          <rect x="0" y={SHELF} width="390" height="1.8" fill="var(--g-stone-hi)" />
          {/* the shadow the lip throws on its own face */}
          <rect x="0" y={SHELF_FACE} width="390" height="2.4"
            fill="var(--g-stone-dark)" opacity="0.4" />
          {/* joints, on the shaded face only */}
          <g stroke="var(--g-stone-dark)" strokeWidth="1" opacity="0.32">
            <path d="M74 198V236M188 198V236M300 198V236" />
          </g>
        </g>
      </motion.g>
    </Plate>
  );
}
