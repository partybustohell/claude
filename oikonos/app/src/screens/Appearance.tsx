import { useSettings, useActions } from '../data/store';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Choice, Row, Toggle, Stack, Rise,
} from '../components/ui';
import { inr } from '../lib/format';
import './Settings.css';
import { PlateFoot } from '../illustrations/place';

const TEXTURES = [
  { id: 'full' as const, label: 'Full texture', sub: 'Paper tooth and ink grain, as printed.' },
  { id: 'subtle' as const, label: 'Subtle', sub: 'A whisper of grain. Easier on older screens.' },
  { id: 'off' as const, label: 'Plain', sub: 'Flat ink. Fastest, and kindest to battery.' },
];

export function Appearance() {
  const { back } = useNav();
  const s = useSettings();
  const { setSetting } = useActions();

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y setpage__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="App"
              title="Appearance"
              sub="Oikonos is printed, not rendered. How much of the press you want to see is up to you."
            />
          </Rise>

          {/* A live sample, so the choice is not abstract */}
          <Rise>
            <div
              className={`setpage__demo ${s.texture === 'off' ? '' : 'tex-ink'}`}
              style={{ ['--tex-ink' as string]: s.texture === 'subtle' ? 0.07 : 0.16 }}
            >
              <span className="setpage__demolabel">Net worth</span>
              <p className="figure setpage__demonum">{inr(874350)}</p>
            </div>
          </Rise>

          <Rise>
            <Group>
              {TEXTURES.map((t) => (
                <Choice
                  key={t.id}
                  selected={s.texture === t.id}
                  label={t.label}
                  sub={t.sub}
                  onSelect={() => setSetting({ texture: t.id })}
                />
              ))}
            </Group>
          </Rise>

          <Rise>
            <Group
              title="Motion"
              caption="Reduced motion keeps every spring but collapses it to its
                       end state, so nothing moves without being asked."
            >
              <Row
                title="Reduce motion"
                sub="No count-ups, no sliding sheets"
                trailing={
                  <Toggle
                    label="Reduce motion"
                    on={s.motion === 'reduced'}
                    onChange={(v) => setSetting({ motion: v ? 'reduced' : 'full' })}
                  />
                }
              />
            </Group>
          </Rise>

          <Rise>
            <Group
              title="Privacy"
              caption="With figures hidden, amounts are replaced by a rule until
                       you tap them — useful on a train."
            >
              <Row
                title="Hide figures"
                sub="Blur every amount until tapped"
                trailing={
                  <Toggle
                    label="Hide figures"
                    on={s.privacy}
                    onChange={(v) => setSetting({ privacy: v })}
                  />
                }
              />
            </Group>
          </Rise>

          <Rise>
            <p className="setpage__note">
              Your device already asks for reduced motion system-wide, and
              Oikonos honours that whatever is set here.
            </p>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={190} />
        </Stack>
      </div>
    </Screen>
  );
}
