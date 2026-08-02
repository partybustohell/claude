import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PhoneFrame, StatusBar, HomeIndicator } from './components/PhoneFrame';
import { TabBar } from './components/TabBar';
import {
  NavProvider, useNav, routeKey, isTab, isPublic, type Route, type Sheet,
} from './nav';
import { StoreProvider } from './data/store';
import { AuthProvider, useAuth } from './data/auth';
import { pageVariants } from './lib/motion';
import './App.css';

import { Welcome } from './screens/Welcome';
import { SignUp } from './screens/auth/SignUp';
import { SignIn } from './screens/auth/SignIn';
import { Forgot } from './screens/auth/Forgot';
import { Reset } from './screens/auth/Reset';
import { Merchant } from './screens/Merchant';
import { Search } from './screens/Search';
import { Recurring } from './screens/Recurring';
import { Transfer } from './screens/Transfer';
import { Payee } from './screens/Payee';
import { Bills } from './screens/Bills';
import { Bill } from './screens/Bill';
import { Scan } from './screens/Scan';
import { Account } from './screens/Account';
import { AddAccount } from './screens/AddAccount';
import { Categories } from './screens/Categories';
import { Category } from './screens/Category';
import { BudgetDetail } from './screens/BudgetDetail';
import { NewBudget } from './screens/NewBudget';
import { NewGoal } from './screens/NewGoal';
import { GoalHistory } from './screens/GoalHistory';
import { Report } from './screens/Report';
import { NetWorth } from './screens/NetWorth';
import { Cashflow } from './screens/Cashflow';
import { Subscriptions } from './screens/Subscriptions';
import { Profile } from './screens/Profile';
import { Notifications } from './screens/Notifications';
import { Settings } from './screens/Settings';
import { Appearance } from './screens/Appearance';
import { NotifySettings } from './screens/NotifySettings';
import { Security } from './screens/Security';
import { Currency } from './screens/Currency';
import { Connected } from './screens/Connected';
import { Help } from './screens/Help';
import { About } from './screens/About';
import { Home } from './screens/Home';
import { Activity } from './screens/Activity';
import { Budgets } from './screens/Budgets';
import { Goals } from './screens/Goals';
import { TxnDetail } from './screens/TxnDetail';
import { GoalDetail } from './screens/GoalDetail';
import { Accounts } from './screens/Accounts';
import { Insights } from './screens/Insights';
import { SheetHost } from './screens/sheets/SheetHost';

/**
 * Screens printed on a saturated ink field. These need cream status-bar
 * glyphs AND a matching ground behind the safe area — otherwise a cream
 * band sits above the artwork where the status bar is.
 */
const DARK_ROUTES: Record<string, 'ink' | 'olive'> = {
  welcome: 'ink',
  txn: 'olive',
  scan: 'ink',
};

function renderRoute(r: Route) {
  switch (r.name) {
    case 'welcome':  return <Welcome />;
    case 'signup':   return <SignUp />;
    case 'signin':   return <SignIn />;
    case 'forgot':   return <Forgot />;
    case 'reset':    return <Reset email={r.email} code={r.code} />;
    case 'home':     return <Home />;
    case 'activity': return <Activity />;
    case 'budgets':  return <Budgets />;
    case 'goals':    return <Goals />;
    case 'txn':      return <TxnDetail id={r.id} />;
    case 'goal':     return <GoalDetail id={r.id} />;
    case 'accounts': return <Accounts />;
    case 'insights': return <Insights />;

    case 'merchant':       return <Merchant id={r.id} />;
    case 'search':         return <Search />;
    case 'recurring':      return <Recurring />;
    case 'transfer':       return <Transfer />;
    case 'payee':          return <Payee id={r.id} />;
    case 'bills':          return <Bills />;
    case 'bill':           return <Bill id={r.id} />;
    case 'scan':           return <Scan />;
    case 'account':        return <Account id={r.id} />;
    case 'addAccount':     return <AddAccount />;
    case 'categories':     return <Categories />;
    case 'category':       return <Category id={r.id} />;
    case 'budget':         return <BudgetDetail id={r.id} />;
    case 'newBudget':      return <NewBudget />;
    case 'newGoal':        return <NewGoal />;
    case 'goalHistory':    return <GoalHistory id={r.id} />;
    case 'report':         return <Report />;
    case 'networth':       return <NetWorth />;
    case 'cashflow':       return <Cashflow />;
    case 'subscriptions':  return <Subscriptions />;
    case 'profile':        return <Profile />;
    case 'notifications':  return <Notifications />;
    case 'settings':       return <Settings />;
    case 'appearance':     return <Appearance />;
    case 'notifySettings': return <NotifySettings />;
    case 'security':       return <Security />;
    case 'currency':       return <Currency />;
    case 'connected':      return <Connected />;
    case 'help':           return <Help />;
    case 'about':          return <About />;

    default:         return <Home />;
  }
}

