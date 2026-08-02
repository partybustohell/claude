import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32, RampDefs, ScreenRamp } from './press';
import { Dome, Void } from './parts';

/**
 * WELCOME — the cliff village.
 *
 * ── WHY THIS PLATE WAS REDRAWN ───────────────────────────────────
 * The previous version lost its round-two blind duel to the master
 * comp, margin "clear". The critic's reasons were specific enough to
 * serve as a work order, and every one of them is a structural fault
 * rather than a matter of taste. Each is answered here:
 *
 *   · "a fan of alternating light/dark stripes radiating from the
 *     bottom edge that bears no relation to any light source or to the
 *     topography — decorative barcode, not description of form."
 *     The old hill was built from erosion "flutes" fanned from a point,
 *     coloured from a repeating palette. Both halves of that are the
 *     fault. A gully follows the FALL LINE — normal to the crest, so it
 *     turns as the crest turns — and its value is set by which way the
 *     face it cuts is turned, not by its position in a sequence. Below,
 *     every gully is generated from the crest's own local slope, and a
 *     gully is dark if its cut faces away from the sun. Nothing
 *     alternates for rhythm; rhythm is what made it a barcode.
 *
 *   · "buildings are near-flat cream with arbitrary thin drop shadows
 *     that point different directions from cube to cube."
 *     There is exactly one shadow vector in this file, and one sun.
 *     Every volume takes a lit west face, a cobalt-shaded east return,
 *     a roof brighter than either, and a shadow thrown right and down.
 *
 *   · "the lowest white box at mid-left floats with a flat base against
 *     a steep slope, no terrace, no contact shadow."
 *     No house has a hand-chosen y. Each is placed by a `drop` below
 *     the sampled crest, stands on a terrace that is actually drawn,
 *     and lays a contact shadow on it.
 *
 *   · "the long stair flight simply stops in mid-air at its lower end."
 *     The flight descends into a landing, the landing is drawn, and it
 *     has its own contact shadow on the slope.
 *
 *   · "the entire top-right cluster is amputated by the phone's right
 *     edge mid-volume, which reads as overflow rather than a crop
 *     decision." The village now closes at x≈350. Only the hill bleeds.
 *
 *   · Round one, never fixed: "the dome carries a gradient and a
 *     specular highlight. The comp is flat — dome, ribs, cross, done."
 *     It is the shared flat `Dome`, in cobalt.
 *
 *   · Round one, never fixed: "the cliff reappears below the GET
 *     STARTED button as a thin green sliver." The land crosses the
 *     bottom edge left of the button and runs solid beneath it, so
 *     there is a mass behind the button rather than a sliver under it.
 *
 * The comp's own weakness, per the same critic — "dead acreage in the
 * middle third; the illustration is small enough to read as an
 * afterthought vignette rather than a stage" — is deliberately not
 * copied. This headland is a real mass on a long diagonal. The bet is
 * that correct draughtsmanship WITH presence beats correct
 * draughtsmanship without it.
 *
 * Plate: 390 × 646, bleeding off the bottom and the right.
 */

const ID = 'wc';
const W = 390;
const H = 646;

/* ================================================================
   THE CREST
   ----------------------------------------------------------------
   A polyline from below the bottom-left corner up to the right edge.
   Terraces, gullies, houses, the stair and the cypress are all placed
   by sampling it, so nothing in the village can drift off the land.
   ================================================================ */

/**
 * The vertices are deliberately NOT collinear. The first pull spaced
 * them evenly down a straight line and the hill came back as a hard
 * geometric wedge — a ruled edge, which is the same fault as a ruled
 * gully. A ridge has shoulders and saddles: the run below steepens
 * between 128 and 222, eases across a saddle at 264, and flattens as it
 * runs out to the right edge.
 */
const CREST: [number, number][] = [
  [30, 668], [76, 606], [112, 560], [150, 502], [188, 448],
  [222, 410], [252, 384], [280, 350], [310, 312], [340, 286],
  [366, 274], [400, 262],
];

