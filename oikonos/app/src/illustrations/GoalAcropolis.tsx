import { motion, useReducedMotion } from 'framer-motion';
import { surface, gentle, fade } from '../lib/motion';

/**
 * GOAL — the Acropolis headland.
 *
 * A three-ink riso plate printed on the cream field:
 *   cobalt (--ink family)   — the sea, the roof, the shadow between columns
 *   pine   (--olive family) — the headland, the cypress
 *   cream  (--paper family) — the marble
 *
 * Light comes from the upper left. Every left-facing plane is lit: the
 * cliff face that turns toward the water, the temple's pedimented front,
 * the top of each step. Every right-facing plane goes to a cobalt-tinted
 * stone or, on the roof, to flat cobalt. The temple therefore reads as a
 * solid, not a decal, and the whole plate has one sun in it.
 *
 * The peristyle is generated, not drawn by hand: eight columns across the
 * front on an exact pitch, nine down the flank on a compressing series, so
 * the rhythm is mechanically even in front and correctly foreshortened as
 * it recedes. Sloppy columns kill this drawing.
 *
 * Plate: 390 × 470, bleeding off the bottom and the right edge.
 */

/* ---- The crest: shoreline, cliff, plateau, and the fall to the right ---- */
const CREST =
  'M18 470'
  + 'C46 400 68 336 88 288'
  + 'C102 254 114 222 132 200'
  + 'C148 180 164 168 190 164'
  + 'L300 162'
  + 'C320 160 338 154 358 156'
  + 'C372 157 381 162 390 170';

const ROCK = `${CREST}L390 470Z`;

/** Where the rock meets the water — carries the surf. */
const SHORE = 'M18 470C46 400 68 336 88 288C98 264 106 242 112 226';

const HORIZON = 224;

/* ================================================================
   Temple geometry. One place, so nothing drifts.
   ================================================================ */

/* Front elevation */
const F = {
  left: 176, right: 278,          // cornice / pediment span
  apexX: 227, apexY: 79,
  corniceY: 105, corniceH: 5,
  archX0: 180, archX1: 274, archY: 110, archH: 11,
  colX0: 183, colSpan: 88, colTop: 121, colBot: 157,
};
/* Recession of the flank: right and slightly up */
const V = { x: 66, y: -7 };

const N_FRONT = 8;
const COL_W = 8.0;
const COL_GAP = (F.colSpan - N_FRONT * COL_W) / (N_FRONT - 1);
const COL_PITCH = COL_W + COL_GAP;
const FRONT_COLS = Array.from({ length: N_FRONT }, (_, i) => F.colX0 + i * COL_PITCH);

/** Doric triglyph rhythm: one over every column, one over every gap. */
const TRIGLYPHS = Array.from({ length: N_FRONT * 2 - 1 }, (_, i) =>
  F.colX0 + COL_W / 2 + (i * COL_PITCH) / 2);

/**
 * Flank columns. `u` is a compressing series — even in plan, converging
 * on the page — so the colonnade recedes instead of marching.
 */
const N_FLANK = 9;
const FLANK_COLS = Array.from({ length: N_FLANK }, (_, j) => {
  const u = 1 - Math.pow(1 - j / N_FLANK, 1.28);
  return {
    x: 271 + V.x * u,
    w: 6.4 * (1 - 0.45 * u),
    top: F.colTop + V.y * u,
    bot: F.colBot + V.y * u,
  };
});

/** A band of height `h` running `len` units to the right along the recession. */
function slab(x: number, y: number, len: number, h: number) {
  const dy = (V.y * len) / V.x;
  return `M${x} ${y}L${x + len} ${y + dy}L${x + len} ${y + dy + h}L${x} ${y + h}Z`;
}

