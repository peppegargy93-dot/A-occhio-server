# Deploy su Render

1. Carica nella root del repository GitHub tutti i file di questa cartella, inclusi `scripts/`, `tests/`, `package.json` e il lockfile.
2. In Render apri il Web Service collegato al repository.
3. Imposta Runtime `Node`, Build Command `npm install` (oppure `pnpm install --frozen-lockfile` se il servizio usa pnpm) e Start Command `npm start`.
4. Non impostare manualmente `PORT`: Render lo fornisce e `server.js` lo legge automaticamente.
5. In **Manual Deploy** scegli **Clear build cache & deploy**.
6. Attendi lo stato `Live`, poi apri `https://TUO-SERVIZIO.onrender.com/gioco` e `https://TUO-SERVIZIO.onrender.com/lavagnetta`.
7. Prima della partita reale esegui localmente `npm install`, `npm run check`, `npm run audit:questions` e `npm test`.
8. Verifica da un iPhone Safari: ingresso, rename pre-partita, rotazione verticale, scelta Bonus/Malus e riconnessione dopo modalità aereo.

Nota: un deploy interrompe le stanze attive perché lo stato è in memoria; pubblica quando non ci sono partite in corso.
