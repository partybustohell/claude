import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Categories() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Categories" />
    </Screen>
  );
}
