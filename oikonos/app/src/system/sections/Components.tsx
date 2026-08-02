import { useState } from 'react';
import {
  Amount, Button, Card, CategoryBadge, Choice, Delta, Empty, Eyebrow, Group,
  IconButton, Meter, PageHead, Row, Rule, SectionHead, Segmented, Toggle, TopBar,
} from '../../components/ui';
import { IcBank, IcCard, IcSail, IcSpark, Plus, Search } from '../../components/icons';
import { Chapter, Code, Do, DoDont, Dont, Note, PropTable, Snippet, Specimen, Sub } from '../kit';

/* ================================================================
   Buttons
   ================================================================ */

function Buttons() {
  return (
    <Sub
      title="Button"
      note="One component, four variants. Primary is a solid ink pill with a grain overlay and an ink-tinted shadow; ghost and outline are the same pill unfilled; quiet sits on a wash. Labels are uppercase Inter 700 at 12px — a button is a stamp, not a sentence."
    >
      <Specimen ground="paper" pad={24}>
        <div className="rowline">
          <Button>Get started</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="quiet">Quiet</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Specimen>

      <Specimen ground="paper" label="Ink choice — primary in each of the four inks, plus disabled" pad={24}>
        <div className="rowline">
          <Button ink="ink">Cobalt</Button>
          <Button ink="olive">Pine</Button>
          <Button ink="vermilion">Vermilion</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Specimen>

      <Specimen ground="ink" label="On a saturated field, primary flips to paper" pad={24}>
        <Button ink="paper" full trailing={<Plus size={18} />}>Add a transaction</Button>
      </Specimen>

      <PropTable
        rows={[
          { name: 'variant', type: "'primary' | 'ghost' | 'outline' | 'quiet'", def: "'primary'", note: 'Primary is solid and carries a shadow; the rest are flat. One primary per screen region.' },
          { name: 'ink', type: "'ink' | 'olive' | 'vermilion' | 'paper'", def: "'ink'", note: 'Paper is for buttons standing on a saturated field.' },
          { name: 'full', type: 'boolean', note: 'Fills the gutter width; the label centres and a trailing icon pins right.' },
          { name: 'icon / trailing', type: 'ReactNode', note: 'Leading icon sits with the label; trailing pins to the end.' },
          { name: 'disabled', type: 'boolean', note: 'Falls to pressed cream with faint ink, drops the shadow and the grain, and blocks press physics.' },
        ]}
      />

      <Note kind="rule">
        <p>
          Press physics scale with the target: a full-width button depresses
          to 0.978 while a 44px chip goes to 0.9. A uniform scale makes big
          buttons look like they are collapsing — see <Code>pressScale</Code>.
        </p>
      </Note>
    </Sub>
  );
}

/* ================================================================
   Surfaces
   ================================================================ */

