# Pendientes: módulo 16 (reglas de las probabilidades)

Estado al cierre de la sesión de producción del 2026-09-13 (brief de Benja,
firmas por adelantado, sin PARADA). Todo en commits locales sobre `master`,
**sin push**. El módulo está completo en contenido y registrado en
`lib/modulos.ts`; con él, los 16 módulos del free tier tienen sus 3 lecciones
y su cierre. Lo que queda es de Benja, fuera de sesión.

## Hecho (commits locales, en orden, sobre `6d55258`)

1. `tooling:` `lib/probabilidad.ts` + `lib/probabilidad.test.ts` (18 tests): fracciones
   exactas, Laplace, complemento, espacio producto, reglas aditiva y multiplicativa,
   árboles con y sin reposición, tabla de doble entrada, frecuencia relativa,
   `distintosEnValor`, y el contrato `motivoRechazoDatosProbabilidad` de los dos
   bloques visuales.
2. `tooling:` contrato visual en `content/schema/leccion.schema.json` (aditivo,
   `ramaArbol` recursivo, `datosDiagramaArbol`, `datosCuadriculaEspacioMuestral`,
   `additionalProperties: false`), espejo en `lib/tipos.ts` y validación en
   `scripts/validar-contenido.mjs`; test de integración con `validarDatos`.
3. `feat:` `DiagramaArbol`, `CuadriculaEspacioMuestral` y `VisualProbabilidad`
   (despachador) en `components/ilustraciones/`; `BloqueVisualizacion` y
   `lib/visualesItems.tsx` los aceptan con el mismo guard que el validador; fixtures
   en `e2e/fixtures/probabilidad.ts` y vista previa en `/vista-previa/probabilidad`.
4. `docs:` `docs/diseno-modulo-reglas-de-probabilidades.md`.
5. `contenido:` `content/errores/reglas-de-probabilidades.json` (23 ids).
6. `feat:` rótulo de raíz a la izquierda del árbol y margen de la cuadrícula según el
   rótulo de fila más largo (dos correcciones vistas en el navegador sobre lecciones
   reales, antes de commitear el contenido).
7. `contenido:` las 3 lecciones + la variante `{ tabla }` de `visualesItems` con la
   entrada del ítem 2 de L2.
8. `contenido:` `content/cierres/cierre-reglas-de-probabilidades.json` + visuales de
   los ítems 1, 5 y 7.
9. `tooling:` registro en `lib/modulos.ts` (`cierreId`, `IDS_CIERRE`) y
   `lib/descripcionesLecciones.tsx` (3 entradas).
10. `docs:` `docs/mapa-modulos-m1.md` (16/16) + este archivo.

Los hashes exactos están en `git log --oneline origin/master..HEAD` del informe
final de la sesión.

## Para Benja, fuera de sesión (en este orden, antes de cualquier `git push`)

1. **Consulta de colisión.** `node scripts/consultar-fuentes.mjs` con las palabras
   clave de la sección "Palabras clave" del doc de diseño (están completas ahí,
   incluidas las de los dominios del cierre). Un dominio con SI se reemplaza entero,
   nunca se ajusta.
2. **Auditoría matemática** (hilo `/clear`, `.claude/agents/revisor-matematico.md`)
   sobre los 4 archivos de contenido (3 lecciones + cierre), recalculando con
   `node -e` sobre `lib/probabilidad.ts`.
3. **Auditoría de originalidad** (hilo `/clear`) sobre los mismos 4.
4. Recién ahí `git push`.

## Discrepancias entre el brief y el repo, y qué se decidió

- **Los commits de 14/15 ya estaban en origin.** El brief esperaba "commits locales
  de los módulos 14 y 15 sin push"; `git log --oneline origin/master..HEAD` estaba
  vacío al abrir la sesión y `master` apuntaba a `6d55258 = origin/master`. Se
  construyó encima de ese commit; el diff de la Fase 6 se mide contra él.
- **Títulos de las lecciones.** El brief traía títulos lúdicos («Lo que puede pasar y
  lo que suele pasar», «O una cosa o la otra», «Primero esto, después esto otro») como
  si vinieran del mapa. El mapa dice «El título es el nombre técnico DEMRE» y
  `.claude/producir-modulo-m1/SKILL.md` (regla 9, "la ley de la sesión" según el
  propio brief) dice «Nada lúdico». Se siguió la regla del repo con el precedente de
  14 y 15 (títulos alineados al contenido real): «Probabilidad de un evento», «Regla
  aditiva de probabilidades», «Regla multiplicativa de probabilidades». Los dos
  últimos cambian respecto de la carga masiva («Regla aditiva y multiplicativa»,
  «Problemas con reglas de probabilidad en contexto») porque el segundo descriptor
  del temario se repartió en dos lecciones. Si Benja prefiere los lúdicos, el cambio
  es el campo `titulo` de los 3 JSON y las tablas del mapa y del doc de diseño; nada
  más depende del título.
- **`lib/temario.ts` no existe** (`git ls-files | grep temario` devuelve solo
  `docs/temario-demre-m1-2027.md`). El `moduloId` se tomó de `lib/modulos.ts`.
- **El `moduloId` no coincide con el DAG, y es lo esperado.** `lib/modulos.ts` declara
  `reglas-de-probabilidades`; `content/diagnostico/dag-m1.json` declara
  `reglas-probabilidad`. Mismo caso que `tablas-y-graficos` / `tablas-graficos` y
  `medidas-de-posicion` / `medidas-posicion`: el `moduloId` del contenido y la
  `unidad` del catálogo son el id de tema (`docs/pendientes-estadistica-14-15.md`).
  Ninguna guarda cruza el `moduloId` de lecciones y cierres contra el DAG.
