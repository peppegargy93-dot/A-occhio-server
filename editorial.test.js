'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('fs');
const vm=require('vm');
const html=fs.readFileSync('game.html','utf8');
function between(start,end){const a=html.indexOf(start)+start.length;return html.slice(a,html.indexOf(end,a));}
const questions=vm.runInNewContext(between('const QUESTIONS = ','\n];')+']');
const facts=vm.runInNewContext('({'+between('const EDITORIAL_FACTS = {','\n};')+'})');
function editorial(question){
  if(question.f&&question.fs)return [question.f,question.fs];
  return facts[question.q]||null;
}
test('ogni domanda attiva ha curiosità specifica e fonte HTTPS',()=>{
  const curated=questions.filter(editorial);
  assert.ok(curated.length>=43);
  for(const question of curated){
    const [fact,source]=editorial(question);
    assert.ok(fact.length>=60,question.q);
    assert.match(source,/^https:\/\//,question.q);
    assert.ok(!/equivalgono|valore da ricordare|riferimento preciso/i.test(fact),question.q);
  }
});
test('la serie parole delle canzoni è completa, verificata e non ambigua',()=>{
  const songs=questions.filter(question=>/parol/.test(question.q));
  assert.ok(songs.length>=6);
  for(const question of songs.filter(question=>question.cat==='Musica')){
    const entry=editorial(question);
    if(!entry)continue;
    assert.ok(Number.isFinite(question.a),question.q);
    assert.equal(question.u,'parole',question.q);
  }
  assert.ok(questions.some(question=>question.q.includes('ritornello')));
});
test('le domande non curate sono escluse dal mazzo',()=>{
  assert.match(html,/const curated=QUESTIONS\.filter\(q=>q\.f&&q\.fs\)/);
  assert.match(html,/const curatedCats = \(\)=> CATEGORIES\.filter/);
});
test('anche le domande dei minigiochi usano il mazzo curato e mostrano la curiosità',()=>{
  assert.doesNotMatch(html,/const q=QUESTIONS\[rnd\(QUESTIONS\.length\)\]/);
  assert.match(html,/title:"Stima Lampo"[\s\S]*?description:q\.f/);
  assert.match(html,/title:"Tiro al Leader"[\s\S]*?description:q\.f/);
});
