# The Oikonos design system

*A Mediterranean risograph, printed at 390 points.*

This is the written half of the system. The other half is a live reference
that renders the real components and reads the real stylesheet:

```bash
cd app
npm install
npm run system          # opens /system.html
npm run audit           # checks the rules below mechanically
```

Nothing in this document restates a value. Values live in
`app/src/styles/tokens.css`; their meaning lives in
`app/src/system/tokens.ts`; the reference site reads both at paint time.
Where a number appears here it is because the number *is* the rule.

---

## 1. Principles

**It is a print, not a screen.** Every surface carries paper tooth or ink
grain. Colour is laid down in passes, not blended. A flat, untextured
colour field is the one defect that fails a screen outright, because it
breaks the premise the whole system rests on.

**Four inks, and no grey.** Cream, cobalt, pine, vermilion. Muted text is
cobalt stepped toward the paper, never a neutral. Shadows are warm brown.
A grey anywhere in a render is a bug with a traceable cause — almost
always a saturated ink faded to transparent.

**Money is editorial.** Figures are set in the serif, tabular, and large
enough to be read first. The furniture around them stays in the sans and
stays quiet. The number is the headline; the app is the page it sits on.

**Motion is physical.** Everything that moves moves on a spring, so an
interrupted gesture keeps its momentum. Four springs cover the app.
Durations exist only for colour and opacity.

**Extend the kit, never fork it.** A near-duplicate of an existing
primitive is how a system dies. If something is genuinely missing, add it
with its rules written down; if it is a variant, add the variant.

**Decoration never carries information.** Faint ink, texture and
illustration are atmosphere. Anything a user must read meets 4.5:1 on its
actual ground; anything a user must act on has a name, a role and a
visible focus state.

---

## 2. Colour

Four pigments and their printing states, plus a semantic layer that names
jobs rather than hues. Screens reach for the semantic layer.

| ink | token | carries |
| --- | --- | --- |
| Cream | `--paper` | the sheet everything is printed on |
| Cobalt | `--ink` | brand, headings, primary figures, primary actions |
| Pine | `--olive` | income, progress, growth, anything resolved |
| Vermilion | `--vermilion` | expense, alarm, focus — the one loud ink |

### The rule that gets broken by accident

Fading a saturated ink toward transparent over cream does **not** produce a
pale version of that ink. The paper is warm, so the mix runs through
neutral: cobalt at 20% over `#faf2e1` lands on a measured grey. Any area
fill, gradient stop, meter track or SVG ground must start from an opaque
wash instead — `--ink-wash`, `--olive-wash`, `--vermilion-wash`, or the
`--*-fill` tokens whose literal twins live in `INK_WASH_HEX` for SVG
attributes, where `var()` does not resolve.

To make a lighter relative of an ink, mix toward the paper:

```css
color-mix(in oklab, var(--ink) 70%, var(--paper))
```

The reference site computes both cases live and marks any swatch that
measures neutral, so this rule is checked by looking rather than by
remembering. `npm run audit` fails on a colour token that measures grey.

### Contrast

The reference renders the full text-on-ground matrix with measured WCAG
ratios. Two results are worth stating in prose because they constrain
design decisions:

- **`--fg-faint` fails 4.5:1 on cream, by design.** It is for chevrons,
  disabled glyphs and rules — marks whose meaning comes from position.
  The moment it carries a word a user needs, it is the wrong token.
- **Cream on vermilion measures ≈3.6:1.** That clears 3:1, so it is fine
  for a large figure, an icon, a rule or the focus ring — but it is short
  of 4.5:1 and may not carry small text. A solid vermilion button with a
  12px label is below the line today (`GoalDetail`'s primary action is the
  live case). The pairing that holds is `--vermilion-deep` at ≈4.8:1.

---

## 3. Typography

Two families, split by job rather than by size.

- **Fraunces** — editorial. Headings, merchant names, and every currency
  figure. Book weight (400) always; a heading's default bold reads as a
  different typeface next to it.
- **Inter** — interface. Labels, buttons, metadata, table rows.

Four utilities carry every decision the scale does not: `.display`
(Fraunces 400, opsz 90), `.figure` (Fraunces 400, opsz 110, tabular lining
numerals), `.eyebrow` (Inter 600, 11px, uppercase, 0.15em), and `.num`
(tabular numerals inside sans-set UI).

Tabular numerals are a requirement, not a refinement: hero figures count
up from zero on reveal, and proportional digits change width as they
cycle, so the number shimmers and the layout jitters for the length of the
animation.

The scale is a 1.25 minor third off a 16px base, from `--t-micro` (10px,
chart axes — the floor) to `--t-mega` (64px, the keypad amount, used once
deliberately). A raw px font-size in a component is an audit failure.

---

## 4. Space, shape and surface

