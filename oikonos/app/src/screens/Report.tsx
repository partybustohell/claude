/**
 * REPORT
 *
 * The month, written down. Everything here is an argument: the headline
 * names the month, the verdict says whether it was a good one and why,
 * the three figures show the working, and the movers say what actually
 * changed.
 *
 * Two sources, each used for what it is good for. `history` is the month
 * of record — it knows the totals. The ledger knows the names: which
 * category, which merchant, which single line was the biggest. The
 * segmented control moves both.
 *
 * The mover list deliberately holds standing items out. Rent, power and
 * the SIP bill at the same figure every month, so they cannot have
 * "moved" — leaving them in would put a ₹68,750 phantom at the top of a
 * list that is supposed to be about decisions.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Rule,
  SectionHead, Segmented, CategoryBadge, Amount, Empty,
} from '../components/ui';
import { ChevronRight } from '../components/icons';
import type { CategoryId, Txn } from '../data/types';
import { inr, compactINR, monthLabel, shortDate, pctOf } from '../lib/format';
import { snap, surface } from '../lib/motion';
import './Report.css';

type Which = 'this' | 'last';

function monthName(iso: string): string {
  return monthLabel(iso).split(' ')[0];
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** ISO of the earliest line the ledger holds. */
function oldest(txns: Txn[]): string {
  return txns.reduce((a, t) => (t.at < a ? t.at : a), txns[0]?.at ?? '');
}

