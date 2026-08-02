import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoal, useActions } from '../../data/store';
import { useNav } from '../../nav';
import { Button, Meter, Eyebrow } from '../../components/ui';
import { AmountDisplay, Keypad } from './Keypad';
import { inr } from '../../lib/format';
import { snap, gentle } from '../../lib/motion';

const PRESETS = [5000, 10000, 25000];

export function ContributeSheet({ goalId }: { goalId: string }) {
  const goal = useGoal(goalId);
  const { contribute } = useActions();
  const { closeSheet } = useNav();
  const [digits, setDigits] = useState('');

  if (!goal) return null;

  const amount = Number(digits || 0);
  const after = Math.min(goal.target, goal.saved + amount);
  const beforeRatio = goal.saved / goal.target;
  const afterRatio = after / goal.target;
  const completes = after >= goal.target;

  return (
    <>
      <div className="sheet__head">
        <div>
          <p className="sheet__title">Add to {goal.name}</p>
          <p className="sheet__sub">
            {inr(goal.saved)} of {inr(goal.target)} saved
          </p>
        </div>
      </div>

      <AmountDisplay digits={digits} />

      {/* Live preview of where this contribution lands the goal */}
      <div style={{ padding: '20px 0 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <Eyebrow>{completes ? 'Goal complete' : 'After this'}</Eyebrow>
          <motion.span
            key={after}
            className="num"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={gentle}
            style={{
              fontSize: 13, fontWeight: 700,
              color: completes ? 'var(--olive)' : 'var(--ink)',
            }}
          >
            {Math.round(afterRatio * 100)}%
          </motion.span>
        </div>

        {/* Ghost of the current position sits under the projected fill */}
        <div style={{ position: 'relative' }}>
          <Meter value={afterRatio} ink={completes ? 'olive' : 'ink'} height={10} />
          <span
            aria-hidden
            style={{
              position: 'absolute', top: -3, bottom: -3,
              left: `${beforeRatio * 100}%`, width: 2,
              background: 'var(--paper)', opacity: 0.9,
            }}
          />
        </div>
      </div>

      <div className="chiprow" style={{ justifyContent: 'flex-start', padding: '16px 0 2px' }}>
        {PRESETS.map((p) => (
          <motion.button
            key={p}
            className={`chip chip--num ${amount === p ? 'chip--on' : ''}`}
            onClick={() => setDigits(String(p))}
            whileTap={{ scale: 0.94 }}
            transition={snap}
          >
            {inr(p)}
          </motion.button>
        ))}
        <motion.button
          className="chip chip--num"
          onClick={() => setDigits(String(Math.max(0, goal.target - goal.saved)))}
          whileTap={{ scale: 0.94 }}
          transition={snap}
        >
          Finish it
        </motion.button>
      </div>

      <Keypad onPress={(fn) => setDigits(fn)} />

      <div className="sheet__actions">
        <Button variant="outline" ink="ink" onClick={closeSheet} style={{ flex: '0 0 auto' }}>
          Cancel
        </Button>
        <Button
          ink="olive"
          full
          disabled={amount <= 0}
          onClick={() => { contribute(goalId, amount); closeSheet(); }}
        >
          Add {amount > 0 ? inr(amount) : 'money'}
        </Button>
      </div>
    </>
  );
}
