import { MonthColumns, Ring, ShareBar, Sparkline, tintScale } from '../../components/charts';
import { Card, Eyebrow } from '../../components/ui';
import { compactINR } from '../../lib/format';
import { Chapter, Code, Do, DoDont, Dont, Note, PropTable, Snippet, Specimen, Sub } from '../kit';

const TREND = [612000, 628000, 619000, 664000, 691000, 703000, 742000, 786000, 812000, 874350];

const MONTHS = [
  { label: 'Apr', income: 96000, expenses: 71000 },
  { label: 'May', income: 96000, expenses: 84000 },
  { label: 'Jun', income: 104000, expenses: 66000 },
  { label: 'Jul', income: 96000, expenses: 91000 },
  { label: 'Aug', income: 118000, expenses: 74000 },
  { label: 'Sep', income: 96000, expenses: 62000 },
];

const SHARE = [
  { id: 'food', share: 0.34 },
  { id: 'home', share: 0.26 },
  { id: 'travel', share: 0.18 },
  { id: 'bills', share: 0.13 },
  { id: 'other', share: 0.09 },
];

export function DataViz() {
  return (
    <Chapter
      id="charts"
      title="Data"
      lede={
        <>
          Charts are printed, not plotted. Every mark carries grain, every
          fill starts from an opaque wash, and nothing is drawn that the
          figure beside it does not already say — the chart shows the shape,
          the number carries the value.
        </>
      }
    >
      <Sub
        title="Sparkline"
        note="A Catmull-Rom trend line that draws itself on first view, with a wash fill beneath and a dot on the latest point. For direction over time, never for reading an individual value."
      >
        <Card>
          <Eyebrow>Net worth · 10 months</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <Sparkline values={TREND} width={520} height={96} />
          </div>
        </Card>
        <PropTable
          rows={[
            { name: 'values', type: 'number[]', note: 'Plotted edge to edge; the scale is the series own min and max.' },
            { name: 'ink', type: 'Ink', def: "'ink'", note: 'Cobalt for neutral trend, pine for growth, vermilion for decline.' },
            { name: 'fill', type: 'boolean', def: 'true', note: 'Gradient from the tinted wash to transparent — never from the ink itself.' },
            { name: 'dot', type: 'boolean', def: 'true', note: 'Marks the latest point. Drop it when the figure is stated beside the chart.' },
          ]}
        />
        <Note kind="trap">
          <p>
            The area gradient starts at <Code>INK_WASH_HEX</Code>, not at the
            ink with a falling alpha. Cobalt fading to transparent over cream
            passes straight through grey, and a chart is where that is most
            visible.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Month columns"
        note="Paired bars, income in pine and expenses in vermilion, growing from the baseline in sequence. The pairing is the point: two series, one period, read together."
      >
        <Card>
          <Eyebrow>Income and expenses</Eyebrow>
          <div style={{ marginTop: 16 }}>
            <MonthColumns data={MONTHS} height={160} />
          </div>
        </Card>
        <Note kind="rule">
          <p>
            Bars are capped at 11px wide and scale against a shared peak, so a
            column chart never becomes a set of unrelated bars. A single bar
            that reaches 100% of the plot should be scaled against a common
            maximum instead — a full bar reads as broken, not as large.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Ring"
        note="A budget's month at a glance. The ring is a meter bent into a circle: same fill-on-first-view behaviour, same ink meanings."
      >
        <Specimen ground="paper" pad={28}>
          <div className="rowline">
            <Ring value={0.34}><span>34%</span></Ring>
            <Ring value={0.72} ink="ink"><span>72%</span></Ring>
            <Ring value={0.96} ink="vermilion" size={72} stroke={8}><span>96%</span></Ring>
          </div>
        </Specimen>
      </Sub>

      <Sub
        title="Share bar"
        note="One stacked rule showing composition. Adjacent segments in the same ink would read as one block, so the tint ladder steps each segment toward the paper."
      >
        <Card>
          <Eyebrow>Where it went</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <ShareBar
              parts={SHARE.map((p, i) => ({
                ...p, ink: 'ink' as const, color: tintScale('ink', i, SHARE.length),
              }))}
              height={14}
            />
          </div>
          <div className="rowline" style={{ marginTop: 14, gap: 16 }}>
            {SHARE.map((p, i) => (
              <span key={p.id} className="rowline" style={{ gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: tintScale('ink', i, SHARE.length), display: 'inline-block',
                }} />
                <span style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)' }}>
                  {p.id} · {Math.round(p.share * 100)}%
                </span>
              </span>
            ))}
          </div>
        </Card>
        <Snippet>
          {`<ShareBar
  parts={cats.map((c, i) => ({
    id: c.id, share: c.share, ink: 'ink',
    color: tintScale('ink', i, cats.length),
  }))}
/>`}
        </Snippet>
        <Note kind="why">
          <p>
            <Code>tintScale</Code> mixes in oklab toward the paper rather than
            dropping alpha, which keeps every step of the ladder inside the
            palette instead of walking it through neutral.
          </p>
        </Note>
      </Sub>

      <Sub title="Rules">
        <DoDont>
          <Do>
            Label axes with <Code>compactINR</Code> — {compactINR(874350)} and{' '}
            {compactINR(12400000)} read at 10px where a full figure does not.
          </Do>
          <Dont>
            Add a gridline, a tooltip layer or a legend the screen does not
            need. If a value must be read exactly, print it as a figure.
          </Dont>
          <Do>
            Keep ink meaning constant across every chart: pine is money in,
            vermilion is money out, cobalt is neutral or total.
          </Do>
          <Dont>
            Animate a chart on every scroll past. Charts fill once, on first
            view, like every other meter in the system.
          </Dont>
        </DoDont>
        <Note kind="rule">
          <p>
            Charts are decorative in the accessibility tree —{' '}
            <Code>aria-hidden</Code> — because the figures beside them carry
            the same information in text. If a chart is the only place a value
            appears, that is a content bug, not a labelling one.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}
