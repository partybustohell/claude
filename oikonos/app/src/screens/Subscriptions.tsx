/**
 * SUBSCRIPTIONS
 *
 * The annual number nobody computes. Every row is normalised to a monthly
 * figure so a ₹16,000 yearly plan can be compared with a ₹149 monthly one,
 * but the headline is deliberately the year — that is the sum that changes
 * behaviour.
 *
 * Cancelling is a two-step: the confirm strip states what the year saves,
 * because "are you sure" is a worse question than "is it worth ₹7,788".
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptions, useActions, useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, Amount, CategoryBadge, Empty,
} from '../components/ui';
import { ShareBar, tintScale } from '../components/charts';
import { IcRepeat } from '../components/icons';
import { inr, shortDate, pctOf } from '../lib/format';
import { snap, gentle } from '../lib/motion';
import { AlertGlyph } from './Bills';
import './Subscriptions.css';
import { PlateFoot } from '../illustrations/place';

const WORDS = ['no', 'one', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
/** Small counts read as words in editorial copy; large ones as figures. */
const count = (n: number) => WORDS[n] ?? String(n);

export function Subscriptions() {
  const { rows, perMonth, perYear } = useSubscriptions();
  const { cancelSub } = useActions();
  const { goals } = useApp();
  const { back } = useNav();

  const [confirm, setConfirm] = useState<string | null>(null);
  /* What the shelf was worth when the screen opened — so the empty state
     can say what was let go. */
  const [opening] = useState(perYear);

  const yearly = rows.filter((r) => r.everyMonths > 1);
  const yearlyTotal = yearly.reduce((n, r) => n + r.amount, 0);

  const next = useMemo(
    () => [...rows].sort((a, b) => a.nextAt.localeCompare(b.nextAt))[0],
    [rows],
  );

  /* A year of this, held against the nearest goal — same money, other life. */
  const goal = useMemo(
    () => [...goals].sort((a, b) => a.target - b.target)[0],
    [goals],
  );

  const risen = rows.filter((r) => r.priceRose);

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Money out</Eyebrow>
            <h1 className="subs__title display">Subscriptions</h1>
          </Rise>

          {rows.length === 0 ? (
            <Rise style={{ paddingTop: 30 }}>
              <div className="subs__gone">
                <Empty
                  title="Nothing on repeat"
                  body={`Every subscription is cancelled. That is ${inr(opening)} a year no longer leaving on its own.`}
                  icon={<IcRepeat size={26} />}
                />
              </div>
            </Rise>
          ) : (
            <>
              {/* ---- The year ---- */}
              <Rise style={{ paddingTop: 18 }}>
                <Card tone="ink" pad={22}>
                  <Eyebrow tone="var(--on-ink-muted)">A year of these</Eyebrow>
                  <p className="subs__hero">
                    <Amount value={perYear} duration={1400} />
                  </p>
                  <p className="subs__herometa">
                    {inr(Math.round(perMonth))} a month across {rows.length}{' '}
                    {rows.length === 1 ? 'subscription' : 'subscriptions'}
                    {next && <> · next up {next.name} on {shortDate(next.nextAt)}</>}
                  </p>

                  <div className="subs__note">
                    <p>
                      That is <b>{pctOf(perYear, goal.target)}% of {goal.name}</b> —
                      the same money, differently spent.
                      {yearly.length > 0 && (
                        <>
                          {' '}{yearly.length === 1
                            ? `One yearly plan carries ${inr(yearlyTotal)} of it and never shows up in a monthly view.`
                            : `${count(yearly.length)} yearly plans carry ${inr(yearlyTotal)} of it and never show up in a monthly view.`}
                        </>
                      )}
                    </p>
                  </div>
                </Card>
              </Rise>

              {/* ---- The mix ---- */}
              <Rise style={{ paddingTop: 22 }}>
                <div className="subs__mix">
                  <ShareBar
                    parts={rows.map((r, i) => ({
                      id: r.id,
                      share: perMonth > 0 ? r.perMonth / perMonth : 0,
                      ink: r.meta.ink,
                      color: tintScale(r.meta.ink, i, rows.length),
                    }))}
                    height={11}
                  />
                  <p className="subs__mixnote">
                    Dearest first. {rows[0].name} alone is{' '}
                    {pctOf(rows[0].perMonth, perMonth)}% of the monthly bill.
                  </p>
                </div>
              </Rise>

              {risen.length > 0 && (
                <Rise style={{ paddingTop: 20 }}>
                  <div className="subs__alert">
                    <span className="subs__alerticon"><AlertGlyph size={14} /></span>
                    <p>
                      {risen.map((r) => (
                        <span key={r.id}>
                          <b>{r.name}</b> rose {inr(r.priceRose ?? 0)} to {inr(r.amount)} —{' '}
                          {inr(Math.round((r.priceRose ?? 0) * (12 / r.everyMonths)))} more a year.
                        </span>
                      ))}
                    </p>
                  </div>
                </Rise>
              )}

              {/* ---- The list ---- */}
              <Rise style={{ paddingTop: 26, paddingBottom: 10 }}>
                <div className="subs__lhead">
                  <Eyebrow>Subscription</Eyebrow>
                  <Eyebrow>True cost, a month</Eyebrow>
                </div>
                <div className="subs__list">
                  <AnimatePresence initial={false}>
                    {rows.map((r) => {
                      const yearlyCost = (r.amount * 12) / r.everyMonths;
                      const asking = confirm === r.id;
                      return (
                        <motion.div
                          key={r.id}
                          className="srow"
                          layout
                          exit={{ opacity: 0, x: 30, height: 0 }}
                          transition={gentle}
                        >
                          <div className="srow__main">
                            <CategoryBadge icon={r.meta.icon} ink={r.meta.ink} size={38} />
                            <span className="srow__body">
                              <span className="srow__name">{r.name}</span>
                              <span className="srow__meta">
                                {inr(r.amount)}{' '}
                                {r.everyMonths === 1 ? 'monthly'
                                  : r.everyMonths === 12 ? 'yearly'
                                    : `every ${r.everyMonths} months`}
                                {' · next '}{shortDate(r.nextAt)}
                              </span>
                              {r.priceRose && (
                                <span className="srow__rose">
                                  <AlertGlyph size={10} />
                                  Up {inr(r.priceRose)} from {inr(r.amount - r.priceRose)}
                                </span>
                              )}
                            </span>
                            <span className="srow__right">
                              <span className="srow__amt figure">
                                {inr(Math.round(r.perMonth))}
                              </span>
                              <motion.button
                                className={`srow__x${asking ? ' srow__x--on' : ''}`}
                                onClick={() => setConfirm(asking ? null : r.id)}
                                whileTap={{ scale: 0.92 }}
                                transition={snap}
                                aria-label={`Cancel ${r.name}`}
                                aria-expanded={asking}
                              >
                                Cancel
                              </motion.button>
                            </span>
                          </div>

                          <AnimatePresence initial={false}>
                            {asking && (
                              <motion.div
                                className="srow__confirm"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={snap}
                              >
                                <p className="srow__ask">
                                  Drop {r.name}? Keeps {inr(Math.round(yearlyCost))} a year.
                                </p>
                                <div className="srow__acts">
                                  <button className="srow__keep" onClick={() => setConfirm(null)}>
                                    Keep
                                  </button>
                                  <button
                                    className="srow__go"
                                    onClick={() => { setConfirm(null); cancelSub(r.id); }}
                                  >
                                    Cancel it
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </Rise>

              <Rise>
                <p className="subs__foot">
                  Cancelling removes the line from Oikonos and stops it counting
                  against your month. The provider still needs telling.
                </p>
              </Rise>
            </>
          )}
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="windmill" height={200} />
        </Stack>
      </div>
    </Screen>
  );
}
