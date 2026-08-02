import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Currency() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Currency" />
    </Screen>
  );
}
