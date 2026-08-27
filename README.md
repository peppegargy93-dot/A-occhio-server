# A OCCHIO! — GitHub Update v2.6

Party game multiplayer con un dispositivo Master e fino a sette lavagnette WebSocket. La v2.6 conserva punteggi e percorso originali, ma rende autorevoli e leggibili sfide, distanze, punti, movimento e condizioni di vittoria.

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

## Cosa cambia nella v2.6

- Una parità nasce soltanto da una **distanza valida realmente uguale**. Master e lavagnette mostrano domanda, risposta corretta, stime, distanza reale, modificatori e formula usata.
- Le caselle **Sfida** e **Minigioco** mostrano separatamente il motivo del confronto: giocatore arrivato, casella, avversario e carta estratta.
- Il Mazzo Sfide contiene 10 minigiochi e usa uno shuffle-bag: tutte le carte vengono percorse prima di ricominciare, evitando anche la stessa famiglia consecutiva quando possibile.
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

- 32 test automatici, compreso un end-to-end WebSocket con Master e tre giocatori e cadute di connessione durante round/scelte.
- 360 partite simulate con 3–6 giocatori e tre semi indipendenti.
- 5.162 domande estratte senza duplicati interni alla partita.
- 3.718 minigiochi estratti con ciclo completo del mazzo.
- 2.600 parità autorevoli, 277 Paracadute, vittorie sia per Finale sia ai punti.
- Collaudo browser con quattro giocatori: parità, carta Sfida, curiosità, avanzamento, scelta Bonus in due passaggi e avvio del round successivo.

Vedi `SIMULATION_REPORT.md` e `PLAYTEST_REPORT.md` per i dettagli.

## Documentazione

- `AUDIT_PRE_MODIFICA.md`: struttura e cause reali individuate prima della v2.6.
- `AUDIT_EDITORIALE_DOMANDE.md`: copertura del mazzo attivo.
- `DOMANDE_DA_VERIFICARE.md`: 368 domande storiche ancora escluse.
- `MAZZO_SFIDE.md`: regole e attivazione dei dieci minigiochi.
- `BUG_RISOLTI.md` e `CHANGELOG.md`: correzioni e modifiche.
- `FILE_DA_CARICARE_GITHUB.md`: elenco esatto per GitHub.
- `DEPLOY_RENDER.md`: pubblicazione e collaudo su Render.
