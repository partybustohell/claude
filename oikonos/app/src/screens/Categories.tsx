/**
 * CATEGORIES
 *
 * Every category the ledger knows, ranked by what May actually took.
 *
 * The thing the rows do not say out loud, and the reason this screen
 * exists: the envelopes only watch a sliver of the month. The three
 * largest categories — the ones that decide whether the month works —
 * carry no budget at all, so the Budgets tab can read entirely green
 * while most of the money goes unmeasured.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp, useCategorySpend, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Meter, Rule,
  CategoryBadge, type Ink,
} from '../components/ui';
import { ShareBar, tintScale } from '../components/charts';
import { ChevronRight } from '../components/icons';
import { inr, compactINR, pctOf, shortDate } from '../lib/format';
import { snap } from '../lib/motion';
import type { Category as Cat } from '../data/types';
import './Categories.css';

/** A category worth ₹990 in a ₹1.8L month is not 0% of it. */
function share(part: number, whole: number): string {
  const p = pctOf(part, whole);
  return p < 1 && part > 0 ? '<1%' : `${p}%`;
}

export function Categories() {
  const spend = useCategorySpend();
  const { budgets, txns, now } = useApp();
  const { back, push } = useNav();

  const d = useMemo(() => {
    const month = now.slice(0, 7);
    const byCat = new Map(budgets.map((b) => [b.category, b]));

    /* Adjacent segments printed in one ink read as a single block, so each
       category is stepped toward paper by its rank within its own ink. */
    const inkTotal = new Map<Ink, number>();
    for (const s of spend) {
      inkTotal.set(s.meta.ink, (inkTotal.get(s.meta.ink) ?? 0) + 1);
    }
    const inkSeen = new Map<Ink, number>();

    const rows = spend.map((s) => {
      const b = byCat.get(s.id);
      const available = b ? b.limit + b.rollover : 0;
      const ratio = available > 0 ? s.amount / available : 0;
      const n = inkSeen.get(s.meta.ink) ?? 0;
      inkSeen.set(s.meta.ink, n + 1);
      return {
        ...s,
        budget: b,
        available,
        ratio,
        state: !b ? 'none' : ratio > 1 ? 'over' : ratio > 0.85 ? 'tight' : 'ok',
        tint: tintScale(s.meta.ink, n, inkTotal.get(s.meta.ink) ?? 1),
        count: txns.filter((t) =>
          t.category === s.id && t.amount < 0 && t.at.slice(0, 7) === month).length,
      };
    });

    const total = rows.reduce((n, r) => n + r.amount, 0);
    const payments = rows.reduce((n, r) => n + r.count, 0);

    /* How few categories it takes to own half the month. */
    let run = 0;
    let half = rows.length;
    for (let i = 0; i < rows.length; i++) {
      run += rows[i].amount;
      if (run >= total / 2) { half = i + 1; break; }
    }
    const headSum = rows.slice(0, half).reduce((n, r) => n + r.amount, 0);

    /* What the envelopes actually cover. */
    const watched = rows.filter((r) => r.budget);
    const loose = rows.filter((r) => !r.budget);
    const watchedSum = watched.reduce((n, r) => n + r.amount, 0);
    const looseTop = loose.slice(0, 3);

    /* Money in has no share of an outgoing month, but it must be accounted. */
    const inRows = txns
      .filter((t) => t.amount > 0 && t.at.slice(0, 7) === month)
      .sort((a, b) => b.at.localeCompare(a.at));
    const income = inRows.reduce((n, t) => n + t.amount, 0);

    /* Nothing at all this month — kept, not hidden. Income only ever
       arrives, so it is never idle in the sense this group means. */
    const idle = (Object.values(CATEGORIES) as Cat[]).filter(
      (c) => c.id !== 'income' && !spend.some((s) => s.id === c.id));

    return {
      rows, total, payments, half, headSum,
      watched, loose, watchedSum, looseTop,
      income, inCount: inRows.length, inLast: inRows[0], idle,
    };
  }, [spend, budgets, txns, now]);

  const covered = d.total > 0 ? d.watchedSum / d.total : 0;
  const looseSum = d.total - d.watchedSum;
  const transfer = d.rows.find((r) => r.id === 'transfer');

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y cats__pane">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="May 2024"
              title="Where it went"
              sub={
                <>
                  {inr(d.total)} out over {d.payments} payments.{' '}
                  {d.idle.length === 0
                    ? `All ${d.rows.length} spending categories were used.`
                    : `${d.rows.length} of ${d.rows.length + d.idle.length} categories were used.`}
                </>
              }
            />
          </Rise>

          {/* ---- The whole month as one printed rule ---- */}
          <Rise>
            <ShareBar
              parts={d.rows.map((r) => ({
                id: r.id, share: r.share, ink: r.meta.ink, color: r.tint,
              }))}
              height={16}
            />
            <div className="cats__legend">
              {d.rows.slice(0, 3).map((r) => (
                <span key={r.id} className="cats__key">
                  <span className="cats__swatch tex-ink"
                    style={{ background: r.tint }} aria-hidden />
                  {r.meta.label.split(' &')[0]}
                  <b className="num">{share(r.amount, d.total)}</b>
                </span>
              ))}
            </div>
            <p className="cats__shareline">
              Half of May sits in{' '}
              {d.half === 1 ? 'a single category' : `just ${d.half} categories`} —{' '}
              {inr(d.headSum)}. The other {d.rows.length - d.half} share{' '}
              {inr(d.total - d.headSum)} between them, and every one of them is
              ranked below.
            </p>
          </Rise>

          {/* ---- What the envelopes are actually watching ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">Inside an envelope</Eyebrow>
              <p className="cats__hero figure">{inr(d.watchedSum)}</p>
              <p className="cats__herometa">
                of {inr(d.total)} spent — {pctOf(d.watchedSum, d.total)}% of the month
              </p>

              <div className="cats__herobar">
                <Meter
                  value={covered}
                  ink={covered < 0.5 ? 'vermilion' : 'olive'}
                  track="rgba(253,248,236,0.20)"
                  height={8}
                />
                <div className="cats__herofoot">
                  <span>{d.watched.length} of {d.rows.length} categories budgeted</span>
                  <span className="num">{compactINR(looseSum)} unwatched</span>
                </div>
              </div>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 15px' }} />

              <p className="cats__note">
                The {d.looseTop.length} largest —{' '}
                <b>{d.looseTop.map((r) => r.meta.label.split(' &')[0]).join(', ')}</b>{' '}
                — carry no budget between them, yet they are{' '}
                {pctOf(d.looseTop.reduce((n, r) => n + r.amount, 0), d.total)}% of May.
                Every envelope can read green while most of the money goes
                unmeasured.
              </p>
            </Card>
          </Rise>

          {/* ---- The ranking ---- */}
          <Rise style={{ paddingTop: 28, paddingBottom: 6 }}>
            <div className="cats__sechead">
              <Eyebrow>Ranked by spend</Eyebrow>
              <span className="cats__secmeta num">{d.rows.length}</span>
            </div>
          </Rise>

          {d.rows.map((r, i) => (
            <Rise key={r.id}>
              {i > 0 && <Rule inset={52} />}
              <motion.button
                className="cats__row"
                onClick={() => push({ name: 'category', id: r.id })}
                whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                whileHover={{ x: 2 }}
                transition={snap}
              >
                <CategoryBadge icon={r.meta.icon} ink={r.meta.ink} size={40} />

                <span className="cats__body">
                  <span className="cats__top">
                    <span className="cats__label">{r.meta.label}</span>
                    <span className="cats__amt figure">{inr(r.amount)}</span>
                  </span>

                  <span className="cats__meta">
                    <span className="num">
                      {share(r.amount, d.total)} · {r.count} payment
                      {r.count === 1 ? '' : 's'}
                    </span>
                    <span
                      className={`cats__budgetmeta num${
                        r.state === 'over' || r.state === 'tight' ? ' cats__budgetmeta--hot' : ''}`}
                    >
                      {r.budget
                        ? r.ratio > 1
                          ? `${compactINR(r.amount - r.available)} over ${compactINR(r.available)}`
                          : `${compactINR(r.available - r.amount)} left of ${compactINR(r.available)}`
                        : 'No envelope'}
                    </span>
                  </span>

                  {r.budget ? (
                    <span className="cats__meterwrap">
                      {/* olive means inside, vermilion means trouble — the
                          category's own ink stays in the badge and the bar
                          above, so it cannot be mistaken for a warning */}
                      <Meter
                        value={Math.min(1, r.ratio)}
                        ink={r.state === 'ok' ? 'olive' : 'vermilion'}
                        height={5}
                      />
                    </span>
                  ) : (
                    <span className="cats__nobar" aria-hidden />
                  )}
                </span>

                <ChevronRight size={16} className="cats__chev" />
              </motion.button>
            </Rise>
          ))}

          {/* ---- Money in ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <Eyebrow>Money in</Eyebrow>
            <motion.button
              className="cats__inrow"
              onClick={() => push({ name: 'category', id: 'income' })}
              whileTap={{ scale: 0.99 }}
              whileHover={{ x: 2 }}
              transition={snap}
            >
              <span className="cats__intop">
                <CategoryBadge icon={CATEGORIES.income.icon} ink="olive" size={34} />
                <span className="cats__label">{CATEGORIES.income.label}</span>
                <span className="cats__inamt figure">+{inr(d.income)}</span>
              </span>
              <span className="cats__insub">
                {d.inCount} credit{d.inCount === 1 ? '' : 's'}
                {d.inLast
                  ? `${d.inCount === 1 ? ' on ' : ', latest '}${shortDate(d.inLast.at)}`
                  : ''} — it funds the bar above rather than appearing in it.
              </span>
            </motion.button>
          </Rise>

          {/* ---- Nothing this month ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Eyebrow>Nothing this month</Eyebrow>
            {d.idle.length === 0 ? (
              <p className="cats__idlenone">
                None — every spending category the app tracks was used in May.
                That is unusual, and it is why the ranking runs all the way down
                to {inr(d.rows[d.rows.length - 1].amount)}.
              </p>
            ) : (
              <div className="cats__idle">
                {d.idle.map((c) => (
                  <motion.button
                    key={c.id}
                    className="cats__idlechip"
                    onClick={() => push({ name: 'category', id: c.id })}
                    whileTap={{ scale: 0.97 }}
                    transition={snap}
                  >
                    <CategoryBadge icon={c.icon} ink={c.ink} size={22} />
                    {c.label}
                  </motion.button>
                ))}
              </div>
            )}
          </Rise>

          {transfer && (
            <Rise style={{ paddingTop: 22 }}>
              <p className="cats__foot">
                Shares are of money out, so the salary sits apart. Transfers to
                your own accounts are ranked with the rest because the money has
                left the current account — but {inr(transfer.amount)} of May is
                money moved, not money gone.
              </p>
            </Rise>
          )}
        </Stack>
      </div>
    </Screen>
  );
}
