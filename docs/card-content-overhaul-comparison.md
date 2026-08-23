# Website Library Card Content Overhaul

This document compares the portal content before and after the evidence-based rewrite. The goal is concise, accurate guidance for LLM-assisted website design—not stylistic prose for its own sake.

## Library-wide changes

- Removed category-level Typography, Hierarchy, and Spacing defaults. Every card now has a complete bespoke nine-field design brief.
- Replaced the auto-generated whole-page image prompt with purpose-specific recipes: 26 primary visuals, 10 supporting visual layers, and 19 references that should be built in code or from approved real assets.
- Removed Copy Image Prompt for code-native diagrams, real product interfaces, exact branded assets, and type-only heroes.
- Separated recommended implementation motion in the design brief from factual captured motion in Motion behavior.
- Re-audited descriptors, descriptions, and tags against all 55 stills and the ten captured motion sequences.
- The modal now shows each authored description directly instead of synthesizing a generic sentence from the first three tags.
- Preserved categories, ordering, media, source provenance, quality tier, confidence, dimensions, and reliability limits unless the visual wording itself was inaccurate.

Recipe totals: primary visual 26; supporting visual 10; build in code/approved real asset 19.

## 01 — Astra — AI That Works the Way You Do

**Source/quality:** Unchanged — canonical original upload; 1898 × 1476.

### Descriptor

- Before: AI systems hero / monochrome halftone
- After: AI workflow hero / halftone interface

### Description

**Before:** A stark AI-workflow hero balances an oversized direct promise with a dense monochrome halftone form, using technical microcopy and hard black controls to make automation feel precise rather than abstract.

**After:** A centered AI-workflow proposition sits above a hard-edged command surface, while cropped halftone portraits turn the lower frame into a dense monochrome production field.

### Tags

- Before: `oversized sans type`, `halftone form`, `monochrome hero`, `technical microcopy`, `hard-edged CTA`, `asymmetric split`
- After: `centered grotesk headline`, `halftone portrait crop`, `monochrome interface`, `command input bar`, `hard-edged CTA`, `wide white margins`
- Added: `centered grotesk headline`, `halftone portrait crop`, `monochrome interface`, `command input bar`, `wide white margins`
- Removed: `oversized sans type`, `halftone form`, `monochrome hero`, `technical microcopy`, `asymmetric split`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Astra — AI That Works the Way You Do". Split the hero between a large left-aligned workflow proposition and a dense abstract halftone form that occupies the right half, with compact utility controls held to the edges. Use oversized heavy grotesk display type paired with compact technical monospace labels. Palette: paper white, pure black, and tightly controlled grey. Surface treatment: coarse black halftone dots, crisp rules, and flat interface surfaces. Hierarchy: the direct promise leads, the halftone form creates tension, and one hard black action completes the frame. Preserve the severe monochrome contrast, type-to-texture balance, and utilitarian controls; avoid glossy gradients, friendly AI mascots, floating glass cards, rounded CTA pills. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: fragmented human portraits and abstract computational forms] rendered as coarse black halftone dots on paper white, with crisp clipped edges and no grayscale wash. Arrange dense fragments across the lower half and outer sides; keep the upper-center field open for HTML headline and navigation. Flat, shadowless print treatment. STRICT black, white, and controlled grey only; no text, logos, interface controls, gradients, or AI mascots. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Split the hero between a large left-aligned workflow proposition and a dense abstract halftone form that occupies the right half, with compact utility controls held to the edges.
Typography: oversized heavy grotesk display type paired with compact technical monospace labels
Palette: paper white, pure black, and tightly controlled grey
Texture: coarse black halftone dots, crisp rules, and flat interface surfaces
Hierarchy: the direct promise leads, the halftone form creates tension, and one hard black action completes the frame
Spacing: use a strict asymmetrical split with large clear margins and compact edge metadata
Motion: let the halftone field shift slowly or respond to pointer movement while all copy and controls remain stable
Preserve: the severe monochrome contrast, type-to-texture balance, and utilitarian controls
Avoid: glossy gradients, friendly AI mascots, floating glass cards, rounded CTA pills
```

**After:**

```text
Composition: Center a compact proposition and CTA in the upper half; crop a command surface and halftone portrait fragments across the lower field and side edges.
Typography: Medium-large geometric grotesk headline; small neutral sans-serif body; compact technical labels; restrained scale rather than an oversized billboard.
Palette: Paper white, carbon black, and controlled mid-grey; strictly monochrome.
Texture: Coarse halftone portrait dots, flat UI surfaces, thin rules, and clipped image fragments.
Hierarchy: Headline first, single CTA second, command surface third, halftone imagery as the surrounding production context.
Spacing: Keep generous white margins above; concentrate visual density below the midpoint and maintain a narrow centered text column.
Motion: If adapted, let halftone fragments or status indicators update subtly while headline, navigation, and input geometry stay fixed.
Preserve: Centered clarity, monochrome print texture, and the contrast between calm copy and dense production imagery.
Avoid: Color gradients, floating glass cards, friendly AI mascots, soft pill-heavy UI, or generated text inside imagery.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 02 — Nocturne Login Portal

**Source/quality:** Unchanged — canonical original upload; 2880 × 2048.

### Descriptor

- Before: Split-screen authentication / noir dither
- After: Authentication split / noir dither

### Description

**Before:** A severe login screen pairs a dense dark form with a grainy lone figure, using a split composition to turn a utility flow into an atmospheric threshold.

**After:** A dark authentication panel and a grainy backlit portrait share an exact half-frame split, pairing functional form controls with tense cinematic imagery.

### Tags

- Before: `split screen`, `dither photo`, `dark UI`, `utility form`, `grain`, `high contrast`
- After: `equal split screen`, `backlit standing figure`, `coarse monochrome dither`, `dark form panel`, `serif welcome heading`, `rectangular inputs`
- Added: `equal split screen`, `backlit standing figure`, `coarse monochrome dither`, `dark form panel`, `serif welcome heading`, `rectangular inputs`
- Removed: `split screen`, `dither photo`, `dark UI`, `utility form`, `grain`, `high contrast`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Nocturne Login Portal". Divide the viewport into a compact authentication panel and an equally weighted cinematic portrait panel. Use stark serif or grotesk display type with small monospace controls. Palette: charcoal, soft black, fog grey, and white. Surface treatment: coarse monochrome dithering and low-light film grain. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the tense split, restrained controls, and cinematic figure; avoid color accents, decorative icons, cheerful onboarding language. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a solitary figure seen from behind at a luminous architectural threshold] low-key monochrome photograph with coarse ordered dithering and dense film grain. Place the figure in the right half, surrounded by angular light and deep shadow; reserve the left half as flat dark negative space for an HTML login form. Hard rim light, high contrast. Charcoal, black, fog grey, and white only; no text, signage, logos, or UI. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Divide the viewport into a compact authentication panel and an equally weighted cinematic portrait panel.
Typography: stark serif or grotesk display type with small monospace controls
Palette: charcoal, soft black, fog grey, and white
Texture: coarse monochrome dithering and low-light film grain
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: slow grain drift or a barely perceptible image zoom; keep the form still
Preserve: the tense split, restrained controls, and cinematic figure
Avoid: color accents, decorative icons, cheerful onboarding language
```

**After:**

```text
Composition: Split the viewport exactly in half: a dark login panel left and a full-height cinematic portrait right.
Typography: High-contrast serif welcome heading paired with plain sans-serif labels, inputs, and actions.
Palette: Near-black, charcoal, graphite, and white.
Texture: Coarse dither grain in the photograph; flat matte form surfaces with minimal rules.
Hierarchy: Welcome heading and form path lead functionally; the backlit figure supplies equal emotional weight without covering controls.
Spacing: Use a strict center seam, a compact centered form column, generous top offset, and consistent vertical input rhythm.
Motion: If adapted, restrict motion to slow grain drift or a slight photographic push; keep the form completely stable.
Preserve: The exact split, severe contrast, rectangular controls, and anonymous cinematic figure.
Avoid: Color accents, rounded cards, decorative icons, soft shadows, or cheerful onboarding illustration.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 03 — Daylight Login Portal

**Source/quality:** Unchanged — canonical original upload; 2304 × 1638.

### Descriptor

- Before: Split-screen authentication / quiet monochrome
- After: Authentication split / luminous dither

### Description

**Before:** The companion authentication state uses a paper-white form beside a blurred meditative figure, showing how the same grid can shift from ominous to contemplative.

**After:** The light-state companion uses the same strict authentication split, replacing noir architecture with a soft seated figure beneath a bright, cloudlike sky.

### Tags

- Before: `split screen`, `soft monochrome`, `blurred figure`, `serif heading`, `minimal form`
- After: `equal split screen`, `soft seated figure`, `fine monochrome grain`, `white form panel`, `serif welcome heading`, `black primary button`
- Added: `equal split screen`, `soft seated figure`, `fine monochrome grain`, `white form panel`, `serif welcome heading`, `black primary button`
- Removed: `split screen`, `soft monochrome`, `blurred figure`, `serif heading`, `minimal form`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Daylight Login Portal". Use a clean authentication panel on the left and a soft-focus contemplative photograph on the right. Use stark serif or grotesk display type with small monospace controls. Palette: paper white, mist grey, and deep charcoal. Surface treatment: fine film grain with intentionally softened photographic detail. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the emotional contrast between crisp form and hazy scene; avoid busy backgrounds, heavy shadows, decorative form chrome. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a small seated figure beneath an expansive luminous cloud formation] soft-focus monochrome photograph with fine dither grain and glowing atmospheric highlights. Place the scene in the right half with the figure low in frame; reserve the left half as clean paper-white negative space for an HTML login form. Diffuse daylight, low-detail facial treatment. White, mist grey, charcoal, and black only; no text, logos, signage, or UI. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Use a clean authentication panel on the left and a soft-focus contemplative photograph on the right.
Typography: stark serif or grotesk display type with small monospace controls
Palette: paper white, mist grey, and deep charcoal
Texture: fine film grain with intentionally softened photographic detail
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: a slow breathing opacity shift in the photograph only
Preserve: the emotional contrast between crisp form and hazy scene
Avoid: busy backgrounds, heavy shadows, decorative form chrome
```

**After:**

```text
Composition: Use the same exact half-frame split as the dark variant: white login panel left, atmospheric photograph right.
Typography: High-contrast serif welcome heading paired with plain sans-serif labels, inputs, and actions.
Palette: Paper white, mist grey, charcoal, and black.
Texture: Fine monochrome dither and soft photographic bloom against crisp, flat form controls.
Hierarchy: The form remains immediately usable while the luminous sky and small seated figure establish the emotional register.
Spacing: Mirror the dark variant’s center seam, form width, top offset, and vertical control rhythm.
Motion: If adapted, use a slow exposure drift or cloud movement in the photograph only; keep the form fixed.
Preserve: Day/night system continuity, the small human scale, and the crisp-form versus soft-image contrast.
Avoid: Color casts, sharp facial detail, rounded cards, heavy shadows, or mismatched geometry between variants.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 04 — Castle Waitlist

**Source/quality:** Unchanged — canonical original upload; 2880 × 2048.

### Descriptor

- Before: Launch page / engraved fantasy mono
- After: Waitlist hero / bitmap engraving

### Description

**Before:** A minimal waitlist pairs an oversized serif announcement with a rough engraved fortress, combining product-launch clarity with storybook world-building.

**After:** An enormous two-line serif announcement and compact signup field counterbalance a cropped, one-bit castle engraving that occupies the entire right side.

### Tags

- Before: `engraving`, `waitlist form`, `serif display`, `black and white`, `asymmetric hero`
- After: `oversized serif headline`, `one-bit castle engraving`, `asymmetric two-column hero`, `email signup field`, `black-and-white palette`, `cropped illustration`
- Added: `oversized serif headline`, `one-bit castle engraving`, `asymmetric two-column hero`, `email signup field`, `black-and-white palette`, `cropped illustration`
- Removed: `engraving`, `waitlist form`, `serif display`, `black and white`, `asymmetric hero`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Castle Waitlist". Place a compact signup message and input on the left while a monumental engraved castle occupies the right edge. Use stark serif or grotesk display type with small monospace controls. Palette: pure white and ink black. Surface treatment: woodcut-style crosshatching with crisp interface rules. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the severe two-column balance and tactile monochrome illustration; avoid fantasy-game UI chrome, ornamental borders, saturated color. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a monumental medieval fortress rising vertically] rendered as a dense one-bit woodcut with black ink, white knockouts, coarse crosshatching, and irregular bitmap edges. Anchor and crop the fortress on the right 42% of the frame; leave the left 58% clean white for HTML headline and signup controls. Flat print treatment with no photographic light. Pure black and white only; no grey, text, logos, ornamental frame, or game UI. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a compact signup message and input on the left while a monumental engraved castle occupies the right edge.
Typography: stark serif or grotesk display type with small monospace controls
Palette: pure white and ink black
Texture: woodcut-style crosshatching with crisp interface rules
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: static by default; a subtle engraved shimmer may appear on hover
Preserve: the severe two-column balance and tactile monochrome illustration
Avoid: fantasy-game UI chrome, ornamental borders, saturated color
```

**After:**

```text
Composition: Place brand, oversized two-line announcement, supporting copy, and inline signup on the left; crop a monumental engraved fortress against the right edge.
Typography: Very large high-contrast editorial serif for the announcement; small sans-serif form controls and supporting copy.
Palette: Pure white and ink black.
Texture: One-bit bitmap engraving, coarse crosshatching, and flat rectangular UI fields.
Hierarchy: Headline leads by scale, fortress answers with equal visual mass, and the single signup row completes the path.
Spacing: Hold a wide central gutter; align the left stack to one vertical axis and leave the fortress deliberately cropped.
Motion: Keep the print composition still; if needed, reveal the engraving once with a short line-build and then stop.
Preserve: The severe two-column balance, huge serif scale, tactile one-bit image, and simple conversion path.
Avoid: Fantasy-game chrome, ornamental borders, saturated color, soft cards, or animated shimmer that weakens the print effect.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 05 — Flora Field Notes

**Source/quality:** Unchanged — canonical original upload; 2880 × 2192.

### Descriptor

- Before: Illustrated footer / layered landscape
- After: Illustrated footer / embedded utility

### Description

**Before:** A richly layered footer turns navigation and newsletter utilities into a vivid pastoral scene, demonstrating how functional information can live inside illustration.

**After:** A compact utility sitemap occupies open sky above a panoramic field, while newsletter copy and input controls are embedded directly into the bright landscape.

### Tags

- Before: `layered landscape`, `footer system`, `bright palette`, `tiny navigation`, `character vignette`
- After: `panoramic vector landscape`, `embedded newsletter form`, `sitemap columns`, `cyan and yellow field`, `character vignette`, `full-bleed footer`
- Added: `panoramic vector landscape`, `embedded newsletter form`, `sitemap columns`, `cyan and yellow field`, `full-bleed footer`
- Removed: `layered landscape`, `footer system`, `bright palette`, `tiny navigation`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Flora Field Notes". Stack a dense utility navigation band above a panoramic illustrated field with newsletter content embedded into the scene. Use friendly characterful display type paired with plain, legible interface copy. Palette: sky cyan, sunflower yellow, leaf green, coral, and cream. Surface treatment: flat vector shapes with hand-drawn foliage accents. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the integration of utility content with a joyful landscape; avoid floating white cards that separate content from the illustration. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a panoramic pastoral field with a tiny traveler, village, distant blue mountains, and wild plants] flat editorial vector illustration with lightly irregular botanical linework. Build clear sky, mountain, village, field, and foreground layers; leave calm areas in the sky and field for HTML sitemap and newsletter controls. Bright cyan, sunflower yellow, leaf green, coral, cream, and dark blue. Even illustrated daylight; no text, logos, form controls, or floating white cards. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Stack a dense utility navigation band above a panoramic illustrated field with newsletter content embedded into the scene.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: sky cyan, sunflower yellow, leaf green, coral, and cream
Texture: flat vector shapes with hand-drawn foliage accents
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: gentle parallax between mountain, field, and character layers
Preserve: the integration of utility content with a joyful landscape
Avoid: floating white cards that separate content from the illustration
```

**After:**

```text
Composition: Stack four compact sitemap columns in the open sky; place brand copy and newsletter controls inside the panoramic field below.
Typography: Narrow editorial serif headings paired with small, plain sans-serif navigation and form copy.
Palette: Sky cyan, sunflower yellow, leaf green, coral, cream, and dark blue.
Texture: Flat vector color fields with lightly hand-drawn plants, buildings, and character details.
Hierarchy: The landscape establishes the world; sitemap and newsletter groups read as embedded utility rather than separate cards.
Spacing: Use a clear horizontal horizon, evenly spaced navigation columns, and wide scenic gaps around the two lower content groups.
Motion: If adapted, use gentle layer parallax and small plant movement; keep text and form controls anchored.
Preserve: The seamless union of footer utility and illustration, the two-band composition, and the bright limited palette.
Avoid: Detached white cards, photographic scenery, heavy shadows, dense footer legal copy, or constant character animation.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 06 — BloomRide Europe

**Source/quality:** Unchanged — canonical original upload; 3018 × 2184.

### Descriptor

- Before: Travel hero / playful vector atlas
- After: Travel hero / illustrated panorama

### Description

**Before:** A scenic cycling tour hero uses a compressed editorial headline, storybook landscape, and map-like trip controls to make booking feel exploratory.

**After:** A tall condensed headline sits in open sky above a vivid cycling landscape, with conversion controls kept compact and a windmill anchoring the lower-right horizon.

### Tags

- Before: `vector landscape`, `travel controls`, `condensed serif`, `bright sky`, `route planning`
- After: `condensed serif headline`, `blue-sky negative space`, `vector cycling landscape`, `windmill focal point`, `compact dual CTA`, `utility navigation`
- Added: `condensed serif headline`, `blue-sky negative space`, `vector cycling landscape`, `windmill focal point`, `compact dual CTA`, `utility navigation`
- Removed: `vector landscape`, `travel controls`, `condensed serif`, `bright sky`, `route planning`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "BloomRide Europe". Anchor a large headline over a scenic illustrated world and dock a compact multi-field trip planner along the lower edge. Use friendly characterful display type paired with plain, legible interface copy. Palette: clear sky blue, grass green, windmill red, cream, and warm yellow. Surface treatment: clean vector geometry with lightly imperfect botanical details. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the sense of place, wide horizon, and practical route selector; avoid photo-real travel imagery, glassmorphism, excessive badges. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a European cycling landscape with red-roofed village, windmill, hedgerows, and distant blue hills] clean travel-poster vector illustration with lightly textured plants and architecture. Keep the horizon low and the upper half mostly clear blue sky for HTML headline and navigation; anchor the windmill lower right. Cerulean, grass green, brick red, warm cream, and sun yellow. Bright even daylight; no text, logos, buttons, map labels, or photorealism. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Anchor a large headline over a scenic illustrated world and dock a compact multi-field trip planner along the lower edge.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: clear sky blue, grass green, windmill red, cream, and warm yellow
Texture: clean vector geometry with lightly imperfect botanical details
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: animate windmill blades and drifting clouds slowly; controls remain stable
Preserve: the sense of place, wide horizon, and practical route selector
Avoid: photo-real travel imagery, glassmorphism, excessive badges
```

**After:**

```text
Composition: Use open sky for a large left-aligned headline and compact actions; run the illustrated village across the bottom with the windmill at lower right.
Typography: Tall condensed display serif for the destination statement; small neutral sans-serif navigation, body copy, and controls.
Palette: Cerulean sky, grass green, brick red, cream, and warm yellow.
Texture: Clean vector geometry with lightly imperfect botanical and architectural detail.
Hierarchy: Headline leads, scenic world provides destination proof, and two compact actions offer the next step.
Spacing: Reserve most of the upper-left sky for type; keep navigation thin and cluster actions tightly beneath the body copy.
Motion: If adapted, rotate windmill blades and drift clouds slowly while copy and controls stay fixed.
Preserve: The low horizon, open-sky type field, bright regional palette, and practical travel actions.
Avoid: Stock photography, glassmorphism, floating itinerary cards, oversized badges, or fast parallax.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 07 — Voypix — One Pixel

**Source/quality:** Unchanged — canonical original upload; 2876 × 2220.

### Descriptor

- Before: Builder hero / pixel-classical collision
- After: Builder hero / pixel-classical collage

### Description

**Before:** A restrained builder landing page interrupts a clean grid with pixelated reaching hands, combining product clarity, antiquity, and digital construction.

**After:** A blocky pixel headline and two offset classical hands sit inside a sparse monochrome builder hero, with a bright contact point and dissolving dot field linking craft to automation.

### Tags

- Before: `pixel hands`, `classical motif`, `builder product`, `white space`, `mono UI`
- After: `pixel display headline`, `classical reaching hands`, `bright contact point`, `dissolving dot field`, `monochrome builder UI`, `offset diagonal composition`
- Added: `pixel display headline`, `classical reaching hands`, `bright contact point`, `dissolving dot field`, `monochrome builder UI`, `offset diagonal composition`
- Removed: `pixel hands`, `classical motif`, `builder product`, `white space`, `mono UI`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Voypix — One Pixel". Keep the product proposition left-aligned and place two nearly touching pixel-rendered classical hands across the lower half. Use editorial serif forms interrupted by coded, pixel, or scan-line accents. Palette: white, graphite, and granular grey. Surface treatment: dot-matrix pixels dissolving into clean negative space. Hierarchy: an archival figure remains recognizable beneath controlled digital disruption. Preserve the creation metaphor, disciplined grid, and hybrid old/new language; avoid literal developer screenshots, neon cyberpunk, ornate classical frames. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: two classical sculptural hands reaching toward a small white point of light] monochrome photographic collage transitioning into square pixels and sparse dot fields. Place one hand from upper right and the other from lower left; keep the light point between the fingertips and reserve the upper-left area for HTML copy. White, graphite, and cool grey only; crisp neutral light, no warm skin, text, logos, UI chrome, religious symbols, or cyberpunk effects. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Keep the product proposition left-aligned and place two nearly touching pixel-rendered classical hands across the lower half.
Typography: editorial serif forms interrupted by coded, pixel, or scan-line accents
Palette: white, graphite, and granular grey
Texture: dot-matrix pixels dissolving into clean negative space
Hierarchy: an archival figure remains recognizable beneath controlled digital disruption
Spacing: preserve a formal base grid while allowing localized visual rupture
Motion: let pixels assemble toward the fingertip on entry, then settle
Preserve: the creation metaphor, disciplined grid, and hybrid old/new language
Avoid: literal developer screenshots, neon cyberpunk, ornate classical frames
```

**After:**

```text
Composition: Place pixel headline and CTA at upper left; extend one hand from upper right and one from lower left around a small central contact point.
Typography: Blocky bitmap display face for the proposition; compact neutral sans-serif for body copy, navigation, and controls.
Palette: White, graphite, cool grey, and a small white light bloom.
Texture: Photographic skin converted into square pixels, sparse dot fields, and hard-edged interface rules.
Hierarchy: Pixel headline leads, the near-touching hands form the central metaphor, and the small CTA closes the path.
Spacing: Keep broad white space around the headline; use a long diagonal between the two hands and avoid crowding the contact point.
Motion: If adapted, assemble pixels toward the light point once, then settle; keep navigation and copy stable.
Preserve: The diagonal hand relationship, bright contact point, pixel-to-classical collision, and monochrome restraint.
Avoid: Neon cyberpunk color, circuit boards, literal Michelangelo reproduction, dense dashboards, or generated headline text.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 08 — Nova Developer Stack

