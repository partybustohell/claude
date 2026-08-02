# Art direction notes — round 6

Two things: the acropolis gullies, which six critics across three rounds
had called decorative striping, and the windmill re-duel that round five
left owing.

## Result

| plate | round 3 | round 4 | round 5 | round 6 |
| --- | --- | --- | --- | --- |
| acropolis | — | — | — | **win narrow** |
| windmill | loss narrow | win narrow | loss narrow | **loss clear** |

One of these is a fix that worked and one is a fix that did not, and
the second is the more useful entry.

---

## 1. The acropolis gullies

The old face was `rake()`: eleven hand-placed wedges on a constant fall,
alternating `'deep'` and `'lit'`. Alternating is the tell. Light does not
alternate — a fan of stripes that takes turns is a pattern, and every
critic who saw it said so in almost the same words.

Gullies are sampled off the crest now. A gully starts at a point on the
skyline, runs down the true fall line (the normal to the local slope),
and is one thing: a cut in shade with a **lit western lip**, because the
sun is upper left and the west wall of a ravine is the wall that catches
it. No two take turns, so no two stripe. Spacing and length come off a
seeded PRNG, so they are irregular without being arbitrary — the plate
prints identically every time.

The pennant that had been added to bring vermilion into the plate was
floating with no pole; moved onto the plateau it hid behind the
colonnade. It is a caique now, under a clay sail, sitting on the water
with a dithered waterline. Ink audit after: cream 34.66%, cobalt 13.12%,
pine 43.69%, vermilion 0.03%, near-neutral 0.3%.

**The verdict**: win, narrow, against the hero horizon plate — the first
win this plate has taken. The word *striping* does not appear in it.
What the critic praised is what the fix was for: *"three receding planes
— pale far hill, cobalt sea, dark headland — with the cypress
overlapping the crest."*

What it still says, and this is round seven's list: the plateau and the
cliff face print the same pine, so the hill has no top and no side; the
temple has no contact shadow; the pediment reads as a cool near-white
*brighter than the paper*, which is a fifth colour; and the roof, facing
the sky, prints darker than the vertical pediment under it.

---

## 2. The windmill, and what the re-duel actually found

Round five fixed `RampDefs` to take the box of the mass it models, and
that fix landed **after** s03 was pulled, so the windmill's loss was on
the broken ramp. This round re-judged it on the fixed one. It lost
clear — worse than before — and the reason is worth writing down
properly, because it is a fault the ramp rewrite walked straight past.

### The box fix worked

Measured on a 4× proof of the plate alone, sampling only inside the
tower's tapering silhouette and skipping the door and windows:

| plate x | inked (t > 0.15) | mean t |
| --- | --- | --- |
| 226 | 0.0% | 0.04 |
| 244 | 0.0% | 0.05 |
| 262 | 56.0% | 0.15 |
| 280 | 68.3% | 0.27 |

Coverage runs 0% to 68% across the shaft. The cylinder turns by dot
count, which is what round five set out to make it do.

### And it did not matter, because every dot is a tint

Same measurement, last column: **0.0% of the shade face reaches full
ink.** The densest strip on the tower averages t = 0.27 along the
paper→cobalt line. The blind critic, with no access to any of this, got
there by eye and by sampling: *"its ink sits at roughly a quarter to a
half strength throughout… about 62% of pixels fall between 10% and 50%
coverage with essentially none at full ink. A riso drum cannot print
that."*

Correct. The ramp's `deep` ink is `--g-stone-mid`, which is
`color-mix(--paper 52%, --ink-lift 48%)` — a colour that exists nowhere
on a drum. So the plate is doing the job twice and half-way each time:
it thins the dots *and* it weakens the ink. The eye then averages a
sparse field of half-strength dots into something even paler than the
tint alone, and what should be the shade side of a whitewashed tower
comes out as a haze.

The whole point of a screen is that it lets you get a pale grey-blue
**out of full-strength cobalt**. Screening a colour that is already
pale is belt and braces, and it is the last place in this app where a
half-strength ink survives — three rounds of removing tints removed them
from fills and never looked inside the ramps.

### The fix, not yet made

`deep` on a stone ramp should be `var(--g-sea)` — full cobalt — and the
coverage should carry all of the value. It is one token per ramp call
site, but it is a visible change to every whitewashed building in the
app, so it is a decision rather than a correction and it is left for the
next round.

The same argument retires `--g-stone-mid` and `--g-stone-shade` as ramp
inks. `--g-stone-shade` is the token critics have been calling grey
since round three; it has been patched twice and never removed.

### The rest of the windmill's list

- the two axle spars ghost semi-transparently across the cobalt cap
- the right-hand window is a *weaker* blue than the left, on the shade
  side — backwards, and a tint again
- nothing casts: no shadow rightward onto the grass, and the cypress
  trunks vanish at the near hill's edge with no contact
- the far ridge is a flat sage tint of pine with a soft fading left end
- the 12-blade rotor is fussy and unequal, and its outline-only language
  clashes with every filled mass beneath it

---

## On the yardstick

Both duels this round were fought against `horizon`, and the same critic
pool called it *"a well-dithered corner sticker"* and *"a dust line over
bare paper… all weight jams into the bottom-right corner; the left
two-thirds is dead."* It wins on mechanism — its sun edge is genuinely
bimodal, bare cream to full vermilion — and loses on drawing. That is
the honest reading of the whole scoreboard: the hero plates print
better than the new ones and are drawn worse, and every verdict in six
rounds has turned on which of those the critic weighted.

Which is also why the windmill's loss is the useful result. It did not
lose on drawing. It lost on the one thing the reference plate has never
got wrong.
