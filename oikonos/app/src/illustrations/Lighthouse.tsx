import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, RampDefs, ScreenRamp } from './press';
import { Water, WaterDefs, Reflection, Gulls } from './parts';

/**
 * LIGHTHOUSE — the long view.
 *
 * For the insight cluster: reports, net worth, cash flow, the screens
 * whose job is to see further than one month. A lighthouse is what you
 * build when the useful thing is not more water but more visibility,
 * which is the argument those screens are making.
 *
 * ── ONE LIGHT, AND A SECOND ──────────────────────────────────────
 * The sun is upper left as everywhere else: the tower's left flank is
 * lit, its right closes to shade, the rock's sea-facing face keeps the
 * light and its lee falls away. The lamp is the one exception in the
 * whole app — a second source, and it is allowed because it is the
 * subject. It throws a single wedge out to the left, dithered so it
 * reads as printed light and not as a gradient, and it lights nothing
 * else in the picture: a beam that cast shadows would be two suns.
 *
 * ── THE BANDS ────────────────────────────────────────────────────
 * Four courses of clay on cream, and they narrow as they climb, because
 * the tower tapers and a band drawn at constant height on a tapering
 * cylinder is the thing that makes a drawing look flat.
 *
 * Plate: 390 × 260, bleeding off the bottom and the right.
 */

const ID = 'lh';
const HORIZON = 128;
const ROCK_TOP = 168;

const CX = 288;
const BASE = ROCK_TOP - 2;
const TOWER_H = 104;
const TOP_R = 15;
const BOT_R = 24;
const LAMP_Y = BASE - TOWER_H;

/** The rock: three overlapping silhouettes, not one lumpy outline. */
const ROCK =
  'M196 260C204 232 220 206 244 190C262 178 282 170 306 168'
  + 'C332 166 362 172 390 186V260Z';
const ROCK_LEE =
  'M306 168C332 166 362 172 390 186V260H300C306 226 308 194 306 168Z';

/** Bands narrow as the tower tapers — the taper is what sells the cylinder. */
const BANDS = [0.1, 0.34, 0.58, 0.8];

function radiusAt(t: number) { return BOT_R + (TOP_R - BOT_R) * t; }

