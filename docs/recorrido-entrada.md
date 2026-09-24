# Recorrido de entrada de Fobos

Plan de construcción para Claude Code. Versión 1, septiembre 2026.
Vive en `docs/recorrido-entrada.md`. Es la única fuente de verdad de este trabajo: CC no depende del historial del chat, depende de este archivo y de su Bitácora (§9).

---

## 0. Cómo se usa

**Benja.** Una fase por sesión. Entre fases, `/clear`. Pegas siempre el mismo prompt (abajo) cambiando solo el número. Revisas el reporte final, firmas y sigues.

**CC.**
1. Lee este archivo completo al empezar: §0, la fase que toca y la Bitácora.
2. Lee solo los archivos que la fase lista en "Leer". Si necesitas otro, dilo y explica por qué antes de abrirlo.
3. Nunca marcas tu propia fase como aprobada. La aprueba Benja.
4. Al terminar, agregas tu entrada a la Bitácora (§9): commits, salida cruda de validar/tsc/lint/test:unit con números, decisiones que tomaste, lo que quedó pendiente.

**Semáforo.**
- 🟢 CSS, tokens, docs: CC ejecuta y reporta al final.
- 🟡 Cambios estructurales o de props: CC muestra el plan (archivos, cambios, riesgos) y espera "ok".
- 🔴 JSON de `content/`, schema, migraciones, git push: requieren firma de Benja. CC nunca hace push ni corre migraciones ni scripts que escriben en Neon.

**Commits.** Propósito único, prefijo `recorrido:` (código) o `docs:` (este archivo y la Bitácora). `git add` por ruta, nunca `-A`. Sin `Co-Authored-By`. Nada en `content/lecciones/`, `components/leccion/` ni `components/camino/`: si una fase parece necesitarlo, CC para y propone otra vía.

**Prompt único (Benja pega esto, cambiando N):**

```
Fase N del recorrido de entrada.
Lee docs/recorrido-entrada.md: §0, la Fase N y la Bitácora (§9).
Lee solo los archivos que la Fase N pide. Si necesitas otro, pregúntame antes.
Respeta el color de semáforo de la fase: si es 🟡, muéstrame el plan y espera mi ok.
Al terminar: corre npm run validar, tsc, lint y test:unit, pega la salida cruda,
agrega tu entrada a la Bitácora y commitéala con docs:. Sin push.
```

---

## 1. El recorrido en una página

Hay dos puertas. Después de crear la cuenta, todos pasan por lo mismo.

**Puerta A, con video.** Video en Instagram → link (bio hoy, DM con ReplyRush más adelante) → página pública del error, sin cuenta → responde → botón "Empieza tu prueba gratuita de 7 días" → cuenta con Clerk → bienvenida con 3 preguntas → "Así funciona Fobos" → primera parada → portada "Empieza aquí".

**Puerta B, sin video.** Link directo, landing o correo de apertura, o un amigo con cortesía → cuenta con Clerk → bienvenida con 2 preguntas → "Así funciona Fobos" → primera parada → portada "Empieza aquí".

Para que la puerta B no se sienta vacía:
1. La pantalla "Así funciona Fobos" explica en una sola vista qué hay: 4 líneas, 16 estaciones, lecciones, diagnóstico y Advance.
2. La portada muestra una tarjeta "Una trampa típica de la PAES" que lleva a la misma página pública del error. Quien no vio el video vive igual ese momento.
3. La checklist de primeros pasos le deja claro qué hacer los primeros días.

Lo que NO entra: tour de tarjetas al entrar, rachas, XP, badges, confeti, planes de estudio automáticos, chatbot. Tampoco el panel 2×2: hoy no tiene llamador en producción (requiere modo clásico) y solo se ve en `/_design` con datos de muestra.

---

## 2. Restricciones

