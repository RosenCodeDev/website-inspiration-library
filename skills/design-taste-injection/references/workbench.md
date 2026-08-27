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

The sealed API response is materialized only in a temporary workspace. The coordinator validates output containment, permitted filenames, local references, intake leaks, exact source identity, renderability, and H0 evidence before atomically importing it to `.inspiration/previews/<generation-id>/`.

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

Image-led H0 reserves the correct future-media geometry with an empty marked slot, opaque flat stand-in, and type sized around it. Protected copy is a sibling of the slot and may overlap it geometrically. The coordinator rejects child content, media, gradients, masks, filters, pseudo-element scenery, animation, transparency that exposes ancestor imagery, invalid geometry, and excessive rendered color/edge/luminance complexity.

The generator never supplies its own validation claim. After DOM, computed-style, and rendered-pixel checks, the coordinator writes `output-contract.json` from observations. Golden passing and failing fixtures pin the pixel thresholds across supported render environments.

For `kind:none`, follow the reviewed reason and `permittedMethod`. Code-native H0 must expose its defining visual through `data-code-native-hero="<permitted-method>"`; the coordinator verifies the method, visible geometry, and nonempty visual. Authorized-media cards use the same neutral reserved-slot validation until owned media exists.

## Later lineage

After direction approval, freeze the anchor contract, then preserve variants and implementation generations without overwriting history. The complete homepage and representative dense content page are the real design gate. Every later route records conformance to the same visual system while using page-appropriate structure.
