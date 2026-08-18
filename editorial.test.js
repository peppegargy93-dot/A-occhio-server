'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('fs');
const vm=require('vm');
const html=fs.readFileSync('game.html','utf8');
function between(start,end){const a=html.indexOf(start)+start.length;return html.slice(a,html.indexOf(end,a));}
const questions=vm.runInNewContext(between('const QUESTIONS = ','\n];')+']');
const facts=vm.runInNewContext('({'+between('const EDITORIAL_FACTS = {','\n};')+'})');
test('ogni domanda attiva ha curiosità specifica e fonte HTTPS',()=>{
  const curated=questions.filter(question=>facts[question.q]);
  assert.ok(curated.length>=35);
  for(const question of curated){
    const [fact,source]=facts[question.q];
    assert.ok(fact.length>=60,question.q);
    assert.match(source,/^https:\/\//,question.q);
    assert.ok(!/equivalgono|valore da ricordare|riferimento preciso/i.test(fact),question.q);
  }
});
test('le domande non curate sono escluse dal mazzo',()=>{
  assert.match(html,/const curated=QUESTIONS\.filter\(q=>q\.f&&q\.fs\)/);
  assert.match(html,/const curatedCats = \(\)=> CATEGORIES\.filter/);
});
