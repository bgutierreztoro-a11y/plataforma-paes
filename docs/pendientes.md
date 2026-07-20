# Pendientes técnicos

## Migración de `content/lecciones/l1-patrones-de-cambio.json` — hecha, pendiente de re-certificación humana

**Resuelto estructuralmente el 2026-07-08.** El archivo usaba una forma ad-hoc (`"interaccion": {...}` anidada) que no coincidía con los bloques discriminados por `tipo` de `content/schema/leccion.schema.json`. Se migró a la forma del schema (`prediccion`, `seleccion`, `numerica`, `verdaderoFalso`, `abierta`, `pistas`, `texto`), preservando enunciados, números, alternativas y feedback exactos — transformación de forma, no de contenido. `npm run validar` pasa, y `idsDeLecciones()` ya no la excluye de `generateStaticParams()`: `/leccion/l1-patrones-de-cambio` se genera y navega correctamente.

Decisiones tomadas durante la migración (todas confirmadas con el autor del proyecto antes de ejecutar):
- `l1-item-1` se migró en su versión del JSON (fichas de juego de mesa, backward-solve), no la del guión original (`leccion-1-guion.md`, estanque con filtración) — el guión quedó obsoleto en ese ítem tras dos rechazos de `/revision-originalidad` por cercanía con DEMRE Forma113, documentados en `proveniencia`.
- El paso 8 (aplicación), que combinaba una pregunta abierta y una numérica en un solo bloque tipo `"mixta"` (inexistente en el schema), se dividió en dos bloques secuenciales dentro del mismo paso — mismo texto exacto, solo reorganizado.
- Notas internas sin campo equivalente en el schema (`notaDiseno` fuera de bloques `abierta`, verificaciones aritméticas de control) se preservaron en `_notasInternas` a nivel de cada `paso` (que sí admite campos extra), en vez de perderse.
- Se creó `catalogoErrores` con los 2 errores que la propia lección nombra en su cierre ("olvidar el valor inicial", "contar mal los saltos"), referenciados vía `errorCatalogado` donde el feedback ya existente coincide claramente.
- `estado` quedó en `"revision"` (no `"publicable"`); `checklistOriginalidad` y `revisionMatematica` se resetearon a sin confirmar, porque una migración estructural hecha por IA no reemplaza la re-certificación humana línea por línea contra el original.

**Adición fuera de lo estrictamente pedido, a revisar**: además de los 2 errores del catálogo, se agregó `errorCatalogado` a algunas alternativas de `itemsPAES` cuyo feedback ya existente coincidía claramente con esos errores (no se tocó ningún texto, solo se sumó la referencia). Confirmar si se quiere mantener.

**Pendiente real, ahora**: revisión humana línea por línea del archivo migrado contra `leccion-1-guion.md` y la versión anterior, y volver a correr `/revision-matematica` y `/revision-originalidad` antes de reactivar `"estado": "publicable"`.

## Limitación de schema: `habilidad` no admite valores compuestos en `itemsPAES`

`content/schema/leccion.schema.json` define `habilidad` como `enum` de un solo valor (`resolver` | `modelar` | `representar` | `argumentar`). El guion de Lección 1 (`leccion-1-guion.md`) pide habilidad compuesta para dos de sus tres ítems de cierre: "Resolver problemas / Representar" (Ítem 1) y "Argumentar / Representar" (Ítem 3). El schema actual no tiene forma de expresar eso sin admitir un array.

**Solución temporal aplicada (auditoría de fidelidad, 2026-07-08):** en `content/lecciones/l1-patrones-de-cambio.json` se conservó solo la habilidad principal (`resolver`, `argumentar`) para `l1-item-1` y `l1-item-3`, y se documentó la pérdida de la etiqueta secundaria "Representar" en `proveniencia.declaracionOriginalidad`. No se pudo usar `_notasInternas` por ítem porque el objeto `item` del schema tiene `additionalProperties: false`.

**Pendiente para Lección 3 o 4:** evaluar explícitamente si conviene ampliar `habilidad` a `array` (mínimo 1 elemento) en `content/schema/leccion.schema.json`, o mantener el patrón actual (una sola habilidad principal, secundaria documentada en proveniencia) de forma consciente y consistente en todas las lecciones. No decidir por default o por inercia.

