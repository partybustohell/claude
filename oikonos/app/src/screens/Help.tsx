import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Help() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Help" />
    </Screen>
  );
}
