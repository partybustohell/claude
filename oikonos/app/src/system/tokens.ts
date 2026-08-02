/**
 * The token manifest.
 *
 * `styles/tokens.css` holds the *values*; this file holds the *meaning* —
 * what each token is for, which are safe to reach for, and which exist
 * only so another token can be derived. Values are never duplicated here:
 * the site reads them off the live cascade with `readTokens()`, so a
 * change in the stylesheet shows up in the documentation on the next
 * paint and the two can never disagree.
 *
 * `tools/audit.mjs` checks this manifest against the stylesheet in both
 * directions — a token added to one and not the other fails the build.
 */

export type TokenKind =
  | 'color'
  | 'shadow'
  | 'length'
  | 'font'
  | 'number'
  | 'duration'
  | 'easing'
  | 'string';

export interface TokenSpec {
  /** Custom property name, including the leading dashes. */
  name: string;
  /** What it is for, in one line. */
  role: string;
  /**
   * Tokens that exist to build other tokens, or that only a primitive
   * inside the kit should touch. Screens reach for the rest.
   */
  internal?: boolean;
}

export interface TokenGroup {
  id: string;
  title: string;
  kind: TokenKind;
  blurb: string;
  tokens: TokenSpec[];
}

/* ================================================================
   Colour
   ================================================================ */

export const PIGMENTS: TokenGroup = {
  id: 'pigments',
  title: 'Pigments',
  kind: 'color',
  blurb:
    'Four inks and their printing states. Cream is the sheet; cobalt, pine '
    + 'and vermilion are the three passes through the press. Every other '
    + 'colour in the system is one of these stepped toward the paper.',
  tokens: [
    { name: '--paper', role: 'The sheet. Default background of every light screen.' },
    { name: '--paper-warm', role: 'Recessed cream: grouped list bodies, quiet cards.' },
    { name: '--paper-deep', role: 'Pressed cream: meter tracks, segmented control ground.' },
    { name: '--paper-edge', role: 'Hairline weight on cream where a rule needs more presence.', internal: true },

    { name: '--ink', role: 'Cobalt. Brand, headings, primary figures, primary buttons.' },
    { name: '--ink-deep', role: 'Cobalt pressed — the shade side of a cobalt shape.', internal: true },
    { name: '--ink-lift', role: 'Cobalt highlight — the lit side of a cobalt shape.', internal: true },
    { name: '--ink-wash', role: 'Cobalt tint on cream. Quiet-button ground, soft fills.' },

    { name: '--olive', role: 'Aegean pine. Income, progress, growth, anything resolved.' },
    { name: '--olive-deep', role: 'Pine pressed.', internal: true },
    { name: '--olive-lift', role: 'Pine highlight.', internal: true },
    { name: '--olive-wash', role: 'Pine tint on cream.' },

    { name: '--vermilion', role: 'Riso red. Expenses, alarm, focus ring — the one loud ink.' },
    { name: '--vermilion-deep', role: 'Vermilion pressed.', internal: true },
    { name: '--vermilion-lift', role: 'Vermilion highlight.', internal: true },
    { name: '--vermilion-wash', role: 'Vermilion tint on cream.' },

    { name: '--sand', role: 'Illustration mid-tone. Drawings only, never UI.', internal: true },
    { name: '--terracotta', role: 'Illustration warm accent. Drawings only, never UI.', internal: true },

    { name: '--stage', role: 'The desk the device sits on — outside the print, behind the shell.', internal: true },
  ],
};

