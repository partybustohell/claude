import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Subscriptions() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Subscriptions" />
    </Screen>
  );
}
