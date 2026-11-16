'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { Game, buildDeck } = require('../game');

const mk = () => {
  const g = new Game('TEST', () => 0.5);
  g.addPlayer('a', 'Ana'); g.addPlayer('b', 'Beto');
  return g;
};
const pairIdx = (g) => {
  const first = g.cards[0].value;
  return [0, g.cards.findIndex((c, i) => i > 0 && c.value === first)];
};
const nonPair = (g) => {
  const j = g.cards.findIndex((c, i) => i > 0 && c.value !== g.cards[0].value);
  return [0, j];
};

test('el mazo tiene parejas exactas', () => {
  const d = buildDeck(8);
  assert.strictEqual(d.length, 16);
  const counts = {};
  d.forEach((c) => (counts[c.value] = (counts[c.value] || 0) + 1));
  assert.ok(Object.values(counts).every((n) => n === 2));
});

test('máximo 4 jugadores y mínimo 2 para iniciar', () => {
  const g = new Game('X');
  g.addPlayer('a', 'A');
  assert.strictEqual(g.start('a', 8).ok, false);
  g.addPlayer('b', 'B'); g.addPlayer('c', 'C'); g.addPlayer('d', 'D');
  assert.strictEqual(g.addPlayer('e', 'E').ok, false);
});

test('solo el anfitrión inicia', () => {
  const g = mk();
  assert.strictEqual(g.start('b', 8).ok, false);
  assert.strictEqual(g.start('a', 8).ok, true);
});

test('acierto suma punto y conserva turno', () => {
  const g = mk(); g.start('a', 8);
  const [i, j] = pairIdx(g);
  g.flip('a', i);
  assert.strictEqual(g.flip('a', j).event, 'match');
  assert.strictEqual(g.players[0].score, 1);
  assert.strictEqual(g.currentPlayer().id, 'a');
});

test('fallo bloquea y pasa el turno al resolver', () => {
  const g = mk(); g.start('a', 8);
  const [i, j] = nonPair(g);
  g.flip('a', i);
  assert.strictEqual(g.flip('a', j).event, 'mismatch');
  assert.strictEqual(g.flip('a', 3).ok, false); // bloqueado
  g.resolve();
  assert.strictEqual(g.currentPlayer().id, 'b');
  assert.ok(g.cards.every((c) => c.state === 'hidden'));
});

test('no se puede jugar fuera de turno', () => {
  const g = mk(); g.start('a', 8);
  assert.strictEqual(g.flip('b', 0).ok, false);
});

test('el estado público no filtra cartas ocultas', () => {
  const g = mk(); g.start('a', 8);
  assert.ok(g.publicState().cards.every((c) => c.value === null));
});

test('la partida termina y declara ganador', () => {
  const g = mk(); g.start('a', 4);
  for (let guard = 0; guard < 50 && g.phase === 'playing'; guard++) {
    const idx = g.cards.findIndex((c) => c.state === 'hidden');
    const m = g.cards.findIndex((c, k) => k !== idx && c.state === 'hidden' && c.value === g.cards[idx].value);
    g.flip(g.currentPlayer().id, idx); g.flip(g.currentPlayer().id, m);
  }
  assert.strictEqual(g.phase, 'finished');
  assert.deepStrictEqual(g.winners(), ['a']);
});

test('si se desconecta quien tiene el turno, pasa al siguiente', () => {
  const g = mk(); g.start('a', 8);
  g.flip('a', 0);
  g.removePlayer('a');
  assert.strictEqual(g.currentPlayer().id, 'b');
  assert.strictEqual(g.hostId, 'b');
});

