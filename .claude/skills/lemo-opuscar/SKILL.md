---
name: lemo-opuscar
description: Dirige e produce un cortometraggio fatto interamente in codice, in uno degli stili della libreria Lemo-Opuscar (es. pittura a olio materica, acquerello, ukiyo-e, briefing satellitare, esploso di prodotto). Usala quando l'utente chiede un video, film, corto, promo, explainer o animazione in uno stile preciso, compresi explainer costruiti da materiale reale (immagini satellitari, scansioni laser, file CAD, scansioni d'archivio) e nuovi film montati da filmati e documenti d'archivio; quando vuole un film sul proprio tema ma non ha scelto lo stile (aiutalo a scegliere); quando vuole trasformare uno stile nel proprio, crearne uno da zero o usare uno stile salvato; quando avvia la skill senza dire cosa vuole; o quando chiede quali stili esistono. Non serve per montare, tagliare o convertire video già esistenti dell'utente.
---

# Lemo-Opuscar

Stili, guide e strumenti si trovano nella libreria Lemo-Opuscar (github.com/lemomo-ai/lemo-opuscar, licenza MIT). Questa skill la scarica e ti passa a lei. Rispondi all'utente in italiano.

1. **Prepara la libreria.** Esegui `sh "<cartella base della skill>/scripts/setup.sh"`. Clona o aggiorna la libreria (predefinito `~/lemo-opuscar`; se l'utente si trova già dentro un clone, usa quello) e stampa `LIB=<percorso>` sull'ultima riga.
2. **Installa subito gli strumenti di base.** Avvia `sh "<cartella base della skill>/scripts/setup.sh" deps` appena possibile, in background se puoi: la prima volta richiede qualche minuto. Aggiungi `deps voice` o `deps music` più avanti, solo se il film ne ha bisogno (`$LIB/TECHNIQUE.md` §1). Segnala gli strumenti di sistema mancanti (Node, ffmpeg, Python) nel tuo unico giro di domande; non installare tu software di sistema. I pacchetti richiesti da uno stile (elencati nel suo `STYLE.md`) li installi tu, nella cartella del progetto.
3. **Segui la libreria.** Leggi `$LIB/AGENTS.md` e fai ciò che dice, partendo da **Start** (gli stili dell'utente in `~/lemo-my-styles/`; se l'utente ha avviato la skill senza scrivere nulla, prima la domanda sulla lingua, poi le strade possibili): trovare lo stile o crearne uno proprio, l'unico giro di domande, il trattamento, la produzione e la consegna.

Cosa cambia in modalità skill:

| | |
|---|---|
| Cartella del progetto | `<nome>/` nella cartella da cui è partito l'utente (lettere minuscole, cifre, trattini; evita `#` e `?` nel percorso). Dove le guide dicono `films/<nome>/`, intendi questa cartella |
| Esecuzione degli strumenti | da `$LIB`, con il percorso assoluto del progetto: `cd "$LIB" && node core/render/still.mjs "<progetto>" 1.5 3` |
| File della libreria nelle pagine | URL assoluti: `/core/lib.js`, `/node_modules/three/…` (il progetto è servito su `/@film/`) |
| File della libreria in script e `build.sh` | `$LIB/…`, con `LIB=<percorso>` in cima a `build.sh`; mai `../..` |
| Sorgente delle demo | non scaricato. `sh "<cartella base della skill>/scripts/setup.sh" demo <slug>`, solo dopo aver scritto il tuo `TREATMENT.md`, per studiarne le tecniche; non va renderizzato. Eccezione: uno stile Edit & Documentary; scaricalo prima del trattamento per usare gli strumenti sui materiali che il suo `STYLE.md` indica in `demo/tools/` (`$LIB/AGENTS.md`, "Treatment first") |

Consegna ciò che elenca `$LIB/DIRECTOR.md` §11, nella cartella del progetto, e di' all'utente dove si trova.
