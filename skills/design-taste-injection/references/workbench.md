# Design Workbench

The workbench is the project’s single visual decision record:

```text
<project>/.inspiration/
├── state.json
└── workbench/
    └── index.html
```

Open it through the project’s loopback development server. Do not create a succession of unrelated mockup HTML files.

When the first visual generation is ready, run `node scripts/serve-workbench.mjs <project-root> 4317` as a background process and open `http://127.0.0.1:4317/`. If that port is occupied, use the next available local port and report the exact clickable address. Keep the server available during the workflow; the user should not need to find or open the HTML file manually.

## Lineage

- `D01…DNN`: one direction per populated category.
- `Dxx-A…C`: three variants of an approved direction.
- `Dxx-x-O`: original build path.
- `Dxx-x-R`: clone-remix path.
- `…-H0`: polished code-built hero.
- `…-H1…H4`: generated hero alternatives.
- `FINAL`: approved production direction.

Every item records `id`, parent, stage, label, category, reference roles, preview location, status, and created time. Use `selected`, `rejected`, `superseded`, or `candidate`; never delete prior decisions during normal iteration.

## H0

H0 must be an intentional visual, not an empty rectangle. Use the selected category’s `codeHero` guidance and approved references to create an original CSS, SVG, or justified canvas composition. Keep meaningful text and controls as HTML. Provide a static or reduced-motion state.

## Presentation

The workbench lists newest work first while retaining lineage navigation. It supports:

- Category overview.
- Variant comparison.
- Original versus remix comparison.
- H0–H4 hero comparison.
- Selected, pinned, excluded, and superseded markers.
- Reference names, roles, and concise rationale.

Do not hide earlier work after a selection. New choices append to state and appear in the same workbench.