## Catálogo de errores: solo cubre errores computacionales, no discriminación de tipo de crecimiento

`catalogoErrores` de `l1-patrones-de-cambio.json` (`error-1` a `error-4`) documenta errores computacionales explícitos: olvidar el valor inicial, contar mal los saltos, confundir la dirección al despejar, confundir el signo en un cálculo hacia adelante. Hay una familia de errores distinta que el catálogo no cubre: **discriminar tipo de crecimiento** (confundir crecimiento multiplicativo/exponencial con aditivo; verificar solo algunas diferencias en vez de todas; confundir un patrón con diferencias crecientes —no constante— con cambio constante). Aparece en `l1-item-3` (las 4 alternativas quedaron deliberadamente sin `errorCatalogado`, decisión del 2026-07-08 tras la auditoría de fidelidad) y ya apareció antes, sin etiquetar, en el paso "problema" (Diego con depósitos crecientes) y en el paso "práctica" (bacterias que se duplican).

**No se creó categoría nueva ahora** porque un solo ítem no es caso de uso suficiente para diseñar bien la taxonomía. **Pendiente para Lección 3 o 4:** si este patrón de error se repite, evaluar si amerita un catálogo propio (paralelo a `catalogoErrores`, quizás `catalogoErroresConceptuales`) en vez de forzarlo dentro del catálogo computacional actual.

## Riesgos bajos identificados por auditoría de plantilla sintáctica, pendientes de revisión legal (no reescritos)

La auditoría retroactiva de plantilla sintáctica del 2026-07-08 sobre `l1-patrones-de-cambio.json` encontró dos hallazgos **DUDOSOS** (no bloqueantes, sin colisión de frase literal ni de esqueleto completo) que se decidió **no reescribir ahora**, a diferencia de Paso 8 y del distractor "taxi" (que sí se reescribieron por compartir el esqueleto completo "cobra + fijo + más + tarifa/unidad" que ya había causado dos bloqueos reales):

- **Paso "curiosidad" (bidón que se llena):** familia "contenedor + líquido + tasa lineal por minuto" cercana a `fuentes-analisis-aisladas/demre/paes-m1-2026-forma113.md:366-368` (estanque de 720L vaciándose a 3L/min). Verbo opuesto (llenar vs. vaciar) y mecánica distinta (tabla de descubrimiento vs. fórmula dada).
- **Paso "práctica", distractor "bacterias que se duplican cada hora":** tropo repetido en 3 fuentes del corpus (`pdv-terceros/MA-03_Numeros_Reales.md:178`, `pendiente-clasificar/618-JMA-M1-01-2024.md:230`, `pdv-terceros/MA-34_Potencia_Ecuacion_Exponencial.md:214`), pero es un ejemplo pedagógico universal de crecimiento exponencial, no exclusivo de estas fuentes.

**Decisión (2026-07-08):** quedan documentados aquí como riesgo bajo para que los revise el abogado/a de propiedad intelectual (MOS §7.8) antes de cualquier lanzamiento público, en vez de reescribirse preventivamente sin evidencia de colisión sustancial. Si el abogado los marca como problema, reescribir con el mismo criterio ya usado en Paso 8: cambiar mecanismo o estructura, no solo palabras.

## `itemsPAES` en L1: typo de clave + renderer inexistente — resuelto (2026-07-09)

Detectado originalmente en Playwright end-to-end del checkpoint 3 (2026-07-09).

**Problema 1 — typo de clave: resuelto.** `l1-patrones-de-cambio.json` usaba la clave `paesItems` en vez de `itemsPAES` (la que define el schema). Ya no existe: verificado con grep en todo el repo, la única clave presente es `itemsPAES`.

**Problema 2 — renderer inexistente: resuelto.** El schema describe estos ítems como "Cierre de lección: 2–3 ítems originales formato PAES (solo lecciones)" — distintos del `/cierre` global que usa `cierre.json`:

| Clave | Archivo | Propósito |
|---|---|---|
| `itemsPAES` | `l1-*.json` | Cierra esa lección (2–3 ítems) |
| `items` | `cierre.json` | Cierra toda la unidad (8 ítems) |