export const SEMANTIC: TokenGroup = {
  id: 'semantic',
  title: 'Semantic colour',
  kind: 'color',
  blurb:
    'What a screen actually reaches for. A component that names a pigment '
    + 'directly has skipped a decision someone else already made.',
  tokens: [
    { name: '--bg', role: 'Page ground.' },
    { name: '--fg', role: 'Body and heading text on cream.' },
    { name: '--fg-muted', role: 'Secondary text: metadata, captions, row subtitles. Passes 4.5:1.' },
    { name: '--fg-faint', role: 'Decoration only — chevrons, disabled glyphs. Never carries information.' },
    { name: '--on-ink', role: 'Text and icons on a cobalt or vermilion field.' },
    { name: '--on-ink-muted', role: 'Secondary text on cobalt.' },
    { name: '--on-olive', role: 'Text and icons on a pine field.' },
    { name: '--on-olive-muted', role: 'Secondary text on pine.' },
    { name: '--positive', role: 'Money coming in, goals ahead of pace.' },
    { name: '--negative', role: 'Money going out, budgets overrun.' },
    { name: '--ink-fill', role: 'Opaque cobalt wash for SVG area fills — the literal twin of --ink-wash.' },
    { name: '--olive-fill', role: 'Opaque pine wash for SVG area fills.' },
    { name: '--vermilion-fill', role: 'Opaque vermilion wash for SVG area fills.' },
    { name: '--scrim', role: 'Over a screen, under a sheet. Cobalt-black, never neutral black.' },
    { name: '--scrim-deep', role: 'Vignette inside the camera viewport.' },
    { name: '--hairline', role: 'Printed rule on cream.' },
    { name: '--hairline-soft', role: 'The quietest divider — inside grouped rows.' },
    { name: '--hairline-ink', role: 'Divider on a saturated field.' },
  ],
};

/* ================================================================
   Type
   ================================================================ */

export const TYPEFACES: TokenGroup = {
  id: 'typefaces',
  title: 'Typefaces',
  kind: 'font',
  blurb:
    'Two families, split by job rather than by size. Fraunces is editorial: '
    + 'headings, merchant names, every currency figure. Inter is the '
    + 'instrument panel: labels, buttons, metadata, table rows.',
  tokens: [
    { name: '--font-display', role: 'Fraunces. Editorial voice and all money.' },
    { name: '--font-sans', role: 'Inter. Interface voice.' },
    { name: '--wonk-off', role: 'Fraunces WONK axis off — the default.', internal: true },
    { name: '--wonk-on', role: 'Fraunces WONK axis on, for display sizes only.', internal: true },
  ],
};

export const TYPE_SCALE: TokenGroup = {
  id: 'type-scale',
  title: 'Type scale',
  kind: 'length',
  blurb:
    'A 1.25 minor third off a 16px base, rounded to whole pixels and '
    + 'trimmed at the small end where a strict ratio produces sizes too '
    + 'close to tell apart.',
  tokens: [
    { name: '--t-micro', role: 'Chart axis labels. The floor — nothing smaller ships.' },
    { name: '--t-label', role: 'Eyebrows, button labels, tab labels.' },
    { name: '--t-caption', role: 'Row subtitles, captions, group footnotes.' },
    { name: '--t-small', role: 'Dense metadata, row values, sub-headings.' },
    { name: '--t-body', role: 'Body copy and row titles.' },
    { name: '--t-lead', role: 'Standfirst, top-bar titles, sheet titles.' },
    { name: '--t-h4', role: 'Card headings, empty-state titles.' },
    { name: '--t-h3', role: 'Section headings inside a screen.' },
    { name: '--t-h2', role: 'Page titles.' },
    { name: '--t-h1', role: 'Hero titles.' },
    { name: '--t-hero', role: 'Hero figures — a net-worth or goal number.' },
    { name: '--t-mega', role: 'The keypad amount. One use, deliberately.' },
  ],
};

export const TYPE_METRICS: TokenGroup = {
  id: 'type-metrics',
  title: 'Leading and tracking',
  /* Ratios and ems, not lengths — drawing them as bars would imply a
     scale they do not have. */
  kind: 'string',
  blurb:
    'Line height tightens as size grows; tracking tightens with it. Only '
    + 'uppercase runs get positive tracking.',
  tokens: [
    { name: '--lh-tight', role: 'Hero figures — the number is the shape.' },
    { name: '--lh-snug', role: 'Display headings.' },
    { name: '--lh-body', role: 'Body copy.' },
    { name: '--lh-loose', role: 'Long-form passages: help, about, legal.' },
    { name: '--tr-label', role: 'Uppercase eyebrow tracking.' },
    { name: '--tr-caps', role: 'Wordmark tracking.' },
    { name: '--tr-tight', role: 'Display headings.' },
    { name: '--tr-tighter', role: 'Hero figures.' },
  ],
};

