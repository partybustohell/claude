# Art direction notes — round 5

Three things round four left open: the dither was too fine to read as
coverage, and shopfront and colophon had lost clear twice each without
moving, on compositional faults no systemic fix reaches.

## Result

| plate | round 3 | round 4 | round 5 |
| --- | --- | --- | --- |
| shopfront | loss clear | loss clear | **win clear** |
| colophon | loss clear | loss clear | **win clear** |
| windmill | loss narrow | win narrow | loss narrow |

Both redraws swung two steps. The windmill regressed, and that verdict
is the most useful thing in this round — see below.

---

## 1. The dither

The screen is not one frequency any more, because one cell size cannot
serve every mass. At 0.7 the cells were 1.4 user units and averaged into
tone. Opening them to 0.11 fixed the hillsides and broke the towers: an
8-unit cell on a 70-unit shaft is camouflage, not a screen. There are
three scales now — `fine` / `mid` / `coarse` — and a ramp picks the one
that matches what it is shading.

The threshold matters as much as the frequency. At an alpha slope of 3.4
the band where turbulence crosses the threshold is a third of the noise
range wide, so every dot fades out at its own rim and the field reads as
soft cloud — a gradient made of blobs. At 18 the band is a twentieth: a
cell either takes ink or it does not, which is the only thing a drum can
do.

### The bug this uncovered, which was the real problem all along

Round five's blind critic on the windmill: *"the mottling is identical on
the left and right cheeks of the tower, and it therefore describes
nothing about light."*

Correct, and the cause was not the dot size. `RampDefs` expressed its
gradient in objectBoundingBox units on a rect covering the **whole
plate**. Across a hillside that fills the plate, that works. Across a
70-unit tower it changed by a fifth of a stop — so both cheeks got the
same coverage and the cylinder never turned. Every ramp on a small
object had been doing nothing since the day it was written, and three
rounds of "the ramps still look like gradients" were partly this.

Ramps now take the box of the mass they model. The tower reads as bare
stock on the lit side building to dense coverage in the shade.

**This fix landed after the duel.** The windmill's loss is on the broken
version. It has not been re-judged.

---

## 2. Shopfront, redrawn

The old plate was a flat elevation — wall band, shop band, pavement
band, each full width, nothing in front of anything. Two critics
independently: *"assembled, not drawn"*, *"no focal point"*, *"illegible
stubs"*.

It is a corner in three-quarter view now. The right flank recedes, the
steps come forward, the crates overlap each other, the pot overlaps the
wall. One focal point — the doorway is the darkest hole in the plate,
the only place warm ink shows from inside, and the awning stripes and
the steps both point into it.

Three bugs found by looking at the render rather than the source:

- **The flank ran through the ground.** Extending the wall by its own
  height from a raised far corner put its foot thirty units below the
  pavement. The ground recedes too; the far corner sits above the near.
- **The awning canvas was invisible.** Cream cloth on a cream wall with
  no boundary — the stripes read as bunting strung across the front. It
  has a cobalt rail and hem now.
- **A flat wall does not need a ramp.** A `ScreenRamp` on the facade came
  back as camouflage. A screen describes a mass that TURNS; a wall is one
  plane facing one way. The only value change it earns is the strip
  nearest the corner, and that has a hard edge because the corner does.

---

## 3. Colophon, redrawn

*"Four circles of near-equal weight strung in a row… no focal point, no
ground plane, no light — the question 'where is the sun' cannot even be
asked."* Four abstract discs was the whole idea and the whole problem.

It is a sheet on a press bed now: a real object, lit upper-left, one
corner curled off the bed and casting. Registration marks sit in the
bed's margin, off the sheet, where a pressman puts them.

Two medium findings, both measured:

- **Multiply is not overprinting.** Cobalt × clay at full strength
  computes to rgb(12,15,28) — black, which the palette does not contain,
  and the plate came back with a black bite out of it. A riso cannot lay
  solid over solid; it lays a SCREEN over the first pass and the first
  colour shows between the second's dots. The disc prints solid on bare
  stock and the cobalt is screened back over it where they cross.
- **A pine pass on a pine bed is a hole.** The first pull had a pine bar
  on the sheet and a pine bed under it: the bar read as a hole punched
  through the paper. Pine is the bed now, so all four inks are on the
  page with no two of them fighting.

Post-duel, from the critic who scored it a win: the misregistration
ghost was a tinted fill of the whole shape, which composited to
rgb(207,208,209) — the neutral-grey trap again — and the curl was a
half-strength blue with no dot structure. Misregistration shows at the
EDGE: it is a screened outline, offset, so the ink appears to have
landed a hair off its own outline.

---

## Still open

- **The windmill needs re-judging** on the fixed ramp.
- **The acropolis gullies.** Six critics across three rounds have now
  called the fanned `rake()` striping decorative patterning unrelated to
  light. It is the last un-fixed instance of the fault the welcome cliff
  was rebuilt for, and it is on a hero plate.
- **`--g-stone-shade`** still draws the word grey out of critics at
  16.7% saturation. It should probably not be a tint at all — it should
  be coverage, like everything else now is.
- **The screen is stochastic, not a lattice.** *"There is no dot lattice
  in it."* FM screening is a real technology and defensible, but a
  regular halftone grid would answer the objection outright.
