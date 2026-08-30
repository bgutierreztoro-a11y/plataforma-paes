# Deuda técnica: resolución cross-file de `errorCatalogado`

Estado: **registrado, sin corregir.** No bloquea ningún módulo — el patrón ya está en producción en varios de ellos y sistemas-2x2 no está peor que el resto. Se documenta acá para decidir la corrección aparte, con su propio alcance y prioridad.

Descubierto: 2026-08-20, durante la auditoría matemática (Ronda 1) del módulo "Sistemas de ecuaciones lineales (2x2)".

## El mecanismo exacto

`lib/sanitizar.ts` resuelve `errorCatalogado` → `descripcionError` **estrictamente contra el `catalogoErrores` del mismo objeto que se está sanitizando**, sin cargar ni fusionar el catálogo de ningún otro archivo:

- `lib/sanitizar.ts:147-149` — `catalogoDe(contenido)` construye el `Map` únicamente desde `contenido.catalogoErrores ?? []`.
- `lib/sanitizar.ts:151-157` — `prepararParaCliente(contenido)` llama `catalogoDe(contenido)` pasando el mismo objeto que recibió `sanitizarLeccion`/`sanitizarCierre`, y resuelve `resolverDescripcionesDeError` contra ese único catálogo.
- `lib/sanitizar.ts:176-186` — `sanitizarLeccion(leccion)` y `sanitizarCierre(cierre)` reciben **un solo archivo de contenido** por llamada.
- `app/leccion/[id]/page.tsx:25,47` — `obtenerLeccion(id)` (`lib/contenido.ts:120-123`) lee exactamente `content/lecciones/<id>.json`; ningún punto del pipeline carga la lección L1 del módulo cuando se renderiza L2, L3 o el cierre.

Es un comportamiento **documentado como intencional** en el propio código (`lib/sanitizar.ts:94-99`): *"la resolución es estrictamente local al archivo: sin `catalogoErrores`, no se resuelve nada. Un id sin entrada se deja sin descripción en vez de adivinar."* El fallback es silencioso — no hay error, no hay warning, `resolverDescripcionesDeError` (línea 122-145) simplemente omite `descripcionError` cuando `catalogo.get(id)` es `undefined` (línea 137-138).

Este diseño choca con la decisión de arquitectura documentada en `docs/reglas-modulo.md §5` y citada en `scripts/auditar-leccion.mjs:412-417`: *"cada lección embebe el subconjunto del catálogo de su módulo que realmente usa, copiado literalmente. Eso es lo único que hace funcionar la Capa 2 del feedback."* Cuando una lección L2/L3 o un cierre reutiliza un id de la L1 sin copiar esa entrada localmente, la Capa 2 (el mensaje "el mecanismo del error" que se muestra tras fallar un distractor) **nunca se muestra** para ese distractor — sin que nada lo detecte: `npm run auditar` solo verifica cada archivo contra su propio `catalogoErrores` (`scripts/auditar-leccion.mjs:157-183`, se salta por completo si el archivo no tiene catálogo propio), y `lib/sanitizar.test.ts` solo prueba con un objeto lección sintético de un único archivo — no existe ningún test que arme un escenario de dos archivos.

## Archivos afectados

Verificado programáticamente (`node -e`, cruzando "¿usa `errorCatalogado`?" contra "¿tiene su propio `catalogoErrores` no vacío?") sobre los 26 archivos de `content/lecciones/` y los 7 de `content/cierres/`.

**10 lecciones**, en 5 módulos:

| Módulo | Lecciones afectadas | Lecciones del módulo con catálogo propio (no afectadas) |
|---|---|---|
| `porcentaje` | `porcentaje-concepto.json`, `porcentaje-rebaja-doble.json`, `porcentaje-volver-atras.json` | ninguna — el módulo completo carece de catálogo local en cualquier lección |
| `enteros-racionales` | `enteros-operar-y-comparar.json`, `enteros-problemas-en-contexto.json` | `enteros-operar-y-ordenar.json` |
| `ecuaciones-inecuaciones` | `inecuaciones-resolucion.json`, `inecuaciones-problemas.json` | `ecuaciones-lineales.json` |
| `funcion-lineal-afin` | `lineal-modelamiento-paes.json` | `lineal-patrones-de-cambio.json`, `lineal-pendiente-e-intercepto.json` |
| `sistemas-2x2` | `sistemas-rectas-no-se-cruzan.json`, `sistemas-plantear-antes-resolver.json` | `sistemas-dos-historias.json` |

**4 cierres**, sin catálogo propio (mismo síntoma: cualquier `errorCatalogado` que traigan queda mudo):

