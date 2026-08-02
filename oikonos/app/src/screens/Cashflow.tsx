import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Cashflow() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Cashflow" />
    </Screen>
  );
}
