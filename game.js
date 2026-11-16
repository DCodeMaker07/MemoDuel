'use strict';
// Lógica pura del juego (sin red) -> fácil de probar (calidad incorporada, Deming punto 3).

const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐙', '🦋', '🍎', '🍕', '🚀', '⚽', '🎸', '🌵', '🍩', '🎲', '🧠', '⭐', '🔥', '🌈'];
const MAX_PLAYERS = 4;
const MIN_PAIRS = 4;
const MAX_PAIRS = 12;
const TURN_MS = 30000;        // tiempo por turno por defecto (pruebas)

// Niveles: cuánto se muestran las cartas al inicio y cuánto dura cada turno.
const LEVELS = {
  facil:   { label: 'Fácil',   pairs: 6,  previewMs: 4000, turnMs: 20000 },
  normal:  { label: 'Normal',  pairs: 8,  previewMs: 2000, turnMs: 15000 },
  dificil: { label: 'Difícil', pairs: 12, previewMs: 1000, turnMs: 10000 },
};
// Duración de la intro del cliente: reparto + vista previa + volteo + barajado (+ margen de red).
const introDuration = (cards, previewMs) => cards * 60 + 600 + previewMs + 450 + 3 * 710 + 400;

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs, rng = Math.random) {
  const values = shuffle(EMOJIS, rng).slice(0, pairs);
  return shuffle([...values, ...values], rng).map((value) => ({ value, state: 'hidden' }));
}

class Game {
  constructor(code, rng = Math.random, turnMs = TURN_MS) {
    this.code = code;
    this.rng = rng;
    this.players = [];
    this.hostId = null;
    this.phase = 'lobby'; // lobby | playing | finished
    this.pairs = 8;
    this.cards = [];
    this.turnIdx = 0;
    this.flipped = [];
    this.locked = false;
    this.turnMs = turnMs;
    this.deadline = 0;
    this.level = 'normal';
    this.previewMs = 0;
    this.introEnd = 0;
  }

  // Temporizador de turno (autoritativo en el servidor).
  resetTimer(extraMs = 0) {
    this.deadline = Date.now() + this.turnMs + extraMs;
  }

  timeLeftMs() {
    return this.phase === 'playing' ? Math.max(0, this.deadline - Date.now()) : null;
  }

  // Se acabó el tiempo: se ocultan las cartas volteadas y pasa el turno.
  timeout() {
    if (this.phase !== 'playing' || this.locked) return false;
    this.resolve(true);
    return true;
  }

  addPlayer(id, name) {
    if (this.players.find((p) => p.id === id)) return { ok: true };
    if (this.phase !== 'lobby') return { ok: false, error: 'La partida ya comenzó' };
    if (this.players.length >= MAX_PLAYERS) return { ok: false, error: 'Sala llena (máx. 4)' };
    const clean = String(name || '').trim().slice(0, 14) || 'Jugador';
    this.players.push({ id, name: clean, score: 0, moves: 0, streak: 0, bestStreak: 0, connected: true });
    if (!this.hostId) this.hostId = id;
    return { ok: true };
  }

