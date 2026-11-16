# MemoDuel — Videojuego multijugador para reforzar la memoria

> Contenido listo para pasar a diapositivas siguiendo la estructura pedida. Reemplaza `[Integrantes]`, fechas y URL.
> **Verifica las referencias** (años, páginas, DOI) antes de entregar: están citadas de memoria y deben contrastarse con la fuente.

## 1. Título
**MemoDuel: juego web multijugador en tiempo real para el refuerzo de la memoria de trabajo, desarrollado con los principios de calidad total de W. Edwards Deming.**

## 2. Descripción
MemoDuel es un juego web de parejas (memory) por turnos para 2 a 4 jugadores. Cada jugador voltea dos cartas; si coinciden, suma un punto y repite turno; si no, las cartas se ocultan y juega el siguiente. Como las cartas falladas son visibles para todos, el juego exige **atender y recordar las jugadas de los demás**, no solo las propias. La interfaz toma como referencia la dinámica competitiva de plataformas como Kahoot! (marcador en vivo y podio final).

**Funcionalidades**
- **Nombre de usuario obligatorio:** las opciones del inicio se desbloquean al confirmarlo.
- **Salas por código** de 4 letras; el anfitrión elige el nivel.
- **3 niveles de dificultad** (vista previa de las cartas + cronómetro por turno):

| Nivel | Parejas | Se muestran las cartas | Cronómetro por turno |
|---|---|---|---|
| Fácil | 6 | 4 s | 20 s |
| Normal | 8 | 2 s | 15 s |
| Difícil | 12 | 1 s | 10 s |

- **Secuencia de inicio:** reparto de cartas → vista previa (fase de codificación) → se voltean → barajado → empieza el juego.
- **Reloj de arena** por turno. A 10 s o menos, el fondo se vuelve rojo y late. Si el tiempo se agota, el servidor pasa el turno.
- **Rachas:** 2 o más aciertos seguidos rodean al jugador con fuego (3 niveles de intensidad) y hacen temblar la pantalla.
- **Puntaje en vivo** (menú izquierdo con el turno y el ranking) y efectos al conseguir un punto.
- **Podio SVG animado** de los 3 primeros al final, con revancha.
- **Música original** (suena al iniciar la partida) generada por código (Web Audio, sin archivos ni derechos de autor ajenos): su tempo sube de 100 a 160 BPM según la racha del jugador, con botón para silenciarla.
- **Interfaz "liquid glass"** responsive (escritorio, tablet y móvil) y fondo animado tipo aurora.
- Tecnología: HTML/CSS/JavaScript (cliente), Node.js + WebSocket (servidor autoritativo). Gestor de paquetes: pnpm.

## 3. Objetivos
**General.** Desarrollar un videojuego web multijugador que refuerce la memoria de trabajo y la atención visual mediante práctica de recuperación, dificultad graduada y competencia social, aplicando los principios de calidad total de Deming en todo su desarrollo.

**Específicos.**
1. Diseñar mecánicas de juego (vista previa, cronómetro y niveles) basadas en evidencia sobre memoria de trabajo y práctica de recuperación.
2. Implementar un modo multijugador en tiempo real (2–4 jugadores) con arquitectura cliente-servidor autoritativa.
3. Incorporar elementos de motivación (puntaje en vivo, rachas y podio) que sostengan la participación.
4. Aplicar el ciclo PDCA y los puntos de Deming con pruebas automáticas y métricas.
5. Desplegar el juego en un servidor remoto accesible por URL.
6. Definir un modelo de negocio sostenible para el producto.

## 4. Marco teórico (3 autores)
1. **Baddeley y Hitch (1974); Baddeley (2000)** — Modelo de memoria de trabajo. Mantener y manipular información de forma temporal usa un ejecutivo central, un bucle fonológico y una agenda visoespacial. MemoDuel entrena sobre todo la **agenda visoespacial** (ubicación de cartas) y la actualización de información. La **vista previa** corresponde a la fase de codificación y el **barajado** exige retener posiciones sin apoyo visual.
2. **Roediger y Karpicke (2006)** — Efecto de la práctica de recuperación (*testing effect*). Intentar recordar fortalece la memoria más que releer. Cada volteo es un intento de recuperación con retroalimentación inmediata.
3. **Ebbinghaus (1885)** — Curva del olvido y repetición. Lo no repasado se olvida rápido; en el juego, la información de las cartas se refresca cada turno.

Complementarios que sustentan decisiones de diseño:
- **Vygotsky (1978)** — aprendizaje social: se aprende al observar y competir con otros.
- **Csikszentmihalyi (1990)** y **Bjork (1994)** — flujo y dificultades deseables: los niveles ajustan el reto a la habilidad.
- **Yerkes y Dodson (1908)** — relación entre activación y rendimiento: el cronómetro añade presión moderada; el modo rojo con latido la intensifica de forma deliberada al final del turno.
- **Ryan y Deci (2000)** y **Deterding et al. (2011)** — motivación intrínseca y gamificación: puntaje, rachas y podio buscan competencia percibida y reconocimiento.