- Todo en plan gratis: Vercel, Neon, PostHog, Clerk en instancia de desarrollo hasta que se pase a producción.
- Alumnos de 16 a 18 años. Sin datos personales en eventos. Nada de urgencia falsa ni presión de venta. Sin promesas de puntaje. Los números describen la prueba, nunca al alumno.
- Pensado para celular, 390 px de ancho.
- Textos en español chileno, sin voseo, sin guiones largos como conectores.
- No hay pasarela de pago todavía. La pantalla de elegir plan se construye igual, con los botones en estado "próximamente".
- Advance está detrás de `NEXT_PUBLIC_ADVANCE_VISIBLE`. Para que alguien lo vea en producción, Benja lo activa en Vercel.

---

## 3. Decisiones de arquitectura

Estado de todas: **Propuesto**. Decide: **Benja**.

### ADR-01: Página pública del error con lista blanca en código

**Contexto.** El video necesita un destino que funcione sin cuenta y que use una pregunta real. Los ítems viven en el banco de Advance de porcentaje y el nombre del error en su catálogo.

**Decisión.** Ruta `/error/[unidadId]/[errorId]`. Una lista blanca en `lib/recorrido/erroresPublicos.ts` dice qué errores son públicos y qué ítem usa cada uno (`{ unidadId, errorId, itemId }`). La página lee el ítem y el catálogo que ya existen; no se crea ni se modifica nada en `content/`. Alternativas en orden fijo, sin mezclar, para que coincidan con el video. Cualquier ruta fuera de la lista da 404.

**Opciones consideradas.** Copiar el ítem a un JSON nuevo de contenido público: duplica contenido y exige firma 🔴 por cada página. Marcar ítems como públicos en el banco: toca el schema. La lista en código no toca nada de eso.

**Consecuencias.** Agregar una página nueva es agregar una línea a la lista. El ítem elegido queda visible para cualquiera; se acepta, es uno solo.

### ADR-02: "De dónde vino" en una cookie propia

**Contexto.** El alumno sale del sitio para crear su cuenta con Google y vuelve. Hay que recordar si venía de un video y de cuál.

**Decisión.** Al tocar el botón de la página pública se guarda la cookie `fobos_origen` con tres datos: unidad, error y video (el `utm_content` del link). Dura 7 días. No tiene nada personal. `/bienvenida` la lee, la guarda en la base y la borra. Sin cookie, la bienvenida sigue la puerta B.

**Consecuencias.** Funciona igual con Google o con correo. Se anota en `docs/inventario-datos.md`.

### ADR-03: Respuestas de la bienvenida en Neon, no en Clerk

**Contexto.** Hay que guardar las respuestas y saber si alguien ya pasó por la bienvenida.

| | Clerk (metadata del usuario) | Neon (tabla `perfil_inicio`) |
|---|---|---|
| Complejidad | Media: claim en el token, refresco de sesión | Baja: una fila |
| Retraso al leer | Hasta 60 s si no se fuerza el refresco | Ninguno |
| Borrado de cuenta | Aparte | Cae con la cuenta, como el resto |
| Encaje con lo que ya existe | Nuevo patrón | Mismo patrón que `entitlements` |

**Decisión.** Tabla `perfil_inicio`. "Ya hizo la bienvenida" significa "existe su fila". La portada revisa eso en el servidor y, si no existe, manda a `/bienvenida`. No se usa metadata de Clerk.

**Consecuencias.** Un solo lugar para los datos del alumno. Requiere una migración 🔴.

### ADR-04: La prueba de 7 días nace al entrar a /bienvenida

**Contexto.** El acceso de prueba tiene que existir apenas el alumno termina de registrarse.

| | Webhook `user.created` de Clerk | Al cargar `/bienvenida` |
|---|---|---|
| Momento | Llega cuando llega, puede atrasarse | Inmediato |
| Riesgo | Carrera: el alumno entra antes que el acceso | Ninguno si es idempotente |
| Complejidad | Media | Baja |

