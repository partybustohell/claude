/**
 * TRANSACTION DETAIL
 *
 * A single receipt printed edge to edge on the pine field. The type stack
 * runs down the upper third — category, merchant, amount, when — and the
 * café still life carries the rest of the page.
 *
 * The amount is the one contrast problem on this screen: vermilion on pine
 * is barely 1.5:1 as a pure pair. It is solved the way a press would solve
 * it — a cream plate laid down a hair up-and-left of the red one, so every
 * glyph carries a lit edge. The figure reads instantly and the trick is
 * period-correct rather than a workaround.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Screen, Amount, Eyebrow, IconButton, Rise, Stack, Rule } from '../components/ui';
import { ArrowLeft, More, Pencil } from '../components/icons';
import { useApp, useTxn, CATEGORIES } from '../data/store';
import { longDateTime } from '../lib/format';
import { useNav } from '../nav';
import { gentle, snap } from '../lib/motion';
import { TxnCafeTable } from '../illustrations/TxnCafeTable';
import './TxnDetail.css';

export function TxnDetail({ id }: { id: string }) {
  const txn = useTxn(id);
  const { accounts } = useApp();
  const { back, push, openSheet } = useNav();
  const reduce = useReducedMotion();

  if (!txn) {
    return (
      <Screen tone="olive" className="txn">
        <div className="txn__tone" aria-hidden />
        <p className="txn__missing display">That transaction is no longer here.</p>
      </Screen>
    );
  }

  const cat = CATEGORIES[txn.category];
  const account = accounts.find((a) => a.id === txn.accountId);
  const openNote = () => openSheet({ kind: 'note', txnId: txn.id });

  const chrome = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: { ...gentle, delay },
        };

  return (
    <Screen tone="olive" className="txn">
      <div className="txn__tone" aria-hidden />
      <TxnCafeTable className="txn__illo" />

      {/* ---- chrome ---- */}
      <motion.div className="txn__bar" {...chrome(0.04)}>
        <motion.button
          className="txn__navbtn"
          onClick={back}
          aria-label="Back"
          whileTap={{ scale: 0.86, x: -3 }}
          whileHover={{ x: -2 }}
          transition={snap}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <IconButton
          bordered={false}
          tone="var(--on-olive)"
          label="Transaction options"
          onClick={() => openSheet({ kind: 'category', txnId: txn.id })}
        >
          <More size={24} />
        </IconButton>
      </motion.div>

      {/* ---- the receipt ---- */}
      <Stack className="txn__head" gap={0} delay={0.08}>
        <Rise className="txn__cat" y={12}>
          <Eyebrow tone="var(--on-olive)" style={{ letterSpacing: '0.132em' }}>
            {cat.label}
          </Eyebrow>
        </Rise>

        <Rise y={14}>
          <h1 className="display txn__merchant">{txn.merchant}</h1>
        </Rise>

        <Rise y={14}>
          <p className="txn__amount" aria-label={`${txn.amount < 0 ? 'Spent' : 'Received'} ${Math.abs(txn.amount)} rupees`}>
            <Amount value={txn.amount} duration={1250} />
          </p>
        </Rise>

        <Rise y={10}>
          <p className="txn__when num">
            {longDateTime(txn.at)}
            {txn.recurring && <span className="txn__rep"> · Recurring</span>}
          </p>
        </Rise>
      </Stack>

      {/* ---- footer ---- */}
      <div className="txn__foot">
        <motion.div
          className="txn__chips"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.62 } } }}
        >
          {account && (
            <motion.button
              type="button"
              className="txn__chip"
              variants={chipVariant(reduce)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -1 }}
              transition={snap}
              onClick={() => push({ name: 'accounts' })}
            >
              <span className="txn__dot" aria-hidden />
              {account.name}
              <span className="txn__tail">·{account.tail}</span>
            </motion.button>
          )}
          {txn.place && (
            <motion.span className="txn__chip txn__chip--quiet" variants={chipVariant(reduce)}>
              <Pin />
              {txn.place}
            </motion.span>
          )}
        </motion.div>

        <motion.div
          className="txn__rulewrap"
          initial={reduce ? undefined : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.7 }}
        >
          <Rule tone="rgba(246, 241, 226, 0.28)" />
        </motion.div>

        <motion.div
          className="txn__notebar"
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.76 }}
        >
          <motion.button
            type="button"
            className={`txn__note${txn.note ? '' : ' txn__note--empty'}`}
            onClick={openNote}
            whileTap={{ scale: 0.985, opacity: 0.8 }}
            transition={snap}
          >
            {txn.note ?? 'Add note'}
          </motion.button>
          <IconButton
            bordered={false}
            tone="var(--on-olive)"
            label={txn.note ? 'Edit note' : 'Add note'}
            onClick={openNote}
          >
            <Pencil size={22} />
          </IconButton>
        </motion.div>
      </div>
    </Screen>
  );
}

const chipVariant = (reduce: boolean | null) =>
  reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: gentle },
      };

function Pin() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden
      style={{ flex: 'none', marginRight: 1 }}>
      <path d="M5.5 12.2C8 9 9.6 6.9 9.6 5.1A4.1 4.1 0 0 0 1.4 5.1c0 1.8 1.6 3.9 4.1 7.1Z"
        stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="5.5" cy="5" r="1.45" fill="currentColor" />
    </svg>
  );
}
