import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Search() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Search" />
    </Screen>
  );
}
