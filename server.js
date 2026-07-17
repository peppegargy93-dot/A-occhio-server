'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
const ROOM_GRACE_MS = 10 * 60 * 1000;
let GAME = '';
try { GAME = fs.readFileSync(path.join(__dirname, 'game.html'), 'utf8'); }
catch (error) { console.error('Impossibile leggere game.html:', error.message); }

const rooms = Object.create(null);
const token = () => crypto.randomBytes(18).toString('hex');

function code4(){
  const alphabet='ABCDEFGHKMNPRSTUVZ'; let code='';
  do{ code=Array.from({length:4},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join(''); }while(rooms[code]);
  return code;
}
function send(ws,payload){ if(ws && ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(payload)); }
function activePadCount(room){ return [...room.pads.values()].filter(p=>p.ws&&p.ws.readyState===WebSocket.OPEN).length; }
function broadcastPads(room,payload){ for(const p of room.pads.values()) send(p.ws,payload); }
function remember(room,payload){
  if(payload.t==='q' || payload.t==='lock') room.latestRound=payload;
  if(payload.t==='view') room.latestView=payload;
}
function cancelCleanup(room){ if(room.cleanupTimer){ clearTimeout(room.cleanupTimer); room.cleanupTimer=null; } }
function scheduleCleanup(room){
  cancelCleanup(room);
  room.cleanupTimer=setTimeout(()=>{
    if(room.master && room.master.readyState===WebSocket.OPEN) return;
    for(const p of room.pads.values()) if(p.ws&&p.ws.readyState===WebSocket.OPEN) p.ws.close();
    delete rooms[room.code];
  },ROOM_GRACE_MS);
}
function syncPad(room,pad){
  if(room.latestRound){
    const roundState={...room.latestRound};
    if(roundState.t==='q') roundState.alreadyAnswered=(pad.answeredRound===room.round);
    send(pad.ws,roundState);
  }
  if(room.latestView) send(pad.ws,room.latestView);
}

const PAD = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#20424E"><title>A OCCHIO! — Lavagnetta</title><style>
:root{--cream:#F5ECD6;--paper:#FFFDF6;--ink:#20424E;--petrol:#2E6B7A;--teal:#48A39A;--coral:#E0795E;--ochre:#E6AC3C;--line:rgba(32,66,78,.18)}*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:var(--cream);color:var(--ink);margin:0;padding:22px 16px;text-align:center;min-height:100dvh}main{max-width:420px;margin:auto}.card{background:var(--paper);border:2px solid var(--line);border-radius:22px;padding:20px;box-shadow:0 12px 28px rgba(32,66,78,.12)}h1{font-weight:950;letter-spacing:-1px;margin:8px 0 20px}.q{font-size:21px;font-weight:800;line-height:1.25;margin:16px 0}.cat{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--coral)}input,button{font:inherit;font-size:19px;padding:14px;border-radius:14px;width:100%;margin:7px 0}input{border:2px solid var(--ink);background:white;color:var(--ink)}button{background:var(--coral);color:white;font-weight:900;border:none}button:disabled,input:disabled{opacity:.5}.big{font-size:58px;font-weight:900;color:var(--coral);line-height:1}.hide{display:none}.st{font-size:13px;color:var(--petrol);margin-top:12px}.timer{font-size:42px;font-weight:950;margin:8px 0}.ok{color:var(--teal);font-weight:900}.info{margin-top:14px;padding:14px;border-radius:16px;background:#f8efd8;border:2px solid #ead39b;text-align:left}.info h2{font-size:19px;margin:0 0 8px}.info p{white-space:pre-line;margin:0;font-size:15px;line-height:1.45}.answer{font-size:34px;font-weight:950;color:var(--coral);text-align:center;margin:10px 0}.scores{margin-top:12px}.score{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px dashed var(--line)}.score.me{font-weight:950;background:#e4f2ef;border-radius:8px;padding:8px}.rank{font-size:13px;margin-top:8px}.reco{color:var(--ochre);font-weight:900}
</style></head><body><main><div class="card"><h1>👁 A OCCHIO!</h1><div id="join"><input id="code" placeholder="CODICE STANZA" maxlength="4" style="text-transform:uppercase"><input id="name" placeholder="Il tuo nome"><button id="joinBtn" type="button">Entra</button></div><div id="play" class="hide"><div id="big" class="big">✋</div><div id="cat" class="cat"></div><div id="q" class="q">Aspetta la domanda…</div><div id="timer" class="timer hide">20</div><input id="est" type="text" inputmode="decimal" placeholder="La tua stima" disabled><button id="sendBtn" type="button" disabled>Invia e blocca 📤</button><div id="info" class="info hide"><h2 id="infoTitle"></h2><div id="answer" class="answer hide"></div><p id="infoText"></p><div id="ranking" class="rank"></div><div id="scores" class="scores"></div></div></div><div id="st" class="st"></div></div></main><script>
let ws=null,sent=false,timerId=null,deadline=0,retry=null,creds=null;const $=id=>document.getElementById(id);const proto=location.protocol==='https:'?'wss://':'ws://';const params=new URLSearchParams(location.search);if(params.get('c'))$('code').value=params.get('c');try{creds=JSON.parse(localStorage.getItem('aocchio_pad')||'null')}catch(e){}if(creds){$('code').value=creds.code||$('code').value;$('name').value=creds.name||'';}
function setTimer(seconds,absolute){clearInterval(timerId);deadline=absolute||Date.now()+seconds*1000;$('timer').classList.remove('hide');const draw=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('timer').textContent=left;if(left<=0)clearInterval(timerId)};draw();timerId=setInterval(draw,200)}
function renderView(m){$('info').classList.remove('hide');$('infoTitle').textContent=m.title||'Aggiornamento';$('infoText').textContent=m.text||'';if(m.answer){$('answer').textContent=m.answer;$('answer').classList.remove('hide')}else $('answer').classList.add('hide');$('ranking').innerHTML=(m.ranking||[]).map(r=>'<div>'+r.name+': '+(r.estimate==null?'nessuna stima':r.estimate)+' · '+(r.points>0?'+'+r.points:r.points||0)+' pt</div>').join('');const my=(creds&&creds.name||'').toLowerCase();$('scores').innerHTML=(m.scores||[]).slice().sort((a,b)=>b.score-a.score||b.pos-a.pos).map(s=>'<div class="score '+(s.name.toLowerCase()===my?'me':'')+'"><span>'+s.name+(s.name.toLowerCase()===my?' (tu)':'')+'</span><b>'+s.score+' pt</b></div>').join('')}
function connect(){clearTimeout(retry);if(!creds)return;ws=new WebSocket(proto+location.host);$('st').textContent='Connessione…';ws.onopen=()=>ws.send(JSON.stringify({t:'join',code:creds.code,name:creds.name,token:creds.token||''}));ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.t==='ok'){creds.token=m.token;localStorage.setItem('aocchio_pad',JSON.stringify(creds));$('join').classList.add('hide');$('play').classList.remove('hide');$('st').innerHTML='<span class="ok">Collegato alla stanza '+m.code+'.</span>'}if(m.t==='err')$('st').textContent='⚠️ '+m.msg;if(m.t==='q'){sent=!!m.alreadyAnswered;$('info').classList.add('hide');$('big').textContent=sent?'✅':'✍️';$('cat').textContent=m.cat||'';$('q').textContent=m.text+(m.unit?' · '+m.unit:'');$('est').value='';$('est').disabled=sent;$('sendBtn').disabled=sent;$('st').textContent=sent?'Stima già inviata e bloccata.':'Scrivi la tua stima senza mostrarla agli altri.';setTimer(Number(m.seconds)||20,m.deadline);if(!sent)$('est').focus()}if(m.t==='lock'){clearInterval(timerId);$('timer').textContent='0';$('big').textContent='✋';$('q').textContent='Penne giù!';$('est').disabled=true;$('sendBtn').disabled=true;if(!sent)$('st').textContent='Tempo scaduto: nessuna risposta inviata.'}if(m.t==='duplicate'){$('st').textContent='Hai già inviato la risposta: non puoi modificarla.';sent=true;$('est').disabled=true;$('sendBtn').disabled=true}if(m.t==='view')renderView(m)};ws.onclose=()=>{$('st').innerHTML='<span class="reco">Riconnessione automatica…</span>';retry=setTimeout(connect,1200)}}
function join(){const code=$('code').value.trim().toUpperCase(),name=$('name').value.trim();if(code.length!==4||!name){$('st').textContent='Inserisci codice e nome.';return}creds={code,name,token:creds&&creds.code===code&&creds.name===name?creds.token:''};localStorage.setItem('aocchio_pad',JSON.stringify(creds));connect()}
function submit(){if(!ws||ws.readyState!==1||sent||$('est').disabled)return;const value=$('est').value.trim();if(!value){$('st').textContent='Inserisci una stima.';return}ws.send(JSON.stringify({t:'est',value}));sent=true;$('est').disabled=true;$('sendBtn').disabled=true;$('big').textContent='✅';$('st').innerHTML='<span class="ok">Stima inviata e bloccata.</span>'}
$('joinBtn').addEventListener('click',join);$('sendBtn').addEventListener('click',submit);$('est').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&creds&&(!ws||ws.readyState>1))connect()});if(creds&&creds.code&&creds.name)connect();
</script></body></html>`;

const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/lavagnetta'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(PAD);}
  if(pathname==='/'||pathname==='/gioco'||pathname==='/game.html'){if(!GAME){res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});return res.end('game.html non trovato');}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(GAME);}
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({ok:true,rooms:Object.keys(rooms).length}));}
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Pagina non trovata');
});

const wss=new WebSocketServer({server});
wss.on('connection',ws=>{
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw.toString())}catch{return}
    if(m.t==='create'){
      const code=code4(),masterToken=token();
      rooms[code]={code,master:ws,masterToken,pads:new Map(),round:0,locked:true,latestRound:null,latestView:null,cleanupTimer:null};
      ws._room=code;ws._master=true;send(ws,{t:'room',code,token:masterToken,n:0});return;
    }
    if(m.t==='resume_master'){
      const room=rooms[String(m.code||'').toUpperCase()];
      if(!room||m.token!==room.masterToken)return send(ws,{t:'err',msg:'Stanza scaduta: crea una nuova stanza.'});
      cancelCleanup(room);room.master=ws;ws._room=room.code;ws._master=true;send(ws,{t:'resumed_master',code:room.code,n:activePadCount(room)});return;
    }
    if(m.t==='join'){
      const code=String(m.code||'').trim().toUpperCase(),room=rooms[code];if(!room)return send(ws,{t:'err',msg:'Stanza non trovata'});
      const name=String(m.name||'Anonimo').trim()||'Anonimo';let padToken=String(m.token||'');let pad=padToken&&room.pads.get(padToken);
      if(!pad){padToken=token();pad={token:padToken,name,ws:null,answeredRound:-1};room.pads.set(padToken,pad)}
      else pad.name=name;
      if(pad.ws&&pad.ws!==ws&&pad.ws.readyState===WebSocket.OPEN)pad.ws.close();pad.ws=ws;ws._room=code;ws._master=false;ws._padToken=padToken;
      send(ws,{t:'ok',code,token:padToken});send(room.master,{t:'peer',name,n:activePadCount(room)});syncPad(room,pad);return;
    }
    const room=rooms[ws._room];if(!room)return;
    if((m.t==='q'||m.t==='lock'||m.t==='view')&&ws._master){
      if(m.t==='q'){room.round++;room.locked=false;room.latestView=null;m.deadline=Date.now()+(Number(m.seconds)||20)*1000;}
      if(m.t==='lock')room.locked=true;remember(room,m);broadcastPads(room,m);return;
    }
    if(m.t==='est'&&!ws._master){const pad=room.pads.get(ws._padToken);if(!pad||room.locked)return;if(pad.answeredRound===room.round)return send(ws,{t:'duplicate'});pad.answeredRound=room.round;send(room.master,{t:'est',name:pad.name,value:m.value});return;}
  });
  ws.on('close',()=>{
    const room=rooms[ws._room];if(!room)return;
    if(ws._master){if(room.master===ws)room.master=null;scheduleCleanup(room);return;}
    const pad=room.pads.get(ws._padToken);if(pad&&pad.ws===ws)pad.ws=null;send(room.master,{t:'bye',name:pad&&pad.name,n:activePadCount(room)});
  });
});
server.listen(PORT,'0.0.0.0',()=>console.log(`A OCCHIO! attivo sulla porta ${PORT}`));
