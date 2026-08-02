import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBudgetRows, useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, Eyebrow, Stack, Rise, Card, Meter, CategoryBadge, IconButton,
} from '../components/ui';
import { Ring } from '../components/charts';
import { IcSpark } from '../components/icons';
import { inr, compactINR } from '../lib/format';
import { snap } from '../lib/motion';
import './Budgets.css';

/** Days remaining in the month, from the app's pinned clock. */
function daysLeft(nowIso: string): { left: number; total: number } {
  const d = new Date(nowIso);
  const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return { left: total - d.getDate(), total };
}

export function Budgets() {
  const rows = useBudgetRows();
  const { now } = useApp();
  const { openSheet, push } = useNav();
  const { left, total } = useMemo(() => daysLeft(now), [now]);

  const allocated = rows.reduce((n, r) => n + r.available, 0);
  const spent = rows.reduce((n, r) => n + r.spent, 0);
  const remaining = allocated - spent;
  const ratio = allocated > 0 ? spent / allocated : 0;

  /* Pace: are you spending faster than the month is passing? */
  const elapsed = (total - left) / total;
  const ahead = ratio > elapsed + 0.04;
  const behind = ratio < elapsed - 0.04;
  const safeDaily = left > 0 ? remaining / left : remaining;

  const over = rows.filter((r) => r.state === 'over');
  const tight = rows.filter((r) => r.state === 'tight');

  return (
    <Screen>
      <div className="pane pane--pad scroll-y bud__scroll">
        <Stack gap={0}>
          <Rise>
            <div className="bud__headrow">
              <div>
                <Eyebrow>Budgets</Eyebrow>
                <h1 className="bud__title display">May</h1>
              </div>
              <IconButton label="Insights" onClick={() => push({ name: 'insights' })}>
                <IcSpark size={19} />
              </IconButton>
            </div>
          </Rise>

          {/* ---- The month at a glance ---- */}
          <Rise style={{ paddingTop: 20 }}>
            <Card tone="ink" pad={22}>
              <div className="bud__glance">
                <Ring value={ratio} ink={ratio > 1 ? 'vermilion' : 'olive'} size={78} stroke={9} />
                <div className="bud__glancebody">
                  <Eyebrow tone="var(--on-ink-muted)">
                    {remaining >= 0 ? 'Left to spend' : 'Over budget'}
                  </Eyebrow>
                  <p className="bud__glancenum figure">{inr(Math.abs(remaining))}</p>
                  <p className="bud__glancemeta">
                    of {compactINR(allocated)} allocated
                  </p>
                </div>
              </div>

              <div className="bud__pace">
                <span className={`bud__pacedot bud__pacedot--${ahead ? 'hot' : behind ? 'cool' : 'even'}`} />
                <p>
                  {ahead
                    ? `Spending ahead of the month. ${inr(Math.round(safeDaily))} a day keeps you inside.`
                    : behind
                      ? `Comfortably behind pace — ${inr(Math.round(safeDaily))} a day still available.`
                      : `On pace. ${inr(Math.round(safeDaily))} a day for the last ${left} days.`}
                </p>
              </div>
            </Card>
          </Rise>

          {(over.length > 0 || tight.length > 0) && (
            <Rise style={{ paddingTop: 22 }}>
              <div className="bud__flags">
                {over.map((r) => (
                  <span key={r.id} className="bud__flag bud__flag--over">
                    {r.meta.label.split(' &')[0]} over by {compactINR(-r.remaining)}
                  </span>
                ))}
                {tight.map((r) => (
                  <span key={r.id} className="bud__flag bud__flag--tight">
                    {r.meta.label.split(' &')[0]} nearly spent
                  </span>
                ))}
              </div>
            </Rise>
          )}

          {/* ---- Envelopes ---- */}
          <Rise style={{ paddingTop: 26, paddingBottom: 6 }}>
            <Eyebrow>Envelopes</Eyebrow>
          </Rise>

          {rows.map((r) => (
            <Rise key={r.id}>
              <motion.button
                className="bud__row"
                onClick={() => openSheet({ kind: 'editBudget', budgetId: r.id })}
                whileTap={{ scale: 0.99 }}
                whileHover={{ y: -1 }}
                transition={snap}
              >
                <div className="bud__rowtop">
                  <CategoryBadge icon={r.meta.icon} ink={r.meta.ink} size={40} />
                  <div className="bud__rowname">
                    <span className="bud__cat">{r.meta.label}</span>
                    <span className="bud__sub">
                      {r.state === 'over'
                        ? `${inr(-r.remaining)} over`
                        : `${inr(r.remaining)} left`}
                      {r.rollover !== 0 && (
                        <span className="bud__roll">
                          {r.rollover > 0 ? '+' : '−'}{compactINR(Math.abs(r.rollover))} rolled
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="bud__amounts">
                    <span className="figure bud__spent">{inr(r.spent)}</span>
                    <span className="bud__limit num">of {inr(r.available)}</span>
                  </span>
                </div>
                <Meter
                  value={Math.min(1, r.ratio)}
                  ink={r.state === 'over' ? 'vermilion' : r.state === 'tight' ? 'vermilion' : 'olive'}
                  height={7}
                />
                {/* where the month itself has got to — spend should trail it */}
                <span className="bud__pacemark" style={{ left: `${elapsed * 100}%` }} aria-hidden />
              </motion.button>
            </Rise>
          ))}

          <Rise style={{ paddingTop: 20 }}>
            <p className="bud__note">
              The marker on each bar is today’s position in the month. A fill
              behind it is spending slower than the calendar.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
