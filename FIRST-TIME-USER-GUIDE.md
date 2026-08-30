# First-Time User Guide

The Website Inspiration Library is a browse-only catalog plus the source of the Design Taste Injection workflow. Website output belongs in a separate website repository.

## TL;DR: first-time setup

### Standard setup with npm

From PowerShell, replace the two placeholder paths with the library repository and independent website project paths. Keep the quotation marks so paths containing spaces work correctly.

```powershell
cd "C:\path\to\website-inspiration-library"

npm install
npm test
npm run build

npm run setup:project -- "C:\path\to\website-project"
npm run check:project -- "C:\path\to\website-project"
npm run doctor:project -- "C:\path\to\website-project"
```

If the doctor reports missing Codex subscription authentication, complete the browser sign-in and rerun the doctor:

```powershell
codex login
npm run doctor:project -- "C:\path\to\website-project"
```

When the doctor reports `READY`, restart Codex in the website project and invoke `$design-taste-injection` together with the initial website brief.

### Restricted setup without npm

Codex Desktop includes Node.js and pnpm even when a managed Windows laptop does not expose `node` or `npm` on `PATH`. Replace the two placeholder paths below, then run the block from PowerShell. It restores the library dependencies without lifecycle scripts or lockfile changes, stages Impeccable outside the website project, and invokes the same setup, check, and doctor scripts directly with bundled Node.js.

```powershell
$library = "C:\path\to\website-inspiration-library"
$project = "C:\path\to\website-project"
$runtime = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$nodeBin = Join-Path $runtime "node\bin"
$node = Join-Path $nodeBin "node.exe"
$pnpm = Join-Path $runtime "bin\fallback\pnpm.cmd"
$impeccableStage = Join-Path ([System.IO.Path]::GetTempPath()) "design-taste-impeccable-$([guid]::NewGuid())"

$env:PATH = "$nodeBin;$env:PATH"
$env:NODE_USE_SYSTEM_CA = "1"

Set-Location $library
& $pnpm install --ignore-scripts --lockfile=false

New-Item -ItemType Directory -Path $impeccableStage | Out-Null
try {
  Push-Location $impeccableStage
  try {
    & $pnpm dlx impeccable install --providers=codex --scope=project
    if ($LASTEXITCODE -ne 0) { throw "Impeccable installation failed." }
  } finally {
    Pop-Location
  }

  Set-Location $library
  $impeccableSource = Join-Path $impeccableStage ".agents\skills\impeccable"
  & $node "scripts\setup-project.mjs" $project --impeccable-source $impeccableSource
  & $node "scripts\check-project.mjs" $project
  & $node "scripts\doctor-project.mjs" $project
} finally {
  Remove-Item -LiteralPath $impeccableStage -Recurse -Force
}
```

`NODE_USE_SYSTEM_CA=1` keeps TLS verification enabled while allowing bundled Node.js to trust certificates managed by the Windows organization. Network access is still required the first time pnpm downloads missing packages. If the doctor reports missing Codex subscription authentication, run `codex login`, then rerun the final doctor command. When the doctor reports `READY`, restart Codex in the website project and invoke `$design-taste-injection` together with the initial website brief.

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

## 4. Start a website workflow

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

## 5. Updating a project

After pulling library changes, rerun:

```powershell
npm install
npm run setup:project -- C:\path\to\website-project
npm run check:project -- C:\path\to\website-project
```

Existing `.inspiration` history remains in the website repository. Schema-v10 migration preserves legacy previews and decisions, then resumes at the earliest missing tutorial checkpoint rather than guessing new batch lineage. A catalog fingerprint change forces active selection revalidation without rewriting historical previews.
