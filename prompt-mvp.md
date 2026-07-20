# Prompt maestro — Construcción del MVP (Plataforma M1)

## Cómo usarlo

1. Guarda este archivo en tu repo como `docs/prompt-mvp.md` (así queda versionado y reutilizable).
2. En la terminal de Antigravity: `claude` → activa **plan mode** (Shift+Tab).
3. Escribe: `Lee @docs/prompt-mvp.md y ejecuta el PROMPT 1` (o pega el PROMPT 1 directamente).
4. **Revisa el plan antes de aprobar.** Si algo no calza con lo que imaginas, corrígelo ahí: es 10× más barato que corregir código.
5. En cada checkpoint, Claude Code se detiene. Abre `localhost` **desde tu teléfono** (misma red WiFi: `http://IP-de-tu-pc:3000`) y prueba como estudiante antes de dar el visto bueno. Ahí nace lo "pulido", no en el prompt.

Requisito: el kit ya instalado (CLAUDE.md, validador, hook). El prompt asume ese contexto y no lo repite.

---

## PROMPT 1 — La cáscara técnica completa del MVP

Ya tienes el contexto del proyecto en CLAUDE.md y docs/mos-v2.md; no lo voy a repetir. Hoy construimos la cáscara técnica completa del MVP: todo lo que no es contenido pedagógico real. Entra en plan mode y propón un plan detallado antes de tocar cualquier archivo.

ENTREGABLE DE ESTA SESIÓN (definición de terminado):
Una app Next.js desplegable donde un estudiante que recibe un link puede: ver una portada del curso → hacer un diagnóstico de 5 ítems → navegar una lección de demostración completa (10 pasos) con el gráfico interactivo de sliders funcionando → responder ítems formato PAES con feedback por alternativa → terminar en el cierre. Todo con datos de demostración válidos según el schema. `npm run validar`, `npm run lint` y `npm run build` en verde.

DECISIONES YA TOMADAS (no las reabras; si detectas una ambigüedad no cubierta aquí, pregúntame en vez de asumir):

- App Router, TypeScript estricto, componentes de servidor por defecto; "use client" solo donde hay interacción.
- El contenido se lee de `content/*.json` en el servidor. Tipos TypeScript escritos a mano en `lib/tipos.ts`, espejo del schema (sin codegen).
- Estado del estudiante: useState/useReducer en memoria, por sesión. Sin librerías de estado y sin persistir nada del estudiante (ni localStorage): usuarios menores de edad, minimización de datos (MOS §7.5). Si recarga, la lección parte de nuevo — aceptable para lecciones de ~20 min en piloto.
- Estilos: Tailwind (ya viene con create-next-app). Cero librerías de UI; componentes propios pequeños.
- Gráfico interactivo: SVG propio. Nada de librerías de charts.
- Analítica: posthog-js (única dependencia nueva permitida; ya está en el stack del MOS §4). Inicializar con autocapture y session recording DESACTIVADOS, sin identify ni PII: solo los 6 eventos exactos de CLAUDE.md con sus propiedades. Clave en `NEXT_PUBLIC_POSTHOG_KEY`; si no existe, la app funciona igual y los eventos se loguean a consola en desarrollo.
- Rutas: `/` (portada), `/diagnostico`, `/leccion/[id]`, `/cierre`.
- Piloto privado por link: sin auth, pero con `robots.txt` (Disallow all) y meta `noindex` en todas las páginas.
- Si una lección está en estado distinto de "publicable", el runner la muestra con un banner fijo "DEMOSTRACIÓN — contenido no revisado".

ARQUITECTURA DE COMPONENTES (construir exactamente esto):

- `RunnerLeccion`: orquesta los 10 pasos, barra de progreso, navegación adelante/atrás, dispara `leccion_inicio`, `paso_inicio`, `leccion_fin`.
- Bloques: `BloqueTexto`; `BloquePregunta` (registra el intento ANTES de mostrar feedback); `BloquePistas` (pistas reveladas una a una, evento `pista_usada` por cada una); `BloqueInteractivo` (por ahora renderiza `GraficoPendiente`); `BloqueVisualizacion` (SVG estático).
- `GraficoPendiente` — la interacción insignia, especificación exacta:
  - Plano cartesiano SVG con cuadrícula, ejes rotulados, x ∈ [−10,10], y ∈ [−10,10].
  - Slider m ∈ [−5,5] paso 0.5 y slider b ∈ [−8,8] paso 1; la recta y = mx + b se actualiza en vivo sin lag perceptible.
  - Ecuación visible con los valores actuales resaltando qué número cambia con cada slider.
  - Toggle "ver el cambio": dibuja el triángulo Δx/Δy sobre la recta (la pendiente como razón de cambio, el micro-tema de entrada del MOS).
  - Usable con el pulgar en un teléfono (áreas táctiles ≥ 44px), operable por teclado con flechas, `aria-valuetext` legible ("pendiente 2,5").
- `ItemPAES`: enunciado, 4 alternativas A–D, una sola respuesta por ítem; al responder muestra el feedback del distractor elegido (o confirmación breve si acertó) y botón "Continuar". Evento `item_respuesta` con item_id, correcta, intento, tiempo_ms.
- `Diagnostico`: 5 ítems SIN feedback (es la medición pre; mostrar feedback contaminaría la comparación pre/post del MOS §6) — solo "Respuesta registrada" y avanzar. Pantalla final neutra que invita a la lección 1.
- `Cierre`: 8 ítems CON feedback + pantalla final con resumen simple de aciertos.