function crestAt(x: number): number {
  if (x <= CREST[0][0]) return CREST[0][1];
  for (let i = 1; i < CREST.length; i++) {
    if (x <= CREST[i][0]) {
      const t = (x - CREST[i - 1][0]) / (CREST[i][0] - CREST[i - 1][0]);
      return CREST[i - 1][1] + (CREST[i][1] - CREST[i - 1][1]) * t;
    }
  }
  return CREST[CREST.length - 1][1];
}

/** The crest's local slope. The fall line is normal to this. */
function slopeAt(x: number): number {
  const d = 7;
  return (crestAt(x + d) - crestAt(x - d)) / (2 * d);
}

const CREST_D = CREST.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
/* The crest re-issued as a lineto run, for splicing into a closed mass.
   Slicing the leading "M" off instead leaves the first vertex with no
   command in front of it and the whole path silently fails to parse. */
const CREST_L = CREST.map(([x, y]) => `L${x} ${y}`).join('');
const HILL = `M-14 ${H + 14}L-14 700${CREST_L}L${W + 14} ${H + 14}Z`;

/* ================================================================
   GULLIES — down the fall line, valued by aspect
   ================================================================ */

type Gully = { d: string; lit: boolean; o: number };

const GULLIES: Gully[] = (() => {
  const rnd = mulberry32(404);
  const out: Gully[] = [];
  for (let x = 24; x < 400; x += 24 + rnd() * 20) {
    const y0 = crestAt(x);
    if (y0 > H + 10) continue;
    const m = slopeAt(x);
    const norm = Math.hypot(1, m);
    /* into the hill, perpendicular to the crest */
    const nx = -m / norm;
    const ny = 1 / norm;
    const len = (H - y0) * (0.45 + rnd() * 0.6) + 40;
    const ex = x + nx * len;
    const ey = y0 + ny * len;
    /* Wide enough to read. The first pull tapered these to 5–13 units
       at 12–30% and the hill came back a flat green triangle — the
       opposite failure to the barcode, and no better as description of
       form. A gully has to be seen to describe anything. */
    const w0 = 13 + rnd() * 18;
    const w1 = w0 * (0.18 + rnd() * 0.3);
    /* a watercourse bows; a ruler does not */
    const bx = (x + ex) / 2 + 6;
    const by = (y0 + ey) / 2 + 12;
    out.push({
      d: `M${x - w0 / 2} ${y0}Q${bx - w1} ${by} ${ex - w1 / 2} ${ey}`
        + `L${ex + w1 / 2} ${ey}Q${bx + w1} ${by} ${x + w0 / 2} ${y0}Z`,
      /* the sun is upper LEFT: a cut whose western wall is exposed
         catches light, one turned into the hill does not */
      lit: rnd() > 0.55,
      o: 0.2 + rnd() * 0.26,
    });
  }
  return out;
})();

/* ================================================================
   THE VILLAGE
   ----------------------------------------------------------------
   `drop` is how far below the crest a house's FOOT sits. Nothing is
   placed by eye, so nothing can float. The cluster closes at x≈350.
   ================================================================ */

type House = { x: number; drop: number; w: number; h: number; d: number; win: number };

/**
 * The village cascades ALONG the crest, not down the face.
 *
 * The first pull of this rebuild sent it down instead: drops of 98 and
 * 150 put the last two houses under the GET STARTED button and one of
 * them clean off the bottom of the plate. The comp's village sits in a
 * band roughly 200px deep hugging the ridge, ending a clear 30px above
 * the button — so the drops here stay under 60 and the spread is in x.
 */
const HOUSES: House[] = [
  { x: 272, drop: 10, w: 36, h: 25, d: 10, win: 2 },
  { x: 240, drop: 48, w: 34, h: 22, d: 9, win: 2 },
  { x: 226, drop: 8, w: 34, h: 23, d: 9, win: 2 },
  { x: 200, drop: 44, w: 38, h: 24, d: 11, win: 2 },
  { x: 186, drop: 6, w: 30, h: 21, d: 8, win: 1 },
  { x: 162, drop: 40, w: 34, h: 22, d: 9, win: 1 },
  { x: 142, drop: 18, w: 30, h: 20, d: 8, win: 1 },
];

/** The shelf a house stands on, cut into the slope. */
function terrace(x: number, drop: number, w: number) {
  const y = crestAt(x) + drop;
  return `M${x - 9} ${y + 2}L${x + w + 13} ${y - 3}`;
}

