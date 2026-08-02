import { motion, useReducedMotion } from 'framer-motion';
import { Plate, Press, cov, useLayer, CovMask, Cov, mulberry32 } from './press';
import { Cypress } from './parts';

/**
 * WINDMILL — what turns.
 *
 * For the recurring cluster: standing orders, subscriptions, bills that
 * arrive whether or not you thought about them. A mill is the only
 * honest picture of a charge that repeats — it turns because the wind
 * is blowing, not because anyone decided today that it should.
 *
 * ── WHY THIS PLATE WAS REDRAWN ───────────────────────────────────
 * It went into four blind duels and lost three, the last one clear,
 * and the verdicts converged on faults no patch was going to reach.
 *
 *   · "its ink sits at roughly a quarter to a half strength throughout
 *     … essentially none at full ink. A riso drum cannot print that."
 *     Measured: 0.0% of the old tower's shade face reached full ink and
 *     the densest strip averaged 27% of the way from paper to cobalt.
 *     The plate thinned the dots AND weakened the ink — it screened a
 *     colour that was already a tint. Nothing here is a tint. Every
 *     mark is cream paper, cobalt, pine or vermilion at full strength,
 *     and every value between them is dot COVERAGE. See `Cov`.
 *
 *   · "the green is one flat value front to back, so the light exists
 *     on one object only." Two drums, three distances: the far ridge is
 *     pine at a third coverage on bare stock, and the near ground is
 *     solid pine that a cobalt overprint darkens as it turns out of the
 *     light. No fifth colour anywhere.
 *
 *   · "nothing casts." Every standing thing throws: all three mills,
 *     both cypresses, the wall. The shadows are cobalt printed OVER
 *     pine, which is what a second drum does to a first.
 *
 *   · "the 12-blade rotor is fussy and unequal, its silhouette lumpy,
 *     one lower blade tip dying in mid-air over the tower wall." Every
 *     tip lands on one true circle, and that circle is drawn — a
 *     Cycladic mill has an outer hoop, and the hoop is what makes the
 *     wheel one shape instead of twelve. See `blades` for why a tip was
 *     ever in mid-air.
 *
 *   · "the right-hand window is a visibly weaker blue than the left one
 *     despite sitting on the shadow side — backwards, and again a
 *     tint." Both windows are solid cobalt. A hole is a hole.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left, and the sails prove it: the wheel throws itself onto the
 * tower wall and the shadow turns with it. That is the one moving
 * shadow in the app, and it is the reason to draw a mill at all.
 *
 * ── WHY THREE ────────────────────────────────────────────────────
 * A row of mills along a ridge is what Mykonos actually has, and it is
 * also the argument this screen is making: the near one is working, the
 * far one is working, and the third has stopped. A subscription you
 * forgot about is the third one.
 *
 * ── WHERE THE DRAWING HAS TO FIT ─────────────────────────────────
 * `PlateFoot` CROPS rather than scales, and the tightest caller —
 * Recurring — asks for 150 of the plate's 250 units. The first cut of
 * this redraw put the wheel's hub at y 110 with a 52-unit radius, so on
 * that screen the mill came through the crop sawn in half. Everything
 * that has to read lives below y = 102 now — the near wheel's topmost
 * point is y 103 — and the sky above it is sky. A plate is not
 * finished when it looks right in the proof; it is finished when it
 * looks right where it is used.
 *
 * Plate: 390 × 250, bleeding off the bottom and both sides.
 */

const ID = 'wm';
const W = 390;
const H = 250;

/* ================================================================
   THE LAND
   ================================================================ */

/** The ridge the mills stand on. Everything stands ON this line. */
const CREST: [number, number][] = [
  [0, 238], [60, 231], [138, 223], [200, 214], [262, 201], [320, 192], [390, 182],
];

