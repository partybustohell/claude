import { motion } from 'framer-motion';
import { useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Amount, Stack, Rise, Rule, SectionHead,
} from '../components/ui';
import { Sparkline } from '../components/charts';
import { IcBank, IcCard, IcWallet, IcRise, ChevronRight } from '../components/icons';
import type { Account, AccountKind } from '../data/types';
import { inr, compactINR } from '../lib/format';
import { snap } from '../lib/motion';
import './Accounts.css';
import { PlateFoot } from '../illustrations/place';

const KIND_ICON: Record<AccountKind, typeof IcBank> = {
  bank: IcBank, card: IcCard, wallet: IcWallet, invest: IcRise,
};
const KIND_LABEL: Record<AccountKind, string> = {
  bank: 'Savings', card: 'Credit card', wallet: 'Wallet', invest: 'Investments',
};

export function Accounts() {
  const { accounts, history } = useApp();
  const { back } = useNav();

  const assets = accounts.filter((a) => a.balance >= 0);
  const debts = accounts.filter((a) => a.balance < 0);
  const total = accounts.reduce((n, a) => n + a.balance, 0);

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Total balance</Eyebrow>
            <Amount value={total} className="accounts__total" />
            <p className="accounts__sub">
              Across {accounts.length} accounts ·{' '}
              {compactINR(history[history.length - 1].netWorth)} net worth
            </p>
          </Rise>

          <Rise className="accounts__spark">
            <Sparkline values={history.map((h) => h.netWorth)} ink="ink" height={72} />
            <div className="accounts__sparkfoot">
              <span className="num">{compactINR(history[0].netWorth)}</span>
              <span>Six months</span>
              <span className="num">{compactINR(history[history.length - 1].netWorth)}</span>
            </div>
          </Rise>

          <Rise style={{ paddingTop: 10 }}>
            <SectionHead title="Assets" />
          </Rise>
          {assets.map((a) => <Rise key={a.id}><AccountRow account={a} /></Rise>)}

          {debts.length > 0 && (
            <>
              <Rise style={{ paddingTop: 24 }}>
                <SectionHead title="Owed" />
              </Rise>
              {debts.map((a) => <Rise key={a.id}><AccountRow account={a} /></Rise>)}
            </>
          )}

          <Rise style={{ paddingTop: 24 }}>
            <p className="accounts__note">
              Balances update when a bank posts. Last synced 9:41 AM today.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="harbour" height={214} />
        </Stack>
      </div>
    </Screen>
  );
}

function AccountRow({ account }: { account: Account }) {
  const Icon = KIND_ICON[account.kind];
  const negative = account.balance < 0;

  return (
    <>
      <motion.button
        className="acct"
        whileTap={{ scale: 0.985 }}
        whileHover={{ x: 2 }}
        transition={snap}
      >
        <span
          className="acct__chip tex-ink"
          style={{ background: `var(--${account.ink})` }}
        >
          <Icon size={19} />
        </span>

        <span className="acct__body">
          <span className="acct__name">{account.name}</span>
          <span className="acct__meta">
            {KIND_LABEL[account.kind]} <span className="acct__dots" aria-hidden>••••</span><span className="num"> {account.tail}</span>
          </span>
        </span>

        <span className="acct__right">
          <span
            className="acct__amount figure"
            style={{ color: negative ? 'var(--vermilion)' : 'var(--ink)' }}
          >
            {negative ? '−' : ''}{inr(Math.abs(account.balance))}
          </span>
          <ChevronRight size={16} className="acct__chev" />
        </span>
      </motion.button>
      <Rule inset={58} />
    </>
  );
}