## 5. Estado del arte (3 referentes)
1. **Lumosity (Lumos Labs)** — entrenamiento cognitivo comercial por suscripción. Individual, con debate científico sobre la transferencia a otras tareas.
2. **Peak (Synaptic Labs)** — minijuegos de memoria y atención, modelo freemium, también individual.
3. **Juegos de memoria clásicos digitales (Memory / Concentration)** — mecánica sencilla y conocida, normalmente en solitario o local.

Referente de interfaz: **Kahoot!** (aprendizaje basado en juegos con marcador y podio), del que se toma la dinámica de revelar el podio de forma progresiva.

**Hueco que cubre MemoDuel:** multijugador en tiempo real, sin instalación, con niveles que modulan tiempo de memorización y de respuesta, y con la dimensión social como motivación. *(Sugerencia: añade 1–2 capturas de estas apps y verifica su modelo de negocio actual.)*

## 6. Justificación
- Social: la memoria de trabajo es clave en el rendimiento académico; un juego accesible por navegador reduce barreras de acceso.
- Pedagógica: la práctica de recuperación, la dificultad graduada y el aprendizaje social tienen respaldo empírico.
- Técnica: demuestra una arquitectura multijugador con servidor autoritativo (cronómetro y reglas validadas en el servidor) y pruebas automatizadas.
- Calidad: sirve como caso práctico de aplicación de Deming a un producto de software.

> Nota de honestidad científica: la literatura no garantiza que entrenar memoria con juegos mejore otras capacidades (transferencia lejana). MemoDuel se presenta como **herramienta de práctica y estimulación**, no como tratamiento.

## 7. Desarrollo
Incluye aquí capturas: inicio con nombre bloqueado/desbloqueado, sala con selector de nivel, vista previa de cartas, partida con reloj de arena y rachas de fuego, modo rojo (≤10 s), podio final, `pnpm test` y `/health`.

| Componente | Archivo | Qué hace |
|---|---|---|
| Lógica del juego | `game.js` | Reglas, turnos, niveles, cronómetro, rachas, puntaje, mazo. Sin red → 100 % testeable |
| Servidor | `server.js` | HTTP estático + WebSocket, salas, reloj de turno, `/health` con métricas |
| Cliente | `public/` | Interfaz liquid glass, animaciones (reparto, barajado, volteo), reloj de arena, rachas, podio SVG |
| Pruebas | `test/game.test.js` | 16 pruebas automáticas (reglas, niveles, reloj, rachas, anti-trampa, desconexión) |

**Decisiones de diseño**
- **Servidor autoritativo:** el cliente solo pide "voltear la carta i"; el servidor valida turno, estado y tiempo.
- **Anti-trampa:** las caras de las cartas viajan solo en un mensaje durante la vista previa y el cliente las descarta; en el resto de la partida el estado público oculta el valor de las cartas no reveladas.
- **Reloj de turno en el servidor:** se re-arma tras cada cambio de estado; al agotarse se ocultan las cartas volteadas y pasa el turno. El primer turno incluye la duración de la intro para no restar tiempo al jugador.
- **Rachas:** se cuentan en el servidor (aciertos seguidos) y se pierden al fallar, agotar el tiempo o desconectarse.
- **Desconexión:** si el jugador en turno se desconecta, el turno pasa al siguiente y el anfitrión se reasigna.
- **Accesibilidad:** se respeta "reducir movimiento" del sistema (sin temblor, destellos ni latido).

**Flujo de mensajes:** `create/join → start(nivel) → state + preview → flip → (match | mismatch → resolve | timeout) → finished → start (revancha)`.

## 8. Principios de calidad total — W. Edwards Deming
| Principio (Deming) | Aplicación en MemoDuel |
|---|---|
| Ciclo **PDCA** (Planear-Hacer-Verificar-Actuar) | Cada iteración: planear funcionalidad → programar → probar (tests + partida real) → corregir. Ver registro de defectos más abajo |
| Punto 3: dejar de depender de la inspección masiva; calidad incorporada | Lógica pura con pruebas automáticas desde el inicio (16 pruebas), no solo revisión final |
| Punto 5: mejora constante del sistema | Backlog de mejoras tras cada prueba: niveles, reloj, rachas, podio, rediseño de interfaz |
| Punto 6: capacitación en el trabajo | Programación en pareja y revisión de código entre los 3 integrantes |
| Punto 7: liderazgo | Roles rotativos (desarrollo, pruebas, documentación) |
| Punto 8: eliminar el miedo | Retroalimentación sin culpas en las revisiones |
| Punto 9: derribar barreras entre áreas | Diseño, código y pruebas trabajan juntos |
| Punto 11: evitar metas numéricas arbitrarias | Se mide calidad (errores, partidas completadas), no líneas de código |
| Control estadístico | Endpoint `/health`: conexiones, partidas iniciadas/terminadas, errores |
| Enfoque en el cliente | Pruebas de usabilidad con compañeros; ajuste de niveles y de la interfaz según sus capturas y comentarios |

