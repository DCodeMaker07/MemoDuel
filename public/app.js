'use strict';
const $ = (id) => document.getElementById(id);
let ws, myId = null, state = null, lastPhase = null, busy = false, dealing = false;
let previewValues = null, previewing = false, introLabel = '';
let endShown = false, podiumTimer = null;

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === 'hello') myId = m.id;
    else if (m.type === 'state') {
      state = m.state;
      timerEnd = state.timeLeftMs == null ? null : performance.now() + state.timeLeftMs;
      render(); tick();
    }
    else if (m.type === 'preview') previewValues = m.values;
    else if (m.type === 'error') toast(m.error);
  };
  ws.onclose = () => { toast('Conexión perdida. Recarga la página.'); };
}
const send = (o) => ws && ws.readyState === 1 && ws.send(JSON.stringify(o));

function toast(t) {
  const el = $('toast'); el.textContent = t; el.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add('hidden'), 2500);
}
const show = (id, on) => $(id).classList.toggle('hidden', !on);

function render() {
  if (!state) return;
  const me = state.players.find((p) => p.id === myId);
  if (state.phase === 'playing') Music.play(); else Music.stop(); // la música empieza al iniciar la partida
  Music.setStreak(state.phase === 'playing' && me ? me.streak : 0); // y acelera con tu racha
  show('home', false);
  show('lobby', state.phase === 'lobby');
  show('game', state.phase !== 'lobby');
  const isHost = state.hostId === myId;

  if (state.phase === 'lobby') {
    $('roomCode').textContent = state.code;
    $('lobbyPlayers').innerHTML = state.players.map((p) => `<li>${esc(p.name)}${p.id === state.hostId ? ' 👑' : ''}${p.id === myId ? ' (tú)' : ''}</li>`).join('');
    show('hostControls', isHost); show('waitHost', !isHost);
    return;
  }


  $('levelBadge').textContent = `Nivel ${state.levelLabel} · memoriza ${state.previewMs / 1000} s · ${state.turnMs / 1000} s por turno`;
  const mine = state.turn === myId;
  const cur = state.players.find((p) => p.id === state.turn);
  const st = $('status');
  if (state.phase === 'playing') {
    st.textContent = mine ? '¡Tu turno! Voltea una carta' : `Turno de ${cur ? cur.name : '…'} — ¡memoriza!`;
    st.className = 'status' + (mine ? ' mine' : '');
  } else { st.textContent = ''; }

  const board = $('board');
  const newGame = state.phase === 'playing' && lastPhase !== 'playing';
  if (newGame || board.children.length !== state.cards.length) { buildBoard(newGame); prevCards = null; prevScores = null; }
  const wasFinished = lastPhase === 'finished';
  lastPhase = state.phase;
  const newly = [];
  state.cards.forEach((c, i) => {
    const t = board.children[i];
    if (prevCards && prevCards[i] !== 'matched' && c.state === 'matched') newly.push(i);
    const peek = previewing && previewValues;      // vista previa: caras arriba, sin poder jugar
    t.className = `tile s-${peek ? 'up' : c.state}${dealing ? ' deal' : ''}`;
    t.disabled = peek || c.state !== 'hidden';
    const back = t.querySelector('.back');
    if (peek) back.textContent = previewValues[i];
    else if (c.state !== 'hidden') back.textContent = c.value;
    else if (back.textContent) setTimeout(() => { if (t.classList.contains('s-hidden')) back.textContent = ''; }, 500); // tras el volteo
  });
  prevCards = state.cards.map((c) => c.state);
  const scorer = prevScores && state.players.find((p) => p.score > (prevScores[p.id] ?? 0));
  renderRank(scorer);
  prevScores = Object.fromEntries(state.players.map((p) => [p.id, p.score]));
  if (newly.length && scorer) scoreEffects(newly, scorer);
  if (state.phase === 'finished' && !wasFinished && prevScores) finishEffects();
  if (busy && state.phase === 'playing') {
    st.textContent = introLabel;
    st.className = 'status';
  }

  if (state.phase !== 'finished') { endShown = false; clearTimeout(podiumTimer); }
  else if (!wasFinished) { // se deja ver el último acierto y luego sube el podio
    podiumTimer = setTimeout(() => { endShown = true; buildPodium(); render(); }, 1400);
  }
  show('endBox', endShown);
  if (endShown) show('btnAgain', isHost);
}