const WELCOME: Route = { name: 'welcome' };

function Shell() {
  const { route: requested, dir, sheet, reset } = useNav();
  const { user } = useAuth();

  /**
   * The guard is the render, not just a redirect: a signed-out visitor
   * who deep-links to `?screen=accounts` must never see a frame of it.
   * The effect then straightens the stack out behind the substitution.
   */
  const locked = !user && !isPublic(requested);
  const route = locked ? WELCOME : requested;

  useEffect(() => {
    if (locked) reset(WELCOME);
  }, [locked, reset]);

  const tone = DARK_ROUTES[route.name];
  const dark = Boolean(tone);
  const showTabs = isTab(route);

  return (
    <div className="app-root" data-ground={tone ?? 'paper'}>
      <StatusBar tone={dark ? 'paper' : 'ink'} />

      <div className="app-body">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={routeKey(route)}
            className="app-page"
            custom={dir}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderRoute(route)}
          </motion.div>
        </AnimatePresence>
      </div>

      {showTabs && <TabBar />}
      {!showTabs && <HomeIndicator tone={dark ? 'paper' : 'ink'} />}

      <SheetHost sheet={locked ? null : sheet} />
    </div>
  );
}

/** The capture harness addresses any screen (and any sheet) by query string. */
function deepLink(): { route?: Route; sheet?: Sheet } {
  const p = new URLSearchParams(window.location.search);
  const screen = p.get('screen');
  const id = p.get('id');
  const kind = p.get('sheet');

  const route = screen
    ? ({ name: screen, ...(id ? { id } : {}) } as Route)
    : undefined;

  let sheet: Sheet = null;
  if (kind === 'add') sheet = { kind: 'add' };
  else if (kind === 'contribute' && id) sheet = { kind: 'contribute', goalId: id };
  else if (kind === 'note' && id) sheet = { kind: 'note', txnId: id };
  else if (kind === 'category' && id) sheet = { kind: 'category', txnId: id };
  else if (kind === 'editBudget' && id) sheet = { kind: 'editBudget', budgetId: id };

  return { route, sheet: sheet ?? undefined };
}

/**
 * A stored session is the whole point of a session: with one, the app
 * opens on home rather than making you walk past the welcome screen
 * again. A deep link still wins — the guard in `Shell` decides whether
 * it is allowed to render.
 */
function Routed() {
  const { user } = useAuth();
  const { route, sheet } = deepLink();
  const initial = route ?? (user ? { name: 'home' as const } : { name: 'welcome' as const });

  return (
    <NavProvider initial={initial} initialSheet={sheet}>
      <PhoneFrame>
        <Shell />
      </PhoneFrame>
    </NavProvider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      {/* auth sits inside the store so the signed-in name reaches the
          ledger's greeting, and outside the nav so the guard can read it */}
      <AuthProvider>
        <Routed />
      </AuthProvider>
    </StoreProvider>
  );
}
