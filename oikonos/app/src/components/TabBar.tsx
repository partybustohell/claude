import { motion } from 'framer-motion';
import { TABS, useNav, type Tab } from '../nav';
import { TabHome, TabActivity, TabBudgets, TabGoals } from './icons';
import { snap, gentle } from '../lib/motion';
import './TabBar.css';

const ICONS = {
  home: TabHome, activity: TabActivity, budgets: TabBudgets, goals: TabGoals,
} as const;

const LABELS: Record<Tab, string> = {
  home: 'Home', activity: 'Activity', budgets: 'Budgets', goals: 'Goals',
};

export function TabBar() {
  const { route, goTab } = useNav();
  const active = route.name as Tab;

  return (
    <nav className="tabbar tex-paper" aria-label="Primary">
      <div className="tabbar__rule" aria-hidden />
      {TABS.map((t) => {
        const Icon = ICONS[t];
        const on = active === t;
        return (
          <motion.button
            key={t}
            className={`tab ${on ? 'tab--on' : ''}`}
            onClick={() => goTab(t)}
            aria-current={on ? 'page' : undefined}
            whileTap={{ scale: 0.9 }}
            transition={snap}
          >
            <span className="tab__iconwrap">
              {on && (
                <motion.span
                  className="tab__halo"
                  layoutId="tab-halo"
                  transition={gentle}
                  aria-hidden
                />
              )}
              <motion.span
                className="tab__icon"
                animate={{ y: on ? -1 : 0, scale: on ? 1.04 : 1 }}
                transition={gentle}
              >
                <Icon size={23} active={on} />
              </motion.span>
            </span>
            <span className="tab__label eyebrow">{LABELS[t]}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
