# Pendientes técnicos

🔴 REVERTIR: L2/L3 marcadas publicable + checklist/revisión completos sin revisión matemática real desde 2026-07-27 — revertir a borrador y false, o completar la revisión real, antes de dar el proyecto por cerrado.

## 🔴 Cargador de ítems de diagnóstico: falta la pieza que lee JSON y arma lo que el motor consume (abierta 2026-08-02)

`ItemDiagnostico.aislante` (`lib/diagnostico/tipos.ts`) es un campo que el motor
lee directamente. En el schema de contenido
(`content/schema/item-diagnostico.schema.json`), "aislante" NO es un campo: es
derivado — un ítem es aislante si `unidadesInvolucradas ⊆ {unidad} ∪
ancestros(unidad)` en el DAG. Lo mismo pasa con el nombre de la unidad: el
schema usa `unidad`, el motor usa `unidadId` — mismos datos, nombres
distintos.

Nadie escribió todavía la pieza que hace el puente: leer un JSON ya validado
de `content/diagnostico/items/`, calcular `aislante` contra el DAG (la misma
cuenta que ya hace `scripts/validar-contenido.mjs` en
`validarBancoDiagnostico`, reglas 6b/6g), y armar el `ItemDiagnostico` que el
motor realmente consume.

**Gatillo duro:** ANTES de que exista el primer ítem real con `estado:
"publicable"`, tiene que existir este cargador. Si el primer ítem real entra
sin él, alguien va a terminar escribiendo `"aislante": true` a mano en algún
punto de integración — y ahí se pierde exactamente la garantía que el
validador ya construyó: que "aislante" sea un hecho calculado del DAG, nunca
una afirmación de quien escribe el ítem.

## 🔴 `funcion-lineal-afin`: catálogo de errores sin fusionar, bloquea sus ítems de diagnóstico (abierta 2026-08-02)

Los 6 errores migrados a `content/errores/funcion-lineal-afin.json` vienen de
un solo L1 (`lineal-patrones-de-cambio.json`). El otro L1 de la misma unidad,
`lineal-pendiente-e-intercepto.json` (5 errores), numera su propio
`error-1`…`error-5` con significados distintos a los del primero, y no está
migrado (ver "🟡 `content/errores/` es una copia, no la fuente" más abajo).

**Gatillo duro:** ningún ítem de diagnóstico de la unidad `funcion-lineal-afin`
se escribe hasta que este catálogo esté fusionado en una sola numeración sin
ambigüedad. Fusionar catálogos con significados distintos es una decisión de
contenido, no mecánica — no se resuelve en una sesión de código, necesita
criterio humano sobre qué error es cuál.

**Esto no bloquea las otras 15 unidades.** Solo `funcion-lineal-afin` tiene
esta colisión; el resto puede tener sus ítems de diagnóstico escritos sin
esperar a que esta se resuelva.

## 🟡 Deudas del motor de diagnóstico (abierta 2026-08-02)

### ✅ `content/diagnostico/` quedó exento del contrato del validador — resuelta (2026-08-02)

El commit `8a13a4f` sacó esa carpeta de `esContenido()` en
`scripts/validar-contenido.mjs`, porque el DAG del dominio no tiene pasos, ítems
ni proveniencia y el contrato de lecciones lo rechazaba. **Era aceptable solo
mientras ahí viviera únicamente el DAG.**

**Gatillo, y era duro:** ANTES de escribir el primer ítem de diagnóstico había que
definir su schema y sacar la carpeta de la lista de exentas. Si no, el primer
ítem real habría entrado a la carpeta sin que nada lo validara —sin feedback obligatorio por
distractor, sin `errorCatalogado`, sin revisión— y el validador habría dicho OK.
Esa es exactamente la clase de silencio que el validador existe para romper.
Ojo con el detalle: `content/diagnostico.json` (archivo) sí se sigue validando;
lo que estaba exento era `content/diagnostico/` (carpeta).

**Resuelta por este commit, antes de que existiera un solo ítem real.**
`content/diagnostico/` ya no es una exención en bloque: se sacó de
`CARPETAS_SIN_CONTRATO`. En su lugar tiene dos contratos dedicados,
discriminados por ruta (`esDagM1`, `esItemDiagnostico`): `dag-m1.json` contra
su propia estructura (16 unidades, 22 aristas, acíclico, raíz única, vía
`validarDagM1Archivo`, que reutiliza `construirDag`/`ancestros` de
`lib/diagnostico/dag.ts` en vez de reimplementar el grafo) y cada archivo de
`items/*.json` contra `content/schema/item-diagnostico.schema.json` más las
reglas cruzadas del validador (`validarBancoDiagnostico`): unidad existe en el
DAG, unidadesInvolucradas la contiene y define si es aislante, cada
errorCatalogado existe en `content/errores/` y su unidad dueña está entre las
involucradas, ningún id ni contexto numérico se repite en el banco, y toda
unidad con ítems tiene al menos uno aislante y al menos un error que se repite
en dos ítems (para que `error-confirmado` sea alcanzable). `items/` sigue
vacío a propósito (`.gitkeep`); las 22 reglas se probaron una por una a mano
con ítems de prueba desechados antes de este commit, no solo leídas.

### Condición de reversión del gate de grafo de conocimiento

Si al llegar a Gate 3 `lib/diagnostico/` no está integrado, se borra completo.
No se arrastra código muerto. Firmado al cruzar el gate el 2026-08-02, MOS §9.

## 🟡 `content/errores/` es una copia, no la fuente (abierta 2026-08-02)

`content/errores/<unidad>.json` existe como artefacto propio desde este commit,
pero cada L1 sigue teniendo su propio `catalogoErrores` embebido, y ese array
embebido — no el archivo nuevo — sigue siendo el que la app lee. La migración
fue deliberadamente mecánica: copiar, no mudar. Ver CLAUDE.md y el commit de
este cambio para el porqué (había una demo con un profesor encima y cero
tolerancia a riesgo de regresión en contenido publicable).

**La deuda real:** el L1 debería terminar leyendo del catálogo en vez de tener
el suyo embebido. Mientras eso no pase, hay dos fuentes del mismo dato y un
validador (`validarCatalogoErrores` en `scripts/validar-contenido.mjs`) que las
compara y falla si divergen — pero el validador solo corre cuando alguien toca
uno de los dos archivos o corre `npm run validar`. Nada impide que las dos
copias existan un rato desincronizadas entre una edición y la siguiente
corrida del validador.

