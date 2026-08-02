# Welcome — blind critic verdict

This screen LOST a blind A/B against the master comp. The critic did
not know which panel was which. Its reasoning:

> A wins on the criterion that carries the most weight: the illustration. A is a genuine two-colour print illustration — the dome is built from a stippled halftone that thins toward the lit crown, the whitewashed volumes carry consistent cast shadows from a single left-hand sun, the terrace throws a real shadow onto the hillside, the stair has individual treads and a thickened side wall, and the foliage mass is modulated with varied grain. B is flat vector clip-art with a single global noise layer stamped identically across sky, stone and foliage — texture applied to the image rather than arising from it — and its buildings are a mechanical stack of rectangles that read as a bar chart, sitting on a flat green mass whose upper boundary is a straight horizontal mask line, so nothing makes ground contact. B also has an outright rendering bug: the dome's cream outline and navy fill are misregistered, leaving a band of background blue between stroke and fill on the left while the fill touches the stroke on the right. Typographically, A's wordmark is a high-contrast didone set tight and confident (66% of screen width, 65px cap height) with the crescent cut into the O's own bowl — an integrated logotype; B's is loosely letterspaced with a small crescent floating off-centre inside the counter like a sticker, plus clunky wedge-beak S terminals. Colour: A holds one deep royal, cream, two modulated greens and a slate accent; B's navy dome sits too close in value to its brighter sky, so the hero element loses silhouette at thumbnail. B is not without merit — its margins are more disciplined (wordmark 840 / subhead 843 / pill 842, with the round O correctly overhanging the M by 3px, which A fails to do) and it includes a home indicator that A omits despite showing a status bar. A's CTA also breaks its own content margin (46px inset vs 64px for content) and has asymmetric internal padding (78px leading, 48px trailing). But B's CTA is worse: the label is geometrically centred on the pill while the arrow occupies the right, giving gaps of 204 | label | 133 | arrow | 47, so the label reads shoved right. Tidier margins do not offset a hero illustration with no light logic and a vis

## Defects, in the critic's words

### Blocking

- The dome's cream outline and its navy fill are two misregistered shapes: on the left a band of background blue shows between the stroke and the fill, while on the right the fill runs to/past the stroke, and the fill fails to reach the base plate on the left, cut by an unexplained diagonal. This is a visible rendering bug on the hero element.

### Major

- No coherent light source. Pale-periwinkle shadow slabs appear on the tower's right face, as horizontal under-eave bands on the mid block, and along the bottom edge of the low left building — three mutually incompatible shading logics in one scene.
- Buildings never make ground contact: the green hill's upper boundary behind the arcade block is a perfectly horizontal line at a single y-value, so the blocks are pasted over the terrain rather than sitting in it.
- Uniform noise substitutes for texture — the same grain amplitude and frequency runs over sky, stone and foliage alike, so it never describes a surface. Compare A, where halftone dot density varies to model the dome's curvature.
- CTA label is centred on the pill's geometric midpoint while the arrow occupies the right. Measured interior gaps are 204px | label | 133px | arrow | 47px, so the label reads shoved right into the arrow. Either left-align it or centre it within the label-only region excluding the icon.
- The crescent inside the O is off-centre in the counter — pushed up and to the left so it crowds the left stem and leaves a dead crescent-shaped void on the right — and it does not share the O's stroke modulation, so it reads as a pasted-in sticker rather than a drawn ligature.
- Dome ribs are asymmetric and fail to converge: the central meridian stops short of the apex, and the left and right arcs terminate at different heights on the base line. The finial crossbar is also not centred on its stem.

### Minor

- The dome base plate has an orphan step — its cream slab overshoots the tower on the right and terminates in a pale-blue block at a different height, reading as a clipping artifact rather than architecture.
- The arcade is bisected by the right screen edge: the fourth arch is cut exactly in half by the bezel with no compositional reason, reading as an overflow bug rather than an intentional crop.
- Windows are stamped clones — identical navy rounded-arch rectangles at identical widths, with no reveals, no sills, and no diminution with distance.
- The cypress is a lollipop: a plain teardrop on a straight sliver of trunk, with no internal value break and no cast shadow, sitting on top of a white wall it should be occluding or shading.
- The staircase floats — four treads drawn as a raw step-polygon with no side-wall thickness, and the bottom tread ends in mid-air over the green.
- Wordmark tracking is too loose for its scale: at 67% of screen width but only a 60px cap height, the airy inter-letter gaps make it read as spaced-out body type rather than a logotype, flattening the hierarchy against the subhead below.
- The S terminals are clunky — sharp wedge beaks at top-right and bottom-left with a notch where the spine meets the upper terminal, which at logo scale is the first thing that breaks the mark's polish.
- The home indicator sits over the green hillside at low contrast and clears the CTA by only ~19px (roughly 7pt), about half the safe clearance; it should sit over a controlled surface with a proper gap.
- The navy dome fill (#002260) is too close in value to the sky (#1241A2), so the hero architectural element loses its silhouette at thumbnail size.
- The hillside's left edge is a perfectly straight ramp with a lighter-green sliver along it, ending in a small detached lump at bottom-left — geometry, not terrain.
