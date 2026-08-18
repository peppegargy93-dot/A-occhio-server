# A OCCHIO! — GitHub Update v2.1

Party game multiplayer con Master e lavagnette WebSocket. Il gameplay originale è invariato; questa versione rafforza protocollo, responsive mobile, nickname, Anti-Sapientone e verificabilità editoriale.

## Avvio e verifica

```bash
npm install
npm run check
npm run audit:questions
npm test
npm start
```

Gioco Master: `http://localhost:3000/gioco`  
Lavagnetta: `http://localhost:3000/lavagnetta`

## Documentazione

- `AUDIT_PRE_MODIFICA.md`: architettura e cause reali rilevate prima degli interventi.
- `CHANGELOG.md`: modifiche applicate.
- `BUG_RISOLTI.md`: bug risolti e limiti rimasti.
- `DOMANDE_DA_VERIFICARE.md`: audit completo delle 405 domande.
- `DEPLOY_RENDER.md`: procedura di pubblicazione.

## Curiosità verificate

Le domande usano `f` per la curiosità specifica e `fs` per la fonte:
`{cat:"...", q:"...", a:123, u:"...", f:"...", fs:"..."}`

Il gioco mostra una curiosità soltanto quando entrambi i campi sono presenti. Non genera testi casuali e non copia contenuti dal DOM del Master.
