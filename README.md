# A OCCHIO! — UI lavagnette, risultati e curiosità

Questa versione mantiene il gioco esistente e corregge la presentazione sui telefoni usati come lavagnetta.

## Modifiche principali

- Bonus, malus e caselle speciali non vengono più copiati come testo grezzo dalla schermata del Master.
- Gli eventi sono inviati con campi separati: casella, giocatore, effetto e istruzione.
- Durante bonus e malus restano visibili la risposta corretta dell’ultimo round e la classifica aggiornata.
- I risultati distinguono chiaramente il totale provvisorio dal punteggio definitivo.
- Dopo il movimento delle pedine vengono mostrati punteggio, posizione e casella effettivi.
- Ogni risposta mostra una curiosità breve. Le domande possono avere una curiosità personalizzata nel campo `f`; in assenza viene generata una curiosità coerente con la categoria.
- Corretti spazi, duplicazioni e punteggiatura dei messaggi sulle lavagnette.

## Deploy

Sostituire i file nella root della repository mantenendo esattamente questi nomi. Su Render usare `Clear build cache & deploy`.
