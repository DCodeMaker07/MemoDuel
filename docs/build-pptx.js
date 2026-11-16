const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'MemoDuel';
const NAVY = '15183A', VIO = '5B3FE0', MINT = '2ED47A', LIGHT = 'F4F5FF', INK = '1B1E3C', MUTE = '555A85', WHITE = 'FFFFFF';
const H = 'Cambria', B = 'Calibri';
const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.12, blur: 8, offset: 2, angle: 90 });

function content(title) {
  const s = pres.addSlide(); s.background = { color: LIGHT };
  s.addText(title, { x: 0.5, y: 0.3, w: 9, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: NAVY, margin: 0, isTextBox: true });
  return s;
}
function card(s, x, y, w, h, head, body, fill = WHITE, headColor = VIO, bodyColor = INK) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, rectRadius: 0.1, shadow: shadow() });
  s.addText(head, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.5, fontFace: H, fontSize: 18, bold: true, color: headColor, margin: 0, isTextBox: true });
  s.addText(body, { x: x + 0.2, y: y + 0.7, w: w - 0.4, h: h - 0.85, fontFace: B, fontSize: 14, color: bodyColor, margin: 0, valign: 'top', isTextBox: true });
}
const bullets = (arr) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, paraSpaceAfter: 6 } }));
const tbl = { fontFace: B, fontSize: 14, color: INK, fill: { color: WHITE }, border: { type: 'solid', color: 'D5D8F0', pt: 1 }, rowH: 0.5, valign: 'middle' };

// 1 Titulo
let s = pres.addSlide(); s.background = { color: NAVY };
s.addText('MemoDuel', { x: 0.6, y: 1.4, w: 8.8, h: 1.1, fontFace: H, fontSize: 54, bold: true, color: WHITE, margin: 0, isTextBox: true });
s.addText('Juego web multijugador en tiempo real para reforzar la memoria de trabajo, desarrollado con los principios de calidad total de W. E. Deming', { x: 0.6, y: 2.7, w: 8.4, h: 1.2, fontFace: B, fontSize: 20, color: 'CFD3FF', margin: 0, valign: 'top', isTextBox: true });
s.addText('[Integrantes: Nombre 1 · Nombre 2 · Nombre 3]   ·   [Curso / Docente]   ·   2026', { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: B, fontSize: 14, color: MINT, margin: 0, isTextBox: true });

// 2 Descripcion
s = content('Descripción');
card(s, 0.5, 1.2, 4.3, 3.8, '¿Qué es?', 'Juego de parejas por turnos para 2 a 4 jugadores. Voltea dos cartas: si coinciden sumas un punto y repites; si no, se ocultan y juega el siguiente.\n\nLas cartas falladas las ve todo el mundo: hay que recordar también las jugadas ajenas.');
card(s, 5.2, 1.2, 4.3, 3.8, 'Características', '• Nombre de usuario y salas por código\n• 3 niveles: vista previa + reloj por turno\n• Rachas con fuego y temblor\n• Puntaje en vivo y podio final animado\n• Node.js + WebSocket, servidor autoritativo');

// 3 Objetivos
s = content('Objetivos');
card(s, 0.5, 1.2, 3.6, 3.8, 'General', 'Desarrollar un videojuego web multijugador que refuerce la memoria de trabajo y la atención visual, aplicando los principios de calidad total de Deming.', VIO, WHITE, WHITE);
s.addText('Específicos', { x: 4.4, y: 1.2, w: 3, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: VIO, margin: 0, isTextBox: true });
s.addText(bullets([
  'Diseñar mecánicas basadas en evidencia sobre memoria de trabajo.',
  'Implementar multijugador en tiempo real (2–4 jugadores).',
  'Aplicar PDCA y los puntos de Deming con pruebas y métricas.',
  'Desplegar el juego en un servidor remoto con URL pública.',
  'Definir un modelo de negocio sostenible.']), { x: 4.4, y: 1.7, w: 5.1, h: 3.3, fontFace: B, fontSize: 15, color: INK, margin: 0, valign: 'top', isTextBox: true });

// 4 Marco teorico
s = content('Marco teórico');
card(s, 0.5, 1.2, 2.9, 3.4, 'Baddeley y Hitch', 'Memoria de trabajo (1974; 2000): ejecutivo central, bucle fonológico y agenda visoespacial. MemoDuel entrena la agenda visoespacial.');
card(s, 3.55, 1.2, 2.9, 3.4, 'Roediger y Karpicke', 'Práctica de recuperación (2006): intentar recordar fortalece más que releer. Cada volteo es un intento con retroalimentación.');
card(s, 6.6, 1.2, 2.9, 3.4, 'Ebbinghaus', 'Curva del olvido (1885): lo no repasado se pierde. Cada turno refresca la información de las cartas.');
s.addText('Complementarios: Vygotsky · Csikszentmihalyi · Yerkes y Dodson · Ryan y Deci', { x: 0.5, y: 4.85, w: 9, h: 0.4, fontFace: B, fontSize: 14, color: MUTE, margin: 0, isTextBox: true });

