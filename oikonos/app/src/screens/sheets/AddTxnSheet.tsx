import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, useActions } from '../../data/store';
import type { CategoryId } from '../../data/types';
import { useNav } from '../../nav';
import { Button } from '../../components/ui';
import { AmountDisplay, Keypad } from './Keypad';
import { CatCell } from './CatPick';
import { shortDate } from '../../lib/format';
import { snap } from '../../lib/motion';

const QUICK: CategoryId[] = [
  'food', 'groceries', 'transport', 'home',
  'shopping', 'bills', 'health', 'entertainment',
];

export function AddTxnSheet() {
  const { accounts, now } = useApp();
  const { addTxn } = useActions();
  const { closeSheet } = useNav();

  const [digits, setDigits] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [merchant, setMerchant] = useState('');
  const [income, setIncome] = useState(false);

  const amount = Number(digits || 0);
  const ready = amount > 0 && merchant.trim().length > 0;

  function save() {
    if (!ready) return;
    addTxn({
      merchant: merchant.trim(),
      category: income ? 'income' : category,
      amount: income ? amount : -amount,
      at: now,
      accountId,
    });
    closeSheet();
  }

  return (
    <>
      <div className="sheet__head">
        <div>
          <p className="sheet__title">New entry</p>
          <p className="sheet__sub">
            {income ? 'Money in' : 'Money out'} · {shortDate(now)}
          </p>
        </div>
        <Segmented
          value={income ? 'in' : 'out'}
          options={[{ id: 'out', label: 'Out' }, { id: 'in', label: 'In' }]}
          onChange={(v) => setIncome(v === 'in')}
        />
      </div>

      <AmountDisplay digits={digits} tone={income ? 'olive' : 'ink'} />

      <input
        className="sheet__input"
        style={{ marginTop: 16 }}
        placeholder={income ? 'Where did it come from?' : 'Where did it go?'}
        value={merchant}
        onChange={(e) => setMerchant(e.target.value)}
        aria-label="Merchant"
      />

      {!income && (
        <div className="catrail" role="group" aria-label="Category">
          {QUICK.map((id) => (
            <CatCell key={id} id={id} on={category === id}
              onSelect={() => setCategory(id)} size={42} />
          ))}
        </div>
      )}

      <div className="field" style={{ paddingBottom: 6 }}>
        <span className="field__label">Account</span>
        <div className="chiprow">
          {accounts.slice(0, 3).map((a) => (
            <motion.button
              key={a.id}
              className={`chip ${accountId === a.id ? 'chip--on' : ''}`}
              onClick={() => setAccountId(a.id)}
              whileTap={{ scale: 0.94 }}
              transition={snap}
            >
              {a.name.split(' ')[0]}
            </motion.button>
          ))}
        </div>
      </div>

      <Keypad onPress={(fn) => setDigits(fn)} compact />

      <div className="sheet__actions">
        <Button variant="outline" ink="ink" onClick={closeSheet} style={{ flex: '0 0 auto' }}>
          Cancel
        </Button>
        <Button ink={income ? 'olive' : 'vermilion'} full disabled={!ready} onClick={save}>
          {income ? 'Add income' : 'Add expense'}
        </Button>
      </div>
    </>
  );
}

/** Two-state segmented control with a spring-tracked selection pill. */
function Segmented({
  value, options, onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={on}
            className={`segmented__opt ${on ? 'segmented__opt--on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            {on && (
              <motion.span className="segmented__pill" layoutId="seg-pill"
                transition={snap} aria-hidden />
            )}
            <span className="segmented__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { Segmented };