function Surfaces() {
  return (
    <>
      <Sub
        title="Card"
        note="A raised cream surface, or a saturated panel. Cards carry texture automatically — tex-card on cream, tex-ink on a saturated tone — and flip their text colour with the ground."
      >
        <div className="grid2">
          <Card>
            <Eyebrow>This month</Eyebrow>
            <div className="figure" style={{ fontSize: 'var(--t-h2)', marginTop: 10 }}>
              <Amount value={48250} animate={false} />
            </div>
            <p style={{ fontSize: 'var(--t-small)', color: 'var(--fg-muted)', marginTop: 6 }}>
              Spent across 34 transactions
            </p>
          </Card>
          <Card tone="ink">
            <Eyebrow tone="var(--on-ink-muted)">Net worth</Eyebrow>
            <div className="figure" style={{ fontSize: 'var(--t-h2)', marginTop: 10 }}>
              <Amount value={874350} animate={false} />
            </div>
            <p style={{ fontSize: 'var(--t-small)', color: 'var(--on-ink-muted)', marginTop: 6 }}>
              Across four accounts
            </p>
          </Card>
        </div>

        <Specimen ground="paper" label="tone × elevation" pad={24} cols={150}>
          {(['paper', 'warm', 'ink', 'olive', 'vermilion'] as const).map((tone) => (
            <Card key={tone} tone={tone} pad={16} elevation={2}>
              <span style={{ fontSize: 'var(--t-caption)', fontWeight: 600 }}>{tone}</span>
            </Card>
          ))}
        </Specimen>

        <PropTable
          rows={[
            { name: 'tone', type: "'paper' | 'warm' | 'ink' | 'olive' | 'vermilion'", def: "'paper'", note: 'Saturated tones flip text to --on-ink and swap the texture.' },
            { name: 'pad', type: 'number', def: '20', note: '16 for a dense card, 20 default, 24 for a hero panel.' },
            { name: 'radius', type: 'string', def: '--r-lg', note: 'Only change it for a card that is not card-sized.' },
            { name: 'elevation', type: '0 | 1 | 2 | 3 | 4', def: '2', note: 'Maps to --sh-*. 0 for a card inside another surface.' },
            { name: 'onClick', type: '() => void', note: 'Renders a button element and adds press physics. Without it the card is a div.' },
          ]}
        />
      </Sub>

      <Sub
        title="Group and Row"
        note="Most of the app past the four tabs is a list of rows. One primitive, so the row rhythm cannot drift from screen to screen."
      >
        <Specimen ground="paper" pad={20}>
          <Group title="Accounts" caption="Balances refresh every six hours.">
            <Row icon={<IcBank size={17} />} ink="ink" title="HDFC Savings" sub="•••• 4412" value="₹2,14,900" chevron onClick={() => {}} />
            <Row icon={<IcCard size={17} />} ink="vermilion" title="Axis Credit" sub="Due in 6 days" value="−₹18,430" chevron onClick={() => {}} />
            <Row icon={<IcSail size={17} />} ink="olive" title="Santorini fund" sub="Goal · 62%" value="₹1,24,000" chevron onClick={() => {}} />
          </Group>
        </Specimen>

        <PropTable
          rows={[
            { name: 'icon', type: 'ReactNode', note: 'Sits in a 34px chip. With ink set the chip fills; without, it is pressed cream.' },
            { name: 'title / sub', type: 'string', note: 'Both truncate with an ellipsis rather than wrapping — a row is one line tall.' },
            { name: 'value', type: 'ReactNode', note: 'Right-aligned, tabular. Money here still comes from the format helpers.' },
            { name: 'chevron', type: 'boolean', note: 'Only on a row that navigates. A chevron on a row that toggles is a lie.' },
            { name: 'danger', type: 'boolean', note: 'Vermilion title, for destructive settings rows.' },
          ]}
        />
      </Sub>

      <Sub title="PageHead, TopBar, SectionHead">
        <Specimen ground="paper" pad={0}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto' }}>
            <TopBar onBack={() => {}} title="Santorini fund" />
            <div style={{ padding: '0 var(--gutter) 20px' }}>
              <PageHead
                eyebrow="Goal"
                title="Santorini fund"
                sub="₹1,24,000 of ₹2,00,000 · on pace for March"
                right={<IconButton label="Search"><Search size={18} /></IconButton>}
              />
              <SectionHead title="Contributions" action="See all" />
            </div>
          </div>
        </Specimen>
        <Note kind="rule">
          <p>
            A pushed screen gets one or the other, not both: <Code>TopBar</Code>{' '}
            for a screen that is a detail of something, <Code>PageHead</Code>{' '}
            for a screen that is its own subject. Hero screens use neither and
            let the illustration carry the top of the page.
          </p>
        </Note>
      </Sub>
    </>
  );
}

/* ================================================================
   Money and progress
   ================================================================ */