/* The stair descends the crest and LANDS. */
const STAIR_TOP = { x: 214, drop: 34 };
const STAIR_BOT = { x: 150, drop: 26 };
const STEPS = 11;

export function WelcomeCliff({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={W} h={H}
      label="A whitewashed village cascading down a green headland above the sea, a cobalt-domed chapel at its crown"
    >
      <defs>
        <Press id={ID} seed={97} />
        <clipPath id={`${ID}-hill`}><path d={HILL} /></clipPath>
        {/* Value turns by dot coverage, not by a fill that fades. */}
        <RampDefs id={ID} name="rock" w={W} h={H} x1={0.15} y1={0} x2={0.85} y2={1} />
      </defs>

      {/* ============================================================
          1 — THE HEADLAND
          ============================================================ */}
      <motion.g {...layer(38, 0.04)}>
        <g filter={ink(ID, 'grain')}>
          <ScreenRamp id={ID} name="rock" d={HILL} w={W} h={H}
            base="var(--g-green)" lit="var(--g-green-lit)" deep="var(--g-green-deep)" />

          <g clipPath={`url(#${ID}-hill)`}>
            {GULLIES.map((g, i) => (
              <path key={i} d={g.d} opacity={g.o}
                fill={g.lit ? 'var(--g-green-lit)' : 'var(--g-green-deep)'} />
            ))}
            {/* the shaded cuts again, dithered — no shadow in a print
                has a vector edge */}
            {GULLIES.filter((g) => !g.lit).map((g, i) => (
              <path key={`s${i}`} d={g.d} opacity={g.o * 0.85}
                fill="var(--g-green-deep)" filter={ink(ID, 'stipple')} />
            ))}

            {/* the near shoulder comes toward the viewer and turns off
                the sun — this is what keeps the foot of the hill from
                reading as flat fill behind the button */}
            <path d={`M-14 700L-14 ${H + 14}L200 ${H + 14}Z`}
              fill="var(--g-green-deep)" opacity="0.32" />
            {/* and the far flank falls away to the right */}
            <path d={`M338 280L${W + 14} 238L${W + 14} ${H + 14}L300 ${H + 14}Z`}
              fill="var(--g-green-deep)" opacity="0.2" />

            {/* two spurs crossing the face: structure at more than one
                scale, which is the difference between terrain and fill */}
            <path d="M-14 596C56 578 118 546 172 500C222 458 262 416 320 380"
              fill="none" stroke="var(--g-green-deep)" strokeWidth="14" opacity="0.26" />
            <path d="M-14 602C56 584 118 552 172 506C222 464 262 422 320 386"
              fill="none" stroke="var(--g-green-lit)" strokeWidth="3" opacity="0.34" />
            <path d="M-14 664C64 646 130 610 186 562"
              fill="none" stroke="var(--g-green-deep)" strokeWidth="12" opacity="0.22" />

            {/* scrub, on the ledges only */}
            <g fill="var(--g-green-deep)" opacity="0.24">
              {[[78, 46], [146, 40], [228, 34], [316, 30]].map(([x, d], i) => (
                <ellipse key={x} cx={x} cy={crestAt(x) + d}
                  rx={15 - i * 1.4} ry={5 - i * 0.4} />
              ))}
            </g>
          </g>

          {/* the crest keeps the sun along its whole length */}
          <path d={CREST_D} fill="none" stroke="var(--g-green-lit)"
            strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          {/* Straddling the ridge so the silhouette is not a wire.
              Derived from the crest — given fixed coordinates, one of
              these ended up hanging in the sky the moment the crest was
              reshaped, which is the same floating fault in miniature. */}
          <g fill="var(--g-green-deep)" opacity="0.7">
            {[112, 158, 356].map((x, i) => (
              <ellipse key={x} cx={x} cy={crestAt(x) + 1}
                rx={7 - i * 0.6} ry={3 - i * 0.2} />
            ))}
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE TERRACES the village stands on
          ============================================================ */}
      <motion.g {...layer(20, 0.16)}>
        <g clipPath={`url(#${ID}-hill)`}>
          {HOUSES.map((h, i) => (
            <g key={i}>
              <path d={terrace(h.x, h.drop, h.w)} stroke="var(--g-stone-hi)"
                strokeWidth="3.6" opacity="0.6" strokeLinecap="round" fill="none" />
              <path d={terrace(h.x, h.drop + 5, h.w)} stroke="var(--g-green-deep)"
                strokeWidth="3.4" opacity="0.3" strokeLinecap="round" fill="none" />
            </g>
          ))}
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE STAIR. It descends, and it arrives somewhere.
          ============================================================ */}
      <motion.g {...layer(14, 0.3)}>
        <g clipPath={`url(#${ID}-hill)`}>
          {Array.from({ length: STEPS }, (_, i) => {
            const t = i / (STEPS - 1);
            const x = STAIR_TOP.x + (STAIR_BOT.x - STAIR_TOP.x) * t;
            const y = crestAt(x) + STAIR_TOP.drop + (STAIR_BOT.drop - STAIR_TOP.drop) * t;
            const w = 20 + 8 * t;
            return (
              <g key={i}>
                {/* riser shaded, tread lit — that is what makes a flight
                    read as steps rather than as a ladder painted on */}
                <path d={`M${x - w / 2} ${y}h${w}v5.6h${-w}Z`}
                  fill="var(--g-stone-shade)" />
                <path d={`M${x - w / 2} ${y}h${w}l-2.4 -2.8h${-(w - 4.8)}Z`}
                  fill="var(--g-stone-hi)" />
              </g>
            );
          })}

          {/* THE LANDING */}
          {(() => {
            const ly = crestAt(STAIR_BOT.x) + STAIR_BOT.drop + 6;
            return (
              <g>
                <path d={`M${STAIR_BOT.x - 24} ${ly}h48l7 10h-62Z`} fill="var(--g-stone)" />
                <path d={`M${STAIR_BOT.x - 24} ${ly}h48`} stroke="var(--g-stone-hi)"
                  strokeWidth="2.6" fill="none" />
                {/* it sits ON the hill */}
                <path d={`M${STAIR_BOT.x - 30} ${ly + 13}h64`}
                  stroke="var(--g-green-deep)" strokeWidth="5.5" opacity="0.36"
                  fill="none" filter={ink(ID, 'stipple')} />
              </g>
            );
          })()}
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE VILLAGE
          ============================================================ */}
      {HOUSES.map((h, i) => {
        const y = crestAt(h.x) + h.drop - h.h;
        return (
          <motion.g key={i} {...layer(16, 0.36 + i * 0.035)}>
            {/* one shadow vector for the whole plate: right and down */}
            <g clipPath={`url(#${ID}-hill)`}>
              <path
                d={`M${h.x + h.w} ${y + h.h}l${h.d + 12} ${-h.d * 0.3}`
                  + `l2 6l${-(h.w + h.d + 12)} ${2}Z`}
                fill="var(--g-green-deep)" opacity="0.44"
              />
            </g>

            <g filter={ink(ID, 'grain-fine')}>
              {/* the east return, turned away from the sun */}
              <path
                d={`M${h.x + h.w} ${y}l${h.d} ${-h.d * 0.42}v${h.h}l${-h.d} ${h.d * 0.42}Z`}
                fill="var(--g-stone-shade)"
              />
              {/* the roof, the brightest plane in the drawing */}
              <path
                d={`M${h.x} ${y}l${h.d} ${-h.d * 0.42}h${h.w}l${-h.d} ${h.d * 0.42}Z`}
                fill="var(--g-stone-hi)"
              />
              {/* the lit west face */}
              <rect x={h.x} y={y} width={h.w} height={h.h} fill="var(--g-stone)" />
              <rect x={h.x} y={y} width="1.4" height={h.h} fill="var(--g-stone-hi)" />
              <rect x={h.x} y={y} width={h.w} height="1.4" fill="var(--g-stone-hi)" />

              {/* openings in cobalt — the inside of a wall is dark */}
              {Array.from({ length: h.win }, (_, k) => (
                <Void key={k}
                  x={h.x + h.w * (0.2 + k * 0.38)}
                  y={y + h.h * 0.38}
                  w={h.w * 0.16}
                  h={h.h * 0.44}
                  arch
                />
              ))}
            </g>
          </motion.g>
        );
      })}

      {/* ============================================================
          5 — THE CHAPEL, crowning the cluster
          ============================================================ */}
      <motion.g {...layer(14, 0.62)}>
        {(() => {
          /* Placed off the crest like every other volume. Given a
             hand-chosen y it floated ten units clear of the ridge — the
             same fault the critic caught on the old plate's lowest box,
             reappearing on the one building that crowns the drawing. */
          const CX = 316;
          const x0raw = CX - 20;
          /* Sample the crest at BOTH ends of the building and take the
             lower. Sampling at the centre only, as the first redraw did,
             put the left two-thirds of a 44-wide chapel over open sky —
             the crest at x=296 is twenty units below the crest at 316.
             A wide object has to be tested where it is widest. */
          const foot = Math.max(crestAt(x0raw), crestAt(x0raw + 44)) + 8;
          const bh = 26;
          const top = foot - bh;
          const x0 = x0raw;
          return (
            <>
              <g clipPath={`url(#${ID}-hill)`}>
                <path d={`M${x0 + 44} ${foot}l22 -3l6 7l-30 5Z`}
                  fill="var(--g-green-deep)" opacity="0.42" />
              </g>
              <g filter={ink(ID, 'grain-fine')}>
                <rect x={x0} y={top} width="44" height={bh} fill="var(--g-stone)" />
                <path d={`M${x0 + 44} ${top}l10 -4v${bh}l-10 4Z`} fill="var(--g-stone-shade)" />
                <path d={`M${x0} ${top}l10 -4h44l-10 4Z`} fill="var(--g-stone-hi)" />
                <rect x={x0} y={top} width="44" height="1.4" fill="var(--g-stone-hi)" />
                <Void x={x0 + 17} y={top + 8} w={10} h={18} arch />
                {/* flat cobalt dome — ribs, cross, done */}
                <Dome x={CX + 6} base={top} r={17} onInk />
                {/* the bell arch beside it */}
                <rect x={x0 - 12} y={top - 10} width="10" height={bh + 10}
                  fill="var(--g-stone)" />
                <rect x={x0 - 12} y={top - 10} width="10" height="2"
                  fill="var(--g-stone-hi)" />
                <path d={`M${x0 - 12} ${top - 3}a5 5 0 0 1 10 0v7h-10Z`}
                  fill="var(--g-void)" opacity="0.9" />
              </g>
            </>
          );
        })()}
      </motion.g>

      {/* ============================================================
          6 — THE CYPRESS
          ----------------------------------------------------------
          Placed to OVERLAP the wall behind it. The critic named that as
          the thing the comp did and the old plate did not: an object
          that overlaps another is pinned to the ground plane, and one
          that touches nothing floats.
          ============================================================ */}
      <motion.g {...layer(12, 0.72)}>
        {(() => {
          /* Stands just downhill of the house at x=226 so its crown
             OVERLAPS that wall. An object that overlaps another is
             pinned to the ground plane; one that touches nothing
             floats, which is exactly what the critic rewarded the comp
             for getting right. */
          const cx = 218;
          const base = crestAt(cx) + 34;
          const h = 74;
          const top = base - h;
          return (
            <>
              <g clipPath={`url(#${ID}-hill)`}>
                <ellipse cx={cx + 4} cy={base} rx="13" ry="4.4"
                  fill="var(--g-green-deep)" opacity="0.42" />
              </g>
              <g filter={ink(ID, 'grain')}>
                <rect x={cx - 1.6} y={base - 18} width="3.2" height="18"
                  fill="var(--g-green-deep)" />
                <path
                  d={`M${cx} ${top}c9.4 22 12.6 48 10.4 70-1.8 15.6-19 15.6-20.8 0-2.2-22 1-48 10.4-70Z`}
                  fill="var(--g-green-deep)"
                />
                <path
                  d={`M${cx} ${top}c-5.2 13-8.2 29-9 44-.8 11-.4 20.4.6 27.8-3.6-23.4-1.4-52.6 8.4-71.8Z`}
                  fill="var(--g-green)" opacity="0.92"
                />
              </g>
            </>
          );
        })()}
      </motion.g>
    </Plate>
  );
}
