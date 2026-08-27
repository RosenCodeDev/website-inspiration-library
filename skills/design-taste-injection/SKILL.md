---
name: design-taste-injection
description: Guide a website from project brief through context-isolated taste-library directions, one-card reference selection, variants, implementation, and polish. Use when a website should be shaped by the project-installed Website Inspiration Library. Do not use for ordinary isolated UI edits or library maintenance.
---

# Design Taste Injection

Turn the user's intent and private taste library into a deliberate website. The user chooses at every consequential fork; do not silently select a final direction.

Explicit invocation: `$design-taste-injection`.

## Start

1. Read [workflow.md](references/workflow.md) and [library-usage.md](references/library-usage.md).
2. Locate this project-installed skill's `config/library.json`. If absent or invalid, stop and ask the user to run `npm run setup:project -- <website-project-root>` from the Website Inspiration Library, then restart Codex in the website project.
3. Confirm the current workspace is the target website project, not the library or skill source. Never place website output in a protected location.
4. Resolve every skill-relative script and reference from the directory containing this `SKILL.md`.
5. Initialize or resume `.inspiration` with `project-state.mjs init`.
6. Persist changes only through `project-state.mjs apply-event`, `reference-selection.mjs propose-and-save`, and `reference-selection.mjs action-and-save`.
7. Inspect the project and supplied materials for content, structure, and functionality. Do not expose that intake to visual-direction generation.

## Intake

Collect Introduction, Intent, Audience, and optional Materials and Requirements. Inspect supplied files and separate confirmed requirements from assumptions. Intake controls information architecture, content, functionality, accessibility, and constraints after a visual direction is frozen; it does not control anchor selection or first-pass visual design.

## Control Model

At each important checkpoint offer exactly:

- `APPROVE AND CONTINUE`
- `REVISE`
- `TRY ANOTHER`
- `GO BACK`

For anchor review also support:

- `ACCEPT ALL`
- `SWAP`
- `SHOW ANOTHER CARD`
- `PIN THIS CARD`
- `DO NOT USE THIS CARD`

Pins and exclusions never imply approval to advance.

## Invariants

- Present one first-pass direction for every populated category.
- Each direction has exactly one anchor and no supporting cards.
- Automatic selection uses primary category, page-role eligibility, anchor strength, source/still quality, and verified usability only.
- Never use project semantics, industry, audience, brand palette, category constitution, prior project usage, or cross-card complementarity to choose an anchor.
- Inspect the selected still before writing first-pass HTML. Never inspect motion for visual-direction generation.
- Generate first-pass directions through the stateless, tool-free sealed Responses API in [workflow.md]. Never substitute a context-aware run automatically or call a degraded run isolated.
- The first pass uses `previewScope: focused-category-preview` and is exactly a hero plus one opening module. For image-led cards `H0` reserves the future image geometry with a flat stand-in; decorative code art cannot substitute for the image.
- Freeze an anchor-derived visual contract after direction approval. Project context can then fill content, architecture, and functionality but cannot average or replace the anchor's visual language.
- Inner pages inherit the frozen system while using page-appropriate structures; they do not repeat the landing-page hero.
- Render every generation at `.inspiration/previews/<generation-id>/index.html` before recording it.
- Preserve source identity safely: automatic generation requires a current human-reviewed identity inventory; exact reviewed metadata drives scans, while ambiguous resemblance receives human review and is never automatically deleted.

## Conditional Routes

- For selection, sealed payloads, isolation, H0, content integration, and per-page checks, read [workflow.md](references/workflow.md).
- For evidence resolution and catalog boundaries, read [library-usage.md](references/library-usage.md).
- Before creating or revising imagery, read [image-generation.md](references/image-generation.md).
- For workbench and preview import rules, read [workbench.md](references/workbench.md).
- For an approved verified clone/remix, read [clone-remix.md](references/clone-remix.md) and obtain approval before cloning.
- For final refinement, read [polish.md](references/polish.md); Impeccable polishes the frozen system and does not choose a new one.

## Finish

Deliver the working site, retain `.inspiration` as the decision record, remove development-only controls, run responsive/accessibility checks and project tests, and summarize the anchor, evidence limits, isolation mode, adaptations, route-conformance results, and user decisions.
