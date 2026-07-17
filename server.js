'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
let GAME = '';
try {
  GAME = fs.readFileSync(path.join(__dirname, 'game.html'), 'utf8');
} catch (error) {
  console.error('Impossibile leggere game.html:', error.message);
}

const rooms = Object.create(null);

function code4() {
  const alphabet = 'ABCDEFGHKMNPRSTUVZ';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms[code]);
  return code;
}

function send(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

function broadcastPads(room, payload) {
  for (const pad of room.pads.keys()) send(pad, payload);
}

const PAD = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#20424E">
<title>A OCCHIO! — Lavagnetta</title>
<style>
:root{--cream:#F5ECD6;--paper:#FFFDF6;--ink:#20424E;--petrol:#2E6B7A;--teal:#48A39A;--coral:#E0795E;--line:rgba(32,66,78,.18)}
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:var(--cream);color:var(--ink);margin:0;padding:22px 16px;text-align:center;min-height:100dvh}
main{max-width:420px;margin:auto}.card{background:var(--paper);border:2px solid var(--line);border-radius:22px;padding:20px;box-shadow:0 12px 28px rgba(32,66,78,.12)}
h1{font-weight:950;letter-spacing:-1px;margin:8px 0 20px}.q{font-size:21px;font-weight:800;line-height:1.25;margin:16px 0}.cat{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--coral)}
input,button{font:inherit;font-size:19px;padding:14px;border-radius:14px;width:100%;margin:7px 0}input{border:2px solid var(--ink);background:white;color:var(--ink)}button{background:var(--coral);color:white;font-weight:900;border:none}button:disabled,input:disabled{opacity:.5}.big{font-size:58px;font-weight:900;color:var(--coral);line-height:1}.hide{display:none}.st{font-size:13px;color:var(--petrol);margin-top:12px}.timer{font-size:42px;font-weight:950;margin:8px 0}.ok{color:var(--teal);font-weight:900}
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
</div>
<div id="st" class="st"></div>
</div></main>
<script>
let ws=null, sent=false, timerId=null, deadline=0;
const $=id=>document.getElementById(id);
const proto=location.protocol==='https:'?'wss://':'ws://';
const params=new URLSearchParams(location.search);if(params.get('c'))$('code').value=params.get('c');
function setTimer(seconds){clearInterval(timerId);deadline=Date.now()+seconds*1000;$('timer').classList.remove('hide');const draw=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('timer').textContent=left;if(left<=0)clearInterval(timerId)};draw();timerId=setInterval(draw,200)}
function join(){const code=$('code').value.trim().toUpperCase(),name=$('name').value.trim();if(code.length!==4||!name){$('st').textContent='Inserisci codice e nome.';return}ws=new WebSocket(proto+location.host);ws.onopen=()=>ws.send(JSON.stringify({t:'join',code,name}));ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}
if(m.t==='ok'){$('join').classList.add('hide');$('play').classList.remove('hide');$('st').textContent='Collegato alla stanza '+m.code;}
if(m.t==='err')$('st').textContent='⚠️ '+m.msg;
if(m.t==='q'){sent=false;$('big').textContent='✍️';$('cat').textContent=m.cat||'';$('q').textContent=m.text+(m.unit?' · '+m.unit:'');$('est').value='';$('est').disabled=false;$('sendBtn').disabled=false;$('st').textContent='Scrivi la tua stima senza mostrarla agli altri.';setTimer(Number(m.seconds)||20);$('est').focus();}
if(m.t==='lock'){clearInterval(timerId);$('timer').textContent='0';$('big').textContent='✋';$('q').textContent='Penne giù!';$('est').disabled=true;$('sendBtn').disabled=true;if(!sent)$('st').textContent='Tempo scaduto: nessuna risposta inviata.';}
if(m.t==='duplicate')$('st').textContent='Hai già inviato la risposta: non puoi modificarla.';
};ws.onclose=()=>{$('st').textContent='Connessione persa. Ricarica per rientrare.';};}
function submit(){if(!ws||sent||$('est').disabled)return;const value=$('est').value.trim();if(!value){$('st').textContent='Inserisci una stima.';return}ws.send(JSON.stringify({t:'est',value}));sent=true;$('est').disabled=true;$('sendBtn').disabled=true;$('big').textContent='✅';$('st').innerHTML='<span class="ok">Stima inviata e bloccata.</span>';}
$('joinBtn').addEventListener('click',join);$('sendBtn').addEventListener('click',submit);$('est').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
</script></body></html>`;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  if (pathname === '/lavagnetta') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(PAD);
  }

  if (pathname === '/' || pathname === '/gioco' || pathname === '/game.html') {
    if (!GAME) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('game.html non trovato');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(GAME);
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, rooms: Object.keys(rooms).length }));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Pagina non trovata');
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }

    if (message.t === 'create') {
      const code = code4();
      rooms[code] = { master: ws, pads: new Map(), round: 0, locked: true };
      ws._room = code;
      ws._master = true;
      send(ws, { t: 'room', code });
      return;
    }

    if (message.t === 'join') {
      const code = String(message.code || '').trim().toUpperCase();
      const room = rooms[code];
      if (!room) return send(ws, { t: 'err', msg: 'Stanza non trovata' });
      const name = String(message.name || 'Anonimo').trim() || 'Anonimo';
      room.pads.set(ws, { name, answeredRound: -1 });
      ws._room = code;
      ws._master = false;
      send(ws, { t: 'ok', code });
      send(room.master, { t: 'peer', name, n: room.pads.size });
      return;
    }

    const room = rooms[ws._room];
    if (!room) return;

    if ((message.t === 'q' || message.t === 'lock') && ws._master) {
      if (message.t === 'q') {
        room.round += 1;
        room.locked = false;
      } else {
        room.locked = true;
      }
      broadcastPads(room, message);
      return;
    }

    if (message.t === 'est' && !ws._master) {
      const info = room.pads.get(ws);
      if (!info || room.locked) return;
      if (info.answeredRound === room.round) return send(ws, { t: 'duplicate' });
      info.answeredRound = room.round;
      send(room.master, { t: 'est', name: info.name, value: message.value });
    }
  });

  ws.on('close', () => {
    const room = rooms[ws._room];
    if (!room) return;

    if (ws._master) {
      for (const pad of room.pads.keys()) pad.close();
      delete rooms[ws._room];
      return;
    }

    const info = room.pads.get(ws);
    room.pads.delete(ws);
    send(room.master, { t: 'bye', name: info && info.name, n: room.pads.size });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`A OCCHIO! attivo sulla porta ${PORT}`);
  console.log('Gioco: /  |  Lavagnetta: /lavagnetta');
});
