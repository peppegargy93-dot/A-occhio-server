'use strict';
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
const curated=questions.filter(editorial);
const missing=questions.filter(question=>!editorial(question));
const categories={}; curated.forEach(question=>categories[question.cat]=(categories[question.cat]||0)+1);
const lines=['# Audit editoriale domande','',`Domande totali: ${questions.length}. Attive e curate: ${curated.length}. Escluse in attesa di revisione: ${missing.length}.`,'','## Copertura attiva',''];
Object.entries(categories).forEach(([category,count])=>lines.push(`- ${category}: ${count}`));
lines.push('','## Domande escluse','');
missing.forEach((question,index)=>lines.push(`${index+1}. **[${question.cat}]** ${question.q}`));
fs.writeFileSync('AUDIT_EDITORIALE_DOMANDE.md',lines.join('\n')+'\n');
const pending=['# Domande prive di curiosità verificata','',`Totale database: ${questions.length}. Complete di curiosità e fonte: ${curated.length}. Da verificare: ${missing.length}.`,'','Una domanda resta fuori dal mazzo finché non possiede entrambi i campi `f` (curiosità specifica) e `fs` (fonte HTTPS).',''];
missing.forEach((question,index)=>pending.push(`${index+1}. **[${question.cat}]** ${question.q} — risposta: ${question.a} ${question.u||''}`.trim()));
fs.writeFileSync('DOMANDE_DA_VERIFICARE.md',pending.join('\n')+'\n');
console.log(`Curate: ${curated.length}; escluse: ${missing.length}.`);
