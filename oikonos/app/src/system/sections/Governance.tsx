import { Chapter, Code, Note, Snippet, Sub } from '../kit';

const FILES = [
  ['src/styles/tokens.css', 'Every value in the system. The only file allowed to contain a raw colour.'],
  ['src/styles/global.css', 'Font faces, reset, texture primitives, type utilities, focus.'],
  ['src/lib/motion.ts', 'The four springs, shared variants, press physics.'],
  ['src/lib/format.ts', 'All number, currency and date rendering.'],
  ['src/components/ui.tsx', 'The component kit.'],
  ['src/components/charts.tsx', 'Chart primitives and the ink ladder.'],
  ['src/components/icons.tsx', 'The icon set and the category glyph map.'],
  ['src/system/tokens.ts', 'What each token means, and which are derived.'],
  ['src/system/', 'This reference. Built from the real components, not from copies.'],
  ['tools/audit.mjs', 'The system’s guardrail. Run by npm run audit.'],
];

export function Governance() {
  return (
    <Chapter
      id="working"
      title="Working in the system"
      lede={
        <>
          A design system holds only if adding to it is easier than working
          around it. These are the four changes anyone actually makes, and
          what each one costs.
        </>
      }
    >
      <Sub title="Where things live">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Path</th><th>Holds</th></tr></thead>
            <tbody>
              {FILES.map(([p, w]) => (
                <tr key={p}><td><Code>{p}</Code></td><td>{w}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="Adding a token">
        <p className="sub__note">
          Derive it in <Code>tokens.css</Code> from a value already there,
          then describe it in <Code>src/system/tokens.ts</Code>. The audit
          fails on a token that exists in one and not the other, so the
          documentation cannot fall behind the stylesheet.
        </p>
        <Snippet>
          {`/* tokens.css */
--olive-wash: #dbe7dd;   /* green tint on paper */

/* system/tokens.ts */
{ name: '--olive-wash', role: 'Pine tint on cream.' }`}
        </Snippet>
      </Sub>

      <Sub title="Adding a component">
        <p className="sub__note">
          It goes in <Code>ui.tsx</Code> with the rest of the kit, takes its
          colours as <Code>Ink</Code> values rather than strings, reads
          motion from <Code>lib/motion.ts</Code>, and arrives here with a
          live specimen and a prop table. A component that cannot be
          documented in one specimen is usually two components.
        </p>
        <Note kind="rule">
          <p>
            Before adding one, check whether an existing primitive takes a
            prop instead. A second card component with slightly different
            padding is how a system starts to rot.
          </p>
        </Note>
      </Sub>

      <Sub title="Verifying">
        <Snippet>
          {`npm run audit                    # token parity + no raw colour outside the token layer
npx tsc -b --noEmit              # types
npm run lint                     # oxlint

export PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
node tools/shoot.mjs             # render every screen to shots/
node tools/flow.mjs              # drive the app and assert it works
python3 tools/duel.py home shots/bare/home.png reference/phone2.png`}
        </Snippet>
        <Note kind="why">
          <p>
            <Code>duel.py</Code> composites a render and the master comp onto
            one sheet, labelled only A and B, with the answer key written
            outside the directory the reviewer reads. A critic judging the
            sheet cannot know which panel is the app — which is the only way
            to get an honest verdict on whether the system is holding.
          </p>
        </Note>
      </Sub>

      <Sub title="What the audit enforces">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Check</th><th>Fails when</th></tr></thead>
            <tbody>
              <tr><td>Token parity</td><td>A custom property is declared in <Code>tokens.css</Code> but undocumented, or documented but undeclared.</td></tr>
              <tr><td>No stray pigment</td><td>A hex or <Code>rgb()</Code> literal appears in a component or screen instead of a token.</td></tr>
              <tr><td>No neutrals</td><td>A declared colour token measures as grey — every channel within a few percent of the others.</td></tr>
              <tr><td>No unknown tokens</td><td>A <Code>var()</Code> reference names a custom property nothing declares.</td></tr>
              <tr><td>No hand-rolled springs</td><td>A component sets <Code>stiffness</Code> or <Code>damping</Code> outside <Code>lib/motion.ts</Code>.</td></tr>
              <tr><td>No hand-formatted money</td><td>A screen builds a rupee string by hand instead of calling the format helpers.</td></tr>
            </tbody>
          </table>
        </div>
      </Sub>
    </Chapter>
  );
}
