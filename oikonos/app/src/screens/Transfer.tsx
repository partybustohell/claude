import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Transfer() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Transfer" />
    </Screen>
  );
}
