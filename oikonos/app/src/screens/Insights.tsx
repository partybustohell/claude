import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp, useCategorySpend } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, Rule,
  SectionHead, CategoryBadge, Delta,
} from '../components/ui';
import { MonthColumns, ShareBar, Ring, tintScale } from '../components/charts';
import { inr, compactINR, monthLabel } from '../lib/format';
import { snap } from '../lib/motion';
import './Insights.css';
import { PlateFoot } from '../illustrations/place';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Insights() {
  const { history, txns, now } = useApp();
  const { back } = useNav();
  const spend = useCategorySpend();

  const cols = useMemo(() => history.map((h) => ({
    label: MONTH_ABBR[new Date(h.month).getMonth()],
    income: h.income,
    expenses: h.expenses,
  })), [history]);

  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  const saved = cur.income - cur.expenses;
  const rate = saved / cur.income;
  const prevRate = (prev.income - prev.expenses) / prev.income;

  /** Where the money actually went — merchants, not categories. */
  const merchants = useMemo(() => {
    const month = now.slice(0, 7);
    const m = new Map<string, number>();
    for (const t of txns) {
      if (t.amount >= 0 || t.at.slice(0, 7) !== month) continue;
      m.set(t.merchant, (m.get(t.merchant) ?? 0) + Math.abs(t.amount));
    }
    return [...m.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [txns, now]);

  const topShare = spend.slice(0, 6);

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Insights</Eyebrow>
            <h1 className="insights__title display">{monthLabel(cur.month)}</h1>
          </Rise>

          {/* ---- Savings rate ---- */}
          <Rise style={{ paddingTop: 22 }}>
            <Card tone="ink" pad={22}>
              <div className="insights__rate">
                <Ring value={rate} ink="olive" size={84} stroke={9} />
                <div className="insights__ratebody">
                  <Eyebrow tone="var(--on-ink-muted)">Savings rate</Eyebrow>
                  <p className="insights__ratenum figure">{Math.round(rate * 100)}%</p>
                  <p className="insights__ratemeta">
                    {inr(saved)} kept of {compactINR(cur.income)} earned
                  </p>
                </div>
              </div>
              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 14px' }} />
              <p className="insights__ratenote">
                {rate > prevRate ? 'Up' : 'Down'}{' '}
                {Math.abs(Math.round((rate - prevRate) * 100))} points on April.{' '}
                {rate >= 0.5
                  ? 'You are keeping more than half of what you earn.'
                  : 'Trim one recurring line to cross fifty percent.'}
              </p>
            </Card>
          </Rise>

          {/* ---- Six-month flow ---- */}
          <Rise style={{ paddingTop: 30 }}>
            <SectionHead title="In and out" />
            <div className="insights__legend">
              <Legend ink="var(--olive)" label="Income" />
              <Legend ink="var(--vermilion)" label="Expenses" />
            </div>
            <MonthColumns data={cols} height={140} />
          </Rise>

          {/* ---- Category mix ---- */}
          <Rise style={{ paddingTop: 30 }}>
            <SectionHead title="Where it went" />
            <div style={{ padding: '14px 0 18px' }}>
              <ShareBar
                parts={topShare.map((s, i) => ({
                  id: s.id,
                  share: s.share,
                  ink: s.meta.ink,
                  color: tintScale(s.meta.ink, i, topShare.length),
                }))}
                height={12}
              />
            </div>
            {topShare.map((s, i) => (
              <div key={s.id}>
                <div className="insights__cat">
                  <CategoryBadge icon={s.meta.icon} ink={s.meta.ink} size={38} />
                  <span className="insights__catname">{s.meta.label}</span>
                  <span className="insights__catshare num">
                    {Math.round(s.share * 100)}%
                  </span>
                  <span className="insights__catamt figure">{inr(s.amount)}</span>
                </div>
                {i < topShare.length - 1 && <Rule inset={52} />}
              </div>
            ))}
          </Rise>

          {/* ---- Top merchants ---- */}
          <Rise style={{ paddingTop: 30 }}>
            <SectionHead title="Most visited" />
            <div className="insights__merchants">
              {merchants.map((m, i) => (
                <motion.div
                  key={m.name}
                  className="insights__merchant"
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <span className="insights__rank num">{i + 1}</span>
                  <span className="insights__mname">{m.name}</span>
                  <span className="insights__mamt figure">{inr(m.amount)}</span>
                </motion.div>
              ))}
            </div>
          </Rise>

          {/* ---- Net worth delta ---- */}
          <Rise style={{ paddingTop: 30, paddingBottom: 10 }}>
            <Card tone="warm" pad={20}>
              <Eyebrow>Net worth</Eyebrow>
              <div className="insights__nw">
                <span className="figure insights__nwnum">{inr(cur.netWorth)}</span>
                <Delta
                  value={((cur.netWorth - prev.netWorth) / prev.netWorth) * 100}
                  suffix="on April"
                />
              </div>
            </Card>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="lighthouse" height={206} />
        </Stack>
      </div>
    </Screen>
  );
}

function Legend({ ink, label }: { ink: string; label: string }) {
  return (
    <span className="insights__legenditem">
      <span className="insights__swatch" style={{ background: ink }} />
      {label}
    </span>
  );
}
