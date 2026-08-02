import { PIGMENTS, SEMANTIC, contrastOf, chroma, isNeutral, over, parseColor } from '../tokens';
import {
  Chapter, Code, Do, DoDont, Dont, Note, Ratio, Specimen, Sub, Swatch, TokenTable, useTokenValues,
} from '../kit';

/* ---------------------------------------------------------------- */

const GROUNDS = [
  { token: '--paper', label: 'Cream' },
  { token: '--paper-warm', label: 'Recessed cream' },
  { token: '--ink', label: 'Cobalt' },
  { token: '--olive', label: 'Pine' },
  { token: '--vermilion', label: 'Vermilion' },
];

const INKS_ON = [
  { token: '--fg', label: 'Body text' },
  { token: '--fg-muted', label: 'Secondary text' },
  { token: '--fg-faint', label: 'Decoration only' },
  { token: '--on-ink', label: 'Text on saturated' },
  { token: '--on-ink-muted', label: 'Secondary on cobalt' },
  { token: '--on-olive-muted', label: 'Secondary on pine' },
  { token: '--olive', label: 'Positive figure' },
  { token: '--vermilion', label: 'Negative figure' },
];

/**
 * Every text-on-ground pairing, measured.
 *
 * A failing cell is not automatically a bug — it means that pairing may
 * not carry text. It becomes a bug the moment a screen uses it anyway.
 */
