# First-Time User Guide

The Website Inspiration Library is a browse-only catalog plus the source of the Design Taste Injection workflow. Website output belongs in a separate website repository.

## 1. Prepare the library

From this repository:

```powershell
npm install
npm test
npm run build
```

Node.js 22.12 or newer is required.

## 2. Install the workflow into one website project

Choose the independent website repository where the design work will happen, then run:

```powershell
npm run setup:project -- C:\path\to\website-project
```

This installs project-scoped skills under:

```text
<website-project>/.agents/skills/
|-- design-taste-injection/
`-- impeccable/
```

The installer refuses to use this library repository, the skill source, or a personal/global skills directory as the website target. It stages and fingerprints the complete Design Taste Injection bundle, preserves the vendored clone inventory, installs Impeccable locally when absent, preserves an existing project-local Impeccable skill, and rolls back all replacements if validation fails.

To include Higgsfield when a local Higgsfield skill is already available:

```powershell
npm run setup:project -- C:\path\to\website-project --with-higgsfield
```

Higgsfield is optional. Codex image generation remains the default.

## 3. Verify the project installation

```powershell
npm run check:project -- C:\path\to\website-project
npm run doctor:project -- C:\path\to\website-project
```

Restart Codex in the website project after installation or updates. Codex discovers repository skills from `.agents/skills`.

For isolated automatic direction generation, set `OPENAI_API_KEY` in the environment that launches Codex. The doctor reports this as optional because the explicitly approved degraded path remains available, but without the key automatic generation cannot use the sealed Responses API.

## 4. Remove older global installations

The workflow no longer uses global installations. After at least one project-scoped installation passes `check:project`, remove only verified, previously managed copies:

```text
%USERPROFILE%\.codex\skills\design-taste-injection
%USERPROFILE%\.agents\skills\impeccable
%USERPROFILE%\.codex\skills\higgsfield   (only if it was installed by this workflow)
```

Before removal:

1. Resolve the exact directory.
2. Confirm the Design Taste marker says `website-inspiration-library/design-taste-injection`.
3. Make a recoverable backup.
4. Do not remove unrelated personal, plugin, admin, or system skills.

The implementation environment for this repository should not retain the old managed global Design Taste Injection or guide-managed global Impeccable/Higgsfield after project installation has been verified.

## 5. Start a website workflow

Open the website project—not this library—in Codex and invoke:

```text
$design-taste-injection
```

Provide:

- Introduction: what the website is.
- Intent: what it should accomplish.
- Audience: who must understand or act.
- Materials and Requirements: content, files, functionality, brand requirements, and constraints.

The workflow uses those facts for architecture, content, and functionality. First-pass visual directions remain isolated from them and are driven by one library card and its still.

## 6. What to expect

1. Architecture and primary journey approval.
2. One context-free anchor per populated category.
3. A source still displayed beside each hero-plus-opening-module preview.
4. `SHOW ANOTHER CARD`, pin, exclude, swap, and accept controls.
5. A frozen visual contract after direction selection.
6. A complete homepage plus dense content page as the real design gate.
7. Per-route visual conformance checks.
8. Final Impeccable polish inside the selected visual system.

The selector uses primary category, page-role eligibility, anchor strength, still/source quality, and verified usability. It does not use industry, audience, project semantics, brand color compatibility, category constitutions, or supporting cards.

## 7. Isolation behavior

Automatic first-pass directions use a stateless, tool-free Responses API call with the pinned `gpt-5.6-sol` model. The request contains one validated card payload and one still as an in-memory image; it omits conversation state, previous response IDs, project context, the catalog, category profiles, other cards, absolute paths, and motion clips.

If the API is unavailable or a sealed call fails, the current thread may run only after you select the exact warning acknowledgement and then choose `RUN DEGRADED GENERATION`. Every such run is one-generation-only, recorded as `degraded`, and labeled `DEGRADED — NOT ISOLATED` throughout review. It is never called isolated and approval is never remembered.

The coordinator, rather than the model, validates the rendered hero slot and writes `output-contract.json`. Earlier `fresh-agent` and `payload-only` records migrate to `legacy-unverified`.

## 8. Updating a project

After pulling library changes, rerun:

```powershell
npm install
npm run setup:project -- C:\path\to\website-project
npm run check:project -- C:\path\to\website-project
```

Existing `.inspiration` history remains in the website repository. A catalog fingerprint change forces active selection revalidation without rewriting historical previews.

## 9. Troubleshooting

- Missing project skill: rerun `setup:project`, then restart Codex in the website project.
- Stale fingerprints: rerun `setup:project`; do not edit installed skill files by hand.
- Missing still: repair the card in this library and run the catalog tests.
- Isolation preflight failure: try the next isolation mode; do not relabel the failed mode.
- Workbench does not load: start it through the skill's loopback server rather than opening the HTML directly.
- Browser capture unavailable: install Chrome, Edge, or Chromium, or set `DESIGN_TASTE_BROWSER_PATH`.

## 10. Maintainer checks

Before shipping workflow changes:

```powershell
npm run check:scripts
npm run validate:skill
npm run verify:vendor
npm run verify:archive-pointers
npm test
npm run build
npm run verify:temp-install
npm run test:clone-fixture
```

Do not bypass catalog, schema, fingerprint, vendor, preview-containment, or rollback failures.
