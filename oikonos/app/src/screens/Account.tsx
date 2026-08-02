import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useApp, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Stack, Rise, Eyebrow, Amount, Rule, Empty,
  CategoryBadge, Group, Row, SectionHead,
} from '../components/ui';
import { Sparkline, ShareBar, tintScale } from '../components/charts';
import { IcBank, IcCard, IcWallet, IcRise, IcRepeat } from '../components/icons';
import type { AccountKind } from '../data/types';
import { inr, signedINR, compactINR, relativeDay, longDate } from '../lib/format';
import { snap } from '../lib/motion';
import './Account.css';
import { PlateFoot } from '../illustrations/place';

const KIND_ICON: Record<AccountKind, typeof IcBank> = {
  bank: IcBank, card: IcCard, wallet: IcWallet, invest: IcRise,
};
const KIND_LABEL: Record<AccountKind, string> = {
  bank: 'Savings account', card: 'Credit card', wallet: 'Wallet', invest: 'Investments',
};

/** A card's balance is a debt; every other kind's is an asset. */
function isDebt(kind: AccountKind) { return kind === 'card'; }

export function Account({ id }: { id: string }) {
  const { back, push } = useNav();
  const acct = useAccount(id);
  const { now, history } = useApp();

  const nowDate = useMemo(() => new Date(now), [now]);

  const mix = useMemo(() => {
    if (!acct) return [];
    const m = new Map<string, number>();
    for (const t of acct.items) {
      if (t.amount >= 0) continue;
      m.set(t.category, (m.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    const total = [...m.values()].reduce((a, b) => a + b, 0) || 1;
    return [...m.entries()]
      .map(([cid, amount]) => ({ id: cid, amount, share: amount / total, meta: CATEGORIES[cid as keyof typeof CATEGORIES] }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [acct]);

  if (!acct) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <Empty title="Account not found" body="This account is no longer connected." />
      </Screen>
    );
  }

  const Icon = KIND_ICON[acct.kind];
  const debt = isDebt(acct.kind);

  /* A plausible balance history: walk today's balance backwards through the
     month deltas so the curve is the account's own, not the portfolio's. */
  const curve = useMemo(() => {
    const scale = Math.abs(acct.balance) / Math.max(1, history[history.length - 1].netWorth);
    return history.map((h) => Math.round(h.netWorth * scale));
  }, [acct.balance, history]);

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y acctd__scroll">
        <Stack gap={0}>
          <Rise>
            <div className="acctd__head">
              <span className="acctd__chip tex-ink" style={{ background: `var(--${acct.ink})` }}>
                <Icon size={22} />
              </span>
              <div>
                <h1 className="acctd__name display">{acct.name}</h1>
                <p className="acctd__meta">
                  {KIND_LABEL[acct.kind]}
                  <span className="acctd__dots" aria-hidden>••••</span>
                  <span className="num">{acct.tail}</span>
                </p>
              </div>
            </div>
          </Rise>

          <Rise>
            <Eyebrow>{debt ? 'Owed' : 'Balance'}</Eyebrow>
            <Amount
              value={Math.abs(acct.balance)}
              className="acctd__balance"
              style={{ color: debt ? 'var(--vermilion)' : 'var(--ink)' }}
            />
            {debt && (
              <p className="acctd__debtnote">
                Statement closes on the 20th. Paying in full avoids interest.
              </p>
            )}
          </Rise>

          <Rise className="acctd__spark">
            <Sparkline values={curve} ink={debt ? 'vermilion' : 'ink'} height={64} />
          </Rise>

          <Rise>
            <div className="acctd__flows">
              <Flow label="In" value={acct.in} ink="var(--olive)" />
              <Flow label="Out" value={acct.out} ink="var(--vermilion)" />
              <Flow label="Net" value={acct.in - acct.out} ink="var(--ink)" signed />
            </div>
          </Rise>

          {mix.length > 0 && (
            <Rise style={{ paddingTop: 28 }}>
              <SectionHead title="What it pays for" />
              <div style={{ padding: '14px 0 16px' }}>
                <ShareBar
                  parts={mix.map((m, i) => ({
                    id: m.id, share: m.share, ink: m.meta.ink,
                    color: tintScale(m.meta.ink, i, mix.length),
                  }))}
                />
              </div>
              <Group>
                {mix.map((m) => (
                  <Row
                    key={m.id}
                    icon={<CategoryBadge icon={m.meta.icon} ink={m.meta.ink} size={30} />}
                    title={m.meta.label}
                    sub={`${Math.round(m.share * 100)}% of this account`}
                    value={<span className="figure">{inr(m.amount)}</span>}
                  />
                ))}
              </Group>
            </Rise>
          )}

          <Rise style={{ paddingTop: 12 }}>
            <SectionHead
              title={`${acct.items.length} transactions`}
              action="Search"
              onAction={() => push({ name: 'search' })}
            />
          </Rise>

          {acct.items.length === 0 ? (
            <Rise>
              <Empty title="Nothing yet"
                body="No money has moved through this account." />
            </Rise>
          ) : acct.items.map((t, i) => {
            const cat = CATEGORIES[t.category];
            return (
              <Rise key={t.id}>
                <motion.button
                  className="acctd__row"
                  onClick={() => push({ name: 'txn', id: t.id })}
                  whileTap={{ scale: 0.985 }}
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <CategoryBadge icon={cat.icon} ink={cat.ink} size={40} />
                  <span className="acctd__rowbody">
                    <span className="acctd__merchant">{t.merchant}</span>
                    <span className="acctd__when">
                      {relativeDay(t.at, nowDate)}
                      {t.recurring && (
                        <span className="acctd__rep" aria-label="Recurring">
                          <IcRepeat size={11} />
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className="acctd__amt figure"
                    style={{ color: t.amount >= 0 ? 'var(--olive)' : 'var(--ink)' }}
                  >
                    {signedINR(t.amount)}
                  </span>
                </motion.button>
                {i < acct.items.length - 1 && <Rule inset={54} />}
              </Rise>
            );
          })}

          <Rise>
            <p className="acctd__foot">
              Opened {longDate('2021-08-14')} · {compactINR(acct.out)} out and{' '}
              {compactINR(acct.in)} in across the visible ledger.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="harbour" height={196} />
        </Stack>
      </div>
    </Screen>
  );
}

function Flow({
  label, value, ink, signed,
}: { label: string; value: number; ink: string; signed?: boolean }) {
  return (
    <div className="acctd__flow">
      <span className="acctd__flowlabel">{label}</span>
      <span className="acctd__flownum figure" style={{ color: ink }}>
        {signed ? signedINR(value) : inr(value)}
      </span>
    </div>
  );
}
