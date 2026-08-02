/**
 * CATEGORY
 *
 * One category, in enough depth to act on.
 *
 * The month's total is only the headline. The reading underneath it is
 * concentration: a category is rarely a habit, it is usually one or two
 * places carrying everything else. So the screen names the merchant
 * driving the total and restates the whole month — envelope, share and
 * daily allowance — with that one merchant removed.
 */
import { useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useApp, useCategory, merchantId } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Meter, Rule,
  Amount, Empty, CategoryBadge, INK_VAR, type Ink,
} from '../components/ui';
import { ChevronRight, IcRepeat, IcFlag } from '../components/icons';
import type { CategoryId } from '../data/types';
import {
  inr, compactINR, signedINR, shortDate, pctOf,
} from '../lib/format';
import { snap, surface } from '../lib/motion';
import './Category.css';
import { PlateFoot } from '../illustrations/place';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* Charts get the abbreviation, prose gets the whole word. */
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function daysLeft(nowIso: string): { left: number; total: number; day: number } {
  const d = new Date(nowIso);
  const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return { left: total - d.getDate(), total, day: d.getDate() };
}

/* ================================================================
   Six-month trend.
   A month with no ledger behind it is not a month of zero spend —
   it is a month the app cannot speak for. The two are drawn
   differently: an empty track for a real zero, a broken hairline
   for a month that predates the ledger.
   ================================================================ */

interface Slot {
  key: string; label: string; value: number;
  current: boolean; known: boolean;
}