**Decisión.** `asegurarPrueba(userId)` corre en el servidor al cargar `/bienvenida`. Es idempotente: si el usuario ya tiene cualquier acceso vigente (prueba, cortesía o compra), no hace nada. Si no, crea una fila en `entitlements` con origen `prueba`, 7 días exactos desde ese momento. Si la fila de `usuarios` todavía no existe porque el webhook no llegó, se crea con el mismo upsert que usa el webhook. Una restricción en la base impide dos pruebas para el mismo usuario.

**Consecuencias.** Tu amigo recibe una cortesía hasta el 30 de noviembre con un script que corre Benja; como ya tiene acceso vigente, no se le crea prueba, pero igual pasa por la bienvenida.

### ADR-05: Medición sin cookies de PostHog

**Contexto.** Hoy PostHog guarda todo en memoria, sin cookies, por decisión de privacidad para menores. Hay dos inicializaciones en el repo (`instrumentation-client.ts` y `PostHogProvider`) y hay que dejar una sola.

| | Activar cookies de PostHog | Mantener memoria + cookie propia |
|---|---|---|
| Une visita anónima con la cuenta | Sí | No, se mide por video |
| Privacidad | Peor | Igual que hoy |
| Cambios | Revisar política e inventario | Mínimos |

**Decisión.** Se mantiene sin cookies de PostHog. Una sola inicialización con `autocapture: false`, `capture_pageview: false`, `disable_session_recording: true`, `persistence: "memory"`. Con sesión iniciada, `identify` con el id de Clerk (un código, nunca correo ni nombre) en cada carga. `reset` al cerrar sesión. El video de origen viaja como propiedad de los eventos desde la cookie `fobos_origen`.

**Consecuencias.** El embudo "video → cuenta" se lee comparando conteos por video, no persona por persona. Suficiente para saber qué video funciona.

### ADR-06: Fin de la prueba con pantalla de elegir plan

**Decisión.** Toda página de lecciones, diagnóstico, cierre y Advance revisa en el servidor si hay acceso vigente (`lib/recorrido/acceso.ts`). Sin acceso, redirige a `/elegir-plan`. El progreso nunca se borra. Mientras no haya pasarela, los botones de plan muestran "El pago se habilita pronto. Te avisamos por correo."

**Consecuencias.** Esto cierra el acceso libre que existía. Se puede construir ya; su efecto real llega cuando haya alumnos con prueba. El chequeo va en las páginas (`app/...`), no en los componentes protegidos.

---

## 4. Textos (firmados por Benja)

### Página pública del error

- Título de la pestaña y vista previa del link: "La trampa del video: pruébala tú · Fobos"
- Encabezado: "La trampa del video" / "Porcentaje · 1 pregunta · sin cuenta"
- Botón para responder: "Responder"

Después de responder hay tres casos. `[X]` es la letra de la alternativa del error del video, `[C]` la correcta.

**Eligió la alternativa del error del video:**
> **Elegiste la alternativa más tentadora.**
> Parece que subir y bajar el mismo porcentaje se cancela. No se cancela: la bajada se calcula sobre un precio más grande, así que baja más de lo que subió.
> [solución paso a paso del banco]

**Eligió la correcta:**
> **Bien, no caíste.**
> La trampa estaba en la [X]: [feedback de ese distractor en el banco].
> [solución paso a paso del banco]

**Eligió otra incorrecta:**
> **Esa alternativa viene de otro error, distinto al del video.**
> [feedback de ese distractor en el banco]
> La trampa del video estaba en la [X]. La correcta es la [C]:
> [solución paso a paso del banco]

**Cierre, igual en los tres casos:**
> En Fobos, cada alternativa incorrecta tiene detrás un error con nombre. En porcentaje hay [N] más como este.

N = ids del catálogo de porcentaje menos 1, calculado desde el catálogo, nunca escrito a mano.

- Botón: **"Empieza tu prueba gratuita de 7 días"**
- Bajo el botón: "Al terminar eliges si sigues con Base, con Advance o si prefieres no seguir. No se cobra nada automáticamente."
- Si ya tiene sesión, el botón dice "Ir a Fobos" y lleva a la portada.
- Pie: el disclaimer del layout (independiente de DEMRE) ya cubre la página.