*(Los 14 puntos completos: Deming, 1986. Tomamos los aplicables a un equipo de 3 y lo declaramos.)*

### Registro de defectos (PDCA en la práctica)
| # | Defecto detectado (Verificar) | Causa | Corrección (Actuar) |
|---|---|---|---|
| 1 | Las cartas no se veían al iniciar la partida | Botones con ancho 0 en la cuadrícula y clase CSS `hidden` que chocaba con `display:none` | Ancho 100 % y clases de estado con prefijo (`s-hidden`, `s-up`, `s-matched`) |
| 2 | Las animaciones de volteo no se notaban | El tablero se redibujaba completo en cada jugada | Tablero persistente que solo actualiza clases |
| 3 | Riesgo de recursión infinita en la intro | `render()` llamaba a la intro, y esta a `render()` | Detectado en revisión antes de entregar; se quitó la llamada síncrona |
| 4 | El panel de inicio no se veía "liquid glass" | Una regla CSS antigua con fondo opaco pisaba el nuevo estilo | Eliminada la regla duplicada |
| 5 | `pnpm test` fallaba | El script usaba `node --test test/` (ruta de directorio no válida) | Script corregido a `node --test` |
| 6 | Reiniciar el servidor a mano a cada cambio | Sin modo desarrollo | Script `pnpm dev` (`node --watch`) |
| 7 | Avisos de diseño: animación de ancho (layout) y curva con rebote | Revisión automática de diseño | Barras con `scaleX` y curva suave |

**Evidencia a presentar:** captura de `pnpm test` (16/16), captura de `/health`, tablero de tareas (Trello/Notion) con ciclos PDCA y este registro de defectos.

## 9. Modelo de negocio (Business Model Canvas)
| Bloque | Propuesta |
|---|---|
| Segmentos | Estudiantes, familias, adultos mayores (estimulación cognitiva), colegios, empresas (bienestar) |
| Propuesta de valor | Entrenar memoria jugando con amigos, sin instalar nada; competitivo, social y con niveles de dificultad |
| Canales | Web (URL), redes sociales, comunidades educativas, boca a boca |
| Relación con clientes | Salas por código, ranking, retos semanales, soporte por correo |
| Fuentes de ingreso | **Freemium**: base gratis con anuncios discretos; **Premium** (suscripción baja) con más niveles, modos, temas y estadísticas; **licencia institucional** para colegios y centros; personalización de marca |
| Recursos clave | Código, servidor, diseño, base de usuarios |
| Actividades clave | Desarrollo, mejora continua, moderación, marketing |
| Aliados | Colegios, psicólogos/educadores asesores, hosting en la nube |
| Estructura de costos | Hosting, dominio, tiempo de desarrollo, marketing, soporte |

**Validación:** empezar con piloto en un curso; medir retención (¿vuelven a jugar?) y disposición a pagar; iterar (Lean Startup).

## 10. Conclusiones
1. Se logró un juego multijugador funcional que ejercita la memoria de trabajo visoespacial, con tres niveles que modulan el tiempo de memorización y de respuesta.
2. Separar la lógica del juego de la red permitió pruebas automáticas y menos defectos (calidad incorporada).
3. PDCA dio un ritmo claro de mejora y facilitó detectar y corregir errores temprano (7 defectos registrados).
4. Los elementos de motivación (puntaje en vivo, rachas y podio) refuerzan la participación; su efecto real debe medirse en un estudio con usuarios.
5. El modelo freemium + licencia institucional es viable para un producto educativo.
6. Trabajo futuro: modos de secuencia y n-back, cuentas y rankings, y estudio con usuarios para medir efecto.

## 11. Bibliografía (APA 7) — verificar antes de entregar
- Baddeley, A. D., & Hitch, G. (1974). Working memory. En G. H. Bower (Ed.), *The psychology of learning and motivation* (Vol. 8, pp. 47–89). Academic Press.
- Baddeley, A. (2000). The episodic buffer: A new component of working memory? *Trends in Cognitive Sciences, 4*(11), 417–423.
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. En J. Metcalfe & A. Shimamura (Eds.), *Metacognition: Knowing about knowing* (pp. 185–205). MIT Press.
- Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.
- Deming, W. E. (1986). *Out of the crisis*. MIT Center for Advanced Engineering Study.
- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". *Proceedings of the 15th International Academic MindTrek Conference* (pp. 9–15). ACM.
- Ebbinghaus, H. (1885). *Über das Gedächtnis*. Duncker & Humblot.
- Osterwalder, A., & Pigneur, Y. (2010). *Business model generation*. Wiley.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist, 55*(1), 68–78.
- Simons, D. J., et al. (2016). Do "brain-training" programs work? *Psychological Science in the Public Interest, 17*(3), 103–186.
- Vygotsky, L. S. (1978). *Mind in society*. Harvard University Press.
- Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482.
- Node.js Foundation. (s. f.). *Node.js documentation*. https://nodejs.org
- Ws contributors. (s. f.). *ws: A Node.js WebSocket library*. https://github.com/websockets/ws
