'use strict';
const fs=require('fs');
const html=fs.readFileSync('game.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]).join('\n');
new Function(scripts);
if(!html.includes('const EDITORIAL_FACTS = {')) throw new Error('Database editoriale mancante.');
if(!html.includes('const curated=QUESTIONS.filter(q=>q.f&&q.fs)')) throw new Error('Filtro editoriale fail-closed mancante.');
console.log('Sintassi e regole editoriali: OK');
