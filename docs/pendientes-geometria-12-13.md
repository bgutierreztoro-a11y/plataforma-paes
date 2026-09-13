# Pendientes: módulos 12 (transformaciones isométricas) y 13 (semejanza y proporcionalidad)

Estado al cierre de la sesión del 2026-09-13 (producción sin PARADA, brief de Benja). Todo en commits locales sobre `master`, **sin push**. Se retoma mañana desde el punto 1 de "Para retomar".

## Hecho (commits locales, en orden)

```
25ae1dc tooling: primitivas de transformaciones isométricas (vectores, traslación, rotación, reflexión, composición)
18ee6ba tooling: primitivas de semejanza (razón exacta, factores, criterio LLL, homotecia)
234bc85 tooling: contrato visual de transformación y semejanza en schema, tipos y validador
05bc409 feat: renderizado de transformaciones isométricas y semejanza (Ilustracion*, BloqueVisualizacion, fixtures)
44dd372 docs: diseño de los módulos transformaciones-isometricas y semejanza-y-proporcionalidad
10f327b contenido: catálogo de errores del módulo transformaciones-isometricas (16 ids)
78d3696 contenido: 3 lecciones de transformaciones-isometricas (puntos y vectores, tres isometrías, problemas)
7879fc2 contenido: cierre-transformaciones-isometricas (8 ítems, 4 habilidades, 24 distractores catalogados)
(+2)    contenido: catálogo de errores del módulo semejanza-proporcionalidad (11 ids)
        contenido: L1 de semejanza-y-proporcionalidad (semejanza-misma-forma-otro-tamano)
```

Módulo 12 completo en contenido (3 lecciones + cierre), sin registrar todavía en `lib/modulos.ts`. Módulo 13: catálogo y L1 escritos; L2, L3 y cierre pendientes.

## Para retomar (orden)

1. `content/lecciones/semejanza-medir-sin-acercarse.json` (L2): plan, números reservados y errores en `docs/diseno-modulo-semejanza-y-proporcionalidad.md`, sección L2. Dominios: maqueta de un molino de viento 1:40 (núcleo) y mapa de trekking 1:25.000 (aplicación). Visual: cuadrados lado a lado k = 2 y k = 3 en `descubrimiento`.
2. `content/lecciones/semejanza-plano-y-realidad.json` (L3): sombras (visual anidada), laguna, fotocopia al 150 %, plano 1:100.
3. `content/cierres/cierre-semejanza-y-proporcionalidad.json`: 8 ítems según la tabla del doc; `cierre-semejanza-7` tiene su visual ya declarada en `lib/visualesItems.tsx` (poste 10 m de sombra, persona 1,8 m con sombra 2,4 m, h = 7,5 m).
4. Después de cada archivo: `node scripts/validar-contenido.mjs <ruta>` y `node scripts/auditar-leccion.mjs <ruta>` (el auditor solo audita lecciones; los cierres solo pasan por el validador). Ledger de colisión distractor/correcta por archivo, como en las `_notasInternas` de los ya escritos.
5. Registro (commit `tooling: registro`): `lib/modulos.ts` (agregar `cierre-transformaciones-isometricas` y `cierre-semejanza-y-proporcionalidad` a `IDS_CIERRE` y como `cierreId` de los temas 12 y 13) y `lib/descripcionesLecciones.tsx` (6 entradas: quedaron fuera del commit 4 porque `lib/__tests__/descripcionesLecciones.test.ts` rechaza claves sin archivo en disco, y en ese momento los JSON no existían). `lib/estadoModulo.ts` no necesita cambios.
6. Docs (commit `docs:`): `docs/mapa-modulos-m1.md` (filas 12 y 13 a completo, `Archivo: sí` en las 6 lecciones, y declarar los dos `cierreId`, que el mapa hoy no trae); corregir en `docs/diseno-modulo-transformaciones-isometricas.md` el descubrimiento de L3: la composición real es trasladar por (−7, 0) y luego reflejar respecto del eje y, no (−4, 0) y eje x (con una traslación horizontal y el eje x los dos órdenes coinciden; con (−4, 0) y el eje y la imagen se superponía al motivo). La razón está en `_notasInternas` de `isometrias-figura-y-su-imagen.json`.
7. Verde total: `npm run validar`, `npm run auditar`, `npm run test:unit`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. **`npm run build` no se corrió en esta sesión.** No correr e2e (24 fallos preexistentes conocidos).
8. Informe final (Fase 6 del brief): `git log --oneline origin/master..HEAD`, `git status --short`, colas de validar y auditar, `node -e` por archivo (ítems, distractores con `errorCatalogado`, ids referenciados contra `content/errores/<moduloId>.json`, `contextosNumericos`), lista de dominios para `consultar-fuentes.mjs`.
9. Benja, fuera de sesión: `node scripts/consultar-fuentes.mjs` con las palabras clave de los dos docs de diseño (sección "Palabras clave"); auditorías matemática y de originalidad en hilos `/clear`; recién ahí `git push`.

