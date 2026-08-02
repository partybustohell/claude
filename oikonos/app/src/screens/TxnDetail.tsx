import { Screen } from '../components/ui';

export function TxnDetail({ id }: { id: string }) {
  return <Screen tone="olive"><div style={{ padding: 24 }}>Txn {id}</div></Screen>;
}