function MoneyPrimitives() {
  return (
    <>
      <Sub
        title="Amount"
        note="Every currency figure in the app. Groups by the Indian system, prints a true minus for outflows, and counts up from zero the first time it enters view — tabular, so nothing shimmers while it runs."
      >
        <Specimen ground="paper" pad={28}>
          <div className="stackline">
            <span className="figure" style={{ fontSize: 'var(--t-hero)', color: 'var(--ink)' }}>
              <Amount value={874350} />
            </span>
            <div className="rowline">
              <span className="figure" style={{ fontSize: 'var(--t-h4)', color: 'var(--olive)' }}>
                <Amount value={62400} sign />
              </span>
              <span className="figure" style={{ fontSize: 'var(--t-h4)', color: 'var(--vermilion)' }}>
                <Amount value={-2850} />
              </span>
              <span className="figure" style={{ fontSize: 'var(--t-h4)' }}>
                <Amount value={499} animate={false} />
              </span>
            </div>
          </div>
        </Specimen>
        <PropTable
          rows={[
            { name: 'value', type: 'number', note: 'Signed. A negative value prints −, a true minus, never a hyphen.' },
            { name: 'sign', type: 'boolean', note: 'Forces an explicit + or −. Use on income figures where the direction is the point.' },
            { name: 'animate', type: 'boolean', def: 'true', note: 'Set false inside a row or a chip — a list of counting numbers is noise.' },
            { name: 'duration', type: 'number', def: '1500', note: 'Milliseconds. Only lengthen for a genuine hero figure.' },
          ]}
        />
        <Note kind="trap">
          <p>
            A screenshot taken mid-count is a silent failure — the capture
            harness waits for figures to settle before it shoots. If you are
            comparing a render to a comp, confirm the number finished.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Meter and Delta"
        note="The meter is the system's signature: a printed bar that fills from zero the first time it is seen, once. Its track is opaque cream — a translucent cobalt track would resolve to grey."
      >
        <Specimen ground="paper" pad={24}>
          <div className="stackline">
            <Meter value={0.62} />
            <Meter value={0.88} ink="vermilion" height={10} showThumb />
            <Meter value={0.34} ink="ink" height={6} />
            <div className="rowline">
              <Delta value={12.4} suffix="vs last month" />
              <Delta value={-4.1} suffix="vs last month" />
            </div>
          </div>
        </Specimen>
        <PropTable
          rows={[
            { name: 'value', type: 'number', note: 'Clamped 0–1. Cap a full meter below 1.0 if "full" would read as broken.' },
            { name: 'ink', type: 'Ink', def: "'olive'", note: 'Pine for progress, vermilion for overrun, cobalt for neutral share.' },
            { name: 'track', type: 'string', note: 'Callers on a saturated field pass their own opaque track.' },
            { name: 'showThumb', type: 'boolean', note: 'A knob at the fill head, for a meter that reads as a position rather than an amount.' },
            { name: 'delay', type: 'number', note: 'Stagger meters in a list so they do not all fill at once.' },
          ]}
        />
      </Sub>

      <Sub title="CategoryBadge, Eyebrow, Rule">
        <Specimen ground="paper" pad={24}>
          <div className="rowline">
            <CategoryBadge icon="basket" />
            <CategoryBadge icon="sail" ink="ink" />
            <CategoryBadge icon="bolt" ink="vermilion" size={36} />
            <Eyebrow>Recent activity</Eyebrow>
          </div>
          <div style={{ marginTop: 20 }}><Rule /></div>
        </Specimen>
      </Sub>
    </>
  );
}

/* ================================================================
   Controls
   ================================================================ */

