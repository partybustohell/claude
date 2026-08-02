import { useNav } from '../nav';
import {
  Screen, TopBar, Group, Row, Stack, Rise, Eyebrow,
} from '../components/ui';
import './About.css';

const CREDITS = [
  ['Display', 'Fraunces, by Undercase Type'],
  ['Text', 'Inter, by Rasmus Andersson'],
  ['Illustration', 'Drawn in vector, printed in four inks'],
  ['Built with', 'React, TypeScript, Framer Motion'],
];

export function About() {
  const { back, push } = useNav();

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y about__scroll">
        <Stack gap={0}>
          <Rise>
            <div className="about__mark">
              <span className="about__word">OIKONOS</span>
              <span className="about__tag">Money, made clear.</span>
            </div>
          </Rise>

          <Rise>
            <p className="about__body">
              Oikonos takes its name from <i>oikonomia</i> — the running of a
              household. Not markets, not portfolios: the ordinary arithmetic
              of a life, set down clearly enough to be worth looking at.
            </p>
          </Rise>

          <Rise>
            <p className="about__body">
              Every figure here is printed in one of four inks on one paper.
              There is no grey in the palette, because grey is what a number
              looks like when nobody decided what it meant.
            </p>
          </Rise>

          <Rise style={{ paddingTop: 26 }}>
            <Group title="Version">
              <Row title="Oikonos" value="1.4.0 (318)" />
              <Row title="Ledger" value="25 transactions" />
              <Row title="Last sync" value="Today, 9:41 AM" />
            </Group>
          </Rise>

          <Rise>
            <Group title="Made with">
              {CREDITS.map(([k, v]) => <Row key={k} title={k} value={v} />)}
            </Group>
          </Rise>

          <Rise>
            <Group title="Legal">
              <Row title="Privacy policy" chevron />
              <Row title="Terms of use" chevron />
              <Row title="Open-source licences" chevron
                onClick={() => push({ name: 'help' })} />
            </Group>
          </Rise>

          <Rise>
            <div className="about__foot">
              <Eyebrow>Made in New Delhi</Eyebrow>
            </div>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
