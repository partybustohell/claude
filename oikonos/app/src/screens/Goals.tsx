import { motion } from 'framer-motion';
import { useApp } from '../data/store';
import { useNav } from '../nav';
import { Screen, Eyebrow, Stack, Rise, Meter, Card } from '../components/ui';
import { ChevronRight, IcSail, IcBank, IcHouse, IcLeaf } from '../components/icons';
import type { Goal } from '../data/types';
import { inr, compactINR, monthYearShort, pctOf } from '../lib/format';
import { snap } from '../lib/motion';
import './Goals.css';
import { PlateFoot } from '../illustrations/place';

const SCENE_ICON = {
  acropolis: IcSail, harbour: IcBank, santorini: IcHouse, olivegrove: IcLeaf,
} as const;

/** Months between now and the target date, floored at zero. */
function monthsTo(iso: string, now: string): number {
  const a = new Date(now);
  const b = new Date(iso);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

export function Goals() {
  const { goals, now } = useApp();
  const { push } = useNav();

  const saved = goals.reduce((n, g) => n + g.saved, 0);
  const target = goals.reduce((n, g) => n + g.target, 0);
  const monthly = goals.reduce((n, g) => n + g.monthly, 0);

  return (
    <Screen>
      <div className="pane pane--pad scroll-y goals__scroll">
        <Stack gap={0}>
          <Rise>
            <Eyebrow>Goals</Eyebrow>
            <h1 className="goals__title display">Saving toward</h1>
          </Rise>

          <Rise style={{ paddingTop: 18 }}>
            <Card tone="warm" pad={20}>
              <div className="goals__summary">
                <div>
                  <span className="figure goals__sumnum">{inr(saved)}</span>
                  <span className="goals__sumof">of {compactINR(target)}</span>
                </div>
                <span className="goals__sumrate num">
                  {inr(monthly)}<span>/mo</span>
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Meter value={saved / target} ink="olive" height={8} />
              </div>
            </Card>
          </Rise>

          <Rise style={{ paddingTop: 26, paddingBottom: 4 }}>
            <Eyebrow>{goals.length} in progress</Eyebrow>
          </Rise>

          {goals.map((g, i) => (
            <Rise key={g.id}>
              <GoalCard
                goal={g}
                months={monthsTo(g.by, now)}
                delay={i * 0.06}
                onOpen={() => push({ name: 'goal', id: g.id })}
              />
            </Rise>
          ))}
          {/* The screen runs out and the world begins. */}
          <PlateFoot plate="ascent" height={214} />
        </Stack>
      </div>
    </Screen>
  );
}

function GoalCard({
  goal, months, delay, onOpen,
}: { goal: Goal; months: number; delay: number; onOpen: () => void }) {
  const pct = goal.saved / goal.target;
  const short = goal.target - goal.saved;
  const needed = months > 0 ? short / months : short;
  const onTrack = goal.monthly >= needed;
  const Icon = SCENE_ICON[goal.scene];

  return (
    <motion.button
      className="goalcard"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      whileHover={{ y: -2 }}
      transition={snap}
    >
      <span className="goalcard__top">
        <span className="goalcard__chip tex-ink" style={{ background: `var(--${goal.ink})` }}>
          <Icon size={18} />
        </span>
        <span className="goalcard__names">
          <span className="goalcard__name">{goal.name}</span>
          <span className="goalcard__blurb">{goal.blurb}</span>
        </span>
        <ChevronRight size={17} className="goalcard__chev" />
      </span>

      <span className="goalcard__figures">
        <span className="figure goalcard__saved">{inr(goal.saved)}</span>
        <span className="goalcard__target">of {inr(goal.target)}</span>
        <span className="goalcard__pct num">{pctOf(goal.saved, goal.target)}%</span>
      </span>

      <Meter value={pct} ink={goal.ink} height={8} delay={delay} />

      <span className="goalcard__foot">
        <span className={`goalcard__status goalcard__status--${onTrack ? 'ok' : 'behind'}`}>
          {onTrack ? 'On track' : 'Behind'}
        </span>
        <span className="goalcard__when">
          {months > 0
            ? `${compactINR(Math.round(needed))} a month to reach it by ${monthYearShort(goal.by)}`
            : `Due ${monthYearShort(goal.by)}`}
        </span>
      </span>
    </motion.button>
  );
}