test('el reloj da tiempo por turno y el servidor lo reinicia al pasar el turno', () => {
  const g = new Game('T', () => 0.5, 1000);
  g.addPlayer('a', 'A'); g.addPlayer('b', 'B'); g.start('a', 8);
  const s = g.publicState();
  assert.strictEqual(s.turnMs, 1000);
  assert.ok(s.timeLeftMs <= 1000); // modo sin intro (número de parejas)
  g.deadline = Date.now() - 1; // simula tiempo agotado
  assert.strictEqual(g.timeLeftMs(), 0);
  g.flip('a', 0);
  assert.strictEqual(g.timeout(), true);
  assert.strictEqual(g.currentPlayer().id, 'b');
  assert.ok(g.cards.every((c) => c.state === 'hidden'));
  assert.ok(g.timeLeftMs() > 0 && g.timeLeftMs() <= 1000);
});

test('el reloj se detiene fuera de partida y no corre mientras hay un fallo resolviéndose', () => {
  const g = new Game('T2');
  assert.strictEqual(g.timeLeftMs(), null);
  g.addPlayer('a', 'A'); g.addPlayer('b', 'B'); g.start('a', 8);
  const j = g.cards.findIndex((c, i) => i > 0 && c.value !== g.cards[0].value);
  g.flip('a', 0); g.flip('a', j); // fallo -> bloqueado
  assert.strictEqual(g.timeout(), false);
});

test('niveles: parejas, vista previa y tiempo por turno', () => {
  const { LEVELS } = require('../game');
  const esperado = { facil: [6, 4000, 20000], normal: [8, 2000, 15000], dificil: [12, 1000, 10000] };
  for (const [k, [pairs, prev, turn]] of Object.entries(esperado)) {
    const g = new Game('L'); g.addPlayer('a', 'A'); g.addPlayer('b', 'B');
    assert.strictEqual(g.start('a', k).ok, true);
    const s = g.publicState();
    assert.strictEqual(g.cards.length, pairs * 2);
    assert.strictEqual(s.previewMs, prev);
    assert.strictEqual(s.turnMs, turn);
    assert.strictEqual(LEVELS[k].turnMs, turn);
    assert.ok(s.timeLeftMs > turn); // el reloj arranca al terminar la intro
  }
});

test('no se puede voltear mientras dura la vista previa y el barajado', () => {
  const g = new Game('L2'); g.addPlayer('a', 'A'); g.addPlayer('b', 'B'); g.start('a', 'facil');
  assert.strictEqual(g.flip('a', 0).ok, false);
  g.introEnd = Date.now() - 1; // termina la intro
  assert.strictEqual(g.flip('a', 0).ok, true);
});

test('la vista previa nunca viaja en el estado público', () => {
  const g = new Game('L3'); g.addPlayer('a', 'A'); g.addPlayer('b', 'B'); g.start('a', 'normal');
  assert.ok(g.publicState().cards.every((c) => c.value === null));
});

test('rachas: suben con cada acierto seguido y se pierden al fallar', () => {
  const g = mk(); g.start('a', 8);
  const matchOnce = () => {
    const i = g.cards.findIndex((c) => c.state === 'hidden');
    const j = g.cards.findIndex((c, k) => k !== i && c.state === 'hidden' && c.value === g.cards[i].value);
    g.flip('a', i); g.flip('a', j);
  };
  matchOnce(); matchOnce(); matchOnce();
  assert.strictEqual(g.players[0].streak, 3);
  const i = g.cards.findIndex((c) => c.state === 'hidden');
  const j = g.cards.findIndex((c, k) => k !== i && c.state === 'hidden' && c.value !== g.cards[i].value);
  g.flip('a', i); g.flip('a', j); // fallo
  g.resolve();
  assert.strictEqual(g.players[0].streak, 0);
  assert.strictEqual(g.players[0].bestStreak, 3);
});

test('rachas: el tiempo agotado también corta la racha', () => {
  const g = mk(); g.start('a', 8);
  const i = g.cards.findIndex((c) => c.state === 'hidden');
  const j = g.cards.findIndex((c, k) => k !== i && c.value === g.cards[i].value);
  g.flip('a', i); g.flip('a', j);
  assert.strictEqual(g.players[0].streak, 1);
  g.timeout();
  assert.strictEqual(g.players[0].streak, 0);
});
