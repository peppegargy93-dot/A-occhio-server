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

## Frame 1 — Cinque stelle, pochi lettori

- scene: Scheda stile Maps di "Osteria Marea" — 4,8 ★ ma solo 34 recensioni — sotto due concorrenti sfocati con migliaia di recensioni
- voiceover: "Il tuo locale ha cinque stelle. Ma le leggono in pochi."
- duration: 4s
- transition_in: cut
- status: built
- src: compositions/frames/01-maps-problema.html
- type: hook
- persuasion: Pain validation + Negative contrast
- beat: frustration
- blueprint: dataviz-countup
- asset_candidates:
- sfx: whoosh; pop; click

narrativeRole: aprire sul dolore riconoscibile — la qualità c'è, la visibilità no.
keyMessage: 4,8 stelle con 34 recensioni non bastano contro chi ne ha migliaia.
Shots: (a) macro sulle 5 stelle ocra che si accendono; (b) carrellata che scopre "34 recensioni" e il testo a schermo lettera per lettera "Ma le leggono in pochi."; (c) zoom-out sulla lista: due schede concorrenti sfocate ("Trattoria ••••", "Ristorante ••••" — 2.341 e 1.870 recensioni) sopra Osteria Marea. La mascotte sbuca da dietro la scheda, un po' delusa.

## Frame 2 — Basta un tocco

- scene: Targa NFC in plexiglass scuro sul bancone; smartphone che si avvicina; onde concentriche corallo dal chip; la pagina recensioni si apre dal punto di contatto
- voiceover: "Basta un tocco."
- duration: 4s
- transition_in: zoom-through
- status: built
- src: compositions/frames/02-targa-nfc.html
- type: product_intro
- persuasion: Friction reduction
- beat: curiosity → relief
- blueprint: device-surface-showcase
- asset_candidates:
- sfx: whoosh; soft beep; chime

narrativeRole: presentare il prodotto fisico con il gesto più semplice possibile.
keyMessage: un solo tocco del telefono sulla targa.
Shots: (a) carrellata laterale sul bancone fino alla targa (logo "passaparola" inciso, icona NFC); (b) il telefono entra dall'alto con la mascotte sulla spalla del cursore; (c) contatto → bip morbido, 3 onde concentriche; (d) zoom dentro lo schermo del telefono: la pagina recensioni si espande a tutto quadro (handoff verso Frame 3).

## Frame 3 — La recensione, nella sua lingua

- scene: Pagina recensioni: ovale a cammeo che si disegna attorno a "Osteria Marea", lettere una alla volta, 5 stelle che saltano in sequenza, pannello "Com'è andata?" dal basso, pulsante "Scrivi la recensione su Google" con riflesso; selettore lingua IT/EN/DE/FR/ES; stelline che si riempiono; pop up "Grazie di cuore" con coriandoli
- voiceover: "Il cliente ti lascia la recensione. In trenta secondi, nella sua lingua."
- duration: 5s
- transition_in: cut
- status: built
- src: compositions/frames/03-pagina-recensione.html
- type: key_feature
- persuasion: Show-don't-tell proof + Friction reduction
- beat: ease + delight
- blueprint: cursor-ui-demo
- asset_candidates:
- sfx: typing; pop; pop; pop; pop; pop; click; whoosh; notification; confetti

