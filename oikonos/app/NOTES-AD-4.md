# Art direction notes — round 4

Round 3 put the plates through blind duels and they lost 9 of 11. It
named three systemic faults. This round fixes those three and re-runs
the same eleven duels with fresh side assignments and fresh critics.

## Result

**Round 3: 2 win / 9 loss → Round 4: 6 win / 5 loss.**
Six plates improved, four unchanged, one regressed.

| plate | round 3 | round 4 | |
| --- | --- | --- | --- |
| ascent | loss narrow | **win clear** | better |
| mosaic | loss clear | **win narrow** | better |
| lighthouse | loss clear | **win narrow** | better |
| santorini | loss clear | **win narrow** | better |
| windmill | loss narrow | **win narrow** | better |
| amphorae | loss clear | loss narrow | better |
| olive grove | win clear | **win clear** | same |
| welcome | loss clear | loss clear | same |
| shopfront | loss clear | loss clear | same |
| colophon | loss clear | loss clear | same |
| harbour | win clear | loss narrow | **worse** |

### What this does NOT prove

The yardstick moved. The acropolis and the café table are hero plates
and they had the same systemic faults, so they were fixed too — which
means round 4 is not a clean before/after on the new plates alone. Some
of the six improvements are the subject getting better; some are the
opponent getting worse. The honest claim is narrower than "6 of 11": it
is that after the fixes, the new plates and the hero plates are roughly
at parity, where before they were not.

The harbour regression is real and not explained by that. It won round 3
and lost round 4 on composition, not medium — *"no hierarchy: the quay
slab and the caique compete at equal weight"*, *"the quay is sliced flat
by the left frame edge and its identity never resolves"*. Both were
already true in round 3 and a different critic weighted them
differently. One duel is one opinion; the aggregate is the signal.

---

## The three fixes

### 1. Smooth gradients → dither ramps

`ScreenRamp` in `press.tsx`. A mass is now a flat base ink with two
dithered passes over it — a lighter ink where the light falls, a darker
one where it does not — each masked by a gradient, so what varies across
the shape is DOT COVERAGE. The gradient survives but drives coverage
rather than colour, which is the whole difference between a print and an
airbrush. It also cannot pass through grey, because no intermediate
colour is ever mixed.

Applied to every form-modelling gradient in the app: the welcome
headland, the ascent slope, the santorini cliff, the olive hillside,
both towers, the acropolis rock, the café table top, the shopfront's
awning cast, the lighthouse beam. **Zero `<linearGradient>` now models
form anywhere** — the remaining ones are all masks.

Measured: the windmill tower's near-neutral pixels fell from **18.3% to
10.2%**.

The inline hexes in `TxnCafeTable` went with it — the last three colours
in the app that were not derived in `tokens.css`.

### 2. Grain on the paper, not only on shapes

Two critics said "noise dusted over a flat vector lattice" and "the
cream ground stays smooth". They were describing the **harness** as much
as the drawing: `.proof` painted bare `var(--paper)` with no texture,
while every real screen carries `tex-paper`. Proofs were understating
what ships, and round 3 judged proofs. The proof stock now carries the
same overlay a screen does.

### 3. Contact shadows

`Contact` in `parts.tsx`, and the parts that recur carry it themselves —
`Cypress` now plants itself. Added to the olive trees and the shopfront
crates; the awning throws onto the front below it.

---

## Also fixed: the welcome dome and the floating chapel

Both were named as the reason round 3's welcome redraw lost.

- **The chapel floated** because the crest was sampled at ONE point and a
  44-wide building was drawn around it, where the crest is 20 units
  lower at its left end. It now samples both ends and takes the lower. A
  wide object has to be tested where it is widest.
- **The dome was invisible on ink stock** — its cobalt fill *is* the
  welcome sky. A lit rim was not enough. `Dome` takes an `onInk` flag
  and switches to the lighter cobalt, so it is a mass rather than a hole.

It still lost, clearly. See below.

---

## What is still wrong

Named by round 4's critics, unprompted, and all of it real:

1. **The dither is still too fine to read as coverage.** The acropolis
   was called out again for *"a large feather-edged dark lens"* and
   *"soft diagonal lighter streaks"*. `ScreenRamp` is doing the right
   thing structurally, but at display scale its dots average into a
   smooth tone and are visually indistinguishable from the gradient they
   replaced. The dot has to be big enough to see. This is the single
   highest-value remaining fix.

2. **`--g-stone-shade` still reads as grey.** Round 2 raised it to 16.7%
   saturation and round 4 still calls it *"a flat lavender-slate… a
   half-strength blue, functionally cool grey"* and *"so low in coverage
   it drifts toward the grey the palette forbids"*. The value is
   defensible on a colour meter and wrong on the page. It should
   probably not be a tint at all — it should be dot coverage, like
   everything else.

3. **The colophon's internal tooth still shows its edge.** *"Grain that
   stops on a straight line is noise laid over vector art."* Fixing the
   proof stock did not fix the plate's own tooth rect.

4. **I introduced a regression while fixing round 3.** The acropolis
   printed no vermilion, so I gave it a pennant. Two critics: *"the
   vermilion flag has no visible pole"*, *"a single clipped triangle
   half-swallowed by the crest, plainly an afterthought"*. Adding an ink
   for completeness' sake, without giving it something to stand on, is
   the same floating fault this project keeps committing.

5. **Shopfront and colophon did not move at all.** Both lost clear twice.
   Their faults are compositional — *"assembled, not drawn"*, *"no focal
   point"*, *"illegible stubs"* — and no systemic fix reaches those. They
   need redrawing, not repairing.

---

## The pattern worth keeping

Every round of this has found the same shape of bug under a different
disguise: **an object that does not sit on anything**. Round 1, houses on
the welcome cliff. Round 2, the Santorini town. Round 3, eight of eleven
plates. Round 4, the pennant I added *while fixing round 3*.

It keeps recurring because it is cheap to draw an object and expensive to
work out what it stands on, and nothing in the pipeline fails when you
skip the second part. `Contact` helps. What would help more is a rule the
harness can check.
