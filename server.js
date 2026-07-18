'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
const ROOM_TTL_MS = 10 * 60 * 1000;

let GAME = '';
try {
  GAME = fs.readFileSync(path.join(__dirname, 'game.html'), 'utf8');
} catch (error) {
  console.error('Impossibile leggere game.html:', error.message);
}

const rooms = new Map();

function makeToken() {
  return crypto.randomBytes(18).toString('hex');
}

function code4() {
  const alphabet = 'ABCDEFGHKMNPRSTUVZ';
  let code = '';
  do {
    code = Array.from(
      { length: 4 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function livePads(room) {
  return [...room.pads.values()].filter(
    pad => pad.socket && pad.socket.readyState === WebSocket.OPEN
  );
}

function notifyMaster(room) {
  send(room.masterSocket, {
    t: 'peer',
    n: livePads(room).length
  });
}

function broadcastPads(room, payload) {
  for (const pad of room.pads.values()) {
    send(pad.socket, payload);
  }
}

function clearDeleteTimer(room) {
  if (room.deleteTimer) {
    clearTimeout(room.deleteTimer);
    room.deleteTimer = null;
  }
}

function scheduleDelete(room) {
  clearDeleteTimer(room);
  room.deleteTimer = setTimeout(() => {
    if (room.masterSocket?.readyState === WebSocket.OPEN) return;
    broadcastPads(room, {
      t: 'room_closed',
      msg: 'La partita è terminata. Inserisci il nuovo codice.'
    });
    rooms.delete(room.code);
  }, ROOM_TTL_MS);
}

function destroyRoom(room, message) {
  clearDeleteTimer(room);
  broadcastPads(room, {
    t: 'room_closed',
    msg: message || 'La partita è terminata.'
  });
  for (const pad of room.pads.values()) {
    try { pad.socket?.close(); } catch {}
  }
  rooms.delete(room.code);
}

function roomState(room, pad = null) {
  return {
    locked: room.locked,
    round: room.round,
    deadline: room.deadline,
    question: room.question,
    view: room.lastView,
    lastResult: room.lastResult || null,
    lastMap: room.lastMap || null,
    sent: !!pad && pad.answeredRound === room.round
  };
}

function attachPad(room, ws, pad) {
  if (pad.socket && pad.socket !== ws) {
    try {
      send(pad.socket, {
        t: 'replaced',
        msg: 'Questa lavagnetta è stata aperta in un’altra scheda.'
      });
      pad.socket.close();
    } catch {}
  }

  pad.socket = ws;
  ws._room = room.code;
  ws._role = 'pad';
  ws._padToken = pad.token;
  notifyMaster(room);
}

const PAD = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#20424E">
<title>A OCCHIO! — Lavagnetta</title>
<style>
:root{--cream:#F5ECD6;--paper:#FBF6E7;--paper2:#FFFDF6;--ink:#20424E;--petrol:#2E6B7A;--teal:#48A39A;--coral:#E0795E;--ochre:#E6AC3C;--line:rgba(32,66,78,.16);--soft:rgba(32,66,78,.07);--shadow:0 14px 34px -22px rgba(32,66,78,.65)}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(120% 70% at 50% -10%,#fff9e9 0,var(--cream) 60%,#ecdfc2 100%);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
body{padding:12px 14px calc(24px + env(safe-area-inset-bottom))}.shell{width:100%;max-width:520px;margin:auto}.top{display:flex;align-items:center;justify-content:space-between;padding:8px 3px 12px}.brand{display:flex;align-items:center;gap:9px;font-size:24px;font-weight:950;letter-spacing:-1px}.room{font-size:11px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;border:1.5px solid var(--line);background:rgba(255,255,255,.55);padding:6px 9px;border-radius:999px}
.panel{background:var(--paper);border:1.5px solid var(--line);border-radius:22px;padding:17px;box-shadow:var(--shadow);overflow:hidden}.screen{display:none}.screen.active{display:block;animation:enter .34s cubic-bezier(.2,.9,.3,1) both}@keyframes enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes reveal{0%{opacity:0;transform:scale(.88)}70%{transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}
.eyebrow{font-size:10.5px;font-weight:950;letter-spacing:1.35px;text-transform:uppercase;color:var(--coral);margin-bottom:7px}.hero{text-align:center}.icon{font-size:48px;line-height:1;margin:7px 0 11px}.title{font-size:25px;font-weight:950;letter-spacing:-.55px;line-height:1.12;margin:0}.sub{font-size:13.5px;color:#587078;line-height:1.45;margin:8px 0 0}.question{font-size:23px;font-weight:850;letter-spacing:-.3px;line-height:1.27;margin:12px 0;text-align:center}.category{display:inline-flex;background:var(--petrol);color:white;border-radius:999px;padding:5px 11px;font-size:10.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
.timer{font-size:64px;font-weight:950;letter-spacing:-3px;line-height:1;text-align:center;margin:13px 0 2px;font-variant-numeric:tabular-nums}.timer.warn{color:var(--coral)}.timer-label{text-align:center;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#7b725d}.bar{height:8px;background:var(--soft);border-radius:99px;overflow:hidden;margin:10px 0 16px}.bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--teal),var(--ochre),var(--coral));transition:width .2s linear}
.field{margin-top:12px}.field label{display:block;font-size:12px;font-weight:900;margin:0 0 6px}.field input{width:100%;border:2px solid var(--ink);background:var(--paper2);border-radius:14px;padding:14px 13px;font:inherit;font-size:21px;font-weight:850;color:var(--ink);text-align:center}.btn{width:100%;border:0;border-radius:14px;padding:14px 16px;margin-top:10px;font:inherit;font-size:15px;font-weight:900;background:var(--coral);color:white}.btn.secondary{background:transparent;color:var(--ink);border:1.5px solid var(--line);font-size:13px;padding:10px}.btn:disabled,.field input:disabled{opacity:.46}.status{text-align:center;font-size:12.5px;color:#587078;margin:10px 0 0;min-height:18px}.success{display:flex;align-items:center;gap:10px;background:#e4f1ed;border:1.5px solid #badbd2;border-radius:14px;padding:12px;text-align:left;margin-top:14px}.success b{display:block}.success span{font-size:12px;color:#45685f}
.fact-card{background:#eef4f0;border:1.5px solid #c9ddd2;border-radius:14px;padding:12px 13px;margin:11px 0;text-align:left;font-size:12.5px;line-height:1.45;color:#3f5d55}.fact-card b{display:block;margin-bottom:3px;color:var(--ink)}.event-card{background:var(--paper2);border:1.5px solid var(--line);border-radius:16px;padding:14px;margin-top:12px;text-align:left}.event-subject{font-size:10px;font-weight:950;letter-spacing:1px;text-transform:uppercase;color:var(--coral)}.event-title{font-size:21px;font-weight:950;line-height:1.15;margin:5px 0 7px}.event-desc{font-size:14px;line-height:1.45;color:#48646c}.instruction{margin-top:10px;padding:10px 11px;border-radius:12px;background:#eef4f0;border:1px solid #c9ddd2;font-size:12.5px;font-weight:800;line-height:1.4}.context-card{margin-top:14px;border-top:1px dashed var(--line);padding-top:13px}.context-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.context-answer{font-size:18px;font-weight:950;color:var(--coral)}.compact-score{display:flex;justify-content:space-between;gap:9px;padding:7px 1px;border-bottom:1px dashed var(--line);font-size:12.5px}.compact-score b{font-weight:900}.compact-score span{white-space:nowrap;font-weight:900;color:var(--teal)}
.answer-card{background:var(--paper2);border:2px solid var(--ochre);border-radius:17px;padding:15px;text-align:center;margin:12px 0;animation:reveal .5s cubic-bezier(.2,1.2,.3,1) both}.answer-label{font-size:10px;font-weight:950;letter-spacing:1.4px;text-transform:uppercase;color:#806522}.answer-value{font-size:40px;font-weight:950;letter-spacing:-1.4px;color:var(--coral);line-height:1.08;margin-top:3px}.question-small{font-family:Georgia,serif;font-size:13px;color:#746a54;margin-top:6px;line-height:1.4}
.personal{border:1.5px solid var(--line);border-radius:16px;padding:13px;margin:12px 0;background:#fff}.personal-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.personal-name{font-weight:950}.round-points{font-size:23px;font-weight:950;color:var(--teal)}.personal-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.metric{background:var(--soft);border-radius:11px;padding:9px}.metric small{display:block;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#687b80}.metric b{display:block;margin-top:2px;font-size:15px}.section-title{font-size:11px;font-weight:950;letter-spacing:1.1px;text-transform:uppercase;margin:15px 0 7px}.rank-row,.score-row{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:9px;padding:10px 3px;border-bottom:1px dashed var(--line)}.rank-row.me,.score-row.me{background:#fff3d6;border-radius:11px;padding-left:8px;padding-right:8px;border-bottom:0;margin:3px 0}.rank-num{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:var(--soft);font-size:12px;font-weight:950}.rank-main b{display:block;font-size:14px}.rank-main span{display:block;font-size:11px;color:#65787e;margin-top:1px}.rank-points{font-weight:950;color:var(--teal);white-space:nowrap}.step{opacity:1;animation:stepIn .34s ease both}@keyframes stepIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:10px 0 13px}.summary .metric{text-align:center}.summary .metric b{font-size:17px}.map-wrap{position:relative}.map{display:flex;flex-direction:column-reverse;gap:7px;padding:5px 0 5px 23px;position:relative}.map:before{content:"";position:absolute;left:10px;top:16px;bottom:16px;width:3px;border-radius:99px;background:linear-gradient(var(--teal),var(--ochre),var(--coral),var(--ink));opacity:.35}.cell{position:relative;display:grid;grid-template-columns:31px 1fr auto;gap:8px;align-items:center;min-height:49px;padding:7px 9px;border:1.5px solid var(--line);border-radius:13px;background:#e8eff0;text-align:left}.cell:before{content:"";position:absolute;width:13px;height:3px;left:-14px;top:50%;background:var(--line)}.cell.current{box-shadow:0 0 0 3px var(--coral);transform:scale(1.01)}.cell.bonus{background:#f5e5b7}.cell.malus{background:#f4d9cf}.cell.timer-cell{background:#d8ebeb}.cell.duello{background:#e2dcea}.cell.special{background:#e9e2d0}.cell.finale{background:var(--ink);color:white}.num{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.75);font-size:11px;font-weight:950;color:var(--ink)}.cell-name{font-size:12px;font-weight:900;line-height:1.15}.pawns{display:flex;gap:2px;flex-wrap:wrap;justify-content:flex-end}.pawn{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;color:white;border:2px solid white;font-size:9px;font-weight:950}.map-note{text-align:center;font-size:11px;color:#687b80;margin-top:8px}.hidden{display:none!important}
.connection{display:flex;align-items:center;gap:6px;font-size:11px;color:#65787e;margin-top:9px;justify-content:center}.dot{width:7px;height:7px;border-radius:50%;background:var(--teal)}.dot.off{background:var(--coral)}
</style>
</head>
<body><div class="shell">
  <div class="top"><div class="brand">👁 A OCCHIO!</div><div id="roomBadge" class="room hidden"></div></div>
  <div class="panel">
    <section id="joinScreen" class="screen active">
      <div class="hero"><div class="icon">🎲</div><div class="eyebrow">Lavagnetta personale</div><h1 class="title">Entra nella partita</h1><p class="sub">Inserisci il codice mostrato sul telefono principale.</p></div>
      <div class="field"><label for="code">Codice stanza</label><input id="code" maxlength="4" autocomplete="off" placeholder="ABCD" style="text-transform:uppercase"></div>
      <div class="field"><label for="name">Il tuo nome</label><input id="name" maxlength="30" autocomplete="off" placeholder="Es. Peppe"></div>
      <button id="joinBtn" class="btn" type="button">Entra in partita</button>
    </section>

    <section id="waitingScreen" class="screen"><div class="hero"><div class="icon">✋</div><div class="eyebrow">Sei collegato</div><h2 class="title">Aspetta la prossima domanda</h2><p class="sub">Qui compariranno domanda, timer e risultati della partita.</p></div></section>

    <section id="questionScreen" class="screen">
      <div class="hero"><div id="qCat" class="category"></div><div id="qText" class="question"></div></div>
      <div id="timer" class="timer">25</div><div class="timer-label">secondi per rispondere</div><div class="bar"><i id="timerBar"></i></div>
      <div class="field"><label for="estimate">La tua stima</label><input id="estimate" inputmode="decimal" autocomplete="off" placeholder="Scrivi un numero"></div>
      <div id="limitedNotice" class="instruction hidden"></div>
      <button id="sendBtn" class="btn" type="button">Invia e blocca</button>
      <div id="sentBox" class="success hidden"><div style="font-size:26px">✅</div><div><b>Stima inviata</b><span>È bloccata e non può essere modificata.</span></div></div>
    </section>

    <section id="lockedScreen" class="screen"><div class="hero"><div class="icon">✋</div><div class="eyebrow">Penne giù</div><h2 class="title">Le risposte sono chiuse</h2><p class="sub">Il Master sta calcolando il risultato del round.</p></div></section>

    <section id="resultScreen" class="screen">
      <div class="hero"><div id="resultEyebrow" class="eyebrow">Risultati del round</div><h2 class="title">Scopri com’è andata</h2></div>
      <div class="answer-card step" style="animation-delay:.05s"><div class="answer-label">La risposta corretta era</div><div id="correctAnswer" class="answer-value"></div><div id="resultQuestion" class="question-small"></div></div>
      <div id="funFact" class="fact-card step hidden" style="animation-delay:.16s"></div>
      <div id="personalResult" class="personal step" style="animation-delay:.25s"></div>
      <div class="section-title step" style="animation-delay:.42s">Classifica del round</div><div id="roundRanking" class="step" style="animation-delay:.48s"></div>
      <p class="status step" style="animation-delay:.62s">Tra poco vedrai i punteggi totali e la nuova posizione sulla mappa.</p>
    </section>

    <section id="mapScreen" class="screen">
      <div class="hero"><div class="eyebrow">Situazione aggiornata</div><h2 class="title">Classifica e mappa</h2><p id="mapText" class="sub"></p></div>
      <div id="personalSummary" class="summary"></div>
      <div class="section-title">Classifica generale</div><div id="scoreboard"></div>
      <div class="section-title">Il percorso</div><div class="map-wrap"><div id="map" class="map"></div></div>
      <button id="toggleMap" class="btn secondary hidden" type="button">Mostra tutta la mappa</button><div id="mapNote" class="map-note"></div>
    </section>

    <section id="infoScreen" class="screen">
      <div class="hero"><div id="infoIcon" class="icon">📣</div><div id="infoTitle" class="eyebrow"></div></div>
      <div class="event-card"><div id="infoSubject" class="event-subject"></div><div id="infoEffectTitle" class="event-title"></div><div id="infoText" class="event-desc"></div><div id="infoInstruction" class="instruction"></div></div>
      <div id="infoContext" class="context-card hidden"><div class="section-title">Ultimo round</div><div class="context-head"><span>Risposta corretta</span><span id="contextAnswer" class="context-answer"></span></div><div id="contextFact" class="fact-card hidden"></div><div class="section-title">Classifica aggiornata</div><div id="contextScores"></div></div>
    </section>

    <button id="changeBtn" class="btn secondary hidden" type="button">Cambia stanza</button>
    <div id="status" class="status"></div><div class="connection"><i id="connDot" class="dot off"></i><span id="connText">Non collegato</span></div>
  </div>
</div>
<script>
let ws=null,sent=false,timerId=null,deadline=0,timerDuration=25,retry=null,retryMs=1000,currentCode='',currentName='',padToken='',manualClose=false,currentMap=null,mapExpanded=false;
const $=id=>document.getElementById(id), proto=location.protocol==='https:'?'wss://':'ws://';
const queryCode=(new URLSearchParams(location.search).get('c')||'').trim().toUpperCase();if(queryCode)$('code').value=queryCode;
const screens=['joinScreen','waitingScreen','questionScreen','lockedScreen','resultScreen','mapScreen','infoScreen'];
function showScreen(id){screens.forEach(x=>$(x).classList.toggle('active',x===id));$('changeBtn').classList.toggle('hidden',id==='joinScreen');window.scrollTo({top:0,behavior:'smooth'})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function key(s){return String(s||'').trim().toLocaleLowerCase('it-IT')}
function getSaved(){try{return JSON.parse(localStorage.getItem('aocchio_pad')||'null')}catch{return null}}function save(){try{localStorage.setItem('aocchio_pad',JSON.stringify({code:currentCode,name:currentName,token:padToken}))}catch{}}function clearSaved(){try{localStorage.removeItem('aocchio_pad')}catch{}}
function connection(ok,text){$('connDot').classList.toggle('off',!ok);$('connText').textContent=text}
function setRoom(){if(currentCode){$('roomBadge').textContent='Stanza '+currentCode;$('roomBadge').classList.remove('hidden')}else $('roomBadge').classList.add('hidden')}
function stopTimer(){clearInterval(timerId);timerId=null}
function setTimer(value,duration=25){
  stopTimer();
  deadline=Number(value)||0;
  timerDuration=Math.max(1,Number(duration)||25);
  const draw=()=>{
    const ms=Math.max(0,deadline-Date.now()),left=Math.ceil(ms/1000);
    $('timer').textContent=left;
    $('timer').classList.toggle('warn',left<=5);
    $('timerBar').style.width=Math.min(100,ms/(timerDuration*1000)*100)+'%';
    if(left<=0){
      stopTimer();
      if(!sent){
        $('estimate').disabled=true;
        $('sendBtn').disabled=true;
        $('status').textContent='Tempo personale scaduto: la lavagnetta è bloccata.';
      }
    }
  };
  draw();
  timerId=setInterval(draw,150);
}
function resetQuestion(){sent=false;$('estimate').value='';$('estimate').disabled=false;$('sendBtn').disabled=false;$('sentBox').classList.add('hidden');$('limitedNotice').classList.add('hidden');$('limitedNotice').textContent=''}
function applyQuestion(m){
  resetQuestion();
  sent=!!m.sent;
  $('qCat').textContent=m.cat||'Domanda';
  $('qText').textContent=(m.text||'')+(m.unit?' · '+m.unit:'');
  if(m.limited || Number(m.seconds)<25){
    $('limitedNotice').textContent='⏱️ Malus tempo attivo: hai '+(Number(m.seconds)||0)+' secondi. Allo scadere la lavagnetta si blocca automaticamente.';
    $('limitedNotice').classList.remove('hidden');
  }
  if(sent){
    $('estimate').disabled=true;
    $('sendBtn').disabled=true;
    $('sentBox').classList.remove('hidden');
  }
  setTimer(m.deadline||0,m.seconds||25);
  showScreen('questionScreen');
  $('status').textContent=sent?'La tua risposta è già stata registrata.':'Rispondi entro lo scadere del tuo tempo personale.';
}
function meIn(list){return (list||[]).find(x=>key(x.name)===key(currentName))}
function applyResult(v){
  stopTimer();showScreen('resultScreen');
  $('resultEyebrow').textContent='Risultati del round '+(v.round||'');
  $('correctAnswer').textContent=v.answer||'—';
  $('resultQuestion').textContent=v.question||'';
  if(v.funFact){$('funFact').innerHTML='<b>💡 Curiosità verificata</b>'+esc(v.funFact);$('funFact').classList.remove('hidden')}else{$('funFact').classList.add('hidden');$('funFact').innerHTML=''}
  const ranking=Array.isArray(v.ranking)?v.ranking:[];
  const scores=Array.isArray(v.scores)?v.scores:[];
  const mine=meIn(ranking),projected=meIn(scores);
  $('personalResult').innerHTML=mine
    ?'<div class="personal-head"><div><div class="eyebrow" style="margin:0">Il tuo risultato</div><div class="personal-name">'+esc(currentName)+'</div></div><div class="round-points">'+(mine.points>0?'+':'')+(mine.points||0)+' pt</div></div><div class="personal-meta"><div class="metric"><small>La tua stima</small><b>'+(mine.estimate??'Nessuna')+'</b></div><div class="metric"><small>Distanza</small><b>'+(mine.distance??'—')+'</b></div><div class="metric"><small>Posizione nel round</small><b>'+(mine.rank?mine.rank+'°':'—')+'</b></div><div class="metric"><small>Totale provvisorio</small><b>'+(projected?projected.score:0)+' pt</b></div></div>'
    :'<div class="sub">Il tuo risultato non è disponibile.</div>';
  const ordered=ranking.slice().sort((a,b)=>(a.rank||99)-(b.rank||99));
  $('roundRanking').innerHTML=ordered.map(r=>'<div class="rank-row '+(key(r.name)===key(currentName)?'me':'')+'"><div class="rank-num">'+(r.rank||'–')+'</div><div class="rank-main"><b>'+esc(r.name)+'</b><span>'+(r.estimate==null?'Nessuna stima':'Stima '+esc(r.estimate)+(r.distance!=null?' · distanza '+esc(r.distance):''))+'</span></div><div class="rank-points">'+(r.points>0?'+':'')+(r.points||0)+' pt</div></div>').join('');
  $('status').textContent='Risultato provvisorio: i punteggi definitivi compariranno dopo bonus, malus e movimento delle pedine.';
}
function typeClass(type){if(type==='bonus')return'bonus';if(type==='malus'||type==='penitenza'||type==='voce')return'malus';if(type==='timer')return'timer-cell';if(type==='duello'||type==='alfabetica'||type==='tiroleader')return'duello';if(type==='finale')return'finale';if(type!=='domanda')return'special';return''}
function pawn(p){return '<span class="pawn" style="background:'+(/^#[0-9a-f]{3,8}$/i.test(p.color||'')?p.color:'#2E6B7A')+'" title="'+esc(p.name)+'">'+esc((p.name||'?').slice(0,1).toUpperCase())+'</span>'}
function renderScores(scores){const sorted=(scores||[]).slice().sort((a,b)=>(b.score||0)-(a.score||0)||(b.pos||0)-(a.pos||0));$('scoreboard').innerHTML=sorted.map((p,i)=>'<div class="score-row '+(key(p.name)===key(currentName)?'me':'')+'"><div class="rank-num">'+(i+1)+'</div><div class="rank-main"><b>'+esc(p.name)+'</b><span>Casella '+(p.pos||0)+'</span></div><div class="rank-points">'+(p.score||0)+' pt</div></div>').join('');return {sorted,mine:meIn(sorted)}}
function renderMap(){if(!currentMap||!Array.isArray(currentMap.cells))return;const players=currentMap.players||[],mine=meIn(players),center=mine?Number(mine.pos)||0:0;let cells=[{n:0,type:'start',icon:'🚩',name:'Partenza'},...currentMap.cells];const visible=mapExpanded?cells:cells.filter(c=>Math.abs(c.n-center)<=4||c.n===0||c.n===currentMap.finish);$('map').innerHTML=visible.map(c=>{const here=players.filter(p=>(Number(p.pos)||0)===c.n);return '<div class="cell '+typeClass(c.type)+' '+(c.n===center?'current':'')+'"><span class="num">'+c.n+'</span><span class="cell-name">'+esc(c.icon||'')+' '+esc(c.name||'Casella')+'</span><span class="pawns">'+here.map(pawn).join('')+'</span></div>'}).join('');$('toggleMap').classList.toggle('hidden',cells.length<=visible.length&&mapExpanded);$('toggleMap').textContent=mapExpanded?'Mostra solo la tua zona':'Mostra tutta la mappa';$('mapNote').textContent=mine?'Sei alla casella '+center+' su '+currentMap.finish+'.':'Posizione in aggiornamento.'}
function applyMap(v){stopTimer();showScreen('mapScreen');$('mapText').textContent=v.text||'Punti e posizioni aggiornati.';const data=renderScores(v.scores||[]),mine=data.mine;const leader=data.sorted[0];$('personalSummary').innerHTML='<div class="metric"><small>La tua posizione</small><b>'+(mine?(data.sorted.indexOf(mine)+1)+'°':'—')+'</b></div><div class="metric"><small>Punti</small><b>'+(mine?mine.score:0)+'</b></div><div class="metric"><small>Casella</small><b>'+(mine?mine.pos:0)+'</b></div>';currentMap=v.map||null;mapExpanded=false;renderMap();$('toggleMap').classList.toggle('hidden',!currentMap||!currentMap.cells||currentMap.cells.length<=9);$('status').textContent=leader?'In testa: '+leader.name+' con '+leader.score+' punti.':''}
function compactScores(scores,target){
  const sorted=(scores||[]).slice().sort((a,b)=>(b.score||0)-(a.score||0)||(b.pos||0)-(a.pos||0));
  $(target).innerHTML=sorted.map((p,i)=>'<div class="compact-score"><b>'+(i+1)+'°. '+esc(p.name)+(key(p.name)===key(currentName)?' · tu':'')+'</b><span>'+(p.score||0)+' pt · cas. '+(p.pos||0)+'</span></div>').join('');
}
function applyInfo(v){
  stopTimer();showScreen('infoScreen');
  $('infoIcon').textContent=v.icon||(v.kind==='special'?'🎲':'📣');
  $('infoTitle').textContent=v.title||'Aggiornamento';
  $('infoSubject').textContent=v.subject||'';
  $('infoEffectTitle').textContent=v.effectTitle||v.title||'Aggiornamento di gioco';
  $('infoText').textContent=(v.description||v.text||'').replace(/\s+/g,' ').trim();
  $('infoInstruction').textContent=v.instruction||'Segui le indicazioni del Master.';
  const result=v.contextResult||null,map=v.contextMap||null;
  if(result||map){
    $('infoContext').classList.remove('hidden');
    $('contextAnswer').textContent=result?.answer||'Risposta non ancora disponibile';
    if(result?.funFact){$('contextFact').innerHTML='<b>💡 Curiosità verificata</b>'+esc(result.funFact);$('contextFact').classList.remove('hidden')}else{$('contextFact').classList.add('hidden');$('contextFact').innerHTML=''}
    compactScores(v.scores||map?.scores||result?.scores||[],'contextScores');
  }else{
    $('infoContext').classList.add('hidden');$('contextScores').innerHTML='';
  }
  $('status').textContent='Evento in corso. La situazione della partita resta visibile qui sotto.';
}
function applyView(v){if(v.kind==='result')return applyResult(v);if(v.kind==='map')return applyMap(v);return applyInfo(v)}
function applyState(s){if(s.view)applyView(s.view);else if(s.question)applyQuestion({...s.question,deadline:s.deadline,locked:s.locked,sent:s.sent});else showScreen('waitingScreen')}
function closeSocket(){manualClose=true;clearTimeout(retry);try{ws&&ws.close()}catch{}ws=null;setTimeout(()=>manualClose=false,80)}
function connect(mode){clearTimeout(retry);if(!currentCode||!currentName)return;connection(false,mode==='resume'?'Riconnessione…':'Connessione…');try{ws=new WebSocket(proto+location.host)}catch{return}$('status').textContent='';ws.onopen=()=>ws.send(JSON.stringify(mode==='resume'&&padToken?{t:'resume_pad',code:currentCode,token:padToken}:{t:'join',code:currentCode,name:currentName}));ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.t==='ok'||m.t==='resumed_pad'){currentCode=m.code;padToken=m.token||padToken;save();retryMs=1000;setRoom();connection(true,'Collegato');$('changeBtn').classList.remove('hidden');if(m.state)applyState(m.state);else showScreen('waitingScreen')}else if(m.t==='q')applyQuestion(m);else if(m.t==='lock'){stopTimer();showScreen('lockedScreen');$('status').textContent=sent?'La tua stima è al sicuro.':'Tempo scaduto: nessuna stima inviata.'}else if(m.t==='view')applyView(m);else if(m.t==='accepted'){sent=true;$('estimate').disabled=true;$('sendBtn').disabled=true;$('sentBox').classList.remove('hidden');$('status').textContent='Risposta registrata.'}else if(m.t==='duplicate'){sent=true;$('estimate').disabled=true;$('sendBtn').disabled=true;$('sentBox').classList.remove('hidden');$('status').textContent='La risposta era già stata inviata.'}else if(m.t==='personal_timeout'){$('estimate').disabled=true;$('sendBtn').disabled=true;$('status').textContent=m.msg||'Tempo personale scaduto: la lavagnetta è bloccata.'}else if(m.t==='room_closed'){padToken='';clearSaved();currentCode='';setRoom();showScreen('joinScreen');$('status').textContent=m.msg||'La partita è terminata.'}else if(m.t==='replaced'){showScreen('joinScreen');$('status').textContent=m.msg||'Sessione aperta altrove.'}else if(m.t==='err'){if(m.reset){padToken='';clearSaved();showScreen('joinScreen')} $('status').textContent='⚠️ '+m.msg}};ws.onclose=()=>{connection(false,'Connessione interrotta');if(manualClose)return;retry=setTimeout(()=>connect('resume'),retryMs);retryMs=Math.min(10000,retryMs*2)}}
function join(){const code=$('code').value.trim().toUpperCase(),name=$('name').value.trim();if(code.length!==4||!name){$('status').textContent='Inserisci un codice di quattro lettere e il tuo nome.';return}closeSocket();currentCode=code;currentName=name;padToken='';clearSaved();setRoom();setTimeout(()=>connect('join'),100)}
function submit(){if(!ws||ws.readyState!==WebSocket.OPEN||sent)return;const value=$('estimate').value.trim();if(!value){$('status').textContent='Inserisci prima una stima.';return}ws.send(JSON.stringify({t:'est',value}))}
$('joinBtn').addEventListener('click',join);$('sendBtn').addEventListener('click',submit);$('estimate').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});$('code').addEventListener('input',()=>$('code').value=$('code').value.toUpperCase());$('toggleMap').addEventListener('click',()=>{mapExpanded=!mapExpanded;renderMap()});$('changeBtn').addEventListener('click',()=>{try{ws&&ws.send(JSON.stringify({t:'leave_pad'}))}catch{}closeSocket();currentCode='';padToken='';clearSaved();setRoom();showScreen('joinScreen');$('status').textContent='Inserisci il codice della nuova stanza.'});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&padToken&&(!ws||ws.readyState>1)){retryMs=1000;connect('resume')}});window.addEventListener('pageshow',()=>{const saved=getSaved();if(queryCode&&saved&&saved.code!==queryCode){clearSaved();$('code').value=queryCode;$('name').value=saved.name||'';return}if(saved&&saved.code&&saved.name&&saved.token){currentCode=saved.code;currentName=saved.name;padToken=saved.token;$('code').value=currentCode;$('name').value=currentName;setRoom();connect('resume')}});
</script></body></html>`;

const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
function serveFile(res,name){fs.readFile(path.join(__dirname,name),(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Pagina non trovata')}res.writeHead(200,{'Content-Type':MIME[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store, no-cache, must-revalidate'});res.end(data)})}
const server = http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/lavagnetta'||pathname==='/lavagnetta/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'});return res.end(PAD)}
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({ok:true,rooms:rooms.size}))}
  if(pathname==='/'||pathname==='/gioco'||pathname==='/gioco/'||pathname==='/game.html') return serveFile(res,'game.html');
  const routes={'/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'};
  if(routes[pathname]) return serveFile(res,routes[pathname]);
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Pagina non trovata');
});
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw.toString()); } catch { return; }

    if (m.t === 'create') {
      if (ws._room && rooms.get(ws._room) && rooms.get(ws._room).masterSocket === ws) {
        destroyRoom(rooms.get(ws._room), 'Il Master ha aperto una nuova partita: stanza chiusa.');
      }
      const code = code4();
      const room = {
        code,
        masterToken: makeToken(),
        masterSocket: ws,
        pads: new Map(),
        round: 0,
        locked: true,
        deadline: 0,
        question: null,
        lastView: null,
        lastResult: null,
        lastMap: null,
        deleteTimer: null
      };
      rooms.set(code, room);
      ws._room = code;
      ws._role = 'master';
      send(ws, { t: 'room', code, token: room.masterToken, n: 0 });
      return;
    }

    if (m.t === 'resume_master') {
      const code = String(m.code || '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room || room.masterToken !== m.token) {
        return send(ws, { t: 'err', msg: 'La vecchia stanza non esiste più.', reset: true });
      }
      clearDeleteTimer(room);
      room.masterSocket = ws;
      ws._room = code;
      ws._role = 'master';
      send(ws, { t: 'resumed_master', code, n: livePads(room).length });
      return;
    }

    if (m.t === 'join') {
      const code = String(m.code || '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        return send(ws, {
          t: 'err',
          msg: 'Stanza non trovata. Controlla il nuovo codice.',
          reset: true
        });
      }

      const name = String(m.name || '').trim();
      if (!name) return send(ws, { t: 'err', msg: 'Inserisci il nome.' });

      const pad = {
        token: makeToken(),
        name,
        socket: null,
        answeredRound: -1,
        personalDeadline: 0
      };
      room.pads.set(pad.token, pad);
      attachPad(room, ws, pad);
      send(ws, {
        t: 'ok',
        code,
        token: pad.token,
        state: roomState(room, pad)
      });
      return;
    }

    if (m.t === 'resume_pad') {
      const code = String(m.code || '').trim().toUpperCase();
      const room = rooms.get(code);
      const pad = room?.pads.get(String(m.token || ''));

      if (!room || !pad) {
        return send(ws, {
          t: 'err',
          msg: 'Questa sessione apparteneva alla partita precedente. Inserisci il nuovo codice.',
          reset: true
        });
      }

      attachPad(room, ws, pad);
      send(ws, {
        t: 'resumed_pad',
        code,
        token: pad.token,
        state: roomState(room, pad)
      });
      return;
    }

    const room = rooms.get(ws._room);
    if (!room) return send(ws, { t: 'err', msg: 'Stanza scaduta.', reset: true });

    if (m.t === 'close_room' && ws._role === 'master') {
      destroyRoom(room, 'Il Master ha aperto una nuova partita. Inserisci il nuovo codice.');
      return;
    }

    if (m.t === 'leave_pad' && ws._role === 'pad') {
      room.pads.delete(ws._padToken);
      notifyMaster(room);
      try { ws.close(); } catch {}
      return;
    }

    if (m.t === 'q' && ws._role === 'master') {
      room.round += 1;
      room.locked = false;
      room.deadline = Date.now() + (Number(m.seconds) || 25) * 1000;
      room.question = {
        cat: m.cat || '',
        text: m.text || '',
        unit: m.unit || ''
      };
      room.lastView = null;

      const limits = m.playerLimits && typeof m.playerLimits === 'object'
        ? m.playerLimits
        : {};

      for (const pad of room.pads.values()) {
        const normalizedName = String(pad.name || '').trim().toLocaleLowerCase('it-IT');
        const requestedLimit = Number(limits[normalizedName]);
        const personalSeconds = Number.isFinite(requestedLimit)
          ? Math.max(1, Math.min(Number(m.seconds) || 25, requestedLimit))
          : (Number(m.seconds) || 25);

        pad.personalDeadline = Date.now() + personalSeconds * 1000;

        send(pad.socket, {
          t: 'q',
          cat: room.question.cat,
          text: room.question.text,
          unit: room.question.unit,
          deadline: pad.personalDeadline,
          globalDeadline: room.deadline,
          seconds: personalSeconds,
          limited: personalSeconds < (Number(m.seconds) || 25)
        });
      }
      return;
    }

    if (m.t === 'lock' && ws._role === 'master') {
      room.locked = true;
      room.deadline = 0;
      broadcastPads(room, { t: 'lock' });
      return;
    }

    if (m.t === 'view' && ws._role === 'master') {
      const payload = { ...m, t: 'view' };
      if (payload.kind === 'result') room.lastResult = payload;
      if (payload.kind === 'map') room.lastMap = payload;
      if (payload.kind === 'special' || payload.kind === 'info') {
        payload.contextResult = room.lastResult || null;
        payload.contextMap = room.lastMap || null;
      }
      room.lastView = payload;
      broadcastPads(room, payload);
      return;
    }

    if (m.t === 'est' && ws._role === 'pad') {
      const pad = room.pads.get(ws._padToken);
      if (!pad || room.locked) return;

      if (pad.personalDeadline && Date.now() > pad.personalDeadline) {
        return send(ws, {
          t: 'personal_timeout',
          msg: 'Il tuo tempo personale è scaduto. La lavagnetta è stata bloccata.'
        });
      }

      if (pad.answeredRound === room.round) {
        return send(ws, { t: 'duplicate' });
      }

      pad.answeredRound = room.round;
      send(ws, { t: 'accepted' });
      send(room.masterSocket, {
        t: 'est',
        name: pad.name,
        value: m.value
      });
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws._room);
    if (!room) return;

    if (ws._role === 'master') {
      if (room.masterSocket === ws) {
        room.masterSocket = null;
        scheduleDelete(room);
      }
      return;
    }

    if (ws._role === 'pad') {
      const pad = room.pads.get(ws._padToken);
      if (pad && pad.socket === ws) {
        pad.socket = null;
      }
      notifyMaster(room);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`A OCCHIO! attivo sulla porta ${PORT}`);
  console.log('Gioco: /  |  Lavagnetta: /lavagnetta');
});
