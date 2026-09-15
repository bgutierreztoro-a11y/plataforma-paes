# ADR-001: Sin catálogo transversal de errores
**Status:** Accepted
**Date:** 2026-09-15
**Deciders:** Benja

## Context
`docs/analisis/propuesta-catalogo-transversal.md` (2026-09-13) proponía un archivo `content/errores/transversal.json` con 12 ids `transversal/<slug>` para cubrir mecanismos que aparecen en varias unidades (orden de operaciones, distribución parcial, conteo, valor intermedio, inversión de operación, lectura de tabla).
Cifras medidas sobre `docs/analisis/frecuencia-demre-v2.json`: 285 preguntas, 657 distractores, 464 con `errorId: null`; la lista B de la propuesta suma 160 referencias, de las cuales 159 están en null y 1 (2024-regular-113/31C) ya está mapeada a `ecuaciones-e-inecuaciones-primer-grado/confunde-borde-abierto-y-cerrado`.
Tres restricciones técnicas hacen que el catálogo transversal no sea un archivo más: el validador resuelve cada `errorCatalogado` por prefijo de módulo (`scripts/validar-contenido.mjs` 205-225 en lecciones y cierres, 746-788 en bancos Advance), `ERROR_LOCAL` (línea 585) no admite `/` en el slug local, y el runtime lee un solo archivo por `moduloId` (`lib/catalogoErrores.ts` 88-121, `catalogoCompletoDelModulo`).
Además, `error-transversal-pendiente` existe como motivo en el schema y en el validador pero tiene 0 usos en los 3 bancos Advance, y no hay ítems de diagnóstico que lo necesiten.

## Decision
Un id de catalogoErrores pertenece siempre a una unidad de dag-m1.json. No existe catálogo sin módulo. Cuando el mismo mecanismo aparece en varias unidades, cada unidad tiene su id y las descripciones se cruzan con "Distinto de". La propuesta transversal queda como documento de análisis con estado CERRADA / NO FIRMADA.

## Options Considered

### Option A: Catálogo transversal (content/errores/transversal.json)
| Dimension | Assessment |
|---|---|
| Complexity | High: 9 archivos + 3 tests, regla de precedencia nueva |
| Cost | Alto: deprecar ids referenciados por lecciones |
| Scalability | Mala: cada paraguas colisiona con 4 a 13 ids existentes |
| Team familiarity | Nula: rompe la regla "catalogoErrores vive en el módulo" |

### Option B: Campo `patron` en cada entrada del catálogo
| Dimension | Assessment |
|---|---|
| Complexity | Media: schema + validador, sin runtime |
| Cost | Bajo |
| Scalability | Buena, pero sin uso hoy (0 ítems de diagnóstico, 0 error-transversal-pendiente) |
| Team familiarity | Media |

### Option C: Sin catálogo transversal, ids por módulo (ELEGIDA)
| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | 6 ids nuevos + reasignación en frecuencia-demre-v2.json |
| Scalability | Igual a la actual |
| Team familiarity | Total |

## Trade-off Analysis
El catálogo ya duplica mecanismos por módulo a propósito: el conteo de más o de menos tiene id propio en al menos 3 unidades (`funcion-lineal-y-afin/cuenta-mal-los-saltos`, `reglas-de-probabilidades/cuenta-rango-restando-extremos`, `tablas-y-graficos/deja-un-dato-fuera-del-conteo`), la distribución parcial en 3 (`funcion-cuadratica/distribuye-sobre-un-solo-termino`, `sistemas-2x2/distribuye-sobre-parte-de-expresion`, `potencias-y-raices/reparte-raiz-sobre-la-suma`) y la pérdida de signo en 3 (`enteros-y-racionales/pierde-signo-al-restar-negativo`, `expresiones-algebraicas/pierde-signo-al-reducir`, `sistemas-2x2/pierde-signo-al-eliminar`).
Cada uno de esos ids describe el mecanismo con los objetos de su unidad, que es lo que la lección necesita para el feedback.
Un paraguas encima no agrega cobertura: cada distractor ya tiene un id de módulo posible, y con el paraguas tendría dos, sin regla para elegir.
De los 12 ids propuestos, 6 tenían n ≤ 4 o el 100 % de sus ocurrencias en una sola unidad (son ids de módulo con otro prefijo), y los otros 6 eran bolsas de 2 a 3 mecanismos distintos con 4 a 13 colisiones semánticas cada uno contra ids existentes.

## Consequences
- Más fácil: validador, runtime y schema no cambian.
- Más difícil: análisis cruzado entre unidades se hace por grep, no por id.
- Revisar cuando: diagnóstico tenga ítems reales, o un mecanismo aparezca en ≥5 unidades con ≥30 distractores DEMRE sin que ningún id de módulo lo cubra.

## Action Items
1. [x] ADR
2. [x] Propuesta marcada CERRADA
3. [ ] 6 ids nuevos de módulo (fase 2 de este prompt)
4. [ ] Pendiente separado: ids de dag-m1.json (enteros-racionales) no coinciden con nombres de catálogo (enteros-y-racionales); sin tabla de equivalencia en código. No romper ahora.
