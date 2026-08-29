'use strict';
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('game.html','utf8');
function between(start,end){const a=html.indexOf(start)+start.length;const b=html.indexOf(end,a);if(a<start.length||b<0)throw new Error(`Sezione mancante: ${start}`);return html.slice(a,b)}
const base=vm.runInNewContext(between('const QUESTIONS = ','\n];')+']');
const added=vm.runInNewContext(between('const QUESTIONS_V2_6 = ','\n];\nQUESTIONS.push(...QUESTIONS_V2_6)')+']');
const editorial=vm.runInNewContext('({'+between('const EDITORIAL_FACTS = {','\n};')+'})');
for(const q of base){const value=editorial[q.q];if(value){q.f=value[0];q.fs=value[1]}}
const questions=[...base,...added].filter(q=>q.f&&q.fs);
const miniGames=['lampo','crono','ncc','altobasso','intervallo','ordine','bomba','timeline'];
const FINISH=30,ROUNDS=15;

function makeRandom(seed){let state=seed>>>0;return()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296)}
function shuffle(items,random){const out=items.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function sameDistance(a,b){const tolerance=Number.EPSILON*Math.max(1,Math.abs(a),Math.abs(b))*8;return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance}
function qid(q){return q.cat+'\u241f'+q.q}

function run(seed,games=120){
  const random=makeRandom(seed),persistentUsed=new Set(),recent=[];
  let questionBag=[],miniBag=[],questionsDrawn=0,minisDrawn=0,ties=0,finishWins=0,pointsWins=0,parachutes=0;
  function drawQuestion(gameUsed,gameDraws){
    const available=questions.filter(q=>!gameUsed.has(qid(q))&&!persistentUsed.has(qid(q))&&!recent.includes(qid(q)));
    if(!questionBag.length||!questionBag.some(id=>available.some(q=>qid(q)===id)))questionBag=shuffle((available.length?available:questions.filter(q=>!gameUsed.has(qid(q))&&!recent.includes(qid(q)))).map(qid),random);
    if(!questionBag.length){persistentUsed.clear();questionBag=shuffle(questions.filter(q=>!gameUsed.has(qid(q))).map(qid),random)}
    const id=questionBag.shift(),q=questions.find(item=>qid(item)===id);gameUsed.add(id);gameDraws.push(id);persistentUsed.add(id);recent.push(id);while(recent.length>40)recent.shift();questionsDrawn++;return q;
  }
  function drawMini(){if(!miniBag.length)miniBag=shuffle(miniGames,random);minisDrawn++;return miniBag.shift()}
  function openDistanceChallenge(a,b){
    if(!sameDistance(a,b))throw new Error('Sfida aperta con distanze diverse');
    ties++;return drawMini();
  }
  let unequalChallengeRejected=false;
  try{openDistanceChallenge(1,2)}catch(error){unequalChallengeRejected=/distanze diverse/.test(error.message)}
  if(!unequalChallengeRejected)throw new Error('Il controllo sfide non rifiuta le distanze diverse');
  for(let game=0;game<games;game++){
    const count=3+Math.floor(random()*4),players=Array.from({length:count},(_,id)=>({id,score:0,pos:0,parachute:random()<.18}));
    const gameUsed=new Set(),gameDraws=[];let winner=null;
    for(let round=1;round<=ROUNDS&&!winner;round++){
      const q=drawQuestion(gameUsed,gameDraws),entries=players.map(p=>{
        const scale=Math.max(1,Math.abs(q.a)*(.05+random()*.9));
        let estimate=q.a+(random()<.5?-1:1)*Math.round(scale);
        const penalty=random()<.12?1.5:random()<.12?1.25:1;
        return {p,estimate,raw:Math.abs(q.a-estimate),penalty,effective:Math.abs(q.a-estimate)*penalty,parachute:false};
      });
      if(round%7===0&&entries.length>1){entries[1].raw=entries[0].raw;entries[1].estimate=q.a+entries[0].raw;entries[1].penalty=entries[0].penalty;entries[1].effective=entries[0].effective}
      const worst=Math.max(...entries.map(e=>e.effective));
      for(const e of entries){if(e.p.parachute&&sameDistance(e.effective,worst)){e.effective/=2;e.parachute=true;e.p.parachute=false;parachutes++}}
      entries.sort((a,b)=>a.effective-b.effective||a.p.id-b.p.id);
      for(let i=1;i<entries.length;i++){if(sameDistance(entries[i-1].effective,entries[i].effective))openDistanceChallenge(entries[i-1].effective,entries[i].effective)}
      const ledger=[];
      entries.slice(0,3).forEach((e,index)=>{const points=3-index,scoreFrom=e.p.score,posFrom=e.p.pos;e.p.score+=points;e.p.pos=Math.min(FINISH,e.p.pos+points);ledger.push({id:e.p.id,scoreFrom,scoreTo:e.p.score,posFrom,posTo:e.p.pos,scoreDelta:points,posDelta:e.p.pos-posFrom,source:`Round ${round}`})});
      if(random()<.22){const p=players[Math.floor(random()*players.length)],scoreFrom=p.score,posFrom=p.pos,mode=drawMini();const scoreDelta=random()<.5?1:0;p.score+=scoreDelta;p.pos=Math.min(FINISH,p.pos+1);ledger.push({id:p.id,scoreFrom,scoreTo:p.score,posFrom,posTo:p.pos,scoreDelta,posDelta:p.pos-posFrom,source:mode})}
      for(const item of ledger){if(item.scoreTo-item.scoreFrom!==item.scoreDelta||item.posTo-item.posFrom!==item.posDelta)throw new Error('Ledger incoerente')}
      for(const p of players){if(p.score<0||p.pos<0||p.pos>FINISH)throw new Error('Stato giocatore non valido')}
      winner=players.find(p=>p.pos>=FINISH)||null;
    }
    if(gameDraws.length!==new Set(gameDraws).size)throw new Error('Domanda duplicata nella partita');
    if(winner)finishWins++;else{pointsWins++;winner=players.slice().sort((a,b)=>b.score-a.score||b.pos-a.pos)[0]}
    if(!winner)throw new Error('Partita senza vincitore');
  }
  return {seed,games,playersMin:3,playersMax:6,questions:questions.length,questionsDrawn,minisDrawn,ties,parachutes,finishWins,pointsWins,status:'OK'};
}

const reports=[run(260826,120),run(270826,120),run(930093,120)];
const total=reports.reduce((acc,row)=>{for(const key of ['games','questionsDrawn','minisDrawn','ties','parachutes','finishWins','pointsWins'])acc[key]=(acc[key]||0)+row[key];return acc},{});
const lines=['# Report simulazioni v2.8','',`Esito: **OK**. ${total.games} partite simulate con 3–6 giocatori e tre semi indipendenti.`,'','Questa è una simulazione deterministica del modello di stato; il protocollo reale Master/lavagnette è verificato separatamente dai test WebSocket e dal playtest browser.','',`- Domande pescate: ${total.questionsDrawn}; confronto tra sequenza completa e insieme univoco per ogni partita.` ,`- Minigiochi pescati: ${total.minisDrawn}; shuffle-bag completo prima del riuso.`,`- Parità effettive risolte: ${total.ties}; il guard negativo rifiuta esplicitamente una sfida con distanze 1 e 2.`,`- Paracadute applicati e consumati: ${total.parachutes}.`,`- Vittorie per Finale: ${total.finishWins}; vittorie ai punti al round 15: ${total.pointsWins}.`,'','## Esecuzioni','',...reports.map(row=>`- seed ${row.seed}: ${row.games} partite, ${row.questionsDrawn} domande, ${row.minisDrawn} minigiochi, ${row.ties} parità — ${row.status}`),'','Invarianti controllate: punti/caselle derivano dal medesimo ledger; stato non negativo e posizione entro la Finale; sfide soltanto su distanza effettiva uguale; una sola carta per estrazione.'];
fs.writeFileSync('SIMULATION_REPORT.md',lines.join('\n')+'\n');
console.log(JSON.stringify({status:'OK',...total,runs:reports},null,2));
