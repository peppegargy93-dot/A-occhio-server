---
format: 1080x1920
duration: 37s
message: "Fatti raccontare da chi ti ha scelto"
arc: Voto alto → invisibilità su Google → targa bancone (tocco) → recensione + follower → salita → menu digitale → shooting → offerta → firma
audience: titolari di ristoranti e locali, sul telefono, autoplay muto
mode: autonomous
music: warm light acoustic, soft piano and pluck, soft percussion, ~100 bpm
---

## Video direction

- **Canvas 1080×1920, 30 fps.** One hero at a time, centered. No split-screen.
- **Safe zones (hard):** no text in the top 160 px, the bottom 260 px, or within 80 px of the sides. The burned-in caption pill lives just above the bottom 260 px (≈ y 1480–1640), so titles sit in the upper half (y 180–700) or right above the phone; nothing important in y 1460–1920 except the caption.
- **Sizes:** titles ≥ 84 px Space Grotesk 700 (numbers up to 220 px). Phones ≈ 70% of height (~1340 px tall, ~650 px wide), UI text inside ≥ 30 px.
- **Two palettes:** the FILM is Passaparola (warm white #FAF6EF, coral #B5392C accents, ochre #E2B04F stars, ink #1F1A17, grain, mascot star). The VENUE UI (plaques, venue page, digital menu) is Osteria Marea: midnight blue #123247, gold #E0B04B, white, logo = wave inside an oval. Never mix: venue screens never use coral; Passaparola titles never use venue blue.
- **Motion grammar (same as v2):** springy-not-bouncy UI arrivals (critically damped), overshoot only on the mascot; virtual camera always moving in ~1 s motivated legs inside a `.world` wrapper; titles type letter by letter; reveals on their spoken cue; deterministic, finite, `fromTo`.
- **No bookings anywhere.** No "Prenota", no WhatsApp, no reservation UI.
- **No real logos:** "Google" and "Instagram" as plain words only; generic star icon and stylized camera glyph.
- **Mascot** (assets/brand/mascot*.svg) appears in most scenes, small, never covering text.
- **Food images:** illustrated dishes in assets/food/{linguine-allo-scoglio,frittura-calamari-gamberi,polpo-alla-luciana,pescato-acqua-pazza,baba-con-crema}.svg (top-down, navy/gold background). Use them wherever a dish photo appears; crop with object-fit cover inside rounded frames.

## Frame 1 — Il voto

- scene: Osteria Marea logo + name on warm white, five gold stars light one by one, huge "4,8", then small "34 recensioni" underlined in coral
- voiceover: "Da te si mangia benissimo, e chi viene lo sa."
- duration: 3.2s
- transition_in: cut
- status: outline
- src: compositions/frames/01-voto.html
- type: hook
- blueprint: dataviz-countup (Adapt)
- sfx: sparkle; pop×5

Scene 1 (0.0–0.8s): venue logo (navy oval with gold wave) + "Osteria Marea" (navy, 84 px) spring in centered, y≈420.
Scene 2 (0.8–1.8s): five gold stars light one by one (sparkle) under the name, then "4,8" (220 px, ink) lands centered y≈900.
Scene 3 (1.8–3.2s): "34 recensioni" (56 px, muted) appears under the number with a coral underline sweep; camera slowly pushes toward it; mascot peeks bottom-right of the stars.

## Frame 2 — La ricerca

- scene: Phone (≈70% height) with search "ristoranti vicino a me": two blurred generic venues (2.341, 1.870) above Osteria Marea 4,8 · 34 recensioni circled in coral; title "Cinque stelle. Ma ti trovano in pochi."
- voiceover: "Ma su Google, chi ti cerca trova prima gli altri."
- duration: 3.4s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/02-ricerca.html
- type: problem
- blueprint: device-surface-showcase (Adapt)
- sfx: whoosh-short; click-soft; pop

Scene 1 (0.0–1.0s): title "Cinque stelle." types at top (y≈200–300); phone rises from bottom to center (y 420–1760 cropped by frame bottom is OK but its key rows sit above y 1440).
Scene 2 (1.0–2.2s): results list populates: two blurred generic rows with big review counts, then Osteria Marea row third.
Scene 3 (2.2–3.4s): coral hand-drawn circle draws around the Osteria Marea row; title completes "Ma ti trovano in pochi." (coral).

## Frame 3 — Il bancone

- scene: Counter seen from the front, dark plexi plaque in Osteria Marea colors (navy, gold logo, "Com'è andata? Tocca qui", NFC icon); a phone enters from below and touches it; coral concentric waves; title "Basta un tocco."
- voiceover: "Con Passaparola, sul bancone c'è una targa: basta avvicinare il telefono…"
- duration: 3.4s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/03-bancone.html
- type: product_intro
- blueprint: device-surface-showcase (Adapt)
- sfx: whoosh-short; nfc-beep

Scene 1 (0.0–1.2s): camera tilts down onto the counter; plaque (≈560×760, navy plexi with gold oval-wave logo, "Com'è andata?" / "Tocca qui", NFC ring) centered y≈700–1460.
Scene 2 (1.2–2.4s): phone slides up from the bottom edge and touches the plaque's NFC zone; nfc blip; three coral concentric rings radiate.
Scene 3 (2.4–3.4s): title "Basta un tocco." types at top (y≈200); camera starts zooming into the phone screen (handoff: phone screen fills frame white).

## Frame 4 — Recensione e follower

- scene: Phone (70% height) on Osteria Marea venue page: "Com'è andata?" with IT EN DE FR ES cycling; tap "Scrivi la recensione su Google" → stars fill → "Grazie di cuore" + confetti; then tap "Seguici su Instagram" → heart + "+1 follower"
- voiceover: "…e in trenta secondi ti lascia la recensione, nella sua lingua. E con un tocco, ti segue anche su Instagram."
- duration: 6.5s
- transition_in: cut
- status: outline
- src: compositions/frames/04-recensione-follower.html
- type: key_feature
- blueprint: cursor-ui-demo (Reproduce)
- sfx: click; sparkle; notification; confetti; click; pop

Scene 1 (0.0–1.0s): spring pull-back from full-white to the phone centered (y≈380–1720). Venue page: navy header with gold logo, "Osteria Marea", big "Com'è andata?", language pill row cycling IT→EN→DE→FR→ES→IT.
Scene 2 (1.0–2.4s): title "In 30 secondi." types top; tap (finger/cursor with coral trail) on gold button "Scrivi la recensione su Google" (star icon).
Scene 3 (2.4–3.8s): five stars fill, "Grazie di cuore" card springs over the phone with coral/gold confetti; title completes "Nella sua lingua."
Scene 4 (3.8–5.2s): card dismisses; tap on navy outline button "Seguici su Instagram" (stylized camera glyph).
Scene 5 (5.2–6.5s): heart pops + "+1 follower" badge; title swaps to "E un follower in più."; mascot celebrates.

## Frame 5 — Si sale

- scene: Huge "34" rolls to "300", then the search ranking: Osteria Marea climbs to #1 with an arrow; title "Più recensioni. Più in alto."
- voiceover: "Più recensioni, più in alto su Google."
- duration: 2.8s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/05-si-sale.html
- type: benefits
- blueprint: dataviz-countup (Reproduce)
- sfx: click-soft×6; whoosh-short; pop

Scene 1 (0.0–1.2s): coral counter 34→300 (220 px) centered y≈600 with "recensioni" under it; title "Più recensioni." top.
Scene 2 (1.2–2.8s): ranking card below (3 rows) reorders, Osteria Marea from #3 to #1 with coral ↑; title completes "Più in alto."

## Frame 6 — Il menu

- scene: Table from above with the menu plaque (Osteria Marea colors); tap → digital menu: header + "Oggi in cucina: Linguine allo scoglio"; categories Antipasti / Primi / Secondi / Dolci scroll with dish photos; tap a dish → sheet with big photo, allergens, "Aggiungi a La mia scelta"; bottom bar "La mia scelta · 2" → "Mostrala al cameriere"
- voiceover: "Sul tavolo c'è il tuo nuovo menu, da sfogliare col telefono: ogni piatto con la sua foto, gli allergeni e il piatto del giorno."
- duration: 8.5s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/06-menu.html
- type: key_feature
- blueprint: camera-journey (Adapt)
- sfx: whoosh-short; nfc-beep; page-swipe×2; click; pop; click

Scene 1 (0.0–1.4s): overhead table (warm wood), small navy menu plaque "Menu · Tocca qui"; phone taps it; blip; title "Il menu si tocca." top.
Scene 2 (1.4–3.0s): phone fills 70% height: navy header "Osteria Marea · Menu", gold card "Oggi in cucina: Linguine allo scoglio" with photo; language chips IT EN DE FR ES.
Scene 3 (3.0–4.8s): category tabs Antipasti → Primi → Secondi → Dolci slide; dish rows with photos scroll (polpo, linguine, frittura, pescato, babà); title swaps "Ogni piatto con la sua foto."
Scene 4 (4.8–6.6s): tap "Polpo alla luciana" → sheet slides up: big photo, allergen chips (Molluschi, Sedano, Solfiti), gold button "Aggiungi a La mia scelta".
Scene 5 (6.6–8.5s): bottom bar slides in "La mia scelta · 2" (badge pops), then its label becomes "Mostrala al cameriere".

## Frame 7 — Lo shooting

- scene: Camera viewfinder with REC over linguine from above; shutter + flash; photo shrinks and flies into the menu on a phone, with Osteria Marea color swatches beside it; title "Le foto le facciamo noi."
- voiceover: "E le foto le scattiamo noi, piatto per piatto."
- duration: 3.2s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/07-shooting.html
- type: benefits
- blueprint: kinetic-type-beats (Adapt)
- sfx: camera-shutter; whoosh-short; pop

Scene 1 (0.0–1.2s): full-frame dark viewfinder (REC · 1/250 · f2.8, grid, coral AF square) over the linguine photo; title "Le foto le facciamo noi." types top in white.
Scene 2 (1.2–1.6s): shutter + white flash.
Scene 3 (1.6–3.2s): the photo shrinks and flies into a dish slot of the menu on a phone (light background returns); two swatches navy #123247 and gold #E0B04B pop beside the phone with tiny hex labels.

## Frame 8 — L'offerta

- scene: Three icons in a row light up (camera, menu, plaque) with "Shooting · Menu · Targhe"; then "Da 400 €" big and "poi 10 € al mese" small
- voiceover: "Shooting, menu e targhe, da quattrocento euro."
- duration: 2.6s
- transition_in: crossfade
- status: outline
- src: compositions/frames/08-offerta.html
- type: cta
- blueprint: kinetic-type-beats (Adapt)
- sfx: pop×3; impact-soft
- optional: price-version-only

Scene 1 (0.0–1.2s): three coral line icons (stylized camera, menu card, NFC plaque) light up one per spoken word, labels "Shooting · Menu · Targhe" (56 px) under them, y≈500–760.
Scene 2 (1.2–2.6s): "Da 400 €" (200 px, ink, "400 €" coral) lands centered y≈1050; "poi 10 € al mese" (56 px muted) under it.

## Frame 9 — Il finale

- scene: passaparola wordmark composes as in v2 with the mascot star; "Fatti raccontare da chi ti ha scelto." below; after ~1 s "una produzione" + Alici Come Prima logo (PNG, unmodified) enters small at the bottom; closes on white, 1.2 s hold
- voiceover: "Passaparola. Fatti raccontare da chi ti ha scelto."
- duration: 4.4s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/09-finale.html
- type: brand_outro
- blueprint: logo-assemble-lockup (Reproduce)
- sfx: whoosh-short; pop; pop; chime

Scene 1 (0.0–0.8s): the two coral "p" enter from opposite sides (as v2), wordmark completes centered y≈760, ~150 px.
Scene 2 (0.8–2.0s): slogan types under it (two lines, 60 px); mascot lands and winks.
Scene 3 (2.0–3.2s): "una produzione" (36 px muted) + Alici Come Prima full logo PNG (≈360 px wide, unmodified) fade/slide up at y≈1180–1420; the dolphin PNG may do a soft entrance just before the full logo replaces it.
Scene 4 (3.2–4.4s): hold still on white (1.2 s).
