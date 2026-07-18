# A OCCHIO! — Fix definitivo UI lavagnette

Modifiche principali:

- risposta corretta, risultato, classifica e mappa sempre visibili;
- bonus e malus inviati come dati strutturati, senza copiare testo grezzo dal Master;
- anteprima leggibile di Bonus/Malus senza controlli di selezione sulle lavagnette;
- carta scelta e destinatario mostrati dopo la conferma del Master;
- curiosità automatiche inventate eliminate;
- vengono mostrate soltanto curiosità curate nel campo `f` o nel dizionario verificato;
- malus tempo aggiornati:
  - Risposta lampo: 10 secondi;
  - Copione: 15 secondi;
- scadenza personale applicata e verificata anche dal server;
- la lavagnetta viene disabilitata realmente alla scadenza personale;
- il Master viene bloccato allo stesso modo quando subisce un malus tempo;
- rotte Render preservate.

## Deploy

Sostituire tutti i file nella root della repository e usare:

Manual Deploy → Clear build cache & deploy