function Controls() {
  const [on, setOn] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [choice, setChoice] = useState('inr');
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');

  return (
    <Sub
      title="Controls"
      note="Toggle, Choice and Segmented cover every setting in the app. All three are real form semantics — switch, radio, tablist — so they arrive in the accessibility tree correctly without extra markup."
    >
      <div className="grid2">
        <Specimen ground="paper" pad={20}>
          <Group title="Notifications">
            <Row title="Weekly summary" trailing={<Toggle on={on} onChange={setOn} label="Weekly summary" />} />
            <Row title="Large transaction alerts" sub="Above ₹10,000" trailing={<Toggle on={alerts} onChange={setAlerts} label="Large transaction alerts" />} />
          </Group>
        </Specimen>

        <Specimen ground="paper" pad={20}>
          <Group title="Currency">
            <Choice selected={choice === 'inr'} label="Indian rupee" sub="₹ · lakh and crore grouping" onSelect={() => setChoice('inr')} />
            <Choice selected={choice === 'eur'} label="Euro" sub="€ · thousands grouping" onSelect={() => setChoice('eur')} />
          </Group>
        </Specimen>
      </div>

      <Specimen ground="paper" label="Segmented — the pill tracks the selection on the snap spring" pad={24}>
        <Segmented
          id="docs-range"
          value={range}
          onChange={setRange}
          options={[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'year', label: 'Year' },
          ]}
        />
      </Specimen>

      <Note kind="rule">
        <p>
          <Code>Segmented</Code> takes an <Code>id</Code> because the moving
          pill is a shared layout animation. Two segmented controls on one
          screen with the same id will hand the pill back and forth between
          them.
        </p>
      </Note>

      <Snippet>
        {`<Segmented
  id="cashflow-range"
  value={range}
  onChange={setRange}
  options={[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]}
/>`}
      </Snippet>
    </Sub>
  );
}

/* ================================================================
   Layout helpers and empty state
   ================================================================ */

function Helpers() {
  return (
    <Sub
      title="Stack, Rise and Empty"
      note="Stack drives a staggered entrance for its children; Rise is the child. Empty is the one shape every zero state takes, so an app with no data still looks designed."
    >
      <div className="grid2">
        <Specimen ground="paper" pad={0}>
          <Empty
            title="Nothing here yet"
            body="Transactions you add will appear on this screen, newest first."
            icon={<IcSpark size={28} />}
          />
        </Specimen>
        <div className="stackline">
          <Snippet>
            {`<Stack gap={12}>
  {rows.map((r) => (
    <Rise key={r.id}><Row {...r} /></Rise>
  ))}
</Stack>`}
          </Snippet>
          <Note kind="why">
            <p>
              The stagger lives on the container, not on each child, so a list
              of any length arrives in sequence without a component
              calculating its own delay.
            </p>
          </Note>
        </div>
      </div>

      <DoDont>
        <Do>
          Write empty-state copy that says what will appear here and how it
          gets here. "No data" tells a user nothing they did not know.
        </Do>
        <Dont>
          Give an empty state a full illustration. The drawings belong to hero
          screens; an empty list gets a single glyph.
        </Dont>
      </DoDont>
    </Sub>
  );
}

/* ================================================================ */

export function Components() {
  return (
    <Chapter
      id="components"
      title="Components"
      lede={
        <>
          The kit every screen is assembled from, live and imported from{' '}
          <Code>src/components/ui.tsx</Code> — these are the same components
          the app ships, not copies. Extend the kit when something is
          genuinely missing; never fork a near-duplicate.
        </>
      }
    >
      <Buttons />
      <Surfaces />
      <MoneyPrimitives />
      <Controls />
      <Helpers />

      <Sub title="Screen">
        <p className="sub__note">
          The scrolling body of a route: absolute, full-bleed, textured by
          tone, and isolated so its texture blends against itself. It is the
          only component that sets a screen's ground.
        </p>
        <PropTable
          rows={[
            { name: 'tone', type: "'paper' | 'ink' | 'olive'", def: "'paper'", note: 'Cream applies tex-paper; both saturated tones apply tex-ink.' },
          ]}
        />
        <Note kind="trap">
          <p>
            A screen with a saturated tone must also be listed in{' '}
            <Code>DARK_ROUTES</Code> so the status bar and the safe area
            follow it. The component cannot do this itself — the safe area is
            outside the route.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}
