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
function next(ws, type, timeout = 2500, label = type) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error(`Timeout: ${label}`)); }, timeout);
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
  server = spawn(process.execPath, ['server.js'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' } });
  await new Promise((resolve, reject) => {
    server.stdout.on('data', data => { if (data.toString().includes('attivo')) resolve(); });
    server.once('exit', code => reject(new Error(`Server terminato: ${code}`)));
  });
});
after(() => server?.kill());

test('la pagina lavagnetta preserva la regex degli spazi e non cancella le lettere s',async()=>{
  const response=await fetch(`http://127.0.0.1:${port}/lavagnetta`);
  const padHtml=await response.text();
  assert.equal(response.status,200);
  assert.match(padHtml,/replace\(\/\\s\+\/g/);
  assert.doesNotMatch(padHtml,/replace\(\/s\+\/g/);
});

test('flusso WebSocket con tre giocatori, scelta autorevole e riconnessione', async () => {
  let master = await open();
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
  send(master, { t: 'q', seconds: 8, text: 'Quanto?', cat: 'Test', unit: 'unità', playerLimits: { berto: 5 } });
  const q = await Promise.all(questions);
  assert.equal(q[1].seconds, 5);
  assert.equal(q[0].seconds, 8);

  pads[1].ws.close();
  const resumedBerto = await open();
  const bertoState = await command(resumedBerto, { t: 'resume_pad', code: room.code, token: pads[1].token }, 'resumed_pad');
  assert.equal(bertoState.state.question.seconds, 5);
  assert.equal(bertoState.state.question.limited, true);
  assert.equal(bertoState.state.deadline, q[1].deadline);
  pads[1].ws = resumedBerto;

  const estimate = next(master, 'est');
  await command(pads[0].ws, { t: 'est', value: '42' }, 'accepted');
  const annaEstimate=await estimate;
  assert.equal(annaEstimate.value, '42');
  assert.equal(annaEstimate.playerId, pads[0].token);
  assert.equal((await command(pads[0].ws, { t: 'est', value: '43' }, 'duplicate')).t, 'duplicate');

  await new Promise(resolve=>{master.once('close',resolve);master.close()});
  await command(pads[1].ws, { t: 'est', value: '41' }, 'accepted');
  master=await open();
  const masterState=await command(master,{t:'resume_master',code:room.code,token:room.token},'resumed_master');
  assert.deepEqual(masterState.estimates.map(row=>row.name).sort(),['Anna','Berto']);

  const late=await open();
  const lateError=await command(late,{t:'join',code:room.code,name:'Dopo'},'err');
  assert.match(lateError.msg,/già iniziata/);
  late.close();

  const views = pads.map(pad => next(pad.ws, 'view'));
  send(master, { t: 'view', kind: 'result', answer: '42', funFact: 'Curiosità specifica', scores: [] });
  assert.ok((await Promise.all(views)).every(view => view.funFact === 'Curiosità specifica'));

  const challengeViews=pads.map(pad=>next(pad.ws,'view'));
  send(master,{t:'view',kind:'challenge',challenge:{reason:{type:'distance_tie',correctAnswer:'42',players:[{name:'Anna',estimate:'40',formula:'2 = 2'},{name:'Berto',estimate:'44',formula:'2 = 2'}]},game:{name:'Stima Lampo',rules:['Una regola'],duration:'40 secondi',win:'Più vicino'}},scores:[]});
  const receivedChallenges=await Promise.all(challengeViews);
  assert.ok(receivedChallenges.every(view=>view.challenge.game.name==='Stima Lampo'));
  assert.ok(receivedChallenges.every(view=>!view.contextResult),'La sfida non deve mostrare il risultato del round precedente');

  let spectatorMini=false;
  const spectatorListener=data=>{if(JSON.parse(data.toString()).t==='mini_request')spectatorMini=true};
  pads[2].ws.on('message',spectatorListener);
  const miniRequests=[next(pads[0].ws,'mini_request'),next(pads[1].ws,'mini_request')];
  send(master,{t:'mini_request',requestId:'mini-lampo-1',playerTokens:[pads[0].token,pads[1].token],title:'Stima Lampo',subject:'Quanti?',icon:'⚡',fields:[{id:'estimate',label:'La tua stima',type:'number'}]});
  const receivedMini=await Promise.all(miniRequests);
  assert.ok(receivedMini.every(message=>message.title==='Stima Lampo'));
  const annaReady=next(master,'mini_ready');send(pads[0].ws,{t:'mini_ready',requestId:'mini-lampo-1'});assert.equal((await annaReady).playerId,pads[0].token);
  const bertoReady=next(master,'mini_ready');send(pads[1].ws,{t:'mini_ready',requestId:'mini-lampo-1'});assert.equal((await bertoReady).playerId,pads[1].token);
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(spectatorMini,false,'La lavagnetta spettatrice non deve ricevere gli input');
  pads[2].ws.off('message',spectatorListener);
  assert.match((await command(pads[2].ws,{t:'mini_response',requestId:'mini-lampo-1',values:{estimate:'99'}},'err')).msg,/non è valida/);
  assert.match((await command(pads[0].ws,{t:'mini_response',requestId:'mini-lampo-1',values:{estimate:'40abc'}},'err')).msg,/numero valido/);
  const annaMini=next(master,'mini_response');
  await command(pads[0].ws,{t:'mini_response',requestId:'mini-lampo-1',values:{estimate:'40'}},'mini_confirmed');
  const annaMiniMessage=await annaMini;
  assert.equal(annaMiniMessage.values.estimate,'40');
  send(master,{t:'master_event_ack',eventId:annaMiniMessage.eventId});
  const bertoMini=next(master,'mini_response');
  await command(pads[1].ws,{t:'mini_response',requestId:'mini-lampo-1',values:{estimate:'44'}},'mini_confirmed');
  const bertoMiniMessage=await bertoMini;
  assert.equal(bertoMiniMessage.values.estimate,'44');
  send(master,{t:'master_event_ack',eventId:bertoMiniMessage.eventId});
  send(master,{t:'mini_cancel',requestId:'mini-lampo-1'});

  const sequenceStartViews=pads.map(pad=>next(pad.ws,'view'));
  send(master,{t:'view',kind:'info',title:'Timeline Flash',subject:'Cinema',effectTitle:'Anna e Berto stanno giocando',description:'Riordinate quattro eventi.',instruction:'Gli spettatori vedranno le risposte dopo l’invio.'});
  assert.ok((await Promise.all(sequenceStartViews)).every(view=>view.title==='Timeline Flash'));
  let spectatorOrder=false;
  const spectatorOrderListener=data=>{if(JSON.parse(data.toString()).t==='mini_request')spectatorOrder=true};
  pads[2].ws.on('message',spectatorOrderListener);
  const orderRequests=[next(pads[0].ws,'mini_request'),next(pads[1].ws,'mini_request')];
  const orderItems=[{id:'a',label:'Evento A'},{id:'b',label:'Evento B'},{id:'c',label:'Evento C'},{id:'d',label:'Evento D'}];
  send(master,{t:'mini_request',requestId:'mini-timeline-1',playerTokens:[pads[0].token,pads[1].token],title:'Timeline Flash',subject:'Cinema',icon:'🗓️',seconds:20,fields:[{id:'sequence',label:'Ordina',type:'order',items:orderItems}]});
  const receivedOrders=await Promise.all(orderRequests);
  assert.ok(receivedOrders.every(message=>message.fields[0].type==='order'));
  assert.ok(receivedOrders.every(message=>message.deadline>Date.now()));
  const annaOrderReady=next(master,'mini_ready');send(pads[0].ws,{t:'mini_ready',requestId:'mini-timeline-1'});await annaOrderReady;
  const bertoOrderReady=next(master,'mini_ready');send(pads[1].ws,{t:'mini_ready',requestId:'mini-timeline-1'});await bertoOrderReady;
  assert.equal(spectatorOrder,false);
  assert.match((await command(pads[0].ws,{t:'mini_response',requestId:'mini-timeline-1',values:{sequence:'a|a|c|d'}},'err')).msg,/ordine inviato/i);
  const annaOrder=next(master,'mini_response');
  await command(pads[0].ws,{t:'mini_response',requestId:'mini-timeline-1',values:{sequence:'a|b|c|d'}},'mini_confirmed');
  const annaOrderMessage=await annaOrder;
  assert.equal(annaOrderMessage.values.sequence,'a|b|c|d');
  send(master,{t:'master_event_ack',eventId:annaOrderMessage.eventId});
  const bertoOrder=next(master,'mini_response');
  await command(pads[1].ws,{t:'mini_response',requestId:'mini-timeline-1',values:{sequence:'d|c|b|a'}},'mini_confirmed');
  const bertoOrderMessage=await bertoOrder;
  assert.equal(bertoOrderMessage.values.sequence,'d|c|b|a');
  send(master,{t:'master_event_ack',eventId:bertoOrderMessage.eventId});
  send(master,{t:'mini_cancel',requestId:'mini-timeline-1'});
  pads[2].ws.off('message',spectatorOrderListener);
  const sequenceResultViews=pads.map(pad=>next(pad.ws,'view'));
  send(master,{t:'view',kind:'info',title:'Timeline Flash',subject:'Cinema',effectTitle:'Ordine corretto: A → B → C → D',description:'Anna: A → B → C → D | Berto: D → C → B → A',instruction:'Vince Anna'});
  const sequenceResults=await Promise.all(sequenceResultViews);
  assert.ok(sequenceResults.every(view=>view.description.includes('Anna:')));

  const request = next(pads[0].ws, 'choice_request');
  send(master, { t: 'choice_request', requestId: 'bonus-1', chooser: 'Anna', title: 'Scegli il BONUS', options: [{ id: 'scudo', label: 'BONUS · Scudo' }] });
  await request;
  const ready = next(master, 'choice_ready');
  send(pads[0].ws, { t: 'choice_ready', requestId: 'bonus-1' });
  assert.equal((await ready).requestId, 'bonus-1');
  const forged = await command(pads[2].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'err');
  assert.match(forged.msg, /non è valida/);
  const response = next(master, 'choice_response');
  await command(pads[0].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'choice_confirmed');
  const bonusResponse=await response;
  assert.equal(bonusResponse.optionId, 'scudo');
  send(master,{t:'master_event_ack',eventId:bonusResponse.eventId});
  assert.match((await command(pads[0].ws, { t: 'choice_response', requestId: 'bonus-1', optionId: 'scudo' }, 'err')).msg, /già stata/);

  const secondStage=next(pads[0].ws,'choice_request');
  send(master,{t:'choice_request',requestId:'bonus-target',chooser:'Anna',title:'A chi dai il Bonus?',options:[{id:'berta',label:'Berto'}]});
  await secondStage;
  const targetResponse=next(master,'choice_response');
  await command(pads[0].ws,{t:'choice_response',requestId:'bonus-target',optionId:'berta'},'choice_confirmed');
  const targetMessage=await targetResponse;
  assert.equal(targetMessage.optionId,'berta');
  send(master,{t:'master_event_ack',eventId:targetMessage.eventId});

  const replayRequest=next(pads[0].ws,'choice_request');
  send(master,{t:'choice_request',requestId:'bonus-replay',chooserToken:pads[0].token,chooser:'nome non autorevole',title:'Replay',options:[{id:'paracadute',label:'Paracadute'}]});
  await replayRequest;
  await new Promise(resolve=>{master.once('close',resolve);master.close()});
  await command(pads[0].ws,{t:'choice_response',requestId:'bonus-replay',optionId:'paracadute'},'choice_confirmed');
  master=await open();
  const replayedState=await command(master,{t:'resume_master',code:room.code,token:room.token},'resumed_master');
  const replayedChoice=replayedState.masterEvents.find(event=>event.requestId==='bonus-replay');
  assert.equal(replayedChoice.optionId,'paracadute');
  send(master,{t:'master_event_ack',eventId:replayedChoice.eventId});

  const requestCancelled = next(pads[1].ws, 'choice_request');
  send(master, { t: 'choice_request', requestId: 'bonus-cancel', chooser: 'Berto', title: 'Scegli il BONUS', options: [{ id: 'scudo', label: 'BONUS · Scudo' }] });
  await requestCancelled;
  await command(master, { t: 'cancel_choice', requestId: 'bonus-cancel' }, 'choice_cancelled');
  assert.match((await command(pads[1].ws, { t: 'choice_response', requestId: 'bonus-cancel', optionId: 'scudo' }, 'err')).msg, /già stata/);

  const request2 = next(pads[2].ws, 'choice_request');
  send(master, { t: 'choice_request', requestId: 'malus-1', chooser: 'Carla', title: 'Scegli il MALUS', options: [{ id: 'berto', label: 'Berto' }] });
  await request2;
  const fallback = next(master, 'choice_unavailable');
  pads[2].ws.close();
  const fallbackMessage=await fallback;
  assert.equal(fallbackMessage.reason, 'disconnected');
  send(master,{t:'master_event_ack',eventId:fallbackMessage.eventId});

  const resumedSocket = await open();
  const resumed = await command(resumedSocket, { t: 'resume_pad', code: room.code, token: pads[2].token }, 'resumed_pad');
  assert.equal(resumed.code, room.code);

  const recoveredChoice=next(pads[0].ws,'choice_request');
  send(master,{t:'choice_request',requestId:'challenge-start-reconnect',chooserToken:pads[0].token,chooser:'Anna',title:'Avvia la mini sfida',options:[{id:'start',label:'Inizia'}]});
  await recoveredChoice;
  const replacementAnna=await open();
  const recoveredState=await command(replacementAnna,{t:'resume_pad',code:room.code,token:pads[0].token},'resumed_pad');
  assert.equal(recoveredState.state.choiceRequest.requestId,'challenge-start-reconnect');
  const recoveredResponse=next(master,'choice_response',2500,'choice_response dopo riconnessione');
  await command(replacementAnna,{t:'choice_response',requestId:'challenge-start-reconnect',optionId:'start'},'choice_confirmed');
  const recoveredMessage=await recoveredResponse;send(master,{t:'master_event_ack',eventId:recoveredMessage.eventId});pads[0].ws=replacementAnna;

  const controllerStart=next(resumedSocket,'choice_request');
  send(master,{t:'choice_request',requestId:'crono-start',chooserToken:pads[2].token,chooser:'Carla',title:'Regia del Cronometro',options:[{id:'start',label:'Avvia'}]});
  await controllerStart;
  const controllerStartResponse=next(master,'choice_response',2500,'choice_response AVVIA Cronometro');
  await command(resumedSocket,{t:'choice_response',requestId:'crono-start',optionId:'start'},'choice_confirmed');
  const controllerStartMessage=await controllerStartResponse;send(master,{t:'master_event_ack',eventId:controllerStartMessage.eventId});
  const controllerStop=next(resumedSocket,'choice_request');
  send(master,{t:'choice_request',requestId:'crono-stop',chooserToken:pads[2].token,chooser:'Carla',title:'Regia del Cronometro',options:[{id:'stop',label:'Ferma'}]});
  await controllerStop;
  const controllerStopResponse=next(master,'choice_response',2500,'choice_response FERMA Cronometro');
  await command(resumedSocket,{t:'choice_response',requestId:'crono-stop',optionId:'stop'},'choice_confirmed');
  const controllerStopMessage=await controllerStopResponse;send(master,{t:'master_event_ack',eventId:controllerStopMessage.eventId});

  const undeliveredRequest=next(pads[1].ws,'mini_request');
  send(master,{t:'mini_request',requestId:'mini-no-ready',playerTokens:[pads[1].token],title:'Test consegna',fields:[{id:'estimate',label:'Stima',type:'number'}]});
  await undeliveredRequest;
  const undelivered=await next(master,'mini_unavailable',7500);
  assert.equal(undelivered.reason,'not_ready');
  assert.equal(undelivered.playerId,pads[1].token);
  send(master,{t:'master_event_ack',eventId:undelivered.eventId});
  send(master,{t:'mini_cancel',requestId:'mini-no-ready'});

  const mapViews = [pads[0].ws, pads[1].ws, resumedSocket].map(ws => next(ws, 'view'));
  send(master, { t: 'view', kind: 'map', scores: [{ name: 'Anna', score: 3, pos: 3 }], map: { finish: 30, players: [{ name: 'Anna', pos: 3 }], cells: [] },movement:[{name:'Anna',scoreDelta:3,posDelta:3,sources:[{label:'Round 1'}]}] });
  assert.ok((await Promise.all(mapViews)).every(view => view.map.players[0].pos === 3));

  master.close(); pads[0].ws.close(); pads[1].ws.close(); resumedSocket.close();
});
