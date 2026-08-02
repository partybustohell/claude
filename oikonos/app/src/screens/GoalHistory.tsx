/**
 * GOAL HISTORY — every rupee that ever went in.
 *
 * The goal screen shows a balance. This one shows how the balance was
 * built: each contribution, grouped by month, marked automatic or
 * deliberate, and drawn as a climb against the target and the date the
 * user is aiming at.
 *
 * The insight the ledger holds but never states: the standing instruction
 * and the observed rate are two different speeds, and the gap between the
 * dates they land on is exactly what the hand-made top-ups have bought.
 */
import { useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useApp, useContributions, useGoal } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Meter, Amount,
  SectionHead, Empty, Button, INK_HEX, INK_VAR, type Ink,
} from '../components/ui';
import { IcCoin, IcRepeat, Plus } from '../components/icons';
import {
  inr, compactINR, pctOf, monthLabel, longDate, shortDate, clamp,
} from '../lib/format';
import { reveal, gentle, snap, fade } from '../lib/motion';
import './GoalHistory.css';
import { PlateFoot } from '../illustrations/place';

const DAY = 86_400_000;
const MONTH_DAYS = 30.4375;

/** Date-only strings parse as UTC; pin them to local midnight so a month
 *  label never slips backwards on a negative offset. */
function ms(iso: string): number {
  return new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso).getTime();
}

/* ================================================================
   The climb
   ----------------------------------------------------------------
   Sparkline plots evenly spaced values with no reference lines. A
   balance is a step function on a real time axis, and it only means
   anything next to the target and the date it is due — so this chart
   is its own shape, not a fork of that one.
   ================================================================ */

function Climb({
  points, target, startMs, nowMs, targetMs, projMs, ink,
}: {
  points: { at: number; total: number }[];
  target: number;
  startMs: number;
  nowMs: number;
  targetMs: number;
  projMs: number | null;
  ink: Ink;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  const W = 342;
  const H = 132;
  const padT = 14;
  const padB = 22;
  const padR = 4;

  const t0 = startMs;
  const t1 = Math.max(targetMs, projMs ?? 0, nowMs) + DAY * 6;
  const x = (t: number) => padR + ((t - t0) / (t1 - t0)) * (W - padR * 2);
  const y = (v: number) => padT + (1 - clamp(v / target, 0, 1)) * (H - padT - padB);

  let d = `M${x(points[0].at)},${y(0)}`;
  let prev = 0;
  for (const p of points) {
    d += ` L${x(p.at)},${y(prev)} L${x(p.at)},${y(p.total)}`;
    prev = p.total;
  }
  d += ` L${x(nowMs)},${y(prev)}`;

  const last = points[points.length - 1];
  const proj = projMs === null ? null
    : `M${x(nowMs)},${y(last.total)} L${x(projMs)},${y(target)}`;

  const c = INK_HEX[ink];

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width="100%" className="gh__climb"
      fill="none" role="img"
      aria-label={`Balance climbing from ${inr(0)} to ${inr(last.total)} against a ${inr(target)} target`}>
      {/* target ceiling */}
      <line x1={0} y1={y(target)} x2={W} y2={y(target)}
        stroke={c} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <text x={0} y={y(target) - 6} className="gh__climblab" fill="currentColor">
        {compactINR(target)} target
      </text>

      {/* the date the user is aiming at */}
      <line x1={x(targetMs)} y1={padT - 8} x2={x(targetMs)} y2={H - padB}
        stroke={c} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <text x={x(targetMs)} y={H - 7} textAnchor="middle"
        className="gh__climbaxis" fill="currentColor">
        {shortDate(`${new Date(targetMs).toISOString().slice(0, 10)}T00:00:00`)}
      </text>

      {/* baseline */}
      <line x1={0} y1={y(0)} x2={W} y2={y(0)} stroke={c} strokeWidth="1" opacity="0.18" />
      <text x={0} y={H - 7} className="gh__climbaxis" fill="currentColor">
        {shortDate(`${new Date(startMs).toISOString().slice(0, 10)}T00:00:00`)}
      </text>

      {/* Projection at the observed rate. Fades rather than draws: framer
          drives pathLength through stroke-dasharray, which would overwrite
          the dash pattern that marks this run as hypothetical. */}
      {proj && (
        <motion.path d={proj} stroke={c} strokeWidth="1.6" strokeDasharray="4 5"
          strokeLinecap="round" vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView || reduce ? 0.55 : 0 }}
          transition={reduce ? { duration: 0 } : { ...fade, delay: 0.85 }} />
      )}

      {/* the climb itself */}
      <motion.path d={d} stroke={c} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView || reduce ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : reveal} />

      {points.map((p, i) => (
        <motion.circle key={i} cx={x(p.at)} cy={y(p.total)} r="3" fill={c}
          stroke="var(--paper)" strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: inView || reduce ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.35 + i * 0.06 }}
          style={{ transformOrigin: `${x(p.at)}px ${y(p.total)}px` }} />
      ))}
    </svg>
  );
}

