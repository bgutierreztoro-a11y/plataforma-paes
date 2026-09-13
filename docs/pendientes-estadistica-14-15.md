# Pendientes: módulos 14 (tablas y gráficos) y 15 (medidas de posición)

Estado al cierre de la sesión de producción del 2026-09-13 (brief de Benja,
firmas por adelantado, sin PARADA). Todo en commits locales sobre `master`,
**sin push**. Los dos módulos están completos en contenido y registrados en
`lib/modulos.ts`; lo que queda es de Benja, fuera de sesión.

## Hecho (commits locales, en orden, sobre `661a68f`)

1. `tooling:` `lib/estadistica.ts` + `lib/estadistica.test.ts` (22 tests): fracciones exactas,
   tablas de frecuencia, sectores, promedio (suelto, desde tabla, unión, dato faltante),
   mediana, cuartiles con la convención del curso y `cuartilesIncluyendo` como oráculo,
   percentil y `percentilAlternativo` como oráculo, resumen de cinco números, y el
   contrato `motivoRechazoDatosGrafico` de los cuatro bloques visuales.
2. `tooling:` contrato visual en `content/schema/leccion.schema.json` (aditivo, `allOf`
   con `if/then`, `additionalProperties: false` en cada objeto nuevo), espejo en
   `lib/tipos.ts` y validación en `scripts/validar-contenido.mjs`.
3. `feat:` `GraficoBarras`, `GraficoLineas`, `GraficoCircular`, `DiagramaCajon`,
   `GraficoEstadistico` (despachador) y `graficosComunes` en `components/ilustraciones/`;
   `BloqueVisualizacion` y `lib/visualesItems.tsx` los aceptan con el mismo guard que el
   validador; fixtures en `e2e/fixtures/estadistica.ts` y vista previa en
   `/vista-previa/estadistica`.
4. `docs:` `docs/diseno-modulo-tablas-y-graficos.md` y `docs/diseno-modulo-medidas-de-posicion.md`.
5. `contenido:` `content/errores/tablas-y-graficos.json` (19 ids).
6. `contenido:` las 3 lecciones de tablas-y-graficos + visuales de ítems.
7. `contenido:` `content/cierres/cierre-tablas-y-graficos.json` + visuales de ítems.
8. `contenido:` `content/errores/medidas-de-posicion.json` (15 ids).
9. `contenido:` las 3 lecciones de medidas-de-posicion + visuales de ítems.
10. `contenido:` `content/cierres/cierre-medidas-de-posicion.json` + visuales de ítems.
11. `feat:` rótulos del cajón en tres niveles cuando la caja es angosta (corrección
    detectada al ver la L2 de medidas-de-posicion en el navegador).
12. `tooling:` registro en `lib/modulos.ts` (cierres, `cierreId`, reorden de `lecciones`)
    y `lib/descripcionesLecciones.tsx` (6 entradas).
13. `docs:` `docs/mapa-modulos-m1.md` (15/16) + este archivo.

Los hashes exactos están en `git log --oneline origin/master..HEAD` del informe
final de la sesión.

## Para Benja, fuera de sesión (en este orden, antes de cualquier `git push`)

1. **Consulta de colisión.** `node scripts/consultar-fuentes.mjs` con las palabras
   clave de la sección "Palabras clave" de los dos docs de diseño (están completas
   ahí, incluidas las de los dominios del cierre). Un dominio con SI se reemplaza
   entero, nunca se ajusta.
2. **Auditoría matemática** (hilo `/clear`, `.claude/agents/revisor-matematico.md`)
   sobre los 8 archivos nuevos de contenido (4 + 4).
3. **Auditoría de originalidad** (hilo `/clear`) sobre los mismos 8.
4. Recién ahí `git push`.

## Discrepancias entre el brief y el repo, y qué se decidió

- **`lib/temario.ts` no existe.** El brief pedía tomar el `moduloId` de
  `lib/modulos.ts`, `lib/temario.ts` y `dag-m1.json`. La taxonomía vive solo en
  `lib/modulos.ts`; `git ls-files | grep temario` no devuelve ningún `.ts`.
- **El `moduloId` no coincide con el DAG, y es lo esperado.** `lib/modulos.ts` declara
  `tablas-y-graficos` y `medidas-de-posicion`; `content/diagnostico/dag-m1.json`
  declara `tablas-graficos` y `medidas-posicion`. Desde la migración del 2026-09-13
  (`docs/deuda-catalogo-errores-crossfile.md`, punto b) el `moduloId` del contenido y la
  `unidad` del catálogo son el id de tema, y el DAG quedó fuera de esa migración
  (`docs/pendientes.md`, tabla de slugs). Se usó el id de tema en los dos módulos,
  igual que hace `semejanza-y-proporcionalidad` en `content/`. Ninguna guarda cruza el
  `moduloId` de lecciones y cierres contra el DAG.
- **Orden y títulos de las lecciones.** `docs/mapa-modulos-m1.md` traía los tres ids de
  cada módulo en un orden que no calzaba con el diseño pedagógico firmado (tablas →
  gráficos → promedio; cuartiles → percentiles y cajón → posición de un dato). Se
  conservaron los ids (cada slug calza con exactamente una lección), se reordenó
  `lecciones` en `lib/modulos.ts` como ya se hizo en `expresiones-algebraicas`, y los
  títulos pasaron a los descriptores literales del temario, como en
  `potencias-y-raices` y `cuerpos-geometricos`. Está registrado en los dos docs de
  diseño, en el mapa y en el comentario de `lib/modulos.ts`. Si Benja prefiere el orden
  original, el cambio es solo en `lib/modulos.ts` y en el mapa: los archivos no
  dependen del orden.
