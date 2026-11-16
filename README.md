# 🧠 MemoDuel

Juego de memoria multijugador en tiempo real (2-4 jugadores). Node.js + WebSocket. Calidad total según Deming (PDCA).

## Funcionalidades
- Nombre de usuario obligatorio y salas por código de 4 letras.
- 3 niveles: **Fácil** (memoriza 4 s, 20 s por turno), **Normal** (2 s, 15 s) y **Difícil** (1 s, 10 s).
- Reloj de arena por turno (modo rojo con latido a 10 s o menos); el servidor pasa el turno si se agota.
- Rachas con fuego y temblor de pantalla, puntaje en vivo y podio SVG animado al final.
- Interfaz "liquid glass" responsive, con fondo animado.
- Música original (Web Audio, sin archivos ni copyright) que suena al iniciar la partida y acelera con tu racha; botón 🔊 para silenciarla.
- Desde la sala de espera se puede volver al inicio.

## Ejecutar local
```bash
pnpm install
pnpm start        # http://localhost:3000
pnpm dev          # igual, pero se reinicia solo al guardar cambios
pnpm test         # 16 pruebas automáticas
```
Para probar el multijugador abre **dos pestañas** (usa nombres distintos): una crea la sala, la otra se une con el código.

## Desplegar en Render (gratis, URL pública)
1. Sube esta carpeta a un repositorio de GitHub (ese es tu "archivo editable publicado"). No subas `node_modules`.
2. En render.com → New → **Web Service** → conecta el repo.
3. Build command: `pnpm install` · Start command: `pnpm start` · Plan: Free.
4. Render te da una URL `https://xxxx.onrender.com` (soporta WebSocket). La primera carga puede tardar ~30 s en plan gratis.

Verifica: `https://TU-URL/health` debe responder JSON.

## Checklist de entregables
- [ ] Repo GitHub con el código (editables)
- [ ] URL en línea funcionando
- [ ] Pantallazos: inicio, sala, vista previa, partida con rachas, modo rojo, podio, `pnpm test`, `/health`
- [ ] Video 2–3 min con dos ventanas jugando
- [ ] Presentación según estructura (`docs/MemoDuel.pptx`; contenido completo en `docs/DOCUMENTO.md`)

## Estructura
`game.js` lógica · `server.js` red y reloj · `public/` cliente · `test/` pruebas · `docs/DOCUMENTO.md` contenido académico · `docs/build-pptx.js` genera la presentación
