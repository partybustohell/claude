import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function NewBudget() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="NewBudget" />
    </Screen>
  );
}
