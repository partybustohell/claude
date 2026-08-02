/**
 * BUDGET DETAIL — one envelope, opened.
 *
 * The budgets list ranks envelopes against each other. This screen owes a
 * single envelope four answers, in the order a person actually asks them:
 * how much is gone, why the ceiling is not the number you set (rollover),
 * whether the spending is ahead of the calendar, and what filled it.
 *
 * The line the ledger never states outright is about the rollover. A
 * carried balance only matters if the month would otherwise breach the
 * base limit — an envelope projected to close under it is holding money
 * that will simply roll again, month after month, doing no work.
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useApp, useBudgetRows, useCategory, useActions,
} from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Meter, Amount,
  CategoryBadge, SectionHead, Empty, Button, IconButton, INK_VAR, type Ink,
} from '../components/ui';
import { Pencil, IcCoin, ChevronRight } from '../components/icons';
import {
  inr, compactINR, pctOf, relativeDay, time, monthYearShort,
} from '../lib/format';
import { snap, surface } from '../lib/motion';
import './BudgetDetail.css';

/** '2024-05' → 'May' */
function shortMonth(ym: string): string {
  return monthYearShort(`${ym}-01T00:00:00`).slice(0, 3);
}

/* ================================================================
   Six-month column strip
   ----------------------------------------------------------------
   Not a MonthColumns: that chart pairs income against expenses on a
   shared scale. This one plots a single series against a ceiling line
   that moves, and has to distinguish "spent nothing" from "the ledger
   does not itemise this month" — a zero and an unknown must not print
   as the same bar. Shared with NewBudget, which moves the line live.
   ================================================================ */

