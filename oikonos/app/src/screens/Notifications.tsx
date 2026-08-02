import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Notifications() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Notifications" />
    </Screen>
  );
}