// 5 Estado del arte
s = content('Estado del arte');
card(s, 0.5, 1.2, 2.9, 2.6, 'Lumosity', 'Entrenamiento cognitivo por suscripción. Individual; debate sobre transferencia.');
card(s, 3.55, 1.2, 2.9, 2.6, 'Peak', 'Minijuegos de memoria y atención, freemium. También individual.');
card(s, 6.6, 1.2, 2.9, 2.6, 'Memory clásico', 'Mecánica simple y conocida; casi siempre en solitario o local.');
s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 4.05, w: 9, h: 1.1, fill: { color: VIO }, rectRadius: 0.1 });
s.addText('Hueco que cubre MemoDuel: multijugador en tiempo real, sin instalación, gratis en su versión base y con motivación social.', { x: 0.7, y: 4.05, w: 8.6, h: 1.1, fontFace: B, fontSize: 16, bold: true, color: WHITE, margin: 0, valign: 'middle', isTextBox: true });

// 6 Justificacion
s = content('Justificación');
[['Social', 'Un juego accesible por navegador reduce barreras para ejercitar la memoria.'], ['Pedagógica', 'Práctica de recuperación y aprendizaje social con respaldo empírico.'], ['Técnica', 'Arquitectura multijugador con servidor autoritativo y pruebas automáticas.'], ['Calidad', 'Caso práctico de Deming aplicado a un producto de software.']]
  .forEach((it, i) => card(s, 0.5 + (i % 2) * 4.6, 1.2 + Math.floor(i / 2) * 1.8, 4.4, 1.65, it[0], it[1]));
s.addText('Es una herramienta de práctica y estimulación, no un tratamiento.', { x: 0.5, y: 4.95, w: 9, h: 0.4, fontFace: B, fontSize: 14, italic: true, color: MUTE, margin: 0, isTextBox: true });

// 7 Arquitectura
s = content('Desarrollo: arquitectura');
[['Navegador A', 'public/app.js', 0.5], ['Servidor Node.js', 'server.js + WebSocket', 3.8], ['Navegador B', 'public/app.js', 7.1]].forEach((b) => {
  const mid = b[2] === 3.8;
  s.addShape(pres.ShapeType.roundRect, { x: b[2], y: 1.3, w: 2.4, h: 1.1, fill: { color: mid ? VIO : WHITE }, rectRadius: 0.1, shadow: shadow() });
  s.addText([{ text: b[0], options: { bold: true, breakLine: true, fontSize: 16 } }, { text: b[1], options: { fontSize: 14 } }], { x: b[2], y: 1.3, w: 2.4, h: 1.1, align: 'center', valign: 'middle', fontFace: B, color: mid ? WHITE : INK, margin: 0, isTextBox: true });
});
s.addText('⇄', { x: 2.9, y: 1.45, w: 0.9, h: 0.8, fontSize: 30, color: VIO, align: 'center', margin: 0, isTextBox: true });
s.addText('⇄', { x: 6.2, y: 1.45, w: 0.9, h: 0.8, fontSize: 30, color: VIO, align: 'center', margin: 0, isTextBox: true });
s.addShape(pres.ShapeType.roundRect, { x: 3.8, y: 2.7, w: 2.4, h: 0.9, fill: { color: NAVY }, rectRadius: 0.1 });
s.addText([{ text: 'game.js', options: { bold: true, breakLine: true, fontSize: 16 } }, { text: 'reglas puras, sin red', options: { fontSize: 14 } }], { x: 3.8, y: 2.7, w: 2.4, h: 0.9, align: 'center', valign: 'middle', fontFace: B, color: WHITE, margin: 0, isTextBox: true });
s.addText(bullets(['El cliente solo pide voltear la carta i; el servidor valida turno y estado.', 'Las cartas ocultas nunca se envían al cliente (anti-trampa).', 'Flujo: create/join → start → flip → match | mismatch → finished.']), { x: 0.5, y: 3.85, w: 9, h: 1.5, fontFace: B, fontSize: 15, color: INK, margin: 0, valign: 'top', isTextBox: true });