`RunnerLeccion` ahora agrega una fase `itemsPAES` tras el paso 10: reutiliza `EjecutorSetItems`/`ItemPAES` (mismo patrón que `Cierre.tsx`) y un nuevo `ItemsPAESFinal.tsx` (análogo de `CierreFinal.tsx`) para mostrar puntaje y continuar. `leccion_fin` se movió para disparar al terminar los ítems PAES de la lección, no al terminar el paso 10 — antes se disparaba prematuramente, saltándose el cierre propio de la lección.

**Problema 3 — validador: revisado, no es un problema real hoy.** El validador de CLI (`scripts/validar-contenido.mjs:121-129`) ya valida `itemsPAES` correctamente (clave, cantidad, forma por ítem) en `estado: revision` y `publicable`. El único caso sin cobertura es `estado: borrador`, donde el validador corta antes por diseño explícito (`CLAUDE.md`: "borrador — estructura básica, libertad para redactar"). No se toca esa gating: es una decisión de diseño, no un bug.

**Contenido afectado:** los 3 ítems en `itemsPAES` de L1 (fichas de juego de mesa / latas de aluminio / tablas con diferencias) ahora se muestran al terminar el paso 10 de `/leccion/l1-patrones-de-cambio`, antes de pasar a `/cierre`.

## Nota de optimización, no bloqueante

`scripts/validar-contenido.mjs` sigue sin validar la forma interna de cada bloque (solo `lib/contenido.ts` lo hace, en runtime). Vale la pena reforzar el validador de CLI con el mismo chequeo para detectar este tipo de discrepancia antes, en vez de que dependa de `idsDeLecciones()` silenciarla en el build.

## Ítem 10.2 de `leccion-2-guion.md` — verificación pendiente contra `MA-32_Funciones.md` antes de publicable

Ítem 10.2 de `leccion-2-guion.md` (estacionamiento $1.500 + $600/hora, reemplazo de taller de bicicletas por colisión confirmada) verificado con `consulta-fuentes` a nivel de palabras clave (estacionamiento, tarifa, hora, auto — limpio). Pendiente: cuando este ítem migre a `content/lecciones/` con schema real, `/revision-originalidad` debe revisar específicamente `MA-32_Funciones.md` antes de aprobar como publicable, ya que ese archivo contiene el patrón fijo+variable que bloqueó "plan de celular" en Paso 8 de L1. No marcar publicable sin esa revisión puntual.

## Gap de infraestructura: subagentes custom no disponibles como Agent tool

Gap de infraestructura (detectado 2026-07-09): los subagentes custom del proyecto (`consulta-fuentes`, `auditor-originalidad`, `revision-matematica`, `revision-originalidad`) definidos en `.claude/agents/` no están disponibles como Agent tool en este entorno — solo se listan agentes genéricos (claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup). Hoy el aislamiento de `consulta-fuentes` funciona porque el script mismo nunca imprime contenido de las fuentes, no porque corra en una sesión separada real. Falta confirmar si `/revision-originalidad` y `/revision-matematica` (invocados como slash commands) sí corren aislados o si tienen el mismo problema. Resolver antes de depender de esto para más migraciones de contenido.

**Confirmado 2026-07-09 (auditoría específica de `/revision-originalidad` y `/revision-matematica`):** ambos comandos tienen el mismo problema, sin excepción.

