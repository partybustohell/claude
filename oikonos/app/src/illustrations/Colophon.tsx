import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer } from './press';

/**
 * COLOPHON — the four inks, and the press that lays them.
 *
 * For the app cluster: about, appearance, help, settings, the screens
 * that are about Oikonos rather than about money. Everywhere else the
 * drawing is a window onto somewhere; here it is the thing itself —
 * four ink drums overprinting, out of register, exactly as a riso lays
 * a four-colour job down.
 *
 * ── WHY MISREGISTRATION IS THE SUBJECT ───────────────────────────
 * A riso cannot hold register. Each drum makes its own pass, the paper
 * shifts a hair between passes, and the colours land a millimetre off
 * each other. That fault is the entire reason the medium looks like
 * itself, so this plate does not correct it — it makes it the picture.
 * Each disc is offset from true centre by a couple of units in its own
 * direction, and where two discs cross, the inks multiply.
 *
 * ── THE ONE THING IT MUST NOT BE ─────────────────────────────────
 * A Venn diagram. The overlaps are here because ink is transparent,
 * not because the drawing is making a point about sets, so the discs
 * sit on a loose diagonal rather than a neat trefoil, and one of them
 * runs off the plate.
 *
 * Plate: 390 × 230, bleeding off the right and the bottom.
 */

const ID = 'co';

/**
 * Each drum's pass: its ink, its centre, and how far it landed off.
 *
 * The first pull of this plate sat four discs of near-equal size in a
 * tidy row with a hole through the middle, and came back as a Venn
 * diagram — which is the one thing the drawing must not be, because a
 * Venn diagram is an argument about sets and this is a statement about
 * ink. What fixes it is refusing the symmetry: the radii run 78 / 34 /
 * 58 / 92, they sit on a loose falling diagonal rather than a row, and
 * the last drum runs clean off the right edge so the eye reads a plate
 * being printed rather than a closed figure.
 */
const PASSES = [
  { ink: 'var(--g-sea)', cx: 92, cy: 96, r: 78, dx: -2.5, dy: -1.5 },
  { ink: 'var(--g-clay)', cx: 196, cy: 74, r: 34, dx: 2, dy: -2.5 },
  { ink: 'var(--g-green)', cx: 214, cy: 168, r: 58, dx: 1.5, dy: 2 },
  { ink: 'var(--g-sea-lift)', cx: 358, cy: 128, r: 92, dx: -2, dy: 2.5 },
];

export function Colophon({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={390} h={230}
      label="Four discs of ink overprinting slightly out of register, the way a risograph lays down a four-colour job"
    >
      <defs>
        <Press id={ID} seed={61} />
      </defs>

      {/* ============================================================
          1 — THE REGISTRATION MARKS, on the plate as they would be
          ============================================================ */}
      <motion.g {...layer(0, 0.02)} opacity="0.4">
        <g stroke="var(--g-stone-dark)" strokeWidth="1" fill="none">
          <path d="M28 30h16M36 22v16" />
          <circle cx="36" cy="30" r="6" />
          <path d="M362 208h16M370 200v16" />
          <circle cx="370" cy="208" r="6" />
        </g>
      </motion.g>

      {/* ============================================================
          2 — THE PASSES. Multiply, because ink is transparent.
          ============================================================ */}
      {PASSES.map((p, i) => (
        <motion.g key={i} {...layer(14, 0.08 + i * 0.09)}
          style={{ mixBlendMode: 'multiply' }}>
          <g filter={ink(ID, 'grain')} opacity="0.55">
            <circle cx={p.cx + p.dx} cy={p.cy + p.dy} r={p.r} fill={p.ink} />
          </g>
          {/* the trailing edge each drum leaves as the paper pulls away */}
          <circle cx={p.cx + p.dx * 4} cy={p.cy + p.dy * 4} r={p.r}
            fill={p.ink} opacity="0.12" filter={ink(ID, 'stipple')} />
        </motion.g>
      ))}

      {/* ============================================================
          3 — THE KNOCK-OUT. A disc of bare paper held back from every
          pass, so the plate has one place with no ink on it at all. It
          sits off to one side, deliberately not at the crossing of the
          drums — a hole punched through the middle of four overlapping
          circles is the Venn reading this plate is avoiding.
          ============================================================ */}
      <motion.g {...layer(10, 0.46)}>
        <circle cx="128" cy="176" r="15" fill="var(--paper)" />
        <circle cx="128" cy="176" r="15" fill="none"
          stroke="var(--g-stone-hi)" strokeWidth="1.4" opacity="0.6" />
      </motion.g>

      {/* ============================================================
          4 — THE TOOTH of the stock, over everything
          ============================================================ */}
      <rect x="0" y="0" width="390" height="230" fill="var(--g-stone-dark)"
        opacity="0.1" filter={ink(ID, 'stipple-coarse')}
        style={{ mixBlendMode: 'multiply' }} />
    </Plate>
  );
}