export function Lighthouse({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={260}
      label="A banded lighthouse on a rock above the sea, its lamp throwing a single beam out over the water"
    >
      <defs>
        <Press id={ID} seed={43} />
        <WaterDefs id={ID} y={HORIZON} h={260 - HORIZON} />
        <clipPath id={`${ID}-rock`}><path d={ROCK} /></clipPath>
        {/* Measured on the old shaft: cream to neutral grey to blue-grey
            across ten smooth steps. A cylinder turns by coverage. */}
        <RampDefs id={ID} name="tower" w={390} h={260} box={{ x: CX - BOT_R, y: LAMP_Y, w: BOT_R * 2, h: TOWER_H }} x1={0} y1={0} x2={1} y2={0} />
        {/* The beam keeps a gradient, but only as a MASK on a dithered
            fill — the light thins by losing dots, not by fading. */}
        <linearGradient id={`${ID}-beamg`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${ID}-beamm`}>
          <rect x="0" y="0" width="390" height="260" fill={`url(#${ID}-beamg)`} />
        </mask>
      </defs>

      {/* ============================================================
          1 — THE SEA
          ============================================================ */}
      <motion.g {...layer(10, 0.02)}>
        <Water id={ID} y={HORIZON} h={260 - HORIZON} />
      </motion.g>

      {/* ============================================================
          2 — THE BEAM. Printed light: a wedge of dither, not a glow.
          ============================================================ */}
      <motion.g
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.6 }}
      >
        <g mask={`url(#${ID}-beamm)`}>
          <path d={`M${CX - 6} ${LAMP_Y - 4}L0 ${LAMP_Y - 46}L0 ${LAMP_Y + 42}Z`}
            fill="var(--g-clay-lit)" filter={ink(ID, 'stipple')} />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE ROCK
          ============================================================ */}
      <motion.g {...layer(24, 0.08)}>
        <g filter={ink(ID, 'grain')}>
          <path d={ROCK} fill="var(--g-green)" />
          <g clipPath={`url(#${ID}-rock)`}>
            {/* the lee, turned away from the sun */}
            <path d={ROCK_LEE} fill="var(--g-green-deep)" opacity="0.36" />
            {/* strata, following the lie of the rock */}
            <g fill="none" stroke="var(--g-green-deep)" strokeWidth="2" opacity="0.32">
              <path d="M200 250C224 226 252 206 286 196C318 187 356 188 390 200" />
              <path d="M214 226C238 206 264 192 294 186" />
            </g>
            <g fill="none" stroke="var(--g-green-lit)" strokeWidth="1.4" opacity="0.34">
              <path d="M200 246C224 222 252 202 286 192C318 183 356 184 390 196" />
            </g>
          </g>
          {/* the crest keeps the sun all along its length */}
          <path
            d="M196 260C204 232 220 206 244 190C262 178 282 170 306 168C332 166 362 172 390 186"
            fill="none" stroke="var(--g-green-lit)" strokeWidth="2.6"
            strokeLinecap="round" opacity="0.9"
          />
        </g>
        {/* surf, where the rock enters the water */}
        <path d="M196 260C204 232 220 206 244 190"
          fill="none" stroke="var(--g-foam)" strokeWidth="7"
          strokeLinecap="round" opacity="0.6" filter={ink(ID, 'stipple')} />
      </motion.g>

      {/* ============================================================
          4 — THE TOWER
          ============================================================ */}
      <motion.g {...layer(18, 0.2)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* the shaft */}
          <ScreenRamp scale="fine" id={ID} name="tower" w={390} h={260}
            d={`M${CX - TOP_R} ${LAMP_Y}L${CX - BOT_R} ${BASE}`
              + `L${CX + BOT_R} ${BASE}L${CX + TOP_R} ${LAMP_Y}Z`}
            base="var(--g-stone)" lit="var(--g-stone-hi)" deep="var(--g-stone-mid)" />
          {/* the courses. Each one is set at its own radius. */}
          {BANDS.map((t) => {
            const r = radiusAt(t);
            const y = BASE - TOWER_H * t;
            const h = 11 - 4 * t;
            const rl = radiusAt(t + h / TOWER_H);
            return (
              <path key={t}
                d={`M${CX - r} ${y}L${CX + r} ${y}L${CX + rl} ${y - h}L${CX - rl} ${y - h}Z`}
                fill="var(--g-clay)" opacity="0.92"
              />
            );
          })}
          {/* the lit edge runs the full height, over the bands too */}
          <path d={`M${CX - BOT_R + 1} ${BASE}L${CX - TOP_R + 1} ${LAMP_Y}`}
            stroke="var(--g-stone-hi)" strokeWidth="2.2" opacity="0.7" />

          {/* the gallery */}
          <rect x={CX - TOP_R - 7} y={LAMP_Y - 3} width={(TOP_R + 7) * 2} height="4.6"
            rx="1.6" fill="var(--g-stone)" />
          <rect x={CX - TOP_R - 7} y={LAMP_Y - 3} width={(TOP_R + 7) * 2} height="1.6"
            rx="0.8" fill="var(--g-stone-hi)" />
          <g stroke="var(--g-stone-shade)" strokeWidth="1.2">
            {[-14, -7, 0, 7, 14].map((dx) => (
              <path key={dx} d={`M${CX + dx} ${LAMP_Y - 3}v-8`} />
            ))}
          </g>

          {/* the lantern room, and the lamp itself */}
          <path d={`M${CX - 11} ${LAMP_Y - 11}h22v-16h-22Z`} fill="var(--g-void)" />
          <circle cx={CX - 2} cy={LAMP_Y - 19} r="5.2" fill="var(--g-clay-lit)" />
          {/* no glow ring: a halo is a rendered effect. The lamp reads
              because it is the one saturated clay disc in the plate. */}
          {/* the cap */}
          <path d={`M${CX - 13} ${LAMP_Y - 27}L${CX} ${LAMP_Y - 38}L${CX + 13} ${LAMP_Y - 27}Z`}
            fill="var(--g-sea)" />
          <rect x={CX - 0.8} y={LAMP_Y - 45} width="1.6" height="8" fill="var(--g-sea)" />
        </g>
      </motion.g>

      {/* the tower's own reflection, bounded, in the water at its foot */}
      <motion.g {...layer(0, 0.36)}>
        <Reflection cx={250} y={ROCK_TOP + 60} reach={26} spread={16} seed={71}
          opacity={0.4} />
      </motion.g>

      <motion.g {...layer(0, 0.62)}>
        <Gulls x={72} y={62} scale={0.85} />
      </motion.g>
    </Plate>
  );
}