### Instagram

- Hoy, cierre del video: "Hay [N] errores comunes más sobre porcentajes. Están todos en el link de la bio." El link de la bio apunta a la página pública con `utm_medium=bio`.
- Cuando se integre ReplyRush (pendiente, otro chat), cierre del video: "¿Caíste? Comenta PORCENTAJE y te mando la pregunta." DM: "Acá está la pregunta del video: [link]. Es gratis y no necesitas cuenta para responderla."
- Convención de links: `?utm_source=instagram&utm_medium=bio|dm|historia&utm_content=v001-deshace-porcentaje`

### Registro

- Título: "Crea tu cuenta y empieza tu prueba de 7 días"
- Bajo el formulario de Clerk: "Al terminar eliges si sigues con Base, con Advance o si prefieres no seguir. No se cobra nada automáticamente."

### Bienvenida

Arriba de la primera pregunta, según el acceso:
- Prueba: "Listo. Tu prueba de 7 días empezó hoy y termina el [fecha]. Tienes todo Fobos, Advance incluido."
- Cortesía: "Listo. Tienes todo Fobos, Advance incluido, hasta el 30 de noviembre."

Preguntas, una por pantalla, con "1 de 3" (o "1 de 2") y un link "Saltar":
1. "¿Cómo te llevas con las matemáticas?" · Me cuestan harto · Más o menos · Me va bien
2. "¿Qué quieres hacer primero?" · Entender desde la base · Practicar como en la prueba · Encontrar mis errores
3. Solo puerta A: "Llegaste por la trampa de porcentaje. ¿Sigues con porcentaje?" · Sí, sigamos con porcentaje · No, prefiero ver otra cosa

Link fijo abajo: "Prefiero explorar por mi cuenta" (va a la portada).

### Así funciona Fobos (una sola pantalla, para las dos puertas)

- Título: "Así funciona Fobos"
- "La PAES M1 tiene 4 ejes. En Fobos son 4 líneas de metro y cada unidad es una estación. Son 16."
- [las 4 líneas con sus colores y el nombre de cada eje]
- **Lecciones.** Aprendes cada estación desde la base. Primero descubres el patrón, después viene la regla.
- **Diagnóstico.** Te dice en qué estaciones estás firme y en cuáles no. No es una nota.
- **Advance.** Practicas como en la prueba: descartas alternativas y Fobos anota en qué error caes.
- Botón: "Ver mi primera parada"
- Se puede volver a abrir desde la portada con el link "Cómo funciona Fobos".

### Primera parada

- Tarjeta: "Tu primera parada" · [Lección / Diagnóstico / Descarte en Advance] · [estación] · Línea [n] · unos [m] minutos
- Motivo, según el caso (§5): 
  - "Porque dijiste que te cuestan: conviene partir por la base."
  - "Porque quieres entender desde la base."
  - "Porque quieres practicar como en la prueba: el diagnóstico te dice por dónde partir."
  - "Porque quieres encontrar tus errores: el descarte los va anotando."
- Botón: "Ir a mi primera parada"
- "O si prefieres:" [dos alternativas]
- "Puedes ir a cualquier parte cuando quieras. Esto es solo un punto de partida."

### Portada "Empieza aquí" (alumno nuevo)

Arriba, mientras no haya empezado: la tarjeta de su primera parada. Cuando ya empezó, la portada de siempre ("Continuar la lección").

**Tus primeros pasos** (se marcan solos, se puede ocultar):
1. Haz tu primera parada
2. Haz el diagnóstico
3. Haz tu primer descarte en Advance. Si respondió "Me cuestan harto": "Cuando termines tu primera lección, haz tu primer descarte en Advance"
4. Revisa tus errores

Al completar: "Listo. Ya conoces lo principal de Fobos." · "Ocultar"

