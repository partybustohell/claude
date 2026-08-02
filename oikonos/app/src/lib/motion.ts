/**
 * Motion physics.
 *
 * Everything that moves in OIKONOS moves on a spring, not a curve —
 * springs preserve momentum across interruptions, so a user who
 * grabs a sheet mid-flight never sees a jump. The four presets below
 * are the entire vocabulary; do not hand-roll stiffness values in
 * components.
 */
import type { Transition, Variants } from 'framer-motion';

/** Micro feedback: press, toggle, chip. Critically damped, very quick. */
export const snap: Transition = {
  type: 'spring', stiffness: 620, damping: 34, mass: 0.7,
};

/** Element enter / layout shift. A trace of overshoot for life. */
export const gentle: Transition = {
  type: 'spring', stiffness: 320, damping: 30, mass: 0.9,
};

/** Sheets, drawers, cards taking flight. Weighty but never sluggish. */
export const surface: Transition = {
  type: 'spring', stiffness: 210, damping: 27, mass: 1.05,
};

/** Full screen transitions. Heaviest object in the system. */
export const screen: Transition = {
  type: 'spring', stiffness: 170, damping: 26, mass: 1.15,
};

/** Non-spring easing for opacity-only fades (springs on opacity look mushy). */
export const fade: Transition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] };

/** Long, luxurious reveal for hero numerals. */
export const reveal: Transition = { duration: 0.9, ease: [0.16, 1, 0.3, 1] };

/* ---------------------------------------------------------------- */
/* Shared variants                                                    */
/* ---------------------------------------------------------------- */

/** Children rise into place in sequence. Apply to a list container. */
export const stagger = (delay = 0.05, initial = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: initial } },
});

/** Companion to `stagger` for each child. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: gentle },
};

export const fadeItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: fade },
};

/**
 * Screen push (forward) / pop (back) — direction is driven by `custom`.
 *
 * +1 travels leftwards: the arriving screen starts to the right of centre
 * and slides in, the leaving one parallaxes off to the left. That is the
 * push, and it is also what pressing a tab further right must look like.
 * −1 is the mirror. 0 means the move has no direction — a crossfade, with
 * no x at all, because a zero direction sliding one way is a lie about
 * where the screen came from.
 */
export const pageVariants: Variants = {
  enter: (dir: number) => ({ x: dir === 0 ? 0 : dir > 0 ? '26%' : '-18%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: screen },
  exit: (dir: number) => ({
    x: dir === 0 ? 0 : dir > 0 ? '-18%' : '26%',
    opacity: 0,
    transition: { ...screen, damping: 32 },
  }),
};

/** Bottom sheet. */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: surface },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 300, damping: 34 } },
};

/* ---------------------------------------------------------------- */
/* Press physics                                                      */
/* ---------------------------------------------------------------- */

/** Scale a press-down so that big targets depress less than small ones —
 *  a uniform 0.96 makes a full-width button look like it is collapsing. */
export function pressScale(widthPx: number): number {
  if (widthPx <= 48) return 0.9;
  if (widthPx >= 320) return 0.978;
  return 0.9 + (widthPx - 48) / (320 - 48) * (0.978 - 0.9);
}

export const tapProps = {
  whileTap: { scale: 0.97 },
  transition: snap,
};

/* ---------------------------------------------------------------- */
/* Easing helpers for canvas / requestAnimationFrame work             */
/* ---------------------------------------------------------------- */

export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Damped-spring position for hand-rolled rAF loops (canvas particles etc). */
export function springStep(
  value: number, velocity: number, target: number,
  stiffness: number, damping: number, dt: number,
): [number, number] {
  const f = -stiffness * (value - target);
  const d = -damping * velocity;
  const a = f + d;
  const v = velocity + a * dt;
  return [value + v * dt, v];
}
