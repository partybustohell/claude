import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  Screen, Card, IconButton, Meter, Amount, Delta, Eyebrow, SectionHead,
  Stack, Rise, CategoryBadge, INK_VAR, type Ink,
} from '../components/ui';
import { IcUser, IcRise, IcFall, IcCoin } from '../components/icons';
import { HomeHorizon } from '../illustrations/HomeHorizon';
import { useNav } from '../nav';
import { useApp, useNow, useTotals, useTxnsSorted, CATEGORIES } from '../data/store';
import { greeting, longDate } from '../lib/format';
import { snap } from '../lib/motion';
import './Home.css';

/* ----------------------------------------------------------------
   A medallion that takes a drawn glyph rather than a category key.
   CategoryBadge only speaks the CategoryId vocabulary; the overview
   rows are aggregates, not categories, so they need their own icons.
   Same class, same texture, same optics.
   ---------------------------------------------------------------- */
function OvBadge({ icon, ink, size = 44 }: { icon: ReactNode; ink: Ink; size?: number }) {
  return (
    <span
      className="badge tex-ink"
      aria-hidden
      style={{
        width: size, height: size,
        background: INK_VAR[ink],
        color: 'var(--on-ink)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)',
      }}
    >
      {icon}
    </span>
  );
}

export function Home() {
  const { push, goTab } = useNav();
  const { user } = useApp();
  const now = useNow();
  const totals = useTotals();
  const recent = useTxnsSorted().slice(0, 4);

  /* All three meters are scaled against one common maximum, with headroom,
     so the largest bar reads as the largest quantity rather than as a
     track that has run out. Nothing is ever pinned at 100%. */
  const base = Math.max(totals.income, totals.expenses, totals.savings, 1) * 1.55;
  const rows = [
    { key: 'income',   label: 'Income',   value: totals.income,   ratio: totals.income / base,
      ink: 'olive' as Ink, glyph: <IcRise size={20} /> },
    { key: 'expenses', label: 'Expenses', value: totals.expenses, ratio: totals.expenses / base,
      ink: 'vermilion' as Ink, glyph: <IcFall size={20} /> },
    { key: 'savings',  label: 'Savings',  value: totals.savings,  ratio: totals.savings / base,
      ink: 'olive' as Ink, glyph: <IcCoin size={20} /> },
  ];

  return (
    <Screen>
      {/* The sheet. One substrate under everything — illustration, card
          and type all sit on the same grain instead of floating on a
          mathematically clean surface. */}
      <span className="home__sheet" aria-hidden />

      <Stack gap={0} delay={0.04} className="pane scroll-y home__scroll">

        {/* ---------- hero stage ---------- */}
        <div className="home__stage">
          <HomeHorizon className="home__art" />

          <div className="home__head">
            <Rise className="home__greet">
              <div>
                <span className="home__hello">{greeting(now)},</span>
                <h1 className="home__name display">{user.name}.</h1>
              </div>
              <span className="home__avatar">
                <IconButton label="Accounts and profile" onClick={() => push({ name: 'accounts' })}>
                  <IcUser size={20} />
                </IconButton>
              </span>
            </Rise>

            <Rise className="home__worth">
              <Eyebrow tone="var(--ink)" style={{ opacity: 0.86 }}>Net worth</Eyebrow>
              {/* The rupee is set as its own glyph so it can carry an
                  optical sidebearing against the first digit — at 46px
                  the ₹ crossbar otherwise fuses with the bowl of the 8. */}
              <span className="home__fig">
                <span className="home__rupee figure">₹</span>
                <Amount
                  value={totals.netWorth}
                  prefix=""
                  className="home__figure"
                  duration={1650}
                />
              </span>
              <span className="home__delta">
                <Delta value={totals.changePct} suffix="vs last month" />
              </span>
            </Rise>
          </div>
        </div>

        {/* ---------- overview ---------- */}
        <Rise className="home__sec">
          <SectionHead title="Overview" tone="var(--ink)" />
          <div className="home__cardwrap">
            <Card
              tone="ink" pad={16} radius="var(--r-lg)" elevation={1}
              onClick={() => push({ name: 'insights' })}
            >
              {rows.map((r, i) => (
                <div className="ov__row" key={r.key}>
                  <OvBadge icon={r.glyph} ink={r.ink} />
                  <div className="ov__body">
                    <div className="ov__line">
                      <span className="ov__label">{r.label}</span>
                      <Amount value={r.value} className="ov__amount" duration={1250} />
                    </div>
                    <div className="ov__meter">
                      <span className="ov__track" aria-hidden />
                      <Meter
                        value={r.ratio}
                        ink={r.ink}
                        track="transparent"
                        height={8}
                        delay={0.22 + i * 0.13}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </Rise>

        {/* ---------- recent activity ---------- */}
        <Rise className="home__sec">
          <SectionHead
            title="Recent activity"
            tone="var(--ink)"
            action="View all"
            onAction={() => goTab('activity')}
          />
          <ul className="home__list">
            {recent.map((t) => {
              const cat = CATEGORIES[t.category];
              const out = t.amount < 0;
              return (
                <li key={t.id}>
                  <motion.button
                    className="txnrow"
                    onClick={() => push({ name: 'txn', id: t.id })}
                    whileTap={{ scale: 0.983, x: 2 }}
                    transition={snap}
                  >
                    <CategoryBadge icon={cat.icon} ink={cat.ink} size={44} />
                    <span className="txnrow__body">
                      <span className="txnrow__merchant">{t.merchant}</span>
                      <span className="txnrow__date">{longDate(t.at)}</span>
                    </span>
                    <Amount
                      value={t.amount}
                      sign
                      duration={900}
                      className="txnrow__amount"
                      style={{ color: out ? 'var(--vermilion)' : 'var(--olive)' }}
                    />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </Rise>

      </Stack>
    </Screen>
  );
}
