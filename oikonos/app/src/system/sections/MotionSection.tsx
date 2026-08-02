import { useState } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { gentle, screen, snap, surface, fade, reveal } from '../../lib/motion';
import { Button, Rise, Stack } from '../../components/ui';
import { DURATION, EASING } from '../tokens';
import {
  Chapter, Code, Do, DoDont, Dont, Note, Snippet, Specimen, Sub, TokenTable,
} from '../kit';

const SPRINGS: { name: string; t: Transition; use: string }[] = [
  { name: 'snap', t: snap, use: 'Press, toggle, chip, segmented pill. Critically damped and very quick — feedback, not animation.' },
  { name: 'gentle', t: gentle, use: 'Element enter and layout shift. A trace of overshoot so a row arriving feels alive.' },
  { name: 'surface', t: surface, use: 'Sheets, meters, cards taking flight. Weighty, never sluggish.' },
  { name: 'screen', t: screen, use: 'Route transitions. The heaviest object in the system.' },
];

/** Distance the puck travels, in px. */
const TRAVEL = 208;

function spec(t: Transition): string {
  const s = t as { stiffness?: number; damping?: number; mass?: number };
  return `stiffness ${s.stiffness} · damping ${s.damping} · mass ${s.mass}`;
}

function SpringLab({ name, t, use, on }: { name: string; t: Transition; use: string; on: boolean }) {
  return (
    <div className="lab">
      <div className="lab__head">
        <span className="lab__name">{name}</span>
        <span className="lab__spec">{spec(t)}</span>
      </div>
      {/* Fixed travel rather than a percentage, so the four springs are
          compared over identical distance whatever the column width. */}
      <div className="lab__track">
        <motion.span className="lab__puck" animate={{ x: on ? TRAVEL : 0 }} transition={t} />
      </div>
      <p className="lab__note">{use}</p>
    </div>
  );
}

export function MotionSection() {
  const [on, setOn] = useState(false);
  const [seq, setSeq] = useState(0);
  const reduced = useReducedMotion();

  return (
    <Chapter
      id="motion"
      title="Motion"
      lede={
        <>
          Four springs are the entire vocabulary. Springs rather than curves
          because a spring carries its momentum through an interruption — grab
          a sheet mid-flight and it follows your finger instead of jumping to
          a new curve. Durations exist only for things that do not move:
          colour and opacity.
        </>
      }
    >
      <Sub title="The four springs">
        <div className="rowline">
          <Button variant="quiet" onClick={() => setOn((v) => !v)}>
            {on ? 'Send back' : 'Play all'}
          </Button>
          <span className="caplabel">
            {reduced ? 'Reduced motion is on — springs resolve instantly' : 'Same distance, four masses'}
          </span>
        </div>
        <div className="grid2">
          {SPRINGS.map((s) => <SpringLab key={s.name} {...s} on={on} />)}
        </div>
        <Snippet>
          {`import { snap, gentle, surface, screen } from '../lib/motion';

<motion.button whileTap={{ scale: 0.975, y: 1 }} transition={snap} />`}
        </Snippet>
        <Note kind="rule">
          <p>
            Do not hand-roll stiffness values in a component. If a movement
            genuinely needs physics none of the four provide, add a fifth
            preset to <Code>lib/motion.ts</Code> with a note on what it is
            for — and expect to be asked why the existing four failed.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Non-spring transitions"
        note="Opacity on a spring looks mushy: the overshoot has nowhere to go. Two eased curves cover fades."
      >
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Preset</th><th>Spec</th><th>Use for</th></tr></thead>
            <tbody>
              <tr>
                <td><Code>fade</Code></td>
                <td className="tbl__type">{`${(fade as { duration: number }).duration}s ease-out`}</td>
                <td>Scrims, cross-fades, anything opacity-only.</td>
              </tr>
              <tr>
                <td><Code>reveal</Code></td>
                <td className="tbl__type">{`${(reveal as { duration: number }).duration}s ease-out`}</td>
                <td>Hero numerals and the sparkline draw-on.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TokenTable group={DURATION} />
        <TokenTable group={EASING} />
      </Sub>

      <Sub
        title="Entrances stagger"
        note="A list that appears all at once reads as a page load. Wrap the container in Stack and each child in Rise, and they arrive in sequence at 55ms intervals."
      >
        <div className="rowline">
          <Button variant="quiet" onClick={() => setSeq((n) => n + 1)}>Replay</Button>
          <span className="caplabel">Stack + Rise</span>
        </div>
        <Specimen ground="paper" pad={20}>
          <Stack key={seq} gap={10}>
            {['Groceries', 'Ferry to Naxos', 'Rent', 'Salary'].map((label) => (
              <Rise key={label}>
                <div
                  style={{
                    padding: '14px 16px', borderRadius: 'var(--r-md)',
                    background: 'var(--paper-warm)', fontSize: 'var(--t-body)',
                    boxShadow: 'inset 0 0 0 1px var(--hairline-soft)',
                  }}
                >
                  {label}
                </div>
              </Rise>
            ))}
          </Stack>
        </Specimen>
      </Sub>

      <Sub title="Choreography rules">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>Moment</th><th>Behaviour</th><th>Owned by</th></tr></thead>
            <tbody>
              <tr>
                <td>Route push / pop</td>
                <td>Incoming slides 26% with the <Code>screen</Code> spring; outgoing leaves 18% the other way, damped harder so it clears first.</td>
                <td><Code>pageVariants</Code></td>
              </tr>
              <tr>
                <td>Sheet present</td>
                <td>Rises from 100% on <Code>surface</Code>; drag past a third of its height or fling it and it leaves carrying momentum.</td>
                <td><Code>sheetVariants</Code>, <Code>SheetHost</Code></td>
              </tr>
              <tr>
                <td>Meter fill</td>
                <td>Fills from zero the first time it enters view, once — not on every scroll past.</td>
                <td><Code>Meter</Code></td>
              </tr>
              <tr>
                <td>Hero figure</td>
                <td>Counts up from zero on an ease-out-expo over 1.5s, tabular so digits do not shimmer.</td>
                <td><Code>Amount</Code></td>
              </tr>
              <tr>
                <td>Press</td>
                <td>Scale falls with target size — a 44px chip depresses to 0.9, a full-width button to 0.978.</td>
                <td><Code>pressScale</Code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub
        title="Reduced motion"
        note="Honoured at the token layer and inside every animated primitive, so a component author gets it for free."
      >
        <Snippet>
          {`@media (prefers-reduced-motion: reduce) {
  :root { --dur-1: 1ms; --dur-2: 1ms; --dur-3: 1ms; --dur-4: 1ms; }
}`}
        </Snippet>
        <DoDont>
          <Do>
            Read <Code>useReducedMotion()</Code> in any primitive that
            animates position or scale, and collapse to the end state — the
            information must still be there, just not travelled to.
          </Do>
          <Dont>
            Leave a count-up running under reduced motion. <Code>Amount</Code>{' '}
            jumps straight to the final figure; a new numeric animation must do
            the same.
          </Dont>
        </DoDont>
      </Sub>
    </Chapter>
  );
}