**Source/quality:** Unchanged — canonical original upload; 2880 × 2442.

### Descriptor

- Before: Product utility / isometric infrastructure
- After: Developer hero / isometric systems map

### Description

**Before:** A crisp software hero combines a direct headline with an isometric systems diagram and compact conversion controls, acting as a dependable reference baseline.

**After:** A direct developer proposition is paired with a pale isometric stack of connected services, using restrained controls and a large white field to keep infrastructure legible.

### Tags

- Before: `isometric diagram`, `SaaS hero`, `product UI`, `soft grey`, `compact CTA`
- After: `isometric integration diagram`, `left-aligned product copy`, `pale blue modules`, `developer utility`, `dual rectangular CTA`, `white canvas`
- Added: `isometric integration diagram`, `left-aligned product copy`, `pale blue modules`, `developer utility`, `dual rectangular CTA`, `white canvas`
- Removed: `isometric diagram`, `SaaS hero`, `product UI`, `soft grey`, `compact CTA`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Nova Developer Stack". Place a concise product headline and two actions on the left with an airy isometric integration diagram on the right. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, cool grey, pale blue, and black. Surface treatment: clean vector edges with subtle grid and diagram shadows. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the immediate proposition and readable infrastructure metaphor; avoid dense dashboard screenshots, multicolor gradients, inflated marketing copy. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: an isometric ecosystem of abstract service modules connected through one central platform] precise vector illustration with pale translucent blocks, thin connector lines, small original symbol tiles, and restrained shadows. Place the system on the right half at a three-quarter view; leave the left half empty for HTML copy and actions. White, cool grey, pale blue, and black. Flat technical light; no text labels, real logos, screenshots, gradients, or floating glass cards. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a concise product headline and two actions on the left with an airy isometric integration diagram on the right.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, cool grey, pale blue, and black
Texture: clean vector edges with subtle grid and diagram shadows
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: small connector pulses travel through the isometric stack
Preserve: the immediate proposition and readable infrastructure metaphor
Avoid: dense dashboard screenshots, multicolor gradients, inflated marketing copy
```

**After:**

```text
Composition: Place a compact compatibility badge, two-line proposition, body copy, and paired actions on the left; anchor an isometric service map on the right.
Typography: Large geometric grotesk headline; small neutral sans-serif body and controls; compact utility label in the compatibility badge.
Palette: White, black, cool grey, and pale translucent blue.
Texture: Crisp vector edges, faint connector lines, subtle module shadows, and clean flat UI.
Hierarchy: Proposition first, isometric system second, paired actions third, compatibility badge as supporting proof.
Spacing: Use a balanced half-and-half split with wide outer margins and ample white space around the diagram.
Motion: If adapted, send small pulses through connectors and lift one module on focus; avoid moving the whole system.
Preserve: Immediate developer clarity, readable service relationships, pale technical rendering, and restrained controls.
Avoid: Real partner logos, dense architecture labels, multicolor gradients, dashboard cards, or excessive depth effects.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 09 — Auron — Crafted for Visionaries

**Source/quality:** Unchanged — canonical original upload; 2880 × 2048.

### Descriptor

- Before: Architecture hero / engraved panorama
- After: Architecture hero / framed engraving

### Description

**Before:** A classical architectural engraving framed by a rational landing-page shell produces a premium, intellectual tone without relying on photography.

**After:** A panoramic engraving of a classical city is framed like a museum plate, with a centered serif proposition and small paired actions over a darkened lower band.

### Tags

- Before: `architectural engraving`, `framed hero`, `serif display`, `paper texture`, `formal symmetry`
- After: `panoramic city engraving`, `framed museum plate`, `centered serif headline`, `architectural linework`, `monochrome landscape`, `paired oval actions`
- Added: `panoramic city engraving`, `framed museum plate`, `centered serif headline`, `architectural linework`, `monochrome landscape`, `paired oval actions`
- Removed: `architectural engraving`, `framed hero`, `serif display`, `paper texture`, `formal symmetry`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Auron — Crafted for Visionaries". Center a wide engraved city panorama inside a bordered content frame with a headline and paired actions overlaid near the bottom. Use high-contrast classical serif type balanced by minimal modern controls. Palette: ivory, graphite, and muted stone grey. Surface treatment: fine copperplate engraving over subtle paper grain. Hierarchy: historic imagery and a monumental headline share the focal plane. Preserve the formal border, antique city detail, and restrained CTA pair; avoid gold luxury clichés, heavy drop shadows, photographic architecture. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a panoramic classical city with hilltop temples, domes, and distant mountains] fine copperplate engraving on warm white paper, built from black and graphite crosshatching. Frame the panorama inside a wide rectangular plate; keep the lower-center area visually calm enough for HTML headline and actions. Flat print treatment with subtle paper grain. Ivory, black, and stone grey only; no gold, text, logos, modern towers, photographic sky, or ornate frame. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a wide engraved city panorama inside a bordered content frame with a headline and paired actions overlaid near the bottom.
Typography: high-contrast classical serif type balanced by minimal modern controls
Palette: ivory, graphite, and muted stone grey
Texture: fine copperplate engraving over subtle paper grain
Hierarchy: historic imagery and a monumental headline share the focal plane
Spacing: use formal symmetry or museum-like margins with selective asymmetry
Motion: a slow horizontal drift across the panorama with static interface framing
Preserve: the formal border, antique city detail, and restrained CTA pair
Avoid: gold luxury clichés, heavy drop shadows, photographic architecture
```

**After:**

```text
Composition: Place a thin navigation above a framed panoramic engraving; center the proposition and paired actions over a darkened lower portion of the image.
Typography: Elegant high-contrast serif for the proposition; restrained sans-serif navigation and compact action labels.
Palette: Warm white, ink black, graphite, and muted stone grey.
Texture: Fine architectural engraving, paper grain, thin framing rules, and a controlled lower image veil.
Hierarchy: The panorama establishes authority, the centered proposition states purpose, and two small actions remain subordinate.
Spacing: Use museum-like outer margins, a wide image plate, and a tightly centered text stack inside the lower third.
Motion: If adapted, use a very slow pan inside the fixed frame; keep all type and border geometry still.
Preserve: The framed plate, panoramic scale, monochrome architectural detail, and quiet centered overlay.
Avoid: Black-and-gold luxury styling, heavy shadows, photographic buildings, ornate borders, or fast camera movement.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 10 — Vitra — Good Things Are on the Way

**Source/quality:** Unchanged — usable original upload; 759 × 540.

### Descriptor

- Before: Waitlist split / contemporary editorial illustration
- After: Waitlist hero / editorial illustration

### Description

**Before:** A compact waitlist pairs oversized friendly type with a sunlit illustrated city scene, balancing conversion clarity and magazine-like personality.

**After:** A large conversational waitlist message and inline email action share the frame with a sunlit illustration of a person seated among urban greenery.

### Tags

- Before: `split hero`, `editorial illustration`, `waitlist`, `oversized type`, `sunlit palette`
- After: `split editorial hero`, `oversized sans headline`, `urban garden illustration`, `inline email form`, `warm daylight palette`, `social-proof avatars`
- Added: `split editorial hero`, `oversized sans headline`, `urban garden illustration`, `inline email form`, `warm daylight palette`, `social-proof avatars`
- Removed: `split hero`, `editorial illustration`, `waitlist`, `oversized type`, `sunlit palette`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Vitra — Good Things Are on the Way". Split the hero between a large friendly statement and an editorial illustration of a person in a sunlit urban garden. Use friendly characterful display type paired with plain, legible interface copy. Palette: sage green, pale blue, warm cream, black, and leaf green. Surface treatment: flat painted shapes with lightly textured shadows. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the approachable split, clear waitlist action, and human-scale scene; avoid tiny decorative copy, generic 3D characters, excessive rounded containers. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a young person seated among lush plants beside a sunlit city building, looking at a phone] flat editorial illustration with subtle painted texture and long, soft shadows. Place the figure and architecture on the right half; reserve the left half as calm warm-grey space for HTML headline, form, and proof. Sage, leaf green, pale blue, warm cream, black, and muted coral. No text, logos, UI controls, stock-photo realism, or 3D characters. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Split the hero between a large friendly statement and an editorial illustration of a person in a sunlit urban garden.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: sage green, pale blue, warm cream, black, and leaf green
Texture: flat painted shapes with lightly textured shadows
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: subtle leaf movement and a slow shift in daylight
Preserve: the approachable split, clear waitlist action, and human-scale scene
Avoid: tiny decorative copy, generic 3D characters, excessive rounded containers
```

**After:**

```text
Composition: Split the hero between a large waitlist message and inline form on the left and a full-height urban-garden illustration on the right.
Typography: Oversized rounded grotesk headline with tight line spacing; smaller plain sans-serif body, controls, and proof labels.
Palette: Warm grey, pale blue, sage, leaf green, black, and restrained coral.
Texture: Flat painted shapes, lightly textured shadows, foliage detail, and soft rectangular form surfaces.
Hierarchy: Headline leads, illustrated person adds human context, email action converts, and avatar proof reassures.
Spacing: Use an equal split, generous left padding, a compact form row, and small proof elements anchored near the bottom.
Motion: If adapted, move only leaves or sunlight subtly; keep the person, copy, and form stable.
Preserve: The approachable split, human-scale illustration, large conversational type, and compact waitlist path.
Avoid: Generic 3D people, floating cards, tiny decorative copy, glossy gradients, or excessive rounded containers.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 11 — Launchpad Connections

**Source/quality:** Unchanged — canonical original upload; 4096 × 2625.

### Descriptor

- Before: Integration hero / luminous orbit
- After: Integration hero / radial connection field

### Description

**Before:** A highly restrained integration page centers a radial orbit of tool marks beneath a direct headline, using one luminous accent to focus attention.

**After:** A compact centered proposition floats above a glowing integration core, with sparse partner nodes arranged on shallow orbital arcs across a nearly empty white field.

### Tags

- Before: `centered hero`, `integration orbit`, `luminous accent`, `white space`, `minimal nav`
- After: `radial integration orbit`, `violet glowing core`, `centered product headline`, `sparse partner nodes`, `white negative space`, `thin connector arcs`
- Added: `radial integration orbit`, `violet glowing core`, `centered product headline`, `sparse partner nodes`, `white negative space`, `thin connector arcs`
- Removed: `centered hero`, `integration orbit`, `luminous accent`, `white space`, `minimal nav`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Launchpad Connections". Center a compact headline above a radial integration orbit with a luminous product core and generous empty margins. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, black, pearl grey, and one violet glow. Surface treatment: clean vector lines with a restrained bloom around the center. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the calm center, single accent color, and legible integration metaphor; avoid constantly spinning icons, rainbow glows, crowded partner-logo walls. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: one luminous abstract platform core surrounded by a sparse orbit of original tool symbols] precise vector line art with thin elliptical connectors and small neutral nodes. Center the core in the lower-middle field; reserve the upper center for HTML headline and body copy. White, pearl grey, black, and one restrained violet glow. Soft bloom only at the core; no real logos, text, lens flares, rainbow gradients, or dense icon wall. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a compact headline above a radial integration orbit with a luminous product core and generous empty margins.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, black, pearl grey, and one violet glow
Texture: clean vector lines with a restrained bloom around the center
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: logos orbit slowly while connection arcs pulse toward the core
Preserve: the calm center, single accent color, and legible integration metaphor
Avoid: constantly spinning icons, rainbow glows, crowded partner-logo walls
```

**After:**

```text
Composition: Center a compact headline and explanation above a low radial orbit with one luminous core and sparse tool nodes.
Typography: Bold geometric grotesk headline centered over small neutral sans-serif supporting copy.
Palette: White, black, pearl grey, and one violet glow.
Texture: Thin vector arcs, small flat symbols, and tightly controlled bloom around the core.
Hierarchy: Headline first, glowing core second, orbiting nodes third; all other space remains deliberately quiet.
Spacing: Keep broad white margins, a narrow centered text column, and generous separation between orbit nodes.
Motion: If adapted, pulse connections toward the core and drift nodes slowly; avoid continuous fast rotation.
Preserve: The calm center, single accent color, radial relationship, and generous negative space.
Avoid: Real partner logos, rainbow glows, crowded integrations walls, large shadows, or constantly spinning icons.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 12 — Stillness — Science of Practice

**Source/quality:** Unchanged — usable generated reconstruction; 1633 × 963.

### Descriptor

- Before: Meditation hero / voxel landscape
- After: Meditation hero / voxel landscape

### Description

**Before:** A calm meditation proposition sits above a voxel-like mountain and river landscape, using pixel geometry to make wellness feel precise rather than mystical.

**After:** A restrained editorial proposition sits above a broad voxel mountain valley whose block-built river, trees, clouds, and coral ridges turn meditation into a tangible digital landscape.

### Tags

- Before: `voxel landscape`, `wellness hero`, `serif headline`, `muted earth tones`, `wide scene`
- After: `voxel mountain valley`, `two-tone serif headline`, `low scenic horizon`, `muted blue coral green`, `warm paper ground`, `compact dual actions`
- Added: `voxel mountain valley`, `two-tone serif headline`, `low scenic horizon`, `muted blue coral green`, `warm paper ground`, `compact dual actions`
- Removed: `voxel landscape`, `wellness hero`, `serif headline`, `muted earth tones`, `wide scene`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Stillness — Science of Practice". Place a concise wellness proposition in the upper left and let a voxel mountain valley fill the lower two-thirds. Use friendly characterful display type paired with plain, legible interface copy. Palette: warm white, deep teal, moss green, coral clay, and pale stone. Surface treatment: blocky voxel terrain softened by atmospheric haze. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the grounded science tone and expansive geometric landscape; avoid spiritual symbols, glowing auras, unreadable small text. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a serene mountain valley with a winding river, pine trees, snow, and layered clouds] built entirely from small 3D voxels as a high-detail diorama. Use dusty navy and slate-blue mountains, white snow and clouds, coral-salmon ridge accents, sage-green trees, and a warm-white ground; no browns or neon. Soft even studio light. Fill the lower 58% and leave generous empty space above for HTML typography. No text, logos, UI, or photorealism. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a concise wellness proposition in the upper left and let a voxel mountain valley fill the lower two-thirds.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: warm white, deep teal, moss green, coral clay, and pale stone
Texture: blocky voxel terrain softened by atmospheric haze
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: very slow river shimmer and drifting mist between mountain layers
Preserve: the grounded science tone and expansive geometric landscape
Avoid: spiritual symbols, glowing auras, unreadable small text
```

**After:**

```text
Composition: Place navigation and a left-aligned proposition in the upper field; let a wide voxel valley rise from the lower edge and span the full width.
Typography: Large editorial serif with selected muted-green emphasis; compact sans-serif navigation, body copy, and actions.
Palette: Warm white, dusty navy, slate blue, cloud white, coral salmon, sage green, and black.
Texture: High-detail voxel blocks, soft atmospheric layering, and a lightly warm paper-like page surface.
Hierarchy: Two-tone proposition leads, voxel landscape supplies the memorable metaphor, and two small actions remain clearly functional.
Spacing: Keep the upper-left text stack compact; reserve broad air above the low landscape and avoid overlapping the mountain silhouette.
Motion: If adapted, use slow cloud drift and minimal river shimmer; keep the diorama camera and page controls stable.
Preserve: The low panoramic diorama, muted palette, serif emphasis pattern, and contrast between digital material and calm subject.
Avoid: Brown terrain, saturated game color, photoreal mountains, Minecraft branding, floating content cards, or busy ambient motion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 13 — Linq Messaging

**Source/quality:** Unchanged — canonical recovered live; 1251 × 713.

### Descriptor

- Before: Developer platform / cinematic message layer
- After: Messaging hero / manga streetscape

### Description

**Before:** A product headline and floating conversation UI sit over a cinematic illustrated landscape, making communications infrastructure feel immediate and human.

**After:** Large white product copy and bright lime actions sit over a full-bleed illustrated city scene, using a solitary phone user and layered street depth to humanize messaging infrastructure.

### Tags

- Before: `cinematic landscape`, `floating message UI`, `developer product`, `dark overlay`, `bright CTA`
- After: `manga streetscape`, `phone-user focal figure`, `full-bleed illustration`, `white display headline`, `lime rounded actions`, `dark navigation bar`
- Added: `manga streetscape`, `phone-user focal figure`, `full-bleed illustration`, `white display headline`, `lime rounded actions`, `dark navigation bar`
- Removed: `cinematic landscape`, `floating message UI`, `developer product`, `dark overlay`, `bright CTA`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Linq Messaging". Layer a translucent messaging card over a full-width cinematic landscape, then anchor the headline and actions along the lower center. Use quiet display typography with compact, nearly invisible navigation. Palette: deep forest green, blue-grey sky, charcoal overlay, white, and an electric lime CTA. Surface treatment: soft atmospheric illustration behind crisp glass-like message surfaces. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the human message exchange and deep environmental staging; avoid busy chat timelines, tiny code samples, excessive glass blur. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a solitary young person checking a phone on a detailed urban street] cinematic manga-style illustration with layered storefronts, pedestrians, foliage, and atmospheric depth. Place the figure in the right third; keep the left and lower-left scene lower contrast for HTML headline and actions. Forest green, concrete grey, muted tan, charcoal, white, and one electric-lime accent reserved for UI outside the image. Soft overcast light; no text, logos, message bubbles, or UI. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Layer a translucent messaging card over a full-width cinematic landscape, then anchor the headline and actions along the lower center.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: deep forest green, blue-grey sky, charcoal overlay, white, and an electric lime CTA
Texture: soft atmospheric illustration behind crisp glass-like message surfaces
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: message bubbles arrive sequentially while the landscape holds a slow ambient drift
Preserve: the human message exchange and deep environmental staging
Avoid: busy chat timelines, tiny code samples, excessive glass blur
```

**After:**

```text
Composition: Use a dark utility strip and navigation above a full-bleed illustrated street; place the headline and actions over the left half and the phone user on the right.
Typography: Large clean grotesk display in white; compact sans-serif navigation, proof labels, and rounded action text.
Palette: Forest green, concrete grey, muted tan, charcoal, white, and electric lime.
Texture: Detailed manga linework, painterly urban color, atmospheric depth, and crisp overlaid controls.
Hierarchy: Headline leads, the phone user establishes context, lime actions convert, and customer proof anchors the bottom.
Spacing: Keep a broad readable text field on the left, place the figure off-center right, and hold proof in a narrow bottom rail.
Motion: If adapted, use restrained street ambience or depth parallax while headline, actions, and navigation remain fixed.
Preserve: The human messaging context, illustrated urban depth, high-contrast white copy, and single lime action color.
Avoid: Generic chat bubbles, glass overlays, crowded timelines, neon city lighting, or illegible copy over high-detail areas.
```

### Motion behavior

**Before:** The landscape and conversational elements introduce depth while the headline and conversion controls remain anchored.

**After:** Still reference; no captured motion evidence.

---

## 14 — Yieldstream Celestial

**Source/quality:** Unchanged — usable generated reconstruction; 1597 × 985.

### Descriptor

- Before: Finance hero / orbital antiquity
- After: Finance hero / celestial engraving

### Description

**Before:** A classical winged figure cuts across a near-black financial interface scattered with planets and data, turning yield aggregation into a cosmic myth.

**After:** A large cream serif proposition shares a black archival field with a winged classical figure, small planets, and sparse financial annotations, merging mythology with technical aggregation.

### Tags

- Before: `celestial figure`, `financial data`, `orbital diagram`, `dark canvas`, `serif headline`, `scan artifacts`
- After: `winged classical figure`, `cream serif headline`, `black archival canvas`, `planetary data fragments`, `scan-noise texture`, `asymmetric hero`
- Added: `winged classical figure`, `cream serif headline`, `black archival canvas`, `planetary data fragments`, `scan-noise texture`, `asymmetric hero`
- Removed: `celestial figure`, `financial data`, `orbital diagram`, `dark canvas`, `serif headline`, `scan artifacts`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Yieldstream Celestial". Set a large serif financial proposition on the left and a monumental winged classical figure on the right, surrounded by orbital data fragments. Use editorial serif forms interrupted by coded, pixel, or scan-line accents. Palette: near black, parchment cream, faded peach, and small spectral accents. Surface treatment: archival engraving, scan noise, pixel dust, and fine data ticks. Hierarchy: an archival figure remains recognizable beneath controlled digital disruption. Preserve the mythic scale and fusion of finance, cosmos, and antiquity; avoid copying unreadable labels, literal crypto coins, neon trading dashboards. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a winged classical figure in flight with two small orbiting planets] rendered as an archival engraving and aged painted fragment, with scan noise, pixel dust, and sparse geometric marks. Anchor the figure on the right two-thirds; reserve the left third as dark quiet space for HTML copy. Near-black, parchment cream, faded peach, and tiny muted spectral flecks. Dim directional light; no text, data labels, logos, crypto coins, neon, or ornate frame. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Set a large serif financial proposition on the left and a monumental winged classical figure on the right, surrounded by orbital data fragments.
Typography: editorial serif forms interrupted by coded, pixel, or scan-line accents
Palette: near black, parchment cream, faded peach, and small spectral accents
Texture: archival engraving, scan noise, pixel dust, and fine data ticks
Hierarchy: an archival figure remains recognizable beneath controlled digital disruption
Spacing: preserve a formal base grid while allowing localized visual rupture
Motion: planets orbit slowly while fragments flicker around the figure
Preserve: the mythic scale and fusion of finance, cosmos, and antiquity
Avoid: copying unreadable labels, literal crypto coins, neon trading dashboards
```

**After:**