// 8 Capturas
s = content('Desarrollo: pantallazos');
['Inicio (nombre) y sala con nivel', 'Partida: reloj y rachas', 'Podio final', 'pnpm test y /health'].forEach((t, i) => {
  const x = 0.5 + (i % 2) * 4.6, y = 1.2 + Math.floor(i / 2) * 2.1;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 4.4, h: 1.95, fill: { color: 'E4E6FA' }, line: { color: VIO, width: 1, dashType: 'dash' }, rectRadius: 0.1 });
  s.addText('[Pega aquí la captura]\n' + t, { x, y, w: 4.4, h: 1.95, align: 'center', valign: 'middle', fontFace: B, fontSize: 14, color: MUTE, margin: 0, isTextBox: true });
});

// 9 Codigo
s = content('Desarrollo: diseño y código');
const th = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: VIO } } });
s.addTable([[th('Componente'), th('Archivo'), th('Qué hace')],
['Lógica', 'game.js', 'Reglas, turnos, puntaje, mazo; 100 % testeable'],
['Servidor', 'server.js', 'HTTP + WebSocket, salas, /health con métricas'],
['Cliente', 'public/', 'Interfaz, animación de volteo, marcador'],
['Pruebas', 'test/game.test.js', '16 pruebas: reglas, niveles, reloj, rachas']],
  { ...tbl, x: 0.5, y: 1.2, w: 9, colW: [1.8, 2.6, 4.6] });
s.addText('Decisiones: retardo de 1,1 s tras un fallo para memorizar; si el jugador en turno se desconecta, el turno pasa al siguiente; el anfitrión se reasigna automáticamente.', { x: 0.5, y: 3.95, w: 9, h: 1.2, fontFace: B, fontSize: 15, color: INK, margin: 0, valign: 'top', isTextBox: true });

// 9b Niveles
s = content('Desarrollo: niveles de dificultad');
s.addTable([[th('Nivel'), th('Parejas'), th('Cartas visibles'), th('Cronómetro por turno')],
['Fácil', '6', '4 s', '20 s'],
['Normal', '8', '2 s', '15 s'],
['Difícil', '12', '1 s', '10 s']],
  { ...tbl, x: 0.5, y: 1.2, w: 9, colW: [2.2, 1.8, 2.4, 2.6] });
s.addText(bullets(['Secuencia: reparto → vista previa → volteo → barajado → juego.', 'A 10 s o menos el fondo se vuelve rojo y late; si el tiempo se agota, el servidor pasa el turno.', 'Los niveles ajustan el reto a la habilidad (flujo y dificultades deseables).']), { x: 0.5, y: 3.5, w: 9, h: 1.8, fontFace: B, fontSize: 15, color: INK, margin: 0, valign: 'top', isTextBox: true });

// 9c Motivación
s = content('Desarrollo: rachas, puntaje y podio');
card(s, 0.5, 1.2, 2.9, 3.6, 'Rachas', 'Dos o más aciertos seguidos rodean al jugador con fuego (3 intensidades) y hacen temblar la pantalla. Se pierden al fallar o agotar el tiempo.');
card(s, 3.55, 1.2, 2.9, 3.6, 'Puntaje en vivo', 'Menú izquierdo con el turno actual y el ranking: barras de progreso, intentos y efectos al sumar puntos.');
card(s, 6.6, 1.2, 2.9, 3.6, 'Podio SVG', 'Al final suben las barras del 3.º, 2.º y 1.º como en Kahoot!, con corona y confeti para el ganador.');

// 10 Calidad
s = content('Principios de calidad total (Deming)');
const hd = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY } } });
s.addTable([[hd('Principio'), hd('Aplicación en MemoDuel')],
['Ciclo PDCA', 'Planear → programar → probar → corregir en cada iteración'],
['Punto 3: calidad incorporada', 'Lógica pura con pruebas automáticas desde el inicio'],
['Punto 5: mejora constante', 'Backlog de mejoras tras cada prueba con usuarios'],
['Puntos 6–9: personas', 'Revisión entre pares, roles rotativos, sin culpas'],
['Punto 11: sin metas arbitrarias', 'Se mide calidad (errores, partidas completas)'],
['Control estadístico', 'Endpoint /health: conexiones, partidas y errores']],
  { ...tbl, x: 0.5, y: 1.2, w: 9, colW: [3.2, 5.8] });

