# Rapporto playtest v2.9

## Collaudo anti-blocco v2.9

Scenario reale nel browser con un Master e tre lavagnette, Anna e Berto in sfida e Carla spettatrice:

1. Tutti e tre i nickname sono comparsi automaticamente nella lobby del Master.
2. Anna e Berto hanno inviato la stessa risposta esatta (`47`) e il sistema ha aperto il fotofinish soltanto per loro.
3. Master e lavagnette hanno mostrato motivo, risposta corretta, formule e posta reale: **1º posto nel round · 3 punti**.
4. Il pulsante di avvio sul Master era disabilitato; soltanto Anna ha ricevuto **Siamo pronti: inizia** e ha avviato Stima Lampo dalla propria lavagnetta.
5. Anna e Berto hanno ricevuto campi indipendenti e lo stato `mini_ready`; Carla ha visto domanda e andamento senza alcun comando di risposta.
6. Dopo il secondo invio, Master e Carla hanno visto insieme risposta, stime, vincitore e curiosità.
7. Il pulsante risultato mostrava il conto alla rovescia e, senza alcun click del Master, dopo 5 secondi il gioco è tornato alla rivelazione del round.
8. Il Master non ha registrato doppi invii o errori JavaScript durante il flusso.

Il test WebSocket separato copre il ramo Cronometro con Master sfidante: una lavagnetta spettatrice riceve in sequenza **AVVIA** e **FERMA**, entrambe vincolate allo stesso token autorizzato.

## Collaudo Timeline v2.8

Scenario reale su server locale con Anna e Berto in sfida e Carla spettatrice:

1. Anna ha ricevuto quattro eventi riordinabili, pulsanti su/giù, timer da 20 secondi e **Invia e blocca**.
2. Berto ha ricevuto una richiesta indipendente con la stessa lista.
3. Carla ha visto titolo, categoria e stato della sfida, senza campi o pulsanti di risposta.
4. Anna ha inviato `a|c|b|d` e Berto `d|c|b|a`; il server ha accettato un solo ordine completo per token.
5. Dopo il secondo invio, Anna, Berto e Carla hanno visto ordine corretto ed entrambe le sequenze.
6. Viewport iPhone 390 × 844: larghezza documento 390 pixel, nessun overflow orizzontale.
7. Console browser: nessun errore JavaScript sulle lavagnette sfidante e spettatrice.

## Collaudo lavagnette delle mini sfide

È stato eseguito un test reale del protocollo WebSocket e dell'interfaccia mobile con Anna e Berto in sfida e Carla spettatrice:

- entrambe le lavagnette sfidanti hanno ricevuto il campo numerico di **Stima Lampo**;
- la lavagnetta di Carla non ha ricevuto comandi di risposta;
- una risposta contraffatta di Carla e il valore non numerico `40abc` sono stati rifiutati dal server;
- il Master ha ricevuto una sola risposta valida per giocatore: Anna `40`, Berto `44`;
- su viewport iPhone da 390 × 844 pixel il contenuto è rimasto entro i 390 pixel, senza overflow orizzontale;
- dopo l'invio, i comandi sono stati bloccati per impedire doppio click e doppia risposta.

## Agenti simulati

Tre agenti deterministici indipendenti del modello di stato hanno giocato 120 partite ciascuno, con tavoli casuali da 3 a 6 partecipanti. Il protocollo reale è verificato separatamente dal test WebSocket e dal collaudo browser:

| Agente | Seed | Partite | Domande | Minigiochi | Parità | Esito |
|---|---:|---:|---:|---:|---:|---|
| A | 260826 | 120 | 1.750 | 1.344 | 943 | OK |
| B | 270826 | 120 | 1.740 | 1.293 | 927 | OK |
| C | 930093 | 120 | 1.738 | 1.299 | 899 | OK |

In totale: 360 partite, 5.228 domande, 3.936 minigiochi, 2.769 parità, 286 Paracadute, 127 vittorie per Finale e 233 vittorie ai punti.

Ogni agente ha controllato queste invarianti:

- nessuna domanda ripetuta nella stessa partita;
- ciclo completo degli otto minigiochi prima del riuso;
- sfida da parità soltanto per distanze valide uguali;
- un solo aggiornamento di punti/caselle per evento;
- Paracadute applicato e consumato una sola volta;
- posizioni comprese fra partenza e Finale;
- vittoria immediata alla Finale oppure vittoria ai punti al round 15.

## Test browser con quattro giocatori

Scenario eseguito con Master, Anna, Bruno e Carla:

1. Tre nickname entrano dalla lavagnetta e compaiono automaticamente nella lobby.
2. Giocatore 1 e Anna inseriscono la stessa stima; la risposta corretta è 37 minuti e la formula mostrata è `13 = 13` per entrambi.
3. Il gioco estrae **La Bomba** e mostra motivo, partecipanti, tre regole, durata e criterio di vittoria su Master e lavagnette.
4. La sfida termina e determina l’ordine del round senza doppie ricompense.
5. La curiosità sul giorno marziano compare identica sul Master e sulla lavagnetta prima dell’avanzamento.
6. Punti e caselle vengono applicati dal ledger; Anna raggiunge la casella Bonus.
7. Soltanto Anna vede prima le tre carte Bonus e poi la scelta del destinatario; Bruno resta in attesa in sola lettura.
8. Dopo la conferma del destinatario la partita entra regolarmente nel round 2.

## Test WebSocket automatico

Il test con Master e tre socket verifica inoltre:

- nickname duplicato rifiutato e rename accettato;
- timer personale del Malus temporale;
- timer personale invariato dopo la riconnessione della lavagnetta;
- stime e scelta effettuate mentre il Master è scollegato, recuperate al suo rientro;
- nuovo ingresso rifiutato dopo l’avvio, senza creare giocatori fantasma;
- una sola risposta accettata per round;
- curiosità distribuita a tutti;
- payload Sfida senza risultato obsoleto;
- scelta accettata soltanto dal token autorizzato;
- secondo passaggio del Bonus;
- replay e risposta contraffatta rifiutati;
- fallback soltanto dopo disconnessione;
- riconnessione tramite token e mappa aggiornata.
- campo `order` validato come permutazione completa, con duplicati e token spettatore rifiutati;
- deadline Timeline condivisa e vista pubblica prima e dopo l’invio.
- conferma `mini_ready` per ciascuna lavagnetta sfidante;
- fallback `not_ready` dopo 6 secondi quando una schermata non conferma l’apertura;
- recupero del payload di scelta dopo la sostituzione del socket della lavagnetta;
- sequenza Cronometro delegata AVVIA/FERMA su una lavagnetta spettatrice.

## Esito

I blocchi Bonus/Malus e Sfida non si sono ripresentati nei test. Restano necessari un collaudo fisico post-deploy su Safari iPhone e almeno un Android reale, perché sospensione della scheda, cambio rete e memoria disponibile dipendono dal dispositivo.
