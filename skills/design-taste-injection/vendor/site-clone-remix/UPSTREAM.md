# Site Clone Remix Mechanics

Selected unmodified mechanics are vendored from:

- Project: `cth9191/site-clone`
- Source: https://github.com/cth9191/site-clone
- Upstream commit: `f01d396b64afa07870c6fc6757a35b92993791e2`
- Original paths: `skills/remix-site/scripts/`
- License: MIT; see `LICENSE`.

Included:

- `tokenize-css.js`: converts measured CSS literals into reversible remix tokens.
- `apply-overrides.js`: applies scoped direction overrides without replacing the base.
- `tweak-panel.js`: development-only live controls with serializable state.

The upstream direction gallery is intentionally not vendored. Design Taste Injection records original and remix candidates in the project’s single `.inspiration/workbench/index.html` instead.

Do not edit the vendored files casually. Record a new upstream commit, review the diff, rerun clone-remix tests, and retain the license when updating them.
