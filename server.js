// A OCCHIO! — server unico: gioco principale + lavagnette + WebSocket
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const GAME_PATH = path.join(__dirname, 'game.html');
const GAME = fs.readFileSync(GAME_PATH, 'utf8');

const rooms = {}; // code -> {master, pads: Map<ws, {name}>}
const code4 = () => {
  let c = '';
  const A = 'ABCDEFGHKMNPRSTUVZ';
  for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)];
  return rooms[c] ? code4() : c;
};

const PAD=`<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>A OCCHIO! — Lavagnetta</title>
<style>
:root{--ink:#1E2E33;--paper:#F3EBD3;--coral:#E0795E;--teal:#2E6B7A;--cream:#fffaf0}
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--paper);color:var(--ink);margin:0;min-height:100svh;padding:22px;text-align:center}
.wrap{width:min(100%,430px);margin:0 auto}
h1{font-weight:950;letter-spacing:-1.5px;margin:8px 0 18px}
.card{background:var(--cream);border:2.5px solid var(--ink);border-radius:20px;padding:18px;box-shadow:4px 5px 0 rgba(30,46,51,.16)}
input,button{font-size:19px;padding:14px;border-radius:14px;border:2.5px solid var(--ink);width:100%;margin:7px 0}
button{background:var(--coral);color:#fff;font-weight:900;border:none;min-height:54px}
button:disabled,input:disabled{opacity:.5}
.hide{display:none!important}
.eyebrow{font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;color:var(--teal)}
#question{font-size:23px;font-weight:900;line-height:1.18;margin:10px 0 6px}
#unit{font-size:13px;color:var(--teal);font-weight:800;min-height:18px}
#timer{font-size:72px;line-height:1;font-weight:950;color:var(--ink);margin:18px 0 8px;font-variant-numeric:tabular-nums}
#timer.warn{color:var(--coral)}
.bar{height:10px;border-radius:99px;background:#ded5bd;overflow:hidden;margin:0 0 15px}
.bar i{display:block;height:100%;width:100%;background:var(--teal);transition:width .25s linear}
#est{font-size:28px;text-align:center;font-weight:900}
.icon{font-size:62px;line-height:1;margin:8px 0 12px}
.msg{font-size:16px;line-height:1.35}
#st{font-size:13px;color:var(--teal);margin-top:14px;min-height:20px}
.room{font-size:12px;font-weight:850;color:var(--teal);margin-top:8px}
</style>
</head>
<body>
<div class="wrap">
<h1>👁 A OCCHIO!</h1>

<section id="join" class="card">
  <div class="eyebrow">Collegati alla partita</div>
  <input id="code" placeholder="CODICE STANZA" maxlength="4" autocapitalize="characters" style="text-transform:uppercase">
  <input id="name" placeholder="Il tuo nome" maxlength="20">
  <button id="joinBtn" onclick="join()">Entra nella stanza</button>
</section>

<section id="waiting" class="card hide">
  <div class="icon">📲</div>
  <div class="eyebrow">Lavagnetta collegata</div>
  <div class="msg"><b id="hello">Sei dentro!</b><br>Attendi che il narratore avvii la prossima domanda.</div>
  <div class="room" id="room"></div>
</section>

<section id="play" class="card hide">
  <div class="eyebrow" id="meta">Domanda</div>
  <div id="question">Aspetta la domanda…</div>
  <div id="unit"></div>
  <div id="timer">20</div>
  <div class="bar"><i id="bar"></i></div>
  <input id="est" type="text" inputmode="decimal" placeholder="Inserisci la tua stima" autocomplete="off">
  <button id="sendBtn" onclick="sendEstimate()">Invia stima 📤</button>
  <div id="playMsg" class="msg"></div>
</section>

<section id="locked" class="card hide">
  <div class="icon" id="lockIcon">✋</div>
  <div class="eyebrow" id="lockTitle">Penne giù</div>
  <div class="msg" id="lockMsg">Tempo scaduto. La lavagnetta è bloccata.<br>Attendi il prossimo round.</div>
  <div class="room" id="lockRoom"></div>
</section>

<div id="st"></div>
</div>

<script>
let ws=null, timerId=null, left=0, total=20, joinedName="", roomCode="", submitted=false;
const $=id=>document.getElementById(id);
const socketUrl=(location.protocol==='https:'?'wss://':'ws://')+location.host;
const params=new URLSearchParams(location.search);
if(params.get('c')) $('code').value=params.get('c').toUpperCase();

function show(id){
  ['join','waiting','play','locked'].forEach(x=>$(x).classList.toggle('hide',x!==id));
}
function setStatus(text){$('st').textContent=text||''}
function stopClock(){if(timerId){clearInterval(timerId);timerId=null}}
function paintClock(){
  $('timer').textContent=Math.max(0,left);
  $('timer').classList.toggle('warn',left<=5);
  $('bar').style.width=(Math.max(0,left)/Math.max(1,total)*100)+'%';
}
function join(){
  const code=$('code').value.trim().toUpperCase();
  joinedName=$('name').value.trim()||'Anonimo';
  if(code.length!==4){setStatus('⚠️ Inserisci il codice stanza di 4 lettere.');return}
  $('joinBtn').disabled=true;
  setStatus('Connessione…');
  ws=new WebSocket(socketUrl);
  ws.onopen=()=>ws.send(JSON.stringify({t:'join',code,name:joinedName}));
  ws.onmessage=e=>{
    let m;try{m=JSON.parse(e.data)}catch(err){return}
    if(m.t==='ok'){
      roomCode=m.code;
      $('hello').textContent='Ciao '+joinedName+'!';
      $('room').textContent='Stanza '+roomCode;
      $('lockRoom').textContent='Stanza '+roomCode;
      setStatus('');
      show('waiting');
    }
    if(m.t==='err'){
      $('joinBtn').disabled=false;
      setStatus('⚠️ '+m.msg);
    }
    if(m.t==='q') openQuestion(m);
    if(m.t==='lock') lockBoard(false);
  };
  ws.onclose=()=>{
    stopClock();
    setStatus('Connessione persa. Ricarica la pagina per rientrare.');
    $('sendBtn').disabled=true;
    $('est').disabled=true;
  };
}
function openQuestion(m){
  stopClock();
  submitted=false;
  total=Math.max(1,Number(m.seconds)||20);
  left=total;
  $('meta').textContent=(m.round?'Round '+m.round+' · ':'')+(m.cat||'Domanda');
  $('question').textContent=m.text||'Nuova domanda';
  $('unit').textContent=m.unit?'Rispondi in '+m.unit:'';
  $('est').value='';
  $('est').disabled=false;
  $('sendBtn').disabled=false;
  $('playMsg').textContent='';
  show('play');
  paintClock();
  setTimeout(()=>$('est').focus(),150);
  timerId=setInterval(()=>{
    left--;
    paintClock();
    if(left<=0){stopClock();lockBoard(false)}
  },1000);
}
function sendEstimate(){
  if(submitted||left<=0||!ws||ws.readyState!==1)return;
  const value=$('est').value.trim();
  if(value===''){
    $('playMsg').textContent='Inserisci prima una stima.';
    return;
  }
  submitted=true;
  ws.send(JSON.stringify({t:'est',value}));
  stopClock();
  $('lockIcon').textContent='✅';
  $('lockTitle').textContent='Stima inviata';
  $('lockMsg').innerHTML='La risposta è stata consegnata.<br>Attendi la prossima domanda.';
  show('locked');
}
function lockBoard(fromServer){
  if(submitted)return;
  stopClock();
  submitted=true;
  $('est').disabled=true;
  $('sendBtn').disabled=true;
  $('lockIcon').textContent='✋';
  $('lockTitle').textContent='Penne giù';
  $('lockMsg').innerHTML='Tempo scaduto. La lavagnetta è bloccata.<br>Attendi il prossimo round.';
  show('locked');
}
</script>
</body>
</html>`;

