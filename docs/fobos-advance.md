# Fobos Advance

Manual de construcción. Documento vivo, vive en `docs/fobos-advance.md`.

Versión 1, 06-09-2026. Reemplaza a `V1 — Definición y construcción del Modo PAES de Fobos.md`, que queda archivado como referencia histórica.

---

## 0. Qué es Fobos Advance

Fobos (gratis) enseña la materia. Fobos Advance enseña a **rendir la prueba**.

Esa frase no es marketing, es el criterio de admisión de cada feature. Si algo que se propone construir también tendría sentido dentro de una lección gratis, no pertenece a Advance.

### La tesis

Advance no compite en inventario de ejercicios. SimplePAES ya tiene más de 4.600 y los regala. Advance compite en **granularidad del diagnóstico**: el catálogo de aproximadamente 25 errores por módulo, mapeado a nivel de distractor individual, es la única pieza que nadie más tiene y que no se puede copiar sin rehacerla desde cero.

Todo lo que se construya en Advance tiene que consumir ese catálogo. Si una feature no toca `catalogoErrores`, probablemente no es Advance.

### Qué es

Una capa de entrenamiento posterior al aprendizaje, con cinco mecánicas:

1. **Modo descarte.** Eliminar alternativas en vez de resolver.
2. **Panel de desempeño 2×2.** Acierto cruzado con tiempo.
3. **Ciclo de vida del error.** Abierto, en observación, cerrado.
4. **Mapa de recuperables.** Qué preguntas estás perdiendo hoy por errores abiertos.
5. **Triage de 20 segundos.** Decidir si una pregunta se resuelve, se deja o se marca.

### Qué no es

No es más contenido. No es un curso paralelo. No es un tutor de IA. No es gamificación. No hay XP, monedas, rachas, ni confeti. No hay ranking. No hay video.

### Modelo comercial

Suscripción por temporada PAES. Se activa al contratar y termina con la rendición. No es mensualidad indefinida ni compra única.

Razones: la compra única choca con el derecho a retracto en contratos de educación; la mensualidad indefinida obliga a un flujo de cancelación que un menor no debería tener que administrar. La temporada tiene fin natural y es honesta sobre lo que se vende.

Techo de precio: bajo $8.000 CLP mensuales equivalentes, que es lo que cobra SimplePAES.

---

## 1. Cómo trabajamos

### División de roles

**Benja decide y firma. CC ejecuta en el repo. Este chat es la capa de arquitectura y revisión.**

| Tarea | Quién |
|---|---|
| Decisiones pedagógicas y de producto | Benja |
| Firma de cualquier cambio en `content/`, `schema`, o migraciones | Benja |
| `git push` | Benja, siempre, sin excepción |
| Edición de `CLAUDE.md` | Benja, CC nunca lo toca |
| Correr `consultar-fuentes.mjs` | Benja, fuera de toda sesión de CC |
| Actualizar el MOS | Benja |
| Trámites legales y contables | Benja |
| Escribir código, tests, docs técnicos | CC |
| Proponer arquitectura en Plan Mode | CC |
| Auditorías de contenido | CC, en hilos `/clear` aislados |

### Semáforo de autonomía de CC

- 🟢 **Sin consultar:** CSS, tokens, documentación técnica, tests, refactor interno sin cambio de props.
- 🟡 **Requiere aprobación:** componentes nuevos, cambios de props, rutas nuevas, dependencias.
- 🔴 **Requiere firma explícita de Benja:** `content/`, schema, migraciones de base de datos, `git push`, cualquier promesa de persistencia, cualquier texto que hable de precio.

### Protocolo de sesión

1. `git fetch` al inicio, siempre. Conocer el estado real de origin antes de tocar nada.
2. CC entra en Plan Mode y propone. No escribe archivos antes de la aprobación.
3. Paradas explícitas entre sub-fases (PARADA 1, PARADA 2). En cada parada CC muestra lo hecho y espera.
4. Verificación real, no calculada: clic de mouse a 390×844, `prefers-reduced-motion` emulado, contraste medido, `npm run validar`, `tsc`, `lint`, `npm run capturas`.
5. Commits separados por concern. Prefijo `advance:` en todos los commits de esta línea de trabajo.
6. `git add` por path explícito. Nunca `-A`, nunca `.`.
7. Push manual de Benja tras revisar diffs.

### Regla de aislamiento (nueva, crítica)

**Ningún commit de Advance toca `components/leccion/`, `components/camino/` ni `content/lecciones/`.**

La única excepción es el punto de entrada en el riel (fase 1.3), que es un commit propio, revisado aparte, y que solo agrega un componente sin modificar la lógica existente de `RielEstaciones.tsx`.

Si Advance necesita algo de un componente de la capa gratis, primero se extrae a `components/ui/` en un commit separado, y recién después se usa. Esto mantiene la capa gratis auditable por sí sola y evita que una regresión de Advance rompa lo que ya está en producción.

Los tres archivos excluidos de siempre siguen excluidos: `docs/mapa-modulos-m1.md`, `lib/modulos.ts`, `content/cierres/cierre-cuerpos-geometricos.json`.

Excepción puntual de F0, registrada al cierre de F1 (2026-09-11): `9ec800b` (declarar `moduloId` en los 44 archivos de contenido) y `43b5321` (retirar catálogos embebidos, lote 1) tocaron `content/cierres/cierre-cuerpos-geometricos.json`. Fue parte de la migración masiva al catálogo canónico, que por definición aplicaba a todo `content/`, y el resultado es obligatorio para pasar `npm run validar` (`moduloId` exigido desde 3958991). Se acepta tal cual y no se repite: ningún commit posterior toca ese archivo.

---

## 2. Arquitectura de separación

Advance es producto pago. La separación tiene que ser estructural, no una condición `if` regada por el código.

### 2.1 Plano de código

```
app/advance/                     ruta raíz propia, nunca anidada en /linea o /camino
  page.tsx                       portada: qué hacer ahora
  puerta/page.tsx                qué es Advance, para quien no tiene acceso
  descarte/[unidadId]/page.tsx   sesión de descarte
  errores/page.tsx               ciclo de vida de los errores
  entrenar/[sesionId]/page.tsx   sesión de entrenamiento
  desempeno/page.tsx             panel 2×2, fuera de F4 (§6.2)

components/advance/              todo lo exclusivo de Advance
  EjecutorDescarte.tsx
  AlternativaDescartable.tsx
  ResultadoDescarte.tsx
  TarjetaEstadoError.tsx         era TarjetaError.tsx en el plano; renombrado el 2026-09-12 para no colisionar con components/ui/linea/TarjetaError.tsx
  PanelDesempeno.tsx             fuera de F4 (§6.2)
  MapaRecuperables.tsx
  TramoAdvance.tsx               el punto de entrada en el riel
  PuertaAdvance.tsx              estado bloqueado

lib/advance/                     motor
  acceso.ts                      única fuente de verdad del gate
  descarte.ts                    lógica de la mecánica
  dominio.ts                     p(L), ciclo de vida del error
  seleccion.ts                   armado de sesiones
  repositorio.ts                 no existe: el SQL vive en lib/datos/ (F3, 2026-09-11);
                                 temporada.ts es la parte pura del acceso (F3, 2026-09-14)

content/advance/                 banco de ítems Advance
  schema/item-advance.schema.json
  <unidad-id>/banco.json
```

Reutilizables desde la capa gratis, sin duplicar: `Boton`, `PlacaLinea`, `BotonVolver`, `FranjaDeItems`, `SelloDeEstacion`, tokens de línea, `GlifoRepetir`, `PantallaCentrada`.

No se reutiliza `EjecutorSetItems` tal cual. El descarte tiene una máquina de estados distinta. Se escribe `EjecutorDescarte` nuevo, tomando de `EjecutorSetItems` la estructura de navegación entre ítems, no el manejo de respuesta.

### 2.2 Plano de acceso

`lib/advance/acceso.ts` es el único lugar donde se decide si alguien tiene Advance. Todo lo demás lo consume. Nunca un chequeo inline.

```ts
export type EstadoAdvance = "activo" | "sin-acceso" | "temporada-terminada";

export async function estadoAdvance(): Promise<EstadoAdvance>

export function advanceVisible(): boolean
```

Fase 1: `estadoAdvance` lee una variable de entorno (`NEXT_PUBLIC_ADVANCE_DEMO`) para poder construir y probar sin cuentas.
Fase 3 en adelante: lee Clerk y la base de datos.

`advanceVisible` es independiente del estado: dice si Advance existe en la interfaz. Lee `NEXT_PUBLIC_ADVANCE_VISIBLE`; sin ella, el tramo no se monta en el riel y toda ruta bajo `/advance` responde 404, así que producción queda idéntica a antes de F1 hasta que se decida mostrarlo. Se puede ver el tramo sin tener acceso, que es justamente el estado `sin-acceso`.

La firma de la función no cambia entre fases. Eso es deliberado: cuando llegue Clerk, no hay que tocar ninguna pantalla.

### 2.3 Plano de contenido

Advance tiene banco propio en `content/advance/`, con schema propio que es más estricto que el de lecciones.

Diferencia clave con el schema de lecciones: en Advance, **`feedbackDescarte` es obligatorio en los tres distractores, sin excepción**. Esa es la pieza de la que depende la mecánica de descarte, no el catálogo. El validador lo rechaza.

`errorCatalogado`, en cambio, es nullable desde el 2026-09-13, con la ausencia **declarada, nunca omitida**. Hasta ese día el schema lo exigía en los tres distractores; `docs/analisis/propuesta-catalogo-transversal.md` (sobre `frecuencia-demre-v2.json`) mostró que el 26,6 % de los distractores de las formas liberadas de DEMRE son valores plausibles que no derivan de ningún procedimiento errado escribible, así que el requisito era inalcanzable, no estricto. Un distractor sin error mapeado lleva `"errorCatalogado": null` y `"sinErrorCatalogado": { "motivo", "nota" }`, con `motivo` en `valor-plausible-no-derivable`, `creencia-sobre-un-paso`, `error-transversal-pendiente` o `sin-mecanismo-identificado`, y `nota` de una línea para el revisor. Null sin declaración es error; declaración con un `errorCatalogado` no nulo también.

Dos pisos de cobertura, los dos error y no advertencia: por ítem, al menos 1 de los 3 distractores con `errorCatalogado` (un ítem sin mapeos no alimenta el diagnóstico); por banco, al menos el 60 % de los distractores. `npm run validar` reporta el porcentaje real de cada banco siempre, aunque pase. En runtime, un distractor con `errorCatalogado` null cuenta como descarte pero no produce observación de diagnóstico ni estado en el ciclo de vida del error (§6.3), y el triage lo juzga solo sobre los distractores mapeados.

El banco Advance referencia el `catalogoErrores` del módulo correspondiente por id. No lo duplica y no inventa errores nuevos. Si un ítem Advance necesita un error que no está en el catálogo del módulo, CC se detiene y propone el texto del error nuevo a Benja antes de asignarle id.

---

## 3. Dónde aparece Advance en la experiencia

Decisión tomada: **opción A, cuarta capa de la metáfora**, más acceso secundario desde navegación.

El estudiante recorre la línea, completa las estaciones, y al final del riel aparece un tramo más. No es otra aplicación metida adentro, es continuación de la misma línea.

### 3.1 El tramo en el riel

`components/advance/TramoAdvance.tsx`, montado al final de `RielEstaciones.tsx` en `app/linea/[ejeId]/page.tsx`.

Dos estados:

**Sin acceso.** El tramo se ve, pero atenuado. Copy honesto de qué es, sin urgencia, sin cuenta regresiva, sin "última oportunidad". Precio visible y claro (ver sección 7.1). Un solo botón que lleva a la información completa.

**Con acceso.** El tramo es un destino más del riel, con su propio glifo y estado de progreso.

Restricción visual: el tramo bloqueado no puede dominar la pantalla ni interrumpir la lectura del riel. Es un tramo más allá del final, no un cartel.

### 3.2 Acceso secundario

Ítem en `NavInferior` que aparece solo cuando `estadoAdvance() === "activo"`. Sin acceso, el ítem no existe en la navegación. La puerta de entrada al pago es el riel, no la barra.

---

## 4. Las fases

Cada fase tiene criterio de salida verificable. No se pasa a la siguiente sin cumplirlo.

### F0 — Desbloqueo de datos (sin UI nueva) — CERRADA 2026-09-09

Sin esto, Advance es una carcasa. El modo descarte no funciona si un distractor no tiene error mapeado.

**0.1** Ejecutar los 22 hallazgos mecánicos de `npm run auditar`. Ya están identificados. Requieren firma 🔴 porque tocan `content/`.

**0.2** Resolver los 41 hallazgos con decisión pedagógica: `colision-distractor-correcta`, `catalogo-divergente`, `campo-sin-unidad`, `dificultad`, `habilidades`. Cada uno necesita decisión de Benja. Propuesta de método: CC agrupa los 41 por tipo y presenta lotes de decisión, no uno por uno.

**0.3** Crear `content/advance/schema/item-advance.schema.json` con `errorCatalogado` obligatorio en distractores (contrato superado el 2026-09-13, ver §2.3).

**0.4** En el schema de lecciones, `errorCatalogado` sube de opcional a **advertencia** del validador (no error), con reporte de cobertura. Sube a obligatorio solo cuando la cobertura llegue a 100%. Si se hace obligatorio antes, se rompen los 11 módulos publicados.

**0.5** (Benja) CERRADA 2026-09-14. MOS §7.1 y §7.3 actualizados, commit `b94bf14`. El material DEMRE liberado es utilizable como base directa de ítems de Advance declarando `fuenteOrigen: "demre-liberada"` + `referencia` + `notaAdaptacion`, los tres obligatorios por schema. La pregunta 1 del checklist de originalidad deja fuera a esos ítems y verifica atribución y adaptación real en vez de similitud. El material de privados sigue prohibido sin excepciones. Queda abierto el `<FECHA>` del criterio del abogado en la línea 103 del MOS.

