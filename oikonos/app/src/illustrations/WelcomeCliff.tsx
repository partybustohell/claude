import { motion, useReducedMotion } from 'framer-motion';
import { surface, gentle } from '../lib/motion';

/**
 * WELCOME — a Santorini headland, printed as a four-plate riso.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────
 * The sun is upper-LEFT, about 40° up and 35° left of the view axis.
 * Stated once, obeyed everywhere:
 *   · planes facing up / up-left  → --w-lit     (brightest)
 *   · left return faces           → --w-face
 *   · faces toward the viewer     → --w-cream
 *   · right return faces          → --w-shade
 *   · soffits and undercuts       → --w-shade-deep
 * Every cast shadow runs down-and-right along SUN = (0.62, 0.34).
 * No shadow is drawn on a surface the sun can see.
 *
 * ── ONE PERSPECTIVE ──────────────────────────────────────────
 * Eye level is y = 330 — the church cornice. Every receding edge in
 * the village runs to VP (195, 330) with a constant foreshortening
 * of 0.13. So: volumes ABOVE the eye line show a soffit and no roof
 * (nave, drum, dome); volumes BELOW it show a roof plane whose depth
 * grows with the drop — the annex roof is 2px deep because it nearly
 * touches the horizon, the terrace deck is 18px deep. Faces right of
 * VP show their lit left return, faces left of VP their shaded right
 * return. Nothing is drawn flat-on-top of anything drawn in space.
 *
 * ── LAYERED TERRAIN ──────────────────────────────────────────
 * Four overlapping masses, back to front, each a different value,
 * a different grain frequency and a different edge character:
 *   E  far hazy ridge  — fine grain, soft bumps, coolest green
 *   A  main headland   — mid grain, knuckled crest, laps the village feet
 *   C  near spur       — coarse grain, broken rock edge
 *   D  foreground toe  — coarsest grain, darkest, cool shadow green
 *
 * ── GRAIN DESCRIBES FORM ─────────────────────────────────────
 * There is no global noise layer. Every plate carries its own tooth
 * at its own baseFrequency (far 1.30 → near 0.34), and the stipple
 * is *graded*: three coverage tiers (dense / mid / sparse) each
 * masked by its own gradient, so dot density thins toward the light
 * and packs into the turn away from it. The dome is built this way —
 * cream dots crowd the lit upper-left crown and vanish by the
 * meridian; ink dots crowd the shadow limb and vanish at the crown.
 *
 * Plate is 390 × 646, bottom-anchored: plate y = screen y − 198.
 */

const H = 646;

/* ---- one perspective ------------------------------------------------ */
const VPX = 195;
const VPY = 330;
const F = 0.13;
const rx = (x: number) => x + (VPX - x) * F;
const ry = (y: number) => y + (VPY - y) * F;

/* ---- one light ------------------------------------------------------ */
const SX = 0.62;
const SY = 0.34;

/* ---- terrain silhouettes, back to front ----------------------------- */

/** E — the far ridge beyond the church. Soft, hazy, low contrast. */
const E_CREST =
  'M390 314 L372 308 L356 320 L342 317 L328 326 L314 334 L300 342'
  + ' L288 351 L278 364 L270 380 L264 400 L260 426 L258 646 L390 646 Z';

/** A — the main headland. Knuckled crest, one pinnacle, a long plunge. */
const A_LINE =
  'M390 372 L380 368 L372 374 L362 370 L352 378 L342 382 L332 376'
  + ' L322 384 L312 380 L302 386 L292 382 L282 388 L272 385 L262 391'
  + ' L252 397 L242 392 L234 404 L226 414 L218 426 L211 440 L205 456'
  + ' L200 474 L196 494 L192 518 L188 546 L185 578 L182 610 L181 646';
const A_CREST = `${A_LINE} L390 646 Z`;

/** C — the near spur. It breaks out of A's plunge face at x≈214 and
 *  rakes away to the left; angular, not domed. */
const C_LINE =
  'M254 646 L247 566 L238 524 L228 502 L214 490 L198 485 L184 489'
  + ' L170 497 L157 509 L146 525 L137 545 L130 568 L125 592 L122 616 L121 646';
const C_CREST = `${C_LINE} Z`;

/** D — the foreground toe. Coarsest, darkest, coolest. One notch in the
 *  crest, one hard break, then a straight steep plunge to the frame. */
const D_LINE =
  'M190 646 L183 592 L172 558 L160 534 L148 518 L138 512 L130 517'
  + ' L120 506 L108 498 L96 497 L86 504 L78 518 L71 538 L65 562'
  + ' L61 588 L59 612 L58 646';
const D_CREST = `${D_LINE} Z`;

/* ---- the village ---------------------------------------------------- */
const NAVE = { x: 252, y: 326, w: 100, h: 76 };
const WING = { x: 352, y: 347, w: 34, h: 55 };
const ANNEX = { x: 206, y: 351, w: 46, h: 105 };
const TER1 = { x: 152, y: 470, w: 46, h: 130 };
const TER2 = { x: 126, y: 498, w: 30, h: 102 };