A 4pt grid, one gutter, one radius ladder, one warm elevation scale. The
app is drawn for a single 390 × 844 canvas, so these are absolute rather
than fluid.

- **Gutter** is `--gutter`. Only a full-bleed illustration crosses it, and
  it runs *behind* text, never under it at low contrast.
- **Rhythm**: section gaps 28–32px, intra-section 12–16px. The gap between
  two sections must be visibly larger than any gap inside one — that
  difference is the only thing telling a reader where a group ends.
- **Scroll containers** pad their bottom by at least `--tabbar-h`. A
  half-visible row under the tab bar reads as a rendering fault.
- **Radius tracks size**, so curvature stays optically constant from a
  24px chip to the device shell.
- **Shadows are warm brown**, two per level: a tight contact shadow and a
  wide ambient one. `--sh-ink` and `--sh-red` exist because a saturated
  object casts a shadow tinted by its own ink. `--sh-sheet` casts upward,
  for surfaces rising from the bottom edge.

**Texture** is applied by surface type: `.tex-paper` over cream,
`.tex-ink` over saturated fields, `.tex-card` over raised cream,
`.tex-stipple` for illustration passages. A textured element needs
`position: relative`, `overflow: hidden` and `isolation: isolate` — the
utilities paint into `::before`/`::after` with blend modes, and without
isolation they blend against whatever is behind the element.

---

## 5. Motion

Four springs are the entire vocabulary, all in `src/lib/motion.ts`:

| spring | for |
| --- | --- |
| `snap` | press, toggle, chip, segmented pill |
| `gentle` | element enter, layout shift |
| `surface` | sheets, meters, cards taking flight |
| `screen` | route transitions |

`knob` is a fifth, stiffer preset used only by `Toggle`. Two eased curves
— `fade` and `reveal` — cover opacity, because a spring on opacity has
nowhere to put its overshoot.

Springs rather than curves because a spring carries momentum through an
interruption: grab a sheet mid-flight and it follows your finger instead
of restarting on a new curve.

Choreography that is already decided: routes push in from 26% and leave at
18% damped harder; sheets rise on `surface` and dismiss on a fling or a
third of their height; meters fill from zero the first time they enter
view, once; hero figures count up over 1.5s; press scale falls with target
size (`pressScale`).

Reduced motion is honoured at the token layer — every `--dur-*` collapses
to 1ms — and inside every animated primitive, which reads
`useReducedMotion()` and jumps to the end state.

Spring constants outside `lib/motion.ts` are an audit failure.

---

## 6. Components

The kit is `src/components/ui.tsx`. Every entry is documented with a live
specimen and a prop table in the reference site; the contracts worth
knowing in prose:

| component | contract |
| --- | --- |
| `Screen` | The route's ground. `tone` picks cream, cobalt or pine and applies the matching texture. A saturated tone must also be registered in `DARK_ROUTES`. |
| `Button` | Four variants, four inks. One primary per screen region. Labels are uppercase, verb first, two words at most. |
| `IconButton` | `label` is required — an icon-only control cannot ship unnamed. |
| `Card` | Cream or saturated panel; texture and text colour follow the tone. `onClick` turns it into a real button with press physics. |
| `Row` / `Group` | Every list in the app. Titles and subtitles truncate rather than wrap; a chevron only ever means "this navigates". |
| `Meter` | The signature primitive. Fills from zero on first view. Its track is opaque cream, because a translucent cobalt track resolves to grey. |
| `Amount` | Every currency figure. Indian grouping, true minus, tabular, counts up once. Pass `animate={false}` inside rows and chips. |
| `Delta` | Draws an arrow as well as colouring the figure, so direction survives colour blindness. |
| `Toggle` / `Choice` / `Segmented` | Real `switch`, `radio` and `tablist` semantics. `Segmented` needs a unique `id`; the moving pill is a shared layout animation. |
| `Stack` / `Rise` | Staggered entrance, 55ms apart, driven by the container rather than by each child. |
| `Empty` | The one shape every zero state takes. Say what will appear here and how it gets here. |
| `TopBar` / `PageHead` | A pushed screen gets one or the other, never both. Hero screens use neither. |

Charts live in `src/components/charts.tsx`: `Sparkline`, `MonthColumns`,
`Ring`, `ShareBar`, and `tintScale` for stepping an ink toward the paper
when adjacent segments would otherwise fuse. Charts are `aria-hidden` —
the figure beside a chart carries the same value in text. If a chart is
the only place a value appears, that is a content bug.

---

## 7. Patterns

Thirty-nine routes resolve to eight shapes: ink hero, cream hero, ink
detail, progress detail, grouped list, settings, analysis, sheet. The
reference site embeds the running app for each one, so an archetype cannot
drift in documentation without drifting on screen.