**Criterio de salida:** `npm run auditar` reporta cero hallazgos 🔴 en las categorías `colision-distractor-correcta` y `catalogo-divergente`. Reporte de cobertura de `errorCatalogado` disponible por módulo.

**Registro de cierre (2026-09-09):**

1. `colision-distractor-correcta`: 0 🔴.
2. `catalogo-divergente`: 0 🔴. No es un chequeo activo que haya pasado: la categoría se retiró del auditor el 2026-09-08 (`scripts/auditar-leccion.mjs:380-387`, commits `6c8eedc`/`3958991`) porque la migración a catálogo canónico-único eliminó la posibilidad de divergencia entre fuentes. Es un cero estructural — no hay guard corriendo, no hay nada que pudiera reportar 🔴.
3. Reporte de cobertura por módulo: existe en `npm run validar` desde F0.4 (commit `745ee2e`). Total global 68,6% (430/627).

   | Módulo | Cobertura |
   |---|---|
   | porcentaje | 100.0% |
   | proporcionalidad | 100.0% |
   | enteros-racionales | 91.7% |
   | expresiones-algebraicas | 86.3% |
   | cuerpos-geometricos | 81.7% |
   | ecuaciones-inecuaciones | 75.4% |
   | potencias-raices | 70.4% |
   | figuras-geometricas | 68.3% |
   | funcion-lineal-afin | 42.9% |
   | sistemas-2x2 | 26.7% |
   | funcion-cuadratica | 25.0% |

**Deuda diferida, NO bloqueante de este cierre:** `cierre-v0.json` (cierre en producción de `funcion-lineal-afin` vía `lib/modulos.ts`) está en 0/24 distractores mapeados, y `l0-demo.json` en 0/9. Sin fecha de resolución todavía; queda como ítem abierto.

Recuento del 2026-09-14: `npm run auditar` da 0 🔴 y 242 🟡, todos `colision-entre-archivos`. Inventario completo en `docs/analisis/hallazgos-f0.md` (commit fb20927).

---

### F1 — Esqueleto de Advance (código, sin contenido nuevo) — CERRADA 2026-09-11

**1.1** `lib/advance/acceso.ts` con la firma final y implementación por variable de entorno.

**1.2** `app/advance/page.tsx`: portada mínima. Sin acceso, redirige a la puerta. Con acceso, muestra un estado vacío honesto ("todavía no hay entrenamientos disponibles").

**1.3** `TramoAdvance.tsx` montado en el riel, ambos estados. Commit propio, revisado aparte.

**1.4** `PuertaAdvance.tsx`: la pantalla de qué es Advance. Texto pendiente de la decisión legal de la sección 7.1.

**1.5** Sección en `app/_design/page.tsx` con el tramo en sus dos estados, sobre las cuatro líneas, para medir contraste.

**Criterio de salida:** con `NEXT_PUBLIC_ADVANCE_DEMO=1` se llega a `/advance` desde el riel; sin la variable, se llega a la puerta. Contraste AA medido en las cuatro líneas. Capturas e2e sin regresión respecto del baseline de `docs/deuda-e2e-capturas.md`.

**Registro de cierre F1, 2026-09-11.**

Criterio de salida cumplido, con clic real a 390×844 sobre `next dev`, reiniciando el servidor por combinación porque `NEXT_PUBLIC_` se inlinea. Sin flags, `/linea/numeros` no monta el tramo y `/advance` responde 404. Con `NEXT_PUBLIC_ADVANCE_VISIBLE=1`, el clic en el tramo atenuado lleva a `/advance/puerta?eje=numeros`, el retorno vuelve a `/linea/numeros`, `/advance?eje=numeros` redirige a `/advance/puerta?eje=numeros`, y `/advance/puerta?eje=basura` ignora el eje y vuelve a `/camino`. Con `VISIBLE=1` y `DEMO=1`, el clic en el tramo activo lleva a `/advance?eje=numeros` con el estado vacío y el retorno vuelve a la línea. En el build de producción sin flags (`npm run build` y `next start`), `/advance` y `/advance/puerta` dan 404 y el HTML de `/linea/numeros` es byte a byte el de antes de F1, salvo el `buildId` y el hash del chunk de `LineaDelEje`. `npm run capturas` sin flags dio 24 fallos, 4 omitidos y 46 pasados, y `comm` contra la lista de `docs/deuda-e2e-capturas.md` devolvió cero líneas: el conjunto exacto del baseline, sin regresión. `prefers-reduced-motion` emulado en riel, puerta y portada: `document.getAnimations()` en cero, contra cinco animaciones sin la preferencia.

Contraste medido en render sobre `/_design` (colores computados en el navegador, fondo `#f7f7f5`), por línea y estado. Título y subtítulo del tramo, en `text-primary`: 16,56 en las cuatro líneas y los dos estados, umbral 4,5. Glifo en `--linea-nav`, umbral 3: mínimo 4,48 en la línea 03, luego 4,52 en la 01, 6,41 en la 04 y 16,56 en la 02, que cae a tinta. Segmento en `--linea`, umbral 3: 4,48 en la 03, 4,52 en la 01, 6,41 en la 04 y 1,64 en la 02. Ese 1,64 se acepta como decorativo: el segmento es continuidad del riel, que ya usa ese mismo color, y el estado lo dicen el glifo y el subtítulo en palabras, nunca el segmento solo. Área táctil del enlace del tramo, 60 px de alto, medida.

Desvíos respecto de lo planificado. Se agregó `advanceVisible()` con `NEXT_PUBLIC_ADVANCE_VISIBLE`, de modo que Advance queda invisible en producción hasta que se decida activarlo, y `/advance/*` responde 404 sin el flag. Existe la ruta `/advance/puerta`, que no estaba en el árbol de §2.1. El orden de ejecución fue 1.1, 1.4, 1.2, 1.5 y 1.3, distinto de la numeración, porque la portada redirige a la puerta y el tramo se mide en la galería antes de montarse. El montaje en el riel no fue directo en `RielEstaciones` ni en `page.tsx`, porque el riel vive dentro de la isla de cliente `components/camino/LineaDelEje.tsx`: esa isla ganó una prop opcional `despuesDelRiel` que se rinde justo después del riel, envuelta en la secuencia de entrada con el escalón siguiente a la última estación y con el CTA corrido un escalón, solo cuando hay algo montado (commits `abd75c8` y `461e99f`); `RielEstaciones.tsx` quedó sin diff. La galería vive en `app/%5Fdesign/page.tsx`, no en `app/_design/`, y los tokens reales son `--line-01` a `--line-04` con los roles `--linea` y `--linea-nav`, no `--e1` a `--e4` como decía este manual. Todo texto de Advance que cae sobre el fondo de página va en `text-primary`, porque `text-secondary` da 4,42 sobre el `body` y no llega a AA (`docs/deuda-contraste-etiquetas.md` §1); la jerarquía la dan tamaño y peso. El disclaimer de §7.3 lo cubre el pie del layout en todas las pantallas, así que la puerta no lo repite y la clave salió de `textos.ts`. Las constantes de geometría del riel (`CANALETA`, `EJE_DEL_RIEL`, `CENTRO_DEL_DISCO`) están duplicadas en `TramoAdvance.tsx` con referencia al origen, para no exportarlas desde la capa gratis. El ítem de `NavInferior` de §3.2 queda fuera de F1: no hay nada que entrenar todavía.

Pendientes que F1 deja abiertos. El texto de precio y el CTA de pago de la puerta (§7.1, §11.2): hoy la puerta no tiene ningún texto de precio ni marcador. La Ley 21.719 ya no es dependencia (MOS §7.5, art. 16 quáter): no obliga a un adulto en el medio para adolescentes de 14 a 17. El estado `temporada-terminada` existe en el tipo y se rinde como `sin-acceso` en el tramo y en la portada, sin interfaz propia. `npm run auditar` no imprime resumen por categoría; el criterio de F0 se verificó igual sobre la salida cruda, con cero 🔴 y 128 🟡 de `colision-entre-archivos`.

Commits de F1: `5b0422b`, `85151e1`, `290a738`, `87cf755`, `abd75c8`, `3375687`, `b72c0cc`, `461e99f`.

---

### F2 — Modo descarte — CERRADA 2026-09-11

La mecánica que define el producto. Es la única de las cinco que funciona sin cuenta ni servidor.

**2.1** Banco piloto: una unidad, 20 ítems, con los tres distractores mapeados. Ver sección 5 para el proceso de producción.

**2.2** `lib/advance/descarte.ts`: máquina de estados.

**2.3** `EjecutorDescarte.tsx` y `AlternativaDescartable.tsx`.

**2.4** `ResultadoDescarte.tsx`: pantalla de cierre de sesión.

**2.5** Eventos PostHog nuevos.

**Criterio de salida:** un estudiante recorre 5 ítems en descarte a 390×844 con clic real, recibe el nombre del error correcto en cada descarte acertado, y llega a una pantalla final que le dice qué error apareció más. Sin persistencia todavía.

**Registro del bloque A (código), 2026-09-11. Bloque B (banco piloto, 2.1) y cierre de F2, más abajo.**

F2 se partió en dos bloques: A es todo el código (schema del banco, validador, 2.2 a 2.5, ruta y portada) sin crear un solo ítem; B es el banco piloto de 2.1, en otra sesión. El criterio de salida de F2 exige banco real, así que queda para el cierre de B. Lo que A deja verificado, con salida cruda en el log de la sesión: motor puro con 24 tests de transiciones, resumen y payloads, todos con la clave original; componentes con contraste medido por línea y estado sobre `/_design` (mínimo 4,52:1 en alternativas, 4,54:1 en el resultado, sin tocar tokens), 54 px de alto mínimo por alternativa, cero animaciones con `prefers-reduced-motion`; ruta `/advance/descarte/[unidadId]` con `force-dynamic`, verificada contra `next start` con un banco temporal de 7 ítems fuera de git: tres `curl` seguidos y dos "Otra sesión" en navegador a 390×844 dieron selecciones distintas; los cinco eventos de §8 capturados en consola con sus payloads reales, y `/_design` recorrido hasta el resultado sin emitir ninguno. Sin flags, todo `/advance/*` sigue en 404.

Contrato del banco: `content/advance/schema/item-advance.schema.json` y `_esqueleto-banco.json` vienen de F0.3 (copiados por Benja); A solo movió `colisionesPermitidas` a `auditoria.colisionesPermitidas: [{ valor, motivo }]`, la forma que lee `auditar-leccion.mjs`, subió los feedbacks de descarte a 40 caracteres (el `MIN_FEEDBACK_PUBLICABLE` de lecciones) y la declaración de originalidad a 30, y agregó la regla de ids únicos. `scripts/validar-contenido.mjs` implementa el schema completo a mano (sin ajv, como el resto), con rama propia en el hook `--hook` para `content/advance/<unidad>/banco.json`; menos de 20 ítems o menos de 12 errores distintos avisa sin bloquear (§5.4).

Desvíos respecto de lo planificado. El descarte es irreversible (§6.1 corregido arriba): sin segundo tap que restaure, y sobre la sobreviviente el tap es no-op. `onDescartar` recibe la clave visible en vez de un closure por alternativa, porque el compilador de React rechazaba el arrow dentro del `map` (`react-hooks/purity`). El texto de la alternativa va plano, sin `TextoEnriquecido`, que emite `<p>` y no cabe en un `button`. El ejecutor no importa `registrarEvento`: entrega payloads por callbacks opcionales y quien los envía es `SesionDescarte.tsx`, la isla de cliente de la ruta; así la galería lo monta sin callbacks. `RegistroPuertaVista` se monta en la ruta `/advance/puerta`, no dentro de `PuertaAdvance`, por el mismo motivo. `origen` viaja como `?origen=tramo|portada` declarado por los enlaces internos y validado en la ruta; el redirect desde `/advance/descarte/<unidad>` sin acceso llega sin `origen` y cuenta como `directo`. "Otra sesión" navega con `window.location.assign`, no con `Link`, para no reusar el Router Cache con los mismos cinco ítems. `lib/advance/banco.ts` importa `validarDatosBancoAdvance` de `scripts/validar-contenido.mjs` en runtime, excepción firmada igual que `lib/contenido.ts` (una sola fuente de reglas); verificado que el validador no llega al bundle de cliente. `FranjaDeItems` se reutiliza tal cual y anuncia "Pregunta N": en Advance los ítems son preguntas PAES, el sustantivo es correcto. El nombre corto del error en `content/errores/` no entra: el rótulo sigue siendo "Error 07" más `feedbackDescarte` en la alternativa y más `descripcion` en el resultado. `titulo` del banco pasó a obligatorio al cierre del bloque: la portada y la sesión muestran el nombre técnico DEMRE de la unidad y el `unidadId` no sale a producto.

Excepciones de prefijo firmadas (regla: `advance:` solo para `app/advance`, `components/advance`, `lib/advance`, `content/advance`). Los commits `advance:` de A2 y A3 tocan `app/%5Fdesign/*` porque la sección de galería es el andamiaje que hace verificable cada componente y viaja con él, igual que en F1 (1.5). El commit `advance:` de A4 toca `lib/validar-contenido.d.ts` porque son las 13 líneas de firma de la función que `lib/advance/banco.ts` importa y sin ellas ese mismo commit no compila. `lib/eventos.ts` va en commit `tooling:` propio (convención: `lib/` fuera de las cuatro rutas).

