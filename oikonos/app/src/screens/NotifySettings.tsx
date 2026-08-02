import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function NotifySettings() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="NotifySettings" />
    </Screen>
  );
}