export function CategoryMonths({
  months, line, lineLabel, ink, coverage, height = 96,
}: {
  months: { month: string; value: number }[];
  /** the ceiling drawn across the plot */
  line: number;
  lineLabel: string;
  ink: Ink;
  /** months the ledger actually itemises */
  coverage: Set<string>;
  height?: number;
}) {
  const known = months.filter((m) => coverage.has(m.month)).map((m) => m.value);
  const top = Math.max(line, ...known, 1) * 1.08;

  return (
    <div className="cmx">
      {/* the ceiling is named above the plot, never inside it — an in-plot
          label collides with whichever column happens to be tallest */}
      <div className="cmx__head">
        <span className="cmx__linelab num">{lineLabel}</span>
      </div>
      <div className="cmx__plot" style={{ height }}>
        <div className="cmx__line" style={{ bottom: `${(line / top) * 100}%` }} />
        {months.map((m, i) => {
          const seen = coverage.has(m.month);
          const h = seen ? Math.max(3, (m.value / top) * height) : 0;
          const hot = seen && m.value > line;
          return (
            <div className="cmx__slot" key={m.month}>
              {seen ? (
                <>
                  <motion.span
                    className="cmx__bar tex-ink"
                    style={{
                      height: h,
                      background: hot ? INK_VAR.vermilion : INK_VAR[ink],
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...surface, delay: 0.05 * i }}
                  />
                  <span className="cmx__val num" style={{ bottom: h + 5 }}>
                    {m.value > 0 ? compactINR(m.value) : '0'}
                  </span>
                </>
              ) : (
                <span className="cmx__void" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
      <div className="cmx__axis">
        {months.map((m) => (
          <span
            key={m.month}
            className={coverage.has(m.month) ? '' : 'cmx__axis--faint'}
          >
            {shortMonth(m.month)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Screen
   ================================================================ */

export function BudgetDetail({ id }: { id: string }) {
  const rows = useBudgetRows();
  const row = rows.find((r) => r.id === id);
  const { now, txns } = useApp();
  const cat = useCategory(row?.category ?? null);
  const { removeBudget } = useActions();
  const { back, openSheet, push } = useNav();
  const [confirm, setConfirm] = useState(false);

  const coverage = useMemo(
    () => new Set(txns.map((t) => t.at.slice(0, 7))),
    [txns],
  );

  const clock = useMemo(() => {
    const d = new Date(now);
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const day = d.getDate();
    return {
      dim, day, left: dim - day, elapsed: day / dim,
      label: monthYearShort(now).split(' ')[0],
    };
  }, [now]);

  if (!row || !cat) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <Empty
            title="No such envelope"
            body="This budget has been removed. The category still records on its own."
            icon={<IcCoin size={26} />}
          />
        </div>
      </Screen>
    );
  }

  const { spent, available, remaining, rollover, limit, meta } = row;
  const over = remaining < 0;
  const ratio = available > 0 ? spent / available : 0;

  /* ---- Pace ---- */
  const perDay = clock.day > 0 ? spent / clock.day : 0;
  const projected = perDay * clock.dim;
  const safeDaily = clock.left > 0
    ? Math.max(0, remaining) / clock.left
    : Math.max(0, remaining);
  const ahead = ratio > clock.elapsed + 0.04;
  const behind = ratio < clock.elapsed - 0.04;

  /* ---- What the rollover is actually doing ---- */
  const rollWord = rollover > 0
    ? `April closed ${inr(rollover)} under, and the balance came with you: this envelope holds ${inr(available)} rather than the ${inr(limit)} you set.`
    : rollover < 0
      ? `April overspent by ${inr(-rollover)}, and the shortfall followed: the month starts at ${inr(available)}, not the ${inr(limit)} you set.`
      : `Nothing carried in from April. The ceiling is exactly the ${inr(limit)} you set.`;

  const rollInsight = rollover > 0
    ? (projected <= limit
      ? `At today’s rate the month closes near ${inr(Math.round(projected))} — under the base limit on its own. The ${inr(rollover)} carried in is idle, and will simply roll again.`
      : projected <= available
        ? `At today’s rate the month closes near ${inr(Math.round(projected))}. The rollover is the only reason that lands inside the ceiling — without it you would finish ${inr(Math.round(projected - limit))} over.`
        : `At today’s rate the month closes near ${inr(Math.round(projected))} — ${inr(Math.round(projected - available))} past the ceiling even with the rollover behind it.`)
    : projected > available
      ? `At today’s rate the month closes near ${inr(Math.round(projected))}, ${inr(Math.round(projected - available))} past the ceiling.`
      : `At today’s rate the month closes near ${inr(Math.round(projected))}, ${inr(Math.round(available - projected))} inside the ceiling.`;

  /* ---- What filled it ---- */
  const month = now.slice(0, 7);
  const items = cat.items.filter((t) => t.at.slice(0, 7) === month && t.amount < 0);
  const biggest = items.reduce((m, t) => Math.max(m, Math.abs(t.amount)), 0);
  const today = items
    .filter((t) => t.at.slice(0, 10) === now.slice(0, 10))
    .reduce((n, t) => n + Math.abs(t.amount), 0);

  return (
    <Screen>
      <TopBar
        onBack={back}
        right={(
          <IconButton
            label="Edit monthly limit"
            bordered={false}
            onClick={() => openSheet({ kind: 'editBudget', budgetId: row.id })}
          >
            <Pencil size={20} />
          </IconButton>
        )}
      />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Envelope"
              title={meta.label}
              sub={`${inr(limit)} a month · ${clock.label} ${now.slice(0, 4)}`}
              right={<CategoryBadge icon={meta.icon} ink={meta.ink} size={46} />}
            />
          </Rise>

          {/* ---- The envelope ---- */}
          <Rise>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">
                {over ? 'Over the ceiling' : 'Spent this month'}
              </Eyebrow>
              <p className="bd__hero">
                <Amount value={spent} duration={1300} />
                <span className="bd__heroof">of {inr(available)}</span>
              </p>

              <div className="bd__meter">
                <Meter
                  value={Math.min(1, ratio)}
                  ink={over || ratio > 0.85 ? 'vermilion' : 'olive'}
                  track="rgba(253,248,236,0.20)"
                  height={9}
                  delay={0.22}
                />
                <span
                  className="bd__today"
                  style={{ left: `${clock.elapsed * 100}%` }}
                  aria-hidden
                />
              </div>

              <div className="bd__meterfoot">
                <span>{pctOf(spent, available)}% used · day {clock.day} of {clock.dim}</span>
                <span className="num bd__left">
                  {over ? `${inr(-remaining)} over` : `${inr(remaining)} left`}
                </span>
              </div>
            </Card>
          </Rise>

          {/* ---- Rollover, in words ---- */}
          <Rise style={{ paddingTop: 22 }}>
            <div className={`bd__roll ${rollover < 0 ? 'bd__roll--debt' : ''}`}>
              <Eyebrow tone={rollover < 0 ? 'var(--vermilion-deep)' : 'var(--olive)'}>
                {rollover === 0
                  ? 'No carry'
                  : rollover > 0
                    ? `${compactINR(rollover)} rolled in`
                    : `${compactINR(-rollover)} carried as debt`}
              </Eyebrow>
              <p className="bd__rollbody">{rollWord}</p>
              <p className="bd__rollpull">{rollInsight}</p>
            </div>
          </Rise>

          {/* ---- Pace ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <SectionHead title="Pace" />
            <p className="bd__pace">
              <span
                className={`bd__dot bd__dot--${ahead ? 'hot' : behind ? 'cool' : 'even'}`}
                aria-hidden
              />
              {Math.round(clock.elapsed * 100)}% of {clock.label} has gone and{' '}
              {pctOf(spent, available)}% of the envelope —{' '}
              <b>
                {ahead ? 'spending is ahead of the calendar'
                  : behind ? 'spending is behind the calendar'
                    : 'spending is level with the calendar'}
              </b>.
            </p>

            <div className="bd__stats">
              <Stat
                label="Safe daily"
                value={inr(Math.round(safeDaily))}
                note={clock.left > 0 ? `for ${clock.left} more days` : 'month is done'}
              />
              <Stat
                label="Rate so far"
                value={inr(Math.round(perDay))}
                note="a day, this month"
              />
              <Stat
                label="Closes near"
                value={inr(Math.round(projected))}
                note={projected > available
                  ? `${compactINR(projected - available)} over`
                  : `${compactINR(available - projected)} under`}
                tone={projected > available ? 'var(--vermilion)' : undefined}
              />
            </div>
          </Rise>

          {/* ---- Six months of this category ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title={`${meta.label.split(' &')[0]}, six months`} />
            <div className="bd__chart">
              <CategoryMonths
                months={cat.byMonth}
                line={available}
                lineLabel={`${compactINR(available)} ceiling`}
                ink={meta.ink}
                coverage={coverage}
              />
            </div>
            <p className="bd__caption">
              The ledger itemises {coverage.size} of these six months by
              category. The earlier ones are known only in total, so they are
              left blank rather than drawn as a zero.
            </p>
          </Rise>

          {/* ---- What filled it ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead
              title="What filled it"
              action="All activity"
              onAction={() => push({ name: 'category', id: cat.id })}
            />
          </Rise>

          {items.length === 0 ? (
            <Rise style={{ paddingTop: 6 }}>
              <Empty
                title="Nothing yet"
                body={`Not a rupee of ${meta.label.toLowerCase()} this month. The whole ${inr(available)} is still standing.`}
                icon={<IcCoin size={26} />}
              />
            </Rise>
          ) : (
            <>
              <Rise>
                <div className="bd__txns">
                  {items.map((t) => {
                    const amt = Math.abs(t.amount);
                    return (
                      <motion.button
                        key={t.id}
                        className="bd__txn"
                        onClick={() => push({ name: 'txn', id: t.id })}
                        whileTap={{ scale: 0.99 }}
                        whileHover={{ x: 2 }}
                        transition={snap}
                      >
                        <span className="bd__txnbody">
                          <span className="bd__merchant">{t.merchant}</span>
                          <span className="bd__when">
                            {relativeDay(t.at, new Date(now))} · {time(t.at)}
                            {t.place ? ` · ${t.place.split(',')[0]}` : ''}
                          </span>
                          <span className="bd__share" aria-hidden>
                            <span
                              className="bd__sharefill"
                              style={{
                                width: `${(amt / available) * 100}%`,
                                background: INK_VAR[meta.ink],
                              }}
                            />
                          </span>
                        </span>
                        <span className="bd__txnright">
                          <span className="figure bd__txnamt">{inr(amt)}</span>
                          <span className="bd__txnpct num">
                            {pctOf(amt, available)}% of it
                          </span>
                        </span>
                        <ChevronRight size={16} className="bd__chev" />
                      </motion.button>
                    );
                  })}
                </div>
              </Rise>

              <Rise style={{ paddingTop: 14 }}>
                <p className="bd__caption">
                  {items.length} {items.length === 1 ? 'transaction' : 'transactions'},
                  averaging {inr(Math.round(spent / items.length))}. The largest,{' '}
                  {inr(biggest)}, is {pctOf(biggest, spent)}% of everything the
                  envelope has spent
                  {today > 0 ? ` — and ${inr(today)} of it went out today alone` : ''}.
                </p>
              </Rise>
            </>
          )}

          {/* ---- Actions ---- */}
          <Rise style={{ paddingTop: 30 }}>
            <Button
              ink="ink"
              variant="outline"
              full
              icon={<Pencil size={17} />}
              onClick={() => openSheet({ kind: 'editBudget', budgetId: row.id })}
            >
              Edit monthly limit
            </Button>
          </Rise>

          <Rise style={{ paddingTop: 12, paddingBottom: 8 }}>
            <AnimatePresence mode="wait" initial={false}>
              {confirm ? (
                <motion.div
                  key="confirm"
                  className="bd__confirm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={snap}
                >
                  <p>
                    Remove this envelope? {meta.label} keeps recording — it just
                    stops having a ceiling, and the{' '}
                    {inr(Math.abs(rollover))} {rollover >= 0 ? 'carried in' : 'owed'}{' '}
                    goes with it.
                  </p>
                  <div className="bd__confirmrow">
                    <Button variant="quiet" ink="ink" onClick={() => setConfirm(false)}>
                      Keep it
                    </Button>
                    <Button
                      ink="vermilion"
                      onClick={() => { removeBudget(row.id); back(); }}
                    >
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button ink="vermilion" variant="ghost" full onClick={() => setConfirm(true)}>
                    Remove envelope
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({
  label, value, note, tone,
}: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="bd__stat">
      <span className="bd__statlab">{label}</span>
      <span className="figure bd__statval" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
      <span className="bd__statnote">{note}</span>
    </div>
  );
}