**Una trampa típica de la PAES:** "¿Subir 20% y bajar 20% te deja igual? Pruébalo en una pregunta." Botón: "Probar". Lleva a la página pública del error. Si hay varias en la lista blanca, rota una por semana.

**Estado de la prueba:** "Tu prueba termina el [fecha]. Te quedan [n] días." Sin cuenta regresiva ni colores de alarma. Con cortesía: "Tu acceso dura hasta el 30 de noviembre."

Link: "Cómo funciona Fobos"

### Ayudas (aparecen solo la primera vez, se cierran con "Entendido")

- Descarte en Advance: "Aquí no basta con marcar la correcta. Descarta las alternativas que sabes que están malas. Así Fobos ve en qué error caes."
- Tus errores: "Cada error pasa por tres fases: abierto, en observación y cerrado. Se cierra cuando aciertas varias veces, con al menos un día entre aciertos."
- Diagnóstico: "No es una nota. Sirve para saber por qué estación empezar."

### Pantallas vacías

- Tus errores, sin datos: "Todavía no tienes errores anotados. Aparecen cuando practicas en Advance." Botón: "Practicar [unidad de origen, o porcentaje]"

### Fin de la prueba

- Aviso del día 6, una vez: "Tu prueba termina mañana. Al terminar eliges si sigues con Base, con Advance o si prefieres no seguir. Tu progreso queda guardado."
- Pantalla `/elegir-plan`:
  - Título: "Tu prueba terminó"
  - "Tu progreso quedó guardado. Si sigues, partes desde donde quedaste."
  - **Fobos Base · $9.990 · pago único.** Las 16 unidades de M1 con lecciones de descubrimiento y preguntas formato PAES con feedback por cada alternativa. Acceso hasta el 30 de noviembre.
  - **Fobos Advance · $14.990 · pago único · Recomendado.** Todo lo de Base más los 5 sistemas para aprender a rendir la prueba. Acceso hasta el 30 de noviembre.
  - "Sin renovación ni cobros automáticos."
  - Botones: "Seguir con Base" · "Seguir con Advance" · link "No seguir por ahora"
  - Al tocar un plan, mientras no haya pasarela: "El pago se habilita pronto. Te avisamos por correo."
  - Al tocar "No seguir por ahora": "Tu cuenta y tu progreso quedan guardados. Puedes volver cuando quieras."

---

## 5. Primera parada: reglas

Regla que manda sobre todas: **"Me cuestan harto" siempre lleva a una lección de base.** Nunca a Advance.

La unidad es la de origen si respondió "Sí" en la pregunta 3. Si no hay unidad de origen, se usa la primera estación de la Línea 01 sin prerrequisitos en `content/diagnostico/dag-m1.json`.

| ¿Cómo se lleva? | ¿Qué quiere? | Primera parada | Alternativas |
|---|---|---|---|
| Me cuestan harto | cualquiera | Lección de base de la unidad | Diagnóstico · Cómo funciona Fobos |
| Más o menos | Entender desde la base | Lección de base de la unidad | Diagnóstico · Cómo funciona Fobos |
| Más o menos | Practicar como en la prueba | Diagnóstico | Lección de base · Cómo funciona Fobos |
| Más o menos | Encontrar mis errores | Descarte en Advance de la unidad de origen; sin origen, Diagnóstico | Lección de base · Diagnóstico |
| Me va bien | Entender desde la base | Lección de base de la unidad | Descarte en Advance · Diagnóstico |
| Me va bien | Practicar como en la prueba | Descarte en Advance de la unidad de origen; sin origen, Diagnóstico | Diagnóstico · Lección de base |
| Me va bien | Encontrar mis errores | Descarte en Advance de la unidad de origen; sin origen, Diagnóstico | Tus errores · Diagnóstico |
| Saltó | | Con origen, lección de base de esa unidad; sin origen, Diagnóstico | Cómo funciona Fobos |

Si Advance no está visible (`NEXT_PUBLIC_ADVANCE_VISIBLE` apagado), toda parada de Advance cae a Diagnóstico.