```text
Composition: Set a large multi-line proposition and compact action on the left; crop a winged figure on the right and distribute small planetary fragments across the lower field.
Typography: Large high-contrast serif in parchment cream; tiny neutral sans-serif and monospace annotations around the edges.
Palette: Near-black, parchment cream, faded peach, muted stone, and very small spectral accents.
Texture: Archival engraving, aged paper fragments, scan noise, pixel dust, and fine data ticks.
Hierarchy: Proposition and winged figure share the focal plane; planets and annotations supply subordinate technical context.
Spacing: Use a strong left-right split with generous dark gaps; keep micro-annotations sparse and away from the headline.
Motion: If adapted, drift planets and data fragments slowly while the figure and primary copy remain stable.
Preserve: The mythic scale, cream-on-black typography, archival/digital collision, and sparse celestial data field.
Avoid: Literal cryptocurrency coins, neon trading dashboards, readable fabricated data, gold luxury styling, or constant flicker.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 15 — Marble Learning World

**Source/quality:** Unchanged — canonical recovered live; 1251 × 713.

### Descriptor

- Before: Kids learning hero / cinematic island
- After: Learning hero / cinematic ocean world

### Description

**Before:** A child paddles toward a fantastical island beneath an enormous cloud-filled wordmark, framing learning as a vivid world to explore.

**After:** A monumental rounded wordmark spans the sky above a small kayaker approaching a fantasy island, combining cinematic world-building with a compact centered signup path.

### Tags

- Before: `ocean world`, `giant wordmark`, `child explorer`, `cloud typography`, `bright CTA`
- After: `giant rounded wordmark`, `ocean horizon`, `kayaker focal figure`, `fantasy island`, `centered signup form`, `blue and white palette`
- Added: `giant rounded wordmark`, `ocean horizon`, `kayaker focal figure`, `fantasy island`, `centered signup form`, `blue and white palette`
- Removed: `ocean world`, `giant wordmark`, `child explorer`, `cloud typography`, `bright CTA`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Marble Learning World". Fill the frame with open ocean, place an enormous rounded wordmark across the sky, and guide a small child toward a distant fantasy island. Use friendly characterful display type paired with plain, legible interface copy. Palette: saturated ocean blue, cloud white, warm skin tones, and a single red action. Surface treatment: soft cinematic clouds, glossy water, and painterly island detail. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the dramatic scale contrast and optimistic sense of discovery; avoid toy-like UI chrome, crowded educational badges, generic cartoon mascots. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a small child in a red kayak approaching a distant fantastical island] cinematic storybook seascape with glossy blue water, soft towering clouds, painterly rock and vegetation, and strong atmospheric depth. Keep the child low center and the island near the horizon; reserve the upper sky for an HTML wordmark and the lower-center water for a compact form. Saturated ocean blue, cloud white, natural warm skin, and one red accent. No text, logos, UI, or mascots. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Fill the frame with open ocean, place an enormous rounded wordmark across the sky, and guide a small child toward a distant fantasy island.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: saturated ocean blue, cloud white, warm skin tones, and a single red action
Texture: soft cinematic clouds, glossy water, and painterly island detail
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: water ripples, clouds drift, and the kayak moves slowly toward the island
Preserve: the dramatic scale contrast and optimistic sense of discovery
Avoid: toy-like UI chrome, crowded educational badges, generic cartoon mascots
```

**After:**

```text
Composition: Fill the frame with ocean and sky; stretch a huge rounded wordmark across the upper field, center the island on the horizon, and place the signup above a small kayaker.
Typography: Monumental ultra-rounded display lettering paired with a small centered serif statement and compact sans-serif form controls.
Palette: Saturated ocean blue, cloud white, warm skin tones, dark blue, and one red action color.
Texture: Painterly fantasy-island detail, glossy water, soft cinematic clouds, and crisp overlaid form controls.
Hierarchy: Wordmark establishes scale, island sets destination, signup provides purpose, and the tiny kayaker supplies narrative direction.
Spacing: Use the full width for the wordmark; keep the form narrow and centered, with open water separating it from the kayaker.
Motion: If adapted, drift clouds, ripple water, and advance the kayak very slowly; keep the signup legible and stable.
Preserve: The extreme scale contrast, blue-white world, forward journey, and compact conversion path.
Avoid: Busy educational badges, toy-like UI, generic cartoon mascots, fast camera travel, or obscuring the island with copy.
```

### Motion behavior

**Before:** The scene behaves like a living title card: water, clouds, and the child’s approach imply continuous exploration.

**After:** Still reference; no captured motion evidence.

---

## 16 — Break the Pattern

**Source/quality:** Unchanged — usable generated reconstruction; 1594 × 987.

### Descriptor

- Before: Coaching hero / Renaissance collage
- After: Transformation hero / fresco diagram

### Description

**Before:** A coaching proposition overlays a blue-toned reinterpretation of two reaching hands, turning familiar Renaissance imagery into a contemporary transformation message.

**After:** Two painted hands approach a centered point across a weathered blue fresco, while concentric guide rings and a two-tone serif statement frame personal change as a measured intervention.

### Tags

- Before: `reaching hands`, `renaissance crop`, `blue texture`, `centered serif`, `coaching CTA`
- After: `fresco reaching hands`, `centered contact point`, `concentric guide rings`, `weathered blue texture`, `two-tone serif headline`, `centered dual CTA`
- Added: `fresco reaching hands`, `centered contact point`, `concentric guide rings`, `weathered blue texture`, `two-tone serif headline`, `centered dual CTA`
- Removed: `reaching hands`, `renaissance crop`, `blue texture`, `centered serif`, `coaching CTA`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Break the Pattern". Crop two reaching classical hands across the upper half and center a transformation headline and paired actions beneath their fingertips. Use high-contrast classical serif type balanced by minimal modern controls. Palette: dusty blue, warm skin, cloud white, and ink black. Surface treatment: aged fresco grain with faint diagram lines. Hierarchy: historic imagery and a monumental headline share the focal plane. Preserve the charged gap between hands and the centered promise; avoid religious claims, literal reproduction of the artwork, fine text inferred from the frame. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: two Renaissance-style painted hands reaching toward one small white point] aged fresco treatment on dusty blue plaster, with true circular construction rings centered exactly on the point and one thin horizontal guide crossing it. Place the left hand from upper left and the right hand from lower right; keep equal shortest distance from each fingertip to the point. Warm, softly lit skin; dusty blue, cloud white, muted cream, and ink black. No text, logos, religious figures, UI, or oval rings. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Crop two reaching classical hands across the upper half and center a transformation headline and paired actions beneath their fingertips.
Typography: high-contrast classical serif type balanced by minimal modern controls
Palette: dusty blue, warm skin, cloud white, and ink black
Texture: aged fresco grain with faint diagram lines
Hierarchy: historic imagery and a monumental headline share the focal plane
Spacing: use formal symmetry or museum-like margins with selective asymmetry
Motion: the hands remain still while fine circular guide lines rotate almost imperceptibly
Preserve: the charged gap between hands and the centered promise
Avoid: religious claims, literal reproduction of the artwork, fine text inferred from the frame
```

**After:**

```text
Composition: Crop one hand from upper left and one from lower right around a central point; center the headline and paired actions below the fingertip gap.
Typography: Large high-contrast serif with selected words brighter than the supporting phrase; small sans-serif labels and pill actions.
Palette: Dusty blue, muted cloud white, warm skin, soft cream, and ink black.
Texture: Aged fresco grain, subtle paper wear, precise circular guide lines, and a fine horizontal axis.
Hierarchy: Fingertip gap and center point lead, two-tone transformation statement follows, and paired actions remain compact.
Spacing: Keep the point equidistant from both fingertips; center all rings and the horizontal line on that point and reserve clear space below for copy.
Motion: If adapted, rotate or pulse guide rings imperceptibly while hands, point, copy, and actions remain fixed.
Preserve: The diagonal hand placement, exact concentric geometry, two-tone headline, muted blue surface, and charged fingertip gap.
Avoid: Oval or off-center rings, unequal fingertip spacing, strong neon glow, literal religious scene reproduction, or busy motion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 17 — Global Prediction Field

**Source/quality:** Unchanged — usable generated reconstruction; 1602 × 981.

### Descriptor

- Before: Market interface / ASCII globe
- After: Prediction interface / typographic globe

### Description

**Before:** A restrained analytics page turns a globe into a field of tiny marks, balancing editorial copy, tabbed sectors, and a highly technical visual center.

**After:** A large globe formed from blue microtype anchors a framed market-prediction canvas, with compact instructions on the right and a thin category rail across the bottom.

### Tags

- Before: `ASCII globe`, `market data`, `tabbed interface`, `micro typography`, `white canvas`
- After: `microtype globe`, `blue dot field`, `framed analytical canvas`, `right-side instructions`, `bottom market tabs`, `white data interface`
- Added: `microtype globe`, `blue dot field`, `framed analytical canvas`, `right-side instructions`, `bottom market tabs`, `white data interface`
- Removed: `ASCII globe`, `market data`, `tabbed interface`, `micro typography`, `white canvas`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Global Prediction Field". Use a wide bordered canvas with an ASCII globe occupying the left two-thirds, a compact explanation at upper right, and category tabs along the base. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, ink black, and faint lavender-grey. Surface treatment: microtype, dot fields, and sparse grid ticks. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the globe-as-texture idea and large quiet analytical canvas; avoid fabricated readable data, conventional chart dashboards, bright chart palettes. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a world globe constructed from thousands of tiny abstract glyphs and dots] flat typographic data texture with no realistic shading. Place the globe large on the left two-thirds and fade its edge into sparse marks; reserve the upper-right quadrant for HTML instructions and the bottom strip for code-built tabs. White, ink black, pale lavender, and restrained periwinkle blue. No legible data, place names, text blocks, charts, logos, or dashboard cards. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Use a wide bordered canvas with an ASCII globe occupying the left two-thirds, a compact explanation at upper right, and category tabs along the base.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, ink black, and faint lavender-grey
Texture: microtype, dot fields, and sparse grid ticks
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: data points sweep around the globe in slow vertical bands
Preserve: the globe-as-texture idea and large quiet analytical canvas
Avoid: fabricated readable data, conventional chart dashboards, bright chart palettes
```

**After:**

```text
Composition: Frame a large typographic globe on the left, compact market instructions at upper right, and a full-width category tab rail along the bottom.
Typography: Compact neutral sans-serif for instructions and labels; microtype and dot glyphs form the globe as image texture.
Palette: White, ink black, pale lavender-grey, and restrained periwinkle blue.
Texture: Dense microtype, ordered dot fields, faint grid rules, and flat bordered interface surfaces.
Hierarchy: Globe first, task instruction second, bottom market taxonomy third; small controls remain subordinate.
Spacing: Give the globe most of the canvas, isolate the right text block with wide whitespace, and keep tabs in one shallow bottom band.
Motion: If adapted, sweep data bands slowly across the globe while instructions and tabs remain fixed.
Preserve: The globe-as-type concept, asymmetrical analytical frame, restrained blue accent, and bottom taxonomy rail.
Avoid: Readable fabricated predictions, conventional chart dashboards, bright category colors, 3D globe lighting, or dense right-side copy.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 18 — Juris Legal Intelligence

**Source/quality:** Unchanged — usable generated reconstruction; 1598 × 984.

### Descriptor

- Before: Legal AI hero / allegorical sky
- After: Legal AI hero / painted allegory

### Description

**Before:** A legal assistant interface pairs a direct question box with a monumental allegorical justice figure, making an abstract service feel approachable and authoritative.

**After:** A direct legal-intelligence proposition and large question composer occupy the left half of a bright sky, while a monumental justice figure rises through clouds on the right.

### Tags

- Before: `justice figure`, `blue sky`, `AI input`, `classical allegory`, `split hero`
- After: `justice allegory figure`, `blue-sky hero`, `left-aligned legal copy`, `large prompt composer`, `painted clouds`, `black utility navigation`
- Added: `justice allegory figure`, `blue-sky hero`, `left-aligned legal copy`, `large prompt composer`, `painted clouds`, `black utility navigation`
- Removed: `justice figure`, `blue sky`, `AI input`, `classical allegory`, `split hero`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Juris Legal Intelligence". Place a concise legal proposition and question composer on the left while an allegorical justice figure rises through clouds on the right. Use high-contrast classical serif type balanced by minimal modern controls. Palette: clear sky blue, cloud white, warm marble peach, and charcoal text. Surface treatment: soft painted clouds and sculptural fabric against crisp UI surfaces. Hierarchy: historic imagery and a monumental headline share the focal plane. Preserve the accessible input, monumental allegory, and confident open sky; avoid dense legal document UI, ornate courthouse motifs, copied brand marks. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a monumental allegorical justice figure holding balanced scales] painted in a classical academic style, rising through soft white clouds against clear blue sky. Place the figure on the right 42%, cropped at top and bottom; reserve the left 58% as calmer sky for HTML headline and question composer. Soft daylight from above; sky blue, cloud white, warm marble peach, muted gold, and charcoal. No text, logos, courthouse, legal UI, or photoreal stock imagery. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a concise legal proposition and question composer on the left while an allegorical justice figure rises through clouds on the right.
Typography: high-contrast classical serif type balanced by minimal modern controls
Palette: clear sky blue, cloud white, warm marble peach, and charcoal text
Texture: soft painted clouds and sculptural fabric against crisp UI surfaces
Hierarchy: historic imagery and a monumental headline share the focal plane
Spacing: use formal symmetry or museum-like margins with selective asymmetry
Motion: clouds drift and the figure enters with a slow vertical reveal
Preserve: the accessible input, monumental allegory, and confident open sky
Avoid: dense legal document UI, ornate courthouse motifs, copied brand marks
```

**After:**

```text
Composition: Place navigation along the top, legal proposition and question composer on the left, and a cropped monumental justice figure on the right.
Typography: Large clean grotesk display; compact neutral sans-serif for body copy, navigation, labels, and composer controls.
Palette: Clear sky blue, cloud white, warm marble peach, muted gold, and charcoal.
Texture: Soft painted clouds and classical fabric against a crisp flat input surface.
Hierarchy: Proposition leads, figure establishes authority, question composer offers immediate utility, and navigation stays quiet.
Spacing: Use a broad two-column split, generous sky around the headline, and one wide composer anchored beneath the copy.
Motion: If adapted, drift clouds and reveal the figure slowly while the composer and navigation remain stable.
Preserve: Accessible query-first interaction, open sky, monumental allegory, and strong left-right balance.
Avoid: Dense legal-document UI, courthouse clichés, ornate frames, copied brand marks, or excessive cloud animation.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 19 — Notion — Teams and Agents

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Product ecosystem / playful clarity
- After: Product ecosystem / illustrated proof

### Description

**Before:** A familiar productivity layout sharpens a large direct proposition with small illustrated product emblems and an unusually broad proof row.

**After:** A bold centered collaboration statement is surrounded by small illustrated team-and-agent emblems, with partner proof and a partial product surface anchoring the lower edge.

### Tags

- Before: `direct headline`, `product emblems`, `white canvas`, `proof logos`, `blue CTA`
- After: `centered oversized headline`, `inline green status dot`, `illustrated avatar row`, `partner-logo rail`, `partial product UI`, `white canvas`
- Added: `centered oversized headline`, `inline green status dot`, `illustrated avatar row`, `partner-logo rail`, `partial product UI`
- Removed: `direct headline`, `product emblems`, `proof logos`, `blue CTA`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Notion — Teams and Agents". Center an oversized proposition with small illustrated product emblems above and a wide customer-proof strip below. Use friendly characterful display type paired with plain, legible interface copy. Palette: white, ink black, Notion-like blue, and tiny multicolor accents. Surface treatment: clean vector icons and crisp interface surfaces. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve immediate readability and the playful product constellation; avoid cloning brand logos, decorative backgrounds, long paragraphs. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a loose family of original circular character and tool emblems representing people, documents, search, automation, and collaboration] friendly flat vector icons with black outlines, white interiors, and small blue, yellow, red, purple, and green accents. Arrange a compact row above the center and a few isolated emblems near the outer edges; leave the middle clear for HTML headline and actions. No text, real logos, copied Notion characters, UI chrome, or gradients. Transparent or white ground.
```

### Structured AI design brief

**Before:**

```text
Composition: Center an oversized proposition with small illustrated product emblems above and a wide customer-proof strip below.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: white, ink black, Notion-like blue, and tiny multicolor accents
Texture: clean vector icons and crisp interface surfaces
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: small emblems drift or respond while headline and actions remain stable
Preserve: immediate readability and the playful product constellation
Avoid: cloning brand logos, decorative backgrounds, long paragraphs
```

**After:**

```text
Composition: Center a large three-line collaboration statement and paired actions; place an emblem row above, sparse accent icons at the edges, partner proof below, and a cropped product surface at the base.
Typography: Oversized friendly grotesk with tight leading; small neutral sans-serif for body, navigation, actions, and partner labels.
Palette: White, ink black, Notion-like blue, one bright green status accent, and small multicolor icon accents.
Texture: Flat outlined character icons, crisp interface crops, and otherwise untextured white space.
Hierarchy: Collaboration statement first, paired actions second, emblem family third, partner and product proof fourth.
Spacing: Use a narrow centered text column, generous white margins, a thin proof rail, and only sparse edge decoration.
Motion: If adapted, let individual emblems enter or bob subtly; keep headline, actions, proof rail, and product surface stable.
Preserve: The playful proof around a highly readable center, inline green status dot, and transition from promise to real product evidence.
Avoid: Copied brand characters, dense icon constellations, floating glass cards, generic AI sparkles, or hiding the product proof.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 20 — Notion — What’s New

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Product changelog / editorial release feed
- After: Product changelog / editorial feed

### Description

**Before:** A spacious product changelog pairs a large “What’s New” masthead with dated editorial entries and crisp interface screenshots, making release history feel like a designed publication.

**After:** A large changelog masthead and small celebratory box illustration sit above a dated two-column release feed that pairs concise editorial copy with real interface evidence.

### Tags

- Before: `release chronology`, `product screenshots`, `white canvas`, `date labels`, `editorial feed`, `thin dividers`
- After: `large changelog masthead`, `open-box line illustration`, `dated release feed`, `two-column editorial grid`, `product screenshot proof`, `thin divider rules`
- Added: `large changelog masthead`, `open-box line illustration`, `dated release feed`, `two-column editorial grid`, `product screenshot proof`, `thin divider rules`
- Removed: `release chronology`, `product screenshots`, `white canvas`, `date labels`, `editorial feed`, `thin dividers`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Notion — What’s New". Open with a large left-aligned changelog masthead, then stack dated release entries in a measured editorial column with product screenshots occupying the broad right field. Use large friendly grotesk display type paired with compact sans-serif dates and readable article copy. Palette: paper white, ink black, warm grey, and restrained colors supplied by product screenshots. Surface treatment: clean editorial rules, crisp interface imagery, and lightly shaded metadata surfaces. Hierarchy: the changelog title leads, each release headline anchors its entry, and screenshots provide concrete proof. Preserve the chronological logic, editorial calm, and close relationship between release copy and interface proof; avoid dense roadmap tables, feature-card mosaics, celebratory gradients, oversized promotional banners. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: an open cardboard box with a few abstract sparks and paper shapes emerging] compact black-and-white editorial line illustration with one halftone side panel and slightly playful geometry. Isolate the object on transparent or white ground; keep it small enough to sit opposite an HTML changelog masthead. Pure black and white, flat print treatment. No text, logos, product UI, confetti color, gradients, or realistic cardboard texture.
```

### Structured AI design brief

**Before:**

```text
Composition: Open with a large left-aligned changelog masthead, then stack dated release entries in a measured editorial column with product screenshots occupying the broad right field.
Typography: large friendly grotesk display type paired with compact sans-serif dates and readable article copy
Palette: paper white, ink black, warm grey, and restrained colors supplied by product screenshots
Texture: clean editorial rules, crisp interface imagery, and lightly shaded metadata surfaces
Hierarchy: the changelog title leads, each release headline anchors its entry, and screenshots provide concrete proof
Spacing: use generous margins around the masthead and consistent vertical intervals between dated entries
Motion: keep the card still; on the live page, use straightforward document scrolling rather than decorative animation
Preserve: the chronological logic, editorial calm, and close relationship between release copy and interface proof
Avoid: dense roadmap tables, feature-card mosaics, celebratory gradients, oversized promotional banners
```

**After:**

```text
Composition: Open with a large left masthead and small box illustration on the right; below a long divider, pair dates in a narrow left column with release copy and screenshots in a broad right column.
Typography: Large heavy grotesk masthead and release titles; regular sans-serif body; small muted dates and utility links.
Palette: White, ink black, warm grey, one link blue, and restrained color from genuine product screenshots.
Texture: Clean editorial rules, one-bit box illustration, crisp UI imagery, and flat metadata surfaces.
Hierarchy: Masthead first, current release title second, explanatory copy third, screenshot proof fourth, date as quiet metadata.
Spacing: Use generous masthead margins, a strong vertical break before the feed, and consistent two-column intervals between entries.
Motion: Keep the opening state still; use ordinary document scrolling and restrained media loading rather than decorative reveals.
Preserve: Chronology, editorial calm, visible dates, and close coupling between release explanation and product proof.
Avoid: Roadmap tables, feature-card mosaics, celebratory gradients, animated confetti, or screenshots detached from their release copy.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 21 — Spade

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Finance platform / print-tech anatomy
- After: Finance platform / contour-ledger hero

### Description

**Before:** A finance proposition is staged on pale green paper with a contour-engraved coin, transaction fragments, and ruler-like edge markings.

**After:** A pale sage finance hero combines a centered grotesk promise with a rotating contour-built coin, receipt fragments, ledger data, and edge rulers.

### Tags

- Before: `pale green`, `engraved coin`, `finance data`, `ruler marks`, `black type`, `ambient rotation`
- After: `pale sage canvas`, `contour coin illustration`, `centered grotesk headline`, `ledger data panels`, `edge measurement ticks`, `ambient object rotation`
- Added: `pale sage canvas`, `contour coin illustration`, `centered grotesk headline`, `ledger data panels`, `edge measurement ticks`, `ambient object rotation`
- Removed: `pale green`, `engraved coin`, `finance data`, `ruler marks`, `black type`, `ambient rotation`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Spade". Place a bold finance headline in the upper center, then layer an engraved coin, transaction receipt, and measurement ticks across the lower plane. Use oversized clean grotesk display type paired with compact monospaced ledger labels. Palette: pale sage paper, black ink, white, and restrained green. Surface treatment: technical engraving, ledger marks, and thin measurement rules. Hierarchy: the two-line finance proposition leads, the animated coin forms the center anchor, and compact transaction panels supply proof. Preserve the financial clarity, stable information hierarchy, and tactile technical-paper character; avoid banking stock photos, glossy gradients, generic chart cards, scrolling the hero during the ambient loop. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: one circular coin-like form built from stacked topographic contour lines] flat technical engraving with uneven layered edges, black and muted green linework, and no realistic metal. Center it in the lower-middle field; leave broad sage space above for HTML headline and room on both sides for code-built ledger panels. Pale sage, black, white, and one restrained green only. Shadowless technical treatment; no text, currency symbols, logos, receipt UI, gradients, or metallic shine. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a bold finance headline in the upper center, then layer an engraved coin, transaction receipt, and measurement ticks across the lower plane.
Typography: oversized clean grotesk display type paired with compact monospaced ledger labels
Palette: pale sage paper, black ink, white, and restrained green
Texture: technical engraving, ledger marks, and thin measurement rules
Hierarchy: the two-line finance proposition leads, the animated coin forms the center anchor, and compact transaction panels supply proof
Spacing: use a centered hero grid with broad sage breathing room and data modules balanced on either side of the coin
Motion: rotate and refold the central contour-engraved coin continuously while the surrounding headline, data panels, and measurement frame stay locked in place
Preserve: the financial clarity, stable information hierarchy, and tactile technical-paper character
Avoid: banking stock photos, glossy gradients, generic chart cards, scrolling the hero during the ambient loop
```

**After:**

```text
Composition: Center a two-line finance proposition above the contour coin; balance small transaction and location panels on either side and run measurement ticks along both edges.
Typography: Oversized clean grotesk display; compact monospaced ledger labels; small neutral sans-serif navigation and body copy.
Palette: Pale sage, black ink, white, and restrained green.
Texture: Topographic contour lines, thin rulers, flat ledger panels, and lightly technical paper surfaces.
Hierarchy: Headline first, animated coin second, ledger evidence third, conversion action and explanation fourth.
Spacing: Use a centered vertical axis with wide sage breathing room and symmetric support panels flanking the coin.
Motion: Rotate and refold the contour-built coin continuously; keep headline, panels, rulers, and page position fixed.
Preserve: Financial clarity, stable page shell, tactile contour object, sparse technical evidence, and pale sage restraint.
Avoid: Metallic coin rendering, bank stock photography, glossy gradients, generic charts, or scrolling during the ambient hero loop.
```

### Motion behavior

**Before:** Without scrolling or pointer input, the central engraved coin rotates through layered contour states while the headline, transaction panels, and technical hero frame remain fixed in an eight-second ambient excerpt.

**After:** Trigger: automatic on page load. The central contour coin rotates through layered edge profiles while headline, ledger panels, rulers, and page shell remain fixed. The library preserves an eight-second ambient excerpt and loops it.

---

## 22 — SSTR Friction Systems

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Industrial hero / monumental machinery
- After: Industrial product story / engineered contrast

### Description

**Before:** A drilling component is treated as a black monument against a soft industrial horizon, with compact utility copy and a single high-energy action.

**After:** A monumental drilling component fills a dark technical hero, then a long black-white-orange case narrative converts mechanical performance into diagrams, test results, components, and field evidence.

### Tags

- Before: `industrial object`, `soft horizon`, `orange CTA`, `technical nav`, `monumental crop`
- After: `monumental drill component`, `black white orange system`, `industrial photography`, `performance data plots`, `technical section grid`, `scroll-driven case narrative`
- Added: `monumental drill component`, `black white orange system`, `industrial photography`, `performance data plots`, `technical section grid`, `scroll-driven case narrative`
- Removed: `industrial object`, `soft horizon`, `orange CTA`, `technical nav`, `monumental crop`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "SSTR Friction Systems". Crop a single industrial tool as a vertical monument in the center and position technical copy along the left third. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: warm grey, black, dust beige, white, and safety orange. Surface treatment: matte machined metal against a soft granular horizon. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the object scale, industrial restraint, and one sharp action color; avoid busy spec sheets, multiple bright buttons, generic factory footage. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The defining asset is a real engineered product shown through verified photography, film, and technical evidence. Use supplied product media or an approved 3D model; do not invent the hardware with an image generator.
```

