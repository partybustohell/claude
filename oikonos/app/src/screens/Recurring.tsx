/**
 * RECURRING
 *
 * Every commitment that renews without a decision, gathered from the two
 * places they hide: the ledger's own recurring flags and the subscription
 * list. The screen exists to answer one question the app never states
 * outright — how much of the month is already spent before you choose
 * anything at all.
 *
 * The rail under the headline is the second answer: commitments are not
 * spread across the month, they cluster in the first week, days before
 * the salary lands.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp, useSubscriptions, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, Meter, Amount,
  CategoryBadge, SectionHead, Rule, Empty,
} from '../components/ui';
import { IcRepeat } from '../components/icons';
import type { CategoryId } from '../data/types';
import { inr, compactINR, shortDate, pctOf } from '../lib/format';
import { snap } from '../lib/motion';
import './Recurring.css';

interface Rep {
  key: string;
  name: string;
  category: CategoryId;
  /** normalised to one month */
  perMonth: number;
  /** what actually gets billed, and how often */
  billed: number;
  everyMonths: number;
  cadence: string;
  /** day of the month the money moves, where it is knowable */
  day: number;
  dir: 'in' | 'out';
  bucket: 'income' | 'fixed' | 'saving' | 'subs';
}

const BUCKETS: { id: Rep['bucket']; label: string; note: string }[] = [
  { id: 'fixed', label: 'Home & utilities', note: 'Rent, power, line — the floor under the month.' },
  { id: 'saving', label: 'Saving & investing', note: 'Committed, but to yourself.' },
  { id: 'subs', label: 'Subscriptions', note: 'Small, quiet and annual when you add them up.' },
];

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function Recurring() {
  const { txns, history } = useApp();
  const { rows: subs, perMonth: subsMonthly } = useSubscriptions();
  const { back, push } = useNav();

  /* ---- Everything that repeats, from both sources ---- */
  const items = useMemo<Rep[]>(() => {
    const seen = new Map<string, Rep>();

    for (const t of [...txns].sort((a, b) => b.at.localeCompare(a.at))) {
      if (!t.recurring || seen.has(t.merchant)) continue;
      const day = new Date(t.at).getDate();
      const out = t.amount < 0;
      seen.set(t.merchant, {
        key: t.id,
        name: t.merchant,
        category: t.category,
        perMonth: Math.abs(t.amount),
        billed: Math.abs(t.amount),
        everyMonths: 1,
        cadence: `Monthly · ${ordinal(day)}`,
        day,
        dir: out ? 'out' : 'in',
        bucket: !out ? 'income' : t.category === 'transfer' ? 'saving' : 'fixed',
      });
    }

    const ledger = [...seen.values()];

    const fromSubs = subs.map<Rep>((s) => ({
      key: s.id,
      name: s.name,
      category: s.category,
      perMonth: s.perMonth,
      billed: s.amount,
      everyMonths: s.everyMonths,
      cadence: s.everyMonths === 1
        ? `Monthly · next ${shortDate(s.nextAt)}`
        : `Yearly · ${inr(s.amount)} on ${shortDate(s.nextAt)}`,
      day: s.everyMonths === 1 ? new Date(s.nextAt).getDate() : 0,
      dir: 'out',
      bucket: 'subs',
    }));

    return [...ledger, ...fromSubs].sort((a, b) => b.perMonth - a.perMonth);
  }, [txns, subs]);

  const money = useMemo(() => {
    const income = items.filter((i) => i.dir === 'in');
    const out = items.filter((i) => i.dir === 'out');
    const inTotal = income.reduce((n, i) => n + i.perMonth, 0)
      || history[history.length - 1].income;
    const committed = out.reduce((n, i) => n + i.perMonth, 0);
    const saving = out.filter((i) => i.bucket === 'saving')
      .reduce((n, i) => n + i.perMonth, 0);
    return {
      income, out, inTotal, committed, saving,
      spend: committed - saving,
      free: inTotal - committed,
      salaryDay: income[0] ? income[0].day : 0,
    };
  }, [items, history]);

  /* ---- Where in the month it all happens ---- */
  const rail = useMemo(() => {
    const days = new Map<number, { out: number; in: number }>();
    for (const i of items) {
      if (!i.day) continue;
      const cur = days.get(i.day) ?? { out: 0, in: 0 };
      if (i.dir === 'out') cur.out += i.perMonth; else cur.in += i.perMonth;
      days.set(i.day, cur);
    }
    const marks = [...days.entries()].map(([day, v]) => ({ day, ...v }));
    const peak = Math.max(1, ...marks.map((m) => Math.max(m.out, m.in)));
    const beforePay = marks
      .filter((m) => money.salaryDay > 0 && m.day < money.salaryDay)
      .reduce((n, m) => n + m.out, 0);
    return { marks, peak, beforePay };
  }, [items, money.salaryDay]);

  if (items.length === 0) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <Empty
            title="Nothing repeats"
            body="No standing instructions and no subscriptions. Every rupee this month is a decision."
            icon={<IcRepeat size={26} />}
          />
        </div>
      </Screen>
    );
  }

  const share = money.inTotal > 0 ? money.committed / money.inTotal : 0;

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Money</Eyebrow>
            <h1 className="rec__title display">What repeats</h1>
            <p className="rec__sub">
              {items.length} standing items — {money.income.length} in,{' '}
              {money.out.length} out — read from the ledger and your subscriptions.
            </p>
          </Rise>

          {/* ---- The committed month ---- */}
          <Rise style={{ paddingTop: 20 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">Committed each month</Eyebrow>
              <p className="rec__hero">
                <Amount value={money.committed} duration={1300} />
              </p>

              <div className="rec__bar">
                <Meter
                  value={share}
                  ink={share > 0.7 ? 'vermilion' : 'olive'}
                  track="rgba(253,248,236,0.20)"
                  height={8}
                />
                <div className="rec__barfoot">
                  <span>{Math.round(share * 100)}% of {compactINR(money.inTotal)} coming in</span>
                  <span className="num">{inr(money.free)} free</span>
                </div>
              </div>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 15px' }} />

              <p className="rec__note">
                Before a single discretionary rupee moves,{' '}
                <b>{Math.round(share * 100)}% of the month is spoken for</b>. Softer
                than it looks: {inr(money.saving)} of that is savings, so true fixed
                cost is {inr(money.spend)} —{' '}
                {pctOf(money.spend, money.inTotal)}% of income.
              </p>
            </Card>
          </Rise>

          {/* ---- The shape of the month ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="When it moves" />
            <div className="rec__rail">
              <div className="rec__railplot" aria-hidden>
                {rail.marks.map((m) => {
                  const v = Math.max(m.out, m.in);
                  const h = Math.max(4, Math.sqrt(v / rail.peak) * 54);
                  return (
                    <span
                      key={m.day}
                      className={`rec__tick${m.in > m.out ? ' rec__tick--in' : ''}`}
                      style={{ left: `${((m.day - 1) / 30) * 100}%`, height: h }}
                    />
                  );
                })}
              </div>
              <div className="rec__railline" aria-hidden />
              <div className="rec__railaxis">
                {[1, 10, 20, 31].map((d) => (
                  <span key={d} className="rec__railday num"
                    style={{ left: `${((d - 1) / 30) * 100}%` }}>{d}</span>
                ))}
              </div>
            </div>
            <p className="rec__railnote">
              <span className="rec__key rec__key--out" aria-hidden />Out
              <span className="rec__key rec__key--in" aria-hidden />In ·{' '}
              {inr(rail.beforePay)} leaves before the salary lands on the{' '}
              {ordinal(money.salaryDay)}, so the account has to carry it.
            </p>
          </Rise>

          {/* ---- Money in ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="Money in" />
            <div className="rec__group">
              {money.income.map((i, n) => (
                <div key={i.key}>
                  {n > 0 && <Rule tone="var(--hairline-soft)" />}
                  <RepRow item={i} />
                </div>
              ))}
            </div>
          </Rise>

          {/* ---- Money out, by kind ---- */}
          <Rise style={{ paddingTop: 28, paddingBottom: 4 }}>
            <SectionHead title="Money out" />
            <p className="rec__outsum">
              {inr(money.committed)} a month across {money.out.length} lines.
            </p>
          </Rise>

          {BUCKETS.map((b) => {
            const rows = money.out.filter((i) => i.bucket === b.id);
            if (rows.length === 0) return null;
            const total = rows.reduce((n, i) => n + i.perMonth, 0);
            return (
              <Rise key={b.id} style={{ paddingTop: 18 }}>
                <div className="rec__bhead">
                  <span className="rec__blabel">{b.label}</span>
                  <span className="rec__btotal num">{inr(Math.round(total))}<span> / mo</span></span>
                </div>
                <div className="rec__group">
                  {rows.map((i, n) => (
                    <div key={i.key}>
                      {n > 0 && <Rule tone="var(--hairline-soft)" />}
                      <RepRow item={i} />
                    </div>
                  ))}
                </div>
                {b.id === 'subs' ? (
                  <motion.button
                    className="rec__more"
                    onClick={() => push({ name: 'subscriptions' })}
                    whileTap={{ scale: 0.99 }}
                    whileHover={{ x: 2 }}
                    transition={snap}
                  >
                    {b.note} {compactINR(subsMonthly * 12)} a year — see all
                  </motion.button>
                ) : (
                  <p className="rec__bnote">{b.note}</p>
                )}
              </Rise>
            );
          })}

          <Rise style={{ paddingTop: 26 }}>
            <p className="rec__foot">
              Yearly plans are shown at their monthly equivalent so they can be
              compared with everything else. The billed figure sits under each name.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function RepRow({ item }: { item: Rep }) {
  const cat = CATEGORIES[item.category];
  const income = item.dir === 'in';
  return (
    <div className="rrow">
      <CategoryBadge icon={cat.icon} ink={cat.ink} size={38} />
      <span className="rrow__body">
        <span className="rrow__name">{item.name}</span>
        <span className="rrow__cadence">
          <IcRepeat size={11} />
          {item.cadence}
        </span>
      </span>
      <span className="rrow__right">
        <span
          className="rrow__amt figure"
          style={{ color: income ? 'var(--olive)' : 'var(--ink)' }}
        >
          {income ? '+' : ''}{inr(Math.round(item.perMonth))}
        </span>
        <span className="rrow__per">a month</span>
      </span>
    </div>
  );
}
