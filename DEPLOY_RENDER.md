# Deploy su Render

## 1. Aggiorna GitHub

1. Apri la root del repository `A-occhio-server`.
2. Carica **i file contenuti** in `A_OCCHIO_FILE_DA_CARICARE_GITHUB_V3_0`, non la cartella contenitore. Per la correzione minima puoi usare i due file contenuti in `A_OCCHIO_SOSTITUISCI_QUESTI_2_FILE_V3_0`.
3. Sostituisci i file omonimi e le directory `scripts/` e `tests/`.
4. Elimina le vecchie cartelle-versione e le copie di test/script nella root indicate in `FILE_DA_CARICARE_GITHUB.md`.
5. Verifica che `package.json`, `server.js`, `game.html`, `scripts/` e `tests/` siano direttamente nella root.
6. Crea il commit su `main`.

## 2. Configura Render

Nel Web Service collegato al repository imposta:

- Runtime: `Node`
- Branch: `main`
- Root Directory: vuota
- Build Command: `npm install`
- Start Command: `npm start`
- Auto-Deploy: a scelta

Non creare manualmente la variabile `PORT`: Render la fornisce e `server.js` la legge automaticamente. Il progetto richiede Node 18 o successivo.

## 3. Pubblica

1. Apri **Manual Deploy**.
2. Se Render conserva una build precedente, scegli **Clear build cache & deploy**.
3. Attendi lo stato `Live`.
4. Nei log deve comparire `A OCCHIO! attivo sulla porta ...`.

## 4. Verifica gli URL

- Master: `https://TUO-SERVIZIO.onrender.com/gioco`
- Lavagnetta: `https://TUO-SERVIZIO.onrender.com/lavagnetta`
- Health check: `https://TUO-SERVIZIO.onrender.com/health`

`/health` deve restituire un JSON con `"ok": true` e `"version": "3.0.0"`.

## 5. Collaudo dopo il deploy

Usa Master + iPhone Safari + Android e verifica in quest’ordine:

1. I due telefoni inseriscono nickname distinti e compaiono automaticamente nella lobby.
2. Avvia una domanda, invia le stime e controlla la curiosità su tutti i dispositivi.
3. Crea due stime con uguale distanza: devono comparire motivo, stime, formule e una carta Sfida casuale.
4. Espandi **Vedi tutte le 8 carte del Mazzo Sfide** e controlla che siano elencati tutti gli otto minigiochi.
5. Avvia **Timeline Flash** con due giocatori: soltanto le loro lavagnette devono mostrare le quattro carte riordinabili e il timer di 20 secondi; le altre devono seguire in sola lettura. Dopo l’invio, tutti devono vedere entrambe le timeline.
6. Controlla il tabellone: devono esserci esattamente tre caselle Minigioco, nelle posizioni 6, 17 e 23, e nessuna casella Bonus, Malus o Sfida.
7. Mantieni un giocatore fuori dal podio per quattro round consecutivi: soltanto la sua lavagnetta deve poter scegliere il Premio rimonta.
8. Porta un giocatore al terzo podio complessivo: il Malus deve essere estratto e assegnato automaticamente allo stesso giocatore; ripeti fino al sesto podio per verificare il secondo scatto.
9. Durante la scelta del Bonus, scollega la sola lavagnetta autorizzata: soltanto allora deve apparire il fallback sul Master.
10. Verifica Malus temporale, Anti-Sapientone/Paracadute, movimento delle pedine e le due classifiche.
11. Ricarica una lavagnetta e controlla la riconnessione allo stato corrente.
12. Durante un round o una scelta, disattiva per pochi secondi la rete del Master e riattivala: le stime o la scelta inviate nel frattempo devono essere recuperate automaticamente.

## Nota operativa

Stanze e partite risiedono in memoria. La riconnessione WebSocket breve è gestita, ma ogni deploy, riavvio Render o ricaricamento completo della pagina Master interrompe lo stato di gioco: pubblica quando non ci sono partite in corso. Su un piano gratuito, il primo accesso dopo un periodo di inattività può richiedere il risveglio del servizio.