Contraste con margen justo, medido en render sobre `/_design` con colores computados (umbral AA 4,5). Chip de letra de la sobreviviente en la línea 01: 4,52, par `--linea-fondo` sobre `--linea-contraste`, el mismo que `Boton variante="linea"`; no depende del fondo de página, es el par de la línea en sí. `BotonVolver` del resultado en la línea 03: 4,54 sobre el fondo real del `body` (`--color-bg`, #F8F8FB) y 4,48 sobre el `bg-screen` de la galería, que es más oscuro: ese fondo lo rompe, y es el caso ya escrito en `docs/deuda-contraste-etiquetas.md` §3. En la línea 01 el mismo botón da 4,57 sobre `--color-bg`. Ningún token se recalibró; si una superficie nueva monta el resultado sobre `bg-screen`, el retorno de la línea 03 cae bajo AA y hace falta un token nuevo, no ajustar `--linea-nav`.

Commits del bloque A: `6035b8d`, `6927b92`, `0edd948`, `d0064a6`, `9fed5c8`, `fe1d382`, `803b0a6`, `6fd51f3`, `0b2a588`, `6506063`, `fed8990`, `9ba7e93`, `88173a5`, más el `docs:` de este registro.

**Registro del bloque B (banco piloto, 2.1) y cierre de F2, 2026-09-11.**

Bloque B (banco piloto de porcentaje), registro. `content/errores/porcentaje.json` pasó de 8 a 9 entradas: `elige-mal-base-del-porcentaje` es nuevo (base equivocada al calcular un porcentaje, diferencia sobre el valor final o total dividido por la parte), y `convierte-mal-porcentaje-a-decimal` se amplió con la dirección contraria (cociente entregado como porcentaje sin multiplicar por 100), sin id nuevo. `content/advance/porcentaje/banco.json` quedó con los 20 ítems de §5.4 y 9 errores distintos, por debajo del mínimo de 12: aceptado como advertencia para esta unidad, no bloqueante en `npm run validar`. Cobertura final por error: reporta-descuento-en-vez-de-resto ×8, trata-porcentaje-como-cantidad-fija ×6, convierte-mal-porcentaje-a-decimal ×10, confunde-aumento-un-con-aumento-a ×4, responde-parte-en-vez-de-total ×6, suma-porcentajes-sucesivos ×5, deshace-porcentaje-con-mismo-porcentaje ×5, responde-otra-magnitud-porcentaje ×9, elige-mal-base-del-porcentaje ×7; convierte-mal-porcentaje-a-decimal, confunde-aumento-un-con-aumento-a y responde-otra-magnitud-porcentaje quedan fuera del rango 5-8 porque en los ítems donde la incógnita es el propio porcentaje el tercer mecanismo con número propio es casi siempre conversión o magnitud distinta, y forzarlo a otro id habría remapeado sin calzar literal. Reparto: 9 resolver, 5 modelar, 3 argumentar, 3 representar; 5 baja, 10 media, 5 alta; los 20 ítems son `propia` (0 `demre-liberada`: no llegaron preguntas de la forma DEMRE de invierno 2027 para los seis cupos reservados, que quedaron como propios). Contextos verificados con `consultar-fuentes.mjs`, corrido por Benja fuera de la sesión, sobre contexto principal más dos respaldos por fila; los SI de la primera corrida (tomates, maratón, zapatillas, chaqueta, arriendo, batería, biblioteca, ajedrez, coro, harina, cuaderno, librería, lápices) movieron 10 filas a su primer respaldo limpio, ninguna llegó a tres SI.

Auditoría de porcentaje. Ronda 1 (matemática) APROBADA: 19 de 20 ítems verificados directos; `adv-porcentaje-013` alternativa A estaba mapeada a `trata-porcentaje-como-cantidad-fija` citando `cierre-porcentaje-5` B (`80% − 20% = 60%`) como precedente, y el mecanismo real es `responde-otra-magnitud-porcentaje` (21 es la diferencia en puntos porcentuales, bien calculada, pero es otra magnitud que el cambio relativo pedido): se corrigió el `errorCatalogado` y el `feedbackDescarte` en el mismo commit del write back. El JSON de `adv-porcentaje-009` y `adv-porcentaje-013` reportado como inválido durante esa auditoría fue corrupción de copiado al pegar el archivo en el hilo externo, no un defecto del contenido: `node -e` con `JSON.parse` contra `HEAD` antes de la corrección de 013 parseó sin error, con ambos ítems bien formados. Ronda 2 (originalidad) APROBADA, sin hallazgos de colisión con material privado. Observación registrada aquí, sin cambio de contenido por este motivo: `adv-porcentaje-013` A y `cierre-porcentaje-5` B comparten la forma de distractor "resta directa de dos porcentajes-magnitud", un patrón genérico de error que también aparece documentado en material de terceros — no es copia de enunciado ni de cifras, y cada uno mapea a un id distinto del catálogo canónico (responde-otra-magnitud-porcentaje y trata-porcentaje-como-cantidad-fija respectivamente) porque la magnitud que cada enunciado pide es distinta.

Criterio de salida de F2, verificado con el banco real. Build con `NEXT_PUBLIC_ADVANCE_VISIBLE=1` y `NEXT_PUBLIC_ADVANCE_DEMO=1`, `next start` en 3100 y un spec de Playwright temporal fuera de `e2e/` (`scratchpad/f2-bloque-b/playwright-descarte-porcentaje.spec.ts`, con config propia, fuera de git) a 390×844 con clic real sobre `/advance/descarte/porcentaje`. El spec lee el banco con `fs` y cruza cada alternativa por texto, no por letra, porque las letras se mezclan en el servidor. Una sesión de cinco ítems (`adv-porcentaje-008`, `014`, `019`, `016`, `004`: cinco `data-item-id` distintos, contador "Ítem N de 5" en cada uno). En los 13 descartes acertados el `[data-estado-texto]` dijo "Descartada: Error NN" con el NN del `errorCatalogado` de esa alternativa en el banco, y el `[data-feedback]` fue igual al `feedbackDescarte`. En el ítem 3 un descarte fatal sobre la correcta mostró "Descartada por error. Era la correcta." con la solución completa debajo, las intactas deshabilitadas y sin botón de confirmar. La pantalla final dijo "5 ítems, 13 descartes acertados" y `[data-que-error]` mostró Error 01 con la descripción del catálogo: la sesión ejercitó el empate real de `errorMasFrecuente`, reporta-descuento-en-vez-de-resto y deshace-porcentaje-con-mismo-porcentaje aparecieron tres veces cada uno y ganó reporta-descuento-en-vez-de-resto por aparecer primero. Detalle para quien escriba el spec definitivo: los rótulos van en `uppercase` por CSS, así que se afirman sobre `textContent`, no sobre `innerText`. Contraste del `h1[data-titulo-unidad]` medido con colores computados en las cuatro líneas (`?eje=numeros`, `algebra-y-funciones`, `geometria`, `probabilidad-y-estadistica`): 16,75:1 en las cuatro, `text-primary` rgb(22, 24, 29) sobre el fondo del `body` rgb(248, 248, 251); ni el h1 ni `main` pintan fondo propio, así que el color de la línea no entra en ese par. Capturas a 390×844 en `scratchpad/f2-bloque-b/`: `captura-01-intacta.png`, `captura-02-descartada-correcta.png`, `captura-03-sobreviviente.png`, `captura-04-fatal.png`, `captura-05-resultado.png`.

Verificación de cierre, salida cruda en el log de la sesión: `npm run validar` 59 archivos OK con la única advertencia de §5.4 sobre el banco; `tsc --noEmit`, `lint` y `test:unit` (271 tests, 0 fallos) en verde; build sin flags y `next start`: `/advance`, `/advance/puerta` y `/advance/descarte/porcentaje` en 404; `npm run capturas` sin flags 24 fallos, 4 saltados, 46 en verde, `comm` contra la tabla de `docs/deuda-e2e-capturas.md` vacío (mismo conjunto de 24, cero regresiones). Aislamiento: ninguno de los commits de Advance del rango (`021d3b7`, `894a8e3`, `5d9cdd9`, `8183048`, `4f5ad64`) toca `components/leccion/`, `components/camino/`, `content/lecciones/` ni los tres excluidos (`docs/mapa-modulos-m1.md`, `lib/modulos.ts`, `content/cierres/cierre-cuerpos-geometricos.json`). El diff acumulado `9cf7c2a..HEAD` sí contiene siete archivos de `content/lecciones/`, todos de los commits intercalados del rediseño de distractores tipo veredicto, que es otra tarea; por eso el chequeo se hizo commit por commit y no sobre el acumulado.

Commits del bloque B: `021d3b7`, `894a8e3`, `5d9cdd9`, `8183048`, `4f5ad64`, más el `docs:` de este registro.

---

### F3 — Persistencia

Es el gate más caro y no es principalmente técnico.

**3.1** (Benja) Dominio propio y Clerk en instancia de producción.

**3.2** (Benja) Política de privacidad y términos publicados **antes** de cobrarle a alguien desconocido. Exigencia del MOS §7.5 y de la Ley 21.719, que entra en vigencia el 1 de diciembre de 2026, dentro de la primera temporada de venta.

**3.3** Inventario de datos: qué se guarda, dónde, para qué, por cuánto tiempo. Documento, no código. Requisito de la ley.

**3.4** Esquema en Neon. Minimización estricta: sin nombre completo, sin RUT, sin colegio, sin fecha de nacimiento.

```
intento_advance
  id, usuario_id, item_id, unidad_id, modo,
  correcto, tiempo_ms, errores_identificados[], creado_en

estado_error
  usuario_id, error_id, modulo_id,
  fase ("abierto" | "observacion" | "cerrado"),
  p_dominio, observaciones, ultimo_intento_en

temporada
  usuario_id, inicio, fin, estado
```

**3.5** `lib/advance/repositorio.ts`.

**Registro F3, bloque de escritura (2026-09-11).** Primer bloque de F3, acotado por firma a escribir y nada más. Commits con prefijo `advance:` y uno `docs:`; la 008 la aplica Benja con `npm run migrar`.

*Qué se guarda.* Tabla `advance_descartes` (migración `db/migraciones/008_advance_descartes.sql`), una fila por ítem resuelto, escrita al terminar la sesión y en una sola transacción: o quedan los cinco ítems o ninguno. Columnas: `id uuid`; `usuario_id text` (id opaco de Clerk, verificado con `auth()` en el servidor, nunca del cliente); `sesion_id uuid` (generado en el cliente al montar la sesión); `unidad_id text`; `item_id text`; `orden_descartes text[]` (claves originales del JSON, en el orden en que se descartaron); `errores_identificados text[]` (ids locales del catálogo, uno por descarte acertado); `descarte_fatal text` (clave original de la correcta si la descartó, NULL si cerró confirmando); `tiempo_ms integer`; `creado_en timestamptz`. `UNIQUE (usuario_id, sesion_id, item_id)` con `INSERT ... ON CONFLICT DO NOTHING`: un reenvío del mismo cierre no duplica nada, gana la primera escritura. El rol `app_m1` tiene solo INSERT.

*Qué NO se guarda.* Ninguna PII: ni nombre, ni correo, ni edad. Ni la letra visible tras la mezcla, ni el enunciado, ni el texto de las alternativas, ni el título de la unidad. Ni sesiones abandonadas a medias: el envío ocurre una sola vez, al cerrar el último ítem. Ni nada de la galería `/_design`, que monta el ejecutor sin callbacks.

*La identidad de un error es compuesta.* Los ids de `errores_identificados` son locales al catálogo de su unidad: `deshace-porcentaje-con-mismo-porcentaje` existe en porcentaje y puede existir, con otro significado, en otra unidad. Por eso `unidad_id` vive en la misma fila que los errores. La identidad es `(unidad_id, id local)`, nunca el id suelto, y toda consulta de F4 que agrupe por error agrupa por los dos.

*Qué NO hace este bloque.* No lee de vuelta: ni historial, ni reanudar, ni ocultar ítems ya resueltos (F4). `estadoAdvance()` sigue resolviendo por variable de entorno; el route handler la llama, no la reescribe. No hay entitlement de Advance. No se migra nada desde localStorage; `lib/progresoLocal.ts` y `lib/progresoSesion.ts` quedan intactos. Sin evento de PostHog para el guardado, sin reintento en el cliente, sin indicador de "guardado" en pantalla: si la red falla, el estudiante no se entera y la pantalla final se muestra igual.

*Límite conocido: `NEXT_PUBLIC_ADVANCE_DEMO` es global.* Es una variable pública que se inlinea en el build, así que no distingue usuarios. El 403 de `POST /api/advance/sesion` es un interruptor de producto entero, no un gate por usuario. Aceptable en F3 porque no existe entitlement de Advance; deja de serlo en cuanto haya cobro.

*Sin FK a `usuarios`, a propósito.* El espejo de Clerk lo escribe solo el webhook, que puede llegar después de la primera sesión de una cuenta nueva; con FK esa sesión se perdería, y Advance no crea usuarios. Consecuencia: no hay `ON DELETE CASCADE`. La 007 futura (DELETE de `usuarios`) tiene que borrar también en `advance_descartes`; hasta entonces una cuenta borrada deja filas bajo un id opaco sin PII. Anotado en `docs/pendientes.md`.

*Desvíos respecto del boceto de 3.4 y 3.5.* La tabla se llama `advance_descartes`, no `intento_advance`; no lleva `modo` ni `correcto` (se derivan de `descarte_fatal`) y sí `sesion_id`, `orden_descartes` y `descarte_fatal`. `estado_error` y `temporada` no se crean en este bloque. El acceso a datos va en `lib/datos/advanceDescartes.ts`, no en `lib/advance/repositorio.ts`: `lib/datos/` es el único directorio del proyecto con SQL. La tabla entra al inventario de datos de 3.3.

Piezas: `lib/advance/descarte.ts` (tipo `CuerpoSesionDescarte`, armado con `Math.round` de `tiempoMs` y validador de forma y tipos, con test), `lib/datos/advanceDescartes.ts` (escritura en lote), `app/api/advance/sesion/route.ts` (404 sin flag, 401 sin sesión, 403 sin acceso, 400 con cuerpo inválido o unidad e ítems que no están en el banco, 204 al escribir), `components/advance/EjecutorDescarte.tsx` (callback `alCerrarSesion` con los registros completos, una vez) y `components/advance/SesionDescarte.tsx` (`sesion_id` en el inicializador de estado, envío sin bloquear la UI).

**Registro F3, bloque de inventario y temporada (2026-09-14).** Cierra lo que 3.3, 3.4 y 3.5 tenían pendiente sin depender de 3.1 ni 3.2. Un commit `advance:` (`7201a09`), uno `docs:` con el inventario y el de este registro, sin push. Lo que el boceto de arriba dibujaba y ya estaba resuelto de otra forma no se volvió a construir: `intento_advance` es `advance_descartes` (008, bloque de escritura) y `estado_error` no existe por decisión del bloque A de F4 (el estado se calcula al vuelo).

- *3.3, inventario de datos.* `docs/inventario-datos.md`: qué se guarda, dónde, para qué y por cuánto tiempo, para el dispositivo, las nueve tablas de Neon, Clerk, Vercel y PostHog, verificado contra migraciones y `lib/datos/`. Deja cuatro cosas pendientes de firma, todas de Benja: el plazo de conservación del desempeño (hoy es "hasta la baja"), la 007, `usuarios.fecha_nacimiento` (existe nula y sin escritor) y los plazos reales de logs y eventos en los planes contratados.
- *3.4, `temporada`.* **No se crea la tabla.** El boceto (`usuario_id, inicio, fin, estado`) es una fila de `entitlements` (004): producto de Advance, `vigencia_desde` al contratar, `vigencia_hasta` al terminar, con su rastro en `entitlements_auditoria`. Una tabla aparte duplicaría el control de acceso, que por la 004 pasa solo por `lib/datos/entitlements.ts`, y un `estado` guardado quedaría viejo al pasar `fin`, el mismo motivo por el que no se persisten el veredicto del triage ni la fase de un error. Sin migración nueva: el SELECT sobre `entitlements` lo otorga la 006. Alternativa descartada: tabla `temporada` propia con GRANT y auditoría propios, más una función paralela a `tieneAcceso()`.
- *3.5, acceso a datos.* `lib/advance/temporada.ts`, puro y sin reloj: `estadoTemporada(vigencias, ahoraMs)` traduce las vigencias a `EstadoAdvance` con los bordes de `tieneAcceso()` (desde inclusive, hasta exclusive): una vigente da `activo` aunque otra haya vencido; sin vigente, una vencida da `temporada-terminada`; nunca contrató o solo tiene una futura, `sin-acceso`. 8 tests con instantes falsos. `lib/datos/entitlements.ts` suma `vigenciasDe(usuarioId, producto)`, solo fechas, sin filtro por instante en el SQL para que el corte se pruebe en la función pura. No se crea `lib/advance/repositorio.ts`: la decisión del bloque de escritura sigue en pie, el SQL vive en `lib/datos/`.
- *Lo que este bloque no hace.* `estadoAdvance()` sigue leyendo `NEXT_PUBLIC_ADVANCE_DEMO`. Cablearlo a Clerk más `vigenciasDe` exige 3.1 y el id del producto de Advance (§11, punto 2), y además haría dinámica `app/linea/[ejeId]/page.tsx`, que monta `TramoAdvance` con `estadoAdvance()`: eso toca la capa gratis y se decide aparte. Hasta entonces `vigenciasDe` y `estadoTemporada` no tienen llamador, como `listarTriageDeUsuario` en F5a.

**Criterio de salida:** un estudiante inicia sesión, hace una sesión de descarte, cierra el navegador, vuelve, y su historial está ahí. Política de privacidad publicada y accesible.

---

### F4 — Diagnóstico de desempeño — CERRADA 2026-09-12

Recién aquí entran las mecánicas que dependen del historial.

**4.1** Panel 2×2 (sección 6.2). Fuera de F4 (2026-09-12): con descarte, acierto no tiene definición limpia y el cuadrante de error conceptual queda vacío por diseño; requiere modo clásico.
**4.2** Ciclo de vida del error con p(L) (sección 6.3).
*4.3 (repaso de errores y sesiones dirigidas) y 4.4 (re-diagnóstico) se reubican a F5 el 2026-09-12 (D6). No quedan pendientes dentro de F4: 4.3 exige `seleccion.ts` dirigido por estado de error, y sin datos reales de varios días eso se construye a ciegas.*

**Registro de 4.1 como motor puro, 2026-09-14.** Dos commits `advance:`, sin push. `bb66c00` crea `lib/advance/panel.ts`: `cuadranteDeIntento` (acierto × tiempo contra el `tiempoReferenciaSeg` del ítem), `panelDeHabilidad` (regla de honestidad de §6.2: con menos de `MINIMO_INTENTOS` = 3 devuelve `sin-clasificar` y no expone conteos parciales) y `panelPorHabilidad` (las cuatro habilidades siempre); 17 tests. `808f98c` monta `components/advance/PanelDosPorDos.tsx` en `/_design` con intentos de MUESTRA, copy nuevo en `textos.ts` bajo `panel`. La decisión del 2026-09-12 sigue en pie: sin llamador en producción, porque requiere modo clásico y ninguna tabla de hoy produce un `IntentoClasico`; mismo precedente que `listarTriageDeUsuario` y `estadoAdvance`. Dos parámetros que §6.2 no define, elegidos por lo más simple y marcados SIN CALIBRAR en el código: la igualdad con la referencia cuenta como dentro del tiempo, y en empate el dominante es el peor cuadrante en el orden bloqueo, error conceptual, frágil, dominado. 4.2 no se tocó: ya existe como `lib/advance/dominio.ts` (bloque A, abajo) y no se duplica bajo otro nombre.

**Registro del bloque A (motor), 2026-09-12.** Cuatro commits, sin push al cierre: `3e175b6` (`docs:`) iguala §6.3 a la doctrina P10 (p(T) 0,15 y umbral 0,95), saca el panel 2×2 de F4 y registra dos deudas en `docs/pendientes.md` (el orden de los ítems de una sesión no se persiste; el validador no exige tres errores distintos por ítem). `0f05f99` crea `lib/advance/dominio.ts`: BKT (`actualizarPL`), señales por ítem (`observacionesDeItem`, decisión D5: descarte correcto es acierto sobre su error, distractores en pie al fatal reciben fracaso, el acierto gana), estado por error (`aplicarObservacion`, `estadoDeErrores`) con cierre por umbral más dos aciertos separados por 24 horas, recaída que reinicia el ciclo, y la fase `sin-datos` aparte; 21 tests con instantes falsos, sin reloj. Las decisiones D1 a D5 y Op1 están escritas en la cabecera del módulo y no se repiten acá. `ebbedf5` agrega `listarDescartesDeUsuario(usuarioId, unidadId)` en `lib/datos/advanceDescartes.ts`, única lectura de la tabla, cronológica. `d0f77d4` es la migración `009_advance_descartes_select.sql` (GRANT SELECT a `app_m1`), aplicada en Neon por Benja. No existe tabla `estado_error`: el estado se calcula al vuelo desde las filas cruzadas con el banco. 300 tests, 0 fallos, al cerrar el bloque A.

Estado real de `advance_descartes` al abrir el bloque B (SELECT de solo lectura, 2026-09-12): 15 filas de un solo usuario en la unidad porcentaje, 3 sesiones, 9 con descarte fatal, todas entre las 02:46 y las 02:53 UTC del mismo día. El "5 filas" del smoke de F3 quedó obsoleto. Con una ventana de siete minutos ninguna fase puede ser `cerrado`, y eso es lo que sostiene el criterio de salida de abajo.

**Registro del bloque B (pantalla), 2026-09-12.** Cuatro commits, hashes tomados de `git log` al cierre, sin push:

- `94debb9` `advance:` cruce de filas de `advance_descartes` con el banco, hacia `ItemResuelto`. `lib/advance/itemsResueltos.ts` es el único módulo que conoce a la vez la fila y el banco: `dominio.ts` sigue sin saber del banco y `lib/datos` sin saber de errores. Los errores de cada distractor salen de `errorCatalogado`, no de `errores_identificados`, para que aciertos y fracasos tengan una sola fuente (D5). Un ítem retirado del banco descarta su fila; un error fuera del catálogo se conserva y lo omite la pantalla (D12). Siete tests con fixtures en memoria.
- `89e9cb0` `advance:` pantalla `/advance/errores`. Ruta global con `force-dynamic` y el orden de guardas del route handler: sin flag 404, sin sesión Clerk una pantalla que invita a ingresar por `/ingresar` (no el vacío de D9, que sería mentira), sin acceso a la puerta. Recorre las unidades con banco, cruza cada una con su catálogo y calcula el estado al vuelo. `lib/advance/pantallaErrores.ts` es la capa de presentación de `dominio.ts`: traduce las fases (D8), omite `sin-datos` (D9) y los errores fuera del catálogo (D12), marca la recaída como booleano que la tarjeta dice con texto (D11) y no copia p(L) (D10); 7 tests. `IngresoErrores`, `ListaErrores` y `TarjetaEstadoError` (nombre elegido para no colisionar con `components/ui/linea/TarjetaError`), copy en `lib/advance/textos.ts`, y los cuatro estados montados en `/_design` con datos de muestra. Mediciones de ese commit, tomadas de su mensaje y no remedidas en este paso, a 390×844 contra `next start`: 0 nodos con movimiento bajo `prefers-reduced-motion`, botón de ingreso 46 px y retorno 44 px, contraste mínimo 4,54:1 (retorno de la línea 03 sobre el fondo real del `body`) y 4,81:1 en el rótulo de fase de la 03 sobre blanco.
- `660f555` `tooling:` evento `advance_errores_vista` en `lib/eventos.ts`, con la forma de §8 (`{ total, recaidas } & Record<FaseError, number>`), en commit propio por la convención de prefijos (`lib/` fuera de las cuatro rutas de Advance).
- `d854e15` `advance:` `components/advance/RegistroErroresVista.tsx`, isla sin UI que emite una vez por montaje con guard contra el doble efecto de StrictMode, mismo patrón que `RegistroPuertaVista`; montada en `app/advance/errores/page.tsx` en la rama con sesión y acceso, con el `estados` de las tarjetas proyectado a `{ fase, recaidas }`.
- Más el `docs:` de este registro, que además corrige §8: las props de `advance_errores_vista` estaban escritas antes de implementarse (`unidades`, `por_repasar`, `en_estudio`, `superados`) y quedaron igualadas a la forma real del código.

**Cierre de F4, 2026-09-12, contra el criterio D7.** La pantalla `/advance/errores` renderiza el estado calculado al vuelo desde Neon (`listarDescartesDeUsuario` → `itemsResueltosDe` → `estadoDeErrores` → `tarjetasDeUnidad`) para el usuario de `auth()`, con las fases que los datos existentes permiten, y el paso a `cerrado` queda cubierto por los tests de `lib/advance/dominio.ts`. Verificación de este paso, salida cruda en el log de la sesión: `npm run validar`, `tsc --noEmit` y `lint` en verde; `npm run capturas` no se corrió en este paso, fuera de alcance por instrucción. **La verificación en navegador con sesión Clerk real a 390×844 la hace Benja, no CC, y es previa al push**: CC no tiene sesión Clerk y D4 prohíbe sembrar datos, así que la única prueba de la pantalla contra Neon real es la de Benja con su cuenta.

Nota sobre D11, sin verificación visual real. La marca "Volvió a aparecer" (`recaida: estado.recaidas >= 1` en `pantallaErrores.ts`, texto en `textos.ts`) está implementada y cubierta por `pantallaErrores.test.ts` y por la muestra de `/_design`, pero nunca se ha ejercitado con datos reales, y no puede ejercitarse con los de hoy: una recaída exige un `cerrado` previo (`aplicarObservacion`), cerrar exige dos aciertos separados por 24 horas, y las 15 filas reales están en una ventana de siete minutos. No es que hoy `recaidas` dé 0 por casualidad: es 0 por construcción. Esto es derivación del código (`aplicarObservacion` más la ventana de siete minutos del SELECT del bloque A), no una consulta nueva a Neon: nadie ejecutó la pantalla ni contó recaídas en la base para escribir esta nota. Queda instrumentada y sin verificación visual real hasta que existan datos que la produzcan; cruce en `docs/pendientes.md`, entrada de agrupación por fase.

**Criterio de salida (reemplazado el 2026-09-12, D7):** la pantalla `/advance/errores` renderiza el estado real calculado desde Neon para un usuario con sesión Clerk real, con las fases correctas para los datos que existan; el paso a `cerrado` queda cubierto por los tests de `lib/advance/dominio.ts`. El criterio anterior ("un error pasa de abierto a cerrado por comportamiento real del estudiante, y la pantalla lo refleja") era indemostrable en sesión: exige tres aciertos con dos de ellos separados por 24 horas, y D4 prohíbe sembrar datos.

**Registro de F4b (repaso por error), 2026-09-12.** Tres commits más el `docs:` de este registro, hashes de `git log` al cierre, sin push. Resuelve la entrada 🔴 "Copy crudo del catálogo" de `docs/pendientes.md` para porcentaje: la tarjeta de `/advance/errores` deja de mostrar la ficha de autor y pasa a ser tocable, y abre una pantalla de repaso.

- `deca5f7` `contenido:` `content/errores/porcentaje.json`, tres campos nuevos por error después de `descripcion`: `titulo` y `apoyo` (la tarjeta) y `repaso { camino, correcto, ejemplo }` (la pantalla). Textos escritos y firmados por Benja; `descripcion` no cambia y sigue siendo la ficha de autor para `auditar-leccion.mjs` y los feedbacks. confunde-aumento-un-con-aumento-a unificado en 30% en `titulo` y `apoyo` para que la tarjeta y el repaso digan el mismo número. Solo porcentaje: los otros diez catálogos siguen siendo `{ id, descripcion }`.
- `779e00d` `tooling:` `scripts/validar-contenido.mjs` parte `validarCatalogoErrores` en `validarDatosCatalogoErrores` (pura) más el envoltorio de archivo, con los tres campos opcionales pero de forma exigida cuando están, y sin rechazar claves desconocidas. `lib/catalogoErrores.ts` agrega `catalogoCompletoDelModulo` (`Map<string, EntradaError>`) y `catalogoDelModulo` pasa a ser su proyección con la misma firma, así `SesionDescarte`, `ResultadoDescarte` y `lib/sanitizar.ts` quedan sin diff. 11 tests nuevos en `lib/catalogoErrores.test.ts`, cuatro contra el archivo real (igualdad de claves y `descripcion` entre las dos vistas, entre ellos).
- `0514560` `advance:` `TarjetaDeError` lleva `unidadId`, `titulo` y `apoyo` (cae a `descripcion` sin `titulo`); `TarjetaEstadoError` es un `<Link>` a `/advance/errores/<unidadId>/<errorId>`, con el padding en el enlace para que el área táctil sea la tarjeta entera. Ruta nueva `app/advance/errores/[unidadId]/[errorId]/page.tsx` con `force-dynamic` y las guardas de `/advance/errores` en el mismo orden (flag, sesión, acceso) más `unidadId` vía `obtenerBanco` y `errorId` contra el catálogo del módulo, 404 si no resuelven. `RepasoError` es puro: h1, tres secciones con rótulos de `textos.ts` ("Cómo se comete", "Lo correcto", "Ejemplo"), "Practicar este error" hacia la sesión de descarte de la unidad y "Volver a la lista"; sin `repaso`, el aviso "Todavía no hay repaso para este error." en vez de las secciones. `errores.titulo` pasa a "Por repasar". Sin p(L), sin fase, sin evento de analítica nuevo. La galería `/_design` monta la tarjeta nueva (una sin `apoyo`) y el repaso en sus dos estados. Medido a 390×844 contra `next start` sobre `/_design`, números de este commit y no de F4: 0 nodos con movimiento bajo `prefers-reduced-motion` en los nueve contenedores; tarjeta-enlace de 92 a 136 px de alto, "Practicar este error" 46 px, retornos 44 px; contraste mínimo 4,52:1 (texto del botón sobre `--linea-fondo` de la 01), rótulo de fase de la 03 sobre `bg-card` 4,81:1, rótulo de sección y retorno de la 03 sobre el fondo real del body 4,54:1; 0 nodos bajo AA. Verificación: `npm run validar`, `tsc --noEmit`, `lint` y `test:unit` (327 tests, 0 fallos) en verde.

F4b no adelanta 4.3: "Practicar este error" abre la sesión normal de la unidad, cinco ítems al azar de `seleccionarSesion`, sin filtrar por el error que se acaba de repasar. Queda anotado como 🟡 en `docs/pendientes.md`. Como en F4, la verificación en navegador con sesión Clerk real la hace Benja antes del push.

**Registro de F4c (ResultadoDescarte con copy de estudiante), 2026-09-12.** Un commit más el `docs:` de este registro, hash de `git log` al cierre, sin push (al abrir F4c, `origin/master` seguía en `0f8b7cb`, registro de F3: F4 y F4b tampoco estaban pusheadas). Cierra lo que F4b dejó abierto en `docs/pendientes.md`: la pantalla final de la sesión de descarte (§6.1, "Qué error apareció más") mostraba `descripcion`, la ficha de autor, del error más frecuente.

- `5581557` `advance:` `ResultadoDescarte` muestra `titulo` + `apoyo` del catálogo en la `TarjetaError` (el `apoyo` va en `detalle`, prop que existía sin uso real; solo cambió su comentario) y la tarjeta entera es un `<Link>` a `/advance/errores/<unidadId>/<errorId>`, mismo patrón que `TarjetaEstadoError` (`min-h-11`, foco visible, sin hover de borde porque la superficie oscura no tiene borde). Sin botón ni texto nuevo en `textos.ts`: `queHacerDetalle` ya decía "vuelve a leer el error de arriba". Módulo nuevo `lib/advance/copyDeError.ts`, puro: `copyDeError` aplica la regla de caída de F4b (`titulo ?? descripcion`, `apoyo` solo si viene, clave ausente y no vacía) y `copyDelCatalogo` proyecta el `Map` a `Record` para cruzar al cliente; 5 tests. `tarjetasDeUnidad` (`pantallaErrores.ts`) sigue con la regla en línea, sin diff: F4b no se tocó. La page de `/advance/descarte/[unidadId]` resuelve el copy en el servidor con `copyDelCatalogo(catalogoCompletoDelModulo(banco.moduloId))`; `SesionDescarte` cambia solo el tipo de la prop `catalogo` y reenvía `unidadId`. `catalogoDelModulo` queda con un solo consumidor, `lib/sanitizar.ts`. Sin cambios en `EjecutorDescarte`, `lib/advance/descarte.ts`, `dominio.ts` ni el POST.
- Decisión, firmada al abrir F4c: **un solo error, el más frecuente**, como fija §6.1 ("Qué error apareció más veces, por nombre"). El brief decía "cada error identificado en la sesión"; se leyó como "el error que se muestra" y no se cambió el diseño.
- Galería `/_design`: tres estados con datos de muestra por línea, `COPY_MUESTRA` calculado por el mismo camino que la ruta (`copyDelCatalogo` sobre un `Map<string, EntradaError>` de muestra donde suma-porcentajes-sucesivos no tiene `titulo`): con error dominante (deshace-porcentaje-con-mismo-porcentaje, titulo + apoyo), con error dominante sin copy (suma-porcentajes-sucesivos dos veces: cae a `descripcion`, dos párrafos) y sin descartes acertados.
- Medido a 390×844 contra `next start`, `prefers-reduced-motion: reduce`, sobre los 12 bloques de `/_design` (3 estados × 4 líneas), números de este commit: enlace-tarjeta 112×324 px con apoyo y 88×324 px sin apoyo; `href` `/advance/errores/muestra/deshace-porcentaje-con-mismo-porcentaje` y `.../suma-porcentajes-sucesivos`; retorno "Volver a Advance" 44 px; contraste sobre `bg-primary` (22,24,29) de la clave "Error 0N" (10 px, 600) 7,93:1 en la línea 01, 12,57:1 en la 02, 10,13:1 en la 03 y 7,33:1 en la 04; título (15 px, 600) 16,56:1; apoyo (12,5 px, 400) 8,38:1; contraste mínimo fuera de la tarjeta 16,75:1; 0 nodos con transición o animación; sin scroll horizontal. Spec de medición en el scratchpad de la sesión, fuera del repo.
- Verificación: `npx tsc --noEmit`, `npm run lint`, `npm run validar` (única advertencia, preexistente: el banco de porcentaje cubre 9 errores y el mínimo de §5.4 es 12) y `npm run test:unit` (332 tests, 0 fallos) en verde; `npm run build` en verde. Como en F4 y F4b, la verificación en navegador con sesión Clerk real la hace Benja antes del push.

Lo que F4c no cierra: los otros diez catálogos siguen sin `titulo` ni `apoyo`, y `ResultadoDescarte` cae a `descripcion` con ellos igual que `/advance/errores`; sigue anotado en la entrada de `docs/pendientes.md`.

---

### F5 — Mapa de recuperables y triage

Dividida el 2026-09-12 en F5a (triage, construida) y F5b (mapa, bloqueada por el conteo DEMRE). 5.3 y 5.4 siguen en F5 sin fase propia todavía.

**5.1** Mapa de recuperables (sección 6.4). Es F5b.
**5.2** Triage de 20 segundos (sección 6.5). Es F5a.
**5.3** Repaso de errores y sesiones de entrenamiento dirigidas (era 4.3; reubicado el 2026-09-12, D6).
**5.4** Re-diagnóstico (era 4.4; reubicado el 2026-09-12, D6).

#### F5a — Triage de 20 segundos — CERRADA en local 2026-09-12, sin push

**Decisiones firmadas al abrir, no se reabren.**

- **D14** Fuente: el banco de porcentaje (`content/advance/porcentaje/banco.json`), 20 ítems mezclados con la misma mecánica que la sesión de descarte (`seleccionarSesion`, que cae a `lib/mezclar.ts`), sin repetir en la sesión. El banco tiene exactamente 20 ítems, así que hoy la sesión es el banco entero en otro orden.
- **D15** Persistencia: tabla `advance_triage`, append-only, migración `db/migraciones/010_advance_triage.sql`, mismo patrón que la 008: `usuario_id` sin FK, `sesion_id` uuid generado en el cliente en el inicializador de `useState`, `UNIQUE (usuario_id, sesion_id, item_id)`, `INSERT ... ON CONFLICT DO NOTHING`. Columnas: `usuario_id`, `sesion_id`, `item_id`, `unidad_id`, `decision` (`resuelvo | dejo | marco | sin-decision`, con CHECK), `ms` (integer, `>= 0`), `creado_en`. `GRANT INSERT, SELECT` a `app_m1` en la misma migración. La 007 futura de DELETE debe alcanzar esta tabla (anotado en la 010 y en `docs/pendientes.md`).
- **D16** Timeout a los 20 s: se registra `decision = sin-decision` con `ms = 20000`. No se convierte en "dejo".
- **D17** Veredicto, calculado en runtime desde `estadoDeErrores` (`lib/advance/dominio.ts`) sobre `advance_descartes`, nunca guardado: `resuelvo` en ítem con al menos un distractor cuyo error está abierto → lectura a revisar; `dejo` en ítem cuyos tres errores están cerrados → punto regalado; cualquier decisión sobre ítem con algún error en `sin-datos` → sin veredicto; `marco` → sin veredicto siempre; `sin-decision` → sin veredicto; resto → lectura buena. Sin datos suficientes es sin veredicto: nunca un veredicto inventado.
- **D18** Pantalla final: total de decisiones, cuántas con veredicto, listado ítem por ítem con decisión y veredicto. Sin porcentaje, sin puntaje, sin proyección (Ley 19.496).

**Registro de F5a, 2026-09-12.** Cuatro commits, hashes de `git log` al cierre, sin push. `master` estaba igual a `origin/master` (`6c37102`) al abrir.

- `441501c` `tooling:` `lib/advance/triage.ts`, puro, sin I/O ni reloj (D4: los instantes se inyectan). Tipos `Decision` y `Veredicto`; `seleccionarItems(items, aleatorio)` sobre `seleccionarSesion`; `fasesDe` proyecta `EstadoDeError[]` a `errorId → fase` sin p(L); `registroDecision` y `registroSinDecision` (D16); `veredicto` según D17 en orden fijo (marco y sin-decision primero, después resuelvo con abierto, después dejo con todo cerrado, después sin-datos, resto lectura buena); `erroresAbiertosDe`; `resumenTriage` (D18); payload de `advance_triage_decision`. 22 tests, una rama por caso de D17, más el error ausente del mapa, que cuenta como `sin-datos`.
- `39e115c` `advance:` la 010, `lib/datos/advanceTriage.ts` (`registrarSesionTriage` en lote atómico y `listarTriageDeUsuario`, cronológica), `cuerpoSesionTriage` y `validarCuerpoTriage` en `triage.ts` (6 tests), y `app/api/advance/triage/route.ts` con el orden de guardas de `/api/advance/sesion`: 404 sin flag, 401 sin sesión, 403 sin acceso, 400 con cuerpo inválido o unidad e ítems fuera del banco, 204 al escribir.
- `3fca89a` `advance:` ruta `app/advance/triage/[unidadId]/page.tsx` (`force-dynamic`; guardas flag → sesión Clerk → acceso → `unidadId`; sin sesión, `IngresoErrores` con copy de triage). Componentes `SesionTriage` (sesionId, evento por ítem, POST al cerrar con `keepalive`), `EjecutorTriage` (reloj en `performance.now()`, tick de 250 ms, a 0 registra sin-decision y avanza), `ItemTriage` (presentacional: el ítem como en la prueba, cuenta "Quedan N s" con el número en `.num` y `aria-live`, tres botones `secundario` del mismo peso) y `ResultadoTriage` (D18, con `TarjetaError` del primer error abierto solo en lectura a revisar, enlazada al repaso). Textos bajo `triage.*` en `lib/advance/textos.ts`; entrada desde `/advance` por unidad, junto al descarte; evento en `lib/eventos.ts`. Galería `/_design` con el ítem con cuenta fija, el ejecutor con reloj real y el resultado en dos estados.
- Más el `docs:` de este registro.

**Mediciones, 390×844 contra `next start`, `prefers-reduced-motion: reduce`, sobre `/_design`, spec en el scratchpad de la sesión (fuera del repo), números de `3fca89a`.** Ítem con cuenta, cuatro líneas: cuenta "Quedan 12 s" con `aria-label` igual; los tres botones 48×324 px; contraste mínimo 4,52:1 (pill "Triage" sobre `--linea-fondo` de la 01) y 4,69:1 en las otras tres (la letra del chip, `text-secondary` sobre blanco); 0 nodos con transición o animación en los cuatro bloques. Resultado con veredictos, cuatro líneas: filas `resuelvo → lectura-a-revisar`, `dejo → lectura-buena`, `dejo → punto-regalado`, `marco → sin-veredicto`; una sola tarjeta, `href` `/advance/errores/muestra/reporta-descuento-en-vez-de-resto`, 94 px de alto; retorno 44 px; contraste mínimo 4,57:1 (01), 8,38:1 (02), 4,54:1 (03), 6,48:1 (04), siempre el retorno sobre el fondo real del body salvo en la 02; 0 nodos con movimiento. Resultado todo sin veredicto: "4 decisiones, 0 con veredicto", sin tarjetas, aviso de historial insuficiente, mismos mínimos de contraste, 0 movimiento. Ninguna de las palabras "acierto", "puntaje", "predicción" ni raya en la sección. Clic real en el ejecutor: "La dejo" pasa del ítem 001 al 002 con "Ítem 2 de 2"; "La marco y sigo" cierra con `dejo:lectura-buena, marco:sin-veredicto`. Sin scroll horizontal.

**Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run validar` (única advertencia, preexistente: el banco cubre 9 errores y el mínimo es 12), `npm run test:unit` (360 tests, 0 fallos) y `npm run build` en verde.

**Migración 010 pendiente de aplicar por Benja** con `npm run migrar`; hasta entonces `POST /api/advance/triage` responde 500 (saneado) y la pantalla final se muestra igual. Como en F4, la verificación en navegador con sesión Clerk real la hace Benja antes del push.

**Desvíos respecto del brief, decididos solos y anotados:** la migración vive en `db/migraciones/`, no en `migrations/`; "abierto o en recaída" de D17 es `fase === "abierto"` (la recaída no es una fase en `dominio.ts`, es `recaidas >= 1` con fase abierto); `seleccionarItems` inyecta `aleatorio` en vez de una semilla, porque `lib/mezclar.ts` no tiene semilla; el resultado lista el enunciado de cada ítem; `listarTriageDeUsuario` existe y tiene SELECT por D15 sin que ninguna ruta lo consuma todavía; `ItemTriage` es un cuarto componente, presentacional, para que la galería monte la cuenta fija.

**Lo que F5a no cierra:** el triage no filtra por error ni por fase (5.3); el veredicto se calcula contra el estado al abrir la página, no al decidir; `advance_triage` no se lee desde ninguna pantalla.

#### F5a2 — Triage con dos decisiones y copy explicado — CERRADA en local 2026-09-12, sin push

**Por qué.** Con F5a en la mano, el estudiante no entendía dos cosas: qué eran "los errores" que aparecían en el resultado (creía que eran errores del triage, cuando vienen de sus sesiones de descarte) y por qué el triage parecía juzgarlo ("Lectura a revisar" sonaba a reprobado). Además, "La dejo" y "La marco y sigo" eran la misma decisión con dos nombres: en la prueba, no resolver ahora es pasar a la siguiente. Cambia solo la interfaz y el copy; la mecánica, la persistencia, el POST y el cálculo del veredicto no cambian, salvo la rama de `marco` en D17.

**Qué cambió.**

- **Dos decisiones:** "La resuelvo" (`resuelvo`) y "Paso a la siguiente" (`marco`). El botón "La dejo" desaparece. El valor `dejo` queda en `Decision`, en `DECISIONES` (el validador lo sigue aceptando) y en el CHECK de la 010, **sin emisor**: ninguna interfaz lo produce y las filas viejas con `dejo` siguen siendo válidas. La 010 no se toca ni se escribe una 011: está aplicada, y `scripts/migrar.mjs` rechaza una migración aplicada cuyo contenido cambió en disco (compara sha256), así que la nota de "sin emisor" vive en la cabecera de `lib/advance/triage.ts`, acá y en `docs/pendientes.md`, no en la migración.
- **D17 ajustado:** `marco` deja de ser sin veredicto siempre y toma la regla que tenía `dejo`: con los tres errores del ítem cerrados → punto regalado ("Podías con esta"); con algún error sin datos → sin veredicto; resto → lectura buena. `dejo` conserva la misma regla para filas viejas. Orden de evaluación: `sin-decision` → sin veredicto; `resuelvo` con un abierto → lectura a revisar; `marco` o `dejo` con todo cerrado → punto regalado; algún sin-datos → sin veredicto; resto → lectura buena.
- **Copy (textos firmados, literales, en `lib/advance/textos.ts` bajo `triage.*`):** instrucción "No tienes que resolver nada. Solo decidir en 20 segundos si le dedicarías tiempo a esta pregunta en la prueba o si la marcarías para volver después.", en todos los ítems encima de la cuenta (completa en el primero, corta del segundo en adelante: "No hay que resolver nada: decide si le dedicarías tiempo o si pasas a la siguiente."). Veredictos con rótulo en negrita y explicación en cuerpo-s: "Ojo con el tiempo", "Podías con esta", "Buena lectura", "Todavía sin datos", con las cuatro explicaciones del brief. Nota fija al pie del resultado, siempre visible: "Lo que aquí llamamos errores viene de tus sesiones de descarte, no de lo que decidiste recién. En el triage no hay respuestas buenas ni malas: solo te mostramos dónde se te puede ir el tiempo en la prueba."
- **Textos de F5a que chocaban y se reemplazaron:** el aviso de sin datos total ("Todavía no tenemos sesiones de descarte tuyas en este contenido. Haz algunas y vuelve: ahí podremos decirte dónde se te puede ir el tiempo."), "con veredicto" → "con comentario" en el conteo, "Qué hacer ahora" con Ojo con el tiempo, el cuerpo de ingreso ("El triage se lee contra tus sesiones de descarte...") y "Sin decisión" → "Se acabó el tiempo".

**Registro, 2026-09-12.** Tres commits encima de `3ea37b0`, sin reescribir historia, sin push: `17da3c3` `tooling:` D17 y tests (30); `d42a984` `advance:` ItemTriage, ResultadoTriage, textos, galería; más el `docs:` de este registro.

**Mediciones, 390×844 contra `next start`, `prefers-reduced-motion: reduce`, sobre `/_design`, spec en el scratchpad de la sesión (fuera del repo), números de `d42a984`.** Ítem 1, cuatro líneas: instrucción completa presente, 16,75:1 sobre el fondo del body; los dos botones 48×324 px, texto 17,76:1; contraste mínimo del bloque 4,52:1 (pill de la 01) y 4,69:1 en las otras tres (letra del chip); 0 nodos con movimiento. Resultado con veredictos, cuatro líneas: filas `resuelvo → Ojo con el tiempo`, `marco → Buena lectura`, `marco → Podías con esta`, `sin-decision → Todavía sin datos`; rótulo en peso 600 y explicación, 17,76:1 sobre la tarjeta; nota fija presente, 16,75:1; una sola tarjeta de error, en la fila Ojo con el tiempo, 94 px; retorno 44 px; contraste mínimo 4,57:1 (01), 8,38:1 (02), 4,54:1 (03), 6,48:1 (04); 0 nodos con movimiento. Todo sin datos: "4 decisiones, 0 con comentario", cuatro "Todavía sin datos", aviso nuevo, nota presente, sin tarjetas, mismos mínimos. Ninguna de "acierto", "puntaje", "predicción", "fallaste", "incorrecto" ni raya en la sección. Clic real: "Paso a la siguiente" pasa del ítem 001 al 002 con la instrucción corta; cierra con `marco:lectura-buena, resuelvo:lectura-buena`. Sin scroll horizontal.

**Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run validar` (advertencia preexistente del banco), `npm run test:unit` (362 tests, 0 fallos) y `npm run build` en verde. La verificación en navegador con sesión Clerk real la hace Benja antes del push.

#### F5b — Mapa de recuperables — BLOQUEADA

Requiere el conteo real de frecuencia por unidad sobre formas liberadas de DEMRE (§6.4), que no existe todavía. Es análisis, no código. No se construye nada de la pantalla hasta tener ese número.

---

### F6 — Reporte al apoderado

La palanca comercial más grande y la que menos código nueva necesita, porque consume lo construido en F4. El adulto suele pagar, pero no siempre: el pagador puede ser el estudiante (MOS §3, art. 3° ter). En cualquier caso, el apoderado hoy no recibe nada.

Fuera de V1, pero la arquitectura de F4 tiene que dejarlo posible: todo dato que se calcule para el panel debe poder renderizarse en un resumen legible por un adulto que no usa la plataforma.

---

## 5. Producción de contenido Advance

### 5.1 Origen del material

Permitido: temario oficial DEMRE, formas liberadas de aplicaciones anteriores, material propio.

Prohibido: material de preuniversitarios y otros privados. Sin excepciones y sin "retoques".

Material de la profesora: **analizado el 2026-09-21** (Fase A). Son cuatro PDF de una universidad (dos apuntes con sus solucionarios), tratados como `guia_terceros` con licencia propietaria y riesgo alto, igual que un preuniversitario: solo capa abstracta, clean-room MOS §7.2. El material vive fuera del repo en `../fuentes-analisis-aisladas/Material/profesora/` (PDF más transcripción `.md` junto a cada uno, para que `scripts/consultar-fuentes.mjs` los cruce) y solo lo abren los subagentes `analista-curricular` y `auditor-originalidad`. El análisis vive en `docs/analisis/material-referencia/`: `ap1.json` y `ap2.json` (uno por aplicación, conformes a `analisis-curricular.schema.json`, auditados elemento por elemento), `por-unidad.md` (síntesis por cada uno de los 16 ids del mapa de módulos) y `brechas-bancos.md` (brechas por banco existente). Ningún enunciado, cifra, contexto, figura ni solución del material entra al repo. Regla para los bancos: la PARADA de todo banco nuevo lee la sección de su unidad en `por-unidad.md`; los `dominios_vistos` quedan fuera de los contextos del banco, las `tareas_tipo` que el banco no cubra se proponen ahí, y los candidatos de error ("sin id: candidato") se firman en esa PARADA, nunca desde el documento de síntesis. El material entra en el rol de análisis (qué errores ve en sala, qué distractor cae más, calibración de dificultad, verificación matemática), no como fuente de enunciados. Si en algún momento se usan enunciados suyos, hace falta cesión escrita, porque sin eso ella queda como titular de una pieza del producto pago.

### 5.2 Lo que hay que producir por ítem

El enunciado es la parte barata. El trabajo real es el mapeo.

```json
{
  "id": "adv-porcentaje-001",
  "unidadId": "porcentaje",
  "moduloId": "porcentaje",
  "habilidad": "resolver",
  "dificultad": "media",
  "tiempoReferenciaSeg": 120,
  "enunciado": "...",
  "alternativas": [
    { "clave": "A", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "convierte-mal-porcentaje-a-decimal",
      "feedbackDescarte": "..." },
    { "clave": "B", "texto": "...", "esCorrecta": true,
      "feedbackDescarteIncorrecto": "..." },
    { "clave": "C", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "deshace-porcentaje-con-mismo-porcentaje",
      "feedbackDescarte": "..." },
    { "clave": "D", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "elige-mal-base-del-porcentaje",
      "feedbackDescarte": "..." }
  ],
  "solucion": "...",
  "proveniencia": { ... }
}
```

Campos nuevos respecto del schema de lecciones:

- `tiempoReferenciaSeg`: obligatorio. Valores por defecto según dificultad: baja 80, media 120, alta 160. Base: 140 minutos para 65 preguntas da 129 segundos promedio. Se calibra con datos reales cuando exista F3. Queda escrito en el banco piloto sin consumidor a propósito: su consumidor es el panel 2×2 (§6.2), que exige modo clásico. No es un campo muerto y no se retira.
- `errorCatalogado`: la clave va en los tres distractores; el valor es un id del catálogo o `null`. Con `null` es obligatorio `sinErrorCatalogado: { motivo, nota }` (contrato completo en §2.3). Pisos: al menos 1 mapeado por ítem y 60 % por banco.
- `feedbackDescarte`: el texto que aparece cuando el estudiante descarta **correctamente** esa alternativa. No es el feedback de haberla elegido. Es distinto y hay que escribirlo aparte.
- `feedbackDescarteIncorrecto`: en la correcta. Aparece cuando el estudiante la descarta por error.

### 5.3 Pipeline

1. Benja verifica estado real en disco antes de asumir nada.
2. Benja corre `consultar-fuentes.mjs` manualmente, fuera de toda sesión de CC.
3. CC propone el lote en Plan Mode. Espera aprobación.
4. CC escribe. Cada distractor tiene que apuntar a un error existente del catálogo del módulo. Si necesita uno nuevo, se detiene y propone texto.
5. Ronda 1 (verificación matemática) y Ronda 2 (originalidad) en hilos `/clear` separados.
6. Resultado de las auditorías escrito de vuelta en `proveniencia.declaracionOriginalidad` de inmediato. Si queda solo en el chat, la proveniencia se desincroniza.
7. Ningún conteo se escribe en proveniencia sin verificarlo antes con `node -e`.

### 5.4 Volumen mínimo

Para que el descarte tenga sentido en una unidad: **20 ítems**, con cobertura de al menos 12 errores distintos del catálogo de esa unidad.

Menos de eso y el estudiante ve repetición inmediata. Más de 20 en la primera unidad es desperdicio antes de validar la mecánica.

---

## 6. Especificación de las mecánicas

### 6.1 Modo descarte

**El cambio de tarea.** No es "elige la correcta". Es "elimina las que no pueden ser". Esa inversión es la que entrena la habilidad real de la PAES, donde el estudiante muchas veces no sabe resolver pero sí puede eliminar.

**Interacción.** Un tap sobre una alternativa la descarta. El descarte es irreversible: no hay segundo tap que restaure, porque el dato que importa es la decisión tal como se tomó (decisión firmada 2026-09-11, F2 bloque A). Sobre la sobreviviente el tap no hace nada; solo Confirmar cierra el ítem. Área táctil mínima 44px.

**Estados de una alternativa:**

| Estado | Qué significa | Tratamiento visual |
|---|---|---|
| Intacta | Sin decisión | Normal |
| Descartada correcta | Era distractor | Tachada, atenuada, con el nombre del error |
| Descartada por error | Era la correcta | Se detiene el ítem |
| Sobreviviente | Única sin descartar | Se resalta antes de confirmar |

**Flujo de respuesta.**

Descarte acertado: aparece el `feedbackDescarte`. Breve, una o dos líneas, nombrando el error concreto. Ejemplo de tono: "Bien. Esa sale porque suma el 20% en vez de multiplicar por 1,2."

Descarte de la correcta: el ítem se cierra. Aparece `feedbackDescarteIncorrecto` y la solución. Este es el único error real de la mecánica y hay que tratarlo sin dramatismo: es información valiosa, no un castigo.

Cuando queda una sola: confirmación. Si acertó, cierre breve. Sin celebración ruidosa.

**Lo que se registra por ítem:**

```ts
{
  itemId: string;
  ordenDescartes: string[];        // ["C", "A", "D"]
  erroresIdentificados: string[];  // ids del catálogo
  descarteFatal: string | null;    // clave de la correcta, si la descartó
  tiempoMs: number;
}
```

`ordenDescartes` importa más de lo que parece. El estudiante que descarta primero el error más grosero está leyendo bien. El que descarta primero el distractor sutil está adivinando. Ese dato es materia prima para F4 y no cuesta nada capturarlo ahora.

**Pantalla final de sesión.** Responde tres preguntas, en este orden:

1. Cómo te fue (cuántos ítems, cuántos descartes acertados).
2. Qué error apareció más veces, por nombre.
3. Qué hacer ahora.

Sin gráficos. Sin porcentajes decorativos. Reutiliza `FranjaDeItems` para el eco visual de la sesión.

**Accesibilidad.** Cada alternativa es un `button` con `aria-pressed`. El estado descartado se anuncia por texto, no solo por tachado. `prefers-reduced-motion` elimina toda transición, no la acorta.

**Render de expresiones (2026-09-17).** A 390 px las expresiones se partían entre operador y término (medido: 529 cortes de operador en 385 de 2.000 campos de los 10 bancos, 121 en 60 campos solo en sistemas-2x2). `lib/advance/protegerExpresiones.ts` une con U+00A0 los espacios de cada expresión (D6: `× ÷ ·` con espacio duro a los dos lados siempre, aunque los operandos sean palabras; `+ −` solo con operando a ambos lados; relación `= ≤ ≥ < > ≠` con operando a la izquierda: duro antes, normal después; D5: operando = dígito, superíndice, π, `|`, `$`, `√`, paréntesis, `%`, `′` o corrida de 1-2 letras que no sea palabra de la lista es, de, el, la, lo, un, se, si, no, en, al, su, ni, ya, mi, tu, ha, os; tablas intactas, listas con marcador intacto; idempotente) y se aplica en `itemParaCliente` (`lib/advance/banco.ts`) sobre los cinco campos de texto (`enunciado`, `texto`, `feedbackDescarte`, `feedbackDescarteIncorrecto`, `solucion`). Decisión firmada: solo Advance, nunca dentro de `TextoEnriquecido` (`lib/markdownSimple.tsx`), que seguiría rompiendo el aislamiento con las lecciones y no cubre los campos planos. Ningún JSON de `content/` cambia. Métrica de salida (D7): un corte es prohibido si la línea termina en `+ − · × ÷` o empieza con `+ · × ÷` o con una relación que sí tiene operando a la izquierda; no cuentan el menos unario al inicio de línea (seguido de letra, dígito o paréntesis) ni una relación sin operando a la izquierda. Regla para specs: todo spec que cruce texto visible de Advance contra el banco normaliza U+00A0 → espacio antes de comparar (el piloto F2 de `scratchpad/f2-bloque-b/` no lo hace).

---

### 6.2 Panel 2×2 (requiere modo clásico)

Cruce de acierto con tiempo, usando `tiempoReferenciaSeg`.

| | Dentro del tiempo | Sobre el tiempo |
|---|---|---|
| **Correcto** | Dominado | **Frágil** |
| **Incorrecto** | **Error conceptual** | Bloqueo |

Los dos cuadrantes que importan y que nadie más muestra:

**Frágil.** Correcto pero lento. Es el predictor de derrumbe: en la prueba real, con 140 minutos para 65 preguntas, lo frágil se cae. Un estudiante que ve 80% de aciertos en su ensayo y no sabe que la mitad son frágiles no tiene información útil.

**Error conceptual.** Incorrecto y rápido. Respondió con seguridad y estaba mal. Es el error más peligroso porque el estudiante no sabe que lo tiene.

Regla de honestidad: no clasificar con menos de 3 intentos en la habilidad. Un ítem lento no hace a nadie frágil.

---

### 6.3 Ciclo de vida del error (requiere F3)

Cada error del catálogo, para cada estudiante, tiene una fase.

```
abierto  →  observación  →  cerrado
   ↑                            |
   └────────── recaída ─────────┘
```

**Abierto.** El estudiante cometió el error al menos una vez recientemente.

**Observación.** Acertó una vez en un ítem que codifica ese error. Todavía no está cerrado.

**Cerrado.** p(L) supera el umbral, con aciertos espaciados en el tiempo. No basta con acertar tres veces seguidas en la misma sesión.

**Modelo.** BKT simplificado. Parámetros iniciales, a calibrar con datos reales. Fuente: Corbett & Anderson (1995), vía `docs/doctrina-aprendizaje-fobos.md` P10. Corregido el 2026-09-12: acá decía p(T)=0,25 y umbral 0,85; manda la doctrina.

```
p(L0)    = 0,30   conocimiento previo
p(T)     = 0,15   probabilidad de aprender por intento
p(guess) = 0,25   4 alternativas
p(slip)  = 0,10   error por descuido
umbral de cierre = 0,95
```

Restricción: dos de los aciertos tienen que estar separados por al menos 24 horas. Sin eso, cerrar un error es cuestión de insistir en la misma sesión.

**Recaída.** Un error cerrado que vuelve a aparecer vuelve a abierto, y se marca como recaída. La recaída es información distinta de un error nuevo y se muestra distinto.

---

### 6.4 Mapa de recuperables (requiere F4)

Aquí hay una restricción legal que cambia el diseño. **Está prohibido prometer puntajes** (Ley 19.496, publicidad engañosa). "Cerrar estos 3 errores te da +40 puntos" es una promesa de resultado y es indefendible frente a un menor.

La versión que sí se puede construir es descriptiva, no predictiva:

> Tienes 3 errores abiertos en porcentaje.
> En las formas liberadas de la PAES M1, ese contenido aparece en promedio en 6 de 65 preguntas.

Eso es un hecho verificable sobre la prueba, no una promesa sobre el estudiante. La palanca sigue existiendo ("estos errores tocan 6 preguntas"), pero sin cruzar la línea.

Requiere: conteo real de frecuencia por unidad sobre formas liberadas de DEMRE. Es trabajo de análisis, no de código, y se puede hacer en paralelo desde ahora.

---

### 6.5 Triage de 20 segundos (requiere F4)

Entrenamiento de la habilidad de administración de tiempo, que ninguna plataforma entrena.

Se muestra una pregunta. 20 segundos. Dos decisiones (desde F5a2, 2026-09-12; F5a tenía tres):

- **La resuelvo.** Creo que puedo en tiempo razonable.
- **Paso a la siguiente.** No ahora; vuelvo si sobra tiempo.

No se resuelve nada. Solo se decide. La instrucción que ve el estudiante: "No tienes que resolver nada. Solo decidir en 20 segundos si le dedicarías tiempo a esta pregunta en la prueba o si la marcarías para volver después."

La evaluación es contra el historial propio, y se le dice al estudiante con un rótulo y una explicación, sin juzgarlo: si dijo "la resuelvo" en un ítem que codifica un error que tiene abierto, "Ojo con el tiempo". Si pasó a la siguiente en un ítem cuyos errores ya tiene cerrados, "Podías con esta". Si su decisión calza con lo que sabe hacer, "Buena lectura". Sin historial en ese contenido, "Todavía sin datos". Al pie, siempre: los "errores" vienen de las sesiones de descarte, no del triage, y en el triage no hay respuestas buenas ni malas.

Historia de la tercera decisión: F5a tenía "La dejo" (`dejo`) y "La marco y sigo" (`marco`). En la prueba son la misma decisión, así que F5a2 dejó una sola, "Paso a la siguiente", con el valor `marco`. `dejo` sigue existiendo en el tipo, en el validador y en el CHECK de la migración 010, sin ningún emisor.

Sin historial esto no se puede evaluar, por eso vive en F4 y no antes.

---

## 7. Legal y comercial

### 7.1 Precio: el bloqueo se levanta

Hallazgo de `preguntas-abogado-menores-precio.md`, circular del SERNAC sobre preuniversitarios:

- El alumno puede contratar y pagar directamente (art. 3° ter de la Ley del Consumidor).
- No existe prohibición de mostrar precio a un menor. Existe **obligación** de informarlo de forma transparente y sin inducir a error.

El bloqueo que arrastrábamos era precaución propia, no ley. **La puerta de Advance puede mostrar precio.**

Lo que sigue prohibido, y no es negociable:

- Urgencia falsa, cuenta regresiva, "quedan X cupos".
- Presión de venta dirigida a un adolescente. El documento los trata como consumidores hipervulnerables.
- Letra chica de cualquier tipo.
- Cláusulas abusivas: suspender el servicio a voluntad, limitar responsabilidad, renuncia anticipada de derechos.
- Prometer puntaje.

**Respondida.** La Ley 21.719 no obliga a un adulto en el medio del flujo de pago: el art. 16 quáter trata los datos personales de adolescentes de 14 a 17 con las mismas normas de autorización que los de un adulto (MOS §7.5). El texto definitivo de la puerta queda libre para escribirse.

### 7.2 Retracto

El derecho a retracto aplica en contratos de educación. La suscripción por temporada lo hace manejable: se devuelve la proporción no consumida. Definir el mecanismo antes de cobrar, no después del primer reclamo.

### 7.3 Marcas

"PAES" y "DEMRE" solo de forma descriptiva. Nunca en el nombre del producto ni sugiriendo afiliación. Disclaimer permanente: producto independiente, sin vínculo con DEMRE, la Universidad de Chile ni ningún preuniversitario.

El nombre "Fobos Advance" no toca ninguna marca ajena.

### 7.4 Formalización

Antes de cobrarle a alguien fuera del círculo cercano: inicio de actividades ante el SII y boleta por cada venta.

---

## 8. Instrumentación

Eventos nuevos en `lib/eventos.ts`. Mismos principios de siempre: sin autocapture, sin session recording, sin datos identificables.

```
advance_puerta_vista        { eje_id, origen }
advance_descarte_inicio     { unidad_id, items }
advance_descarte_alternativa{ item_id, clave, acertado, posicion_en_orden, ms }
advance_descarte_fatal      { item_id, clave }
advance_descarte_fin        { unidad_id, aciertos, total, error_dominante }
advance_errores_vista       { total, "sin-datos", abierto, observacion, cerrado, recaidas }   // F4
advance_error_cambio_fase   { error_id, desde, hacia }   // F5, ver nota
advance_triage_decision     { item_id, decision, ms }    // F5
```

`posicion_en_orden` es el dato que permite distinguir lectura de adivinanza. No sirve de nada hoy y va a ser valioso en F4. Capturarlo desde el primer día.

Tipos exactos de los cinco de F2, tal como quedaron en `lib/eventos.ts` (2026-09-11): `eje_id: string | null` (null si la puerta se abrió sin eje o con un eje que no está en el mapa); `origen: "tramo" | "portada" | "directo"`, donde `tramo` es el tramo bloqueado del riel, `portada` el redirect de `/advance` sin acceso y `directo` cualquier otra llegada (URL escrita o compartida, o un valor de `?origen=` no declarado); `clave` en `advance_descarte_alternativa` y `advance_descarte_fatal` es la clave ORIGINAL del JSON, no la letra visible tras la mezcla; `error_dominante: string | null`, null cuando la sesión no tuvo ningún descarte acertado; `aciertos` en `advance_descarte_fin` cuenta ítems cerrados sin descarte fatal. Las formas de los cuatro eventos de sesión se calculan en `lib/advance/descarte.ts` (funciones puras con test) y `lib/eventos.ts` importa esos tipos: una sola fuente.

`advance_errores_vista` (F4, 2026-09-12; forma corregida al cierre de F4 para igualarla a `lib/eventos.ts`): una vez por montaje de `/advance/errores` con sesión y acceso; la pantalla de ingreso y el 404 no emiten. Props: `total` (errores del catálogo considerados, incluidos los `sin-datos`), un contador por fase con la clave exacta de `FaseError` de `lib/advance/dominio.ts` (`sin-datos`, `abierto`, `observacion`, `cerrado`; no las etiquetas visibles de D8, que son presentación), y `recaidas` (errores con al menos una recaída). El tipo es `{ total: number; recaidas: number } & Record<FaseError, number>`, derivado del dominio para que `tsc` obligue las claves. Lo emite `components/advance/RegistroErroresVista.tsx`, isla sin UI montada solo en la rama con sesión y acceso, con el mismo `estados` que alimenta las tarjetas proyectado a `{ fase, recaidas }`: p(L) no cruza al cliente (D10). Sin ids de error ni de unidad. `advance_error_cambio_fase` pasa a F5: con el estado calculado al vuelo desde `advance_descartes` (sin tabla `estado_error`) no existe el momento de la transición, así que no hay nada que emitir; entra cuando exista un estado persistido que cambie.

---

## 9. Lo que no se construye

No entra en ninguna fase de este documento. Si aparece como sugerencia, se anota como evolución futura y no se ejecuta:

Tutor de IA, chatbot, ranking, XP, monedas, rachas, badges, leaderboard, confeti, planes de estudio automáticos, video, sistema social, feedback generado por IA en tiempo de respuesta, banco masivo de ejercicios, app móvil nativa, M2, ensayos completos de 65 preguntas.

Dos que se difieren explícitamente aunque estén en el plan original:

**Ruta de 5 etapas** (Identificar, Interpretar, Elegir, Comprobar, Transferir). Exige ítems nuevos diseñados para aislar cada etapa. Es terreno de inventario y ahí no conviene competir todavía.

**MCP propio de Fobos** con el catálogo de errores por distractor. Es la jugada de distribución más interesante que tenemos, porque "mi alumno eligió la C, qué significa" solo lo puede responder Fobos. Pero exige F3 terminado y catálogo estable. Después de la primera temporada.

---

## 10. Riesgos abiertos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Clerk en producción bloqueado sin dominio propio | Bloquea F3 y todo lo que sigue | Comprar dominio ahora, no en F3 |
| Los 41 hallazgos con decisión pedagógica se estancan | Bloquea F0, bloquea todo | Lotes de decisión por tipo, no uno por uno |
| Ley 21.719 vigente el 1 de diciembre de 2026, dentro de la temporada de venta | Multas, aunque el primer año sea amonestación para empresas chicas | Diseñar como si aplicara completa desde F3 |
| El descarte no engancha | Se cae la tesis del producto | F2 es barata a propósito. Se mide con PostHog antes de invertir en F3 |
| SimplePAES copia el descarte | Pérdida de diferenciación | La mecánica es copiable, el catálogo no. Por eso el catálogo es la prioridad |
| 24 fallos e2e preexistentes | Ruido en la verificación de cada fase | Baseline documentado en `docs/deuda-e2e-capturas.md`. Comparar conjunto exacto de tests, no solo el número |

---

## 11. Decisiones pendientes de firma

1. Unidad piloto para F2. Decisión tomada: porcentaje. Banco piloto construido y cerrado en F2 el 2026-09-11 (§4 F2, registro del bloque B).
2. Precio exacto y estructura de la temporada. La 21.719 ya no es dependencia (MOS §7.5); la que sí queda es la pregunta 3 de `docs/modelo-negocio.md` (retracto y devolución). Incluye el id del producto de Advance en `entitlements` (la 004 nombra `m1-2027` como curso completo, anterior a Advance), que es lo que `estadoAdvance()` necesita para leer `vigenciasDe` (§4 F3, 2026-09-14).
3. Fecha de compra del dominio propio, que destraba Clerk.
4. `tiempoReferenciaSeg` se declara por ítem desde ahora. Decisión tomada: verificado en los 20 ítems del banco piloto y exigido por `content/advance/schema/item-advance.schema.json`.

---

## 12. Figuras de función (plano-funcion y tabla-valores)

Infraestructura previa a la unidad 11 (funcion-cuadratica), construida el 2026-09-20 sin escribir ningún ítem. El temario DEMRE M1 pide, para función cuadrática, tablas y gráficos considerando la variación de parámetros y los puntos especiales de la gráfica (vértice, ceros, intersección con los ejes). El plano de isometrías (§2.3, `figuraPlano`) solo dibuja puntos, polígonos, vectores, centros y rectas del enum x=c | y=c | y=x | y=-x; una parábola no era dibujable.

### 12.1 Regla de contenido

La figura muestra los datos del enunciado, nunca la respuesta pedida. Si el ítem pregunta por el vértice, la figura no lo marca ni lo rotula. Si pregunta por los ceros, no se dibujan los puntos sobre el eje x.

Es la misma regla del plano de isometrías (la figura lleva el triángulo y el vector, jamás el triángulo trasladado) aplicada a funciones. Quien escribe el banco es responsable; el validador no puede saber qué pregunta el ítem. Ronda 1 verifica `descripcion` contra los elementos y contra el enunciado.

### 12.2 Cómo se distingue una figura de otra

El campo `figura` del ítem es opcional y admite tres formas, discriminadas por `tipo` (schema: `oneOf` de `figuraPlano`, `figuraPlanoFuncion` y `figuraTablaValores`):

| `figura.tipo` | Figura | Componente | Validador |
|---|---|---|---|
| ausente | plano de isometrías, §2.3 | `PlanoIsometrias.tsx` | regla (10), sin cambios |
| `"plano-funcion"` | plano de función | `PlanoFuncion.tsx` | regla (11) |
| `"tabla-valores"` | tabla de valores | `TablaValores.tsx` | regla (12) |

Los bancos anteriores no llevan `tipo` y no cambian un byte: la rama sin `tipo` del validador es la función original, sin editar. `components/advance/FiguraDeItem.tsx` despacha por `tipo`; descarte y triage lo montan entre el enunciado y las alternativas y no saben cuál es cuál. `itemParaCliente` (`lib/advance/banco.ts`) pasa la figura íntegra al cliente, sin `protegerExpresiones` (los rótulos van en `<text>` y no se cortan); `lib/advance/banco.test.ts` afirma que ningún campo se pierde.

### 12.3 Contrato de `plano-funcion`

Coordenadas reales, con decimales (el plano de isometrías es entero). Todo error, nunca advertencia.

```
tipo: "plano-funcion"
ventana?: { xMin, xMax, yMin, yMax }        si falta, se calcula (12.5)
curvas: 1 a 3 de
  { clase: "parabola", a, b, c, desde?, hasta?, rotulo?, trazo? }   a ≠ 0
  { clase: "recta", m, b, desde?, hasta?, rotulo?, trazo? }
  { clase: "recta", por: [{x,y},{x,y}], desde?, hasta?, rotulo?, trazo? }   x distinto
  { clase: "recta-vertical", x, rotulo?, trazo? }
  trazo: "solido" (default) | "segmentado" | "punteado"
puntos?: 0 a 6 de { x, y, rotulo?, estilo?: "relleno" (default) | "hueco", mostrarCoordenadas?: bool }
segmentos?: 0 a 4 de { desde: {x,y}, hasta: {x,y}, rotulo? }      para acotar distancias o alturas
ejeSimetria?: { x, rotulo? }                                          se dibuja punteado
regiones?: 0 a 2 de
  { clase: "entre-curva-y-eje", curva: <índice en curvas>, desde, hasta }
  { clase: "franja-x", desde, hasta }                                  banda vertical, inecuaciones
etiquetaEjeX?, etiquetaEjeY?: string                                   "tiempo (s)", "altura (m)"
descripcion: string, ≥ 30 caracteres                                   el <desc> del SVG, alternativo real
```

Reglas (11) del validador (`scripts/validar-contenido.mjs`, `validarPlanoFuncion`):

1. `tipo` conocido y claves sobrantes por nivel.
2. `a ≠ 0` en toda parábola; `m` y `b` finitos; `por` con dos puntos de x distinto; `m, b` y `por` excluyentes.
3. Cotas: 1 a 3 curvas, hasta 6 puntos, 4 segmentos y 2 regiones (legibilidad a 390 px).
4. `desde < hasta` donde vengan; ventana con `xMin < xMax` e `yMin < yMax`.
5. Rótulos únicos en toda la figura (curvas, puntos, segmentos y eje comparten el espacio de nombres).
6. Con 2 o más curvas, cada una lleva `rotulo`: no se distinguen solo por color.
7. `regiones[].curva` apunta a una curva existente que no sea `recta-vertical`.
8. Con `ventana` declarada, todo punto, extremo de segmento, extremo de arco, vértice visible, `recta-vertical.x` y `ejeSimetria.x` cae dentro. Sin ventana no se comprueba: la automática se construye desde esos mismos puntos y la contención la afirma `lib/advance/planoFuncion.test.ts`, no el validador.
9. `descripcion` presente y de al menos 30 caracteres.

`estilo: "hueco"` es solo para un punto excluido (extremo abierto de un intervalo). `mostrarCoordenadas` escribe el par al lado del punto, con `;` como separador cuando hay decimales: `(1,5; −3,125)`.

### 12.4 Contrato de `tabla-valores`

```
tipo: "tabla-valores"
encabezados: string[], 1 a 6, no vacíos y únicos
filas: (string | number)[][], 1 a 8, cada fila con el largo de encabezados
descripcion: string, ≥ 30 caracteres
```

Reglas (12): toda fila con el mismo largo que `encabezados`, encabezados no vacíos y únicos, hasta 6 columnas y 8 filas. Se renderiza como `<table>` real con `<th scope="col">` en la cabecera y `<th scope="row">` en la primera celda de cada fila: la tabla es su propio texto alternativo, no una imagen de una tabla. `descripcion` va en un `<caption>` solo para lector de pantalla. Números con `tabular-nums`, formato es-CL y signo menos Unicode. A 390 px entra completa o scrollea dentro de su contenedor; nunca empuja el ancho de la página.

### 12.5 Motor geométrico (`lib/advance/planoFuncion.ts`)

Puro y determinista: sin React, sin `Math.random`, sin `Date`, sin estado. Calcula la figura, no el contenido: los valores de un ítem se siguen calculando aparte con `node -e`.

- `bezierParabola(a, b, c, x0, x1)` y `arcoParabola` (path `M … Q …`): el arco es una Bézier cuadrática exacta. El punto de control es la intersección de las tangentes en los extremos y cae en `x = (x0 + x1)/2`; con eso `x(t)` es lineal y `y(t)` coincide con `f(x(t))`. Test: 10 combinaciones de `(a, b, c, x0, x1)`, 200 valores de `t`, tolerancia 1e-9.
- `recortarArco(arco, ventana)`: subdivisión de De Casteljau en los bordes; devuelve 0, 1 o 2 tramos exactos, nada se dibuja fuera y el corte no deforma la curva.
- `ventanaAutomatica(curvas, puntos, segmentos, otrosX)`: vértices, ceros, interceptos y extremos de arco de cada curva, más todo punto y segmento declarado; 10 % de holgura por lado; incluye el origen si queda a menos de una holgura; extremos redondeados con números redondos. Sin dos ceros la parábola recibe un ancho propio (hasta donde sube tanto como dista el vértice del eje x). Con `desde`/`hasta` solo cuenta lo dibujado: el intercepto lejano no entra.
- `marcasDeEje(min, max, objetivo = 6)`: algoritmo de Heckbert (Graphics Gems I, "Nice numbers for graph labels"), paso 1, 2 o 5 por potencia de 10. `formatoMarca(valor, paso)` escribe cada marca con los decimales que exige el paso (0,25 necesita 2), coma decimal y signo menos Unicode. `formatoDecimalChileno` de `lib/planoCartesiano.ts` no sirve acá porque redondea a un decimal.
- `escalaDe(ventana, ancho, alto, margen)`: escalas independientes en x e y, porque la unidad de x y la de y no tienen por qué medir lo mismo.
- `verticeDe`, `cerosDe` (0, 1 o 2 raíces, tolerancia declarada), `interceptoY`, `coeficientesRecta`, `segmentoRectaEnVentana`.

### 12.6 Componente `PlanoFuncion.tsx`

SVG estático de 320 × 240 unidades de viewBox, `width: 100%`. Jerarquía visual: curvas > puntos rotulados > ejes > grilla. Curvas en `--linea-nav` con trazo 2,25; ejes, marcas, rótulos y segmentos en `--text-primary`; grilla en `--border-hairline` solo en las marcas; regiones en `--linea-tinte`; puntos huecos rellenos con `--color-bg`. Cero colores fuera de los tokens. Con dos o más curvas, el trazo y el rótulo al lado de la curva las distinguen; el color es refuerzo.

Accesibilidad: `role="img"`, `aria-labelledby` a un `<title>` corto generado desde `textos.ts` ("Gráfico de una función", "de dos funciones", "de tres funciones") y a un `<desc>` que es `figura.descripcion`; `focusable="false"`; marcas y rótulos como `<text>` real; halo del color de fondo (`paint-order: stroke`) detrás de cada texto para que una curva que cruza un número no lo tape; sin animación. Medido en `/_design` a 390 × 844 con colores computados sobre `--color-bg` (`scratchpad/planos-funcion/capturas-390.mjs`, 2026-09-20): texto 16,75:1, ejes 16,75:1, curvas 4,57 (01), 16,75 (02), 4,54 (03) y 6,48 (04), grilla 1,34 (decorativa, sin mínimo); 0 recortes de rótulo, 0 desborde horizontal, SVG de 324 × 243 px con letra de marca de 9,5 px.

Lo que la galería deja a la vista y no se resuelve acá: sin `ventana` declarada, una parábola sin `desde`/`hasta` arrastra el intercepto con el eje y aunque quede lejos (es lo que pide el contrato: interceptos); un ítem con `c` grande declara `ventana` o `desde`/`hasta`. El rótulo de un punto sobre una curva que sube hacia la derecha se cruza con la curva; el halo lo mantiene legible.

### 12.7 Galería

`/_design`, sección "Planos de función": 13 planos y una tabla con datos de MUESTRA en `app/%5Fdesign/muestraDescarte.ts` (`PLANOS_FUNCION_MUESTRA`, `TABLA_MUESTRA`), con vértices y ceros marcados solo para medir. No viven en `content/` y ningún banco los importa.

---

## Anexo A. Plantilla de arranque de sesión de CC

```
Trabajo en Fobos Advance, fase F<n>, tarea <n.n> de docs/fobos-advance.md.

Antes de proponer nada:
1. git fetch y reporta el estado real de origin
2. Lee docs/fobos-advance.md, secciones 1, 2 y la de tu fase
3. Verifica en disco lo que la fase asume que existe. No asumas nada.

Reglas de esta sesión:
- Plan Mode obligatorio. No escribes archivos hasta que apruebe.
- Regla de aislamiento (sección 1): no tocas components/leccion/,
  components/camino/ ni content/lecciones/
- Los 3 archivos excluidos siguen excluidos
- git add por path explícito, nunca -A ni .
- No haces push. Nunca.
- CLAUDE.md no se toca
- Commits con prefijo advance:, separados por concern
- PARADA después de cada sub-tarea

Verificación exigida antes de decir que algo está listo:
npm run validar, tsc, lint, npm run capturas comparado contra el
baseline de docs/deuda-e2e-capturas.md (conjunto exacto de tests,
no solo el número), clic real a 390×844, prefers-reduced-motion emulado.

Si algo no se puede verificar, lo dices. No lo das por hecho.
```

## Anexo B. Checklist de cierre de fase

Antes de dar una fase por terminada:

- [ ] Criterio de salida de la fase cumplido y demostrado con salida cruda
- [ ] `npm run validar` verde
- [ ] `tsc` y `lint` verdes
- [ ] `npm run capturas`: mismo conjunto de fallos que el baseline, cero regresiones
- [ ] Contraste AA medido, no calculado, en las cuatro líneas
- [ ] Verificado con clic real a 390×844
- [ ] `prefers-reduced-motion` emulado en todos los estados nuevos
- [ ] Commits separados por concern, con prefijo `advance:`
- [ ] Diffs revisados por Benja
- [ ] Push manual, con confirmación explícita
- [ ] Este documento actualizado con lo que cambió respecto de lo planificado
