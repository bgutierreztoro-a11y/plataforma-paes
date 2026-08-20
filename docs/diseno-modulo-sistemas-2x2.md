# Diseño del módulo: Sistemas de ecuaciones lineales (2x2)

**Id de tema:** `sistemas-2x2`. Eje: Álgebra y funciones (módulo #7 de `docs/mapa-modulos-m1.md`).

Verificación de colisión ejecutada por Benja el 2026-08-19 (`node scripts/consultar-fuentes.mjs`, mecanismo (2) de CLAUDE.md). Veredicto: 13 de 14 candidatos LIMPIO. Único candidato con colisión: **"manzanas y peras"** (SI, 2 archivos: `demre\paes-m1-2026-forma113.md`, `Material\PAES-2026-Forma113-M1-Seleccion-Preguntas-DEMRE.md`) — descartado por completo, no se usa en ninguna lección ni ítem del módulo, ni modificado.

## Objetivo del módulo

Que el estudiante resuelva sistemas de dos ecuaciones lineales con dos incógnitas (método de sustitución, con mención de reducción), reconozca los casos sin solución y con infinitas soluciones a partir de los coeficientes, y traduzca un problema en palabras a un sistema antes de resolverlo.

## Objetivos por lección y progresión conceptual

1. **L1 `sistemas-dos-historias` — Resolución de sistemas de ecuaciones 2x2.** Método de sustitución: dos condiciones ("historias") sobre las mismas dos cantidades no se pueden resolver por separado; despejar una incógnita en una ecuación y sustituirla en la otra reduce el sistema a una sola incógnita. Introduce también, en el par solución, el error de invertir las dos incógnitas al responder.
2. **L2 `sistemas-rectas-no-se-cruzan` — Sistemas sin solución o con infinitas soluciones.** Parte de la pregunta "¿todo sistema tiene una única solución?" — no. Cuando el "ritmo de cambio" (coeficiente de la variable) es igual en ambas ecuaciones, o el sistema colapsa a una identidad falsa (sin solución) o verdadera (infinitas soluciones), y no a un valor único. Depende de L1: usa la misma manipulación algebraica, pero el resultado es distinto (una constante, no un valor de la incógnita).
3. **L3 `sistemas-plantear-antes-resolver` — Problemas que involucren sistemas de ecuaciones 2x2.** El cuello de botella no es resolver (ya dominado en L1) sino traducir el enunciado a las dos ecuaciones correctas. Foco en identificar qué cantidad va en cada ecuación, con "leer antes de calcular" como marco.

Un descubrimiento fijado por lección: L1 fija la sustitución; L2 fija el criterio de coeficientes; L3 fija la traducción enunciado→sistema. Cierre integra los tres.

## Catálogo de errores (embebido íntegramente en L1, todos usados dentro de L1)

| id | Descripción |
|---|---|
| `error-1` | Al despejar una incógnita o distribuir una multiplicación sobre una suma/resta, aplicar la operación solo a una parte de la expresión en vez de a todos sus términos, rompiendo la igualdad. |
| `error-2` | Al sustituir la expresión despejada, reemplazarla en la MISMA ecuación de la que se despejó (verificación circular) en vez de en la otra ecuación del sistema, con lo que el sistema nunca se reduce a una incógnita. |
| `error-3` | Al sumar o restar las dos ecuaciones del sistema (o al distribuir un signo negativo), no aplicar el signo correctamente a todos los términos de una de ellas, invirtiendo el resultado de la eliminación. |
| `error-4` | Encontrar el valor de una incógnita y no sustituir de vuelta en el sistema para encontrar el valor de la otra, entregando una solución incompleta. |
| `error-5` | Invertir los valores de las dos incógnitas al reportar el par solución final, aunque ambos se hayan calculado correctamente. |
| `error-6` | Al traducir un problema a ecuaciones, igualar una cantidad con el total equivocado (usa el total de dinero donde correspondía el total de unidades/personas, o viceversa), armando un sistema que no representa el problema. |

L2 y L3 reutilizan estos ids donde el error calza (típicamente `error-1`, `error-3`, `error-5`, `error-6`); los errores conceptuales propios de L2 (confundir "sin solución" con "infinitas soluciones", comparar coeficientes sin llevarlos a forma comparable) y de L3 (traducciones específicas del contexto) van con feedback artesanal sin `errorCatalogado`, mismo patrón ya usado en `cierre-enteros-racionales.json` (alternativas C/D del ítem 5, sin id).

## Mapa de contextos numéricos (sin repetir escena entre lecciones ni con el cierre)

- **L1** — boletería de cine (adulto/niño), tres funciones con precios y totales distintos; ítems con boletería adicional; consolidación con una cuarta boletería.
- **L2** — planes de telefonía con cargo fijo + costo por minuto (caso sin solución) y una oferta escrita de dos formas equivalentes (caso infinitas soluciones); ítems con arriendo de bicicletas y ahorro semanal de dos amigos.
- **L3** — edades de dos hermanos (escena núcleo); ítems con boletos de bus/metro y sueldo con bono fijo + comisión.
- **Cierre** — kiosco escolar, drones en un trayecto, repartidores en bicicleta, entradas a un evento escolar, collares de piedra y madera, e ítem integrador que combina el mecanismo de L1 (boletería, sustitución) con el de L3 (edades, traducir antes de resolver).

Ninguno de estos candidatos reutiliza "manzanas y peras" (descartado) ni un candidato con colisión.

### Ronda 2 — reemplazos por auditoría de originalidad (2026-08-19)

La Ronda 1 de verificación (arriba) comparó contra el corpus general de fuentes aisladas y marcó NO para todos los candidatos usados en ese momento. Una Ronda 2 posterior, específica sobre el material fuente del tema (`MOD-06_Ecuacion_Recta_Sistemas.md`, `MA-30_Sistemas_Ecuaciones.md`), identificó que 4 de esos contextos —aunque técnicamente "NO" contra el corpus general— eran arquetipos clásicos de sistemas de ecuaciones que sí aparecen en ese material específico, y los rechazó:

| Ubicación | Contexto rechazado | Reemplazo | Verificación del reemplazo |
|---|---|---|---|
| L2 `l2-item-2` | estanques de agua | ahorro semanal de dos amigos | NO (Benja, 2026-08-19) |
| Cierre `cierre-sistemas-3` | ciclistas a distinta velocidad | drones en un trayecto | NO (Benja, 2026-08-19) |
| Cierre `cierre-sistemas-4` | ciclistas a distinta velocidad | repartidores en bicicleta | NO (Benja, 2026-08-19) |
| Cierre `cierre-sistemas-7` | mezcla de café | collares de piedra y madera | NO (Benja, 2026-08-19) |

Cada verificación de la columna derecha corresponde exactamente al término suelto entre comillas (frase completa pasada como argumento propio a `consultar-fuentes.mjs`), no a palabras sueltas dentro de ella ni a ninguna otra combinación. El resto de los contextos del mapa (boletería de cine, planes de telefonía, arriendo de bicicletas, edades de hermanos, boletos de bus/metro, sueldo con bono, kiosco escolar, entradas de evento escolar) no fue tocado por la Ronda 2 y sigue vigente la verificación original de arriba.

## Decisión sobre el campo `estado`

El pipeline `borrador→revision→publicable` y el campo `estado` fueron eliminados del contrato el 2026-08-12 (CLAUDE.md regla 5); no se agrega a los 4 archivos de este módulo. El gate real de publicación es el commit sin push (Fase 8 del proceso), no un campo del JSON.
