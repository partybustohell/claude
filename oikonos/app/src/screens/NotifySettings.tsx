import { useSettings, useActions } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Toggle, Stack, Rise,
} from '../components/ui';
import { IcBolt, IcCoin, IcFlag, IcSpark, IcLeaf } from '../components/icons';
import type { Settings } from '../data/types';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

type Key = keyof Settings['notifications'];

const ROWS: { key: Key; title: string; sub: string; icon: React.ReactNode; ink: 'ink' | 'olive' | 'vermilion' }[] = [
  { key: 'budgets', title: 'Budgets', ink: 'vermilion', icon: <IcCoin size={17} />,
    sub: 'When an envelope passes 85%, and when it runs out' },
  { key: 'bills', title: 'Bills', ink: 'vermilion', icon: <IcBolt size={17} />,
    sub: 'Three days before anything without autopay' },
  { key: 'goals', title: 'Goals', ink: 'olive', icon: <IcFlag size={17} />,
    sub: 'Milestones, and when a goal falls behind its pace' },
  { key: 'insights', title: 'Insights', ink: 'ink', icon: <IcSpark size={17} />,
    sub: 'A price rise on a subscription, an unusual charge' },
  { key: 'security', title: 'Security', ink: 'olive', icon: <IcLeaf size={17} />,
    sub: 'New sign-ins and changes to your passcode' },
];

export function NotifySettings() {
  const { back } = useNav();
  const s = useSettings();
  const { setNotify } = useActions();
  const on = Object.values(s.notifications).filter(Boolean).length;

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y setpage__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="App"
              title="Notifications"
              sub={`${on} of ${ROWS.length} on. Oikonos never notifies you about
                    something you cannot act on.`}
            />
          </Rise>

          <Rise>
            <Group>
              {ROWS.map((r) => (
                <Row
                  key={r.key}
                  icon={r.icon}
                  ink={r.ink}
                  title={r.title}
                  sub={r.sub}
                  trailing={
                    <Toggle
                      label={r.title}
                      on={s.notifications[r.key]}
                      onChange={(v) => setNotify(r.key, v)}
                    />
                  }
                />
              ))}
            </Group>
          </Rise>

          <Rise>
            <p className="setpage__note">
              Security alerts are worth keeping on even if you turn everything
              else off — they are the only ones that tell you about something
              you did not do yourself.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={190} />
        </Stack>
      </div>
    </Screen>
  );
}
