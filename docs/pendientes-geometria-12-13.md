# Pendientes: módulos 12 (transformaciones isométricas) y 13 (semejanza y proporcionalidad)

Estado al cierre de la segunda sesión, 2026-09-13 (producción sin PARADA, brief de
Benja, firmas por adelantado). Todo en commits locales sobre `master`, **sin
push**. Los dos módulos están completos en contenido y registrados en
`lib/modulos.ts`; lo que queda es de Benja, fuera de sesión.

## Hecho (commits locales, en orden, sobre `origin/master` = `0c459a3`)

Primera sesión (2026-09-13, mañana):

```
25ae1dc tooling: primitivas de transformaciones isométricas
18ee6ba tooling: primitivas de semejanza
234bc85 tooling: contrato visual de transformación y semejanza en schema, tipos y validador
05bc409 feat: renderizado de transformaciones isométricas y semejanza
44dd372 docs: diseño de los módulos transformaciones-isometricas y semejanza-y-proporcionalidad
10f327b contenido: catálogo de errores del módulo transformaciones-isometricas (16 ids)
78d3696 contenido: 3 lecciones de transformaciones-isometricas
7879fc2 contenido: cierre-transformaciones-isometricas
d10dd9c contenido: catálogo de errores del módulo semejanza-proporcionalidad (11 ids)
69446f7 contenido: L1 de semejanza-y-proporcionalidad
78b8b34 docs: pendientes de los módulos 12 y 13 (versión anterior de este archivo)
```

Segunda sesión (2026-09-13, cierre), en el orden del brief:

1. `tooling:` cobertura del catálogo canónico en el validador
   (`validarCoberturaCatalogo` + `reservado` + test + `.d.ts`).
2. `docs:` doctrina de catálogo canónico (`docs/deuda-catalogo-errores-crossfile.md`
   sección 2026-09-13 + `.claude/producir-modulo-m1/SKILL.md`).
3. `docs:` corrección del descubrimiento de L3 en
   `docs/diseno-modulo-transformaciones-isometricas.md` ((−7, 0) y eje y).
4. `contenido:` `content/lecciones/semejanza-medir-sin-acercarse.json` (L2).
5. `contenido:` `content/lecciones/semejanza-plano-y-realidad.json` (L3).
6. `contenido:` `content/cierres/cierre-semejanza-y-proporcionalidad.json` +
   `lib/visualesItems.tsx` (visuales de `cierre-semejanza-3` y `cierre-semejanza-7`).
7. `tooling:` registro (`lib/modulos.ts`: `IDS_CIERRE` + `cierreId` de los temas 12 y
   13; `lib/descripcionesLecciones.tsx`: 6 entradas).
8. `docs:` `docs/mapa-modulos-m1.md` (13/16) + este archivo.

Los hashes exactos están en `git log --oneline origin/master..HEAD` del informe
final de la sesión.

## Para Benja, fuera de sesión (en este orden, antes de cualquier `git push`)

1. **Consulta de colisión.** `node scripts/consultar-fuentes.mjs` con las palabras
   clave de la sección "Palabras clave" de los dos docs de diseño. Dominios que
   se sumaron en esta sesión y no están en esa lista del doc de semejanza:
   `"exposicion"`, `"sala de exposicion"`, `"meson"`, `"faro"` (maqueta del ítem 2 de L2),
   `"quincho"`, `"mastil"`, `"cable"`, `"puerta"`, `"nino"` (ítem 7 del cierre) y
   `"arbol"`. Un dominio con SI se reemplaza entero, nunca se ajusta.
2. **Auditoría matemática** (hilo `/clear`, `.claude/agents/revisor-matematico.md`)
   sobre los 8 archivos nuevos del módulo 12 + 13 (4 + 4).
3. **Auditoría de originalidad** (hilo `/clear`) sobre los mismos 8.
4. Recién ahí `git push`.

## Discrepancias entre el brief y el repo, y qué se decidió

- **Catálogo embebido vs canónico.** Igual que en la primera sesión: el repo usa
  fuente única en `content/errores/<moduloId>.json` desde el 2026-09-08. El brief
  de esta sesión (V1) pedía ver si "el chequeo de conjunto exacto de
  `catalogoErrores` en cierres" se relajó. Respuesta medida: **no se tocó en esta
  sesión** (el diff de `scripts/validar-contenido.mjs` contra `origin/master` solo
  agrega `validarBloqueVisualizacion`); el chequeo que existía sobre la copia
  embebida (`catalogo-sin-usar`) se retiró en `origin` el 2026-09-08 (`1b80281`),
  antes de esta sesión. Lo que dejó de validarse entonces: "todo id del catálogo lo
  usa alguien". Se repuso sobre el canónico en el commit 1 (`validarCoberturaCatalogo`),
  medido contra los 13 catálogos: 0 ids sin uso, 0 huérfanos.
