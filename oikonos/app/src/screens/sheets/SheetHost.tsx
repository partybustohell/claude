import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { useNav, type Sheet } from '../../nav';
import { sheetVariants, surface, fade } from '../../lib/motion';
import { AddTxnSheet } from './AddTxnSheet';
import { ContributeSheet } from './ContributeSheet';
import { NoteSheet } from './NoteSheet';
import { CategorySheet } from './CategorySheet';
import { EditBudgetSheet } from './EditBudgetSheet';
import './sheets.css';

/**
 * Presents one bottom sheet over the whole stack. The sheet is
 * drag-dismissable: fling it past a velocity threshold, or drag it
 * more than a third of its height, and it leaves — otherwise it
 * springs home, carrying its momentum.
 */
export function SheetHost({ sheet }: { sheet: Sheet }) {
  const { closeSheet } = useNav();

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSheet(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, closeSheet]);

  return (
    <AnimatePresence>
      {sheet && (
        <div className="sheetlayer" key="layer">
          <motion.button
            className="sheetlayer__scrim"
            aria-label="Dismiss"
            onClick={closeSheet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          />
          <SheetSurface key={sheetKey(sheet)}>
            {renderSheet(sheet)}
          </SheetSurface>
        </div>
      )}
    </AnimatePresence>
  );
}

function sheetKey(s: NonNullable<Sheet>): string {
  return Object.values(s).join(':');
}

function renderSheet(s: NonNullable<Sheet>): ReactNode {
  switch (s.kind) {
    case 'add':         return <AddTxnSheet />;
    case 'contribute':  return <ContributeSheet goalId={s.goalId} />;
    case 'note':        return <NoteSheet txnId={s.txnId} />;
    case 'category':    return <CategorySheet txnId={s.txnId} />;
    case 'editBudget':  return <EditBudgetSheet budgetId={s.budgetId} />;
  }
}

function SheetSurface({ children }: { children: ReactNode }) {
  const { closeSheet } = useNav();
  const controls = useDragControls();

  return (
    <motion.div
      className="sheet tex-paper"
      variants={sheetVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.03, bottom: 0.7 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 130 || info.velocity.y > 780) closeSheet();
      }}
      transition={surface}
      role="dialog"
      aria-modal="true"
    >
      {/* Only the grabber starts a drag, so inputs inside stay usable */}
      <div
        className="sheet__grabber"
        onPointerDown={(e) => controls.start(e)}
        aria-hidden
      >
        <span />
      </div>
      <div className="sheet__body">{children}</div>
    </motion.div>
  );
}
