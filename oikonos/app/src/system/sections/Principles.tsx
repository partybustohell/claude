import { Chapter, Note, Sub } from '../kit';

const PRINCIPLES = [
  {
    n: '01',
    title: 'It is a print, not a screen',
    body:
      'Every surface carries paper tooth or ink grain. Colour is laid down '
      + 'in passes, not blended. A flat, untextured colour field is the one '
      + 'defect that fails a screen outright, because it breaks the premise '
      + 'the whole system rests on.',
  },
  {
    n: '02',
    title: 'Four inks, and no grey',
    body:
      'Cream, cobalt, pine, vermilion. Nothing else goes to press. Muted '
      + 'text is cobalt stepped toward the paper, never a neutral. Shadows '
      + 'are warm brown. A grey anywhere in a render is a bug with a '
      + 'traceable cause — almost always a saturated ink faded to transparent.',
  },
  {
    n: '03',
    title: 'Money is editorial',
    body:
      'Figures are set in the serif, tabular, and large enough to be the '
      + 'first thing read. The interface furniture around them — labels, '
      + 'chips, controls — is set in the sans and stays quiet. The number is '
      + 'the headline; the app is the page it sits on.',
  },
  {
    n: '04',
    title: 'Motion is physical',
    body:
      'Everything that moves moves on a spring, so an interrupted gesture '
      + 'keeps its momentum instead of jumping to a new curve. Four springs '
      + 'cover the whole app. Durations exist only for colour and opacity.',
  },
  {
    n: '05',
    title: 'Extend the kit, never fork it',
    body:
      'A near-duplicate of an existing primitive is how a system dies. If '
      + 'something is genuinely missing, add it to the kit with its rules '
      + 'written down; if it is a variant, add the variant.',
  },
  {
    n: '06',
    title: 'Decoration never carries information',
    body:
      'Faint ink, texture and illustration are atmosphere. Anything a user '
      + 'must read meets 4.5:1 on its actual ground, and anything a user '
      + 'must act on has a name, a role and a visible focus state.',
  },
];

export function Principles() {
  return (
    <Chapter
      id="principles"
      title="Principles"
      lede={
        <>
          Six commitments the rest of the system is downstream of. When a
          token, a component or a screen has to give, these are what it gives
          way to.
        </>
      }
    >
      <div className="grid2">
        {PRINCIPLES.map((p) => (
          <article key={p.n} className="lab">
            <div className="lab__head">
              <span className="lab__name">{p.title}</span>
              <span className="lab__spec">{p.n}</span>
            </div>
            <p className="lab__note">{p.body}</p>
          </article>
        ))}
      </div>

      <Sub title="How to use this document">
        <p className="sub__note">
          Every value on this page is read from the running stylesheet at
          paint time, and every component is the real component imported from
          the app kit. Nothing here is a drawing of the system — if a
          specimen looks wrong, the system is wrong.
        </p>
        <Note kind="rule">
          <p>
            Values live in <code className="code">src/styles/tokens.css</code>.
            Their meaning lives in <code className="code">src/system/tokens.ts</code>.
            <code className="code">tools/audit.mjs</code> checks the two against each
            other, and against the source tree, on every run of{' '}
            <code className="code">npm run audit</code>.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}