const srv = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/lavagnetta') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(PAD);
  }

  if (pathname === '/' || pathname === '/gioco') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(GAME);
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, rooms: Object.keys(rooms).length }));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Pagina non trovata');
});

const wss=new WebSocketServer({server:srv});
wss.on('connection',ws=>{
  ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}
    if(m.t==='create'){const c=code4();rooms[c]={master:ws,pads:new Map()};ws._room=c;ws._master=true;
      ws.send(JSON.stringify({t:'room',code:c}));}
    else if(m.t==='join'){const r=rooms[m.code];if(!r)return ws.send(JSON.stringify({t:'err',msg:'Stanza non trovata'}));
      r.pads.set(ws,{name:m.name});ws._room=m.code;
      ws.send(JSON.stringify({t:'ok',code:m.code}));
      r.master&&r.master.send(JSON.stringify({t:'peer',name:m.name,n:r.pads.size}));}
    else if(m.t==='q'||m.t==='lock'){const r=rooms[ws._room];if(r&&ws._master)for(const p of r.pads.keys())p.send(JSON.stringify(m));}
    else if(m.t==='est'){const r=rooms[ws._room];const info=r&&r.pads.get(ws);
      if(r&&info&&r.master)r.master.send(JSON.stringify({t:'est',name:info.name,value:m.value}));}
  });
  ws.on('close',()=>{const r=rooms[ws._room];if(!r)return;
    if(ws._master){for(const p of r.pads.keys())p.close();delete rooms[ws._room];}
    else{const i=r.pads.get(ws);r.pads.delete(ws);r.master&&r.master.send(JSON.stringify({t:'bye',name:i&&i.name,n:r.pads.size}));}});
});

srv.listen(PORT, () => {
  console.log(`A OCCHIO! server unico sulla porta ${PORT}`);
  console.log('Gioco: /  |  Lavagnetta: /lavagnetta');
});
