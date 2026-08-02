/**
 * THE PRESS
 * ============================================================
 * Every plate in OIKONOS is pulled on the same machine. Before this
 * module each illustration carried its own copy of the grain filter,
 * the stipple threshold and the entrance stagger, which meant four
 * plates and four slightly different presses — the grain drifted a
 * frequency, the dither drifted a threshold, and the drawings stopped
 * looking like they came off one bed.
 *
 * So the press lives here, once. A plate declares `<Press id="acc" />`
 * in its defs and refers to `ink('acc', 'grain')`; the filter it gets
 * is the same filter every other plate gets.
 *
 * What the press provides:
 *   · grain        — ink mottle, the standard tooth for a saturated field
 *   · grain-fine   — a lighter speckle for pale stock (marble, paper)
 *   · stipple      — hard-threshold dither, turns a shape into dots
 *   · stipple-coarse — the same at a larger dot, for near-field work
 *
 * Nothing here draws. Subject matter belongs in the plate.
 */
import type { ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { surface } from '../lib/motion';

/** Reference a press filter from inside a plate. */
export const ink = (id: string, filter: string) => `url(#${id}-${filter})`;

/**
 * The screens a ramp can be pulled through, and there are three because
 * ONE cell size cannot serve every mass.
 *
 * Round four said the ramps still read as gradients: at baseFrequency
 * 0.7 the cells were 1.4 user units, under a pixel and a half, and
 * averaged into smooth tone. Opening them to 0.11 fixed the hillsides
 * and broke the towers — an 8-unit cell on a 70-unit shaft is not a
 * screen, it is camouflage. The dot has to be coarse enough to see and
 * fine enough that the mass still reads as one object, which means it
 * scales with the mass. Roughly: 'coarse' for a hillside, 'mid' for a
 * building, 'fine' for anything narrower than about a hundred units.
 *
 * Each scale gets two screens on different seeds so a ramp's lit pass
 * and deep pass land on different cells instead of fighting for the
 * same ones.
 */
const SCREENS = [
  { key: 'fine-a', f: 0.42 }, { key: 'fine-b', f: 0.48 },
  { key: 'mid-a', f: 0.2 }, { key: 'mid-b', f: 0.23 },
  { key: 'coarse-a', f: 0.11 }, { key: 'coarse-b', f: 0.13 },
] as const;

export type ScreenScale = 'fine' | 'mid' | 'coarse';

/**
 * The press defs. `seed` shifts every turbulence field so two plates
 * sitting on the same screen do not print an identical mottle.
 */
export function Press({ id, seed = 0 }: { id: string; seed?: number }) {
  return (
    <>
      <filter id={`${id}-grain`} x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="4"
          seed={23 + seed} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" result="na"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0.8 0.32 0 0 -0.18" />
        <feComposite in="na" in2="SourceAlpha" operator="in" result="g" />
        <feBlend in="SourceGraphic" in2="g" mode="multiply" />
      </filter>

      <filter id={`${id}-grain-fine`} x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="3"
          seed={6 + seed} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" result="na"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0.26 0.1 0 0 -0.09" />
        <feComposite in="na" in2="SourceAlpha" operator="in" result="g" />
        <feBlend in="SourceGraphic" in2="g" mode="multiply" />
      </filter>

      <filter id={`${id}-stipple`} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1"
          seed={41 + seed} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" result="m"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  2.7 0 0 0 -1.1" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>

      <filter id={`${id}-stipple-coarse`} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.24" numOctaves="1"
          seed={8 + seed} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" result="m"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  2.3 0 0 0 -0.98" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>

      {/* ---- THE SCREEN ----------------------------------------------
          The dot a ramp is built from, and it is deliberately BIG.

          Round four's verdict on the ramps: structurally right, visually
          still a gradient. At baseFrequency 0.7 the cells are about 1.4
          user units — under a pixel and a half on a 390-wide plate — so
          at display scale they average into a smooth tone and are
          indistinguishable from the fill-fade they replaced. Critics
          went on calling it "a large feather-edged dark lens" and "soft
          diagonal lighter streaks".

          A dot has to be big enough to see or it is not a dot, it is a
          tint. These run at 0.11 and 0.13 — cells of roughly 8 user
          units, which survive both the phone and the contact sheet. Two
          of them, on different seeds and frequencies, so the lit pass
          and the deep pass of a ramp land on different cells instead of
          fighting for the same ones.

          The alpha slope matters as much as the frequency. At 3.4 the
          threshold band is a third of the noise range wide, so every dot
          fades out at its own rim and the field reads as soft cloud —
          a gradient made of blobs. At 18 the band is a twentieth: a cell
          either takes ink or it does not, which is the only thing a
          drum can actually do.
          ------------------------------------------------------------ */}
      {SCREENS.map(({ key, f }, i) => (
        <filter key={key} id={`${id}-screen-${key}`}
          x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves="1"
            seed={17 + seed + i * 23} stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" result="m"
            values={`0 0 0 0 0
                     0 0 0 0 0
                     0 0 0 0 0
                     18 0 0 0 ${-7.6 - (i % 2) * 0.3}`} />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      ))}
    </>
  );
}

/* ================================================================
   SCREEN RAMP — value by dot coverage, not by a fill that fades
   ----------------------------------------------------------------
   Round three's largest finding. Nine of fourteen plates modelled a
   mass with a <linearGradient>: the shaft of a tower, the body of a
   rock, the fall of a hillside. Four independent blind critics named it
   without being asked, in nearly the same words — "an airbrushed
   cylinder", "a gradient where flat ink belongs", "flatly foreign to
   riso", "the single most foreign mark on either plate".

   They are right, and the reason is mechanical. A risograph has one
   drum per ink and no way to print a half-strength ink. It turns value
   the only way it can: by changing how many dots per unit area land.
   A fill that fades is a thing the press physically cannot do.

   So a mass is now built as a flat base ink with two dithered passes
   over it — a lighter ink where the light falls, a darker one where it
   does not — each masked by a gradient so what varies across the shape
   is DOT COVERAGE. The gradient survives, but it drives coverage rather
   than colour, which is exactly the distinction between a print and an
   airbrush. It also cannot drift through grey on the way, the way a
   cream-to-cobalt ramp does, because no intermediate colour is ever
   mixed — only more or fewer dots of colours that are already in the
   palette.
   ================================================================ */

/**
 * Defs for one ramp. `name` scopes it within the plate.
 *
 * `box` is the MASS the ramp models, in plate coordinates, and passing
 * it is not optional bookkeeping. The gradient used to be expressed in
 * objectBoundingBox units on a rect covering the whole plate, so it
 * spanned 390 units regardless of what it was shading. Across a
 * hillside that fills the plate it worked; across a 70-unit tower it
 * changed by a fifth of a stop, and a blind critic caught exactly that:
 * "the mottling is identical on the left and right cheeks of the tower,
 * and it therefore describes nothing about light". A ramp has to run
 * from one side of its own object to the other.
 */
export function RampDefs({
  id, name, w, h, box, x1 = 0.1, y1 = 0, x2 = 0.9, y2 = 1,
}: {
  id: string; name: string; w: number; h: number;
  box?: { x: number; y: number; w: number; h: number };
  x1?: number; y1?: number; x2?: number; y2?: number;
}) {
  const k = `${id}-${name}`;
  const b = box ?? { x: 0, y: 0, w, h };
  const gx = (t: number) => b.x + b.w * t;
  const gy = (t: number) => b.y + b.h * t;
  const units = 'userSpaceOnUse' as const;
  return (
    <>
      <linearGradient id={`${k}-gl`} gradientUnits={units}
        x1={gx(x1)} y1={gy(y1)} x2={gx(x2)} y2={gy(y2)}>
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.52" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${k}-gd`} gradientUnits={units}
        x1={gx(x1)} y1={gy(y1)} x2={gx(x2)} y2={gy(y2)}>
        <stop offset="0.44" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id={`${k}-ml`}>
        <rect x="0" y="0" width={w} height={h} fill={`url(#${k}-gl)`} />
      </mask>
      <mask id={`${k}-md`}>
        <rect x="0" y="0" width={w} height={h} fill={`url(#${k}-gd)`} />
      </mask>
    </>
  );
}

/**
 * The ramp. `d` is the mass; `base` is the flat ink it is printed in;
 * `lit` and `deep` are the two inks whose dot coverage does the turning.
 */
export function ScreenRamp({
  id, name, d, w, h, base, lit, deep, scale = 'mid',
  litOpacity = 1, deepOpacity = 1,
}: {
  id: string; name: string; d: string; w: number; h: number;
  base: string; lit: string; deep: string;
  /** Match the cell to the mass — see SCREENS. */
  scale?: ScreenScale;
  /** Full strength by default. A dot is either printed or it is not —
   *  turning the pass down is how a screen becomes a tint again. */
  litOpacity?: number; deepOpacity?: number;
}) {
  const k = `${id}-${name}`;
  return (
    <>
      <defs><clipPath id={`${k}-clip`}><path d={d} /></clipPath></defs>
      <path d={d} fill={base} />
      <g clipPath={`url(#${k}-clip)`}>
        <g mask={`url(#${k}-ml)`}>
          <rect x="0" y="0" width={w} height={h} fill={lit}
            opacity={litOpacity} filter={ink(id, `screen-${scale}-a`)} />
        </g>
        <g mask={`url(#${k}-md)`}>
          <rect x="0" y="0" width={w} height={h} fill={deep}
            opacity={deepOpacity} filter={ink(id, `screen-${scale}-b`)} />
        </g>
      </g>
    </>
  );
}

/* ================================================================
   Entrance
   ================================================================ */

/**
 * A plate does not fade in as one object — its layers arrive back to
 * front, the far ones travelling less than the near ones, which is what
 * gives a flat drawing depth on entry. `useLayer` returns the motion
 * props for one layer and collapses to nothing under reduced motion.
 */
export function useLayer() {
  const reduce = useReducedMotion();
  return (y: number, delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { ...surface, delay },
  });
}

