/**
 * NEW GOAL — a promise, priced.
 *
 * Any goal screen can take a name and a number. The work here is the third
 * figure, the one the user did not type: what the target and the date
 * together demand every month, set against the promises already running.
 *
 * The anchor is not income. Income is not available — most of it is spent.
 * The honest denominator is the surplus this household actually produces
 * in an average month (income less expenses across the ledger's history),
 * and ₹90,000 of that is already spoken for by four live goals. A new goal
 * either fits in what is left or it displaces something.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, useActions } from '../data/store';
import type { Goal } from '../data/types';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Button,
  SectionHead, INK_HEX, type Ink,
} from '../components/ui';
import { ShareBar } from '../components/charts';
import { AmountDisplay, Keypad } from './sheets/Keypad';
import { Check } from '../components/icons';
import { inr, compactINR, monthLabel, longDate } from '../lib/format';
import { snap, gentle } from '../lib/motion';
import './NewGoal.css';

type Scene = Goal['scene'];
type GoalInk = Goal['ink'];

const HORIZONS: { months: number; label: string }[] = [
  { months: 6, label: '6 months' },
  { months: 12, label: '1 year' },
  { months: 24, label: '2 years' },
  { months: 60, label: '5 years' },
];

const QUICK = [50000, 100000, 250000, 500000];

const SCENES: { id: Scene; label: string }[] = [
  { id: 'acropolis', label: 'Acropolis' },
  { id: 'santorini', label: 'Santorini' },
  { id: 'harbour', label: 'Harbour' },
  { id: 'olivegrove', label: 'Olive grove' },
];

const INKS: { id: GoalInk; label: string }[] = [
  { id: 'ink', label: 'Cobalt' },
  { id: 'olive', label: 'Pine' },
  { id: 'vermilion', label: 'Vermilion' },
];

function addMonths(iso: string, n: number): string {
  const d = new Date(iso);
  const r = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  const p = (v: number) => String(v).padStart(2, '0');
  return `${r.getFullYear()}-${p(r.getMonth() + 1)}-${p(r.getDate())}`;
}

/* ================================================================
   Scene marks
   ----------------------------------------------------------------
   Two inks and paper, three or four shapes each — the same hand as
   the full-bleed goal illustrations, shrunk to a chooser tile.
   ================================================================ */

function SceneMark({ scene, ink }: { scene: Scene; ink: GoalInk }) {
  const c = INK_HEX[ink];
  return (
    <svg viewBox="0 0 72 44" className="ng__scenesvg" aria-hidden>
      {scene === 'acropolis' && (
        <>
          <path d="M0 38h72v6H0z" fill={c} opacity="0.3" />
          <path d="M22 14h28l-14-9z" fill={c} />
          <path d="M20 16h32v3H20z" fill={c} />
          <path d="M24 19h4v19h-4zM33 19h4v19h-4zM42 19h4v19h-4z" fill={c} />
          <circle cx="61" cy="11" r="5" fill={c} opacity="0.36" />
        </>
      )}
      {scene === 'santorini' && (
        <>
          <path d="M0 30c14-3 22 4 36 4s22-7 36-4v14H0z" fill={c} opacity="0.3" />
          <path d="M12 30V19h13v11z" fill={c} />
          <path d="M31 30a8 8 0 0 1 16 0z" fill={c} />
          <path d="M50 30V22h11v8z" fill={c} opacity="0.62" />
          <circle cx="18.5" cy="12" r="4" fill={c} opacity="0.36" />
        </>
      )}
      {scene === 'harbour' && (
        <>
          <path d="M0 36h72v8H0z" fill={c} opacity="0.3" />
          <path d="M52 36V10h7v26z" fill={c} opacity="0.62" />
          <path d="M52 10h7v-4h-7z" fill={c} />
          <path d="M32 7v25h-2V7z" fill={c} />
          <path d="M31 9l14 20H31z" fill={c} />
          <path d="M8 32h34l-5 6H13z" fill={c} />
        </>
      )}
      {scene === 'olivegrove' && (
        <>
          <path d="M0 34c18-6 30 4 48-1s16-3 24-1v12H0z" fill={c} opacity="0.3" />
          <path d="M34 20h3v18h-3z" fill={c} />
          <ellipse cx="35.5" cy="17" rx="15" ry="9" fill={c} />
          <path d="M13 26h2.4v12H13z" fill={c} opacity="0.62" />
          <ellipse cx="14.2" cy="24" rx="8" ry="5" fill={c} opacity="0.62" />
        </>
      )}
    </svg>
  );
}

/* ================================================================
   Screen
   ================================================================ */

