import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTxnDays, useApp, CATEGORIES } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, Eyebrow, Stack, Rise, CategoryBadge, Rule, Empty, IconButton,
} from '../components/ui';
import { Search, Close, Plus, IcRepeat } from '../components/icons';
import type { Txn } from '../data/types';
import { signedINR, relativeDay, time, inr } from '../lib/format';
import { snap, gentle, fade } from '../lib/motion';
import './Activity.css';
import { PlateFoot } from '../illustrations/place';

type Filter = 'all' | 'out' | 'in';

export function Activity() {
  const days = useTxnDays();
  const { now } = useApp();
  const { push, openSheet } = useNav();
  const nowDate = useMemo(() => new Date(now), [now]);

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return days
      .map((d) => ({
        ...d,
        items: d.items.filter((t) => {
          if (filter === 'out' && t.amount >= 0) return false;
          if (filter === 'in' && t.amount < 0) return false;
          if (!q) return true;
          return (
            t.merchant.toLowerCase().includes(q) ||
            CATEGORIES[t.category].label.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((d) => d.items.length > 0);
  }, [days, filter, query]);

  /* Transfers move money between the user's own accounts — a SIP or a goal
     deposit is not spending, and counting it here would overstate the
     month by a third. */
  const monthOut = useMemo(() => {
    const m = now.slice(0, 7);
    return days
      .flatMap((d) => d.items)
      .filter((t) => t.amount < 0 && t.category !== 'transfer' && t.at.slice(0, 7) === m)
      .reduce((n, t) => n + Math.abs(t.amount), 0);
  }, [days, now]);

  return (
    <Screen>
      <div className="act__head">
        <div className="act__headrow">
          <div>
            <Eyebrow>Activity</Eyebrow>
            <h1 className="act__title display">
              {searching ? 'Search' : 'This month'}
            </h1>
          </div>
          <div className="act__headacts">
            <IconButton
              label={searching ? 'Close search' : 'Search transactions'}
              onClick={() => { setSearching((v) => !v); setQuery(''); }}
            >
              {searching ? <Close size={19} /> : <Search size={19} />}
            </IconButton>
            <IconButton label="Add a transaction" onClick={() => openSheet({ kind: 'add' })}>
              <Plus size={20} />
            </IconButton>
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {searching ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={fade}
            >
              <input
                className="act__search"
                autoFocus
                placeholder="Merchant or category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search transactions"
              />
            </motion.div>
          ) : (
            <motion.p
              key="total"
              className="act__total"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={fade}
            >
              <span className="figure act__totalnum">{inr(monthOut)}</span>
              <span className="act__totallabel">spent since 1 May</span>
            </motion.p>
          )}
        </AnimatePresence>

        <div className="act__filters" role="tablist" aria-label="Filter">
          {([['all', 'All'], ['out', 'Money out'], ['in', 'Money in']] as const).map(
            ([id, label]) => {
              const on = filter === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={on}
                  className={`act__filter ${on ? 'act__filter--on' : ''}`}
                  onClick={() => setFilter(id)}
                >
                  {on && (
                    <motion.span className="act__filterpill" layoutId="act-filter"
                      transition={snap} aria-hidden />
                  )}
                  <span className="act__filterlabel">{label}</span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="pane scroll-y act__scroll">
        {shown.length === 0 ? (
          <Empty
            title="Nothing here"
            body={query ? `No transaction matches “${query}”.` : 'No activity for this filter yet.'}
          />
        ) : (
          <Stack gap={0} delay={0.02}>
            {shown.map((day) => (
              <Rise key={day.key}>
                <div className="act__daybar">
                  <Eyebrow>{relativeDay(day.at, nowDate)}</Eyebrow>
                  <span className="act__daysum num">{signedINR(day.total)}</span>
                </div>
                {day.items.map((t, i) => (
                  <div key={t.id}>
                    <Row txn={t} onOpen={() => push({ name: 'txn', id: t.id })} />
                    {i < day.items.length - 1 && <Rule inset={58} />}
                  </div>
                ))}
              </Rise>
            ))}
            <div className="act__foot">
              <p>{shown.reduce((n, d) => n + d.items.length, 0)} transactions</p>
            </div>
            {/* The ledger runs out and the street it was spent on begins.
                This pane has no side padding, so the plate is already flush. */}
            <PlateFoot plate="shopfront" height={196} flush tabbar />
          </Stack>
        )}
      </div>
    </Screen>
  );
}

function Row({ txn, onOpen }: { txn: Txn; onOpen: () => void }) {
  const cat = CATEGORIES[txn.category];
  const income = txn.amount >= 0;
  return (
    <motion.button
      className="act__row"
      onClick={onOpen}
      whileTap={{ scale: 0.985, backgroundColor: 'rgba(13,57,150,0.04)' }}
      whileHover={{ x: 2 }}
      transition={snap}
    >
      <CategoryBadge icon={cat.icon} ink={cat.ink} size={44} />
      <span className="act__rowbody">
        <span className="act__merchant">{txn.merchant}</span>
        <span className="act__meta">
          {time(txn.at)}
          {txn.recurring && (
            <span className="act__rep" title="Recurring">
              <IcRepeat size={11} />
            </span>
          )}
          <span className="act__cat">{cat.label}</span>
        </span>
      </span>
      <motion.span
        className="act__amount figure"
        style={{ color: income ? 'var(--olive)' : 'var(--ink)' }}
        variants={{ hidden: { opacity: 0, x: 6 }, show: { opacity: 1, x: 0, transition: gentle } }}
      >
        {signedINR(txn.amount)}
      </motion.span>
    </motion.button>
  );
}