/* ================================================================
   Deterministic scatter
   ----------------------------------------------------------------
   Riso texture is dots, not a blur. Every speck field in the app is
   laid by this PRNG at module load, so a plate prints identically on
   every render and every machine — a screenshot diff means the drawing
   changed, not that the noise reseeded.
   ================================================================ */

export function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = (v: number) => Math.round(v * 10) / 10;

/** One square speck. Squares, not circles — a riso dot is a screen cell. */
export const speck = (x: number, y: number, s: number) =>
  `M${n1(x)} ${n1(y)}h${n1(s)}v${n1(s)}h${n1(-s)}z`;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const gauss = (t: number) => Math.exp(-t * t);

/**
 * Lay a field of specks whose probability AND size are functions of
 * position. `density` returns 0..1 — the chance a cell prints at all;
 * `size` returns the dot's edge in user units. Returns one path string,
 * because one <path> of a thousand specks costs what one <rect> costs.
 */
export function scatter(
  rnd: () => number,
  box: { x0: number; x1: number; y0: number; y1: number; step: number },
  density: (x: number, y: number) => number,
  size: (p: number, x: number, y: number) => number,
): string {
  const out: string[] = [];
  const { x0, x1, y0, y1, step } = box;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const jx = x + (rnd() - 0.5) * step * 1.4;
      const jy = y + (rnd() - 0.5) * step * 1.4;
      const p = clamp01(density(jx, jy));
      if (p <= 0 || rnd() > p) continue;
      const s = size(p, jx, jy);
      if (s > 0.08) out.push(speck(jx, jy, s));
    }
  }
  return out.join('');
}

/* ================================================================
   Plate shell
   ================================================================ */

/**
 * The svg wrapper. `slice` is the default because a plate bleeds — it
 * fills its box and lets the overflow leave the screen, rather than
 * letterboxing itself into a rectangle with cream margins.
 */
export function Plate({
  className = '', w, h, label, fit = 'xMidYMax slice', children,
}: {
  className?: string;
  w: number;
  h: number;
  label: string;
  fit?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={fit}
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}
