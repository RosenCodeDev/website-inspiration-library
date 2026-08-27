# Workflow

Keep one continuous user-facing task and save every consequential decision. Resolve scripts from the project-installed skill root. Never edit `.inspiration/state.json` directly.

## 0. Intake and architecture

Inspect the project and collect Introduction, Intent, Audience, Materials, and Requirements. Use them to propose pages, sections, content ownership, functionality, and the primary journey. Save the approved architecture.

Intake is sealed away from steps 1–3. It cannot choose cards, alter their recipe, or influence the first-pass visual agent.

## 1. Select one anchor per category

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

Run `reference-selection.mjs propose-and-save`. The selector:

- Requires exact primary category and anchor page-role eligibility.
- Rejects limited or missing still evidence and unusable recipes/reasons.
- Scores anchor strength 45%, source/still quality 35%, and page-role reproducibility 20%.
- Builds a band within ten points of the best eligible card.
- Uses the user-level seeded shuffle bag so every band member appears once before repeat.
- Produces one anchor and an empty `supporting` array.

Automatic rotation stays inside the ten-point band. An explicit `PIN THIS CARD` or `SWAP` may select a card outside that band only when it still passes every exact-category, page-role, evidence, identity, freshness, and recipe eligibility rule.

Project keywords, semantic fit, industry, audience, brand compatibility, constitutions, supporting-card logic, and project usage are not accepted selection inputs.

After selection, use `library.mjs card <stable-id> --json` or `library.mjs stage <stable-id> <project-root>`. The coordinator receives only the chosen record and evidence request; it does not receive or log the complete catalog.

Use `SHOW ANOTHER CARD`, `PIN THIS CARD`, `DO NOT USE THIS CARD`, `SWAP`, and `ACCEPT ALL`. The legacy `SHOW ANOTHER SET` spelling is accepted only as a compatibility alias.

## 2. Resolve and inspect the still

Resolve the selected stable card ID with `visual-contract.mjs`. Copy the canonical still into `.inspiration/evidence`, record its checksum and dimensions through `visual.evidence-recorded`, inspect it, then record `visual.evidence-inspected` with the matching checksum.

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

Use `isolation-runner.mjs run-subscription` by default. It creates a temporary workspace containing only the sealed payload, rendered prompt, strict output schema, and one selected still, then launches an ephemeral read-only Codex CLI task authenticated with ChatGPT. The prompt travels through stdin and the still is the final `-i` argument. The child returns an allowlisted UTF-8 file manifest; it does not write the preview. The trusted coordinator enforces the 2 MiB limit, paths, uniqueness, text-only content, still checksum, identity and intake scans, and rendered H0 contract before materializing the preview.

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

These focused directions are direction shopping, not the final design gate.

## 6. Freeze and integrate

After the user selects a direction, write and fingerprint an anchor system sheet covering type, palette roles, spacing, layout grammar, surfaces, texture, image treatment, motion, components, and never rules. Record it through `visual.anchor-contract-frozen`.

Only now use project context for real copy, information architecture, sections, routes, product data, functionality, accessibility, legal, and technical requirements. Copy may reflow within the frozen type system. It may not change the anchor subject, palette logic, typography, texture, spacing grammar, or image treatment.

Build one complete homepage and one representative dense content page. This is the actual design gate. Content pages use their correct functional structure and inherit the frozen system; they do not repeat the homepage hero or promotional pacing.

At every route, record a lightweight conformance check for typography, palette, spacing, surfaces, texture, image treatment, and component behavior. Fail unexplained visual additions. Record the full-page gate with `visual.design-gate-recorded` before building remaining pages.

## 7. Implement, polish, and finish

Build the remaining site inside the frozen system. Apply the Impeccable route as polish, not new taste selection. Verify responsive widths, keyboard flow, focus, contrast, reduced motion, loading, media fallback, content-page conformance, and production build. Record successful verification before completion.
