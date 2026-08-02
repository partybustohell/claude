import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';
import { Water, WaterDefs, Reflection, Ridge, Gulls } from './parts';

/**
 * HARBOUR — the mooring.
 *
 * For the accounts cluster. An account is a vessel: it holds a measure,
 * it is tied up somewhere, and you can see how deep it sits. Four boats
 * on one quay is the picture of a net worth spread across four banks,
 * so the plate says what the screen says.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. The quay's top surface is the most lit plane in the
 * drawing; its front face, which turns away, is the darkest stone. Each
 * hull is lit along its port sheer and falls to solid ink under the
 * turn of the bilge. Masts carry a lit left edge and nothing on the
 * right.
 *
 * ── DEPTH ────────────────────────────────────────────────────────
 * Three planes, and they are separated by value, not by outline: a pale
 * ridge on the horizon, the moored pair in full ink at mid distance,
 * and the quay in the near field where the stone is largest and the
 * dither coarsest. The far caique is deliberately small and pale — it
 * is the only thing establishing that the bay is deep.
 *
 * Plate: 390 × 250, bleeding off the left edge and the bottom.
 */

const ID = 'hb';
const HORIZON = 86;
const WATERLINE = 178;

/* ---- The quay: a stone finger from the left edge ---- */
const QUAY_TOP = 152;
const QUAY_END = 196;

/** Hull of the moored caique. Stem rakes forward at the left. */
const HULL =
  'M218 157'
  + 'C236 169 248 173 262 172'
  + 'C281 171 297 167 307 162'
  + 'L309 178L214 178Z';

/** The sheer — the lit line along the top of the planking. */
const SHEER =
  'M218 157C236 169 248 173 262 172C281 171 297 167 307 162';

