/**
 * NEW BUDGET — an envelope, informed rather than guessed.
 *
 * A limit typed into a blank field is a wish. Everything here exists to
 * make it a decision: the categories that do not yet have a ceiling, what
 * each of them has actually cost in the months the ledger itemises, and a
 * line that moves across that history as the number is typed.
 *
 * The category chosen by default is the one with the most evidence behind
 * it — the most itemised months on record, not the largest number.
 *
 * The quiet point the raw figures never make: envelopes cover far less of
 * a month than their total suggests, because rent, transfers and the
 * unbudgeted categories sit outside every one of them.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, useActions, CATEGORIES } from '../data/store';
import type { CategoryId } from '../data/types';
import { useNav } from '../nav';
import {
  Screen, TopBar, PageHead, Eyebrow, Stack, Rise, Card, Empty, Button,
  CategoryBadge, SectionHead, Meter,
} from '../components/ui';
import { AmountDisplay, Keypad } from './sheets/Keypad';
import { CategoryMonths } from './BudgetDetail';
import { IcCoin, Check } from '../components/icons';
import { inr, compactINR, pctOf } from '../lib/format';
import { snap, gentle } from '../lib/motion';
import './NewBudget.css';

/** Money that arrives, and money that only moves between your own pockets,
 *  cannot be capped by an envelope. */
const UNBUDGETABLE = new Set<CategoryId>(['income', 'transfer']);

function roundTo(n: number, step: number): number {
  return Math.max(step, Math.round(n / step) * step);
}