- `cierre-ecuaciones-lineales.json`
- `cierre-enteros-racionales.json`
- `cierre-porcentaje.json`
- `cierre-sistemas-2x2.json`

Módulos **sin** el problema — cada lección trae su propio `catalogoErrores`, o el cierre lo trae: `expresiones-algebraicas` (incluido `cierre-expresiones-algebraicas.json`, que sí tiene catálogo propio), `proporcionalidad` (incluido `cierre-proporcionalidad.json`, ídem), `potencias-raices`.

**Caso más claro de "ya en producción":** `porcentaje` está registrado en `lib/modulos.ts:194-205` con `cierreId: "cierre-porcentaje"`, sus 3 lecciones existen en disco y pasan por el mismo `obtenerLeccion()`/`sanitizarLeccion()` que cualquier otro módulo. No es contenido borrador. La Capa 2 nunca se ha mostrado para ningún distractor de ese módulo desde que se publicó.

## Dos opciones de fix a nivel de arquitectura

### (a) Cada L2/L3/cierre incluye su propio subconjunto local de `catalogoErrores`

Copiar, en cada archivo afectado, las entradas exactas (id + descripción) de los ids de la L1 que ese archivo realmente usa — tal como ya hacen `expresiones-algebraicas` y `proporcionalidad`.

- A favor: cero cambios de código; `lib/sanitizar.ts` sigue funcionando exactamente como está y como lo prueba `lib/sanitizar.test.ts`. Consistente con el patrón que ya usan 3 de los 8 módulos existentes.
- En contra: duplica descripciones textuales entre archivos del mismo módulo, rompiendo la regla implícita "el catálogo del módulo vive una sola vez" que las `_notasInternas` de sistemas-2x2 declaraban (incorrectamente, a la luz de este hallazgo). Introduce el riesgo que `scripts/auditar-leccion.mjs` ya anticipa y cubre parcialmente: `chequearDivergenciaDeCatalogo` (líneas ~429-460) detecta si dos archivos del mismo módulo declaran el mismo id con descripción distinta — pero solo entre archivos que SÍ tienen catálogo propio; no fuerza a que lo tengan.

### (b) `sanitizarLeccion()`/`sanitizarCierre()` cargan también el `catalogoErrores` de la L1 del módulo

Resolver en runtime a qué módulo pertenece la lección/cierre (vía `lib/modulos.ts`, que ya tiene el árbol eje → tema → lecciones/cierreId) y, si el archivo no trae `catalogoErrores` propio, cargar el de la L1 del mismo módulo antes de llamar `resolverDescripcionesDeError`.

- A favor: una sola fuente de verdad por módulo, sin duplicación de texto.
- En contra: acopla `lib/sanitizar.ts` (hoy agnóstico de la posición de un archivo en el árbol de módulos) a `lib/modulos.ts`, y requiere resolver "cuál es la L1 de este módulo" de forma confiable para lecciones y para cierres — hoy `lib/modulos.ts` no expone esa función. También reabre la razón por la que la resolución se hizo local en primer lugar (`lib/sanitizar.ts:94-97`): los ids de `content/errores/` sí llevan namespace de unidad y los cierres mezclan ítems de más de una unidad; habría que confirmar que ningún cierre afectado combina ítems de dos módulos distintos antes de asumir "la L1 del módulo" como fuente única.

## Registro de propagaciones manuales (patrón (a), mientras no haya fix de arquitectura)

