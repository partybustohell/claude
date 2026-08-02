import { useApp, useActions } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Stack, Rise, Empty, Button,
} from '../components/ui';
import { IcCard } from '../components/icons';
import { longDate } from '../lib/format';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

export function Connected() {
  const { back } = useNav();
  const { connected } = useApp();
  const { disconnectApp } = useActions();

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y setpage__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Security"
              title="Connected apps"
              sub="Everything below can read part of your ledger. Nothing can
                   write to it or move money."
            />
          </Rise>

          {connected.length === 0 ? (
            <Rise>
              <Empty
                title="Nothing connected"
                body="No other app can see your ledger."
                icon={<IcCard size={26} />}
              />
            </Rise>
          ) : (
            <Rise>
              <Group>
                {connected.map((c) => (
                  <Row
                    key={c.id}
                    icon={<IcCard size={17} />}
                    ink={c.ink}
                    title={c.name}
                    sub={`${c.scope} · since ${longDate(c.connectedAt)}`}
                    trailing={
                      <Button variant="ghost" ink="vermilion"
                        onClick={() => disconnectApp(c.id)}>
                        Revoke
                      </Button>
                    }
                  />
                ))}
              </Group>
            </Rise>
          )}

          <Rise>
            <p className="setpage__note">
              Revoking is immediate. An app that has already downloaded a
              statement keeps its copy — revoking stops the next one.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={196} />
        </Stack>
      </div>
    </Screen>
  );
}
