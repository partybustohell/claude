import {
  createContext, useContext, useMemo, useReducer, useCallback,
  type ReactNode, type Dispatch,
} from 'react';
import type { AppState, Txn, Goal, CategoryId } from './types';
import { SEED, YTD, CATEGORIES } from './seed';

/* ---------------------------------------------------------------- */
/* Reducer                                                            */
/* ---------------------------------------------------------------- */

export type Action =
  | { type: 'txn/add'; txn: Omit<Txn, 'id'> }
  | { type: 'txn/remove'; id: string }
  | { type: 'txn/note'; id: string; note: string }
  | { type: 'txn/flag'; id: string }
  | { type: 'txn/recategorize'; id: string; category: CategoryId }
  | { type: 'goal/contribute'; id: string; amount: number }
  | { type: 'budget/limit'; id: string; limit: number };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
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
  };
}

export { CATEGORIES };
