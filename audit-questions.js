'use strict';
const fs=require('fs');
const vm=require('vm');
const html=fs.readFileSync('game.html','utf8');
function between(start,end){const a=html.indexOf(start)+start.length;return html.slice(a,html.indexOf(end,a));}
const questions=vm.runInNewContext(between('const QUESTIONS = ','\n];')+']');
const facts=vm.runInNewContext('({'+between('const EDITORIAL_FACTS = {','\n};')+'})');
const curated=questions.filter(question=>facts[question.q]);
const missing=questions.filter(question=>!facts[question.q]);
const categories={}; curated.forEach(question=>categories[question.cat]=(categories[question.cat]||0)+1);
const lines=['# Audit editoriale domande','',`Domande totali: ${questions.length}. Attive e curate: ${curated.length}. Escluse in attesa di revisione: ${missing.length}.`,'','## Copertura attiva',''];
Object.entries(categories).forEach(([category,count])=>lines.push(`- ${category}: ${count}`));
lines.push('','## Domande escluse','');
missing.forEach((question,index)=>lines.push(`${index+1}. **[${question.cat}]** ${question.q}`));
fs.writeFileSync('AUDIT_EDITORIALE_DOMANDE.md',lines.join('\n')+'\n');
console.log(`Curate: ${curated.length}; escluse: ${missing.length}.`);
