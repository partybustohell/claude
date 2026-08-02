/**
 * NET WORTH
 *
 * One line, six points, and the question underneath it: at this pace,
 * where does it land?
 *
 * The accounts reconcile exactly with the last point on the curve —
 * assets less the card is the net worth the history ends on — so the
 * breakdown is the same number taken apart rather than a second opinion.
 *
 * The two things the raw figures do not say out loud: the average
 * monthly gain hides a slow middle, and over half of what is owned sits
 * in equity, which means a month's move is partly the market's and not
 * the user's.
 */
import { useMemo } from 'react';
import { useApp } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Rule, Meter,
  SectionHead, Amount, Delta, Empty,
} from '../components/ui';
import { Sparkline } from '../components/charts';
import { IcBank, IcCard, IcWallet, IcRise, ChevronRight } from '../components/icons';
import type { Account } from '../data/types';
import { inr, compactINR, monthLabel, pctOf } from '../lib/format';
import { snap } from '../lib/motion';
import { motion } from 'framer-motion';
import './NetWorth.css';

const KIND_ICON = {
  bank: IcBank, card: IcCard, wallet: IcWallet, invest: IcRise,
} as const;

const KIND_LABEL = {
  bank: 'Savings account', card: 'Credit card',
  wallet: 'Wallet', invest: 'Investments',
} as const;

function monthName(iso: string): string {
  return monthLabel(iso).split(' ')[0];
}

/** Add n whole months to an ISO first-of-month and label it. */
function monthAfter(iso: string, n: number): string {
  const d = new Date(iso);
  return monthLabel(new Date(d.getFullYear(), d.getMonth() + n, 1).toISOString());
}

