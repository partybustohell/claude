/**
 * CASHFLOW
 *
 * Money in against money out, six closed months of it. The columns give
 * the shape, the table gives the figures, and the card at the bottom
 * gives the only number that actually decides anything: how long the
 * cash on hand would last if the income stopped.
 *
 * Runway is quoted three ways on purpose. Cash is the honest one; the
 * figure after settling the card is the pessimistic one; the figure
 * including equity is the one people quote to themselves, and it is only
 * true if they are willing to sell into whatever the market is doing
 * that week.
 */
import { useMemo } from 'react';
import { useApp, useCashflow } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Rule,
  SectionHead, Meter, Empty,
} from '../components/ui';
import { MonthColumns } from '../components/charts';
import { inr, compactINR, monthLabel, pctOf } from '../lib/format';
import './Cashflow.css';

function monthName(iso: string): string {
  return monthLabel(iso).split(' ')[0];
}

function months(v: number, per: number): string {
  return per > 0 ? (v / per).toFixed(1) : '—';
}

export function Cashflow() {
  const rows = useCashflow();
  const { accounts } = useApp();
  const { back } = useNav();

  const totals = useMemo(() => {
    const income = rows.reduce((n, r) => n + r.income, 0);
    const expenses = rows.reduce((n, r) => n + r.expenses, 0);
    return {
      income,
      expenses,
      net: income - expenses,
      rate: income > 0 ? (income - expenses) / income : 0,
      avgOut: rows.length ? expenses / rows.length : 0,
      avgKept: rows.length ? (income - expenses) / rows.length : 0,
      avgRate: rows.length ? rows.reduce((n, r) => n + r.rate, 0) / rows.length : 0,
    };
  }, [rows]);

  const extremes = useMemo(() => {
    if (rows.length === 0) return { best: null, worst: null };
    const hi = Math.max(...rows.map((r) => r.net));
    const lo = Math.min(...rows.map((r) => r.net));
    return {
      best: rows.find((r) => r.net === hi) ?? null,
      worst: rows.find((r) => r.net === lo) ?? null,
    };
  }, [rows]);

  /* ---- What the balance would carry ---- */
  const runway = useMemo(() => {
    const cashAccts = accounts.filter((a) => a.kind === 'bank' || a.kind === 'wallet');
    const cash = cashAccts.reduce((n, a) => n + a.balance, 0);
    const owed = accounts
      .filter((a) => a.kind === 'card' || a.balance < 0)
      .reduce((n, a) => n + Math.abs(a.balance), 0);
    const invested = accounts.filter((a) => a.kind === 'invest')
      .reduce((n, a) => n + a.balance, 0);
    return {
      names: cashAccts.map((a) => a.name),
      cash,
      settled: cash - owed,
      everything: cash - owed + invested,
      invested,
    };
  }, [accounts]);

  const sixMonths = totals.avgOut * 6;
  const shortBy = sixMonths - runway.cash;
  const toClose = totals.avgKept > 0 ? Math.ceil(shortBy / totals.avgKept) : 0;

  if (rows.length === 0) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <Empty
            title="No months closed yet"
            body="Cashflow needs a month behind it. Come back when the first one is on the books."
          />
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
              eyebrow="Money"
              title="In and out"
              sub={`${monthLabel(rows[0].month)} to ${monthLabel(rows[rows.length - 1].month)} · ${rows.length} closed months`}
            />
          </Rise>

          {/* ---- The shape of it ---- */}
          <Rise>
            <div className="cf__legend">
              <span><i className="cf__key cf__key--in" aria-hidden />Money in</span>
              <span><i className="cf__key cf__key--out" aria-hidden />Money out</span>
            </div>
            <MonthColumns
              data={rows.map((r) => ({
                label: monthName(r.month).slice(0, 3),
                income: r.income,
                expenses: r.expenses,
              }))}
              height={150}
            />
          </Rise>

          {/* ---- Every month, in figures ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <SectionHead title="Month by month" />
            <div className="cf__table">
              <div className="cf__head">
                <span>Mo</span>
                <span className="cf__r">In</span>
                <span className="cf__r">Out</span>
                <span className="cf__r">Net</span>
                <span className="cf__r">Rate</span>
              </div>

              {rows.map((r) => {
                const best = extremes.best?.month === r.month;
                const worst = extremes.worst?.month === r.month;
                return (
                  <div
                    key={r.month}
                    className={`cf__row${best ? ' cf__row--best' : ''}${worst ? ' cf__row--worst' : ''}`}
                  >
                    <span className="cf__mo">{monthName(r.month).slice(0, 3)}</span>
                    <span className="cf__r cf__cell figure">{inr(r.income)}</span>
                    <span className="cf__r cf__cell figure">{inr(r.expenses)}</span>
                    <span
                      className="cf__r cf__cell cf__net figure"
                      style={{ color: r.net >= 0 ? 'var(--olive)' : 'var(--vermilion)' }}
                    >
                      {r.net >= 0 ? '+' : '−'}{inr(Math.abs(r.net))}
                    </span>
                    <span className="cf__r cf__rate num">{Math.round(r.rate * 100)}%</span>
                  </div>
                );
              })}

              <div className="cf__row cf__row--total">
                <span className="cf__mo">All</span>
                <span className="cf__r cf__cell figure">{inr(totals.income)}</span>
                <span className="cf__r cf__cell figure">{inr(totals.expenses)}</span>
                <span
                  className="cf__r cf__cell cf__net figure"
                  style={{ color: totals.net >= 0 ? 'var(--olive)' : 'var(--vermilion)' }}
                >
                  {totals.net >= 0 ? '+' : '−'}{inr(Math.abs(totals.net))}
                </span>
                <span className="cf__r cf__rate num">{Math.round(totals.rate * 100)}%</span>
              </div>
            </div>
          </Rise>

          {/* ---- The two ends of the run ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <div className="cf__pair">
              {extremes.best && (
                <Extreme
                  kind="best" label="Best month" row={extremes.best}
                  avg={totals.avgKept}
                />
              )}
              {extremes.worst && (
                <Extreme
                  kind="worst" label="Thinnest month" row={extremes.worst}
                  avg={totals.avgKept}
                />
              )}
            </div>
          </Rise>

          {/* ---- Average rate ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="cf__ratehead">
              <Eyebrow>Average savings rate</Eyebrow>
              <span className="cf__ratenum figure">
                {Math.round(totals.avgRate * 100)}%
              </span>
            </div>
            <Meter value={totals.avgRate} ink="olive" height={10} />
            <p className="cf__ratefoot">
              {inr(Math.round(totals.avgKept))} kept in a typical month, out of{' '}
              {compactINR(Math.round(totals.income / rows.length))} earned. Across all{' '}
              {rows.length} months together the rate is {Math.round(totals.rate * 100)}% —
              the bigger months pull it up.
            </p>
          </Rise>

          {/* ---- Runway: the point of the screen ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">If the income stopped</Eyebrow>
              <p className="cf__runway">
                <span className="figure cf__runwaynum">
                  {months(runway.cash, totals.avgOut)}
                </span>
                <span className="cf__runwayunit">months of cover</span>
              </p>
              <p className="cf__runwaysub">
                {inr(runway.cash)} across {runway.names.join(' and ')}, against{' '}
                {inr(Math.round(totals.avgOut))} of spending in an average month.
              </p>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 4px' }} />

              <RunRow
                label="Cash at hand" value={runway.cash} per={totals.avgOut} lead
              />
              <RunRow
                label="After settling the card" value={runway.settled} per={totals.avgOut}
              />
              <RunRow
                label="Counting the equity" value={runway.everything} per={totals.avgOut}
              />

              <Rule tone="var(--hairline-ink)" style={{ margin: '4px 0 14px' }} />

              <p className="cf__runwaynote">
                Six months of this spend is {inr(Math.round(sixMonths))}.
                {shortBy > 0 ? (
                  <>
                    {' '}Cash is {inr(Math.round(shortBy))} short of it — about{' '}
                    {toClose} month{toClose === 1 ? '' : 's'} at the rate you are
                    keeping. The equity closes the gap today, but only by selling.
                  </>
                ) : (
                  <> Cash already clears it, with {inr(Math.round(-shortBy))} to spare.</>
                )}
              </p>
            </Card>
          </Rise>

          <Rise style={{ paddingTop: 22, paddingBottom: 8 }}>
            <p className="cf__foot">
              Cover counts the savings account and the wallet only.{' '}
              {pctOf(runway.invested, runway.cash + runway.invested)}% of what could be
              spent is held in equity, and a bad quarter is exactly when you would be
              reaching for it.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Extreme({
  kind, label, row, avg,
}: {
  kind: 'best' | 'worst';
  label: string;
  row: { month: string; net: number; rate: number };
  avg: number;
}) {
  const diff = row.net - avg;
  return (
    <div className={`cf__ex cf__ex--${kind}`}>
      <Eyebrow tone={kind === 'best' ? 'var(--olive)' : 'var(--vermilion)'}>
        {label}
      </Eyebrow>
      <p className="cf__exmonth display">{monthName(row.month)}</p>
      <p className="cf__exnum figure">{inr(row.net)}</p>
      <p className="cf__exmeta">
        {Math.round(row.rate * 100)}% kept ·{' '}
        {diff >= 0 ? '+' : '−'}{compactINR(Math.abs(diff))} on the average
      </p>
    </div>
  );
}

function RunRow({
  label, value, per, lead,
}: { label: string; value: number; per: number; lead?: boolean }) {
  return (
    <div className={`cf__run${lead ? ' cf__run--lead' : ''}`}>
      <span className="cf__runlabel">{label}</span>
      <span className="cf__runval figure">{inr(value)}</span>
      <span className="cf__runmo num">{months(value, per)} mo</span>
    </div>
  );
}