export function NewGoal() {
  const { now, goals, history } = useApp();
  const { addGoal } = useActions();
  const { back } = useNav();

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [months, setMonths] = useState(12);
  const [scene, setScene] = useState<Scene>('santorini');
  const [ink, setInk] = useState<GoalInk>('ink');

  const target = Number(digits || 0);
  const by = useMemo(() => addMonths(now, months), [now, months]);
  const monthly = target > 0 ? Math.ceil(target / months / 100) * 100 : 0;

  /* ---- What the household actually produces, and what is promised ---- */
  const room = useMemo(() => {
    const income = history.reduce((n, h) => n + h.income, 0) / history.length;
    const expenses = history.reduce((n, h) => n + h.expenses, 0) / history.length;
    const surplus = income - expenses;
    const committed = goals.reduce((n, g) => n + g.monthly, 0);
    return { income, expenses, surplus, committed, free: surplus - committed };
  }, [history, goals]);

  const newTotal = room.committed + monthly;
  const denom = Math.max(room.surplus, newTotal, 1);
  const verdict = monthly === 0 ? 'none'
    : newTotal <= room.surplus ? 'fits'
      : newTotal <= room.surplus * 1.15 ? 'tight' : 'over';

  /* Adjacent cobalt segments on a cobalt card would read as one block, so
     the running goals step toward paper and the new one takes the accent. */
  const parts = [
    ...goals.map((g, i) => ({
      id: g.id,
      share: g.monthly / denom,
      ink: 'ink' as Ink,
      color: `color-mix(in oklab, var(--paper) ${34 + i * 14}%, var(--ink-lift))`,
    })),
    ...(monthly > 0
      ? [{
        id: 'new',
        share: monthly / denom,
        ink: 'vermilion' as Ink,
        color: 'var(--vermilion-lift)',
      }]
      : []),
    {
      id: 'free',
      share: Math.max(0, denom - newTotal) / denom,
      ink: 'paper' as Ink,
      color: 'rgba(253,248,236,0.20)',
    },
  ];

  const ready = name.trim().length > 0 && target > 0;

  const create = () => {
    addGoal({
      name: name.trim(),
      blurb: `${inr(monthly)} a month until ${monthLabel(`${by}T00:00:00`)}.`,
      target,
      saved: 0,
      by,
      monthly,
      scene,
      ink,
    });
    back();
  };

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y ng__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Goals"
              title="New goal"
              sub="Name it, price it, pick a date. Oikonos works out the monthly and
                   tells you whether it fits."
            />
          </Rise>

          {/* ---- Name ---- */}
          <Rise>
            <div className="ng__namewrap">
              <label className="eyebrow ng__namelab" htmlFor="ng-name">
                What is it for
              </label>
              <input
                id="ng-name"
                className="ng__name display"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Greek Summer"
                autoComplete="off"
                spellCheck={false}
                maxLength={28}
              />
            </div>
          </Rise>

          {/* ---- Target ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="ng__amount">
              <Eyebrow>Target</Eyebrow>
              <AmountDisplay digits={digits} tone={ink} />
              <div className="chiprow" style={{ marginTop: 14 }}>
                {QUICK.map((v) => (
                  <motion.button
                    key={v}
                    className={`chip chip--num ${target === v ? 'chip--on' : ''}`}
                    onClick={() => setDigits(String(v))}
                    aria-pressed={target === v}
                    whileTap={{ scale: 0.94 }}
                    transition={snap}
                  >
                    {compactINR(v)}
                  </motion.button>
                ))}
              </div>
            </div>
          </Rise>

          <Rise style={{ paddingTop: 14 }}>
            <Keypad compact max={8} onPress={(next) => setDigits((d) => next(d))} />
          </Rise>

          {/* ---- Horizon ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="By when" />
            <div className="ng__horizons">
              {HORIZONS.map((h) => {
                const on = h.months === months;
                const date = addMonths(now, h.months);
                return (
                  <motion.button
                    key={h.months}
                    className={`ng__horizon ${on ? 'ng__horizon--on' : ''}`}
                    onClick={() => setMonths(h.months)}
                    aria-pressed={on}
                    whileTap={{ scale: 0.96 }}
                    transition={snap}
                  >
                    <span className="ng__hlabel">{h.label}</span>
                    <span className="ng__hdate num">{monthLabel(`${date}T00:00:00`)}</span>
                    <span className="figure ng__hmonthly">
                      {target > 0 ? `${compactINR(Math.ceil(target / h.months / 100) * 100)}/mo` : '—'}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Rise>

          {/* ---- What it costs, against what is already promised ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <Card tone="ink" pad={22}>
              <Eyebrow tone="var(--on-ink-muted)">This goal would cost</Eyebrow>
              <p className="ng__monthly">
                <motion.span
                  key={monthly}
                  className="figure"
                  initial={{ opacity: 0.35, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={gentle}
                >
                  {monthly > 0 ? inr(monthly) : '₹0'}
                </motion.span>
                <span className="ng__monthlyunit">a month</span>
              </p>
              <p className="ng__monthlynote">
                {target > 0
                  ? `${inr(target)} by ${longDate(`${by}T00:00:00`)}, split across ${months} months.`
                  : 'Set a target and a date to see the monthly it implies.'}
              </p>

              <div className="ng__bar">
                <ShareBar parts={parts} height={11} />
                <div className="ng__barfoot">
                  <span>
                    {inr(room.committed)} promised across {goals.length} goals
                  </span>
                  <span className="num">
                    {inr(Math.round(Math.max(0, room.free)))} free
                  </span>
                </div>
              </div>

              <div className={`ng__verdict ng__verdict--${verdict}`}>
                <span className="ng__vdot" aria-hidden />
                <p>
                  {verdict === 'none' && (
                    <>
                      An average month here produces{' '}
                      <b>{inr(Math.round(room.surplus))}</b> of surplus —{' '}
                      {compactINR(room.income)} in, {compactINR(room.expenses)} out.{' '}
                      {inr(room.committed)} of it is already promised, so{' '}
                      <b>{inr(Math.round(room.free))} a month</b> is genuinely free.
                    </>
                  )}
                  {verdict === 'fits' && (
                    <>
                      <b>It fits.</b> {inr(monthly)} sits inside the{' '}
                      {inr(Math.round(room.free))} an average month leaves after your
                      other {goals.length} goals, with{' '}
                      {inr(Math.round(room.free - monthly))} still unspoken for.
                    </>
                  )}
                  {verdict === 'tight' && (
                    <>
                      <b>Tight.</b> {inr(newTotal)} of promises against a{' '}
                      {inr(Math.round(room.surplus))} average surplus leaves nothing
                      for a bad month. A longer date drops it to{' '}
                      {inr(Math.ceil(target / 60 / 100) * 100)} over five years.
                    </>
                  )}
                  {verdict === 'over' && (
                    <>
                      <b>It does not fit.</b> {inr(newTotal)} a month of promises
                      against a {inr(Math.round(room.surplus))} surplus is{' '}
                      {inr(Math.round(newTotal - room.surplus))} more than you
                      actually save. Stretch the date, cut the target, or something
                      already running has to give.
                    </>
                  )}
                </p>
              </div>
            </Card>
          </Rise>

          {/* ---- Scene ---- */}
          <Rise style={{ paddingTop: 28 }}>
            <SectionHead title="Print" />
            <div className="ng__scenes">
              {SCENES.map((s) => {
                const on = s.id === scene;
                return (
                  <motion.button
                    key={s.id}
                    className={`ng__scene ${on ? 'ng__scene--on' : ''}`}
                    onClick={() => setScene(s.id)}
                    aria-pressed={on}
                    whileTap={{ scale: 0.96 }}
                    transition={snap}
                  >
                    <span className="ng__scenebox tex-card">
                      <SceneMark scene={s.id} ink={ink} />
                    </span>
                    <span className="ng__scenelabel">{s.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </Rise>

          {/* ---- Ink ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <div className="ng__inkrow">
              <Eyebrow>Ink</Eyebrow>
              <div className="ng__inks" role="radiogroup" aria-label="Goal ink">
                {INKS.map((k) => {
                  const on = k.id === ink;
                  return (
                    <motion.button
                      key={k.id}
                      className={`ng__ink ${on ? 'ng__ink--on' : ''}`}
                      style={{ background: INK_HEX[k.id] }}
                      onClick={() => setInk(k.id)}
                      role="radio"
                      aria-checked={on}
                      aria-label={k.label}
                      whileTap={{ scale: 0.88 }}
                      transition={snap}
                    >
                      {on && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={snap}
                        >
                          <Check size={15} />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Rise>

          {/* ---- Create ---- */}
          <Rise style={{ paddingTop: 26, paddingBottom: 8 }}>
            <Button ink="ink" full disabled={!ready} onClick={create}>
              {!name.trim() ? 'Name it first'
                : target <= 0 ? 'Set a target'
                  : `Start saving ${inr(monthly)} a month`}
            </Button>
            <p className="ng__foot">
              Goals save on the 2nd, the day after payday clears. You can
              top one up by hand at any time — top-ups are what pull a
              target forward.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}
