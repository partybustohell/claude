import { useSettings, useActions } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Choice, Row, Stack, Rise,
} from '../components/ui';
import { inr, groupINR } from '../lib/format';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

const CURRENCIES = [
  { id: 'INR' as const, label: 'Indian rupee', sub: '₹ · lakh and crore grouping', sample: () => inr(874350) },
  { id: 'EUR' as const, label: 'Euro', sub: '€ · thousands grouping', sample: () => '€9,412' },
  { id: 'USD' as const, label: 'US dollar', sub: '$ · thousands grouping', sample: () => '$10,480' },
];

const WEEKS = [
  { id: 'monday' as const, label: 'Monday', sub: 'Weeks run Monday to Sunday' },
  { id: 'sunday' as const, label: 'Sunday', sub: 'Weeks run Sunday to Saturday' },
];

export function Currency() {
  const { back } = useNav();
  const s = useSettings();
  const { setSetting } = useActions();

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y setpage__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="App"
              title="Currency"
              sub="Changing this restates every figure. Balances are converted at
                   the rate on the day each transaction cleared, not today's."
            />
          </Rise>

          <Rise>
            <Group caption={`Grouped as ₹${groupINR(874350)} — three digits, then twos.`}>
              {CURRENCIES.map((c) => (
                <Choice
                  key={c.id}
                  selected={s.currency === c.id}
                  label={c.label}
                  sub={c.sub}
                  onSelect={() => setSetting({ currency: c.id })}
                />
              ))}
            </Group>
          </Rise>

          <Rise>
            <Group title="Week starts">
              {WEEKS.map((w) => (
                <Choice
                  key={w.id}
                  selected={s.weekStart === w.id}
                  label={w.label}
                  sub={w.sub}
                  onSelect={() => setSetting({ weekStart: w.id })}
                />
              ))}
            </Group>
          </Rise>

          <Rise>
            <Group title="Sample">
              <Row title="Net worth" value={<span className="figure">{CURRENCIES.find((c) => c.id === s.currency)!.sample()}</span>} />
              <Row title="A cup of coffee" value={<span className="figure">{s.currency === 'INR' ? inr(480) : s.currency === 'EUR' ? '€5' : '$6'}</span>} />
            </Group>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={196} />
        </Stack>
      </div>
    </Screen>
  );
}