/* ================================================================
   Space, shape, elevation
   ================================================================ */

export const SPACE: TokenGroup = {
  id: 'space',
  title: 'Space',
  kind: 'length',
  blurb:
    'A 4pt grid. Steps are non-linear at the top so that "a gap between '
    + 'sections" and "a gap between rows" are never one step apart and '
    + 'never get confused.',
  tokens: [
    { name: '--s-1', role: 'Icon to its label.' },
    { name: '--s-2', role: 'Inside a chip.' },
    { name: '--s-3', role: 'Between stacked lines of text.' },
    { name: '--s-4', role: 'Default gap in a Stack.' },
    { name: '--s-5', role: 'Card padding, small.' },
    { name: '--s-6', role: 'Card padding, default. Equals the gutter.' },
    { name: '--s-7', role: 'Between sections of a screen.' },
    { name: '--s-8', role: 'Above a section that starts a new subject.' },
    { name: '--s-9', role: 'Around a hero figure.' },
    { name: '--s-10', role: 'Empty-state breathing room.' },
    { name: '--s-11', role: 'The largest interval in the system.' },
    { name: '--gutter', role: 'Screen side padding. Only a full-bleed illustration crosses it.' },
  ],
};

export const RADII: TokenGroup = {
  id: 'radii',
  title: 'Radii',
  kind: 'length',
  blurb:
    'Corner radius tracks the size of the shape, so curvature stays '
    + 'optically constant from a 24px chip to the device itself.',
  tokens: [
    { name: '--r-xs', role: 'Focus ring, tag, tiny chip.' },
    { name: '--r-sm', role: 'Row icon chip, inline swatch.' },
    { name: '--r-md', role: 'Input, small card.' },
    { name: '--r-lg', role: 'Card, grouped list body.' },
    { name: '--r-xl', role: 'Bottom sheet, hero panel.' },
    { name: '--r-pill', role: 'Buttons, segmented control, share bars.' },
    { name: '--r-device', role: 'The phone shell.', internal: true },
  ],
};

export const ELEVATION: TokenGroup = {
  id: 'elevation',
  title: 'Elevation',
  kind: 'shadow',
  blurb:
    'Shadows are warm brown, never neutral — a grey shadow over cream '
    + 'reads as dirt on the print. Each level is two shadows: a tight '
    + 'contact shadow and a wide ambient one.',
  tokens: [
    { name: '--sh-0', role: 'Flat on the page. Grouped rows, inline surfaces.' },
    { name: '--sh-1', role: 'Barely lifted — a card that is still part of the sheet.' },
    { name: '--sh-2', role: 'Default card.' },
    { name: '--sh-3', role: 'Hero card, floating control.' },
    { name: '--sh-4', role: 'Sheets and anything above the scrim.' },
    { name: '--sh-ink', role: 'Cast by a cobalt object — tinted cobalt, not brown.' },
    { name: '--sh-red', role: 'Cast by a vermilion object.' },
    { name: '--sh-sheet', role: 'Cast upward by a surface rising from the bottom edge — sheets and trays.' },
    { name: '--sh-press', role: 'Letterpress inset for pressed states.' },
  ],
};

export const TEXTURE: TokenGroup = {
  id: 'texture',
  title: 'Texture',
  kind: 'number',
  blurb:
    'Riso is paper tooth, uneven ink lay-down and slight misregistration. '
    + 'Three tiles reproduce it and these opacities tune each per surface. '
    + 'A flat untextured colour field is the one unambiguous system failure.',
  tokens: [
    { name: '--tex-paper', role: 'Fibre over cream, soft-light. Applied by .tex-paper.' },
    { name: '--tex-ink', role: 'Speckle over saturated fields, overlay. Applied by .tex-ink.' },
    { name: '--tex-card', role: 'Weave over raised cream, soft-light. Applied by .tex-card.' },
  ],
};

/* ================================================================
   Motion and device
   ================================================================ */