**Colisión sin resolver: `funcion-lineal-afin` tiene dos L1 con catálogo
embebido.** `lineal-patrones-de-cambio.json` (6 errores) y
`lineal-pendiente-e-intercepto.json` (5 errores) numeran cada uno desde
`error-1` de forma independiente, con descripciones distintas para el mismo
id local. Se migró solo `lineal-patrones-de-cambio` a
`content/errores/funcion-lineal-afin.json`; los 5 errores de
`lineal-pendiente-e-intercepto` **no están en ningún catálogo unificado**.
Antes de que el L1 lea del catálogo en vez de tener el suyo, hay que decidir
el esquema de id para unidades con más de una lección con catálogo propio —
namespacing por lección, fusión con renumeración, u otra cosa. Es una decisión
de esquema, no mecánica: no se toma sin firma.

**Mapeo lección→unidad, hoy solo en código.** `MAPEO_LECCION_UNIDAD` en
`scripts/validar-contenido.mjs` es la única fuente que declara qué L1
corresponde a qué unidad del DAG — el contrato de lección no tiene ese campo.
Si se agrega un L1 nuevo con `catalogoErrores` y su
`content/errores/<unidad>.json`, hay que sumar la entrada a mano en esa
constante o la regla de coherencia no tiene con qué comparar.

## ✅ Discrepancia de l3 (abierta 2026-07-22) — resuelta por Enmienda 2 (2026-07-28)

`l3-ecuaciones-lineales.json` no estaba fuera de spec: estaba archivado en el módulo
equivocado. El MOS §4 original definía la Lección 3 del MVP como "traducción entre
representaciones"; `lib/temas.ts` ya trataba `l3-ecuaciones-lineales` como parte del módulo
"Ecuaciones e inecuaciones de primer grado", no de "Función lineal y afín" — el código
adelantó una resolución que la documentación nunca formalizó. La Enmienda 2 (`mos-v2.md` §13)
la formaliza: el módulo "Función lineal y afín" queda en 3 lecciones (patrones de cambio,
pendiente e intercepto, modelamiento PAES — esta última por escribir); `l3-ecuaciones-lineales`
se reubica en su módulo correcto. Detalle y mapeo de ids nuevos:
`docs/calibracion-lecciones-e-items.md` §4.0.

**Esto NO resuelve** el ítem 🔴 de arriba: la revisión matemática real de
`l3-ecuaciones-lineales` sigue pendiente (la firma de 2026-07-27 es administrativa, temporal
para demo) — problema aparte, sin tocar por esta enmienda, que es solo de documentación.

**Pendiente de ejecución (fuera de esta enmienda):** renombrar el archivo
`content/lecciones/l3-ecuaciones-lineales.json` → `ecuaciones-e-inecuaciones-primer-grado-ecuaciones-lineales.json`
y los ids `l1-*`/`l2-*` a la convención `{modulo}-{slug}` en el propio JSON, `lib/temas.ts` y
todo lugar que los referencie (`db/migraciones/`, `lib/contenido.ts`,
`lib/descripcionesLecciones.tsx`, `e2e/`).

## Migración de `content/lecciones/l1-patrones-de-cambio.json` — hecha y re-certificada (`publicable`)

**Resuelto estructuralmente el 2026-07-08.** El archivo usaba una forma ad-hoc (`"interaccion": {...}` anidada) que no coincidía con los bloques discriminados por `tipo` de `content/schema/leccion.schema.json`. Se migró a la forma del schema (`prediccion`, `seleccion`, `numerica`, `verdaderoFalso`, `abierta`, `pistas`, `texto`), preservando enunciados, números, alternativas y feedback exactos — transformación de forma, no de contenido. `npm run validar` pasa, y `idsDeLecciones()` ya no la excluye de `generateStaticParams()`: `/leccion/l1-patrones-de-cambio` se genera y navega correctamente.

Decisiones tomadas durante la migración (todas confirmadas con el autor del proyecto antes de ejecutar):
- `l1-item-1` se migró en su versión del JSON (fichas de juego de mesa, backward-solve), no la del guión original (`leccion-1-guion.md`, estanque con filtración) — el guión quedó obsoleto en ese ítem tras dos rechazos de `/revision-originalidad` por cercanía con DEMRE Forma113, documentados en `proveniencia`.
- El paso 8 (aplicación), que combinaba una pregunta abierta y una numérica en un solo bloque tipo `"mixta"` (inexistente en el schema), se dividió en dos bloques secuenciales dentro del mismo paso — mismo texto exacto, solo reorganizado.
- Notas internas sin campo equivalente en el schema (`notaDiseno` fuera de bloques `abierta`, verificaciones aritméticas de control) se preservaron en `_notasInternas` a nivel de cada `paso` (que sí admite campos extra), en vez de perderse.
- Se creó `catalogoErrores` con los 2 errores que la propia lección nombra en su cierre ("olvidar el valor inicial", "contar mal los saltos"), referenciados vía `errorCatalogado` donde el feedback ya existente coincide claramente.
- Al terminar la migración, `estado` se dejó en `"revision"` y `checklistOriginalidad`/`revisionMatematica` se resetearon a sin confirmar, porque una migración estructural hecha por IA no reemplaza la re-certificación humana línea por línea contra el original. (Esa re-certificación se completó después ese mismo día; ver el cierre de esta sección.)

**Adición fuera de lo estrictamente pedido, a revisar**: además de los 2 errores del catálogo, se agregó `errorCatalogado` a algunas alternativas de `itemsPAES` cuyo feedback ya existente coincidía claramente con esos errores (no se tocó ningún texto, solo se sumó la referencia). Confirmar si se quiere mantener.

**Re-certificación completada (2026-07-08).** La revisión humana línea por línea del archivo migrado contra `leccion-1-guion.md` y la versión anterior, más `/revision-matematica` y `/revision-originalidad`, se hicieron: `content/lecciones/l1-patrones-de-cambio.json` está en `"estado": "publicable"`, con `checklistOriginalidad` (cuatro campos en `true`) y `revisionMatematica` (`aprobada: true`) firmadas por Benjamín Gutiérrez. Fuente de verdad: los campos del propio JSON, no este documento.

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

## Integración de Clerk: exploración sin gate, guardada en branch aparte (2026-07-20) — CERRADO

> **Obsoleto desde 2026-07-23.** El gate de autenticación se cruzó ese día (MOS §9, excepción acotada) y Clerk se integró en master en el PASO 3. Este bloque se conserva porque resuelve una duda técnica que quedó abierta, no porque siga vigente. **El branch `wip/clerk-auth` quedó superado y se puede borrar.**

