---
workflow: general-video
flow: automation
storyboard: yes
message: "Il verde è la soluzione a tutto (satira)"
destination: reels-tiktok
aspect: 1080x1920
fps: 30
language: it
length: ~55s
narration: yes
vo_mode: verbatim
captions: burned-in
---

## Intent

Spot satirico "Verde": finta campagna di sensibilizzazione che parodia le pubblicità istituzionali/no profit, estetica manifesto futurista italiano (Depero, Balla, Marinetti) e taglio da documentario politico. Il rosso è tutto ciò che rovina la giornata, il verde la soluzione. Tono solenne fino al ridicolo. Sottotesto (mai detto né scritto): legalizzazione della cannabis, solo dettagli fugaci (foglia nel semaforo per 6 fotogrammi, fogliolina nella batteria, "Facciamola passare", 800 420 420). "Comunismo" compare una sola volta (scena 7); falce e martello geometrica solo in scena 7. Nessun logo/simbolo di partiti reali, nessuna persona reale.

## Assets

- assets/fonts/anton-latin-400-normal.woff2 — titoli (Anton).
- assets/fonts/special-elite-latin-400-normal.woff2 — didascalie e sottotitoli (Special Elite).
- assets/inserto/inserto.mp4 — da caricare dall'utente (scena 8, con il suo audio). Fallback: 5 s riquadro grigio "INSERTO".
- Voce: due tracce caricate dall'utente (ElevenLabs), prima e dopo l'inserto.
- assets/sfx/* — timbro, clic semaforo, sniff, letto meccanico (sintetizzati), chime/pop/whoosh (libreria).
- assets/bgm/lofi-* — base lo-fi chill (MusicGen), -12 dB sotto la voce dalla scena 9.

## Customizations

- Tutto in HTML/SVG/CSS; niente foto né video esterni (tranne inserto).
- Fondo carta crema #EFE6D2 invecchiata, grana animata (deterministica), flicker leggero, vignettatura. Palette nero #141414, rosso #CE2B37, verde #009246.
- Forme geometriche piatte in diagonale, manichini meccanici a blocchi alla Depero, linee di velocità verso destra, transizioni a tagli diagonali.
- Titoli Anton (scatto + deformazione "parole in libertà"); didascalie Special Elite ("FIG. 2: LA BATTERIA").
- Parte rossa nervosa; dalla scena 9 tutto rallenta, curve morbide, ondeggiamenti.
- Tormentone: a ogni "verde" della voce, timbro diagonale VERDE al centro, sempre identico, stesso suono, piccolo rimbalzo.
- Safe zone: niente testo nei primi 160 px, ultimi 260 px, a meno di 80 px dai lati. Titoli ≥ 84 px (numeri fino a 220 px).
- Sottotitoli incisi: 1–2 righe, 44 px Special Elite, fascia nera piena, sopra il margine basso; niente sottotitoli durante l'inserto.
- Audio: rumori meccanici in crescendo nella parte rossa, silenzio totale in scena 7; lo-fi ~80 bpm dalla scena 9 a -12 dB; mix -14 LUFS, picco -1 dB.

## Notes

- Consegne: verde-spot-9x16.mp4 (H.264 faststart, con inserto); verde-spot-9x16-slot-vuoto.mp4 (riquadro INSERTO); poster JPG del frame finale; le due tracce voce in WAV.
- Prima del render finale: un frame per scena all'utente.
