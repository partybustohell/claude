import {
  createContext, useCallback, useContext, useMemo, useState,
  type ReactNode,
} from 'react';

/** Tabs live at the root of the stack; everything else is pushed on top. */
export type Tab = 'home' | 'activity' | 'budgets' | 'goals';

export type Route =
  /* account — reachable signed out */
  | { name: 'welcome' }
  | { name: 'signup' }
  | { name: 'signin' }
  | { name: 'forgot' }
  /* the code is handed over in the route because nothing mails it */
  | { name: 'reset'; email?: string; code?: string }
  /* tabs */
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
  'welcome', 'signup', 'signin', 'forgot', 'reset',
  'home', 'activity', 'budgets', 'goals',
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

/**
 * The only screens reachable without an account. Everything else shows
 * somebody's money, so the shell sends a signed-out visitor back to the
 * welcome screen rather than rendering it — including when the screen
 * was deep-linked.
 */
export const PUBLIC_ROUTES = ['welcome', 'signup', 'signin', 'forgot', 'reset'] as const;

export function isPublic(r: Route): boolean {
  return (PUBLIC_ROUTES as readonly string[]).includes(r.name);
}

interface Nav {
  route: Route;
  /** +1 pushing forward, −1 popping back, 0 for a lateral tab switch */
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

export function NavProvider({
  initial, initialSheet, children,
}: { initial?: Route; initialSheet?: Sheet; children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([initial ?? { name: 'welcome' }]);
  const [dir, setDir] = useState(1);
  const [sheet, setSheet] = useState<Sheet>(initialSheet ?? null);

  const push = useCallback((r: Route) => {
    setDir(1);
    setStack((s) => [...s, r]);
  }, []);

  const back = useCallback(() => {
    setDir(-1);
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const reset = useCallback((r: Route) => {
    setDir(1);
    setStack([r]);
  }, []);

  const goTab = useCallback((t: Tab) => {
    setDir(0);
    setStack([{ name: t } as Route]);
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
