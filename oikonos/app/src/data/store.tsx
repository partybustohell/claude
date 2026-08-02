import {
  createContext, useContext, useMemo, useReducer, useCallback,
  type ReactNode, type Dispatch,
} from 'react';
import type { AppState, Txn, Goal, CategoryId, Settings } from './types';
import { SEED, YTD, CATEGORIES } from './seed';

/* ---------------------------------------------------------------- */
/* Reducer                                                            */
/* ---------------------------------------------------------------- */

export type Action =
  | { type: 'user/set'; user: AppState['user'] }
  | { type: 'txn/add'; txn: Omit<Txn, 'id'> }
  | { type: 'txn/remove'; id: string }
  | { type: 'txn/note'; id: string; note: string }
  | { type: 'txn/flag'; id: string }
  | { type: 'txn/recategorize'; id: string; category: CategoryId }
  | { type: 'goal/contribute'; id: string; amount: number }
  | { type: 'budget/limit'; id: string; limit: number }
  | { type: 'budget/add'; category: CategoryId; limit: number }
  | { type: 'budget/remove'; id: string }
  | { type: 'goal/add'; goal: Omit<Goal, 'id'> }
  | { type: 'goal/remove'; id: string }
  | { type: 'bill/pay'; id: string }
  | { type: 'bill/autopay'; id: string }
  | { type: 'sub/cancel'; id: string }
  | { type: 'notice/read'; id: string }
  | { type: 'notice/readAll' }
  | { type: 'app/disconnect'; id: string }
  | { type: 'settings/set'; patch: Partial<Settings> }
  | { type: 'settings/notify'; key: keyof Settings['notifications']; on: boolean };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    /* Whoever is signed in owns the greeting, the avatar and the handle. */
    case 'user/set':
      return s.user.name === a.user.name && s.user.handle === a.user.handle
        ? s
        : { ...s, user: a.user };
    case 'txn/add': {
      const id = `t${Math.random().toString(36).slice(2, 9)}`;
      return { ...s, txns: [{ ...a.txn, id }, ...s.txns] };
    }
    case 'txn/remove':
      return { ...s, txns: s.txns.filter((t) => t.id !== a.id) };
    case 'txn/note':
      return { ...s, txns: s.txns.map((t) => (t.id === a.id ? { ...t, note: a.note } : t)) };
    case 'txn/flag':
      return { ...s, txns: s.txns.map((t) => (t.id === a.id ? { ...t, flagged: !t.flagged } : t)) };
    case 'txn/recategorize':
      return { ...s, txns: s.txns.map((t) => (t.id === a.id ? { ...t, category: a.category } : t)) };
    case 'goal/contribute':
      return {
        ...s,
        goals: s.goals.map((g) =>
          g.id === a.id ? { ...g, saved: Math.min(g.target, g.saved + a.amount) } : g),
      };
    case 'budget/limit':
      return {
        ...s,
        budgets: s.budgets.map((b) => (b.id === a.id ? { ...b, limit: a.limit } : b)),
      };
    case 'budget/add': {
      const id = `b${Math.random().toString(36).slice(2, 8)}`;
      return { ...s, budgets: [...s.budgets, { id, category: a.category, limit: a.limit, rollover: 0 }] };
    }
    case 'budget/remove':
      return { ...s, budgets: s.budgets.filter((b) => b.id !== a.id) };
    case 'goal/add': {
      const id = `g${Math.random().toString(36).slice(2, 8)}`;
      return { ...s, goals: [...s.goals, { ...a.goal, id }] };
    }
    case 'goal/remove':
      return { ...s, goals: s.goals.filter((g) => g.id !== a.id) };
    case 'bill/pay':
      return {
        ...s,
        bills: s.bills.map((b) => (b.id === a.id ? { ...b, status: 'paid' as const } : b)),
      };
    case 'bill/autopay':
      return {
        ...s,
        bills: s.bills.map((b) => (b.id === a.id ? { ...b, autopay: !b.autopay } : b)),
      };
    case 'sub/cancel':
      return { ...s, subscriptions: s.subscriptions.filter((x) => x.id !== a.id) };
    case 'notice/read':
      return {
        ...s,
        notices: s.notices.map((n) => (n.id === a.id ? { ...n, read: true } : n)),
      };
    case 'notice/readAll':
      return { ...s, notices: s.notices.map((n) => ({ ...n, read: true })) };
    case 'app/disconnect':
      return { ...s, connected: s.connected.filter((c) => c.id !== a.id) };
    case 'settings/set':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'settings/notify':
      return {
        ...s,
        settings: {
          ...s.settings,
          notifications: { ...s.settings.notifications, [a.key]: a.on },
        },
      };
    default:
      return s;
  }
}