- **El mapa no declaraba cierre para el #16.** Se usó la convención
  `cierre-<id de tema>`: `cierre-reglas-de-probabilidades`.
- **No hay campo `estado`.** El brief pedía commitear "con el mismo `estado`" que
  `cierre-medidas-de-posicion.json` en su commit de producción (`d5a382a`); ese
  archivo no tiene campo `estado` (0 ocurrencias; el campo se eliminó del schema el
  2026-08-12). Lo que sí se copió es la forma de la `proveniencia`: declaración de
  originalidad con la consulta de colisión pendiente de Benja fuera de sesión.
- **Componentes en `components/ilustraciones/`, no en `components/`.** Convención del
  repo (`DiagramaCajon.tsx`, `GraficoBarras.tsx` viven ahí).
- **No hay componente de tabla de doble entrada.** `BloqueVisualizacion` ya renderiza
  `variante: "tabla"` con `{ columnas, filas }`; las tablas con totales de L2 y del
  cierre usan eso. Para los ítems, `lib/visualesItems.tsx` sumó la variante
  `{ tabla }`, que monta `BloqueVisualizacion` con esos datos (no se creó
  `TablaDobleEntrada.tsx`, así que tampoco hay contrato de totales en el validador:
  los totales de las 4 tablas se verificaron con `tablaDobleEntrada` de
  `lib/probabilidad.ts` en `node -e` y quedan en las `_notasInternas`).
- **`descripcionesLecciones` va en el commit de registro, no en el de
  infraestructura**, porque `lib/__tests__/descripcionesLecciones.test.ts` exige que
  cada clave apunte a un archivo en disco (mismo criterio que 12 a 15). El brief lo
  listaba en el commit 3.
- **Un commit `feat:` extra (el 6).** El brief listaba 9 commits; el sexto corrige el
  rótulo de raíz del árbol (se cortaba por la izquierda) y el margen de la cuadrícula
  (un rótulo de fila largo pisaba el título del eje), vistos en el navegador sobre L3.
  Es un cambio de componente con propósito único, hecho antes de commitear contenido.
- **El validador no tiene contrato para tablas de doble entrada** porque no hizo falta
  componente (ver arriba); el brief lo condicionaba a eso.
- **`npm run auditar` y el cierre.** El auditor rechaza `tipo: "cierre"`; el cierre
  pasa solo por `npm run validar` (que incluye la resolución de todos los
  `errorCatalogado` y la cobertura del catálogo).
- **Ids del catálogo que no aparecen en el cierre**: `resta-conteo-a-uno-en-complemento`,
  `cuenta-rango-restando-extremos`, `espera-frecuencia-igual-a-teorica`,
  `divide-por-total-de-fila`, `resta-a-uno-un-solo-evento` y
  `omite-ambos-en-al-menos-uno` se ejercitan solo en lecciones. Los 23 ids quedan
  cubiertos entre L1, L2, L3 y cierre (0 sin uso, 0 huérfanos, medido en el informe
  final).
- **Orden de las alternativas.** El runner mezcla las alternativas al montar
  (`mezclarAlternativas`), así que el orden creciente por valor del JSON es una
  propiedad del archivo, no de la pantalla.
- **Advertencia del build, preexistente.** `next build` reporta "Turbopack build
  encountered 1 warnings: ./next.config.ts, Encountered unexpected file in NFT list";
  el archivo no se tocó en esta sesión.

## Advertencias 🟡 que quedan (todas de `colision-entre-archivos`; se dejan y se listan)

Adimensionales (probabilidades y proporciones):

- `probabilidad-posible-y-probable.json`: 0,5 (P(par) = 1/2; en `porcentaje-rebaja-doble` es un multiplicador y en `probabilidad-esto-o-esto-otro`, P(múltiplo de 3 o de 4)).
- `probabilidad-esto-o-esto-otro.json`: 0,5 (idem) y 0,6 (P(lluvia el sábado); en `potencias-raiz-escondida` es otra magnitud).

Con magnitud, misma cifra con otra unidad y otro rol:

- `probabilidad-posible-y-probable.json`: 200 (lanzamientos de la tapa; en `figuras-problemas-con-forma` y `potencias-raiz-escondida` son metros y otra cifra).

`probabilidad-antes-de-apostar.json` sale 🟢 sin hallazgos.

## Verificaciones crudas al cierre

```
npm run validar → 84 OK, 0 FALLA, exit 0 (reglas-de-probabilidades 60/60 en cobertura de errorCatalogado; TOTAL 738/933)
npm run auditar → 0 🔴 en los 49 archivos de lecciones (48 + l0-demo), exit 0; 12 🟢, 37 🟡 (línea base: 11 🟢, 35 🟡, 0 🔴 sobre 46)
npm run test:unit → 443 pass, 0 fail (424 previos + 19 de lib/probabilidad.test.ts, 18 propios + 1 de integración con validarDatos)
npx tsc --noEmit → exit 0 · npm run lint → exit 0 · npm run build → exit 0
next dev (puerto 3121): /leccion/probabilidad-posible-y-probable, /leccion/probabilidad-esto-o-esto-otro, /leccion/probabilidad-antes-de-apostar, /cierre/reglas-de-probabilidades, /tema/reglas-de-probabilidades y /camino → 200; proceso bajado
```
