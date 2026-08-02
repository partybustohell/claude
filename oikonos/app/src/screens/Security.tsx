import { useSettings, useActions, useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Toggle, Stack, Rise, Button,
} from '../components/ui';
import { IcLeaf, IcCard, IcRepeat, IcUser } from '../components/icons';
import { longDate } from '../lib/format';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

export function Security() {
  const { back, push } = useNav();
  const s = useSettings();
  const { setSetting, signOutSession, signOutOthers } = useActions();
  const { connected, sessions } = useApp();
  const others = sessions.filter((d) => !d.current);

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
              {/* A statement of state, not an offer. It carried a chevron
                  and no handler, which promised a screen that does not
                  exist — and because a row without onClick renders as a
                  div, it was an arrow on something that was never
                  tappable. */}
              <Row icon={<IcRepeat size={17} />} title="Passcode"
                sub="Six digits" value="Set" />
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
              {sessions.map((d) => (
                <Row
                  key={d.id}
                  icon={<IcUser size={17} />}
                  ink={d.current ? 'olive' : undefined}
                  title={d.device}
                  sub={`${d.place} · ${d.current ? 'This device' : longDate(d.at)}`}
                  value={d.current ? undefined : 'Sign out'}
                  onClick={d.current ? undefined : () => signOutSession(d.id)}
                />
              ))}
            </Group>
          </Rise>

          <Rise style={{ paddingTop: 4 }}>
            {/* It said this and did nothing. The caption above promises
                that signing out revokes access immediately, and a button
                under that promise has to keep it. */}
            <Button variant="outline" ink="vermilion" full
              disabled={others.length === 0}
              onClick={signOutOthers}>
              {others.length
                ? `Sign out everywhere else (${others.length})`
                : 'No other devices signed in'}
            </Button>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={190} />
        </Stack>
      </div>
    </Screen>
  );
}
