# Rapporto playtest v2.6

## Agenti simulati

Tre agenti deterministici indipendenti del modello di stato hanno giocato 120 partite ciascuno, con tavoli casuali da 3 a 6 partecipanti. Il protocollo reale è verificato separatamente dal test WebSocket e dal collaudo browser:

| Agente | Seed | Partite | Domande | Minigiochi | Parità | Esito |
|---|---:|---:|---:|---:|---:|---|
| A | 260826 | 120 | 1.723 | 1.271 | 902 | OK |
| B | 270826 | 120 | 1.721 | 1.221 | 842 | OK |
| C | 930093 | 120 | 1.718 | 1.226 | 856 | OK |

In totale: 360 partite, 5.162 domande, 3.718 minigiochi, 2.600 parità, 277 Paracadute, 147 vittorie per Finale e 213 vittorie ai punti.

Ogni agente ha controllato queste invarianti:

- nessuna domanda ripetuta nella stessa partita;
- ciclo completo dei dieci minigiochi prima del riuso;
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

## Esito

I blocchi Bonus/Malus e Sfida non si sono ripresentati nei test. Restano necessari un collaudo fisico post-deploy su Safari iPhone e almeno un Android reale, perché sospensione della scheda, cambio rete e memoria disponibile dipendono dal dispositivo.