export function Report() {
  const { history, txns } = useApp();
  const { back, push } = useNav();
  const [which, setWhich] = useState<Which>('this');

  const idx = which === 'this' ? history.length - 1 : history.length - 2;
  const cur = history[idx];
  const prev = history[idx - 1];

  /* ---- The month of record, against every other month ---- */
  const book = useMemo(() => {
    const n = history.length;
    const kept = (h: typeof cur) => h.income - h.expenses;
    const rateOf = (h: typeof cur) => kept(h) / h.income;
    const avg = {
      income: history.reduce((a, h) => a + h.income, 0) / n,
      expenses: history.reduce((a, h) => a + h.expenses, 0) / n,
      saved: history.reduce((a, h) => a + kept(h), 0) / n,
    };
    const ranked = [...history].sort((a, b) => kept(b) - kept(a));

    /* How many months the rate has been climbing, ending here. */
    let streak = 0;
    for (let i = idx; i > 0; i--) {
      if (rateOf(history[i]) > rateOf(history[i - 1])) streak++; else break;
    }

    return {
      avg,
      count: n,
      streak,
      rank: ranked.findIndex((h) => h.month === cur.month) + 1,
      saved: kept(cur),
      rate: rateOf(cur),
      avgRate: avg.saved / avg.income,
      prevRate: rateOf(prev),
    };
  }, [history, cur, prev, idx]);

  /* ---- The ledger's version of the same month ---- */
  const ledger = useMemo(() => {
    const key = cur.month.slice(0, 7);
    const rows = txns.filter((t) => t.at.slice(0, 7) === key);
    const spend = rows.filter((t) => t.amount < 0 && t.category !== 'transfer');
    const moved = rows.filter((t) => t.amount < 0 && t.category === 'transfer');

    const by = new Map<CategoryId, { amount: number; count: number }>();
    for (const t of spend) {
      const c = by.get(t.category) ?? { amount: 0, count: 0 };
      c.amount += -t.amount;
      c.count += 1;
      by.set(t.category, c);
    }
    const cats = [...by.entries()]
      .map(([id, v]) => ({ id, ...v, meta: CATEGORIES[id] }))
      .sort((a, b) => b.amount - a.amount);

    let biggest: Txn | null = null;
    for (const t of spend) if (!biggest || t.amount < biggest.amount) biggest = t;

    return {
      cats,
      biggest,
      count: spend.length,
      total: spend.reduce((n, t) => n - t.amount, 0),
      moved,
      movedTotal: moved.reduce((n, t) => n - t.amount, 0),
    };
  }, [txns, cur]);

  /* ---- What changed, category by category ---- */
  const movers = useMemo(() => {
    const totals = (key: string) => {
      const m = new Map<CategoryId, number>();
      for (const t of txns) {
        if (t.amount >= 0 || t.recurring || t.category === 'transfer') continue;
        if (t.at.slice(0, 7) !== key) continue;
        m.set(t.category, (m.get(t.category) ?? 0) - t.amount);
      }
      return m;
    };
    const now = totals(cur.month.slice(0, 7));
    const then = totals(prev.month.slice(0, 7));
    const ids = new Set<CategoryId>([...now.keys(), ...then.keys()]);
    const rows = [...ids]
      .map((id) => ({
        id,
        meta: CATEGORIES[id],
        delta: (now.get(id) ?? 0) - (then.get(id) ?? 0),
      }))
      .filter((r) => r.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const up = Math.max(0, ...rows.map((r) => r.delta));
    const down = Math.max(0, ...rows.map((r) => -r.delta));
    /* The axis sits where the two directions meet, so a month with no
       falls uses the full width instead of wasting half of it. */
    return { rows, hasThen: then.size > 0, up, down, axis: up + down > 0 ? down / (up + down) : 0 };
  }, [txns, cur, prev]);

  const spentLess = cur.expenses < book.avg.expenses;
  const keptMore = book.saved > book.avg.saved;
  const expGap = Math.round(Math.abs(cur.expenses - book.avg.expenses));
  const savGap = Math.round(Math.abs(book.saved - book.avg.saved));
  const opens = shortDate(oldest(txns));

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Monthly report"
              title={monthLabel(cur.month)}
              sub={
                <>
                  {book.rank === 1 ? 'Best' : `${ordinal(book.rank)} best`} of{' '}
                  {book.count} months on the books ·{' '}
                  {ledger.count} line{ledger.count === 1 ? '' : 's'} in the ledger
                </>
              }
            />
          </Rise>

          <Rise style={{ paddingBottom: 22 }}>
            <Segmented
              id="report-month"
              value={which}
              onChange={setWhich}
              options={[
                { id: 'this', label: monthName(history[history.length - 1].month) },
                { id: 'last', label: monthName(history[history.length - 2].month) },
              ]}
            />
          </Rise>

          {/* ---- The verdict ---- */}
          <Rise>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">The verdict</Eyebrow>
              <p className="rep__verdict display">
                {keptMore ? 'A better month than most.' : 'A thinner month than most.'}{' '}
                {monthName(cur.month)} kept <b className="figure">{inr(book.saved)}</b>,{' '}
                {savGap === 0 ? 'exactly the average' : (
                  <>
                    <b className="figure">{inr(savGap)}</b>{' '}
                    {keptMore ? 'more' : 'less'} than a typical month
                  </>
                )}
                , on <b className="figure">{inr(expGap)}</b>{' '}
                {spentLess ? 'less' : 'more'} spending.
              </p>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 14px' }} />

              <p className="rep__verdictfoot">
                Against a six-month average of{' '}
                {compactINR(Math.round(book.avg.expenses))} out and{' '}
                {compactINR(Math.round(book.avg.saved))} kept.
              </p>
            </Card>
          </Rise>

          {/* ---- The three figures ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <div className="rep__trio">
              <Figure label="In" value={cur.income} avg={book.avg.income} goodWhenUp />
              <Figure label="Out" value={cur.expenses} avg={book.avg.expenses} />
              <Figure label="Kept" value={book.saved} avg={book.avg.saved} goodWhenUp />
            </div>
          </Rise>

          {/* ---- Savings rate against the average month ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="rep__ratehead">
              <Eyebrow>Savings rate</Eyebrow>
              <span className="rep__ratenum figure">
                {Math.round(book.rate * 100)}%
              </span>
            </div>
            <div className="rep__ratebar">
              <div className="rep__ratetrack">
                <motion.span
                  className="rep__ratefill tex-ink"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.max(0, Math.min(1, book.rate)) }}
                  transition={surface}
                  style={{
                    background: book.rate >= book.avgRate
                      ? 'var(--olive)' : 'var(--vermilion)',
                  }}
                />
              </div>
              <span
                className="rep__ratemark"
                style={{ left: `${book.avgRate * 100}%` }}
                aria-hidden
              />
            </div>
            <p className="rep__ratefoot">
              The mark is the six-month average, {Math.round(book.avgRate * 100)}%.{' '}
              {book.streak >= 1
                ? `The rate has climbed ${book.streak === 1 ? 'for a second month' : `${book.streak} months`} running.`
                : `Down ${Math.abs(Math.round((book.rate - book.prevRate) * 100))} points on ${monthName(prev.month)}.`}
            </p>
          </Rise>

          {/* ---- The month's two biggest things ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="The biggest of it" />
            {ledger.cats.length === 0 || !ledger.biggest ? (
              <Empty
                title="No lines recorded"
                body={`The ledger holds nothing for ${monthName(cur.month)} — only the month's totals.`}
              />
            ) : (
              <div className="rep__big">
                <div className="rep__bigrow">
                  <CategoryBadge
                    icon={ledger.cats[0].meta.icon}
                    ink={ledger.cats[0].meta.ink}
                    size={42}
                  />
                  <span className="rep__biglabel">Biggest category</span>
                  <span className="rep__bigname">{ledger.cats[0].meta.label}</span>
                  <span className="rep__bigfoot">
                    <span className="rep__bigmeta">
                      {ledger.cats[0].count} line{ledger.cats[0].count === 1 ? '' : 's'} ·{' '}
                      {pctOf(ledger.cats[0].amount, ledger.total)}% of all spend
                    </span>
                    <span className="rep__bigamt figure">{inr(ledger.cats[0].amount)}</span>
                  </span>
                </div>

                <Rule tone="var(--hairline-soft)" />

                <motion.button
                  className="rep__bigrow rep__bigrow--tap"
                  onClick={() => push({ name: 'txn', id: ledger.biggest!.id })}
                  whileTap={{ scale: 0.99 }}
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <CategoryBadge
                    icon={CATEGORIES[ledger.biggest.category].icon}
                    ink={CATEGORIES[ledger.biggest.category].ink}
                    size={42}
                  />
                  <span className="rep__biglabel">Biggest single line</span>
                  <ChevronRight size={16} className="rep__bigchev" />
                  <span className="rep__bigname">{ledger.biggest.merchant}</span>
                  <span className="rep__bigfoot">
                    <span className="rep__bigmeta">
                      {shortDate(ledger.biggest.at)}
                      {ledger.biggest.recurring ? ' · standing order' : ''}
                      {' · '}
                      {pctOf(-ledger.biggest.amount, ledger.total)}% alone
                    </span>
                    <span className="rep__bigamt figure">
                      {inr(-ledger.biggest.amount)}
                    </span>
                  </span>
                </motion.button>
              </div>
            )}
          </Rise>

          {/* ---- What moved ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title={`Against ${monthName(prev.month)}`} />

            {!movers.hasThen || movers.rows.length === 0 ? (
              <Empty
                title={`No ${monthName(prev.month)} to stand it against`}
                body={`The ledger opens on ${opens}. Everything before that is a total without its lines.`}
              />
            ) : (
              <>
                <div className="rep__movers">
                  {movers.rows.map((r, i) => {
                    const span = movers.up + movers.down || 1;
                    const w = (Math.abs(r.delta) / span) * 100;
                    const up = r.delta > 0;
                    const axis = movers.axis * 100;
                    return (
                      <div key={r.id} className="rep__mover">
                        <span className="rep__movername">{r.meta.label}</span>
                        <span className="rep__moverplot">
                          {movers.axis > 0 && (
                            <span className="rep__moveraxis"
                              style={{ left: `${axis}%` }} aria-hidden />
                          )}
                          <motion.span
                            className="rep__moverbar tex-ink"
                            style={{
                              background: up ? 'var(--vermilion)' : 'var(--olive)',
                              left: up ? `${axis}%` : `${axis - w}%`,
                              width: `${w}%`,
                              transformOrigin: up ? 'left center' : 'right center',
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ ...surface, delay: 0.04 * i }}
                          />
                        </span>
                        <span
                          className="rep__moverdelta num"
                          style={{ color: up ? 'var(--vermilion)' : 'var(--olive)' }}
                        >
                          {up ? '+' : '−'}
                          <span className="figure">{compactINR(Math.abs(r.delta))}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="rep__moversnote">
                  Standing items are held out — rent, power and the SIP bill at the same
                  figure every month, so they cannot move. And the ledger only opens on{' '}
                  {opens}, which makes {monthName(prev.month)} a short window: read the
                  direction, not the size.
                </p>
              </>
            )}
          </Rise>

          {/* ---- Closing note ---- */}
          <Rise style={{ paddingTop: 26, paddingBottom: 8 }}>
            <Card tone="warm" pad={20}>
              <Eyebrow>On the rate</Eyebrow>
              <p className="rep__close">
                {Math.round(book.rate * 100)} paise of every rupee stayed,{' '}
                {book.rate >= book.avgRate ? 'ahead of' : 'behind'} the{' '}
                {Math.round(book.avgRate * 100)}% you average.{' '}
                {ledger.movedTotal > 0 ? (
                  <>
                    And <b className="figure">{inr(ledger.movedTotal)}</b> of what left
                    the account never really left — {ledger.moved.length} transfer
                    {ledger.moved.length === 1 ? '' : 's'} into money that is still
                    yours. Out, but not spent.
                  </>
                ) : (
                  <>
                    Nothing was moved into savings by hand this month; the whole margin
                    is simply what was not spent.
                  </>
                )}
              </p>
              {ledger.moved.length > 0 && (
                <div className="rep__chips">
                  {ledger.moved.map((m) => (
                    <span key={m.id} className="rep__chip">
                      {m.merchant}
                      <b className="figure">{compactINR(-m.amount)}</b>
                    </span>
                  ))}
                </div>
              )}
              <Rule style={{ margin: '16px 0 14px' }} />
              <div className="rep__closefoot">
                <Eyebrow>Twelve months of this</Eyebrow>
                <Amount className="rep__closenum" value={book.saved * 12} duration={1200} />
              </div>
            </Card>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Figure({
  label, value, avg, goodWhenUp,
}: { label: string; value: number; avg: number; goodWhenUp?: boolean }) {
  const diff = avg > 0 ? (value - avg) / avg : 0;
  const up = diff >= 0;
  const good = goodWhenUp ? up : !up;
  return (
    <div className="rep__cell">
      <Eyebrow>{label}</Eyebrow>
      <Amount className="rep__cellnum" value={value} duration={1200} />
      <span
        className="rep__cellvs num"
        style={{ color: good ? 'var(--olive)' : 'var(--vermilion)' }}
      >
        {up ? '↑' : '↓'} {Math.abs(Math.round(diff * 100))}%
      </span>
    </div>
  );
}
