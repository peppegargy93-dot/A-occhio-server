'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const ROUND_SECONDS = 20;
const rooms = new Map();

function roomCode() {
  const alphabet = 'ABCDEFGHKMNPRSTUVZ';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcast(room, payload) {
  send(room.masterSocket, payload);
  for (const player of room.players.values()) send(player.socket, payload);
}

function publicPlayers(room) {
  return [...room.players.values()].map(p => ({
    id: p.id,
    name: p.name,
    isMaster: p.isMaster,
    connected: p.socket.readyState === WebSocket.OPEN
  }));
}

function notifyLobby(room) {
  broadcast(room, {
    t: 'lobby',
    code: room.code,
    players: publicPlayers(room),
    expectedAnswers: room.players.size
  });
}

function safeNumber(raw) {
  const normalized = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function closeRound(room, reason) {
  const round = room.round;
  if (!round || round.status !== 'active') return;

  round.status = 'completed';
  if (round.timer) clearTimeout(round.timer);

  const answers = [...room.players.values()].map(player => {
    const answer = round.answers.get(player.id);
    return {
      playerId: player.id,
      name: player.name,
      isMaster: player.isMaster,
      value: answer ? answer.value : null,
      submittedAt: answer ? answer.submittedAt : null,
      missing: !answer
    };
  });

  broadcast(room, {
    t: 'round_completed',
    reason,
    roundId: round.id,
    question: round.question,
    mode: round.mode,
    answers
  });
}

function startRound(room, message) {
  if (room.round?.status === 'active') {
    return send(room.masterSocket, { t: 'err', msg: 'C’è già un round attivo.' });
  }

  const question = String(message.question || '').trim();
  if (!question) return send(room.masterSocket, { t: 'err', msg: 'Inserisci una domanda.' });

  const mode = message.mode === 'voice' ? 'voice' : 'secret';
  const roundId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const deadline = Date.now() + ROUND_SECONDS * 1000;

  room.round = {
    id: roundId,
    status: 'active',
    question,
    mode,
    answers: new Map(),
    deadline,
    timer: setTimeout(() => closeRound(room, 'timeout'), ROUND_SECONDS * 1000 + 100)
  };

  broadcast(room, {
    t: 'round_started',
    roundId,
    question,
    mode,
    duration: ROUND_SECONDS,
    deadline,
    expectedAnswers: room.players.size
  });
}

function submitEstimate(room, ws, message) {
  const round = room.round;
  const player = room.players.get(ws.playerId);

  if (!round || round.status !== 'active') return send(ws, { t: 'err', msg: 'Il round non è attivo.' });
  if (!player) return send(ws, { t: 'err', msg: 'Giocatore non riconosciuto.' });
  if (Date.now() > round.deadline) {
    closeRound(room, 'timeout');
    return send(ws, { t: 'err', msg: 'Tempo scaduto.' });
  }
  if (round.answers.has(player.id)) return send(ws, { t: 'err', msg: 'Risposta già inviata e bloccata.' });

  const value = safeNumber(message.value);
  if (value === null) return send(ws, { t: 'err', msg: 'Inserisci una stima numerica valida.' });

  round.answers.set(player.id, {
    value,
    submittedAt: Date.now()
  });

  send(ws, { t: 'estimate_locked', roundId: round.id });

  // Nessun valore viene mai inviato prima della fine del round.
  broadcast(room, {
    t: 'answer_progress',
    received: round.answers.size,
    expected: room.players.size
  });

  if (round.answers.size >= room.players.size) closeRound(room, 'all_answered');
}

function serveStatic(req, res) {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const filePath = urlPath === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, urlPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Pagina non trovata');
    }
    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', raw => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return send(ws, { t: 'err', msg: 'Messaggio non valido.' });
    }

    if (message.t === 'create_room') {
      const masterName = String(message.name || 'Master').trim() || 'Master';
      const code = roomCode();
      const masterId = `p-${Math.random().toString(36).slice(2, 10)}`;
      const room = {
        code,
        masterSocket: ws,
        players: new Map(),
        round: null
      };
      ws.roomCode = code;
      ws.playerId = masterId;
      ws.isMaster = true;
      room.players.set(masterId, { id: masterId, name: masterName, isMaster: true, socket: ws });
      rooms.set(code, room);
      send(ws, { t: 'room_created', code, playerId: masterId, isMaster: true });
      notifyLobby(room);
      return;
    }

    if (message.t === 'join_room') {
      const code = String(message.code || '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) return send(ws, { t: 'err', msg: 'Stanza non trovata.' });
      if (room.round?.status === 'active') return send(ws, { t: 'err', msg: 'Partita già in corso.' });

      const playerId = `p-${Math.random().toString(36).slice(2, 10)}`;
      const name = String(message.name || 'Giocatore').trim() || 'Giocatore';
      ws.roomCode = code;
      ws.playerId = playerId;
      ws.isMaster = false;
      room.players.set(playerId, { id: playerId, name, isMaster: false, socket: ws });
      send(ws, { t: 'room_joined', code, playerId, isMaster: false });
      notifyLobby(room);
      return;
    }

    const room = rooms.get(ws.roomCode);
    if (!room) return send(ws, { t: 'err', msg: 'Stanza non disponibile.' });

    if (message.t === 'start_round') {
      if (!ws.isMaster) return send(ws, { t: 'err', msg: 'Solo il master può avviare il round.' });
      return startRound(room, message);
    }

    if (message.t === 'estimate') {
      return submitEstimate(room, ws, message);
    }

    if (message.t === 'return_lobby') {
      if (!ws.isMaster) return;
      room.round = null;
      broadcast(room, { t: 'returned_lobby' });
      notifyLobby(room);
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws.roomCode);
    if (!room) return;

    if (ws.isMaster) {
      broadcast(room, { t: 'room_closed', msg: 'Il master ha chiuso la stanza.' });
      if (room.round?.timer) clearTimeout(room.round.timer);
      rooms.delete(room.code);
      return;
    }

    room.players.delete(ws.playerId);

    // Se un giocatore esce durante il round, il totale atteso si aggiorna.
    if (room.round?.status === 'active' && room.round.answers.size >= room.players.size) {
      closeRound(room, 'all_answered');
    } else {
      notifyLobby(room);
    }
  });
});

server.listen(PORT, () => {
  console.log(`A OCCHIO! attivo sulla porta ${PORT}`);
});