export const DURATION: TokenGroup = {
  id: 'duration',
  title: 'Duration',
  kind: 'duration',
  blurb:
    'For CSS transitions on colour and opacity only. Anything that moves '
    + 'in space uses a spring from lib/motion.ts instead. Under '
    + 'prefers-reduced-motion every duration here collapses to 1ms, so no '
    + 'component needs its own branch.',
  tokens: [
    { name: '--dur-1', role: 'Micro feedback: hover, tint change.' },
    { name: '--dur-2', role: 'Element enter, toggle track.' },
    { name: '--dur-3', role: 'Surface change.' },
    { name: '--dur-4', role: 'Screen transition.' },
  ],
};

export const EASING: TokenGroup = {
  id: 'easing',
  title: 'Easing',
  kind: 'easing',
  blurb: 'Three curves. Everything decelerates; nothing in this system eases in alone.',
  tokens: [
    { name: '--ease-out', role: 'Default. Fast start, long settle.' },
    { name: '--ease-in-out', role: 'Something leaving and returning.' },
    { name: '--ease-emph', role: 'Emphasised entrance — the longest tail.' },
  ],
};

export const DEVICE: TokenGroup = {
  id: 'device',
  title: 'Device',
  kind: 'length',
  blurb:
    'The app is drawn for one canvas. These are stated as tokens so a '
    + 'screen can reason about the safe area and the tab bar without '
    + 'measuring anything at runtime.',
  tokens: [
    { name: '--device-w', role: 'Viewport width the system is drawn for.' },
    { name: '--device-h', role: 'Viewport height.' },
    { name: '--safe-top', role: 'Status bar inset.' },
    { name: '--safe-bottom', role: 'Home indicator inset.' },
    { name: '--tabbar-h', role: 'Tab bar height. Scroll containers pad past it.' },
  ],
};

export const TOKEN_GROUPS: TokenGroup[] = [
  PIGMENTS, SEMANTIC,
  TYPEFACES, TYPE_SCALE, TYPE_METRICS,
  SPACE, RADII, ELEVATION, TEXTURE,
  DURATION, EASING, DEVICE,
];

/** Every token name the manifest documents. */
export const ALL_TOKEN_NAMES: string[] =
  TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => t.name));

/* ================================================================
   Reading live values
   ================================================================ */

/**
 * Resolve a custom property against the document root.
 *
 * Documentation that restates values goes stale the first time somebody
 * edits the stylesheet, so nothing in this site hard-codes one.
 */
export function readToken(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Resolve a value that may itself be a `var()` reference. */
export function resolveToken(name: string): string {
  const raw = readToken(name);
  const ref = /^var\((--[\w-]+)\)$/.exec(raw);
  return ref ? readToken(ref[1]) : raw;
}

/* ================================================================
   Colour maths — used to prove the palette rather than assert it
   ================================================================ */

export interface RGB { r: number; g: number; b: number; a: number }

export function parseColor(input: string): RGB | null {
  const s = input.trim();

  const hex = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
  }

  const fn = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }

  return null;
}

/** Composite a translucent colour over an opaque one. */
export function over(fg: RGB, bg: RGB): RGB {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function luminance(c: RGB): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/** WCAG 2.1 contrast ratio, 1–21. */
export function contrast(fg: RGB, bg: RGB): number {
  const f = fg.a < 1 ? over(fg, bg) : fg;
  const a = luminance(f);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastOf(fg: string, bg: string): number | null {
  const f = parseColor(fg);
  const b = parseColor(bg);
  if (!f || !b) return null;
  return contrast(f, b);
}

/**
 * Saturation as a share of the largest channel.
 *
 * The palette's one absolute rule is that no neutral grey may appear. A
 * colour whose channels sit within a few percent of each other is grey no
 * matter what it was mixed from, so the site measures every swatch rather
 * than trusting the name on it.
 */
export function chroma(c: RGB): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  return max === 0 ? 0 : (max - min) / max;
}

/** True when a colour has drifted close enough to neutral to be a bug. */
export function isNeutral(c: RGB, threshold = 0.06): boolean {
  return chroma(c) < threshold;
}
