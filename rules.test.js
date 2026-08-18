'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('game.html', 'utf8');

test('Anti-Sapientone usa una distanza effettiva unica per ordinamento e movimento', () => {
  assert.match(html, /effectiveDist=rawDist===Infinity\?Infinity:rawDist\*penaltyMultiplier/);
  assert.match(html, /sort\(\(a,b\)=>a\.effectiveDist===b\.effectiveDist/);
  assert.match(html, /S\.ranking\.forEach\(e=>\{[\s\S]*?p\.score \+= e\.pts;[\s\S]*?p\.pos = Math\.min\(FINISH, p\.pos \+ e\.pts\)/);
  assert.match(html, /if\(S\.scoringAppliedRound===S\.round\)return/);
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
  assert.match(html, /subject:`MALUS · \$\{m\.nm\}`/);
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
