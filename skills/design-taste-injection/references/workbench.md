# Design Workbench

The workbench is the project's single visual decision record:

```text
<project>/.inspiration/
|-- evidence/<card-id>-<fingerprint>.<ext>
|-- leak-signals.json
|-- state.json
|-- previews/<generation-id>/index.html
`-- workbench/index.html
```

Write state only through `project-state.mjs apply-event`. Start the loopback workbench server with `serve-workbench.mjs` and open the exact address it prints.

## Preview import

Visual agents write only to an isolated temporary workspace. The coordinator validates output containment, permitted filenames, local references, intake leaks, exact source identity, renderability, and human identity review before atomically importing it to `.inspiration/previews/<generation-id>/`.

Every generation must resolve to `../previews/<generation-id>/index.html`. The state event is applied only after that file exists and renders.

## Direction display

Each first-pass direction shows:

- The selected source still.
- The generated hero plus opening module.
- Exactly one anchor ID and name.
- Evidence quality and inspection status.
- Recorded isolation mode.
- `SHOW ANOTHER CARD` as a normal action.

Focused category previews are direction-shopping artifacts, not complete sites.

## H0

Image-led H0 reserves the correct future-media geometry with a flat quiet stand-in and type sized around it. It cannot fill the hole with decorative CSS, SVG, canvas, fog, dithering, gradients, crop marks, or generic scenery.

For `kind:none`, follow the reviewed reason. Code-native visuals may be built as real HTML/CSS/SVG/canvas geometry. Authorized-media cards use a neutral stand-in until owned media exists.

## Later lineage

After direction approval, freeze the anchor contract, then preserve variants and implementation generations without overwriting history. The complete homepage and representative dense content page are the real design gate. Every later route records conformance to the same visual system while using page-appropriate structure.
