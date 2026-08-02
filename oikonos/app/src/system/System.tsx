import { useEffect, useState } from 'react';
import { ROUTE_NAMES } from '../nav';
import { ALL_TOKEN_NAMES } from './tokens';
import { Principles } from './sections/Principles';
import { Colour } from './sections/Colour';
import { Typography } from './sections/Typography';
import { Layout } from './sections/Layout';
import { MotionSection } from './sections/MotionSection';
import { Iconography } from './sections/Iconography';
import { Components } from './sections/Components';
import { DataViz } from './sections/DataViz';
import { Patterns } from './sections/Patterns';
import { Content } from './sections/Content';
import { Accessibility } from './sections/Accessibility';
import { Governance } from './sections/Governance';
import './system.css';

const CHAPTERS = [
  { id: 'principles', label: 'Principles' },
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Typography' },
  { id: 'layout', label: 'Space & surface' },
  { id: 'motion', label: 'Motion' },
  { id: 'icons', label: 'Iconography' },
  { id: 'components', label: 'Components' },
  { id: 'charts', label: 'Data' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'content', label: 'Content' },
  { id: 'a11y', label: 'Accessibility' },
  { id: 'working', label: 'Working in it' },
];

/** Highlights the chapter currently closest to the top of the viewport. */
function useCurrentChapter(): string {
  const [current, setCurrent] = useState(CHAPTERS[0].id);

  useEffect(() => {
    const sections = CHAPTERS
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const onScroll = () => {
      let best = sections[0]?.id ?? CHAPTERS[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= 140) best = el.id;
      }
      setCurrent(best);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return current;
}

function Masthead() {
  const facts = [
    { n: '4', label: 'inks' },
    { n: String(ALL_TOKEN_NAMES.length), label: 'tokens' },
    { n: '4', label: 'springs' },
    { n: String(ROUTE_NAMES.length), label: 'routes' },
    { n: '0', label: 'greys' },
  ];

  return (
    <header className="masthead tex-ink">
      <div className="masthead__inner">
        <p className="masthead__mark">Oikonos · Design System</p>
        <h1 className="masthead__title">A Mediterranean risograph, printed at 390&nbsp;points.</h1>
        <p className="masthead__sub">
          Every value on this page is read from the running stylesheet, and
          every specimen is the component the app ships. It is a reference you
          can trust to be wrong only when the system is.
        </p>
        <div className="masthead__facts">
          {facts.map((f) => (
            <div className="masthead__fact" key={f.label}>
              <b className="num">{f.n}</b>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function System() {
  const current = useCurrentChapter();

  return (
    <div className="ds">
      <Masthead />

      <div className="ds__shell">
        <nav className="ds__nav" aria-label="Sections">
          <span className="ds__navhead">Contents</span>
          {CHAPTERS.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className={`ds__navlink ${current === c.id ? 'ds__navlink--on' : ''}`}
              aria-current={current === c.id ? 'true' : undefined}
            >
              {c.label}
            </a>
          ))}
        </nav>

        <main className="ds__main">
          <Principles />
          <Colour />
          <Typography />
          <Layout />
          <MotionSection />
          <Iconography />
          <Components />
          <DataViz />
          <Patterns />
          <Content />
          <Accessibility />
          <Governance />
        </main>
      </div>

      <footer className="dsfoot">
        <p>
          Oikonos design system · values from <code className="code">src/styles/tokens.css</code>,
          components from <code className="code">src/components/ui.tsx</code>,
          guarded by <code className="code">npm run audit</code>.
        </p>
      </footer>
    </div>
  );
}