narrativeRole: mostrare l'intero percorso del cliente dal tocco alla recensione inviata.
keyMessage: lasciare la recensione è facile e veloce, in qualsiasi lingua.
Shots: (a) 0–1.2s cammeo + nome lettera per lettera; (b) 1.2–2s cinque stelle pop in sequenza (la mascotte salta sull'ultima); (c) 2–3s pannello sale, selettore lingua scorre IT→EN→DE→FR→ES e torna IT; (d) 3–4s cursore con scia preme il pulsante con riflesso, zoom dentro il pulsante; (e) 4–5s stelline Google si riempiono, pop up "Grazie di cuore" + coriandoli corallo/ocra, la mascotte festeggia. Testo a schermo: "In 30 secondi. Nella sua lingua."

## Frame 4 — Più in alto su Google

- scene: Contatore recensioni che sale da 34 a 300 mentre Osteria Marea scala la lista su Maps fino al primo posto
- voiceover: "Più recensioni. Più in alto su Google."
- duration: 3s
- transition_in: zoom-through
- status: built
- src: compositions/frames/04-scalata-maps.html
- type: benefits
- persuasion: Statistical proof + Future pacing
- beat: aspiration → triumph
- blueprint: dataviz-countup
- asset_candidates:
- sfx: notification; tick; whoosh; impact

narrativeRole: tradurre la funzione in risultato misurabile.
keyMessage: più recensioni = più visibilità.
Shots: (a) contatore grande 34 → 300 con notifiche che piovono ai lati; (b) la scheda di Osteria Marea risale la lista superando i concorrenti sfocati, spring sull'arrivo in cima; mascotte in piedi sulla scheda. Testo: "Più recensioni. Più in alto."

## Frame 5 — La tua vetrina

- scene: Seconda targa sul tavolo → il telefono apre il sito vetrina: clip del piatto in apertura, carosello piatti di casa, menu in 5 lingue, pulsante "Prenota un tavolo" che apre una chat stile WhatsApp, icone social
- voiceover: "La seconda targa apre la tua vetrina. Menu, prenotazioni, social."
- duration: 5s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/05-sito-vetrina.html
- type: key_feature
- persuasion: Value stacking + Rule of three
- beat: clarity + pride
- blueprint: camera-journey
- asset_candidates:
- sfx: soft beep; whoosh; click; click; pop

narrativeRole: seconda funzione — il cliente scopre e prenota.
keyMessage: menu, prenotazioni e social in un tocco.
Shots: (a) targa sul tavolo, tocco, onde; (b) hero del sito con il piatto (lento Ken Burns) e titolo "Osteria Marea"; (c) carosello dei piatti che scorre; (d) menu con chip lingua IT EN DE FR ES; (e) cursore preme "Prenota un tavolo" → bolla chat verde "Ciao! Un tavolo per 4 stasera?"; (f) riga icone social pop. Testo a scatti sincronizzato: "Menu." "Prenotazioni." "Social."

## Frame 6 — Ogni mese sai come va

- scene: Report mensile: tocchi sulla targa, recensioni nuove, media del mese, barre che crescono settimana dopo settimana
- voiceover: "E ogni mese sai come sta andando."
- duration: 4s
- transition_in: crossfade
- status: built
- src: compositions/frames/06-report.html
- type: benefits
- persuasion: Risk reversal (controllo)
- beat: control + peace of mind
- blueprint: grid-card-assemble
- asset_candidates:
- sfx: whoosh; tick; pop

narrativeRole: rassicurare: i risultati si vedono.
keyMessage: un report chiaro ogni mese.
Shots: (a) card "Report di ottobre" entra a molla; (b) tre metriche contano: 1.284 tocchi · +87 recensioni · media 4,9 ★; (c) 4 barre settimanali crescono in sequenza, camera che scivola lungo il grafico.

## Frame 7 — Le foto le facciamo insieme

- scene: Mirino della fotocamera: inquadra un piatto, le mani in cucina, un ritratto dello staff; flash bianco a ogni scatto
- voiceover: "Le foto? Le facciamo insieme, da te."
- duration: 3s
- transition_in: zoom-through
- status: built
- src: compositions/frames/07-shooting.html
- type: benefits
- persuasion: Authority by association (servizio fatto bene) + Friction reduction
- beat: trust + warmth
- blueprint: kinetic-type-beats
- asset_candidates:
- sfx: camera shutter; camera shutter; camera shutter

narrativeRole: chiudere sul valore umano: è un servizio, non solo un gadget.
keyMessage: lo shooting nel tuo locale è incluso nel percorso.
Shots: tre micro-scatti da ~1s ciascuno dentro un mirino (griglia, punto AF corallo): piatto → mani che impiattano → ritratto staff; flash bianco + scatto su ognuno.

## Frame 8 — Passaparola

- scene: Logo wordmark minuscolo "passaparola" con le due p speculari che si passano la parola; slogan "Fatti raccontare da chi ti ha scelto."; la mascotte fa l'occhiolino
- voiceover: "Passaparola. Fatti raccontare da chi ti ha scelto."
- duration: 3s
- transition_in: blur-crossfade
- status: built
- src: compositions/frames/08-logo.html
- type: brand_outro
- persuasion: Belonging
- beat: warmth + inevitability
- blueprint: logo-assemble-lockup
- asset_candidates:
- sfx: whoosh; chime

narrativeRole: firma del brand.
keyMessage: Passaparola — fatti raccontare da chi ti ha scelto.
Shots: (a) le due "p" entrano da lati opposti come due fumetti e si specchiano; (b) il resto del wordmark si compone; (c) slogan lettera per lettera; (d) mascotte atterra sul punto finale e fa l'occhiolino.
