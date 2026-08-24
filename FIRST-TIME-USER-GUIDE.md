# First-Time User Guide

This guide is written for someone who does not code. Follow it from top to bottom. You only need to complete the installation sections once.

## The three folders

You will work with three separate things:

1. **Website Inspiration Library:** your permanent collection of design references.
2. **Design Taste Injection:** instructions installed in Codex so it knows how to use the library.
3. **Your website project:** a separate folder containing one website you are creating.

The first two stay clean and reusable. Your project-specific writing, mockups, images, decisions, and code stay in the third folder.

You do **not** copy the inspiration library into every website. You do **not** need to keep the visual library portal running while Codex designs a website.

## Before you begin

Open PowerShell and check that Node.js and Git are installed:

```powershell
node --version
git --version
```

Node.js 22.12 or newer is required; 22.18 or newer is recommended. If either command says it is not recognized, install that program before continuing.

## Install the library and Design Taste Injection

### If this computer does not have the library yet

Paste these commands into **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop
git clone https://github.com/RosenCodeDev/website-inspiration-library.git
cd C:\Users\hrose\Desktop\website-inspiration-library
npm install
npm run setup:codex
```

### If the library is already at `C:\Users\hrose\Desktop\website-inspiration-library`

Paste these commands into **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
git pull
npm install
npm run setup:codex
```

The setup command automatically installs the skill and remembers where the library lives. You do not manually copy any skill files.

When setup finishes, completely close and reopen Codex Desktop.

## Install Impeccable

Impeccable performs the final design-quality and accessibility pass. Install it globally so every website project can use it.

Paste into **PowerShell**:

```powershell
npx impeccable skills install -y --providers=codex --scope=global
```

Then completely close and reopen Codex Desktop.

## Optional: install Higgsfield

Skip this section unless you have a Higgsfield account and want to use its credits. Codex image generation is the normal default, and Design Taste Injection works without Higgsfield.

Paste these commands into **PowerShell**, one at a time:

```powershell
npm install -g @higgsfield/cli
higgsfield auth login
npx skills add higgsfield-ai/skills --global --agent codex --yes
```

The sign-in command opens your browser. Finish signing in, then restart Codex Desktop.

## Browse the inspiration library

Browsing is optional, but useful when you want to see the cards yourself.

Paste into **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
npm run dev
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Leave that PowerShell window open while browsing. Press `Ctrl+C` in PowerShell when you want to stop the portal.

## Start a new website

1. Create a new empty folder with File Explorer, for example:

   ```text
   C:\Users\hrose\Desktop\my-new-website
   ```

2. Open Codex Desktop.
3. Choose **Open folder** and select that website folder. Do not select the `website-inspiration-library` folder.
4. Paste this into the **Codex chat**, not PowerShell:

   ```text
   $design-taste-injection
   ```

5. Answer the short questions Codex asks about the website, its purpose, its audience, and any files or requirements.
6. When visual directions are ready, Codex will give you a local Design Workbench link. Open it and choose using the options Codex presents; you do not need to locate the HTML file yourself.

That single skill invocation starts the complete workflow. You do not invoke separate commands for reference selection, hero images, variants, clone remix, or Impeccable.

## Continue a website later

Open the same website folder and return to the same Codex task. The project keeps its workflow record under `.inspiration`, so the workbench and prior decisions remain available.

If you start a new Codex task in the same website folder, paste:

```text
$design-taste-injection Resume this website from its saved workflow state.
```

## Update the library or skill

Paste into **PowerShell**:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
git pull
npm install
npm run setup:codex
```

Then restart Codex Desktop. Rerunning setup safely replaces only the Design Taste Injection installation managed by this library.

## If you move the library folder

The installed skill remembers the library’s exact folder location. If you move the `website-inspiration-library` folder, an independent website project cannot use the library again until you update that saved location.

Open PowerShell in the library’s new location and run:

```powershell
cd "NEW\LOCATION\website-inspiration-library"
npm install
npm run setup:codex
```

Replace `NEW\LOCATION` with the real location where you moved the folder.

This does **not** install a second copy of Design Taste Injection. Setup replaces the existing library-managed skill in Codex’s global skill folder and records the new library location in that same installation. The old location is removed from its configuration, so it does not remain as trash. Your independent website projects and their saved `.inspiration` work are not moved or deleted.

Completely close and reopen Codex Desktop afterward.

## Common problems

### “Could not read package.json”

PowerShell is in the wrong folder. Run:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
```

Then run the command again. `package.json` must be visible inside that folder.

### Codex does not recognize `$design-taste-injection`

Run setup again from the library folder, wait for the success message, then completely close and reopen Codex Desktop:

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
npm run setup:codex
```

### Setup refuses to replace an existing skill

Setup found a different, manually installed skill with the same name. Do not delete it blindly. Ask Codex to inspect the message and help you preserve or rename the older installation.

### PowerShell blocks an `npm` or `npx` script

Try the same command with `.cmd`, for example:

```powershell
npm.cmd run setup:codex
npx.cmd impeccable skills install -y --providers=codex --scope=global
```

### The Design Workbench is empty

Return to the Codex task and continue the intake or direction stage. The workbench begins empty and adds each direction without deleting earlier work.

### Higgsfield is unavailable

Choose Codex image generation. Higgsfield is optional and never blocks the workflow.
