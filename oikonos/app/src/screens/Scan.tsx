import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Scan() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Scan" />
    </Screen>
  );
}
