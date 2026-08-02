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
 * The lune in the counter of the O between K and N.
 *
 * The comp leaves that O *open* — the counter stays cobalt and a thin
 * cream crescent nests just inside the bowl, thickest at the equator and
 * tapering to cusps at top and bottom. An earlier version filled the whole
 * counter with cream and subtracted a crescent from it, which turned the
 * letter into a solid blob and cost it its counter entirely.
 *
 * The lune is the difference of two identical ellipses offset by a stem's
 * width, so its modulation matches the O's own, and it sits up and left
 * because that is where this screen's light comes from. The cobalt disc
 * slides across on load and settles, so the crescent is drawn rather than
 * pasted.
 */
function Eclipse({ reduce }: { reduce: boolean }) {
  const RX = 9.6;      // sits inside the bowl, not on it
  const RY = 13.4;
  const OFF = 4.4;     // one stem's width
  return (
    <svg
      className="welcome__eclipse"
      viewBox="-16 -21 32 42"
      aria-hidden
      focusable="false"
    >
      <defs>
        <mask id="welcome-eclipse-mask">
          <ellipse cx="0" cy="0" rx={RX} ry={RY} fill="#fff" />
          <motion.ellipse
            cy="0" rx={RX} ry={RY} fill="#000"
            initial={{ cx: reduce ? OFF : OFF + RX * 2.4 }}
            animate={{ cx: OFF }}
            transition={reduce
              ? { duration: 0 }
              : { duration: 1.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        </mask>
      </defs>
      <ellipse
        cx="0" cy="0" rx={RX} ry={RY}
        fill="var(--on-ink)" mask="url(#welcome-eclipse-mask)"
      />
    </svg>
  );
}
