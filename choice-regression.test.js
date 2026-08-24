'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');

const game=fs.readFileSync('game.html','utf8');
const server=fs.readFileSync('server.js','utf8');

test('il Master sceglie localmente senza attendere una lavagnetta inesistente',()=>{
  const fn=game.match(/function onlineRequestPlayerChoice\([\s\S]*?\n\}/)[0];
  assert.ok(fn.indexOf('chooser.id===masterPlayer.id')<fn.indexOf('choice_request'));
  assert.match(fn,/master_local/);
});

test('ogni richiesta remota ha conferma, timeout, annullamento e fallback',()=>{
  assert.match(game,/ONLINE_CHOICE_CALLBACKS\.set\(requestId,\{callback,timer,ready:false\}\)/);
  assert.match(game,/setTimeout\([\s\S]*?cancel_choice[\s\S]*?12000\)/);
  assert.match(game,/m\.t==="choice_ready"/);
  assert.match(game,/m\.t==="choice_error"[\s\S]*?fallbackOnlineChoice\(m\)/);
  assert.match(server,/m\.t === 'choice_ready'/);
  assert.match(server,/m\.t === 'cancel_choice'/);
});

test('la scelta è idempotente e il testo mobile non viene spezzato lettera per lettera',()=>{
  assert.match(game,/let completed=false/);
  assert.match(game,/if\(completed\|\|!b\|\|!target\)return/);
  assert.match(game,/if\(completed\|\|!tgt\)return/);
  assert.doesNotMatch(server,/overflow-wrap:anywhere/);
  assert.match(server,/overflow-wrap:break-word;word-break:normal/);
  assert.match(server,/font-variant-ligatures:none/);
  assert.match(server,/replace\(\/\\\\s\+\/g/);
  assert.doesNotMatch(server,/replace\(\/\\s\+\/g/);
});

test('Android riprova la connessione su rete, focus e ritorno alla pagina',()=>{
  assert.match(server,/setTimeout\(\(\)=>\{if\(socket\.readyState===WebSocket\.CONNECTING\)socket\.close\(\)\},9000\)/);
  assert.match(server,/addEventListener\('online'/);
  assert.match(server,/addEventListener\('focus'/);
  assert.match(server,/addEventListener\('pageshow'/);
  assert.match(server,/server_ping/);
});