Una sola recomendación, sin fechas ni secuencia. Se guarda qué se recomendó para medir si sirvió.

---

## 6. Eventos de PostHog

Tipados en `lib/eventos.ts`. Ninguna propiedad acepta correo, nombre, RUT, colegio ni texto libre.

| Evento | Cuándo | Propiedades |
|---|---|---|
| `error_publico_visto` | Carga la página pública | `unidad_id`, `error_id`, `item_id`, `video` |
| `error_publico_respondido` | Responde | `unidad_id`, `error_id`, `item_id`, `resultado` (correcta / tentadora / otra), `video` |
| `cta_prueba_clic` | Toca el botón de la prueba | `unidad_id`, `error_id`, `resultado`, `video` |
| `cuenta_creada` | Primera carga de `/bienvenida` | `entrada` (video / directa), `video`, `acceso` (prueba / cortesia / compra) |
| `bienvenida_respondida` | Termina o salta | `p1`, `p2`, `p3`, `saltada`, `entrada` |
| `primera_parada_iniciada` | Entra a una parada desde la tarjeta | `tipo`, `destino`, `fue_la_recomendada` |
| `checklist_item_completado` | Se marca un paso | `item` |
| `ayuda_cerrada` | Cierra una ayuda | `seccion` |
| `prueba_aviso_visto` | Ve el aviso del día 6 | ninguna |
| `elegir_plan_visto` | Carga `/elegir-plan` | `acceso_previo` |
| `plan_elegido_clic` | Toca una opción | `plan` (base / advance / no_seguir) |

Embudos que Benja arma en PostHog al final:
1. **Qué video funciona:** `error_publico_visto` → `error_publico_respondido` → `cta_prueba_clic`, separado por `video`. Aparte, `cuenta_creada` con `entrada = video`, contado por `video`.
2. **Activación:** `cuenta_creada` → `bienvenida_respondida` → `primera_parada_iniciada` → `checklist_item_completado` (item = descarte), separado por `p1`.

---

## 7. Fases

Estimación total: unas 14 sesiones. Tu amigo puede entrar al terminar la Fase 5, con su cortesía.

### Fase 0 · Reconocimiento · 🟢 · 1 sesión

**Objetivo.** Mapear el terreno sin cambiar código. Responder estas preguntas en la Bitácora, con rutas y líneas:
1. Versiones de Next y `@clerk/nextjs`. Qué rutas exigen sesión hoy y cómo (`proxy.ts` o `middleware.ts`, `auth()` en páginas).
2. Ruta actual de registro e inicio de sesión de Clerk y sus variables de redirección.
3. Cómo se crean las filas de `usuarios` (webhook `user.created`) y qué upsert usa.
4. Valores de `producto` y `origen` en `entitlements` (código y CHECK de la migración 004), cómo decide `tieneAcceso` y cómo se deriva la temporada de Advance.
5. Qué inicialización de PostHog está activa y con qué opciones. Si hay dos, cuál se carga primero.
6. Qué muestra `app/page.tsx` a un usuario con sesión y sin progreso, y a uno sin sesión.
7. Dónde se guarda el progreso de lecciones (con y sin sesión).
8. Número de ids del catálogo de errores de porcentaje (para N).
9. Ítems del banco Advance de porcentaje con un distractor cuyo `errorCatalogado` es `deshace-porcentaje-con-mismo-porcentaje`: id, primera línea del enunciado y letra de ese distractor. Benja elige uno.
10. Primera estación de la Línea 01 sin prerrequisitos en `dag-m1.json`. Rutas de la lección de base de porcentaje, del diagnóstico, de `/advance/descarte/[unidadId]` y de `/advance/errores`.
11. Línea base: número de tests, tsc y lint.

**Además.** Commitea este archivo como `docs/recorrido-entrada.md` con `docs:`.
**Leer.** Lo que haga falta para responder, solo lectura.
**Aceptación.** Las 11 respuestas en la Bitácora. Cero cambios de código.

