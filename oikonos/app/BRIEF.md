# OIKONOS — Build Brief

*Money, made clear.* A personal-finance app in the visual language of a
Mediterranean risograph print. Read this fully before writing a line.

---

## 1. The reference

`reference/phone1..4.png` are the master comps. They are the bar. Study
the one for your screen at full resolution before you start, and again
before you finish.

| file | screen |
| --- | --- |
| `reference/phone1.png` | Welcome — cobalt field, wordmark, Santorini cliff, GET STARTED pill |
| `reference/phone2.png` | Home — cream, greeting, net worth, sailboat/sun horizon, overview card, recent activity |
| `reference/phone3.png` | Transaction detail — full green field, category eyebrow, merchant, red amount, café still-life |
| `reference/phone4.png` | Goal detail — cream, goal name, amount of target, progress meter, Acropolis headland |

## 2. Non-negotiables

**Palette.** Only the four inks in `src/styles/tokens.css`: cream `--paper`,
cobalt `--ink`, pine `--olive`, vermilion `--vermilion`. Never grey.
Shadows are warm-brown, never neutral — use `--sh-*`. If you need a new
value, derive it in `tokens.css`, don't inline a hex.

**Type.** Fraunces for anything editorial — headings, merchant names,
every currency figure. Inter for UI: labels, buttons, metadata, table
rows. Eyebrows are Inter 600, uppercase, `--tr-label` tracking, 11px.
Figures use `.figure` (tabular numerals — digits must not shimmer while a
count-up animates).

**Money.** Indian grouping via `src/lib/format.ts`. `₹8,74,350`, never
`₹874,350`. Expenses take a true minus `−`, not a hyphen. Never
hand-format a number.

**Texture is the point.** This is a print, not a screen. Every saturated
field carries `tex-ink`, every cream surface `tex-paper`, every card
`tex-card`. A flat untextured colour block is an automatic fail.

**Motion.** Springs only, from `src/lib/motion.ts` — `snap`, `gentle`,
`surface`, `screen`. No hand-rolled stiffness values, no CSS transitions
on transforms. Entrances stagger. Meters fill from zero on first view.
Hero figures count up. Everything must respect `prefers-reduced-motion`
(the `Meter`/`Amount` primitives already do).

**Reuse the kit.** Open the live reference first — `npm run system`, or
`../DESIGN-SYSTEM.md` for the written version. `src/components/ui.tsx` has `Screen`, `Card`, `Button`,
`IconButton`, `TopBar`, `Meter`, `Amount`, `Delta`, `CategoryBadge`,
`Eyebrow`, `SectionHead`, `Rule`, `Stack`, `Rise`, `Empty`. Extend it if
something is genuinely missing; never fork a near-duplicate.

**Real data.** Everything renders from `src/data/store.tsx` selectors.
No hardcoded strings that duplicate seed data.

## 3. Layout rules

- Side gutter is `--gutter` (24px). Nothing but full-bleed illustration
  breaks it.
- 4pt vertical rhythm. Section gaps 28–32px, intra-section 12–16px.
- Scrollable body is `.pane`. Never let the tab bar overlap content —
  pad the scroll container's bottom by `--tabbar-h`.
- Illustrations bleed to the screen edge and sit *behind* text, never
  under it at low contrast. Text over illustration needs a real
  contrast plan (a scrim, a clear sky region, or repositioning).

## 4. Illustrations

Flat vector, 2–3 inks plus paper, no gradients except one soft stipple
gradient for depth. Shapes are confident and simple: a cliff is three
overlapping silhouettes, not a hundred beziers. Add grain with the
`tex-stipple` class or an inline `feTurbulence`. Live in
`src/illustrations/`, exported as React components taking `{className}`.

Never trace or reproduce the reference pixel-for-pixel — reinterpret the
same subject in the same hand.

## 5. Accessibility

Real semantics (`nav`, `button`, `role="progressbar"` with values), a
label on every icon-only control, visible focus (already themed), and
4.5:1 contrast on body text. `--fg-faint` on cream is for decoration
only, never for information.

## 6. Verification

```bash
export PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
npx tsc -b --noEmit          # must be clean
node tools/shoot.mjs home    # must print ✓ with no runtime errors
```

Screens are addressable for capture via `?screen=<name>&id=<id>` — the
router reads it in `App.tsx`. Look at your own screenshot before you
claim you are done. If you did not open the PNG, you are not done.
