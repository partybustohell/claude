import { motion } from 'framer-motion';
import { snap } from '../../lib/motion';
import { groupINR } from '../../lib/format';
import { INK_VAR, type Ink } from '../../components/ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'];

export function AmountDisplay({
  digits, prefix = '₹', tone = 'ink',
}: { digits: string; prefix?: string; tone?: Ink }) {
  const empty = digits === '';
  return (
    <div
      className="amountfield"
      style={{ color: empty ? 'var(--fg-faint)' : INK_VAR[tone] }}
      aria-live="polite"
    >
      <span className="amountfield__cur">{prefix}</span>
      <motion.span
        key={digits.length}
        initial={{ opacity: 0.55, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={snap}
      >
        {empty ? '0' : groupINR(Number(digits))}
      </motion.span>
      <span
        className="amountfield__caret"
        style={{ background: INK_VAR[tone] }}
        aria-hidden
      />
    </div>
  );
}

function Backspace() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M8.4 2.6h14a2 2 0 0 1 2 2v10.8a2 2 0 0 1-2 2h-14L1.6 10l6.8-7.4Z" />
      <path d="m12.6 7 5.4 6M18 7l-5.4 6" />
    </svg>
  );
}

/**
 * Digits are held as a string so a leading zero and an in-progress "1"
 * both behave the way a physical keypad should; the display regroups
 * into lakhs on every press.
 */
export function Keypad({
  onPress, max = 9, compact = false,
}: { onPress: (next: (d: string) => string) => void; max?: number; compact?: boolean }) {
  return (
    <div className={`keypad ${compact ? 'keypad--compact' : ''}`}
      role="group" aria-label="Amount keypad">
      {KEYS.map((k) => (
        <motion.button
          key={k}
          className={`key ${k === 'del' ? 'key--fn' : ''}`}
          aria-label={k === 'del' ? 'Delete' : k}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(13,57,150,0.10)' }}
          transition={snap}
          onClick={() => onPress((d) => {
            if (k === 'del') return d.slice(0, -1);
            const next = (d + k).replace(/^0+(?=\d)/, '');
            return next.length > max ? d : next;
          })}
        >
          {k === 'del' ? <Backspace /> : k}
        </motion.button>
      ))}
    </div>
  );
}
