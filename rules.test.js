'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('game.html', 'utf8');

test('Anti-Sapientone usa una distanza effettiva unica per ordinamento e movimento', () => {
  assert.match(html, /effectiveDist=rawDist===Infinity\?Infinity:rawDist\*penaltyMultiplier/);
  assert.match(html, /sort\(\(a,b\)=>a\.effectiveDist===b\.effectiveDist/);
  assert.match(html, /S\.ranking\.forEach\(e=>\{[\s\S]*?applyPlayerDelta\(p,\{score:e\.pts,pos:e\.pts,source:`Round \$\{S\.round\}`/);
  assert.match(html, /if\(S\.scoringAppliedRound===S\.round\)return/);
  assert.match(html,/function applyPlayerDelta\(player,change=\{\}\)/);
  assert.doesNotMatch(html,/\.score\s*\+=|\.pos\s*\+=/);
});

test('Fenomeno e malus persistenti sono idempotenti', () => {
  const addSource = html.match(/function addUniqueEffect\(list, effect\)\{[\s\S]*?\n\}/)[0];
  const setSource = html.match(/function setFenomeno\(player\)\{[\s\S]*?\n\}/)[0];
  const context = {
    S: { players: [
      { id: 'p1', fenomeno: false, malus: [] },
      { id: 'p2', fenomeno: true, malus: [{ id: 'old', sticky: true }] }
    ] },
    FENOMENO_MALUS: [{ id: 'firma', sticky: true }, { id: 'corona', sticky: true }]
  };
  vm.runInNewContext(`${addSource}\n${setSource}\nsetFenomeno(S.players[0]);setFenomeno(S.players[0]);`, context);
  assert.equal(context.S.players[0].fenomeno, true);
  assert.equal(context.S.players[1].fenomeno, false);
  assert.deepEqual(context.S.players[0].malus.map(item => item.id), ['firma', 'corona']);
  assert.deepEqual(context.S.players[1].malus, []);
});

test('Bonus e Malus restano dati strutturati e non testo copiato dal DOM', () => {
  assert.doesNotMatch(html, /onlineScreenFromMaster|\.innerText/);
  assert.match(html, /label:`BONUS · \$\{b\.nm\}`/);
  assert.match(html, /BONUS\.filter\(b=>!lander\.bonus\.some/);
  assert.match(html, /drawDeckCard\("malus",MALUS\)/);
  assert.match(html, /addUniqueEffect\(lander\.malus,m\)/);
});

test('le stime accettano numeri completi ma rifiutano suffissi ambigui',()=>{
  const source=html.match(/function parseEstimate\(raw\)\{[\s\S]*?\n\}/)[0];
  const context={};
  vm.runInNewContext(`${source}\nresult=[parseEstimate('42'),parseEstimate('1.234'),parseEstimate('12,5'),parseEstimate('-3'),parseEstimate('42abc'),parseEstimate('')];`,context);
  assert.deepEqual(Array.from(context.result).slice(0,4),[42,1234,12.5,-3]);
  assert.ok(Number.isNaN(context.result[4]));
  assert.ok(Number.isNaN(context.result[5]));
});

test('l’anteprima speciale precede sempre la scelta interattiva', () => {
  const renderSpecial = html.match(/function renderSpecial\(\)\{[\s\S]*?\n\}/)[0];
  assert.ok(renderSpecial.indexOf('onlineSpecialFromMaster(type, lander, c)') < renderSpecial.indexOf('wireSpecial(type, lander)'));
});

test('nessuna domanda usa più il fallback numerico', () => {
  const factFunction=html.match(/function questionFunFact\(q\)\{[\s\S]*?\n\}/)[0];
  assert.doesNotMatch(factFunction,/numericalFunFact/);
  assert.match(factFunction,/return ""/);
});

test('Premio rimonta e Tassa del podio hanno soglie autorevoli e ripetibili',()=>{
  const constants=html.match(/const COMEBACK_BONUS_STREAK = \d+;[\s\S]*?const PODIUM_MALUS_STEP = \d+;/)[0];
  const update=html.match(/function updatePerformanceProgress\(player,isOnPodium\)\{[\s\S]*?\n\}/)[0];
  const context={};
  vm.runInNewContext(`${constants}\n${update}\nconst p={outsidePodiumStreak:0,podiumCount:0};results=[];for(let i=0;i<8;i++)results.push(updatePerformanceProgress(p,false));for(let i=0;i<9;i++)results.push(updatePerformanceProgress(p,true));state=p;`,context);
  assert.equal(context.state.outsidePodiumStreak,0);
  assert.equal(context.state.podiumCount,9);
  assert.deepEqual(Array.from(context.results.filter(Boolean),event=>[event.type,event.streak||event.podiumCount]),[
    ['bonus',4],['bonus',4],['malus',3],['malus',6],['malus',9]
  ]);
  assert.match(html,/performanceEvents\.push\(\{\.\.\.progressEvent,landerId:p\.id\}\)/);
});

test('Paracadute è applicato una sola volta e compare nella formula della distanza',()=>{
  assert.match(html,/worstDistance[\s\S]*?bonusIndex>=0[\s\S]*?e\.effectiveDist\/=2/);
  assert.match(html,/p\.bonus\.splice\(bonusIndex,1\)/);
  assert.match(html,/parachuteApplied:!!e\.parachuteApplied,formula:distanceFormula\(e\)/);
});

test('punti e tabellone hanno classifiche e regole di vittoria distinte',()=>{
  assert.match(html,/Classifica punti/);
  assert.match(html,/Corsa sul tabellone/);
  assert.match(html,/raggiung[ei] per primo la casella Finale/i);
  assert.match(html,/kind:"map"[\s\S]*?movement:rows/);
});

test('l’animazione delle pedine segue sia avanzamenti sia arretramenti',()=>{
  const source=html.match(/function nextBoardStep\(from,to\)\{[\s\S]*?\n\}/)[0];
  const context={};
  vm.runInNewContext(`${source}\nresult=[nextBoardStep(2,5),nextBoardStep(5,2),nextBoardStep(3,3)];`,context);
  assert.deepEqual(Array.from(context.result),[3,4,3]);
  assert.match(html,/Math\.abs\(m\.to-m\.from\)/);
  assert.match(html,/nextBoardStep\(positions\[m\.id\],m\.to\)/);
});

test('nuova partita e chiusura anticipata non riutilizzano una vecchia vittoria',()=>{
  const start=html.match(/function startGame\(\)\{[\s\S]*?\n\}/)[0];
  assert.match(start,/S\.winnerFinal=null/);
  assert.match(start,/S\.gameEndReason=null/);
  assert.match(html,/S\.gameEndReason=capReached\?"round_limit":"manual"/);
  assert.match(html,/Partita terminata dal Master al round/);
  assert.match(html,/winRule:finalWinRule/);
});
