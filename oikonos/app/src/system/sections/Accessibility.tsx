import { Button, IconButton, Row, Toggle } from '../../components/ui';
import { Search } from '../../components/icons';
import { Chapter, Code, Note, Snippet, Specimen, Sub } from '../kit';

const SEMANTICS = [
  ['Meter', 'div role="progressbar"', 'aria-valuenow / min / max, so a filling bar announces a number rather than a decoration.'],
  ['Toggle', 'button role="switch"', 'aria-checked plus a required label prop — the switch has no visible text of its own.'],
  ['Choice', 'button role="radio"', 'aria-checked. The group reads as a set because the rows share a Group.'],
  ['Segmented', 'div role="tablist"', 'Each option is role="tab" with aria-selected.'],
  ['IconButton', 'button', 'label is a required prop, not an optional one. An icon-only control cannot ship unnamed.'],
  ['TabBar', 'nav', 'Real navigation landmark; the active tab is marked, not merely coloured.'],
  ['Charts', 'aria-hidden', 'Decorative by design — the figure beside the chart carries the same value in text.'],
  ['Sheet scrim', 'button', 'Labelled “Dismiss”, so the escape route is reachable without a pointer.'],
];

export function Accessibility() {
  return (
    <Chapter
      id="a11y"
      title="Accessibility"
      lede={
        <>
          The visual language is unusual; the semantics are not. Every control
          is a real element with a real role, every icon-only button carries a
          name, focus is always visible, and nothing a user must read depends
          on a colour they may not distinguish.
        </>
      }
    >
      <Sub
        title="Focus"
        note="A vermilion ring at 3px offset, applied to every focusable element in one place. Tab into the specimen below to see it."
      >
        <Specimen ground="paper" pad={24}>
          <div className="rowline">
            <Button variant="outline">Focus me</Button>
            <IconButton label="Search"><Search size={18} /></IconButton>
            <Toggle on label="Demo switch" onChange={() => {}} />
          </div>
        </Specimen>
        <Snippet>
          {`:where(button, a, [tabindex], input, textarea):focus-visible {
  outline: 2px solid var(--vermilion);
  outline-offset: 3px;
  border-radius: var(--r-xs);
}`}
        </Snippet>
        <Note kind="rule">
          <p>
            Vermilion is the focus colour because it is the one ink that never
            fills a surface — a ring in cobalt or pine would land on a field
            of the same colour somewhere in the app.
          </p>
        </Note>
      </Sub>

      <Sub title="Semantics by component">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Component</th><th>Element</th><th>Carries</th></tr></thead>
            <tbody>
              {SEMANTICS.map(([c, el, note]) => (
                <tr key={c}>
                  <td><Code>{c}</Code></td>
                  <td className="tbl__type">{el}</td>
                  <td>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub
        title="Colour is never the only signal"
        note="Pine and vermilion carry meaning across the whole app, so every use is doubled by a sign, a glyph or a word."
      >
        <Specimen ground="paper" pad={20}>
          <Row title="Salary" sub="Sep 1 · HDFC Savings" value={<span className="figure" style={{ color: 'var(--olive)' }}>+₹96,000</span>} />
          <Row title="Ferry to Naxos" sub="Sep 17 · Travel" value={<span className="figure" style={{ color: 'var(--vermilion)' }}>−₹2,850</span>} />
        </Specimen>
        <Note kind="rule">
          <p>
            The sign is the signal; the ink is the reinforcement. The same
            applies to <Code>Delta</Code>, which draws an arrow rather than
            relying on pine or vermilion alone.
          </p>
        </Note>
      </Sub>

      <Sub title="Standing requirements">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Requirement</th><th>Where it is enforced</th></tr></thead>
            <tbody>
              <tr><td>4.5:1 on body text, measured on its actual ground</td><td>The contrast matrix in Colour, checked against live token values.</td></tr>
              <tr><td><Code>--fg-faint</Code> never carries information</td><td>Review rule; it fails 4.5:1 on cream by design.</td></tr>
              <tr><td>Touch targets at least 44px</td><td>Buttons are 56px and 44px; rows are 34px of icon inside 14px of padding.</td></tr>
              <tr><td>Reduced motion honoured</td><td>Token layer collapses durations; <Code>Meter</Code> and <Code>Amount</Code> read <Code>useReducedMotion</Code>.</td></tr>
              <tr><td>Escape dismisses a sheet</td><td><Code>SheetHost</Code> binds it while a sheet is presented.</td></tr>
              <tr><td>Text over illustration has a contrast plan</td><td>A scrim, a clear region, or repositioning — never hope.</td></tr>
            </tbody>
          </table>
        </div>
        <Note kind="trap">
          <p>
            Texture reduces effective contrast slightly on saturated fields.
            The measured ratios in the Colour chapter are taken on the flat
            ink, so treat a pairing that only just passes as failing.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}