/* ================================================================
   Screen
   ================================================================ */

export function GoalHistory({ id }: { id: string }) {
  const goal = useGoal(id);
  const rows = useContributions(id);
  const { now } = useApp();
  const { back, openSheet } = useNav();

  /* Newest first for reading; oldest first for the climb. */
  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const c of rows) {
      const k = c.at.slice(0, 7);
      const arr = map.get(k);
      if (arr) arr.push(c); else map.set(k, [c]);
    }
    return [...map.entries()].map(([month, items]) => ({
      month,
      items,
      total: items.reduce((n, c) => n + c.amount, 0),
    }));
  }, [rows]);

  const climb = useMemo(() => {
    const asc = [...rows].sort((a, b) => a.at.localeCompare(b.at));
    let run = 0;
    return asc.map((c) => {
      run += c.amount;
      return { at: ms(c.at), total: run, id: c.id };
    });
  }, [rows]);

  /** Balance immediately after each contribution, keyed by id. */
  const runningAt = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of climb) m.set(p.id, p.total);
    return m;
  }, [climb]);

  if (!goal) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <Empty title="Goal not found" body="This goal is no longer on your list." />
        </div>
      </Screen>
    );
  }

  const contributed = rows.reduce((n, c) => n + c.amount, 0);
  const topUps = rows.filter((c) => !c.auto);
  const topUpTotal = topUps.reduce((n, c) => n + c.amount, 0);
  const perMonth = groups.length > 0 ? contributed / groups.length : 0;

  const nowMs = ms(now);
  const targetMs = ms(goal.by);
  const remaining = Math.max(0, goal.target - goal.saved);
  const done = remaining === 0;

  /* At the rate actually observed, and at the standing instruction alone. */
  const projMs = !done && perMonth > 0
    ? nowMs + (remaining / perMonth) * MONTH_DAYS * DAY
    : null;
  const autoMs = !done && goal.monthly > 0
    ? nowMs + (remaining / goal.monthly) * MONTH_DAYS * DAY
    : null;

  const daysVsTarget = projMs === null ? 0 : Math.round((targetMs - projMs) / DAY);
  const boughtDays = projMs !== null && autoMs !== null
    ? Math.round((autoMs - projMs) / DAY)
    : 0;

  const iso = (t: number) => `${new Date(t).toISOString().slice(0, 10)}T00:00:00`;

  if (rows.length === 0) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <PageHead eyebrow="Contributions" title={goal.name} />
          <Empty
            title="Nothing has gone in yet"
            body={`The first ${inr(goal.monthly)} lands on the 2nd. Or start it early with a top-up.`}
            icon={<IcCoin size={26} />}
          />
          <Button
            ink="ink"
            full
            icon={<Plus size={17} />}
            onClick={() => openSheet({ kind: 'contribute', goalId: goal.id })}
          >
            Add money
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Contributions"
              title={goal.name}
              sub={`${rows.length} deposits since ${monthLabel(rows[rows.length - 1].at)}`}
            />
          </Rise>

          {/* ---- Where it stands ---- */}
          <Rise>
            <div className="gh__standing">
              <p className="gh__figure">
                <Amount value={goal.saved} duration={1400} />
                <span className="gh__of">of {inr(goal.target)}</span>
              </p>
              <Meter
                value={clamp(goal.saved / goal.target, 0, 1)}
                ink={goal.ink}
                height={8}
                delay={0.2}
              />
              <div className="gh__standfoot">
                <span>{pctOf(goal.saved, goal.target)}% there</span>
                <span className="num">{inr(remaining)} to go</span>
              </div>
            </div>
          </Rise>

          {/* ---- The climb ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <SectionHead title="The climb" />
            <div className="gh__chart">
              <Climb
                points={climb}
                target={goal.target}
                startMs={climb[0].at}
                nowMs={nowMs}
                targetMs={targetMs}
                projMs={projMs}
                ink={goal.ink}
              />
            </div>
            <p className="gh__caption">
              Solid is what has actually landed; the dashed run is the same
              average carried forward. The vertical rule is{' '}
              {longDate(`${goal.by}T00:00:00`)}, the date you set.
            </p>
          </Rise>

          {/* ---- Summary ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="gh__stats">
              <Stat label="Contributed" value={inr(contributed)} note={`${rows.length} deposits`} />
              <Stat
                label="Per month"
                value={inr(Math.round(perMonth))}
                note={`across ${groups.length} months`}
              />
              <Stat
                label="Top-ups"
                value={String(topUps.length)}
                note={topUps.length > 0 ? `${compactINR(topUpTotal)} by hand` : 'all automatic'}
              />
              <Stat
                label="At this rate"
                value={projMs === null ? 'Complete' : monthLabel(iso(projMs))}
                note={projMs === null
                  ? 'target reached'
                  : daysVsTarget >= 0
                    ? `${daysVsTarget} days early`
                    : `${-daysVsTarget} days late`}
                tone={projMs !== null && daysVsTarget < 0 ? 'var(--vermilion)' : 'var(--olive)'}
              />
            </div>
          </Rise>

          {/* ---- What the top-ups bought ---- */}
          <Rise style={{ paddingTop: 22 }}>
            <div className="gh__pull">
              <Eyebrow tone="var(--olive)">Reading the rate</Eyebrow>
              <p>
                {done
                  ? `Funded. ${inr(contributed)} arrived across ${groups.length} months, ${topUps.length > 0 ? `${inr(topUpTotal)} of it by hand` : 'every rupee on the standing instruction'}.`
                  : boughtDays > 0
                    ? `The ${topUps.length === 1 ? 'single' : `${topUps.length}`} top-up${topUps.length === 1 ? '' : 's'} ${topUps.length === 1 ? 'is' : 'are'} worth ${boughtDays} days. On the standing ${inr(goal.monthly)} alone this lands ${longDate(iso(autoMs as number))}; at the ${inr(Math.round(perMonth))} you have actually been putting in, ${longDate(iso(projMs as number))}.`
                    : `Every rupee so far has come from the standing ${inr(goal.monthly)}. Nothing has been added by hand, so the projection and the instruction are the same date.`}
              </p>
              {!done && (
                <p className="gh__pullsub">
                  {daysVsTarget >= 0
                    ? `Either way it clears ${longDate(`${goal.by}T00:00:00`)} — ${inr(remaining)} left, ${Math.max(1, Math.ceil(remaining / Math.max(perMonth, 1)))} more deposits at this size.`
                    : `That is past ${longDate(`${goal.by}T00:00:00`)}. Closing the gap needs about ${inr(Math.round(remaining / Math.max(1, (targetMs - nowMs) / DAY / MONTH_DAYS)))} a month instead.`}
                </p>
              )}
            </div>
          </Rise>

          {/* ---- Every deposit ---- */}
          <Rise style={{ paddingTop: 28, paddingBottom: 2 }}>
            <SectionHead title="Every deposit" />
          </Rise>

          {groups.map((g) => (
            <Rise key={g.month} style={{ paddingTop: 14 }}>
              <div className="gh__mhead">
                <span className="gh__mlabel">{monthLabel(`${g.month}-01T00:00:00`)}</span>
                <span className="gh__mtotal num">{inr(g.total)}</span>
              </div>
              <div className="gh__list">
                {g.items.map((c) => (
                  <div className="gh__row" key={c.id}>
                    <span
                      className={`gh__mark ${c.auto ? 'gh__mark--auto' : 'gh__mark--hand'}`}
                      aria-hidden
                      style={c.auto ? undefined : { background: INK_VAR[goal.ink] }}
                    >
                      {c.auto ? <IcRepeat size={13} /> : <Plus size={13} />}
                    </span>
                    <span className="gh__rowbody">
                      <span className="gh__rowtitle">
                        {c.auto ? 'Automatic save' : 'Top-up'}
                      </span>
                      <span className="gh__rowsub">
                        {shortDate(c.at)} · balance {inr(runningAt.get(c.id) ?? 0)}
                      </span>
                    </span>
                    <span className="figure gh__rowamt">+{inr(c.amount)}</span>
                  </div>
                ))}
              </div>
            </Rise>
          ))}

          <Rise style={{ paddingTop: 26, paddingBottom: 8 }}>
            <Button
              ink={goal.ink}
              full
              icon={<Plus size={17} />}
              onClick={() => openSheet({ kind: 'contribute', goalId: goal.id })}
            >
              Add money
            </Button>
            <p className="gh__foot">
              Automatic saves are the standing {inr(goal.monthly)} on the 2nd.
              Anything else is a decision you made, and those are the ones that
              move the date.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="ascent" height={150} />
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({
  label, value, note, tone,
}: { label: string; value: string; note: string; tone?: string }) {
  return (
    <motion.div className="gh__stat" whileHover={{ y: -1 }} transition={snap}>
      <span className="gh__statlab">{label}</span>
      <span className="figure gh__statval" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
      <span className="gh__statnote">{note}</span>
    </motion.div>
  );
}