function ContrastMatrix() {
  const vals = useTokenValues([
    ...GROUNDS.map((g) => g.token),
    ...INKS_ON.map((i) => i.token),
  ]);

  return (
    <div className="tablewrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Ink</th>
            {GROUNDS.map((g) => <th key={g.token}>{g.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {INKS_ON.map((ink) => (
            <tr key={ink.token}>
              <td>
                <code className="code">{ink.token}</code>
                <div className="tbl__def" style={{ marginTop: 2 }}>{ink.label}</div>
              </td>
              {GROUNDS.map((g) => {
                const r = contrastOf(vals[ink.token] ?? '', vals[g.token] ?? '');
                return (
                  <td key={g.token}>{r ? <Ratio value={r} /> : <span className="tbl__def">—</span>}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function toHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * The mistake this palette invites, worked out live.
 *
 * Cobalt faded toward transparent over cream does not produce pale
 * cobalt: the paper is warm, so the mix runs straight through neutral.
 * The numbers below are computed on every paint, not typed in.
 */
function GreyTrap() {
  const vals = useTokenValues(['--paper', '--ink', '--ink-wash']);
  const paper = parseColor(vals['--paper'] ?? '');
  const ink = parseColor(vals['--ink'] ?? '');
  const wash = parseColor(vals['--ink-wash'] ?? '');
  if (!paper || !ink || !wash) return null;

  const faded = over({ ...ink, a: 0.2 }, paper);
  const fadedHex = toHex(faded);

  return (
    <div className="grid2">
      <div className="stackline">
        <div
          className="texplate"
          style={{ background: fadedHex, color: 'var(--ink-deep)', outline: '2px solid var(--vermilion)', outlineOffset: -2 }}
        >
          {fadedHex}
        </div>
        <p className="lab__note">
          <b>Cobalt at 20% over cream.</b> Resolves to {fadedHex}, chroma{' '}
          <span className="num">{chroma(faded).toFixed(3)}</span> —{' '}
          {isNeutral(faded) ? 'a neutral grey, which this palette does not contain.' : 'still tinted.'}
        </p>
      </div>
      <div className="stackline">
        <div className="texplate" style={{ background: vals['--ink-wash'], color: 'var(--ink-deep)' }}>
          {vals['--ink-wash']}
        </div>
        <p className="lab__note">
          <b><Code>--ink-wash</Code>, the opaque tint.</b> Chroma{' '}
          <span className="num">{chroma(wash).toFixed(3)}</span>. Mixed toward
          the paper rather than toward transparency, so it keeps the hue.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export function Colour() {
  return (
    <Chapter
      id="colour"
      title="Colour"
      lede={
        <>
          Four inks on one sheet. Cobalt carries the brand and the headings,
          pine means money resolved in your favour, vermilion means money
          leaving — and cream is the paper all three are printed on. There is
          no fifth colour and no grey.
        </>
      }
    >
      <Sub title="The four inks">
        <div className="swatchgrid">
          <Swatch token="--paper" on="--ink" label="The sheet" />
          <Swatch token="--ink" on="--on-ink" label="Brand, headings, figures" />
          <Swatch token="--olive" on="--on-olive" label="Income, progress" />
          <Swatch token="--vermilion" on="--on-ink" label="Expense, alarm" />
        </div>
        <Note kind="rule">
          <p>
            Ratios are measured against the swatch's own foreground token at
            paint time. If a value in <Code>tokens.css</Code> changes, these
            numbers change with it — nothing here is transcribed.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Never grey"
        note="The single rule most likely to be broken by accident, because the accident looks reasonable in code."
      >
        <GreyTrap />
        <Note kind="trap">
          <p>
            Any area fill, gradient stop, meter track or SVG ground must start
            from an opaque wash — <Code>--ink-wash</Code>,{' '}
            <Code>--olive-wash</Code>, <Code>--vermilion-wash</Code>, or the{' '}
            <Code>INK_WASH_HEX</Code> map for SVG attributes where{' '}
            <Code>var()</Code> does not resolve. Fading a saturated ink to
            transparent over cream is the one reliable way to put grey on the
            page.
          </p>
        </Note>
        <DoDont>
          <Do>
            Step an ink toward paper — <Code>color-mix(in oklab, var(--ink) 70%, var(--paper))</Code> — when you need a ladder of related tones, as the share bar does.
          </Do>
          <Dont>
            Reach for <Code>opacity</Code> or an <Code>rgba()</Code> alpha to
            make a lighter version of an ink on a cream ground.
          </Dont>
        </DoDont>
      </Sub>

      <Sub title="Pigments">
        <p className="sub__note">
          Base inks and their printing states. The <span className="tag">derived</span>{' '}
          rows exist so other tokens and illustrations can be built; screens
          should reach for the semantic layer below instead.
        </p>
        <TokenTable group={PIGMENTS} />
      </Sub>

      <Sub title="Semantic roles">
        <TokenTable group={SEMANTIC} />
      </Sub>

      <Sub
        title="What may sit on what"
        note="Every text-on-ground pairing in the system, measured against WCAG 2.1. A cell below 4.5 may not carry body text at any size."
      >
        <ContrastMatrix />
        <Note kind="trap">
          <p>
            <b>Cream on vermilion measures about 3.6:1.</b> That clears 3:1 —
            enough for a large figure, an icon, a rule or a focus ring — but
            it is short of 4.5:1, so it may not carry small text. A solid
            vermilion button with a 12px label is below the line today
            (<Code>GoalDetail</Code>'s primary action is the live case). The
            pairing that holds is <Code>--vermilion-deep</Code>, which
            measures about 4.8:1 against <Code>--on-ink</Code>.
          </p>
        </Note>

        <Note kind="why">
          <p>
            <Code>--fg-faint</Code> fails on purpose. It exists for chevrons,
            disabled glyphs and rules — marks whose meaning is carried by
            their position, not by being read. The moment it is used for a
            word a user needs, it is the wrong token.
          </p>
        </Note>
      </Sub>

      <Sub title="Ink on ink">
        <p className="sub__note">
          A saturated field flips the whole text ladder. Screens printed on
          cobalt or pine use the <Code>--on-*</Code> tokens and the{' '}
          <Code>tex-ink</Code> texture, and their status bar glyphs invert —{' '}
          see <Code>DARK_ROUTES</Code> in <Code>App.tsx</Code>.
        </p>
        <div className="grid2">
          <Specimen ground="ink" label="Cobalt field" pad={28}>
            <p className="display" style={{ fontSize: 'var(--t-h3)', color: 'var(--on-ink)' }}>
              Money, made clear.
            </p>
            <p style={{ color: 'var(--on-ink-muted)', fontSize: 'var(--t-small)', marginTop: 8 }}>
              Secondary copy on cobalt uses --on-ink-muted.
            </p>
          </Specimen>
          <Specimen ground="olive" label="Pine field" pad={28}>
            <p className="display" style={{ fontSize: 'var(--t-h3)', color: 'var(--on-olive)' }}>
              Transaction detail
            </p>
            <p style={{ color: 'var(--on-olive-muted)', fontSize: 'var(--t-small)', marginTop: 8 }}>
              Secondary copy on pine uses --on-olive-muted.
            </p>
          </Specimen>
        </div>
      </Sub>
    </Chapter>
  );
}