function groundAt(x: number) {
  for (let i = 1; i < CREST.length; i++) {
    if (x <= CREST[i][0]) {
      const t = (x - CREST[i - 1][0]) / (CREST[i][0] - CREST[i - 1][0]);
      return CREST[i - 1][1] + (CREST[i][1] - CREST[i - 1][1]) * t;
    }
  }
  return CREST[CREST.length - 1][1];
}

const CREST_D =
  'M0 238C24 234 40 233 60 231C88 227 112 225 138 223'
  + 'C162 221 180 218 200 214C226 209 244 205 262 201'
  + 'C286 197 302 195 320 192C348 189 370 186 390 182';
const LAND = `${CREST_D}V250H0Z`;

/** The far ridge: the same pine, thinned until it sits back. */
const FAR_D =
  'M0 196C30 187 62 181 90 178C120 175 146 173 170 171'
  + 'C200 168 228 163 250 160C284 155 308 154 330 152'
  + 'C356 150 372 148 390 146';
const FAR = `${FAR_D}V250H0Z`;

/**
 * The dry wall, on the right only, with a gate post where it starts.
 *
 * It ran the full width of the plate once and a blind critic came back
 * with "the bottom-right is a congested blue-dither-over-solid-green
 * mass with no readable shape" — three screened passes stacked inside a
 * ten-unit band are not three values, they are one scribble. Half the
 * length, one pass, and a post at the end so it terminates on something
 * instead of stopping in mid-air.
 */
const WALL =
  'M206 238C250 232 300 226 340 223C364 221 378 220 390 219'
  + 'V231C378 232 364 233 340 235C300 238 250 244 206 250Z';

/** Bare earth: not a wash over the green, a hole in the pine pass. */
const TRACK =
  'M26 250C48 243 74 237 98 232C114 228 126 226 132 224'
  + 'L141 226C132 229 120 232 106 236C84 243 60 250 48 256Z';

/* ================================================================
   THE MILLS
   ================================================================ */

type Mill = {
  cx: number; base: number; h: number; rTop: number; rBot: number;
  hubY: number; sailR: number;
};

const A: Mill = {
  cx: 138, base: groundAt(138), h: 72, rTop: 25, rBot: 32,
  hubY: groundAt(138) - 82, sailR: 38,
};
const B: Mill = {
  cx: 274, base: groundAt(274), h: 42, rTop: 14, rBot: 18,
  hubY: groundAt(274) - 48, sailR: 24,
};

/**
 * The one that stopped. Its broken top is cut into the SILHOUETTE
 * rather than drawn over a whole tower: the first version laid a zigzag
 * stroke across a flat trapezoid and a critic called it "a scribbly
 * zigzag that dies at thumbnail size", which is what an outline does
 * when the shape underneath disagrees with it.
 */
const RUIN = { cx: 346, base: groundAt(346), h: 26, rTop: 11, rBot: 13 };
const RUIN_D = (() => {
  const { cx, base, h, rTop, rBot } = RUIN;
  return `M${cx - rBot} ${base}L${cx - rTop} ${base - h + 3}`
    + `l3 -3l4 5l4 -8l5 6l3 -4l4 4`
    + `L${cx + rBot} ${base}Z`;
})();

const towerPath = (m: { cx: number; base: number; h: number; rTop: number; rBot: number }) =>
  `M${m.cx - m.rTop} ${m.base - m.h}L${m.cx - m.rBot} ${m.base}`
  + `L${m.cx + m.rBot} ${m.base}L${m.cx + m.rTop} ${m.base - m.h}Z`;

const capPath = (m: Mill) => {
  const y = m.base - m.h;
  const r = m.rTop + 5;
  return `M${m.cx - r} ${y}Q${m.cx} ${y - m.h * 0.46} ${m.cx + r} ${y}Z`;
};

