import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function AddAccount() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="AddAccount" />
    </Screen>
  );
}
