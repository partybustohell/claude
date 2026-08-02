import { AnimatePresence, motion } from 'framer-motion';
import { PhoneFrame, StatusBar, HomeIndicator } from './components/PhoneFrame';
import { TabBar } from './components/TabBar';
import { NavProvider, useNav, routeKey, isTab, type Route } from './nav';
import { StoreProvider } from './data/store';
import { pageVariants } from './lib/motion';
import './App.css';

import { Welcome } from './screens/Welcome';
import { Home } from './screens/Home';
import { Activity } from './screens/Activity';
import { Budgets } from './screens/Budgets';
import { Goals } from './screens/Goals';
import { TxnDetail } from './screens/TxnDetail';
import { GoalDetail } from './screens/GoalDetail';
import { Accounts } from './screens/Accounts';
import { Insights } from './screens/Insights';
import { SheetHost } from './screens/sheets/SheetHost';

/** Screens whose chrome is printed on a saturated ink field. */
const DARK_ROUTES = new Set(['welcome', 'txn']);

function renderRoute(r: Route) {
  switch (r.name) {
    case 'welcome':  return <Welcome />;
    case 'home':     return <Home />;
    case 'activity': return <Activity />;
    case 'budgets':  return <Budgets />;
    case 'goals':    return <Goals />;
    case 'txn':      return <TxnDetail id={r.id} />;
    case 'goal':     return <GoalDetail id={r.id} />;
    case 'accounts': return <Accounts />;
    case 'insights': return <Insights />;
    default:         return <Home />;
  }
}

function Shell() {
  const { route, dir, sheet } = useNav();
  const dark = DARK_ROUTES.has(route.name);
  const showTabs = isTab(route);

  return (
    <div className="app-root">
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

      <SheetHost sheet={sheet} />
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const start = params.get('screen');
  const id = params.get('id');
  const initial = start
    ? ({ name: start, ...(id ? { id } : {}) } as Route)
    : undefined;

  return (
    <StoreProvider>
      <NavProvider initial={initial}>
        <PhoneFrame>
          <Shell />
        </PhoneFrame>
      </NavProvider>
    </StoreProvider>
  );
}
