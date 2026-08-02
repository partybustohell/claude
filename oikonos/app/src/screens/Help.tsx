import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Group, Row, Stack, Rise, Rule,
} from '../components/ui';
import { ChevronDown, IcBook, IcUser, IcLeaf, IcSpark } from '../components/icons';
import { gentle, snap } from '../lib/motion';
import './Help.css';
import { PlateFoot } from '../illustrations/place';

const FAQ = [
  {
    q: 'Where does Oikonos get my transactions?',
    a: 'From the accounts you connect. Each bank is read through its own\
 consented feed — Oikonos never asks for a banking password, and it cannot\
 move money on your behalf.',
  },
  {
    q: 'Why does a transfer not count as spending?',
    a: 'A SIP or a goal deposit moves money between accounts you already own,\
 so counting it as spending would double-count it against your budgets.\
 Transfers appear in Activity but sit outside the month’s spend total.',
  },
  {
    q: 'What does “rolled over” mean on an envelope?',
    a: 'Whatever an envelope did not spend last month is carried into this one,\
 and an overspend is carried as a debt. The available figure is always the\
 limit plus the rollover, which is why it rarely equals the round number you set.',
  },
  {
    q: 'How is “on track” decided for a goal?',
    a: 'Oikonos divides what is left by the months remaining and compares that\
 against your monthly contribution. If the contribution covers it you are on\
 track — no allowance is made for a windfall that has not happened yet.',
  },
  {
    q: 'Can I use Oikonos without connecting a bank?',
    a: 'Yes. Every screen works on transactions you add by hand, and the\
 keypad exists for exactly that. Connecting a bank only saves typing.',
  },
];

export function Help() {
  const { back, push } = useNav();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y help__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Support"
              title="Help"
              sub="The five things people ask most, then a way to reach a person."
            />
          </Rise>

          <Rise>
            <div className="help__faq">
              {FAQ.map((f, i) => {
                const on = open === i;
                return (
                  <div key={f.q}>
                    <motion.button
                      className="help__q"
                      onClick={() => setOpen(on ? null : i)}
                      aria-expanded={on}
                      whileTap={{ scale: 0.995 }}
                      transition={snap}
                    >
                      <span>{f.q}</span>
                      <motion.span
                        className="help__chev"
                        animate={{ rotate: on ? 180 : 0 }}
                        transition={gentle}
                        aria-hidden
                      >
                        <ChevronDown size={17} />
                      </motion.span>
                    </motion.button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          className="help__a"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={gentle}
                        >
                          <p>{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {i < FAQ.length - 1 && <Rule />}
                  </div>
                );
              })}
            </div>
          </Rise>

          <Rise style={{ paddingTop: 26 }}>
            <Group title="Reach us">
              <Row icon={<IcUser size={17} />} ink="ink" title="Message support"
                sub="Usually answered within a day" />
              <Row icon={<IcBook size={17} />} title="Guides"
                sub="Envelopes, goals, and reading the pace marker" />
              <Row icon={<IcSpark size={17} />} title="Request a feature" />
            </Group>
          </Rise>

          <Rise>
            <Group title="Legal">
              <Row icon={<IcLeaf size={17} />} ink="olive" title="Privacy"
                sub="What is stored, and where" chevron
                onClick={() => push({ name: 'about' })} />
              <Row title="Terms of use" chevron onClick={() => push({ name: 'about' })} />
            </Group>
          </Rise>
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="colophon" height={196} />
        </Stack>
      </div>
    </Screen>
  );
}
