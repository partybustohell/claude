import { motion, useReducedMotion } from 'framer-motion';
import { surface, gentle } from '../lib/motion';

/**
 * WELCOME — Santorini cliff.
 *
 * A three-ink riso plate printed on the cobalt field:
 *   pine green  (--olive family)     — the cliff mass
 *   cream/white (--paper / --on-ink) — the whitewashed village
 *   cobalt      (--ink family)       — dome, openings, shaded returns
 *
 * The light comes from the upper left. Every cubic volume shows a bright
 * top plane, a cream face and a cobalt-tinted right return; every mass
 * throws a green shadow down-and-right onto the rock.
 *
 * Drawn on a 390 × 420 plate that bleeds off the bottom and right edge.
 */

/** The crest of the headland — reused as silhouette, clip and light line. */
const CREST =
  'M56 420C74 398 84 378 100 354c16-24 38-40 62-56 24-16 38-26 56-38 '
  + '16-10 26-14 40-22 22-12 42-20 64-30 26-12 48-28 68-42';

export function WelcomeCliff({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();

  /** Layer entrance: the rock lands first, the village settles onto it. */
  const layer = (y: number, delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { ...surface, delay },
  });

  return (
    <svg
      className={className}
      viewBox="0 0 390 420"
      preserveAspectRatio="xMaxYMax slice"
      role="img"
      aria-label="A whitewashed cliff-top village with a blue-domed church above the Aegean"
    >
      <defs>
        {/* ---- riso ink mottle: noise clipped to the plate it prints on ---- */}
        <filter id="wc-grain" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise" baseFrequency="0.6" numOctaves="4"
            seed="17" stitchTiles="stitch" result="n"
          />
          <feColorMatrix
            in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.95 0.4 0 0 -0.2"
          />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        {/* finer, lighter speckle for the whitewash */}
        <filter id="wc-grain-lite" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise" baseFrequency="0.85" numOctaves="3"
            seed="4" stitchTiles="stitch" result="n"
          />
          <feColorMatrix
            in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.5 0.18 0 0 -0.13"
          />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        {/* the one permitted soft gradient — form on the rock */}
        <linearGradient id="wc-rock" x1="0.84" y1="0" x2="0.14" y2="1">
          <stop offset="0" stopColor="var(--w-green-lit)" />
          <stop offset="0.36" stopColor="var(--w-green)" />
          <stop offset="1" stopColor="var(--w-green-deep)" />
        </linearGradient>

        <clipPath id="wc-rock-clip">
          <path d={`${CREST}V420Z`} />
        </clipPath>

        <clipPath id="wc-dome-clip">
          <path d="M294 128a33 33 0 0 1 66 0Z" />
        </clipPath>
      </defs>

      {/* ============================================================
          1 — THE ROCK
          ============================================================ */}
      <motion.g {...layer(34, 0.1)} filter="url(#wc-grain)">
        <path d={`${CREST}V420Z`} fill="url(#wc-rock)" />

        <g clipPath="url(#wc-rock-clip)">
          {/* shadowed gullies running down the face */}
          <path
            d="M188 286c14 20 16 44 10 66-6 22-20 40-38 58l-32-6c22-24 40-46 46-66 6-20 4-38-2-54Z"
            fill="var(--w-green-deep)" opacity="0.44"
          />
          <path
            d="M304 224c10 22 8 46-4 70-12 24-32 46-50 68l-26-10c22-22 40-46 50-68 10-22 12-42 8-60Z"
            fill="var(--w-green-deep)" opacity="0.26"
          />
          {/* a nearer shoulder in shadow, lower left — second silhouette */}
          <path
            d="M-12 422c28-8 58-22 86-40 30-20 62-34 96-40l16 82Z"
            fill="var(--w-green-deep)" opacity="0.48"
          />
          {/* cast shadows of the village */}
          <path d="M288 252h116v28l-132-10Z" fill="var(--w-green-deep)" opacity="0.4" />
          <path d="M250 252h48l-18 24-52-6Z" fill="var(--w-green-deep)" opacity="0.34" />
          <path d="M200 272h72l-18 22-72-8Z" fill="var(--w-green-deep)" opacity="0.32" />
          <path d="M148 312h70l-16 20-72-8Z" fill="var(--w-green-deep)" opacity="0.28" />
          {/* scrub clinging to the rock */}
          <g fill="var(--w-green-deep)" opacity="0.5">
            <ellipse cx="130" cy="332" rx="9" ry="5" />
            <ellipse cx="108" cy="356" rx="6" ry="3.4" />
            <ellipse cx="242" cy="302" rx="7" ry="4" />
            <ellipse cx="286" cy="286" rx="5" ry="3" />
            <ellipse cx="334" cy="240" rx="6" ry="3.4" />
            <ellipse cx="362" cy="212" rx="8" ry="4.4" />
          </g>
        </g>

        {/* the sun catches the crest */}
        <path
          d={CREST} fill="none" stroke="var(--w-green-lit)" strokeWidth="3"
          strokeLinecap="round" opacity="0.9"
        />
      </motion.g>

      {/* ============================================================
          2 — THE VILLAGE
          ============================================================ */}
      <motion.g {...layer(20, 0.28)} filter="url(#wc-grain-lite)">
        {/* --- lower terrace house --- */}
        <path d="M148 264h70v48h-70z" fill="var(--w-cream)" />
        <path d="M148 264l14-8h70l-14 8Z" fill="var(--w-white)" />
        <path d="M218 264l14-8v48l-14 8Z" fill="var(--w-shade)" />
        <path d="M148 306h70v6h-70z" fill="var(--w-shade)" opacity="0.7" />
        <rect x="158" y="278" width="9" height="13" rx="1" fill="var(--w-open)" />
        <rect x="176" y="278" width="9" height="13" rx="1" fill="var(--w-open)" />

        {/* --- stepped path climbing from the terrace to the church --- */}
        <path
          d="M212 304v-6h8v-6h8v-6h8v-6h8v-6h8v-6h8v-6h8v42Z"
          fill="var(--w-shade)"
        />
        <g fill="var(--w-white)">
          <rect x="212" y="298" width="8" height="2.4" />
          <rect x="220" y="292" width="8" height="2.4" />
          <rect x="228" y="286" width="8" height="2.4" />
          <rect x="236" y="280" width="8" height="2.4" />
          <rect x="244" y="274" width="8" height="2.4" />
          <rect x="252" y="268" width="8" height="2.4" />
          <rect x="260" y="262" width="8" height="2.4" />
        </g>

        {/* --- mid annex --- */}
        <path d="M200 212h58v60h-58z" fill="var(--w-cream)" />
        <path d="M200 212l14-8h58l-14 8Z" fill="var(--w-white)" />
        <path d="M258 212l14-8v60l-14 8Z" fill="var(--w-shade)" />
        <path d="M200 266h58v6h-58z" fill="var(--w-shade)" opacity="0.7" />
        <path d="M212 254v-14a7 7 0 0 1 14 0v14Z" fill="var(--w-open)" />
        <rect x="236" y="230" width="10" height="12" rx="1" fill="var(--w-open)" />

        {/* --- church: left wing --- */}
        <path d="M250 194h44v58h-44z" fill="var(--w-cream)" />
        <path d="M250 194l14-8h44l-14 8Z" fill="var(--w-white)" />
        <path d="M250 246h44v6h-44z" fill="var(--w-shade)" opacity="0.7" />
        <path d="M258 234v-13a6.5 6.5 0 0 1 13 0v13Z" fill="var(--w-open)" />
        <rect x="278" y="208" width="9" height="11" rx="1" fill="var(--w-open)" />

        {/* --- church: main volume --- */}
        <path d="M288 156h116v96H288z" fill="var(--w-cream)" />
        <path d="M288 156l14-8h116l-14 8Z" fill="var(--w-white)" />
        <path d="M288 156h8v96h-8z" fill="var(--w-white)" />
        <path d="M288 244h116v8H288z" fill="var(--w-shade)" opacity="0.62" />
        <path d="M300 188h104v2.4H300z" fill="var(--w-shade)" opacity="0.9" />
        {/* the arcade */}
        <g fill="var(--w-open)">
          <path d="M306 226v-18a7 7 0 0 1 14 0v18Z" />
          <path d="M334 226v-18a7 7 0 0 1 14 0v18Z" />
          <path d="M362 226v-18a7 7 0 0 1 14 0v18Z" />
        </g>

        {/* --- drum + cornice under the dome --- */}
        <path d="M296 134h62v22h-62z" fill="var(--w-white)" />
        <path d="M344 134h14v22h-14z" fill="var(--w-shade)" />
        <rect x="318" y="138" width="8" height="14" rx="4" fill="var(--w-open)" opacity="0.82" />
        <path d="M290 126h74v9h-74z" fill="var(--w-cream)" />
        <path d="M352 126h12v9h-12z" fill="var(--w-shade)" />
      </motion.g>

      {/* ============================================================
          3 — THE DOME
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.5 }}
        style={{ transformOrigin: '327px 128px' }}
      >
        <g filter="url(#wc-grain)">
          <path d="M294 128a33 33 0 0 1 66 0Z" fill="var(--w-open)" />
          <g clipPath="url(#wc-dome-clip)">
            {/* the light rakes the upper-left quarter */}
            <path
              d="M297 127a30 30 0 0 1 30-30" fill="none"
              stroke="var(--ink-lift)" strokeWidth="6" opacity="0.95"
            />
            {/* ribs */}
            <g stroke="var(--w-cream)" strokeWidth="1.25" fill="none" opacity="0.8">
              <path d="M327 95v33" />
              <path d="M309 100c-5 10-8 20-9 28" />
              <path d="M345 100c5 10 8 20 9 28" />
            </g>
          </g>
          <path
            d="M294 128a33 33 0 0 1 66 0" fill="none"
            stroke="var(--w-cream)" strokeWidth="1.9"
          />
        </g>
        {/* finial + cross */}
        <g fill="var(--w-white)">
          <circle cx="327" cy="91" r="3.2" />
          <rect x="325.8" y="71" width="2.4" height="18" rx="1.2" />
          <rect x="320" y="77" width="14" height="2.4" rx="1.2" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE CYPRESSES
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scaleY: 0.5 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay: 0.6 }}
        style={{ transformOrigin: '198px 274px' }}
        filter="url(#wc-grain)"
      >
        <rect x="196.7" y="250" width="2.6" height="24" fill="var(--w-green-deep)" />
        <path
          d="M198 196c9 19 12 41 9 59-2 12-16 12-18 0-3-18 0-40 9-59Z"
          fill="var(--w-green-deep)"
        />
        <path
          d="M198 196c-5 11-8 23-9 35-.8 9-.4 17 .6 23-3-19-1-42 8.4-58Z"
          fill="var(--w-green)" opacity="0.8"
        />
      </motion.g>

      <motion.g
        initial={reduce ? undefined : { opacity: 0, scaleY: 0.5 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay: 0.7 }}
        style={{ transformOrigin: '174px 322px' }}
        filter="url(#wc-grain)"
      >
        <rect x="173" y="308" width="2" height="14" fill="var(--w-green-deep)" />
        <path
          d="M174 276c6 13 8 26 6 38-1 8-11 8-12 0-2-12 0-25 6-38Z"
          fill="var(--w-green-deep)"
        />
      </motion.g>
    </svg>
  );
}
