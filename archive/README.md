# Development Archive

This directory contains source material and historical evidence used to curate the portal. Nothing here is required by the running Vite application; runtime media lives under `public/assets`.

- `Example Websites Images` contains the 25 user-approved source images.
- `Example Websites Links` contains the supplied website lists.
- `Website Library Tutorial Example` contains the tutorial UI screenshots.
- `Prompts` contains the original project prompt.
- `Superseded Source Images` preserves replaced uploads and YouTube frames byte-for-byte.
- `Capture History` preserves unique raw recordings, masters, stills, QA images, and capture logs.

The MKV and WebM files under `Capture History` use Git LFS. A normal clone without Git LFS can still install, test, build, and run the portal because only the historical recordings become pointer files. To retrieve the full recording archive:

```powershell
git lfs install
git lfs pull --include="archive/Capture History/**"
npm run verify:archive
```

Keep `Capture History` immutable where practical. A modified LFS recording is stored as another complete object and consumes additional storage.