### Fase 1 · Medición · 🟡 · 1 sesión

**Objetivo.** Una sola inicialización de PostHog según ADR-05 y los eventos de §6 tipados.
**Leer.** `instrumentation-client.ts`, `components/analytics/PostHogProvider.tsx`, `lib/eventos.ts`, `app/layout.tsx`, `docs/inventario-datos.md`.
**Hacer.**
- Dejar una sola inicialización, con la configuración de ADR-05. Mantener el proxy `/ingest` si existe.
- Agregar los tipos de §6 a `lib/eventos.ts`.
- Componente que, con sesión, llama `identify(userId)` en cada carga, y `reset` al cerrar sesión.
- Agregar al inventario de datos el id de Clerk en PostHog y la cookie `fobos_origen`.

**Aceptación.** En la pestaña Red no hay autocapture ni grabación. Un test falla si un evento acepta `email` o `nombre`. Los eventos existentes siguen saliendo igual.

### Fase 2 · Página pública del error · 🟡 · 2 sesiones

**Objetivo.** ADR-01 y ADR-02 con los textos de §4.
**Leer.** La Bitácora de la Fase 0, el banco Advance de porcentaje, su catálogo, `lib/advance/banco.ts`.
**Hacer.**
- `lib/recorrido/erroresPublicos.ts` con una entrada: el ítem que eligió Benja.
- `app/error/[unidadId]/[errorId]/page.tsx`: sin sesión, alternativas en orden fijo, tres casos de respuesta, cierre con N calculado, botón que guarda `fobos_origen` y va al registro. Con sesión, "Ir a Fobos".
- Metadatos para la vista previa del link. Se mantiene `noindex`.
- Eventos `error_publico_visto`, `error_publico_respondido`, `cta_prueba_clic`.

**Aceptación.** Abre sin sesión a 390 px, sin cortes. Los tres casos muestran el feedback correcto del banco (test por caso). El botón aparece solo después de responder. Ruta fuera de la lista da 404. Cero cambios en `content/`.

### Fase 3 · Datos · 🔴 · 1 sesión

**Objetivo.** CC escribe; Benja revisa y aplica.
**Hacer.**
- Migración nueva: agrega `prueba` a los valores de `entitlements.origen`, con restricción de una sola prueba por usuario. Crea `perfil_inicio` (`usuario_id`, `p1`, `p2`, `p3`, `saltada`, `unidad_origen`, `error_origen`, `video`, `parada_tipo`, `parada_destino`, `creado_en`) con borrado en cascada desde `usuarios` y los permisos mínimos para `app_m1`.
- `scripts/otorgar-cortesia.mjs <correo> <hasta>`: crea una cortesía. Lo corre Benja.

**Aceptación.** SQL en el diff para revisión. Tests de la restricción de una sola prueba. CC no corre la migración ni el script.

### Fase 4 · Cuenta y bienvenida · 🟡 · 3 sesiones

**Objetivo.** ADR-03 y ADR-04, la bienvenida completa y la regla de §5.
**Leer.** Bitácora de las fases 0 a 3, rutas de Clerk, `lib/datos/entitlements.ts`.
**Hacer.**
- Registro que siempre termina en `/bienvenida`. Inicio de sesión que termina en la portada.
- `/bienvenida` en servidor: asegura usuario, `asegurarPrueba`, lee `fobos_origen`. Pantallas: preguntas (2 o 3), "Así funciona Fobos", primera parada. Guardado en `perfil_inicio`, borra la cookie.
- `lib/recorrido/primeraParada.ts`: función pura con la tabla de §5.
- La portada manda a `/bienvenida` a quien tiene sesión y no tiene `perfil_inicio`.
- `/como-funciona` reutiliza la pantalla "Así funciona Fobos".
- Eventos `cuenta_creada`, `bienvenida_respondida`.

**Aceptación.** Tests de `primeraParada` para todas las combinaciones, incluida "saltó" y Advance apagado. "Me cuestan harto" nunca devuelve Advance. Recargar `/bienvenida` no crea una segunda prueba. Con cortesía no se crea prueba y el encabezado cambia. "Saltar" funciona en cada pregunta.