// ---- Reloj de arena + modo peligro ----
let timerEnd = null, lastShown = 0;

function tick() {
  const box = $('timer');
  if (!state || state.phase !== 'playing' || timerEnd == null) {
    box.classList.add('hidden');
    document.body.classList.remove('danger', 'critical');
    lastShown = 0;
    return;
  }
  const total = state.turnMs;
  const left = Math.min(total, Math.max(0, timerEnd - performance.now())); // en la intro se ve completo
  const secs = Math.ceil(left / 1000);
  const f = left / total;
  box.classList.remove('hidden');
  $('timerNum').textContent = secs;
  $('hgTop').setAttribute('y', 40 - 26 * f);
  $('hgTop').setAttribute('height', 26 * f);
  $('hgBot').setAttribute('y', 74 - 30 * (1 - f));
  $('hgBot').setAttribute('height', 30 * (1 - f));
  $('hgStream').style.display = f > 0 && f < 1 ? '' : 'none';
  box.classList.toggle('warn', secs <= 20 && secs > 10);
  const danger = secs <= 10;
  box.classList.toggle('danger', danger);
  box.classList.toggle('critical', secs <= 5);
  document.body.classList.toggle('danger', danger);
  document.body.classList.toggle('critical', secs <= 5);
  if (secs > lastShown + 1) { // empezó un turno nuevo: el reloj se "voltea"
    box.classList.remove('flip'); void box.offsetWidth; box.classList.add('flip');
  }
  lastShown = secs;
}
setInterval(tick, 100);

// ---- Puntaje en vivo (panel izquierdo) y efectos de punto ----
const COLORS = ['#ffd166', '#06d6a0', '#ef476f', '#4cc9f0'];
const ROW_H = 76;
let prevCards = null, prevScores = null;
const colorOf = (id) => COLORS[Math.max(0, state.players.findIndex((p) => p.id === id)) % COLORS.length];

function renderRank(scorer) {
  const list = $('rankList');
  const players = state.players;
  list.style.height = `${players.length * ROW_H - 8}px`;
  [...list.children].forEach((r) => { if (!players.some((p) => p.id === r.dataset.id)) r.remove(); });
  const sorted = [...players].sort((a, b) => b.score - a.score || players.indexOf(a) - players.indexOf(b));
  const medals = ['🥇', '🥈', '🥉'];
  sorted.forEach((p, rank) => {
    let row = [...list.children].find((r) => r.dataset.id === p.id);
    if (!row) {
      row = document.createElement('div');
      row.className = 'rrow'; row.dataset.id = p.id;
      row.innerHTML = '<span class="medal"></span><div class="rmain"><div class="rname"></div><div class="rbar"><i></i></div><div class="rstat"></div></div><b class="rscore">0</b>';
      row.style.transform = `translateY(${rank * ROW_H}px)`;
      list.appendChild(row);
    }
    row.style.transform = `translateY(${rank * ROW_H}px)`;
    row.classList.toggle('you', p.id === myId);
    row.classList.toggle('turn', p.id === state.turn && state.phase === 'playing');
    row.classList.toggle('off', !p.connected);
    row.querySelector('.medal').textContent = p.score > 0 && rank < 3 ? medals[rank] : String(rank + 1);
    row.querySelector('.rname').textContent = `${p.name}${p.id === myId ? ' (tú)' : ''}${p.id === state.turn && state.phase === 'playing' ? ' ▶' : ''}`;
    const bar = row.querySelector('.rbar i');
    bar.style.transform = `scaleX(${Math.min(1, p.score / state.pairs)})`;
    bar.style.background = colorOf(p.id);
    row.querySelector('.rstat').textContent = `${p.moves} ${p.moves === 1 ? 'intento' : 'intentos'}${p.streak >= 2 ? ` · 🔥 racha x${p.streak}` : ''}`;
    const lvl = streakLevel(p.streak);
    let fl = row.querySelector('.flames');
    if (!lvl && fl) fl.remove();
    else if (lvl && (!fl || fl.dataset.lv !== String(lvl))) { if (fl) fl.remove(); row.insertAdjacentHTML('beforeend', flamesHTML(lvl)); }
    row.classList.toggle('onfire', lvl > 0);
    row.querySelector('.rscore').textContent = p.score;
    if (scorer && scorer.id === p.id && !reduceMotion()) {
      row.classList.remove('bump'); void row.offsetWidth; row.classList.add('bump');
      const plus = document.createElement('span');
      plus.className = 'plus'; plus.textContent = '+1'; plus.style.color = colorOf(p.id);
      plus.onanimationend = () => plus.remove();
      row.appendChild(plus);
    }
  });
}

