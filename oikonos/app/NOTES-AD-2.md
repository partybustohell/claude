# Art direction notes — round 2

Round 1 judged the four hero screens against their master comps. This
round covers the other thirty-eight, which had no drawing on them at
all, and it judges them against the brief rather than against a comp —
there is no comp for a settings screen.

Every finding below was caught by looking at a render, not by reading
the source. Where a fix is claimed, the plate was re-pulled and looked
at again.

---

## What was built

**The press** (`illustrations/press.tsx`). Each of the four original
plates carried its own copy of the grain filter, the dither threshold
and the entrance stagger — four plates, four slightly different
presses. They are now one machine: `<Press id>` emits the four filters,
`useLayer` the entrance, `scatter` the seeded speck fields. A plate
declares the press and gets exactly what every other plate gets.

**The parts** (`illustrations/parts.tsx`). Water, a far ridge, a
cypress, a reflection, a whitewashed block, a void, a dome, an awning.
Drawn once. A cypress that is redrawn on every plate drifts, and a
drifting cypress is how an app stops looking like it was illustrated by
one hand.

**Ten new plates**, cropped into by 38 screens: harbour, amphorae,
ascent, windmill, mosaic, lighthouse, shopfront, colophon, santorini,
olive grove. The mapping is by subject, not by mood — an account is a
vessel, an envelope is a jar, a subscription is a mill that turns
whether or not you looked at it, a category is a tessera.

**Placement** is one of two weights and there is no third. A dense
ledger gets a FOOT plate, at the end of the scroll where it cannot
fight a number. A screen with a hero region gets a BAND. Nothing is
laid under type.

---

## Defects found and fixed

### 1. The palette contained a grey, and had since round one

`--g-stone-shade` was `paper 74% + ink 26%`. Measured: **rgb(188, 194,
206), 8.7% saturation** — a grey by any reading, and the brief's first
non-negotiable is that this palette has no grey in it.

The cause is structural rather than careless: cream is warm, cobalt is
cool, and a light tint of one in the other passes *through* neutral on
its way. The round-one sparkline fix had already found the same trap
from the other direction.

Shading toward `--ink-lift` instead holds chroma at the same value.
`paper 66% + ink-lift 34%` measures rgb(175, 186, 210) at 16.7% — above
the app's own `--ink-wash` (11.2%) and unmistakably blue.

This was not a new-plate bug. `--g-stone-shade` is what the Acropolis
temple's flank columns and shaded planes are painted with, so the fix
lands on a screen that had already passed two rounds of critique.

### 2. The goal cover picker did nothing

New Goal has offered four covers — Acropolis, Santorini, Harbour, Olive
grove — since the screen was built, and stores the choice on the goal.
`GoalDetail` ignored it and rendered `GoalAcropolis` unconditionally.
Picking a cover changed a 72×44 thumbnail and nothing else.

Two of the four plates did not exist. They do now, and `scenes.tsx`
maps the stored value to a plate and to the height that plate wants —
per scene, because forcing a 250-tall harbour into a 470 box scales it
half again and crops the quay off both sides.

### 3. Illustration inks were scoped to one screen

`--g-roof`, `--g-gap` and the stone values were declared on `.goal`, so
they resolved nowhere else. Anything drawn outside that screen got an
invalid `fill` and inherited **black** — which is how the press proof
came back with a black temple roof. Found immediately by looking at a
plate outside the screen it was built for, which is the entire argument
for the proof harness. All illustration inks now live in `tokens.css`.

### 4. Plates were cropped from the wrong end

`PlateFoot` crops a plate to the height a screen can spare. It was
anchoring the drawing to the *top* of that box, so a short crop kept
the sky and threw away the ground. The bill screen came back showing a
windmill's sails floating over nothing. A plate's ground line — the
waterline, the pavement, the shelf — is the part that has to survive.
Now anchored to the bottom.

### 5. Cream canvas on a cream sky

The windmill's sails were `--g-stone` on bare paper: invisible. The
first pull was a bare spider of spars. White canvas against a pale sky
needs an edge, so the jibs are now cream inside a cobalt outline.

### 6. A river of bare paper

The windmill's far ridge sat at y=150 and its near ground started at
y=176, leaving a band of untouched stock between two greens. It read as
a printing fault, not a valley. Both now meet on one line, and
everything standing on the ground is placed with `groundAt(x)` rather
than by eye.

### 7. The mosaic was confetti

Chips on a flat grid with the four inks dealt at random: no ground, no
depth, and it would have fought every line of type near it. Two
structural fixes — the rows now recede, and the coloured chips sit on a
repeating lattice instead of being scattered. A real pavement is mostly
its ground colour with a figure laid into it. The meander border also
did not close, and broke into unreadable glyphs; it is one continuous
key now.

### 8. The colophon was a Venn diagram

Four near-equal discs in a tidy row with a hole through the middle —
the one reading the plate must not have, since a Venn diagram is an
argument about sets and this is a statement about ink. Fixed by
refusing the symmetry: radii 78/34/58/92 on a falling diagonal, the
last drum running off the right edge, and the paper knock-out moved off
the crossing point.

### 9. The amphorae were light bulbs

Proportion, not drawing. The neck was a fifth of the height and nearly
as wide as the belly, so there was no waist — and without a waist an
amphora is a balloon. A storage jar's neck is long and narrow, a third
of the belly's width, and the shoulder breaks hard out of it. Handles
also ran inside the neck's own width and read as wire; they now run
from neck to shoulder, where a jar is actually lifted. The clay band
moved off the throat onto the belly.

