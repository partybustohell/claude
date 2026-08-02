import {
  createContext, useCallback, useContext, useMemo, useState,
  type ReactNode,
} from 'react';

/** Tabs live at the root of the stack; everything else is pushed on top. */
export type Tab = 'home' | 'activity' | 'budgets' | 'goals';

export type Route =
  /* tabs */
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'activity' }
  | { name: 'budgets' }
  | { name: 'goals' }
  /* money */
  | { name: 'txn'; id: string }
  | { name: 'merchant'; id: string }
  | { name: 'search' }
  | { name: 'recurring' }
  | { name: 'transfer' }
  | { name: 'payee'; id: string }
  | { name: 'bills' }
  | { name: 'bill'; id: string }
  | { name: 'scan' }
  /* accounts */
  | { name: 'accounts' }
  | { name: 'account'; id: string }
  | { name: 'addAccount' }
  /* categories */
  | { name: 'categories' }
  | { name: 'category'; id: string }
  /* budgets */
  | { name: 'budget'; id: string }
  | { name: 'newBudget' }
  /* goals */
  | { name: 'goal'; id: string }
  | { name: 'newGoal' }
  | { name: 'goalHistory'; id: string }
  /* insight */
  | { name: 'insights' }
  | { name: 'report' }
  | { name: 'networth' }
  | { name: 'cashflow' }
  | { name: 'subscriptions' }
  /* account & app */
  | { name: 'profile' }
  | { name: 'notifications' }
  | { name: 'settings' }
  | { name: 'appearance' }
  | { name: 'notifySettings' }
  | { name: 'security' }
  | { name: 'currency' }
  | { name: 'connected' }
  | { name: 'help' }
  | { name: 'about' };

/** Every route name, for the capture harness and for exhaustiveness checks. */
export const ROUTE_NAMES = [
  'welcome', 'home', 'activity', 'budgets', 'goals',
  'txn', 'merchant', 'search', 'recurring', 'transfer', 'payee',
  'bills', 'bill', 'scan',
  'accounts', 'account', 'addAccount',
  'categories', 'category',
  'budget', 'newBudget',
  'goal', 'newGoal', 'goalHistory',
  'insights', 'report', 'networth', 'cashflow', 'subscriptions',
  'profile', 'notifications', 'settings', 'appearance', 'notifySettings',
  'security', 'currency', 'connected', 'help', 'about',
] as const;

export const TABS: Tab[] = ['home', 'activity', 'budgets', 'goals'];

export function isTab(r: Route): r is Route & { name: Tab } {
  return (TABS as string[]).includes(r.name);
}

interface Nav {
  route: Route;
  /**
   * Which way the content travels. +1 sends it leftwards — the new screen
   * arrives from the right, which is what a push and a rightwards tab move
   * both look like. −1 sends it rightwards, for a pop or a leftwards tab
   * move. 0 is a crossfade with no travel at all.
   */
  dir: number;
  stack: Route[];
  push: (r: Route) => void;
  back: () => void;
  /** Replace the whole stack — used for the welcome → app handoff */
  reset: (r: Route) => void;
  /** Lateral move between tabs, does not grow the stack */
  goTab: (t: Tab) => void;
  /** Bottom sheet currently presented over the stack */
  sheet: Sheet;
  openSheet: (s: Sheet) => void;
  closeSheet: () => void;
}

export type Sheet =
  | null
  | { kind: 'add' }
  | { kind: 'contribute'; goalId: string }
  | { kind: 'editBudget'; budgetId: string }
  | { kind: 'note'; txnId: string }
  | { kind: 'category'; txnId: string };

const NavCtx = createContext<Nav>(null as unknown as Nav);

/**
 * Which way a lateral move between two tabs travels. The tab bar is a
 * spatial row: Goals sits to the right of Home, so reaching it should send
 * the content leftwards exactly as a push does. Comparing the two positions
 * in `TABS` is the whole rule.
 */
function tabDir(from: Route, to: Tab): number {
  const a = (TABS as string[]).indexOf(from.name);
  const b = (TABS as string[]).indexOf(to);
  if (a === -1 || b === -1 || a === b) return 0;
  return b > a ? 1 : -1;
}

/** Stack and direction move together — a screen must never render against
 *  the direction of the move that produced it. */
interface NavState { stack: Route[]; dir: number }

export function NavProvider({
  initial, initialSheet, children,
}: { initial?: Route; initialSheet?: Sheet; children: ReactNode }) {
  const [{ stack, dir }, setNav] = useState<NavState>(() => {
    const r = initial ?? { name: 'welcome' };
    /*
     * A pushed screen needs something under it.
     *
     * The capture harness addresses any screen directly, and seeding the
     * stack with just that screen puts the app in a state it can never
     * reach by use: a detail screen at the BOTTOM of the stack, where
     * `back`'s length guard makes its own back button inert. The whole
     * app audit found it on thirty-four screens at once, which is the
     * shape of a harness fault rather than a drawing of one — but the
     * screens really were unleavable in that state, and a harness that
     * can only reach impossible states proves nothing about real ones.
     *
     * Tabs and welcome are roots and stand alone. Everything else was
     * pushed from somewhere, so it gets home beneath it.
     */
    const stack0 = isTab(r) || r.name === 'welcome'
      ? [r]
      : [{ name: 'home' } as Route, r];
    return { stack: stack0, dir: 1 };
  });
  const [sheet, setSheet] = useState<Sheet>(initialSheet ?? null);

  const push = useCallback((r: Route) => {
    setNav((n) => ({ stack: [...n.stack, r], dir: 1 }));
  }, []);

  const back = useCallback(() => {
    setNav((n) => (n.stack.length > 1
      ? { stack: n.stack.slice(0, -1), dir: -1 }
      : n));
  }, []);

  const reset = useCallback((r: Route) => {
    setNav({ stack: [r], dir: 1 });
  }, []);

  const goTab = useCallback((t: Tab) => {
    setNav((n) => ({
      stack: [{ name: t } as Route],
      dir: tabDir(n.stack[n.stack.length - 1], t),
    }));
  }, []);

  const value = useMemo<Nav>(() => ({
    route: stack[stack.length - 1],
    dir, stack, push, back, reset, goTab,
    sheet,
    openSheet: (s: Sheet) => setSheet(s),
    closeSheet: () => setSheet(null),
  }), [stack, dir, push, back, reset, goTab, sheet]);

  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}

export const useNav = () => useContext(NavCtx);

/** A stable key so <AnimatePresence> can tell screens apart. */
export function routeKey(r: Route): string {
  return 'id' in r ? `${r.name}:${r.id}` : r.name;
}