/* ---------------------------------------------------------------- */
/* Context                                                            */
/* ---------------------------------------------------------------- */

const StateCtx = createContext<AppState>(SEED);
const DispatchCtx = createContext<Dispatch<Action>>(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, SEED);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useApp = () => useContext(StateCtx);
export const useDispatch = () => useContext(DispatchCtx);

/* ---------------------------------------------------------------- */
/* Selectors                                                          */
/* ---------------------------------------------------------------- */

export function useNow(): Date {
  const { now } = useApp();
  return useMemo(() => new Date(now), [now]);
}

export function useTxn(id: string | null): Txn | undefined {
  const { txns } = useApp();
  return useMemo(() => txns.find((t) => t.id === id), [txns, id]);
}

export function useGoal(id: string | null): Goal | undefined {
  const { goals } = useApp();
  return useMemo(() => goals.find((g) => g.id === id), [goals, id]);
}

/** Transactions newest-first. */
export function useTxnsSorted(): Txn[] {
  const { txns } = useApp();
  return useMemo(
    () => [...txns].sort((a, b) => b.at.localeCompare(a.at)),
    [txns],
  );
}

/** Grouped into day sections for the activity screen. */
export function useTxnDays(): { key: string; at: string; items: Txn[]; total: number }[] {
  const sorted = useTxnsSorted();
  return useMemo(() => {
    const map = new Map<string, Txn[]>();
    for (const t of sorted) {
      const k = t.at.slice(0, 10);
      const arr = map.get(k);
      if (arr) arr.push(t); else map.set(k, [t]);
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      at: items[0].at,
      items,
      total: items.reduce((n, t) => n + t.amount, 0),
    }));
  }, [sorted]);
}

/** Spend-to-date per budget for the current month, plus derived state. */
export function useBudgetRows() {
  const { budgets, txns, now } = useApp();
  return useMemo(() => {
    const month = now.slice(0, 7);
    return budgets.map((b) => {
      const spent = txns
        .filter((t) => t.category === b.category && t.at.slice(0, 7) === month && t.amount < 0)
        .reduce((n, t) => n + Math.abs(t.amount), 0);
      const available = b.limit + b.rollover;
      const ratio = available > 0 ? spent / available : 0;
      return {
        ...b,
        meta: CATEGORIES[b.category],
        spent,
        available,
        remaining: available - spent,
        ratio,
        state: ratio > 1 ? 'over' : ratio > 0.85 ? 'tight' : 'ok',
      } as const;
    }).sort((a, b) => b.ratio - a.ratio);
  }, [budgets, txns, now]);
}

