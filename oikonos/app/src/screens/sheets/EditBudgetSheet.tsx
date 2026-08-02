import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBudgetRows, useActions } from '../../data/store';
import { useNav } from '../../nav';
import { Button, Meter, CategoryBadge, Eyebrow } from '../../components/ui';
import { inr } from '../../lib/format';
import { snap, gentle } from '../../lib/motion';

const STEP = 500;

export function EditBudgetSheet({ budgetId }: { budgetId: string }) {
  const rows = useBudgetRows();
  const row = rows.find((r) => r.id === budgetId);
  const { setLimit } = useActions();
  const { closeSheet } = useNav();
  const [limit, setLocal] = useState(row?.limit ?? 0);

  if (!row) return null;

  const available = limit + row.rollover;
  const ratio = available > 0 ? row.spent / available : 0;
  const over = ratio > 1;

  return (
    <>
      <div className="sheet__head">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <CategoryBadge icon={row.meta.icon} ink={row.meta.ink} size={48} />
          <div>
            <p className="sheet__title">{row.meta.label}</p>
            <p className="sheet__sub">{inr(row.spent)} spent this month</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <Eyebrow>Monthly limit</Eyebrow>
        <motion.p
          key={limit}
          className="figure"
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={gentle}
          style={{ fontSize: 44, color: 'var(--ink)', marginTop: 8 }}
        >
          {inr(limit)}
        </motion.p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 18, padding: '18px 0 22px',
      }}>
        <Stepper label="Decrease limit" sign="−"
          onClick={() => setLocal((v) => Math.max(STEP, v - STEP))} />
        <input
          type="range"
          className="budget-range"
          min={STEP}
          max={60000}
          step={STEP}
          value={limit}
          onChange={(e) => setLocal(Number(e.target.value))}
          aria-label="Monthly limit"
          style={{ flex: 1, accentColor: 'var(--ink)' }}
        />
        <Stepper label="Increase limit" sign="+"
          onClick={() => setLocal((v) => Math.min(60000, v + STEP))} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <Eyebrow>{over ? 'Over by' : 'Left to spend'}</Eyebrow>
        <span className="num" style={{
          fontSize: 13, fontWeight: 700,
          color: over ? 'var(--vermilion)' : 'var(--olive)',
        }}>
          {inr(Math.abs(available - row.spent))}
        </span>
      </div>
      <Meter value={ratio} ink={over ? 'vermilion' : 'olive'} height={10} />

      {row.rollover !== 0 && (
        <p className="sheet__sub" style={{ marginTop: 12 }}>
          Includes {inr(Math.abs(row.rollover))}{' '}
          {row.rollover > 0 ? 'rolled over from April' : 'carried as April overspend'}.
        </p>
      )}

      <div className="sheet__actions">
        <Button variant="outline" ink="ink" onClick={closeSheet} style={{ flex: '0 0 auto' }}>
          Cancel
        </Button>
        <Button ink="ink" full onClick={() => { setLimit(budgetId, limit); closeSheet(); }}>
          Save limit
        </Button>
      </div>
    </>
  );
}

function Stepper({ sign, onClick, label }: { sign: string; onClick: () => void; label: string }) {
  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={snap}
      style={{
        width: 40, height: 40, borderRadius: '50%', flex: 'none',
        display: 'grid', placeItems: 'center',
        background: 'var(--paper-deep)', color: 'var(--ink)',
        fontSize: 20, fontWeight: 600, lineHeight: 1,
      }}
    >
      {sign}
    </motion.button>
  );
}
