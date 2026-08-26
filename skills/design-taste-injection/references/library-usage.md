# Library Usage

## Access boundary

The project-installed `config/library.json` identifies the protected Website Inspiration Library and its read-only catalog command. Do not scrape the portal or modify library files during website work.

Selection may read the catalog, but visual generation receives only the selected-card payload and a staged still. Never serialize the full catalog, category profiles, siblings, rejected cards, or motion into a visual run.

## Eligible evidence

An automatic anchor must:

- Use the requested category as its primary category.
- List the requested page role in `anchorUses`.
- Have usable or canonical still evidence with positive dimensions.
- Have a valid image recipe or reviewed `kind:none` reason.

`limited` evidence is not eligible for automatic anchoring. `kind:none` remains eligible when its reason gives usable code-native or authorized-media direction.

## Selection and rotation

Score only anchor strength, source/still quality, and page-role reproducibility. Build a ten-point quality band and rotate through it with the user-level shuffle bag. Prior exposure changes which eligible card appears next; it never changes suitability.

Pins and exclusions are explicit user controls. Directions contain one anchor and no supports.

## Still resolver

Resolve media by stable card ID. Copy the canonical detail still into `.inspiration/evidence` under a checksum-based filename and record card ID, name, checksum, dimensions, quality tier, and inspection state. Stage a separate copy for isolation. Prompt paths are relative to the isolated workspace; never expose a hard-coded source-library path.

Motion is excluded from visual generation even when the card owns a clip. Motion remains available only to a separately approved clone/mechanical analysis route.

## Category profiles

Category profiles remain visible in the browse library and may help humans understand the collection. They are retrieval/UI material only. They do not enter anchor selection, sealed payloads, visual prompts, H0, or the frozen anchor system.

Tests check provenance: no profile object or namespace, no profile dependency in the payload builder, and no exact constitution sentences. Card-authored fields named `Composition` or `Avoid` remain valid.

## Identity metadata

Every card exports reviewed `sourceIdentity` metadata: names, aliases, domains, exact copy, distinctive claims, known mark asset IDs, and source-specific exclusions. Automatic scans use only these reviewed exact signals and hashes.

Runtime code does not infer identity through OCR, logo shapes, colors, or approximate resemblance. Human visual review may compare the result with the still and flag ambiguity without changing metadata or automatically deleting content.

## Maintenance boundary

If card intelligence, schema, fingerprints, or canonical media are invalid, stop and report a library-maintenance error. Do not invent replacement metadata inside a website project.
