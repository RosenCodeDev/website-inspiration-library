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
- Have a current fingerprinted identity inventory whose fingerprint still matches its source, provenance, URL, and canonical still. Its `reviewOrigin` states whether it is Codex-drafted or human-reviewed; neither status is a legal clearance.

`limited` evidence is not eligible for automatic anchoring. `kind:none` remains eligible when its reason and `permittedMethod` give usable reviewed code-native or authorized-media direction.

## Selection and rotation

Score only anchor strength, source/still quality, and page-role reproducibility. Build a ten-point quality band and rotate through it with the user-level shuffle bag. Prior exposure changes which eligible card appears next; it never changes suitability.

Pins and exclusions are explicit user controls. Directions contain one anchor and no supports.

`displayName` is the canonical user-facing card name. `title` remains descriptive internal metadata and a compatibility alias. `USE CUSTOM CARDS` is an explicit selection route, not an automatic recommendation. Resolve each supplied item by stable ID, exact display name, legacy exact title, source name, or canonical URL, preserve supplied order, deduplicate exact repeats, and do not cap the number of cards or require category diversity. A custom card may bypass automatic category, page-role, score-band, and limited-quality gates. It must still have readable still evidence and an executable image recipe or reviewed method. Available identity exclusions stay in the one-card payload; stale identity metadata adds a prominent warning and blocks advancement until identity QA passes.

## Still resolver

Resolve media by stable card ID. Copy the canonical detail still into `.inspiration/evidence` under a checksum-based filename and record card ID, name, checksum, dimensions, quality tier, and inspection state. Stage a separate copy for isolation. Prompt paths are relative to the isolated workspace; never expose a hard-coded source-library path.

Motion is excluded from visual generation even when the card owns a clip. Motion remains available only to a separately approved clone/mechanical analysis route.

## Category profiles

Category profiles remain visible in the browse library and may help humans understand the collection. They are retrieval/UI material only. They do not enter anchor selection, sealed payloads, visual prompts, H0, or the frozen anchor system.

Tests check provenance: no profile object or namespace, no profile dependency in the payload builder, and no exact constitution sentences. Card-authored fields named `Composition` or `Avoid` remain valid.

## Identity metadata

Every card separates deterministic `sourceIdentity.derived` metadata from the curated exclusions retained under the compatibility field `sourceIdentity.reviewed`. Names, aliases, domains, URLs, and still hashes are derived scanner inputs. Exact copy, claims, marks, characters, products, people, packaging, interface fragments, and source-specific exclusions may be Codex-drafted or human-reviewed; `reviewOrigin` is authoritative.

The inventory fingerprint covers the source identity, provenance, canonical URL, source evidence, and still checksum. A covered change makes the inventory stale. Automatic selection rejects stale or uncurated cards. Explicit custom selection may retain one with available exclusions, a prominent warning, and mandatory identity QA before generation; the manual prompt workbench remains context-shared and may also use it.

Runtime code does not infer identity through OCR, logo shapes, colors, or approximate resemblance. Exact automatic text blocking uses domains and distinctive multiword curated signals; ambiguous single-word names remain prompt exclusions and optional human-QA signals rather than automatic deletion rules. A person may compare the result with the still and flag ambiguity without changing metadata or automatically deleting content.

## Maintenance boundary

If card intelligence, schema, fingerprints, or canonical media are invalid, stop and report a library-maintenance error. Do not invent replacement metadata inside a website project.