### Structured AI design brief

**Before:**

```text
Composition: Crop a single industrial tool as a vertical monument in the center and position technical copy along the left third.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: warm grey, black, dust beige, white, and safety orange
Texture: matte machined metal against a soft granular horizon
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: begin with a measured percentage loader and outlined-part assembly, resolve into the product film, then reveal results and equipment sections through smooth scrolling before settling
Preserve: the object scale, industrial restraint, and one sharp action color
Avoid: busy spec sheets, multiple bright buttons, generic factory footage
```

**After:**

```text
Composition: Crop the drilling component as a vertical monument in the hero; alternate dark performance sections with white technical grids, component views, and field evidence down the page.
Typography: Large condensed grotesk statements; small uppercase technical sans-serif; compact numeric labels; occasional oversized performance figures.
Palette: Near-black, white, warm industrial grey, dust beige, and safety orange.
Texture: Machined metal, dusty field photography, dotted engineering grids, thin plots, and flat high-contrast panels.
Hierarchy: Product scale and problem statement lead; quantified results, component anatomy, and field validation build evidence sequentially.
Spacing: Use tall full-width chapters, strict technical grids, large numeric breathing room, and one orange action per decision point.
Motion: Begin with the automatic product assembly/film state, then scroll through results, component anatomy, field applications, and final proof with readable holds.
Preserve: Real product fidelity, severe black-white contrast, one safety-orange accent, technical credibility, and evidence progression.
Avoid: Invented machinery, generic factory footage, decorative dashboards, multiple bright actions, or scrolling too quickly for plots and labels to resolve.
```

### Motion behavior

**Before:** An automatic percentage loader assembles outlined industrial forms, resolves into the drilling hero, then smooth scrolling reveals field results and technical proof over about twenty seconds.

**After:** Trigger: automatic introduction followed by captured scrolling. The sequence resolves into the drilling hero, then advances through measured results, product anatomy, field applications, and closing proof. Text and diagrams receive short holds; the roughly twenty-second capture settles at the final state.

---

## 23 — FS60P Watch

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Product selector / typographic monument
- After: Watch selector / type-object collision

### Description

**Before:** A compact mechanical watch interrupts enormous condensed lettering, using an ultra-clean selector interface and precision-line geometry.

**After:** A photoreal steel watch is centered over enormous cropped model lettering and fine circular guides, turning a product selector into a precise typographic monument.

### Tags

- Before: `giant type`, `product cutout`, `precision lines`, `silver palette`, `selector UI`
- After: `centered steel watch`, `giant cropped model type`, `concentric guide circles`, `silver monochrome palette`, `corner metadata`, `product selector stage`
- Added: `centered steel watch`, `giant cropped model type`, `concentric guide circles`, `silver monochrome palette`, `corner metadata`, `product selector stage`
- Removed: `giant type`, `product cutout`, `precision lines`, `silver palette`, `selector UI`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "FS60P Watch". Stretch an enormous model name edge to edge, suspend a precisely rendered watch at center, and keep selector metadata in the corners. Use quiet display typography with compact, nearly invisible navigation. Palette: silver, white, soft grey, and black. Surface treatment: polished metal, fine vector arcs, and a seamless studio field. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the type/object collision and extremely restrained controls; avoid luxury black-and-gold clichés, lifestyle photography, crowded spec tables. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The hero depends on the exact watch model and its materials. Use an approved product render or 3D model; build the oversized model name, circular guides, and selector metadata as real interface layers.
```

### Structured AI design brief

**Before:**

```text
Composition: Stretch an enormous model name edge to edge, suspend a precisely rendered watch at center, and keep selector metadata in the corners.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: silver, white, soft grey, and black
Texture: polished metal, fine vector arcs, and a seamless studio field
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: rotate the watch slowly with crisp model-to-model transitions
Preserve: the type/object collision and extremely restrained controls
Avoid: luxury black-and-gold clichés, lifestyle photography, crowded spec tables
```

**After:**

```text
Composition: Center one large watch over edge-to-edge cropped model lettering and concentric construction circles; anchor model metadata near the lower left and utility controls at the edges.
Typography: Ultra-large thin geometric sans-serif for the model name; compact light grotesk for model metadata and selector controls.
Palette: White, silver, soft grey, graphite, and black.
Texture: Polished steel and glass against thin vector circles, precise rules, and a seamless studio surface.
Hierarchy: Physical watch first, cropped model name second, model identifier third, edge controls last.
Spacing: Lock the watch to the center, let type crop beyond both side edges, and keep metadata isolated in the lower-left quadrant.
Motion: If implemented from a 3D asset, rotate the watch slowly or transition between models while guide geometry and labels stay fixed.
Preserve: Exact product fidelity, extreme type scale, centered object, restrained metadata, and technical circles.
Avoid: Generated watch details, black-and-gold luxury clichés, lifestyle photography, crowded specifications, or fast spins.
```

### Motion behavior

**Before:** The watch rotates and selector states shift within a fixed typographic stage.

**After:** Still reference; no captured motion evidence.

---

## 24 — Igloo Inc.

**Source/quality:** Unchanged — canonical live browser capture; 1279 × 720.

### Descriptor

- Before: Monochrome world / sculptural studio
- After: 3D portfolio hero / crystalline landscape

### Description

**Before:** A crystalline igloo sits in a vast grayscale mountain world, surrounded by tiny interface annotations that make the scene feel exploratory and authored.

**After:** A translucent block-built igloo sits alone in a monochrome mountain basin, framed by tiny technical metadata and an interactive object response rather than conventional portfolio navigation.

### Tags

- Before: `monochrome 3D`, `mountain world`, `crystal object`, `micro labels`, `ambient scene`
- After: `translucent block igloo`, `monochrome mountain basin`, `grainy 3D terrain`, `tiny edge metadata`, `pointer-reactive blocks`, `crystalline lighting`
- Added: `translucent block igloo`, `monochrome mountain basin`, `grainy 3D terrain`, `tiny edge metadata`, `pointer-reactive blocks`, `crystalline lighting`
- Removed: `monochrome 3D`, `mountain world`, `crystal object`, `micro labels`, `ambient scene`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Igloo Inc.". Place a translucent igloo slightly off center in a wide mountain basin and distribute tiny studio metadata around the frame edges. Use quiet display typography with compact, nearly invisible navigation. Palette: snow white, graphite, mist grey, and glassy highlights. Surface treatment: grainy terrain, translucent ice blocks, and fine wireframe annotations. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the solitude, object clarity, and tiny edge annotations; avoid bright color, conventional portfolio grids, fast 3D camera moves. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a translucent igloo built from irregular glass-like ice blocks] high-detail 3D render in a barren monochrome mountain basin. Place the igloo slightly left of center with a smaller entrance dome extending right; use cold diffuse light, soft internal glow, misty distance, and fine terrain grain. Snow white, graphite, silver grey, and glass highlights only. No text, logos, people, saturated color, fantasy props, or interface overlays. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a translucent igloo slightly off center in a wide mountain basin and distribute tiny studio metadata around the frame edges.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: snow white, graphite, mist grey, and glassy highlights
Texture: grainy terrain, translucent ice blocks, and fine wireframe annotations
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: construct the object during the intro, then let pointer proximity displace nearby blocks with weighty depth before they settle back into the dome
Preserve: the solitude, object clarity, and tiny edge annotations
Avoid: bright color, conventional portfolio grids, fast 3D camera moves
```

**After:**

```text
Composition: Place the igloo slightly left of center in a wide basin; keep navigation and technical metadata tiny at the frame edges and leave the landscape uninterrupted.
Typography: Small blocky display mark and tiny monospaced/system metadata; no large marketing headline.
Palette: Snow white, silver grey, graphite, and translucent glass highlights.
Texture: Grainy mountain terrain, translucent ice blocks, internal bloom, and fine wireframe particles during the introduction.
Hierarchy: Igloo first, terrain second, edge metadata third; interface deliberately refuses a conventional headline hierarchy.
Spacing: Use broad empty terrain around the object and keep all text pinned to shallow edge zones.
Motion: Construct the igloo during the intro; pointer proximity then lifts, separates, and re-settles nearby blocks with weight and depth.
Preserve: Object solitude, translucent block material, monochrome basin, tiny edge annotations, and localized pointer response.
Avoid: Bright color, large portfolio copy, floating project cards, fast camera movement, or moving the whole landscape on hover.
```

### Motion behavior

**Before:** A quiet automatic introduction constructs the crystalline igloo; slow pointer movement over the central structure then lifts, separates, and re-settles individual ice blocks.

**After:** Trigger: automatic introduction, then pointer movement over the igloo. A wireframe/particle form resolves into the block structure; nearby blocks lift and separate as the pointer crosses the dome, then settle back. Terrain, camera, and edge metadata remain stable.

---

## 25 — Don’t Board Me

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Pet-care hero / hand-drawn campaign
- After: Pet-care hero / poster illustration

### Description

**Before:** A cream-and-red pet-care hero lets an enormous condensed promise wrap around a loosely drawn white dog, balancing campaign scale with friendly character illustration.

**After:** A loose black-line dog drawing splits an oversized red campaign statement into opposing blocks, creating a friendly pet-care hero with the force of a printed poster.

### Tags

- Before: `cream and red`, `hand-drawn dog`, `oversized condensed type`, `asymmetric headline`, `compact navigation`
- After: `oversized condensed red type`, `hand-drawn white dog`, `cream paper field`, `split campaign statement`, `minimal red navigation`, `poster-like composition`
- Added: `oversized condensed red type`, `hand-drawn white dog`, `cream paper field`, `split campaign statement`, `minimal red navigation`, `poster-like composition`
- Removed: `cream and red`, `hand-drawn dog`, `oversized condensed type`, `asymmetric headline`, `compact navigation`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Don’t Board Me". Wrap a giant left-aligned campaign statement around a central hand-drawn dog, with compact navigation held to the top edge and one small action near the lower field. Use oversized narrow condensed display type paired with tiny utilitarian sans-serif navigation. Palette: warm cream, signal red, white, and restrained charcoal. Surface treatment: loose pencil-and-ink dog illustration against flat paper color. Hierarchy: the red promise dominates, the dog gives it character, and the small controls remain clearly subordinate. Preserve the red-and-cream contrast, hand-drawn dog, and type wrapping around the figure; avoid pink entrance graphics, glossy pet photography, rounded app cards, busy paw-print decoration. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a tired but friendly long-haired dog facing forward] loose black pencil-and-ink line drawing with broad white fur shapes and one thin red collar or tongue accent. Center and crop the dog from the bottom edge; leave large cream fields on both sides for HTML display type. Warm cream, signal red, black, and white only. Flat paper treatment; no text, logos, paw-print pattern, glossy pet photography, 3D mascot, or background scene. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Wrap a giant left-aligned campaign statement around a central hand-drawn dog, with compact navigation held to the top edge and one small action near the lower field.
Typography: oversized narrow condensed display type paired with tiny utilitarian sans-serif navigation
Palette: warm cream, signal red, white, and restrained charcoal
Texture: loose pencil-and-ink dog illustration against flat paper color
Hierarchy: the red promise dominates, the dog gives it character, and the small controls remain clearly subordinate
Spacing: use broad cream margins while allowing the headline to crop confidently at the frame edges
Motion: treat this approved moment as a still; if animated later, keep the dog response subtle and preserve headline legibility
Preserve: the red-and-cream contrast, hand-drawn dog, and type wrapping around the figure
Avoid: pink entrance graphics, glossy pet photography, rounded app cards, busy paw-print decoration
```

**After:**

```text
Composition: Center a large cropped dog illustration; wrap two oversized red text blocks around it and keep navigation in a thin top rail.
Typography: Huge narrow condensed sans-serif in signal red; tiny uppercase utility sans-serif for navigation and actions.
Palette: Warm cream, signal red, black, and white.
Texture: Loose pencil-and-ink dog lines on a flat paper field with no shadows.
Hierarchy: Red campaign statement and dog share the focal plane; navigation and booking action remain clearly subordinate.
Spacing: Let display type crop at side edges, preserve clean cream gutters around the dog, and keep the top rail shallow.
Motion: Keep the poster composition still; if adapted, use only a small expression or line movement within the dog without shifting type.
Preserve: Red-and-cream force, hand-drawn dog, type wrapping around the figure, and immediate campaign readability.
Avoid: Pink entrance graphics, pet stock photos, rounded app cards, paw-print decoration, or novelty motion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 26 — Opal — The Table

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Editorial product story / dense image column
- After: Product editorial / photographic mosaic

### Description

**Before:** A dense column of close-up product imagery runs beside a narrow editorial text block, creating the feel of a contemporary product monograph.

**After:** A dense vertical mosaic of workshop photographs is paired with a narrow black editorial column, making a single office table feel like an archival product story rather than a sales page.

### Tags

- Before: `editorial split`, `product close-ups`, `narrow copy`, `dark canvas`, `vertical sequence`
- After: `dense photo mosaic`, `narrow black text column`, `workshop still life`, `archival product story`, `asymmetric columns`, `white microtype`
- Added: `dense photo mosaic`, `narrow black text column`, `workshop still life`, `archival product story`, `asymmetric columns`, `white microtype`
- Removed: `editorial split`, `product close-ups`, `narrow copy`, `dark canvas`, `vertical sequence`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Opal — The Table". Dedicate most of the frame to a vertical mosaic of intimate product images and reserve a narrow column for title and essay text. Use quiet display typography with compact, nearly invisible navigation. Palette: black, warm cream, steel blue, and incidental product colors. Surface treatment: high-detail material photography against matte editorial surfaces. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the monograph density and confident asymmetry; avoid equal-sized product cards, obvious ecommerce chrome, oversized CTA buttons. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: an eclectic office table covered with vintage electronics, modular objects, prototypes, tools, and color samples] overhead and oblique editorial photography arranged as a tight asymmetric mosaic. Use moody practical light, deep shadows, warm wood, black, muted red, yellow, blue, and off-white. Reserve one narrow dark vertical column for HTML title and story copy. No text, logos, people, floating UI, clean e-commerce packshots, or repeated stock objects. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Dedicate most of the frame to a vertical mosaic of intimate product images and reserve a narrow column for title and essay text.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: black, warm cream, steel blue, and incidental product colors
Texture: high-detail material photography against matte editorial surfaces
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: scroll the image column at a distinct pace from the anchored text
Preserve: the monograph density and confident asymmetry
Avoid: equal-sized product cards, obvious ecommerce chrome, oversized CTA buttons
```

**After:**

```text
Composition: Build a tall edge-to-edge mosaic from varied close-up photographs and reserve one narrow black column for title, date, and editorial copy.
Typography: Bold lowercase grotesk title in white; compact white sans-serif body and small date metadata.
Palette: Near-black, warm wood, muted red, yellow, blue, off-white, and colors inherent to photographed objects.
Texture: Dense product photography, workshop wear, plastic and metal surfaces, hard crops, and one flat black text panel.
Hierarchy: White title identifies the object, mosaic establishes material richness, editorial copy provides meaning, and date remains tertiary.
Spacing: Use narrow gutters or direct abutment between photographs; keep the text column readable and vertically centered.
Motion: If adapted, move the image mosaic through measured vertical reveals while the text column remains pinned for each story chapter.
Preserve: Photographic density, asymmetric editorial column, object intimacy, and the feeling of an archive or field note.
Avoid: Uniform e-commerce grids, clean product packshots, floating cards, oversized marketing copy, or rapid collage motion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 27 — Lusion Studio

**Source/quality:** Unchanged — canonical live browser capture; 1264 × 720.

### Descriptor

- Before: 3D portfolio / modular playfield
- After: 3D studio hero / interactive playfield

### Description

**Before:** A precise studio statement sits above an interactive tray of abstract 3D components, treating capability proof as a playable construction set.

**After:** A restrained studio statement sits above a bounded black playfield where glossy blue, black, and white tubular forms collide and rotate in response to pointer movement.

### Tags

- Before: `interactive 3D`, `modular objects`, `studio statement`, `white canvas`, `playful physics`
- After: `interactive 3D tubes`, `blue black white palette`, `bounded black playfield`, `pointer-driven physics`, `compact studio statement`, `fixed utility shell`
- Added: `interactive 3D tubes`, `blue black white palette`, `bounded black playfield`, `pointer-driven physics`, `compact studio statement`, `fixed utility shell`
- Removed: `interactive 3D`, `modular objects`, `studio statement`, `white canvas`, `playful physics`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Lusion Studio". Keep a concise studio statement in a narrow top band and place a large interactive tray of abstract 3D objects beneath it. Use quiet display typography with compact, nearly invisible navigation. Palette: white, black, cobalt blue, lavender, and charcoal. Surface treatment: soft matte 3D materials with studio lighting. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the playfield framing and contrast between sober copy and playful objects; avoid full-screen visual noise, excessive camera rotation, decorative gradients. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a dense pile of short hollow tubes and interlocking industrial forms] glossy high-detail 3D render with cobalt blue, black, and matte white pieces inside a deep black rectangular tray. Use close-up perspective, crisp studio highlights, hard occlusion, and no background scene. Fill the media frame edge to edge while leaving the surrounding webpage outside the asset clean. No text, logos, UI controls, gradients outside natural material reflections, or toy branding. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Keep a concise studio statement in a narrow top band and place a large interactive tray of abstract 3D objects beneath it.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: white, black, cobalt blue, lavender, and charcoal
Texture: soft matte 3D materials with studio lighting
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: map pointer position to restrained rotation and displacement of individual components, keep the camera stable, and let inertia settle after the pointer stops
Preserve: the playfield framing and contrast between sober copy and playful objects
Avoid: full-screen visual noise, excessive camera rotation, decorative gradients
```

**After:**

```text
Composition: Keep studio name, concise proposition, and actions in a shallow top band; place the interactive 3D tray across nearly the full width below.
Typography: Large plain grotesk statement with tight leading; small uppercase utility labels and compact rounded controls.
Palette: White page shell, deep black tray, cobalt blue, black, and matte white objects.
Texture: Glossy 3D plastic or ceramic tubes, strong occlusion, crisp highlights, and a flat interface frame.
Hierarchy: Interactive tray first, studio proposition second, edge controls third.
Spacing: Use a shallow top band, minimal outer margins, and a large bounded media surface with a thin instruction rail below.
Motion: Map smooth pointer paths to localized collisions, rotation, and inertial displacement inside the tray; keep the outer shell fixed.
Preserve: Physical object response, blue-black-white discipline, bounded playfield, and calm surrounding interface.
Avoid: Scroll-driven camera movement in the hero, multicolor objects, unbounded WebGL backgrounds, text inside the playfield, or weightless motion.
```

### Motion behavior

**Before:** Deliberate pointer movement through the central tray rotates and displaces the blue, black, and white 3D components with inertial depth while the page frame stays fixed.

**After:** Trigger: pointer movement inside the 3D media region. Nearby blue, black, and white tubes rotate, collide, and shift with visible inertia while the headline, controls, and page frame remain fixed. Leaving the region returns the library preview to its poster.

---

## 28 — MANA Yerba Mate

**Source/quality:** Unchanged — canonical live browser capture; 1237 × 690.

### Descriptor

- Before: Botanical packaging / exuberant collage
- After: Beverage hero / botanical cut-paper collage

### Description

**Before:** A bright can is surrounded by hand-cut fruit, flowers, sun shapes, and bold lettering, creating an energetic packaging-led world.

**After:** A centered yerba-mate can is surrounded by exuberant cut-paper leaves, flowers, fruit, clouds, and character fragments, turning one flavor into a saturated illustrated world.

### Tags

- Before: `botanical collage`, `packaging hero`, `cut-paper shapes`, `lime green`, `playful lettering`
- After: `centered beverage can`, `cut-paper botanicals`, `light green color field`, `flavor label button`, `collage edge framing`, `playful product world`
- Added: `centered beverage can`, `cut-paper botanicals`, `light green color field`, `flavor label button`, `collage edge framing`, `playful product world`
- Removed: `botanical collage`, `packaging hero`, `cut-paper shapes`, `lime green`, `playful lettering`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "MANA Yerba Mate". Center a beverage can and surround it with oversized cut-paper fruit, leaves, flowers, and expressive lettering. Use friendly characterful display type paired with plain, legible interface copy. Palette: lime green, coral red, cream, leaf green, orange, and black. Surface treatment: paper-cut illustration with chunky hand-drawn marks. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the bold product focus and joyful botanical density; avoid photo-real fruit splashes, glossy beverage clichés, tiny ingredient copy. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: exuberant cut-paper botanicals, flowers, melon slices, mint leaves, clouds, and playful abstract character fragments] flat layered collage with slightly irregular paper edges and simple ink marks. Arrange the pieces as a dense border around an empty central product silhouette and reserve a small clear area below for an HTML flavor control. Light yellow-green, forest green, coral, cream, sky blue, white, and black. Even illustrated light; no text, logos, branded can, UI, or photoreal fruit.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a beverage can and surround it with oversized cut-paper fruit, leaves, flowers, and expressive lettering.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: lime green, coral red, cream, leaf green, orange, and black
Texture: paper-cut illustration with chunky hand-drawn marks
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: ingredients bounce and slide in layered loops around a stable can
Preserve: the bold product focus and joyful botanical density
Avoid: photo-real fruit splashes, glossy beverage clichés, tiny ingredient copy
```

**After:**