DATOS DE DEMOSTRACIÓN (andamiaje técnico, nunca pasa a publicable):
Crea `content/lecciones/l0-demo.json` (estado "revision", título "Lección de demostración"), `content/diagnostico.json` y `content/cierre.json` (estado "revision") con matemática simple pero CORRECTA sobre pendiente, ejercitando todos los tipos de bloque. Deben pasar `npm run validar` — el hook te va a corregir hasta que el contrato completo se cumpla, incluido feedback en cada distractor. Este contenido será reemplazado por el pipeline real (/nueva-leccion); su única función es que la cáscara sea probable de punta a punta hoy.

DIRECCIÓN DE DISEÑO (deliberada; en el plan proponme el sistema de tokens derivado de esto):
El mundo visual del producto es el del propio contenido: el plano cartesiano. Tema claro, fondo casi blanco frío, y una cuadrícula sutil tipo papel milimetrado como textura de fondo en portada y transiciones — esa es la firma visual, ejecutada con disciplina. Un solo color de acento tipo azul tinta, confiable y serio (lo compran apoderados; lo usan estudiantes bajo presión: calma y precisión, no juego). Correcto/incorrecto siempre con color + ícono, nunca solo color. Tipografía: Geist Sans (ya incluida) para interfaz, y Geist Mono para números, ecuaciones y valores de sliders — cifras tabulares, el detalle que hace que la matemática se vea intencional. Jerarquía tipográfica clara con pocos tamaños. Microinteracciones sobrias (transición entre pasos, feedback que aparece con suavidad), `prefers-reduced-motion` respetado. Prohibido explícitamente: gradientes morados, modo oscuro con acento ácido, crema-con-serif genérico, emojis decorativos, estética infantil de gamificación. Textos de interfaz en español de Chile, tono cercano pero serio; los botones dicen exactamente lo que hacen ("Revisar respuesta", "Siguiente paso").

CRITERIOS DE ACEPTACIÓN "PULIDO" (revísalos uno por uno antes de declarar terminado; repórtame el resultado de cada uno):
1. Todo usable a 360px de ancho (los estudiantes llegan por WhatsApp desde el teléfono); verificado también a 768 y 1280.
2. Navegación completa por teclado con focus visible; contraste AA; sliders y alternativas con aria correcto.
3. Sin layout shift perceptible: SVG y contenedores con dimensiones reservadas.
4. Estados cubiertos: contenido JSON inválido (error claro en dev), lección inexistente (404 amable), PostHog ausente (funciona igual).
5. Los 6 eventos PostHog disparan con los nombres y propiedades exactos de CLAUDE.md — demuéstralo con logs de consola.
6. Cero `any`, componentes < 200 líneas, cero dependencias fuera de posthog-js.
7. `npm run validar`, `npm run lint`, `npm run build` en verde.
8. README.md corto: cómo correr, dónde vive el contenido, cómo se despliega en Vercel.

ORDEN DE TRABAJO CON CHECKPOINTS (detente y espera mi confirmación en cada uno):
1. Plan detallado en plan mode (incluye el sistema de tokens de diseño) → apruebo.
2. Tipos + carga de contenido + datos demo pasando `npm run validar` → checkpoint.
3. Runner + bloques básicos navegables en localhost → checkpoint.
4. `GraficoPendiente` terminado → checkpoint (lo pruebo en mi teléfono).
5. Diagnóstico + ItemPAES + Cierre + PostHog → checkpoint.
6. Pase final contra los 8 criterios de aceptación + README → commit final con mensaje en español.

NO CONSTRUYAS nada de la lista negra de CLAUDE.md aunque parezca una mejora rápida (login, pagos, dashboard, persistencia de progreso, tutor IA, etc.). Alcance cerrado = velocidad.

---

## PROMPT 2 — Pase de pulido (usar DESPUÉS de probar el MVP tú mismo)

Acabo de probar el MVP completo en mi teléfono y en desktop. Antes de tocar código:

1. Aquí está mi lista de problemas encontrados, en mis palabras: [PEGA AQUÍ TU LISTA — sé específico: "el slider se siente duro con el pulgar", "el feedback aparece muy abajo y no se ve", "la portada no me da confianza para pagar"].
2. Reproduce cada problema, clasifícalo (bug / fricción de UX / diseño) y proponme la corrección mínima de cada uno. No corrijas todavía.
3. Además, vuelve a auditar los 8 criterios de aceptación del PROMPT 1 y repórtame cuáles fallan hoy, con evidencia.
4. Priorizamos juntos y recién ahí ejecutas, un commit por grupo de correcciones.

Regla del pase: eliminar fricción y ruido, no agregar features. Si una corrección te tienta a agregar algo nuevo, proponla como candidata post-gate y sigue.

---

## Qué NO cubre este prompt (y la secuencia completa hasta el MVP real)

Este prompt produce la **cáscara técnica al 100%** con contenido de demostración. Lo que convierte esa cáscara en EL producto es el contenido real, y ese **no sale de ningún prompt de una pasada** — sale del pipeline con tu criterio pedagógico y doble revisión:

1. **Cáscara** → PROMPT 1 (esta sesión, con checkpoints).
2. **Contenido real** → 4 sesiones: `/sesion` → `/nueva-leccion l1-…` → tú apruebas el insight del paso "descubrimiento" → redacción → `/revision-matematica` → `/revision-originalidad` → publicable. Lo mismo para diagnóstico y cierre reales.
3. **Pulido** → PROMPT 2 con tu lista de problemas reales.
4. **Deploy** → Vercel + link privado → piloto (Test B del MOS), con la preventa (Test A) corriendo en paralelo desde ya, sin código.

Un "mega-prompt" que intentara hacer 1 y 2 juntos te daría exactamente lo contrario de pulido: contenido mediocre dentro de una app apurada. La separación es la calidad.
