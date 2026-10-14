---
format: 1080x1920
duration: 55s
message: "Il verde è la soluzione a tutto"
arc: Rosso persecutore (1–7) → archivio (8) → svolta verde (9) → botta e risposta (10) → bandiera (11) → firma (12)
audience: pubblico social italiano, Reels/TikTok, autoplay muto
mode: autonomous
music: none
---

## Video direction

- See frame.md. Cream archival paper, animated deterministic grain + flicker + vignette on every frame, palette ink/red/green only.
- RED part (1–7) nervous/jerky; GREEN part (9–12) slow and curvy. Diagonal-cut transitions; speed lines point right.
- THE STAMP "VERDE" (frame.md) is identical in every frame that uses it (10, 12). Build it as the same markup/CSS in each file.
- Safe zones: no text y<160, y>1660, or within 80 px of sides; caption band y≈1480–1640 stays clear of titles.
- One hero at a time, centered.

## Frame 1 — Il colore

- scene: Typewriter caption "ITALIA, OGGI." on cream paper; then a huge red disc snaps into center and pulses like a heart
- voiceover: "C'è un colore che ci perseguita da sempre, e noi facciamo finta di niente."
- duration: 4.5s
- transition_in: cut
- status: outline
- src: compositions/frames/01-colore.html
- blueprint: compose

Scene 1 (0.0–1.4s): "ITALIA, OGGI." types (Special Elite, ~64 px) at y≈360 with a typewriter caret; a tiny "FIG. 1" label above.
Scene 2 (1.4–2.2s): a red disc (~760 px) snaps in from scale 0 to center (y≈900) with a hard overshoot and diagonal speed lines shooting right.
Scene 3 (2.2–4.5s): the disc pulses like a heartbeat (double beat: 1.0→1.06→1.0→1.04→1.0 every ~0.9 s, stepped), slight camera shake on each beat.

## Frame 2 — Il semaforo

- scene: A traffic light made of black cylinders and cones crosses the screen diagonally; red lights up; cube cars crush into each other; a clock with spinning hands; title "RITARDO!"
- voiceover: "Il rosso del semaforo, quando sei già in ritardo."
- duration: 3.3s
- transition_in: cut
- status: outline
- src: compositions/frames/02-semaforo.html
- blueprint: compose

Scene 1 (0.0–1.0s): the futurist traffic light (black cylinder body, three discs, cone hood) slides in on a diagonal from bottom-left to center; caption "FIG. 2: IL SEMAFORO".
Scene 2 (1.0–2.0s): the top disc snaps red (click); below, three cube cars slam into each other accordion-style with speed lines to the right.
Scene 3 (2.0–3.3s): a round clock (black ring, cream face) with hands spinning wildly; "RITARDO!" (Anton ~170 px, red) slams in with skew distortion at y≈300.

## Frame 3 — La batteria

- scene: Giant battery with the last red notch blinking; a panicking block mannequin searching for a socket that isn't there; title "1%"
- voiceover: "Il rosso della batteria all'uno per cento, fuori casa."
- duration: 3.2s
- transition_in: cut
- status: outline
- src: compositions/frames/03-batteria.html
- blueprint: compose

Scene 1 (0.0–1.0s): giant vertical battery (ink outline, ~420×900) enters with a snap; only the bottom notch is filled red and blinks (stepped); caption "FIG. 3: LA BATTERIA".
Scene 2 (1.0–2.2s): "1%" (Anton 300 px, red) punches in at the top (y≈220–520).
Scene 3 (2.2–3.2s): a Depero block mannequin jerks left/right beside the battery, its plug-cable waving at an empty wall (a socket outline crossed out).

## Frame 4 — Il conto

- scene: A column of red digits collapses like a building; behind, a calendar makes the "27" run further away; title "27" shrinking toward the horizon
- voiceover: "Il rosso del conto, quando al ventisette mancano dodici giorni."
- duration: 3.6s
- transition_in: cut
- status: outline
- src: compositions/frames/04-conto.html
- blueprint: compose

Scene 1 (0.0–1.3s): a tall column of red digits/minus signs (e.g. "-1.247,00") stacked like a skyscraper collapses floor by floor with dust blocks; caption "FIG. 4: IL CONTO".
Scene 2 (1.3–3.6s): a tear-off calendar page with "27" (Anton 400 px) recedes into a perspective vanishing point, shrinking and jittering away; small "−12 GIORNI" stamp in red.

## Frame 5 — La maestra

- scene: Block-mannequin teacher arms folded before two identical homework sheets; a blade-shaped red pen slashes a sheet diagonally and writes a huge "4"
- voiceover: "Il rosso della penna della maestra, sul compito che avevi copiato."
- duration: 3.8s
- transition_in: cut
- status: outline
- src: compositions/frames/05-maestra.html
- blueprint: compose

Scene 1 (0.0–1.4s): teacher mannequin (cone skirt, cylinder torso, folded block arms, bun) stands behind two identical sheets with typewriter scribbles; caption "FIG. 5: LA MAESTRA".
Scene 2 (1.4–2.4s): a red pen shaped like a blade slashes one sheet diagonally (the cut splits it).
Scene 3 (2.4–3.8s): a huge red "4" (Anton 420 px) is written onto the sheet, circled.

## Frame 6 — Quante volte

- scene: Six-frame flashes: red card, engine warning light, "99+" notification dot, red motorway sticker, red weather alert; then all red elements spin into a vortex; title "QUANTE VOLTE?"
- voiceover: "Quante volte ancora?"
- duration: 2.2s
- transition_in: cut
- status: outline
- src: compositions/frames/06-quante-volte.html
- blueprint: compose

