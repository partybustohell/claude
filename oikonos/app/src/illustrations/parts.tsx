/**
 * PARTS
 * ============================================================
 * The recurring subjects of the OIKONOS world. Water shows up on six
 * screens, a pine ridge on nine, a cypress on eleven — drawn fresh each
 * time they drift, and a drifting cypress is how an app stops looking
 * illustrated by one hand.
 *
 * So they are drawn once, here, and cropped into by the plates.
 *
 * Every part takes an `id` — the plate's press namespace — because the
 * grain and the dither belong to the plate, not to the part. Every part
 * obeys the same light: THE SUN IS UPPER LEFT. Left-facing planes are
 * lit, right-facing planes fall to shade. No part may contradict it.
 */
import { ink, mulberry32, scatter, gauss, clamp01 } from './press';

/* ================================================================
   WATER
   ================================================================ */

/**
 * A cobalt sea from `y` to the bottom of `h`.
 *
 * Three depths, because a flat blue rectangle is the thing the brief
 * calls an automatic fail: light gathers near the horizon and dithers
 * out, the near field lays down heavier ink, and a handful of flat
 * swells sit on top so the sea is a shape with marks on it.
 */
export function Water({
  id, y, h, w = 390, swells = true,
}: { id: string; y: number; h: number; w?: number; swells?: boolean }) {
  const shimmer = Math.min(h * 0.42, 104);
  return (
    <>
      <g filter={ink(id, 'grain')}>
        <rect x="0" y={y} width={w} height={h} fill="var(--g-sea)" />
      </g>

      {/* light gathering at the horizon — dithered, never blurred */}
      <g mask={`url(#${id}-fade-down)`}>
        <rect x="0" y={y} width={w} height={shimmer}
          fill="var(--g-sea-lift)" filter={ink(id, 'stipple')} />
      </g>

      {/* the ink lays heavier in the near water */}
      <g mask={`url(#${id}-fade-up)`} opacity="0.6">
        <rect x="0" y={y + h * 0.55} width={w} height={h * 0.45}
          fill="var(--g-sea-deep)" filter={ink(id, 'stipple-coarse')} />
      </g>

      {/* the horizon itself: a printed edge, slightly proud */}
      <rect x="0" y={y} width={w} height="1.4" fill="var(--g-sea-lift)" opacity="0.9" />

      {swells && (
        <g fill="var(--g-sea-lift)" opacity="0.5">
          {SWELLS.filter((s) => y + s.dy < y + h).map((s, i) => (
            <rect key={i} x={s.x} y={y + s.dy} width={s.w}
              height={s.t} rx={s.t / 2} />
          ))}
        </g>
      )}
    </>
  );
}

/** Swell placement, fixed so the sea does not reshuffle between plates. */
const SWELLS = [
  { x: 12, dy: 17, w: 38, t: 1.6 }, { x: 64, dy: 25, w: 24, t: 1.6 },
  { x: 4, dy: 38, w: 28, t: 1.8 }, { x: 46, dy: 53, w: 34, t: 1.8 },
  { x: 0, dy: 74, w: 24, t: 2 }, { x: 36, dy: 85, w: 30, t: 2 },
  { x: 6, dy: 114, w: 26, t: 2.2 }, { x: 0, dy: 168, w: 20, t: 2.4 },
  { x: 214, dy: 30, w: 30, t: 1.6 }, { x: 288, dy: 46, w: 26, t: 1.8 },
  { x: 330, dy: 92, w: 34, t: 2 }, { x: 250, dy: 130, w: 28, t: 2.2 },
];

/**
 * The gradient masks Water needs. A plate declares these once in its
 * defs; keeping them out of Water means a plate with two water bands
 * does not emit two conflicting definitions of the same id.
 */
