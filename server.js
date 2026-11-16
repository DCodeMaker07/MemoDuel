'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { Game } = require('./game');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
const MISMATCH_DELAY = 1100;

const rooms = new Map();
const metrics = { started: Date.now(), connections: 0, gamesStarted: 0, gamesFinished: 0, errors: 0 };

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, rooms: rooms.size, uptimeS: Math.round((Date.now() - metrics.started) / 1000), ...metrics }));
  }
  let file = req.url.split('?')[0];
  if (file === '/') file = '/index.html';
  const full = path.normalize(path.join(PUBLIC, file));
  if (!full.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

function makeCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c;
  do { c = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join(''); } while (rooms.has(c));
  return c;
}

function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }
// Reloj de turno: se re-arma según game.deadline cada vez que cambia el estado.
function armTimer(game) {
  clearTimeout(game.timer);
  if (game.phase !== 'playing') return;
  const ms = Math.max(0, game.deadline - Date.now()) + 50;
  game.timer = setTimeout(() => {
    if (!rooms.has(game.code)) return;
    if (game.timeout()) broadcast(game); // pasa el turno (broadcast re-arma)
    else if (game.phase === 'playing') armTimer(game); // bloqueado por un fallo: se re-arma al resolver
  }, ms);
}

function broadcast(game, extra = {}) {
  armTimer(game);
  const state = game.publicState();
  for (const ws of wss.clients) if (ws.roomCode === game.code) send(ws, { type: 'state', state, ...extra });
}

wss.on('connection', (ws) => {
  ws.id = crypto.randomUUID();
  metrics.connections++;
  send(ws, { type: 'hello', id: ws.id });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const game = ws.roomCode ? rooms.get(ws.roomCode) : null;
    const fail = (error) => { metrics.errors++; send(ws, { type: 'error', error }); };

    switch (msg.type) {
      case 'create': {
        const g = new Game(makeCode());
        rooms.set(g.code, g);
        g.addPlayer(ws.id, msg.name);
        ws.roomCode = g.code;
        broadcast(g);
        break;
      }
      case 'join': {
        const g = rooms.get(String(msg.code || '').toUpperCase());
        if (!g) return fail('Sala no encontrada');
        const r = g.addPlayer(ws.id, msg.name);
        if (!r.ok) return fail(r.error);
        ws.roomCode = g.code;
        broadcast(g);
        break;
      }
      case 'start': {
        if (!game) return;
        const r = game.start(ws.id, msg.level);
        if (!r.ok) return fail(r.error);
        metrics.gamesStarted++;
        broadcast(game);
        // Vista previa: las caras solo se envían en este mensaje, durante los segundos del nivel.
        if (game.previewMs > 0) {
          const values = game.cards.map((c) => c.value);
          for (const c of wss.clients) if (c.roomCode === game.code) send(c, { type: 'preview', values, ms: game.previewMs });
        }
        break;
      }
      case 'flip': {
        if (!game) return;
        const r = game.flip(ws.id, msg.index);
        if (!r.ok) return fail(r.error);
        if (game.phase === 'finished') metrics.gamesFinished++;
        broadcast(game, { event: r.event });
        if (r.event === 'mismatch') {
          setTimeout(() => { game.resolve(); broadcast(game); }, MISMATCH_DELAY);
        }
        break;
      }
      case 'leave':
        leave(ws);
        break;
    }
  });

  ws.on('close', () => leave(ws));
});

function leave(ws) {
  const game = ws.roomCode ? rooms.get(ws.roomCode) : null;
  ws.roomCode = null;
  if (!game) return;
  game.removePlayer(ws.id);
  if (game.isEmpty()) { clearTimeout(game.timer); rooms.delete(game.code); }
  else broadcast(game);
}

server.listen(PORT, () => console.log(`MemoDuel en http://localhost:${PORT}`));