export function NewBudget() {
  const { txns, budgets, history } = useApp();
  const { addBudget } = useActions();
  const { back } = useNav();

  const coverage = useMemo(
    () => new Set(txns.map((t) => t.at.slice(0, 7))),
    [txns],
  );

  /* ---- Every category that could still take a ceiling, with its record ---- */
  const candidates = useMemo(() => {
    const taken = new Set(budgets.map((b) => b.category));
    const months = history.map((h) => h.month.slice(0, 7));

    return (Object.keys(CATEGORIES) as CategoryId[])
      .filter((c) => !taken.has(c) && !UNBUDGETABLE.has(c))
      .map((c) => {
        const byMonth = months.map((m) => ({
          month: m,
          value: txns
            .filter((t) => t.category === c && t.at.slice(0, 7) === m && t.amount < 0)
            .reduce((n, t) => n + Math.abs(t.amount), 0),
        }));
        const seen = byMonth.filter((b) => coverage.has(b.month));
        const active = seen.filter((b) => b.value > 0);
        const avg = seen.length
          ? seen.reduce((n, b) => n + b.value, 0) / seen.length
          : 0;
        const peak = Math.max(0, ...seen.map((b) => b.value));
        return {
          id: c, meta: CATEGORIES[c], byMonth,
          avg, peak, months: seen.length, active: active.length,
        };
      })
      /* most evidence first, then weight — a category the ledger knows
         well makes a better default than one it has seen once. */
      .sort((a, b) => b.active - a.active || b.avg - a.avg);
  }, [budgets, txns, history, coverage]);

  const [pick, setPick] = useState<CategoryId | null>(candidates[0]?.id ?? null);
  const chosen = candidates.find((c) => c.id === pick) ?? candidates[0];

  /* The keypad starts at the running average, rounded to a usable step —
     a suggestion the user can overwrite, not a number out of the air. */
  const [digits, setDigits] = useState(
    chosen && chosen.avg > 0 ? String(roundTo(chosen.avg, 500)) : '',
  );
  const limit = Number(digits || 0);

  const selectCategory = (c: typeof candidates[number]) => {
    setPick(c.id);
    setDigits(c.avg > 0 ? String(roundTo(c.avg, 500)) : '');
  };

  /* ---- What the envelopes already cover ---- */
  const shape = useMemo(() => {
    const allocated = budgets.reduce((n, b) => n + b.limit, 0);
    const avgSpend = history.reduce((n, h) => n + h.expenses, 0) / history.length;
    return { allocated, avgSpend };
  }, [budgets, history]);

  if (candidates.length === 0) {
    return (
      <Screen>
        <TopBar onBack={back} />
        <div className="pane pane--pad">
          <Empty
            title="Every category is covered"
            body="All ten spendable categories already have an envelope. Edit one instead of adding another."
            icon={<IcCoin size={26} />}
          />
        </div>
      </Screen>
    );
  }

  const under = limit > 0 && chosen.avg > 0 && limit < chosen.avg;
  const belowPeak = limit > 0 && chosen.peak > 0 && limit < chosen.peak;
  const newTotal = shape.allocated + limit;
  const coverShare = shape.avgSpend > 0 ? newTotal / shape.avgSpend : 0;

  return (
    <Screen>
      <TopBar onBack={back} />

      <div className="pane pane--pad scroll-y nb__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Budgets"
              title="New envelope"
              sub={`${budgets.length} of your ten spendable categories already have a
                    ceiling. ${candidates.length} do not.`}
            />
          </Rise>

          {/* ---- Which category ---- */}
          <Rise>
            <Eyebrow style={{ display: 'block', marginBottom: 12 }}>Category</Eyebrow>
            <div className="nb__cats">
              {candidates.map((c) => {
                const on = c.id === chosen.id;
                return (
                  <motion.button
                    key={c.id}
                    className={`nb__cat ${on ? 'nb__cat--on' : ''}`}
                    onClick={() => selectCategory(c)}
                    aria-pressed={on}
                    whileTap={{ scale: 0.97 }}
                    transition={snap}
                  >
                    <CategoryBadge icon={c.meta.icon} ink={c.meta.ink} size={34} onDark={on} />
                    <span className="nb__catbody">
                      <span className="nb__catname">{c.meta.label}</span>
                      <span className="nb__catavg num">
                        {c.active > 0 ? `${compactINR(c.avg)} a month` : 'no record yet'}
                      </span>
                    </span>
                    {on && (
                      <motion.span
                        className="nb__tick"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={snap}
                      >
                        <Check size={13} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Rise>

          {/* ---- The number ---- */}
          <Rise style={{ paddingTop: 26 }}>
            <div className="nb__amount">
              <Eyebrow>Monthly limit</Eyebrow>
              <AmountDisplay digits={digits} tone={chosen.meta.ink} />
              <p className="nb__amountnote">
                {chosen.active > 0
                  ? `${chosen.meta.label} has averaged ${inr(Math.round(chosen.avg))} across the ${chosen.months} months the ledger itemises.`
                  : `The ledger has never recorded a ${chosen.meta.label.toLowerCase()} expense, so there is nothing to measure this against yet.`}
              </p>
            </div>
          </Rise>

          {/* ---- The projection ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <SectionHead title="Against the record" />
            <div className="nb__chart">
              <CategoryMonths
                months={chosen.byMonth}
                line={Math.max(limit, 1)}
                lineLabel={limit > 0 ? `${compactINR(limit)} limit` : 'no limit set'}
                ink={chosen.meta.ink}
                coverage={coverage}
              />
            </div>

            <div className="nb__facts">
              <Fact label="Average" value={chosen.active > 0 ? inr(Math.round(chosen.avg)) : '—'} />
              <Fact label="Dearest" value={chosen.peak > 0 ? inr(chosen.peak) : '—'} />
              <Fact
                label="Headroom"
                value={limit > 0 && chosen.avg > 0 ? inr(Math.round(Math.abs(limit - chosen.avg))) : '—'}
                tone={under ? 'var(--vermilion)' : 'var(--olive)'}
                note={limit > 0 && chosen.avg > 0 ? (under ? 'short' : 'spare') : undefined}
              />
            </div>
          </Rise>

          {/* ---- The honest warning ---- */}
          {limit > 0 && (
            <Rise style={{ paddingTop: 20 }}>
              <div className={`nb__verdict nb__verdict--${under ? 'warn' : belowPeak ? 'caution' : 'clear'}`}>
                <span className="nb__vdot" aria-hidden />
                <div>
                  <p className="nb__vtitle">
                    {under
                      ? `${inr(limit)} is below what this actually costs`
                      : belowPeak
                        ? `${inr(limit)} clears the average, not the worst month`
                        : `${inr(limit)} covers every month on record`}
                  </p>
                  <p className="nb__vbody">
                    {under
                      ? `On the record so far you would breach it by about ${inr(Math.round(chosen.avg - limit))} in a typical month — ${pctOf(chosen.avg - limit, chosen.avg)}% over. Set it here only if the plan is to spend less, not to be surprised.`
                      : belowPeak
                        ? `${chosen.meta.label} ran to ${inr(chosen.peak)} once in the last ${chosen.months} itemised months. This ceiling holds in an ordinary month and breaks in that one.`
                        : `The dearest month the ledger has for ${chosen.meta.label.toLowerCase()} is ${inr(chosen.peak)}, and this sits above it. Generous, but it will never bite.`}
                  </p>
                </div>
              </div>
            </Rise>
          )}

          {/* ---- What it does to the whole plan ---- */}
          <Rise style={{ paddingTop: 24 }}>
            <Card tone="ink" pad={20}>
              <Eyebrow tone="var(--on-ink-muted)">Budgeted after this</Eyebrow>
              <p className="nb__total figure">{inr(newTotal)}</p>
              <div className="nb__totalmeter">
                <Meter
                  value={Math.min(1, coverShare)}
                  ink={coverShare > 0.9 ? 'vermilion' : 'olive'}
                  track="rgba(253,248,236,0.20)"
                  height={7}
                  delay={0.2}
                />
              </div>
              <p className="nb__totalnote">
                That is {Math.round(coverShare * 100)}% of the{' '}
                {compactINR(shape.avgSpend)} you spend in an average month.
                Rent, SIPs and the categories with no ceiling make up the rest —
                envelopes govern a smaller share of the month than their total
                makes them look.
              </p>
            </Card>
          </Rise>

          {/* ---- Keypad ---- */}
          <Rise style={{ paddingTop: 22 }}>
            <Keypad compact max={7} onPress={(next) => setDigits((d) => next(d))} />
          </Rise>

          <Rise style={{ paddingTop: 16, paddingBottom: 10 }}>
            <motion.div layout transition={gentle}>
              <Button
                ink="ink"
                full
                disabled={limit <= 0}
                onClick={() => { addBudget(chosen.id, limit); back(); }}
              >
                {limit <= 0
                  ? 'Set a monthly limit'
                  : `Create · ${inr(limit)} a month`}
              </Button>
            </motion.div>
            <p className="nb__foot">
              A new envelope starts with nothing rolled in. Whatever it has
              left at the end of the month carries into the next one, and
              whatever it overspends follows it there too.
            </p>
          </Rise>
        </Stack>
      </div>
    </Screen>
  );
}

function Fact({
  label, value, note, tone,
}: { label: string; value: string; note?: string; tone?: string }) {
  return (
    <div className="nb__fact">
      <span className="nb__factlab">{label}</span>
      <span className="figure nb__factval" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
      {note && <span className="nb__factnote">{note}</span>}
    </div>
  );
}
