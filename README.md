# A OCCHIO! — repository unica v2

Un solo servizio contiene gioco, lavagnette e WebSocket.

## Novità v2

- Il QR della stanza compare nella configurazione, prima dell'inizio della partita.
- Le lavagnette mostrano domanda, categoria, unità di misura e countdown.
- A zero secondi scatta “Penne giù” e l'input viene bloccato.
- Dopo l'invio, la lavagnetta torna a una schermata di attesa bloccata.
- Alla domanda successiva la stessa pagina si riattiva automaticamente.

## Rotte

- `/` oppure `/gioco` — gioco principale
- `/lavagnetta` — lavagnetta
- `/lavagnetta?c=ABCD` — lavagnetta con codice precompilato
- `/health` — controllo server

## Render

Crea un solo Web Service:

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: vuoto
