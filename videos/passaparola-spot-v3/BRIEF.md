---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "Fatti raccontare da chi ti ha scelto"
destination: phone-presentation-pages
aspect: 1080x1920
fps: 30
language: it
length: 36-38s
angle: problem-solution
narration: yes
vo_mode: verbatim
capture: none
captions: burned-in
---

## Intent

Versione 3 dello spot Passaparola, verticale 9:16, da guardare sul telefono dentro le pagine di presentazione inviate ai locali (autoplay muto → sottotitoli incisi). Riparte dal progetto v2 (`videos/passaparola-spot`): stessa palette Passaparola (bianco caldo #FAF6EF, corallo #B5392C, stelle ocra), stessi font (Space Grotesk / Inter), stessa stellina mascotte, stesso stile di animazione (camera sempre in movimento, transizioni a molla, testi lettera per lettera). Cambiano formato, storia, testi e finale.

Passaparola oggi: due targhe NFC + shooting del menu, per ristoranti e locali.
- Targa sul bancone → pagina del locale: pulsante "Scrivi la recensione su Google" + pulsante "Seguici su Instagram".
- Targhe sui tavoli → menu digitale interattivo: foto di ogni piatto, allergeni, piatto del giorno in cima, categorie, lista "La mia scelta" da mostrare al cameriere, cinque lingue.
- Shooting di tutto il menu, piatto per piatto; targhe e menu con l'identità del locale (colori e logo).
- Prezzo: da 400 €, poi 10 € al mese. Passaparola è una produzione Alici Come Prima.
- La prenotazione del tavolo NON esiste più: non deve comparire da nessuna parte.

## Assets

- assets/logos/alici-come-prima-logo.png — logo completo Alici Come Prima (finale, "una produzione"). Non ricolorare, deformare o ridisegnare.
- assets/logos/alici-come-prima-delfino.png — delfino da solo (entrata morbida consentita).
- assets/brand/* — mascotte stella, cursore (dalla v2).
- assets/fonts/* — Space Grotesk, Inter.
- assets/food/*.svg — 5 illustrazioni dei piatti (scelta utente: illustrazioni, niente foto generate): linguine allo scoglio, frittura di calamari e gamberi, polpo alla luciana, pescato all acqua pazza, babà con la crema.
- Voce: la registra/genera l'utente e la carica (voce maschile italiana calda, 30-40 anni, leggero accento campano ok).
- Musica: generata localmente con MusicGen (pianoforte/pluck, percussioni morbide, ~100 bpm), -12 dB sotto la voce.

## Customizations

- Formato 1080×1920, 30 fps, 36–38 s. Un protagonista alla volta, centrato; niente split-screen.
- Safe zone: nessun testo nei primi 160 px, negli ultimi 260 px, a meno di 80 px dai lati.
- Titoli ≥ 84 px (numeri fino a 220 px). Telefoni ≈ 70% dell'altezza, UI leggibile.
- Locale di esempio Osteria Marea: blu notte #123247, oro #E0B04B, logo onda dentro un ovale. Targhe e menu nei colori di Osteria Marea.
- Niente loghi ufficiali Google/Instagram né di locali reali: solo nomi scritti e icone generiche.
- Sottotitoli incisi: 1–2 righe, 44 px, pillola scura semitrasparente, sopra il margine basso, senza coprire i titoli.
- Audio: suoni piccoli e puliti (blip NFC, scorrere pagine, tap, scatto, luccichio stelle). Mix -14 LUFS, picco -1 dBTP.
- Scene sincronizzate sul voice over, non il contrario.

## Notes

- Consegne: passaparola-spot-v3-9x16.mp4 (H.264, faststart, < 6 MB); passaparola-spot-v3-9x16-senza-prezzo.mp4 (senza scena 8 e senza la frase del prezzo, ~35 s); stesse due in WebM VP9; poster JPG del frame finale; traccia voce WAV da sola.
- Prima del render finale: un frame per scena all'utente per controllo testi e leggibilità.
