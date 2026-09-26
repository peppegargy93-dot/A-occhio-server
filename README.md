# A OCCHIO! — GitHub Update v3.0

Party game multiplayer con un dispositivo Master e fino a sette lavagnette WebSocket. La v3.0 rende il percorso più rapido: riduce a tre le caselle Minigioco, elimina dal tabellone le caselle Bonus/Malus e lega quei premi all'andamento reale di ogni giocatore.

## Avvio e verifica

```bash
npm install
npm run check
npm test
npm run audit:questions
npm run simulate
npm start
```

- Master: `http://localhost:3000/gioco`
- Lavagnetta: `http://localhost:3000/lavagnetta`
- Stato server: `http://localhost:3000/health`

## Regole introdotte nella v3.0

### Minigiochi

- Sul tabellone completo restano esattamente tre caselle Minigioco: **6, 17 e 23**.
- Non esiste più una casella Sfida separata.
- Il Mazzo Sfide si apre soltanto quando un giocatore arriva su una delle tre caselle oppure quando una parità di distanza incide davvero su uno dei primi tre posti.
- Una parità interamente fuori dal podio non interrompe il round.
- La casella Minigioco assegna al vincitore **+1 punto e +1 casella**.

### Premio rimonta

- Le caselle Bonus sono state eliminate.
- Dopo **4 round consecutivi fuori dal podio**, il giocatore riceve il Premio rimonta.
- Soltanto la sua lavagnetta sceglie una delle tre carte Bonus proposte; gli altri dispositivi seguono in sola lettura.
- La serie torna a zero quando il giocatore rientra sul podio o riceve il premio.

### Tassa del podio

- Le caselle Malus sono state eliminate.
- Il gioco conta i piazzamenti sul podio complessivi di ogni giocatore.
- Al **3º, 6º, 9º, 12º e 15º podio** assegna automaticamente un Malus casuale a quel giocatore.
- Non c'è una scelta del destinatario: l'assegnazione è immediata, non duplicabile e può essere annullata da uno Scudo posseduto.

Master e lavagnette mostrano sempre i due contatori personali: avanzamento verso il Premio rimonta e podi accumulati.

## Mazzo Sfide

Le otto carte ufficiali restano: Stima Lampo, Cronometro del Master, Nomi & Cose, Alto o Basso, Intervallo Killer, Ordine Impossibile, La Bomba e Timeline Flash. Indizio dopo Indizio e Asta al Ribasso non sono estraibili.

Le prove interattive attivano soltanto i dispositivi degli sfidanti. Tutti gli altri vedono regole, stato, risposte e risultato in sola lettura. Il Cronometro delega AVVIA/FERMA a una lavagnetta spettatrice quando il Master è in sfida.

## Curiosità editoriali

Ogni domanda giocabile usa questa struttura:

```js
{cat:"...", q:"...", a:123, u:"...", f:"Fatto specifico...", fs:"https://fonte..."}
```

La schermata si chiama **“La storia dietro la domanda”**: il testo racconta un retroscena specifico e interessante, non ripete la risposta e non usa riempitivi generati dalla categoria. In questa versione sono state riscritte anche alcune schede troppo fredde o generiche, tra cui Coca-Cola, Fanta, pallina da tennis, pianoforte e Avengers: Endgame.

Una scheda senza `f` e `fs` resta nel database storico ma non viene sorteggiata. Il mazzo contiene **581 domande totali**, delle quali **213 attive e curate** e **368 escluse** in attesa di verifica. Esegui `npm run audit:questions` per rigenerare i due report editoriali.

## Stato autorevole e affidabilità

- Punteggio, posizione, podi e serie fuori podio vengono aggiornati una sola volta dopo il round.
- Bonus e Malus vengono accodati come eventi strutturati e risolti prima dell'eventuale casella speciale.
- Doppi click, replay e token estranei non possono assegnare due volte una risposta o un effetto.
- Il fallback Master compare soltanto quando la lavagnetta autorizzata è davvero indisponibile.
- Il mazzo domande non ripete una domanda nella stessa partita e conserva una finestra delle estrazioni recenti anche tra partite.
- Classifica punti e corsa sul tabellone restano distinte; Finale raggiunta significa vittoria immediata, altrimenti dopo 15 round si vince ai punti.

## Verifiche incluse

- **41 test automatici**, incluso l'end-to-end WebSocket con tre giocatori, riconnessione, scelte autorizzate, mini-sfide e fallback.
- **360 partite simulate** con 3–6 giocatori e tre semi indipendenti.
- Test eseguibile della progressione: Bonus al 4º e 8º round consecutivo fuori podio; Malus al 3º, 6º e 9º podio.
- Controllo del tabellone: tre sole caselle Minigioco e nessuna casella Bonus, Malus o Sfida.
- Audit editoriale fail-closed su tutte le 581 schede.

Vedi `SIMULATION_REPORT.md`, `PLAYTEST_REPORT.md`, `BUG_RISOLTI.md` e `DEPLOY_RENDER.md` per i dettagli.
