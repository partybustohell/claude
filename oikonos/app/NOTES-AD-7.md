# Art direction notes — round 7

The windmill, drawn again from nothing.

## Result

| plate | r3 | r4 | r5 | r6 | r7 |
| --- | --- | --- | --- | --- | --- |
| windmill | loss narrow | win narrow | loss narrow | loss clear | **win clear** |

Two clear wins, on different seeds and opposite side assignments: `x01`
on the first cut of the redraw, `x02` on the version recomposed to fit
the crop. Both against `horizon`, the hero plate.

---

## 1. What was actually wrong, and it was not the drawing

Round six measured it and round seven fixed it. `screen-*` dithers
whatever it is handed — it thins the dots, but the ink in each dot is
whatever the caller passed, and every caller passed a **mixed tint**.
`--g-stone-mid` is 48% cobalt stirred into cream. So the plate thinned
the dots *and* weakened the ink, and half of each did nothing.

Inside the old tower silhouette:

| | old plate | new plate |
| --- | --- | --- |
| coverage across the shaft | 0% → 68% | 0% → 73.7% |
| of inked pixels, at FULL ink | **0.0%** | **100%** |
| stuck between 10% and 50% | 37.6% | 0.78% |

The coverage was never the problem. The ink in the dots was.

### `Cov`

The new primitive takes the alpha it is handed as the **wanted
coverage** and returns full-strength ink at that coverage. Turbulence,
stretched so a cell's threshold spans the full range; subtract it from
the wanted coverage; hard-step the difference; then force the source's
alpha to 1, which un-premultiplies the fill back to full strength.

Ask for 0.4 and it does not print a 40% ink. It prints 40% of the cells
at 100% ink and leaves the rest bare paper, which is the only thing a
drum can do. Constant coverage comes in through `fillOpacity`; a mass
that turns gets a `CovMask`.

It does not reach solid — a cell whose threshold clamps at the top never
takes ink — so anything that must be solid is drawn as a solid fill and
the screen is used only where the mass turns. Measured: the far ridge
asks for 0.36 and prints 40.7%.

`screen-*` is untouched, so no other plate moved.

### The blind confirmation

Neither critic was told any of this. The first sampled pixels: *"discrete
full-strength pixels — cobalt (13,57,150) — scattered over cream at
varying density, never a faded fill."* The second ran connected-blob
analysis over both panels and reported ours as *"252 clusters of 9px+
whose peak ink reaches alpha 1.09 against cream… value turned purely by
how many dots sit per unit area"* — and then said this about the
**reference**:

> "4-8px blobs peak at median alpha 0.61 and even 9px+ blobs only 0.80;
> just 9 pixels in 37,600 reach full cobalt. Those are not dots of ink,
> they are a tint of ink, a half-strength drum no riso owns."

The hero plate now fails the exact test this one had lost on for five
rounds. That is the most useful sentence in seven rounds of duels: the
yardstick has a fault, and every earlier "the reference prints better"
verdict was partly measuring a plate nobody had measured.

---

## 2. The rotors were orbiting, not spinning

Framer puts `transform-box: fill-box` on SVG elements, so `originX` /
`originY` in pixels are measured from the corner of the element's own
bounding box rather than from the plate's coordinate system. The wheel
swung about a point well outside itself.

It is very likely what round six's critic saw as *"one lower blade tip
dying in mid-air over the tower wall"* — by the time the shutter opened,
the tip was somewhere else. Four rounds of verdicts on a wheel that was
never where the source said it was.

Blades are drawn about the origin now and the mill is placed with an
ordinary translate. The wheel's box is symmetric, so the DEFAULT origin
is the hub exactly and no CSS has to be right for the drawing to be
right.

---

## 3. The plate did not fit where it is used

`PlateFoot` **crops** rather than scales, and the tightest caller —
Recurring — asks for 150 of the plate's 250 units. The first cut of this
redraw put the hub at y 110 with a 52-unit radius, so on that screen the
mill arrived sawn in half.

This was not in any critique, because no critic sees the app. Everything
that has to read lives below y 102 now; the near wheel's topmost point
is y 103.

*A plate is not finished when it looks right in the proof. It is
finished when it looks right where it is used.* Worth checking the other
thirteen against their callers.

---

## 4. The drawing

Three mills along a ridge, which is what Mykonos has and also what the
recurring cluster is arguing: the near one working, the far one working,
the third stopped. A subscription you forgot about is the third one.

- **The light.** Upper left. The near wheel throws itself onto its own
  tower and the shadow turns as the wheel turns — one rotating cast
  shadow, the only one in the app. Both mills, the ruin, both cypresses
  and the wall throw, in cobalt over pine, which is what a second drum
  does to a first.
- **The wheel.** Twelve blades, every tip on one circle, and the hoop
  that joins them is drawn. A Cycladic mill has one, and it is what
  makes the wheel a single shape instead of a lumpy twelve-pointed star.
- **The ground.** Solid pine, turned by a cobalt overprint that builds
  as the slope leans out of the light. Two earlier attempts failed and
  both are worth remembering: pine at 76% coverage across the whole face
  read as a hedge, and paper dots scattered along the crest read as
  scrub — *paper dots over green make foliage, because that is what
  foliage is.*
- **The openings.** Both solid cobalt. A hole is a hole.

Ink audit: cream 77.4%, pine 11.0%, cobalt 9.7%, vermilion 0.36%,
near-neutral 1.20%.

---

## Still open

From the round-seven critic, on the winning plate:

- **The ruin** is "an illegible scribble of specks", its door "an
  oversized solid blue slab", and it has no contact with the ridge.
- **The wall** at the bottom right is "confetti".
- **The near mill's cast shadow** and the cobalt-over-pine ground are
  near-identical in value, so the shadow stops reading as a shadow. The
  overprint that models the ground is competing with the overprint that
  casts on it.
- **The far ridge** is one uniform coverage across its whole slope —
  decorative, not form.
- **The poppies** have stems, but at 0.9 units the stems do not survive
  the screen, so they read as detached dots.

And from this round's own findings, for the app rather than the plate:

- **`--g-stone-mid` and `--g-stone-shade` should go.** They are the last
  half-strength inks in the system. Every ramp still using them is doing
  what the windmill was doing.
- **Every other plate should be checked against its `PlateFoot`
  height.** The windmill was not special.
