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
const timelineCards=vm.runInNewContext(between('const MINI_TIMELINE_CARDS = ',';\nconst MINI_BOMB_CATEGORIES'));

test('il Mazzo Sfide ufficiale contiene tre giochi originali e cinque nuovi giochi',()=>{
  assert.deepEqual(Object.keys(meta),[
    'lampo','crono','ncc','altobasso','intervallo','ordine','bomba','timeline'
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
  assert.match(source,/findIndex\(key=>available\(key\)&&key!==S\.lastMiniGame&&MINI_GAME_META\[key\]\.family!==S\.lastMiniFamily\)/);
  assert.match(source,/showRules\(chooseMode\(\)\)/);
  assert.match(source,/if\(finished\|\|!w\)return;finished=true/);
  assert.doesNotMatch(source,/Scegli il minigioco|tgRandom|tgNcc|miniMenu/);
  assert.match(source,/Vedi tutte le 8 carte del Mazzo Sfide/);
  assert.match(source,/MINI_GAME_KEYS\.map/);
});

test('le mini sfide interattive attivano soltanto le lavagnette degli sfidanti',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  for(const title of ['Stima Lampo','Cronometro del Master','Alto o Basso','Intervallo Killer']){
    assert.match(source,new RegExp(`title:\\"${title}\\"`),title);
  }
  assert.match(source,/function sequenceGame\(/);
  assert.match(source,/type:"order"/);
  assert.match(source,/function timeline\(\)\{sequenceGame\("timeline"[\s\S]*?,20\);\}/);
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
  assert.match(ties,/startPlace:c\.startPlace/);
  assert.match(ties,/maxPlace:3/);
  assert.match(order,/diceRollWinner\(remaining/);
  assert.match(order,/const place=\(opts\.startPlace\|\|1\)\+result\.length/);
  assert.match(order,/if\(place>\(opts\.maxPlace\|\|Infinity\)\)\{result\.push\(\.\.\.remaining\);return done\(result\);\}/);
  assert.match(order,/stakes:stake/);
  assert.doesNotMatch(order,/prompt|Scegli/);
});

test('la sfida di parità parte soltanto se il gruppo tocca il podio e dichiara la posizione reale',()=>{
  const ranking=between('function calcResults(){','\n\nfunction questionFunFact');
  assert.match(ranking,/validIdx<3/);
  assert.match(ranking,/startPlace:validIdx\+1/);
  assert.match(ranking,/startPlace:c\.startPlace/);
  const order=between('function diceOrder(players, opts, done){','\nfunction renderPostRound(){');
  assert.match(order,/const stake=`\$\{place\}º posto nel round · \$\{points\}`/);
});

test('un gruppo di pari che parte dal terzo posto gioca una sola sfida',()=>{
  const source='function diceOrder(players, opts, done){'+between('function diceOrder(players, opts, done){','\nfunction renderPostRound(){');
  const calls=[];
  const context={S:{players:[{id:'a'},{id:'b'},{id:'c'},{id:'d'}]},diceRollWinner:(remaining,opts,done)=>{calls.push(opts.stakes);done(remaining[0])}};
  vm.runInNewContext(source,context);
  const players=[{id:'b'},{id:'c'},{id:'d'}];let result=null;
  context.diceOrder(players,{startPlace:3,maxPlace:3},ordered=>{result=ordered});
  assert.deepEqual(calls,['3º posto nel round · 1 punto']);
  assert.deepEqual(Array.from(result,player=>player.id),['b','c','d']);
});

test('avvio, risposta e uscita dalle sfide non dipendono da click del Master',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/title:"Avvia la mini sfida"/);
  assert.match(source,/function wireAutoAction/);
  assert.match(source,/track\(setTimeout\(go,delay\)\)/);
  assert.match(source,/wireAutoAction\("#abNext",next,4000\)/);
  assert.match(source,/function chooseCronoController/);
  assert.match(source,/function remoteCrono/);
  assert.match(source,/title:"Regia del Cronometro"/);
  assert.match(source,/key!=="crono"\|\|!masterIsContender\|\|cronoControllers\(\)\.length>0/);
});

test('le lavagnette confermano l’apertura e gli spettatori vedono anche le carte da ordinare',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/Carte in gioco:/);
  assert.match(html,/function resolveOnlineMiniReady/);
  assert.match(html,/m\.t==="mini_ready"/);
});

test('Master e lavagnette ricevono motivo, sfidanti e carta estratta dallo stesso snapshot',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/kind:"challenge"/);
  assert.match(source,/challenge:\{reason:opts\.reason\|\|null,game:/);
  assert.match(source,/players:players\.map/);
  assert.match(source,/reasonHtml\(opts\.reason\)/);
  assert.match(html,/function buildTieReason\(entries,q\)/);
});

test('il tabellone ha esattamente tre caselle Minigioco e nessuna casella Bonus, Malus o Sfida',()=>{
  const wire=between('function wireSpecial(type, lander){','\nfunction wireRandomChallenge');
  const mini=wire.match(/else if\(type==="alfabetica"\)[\s\S]*?\n  \}/)[0];
  assert.match(mini,/applyPlayerDelta\(win,\{score:1,pos:1,source:"Casella Minigioco"/);
  const board=vm.runInNewContext(between('let BOARD = ',';\nconst BOARD_FULL'));
  assert.equal(board.length,30);
  assert.deepEqual(Array.from(board.entries()).filter(([,type])=>type==='alfabetica').map(([index])=>index+1),[6,17,23]);
  assert.equal(board.includes('bonus'),false);
  assert.equal(board.includes('malus'),false);
  assert.equal(board.includes('duello'),false);
});

test('le carte editoriali dei giochi di ordine hanno curiosità e fonte',()=>{
  for(const card of [...orderCards,...timelineCards]){
    assert.ok(card.fact.length>=55,card.title);
    assert.match(card.source,/^https:\/\//,card.title);
  }
  assert.doesNotMatch(html,/function startAlfabeticaGame|function renderAlfabeticaBody/);
});

test('le due carte eliminate non sono più estraibili né eseguibili',()=>{
  assert.equal(meta.indizi,undefined);
  assert.equal(meta.asta,undefined);
  assert.doesNotMatch(html,/name:"Indizio dopo Indizio"|name:"Asta al Ribasso"/);
  assert.doesNotMatch(html,/function indizi\(|function asta\(/);
});

test('spettatori e sfidanti ricevono avvio e risultato dallo stesso evento pubblico',()=>{
  const source=between('function diceRollWinner(players,opts,done){','\nfunction scoreCard(){');
  assert.match(source,/function broadcastMiniWaiting/);
  assert.match(source,/function broadcastMiniResult/);
  assert.match(source,/Le risposte compariranno insieme dopo l’invio/);
  assert.match(source,/submitted=entries\.map/);
});
