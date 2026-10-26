---
name: film-con-codice
description: Guida in italiano per creare film, cartoni, spot motion graphics e videoclip con Claude Code scrivendo codice di animazione (Canvas, p5.js, Three.js) e codificando l'MP4 con FFmpeg. Usala quando l'utente vuole fare un video/film/cartone/spot/videoclip "con il codice", chiede quale repository usare tra Lemo-Opuscar, MG Styles 15, ClaudeAnimationBase, pdoom-video, PDoomVideo o le raccolte di prompt, vuole uno storyboard temporizzato, un master prompt per il film, prompt di scena/camera o la checklist finale di esportazione.
---

# Film con il codice

Claude Code non è un modello text-to-video: crea video scrivendo ed eseguendo codice di animazione che renderizza i fotogrammi, poi FFmpeg li unisce all'audio. Rispondi in italiano.

La guida completa (repository, comandi, prompt pronti, storyboard di esempio, checklist) è in `GUIDA.md` accanto a questo file. Leggi le sezioni che servono.

## Scegli il percorso

| Obiettivo | Repository | Percorso in GUIDA.md |
|---|---|---|
| Film narrativo in uno stile preciso | Lemo-Opuscar (usa la skill `lemo-opuscar`) | Percorso A |
| Cartone 2D dipinto con personaggio | ClaudeAnimationBase | Percorso B |
| Spot/logo/lancio prodotto da 10 s | MG Styles 15 | Percorso C |
| Videoclip con testo sincronizzato | pdoom-video / PDoomVideo | Percorso D |
| Idee e prompt di riferimento | awesome-opus5-5-videos, awesome-claude-5-5-videos, opus-video-prompts | solo ricerca, non eseguibili |

## Processo

1. **Concept**: messaggio, pubblico, genere, finale; una logline di una frase.
2. **Repository giusto**: clona e leggi README (e ANIMATION_GUIDE.md / docs/ se presenti). Non trattare una raccolta di prompt come progetto eseguibile.
3. **Bibbia di stile**: silhouette e volto dei personaggi, palette, tecnica, sfondi, ottiche, transizioni, identità sonora.
4. **Storyboard temporizzato**: inquadrature con inizio/fine, camera, luce, suono, note di continuità. Mostralo e fallo approvare prima di scrivere codice.
5. **Codice**: moduli di scena nella struttura del progetto; elenca le dipendenze; usa solo script che esistono davvero nel repository.
6. **Anteprime**: provini o clip a bassa risoluzione; controlla deriva dell'identità, geometrie rotte, sfarfallio, stacchi involontari, tempi.
7. **Audio**: solo musica/effetti originali o con licenza, allineati alle azioni.
8. **Esportazione**: verifica con `ffprobe -v error -show_format -show_streams <file>.mp4` e riproduci il file prima di dichiarare il successo.

Formati consigliati: social 1080×1920, 9:16, 30 fps, H.264 + AAC; orizzontale 1920×1080, 16:9, 24 o 30 fps.

Regola chiave: non saltare mai il giro di anteprima e revisione. Correggi solo le inquadrature difettose e renderizza di nuovo.

Strumenti di sistema (Node 20+/22.12+, Python 3.11+, FFmpeg, Chrome, Git): segnala all'utente quelli mancanti invece di installarli senza chiedere. Ricorda che codice gratuito non significa calcolo gratuito, e verifica sempre le licenze di musica, font e immagini.
