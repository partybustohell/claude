import {
  compactINR, groupINR, inr, longDate, longDateTime, monthLabel,
  pctOf, relativeDay, shortDate, signedINR, time,
} from '../../lib/format';
import { Chapter, Code, Do, DoDont, Dont, Note, Snippet, Sub } from '../kit';

/** A fixed instant, so the specimen reads the same on every run. */
const NOW = new Date('2024-09-18T13:42:00');
const ISO = '2024-09-18T13:42:00';
const YESTERDAY = '2024-09-17T09:05:00';
const LAST_WEEK = '2024-09-13T18:20:00';
const MONTHS_AGO = '2024-05-18T11:00:00';

interface Case { call: string; out: string; note: string }

const MONEY: Case[] = [
  { call: 'inr(874350)', out: inr(874350), note: 'Indian grouping — three digits, then twos.' },
  { call: 'inr(-2850)', out: inr(-2850), note: 'A true minus sign, never a hyphen.' },
  { call: 'signedINR(62400)', out: signedINR(62400), note: 'Unsigned when positive; the row context carries direction.' },
  { call: 'compactINR(874350)', out: compactINR(874350), note: 'Lakh. For axis labels and dense chips only.' },
  { call: 'compactINR(12400000)', out: compactINR(12400000), note: 'Crore.' },
  { call: 'compactINR(8400)', out: compactINR(8400), note: 'Thousands.' },
  { call: 'groupINR(499)', out: groupINR(499), note: 'Bare grouping, no symbol — for a figure that supplies its own.' },
  { call: 'pctOf(124000, 200000)', out: `${pctOf(124000, 200000)}%`, note: 'Always floors.' },
  { call: 'pctOf(199999, 200000)', out: `${pctOf(199999, 200000)}%`, note: 'One rupee short must never round up to 100.' },
];

const DATES: Case[] = [
  { call: 'relativeDay(today)', out: relativeDay(ISO, NOW), note: 'Activity section heads.' },
  { call: 'relativeDay(yesterday)', out: relativeDay(YESTERDAY, NOW), note: '' },
  { call: 'relativeDay(this week)', out: relativeDay(LAST_WEEK, NOW), note: 'Weekday name inside seven days.' },
  { call: 'relativeDay(older)', out: relativeDay(MONTHS_AGO, NOW), note: 'Falls back to month and day.' },
  { call: 'shortDate(iso)', out: shortDate(ISO), note: 'Dense metadata.' },
  { call: 'longDate(iso)', out: longDate(ISO), note: 'Detail screens.' },
  { call: 'longDateTime(iso)', out: longDateTime(ISO), note: 'Transaction detail — separated by a bullet.' },
  { call: 'time(iso)', out: time(ISO), note: '12-hour, uppercase meridiem.' },
  { call: 'monthLabel(iso)', out: monthLabel(ISO), note: 'Budget and report headers.' },
];

function CaseTable({ rows }: { rows: Case[] }) {
  return (
    <div className="tablewrap">
      <table className="tbl">
        <thead><tr><th>Call</th><th>Renders</th><th>Notes</th></tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.call}>
              <td><Code>{c.call}</Code></td>
              <td className="figure" style={{ fontSize: 'var(--t-body)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                {c.out}
              </td>
              <td>{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Content() {
  return (
    <Chapter
      id="content"
      title="Content"
      lede={
        <>
          Numbers and words are part of the system, not a layer applied over
          it. Every figure in the app goes through{' '}
          <Code>src/lib/format.ts</Code>, and every string is written to the
          same voice: plain, second person, and never anxious about money.
        </>
      }
    >
      <Sub
        title="Money"
        note="Rendered live by the app's own helpers — these are outputs, not examples typed into a document."
      >
        <CaseTable rows={MONEY} />
        <Note kind="rule">
          <p>
            Never hand-format a number. Grouping, the minus sign, the rupee
            symbol and rounding all have exactly one implementation, and a
            screen that reimplements any of them will disagree with the rest
            of the app at some value.
          </p>
        </Note>
        <Snippet>
          {`import { inr, compactINR, pctOf } from '../lib/format';

<Amount value={txn.amount} />        {/* hero and row figures */}
{compactINR(bucket.total)}           {/* axis labels only */}
{pctOf(goal.saved, goal.target)}%    {/* progress, floored */}`}
        </Snippet>
      </Sub>

      <Sub title="Dates and time">
        <CaseTable rows={DATES} />
      </Sub>

      <Sub
        title="Voice"
        note="The app is a calm ledger, not a coach. It states what happened and what is true now; it does not celebrate, warn, or moralise about spending."
      >
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Element</th><th>Case</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td>Eyebrow</td><td>Uppercase, two or three words</td><td className="tbl__type">RECENT ACTIVITY</td></tr>
              <tr><td>Page title</td><td>Sentence case</td><td className="tbl__type">Santorini fund</td></tr>
              <tr><td>Row title</td><td>Sentence case, no trailing period</td><td className="tbl__type">Weekly summary</td></tr>
              <tr><td>Row subtitle</td><td>Sentence case, the fact behind the title</td><td className="tbl__type">Above ₹10,000</td></tr>
              <tr><td>Button</td><td>Uppercase, verb first, two words at most</td><td className="tbl__type">GET STARTED</td></tr>
              <tr><td>Group caption</td><td>Full sentence with a period</td><td className="tbl__type">Balances refresh every six hours.</td></tr>
              <tr><td>Empty state</td><td>What appears here, and how it gets here</td><td className="tbl__type">Transactions you add will appear here.</td></tr>
            </tbody>
          </table>
        </div>

        <DoDont>
          <Do>
            Write in second person about the user's own money: “You are ahead
            of pace this month.”
          </Do>
          <Dont>
            Congratulate or scold. “Great job saving!” and “You overspent
            again” both editorialise about someone's private finances.
          </Dont>
          <Do>
            Say the consequence in a caption when a control has one:
            “Turning this off stops all payment reminders.”
          </Do>
          <Dont>
            Use exclamation marks, emoji, or bank jargon. If a real teller
            would not say it out loud, it does not ship.
          </Dont>
        </DoDont>

        <Note kind="rule">
          <p>
            Currency is always ₹ with Indian grouping, dates are always
            rendered through the helpers, and a percentage is always floored.
            Consistency in these three is what makes the app feel like a
            single ledger rather than a set of screens.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}
