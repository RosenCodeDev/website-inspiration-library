# Workflow

Keep one continuous user-facing task and save every consequential decision. Resolve scripts from the project-installed skill root. Never edit `.inspiration/state.json` directly.

## 0. Intake and architecture

Inspect the project and collect Introduction, Intent, Audience, Materials, and Requirements. Use them to propose pages, sections, content ownership, functionality, and the primary journey. Save the approved architecture.

Intake is sealed away from steps 1–3. It cannot choose cards, alter their recipe, or influence the first-pass visual agent.

## 1. Select one anchor per category

Read the catalog through `library.mjs catalog`, but pass selection only the requested category, page role, optional seed, pins, and exclusions:

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

Project keywords, semantic fit, industry, audience, brand compatibility, constitutions, supporting-card logic, and project usage are not accepted selection inputs.

Use `SHOW ANOTHER CARD`, `PIN THIS CARD`, `DO NOT USE THIS CARD`, `SWAP`, and `ACCEPT ALL`. The legacy `SHOW ANOTHER SET` spelling is accepted only as a compatibility alias.

## 2. Resolve and inspect the still

Resolve the selected stable card ID with `visual-contract.mjs`. Copy the canonical still into `.inspiration/evidence`, record its checksum and dimensions through `visual.evidence-recorded`, inspect it, then record `visual.evidence-inspected` with the matching checksum.

Never provide motion clips or frames to the visual agent. Never provide the catalog, other cards, prior directions, intake, project paths, or category profiles.

## 3. Build the sealed brief

Build the payload from the selected card alone with `buildSealedPayload`. It contains card identity, descriptors, tags, card-authored observed brief, staged still, canonical image recipe or reviewed `kind:none` reason, neutral copy envelopes, placement, reviewed source-identity exclusions, viewport, and output contract.

Render the visual prompt in five blocks:

1. Aesthetic.
2. Reference.
3. Future hero.
4. Placement.
5. Output contract.

The card's `Composition:` and `Avoid:` guidance is allowed. The builder does not import or accept category profiles. A separate guard rejects exact category-constitution sentences and any constitution object/namespace without banning ordinary field names.

Create `.inspiration/leak-signals.json` from exact intake-derived names, phrases, domains, claims, brand color names, and hex values. It is a guardrail, not proof of isolation.

## 4. Isolate generation

Use this ladder:

1. `fresh-agent`: no history and a resource boundary that exposes only staged evidence, payload, scaffold, and output directory.
2. `payload-only`: `codex exec --ephemeral` in a temporary workspace, `workspace-write`, non-interactive approvals, and no added project/library directories.
3. `degraded`: the intake-aware thread, only after explicit user approval; never call it isolated.

Before enabling either isolated mode, run `isolation-runner.mjs preflight`. It must prove staged reads and temporary writes succeed while project and library reads and enumeration fail. A fresh subagent without an enforced resource boundary is not `fresh-agent`.

If a mode fails, mark it unavailable and try the next. Stop only when both isolated modes are unavailable and the user refuses degraded generation.

Record the chosen mode with `visual.isolation-recorded`.

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

The isolated agent writes only to its temporary output directory. It must include `output-contract.json`, asserting one anchor, no supports, still inspection, no motion use, one hero, one opening module, the required H0 mode, and no decorative code art used as the missing image. The coordinator validates that schema, containment, permitted files, paths, intake leaks, and exact source identity, renders the result, performs human identity review, atomically imports it, and only then appends the generation event. Show the source still beside the preview in the workbench.

These focused directions are direction shopping, not the final design gate.

## 6. Freeze and integrate

After the user selects a direction, write and fingerprint an anchor system sheet covering type, palette roles, spacing, layout grammar, surfaces, texture, image treatment, motion, components, and never rules. Record it through `visual.anchor-contract-frozen`.

Only now use project context for real copy, information architecture, sections, routes, product data, functionality, accessibility, legal, and technical requirements. Copy may reflow within the frozen type system. It may not change the anchor subject, palette logic, typography, texture, spacing grammar, or image treatment.

Build one complete homepage and one representative dense content page. This is the actual design gate. Content pages use their correct functional structure and inherit the frozen system; they do not repeat the homepage hero or promotional pacing.

At every route, record a lightweight conformance check for typography, palette, spacing, surfaces, texture, image treatment, and component behavior. Fail unexplained visual additions. Record the full-page gate with `visual.design-gate-recorded` before building remaining pages.

## 7. Implement, polish, and finish

Build the remaining site inside the frozen system. Apply the Impeccable route as polish, not new taste selection. Verify responsive widths, keyboard flow, focus, contrast, reduced motion, loading, media fallback, content-page conformance, and production build. Record successful verification before completion.
