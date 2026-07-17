# A OCCHIO! — repository completa v2

Party game multiplayer in Node.js + WebSocket.

## Modifiche incluse

- Il creatore della stanza è registrato come giocatore e appare come `Nome (Master)`.
- Il Master risponde dalla stessa schermata degli altri.
- Nessuna risposta viene mostrata durante il round.
- Ogni risposta viene bloccata al primo invio.
- Timer server-side di 20 secondi.
- Chiusura automatica appena rispondono tutti, Master compreso.
- Nessun pulsante “Penne giù” o “Stop timer”.
- Nuova casella **📢 Infamata a voce**, inserita al posto di un Malus sul tabellone demo.
- Nella modalità a voce, chi attiva la casella pronuncia subito la propria stima; tutti la registrano comunque nell’app per il calcolo e il blocco.
- Risposte tardive rifiutate lato server.
- Disconnessioni gestite aggiornando il numero di risposte attese.

## Avvio locale

```bash
npm install
npm start
```

Apri `http://localhost:3000`.

## Deploy su Render

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Node: 18 o superiore

## Pubblicazione su GitHub

Crea una nuova repository vuota e, dalla cartella del progetto:

```bash
git init
git add .
git commit -m "A OCCHIO v2: master player, smart timer, voice infamata"
git branch -M main
git remote add origin URL_DELLA_REPOSITORY
git push -u origin main
```

## Nota sulla casella Infamata

È una modalità di round, non una risposta fuori sistema. Il giocatore dice la stima ad alta voce per influenzare il tavolo, ma deve anche inviarla sul telefono. In questo modo il server continua a sapere quando sono arrivate tutte le risposte e può chiudere automaticamente il timer.
