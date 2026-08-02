import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Security() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Security" />
    </Screen>
  );
}
