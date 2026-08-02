/**
 * BILLS
 *
 * Everything with a date on it, ranked by how much trouble it can cause.
 * The summary answers the only two questions a bill list is ever asked:
 * how much leaves this month, and how much of it happens without me.
 *
 * Overdue is never carried by colour alone — it takes a rail, a glyph and
 * the word itself, so it survives a monochrome print.
 */
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBills, useActions, useApp, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, CategoryBadge, Meter, Amount, Rule,
} from '../components/ui';
import { IcRepeat, Check } from '../components/icons';
import type { Bill as BillT, BillStatus } from '../data/types';
import { inr, compactINR, pctOf, shortDate } from '../lib/format';
import { snap } from '../lib/motion';
import './Bills.css';

/* ---------------------------------------------------------------- */
/* Shared bits — Bill.tsx imports these                               */
/* ---------------------------------------------------------------- */

/** Whole days from today to a due date. Negative means it has passed. */
export function dueInDays(due: string, now: Date): number {
  const d = new Date(`${due}T00:00:00`);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((a - b) / 86400000);
}

/** "in 2 days" / "4 days ago" / "today" — never a bare ISO date. */
export function duePhrase(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

/** A warning mark, so overdue reads without relying on the red. */
export function AlertGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden
      style={{ flex: 'none' }}>
      <path d="M7 1.6 13 12.4H1L7 1.6Z" stroke="currentColor" strokeWidth="1.4"
        strokeLinejoin="round" />
      <path d="M7 5.6v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10.6" r="0.85" fill="currentColor" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */

const GROUPS: { id: BillStatus; label: string }[] = [
  { id: 'overdue', label: 'Overdue' },
  { id: 'due', label: 'Due soon' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'paid', label: 'Paid' },
];

const sum = (xs: BillT[]) => xs.reduce((n, b) => n + b.amount, 0);

export function Bills() {
  const bills = useBills();
  const { payBill, toggleAutopay } = useActions();
  const { now } = useApp();
  const { back, push } = useNav();
  const nowDate = useMemo(() => new Date(now), [now]);
  const month = now.slice(0, 7);

  const m = useMemo(() => {
    const inMonth = bills.filter((b) => b.due.slice(0, 7) === month);
    const total = sum(inMonth);
    const paid = sum(inMonth.filter((b) => b.status === 'paid'));
    const auto = sum(inMonth.filter((b) => b.autopay));
    const manual = inMonth
      .filter((b) => !b.autopay && b.status !== 'paid')
      .sort((a, b) => b.amount - a.amount);
    return { total, paid, left: total - paid, auto, manual };
  }, [bills, month]);

  const unpaid = bills.filter((b) => b.status !== 'paid');
  const biggest = m.manual[0];

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Money out</Eyebrow>
            <h1 className="bills__title display">Bills</h1>
          </Rise>

          {/* ---- The month, in one card ---- */}
          <Rise style={{ paddingTop: 18 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">Leaving in May</Eyebrow>
              <p className="bills__hero">
                <Amount value={m.total} duration={1200} />
              </p>

              <div className="bills__split">
                <Meter
                  value={m.total > 0 ? m.paid / m.total : 0}
                  ink="olive"
                  track="rgba(253,248,236,0.20)"
                  height={7}
                />
                <div className="bills__splitrow">
                  <span><b className="num">{inr(m.paid)}</b> paid</span>
                  <span><b className="num">{inr(m.left)}</b> still to go</span>
                </div>
              </div>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 15px' }} />

              <div className="bills__autoline">
                <span className="bills__autochip">
                  <IcRepeat size={13} />
                  {pctOf(m.auto, m.total)}% on autopay
                </span>
                <span className="bills__autoamt num">{inr(m.auto)}</span>
              </div>
              <p className="bills__note">
                {biggest
                  ? <>The rest needs a hand. <b>{biggest.name}</b>, at {inr(biggest.amount)},
                    is {pctOf(biggest.amount, m.left)}% of everything still owed this month.</>
                  : <>Every bill this month settles itself. Nothing left to move by hand.</>}
              </p>
            </Card>
          </Rise>

          {/* ---- Groups ---- */}
          {GROUPS.map((g) => {
            const rows = bills.filter((b) => b.status === g.id);
            if (rows.length === 0) return null;
            const groupTotal = sum(rows);
            return (
              <Rise key={g.id} style={{ paddingTop: 26 }}>
                <div className="bills__grouphead">
                  <Eyebrow tone={g.id === 'overdue' ? 'var(--vermilion-deep)' : undefined}>
                    <span className="bills__gh">
                      {g.id === 'overdue' && <AlertGlyph size={12} />}
                      {g.label}
                      <span className="bills__count num">{rows.length}</span>
                    </span>
                  </Eyebrow>
                  <span className="bills__grouptotal num">{compactINR(groupTotal)}</span>
                </div>

                <div className="bills__group">
                  <AnimatePresence initial={false}>
                    {rows.map((b, i) => (
                      <motion.div
                        key={b.id}
                        layout
                        exit={{ opacity: 0, x: 24 }}
                        transition={snap}
                      >
                        {i > 0 && <Rule tone="var(--hairline-soft)" />}
                        <BillRow
                          bill={b}
                          now={nowDate}
                          onOpen={() => push({ name: 'bill', id: b.id })}
                          onPay={() => payBill(b.id)}
                          onAutopay={() => toggleAutopay(b.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Rise>
            );
          })}

          {unpaid.length === 0 && (
            <Rise style={{ paddingTop: 26 }}>
              <div className="bills__clear">
                <span className="bills__clearmark"><Check size={18} /></span>
                <p className="display bills__cleartitle">All clear</p>
                <p className="bills__clearbody">
                  Nothing outstanding. The next one lands {shortDate(bills[0]?.due ?? now)}.
                </p>
              </div>
            </Rise>
          )}

          <Rise style={{ paddingTop: 24 }}>
            <p className="bills__foot">
              Autopay debits on the morning of the due date. Tap the marker on any
              row to switch it.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

/* ================================================================
   One bill in the list
   ================================================================ */

function BillRow({
  bill, now, onOpen, onPay, onAutopay,
}: {
  bill: BillT; now: Date;
  onOpen: () => void; onPay: () => void; onAutopay: () => void;
}) {
  const cat = CATEGORIES[bill.category];
  const days = dueInDays(bill.due, now);
  const overdue = bill.status === 'overdue';
  const paid = bill.status === 'paid';

  return (
    <div className={`brow${overdue ? ' brow--over' : ''}`}>
      <button className="brow__link" onClick={onOpen}
        aria-label={`Open ${bill.name}, ${inr(bill.amount)}, due ${duePhrase(days)}`} />

      <CategoryBadge icon={cat.icon} ink={cat.ink} size={40} />

      <span className="brow__body">
        <span className="brow__name">{bill.name}</span>
        <span className="brow__meta">
          {paid ? (
            <span className="brow__paid">
              <Check size={12} /> Paid · was due {shortDate(bill.due)}
            </span>
          ) : (
            <span className={`brow__when${overdue ? ' brow__when--over' : ''}`}>
              {overdue && <AlertGlyph size={11} />}
              {overdue ? `Overdue ${duePhrase(days)}` : duePhrase(days)}
            </span>
          )}
          <button
            className={`brow__auto${bill.autopay ? ' brow__auto--on' : ''}`}
            onClick={onAutopay}
            aria-label={`${bill.autopay ? 'Turn off' : 'Turn on'} autopay for ${bill.name}`}
          >
            <IcRepeat size={11} />
            {bill.autopay ? 'Autopay' : 'Manual'}
          </button>
        </span>
      </span>

      <span className="brow__right">
        <span className={`brow__amt figure${paid ? ' brow__amt--paid' : ''}`}>
          {inr(bill.amount)}
        </span>
        {!paid && (
          <motion.button
            className={`brow__pay${overdue ? ' brow__pay--over' : ''}`}
            onClick={onPay}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -1 }}
            transition={snap}
            aria-label={`Pay ${bill.name}, ${inr(bill.amount)}`}
          >
            Pay
          </motion.button>
        )}
      </span>
    </div>
  );
}
