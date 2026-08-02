import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Appearance() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Appearance" />
    </Screen>
  );
}
