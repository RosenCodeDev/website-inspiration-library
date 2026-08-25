# First-Time User Guide

Use this guide to install the system once, then start any website project.

## What the system contains

- **Website Inspiration Library:** the permanent design-reference collection.
- **Design Taste Injection:** the Codex workflow that uses the library.
- **Impeccable:** the design-quality and accessibility reviewer.
- **Website project:** a separate folder for one website and its decisions.

Keep project work outside the library. The library portal does not need to be running while Codex designs a website.

## One-time setup

### 1. Check Node.js and Git

Run in **PowerShell**:

```powershell
node --version
git --version
```

Node.js 22.12 or newer is required. Install any missing program, then reopen PowerShell.

### 2. Install the library and Design Taste Injection

If the library is not on this computer, run in **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop
git clone https://github.com/RosenCodeDev/website-inspiration-library.git
cd C:\Users\hrose\Desktop\website-inspiration-library
npm install
npm run setup:codex
npm run check:codex
npm run doctor
```

If the library already exists, update it instead:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
git pull
npm install
npm run setup:codex
npm run check:codex
npm run doctor
```

Setup installs Design Taste Injection globally and records the library location. Restart Codex Desktop afterward.

### 3. Install Impeccable globally

Run in **PowerShell**:

```powershell
npx impeccable install --providers=codex --scope=global
```

For future updates:

```powershell
npx impeccable update
```

Restart Codex Desktop after installation or an update.

### 4. Optional Higgsfield setup

Skip this section unless you have a Higgsfield account. Codex image generation is the default.

```powershell
npm install -g @higgsfield/cli
higgsfield auth login
npx skills add higgsfield-ai/skills --global --agent codex --yes
```

## Start a website project

A project may be an empty local folder or a Git repository. Git is recommended but not required.

1. Create or choose a dedicated website folder.
2. Open that folder in Codex Desktop. Do not open the inspiration-library folder.
3. Open the project’s **Codex terminal** and run:

   ```powershell
   npx --yes impeccable install --providers=codex --scope=project
   ```

4. Close and reopen the project in Codex Desktop.
5. In **Codex chat**, send:

   ```text
   $impeccable hooks on
   ```

6. In **Codex chat**, open:

   ```text
   /hooks
   ```

7. Approve the Impeccable design detector.
8. In **Codex chat**, send your project brief beginning with:

   ```text
   $design-taste-injection
   ```

Do not run `npm install` or `npm run setup:codex` in a new website folder. The one project command above is the only installation step needed there.

### Why the hook needs a separate step

The global Impeccable installation gives Codex the design skill. The project installation adds the hook scripts and `.codex/hooks.json` to that website folder.

`$impeccable hooks on` enables that project connection. `/hooks` then lets you approve it. After approval, Impeccable checks relevant UI edits and reports issues such as broken images, overflow, weak contrast, or design drift.

The hook is recommended, not required. Design Taste Injection and Impeccable still work without it, but quality checks must run manually.

## Normal workflow

Codex will inspect the project and ask for any missing information. It then guides you through structure, aesthetic directions, references, variants, build path, hero, implementation, and final polish.

Common replies:

1. Approve structure: `APPROVE AND CONTINUE`
2. Choose a direction: `APPROVE AND CONTINUE - choose D03`
3. Approve references: `ACCEPT ALL`
4. Choose a variant: `APPROVE AND CONTINUE - choose D03-B`
5. Choose the build path: `APPROVE AND CONTINUE - use Original`
6. Choose the hero: `APPROVE AND CONTINUE - keep H0`

At any checkpoint:

- `REVISE` changes the current option.
- `TRY ANOTHER` produces another option.
- `GO BACK` returns to the prior checkpoint.

During reference review, you can also use `SWAP`, `SHOW ANOTHER SET`, `PIN THIS CARD`, and `DO NOT USE THIS CARD`.

The Design Workbench preserves every direction and later variation in one local project page.

## Continue a project later

Open the same folder and return to the same Codex task.

In a new Codex task, send:

```text
$design-taste-injection Resume this website from its saved workflow state.
```

Project decisions remain under `.inspiration` inside that website folder.

## Browse the library

Browsing is optional. Run in **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
npm run dev
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Keep PowerShell open. Press `Ctrl+C` there to stop the portal.

## Update or move the library

After updating or moving the library, run these commands from its current location:

```powershell
cd "CURRENT\LOCATION\website-inspiration-library"
git pull
npm install
npm run setup:codex
npm run check:codex
npm run doctor
```

Replace `CURRENT\LOCATION` with the real path. Setup replaces the managed skill and records the new library location; it does not leave an obsolete second copy. Restart Codex Desktop afterward.

## Clone Remix

Design Taste Injection already includes Site Clone and Remix mechanics. No separate Site Clone installation is needed.

Clone Remix is limited to approved, measurable references. If a site blocks inspection or cannot be reconstructed reliably, the workflow offers Original or Inspired Rebuild instead. A rare WebGPU site may require the WebGPU Inspector browser extension.

## Quick fixes

### `/hooks` is empty

Open the website project’s **Codex terminal** and run:

```powershell
npx --yes impeccable install --providers=codex --scope=project
```

Close and reopen the project. Then, in **Codex chat**, send:

```text
$impeccable hooks on
```

Open `/hooks` and approve the detector. If `/hooks` is still empty, confirm that the project contains `.codex/hooks.json`.

### Codex does not recognize `$design-taste-injection`

Run in **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
npm run setup:codex
npm run check:codex
```

Restart Codex Desktop.

### PowerShell cannot find `package.json`

You are in the wrong folder. Installation commands must run from:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
```

### PowerShell blocks `npm` or `npx`

Use the `.cmd` form:

```powershell
npm.cmd run setup:codex
npm.cmd run check:codex
npx.cmd impeccable install --providers=codex --scope=global
npx.cmd --yes impeccable install --providers=codex --scope=project
```

### The Design Workbench is empty

Continue the project intake in Codex. Directions appear after the content structure is approved.

### Higgsfield is unavailable

Choose Codex image generation. Higgsfield is optional.

## Platform notes

Windows is the primary supported setup. On macOS or Linux, use the same Git and npm commands with your own library path. If browser discovery fails, set `DESIGN_TASTE_BROWSER_PATH` to Chrome, Edge, or Chromium.

Runtime portal media uses ordinary Git files. Git LFS is optional and stores historical capture evidence only.
