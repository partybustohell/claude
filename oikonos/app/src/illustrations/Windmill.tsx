import { motion, useReducedMotion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';
import { Ridge, Cypress } from './parts';

/**
 * WINDMILL — what turns.
 *
 * For the recurring cluster: standing orders, subscriptions, bills that
 * arrive whether or not you thought about them. A mill is the only
 * honest picture of a charge that repeats — it turns because the wind
 * is blowing, not because anyone decided today that it should.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. The tower is a cylinder, so its lit side is a crescent
 * down the left and its shade closes gradually round to the right —
 * gradually, because a cylinder has no edge to break the value at. The
 * conical cap takes the same treatment. The mill throws its shadow
 * right, down the slope.
 *
 * ── THE SAILS ────────────────────────────────────────────────────
 * Twelve, on an exact pitch, because a Cycladic mill has twelve and
 * eleven would look like a mistake. They turn — slowly, one revolution
 * a minute, and they stop dead under prefers-reduced-motion, which is
 * the whole reason the rotation lives on a wrapper and not on a CSS
 * animation that would keep running under it.
 *
 * Plate: 390 × 250, bleeding off the bottom.
 */

const ID = 'wm';

/* The far ridge sits on the same line the near ground starts from, so
   the two greens meet. Leave a gap and a river of bare paper runs
   between them, which reads as a printing fault rather than a valley. */
const HORIZON = 200;

const GROUND =
  'M0 250V196C46 186 96 180 146 184C196 188 232 200 276 198'
  + 'C320 196 356 186 390 172V250Z';

/** Height of the ground's top edge at x — everything stands ON this. */
function groundAt(x: number) {
  const pts = [[0, 196], [46, 186], [96, 180], [146, 184],
    [196, 188], [232, 200], [276, 198], [320, 196], [356, 186], [390, 172]];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
    }
  }
  return pts[pts.length - 1][1];
}

/* The mill */
const CX = 252;
const BASE = groundAt(CX);
const TOWER_H = 86;
const TOP_R = 28;
const BOT_R = 35;
const HUB = { x: CX, y: BASE - TOWER_H - 6 };
const SAILS = 12;
const SAIL_R = 62;

