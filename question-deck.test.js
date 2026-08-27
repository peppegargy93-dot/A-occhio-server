'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('game.html','utf8');
function between(start,end){const a=html.indexOf(start)+start.length;assert.ok(a>=start.length);const b=html.indexOf(end,a);assert.ok(b>=0,`fine assente: ${end}`);return html.slice(a,b)}
const questions=vm.runInNewContext(between('const QUESTIONS = ','\n];')+']');
const added=vm.runInNewContext(between('const QUESTIONS_V2_6 = ','\n];\nQUESTIONS.push(...QUESTIONS_V2_6)')+']');
questions.push(...added);

test('la v2.6 aggiunge esattamente dieci domande per ognuna delle 17 categorie',()=>{
  assert.equal(added.length,170);
  const counts=new Map();added.forEach(q=>counts.set(q.cat,(counts.get(q.cat)||0)+1));
  assert.equal(counts.size,17);
  for(const [category,count] of counts)assert.equal(count,10,category);
});

test('ogni nuova domanda è numerica, unica, curata e dotata di fonte HTTPS',()=>{
  const seen=new Set();
  for(const q of added){
    assert.ok(q.q.length>=20,q.q);assert.ok(Number.isFinite(q.a),q.q);assert.ok(q.u,q.q);
    assert.ok(q.f.length>=60,q.q);assert.match(q.fs,/^https:\/\//,q.q);
    const id=q.cat+'\u241f'+q.q;assert.ok(!seen.has(id),q.q);seen.add(id);
  }
});

test('round e minigiochi numerici condividono lo stesso mazzo senza reinserimento',()=>{
  assert.match(html,/const QUESTION_MEMORY_KEY="aocchio_question_cycle_v2"/);
  assert.match(html,/S\.used\.add\(id\);QUESTION_MEMORY\.used\.add\(id\)/);
  for(const context of ['Tiro al Leader','Stima Lampo','Alto o Basso','Intervallo Killer','Asta al Ribasso']){
    assert.ok(html.includes(`drawFromPool(null,"${context}")`),context);
  }
  assert.doesNotMatch(html,/pick\(curated\(\)\)|QUESTIONS\[rnd/);
});

test('anche le carte speciali usano shuffle-bag dedicati',()=>{
  assert.match(html,/drawDeckCard\("tesi",TESI_CARDS\)/);
  assert.match(html,/drawDeckCard\("ordine",MINI_ORDER_CARDS\)/);
  assert.match(html,/drawDeckCard\("timeline",MINI_TIMELINE_CARDS\)/);
  assert.match(html,/drawDeckCard\("indizi",MINI_CLUE_CARDS\)/);
  assert.match(html,/drawDeckCard\("bomba",MINI_BOMB_CATEGORIES\)/);
});
