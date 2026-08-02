import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, useActions } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Button, IconButton, Rule,
} from '../components/ui';
import {
  IcBank, IcCard, IcWallet, IcRise, IcSwap, Check, ArrowRight,
} from '../components/icons';
import type { AccountKind } from '../data/types';
import { AmountDisplay, Keypad } from './sheets/Keypad';
import { Initials, QrMark, railName, payeeTxns, firstName } from './Payee';
import { inr, compactINR, shortDate } from '../lib/format';
import { snap, gentle, fade } from '../lib/motion';
import './Transfer.css';

const KIND_ICON: Record<AccountKind, (p: { size?: number }) => React.ReactElement> = {
  bank: IcBank, card: IcCard, wallet: IcWallet, invest: IcRise,
};

/** What each kind can actually do on a UPI screen. */
const KIND_NOTE: Record<AccountKind, string> = {
  bank: 'Instant',
  card: 'Credit line',
  wallet: 'Instant',
  invest: 'Settles T+1',
};

const QUICK = [500, 1000, 2500, 5000];

export function Transfer() {
  const { back, push } = useNav();
  const { accounts, payees, txns, now } = useApp();
  const { addTxn } = useActions();

  const [digits, setDigits] = useState('');
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [payeeId, setPayeeId] = useState(payees[0].id);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState<null | { amount: number; payeeId: string }>(null);

  const acct = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const payee = payees.find((p) => p.id === payeeId);
  const amount = Number(digits || 0);

  /* A card is a liability, not a purse — nothing can be sent out of it. */
  const isCard = acct.kind === 'card';
  const source = isCard ? 0 : Math.max(0, acct.balance);
  const over = !isCard && amount > source;
  const after = source - amount;

  /* What already leaves this account every month without being asked:
     rent, the SIP, the goal auto-save, the utilities on auto-debit. */
  const committed = useMemo(() => txns
    .filter((t) => t.accountId === acct.id && t.recurring && t.amount < 0)
    .reduce((n, t) => n + Math.abs(t.amount), 0), [txns, acct.id]);

  /* The last thing that moved to whoever is selected — a repeat is by far
     the most likely amount, so it earns a chip of its own. */
  const lastToPayee = useMemo(() => {
    if (!payee) return undefined;
    return payeeTxns(payee.name, txns)[0];
  }, [payee, txns]);

  let block: string | null = null;
  if (isCard) block = `${acct.name} is a credit line`;
  else if (!payee) block = 'Choose who to pay';
  else if (amount <= 0) block = 'Enter an amount';
  else if (over) block = `Short by ${inr(amount - source)}`;

  const helper = (() => {
    if (isCard) {
      return `${acct.name} carries ${inr(Math.abs(acct.balance))} owed. A credit line `
        + 'cannot be a source — pick an account that holds money.';
    }
    if (over) {
      return `${inr(amount)} is ${inr(amount - source)} more than ${acct.name} holds.`;
    }
    if (amount === 0) {
      return committed > 0
        ? `${inr(source)} in ${acct.name}, of which ${inr(committed)} is already spoken `
          + 'for by standing instructions each month.'
        : `${inr(source)} in ${acct.name}. Nothing standing is drawn from it.`;
    }
    if (committed > 0) {
      const cover = after / committed;
      return `Leaves ${inr(after)} — ${cover.toFixed(1)}× the ${compactINR(committed)} that `
        + 'goes out on standing instructions each month.';
    }
    return `Leaves ${inr(after)} in ${acct.name}.`;
  })();

  function send() {
    if (block || !payee) return;
    addTxn({
      merchant: payee.name,
      category: 'transfer',
      amount: -amount,
      at: now,
      accountId: acct.id,
      place: payee.handle,
      note: note.trim() || undefined,
    });
    setSent({ amount, payeeId: payee.id });
  }

  /* ---- The receipt ---- */
  if (sent) {
    const who = payees.find((p) => p.id === sent.payeeId);
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad scroll-y tr__done">
          <Stack gap={0} delay={0.05}>
            <Rise>
              <span className="tr__donemark">
                <Check size={30} />
              </span>
            </Rise>
            <Rise>
              <Eyebrow tone="var(--olive)">Sent · {shortDate(now)}</Eyebrow>
              <p className="tr__doneamt figure">{inr(sent.amount)}</p>
              <p className="tr__donewho">
                to {who?.name}
                {who && <span className="tr__donehandle num">{who.handle}</span>}
              </p>
            </Rise>
            <Rise style={{ paddingTop: 22 }}>
              <Rule />
              <p className="tr__donenote">
                {acct.name} now holds {inr(Math.max(0, acct.balance))}. The entry is filed
                under Transfer, so it will not count against a spending envelope.
              </p>
            </Rise>
            <Rise style={{ paddingTop: 26 }}>
              <div className="tr__doneacts">
                <Button ink="ink" full onClick={back}>Done</Button>
                {who && (
                  <Button
                    variant="outline"
                    ink="ink"
                    onClick={() => push({ name: 'payee', id: who.id })}
                    style={{ flex: '0 0 auto' }}
                  >
                    {firstName(who.name)}
                  </Button>
                )}
              </div>
            </Rise>
          </Stack>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        onBack={back}
        right={(
          <IconButton label="Scan a code instead" onClick={() => push({ name: 'scan' })}>
            <QrMark size={18} />
          </IconButton>
        )}
      />

      <div className="pane pane--pad scroll-y tr__pane">
        <Stack gap={0}>

          <Rise>
            <div className="tr__head">
              <PageHead
                eyebrow="Move money"
                title="Send"
                sub={payee
                  ? `${acct.name} → ${payee.name}`
                  : `${acct.name} → choose someone`}
              />
            </div>
          </Rise>

          {/* ---- Amount ---- */}
          <Rise>
            <div className={`tr__amount ${over ? 'tr__amount--over' : ''}`}>
              <AmountDisplay digits={digits} tone={over ? 'vermilion' : 'ink'} />
            </div>
            <p className={`tr__helper ${over || isCard ? 'tr__helper--warn' : ''}`}>
              {helper}
            </p>
            <div className="tr__chips">
              {lastToPayee && (
                <button
                  className="tr__chip tr__chip--again"
                  onClick={() => setDigits(String(Math.abs(lastToPayee.amount)))}
                >
                  Again {inr(Math.abs(lastToPayee.amount))}
                </button>
              )}
              {QUICK.map((q) => (
                <button
                  key={q}
                  className={`tr__chip ${amount === q ? 'tr__chip--on' : ''}`}
                  onClick={() => setDigits(String(q))}
                >
                  {inr(q)}
                </button>
              ))}
            </div>
          </Rise>

          {/* ---- From ---- */}
          <Rise style={{ paddingTop: 22 }}>
            <div className="tr__sechead">
              <Eyebrow>From</Eyebrow>
              <span className="tr__secmeta num">{accounts.length} accounts</span>
            </div>
            <div className="tr__rail" role="radiogroup" aria-label="Send from">
              {accounts.map((a) => {
                const Icon = KIND_ICON[a.kind];
                const on = a.id === accountId;
                const card = a.kind === 'card';
                return (
                  <motion.button
                    key={a.id}
                    role="radio"
                    aria-checked={on}
                    className={`tr__acct ${on ? 'tr__acct--on' : ''} ${card ? 'tr__acct--card' : ''}`}
                    onClick={() => setAccountId(a.id)}
                    whileTap={{ scale: 0.97 }}
                    transition={snap}
                  >
                    <span className="tr__acctico"><Icon size={15} /></span>
                    <span className="tr__acctname">{a.name}</span>
                    <span className="tr__acctbal figure">{inr(a.balance)}</span>
                    <span className="tr__acctfoot">
                      ·{a.tail} · {KIND_NOTE[a.kind]}
                    </span>
                    {on && (
                      <motion.span
                        className="tr__acctmark"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={snap}
                        aria-hidden
                      >
                        <Check size={11} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Rise>

          {/* ---- To ---- */}
          <Rise style={{ paddingTop: 20 }}>
            <div className="tr__sechead">
              <Eyebrow>To</Eyebrow>
              {payee && (
                <span className="tr__secmeta num">{payee.handle}</span>
              )}
            </div>
            <div className="tr__prail" role="radiogroup" aria-label="Send to">
              {payees.map((p) => {
                const on = p.id === payeeId;
                return (
                  <motion.button
                    key={p.id}
                    role="radio"
                    aria-checked={on}
                    aria-label={`${p.name}, ${p.handle}`}
                    className={`tr__payee ${on ? 'tr__payee--on' : ''}`}
                    onClick={() => setPayeeId(p.id)}
                    whileTap={{ scale: 0.94 }}
                    transition={snap}
                  >
                    <Initials name={p.name} size={48} selected={on} />
                    <span className="tr__payeename">{railName(p.name, p.kind)}</span>
                  </motion.button>
                );
              })}
              <motion.button
                className="tr__payee tr__payee--scan"
                onClick={() => push({ name: 'scan' })}
                whileTap={{ scale: 0.94 }}
                transition={snap}
                aria-label="Scan a code to pay someone new"
              >
                <span className="tr__scandisc"><QrMark size={20} /></span>
                <span className="tr__payeename">Scan</span>
              </motion.button>
            </div>
          </Rise>

          {/* ---- Note ---- */}
          <Rise style={{ paddingTop: 18 }}>
            <label className="tr__notewrap">
              <span className="tr__notelabel">Note</span>
              <input
                className="tr__note"
                value={note}
                maxLength={48}
                placeholder={payee?.kind === 'business' ? 'Order or bill number' : 'What is it for?'}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </Rise>

          {/* ---- Keypad ---- */}
          <Rise style={{ paddingTop: 6 }}>
            <Keypad onPress={(fn) => setDigits(fn)} compact max={7} />
          </Rise>

          <Rise style={{ paddingTop: 12 }}>
            <Button
              className="tr__send"
              ink={over || isCard ? 'vermilion' : 'olive'}
              full
              disabled={!!block}
              onClick={send}
              icon={block ? undefined : <IcSwap size={18} />}
              trailing={block ? undefined : <ArrowRight size={18} />}
            >
              {block ?? `Send ${inr(amount)}`}
            </Button>
            <AnimatePresence initial={false}>
              {block && (
                <motion.p
                  key={block}
                  className="tr__why"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {isCard
                    ? 'Pick HDFC Savings, the UPI wallet or Zerodha as the source.'
                    : over
                      ? `${acct.name} holds ${inr(source)}.`
                      : amount <= 0
                        ? 'Tap a figure above or use the keypad.'
                        : 'Choose a payee from the row above.'}
                </motion.p>
              )}
            </AnimatePresence>
          </Rise>

          <Rise style={{ paddingTop: 18 }}>
            <motion.p
              className="tr__foot"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: gentle } }}
            >
              Transfers are filed under Transfer, never as spending — a SIP or a goal
              deposit should not eat a month’s envelope.
            </motion.p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
