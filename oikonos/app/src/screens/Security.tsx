import { useSettings, useActions, useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Toggle, Stack, Rise, Button,
} from '../components/ui';
import { IcLeaf, IcCard, IcRepeat, IcUser } from '../components/icons';
import { longDate } from '../lib/format';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

/** Sessions are device state, not ledger state, so they live here. */
const SESSIONS = [
  { id: 'd1', device: 'iPhone 15 Pro', place: 'New Delhi', at: '2024-05-18', current: true },
  { id: 'd2', device: 'iPad Air', place: 'New Delhi', at: '2024-05-14', current: false },
  { id: 'd3', device: 'MacBook Pro', place: 'Goa', at: '2024-04-02', current: false },
];

export function Security() {
  const { back, push } = useNav();
  const s = useSettings();
  const { setSetting } = useActions();
  const { connected } = useApp();

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y setpage__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Security"
              title="Passcode & Face ID"
              sub="Oikonos locks whenever it leaves the foreground."
            />
          </Rise>

          <Rise>
            <Group>
              <Row icon={<IcLeaf size={17} />} ink="olive" title="Face ID"
                sub="Unlock without the passcode"
                trailing={
                  <Toggle label="Face ID" on={s.biometrics}
                    onChange={(v) => setSetting({ biometrics: v })} />
                } />
              <Row icon={<IcRepeat size={17} />} title="Change passcode"
                sub="Six digits" chevron />
              <Row icon={<IcCard size={17} />} title="Connected apps"
                value={String(connected.length)} chevron
                onClick={() => push({ name: 'connected' })} />
            </Group>
          </Rise>

          <Rise>
            <Group
              title="Where you are signed in"
              caption="Signing out a device revokes its access immediately. It
                       does not delete anything held on that device."
            >
              {SESSIONS.map((d) => (
                <Row
                  key={d.id}
                  icon={<IcUser size={17} />}
                  ink={d.current ? 'olive' : undefined}
                  title={d.device}
                  sub={`${d.place} · ${d.current ? 'This device' : longDate(d.at)}`}
                  value={d.current ? undefined : 'Sign out'}
                />
              ))}
            </Group>
          </Rise>

          <Rise style={{ paddingTop: 4 }}>
            <Button variant="outline" ink="vermilion" full>
              Sign out everywhere else
            </Button>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={190} />
        </Stack>
      </div>
    </Screen>
  );
}
