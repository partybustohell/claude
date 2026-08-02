import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';
import { Contact } from './parts';

/**
 * SHOPFRONT — where the money actually goes.
 *
 * For the merchant cluster: a merchant, a payee, a bill, a scanned code.
 * Every one of those screens is about a *place* — somewhere a
 * transaction happened — and drawing the place is the difference
 * between a ledger line and a memory of buying something.
 *
 * ── WHY THIS PLATE WAS REDRAWN ───────────────────────────────────
 * It lost two blind duels, both "clear", and the two verdicts agreed
 * almost word for word. The faults were not details:
 *
 *   · "assembled, not drawn — three horizontal bands stack without
 *     overlap or terrace." The old plate was a flat elevation: wall
 *     band, shop band, pavement band, each a full-width rectangle,
 *     nothing in front of anything. It is a corner in three-quarter
 *     view now. The right return recedes, the steps come forward, the
 *     crates overlap each other and the doorway, the tree overlaps the
 *     wall. Depth is built from overlap, which is the only kind a flat
 *     print can have.
 *
 *   · "no focal point." There is one now and everything serves it: the
 *     doorway is the darkest hole in the plate, it is the only place
 *     the warm ink glows from inside, the awning stripes run toward it
 *     and the steps lead into it.
 *
 *   · "the three market stalls are illegible stubs — pale slabs with
 *     red and green dots on sticks, overlapping into mush." Two crates,
 *     not three, big enough to read, with produce drawn at a size a
 *     thumbnail survives.
 *
 *   · "nothing casts a shadow anywhere, so every element is a sticker."
 *     One sun, upper left. The awning throws onto the front AND onto
 *     the pavement; the steps throw onto each other; the crates, the
 *     pot and the sign bracket all throw right and down.
 *
 *   · "the pavement is a flat lavender-blue that reads as grey." It is
 *     warm stone now — the same --g-wall the olive terraces are built
 *     from, which exists precisely because a cobalt tint on cream
 *     desaturates to neutral.
 *
 * Plate: 390 × 250, bleeding off the left edge and the bottom.
 */

const ID = 'sf';
const W = 390;
const H = 250;

const PAVE = 206;           // where the building meets the ground
const EAVES = 30;           // top of the front wall
const FRONT_L = 40;
const FRONT_R = 250;
const RETURN = 108;         // how far the right flank recedes
const RISE = 34;            // ...and how far it climbs, foreshortened

/**
 * The receding right flank.
 *
 * Its far bottom corner sits ABOVE the near one, because the ground
 * recedes too. Extending the wall by its own height from a raised top
 * corner — which is what `v(PAVE - EAVES)` did — pushed the far corner
 * thirty units below the pavement, so the building's flank ran down
 * through the street it stands on.
 */
const GROUND_RISE = 22;
const FLANK =
  `M${FRONT_R} ${EAVES}`
  + `L${FRONT_R + RETURN} ${EAVES + RISE}`
  + `L${FRONT_R + RETURN} ${PAVE - GROUND_RISE}`
  + `L${FRONT_R} ${PAVE}Z`;

const DOOR = { x: 150, w: 46, h: 76 };
const STEP_TOP = PAVE - 4;

