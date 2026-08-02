# Art direction notes — round 3

Round 2 judged the 38 newly-illustrated screens against the brief. That
is a weaker test than it sounds: the person checking the work against
the rules is the person who wrote the work, and the rules are the ones
they had in mind while writing it. The hero four were never judged that
way — they went through blind duels against a master comp.

This round puts the new plates through the same process.

## How the duels were set up

The 38 screens have no master comp, so there is nothing to duel them
against in the round-2 sense. The fair comparison is at PLATE level: a
press proof is "one plate, alone, on its stock, at print size", which is
exactly the same job for a new plate and a hero plate. If a new plate
loses to a hero plate on that footing, it does not hold the bar the hero
four set.

Welcome is the exception and got the round-2 duel re-run against its
master comp, because it has one and because it had lost.

Sheets were given neutral names — `d01`…`d11`. Named after the plate,
the filename alone would have told a critic which panel was the subject.
Each critic saw one image and was instructed to open nothing else.

## Result

**2 wins, 9 losses.**

| duel | subject | against | result | margin |
| --- | --- | --- | --- | --- |
| d02 | harbour | acropolis (hero) | **win** | clear |
| d11 | olive grove | horizon (hero) | **win** | clear |
| d04 | ascent | acropolis (hero) | loss | narrow |
| d05 | windmill | horizon (hero) | loss | narrow |
| d01 | welcome (redrawn) | master comp | loss | clear |
| d03 | amphorae | horizon (hero) | loss | clear |
| d06 | mosaic | acropolis (hero) | loss | clear |
| d07 | lighthouse | horizon (hero) | loss | clear |
| d08 | shopfront | acropolis (hero) | loss | clear |
| d09 | colophon | horizon (hero) | loss | clear |
| d10 | santorini | acropolis (hero) | loss | clear |

The honest reading: **the new plates do not hold the bar.** Round 2
reported them as done. They render, they are on-palette by the checks I
wrote, and they lose blind duels to the existing work nine times out of
eleven. Checking your own work against your own rules is not a substitute
for an adversary.

Per-duel faults are recorded in `CRITIQUE.json` under `round3/*`.

---

## The three systemic faults

Individual nits are in CRITIQUE.json. These three account for most of
the nine losses, and each is one fix applied in one place rather than
eleven.

### 1. Smooth gradients modelling form — "airbrushed", "breaks the press"

Nine of the fourteen plates use a `<linearGradient>` to model a mass:
the tower of a windmill or lighthouse, the body of a rock, the slope of
a hill. Critics named this on the acropolis, the lighthouse, the
windmill and the welcome cliff, unprompted and independently, in almost
identical language — "an airbrushed cylinder", "a gradient where flat
ink belongs", "flatly foreign to riso", "the single most foreign mark on
either plate".

The brief permits *one* soft stipple gradient for depth. It does not
permit a linear gradient standing in for modelling. A riso turns value
by changing DOT COVERAGE, not by ramping a fill. Every one of these
should be a dither ramp.

Measured on the windmill's tower: **18.3% of its pixels are
near-neutral** — the cream-to-cobalt ramp passes through grey on the
way, which is the same trap the token layer was fixed for in round 2,
arriving this time through a gradient stop instead of an ink value.

### 2. Grain applied per-shape, never to the paper

Two critics independently: *"speckle applied per-shape over vector
fills; the cream ground stays smooth, so it is noise on artwork, not ink
on paper"* and *"noise dusted over a flat vector lattice"*.

They are right, and it is structural. `Press` attaches its grain filter
to shape groups. The PAPER — the plate's ground, and on most plates the
majority of its area — receives nothing. A real print has tooth
everywhere, heaviest where the ink is; ours has tooth only where a
shape happens to be.

### 3. Objects that do not cast shadows

Named on eight of the eleven: the awning throws nothing on the shopfront
below it, the olive trees throw nothing on their terraces, the cypresses
meet the ground with no anchoring dark, the lighthouse has no contact
shadow at all. Round 2 fixed this for houses on the welcome cliff and
for jars on a shelf, and then every plate written afterwards repeated
the omission. It was treated as a per-plate detail when it is a rule.

---

## What the duels revealed about the HERO plates

Not what I was testing for, and the more useful half of the result.

**The acropolis** — the plate that had already passed two rounds — was
condemned by **four independent critics** for the two faults the welcome
cliff was condemned for in round two:

- *"the lighter streaks fan from the upper right and are decorative
  striping, not form"*
- *"the lower right of the cliff carries a soft lens-shaped lightening
  with a feathered edge: an airbrushed gradient in a four-ink flat-print
  language"*

It also prints no vermilion at all — a three-ink plate in a four-ink
palette — its temple casts no shadow on the hilltop, and its cypress is
clipped by the right edge.

**The horizon** was faulted for having no water plane (*"the sea is a
sprinkle rather than a surface"*), for a dot fade that is *"a gradient by
another name"*, for crowding its subject into the bottom-right corner,
and for using no pine green.

So the hero four were never clean. They were validated against a master
comp on their own subject matter, which is a much gentler test than
being set beside a sibling plate and asked which is better drawn. The
bar the new work "failed to reach" is itself lower than the round-2
notes assumed — and the harbour and the olive grove beating it says as
much about the acropolis as about them.

---

## The welcome redraw

It fixed what round two named — the barcode hill is gone, the stair
lands, nothing is amputated at the right edge — and lost anyway, because
the redraw introduced its own version of the same underlying fault:

- **The chapel floats.** Placed at `crestAt(316) + 8`, but its body
  extends 20 units LEFT of that sample, where the crest is 20 units
  lower. So its left two-thirds, bell tower included, hangs over open
  cobalt. Sampling the crest at ONE point and drawing a wide object
  around that point is the bug; the object has to be tested at both ends.
- **The dome is invisible again, differently.** Round 3's `Dome` fix
  added a lit rim so it would separate from an ink ground. It does — but
  the fill is still the same cobalt as the welcome sky, so what reads is
  *"a hollow cream outline with sky showing straight through"*. A rim
  was not enough; on an ink ground the dome needs a different value, not
  an edge.
- **The hill is "one perfectly straight 40-degree ramp"** despite the
  crest being deliberately un-collinear. The undulation I added is too
  small to survive at plate scale.
- The right-plane tint reads as *"a near-grey periwinkle, a fifth ink"* —
  `--g-stone-shade` again, still not chromatic enough at this size.

---

## Not fixed

Nothing in this round. It is a critique, and acting on it is a body of
work in its own right — the three systemic fixes touch every plate in
the app, and the remediation should be judged by another round of duels
rather than by me declaring it done. Which is the whole lesson above.
