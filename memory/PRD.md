# PRD — Vishal Jadon Portfolio

## Original problem statement
Build a premium, cinematic, motion-design-heavy single-page portfolio for Vishal Jadon, YouTube Growth Manager. Hard requirement: self-contained STATIC site (index.html + style.css + script.js + assets/), no React/Vite/backend/build tools. GSAP/ScrollTrigger via CDN allowed. Must-haves: 3D YouTube play button opening that bursts out of the screen; continuous camera-style transition into a hero where the real supplied photo of Vishal is physically composed with the giant play button; restrained growth visuals; a "Worked With" 3D ecosystem with the 4 real channels (Acharya Prashant, Josh Talks Hindi, Zee Switch, UNKNOWN FACTS HINDI); a proof sequence where the real extracted Zee Switch/Zee Media press ID card revolves from far away into a readable hold and physically exits; real work/event photos (no solo-portrait filler); clean contact section with Instagram @vishjd and Infovishaljadon@gmail.com only; red/white/charcoal palette; premium sans typography; responsive; reduced-motion support; no fabricated stats/clients.

## User personas
- Potential clients (creators, brands, businesses) evaluating Vishal's credibility
- Visitors arriving from Instagram/YouTube ecosystem

## Architecture
- Canonical static project: `/app/site/` (index.html, style.css, script.js, assets/images/, assets/favicon.svg) — fully portable, open or serve statically anywhere.
- Preview serving: `/app/frontend/index.html` symlinks to `/app/site/index.html`; `/app/frontend/public/{style.css,script.js,assets}` symlink into `/app/site/`. The platform Vite dev server (port 3000, supervisor-managed) serves these as static files at the public preview URL. The template FastAPI backend is unused by the site (kept running per environment rules).
- All scroll choreography: GSAP 3.12.7 + ScrollTrigger via jsDelivr CDN; CSS 3D transforms (layered extrusion for the play button), pinned scrub scenes; fonts via Fontshare CDN (Clash Display + Satoshi).
- Static fallback: default CSS is the fully composed static layout; JS enhances. `prefers-reduced-motion` skips all animation.

## Implemented (2026-09-11)
- 3D CSS-extruded play button opening (bursts out of a screen frame, settles, becomes hero stage)
- Unified opening→hero scene: real Vishal photo (supplied Josh Talks portrait, cropped/graded) composed with the button, red edge slab occluding his lower body, contact shadow
- Growth chips (audience graph draw-on, subscribers, retention bars, strategy label, play ticks) — abstract, no fake numbers
- Worked With: 4 charcoal monoliths with distinct scroll-choreographed 3D entries/exits + final clickable channel index (real names/handles/URLs only)
- Proof: real Zee Switch press ID card extracted from supplied photo (rotated/cropped/enhanced), revolves from deep space to readable hold, exits sideways into depth
- Gallery: 3 real work photos (Josh Talks studio x2, creator meeting) as floating prints entering from different directions
- Contact: LET'S GROW YOUR CHANNEL, Instagram + Email links (no YouTube contact link)
- Minimal nav (blend-mode adaptive), mobile burger menu, custom cursor, scroll progress bar
- Responsive mobile composition (reduced 3D travel, chips repositioned, zero horizontal overflow) and reduced-motion static mode
- Verified: desktop full scroll pass, mobile pass, reduced-motion pass, zero console errors, /api ingress curl OK

## Backlog
- P1: True background-cutout of the hero portrait (rembg) for even tighter physical integration
- P1: Optional WebGL/Three.js play button for real lighting/reflections
- P2: Channel thumbnail emblems (fetch real avatars) instead of typographic initials
- P2: Preloader with play-button press interaction
- P2: More supplied work photos when available
