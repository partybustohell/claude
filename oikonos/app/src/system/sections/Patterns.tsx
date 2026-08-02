import { Chapter, Code, Do, DoDont, Dont, Note, Snippet, Sub } from '../kit';

/** The archetype tiles render the real app, scaled to fit. */
const FRAME_W = 214;
const SCALE = FRAME_W / 390;

interface Archetype {
  name: string;
  query: string;
  note: string;
}

const ARCHETYPES: Archetype[] = [
  {
    name: 'Ink hero',
    query: 'screen=welcome',
    note: 'A saturated field, a full-bleed illustration and one primary action. No top bar, no tab bar — the screen is the message.',
  },
  {
    name: 'Cream hero',
    query: 'screen=home',
    note: 'Greeting, hero figure, illustration bleeding off the page, then cards. The only screen where a figure is allowed to be the largest thing.',
  },
  {
    name: 'Ink detail',
    query: 'screen=txn&id=t001',
    note: 'A single subject printed on its category ink: eyebrow, name, amount, still-life, then the facts as rows.',
  },
  {
    name: 'Progress detail',
    query: 'screen=goal&id=g1',
    note: 'Figure against target, meter, illustration, contribution history. The meter fills from zero on arrival.',
  },
  {
    name: 'Grouped list',
    query: 'screen=activity',
    note: 'Sectioned rows under sticky date heads. Rows never wrap; the tab bar never crops one.',
  },
  {
    name: 'Settings',
    query: 'screen=settings',
    note: 'Group + Row + Toggle, nothing else. Captions carry the consequence of a switch, not the switch itself.',
  },
  {
    name: 'Analysis',
    query: 'screen=insights',
    note: 'Charts paired with the figure they describe, segmented control for range, one subject per card.',
  },
  {
    name: 'Sheet',
    query: 'screen=goal&id=g1&sheet=contribute',
    note: 'A bottom sheet over a live screen: grabber, title, keypad, one confirming action. Drag or fling to dismiss.',
  },
];

function ScreenTile({ a }: { a: Archetype }) {
  return (
    <figure className="screencell">
      <div className="screencell__frame">
        <iframe
          src={`/?${a.query}`}
          title={a.name}
          loading="lazy"
          style={{ transform: `scale(${SCALE})` }}
        />
      </div>
      <figcaption className="screencell__meta">
        <span className="screencell__name">{a.name}</span>
        <span className="screencell__note">{a.note}</span>
      </figcaption>
    </figure>
  );
}

export function Patterns() {
  return (
    <Chapter
      id="patterns"
      title="Patterns"
      lede={
        <>
          Thirty-nine routes resolve to eight shapes. Each tile below is the
          running app, deep-linked and scaled — if a screen drifts from its
          archetype, it drifts here too.
        </>
      }
    >
      <Sub title="Screen archetypes">
        <div className="screengrid">
          {ARCHETYPES.map((a) => <ScreenTile key={a.name} a={a} />)}
        </div>
        <Note kind="rule">
          <p>
            Every route is addressable — <Code>?screen=name&amp;id=x&amp;sheet=kind</Code>{' '}
            — which is how the capture harness, the blind-comparison tool and
            these tiles all reach the same screens without a special build.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Navigation model"
        note="A four-tab root with a push stack on top. Tabs are lateral and never grow the stack; everything else pushes and pops."
      >
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Move</th><th>Call</th><th>Direction</th><th>Transition</th></tr></thead>
            <tbody>
              <tr><td>Open a detail</td><td><Code>push(route)</Code></td><td>+1</td><td>In from 26% right</td></tr>
              <tr><td>Back</td><td><Code>back()</Code></td><td>−1</td><td>In from 18% left</td></tr>
              <tr><td>Switch tab</td><td><Code>goTab(tab)</Code></td><td>0</td><td>Cross-fade, stack reset</td></tr>
              <tr><td>Finish onboarding</td><td><Code>reset(route)</Code></td><td>+1</td><td>Stack replaced</td></tr>
              <tr><td>Present a sheet</td><td><Code>openSheet(sheet)</Code></td><td>—</td><td>Rises over the whole stack</td></tr>
            </tbody>
          </table>
        </div>
        <Snippet>
          {`const { push, back, goTab, openSheet } = useNav();

push({ name: 'goal', id: g.id });      // detail
openSheet({ kind: 'contribute', goalId: g.id });`}
        </Snippet>
      </Sub>

      <Sub
        title="Sheets"
        note="A sheet is for a decision that belongs to the screen behind it — adding a transaction, contributing to a goal, renaming a category. Anything that is its own subject gets a route instead."
      >
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Part</th><th>Rule</th></tr></thead>
            <tbody>
              <tr><td>Scrim</td><td>Cobalt-black at 34% with a 3px blur, and it is a real button labelled “Dismiss”.</td></tr>
              <tr><td>Grabber</td><td>Always present, always draggable, and the drag is the primary dismissal.</td></tr>
              <tr><td>Height</td><td>Content-sized, capped at 88% — a sheet must never read as a full screen.</td></tr>
              <tr><td>Dismissal</td><td>Fling past the velocity threshold, drag past a third of the height, tap the scrim, or press Escape.</td></tr>
              <tr><td>Bottom</td><td>Extends past the safe area and pulls back with a negative margin, so an elastic over-drag never reveals the scrim beneath.</td></tr>
            </tbody>
          </table>
        </div>
        <Note kind="why">
          <p>
            The sheet keeps its momentum through a dismissal because it moves
            on the <Code>surface</Code> spring rather than a curve. A curve
            would restart the animation from the release point and the sheet
            would visibly stall in your hand.
          </p>
        </Note>
      </Sub>

      <Sub title="Composing a screen">
        <Snippet>
          {`export function GoalDetail({ id }: { id: string }) {
  const goal = useGoal(id);                       // selectors, never props
  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane scroll-y">             {/* gutter + tabbar padding */}
        <Stack gap={28}>
          <Rise><PageHead eyebrow="Goal" title={goal.name} /></Rise>
          <Rise><Meter value={goal.saved / goal.target} /></Rise>
          <Rise><SectionHead title="Contributions" /></Rise>
        </Stack>
      </div>
    </Screen>
  );
}`}
        </Snippet>
        <DoDont>
          <Do>
            Read everything from the store selectors. A screen that hardcodes
            a string already in the seed data will disagree with the rest of
            the app the first time the data changes.
          </Do>
          <Dont>
            Let an illustration sit under text at low contrast. Text over
            artwork needs a scrim, a clear region of sky, or to move.
          </Dont>
          <Do>
            Give each section one subject, and separate sections by a visibly
            larger gap than anything inside them.
          </Do>
          <Dont>
            Add a screen-local CSS file that redefines a primitive. If two
            screens need the same shape, it belongs in the kit.
          </Dont>
        </DoDont>
      </Sub>
    </Chapter>
  );
}
