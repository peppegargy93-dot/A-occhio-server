# Changelog

## 3.0.0 — percorso rapido, premi per andamento e curiosità rafforzate

- Ridotto il tabellone a tre sole caselle Minigioco, nelle posizioni 6, 17 e 23; eliminate dal percorso le caselle Sfida, Bonus e Malus.
- Limitato il Mazzo Sfide alle parità che incidono realmente sul podio e agli arrivi sulle tre caselle Minigioco.
- Introdotto il Premio rimonta: dopo quattro round consecutivi fuori dal podio, il giocatore sceglie un Bonus dalla propria lavagnetta; la serie si azzera dopo il premio o un nuovo podio.
- Introdotta la Tassa del podio: al 3º, 6º, 9º, 12º e 15º piazzamento sul podio, il gioco assegna automaticamente un Malus allo stesso giocatore.
- Rimossa la scelta del destinatario da Bonus e Malus: il Premio rimonta appartiene a chi lo ha maturato e la Tassa colpisce chi ha raggiunto la soglia.
- Centralizzati i due contatori personali in `updatePerformanceProgress`, richiamata una sola volta per giocatore durante l'applicazione autorevole del punteggio.
- Mostrati su Master e lavagnette avanzamento rimonta, podi totali e distanza dal prossimo Malus.
- Rinominata la scheda editoriale in “La storia dietro la domanda” e riscritte le curiosità troppo generiche su Coca-Cola, Fanta, pallina da tennis, pianoforte, Avengers: Endgame e tre schede sportive.
- Aggiunti test su soglie ripetute, assenza delle vecchie caselle, presentazione editoriale e simulazioni dei nuovi eventi.

## 2.9.0 — mini sfide anti-blocco e Cronometro delegabile

- Spostato l’avvio della carta Sfida sulla lavagnetta di uno degli sfidanti collegati; se non è disponibile, il Master riceve un fallback esplicito.
- Aggiunta conferma `mini_ready` per ogni schermata interattiva. Se il dispositivo non conferma l’apertura entro 6 secondi, il server abilita il campo locale del solo giocatore mancante e impedisce un successivo doppio invio.
- Conservato sul server il payload delle scelte attive, così una lavagnetta sostituita o riconnessa riapre i pulsanti corretti.
- Corretta la corsa di riconnessione mobile: la chiusura ritardata del vecchio socket non annulla più la scelta o la mini-sfida già trasferita alla nuova connessione.
- Ingrandite le aree touch; nelle prove a scelta singola, come Alto o Basso, il tocco seleziona e invia direttamente.
- Reso automatico il passaggio dopo i risultati e fra le manche di Alto o Basso, mantenendo il pulsante “Continua ora” come scorciatoia.
- Se il Master è uno sfidante del Cronometro, il gioco propone le lavagnette spettatrici collegate e invia all’arbitro scelto prima AVVIA e poi FERMA. Il comando può essere riassegnato dopo una caduta; senza arbitro la carta viene sostituita.
- Il Cronometro viene escluso dall’estrazione quando il Master è in sfida e non esiste alcun arbitro esterno collegato.
- Corretta la posta del fotofinish: posizione e punti partono dalla collocazione reale del gruppo, invece di ricominciare sempre dal primo posto.
- Limitate esplicitamente le sfide da parità ai gruppi che toccano i primi tre posti.
- Interrotta anche la risoluzione ricorsiva appena sono assegnati i posti da podio: gli eventuali pari dal quarto posto in giù non generano ulteriori carte.
- Estesa la vista spettatore di Ordine Impossibile e Timeline Flash con l’elenco completo delle carte in gioco.
- Suite portata a 40 test, con consegna confermata, riconnessione durante una scelta, sequenza AVVIA/FERMA, fallback per schermata non aperta e guardia eseguibile sul limite del podio.

## 2.8.0 — otto sfide ufficiali e ordinamento sulle lavagnette

- Rimossi dal mazzo e dal codice eseguibile **Indizio dopo Indizio** e **Asta al Ribasso**.
- Ridotto lo shuffle-bag ufficiale a otto carte, senza alterare ricompense, punti o tabellone.
- Trasformati **Ordine Impossibile** e **Timeline Flash** in giochi interattivi sulle lavagnette.
- Aggiunte quattro carte riordinabili con controlli su/giù responsive: 25 secondi per Ordine e 20 per Timeline.
- Allo scadere viene inviato automaticamente l’ordine presente; il server valida che la sequenza sia una permutazione completa e accetta un solo invio per token autorizzato.
- Quando entrambi gli sfidanti hanno risposto, il gioco rivela automaticamente a tutti le due sequenze, la soluzione, il vincitore e la curiosità.
- Estesa la vista spettatore a ogni minigioco: domanda o categoria durante la prova, quindi risposte ed esito. Gli spettatori non ricevono comandi.
- Nomi & Cose e La Bomba restano vocali con convalida del Master; il Cronometro resta controllato dal Master ma le stime vengono inserite sulle lavagnette.
- Aggiunti controlli WebSocket per campi `order`, deadline condivisa, duplicati e risposte contraffatte; suite portata a 35 test.

