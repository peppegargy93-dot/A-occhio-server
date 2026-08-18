const $ = id => document.getElementById(id);
const state = { ws:null, isMaster:false, code:null, submitted:false, timer:null, deadline:0 };

const BOARD = [
  '❓','⭐','⛔','⏱️','❓','⚔️','🎰','❓','🔭','🎯',
  '⛔','❓','🤝','🎲','🔥','❓','⭐',
  '📢 INFAMATA',
  '❓','👑','⏱️','🎰','⚔️','❓','🔭','🗡️','❓','🎲','⛔','🏆'
];

function show(id){
  ['home','lobby','round','results'].forEach(x => $(x).classList.toggle('hidden', x !== id));
  $('board').classList.toggle('hidden', id === 'home');
}

function connect(onOpen){
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  state.ws = new WebSocket(`${proto}//${location.host}`);
  state.ws.addEventListener('open', onOpen);
  state.ws.addEventListener('message', event => handle(JSON.parse(event.data)));
  state.ws.addEventListener('close', () => {
    $('homeStatus').textContent = 'Connessione chiusa. Ricarica la pagina per rientrare.';
  });
}

function handle(m){
  if(m.t === 'err'){
    const target = $('round').classList.contains('hidden') ? $('homeStatus') : $('roundStatus');
    target.textContent = `⚠️ ${m.msg}`;
  }
  if(m.t === 'room_created' || m.t === 'room_joined'){
    state.code = m.code;
    state.isMaster = m.isMaster;
    $('roomCode').textContent = m.code;
    $('masterControls').classList.toggle('hidden', !state.isMaster);
    $('lobbyHint').textContent = state.isMaster ? 'Tu sei il Master e partecipi alle stime come tutti gli altri.' : 'Attendi che il Master avvii il round.';
    show('lobby');
  }
  if(m.t === 'lobby'){
    $('players').innerHTML = m.players.map(p =>
      `<div class="player"><span>${escapeHtml(p.name)}</span><span class="${p.isMaster?'master':''}">${p.isMaster?'(Master)':''}</span></div>`
    ).join('');
  }
  if(m.t === 'round_started'){
    state.submitted = false;
    state.deadline = m.deadline;
    $('roundQuestion').textContent = m.question;
    $('roundMode').textContent = m.mode === 'voice' ? '📢 Infamata a voce' : '🤫 Stima segreta';
    $('voiceNotice').classList.toggle('hidden', m.mode !== 'voice');
    $('estimate').disabled = false;
    $('submit').disabled = false;
    $('estimate').value = '';
    $('roundStatus').textContent = '';
    $('progress').textContent = `0 risposte su ${m.expectedAnswers}`;
    startClock();
    show('round');
  }
  if(m.t === 'estimate_locked'){
    state.submitted = true;
    $('estimate').disabled = true;
    $('submit').disabled = true;
    $('roundStatus').textContent = '✅ Risposta inviata e bloccata. Non può essere modificata.';
  }
  if(m.t === 'answer_progress'){
    $('progress').textContent = `${m.received} risposte su ${m.expected}`;
  }
  if(m.t === 'round_completed'){
    clearInterval(state.timer);
    $('answerList').innerHTML = m.answers.map(a =>
      `<div class="answer ${a.missing?'missing':''}">
        <span>${escapeHtml(a.name)} ${a.isMaster?'<b>(Master)</b>':''}</span>
        <span class="value">${a.missing?'Nessuna risposta':formatNumber(a.value)}</span>
      </div>`
    ).join('');
    $('closeReason').textContent = m.reason === 'all_answered'
      ? 'Il sistema ha chiuso automaticamente il timer perché sono arrivate tutte le risposte.'
      : 'I 20 secondi sono terminati: le risposte mancanti sono state bloccate.';
    $('next').classList.toggle('hidden', !state.isMaster);
    show('results');
  }
  if(m.t === 'returned_lobby') show('lobby');
  if(m.t === 'room_closed') alert(m.msg);
}

function startClock(){
  clearInterval(state.timer);
  const render = () => {
    const left = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    $('seconds').textContent = left;
  };
  render();
  state.timer = setInterval(render, 200);
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function formatNumber(value){ return new Intl.NumberFormat('it-IT').format(value); }

$('create').addEventListener('click', () => {
  const name = $('name').value.trim();
  if(!name) return $('homeStatus').textContent = 'Inserisci il nome del Master.';
  connect(() => state.ws.send(JSON.stringify({ t:'create_room', name })));
});
$('join').addEventListener('click', () => {
  const name = $('name').value.trim();
  const code = $('code').value.trim().toUpperCase();
  if(!name || code.length !== 4) return $('homeStatus').textContent = 'Inserisci nome e codice stanza di 4 lettere.';
  connect(() => state.ws.send(JSON.stringify({ t:'join_room', name, code })));
});
$('start').addEventListener('click', () => {
  const question = $('question').value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  if(!question) return $('lobbyHint').textContent = 'Scrivi prima la domanda.';
  state.ws.send(JSON.stringify({ t:'start_round', question, mode }));
});
$('submit').addEventListener('click', () => {
  if(state.submitted) return;
  state.ws.send(JSON.stringify({ t:'estimate', value:$('estimate').value }));
});
$('estimate').addEventListener('keydown', e => {
  if(e.key === 'Enter') $('submit').click();
});
$('next').addEventListener('click', () => {
  state.ws.send(JSON.stringify({ t:'return_lobby' }));
});

$('boardGrid').innerHTML = BOARD.map((cell, i) =>
  `<div class="cell ${i===17?'voice':''}"><span>${i+1}</span><span>${cell}</span></div>`
).join('');
