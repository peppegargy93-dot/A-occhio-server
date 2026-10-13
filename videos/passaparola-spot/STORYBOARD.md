---
format: 1920x1080
duration: 30s
message: "Fatti raccontare da chi ti ha scelto"
arc: Hook (problema) → Prodotto (tocco) → Funzione 1 recensioni → Prova (salita su Maps) → Funzione 2 vetrina → Controllo (report) → Servizio (shooting) → Brand outro
audience: titolari di ristoranti, bar e attività locali italiane
mode: collaborative
music: energica ma luminosa, pop acustico moderno con percussioni leggere, ottimista, 120-128 bpm
camera: virtuale sempre in movimento — carrellate, zoom dentro i pulsanti, passaggi attraverso gli elementi; un taglio circa ogni secondo
mascot: piccola stella corallo con due occhi; accompagna la camera, salta sui pulsanti, festeggia le recensioni, occhiolino finale
---

## Video direction

- **Palette (frame.md):** canvas warm white #FAF6EF on every frame except 07 (viewfinder, ink #1F1A17). ONE accent coral #B5392C for buttons, highlights, rings, mascot, second half of each on-screen line. Ochre #E2B04F ONLY for stars. Ink #1F1A17 text, muted #6B625B secondary. White cards with soft radius (16–32px) and deep layered shadow. Light static film grain over every frame (deterministic noise overlay, ~8% opacity, no animation).
- **Type:** display = Space Grotesk 700, big, tracked +0.04em; body/UI = Inter. On-screen lines enter **letter by letter** (per-character staggered reveal, `dynamic-content-sequencing`) with a soft tick per letter group.
- **Motion grammar (brief overrides the doctrine):** the client asked for an app-like feel — **spring transitions** and a **virtual camera that never stops**. Use critically-damped springs (`springEase`, ζ≈1) for UI arrivals — springy, not bouncy; overshoot ONLY on the mascot (playful exception). Camera: every frame lives in a `.world` wrapper; the camera moves continuously as a chain of motivated legs (dolly, zoom-to-target into buttons, pass-through elements, `viewport-change` / `coordinate-target-zoom`), one leg ≈ one cut ≈ ~1s, each leg cut at peak velocity into the next (`cut-the-curve` / zoom-through from `cut-catalog.md`). Never a lazy slow drift; the motion is always going somewhere.
- **Reveal model:** nothing appears before the VO names it; each element enters on its spoken cue; everything finite (no repeat/yoyo), deterministic (no Math.random), `fromTo` entrances.
- **Recurring props:** the **mascot** (small coral star with two white eyes, inline SVG) is in every frame, riding with the camera: hops onto buttons, sad in 01, celebrates in 03/04, winks in 08. The **cursor with a coral glowing trail** (echo-trail ghosts) presses buttons in 03 and 05. The dark plexiglass **NFC plaque** appears in 02 and 05.
- **Rhythm:** densest frames 03 and 05; breather = last 0.6s of 08 (held logo). 06 settles on a held read for its last ~0.8s.
- **Negative list:** no real Google logo/brand marks (only the word "Google" in the button), no legible competitor names (blurred "••••"), no glow blooms or purple gradients, no stock photos, no browser chrome, no slideshow (front-load then freeze), no screensaver drift, no bounce on UI (mascot only), nothing in the bottom ~10% except grain.
- **Assets:** none captured — everything is drawn in HTML/SVG. Dish / kitchen / staff imagery = stylized illustrated stand-ins (flat shapes in brand palette, e.g. a plate with pasta and clams drawn in SVG), to be swapped for real shooting photos later.

## Frame 1 — Cinque stelle, pochi lettori

