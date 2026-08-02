import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function NetWorth() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="NetWorth" />
    </Screen>
  );
}
