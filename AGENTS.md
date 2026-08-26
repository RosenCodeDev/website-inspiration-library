# Repository Guidance

## Purpose

This repository contains two maintained products: the browse-only Website Inspiration Library and the source for the project-installed `design-taste-injection` Codex skill. Website-project output belongs in independent repositories, never here.

## Reference maintenance

When adding, removing, or materially changing a card:

1. Update identity, order, provenance, quality, and media in `src/references.ts`.
2. Update concise authored content in `src/reference-content.ts`.
3. Add or revise its workflow record in `src/workflow-intelligence.ts`, including page-role fit, `anchorUses`, clone mode, and clone reason.
4. Review category constitutions and grouped-system context when category composition changes.
5. Run `npm run catalog:workflow`; inspect the changed card and category output.
6. Update only the reviewed values in `tests/workflow-fingerprints.json` and, when category guidance changes, `tests/category-fingerprints.json`.
7. Run `npm test`, `npm run build`, and `npm run verify:archive` when archive media changed.

Do not bypass schema or fingerprint failures. They exist so card changes cannot silently leave stale AI guidance.

Automatic anchors must use the requested category as their primary category and match the intended page use. Secondary categories are supporting signals unless the user approves an exception. A live URL proves source availability, not clone eligibility; update the curated verified-clone allowlist only after reviewing reproducibility, safety, and identity-removal requirements.

## Writing standard

Use observable, evidence-based, information-dense language. Keep existing length limits. Separate source evidence from design recommendation. Never upgrade generated, obscured, or low-resolution evidence to canonical. Image prompts must define role, geometry, placement, light or flat treatment, palette, texture, and exclusions without generating source logos, copy, or interface text.

## Skill maintenance

Keep `SKILL.md` compact and route conditional detail into `references`. Project-writing scripts must reject the library and installed-skill paths. Preserve the single workbench, decision checkpoints, Codex-default image path, optional Higgsfield behavior, and Impeccable-as-polish boundary.

Vendored files under `skills/design-taste-injection/vendor` retain their license and pinned upstream commit. Do not modify or update them without reviewing the upstream diff and attribution. Every vendored file is covered by `vendor/site-clone/CHECKSUMS.json`; regenerate and review that inventory only for an intentional upstream update.

Every visual generation must be rendered at `.inspiration/previews/<generation-id>/index.html` before it is appended to project state. Update workflow state through `project-state.mjs apply-event`, never by direct JSON editing. Preserve schema migration, atomic writes, project-root matching, preview containment, and existence checks.

Selection changes must preserve context-free eligibility, user-level shuffle-bag rotation, current-card actions, one anchor with no supports, and validated pins/exclusions. Installation changes must preserve full catalog, skill, and vendor fingerprints plus staged rollback. Clone QA changes must preserve preflight matching, exact three-width coverage, mask limits, unmasked denominators, and inconclusive handling for permissive thresholds.
