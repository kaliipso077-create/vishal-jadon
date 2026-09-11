# Vishal Jadon — Cinematic Static Portfolio

## Original requirement
Premium cinematic single-page portfolio for **Vishal Jadon, YouTube Growth Manager**. User rejected the original CSS-extrusion website and requested a **complete ground-up rebuild**, not a reskin. Master brief: sixteen-scene scroll-controlled film, physical YouTube button first, frame-breaking perspective, continuous reveal of authentic Vishal integrated on/around the giant button, growth storytelling, four real channel identities in a 3D ecosystem, genuine credential flying from depth to readable foreground then exiting, actual work photos, professional workspace contact finale.

### Hard constraints
- Dominant YouTube RED + WHITE; charcoal only supporting. No unrelated UI colors, dashboard, generic card grid, or separate dark sections.
- Real supplied people/photo pixels only; no generated replacement, invented pose/body parts, face edits, fake proof, statistics, testimonials, credentials, phone numbers, or clients.
- Hero text: CREATOR × STRATEGY × MONETIZE; YOUTUBE GROWTH MANAGER; supplied growth description; EXPLORE WORK.
- Contact: LET'S WORK TOGETHER, supplied supporting copy, Instagram @vishjd and Infovishaljadon@gmail.com only.
- Entire deliverable runs as **index.html + style.css + script.js + assets/**. No React, server, API, environment variable, Node, package manager, or build required by the portfolio.
- Genuine Three.js geometry/camera/occlusion, GSAP, Lenis, standalone Motion browser engine (Framer's framework-free variant), responsive recomposition, reduced motion, local assets.

## Reference assets
- `/app/reference-assets/master-reference.png`: user-supplied rough website sketch, received during rebuild. Composition reference; illustrative figures/person/fake ID in sketch NOT treated as real evidence.
- `/app/reference-assets/portrait-source.png`: actual newly supplied seated Vishal portrait, cream shirt. Original pose/face preserved. Automated mask corrected manually because both segmentation models removed his shirt. All visible pixels copied from source; no generated limbs or body.
- `/app/reference-assets/cutout-preview.jpg`: final compositing preview.
- Fish screenshot is TECHNIQUE ONLY, never included on website.
- Source proof originals under `/app/reference-assets/`; actual extracted ID and three genuine work photographs under `/app/assets/images/`.
- Real channel avatars downloaded from each actual YouTube channel, grayscale on physical identity plaques to maintain palette. No metrics shown.

## Architecture
- Canonical files: `/app/index.html`, `/app/style.css`, `/app/script.js`, `/app/assets/`.
- `/app/site/` entries are compatibility symlinks, not a second application.
- Existing preview infrastructure serves via `/app/frontend/index.html` and `/app/frontend/public/{style.css,script.js,assets}` symlinks. Template frontend/backend folders are untouched infrastructure and NOT needed in portable deliverable.
- One full-viewport WebGL world. True extruded bevelled objects, PBR materials, generated studio light environment, perspective camera, shadow floor, independently choreographed objects.
- Four scroll tracks: home450svh, work320svh, proofs560svh, contact150svh. Fixed accessible DOM overlays change with camera progress. Anchors navigate into readable holds.
- GSAP handles intro/masked type, standalone Motion handles micro-interactions, Lenis handles wheel momentum. No React runtime.
- Local vendored Three r158, GSAP3.14.2/ScrollTrigger, Lenis1.3.19, Motion12.23.26. Pinned classic Three build supports direct `file://` use; its upstream deprecation notice is a known non-error warning.
- Embedded authentic WebP texture data in `assets/textures.js` avoids `file://` texture CORS; ordinary image paths remain relative for dialogs/fallback.
- Local Manrope fonts. Optional WebGL fallback, system reduced motion and user motion toggle. All core links and contact work without backend.

## Implemented — 2026-09-11 rebuild
- Replaced ALL old HTML/CSS/JS design and geometry. Root entry point provided.
- Physical red Play Button crosses a physical portal plane with camera/object movement; no portrait before scroll. Continuous authentic seated portrait reveal with overlap/contact shadow.
- Red-white editorial hero, supplied copy, geometric growth bars/graph/smaller buttons, no unsupported numbers.
- Differently choreographed physical channel plaques for Acharya Prashant, Josh Talks Hindi, Zee Switch, Unknown Facts Hindi; genuine source avatars; correct links.
- Real Zee Switch / Zee Media credential approaches, rotates, holds readable, exits. Full-image inspection dialog retains source printed details.
- Three genuine work-context photos approach/recede separately; previous/next controls synchronize to scroll; full image inspection and correct captions.
- Fully modeled laptop, keyboard, mug, desk, notebook and shared red button contact environment.
- Minimal navigation, active states, mobile menu, focus behavior/Escape, chapter progress, one editorial marquee, motion toggle, exact mailto/Instagram.
- DPR caps1.5mobile/1.7desktop, optimized WebP, local library/font assets, single render loop, hidden-tab pause. No preserveDrawingBuffer overhead.

## QA status
- First smoke: external previewHTTP200, real WebGLcanvas, portrait=false at opening; syntax check passes.
- `/app/test_reports/iteration_1.json`: core interactions passed across320/390/768/1024/1440/1920 widths; no API calls, broken image tags or duplicate testIDs. Found critical media planes behind bevel surface and over-warm red material.
- Corrections applied: channel/image/credential fronts moved in front of actual bevel bounds; laptop screen and keyboard also corrected; neutral tone mapping, red PBR tuned; preserveDrawingBuffer removed; desk recomposed to remain in frame; fallback inert attributes corrected.
- `/app/test_reports/iteration_2.json`: rendering corrections VERIFIED across all six widths. Actual ID, channel and photo textures, true red, laptop screen/keyboard passed. All interaction regression checks passed, no API/404/server errors. Remaining headline clipping investigated separately.
- Final headline RCA: GSAP's default lag smoothing severely slowed its clock under software rendering. Disabled lag smoothing and explicitly cleared transforms on animation completion/reduced motion. Self-tested actual1920x800 and1440x900 viewports: all three full words contained in masks, computed transforms `none`.
- Direct `file:///app/index.html` tested successfully: real WebGL canvas, all embedded textures loaded, no server/build. Evidence in `test_reports/final_self_verification.json`.
- Final portable archive: `/app/assets/vishal-jadon-static.zip`, containing ONLY the three root files plus required local assets. No infrastructure templates, node_modules, dependencies to install, backend, or environment files.
- Archive verified: 29 files, 1,240,345 bytes, ZIP integrity passed, exact allowed root structure confirmed, public download HTTP200. SHA256 `20b167b8074321a7cce02c2fef15fcb0fac72ca90de912fb0f2cf439b2bfe07d`.
- Final bundle lint: explicitly bound Motion's optional AMD `define` loader to the existing global value; browser no-undef check passes (`test_reports/vendor-lint.json`). No changes to library animation behavior.
- All reported functional bugs resolved and verified. One upstream classic Three deprecation NOTICE remains, not an application error. User visual acceptance pending.

## Priorities / next tasks
### P0
- None outstanding; verification complete.
### P1
- User visual review against supplied rough sketch, especially authentic seated photo integration.
### P2
- Optional social-share image, using genuine completed hero (not fake stats or generated person).

## Credentials / links
No authentication, accounts, keys, backend, or database. See `test_credentials.md`. Current preview URL recorded in `preview_url.txt` from active environment, not prior handoff.