  removePlayer(id) {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx === -1) return;
    if (this.phase === 'lobby') {
      this.players.splice(idx, 1);
    } else {
      this.players[idx].connected = false;
      if (this.currentPlayer() && this.currentPlayer().id === id) this.resolve(true);
      if (!this.players.some((p) => p.connected)) this.phase = 'finished';
    }
    if (this.hostId === id) {
      const next = this.players.find((p) => p.connected);
      this.hostId = next ? next.id : null;
    }
  }

  isEmpty() {
    return !this.players.some((p) => p.connected);
  }

  currentPlayer() {
    return this.players[this.turnIdx] || null;
  }

  start(id, level) {
    if (id !== this.hostId) return { ok: false, error: 'Solo el anfitrión inicia' };
    if (this.phase === 'playing') return { ok: false, error: 'Ya está en juego' };
    const connected = this.players.filter((p) => p.connected);
    if (connected.length < 2) return { ok: false, error: 'Se necesitan al menos 2 jugadores' };
    this.players = connected;
    let cfg = LEVELS[level];
    if (cfg) this.level = level;
    else { // compatibilidad: un número de parejas, sin intro ni vista previa (pruebas)
      const n0 = Math.max(MIN_PAIRS, Math.min(MAX_PAIRS, parseInt(level, 10) || this.pairs));
      cfg = { pairs: n0, previewMs: 0, turnMs: this.turnMs, noIntro: true };
    }
    const n = cfg.pairs;
    this.pairs = n;
    this.previewMs = cfg.previewMs;
    this.turnMs = cfg.turnMs;
    this.cards = buildDeck(n, this.rng);
    this.players.forEach((p) => { p.score = 0; p.moves = 0; p.streak = 0; p.bestStreak = 0; });
    this.turnIdx = 0;
    this.flipped = [];
    this.locked = false;
    this.phase = 'playing';
    const introMs = cfg.noIntro ? 0 : introDuration(n * 2, cfg.previewMs);
    this.introEnd = Date.now() + introMs;
    this.resetTimer(introMs); // el reloj del primer turno empieza cuando termina la intro
    return { ok: true };
  }

  flip(id, index) {
    if (this.phase !== 'playing') return { ok: false, error: 'No hay partida activa' };
    const cur = this.currentPlayer();
    if (!cur || cur.id !== id) return { ok: false, error: 'No es tu turno' };
    if (Date.now() < this.introEnd) return { ok: false, error: 'Espera: se están mostrando y barajando las cartas' };
    if (this.locked) return { ok: false, error: 'Espera' };
    const card = this.cards[index];
    if (!card || card.state !== 'hidden') return { ok: false, error: 'Carta no válida' };

    card.state = 'up';
    this.flipped.push(index);
    if (this.flipped.length < 2) return { ok: true, event: 'first' };

    cur.moves++;
    const [a, b] = this.flipped.map((i) => this.cards[i]);
    if (a.value === b.value) {
      a.state = b.state = 'matched';
      cur.score++;
      cur.streak++; // racha: aciertos seguidos
      cur.bestStreak = Math.max(cur.bestStreak, cur.streak);
      this.flipped = [];
      if (this.cards.every((c) => c.state === 'matched')) this.phase = 'finished';
      else this.resetTimer();
      return { ok: true, event: 'match' }; // mismo jugador repite turno
    }
    this.locked = true;
    return { ok: true, event: 'mismatch' }; // el servidor llama resolve() tras un retardo
  }

  resolve(force = false) {
    if (!this.locked && !force) return;
    const cp = this.currentPlayer();
    if (cp) cp.streak = 0; // fallo, tiempo agotado o desconexión: se pierde la racha
    this.flipped.forEach((i) => { if (this.cards[i].state === 'up') this.cards[i].state = 'hidden'; });
    this.flipped = [];
    this.locked = false;
    this.nextTurn();
  }

  nextTurn() {
    this.resetTimer();
    for (let k = 1; k <= this.players.length; k++) {
      const i = (this.turnIdx + k) % this.players.length;
      if (this.players[i].connected) { this.turnIdx = i; return; }
    }
  }

  winners() {
    if (this.phase !== 'finished') return [];
    const max = Math.max(...this.players.map((p) => p.score));
    return this.players.filter((p) => p.score === max).map((p) => p.id);
  }

  // Estado público: NUNCA se envía el valor de cartas ocultas (anti-trampa).
  publicState() {
    const cur = this.currentPlayer();
    return {
      code: this.code,
      phase: this.phase,
      hostId: this.hostId,
      pairs: this.pairs,
      turn: cur ? cur.id : null,
      players: this.players,
      cards: this.cards.map((c) => ({ state: c.state, value: c.state === 'hidden' ? null : c.value })),
      winners: this.winners(),
      level: this.level,
      levelLabel: LEVELS[this.level].label,
      previewMs: this.previewMs,
      turnMs: this.turnMs,
      timeLeftMs: this.timeLeftMs(),
    };
  }
}

module.exports = { Game, buildDeck, shuffle, LEVELS, introDuration, MAX_PLAYERS, MIN_PAIRS, MAX_PAIRS };