- **Componentes en `components/ilustraciones/`, no en `components/`.** El brief nombraba
  `components/GraficoBarras.tsx`; en el repo todas las ilustraciones viven en
  `components/ilustraciones/` (`IlustracionSemejanza.tsx` incluido, que el brief también
  ubicaba en `components/`). Se siguió la convención del repo.
- **No hay componente `TablaDatos`.** `BloqueVisualizacion` ya renderiza
  `variante: "tabla"` con `datos: { columnas, filas }` (lo usa `semejanza-misma-forma-otro-tamano`);
  se usó eso para todas las tablas de frecuencia y para el pictograma con clave (una fila
  por categoría con símbolos ▲ repetidos y la clave en la descripción). No se creó
  componente de tabla ni de pictograma.
- **`descripcionesLecciones` va en el commit de registro, no en el de infraestructura.**
  `lib/__tests__/descripcionesLecciones.test.ts` exige que ninguna clave de `CATALOGO`
  apunte a una lección sin archivo; agregar las 6 entradas en el commit 3 habría puesto
  `npm run test:unit` en rojo antes de que existieran los JSON. Mismo criterio que la
  sesión de los módulos 12 y 13.
- **`visualesItems`: el tipo en el commit de infraestructura, las entradas con su
  contenido.** El commit 3 agrega la variante `{ grafico }` y el render; cada entrada
  concreta (ids de ítems) viaja en el commit de la lección o del cierre que la usa,
  porque antes de ese commit el ítem no existe.
- **Un commit `feat:` extra (el 11).** El brief listaba 12 commits; el 11 corrige un
  solape de rótulos del cajón que apareció recién al ver una lección real en el
  navegador (caja angosta de 800 pasos sobre una escala de 10.000). Es un cambio de
  componente, con propósito único y verificado en pantalla.
- **"63 🔴 preexistentes" del brief.** `npm run auditar` sobre todo `content/` da hoy
  **0 bloqueantes** en los 46 archivos de lecciones (45 + `l0-demo`); igual que en la
  sesión anterior, la cifra 63 no corresponde al estado del repo.
- **`/camino/[unidad]` no existe.** La ruta por tema es `/tema/[id]`; las 8 rutas nuevas
  (6 lecciones + 2 cierres) más los dos `/tema/...` y `/camino` responden 200 con
  `next dev`, y `/camino/tablas-y-graficos` da 404 porque no hay tal ruta.
- **`npm run auditar` y los cierres.** El auditor rechaza `tipo: "cierre"`; los dos
  cierres pasan solo por `npm run validar` (que incluye la resolución de todos los
  `errorCatalogado` y la cobertura del catálogo).
- **Catálogo: ids que no aparecen en el cierre.** `usa-lineas-para-categorias` y
  `cree-que-extremo-no-afecta-promedio` (módulo 14) y `compara-cajones-en-escalas-distintas`
  (módulo 15) se ejercitan solo en lecciones. Todos los ids de los dos catálogos quedan
  cubiertos entre L1, L2, L3 y cierre (0 sin uso, medido en el informe final).
- **Barras y líneas admiten hasta 8 categorías** (`MAX_CATEGORIAS`). Por eso la L1 de
  medidas-de-posicion muestra sus 12 tiempos en una tabla de cuatro grupos y no en
  barras, y el cajón de los cinco números es el bloque visual nuevo de esa lección.

## Advertencias 🟡 que quedan (todas de `colision-entre-archivos`; se dejan y se listan)

Adimensionales (porcentajes, fracciones, ángulos, percentiles):

- `datos-leer-antes-de-calcular.json`: 0,25 y 0,3 (frecuencias relativas), 12,5 y 37,5 (porcentajes).
- `datos-grafico-puede-mentir.json`: 12,5 (porcentaje), 108 (grados del sector).
- `datos-numero-que-representa.json`: 10,5 (un promedio de huevos por día; en otros archivos, razón o cociente).
- `posicion-caja-que-resume.json` y `posicion-donde-quedaste-tu.json`: 87,5 y 37,5 (percentiles).

Con magnitud, misma cifra con otra unidad y otro rol:

- `datos-grafico-puede-mentir.json`: 115, 135, 165, 175 (kilos por mes; en otros archivos mL, cm o dosis) y 8.300, 8.700, 8.900 (pesos por kilo; en `posicion-caja-que-resume` son pasos).
- `posicion-partir-en-cuatro.json`: 6,5 y 25,5 (segundos; en semejanza, metros y centímetros).
- `posicion-caja-que-resume.json`: 4.900, 5.000, 5.400, 6.000, 6.400, 6.600, 7.200 (pasos; en porcentaje y sistemas, pesos).
- `posicion-donde-quedaste-tu.json`: 100 (metros de la carrera), 330, 335, 349, 357, 367 (centímetros; en proporcionalidad, mL o hileras).

Salida cruda de `npm run auditar` sobre los 6 archivos nuevos: en el informe final de
la sesión.

## Verificaciones crudas al cierre

```
npm run validar → 75 OK, 0 FALLA, exit 0 (tablas-y-graficos 60/60 y medidas-de-posicion 60/60 en cobertura de errorCatalogado)
npm run auditar → 0 🔴 en los 46 archivos de lecciones, exit 0
npm run test:unit → 424 pass, 0 fail (402 previos + 22 de lib/estadistica.test.ts)
npx tsc --noEmit → exit 0 · npm run lint → exit 0 · npm run build → exit 0
next dev (puerto 3119): 12 rutas medidas con curl, 11 × 200 y /camino/tablas-y-graficos 404; proceso bajado
```
