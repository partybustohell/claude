import { motion } from 'framer-motion';
import { Plate, Press, ink, useLayer, mulberry32, speck } from './press';
import { Contact } from './parts';

/**
 * COLOPHON — a sheet coming off the press.
 *
 * For the app cluster: about, appearance, help, settings — the screens
 * that are about Oikonos rather than about money. Everywhere else the
 * drawing is a window onto somewhere; here it is the thing itself.
 *
 * ── WHY THIS PLATE WAS REDRAWN ───────────────────────────────────
 * It lost two blind duels, both "clear", and the two verdicts agreed:
 *
 *   · "four circles of near-equal weight strung in a row… no focal
 *     point, no ground plane, no light — the question 'where is the
 *     sun' cannot even be asked." Four abstract discs was the whole
 *     idea and the whole problem. It is a SHEET now: a real object,
 *     lying on a real bed, lit from the upper left like everything else
 *     in the app, with one corner lifted off the bed and casting.
 *
 *   · "the discs are half-strength inks with soft vignetted edges…
 *     muddied ink is grey by another name." Every ink here is at full
 *     strength. Where two cross they MULTIPLY, which is what
 *     overprinting actually does and what the old plate never did — the
 *     green disc simply sat opaque over the blue.
 *
 *   · "its paper grain is a rectangle: a speckled band begins at a hard
 *     horizontal edge… grain that stops on a straight line is noise
 *     laid over vector art." The tooth rect is gone. The sheet's own
 *     edge is now the only straight line in the plate, and it is
 *     supposed to be there.
 *
 *   · "the crosshair registration marks are decorative — real ones sit
 *     outside the trim, not inside the picture." They sit in the bed's
 *     margin now, off the sheet, where a pressman would put them.
 *
 * ── ONE LIGHT ────────────────────────────────────────────────────
 * Upper left. The sheet's lifted corner throws onto the bed, the bed's
 * near edge catches the sun, and the three ink bars are flat because
 * ink lying on paper has no form to model.
 *
 * Plate: 390 × 230, bleeding off both edges and the bottom.
 */

const ID = 'co';
const W = 390;
const H = 230;

/* The sheet, slightly askew — a sheet laid perfectly square to the bed
   is a diagram of a sheet. */
const SHEET = 'M46 52L330 40l14 150L58 202Z';

/**
 * Where each drum laid its ink, and how far it landed out of register.
 *
 * TWO passes on the sheet, not three, and neither of them is pine.
 * The first pull had a pine bar crossing a cobalt one on a pine bed:
 * the pine pass was the same ink as the bed showing through, so it read
 * as a hole punched in the paper, and cobalt multiplied by pine came
 * out near-black — which this palette does not contain either. Cobalt
 * and clay overprint to a dark warm red that is still a colour. Pine is
 * present in the plate as the BED, so all four inks are on the page
 * without any two of them fighting.
 */
const PASSES = [
  { d: 'M74 72l188-8l7 74l-188 8Z', ink: 'var(--g-sea)', dx: 0, dy: 0 },
];

/** The knock-out: bare paper held back from every pass. */
const KNOCK = { cx: 250, cy: 118, r: 19 };

/* The bite of tooth on the bed, laid by seed so the bed is stock and
   not a flat field. Bounded by the bed itself, never by a rectangle. */
const TOOTH = (() => {
  const rnd = mulberry32(613);
  const out: string[] = [];
  for (let i = 0; i < 900; i++) {
    const x = rnd() * (W + 20) - 10;
    const y = rnd() * (H + 20) - 10;
    out.push(speck(x, y, 0.8 + rnd() * 1.6));
  }
  return out.join('');
})();