Scene 1 (0.0–1.0s): hard-cut flashes, 6 frames each (0.2 s): referee red card, engine check light icon, red dot "99+", red round motorway badge, red weather-alert triangle — each centered, huge.
Scene 2 (1.0–2.2s): all five reappear and spin into a spiral vortex around center; "QUANTE VOLTE?" (Anton 150 px, ink) slams in at y≈260.

## Frame 7 — Il comunismo

- scene: The vortex recomposes into a giant geometric hammer and sickle; music cuts; only film grain remains
- voiceover: "E poi, diciamolo, il rosso è anche il comunismo."
- duration: 4.4s
- transition_in: cut
- status: outline
- src: compositions/frames/07-comunismo.html
- blueprint: compose

Scene 1 (0.0–1.4s): red shards spinning (continuing the vortex) decelerate and lock together.
Scene 2 (1.4–4.4s): a giant flat geometric hammer and sickle (red #CE2B37, built from simple polygons/arcs, centered y≈880, ~760 px) holds still; grain and flicker intensify slightly; caption "FIG. 7" only. No other text.

## Frame 8 — L'inserto

- scene: inserto.mp4 inside a slightly tilted newspaper-clipping frame on cream paper, caption "MATERIALE D'ARCHIVIO"; fallback 5 s grey box "INSERTO"
- voiceover: ""
- duration: 5s
- transition_in: cut
- status: outline
- src: compositions/frames/08-inserto.html
- blueprint: compose

## Frame 9 — La svolta

- scene: The traffic light from scene 2 returns and switches to green; for 6 frames the green disc has a leaf cut-out; chill begins, everything slows; title "LA SOLUZIONE."
- voiceover: "Ma la soluzione c'è sempre stata."
- duration: 2.8s
- transition_in: cut
- status: outline
- src: compositions/frames/09-svolta.html
- blueprint: compose

Scene 1 (0.0–1.0s): same traffic light as frame 2, now drifting slowly; red off, bottom disc turns green (click).
Scene 2 (1.0–1.2s): for exactly 6 frames the green disc shows a 7-point leaf cut-out, then it's round again.
Scene 3 (1.2–2.8s): "LA SOLUZIONE." (Anton 140 px, green) floats in softly at y≈300; speed lines become soft curves.

## Frame 10 — Botta e risposta

- scene: The red illustrations return one at a time and turn green on each "Verde" with the stamp: traffic light (cars restart relaxed), battery fills (little leaf instead of bolt), digits climb back neatly and 27 comes close, teacher stays red on the question then on "Soprattutto la maestra" lies on a deckchair with a green pen while 4 becomes "10 e lode" green
- voiceover: "Semaforo rosso? Verde. Batteria scarica? Verde. Conto in rosso? Verde. La maestra? Soprattutto la maestra."
- duration: 6.7s
- transition_in: cut
- status: outline
- src: compositions/frames/10-botta-risposta.html
- blueprint: compose

Four beats, each a red illustration (smaller, centered) that turns green on its "Verde" with THE STAMP landing on top (stamp + same thud). Beat timings will be synced to the voice; default: semaforo 0.0–1.6, batteria 1.6–3.2, conto 3.2–4.6, maestra 4.6–6.7 (question red at 4.6, deckchair + "10 e lode" green at ~5.6; no stamp on the maestra beat).

## Frame 11 — La bandiera

- scene: Tricolour of three panels breathing like a meditation-app circle; on "rosso" the red panel stiffens into aggressive spikes; on "bianco" (sniff SFX) the white panel crumbles into dust and recomposes; on "verde" the green panel swells softly and lazily pushes the other two out until the screen is all green; title "IL VERDE È IL VERDE."
- voiceover: "Guarda la nostra bandiera. A destra il rosso: il male, tutto ciò che dobbiamo combattere. Al centro il bianco: come l'italiano medio tira avanti. E il verde è il verde. Ti fa stare chill, bro. Tranquillo."
- duration: 11.5s
- transition_in: cut
- status: outline
- src: compositions/frames/11-bandiera.html
- blueprint: compose

Scene 1 (0.0–2.0s): vertical tricolour (green | white | red left→right, each ~260×780, white = paper-light), centered, slowly breathing scale 0.96↔1.04.
Scene 2 (~2.0–5.0s, on "rosso"): the red panel's edges become jagged spikes (polygon morph), slight tremor.
Scene 3 (~5.0–8.0s, on "bianco"): sniff; the white panel crumbles into dust particles (deterministic grid of squares) and recomposes as if nothing happened.
Scene 4 (~8.0–11.5s, on "il verde è il verde"): the green panel swells softly and pushes the other two out of frame until the whole screen is green; "IL VERDE È IL VERDE." (Anton 120 px, paper color) fades in at y≈300.

## Frame 12 — Il finale

- scene: On all-green ground the last, bigger stamp "VERDE." lands, below "Facciamola passare."; then small typewriter "Numero verde 800 420 420" and the signature "Comitato per il Verde"; hold 1.2 s
- voiceover: "Verde. Facciamola passare."
- duration: 4.0s
- transition_in: cut
- status: outline
- src: compositions/frames/12-finale.html
- blueprint: compose

Scene 1 (0.0–0.8s): green ground (#009246) with paper grain; the stamp (same design, but paper-colored ink on green and 1.3× bigger, text "VERDE.") lands at center y≈760 with thud and bounce.
Scene 2 (0.8–2.0s): "Facciamola passare." (Anton 96 px, paper) slides in softly below (y≈1060).
Scene 3 (2.0–2.8s): typewriter "Numero verde 800 420 420" (Special Elite 48 px) at y≈1240 and "Comitato per il Verde" (Special Elite 40 px) at y≈1320.
Scene 4 (2.8–4.0s): hold still 1.2 s.