- `.claude/commands/revision-originalidad.md:4` y `.claude/commands/revision-matematica.md:4` solo dicen "Lanza el subagente `X`" — es texto de instrucción dentro del propio prompt del slash command, no una invocación técnica. No hay ningún mecanismo (hook, permiso, matcher) que fuerce que eso se traduzca en una llamada real al Agent/Task tool.
- El listado de agentes disponibles recibido en esta misma sesión es exactamente `claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup` — ninguno de los cuatro subagentes custom del proyecto (`auditor-originalidad`, `revisor-matematico`, `consulta-fuentes`) aparece como `subagent_type` invocable.
- Conclusión: `/revision-originalidad` y `/revision-matematica` corren en la sesión actual, compartiendo historial completo y decisiones previas del usuario — igual que el gap original de `consulta-fuentes`, no un caso aparte.
- Riesgo concreto más grave que en `consulta-fuentes`: `.claude/agents/revisor-matematico.md` exige resolver "desde cero SIN mirar la solución escrita ni qué alternativa está marcada como correcta". Si esto corre en la misma sesión donde el modelo acaba de redactar esa solución, la independencia del chequeo matemático queda comprometida estructuralmente, no por descuido puntual. Mismo problema de principio para `auditor-originalidad`, cuyo valor depende de una mirada sin el sesgo de haber escrito el contenido.
- No se corrigió nada todavía (solo diagnóstico). Pendiente real: decidir un mecanismo de aislamiento real (¿lanzar Claude Code en un proceso/sesión separada vía script en vez de vía Agent tool? ¿verificación manual explícita de que el hilo no reutiliza contexto?) antes de confiar en `/revision-matematica` o `/revision-originalidad` como chequeo independiente real.

**Resuelto parcialmente 2026-07-09 (solo para revisión matemática):** se documentó `docs/protocolo-revision-aislada.md` — protocolo manual para lanzar una terminal `claude` en proceso nuevo, sin historial, pasando solo enunciado + alternativas (nunca la solución marcada ni el feedback de distractores), y comparar el resultado a mano contra `solucion`/`esCorrecta` del archivo. El resultado se registra en `_notasInternas` del propio ítem, no en este archivo. `/revision-originalidad` sigue sin solución de aislamiento (necesita leer `fuentes-analisis-aisladas/`, que una sesión aislada fuera del proyecto no vería) — sigue abierto.

Se corrigió además el lenguaje de procedencia en `content/lecciones/l1-patrones-de-cambio.json` (nota raíz y nota del paso "aplicacion", Paso 8): antes afirmaban o implicaban que un subagente había "confirmado por su cuenta" hallazgos previos de originalidad; ahora dicen explícitamente que la revisión corrió en sesión compartida y queda pendiente de re-verificación con el protocolo aislado. No se tocó el valor de `revisionMatematica.aprobada` ni `checklistOriginalidad` (eso requeriría re-verificar contenido, no solo lenguaje) — solo la descripción de cómo se obtuvo. Revisado también Ítem 10.2 de `leccion-2-guion.md`: su "Nota de verificación" ya estaba correctamente etiquetada como autochequeo del autor, sin afirmar independencia — no requirió corrección.

## Exposición de contenido interno en el payload del cliente (2026-07-09)

Auditoría del deploy público antes de compartir el link con usuarios externos.

**Cómo se filtraba.** Los server components pasaban el objeto de contenido *completo* como prop a componentes cliente (`RunnerLeccion`, `Cierre`, `Diagnostico`). Next.js serializa las props de un componente cliente en el payload RSC, que viaja entero al navegador y se lee con "ver código fuente" — no solo lo que se pinta. Verificado en producción con `curl`: `/leccion/l1-patrones-de-cambio` publicaba `proveniencia.fuentesAnalisis` (con nombres de archivo de las fuentes internas y el razonamiento completo de la auditoría de originalidad, incluido el paralelismo detectado con material Mineduc/DEMRE), `_notasInternas` (10 ocurrencias), `catalogoErrores` y `solucion`.

**No** era accesible por URL directa: `/leccion-2-guion.md`, `/docs/pendientes.md`, `/CLAUDE.md`, `/.env`, `/content/**.json` → 404 todos. Next.js solo sirve `public/` (que contiene únicamente `robots.txt`) y las rutas de App Router. El leak era exclusivamente vía payload RSC.

**Resuelto:** `lib/sanitizar.ts` filtra por nombre de clave, a cualquier profundidad, antes de cruzar la frontera server→cliente: `proveniencia`, `checklistOriginalidad`, `revisionMatematica`, `catalogoErrores`, `contextosNumericos`, `_notasInternas`, `notaDiseno`, `notaVerificacionMatematica`, `solucion`. Ninguno se renderizaba. Se conservan `estado` (lo usa `BannerDemostracion`) y `respuestaModelo` (lo muestra `BloqueAbierta`). La app sigue 100% estática; no se agregó backend.

