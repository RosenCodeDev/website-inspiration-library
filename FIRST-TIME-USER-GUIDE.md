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

Restart Codex in the website project after installation or updates. Codex discovers repository skills from `.agents/skills`. The doctor uses machine-readable Codex diagnostics when available to confirm active ChatGPT authentication. This is the billing-safety check; the first successful H0 and first requested image are the actual page and image capability checks.

`OPENAI_API_KEY` is not required for ordinary project use, Codex image generation, or the formal subscription evaluation. It is optional and used only when you explicitly select the sealed API benchmark.

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

The workflow uses those facts for architecture, content, and functionality. Before spending subscription usage it verifies that every current category has an eligible anchor for the intended page role. First-pass visual directions are generated in an ephemeral read-only, context-limited Codex task driven by one library card and its still; this is not described as filesystem-confidential or API-grade isolation.

## 6. What to expect

1. Architecture and primary journey approval.
2. One context-free anchor per populated category.
3. A source still displayed beside each hero-plus-opening-module preview.
4. `SHOW ANOTHER CARD`, pin, exclude, swap, and accept controls.
5. A frozen visual contract after direction selection.
6. Exactly three complete homepage variants created by parent Codex in the website project; the sealed direction runner is not reused.
7. One eligible implementation path, followed by H0 plus exactly four hero alternatives for image-led cards. Reviewed `kind:none` cards stay off ImageGen.
8. A development-only tweak bar constrained to approved contract choices and ranges.
9. One dense content page after hero selection as the real full-page design gate.
10. Per-route conformance, production tweak-bar removal, and final Impeccable polish.

The default operation shape is one first-pass direction per current category, three homepage candidates, and one four-image batch, plus bounded corrective retries. The category count follows the catalog dynamically. Subscription time or usage is not estimated because it varies by task and account.

The selector uses primary category, page-role eligibility, anchor strength, still/source quality, and verified usability. It does not use industry, audience, project semantics, brand color compatibility, category constitutions, or supporting cards.

## 7. Isolation behavior

Automatic first-pass directions use an ephemeral read-only Codex CLI task authenticated through ChatGPT. Its temporary workspace contains one validated card payload, one still, the rendered prompt, and a strict schema. It has no conversation history and returns a text-file manifest for the trusted coordinator to materialize and validate. It is labeled `CODEX SUBSCRIPTION — STRUCTURED, CONTEXT-LIMITED`; this limits accidental context bleed but is not a filesystem confidentiality boundary.

Only first-pass directions use that child. After the direction is selected and its contract is frozen, the current parent Codex task works inside the website project with the approved project content. Variant, build-path, hero-integration, tweak-bar, dense-page, and final generations are recorded separately and cannot claim sealed-runner provenance.

The stateless, tool-free Responses API path is an optional explicit benchmark. It requires `OPENAI_API_KEY`, is never selected automatically, and is not a prerequisite for a normal website project or release evaluation.

If the subscription runner is unavailable or fails, the current thread may run only after you select the exact warning acknowledgement and then choose `RUN DEGRADED GENERATION`. Every such run is one-generation-only, recorded as `degraded`, and labeled `DEGRADED — NOT ISOLATED` throughout review. Approval is never remembered.

The coordinator, rather than the model, validates the rendered hero slot and writes `output-contract.json`. Earlier `fresh-agent` and `payload-only` records migrate to `legacy-unverified`.

## 8. Updating a project

After pulling library changes, rerun:

```powershell
npm install
npm run setup:project -- C:\path\to\website-project
npm run check:project -- C:\path\to\website-project
```

Existing `.inspiration` history remains in the website repository. Schema-v10 migration preserves legacy previews and decisions, then resumes at the earliest missing tutorial checkpoint rather than guessing new batch lineage. A catalog fingerprint change forces active selection revalidation without rewriting historical previews.

## 9. Troubleshooting

- Missing project skill: rerun `setup:project`, then restart Codex in the website project.
- Stale fingerprints: rerun `setup:project`; do not edit installed skill files by hand.
- Missing still: repair the card in this library and run the catalog tests.
- Subscription generation failure: inspect the authentication diagnostic and structured-output validation error. Do not silently switch to the API or current intake thread.
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
npm run test:inspiration-eval
npm run release:check
```

Do not bypass catalog, schema, fingerprint, vendor, preview-containment, or rollback failures.