- **2026-08-29 — `figuras-geometricas`, `error-12`:** propagado desde L1 (`figuras-triangulo-no-se-rompe.json`, donde nació en el commit `84a3bbb`) a L2 (`figuras-borde-y-superficie.json`), copiado byte a byte (guard `catalogo-divergente` en verde). Único uso en L2: la opción incorrecta del bloque de selección de clasificación "¿aplica el atajo del trío?" del paso `aplicacion`. **Pendiente en L3:** el paso `practica` de `figuras-problemas-con-forma.json` ya tiene un distractor (opción `b` de la primera `seleccion`, "15 metros" — forzar el trío 8-15-17 sobre una cumbrera de 18) cuyo mecanismo ES `error-12`; su `feedback` artesanal hace el trabajo pedagógico completo con el patrón de redacción de L1, pero **no lleva el campo `errorCatalogado` todavía** porque `error-12` aún no está en el `catalogoErrores` embebido de L3 y las guardas `catalogo-colgando` / `catalogo-sin-usar` de `npm run auditar` exigen que la entrada del catálogo y el tag entren juntos. Cuando se aplique el fix (patrón (a): copiar `error-12` byte a byte desde L1 al catálogo de L3; o patrón (b): resolución crossfile), se añade `"errorCatalogado": "error-12"` a esa opción `b`. **Pendiente en el cierre:** propagar `error-12` a `cierre-figuras-geometricas.json` solo si llega a referenciarlo. → **Resuelto el 2026-08-29, ver la entrada siguiente.**
- **2026-08-29 — `figuras-geometricas`, `error-12` → el cierre:** al rediseñar las ternas de `content/cierres/cierre-figuras-geometricas.json` (dos ítems pasaron a hipotenusa irracional), el cierre pasó a referenciar `error-12` en dos distractores: `cierre-figuras-1` alternativa D (forzar 20-48-52 sobre los catetos 20 y 50) y `cierre-figuras-7` alternativa C (forzar 8-15-17 sobre los catetos 15 y 9). La entrada se copió **byte a byte** desde `figuras-triangulo-no-se-rompe.json`, igual que en L2 (igualdad verificada programáticamente con `node -e`). En la misma edición **salió `error-6`** del catálogo del cierre: su único uso era el distractor `4.624` de `cierre-figuras-1`, que el rediseño reemplazó. **Nota de alcance del guard:** esta propagación no la habría detectado ninguna herramienta. `chequearCatalogoErrores` (`scripts/auditar-leccion.mjs:158-185`) recorre `itemsPAES` y bloques de pasos, no el campo `items` de un cierre, y `npm run validar` solo cruza `errorCatalogado` contra el catálogo para ítems de diagnóstico (`scripts/validar-contenido.mjs`, reglas 6d/6e). Los cierres quedan fuera de las guardas `catalogo-colgando` / `catalogo-sin-usar` / `catalogo-divergente`: extender esos chequeos a `content/cierres/` es un candidato concreto de fix, independiente de elegir entre (a) y (b).

- **2026-08-30 — `figuras-geometricas`, `error-12` → L3 (cierra el "Pendiente en L3" de la entrada del 2026-08-29):** `error-12` se copió **byte a byte** desde `figuras-triangulo-no-se-rompe.json` al `catalogoErrores` de `figuras-problemas-con-forma.json` (igualdad verificada con `node -e`: `JSON.stringify` de ambas entradas idéntico; el id no colisionaba con ninguno de los siete que L3 ya traía). Con la entrada en el catálogo, el distractor que estaba esperando el tag —opción `b` "15 metros" de la selección del triángulo, paso `practica`— **ya lo lleva**. En la misma edición el paso `practica` ganó un bloque de clasificación previo, calcado de `pasos[6].bloques[0]` de L1 y `pasos[7].bloques[0]` de L2, cuya opción incorrecta es el **segundo** uso de `error-12` en el archivo: mismo mecanismo ejercitado dos veces, una clasificando y otra calculando. Total de usos de `errorCatalogado` en L3: de 27 a 29. Guardas verificadas: `catalogo-colgando` y `catalogo-sin-usar` en verde (cero ids colgantes, cero entradas sin usar), `catalogo-divergente` en verde para los tres archivos `figuras-*`. **Estado del módulo `figuras-geometricas`:** con esto la propagación manual de `error-12` queda completa —L1 (origen), L2, L3 y `cierre-figuras-geometricas.json`—; no queda ningún archivo del módulo referenciando un id que su propio catálogo no defina. Esto **no** resuelve la deuda de arquitectura: solo agota el patrón (a) para este módulo. Los otros 10 archivos de la tabla de arriba siguen afectados, y la brecha de guardas sobre `content/cierres/` descrita en la entrada anterior sigue abierta. **Decisión de producto (2026-08-30):** la descripción de `error-12` se mantiene **genérica** en los cuatro archivos del módulo, sin ajustarla al uso de L3. L1, L2 y el cierre lo aplican como *(cateto, cateto) → hipotenusa forzada*; L3 lo aplica en la dirección **inversa**, *(cateto, hipotenusa) → cateto/altura forzada*. No se toca el texto del catálogo: describe el patrón de razonamiento ("ver números parecidos a un trío y dar por hecho el lado que falta sin comprobar que los demás calcen; el resultado puede ser irracional"), no una fórmula, así que cubre ambas direcciones, y precisar cuál aplica en cada distractor es trabajo del `feedback` artesanal, no del catálogo. Ajustar el texto habría roto la igualdad byte a byte y disparado `catalogo-divergente`. **Rondas 1 (matemática) y 2 (originalidad)** de esta edición: corridas el 2026-08-30, **OK / NO BLOQUEA** — sin hallazgos, sin correcciones.

## Qué no cubre este documento

Elegir entre (a) y (b), o una tercera opción, es una decisión de arquitectura pendiente — no se toma acá. Este documento solo registra el mecanismo y el alcance verificado para que esa decisión se tome con datos exactos.
