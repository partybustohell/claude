import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Bills() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Bills" />
    </Screen>
  );
}
