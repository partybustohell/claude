import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Settings() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Settings" />
    </Screen>
  );
}
