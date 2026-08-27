# Audit pre-modifica — A OCCHIO! v2.6

Base esaminata integralmente prima della modifica: pacchetto v2.5 derivato dal repository `A-occhio-server`.

## Struttura trovata

- `server.js`: server HTTP, stanze WebSocket in memoria e pagina lavagnetta incorporata nella costante `PAD`.
- `game.html`: intero client Master, stato partita, database domande, punteggi, tabellone, eventi speciali e dieci minigiochi.
- `index.html`, `app.js`, `styles.css`: landing separata dal gioco `/gioco`.
- `scripts/`: controlli di sintassi e audit editoriale.
- `tests/`: regressioni scelte, protocollo WebSocket, editoriale, minigiochi e regole.
- Database v2.5: 411 domande totali, 43 curate e attive, 368 escluse.

## Cause reali individuate prima di intervenire

1. **Sfide apparentemente fra distanze diverse.** Il calcolo usava correttamente la distanza effettiva dopo i Malus, ma alcune schermate esponevano soltanto la distanza reale. Due giocatori potevano quindi risultare pari nello stato autorevole e diversi a video.
2. **Due motivi di sfida confusi.** Un fotofinish nasce da distanze valide uguali; la casella Sfida nasce invece dal percorso, indipendentemente dalla risposta. La UI non distingueva abbastanza i due ingressi.
3. **Motivazione persa.** Il risolutore riceveva solo i giocatori; domanda, stime, risposta corretta e modificatori non viaggiavano in uno snapshot strutturato verso le lavagnette.
4. **Contesto obsoleto.** Il server allegava il risultato precedente anche ad alcuni aggiornamenti di sfida, facendo sembrare che la nuova carta derivasse da dati vecchi.
5. **Paracadute non applicato.** La carta era definita e assegnabile, ma nessun percorso di calcolo ne consumava o applicava l’effetto.
6. **Randomizzazione frammentata.** Round, Stima Lampo e altri minigiochi pescavano con chiamate casuali indipendenti; dopo una nuova partita una domanda poteva ricomparire subito.
7. **Mazzi speciali senza ciclo.** Lettere, categorie e carte dati potevano ripetersi prima che le alternative fossero state percorse.
8. **Stato punti/caselle disperso.** Le mutazioni erano distribuite fra round ed eventi speciali. Lo stato finale era corretto nei casi semplici, ma non esisteva un unico registro per animazione, log e payload lavagnette.
9. **Paracadute e Anti-Sapientone non condividevano una formula visibile.** Il punteggio poteva essere coerente senza permettere al tavolo di ricostruire la distanza valida.
10. **Classifica e tabellone mescolati.** Una singola riga accostava punti e casella senza spiegare che la Finale vince immediatamente, mentre i punti decidono soltanto al limite dei 15 round.
11. **Movimento incompleto.** L’animazione copriva l’avanzamento base ma non tutte le variazioni speciali; inoltre gli arretramenti del Dado Caos non venivano animati.
12. **Fine partita riutilizzabile.** `startGame()` non azzerava esplicitamente il precedente `winnerFinal`; una partita successiva poteva quindi ereditare un esito vecchio in un percorso di chiusura anticipata.
13. **Copertura editoriale limitata.** Le 43 domande curate erano corrette, ma troppo poche rispetto alle 17 categorie e al numero di partite richiesto.

## Strategia applicata

- Distanza effettiva unica (`effectiveDist`) con formula, tolleranza numerica e motivazione Sfida strutturata.
- Ledger centrale per ogni variazione di punti e posizione.
- Shuffle-bag condiviso per domande e dedicato per carte/minigiochi, con memoria persistente delle estrazioni recenti.
- 170 nuove schede curate, 10 per categoria, mantenendo fail-closed le 368 incomplete.
- Due classifiche distinte, animazione ledger, regole di vittoria sempre visibili e fine manuale esplicita.
- Fallback delle scelte soltanto su indisponibilità confermata; nessuna scadenza arbitraria che sottragga la decisione al giocatore collegato.
- Test statici, test dinamici del protocollo, simulazioni deterministiche e collaudo browser Master/lavagnette.

## Vincoli mantenuti

- Punteggio base e movimento base restano 3/2/1 nelle partite da almeno tre giocatori.
- La casella Sfida conserva la ricompensa di +1 casella; Minigioco conserva +1 punto e +1 casella.
- In modalità a due giocatori resta la regola Duello già esistente.
- Nessuna curiosità viene inventata dalla categoria o ricavata copiando HTML dal Master.