/** Month-to-date category breakdown, largest first. */
export function useCategorySpend() {
  const { txns, now } = useApp();
  return useMemo(() => {
    const month = now.slice(0, 7);
    const m = new Map<CategoryId, number>();
    for (const t of txns) {
      if (t.amount >= 0 || t.at.slice(0, 7) !== month) continue;
      m.set(t.category, (m.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    const total = [...m.values()].reduce((a, b) => a + b, 0) || 1;
    return [...m.entries()]
      .map(([id, amount]) => ({ id, amount, share: amount / total, meta: CATEGORIES[id] }))
      .sort((a, b) => b.amount - a.amount);
  }, [txns, now]);
}

export function useTotals() {
  const { accounts } = useApp();
  return useMemo(() => {
    const liquid = accounts.reduce((n, a) => n + a.balance, 0);
    return { ...YTD, liquid };
  }, [accounts]);
}

/* ---------------------------------------------------------------- */
/* Convenience action hooks                                           */
/* ---------------------------------------------------------------- */

export function useActions() {
  const d = useDispatch();
  return {
    addTxn: useCallback((t: Omit<Txn, 'id'>) => d({ type: 'txn/add', txn: t }), [d]),
    setNote: useCallback((id: string, note: string) => d({ type: 'txn/note', id, note }), [d]),
    toggleFlag: useCallback((id: string) => d({ type: 'txn/flag', id }), [d]),
    recategorize: useCallback((id: string, category: CategoryId) =>
      d({ type: 'txn/recategorize', id, category }), [d]),
    contribute: useCallback((id: string, amount: number) =>
      d({ type: 'goal/contribute', id, amount }), [d]),
    setLimit: useCallback((id: string, limit: number) =>
      d({ type: 'budget/limit', id, limit }), [d]),
    addBudget: useCallback((category: CategoryId, limit: number) =>
      d({ type: 'budget/add', category, limit }), [d]),
    removeBudget: useCallback((id: string) => d({ type: 'budget/remove', id }), [d]),
    addGoal: useCallback((goal: Omit<Goal, 'id'>) => d({ type: 'goal/add', goal }), [d]),
    removeGoal: useCallback((id: string) => d({ type: 'goal/remove', id }), [d]),
    payBill: useCallback((id: string) => d({ type: 'bill/pay', id }), [d]),
    toggleAutopay: useCallback((id: string) => d({ type: 'bill/autopay', id }), [d]),
    cancelSub: useCallback((id: string) => d({ type: 'sub/cancel', id }), [d]),
    readNotice: useCallback((id: string) => d({ type: 'notice/read', id }), [d]),
    readAllNotices: useCallback(() => d({ type: 'notice/readAll' }), [d]),
    disconnectApp: useCallback((id: string) => d({ type: 'app/disconnect', id }), [d]),
    setSetting: useCallback((patch: Partial<Settings>) =>
      d({ type: 'settings/set', patch }), [d]),
    setNotify: useCallback((key: keyof Settings['notifications'], on: boolean) =>
      d({ type: 'settings/notify', key, on }), [d]),
  };
}

export { CATEGORIES };

/* ================================================================
   Full-app selectors
   ================================================================ */

/** Slug a merchant name so it can live in a route. */
export function merchantId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Every merchant the ledger knows, with its totals. */
export function useMerchants() {
  const { txns } = useApp();
  return useMemo(() => {
    const m = new Map<string, {
      id: string; name: string; category: CategoryId;
      total: number; count: number; lastAt: string; place?: string;
    }>();
    for (const t of txns) {
      const id = merchantId(t.merchant);
      const cur = m.get(id);
      if (cur) {
        cur.total += Math.abs(t.amount);
        cur.count += 1;
        if (t.at > cur.lastAt) { cur.lastAt = t.at; cur.place = t.place ?? cur.place; }
      } else {
        m.set(id, {
          id, name: t.merchant, category: t.category,
          total: Math.abs(t.amount), count: 1, lastAt: t.at, place: t.place,
        });
      }
    }
    return [...m.values()].sort((a, b) => b.total - a.total);
  }, [txns]);
}

export function useMerchant(id: string | null) {
  const all = useMerchants();
  const { txns } = useApp();
  return useMemo(() => {
    const meta = all.find((m) => m.id === id);
    if (!meta) return undefined;
    const items = txns
      .filter((t) => merchantId(t.merchant) === id)
      .sort((a, b) => b.at.localeCompare(a.at));
    return { ...meta, items };
  }, [all, txns, id]);
}

/** Everything the ledger holds for one account. */
export function useAccount(id: string | null) {
  const { accounts, txns } = useApp();
  return useMemo(() => {
    const acct = accounts.find((a) => a.id === id);
    if (!acct) return undefined;
    const items = txns
      .filter((t) => t.accountId === id)
      .sort((a, b) => b.at.localeCompare(a.at));
    const out = items.filter((t) => t.amount < 0).reduce((n, t) => n + Math.abs(t.amount), 0);
    const inn = items.filter((t) => t.amount > 0).reduce((n, t) => n + t.amount, 0);
    return { ...acct, items, out, in: inn };
  }, [accounts, txns, id]);
}

/** One category's month, its trend, and its transactions. */
export function useCategory(id: CategoryId | null) {
  const { txns, budgets, now, history } = useApp();
  return useMemo(() => {
    if (!id) return undefined;
    const meta = CATEGORIES[id];
    const items = txns
      .filter((t) => t.category === id)
      .sort((a, b) => b.at.localeCompare(a.at));
    const month = now.slice(0, 7);
    const spent = items
      .filter((t) => t.at.slice(0, 7) === month && t.amount < 0)
      .reduce((n, t) => n + Math.abs(t.amount), 0);
    const budget = budgets.find((b) => b.category === id);

    /* Per-month totals across the seeded history window. */
    const byMonth = history.map((h) => {
      const m = h.month.slice(0, 7);
      const v = items
        .filter((t) => t.at.slice(0, 7) === m && t.amount < 0)
        .reduce((n, t) => n + Math.abs(t.amount), 0);
      return { month: m, value: v };
    });

    return { id, meta, items, spent, budget, byMonth };
  }, [txns, budgets, now, history, id]);
}

/** Bills grouped by urgency, soonest first. */
export function useBills() {
  const { bills } = useApp();
  return useMemo(() => {
    const rank = { overdue: 0, due: 1, scheduled: 2, paid: 3 } as const;
    return [...bills].sort(
      (a, b) => rank[a.status] - rank[b.status] || a.due.localeCompare(b.due),
    );
  }, [bills]);
}

export function useBill(id: string | null) {
  const { bills } = useApp();
  return useMemo(() => bills.find((b) => b.id === id), [bills, id]);
}

/** Subscriptions with a normalised monthly cost, dearest first. */
export function useSubscriptions() {
  const { subscriptions } = useApp();
  return useMemo(() => {
    const rows = subscriptions.map((s) => ({
      ...s,
      perMonth: s.amount / s.everyMonths,
      meta: CATEGORIES[s.category],
    }));
    rows.sort((a, b) => b.perMonth - a.perMonth);
    return {
      rows,
      perMonth: rows.reduce((n, r) => n + r.perMonth, 0),
      perYear: rows.reduce((n, r) => n + (r.amount * 12) / r.everyMonths, 0),
    };
  }, [subscriptions]);
}

export function useContributions(goalId: string | null) {
  const { contributions } = useApp();
  return useMemo(
    () => contributions
      .filter((c) => c.goalId === goalId)
      .sort((a, b) => b.at.localeCompare(a.at)),
    [contributions, goalId],
  );
}

export function usePayee(id: string | null) {
  const { payees } = useApp();
  return useMemo(() => payees.find((p) => p.id === id), [payees, id]);
}

export function useNotices() {
  const { notices } = useApp();
  return useMemo(() => ({
    rows: [...notices].sort((a, b) => b.at.localeCompare(a.at)),
    unread: notices.filter((n) => !n.read).length,
  }), [notices]);
}

export function useSettings() {
  return useApp().settings;
}

/** Monthly cashflow with a running balance, for the cashflow screen. */
export function useCashflow() {
  const { history } = useApp();
  return useMemo(() => history.map((h) => ({
    ...h,
    net: h.income - h.expenses,
    rate: (h.income - h.expenses) / h.income,
  })), [history]);
}
