import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';
import { Water, WaterDefs, Ridge, Cypress, Dome, Gulls } from './parts';

/**
 * ASCENT — the climb to the chapel.
 *
 * For the goals cluster. A goal is a flight of steps with a thing at
 * the top of it, and the only honest picture of one is the flight seen
 * from partway up: the treads behind you are lit, the chapel is still
 * above you, and you can count what is left.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. Every tread catches the sun and every riser falls into
 * shade — which is what makes a flight of steps read as steps and not
 * as a ladder painted on a hill. The chapel's west front is lit, its
 * south flank is not, and the hill's own shoulder shades as it turns
 * away to the right.
 *
 * ── THE STEPS ARE COUNTED ────────────────────────────────────────
 * Fourteen treads on a curve, each one narrowing and shortening as it
 * climbs, laid by a single loop rather than drawn by hand — so the
 * perspective cannot drift the way a hand-placed flight does, and the
 * flight genuinely converges on the chapel door instead of near it.
 *
 * Plate: 390 × 260, bleeding off the bottom and the right.
 */

const ID = 'as';
const HORIZON = 132;

/* The flight: from the foot at lower left to the door at upper right. */
const FOOT = { x: 66, y: 258 };
const DOOR = { x: 286, y: 118 };
const STEPS = 14;

/** Bows the flight left of the straight line, so it climbs a shoulder. */
const BOW = 46;

function stepAt(i: number) {
  const t = i / (STEPS - 1);
  /* ease the rise: steps bunch as they near the top, which is what a
     hill does and what makes the last stretch look like the last one */
  const e = 1 - Math.pow(1 - t, 1.55);
  const x = FOOT.x + (DOOR.x - FOOT.x) * e - Math.sin(t * Math.PI) * BOW;
  const y = FOOT.y + (DOOR.y - FOOT.y) * e;
  const w = 74 - 54 * e;          // treads narrow with distance
  const h = 9.4 - 5.6 * e;        // and shorten
  return { x, y, w, h };
}

const FLIGHT = Array.from({ length: STEPS }, (_, i) => stepAt(i));

/** The hill: one confident silhouette, rising left to right. */
const HILL =
  'M0 260'
  + 'C24 236 52 214 88 198'
  + 'C126 181 158 168 186 152'
  + 'C214 136 236 120 262 112'
  + 'C292 103 330 104 390 116'
  + 'V260Z';

