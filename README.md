# A OCCHIO! — GitHub Update v2.4

Party game multiplayer con un dispositivo Master e lavagnette WebSocket. La v2.4 risolve il blocco delle scelte Bonus/Malus, corregge la scomparsa della lettera **s** sulle lavagnette, rende più robusta la riconnessione mobile e amplia il mazzo editoriale senza modificare punteggi o regole fondamentali.

## Avvio e verifica

```bash
npm install
npm run check
npm run audit:questions
npm test
npm start
```

- Master: `http://localhost:3000/gioco`
- Lavagnetta: `http://localhost:3000/lavagnetta`

## Cosa cambia nella v2.4

- Se il giocatore coinvolto usa una lavagnetta, soltanto quella lavagnetta riceve i pulsanti; gli altri vedono l’attesa.
- Se il giocatore coinvolto è il Master, la scelta compare subito sul Master e non viene più cercata una lavagnetta inesistente.
- Mancata consegna, timeout o disconnessione aprono un fallback locale senza bloccare la partita.
- La scelta viene accettata una sola volta e soltanto fra le opzioni autorizzate.
- La lavagnetta riprova la connessione dopo timeout, ritorno online, focus e riapertura della pagina; il server usa un heartbeat.
- Le parole non vengono più spezzate arbitrariamente e una regex incorporata non elimina più le lettere `s`.
- Il mazzo attivo contiene 43 domande con curiosità e fonte, incluse 6 nuove domande sul numero di parole nelle canzoni.
- I minigiochi mostrano chiaramente la posta; la “Sorte del tabellone” alterna automaticamente le sfide e la classifica indica la prossima casella speciale. I punteggi originali restano invariati.

## Curiosità editoriali

Ogni domanda giocabile possiede almeno:

```js
{cat:"...", q:"...", a:123, u:"...", f:"Curiosità specifica...", fs:"https://fonte..."}
```

Una domanda senza `f` e `fs` resta nel database ma viene esclusa automaticamente dal sorteggio. In questo modo ogni risposta mostrata in partita è seguita da una curiosità reale sul soggetto della domanda, visibile sia sul Master sia sulle lavagnette.

Situazione v2.4: 411 domande totali, 43 attive e curate, 368 ancora escluse. Esegui `npm run audit:questions` per rigenerare i due rapporti editoriali.

## Documentazione

- `AUDIT_PRE_MODIFICA.md`: struttura e cause reali trovate nel commit di partenza.
- `AUDIT_EDITORIALE_DOMANDE.md`: copertura del mazzo attivo.
- `DOMANDE_DA_VERIFICARE.md`: domande non ancora abilitate.
- `CHANGELOG.md`: modifiche della versione.
- `BUG_RISOLTI.md`: correzioni e limiti rimasti.
- `FILE_DA_CARICARE_GITHUB.md`: elenco esatto per GitHub.
- `DEPLOY_RENDER.md`: pubblicazione e collaudo.
