# Changelog

## 2.4.0 — scelte sbloccate e affidabilità mobile

- Corretto il blocco quando il Master termina su Bonus o Malus: la scelta viene ora eseguita localmente sul Master.
- Aggiunti `choice_ready`, timeout di 12 secondi, annullamento e fallback per tutte le richieste remote non consegnate.
- Resi idempotenti i due passaggi del Bonus e l’assegnazione del Malus.
- Corretto il bug che trasformava `/\s+/` in `/s+/` nella pagina incorporata e cancellava le lettere “s” sulle lavagnette.
- Sostituito lo spezzamento `anywhere` con una resa conservativa compatibile con Safari/iPhone e Android.
- Rafforzata la riconnessione mobile con timeout di apertura, backoff con jitter, eventi `online`/`focus`/`pageshow` e heartbeat.
- Aggiunte 6 domande musicali sul conteggio di parole, tutte con curiosità specifica e fonte.
- Portato il mazzo editoriale attivo a 43 domande; 368 schede non curate restano escluse.
- Aggiunta la “Sorte del tabellone”, la posta visibile nei minigiochi e l’indicazione della prossima casella speciale, senza cambiare i punteggi originali.
- Aggiunti test di regressione mirati e ampliato l’end-to-end WebSocket con conferma e annullamento della scelta.

## 2.3.0 — revisione editoriale fail-closed

- Eliminato il fallback con conversioni numeriche.
- Aggiunto un archivio di curiosità legate alla domanda esatta, ciascuna con fonte HTTPS.
- Attivate 37 domande curate distribuite in 9 categorie.
- Escluse automaticamente dal sorteggio le 368 domande non ancora revisionate.
- Nascondi le categorie senza almeno una domanda editoriale completa.
- Aggiunti audit e test automatici della copertura editoriale.

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