## 2.7.0 — dieci minigiochi visibili e risposte sulle lavagnette

- Verificato il deploy precedente: GitHub e Render servivano ancora il vecchio `game.html` con il menu dei soli tre minigiochi.
- Reso visibile sulla carta Sfida l’elenco completo delle dieci carte del mazzo.
- Confermato lo shuffle-bag: tutte le dieci carte vengono percorse prima del riuso.
- Stima Lampo, Cronometro del Master, Alto o Basso, Intervallo Killer e Asta al Ribasso attivano soltanto le lavagnette degli sfidanti.
- Gli altri telefoni restano spettatori e non possono inviare risposte contraffatte.
- Il Master riceve le risposte già bloccate; se uno sfidante è il Master, risponde localmente. Il fallback di un giocatore remoto compare soltanto dopo la sua disconnessione.
- Aggiunto protocollo server `mini_request`/`mini_response`, con token autorizzati, validazione, risposta unica e recupero alla riconnessione.
- Suite portata a 33 test, incluso un end-to-end con due sfidanti attivi e una lavagnetta spettatrice.

## 2.6.0 — stato autorevole, mazzi senza ripetizioni e 170 nuove domande

- Le sfide da parità mostrano motivo, risposta corretta, stime, distanza reale, distanza valida e formula dei modificatori; una parità viene aperta soltanto per distanze valide uguali.
- Le sfide da casella dichiarano invece casella, giocatore arrivato e avversario scelto, evitando di confonderle con i fotofinish del round.
- Eliminato il contesto obsoleto del round precedente dalle schermate Sfida.
- Unificata l’estrazione delle domande fra round, Stima Lampo, Tiro al Leader, Alto o Basso, Intervallo Killer e Asta al Ribasso.
- Aggiunti shuffle-bag persistenti per domande, dieci minigiochi e carte speciali; nessuna domanda può ripetersi nella stessa partita.
- Aggiunte 170 domande curate, 10 per ciascuna delle 17 categorie. Il database passa a 581 schede, delle quali 213 attive e 368 escluse.
- Implementato il Bonus Paracadute sulla distanza valida, con consumo singolo e formula visibile.
- Centralizzate tutte le variazioni di punti e caselle in un ledger autorevole, usato anche per riepilogo e animazione.
- Separate classifica punti e corsa sul tabellone su Master e lavagnette; rese sempre visibili le due condizioni di vittoria.
- Animati anche gli arretramenti prodotti dal Dado Caos.
- Corretta la nuova partita affinché non conservi il vincitore precedente; distinta la fine manuale dal limite dei 15 round.
- Rimosso il fallback Master a tempo: compare soltanto per il Master stesso o dopo indisponibilità/disconnessione confermata dal server.
- Il server conserva stime del round, timer personale ed esiti delle scelte: dopo una caduta WebSocket il Master recupera gli eventi non ancora confermati e la lavagnetta non riottiene secondi extra.
- I nuovi ingressi vengono rifiutati dopo l’avvio, mentre le riconnessioni tramite token restano ammesse; l’identità delle lavagnette usa il token e non il nickname.
- Bonus e Malus già posseduti non vengono più annunciati come assegnati né duplicati; le opzioni propongono soltanto destinatari validi.
- Le stime con suffissi non numerici vengono rifiutate; la vecchia pagina `index.html` reindirizza al client autorevole `/gioco`.
- Aggiunti test del mazzo domande, del ledger, del Paracadute, delle motivazioni Sfida, del movimento bidirezionale, della vittoria e della riconnessione; suite portata a 32 test.
- Aggiunto simulatore deterministico: 360 partite con 3–6 giocatori e report riproducibile.

## 2.5.0 — Mazzo Sfide casuale

