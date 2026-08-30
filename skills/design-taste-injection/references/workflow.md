# Workflow

Keep one continuous user-facing task and save every consequential decision. Resolve scripts from the project-installed skill root. Never edit `.inspiration/state.json` directly.

## 0. Intake and architecture

Inspect the project and collect Introduction, Intent, Audience, Materials, and Requirements. Use them to propose pages, sections, content ownership, functionality, and the primary journey. Save the approved architecture.

Intake is sealed away from steps 1–3. It cannot choose cards, alter their recipe, or influence the first-pass visual agent.

## 1. Select and review anchors as one parent batch

Before generating any direction, run `reference-selection.mjs preflight <page-use>`. It must report eligible exact-category anchors for every current catalog category. If coverage is incomplete, stop before consuming subscription usage and choose a fully covered page role or repair the catalog; never silently omit a category.

Let the selection service read the catalog internally, but pass it only the requested category, page role, optional seed, pins, and exclusions:

```json
{
  "category": "Print-Tech Paper",
  "pageUse": "marketing",
  "pinned": [],
  "excluded": []
}
```

Run `reference-selection.mjs propose-batch-and-save <project-root> <request.json>`. It creates one numbered slot per current category in catalog order. The selector:

- Requires exact primary category and anchor page-role eligibility.
- Rejects limited or missing still evidence and unusable recipes/reasons.
- Scores anchor strength 45%, source/still quality 35%, and page-role reproducibility 20%.
- Builds a band within ten points of the best eligible card.
- Uses the user-level seeded shuffle bag so every band member appears once before repeat.
- Produces one anchor and an empty `supporting` array.

Automatic rotation stays inside the ten-point band. An explicit `PIN THIS CARD` or `SWAP` may select a card outside that band only when it still passes every exact-category, page-role, evidence, identity, freshness, and recipe eligibility rule.

Project keywords, semantic fit, industry, audience, brand compatibility, constitutions, supporting-card logic, and project usage are not accepted selection inputs.

After selection, run `reference-review.mjs render <project-root>` and return its stdout as one complete Markdown response. Do not rewrite, split, or code-fence the output. Every slot must show its number, category, card name and stable ID, quality, direction, tradeoff, status, and actual staged still through absolute inline-image Markdown. A plain path, missing still, or non-inline fallback fails review.

Accept one reply containing any combination of `ACCEPT ALL`, `RNN ACCEPT`, `RNN SHOW ANOTHER CARD`, `RNN PIN THIS CARD`, `RNN DO NOT USE THIS CARD`, and `RNN SWAP <stable-id, exact title, or canonical URL>`. Apply valid operations in order and leave only ambiguous slots unchanged. A replacement returns to pending review. Pins and exclusions do not imply acceptance. The legacy `SHOW ANOTHER SET` spelling is accepted only as a compatibility alias.

`SHOW ANOTHER CARD` rotates to the next eligible automatic card for that slot's category; the user does not name the replacement. `SWAP` is a targeted replacement and requires an exactly resolvable card identifier. For an automatic slot, the replacement must still satisfy that slot's automatic exact-category rules. For a custom slot, a targeted swap may select any resolvable custom-eligible card.

`USE CUSTOM CARDS: <stable IDs, exact titles, or canonical URLs>` replaces the automatic batch in the supplied order and creates one slot per unique resolved card, with no artificial count cap. Never guess an ambiguous partial match. Explicit custom selection bypasses category, page-role, score-band, and limited-quality gates. It still hard-blocks unreadable or missing evidence and a missing executable recipe/method. Stale or uncurated identity metadata is allowed only with a prominent warning and a required identity-QA checkpoint before that direction advances.

The batch is coordinator state, not generation context. For every accepted slot, fetch and stage only that card, then create one unique child run and one new temporary workspace. Never reuse a child conversation, prompt file, workspace, or output directory. Parallel execution is allowed only across independently scoped one-card runs. Never pass `activeBatch`, sibling selections, batch feedback, catalog data, prior directions, intake, project paths, motion, or category profiles to any child.

## 2. Resolve and inspect the still

Resolve each selected stable card ID independently with `visual-contract.mjs`. Copy its canonical still into `.inspiration/evidence`, record its checksum and dimensions through `visual.evidence-recorded`, inspect it, then record `visual.evidence-inspected` with the matching checksum. A custom slot carrying `requiresIdentityQa` must also pass the identity-QA checkpoint before generation can advance.

