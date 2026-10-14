# Dispatch context shared by every "Verde" frame worker

- PROJECT_DIR: /home/user/A-occhio-server/videos/verde-spot · canvas 1080×1920 portrait · 30 fps.
- Read frame.md in PROJECT_DIR: it is the design spec (paper, grain, flicker, vignette, palette ink/red/green only, Depero block mannequins, speed lines to the right, Anton titles with snap + distortion, Special Elite typewriter captions, nervous RED motion vs slow GREEN motion, THE STAMP spec).
- Content is a satirical fake public-awareness campaign. Draw everything with HTML/SVG/CSS only (no images, no photos, no external video). No real people, no real party logos. The ONLY political symbol allowed anywhere is the geometric hammer and sickle of frame 07.
- Fonts via @font-face with project-root-relative paths: Anton → assets/fonts/anton-latin-400-normal.woff2; Special Elite → assets/fonts/special-elite-latin-400-normal.woff2. No other fonts.
- Captions (burned-in subtitles) are a separate root track added later: keep the band y≈1480–1640 free of titles. HARD text safe zones: no text at y<160 or y>1660, none within 80 px of the left/right edges. Titles ≥ 84 px; numbers may be 220–420 px.
- The visible copy named in your packet (titles, "FIG. N: …" captions) IS approved; do not add narration sentences as text.
- Paper ground + grain + flicker + vignette must be on every frame: build the ground as its own full-duration clip layer. Grain: a few pre-baked feTurbulence tiles (fixed seeds) swapped by the timeline every 2 frames; flicker: tiny deterministic opacity changes on a darkening overlay. Deterministic only: no Math.random, no Date.now, no CSS animations/transitions, no repeat/yoyo/infinite; fromTo entrances; one paused GSAP timeline registered as window.__timelines["<frame_id>"].
- Prefix internal ids/classes with v<NN>- (names starting with a digit are invalid selectors). Composition id and timeline key = frame_id exactly.
- Durations are estimates; the voice will be synced later by rescaling your timeline, so keep motion spread over the whole duration.
- Write ONLY your own output file(s). Do not edit STORYBOARD.md. When done run `npx hyperframes lint` in PROJECT_DIR and fix findings in your file(s). Snapshot your frame(s) in a scratch harness if you can, and check text stays in the safe zones.
