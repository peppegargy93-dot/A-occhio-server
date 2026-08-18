'use strict';
const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { spawn } = require('node:child_process');
const { WebSocket } = require('ws');

const port = 34000 + Math.floor(Math.random() * 1000);
let server;

function open() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}
function send(ws, payload) { ws.send(JSON.stringify(payload)); }
function next(ws, type, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error(`Timeout: ${type}`)); }, timeout);
    const listener = data => {
      const message = JSON.parse(data.toString());
      if (message.t !== type) return;
      cleanup(); resolve(message);
    };
    function cleanup() { clearTimeout(timer); ws.off('message', listener); }
    ws.on('message', listener);
  });
}
async function command(ws, payload, type) { const pending = next(ws, type); send(ws, payload); return pending; }

before(async () => {
  server = spawn(process.execPath, ['server.js'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port) } });
  await new Promise((resolve, reject) => {
    server.stdout.on('data', data => { if (data.toString().includes('attivo')) resolve(); });
    server.once('exit', code => reject(new Error(`Server terminato: ${code}`)));
  });
});
after(() => server?.kill());

test('flusso WebSocket con tre giocatori, scelta autorevole e riconnessione', async () => {
  const master = await open();
  const room = await command(master, { t: 'create' }, 'room');
  const pads = [];
  for (const name of ['Anna', 'Bruno', 'Carla']) {
    const ws = await open();
    const joined = await command(ws, { t: 'join', code: room.code, name }, 'ok');
    pads.push({ ws, ...joined, name });
  }

  const duplicate = await open();
  const duplicateError = await command(duplicate, { t: 'join', code: room.code, name: 'anna' }, 'err');
  assert.match(duplicateError.msg, /già in uso/);
  duplicate.close();

  const renamed = await command(pads[1].ws, { t: 'rename_pad', name: 'Berto' }, 'nickname_updated');
  assert.equal(renamed.name, 'Berto');

  const questions = pads.map(pad => next(pad.ws, 'q'));
  send(master, { t: 'q', seconds: 2, text: 'Quanto?', cat: 'Test', unit: 'unità', playerLimits: { berto: 1 } });
  const q = await Promise.all(questions);
  assert.equal(q[1].seconds, 1);
  assert.equal(q[0].seconds, 2);

  const estimate = next(master, 'est');
  await command(pads[0].ws, { t: 'est', value: '42' }, 'accepted');
  assert.equal((await estimate).value, '42');
  assert.equal((await command(pads[0].ws, { t: 'est', value: '43' }, 'duplicate')).t, 'duplicate');

  const views = pads.map(pad => next(pad.ws, 'view'));
  send(master, { t: 'view', kind: 'result', answer: '42', funFact: 'Curiosità specifica', scores: [] });
  assert.ok((await Promise.all(views)).every(view => view.funFact === 'Curiosità specifica'));

  const request = next(pads[0].ws, 'choice_request');
  send(master, { t: 'choice_request', requestId: 'bonus-1', chooser: 'Anna', title: 'Scegli il BONUS', options: [{ id: 'scudo', label: 'BONUS · Scudo' }] });
  await request;
  const forged = await command(pads[2].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'err');
  assert.match(forged.msg, /non è valida/);
  const response = next(master, 'choice_response');
  await command(pads[0].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'choice_confirmed');
  assert.equal((await response).optionId, 'scudo');
  assert.match((await command(pads[0].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'err')).msg, /già stata/);

  const request2 = next(pads[2].ws, 'choice_request');
  send(master, { t: 'choice_request', requestId: 'malus-1', chooser: 'Carla', title: 'Scegli il MALUS', options: [{ id: 'berto', label: 'Berto' }] });
  await request2;
  const fallback = next(master, 'choice_unavailable');
  pads[2].ws.close();
  assert.equal((await fallback).reason, 'disconnected');

  const resumedSocket = await open();
  const resumed = await command(resumedSocket, { t: 'resume_pad', code: room.code, token: pads[2].token }, 'resumed_pad');
  assert.equal(resumed.code, room.code);

  const mapViews = [pads[0].ws, pads[1].ws, resumedSocket].map(ws => next(ws, 'view'));
  send(master, { t: 'view', kind: 'map', scores: [{ name: 'Anna', score: 3, pos: 3 }], map: { finish: 30, players: [{ name: 'Anna', pos: 3 }], cells: [] } });
  assert.ok((await Promise.all(mapViews)).every(view => view.map.players[0].pos === 3));

  master.close(); pads[0].ws.close(); pads[1].ws.close(); resumedSocket.close();
});