Integración de Clerk iniciada como exploración **sin gate aprobado** (autenticación estaba en la lista negra del MOS §9–10; el alcance v1 decía explícitamente "sin login"). Guardada en el branch local `wip/clerk-auth` (commit `79051b6`), **no fusionada a master ni pusheada**.

**Build roto en el branch — causa encontrada.** `SignedOut` no está exportado en `@clerk/nextjs` v7. La hipótesis anotada entonces ("probablemente cambió el punto de importación") era incorrecta: **el componente ya no existe**. En v7, `SignedIn`, `SignedOut` y `Protect` se unificaron en `<Show when="signed-in" | "signed-out">`, exportado desde `@clerk/nextjs`. Ojo al usarlo: la documentación de Clerk advierte que `<Show>` solo **oculta visualmente** — el contenido sigue en el HTML. Nunca sirve para proteger datos; para eso está `lib/datos/`.

**Qué se rescató del branch al integrar en master:** `lib/rateLimit.ts` (adaptado a penalizar solo fallos de firma), `app/privacidad/page.tsx` (corregido) y el `matcher` del middleware con su exclusión de `/ingest`. Lo demás se descartó: los formularios custom de `components/cuenta/` (~490 líneas) se reemplazaron por los componentes prearmados de Clerk, y `app/api/progreso/` + `lib/progreso.ts` quedaron cubiertos por `lib/datos/`.

**Qué se movió al branch:** `package.json`/`package-lock.json` (dep `@clerk/nextjs`), `app/layout.tsx` (ClerkProvider), `middleware.ts` (clerkMiddleware protegiendo solo `/api/progreso`), rutas `app/ingreso/` `app/registro/` `app/api/progreso/`, `components/cuenta/*`, `components/ui/Avatar.tsx`, `lib/progreso.ts` `lib/useGuardarProgreso.ts` `lib/rateLimit.ts` `lib/sanitizarEntrada.ts`, y los diffs de Clerk en `app/page.tsx` (ControlesCuenta) y `components/RunnerLeccion.tsx` (guardado de progreso).

