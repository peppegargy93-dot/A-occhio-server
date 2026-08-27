# Deploy su Render

## 1. Aggiorna GitHub

1. Apri la root del repository `A-occhio-server`.
2. Carica **i file contenuti** in `A_OCCHIO_FILE_DA_CARICARE_GITHUB_V2_7`, non la cartella contenitore. Per la correzione minima puoi usare i due file contenuti in `A_OCCHIO_SOSTITUISCI_QUESTI_2_FILE_V2_7`.
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

`/health` deve restituire un JSON con `"ok": true` e `"version": "2.7.0"`.

## 5. Collaudo dopo il deploy

Usa Master + iPhone Safari + Android e verifica in quest’ordine:

1. I due telefoni inseriscono nickname distinti e compaiono automaticamente nella lobby.
2. Avvia una domanda, invia le stime e controlla la curiosità su tutti i dispositivi.
3. Crea due stime con uguale distanza: devono comparire motivo, stime, formule e una carta Sfida casuale.
4. Espandi **Vedi tutte le 10 carte del Mazzo Sfide** e controlla che siano elencati tutti i dieci minigiochi.
5. Avvia **Stima Lampo** con due giocatori: soltanto le loro due lavagnette devono mostrare il campo di risposta; le altre devono restare in sola lettura.
6. Raggiungi una casella Bonus o Malus: soltanto la lavagnetta del giocatore coinvolto deve vedere i pulsanti.
7. Completa carta e destinatario: il gioco deve passare all'evento o round successivo.
8. Durante una scelta, scollega la sola lavagnetta autorizzata: soltanto allora deve apparire il fallback sul Master.
9. Verifica Malus temporale, Anti-Sapientone/Paracadute, movimento delle pedine e le due classifiche.
10. Ricarica una lavagnetta e controlla la riconnessione allo stato corrente.
11. Durante un round o una scelta, disattiva per pochi secondi la rete del Master e riattivala: le stime o la scelta inviate nel frattempo devono essere recuperate automaticamente.

## Nota operativa

Stanze e partite risiedono in memoria. La riconnessione WebSocket breve è gestita, ma ogni deploy, riavvio Render o ricaricamento completo della pagina Master interrompe lo stato di gioco: pubblica quando non ci sono partite in corso. Su un piano gratuito, il primo accesso dopo un periodo di inattività può richiedere il risveglio del servizio.