### Riesgo asumido: `esCorrecta` y el feedback por alternativa siguen viajando al cliente

`esCorrecta`, `respuestaCorrecta` (bloques `numerica`/`verdaderoFalso`) y el `feedback` de cada alternativa siguen en el payload. Un usuario con DevTools puede ver la respuesta correcta de cualquier pregunta sin resolverla.

**Por qué no se cerró (decisión 2026-07-09):**
- Esconderlo obliga a verificar la respuesta contra un endpoint → Route Handler → backend, explícitamente fuera del alcance de v1 (`CLAUDE.md`: "Sin backend, sin login").
- El endpoint no cerraría el hueco de todos modos: sin auth, identidad ni rate limit, son 4 POSTs por ítem para enumerar la respuesta, y el propio feedback devuelto dice "Correcto".
- El feedback delata la respuesta aunque se borre `esCorrecta` (`"Correcto. En 6 rondas ganó…"` vs `"Sumaste el total ganado… en vez de restarlo"`), así que habría que sacar también los 4 feedbacks del payload y pedirlos por intento.
- La corrección vive en 5 formas distintas (`itemsPAES[].alternativas[].esCorrecta`, `seleccion.opciones[].esCorrecta`, `numerica.campos[].respuestaCorrecta`, `verdaderoFalso.respuestaCorrecta`, `abierta.respuestaModelo`), y los bloques no tienen id global — se direccionan por `pasos[i].bloques[j]`.
- Costo real: hoy el flujo de lección no depende de la red; cada "Revisar respuesta" pasaría a ser un round trip. Red mala = lección rota, en la interacción más frecuente del producto.
- El "adversario" es un estudiante viendo la respuesta de un ejercicio formativo sin nota. No hay calificación, certificado ni ranking: quien hace trampa simplemente no aprende.

**Gatillo para reevaluar:** si alguna vez hay nota, certificación, ranking o cualquier incentivo para hacer trampa, esto pasa a ser un requisito y cruza el gate de backend del MOS §9–10.

### `estado: "publicable"` como gate de ruta: descartado, se usa el banner

Se evaluó bloquear `/cierre` y `/diagnostico` si su `estado !== "publicable"`. Hoy `cierre.json`, `diagnostico.json` y `l0-demo.json` están en `revision` — el gate dejaría el piloto inservible (el CTA de la portada moriría) y solo quedaría `/leccion/l1-patrones-de-cambio`. Además contradice la decisión de diseño ya existente en `RunnerLeccion`. En su lugar se extendió `BannerDemostracion` a `/cierre` y `/diagnostico`, que antes no lo mostraban: señal honesta de piloto, sin apagar el producto.

### PostHog roto en producción (2026-07-09)

Tras conectar el auto-deploy desde GitHub, Vercel construye desde `master`. El `next.config.ts` de `HEAD` no tenía los `rewrites()` que proxean `/ingest/*` hacia PostHog — vivían solo como cambio local sin commitear. Antes funcionaba porque `vercel --prod` manual subía el directorio de trabajo completo. Resultado: `/ingest/array/…/config.js` → 503, `/ingest/flags` → 404, y ningún evento salía. Resuelto commiteando `next.config.ts`.

`instrumentation-client.ts` (sin trackear) se dejó **deliberadamente fuera del commit**: hace un segundo `posthog.init()` sin `autocapture: false`, `persistence: "memory"` ni `disable_session_recording: true`, y corre antes que `PostHogProvider`. Committearlo habría activado autocaptura y persistencia en cookie/localStorage para usuarios menores de edad, violando `CLAUDE.md` regla 7 y MOS §7.5. No hace falta: `api_host` ya sale de `NEXT_PUBLIC_POSTHOG_HOST` (`= /ingest` en Vercel), que `PostHogProvider` lee. Un solo `init`, con la configuración de privacidad correcta.

## Landing de preventa `/preventa` (2026-07-20)

Test A del MOS §7 (apuesta comercial): validar demanda antes de construir más. Landing estática, cero backend, captura de interés delegada 100% a un formulario Tally embebido (un solo campo: correo). El dato vive solo en Tally, nunca entra a nuestro sistema — así no hay PII de menores en la app (`CLAUDE.md` regla 7, MOS §7.5) y la app sigue estática.