- scene: Scheda stile Maps di "Osteria Marea" — 4,8 ★ ma solo 34 recensioni — sotto due concorrenti sfocati con migliaia di recensioni
- voiceover: "Il tuo locale ha cinque stelle. Ma le leggono in pochi."
- duration: 4s
- transition_in: cut
- status: animated
- src: compositions/frames/01-maps-problema.html
- type: hook
- persuasion: Pain validation + Negative contrast
- beat: frustration
- asset_candidates:
- sfx: whoosh; pop; click
- blueprint: dataviz-countup (Adapt)
- focal: maps result card
- roles: maps card = cutout · competitor rows = supporting (blurred) · headline = supporting

Adapt: keep the push-THROUGH-the-data signature; the hero metric is "34 recensioni", not a count-up.
Scene 1 (0.0–1.0s): camera starts macro on five ochre stars that light one by one (`stat-bars-and-fills` star wipe) — fills frame; "Il tuo locale ha cinque stelle." 
Scene 2 (1.0–2.0s): camera dollies right along the result row revealing "Osteria Marea · 4,8 · 34 recensioni"; "34 recensioni" gets a coral underline sweep (`css-marker-patterns`).
Scene 3 (2.0–3.0s): fast pull-back (`multi-phase-camera`) reveals the Maps-style list: two blurred competitors (2.341 / 1.870) sit ABOVE Osteria Marea — asymmetric 55/45 with the card left.
Scene 4 (3.0–4.0s): on "Ma le leggono in pochi" the headline types letter by letter on the right (ink "Cinque stelle." then coral "Ma le leggono in pochi."); sad mascot peeks from behind the card corner; camera begins a push toward the counter plaque direction (handoff into 02's zoom-through).

narrativeRole: aprire sul dolore riconoscibile — la qualità c'è, la visibilità no.
keyMessage: 4,8 stelle con 34 recensioni non bastano contro chi ne ha migliaia.
Shots: (a) macro sulle 5 stelle ocra che si accendono; (b) carrellata che scopre "34 recensioni" e il testo a schermo lettera per lettera "Ma le leggono in pochi."; (c) zoom-out sulla lista: due schede concorrenti sfocate ("Trattoria ••••", "Ristorante ••••" — 2.341 e 1.870 recensioni) sopra Osteria Marea. La mascotte sbuca da dietro la scheda, un po' delusa.

## Frame 2 — Basta un tocco

- scene: Targa NFC in plexiglass scuro sul bancone; smartphone che si avvicina; onde concentriche corallo dal chip; la pagina recensioni si apre dal punto di contatto
- voiceover: "Basta un tocco."
- duration: 4s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-targa-nfc.html
- type: product_intro
- persuasion: Friction reduction
- beat: curiosity → relief
- asset_candidates:
- sfx: whoosh; soft beep; chime
- blueprint: device-surface-showcase (Adapt)
- focal: NFC plaque + phone
- roles: plaque = cutout · phone = cutout · counter surface = background

Adapt: hero device is the physical plaque; the phone completes the core loop (tap → page).
Scene 1 (0.0–1.0s): lateral dolly across the warm wooden counter (beige band lower 40%) arriving on the dark plexiglass plaque ("passaparola" wordmark, NFC ring icon, "Tocca qui per lasciarci una recensione") — plaque left-of-center.
Scene 2 (1.0–2.0s): headline "Basta un tocco." types in on the right on the VO; the phone descends from top-right on a spring, mascot riding its edge.
Scene 3 (2.0–2.8s): contact: phone presses onto the plaque (`press-release-spring`), three coral concentric rings radiate from the chip (soft beep).
Scene 4 (2.8–4.0s): camera zooms INTO the phone screen (`coordinate-target-zoom`) — the review page blooms from the contact point and fills frame (handoff_out: phone screen full-bleed, white, scale 1, opacity 1 → Frame 03 opens on the same screen).

narrativeRole: presentare il prodotto fisico con il gesto più semplice possibile.
keyMessage: un solo tocco del telefono sulla targa.
Shots: (a) carrellata laterale sul bancone fino alla targa (logo "passaparola" inciso, icona NFC); (b) il telefono entra dall'alto con la mascotte sulla spalla del cursore; (c) contatto → bip morbido, 3 onde concentriche; (d) zoom dentro lo schermo del telefono: la pagina recensioni si espande a tutto quadro (handoff verso Frame 3).

## Frame 3 — La recensione, nella sua lingua

- scene: Pagina recensioni: ovale a cammeo che si disegna attorno a "Osteria Marea", lettere una alla volta, 5 stelle che saltano in sequenza, pannello "Com'è andata?" dal basso, pulsante "Scrivi la recensione su Google" con riflesso; selettore lingua IT/EN/DE/FR/ES; stelline che si riempiono; pop up "Grazie di cuore" con coriandoli
- voiceover: "Il cliente ti lascia la recensione. In trenta secondi, nella sua lingua."
- duration: 5s
- transition_in: cut
- status: animated
- src: compositions/frames/03-pagina-recensione.html
- type: key_feature
- persuasion: Show-don't-tell proof + Friction reduction
- beat: ease + delight
- asset_candidates:
- sfx: typing; pop; pop; pop; pop; pop; click; whoosh; notification; confetti
- blueprint: cursor-ui-demo (Reproduce)
- focal: review page (phone screen)
- roles: phone = cutout · thank-you popup = supporting · headline = supporting

Scene 1 (0.0–1.0s): inside the phone (phone left 35%): coral oval cameo draws itself around the venue name (`svg-path-draw`), "Osteria Marea" emerges letter by letter. VO "Il cliente ti lascia la recensione".
Scene 2 (1.0–1.8s): five ochre stars pop in sequence (`spring-pop-entrance`, one pop SFX each); mascot hops onto the fifth star.
Scene 3 (1.8–2.8s): bottom sheet springs up: "Com'è andata?" + language pills; the selected pill slides IT→EN→DE→FR→ES→IT on "nella sua lingua"; headline right types "In 30 secondi." 
Scene 4 (2.8–3.8s): cursor with coral echo-trail sweeps in and presses "Scrivi la recensione su Google" (shine sweep across the button, `cursor-click-ripple` with a press-and-spring-back); camera zooms into the button.
Scene 5 (3.8–5.0s): Google-style star row fills (ochre wipe), then the "Grazie di cuore" card springs out to the right with a coral/ochre confetti burst (registry `confetti`); mascot celebrates (jump + spin, playful overshoot); headline completes "Nella sua lingua." in coral.

narrativeRole: mostrare l'intero percorso del cliente dal tocco alla recensione inviata.
keyMessage: lasciare la recensione è facile e veloce, in qualsiasi lingua.
Shots: (a) 0–1.2s cammeo + nome lettera per lettera; (b) 1.2–2s cinque stelle pop in sequenza (la mascotte salta sull'ultima); (c) 2–3s pannello sale, selettore lingua scorre IT→EN→DE→FR→ES e torna IT; (d) 3–4s cursore con scia preme il pulsante con riflesso, zoom dentro il pulsante; (e) 4–5s stelline Google si riempiono, pop up "Grazie di cuore" + coriandoli corallo/ocra, la mascotte festeggia. Testo a schermo: "In 30 secondi. Nella sua lingua."

## Frame 4 — Più in alto su Google

- scene: Contatore recensioni che sale da 34 a 300 mentre Osteria Marea scala la lista su Maps fino al primo posto
- voiceover: "Più recensioni. Più in alto su Google."
- duration: 3s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/04-scalata-maps.html
- type: benefits
- persuasion: Statistical proof + Future pacing
- beat: aspiration → triumph
- asset_candidates:
- sfx: notification; tick; whoosh; impact
- blueprint: dataviz-countup (Reproduce)
- focal: review counter 34→300
- roles: counter = cutout · ranking list = supporting · notification toasts = supporting

Scene 1 (0.0–1.4s): huge coral counter left counts 34→300 (`counting-dynamic-scale`, font grows with value); small notification toasts ("★ Nuova recensione · 5 stelle") spring in/out at right on each tick group; VO "Più recensioni."
Scene 2 (1.4–2.6s): on "Più in alto su Google" the ranking card at right reorders: Osteria Marea row climbs from #3 to #1 past the blurred competitors (FLIP reorder), coral border + ↑ arrow; mascot lands on top of the row.
Scene 3 (2.6–3.0s): headline "Più recensioni. Più in alto." completes letter by letter bottom-left; camera whips left (handoff into 05 push-slide).

narrativeRole: tradurre la funzione in risultato misurabile.
keyMessage: più recensioni = più visibilità.
Shots: (a) contatore grande 34 → 300 con notifiche che piovono ai lati; (b) la scheda di Osteria Marea risale la lista superando i concorrenti sfocati, spring sull'arrivo in cima; mascotte in piedi sulla scheda. Testo: "Più recensioni. Più in alto."

## Frame 5 — La tua vetrina

- scene: Seconda targa sul tavolo → il telefono apre il sito vetrina: clip del piatto in apertura, carosello piatti di casa, menu in 5 lingue, pulsante "Prenota un tavolo" che apre una chat stile WhatsApp, icone social
- voiceover: "La seconda targa apre la tua vetrina. Menu, prenotazioni, social."
- duration: 5s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-sito-vetrina.html
- type: key_feature
- persuasion: Value stacking + Rule of three
- beat: clarity + pride
- asset_candidates:
- sfx: soft beep; whoosh; click; click; pop
- blueprint: camera-journey (Adapt, sub-shape A: action roundtrip)
- focal: showcase website in phone
- roles: table plaque = supporting · phone = cutout · WhatsApp bubble = supporting

Adapt: the journey travels plaque → phone site → chat bubble; keep the dive-in → fire → travel-to-consequence signature.
Scene 1 (0.0–1.0s): table-top plaque (smaller, tilted) gets a tap, coral rings; VO "La seconda targa apre la tua vetrina".
Scene 2 (1.0–2.0s): dive into the phone: site hero with an illustrated dish (slow Ken Burns), "Osteria Marea" title types in.
Scene 3 (2.0–3.0s): carousel of 3 illustrated dishes slides left; on "Menu" the menu chips IT EN DE FR ES pop; right column "Menu." appears.
Scene 4 (3.0–4.0s): on "prenotazioni" cursor with trail presses "Prenota un tavolo" → camera travels right to a green chat bubble "Ciao! Un tavolo per 4 stasera?"; "Prenotazioni." appears.
Scene 5 (4.0–5.0s): on "social" three social icon circles pop under the button; "Social." appears in coral; mascot taps the last icon.

narrativeRole: seconda funzione — il cliente scopre e prenota.
keyMessage: menu, prenotazioni e social in un tocco.
Shots: (a) targa sul tavolo, tocco, onde; (b) hero del sito con il piatto (lento Ken Burns) e titolo "Osteria Marea"; (c) carosello dei piatti che scorre; (d) menu con chip lingua IT EN DE FR ES; (e) cursore preme "Prenota un tavolo" → bolla chat verde "Ciao! Un tavolo per 4 stasera?"; (f) riga icone social pop. Testo a scatti sincronizzato: "Menu." "Prenotazioni." "Social."

## Frame 6 — Ogni mese sai come va

- scene: Report mensile: tocchi sulla targa, recensioni nuove, media del mese, barre che crescono settimana dopo settimana
- voiceover: "E ogni mese sai come sta andando."
- duration: 4s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-report.html
- type: benefits
- persuasion: Risk reversal (controllo)
- beat: control + peace of mind
- asset_candidates:
- sfx: whoosh; tick; pop
- blueprint: grid-card-assemble (Adapt)
- focal: monthly report card
- roles: report card = cutout · metric tiles = supporting · weekly bars = supporting

Scene 1 (0.0–1.0s): the "Report di ottobre" card springs up from below into center (wide, ~85% width); VO "E ogni mese".
Scene 2 (1.0–2.4s): three metric tiles assemble left to right and count: 1.284 tocchi · +87 recensioni · ★ 4,9 media.
Scene 3 (2.4–3.2s): four weekly bars grow in sequence (`stat-bars-and-fills`) as the camera glides right along them.
Scene 4 (3.2–4.0s): headline "E ogni mese sai come va." types under the card; held read, mascot gives a small nod; camera pushes toward the bars → zoom-through into 07.

narrativeRole: rassicurare: i risultati si vedono.
keyMessage: un report chiaro ogni mese.
Shots: (a) card "Report di ottobre" entra a molla; (b) tre metriche contano: 1.284 tocchi · +87 recensioni · media 4,9 ★; (c) 4 barre settimanali crescono in sequenza, camera che scivola lungo il grafico.

## Frame 7 — Le foto le facciamo insieme

- scene: Mirino della fotocamera: inquadra un piatto, le mani in cucina, un ritratto dello staff; flash bianco a ogni scatto
- voiceover: "Le foto? Le facciamo insieme, da te."
- duration: 3s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-shooting.html
- type: benefits
- persuasion: Authority by association (servizio fatto bene) + Friction reduction
- beat: trust + warmth
- asset_candidates:
- sfx: camera shutter; camera shutter; camera shutter
- blueprint: kinetic-type-beats (Adapt)
- focal: camera viewfinder
- roles: viewfinder = background · illustrated subjects = cutout · thumbnails strip = supporting

Adapt: the beats are three shutter frames instead of words; the line is the payoff.
Scene 1 (0.0–1.0s): dark viewfinder UI (rule-of-thirds grid, coral AF square, "● REC 1/250 f2.8"); AF locks on an illustrated plated dish → white flash + shutter, thumbnail flies to the strip top-right. VO "Le foto?"
Scene 2 (1.0–2.0s): whip to hands plating in the kitchen (illustrated) → flash + shutter.
Scene 3 (2.0–3.0s): whip to a smiling staff portrait (illustrated, faceless-friendly) → flash + shutter; headline "Le foto? Le facciamo insieme, da te." types bottom-left (white + light coral).

narrativeRole: chiudere sul valore umano: è un servizio, non solo un gadget.
keyMessage: lo shooting nel tuo locale è incluso nel percorso.
Shots: tre micro-scatti da ~1s ciascuno dentro un mirino (griglia, punto AF corallo): piatto → mani che impiattano → ritratto staff; flash bianco + scatto su ognuno.

## Frame 8 — Passaparola

- scene: Logo wordmark minuscolo "passaparola" con le due p speculari che si passano la parola; slogan "Fatti raccontare da chi ti ha scelto."; la mascotte fa l'occhiolino
- voiceover: "Passaparola. Fatti raccontare da chi ti ha scelto."
- duration: 3.9s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/08-logo.html
- type: brand_outro
- persuasion: Belonging
- beat: warmth + inevitability
- asset_candidates:
- sfx: whoosh; chime
- blueprint: logo-assemble-lockup (Reproduce)
- focal: passaparola wordmark
- roles: wordmark = cutout · slogan = supporting · mascot = supporting

Scene 1 (0.0–0.8s): on warm white, the two coral "p" enter from opposite sides like two speech bubbles (small bubble tails) and face each other at their final positions; VO "Passaparola."
Scene 2 (0.8–1.6s): the remaining letters "assa" "arola" fill in between/after them (per-character reveal) into the centered lowercase wordmark.
Scene 3 (1.6–2.5s): slogan "Fatti raccontare da chi ti ha scelto." types letter by letter beneath; mascot lands next to the wordmark and winks. Hold still to the end (only final exit: none — the spot ends on the held logo).

narrativeRole: firma del brand.
keyMessage: Passaparola — fatti raccontare da chi ti ha scelto.
Shots: (a) le due "p" entrano da lati opposti come due fumetti e si specchiano; (b) il resto del wordmark si compone; (c) slogan lettera per lettera; (d) mascotte atterra sul punto finale e fa l'occhiolino.