Never provide motion clips or frames to the visual agent. Never provide the catalog, other cards, prior directions, intake, project paths, or category profiles.

## 3. Build the sealed brief

Build the payload from the selected card alone with `buildSealedPayload`. It contains card identity, descriptors, tags, card-authored observed brief, staged still, canonical image recipe or curated `kind:none` reason, neutral copy envelopes, placement, curated source-identity exclusions, viewport, and output contract.

Render the visual prompt in five blocks:

1. Aesthetic.
2. Reference.
3. Future hero.
4. Placement.
5. Output contract.

The card's `Composition:` and `Avoid:` guidance is allowed. The builder does not import or accept category profiles. A separate guard rejects exact category-constitution sentences and any constitution object/namespace without banning ordinary field names.

Create `.inspiration/leak-signals.json` from exact intake-derived names, phrases, domains, claims, brand color names, and hex values. It is a guardrail, not proof of isolation.

## 4. Generate through the Codex subscription

Use `isolation-runner.mjs run-subscription` once per direction by default. Every invocation creates a new temporary workspace containing only that direction's sealed payload, rendered prompt, strict output schema, and one selected still, then launches a new ephemeral read-only Codex CLI task authenticated with ChatGPT. The prompt travels through stdin and the still is the final `-i` argument. The child returns an allowlisted UTF-8 file manifest; it does not write the preview. The trusted coordinator enforces the 2 MiB limit, paths, uniqueness, text-only content, still checksum, identity and intake scans, and rendered H0 contract before materializing the preview.

Require active ChatGPT authentication and remove `OPENAI_API_KEY` from the child environment. Authentication is the billing-safety check; a successful H0 is the page capability check. Built-in image generation is checked only when first requested, so no usage is spent on a probe. Record each run by generation ID as `subscription-ephemeral` with `isolated:false` and `contextLimited:true`. It limits accidental context bleed but is not a filesystem-confidentiality or API-grade boundary. The workbench label is `CODEX SUBSCRIPTION — STRUCTURED, CONTEXT-LIMITED`.

The stateless tool-free `POST /v1/responses` path remains available only through `run-api`, an explicit opt-in with `OPENAI_API_KEY`. It preserves the sealed request validation, pinned release model, no-history request, strict structured output, and at most two sanitized retries. Never select it automatically or make it a normal project prerequisite.

If the subscription runner is unavailable or fails, offer current-thread `degraded` execution only behind the exact unselected warning “This generation can see project intake and is not isolated.” and a separate `RUN DEGRADED GENERATION` action. Record approver, timestamp, generation ID, and the `subscription-unavailable` or `subscription-failure` cause. Keep `DEGRADED — NOT ISOLATED` visible throughout review and never remember approval. Earlier `fresh-agent` and `payload-only` state remains `legacy-unverified`.

## 5. Generate and import H0

Every `D01…DNN` first pass contains exactly one page with a hero and opening module:

```json
{
  "previewScope": {
    "kind": "focused-category-preview",
    "pageCount": 1,
    "sections": ["hero", "opening-module"],
    "completeSite": false
  }
}
```

For image-led cards, H0 is the correct image hole, flat quiet stand-in, and type sized for the future image. It cannot use CSS/SVG/canvas scenery, fog, dithering, gradients, crop marks, or decorative geometry as the missing picture.

For `kind:none`, follow the reviewed reason: construct genuinely code-native visuals in code, or reserve neutral geometry for authorized media. Never invent a protected product, artwork, person, packaging, or interface.

Generated markup must contain one `data-inspiration-hero` and one `data-opening-module`. Image-led and authorized-media H0 also require an empty `data-future-image-slot` and a sibling `data-protected-copy-region`; code-native H0 requires `data-code-native-hero` and its reviewed method.

The child returns structured output and may not create `output-contract.json`. The coordinator materializes it in a temporary directory, validates containment and permitted files, scans intake and exact source identity, inspects computed styles and slot geometry, hides protected-copy siblings, measures the composed slot pixels, restores copy, and captures the final preview. Only the coordinator writes the observed output contract. It then atomically imports the result, appends the generation event, and records execution provenance for that generation ID. Show the source still beside the preview in the workbench.

