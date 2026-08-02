import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Recurring() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Recurring" />
    </Screen>
  );
}