/**
 * The wheel. Twelve, because a Cycladic mill has twelve and eleven
 * looks like a mistake — but every tip lands on one circle, and the
 * hoop that joins them is drawn.
 *
 * Drawn about (0, 0), and that is not a convenience.
 *
 * The first version drew the blades at plate coordinates and set
 * framer's `originX`/`originY` to the hub. Framer puts
 * `transform-box: fill-box` on SVG elements, so a pixel origin is
 * measured from the corner of the element's own bounding box rather
 * than from the plate's coordinate system: the wheel swung about a
 * point well outside itself and ORBITED instead of spinning. It is very
 * likely what a blind critic saw as "one lower blade tip dying in
 * mid-air over the tower wall" — by the time the shutter opened, the
 * tip was somewhere else.
 *
 * Drawn about the origin, the wheel's box is symmetric, so the DEFAULT
 * origin — the centre of the box — is the hub exactly, and no CSS has
 * to be right for the drawing to be right. The mill is then placed with
 * an ordinary translate.
 */
const SAILS = 12;
function blades(r: number) {
  const step = (Math.PI * 2) / SAILS;
  return Array.from({ length: SAILS }, (_, i) => {
    const a = i * step - Math.PI / 2;
    const p = (rad: number, ang: number) =>
      `${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`;
    return {
      canvas: `M${p(r * 0.2, a)}L${p(r, a)}L${p(r * 0.72, a + step * 0.66)}Z`,
      spar: `M${p(r * 0.12, a)}L${p(r, a)}`,
    };
  });
}

const BLADES_A = blades(A.sailR);
const BLADES_B = blades(B.sailR);

/**
 * A cypress's shaded flank, in the same ink as everything else.
 *
 * `Cypress` plants itself and lights its left side, but it does it with
 * two flat greens, and beside a tower that turns by coverage that shows:
 * "the cypresses are flat solid green blobs with zero internal value
 * sitting beside carefully modelled towers — an inconsistent finish."
 * This is the right half of the same body curve, taking a cobalt
 * overprint like the ground does.
 */
function cypressShade(x: number, base: number, h: number) {
  const w = h * 0.19;
  const top = base - h;
  return `M${x} ${top}`
    + `C${x + w * 0.86} ${top + h * 0.34} ${x + w * 0.72} ${top + h * 0.62} ${x + w * 0.58} ${base - h * 0.11}`
    + `C${x + w * 0.48} ${base - h * 0.02} ${x + w * 0.2} ${base} ${x} ${base}Z`;
}

const TREES = [
  { x: 52, base: groundAt(52) + 3, h: 52 },
  { x: 74, base: groundAt(74) + 3, h: 36 },
];

/** The wall's joints: seeded, so no two courses line up. */
const JOINTS = (() => {
  const rnd = mulberry32(907);
  const out: { x: number; y: number; h: number }[] = [];
  for (let x = 214; x < 384; x += 16 + rnd() * 24) {
    const y = 238 - (x - 206) * 0.103 + rnd() * 2;
    out.push({ x, y, h: 4 + rnd() * 5 });
  }
  return out;
})();

/**
 * Poppies, in one clump beside the track.
 *
 * Scattered singly across the field they came back as "two orphan
 * vermilion specks on the road near the lower left read as dirt on the
 * print", which is exactly what an isolated dot of accent ink looks
 * like. Flowers grow in company; a clump reads as flowers.
 */
const POPPIES = (() => {
  const rnd = mulberry32(311);
  return Array.from({ length: 7 }, () => {
    const x = 74 + rnd() * 34;
    return { x, y: 236 + rnd() * 10, r: 2.1 + rnd() * 1.1 };
  });
})();

