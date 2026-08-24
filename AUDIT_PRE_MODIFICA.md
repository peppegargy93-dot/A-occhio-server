# Audit pre-modifica — A OCCHIO! v2.4

Snapshot esaminato integralmente prima delle modifiche: branch `main`, commit GitHub `e9457300c7f07faf8e861698257f112fb31f7c0f`.

## Struttura trovata

- `server.js`: HTTP statico, stanze WebSocket in memoria e pagina lavagnetta incorporata in `PAD_HTML`.
- `game.html`: client Master, stato di gioco, domande, punteggi, tabellone, minigiochi ed eventi speciali.
- `index.html`, `app.js`, `styles.css`: landing separata dal gioco `/gioco`.
- `scripts/`, `tests/`: nel repository remoto i relativi file erano stati caricati per errore nella root, mentre `package.json` li cercava nelle due directory.
- Database iniziale: 405 domande, delle quali 37 abilitate perché complete di curiosità e fonte.

## Cause reali dei problemi segnalati

1. **Blocco Bonus/Malus del Master.** `onlineRequestPlayerChoice` inoltrava sempre la richiesta a una lavagnetta cercata per nickname. Il primo giocatore è però il Master e non possiede un socket lavagnetta: il server rispondeva `choice_error`, il client mostrava soltanto l’errore e non richiamava il fallback. La schermata restava quindi sospesa per sempre.
2. **Blocco per mancata consegna.** Non esistevano conferma di apertura, scadenza o annullamento client della scelta. Anche una risposta persa o un errore diverso dalla disconnessione lasciava pendente la callback.
3. **Lettera “s” cancellata.** La lavagnetta è contenuta in un template literal server-side. La regex scritta come `/\s+/` perdeva il backslash quando il template veniva generato e arrivava al browser come `/s+/`, sostituendo realmente ogni `s` minuscola con uno spazio.
4. **Testi fragili su mobile.** `overflow-wrap:anywhere` permetteva di spezzare le etichette in qualunque punto; su viewport strette aumentava la percezione di lettere mancanti e parole deformate.
5. **Android intermittente.** La riconnessione dipendeva quasi soltanto da `close`/`pageshow`: mancavano timeout di apertura, gestione `online`/`focus`, jitter e heartbeat per individuare socket apparentemente aperti ma ormai inattivi.
6. **Editor (situazione iniziale).** Il filtro fail-closed era corretto, ma il mazzo attivo era limitato a 37 schede e non conteneva la nuova serie richiesta sul conteggio delle parole nelle canzoni.
7. **Dinamica.** Le regole erano coerenti, ma minigiochi e classifica comunicavano poco la posta e il prossimo evento del tabellone. Il miglioramento doveva restare presentazionale per non alterare il gameplay originale.

## Strategia applicata

- Fallback locale immediato per il Master; conferma, timeout, annullamento e deduplicazione per le lavagnette.
- Correzione della doppia escape nella pagina incorporata e regole tipografiche mobile più conservative.
- Riconnessione mobile guidata dagli eventi di rete/pagina e heartbeat WebSocket.
- Sei nuove domande musicali con criterio di conteggio esplicito, curiosità specifica e fonte.
- Rafforzamento visivo dei minigiochi e del percorso senza cambiare l’assegnazione dei punti.