// 10b PDCA en la práctica
s = content('PDCA en la práctica: defectos corregidos');
s.addTable([[hd('Defecto detectado'), hd('Corrección')],
['Cartas invisibles al iniciar (ancho 0 y clase CSS en conflicto)', 'Ancho 100 % y clases de estado con prefijo'],
['Volteo sin animación (tablero redibujado cada jugada)', 'Tablero persistente que solo actualiza clases'],
['Recursión infinita en la intro (render dentro de render)', 'Detectada en revisión; llamada eliminada'],
['pnpm test fallaba por la ruta del script', 'Script corregido a node --test'],
['Estilo antiguo pisaba el panel liquid glass', 'Regla duplicada eliminada']],
  { ...tbl, x: 0.5, y: 1.2, w: 9, colW: [5.2, 3.8] });
s.addText('7 defectos registrados en total (ver DOCUMENTO.md).', { x: 0.5, y: 4.7, w: 9, h: 0.4, fontFace: B, fontSize: 14, italic: true, color: MUTE, margin: 0, isTextBox: true });

// 11 Negocio
s = content('Modelo de negocio (Canvas)');
[['Segmentos', 'Estudiantes, familias, adultos mayores, colegios, empresas'], ['Propuesta de valor', 'Entrenar la memoria jugando con amigos, sin instalar'], ['Ingresos', 'Freemium con anuncios · Premium · licencia institucional'], ['Canales', 'Web, redes sociales, comunidades educativas'], ['Recursos y actividades', 'Código, servidor, diseño, mejora continua'], ['Costos y aliados', 'Hosting, dominio, marketing · colegios y educadores']]
  .forEach((b, i) => card(s, 0.5 + (i % 3) * 3.05, 1.2 + Math.floor(i / 3) * 1.9, 2.9, 1.75, b[0], b[1]));
s.addText('Validación: piloto en un curso; medir retención y disposición a pagar.', { x: 0.5, y: 5.0, w: 9, h: 0.4, fontFace: B, fontSize: 14, color: MUTE, margin: 0, isTextBox: true });

// 12 Conclusiones
s = content('Conclusiones');
s.addText(bullets([
  'Juego multijugador funcional con 3 niveles que ejercita la memoria de trabajo visoespacial.',
  'Separar lógica y red permitió pruebas automáticas y calidad incorporada.',
  'PDCA permitió detectar y corregir 7 defectos de forma temprana.',
  'Puntaje, rachas y podio motivan; su efecto real debe medirse con usuarios.',
  'Futuro: modos de secuencia y n-back, cuentas, rankings y estudio con usuarios.']), { x: 0.5, y: 1.2, w: 9, h: 3.9, fontFace: B, fontSize: 18, color: INK, margin: 0, valign: 'top', isTextBox: true });

// 13 Bibliografia
s = pres.addSlide(); s.background = { color: NAVY };
s.addText('Bibliografía (APA 7)', { x: 0.5, y: 0.3, w: 9, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: WHITE, margin: 0, isTextBox: true });
const colA = [
  'Baddeley, A. D., & Hitch, G. (1974). Working memory. En The psychology of learning and motivation (Vol. 8, pp. 47–89). Academic Press.',
  'Baddeley, A. (2000). The episodic buffer. Trends in Cognitive Sciences, 4(11), 417–423.',
  'Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. MIT Press.',
  'Csikszentmihalyi, M. (1990). Flow: The psychology of optimal experience. Harper & Row.',
  'Deming, W. E. (1986). Out of the crisis. MIT CAES.',
  'Deterding, S., et al. (2011). From game design elements to gamefulness. MindTrek, 9–15. ACM.',
  'Ebbinghaus, H. (1885). Über das Gedächtnis. Duncker & Humblot.'];
const colB = [
  'Osterwalder, A., & Pigneur, Y. (2010). Business model generation. Wiley.',
  'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249–255.',
  'Ryan, R. M., & Deci, E. L. (2000). Self-determination theory. American Psychologist, 55(1), 68–78.',
  'Simons, D. J., et al. (2016). Do brain-training programs work? Psychological Science in the Public Interest, 17(3), 103–186.',
  'Vygotsky, L. S. (1978). Mind in society. Harvard University Press.',
  'Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. J. Comp. Neurol. Psychol., 18(5), 459–482.'];
[[colA, 0.5], [colB, 5.2]].forEach(([arr, x]) => s.addText(bullets(arr), { x, y: 1.1, w: 4.3, h: 3.9, fontFace: B, fontSize: 11, color: 'DDE0FF', margin: 0, valign: 'top', isTextBox: true }));
s.addText('Verificar años, páginas y DOI antes de entregar.', { x: 0.5, y: 5.1, w: 9, h: 0.3, fontFace: B, fontSize: 12, color: MINT, margin: 0, isTextBox: true });

pres.writeFile({ fileName: 'MemoDuel.pptx' }).then(() => console.log('ok'));
