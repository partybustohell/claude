/**
 * BILL DETAIL
 *
 * One obligation, in full. The amount is the hero because that is the
 * question being asked; everything under it answers "and then what" —
 * which account it comes out of, what the account looks like afterwards,
 * whether it moves on its own, and how this biller has behaved before.
 *
 * The ledger is matched to the biller by name. Where a bill is a card
 * statement, the same match finds the account, so the charges behind the
 * number can be shown rather than merely totalled.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBill, useActions, useApp, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Card, Amount, Meter, Button,
  Group, Row, Toggle, Rule, CategoryBadge, SectionHead,
} from '../components/ui';
import { IcRepeat, Check, ChevronRight } from '../components/icons';
import { inr, compactINR, longDate, shortDate, pctOf } from '../lib/format';
import { snap } from '../lib/motion';
import { dueInDays, duePhrase, AlertGlyph } from './Bills';
import './Bill.css';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function Bill({ id }: { id: string }) {
  const bill = useBill(id);
  const { accounts, txns, now } = useApp();
  const { payBill, toggleAutopay } = useActions();
  const { back, push } = useNav();

  const nowDate = useMemo(() => new Date(now), [now]);

  const history = useMemo(() => {
    if (!bill) return [];
    const key = norm(bill.name);
    return txns
      .filter((t) => t.amount < 0 && norm(t.merchant) === key)
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [txns, bill]);

  /* A card statement names an account. When it does, the ledger already
     holds the charges that made the number. */
  const statementOf = useMemo(() => {
    if (!bill) return undefined;
    const acct = accounts.find((a) => norm(a.name) === norm(bill.name));
    if (!acct) return undefined;
    const items = txns
      .filter((t) => t.accountId === acct.id && t.amount < 0)
      .sort((a, b) => b.at.localeCompare(a.at));
    return { acct, items, total: items.reduce((n, t) => n + Math.abs(t.amount), 0) };
  }, [accounts, txns, bill]);

  if (!bill) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <p className="display bill__missing">That bill is no longer here.</p>
        </div>
      </Screen>
    );
  }

  const cat = CATEGORIES[bill.category];
  const from = accounts.find((a) => a.id === bill.accountId);
  const days = dueInDays(bill.due, nowDate);
  const overdue = bill.status === 'overdue';
  const paid = bill.status === 'paid';
  const after = from ? from.balance - bill.amount : 0;

  const status = paid
    ? 'Paid'
    : overdue
      ? `Overdue ${duePhrase(days)}`
      : bill.status === 'scheduled'
        ? `Scheduled for ${shortDate(bill.due)}`
        : `Due ${duePhrase(days)}`;

  /* Does this biller ask for the same number every time? */
  const steady = history.length > 1
    && history.every((t) => Math.abs(t.amount) === Math.abs(history[0].amount));
  const avg = history.length
    ? history.reduce((n, t) => n + Math.abs(t.amount), 0) / history.length
    : 0;

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y bill__pane">
        <Stack gap={0}>
          {/* ---- Hero ---- */}
          <Rise>
            <div className="bill__head">
              <CategoryBadge icon={cat.icon} ink={cat.ink} size={44} />
              <div className="bill__headtext">
                <Eyebrow>{cat.label}</Eyebrow>
                <h1 className="display bill__name">{bill.name}</h1>
              </div>
            </div>
          </Rise>

          <Rise>
            <p className="bill__amount">
              <Amount value={bill.amount} duration={1250} />
            </p>
          </Rise>

          <Rise style={{ paddingTop: 14 }}>
            <div className="bill__chips">
              <span className={`bill__status bill__status--${paid ? 'paid' : overdue ? 'over' : 'due'}`}>
                {overdue && <AlertGlyph size={12} />}
                {paid && <Check size={13} />}
                {status}
              </span>
              <span className={`bill__auto${bill.autopay ? ' bill__auto--on' : ''}`}>
                <IcRepeat size={12} />
                {bill.autopay ? 'Autopay on' : 'No autopay'}
              </span>
            </div>
          </Rise>

          {/* ---- Where it comes from ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Card tone="warm" pad={0} elevation={1}>
              <div className="bill__fact">
                <span className="bill__factkey">Due date</span>
                <span className="bill__factval num">{longDate(bill.due)}</span>
              </div>
              <Rule tone="var(--hairline-soft)" />
              {from && (
                <motion.button
                  className="bill__fact bill__fact--tap"
                  onClick={() => push({ name: 'account', id: from.id })}
                  whileTap={{ scale: 0.99 }}
                  transition={snap}
                >
                  <span className="bill__factkey">Draws on</span>
                  <span className="bill__factval">
                    {from.name}
                    <span className="bill__tail num"> ••{from.tail}</span>
                  </span>
                  <ChevronRight size={16} className="bill__chev" />
                </motion.button>
              )}
              <Rule tone="var(--hairline-soft)" />
              <div className="bill__after">
                <div className="bill__afterrow">
                  <span className="bill__factkey">
                    {paid ? 'Balance there now' : 'Balance once it clears'}
                  </span>
                  <span className="bill__afterval figure">
                    {inr(paid ? (from?.balance ?? 0) : after)}
                  </span>
                </div>
                {from && from.balance > 0 && (
                  <>
                    <Meter
                      value={Math.min(1, bill.amount / from.balance)}
                      ink={bill.amount / from.balance > 0.5 ? 'vermilion' : 'ink'}
                      height={6}
                    />
                    <p className="bill__afternote">
                      This bill is {pctOf(bill.amount, from.balance)}% of what sits in{' '}
                      {from.name.split(' ')[0]}.
                    </p>
                  </>
                )}
              </div>
            </Card>
          </Rise>

          {/* ---- Autopay ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Group
              caption={bill.autopay
                ? `Debits from ${from?.name ?? 'the linked account'} on the morning of the due date. No reminder is sent.`
                : 'Nothing moves until you say so. A reminder arrives two days out.'}
            >
              <Row
                icon={<IcRepeat size={17} />}
                ink={bill.autopay ? 'olive' : undefined}
                title="Autopay"
                sub={bill.autopay ? `On · next ${shortDate(bill.due)}` : 'Off · pay by hand'}
                trailing={
                  <Toggle
                    on={bill.autopay}
                    onChange={() => toggleAutopay(bill.id)}
                    label={`Autopay for ${bill.name}`}
                  />
                }
              />
            </Group>
          </Rise>

          {/* ---- What made the number (card statements) ---- */}
          {statementOf && statementOf.items.length > 0 && (
            <Rise>
              <SectionHead title="Behind this statement" />
              <div className="bill__charges">
                {statementOf.items.slice(0, 5).map((t, i) => (
                  <div key={t.id}>
                    {i > 0 && <Rule tone="var(--hairline-soft)" />}
                    <motion.button
                      className="bill__charge"
                      onClick={() => push({ name: 'txn', id: t.id })}
                      whileTap={{ scale: 0.99 }}
                      whileHover={{ x: 2 }}
                      transition={snap}
                    >
                      <span className="bill__chargename">{t.merchant}</span>
                      <span className="bill__chargedate num">{shortDate(t.at)}</span>
                      <span className="bill__chargeamt figure">{inr(Math.abs(t.amount))}</span>
                    </motion.button>
                  </div>
                ))}
              </div>
              <p className="bill__chargenote">
                {statementOf.items.length} charges in the ledger add to{' '}
                {inr(statementOf.total)} — {pctOf(statementOf.total, bill.amount)}% of the
                statement. The rest is carried from earlier cycles.
              </p>
            </Rise>
          )}

          {/* ---- Payment history ---- */}
          <Rise style={{ paddingTop: 26, paddingBottom: 8 }}>
            <SectionHead title="Payment history" />
            {history.length === 0 ? (
              <div className="bill__nohistory">
                <p className="display bill__nohistorytitle">First one on record</p>
                <p className="bill__nohistorybody">
                  Nothing from {bill.name} has passed through the ledger yet. Once this
                  clears, the pattern starts here.
                </p>
              </div>
            ) : (
              <>
                <div className="bill__hist">
                  {history.map((t, i) => (
                    <div key={t.id}>
                      {i > 0 && <Rule tone="var(--hairline-soft)" />}
                      <motion.button
                        className="bill__histrow"
                        onClick={() => push({ name: 'txn', id: t.id })}
                        whileTap={{ scale: 0.99 }}
                        whileHover={{ x: 2 }}
                        transition={snap}
                      >
                        <span className="bill__histdot" aria-hidden />
                        <span className="bill__histdate">{longDate(t.at)}</span>
                        <span className="bill__histamt figure">{inr(Math.abs(t.amount))}</span>
                      </motion.button>
                    </div>
                  ))}
                </div>
                <p className="bill__histnote">
                  {steady
                    ? `Same figure every time — ${inr(Math.abs(history[0].amount))} across ${history.length} payments.`
                    : `${history.length} payment${history.length > 1 ? 's' : ''} on record, averaging ${inr(Math.round(avg))}.`}
                  {` Last paid ${shortDate(history[0].at)}.`}
                </p>
              </>
            )}
          </Rise>
        </Stack>
      </div>

      {/* ---- The action ---- */}
      <div className="bill__foot">
        {paid ? (
          <Button full variant="quiet" ink="olive" icon={<Check size={17} />} disabled>
            Settled
          </Button>
        ) : (
          <Button
            full
            ink={overdue ? 'vermilion' : 'ink'}
            onClick={() => payBill(bill.id)}
            trailing={<span className="bill__ctaamt num">{compactINR(bill.amount)}</span>}
          >
            Pay now
          </Button>
        )}
      </div>
    </Screen>
  );
}
