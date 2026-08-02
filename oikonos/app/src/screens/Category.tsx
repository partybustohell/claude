import { Screen, TopBar } from "../components/ui";
import { useNav } from "../nav";

export function Category({ id }: { id: string }) {
  const { back } = useNav();
  return (
    <Screen>
      <TopBar onBack={back} title="Category" />
      <div style={{ padding: 24 }}>{id}</div>
    </Screen>
  );
}
