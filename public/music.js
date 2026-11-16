'use strict';
// Música original generada con Web Audio (sin archivos ni copyright).
// El tempo sube con la racha del jugador local y vuelve a la calma al perderla.
const Music = (() => {
  const BASE_BPM = 100;
  let ctx = null, master = null, timer = null, noiseBuf = null;
  let nextTime = 0, step = 0, bar = 0, bpm = BASE_BPM, targetBpm = BASE_BPM, streak = 0;
  let on = true;
  let wanted = false; // la partida pide música (solo suena mientras se juega)
  try { on = localStorage.getItem('memoduel-music') !== 'off'; } catch { /* sin almacenamiento */ }

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  // Am - F - C - G: nota grave (MIDI) y arpegio de cada compás
  const PROG = [
    { bass: 45, arp: [69, 72, 76, 72] },
    { bass: 41, arp: [65, 69, 72, 69] },
    { bass: 48, arp: [72, 76, 79, 76] },
    { bass: 43, arp: [67, 71, 74, 71] },
  ];

  function tone(freq, t, dur, type, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.03);
  }

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.2);
  }

  function hat(t, vol) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.06);
  }

  // Un paso = una semicorchea. 16 pasos por compás.
  function playStep(t) {
    const chord = PROG[bar % 4];
    const hot = streak >= 2, fire = streak >= 5;
    if (step % 4 === 0) kick(t);
    if ([0, 4, 8, 10, 12].includes(step)) tone(hz(chord.bass + (step === 10 ? 12 : 0)), t, 0.2, 'triangle', 0.5);
    if (step % 2 === 0) { // arpegio en corcheas; sube una octava en los compases impares
      const note = chord.arp[(step / 2) % 4] + (bar % 8 >= 4 ? 12 : 0);
      tone(hz(note), t, 0.16, 'square', hot ? 0.16 : 0.1);
    }
    if (step % 4 === 2) hat(t, 0.25);
    if (hot && step % 2 === 1) hat(t, 0.12);                     // más ritmo con racha
    if (fire && step % 4 === 0) tone(hz(chord.arp[0] + 12), t, 0.1, 'sawtooth', 0.07); // brillo extra
    step = (step + 1) % 16;
    if (step === 0) bar++;
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.12) {
      playStep(nextTime);
      bpm += (targetBpm - bpm) * 0.12;       // el tempo cambia de forma suave
      nextTime += 60 / bpm / 4;
    }
  }

  function begin() {
    if (!ctx || !on || !wanted || timer) return;
    nextTime = ctx.currentTime + 0.05;
    timer = setInterval(scheduler, 25);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.18, ctx.currentTime, 0.2);
  }

  function halt() {
    if (!ctx) return;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    clearInterval(timer); timer = null;
  }

  // El navegador solo permite audio tras una interacción del usuario.
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    begin();
  }
  addEventListener('pointerdown', unlock, { once: false, passive: true });
  addEventListener('keydown', unlock, { passive: true });
  document.addEventListener('visibilitychange', () => { // ahorra batería en segundo plano
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  const btn = () => document.getElementById('btnMute');
  function paint() {
    const b = btn(); if (!b) return;
    b.textContent = on ? '🔊' : '🔇';
    b.setAttribute('aria-pressed', String(!on));
    b.setAttribute('aria-label', on ? 'Silenciar música' : 'Activar música');
  }
  function toggle() {
    on = !on;
    try { localStorage.setItem('memoduel-music', on ? 'on' : 'off'); } catch { /* sin almacenamiento */ }
    if (on) unlock(); else halt();
    paint();
  }
  document.addEventListener('DOMContentLoaded', () => { paint(); if (btn()) btn().onclick = toggle; });

  return {
    // La música suena solo mientras hay partida en curso; cada partida arranca desde el principio.
    play() { wanted = true; begin(); },
    stop() { wanted = false; halt(); bpm = targetBpm = BASE_BPM; step = 0; bar = 0; streak = 0; },
    // racha = aciertos seguidos del jugador local; 0 fuera de partida
    setStreak(n) {
      streak = n;
      targetBpm = n >= 2 ? BASE_BPM + 4 + Math.min(n, 7) * 8 : BASE_BPM; // 2 → 120 … 7+ → 160
    },
  };
})();
