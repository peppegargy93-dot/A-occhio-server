# Rapporto verifiche v3.0

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
- Cronometro delegato a una lavagnetta spettatrice con sequenza AVVIA/FERMA;
- mappa e classifiche aggiornate dallo stesso snapshot.

## Simulazioni deterministiche

Tre agenti del modello di stato hanno completato 120 partite ciascuno, con tavoli casuali da 3 a 6 giocatori.

| Seed | Partite | Domande | Minigiochi | Bonus rimonta | Malus podio | Esito |
|---:|---:|---:|---:|---:|---:|---|
| 260826 | 120 | 1.743 | 1.712 | 126 | 1.567 | OK |
| 270826 | 120 | 1.746 | 1.664 | 153 | 1.561 | OK |
| 930093 | 120 | 1.708 | 1.609 | 104 | 1.539 | OK |

Totale: 360 partite, 5.197 domande, 4.985 minigiochi, 383 Premi rimonta, 4.667 Malus da podio, 1.648 attivazioni dalle tre caselle Minigioco, 3.337 parità valide e 312 Paracadute consumati. Sono risultate 132 vittorie raggiungendo la Finale e 228 vittorie ai punti.

Invarianti controllate:

- nessuna domanda ripetuta nella stessa partita;
- sfida da parità soltanto per distanze effettive uguali e rilevanti per il podio;
- un solo aggiornamento di punti e caselle per voce del ledger;
- Bonus ogni quattro esclusioni consecutive e Malus a ogni multiplo di tre podi;
- posizioni comprese fra partenza e Finale;
- vittoria immediata alla Finale oppure vittoria ai punti al round 15.

## Verifica editoriale

- 581 domande censite;
- 213 domande complete di curiosità specifica e fonte HTTPS, quindi giocabili;
- 368 schede incomplete escluse automaticamente e riportate in `DOMANDE_DA_VERIFICARE.md`;
- vietate dai test le formule generiche rimosse in questa versione;
- titolo “La storia dietro la domanda” presente sia sul Master sia sulle lavagnette.

## Verifica fisica consigliata dopo il deploy

Il protocollo e il layout responsive sono coperti automaticamente, ma sospensione delle schede, cambio rete e tastiere dipendono dal dispositivo. Dopo la pubblicazione resta consigliato un controllo rapido con un iPhone Safari e almeno un Android reale, seguendo la checklist di `DEPLOY_RENDER.md`.
