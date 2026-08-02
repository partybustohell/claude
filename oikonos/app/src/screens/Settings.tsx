import { useApp, useSettings, useNotices } from '../data/store';
import { useAuth } from '../data/auth';
import { useNav } from '../nav';
import { Screen, TopBar, PageHead, Group, Row, Stack, Rise } from '../components/ui';
import {
  IcUser, IcBank, IcCard, IcSpark, IcRepeat, IcBolt, IcCoin, IcBook,
  IcLeaf, IcSwap, IcExit,
} from '../components/icons';
import './Settings.css';

const CURRENCY_LABEL = { INR: 'Indian rupee', EUR: 'Euro', USD: 'US dollar' } as const;
const TEXTURE_LABEL = { full: 'Full texture', subtle: 'Subtle', off: 'Plain' } as const;

export function Settings() {
  const { back, push, reset } = useNav();
  const { user, accounts, connected } = useApp();
  const { user: account, signOut } = useAuth();
  const s = useSettings();
  const { unread } = useNotices();

  const leave = () => {
    signOut();
    reset({ name: 'welcome' });
  };

  const onCount = Object.values(s.notifications).filter(Boolean).length;

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y set__scroll">
        <Stack gap={0}>
          <Rise><PageHead eyebrow="Account" title="Settings" /></Rise>

          <Rise>
            <button className="set__me" onClick={() => push({ name: 'profile' })}>
              <span className="set__avatar tex-ink" aria-hidden>
                {user.name.slice(0, 1)}
              </span>
              <span className="set__mebody">
                <span className="set__mename">{user.name}</span>
                <span className="set__mesub">
                  {account ? account.email : user.handle} · View profile
                </span>
              </span>
            </button>
          </Rise>

          <Rise>
            <Group title="Money">
              <Row icon={<IcBank size={17} />} ink="ink" title="Accounts"
                sub={`${accounts.length} connected`} chevron
                onClick={() => push({ name: 'accounts' })} />
              <Row icon={<IcBolt size={17} />} ink="vermilion" title="Bills"
                sub="Due dates and autopay" chevron
                onClick={() => push({ name: 'bills' })} />
              <Row icon={<IcRepeat size={17} />} ink="olive" title="Subscriptions"
                sub="Recurring charges" chevron
                onClick={() => push({ name: 'subscriptions' })} />
              <Row icon={<IcSwap size={17} />} title="Categories"
                sub="How spending is sorted" chevron
                onClick={() => push({ name: 'categories' })} />
            </Group>
          </Rise>

          <Rise>
            <Group title="App">
              <Row icon={<IcSpark size={17} />} title="Appearance"
                value={TEXTURE_LABEL[s.texture]} chevron
                onClick={() => push({ name: 'appearance' })} />
              <Row icon={<IcBolt size={17} />} title="Notifications"
                value={`${onCount} of 5 on`} chevron
                onClick={() => push({ name: 'notifySettings' })} />
              <Row icon={<IcCoin size={17} />} title="Currency"
                value={CURRENCY_LABEL[s.currency]} chevron
                onClick={() => push({ name: 'currency' })} />
            </Group>
          </Rise>

          <Rise>
            <Group title="Security">
              <Row icon={<IcLeaf size={17} />} ink="olive" title="Passcode & Face ID"
                sub={s.biometrics ? 'Face ID on' : 'Passcode only'} chevron
                onClick={() => push({ name: 'security' })} />
              <Row icon={<IcCard size={17} />} title="Connected apps"
                value={String(connected.length)} chevron
                onClick={() => push({ name: 'connected' })} />
            </Group>
          </Rise>

          <Rise>
            <Group title="Support">
              <Row icon={<IcBook size={17} />} title="Help & support" chevron
                onClick={() => push({ name: 'help' })} />
              <Row icon={<IcUser size={17} />} title="What’s new"
                value={unread > 0 ? `${unread} new` : undefined} chevron
                onClick={() => push({ name: 'notifications' })} />
              <Row title="About Oikonos" value="1.4.0" chevron
                onClick={() => push({ name: 'about' })} />
            </Group>
          </Rise>

          <Rise>
            <Group caption="Signing out closes the session. Nothing is deleted.">
              <Row
                icon={<IcExit size={17} />}
                title="Sign out"
                sub={account?.email}
                danger
                onClick={leave}
              />
            </Group>
          </Rise>

          <Rise>
            <p className="set__foot">
              Oikonos keeps your ledger on this device. Nothing leaves it but
              the connections you make yourself.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