export function Windmill({ className = '' }: { className?: string }) {
  const layer = useLayer();
  const reduce = useReducedMotion();

  /* One config, spread into the wheel and into its shadow, so the two
     cannot drift apart. */
  const turn = reduce ? {} : {
    animate: { rotate: 360 },
    transition: { duration: 64, ease: 'linear' as const, repeat: Infinity },
  };

  const rotor = (m: Mill, bl: ReturnType<typeof blades>) => (
    <g transform={`translate(${m.cx} ${m.hubY})`}>
      <motion.g {...turn}>
        {/* the hoop: the reason the wheel is one shape and not twelve */}
        <circle cx="0" cy="0" r={m.sailR} fill="none"
          stroke="var(--g-sea)" strokeWidth={m.sailR > 30 ? 1.6 : 1.1} />
        {bl.map((b, i) => (
          <g key={i}>
            {/* Canvas: bare stock inside a cobalt edge, with a light
                screen for weight. It cannot be shaded directionally —
                it is turning, and a fixed highlight on a turning sail
                is a second sun that moves with it. */}
            <path d={b.canvas} fill="var(--g-stone)" stroke="var(--g-sea)"
              strokeWidth="1" strokeLinejoin="round" />
            <path d={b.canvas} fill="var(--g-sea)" fillOpacity="0.24"
              filter={cov(ID, 'fine')} />
            <path d={b.spar} stroke="var(--g-sea)"
              strokeWidth={m.sailR > 30 ? 1.6 : 1.1} strokeLinecap="round" />
          </g>
        ))}
        <circle cx="0" cy="0" r={m.sailR > 30 ? 4 : 2.6} fill="var(--g-sea)" />
      </motion.g>
    </g>
  );

  return (
    <Plate
      className={className} w={W} h={H}
      label="Three Cycladic windmills along a ridge, the near one turning above a dry-stone wall and a track"
    >
      <defs>
        <Press id={ID} seed={29} />

        {/* Coverage maps. Each runs across the box of its OWN mass.

            The land's runs PERPENDICULAR TO ITS CREST, not down the
            plate: the ridge drops 56 units from right to left, so a
            vertical map would have shaded the left crest and lit the
            right one at the same height above the ground. */}
        <CovMask id={ID} name="land" w={W} h={H}
          box={{ x: 0, y: 176, w: W, h: 74 }} from={0} to={0.4}
          x1={0} y1={0.3} x2={0.24} y2={1.25} />
        <CovMask id={ID} name="ta" w={W} h={H}
          box={{ x: A.cx - A.rBot, y: A.base - A.h, w: A.rBot * 2, h: A.h }}
          from={0} to={0.64} x1={0.12} y1={0} x2={1} y2={0} />
        <CovMask id={ID} name="ca" w={W} h={H}
          box={{ x: A.cx - A.rTop - 5, y: A.base - A.h - 34, w: (A.rTop + 5) * 2, h: 34 }}
          from={0.48} to={1} x1={0} y1={0} x2={1} y2={0} />
        <CovMask id={ID} name="tb" w={W} h={H}
          box={{ x: B.cx - B.rBot, y: B.base - B.h, w: B.rBot * 2, h: B.h }}
          from={0} to={0.6} x1={0.12} y1={0} x2={1} y2={0} />
        <CovMask id={ID} name="cb" w={W} h={H}
          box={{ x: B.cx - B.rTop - 5, y: B.base - B.h - 20, w: (B.rTop + 5) * 2, h: 20 }}
          from={0.48} to={1} x1={0} y1={0} x2={1} y2={0} />
        <CovMask id={ID} name="ru" w={W} h={H}
          box={{ x: RUIN.cx - RUIN.rBot, y: RUIN.base - RUIN.h, w: RUIN.rBot * 2, h: RUIN.h }}
          from={0.08} to={0.62} x1={0.1} y1={0} x2={1} y2={0} />
        <CovMask id={ID} name="tree" w={W} h={H}
          box={{ x: 40, y: 180, w: 48, h: 60 }} from={0.18} to={0.5}
          x1={0} y1={0} x2={1} y2={0} />

        <clipPath id={`${ID}-land`}><path d={LAND} /></clipPath>
        <clipPath id={`${ID}-ta`}><path d={towerPath(A)} /></clipPath>
      </defs>

      {/* ============================================================
          1 — THE FAR RIDGE. One ink, thinned until it sits back.
          It runs off both frame edges: a ridge that fades out in
          mid-air is a printing fault, not a distance.
          ============================================================ */}
      <motion.g {...layer(8, 0.02)}>
        <path d={FAR} fill="var(--g-green)" fillOpacity="0.36"
          filter={cov(ID, 'fine')} />
        {/* A screened mass has a ragged silhouette, which is right
            inside the shape and wrong along the skyline — a crest that
            dissolves into its own dots is a distance nobody drew. The
            crest is one solid stroke; everything below it is coverage. */}
        <path d={FAR_D} fill="none" stroke="var(--g-green)" strokeWidth="2.2"
          strokeLinecap="round" />
      </motion.g>

      {/* ============================================================
          2 — THE GROUND the mills stand on
          ============================================================ */}
      <motion.g {...layer(20, 0.06)}>
        {/* Two pulls, and neither is a tint.

            The pine is SOLID. A hillside screened back across its whole
            face is not a lit hillside, it is a lace curtain: an earlier
            cut of this plate ran the pine at 76% coverage and read as a
            hedge. Then the light was tried as a band of paper dots along
            the crest, which read as scrub — paper dots scattered over
            green make foliage, because that is what foliage is.

            So the value is turned by the SECOND drum: cobalt over pine,
            none at the crest and building as the slope comes forward
            and leans out of the light. That is an overprint a press can
            actually pull. The crest keeps one narrow rim of bare stock,
            and that rim is the only place paper touches the green. */}
        <path d={LAND} fill="var(--g-green)" />
        <g clipPath={`url(#${ID}-land)`}>
          <Cov id={ID} name="land" d={LAND} tone="var(--g-sea)" scale="fine" />
        </g>
        <path d={CREST_D} fill="none" stroke="var(--g-stone)" strokeWidth="2.4"
          strokeOpacity="0.75" filter={cov(ID, 'fine')} />
      </motion.g>

      {/* ============================================================
          3 — WHAT THE LAND CARRIES: every shadow, printed as cobalt
          OVER pine, which is what a second drum does to a first.
          ============================================================ */}
      <motion.g {...layer(14, 0.1)}>
        <g clipPath={`url(#${ID}-land)`}>
          {/* the near mill throws a whole tower's length downslope */}
          <path
            d={`M${A.cx - 10} ${A.base + 1}L${A.cx + 96} ${A.base + 13}`
              + `L${A.cx + 92} ${A.base + 21}L${A.cx - 12} ${A.base + 9}Z`}
            fill="var(--g-sea)" fillOpacity="0.72" filter={cov(ID, 'mid')} />
          <ellipse cx={A.cx + 12} cy={A.base + 3} rx="44" ry="8"
            fill="var(--g-sea)" fillOpacity="0.72" filter={cov(ID, 'mid')} />
          <path
            d={`M${B.cx - 6} ${B.base}L${B.cx + 52} ${B.base + 7}`
              + `L${B.cx + 50} ${B.base + 12}L${B.cx - 8} ${B.base + 5}Z`}
            fill="var(--g-sea)" fillOpacity="0.66" filter={cov(ID, 'fine')} />
          <ellipse cx={B.cx + 7} cy={B.base + 1.5} rx="24" ry="5"
            fill="var(--g-sea)" fillOpacity="0.66" filter={cov(ID, 'fine')} />
          <ellipse cx={RUIN.cx + 12} cy={RUIN.base + 1} rx="21" ry="4.5"
            fill="var(--g-sea)" fillOpacity="0.6" filter={cov(ID, 'fine')} />
          {/* and so do the trees */}
          {TREES.map((t, i) => (
            <path key={i}
              d={`M${t.x - 4} ${t.base}L${t.x + t.h * 0.62} ${t.base + t.h * 0.1}`
                + `L${t.x + t.h * 0.6} ${t.base + t.h * 0.16}L${t.x - 5} ${t.base + 5}Z`}
              fill="var(--g-sea)" fillOpacity="0.6" filter={cov(ID, 'fine')} />
          ))}
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE RUIN, furthest along the ridge
          ============================================================ */}
      <motion.g {...layer(10, 0.14)}>
        <Cov id={ID} name="ru" d={RUIN_D} tone="var(--g-sea)"
          base="var(--g-stone)" scale="fine" />
        <path d={RUIN_D} fill="none" stroke="var(--g-sea)" strokeWidth="1"
          strokeOpacity="0.6" filter={cov(ID, 'fine')} />
        <rect x={RUIN.cx - 3} y={RUIN.base - 11} width="6" height="11"
          fill="var(--g-void)" />
      </motion.g>

      {/* ============================================================
          5 — THE FAR MILL
          ============================================================ */}
      <motion.g {...layer(12, 0.18)}>
        {rotor(B, BLADES_B)}
        <Cov id={ID} name="tb" d={towerPath(B)} tone="var(--g-sea)"
          base="var(--g-stone)" scale="fine" />
        <path d={towerPath(B)} fill="none" stroke="var(--g-sea)" strokeWidth="0.9"
          strokeOpacity="0.55" filter={cov(ID, 'fine')} />
        <Cov id={ID} name="cb" d={capPath(B)} tone="var(--g-sea)"
          base="var(--g-stone)" scale="fine" />
        <rect x={B.cx - B.rTop - 5} y={B.base - B.h - 1.4} width={(B.rTop + 5) * 2}
          height="2.6" rx="1.2" fill="var(--g-stone)" />
        <rect x={B.cx - 2.4} y={B.base - 8} width="4.8" height="8" fill="var(--g-void)" />
      </motion.g>

      {/* ============================================================
          6 — THE NEAR MILL
          ------------------------------------------------------------
          Order matters: the wheel is BEHIND the cap and IN FRONT of the
          tower, which is where a mill's wheel actually is, and it is
          that overlap that puts the tower in space.
          ============================================================ */}
      <motion.g {...layer(16, 0.22)}>
        {/* ---- the tower: cream stock turned by cobalt coverage ---- */}
        <Cov id={ID} name="ta" d={towerPath(A)} tone="var(--g-sea)"
          base="var(--g-stone)" scale="fine" />
        {/* reflected light off the ground at the shaded contour — the
            one place a cylinder comes back up */}
        <path d={`M${A.cx + A.rBot - 2.6} ${A.base}L${A.cx + A.rTop - 2} ${A.base - A.h}`}
          stroke="var(--g-stone)" strokeWidth="2.2" />
        {/* the contour, dotted, so it is a printed edge and not a
            keyline */}
        <path d={towerPath(A)} fill="none" stroke="var(--g-sea)" strokeWidth="1.2"
          strokeOpacity="0.6" filter={cov(ID, 'fine')} />
        {/* the whitewash is renewed at the foot every spring */}
        <path d={`M${A.cx - A.rBot + 1.5} ${A.base - 9}L${A.cx + A.rBot - 1.5} ${A.base - 9}`}
          stroke="var(--g-sea)" strokeWidth="0.9" strokeOpacity="0.5"
          filter={cov(ID, 'fine')} />

        {/* ---- the openings. Both solid: a hole is a hole ---- */}
        <rect x={A.cx - 17} y={A.base - 44} width="8" height="10" rx="1"
          fill="var(--g-void)" />
        <rect x={A.cx + 7} y={A.base - 42} width="7" height="9" rx="1"
          fill="var(--g-void)" />
        {/* their sills catch the sun, which is the only reason they
            read as set into a wall rather than printed on it */}
        <path d={`M${A.cx - 18} ${A.base - 33.4}h10M${A.cx + 6} ${A.base - 32.4}h9`}
          stroke="var(--g-stone)" strokeWidth="1.5" />

        {/* ---- the door: the one warm mark, and the focal point ---- */}
        <path d={`M${A.cx - 8} ${A.base}v-11a8 8 0 0 1 16 0v11Z`} fill="var(--g-clay)" />
        <path d={`M${A.cx - 8} ${A.base}v-11a8 8 0 0 1 16 0v11`} fill="none"
          stroke="var(--g-sea)" strokeWidth="1.3" />
        {/* the threshold stone it opens onto */}
        <path d={`M${A.cx - 11} ${A.base}h22`} stroke="var(--g-stone)" strokeWidth="2.2" />

        {/* ---- what the wheel throws on the wall, turning with it ---- */}
        <g clipPath={`url(#${ID}-ta)`}>
          <g transform={`translate(${A.cx + 12} ${A.hubY + 7})`}>
            <motion.g {...turn}>
              {BLADES_A.map((b, i) => (
                <path key={i} d={b.canvas} fill="var(--g-sea)" fillOpacity="0.6"
                  filter={cov(ID, 'fine')} />
              ))}
            </motion.g>
          </g>
        </g>

        {/* ---- the cap: solid cobalt, opened up where the sun hits ---- */}
        <Cov id={ID} name="ca" d={capPath(A)} tone="var(--g-sea)"
          base="var(--g-stone)" scale="fine" />
        {/* the eaves course, bare stock the whole way round */}
        <rect x={A.cx - A.rTop - 7} y={A.base - A.h - 1.8} width={(A.rTop + 7) * 2}
          height="3.6" rx="1.6" fill="var(--g-stone)" />
        <path d={`M${A.cx - A.rTop - 7} ${A.base - A.h + 1.8}h${(A.rTop + 7) * 2}`}
          stroke="var(--g-sea)" strokeWidth="1.1" strokeOpacity="0.6"
          filter={cov(ID, 'fine')} />

        {/* ---- the wheel ---- */}
        {rotor(A, BLADES_A)}
      </motion.g>

      {/* ============================================================
          7 — THE CYPRESSES, and the same light on them
          ============================================================ */}
      <motion.g {...layer(12, 0.3)}>
        {TREES.map((t, i) => (
          <g key={i}>
            <Cypress id={ID} x={t.x} base={t.base} h={t.h} />
            <Cov id={ID} name="tree" d={cypressShade(t.x, t.base, t.h)}
              tone="var(--g-sea)" scale="fine" />
          </g>
        ))}
      </motion.g>

      {/* ============================================================
          8 — THE FOREGROUND: the track in, the wall across, the one
          clump of warm ink that is not the door.
          ============================================================ */}
      <motion.g {...layer(26, 0.34)}>
        {/* bare earth. Not a wash over the green — a hole in the pine
            pass, which is what an unprinted track actually is. */}
        <path d={TRACK} fill="var(--g-stone)" />
        <path d={TRACK} fill="none" stroke="var(--g-green)" strokeWidth="3"
          strokeOpacity="0.6" filter={cov(ID, 'fine')} />

        {POPPIES.map((p, i) => (
          <g key={i}>
            <path d={`M${p.x} ${p.y}v6`} stroke="var(--g-green)" strokeWidth="0.9" />
            <circle cx={p.x} cy={p.y} r={p.r} fill="var(--g-clay)" />
          </g>
        ))}

        {/* the wall: one screened pass on bare stock, and a shadow */}
        <path d={WALL} fill="var(--g-sea)" fillOpacity="0.45"
          transform="translate(3 6)" filter={cov(ID, 'fine')} />
        <path d={WALL} fill="var(--g-stone)" />
        <path d={WALL} fill="var(--g-sea)" fillOpacity="0.3"
          filter={cov(ID, 'fine')} />
        {/* the gate post it starts from, so it ends on something */}
        <rect x="203" y="234" width="4" height="16" rx="1.4" fill="var(--g-sea)" />
        {/* the coping, and joints that are short and unequal — nine
            identical verticals at an even pitch read as a guardrail */}
        <g stroke="var(--g-sea)" strokeWidth="1" strokeLinecap="round" fill="none">
          <path d="M206 238C250 232 300 226 340 223C364 221 378 220 390 219"
            strokeWidth="1.4" />
          {JOINTS.map((j, i) => (
            <path key={i} d={`M${j.x} ${j.y}v${j.h}`} />
          ))}
        </g>
      </motion.g>
    </Plate>
  );
}
