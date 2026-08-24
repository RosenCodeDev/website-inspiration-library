# Repository Guidance

## Purpose

This repository contains two maintained products: the browse-only Website Inspiration Library and the source for the globally installed `design-taste-injection` Codex skill. Website-project output belongs in independent repositories, never here.

## Reference maintenance

When adding, removing, or materially changing a card:

1. Update identity, order, provenance, quality, and media in `src/references.ts`.
2. Update concise authored content in `src/reference-content.ts`.
3. Add or revise its explicit workflow record in `src/workflow-intelligence.ts`.
4. Review category constitutions and grouped-system context when category composition changes.
5. Run `npm run catalog:workflow`; inspect the changed card and category output.
6. Update only the reviewed values in `tests/workflow-fingerprints.json` and, when category guidance changes, `tests/category-fingerprints.json`.
7. Run `npm test`, `npm run build`, and `npm run verify:archive` when archive media changed.

Do not bypass schema or fingerprint failures. They exist so card changes cannot silently leave stale AI guidance.

## Writing standard

Use observable, evidence-based, information-dense language. Keep existing length limits. Separate source evidence from design recommendation. Never upgrade generated, obscured, or low-resolution evidence to canonical. Image prompts must define role, geometry, placement, light or flat treatment, palette, texture, and exclusions without generating source logos, copy, or interface text.

## Skill maintenance

Keep `SKILL.md` compact and route conditional detail into `references`. Project-writing scripts must reject the library and installed-skill paths. Preserve the single workbench, decision checkpoints, Codex-default image path, optional Higgsfield behavior, and Impeccable-as-polish boundary.

Vendored files under `skills/design-taste-injection/vendor` retain their license and pinned upstream commit. Do not modify or update them without reviewing the upstream diff and attribution.
