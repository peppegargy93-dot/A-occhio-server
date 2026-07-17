# A OCCHIO! — repository unica

Questo progetto contiene sia il gioco principale sia le lavagnette.

## Rotte

- `/` — gioco principale
- `/gioco` — gioco principale, percorso alternativo
- `/lavagnetta` — lavagnetta
- `/lavagnetta?c=ABCD` — lavagnetta con codice stanza già compilato
- `/health` — controllo server

Il QR generato dal gioco punta alla lavagnetta sullo stesso dominio e sullo stesso server WebSocket.

## Render

Crea un solo **Web Service** collegato a questa repository.

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: vuoto

Dopo il deploy, apri soltanto il dominio principale del servizio.
