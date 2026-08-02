import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Screen, TopBar, IconButton, Button, Meter, Amount, Eyebrow, Stack, Rise, Empty,
} from '../components/ui';
import { More } from '../components/icons';
import { GoalAcropolis } from '../illustrations/GoalAcropolis';
import { useNav } from '../nav';
import { useGoal, useActions } from '../data/store';
import { inr, monthLabel, clamp, pctOf } from '../lib/format';
import { gentle, snap } from '../lib/motion';
import './GoalDetail.css';

export function GoalDetail({ id }: { id: string }) {
  const { back, push, openSheet } = useNav();
  const { contribute } = useActions();
  const goal = useGoal(id);
  const [menu, setMenu] = useState(false);

  if (!goal) {
    return (
      <Screen className="goal">
        <TopBar onBack={back} />
        <Empty title="Goal not found" body="This goal is no longer on your list." />
      </Screen>
    );
  }

  const ratio = clamp(goal.saved / goal.target, 0, 1);
  /* Floor, never round: a goal is only as far along as it has actually got. */
  // shared with the goals list so one number never renders two ways
  const percent = pctOf(goal.saved, goal.target);

  const addMoney = () => {
    setMenu(false);
    openSheet({ kind: 'contribute', goalId: goal.id });
  };

  return (
    <Screen className="goal">
      <GoalAcropolis className="goal__illo" />

      <div className="goal__fg">
        <div className="goal__bar">
          <TopBar
            onBack={back}
            right={(
              <span className="goal__more">
                <IconButton
                  label="Goal options"
                  bordered={false}
                  onClick={() => setMenu((m) => !m)}
                >
                  <More size={22} />
                </IconButton>
              </span>
            )}
          />
        </div>

        <Stack gap={0} delay={0.06} className="goal__head">
          <Rise><Eyebrow tone="var(--ink)">Goal</Eyebrow></Rise>

          <Rise>
            <h1 className="goal__title">{goal.name}</h1>
          </Rise>

          <Rise>
            <Amount value={goal.saved} className="goal__figure" duration={1600} />
            <span className="goal__of">of {inr(goal.target)}</span>
          </Rise>

          <Rise>
            <div className="goal__progress">
              <div className="goal__track">
                <Meter
                  value={ratio}
                  ink="olive"
                  height={10}
                  delay={0.34}
                  track="var(--olive-wash)"
                />
              </div>
              <span className="goal__pct">{percent}%</span>
            </div>
          </Rise>

          <Rise>
            <p className="goal__meta">
              {inr(goal.monthly)} a month
              <span className="goal__dot" aria-hidden>•</span>
              target {monthLabel(goal.by)}
            </p>
          </Rise>
        </Stack>
      </div>

      <motion.div
        className="goal__foot"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...gentle, delay: 0.5 }}
      >
        <Button className="goal__cta" ink="vermilion" full onClick={addMoney}>
          Add money
        </Button>
      </motion.div>

      <AnimatePresence>
        {menu && (
          <>
            <motion.button
              className="goal__scrim"
              aria-label="Dismiss menu"
              onClick={() => setMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="goal__menu"
              role="menu"
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6, transition: { duration: 0.12 } }}
              transition={snap}
            >
              <motion.button role="menuitem" onClick={addMoney} whileTap={{ scale: 0.97 }} transition={snap}>
                Add money
              </motion.button>
              <motion.button
                role="menuitem"
                whileTap={{ scale: 0.97 }}
                transition={snap}
                onClick={() => { contribute(goal.id, goal.monthly); setMenu(false); }}
              >
                Save this month now
                <span className="goal__menu-sub">{inr(goal.monthly)}</span>
              </motion.button>
              <motion.button
                role="menuitem"
                whileTap={{ scale: 0.97 }}
                transition={snap}
                onClick={() => { setMenu(false); push({ name: 'activity' }); }}
              >
                See contributions
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Screen>
  );
}
