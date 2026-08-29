# File da aggiornare su GitHub

Carica **il contenuto** di `A_OCCHIO_FILE_DA_CARICARE_GITHUB_V2_8` nella root del repository `A-occhio-server`. Non caricare la cartella v2.8 come sottocartella.

## Correzione indispensabile

Per rendere effettiva questa correzione devi almeno sostituire nella root GitHub questi due file; caricarli dentro una sottocartella non aggiorna il gioco pubblicato:

- `game.html`
- `server.js`

Per evitare errori è inclusa anche la cartella `A_OCCHIO_SOSTITUISCI_QUESTI_2_FILE_V2_8`, che contiene soltanto quei due file. Non lasciare i file nuovi dentro una sottocartella: devono sostituire gli omonimi già visibili nella pagina principale del repository.

## File applicativi da sostituire

- `game.html`
- `server.js`
- `package.json`
- `pnpm-lock.yaml`

Per una root completa sono inclusi anche `index.html`, `app.js` e `styles.css`; puoi sostituirli insieme agli altri file.

## Directory da sostituire integralmente

- `scripts/`
  - `audit-questions.js`
  - `check-game.js`
  - `simulate-games.js`
- `tests/`
  - `choice-regression.test.js`
  - `e2e.test.js`
  - `editorial.test.js`
  - `minigames.test.js`
  - `question-deck.test.js`
  - `rules.test.js`

## Documenti da sostituire

- `README.md`
- `AUDIT_PRE_MODIFICA.md`
- `AUDIT_EDITORIALE_DOMANDE.md`
- `DOMANDE_DA_VERIFICARE.md`
- `CHANGELOG.md`
- `BUG_RISOLTI.md`
- `DEPLOY_RENDER.md`
- `FILE_DA_CARICARE_GITHUB.md`
- `MAZZO_SFIDE.md`
- `SIMULATION_REPORT.md`
- `PLAYTEST_REPORT.md`

## Cosa eliminare dalla root GitHub

Se sono ancora presenti, elimina le vecchie cartelle caricate per errore come contenitori:

- `A_OCCHIO_GITHUB_UPDATE_V2_1/`
- `A_OCCHIO_GITHUB_UPDATE_V2_2/`
- qualsiasi altra cartella `A_OCCHIO_GITHUB_UPDATE_V*/`

Elimina inoltre le vecchie copie dei test/script rimaste direttamente nella root:

- `audit-questions.js`
- `check-game.js`
- `e2e.test.js`
- `editorial.test.js`
- `rules.test.js`

Non eliminare `scripts/`, `tests/` o i file applicativi. Alla fine `game.html`, `server.js`, `package.json`, `scripts/` e `tests/` devono trovarsi direttamente nella root del repository.

## Controllo prima del commit

```bash
npm install
npm run check
npm test
npm run audit:questions
npm run simulate
```

Risultato atteso: 35 test superati, 213 domande curate, 368 escluse e 360 partite simulate con stato `OK`.

## Controllo dopo il caricamento

1. Apri `game.html` direttamente su GitHub e cerca `A OCCHIO! v2.8.0`.
2. Nello stesso file cerca `Vedi tutte le 8 carte del Mazzo Sfide`.
3. Dopo il deploy, apri `/health`: deve comparire `"version":"2.8.0"`.

Se uno di questi controlli fallisce, GitHub o Render stanno ancora usando i file precedenti.