export function Ascent({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={260}
      label="A whitewashed flight of steps climbing a green headland to a domed chapel"
    >
      <defs>
        <Press id={ID} seed={19} />
        <WaterDefs id={ID} y={HORIZON} h={70} />
        <clipPath id={`${ID}-hill`}><path d={HILL} /></clipPath>
        <linearGradient id={`${ID}-slope`} x1="0.1" y1="0.1" x2="0.9" y2="1">
          <stop offset="0" stopColor="var(--g-green-lit)" />
          <stop offset="0.3" stopColor="var(--g-green)" />
          <stop offset="1" stopColor="var(--g-green-deep)" />
        </linearGradient>
      </defs>

      {/* ============================================================
          1 — THE SEA BEYOND, seen over the shoulder of the hill
          ============================================================ */}
      <motion.g {...layer(8, 0.02)}>
        <Ridge id={ID} y={HORIZON} lift={20} opacity={0.85} />
        <Water id={ID} y={HORIZON} h={70} swells={false} />
      </motion.g>

      {/* ============================================================
          2 — THE HILL
          ============================================================ */}
      <motion.g {...layer(26, 0.08)}>
        <g filter={ink(ID, 'grain')}>
          <path d={HILL} fill={`url(#${ID}-slope)`} />

          <g clipPath={`url(#${ID}-hill)`}>
            {/* the shoulder turning away to the right loses the sun */}
            <path d="M262 108C300 118 340 140 366 180C382 204 390 230 390 260H262Z"
              fill="var(--g-green-deep)" opacity="0.34" />
            {/* terrace walls, following the contour — three, not thirty */}
            <g fill="none" stroke="var(--g-green-deep)" strokeWidth="2.4" opacity="0.4">
              <path d="M0 226C46 208 96 192 140 174" />
              <path d="M24 258C74 238 128 216 176 196" />
              <path d="M150 168C196 152 232 138 268 130" />
            </g>
            <g fill="none" stroke="var(--g-green-lit)" strokeWidth="1.4" opacity="0.34">
              <path d="M0 223C46 205 96 189 140 171" />
              <path d="M24 255C74 235 128 213 176 193" />
            </g>
            {/* scrub, on the ledges only */}
            <g fill="var(--g-green-deep)" opacity="0.28">
              <ellipse cx="52" cy="216" rx="10" ry="4" />
              <ellipse cx="116" cy="188" rx="8" ry="3.4" />
              <ellipse cx="206" cy="150" rx="7" ry="3" />
              <ellipse cx="330" cy="158" rx="12" ry="4.6" />
            </g>
          </g>

          {/* the crest keeps the light all the way along */}
          <path
            d="M0 260C24 236 52 214 88 198C126 181 158 168 186 152C214 136 236 120 262 112C292 103 330 104 390 116"
            fill="none" stroke="var(--g-green-lit)" strokeWidth="2.6"
            strokeLinecap="round" opacity="0.85"
          />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE FLIGHT
          ============================================================ */}
      <motion.g {...layer(16, 0.2)}>
        {FLIGHT.map((s, i) => (
          <g key={i}>
            {/* riser: in shade, and it is what gives the step its height */}
            <path
              d={`M${s.x - s.w / 2} ${s.y}h${s.w}v${s.h}h${-s.w}Z`}
              fill="var(--g-stone-shade)"
            />
            {/* tread: the lit plane, seen nearly edge on */}
            <path
              d={`M${s.x - s.w / 2} ${s.y}h${s.w}l${-s.w * 0.06} ${-s.h * 0.42}h${-s.w * 0.88}Z`}
              fill="var(--g-stone-hi)"
            />
            {/* the nosing catches a hard line of sun */}
            <path d={`M${s.x - s.w / 2} ${s.y}h${s.w}`}
              stroke="var(--g-stone-hi)" strokeWidth="1.6" />
          </g>
        ))}
        {/* the whitewash runs a hand's width either side of the flight */}
        <path
          d={`M${FLIGHT[0].x - FLIGHT[0].w / 2} ${FLIGHT[0].y}`
            + FLIGHT.map((s) => `L${s.x - s.w / 2} ${s.y}`).join('')}
          fill="none" stroke="var(--g-stone)" strokeWidth="2" opacity="0.6"
        />
      </motion.g>

      {/* ============================================================
          4 — THE CHAPEL
          ============================================================ */}
      <motion.g {...layer(12, 0.44)}>
        {/* what it throws on the hill, to the right, per the one sun */}
        <g clipPath={`url(#${ID}-hill)`}>
          <path d="M300 118L340 112L356 124L306 132Z"
            fill="var(--g-green-deep)" opacity="0.42" />
        </g>
        <g filter={ink(ID, 'grain-fine')}>
          {/* the west front, lit */}
          <rect x="262" y="94" width="48" height="26" fill="var(--g-stone)" />
          <rect x="262" y="94" width="48" height="1.6" fill="var(--g-stone-hi)" />
          <rect x="262" y="94" width="1.4" height="26" fill="var(--g-stone-hi)" />
          {/* the south flank, turned away */}
          <path d="M310 94L330 100L330 122L310 120Z" fill="var(--g-stone-shade)" />
          {/* the door — the flight arrives here and nowhere else */}
          <path d="M280 120V106a6 6 0 0 1 12 0v14Z" fill="var(--g-void)" />
          <Dome x={286} base={94} r={13} />
          {/* the bell arch beside it */}
          <rect x="252" y="86" width="9" height="34" fill="var(--g-stone)" />
          <path d="M252 92a4.5 4.5 0 0 1 9 0v6h-9Z" fill="var(--g-void)" opacity="0.85" />
          <rect x="252" y="84" width="9" height="2.4" fill="var(--g-stone-hi)" />
        </g>
      </motion.g>

      {/* ============================================================
          5 — THE CYPRESS, stopping the eye at the top of the climb
          ============================================================ */}
      <motion.g {...layer(10, 0.56)}>
        <Cypress id={ID} x={344} base={122} h={72} />
      </motion.g>

      <motion.g {...layer(0, 0.7)}>
        <Gulls x={92} y={54} scale={0.85} />
      </motion.g>
    </Plate>
  );
}
