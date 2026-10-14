---
name: Verde — futurist archive campaign (9:16)
colors:
  paper: "#EFE6D2"
  ink: "#141414"
  red: "#CE2B37"
  green: "#009246"
  paper-dark: "#D9CDB2"
fonts:
  display: { family: "Anton", file: "assets/fonts/anton-latin-400-normal.woff2" }
  type: { family: "Special Elite", file: "assets/fonts/special-elite-latin-400-normal.woff2" }
---

# Verde — design spec

- Canvas 1080×1920 portrait. Ground: aged cream paper #EFE6D2 with subtle fibre/stain texture (SVG feTurbulence, fixed seed), soft vignette, archival FILM GRAIN that changes every frame deterministically (e.g. switch between 6 pre-baked grain tiles by frame index via the timeline, never Math.random), and a light brightness flicker (±3%, deterministic).
- Palette strictly: ink #141414, red #CE2B37, green #009246, paper. No other hues (greys only as ink tints).
- Shapes: flat geometric planes cut on diagonals (Depero / Balla), hard edges, no gradients except grain/vignette. People = mechanical block mannequins (cylinders, cones, rectangles; no faces beyond simple geometric eyes).
- Speed lines always point to the RIGHT.
- Titles: Anton, uppercase, enter with a snap (overshoot squash/stretch, skew, letter-scale distortion like "parole in libertà"). ≥ 84 px; numbers up to 220–400 px.
- Captions/labels: Special Elite typewriter, documentary style ("FIG. 2: LA BATTERIA"), ink on paper, typed letter by letter.
- RED part (scenes 1–7): nervous, jerky, stepped motion (steps ease, quick shakes, sudden accelerations).
- GREEN part (scenes 9–12): slow, sine/power1 eases, broken lines become soft curves, gentle sway.
- THE STAMP (identical everywhere): a rectangular rubber stamp, green #009246 ink, double border, text "VERDE" in Anton ~200 px, rotated −12°, slight ink-texture mask, lands at screen center (y≈820) with a squash + small bounce (scale 1.35→0.94→1), stays.
- Safe zones: no text y<160, y>1660, or within 80 px of the sides. Caption band (burned-in subtitles) at y≈1480–1640 — keep titles out of it.