export function Shopfront({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={W} h={H}
      label="A corner shop under a striped awning, its doorway lit from within, crates of fruit stacked on the pavement outside"
    >
      <defs>
        <Press id={ID} seed={53} />
        {/* the awning's cast: a mask on a screened fill, so the shadow
            thins by losing dots rather than by fading */}
        <linearGradient id={`${ID}-castg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${ID}-castm`}>
          <rect x={FRONT_L} y="126" width={FRONT_R - FRONT_L} height="54"
            fill={`url(#${ID}-castg)`} />
        </mask>
        <clipPath id={`${ID}-front`}>
          <rect x={FRONT_L} y={EAVES} width={FRONT_R - FRONT_L} height={PAVE - EAVES} />
        </clipPath>
        {/* The canvas, so the stripes can be CLIPPED to it. Drawn as
            free parallelograms they drifted off the cloth and read as
            bunting strung across the front. */}
        <clipPath id={`${ID}-awning`}>
          <path d="M44 96H236l10 30c-34 8-68 12-102 12s-68-4-102-12Z" />
        </clipPath>
      </defs>

      {/* ============================================================
          1 — THE PAVEMENT. Warm stone, not a cobalt tint.
          ============================================================ */}
      <motion.g {...layer(16, 0.02)}>
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="0" y={PAVE} width={W} height={H - PAVE} fill="var(--g-wall)" />
          <rect x="0" y={PAVE} width={W} height="2.2" fill="var(--g-wall-lit)" />
          <g stroke="var(--g-wall-deep)" strokeWidth="1.2" opacity="0.45">
            <path d={`M56 ${PAVE + 14}H${W}M0 ${PAVE + 30}H${W}`} />
            <path d={`M104 ${PAVE}V${H}M232 ${PAVE}V${H}M330 ${PAVE}V${H}`} />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE RECEDING FLANK, behind everything on the front
          ============================================================ */}
      <motion.g {...layer(12, 0.06)}>
        <g filter={ink(ID, 'grain-fine')}>
          <path d={FLANK} fill="var(--g-stone-shade)" />
          {/* the eaves line running back, which is what states the angle */}
          <path d={`M${FRONT_R} ${EAVES}l${RETURN} ${RISE}`}
            stroke="var(--g-stone-hi)" strokeWidth="2.6" fill="none" />
          {/* two windows on the flank, foreshortening as they go */}
          <path d={`M${FRONT_R + 26} ${EAVES + 40}l22 7v30l-22-6Z`} fill="var(--g-void)" />
          <path d={`M${FRONT_R + 62} ${EAVES + 52}l17 5v26l-17-5Z`}
            fill="var(--g-void)" opacity="0.8" />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE FRONT WALL
          ============================================================ */}
      <motion.g {...layer(14, 0.1)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* Flat. A ScreenRamp went here first and the facade came back
              as camouflage — a screen describes a mass that TURNS, and a
              wall does not turn, it is one plane facing one way. The
              only value change it earns is the strip nearest the corner,
              where the return begins to shade it, and that has a hard
              edge because the corner does. */}
          <rect x={FRONT_L} y={EAVES} width={FRONT_R - FRONT_L} height={PAVE - EAVES}
            fill="var(--g-stone)" />
          <rect x={FRONT_R - 26} y={EAVES} width="26" height={PAVE - EAVES}
            fill="var(--g-stone-shade)" opacity="0.5" />
          <rect x={FRONT_L} y={EAVES} width={FRONT_R - FRONT_L} height="3"
            fill="var(--g-stone-hi)" />
          {/* the parapet throws a hard line of its own shade */}
          <rect x={FRONT_L} y={EAVES + 3} width={FRONT_R - FRONT_L} height="2.4"
            fill="var(--g-stone-shade)" opacity="0.7" />

          {/* the upper window, with a sill that casts */}
          <g clipPath={`url(#${ID}-front)`}>
            <path d="M74 52h44v34H74Z" fill="var(--g-void)" />
            <rect x="70" y="86" width="52" height="4" fill="var(--g-stone-hi)" />
            <rect x="72" y="90" width="52" height="4" fill="var(--g-stone-shade)"
              opacity="0.8" />
            {/* one shutter, thrown back, overlapping the wall */}
            <rect x="118" y="52" width="12" height="34" fill="var(--g-sea)" />
            <rect x="118" y="52" width="2.4" height="34" fill="var(--g-sea-lift)" />
          </g>
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE AWNING and everything it throws
          ============================================================ */}
      <motion.g {...layer(12, 0.16)}>
        {/* onto the wall below it */}
        <g mask={`url(#${ID}-castm)`} clipPath={`url(#${ID}-front)`}>
          <rect x={FRONT_L} y="126" width={FRONT_R - FRONT_L} height="54"
            fill="var(--g-stone-shade)" opacity="0.8"
            filter={ink(ID, 'screen-fine-b')} />
        </g>

        <g filter={ink(ID, 'grain-fine')}>
          {/* the bracket arms first, so the canvas prints over their tops
              — they hold it OUT from the wall and must meet the wall */}
          <g stroke="var(--g-stone-shade)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M52 122L44 96M228 122L236 96" />
          </g>

          {/* the canvas: a shallow curve, hung from the wall and falling
              to a scalloped hem */}
          {/* The cloth is the brightest cream in the plate. Printed in
              the wall's own value it vanished into the wall and the
              stripes read as bunting strung across the front. */}
          <path
            d="M44 96H236l10 30c-34 8-68 12-102 12s-68-4-102-12Z"
            fill="var(--g-stone-hi)"
          />
          {/* the stripes, clipped to the cloth */}
          <g clipPath={`url(#${ID}-awning)`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={44 + i * 40.4} y="92" width="20.2" height="52"
                fill="var(--g-clay)" />
            ))}
          </g>
          {/* the lit top edge, and the hem in the deeper clay */}
          {/* Cream cloth on a cream wall needs a boundary or it is not
              there — without these the stripes read as bunting strung
              across the front. A rail above, a hem below, both cobalt. */}
          <rect x="42" y="92" width="196" height="4" rx="2" fill="var(--g-sea)" />
          <path d="M44 96H236l10 30c-34 8-68 12-102 12s-68-4-102-12Z"
            fill="none" stroke="var(--g-sea)" strokeWidth="1.6" opacity="0.55" />
          <path d="M42 126c34 8 68 12 102 12s68-4 102-12"
            fill="none" stroke="var(--g-sea)" strokeWidth="3" />
        </g>

        {/* and onto the pavement, right and down */}
        <Contact cx={132} cy={PAVE + 5} rx={104} ry={5}
          id={ID} tone="var(--g-wall-deep)" opacity={0.32} />
      </motion.g>

      {/* ============================================================
          5 — THE SHOP: window, door, steps. The door is the subject.
          ============================================================ */}
      <motion.g {...layer(16, 0.22)}>
        <g filter={ink(ID, 'grain-fine')}>
          {/* the glazed front — dark, because inside is always darker */}
          <rect x="58" y="146" width="76" height={PAVE - 146} fill="var(--g-void)" />
          <rect x="58" y="146" width="2.6" height={PAVE - 146} fill="var(--g-sea-lift)" />
          <g stroke="var(--g-stone-shade)" strokeWidth="1.8" opacity="0.85">
            <path d="M96 146v60M58 174h76" />
          </g>
          {/* what is on the shelf inside, in silhouette */}
          <g fill="var(--g-sea-lift)" opacity="0.5">
            <rect x="64" y="160" width="8" height="12" rx="1" />
            <rect x="76" y="164" width="6" height="8" rx="1" />
            <rect x="104" y="158" width="7" height="14" rx="1" />
          </g>

          {/* THE DOORWAY — the darkest hole in the plate */}
          <path
            d={`M${DOOR.x} ${PAVE}v-${DOOR.h - DOOR.w / 2}`
              + `a${DOOR.w / 2} ${DOOR.w / 2} 0 0 1 ${DOOR.w} 0v${DOOR.h - DOOR.w / 2}Z`}
            fill="var(--g-void)"
          />
          {/* The one warm light in the app, and it is inside a shop.
              Screened, it came back as a red lattice — a dot field needs
              room, and this is 34 units wide. Flat clay, low, so it
              reads as a lit floor seen through a doorway. */}
          <rect x={DOOR.x + 7} y={PAVE - 26} width={DOOR.w - 14} height="22"
            fill="var(--g-clay)" opacity="0.7" />
          {/* the reveal: the left jamb catches the sun, the right does not */}
          <path
            d={`M${DOOR.x} ${PAVE}v-${DOOR.h - DOOR.w / 2}`
              + `a${DOOR.w / 2} ${DOOR.w / 2} 0 0 1 ${DOOR.w} 0v${DOOR.h - DOOR.w / 2}`}
            fill="none" stroke="var(--g-stone-hi)" strokeWidth="3"
          />
          <path d={`M${DOOR.x + DOOR.w} ${PAVE}v-${DOOR.h - DOOR.w / 2}`}
            stroke="var(--g-stone-shade)" strokeWidth="2.4" />

          {/* two steps, each throwing onto the one below */}
          {[0, 1].map((i) => {
            const y = STEP_TOP + i * 7;
            const inset = 10 - i * 10;
            return (
              <g key={i}>
                <rect x={DOOR.x - 12 + inset} y={y} width={DOOR.w + 24 - inset * 2}
                  height="7" fill="var(--g-wall)" />
                <rect x={DOOR.x - 12 + inset} y={y} width={DOOR.w + 24 - inset * 2}
                  height="2" fill="var(--g-wall-lit)" />
                <rect x={DOOR.x - 12 + inset} y={y + 5} width={DOOR.w + 24 - inset * 2}
                  height="2" fill="var(--g-wall-deep)" opacity="0.7" />
              </g>
            );
          })}

          {/* the hanging sign, on a bracket that meets the wall */}
          <path d="M214 62h22" stroke="var(--g-stone-shade)" strokeWidth="2.2" />
          <path d="M232 62v8" stroke="var(--g-stone-shade)" strokeWidth="1.6" />
          <rect x="218" y="70" width="28" height="18" rx="2" fill="var(--g-clay)" />
          <rect x="218" y="70" width="28" height="2.4" rx="1.2" fill="var(--g-clay-lit)" />
        </g>
      </motion.g>

      {/* ============================================================
          6 — THE PAVEMENT GOODS. Two crates, stacked and overlapping.
          ============================================================ */}
      <motion.g {...layer(18, 0.3)}>
        {/* The stack stands clear of the flank at x=250. Set against it
            the crates were pale-on-pale and disappeared. */}
        {/* the lower crate */}
        <Contact cx={228} cy={PAVE + 3} rx={46} ry={5} id={ID}
          tone="var(--g-wall-deep)" opacity={0.42} />
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="196" y={PAVE - 28} width="72" height="28" fill="var(--g-stone)" />
          <rect x="196" y={PAVE - 28} width="72" height="2.6" fill="var(--g-stone-hi)" />
          <rect x="196" y={PAVE - 28} width="2.6" height="28" fill="var(--g-stone-hi)" />
          <rect x="259" y={PAVE - 28} width="9" height="28" fill="var(--g-stone-shade)" />
          <g stroke="var(--g-stone-shade)" strokeWidth="1.6" opacity="0.7">
            <path d={`M196 ${PAVE - 16}h72`} />
          </g>
        </g>

        {/* the upper crate, set back, overlapping the lower one and
            throwing onto it */}
        <g filter={ink(ID, 'grain-fine')}>
          <rect x="216" y={PAVE - 54} width="58" height="26"
            fill="var(--g-wall-deep)" opacity="0.34" />
          <rect x="210" y={PAVE - 54} width="58" height="26" fill="var(--g-stone)" />
          <rect x="210" y={PAVE - 54} width="58" height="2.6" fill="var(--g-stone-hi)" />
          <rect x="210" y={PAVE - 54} width="2.6" height="26" fill="var(--g-stone-hi)" />
          <rect x="260" y={PAVE - 54} width="8" height="26" fill="var(--g-stone-shade)" />
        </g>

        {/* What is in them. They sit IN the crate — at y-64 against a
            crate whose rim is y-54 they were hovering ten units clear. */}
        <g filter={ink(ID, 'grain-fine')}>
          {[[224, 'var(--g-clay)'], [242, 'var(--g-clay)'], [258, 'var(--g-green)']]
            .map(([cx, fill], i) => (
              <g key={i}>
                <circle cx={cx as number} cy={PAVE - 58} r="9" fill={fill as string} />
                <circle cx={(cx as number) - 2.8} cy={PAVE - 61} r="2.8"
                  fill="var(--g-stone-hi)" opacity="0.5" />
              </g>
            ))}
          {/* the rim prints over their feet, so they are in the box */}
          <rect x="210" y={PAVE - 54} width="58" height="3" fill="var(--g-stone-hi)" />
        </g>
      </motion.g>

      {/* ============================================================
          7 — THE POT, overlapping the wall so the front is pinned
          ============================================================ */}
      <motion.g {...layer(12, 0.38)}>
        <Contact cx={330} cy={PAVE + 4} rx={22} ry={4.4} id={ID}
          tone="var(--g-wall-deep)" opacity={0.4} />
        <g filter={ink(ID, 'grain')}>
          {/* the plant, overlapping the flank wall behind it */}
          {/* A bush, not a cypress — a spire in a bucket read as a
              Christmas tree parked outside a grocer's. */}
          <path
            d="M330 132c16 0 27 12 27 24 0 13-12 22-27 22s-27-9-27-22c0-12 11-24 27-24Z"
            fill="var(--g-green-deep)"
          />
          <path
            d="M316 142c6-6 14-10 22-10-11 2-19 9-22 19-2 7-1 13 2 18-6-5-9-12-9-18 0-3 3-7 7-9Z"
            fill="var(--g-green)" opacity="0.9"
          />
          {/* the pot, in front of it */}
          <path d={`M316 ${PAVE - 28}h28l-4 28h-20Z`} fill="var(--g-clay)" />
          <rect x="314" y={PAVE - 31} width="32" height="4" rx="1.4"
            fill="var(--g-clay)" />
          <rect x="314" y={PAVE - 31} width="32" height="1.6" rx="0.8"
            fill="var(--g-clay-lit)" />
          <path d={`M338 ${PAVE - 27}l-3 27h5l3-27Z`} fill="var(--g-clay-deep)"
            opacity="0.55" />
        </g>
      </motion.g>
    </Plate>
  );
}
