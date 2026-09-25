'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
const ROOM_TTL_MS = 10 * 60 * 1000;

const GAME_PATH = path.join(__dirname, 'game.html');
if (!fs.existsSync(GAME_PATH)) {
  throw new Error(`Impossibile avviare il gioco: manca ${GAME_PATH}`);
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

function playerList(room) {
  return [...room.pads.values()].map(pad => ({
    id: pad.token,
    name: pad.name,
    connected: !!(pad.socket && pad.socket.readyState === WebSocket.OPEN)
  }));
}

function notifyMaster(room) {
  send(room.masterSocket, {
    t: 'peer',
    n: livePads(room).length,
    players: playerList(room)
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
  const personalSeconds = pad?.personalSeconds || room.seconds || 25;
  const personalDeadline = pad?.personalDeadline || room.deadline;
  const question = room.question
    ? {
        ...room.question,
        seconds: personalSeconds,
        limited: personalSeconds < (room.seconds || 25),
        globalDeadline: room.deadline
      }
    : null;
  const activeMini = pad && room.activeMini?.playerTokens.has(pad.token)
    ? room.activeMini
    : null;
  const activeChoice = pad && room.activeChoice?.chooserToken === pad.token && !room.activeChoice.resolved
    ? room.activeChoice
    : null;
  return {
    locked: room.locked,
    round: room.round,
    deadline: pad && !room.locked ? personalDeadline : room.deadline,
    question,
    view: room.lastView,
    lastResult: room.lastResult || null,
    lastMap: room.lastMap || null,
    sent: !!pad && pad.answeredRound === room.round,
    choiceRequest: activeChoice ? activeChoice.payload : null,
    miniRequest: activeMini && !activeMini.responses.has(pad.token) && !activeMini.unavailableSent.has(pad.token) ? activeMini.payload : null,
    miniSent: !!activeMini && activeMini.responses.has(pad.token)
  };
}

function normalizeName(value) {
  return String(value || '').trim().toLocaleLowerCase('it-IT');
}

function queueMasterEvent(room, payload) {
  const eventId = payload.eventId || `${payload.t}:${payload.requestId || makeToken()}`;
  const event = { ...payload, eventId };
  room.masterEvents.set(eventId, event);
  send(room.masterSocket, event);
  return event;
}

function choiceFallback(room, choice, message) {
  if (!choice || choice.resolved || choice.fallbackSent) return;
  choice.fallbackSent = true;
  choice.resolved = true;
  if (room.activeChoice === choice) room.activeChoice = null;
  queueMasterEvent(room, {
    t: 'choice_unavailable',
    requestId: choice.requestId,
    reason: 'disconnected',
    msg: message || 'La lavagnetta del giocatore si è disconnessa.'
  });
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
.panel{background:var(--paper);border:1.5px solid var(--line);border-radius:22px;padding:17px;box-shadow:var(--shadow);overflow:clip;min-width:0}.screen{display:none;min-width:0}.screen.active{display:block;animation:enter .34s cubic-bezier(.2,.9,.3,1) both}@keyframes enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes reveal{0%{opacity:0;transform:scale(.88)}70%{transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}
.eyebrow{font-size:10.5px;font-weight:950;letter-spacing:1.35px;text-transform:uppercase;color:var(--coral);margin-bottom:7px}.hero{text-align:center}.icon{font-size:48px;line-height:1;margin:7px 0 11px}.title{font-size:25px;font-weight:950;letter-spacing:-.55px;line-height:1.12;margin:0}.sub{font-size:13.5px;color:#587078;line-height:1.45;margin:8px 0 0}.question{font-size:23px;font-weight:850;letter-spacing:-.3px;line-height:1.27;margin:12px 0;text-align:center}.category{display:inline-flex;background:var(--petrol);color:white;border-radius:999px;padding:5px 11px;font-size:10.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
.timer{font-size:64px;font-weight:950;letter-spacing:-3px;line-height:1;text-align:center;margin:13px 0 2px;font-variant-numeric:tabular-nums}.timer.warn{color:var(--coral)}.timer-label{text-align:center;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#7b725d}.bar{height:8px;background:var(--soft);border-radius:99px;overflow:hidden;margin:10px 0 16px}.bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--teal),var(--ochre),var(--coral));transition:width .2s linear}
.field{margin-top:12px}.field label{display:block;font-size:12px;font-weight:900;margin:0 0 6px}.field input{width:100%;border:2px solid var(--ink);background:var(--paper2);border-radius:14px;padding:14px 13px;font:inherit;font-size:21px;font-weight:850;color:var(--ink);text-align:center}.btn{width:100%;border:0;border-radius:14px;padding:14px 16px;margin-top:10px;font:inherit;font-size:15px;font-weight:900;background:var(--coral);color:white}.btn.secondary{background:transparent;color:var(--ink);border:1.5px solid var(--line);font-size:13px;padding:10px}.btn:disabled,.field input:disabled{opacity:.46}.status{text-align:center;font-size:12.5px;color:#587078;margin:10px 0 0;min-height:18px}.success{display:flex;align-items:center;gap:10px;background:#e4f1ed;border:1.5px solid #badbd2;border-radius:14px;padding:12px;text-align:left;margin-top:14px}.success b{display:block}.success span{font-size:12px;color:#45685f}
.fact-card{background:#eef4f0;border:1.5px solid #c9ddd2;border-radius:14px;padding:12px 13px;margin:11px 0;text-align:left;font-size:12.5px;line-height:1.45;color:#3f5d55;min-width:0;overflow-wrap:break-word}.fact-card b{display:block;margin-bottom:3px;color:var(--ink)}.event-card{background:var(--paper2);border:1.5px solid var(--line);border-radius:16px;padding:14px;margin-top:12px;text-align:left}.event-subject{font-size:10px;font-weight:950;letter-spacing:1px;text-transform:uppercase;color:var(--coral)}.event-title{font-size:21px;font-weight:950;line-height:1.15;margin:5px 0 7px}.event-desc{font-size:14px;line-height:1.45;color:#48646c}.instruction{margin-top:10px;padding:10px 11px;border-radius:12px;background:#eef4f0;border:1px solid #c9ddd2;font-size:12.5px;font-weight:800;line-height:1.4}.context-card{margin-top:14px;border-top:1px dashed var(--line);padding-top:13px}.context-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.context-answer{font-size:18px;font-weight:950;color:var(--coral)}.compact-score{display:flex;justify-content:space-between;gap:9px;padding:7px 1px;border-bottom:1px dashed var(--line);font-size:12.5px}.compact-score b{font-weight:900}.compact-score span{white-space:nowrap;font-weight:900;color:var(--teal)}
.challenge-detail{margin-top:12px;display:grid;gap:9px}.challenge-why{background:#fff4d2;border:1px solid #e2c66f;border-radius:12px;padding:10px;font-size:12px;line-height:1.4}.challenge-why b{display:block;color:#6f510c;margin-bottom:3px}.challenge-answer{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding-top:7px;border-top:1px dashed #d9c376;flex-wrap:wrap}.challenge-evidence{display:grid;gap:5px;margin-top:7px}.challenge-evidence div{display:flex;justify-content:space-between;gap:8px;background:rgba(255,255,255,.7);border-radius:8px;padding:7px;flex-wrap:wrap;min-width:0}.challenge-evidence span{min-width:0;overflow-wrap:break-word}.drawn-game{border:2px solid var(--ink);border-radius:14px;padding:11px;background:#fffaf0;min-width:0}.drawn-game h3{margin:0 0 7px;font-size:18px;overflow-wrap:break-word}.drawn-game ol{margin:0;padding-left:22px;display:grid;gap:5px;font-size:12px;line-height:1.35}.game-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.game-meta span{display:block;border-radius:9px;background:var(--soft);padding:7px;font-size:10.5px;min-width:0;overflow-wrap:break-word}.game-meta b{display:block;font-size:12px;margin-top:2px}
.answer-card{background:var(--paper2);border:2px solid var(--ochre);border-radius:17px;padding:15px;text-align:center;margin:12px 0;animation:reveal .5s cubic-bezier(.2,1.2,.3,1) both}.answer-label{font-size:10px;font-weight:950;letter-spacing:1.4px;text-transform:uppercase;color:#806522}.answer-value{font-size:40px;font-weight:950;letter-spacing:-1.4px;color:var(--coral);line-height:1.08;margin-top:3px}.question-small{font-family:Georgia,serif;font-size:13px;color:#746a54;margin-top:6px;line-height:1.4}
.personal{border:1.5px solid var(--line);border-radius:16px;padding:13px;margin:12px 0;background:#fff}.personal-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.personal-name{font-weight:950}.round-points{font-size:23px;font-weight:950;color:var(--teal)}.personal-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.metric{background:var(--soft);border-radius:11px;padding:9px}.metric small{display:block;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#687b80}.metric b{display:block;margin-top:2px;font-size:15px}.section-title{font-size:11px;font-weight:950;letter-spacing:1.1px;text-transform:uppercase;margin:15px 0 7px}.rank-row,.score-row{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:9px;padding:10px 3px;border-bottom:1px dashed var(--line)}.rank-row.me,.score-row.me{background:#fff3d6;border-radius:11px;padding-left:8px;padding-right:8px;border-bottom:0;margin:3px 0}.rank-num{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:var(--soft);font-size:12px;font-weight:950}.rank-main b{display:block;font-size:14px}.rank-main span{display:block;font-size:11px;color:#65787e;margin-top:1px}.rank-points{font-weight:950;color:var(--teal);white-space:nowrap}.step{opacity:1;animation:stepIn .34s ease both}@keyframes stepIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:10px 0 13px}.summary .metric{text-align:center}.summary .metric b{font-size:17px}.map-wrap{position:relative}.map{display:flex;flex-direction:column-reverse;gap:7px;padding:5px 0 5px 23px;position:relative}.map:before{content:"";position:absolute;left:10px;top:16px;bottom:16px;width:3px;border-radius:99px;background:linear-gradient(var(--teal),var(--ochre),var(--coral),var(--ink));opacity:.35}.cell{position:relative;display:grid;grid-template-columns:31px 1fr auto;gap:8px;align-items:center;min-height:49px;padding:7px 9px;border:1.5px solid var(--line);border-radius:13px;background:#e8eff0;text-align:left}.cell:before{content:"";position:absolute;width:13px;height:3px;left:-14px;top:50%;background:var(--line)}.cell.current{box-shadow:0 0 0 3px var(--coral);transform:scale(1.01)}.cell.bonus{background:#f5e5b7}.cell.malus{background:#f4d9cf}.cell.timer-cell{background:#d8ebeb}.cell.duello{background:#e2dcea}.cell.special{background:#e9e2d0}.cell.finale{background:var(--ink);color:white}.num{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.75);font-size:11px;font-weight:950;color:var(--ink)}.cell-name{font-size:12px;font-weight:900;line-height:1.15}.pawns{display:flex;gap:2px;flex-wrap:wrap;justify-content:flex-end}.pawn{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;color:white;border:2px solid white;font-size:9px;font-weight:950}.map-note{text-align:center;font-size:11px;color:#687b80;margin-top:8px}.hidden{display:none!important}
.win-rule{border:1px solid #c9ddd2;background:#eef4f0;border-radius:12px;padding:10px;font-size:11.5px;line-height:1.4;margin:10px 0}.movement-list{display:grid;gap:7px;margin:10px 0}.movement-row{border:1px solid var(--line);background:var(--paper2);border-radius:12px;padding:9px}.movement-head{display:flex;gap:7px;justify-content:space-between;align-items:center}.movement-deltas{display:flex;gap:5px}.movement-deltas b{border-radius:999px;padding:4px 6px;font-size:10px;background:#e4f1ed;color:var(--teal)}.movement-deltas b:last-child{background:#fff0c8;color:#806119}.movement-source{font-size:10.5px;color:#65787e;margin-top:4px}.dual-title{display:grid;grid-template-columns:1fr 1fr;gap:7px}.dual-title>div{border:1px solid var(--line);border-radius:12px;padding:8px}@media(max-width:380px){.dual-title{grid-template-columns:1fr}}
.connection{display:flex;align-items:center;gap:6px;font-size:11px;color:#65787e;margin-top:9px;justify-content:center}.dot{width:7px;height:7px;border-radius:50%;background:var(--teal)}.dot.off{background:var(--coral)}
.choice-list{display:grid;grid-template-columns:minmax(0,1fr);gap:9px;margin-top:12px;max-height:min(48dvh,430px);overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px}.choice-btn{appearance:none;-webkit-appearance:none;width:100%;min-width:0;display:grid;gap:4px;text-align:left;border:1.5px solid var(--line);border-radius:14px;background:var(--paper);color:var(--ink);padding:12px 13px;font:inherit;touch-action:manipulation}.choice-btn b,.choice-btn span,.event-title,.event-desc,.instruction{min-width:0;overflow-wrap:break-word;word-break:normal;-webkit-hyphens:none;hyphens:none;font-variant-ligatures:none}.choice-btn b{font-size:14px;line-height:1.25}.choice-btn span{font-size:12px;line-height:1.35;color:#587078}.choice-btn:disabled{opacity:.5}.rename-box{margin-top:18px;padding-top:14px;border-top:1px dashed var(--line)}
.mini-answer-form{display:grid;gap:10px;margin-top:12px}.mini-answer-field label{display:block;font-size:11px;font-weight:950;margin-bottom:5px}.mini-answer-field input{width:100%;min-width:0;border:2px solid var(--ink);background:var(--paper2);border-radius:13px;padding:13px;font:inherit;font-size:19px;font-weight:850;text-align:center;color:var(--ink)}.mini-answer-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mini-answer-option{border:1.5px solid var(--line);border-radius:12px;background:var(--paper);color:var(--ink);padding:13px 8px;font:inherit;font-size:13px;font-weight:900;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.mini-answer-option.selected{background:var(--petrol);border-color:var(--petrol);color:#fff}.mini-answer-submit{margin-top:2px;touch-action:manipulation}.mini-answer-note{font-size:11px;color:#587078;text-align:center;line-height:1.35}.mini-answer-timer{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 4px;border-radius:50%;background:var(--ink);color:#fff;font-size:25px;font-weight:950;font-variant-numeric:tabular-nums}.mini-answer-timer.warn{background:var(--coral)}.mini-order-list{display:grid;gap:7px}.mini-order-item{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:7px;align-items:center;border:1.5px solid var(--line);border-radius:12px;background:#fff;padding:8px;min-width:0}.mini-order-number{width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:var(--ochre);font-size:11px;font-weight:950}.mini-order-label{font-size:12px;font-weight:900;line-height:1.25;overflow-wrap:break-word;min-width:0}.mini-order-controls{display:flex;gap:4px}.mini-order-move{border:1.5px solid var(--petrol);border-radius:8px;background:#fff;color:var(--petrol);padding:9px 10px;font:inherit;font-weight:950;line-height:1;touch-action:manipulation}.mini-order-move:disabled{opacity:.28}
@supports not (height:100dvh){.choice-list{max-height:48vh}}
@media(max-width:380px){body{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}.panel{padding:14px;border-radius:18px}.event-title{font-size:18px}.choice-btn{padding:11px}.context-head,.compact-score{align-items:flex-start;flex-direction:column}.compact-score span{white-space:normal}}
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

    <section id="waitingScreen" class="screen"><div class="hero"><div class="icon">✋</div><div class="eyebrow">Sei collegato</div><h2 class="title">Aspetta la prossima domanda</h2><p class="sub">Qui compariranno domanda, timer e risultati della partita.</p></div><div class="rename-box"><div class="field"><label for="renameName">Modifica nickname prima dell'inizio</label><input id="renameName" maxlength="18" autocomplete="off"></div><button id="renameBtn" class="btn secondary" type="button">Aggiorna nickname</button></div></section>

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
      <div id="winRule" class="win-rule"></div><div id="movementSummary" class="movement-list hidden"></div>
      <div class="dual-title"><div><div class="section-title">📊 Classifica punti</div><div id="scoreboard"></div></div><div><div class="section-title">🗺️ Corsa sul tabellone</div><div id="boardScoreboard"></div></div></div>
      <div class="section-title">Il percorso</div><div class="map-wrap"><div id="map" class="map"></div></div>
      <button id="toggleMap" class="btn secondary hidden" type="button">Mostra tutta la mappa</button><div id="mapNote" class="map-note"></div>
    </section>

    <section id="infoScreen" class="screen">
      <div class="hero"><div id="infoIcon" class="icon">📣</div><div id="infoTitle" class="eyebrow"></div></div>
      <div class="event-card"><div id="infoSubject" class="event-subject"></div><div id="infoEffectTitle" class="event-title"></div><div id="infoText" class="event-desc"></div><div id="infoInstruction" class="instruction"></div><div id="challengeDetail" class="challenge-detail hidden"></div><div id="choiceList" class="choice-list hidden"></div></div>
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
function getSaved(){try{return JSON.parse(localStorage.getItem('aocchio_pad')||'null')}catch{return null}}function save(){try{localStorage.setItem('aocchio_pad',JSON.stringify({code:currentCode,name:currentName,token:padToken}));localStorage.setItem('aocchio_nickname',currentName)}catch{}}function clearSaved(){try{const old=getSaved();localStorage.removeItem('aocchio_pad');if(old&&old.name)localStorage.setItem('aocchio_nickname',old.name)}catch{}}
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
  if(v.funFact){$('funFact').innerHTML='<b>💡 Curiosità</b>'+esc(v.funFact)+(v.funFactSource?'<small style="display:block;margin-top:6px;color:#6b7c76">Fonte: '+esc(v.funFactSource)+'</small>':'');$('funFact').classList.remove('hidden')}else{$('funFact').classList.add('hidden');$('funFact').innerHTML=''}
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
function renderScores(scores){const sorted=(scores||[]).slice().sort((a,b)=>(b.score||0)-(a.score||0)||(b.pos||0)-(a.pos||0)),board=(scores||[]).slice().sort((a,b)=>(b.pos||0)-(a.pos||0)||(b.score||0)-(a.score||0));$('scoreboard').innerHTML=sorted.map((p,i)=>'<div class="score-row '+(key(p.name)===key(currentName)?'me':'')+'"><div class="rank-num">'+(i+1)+'</div><div class="rank-main"><b>'+esc(p.name)+'</b></div><div class="rank-points">'+(p.score||0)+' pt</div></div>').join('');$('boardScoreboard').innerHTML=board.map((p,i)=>'<div class="score-row '+(key(p.name)===key(currentName)?'me':'')+'"><div class="rank-num">'+(i+1)+'</div><div class="rank-main"><b>'+esc(p.name)+'</b></div><div class="rank-points">cas. '+(p.pos||0)+'</div></div>').join('');return {sorted,board,mine:meIn(sorted)}}
function renderMap(){if(!currentMap||!Array.isArray(currentMap.cells))return;const players=currentMap.players||[],mine=meIn(players),center=mine?Number(mine.pos)||0:0;let cells=[{n:0,type:'start',icon:'🚩',name:'Partenza'},...currentMap.cells];const visible=mapExpanded?cells:cells.filter(c=>Math.abs(c.n-center)<=4||c.n===0||c.n===currentMap.finish);$('map').innerHTML=visible.map(c=>{const here=players.filter(p=>(Number(p.pos)||0)===c.n);return '<div class="cell '+typeClass(c.type)+' '+(c.n===center?'current':'')+'"><span class="num">'+c.n+'</span><span class="cell-name">'+esc(c.icon||'')+' '+esc(c.name||'Casella')+'</span><span class="pawns">'+here.map(pawn).join('')+'</span></div>'}).join('');$('toggleMap').classList.toggle('hidden',cells.length<=9);$('toggleMap').textContent=mapExpanded?'Mostra solo la tua zona':'Mostra tutta la mappa';$('mapNote').textContent=mine?'Sei alla casella '+center+' su '+currentMap.finish+'.':'Posizione in aggiornamento.'}
function applyMap(v){stopTimer();showScreen('mapScreen');$('mapText').textContent=v.text||'Punti e posizioni aggiornati.';const data=renderScores(v.scores||[]),mine=data.mine,leader=data.sorted[0],boardLeader=data.board[0];$('personalSummary').innerHTML='<div class="metric"><small>Posizione punti</small><b>'+(mine?(data.sorted.indexOf(mine)+1)+'°':'—')+'</b></div><div class="metric"><small>Punti</small><b>'+(mine?mine.score:0)+'</b></div><div class="metric"><small>Casella</small><b>'+(mine?mine.pos:0)+'</b></div>';$('winRule').textContent=v.winRule||'Raggiungi per primo la Finale per vincere subito. Se nessuno ci arriva entro 15 round, vince chi ha più punti.';const movement=Array.isArray(v.movement)?v.movement:[];$('movementSummary').innerHTML=movement.map(row=>'<div class="movement-row"><div class="movement-head"><b>'+esc(row.name)+'</b><span class="movement-deltas"><b>'+(row.scoreDelta>=0?'+':'')+row.scoreDelta+' pt</b><b>'+(row.posDelta>=0?'+':'')+row.posDelta+' cas.</b></span></div><div class="movement-source">'+(row.sources||[]).map(s=>'<b>'+esc(s.label)+'</b>'+(s.detail?' · '+esc(s.detail):'')).join('<br>')+'</div></div>').join('');$('movementSummary').classList.toggle('hidden',!movement.length);currentMap=v.map||null;mapExpanded=false;renderMap();$('status').textContent=leader&&boardLeader?'Punti: '+leader.name+' · Tabellone: '+boardLeader.name+'.':''}
function compactScores(scores,target){
  const sorted=(scores||[]).slice().sort((a,b)=>(b.score||0)-(a.score||0)||(b.pos||0)-(a.pos||0));
  $(target).innerHTML=sorted.map((p,i)=>'<div class="compact-score"><b>'+(i+1)+'°. '+esc(p.name)+(key(p.name)===key(currentName)?' · tu':'')+'</b><span>'+(p.score||0)+' pt · cas. '+(p.pos||0)+'</span></div>').join('');
}
function applyChoiceRequest(v){
  stopTimer();showScreen('infoScreen');
  $('challengeDetail').classList.add('hidden');$('challengeDetail').innerHTML='';
  $('infoIcon').textContent='👉';
  $('infoTitle').textContent='Tocca a te';
  $('infoSubject').textContent=v.subject||currentName;
  $('infoEffectTitle').textContent=v.title||'Fai la tua scelta';
  $('infoText').textContent=v.description||'Scegli una delle opzioni disponibili.';
  $('infoInstruction').textContent='La scelta è personale e può essere inviata soltanto da questa lavagnetta.';
  $('infoContext').classList.add('hidden');
  const box=$('choiceList');
  const options=Array.isArray(v.options)?v.options:[];
  box.innerHTML=options.map(o=>'<button type="button" class="choice-btn" data-id="'+esc(o.id)+'"><b>'+esc(o.label)+'</b><span>'+esc(o.description||'')+'</span></button>').join('');
  box.classList.remove('hidden');
  if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({t:'choice_ready',requestId:v.requestId}));
  box.querySelectorAll('.choice-btn').forEach(btn=>btn.addEventListener('click',()=>{
    box.querySelectorAll('.choice-btn').forEach(b=>b.disabled=true);
    ws.send(JSON.stringify({t:'choice_response',requestId:v.requestId,optionId:btn.dataset.id}));
    $('infoInstruction').textContent='Scelta inviata. Attendi la conferma del gioco.';
  }));
  $('status').textContent='Questa scelta spetta a te.';
}
function applyMiniRequest(v){
  stopTimer();showScreen('infoScreen');
  $('challengeDetail').classList.add('hidden');$('challengeDetail').innerHTML='';
  $('infoIcon').textContent=v.icon||'⚡';$('infoTitle').textContent='Mini sfida · Tocca a te';
  $('infoSubject').textContent=v.subject||currentName;$('infoEffectTitle').textContent=v.title||'Inserisci la tua risposta';
  $('infoText').textContent=v.description||'La risposta viene inviata direttamente al Master.';
  $('infoInstruction').textContent='Solo le lavagnette degli sfidanti sono attive. La risposta si blocca dopo l’invio.';
  $('infoContext').classList.add('hidden');
  const box=$('choiceList'),fields=Array.isArray(v.fields)?v.fields:[],values={};let submitted=false;
  const timerHtml=Number(v.deadline)?'<div id="miniAnswerTimer" class="mini-answer-timer">'+Math.max(0,Math.ceil((Number(v.deadline)-Date.now())/1000))+'</div>':'';
  box.innerHTML='<div class="mini-answer-form">'+timerHtml+fields.map(field=>{
    if(field.type==='choice')return '<div class="mini-answer-field"><label>'+esc(field.label||'Scegli')+'</label><div class="mini-answer-options">'+(field.options||[]).map(option=>'<button type="button" class="mini-answer-option" data-field="'+esc(field.id)+'" data-value="'+esc(option.id)+'">'+esc(option.label)+'</button>').join('')+'</div></div>';
    if(field.type==='order')return '<div class="mini-answer-field"><label>'+esc(field.label||'Metti in ordine')+'</label><div class="mini-order-list" data-field="'+esc(field.id)+'">'+(field.items||[]).map((item,index)=>'<div class="mini-order-item" data-value="'+esc(item.id)+'"><span class="mini-order-number">'+(index+1)+'</span><span class="mini-order-label">'+esc(item.label)+'</span><span class="mini-order-controls"><button type="button" class="mini-order-move" data-dir="-1" aria-label="Sposta su">↑</button><button type="button" class="mini-order-move" data-dir="1" aria-label="Sposta giù">↓</button></span></div>').join('')+'</div></div>';
    return '<div class="mini-answer-field"><label for="mini_'+esc(field.id)+'">'+esc(field.label||'Risposta')+'</label><input id="mini_'+esc(field.id)+'" class="mini-answer-input" data-field="'+esc(field.id)+'" inputmode="decimal" autocomplete="off" placeholder="'+esc(field.placeholder||'Scrivi un numero')+'"></div>';
  }).join('')+'<button id="miniAnswerSubmit" type="button" class="btn mini-answer-submit">Invia e blocca</button><div class="mini-answer-note">Gli altri giocatori seguono la sfida in modalità spettatore.</div></div>';
  box.classList.remove('hidden');
  if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({t:'mini_ready',requestId:v.requestId}));
  box.querySelectorAll('.mini-answer-option').forEach(button=>button.addEventListener('click',()=>{values[button.dataset.field]=button.dataset.value;box.querySelectorAll('.mini-answer-option[data-field="'+button.dataset.field+'"]').forEach(item=>item.classList.toggle('selected',item===button));if(fields.length===1)setTimeout(()=>submitMini(false),120)}));
  function refreshOrder(list){const rows=[...list.querySelectorAll('.mini-order-item')];rows.forEach((row,index)=>{row.querySelector('.mini-order-number').textContent=index+1;const moves=row.querySelectorAll('.mini-order-move');moves[0].disabled=index===0;moves[1].disabled=index===rows.length-1});values[list.dataset.field]=rows.map(row=>row.dataset.value).join('|')}
  box.querySelectorAll('.mini-order-list').forEach(list=>{refreshOrder(list);list.querySelectorAll('.mini-order-move').forEach(button=>button.addEventListener('click',()=>{const row=button.closest('.mini-order-item'),direction=Number(button.dataset.dir),sibling=direction<0?row.previousElementSibling:row.nextElementSibling;if(!sibling)return;if(direction<0)list.insertBefore(row,sibling);else list.insertBefore(sibling,row);refreshOrder(list)}))});
  function submitMini(auto){
    if(submitted)return;
    fields.forEach(field=>{if(field.type!=='choice'&&field.type!=='order'){const input=box.querySelector('.mini-answer-input[data-field="'+field.id+'"]');values[field.id]=(input?.value||'').trim()}});
    if(fields.some(field=>!String(values[field.id]??'').trim())){$('status').textContent='Completa tutti i campi prima di inviare.';return}
    submitted=true;stopTimer();
    box.querySelectorAll('input,button').forEach(control=>control.disabled=true);
    ws.send(JSON.stringify({t:'mini_response',requestId:v.requestId,values}));
    $('infoInstruction').textContent=auto?'Tempo scaduto: l’ordine attuale è stato inviato.':'Risposta inviata. Attendi anche l’altro sfidante.';$('status').textContent='Risposta bloccata.';
  }
  $('miniAnswerSubmit').addEventListener('click',()=>submitMini(false));
  if(Number(v.deadline)){const draw=()=>{const left=Math.max(0,Math.ceil((Number(v.deadline)-Date.now())/1000)),timer=$('miniAnswerTimer');if(timer){timer.textContent=left;timer.classList.toggle('warn',left<=5)}if(left<=0){stopTimer();submitMini(true)}};draw();if(!submitted)timerId=setInterval(draw,150)}
  $('status').textContent='La mini sfida è attiva sulla tua lavagnetta.';
}
function applyInfo(v){
  stopTimer();showScreen('infoScreen');
  $('choiceList').classList.add('hidden');$('choiceList').innerHTML='';
  $('infoIcon').textContent=v.icon||(v.kind==='special'?'🎲':'📣');
  $('infoTitle').textContent=v.title||'Aggiornamento';
  $('infoSubject').textContent=v.subject||'';
  $('infoEffectTitle').textContent=v.effectTitle||v.title||'Aggiornamento di gioco';
  // PAD_HTML è un template literal del server: il doppio backslash deve
  // sopravvivere fino allo script del browser, altrimenti /\s+/ diventa /s+/
  // e rimuove tutte le lettere "s" dai testi della lavagnetta.
  $('infoText').textContent=(v.description||v.text||'').replace(/\\s+/g,' ').trim();
  $('infoInstruction').textContent=v.instruction||'Segui le indicazioni del Master.';
  const detail=$('challengeDetail'),challenge=v.challenge||null;
  if(challenge&&challenge.game){
    const reason=challenge.reason||{},game=challenge.game||{};
    let why='';
    if(reason.type==='distance_tie'){
      const evidence=(reason.players||[]).map(p=>'<div><span><b>'+esc(p.name)+'</b> · stima '+esc(p.estimate)+'</span><span><b>'+esc(p.formula||p.scoreDistance)+'</b></span></div>').join('');
      why='<div class="challenge-why"><b>🔎 Perché parte la sfida</b>'+esc(reason.title||'Parità di distanza')+'<div class="challenge-answer"><span>Risposta corretta</span><strong>'+esc(reason.correctAnswer||'—')+'</strong></div><div class="challenge-evidence">'+evidence+'</div></div>';
    }else if(reason.title){why='<div class="challenge-why"><b>🗺️ Perché parte la sfida</b>'+esc(reason.title)+'<br>'+esc(reason.text||'')+'</div>'}
    detail.innerHTML=why+'<div class="drawn-game"><h3>'+esc(game.icon||'🎴')+' '+esc(game.name||'Sfida')+'</h3><ol>'+(game.rules||[]).map(rule=>'<li>'+esc(rule)+'</li>').join('')+'</ol><div class="game-meta"><span>Durata<b>'+esc(game.duration||'—')+'</b></span><span>Come si vince<b>'+esc(game.win||'—')+'</b></span></div></div>';
    detail.classList.remove('hidden');
  }else{detail.classList.add('hidden');detail.innerHTML=''}
  const result=v.contextResult||null,map=v.contextMap||null;
  if(result||map){
    $('infoContext').classList.remove('hidden');
    $('contextAnswer').textContent=result?.answer||'Risposta non ancora disponibile';
    if(result?.funFact){$('contextFact').innerHTML='<b>💡 Curiosità</b>'+esc(result.funFact)+(result.funFactSource?'<small style="display:block;margin-top:6px;color:#6b7c76">Fonte: '+esc(result.funFactSource)+'</small>':'');$('contextFact').classList.remove('hidden')}else{$('contextFact').classList.add('hidden');$('contextFact').innerHTML=''}
    compactScores(v.scores||map?.scores||result?.scores||[],'contextScores');
  }else{
    $('infoContext').classList.add('hidden');$('contextScores').innerHTML='';
  }
  $('status').textContent='Evento in corso. La situazione della partita resta visibile qui sotto.';
}
function applyView(v){if(v.kind==='result')return applyResult(v);if(v.kind==='map')return applyMap(v);return applyInfo(v)}
function applyState(s){if(s.choiceRequest)return applyChoiceRequest(s.choiceRequest);if(s.miniRequest)return applyMiniRequest(s.miniRequest);if(s.view)applyView(s.view);else if(s.question&&s.locked){stopTimer();showScreen('lockedScreen');$('status').textContent=s.sent?'La tua stima è al sicuro.':'Le risposte sono già chiuse.'}else if(s.question)applyQuestion({...s.question,deadline:s.deadline,locked:s.locked,sent:s.sent});else{$('renameName').value=currentName;showScreen('waitingScreen')}}
let connectAttempt=0,openTimer=null;
function closeSocket(){manualClose=true;clearTimeout(retry);clearTimeout(openTimer);try{ws&&ws.close()}catch{}ws=null;setTimeout(()=>manualClose=false,80)}
function scheduleReconnect(){if(manualClose||retry)return;const wait=retryMs+Math.floor(Math.random()*350);retry=setTimeout(()=>{retry=null;connect('resume')},wait);retryMs=Math.min(10000,Math.round(retryMs*1.7))}
function connect(mode){clearTimeout(retry);retry=null;if(!currentCode||!currentName)return;if(ws&&(ws.readyState===WebSocket.OPEN||ws.readyState===WebSocket.CONNECTING))return;const attempt=++connectAttempt;connection(false,mode==='resume'?'Riconnessione…':'Connessione…');try{ws=new WebSocket(proto+location.host)}catch{return scheduleReconnect()}const socket=ws;$('status').textContent='';openTimer=setTimeout(()=>{if(socket.readyState===WebSocket.CONNECTING)socket.close()},9000);socket.onopen=()=>{if(attempt!==connectAttempt)return socket.close();clearTimeout(openTimer);socket.send(JSON.stringify(mode==='resume'&&padToken?{t:'resume_pad',code:currentCode,token:padToken}:{t:'join',code:currentCode,name:currentName}))};socket.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.t==='server_ping'){socket.send(JSON.stringify({t:'client_pong'}));return}if(m.t==='ok'||m.t==='resumed_pad'){currentCode=m.code;padToken=m.token||padToken;save();retryMs=1000;setRoom();connection(true,'Collegato');$('changeBtn').classList.remove('hidden');if(m.state)applyState(m.state);else{$('renameName').value=currentName;showScreen('waitingScreen')}}else if(m.t==='nickname_updated'){currentName=m.name;save();$('name').value=currentName;$('renameName').value=currentName;$('status').textContent='Nickname aggiornato.'}else if(m.t==='q')applyQuestion(m);else if(m.t==='choice_request')applyChoiceRequest(m);else if(m.t==='mini_request')applyMiniRequest(m);else if(m.t==='lock'){stopTimer();showScreen('lockedScreen');$('status').textContent=sent?'La tua stima è al sicuro.':'Tempo scaduto: nessuna stima inviata.'}else if(m.t==='view')applyView(m);else if(m.t==='accepted'){sent=true;$('estimate').disabled=true;$('sendBtn').disabled=true;$('sentBox').classList.remove('hidden');$('status').textContent='Risposta registrata.'}else if(m.t==='duplicate'){sent=true;$('estimate').disabled=true;$('sendBtn').disabled=true;$('sentBox').classList.remove('hidden');$('status').textContent='La risposta era già stata inviata.'}else if(m.t==='choice_confirmed'){$('infoInstruction').textContent=m.msg||'Scelta confermata.';$('status').textContent='Scelta registrata.'}else if(m.t==='mini_confirmed'){$('infoInstruction').textContent=m.msg||'Risposta della mini sfida registrata.';$('status').textContent='Risposta bloccata.'}else if(m.t==='mini_closed'){$('infoInstruction').textContent='Mini sfida conclusa. Attendi il risultato sul Master.'}else if(m.t==='personal_timeout'){$('estimate').disabled=true;$('sendBtn').disabled=true;$('status').textContent=m.msg||'Tempo personale scaduto: la lavagnetta è bloccata.'}else if(m.t==='room_closed'){padToken='';clearSaved();currentCode='';setRoom();showScreen('joinScreen');$('status').textContent=m.msg||'La partita è terminata.'}else if(m.t==='replaced'){showScreen('joinScreen');$('status').textContent=m.msg||'Sessione aperta altrove.'}else if(m.t==='err'){if(m.reset){padToken='';clearSaved();showScreen('joinScreen')} $('status').textContent='⚠️ '+m.msg}};socket.onerror=()=>{try{socket.close()}catch{}};socket.onclose=()=>{clearTimeout(openTimer);if(ws===socket)ws=null;connection(false,'Connessione interrotta');scheduleReconnect()}}
function join(){const code=$('code').value.trim().toUpperCase(),name=$('name').value.trim();if(code.length!==4||!name){$('status').textContent='Inserisci un codice di quattro lettere e il tuo nome.';return}closeSocket();currentCode=code;currentName=name;padToken='';clearSaved();setRoom();setTimeout(()=>connect('join'),100)}
function rename(){const name=$('renameName').value.trim();if(!name)return $('status').textContent='Inserisci il nuovo nickname.';if(!ws||ws.readyState!==WebSocket.OPEN)return $('status').textContent='Riconnessione in corso…';ws.send(JSON.stringify({t:'rename_pad',name}))}
function submit(){if(!ws||ws.readyState!==WebSocket.OPEN||sent)return;const value=$('estimate').value.trim();if(!value){$('status').textContent='Inserisci prima una stima.';return}ws.send(JSON.stringify({t:'est',value}))}
$('joinBtn').addEventListener('click',join);$('renameBtn').addEventListener('click',rename);$('sendBtn').addEventListener('click',submit);$('estimate').addEventListener('keydown',e=>{if(e.key==='Enter')submit()});$('code').addEventListener('input',()=>$('code').value=$('code').value.toUpperCase());$('toggleMap').addEventListener('click',()=>{mapExpanded=!mapExpanded;renderMap()});$('changeBtn').addEventListener('click',()=>{try{ws&&ws.send(JSON.stringify({t:'leave_pad'}))}catch{}closeSocket();currentCode='';padToken='';clearSaved();setRoom();showScreen('joinScreen');$('status').textContent='Inserisci il codice della nuova stanza.'});
function resumeIfNeeded(){if(padToken&&(!ws||ws.readyState>1)){retryMs=500;connect('resume')}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')resumeIfNeeded()});window.addEventListener('online',resumeIfNeeded);window.addEventListener('focus',resumeIfNeeded);window.addEventListener('pageshow',()=>{const saved=getSaved();if(queryCode&&saved&&saved.code!==queryCode){clearSaved();$('code').value=queryCode;$('name').value=saved.name||'';return}if(saved&&saved.code&&saved.name&&saved.token){currentCode=saved.code;currentName=saved.name;padToken=saved.token;$('code').value=currentCode;$('name').value=currentName;setRoom();connect('resume')}});
</script></body></html>`;

const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
function serveFile(res,name){fs.readFile(path.join(__dirname,name),(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Pagina non trovata')}res.writeHead(200,{'Content-Type':MIME[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store, no-cache, must-revalidate'});res.end(data)})}
const server = http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/lavagnetta'||pathname==='/lavagnetta/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'});return res.end(PAD)}
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({ok:true,version:'2.9.0',rooms:rooms.size}))}
  if(pathname==='/'||pathname==='/gioco'||pathname==='/gioco/'||pathname==='/game.html') return serveFile(res,'game.html');
  const routes={'/index.html':'index.html','/app.js':'app.js','/styles.css':'styles.css'};
  if(routes[pathname]) return serveFile(res,routes[pathname]);
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Pagina non trovata');
});
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
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
        seconds: 25,
        question: null,
        lastView: null,
        lastResult: null,
        lastMap: null,
        estimates: new Map(),
        masterEvents: new Map(),
        activeChoice: null,
        activeMini: null,
        deleteTimer: null
      };
      rooms.set(code, room);
      ws._room = code;
      ws._role = 'master';
      send(ws, { t: 'room', code, token: room.masterToken, n: 0, players: [] });
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
      send(ws, {
        t: 'resumed_master',
        code,
        n: livePads(room).length,
        players: playerList(room),
        round: room.round,
        locked: room.locked,
        estimates: [...room.estimates.values()],
        masterEvents: [...room.masterEvents.values()]
      });
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

      if (room.round > 0) {
        return send(ws, {
          t: 'err',
          msg: 'La partita è già iniziata. Puoi rientrare soltanto dalla lavagnetta usata nella lobby.'
        });
      }

      const name = String(m.name || '').trim().slice(0, 18);
      if (!name) return send(ws, { t: 'err', msg: 'Inserisci il nome.' });

      const duplicate = [...room.pads.values()].find(
        p => p.name.toLocaleLowerCase('it-IT') === name.toLocaleLowerCase('it-IT')
      );
      if (duplicate) {
        return send(ws, {
          t: 'err',
          msg: 'Questo nickname è già in uso nella stanza. Scegline un altro.'
        });
      }

      const pad = {
        token: makeToken(),
        name,
        socket: null,
        answeredRound: -1,
        personalDeadline: 0,
        personalSeconds: 25
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

    if (m.t === 'master_event_ack' && ws._role === 'master') {
      room.masterEvents.delete(String(m.eventId || ''));
      return;
    }

    if (m.t === 'leave_pad' && ws._role === 'pad') {
      if (room.activeChoice?.chooserToken === ws._padToken) {
        choiceFallback(room, room.activeChoice);
      }
      room.pads.delete(ws._padToken);
      notifyMaster(room);
      try { ws.close(); } catch {}
      return;
    }

    if (m.t === 'rename_pad' && ws._role === 'pad') {
      const pad = room.pads.get(ws._padToken);
      if (!pad) return;
      if (room.round > 0) return send(ws, { t: 'err', msg: 'Il nickname non può essere modificato dopo l’inizio.' });
      const name = String(m.name || '').trim().slice(0, 18);
      if (!name) return send(ws, { t: 'err', msg: 'Inserisci il nuovo nickname.' });
      const duplicate = [...room.pads.values()].find(p => p !== pad && normalizeName(p.name) === normalizeName(name));
      if (duplicate) return send(ws, { t: 'err', msg: 'Questo nickname è già in uso nella stanza.' });
      pad.name = name;
      notifyMaster(room);
      send(ws, { t: 'nickname_updated', name });
      return;
    }

    if (m.t === 'q' && ws._role === 'master') {
      room.round += 1;
      room.locked = false;
      room.seconds = Number(m.seconds) || 25;
      room.deadline = Date.now() + room.seconds * 1000;
      room.estimates.clear();
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
        pad.personalSeconds = personalSeconds;

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


    if (m.t === 'choice_request' && ws._role === 'master') {
      const chooser = normalizeName(m.chooser);
      const chooserToken = String(m.chooserToken || '');
      const pad = chooserToken
        ? room.pads.get(chooserToken)
        : [...room.pads.values()].find(p => normalizeName(p.name) === chooser);
      if (!pad) {
        return send(room.masterSocket, {
          t: 'choice_error',
          requestId: m.requestId,
          msg: 'Il giocatore richiesto non appartiene alla stanza.'
        });
      }
      const requestId = String(m.requestId || '');
      const options = Array.isArray(m.options) ? m.options.slice(0, 20) : [];
      if (!requestId || !options.length) return send(room.masterSocket, { t: 'choice_error', requestId, msg: 'Richiesta di scelta non valida.' });
      const payload = {
        t: 'choice_request',
        requestId,
        title: m.title || 'Fai la tua scelta',
        subject: m.subject || '',
        description: m.description || '',
        options
      };
      room.activeChoice = {
        requestId,
        chooserToken: pad.token,
        optionIds: new Set(options.map(option => String(option.id))),
        resolved: false,
        fallbackSent: false,
        payload
      };
      if (!pad.socket || pad.socket.readyState !== WebSocket.OPEN) {
        return choiceFallback(room, room.activeChoice);
      }
      send(pad.socket, payload);
      return;
    }

    if (m.t === 'mini_request' && ws._role === 'master') {
      if(room.activeMini?.readyTimer)clearTimeout(room.activeMini.readyTimer);
      const requestId = String(m.requestId || '');
      const playerTokens = [...new Set((Array.isArray(m.playerTokens) ? m.playerTokens : []).map(String))]
        .filter(token => room.pads.has(token))
        .slice(0, 8);
      const fields = (Array.isArray(m.fields) ? m.fields : []).slice(0, 4).map(field => ({
        id: String(field.id || '').slice(0, 30),
        label: String(field.label || 'Risposta').slice(0, 80),
        placeholder: String(field.placeholder || '').slice(0, 80),
        type: field.type === 'choice' ? 'choice' : field.type === 'order' ? 'order' : 'number',
        options: (Array.isArray(field.options) ? field.options : []).slice(0, 10).map(option => ({id:String(option.id || '').slice(0,30),label:String(option.label || '').slice(0,80)})),
        items: (Array.isArray(field.items) ? field.items : []).slice(0, 8).map(item => ({id:String(item.id || '').slice(0,30),label:String(item.label || '').slice(0,100)})).filter(item=>item.id)
      })).filter(field => field.id && (field.type !== 'choice' || field.options.length >= 2) && (field.type !== 'order' || (field.items.length >= 2 && new Set(field.items.map(item=>item.id)).size===field.items.length)));
      if (!requestId || !playerTokens.length || !fields.length) return send(ws, {t:'mini_error',requestId,msg:'Richiesta della mini sfida non valida.'});
      const seconds=Math.max(0,Math.min(120,Number(m.seconds)||0));
      const payload = {t:'mini_request',requestId,title:String(m.title||'Mini sfida').slice(0,100),subject:String(m.subject||'').slice(0,140),description:String(m.description||'').slice(0,300),icon:String(m.icon||'⚡').slice(0,8),fields,deadline:seconds?Date.now()+seconds*1000:0};
      room.activeMini = {requestId,playerTokens:new Set(playerTokens),fields,responses:new Map(),readyTokens:new Set(),unavailableSent:new Set(),payload,readyTimer:null};
      for (const token of playerTokens) {
        const pad=room.pads.get(token);
        if (pad.socket?.readyState === WebSocket.OPEN) send(pad.socket,payload);
        else {
          room.activeMini.unavailableSent.add(token);
          queueMasterEvent(room,{t:'mini_unavailable',requestId,playerId:token,name:pad.name,msg:`La lavagnetta di ${pad.name} non è collegata.`});
        }
      }
      const active=room.activeMini;
      active.readyTimer=setTimeout(()=>{
        if(room.activeMini!==active)return;
        for(const token of active.playerTokens){
          if(active.readyTokens.has(token)||active.responses.has(token)||active.unavailableSent.has(token))continue;
          const pad=room.pads.get(token);active.unavailableSent.add(token);
          send(pad?.socket,{t:'mini_closed',requestId:active.requestId,msg:'La lavagnetta non ha confermato l’apertura: il controllo passa al Master.'});
          send(pad?.socket,{t:'view',kind:'info',icon:'⚠️',title:'Controllo trasferito',subject:active.payload.title,effectTitle:'La risposta verrà inserita dal Master',description:'Questa lavagnetta non ha confermato in tempo l’apertura dei comandi.',instruction:'Continua a seguire la sfida in modalità spettatore.'});
          queueMasterEvent(room,{t:'mini_unavailable',requestId:active.requestId,playerId:token,name:pad?.name||'Giocatore',reason:'not_ready',msg:`La lavagnetta di ${pad?.name||'un giocatore'} non ha confermato l’apertura: usa il fallback sul Master.`});
        }
      },6000);
      return;
    }

    if (m.t === 'mini_cancel' && ws._role === 'master') {
      const active=room.activeMini;
      if(active&&active.requestId===String(m.requestId||'')){
        if(active.readyTimer)clearTimeout(active.readyTimer);
        for(const token of active.playerTokens)send(room.pads.get(token)?.socket,{t:'mini_closed',requestId:active.requestId});
        room.activeMini=null;
      }
      return;
    }

    if (m.t === 'cancel_choice' && ws._role === 'master') {
      const choice = room.activeChoice;
      if (choice && choice.requestId === String(m.requestId || '')) {
        choice.resolved = true;
        room.activeChoice = null;
      }
      send(ws, { t: 'choice_cancelled', requestId: String(m.requestId || '') });
      return;
    }

    if (m.t === 'choice_ready' && ws._role === 'pad') {
      const choice = room.activeChoice;
      if (choice && !choice.resolved && choice.requestId === String(m.requestId || '') && choice.chooserToken === ws._padToken) {
        send(room.masterSocket, { t: 'choice_ready', requestId: choice.requestId });
      }
      return;
    }

    if (m.t === 'mini_ready' && ws._role === 'pad') {
      const active=room.activeMini,requestId=String(m.requestId||'');
      if(active&&active.requestId===requestId&&active.playerTokens.has(ws._padToken)&&!active.unavailableSent.has(ws._padToken)){
        active.readyTokens.add(ws._padToken);
        const pad=room.pads.get(ws._padToken);
        send(room.masterSocket,{t:'mini_ready',requestId,playerId:ws._padToken,name:pad?.name||'Giocatore'});
        if([...active.playerTokens].every(token=>active.readyTokens.has(token)||active.responses.has(token)||active.unavailableSent.has(token))&&active.readyTimer){clearTimeout(active.readyTimer);active.readyTimer=null;}
      }
      return;
    }

    if (m.t === 'client_pong') return;

    if (m.t === 'choice_response' && ws._role === 'pad') {
      const pad = room.pads.get(ws._padToken);
      const choice = room.activeChoice;
      const optionId = String(m.optionId ?? '');
      if (!pad || !choice || choice.resolved || choice.requestId !== String(m.requestId || '') || choice.chooserToken !== pad.token || !choice.optionIds.has(optionId)) {
        return send(ws, { t: 'err', msg: 'Questa scelta non è valida o è già stata registrata.' });
      }
      choice.resolved = true;
      queueMasterEvent(room, {
        t: 'choice_response',
        requestId: choice.requestId,
        optionId,
        chooser: pad.name
      });
      send(ws, {
        t: 'choice_confirmed',
        requestId: m.requestId,
        msg: 'Scelta inviata al gioco.'
      });
      room.activeChoice = null;
      return;
    }

    if (m.t === 'mini_response' && ws._role === 'pad') {
      const pad=room.pads.get(ws._padToken),active=room.activeMini,requestId=String(m.requestId||'');
      if(!pad||!active||active.requestId!==requestId||!active.playerTokens.has(pad.token)||active.responses.has(pad.token)||active.unavailableSent.has(pad.token))return send(ws,{t:'err',msg:'Questa risposta della mini sfida non è valida, è già stata registrata oppure il controllo è passato al Master.'});
      const incoming=m.values&&typeof m.values==='object'?m.values:{},values={};
      for(const field of active.fields){
        const value=String(incoming[field.id]??'').trim();
        if(field.type==='number'){
          if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value))return send(ws,{t:'err',msg:`Inserisci un numero valido per ${field.label}.`});
        }else if(field.type==='choice'){
          if(!field.options.some(option=>option.id===value))return send(ws,{t:'err',msg:`Seleziona una risposta valida per ${field.label}.`});
        }else{
          const order=value.split('|'),ids=field.items.map(item=>item.id);
          if(order.length!==ids.length||new Set(order).size!==ids.length||order.some(id=>!ids.includes(id)))return send(ws,{t:'err',msg:`L’ordine inviato per ${field.label} non è valido.`});
        }
        values[field.id]=value;
      }
      active.responses.set(pad.token,values);
      if([...active.playerTokens].every(token=>active.readyTokens.has(token)||active.responses.has(token)||active.unavailableSent.has(token))&&active.readyTimer){clearTimeout(active.readyTimer);active.readyTimer=null;}
      queueMasterEvent(room,{t:'mini_response',requestId,playerId:pad.token,name:pad.name,values});
      send(ws,{t:'mini_confirmed',requestId,msg:'Risposta della mini sfida registrata e bloccata.'});
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
      const estimate = {
        t: 'est',
        playerId: pad.token,
        name: pad.name,
        value: m.value,
        round: room.round
      };
      room.estimates.set(pad.token, estimate);
      send(ws, { t: 'accepted' });
      send(room.masterSocket, estimate);
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
      const wasCurrentSocket=!!pad&&pad.socket===ws;
      if (wasCurrentSocket) {
        pad.socket = null;
        if (room.activeChoice?.chooserToken === ws._padToken) {
          choiceFallback(room, room.activeChoice);
        }
        const activeMini=room.activeMini;
        if(activeMini?.playerTokens.has(ws._padToken)&&!activeMini.responses.has(ws._padToken)&&!activeMini.unavailableSent.has(ws._padToken)){
          activeMini.unavailableSent.add(ws._padToken);
          queueMasterEvent(room,{t:'mini_unavailable',requestId:activeMini.requestId,playerId:ws._padToken,name:pad?.name||'Giocatore',msg:'La lavagnetta dello sfidante si è disconnessa.'});
        }
      }
      notifyMaster(room);
    }
  });
});

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      try { ws.terminate(); } catch {}
      continue;
    }
    ws.isAlive = false;
    try {
      ws.ping();
      send(ws, { t: 'server_ping' });
    } catch {}
  }
}, 25000);
heartbeat.unref();

server.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`A OCCHIO! attivo sulla porta ${PORT}`);
  console.log('Gioco: /  |  Lavagnetta: /lavagnetta');
});
