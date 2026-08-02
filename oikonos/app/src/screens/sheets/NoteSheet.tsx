import { useState } from 'react';
import { useTxn, useActions } from '../../data/store';
import { useNav } from '../../nav';
import { Button } from '../../components/ui';

export function NoteSheet({ txnId }: { txnId: string }) {
  const txn = useTxn(txnId);
  const { setNote } = useActions();
  const { closeSheet } = useNav();
  const [text, setText] = useState(txn?.note ?? '');

  if (!txn) return null;

  return (
    <>
      <div className="sheet__head">
        <div>
          <p className="sheet__title">Note</p>
          <p className="sheet__sub">{txn.merchant}</p>
        </div>
      </div>

      <textarea
        className="sheet__input"
        rows={5}
        autoFocus
        placeholder="What was this for?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Transaction note"
      />

      <div className="sheet__actions">
        <Button variant="outline" ink="ink" onClick={closeSheet} style={{ flex: '0 0 auto' }}>
          Cancel
        </Button>
        <Button ink="ink" full onClick={() => { setNote(txnId, text.trim()); closeSheet(); }}>
          Save note
        </Button>
      </div>
    </>
  );
}