## Discrepancias entre el brief y el repo, y qué se decidió

- **Catálogo embebido vs canónico.** El brief pedía `catalogoErrores` embebido en cada archivo, byte a byte idéntico entre los 4 del módulo. El repo cambió el 2026-09-08 (`docs/deuda-catalogo-errores-crossfile.md`, RESUELTA): fuente única en `content/errores/<moduloId>.json`, `catalogoErrores` fuera del schema, `validarReferenciasResuelven` cruza cada `errorCatalogado` contra el canónico. Se siguió el repo. El chequeo "byte a byte entre 4 archivos" de la Fase 6 no aplica; lo reemplaza `npm run validar` (todo id referenciado resuelve).
- **Numeración de ids.** El brief pedía partir del siguiente al máximo del repo (16, `expresiones-algebraicas/error-16`). Los ids llevan namespace por módulo (`<unidad>/error-N`, verificado en los 11 catálogos: todos parten en `error-1`), así que dentro de cada namespace nuevo el máximo era ninguno y se partió en `error-1`. Si Benja prefiere `error-17` en adelante, es un `sed` sobre 2 catálogos y 8 archivos.
- **`moduloId` del módulo 13.** El id de tema es `semejanza-y-proporcionalidad` y la unidad del DAG (`content/diagnostico/dag-m1.json`) es `semejanza-proporcionalidad`. Los archivos de contenido declaran el segundo (lo exige el validador); el cierre y el tema usan el primero.
- **`npm test` no existe.** El runner es `npm run test:unit` (`node --test "lib/**/*.test.ts"`).
- **Descripciones de lecciones en el commit 4.** Movidas al commit de registro (punto 5) por el test de cobertura.
- **`error-10` de semejanza ("despejar mal la proporción") descartado antes de nacer.** Sus dos salidas coinciden siempre con `error-2` y `error-9`; no produce número propio. El catálogo de semejanza tiene 11 ids, no 12; el doc de diseño lo registra.
- **Auditor y cierres.** `scripts/auditar-leccion.mjs` rechaza archivos de tipo `cierre` (solo lecciones); "0 🔴 en los archivos nuevos" se cumple sobre las lecciones, y los cierres pasan por `npm run validar`.
- **Specs e2e.** No se escribieron (el brief pedía fixtures y vistas previas, y no correr e2e). Las vistas previas `/vista-previa/transformaciones-isometricas` y `/vista-previa/semejanza` se verificaron a mano en el navegador el 2026-09-13.
- **Advertencias 🟡 `colision-entre-archivos`** en `isometrias-girar-reflejar-trasladar.json` (180, son grados) y `semejanza-misma-forma-otro-tamano.json` (2,5; 10,5; 12,5, con otro rol en cuerpos, inecuaciones y proporcionalidad): cifras con otro significado, no bloqueantes.

## Verificaciones crudas al cierre (2026-09-13)

```
$ node scripts/validar-contenido.mjs content/lecciones/isometrias-mover-sin-deformar.json → OK
$ node scripts/auditar-leccion.mjs  content/lecciones/isometrias-mover-sin-deformar.json → 🟢 sin hallazgos
$ node scripts/validar-contenido.mjs content/lecciones/isometrias-girar-reflejar-trasladar.json → OK
$ node scripts/auditar-leccion.mjs  content/lecciones/isometrias-girar-reflejar-trasladar.json → 🟡 0 bloqueante(s), 2 advertencia(s) (180)
$ node scripts/validar-contenido.mjs content/lecciones/isometrias-figura-y-su-imagen.json → OK
$ node scripts/auditar-leccion.mjs  content/lecciones/isometrias-figura-y-su-imagen.json → 🟢 sin hallazgos
$ node scripts/validar-contenido.mjs content/cierres/cierre-transformaciones-isometricas.json → OK
$ node scripts/validar-contenido.mjs content/lecciones/semejanza-misma-forma-otro-tamano.json → OK
$ node scripts/auditar-leccion.mjs  content/lecciones/semejanza-misma-forma-otro-tamano.json → 🟡 0 bloqueante(s), 3 advertencia(s) (2,5; 10,5; 12,5)
$ npm run validar → 65 OK, 0 FALLA
$ npm run test:unit → 397 pass, 0 fail (tras el commit 4)
$ npx tsc --noEmit → exit 0 · npm run lint → limpio
```
