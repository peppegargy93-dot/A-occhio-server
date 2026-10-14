Shared brand assets for every frame (use these, do not redraw):
- mascot.svg / mascot-sad.svg / mascot-wink.svg — the coral star mascot (inline the SVG markup if you need to animate the eyes; keep geometry identical).
- cursor.svg — the cursor arrow; add the coral glowing trail via compositions/components/echo-trail.html.
- Fonts: assets/fonts/space-grotesk-latin-{400,500,600,700}-normal.woff2 (display), assets/fonts/inter-latin-{400,500,600,700}-normal.woff2 (body/UI).
- Wordmark: lowercase "passaparola" in Space Grotesk 700, both "p" (1st and 6th letters) in coral #B5392C, rest ink #1F1A17.
- Grain: a static deterministic noise overlay (SVG feTurbulence with fixed seed, ~8% opacity, no animation) on top of every frame.
