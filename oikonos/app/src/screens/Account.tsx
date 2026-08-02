import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Account({ id }: { id: string }) {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Account" />
      <div style={{ padding: 24 }}>{id}</div>
    </Screen>
  );
}