Every successful generation event also regenerates `.inspiration/Design Review.html` from validated state. Use that friendly file for the top-rail consolidated comparison; it references each existing preview folder and never enters a sealed request.

These focused directions are direction shopping, not the final design gate.

## 6. Freeze the contract and plan three variants

After the user selects a `Dxx-H0` direction, write and fingerprint an anchor system sheet covering type, palette roles, spacing, layout grammar, surfaces, texture, image treatment, motion, components, never rules, and `tweakableDecisions`. The latter contains only approved alternatives or numeric ranges for meaningful controls. Record the sheet through `visual.anchor-contract-frozen`.

Only now use project context for real copy, information architecture, sections, routes, product data, functionality, accessibility, legal, and technical requirements. Copy may reflow within the frozen type system. It may not change the anchor subject, palette logic, typography, texture, spacing grammar, or image treatment.

Parent Codex in the website project owns every later stage. Do not call `isolation-runner.mjs`, a nested page-generation child, or the optional API benchmark for variants, build paths, heroes, or implementation.

Before editing, record one three-candidate batch plan. Assign A, B, and C different choices on at least three of hierarchy, body format, navigation, rhythm, density, and composition. All three share one batch-plan fingerprint and the frozen visual contract. Then render three separate complete responsive homepage candidates:

- `Dxx-Vyy-A`
- `Dxx-Vyy-B`
- `Dxx-Vyy-C`

Each preview uses `data-inspiration-preview="homepage-variant"`, contains no dense page, and keeps the future-image slot empty and flat for image-led cards. `TRY ANOTHER` creates a new three-variant batch without rerunning category directions. Select exactly one variant.

## 7. Choose and execute the build path

Offer only eligible paths:

- **Original (`O`)** is always available and may promote the selected variant directly.
- **Clone Remix (`R`)** requires `verified-clone-remix` plus a passed clone preflight. Read [clone-remix.md](clone-remix.md).
- **Inspired Rebuild (`I`)** requires `inspired-rebuild`.

The path is an implementation method, not a new direction. Clone Remix or Inspired Rebuild may create a separate shell, but it must preserve the selected variant decisions and frozen contract and receive approval before hero work. Render the approved shell with `data-inspiration-preview="build-path-shell"`, retain the future-media container, fingerprint the non-media layout at 1440, 768, and 390 pixels with `visual-contract.mjs fingerprint-layout`, and record it as H0.

## 8. Resolve the hero

Read [image-generation.md](image-generation.md). For image-led recipes, create exactly four H1-H4 alternatives in one batch. Every candidate is a copy of the approved shell, uses `data-inspiration-preview="hero-alternative"`, marks generated media with `data-generated-hero-media`, and retains the H0 layout fingerprint outside the media container. Present H0 and H1-H4 together.

For `kind:none`, do not call ImageGen. Preserve the reviewed code-native visual or owned-media requirement, render `data-inspiration-preview="hero-retained"`, and record `H0-retained`. `TRY ANOTHER` preserves the earlier hero batch and creates another four-image batch. Select exactly one hero state.

## 9. Tune and pass the full-page gate

Automatically insert the development-only tweak bar after hero selection. Expose only keys and ranges in the frozen `tweakableDecisions`; this may be substantial, but it is not a generic theme editor and cannot change the protected hero by default. Record `active`, apply the accepted values to source and record `applied`, then verify the production build contains no tweak-bar import, marker, global, route, or control and record `production-excluded`.

Build one representative dense content page after hero selection and tuning—not one per variant. The homepage and dense page are the actual design gate. Content pages use their correct functional structure and inherit the frozen system; they do not repeat the homepage hero or promotional pacing.

At every route, record a lightweight conformance check for typography, palette, spacing, surfaces, texture, image treatment, and component behavior. Fail unexplained visual additions. Record the full-page gate with `visual.design-gate-recorded` before building remaining pages.

## 10. Implement, polish, and finish

Build the remaining site inside the frozen system. Apply the Impeccable route as polish, not new taste selection. Verify responsive widths, keyboard flow, focus, contrast, reduced motion, loading, media fallback, content-page conformance, and production build. Record successful verification before completion.

The expected default operation shape is one direction generation per current category, three parent-generated homepage candidates, and one four-image hero batch, plus bounded retries. This is not a promise of elapsed time or subscription-credit consumption.