**Sobre `app/privacidad/`:** en su momento se dejó fuera de master porque el aviso describía un sistema de login que master no tenía desplegado — publicar eso habría sido riesgo legal (MOS prioridad #1). **Eso ya no aplica:** master tiene el flujo de cuentas desde el PASO 3, así que el aviso corregido vive en `app/privacidad/page.tsx`. La landing de preventa sigue necesitando su propio aviso ajustado a lo que ella hace (solo capturar correo en Tally) — eso sí queda pendiente.

**Trampa de nombres que sigue vigente:** no confundir `lib/sanitizar.ts` (filtro de payload RSC, en master desde siempre) con `lib/sanitizarEntrada.ts` (input de los formularios custom de Clerk, quedó solo en el branch y no se rescató, porque los componentes prearmados validan por su cuenta). Son archivos distintos.

## PASO 3 (Clerk): código listo, falta configurar el webhook a mano (2026-07-23)

**Estado: el código está completo y empujado.** Commit `6c3bced`, junto con los 11 anteriores de la sesión, ya está en `origin/master` — Vercel tiene con qué desplegar. `build`, `lint`, `validar` y `tsc` en verde; las tres páginas nuevas salen estáticas y las lecciones siguen SSG, así que nada quedó detrás de la sesión.

**Lo único que falta lo hace Benja a mano en el dashboard de Clerk**, y no se puede automatizar ni probar antes, porque necesita una URL desplegada de verdad:

1. Clerk → **Webhooks → Add Endpoint**, apuntando a `https://<dominio-de-producción>/api/webhooks/clerk`.
2. Suscribir **solo** `user.created`, `user.updated` y `user.deleted`.
3. Copiar el **Signing Secret** (empieza con `whsec_`) y ponerlo en dos lugares: `.env.local` para desarrollo, y las variables de entorno del proyecto en Vercel para producción. Si falta el segundo, el webhook funciona local y falla desplegado.

Con `localhost` no llega nada: Clerk necesita alcanzar la URL desde fuera.

**Lo que queda sin verificar hasta entonces:** el camino feliz completo. Todo lo demás está probado contra el build de producción — las rutas públicas responden 200 sin sesión, el webhook devuelve 401 sin firma y 429 pasado el umbral, y ninguno de esos intentos escribió en la base. Falta comprobar que un registro real crea la fila en `usuarios`, otorga el entitlement `m1-libre`, escribe exactamente una fila de auditoría y hace que `tieneAcceso()` devuelva `true`. **Verificado end-to-end el 2026-07-24:** webhook Clerk en instancia development (Production bloqueada por Clerk — no admite dominios `*.vercel.app` sin DNS propio; ver nota líneas 185-190) recibiendo eventos reales del deploy productivo tras alinear `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` y `CLERK_WEBHOOK_SIGNING_SECRET` en Vercel Production a valores `test_`. Registro real confirmado: fila creada en `usuarios`, entitlement `m1-libre` asignado, exactamente una fila en `entitlements_auditoria` (acción "creado", actor "sistema").

**Cómo se almacena el contador del rate limiting del webhook:** es un `Map` en memoria del módulo `lib/rateLimit.ts`, o sea **por instancia de función serverless y volátil** — se pierde en cada arranque en frío y no se comparte entre instancias, así que el techo real es `LÍMITE × instancias activas`, no `LÍMITE`. Alcanza porque solo cuenta fallos de verificación de firma y la defensa de verdad es la firma; si esto se abriera al público, el reemplazo es una regla del WAF de Vercel antes que Redis.

## Borrados de cuenta pendientes de purga real — hasta la migración 007 (2026-07-23)

`app_m1` no tiene `DELETE` sobre `usuarios`. Ese permiso llega en la **007**, y solo después de que la verificación de firma svix del webhook exista y esté probada — el permiso llega después de la defensa, nunca antes.

Mientras tanto, cuando llega `user.deleted`, `app/api/webhooks/clerk/route.ts` responde 200 y **neutraliza la PII con el `UPDATE` que sí tenemos**: el correo pasa a una lápida y el nombre a `NULL`. El progreso y las respuestas quedan colgando de un id opaco que ya no apunta a ninguna persona.

**Cómo encontrar las filas que faltan purgar de verdad.** Esta consulta es la fuente de verdad durable, no los logs — el `console.warn` con prefijo `[BORRADO-PENDIENTE]` sirve para enterarse en el momento, pero los logs de Vercel se rotan y desaparecen:

```sql
SELECT id, actualizado_en
  FROM usuarios
 WHERE email LIKE 'borrado-%@invalido.local'
 ORDER BY actualizado_en;
```

**Lo que esta decisión NO resuelve, y hay que cerrar junto con la 007:** `entitlements.notas` es texto libre para justificar cortesías y puede contener datos identificatorios de un usuario ya "borrado" —o de terceros, tipo "cortesía para el hermano de la profesora de 2°B"—. Neutralizar `usuarios` no lo toca. Al implementar el `DELETE` completo hay que decidir qué pasa con esa columna. Relacionado: el retrato jsonb que va a `entitlements_auditoria` ya excluye `notas` a propósito (ver `lib/datos/entitlements.ts`), así que el problema está acotado a la tabla `entitlements` misma.

## Higiene de datos de prueba (2026-07-23)

Al verificar el PASO 3 apareció un usuario huérfano en `usuarios`: `user_test_ff7b26ac-…`, correo `@invalido.test`, sin entitlement ni auditoría. Venía de la **primera corrida del script de verificación del PASO 2**, la que abortó con `permission denied` antes de llegar a su bloque de limpieza. La segunda corrida usó otro id y sí se limpió, así que el informe de "51 ok" no lo detectó: **el script solo verificaba el usuario que él mismo había creado.**

Ya está borrado y las cinco tablas quedaron en cero. La lección para el próximo script de verificación contra la base real: limpiar por patrón (`id LIKE 'user_test_%' AND email LIKE '%@invalido.test'`), no solo el id de la corrida en curso, y hacerlo al **empezar** además de al terminar — una corrida que se cae no ejecuta su limpieza.

## CTA principal de `/` empujaba a contenido no publicable (2026-07-25) — RESUELTO EN PARTE

El CTA principal de la portada (`app/page.tsx`) era "Comenzar diagnóstico" y
apuntaba a `/diagnostico`, cuyo contenido (`content/diagnostico.json`) está en
`estado: revision`, no `publicable`.

**Lo que veía el estudiante, y que la primera redacción de este ítem omitía:** al
no ser `publicable`, `components/Diagnostico.tsx:42` monta `BannerDemostracion`,
así que la acción principal del producto abría con el cartel **"DEMOSTRACIÓN —
contenido no revisado"** (`components/ui/Banner.tsx:7`). No era deuda abstracta de
contenido: era una advertencia en pantalla en el primer clic.

Contradecía lo que hizo Fase 1 (`0d3f7e7`): el camino se limpió para que solo las
lecciones publicables fueran navegables, y la portada seguía empujando contenido
en revisión como acción primaria. También chocaba con la decisión de producto de
`plan-rediseno-entrada.md:19-22` (arranque directo a l1, diagnóstico secundario
mientras haya una sola lección publicable — un test de ubicación con un solo
destino no ubica).

**Corrección de cómo estaba planteado este ítem.** La versión original ofrecía dos
ramas: "o el diagnóstico sube a `publicable`, o el CTA deja de ser primario". La
primera rama no existe para este archivo:
`content/diagnostico.json:175` declara textualmente que es *"Set de diagnóstico de
demostración técnica… No es contenido pedagógico real ni pasa a estado
publicable"*. No es contenido esperando revisión, es andamiaje declarado como tal.
Subirlo a `publicable` exigiría **escribir un diagnóstico nuevo**, no revisar este.

**Decidido el 2026-07-25 (Benjamín):** el diagnóstico pierde el lugar primario. El
CTA de `/` pasa a la primera lección abierta del camino, derivada de
`idsPublicables()`. El archivo **no** se borra ni se despublica: `/diagnostico`
sigue existiendo y accesible como opción secundaria, y la portada ahora nombra que
es una versión de demostración **antes** de que el estudiante vea el banner.

**Lo que queda abierto:** si en algún momento se quiere un diagnóstico real que sí
ubique al estudiante, es contenido nuevo desde cero, con checklist de originalidad
y revisión matemática como cualquier lección. Tiene sentido recién cuando haya
varias lecciones publicables entre las cuales enrutar (`plan-rediseno-entrada.md:19-22`).

## `/cierre` empuja al banner de demostración sin aviso — RESUELTO (2026-07-25)

Al resolver el caso de `/diagnostico` (sección anterior) apareció un caso emparentado
que no se tocó: `content/cierre.json:5` también está en `"estado": "revision"`, y
`components/Cierre.tsx:19` monta `<BannerDemostracion />` cuando el estado no es
`publicable` — el mismo cartel "DEMOSTRACIÓN — contenido no revisado"
(`components/ui/Banner.tsx:7`) que se venía avisando de antemano en los dos enlaces
a `/diagnostico`.

**En qué se diferencia del caso ya resuelto.** En `/diagnostico` el estudiante llega
por un click que él elige, y ahora ambos puntos de entrada (`app/page.tsx:40` y
`components/CierreFinal.tsx:98`) avisan "hoy una versión de demostración" antes de
ese click. En `/cierre` no hay click del estudiante: `components/RunnerLeccion.tsx:46`
hace `router.push("/cierre")` automáticamente al terminar la lección
(`irAlCierre()`, disparado desde `terminarPasos()` cuando no quedan `itemsPAES`, o
desde `renderFinal` de `EjecutorSetItems` cuando sí los hay). El estudiante no decide
ir a `/cierre` — el flujo lo empuja ahí, y el banner aparece sin que nada se lo haya
anunciado antes.

**Resuelto (2026-07-25, commit `88466a2`, 5 archivos).** Se agrega un aviso "El
cierre es hoy una versión de demostración" antes del último click hacia `/cierre`,
con el mismo vocabulario ya usado en `/diagnostico`. Resuelto server-side:
`obtenerCierre().estado` baja como prop `cierreEnDemostracion` hasta el punto real
de disparo, que depende de si la lección tiene `itemsPAES` o no (`terminarPasos()`
vs. `renderFinal` de `EjecutorSetItems`).

Cambio de tipos asociado: `esPublicable()` se ensanchó de `(l: Leccion)` a
`(c: {estado: Estado})` para aceptar también `CierreContenido` — aprobado
retroactivamente como parte de este commit, sin cambio de comportamiento en los
call sites previos (`Leccion` sigue satisfaciendo la forma más ancha).

**Cerrado (2026-07-26).** Lo que quedaba abierto era el título de
`content/cierre.json`, que decía "Cierre — pendiente e intercepto" (el tema de la
Lección 2) en vez del cierre del módulo completo. Ya está resuelto: el commit
`1df8dbe` lo dejó en `"Cierre del módulo"`. Verificado contra el archivo el
2026-07-26. Sin nada pendiente en esta sección.

Fecha: 2026-07-24

El webhook de Clerk (`/api/webhooks/clerk`, eventos `user.created`, `user.updated`, `user.deleted`) se configuró en la instancia de development de Clerk, no en producción.

Por qué: Clerk no permite crear instancia de producción con dominio `*.vercel.app` — exige un dominio propio verificable por DNS (CNAME/TXT). Confirmado contra la documentación oficial de Clerk (2026-07-24). No es un problema de formato del campo, es una restricción real de la plataforma.

Implicancia: el signing secret guardado en `.env.local` y Vercel corresponde a la instancia de development (`whsec_...` de dev), no a producción. Las claves públicas/secretas de Clerk en uso son `pk_test_` / `sk_test_`.

Pendiente real cuando se compre el dominio propio:

1. Crear instancia de producción en Clerk con el dominio nuevo.
2. Repetir la configuración del endpoint del webhook en esa instancia (URL de producción con el dominio propio, mismos 3 eventos).
3. Nuevo signing secret → actualizar `.env.local` y Vercel (entorno Production).
4. Cambiar claves públicas/secretas de `pk_test_`/`sk_test_` a `pk_live_`/`sk_live_` en las variables de entorno de Vercel.

No asumir que "ya está configurado" solo porque development funciona — son dos endpoints y dos secrets independientes.


---

Fecha: 2026-07-26

El progreso anónimo guardado en `localStorage` (`pm1:progreso:v1`) NO se migra
al servidor cuando el estudiante crea cuenta. El detalle de respuestas se pierde
en ese momento.

Contexto: `lib/progresoLocal.ts` (nuevo) escribe avance por lección más el
detalle de intentos por ítem. La mitad del avance por lección sí tiene destino:
`migrarProgresoLocal` en `lib/datos/progreso.ts` la vuelca a
`progreso_lecciones`. El detalle de intentos, en cambio, espeja la tabla
`respuestas` (`db/migraciones/003_respuestas.sql`) y **no tiene función de
migración**: nadie escribe esa tabla desde el cliente.

Consecuencia concreta: un estudiante que hace el diagnóstico y una lección sin
cuenta, y después se registra, conserva "dónde iba" pero pierde el detalle de
qué respondió y en qué intento. Eso es justamente el insumo del delta pre/post
del MOS §6 para esa persona.

Decisión tomada el 2026-07-26: **no construir la migración ahora.** Es alcance
propio y no bloquea el camino de dos niveles. Queda documentado para que nadie
asuma que el detalle sobrevive al registro.

Gatillo para retomarlo: cuando se quiera medir el delta pre/post de estudiantes
concretos y no solo agregados de sesión. Antes de eso no compra nada.

Aviso de copy que sigue vigente (`docs/plan-fase-3-navegacion.md` §1): ningún
texto de la interfaz puede afirmar ni insinuar que la cuenta guarda, protege o
recupera el avance. Con esta pieza sin construir, sería falso.

---

Fecha: 2026-07-26

La celebración de tema no tiene ruta de flujo real hasta que `l2` pase a
publicable.

Un tema se da por completado solo cuando **todas** las lecciones declaradas en
`lib/temas.ts` están publicables y completadas, más su `cierreId` si lo tiene
(`lib/estadoNodo.ts`, `estadoDeNodo`). Hoy `funcion-lineal-y-afin` declara
`l1-patrones-de-cambio` y `l2-pendiente-e-intercepto`, y `l2` está en `borrador`,
así que ese tema no puede completarse y `/tema/funcion-lineal-y-afin/completado`
no se alcanza jugando. `ecuaciones-e-inecuaciones-primer-grado` tampoco: su única
lección está en borrador.

**Es el comportamiento correcto, no una regresión.** La primera versión filtraba
las lecciones por `publicable` antes de evaluar, así que terminar `l1` daba el
tema por cerrado y disparaba "Tema completado" tras 1 de 2 lecciones. Son 16
celebraciones en todo el curso y son idempotentes: una gastada en falso es una
que el estudiante no vuelve a ver cuando la lección que falta se publique.

Estado del nodo mientras tanto: **en curso**, con el conteo "1 de 2 lecciones"
visible. Ni completado ni disponible — hay avance real y no hay nada más abierto
que hacer.

La pantalla está construida y verificada; lo que falta es contenido, no código.
Se alcanza sola en cuanto `l2` cruce revisión matemática y de originalidad. No
hay nada que reprogramar.

---

Fecha: 2026-07-27

## La portada deriva el progreso por su cuenta (barrido de coherencia) — CERRADO

**Resuelto el 2026-07-27**, en los dos commits que siguen. Lo de abajo queda
como registro de qué estaba mal y cómo se verificó; la fuente de verdad es el
código.

- `3b4385b` — `PuntoDePartida` deriva de `lib/estadoNodo.ts`. Cierra el caso B.
- `e958117` — rama propia para la deuda pendiente. Cierra el caso A.

Las cuatro superficies coinciden ahora en los dos estados, y coinciden bajo
test: `e2e/capturas.spec.ts` recorre portada, nodo de tema, nodo de lección y
encabezado **en el mismo test y con el mismo progreso sembrado**, que es lo
único que hace fallar una discrepancia entre ellas. Comprobarlas por separado
es justo lo que dejó pasar estos dos defectos: cada pantalla estaba bien mirada
a solas. Capturas `6a`/`6b` y `7a`/`7b`.

| superficie | caso A, ahora | caso B, ahora |
| --- | --- | --- |
| portada | "Te conviene repasar una lección" | "Empieza por acá" |
| nodo de tema | "Repasar el tema" | "Empezar el tema" |
| nodo de lección | "Repasar la lección" | "Empezar la lección" |
| encabezado | 1/2 | 0/2 |

**Lo que queda sin cubrir, a propósito.** La rama de deuda exige que *nada*
esté `enCurso` ni `disponible`. Con una lección `porRepasar` y otra abierta sin
tocar, la portada muestra la rama 2 y apunta a la segunda, sin nombrar la
deuda; el camino sí la pinta en ámbar. No es contradicción —la portada
responde "qué hago ahora" y el nodo responde "cómo va esto"— y hoy es
inalcanzable, porque `l1` es la única lección publicable. Revisar cuando `l2`
cruce revisión: si ahí se decide que la deuda manda sobre avanzar, el orden de
guardas es de una línea.

---

Barrido de las cuatro superficies que hablan del mismo estado —portada, nodo de
tema, nodo de lección y encabezado de tema— después de plegar `estadoDeNodo`
sobre `estadoDeLeccion`.

**Tres de las cuatro ya derivan de `lib/estadoNodo.ts` y coinciden entre sí.**
El nodo de tema (`components/camino/Camino.tsx`) usa `estadoDeNodo`, el nodo de
lección (`components/camino/CaminoLecciones.tsx`) usa `estadoDeLeccion`, y el
encabezado (`components/camino/DetalleTema.tsx`) usa `avanceDeTema`. También
`RunnerLeccion.terminar()` y `temasCompletados()`. Con el pliegue, el nodo de
tema ya no puede discrepar del nodo de lección: lo deriva de él.

**`components/PuntoDePartida.tsx` es la única que quedó leyendo el progreso
directamente** (líneas 78–83): arma su propio set de `completada` y decide con
`progreso.lecciones.length > 0`, sin pasar por `estadoDeLeccion`. Eso produce
dos contradicciones, las dos verificadas en el navegador sembrando
`localStorage`, no deducidas leyendo:

**A. Una lección terminada bajo el umbral de dominio.** `estadoDeLeccion` la
llama `porRepasar`; la portada la ve solo como `completada: true` y la da por
cerrada.

| superficie | dice |
| --- | --- |
| portada | "Hiciste todo lo que está abierto" |
| nodo de tema | "Repasar el tema" |
| nodo de lección | "Repasar la lección" |
| encabezado | 1/2 |

La portada declara cerrado lo que el camino pinta en ámbar como deuda
pendiente. Es el caso más grave porque es alcanzable hoy: basta terminar `l1`
con 1 de 3 ítems al primer intento.

**B. Una lección abierta y abandonada en el paso 0.** `registrarPaso` escribe la
fila `{pasoActual: 0, completada: false}` al montar el runner, o sea apenas se
abre la lección. `estadoDeLeccion` exige `pasoActual > 0` y la llama
`disponible`; la portada solo cuenta filas.

| superficie | dice |
| --- | --- |
| portada | "Te queda una lección del camino" |
| nodo de tema | "Empezar el tema" |
| nodo de lección | "Empezar la lección" |
| encabezado | 0/2 |

La portada afirma un avance que el resto de la aplicación no ve. Es el mismo
defecto que el pliegue acaba de corregir un nivel más arriba, y por el mismo
motivo: contar filas guardadas en vez de preguntar por el estado.

**Arreglo propuesto** —ejecutado tal cual el 2026-07-27, ver el cierre arriba—:
que `PuntoDePartida` calcule
`estadoDeLeccion(l, progreso, resumen)` por cada lección abierta y decida sobre
esas etiquetas, igual que hace ahora `estadoDeNodo`. La rama 2 apuntaría a la
primera lección `enCurso` o `porRepasar`, y la rama 3 exigiría que ninguna
quede en `porRepasar`.

> Se ejecutó con una corrección: la deuda quedó en **rama propia**, no repartida
> entre la 2 y la 3. `porRepasar` es "terminada y floja", no "pendiente sin
> tocar"; meterla en la rama 2 juntaba dos estados distintos y obligaba a
> cambiar su copy igual, así que no ahorraba nada.

Requiere decidir el copy de una rama nueva: hoy no hay
texto para "terminaste todo pero algo quedó flojo", y meterlo en la rama 3 sin
cambiar el copy volvería a decir "hiciste todo" sobre una deuda abierta.

**Nota menor de deriva doc↔código, sin acción.** MASTER.md §3.2 todavía
describe los estados con badges y barra de progreso interna ("En curso: barra
de progreso interna visible"), que es el vocabulario de la tarjeta por nodo que
la enmienda del 2026-07-27 retiró. La misma sección ya declara arriba que un
nodo es un disco y un título, así que el párrafo de estados quedó como resto.
No se toca acá: enmendar MASTER.md es 🟡 y no se pidió.

---

Fecha: 2026-07-27

## Índice de lo que sigue abierto (consolidación pre-push)

Este documento creció por acumulación y ya no se puede leer de corrido para
saber qué falta. Esta sección es el índice: **solo lo que sigue abierto**, con
su estado real verificado contra el código, no contra notas anteriores. Lo
resuelto queda arriba, en su sección, marcado y con el commit que lo cerró.

### a) `l2` y `l3` en borrador, esperando revisión matemática

Verificado leyendo los JSON, no las notas:

| archivo | estado | revisión matemática |
| --- | --- | --- |
| `l1-patrones-de-cambio` | `publicable` | aprobada |
| `l2-pendiente-e-intercepto` | `borrador` | sin aprobar |
| `l3-ecuaciones-lineales` | `borrador` | sin aprobar |
| `cierre` | `revision` | — |
| `diagnostico` | `revision` | — |

Consecuencia en pantalla, hoy: `l1` es la **única** lección navegable. `l2` y
`l3` se pintan como nodos en construcción (contorno punteado, sin tarjeta, no
seleccionables) y no tumban el build — `idsPublicables()` las deja fuera de
`generateStaticParams`. `cierre` y `diagnostico` son navegables con el chip
"Demostración", que es la decisión del 2026-07-25.

Desbloquea: `/revision-matematica` y `/revision-originalidad` sobre cada una.
Es trabajo de contenido, no de código. Los siete campos exactos que faltan en
cada archivo, y el orden de pasos una vez firmada la revisión, están en
`docs/publicacion-l2-l3.md` (2026-07-27) — incluye un hallazgo en `l3`: un
falso positivo del validador de placeholders ("TODO" en mayúsculas usado como
énfasis en español, no como marcador de trabajo pendiente) que hay que
reescribir antes de poder marcar `publicable`. **🔴 tocar estos JSON o marcar algo
`publicable` requiere firma.**

### b) La celebración de tema no tiene ruta de flujo real

Sigue vigente tal como se anotó el 2026-07-26. Un tema se completa solo con
**todas** sus lecciones declaradas publicables y completadas, más su cierre; con
`l2` en borrador, `funcion-lineal-y-afin` no puede completarse jugando y
`/tema/funcion-lineal-y-afin/completado` no se alcanza salvo por URL directa.

Es el comportamiento correcto, no una regresión: son 16 celebraciones en todo el
curso, son idempotentes, y una gastada en falso es una que el estudiante no
vuelve a ver. La pantalla está construida y cubierta por test. Se alcanza sola
en cuanto `l2` cruce revisión. **No hay nada que reprogramar** — depende de (a).

### c) `porRepasar` junto a una lección sin tocar, en la portada

La rama de deuda de la portada exige que *nada* esté `enCurso` ni `disponible`.
Con una lección `porRepasar` y otra abierta sin tocar, la portada muestra la
rama 2 y apunta a la segunda sin nombrar la deuda; el camino sí la pinta ámbar.

No es contradicción —la portada responde "qué hago ahora", el nodo responde
"cómo va esto"— y **hoy es inalcanzable**, porque `l1` es la única publicable.
Depende de (a): revisar cuando `l2` cruce revisión. Si ahí se decide que la
deuda manda sobre avanzar, es mover una guarda de lugar en
`components/PuntoDePartida.tsx`.

### d) `migrarProgresoLocal` no la llama nadie

`lib/datos/progreso.ts:205` existe y está probada del lado del servidor, pero
**ningún archivo de `app/` o `components/` la invoca**. O sea: el progreso
guardado en el dispositivo no sube a la base al crear cuenta.

Consecuencia que ya está cubierta y no hay que romper: ningún texto de la
interfaz afirma ni insinúa que la cuenta guarda, protege o recupera el avance.
Con esta pieza sin construir sería falso, y `components/PuntoDePartida.tsx` lo
documenta en su cabecera para que no se deshaga por accidente.

Gatillo para retomarlo: cuando se quiera medir el delta pre/post de estudiantes
concretos y no solo agregados de sesión. Antes de eso no compra nada.

### e) Clerk sigue en instancia development

Clerk no permite crear instancia de producción con dominio `*.vercel.app`:
exige dominio propio verificable por DNS. Confirmado contra su documentación el
2026-07-24. No es un problema de configuración, es una restricción de la
plataforma.

Hoy en Vercel Production corren claves `pk_test_` / `sk_test_` y un signing
secret de development, y el camino feliz está verificado end-to-end contra esa
instancia. **Funciona, pero no es producción de verdad.**

Cuando se compre el dominio: crear la instancia de producción, repetir el
endpoint del webhook con los mismos tres eventos, y actualizar el nuevo signing
secret en `.env.local` y en Vercel. Son dos endpoints y dos secrets
independientes: que development funcione no dice nada de producción.

### Lo que NO está abierto, para no volver a revisarlo

- Coherencia de progreso entre las cuatro superficies — cerrada en `3b4385b` y
  `e958117`, con test que las recorre juntas (`0b56d02`).
- Un tema se completa por sus lecciones declaradas y no por las abiertas —
  cerrada en `7ac140e`.
- El camino como única navegación, con la grilla retirada — `6bac9ce`.
- Dirección del recorrido y nodos sin tarjeta — `fc7bc3d`, con MASTER.md §3.2
  enmendado en el mismo commit.

---

Fecha: 2026-07-27

## Deuda de historia — CERRADA, no se reescribe

**Push realizado con firma de Benjamín Gutiérrez, 2026-07-27.** Los 30 commits
de las sesiones del camino (`88ed670..a48a68c`) están en `origin/master`.
Decisión explícita: no reescribir historia por lo que sigue, porque el riesgo
de reescribir 30 commits ya pusheados supera el problema que resolvería.

- **`74f53a0`** — el mensaje dice `docs: separa "bloqueada por prerrequisito" de
  "en construccion"` y en efecto enmienda MASTER.md, pero el mismo commit
  agrega `docs/ideas-en-espera/plan-semanal.md` (79 líneas, idea de producto sin
  código) sin mencionarlo. El contenido es correcto y legítimo; el mensaje no lo
  describe. Queda así.
- **`868dd4c`** y **`7ac140e`** — `lib/estadoNodo.ts` entró como binario
  (`Bin 0 -> 2854 bytes` / `Bin 2854 -> 5239 bytes`) porque se creó en UTF-16 y
  se convirtió a UTF-8 después. `git log -p` sobre ese archivo se salta esos dos
  commits. El archivo hoy es UTF-8 limpio y el diff acumulado no tiene binarios;
  solo el historial fino de esos dos commits queda ilegible con `-p`.

Si algún día hace falta leer el contenido real de esos dos commits, usar
`git show <hash>:lib/estadoNodo.ts` en vez de `git log -p` — el blob se lee
igual, aunque el diff no se muestre como texto.

---

Fecha: 2026-07-27 (sesión de instrumentación + slider de dos variables)

## Instrumentación PostHog del camino — qué quedó cubierto y qué no

Los ocho eventos pedidos están instrumentados y verificados uno por uno en el
navegador, con las correcciones que aparecen en el commit
`instrumenta PostHog en las superficies del camino rediseñado`: `camino_visto`,
`nodo_tema_abierto`, `nodo_leccion_abierto`, `leccion_terminada`,
`repaso_elegido`, `camino_elegido`, `tema_celebrado`,
`temas_plegados_expandidos`.

**Lo que NO quedó cubierto, a propósito por alcance de la tarea, no por
olvido:**

- **`components/PuntoDePartida.tsx` (la portada) no dispara nada.** Sus
  botones ("Empezar la primera lección", "Continuar: tema · lección",
  "Repasar: tema · lección") son la otra puerta de entrada a una lección,
  distinta de los nodos del camino, y hoy no llaman a `registrarEvento` en
  ningún lado. Un estudiante que siempre entra por la portada nunca dispara
  `nodo_leccion_abierto` — solo lo hace quien entra navegando el camino
  visualmente. Si en algún momento importa saber "cuántas lecciones se abren
  desde la portada vs. desde el camino", hoy esa pregunta no se puede
  responder. No se instrumentó porque la Tarea 1 pedía específicamente los
  nodos del camino (`nodo_tema_abierto` / `nodo_leccion_abierto`), no la
  portada; ampliarlo es una decisión de alcance, no una corrección de bug.
- **`/diagnostico` y `/cierre` no tienen eventos propios del rediseño.** Usan
  `leccion_fin`-adyacentes existentes indirectamente (el cierre entra por
  `EjecutorSetItems`, igual que las lecciones, pero `ItemsPAESFinal` es
  específico de lecciones — el cierre usa su propio `CierreFinal.tsx`, sin
  tocar). No estaba en la lista de la Tarea 1.

**Bug encontrado y corregido: doble disparo por re-invocación de React en
desarrollo.** Dos de los eventos nuevos se disparaban dos veces por una sola
acción del estudiante, verificado en el navegador con un acumulador en
`window` (más confiable que el lector de consola de la extensión, que repite
su buffer entero después de cada navegación):

1. `temas_plegados_expandidos` vivía dentro del *updater* funcional de
   `setExpandido`, que React vuelve a invocar en modo estricto de desarrollo
   para detectar impurezas. Se sacó el efecto del updater.
2. `leccion_terminada` no tenía guardia contra el mismo problema. Se le agregó
   el mismo `ref` que `CelebracionTema.tsx` ya usa para esto — patrón
   preexistente en el código, no uno nuevo.

**Hallazgo sin corregir, fuera de alcance de esta tarea:** `leccion_inicio` y
`paso_inicio` (`components/RunnerLeccion.tsx`, código preexistente, no tocado
en esta sesión) se disparan dos veces bajo la misma causa, pero **solo en
navegación cliente** (clic en un `<Link>` que lleva a `/leccion/[id]`, no URL
directa) **y solo en desarrollo** — no se reprodujo en el primer walkthrough
de esta sesión (que entraba por URL directa) y sí en el segundo (que entraba
por clic desde `/tema/[id]`). No se tocó porque no es parte de lo pedido en
esta sesión y modificar código no instrumentado por esta tarea es una
ampliación de alcance que no se pidió. Si se retoma: mismo arreglo que los dos
de arriba, un `ref` de una sola escritura alrededor de la llamada a
`registrarEvento` en los dos efectos de `RunnerLeccion.tsx`.

Confirmado explícitamente que ninguno de los ocho eventos nuevos toca
`PostHogProvider.tsx`: `autocapture: false`, `disable_session_recording: true`
y `persistence: "memory"` siguen exactamente como estaban.

## Slider de dos variables (dosVariables) — construido, sin lección que lo use

`components/grafico/GraficoPendiente.tsx` y el nuevo
`components/grafico/SecuenciaMicropreguntas.tsx` implementan el guion
predice → mueve → comprueba que el schema declaraba desde antes
(`secuenciaMicropreguntas`) y que ninguna lección publicada usa todavía —
`l2-pendiente-e-intercepto` sigue en `unaVariable` únicamente. Verificado en
`/vista-previa/interactivo-dos-variables` (ruta interna, sin enlazar,
`robots: noindex`, con datos de `e2e/fixtures/bloqueDosVariables.ts`, nunca de
`content/`) y cubierto por `e2e/interactivo-dos-variables.spec.ts`.

**Consecuencia práctica para cuando se escriba contenido que use
`dosVariables`:** las opciones de predicción que ve el estudiante son
exactamente las cadenas de `feedbackPorPrediccion[].prediccion` de cada
`MicropreguntaSlider`, presentadas como botones seleccionables — no hay
matching de texto libre. Quien redacte una lección con esta variante tiene que
escribir `prediccion` como una etiqueta corta y legible para el estudiante
("También sube", no una descripción interna), porque se muestra tal cual, no
se interpreta.

---

Fecha: 2026-07-29

## Estado real del módulo "Función lineal y afín": 2/3 lecciones

Registro de estado, no acción — no se escribe la tercera lección hoy, solo se
deja constancia antes de decidir cuándo abordarla.

El módulo declara 3 lecciones (Enmienda 2, `mos-v2.md` §13): patrones de
cambio, pendiente e intercepto, modelamiento PAES. Las dos primeras existen
como archivo (`lineal-patrones-de-cambio.json`, `lineal-pendiente-e-intercepto.json`);
la tercera — modelamiento PAES — **no está escrita**. Sigue en 2/3.

No confundir con `ecuaciones-lineales.json`: pertenece al módulo "Ecuaciones e
inecuaciones de primer grado" desde la Enmienda 2, no cuenta como la lección
que falta aquí.

## Cierre: revisión de diferenciación L1 vs L3 (2026-07-29)

Verificada paso a paso en producción (`plataforma-paes.vercel.app`) con
browser real tras el push de `76cec8c` — no solo lectura de JSON, mismo
método que destapó el bug del paso 5 de L2 (ese no era visible en el archivo,
solo renderizado).

Recorridos los 10 pasos de `ecuaciones-lineales.json` (L3) y comparados en
pantalla contra los pasos equivalentes de `lineal-patrones-de-cambio.json`
(L1), específicamente los reescritos el 2026-07-27 para diferenciar (palancas
A, B, F, G, H documentadas en el propio JSON):

- **Paso 1** (palanca B): formato distinto — tabla en L1, prosa+balanza en L3.
- **Paso 2** (palanca F): confirmado en pantalla — L1 un solo bloque de
  selección; L3 agrega un segundo bloque `verdaderoFalso` (generaliza con
  números "feos").
- **Paso 3** (palanca G): confirmado en pantalla — L1 repite el mismo tipo de
  cálculo dos veces (semana 3 y 8); L3 el segundo campo es una tarea de
  naturaleza distinta (comprobación).
- **Paso 4** (palanca H): pista 3 da la operación sin resolverla en ambas
  lecciones — mismo principio pedagógico correcto, aplicado a operaciones
  distintas. No es superposición.
- **Paso 7** (reorden): confirmado en pantalla — L1 mantiene orden plano
  numérica→verdaderoFalso→selección; L3 invierte a
  selección→verdaderoFalso→numérica.
- **Paso 8** (palanca A): confirmado en pantalla — L1 pide la fórmula antes
  de calcular; L3 invierte el orden (resuelve primero, formaliza después).
- **Pasos 9-10**: sin cambio estructural, decisión consciente documentada en
  el JSON (forzar una palanca ahí sería abstracción sin propósito).

**Resultado: diferenciación estructural real en todos los pasos revisados** —
cambia el número de bloques, el tipo de bloque, el orden, o qué se pide
resolver primero. Ningún paso se sintió cosmético (mismo patrón con números o
nombres distintos). Sin problemas de renderizado: 10 pasos cargaron sin
errores de consola, sin contenido cortado, pistas progresivas funcionando.

**Marcado como cerrado — no repetir esta auditoría** salvo que se vuelva a
tocar el contenido de L1 o L3.

**No resuelve** el ítem 🔴 al inicio de este documento: la revisión
matemática real de L2/L3 sigue abierta (firma de 2026-07-27 administrativa,
temporal para la demo del profesor). Esta sección es sobre diferenciación
estructural, no sobre corrección matemática.
