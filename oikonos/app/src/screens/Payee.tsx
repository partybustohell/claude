import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp, usePayee } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Rule, Empty, Amount,
  Button, IconButton, INK_VAR, type Ink,
} from '../components/ui';
import { IcSwap, IcUser, IcBag, ChevronRight, ArrowRight, Check } from '../components/icons';
import type { Txn } from '../data/types';
import { inr, signedINR, shortDate, time, relativeDay, compactINR } from '../lib/format';
import { snap } from '../lib/motion';
import './Payee.css';
import { PlateFoot } from '../illustrations/place';

/* ================================================================
   Shared payee furniture
   ----------------------------------------------------------------
   Transfer and Scan both print payees, so the avatar and the
   name-matching rule live here rather than being re-derived — a
   payee who matches on one screen must match on all of them.
   ================================================================ */

const AVATAR_INKS: Ink[] = ['ink', 'olive', 'vermilion'];
/** The offset plate behind each disc — riso misregistration, never the same ink. */
const AVATAR_BEHIND: Record<string, Ink> = {
  ink: 'vermilion', olive: 'ink', vermilion: 'olive',
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Strip “(flatmate)”, “— help” and the like down to the printable name. */
function plainName(name: string): string {
  return name.replace(/\(.*?\)/g, ' ').replace(/\s[—–-]\s.*$/, ' ').trim();
}

export function firstName(name: string): string {
  return plainName(name).split(/\s+/)[0] ?? name;
}

/** Short label for a rail cell: people go by first name, shops by sign. */
export function railName(name: string, kind: 'person' | 'business'): string {
  return kind === 'person' ? firstName(name) : plainName(name);
}

export function initialsOf(name: string): string {
  const parts = plainName(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * A payee's mark: initials set in Fraunces on an inked disc, with a
 * second disc knocked a hair out of register behind it. The ink is
 * chosen by name hash so the same person is the same colour app-wide.
 */
export function Initials({
  name, size = 48, selected = false, onDark = false,
}: { name: string; size?: number; selected?: boolean; onDark?: boolean }) {
  /* The low bits of an FNV hash cluster badly on short names — three of
     these five would print in the same ink. Shifting past them spreads
     the book across all four plates. */
  const ink = AVATAR_INKS[(hash(name) >>> 5) % AVATAR_INKS.length];
  const behind = AVATAR_BEHIND[ink];
  return (
    <span
      className={`avatar ${selected ? 'avatar--on' : ''} ${onDark ? 'avatar--dark' : ''}`}
      style={{
        width: size,
        height: size,
        ['--av-ink' as string]: INK_VAR[ink],
        ['--av-behind' as string]: INK_VAR[behind],
      }}
      aria-hidden
    >
      <span className="avatar__plate" />
      <span className="avatar__disc tex-ink">
        <span className="avatar__txt figure" style={{ fontSize: Math.round(size * 0.36) }}>
          {initialsOf(name)}
        </span>
      </span>
    </span>
  );
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * A payee is a saved handle; the ledger only knows merchant strings. Match
 * on the whole name or on a clean multi-word prefix — “Blue Tokai” is
 * “Blue Tokai Coffee”, but a bare first name never matches on its own, so
 * a note that mentions someone is not mistaken for a payment to them.
 */
export function payeeMatches(payeeName: string, merchant: string): boolean {
  const a = norm(payeeName);
  const b = norm(merchant);
  if (!a || !b) return false;
  if (a === b) return true;
  if (!a.includes(' ') && !b.includes(' ')) return false;
  return b.startsWith(`${a} `) || a.startsWith(`${b} `);
}

export function payeeTxns(payeeName: string, txns: Txn[]): Txn[] {
  return txns
    .filter((t) => payeeMatches(payeeName, t.merchant))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** A QR square, drawn on the icon grid so it sits with the rest of the set. */
export function QrMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.2" y="3.2" width="7" height="7" rx="1.6" />
      <rect x="13.8" y="3.2" width="7" height="7" rx="1.6" />
      <rect x="3.2" y="13.8" width="7" height="7" rx="1.6" />
      <path d="M14.2 14.2h2.4v2.4h-2.4z" />
      <path d="M19.4 14.2h1.4M14.2 19.6h2.4M19.8 18.6v2.2" />
    </svg>
  );
}

/* ================================================================
   Payee
   ================================================================ */

export function Payee({ id }: { id: string }) {
  const { back, push } = useNav();
  const p = usePayee(id);
  const { txns, payees, accounts, now } = useApp();
  const nowDate = useMemo(() => new Date(now), [now]);
  const [requested, setRequested] = useState(false);

  const d = useMemo(() => {
    if (!p) return undefined;
    const items = payeeTxns(p.name, txns);
    const total = items.reduce((n, t) => n + Math.abs(t.amount), 0);
    const month = now.slice(0, 7);
    const monthTotal = items
      .filter((t) => t.at.slice(0, 7) === month)
      .reduce((n, t) => n + Math.abs(t.amount), 0);

    const acctNames = [...new Set(items.map((t) => t.accountId))]
      .map((a) => accounts.find((x) => x.id === a)?.name ?? a);

    /* Notes that name this person but never became a payment to them. A
       shared bill is the usual reason a payee sits in the book with an
       empty ledger — the money went to the restaurant, not between you. */
    const first = firstName(p.name);
    const re = new RegExp(`\\b${first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const mentions = p.kind === 'person'
      ? txns
        .filter((t) => t.note && re.test(t.note) && !items.includes(t))
        .sort((a, b) => b.at.localeCompare(a.at))
      : [];
    const mentioned = mentions.reduce((n, t) => n + Math.abs(t.amount), 0);

    /* Everyone else, warmest first — a payee page should never dead-end. */
    const others = payees
      .filter((x) => x.id !== p.id)
      .map((x) => {
        const rows = payeeTxns(x.name, txns);
        return {
          ...x,
          total: rows.reduce((n, t) => n + Math.abs(t.amount), 0),
          count: rows.length,
        };
      })
      .sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));

    return {
      items, total, monthTotal, acctNames, mentions, mentioned, others,
      avg: items.length ? total / items.length : 0,
      firstAt: items.length ? items[items.length - 1].at : undefined,
      biggest: items.length
        ? items.reduce((a, b) => (Math.abs(b.amount) > Math.abs(a.amount) ? b : a))
        : undefined,
    };
  }, [p, txns, payees, accounts, now]);

  if (!p || !d) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad scroll-y">
          <Empty title="No such payee" body="Nothing in the address book carries this id." />
        </div>
      </Screen>
    );
  }

  const kindLabel = p.kind === 'person' ? 'Person' : 'Business';
  const handleLabel = p.handle.includes('@') ? 'UPI' : 'Mobile';

  /* Reading — the things the rows do not say out loud. */
  const notes: string[] = [];
  if (d.items.length > 1 && d.firstAt) {
    const span = Math.max(1, Math.round(
      (new Date(d.items[0].at).getTime() - new Date(d.firstAt).getTime()) / 86400000,
    ));
    notes.push(
      `${d.items.length} payments over ${span} days — about one every `
      + `${Math.max(1, Math.round(span / (d.items.length - 1)))} days.`,
    );
  }
  if (d.biggest && d.items.length > 1) {
    notes.push(`Largest was ${inr(Math.abs(d.biggest.amount))} on ${shortDate(d.biggest.at)}.`);
  }
  if (d.monthTotal > 0 && d.total > d.monthTotal) {
    notes.push(`${inr(d.monthTotal)} of the ${inr(d.total)} lifetime total moved this month.`);
  }
  if (d.acctNames.length > 0) {
    notes.push(
      d.acctNames.length === 1
        ? `Always paid from ${d.acctNames[0]}.`
        : `Paid from ${d.acctNames.join(' and ')}.`,
    );
  }

  return (
    <Screen>
      <TopBar
        onBack={back}
        right={(
          <IconButton label="Scan a code to pay" onClick={() => push({ name: 'scan' })}>
            <QrMark size={18} />
          </IconButton>
        )}
      />

      <div className="pane pane--pad scroll-y pay__pane">
        <Stack gap={0}>

          {/* ---- Identity ---- */}
          <Rise>
            <PageHead
              eyebrow={`${kindLabel} · ${handleLabel}`}
              title={p.name}
              sub={(
                <span className="pay__handlerow">
                  <span className="pay__handle num">{p.handle}</span>
                  {p.lastAt && (
                    <span className="pay__last">
                      last moved {relativeDay(p.lastAt, nowDate).toLowerCase()}
                    </span>
                  )}
                </span>
              )}
              right={<Initials name={p.name} size={62} />}
            />
          </Rise>

          {/* ---- Actions ---- */}
          <Rise style={{ paddingBottom: 26 }}>
            <div className="pay__acts">
              <Button
                ink="ink"
                full
                icon={<IcSwap size={18} />}
                onClick={() => push({ name: 'transfer' })}
              >
                {d.items.length ? 'Send again' : 'Send money'}
              </Button>
              {requested ? (
                <motion.span
                  className="pay__requested"
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={snap}
                >
                  <Check size={16} />
                  Asked
                </motion.span>
              ) : (
                <Button
                  variant="outline"
                  ink="ink"
                  onClick={() => setRequested(true)}
                  style={{ flex: '0 0 auto' }}
                >
                  Request
                </Button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {requested && (
                <motion.p
                  className="pay__requestnote"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={snap}
                >
                  An open request is on its way to {p.handle} — {firstName(p.name)} picks
                  the amount. Nothing has left your accounts.
                </motion.p>
              )}
            </AnimatePresence>
          </Rise>

          {/* ---- The ledger ---- */}
          <Rise>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">
                {d.items.length
                  ? `Moved to ${railName(p.name, p.kind)}`
                  : 'Moved through Oikonos'}
              </Eyebrow>
              <Amount value={d.total} className="pay__total" />

              {d.items.length ? (
                <>
                  <p className="pay__totalmeta">
                    across {d.items.length} payment{d.items.length === 1 ? '' : 's'}
                    {d.firstAt ? ` since ${shortDate(d.firstAt)}` : ''}
                  </p>
                  <Rule tone="var(--hairline-ink)" style={{ margin: '18px 0 0' }} />
                  <div className="pay__stats">
                    <Stat label="Payments" value={String(d.items.length)} />
                    <Stat label="Average" value={inr(Math.round(d.avg))} />
                    <Stat label="This month" value={d.monthTotal ? inr(d.monthTotal) : '—'} />
                    <Stat label="Last" value={shortDate(d.items[0].at)} />
                  </div>
                </>
              ) : (
                <p className="pay__totalnote">
                  Nothing under this name has reached the ledger.
                  {p.lastAt && (
                    <>
                      {' '}Your bank records money moving on {shortDate(p.lastAt)} at{' '}
                      {time(p.lastAt)} — it has not been matched to a transaction yet.
                    </>
                  )}
                </p>
              )}
            </Card>
          </Rise>

          {/* ---- Shared spending that names them ---- */}
          {d.mentions.length > 0 && (
            <Rise style={{ paddingTop: 28 }}>
              <Eyebrow>Named in your notes</Eyebrow>
              <p className="pay__mentionlead">
                {inr(d.mentioned)} of spending mentions {firstName(p.name)} but never split
                here — the money went to the merchant, not between you.
              </p>
              {d.mentions.map((t) => (
                <motion.button
                  key={t.id}
                  className="pay__mention"
                  onClick={() => push({ name: 'txn', id: t.id })}
                  whileTap={{ scale: 0.99 }}
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <span className="pay__mentionbody">
                    <span className="pay__mentiontop">
                      <span className="pay__mentionmerchant">{t.merchant}</span>
                      <span className="pay__mentionamt figure">{signedINR(t.amount)}</span>
                    </span>
                    <span className="pay__mentionnote">“{t.note}”</span>
                    <span className="pay__mentiondate">{shortDate(t.at)}</span>
                  </span>
                  <ChevronRight size={16} className="pay__chev" />
                </motion.button>
              ))}
            </Rise>
          )}

          {/* ---- Reading ---- */}
          {notes.length > 0 && (
            <Rise style={{ paddingTop: 28 }}>
              <Eyebrow>Reading</Eyebrow>
              <ul className="pay__notes">
                {notes.map((n) => (
                  <li key={n} className="pay__note">
                    <span className="pay__notedot" aria-hidden />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Rise>
          )}

          {/* ---- History ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <div className="pay__sechead">
              <Eyebrow>History</Eyebrow>
              {d.items.length > 0 && <span className="pay__secmeta num">{d.items.length}</span>}
            </div>
          </Rise>

          {d.items.length === 0 ? (
            <Rise>
              <div className="pay__empty">
                <Empty
                  title="Nothing has moved yet"
                  body={`No transaction in the ledger carries ${p.name}. When money goes either way, it prints here.`}
                  icon={<IcSwap size={26} />}
                />
              </div>
            </Rise>
          ) : (
            d.items.map((t, i) => (
              <Rise key={t.id}>
                <motion.button
                  className="pay__row"
                  onClick={() => push({ name: 'txn', id: t.id })}
                  whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <span className="pay__rowbody">
                    <span className="pay__rowtop">
                      <span className="pay__rowdate">{shortDate(t.at)}</span>
                      <span className="pay__rowtime num">{time(t.at)}</span>
                    </span>
                    <span className="pay__rowsub">
                      {t.note ?? t.place
                        ?? accounts.find((a) => a.id === t.accountId)?.name
                        ?? 'Payment'}
                    </span>
                  </span>
                  <span
                    className="pay__rowamt figure"
                    style={{ color: t.amount >= 0 ? 'var(--olive)' : 'var(--ink)' }}
                  >
                    {signedINR(t.amount)}
                  </span>
                  <ChevronRight size={16} className="pay__chev" />
                </motion.button>
                {i < d.items.length - 1 && <Rule />}
              </Rise>
            ))
          )}

          {/* ---- Everyone else ---- */}
          <Rise style={{ paddingTop: 30 }}>
            <div className="pay__sechead">
              <Eyebrow>Also in your book</Eyebrow>
              <span className="pay__secmeta num">{d.others.length}</span>
            </div>
            <div className="pay__others">
              {d.others.map((o) => (
                <motion.button
                  key={o.id}
                  className="pay__other"
                  onClick={() => push({ name: 'payee', id: o.id })}
                  whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                  whileHover={{ x: 2 }}
                  transition={snap}
                >
                  <Initials name={o.name} size={38} />
                  <span className="pay__otherbody">
                    <span className="pay__othername">{o.name}</span>
                    <span className="pay__othersub">
                      {o.kind === 'person' ? <IcUser size={11} /> : <IcBag size={11} />}
                      {o.handle}
                    </span>
                  </span>
                  <span className="pay__othertotal num">
                    {o.count ? compactINR(o.total) : 'no history'}
                  </span>
                  <ChevronRight size={15} className="pay__chev" />
                </motion.button>
              ))}
            </div>
          </Rise>

          <Rise style={{ paddingTop: 20 }}>
            <motion.button
              className="pay__foot"
              onClick={() => push({ name: 'transfer' })}
              whileTap={{ scale: 0.99 }}
              transition={snap}
            >
              <span>Move money to someone new</span>
              <ArrowRight size={16} />
            </motion.button>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="shopfront" height={196} />
        </Stack>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pay__stat">
      <span className="pay__statlabel">{label}</span>
      <span className="pay__statvalue figure">{value}</span>
    </div>
  );
}
