# Rapporto verifiche v3.1

## Nuove regole eseguite

La progressione personale è stata eseguita come funzione isolata sullo stesso codice usato dalla partita:

- 8 round consecutivi fuori dal podio producono esattamente due Premi rimonta, al 4º e all'8º;
- 9 piazzamenti sul podio producono esattamente tre Tasse del podio, al 3º, 6º e 9º;
- un podio azzera la serie fuori podio;
- ogni evento viene accodato una sola volta con l'identità del giocatore interessato.

Il test del tabellone verifica inoltre 30 caselle totali, Minigioco soltanto alle posizioni 6, 17 e 23 e assenza dei tipi `bonus`, `malus` e `duello`.

## End-to-end WebSocket

Test locale superato con Master e tre lavagnette simulate:

- ingresso di Anna, Bruno e Carla e rifiuto del nickname duplicato;
- modifica di Bruno in Berto prima della partita;
- timer personale differenziato e conservato dopo riconnessione;
- recupero sul Master delle stime inviate durante una breve disconnessione;
- rifiuto dei nuovi ingressi a partita iniziata;
- curiosità distribuita a tutti i dispositivi;
- spettatore escluso dai campi di risposta della mini-sfida;
- `mini_ready`, invio singolo, risposta contraffatta rifiutata e fallback anti-blocco;
- recupero di una scelta autorizzata dopo sostituzione del socket;
- micro-disconnessione di una lavagnetta durante una scelta e ripresa entro la finestra di 4,5 secondi, senza fallback spurio;
- Cronometro delegato a una lavagnetta spettatrice con sequenza AVVIA/FERMA;
- preparazione e comandi arbitro di Nomi & Cose inviati a uno spettatore quando il Master è sfidante;
- mappa e classifiche aggiornate dallo stesso snapshot.
- recupero del checkpoint del Master dopo refresh, con ripartenza dalla stessa domanda e senza nuovo sorteggio.

## Simulazioni deterministiche

Tre agenti del modello di stato hanno completato 120 partite ciascuno, con tavoli casuali da 3 a 6 giocatori.

| Seed | Partite | Domande | Minigiochi | Bonus rimonta | Malus podio | Esito |
|---:|---:|---:|---:|---:|---:|---|
| 260826 | 120 | 1.736 | 1.608 | 113 | 1.542 | OK |
| 270826 | 120 | 1.720 | 1.601 | 114 | 1.536 | OK |
| 930093 | 120 | 1.721 | 1.585 | 118 | 1.557 | OK |

Totale: 360 partite, 5.177 domande, 4.794 minigiochi, 345 Premi rimonta, 4.635 Malus da podio, 1.668 attivazioni dalle tre caselle Minigioco, 3.126 parità valide e 286 Paracadute consumati. Sono risultate 141 vittorie raggiungendo la Finale e 219 vittorie ai punti.

Invarianti controllate:

- nessuna domanda ripetuta nella stessa partita;
- sfida da parità soltanto per distanze effettive uguali e rilevanti per il podio;
- un solo aggiornamento di punti e caselle per voce del ledger;
- Bonus ogni quattro esclusioni consecutive e Malus a ogni multiplo di tre podi;
- posizioni comprese fra partenza e Finale;
- vittoria immediata alla Finale oppure vittoria ai punti al round 15.

## Verifica editoriale

- 593 domande censite;
- 204 domande complete di curiosità specifica e fonte HTTPS, quindi giocabili;
- 22 domande Oscar/Grammy escluse dalla linea editoriale richiesta (una è anche priva di una curiosità verificata);
- 368 schede incomplete escluse automaticamente e riportate in `DOMANDE_DA_VERIFICARE.md`;
- vietate dai test le formule generiche rimosse in questa versione;
- titolo “La storia dietro la domanda” presente sia sul Master sia sulle lavagnette.

## Verifica fisica consigliata dopo il deploy

Il protocollo e il layout responsive sono coperti automaticamente, ma sospensione delle schede, cambio rete e tastiere dipendono dal dispositivo. Dopo la pubblicazione resta consigliato un controllo rapido con un iPhone Safari e almeno un Android reale, seguendo la checklist di `DEPLOY_RENDER.md`.
