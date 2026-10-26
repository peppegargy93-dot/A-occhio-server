# Strumenti utilizzati

Regia e codice con l'IA — Claude Code ([Claude Code ufficiale](https://code.claude.com/docs/en/overview))
Repository di produzione — GitHub ([github.com](https://github.com/))
Rendering dei fotogrammi — Chrome / Canvas / WebGL / p5.js (dipende dal progetto)
Codifica video — FFmpeg ([ffmpeg.org](https://ffmpeg.org/))

> **IL TUO FLUSSO DI LAVORO — DALL'IDEA ALL'MP4**
>
> Scegli 1 degli 8 repository. Crea una storia, scegli lo stile e scrivi uno storyboard con i tempi.
>
> Claude scrive il codice delle scene. Il progetto renderizza ogni fotogramma, poi unisce immagine e audio con licenza.
>
> IDEA → STORYBOARD → CODICE → ANTEPRIMA → ESPORTAZIONE

# Cosa contiene questa guida

Otto link verificati a repository GitHub, un piano di installazione adatto ai principianti, quattro percorsi di produzione distinti, un master prompt modificabile per il film, uno storyboard di sei inquadrature, prompt di scena riutilizzabili, esempi reali di rendering e controlli di qualità finali.

Importante: di norma Claude Code crea video scrivendo ed eseguendo codice di animazione; non è di per sé un modello text-to-video. Alcuni link sono progetti completi, altri sono esempi o librerie di ricerca.

# 8 repository GitHub verificati

Tutti gli otto link qui sotto compaiono nel carosello di 10 slide fornito. Sono stati controllati sulle rispettive pagine pubbliche di GitHub il 25 ottobre 2026.

## 01. Lemo-Opuscar

Skill per fare film; 59 stili cinematografici renderizzati via codice.

<https://github.com/lemomo-ai/lemo-opuscar>

## 02. MG Styles 15

15 film di motion graphics generati via codice, pronti da studiare.

<https://github.com/Vincentwei1021/mg-styles-15>

## 03. ClaudeAnimationBase

Kit di partenza per animazione 2D di personaggi con 31 emozioni recitate.

<https://github.com/JohnHeibel/ClaudeAnimationBase>

## 04. pdoom-video

Videoclip con testo sincronizzato parola per parola e renderer Three.js.

<https://github.com/mexicat/pdoom-video>

## 05. PDoomVideo

Progetto sorgente di videoclip cartoon in p5.js / p5.brush.

<https://github.com/JohnHeibel/PDoomVideo>

## 06. Awesome Opus 5.5 Videos

Raccolta curata di prompt; 703 prompt registrati nel README.

<https://github.com/yihui-dev/awesome-opus5-5-videos>

## 07. Awesome Claude 5.5 Videos

Indice di ricerca di 424 post originali di creator.

<https://github.com/athemeroy/awesome-claude-5-5-videos>

## 08. Opus Video Prompts

18 prompt pronti da copiare e 54 casi di riferimento.

<https://github.com/joeseesun/opus-video-prompts>

# Guida ai repository — Film e motion

## 01. Lemo-Opuscar — 59 stili

**Repository:** <https://github.com/lemomo-ai/lemo-opuscar>

**TIPO:** Plugin / toolkit installabile per fare film con Claude.

Fornisce istruzioni di stile, DIRECTOR.md, TECHNIQUE.md e rendering dei fotogrammi via codice. Il README attuale descrive 59 stili di libreria, con la possibilità di crearne o personalizzarne di propri.

**COME SI USA:** Installa il plugin, chiedi un film di 15–45 secondi in uno stile preciso, approva lo storyboard, lascia che Claude generi le scene, guarda le anteprime e renderizza un MP4.

**DA RICORDARE:** Servono accesso a Claude, Node 20+, Python 3.11+ e FFmpeg. Il formato predefinito pubblicato è 1920×1080 a 24 fps; puoi cambiarlo su richiesta.

## 02. MG Styles 15 — Motion graphics

**Repository:** <https://github.com/Vincentwei1021/mg-styles-15>

**TIPO:** Esempi di codice, prompt e un sistema di rendering modificabile.

Quindici esempi da 10 secondi coprono 2D, isometrico, vettoriale, 3D in stile Blender, pixel art, forme liquide e tipografia cinetica. Ogni esempio include il suo prompt creativo e i file di progetto.

**COME SI USA:** Clona il repository, scegli uno stile in prompts/, sostituisci il suo «Creative seed», poi lascia che Claude aggiorni l'animazione. Usa il sistema di rendering Chrome/FFmpeg documentato.

**DA RICORDARE:** Non è un modello text-to-video. Possono servire Node 22.12+, Chrome, FFmpeg e Python; Blender serve solo per la demo 3D.

> **SCELTA RAPIDA**
>
> Per un film narrativo, parti da Lemo-Opuscar. Per la presentazione di un prodotto, un'animazione di logo o uno spot di 10 secondi, parti da MG Styles 15.

# Guida ai repository — Cartoni e testi

## 03. ClaudeAnimationBase — Cartoni 2D

**Repository:** <https://github.com/JohnHeibel/ClaudeAnimationBase>

**TIPO:** Starter funzionante per cartoni in p5.js / p5.brush.

Il repository include un personaggio ricorrente, Clawd, 31 riferimenti di emozioni, una pagina «studio», componenti di animazione riutilizzabili e ANIMATION_GUIDE.md.

**COME SI USA:** Clonalo, leggi ANIMATION_GUIDE.md, sostituisci la storia demo con la tua trama, chiedi a Claude una lista di inquadrature, poi avvia e controlla il render. Puoi sostituire il personaggio con il tuo usando i tuoi riferimenti.

**DA RICORDARE:** Gli effetti di riempimento ad acquerello possono essere lenti senza una GPU dedicata; uno stile di pennello più semplice riduce i tempi di render.

## 04. pdoom-video — Videoclip con testo

**Repository:** <https://github.com/mexicat/pdoom-video>

**TIPO:** Sorgente completo di videoclip e motore di rendering deterministico.

Usa TypeScript, Three.js, Bun/Vite, sincronizzazione del testo e analisi audio. Il progetto originale esporta fotogrammi ad alta risoluzione sincronizzati con la musica.

**COME SI USA:** Studia docs/TREATMENT.md e docs/ENGINE.md. Sostituisci il concept del film e usa audio/testi tuoi con licenza, poi costruisci le finestre delle scene sui tempi di battute e parole.

**DA RICORDARE:** È un progetto da studiare/adattare, non un generatore «un clic» per canzoni nuove. Verifica i diritti sull'audio e le dipendenze tecniche.

# Guida ai repository — Animazione e idee

## 05. PDoomVideo — Animazione musicale dipinta

**Repository:** <https://github.com/JohnHeibel/PDoomVideo>

**TIPO:** Progetto funzionante di animazione musicale e rendering in p5.js.

Contiene STORYBOARD.md, ANIMATION_GUIDE.md, capitoli di scena e una pipeline di rendering da Chrome headless a FFmpeg. Mostra come una canzone possa diventare una serie di idee visive illustrate.

**COME SI USA:** Studia la guida all'animazione e lo storyboard; poi fai riscrivere a Claude il trattamento per la tua musica originale, il tuo personaggio e le tue sequenze. Usa lo script di render documentato.

**DA RICORDARE:** Usa solo audio, grafica ed elementi di cui hai i diritti. Tieni la demo originale separata dal tuo progetto commerciale.

## 06. Awesome Opus 5.5 Videos — Prompt

**Repository:** <https://github.com/yihui-dev/awesome-opus5-5-videos>

**TIPO:** Raccolta di ricerca e di prompt, non un motore per film.

Il README elenca 703 prompt con i link ai creator originali e una parte di demo ricreate. Aiuta a confrontare approcci di motion, visualizzazione, 3D ed explainer.

**COME SI USA:** Apri un file di prompt, studia i tempi e le indicazioni visive, poi adatta l'approccio nel repository di lavoro scelto. Claude può trasformare il prompt modificato in codice sorgente.

**DA RICORDARE:** Alcune voci contengono prompt parziali o solo una descrizione del creator. Non dare per scontato che ogni video mostrato sia riproducibile direttamente.

# Guida ai repository — Ricerca e casi di prompt

## 07. Awesome Claude 5.5 Videos — Directory

**Repository:** <https://github.com/athemeroy/awesome-claude-5-5-videos>

**TIPO:** Directory di ricerca con link alle fonti e guide al flusso di lavoro.

Organizza 424 post originali per modello e tipo di produzione, inclusi animazione 2D, explainer, scene 3D e trasformazioni di filmati. La documentazione distingue le affermazioni riportate dalla verifica diretta.

**COME SI USA:** Cerca un film simile al tuo, esamina il post originale, rivedi le note di produzione, poi scegli un metodo tecnico adatto al tuo progetto.

**DA RICORDARE:** L'indice di ricerca non è una skill installabile per fare film. I dettagli sul modello riportati dai creator non sono una prova indipendente del processo di generazione.

## 08. Opus Video Prompts — 18 prompt

**Repository:** <https://github.com/joeseesun/opus-video-prompts>

**TIPO:** Raccolta di prompt e casi studio, non un renderer autonomo.

Raccoglie 18 prompt completi, 54 casi pubblici e diversi metodi di produzione video via codice (Canvas, p5.js, Three.js, Remotion, Manim e altri).

**COME SI USA:** Scegli un prompt adatto alla tua idea, cambia soggetto e dettagli del brand, poi eseguilo in Claude Code e usa il framework giusto per anteprima e render.

**DA RICORDARE:** Un prompt da solo non garantisce un file video; il risultato dipende dalle dipendenze, dagli asset sorgente e dalla potenza di calcolo disponibili.

> **NOTA SULLE FONTI**
>
> I numeri dei repository sono quelli riportati nei README collegati e possono cambiare. Verifica la licenza attuale di codice, musica di esempio, font, foto e texture prima di pubblicare.

# Guida all'installazione passo per passo

## Passo 01 — Installa gli strumenti principali

Installa Claude Code, Git, Chrome, FFmpeg e Node.js. Python è consigliato per la generazione audio e per alcuni progetti. Lemo-Opuscar richiede Node 20+; MG Styles 15 consiglia Node 22.12+; Python 3.11+ è una buona base.

Link ufficiali:

> Claude Code — <https://code.claude.com/docs/en/overview>
>
> Node.js — <https://nodejs.org/>
>
> Git — <https://git-scm.com/>
>
> Python — <https://www.python.org/>
>
> FFmpeg — <https://ffmpeg.org/>
>
> Google Chrome — <https://www.google.com/chrome/>

## Passo 02 — Verifica l'installazione

```
node --version
python --version
git --version
ffmpeg -version
claude --version
```

Su macOS/Linux il comando può essere python3 invece di python. Se un comando fallisce, segui le istruzioni ufficiali di installazione di quello strumento prima di continuare.

## Passo 03 — Crea la cartella del film

```
mkdir my-claude-movie
cd my-claude-movie
claude
```

Accedi con un account Claude abilitato o configura l'accesso via API. Valuta i costi previsti di Claude e del rendering: codice gratuito su GitHub non significa necessariamente calcolo gratuito.

# Percorso A — Il tuo primo film cinematografico

## Passo 01 — Installa Lemo-Opuscar

Usa un terminale di sistema. I due comandi CLI qui sotto vengono dalla documentazione del repository:

```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

## Passo 02 — Crea una storia originale

Scrivi un brief semplice: un soggetto, un obiettivo, un ostacolo, un finale soddisfacente. Per una prima prova usa 15–30 secondi invece di una narrazione complessa di più minuti.

## Passo 03 — Incolla questa richiesta modificabile

```
Crea un film animato ad acquerello di 30 secondi in 9:16.
Titolo: L'ULTIMA LUCE.
Storia: una piccola volpe arancione scopre un fiore luminoso
in una città abbandonata; toccandolo risveglia la città
e rivela un'alba piena di speranza.
Prima di scrivere codice, mostra uno storyboard di sei inquadrature
con tempi, movimenti di camera e note di continuità.
Mantieni il design della volpe identico in tutte le scene.
Usa musica e suoni originali o con licenza adeguata.
Renderizza prima un'anteprima, correggi, poi esporta l'MP4.
```

## Passo 04 — Approva il piano

Controlla design del personaggio, stile visivo, durata delle inquadrature, movimenti di camera e piano sonoro. Quando è tutto corretto, di' a Claude di implementare e renderizzare. Al primo avvio il plugin potrebbe chiederti quali asset o stile usare.

## Passo 05 — Verifica il risultato

Riproduci l'MP4; guarda tutto il film e controlla ogni stacco, in particolare muso e corpo della volpe, geografia della scena, luce e ritmo. Chiedi a Claude di modificare solo le inquadrature difettose, poi renderizza di nuovo.

# Percorso B — Cartone dipinto a mano

## Passo 01 — Apri il progetto di partenza

```
git clone https://github.com/JohnHeibel/ClaudeAnimationBase.git
cd ClaudeAnimationBase
npm install
claude
```

Leggi ANIMATION_GUIDE.md prima di generare le scene. Documenta costruzione delle inquadrature, comportamento del personaggio, pennellate, tempi e opzioni di rendering.

## Passo 02 — Chiedi una breve animazione

```
Leggi tutto ANIMATION_GUIDE.md.
Crea un cartone 2D di 15 secondi in questo progetto.
Storia: Clawd prova ad acchiappare una minuscola farfalla.
Prima fai uno storyboard con 3 o 4 inquadrature temporizzate.
Anima anticipazioni e reazioni credibili
e un finale divertente ma delicato.
Non cambiare l'identità di Clawd tra un'inquadratura e l'altra.
Renderizza i provini, autovalutali, correggi i problemi
ed esporta out/video.mp4.
```

## Passo 03 — Renderizza la demo inclusa (facoltativo)

```
node render.mjs --clip --out=out/video.mp4
```

Questo comando pubblicato renderizza la clip di esempio del repository, non la tua storia, finché Claude non modifica i file del progetto. Puoi vedere l'anteprima di studio.html in Chrome.

## Passo 04 — Crea il tuo personaggio

Fornisci un model sheet con vista frontale, laterale e primo piano. Chiedi a Claude di sostituire o estendere il modulo del personaggio, bloccarne silhouette e colori e creare un foglio delle espressioni riutilizzabile. Controlla ogni angolazione prima di costruire le scene complete.

### Prompt negativo per cartoni

Niente deriva del volto, cambi di costume, arti in più, pennellate incompiute, sfondi che si teletrasportano, testo indesiderato, stacchi involontari o zoom casuali.

# Percorso C — Motion design da 10 secondi

## Passo 01 — Clona MG Styles 15

```
git clone https://github.com/Vincentwei1021/mg-styles-15.git
cd mg-styles-15
npm install
python3 -m pip install -r requirements.txt
```

## Passo 02 — Scegli uno stile visivo

Apri prompts/ ed esamina un prompt di stile. Ad esempio scegli vettoriale piatto, Bauhaus geometrico, pixel art o uno stile 3D astratto premium. Sostituisci il «Creative seed» con il tuo soggetto mantenendo le «Signature features» utili.

## Passo 03 — Chiedi a Claude l'adattamento al tuo brand

```
Leggi il prompt scelto, il template condiviso
e il README del repository.
Crea un film di lancio prodotto minimal di 10 secondi
per un brand di skincare inventato chiamato NOVA.
Visual: sfondo avorio, dettagli arancio caldo,
movimento di camera geometrico e fluido, ritmo premium.
Non usare font, foto o musica senza licenza.
Renderizza un'anteprima a bassa risoluzione, valutala con
rubric.md, correggi due volte, poi esporta l'MP4.
```

## Passo 04 — Prova il renderer di esempio documentato

```
python3 demos/01-flat-vector/audio.py
node harness/render.mjs demos/01-flat-vector
```

I due comandi qui sopra renderizzano la dimostrazione vettoriale esistente. Per renderizzare la tua versione, chiedi a Claude di collegare i file di scena modificati al punto di ingresso corretto del sistema di rendering.

### Promemoria per l'esportazione

Il progetto originale usa fotogrammi disegnati dal browser e codifica FFmpeg. Il suo README richiede Node 22.12+; Chrome deve essere rilevabile dal renderer.

# Percorso D — Videoclip con il codice

## Opzione 1 — Testo cinetico con pdoom-video

Usala quando vuoi un testo animato sincronizzato su ogni parola o battuta. Il progetto usa una timeline in Three.js; per il flusso pubblicato richiede Bun, Chrome e FFmpeg.

```
git clone https://github.com/mexicat/pdoom-video.git
cd pdoom-video/app
bun install
bunx vite
```

Apri l'URL di anteprima mostrato da Vite. Leggi docs/TREATMENT.md e docs/ENGINE.md nella radice del repository. Sostituisci i dati della canzone solo con audio e testi per cui hai una licenza.

## Opzione 2 — Testo cartoon dipinto con PDoomVideo

Usala per personaggi illustrati e transizioni di scena costruite attorno a una canzone. Il repository documenta questi comandi di build per il suo film esistente:

```
git clone https://github.com/JohnHeibel/PDoomVideo.git
cd PDoomVideo
npm install
node render.mjs --frames=0:156.6 --workers=4
node render.mjs --encode --out=out/pdoom.mp4
```

Renderizzare la demo non produce automaticamente un video per una nuova canzone. Chiedi a Claude di riscrivere storyboard, moduli di scena, tempi del testo e riferimenti audio prima di generare il tuo lavoro.

### Prompt dalla canzone alle immagini

Usa la mia canzone con licenza e il testo con i timestamp che ti fornisco. Proponi un motivo visivo per ogni strofa e un design di personaggio ricorrente. Fai coincidere i cambi di animazione con le parole del testo e gli eventi ritmici. Crea la timeline di montaggio, le anteprime e un comando di esportazione riproducibile. Evita campioni o testi non autorizzati.

# Processo di produzione in 8 passi

## Passo 01 — Concept del film

Definisci messaggio emotivo, pubblico, genere e finale. Tieni una logline di una frase prima di espandere in scene.

## Passo 02 — Scegli il repository giusto

Abbina la tecnica all'obiettivo: film narrativo, cartone 2D, spot motion o videoclip. Non trattare una directory di ricerca come un progetto eseguibile.

## Passo 03 — Crea la bibbia di stile

Annota volto/silhouette del personaggio, palette, tecnica visiva, sfondi, oggetti di scena, linguaggio delle ottiche, transizioni e identità sonora.

## Passo 04 — Scrivi un copione temporizzato

Dividi la storia in inquadrature con tempi di inizio/fine precisi. Calcola la durata totale e indica i punti di transizione.

## Passo 05 — Genera il codice con Claude

Chiedi a Claude di esaminare README e file sorgente, pianificare le modifiche, implementare le scene e documentare le dipendenze necessarie. Rifiuta script inventati.

## Passo 06 — Renderizza le anteprime visive

Esporta prima provini o clip di anteprima. Controlla espressioni, tempi, inquadratura, framing della camera e parallasse prima della risoluzione piena.

## Passo 07 — Costruisci il montaggio audio finale

Aggiungi musica ed effetti originali o con licenza. Allinea i suoni alle azioni; mantieni i dialoghi comprensibili ed evita salti di volume bruschi.

## Passo 08 — Esporta e verifica l'MP4

Renderizza il video con un codec adatto, conferma dimensioni e frame rate, riproduci tutto l'output, poi correggi e renderizza di nuovo se serve.

> **LA REGOLA CHIAVE DELLA PRODUZIONE**
>
> Non saltare mai il passaggio di anteprima e revisione. Il movimento generato via codice richiede spesso diverse iterazioni per ottenere tempi cinematografici e un'animazione coerente.

# Esempio di storyboard da 30 secondi

FILM: L'ULTIMA LUCE | 30 s | 6 inquadrature | acquerello | 9:16. Ogni inquadratura di cinque secondi ha una sola azione chiara. Personaggi e luogo devono restare coerenti tra uno stacco e l'altro.

## Inquadratura 01 / 0–5 s

La volpe entra in una strada silenziosa della città di notte.

**CAMERA / SUONO:** Campo lungo in carrellata, vento leggero, atmosfera notturna blu-grigia.

## Inquadratura 02 / 5–10 s

La volpe nota un bagliore caldo sotto un vecchio lampione.

**CAMERA / SUONO:** Lento avvicinamento all'altezza degli occhi; reazione curiosa del muso.

## Inquadratura 03 / 10–15 s

Un fiore luminoso spunta dall'asfalto crepato.

**CAMERA / SUONO:** Macro dal basso con profondità di campo controllata.

## Inquadratura 04 / 15–20 s

La volpe tocca il fiore con cautela.

**CAMERA / SUONO:** Primo piano su zampa e fiore; nessuna deriva dell'identità.

## Inquadratura 05 / 20–25 s

Una luce dorata si diffonde tra i vecchi edifici.

**CAMERA / SUONO:** Rivelazione con gru; colonna sonora originale in crescendo sincronizzata.

## Inquadratura 06 / 25–30 s

La volpe guarda l'alba nella città trasformata.

**CAMERA / SUONO:** Composizione eroica in campo lungo, risoluzione musicale pulita.

### Controllo di continuità

La stessa volpe arancione compare nelle inquadrature 1, 2, 4 e 6. La posizione del fiore non deve cambiare tra le inquadrature 3 e 4. La trasformazione calda dell'inquadratura 5 deve collegarsi logicamente all'alba dell'inquadratura 6.

# Master prompt per creare il film

Copia il prompt seguente in Claude Code dopo aver scelto un progetto di lavoro adatto. Sostituisci ogni [CAMPO TRA PARENTESI] con i tuoi dati.

## 1. Progetto e formato

```
RUOLO: Regista + creative coder + animatore + montatore.
TITOLO: [TITOLO DEL TUO FILM]
GENERE: [CARTONE / FANTASCIENZA / SPOT / VIDEOCLIP]
STORIA: [STORIA IN UN PARAGRAFO]
STILE: [ACQUERELLO / VETTORIALE / 3D / PIXEL ART]
DURATA: [30] secondi
FORMATO: [9:16]
RISOLUZIONE: [1080x1920]
FRAME RATE: [30] fps
```

## 2. Direzione creativa

Comportati come un piccolo studio di produzione. Scrivi inizio, sviluppo e finale; prepara uno storyboard temporizzato con azione specifica per ogni scena, posizione della camera, movimento, resa dell'obiettivo, luce, ritmo e note sonore. Costruisci una bibbia coerente di personaggi e stile prima di disegnare o programmare qualsiasi scena.

## 3. Esecuzione tecnica

Esamina il repository installato e leggi prima il suo README. Indica quale renderer supportato verrà usato. Crea o modifica i moduli sorgente nella struttura corretta del progetto, elenca le dipendenze e fornisci comandi riproducibili per anteprima e render finale. Non inventare mai script o strumenti del progetto.

## 4. Autoverifica prima dell'esportazione

Renderizza brevi anteprime; controlla tutti i fotogrammi per deriva dell'identità, geometrie rotte, clipping, sfondi mancanti, sfarfallio, stacchi involontari, incoerenze di tempo e sincronia audio. Correggi i problemi e produci l'MP4 finale verificato.

### Prompt negativo

Niente cambi casuali del volto, arti in più, transizioni accidentali, forme che sfarfallano, movimenti di camera rotti, overlay di interfaccia, didascalie inutili, watermark, asset rubati o dichiarazioni di rendering non supportate.

# Prompt riutilizzabili per scene e camera

## 1. Scena cinematografica di ambientazione

Crea un'inquadratura di ambientazione in campo lungo di 5 secondi di [LUOGO], con [PERSONAGGIO PRINCIPALE] in [POSIZIONE NELLO SCHERMO]. Parti da una composizione stabile e usa un lento e naturale avvicinamento della camera. Mantieni stile artistico, prospettiva, ombre e posizione degli oggetti già stabiliti. Mantieni l'azione continua e produci un fotogramma di anteprima all'inizio, a metà e alla fine.

### Prompt negativo

Niente ambienti che si deformano, jump cut, zoom casuali, scenografia che scompare, volto che cambia o direzione della luce incoerente.

## 2. Inquadratura di reazione del personaggio

Crea un mezzo primo piano di 4 secondi di [PERSONAGGIO] che reagisce a [SCOPERTA]. Parti da un'espressione neutra, aggiungi movimenti sottili di occhi e sopracciglia, poi arriva a un momento emotivo chiaro. Mantieni proporzioni della testa, vestiti, pelo/capelli, pelle o palette del personaggio identici al model sheet. Usa un leggero cambio di fuoco senza muovere la geometria dello sfondo.

### Prompt negativo

Niente ricostruzione del volto, lip sync indesiderato, deformazione degli occhi, cambi di acconciatura, tratti duplicati o sfarfallio della messa a fuoco.

## 3. Animazione eroica del prodotto

Crea un film prodotto premium di 10 secondi con [PRODOTTO]. Usa uno sfondo bianco caldo o avorio, resa realistica dei materiali, un'orbita di camera misurata, un'ombra controllata e un'inquadratura eroica finale decisa e centrata. Se serve del testo, usa solo il copy esatto del brand fornito. Mantieni coerenti dimensioni della confezione e geometria dell'etichetta.

### Prompt negativo

Niente loghi fluttuanti, confezioni che si sciolgono, prodotti in più, cambi involontari dell'etichetta, testo non approvato o effetti visivi eccessivi.

# Esportazione video e checklist finale

## Impostazioni di output

Short social consigliato: 1080×1920, 9:16, 30 fps, MP4 H.264, audio AAC. Video orizzontale consigliato: 1920×1080, 16:9, 24 o 30 fps. Usa 4K/60 fps solo se il progetto scelto e la macchina lo supportano.

## Controlla il render reale

```
ffprobe -v error -show_format -show_streams final_movie.mp4
```

Il comando FFprobe è un esempio di controllo; sostituisci final_movie.mp4 con il nome reale del file esportato. Assicurati che il file esista e si riproduca prima di dichiarare il successo.

## Checklist di qualità creativa

☐ Storia e arco emotivo sono chiari.

☐ La durata corrisponde al totale dello storyboard.

☐ I personaggi mantengono stesso volto, colori e proporzioni.

☐ I movimenti di camera sembrano intenzionali e fluidi.

☐ Nessun glitch, deformazione indesiderata della scena o stacco casuale.

☐ Testi, effetti sonori e musica sono sincronizzati con il montaggio.

☐ Ogni font, traccia, immagine e asset sorgente ha i diritti d'uso adeguati.

☐ L'MP4 esportato ha codec, dimensioni, FPS e audio previsti.

## Limiti e diritti

I repository GitHub possono essere gratuiti da leggere ma richiedere comunque calcolo IA a pagamento. Diversi degli otto progetti sono gallerie di prompt o dataset di ricerca, non strumenti completi. Le licenze software non coprono automaticamente musica, font o immagini demo di terze parti. Leggi sempre README e LICENSE aggiornati.