- **Numeración de ids.** El brief decía que "los 11 módulos anteriores conservan la
  numeración correlativa antigua" y que los nuevos "reinician en error-1". Medido:
  **los 13 catálogos parten en `error-1`** con namespace de unidad; nunca hubo
  numeración global. Está escrito en `docs/deuda-catalogo-errores-crossfile.md`
  (sección 2026-09-13, punto b) con la salida del conteo.
- **`docs/reglas-modulo.md` regla 5 sigue diciendo "embeber".** Es la única pieza de
  documentación que todavía describe el régimen anterior ("No se crea
  `content/errores/<unidad>.json` para módulos nuevos"). Fuera del alcance del
  brief (que nombró `deuda-crossfile` y `SKILL.md`); queda registrado acá para que
  se reescriba en un `docs:` propio, con el mismo texto de la sección 2026-09-13.
- **Números reservados en el doc de diseño de semejanza.** Varios se cambiaron al
  escribir L2, L3 y el cierre para no propagar las 🟡 de L1 (2,5; 10,5; 12,5) ni
  colisionar con `contextosNumericos` de otros módulos (1,2; 1,5; 1,6; 4,5; 7,5;
  0,2). Cada cambio está en `_notasInternas` del archivo correspondiente con el
  motivo. El doc de diseño no se reescribió: su plan de ítems queda como plan, y
  los archivos son la verdad.
- **`error-10` de semejanza no aparece en el cierre.** Se usa en L3 (práctica,
  consolidación e ítem 3). Ninguno de los 8 ítems del cierre usa una ampliación
  porcentual, y forzarlo habría duplicado el ítem 3 de L3. Los 11 ids del catálogo
  quedan cubiertos entre L1, L2, L3 y cierre (verificado con `node -e`, informe
  final).
- **"63 🔴 preexistentes" del brief.** `npm run auditar` sobre todo `content/`
  da hoy **0 bloqueantes** en los 39 archivos de lecciones; solo hay 🟡 de colisión
  entre archivos. La cifra 63 no corresponde al estado del repo en esta sesión
  (puede venir de una corrida con `--estricto`, donde los 🟡 cuentan como falla).
- **`/camino/[unidad]` no existe.** La ruta por tema es `/tema/[id]`. Se midieron
  las 8 rutas nuevas (6 lecciones + 2 cierres) más `/camino` y los dos `/tema/...`:
  todas 200; `/camino/semejanza-y-proporcionalidad` da 404 porque no hay tal ruta.
- **`npm run auditar` y los cierres.** El auditor rechaza `tipo: "cierre"`; los dos
  cierres pasan solo por `npm run validar` (que ahora incluye la cobertura del
  catálogo).

## Advertencias 🟡 que quedan (todas adimensionales, se dejan y se listan)

- `semejanza-misma-forma-otro-tamano.json`: 2,5; 10,5; 12,5 (razón y lados con otro
  rol en cuerpos, inecuaciones y proporcionalidad). Primera sesión, sin cambio.
- `semejanza-medir-sin-acercarse.json`: 1.600 (es 40², factor de área) y 25.000
  (es la escala 1:25.000).
- `semejanza-plano-y-realidad.json`: 100 (escala 1:100), 150 (el 150 %), 1,5 (k del
  150 %), 2,25 (k²), 0,75 (razón altura ÷ sombra). Doce líneas del auditor, cinco
  cifras, todas factores o porcentajes.
- Cierre (no lo mide el auditor): la única cifra decimal compartida con otro archivo
  es 1,8 (sombra del niño en `cierre-semejanza-7`), que en
  `potencias-raiz-escondida` es el valor 9/5 de un distractor.

## Verificaciones crudas al cierre (2026-09-13, segunda sesión)

Las salidas completas están en el informe final de la sesión (Fase 5). Resumen:

```
node scripts/validar-contenido.mjs <cada uno de los 3 archivos nuevos> → OK
node scripts/auditar-leccion.mjs content/lecciones/semejanza-medir-sin-acercarse.json → 🟡 0 bloqueante(s), 2 advertencia(s)
node scripts/auditar-leccion.mjs content/lecciones/semejanza-plano-y-realidad.json  → 🟡 0 bloqueante(s), 12 advertencia(s)
npm run validar → todo OK (68 archivos), exit 0
npm run auditar → 0 🔴 en los 39 archivos de lecciones
npm run test:unit → 402 pass, 0 fail
npx tsc --noEmit → exit 0 · npm run lint → exit 0
next dev (puerto 3117): 11 rutas medidas con curl, todas 200; proceso bajado
```
