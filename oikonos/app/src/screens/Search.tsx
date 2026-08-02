import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, useMerchants, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, Eyebrow, Stack, Rise, Rule, Empty, CategoryBadge, INK_VAR,
} from '../components/ui';
import {
  Search as SearchIcon, Close, ChevronRight, IcSpark,
} from '../components/icons';
import type { CategoryId, Txn } from '../data/types';
import { inr, signedINR, compactINR, shortDate } from '../lib/format';
import { snap, fade } from '../lib/motion';
import './Search.css';

/** A bare number is an amount query — how people look for a half-remembered payment. */
function parseAmount(s: string): number | null {
  const cleaned = s.replace(/[₹,\s]/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return n > 0 ? n : null;
}

const TOLERANCE = 0.1;

/** Highlight the matched run without losing the surrounding text. */
function Mark({ text, q }: { text: string; q: string }): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="sr__mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function Search() {
  const { back, push } = useNav();
  const { txns, now, accounts } = useApp();
  const merchants = useMerchants();

  const [q, setQ] = useState('');
  const [history, setHistory] = useState<string[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* Recent searches are UI history, not ledger data — but seeding them from
     the ledger keeps the screen honest before the user has typed anything. */
  const seeded = useMemo(() => {
    const month = now.slice(0, 7);
    const places = new Map<string, number>();
    const cats = new Map<CategoryId, number>();
    let biggest = 0;
    for (const t of txns) {
      if (t.place) places.set(t.place, (places.get(t.place) ?? 0) + 1);
      if (t.at.slice(0, 7) === month && t.amount < 0) {
        cats.set(t.category, (cats.get(t.category) ?? 0) + 1);
        biggest = Math.max(biggest, Math.abs(t.amount));
      }
    }
    const place = [...places.entries()].sort((a, b) => b[1] - a[1])[0];
    const cat = [...cats.entries()].sort((a, b) => b[1] - a[1])[0];
    const out: string[] = [];
    if (place && place[1] > 1) out.push(place[0]);
    if (cat) out.push(CATEGORIES[cat[0]].label);
    if (biggest > 0) out.push(String(biggest));
    return out;
  }, [txns, now]);

  const recents = history ?? seeded;

  const commit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistory((prev) => [v, ...(prev ?? seeded).filter((x) => x !== v)].slice(0, 6));
  };

  /* ---- Matching ---- */

  const raw = q.trim();
  const ql = raw.toLowerCase();
  const amount = parseAmount(raw);

  const res = useMemo(() => {
    if (!ql) return { merchants: [], categories: [], txns: [] as Txn[], total: 0 };

    const hitsM = amount ? [] : merchants.filter((m) =>
      m.name.toLowerCase().includes(ql)
      || (m.place ?? '').toLowerCase().includes(ql)
      || CATEGORIES[m.category].label.toLowerCase().includes(ql));

    const hitsC = amount ? [] : Object.values(CATEGORIES)
      .filter((c) => c.label.toLowerCase().includes(ql))
      .map((c) => {
        const items = txns.filter((t) => t.category === c.id);
        return {
          ...c,
          count: items.length,
          spent: items.filter((t) => t.amount < 0)
            .reduce((n, t) => n + Math.abs(t.amount), 0),
        };
      });

    const hitsT = amount
      ? txns
        .filter((t) => Math.abs(Math.abs(t.amount) - amount) <= amount * TOLERANCE)
        .sort((a, b) =>
          Math.abs(Math.abs(a.amount) - amount) - Math.abs(Math.abs(b.amount) - amount))
      : txns
        .filter((t) =>
          t.merchant.toLowerCase().includes(ql)
          || CATEGORIES[t.category].label.toLowerCase().includes(ql)
          || (t.note ?? '').toLowerCase().includes(ql)
          || (t.place ?? '').toLowerCase().includes(ql))
        .sort((a, b) => b.at.localeCompare(a.at));

    return {
      merchants: hitsM,
      categories: hitsC,
      txns: hitsT,
      total: hitsM.length + hitsC.length + hitsT.length,
    };
  }, [ql, amount, merchants, txns]);

  /* Empty state: the places money actually goes, transfers and pay aside. */
  const suggestions = useMemo(
    () => merchants
      .filter((m) => m.category !== 'income' && m.category !== 'transfer')
      .slice(0, 5),
    [merchants],
  );

  const browse = useMemo(() => {
    const m = new Map<CategoryId, number>();
    for (const t of txns) {
      if (t.amount >= 0 || t.category === 'transfer') continue;
      m.set(t.category, (m.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => CATEGORIES[id]);
  }, [txns]);

  /* Scale of the haystack, and a real amount to demonstrate the amount query. */
  const scale = useMemo(() => {
    const cats = new Set(txns.map((t) => t.category));
    const latest = [...txns]
      .filter((t) => t.amount < 0)
      .sort((a, b) => b.at.localeCompare(a.at))[0];
    return {
      cats: cats.size,
      sample: latest ? Math.abs(latest.amount) : 0,
    };
  }, [txns]);

  /** "3 VISITS · 18 MAY" — visits only when there is more than one. */
  const rowMeta = (count: number, lastAt: string) =>
    `${count > 1 ? `${count} visits · ` : ''}${shortDate(lastAt)}`;

  const cap = (key: string, n: number) => (expanded[key] ? n : Math.min(n, key === 'txn' ? 6 : 4));
  const toggle = (key: string) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  return (
    <Screen>
      <TopBar onBack={back} right={<span className="sr__spacer" />} />

      <div className="sr__head">
        <form
          className="sr__field"
          role="search"
          onSubmit={(e) => { e.preventDefault(); commit(q); }}
        >
          <SearchIcon size={19} className="sr__fieldicon" />
          <input
            className="sr__input"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Merchant, place, note or amount"
            aria-label="Search your ledger"
            enterKeyHint="search"
          />
          <AnimatePresence>
            {q && (
              <motion.button
                type="button"
                className="sr__clear"
                aria-label="Clear search"
                onClick={() => setQ('')}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={snap}
              >
                <Close size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </form>

        <p className="sr__status" aria-live="polite">
          {!raw
            ? `${txns.length} transactions · ${scale.cats} categories · ${accounts.length} accounts`
            : amount
              ? `Payments within 10% of ${inr(amount)} — ${res.txns.length} found`
              : `${res.total} result${res.total === 1 ? '' : 's'} for “${raw}”`}
        </p>
      </div>

      <div className="pane pane--pad scroll-y sr__pane">
        {!raw ? (
          <Stack gap={0}>
            {recents.length > 0 && (
              <Rise>
                <div className="sr__sechead">
                  <Eyebrow>Recent</Eyebrow>
                  <button className="sr__clearall eyebrow" onClick={() => setHistory([])}>
                    Clear
                  </button>
                </div>
                <div className="sr__chips">
                  {recents.map((r) => {
                    const n = parseAmount(r);
                    return (
                      <motion.button
                        key={r}
                        className="sr__chip"
                        onClick={() => setQ(r)}
                        whileTap={{ scale: 0.96 }}
                        transition={snap}
                      >
                        {n ? inr(n) : r}
                      </motion.button>
                    );
                  })}
                </div>
              </Rise>
            )}

            <Rise style={{ paddingTop: recents.length > 0 ? 28 : 4 }}>
              <div className="sr__sechead">
                <Eyebrow>Where the money goes</Eyebrow>
                <span className="sr__count num">Top {suggestions.length}</span>
              </div>
            </Rise>

            {suggestions.map((m, i) => (
              <Rise key={m.id}>
                <MerchantRow
                  name={m.name}
                  sub={m.place ?? CATEGORIES[m.category].label}
                  icon={CATEGORIES[m.category].icon}
                  ink={CATEGORIES[m.category].ink}
                  amount={m.total}
                  meta={rowMeta(m.count, m.lastAt)}
                  q=""
                  onOpen={() => push({ name: 'merchant', id: m.id })}
                />
                {i < suggestions.length - 1 && <Rule inset={48} />}
              </Rise>
            ))}

            <Rise style={{ paddingTop: 28 }}>
              <Eyebrow>Browse by category</Eyebrow>
              <div className="sr__chips sr__chips--cat">
                {browse.map((c) => (
                  <motion.button
                    key={c.id}
                    className="sr__chip sr__chip--cat"
                    onClick={() => push({ name: 'category', id: c.id })}
                    whileTap={{ scale: 0.96 }}
                    transition={snap}
                  >
                    <span className="sr__catdot" style={{ background: INK_VAR[c.ink] }} />
                    {c.label}
                  </motion.button>
                ))}
              </div>
            </Rise>

            <Rise style={{ paddingTop: 26 }}>
              <div className="sr__tip">
                <span className="sr__tipicon"><IcSpark size={15} /></span>
                <p>
                  Half-remember a payment? Type the amount — <b>{inr(scale.sample)}</b> —
                  and everything within a tenth of it comes back.
                </p>
              </div>
            </Rise>
          </Stack>
        ) : res.total === 0 ? (
          <div>
            <Empty
              title="Nothing matches"
              body={amount
                ? `No payment sits within a tenth of ${inr(amount)}.`
                : `No merchant, category, note or place contains “${raw}”.`}
            />
            <div className="sr__rescue">
              <Eyebrow>Try instead</Eyebrow>
              <div className="sr__chips">
                {[...new Set([
                  ...suggestions.slice(0, 2).map((s) => s.name),
                  ...recents,
                ])].slice(0, 4).map((s) => {
                  const n = parseAmount(s);
                  return (
                    <motion.button
                      key={s}
                      className="sr__chip"
                      onClick={() => setQ(s)}
                      whileTap={{ scale: 0.96 }}
                      transition={snap}
                    >
                      {n ? inr(n) : s}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <motion.div key={ql} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade}>
            <Stack gap={0}>
              {res.merchants.length > 0 && (
                <>
                  <Rise>
                    <GroupHead title="Merchants" count={res.merchants.length} />
                  </Rise>
                  {res.merchants.slice(0, cap('mer', res.merchants.length)).map((m, i) => (
                    <Rise key={m.id}>
                      <MerchantRow
                        name={m.name}
                        sub={m.place ?? CATEGORIES[m.category].label}
                        icon={CATEGORIES[m.category].icon}
                        ink={CATEGORIES[m.category].ink}
                        amount={m.total}
                        meta={rowMeta(m.count, m.lastAt)}
                        q={ql}
                        onOpen={() => { commit(raw); push({ name: 'merchant', id: m.id }); }}
                      />
                      {i < cap('mer', res.merchants.length) - 1 && <Rule inset={48} />}
                    </Rise>
                  ))}
                  {res.merchants.length > 4 && (
                    <Rise>
                      <MoreButton
                        open={!!expanded.mer}
                        n={res.merchants.length - 4}
                        onClick={() => toggle('mer')}
                      />
                    </Rise>
                  )}
                </>
              )}

              {res.categories.length > 0 && (
                <>
                  <Rise style={{ paddingTop: res.merchants.length ? 26 : 0 }}>
                    <GroupHead title="Categories" count={res.categories.length} />
                  </Rise>
                  {res.categories.slice(0, cap('cat', res.categories.length)).map((c, i) => (
                    <Rise key={c.id}>
                      <motion.button
                        className="sr__row"
                        onClick={() => { commit(raw); push({ name: 'category', id: c.id }); }}
                        whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                        whileHover={{ x: 2 }}
                        transition={snap}
                      >
                        <CategoryBadge icon={c.icon} ink={c.ink} size={36} />
                        <span className="sr__rowbody">
                          <span className="sr__rowtitle"><Mark text={c.label} q={ql} /></span>
                          <span className="sr__rowsub">
                            {c.count} transaction{c.count === 1 ? '' : 's'} on record
                          </span>
                        </span>
                        <span className="sr__rowright">
                          <span className="sr__rowamt figure">{inr(c.spent)}</span>
                          <span className="sr__rowmeta">lifetime</span>
                        </span>
                        <ChevronRight size={16} className="sr__rowchev" />
                      </motion.button>
                      {i < cap('cat', res.categories.length) - 1 && <Rule inset={48} />}
                    </Rise>
                  ))}
                </>
              )}

              {res.txns.length > 0 && (
                <>
                  <Rise style={{ paddingTop: (res.merchants.length || res.categories.length) ? 26 : 0 }}>
                    <GroupHead
                      title={amount ? 'Payments near that figure' : 'Transactions'}
                      count={res.txns.length}
                    />
                  </Rise>
                  {res.txns.slice(0, cap('txn', res.txns.length)).map((t, i) => {
                    const cat = CATEGORIES[t.category];
                    const gap = amount ? Math.abs(t.amount) - amount : 0;
                    return (
                      <Rise key={t.id}>
                        <motion.button
                          className="sr__row"
                          onClick={() => { commit(raw); push({ name: 'txn', id: t.id }); }}
                          whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
                          whileHover={{ x: 2 }}
                          transition={snap}
                        >
                          <CategoryBadge icon={cat.icon} ink={cat.ink} size={36} />
                          <span className="sr__rowbody">
                            <span className="sr__rowtitle">
                              <Mark text={t.merchant} q={amount ? '' : ql} />
                            </span>
                            <span className="sr__rowsub">
                              {shortDate(t.at)} ·{' '}
                              {amount
                                ? (Math.round(gap) === 0
                                  ? 'exact match'
                                  : `${compactINR(Math.abs(gap))} ${gap > 0 ? 'above' : 'below'}`)
                                : <Mark text={t.note ?? t.place ?? cat.label} q={ql} />}
                            </span>
                          </span>
                          <span className="sr__rowright">
                            <span
                              className="sr__rowamt figure"
                              style={{ color: t.amount >= 0 ? 'var(--olive)' : 'var(--ink)' }}
                            >
                              {signedINR(t.amount)}
                            </span>
                            <span className="sr__rowmeta">{cat.label}</span>
                          </span>
                          <ChevronRight size={16} className="sr__rowchev" />
                        </motion.button>
                        {i < cap('txn', res.txns.length) - 1 && <Rule inset={48} />}
                      </Rise>
                    );
                  })}
                  {res.txns.length > 6 && (
                    <Rise>
                      <MoreButton
                        open={!!expanded.txn}
                        n={res.txns.length - 6}
                        onClick={() => toggle('txn')}
                      />
                    </Rise>
                  )}
                  <Rise style={{ paddingTop: 14 }}>
                    <p className="sr__foot">
                      {res.txns.length} transaction{res.txns.length === 1 ? '' : 's'} ·{' '}
                      {inr(res.txns.reduce((n, t) => n + Math.abs(t.amount), 0))} in all
                    </p>
                  </Rise>
                </>
              )}
            </Stack>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}

/* ---------------------------------------------------------------- */

function GroupHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="sr__sechead">
      <Eyebrow>{title}</Eyebrow>
      <span className="sr__count num">{count}</span>
    </div>
  );
}

function MoreButton({ open, n, onClick }: { open: boolean; n: number; onClick: () => void }) {
  return (
    <button className="sr__more" onClick={onClick}>
      {open ? 'Show fewer' : `Show ${n} more`}
    </button>
  );
}

function MerchantRow({
  name, sub, icon, ink, amount, meta, q, onOpen,
}: {
  name: string; sub: string; icon: string;
  ink: 'ink' | 'olive' | 'vermilion';
  amount: number; meta: string; q: string; onOpen: () => void;
}) {
  return (
    <motion.button
      className="sr__row"
      onClick={onOpen}
      whileTap={{ scale: 0.99, backgroundColor: 'rgba(13,57,150,0.04)' }}
      whileHover={{ x: 2 }}
      transition={snap}
    >
      <CategoryBadge icon={icon} ink={ink} size={36} />
      <span className="sr__rowbody">
        <span className="sr__rowtitle"><Mark text={name} q={q} /></span>
        <span className="sr__rowsub"><Mark text={sub} q={q} /></span>
      </span>
      <span className="sr__rowright">
        <span className="sr__rowamt figure">{inr(amount)}</span>
        <span className="sr__rowmeta">{meta}</span>
      </span>
      <ChevronRight size={16} className="sr__rowchev" />
    </motion.button>
  );
}
