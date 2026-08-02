import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';
import { Awning, Void } from './parts';

/**
 * SHOPFRONT — where the money actually goes.
 *
 * For the merchant cluster: a merchant, a payee, a bill, a scanned
 * code. Every one of those screens is about a *place* — somewhere a
 * transaction happened, with a door and an awning and someone behind
 * the counter — and drawing the place is the difference between a
 * ledger line and a memory of buying something.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left, and low, so the awning throws a long soft-edged shadow
 * down the shopfront and to the right. The left reveal of the doorway
 * is lit; the right is not. The crates on the pavement each throw the
 * same direction and the same length, which is the detail that stops a
 * row of boxes reading as stickers.
 *
 * ── THE ONE WARM MASS ────────────────────────────────────────────
 * The awning is the only place in the app where the clay ink carries a
 * whole shape rather than a stripe or a figure. It earns it: it is the
 * thing you see from down the street, and it puts the warm ink at the
 * top of the plate where the eye lands first.
 *
 * Plate: 390 × 250, bleeding off both edges and the bottom.
 */

const ID = 'sf';
const PAVEMENT = 218;
const FACADE = 46;          // top of the shopfront wall

export function Shopfront({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={250}
      label="A whitewashed shopfront under a striped awning, crates of fruit on the pavement outside"
    >
      <defs>
        <Press id={ID} seed={53} />
        <linearGradient id={`${ID}-cast`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--g-stone-mid)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--g-stone-mid)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ============================================================
          1 — THE FACADE
          ============================================================ */}
      <motion.g {...layer(10, 0.02)}>
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="0" y={FACADE} width="390" height={PAVEMENT - FACADE}
            fill="var(--g-stone)" />
          <rect x="0" y={FACADE} width="390" height="3" fill="var(--g-stone-hi)" />
          {/* the stone courses, drawn lightly and only above the awning */}
          <g stroke="var(--g-stone-shade)" strokeWidth="1" opacity="0.4">
            <path d={`M0 ${FACADE + 22}H390M0 ${FACADE + 44}H390`} />
            <path d={`M52 ${FACADE}V${FACADE + 44}M148 ${FACADE}V${FACADE + 44}M256 ${FACADE}V${FACADE + 44}M340 ${FACADE}V${FACADE + 44}`} />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE UPPER WINDOW with its shutters
          ============================================================ */}
      <motion.g {...layer(8, 0.1)}>
        <g filter={ink(ID, 'grain-fine')}>
          <Void x={286} y={FACADE + 14} w={38} h={44} arch />
          {/* shutters, thrown back against the wall — the left one lit */}
          <rect x={272} y={FACADE + 16} width="13" height="42" fill="var(--g-sea)" />
          <rect x={272} y={FACADE + 16} width="2" height="42" fill="var(--g-sea-lift)" />
          <rect x={325} y={FACADE + 16} width="13" height="42" fill="var(--g-sea-deep)" />
          {/* a rail, and something drying on it */}
          <rect x={282} y={FACADE + 58} width="46" height="2.2" fill="var(--g-stone-shade)" />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE AWNING, and the shadow it throws
          ============================================================ */}
      <motion.g {...layer(14, 0.18)}>
        <rect x="16" y="132" width="252" height="46" fill={`url(#${ID}-cast)`} />
        <Awning x={16} y={118} w={252} drop={26} stripes={9} />
        {/* the tie rods that hold it out from the wall */}
        <g stroke="var(--g-stone-shade)" strokeWidth="1.4">
          <path d="M22 118L30 100M262 118L254 100" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE SHOP ITSELF
          ============================================================ */}
      <motion.g {...layer(16, 0.24)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* the glazed front — dark, because inside is always darker */}
          <rect x="30" y="150" width="104" height={PAVEMENT - 150} fill="var(--g-void)" />
          {/* what little light gets in falls on the near jamb */}
          <rect x="30" y="150" width="2.4" height={PAVEMENT - 150} fill="var(--g-sea-lift)" />
          {/* glazing bars */}
          <g stroke="var(--g-stone-shade)" strokeWidth="1.6" opacity="0.8">
            <path d="M64 150v68M100 150v68M30 178h104" />
          </g>
          {/* the doorway, open */}
          <path d="M162 218v-56a22 22 0 0 1 44 0v56Z" fill="var(--g-void)" />
          <path d="M162 218v-56a22 22 0 0 1 22-22v78Z" fill="var(--g-sea)" opacity="0.42" />
          <path d="M162 218v-56a22 22 0 0 1 44 0v56" fill="none"
            stroke="var(--g-stone-hi)" strokeWidth="2.6" />
          {/* the step, worn pale by everyone who ever came in */}
          <rect x="156" y={PAVEMENT - 5} width="56" height="5" fill="var(--g-stone-hi)" />

          {/* a lamp over the door */}
          <rect x="182" y="118" width="2" height="12" fill="var(--g-stone-shade)" />
          <path d="M174 130h20l-4 11h-12Z" fill="var(--g-sea)" />
          <path d="M174 130h20l-1.4 4h-17.2Z" fill="var(--g-sea-lift)" />
        </g>
      </motion.g>

      {/* ============================================================
          5 — THE PAVEMENT, and what is stacked on it
          ============================================================ */}
      <motion.g {...layer(20, 0.3)}>
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="0" y={PAVEMENT} width="390" height={250 - PAVEMENT}
            fill="var(--g-stone-shade)" />
          <rect x="0" y={PAVEMENT} width="390" height="2" fill="var(--g-stone-hi)" />
          <g stroke="var(--g-stone-dark)" strokeWidth="1" opacity="0.3">
            <path d={`M62 ${PAVEMENT}V250M188 ${PAVEMENT}V250M304 ${PAVEMENT}V250`} />
          </g>
        </g>

        {/* crates: three, each throwing the same shadow the same way */}
        {[{ x: 232, w: 46, h: 26 }, { x: 284, w: 38, h: 20 }, { x: 328, w: 42, h: 30 }]
          .map((c, i) => (
            <g key={i} filter={ink(ID, 'grain-fine')}>
              <path d={`M${c.x + c.w} ${PAVEMENT}l16 0l0 4l-${c.w + 16} 0l0-4Z`}
                fill="var(--g-stone-dark)" opacity="0.3" />
              <rect x={c.x} y={PAVEMENT - c.h} width={c.w} height={c.h}
                fill="var(--g-stone)" />
              <rect x={c.x} y={PAVEMENT - c.h} width="2" height={c.h}
                fill="var(--g-stone-hi)" />
              <rect x={c.x + c.w - 4} y={PAVEMENT - c.h} width="4" height={c.h}
                fill="var(--g-stone-shade)" />
              <rect x={c.x} y={PAVEMENT - c.h} width={c.w} height="2"
                fill="var(--g-stone-hi)" />
              {/* what is in it */}
              <g fill={i === 1 ? 'var(--g-green)' : 'var(--g-clay)'}>
                {[0.2, 0.45, 0.7].map((t, j) => (
                  <circle key={j} cx={c.x + c.w * t + 4} cy={PAVEMENT - c.h - 3}
                    r={4.2 - j * 0.4} />
                ))}
              </g>
            </g>
          ))}
      </motion.g>
    </Plate>
  );
}
