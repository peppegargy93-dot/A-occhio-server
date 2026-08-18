# Changelog

## 2.2.0 — scelta Bonus e curiosità obbligatorie

- Corretto il race condition mostrato nel test reale: l'anteprima Bonus/Malus viene ora inviata prima della richiesta interattiva e non può più sovrascrivere i pulsanti del giocatore autorizzato.
- La curiosità viene ora mostrata dopo ogni risposta, sul Master e sulle lavagnette.
- Se una domanda non possiede ancora `f`/`fs` editoriali, viene prodotta una contestualizzazione numerica specifica e pertinente alla risposta (conversioni di tempo, lunghezza, peso o scala), con provenienza dichiarata.
- Aggiunta la fonte/provenienza visibile anche sulla lavagnetta.

## 2.1.0 — audit multiplayer e affidabilità

- Ridisegnata la scelta su lavagnetta con griglia a colonna singola, scroll verticale contenuto, safe area e regole specifiche per viewport strette/Safari iPhone.
- Reso il server autorevole per Bonus, Malus e destinatari: richiesta associata al token del giocatore, opzioni validate, una sola risposta accettata e replay rifiutati.
- Limitato il fallback Master al solo caso di disconnessione della lavagnetta autorizzata.
- Rimossa la costruzione di messaggi copiando `innerText` dal DOM Master; tutti gli aggiornamenti usano payload strutturati.
- Corretto Anti-Sapientone/Fenomeno: assegnazione idempotente, flag coerente, distanza effettiva unica, log senza variabili fuori scope e malus permanenti non duplicabili.
- Bloccato immediatamente il pulsante di applicazione punteggio e mantenuta la guardia transazionale per round.
- Uniformata la durata Timer Challenge a 10 secondi tra testo ed effetto.
- Aggiunto rename del nickname dalla lavagnetta prima dell'inizio, con controllo duplicati e aggiornamento automatico della lobby.
- Corretta la riconnessione quando il round è già bloccato.
- Normalizzato a runtime lo schema di tutte le domande con `q`, `a`, `f`, `fs`; le curiosità prive di fonte verificata non vengono mostrate.
- Aggiunti audit editoriale riproducibile e report completo delle domande ancora da verificare.
- Aggiunto test end-to-end WebSocket con tre giocatori.
