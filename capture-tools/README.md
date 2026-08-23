# Motion capture tools

This folder keeps the exact capture choreography in Git while isolating Playwright and FFmpeg from the production portal. The process is Windows-specific because it records the physical 59 Hz display and local Adreno GPU through Chrome.

## One-time setup

    cd C:\Users\hrose\Desktop\website-library\capture-tools
    npm install

The script uses Google Chrome at C:\Program Files\Google\Chrome\Application\chrome.exe and FFmpeg from PATH. On Windows ARM machines, use the x64 FFmpeg build through emulation and set its exact location before capture when it is not on PATH:

    $env:FFMPEG_PATH='C:\path\to\ffmpeg.exe'

Raw masters, Chrome profiles, logs, and contact sheets are written to the ignored repository-root `capture-work\smooth` folder.

## Capture selected sites

Close or move windows that cover the upper-left 1440×900 screen region, then run:

    $env:CAPTURE_NAMES='spade'
    $env:CAPTURE_FPS='30'
    npm run capture

Use comma-separated names to run several recipes. Valid names are spade, sstr, igloo, lusion, schemas, system-patch, coda, paper, oqoqo, and cursor.

Each take:

1. Opens hardware-accelerated Chrome with a verified 1440×900 content viewport.
2. Hides browser scrollbars before first paint.
3. Waits for fonts and visible images, and prewarms lazy sections for scrolling sites.
4. Performs the recipe-specific ambient, pointer, or requestAnimationFrame-based scroll sequence.
5. Records a minimally compressed MKV master at the requested real frame rate.
6. Encodes a muted H.264 High Profile, yuv420p, fast-start MP4 at CRF 18.
7. Writes a four-frame contact sheet for edge, typography, and animation review.

The script intentionally does not publish the result. Review cadence and the contact sheet, then copy the approved MP4 from capture-work\smooth\final into public\assets\motion. Never replace a good clip solely because a file is labelled 60 fps: publish 60 fps only if the live capture log sustains it. This computer's earlier 60 fps proof failed, so the current library uses verified 30 fps.

After publication, preserve historically useful masters, earlier takes, stills, QA images, and logs under `archive\Capture History`. Archived MKV and WebM files use Git LFS. Do not promote Chrome profiles, browser caches, or duplicate published MP4 files.

## Current recipes

| Name | Trigger | Capture intent |
|---|---|---|
| Spade | None | Hold the hero still for an eight-second excerpt of the self-animating engraved coin; never scroll. |
| SSTR | Automatic hero, then smooth scroll | Retain the loader/product opening, reveal field results and technical proof, and settle. |
| Igloo | Automatic introduction, then smooth pointer path | Let the intro settle and trigger one clear response over the central igloo. |
| Lusion | Smooth pointer path | Move deliberately through the central 3D-object area and settle. |
| Schemas | None | Record a short excerpt of the indefinite ambient canvas. |
| System Patch | Smooth scroll | Traverse the active case-study sequence to its stable endpoint. |
| Coda | Smooth scroll | Dismiss cookie UI, prewarm lazy content, then travel from hero to bottom. |
| Paper | Smooth scroll | Prewarm lazy content, then travel from landing state to the bottom. |
| Oqoqo | Smooth scroll | Decline the optional analytics dialog, keep the approved still, then travel from the evaluation hero through product proof and settle at the footer. |
| Cursor | Smooth scroll | Capture a separate 1600x1000 hero still, then travel through the agent demonstrations, research proof, changelog, and footer. |

If a site redesigns its hero, update both the recipe and that card's authored motion notes instead of forcing the old choreography onto the new page.