function burst(x, y, color, n = 16) {
  if (reduceMotion()) return;
  for (let k = 0; k < n; k++) {
    const p = document.createElement('span');
    p.className = 'spark';
    p.style.cssText = `left:${x}px;top:${y}px;background:${k % 3 === 0 ? '#fff' : color}`;
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 30}px)) scale(0)`, opacity: 0 },
    ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
  }
}

function floatText(x, y, text, color) {
  if (reduceMotion()) return;
  const el = document.createElement('div');
  el.className = 'float-pt'; el.textContent = text; el.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  el.onanimationend = () => el.remove();
  document.body.appendChild(el);
}

function scoreEffects(newly, scorer) {
  const color = colorOf(scorer.id), mine = scorer.id === myId;
  const rects = newly.map((i) => $('board').children[i].getBoundingClientRect());
  rects.forEach((r) => burst(r.left + r.width / 2, r.top + r.height / 2, color, mine ? 24 : 14));
  const cx = rects.reduce((s, r) => s + r.left + r.width / 2, 0) / rects.length;
  const cy = Math.min(...rects.map((r) => r.top));
  floatText(cx, cy, mine ? '¡Punto! +1' : `+1 ${scorer.name}`, color);
  if (scorer.streak >= 2) shakeScreen(streakLevel(scorer.streak));
  if (scorer.streak >= 2) setTimeout(() => floatText(cx, cy - 38, `🔥 Racha x${scorer.streak}`, '#ff9f1c'), 250);
}

function finishEffects() {
  for (let k = 0; k < 8; k++) setTimeout(() => burst(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.2 + Math.random() * 0.3), COLORS[k % 4], 26), k * 220);
}

// ---- Rachas: fuego alrededor del jugador (2+ aciertos seguidos) ----
const streakLevel = (n) => (n >= 5 ? 3 : n >= 3 ? 2 : n >= 2 ? 1 : 0);
const FLAME_POS = [[50, 0], [0, 40], [100, 40], [25, 0], [75, 0], [50, 100], [0, 75], [100, 75], [10, 0], [90, 0], [25, 100], [75, 100]];
function flamesHTML(lvl) {
  if (!lvl) return '';
  const n = lvl * 3 + 3; // 6, 9 o 12 llamas
  const items = FLAME_POS.slice(0, n).map(([x, y], k) =>
    `<i style="left:${x}%;top:${y}%;--dl:-${((k * 0.17) % 0.9).toFixed(2)}s;--du:${(0.5 + (k % 4) * 0.1).toFixed(1)}s">🔥</i>`).join('');
  return `<span class="flames lv${lvl}" data-lv="${lvl}" aria-hidden="true">${items}</span>`;
}

// Temblor de pantalla al hacer racha. Se sacude cada elemento por separado (no <main>):
// un transform en un contenedor movería también al ranking y al reloj, que son position:fixed.
function shakeScreen(lvl) {
  if (!lvl || reduceMotion()) return;
  const amp = [0, 4, 7, 11][lvl], dur = [0, 0.5, 0.65, 0.85][lvl];
  document.querySelectorAll('main > .glass, #levelBadge, #board, #rank, #timer').forEach((el) => {
    el.style.setProperty('--amp', `${amp}px`);
    el.style.setProperty('--dur', `${dur}s`);
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), dur * 1000 + 60);
  });
}

// ---- Podio SVG (estilo Kahoot): sube el 3.º, luego el 2.º y al final el 1.º ----
function buildPodium() {
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.moves - b.moves);
  const names = state.players.filter((p) => state.winners.includes(p.id)).map((p) => p.name);
  $('endTitle').textContent = names.length > 1 ? `🤝 Empate: ${names.join(' y ')}` : `🏆 ¡Ganó ${names[0]}!`;
  const FLOOR = 262, W = 120;
  const slots = [
    { p: ranked[1], rank: 2, x: 20, h: 110, d: 1.4, fill: '#aab4cf' },
    { p: ranked[0], rank: 1, x: 150, h: 150, d: 2.7, fill: '#f5b301' },
    { p: ranked[2], rank: 3, x: 280, h: 80, d: 0.3, fill: '#cd7f32' },
  ];
  let svg = `<rect x="0" y="${FLOOR}" width="420" height="10" rx="5" fill="#2d3470"/>`;
  slots.forEach(({ p, rank, x, h, d, fill }) => {
    if (!p) return;
    const top = FLOOR - h, cx = x + W / 2;
    const nm = p.name.length > 11 ? `${p.name.slice(0, 10)}…` : p.name;
    svg += `<g style="--d:${d}s">
      <rect class="pod-bar" x="${x}" y="${top}" width="${W}" height="${h}" rx="10" fill="${fill}"/>
      <text class="pod-num" x="${cx}" y="${top + 62}" text-anchor="middle" font-size="54" font-weight="800" fill="#15183a">${rank}</text>
      <g class="pod-who">
        ${rank === 1 ? `<text class="pod-crown" x="${cx}" y="${top - 52}" text-anchor="middle" font-size="34">👑</text>` : ''}
        <text x="${cx}" y="${top - 28}" text-anchor="middle" font-size="17" font-weight="700" fill="#eef0ff">${esc(nm)}</text>
        <text x="${cx}" y="${top - 9}" text-anchor="middle" font-size="14" fill="#b4bbe6">${p.score} ${p.score === 1 ? 'pareja' : 'parejas'}</text>
      </g></g>`;
  });
  $('podium').innerHTML = svg;
  const extra = [];
  if (ranked[3]) extra.push(`4.º ${ranked[3].name}: ${ranked[3].score}`);
  const best = [...state.players].sort((a, b) => b.bestStreak - a.bestStreak)[0];
  if (best && best.bestStreak >= 2) extra.push(`🔥 Mejor racha: ${best.name} (x${best.bestStreak})`);
  $('endExtra').textContent = extra.join('  ·  ');
  if (!reduceMotion()) setTimeout(finishEffects, 3400); // confeti cuando aparece el 1.º
}

// ---- Tablero: creación persistente + intro (reparto y barajado) ----
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildBoard(withIntro) {
  const board = $('board');
  board.className = 'board' + (state.cards.length > 16 ? ' cols6' : '');
  board.innerHTML = state.cards.map((c, i) =>
    `<button class="tile ${withIntro ? 'deal' : ''}" style="--i:${i}" data-i="${i}" aria-label="carta ${i + 1}"><div class="in"><div class="face front">❓</div><div class="face back"></div></div></button>`).join('');
  dealing = withIntro && !reduceMotion();
  if (withIntro) intro(); else busy = false;
}

// Intro: 1) reparto  2) se muestran las cartas (según el nivel)  3) se voltean  4) barajado.
// Las duraciones coinciden con introDuration() del servidor, que bloquea las jugadas hasta que termina.
async function intro() {
  busy = true;
  const animate = !reduceMotion();
  const board = $('board');
  const tiles = [...board.children];
  const ms = state.previewMs;
  introLabel = '🃏 Repartiendo…'; // sin render(): ya viene llamado desde render()
  await wait(tiles.length * 60 + 600);
  dealing = false; tiles.forEach((t) => t.classList.remove('deal'));
  if (previewValues && ms > 0) {
    previewing = true;
    introLabel = '👀 ¡Memoriza las cartas!'; render();
    await wait(ms);
    previewing = false; previewValues = null;      // las caras dejan de estar en el cliente
    render();
    await wait(450);                               // tiempo del volteo hacia abajo
  } else await wait(ms > 0 ? ms + 450 : 0);
  introLabel = '🔀 Barajando…'; render();
  for (let round = 0; round < 3; round++) {
    if (animate) {
      const rects = tiles.map((t) => t.getBoundingClientRect());
      const perm = tiles.map((_, i) => i).sort(() => Math.random() - 0.5);
      tiles.forEach((t, i) => {
        const dx = rects[perm[i]].left - rects[i].left, dy = rects[perm[i]].top - rects[i].top;
        t.style.transition = 'transform .55s cubic-bezier(.5,0,.2,1)';
        t.style.transform = `translate(${dx}px,${dy}px) rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`;
      });
    }
    await wait(650);
    tiles.forEach((t) => { t.style.transition = 'none'; t.style.transform = ''; }); // por detrás son iguales
    await wait(60);
  }
  tiles.forEach((t) => { t.style.transition = ''; });
  busy = false;
  render();
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// ---- Nombre de usuario: las opciones del inicio quedan bloqueadas hasta confirmarlo ----
let userName = null;
function setName(n) {
  userName = n;
  $('name').readOnly = !!n;
  $('btnName').textContent = n ? 'Cambiar' : 'Confirmar';
  $('btnName').classList.toggle('confirm', !n);
  $('options').disabled = !n;
  $('options').classList.toggle('locked', !n);
  const hint = $('nameHint');
  hint.classList.toggle('ok', !!n);
  hint.textContent = n ? `✓ Jugarás como ${n}` : '🔒 Confirma tu nombre (2 a 14 caracteres) para desbloquear las opciones';
  if (n) { try { localStorage.setItem('memoduel-name', n); } catch { /* sin almacenamiento */ } }
}
$('nameForm').onsubmit = (e) => {
  e.preventDefault();
  if (userName) { setName(null); $('name').focus(); $('name').select(); return; } // cambiar nombre
  const v = $('name').value.trim().replace(/\s+/g, ' ');
  if (v.length < 2) return toast('El nombre debe tener al menos 2 caracteres');
  setName(v);
  $('btnCreate').focus();
};
try { $('name').value = localStorage.getItem('memoduel-name') || ''; } catch { /* sin almacenamiento */ }
setName(null);
const nm = () => userName;

$('btnCreate').onclick = () => userName && send({ type: 'create', name: nm() });
$('btnJoin').onclick = () => userName && send({ type: 'join', code: $('code').value, name: nm() });
$('btnStart').onclick = () => send({ type: 'start', level: $('level').value });
$('btnAgain').onclick = () => send({ type: 'start', level: state.level });
// Volver al inicio (desde la sala de espera, por si se creó o se entró por error, o desde el final)
function goHome() {
  send({ type: 'leave' });
  state = null; lastPhase = null; busy = false; endShown = false;
  clearTimeout(podiumTimer);
  Music.stop();
  show('game', false); show('lobby', false); show('home', true);
}
$('btnLeave').onclick = goHome;
$('btnBack').onclick = goHome;
$('board').onclick = (e) => {
  const t = e.target.closest('.tile');
  if (t && !busy) send({ type: 'flip', index: +t.dataset.i });
};

connect();
