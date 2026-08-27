'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('game.html','utf8');
function between(start,end){
  const from=html.indexOf(start);
  assert.notEqual(from,-1,`sezione assente: ${start}`);
  const a=from+start.length;
  const b=html.indexOf(end,a);
  assert.notEqual(b,-1,`fine sezione assente: ${end}`);
  return html.slice(a,b);
}

const meta=vm.runInNewContext(`(${between('const MINI_GAME_META = ',';\nconst MINI_GAME_KEYS')})`);
const orderCards=vm.runInNewContext(between('const MINI_ORDER_CARDS = ',';\nconst MINI_TIMELINE_CARDS'));
const timelineCards=vm.runInNewContext(between('const MINI_TIMELINE_CARDS = ',';\nconst MINI_CLUE_CARDS'));
const clueCards=vm.runInNewContext(between('const MINI_CLUE_CARDS = ',';\nconst MINI_BOMB_CATEGORIES'));

test('il Mazzo Sfide contiene i tre giochi originali e sette nuovi giochi',()=>{
  assert.deepEqual(Object.keys(meta),[
    'lampo','crono','ncc','altobasso','intervallo','ordine','indizi','bomba','asta','timeline'
  ]);
  for(const [key,game] of Object.entries(meta)){
    assert.ok(game.icon,key);
    assert.ok(game.name.length>=6,key);
    assert.ok(game.duration.length>=8,key);
    assert.ok(game.win.length>=10,key);
    assert.equal(game.rules.length,3,key);
    game.rules.forEach(rule=>assert.ok(rule.length>=25,`${key}: ${rule}`));
  }
});

test('la carta viene estratta automaticamente senza menu del tipo di minigioco',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/S\.cardBags\["mini-games"\]/);
  assert.match(source,/findIndex\(key=>key!==S\.lastMiniGame&&MINI_GAME_META\[key\]\.family!==S\.lastMiniFamily\)/);
  assert.match(source,/showRules\(chooseMode\(\)\)/);
  assert.match(source,/if\(finished\|\|!w\)return;finished=true/);
  assert.doesNotMatch(source,/Scegli il minigioco|tgRandom|tgNcc|miniMenu/);
  assert.match(source,/Vedi tutte le 10 carte del Mazzo Sfide/);
  assert.match(source,/MINI_GAME_KEYS\.map/);
});

test('le mini sfide interattive attivano soltanto le lavagnette degli sfidanti',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  for(const title of ['Stima Lampo','Cronometro del Master','Alto o Basso','Intervallo Killer','Asta al Ribasso']){
    assert.match(source,new RegExp(`title:\\"${title}\\"`),title);
  }
  assert.match(source,/onlineRequestMiniInputs/);
  assert.match(source,/remote-mini-status/);
  assert.match(source,/closeOnlineMini/);
  assert.match(html,/const ONLINE_MINI_CALLBACKS=new Map\(\)/);
});

test('la casella speciale fa scegliere sfidante e pesca soltanto alla lavagnetta autorizzata',()=>{
  const source=between('function wireRandomChallenge(lander,rootSelector,cfg){','\nfunction renderTesiBody(lander){');
  assert.equal((source.match(/onlineRequestPlayerChoice/g)||[]).length,2);
  assert.match(source,/chooser:lander,title:"Scegli lo sfidante"/);
  assert.match(source,/id:"draw",label:"🎴 Pesca una carta casuale"/);
  assert.match(source,/if\(!opponent\|\|drawing\|\|started\)return;drawing=true/);
  assert.match(source,/if\(started\|\|!opponent\)return;started=true/);
  assert.match(source,/diceRollWinner\(\[lander,opponent\]/);
});

test('le parità di distanza entrano direttamente nel mazzo casuale',()=>{
  const ties=between('// risolve un cluster alla volta','\n\nfunction questionFunFact');
  const order=between('function diceOrder(players, opts, done){','\nfunction renderPostRound(){');
  assert.match(ties,/diceOrder\(group/);
  assert.match(order,/diceRollWinner\(remaining/);
  assert.match(order,/stakes:place\+"º posto nel round"/);
  assert.doesNotMatch(order,/prompt|Scegli/);
});

test('Master e lavagnette ricevono motivo, sfidanti e carta estratta dallo stesso snapshot',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/kind:"challenge"/);
  assert.match(source,/challenge:\{reason:opts\.reason\|\|null,game:/);
  assert.match(source,/players:players\.map/);
  assert.match(source,/reasonHtml\(opts\.reason\)/);
  assert.match(html,/function buildTieReason\(entries,q\)/);
});

test('le ricompense originali delle due caselle restano distinte',()=>{
  const wire=between('function wireSpecial(type, lander){','\nfunction wireRandomChallenge');
  const mini=wire.match(/else if\(type==="alfabetica"\)[\s\S]*?\n  \}/)[0];
  const challenge=wire.match(/else if\(type==="duello"\)[\s\S]*?\n  \}/)[0];
  assert.match(mini,/applyPlayerDelta\(win,\{score:1,pos:1,source:"Casella Minigioco"/);
  assert.doesNotMatch(challenge,/score:1/);
  assert.match(challenge,/applyPlayerDelta\(win,\{pos:1,source:"Casella Sfida"/);
  const board=vm.runInNewContext(between('let BOARD = ',';\nconst BOARD_FULL'));
  assert.equal(board[5],'duello');
  assert.equal(board[22],'alfabetica');
});

test('le carte editoriali dei nuovi giochi hanno curiosità e fonte',()=>{
  for(const card of [...orderCards,...timelineCards,...clueCards]){
    assert.ok(card.fact.length>=55,card.title);
    assert.match(card.source,/^https:\/\//,card.title);
  }
  assert.doesNotMatch(html,/function startAlfabeticaGame|function renderAlfabeticaBody/);
});
