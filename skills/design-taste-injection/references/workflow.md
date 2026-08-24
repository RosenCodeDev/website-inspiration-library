# Workflow

Keep one continuous task. Save state after every accepted, revised, replaced, pinned, or rejected decision. Never advance from a consequential choice without explicit approval.

## 0. Understand the project

1. Inspect the existing project, if any.
2. Collect Introduction, Intent, Audience, and optional Materials and Requirements.
3. Read supplied files and summarize confirmed content, required functionality, brand constraints, and open assumptions.
4. Propose the information architecture: pages, sections, content ownership, and primary user path.
5. Checkpoint. Revise until approved.

## 1. Show the full aesthetic range

Read the live library catalog with `node scripts/library.mjs catalog`. Create one direction for every populated category, in catalog order. Number them `D01…DNN`.

Each direction contains:

- Category and one-sentence thesis.
- One anchor and no more than two supporting references.
- One declared job for each supporting reference.
- Why the set fits this project.
- What will transfer and what will not.
- A polished code-built `H0` hero aligned with the category constitution.
- A real page shell using the approved information architecture, not a decorative hero-only concept.

Show all directions in the single Design Workbench. Checkpoint.

## 2. Select references without surrendering control

Score candidates semantically, using these weights as a decision rubric rather than false numerical precision:

- Project, intent, and audience fit: 30%
- Page or section fit: 20%
- Requested role fit: 20%
- Complementarity with the other references: 15%
- Source quality: 10%
- Usage diversity in this project: 5%

Use `node scripts/reference-selection.mjs propose <request.json>` to enforce category, role, quality, pin, exclusion, and diversity constraints. Supply `fitById` from your evidence-based semantic judgment; the script must not replace visual inspection. Use its `action` command for pin, exclusion, swap, and alternate-set state transitions.

Prefer canonical evidence when fit is comparable. A lower-quality reference may win only when its distinctive concept materially fits better; state its limits. Do not choose from title or category alone. Inspect the image, authored fields, workflow intelligence, group context, and motion evidence.

Reference actions do not advance automatically:

- `ACCEPT ALL`: accept the complete set.
- `SWAP`: replace the named slot and stay here.
- `SHOW ANOTHER SET`: produce a materially different set; avoid rejected and overused cards.
- `PIN THIS CARD`: lock it, then offer to retain or refresh only unpinned slots.
- `DO NOT USE THIS CARD`: exclude it, propose the best replacement immediately, and stay here.

Record rationale, role, pin, exclusion, and usage count in project state.

## 3. Develop the chosen direction

After a category direction is approved, produce three compositionally distinct variants named `Dxx-A`, `Dxx-B`, and `Dxx-C`. Keep the category constitution and approved references; change body format, hierarchy, density, navigation behavior, or module progression. Do not present three palette swaps.

Checkpoint. Preserve every variant in the workbench.

## 4. Choose the build path

After a variant is approved, offer the eligible paths together:

- **Original (`O`)**: build from the approved constitution and reference roles without copying a source page.
- **Clone remix (`R`)**: available only for an approved card whose catalog says `verified-live`. Measure the live page, remove source identity and content, and reshape it with the approved project brief and reference set.

Explain the tradeoff. Original maximizes authorship; clone remix accelerates fidelity when the source structure genuinely fits. The user chooses. Never clone merely because a URL exists.

## 5. Resolve the hero

Keep the selected code-built hero as `…-H0`. Ask whether the user wants image alternatives.

- If no, refine H0 and continue.
- If yes, keep H0 intact and create `H1…H4` from the approved hero role, composition, palette, and evidence limits.
- Use Codex image generation by default. Offer Higgsfield only when installed and selected.
- Present H0 and every image option together in the workbench.

After selection, integrate the hero and tune the transition into the body. Preserve reading order, responsive behavior, contrast, and reduced-motion behavior.

## 6. Implement and tune

Build the complete approved site. Add a development-only tweak layer for decisions that remain useful to compare: type scale, type pairing, accent, section spacing, density, surface treatment, and meaningful motion values. Keep the control set small and project-specific. Save accepted values to normal source files; remove the panel from production.

Checkpoint after the integrated page, not after isolated components.

## 7. Polish inside the same workflow

Run the Impeccable route described in `polish.md`. Apply only changes that improve clarity, hierarchy, accessibility, responsiveness, or deliberate character without erasing the chosen taste direction. Show material visual changes for approval.

## 8. Finish

Verify responsive widths, keyboard flow, visible focus, contrast, reduced motion, loading, broken-media fallback, and production build. Update project state to `complete`. Report:

- Final direction and lineage.
- References and their declared roles.
- Original or clone-remix path.
- Hero source and image provider, if any.
- Important adaptations and evidence limits.
- Tests run and remaining constraints.
