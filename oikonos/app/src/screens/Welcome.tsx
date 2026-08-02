import { motion, useReducedMotion } from 'framer-motion';
import { Screen, Button } from '../components/ui';
import { ArrowRight } from '../components/icons';
import { useNav } from '../nav';
import { gentle, reveal } from '../lib/motion';
import { WelcomeCliff } from '../illustrations/WelcomeCliff';
import './Welcome.css';

const WORD = 'OIKONOS';
/** The counter that carries the eclipse — the O between K and N. */
const ECLIPSE_AT = 3;

export function Welcome() {
  const { reset } = useNav();
  const reduce = useReducedMotion();

  const letter = {
    hidden: { opacity: 0, y: 22, filter: 'blur(7px)' },
    show: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: reduce ? { duration: 0 } : reveal,
    },
  };

  return (
    <Screen tone="ink" className="welcome">
      <div className="welcome__tone" aria-hidden />

      <WelcomeCliff className="welcome__illo" />

      <header className="welcome__head">
        <motion.h1
          className="welcome__mark"
          aria-label="Oikonos"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.075, delayChildren: 0.1 } },
          }}
        >
          {WORD.split('').map((ch, i) => (
            <motion.span
              key={i}
              className={`welcome__ltr${i === ECLIPSE_AT ? ' welcome__ltr--eclipse' : ''}`}
              variants={letter}
              aria-hidden
            >
              {ch}
              {i === ECLIPSE_AT && <Eclipse reduce={!!reduce} />}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="welcome__tag"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { ...gentle, delay: 0.86 }}
        >
          Money, made clear.
        </motion.p>
      </header>

      <motion.div
        className="welcome__foot"
        initial={reduce ? undefined : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { ...gentle, delay: 1.04 }}
      >
        <Button
          className="welcome__cta"
          ink="paper"
          full
          style={{ boxShadow: 'var(--w-cta-shadow)' }}
          trailing={<ArrowRight size={21} />}
          onClick={() => reset({ name: 'home' })}
        >
          Get started
        </Button>
      </motion.div>
    </Screen>
  );
}

/**
 * The eclipse living in the counter of the fourth letter: a cream disc
 * that a cobalt shadow slides across until only a crescent is left.
 */
function Eclipse({ reduce }: { reduce: boolean }) {
  return (
    <svg className="welcome__eclipse" viewBox="0 0 24 24" aria-hidden focusable="false">
      <defs>
        <mask id="welcome-eclipse-mask">
          <circle cx="12" cy="12" r="7.4" fill="#fff" />
          <motion.circle
            cy="11.2" r="7.4" fill="#000"
            initial={{ cx: reduce ? 6.6 : -7 }}
            animate={{ cx: 6.6 }}
            transition={reduce ? { duration: 0 } : { duration: 1.6, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="7.4" fill="var(--on-ink)" mask="url(#welcome-eclipse-mask)" />
    </svg>
  );
}