const DCX = 302;
const DR = 42;
const DBASE = 286;
const DAPEX = DBASE - DR;

type Box = { x: number; y: number; w: number; h: number };

/* ====================================================================
   Primitives
   ==================================================================== */

/**
 * A whitewashed volume in the one perspective. The horizontal plane is
 * a roof if the volume sits below the eye line and a soffit if it sits
 * above it; the visible return is the lit left face when the volume is
 * right of the vanishing point and the shaded right face when it is left.
 */
function Volume({ b, over = 3, cap = 6 }: { b: Box; over?: number; cap?: number }) {
  const { x, y, w, h } = b;
  const r = x + w;
  const bt = y + h;
  const showsLeftReturn = x + w / 2 > VPX;
  const roofVisible = y > VPY;

  return (
    <>
      {roofVisible && (
        <polygon
          points={`${x},${y} ${r},${y} ${rx(r)},${ry(y)} ${rx(x)},${ry(y)}`}
          fill="var(--w-lit)"
        />
      )}
      {showsLeftReturn ? (
        <polygon
          points={`${x},${y} ${rx(x)},${ry(y)} ${rx(x)},${ry(bt)} ${x},${bt}`}
          fill="var(--w-face)"
        />
      ) : (
        <polygon
          points={`${r},${y} ${rx(r)},${ry(y)} ${rx(r)},${ry(bt)} ${r},${bt}`}
          fill="var(--w-shade)"
        />
      )}
      <rect x={x} y={y} width={w} height={h} fill="var(--w-cream)" />
      {/* projecting cornice: its top plane takes the sun, its overhang
          throws a hard band of shade down onto the wall right below */}
      <rect x={x - over} y={y - cap} width={w + over * 2} height={cap} fill="var(--w-lit)" />
      <rect x={x - over} y={y - 1.6} width={w + over * 2} height={1.6} fill="var(--w-shade)" />
      <rect x={x} y={y} width={w} height={3.2} fill="var(--w-shade-deep)" />
    </>
  );
}

/** A recessed arched opening. Sun rakes in from the left, so the right
 *  inner jamb catches light and the head throws shade across the top. */
function Arch({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const rr = w / 2;
  const d = `M${x} ${y + h} V${y + rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h} Z`;
  return (
    <g>
      <path d={d} fill="var(--w-open)" />
      {/* lit right jamb — the only surface inside the reveal the sun sees */}
      <path
        d={`M${x + w - 1.5} ${y + h} V${y + rr} A${rr - 1.5} ${rr - 1.5} 0 0 0 ${x + w - 1.5} ${y + rr} Z`}
        fill="var(--w-shade)"
        opacity="0.55"
      />
      <rect x={x + w - 1.6} y={y + rr} width={1.6} height={h - rr} fill="var(--w-shade)" opacity="0.7" />
      {/* sill, and the shade it drops */}
      <rect x={x - 1.4} y={y + h} width={w + 2.8} height={2.2} fill="var(--w-lit)" />
      <polygon
        points={`${x + w + 1.4},${y + h + 2.2} ${x + w + 4.4},${y + h + 4} ${x - 1.4 + 3},${y + h + 4} ${x - 1.4},${y + h + 2.2}`}
        fill="var(--w-shade)"
        opacity="0.8"
      />
    </g>
  );
}

/** A square-headed window — same light logic, smaller reveal. */
function Slot({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--w-open)" />
      <rect x={x + w - 1.3} y={y} width={1.3} height={h} fill="var(--w-shade)" opacity="0.6" />
      <rect x={x - 1} y={y + h} width={w + 2} height={1.8} fill="var(--w-lit)" />
    </g>
  );
}

/** Ground shadow thrown by a volume of height `h` standing on the land. */
function CastShadow({ x0, x1, y, h, opacity = 1 }:
{ x0: number; x1: number; y: number; h: number; opacity?: number }) {
  const dx = h * SX;
  const dy = h * SY;
  return (
    <polygon
      points={`${x0},${y} ${x1},${y} ${x1 + dx},${y + dy} ${x0 + dx * 0.72},${y + dy}`}
      fill="var(--w-shadow)"
      opacity={opacity}
    />
  );
}

/* ====================================================================
   Grain — one plate at a time
   ==================================================================== */

/** Per-material ink tooth. Frequency is the material, not the image. */
function Tooth({ id, bf, amt, seed }:
{ id: string; bf: number; amt: number; seed: number }) {
  return (
    <filter id={id} x="0" y="0" width={390} height={H} filterUnits="userSpaceOnUse">
      <feTurbulence
        type="fractalNoise" baseFrequency={bf} numOctaves="3"
        seed={seed} stitchTiles="stitch" result="n"
      />
      <feColorMatrix
        in="n" type="matrix" result="na"
        values={`0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 ${amt} ${amt * 0.42} 0 0 ${-amt * 0.30}`}
      />
      <feComposite in="na" in2="SourceAlpha" operator="in" result="g" />
      <feBlend in="SourceGraphic" in2="g" mode="multiply" />
    </filter>
  );
}

