import { Screen } from '../components/ui';

export function GoalDetail({ id }: { id: string }) {
  return <Screen><div style={{ padding: 24 }}>Goal {id}</div></Screen>;
}