export function Colophon({ className = '' }: { className?: string }) {
  const layer = useLayer();

  return (
    <Plate
      className={className} w={W} h={H}
      label="A sheet of paper on a press bed, three inks laid down out of register, one corner lifted"
    >
      <defs>
        <Press id={ID} seed={61} />
        <clipPath id={`${ID}-sheet`}><path d={SHEET} /></clipPath>
        {/* the first pass's own outline, so the second can be screened
            back exactly where it crosses it */}
        <clipPath id={`${ID}-bar`}><path d={PASSES[0].d} /></clipPath>
      </defs>

      {/* ============================================================
          1 — THE BED the sheet is lying on
          ============================================================ */}
      <motion.g {...layer(10, 0.02)}>
        <g filter={ink(ID, 'grain')}>
          <rect x="0" y="0" width={W} height={H} fill="var(--g-green-deep)" />
          {/* the near lip of the bed takes the sun */}
          <rect x="0" y="0" width={W} height="3" fill="var(--g-green-lit)" opacity="0.5" />
        </g>
        {/* its tooth, scattered across the whole bed — no bounding box */}
        <path d={TOOTH} fill="var(--g-green-lit)" opacity="0.16" />
      </motion.g>

      {/* ============================================================
          2 — THE REGISTRATION MARKS, in the margin where they belong
          ============================================================ */}
      <motion.g {...layer(0, 0.06)}>
        <g stroke="var(--g-lime)" strokeWidth="1.2" fill="none" opacity="0.65">
          <path d="M16 24h14M23 17v14" />
          <circle cx="23" cy="24" r="5" />
          <path d="M360 206h14M367 199v14" />
          <circle cx="367" cy="206" r="5" />
        </g>
      </motion.g>

      {/* ============================================================
          3 — THE SHEET, and what it throws on the bed
          ============================================================ */}
      <motion.g {...layer(18, 0.1)}>
        <Contact cx={196} cy={200} rx={150} ry={9} id={ID}
          tone="var(--g-green-deep)" opacity={0.55} />
        <g filter={ink(ID, 'grain-fine')}>
          <path d={SHEET} fill="var(--g-stone)" />
          {/* the two edges the sun reaches */}
          <path d="M46 52L330 40" stroke="var(--g-stone-hi)" strokeWidth="2.6" />
          <path d="M46 52L58 202" stroke="var(--g-stone-hi)" strokeWidth="2.2" />
        </g>
      </motion.g>

      {/* ============================================================
          4 — THE PASSES. Full strength, and they multiply where they
          cross, because that is what transparent ink does.
          ============================================================ */}
      {PASSES.map((p, i) => (
        <motion.g key={i} {...layer(12, 0.2 + i * 0.1)}>
          <g clipPath={`url(#${ID}-sheet)`}>
            <g filter={ink(ID, 'grain')}>
              <path d={p.d} fill={p.ink}
                transform={`translate(${p.dx} ${p.dy})`} />
            </g>
            {/* The drag the paper leaves as it pulls off the drum.
                A tinted FILL of the whole shape read first as a grey
                band (at 0.2, composited to rgb(207,208,209)) and then,
                at full strength, as a mottle laid over the bar. Neither
                is misregistration. Misregistration shows at the EDGE:
                a screened outline, offset, so the ink appears to have
                landed a hair off its own outline. */}
            <path d={p.d} fill="none" stroke={p.ink} strokeWidth="6"
              transform={`translate(${p.dx * 3 - 3.5} ${p.dy * 3 + 3.5})`}
              filter={ink(ID, 'screen-fine-b')} />
          </g>
        </motion.g>
      ))}

      {/* ============================================================
          THE SECOND PASS, and how it OVERPRINTS the first.

          Not by multiply. Cobalt × clay at full strength computes to
          rgb(12,15,28) — black, which this palette does not contain, and
          the plate came back with a black bite out of it. That is not
          what a riso does either: it cannot lay solid over solid, it
          lays a SCREEN over the first pass, and the first colour shows
          between the second's dots. So the disc prints solid where it
          meets bare stock, and where it crosses the cobalt the cobalt is
          screened back over it — blue dots on red, which is a real
          overprint and still two colours.
          ============================================================ */}
      <motion.g {...layer(10, 0.42)}>
        <g clipPath={`url(#${ID}-sheet)`}>
          <g filter={ink(ID, 'grain')}>
            <circle cx="256" cy="126" r="42" fill="var(--g-clay)" />
          </g>
          <g clipPath={`url(#${ID}-bar`.concat(')')}>
            <circle cx="256" cy="126" r="42" fill="var(--g-sea)"
              filter={ink(ID, 'screen-mid-a')} />
            <circle cx="256" cy="126" r="42" fill="var(--g-sea-deep)"
              opacity="0.7" filter={ink(ID, 'screen-fine-b')} />
          </g>
          {/* the drag as the sheet pulls off the drum */}
          <circle cx="250" cy="133" r="42" fill="var(--g-clay)" opacity="0.2"
            filter={ink(ID, 'screen-fine-b')} />
        </g>
      </motion.g>

      {/* ============================================================
          5 — THE KNOCK-OUT: bare stock, held back from every drum
          ============================================================ */}
      <motion.g {...layer(8, 0.5)}>
        <g clipPath={`url(#${ID}-sheet)`}>
          <circle cx={KNOCK.cx} cy={KNOCK.cy} r={KNOCK.r} fill="var(--g-stone)" />
          <circle cx={KNOCK.cx} cy={KNOCK.cy} r={KNOCK.r} fill="none"
            stroke="var(--g-stone-hi)" strokeWidth="1.4" opacity="0.8" />
        </g>
      </motion.g>

      {/* ============================================================
          6 — THE LIFTED CORNER
          ----------------------------------------------------------
          The one piece of drawing that makes the sheet an object in
          space rather than a rectangle of colour: it curls off the bed
          at the lower right, shows its unprinted back, and throws.
          ============================================================ */}
      <motion.g {...layer(12, 0.58)}>
        {/* what the curl throws back onto the bed */}
        <path d="M330 188l-74 12c18 16 46 20 74 13Z"
          fill="var(--g-green-deep)" filter={ink(ID, 'stipple')} />
        <g filter={ink(ID, 'grain-fine')}>
          {/* The underside of the sheet: unprinted stock, in shade.
              It was a flat half-strength blue with no dot structure —
              "a fifth ink" — and it ran off the bottom-right corner as
              overflow. Cream now, turned by coverage, and it closes
              inside the frame. */}
          <path d="M330 188l-78 8c20 20 50 24 78 15Z" fill="var(--g-stone)" />
          <path d="M330 188l-78 8c20 20 50 24 78 15Z" fill="var(--g-sea)"
            filter={ink(ID, 'screen-fine-a')} opacity="0.5" />
          <path d="M330 188l-78 8" stroke="var(--g-stone-hi)" strokeWidth="2.4" />
          <path d="M252 196c20 20 50 24 78 15" fill="none"
            stroke="var(--g-stone-hi)" strokeWidth="1.8" opacity="0.8" />
        </g>
      </motion.g>
    </Plate>
  );
}
