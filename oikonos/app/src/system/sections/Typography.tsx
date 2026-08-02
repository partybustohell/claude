import { TYPEFACES, TYPE_METRICS, TYPE_SCALE } from '../tokens';
import {
  Chapter, Code, Do, DoDont, Dont, Note, Snippet, Specimen, Sub, TokenTable, useTokenValues,
} from '../kit';

const SPECIMEN_TEXT: Record<string, string> = {
  '--t-micro': 'JAN FEB MAR APR',
  '--t-label': 'RECENT ACTIVITY',
  '--t-caption': 'HDFC Savings · 2 hours ago',
  '--t-small': 'Groceries and household',
  '--t-body': 'Good Earth Organics',
  '--t-lead': 'You are ahead of pace this month.',
  '--t-h4': 'This month',
  '--t-h3': 'Santorini fund',
  '--t-h2': 'Good afternoon',
  '--t-h1': 'Money, made clear.',
  '--t-hero': '₹8,74,350',
  '--t-mega': '₹2,850',
};

/** Serif for the editorial sizes, sans for the interface sizes. */
const SERIF_AT = new Set(['--t-h4', '--t-h3', '--t-h2', '--t-h1', '--t-hero', '--t-mega']);

function ScaleSpecimen() {
  const vals = useTokenValues(TYPE_SCALE.tokens.map((t) => t.name));
  return (
    <div>
      {TYPE_SCALE.tokens.map((t) => {
        const serif = SERIF_AT.has(t.name);
        return (
          <div className="spectype" key={t.name}>
            <div className="spectype__meta">
              {t.name.replace('--t-', '')}
              <br />
              {vals[t.name] || '—'}
            </div>
            <div
              className={`spectype__line ${serif ? 'figure' : ''}`}
              style={{
                fontSize: `var(${t.name})`,
                fontFamily: serif ? 'var(--font-display)' : 'var(--font-sans)',
                fontWeight: serif ? 400 : 500,
                letterSpacing: t.name === '--t-label' || t.name === '--t-micro'
                  ? 'var(--tr-label)' : undefined,
                textTransform: t.name === '--t-label' || t.name === '--t-micro'
                  ? 'uppercase' : undefined,
                color: 'var(--ink)',
              }}
            >
              {SPECIMEN_TEXT[t.name] ?? 'Money, made clear.'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- */

export function Typography() {
  return (
    <Chapter
      id="type"
      title="Typography"
      lede={
        <>
          Two families, divided by job rather than by size. Fraunces is the
          editorial voice — headings, merchant names, and every currency
          figure in the app. Inter is the instrument panel — labels, buttons,
          metadata, table rows. A screen that mixes the two the other way
          round stops reading like a printed page.
        </>
      }
    >
      <Sub title="The families">
        <div className="grid2">
          <Specimen ground="warm" label="Fraunces — editorial and money" pad={28}>
            <div className="display" style={{ fontSize: 'var(--t-h1)', color: 'var(--ink)' }}>Aa</div>
            <div className="figure" style={{ fontSize: 'var(--t-h3)', color: 'var(--ink)', marginTop: 12 }}>
              ₹8,74,350
            </div>
            <p style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)', marginTop: 12 }}>
              Book weight (400) always. Optical size 90 for headings, 110 for
              figures. WONK and SOFT axes stay at zero.
            </p>
          </Specimen>
          <Specimen ground="warm" label="Inter — interface" pad={28}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--t-h1)', fontWeight: 600, color: 'var(--ink)' }}>
              Aa
            </div>
            <div className="eyebrow" style={{ color: 'var(--fg-muted)', marginTop: 18 }}>
              RECENT ACTIVITY
            </div>
            <p style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)', marginTop: 12 }}>
              400 for body, 500 for row titles, 600 for eyebrows and labels,
              700 for buttons and figures inside chips.
            </p>
          </Specimen>
        </div>
        <TokenTable group={TYPEFACES} />
      </Sub>

      <Sub
        title="Scale"
        note="A 1.25 minor third off a 16px base. Sizes are set from tokens; a raw px font-size in a component is an audit failure."
      >
        <Specimen ground="paper" pad={20}>
          <ScaleSpecimen />
        </Specimen>
        <TokenTable group={TYPE_SCALE} />
      </Sub>

      <Sub title="Leading and tracking">
        <TokenTable group={TYPE_METRICS} />
      </Sub>

      <Sub
        title="Utilities"
        note="Four classes carry every typographic decision the scale does not. They live in global.css so both the app and this reference resolve them identically."
      >
        <div className="tablewrap">
          <table className="tbl">
            <thead>
              <tr><th>Class</th><th>Sets</th><th>Use for</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><Code>.display</Code></td>
                <td className="tbl__type">Fraunces 400, opsz 90, tight tracking, snug leading</td>
                <td>Headings, merchant names, empty-state titles.</td>
              </tr>
              <tr>
                <td><Code>.figure</Code></td>
                <td className="tbl__type">Fraunces 400, opsz 110, tabular lining numerals</td>
                <td>Every currency amount, without exception.</td>
              </tr>
              <tr>
                <td><Code>.eyebrow</Code></td>
                <td className="tbl__type">Inter 600, 11px, uppercase, 0.15em tracking</td>
                <td>Section labels and category kickers.</td>
              </tr>
              <tr>
                <td><Code>.num</Code></td>
                <td className="tbl__type">Tabular lining numerals only</td>
                <td>Numbers inside sans-set UI: chips, deltas, row values.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Note kind="why">
          <p>
            Tabular numerals are not a refinement here, they are a
            requirement. Hero figures count up from zero on reveal, and
            proportional digits change width as they cycle — the number
            visibly shimmers and the layout around it jitters for the length
            of the animation.
          </p>
        </Note>

        <Specimen ground="paper" label="Both figures counting the same value — proportional above, tabular below" pad={24}>
          <div style={{ display: 'grid', gap: 10 }}>
            <span
              className="display"
              style={{ fontSize: 'var(--t-h2)', fontVariantNumeric: 'proportional-nums', color: 'var(--fg-muted)' }}
            >
              ₹8,74,350
            </span>
            <span className="figure" style={{ fontSize: 'var(--t-h2)', color: 'var(--ink)' }}>
              ₹8,74,350
            </span>
          </div>
        </Specimen>

        <Snippet>
          {`<h1 className="display" style={{ fontSize: 'var(--t-h2)' }}>Santorini fund</h1>
<Amount value={874350} className="figure" style={{ fontSize: 'var(--t-hero)' }} />
<Eyebrow>Recent activity</Eyebrow>`}
        </Snippet>
      </Sub>

      <Sub title="Rules">
        <DoDont>
          <Do>
            Set every amount with <Code>&lt;Amount&gt;</Code> or the{' '}
            <Code>.figure</Code> class, so grouping, the minus sign and
            tabular digits all come from one place.
          </Do>
          <Dont>
            Let a heading element take its default bold. Fraunces at 700 reads
            as a different typeface next to the 400 the rest of the system
            uses — <Code>.display</Code> pins the weight for this reason.
          </Dont>
          <Do>
            Keep eyebrows to two or three words. They are a kicker, not a
            sentence, and the 0.15em tracking makes anything longer hard to
            scan.
          </Do>
          <Dont>
            Use Fraunces for controls, or Inter for a currency figure. The
            split is the system's most visible signature.
          </Dont>
        </DoDont>
      </Sub>
    </Chapter>
  );
}
