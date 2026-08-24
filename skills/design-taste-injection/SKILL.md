---
name: design-taste-injection
description: Guide a website from project brief through taste-library directions, reference selection, variants, hero exploration, implementation, and polish. Use when a user wants a new or existing website shaped by the installed Website Inspiration Library. Do not use for ordinary isolated UI edits or library maintenance.
---

# Design Taste Injection

Turn the user's intent and private taste library into a deliberate website. The user chooses at every consequential fork; do not silently select a final direction.

## Start

1. Read [workflow.md](references/workflow.md) and [library-usage.md](references/library-usage.md).
2. Locate the installed `config/library.json`. If absent or invalid, stop and ask the user to run `npm run setup:codex` from the website-inspiration-library repository, then restart Codex.
3. Confirm the current workspace is the target website project, not the library or installed skill. Never place project output in either protected location.
4. Run `node scripts/project-state.mjs init <project-root>` to create or resume `.inspiration/state.json` and the single Design Workbench.
5. Inspect the target project and any user-supplied materials before proposing structure.

## Intake

Ask for missing information in one compact batch. Accept prose; do not force a form.

- **Introduction:** what the website is. Example: "A website for a small payroll product that automates contractor payments."
- **Intent:** what success should feel like and accomplish. Example: "Earn trust quickly and move qualified teams to a demo."
- **Audience:** who must understand or act. Example: "Operations leaders at 20-200 person companies."
- **Materials and Requirements:** optional files, required sections, brand rules, functionality, constraints, and existing code. Example: "Use the attached PDF for services, the deck for proof, and the company's navy and cream."

Inspect referenced PDFs, presentations, spreadsheets, images, URLs, and project files. Let their content influence information architecture, not only styling. Separate observed requirements from assumptions.

## Control Model

At each important checkpoint offer exactly:

- `APPROVE AND CONTINUE`
- `REVISE`
- `TRY ANOTHER`
- `GO BACK`

For reference sets also support:

- `ACCEPT ALL`: keep the proposed set.
- `SWAP`: replace one named card; propose the replacement and remain at review.
- `SHOW ANOTHER SET`: keep the same brief and category but propose a materially different valid set.
- `PIN THIS CARD`: lock it, then ask whether to keep the remaining cards or refresh only the unpinned slots.
- `DO NOT USE THIS CARD`: exclude it for this project, automatically propose a replacement, and remain at review.

Never interpret pin or exclusion as approval to advance.

## Workflow Rules

- Present one `D01-DNN` direction for every populated library category; do not randomly omit categories.
- For each direction recommend one primary anchor and at most two supporting cards. Give each support one job: typography, hero art, motion, interaction, navigation, content system, data display, product proof, or conversion.
- Explain selection with project fit, page fit, role fit, complementarity, quality, and prior usage. User intent controls the recommendation; diversity prevents the same references from dominating every project.
- "Match feel, not content." Preserve relationships and behavior, not another brand's copy, identity, people, product imagery, claims, or licensed assets.
- Keep a category-level Taste Constitution around every set so references from one category remain coherent.
- After category approval, create `Dxx-A-C` variants, then original/remix paths, then hero states `H0-H4`. Add every generation to the same workbench; never overwrite prior choices.
- `H0` is a polished code-built CSS/SVG/canvas hero, never an empty placeholder. Preserve it when generating `H1-H4` image alternatives.
- Codex image generation is the default. Offer Higgsfield only if installed and the user selects it. A missing Higgsfield account never blocks progress.
- Keep observed evidence separate from recommendations. Respect each card's quality limits.
- Keep all user-facing and authored language concise, direct, and information-dense.

## Conditional Routes

- For original construction and hero lineage, read [workbench.md](references/workbench.md).
- If a verified live source is selected for cloning, read [clone-remix.md](references/clone-remix.md). Ask for approval before cloning. Use the vendored mechanics only for the approved clone/remix route.
- Before creating or revising imagery, read [image-generation.md](references/image-generation.md).
- When the chosen implementation is ready for final refinement, read [polish.md](references/polish.md) and orchestrate Impeccable inside this workflow.

## Finish

Deliver the working site, preserve `.inspiration` as the decision record, remove development-only tweak controls from production, run relevant tests and responsive/accessibility checks, and summarize the references used, adaptations made, evidence limits, and final user decisions.