```text
Composition: Center the real product packshot; surround it with illustrated collage pieces that crop from every edge and place one compact flavor control below.
Typography: Chunky custom display lettering on packaging; compact rounded sans-serif navigation and flavor controls.
Palette: Light yellow-green, forest green, coral, cream, sky blue, white, and black.
Texture: Layered cut-paper botanicals, hand-drawn marks, matte packaging, and flat color fields.
Hierarchy: Product packshot first, surrounding flavor world second, flavor selector third, compact navigation last.
Spacing: Protect a clear central silhouette for the can; let collage pieces crop at edges and keep controls small and isolated.
Motion: If adapted, float or parallax collage layers gently around a stable packshot; do not move packaging copy.
Preserve: Real packaging fidelity, dense botanical frame, dominant single-flavor color, and playful flat materiality.
Avoid: Generating branded packaging, smooth wellness gradients, ingredient photography, floating benefit cards, or constant fast bobbing.
```

### Motion behavior

**Before:** Illustrated ingredients and packaging elements bounce, slide, and layer around the fixed product can.

**After:** Still reference; no captured motion evidence.

---

## 29 — Orano Innovation

**Source/quality:** Unchanged — usable enhanced derivative; 1600 × 1000.

### Descriptor

- Before: Industrial simulation / wireframe landscape
- After: Innovation experience / wireframe rover

### Description

**Before:** A miniature radiation rover glows in yellow wireframe against a panoramic black grid landscape, paired with sparse technical copy and a hard-edged enter control.

**After:** A dark technical title screen stages a transparent rover across a wireframe industrial horizon, using one yellow module and an austere entry control to frame innovation as simulation.

### Tags

- Before: `wireframe rover`, `black grid landscape`, `yellow accent`, `technical microcopy`, `panoramic interface`
- After: `wireframe rover`, `dark grid landscape`, `yellow module accent`, `technical microtype`, `centered enter control`, `simulation interface`
- Added: `dark grid landscape`, `yellow module accent`, `technical microtype`, `centered enter control`, `simulation interface`
- Removed: `black grid landscape`, `yellow accent`, `technical microcopy`, `panoramic interface`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Orano Innovation". Stage a large transparent rover across the lower left, extend a wireframe industrial horizon edge to edge, and place the experience title, concise explanation, and rectangular action on the right. Use widely tracked geometric capitals paired with very small technical sans-serif copy. Palette: near-black navy, dim steel lines, luminous white, and one safety-yellow focal accent. Surface treatment: dense terrain grids, transparent mechanical wireframes, faint scan noise, and precise construction rules. Hierarchy: the yellow rover component leads, the spaced title names the scenario, and the white action completes the technical sequence. Preserve the yellow-on-black technical focal point, panoramic grid horizon, and transparent rover anatomy; avoid documentary portraits, glossy 3D materials, bright dashboard cards, generic corporate illustration. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a large industrial exploration rover with transparent wheels and one highlighted equipment module] precise white wireframe rendering across a dark gridded landscape, with distant technical structures and a low horizon. Crop the rover across the lower-left and center; reserve the right-center for HTML title and entry control. Near-black, fine white and blue-grey lines, and one safety-yellow accent. No text, logos, browser UI, sci-fi neon, weapons, or photoreal terrain. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Stage a large transparent rover across the lower left, extend a wireframe industrial horizon edge to edge, and place the experience title, concise explanation, and rectangular action on the right.
Typography: widely tracked geometric capitals paired with very small technical sans-serif copy
Palette: near-black navy, dim steel lines, luminous white, and one safety-yellow focal accent
Texture: dense terrain grids, transparent mechanical wireframes, faint scan noise, and precise construction rules
Hierarchy: the yellow rover component leads, the spaced title names the scenario, and the white action completes the technical sequence
Spacing: use a wide cinematic field with large dark breathing room above the machinery and tightly aligned technical controls
Motion: if implemented, pan the wireframe landscape slowly and reveal mechanical layers in sequence while copy and controls remain stable
Preserve: the yellow-on-black technical focal point, panoramic grid horizon, and transparent rover anatomy
Avoid: documentary portraits, glossy 3D materials, bright dashboard cards, generic corporate illustration
```

**After:**

```text
Composition: Span a large wireframe rover across the lower-left and center, extend a technical horizon edge to edge, and place title, explanation, and enter control at right-center.
Typography: Widely tracked uppercase grotesk title; tiny monospaced/system annotations; small rectangular action label.
Palette: Near-black, fine white, blue-grey wireframe lines, and one safety-yellow module.
Texture: Dense technical mesh, perspective grid, transparent mechanical geometry, and low-intensity scan-like marks.
Hierarchy: Rover silhouette first, experience title second, yellow component third, enter control and microcopy last.
Spacing: Use a low panoramic horizon, large dark gaps around the title, and sparse edge annotations.
Motion: If adapted, reveal wireframe systems progressively or pulse the yellow module while camera, title, and enter control remain stable.
Preserve: Rover scale, transparent engineering detail, dark simulation field, and single yellow point of emphasis.
Avoid: Generic sci-fi HUD clutter, neon cyan grids, invented text, weapons, glossy space imagery, or multiple accent colors.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 30 — SNOWS Winter

**Source/quality:** Unchanged — canonical live browser capture; 1264 × 720.

### Descriptor

- Before: Seasonal confectionery / illustrated storefront
- After: Confectionery hero / illustrated still life

### Description

**Before:** A winter-blue illustrated awning frames chocolate products, character packaging, and tactile treats like a miniature seasonal shop window.

**After:** Chocolate pieces, cookies, and product artwork are scattered across a white tabletop beneath a broad blue illustrated canopy, creating a playful seasonal storefront without conventional product cards.

### Tags

- Before: `winter awning`, `product tableau`, `packaging characters`, `powder blue`, `seasonal retail`
- After: `scattered confectionery still life`, `blue illustrated canopy`, `white tabletop`, `product art panels`, `playful object spacing`, `minimal navigation`
- Added: `scattered confectionery still life`, `blue illustrated canopy`, `white tabletop`, `product art panels`, `playful object spacing`, `minimal navigation`
- Removed: `winter awning`, `product tableau`, `packaging characters`, `powder blue`, `seasonal retail`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "SNOWS Winter". Create a front-facing seasonal shop window with a scalloped awning above and products arranged in a horizontal tabletop tableau. Use friendly characterful display type paired with plain, legible interface copy. Palette: powder blue, snow white, chocolate brown, charcoal, and small pastel accents. Surface treatment: paper packaging, chocolate surfaces, and soft painted winter details. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the storefront framing and tactile product variety; avoid generic ecommerce grids, holiday red and green, heavy promotional badges. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: an assortment of chocolate truffles, cream-filled pieces, sandwich cookies, and small illustrated product cards] playful editorial still life on a seamless white tabletop. Scatter objects across the lower two-thirds at varied rotations; add a broad hand-painted blue canopy shape across the top and keep a little open space for HTML navigation. Soft diffuse studio light, gentle contact shadows. Cocoa brown, cream, powder blue, white, and muted print colors; no text, logos, branded wrappers, grid cards, or dark luxury styling. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Create a front-facing seasonal shop window with a scalloped awning above and products arranged in a horizontal tabletop tableau.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: powder blue, snow white, chocolate brown, charcoal, and small pastel accents
Texture: paper packaging, chocolate surfaces, and soft painted winter details
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: reveal products in sequence and let hanging or masked elements sway gently
Preserve: the storefront framing and tactile product variety
Avoid: generic ecommerce grids, holiday red and green, heavy promotional badges
```

**After:**

```text
Composition: Scatter confectionery and illustrated panels across a white tabletop; stretch a blue painted canopy across the top and keep controls sparse at the edges.
Typography: Small understated grotesk navigation and micro-labels; the visual stage carries more weight than copy.
Palette: White, powder blue, cocoa brown, cream, black, and muted colors from product art.
Texture: Soft studio photography, chocolate and wafer surfaces, paper artwork, and hand-painted canopy edges.
Hierarchy: Confectionery assortment first, product art second, brand and edge navigation third.
Spacing: Use irregular object gaps, broad white tabletop areas, and no enclosing cards; allow pieces to crop at side edges.
Motion: If adapted, use measured object reveals or a slow tabletop scroll; keep camera motion gentle and product forms readable.
Preserve: Playful scatter, white retail stage, blue seasonal canopy, and mixture of physical product with printed illustration.
Avoid: Black-and-gold confectionery luxury, uniform product grids, floating cards, heavy shadows, or rapid object movement.
```

### Motion behavior

**Before:** Masked logo and shop-window elements reveal in a playful seasonal sequence.

**After:** Still reference; no captured motion evidence.

---

## 31 — X Advertising

**Source/quality:** Unchanged — canonical live browser capture; 1264 × 720.

### Descriptor

- Before: Product explainer / diagrammatic proof
- After: Advertising explainer / wireframe system

### Description

**Before:** A direct performance headline sits beside a large ruled diagram of conversations, charts, and value blocks, turning an abstract ad product into a system map.

**After:** A large business outcome statement sits above a central offer-performance-testimonial diagram, using fine dashed construction lines and sparse proof labels on a white instructional canvas.

### Tags

- Before: `system diagram`, `ruled grid`, `value blocks`, `grotesk headline`, `product proof`
- After: `outcome-led headline`, `wireframe offer diagram`, `dashed construction lines`, `left utility navigation`, `white instructional canvas`, `compact proof labels`
- Added: `outcome-led headline`, `wireframe offer diagram`, `dashed construction lines`, `left utility navigation`, `white instructional canvas`, `compact proof labels`
- Removed: `system diagram`, `ruled grid`, `value blocks`, `grotesk headline`, `product proof`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "X Advertising". Place a concise headline on the left and devote most of the canvas to a ruled diagram connecting messages, charts, and value markers. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, near black, soft grey, and minimal blue. Surface treatment: fine rules, technical boxes, and sparse diagram annotation. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the diagram-first proof and high information clarity; avoid social feed mockups, decorative data, multicolor analytics cards. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The defining visual is a simple information diagram that must stay editable, responsive, and legible. Build its boxes, dashed connectors, labels, and values as SVG or HTML rather than rasterizing them with an image model.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a concise headline on the left and devote most of the canvas to a ruled diagram connecting messages, charts, and value markers.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, near black, soft grey, and minimal blue
Texture: fine rules, technical boxes, and sparse diagram annotation
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: animate connections sequentially to explain the system without moving the page structure
Preserve: the diagram-first proof and high information clarity
Avoid: social feed mockups, decorative data, multicolor analytics cards
```

**After:**

```text
Composition: Reserve a narrow left navigation rail; place the large two-line outcome statement above a centered three-part evidence diagram and compact explanation.
Typography: Large clean grotesk headline; small neutral sans-serif navigation and captions; compact monospaced or tabular values inside diagram nodes.
Palette: White, ink black, light grey, and minimal neutral tint.
Texture: Thin solid and dashed rules, flat outlined modules, simple chart marks, and untextured white space.
Hierarchy: Outcome statement first, causal diagram second, explanatory copy and actions third, navigation last.
Spacing: Use a fixed narrow sidebar, broad central canvas, generous headline margin, and large gaps around the diagram nodes.
Motion: Keep the diagram stable; if interaction is needed, trace one causal path on focus without moving the page structure.
Preserve: Editable diagram logic, severe monochrome clarity, left navigation, and the direct relationship between claim and proof.
Avoid: Generated text, screenshot-based diagrams, bright chart colors, rounded dashboard cards, or decorative animation.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 32 — X Business

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Business platform / stark conversion hero
- After: Business landing page / conversion diagram

### Description

**Before:** A severe black-and-white business landing page uses an oversized sales promise, compact navigation, and a restrained interface preview to frame advertising as a direct growth tool.

**After:** A compact sales headline and diagrammatic funnel occupy the upper canvas, with a newsletter proof strip beginning below and a persistent left-side learning navigation.

### Tags

- Before: `black-and-white UI`, `oversized grotesk`, `sales headline`, `hard-edged CTA`, `compact navigation`, `product proof`
- After: `sales headline`, `linear conversion diagram`, `left learning navigation`, `black-and-white UI`, `thin measurement rules`, `newsletter proof strip`
- Added: `linear conversion diagram`, `left learning navigation`, `thin measurement rules`, `newsletter proof strip`
- Removed: `oversized grotesk`, `hard-edged CTA`, `compact navigation`, `product proof`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "X Business". Place a blunt growth promise in the left half, hold navigation to a thin top bar, and reserve the lower or right field for one believable business-product proof surface. Use oversized heavy grotesk display lettering paired with compact neutral sans-serif controls. Palette: pure white, ink black, and narrow cool greys. Surface treatment: flat interface surfaces, crisp rules, and high-contrast screenshot detail. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the blunt promise, uncompromising monochrome, and direct action hierarchy; avoid social-media decoration, blue brand gradients, rounded marketing cards, testimonial clutter. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The central funnel is an editable explanatory diagram, not decorative imagery. Build its line, arcs, values, and labels as SVG or HTML so the system remains crisp, accessible, and responsive.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a blunt growth promise in the left half, hold navigation to a thin top bar, and reserve the lower or right field for one believable business-product proof surface.
Typography: oversized heavy grotesk display lettering paired with compact neutral sans-serif controls
Palette: pure white, ink black, and narrow cool greys
Texture: flat interface surfaces, crisp rules, and high-contrast screenshot detail
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: keep the opening composition stable and use only purposeful interface transitions below the fold
Preserve: the blunt promise, uncompromising monochrome, and direct action hierarchy
Avoid: social-media decoration, blue brand gradients, rounded marketing cards, testimonial clutter
```

**After:**

```text
Composition: Keep a narrow left navigation rail; place the sales proposition at upper left of the main canvas and a wide linear conversion diagram beneath it.
Typography: Large clean grotesk headline; compact neutral sans-serif navigation, captions, actions, and numeric labels.
Palette: Pure white, ink black, and very light grey.
Texture: Thin vector rules, dashed arcs, flat outlined modules, and minimal screenshot or newsletter proof below.
Hierarchy: Sales proposition first, conversion mechanism second, primary action third, lower proof content fourth.
Spacing: Use wide white margins around the diagram, a fixed shallow sidebar, and a clear vertical break before lower proof.
Motion: Keep the opening diagram stable; use focus states or path tracing only when it clarifies the conversion sequence.
Preserve: Monochrome severity, editable explanatory geometry, strong proposition, and direct conversion path.
Avoid: Blue social-media branding, generated diagram text, rounded SaaS cards, decorative gradients, or testimonial clutter above the fold.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 33 — X Business Basics

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Learning hub / editorial utility index
- After: Learning hub / orbital systems diagram

### Description

**Before:** A clean learning-hub entrance organizes foundational business guidance beneath a large editorial heading, combining publication spacing with compact utility navigation.

**After:** A blunt learning proposition is paired with an orbital line diagram and a persistent topic rail, giving a documentation page the clarity of a technical poster.

### Tags

- Before: `learning index`, `editorial heading`, `white canvas`, `utility navigation`, `article modules`, `black rules`
- After: `large learning headline`, `orbital line diagram`, `persistent left sidebar`, `black-and-white system`, `small centered CTA`, `technical poster layout`
- Added: `large learning headline`, `orbital line diagram`, `persistent left sidebar`, `black-and-white system`, `small centered CTA`, `technical poster layout`
- Removed: `learning index`, `editorial heading`, `white canvas`, `utility navigation`, `article modules`, `black rules`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "X Business Basics". Lead with a broad editorial learning proposition, then arrange a small set of foundational topics in a strict ruled index beneath it. Use an editorial serif paired with compact utilitarian mono labels. Palette: paper white, ink black, and soft neutral grey. Surface treatment: publication-like rules, simple icons, and crisp text blocks. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the instructional clarity, strong headline, and scannable topic grouping; avoid dashboard widgets, playful illustration, excessive badges, course-platform chrome. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The orbital illustration is simple editable geometry with meaningful labels. Recreate it as SVG or canvas lines and keep all copy in HTML; an image model would reduce precision and accessibility.
```

### Structured AI design brief

**Before:**

```text
Composition: Lead with a broad editorial learning proposition, then arrange a small set of foundational topics in a strict ruled index beneath it.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: paper white, ink black, and soft neutral grey
Texture: publication-like rules, simple icons, and crisp text blocks
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: use conventional document scrolling and restrained link feedback only
Preserve: the instructional clarity, strong headline, and scannable topic grouping
Avoid: dashboard widgets, playful illustration, excessive badges, course-platform chrome
```

**After:**

```text
Composition: Use a narrow left topic rail; place the large learning headline above a wide orbital diagram with a small explanation and action centered below.
Typography: Large geometric grotesk headline; compact neutral sans-serif for sidebar, explanatory copy, and actions.
Palette: White, ink black, and pale grey.
Texture: Fine elliptical rules, dashed guide marks, small node labels, and flat white interface surfaces.
Hierarchy: Learning proposition first, orbital model second, explanation and action third, topic rail as persistent context.
Spacing: Hold the sidebar narrow, give the diagram most of the main width, and use a large vertical break before the next topic section.
Motion: Keep the diagram still by default; on focus, highlight one orbit or node without rotating the full system.
Preserve: Editorial scale, precise orbital geometry, clear sidebar context, and code-rendered labels.
Avoid: Generated diagrams, decorative 3D planets, social-feed imagery, color gradients, or animated orbit spectacle.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 34 — Intro to X for Business

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Business primer / editorial argument
- After: Business primer / concentric field diagram

### Description

**Before:** A direct “Why use X for business?” proposition introduces a long-form primer with large black type, disciplined margins, and evidence blocks arranged like a contemporary report.

**After:** A large “Why use X for business?” question sits above a symmetrical field-line diagram centered on one node, with a compact campaign action and evidence section beginning below.

### Tags

- Before: `question headline`, `business primer`, `report layout`, `black-and-white`, `evidence blocks`, `wide margins`
- After: `question-led headline`, `concentric field-line diagram`, `center node`, `persistent left sidebar`, `black-and-white primer`, `compact campaign CTA`
- Added: `question-led headline`, `concentric field-line diagram`, `center node`, `persistent left sidebar`, `black-and-white primer`, `compact campaign CTA`
- Removed: `question headline`, `business primer`, `report layout`, `black-and-white`, `evidence blocks`, `wide margins`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Intro to X for Business". Frame a single strategic question at report scale, follow it with a concise thesis, and let evidence modules enter beneath a wide white margin. Use an editorial serif paired with compact utilitarian mono labels. Palette: white, black, graphite, and minimal neutral tint. Surface treatment: flat report paper, fine dividers, and crisp evidence graphics. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the question-led hierarchy and report-like credibility; avoid marketing carousels, social-feed mockups, loud color, dense navigation rails. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The hero’s value comes from precise concentric guide lines, a center node, and editable explanatory labels. Build the diagram as responsive SVG or canvas and keep all text in HTML rather than generating a raster image.
```

### Structured AI design brief

**Before:**

```text
Composition: Frame a single strategic question at report scale, follow it with a concise thesis, and let evidence modules enter beneath a wide white margin.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: white, black, graphite, and minimal neutral tint
Texture: flat report paper, fine dividers, and crisp evidence graphics
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: keep motion subordinate to reading; use only simple section reveals on scroll
Preserve: the question-led hierarchy and report-like credibility
Avoid: marketing carousels, social-feed mockups, loud color, dense navigation rails
```

**After:**

```text
Composition: Keep the left topic rail fixed; place the large question above a wide symmetric field-line diagram, then center a short explanation and action below it.
Typography: Large clean grotesk question; small neutral sans-serif for sidebar, explanatory copy, action, and evidence headings.
Palette: White, ink black, and very light grey.
Texture: Thin concentric ellipses, dashed field lines, a flat center node, and crisp white interface surfaces.
Hierarchy: Strategic question first, field diagram second, explanation and campaign action third, lower evidence headline fourth.
Spacing: Use a narrow sidebar, wide diagram canvas, a compact centered action group, and generous vertical separation before evidence.
Motion: If interaction helps, trace field lines toward the center on focus; keep headline, node, and page position stable.
Preserve: Question-led clarity, exact symmetry, central node, persistent navigation, and black-white discipline.
Avoid: Report-like text walls, generated linework, orbiting animation, social-feed mockups, bright brand gradients, or dense navigation rails.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 35 — Get Started with X

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Onboarding guide / typographic checklist
- After: Onboarding guide / mirrored orbit diagram

### Description

**Before:** A large onboarding promise introduces a practical sequence for establishing a business voice, using publication-like spacing and compact instructional modules.

**After:** A concise onboarding headline sits above mirrored circular paths converging on a small center node, translating “build your voice” into a spare technical system.

### Tags

- Before: `onboarding guide`, `large headline`, `instruction modules`, `white field`, `compact steps`, `black accents`
- After: `onboarding headline`, `mirrored circular diagram`, `central black node`, `persistent left sidebar`, `white documentation canvas`, `compact signup CTA`
- Added: `onboarding headline`, `mirrored circular diagram`, `central black node`, `persistent left sidebar`, `white documentation canvas`, `compact signup CTA`
- Removed: `onboarding guide`, `large headline`, `instruction modules`, `white field`, `compact steps`, `black accents`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Get Started with X". Use one oversized onboarding statement above a sequence of compact instructional blocks, maintaining a single readable vertical path. Use an editorial serif paired with compact utilitarian mono labels. Palette: paper white, ink black, and restrained grey. Surface treatment: thin editorial rules and clean instructional surfaces. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the practical sequence, generous margins, and unmistakable starting point; avoid wizard chrome, colorful stepper components, gamified onboarding, dense sidebars. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The mirrored circle system is simple, semantic interface geometry. Build it as SVG with crisp lines and a responsive center point; keep all labels and actions as accessible HTML.
```

### Structured AI design brief

**Before:**

```text
Composition: Use one oversized onboarding statement above a sequence of compact instructional blocks, maintaining a single readable vertical path.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: paper white, ink black, and restrained grey
Texture: thin editorial rules and clean instructional surfaces
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: let steps enter gently as the document scrolls; avoid animated progress theater
Preserve: the practical sequence, generous margins, and unmistakable starting point
Avoid: wizard chrome, colorful stepper components, gamified onboarding, dense sidebars
```

**After:**

```text
Composition: Use a narrow left topic rail; place the onboarding headline above a wide mirrored-circle diagram, with a compact signup prompt below and the next content section visible.
Typography: Large geometric grotesk headline; compact neutral sans-serif for navigation, prompts, actions, and instructional content.
Palette: White, ink black, and pale grey.
Texture: Thin circular vector paths, one black center node, sparse axes, and flat white content modules.
Hierarchy: Onboarding statement first, converging diagram second, signup action third, instructional content fourth.
Spacing: Hold broad white margins around the diagram, isolate the small center node, and separate the next section with a large vertical gap.
Motion: Keep the diagram stable; if needed, draw paths inward once as the section enters, then stop.
Preserve: Mirrored geometry, obvious center, narrow sidebar, practical action, and spacious document rhythm.
Avoid: Wizard chrome, generated labels, colorful steppers, orbit loops, gamification, or dense cards.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 36 — X Organic Best Practices

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Practice guide / modular evidence system
- After: Practice guide / radial expansion diagram

### Description

**Before:** An organic-content guide turns recommendations into a dense but orderly set of labeled modules, using black rules and strong typographic contrast instead of decorative imagery.

**After:** A large practice-guide title sits above a radial dashed field centered on one X node, followed by a compact action and modular recommendations beginning below.

### Tags

- Before: `best-practice modules`, `dense guidance`, `black rules`, `label hierarchy`, `white canvas`, `instructional grid`
- After: `practice-guide headline`, `radial dashed diagram`, `center brand node`, `left documentation rail`, `monochrome modules`, `phone example crop`
- Added: `practice-guide headline`, `radial dashed diagram`, `center brand node`, `left documentation rail`, `monochrome modules`, `phone example crop`
- Removed: `best-practice modules`, `dense guidance`, `black rules`, `label hierarchy`, `white canvas`, `instructional grid`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "X Organic Best Practices". Anchor the page with a clear practice-guide title and arrange recommendations as a strict modular grid with short labels and compact explanations. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, black, graphite, and very light grey. Surface treatment: fine rules, dense text rhythm, and flat information modules. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the information density, labels, and repeatable modular system; avoid decorative illustrations, oversized screenshots, soft card shadows, vague motivational copy. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The radial guide is code-native diagram geometry and the lower phone example is functional UI. Build both as SVG/HTML or use real product captures; do not generate them as a flattened image.
```