export function Harbour({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={250}
      label="Fishing boats moored against a stone quay, a pale headland across the bay"
    >
      <defs>
        <Press id={ID} seed={3} />
        <WaterDefs id={ID} y={HORIZON} h={250 - HORIZON} />
      </defs>

      {/* ============================================================
          1 — THE FAR SHORE
          ============================================================ */}
      <motion.g {...layer(8, 0.04)}>
        <Ridge id={ID} y={HORIZON} lift={24} opacity={0.9} />
      </motion.g>

      {/* ============================================================
          2 — THE BAY
          ============================================================ */}
      <motion.g {...layer(12, 0.02)}>
        <Water id={ID} y={HORIZON} h={250 - HORIZON} />
      </motion.g>

      {/* ============================================================
          3 — THE FAR CAIQUE — the only thing making the bay deep
          ============================================================ */}
      <motion.g {...layer(6, 0.16)} opacity="0.78">
        <g filter={ink(ID, 'grain-fine')}>
          <path d="M62 117C69 123 78 125 89 123L91 117L60 117Z" fill="var(--g-stone)" />
          <path d="M60 121C70 125 80 125 90 122L89 123 62 124Z" fill="var(--g-sea-deep)" />
          <rect x="75" y="98" width="1.4" height="19" fill="var(--g-stone)" />
          <path d="M76.4 100L86 115L76.4 115Z" fill="var(--g-stone-hi)" />
          <path d="M74 101L67 115L74 115Z" fill="var(--g-stone-shade)" />
        </g>
        <Reflection cx={76} y={124} reach={15} spread={8} seed={91} opacity={0.55} />
      </motion.g>

      {/* ============================================================
          4 — THE MOORED CAIQUE
          ============================================================ */}
      <motion.g {...layer(20, 0.24)}>
        {/* the reflection is bounded — it dies well short of any type */}
        <Reflection cx={262} y={WATERLINE} reach={40} spread={21} seed={17} opacity={0.66} />

        <g filter={ink(ID, 'grain-fine')}>
          {/* rigging first, so the hull prints over its foot */}
          <rect x="255.2" y="74" width="2.2" height="98" fill="var(--g-stone)" />
          <rect x="255.2" y="74" width="0.9" height="98" fill="var(--g-stone-hi)" />
          <rect x="256.5" y="74" width="0.9" height="98" fill="var(--g-stone-shade)" />
          {/* boom, slung low and to starboard */}
          <path d="M256 148L300 154" stroke="var(--g-stone)" strokeWidth="1.8"
            strokeLinecap="round" />
          {/* furled sail — a bundle on the boom, not a set sail */}
          <path d="M257 142C270 142 288 147 299 152C288 153 268 151 257 149Z"
            fill="var(--g-stone)" />
          <path d="M257 142C270 142 288 147 299 152" stroke="var(--g-stone-hi)"
            strokeWidth="1.2" fill="none" />
          <path d="M258 148C270 148 287 151 298 153" stroke="var(--g-stone-shade)"
            strokeWidth="1.1" fill="none" opacity="0.9" />
          {/* forestay to the stem head */}
          <path d="M256 76L219 155" stroke="var(--g-foam)" strokeWidth="0.9"
            opacity="0.6" />
          {/* pennant, catching the same wind as everything else in the app */}
          <path d="M256.5 74L272 79L256.5 84Z" fill="var(--g-clay)" />

          {/* HULL — a whitewashed caique. It is the lightest mass in the
              picture because it has to separate from the water it sits
              on; an ink hull on an ink sea is a hole, not a boat. */}
          <path d={HULL} fill="var(--g-stone)" />
          {/* the starboard quarter turns away from the sun */}
          <path d="M262 172C281 171 297 167 307 162L309 178L266 178Z"
            fill="var(--g-stone-shade)" />
          {/* antifouling: below the boot-top the planking is dark, solid,
              and carries no speck at all */}
          <path d="M215 173C243 179 284 178 308 172L309 178L214 178Z"
            fill="var(--g-sea-deep)" />
          {/* the lit sheer, port side, toward the sun */}
          <path d={SHEER} fill="none" stroke="var(--g-stone-hi)" strokeWidth="2.4"
            strokeLinecap="round" />
          {/* a wale below the sheer, in the warm ink — the one trim colour */}
          <path d="M220 162C238 172 249 176 263 175C281 174 296 171 305 167"
            fill="none" stroke="var(--g-clay)" strokeWidth="2.2" />
          {/* wheelhouse, aft */}
          <path d="M275 148L300 148L299 162L274 163Z" fill="var(--g-stone)" />
          <path d="M292 148L300 148L299 162L291 162.5Z" fill="var(--g-stone-shade)" />
          <path d="M275 148L300 148L300 149.6L275 149.6Z" fill="var(--g-stone-hi)" />
          <rect x="279" y="152" width="6" height="6" fill="var(--g-sea)" />
          <rect x="288" y="152" width="5" height="6" fill="var(--g-sea)" />
        </g>

        {/* the crest of dots piling at the raked stem — it is made fast,
            but the water is still working against it */}
        <Reflection cx={218} y={172} reach={11} spread={7} seed={55}
          fill="var(--g-foam)" opacity={0.8} />
      </motion.g>

      {/* ============================================================
          5 — THE QUAY, near field
          ============================================================ */}
      <motion.g {...layer(26, 0.1)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* front face — the plane turned fully away from the sun. It is
              the cream turned toward the cobalt, not a neutral: whitewashed
              stone in shade, which is what the rest of the app is built of. */}
          <path d={`M0 ${QUAY_TOP + 11}H${QUAY_END - 7}L${QUAY_END - 12} ${WATERLINE + 2}H0Z`}
            fill="var(--g-stone-shade)" />
          {/* top surface — the most lit plane in the picture */}
          <path d={`M0 ${QUAY_TOP}H${QUAY_END}L${QUAY_END - 7} ${QUAY_TOP + 11}H0Z`}
            fill="var(--g-stone-hi)" />
          {/* the coping course, catching the edge light */}
          <path d={`M0 ${QUAY_TOP}H${QUAY_END}`} stroke="var(--g-stone-hi)"
            strokeWidth="2.6" />
          {/* the shadow the coping throws onto its own face */}
          <path d={`M0 ${QUAY_TOP + 11}H${QUAY_END - 7}`} stroke="var(--g-stone-dark)"
            strokeWidth="2" opacity="0.45" />
          {/* the joints between blocks — drawn on the shaded face only,
              where a line reads as a joint rather than as a scratch */}
          <g stroke="var(--g-stone-dark)" strokeWidth="1" opacity="0.4">
            {[36, 82, 128, 172].map((x) => (
              <path key={x} d={`M${x} ${QUAY_TOP + 11}L${x - 3} ${WATERLINE + 2}`} />
            ))}
            <path d={`M0 ${QUAY_TOP + 24}H${QUAY_END - 10}`} />
          </g>
          {/* the sea has been at the foot of this wall a long time */}
          <path d={`M0 ${WATERLINE - 5}H${QUAY_END - 11}`} stroke="var(--g-green-deep)"
            strokeWidth="6" opacity="0.28" filter={ink(ID, 'stipple')} />
        </g>

        {/* where the stone enters the water */}
        <Reflection cx={96} y={WATERLINE + 1} reach={16} spread={70} seed={33}
          fill="var(--g-sea-deep)" opacity={0.5} />
        <path d={`M0 ${WATERLINE + 1}H${QUAY_END - 9}`} stroke="var(--g-foam)"
          strokeWidth="4" opacity="0.55" filter={ink(ID, 'stipple')} />

        {/* bollards, and the mooring line doing real work */}
        <g filter={ink(ID, 'grain')}>
          {[62, 150].map((x) => (
            <g key={x}>
              <rect x={x - 4} y={QUAY_TOP - 13} width="8" height="14"
                rx="1.6" fill="var(--g-sea)" />
              <rect x={x - 4} y={QUAY_TOP - 13} width="1.6" height="14"
                fill="var(--g-sea-lift)" />
              <ellipse cx={x} cy={QUAY_TOP - 13} rx="5.2" ry="2" fill="var(--g-sea-lift)" />
            </g>
          ))}
        </g>
        {/* a rope hangs in a catenary. A straight line would read as wire. */}
        <path d="M152 141C172 160 196 162 218 155" fill="none"
          stroke="var(--g-foam)" strokeWidth="1.8" strokeLinecap="round" />
      </motion.g>

      {/* ============================================================
          6 — THE SKY
          ============================================================ */}
      <motion.g {...layer(0, 0.5)}>
        <Gulls x={128} y={48} scale={0.9} />
      </motion.g>
    </Plate>
  );
}