export function GoalAcropolis({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();

  const layer = (y: number, delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { ...surface, delay },
  });

  return (
    <svg
      className={className}
      viewBox="0 0 390 470"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="A Doric temple on a green headland high above the Aegean, with a cypress beside it and a gull in the sky"
    >
      <defs>
        {/* ---- riso ink mottle, clipped to whatever plate it prints on ---- */}
        <filter id="gd-grain" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="4"
            seed="23" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.78 0.3 0 0 -0.17" />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="g" />
          <feBlend in="SourceGraphic" in2="g" mode="multiply" />
        </filter>

        {/* finer, lighter speckle for the marble */}
        <filter id="gd-grain-fine" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="3"
            seed="6" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.3 0.11 0 0 -0.1" />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="g" />
          <feBlend in="SourceGraphic" in2="g" mode="multiply" />
        </filter>

        {/* hard-threshold dither: turns any shape into printed dots */}
        <filter id="gd-stipple" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="1"
            seed="41" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    2.6 0 0 0 -1.06" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        <filter id="gd-stipple-coarse" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="1"
            seed="8" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    2.4 0 0 0 -1.0" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>

        {/* the one permitted soft gradient — form across the rock */}
        <linearGradient id="gd-rock" x1="0.06" y1="0.02" x2="0.86" y2="1">
          <stop offset="0" stopColor="var(--g-green-lit)" />
          <stop offset="0.36" stopColor="var(--g-green)" />
          <stop offset="1" stopColor="var(--g-green-deep)" />
        </linearGradient>

        {/* fades the stippled water shimmer out with depth */}
        <linearGradient id="gd-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="gd-depth-mask">
          <rect x="0" y={HORIZON} width="390" height="120" fill="url(#gd-depth)" />
        </mask>

        <clipPath id="gd-rock-clip"><path d={ROCK} /></clipPath>
        <clipPath id="gd-sea-clip"><rect x="0" y={HORIZON} width="390" height="246" /></clipPath>
      </defs>

      {/* ============================================================
          1 — THE FAR SHORE, above the horizon on the left
          ============================================================ */}
      <motion.g {...layer(10, 0.06)}>
        <g filter="url(#gd-grain)">
          <path
            d="M0 224V213C12 204 28 198 46 200C64 202 78 210 94 217C104 221 112 224 120 224Z"
            fill="var(--g-green-far)"
          />
          <path
            d="M0 224V216C10 210 22 207 34 208C46 209 56 214 64 219C69 222 74 224 78 224Z"
            fill="var(--g-green)" opacity="0.34"
          />
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE SEA
          ============================================================ */}
      <motion.g {...layer(14, 0.02)}>
        <g filter="url(#gd-grain)">
          <rect x="0" y={HORIZON} width="390" height="246" fill="var(--g-sea)" />
        </g>

        <g clipPath="url(#gd-sea-clip)">
          {/* light gathers on the water near the horizon — dithered, not blurred */}
          <g mask="url(#gd-depth-mask)">
            <rect
              x="0" y={HORIZON} width="390" height="120"
              fill="var(--g-sea-lift)" filter="url(#gd-stipple)"
            />
          </g>
          {/* the horizon itself: a printed edge, slightly proud */}
          <rect x="0" y={HORIZON} width="390" height="1.4" fill="var(--g-sea-lift)" opacity="0.85" />

          {/* a few flat swells — the sea is a shape, not a texture */}
          <g fill="var(--g-sea-lift)" opacity="0.5">
            <rect x="10" y="243" width="34" height="1.8" rx="0.9" />
            <rect x="58" y="252" width="22" height="1.8" rx="0.9" />
            <rect x="6" y="268" width="26" height="2" rx="1" />
            <rect x="44" y="286" width="30" height="2" rx="1" />
            <rect x="0" y="312" width="20" height="2.2" rx="1.1" />
            <rect x="30" y="340" width="24" height="2.2" rx="1.1" />
            <rect x="0" y="382" width="16" height="2.4" rx="1.2" />
          </g>
          {/* the ink lays down heavier in the near water */}
          <rect
            x="0" y="330" width="390" height="140"
            fill="var(--g-sea-deep)" opacity="0.55" filter="url(#gd-stipple-coarse)"
          />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE HEADLAND
          ============================================================ */}
      <motion.g {...layer(44, 0.12)}>
        <g filter="url(#gd-grain)">
          <path d={ROCK} fill="url(#gd-rock)" />

          <g clipPath="url(#gd-rock-clip)">
            {/* gullies raking down the fall line of the sea-facing face */}
            <g fill="var(--g-green-deep)">
              <path d="M196 172c6 30-2 62-20 96-18 34-42 68-66 106l-30-14c30-38 56-74 72-106 16-32 22-60 20-82Z" opacity="0.34" />
              <path d="M258 170c8 34 2 68-16 104-18 36-44 72-70 112l-24-12c30-40 56-78 72-112 16-34 22-64 18-92Z" opacity="0.2" />
              <path d="M150 186c4 26-4 54-20 84-16 30-38 60-60 92l-22-12c26-32 48-62 62-90 14-28 20-52 18-74Z" opacity="0.26" />
              {/* the dark chine right under the crest */}
              <path d="M300 164c14 24 22 52 24 84 2 32-2 68-8 106l-34 4c8-40 12-78 10-110-2-32-8-58-18-80Z" opacity="0.22" />
            </g>

            {/* a nearer shoulder crossing the lower third */}
            <path
              d="M-10 470C40 424 82 372 118 320c30-44 62-78 96-98l186 26v222Z"
              fill="var(--g-green-deep)" opacity="0.3"
            />
            <path
              d="M-10 480C34 442 74 396 108 348c26-38 56-68 90-88l-4 220Z"
              fill="var(--g-green-deep)" opacity="0.22"
            />

            {/* stippled transitions so no shadow has a vector edge */}
            <path
              d="M196 176c6 26 0 54-16 84-16 30-38 62-62 96l-14-6c26-34 48-66 62-94 14-28 20-54 18-80Z"
              fill="var(--g-green-deep)" opacity="0.5" filter="url(#gd-stipple)"
            />
            <path
              d="M-10 470C40 424 82 372 118 320c26-38 54-68 84-88l6 24c-30 20-58 50-84 88-34 50-74 100-124 146Z"
              fill="var(--g-green-deep)" opacity="0.55" filter="url(#gd-stipple)"
            />

            {/* sunlit limestone path threading the plateau behind the temple */}
            <path
              d="M186 168c34-4 74-6 118-4 32 2 62 6 86 12l-2 8c-26-6-56-10-86-12-44-2-84 0-118 4Z"
              fill="var(--g-lime)" opacity="0.72"
            />

            {/* scrub clinging to the face */}
            <g fill="var(--g-green-deep)" opacity="0.5">
              <ellipse cx="120" cy="238" rx="8" ry="4.4" />
              <ellipse cx="96" cy="290" rx="6.5" ry="3.6" />
              <ellipse cx="70" cy="356" rx="9" ry="5" />
              <ellipse cx="150" cy="212" rx="6" ry="3.4" />
              <ellipse cx="46" cy="424" rx="7" ry="4" />
            </g>
          </g>

          {/* the sun catches the whole crest */}
          <path
            d={CREST} fill="none" stroke="var(--g-green-lit)"
            strokeWidth="3.2" strokeLinecap="round" opacity="0.95"
          />
          {/* scrub straddling the ridge so the silhouette is not a wire */}
          <g fill="var(--g-green-deep)">
            <ellipse cx="146" cy="187" rx="6.5" ry="3.6" />
            <ellipse cx="118" cy="216" rx="5.4" ry="3" />
            <ellipse cx="98" cy="260" rx="6.8" ry="3.8" />
            <ellipse cx="316" cy="159" rx="5.6" ry="3.2" />
            <ellipse cx="338" cy="155" rx="4.4" ry="2.6" />
          </g>
        </g>

        {/* surf: a printed fringe where the rock enters the water */}
        <g clipPath="url(#gd-sea-clip)">
          <path
            d={SHORE} fill="none" stroke="var(--g-foam)" strokeWidth="9"
            strokeLinecap="round" opacity="0.85" filter="url(#gd-stipple)"
          />
          <path
            d={SHORE} fill="none" stroke="var(--g-sea-lift)" strokeWidth="2.2"
            strokeLinecap="round" opacity="0.9"
          />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE TEMPLE
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, y: 18, scale: 0.965 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.4 }}
        style={{ transformOrigin: '250px 168px' }}
      >
        {/* cast shadow: the sun is upper-left, so the mass throws right */}
        <g clipPath="url(#gd-rock-clip)">
          <path
            d="M281 166l66-7 38 12-96 12-52-6Z"
            fill="var(--g-green-deep)" opacity="0.42"
          />
          <path
            d="M281 166l66-7 38 12-96 12-52-6Z"
            fill="var(--g-green-deep)" opacity="0.5" filter="url(#gd-stipple)"
          />
        </g>

        <g filter="url(#gd-grain-fine)">
          {/* ---- the shaded roof slope, falling away to the right ---- */}
          <path
            d={`M${F.apexX} ${F.apexY}L${F.apexX + V.x} ${F.apexY + V.y}`
              + `L${F.right + V.x} ${F.corniceY + V.y}L${F.right} ${F.corniceY}Z`}
            fill="var(--g-roof)"
          />
          {/* tile courses running down the slope */}
          <g stroke="var(--g-roof-lit)" strokeWidth="0.7" opacity="0.4">
            {[0.2, 0.4, 0.6, 0.8].map((t) => (
              <line
                key={t}
                x1={F.apexX + V.x * t} y1={F.apexY + V.y * t}
                x2={F.right + V.x * t} y2={F.corniceY + V.y * t}
              />
            ))}
          </g>
          {/* the ridge takes the light */}
          <line
            x1={F.apexX} y1={F.apexY} x2={F.apexX + V.x} y2={F.apexY + V.y}
            stroke="var(--g-roof-lit)" strokeWidth="1.6" strokeLinecap="round"
          />

          {/* ---- flank: cornice, architrave, colonnade, all in shade ---- */}
          <path d={slab(F.right, F.corniceY, V.x, F.corniceH)} fill="var(--g-stone-shade)" />
          <path d={slab(F.archX1, F.archY, V.x, F.archH)} fill="var(--g-stone-dark)" />

          {/* the dark between the flank columns */}
          <path
            d={`M271 ${F.colTop}L${271 + V.x} ${F.colTop + V.y}`
              + `L${271 + V.x} ${F.colBot + V.y}L271 ${F.colBot}Z`}
            fill="var(--g-shadow)"
          />
          {FLANK_COLS.map((c, j) => (
            <rect
              key={j} x={c.x} y={c.top} width={c.w} height={c.bot - c.top}
              fill="var(--g-stone-shade)"
            />
          ))}
          {/* capitals on the flank, read as one receding band */}
          <path
            d={slab(271, F.colTop - 2.4, V.x, 2.4)}
            fill="var(--g-stone-dark)" opacity="0.9"
          />

          {/* ---- front: colonnade ---- */}
          <rect
            x={F.colX0} y={F.colTop} width={F.colSpan} height={F.colBot - F.colTop}
            fill="var(--g-shadow)"
          />
          {FRONT_COLS.map((x, i) => (
            <g key={i}>
              {/* shaft */}
              <rect x={x} y={F.colTop + 3.2} width={COL_W} height={F.colBot - F.colTop - 3.2}
                fill="var(--g-stone)" />
              {/* cylindrical turn: lit left arris, shaded right return */}
              <rect x={x} y={F.colTop + 3.2} width={1.5} height={F.colBot - F.colTop - 3.2}
                fill="var(--g-stone-hi)" />
              <rect x={x + COL_W - 2.1} y={F.colTop + 3.2} width={2.1} height={F.colBot - F.colTop - 3.2}
                fill="var(--g-stone-shade)" />
              {/* a single flute, enough to say "fluted" at this size */}
              <rect x={x + COL_W * 0.46} y={F.colTop + 5} width={0.7} height={F.colBot - F.colTop - 6}
                fill="var(--g-stone-shade)" opacity="0.75" />
              {/* echinus + abacus */}
              <rect x={x - 1.1} y={F.colTop} width={COL_W + 2.2} height={3.4}
                fill="var(--g-stone-hi)" />
              <rect x={x - 1.1} y={F.colTop + 2.6} width={COL_W + 2.2} height={0.8}
                fill="var(--g-stone-shade)" opacity="0.8" />
            </g>
          ))}

          {/* ---- front: entablature ---- */}
          <rect x={F.archX0} y={F.archY} width={F.archX1 - F.archX0} height={F.archH}
            fill="var(--g-stone)" />
          <rect x={F.archX0} y={F.archY} width={F.archX1 - F.archX0} height={1.2}
            fill="var(--g-stone-hi)" />
          {/* Doric frieze */}
          <g fill="var(--g-stone-shade)">
            {TRIGLYPHS.map((tx, i) => (
              <rect key={i} x={tx - 0.9} y={F.archY + 4.6} width={1.8} height={5.2} />
            ))}
          </g>
          <rect x={F.archX0} y={F.archY + F.archH - 1} width={F.archX1 - F.archX0} height={1}
            fill="var(--g-stone-shade)" opacity="0.7" />

          {/* ---- front: cornice ---- */}
          <rect x={F.left} y={F.corniceY} width={F.right - F.left} height={F.corniceH}
            fill="var(--g-stone)" />
          <rect x={F.left} y={F.corniceY} width={F.right - F.left} height={1.4}
            fill="var(--g-stone-hi)" />

          {/* ---- pediment ---- */}
          <path
            d={`M${F.left} ${F.corniceY}L${F.apexX} ${F.apexY}L${F.right} ${F.corniceY}Z`}
            fill="var(--g-stone)"
          />
          {/* tympanum, recessed into shade */}
          <path
            d={`M${F.left + 9} ${F.corniceY - 2.5}L${F.apexX} ${F.apexY + 5.4}`
              + `L${F.right - 9} ${F.corniceY - 2.5}Z`}
            fill="var(--g-stone-shade)"
          />
          {/* three figures in the tympanum, barely there */}
          <g fill="var(--g-stone-dark)" opacity="0.85">
            <ellipse cx="227" cy="96" rx="2" ry="3.6" />
            <ellipse cx="214" cy="99" rx="1.7" ry="2.6" />
            <ellipse cx="240" cy="99" rx="1.7" ry="2.6" />
            <ellipse cx="203" cy="101.4" rx="1.5" ry="1.6" />
            <ellipse cx="251" cy="101.4" rx="1.5" ry="1.6" />
          </g>
          {/* raking cornice, lit on the left rake */}
          <path
            d={`M${F.left - 1} ${F.corniceY + 0.6}L${F.apexX} ${F.apexY - 1.6}`}
            stroke="var(--g-stone-hi)" strokeWidth="2.6" strokeLinecap="round" fill="none"
          />
          <path
            d={`M${F.apexX} ${F.apexY - 1.6}L${F.right + 1} ${F.corniceY + 0.6}`}
            stroke="var(--g-stone)" strokeWidth="2.6" strokeLinecap="round" fill="none"
          />
          <circle cx={F.apexX} cy={F.apexY - 3.4} r="1.9" fill="var(--g-stone-hi)" />

          {/* ---- stylobate: three steps, front faces lit, returns shaded ---- */}
          {[
            { x0: 179, x1: 275, y: 157 },
            { x0: 176, x1: 278, y: 161 },
            { x0: 173, x1: 281, y: 165 },
          ].map((s, i) => (
            <g key={i}>
              <path d={slab(s.x1, s.y, V.x, 4)} fill="var(--g-stone-shade)" />
              <path
                d={`M${s.x1} ${s.y}L${s.x1 + V.x} ${s.y + V.y}`}
                stroke="var(--g-stone-hi)" strokeWidth="0.9" opacity="0.7"
              />
              <rect x={s.x0} y={s.y} width={s.x1 - s.x0} height="4" fill="var(--g-stone)" />
              <rect x={s.x0} y={s.y} width={s.x1 - s.x0} height="1" fill="var(--g-stone-hi)" />
            </g>
          ))}
        </g>
      </motion.g>

      {/* ============================================================
          5 — THE CYPRESS
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scaleY: 0.42 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay: 0.56 }}
        style={{ transformOrigin: '368px 160px' }}
      >
        <g clipPath="url(#gd-rock-clip)">
          <path d="M368 158l24 6-30 6-14-6Z" fill="var(--g-green-deep)" opacity="0.42" />
        </g>
        <g filter="url(#gd-grain)">
          <rect x="366.6" y="140" width="2.8" height="20" fill="var(--g-green-deep)" />
          <path
            d="M368 62c9.5 24 13 52 10.4 76-1.8 16.6-19 16.6-20.8 0C354.9 114 358.5 86 368 62Z"
            fill="var(--g-green-deep)"
          />
          {/* the sun rakes its left flank */}
          <path
            d="M368 62c-5.4 14-8.6 31-9.6 47-.8 12-.4 22 .7 30-3.8-25-1.6-56 8.9-77Z"
            fill="var(--g-green)" opacity="0.85"
          />
        </g>
        {/* a low shrub keeping it company */}
        <g filter="url(#gd-grain)">
          <path
            d="M316 158c3.6-9 8-9 11.6 0 2 5-1.6 8-5.8 8s-7.8-3-5.8-8Z"
            fill="var(--g-green-deep)"
          />
        </g>
      </motion.g>

      {/* ============================================================
          6 — THE GULL
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, x: -16, y: 6 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={reduce ? { duration: 0 } : { ...fade, delay: 0.95, duration: 0.9 }}
        stroke="var(--g-sea)" fill="none" strokeLinecap="round"
      >
        <path d="M110 96c4.6-5.4 9.2-5.4 11.6 0 2.4-5.4 7-5.4 11.6 0" strokeWidth="1.7" />
        <path d="M152 79c2.6-3.1 5.2-3.1 6.6 0 1.4-3.1 4-3.1 6.6 0" strokeWidth="1.2" opacity="0.55" />
      </motion.g>
    </svg>
  );
}
