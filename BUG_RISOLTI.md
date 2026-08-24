# Bug risolti nella v2.4

- Partita bloccata quando il Master arrivava su una casella Bonus/Malus.
- Partita bloccata dopo errore di instradamento o richiesta di scelta non ricevuta.
- Scelta remota senza conferma di apertura o scadenza.
- Doppio click/doppia applicazione nei passaggi Bonus e Malus.
- Lettere `s` cancellate dai testi informativi delle lavagnette.
- Parole spezzate in punti arbitrari su viewport strette.
- Socket Android rimasto in stato di connessione o non ripreso dopo cambio rete/focus.
- Mancanza di heartbeat per individuare connessioni morte.
- Assenza di domande sul conteggio delle parole nelle canzoni.
- Audit editoriale che non conteggiava le curiosità scritte direttamente nella singola domanda.
- File di test e script collocati nella root anziché nelle directory previste da `package.json`.

## Verifiche eseguite

- Sintassi server e script Master.
- 16 test automatici, incluso un flusso WebSocket con Master e tre giocatori: join, duplicati, rename, domanda, risposta unica, curiosità, scelta autorizzata, tentativo contraffatto, replay, annullamento, disconnessione, riconnessione e mappa.
- Prova locale tramite interfaccia: lobby, domanda, risultati e curiosità su entrambi i dispositivi; Malus selezionabile soltanto da Anna mentre Berto vede l’attesa; Bonus del Master selezionabile direttamente sul Master.

## Problemi rimasti

- 368 domande storiche non hanno ancora una curiosità e una fonte verificate: sono elencate in `DOMANDE_DA_VERIFICARE.md` e non possono essere sorteggiate.
- Stanze e stato partita risiedono in memoria. Un riavvio o deploy Render chiude le partite attive; la persistenza richiederebbe Redis/Postgres e un intervento architetturale separato.
- Il test automatico verifica il protocollo; è comunque consigliato un collaudo finale su un iPhone Safari e almeno un Android reale dopo il deploy.
