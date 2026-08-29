# A OCCHIO! — GitHub Update v2.8

Party game multiplayer con un dispositivo Master e fino a sette lavagnette WebSocket. La v2.8 porta le risposte e i giochi di ordinamento sui dispositivi personali, mantenendo punteggi e percorso originali.

## Avvio e verifica

```bash
npm install
npm run check
npm test
npm run audit:questions
npm run simulate
npm start
```

- Master: `http://localhost:3000/gioco`
- Lavagnetta: `http://localhost:3000/lavagnetta`
- Stato server: `http://localhost:3000/health`

## Cosa cambia nella v2.8

- Il Mazzo Sfide ufficiale contiene otto carte: Stima Lampo, Cronometro del Master, Nomi & Cose, Alto o Basso, Intervallo Killer, Ordine Impossibile, La Bomba e Timeline Flash.
- **Indizio dopo Indizio** e **Asta al Ribasso** sono stati rimossi dall’estrazione e dal codice eseguibile.
- Stima Lampo, Cronometro, Alto o Basso, Intervallo Killer, Ordine Impossibile e Timeline Flash attivano soltanto le lavagnette degli sfidanti.
- Timeline offre quattro carte riordinabili e 20 secondi; Ordine Impossibile usa la stessa interazione con 25 secondi.
- Le risposte vengono bloccate e, quando entrambi hanno inviato, appaiono insieme su Master e lavagnette. Gli altri telefoni seguono domanda, andamento e risultato come spettatori.
- Nomi & Cose e La Bomba restano vocali e vengono controllati dal Master, mentre tutti i dispositivi vedono categoria, turno ed esito.
- Se il Master è uno degli sfidanti, compila il proprio campo sul dispositivo principale. Il fallback per un altro giocatore compare soltanto dopo la disconnessione della sua lavagnetta.

- Una parità nasce soltanto da una **distanza valida realmente uguale**. Master e lavagnette mostrano domanda, risposta corretta, stime, distanza reale, modificatori e formula usata.
- Le caselle **Sfida** e **Minigioco** mostrano separatamente il motivo del confronto: giocatore arrivato, casella, avversario e carta estratta.
- Il Mazzo Sfide contiene 8 minigiochi e usa uno shuffle-bag: tutte le carte vengono percorse prima di ricominciare, evitando anche la stessa famiglia consecutiva quando possibile.
- Round e minigiochi numerici condividono un unico mazzo di domande. Una domanda non può ripetersi nella stessa partita e la memoria del ciclo resta nel browser anche fra partite successive.
- Aggiunte **170 nuove domande**: esattamente 10 per ognuna delle 17 categorie, tutte con risposta numerica, curiosità specifica e fonte HTTPS.
- Database: **581 domande totali**, **213 attive e curate**, **368 storiche escluse** finché non ricevono curiosità e fonte verificate.
- Il Bonus **Paracadute** ora funziona davvero: se il proprietario ha la peggiore distanza valida, la dimezza automaticamente e si consuma una sola volta.
- Punti e caselle passano dallo stesso registro autorevole. Il riepilogo indica ogni variazione e la sua origine, compresi effetti speciali.
- L’avanzamento delle pedine viene animato in avanti e indietro; Master e lavagnette distinguono sempre **classifica punti** e **corsa sul tabellone**.
- Le due condizioni di vittoria sono sempre visibili: Finale raggiunta = vittoria immediata; al termine del 15º round = vittoria ai punti.
- Una chiusura manuale anticipata viene dichiarata esplicitamente e non viene confusa con il limite dei 15 round.
- Il fallback Master per Bonus, Malus, destinatari e sfidanti compare soltanto per il Master stesso oppure dopo conferma del server che la lavagnetta autorizzata è indisponibile/disconnessa.
- Una caduta breve della connessione non perde stime, timer personale o scelte già confermate: il server le riproduce al Master riconnesso. I nuovi ingressi dopo l’avvio sono bloccati, ma le lavagnette esistenti possono rientrare tramite token.

## Curiosità editoriali

Ogni domanda giocabile usa questa struttura:

```js
{cat:"...", q:"...", a:123, u:"...", f:"Curiosità specifica...", fs:"https://fonte..."}
```

La curiosità racconta il fatto interessante dietro quella domanda; non viene generata dalla categoria e non deve giustificare artificialmente la stima. Una scheda senza `f` e `fs` resta nel database, ma viene esclusa automaticamente dal sorteggio.

Esegui `npm run audit:questions` per rigenerare `AUDIT_EDITORIALE_DOMANDE.md` e `DOMANDE_DA_VERIFICARE.md`.

## Verifiche incluse

- 35 test automatici, compreso un end-to-end WebSocket con due sfidanti attivi, uno spettatore, ordinamento Timeline e tentativi di risposta non autorizzati.
- 360 partite simulate con 3–6 giocatori e tre semi indipendenti.
- 5.228 domande estratte senza duplicati interni alla partita.
- 3.936 minigiochi estratti con ciclo completo del mazzo.
- 2.769 parità autorevoli, 286 Paracadute, 127 vittorie per Finale e 233 ai punti.
- Collaudo browser Timeline con due sfidanti e uno spettatore: ordine personale, timer, invio, risultato pubblico e viewport iPhone 390 × 844 senza overflow.

Vedi `SIMULATION_REPORT.md` e `PLAYTEST_REPORT.md` per i dettagli.

## Documentazione

- `AUDIT_PRE_MODIFICA.md`: struttura e cause reali individuate prima della v2.6.
- `AUDIT_EDITORIALE_DOMANDE.md`: copertura del mazzo attivo.
- `DOMANDE_DA_VERIFICARE.md`: 368 domande storiche ancora escluse.
- `MAZZO_SFIDE.md`: regole e attivazione degli otto minigiochi.
- `BUG_RISOLTI.md` e `CHANGELOG.md`: correzioni e modifiche.
- `FILE_DA_CARICARE_GITHUB.md`: elenco esatto per GitHub.
- `DEPLOY_RENDER.md`: pubblicazione e collaudo su Render.