function Trend({ data, ink }: { data: Slot[]; ink: Ink }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const peak = Math.max(...data.map((s) => s.value)) || 1;

  return (
    <div
      ref={ref}
      className="cat__trend"
      role="img"
      aria-label={data.map((s) => `${s.label} ${
        !s.known ? 'no records' : s.value > 0 ? inr(s.value) : 'nothing'}`).join(', ')}
    >
      {data.map((s, i) => (
        <div key={s.key} className={`cat__slot ${s.current ? 'cat__slot--now' : ''}`}>
          <span className="cat__slotval num">
            {!s.known ? '·' : s.value > 0 ? compactINR(s.value) : '—'}
          </span>
          <span className={`cat__track ${s.known ? '' : 'cat__track--void'}`}>
            {s.known && (
              <motion.span
                className="cat__fill tex-ink"
                style={{ background: INK_VAR[ink] }}
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: inView || reduce
                    ? (s.value > 0 ? Math.max(0.025, s.value / peak) : 0)
                    : 0,
                }}
                transition={reduce ? { duration: 0 } : { ...surface, delay: 0.05 * i }}
              />
            )}
          </span>
          <span className="cat__slotlabel">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Category
   ================================================================ */

export function Category({ id }: { id: string }) {
  const cat = useCategory(id as CategoryId);
  const { now, txns, history } = useApp();
  const { back, push } = useNav();

  const d = useMemo(() => {
    if (!cat || !cat.meta) return undefined;
    const month = now.slice(0, 7);
    const { items, byMonth, budget } = cat;

    const inflow = items.length > 0 && items.every((t) => t.amount > 0);
    const monthItems = items.filter((t) => t.at.slice(0, 7) === month
      && (inflow ? t.amount > 0 : t.amount < 0));
    const heroValue = inflow
      ? monthItems.reduce((n, t) => n + t.amount, 0)
      : cat.spent;

    /* The ledger's own horizon — months before it hold no records at all. */
    const ledgerFrom = txns.reduce((a, t) => (t.at < a ? t.at : a), txns[0].at).slice(0, 7);

    const series: Slot[] = history.map((h) => {
      const key = h.month.slice(0, 7);
      const base = byMonth.find((b) => b.month === key);
      return {
        key,
        label: MONTH_ABBR[new Date(h.month).getMonth()],
        value: inflow
          ? items.filter((t) => t.at.slice(0, 7) === key && t.amount > 0)
            .reduce((n, t) => n + t.amount, 0)
          : (base?.value ?? 0),
        current: key === month,
        known: key >= ledgerFrom,
      };
    });
    const prev = series[series.length - 2];
    const prevFull = history.length > 1
      ? MONTH_FULL[new Date(history[history.length - 2].month).getMonth()]
      : 'last month';
    const known = series.filter((s) => s.known);
    const best = known.reduce<Slot | undefined>(
      (a, s) => (!a || s.value > a.value ? s : a), undefined);

    /* Merchants inside the category, this month. */
    const m = new Map<string, { id: string; name: string; total: number; count: number; lastAt: string }>();
    for (const t of monthItems) {
      const key = merchantId(t.merchant);
      const cur = m.get(key);
      if (cur) {
        cur.total += Math.abs(t.amount);
        cur.count += 1;
        if (t.at > cur.lastAt) cur.lastAt = t.at;
      } else {
        m.set(key, { id: key, name: t.merchant, total: Math.abs(t.amount), count: 1, lastAt: t.at });
      }
    }
    const merchants = [...m.values()].sort((a, b) => b.total - a.total);
    const dormant = [...new Set(items
      .filter((t) => t.at.slice(0, 7) !== month)
      .map((t) => t.merchant))].filter((n) => !m.has(merchantId(n)));

    /* Everything that left the account this month, for share-of-month. */
    const monthOutAll = txns
      .filter((t) => t.amount < 0 && t.at.slice(0, 7) === month)
      .reduce((n, t) => n + Math.abs(t.amount), 0);

    const available = budget ? budget.limit + budget.rollover : 0;
    const earlier = items.filter((t) => t.at.slice(0, 7) !== month);

    return {
      inflow, monthItems, heroValue, series, prev, prevFull, best, known,
      merchants, dormant, monthOutAll, available, earlier,
      lastEver: items[0],
    };
  }, [cat, now, txns, history]);

  if (!cat || !cat.meta || !d || cat.items.length === 0) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad scroll-y">
          <Empty
            title="Nothing filed here"
            body="No transaction in the ledger carries this category yet."
          />
        </div>
      </Screen>
    );
  }

  const { meta, budget } = cat;
  const { left, total: monthDays, day } = daysLeft(now);
  const spent = d.heroValue;
  /* Cream on pine and cream on cobalt are different mixes in the tokens. */
  const onDarkMuted = meta.ink === 'olive'
    ? 'var(--on-olive-muted)' : 'var(--on-ink-muted)';

  /* ---- Month over month ---- */
  const prevValue = d.prev?.value ?? 0;
  const diff = spent - prevValue;
  const times = prevValue > 0 ? spent / prevValue : 0;

  /* ---- Envelope ---- */
  const ratio = d.available > 0 ? spent / d.available : 0;
  const remaining = d.available - spent;
  const daily = left > 0 ? remaining / left : remaining;
  const elapsed = day / monthDays;
  const state = ratio > 1 ? 'over' : ratio > 0.85 ? 'tight' : 'ok';

  /* ---- The driver ---- */
  const top = d.merchants[0];
  const without = top ? spent - top.total : spent;
  const wRatio = d.available > 0 ? without / d.available : 0;
  const wDaily = left > 0 ? (d.available - without) / left : 0;
  const avg = d.monthItems.length > 0 ? spent / d.monthItems.length : 0;

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y cat__pane">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow={d.inflow ? 'Money in · May 2024' : 'Category · May 2024'}
              title={meta.label}
              sub={
                <>
                  {cat.items.length} transaction{cat.items.length === 1 ? '' : 's'} on
                  record, {d.monthItems.length} of them this month
                  {budget
                    ? ` · envelope ${compactINR(d.available)}`
                    : d.inflow ? '' : ' · no envelope'}
                </>
              }
              right={<CategoryBadge icon={meta.icon} ink={meta.ink} size={48} />}
            />
          </Rise>

          {/* ---- The month ---- */}
          <Rise>
            <Card tone={meta.ink} pad={22}>
              <Eyebrow tone={onDarkMuted}>
                {d.inflow ? 'Received in May' : 'Spent in May'}
              </Eyebrow>
              <Amount value={spent} className="cat__hero" duration={1300} />

              {spent === 0 ? (
                <p className="cat__vs">
                  Nothing this month. Last entry was{' '}
                  {inr(Math.abs(d.lastEver.amount))} at {d.lastEver.merchant} on{' '}
                  {shortDate(d.lastEver.at)}.
                </p>
              ) : prevValue === 0 ? (
                <p className="cat__vs">
                  {d.prev?.known
                    ? `Nothing at all in ${d.prevFull} — this month starts from zero.`
                    : `The ledger does not reach back past ${d.known[0]?.label}, so there is nothing to compare with yet.`}
                </p>
              ) : (
                <p className="cat__vs">
                  <span className={`cat__vschip cat__vschip--${diff >= 0 ? 'up' : 'down'}`}>
                    {diff >= 0 ? '↑' : '↓'} {inr(Math.abs(diff))}
                  </span>
                  {times >= 2.5 || times <= 0.4
                    ? ` ${times >= 1 ? times.toFixed(1) : (1 / times).toFixed(1)}× ${
                      times >= 1 ? `${d.prevFull}’s total` : `less than ${d.prevFull}`}`
                    : ` ${Math.abs(Math.round((times - 1) * 100))}% ${
                      diff >= 0 ? 'above' : 'below'} ${d.prevFull}`}
                  <span className="cat__vsprev">
                    {d.prevFull} was {inr(prevValue)}
                  </span>
                </p>
              )}

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 0' }} />

              <div className="cat__stats">
                <Stat tone={onDarkMuted} label={d.inflow ? 'Credits' : 'Payments'}
                  value={String(d.monthItems.length)} />
                <Stat tone={onDarkMuted} label="Average"
                  value={avg > 0 ? inr(Math.round(avg)) : '—'} />
                <Stat tone={onDarkMuted} label="Places"
                  value={String(d.merchants.length)} />
                {/* An inflow has no share of an outgoing month — what it
                    has is how much of that month it pays for. */}
                <Stat
                  tone={onDarkMuted}
                  label={d.inflow ? 'Covers' : 'Of May'}
                  value={d.inflow
                    ? `${pctOf(d.monthOutAll, spent)}%`
                    : `${pctOf(spent, d.monthOutAll)}%`}
                />
              </div>
            </Card>
          </Rise>

          {/* ---- The envelope ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <Eyebrow>{d.inflow ? 'Against the month' : 'Budget position'}</Eyebrow>
            <Card tone="warm" pad={20} elevation={0} className="cat__budget">
              {budget ? (
                <>
                  <div className="cat__bhead">
                    <span className="cat__bleft figure"
                      style={{ color: remaining < 0 ? 'var(--vermilion)' : 'var(--ink)' }}>
                      {inr(Math.abs(remaining))}
                    </span>
                    <span className="cat__blabel">
                      {remaining < 0 ? 'over the envelope' : 'left of'}{' '}
                      {remaining < 0 ? '' : inr(d.available)}
                    </span>
                  </div>

                  <div className="cat__bmeter">
                    <Meter
                      value={Math.min(1, ratio)}
                      ink={state === 'ok' ? 'olive' : 'vermilion'}
                      height={9}
                    />
                    <span className="cat__pacemark" style={{ left: `${elapsed * 100}%` }}
                      aria-hidden />
                  </div>

                  <div className="cat__bfoot">
                    <span className="num">{inr(spent)} spent · {pctOf(spent, d.available)}%</span>
                    <span className="num">{Math.round(elapsed * 100)}% of May gone</span>
                  </div>

                  <Rule style={{ margin: '16px 0 14px' }} />

                  <p className="cat__bnote">
                    {remaining < 0
                      ? `Already ${inr(-remaining)} past the limit with ${left} days still to run.`
                      : (
                        <>
                          <b>{inr(Math.round(daily))} a day</b> for the {left} days left.
                          {' '}
                          {ratio < elapsed - 0.04
                            ? `Comfortably behind the calendar — ${pctOf(spent, d.available)}% spent with ${Math.round(elapsed * 100)}% of the month gone.`
                            : ratio > elapsed + 0.04
                              ? `Running ahead of the calendar — ${pctOf(spent, d.available)}% spent with only ${Math.round(elapsed * 100)}% of the month gone.`
                              : 'Exactly on pace with the calendar.'}
                          {budget.rollover !== 0 && (
                            <>
                              {' '}The envelope includes{' '}
                              {budget.rollover > 0 ? '+' : '−'}
                              {inr(Math.abs(budget.rollover))} rolled over from{' '}
                              {d.prevFull}.
                            </>
                          )}
                        </>
                      )}
                  </p>
                </>
              ) : d.inflow ? (
                <p className="cat__bnone">
                  Income is not budgeted — it is what the envelopes are drawn
                  from. {inr(spent)} arrived in May against {inr(d.monthOutAll)}{' '}
                  that left, so the month closes{' '}
                  {spent >= d.monthOutAll
                    ? `${inr(spent - d.monthOutAll)} ahead`
                    : `${inr(d.monthOutAll - spent)} short`}{' '}
                  on the ledger so far.
                </p>
              ) : (
                <p className="cat__bnone">
                  {meta.label} has no envelope, so nothing here counts against a
                  budget. At {inr(spent)} it is {pctOf(spent, d.monthOutAll)}% of
                  everything that left the account in May, and{' '}
                  {d.merchants.length === 1
                    ? 'the single place below is unmeasured'
                    : `all ${d.merchants.length} places below are unmeasured`}.
                </p>
              )}
            </Card>
          </Rise>

          {/* ---- Trend ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <div className="cat__sechead">
              <Eyebrow>Six months</Eyebrow>
              <span className="cat__secmeta num">
                {d.series[0].label} – {d.series[d.series.length - 1].label}
              </span>
            </div>
            <Trend data={d.series} ink={meta.ink} />
            <p className="cat__trendnote">
              {d.known.length < d.series.length
                ? `The ledger starts in ${d.known[0]?.label}; the dotted months predate it and are blank rather than empty. `
                : ''}
              {d.best && d.best.value > 0
                ? `Heaviest month so far is ${d.best.label} at ${inr(d.best.value)}.`
                : 'No month on record carries anything yet.'}
            </p>
          </Rise>

          {/* ---- Merchants ---- */}
          <Rise style={{ paddingTop: 28, paddingBottom: 6 }}>
            <div className="cat__sechead">
              <Eyebrow>Places this month</Eyebrow>
              <span className="cat__secmeta num">{d.merchants.length}</span>
            </div>
          </Rise>

          {d.merchants.length === 0 ? (
            <Rise>
              <p className="cat__bnone">
                No {meta.label.toLowerCase()} at all in May.
              </p>
            </Rise>
          ) : d.merchants.map((mm, i) => (
            <Rise key={mm.id}>
              {i > 0 && <Rule />}
              <motion.button
                className="cat__mrow"
                onClick={() => push({ name: 'merchant', id: mm.id })}
                whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                whileHover={{ x: 2 }}
                transition={snap}
              >
                <span className="cat__mrank num">{i + 1}</span>
                <span className="cat__mbody">
                  <span className="cat__mtop">
                    <span className="cat__mname">{mm.name}</span>
                    <span className="cat__mamt figure">{inr(mm.total)}</span>
                  </span>
                  <span className="cat__mbar">
                    <Meter
                      value={spent > 0 ? mm.total / spent : 0}
                      ink={meta.ink}
                      height={4}
                      delay={0.04 * i}
                    />
                  </span>
                  <span className="cat__mmeta num">
                    {pctOf(mm.total, spent)}% of the category ·{' '}
                    {mm.count} visit{mm.count === 1 ? '' : 's'} · last {shortDate(mm.lastAt)}
                  </span>
                </span>
                <ChevronRight size={16} className="cat__chev" />
              </motion.button>
            </Rise>
          ))}

          {d.dormant.length > 0 && (
            <Rise style={{ paddingTop: 12 }}>
              <p className="cat__dormant">
                Quiet this month: {d.dormant.join(', ')} — on record, but nothing
                in May.
              </p>
            </Rise>
          )}

          {/* ---- The reading ---- */}
          {top && d.merchants.length > 0 && spent > 0 && (
            <Rise style={{ paddingTop: 28 }}>
              <Eyebrow>The reading</Eyebrow>
              <Card tone="warm" pad={20} elevation={0} className="cat__read">
                <p className="cat__readlede">
                  <b>{top.name}</b> is {pctOf(top.total, spent)}% of{' '}
                  {meta.label.split(' &')[0]} this month on{' '}
                  {top.count === 1 ? 'a single entry' : `${top.count} entries`}.
                </p>

                {d.merchants.length > 1 && (
                <div className="cat__ba">
                  <div className="cat__bacol">
                    <span className="cat__balabel">As it stands</span>
                    <span className="cat__bafig figure">{inr(spent)}</span>
                    <span className="cat__bameta num">
                      {budget
                        ? `${pctOf(spent, d.available)}% of the envelope`
                        : `${pctOf(spent, d.monthOutAll)}% of the month`}
                    </span>
                    {budget && left > 0 && (
                      <span className="cat__bameta num">
                        {inr(Math.round(daily))} a day left
                      </span>
                    )}
                  </div>
                  <span className="cat__baarrow" aria-hidden>→</span>
                  <div className="cat__bacol cat__bacol--alt">
                    <span className="cat__balabel">Without it</span>
                    <span className="cat__bafig figure">{inr(without)}</span>
                    <span className="cat__bameta num">
                      {budget
                        ? `${pctOf(without, d.available)}% of the envelope`
                        : `${pctOf(without, d.monthOutAll)}% of the month`}
                    </span>
                    {budget && left > 0 && (
                      <span className="cat__bameta num">
                        {inr(Math.round(wDaily))} a day left
                      </span>
                    )}
                  </div>
                </div>
                )}

                <p className="cat__readnote">
                  {d.merchants.length === 1
                    ? `It is the only name in the category this month, so ${
                      meta.label.split(' &')[0]} is that one line and nothing else.`
                    : (budget
                      ? `Take that one name out and the envelope drops from ${
                        pctOf(spent, d.available)}% to ${pctOf(without, d.available)}% spent — `
                        + `${inr(Math.round(wDaily - daily))} more a day for the last ${left} days. `
                      : `Take that one name out and the category falls to ${inr(without)} — `
                        + `${pctOf(without, d.monthOutAll)}% of the month instead of ${
                          pctOf(spent, d.monthOutAll)}%. `)
                      + `${d.merchants[1].total / top.total > 0.6
                        ? 'The chase is close, though'
                        : 'Nothing else comes near it'}: ${d.merchants[1].name} is next at ${
                        inr(d.merchants[1].total)}.`}
                  {d.merchants.length > 1 && ratio > 1 && wRatio <= 1
                    && ' Without it the envelope would not have broken at all.'}
                </p>
              </Card>
            </Rise>
          )}

          {/* ---- Transactions ---- */}
          <Rise style={{ paddingTop: 28, paddingBottom: 4 }}>
            <div className="cat__sechead">
              <Eyebrow>Transactions</Eyebrow>
              <span className="cat__secmeta num">{cat.items.length}</span>
            </div>
          </Rise>

          {d.monthItems.length > 0 && (
            <Rise><span className="cat__subhead">This month</span></Rise>
          )}
          {cat.items
            .filter((t) => t.at.slice(0, 7) === now.slice(0, 7))
            .map((t, i) => (
              <Rise key={t.id}>
                {i > 0 && <Rule />}
                <TxnRow t={t} fallback={meta.label} onOpen={() => push({ name: 'txn', id: t.id })} />
              </Rise>
            ))}

          {d.earlier.length > 0 && (
            <>
              <Rise style={{ paddingTop: 18 }}>
                <span className="cat__subhead">Earlier</span>
              </Rise>
              {d.earlier.map((t, i) => (
                <Rise key={t.id}>
                  {i > 0 && <Rule />}
                  <TxnRow t={t} fallback={meta.label}
                    onOpen={() => push({ name: 'txn', id: t.id })} />
                </Rise>
              ))}
            </>
          )}

          <Rise style={{ paddingTop: 18 }}>
            <p className="cat__foot">
              {cat.items.length} entr{cat.items.length === 1 ? 'y' : 'ies'} since{' '}
              {shortDate(cat.items[cat.items.length - 1].at)} ·{' '}
              {inr(cat.items.reduce((n, t) => n + Math.abs(t.amount), 0))} lifetime.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="mosaic" height={184} />
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="cat__stat">
      <span className="cat__statlabel" style={{ color: tone }}>{label}</span>
      <span className="cat__statvalue figure">{value}</span>
    </div>
  );
}

function TxnRow({
  t, fallback, onOpen,
}: {
  t: { id: string; merchant: string; amount: number; at: string;
    place?: string; note?: string; recurring?: boolean; flagged?: boolean };
  fallback: string;
  onOpen: () => void;
}) {
  return (
    <motion.button
      className="cat__trow"
      onClick={onOpen}
      whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
      whileHover={{ x: 2 }}
      transition={snap}
    >
      <span className="cat__tbody">
        <span className="cat__ttop">
          <span className="cat__tname">{t.merchant}</span>
          {t.recurring && (
            <span className="cat__ttag" title="Recurring"><IcRepeat size={11} /></span>
          )}
          {t.flagged && (
            <span className="cat__ttag" title="Flagged"><IcFlag size={11} /></span>
          )}
        </span>
        <span className="cat__tsub">
          {shortDate(t.at)} · {t.note ?? t.place ?? fallback}
        </span>
      </span>
      <span
        className="cat__tamt figure"
        style={{ color: t.amount >= 0 ? 'var(--olive)' : 'var(--ink)' }}
      >
        {signedINR(t.amount)}
      </span>
      <ChevronRight size={16} className="cat__chev" />
    </motion.button>
  );
}
