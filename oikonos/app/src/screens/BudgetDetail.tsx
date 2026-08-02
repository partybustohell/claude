import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function BudgetDetail({ id }: { id: string }) {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="BudgetDetail" />
      <div style={{ padding: 24 }}>{id}</div>
    </Screen>
  );
}