### Structured AI design brief

**Before:**

```text
Composition: Anchor the page with a clear practice-guide title and arrange recommendations as a strict modular grid with short labels and compact explanations.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, black, graphite, and very light grey
Texture: fine rules, dense text rhythm, and flat information modules
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: keep the guide readable during normal scrolling and use hover only to clarify linked modules
Preserve: the information density, labels, and repeatable modular system
Avoid: decorative illustrations, oversized screenshots, soft card shadows, vague motivational copy
```

**After:**

```text
Composition: Keep a narrow documentation rail; place the practice title above a wide radial dashed diagram, then a compact explanation/action and the first recommendation module below.
Typography: Large clean grotesk title; compact sans-serif navigation, labels, action text, and instructional copy.
Palette: White, ink black, graphite, and very light grey.
Texture: Dashed vector rays, one outlined center node, thin rules, flat modules, and genuine product-interface crops.
Hierarchy: Practice title first, radial system second, action third, recommendation modules and product example fourth.
Spacing: Use broad central margins, a shallow left rail, and consistent modular intervals below the hero diagram.
Motion: Keep reading stable; use hover or focus only to clarify linked recommendations and their corresponding diagram path.
Preserve: Radial geometry, precise labels, repeatable recommendation modules, and uncompromising monochrome readability.
Avoid: Generated UI, decorative illustration, soft card shadows, vague motivational copy, or continuous radial animation.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 37 — Getting Started with X Ads

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Advertising guide / procedural map
- After: Advertising guide / perspective funnel

### Description

**Before:** A procedural advertising guide combines a strong introductory heading with organized setup information, turning campaign activation into a navigable technical document.

**After:** A procedural advertising headline is paired with a wireframe room converging on a tiny campaign object, creating a literal visual path from setup to launch.

### Tags

- Before: `ads onboarding`, `procedural layout`, `setup modules`, `technical labels`, `white canvas`, `black hierarchy`
- After: `procedural headline`, `perspective wireframe room`, `center campaign object`, `left documentation rail`, `black-and-white guide`, `compact create-ad CTA`
- Added: `procedural headline`, `perspective wireframe room`, `center campaign object`, `left documentation rail`, `black-and-white guide`, `compact create-ad CTA`
- Removed: `ads onboarding`, `procedural layout`, `setup modules`, `technical labels`, `white canvas`, `black hierarchy`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Getting Started with X Ads". Introduce the advertising setup task with a large heading, then break the process into clearly named modules along one disciplined reading path. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, ink black, cool grey, and minimal interface blue if needed. Surface treatment: crisp rules, procedural labels, and restrained interface excerpts. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the procedural clarity and separation of setup stages; avoid animated funnels, generic growth charts, celebratory gradients, excessive conversion banners. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The hero is a precise perspective diagram with a small interface object and explanatory labels. Build it as responsive SVG/HTML so line convergence, text, and focus behavior remain exact.
```

### Structured AI design brief

**Before:**

```text
Composition: Introduce the advertising setup task with a large heading, then break the process into clearly named modules along one disciplined reading path.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, ink black, cool grey, and minimal interface blue if needed
Texture: crisp rules, procedural labels, and restrained interface excerpts
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: support progress with straightforward scrolling and modest linked-state feedback
Preserve: the procedural clarity and separation of setup stages
Avoid: animated funnels, generic growth charts, celebratory gradients, excessive conversion banners
```

**After:**

```text
Composition: Use a narrow left guide rail; place the procedural headline above a wide perspective room that converges on a small central campaign object, then center the action below.
Typography: Large geometric grotesk headline; compact neutral sans-serif for navigation, explanation, action, and procedural modules.
Palette: White, ink black, cool grey, and minimal genuine interface color.
Texture: Thin perspective rules, dashed depth guides, one small crisp UI object, and flat document surfaces.
Hierarchy: Setup headline first, perspective path second, central campaign object third, action and following instructions fourth.
Spacing: Give the perspective frame most of the canvas, keep the object deliberately small, and separate lower instructions with a strong vertical break.
Motion: If adapted, draw guide lines toward the center once or highlight stages on focus; avoid camera movement.
Preserve: Procedural clarity, extreme depth convergence, tiny focal interface, and editable code-rendered geometry.
Avoid: Generated UI, animated funnels, generic growth charts, celebratory gradients, or excessive conversion banners.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 38 — X Ad Formats

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Format catalog / structured comparison
- After: Format catalog / device wireframes

### Description

**Before:** A catalog of advertising formats uses a strong typographic introduction and repeatable content modules to make a broad product taxonomy quickly comparable.

**After:** A large catalog statement sits above three outlined device formats inside an orbital construction frame, with taxonomy copy and the next section beginning directly below.

### Tags

- Before: `format catalog`, `comparison modules`, `taxonomy labels`, `black-and-white`, `product examples`, `structured grid`
- After: `format-catalog headline`, `outlined device trio`, `orbital construction frame`, `left documentation rail`, `monochrome product taxonomy`, `compact create-ad CTA`
- Added: `format-catalog headline`, `outlined device trio`, `orbital construction frame`, `left documentation rail`, `monochrome product taxonomy`, `compact create-ad CTA`
- Removed: `format catalog`, `comparison modules`, `taxonomy labels`, `black-and-white`, `product examples`, `structured grid`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "X Ad Formats". Lead with a broad format-catalog statement and arrange repeatable product-format modules in a strict comparison grid below. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, black, soft grey, and colors limited to genuine example media. Surface treatment: flat catalog surfaces, clean labels, and consistent dividing rules. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the repeatable taxonomy, strong labels, and comparable module proportions; avoid masonry galleries, decorative motion, inconsistent card sizes, excessive promotional copy. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The three devices and orbital frame are product taxonomy diagrams that require precise proportions and editable labels. Build them as SVG/HTML and use genuine example media in later sections.
```

### Structured AI design brief

**Before:**

```text
Composition: Lead with a broad format-catalog statement and arrange repeatable product-format modules in a strict comparison grid below.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, black, soft grey, and colors limited to genuine example media
Texture: flat catalog surfaces, clean labels, and consistent dividing rules
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: keep comparisons stable and reveal modules predictably during document scrolling
Preserve: the repeatable taxonomy, strong labels, and comparable module proportions
Avoid: masonry galleries, decorative motion, inconsistent card sizes, excessive promotional copy
```

**After:**

```text
Composition: Keep the left guide rail; place the catalog headline above a wide orbital frame containing three outlined device formats, then center explanation and action below.
Typography: Large clean grotesk headline; compact neutral sans-serif for navigation, captions, actions, and format descriptions.
Palette: White, ink black, soft grey, and colors limited to genuine example media below the fold.
Texture: Thin device outlines, elliptical construction rules, flat placeholder surfaces, and consistent dividing lines.
Hierarchy: Catalog proposition first, comparable device trio second, explanation and action third, format modules fourth.
Spacing: Use equal spacing between devices, broad white margins inside the orbit, and consistent module proportions below.
Motion: Keep comparisons stable; use predictable section entry and focused media playback only where it demonstrates a format.
Preserve: Repeatable taxonomy, comparable device proportions, precise linework, and persistent navigation.
Avoid: Generated device UI, masonry galleries, decorative motion, inconsistent card sizes, or excessive promotional copy.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 39 — Schemas of Uncertainty

**Source/quality:** Unchanged — canonical live browser capture; 1264 × 720.

### Descriptor

- Before: Research essay / ASCII terrain
- After: Research index / generative ASCII field

### Description

**Before:** An essay index floats over an uninterrupted horizontal field of dense ASCII marks, making uncertainty itself feel like a navigable information landscape.

**After:** A newspaper-like research index compresses essays into narrow text columns while a continuously rebalanced ASCII field turns the lower canvas into a living typographic terrain.

### Tags

- Before: `ASCII field`, `research essay`, `horizontal canvas`, `micro text`, `white space`
- After: `multi-column essay index`, `ASCII glyph field`, `tiny serif headlines`, `dense text texture`, `black-on-white canvas`, `automatic generative motion`
- Added: `multi-column essay index`, `ASCII glyph field`, `tiny serif headlines`, `dense text texture`, `black-on-white canvas`, `automatic generative motion`
- Removed: `ASCII field`, `research essay`, `horizontal canvas`, `micro text`, `white space`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Schemas of Uncertainty". Stretch a dense ASCII research field far beyond the viewport and overlay a restrained article index and title along the top. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: paper white, ink black, and rare soft grey. Surface treatment: continuous monospace marks, typographic noise, and thin editorial rules. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the contrast between extreme information density and calm margins; avoid conventional cards, colorful charts, forced vertical scrolling. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The defining field is live typographic computation, not a static illustration. Build it with canvas, WebGL, or DOM text so glyph density, rebalancing, and accessibility can be controlled; keep real article titles as HTML.
```

### Structured AI design brief

**Before:**

```text
Composition: Stretch a dense ASCII research field far beyond the viewport and overlay a restrained article index and title along the top.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: paper white, ink black, and rare soft grey
Texture: continuous monospace marks, typographic noise, and thin editorial rules
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: continuously assemble and redistribute the typographic field beneath a stable editorial index, using an open-ended loop with no artificial finish
Preserve: the contrast between extreme information density and calm margins
Avoid: conventional cards, colorful charts, forced vertical scrolling
```

**After:**

```text
Composition: Run a thin editorial navigation across the top; arrange essay cards in narrow columns above a full-width generative ASCII field that rises from the bottom.
Typography: Small high-contrast serif article titles and metadata paired with dense monospaced glyphs in the generative field.
Palette: Warm white, ink black, and faint neutral grey.
Texture: Dense body text, ASCII marks, irregular glyph clusters, narrow columns, and an otherwise flat paper surface.
Hierarchy: Publication identity and article titles establish reading structure; the shifting glyph field becomes the dominant visual event without obscuring navigation.
Spacing: Use tight horizontal article columns, very small gutters, a shallow top rail, and a large continuous field below.
Motion: Continuously grow and rebalance the ASCII terrain beneath a fixed editorial shell; use a short representative loop because the process has no natural endpoint.
Preserve: Real typographic density, calm white wrapper, fixed index, and indefinite code-driven field behavior.
Avoid: Rasterized fake text, colorful data charts, standard dashboard cards, forced scroll choreography, or motion in the navigation.
```

### Motion behavior

**Before:** The automatic canvas continuously grows and rebalances dense ASCII-like marks beneath a fixed essay index; because the behavior is indefinite, the preview uses a representative seven-second excerpt.

**After:** Trigger: automatic. ASCII-like glyph clusters continuously grow, thin, and rebalance across the lower field while the essay index and navigation remain fixed. The behavior is indefinite; the library uses a representative seven-second excerpt and loops it.

---

## 40 — Apple Promotional Hero

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Campaign baseline / product-led clarity
- After: Retail campaign / cutout product collage

### Description

**Before:** A current Apple campaign demonstrates the durable product-marketing baseline: minimal navigation, centered seasonal copy, and a large, immaculate visual stage.

**After:** A centered back-to-school offer sits above three student cutouts holding boxes of devices and personal objects, using an immaculate white retail stage and one blue action.

### Tags

- Before: `campaign hero`, `centered copy`, `product stage`, `minimal nav`, `white canvas`
- After: `centered campaign headline`, `student cutout trio`, `layered product collage`, `white retail stage`, `single blue CTA`, `thin global navigation`
- Added: `centered campaign headline`, `student cutout trio`, `layered product collage`, `white retail stage`, `single blue CTA`, `thin global navigation`
- Removed: `campaign hero`, `centered copy`, `product stage`, `minimal nav`, `white canvas`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Apple Promotional Hero". Center one short campaign promise above a pristine product or people-led stage, with navigation reduced to a thin top band. Use quiet display typography with compact, nearly invisible navigation. Palette: white, black, and a small set of product-led accent colors. Surface treatment: immaculate photography or high-fidelity rendering with no decorative surface. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the clarity, scale, and disciplined conversion hierarchy; avoid copying Apple products or trademarks, excessive feature lists, ornamental UI. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: three diverse college-age students presented as clean editorial cutouts, each holding an open box filled with generic study objects, plants, art supplies, and unbranded device-shaped props] bright commercial collage with crisp white sticker-like outlines and soft contact shadows. Arrange the trio across the lower half and reserve the upper center for HTML campaign copy and action. White, black, natural skin and clothing color, with restrained object accents. No logos, recognizable products, text, or copied campaign imagery. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Center one short campaign promise above a pristine product or people-led stage, with navigation reduced to a thin top band.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: white, black, and a small set of product-led accent colors
Texture: immaculate photography or high-fidelity rendering with no decorative surface
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: use polished product reveals and restrained scroll choreography
Preserve: the clarity, scale, and disciplined conversion hierarchy
Avoid: copying Apple products or trademarks, excessive feature lists, ornamental UI
```

**After:**

```text
Composition: Center a short campaign headline, supporting offer, and one blue action above a three-person cutout collage; keep global navigation in a thin top band.
Typography: Large heavy geometric sans-serif headline; medium sans-serif offer copy; compact system navigation and rounded action label.
Palette: White, black, one bright blue action, natural portrait color, and restrained object accents.
Texture: Clean commercial cutout photography, crisp white sticker borders, product surfaces, and a seamless retail background.
Hierarchy: Campaign headline first, student-and-object collage second, offer details third, blue action fourth, navigation last.
Spacing: Center everything on one vertical axis, maintain large white margins above, and let the collage span the lower width without enclosing cards.
Motion: If adapted, reveal cutout groups with restrained depth or stagger; keep offer copy and global navigation stable.
Preserve: White retail clarity, human/product collage, one blue action, centered campaign structure, and strong cutout silhouettes.
Avoid: Copying Apple products or trademarks, generic empty product pedestals, device-only staging, dark luxury treatment, or excessive motion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 41 — CLOU Architects

**Source/quality:** Unchanged — canonical live browser capture; 1264 × 720.

### Descriptor

- Before: Studio manifesto / rotating declaration
- After: Studio entrance / rotating declaration

### Description

**Before:** A nearly empty architectural stage turns the phrase “We are…” into a sequence of changing declarations, letting typography carry the portfolio entrance.

**After:** An almost empty warm-white canvas centers one black typographic declaration, using a rotating profession word and tiny edge marks instead of imagery or conventional portfolio navigation.

### Tags

- Before: `rotating statement`, `architectural studio`, `white field`, `black label`, `minimal entrance`
- After: `centered black type strip`, `rotating profession word`, `warm-white negative space`, `minimal edge marks`, `loading indicator`, `type-only entrance`
- Added: `centered black type strip`, `rotating profession word`, `warm-white negative space`, `minimal edge marks`, `loading indicator`, `type-only entrance`
- Removed: `rotating statement`, `architectural studio`, `white field`, `black label`, `minimal entrance`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "CLOU Architects". Leave almost the entire viewport empty and center a black label containing one rotating “We are…” declaration. Use stark serif or grotesk display type with small monospace controls. Palette: white and black only. Surface treatment: perfectly flat surfaces with tiny architectural navigation. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the radical emptiness and identity-through-sequence idea; avoid portfolio thumbnails in the opening frame, background video, ornamental motion. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The reference is a type-only interface. Render the declaration as accessible HTML and animate only the changing profession word; no generated image asset is needed.
```

### Structured AI design brief

**Before:**

```text
Composition: Leave almost the entire viewport empty and center a black label containing one rotating “We are…” declaration.
Typography: stark serif or grotesk display type with small monospace controls
Palette: white and black only
Texture: perfectly flat surfaces with tiny architectural navigation
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: replace the final word on a measured cadence with clean cuts or masks
Preserve: the radical emptiness and identity-through-sequence idea
Avoid: portfolio thumbnails in the opening frame, background video, ornamental motion
```

**After:**

```text
Composition: Center one black-backed declaration in a vast warm-white field; keep the studio mark, language or utility controls, and loader tiny at the edges.
Typography: Large clean grotesk in white inside a black rectangular strip; micro sans-serif for edge utilities and loading state.
Palette: Warm white and pure black.
Texture: Flat untextured page surface with one hard-edged text rectangle.
Hierarchy: Rotating declaration is the only focal event; studio mark and edge controls remain peripheral.
Spacing: Use extreme negative space, exact visual centering, and no supporting modules above the fold.
Motion: Replace only the profession word through a clean masked type transition; keep the sentence block and page shell fixed.
Preserve: Type-only confidence, centered black strip, warm-white field, and one controlled changing word.
Avoid: Generated imagery, decorative backgrounds, large navigation, multiple animated lines, gradients, or soft cards.
```

### Motion behavior

**Before:** The identity is expressed through a timed sequence of professions and positions rather than a static claim.

**After:** Still reference; no captured motion evidence.

---

## 42 — System — Patch

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Case study / disciplined brand panels
- After: Brand case study / modular identity panels

### Description

**Before:** A brand case study opens with a black identity block, a pale product-information column, and a generous tactile image—an exemplary portfolio composition.

**After:** A strict editorial case study introduces Patch with project facts, then moves through a modular identity system of black logo panels, circular construction, tactile product imagery, vivid color, and campaign applications.

### Tags

- Before: `case study`, `panel grid`, `brand mark`, `tactile crop`, `editorial spacing`
- After: `modular case-study grid`, `black logo panel`, `circular identity system`, `tactile product photography`, `rainbow edge distortion`, `scroll narrative`
- Added: `modular case-study grid`, `black logo panel`, `circular identity system`, `tactile product photography`, `rainbow edge distortion`, `scroll narrative`
- Removed: `case study`, `panel grid`, `brand mark`, `tactile crop`, `editorial spacing`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "System — Patch". Divide the hero into three unequal vertical panels: identity mark, concise project context, and a tactile product photograph. Use an editorial serif paired with compact utilitarian mono labels. Palette: black, warm white, pale cream, and natural skin or product color. Surface treatment: matte brand panels beside detailed close-up photography. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the asymmetric panel logic and disciplined case-study context; avoid portfolio carousels, decorative device mockups, long copy above the fold. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The page is valuable because it documents a real identity system and real campaign artifacts. Use approved project assets or original design work; do not ask an image model to fabricate a case study or branded applications.
```

### Structured AI design brief

**Before:**

```text
Composition: Divide the hero into three unequal vertical panels: identity mark, concise project context, and a tactile product photograph.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: black, warm white, pale cream, and natural skin or product color
Texture: matte brand panels beside detailed close-up photography
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: let scroll reveal each brand-system layer in a legible sequence—identity, object, palette, interface, and campaign—while rounded panel masks and image crops change cleanly before a still endpoint
Preserve: the asymmetric panel logic and disciplined case-study context
Avoid: portfolio carousels, decorative device mockups, long copy above the fold
```

**After:**

```text
Composition: Open with project identity and facts in a thin editorial header; progress through large modular panels for mark, construction, color, product, mobile, and campaign applications.
Typography: Bold grotesk project and campaign statements; compact neutral sans-serif captions, credits, and process notes.
Palette: White and black foundation with high-chroma yellow, red, orange, cyan, blue, violet, and pink used in the identity system.
Texture: Flat logo geometry, tactile product photography, glossy objects, phone mockups, and controlled rainbow edge distortion.
Hierarchy: Identity mark first, construction logic second, tactile applications third, color system fourth, public campaign proof last.
Spacing: Use a repeatable full-width panel grid, small editorial captions, deliberate white gaps, and generous holds around major artifacts.
Motion: Scroll through project chapters at a readable pace; preserve each artifact long enough to resolve and settle at the campaign endpoint.
Preserve: Real case-study evidence, modular sequencing, disciplined captions, color expansion, and repeated scalloped-square geometry.
Avoid: Fabricated brand assets, generic mockups, compressed thumbnail grids, decorative parallax, or scrolling too fast to inspect applications.
```

### Motion behavior

**Before:** Smooth scrolling advances through asymmetric identity panels, tactile product photography, color systems, device applications, and final campaign placements, then settles at the case-study endpoint.

**After:** Trigger: captured scrolling. The case study advances from the Patch mark and construction system through color, tactile objects, mobile applications, portraits, and campaign placements. The editorial header remains stable within each frame; the sequence pauses on major artifacts and settles at the final outdoor work.

---

## 43 — Oqoqo Evals

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: AI product / evidence-first utility
- After: AI evaluation product / evidence-first UI

### Description

**Before:** A plainspoken evaluation product pairs a readable proposition with a real interface excerpt and small proof marks, emphasizing utility over spectacle.

**After:** A plainspoken evaluation proposition leads directly into a large real product surface, and the full page continues through experiment setup, agent comparisons, workflow anatomy, FAQs, and conversion proof.

### Tags

