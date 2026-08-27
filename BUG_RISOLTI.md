# Bug risolti nella v2.7

## Minigiochi e lavagnette

- Il deploy precedente utilizzava ancora il `game.html` vecchio: per questo comparivano soltanto i tre minigiochi originali.
- Tutte le dieci carte sono ora elencate nella schermata di estrazione e percorse dallo stesso shuffle-bag.
- Le mini sfide con risposta numerica o scelta attivano esclusivamente le lavagnette degli sfidanti.
- Le lavagnette spettatrici non ricevono i campi e il server rifiuta risposte inviate con token estranei.
- Il Master riceve una sola risposta per sfidante e può rivelare il risultato soltanto quando entrambe sono arrivate.
- Una lavagnetta disconnessa abilita il fallback del solo giocatore mancante.

## Sfide e distanze

- Le parità non vengono più dedotte dalla distanza mostrata parzialmente: ordinamento, sfida e punteggio usano la stessa `effectiveDist` autorevole.
- Master e lavagnette mostrano perché parte la sfida, le stime, la risposta corretta e la formula completa dopo Malus/Paracadute.
- Le sfide provocate da una casella sono dichiarate come evento del tabellone e non come parità.
- La carta estratta e i partecipanti derivano dallo stesso snapshot strutturato; non viene copiato testo dal DOM Master.
- Doppi click e callback ripetute non possono assegnare due volte esito o ricompensa.

## Bonus, Malus e scelte

- Soltanto la lavagnetta del giocatore coinvolto riceve i pulsanti; tutti gli altri dispositivi restano in sola lettura.
- Il Bonus in due passaggi (carta e destinatario) prosegue correttamente senza essere sovrascritto dall’anteprima.
- Il fallback Master non dipende più da un timeout arbitrario: si apre solo per il Master stesso o dopo disconnessione/indisponibilità confermata dal server.
- La risposta è vincolata al token, al `requestId` e alle opzioni autorizzate; replay e dispositivi estranei vengono rifiutati.
- Se il Master perde la connessione, stime ed esiti delle scelte restano sul server e vengono riprodotti alla riconnessione fino alla conferma di ricezione.
- La lavagnetta riconnessa conserva il proprio timer personale e non riceve una nuova scadenza.
- Bonus e Malus già attivi non vengono duplicati o annunciati erroneamente come assegnati.
- Paracadute ora si applica, dimezza una sola volta la peggiore distanza valida e viene consumato.

## Domande e curiosità

- Il random indipendente che riproponeva le stesse domande è sostituito da un mazzo condiviso senza reinserimento nella stessa partita.
- La memoria del ciclo sopravvive a una nuova partita e conserva anche una finestra delle domande recenti.
- Round e minigiochi numerici pescano dallo stesso stato, quindi Stima Lampo non può riproporre una domanda già giocata.
- Aggiunte 170 domande curate, 10 per categoria; corrette anche due formulazioni che rendevano troppo evidente la risposta.
- Ogni domanda attiva possiede curiosità specifica e fonte HTTPS; le 368 schede storiche incomplete restano escluse e sono elencate nel report.

## Punti, tabellone e vittoria

- Tutte le variazioni di punti e caselle passano da un solo ledger autorevole, compresi Posta Doppia, Gemelli, Sfida, Minigioco, Tiro al Leader, Azzardo, Dado Caos e Tesi & Antitesi.
- Master e lavagnette ricevono lo stesso riepilogo con origine di ogni variazione.
- Classifica punti e corsa sul tabellone sono separate; la regola Finale/15 round è sempre visibile.
- Le pedine animano sia avanzamenti sia arretramenti.
- Una nuova partita azzera il vincitore precedente e una fine manuale non viene più descritta come fine del 15º round.

## Verifiche eseguite

- Sintassi server e script Master: OK.
- 33 test automatici: OK.
- End-to-end WebSocket con Master e tre giocatori: ingresso, duplicati, rifiuto ingresso tardivo, rename, timer personale conservato alla riconnessione, replay di stime/scelte verso il Master, risposta unica, curiosità, sfida strutturata, scelta autorizzata, tentativo contraffatto, disconnessione, fallback e mappa: OK.
- 360 partite simulate, 5.162 domande, 3.718 minigiochi e 2.600 parità: tutte le invarianti OK.
- Collaudo browser con quattro giocatori fino al round successivo: Sfida, La Bomba, curiosità Master/lavagnetta, movimento e Bonus in due passaggi: OK.
- Audit HTTP delle 170 nuove schede: 141 URL unici, 126 raggiunti direttamente; 15 hanno rifiutato il client automatico o chiuso la connessione, nessun `404` rilevato.

## Problemi rimasti

- 368 domande storiche non hanno ancora curiosità e fonte verificate: non vengono sorteggiate.
- Stanze e stato partita sono in memoria. La breve riconnessione WebSocket è recuperata, ma un riavvio/deploy Render o un ricaricamento completo della pagina Master interrompe lo stato di gioco; la persistenza completa richiederebbe Redis/Postgres.
- Alcuni siti istituzionali bloccano i controlli HTTP automatici (`403`), quindi le fonti vanno ricontrollate editorialmente quando si aggiorna una scheda.
- Il collaudo automatico copre protocollo e layout; resta consigliato un ultimo test fisico su Safari iPhone e su almeno un Android dopo il deploy.