/**
 * A stipple plate. `table` sets coverage (how many dots), `bf` sets dot
 * size. Three coverage tiers under three gradient masks give real
 * density grading rather than a uniform veil.
 */
function Stip({ id, bf, table, seed }:
{ id: string; bf: number; table: string; seed: number }) {
  return (
    <filter id={id} x="0" y="0" width={390} height={H} filterUnits="userSpaceOnUse">
      <feTurbulence
        type="fractalNoise" baseFrequency={bf} numOctaves="1"
        seed={seed} stitchTiles="stitch" result="n"
      />
      <feComponentTransfer in="n" result="t">
        <feFuncA type="discrete" tableValues={table} />
      </feComponentTransfer>
      <feComposite in="SourceGraphic" in2="t" operator="in" />
    </filter>
  );
}

const DENSE = '0 1';
const MID = '0 0 1';
const SPARSE = '0 0 0 0 1';

/* ==================================================================== */

export function WelcomeCliff({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();

  const layer = (y: number, delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { ...surface, delay },
  });

  /* dome meridians — every one starts at the apex, every one lands on
     the base line, so they converge exactly and mirror exactly */
  const meridians = [-0.88, -0.6, -0.3, 0, 0.3, 0.6, 0.88].map((s) => {
    if (s === 0) return `M${DCX} ${DAPEX} V${DBASE}`;
    const a = Math.abs(s) * DR;
    return `M${DCX} ${DAPEX} A${a.toFixed(2)} ${DR} 0 0 ${s > 0 ? 1 : 0} ${(DCX + s * DR).toFixed(2)} ${DBASE}`;
  });

  /* latitude rings, seen from below the springing so they bow downward */
  const latitudes = [0.34, 0.62, 0.85].map((c) => {
    const a = DR * c;
    const yy = DBASE - DR * Math.sqrt(Math.max(0, 1 - c * c));
    return `M${(DCX - a).toFixed(2)} ${yy.toFixed(2)} A${a.toFixed(2)} ${(a * 0.3).toFixed(2)} 0 0 0 ${(DCX + a).toFixed(2)} ${yy.toFixed(2)}`;
  });

  /* the stair: nine treads climbing the plunge face from the terrace
     deck to the annex door, with a thickened cheek wall on the sunward
     side and a bottom tread that lands on the deck, not in the air */
  const STEPS = 9;
  const S0 = { x: 196, y: 466 };
  const GO = 5.4;
  const RISE = 7.0;
  const treads: string[] = [];
  const risers: string[] = [];
  for (let i = 0; i < STEPS; i++) {
    const x = S0.x + i * GO;
    const y = S0.y - i * RISE;
    treads.push(`M${x} ${y} h${GO} l${-GO * 0.34} ${-2.6} h${-GO} Z`);
    risers.push(`M${x + GO} ${y} v${-RISE + 2.6} l${-GO * 0.34} ${-2.6} v${RISE - 2.6} Z`);
  }
  const stairTop = { x: S0.x + STEPS * GO, y: S0.y - STEPS * RISE };

  return (
    <svg
      className={className}
      viewBox={`0 0 390 ${H}`}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="A whitewashed cliff-top village with a blue-domed church above the Aegean"
    >
      <defs>
        {/* material tooth — far material is finer than near material */}
        <Tooth id="wc-t-far" bf={1.3} amt={0.5} seed={21} />
        <Tooth id="wc-t-mid" bf={0.72} amt={0.72} seed={7} />
        <Tooth id="wc-t-near" bf={0.46} amt={0.86} seed={13} />
        <Tooth id="wc-t-close" bf={0.34} amt={0.98} seed={31} />
        <Tooth id="wc-t-lime" bf={1.55} amt={0.3} seed={5} />

        {/* stipple plates — same dot size, three coverages */}
        <Stip id="wc-s-rock-d" bf={0.5} table={DENSE} seed={3} />
        <Stip id="wc-s-rock-m" bf={0.5} table={MID} seed={3} />
        <Stip id="wc-s-rock-s" bf={0.5} table={SPARSE} seed={3} />
        <Stip id="wc-s-fine-d" bf={0.56} table={DENSE} seed={9} />
        <Stip id="wc-s-fine-m" bf={0.56} table={MID} seed={9} />
        <Stip id="wc-s-fine-s" bf={0.56} table={SPARSE} seed={9} />
        <Stip id="wc-s-lime" bf={1.25} table={SPARSE} seed={17} />

        {/* ---- density gradients ---- */}
        {/* dome: light gathers upper-left of the crown */}
        <radialGradient id="wc-g-crown" gradientUnits="userSpaceOnUse"
          cx={DCX - DR * 0.44} cy={DBASE - DR * 0.74} r={DR * 0.82}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <radialGradient id="wc-g-crown-wide" gradientUnits="userSpaceOnUse"
          cx={DCX - DR * 0.44} cy={DBASE - DR * 0.74} r={DR * 1.3}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        {/* dome: the turn away from the sun, lower-right limb */}
        <radialGradient id="wc-g-limb" gradientUnits="userSpaceOnUse"
          cx={DCX - DR * 0.44} cy={DBASE - DR * 0.74} r={DR * 1.5}>
          <stop offset="0.18" stopColor="#000" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <radialGradient id="wc-g-limb-tight" gradientUnits="userSpaceOnUse"
          cx={DCX - DR * 0.44} cy={DBASE - DR * 0.74} r={DR * 1.5}>
          <stop offset="0.5" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>

        {/* land: light comes down the slope from the upper left */}
        <linearGradient id="wc-g-sun" gradientUnits="userSpaceOnUse"
          x1="140" y1="330" x2="330" y2="600">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="0.8" stopColor="#000" />
        </linearGradient>
        <linearGradient id="wc-g-away" gradientUnits="userSpaceOnUse"
          x1="150" y1="340" x2="330" y2="640">
          <stop offset="0.12" stopColor="#000" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="wc-g-down" gradientUnits="userSpaceOnUse"
          x1="0" y1="440" x2="0" y2={H}>
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        {/* whitewash: dirt gathers at the foot of a wall */}
        <linearGradient id="wc-g-foot" gradientUnits="userSpaceOnUse"
          x1="0" y1="330" x2="0" y2="470">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>

        <mask id="wc-m-crown"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-crown)" /></mask>
        <mask id="wc-m-crown-wide"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-crown-wide)" /></mask>
        <mask id="wc-m-limb"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-limb)" /></mask>
        <mask id="wc-m-limb-tight"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-limb-tight)" /></mask>
        <mask id="wc-m-sun"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-sun)" /></mask>
        <mask id="wc-m-away"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-away)" /></mask>
        <mask id="wc-m-down"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-down)" /></mask>
        <mask id="wc-m-foot"><rect x="0" y="0" width="390" height={H} fill="url(#wc-g-foot)" /></mask>

        <clipPath id="wc-clip-e"><path d={E_CREST} /></clipPath>
        <clipPath id="wc-clip-a"><path d={A_CREST} /></clipPath>
        <clipPath id="wc-clip-c"><path d={C_CREST} /></clipPath>
        <clipPath id="wc-clip-d"><path d={D_CREST} /></clipPath>
        <clipPath id="wc-clip-dome"><path d={`M${DCX - DR} ${DBASE} a${DR} ${DR} 0 0 1 ${DR * 2} 0 Z`} /></clipPath>
        <clipPath id="wc-clip-nave"><rect x={NAVE.x} y={NAVE.y} width={NAVE.w} height={NAVE.h} /></clipPath>
        <clipPath id="wc-clip-annex"><rect x={ANNEX.x} y={ANNEX.y} width={ANNEX.w} height={ANNEX.h} /></clipPath>
        <clipPath id="wc-clip-ter"><rect x={TER1.x} y={TER1.y} width={TER1.w} height={TER1.h} /></clipPath>
      </defs>

      {/* ============================================================
          1 — E: the far ridge. Finest grain, softest edge, coolest.
          ============================================================ */}
      <motion.g {...layer(20, 0.06)} filter="url(#wc-t-far)">
        <path d={E_CREST} fill="var(--w-far)" />
        <g clipPath="url(#wc-clip-e)">
          {/* its own lit crown, and a soft fold turning away below it */}
          <path
            d="M390 322 L376 316 L360 328 L348 330 L336 336 L322 342 L308 349 L296 357 L286 369 L278 385
               L286 391 L298 372 L312 361 L328 353 L344 344 L360 338 L378 328 L390 334 Z"
            fill="var(--w-far-lit)" opacity="0.85"
          />
          <rect x="0" y="0" width="390" height={H} fill="var(--w-far-lit)"
            filter="url(#wc-s-fine-s)" mask="url(#wc-m-sun)" opacity="0.5" />
        </g>
        {/* soft scrub straddling the far crest — no hard clip, it breaks
            the silhouette the way distant maquis does */}
        <g fill="var(--w-far)">
          <ellipse cx="356" cy="329" rx="7" ry="3.2" />
          <ellipse cx="330" cy="339" rx="5.5" ry="2.6" />
          <ellipse cx="300" cy="353" rx="6.2" ry="2.8" />
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE VILLAGE (drawn before the near land, which laps it)
          ============================================================ */}
      <motion.g {...layer(16, 0.3)}>
        {/* ---- lower terraces, stepping down and toward the viewer ---- */}
        <g filter="url(#wc-t-lime)">
          <Volume b={TER1} cap={4} over={2.5} />
          <Volume b={TER2} cap={4} over={2.5} />
          {/* grain gathers at the foot of the whitewash, never on the crown */}
          <g clipPath="url(#wc-clip-ter)">
            <rect x="0" y="0" width="390" height={H} fill="var(--w-shade)"
              filter="url(#wc-s-lime)" mask="url(#wc-m-down)" opacity="0.85" />
          </g>
          <Slot x={165} y={484} w={7} h={9} />
          <Slot x={133} y={512} w={6} h={8} />
        </g>

        {/* ---- the annex: a tall retaining wall cut into the slope ---- */}
        <g filter="url(#wc-t-lime)">
          <Volume b={ANNEX} cap={5} over={3} />
          <g clipPath="url(#wc-clip-annex)">
            <rect x="0" y="0" width="390" height={H} fill="var(--w-shade)"
              filter="url(#wc-s-lime)" mask="url(#wc-m-foot)" opacity="0.9" />
          </g>
          <Arch x={214} y={372} w={13} h={22} />
          <Slot x={236} y={374} w={8} h={11} />
        </g>

        {/* ---- the church: nave, right wing ---- */}
        <g filter="url(#wc-t-lime)">
          <Volume b={WING} cap={5} over={3} />
          <Volume b={NAVE} cap={6} over={3} />
          <g clipPath="url(#wc-clip-nave)">
            <rect x="0" y="0" width="390" height={H} fill="var(--w-shade)"
              filter="url(#wc-s-lime)" mask="url(#wc-m-foot)" opacity="0.75" />
          </g>
          {/* the arcade — three bays, all inside the frame, each with its
              own reveal and sill; the far bay is narrower because the wall
              returns, not because the arches are clones */}
          <Arch x={262} y={344} w={19} h={34} />
          <Arch x={292} y={341} w={21} h={37} />
          <Arch x={324} y={345} w={17} h={32} />
          <Slot x={360} y={362} w={9} h={13} />
          {/* string course: one line, and the shade it drops */}
          <rect x={252} y={336} width={100} height={1.6} fill="var(--w-shade-deep)" opacity="0.6" />
        </g>

        {/* ---- drum + its cornice: one slab, centred on the drum ---- */}
        <g filter="url(#wc-t-lime)">
          <polygon
            points={`266,293 338,293 ${rx(338)},${ry(293)} ${rx(266)},${ry(293)}`}
            fill="var(--w-face)"
          />
          <rect x={266} y={293} width={72} height={27} fill="var(--w-cream)" />
          <polygon
            points={`266,293 ${rx(266)},${ry(293)} ${rx(266)},${ry(320)} 266,320`}
            fill="var(--w-face)"
          />
          <rect x={258} y={286} width={88} height={7} fill="var(--w-lit)" />
          <rect x={266} y={293} width={72} height={3} fill="var(--w-shade-deep)" />
          <rect x={298} y={300} width={8} height={14} rx="4" fill="var(--w-open)" />
          <rect x={304.7} y={300} width={1.3} height={14} fill="var(--w-shade)" opacity="0.6" />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE DOME. Flat plate, no gradient, no specular. All the
              modelling is stipple density.
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.52 }}
        style={{ transformOrigin: `${DCX}px ${DBASE}px` }}
      >
        {/* one path carries both the fill and the rim, so they cannot
            misregister; a second copy of the SAME path multiplies it down
            to a value that keeps its silhouette against the sky, and the
            shadow-side halftone multiplies again in the turn away */}
        <g style={{ isolation: 'isolate' }}>
          <path
            d={`M${DCX - DR} ${DBASE} a${DR} ${DR} 0 0 1 ${DR * 2} 0 Z`}
            fill="var(--w-open)"
          />
          <path
            d={`M${DCX - DR} ${DBASE} a${DR} ${DR} 0 0 1 ${DR * 2} 0 Z`}
            fill="var(--w-open)" opacity="0.66"
            style={{ mixBlendMode: 'multiply' }}
          />

          <g clipPath="url(#wc-clip-dome)">
            {/* ink halftone: crowds the turn away from the sun */}
            <rect x="0" y="0" width="390" height={H} fill="var(--w-open)"
              filter="url(#wc-s-fine-d)" mask="url(#wc-m-limb-tight)"
              style={{ mixBlendMode: 'multiply' }} />
            <rect x="0" y="0" width="390" height={H} fill="var(--w-open)"
              filter="url(#wc-s-fine-m)" mask="url(#wc-m-limb)" opacity="0.7"
              style={{ mixBlendMode: 'multiply' }} />
            {/* cream halftone: crowds the lit crown, gone by the meridian */}
            <rect x="0" y="0" width="390" height={H} fill="var(--w-lit)"
              filter="url(#wc-s-fine-d)" mask="url(#wc-m-crown)" opacity="0.95" />
            <rect x="0" y="0" width="390" height={H} fill="var(--w-lit)"
              filter="url(#wc-s-fine-m)" mask="url(#wc-m-crown-wide)" opacity="0.68" />

            {/* meridians: all seven start at the apex, all land on the base */}
            <g stroke="var(--w-lit)" fill="none" strokeWidth="1" opacity="0.34">
              {meridians.map((d, i) => <path key={i} d={d} />)}
            </g>
            <g stroke="var(--w-lit)" fill="none" strokeWidth="0.9" opacity="0.2">
              {latitudes.map((d, i) => <path key={i} d={d} />)}
            </g>
          </g>
        </g>

        {/* rim: drawn from the identical path, so it sits exactly on the
            fill edge — thicker where the sun catches it, thinner in the
            turn away */}
        <path
          d={`M${DCX - DR} ${DBASE} a${DR} ${DR} 0 0 1 ${DR * 2} 0`}
          fill="none" stroke="var(--w-lit)" strokeWidth="1.5" opacity="0.55"
        />
        <path
          d={`M${DCX - DR} ${DBASE} a${DR} ${DR} 0 0 1 ${DR * 1.1} ${-DR * 0.62}`}
          fill="none" stroke="var(--w-lit)" strokeWidth="2.4" strokeLinecap="round"
        />

        {/* finial: the crossbar is centred on the stem, the stem on the apex */}
        <g fill="var(--w-lit)">
          <circle cx={DCX} cy={240} r="3.4" />
          <rect x={DCX - 1.4} y={216} width="2.8" height="24" />
          <rect x={DCX - 7} y={222} width="14" height="2.6" />
        </g>
        <g fill="var(--w-shade)" opacity="0.5">
          <rect x={DCX + 0.6} y={216} width="0.8" height="24" />
          <rect x={DCX - 7} y={224} width="14" height="0.6" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — A: the main headland. Drawn OVER the village so the land
              laps every foot; nothing sits on a cut line.
          ============================================================ */}
      <motion.g {...layer(26, 0.16)}>
        <g filter="url(#wc-t-mid)">
          <path d={A_CREST} fill="var(--w-green)" />
          <g clipPath="url(#wc-clip-a)">
            {/* the lit plane: a band under the crest, wide where the slope
                turns to face the sun, pinched to nothing on the knuckles
                that face right */}
            <path
              d={`${A_LINE} L188 630 L196 600 L202 566 L208 530 L214 498 L221 470 L229 448
                  L238 430 L248 414 L258 402 L272 396 L286 397 L300 393 L316 390 L330 385
                  L346 386 L362 379 L378 376 L390 380 L390 372 Z`}
              fill="var(--w-green-lit)" opacity="0.9"
            />
            {/* gullies: narrow wedges down the fall line. Each has a hard
                ridge on its sunward (left) side and shade only on the
                flank the sun cannot see. */}
            {[
              { a: 338, b: 381, c: 378, d: 486, w0: 5, w1: 15, o: 0.5 },
              { a: 300, b: 387, c: 346, d: 512, w0: 5, w1: 17, o: 0.42 },
              { a: 260, b: 393, c: 308, d: 538, w0: 5, w1: 16, o: 0.36 },
              { a: 224, b: 417, c: 272, d: 566, w0: 4, w1: 14, o: 0.3 },
            ].map((g, i) => (
              <g key={i}>
                <path
                  d={`M${g.a} ${g.b} L${g.a + g.w0} ${g.b} L${g.c + g.w1} ${g.d} L${g.c} ${g.d + 6} Z`}
                  fill="var(--w-shadow)" opacity={g.o}
                />
                <path
                  d={`M${g.a} ${g.b} L${g.c} ${g.d + 6}`}
                  stroke="var(--w-green-lit)" strokeWidth="1.4" fill="none" opacity="0.4"
                />
              </g>
            ))}
            {/* strata: two ledges cutting across the plunge, so the face
                has incident instead of being one smooth ramp */}
            <path d="M186 470 L214 456 L246 448 L244 454 L214 463 L188 477 Z"
              fill="var(--w-green-lit)" opacity="0.34" />
            <path d="M182 528 L206 508 L232 496 L231 503 L207 516 L184 535 Z"
              fill="var(--w-shadow)" opacity="0.3" />
            {/* graded stipple: sunward dots thin down the slope, shadow
                dots pack into the folds and the foot */}
            <rect x="0" y="0" width="390" height={H} fill="var(--w-green-lit)"
              filter="url(#wc-s-rock-m)" mask="url(#wc-m-sun)" opacity="0.75" />
            <rect x="0" y="0" width="390" height={H} fill="var(--w-green-lit)"
              filter="url(#wc-s-rock-s)" mask="url(#wc-m-crown-wide)" opacity="0.5" />
            <rect x="0" y="0" width="390" height={H} fill="var(--w-shadow)"
              filter="url(#wc-s-rock-d)" mask="url(#wc-m-away)" opacity="0.7" />
          </g>
          {/* crest rim: three strokes at three weights, absent on the
              knuckles that turn away from the sun */}
          <path d="M390 372 L380 368 L372 374 L362 370 L352 378 L342 382"
            fill="none" stroke="var(--w-green-lit)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M332 376 L322 384 L312 380 L302 386 L292 382 L282 388 L272 385 L262 391 L252 397"
            fill="none" stroke="var(--w-green-lit)" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          <path d="M242 392 L234 404 L226 414 L218 426 L211 440 L205 456 L200 474 L196 494 L192 518 L188 546"
            fill="none" stroke="var(--w-green-lit)" strokeWidth="4.2" strokeLinecap="round" opacity="0.9" />
          {/* scrub sitting astride the crest, breaking the line */}
          <g fill="var(--w-shadow)">
            <ellipse cx="336" cy="378" rx="4.2" ry="2.2" />
            <ellipse cx="329" cy="379" rx="2.6" ry="1.5" />
            <ellipse cx="296" cy="384" rx="3.4" ry="1.9" />
            <ellipse cx="256" cy="394" rx="3.8" ry="2" />
            <ellipse cx="249" cy="397" rx="2.4" ry="1.4" />
            <ellipse cx="228" cy="411" rx="3.2" ry="1.8" transform="rotate(-38 228 411)" />
            <ellipse cx="203" cy="460" rx="3" ry="1.7" transform="rotate(-70 203 460)" />
            <ellipse cx="192" cy="512" rx="2.8" ry="1.6" transform="rotate(-78 192 512)" />
          </g>
        </g>

        {/* cast shadows onto the land — all down-and-right, all clipped
            to the mass they fall on */}
        <g clipPath="url(#wc-clip-a)">
          <CastShadow x0={352} x1={386} y={374} h={54} opacity={0.62} />
          <CastShadow x0={252} x1={352} y={382} h={36} opacity={0.4} />
          <CastShadow x0={206} x1={252} y={400} h={42} opacity={0.5} />
        </g>
      </motion.g>

      {/* ============================================================
          5 — the stair, the cypress, the parapet
          ============================================================ */}
      <motion.g {...layer(12, 0.44)} filter="url(#wc-t-lime)">
        {/* the cheek wall — the stair has thickness on its sunward side */}
        <polygon
          points={`${S0.x - 5},${S0.y + 5} ${S0.x},${S0.y + 5} ${stairTop.x},${stairTop.y}
                   ${stairTop.x - 5},${stairTop.y}`}
          fill="var(--w-face)"
        />
        <polygon
          points={`${S0.x - 5},${S0.y + 5} ${S0.x - 5},${S0.y + 11} ${stairTop.x - 5},${stairTop.y + 6}
                   ${stairTop.x - 5},${stairTop.y}`}
          fill="var(--w-cream)"
        />
        <g fill="var(--w-lit)">{treads.map((d, i) => <path key={i} d={d} />)}</g>
        <g fill="var(--w-cream)">{risers.map((d, i) => <path key={i} d={d} />)}</g>
        {/* the run drops its own shade to the right, onto the rock */}
        <polygon
          points={`${stairTop.x},${stairTop.y} ${stairTop.x + 9},${stairTop.y + 5}
                   ${S0.x + 9},${S0.y + 10} ${S0.x},${S0.y + 5}`}
          fill="var(--w-shadow)" opacity="0.42"
        />

        {/* --- the cypress: two values, an uneven silhouette, planted on
                the deck behind the parapet, and a shadow that breaks over
                the deck edge and runs down the wall it shades --- */}
        <path
          d="M172 464 L172 400"
          stroke="var(--w-cyp)" strokeWidth="3" />
        <path
          d="M173.6 372c5.6 12 8.4 25 9.2 38 .6 10-.4 19-2.4 26-1.4 5-3.4 9-5.6 11-1 1-2.6 1-3.6 0
             -2.6-2.6-4.8-8-6-15-1.8-10-2-22-.8-34 1.2-12 4-23 9.2-26Z"
          fill="var(--w-cyp)"
        />
        {/* the lit flank — a real value break down the sunward side */}
        <path
          d="M173.6 372c-4 8-6.6 19-7.8 31-1.2 12-1 24 .8 34-2.8-10-3.8-24-2.8-37 1-13 4-23 9.8-28Z"
          fill="var(--w-cyp-lit)"
        />
        {/* a second, smaller cypress behind — depth, not a lollipop pair */}
        <path
          d="M158 402c3.4 8 5 17 5.4 25 .4 7-.2 13-1.4 17-.8 3-2 5-3.4 6-.6.6-1.6.6-2.2 0
             -1.6-1.6-3-5-3.6-9-1.2-6-1.4-14-.6-21 .8-8 2.6-15 5.8-18Z"
          fill="var(--w-cyp-far)"
        />
        {/* its shadow: a wedge across the deck, then down the wall face */}
        <polygon points="172,464 183,470 196,470 178,462" fill="var(--w-shade-deep)" opacity="0.6" />
        <g clipPath="url(#wc-clip-ter)">
          <polygon points="178,470 196,470 196,520 186,504" fill="var(--w-shade)" opacity="0.9" />
          <polygon points="182,470 196,470 196,498 188,489" fill="var(--w-shade-deep)" opacity="0.5" />
        </g>

        {/* parapet on the deck edge — the tree's foot goes behind it */}
        <rect x={TER1.x} y={462} width={TER1.w} height={8} fill="var(--w-cream)" />
        <rect x={TER1.x} y={462} width={TER1.w} height={2} fill="var(--w-lit)" />
        <rect x={TER1.x} y={468} width={TER1.w} height={2} fill="var(--w-shade)" opacity="0.55" />
      </motion.g>

      {/* ============================================================
          6 — C: the near spur. Coarser grain, a harder broken edge.
          ============================================================ */}
      <motion.g {...layer(30, 0.24)} filter="url(#wc-t-near)">
        <path d={C_CREST} fill="var(--w-green-deep)" />
        <g clipPath="url(#wc-clip-c)">
          {/* a narrow lit shelf under the crest, pinched where the rake
              turns away — not an outline of the whole lobe */}
          <path
            d="M214 490 L198 485 L184 489 L170 497 L157 509 L146 525 L137 545 L130 568
               L136 574 L145 553 L155 534 L167 519 L181 507 L196 500 L212 502 Z"
            fill="var(--w-green)" opacity="0.7"
          />
          {/* two folds, dark only on the flank turned from the sun */}
          <path d="M196 492 L201 493 L226 566 L216 570 Z" fill="var(--w-shadow)" opacity="0.42" />
          <path d="M158 512 L162 514 L184 590 L175 594 Z" fill="var(--w-shadow)" opacity="0.34" />
          <rect x="0" y="0" width="390" height={H} fill="var(--w-green)"
            filter="url(#wc-s-rock-m)" mask="url(#wc-m-sun)" opacity="0.55" />
          <rect x="0" y="0" width="390" height={H} fill="var(--w-shadow)"
            filter="url(#wc-s-rock-d)" mask="url(#wc-m-down)" opacity="0.55" />
        </g>
        {/* rim only where the rock turns up-left */}
        <path d="M214 490 L198 485 L184 489 L170 497 L157 509 L146 525 L137 545 L130 568 L125 592"
          fill="none" stroke="var(--w-green)" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
        <g fill="var(--w-shadow)">
          <ellipse cx="192" cy="486" rx="3.6" ry="1.9" />
          <ellipse cx="150" cy="518" rx="3" ry="1.7" transform="rotate(-42 150 518)" />
        </g>
        {/* the terraces drop their shade onto this spur */}
        <g clipPath="url(#wc-clip-c)">
          <CastShadow x0={152} x1={198} y={500} h={30} opacity={0.5} />
          <CastShadow x0={126} x1={152} y={534} h={26} opacity={0.45} />
        </g>
      </motion.g>

      {/* ============================================================
          7 — D: the foreground toe. Coarsest grain, darkest value.
          ============================================================ */}
      <motion.g {...layer(34, 0.3)} filter="url(#wc-t-close)">
        <path d={D_CREST} fill="var(--w-green-toe)" />
        <g clipPath="url(#wc-clip-d)">
          <path
            d="M130 517 L120 506 L108 498 L96 497 L86 504 L78 518 L71 538 L65 562
               L72 566 L78 543 L86 526 L97 514 L109 510 L122 518 L129 526 Z"
            fill="var(--w-green-deep)" opacity="0.75"
          />
          <path d="M112 502 L117 505 L142 590 L132 594 Z" fill="var(--w-shadow)" opacity="0.4" />
          <path d="M84 510 L88 513 L104 610 L95 612 Z" fill="var(--w-shadow)" opacity="0.3" />
          <rect x="0" y="0" width="390" height={H} fill="var(--w-green-deep)"
            filter="url(#wc-s-rock-m)" mask="url(#wc-m-sun)" opacity="0.5" />
          <rect x="0" y="0" width="390" height={H} fill="var(--w-shadow)"
            filter="url(#wc-s-rock-d)" mask="url(#wc-m-down)" opacity="0.45" />
        </g>
        <path d="M130 517 L120 506 L108 498 L96 497 L86 504 L78 518 L71 538 L65 562 L61 588"
          fill="none" stroke="var(--w-green-deep)" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
        <g fill="var(--w-shadow)">
          <ellipse cx="102" cy="496" rx="3.6" ry="1.9" />
          <ellipse cx="82" cy="509" rx="3" ry="1.7" transform="rotate(-46 82 509)" />
        </g>
      </motion.g>
    </svg>
  );
}
