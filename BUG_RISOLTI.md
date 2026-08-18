# Bug risolti

- Anteprima della casella Bonus che sovrascriveva i pulsanti di scelta sull'iPhone autorizzato.
- Curiosità assente nella maggioranza delle domande: ora esiste sempre almeno una contestualizzazione specifica della risposta.
- Overflow/taglio delle opzioni di scelta su iPhone e testi lunghi sovrapposti.
- Possibilità per una lavagnetta non autorizzata di inviare una scelta.
- Doppia risposta/replay della stessa scelta speciale.
- Opzioni arbitrarie non appartenenti alla richiesta del Master.
- Fallback Master attivato per cause diverse dalla disconnessione.
- Messaggi Bonus/Malus ricavati dal testo HTML del Master.
- Fenomeno assegnato e subito annullato nello stesso handler.
- Errore JavaScript nel log Fenomeno per variabile fuori scope.
- Duplicazione dei malus permanenti e temporali.
- Divergenza testuale Timer Challenge (5 secondi nel log, 10 reali).
- Doppio click sull'assegnazione punteggi.
- Modifica nickname assente prima della partita.
- Riconnessione a round chiuso mostrata come domanda ancora compilabile.

# Problemi rimasti

- Il database contiene 405 domande e nessuna ha ancora una coppia editoriale `curiosità + fonte esterna` verificata. Nell'attesa, il gioco mostra una contestualizzazione matematica corretta derivata dalla risposta e la dichiara come tale. L'elenco delle schede che richiedono ancora arricchimento editoriale esterno è in `DOMANDE_DA_VERIFICARE.md`.
- Le stanze e lo stato autorevole vivono in memoria: un riavvio/deploy Render chiude le partite attive. Per persistenza cross-deploy serve un archivio esterno (per esempio Redis/Postgres), che sarebbe un cambiamento architetturale non minimo.
- Il test automatico copre il protocollo multiplayer completo e le invarianti Anti-Sapientone; il gesto/tocco reale su Safari iPhone richiede comunque una prova su dispositivo fisico prima della pubblicazione.