**Navigation** is a four-tab root with a push stack on top. `push`/`back`
move the stack; `goTab` is lateral and resets it; `reset` replaces it;
`openSheet` presents over all of it. Every route is addressable as
`?screen=<name>&id=<id>&sheet=<kind>`, which is how the capture harness,
the blind-comparison tool and the reference tiles all reach the same
screens without a special build.

**Sheets** are for a decision belonging to the screen behind them.
Anything that is its own subject gets a route. Content-sized, capped at
88%, dismissed by fling, drag, scrim tap or Escape.

**Data comes from selectors.** A screen that hardcodes a string already in
the seed data will disagree with the rest of the app the first time the
data changes.

---

## 8. Content

All number and date rendering is `src/lib/format.ts`. Never hand-format:
grouping, the minus sign, the rupee symbol and rounding each have exactly
one implementation.

- `inr` / `signedINR` — ₹8,74,350 with Indian grouping and a true minus.
- `compactINR` — ₹8.7L, ₹1.2Cr, for axis labels and dense chips only.
- `pctOf` — always floors, so a goal one rupee short never reads as 100%.
- `relativeDay`, `longDateTime`, `monthLabel` — every date a screen shows.

**Voice**: a calm ledger, not a coach. Second person about the user's own
money; state what happened and what is true now. Sentence case for titles
and rows, uppercase for eyebrows and buttons, full sentences with periods
for captions. No congratulation, no scolding, no exclamation marks, no
bank jargon.

---

## 9. Accessibility

The visual language is unusual; the semantics are not.

- Real elements and roles: `progressbar`, `switch`, `radio`, `tablist`,
  `nav`. Icon-only controls take a required label.
- Focus is a vermilion ring at 3px offset, defined once in `global.css`.
  Vermilion because it is the one ink that never fills a surface.
- Colour is never the only signal: signs, arrows and words double every
  use of pine and vermilion.
- Touch targets are at least 44px.
- Text over illustration needs a contrast plan — a scrim, a clear region,
  or repositioning.
- Texture slightly reduces effective contrast on saturated fields, so
  treat a pairing that only just passes as failing.

---

## 10. Working in the system

| path | holds |
| --- | --- |
| `app/src/styles/tokens.css` | every value; the only file allowed a raw colour |
| `app/src/styles/global.css` | fonts, reset, texture primitives, type utilities, focus |
| `app/src/lib/motion.ts` | springs, variants, press physics |
| `app/src/lib/format.ts` | numbers, currency, dates |
| `app/src/components/` | the kit, charts, icons, device shell |
| `app/src/system/` | this system's live reference |
| `app/tools/audit.mjs` | the guardrail |

**Adding a token**: derive it in `tokens.css` from a value already there,
then describe it in `src/system/tokens.ts`. The audit fails on a token
present in one and not the other, so documentation cannot fall behind.

**Adding a component**: it goes in `ui.tsx`, takes colours as `Ink` values
rather than strings, reads motion from `lib/motion.ts`, and arrives in the
reference with a specimen and a prop table. Check first whether an
existing primitive could take a prop instead.

### What the audit enforces

| check | fails when |
| --- | --- |
| token parity | a custom property is declared but undocumented, or documented but undeclared |
| no neutral | a colour token measures grey — every channel within a few percent |
| var() resolves | a `var()` names a property nothing declares |
| closed palette | a literal colour appears that is in no token — a new ink entering without a decision |
| springs | `stiffness` is set outside `lib/motion.ts` |
| currency | a screen welds ₹ to a number instead of calling the formatters |

Repeating a palette colour literally instead of through a token is
reported as a note rather than an error: it is drift worth cleaning, not a
break. The device shell (`PhoneFrame.css`) is exempt — it is hardware, not
print, and its bezel is genuinely neutral. Illustrations are exempt from
the token requirement because SVG attributes cannot resolve `var()`, but
their literal count is reported.

### Verification

```bash
cd app
npm run audit                     # the rules above
npx tsc -b --noEmit               # types
npm run lint                      # oxlint

export PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
node tools/shoot.mjs              # render every screen to shots/
node tools/shoot-system.mjs       # render every chapter of the reference
node tools/flow.mjs               # drive the app and assert it works
python3 tools/duel.py home shots/bare/home.png reference/phone2.png
```

`duel.py` composites a render and the master comp onto one sheet, labelled
only A and B, with the answer key written outside the directory the
reviewer reads — so a critic judging the sheet cannot know which panel is
the app. It is the only way to get an honest verdict on whether the system
is holding.

---

## 11. Known gaps

- **Vermilion + cream text is below AA** at small sizes, and one live
  screen relies on it (see §2). Either restrict solid vermilion to large
  labels or move those buttons to `--vermilion-deep`.
- **Literal palette colours** persist in about thirty files (the audit
  counts them). They are all palette values, so nothing is off-system, but
  each one is a token waiting to be used.
- **The system is single-theme by choice.** There is no dark mode: the
  product is ink on cream paper, and only the stage the device stands on
  answers the viewer's theme.
