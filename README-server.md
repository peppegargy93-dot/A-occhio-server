# A OCCHIO! — Server lavagnette
I telefoni degli amici diventano lavagnette: ricevono la domanda, inviano le stime al master.

## Metterlo online GRATIS (Render, ~10 minuti)
1. Vai su github.com → accedi (o crea account) → "New repository" → nome `aocchio-server` → Create.
2. Nella pagina del repo: "uploading an existing file" → trascina `server.js`, `package.json`, `README.md` → Commit.
3. Vai su render.com → accedi con GitHub → "New +" → "Web Service" → scegli il repo `aocchio-server`.
4. Impostazioni: Runtime Node · Build Command `npm install` · Start Command `npm start` · Instance Type **Free** → "Create Web Service".
5. A fine deploy ottieni l'URL, tipo `https://aocchio-server.onrender.com`. Aprilo: vedi la pagina Lavagnetta = funziona.

## Come si usa in partita
- Master: nel gioco, schermata inserimento → "🌐 Attiva lavagnette online" → incolla l'URL → si crea la stanza con codice + QR.
- Amici: aprono l'URL sul telefono (o inquadrano il QR), inseriscono codice e il LORO NOME (uguale a quello nel gioco!).
- Quando il master avvia il tempo, la domanda appare sulle lavagnette; a "penne giù" si bloccano; le stime arrivano al master, che tocca "📲 Riempi con le stime ricevute".

## Nota sul piano Free di Render
Se nessuno lo usa per 15 minuti, il server "si addormenta": la prima connessione della serata impiega ~30-60 secondi a svegliarlo. Apri l'URL 1 minuto prima di giocare e sei a posto.
