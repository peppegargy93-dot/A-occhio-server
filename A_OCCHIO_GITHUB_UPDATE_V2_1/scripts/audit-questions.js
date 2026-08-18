'use strict';
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('game.html', 'utf8');
const marker = 'const QUESTIONS = ';
const start = html.indexOf(marker) + marker.length;
const end = html.indexOf('\n];', start) + 2;
const questions = vm.runInNewContext(html.slice(start, end));
const missing = questions.filter(question => !String(question.f || '').trim() || !String(question.fs || '').trim());
const lines = [
  '# Domande prive di curiosità verificata', '',
  `Totale database: ${questions.length}. Complete di curiosità e fonte: ${questions.length - missing.length}. Da verificare: ${missing.length}.`, '',
  'Una domanda è considerata completa soltanto se entrambi i campi `f` (curiosità) e `fs` (fonte) sono valorizzati.', ''
];
for (const [index, question] of missing.entries()) {
  lines.push(`${index + 1}. **[${question.cat}]** ${question.q} — risposta: ${question.a}${question.u ? ` ${question.u}` : ''}`);
}
fs.writeFileSync('DOMANDE_DA_VERIFICARE.md', lines.join('\n') + '\n');
console.log(`Creato DOMANDE_DA_VERIFICARE.md: ${missing.length} domande da verificare.`);
