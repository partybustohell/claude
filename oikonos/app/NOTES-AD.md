# Art direction notes — round 1

Observations from comparing each render against its master comp at full
resolution. These are additive to the blind critics' verdicts, not a
replacement for them.

---

## Welcome

The buildings are genuinely good — the dome, the arcade, the stepped path
and the cypress all read. The problems are all compositional.

1. **The cliff has no mass.** In the comp the green cliff is a major
   shape: it rises to roughly the vertical midpoint on the right edge and
   sweeps down on a long diagonal to the bottom-left corner, and the
   buildings sit *on* it. Ours is a shallow mound hugging the bottom edge,
   so the buildings look like they are floating on a lawn. Rebuild the
   cliff as the dominant silhouette it is in the comp.
2. **A dead blue void** runs from the tagline down to the buildings —
   roughly 40% of the screen is empty. Fixing the cliff mass absorbs most
   of it; the wordmark block can also move up slightly.
3. **The cliff reappears below the GET STARTED button** as a thin green
   sliver against the bottom edge. It reads as a rendering mistake. The
   land should resolve behind the button, not peek out under it.
4. The dome carries a gradient and a specular highlight. The comp is
   flat — dome, ribs, cross, done. Flatten it and let the grain do the
   work.

## Home

Closest of the four to the comp, and better than it in places. Three real
defects.

1. **The dither is out of control.** In the comp the stippled reflection
   is a contained fan directly beneath the boat, dense at the waterline
   and thinning within about 80px. Ours sprays the full width of the
   screen, bleeds down past the horizon into the OVERVIEW label, and
   scatters loose red specks around the sun. It reads as dirt on the
   scanner, not a printed reflection. Tighten the fan, bound it, and
   grade the density properly.
2. **There is a stray grey triangle** on the horizon at roughly one third
   from the left — presumably a distant sail. It is grey, which the
   palette does not contain, and it is too small to read as anything.
   Remove it or draw it properly in cobalt.
3. **The second activity row is clipped** by the tab bar — a half-circle
   badge is visible at the bottom edge. The scroll container needs
   bottom padding of at least `--tabbar-h` plus the safe area.

Minor: the sun crowds the mast where the comp keeps them separate, and
the Income meter reads at 100% which makes it look broken rather than
full. Cap the displayed ratio below 1 or scale all three against a common
maximum.

## Global

- `Amount` counts up from zero. Confirm every hero figure has finished
  before a capture — a screenshot caught mid-count is a silent failure.
- Grain must survive at 3× DPR. Check that the stipple is not so fine it
  disappears, and not so coarse it stripes.