export function WaterDefs({ id, y, h, w = 390 }: {
  id: string; y: number; h: number; w?: number;
}) {
  const shimmer = Math.min(h * 0.42, 104);
  return (
    <>
      <linearGradient id={`${id}-grad-down`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-grad-up`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id={`${id}-fade-down`}>
        <rect x="0" y={y} width={w} height={shimmer} fill={`url(#${id}-grad-down)`} />
      </mask>
      <mask id={`${id}-fade-up`}>
        <rect x="0" y={y + h * 0.55} width={w} height={h * 0.45}
          fill={`url(#${id}-grad-up)`} />
      </mask>
    </>
  );
}

/* ================================================================
   REFLECTION
   ================================================================ */

/**
 * The dithered fan an object throws on water directly below it.
 *
 * The round-one art-direction note on Home was that the reflection
 * "sprays the full width of the screen and reads as dirt on the
 * scanner". So this one is bounded on purpose: density falls off as a
 * gaussian in x about the object's axis and decays with depth, and the
 * whole field stops dead at `reach`. It never wanders into type.
 */
export function Reflection({
  cx, y, reach = 46, spread = 16, seed = 7, fill = 'var(--g-sea-lift)', opacity = 0.62,
}: {
  cx: number; y: number; reach?: number; spread?: number;
  seed?: number; fill?: string; opacity?: number;
}) {
  const rnd = mulberry32(seed);
  const d = scatter(
    rnd,
    { x0: cx - spread * 2.2, x1: cx + spread * 2.2, y0: y, y1: y + reach, step: 2.6 },
    (x, yy) => {
      const t = (yy - y) / reach;                  // 0 at the waterline
      const across = gauss((x - cx) / (spread * (0.55 + t * 0.9)));
      return clamp01(across * (1 - t) * (1 - t) * 1.25);
    },
    (p) => 0.9 + p * 1.9,
  );
  return <path d={d} fill={fill} opacity={opacity} />;
}

/* ================================================================
   LAND
   ================================================================ */

/**
 * A far ridge on the horizon — the pale green that gives a seascape its
 * depth. `lift` raises the crest; the shape is three overlapping swells
 * of one path, not a mountain range.
 */
export function Ridge({
  id, y, lift = 22, w = 390, tone = 'var(--g-green-far)', opacity = 1,
}: {
  id: string; y: number; lift?: number; w?: number; tone?: string; opacity?: number;
}) {
  const d =
    `M0 ${y}V${y - lift * 0.55}`
    + `C${w * 0.09} ${y - lift} ${w * 0.2} ${y - lift * 1.05} ${w * 0.31} ${y - lift * 0.72}`
    + `C${w * 0.4} ${y - lift * 0.46} ${w * 0.47} ${y - lift * 0.2} ${w * 0.56} ${y - lift * 0.3}`
    + `C${w * 0.68} ${y - lift * 0.44} ${w * 0.8} ${y - lift * 0.94} ${w} ${y - lift * 0.6}`
    + `V${y}Z`;
  return (
    <g filter={ink(id, 'grain')} opacity={opacity}>
      <path d={d} fill={tone} />
      {/* the sun is upper left, so the left flank of each swell keeps light */}
      <path
        d={`M0 ${y - lift * 0.55}C${w * 0.09} ${y - lift} ${w * 0.2} ${y - lift * 1.05} ${w * 0.31} ${y - lift * 0.72}`}
        fill="none" stroke="var(--g-green-lit)" strokeWidth="2"
        strokeLinecap="round" opacity="0.45" filter={ink(id, 'stipple')}
      />
    </g>
  );
}

/* ================================================================
   CONTACT
   ----------------------------------------------------------------
   Round three's third systemic finding: eight of eleven plates were
   faulted for objects that cast nothing. "The awning throws no shadow
   on the shopfront beneath it." "Not one tree casts a shadow onto its
   terrace, so the trunks are stapled on rather than planted." "The
   cypress and the chapel both sit on the green with a hard cut edge and
   no anchoring dark, so they are decals, not objects."
   Round two fixed this for houses and for jars, one plate at a time,
   and every plate written afterwards repeated the omission — which is
   what happens when a rule is treated as a detail. It is a part now,
   and the parts that recur carry it themselves.
   ================================================================ */

/**
 * The anchoring dark where an object meets its ground. Offset to the
 * RIGHT, because the sun is upper left in every plate in this app.
 */
export function Contact({
  cx, cy, rx, ry, id, tone = 'var(--g-green-deep)', opacity = 0.4,
}: {
  cx: number; cy: number; rx: number; ry: number;
  id?: string; tone?: string; opacity?: number;
}) {
  return (
    <g>
      <ellipse cx={cx + rx * 0.3} cy={cy} rx={rx} ry={ry} fill={tone} opacity={opacity} />
      {/* dithered, so the shadow has no vector edge */}
      {id && (
        <ellipse cx={cx + rx * 0.3} cy={cy} rx={rx * 1.25} ry={ry * 1.3}
          fill={tone} opacity={opacity * 0.7} filter={ink(id, 'stipple')} />
      )}
    </g>
  );
}

/**
 * A cypress. Standing punctuation — it appears wherever a composition
 * needs a vertical to stop the eye running off.
 *
 * It plants itself: the contact shadow is drawn here rather than left
 * to each caller, because three separate plates were faulted for a
 * cypress that touched nothing.
 */
export function Cypress({
  x, base, h, lean = 0, id,
}: { x: number; base: number; h: number; lean?: number; id?: string }) {
  const w = h * 0.19;
  const top = base - h;
  const tip = x + lean;
  const body =
    `M${tip} ${top}`
    + `C${x + w * 0.86} ${top + h * 0.34} ${x + w * 0.72} ${top + h * 0.62} ${x + w * 0.58} ${base - h * 0.11}`
    + `C${x + w * 0.48} ${base - h * 0.02} ${x - w * 0.48} ${base - h * 0.02} ${x - w * 0.58} ${base - h * 0.11}`
    + `C${x - w * 0.72} ${top + h * 0.62} ${x - w * 0.86} ${top + h * 0.34} ${tip} ${top}Z`;
  return (
    <g>
      <Contact cx={x} cy={base} rx={h * 0.16} ry={h * 0.035} id={id} opacity={0.38} />
      <g filter={id ? ink(id, 'grain') : undefined}>
      <rect x={x - h * 0.017} y={base - h * 0.14} width={h * 0.034} height={h * 0.15}
        fill="var(--g-green-deep)" />
      <path d={body} fill="var(--g-green-deep)" />
      {/* lit flank, left, per the one sun */}
      <path
        d={`M${tip} ${top}C${x - w * 0.5} ${top + h * 0.36} ${x - w * 0.62} ${top + h * 0.66} ${x - w * 0.5} ${base - h * 0.08}`
          + `C${x - w * 0.72} ${top + h * 0.62} ${x - w * 0.86} ${top + h * 0.34} ${tip} ${top}Z`}
        fill="var(--g-green)" opacity="0.85"
      />
      </g>
    </g>
  );
}

/* ================================================================
   SKY
   ================================================================ */

/** A low sun. `cut` clips its lower limb, for a sun that is setting. */
export function Sun({
  cx, cy, r, id, tone = 'var(--g-clay)', cut,
}: { cx: number; cy: number; r: number; id: string; tone?: string; cut?: number }) {
  const disc = <circle cx={cx} cy={cy} r={r} fill={tone} />;
  return (
    <g filter={ink(id, 'grain')}>
      {cut === undefined ? disc : (
        <g clipPath={`url(#${id}-suncut)`}>{disc}</g>
      )}
    </g>
  );
}

/** Two gulls, drawn as the two strokes they are. Never more than two. */
export function Gulls({
  x, y, scale = 1, stroke = 'var(--g-sea)',
}: { x: number; y: number; scale?: number; stroke?: string }) {
  return (
    <g stroke={stroke} fill="none" strokeLinecap="round"
      transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 14c3.9-4.6 7.8-4.6 9.9 0 2.1-4.6 6-4.6 9.9 0" strokeWidth="1.5" />
      <path d="M37 0c2.2-2.7 4.4-2.7 5.6 0 1.2-2.7 3.4-2.7 5.6 0" strokeWidth="1.1" opacity="0.5" />
    </g>
  );
}

/* ================================================================
   BUILT WORK
   ================================================================ */

/**
 * A whitewashed cubic block — the unit the hill towns are built from.
 * Left face lit, right face shaded, flat roof catching the most light.
 * `d` is the depth of the right return; 0 draws it flat on.
 */
export function Block({
  x, y, w, h, d = 0, roof = true,
}: { x: number; y: number; w: number; h: number; d?: number; roof?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--g-stone)" />
      {/* the plane turning away from the sun */}
      {d > 0 && (
        <path d={`M${x + w} ${y}L${x + w + d} ${y - d * 0.42}L${x + w + d} ${y + h - d * 0.42}L${x + w} ${y + h}Z`}
          fill="var(--g-stone-shade)" />
      )}
      {roof && (
        <>
          {d > 0 && (
            <path d={`M${x} ${y}L${x + d} ${y - d * 0.42}L${x + w + d} ${y - d * 0.42}L${x + w} ${y}Z`}
              fill="var(--g-stone-hi)" />
          )}
          <rect x={x} y={y} width={w} height="1.2" fill="var(--g-stone-hi)" />
        </>
      )}
      {/* the lit edge on the left return */}
      <rect x={x} y={y} width="1.1" height={h} fill="var(--g-stone-hi)" opacity="0.8" />
    </g>
  );
}

/** A window or door void. Always ink — the inside of a wall is dark. */
export function Void({
  x, y, w, h, arch = false,
}: { x: number; y: number; w: number; h: number; arch?: boolean }) {
  if (!arch) return <rect x={x} y={y} width={w} height={h} fill="var(--g-sea)" />;
  return (
    <path
      d={`M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`}
      fill="var(--g-sea)"
    />
  );
}

/**
 * A blue barrel-vaulted dome on a drum — the chapel that ends every
 * Cycladic composition. Flat, per the round-one note: dome, ribs, cross,
 * done, and let the grain do the modelling.
 *
 * ── THE LIT RIM IS NOT DECORATION ────────────────────────────────
 * The dome is filled in the cobalt ink. On the cream plates that reads
 * immediately; on the welcome plate, whose whole ground IS that cobalt,
 * it rendered as nothing at all — a hole with a cross floating over it
 * and a few rib lines in mid-air. Same failure as cream canvas on a
 * cream sky, arrived at from the other end.
 *
 * So the dome carries a lit crescent down its upper-left, which is
 * where the sun is in every plate in this app. It separates the dome
 * from a dark ground, and on a pale ground it is simply correct
 * modelling — one addition that is right on both stocks, rather than a
 * per-screen exception.
 */
export function Dome({
  x, base, r, onInk = false,
}: { x: number; base: number; r: number; onInk?: boolean }) {
  const cy = base - r * 0.1;
  const ry = r * 0.92;
  /* On a cobalt ground the cobalt dome is the sky. A lit rim was not
     enough — round three read it as "a hollow cream outline with sky
     showing straight through". On ink stock the dome takes the lighter
     cobalt so it is a mass, not a hole. */
  const shell = onInk ? 'var(--g-sea-lift)' : 'var(--g-sea)';
  const rib = onInk ? 'var(--g-stone-hi)' : 'var(--g-sea-lift)';
  return (
    <g>
      {/* drum */}
      <rect x={x - r} y={base - r * 0.1} width={r * 2} height={r * 0.72}
        fill="var(--g-stone)" />
      <rect x={x - r} y={base - r * 0.1} width={r * 2} height="1.2"
        fill="var(--g-stone-hi)" />
      {/* dome */}
      <path d={`M${x - r} ${cy}A${r} ${ry} 0 0 1 ${x + r} ${cy}Z`} fill={shell} />
      {/* the lit rim: upper left, where the sun is */}
      <path
        d={`M${x - r} ${cy}A${r} ${ry} 0 0 1 ${x + r * 0.26} ${cy - ry * 0.96}`}
        fill="none" stroke="var(--g-stone-hi)" strokeWidth={Math.max(1.4, r * 0.11)}
        strokeLinecap="round"
      />
      {/* ribs — three, flat, no highlight */}
      <g stroke={rib} strokeWidth="0.9" opacity={onInk ? 0.4 : 0.5}>
        {[-0.55, 0, 0.55].map((t) => (
          <path key={t}
            d={`M${x + r * t * 0.9} ${cy}Q${x + r * t * 0.62} ${cy - r * 0.62} ${x + r * t * 0.2} ${cy - r * 0.9}`}
            fill="none" />
        ))}
      </g>
      {/* cross */}
      <rect x={x - 0.7} y={cy - r * 1.34} width="1.4" height={r * 0.42}
        fill="var(--g-stone-hi)" />
      <rect x={x - r * 0.16} y={cy - r * 1.2} width={r * 0.32} height="1.4"
        fill="var(--g-stone-hi)" />
    </g>
  );
}

/**
 * A terracotta pantile awning, striped. Reads instantly as a shopfront
 * and is the only place the warm ink carries a whole shape.
 */
export function Awning({
  x, y, w, drop, stripes = 7,
}: { x: number; y: number; w: number; drop: number; stripes?: number }) {
  const sw = w / stripes;
  return (
    <g>
      <path d={`M${x} ${y}L${x + w} ${y}L${x + w - 6} ${y + drop}L${x + 6} ${y + drop}Z`}
        fill="var(--g-stone)" />
      <g clipPath="none">
        {Array.from({ length: stripes }, (_, i) => i).filter((i) => i % 2 === 0).map((i) => {
          const x0 = x + i * sw;
          const inset = (drop / w) * 6;
          return (
            <path key={i}
              d={`M${x0} ${y}L${x0 + sw} ${y}L${x0 + sw - inset * 2} ${y + drop}L${x0 - inset * 2 + 6} ${y + drop}Z`}
              fill="var(--g-clay)" />
          );
        })}
      </g>
      {/* the scalloped hem, and the lit top edge */}
      <rect x={x} y={y - 1.4} width={w} height="2.4" fill="var(--g-stone-hi)" />
      <path d={`M${x + 6} ${y + drop}L${x + w - 6} ${y + drop}`}
        stroke="var(--g-clay-deep)" strokeWidth="1.6" opacity="0.5" />
    </g>
  );
}
