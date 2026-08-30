---
name: design-taste-injection
description: Guide a website from project brief through context-limited taste-library directions, one-card reference selection, variants, implementation, and polish. Use when a website should be shaped by the project-installed Website Inspiration Library. Do not use for ordinary isolated UI edits or library maintenance.
---

# Design Taste Injection

Turn the user's intent and private taste library into a deliberate website. The user chooses at every consequential fork; do not silently select a final direction.

Explicit invocation: `$design-taste-injection`.

## Start

1. Read [workflow.md](references/workflow.md) and [library-usage.md](references/library-usage.md).
2. Locate this project-installed skill's `config/library.json`. If absent or invalid, stop and ask the user to run `npm run setup:project -- <website-project-root>` from the Website Inspiration Library, then restart Codex in the website project.
3. Confirm the current workspace is the target website project, not the library or skill source. Never place website output in a protected location.
4. Resolve every skill-relative script and reference from the directory containing this `SKILL.md`.
5. Initialize or resume `.inspiration` with `node <installed-skill-root>/scripts/project-state.mjs init <website-project-root>`. The project root is a positional argument; never use `--project-root`. It must exactly match `config/library.json` so state stays at the installed website-project root.
6. Persist changes only through `project-state.mjs apply-event`, `reference-selection.mjs propose-batch-and-save`, and `reference-selection.mjs batch-action-and-save`. The legacy single-session commands are compatibility-only.
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
- Per-slot `ACCEPT`
- `SWAP`
- `SHOW ANOTHER CARD`
- `PIN THIS CARD`
- `DO NOT USE THIS CARD`
- `USE CUSTOM CARDS`

Pins and exclusions never imply approval to advance.

## Invariants

- Preflight the intended page role, then present one first-pass direction for every current catalog category in one deterministic parent-facing review. Do not begin generation if any category lacks an eligible exact-category anchor.
- Each direction has exactly one anchor and no supporting cards.
- Review batching exists only in the trusted parent. Each accepted direction gets a new child run and unique temporary workspace containing exactly one sealed card payload, one staged still, the strict output schema, and its direction prompt. Never serialize the active batch, siblings, feedback, intake, prior outputs, catalog, or project paths into a child request.
- Automatic selection uses primary category, page-role eligibility, anchor strength, source/still quality, and verified usability only.
- Never use project semantics, industry, audience, brand palette, category constitution, prior project usage, or cross-card complementarity to choose an anchor.
- Inspect the selected still before writing first-pass HTML. Never inspect motion for visual-direction generation.
- Generate first-pass directions through the ChatGPT-authenticated read-only structured Codex runner in [workflow.md]. The trusted coordinator materializes and validates its file manifest. Record each generation as context-limited, not API-isolated. The stateless Responses API is an explicit optional benchmark, never the automatic default.
- The first pass uses `previewScope: focused-category-preview` and is exactly a hero plus one opening module. For image-led cards `H0` reserves the future image geometry with a flat stand-in; decorative code art cannot substitute for the image.
- Freeze an anchor-derived visual contract after direction approval, including the approved choices and ranges under `tweakableDecisions`. Project context can then fill content, architecture, and functionality but cannot average or replace the anchor's visual language.
- The sealed runner is direction-only. In the same user-facing project task, parent Codex plans and renders exactly three complete homepage variants from the frozen contract; it never sends variants, build paths, heroes, or implementation through `isolation-runner.mjs`.
- Select one variant, then one eligible implementation path. Original is always available; Clone Remix and Inspired Rebuild require their catalog eligibility and route-specific preflight.
- Keep the selected shell as H0. Image-led cards receive exactly four H1-H4 alternatives in one batch without changing protected layout; `kind:none` retains reviewed code-native or owned-media behavior and never invokes ImageGen.
- After hero selection, add the contract-constrained development tweak bar, apply accepted values to source, build one representative dense page, and prove the tweak bar is absent from production.
- Inner pages inherit the frozen system while using page-appropriate structures; they do not repeat the landing-page hero.
- Render every generation at `.inspiration/previews/<generation-id>/index.html` before recording it.
- Record schema-v11 typed lineage through `project-state.mjs`: batched reference review, direction, three-variant batch, build-path shell, hero batch, tweak lifecycle, implementation, and final. IDs are readable labels; typed fields are authoritative.
- Preserve source identity safely: automatic generation requires a current fingerprinted identity inventory. Record whether it is Codex-drafted or human-reviewed; current Codex-drafted inventories remain generation guardrails, not legal or independent QA review. Ambiguous resemblance receives human review and is never automatically deleted.

## Conditional Routes

- For selection, sealed payloads, isolation, H0, content integration, and per-page checks, read [workflow.md](references/workflow.md).
- For evidence resolution and catalog boundaries, read [library-usage.md](references/library-usage.md).
- Before creating or revising imagery, read [image-generation.md](references/image-generation.md).
- For workbench and preview import rules, read [workbench.md](references/workbench.md).
- For an approved verified clone/remix, read [clone-remix.md](references/clone-remix.md) and obtain approval before cloning.
- For final refinement, read [polish.md](references/polish.md); Impeccable polishes the frozen system and does not choose a new one.

## Finish

Deliver the working site, retain `.inspiration` as the decision record, remove development-only controls, run responsive/accessibility checks and project tests, and summarize the anchor, evidence limits, isolation mode, adaptations, route-conformance results, and user decisions.
