# File da aggiornare su GitHub

Carica **il contenuto** di `A_OCCHIO_GITHUB_UPDATE_V2_4` nella root del repository `A-occhio-server`. Non caricare la cartella come sottocartella.

## File applicativi da sostituire

- `game.html`
- `server.js`
- `package.json`
- `pnpm-lock.yaml`

`index.html`, `app.js` e `styles.css` sono inclusi nel pacchetto per avere una root completa, ma in questa versione non contengono la correzione principale.

## Directory da caricare

- `scripts/`
  - `audit-questions.js`
  - `check-game.js`
- `tests/`
  - `choice-regression.test.js`
  - `e2e.test.js`
  - `editorial.test.js`
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

## Vecchie copie da eliminare dalla root

Nel commit di partenza questi file erano nella posizione sbagliata. Dopo aver caricato le directory, elimina soltanto le copie nella root:

- `audit-questions.js`
- `check-game.js`
- `e2e.test.js`
- `editorial.test.js`
- `rules.test.js`

Non eliminare `scripts/`, `tests/` né gli altri file applicativi. Un deploy Render usa direttamente la root del repository.
