# Deploy su Render

1. Segui `FILE_DA_CARICARE_GITHUB.md`: carica il contenuto della cartella v2.4 nella root del repository, non la cartella contenitore.
2. In Render apri il Web Service collegato al repository.
3. Imposta Runtime `Node`, Build Command `npm install` (oppure `pnpm install --frozen-lockfile` se il servizio usa pnpm) e Start Command `npm start`.
4. Non impostare manualmente `PORT`: Render lo fornisce e `server.js` lo legge automaticamente.
5. Verifica che `scripts/` e `tests/` esistano davvero come directory; elimina le vecchie copie omonime rimaste nella root. Poi fai commit su `main`.
6. In **Manual Deploy** scegli **Clear build cache & deploy**.
7. Attendi lo stato `Live`, poi apri `https://TUO-SERVIZIO.onrender.com/gioco` e `https://TUO-SERVIZIO.onrender.com/lavagnetta`.
8. Controlla i log Render: deve comparire `A OCCHIO! attivo sulla porta ...` e non devono esserci errori di file mancanti.
9. Verifica con Master + iPhone + Android: ingresso, domanda, curiosità, scelta Bonus/Malus del Master, scelta di una lavagnetta e riconnessione dopo modalità aereo.

Nota: un deploy interrompe le stanze attive perché lo stato è in memoria; pubblica quando non ci sono partite in corso.
