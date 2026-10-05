'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');

const game=fs.readFileSync('game.html','utf8');
const server=fs.readFileSync('server.js','utf8');

test('il checkpoint conserva lo stato autorevole senza serializzare il timer attivo',()=>{
  assert.match(game,/const GAME_CHECKPOINT_KEY="aocchio_game_checkpoint_v1"/);
  assert.match(game,/used:\[\.\.\.\(S\.used\|\|\[\]\)\]/);
  assert.match(game,/timer:\{\.\.\.\(S\.timer\|\|\{\}\),id:null\}/);
  assert.match(game,/state\.used=new Set/);
  assert.match(game,/winnerFinalId/);
});

test('i checkpoint sicuri coprono domanda, fine round e fine partita',()=>{
  const finalize=game.match(/function finalizeDraw\([\s\S]*?\n\}/)[0];
  assert.ok(finalize.indexOf('saveGameCheckpoint("question")')<finalize.indexOf('startWriting()'));
  assert.match(game,/function renderPostRound\(\)[\s\S]*?saveGameCheckpoint\("postround"\)/);
  assert.match(game,/function renderGameOver\(recovered=false\)[\s\S]*?saveGameCheckpoint\("gameover"\)/);
});

test('al refresh il Master recupera stanza e partita invece di tornare alla home',()=>{
  assert.match(game,/const RECOVERED_CHECKPOINT=restoreGameCheckpoint\(\)/);
  assert.match(game,/const HAS_SAVED_MASTER=loadSavedMasterSession\(\)/);
  assert.match(game,/onlineConnect\(ONLINE\.url\|\|location\.origin,true\)/);
  assert.match(game,/if\(RECOVERED_CHECKPOINT\)renderRecoveredGame\(RECOVERED_CHECKPOINT\)/);
});

test('un round interrotto riparte dalla stessa domanda senza ripescarla',()=>{
  const recovery=game.match(/function renderRecoveredGame\([\s\S]*?\n\}/)[0];
  assert.match(recovery,/else startWriting\(\)/);
  assert.doesNotMatch(recovery,/drawQuestion\(/);
  assert.match(recovery,/Le risposte eventualmente inviate prima dell’aggiornamento vengono cancellate/);
});

test('il recupero attende la conferma del server e gestisce una stanza Render scaduta',()=>{
  assert.match(game,/ONLINE\.masterReady=true/);
  assert.match(game,/ONLINE\?\.ws\?\.readyState===WebSocket\.OPEN&&ONLINE\.masterReady/);
  assert.match(game,/if\(m\.reset&&ONLINE\?\.ws===ws\)/);
  assert.match(game,/ONLINE\.roomExpired=true/);
  assert.match(game,/ws\.send\(JSON\.stringify\(\{t:"create"\}\)\)/);
});

test('riavviare la stessa domanda riallinea il round e annulla richieste parziali sul server',()=>{
  const questionHandler=server.match(/if \(m\.t === 'q'[\s\S]*?\n    \}/)[0];
  assert.match(questionHandler,/room\.round = Number\.isFinite\(masterRound\)/);
  assert.match(questionHandler,/room\.activeChoice = null/);
  assert.match(questionHandler,/room\.activeMini = null/);
  assert.match(questionHandler,/room\.estimates\.clear\(\)/);
});

test('anche la lobby ripristina automaticamente i nickname delle lavagnette',()=>{
  const setup=game.match(/function renderSetup\(\)[\s\S]*?\n\}/)[0];
  assert.match(setup,/if\(ONLINE\?\.players\?\.length\)syncJoinedPlayers\(ONLINE\.players\)/);
});
