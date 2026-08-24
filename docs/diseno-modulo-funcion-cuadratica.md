# Diseño del módulo: Función cuadrática

**Id de tema:** `funcion-cuadratica`. Eje: Álgebra y funciones (módulo #9 de `docs/mapa-modulos-m1.md`).

Verificación de colisión ejecutada por Benja (`node scripts/consultar-fuentes.mjs`, mecanismo (2) de CLAUDE.md). Veredicto: 8 de 9 candidatos LIMPIO. Único candidato con colisión: **"arco de un puente peatonal" / "altura máxima del arco"** (SI, 2 archivos, `MOD-07_Algebra_Funciones_III.md` del corpus de Álgebra y Funciones de terceros) — descartado por completo, no se usa en ninguna lección ni ítem del módulo, ni modificado (regla c del SKILL: mismo arquetipo "arco → altura máxima → vértice" que el material fuente).

## Objetivo del módulo

Que el estudiante resuelva ecuaciones de segundo grado en contexto, lea cómo los parámetros `a`, `b`, `c` mueven la parábola, identifique el vértice como su punto extremo (máximo o mínimo según el signo de `a`) y encuentre sus ceros e intersecciones con los ejes, incluyendo el caso de un modelo cuadrático sin solución real.

## Objetivos por lección y progresión conceptual

1. **L1 `cuadratica-sube-y-baja` — Ecuaciones de segundo grado.** Sin gráfico interactivo (descriptor 1 puro). El estudiante descubre que un problema con dos cantidades relacionadas por un **producto** (no una suma) desemboca en una ecuación cuadrática, que se resuelve factorizando y aplicando la propiedad del producto nulo — con dos soluciones posibles, de las cuales el contexto solo permite una. Fija el error de raíz espuria (error-1) y el de solución incompleta (error-2) que L3 va a retomar bajo otro nombre (ceros).
2. **L2 `cuadratica-punto-mas-alto` — Vértice y parámetros de la función cuadrática.** Usa `GraficoParabola` con `mostrarVertice`. Parte de una predicción ingenua ("el vértice siempre es el punto más alto") que se rompe al mover `a` a positivo — ese quiebre es el descubrimiento central: el vértice es un extremo (máximo si `a<0`, mínimo si `a>0`), no siempre "lo más alto". Cubre además cómo `b` y `c` desplazan el vértice, sin fórmula memorizada de entrada: se llega a `x = −b/(2a)` como generalización, no como punto de partida.
3. **L3 `cuadratica-donde-toca-el-eje` — Ceros e intersección con los ejes.** Usa `GraficoParabola` con `mostrarCeros`. Depende de L2 (ya sabe leer el vértice) para entender por qué a veces hay dos ceros, a veces uno (vértice apoyado en el eje) y a veces ninguno (la parábola no cruza). Cierra retomando el mecanismo algebraico de L1 (factorización, producto nulo) pero ahora leído gráficamente como intersección con el eje X, y agrega la intersección con el eje Y (siempre en `(0, c)`, sin necesidad de resolver nada).

Un descubrimiento fijado por lección: L1 fija "producto, no suma, y dos soluciones posibles"; L2 fija "el vértice es un extremo, no siempre un máximo"; L3 fija "el número de ceros depende de si la parábola llega a cruzar el eje". Cierre integra las tres.

## Catálogo de errores (embebido íntegramente en L1, todos usados dentro de L1)

| id | Descripción |
|---|---|
| `error-1` | Al resolver la ecuación cuadrática completa (dos raíces reales), reportar como solución válida la raíz que no cumple la restricción del contexto (valor negativo cuando el enunciado exige una cantidad positiva: ancho, número de jugadores, número par), sin descartarla. |
| `error-2` | Al aplicar la propiedad del producto nulo — (x−p)(x−q)=0 ⟹ x=p ∨ x=q —, calcular y reportar solo una de las dos soluciones de la ecuación, omitiendo la segunda. |
| `error-3` | Al traducir el enunciado a una ecuación, plantear la **suma** de las dos cantidades igualada al valor dado en vez de su **producto** (o viceversa), obteniendo una ecuación lineal que no representa la relación cuadrática del problema. |
| `error-4` | Al expandir un producto de binomios o un cuadrado de binomio, distribuir la operación solo sobre uno de los términos en vez de todos, rompiendo la igualdad antes de resolver. |
| `error-5` | Al factorizar x² + bx + c como (x − p)(x − q), invertir el signo de las raíces reportadas — dar p y q en vez de −p y −q —, confundiendo el signo dentro del factor con el signo de la raíz. |

L2 y L3 reutilizan estos ids donde el mecanismo calza (`error-1` reaparece en L3 como "descartar el cero que no corresponde" si el contexto lo exige; `error-2` reaparece en L3 como "reportar solo uno de los dos ceros"). Los errores conceptuales propios de L2 (confundir signo de `a` con si el vértice es máximo o mínimo; calcular `y` del vértice evaluando en `x=0` en vez de en `x=−b/2a`; pensar que `c` mueve el vértice horizontalmente) y de L3 (confundir "no hay ceros reales" con "hay un error de cálculo"; olvidar que la intersección con el eje Y es siempre `(0,c)` sin resolver nada) van con feedback artesanal **sin** `errorCatalogado`, mismo patrón que `sistemas-2x2`. Si alguno de estos termina necesitando un id propio (por ejemplo si se repite en 3+ distractores distintos), sigo la regla 4 del SKILL: paro y propongo el id exacto antes de escribirlo — no lo invento acá.

## Mapa de contextos numéricos (sin repetir escena entre lecciones ni con el cierre)

- **L1** — núcleo (curiosidad → descubrimiento): **dos números pares consecutivos cuyo producto es un valor dado** (puzzle numérico puro, sin envoltorio real — deja ver la estructura x(x+2)=k sin ruido de traducción). Aplicación (transferencia + descriptor 4): **caja de cartón para manualidades**, ancho y largo relacionados por una diferencia fija, área dada. Ítem PAES adicional: **campeonato escolar de tenis de mesa todos-contra-todos**, número de partidas según cantidad de participantes (n(n−1)/2 = partidas) — habilidad `modelar`.
- **L2** — núcleo (curiosidad → descubrimiento): **huerto escolar**, rendimiento total del cultivo según la densidad de plantas por m² (el rendimiento por planta baja al aumentar la densidad, así que el total es un producto de dos cantidades que se mueven en direcciones opuestas — motiva la parábola sin física ni dinero). Aplicación (transferencia + descriptor 4): **dron de reparto**, altura vertical en un patio mientras sube, entrega un paquete y desciende — vértice = altura máxima del vuelo.
- **L3** — núcleo (curiosidad → descubrimiento): **letrero luminoso en forma de arco sobre la entrada de un gimnasio**, ancho de la base según la altura máxima del arco — los ceros son literalmente los dos puntos donde el arco toca el suelo, lectura directa del gráfico. Aplicación (transferencia + descriptor 4, interpretación en contexto): **ganancia neta de un emprendimiento estudiantil de llaveros** según cantidad vendida — los ceros son las cantidades de equilibrio (ni gana ni pierde), habilidad `argumentar`/`modelar`.
- **Reserva sin usar en lecciones** (candidato limpio, disponible para ítems del cierre si hace falta variedad): **perfil de una rampa de snow park**, dónde toca el suelo en ambos extremos.
- **Cierre** — reutiliza los 5 contextos ya verificados arriba (números consecutivos, caja de cartón, campeonato de tenis de mesa, huerto escolar, dron de reparto, letrero-arco de gimnasio, llaveros) con cifras nuevas por ítem, más la rampa de snow park si se necesita un octavo contexto distinto. Cobertura balanceada de las 3 lecciones y de las 4 habilidades — se define la matriz exacta en Fase 6, no acá.

Ninguno de estos candidatos reutiliza "arco de puente peatonal" (descartado) ni ningún dominio ya usado en otros módulos del eje (bidón/estanque de agua, ahorro/coleccionables, planes de celular, bolsas misteriosas, buceo/temperaturas, factorización de números que se turnan, rectángulo 73², grúa/contenedores, manifiesto de carga, talleres escolares de porcentaje, feria del libro, boletería de cine, edades de hermanos, planes de telefonía, embaldosado/cerámica).

## Estructura de las 3 lecciones

- **L1 `cuadratica-sube-y-baja`** — sin `interactivoSlider`. Los 10 pasos son texto, predicción, numérica y selección, igual que `ecuaciones-lineales.json`. No usa `GraficoParabola`: el descubrimiento es puramente algebraico (factorizar, producto nulo, filtrar por el dominio del contexto).
- **L2 `cuadratica-punto-mas-alto`** — al menos un `interactivoSlider` con `objeto: "parabola"`, `variante: "unaVariable"`, `mostrarVertice: true`, `exploracionMinima` fijado para forzar que el estudiante mueva `a` a ambos signos antes de avanzar (es la única forma de que viva el quiebre "el vértice no siempre es el punto más alto"). `mostrarCeros` ausente (false): este paso no regala los ceros, eso es tema de L3.
- **L3 `cuadratica-donde-toca-el-eje`** — `interactivoSlider` con `mostrarCeros: true`. Probablemente `mostrarVertice: true` también (ya se ganó en L2, no hay motivo para escondérselo — ayuda a leer por qué a veces hay un solo cero: el vértice está apoyado en el eje X). Variante `unaVariable` con exploración mínima sobre los tres controles para que el estudiante encuentre por sí mismo un caso con 0, 1 y 2 ceros antes del paso de generalización.

## Rangos de a/b/c por lección (respecto a los defaults de `BloqueInteractivo.tsx`: a∈[−2,2] paso 0,5 valorInicial 1; b∈[−3,3] paso 1 valorInicial 0; c∈[−5,5] paso 1 valorInicial 0)

- **L2** — `configA.valorInicial = −1` (no el default `+1`): el primer render debe mostrar una parábola que abre hacia abajo, coherente con el título "punto más alto" y con el contexto del huerto (el rendimiento cae a ambos lados de la densidad óptima — el mundo real que se está modelando abre hacia abajo). Min/max se mantienen en `[−2,2]` a propósito: el estudiante SÍ debe poder llevar `a` a positivo y presenciar que el vértice pasa a ser el punto más bajo — ese es el quiebre pedagógico central de la lección, no un caso a evitar. `b` y `c` quedan en los defaults; la garantía documentada en `BloqueInteractivo.tsx` (vértice dentro de [−10,10]² para |a|≥0,5) sigue vigente sin tocarla.
- **L3** — mismo criterio de signo: `configA.valorInicial = −1` para que el primer render sea un arco (dos ceros simétricos, visualmente el letrero-arco del contexto). Propongo además `configC.valorInicial = 4` (en vez del default `0`): con `a=−1, b=0, c=4` el estado inicial es `y=−x²+4`, ceros en `x=±2`, vértice en `(0,4)` — una parábola con dos ceros limpios y un vértice claramente distinto de cero, mejor punto de partida para explorar que degenerar en `y=−x²` (vértice y un comportamiento menos ilustrativo del caso general). Min/max de los tres controles se mantienen en los defaults: el rango completo es necesario para que el estudiante alcance los tres casos (2, 1 y 0 ceros reales) durante la exploración mínima.
- Los valores exactos de cada paso puntual (no el estado inicial del interactivo) se calculan y verifican con `node -e` al escribir cada JSON (Fase 3-5), no acá.

## Decisión sobre el campo `estado`

El pipeline `borrador→revision→publicable` y el campo `estado` fueron eliminados del contrato el 2026-08-12 (CLAUDE.md regla 5); no se agrega a los 4 archivos de este módulo. El gate real de publicación es el commit sin push (Fase 8 del proceso), no un campo del JSON.
