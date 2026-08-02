import { useTxn, useActions } from '../../data/store';
import type { CategoryId } from '../../data/types';
import { useNav } from '../../nav';
import { CatCell } from './CatPick';

const ORDER: CategoryId[] = [
  'food', 'groceries', 'transport', 'home',
  'shopping', 'bills', 'health', 'entertainment',
  'travel', 'education', 'transfer', 'income',
];

export function CategorySheet({ txnId }: { txnId: string }) {
  const txn = useTxn(txnId);
  const { recategorize } = useActions();
  const { closeSheet } = useNav();

  if (!txn) return null;

  return (
    <>
      <div className="sheet__head">
        <div>
          <p className="sheet__title">Category</p>
          <p className="sheet__sub">{txn.merchant}</p>
        </div>
      </div>

      <div className="catgrid">
        {ORDER.map((id) => (
          <CatCell
            key={id}
            id={id}
            on={txn.category === id}
            onSelect={() => { recategorize(txnId, id); closeSheet(); }}
          />
        ))}
      </div>
    </>
  );
}
