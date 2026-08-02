import { useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useApp, useMerchant, useMerchants, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, Rule, Meter, Empty, Amount,
  CategoryBadge, INK_VAR, type Ink,
} from '../components/ui';
import { ChevronRight, IcRepeat, IcFlag } from '../components/icons';
import {
  inr, compactINR, signedINR, shortDate, time, pctOf,
} from '../lib/format';
import { snap, surface } from '../lib/motion';
import './Merchant.css';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 86400000;

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/* ================================================================
   Single-series month bars.
   MonthColumns pairs income against expenses; one merchant has only
   one series, and an empty month has to stay legible as an empty
   month — hence a printed track under every slot rather than a
   missing bar.
   ================================================================ */

function MonthBars({
  data, ink,
}: { data: { key: string; label: string; value: number; current: boolean }[]; ink: Ink }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const peak = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="mbars" ref={ref} role="img"
      aria-label={data.map((d) => `${d.label} ${d.value > 0 ? inr(d.value) : 'nothing'}`).join(', ')}>
      {data.map((d, i) => (
        <div key={d.key} className={`mbars__slot ${d.current ? 'mbars__slot--now' : ''}`}>
          <span className="mbars__val num">{d.value > 0 ? compactINR(d.value) : '—'}</span>
          <span className="mbars__track">
            <motion.span
              className="mbars__fill tex-ink"
              style={{ background: INK_VAR[ink] }}
              initial={{ scaleY: 0 }}
              animate={{
                scaleY: inView || reduce
                  ? (d.value > 0 ? Math.max(0.02, d.value / peak) : 0)
                  : 0,
              }}
              transition={reduce ? { duration: 0 } : { ...surface, delay: 0.05 * i }}
            />
          </span>
          <span className="mbars__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Merchant
   ================================================================ */

export function Merchant({ id }: { id: string }) {
  const { back, push } = useNav();
  const m = useMerchant(id);
  const all = useMerchants();
  const { now, budgets, txns, history, accounts } = useApp();

  const d = useMemo(() => {
    if (!m) return undefined;
    const month = now.slice(0, 7);
    const meta = CATEGORIES[m.category];
    const firstAt = m.items[m.items.length - 1].at;

    /* This merchant's month, and the category's month around it. */
    const monthHere = m.items
      .filter((t) => t.at.slice(0, 7) === month)
      .reduce((n, t) => n + Math.abs(t.amount), 0);
    const catMonth = txns
      .filter((t) => t.category === m.category && t.amount < 0 && t.at.slice(0, 7) === month)
      .reduce((n, t) => n + Math.abs(t.amount), 0);

    const budget = budgets.find((b) => b.category === m.category);
    const envelope = budget ? budget.limit + budget.rollover : 0;

    /* Six-month bar series, one slot per seeded history month. */
    const series = history.map((h) => {
      const key = h.month.slice(0, 7);
      return {
        key,
        label: MONTH_ABBR[new Date(h.month).getMonth()],
        value: m.items
          .filter((t) => t.at.slice(0, 7) === key)
          .reduce((n, t) => n + Math.abs(t.amount), 0),
        current: key === month,
      };
    });
    const live = series.filter((s) => s.value > 0);
    const best = live.reduce<typeof live[number] | undefined>(
      (acc, s) => (!acc || s.value > acc.value ? s : acc), undefined);

    /* Standing among the places in the same category. */
    const peers = all.filter((x) => x.category === m.category);
    const rank = peers.findIndex((x) => x.id === m.id) + 1;

    /* Cadence and habit — neither is stated anywhere in the ledger. */
    const span = daysBetween(firstAt, m.lastAt);
    const cadence = m.count > 1 ? Math.max(1, Math.round(span / (m.count - 1))) : 0;
    const dayCount = new Map<number, number>();
    for (const t of m.items) {
      const w = new Date(t.at).getDay();
      dayCount.set(w, (dayCount.get(w) ?? 0) + 1);
    }
    const habitDay = [...dayCount.entries()].sort((a, b) => b[1] - a[1])[0];

    const acctNames = [...new Set(m.items.map((t) => t.accountId))]
      .map((a) => accounts.find((x) => x.id === a)?.name ?? a);

    const biggest = m.items.reduce((a, b) =>
      (Math.abs(b.amount) > Math.abs(a.amount) ? b : a));

    return {
      meta, firstAt, monthHere, catMonth, budget, envelope,
      series, live, best, peers, rank, cadence, habitDay, acctNames, biggest,
      income: m.items.every((t) => t.amount > 0),
      avg: m.total / m.count,
    };
  }, [m, all, now, budgets, txns, history, accounts]);

  if (!m || !d) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad scroll-y">
          <Empty
            title="No such merchant"
            body="Nothing in the ledger carries this name any more."
          />
        </div>
      </Screen>
    );
  }

  const envShare = d.envelope > 0 ? d.monthHere / d.envelope : 0;
  const catShare = d.catMonth > 0 ? d.monthHere / d.catMonth : 0;
  const headroom = d.monthHere > 0 ? Math.floor(d.envelope / d.monthHere) : 0;

  /* Notes — the things the rows do not say out loud. */
  const notes: string[] = [];
  if (d.peers.length > 1) {
    notes.push(
      `${ordinal(d.rank)} of ${d.peers.length} places in ${d.meta.label}, by lifetime spend.`,
    );
  }
  if (m.count === 1) {
    notes.push(
      `First appearance in ${history.length} months of ledger — nothing under this name before `
      + `${MONTH_ABBR[new Date(m.lastAt).getMonth()]}.`,
    );
  } else if (d.cadence > 0) {
    notes.push(
      `${m.count} visits, about one every ${d.cadence} day${d.cadence === 1 ? '' : 's'}`
      + (d.habitDay && d.habitDay[1] > 1 ? `, usually a ${WEEKDAY[d.habitDay[0]]}.` : '.'),
    );
  }
  if (m.count > 2) {
    notes.push(
      `Dearest visit was ${inr(Math.abs(d.biggest.amount))} on ${shortDate(d.biggest.at)}, `
      + `${Math.round((Math.abs(d.biggest.amount) / d.avg - 1) * 100)}% above the usual.`,
    );
  }
  notes.push(
    d.acctNames.length === 1
      ? `Always paid from ${d.acctNames[0]}.`
      : `Paid from ${d.acctNames.length} accounts — ${d.acctNames.join(', ')}.`,
  );

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y mer__pane">
        <Stack gap={0}>

          {/* ---- Identity ---- */}
          <Rise>
            <motion.button
              className="mer__catchip"
              onClick={() => push({ name: 'category', id: m.category })}
              whileTap={{ scale: 0.98 }}
              transition={snap}
            >
              <CategoryBadge icon={d.meta.icon} ink={d.meta.ink} size={28} />
              <span className="eyebrow">{d.meta.label}</span>
              <ChevronRight size={13} className="mer__catchev" />
            </motion.button>
            <h1 className="mer__name display">{m.name}</h1>
            {m.place && <p className="mer__place">{m.place}</p>}
          </Rise>

          {/* ---- The ledger card ---- */}
          <Rise style={{ paddingTop: 20 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">
                {d.income ? 'Received in total' : 'Spent here in total'}
              </Eyebrow>
              <Amount value={m.total} className="mer__life" />
              <p className="mer__lifemeta">
                {d.acctNames.length === 1
                  ? `Paid from ${d.acctNames[0]}`
                  : `Across ${d.acctNames.length} accounts`}
              </p>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 0' }} />

              <div className="mer__stats">
                <Stat label="Visits" value={String(m.count)} />
                <Stat label="Average" value={inr(Math.round(d.avg))} />
                <Stat label="First seen" value={shortDate(d.firstAt)} />
                <Stat label="Last seen" value={shortDate(m.lastAt)} />
              </div>
            </Card>
          </Rise>

          {/* ---- Budget impact ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <Eyebrow>Budget impact</Eyebrow>
            <Card tone="warm" pad={20} elevation={0} className="mer__impact">
              {d.monthHere === 0 ? (
                <p className="mer__impactnote">
                  Nothing here this month. The last visit was {shortDate(m.lastAt)},
                  for {inr(Math.abs(m.items[0].amount))} — it sits in April’s envelope,
                  not May’s.
                </p>
              ) : (
                <>
                  {d.budget && (
                    <div className="mer__bar">
                      <div className="mer__barhead">
                        <span className="mer__barlabel">
                          of the {d.meta.label} envelope
                        </span>
                        <span className="mer__barpct num">{pctOf(d.monthHere, d.envelope)}%</span>
                      </div>
                      <Meter
                        value={envShare}
                        ink={envShare > 0.5 ? 'vermilion' : d.meta.ink}
                        height={8}
                      />
                      <p className="mer__barfoot">
                        {inr(d.monthHere)} of {inr(d.envelope)} allocated for May
                      </p>
                    </div>
                  )}

                  <div className="mer__bar">
                    <div className="mer__barhead">
                      <span className="mer__barlabel">
                        of all {d.meta.label.split(' &')[0].toLowerCase()} spending this month
                      </span>
                      <span className="mer__barpct num">{pctOf(d.monthHere, d.catMonth)}%</span>
                    </div>
                    <Meter value={catShare} ink="ink" height={8} />
                    <p className="mer__barfoot">
                      {inr(d.monthHere)} of {inr(d.catMonth)} across the category
                    </p>
                  </div>

                  <Rule />
                  <p className="mer__impactnote">
                    {d.budget
                      ? `${m.count === 1 ? 'One visit' : `${m.count} visits`} took `
                        + `${pctOf(d.monthHere, d.envelope)}% of a ${compactINR(d.envelope)} `
                        + `envelope — ${headroom} more at this price and it is empty.`
                      : `${d.meta.label} carries no envelope this month, so nothing here `
                        + 'counts against a budget.'}
                  </p>
                </>
              )}
            </Card>
          </Rise>

          {/* ---- Month series ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <div className="mer__sechead">
              <Eyebrow>Spend by month</Eyebrow>
              <span className="mer__secmeta num">
                {d.live.length} of {d.series.length} months
              </span>
            </div>
            <MonthBars data={d.series} ink={d.meta.ink} />
            <p className="mer__chartnote">
              {d.live.length <= 1
                ? `A single month of history — nothing before ${d.live[0]?.label ?? '—'}.`
                : `Heaviest month was ${d.best?.label} at ${inr(d.best?.value ?? 0)}.`}
            </p>
          </Rise>

          {/* ---- Reading ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Eyebrow>Reading</Eyebrow>
            <ul className="mer__notes">
              {notes.map((n) => (
                <li key={n} className="mer__note">
                  <span className="mer__notedot" aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </Rise>

          {/* ---- The rows ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="mer__sechead">
              <Eyebrow>Transactions</Eyebrow>
              <span className="mer__secmeta num">{m.items.length}</span>
            </div>
          </Rise>

          {m.items.map((t, i) => (
            <Rise key={t.id}>
              <motion.button
                className="mer__row"
                onClick={() => push({ name: 'txn', id: t.id })}
                whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                whileHover={{ x: 2 }}
                transition={snap}
              >
                <span className="mer__rowbody">
                  <span className="mer__rowtop">
                    <span className="mer__rowdate">{shortDate(t.at)}</span>
                    <span className="mer__rowtime num">{time(t.at)}</span>
                    {t.recurring && (
                      <span className="mer__rowtag" title="Recurring"><IcRepeat size={11} /></span>
                    )}
                    {t.flagged && (
                      <span className="mer__rowtag" title="Flagged"><IcFlag size={11} /></span>
                    )}
                  </span>
                  <span className="mer__rowsub">
                    {t.note ?? t.place ?? d.meta.label}
                  </span>
                </span>
                <span
                  className="mer__rowamt figure"
                  style={{ color: t.amount >= 0 ? 'var(--olive)' : 'var(--ink)' }}
                >
                  {signedINR(t.amount)}
                </span>
                <ChevronRight size={16} className="mer__rowchev" />
              </motion.button>
              {i < m.items.length - 1 && <Rule />}
            </Rise>
          ))}

          <Rise style={{ paddingTop: 16 }}>
            <p className="mer__foot">
              {m.items.length} transaction{m.items.length === 1 ? '' : 's'} ·{' '}
              {inr(m.total)} since {shortDate(d.firstAt)}
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mer__stat">
      <span className="mer__statlabel">{label}</span>
      <span className="mer__statvalue figure">{value}</span>
    </div>
  );
}
