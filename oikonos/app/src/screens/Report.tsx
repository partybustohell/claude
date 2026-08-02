import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Report() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Report" />
    </Screen>
  );
}