- Before: `AI product`, `evidence UI`, `plainspoken copy`, `white canvas`, `compact proof`, `scroll narrative`
- After: `plainspoken product headline`, `large eval interface`, `black-and-white UI`, `dense workflow evidence`, `agent comparison modules`, `scroll-driven product story`
- Added: `plainspoken product headline`, `large eval interface`, `black-and-white UI`, `dense workflow evidence`, `agent comparison modules`, `scroll-driven product story`
- Removed: `AI product`, `evidence UI`, `plainspoken copy`, `white canvas`, `compact proof`, `scroll narrative`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Oqoqo Evals". Set a concise product proposition on the left and place a cropped, believable evaluation interface beneath and to the right. Use precise grotesk headlines with dense monospace or ASCII microcopy. Palette: white, black, cool grey, and tiny status accents. Surface treatment: crisp product UI with minimal decorative treatment. Hierarchy: a readable headline anchors a field of subordinate information. Preserve the evidence-first message, honest product surface, and legible top-to-bottom proof sequence; avoid AI sparkle icons, nebulous gradients, fake chat bubbles, rushed scrolling that makes interface evidence unreadable. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
Credibility depends on the real evaluation interface, readable configuration, and genuine workflow states. Build or capture functional UI; do not generate a fake dashboard image.
```

### Structured AI design brief

**Before:**

```text
Composition: Set a concise product proposition on the left and place a cropped, believable evaluation interface beneath and to the right.
Typography: precise grotesk headlines with dense monospace or ASCII microcopy
Palette: white, black, cool grey, and tiny status accents
Texture: crisp product UI with minimal decorative treatment
Hierarchy: a readable headline anchors a field of subordinate information
Spacing: combine rigid grid alignment with intentionally dense data regions
Motion: scroll through the product argument in a measured sequence, allowing the experiment interface, comparison fields, use cases, workflow proof, FAQs, and footer to resolve before the next section arrives
Preserve: the evidence-first message, honest product surface, and legible top-to-bottom proof sequence
Avoid: AI sparkle icons, nebulous gradients, fake chat bubbles, rushed scrolling that makes interface evidence unreadable
```

**After:**

```text
Composition: Place a compact left-aligned proposition and actions above a large full-width product interface; continue with alternating evidence statements, UI demonstrations, comparisons, workflow anatomy, FAQ, and closing action.
Typography: Large restrained grotesk display; regular sans-serif body; compact product-interface sans and monospace where task or run data requires it.
Palette: Warm white, ink black, graphite, soft grey, and narrow status accents from the real interface.
Texture: Crisp product UI, fine dividers, dot matrices, flat evidence cards, and sparse pixel imagery.
Hierarchy: Product promise first, real experiment interface second, agent and workflow evidence third, FAQ and conversion action last.
Spacing: Use broad editorial margins around claims and dense, legible interface crops; separate chapters with large vertical intervals.
Motion: Scroll through complete product chapters with short holds on readable UI, then settle at the final conversion footer.
Preserve: Real interface fidelity, evidence-first narrative, restrained palette, readable configuration detail, and calm editorial pacing.
Avoid: Fake generated dashboards, decorative AI gradients, cropped dialogs, tiny illegible UI, or rapid scrolling that blurs evidence.
```

### Motion behavior

**Before:** A smooth top-to-bottom scroll moves from the evaluation proposition and live experiment interface through agent/model comparisons, use cases, agent-first product guidance, workflow anatomy, FAQs, and the final conversion footer; the optional analytics dialog is declined before frame one and the sequence settles at the bottom after about eighteen seconds.

**After:** Trigger: captured scrolling after dismissing the optional-analytics dialog before frame one. The sequence moves from experiment configuration through agent/model comparisons, workflow anatomy, product guidance, FAQs, and final conversion. Dense UI receives short holds; the roughly eighteen-second capture settles at the footer.

---

## 44 — Human Made Inc.

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Brand entrance / iconic restraint
- After: Brand entrance / emblematic restraint

### Description

**Before:** A heart-and-rays mark and compact wordmark float in a near-empty field, relying on a loader-to-logo reveal and exquisite spacing.

**After:** A large black heart-and-rays emblem and stacked condensed wordmark occupy the center of a near-empty warm-white page, with navigation reduced to compact edge controls.

### Tags

- Before: `iconic mark`, `centered identity`, `white space`, `black and white`, `micro navigation`
- After: `heart-and-rays emblem`, `stacked condensed wordmark`, `warm-white canvas`, `centered brand lockup`, `compact pill navigation`, `tiny corner accents`
- Added: `heart-and-rays emblem`, `stacked condensed wordmark`, `warm-white canvas`, `centered brand lockup`, `compact pill navigation`, `tiny corner accents`
- Removed: `iconic mark`, `centered identity`, `white space`, `black and white`, `micro navigation`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Human Made Inc.". Center a simple high-recognition symbol and compact wordmark in a broad white field with tiny navigation pinned to the edges. Use stark serif or grotesk display type with small monospace controls. Palette: white and ink black. Surface treatment: crisp vector identity with no decorative surface. Hierarchy: one high-contrast image or statement dominates a restrained interface. Preserve the confidence, empty field, and tiny edge controls; avoid adding descriptive copy, decorative backgrounds, looping logo tricks. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The focal asset is a specific brand mark and wordmark. Use approved vector identity files or create an original identity system; do not reconstruct the logo with an image generator.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a simple high-recognition symbol and compact wordmark in a broad white field with tiny navigation pinned to the edges.
Typography: stark serif or grotesk display type with small monospace controls
Palette: white and ink black
Texture: crisp vector identity with no decorative surface
Hierarchy: one high-contrast image or statement dominates a restrained interface
Spacing: keep the frame sparse, aligned, and deliberately severe
Motion: use a deliberate loader and one precise logo reveal, then become still
Preserve: the confidence, empty field, and tiny edge controls
Avoid: adding descriptive copy, decorative backgrounds, looping logo tricks
```

**After:**

```text
Composition: Center a large emblem and stacked wordmark in a nearly empty field; keep menu, section navigation, language controls, and small character accents at the edges.
Typography: Tall condensed display lettering for the wordmark; compact uppercase grotesk inside a small rounded navigation capsule.
Palette: Warm white, pure black, and tiny incidental color in corner character art.
Texture: Flat vector identity geometry and an otherwise untextured paper-like surface.
Hierarchy: Brand lockup first; compact navigation second; edge utilities and character accents last.
Spacing: Use extreme central breathing room, a shallow top control band, and tiny bottom-corner details.
Motion: If adapted, reveal an original emblem once through a short vector draw or scale; then hold the page still.
Preserve: Emblematic scale, central lockup, warm-white restraint, and minimal edge navigation.
Avoid: Copied identity, descriptive marketing paragraphs, decorative backgrounds, looping logo tricks, or large content modules.
```

### Motion behavior

**Before:** A long, controlled loading sequence resolves into a centered identity mark with tiny edge navigation.

**After:** Still reference; no captured motion evidence.

---

## 45 — More Nutrition Matcha

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 700.

### Descriptor

- Before: Packaging campaign / bold monochrome green
- After: Nutrition campaign / monochrome product world

### Description

**Before:** A matcha product pack and can are staged against a tightly controlled green field with huge cropped brand lettering and energetic nutrition notes.

**After:** A giant dark-green wordmark, tilted matcha packshot, and oversized benefit statement create a single-color campaign field supported by compact nutrition callouts.

### Tags

- Before: `matcha green`, `giant wordmark`, `packaging hero`, `nutrition callouts`, `handwritten notes`
- After: `giant green wordmark`, `tilted product packshot`, `monochrome matcha palette`, `oversized benefit headline`, `circular nutrition callouts`, `compact pill navigation`
- Added: `giant green wordmark`, `tilted product packshot`, `monochrome matcha palette`, `oversized benefit headline`, `circular nutrition callouts`, `compact pill navigation`
- Removed: `matcha green`, `giant wordmark`, `packaging hero`, `nutrition callouts`, `handwritten notes`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "More Nutrition Matcha". Place packaging in the lower center, crop a giant brand word across the top, and distribute short nutrition callouts around the product. Use an editorial serif paired with compact utilitarian mono labels. Palette: multiple matcha greens, cream, white, and near black. Surface treatment: matte packaging with marker-like handwritten accents. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the controlled single-color world and product-first scale; avoid smooth wellness gradients, ingredient photography, dense nutrition tables. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: loose marker-like matcha swashes, simple circular nutrition badges, and a clean pedestal arc] flat graphic support layer for a real cylindrical product packshot. Arrange the marks around an empty tilted product silhouette and keep the upper center open for an HTML wordmark. Pale matcha green, deep forest green, cream, and white only. Matte paper treatment; no text, logos, branded packaging, ingredient photography, gradients, or glossy 3D cards. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place packaging in the lower center, crop a giant brand word across the top, and distribute short nutrition callouts around the product.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: multiple matcha greens, cream, white, and near black
Texture: matte packaging with marker-like handwritten accents
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: slide product pieces and callouts into place with buoyant timing
Preserve: the controlled single-color world and product-first scale
Avoid: smooth wellness gradients, ingredient photography, dense nutrition tables
```

**After:**

```text
Composition: Stretch the wordmark across the upper field, tilt the real product packshot through the lower center, place the benefit statement on the right, and scatter compact nutrition callouts around it.
Typography: Huge custom rounded display wordmark; heavy condensed sans-serif benefit statement; small rounded sans-serif navigation and badges.
Palette: Pale matcha green, deep forest green, cream, and white.
Texture: Matte packaging, marker-like accents, circular badges, and flat monochrome campaign surfaces.
Hierarchy: Wordmark first, packshot second, benefit statement third, quantitative callouts fourth, navigation last.
Spacing: Let the wordmark crop confidently, protect the product silhouette, and keep badges separated around the lower field.
Motion: If adapted, introduce callouts and background marks around a stable real packshot; do not deform packaging or wordmark.
Preserve: Real packaging fidelity, dominant green world, extreme wordmark scale, clear benefit claim, and sparse quantitative proof.
Avoid: Generated branded packaging, smooth wellness gradients, dense nutrition tables, ingredient photography, or multicolor badges.
```

### Motion behavior

**Before:** Packaging and nutrition marks animate into a tightly staged campaign frame after the loader.

**After:** Still reference; no captured motion evidence.

---

## 46 — Aside Browser

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Product world / cloud-soft interface
- After: Browser product hero / cloud-soft interface

### Description

**Before:** A browser interface floats in a blue-sky environment beneath an ambitious centered proposition, combining familiar UI with an optimistic illustrated atmosphere.

**After:** A concise browser proposition floats in open blue sky above a large realistic browser window, combining atmospheric optimism with an immediately legible product surface.

### Tags

- Before: `sky world`, `browser mockup`, `centered headline`, `soft clouds`, `product demo`
- After: `blue-sky background`, `centered browser proposition`, `large browser mockup`, `soft cloud framing`, `black rounded CTA`, `product UI crop`
- Added: `blue-sky background`, `centered browser proposition`, `large browser mockup`, `soft cloud framing`, `black rounded CTA`, `product UI crop`
- Removed: `sky world`, `browser mockup`, `centered headline`, `soft clouds`, `product demo`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Aside Browser". Center a large proposition in open sky and float a detailed browser interface across the lower half with clouds framing its edges. Use friendly characterful display type paired with plain, legible interface copy. Palette: sky blue, cloud white, soft grey, and small product-status colors. Surface treatment: soft atmospheric gradients around crisp product UI. Hierarchy: illustration establishes the world, then a concise action completes the story. Preserve the optimistic scale and readable browser surface; avoid unreadably tiny UI, excessive glass blur, generic AI sparkle effects. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: an open blue sky with broad soft clouds gathering near the lower and side edges] luminous atmospheric background with gentle natural gradients and subtle cloud depth. Keep the upper center calm for HTML headline and the lower middle clear for a real browser-interface layer added in code. Sky blue, cloud white, and soft grey. Bright diffuse daylight; no text, logos, browser UI, devices, icons, or fantasy objects. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a large proposition in open sky and float a detailed browser interface across the lower half with clouds framing its edges.
Typography: friendly characterful display type paired with plain, legible interface copy
Palette: sky blue, cloud white, soft grey, and small product-status colors
Texture: soft atmospheric gradients around crisp product UI
Hierarchy: illustration establishes the world, then a concise action completes the story
Spacing: use open scenic space with clearly grouped controls and soft visual rhythm
Motion: use slow cloud parallax and purposeful in-interface demonstrations
Preserve: the optimistic scale and readable browser surface
Avoid: unreadably tiny UI, excessive glass blur, generic AI sparkle effects
```

**After:**

```text
Composition: Center the product proposition and one action in open sky; crop a large realistic browser window across the lower half and frame it with clouds.
Typography: Large clean grotesk headline with tight centered leading; compact neutral sans-serif navigation, proof badge, and action.
Palette: Sky blue, cloud white, soft grey, ink black, and small genuine UI status colors.
Texture: Soft atmospheric gradients and clouds surrounding crisp application chrome and flat interface detail.
Hierarchy: Product proposition first, browser surface second, primary action third, proof badge and navigation last.
Spacing: Use broad sky around the headline, keep the browser large and readable, and avoid cloud detail directly behind text.
Motion: If adapted, use slow cloud parallax and purposeful in-browser demonstrations while the page headline stays fixed.
Preserve: Optimistic sky scale, believable browser UI, centered clarity, and clear separation between atmosphere and function.
Avoid: Generated fake UI, excessive glass blur, crowded controls, decorative AI sparkles, or clouds obscuring interface edges.
```

### Motion behavior

**Before:** Cloud and interface layers move at different depths while product states demonstrate the browser concept.

**After:** Still reference; no captured motion evidence.

---

## 47 — Made with Jitter

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Motion showcase / editorial index
- After: Motion gallery / editorial wrapper

### Description

**Before:** A restrained motion-gallery introduction uses a large editorial statement and a carefully framed featured animation strip rather than a conventional template grid.

**After:** A centered editorial statement and compact submission path introduce a curated animation gallery, while the featured strip begins below without competing with the calm white page shell.

### Tags

- Before: `motion gallery`, `editorial intro`, `featured strip`, `white canvas`, `micro filters`
- After: `centered editorial statement`, `motion-gallery index`, `white page shell`, `featured media strip`, `compact submit control`, `restrained navigation`
- Added: `centered editorial statement`, `motion-gallery index`, `white page shell`, `featured media strip`, `compact submit control`, `restrained navigation`
- Removed: `motion gallery`, `editorial intro`, `featured strip`, `white canvas`, `micro filters`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Made with Jitter". Open with a centered editorial statement and place a wide featured-animation strip below a compact category filter. Use an editorial serif paired with compact utilitarian mono labels. Palette: white, black, and colors supplied by the featured work only. Surface treatment: clean editorial canvas surrounding rich motion thumbnails. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the calm editorial wrapper and work-led color; avoid autoplay everywhere, equal-weight thumbnail walls, decorative background motion. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The colorful media belongs to the featured motion work, not a generated hero background. Use authorized animations or original portfolio clips and keep the surrounding editorial interface in code.
```

### Structured AI design brief

**Before:**

```text
Composition: Open with a centered editorial statement and place a wide featured-animation strip below a compact category filter.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: white, black, and colors supplied by the featured work only
Texture: clean editorial canvas surrounding rich motion thumbnails
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: allow curated loops inside bounded media while keeping the page shell still
Preserve: the calm editorial wrapper and work-led color
Avoid: autoplay everywhere, equal-weight thumbnail walls, decorative background motion
```

**After:**

```text
Composition: Center a short gallery statement and compact submit path in a broad white field; begin one wide featured-media strip along the lower edge.
Typography: Large light-weight grotesk statement; small neutral sans-serif navigation, supporting copy, input, and action labels.
Palette: White and black page shell; color appears only inside genuine featured motion work.
Texture: Flat editorial canvas, crisp media boundaries, and rich texture contained within authorized animation thumbnails.
Hierarchy: Gallery statement first, featured work second, submission path third, navigation last.
Spacing: Use generous centered margins above, a narrow text column, and one wide media band with no decorative background elements.
Motion: Confine autoplay or hover playback to media boundaries; keep the editorial wrapper, copy, and controls calm.
Preserve: Work-led color, quiet wrapper, clear featured hierarchy, and separation between gallery UI and animation content.
Avoid: Generated portfolio work, full-page autoplay, equal-weight thumbnail walls, animated page decoration, or media without attribution.
```

### Motion behavior

**Before:** Featured work plays in curated loops while the surrounding gallery interface remains typographically calm.

**After:** Still reference; no captured motion evidence.

---

## 48 — Pen.dev

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Design tool / typographic utility
- After: Design tool hero / typographic utility

### Description

**Before:** A centered proposition—“Dream on canvas. Land in code.”—is surrounded by faint perspective lines and compact download controls.

**After:** A two-line promise—dream in a canvas, land in code—sits over a nearly invisible perspective grid, with two compact actions and almost no decorative imagery.

### Tags

- Before: `centered proposition`, `perspective grid`, `design tool`, `mono controls`, `white canvas`
- After: `two-line grotesk headline`, `faint perspective grid`, `centered utility hero`, `black download CTA`, `white canvas`, `minimal top navigation`
- Added: `two-line grotesk headline`, `faint perspective grid`, `centered utility hero`, `black download CTA`, `minimal top navigation`
- Removed: `centered proposition`, `perspective grid`, `design tool`, `mono controls`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Pen.dev". Center a two-line design-tool promise and two compact actions over a nearly invisible perspective construction grid. Use an editorial serif paired with compact utilitarian mono labels. Palette: white, ink black, and faint cool grey. Surface treatment: fine drafting lines and minimal interface rules. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the memorable two-part promise and understated technical field; avoid canvas screenshots above the fold, neon gradients, verbose feature copy. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The hero is code-native typography over a faint construction grid. Render the headline and controls in HTML and draw the perspective lines with CSS, SVG, or canvas; no generated image is necessary.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a two-line design-tool promise and two compact actions over a nearly invisible perspective construction grid.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: white, ink black, and faint cool grey
Texture: fine drafting lines and minimal interface rules
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: let construction lines shift subtly with pointer movement; keep text fixed
Preserve: the memorable two-part promise and understated technical field
Avoid: canvas screenshots above the fold, neon gradients, verbose feature copy
```

**After:**

```text
Composition: Center the two-line proposition and paired actions over a full-width faint perspective grid; keep navigation thin and the rest of the hero empty.
Typography: Very large heavy grotesk headline with tight centered leading; small neutral sans-serif body, navigation, and rounded action labels.
Palette: White, ink black, and very faint cool grey.
Texture: Fine perspective construction lines and flat interface rules on a clean white surface.
Hierarchy: Two-line proposition first, supporting sentence second, primary download action third, secondary community action fourth.
Spacing: Use extreme white space, one centered vertical axis, a compact action row, and a grid that never reduces text contrast.
Motion: If adapted, shift grid lines subtly with pointer movement while headline and actions remain completely stable.
Preserve: Memorable two-part promise, nearly invisible technical field, centered clarity, and restrained actions.
Avoid: Generated imagery, neon gradients, visible product screenshots above the fold, heavy shadows, or animated headline distortion.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---

## 49 — Coda Commerce

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Merchant platform / bold print campaign
- After: Commerce campaign / bold print system

### Description

**Before:** A merchant-of-record campaign uses oversized stamped lettering, tiny orbit-like symbols, and a huge dark green arc to create a confident print-led first frame.

**After:** A stamped three-part commerce promise sits above a monumental dark-green arc, then expands through cream statistics, black campaign chapters, product offers, partner proof, and a dark footer.

### Tags

- Before: `stamped wordmark`, `dark green arc`, `cream paper`, `merchant platform`, `campaign headline`
- After: `stamped display headline`, `monumental green arc`, `cream black green palette`, `registration-mark details`, `chaptered scroll story`, `commerce proof modules`
- Added: `stamped display headline`, `monumental green arc`, `cream black green palette`, `registration-mark details`, `chaptered scroll story`, `commerce proof modules`
- Removed: `stamped wordmark`, `dark green arc`, `cream paper`, `merchant platform`, `campaign headline`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Coda Commerce". Center a stamped multi-word promise above a huge dark geometric arc and keep conversion actions small at the lower corners. Use an editorial serif paired with compact utilitarian mono labels. Palette: warm cream, deep forest green, black, and pale yellow. Surface treatment: screen-printed lettering, tiny registration symbols, and flat paper color. Hierarchy: a publication-like headline leads, followed by strict technical metadata. Preserve the print confidence and giant lower arc; avoid payment-dashboard screenshots, glossy fintech gradients, oversized CTA pills. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The hero is primarily code-rendered typography, registration marks, and one geometric arc. Build these as HTML/CSS or SVG so copy remains exact, responsive, and accessible; use real partner and product media in later chapters.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a stamped multi-word promise above a huge dark geometric arc and keep conversion actions small at the lower corners.
Typography: an editorial serif paired with compact utilitarian mono labels
Palette: warm cream, deep forest green, black, and pale yellow
Texture: screen-printed lettering, tiny registration symbols, and flat paper color
Hierarchy: a publication-like headline leads, followed by strict technical metadata
Spacing: use a measured column grid with visible rules and generous headline breathing room
Motion: use scroll to stage bold transitions between cream statistics, black statements, content proof, and partner sections, ending in a stable dark footer
Preserve: the print confidence and giant lower arc
Avoid: payment-dashboard screenshots, glossy fintech gradients, oversized CTA pills
```

**After:**

```text
Composition: Center the stamped three-part proposition above a huge dark-green arc; continue through alternating full-width statistic, campaign, product, partner, and footer chapters.
Typography: Oversized heavy grotesk display with stamped registration symbols; compact sans-serif navigation, labels, figures, and actions.
Palette: Warm cream, deep forest green, pure black, pale yellow, and narrow product accents.
Texture: Screen-printed lettering, flat paper color, registration marks, large geometric fields, and crisp product modules.
Hierarchy: Campaign promise first, green arc second, scale statistics and business paths third, partner proof fourth, closing action last.
Spacing: Use broad centered hero margins, oversized chapter fields, sparse labels, and deliberate holds between tonal transitions.
Motion: Scroll through cream, green, and black chapters at a legible pace; hold on scale figures and product paths, then settle at the footer.
Preserve: Print confidence, giant arc, stamped type, strong tonal chapter changes, and evidence progression.
Avoid: Generated headline text, payment-dashboard clichés, glossy fintech gradients, oversized pill clutter, or rapid section skipping.
```

### Motion behavior

**Before:** A tuned top-to-bottom scroll moves from the cream hero through animated scale statistics, black campaign statements, proof modules, partner content, and the footer, then holds at the bottom.

**After:** Trigger: captured scrolling. The sequence moves from the cream hero and green arc through dark campaign statements, animated scale figures, product paths, partner proof, and the final dark footer. Major chapters receive short holds; the capture stops at the bottom rather than looping internally.

---

## 50 — Izanami

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Fashion philosophy / fog-bound landscape
- After: Fashion entrance / fog landscape

### Description

**Before:** A misty vertical landscape hides a small philosophical declaration, creating a meditative fashion entrance that rewards patience rather than immediate conversion.

**After:** A tiny reflective statement floats inside a full-bleed foggy forest landscape, with sparse coordinates and edge marks replacing conventional fashion navigation or product imagery.

### Tags