### 10. The hull dissolved into the sea

The harbour's caique was drawn in `--g-sea-deep` on a `--g-sea` field:
an ink hull on an ink sea is a hole, not a boat. It is a whitewashed
caique now — the lightest mass in the plate, because it has to separate
from the water it sits on. The quay had the same problem in reverse and
read as a concrete pontoon; it is whitewashed stone in blue shade,
which is what the rest of the app is built of.

### 11. The Santorini town floated

Houses at hand-chosen coordinates came back as a pile of white boxes
sitting on a hillside, none of them standing on anything — the same
fault round one caught on the welcome cliff. Rebuilt against a sampled
crest: three courses at a known drop below it, with the terrace each
course stands on actually drawn. The terraces are trimmed to the town's
extent, because carried the full length of the crest they read as pale
streaks scored across bare rock.

---

## Deliberately not done

- **Scan** keeps its viewfinder as its subject and takes only a low
  silhouette band at the foot of the ink plate, below every control. A
  drawing behind a camera frame is clutter.
- **Search** carries its plate on the resting state only. Once there is
  a query the pane is a list of answers and must stay dense.
- The **settings cluster** takes the colophon rather than a landscape.
  These screens are about the app, not about a place, and a headland
  behind a list of toggles is decoration for its own sake.
  (Its discs run at 0.55 — which is not the pale-wash trap described
  below, because they MULTIPLY a full-strength ink rather than tinting
  one. Measured over cream: rgb(120,139,174), 31% saturation. Multiply
  keeps chroma as it darkens; a plain alpha tint sheds it.)

---

# Round 2b — the three open items, closed

### The olive grove's terrace walls were chalky

They were painted in the whitewash values, and whitewash is what a
BUILDING is. A dry-stone terrace in a grove is warm rubble weathered by
sun; in cream it read as chalk streaks scored across the hill. There is
now a `--g-wall` family mixed from `--sand` — which is in the palette
for exactly this and is already what the goal-cover thumbnails use as
ground, for exactly this reason. Face in the grove's own shadow, coping
in the sun, far rows losing contrast rather than width.

While re-pulling it: the trees had **no trunks**. The trunk path ran
from `y + 0.26r` upward, and the canopy's lowest lobe reaches
`y + 0.34r` — so every trunk was drawn perfectly inside its own canopy
and the grove was a row of bushes. Trunks now clear the foliage and the
cast shadow sits at the foot of the trunk rather than under the canopy.

### The mosaic's lattice sheared into stripes

Two causes, one structural and one arithmetic.

The arithmetic: the column count changed per row, so a diagonal computed
from the column index landed at a different physical x in every row.
Column count is constant now, which also draws the floor more correctly
— this floor spans the full plate width at every depth, so a tile should
keep its WIDTH going away from you and lose its HEIGHT. Constant columns
plus row height from `rowY()` gives that foreshortening for free.

The structural one is that **crossed diagonals cannot survive this
floor** at all. The rows compress with depth, so a line stepping one
column per row has a steep slope at the front and a nearly flat one at
the back; it bends. Two crossing diagonals were also laying down 44%
coverage, when the whole point was a cream ground with a figure in it.
Replaced with a rosette — four cobalt arms about a clay heart — which is
a closed figure, keeps its shape whatever the row spacing does, and sits
at about a quarter coverage. The motif drops out past the fourth row,
because distance eats detail before it eats colour.

### The amphorae shelf had dead cream under it

A tab screen's scroll reserves the tab bar's height at its foot so no
ROW ends up underneath the bar. A plate is not a row — it is the end of
the page — and stopping it a bar's height short left a band of bare
cream between the drawing and the chrome that read as the plate having
failed to load. `plate-foot--tabbar` pulls that reservation back.
Measured after: plate bottom 769, tab bar top 769, gap **0** on all three
tab screens, with the lowest line of text still clearing the bar by
200px or more.

---

## And a fourth, found while fixing the third

**The grey came back — through opacity this time.**

The token fix in round 2 corrected the ink values. It did not catch that
the same failure arrives just as easily through `opacity`, because a
pale wash of ANY ink over cream trends to neutral. Three of them had
been introduced:

| where | composited | saturation |
| --- | --- | --- |
| amphorae shelf face, `--g-stone-shade` @ 0.62 | rgb(204,207,216) | 5.6% |
| mosaic grout, `--g-stone-shade` @ 0.42 | rgb(219,218,219) | **0.5%** |
| mosaic depth haze, `--g-stone-mid` @ 0.34 | rgb(214,215,218) | 1.8% |

The grout is the worst of the three: half a percent is a dead neutral,
and it showed in every joint of the floor.

- The shelf face is full opacity now. A plane turned away from the sun
  is a plane, not a wash; lightening it was the wrong instinct.
- The grout is warm lime mortar, which is what a mosaic is actually
  bedded in.
- The depth haze is **deleted rather than replaced**. A pale film over
  cream cannot be anything but neutral, and the floor already carries
  its depth honestly through foreshortening and the motif dropping out.
  Nothing needed to take its place.

The rule, stated properly this time: **no pale wash over cream, whatever
ink it starts from.** Depth and shade are carried by dither coverage or
by a fully-opaque derived value — never by turning an ink down.
