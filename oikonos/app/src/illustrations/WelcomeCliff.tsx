import { motion, useReducedMotion } from 'framer-motion';
import { surface, gentle } from '../lib/motion';

/**
 * WELCOME — Santorini cliff.
 *
 * A three-ink riso plate printed on the cobalt field:
 *   pine green  (--olive family)     — the headland
 *   cream/white (--paper / --on-ink) — the whitewashed village
 *   cobalt      (--ink family)       — dome, openings, shaded returns
 *
 * The light comes from the upper left. Every cubic volume shows a bright
 * top plane, a cream face and a cobalt-tinted right return; every mass
 * throws a green shadow down-and-right onto the rock. The village steps
 * down the crest at the same rake as the crest itself, so the whitewash
 * reads as planted on the rock rather than floating over it.
 *
 * Drawn on a 390 × 480 plate that bleeds off the bottom and right edge.
 */

/** The crest of the headland — silhouette, clip path and light line. */
const CREST =
  'M80 480C94 452 104 430 116 414C128 396 140 384 156 366'
  + 'C172 350 190 340 210 330C236 317 262 305 288 291C320 274 358 254 390 240';

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
      viewBox="0 0 390 480"
      preserveAspectRatio="xMaxYMax slice"
      role="img"
      aria-label="A whitewashed cliff-top village with a blue-domed church above the Aegean"
    >
      <defs>
        {/* ---- riso ink mottle: noise clipped to the plate it prints on ---- */}
        <filter id="wc-grain" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise" baseFrequency="0.58" numOctaves="4"
            seed="17" stitchTiles="stitch" result="n"
          />
          <feColorMatrix
            in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.8 0.34 0 0 -0.18"
          />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        {/* finer, lighter speckle for the whitewash */}
        <filter id="wc-grain-lite" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise" baseFrequency="0.82" numOctaves="3"
            seed="4" stitchTiles="stitch" result="n"
          />
          <feColorMatrix
            in="n" type="matrix" result="na"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.34 0.12 0 0 -0.1"
          />
          <feComposite in="na" in2="SourceAlpha" operator="in" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        {/* the one permitted soft gradient — form on the rock */}
        <linearGradient id="wc-rock" x1="0.88" y1="0.04" x2="0.16" y2="1">
          <stop offset="0" stopColor="var(--w-green-lit)" />
          <stop offset="0.34" stopColor="var(--w-green)" />
          <stop offset="1" stopColor="var(--w-green-deep)" />
        </linearGradient>

        <clipPath id="wc-rock-clip">
          <path d={`${CREST}V480Z`} />
        </clipPath>

        <clipPath id="wc-dome-clip">
          <path d="M297 180a34 34 0 0 1 68 0Z" />
        </clipPath>
      </defs>

      {/* ============================================================
          1 — THE ROCK
          ============================================================ */}
      <motion.g {...layer(36, 0.1)} filter="url(#wc-grain)">
        <path d={`${CREST}V480Z`} fill="url(#wc-rock)" />

        <g clipPath="url(#wc-rock-clip)">
          {/* gullies cut down the face */}
          <path
            d="M182 356c14 22 16 48 10 72-6 24-22 44-42 64l-34-8c24-26 42-50 48-72
               6-22 4-40-2-56Z"
            fill="var(--w-green-deep)" opacity="0.4"
          />
          <path
            d="M304 298c10 24 8 50-4 76-12 26-34 50-54 74l-26-12c24-24 44-50 54-74
               10-24 12-44 8-64Z"
            fill="var(--w-green-deep)" opacity="0.22"
          />
          {/* a nearer shoulder in shadow — the second silhouette */}
          <path
            d="M36 486c42-14 82-36 118-62 36-26 76-44 120-54l22 124Z"
            fill="var(--w-green-deep)" opacity="0.4"
          />
          {/* cast shadows of the village onto the rock */}
          <path d="M296 300h130v28l-152-14Z" fill="var(--w-green-deep)" opacity="0.4" />
          <path d="M262 318h48l-18 22-54-8Z" fill="var(--w-green-deep)" opacity="0.34" />
          <path d="M210 344h76l-18 22-76-10Z" fill="var(--w-green-deep)" opacity="0.32" />
          <path d="M166 368h66l-16 20-68-8Z" fill="var(--w-green-deep)" opacity="0.28" />
          {/* scrub clinging to the rock */}
          <g fill="var(--w-green-deep)" opacity="0.5">
            <ellipse cx="150" cy="402" rx="9" ry="5" />
            <ellipse cx="120" cy="444" rx="6" ry="3.4" />
            <ellipse cx="202" cy="362" rx="7" ry="4" />
            <ellipse cx="252" cy="332" rx="6" ry="3.4" />
            <ellipse cx="312" cy="302" rx="5" ry="3" />
            <ellipse cx="360" cy="274" rx="8" ry="4.4" />
          </g>
        </g>

        {/* the sun catches the crest */}
        <path
          d={CREST} fill="none" stroke="var(--w-green-lit)" strokeWidth="3.4"
          strokeLinecap="round" opacity="0.95"
        />
        {/* scrub straddling the ridge, breaking the silhouette */}
        <g fill="var(--w-green-deep)">
          <ellipse cx="140" cy="382" rx="7.5" ry="4.2" />
          <ellipse cx="196" cy="338" rx="5.5" ry="3.2" />
          <ellipse cx="250" cy="311" rx="6.5" ry="3.6" />
          <ellipse cx="310" cy="281" rx="5" ry="3" />
          <ellipse cx="360" cy="255" rx="6.5" ry="3.6" />
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE VILLAGE
          ============================================================ */}
      <motion.g {...layer(22, 0.28)} filter="url(#wc-grain-lite)">
        {/* --- lower terrace --- */}
        <path d="M166 332h62v36h-62z" fill="var(--w-cream)" />
        <path d="M166 332l9-6h62l-9 6Z" fill="var(--w-white)" />
        <path d="M228 332l9-6v36l-9 6Z" fill="var(--w-shade)" />
        <path d="M166 363h62v5h-62z" fill="var(--w-shade)" opacity="0.5" />
        <rect x="176" y="342" width="9" height="12" rx="1" fill="var(--w-open)" />
        <rect x="194" y="342" width="9" height="12" rx="1" fill="var(--w-open)" />

        {/* --- mid annex --- */}
        <path d="M210 282h72v62h-72z" fill="var(--w-cream)" />
        <path d="M210 282l9-6h72l-9 6Z" fill="var(--w-white)" />
        <path d="M282 282l9-6v62l-9 6Z" fill="var(--w-shade)" />
        <path d="M210 339h72v5h-72z" fill="var(--w-shade)" opacity="0.5" />
        <path d="M220 344v-11a7 7 0 0 1 14 0v11Z" fill="var(--w-open)" />
        <rect x="246" y="300" width="10" height="12" rx="1" fill="var(--w-open)" />

        {/* --- the stepped path leading down off the terrace --- */}
        <path
          d="M236 346h7v5h7v5h7v5h7v5h7v13h-42Z"
          fill="var(--w-cream)"
        />
        <g fill="var(--w-white)">
          <rect x="236" y="346" width="7" height="2.2" />
          <rect x="243" y="351" width="7" height="2.2" />
          <rect x="250" y="356" width="7" height="2.2" />
          <rect x="257" y="361" width="7" height="2.2" />
          <rect x="264" y="366" width="7" height="2.2" />
        </g>
        <g fill="var(--w-shade)" opacity="0.7">
          <rect x="236" y="348.2" width="7" height="1.4" />
          <rect x="243" y="353.2" width="7" height="1.4" />
          <rect x="250" y="358.2" width="7" height="1.4" />
          <rect x="257" y="363.2" width="7" height="1.4" />
          <rect x="264" y="368.2" width="7" height="1.4" />
        </g>
        <path d="M236 375h42v4h-42z" fill="var(--w-shade)" opacity="0.5" />

        {/* --- church: left wing --- */}
        <path d="M262 250h40v68h-40z" fill="var(--w-cream)" />
        <path d="M262 250l9-6h40l-9 6Z" fill="var(--w-white)" />
        <path d="M262 313h40v5h-40z" fill="var(--w-shade)" opacity="0.5" />
        <path d="M269 298v-12a6.5 6.5 0 0 1 13 0v12Z" fill="var(--w-open)" />
        <rect x="288" y="264" width="9" height="11" rx="1" fill="var(--w-open)" />

        {/* --- church: main volume --- */}
        <path d="M296 212h118v88H296z" fill="var(--w-cream)" />
        <path d="M296 212l9-6h118l-9 6Z" fill="var(--w-white)" />
        <path d="M296 212h8v88h-8z" fill="var(--w-white)" />
        <path d="M296 296h118v4H296z" fill="var(--w-shade)" opacity="0.42" />
        <path d="M306 244h108v2.4H306z" fill="var(--w-shade)" opacity="0.9" />
        {/* the arcade */}
        <g fill="var(--w-open)">
          <path d="M314 282v-15a7 7 0 0 1 14 0v15Z" />
          <path d="M342 282v-15a7 7 0 0 1 14 0v15Z" />
          <path d="M370 282v-15a7 7 0 0 1 14 0v15Z" />
          <path d="M398 282v-15a7 7 0 0 1 14 0v15Z" />
        </g>

        {/* --- drum + cornice beneath the dome --- */}
        <path d="M302 190h60v22h-60z" fill="var(--w-white)" />
        <path d="M348 190h14v22h-14z" fill="var(--w-shade)" />
        <rect x="328" y="194" width="8" height="13" rx="4" fill="var(--w-open)" opacity="0.82" />
        <path d="M294 180h74v10h-74z" fill="var(--w-cream)" />
        <path d="M356 180h12v10h-12z" fill="var(--w-shade)" />
      </motion.g>

      {/* ============================================================
          3 — THE DOME
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.5 }}
        style={{ transformOrigin: '331px 180px' }}
      >
        <g filter="url(#wc-grain)">
          <path d="M297 180a34 34 0 0 1 68 0Z" fill="var(--w-open)" />
          <g clipPath="url(#wc-dome-clip)">
            {/* the light rakes the upper-left quarter */}
            <path
              d="M300 179a31 31 0 0 1 31-31" fill="none"
              stroke="var(--ink-lift)" strokeWidth="6.5" opacity="0.95"
            />
            {/* ribs */}
            <g stroke="var(--w-cream)" strokeWidth="1.15" fill="none" opacity="0.5">
              <path d="M331 146v34" />
              <path d="M312 151c-5 10-8 20-9 29" />
              <path d="M350 151c5 10 8 20 9 29" />
            </g>
          </g>
          <path
            d="M297 180a34 34 0 0 1 68 0" fill="none"
            stroke="var(--w-cream)" strokeWidth="1.9"
          />
        </g>
        {/* finial + cross */}
        <g fill="var(--w-white)">
          <circle cx="331" cy="143" r="3.3" />
          <rect x="329.8" y="121" width="2.4" height="20" rx="1.2" />
          <rect x="324" y="127" width="14" height="2.4" rx="1.2" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE CYPRESSES
          ============================================================ */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0, scaleY: 0.48 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay: 0.6 }}
        style={{ transformOrigin: '209px 356px' }}
        filter="url(#wc-grain)"
      >
        <rect x="207.9" y="332" width="2.2" height="24" fill="var(--w-green-deep)" />
        <path
          d="M209 274c7.5 20 10 42 7.5 61-1.7 12-13.3 12-15 0-2.5-19 0-41 7.5-61Z"
          fill="var(--w-green-deep)"
        />
        <path
          d="M209 274c-4.2 11-6.6 24-7.4 36-.6 9-.2 17 .6 23-2.8-19-1.1-43 6.8-59Z"
          fill="var(--w-green)" opacity="0.8"
        />
      </motion.g>
    </svg>
  );
}
