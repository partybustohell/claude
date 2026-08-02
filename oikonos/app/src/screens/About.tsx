import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function About() {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="About" />
    </Screen>
  );
}