### Fase 5 · Portada "Empieza aquí" · 🟡 · 2 sesiones

**Objetivo.** La portada de §4 para alumnos nuevos.
**Hacer.** Componentes nuevos en `components/recorrido/`, montados desde `app/page.tsx`: tarjeta de primera parada, "Tus primeros pasos" (estado calculado desde la actividad real; "Revisa tus errores" se marca al visitar la página), "Una trampa típica de la PAES", estado de la prueba y link "Cómo funciona Fobos". Evento `primera_parada_iniciada` y `checklist_item_completado`. Si montar algo exige tocar `components/camino/`, CC para y propone otra vía.
**Aceptación.** A 390 px la primera parada se ve sin hacer scroll. La portada de alguien con progreso sigue igual que hoy, más la checklist mientras no esté completa u oculta.

**Al cerrar esta fase:** Benja aplica la migración, corre `otorgar-cortesia` para su amigo, activa Advance en Vercel si quiere que lo vea, y le pasa el link de registro.

### Fase 6 · Ayudas y pantallas vacías · 🟡 · 1 sesión

**Hacer.** Componente de ayuda que se muestra una vez por sección (se recuerda en `localStorage`), montado en descarte de Advance, tus errores y diagnóstico. Pantalla vacía de tus errores. Evento `ayuda_cerrada`. Si el diagnóstico vive en una carpeta protegida, la ayuda se monta desde la página.
**Aceptación.** Ninguna ayuda aparece dos veces. Cada pantalla vacía tiene un solo botón.

### Fase 7 · Acceso y fin de prueba · 🟡 · 2 sesiones

**Objetivo.** ADR-06.
**Hacer.** `lib/recorrido/acceso.ts` con `accesoVigente(userId)`. Chequeo en las páginas de lecciones, diagnóstico, cierre y Advance: sin sesión, al registro; sin acceso vigente, a `/elegir-plan`. Aviso del día 6. Pantalla `/elegir-plan` con los textos de §4. Eventos `prueba_aviso_visto`, `elegir_plan_visto`, `plan_elegido_clic`.
**Aceptación.** Con reloj simulado: día 7 con acceso, día 8 a `/elegir-plan` con el progreso intacto. Vigencia hasta exclusiva. Cortesía hasta el 30 de noviembre sin aviso de prueba. Ningún texto con urgencia.

### Fase 8 · Prueba completa · 🟢 · 1 sesión

**Hacer.** CC escribe `docs/recorrido-prueba-manual.md` con los tres caminos paso a paso y lo que se debe ver en cada pantalla. Benja lo recorre en su celular:
1. Puerta A: `/error/porcentaje/deshace-porcentaje-con-mismo-porcentaje?utm_source=instagram&utm_medium=bio&utm_content=v001-deshace-porcentaje`
2. Puerta B: link directo al registro.
3. Cortesía: una cuenta con `otorgar-cortesia`.

Después, Benja arma los dos embudos de §6 en PostHog.

---

## 8. Fuera de este plan

- ReplyRush para el comentario a DM: pendiente, se ve en otro chat.
- Pasarela de pago y el cobro real de los planes.
- Clerk en producción y dominio propio.
- Revisión legal corta (Ley 21.719) de la analítica y la política de privacidad antes de abrir.
- Más páginas públicas de error: una línea por video en la lista blanca.
- Panel 2×2: sigue fuera de producción. En `/_design`, con las cuatro líneas lado a lado, la columna derecha de cada panel se sale de su tarjeta; se arregla cuando el panel tenga llamador real.

---

## 9. Bitácora

CC agrega una entrada al cerrar cada fase. Formato:

```
### Fase N · fecha
Commits: hash mensaje
Validar / tsc / lint / test:unit: salida cruda resumida con números
Decisiones tomadas:
Pendiente:
```

(vacía)
