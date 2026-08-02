# Goal detail — blind critic verdict

This screen LOST a blind A/B against the master comp. The critic did
not know which panel was which. Its reasoning:

> B wins on the axis the brief weights highest, and A wins on almost everything else — which is why the margin is slight rather than clear.  Illustration. B's temple is actually drawn: a coherent 3/4 view, fluted shafts with consistent left-hand light (lit face cream, shadow side ultramarine), real capitals, dentils, a stepped stylobate that turns the corner correctly. A's temple is crisper but architecturally impossible — the flank's intercolumniation and entablature height both grow toward the far end, so the building enlarges as it recedes, and the fully-visible blue roof plane puts us in a bird's-eye while the colonnade below is drawn at eye level. Two eye levels, one building. Worse, the front reads as navy columns on a pale wall while the flank reads as pale columns with navy gaps: the same peristyle lit two contradictory ways. The landscape gap is even wider. B's headland is faceted into planes with stippled lit faces that describe volume, a cream saddle receding behind the temple, a distant headland across the water — real depth and a varied, specific crest silhouette. A's is one enormous flat green wedge with vertical airbrush streaks that follow no form, occupying roughly 40% of the screen with no drawing in it, plus a flat blue block with scattered dashes. B's cypress has a serrated, tapering silhouette; A's is a symmetric teardrop. Texture: B's grain is risograph stipple used to model form; A's is uniform digital noise sprayed over everything.  Colour and composition also go to B, narrowly. B holds one blue, two greens, one red, one cream, unified by a single paper grain. A carries three unrelated greens plus a mint track, a lavender-grey pediment, a grey-blue for secondary text, and a coloured glow bleeding around the CTA. B's negative space is shaped and active; A's cream header is handsome but its lower 40% is dead.  Typography and product substance go decisively to A, and this is what keeps B's win narrow. A's GOAL eyebrow is properly tracked with a generous gap to the headline; B's is set solid, clotted, and jammed ~27px under a headline nearly as large as the amount, so the money stops being the hero. A's content column is disciplined to 43px lef

## Defects, in the critic's words

### Blocking

- The temple is in inverse perspective: the flank's intercolumniation widens and its entablature deepens toward the far (right) end — the flank cornice line rises to the right while the stylobate line falls to the right — so the building is visibly larger at the end furthest from the viewer. Redraw the flank to converge on a vanishing point at the horizon.
- Two incompatible eye levels in one object: the roof is drawn as a full, flat top plane (a bird's-eye read) while the colonnade below is drawn at eye level with no top surface of the stylobate visible. Either drop the roof plane to a sliver or raise the camera on the whole building.

### Major

- Contradictory light logic on the columns: on the front facade the navy bars read as the column shafts against a pale wall, while on the flank the navy bars read as the shadowed gaps between pale shafts. Pick one — shafts lit, intercolumnar voids dark — and apply it to both faces.
- The pediment's right raking cornice is missing entirely; the blue roof slab butts straight into the apex, so the triangle never closes on its right side and the pediment reads as a half-form.
- The headland is a single undifferentiated green slab with vertical airbrush streaks that ignore the curvature of the form — the streaks run straight down regardless of where the surface turns. It occupies roughly 40% of the panel with no drawn information; break it into lit and shadowed facets that follow the rock's structure.
- The temple has no contact with the ground: the stylobate's underside is a straight horizontal butted against flat green with no cast shadow or bedding, and the right-hand steps terminate in a hard vertical drop onto the hill. Add a contact shadow and let the hill crest interrupt the base.
- The crest silhouette is a featureless soft arc with no incident, and two unexplained dark-green blobs sit on it (around panel coords x≈340/y≈1105 and x≈300/y≈1220) that read as compositing artifacts rather than shrubs. Give the crest steps and outcrops, and either resolve the blobs into drawn vegetation or delete them.
- The sea is a flat blue field carrying eight short horizontal dashes scattered at random — they neither diminish toward the horizon nor sit on a rhythm, so they read as scratches on the artwork rather than wave marks.
- The green/blue coastline is a soft, noisy diagonal: blue speckle bleeds into the green and a fuzzy pale fringe runs its full length, so the single longest edge in the composition is the dirtiest one.

### Minor

- The cypress is a symmetric mechanical teardrop with no branch structure, no taper irregularity and no tip character — it reads as a primitive shape dropped in, not a drawn tree.
- Four greens are in play with no stated relationship: the mid-green headland, the olive distant headland, the forest green of the progress fill and 62% label, and the mint progress track. Reduce to a two-green system and derive the UI green from the illustration green.
- The ADD MONEY pill carries a soft coloured outer glow that smears green and warm light into the hill behind it — a shadow artifact, not a deliberate elevation treatment. Replace with a defined shadow or none.
- The home indicator is a desaturated navy bar sitting on mid-green — it fails contrast against its backdrop and reads as a stray dash rather than a system affordance. It needs a light indicator or a scrim.
- The back arrow sits 48px from the screen edge while the entire text column (GOAL, headline, amount, bar, meta) sits at 43px — a 5px break in the only place the nav row and the content column share a left edge.