- Before: `fog landscape`, `fashion entrance`, `tiny declaration`, `muted grey`, `slow reveal`
- After: `fog-bound forest`, `tiny centered statement`, `full-bleed cinematic image`, `muted sage grey palette`, `coordinate microtype`, `extreme negative space`
- Added: `fog-bound forest`, `tiny centered statement`, `full-bleed cinematic image`, `muted sage grey palette`, `coordinate microtype`, `extreme negative space`
- Removed: `fog landscape`, `fashion entrance`, `tiny declaration`, `muted grey`, `slow reveal`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "Izanami". Fill the frame with a vertically layered fog landscape and place one tiny declaration near the center or lower third. Use quiet display typography with compact, nearly invisible navigation. Palette: mist grey, desaturated sage, charcoal, and pale stone. Surface treatment: soft film grain, fog layers, and barely visible terrain. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the mystery, tiny type scale, and refusal of conventional conversion; avoid large fashion headlines, visible product grids, dramatic fast transitions. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a distant conifer forest dissolving into thick layered fog] quiet cinematic landscape photograph with soft film grain, low contrast, and almost no visible horizon. Place the darkest trees along the lower third; keep the center and upper field misty and calm for tiny HTML copy. Desaturated sage, mist grey, charcoal, and pale stone. Flat overcast light; no people, buildings, text, logos, fashion products, dramatic sun rays, or saturated color. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Fill the frame with a vertically layered fog landscape and place one tiny declaration near the center or lower third.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: mist grey, desaturated sage, charcoal, and pale stone
Texture: soft film grain, fog layers, and barely visible terrain
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: use a patient loader followed by continuous slow fog drift
Preserve: the mystery, tiny type scale, and refusal of conventional conversion
Avoid: large fashion headlines, visible product grids, dramatic fast transitions
```

**After:**

```text
Composition: Fill the viewport with layered fog and distant trees; place one tiny reflective statement near center-left and keep metadata or coordinates at the edges.
Typography: Very small high-contrast serif statement paired with tiny monospaced coordinate and utility labels.
Palette: Mist grey, desaturated sage, charcoal, pale stone, and muted white.
Texture: Soft film grain, fog layers, barely visible tree silhouettes, and subtle analog haze.
Hierarchy: Atmosphere is primary; the tiny statement is a discovered secondary element; edge metadata is tertiary.
Spacing: Preserve uninterrupted mist fields, isolate the statement, and keep all interface marks shallow and peripheral.
Motion: If adapted, drift fog slowly across depth layers; avoid camera travel or changes to the tiny type position.
Preserve: Patience, tiny type scale, muted landscape, atmospheric uncertainty, and refusal of conventional conversion UI.
Avoid: Large fashion headlines, product grids, dramatic fast transitions, saturated color, or visible card containers.
```

### Motion behavior

**Before:** A long loader gives way to an ambient fog scene and restrained philosophical text.

**After:** Still reference; no captured motion evidence.

---

## 51 — CTGT Frontier Intelligence

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: AI infrastructure / mountain-scale proof
- After: AI governance hero / alpine scale

### Description

**Before:** A regulated-AI proposition sits over a dramatic mountain basin, using the landscape as a metaphor for frontier scale and disciplined navigation.

**After:** A large governance proposition overlays a dark alpine basin, using landscape scale, spare research copy, and one black action to position regulated AI as serious infrastructure.

### Tags

- Before: `mountain hero`, `AI governance`, `editorial headline`, `dark overlay`, `edge controls`
- After: `alpine basin photography`, `oversized governance headline`, `left-aligned research copy`, `dark lower gradient`, `single black CTA`, `minimal utility navigation`
- Added: `alpine basin photography`, `oversized governance headline`, `left-aligned research copy`, `dark lower gradient`, `single black CTA`, `minimal utility navigation`
- Removed: `mountain hero`, `AI governance`, `editorial headline`, `dark overlay`, `edge controls`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "CTGT Frontier Intelligence". Place a large AI-governance proposition on the left over a full-bleed mountain basin and anchor small controls to the frame edges. Use quiet display typography with compact, nearly invisible navigation. Palette: charcoal, alpine green, fog white, and muted stone. Surface treatment: cinematic landscape photography with a deep translucent overlay. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the frontier metaphor and serious regulated-domain tone; avoid robot imagery, abstract AI gradients, busy compliance diagrams in the hero. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a steep alpine basin with dark forested ridges, exposed rock, and low cloud] cinematic landscape photograph from a distant elevated viewpoint. Keep the mountain mass on the right and lower half; reserve the upper-left sky and slope for HTML headline and research copy. Deep forest green, graphite, fog white, and muted stone. Cool overcast light with a restrained dark lower veil; no text, logos, people, buildings, AI symbols, dashboard overlays, or fantasy peaks. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Place a large AI-governance proposition on the left over a full-bleed mountain basin and anchor small controls to the frame edges.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: charcoal, alpine green, fog white, and muted stone
Texture: cinematic landscape photography with a deep translucent overlay
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: use slow environmental film or parallax while interface controls remain fixed
Preserve: the frontier metaphor and serious regulated-domain tone
Avoid: robot imagery, abstract AI gradients, busy compliance diagrams in the hero
```

**After:**

```text
Composition: Fill the hero with an alpine basin; place the large governance proposition and compact research copy on the left and keep utility navigation along the top.
Typography: Very large restrained grotesk headline with mixed light and regular weight; small neutral sans-serif body, navigation, and action.
Palette: Deep forest green, graphite, fog white, muted stone, and black.
Texture: Cinematic mountain photography, low cloud, forest detail, and a dark lower readability veil.
Hierarchy: Governance proposition and mountain scale share the focal plane; research copy and one action follow; navigation remains quiet.
Spacing: Use broad left text margins, large uninterrupted landscape fields, and avoid placing copy over the sharpest ridge detail.
Motion: If adapted, use slow environmental footage or subtle depth parallax while copy and controls stay fixed.
Preserve: Serious regulated-domain tone, alpine frontier metaphor, restrained action hierarchy, and real photographic depth.
Avoid: Robots, abstract AI gradients, compliance dashboards in the hero, bright chart overlays, or rapid drone movement.
```

### Motion behavior

**Before:** The mountainous film and dark overlay create slow environmental depth behind stable product navigation.

**After:** Still reference; no captured motion evidence.

---

## 52 — CTGT Finance

**Source/quality:** Unchanged — canonical live browser capture; 1251 × 713.

### Descriptor

- Before: Industry narrative / governed ascent
- After: Finance narrative / ridge and control rail

### Description

**Before:** The finance industry page sharpens the same mountain world with a governance statement and three compact capability panels along the bottom edge.

**After:** A governance statement crosses a brighter mountain ridge while a dark three-part control rail anchors the bottom, combining cinematic scale with explicit financial-service navigation.

### Tags

- Before: `mountain ridge`, `governance headline`, `feature panels`, `dark green`, `industry page`
- After: `bright mountain ridge`, `oversized governance statement`, `dark bottom control rail`, `three capability controls`, `financial-services caption`, `full-bleed landscape`
- Added: `bright mountain ridge`, `oversized governance statement`, `dark bottom control rail`, `three capability controls`, `financial-services caption`, `full-bleed landscape`
- Removed: `mountain ridge`, `governance headline`, `feature panels`, `dark green`, `industry page`

### Image Recipe — Primary generated visual

**Before:**

```text
Create a 16:10 website hero concept titled "CTGT Finance". Overlay a concise governance statement on a sharp mountain ridge and dock three small capability panels across the lower edge. Use quiet display typography with compact, nearly invisible navigation. Palette: deep forest green, graphite, cloud white, and restrained grey. Surface treatment: cinematic terrain beneath precise translucent information panels. Hierarchy: a full-bleed scene carries the experience while copy remains secondary. Preserve the landscape continuity and integrated bottom capability rail; avoid separate floating cards, finance stock imagery, bright dashboard charts. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a sharp dolomite-style mountain ridge rising above a broad valley under broken cloud] high-detail cinematic landscape photograph with cool natural light and strong ridge silhouette. Keep the mountain centered-right; reserve the left sky and valley for HTML headline and leave a clean shallow band along the bottom for a code-built control rail. Forest green, slate grey, cloud white, and black. No text, logos, finance imagery, dashboard panels, people, or exaggerated fantasy terrain. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Overlay a concise governance statement on a sharp mountain ridge and dock three small capability panels across the lower edge.
Typography: quiet display typography with compact, nearly invisible navigation
Palette: deep forest green, graphite, cloud white, and restrained grey
Texture: cinematic terrain beneath precise translucent information panels
Hierarchy: a full-bleed scene carries the experience while copy remains secondary
Spacing: allow large uninterrupted fields and wide cinematic margins
Motion: keep a slow environmental film behind stable copy and measured panel transitions
Preserve: the landscape continuity and integrated bottom capability rail
Avoid: separate floating cards, finance stock imagery, bright dashboard charts
```

**After:**

```text
Composition: Use a full-bleed ridge landscape, place the large governance statement across the left and center, and dock three equal capability controls in a dark bottom rail.
Typography: Very large restrained grotesk with mixed weights; small uppercase or neutral sans-serif for finance caption, navigation, and control labels.
Palette: Forest green, slate grey, cloud white, pale blue-grey, and near-black.
Texture: Cinematic ridge photography, cloud depth, dark translucent lower controls, and thin interface rules.
Hierarchy: Governance statement first, ridge second, financial-services caption third, bottom capability controls fourth.
Spacing: Keep the landscape full-bleed, reserve a shallow equal-width bottom rail, and maintain clear sky around the headline.
Motion: If adapted, move the landscape very slowly behind fixed copy and measured bottom-control transitions.
Preserve: Landscape continuity, mixed-weight proposition, integrated bottom rail, financial seriousness, and strong ridge silhouette.
Avoid: Separate floating cards, trader stock imagery, bright market charts, glass-heavy controls, or fast background film.
```

### Motion behavior

**Before:** Slow landscape motion supports a fixed governance message while the bottom feature panels behave as a measured navigation layer.

**After:** Still reference; no captured motion evidence.

---

## 53 — Paper — Design, Share, Ship

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: Connected canvas / agent-ready design tool
- After: Connected design tool / paper systems grid

### Description

**Before:** A warm paper-textured product page combines a split display proposition with a large design-tool canvas, visible property inspector, code workflow, and agent handoff to show one connected production system.

**After:** A two-tone connected-canvas proposition leads into a large real design-tool surface, then unfolds through desktop workflow, code, live data, agents, and roadmap chapters on a warm gridded paper system.

### Tags

- Before: `gradient canvas`, `split display type`, `design-tool chrome`, `property inspector`, `visible grid`, `agent workflow`, `code handoff`
- After: `two-tone grotesk headline`, `warm paper texture`, `faint drafting grid`, `large design-tool UI`, `diagonal section geometry`, `scroll-driven workflow`
- Added: `two-tone grotesk headline`, `warm paper texture`, `faint drafting grid`, `large design-tool UI`, `diagonal section geometry`, `scroll-driven workflow`
- Removed: `gradient canvas`, `split display type`, `design-tool chrome`, `property inspector`, `visible grid`, `agent workflow`, `code handoff`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Paper — Design, Share, Ship". Set a large two-tone connected-canvas proposition in the upper left, crop a detailed design-tool interface across the lower field, and use a faint construction grid and diagonal paper geometry to connect the page sections. Use large modern grotesk display type with alternating black and muted grey lines, paired with compact neutral product-interface copy. Palette: warm ivory, ink black, soft graphite, pale blue selection accents, and a restrained paper-beige gradient. Surface treatment: subtle fibrous paper grain, fine drafting grids, crisp application chrome, and flat property panels. Hierarchy: the connected-canvas promise leads, the live product surface proves it, and repeated workflow sections extend the narrative. Preserve the paper surface, visible design-tool anatomy, connected workflow premise, and transition from broad headline to dense product proof; avoid floating glass cards, generic AI sparkles, glossy gradients, isolated mockups without workflow context. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a seamless warm-ivory fibrous paper surface with an extremely faint technical drafting grid and a few broad diagonal fold or cut shapes] flat high-resolution background texture for compositing real product UI. Keep contrast very low and the center mostly clear; use warm ivory, soft graphite at low opacity, and restrained pale beige. Even shadowless light. No text, logos, interface elements, screenshots, objects, gradients beyond subtle paper tone, or decorative AI symbols. 16:10 tile-safe composition.
```

### Structured AI design brief

**Before:**

```text
Composition: Set a large two-tone connected-canvas proposition in the upper left, crop a detailed design-tool interface across the lower field, and use a faint construction grid and diagonal paper geometry to connect the page sections.
Typography: large modern grotesk display type with alternating black and muted grey lines, paired with compact neutral product-interface copy
Palette: warm ivory, ink black, soft graphite, pale blue selection accents, and a restrained paper-beige gradient
Texture: subtle fibrous paper grain, fine drafting grids, crisp application chrome, and flat property panels
Hierarchy: the connected-canvas promise leads, the live product surface proves it, and repeated workflow sections extend the narrative
Spacing: use broad editorial margins around headings while keeping interface panels dense and precisely aligned
Motion: scroll through a continuous workflow narrative from design canvas to code, data, agents, and roadmap, using stable section holds and a settled footer endpoint
Preserve: the paper surface, visible design-tool anatomy, connected workflow premise, and transition from broad headline to dense product proof
Avoid: floating glass cards, generic AI sparkles, glossy gradients, isolated mockups without workflow context
```

**After:**

```text
Composition: Set the two-tone proposition in the upper left, crop a large real design-tool interface across the lower field, and continue through full-width workflow chapters connected by grids and diagonal paper geometry.
Typography: Large modern grotesk alternating black and muted grey; compact neutral interface sans-serif and monospace code where required.
Palette: Warm ivory, ink black, soft graphite, pale blue selection accents, and restrained paper beige.
Texture: Fibrous paper grain, faint drafting grids, diagonal folds, crisp application chrome, and flat property panels.
Hierarchy: Connected-canvas proposition first, real workspace proof second, code/data/agent chapters third, workflow summary and roadmap last.
Spacing: Use broad editorial margins around statements and dense, precisely aligned interface surfaces; hold major sections long enough to inspect.
Motion: Scroll through canvas, desktop, code, live data, agents, and roadmap with stable section holds and a settled footer endpoint.
Preserve: Real product anatomy, paper-system warmth, connected workflow logic, and transition from broad promise to dense evidence.
Avoid: Generated fake UI, floating glass cards, generic AI sparkles, isolated mockups without workflow context, or rushed scrolling.
```

### Motion behavior

**Before:** A smooth top-to-bottom scroll moves from the connected-canvas hero through desktop workflow, code round-tripping, real-data examples, agent handoff, and roadmap/footer states; the heavy original sequence is time-compressed to about sixteen seconds and settles at the bottom.

**After:** Trigger: captured scrolling. The sequence moves from the connected-canvas hero through desktop workflow, code round-tripping, live data, agent handoff, workflow summary, and roadmap/footer states. Dense UI receives readable holds; the roughly sixteen-second capture settles at the bottom.

---

## 54 — Cursor — Ambitious Software

**Source/quality:** Unchanged — canonical live browser capture; 1600 × 1000.

### Descriptor

- Before: AI coding platform / editorial product demo
- After: AI coding platform / editorial product evidence

### Description

**Before:** A warm off-white product narrative pairs a concise coding-agent proposition with large, believable desktop and terminal interfaces, letting dense software evidence carry an otherwise restrained editorial page.

**After:** A compact coding-agent proposition sits above layered editor, browser, and terminal surfaces, then expands through customer proof, multi-tool workflows, model choice, research, enterprise evidence, and a spare closing action.

### Tags

- Before: `warm ivory`, `agent workspace collage`, `oversized sans serif`, `product UI crop`, `black pill CTA`, `editorial grid`, `scroll narrative`
- After: `warm ivory editorial shell`, `layered editor and terminal UI`, `compact left proposition`, `real product evidence`, `muted landscape panels`, `scroll-driven software narrative`
- Added: `warm ivory editorial shell`, `layered editor and terminal UI`, `compact left proposition`, `real product evidence`, `muted landscape panels`, `scroll-driven software narrative`
- Removed: `warm ivory`, `agent workspace collage`, `oversized sans serif`, `product UI crop`, `black pill CTA`, `editorial grid`, `scroll narrative`

### Image Recipe — Supporting generated layer

**Before:**

```text
Create a 16:10 website hero concept titled "Cursor — Ambitious Software". Lead with a compact left-aligned proposition and two actions, then devote the broad lower field to overlapping desktop, browser, and terminal surfaces before alternating full-width proof sections down the page. Use large restrained grotesk display type paired with compact sans-serif interface copy and monospace code or terminal details. Palette: warm ivory, ink black, fog grey, muted landscape color, and narrow orange link accents. Surface treatment: crisp application chrome, code text, terminal grids, lightly tinted editorial panels, and occasional painted landscape backdrops. Hierarchy: the agent promise leads, realistic working interfaces provide proof, customer and research evidence deepen trust, and a spare closing action completes the sequence. Preserve the warm editorial restraint, believable product surfaces, layered desktop-and-terminal evidence, and alternating rhythm of statement and demonstration; avoid neon AI gradients, floating chatbot bubbles, decorative code rain, compressed dashboards, rapid scrolling that leaves interface text unresolved. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
[SUBJECT: a quiet abstract landscape painting with muted water, distant shore, and soft atmospheric haze] understated editorial backdrop for compositing real code-editor and terminal windows. Keep forms broad and low contrast, with calm open areas behind interface layers. Warm ivory, fog grey, muted sage, dusty blue, and restrained earth tones. Soft diffuse light; no text, logos, code, devices, UI, neon, or futuristic effects. 16:10.
```

### Structured AI design brief

**Before:**

```text
Composition: Lead with a compact left-aligned proposition and two actions, then devote the broad lower field to overlapping desktop, browser, and terminal surfaces before alternating full-width proof sections down the page.
Typography: large restrained grotesk display type paired with compact sans-serif interface copy and monospace code or terminal details
Palette: warm ivory, ink black, fog grey, muted landscape color, and narrow orange link accents
Texture: crisp application chrome, code text, terminal grids, lightly tinted editorial panels, and occasional painted landscape backdrops
Hierarchy: the agent promise leads, realistic working interfaces provide proof, customer and research evidence deepen trust, and a spare closing action completes the sequence
Spacing: use wide editorial margins around short statements while allowing product demonstrations to remain dense, large, and precisely aligned
Motion: scroll through distinct product chapters with eased movement and short holds so layered interface demonstrations, proof rows, model choices, research cards, and the final action remain readable
Preserve: the warm editorial restraint, believable product surfaces, layered desktop-and-terminal evidence, and alternating rhythm of statement and demonstration
Avoid: neon AI gradients, floating chatbot bubbles, decorative code rain, compressed dashboards, rapid scrolling that leaves interface text unresolved
```

**After:**

```text
Composition: Place a compact proposition and paired actions at upper left; layer large real editor, browser, and terminal surfaces below, then alternate editorial proof statements with full-width product demonstrations.
Typography: Large restrained grotesk display; compact neutral interface sans-serif; monospace code and terminal detail; narrow orange links for editorial emphasis.
Palette: Warm ivory, ink black, fog grey, muted landscape color, restrained syntax accents, and narrow orange links.
Texture: Crisp application chrome, code and terminal grids, lightly tinted editorial panels, and occasional quiet landscape backdrops.
Hierarchy: Coding-agent proposition first, believable working interfaces second, customer and workflow evidence third, research and enterprise proof fourth, closing action last.
Spacing: Use wide editorial margins around short statements and large, dense, precisely aligned product surfaces with readable chapter holds.
Motion: Scroll through editor, agent, multi-tool, model, research, and enterprise chapters with eased movement and short holds; settle at the final download action.
Preserve: Real product credibility, warm editorial restraint, layered desktop-and-terminal evidence, and alternating statement/demonstration rhythm.
Avoid: Generated fake code, neon AI gradients, floating chatbot bubbles, decorative code rain, compressed interfaces, or rapid scrolling.
```

### Motion behavior

**Before:** A smooth top-to-bottom scroll moves from the coding-agent hero and layered desktop/CLI demonstration through customer proof, autonomous-agent and multi-tool workflows, frontier model and enterprise modules, research highlights, and the final download footer; short section holds keep dense interface text legible before the roughly twenty-one-second sequence settles at the bottom.

**After:** Trigger: captured scrolling. The sequence moves from the coding-agent hero and layered editor/CLI evidence through customer proof, autonomous and multi-tool workflows, model choice, enterprise and research chapters, and the final download action. Short holds keep UI legible; the roughly twenty-one-second capture settles at the footer.

---

## 55 — Voidpixel — Everything Begins With One Pixel

**Source/quality:** Unchanged — canonical original upload; 2880 × 2202.

### Descriptor

- Before: Pixel systems / monochrome product utility
- After: Pixel product hero / monochrome dashboard

### Description

**Before:** A black-and-white product hero treats the pixel as both message and system: oversized bitmap lettering, a sparse dot field, hard-edged controls, and a dashboard preview turn a technical premise into a complete visual language.

**After:** A monumental bitmap proposition, sparse dot field, and hard-edged action sit above a large monochrome product dashboard, making the one-pixel premise visible at both brand and interface scale.

### Tags

- Before: `pixel display type`, `monochrome dashboard`, `dot-field texture`, `hard-edged CTA`, `black-and-white UI`, `modular utility`
- After: `bitmap display headline`, `sparse pixel field`, `monochrome dashboard`, `hard-edged black CTA`, `large product UI crop`, `one-pixel rules`
- Added: `bitmap display headline`, `sparse pixel field`, `hard-edged black CTA`, `large product UI crop`, `one-pixel rules`
- Removed: `pixel display type`, `dot-field texture`, `hard-edged CTA`, `black-and-white UI`, `modular utility`

### Image Recipe — Build in code or use approved real asset

**Before:**

```text
Create a 16:10 website hero concept titled "Voidpixel — Everything Begins With One Pixel". Center a monumental bitmap proposition in the upper field, anchor one compact black action beneath it, and reveal a wide monochrome dashboard mockup across the lower half over a sparse pixel field. Use oversized custom pixel display lettering paired with clean compact sans-serif interface copy. Palette: pure white, ink black, and a narrow range of cool greys. Surface treatment: single-pixel marks, ordered dot fields, bitmap letterforms, and crisp one-pixel interface rules. Hierarchy: the pixel headline dominates, one dark action follows, and the detailed dashboard supplies proof below. Preserve the literal pixel premise, uncompromising monochrome palette, and hard-edged product utility; avoid rounded SaaS cards, colorful gradients, soft shadows, generic futuristic neon effects. Use original placeholder copy and original imagery; do not reproduce logos or branded assets from the reference.
```

**After:**

```text
The defining assets are editable bitmap typography, a procedural pixel field, and a real product dashboard. Build the type and dots with CSS/canvas and the interface as functional UI; do not flatten them into generated imagery.
```

### Structured AI design brief

**Before:**

```text
Composition: Center a monumental bitmap proposition in the upper field, anchor one compact black action beneath it, and reveal a wide monochrome dashboard mockup across the lower half over a sparse pixel field.
Typography: oversized custom pixel display lettering paired with clean compact sans-serif interface copy
Palette: pure white, ink black, and a narrow range of cool greys
Texture: single-pixel marks, ordered dot fields, bitmap letterforms, and crisp one-pixel interface rules
Hierarchy: the pixel headline dominates, one dark action follows, and the detailed dashboard supplies proof below
Spacing: use large white margins around the proposition and a tightly organized utility grid inside the product preview
Motion: assemble the headline one pixel at a time, drift the dot field subtly, and reveal dashboard modules in a measured sequence
Preserve: the literal pixel premise, uncompromising monochrome palette, and hard-edged product utility
Avoid: rounded SaaS cards, colorful gradients, soft shadows, generic futuristic neon effects
```

**After:**

```text
Composition: Center a large bitmap proposition and compact action in the upper field; spread a sparse pixel texture behind a wide dashboard crop across the lower half.
Typography: Oversized custom bitmap display lettering paired with compact neutral sans-serif interface copy and labels.
Palette: Pure white, ink black, and a narrow range of cool greys.
Texture: Single-pixel marks, ordered dot fields, hard one-pixel rules, bitmap letterforms, and crisp dashboard surfaces.
Hierarchy: Pixel headline first, black action second, real dashboard third, sparse dot field as supporting texture.
Spacing: Use large white margins around the proposition and a tightly organized utility grid inside the product surface.
Motion: If adapted, assemble the bitmap headline once and drift the dot field minimally; keep dashboard layout and readable UI stable.
Preserve: Literal pixel premise, uncompromising monochrome, hard-edged utility, and transition from brand statement to product proof.
Avoid: Generated dashboard text, antialiased pixel art, rounded SaaS cards, colorful gradients, soft shadows, or cyberpunk neon.
```

### Motion behavior

**Before:** No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.

**After:** Still reference; no captured motion evidence.

---
