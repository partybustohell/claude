import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Stack, Rise, Button, Eyebrow,
} from '../components/ui';
import { IcBank, IcCard, IcWallet, IcRise, Check, IcLeaf } from '../components/icons';
import { snap, gentle } from '../lib/motion';
import './AddAccount.css';

const KINDS = [
  { id: 'bank', label: 'Bank account', sub: 'Savings or current', icon: <IcBank size={19} />, ink: 'ink' as const },
  { id: 'card', label: 'Credit card', sub: 'Statement and limit', icon: <IcCard size={19} />, ink: 'vermilion' as const },
  { id: 'wallet', label: 'Wallet or UPI', sub: 'Small, frequent payments', icon: <IcWallet size={19} />, ink: 'olive' as const },
  { id: 'invest', label: 'Investments', sub: 'Broker or fund house', icon: <IcRise size={19} />, ink: 'olive' as const },
];

const BANKS = [
  'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank',
  'Kotak Mahindra', 'Yes Bank', 'IDFC First', 'Federal Bank',
];

export function AddAccount() {
  const { back } = useNav();
  const [kind, setKind] = useState<string | null>(null);
  const [bank, setBank] = useState<string | null>(null);

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y addacct__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Accounts"
              title="Connect an account"
              sub="Oikonos reads your statements through a consented feed. It never
                   asks for a banking password and cannot move money."
            />
          </Rise>

          <Rise>
            <Group title="What kind">
              {KINDS.map((k) => (
                <Row
                  key={k.id}
                  icon={k.icon}
                  ink={k.ink}
                  title={k.label}
                  sub={k.sub}
                  onClick={() => { setKind(k.id); setBank(null); }}
                  trailing={
                    kind === k.id ? (
                      <motion.span className="addacct__tick"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={snap}>
                        <Check size={15} />
                      </motion.span>
                    ) : undefined
                  }
                />
              ))}
            </Group>
          </Rise>

          {kind && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={gentle}
            >
              <Eyebrow style={{ display: 'block', marginBottom: 12 }}>
                Choose your institution
              </Eyebrow>
              <div className="addacct__grid">
                {BANKS.map((b) => (
                  <motion.button
                    key={b}
                    className={`addacct__bank ${bank === b ? 'addacct__bank--on' : ''}`}
                    onClick={() => setBank(b)}
                    whileTap={{ scale: 0.96 }}
                    transition={snap}
                    aria-pressed={bank === b}
                  >
                    <span className="addacct__mark" aria-hidden>
                      {b.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <span className="addacct__bankname">{b}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <Rise style={{ paddingTop: 26 }}>
            <div className="addacct__safety">
              <span className="addacct__safeicon"><IcLeaf size={17} /></span>
              <p>
                Read-only, and revocable from Settings at any moment. Your
                credentials go to your bank, never to Oikonos.
              </p>
            </div>
          </Rise>

          <Rise style={{ paddingTop: 18 }}>
            <Button ink="ink" full disabled={!kind || !bank}>
              {!kind ? 'Pick a kind first'
                : !bank ? 'Pick an institution'
                : `Connect ${bank}`}
            </Button>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