export function Windmill({ className = '' }: { className?: string }) {
  const layer = useLayer();
  const reduce = useReducedMotion();

  return (
    <Plate
      className={className} w={390} h={250}
      label="A whitewashed Cycladic windmill turning on a low green ridge"
    >
      <defs>
        <Press id={ID} seed={29} />
        <linearGradient id={`${ID}-tower`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--g-stone-hi)" />
          <stop offset="0.26" stopColor="var(--g-stone)" />
          <stop offset="0.72" stopColor="var(--g-stone-shade)" />
          <stop offset="1" stopColor="var(--g-stone-mid)" />
        </linearGradient>
        <linearGradient id={`${ID}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--g-sea-lift)" />
          <stop offset="0.42" stopColor="var(--g-sea)" />
          <stop offset="1" stopColor="var(--g-sea-deep)" />
        </linearGradient>
        <clipPath id={`${ID}-ground`}><path d={GROUND} /></clipPath>
      </defs>

      {/* ============================================================
          1 — THE RIDGE BEHIND
          ============================================================ */}
      <motion.g {...layer(8, 0.02)}>
        <Ridge id={ID} y={HORIZON} lift={34} opacity={0.75} />
      </motion.g>

      {/* ============================================================
          2 — THE GROUND
          ============================================================ */}
      <motion.g {...layer(20, 0.06)}>
        <g filter={ink(ID, 'grain')}>
          <path d={GROUND} fill="var(--g-green)" />
          <g clipPath={`url(#${ID}-ground)`}>
            {/* the far slope falls away and loses the sun */}
            <path d="M276 198C320 196 356 186 390 172V250H276Z"
              fill="var(--g-green-deep)" opacity="0.3" />
            {/* the near field, ploughed in the contour */}
            <g fill="none" stroke="var(--g-green-deep)" strokeWidth="1.6" opacity="0.3">
              <path d="M0 216C60 206 120 202 180 204C240 206 310 200 390 188" />
              <path d="M0 234C60 224 120 220 180 222C240 224 310 218 390 206" />
            </g>
            <path d="M0 196C46 186 96 180 146 184C196 188 232 200 276 198C320 196 356 186 390 172"
              fill="none" stroke="var(--g-green-lit)" strokeWidth="2.4" opacity="0.6" />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE MILL
          ============================================================ */}
      <motion.g {...layer(16, 0.16)}>
        {/* the shadow, thrown right and downslope */}
        <g clipPath={`url(#${ID}-ground)`}>
          <ellipse cx={CX + 34} cy={BASE + 2} rx="52" ry="9"
            fill="var(--g-green-deep)" opacity="0.36" />
          <ellipse cx={CX + 34} cy={BASE + 2} rx="52" ry="9"
            fill="var(--g-green-deep)" opacity="0.3" filter={ink(ID, 'stipple')} />
        </g>

        {/* ---- sails: behind the tower, so the tower reads in front ---- */}
        <motion.g
          style={{ originX: `${HUB.x}px`, originY: `${HUB.y}px` }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined
            : { duration: 60, ease: 'linear', repeat: Infinity }}
        >
          {/* The sky here is bare cream, so white canvas on it is invisible —
              the first pull of this plate came back a bare spider of spars.
              The canvas is therefore drawn as cream INSIDE a cobalt edge,
              which is how a white sail reads against a pale sky in print. */}
          {Array.from({ length: SAILS }, (_, i) => {
            const a = (i / SAILS) * Math.PI * 2;
            const x2 = HUB.x + Math.cos(a) * SAIL_R;
            const y2 = HUB.y + Math.sin(a) * SAIL_R;
            const jib = `M${HUB.x + Math.cos(a) * 20} ${HUB.y + Math.sin(a) * 20}`
              + `L${x2} ${y2}`
              + `L${HUB.x + Math.cos(a + 0.42) * (SAIL_R * 0.74)} ${HUB.y + Math.sin(a + 0.42) * (SAIL_R * 0.74)}Z`;
            return (
              <g key={i}>
                <path d={jib} fill="var(--g-stone)" stroke="var(--g-sea)"
                  strokeWidth="1.3" strokeLinejoin="round" />
                {/* the spar itself, in full ink so the wheel has structure */}
                <path d={`M${HUB.x} ${HUB.y}L${x2} ${y2}`}
                  stroke="var(--g-sea)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            );
          })}
          <circle cx={HUB.x} cy={HUB.y} r="5" fill="var(--g-sea)" />
          <circle cx={HUB.x - 1.2} cy={HUB.y - 1.2} r="2" fill="var(--g-sea-lift)" />
        </motion.g>

        <g filter={ink(ID, 'grain-fine')}>
          {/* ---- tower: a cylinder, so the value turns rather than steps ---- */}
          <path
            d={`M${CX - TOP_R} ${BASE - TOWER_H}`
              + `L${CX - BOT_R} ${BASE}`
              + `L${CX + BOT_R} ${BASE}`
              + `L${CX + TOP_R} ${BASE - TOWER_H}Z`}
            fill={`url(#${ID}-tower)`}
          />
          {/* the whitewash is renewed every spring at the foot only */}
          <path d={`M${CX - BOT_R + 1} ${BASE - 12}L${CX + BOT_R - 1} ${BASE - 12}`}
            stroke="var(--g-stone-hi)" strokeWidth="1.4" opacity="0.5" />

          {/* two small windows, ink, following the curve of the wall */}
          <rect x={CX - 17} y={BASE - 50} width="8" height="11" rx="1"
            fill="var(--g-void)" />
          <rect x={CX + 6} y={BASE - 48} width="7" height="10" rx="1"
            fill="var(--g-void)" opacity="0.82" />
          {/* the door */}
          <path d={`M${CX - 8} ${BASE}v-15a8 8 0 0 1 16 0v15Z`} fill="var(--g-void)" />

          {/* ---- cap: a cone in the cobalt, the same roof as the chapel ---- */}
          <path
            d={`M${CX - TOP_R - 4} ${BASE - TOWER_H}`
              + `Q${CX} ${BASE - TOWER_H - 26} ${CX + TOP_R + 4} ${BASE - TOWER_H}Z`}
            fill={`url(#${ID}-cap)`}
          />
          {/* the eaves course, catching the light along its whole length */}
          <rect x={CX - TOP_R - 6} y={BASE - TOWER_H - 1.6} width={(TOP_R + 6) * 2}
            height="3.4" rx="1.6" fill="var(--g-stone-hi)" />
          {/* thatch battens on the cone — three, flat, no highlight */}
          <g stroke="var(--g-sea-lift)" strokeWidth="0.9" opacity="0.45" fill="none">
            <path d={`M${CX - 15} ${BASE - TOWER_H}Q${CX - 9} ${BASE - TOWER_H - 14} ${CX - 2} ${BASE - TOWER_H - 22}`} />
            <path d={`M${CX + 2} ${BASE - TOWER_H}Q${CX + 5} ${BASE - TOWER_H - 12} ${CX + 3} ${BASE - TOWER_H - 22}`} />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          4 — A CYPRESS, holding the left of the composition
          ============================================================ */}
      <motion.g {...layer(12, 0.34)}>
        <Cypress id={ID} x={92} base={groundAt(92) + 2} h={72} />
        <Cypress id={ID} x={116} base={groundAt(116) + 3} h={48} />
      </motion.g>
    </Plate>
  );
}
