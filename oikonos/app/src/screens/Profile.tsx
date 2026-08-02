import { useApp, useTotals, useMerchants } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Group, Row, Stack, Rise, Card, Eyebrow, Amount,
} from '../components/ui';
import { Sparkline } from '../components/charts';
import { IcBank, IcSpark, IcFlag, IcCoin, IcRepeat } from '../components/icons';
import { inr, compactINR, longDate } from '../lib/format';
import './Profile.css';

export function Profile() {
  const { back, push } = useNav();
  const { user, accounts, goals, txns, history } = useApp();
  const totals = useTotals();
  const merchants = useMerchants();

  const since = '2021-08-14';
  const saved = goals.reduce((n, g) => n + g.saved, 0);
  const top = merchants[0];

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y prof__scroll">
        <Stack gap={0}>
          <Rise>
            <div className="prof__head">
              <span className="prof__avatar tex-ink" aria-hidden>{user.name.slice(0, 1)}</span>
              <h1 className="prof__name display">{user.name}</h1>
              <p className="prof__handle">{user.handle}</p>
              <p className="prof__since">Keeping books here since {longDate(since)}</p>
            </div>
          </Rise>

          <Rise>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">Net worth</Eyebrow>
              <Amount value={totals.netWorth} className="prof__nw" />
              <div className="prof__spark">
                <Sparkline values={history.map((h) => h.netWorth)} ink="olive"
                  height={58} dot={false} />
              </div>
              <p className="prof__nwfoot">
                Up {compactINR(history[history.length - 1].netWorth - history[0].netWorth)} across six months
              </p>
            </Card>
          </Rise>

          <Rise style={{ paddingTop: 24 }}>
            <div className="prof__stats">
              <Stat label="Accounts" value={String(accounts.length)} />
              <Stat label="Transactions" value={String(txns.length)} />
              <Stat label="Saved in goals" value={compactINR(saved)} />
            </div>
          </Rise>

          <Rise style={{ paddingTop: 26 }}>
            <Group title="Your year so far">
              <Row icon={<IcCoin size={17} />} ink="olive" title="Income"
                value={<span className="figure">{inr(totals.income)}</span>} />
              <Row icon={<IcSpark size={17} />} ink="vermilion" title="Expenses"
                value={<span className="figure">{inr(totals.expenses)}</span>} />
              <Row icon={<IcFlag size={17} />} ink="olive" title="Put aside"
                value={<span className="figure">{inr(totals.savings)}</span>} />
              {top && (
                <Row icon={<IcRepeat size={17} />} title="Most visited"
                  sub={`${top.count} times`} value={top.name} />
              )}
            </Group>
          </Rise>

          <Rise>
            <Group title="Manage">
              <Row icon={<IcBank size={17} />} title="Accounts" chevron
                onClick={() => push({ name: 'accounts' })} />
              <Row icon={<IcSpark size={17} />} title="Insights" chevron
                onClick={() => push({ name: 'insights' })} />
              <Row title="Settings" chevron onClick={() => push({ name: 'settings' })} />
            </Group>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="prof__stat">
      <span className="prof__statnum figure">{value}</span>
      <span className="prof__statlabel">{label}</span>
    </div>
  );
}