✅ **Landing (`/preventa`) — hecha.** Oferta + precio $9.990 + embed de Tally (`tally.so/embed/xXLQrE`). `npm run build` exit 0 (`/preventa` prerenderiza como estática, `/` intacta), `npm run lint` verde.

⏳ **Falta: fecha de la cohorte fundadora.** `FECHA_INICIO` sigue en `"[FECHA POR DEFINIR]"` en `app/preventa/page.tsx`. Decisión del autor, sin apuro.

⏳ **Falta: publicar/compartir el link.** Recién al circular el link entra en juego el pendiente de **purgar el historial de git**: una vez público, cualquiera llega al repo desde el footer o el código fuente, y el historial expone contenido interno (fuentes DEMRE/Mineduc en `proveniencia`, `_notasInternas`, razonamiento de auditoría). El commit `d77e8f7` cerró el leak vía payload RSC del *deploy actual*, pero **no reescribe la historia**: los blobs de contenido interno siguen en commits anteriores del repo. Purgar antes de hacer el repo accesible o antes de compartir cualquier link que apunte a él.

**Nota técnica del embed:** `dynamicHeight=1` va en la URL pero no auto-redimensiona porque no se carga el script `widgets.js` de Tally (dependencia externa fuera del plan). El iframe queda fijo en 200px, suficiente para un formulario de un campo. Si el form crece y corta contenido, cargar `widgets.js` con `next/script`.

## Integración de Clerk: exploración sin gate, guardada en branch aparte (2026-07-20)

Integración de Clerk iniciada como exploración **sin gate aprobado** (autenticación está en la lista negra del MOS §9–10; el alcance v1 dice explícitamente "sin login"). Guardada en el branch local `wip/clerk-auth` (commit `79051b6`), **no fusionada a master ni pusheada**. Retomar solo después de validar demanda con la preventa (solo captura de correo, sin cobro).

**Build roto en el branch:** `SignedOut` no está exportado en `@clerk/nextjs ^7.5.16` (`components/cuenta/ControlesCuenta.tsx` lo importa). `npm run build` falla con exit 1. Al retomar: revisar la versión/API de Clerk (probablemente cambió el punto de importación de los control components entre v5→v7) antes de continuar.

**Qué se movió al branch:** `package.json`/`package-lock.json` (dep `@clerk/nextjs`), `app/layout.tsx` (ClerkProvider), `middleware.ts` (clerkMiddleware protegiendo solo `/api/progreso`), rutas `app/ingreso/` `app/registro/` `app/api/progreso/`, `components/cuenta/*`, `components/ui/Avatar.tsx`, `lib/progreso.ts` `lib/useGuardarProgreso.ts` `lib/rateLimit.ts` `lib/sanitizarEntrada.ts`, y los diffs de Clerk en `app/page.tsx` (ControlesCuenta) y `components/RunnerLeccion.tsx` (guardado de progreso).

**`app/privacidad/` también se movió al branch, no a master.** Su aviso describe el flujo de cuentas de Clerk (correo como identificador, códigos de acceso, borrado de cuenta, casilla de 16 años). Dejarlo en master publicaría un aviso de privacidad sobre recolección de datos y un sistema de login que master no tiene desplegado — riesgo legal (MOS prioridad #1), y contradice lo que el propio aviso predica ("no ocupar ningún dato para algo que no esté escrito acá"). La landing de preventa necesitará su propio aviso ajustado a lo que realmente hace (solo capturar correo).

**Master quedó limpio y buildeando** (`npm run build` exit 0; rutas generadas: `/`, `/cierre`, `/diagnostico`, `/leccion/[id]` — ninguna de Clerk). Se conservaron en master los cambios no-Clerk sin commitear (proxy PostHog en `PostHogProvider.tsx`, `lib/errores.ts`, `l1-patrones-de-cambio.json`). Ojo al no confundir `lib/sanitizar.ts` (filtro de payload RSC, **sigue en master**) con `lib/sanitizarEntrada.ts` (input de formularios Clerk, **movido al branch**) — son archivos distintos.