export function NetWorth() {
  const { history, accounts } = useApp();
  const { back, push } = useNav();

  const first = history[0];
  const last = history[history.length - 1];

  /* ---- Month-on-month movement ---- */
  const steps = useMemo(() => history.slice(1).map((h, i) => ({
    month: h.month,
    netWorth: h.netWorth,
    delta: h.netWorth - history[i].netWorth,
  })), [history]);

  const pace = useMemo(() => {
    if (steps.length === 0) {
      return { avg: 0, lo: 0, best: null, worst: null, tied: [] as string[], under: 0 };
    }
    const avg = steps.reduce((n, s) => n + s.delta, 0) / steps.length;
    const hi = Math.max(...steps.map((s) => s.delta));
    const lo = Math.min(...steps.map((s) => s.delta));
    return {
      avg,
      lo,
      best: steps.find((s) => s.delta === hi) ?? null,
      worst: steps.find((s) => s.delta === lo) ?? null,
      /* Two months that moved by the identical amount is worth saying —
         and both of them get the marker, not just the first. */
      tied: steps.filter((s) => s.delta === lo).map((s) => monthName(s.month)),
      under: steps.filter((s) => s.delta < avg).length,
    };
  }, [steps]);

  /* ---- What is owned, what is owed ---- */
  const sheet = useMemo(() => {
    const owed = (a: Account) => a.kind === 'card' || a.balance < 0;
    const assets = accounts.filter((a) => !owed(a))
      .sort((a, b) => b.balance - a.balance);
    const debts = accounts.filter(owed)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    const gross = assets.reduce((n, a) => n + a.balance, 0);
    const owedTotal = debts.reduce((n, a) => n + Math.abs(a.balance), 0);
    const invested = assets.filter((a) => a.kind === 'invest')
      .reduce((n, a) => n + a.balance, 0);
    return { assets, debts, gross, owedTotal, net: gross - owedTotal, invested };
  }, [accounts]);

  const change = last.netWorth - first.netWorth;
  const changePct = first.netWorth > 0 ? (change / first.netWorth) * 100 : 0;

  /* Where twelve more months of the same pace lands, and when the next
     round lakh mark arrives on the way. */
  const yearOut = last.netWorth + pace.avg * 12;
  /* The next lakh mark worth naming — one already within touching
     distance is not news, so step up until it is at least two months out. */
  const mark = useMemo(() => {
    if (pace.avg <= 0) return { at: 0, months: 0 };
    let at = Math.ceil((last.netWorth + 1) / 100000) * 100000;
    while ((at - last.netWorth) / pace.avg < 2) at += 100000;
    return { at, months: Math.ceil((at - last.netWorth) / pace.avg) };
  }, [last.netWorth, pace.avg]);

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Money"
              title="Net worth"
              sub={`${monthLabel(first.month)} to ${monthLabel(last.month)}, ${history.length} months on the books.`}
            />
          </Rise>

          {/* ---- Hero ---- */}
          <Rise>
            <Amount className="nw__hero" value={last.netWorth} duration={1700} />
            <div className="nw__herofoot">
              <Delta value={changePct} suffix={`since ${monthName(first.month)}`} size={13} />
              <span className="nw__heroabs num">
                {change >= 0 ? '+' : '−'}
                <span className="figure">{inr(Math.abs(change))}</span>
              </span>
            </div>
          </Rise>

          {/* ---- The curve ---- */}
          <Rise style={{ paddingTop: 18 }}>
            <div className="nw__chart">
              {/* Cobalt at 20% over cream resolves to a neutral grey, which
                  this palette forbids — so the area wash is off and the line
                  is given printed rules to read against instead. */}
              <div className="nw__plot">
                <div className="nw__grid" aria-hidden>
                  {history.map((h, i) => (
                    <span
                      key={h.month}
                      style={{ left: `${((6 + (i / (history.length - 1)) * 330) / 342) * 100}%` }}
                    />
                  ))}
                </div>
                <Sparkline
                  values={history.map((h) => h.netWorth)}
                  ink="ink" height={132} width={342} fill={false}
                />
              </div>
              <div className="nw__axis">
                {history.map((h, i) => (
                  <span
                    key={h.month}
                    className="nw__axislabel"
                    /* aligned to the Sparkline's own 6px end padding */
                    style={{ left: `${((6 + (i / (history.length - 1)) * 330) / 342) * 100}%` }}
                  >
                    {monthName(h.month).slice(0, 3)}
                  </span>
                ))}
              </div>
              <div className="nw__ends">
                <span>{compactINR(first.netWorth)}</span>
                <span>{compactINR(last.netWorth)}</span>
              </div>
            </div>
          </Rise>

          {/* ---- What you own ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <SectionHead title="What you own" />
            <p className="nw__sectotal figure">{inr(sheet.gross)}</p>
            <div className="nw__accts">
              {sheet.assets.map((a) => (
                <AcctRow
                  key={a.id} acct={a} share={a.balance / (sheet.gross || 1)}
                  onOpen={() => push({ name: 'account', id: a.id })}
                />
              ))}
            </div>
          </Rise>

          {/* ---- What you owe ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <SectionHead title="What you owe" />
            {sheet.debts.length === 0 ? (
              <Empty
                title="Nothing owed"
                body="No card balance and no loan — every rupee on this page is yours."
              />
            ) : (
              <>
                <p className="nw__sectotal nw__sectotal--red figure">
                  −{inr(sheet.owedTotal)}
                </p>
                <div className="nw__accts">
                  {sheet.debts.map((a) => (
                    <AcctRow
                      key={a.id} acct={a} owed
                      share={Math.abs(a.balance) / (sheet.gross || 1)}
                      onOpen={() => push({ name: 'account', id: a.id })}
                    />
                  ))}
                </div>
                <p className="nw__owenote">
                  The card is {pctOf(sheet.owedTotal, sheet.gross)}% of what you own.
                  Clear it and net worth is simply {inr(sheet.gross)}.
                </p>
              </>
            )}
          </Rise>

          {/* ---- Month by month ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="Month by month" />
            {steps.length === 0 ? (
              <Empty title="One month only" body="There is no movement to show until a second month closes." />
            ) : (
              <div className="nw__table">
                <div className="nw__thead">
                  <span>Month</span>
                  <span className="nw__num">Net worth</span>
                  <span className="nw__num">Change</span>
                </div>
                {steps.map((s) => {
                  const best = pace.best?.month === s.month;
                  const worst = !best && s.delta === pace.lo;
                  return (
                    <div
                      key={s.month}
                      className={`nw__trow${best ? ' nw__trow--best' : ''}${worst ? ' nw__trow--worst' : ''}`}
                    >
                      <span className="nw__tmonth">
                        {monthName(s.month)}
                        {best && <span className="nw__chip nw__chip--best">best</span>}
                        {worst && <span className="nw__chip nw__chip--worst">thinnest</span>}
                      </span>
                      <span className="nw__num figure nw__tval">{inr(s.netWorth)}</span>
                      <span
                        className="nw__num figure nw__tdelta"
                        style={{ color: s.delta >= 0 ? 'var(--olive)' : 'var(--vermilion)' }}
                      >
                        {s.delta >= 0 ? '+' : '−'}{inr(Math.abs(s.delta))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Rise>

          {/* ---- The pace ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">Average month</Eyebrow>
              <p className="nw__pacenum">
                <span className="nw__paceplus">+</span>
                <Amount value={Math.round(pace.avg)} duration={1400} />
              </p>
              <p className="nw__pacebody">
                {inr(Math.round(Math.abs(change)))} across {steps.length} months.
                Hold that and twelve months from now reads{' '}
                <b className="figure">{inr(Math.round(yearOut))}</b>
                {mark.months > 0 ? (
                  <>
                    {' '}— with {compactINR(mark.at)} arriving around{' '}
                    {monthAfter(last.month, mark.months)}.
                  </>
                ) : '.'}
              </p>

              <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 14px' }} />

              <p className="nw__pacenote">
                The average flatters it. {pace.under} of the {steps.length} months came
                in below it
                {pace.tied.length > 1 && (
                  <> — {pace.tied.join(' and ')} added exactly the same,{' '}
                    {inr(Math.abs(pace.worst?.delta ?? 0))} each</>
                )}
                , before {pace.best && monthName(pace.best.month)} put{' '}
                {inr(pace.best?.delta ?? 0)} back on top.
              </p>
            </Card>
          </Rise>

          {/* ---- What the curve is made of ---- */}
          <Rise style={{ paddingTop: 24, paddingBottom: 8 }}>
            <Card tone="warm" pad={20}>
              <Eyebrow>Read it carefully</Eyebrow>
              <p className="nw__close">
                {pctOf(sheet.invested, sheet.gross)}% of what you own is held in
                equity, so{' '}
                {sheet.invested * 2 > sheet.gross
                  ? 'more than half of this line'
                  : 'a real share of this line'}{' '}
                is the market’s mood rather than your saving. A flat month here is
                not necessarily a month you did anything wrong.
              </p>
            </Card>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function AcctRow({
  acct, share, owed, onOpen,
}: { acct: Account; share: number; owed?: boolean; onOpen: () => void }) {
  const Icon = KIND_ICON[acct.kind];
  return (
    <motion.button
      className="nw__acct"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      whileHover={{ x: 2 }}
      transition={snap}
    >
      <span className="nw__accticon tex-ink" style={{ background: `var(--${acct.ink})` }}>
        <Icon size={17} />
      </span>
      <span className="nw__acctbody">
        <span className="nw__acctname">{acct.name}</span>
        <span className="nw__acctmeta">
          {KIND_LABEL[acct.kind]} · ••{acct.tail}
        </span>
      </span>
      <span className="nw__acctright">
        <span className="nw__acctamt figure">
          {owed ? '−' : ''}{inr(Math.abs(acct.balance))}
        </span>
        <span className="nw__acctshare num">{Math.round(share * 100)}%</span>
      </span>
      <ChevronRight size={15} className="nw__acctchev" />
      <span className="nw__acctmeter">
        <Meter value={share} ink={owed ? 'vermilion' : acct.ink} height={5} />
      </span>
    </motion.button>
  );
}
