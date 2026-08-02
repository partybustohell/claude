import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function NewGoal() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="NewGoal" />
    </Screen>
  );
}