- Unificati pareggi, casella Sfida e casella Minigioco in un unico Mazzo Sfide autorevole.
- Rimossa la scelta manuale del tipo di minigioco: l’estrazione parte automaticamente nei pareggi.
- Sulle caselle speciali, soltanto il giocatore arrivato sceglie avversario e pesca dalla propria lavagnetta; resta il fallback Master già protetto dalla disconnessione.
- Portato il mazzo da 3 a 10 prove con Alto o Basso, Intervallo Killer, Ordine Impossibile, Indizio dopo Indizio, La Bomba, Asta al Ribasso e Timeline Flash.
- Aggiunta una carta introduttiva responsive con tre regole, durata, criterio di vittoria, partecipanti e ricompensa.
- Evitate ripetizioni consecutive della stessa prova e, quando possibile, della stessa famiglia.
- Aggiunte carte editoriali con curiosità e fonte per i minigiochi basati su dati.
- Reintrodotta nel percorso completo la casella Minigioco alla posizione 23; la casella 6 resta Sfida.
- Aggiunti 6 test specifici del Mazzo Sfide; suite totale portata a 22 test.

## 2.4.0 — scelte sbloccate e affidabilità mobile

- Corretto il blocco quando il Master termina su Bonus o Malus: la scelta viene ora eseguita localmente sul Master.
- Aggiunti `choice_ready`, timeout di 12 secondi, annullamento e fallback per tutte le richieste remote non consegnate.
- Resi idempotenti i due passaggi del Bonus e l’assegnazione del Malus.
- Corretto il bug che trasformava `/\s+/` in `/s+/` nella pagina incorporata e cancellava le lettere “s” sulle lavagnette.
- Sostituito lo spezzamento `anywhere` con una resa conservativa compatibile con Safari/iPhone e Android.
- Rafforzata la riconnessione mobile con timeout di apertura, backoff con jitter, eventi `online`/`focus`/`pageshow` e heartbeat.
- Aggiunte 6 domande musicali sul conteggio di parole, tutte con curiosità specifica e fonte.
- Portato il mazzo editoriale attivo a 43 domande; 368 schede non curate restano escluse.
- Aggiunta la “Sorte del tabellone”, la posta visibile nei minigiochi e l’indicazione della prossima casella speciale, senza cambiare i punteggi originali.
- Aggiunti test di regressione mirati e ampliato l’end-to-end WebSocket con conferma e annullamento della scelta.

## 2.3.0 — revisione editoriale fail-closed

- Eliminato il fallback con conversioni numeriche.
- Aggiunto un archivio di curiosità legate alla domanda esatta, ciascuna con fonte HTTPS.
- Attivate 37 domande curate distribuite in 9 categorie.
- Escluse automaticamente dal sorteggio le 368 domande non ancora revisionate.
- Nascondi le categorie senza almeno una domanda editoriale completa.
- Aggiunti audit e test automatici della copertura editoriale.

## 2.2.0 — scelta Bonus e curiosità obbligatorie

- Corretto il race condition mostrato nel test reale: l'anteprima Bonus/Malus viene ora inviata prima della richiesta interattiva e non può più sovrascrivere i pulsanti del giocatore autorizzato.
- La curiosità viene ora mostrata dopo ogni risposta, sul Master e sulle lavagnette.
- Se una domanda non possiede ancora `f`/`fs` editoriali, viene prodotta una contestualizzazione numerica specifica e pertinente alla risposta (conversioni di tempo, lunghezza, peso o scala), con provenienza dichiarata.
- Aggiunta la fonte/provenienza visibile anche sulla lavagnetta.

## 2.1.0 — audit multiplayer e affidabilità

- Ridisegnata la scelta su lavagnetta con griglia a colonna singola, scroll verticale contenuto, safe area e regole specifiche per viewport strette/Safari iPhone.
- Reso il server autorevole per Bonus, Malus e destinatari: richiesta associata al token del giocatore, opzioni validate, una sola risposta accettata e replay rifiutati.
- Limitato il fallback Master al solo caso di disconnessione della lavagnetta autorizzata.
- Rimossa la costruzione di messaggi copiando `innerText` dal DOM Master; tutti gli aggiornamenti usano payload strutturati.
- Corretto Anti-Sapientone/Fenomeno: assegnazione idempotente, flag coerente, distanza effettiva unica, log senza variabili fuori scope e malus permanenti non duplicabili.
- Bloccato immediatamente il pulsante di applicazione punteggio e mantenuta la guardia transazionale per round.
- Uniformata la durata Timer Challenge a 10 secondi tra testo ed effetto.
- Aggiunto rename del nickname dalla lavagnetta prima dell'inizio, con controllo duplicati e aggiornamento automatico della lobby.
- Corretta la riconnessione quando il round è già bloccato.
- Normalizzato a runtime lo schema di tutte le domande con `q`, `a`, `f`, `fs`; le curiosità prive di fonte verificata non vengono mostrate.
- Aggiunti audit editoriale riproducibile e report completo delle domande ancora da verificare.
- Aggiunto test end-to-end WebSocket con tre giocatori.
