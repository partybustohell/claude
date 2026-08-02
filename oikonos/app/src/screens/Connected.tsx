import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Connected() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Connected" />
    </Screen>
  );
}
