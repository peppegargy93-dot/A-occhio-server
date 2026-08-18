# Audit pre-modifica — A OCCHIO!

Snapshot verificato: commit GitHub `c329f35` e ZIP `A_OCCHIO_GITHUB_UPDATE_V1_2.zip`, risultati identici file per file.

## Struttura attuale

- `server.js`: server HTTP/WebSocket, stanze in memoria, pagina lavagnetta incorporata come stringa HTML.
- `game.html`: intero client Master, stato partita, 405 domande inline, punteggio, mappa ed eventi speciali.
- `index.html`, `app.js`, `styles.css`: landing/demo separata dal flusso principale `/gioco`.
- `package.json`: Node >=18 e sola dipendenza runtime `ws`; nessuna suite di test.

## Cause reali rilevate prima delle modifiche

1. Le scelte speciali sono inoltrate dal server senza conservare una richiesta autorevole: non vengono verificati richiedente, opzioni, scadenza o unicità della risposta. Una lavagnetta può quindi inviare requestId/opzioni arbitrarie o ripetute.
2. Il Master riceve lo stesso fallback sia quando il giocatore non esiste sia quando la lavagnetta è disconnessa. La disconnessione successiva alla richiesta non notifica inoltre il fallback.
3. La UI lavagnetta usa un unico pannello con `overflow:hidden`, testi non spezzabili in più punti e nessun limite verticale specifico per la scelta; Safari iPhone può tagliare etichette e contenuti lunghi.
4. Gli altri dispositivi ricevono correttamente una vista informativa, ma il server non associa formalmente la scelta al solo token del giocatore interessato.
5. `Bonus` e `Malus` provengono da dati strutturati nelle nuove schermate, ma sopravvive `onlineScreenFromMaster`, che costruisce messaggi copiando `innerText` dal DOM Master. Questo può spezzare o fondere testi.
6. Anti-Sapientone: il calcolo del round usa `effectiveDist`, ma la casella Fenomeno azzera subito il flag appena assegnato, inserisce nuovamente i malus persistenti e usa una variabile `m` fuori scope nel log. Esistono più punti che fanno `push` diretto dei malus senza deduplicazione.
7. Il punteggio ha una guardia per round, ma il pulsante resta cliccabile e varie azioni speciali non hanno una guardia transazionale; il server non deduplica le scelte.
8. Database: 405 domande, 17 categorie, nessuna domanda contiene i campi `f`/`fs`. Una tabella fallback contiene curiosità per poche chiavi, senza fonti e con chiavi duplicate. Quindi nessuna delle 405 curiosità è verificata secondo lo schema richiesto.
9. La curiosità è già trasmessa nella vista risultato, ma per la maggioranza è vuota; sul Master viene comunque renderizzata una card vuota.
10. Nickname: join, duplicati case-insensitive e riconnessione via token esistono. Manca una modifica del nickname dalla lavagnetta prima dell'inizio; il server non espone alcun evento di rename.
11. Non esistono test automatici o end-to-end.

## Strategia minima

- Rendere il server autorevole per il ciclo di vita delle scelte e per la loro deduplicazione.
- Correggere il Fenomeno con helper idempotenti e una sola sorgente di distanza effettiva.
- Eliminare il recupero di testo dal DOM per le viste condivise.
- Aggiungere rename pre-partita e layout mobile/safe-area dedicato.
- Normalizzare lo schema domande e produrre un report completo delle curiosità non verificate, senza inventarne.
- Aggiungere test WebSocket con tre giocatori e controlli statici/regole sul client.
