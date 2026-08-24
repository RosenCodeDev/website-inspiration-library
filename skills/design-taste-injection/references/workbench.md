# Design Workbench

The workbench is the project's single visual decision record:

```text
<project>/.inspiration/
|-- state.json
|-- previews/<generation-id>/index.html
`-- workbench/index.html
```

Do not create unrelated mockup files. Write state through `node <installed-skill-root>/scripts/project-state.mjs apply-event <project-root> <event.json>`; never edit `state.json` by hand.

When the first visual is ready, run `node <installed-skill-root>/scripts/serve-workbench.mjs <project-root> 4317` in the background. The server tries valid consecutive loopback ports, then asks the operating system for a free port. Report and open the exact address it prints.

## Preview contract

Render every generation at `.inspiration/previews/<generation-id>/index.html`; set `preview` to `../previews/<generation-id>/index.html`. Keep assets inside `.inspiration`. The loopback server does not expose the rest of the project. Preview frames are sandboxed; verify each preview and its media before registering it.

## Lineage

- `D01...DNN`: one direction per populated category.
- `Dxx-A...C`: variants of an approved direction.
- `Dxx-x-O`: original path.
- `Dxx-x-R`: clone-remix path.
- `...-H0`: polished code-built hero.
- `...-H1...H4`: generated hero alternatives.
- `FINAL`: approved production direction.

Every generation records ID, parent, stage, label, category, reference roles, preview, status, and creation time. Use `candidate`, `selected`, `rejected`, or `superseded`; retain history. The workbench provides stage/category filters and clickable parent/child navigation.

## H0

H0 is an intentional CSS, SVG, or justified canvas composition, never an empty rectangle. Use the category's `codeHero` guidance and approved references. Keep meaningful text and controls in HTML. Include a static or reduced-motion state.

## Presentation

Show newest work first without hiding earlier work. Support category overview, variant comparison, original versus remix, H0 versus generated heroes, status markers, references, roles, and concise rationale. New choices append to the same lineage.
