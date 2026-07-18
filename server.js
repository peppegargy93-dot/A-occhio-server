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
:root{--cream:#F5ECD6;--paper:#FFFDF6;--ink:#20424E;--petrol:#2E6B7A;--teal:#48A39A;--coral:#E0795E;--ochre:#E6AC3C;--line:rgba(32,66,78,.18)}
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:var(--cream);color:var(--ink);margin:0;padding:18px 14px;text-align:center;min-height:100dvh}
main{max-width:440px;margin:auto}.card{background:var(--paper);border:2px solid var(--line);border-radius:22px;padding:20px;box-shadow:0 12px 28px rgba(32,66,78,.12)}
h1{font-weight:950;letter-spacing:-1px;margin:8px 0 20px}.q{font-size:21px;font-weight:800;line-height:1.25;margin:16px 0}.cat{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--coral)}
input,button{font:inherit;font-size:18px;padding:14px;border-radius:14px;width:100%;margin:7px 0}input{border:2px solid var(--ink);background:white;color:var(--ink)}button{background:var(--coral);color:white;font-weight:900;border:none}button.secondary{background:transparent;color:var(--ink);border:2px solid var(--line);font-size:14px;padding:10px}button:disabled,input:disabled{opacity:.5}.big{font-size:58px;font-weight:900;color:var(--coral);line-height:1}.hide{display:none!important}.st{font-size:13px;color:var(--petrol);margin-top:12px}.timer{font-size:42px;font-weight:950;margin:8px 0}.ok{color:var(--teal);font-weight:900}
.info{text-align:left;white-space:pre-wrap;line-height:1.45;font-size:15px}.scores{margin-top:14px}.score{display:flex;gap:10px;align-items:center;padding:9px 2px;border-bottom:1px dashed var(--line)}.score b{flex:1;text-align:left}.score span{font-weight:900}
.map{display:flex;flex-direction:column-reverse;gap:7px;margin-top:14px}.cell{display:flex;align-items:center;gap:9px;text-align:left;padding:9px 11px;border:2px solid var(--line);border-radius:14px;background:#eef2f2}.cell.bonus{background:#f6e6b8}.cell.malus{background:#f6d9cf}.cell.timer{background:#d9ecec;font-size:inherit;margin:0}.cell.finale{background:var(--ink);color:white}.num{font-weight:950;min-width:30px}.cellname{flex:1;font-size:13px;font-weight:800}.pawns{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end}.pawn{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;color:white;border:2px solid white;font-size:10px;font-weight:950}
</style>
</head>
<body><main><div class="card">
<h1>👁 A OCCHIO!</h1>
<div id="join">
  <input id="code" placeholder="CODICE STANZA" maxlength="4" style="text-transform:uppercase">
  <input id="name" placeholder="Il tuo nome">
  <button id="joinBtn" type="button">Entra</button>
</div>
<div id="play" class="hide">
  <div id="big" class="big">✋</div>
  <div id="cat" class="cat"></div>
  <div id="q" class="q">Aspetta la domanda…</div>
  <div id="timer" class="timer hide">20</div>
  <input id="est" type="text" inputmode="decimal" placeholder="La tua stima" disabled>
  <button id="sendBtn" type="button" disabled>Invia e blocca 📤</button>
  <div id="scores" class="scores hide"></div>
  <div id="map" class="map hide"></div>
  <button id="changeBtn" class="secondary" type="button">Cambia stanza</button>
</div>
<div id="st" class="st"></div>
</div></main>
<script>
let ws=null,sent=false,timerId=null,deadline=0,retry=null,retryMs=1000,currentCode='',currentName='',padToken='',manualClose=false;
const $=id=>document.getElementById(id);
const proto=location.protocol==='https:'?'wss://':'ws://';
const queryCode=(new URLSearchParams(location.search).get('c')||'').trim().toUpperCase();
if(queryCode)$('code').value=queryCode;

function getSaved(){try{return JSON.parse(localStorage.getItem('aocchio_pad')||'null')}catch{return null}}
function save(){try{localStorage.setItem('aocchio_pad',JSON.stringify({code:currentCode,name:currentName,token:padToken}))}catch{}}
function clearSaved(){try{localStorage.removeItem('aocchio_pad')}catch{}}
function stopTimer(){clearInterval(timerId);timerId=null}
function setTimer(value){
  stopTimer();deadline=Number(value)||0;
  if(!deadline){$('timer').classList.add('hide');return}
  $('timer').classList.remove('hide');
  const draw=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('timer').textContent=left;if(left<=0)stopTimer()};
  draw();timerId=setInterval(draw,200);
}
function resetPlay(){
  stopTimer();sent=false;$('big').textContent='✋';$('cat').textContent='';$('q').textContent='Aspetta la domanda…';
  $('timer').classList.add('hide');$('est').value='';$('est').disabled=true;$('sendBtn').disabled=true;
  $('scores').classList.add('hide');$('map').classList.add('hide');$('scores').innerHTML='';$('map').innerHTML='';
}
function showJoin(message=''){
  resetPlay();$('play').classList.add('hide');$('join').classList.remove('hide');$('st').textContent=message;
}
function closeSocket(){
  manualClose=true;clearTimeout(retry);
  try{ws&&ws.close()}catch{}ws=null;
  setTimeout(()=>{manualClose=false},50);
}
function applyQuestion(m){
  sent=!!m.sent;$('scores').classList.add('hide');$('map').classList.add('hide');
  $('big').textContent=sent?'✅':'✍️';$('cat').textContent=m.cat||'';$('q').textContent=(m.text||'')+(m.unit?' · '+m.unit:'');
  $('est').disabled=sent||m.locked;$('sendBtn').disabled=sent||m.locked;
  $('st').textContent=sent?'Stima già inviata e bloccata.':'Scrivi la tua stima senza mostrarla agli altri.';
  setTimer(m.deadline||0);
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeColor(c){return /^#[0-9a-f]{3,8}$/i.test(c||'')?c:'#2E6B7A'}
function pawn(p){return '<span class="pawn" style="background:'+safeColor(p.color)+'" title="'+esc(p.name||'')+'">'+esc((p.name||'?').slice(0,1).toUpperCase())+'</span>'}
function renderScores(scores){
  if(!Array.isArray(scores)||!scores.length){$('scores').classList.add('hide');return}
  $('scores').innerHTML=scores.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map(p=>'<div class="score"><b>'+esc(p.name||'')+'</b><span>'+(p.score||0)+' pt · cas. '+(p.pos||0)+'</span></div>').join('');
  $('scores').classList.remove('hide');
}
function typeClass(type){if(type==='bonus')return'bonus';if(type==='malus'||type==='penitenza')return'malus';if(type==='timer')return'timer';if(type==='finale')return'finale';return''}
function renderMap(map){
  if(!map||!Array.isArray(map.cells)){$('map').classList.add('hide');return}
  const players=Array.isArray(map.players)?map.players:[];
  let html='<div class="cell"><span class="num">0</span><span class="cellname">🚩 Partenza</span><span class="pawns">'+players.filter(p=>(p.pos||0)===0).map(pawn).join('')+'</span></div>';
  html+=map.cells.map(c=>'<div class="cell '+typeClass(c.type)+'"><span class="num">'+c.n+'</span><span>'+(c.icon||'')+'</span><span class="cellname">'+esc(c.name||c.type||'Casella')+'</span><span class="pawns">'+players.filter(p=>(p.pos||0)===c.n).map(pawn).join('')+'</span></div>').join('');
  $('map').innerHTML=html;$('map').classList.remove('hide');
}
function applyView(v){
  stopTimer();$('timer').classList.add('hide');$('est').disabled=true;$('sendBtn').disabled=true;
  $('big').textContent=v.kind==='map'?'🗺️':'📣';$('cat').textContent=v.title||'Aggiornamento';$('q').textContent=v.text||'';
  renderScores(v.scores||[]);renderMap(v.map);$('st').textContent='Aggiornamento della partita.';
}
function applyState(s){
  if(s.view)applyView(s.view);
  else if(s.question)applyQuestion({...s.question,deadline:s.deadline,locked:s.locked,sent:s.sent});
  else resetPlay();
}
function connect(mode){
  clearTimeout(retry);
  if(!currentCode||!currentName)return;
  try{ws=new WebSocket(proto+location.host)}catch{$('st').textContent='Impossibile collegarsi.';return}
  $('st').textContent=mode==='resume'?'Riconnessione…':'Connessione…';
  ws.onopen=()=>ws.send(JSON.stringify(mode==='resume'&&padToken?{t:'resume_pad',code:currentCode,token:padToken}:{t:'join',code:currentCode,name:currentName}));
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}
    if(m.t==='ok'||m.t==='resumed_pad'){
      currentCode=m.code;padToken=m.token||padToken;save();
      retryMs=1000;
      $('join').classList.add('hide');$('play').classList.remove('hide');$('st').textContent='Collegato alla stanza '+m.code+'.';
      if(m.state)applyState(m.state);
    } else if(m.t==='q') applyQuestion(m);
    else if(m.t==='lock'){stopTimer();$('timer').textContent='0';$('big').textContent='✋';$('q').textContent='Penne giù!';$('est').disabled=true;$('sendBtn').disabled=true;if(!sent)$('st').textContent='Tempo scaduto: nessuna risposta inviata.'}
    else if(m.t==='view') applyView(m);
    else if(m.t==='accepted'){sent=true;$('est').disabled=true;$('sendBtn').disabled=true;$('big').textContent='✅';$('st').innerHTML='<span class="ok">Stima inviata e bloccata.</span>'}
    else if(m.t==='duplicate'){sent=true;$('est').disabled=true;$('sendBtn').disabled=true;$('st').textContent='Hai già inviato la risposta: non puoi modificarla.'}
    else if(m.t==='room_closed'){padToken='';clearSaved();showJoin(m.msg||'La partita è terminata. Inserisci il nuovo codice.')}
    else if(m.t==='replaced')showJoin(m.msg||'Sessione spostata su un’altra scheda.')
    else if(m.t==='err'){if(m.reset){padToken='';clearSaved();showJoin('⚠️ '+m.msg)}else $('st').textContent='⚠️ '+m.msg}
  };
  ws.onclose=()=>{if(manualClose)return;$('st').textContent='Connessione interrotta: riprovo tra '+Math.round(retryMs/1000)+'s…';retry=setTimeout(()=>connect('resume'),retryMs);retryMs=Math.min(10000,retryMs*2)};
}
function changeRoom(){manualClose=true;try{ws&&ws.close()}catch(e){};clearTimeout(retry);padToken='';clearSaved();manualClose=false;showJoin('Inserisci il codice della nuova stanza.');}
function join(){
  const code=$('code').value.trim().toUpperCase(),name=$('name').value.trim();
  if(code.length!==4||!name){$('st').textContent='Inserisci codice e nome.';return}
  closeSocket();resetPlay();currentCode=code;currentName=name;padToken='';clearSaved();setTimeout(()=>connect('join'),80);
}
function submit(){
  if(!ws||ws.readyState!==WebSocket.OPEN||sent||$('est').disabled)return;
  const value=$('est').value.trim();if(!value){$('st').textContent='Inserisci una stima.';return}
  ws.send(JSON.stringify({t:'est',value}));
}
$('joinBtn').addEventListener('click',join);
$('sendBtn').addEventListener('click',submit);
$('changeBtn').addEventListener('click',()=>{try{ws&&ws.send(JSON.stringify({t:'leave_pad'}))}catch{}closeSocket();currentCode='';padToken='';clearSaved();showJoin('Inserisci il nuovo codice stanza.')});
$('est').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
$('code').addEventListener('input',()=>{$('code').value=$('code').value.toUpperCase()});

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible' && padToken && (!ws || ws.readyState>1)){ retryMs=1000; connect('resume'); }
});
window.addEventListener('pageshow',()=>{
  const saved=getSaved();
  if(queryCode&&saved&&saved.code!==queryCode){
    clearSaved();currentCode='';padToken='';showJoin('Nuovo codice rilevato: entra nella nuova stanza.');
    $('code').value=queryCode;$('name').value=saved.name||'';return;
  }
  if(saved&&saved.code&&saved.name&&saved.token){
    currentCode=saved.code;currentName=saved.name;padToken=saved.token;$('code').value=currentCode;$('name').value=currentName;connect('resume');
  }
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentCode&&currentName&&(!ws||ws.readyState>1))connect('resume')});
</script></body></html>`;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/lavagnetta') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    return res.end(PAD);
  }

  if (pathname === '/' || pathname === '/gioco' || pathname === '/game.html') {
    if (!GAME) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('game.html non trovato');
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    return res.end(GAME);
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Pagina non trovata');
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
        answeredRound: -1
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

      broadcastPads(room, {
        t: 'q',
        cat: room.question.cat,
        text: room.question.text,
        unit: room.question.unit,
        deadline: room.deadline,
        seconds: Number(m.seconds) || 25
      });
      return;
    }

    if (m.t === 'lock' && ws._role === 'master') {
      room.locked = true;
      room.deadline = 0;
      broadcastPads(room, { t: 'lock' });
      return;
    }

    if (m.t === 'view' && ws._role === 'master') {
      room.lastView = { ...m, t: 'view' };
      broadcastPads(room, room.lastView);
      return;
    }

    if (m.t === 'est' && ws._role === 'pad') {
      const pad = room.pads.get(ws._padToken);
      if (!pad || room.locked) return;
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
