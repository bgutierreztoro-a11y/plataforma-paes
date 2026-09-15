# Propuesta: catálogo transversal de errores

> **ESTADO: CERRADA, NO FIRMADA (2026-09-15). Ver docs/decisiones/ADR-001.** Correcciones de
> datos: la lista B suma 160 refs (159 nulos + 2024-regular-113/31C ya mapeado a
> ecuaciones-e-inecuaciones-primer-grado/confunde-borde-abierto-y-cerrado); los 3 "sin figura"
> son 2026-regular-113/49A/C/D, no forma 2027.

Generado el 2026-09-13 a partir de `docs/analisis/frecuencia-demre-v2.json` (285 preguntas, 657 distractores mapeables, 464 en `null`). Es una propuesta: nada de esto existe en `content/`. Los ids van marcados como provisionales; el texto lo propone CC y el id lo fija Benja (regla vigente).

## Por qué un catálogo aparte

Los 13 catálogos de `content/errores/` describen mecanismos propios de cada unidad. En las formas DEMRE, una parte grande de los distractores viene de mecanismos que no nombran ningún objeto de la unidad: traducir mal el enunciado, distribuir un factor a medias, contar de más, detenerse en un valor intermedio, invertir una operación, leer la fila equivocada. El mismo mecanismo aparece en enteros, en porcentaje, en cuerpos y en isometrías, y hoy cae en `null` en todas.

## Qué cubriría: los 464 null de v2, clasificados uno por uno

| Categoría | Distractores | % del null | % de los 657 |
|---|---|---|---|
| **A** candidato de una unidad concreta (lista A) | 44 | 9.5 | 6.7 |
| **B** cubierto por este catálogo transversal (12 ids, lista B) | 159 | 34.3 | 24.2 |
| **C** el distractor no es un valor: es una creencia sobre un paso correcto o una afirmación (argumentar, "¿en qué paso?", interpretar) | 83 | 17.9 | 12.6 |
| **D** sin mecanismo reconocible: el número no sale de ningún procedimiento errado que se pueda escribir | 175 | 37.7 | 26.6 |
| figura o enunciado no disponible (forma 2027, sin PDF) | 3 | 0.6 | 0.5 |

Dicho sin esconderlo: **el catálogo por distractor no aplica a la categoría C** (83 distractores, uno de cada ocho del corpus mapeable). Ahí el distractor es «el Paso 2 está mal» o «es la constante de proporcionalidad inversa», y lo que habría que catalogar es la creencia, no un cálculo. Y la categoría D (175, uno de cada cuatro) muestra que DEMRE usa distractores plausibles que no derivan de un mecanismo único; ningún catálogo los va a cubrir. Con las listas A y B aprobadas, el null bajaría de 464 a 261 (39.7 % de los 657), y ese resto es estructural.

La asignación por categoría es de CC, distractor por distractor, con reglas escritas (`clasificar-null2.js` en el scratchpad de la sesión); las referencias exactas de cada lista están abajo para auditarla.

## Archivo propuesto

`content/errores/transversal.json`, `unidad: "transversal"`, ids `transversal/<slug>` con la misma forma que los demás (verbo en 3ª persona + objeto, kebab-case, únicos globalmente). Consumo: `catalogoCompletoDelModulo` sigue resolviendo por `moduloId`; un ítem que necesite un error transversal lo referenciaría con el id completo `transversal/<slug>`, forma que el validador ya admite para ítems de diagnóstico (regla 6e) y que habría que admitir en lecciones, cierres y bancos Advance como segundo catálogo (hoy `errorCatalogado` es local al módulo). No se toca código en esta propuesta.

## Lista B: ids propuestos (provisionales, 12)

### `transversal/rompe-orden-de-operaciones` (propuesto)

Resolver las operaciones en el orden equivocado: una resta antes de un producto, un producto antes del paréntesis interno, o duplicar o dividir antes de operar lo que está entre paréntesis.

Ocurrencias: 3, en 1 unidad(es).
  - enteros-y-racionales: 2024-regular-113/1A, 2024-regular-113/1D, 2024-invierno-111/1B

### `transversal/traduce-mal-el-enunciado` (propuesto)

Traducir el lenguaje natural a una expresión, ecuación o inecuación con la agrupación, el orden, el coeficiente o la cantidad equivocados (el doble de la tercera parte de, tres botellas de cada una, todos menos uno).

Ocurrencias: 28, en 4 unidad(es).
  - enteros-y-racionales: 2024-regular-113/4A, 2024-regular-113/4C, 2024-regular-113/4D, 2026-regular-113/11A, 2026-regular-113/11B, 2026-regular-113/11D
  - expresiones-algebraicas: 2024-invierno-111/24A, 2024-invierno-111/24B, 2024-invierno-111/24C, 2025-regular-113/27B, 2025-regular-113/27C, 2025-regular-113/27D, 2024-regular-113/26C, 2027-invierno-111/4A
  - ecuaciones-e-inecuaciones-primer-grado: 2025-regular-113/33A, 2025-regular-113/33B, 2025-regular-113/33C, 2025-regular-113/31A, 2025-regular-113/31D, 2025-regular-113/34B, 2025-regular-113/34C, 2025-regular-113/34D, 2025-regular-113/36A, 2025-regular-113/36B
  - potencias-y-raices: 2026-regular-113/15D, 2024-regular-113/19A, 2024-regular-113/19B, 2024-regular-113/19C

### `transversal/reparte-factor-a-un-solo-termino` (propuesto)

Distribuir un factor, una división o un porcentaje sobre un solo término de la suma en vez de sobre todos (a/4 − 1600 por (a − 1600)/4; 6x + 390 por 3x + 3(x + 390)). Distinto de funcion-cuadratica/distribuye-sobre-un-solo-termino, que es sobre expandir productos de binomios.

Ocurrencias: 7, en 3 unidad(es).
  - expresiones-algebraicas: 2024-invierno-111/26B, 2027-invierno-111/4D, 2025-regular-113/25B, 2025-regular-113/25C
  - ecuaciones-e-inecuaciones-primer-grado: 2025-regular-113/31B, 2024-regular-113/31C
  - funcion-lineal-y-afin: 2024-regular-113/39B

### `transversal/cuenta-mal-piezas-o-pasos` (propuesto)

Contar de más o de menos: una duplicación, un intervalo, una comisión, una pieza de una figura compuesta o una casilla de una cuadrícula (errores de fencepost y de piezas compartidas).

Ocurrencias: 18, en 6 unidad(es).
  - cuerpos-geometricos: 2024-invierno-111/45A, 2024-invierno-111/45B, 2026-regular-113/47A, 2026-regular-113/47C, 2026-regular-113/47D
  - transformaciones-isometricas: 2026-regular-113/52C, 2025-regular-113/62A
  - funcion-lineal-y-afin: 2024-regular-113/10A
  - enteros-y-racionales: 2024-invierno-111/8A, 2024-regular-113/5D, 2024-regular-113/7B, 2024-regular-113/7C
  - porcentaje: 2024-invierno-111/12A, 2027-invierno-111/17C
  - potencias-y-raices: 2025-regular-113/23A, 2026-regular-113/13A, 2026-regular-113/13B, 2026-regular-113/13D

### `transversal/omite-un-paso-o-responde-intermedio` (propuesto)

Detenerse antes del final: entregar un valor intermedio, un dato del enunciado o la magnitud equivocada (la parte por el total, el exponente por los minutos, un solo tramo del viaje), u omitir un paso como el regreso, los ausentes o el día adicional. Generaliza porcentaje/responde-parte-en-vez-de-total y potencias-y-raices/responde-otra-magnitud-potencias.

Ocurrencias: 32, en 9 unidad(es).
  - enteros-y-racionales: 2024-invierno-111/1D, 2024-invierno-111/8D, 2024-regular-113/8A, 2025-regular-113/7B, 2025-regular-113/10B, 2025-regular-113/10C, 2025-regular-113/10D, 2026-regular-113/25A, 2026-regular-113/25C, 2026-regular-113/25D, 2027-invierno-111/3C, 2027-invierno-111/3D, 2027-invierno-111/11B, 2027-invierno-111/14C
  - potencias-y-raices: 2024-invierno-111/3D, 2024-invierno-111/19A, 2024-invierno-111/21A, 2024-invierno-111/21C, 2026-regular-113/43C
  - proporcionalidad: 2024-invierno-111/27A, 2025-regular-113/28A, 2025-regular-113/29D, 2026-regular-113/3B
  - funcion-cuadratica: 2024-invierno-111/40B
  - porcentaje: 2024-regular-113/22B, 2024-regular-113/22D
  - transformaciones-isometricas: 2024-regular-113/51B
  - cuerpos-geometricos: 2025-regular-113/59D
  - expresiones-algebraicas: 2027-invierno-111/4B, 2027-invierno-111/36A, 2027-invierno-111/36C
  - semejanza-y-proporcionalidad: 2027-invierno-111/26A

### `transversal/invierte-la-operacion` (propuesto)

Aplicar la operación contraria a la que pide la relación: multiplicar donde va dividir (o al revés), sumar donde va restar, invertir un cociente o una razón fuera del contexto de proporcionalidad. Generaliza proporcionalidad/invierte-el-cociente y proporcionalidad/multiplica-al-volver-del-total.

Ocurrencias: 33, en 10 unidad(es).
  - potencias-y-raices: 2024-invierno-111/17B, 2024-regular-113/21D, 2025-regular-113/21A, 2025-regular-113/21B, 2025-regular-113/21D
  - expresiones-algebraicas: 2024-invierno-111/23B, 2024-invierno-111/23C, 2024-invierno-111/23D, 2024-invierno-111/26C, 2024-invierno-111/46C, 2024-invierno-111/46D, 2025-regular-113/32C
  - figuras-geometricas: 2024-invierno-111/43C, 2024-regular-113/46B, 2024-regular-113/46D, 2026-regular-113/45A, 2026-regular-113/45C
  - semejanza-y-proporcionalidad: 2024-invierno-111/53B
  - ecuaciones-e-inecuaciones-primer-grado: 2024-regular-113/31B, 2027-invierno-111/32B, 2027-invierno-111/32D
  - transformaciones-isometricas: 2024-regular-113/49B, 2024-regular-113/53A, 2024-regular-113/53B, 2024-regular-113/53D
  - enteros-y-racionales: 2026-regular-113/4D, 2027-invierno-111/14D
  - proporcionalidad: 2026-regular-113/28C, 2027-invierno-111/12B, 2027-invierno-111/12D
  - funcion-lineal-y-afin: 2026-regular-113/40C, 2026-regular-113/40D
  - funcion-cuadratica: 2026-regular-113/41C

### `transversal/pierde-o-invierte-un-signo` (propuesto)

Perder o invertir el signo de una componente, un término o un desplazamiento (sur y oeste como positivos, −x como +x al reducir, el signo de un recargo). Generaliza enteros-y-racionales/pierde-signo-al-restar-negativo y expresiones-algebraicas/pierde-signo-al-reducir.

Ocurrencias: 3, en 3 unidad(es).
  - potencias-y-raices: 2024-regular-113/21C
  - figuras-geometricas: 2024-regular-113/36A
  - ecuaciones-e-inecuaciones-primer-grado: 2026-regular-113/33B

### `transversal/eleva-negativo-sin-parentesis` (propuesto)

Evaluar una potencia par de base negativa con signo negativo, o −x² como (−x)²: (−1)² = −1, −3² = 9 al evaluar f(−3).

Ocurrencias: 4, en 2 unidad(es).
  - potencias-y-raices: 2024-invierno-111/3A
  - funcion-cuadratica: 2024-invierno-111/40D, 2024-regular-113/40D, 2027-invierno-111/39B

### `transversal/confunde-coeficiente-elevado` (propuesto)

Confundir 2x² con (2x)² o 2x³ con (2x)³: elevar o no elevar el coeficiente junto con la variable.

Ocurrencias: 3, en 2 unidad(es).
  - expresiones-algebraicas: 2024-regular-113/24A, 2024-regular-113/26A
  - funcion-cuadratica: 2027-invierno-111/39D

### `transversal/lee-mal-tabla-o-grafico` (propuesto)

Tomar la fila, el tramo o el valor equivocado de una tabla, un gráfico o una figura: la fila de otro rango de masa, la tarifa de otro tramo, un tramo horizontal leído como detenido, el resto de una lectura tomado como 0,3 en vez de 0,2.

Ocurrencias: 19, en 4 unidad(es).
  - proporcionalidad: 2024-invierno-111/6A, 2024-invierno-111/6B, 2024-invierno-111/6D, 2025-regular-113/29C, 2024-invierno-111/27C
  - enteros-y-racionales: 2024-regular-113/9A, 2024-regular-113/9D, 2024-regular-113/2A, 2024-regular-113/2B, 2024-regular-113/2D, 2024-regular-113/6A, 2024-regular-113/6C, 2024-regular-113/6D, 2025-regular-113/4A, 2025-regular-113/4B, 2025-regular-113/4D, 2027-invierno-111/11A
  - funcion-lineal-y-afin: 2024-invierno-111/38A
  - cuerpos-geometricos: 2024-invierno-111/45D

### `transversal/corre-la-coma-o-mezcla-unidades` (propuesto)

Correr la coma al operar con decimales o al convertir porcentajes y unidades (mm por cm, 14,5 h como 14 h 50 min, litros por jeringas, husos horarios).

Ocurrencias: 8, en 3 unidad(es).
  - enteros-y-racionales: 2024-invierno-111/2A, 2024-invierno-111/2C, 2024-invierno-111/2D, 2026-regular-113/4A
  - transformaciones-isometricas: 2024-invierno-111/47A, 2024-invierno-111/47C, 2024-invierno-111/47D
  - proporcionalidad: 2025-regular-113/29A

### `transversal/omite-el-valor-de-partida` (propuesto)

Omitir el valor inicial en una cadena de sumas y restas, o tomar una variación como si partiera de cero (la carta inicial, los 12 °C de partida). Coincide en mecanismo con funcion-lineal-y-afin/olvida-valor-inicial; aparece fuera de esa unidad.

Ocurrencias: 2, en 1 unidad(es).
  - enteros-y-racionales: 2026-regular-113/1A, 2024-invierno-111/8C

## Lista A: candidatos que se quedan en su unidad (21)

Se proponen como texto para el catálogo de esa unidad, no para el transversal.

- **enteros-y-racionales** (1): Aplicar una fracción al total en vez de al resto que indica el enunciado ('3/5 de lo que faltaba'). Referencias: 2025-regular-113/7D.
- **potencias-y-raices** (7): Tratar un crecimiento por duplicación como aditivo, o contar una duplicación de más o de menos (2ⁿ frente a 2ⁿ⁻¹). Referencias: 2024-invierno-111/20A, 2024-invierno-111/20B, 2024-invierno-111/20D, 2024-invierno-111/10B, 2024-invierno-111/10C, 2027-invierno-111/23A, 2027-invierno-111/23C.
- **potencias-y-raices** (2): Leer 'disminuye a 2/5' como 'disminuye en 2/5' (queda 3/5), análogo al error-4 de porcentaje. Referencias: 2025-regular-113/23C, 2025-regular-113/23D.
- **porcentaje** (1): Componer dos descuentos multiplicando los porcentajes (0,2·0,3 = 6 % de descuento total). Referencias: 2024-invierno-111/15A.
- **porcentaje** (1): Aplicar un cambio porcentual una sola vez cuando el enunciado lo repite n periodos (interés simple). Referencias: 2027-invierno-111/10C.
- **porcentaje** (1): Calcular el porcentaje ignorando un término fijo del modelo (16/20 en vez de 42000/50000). Referencias: 2027-invierno-111/21C.
- **proporcionalidad** (7): Repartir proporcionalmente sobre el total equivocado o tomar la parte de la razón que no corresponde. Referencias: 2024-invierno-111/9A, 2024-invierno-111/9B, 2024-invierno-111/9D, 2024-invierno-111/29A, 2024-invierno-111/29C, 2024-invierno-111/29D, 2027-invierno-111/29B.
- **proporcionalidad** (1): Aplicar el modelo inverso a una relación directa (reverso del error-13): 90·15/25 en vez de 90·25/15. Referencias: 2024-invierno-111/28A.
- **proporcionalidad** (2): Escalar solo una parte (solo el incremento, o solo algunas filas de una compra) y no recomponer el total. Referencias: 2024-invierno-111/28B, 2026-regular-113/2C.
- **funcion-lineal-y-afin** (1): Despejar dividiendo por la tasa antes de quitar el valor inicial (equivale a ecuaciones-inecuaciones/error-3, pero en modelo afín). Referencias: 2024-invierno-111/31B.
- **funcion-lineal-y-afin** (1): Evaluar el modelo ignorando un término (los 15 minutos gratis en p·(t − 15)). Referencias: 2027-invierno-111/36B.
- **funcion-cuadratica** (1): Usar el eje Y como eje de simetría cuando el eje dado es x = k. Referencias: 2026-regular-113/42D.
- **figuras-geometricas** (3): Confundir radio con diámetro en perímetro o área del círculo. Referencias: 2024-invierno-111/42B, 2024-invierno-111/42D, 2025-regular-113/57D.
- **expresiones-algebraicas** (1): Invertir el signo de un factor al factorizar un trinomio ((x + 5)(x + 6) donde va (x + 5)(x − 6)). Referencias: 2025-regular-113/24C.
- **figuras-geometricas** (1): Calcular el área del círculo como π·r (omitir el cuadrado), distinto de error-9 que usa 2πr. Referencias: 2025-regular-113/58D.
- **figuras-geometricas** (1): Aplicar al radio la razón dada para el área (k en vez de √k), análogo a semejanza-proporcionalidad/error-5. Referencias: 2024-regular-113/46A.
- **cuerpos-geometricos** (3): Escalar el volumen por k o k² en vez de k³, o aplicar un aumento lineal a las tres dimensiones cuando solo cambia una. Referencias: 2024-invierno-111/44A, 2024-invierno-111/44B, 2027-invierno-111/43C.
- **cuerpos-geometricos** (1): Omitir π en el volumen del cilindro. Referencias: 2024-regular-113/47D.
- **cuerpos-geometricos** (5): Descontar un nivel o un grosor de la dimensión equivocada, o una sola vez cuando afecta a ambos lados. Referencias: 2025-regular-113/59B, 2025-regular-113/59C, 2025-regular-113/61A, 2025-regular-113/61B, 2025-regular-113/61C.
- **cuerpos-geometricos** (1): Tomar el área de una cara como si fuera la arista. Referencias: 2026-regular-113/48B.
- **transformaciones-isometricas** (2): No acumular rotaciones sucesivas al invertir una secuencia (deshacer solo una de dos). Referencias: 2024-invierno-111/48C, 2024-invierno-111/48D.

## Lista C: creencias sobre un paso o afirmación (83)

No son candidatos a id: el distractor es una alternativa conceptual, un paso correcto marcado como errado o una interpretación. Referencias exactas:

- enteros-y-racionales (18): 2024-invierno-111/4A, 2024-invierno-111/4C, 2024-invierno-111/4D, 2025-regular-113/3B, 2025-regular-113/3C, 2025-regular-113/3D, 2025-regular-113/6A, 2025-regular-113/6B, 2025-regular-113/6C, 2026-regular-113/5A, 2026-regular-113/5C, 2026-regular-113/5D, 2027-invierno-111/6A, 2027-invierno-111/6B, 2027-invierno-111/6D, 2027-invierno-111/9A, 2027-invierno-111/9C, 2027-invierno-111/9D
- potencias-y-raices (6): 2024-invierno-111/22A, 2024-invierno-111/22B, 2024-invierno-111/22C, 2027-invierno-111/24A, 2027-invierno-111/24B, 2027-invierno-111/24D
- sistemas-2x2 (6): 2024-invierno-111/34B, 2024-invierno-111/34C, 2024-invierno-111/34D, 2026-regular-113/35A, 2026-regular-113/35B, 2026-regular-113/35C
- funcion-lineal-y-afin (4): 2024-invierno-111/38B, 2024-invierno-111/38C, 2024-invierno-111/39A, 2024-invierno-111/39B
- transformaciones-isometricas (16): 2024-invierno-111/50C, 2024-invierno-111/50D, 2024-regular-113/50A, 2024-regular-113/50B, 2024-regular-113/50C, 2024-regular-113/52B, 2024-regular-113/52C, 2024-regular-113/52D, 2025-regular-113/65A, 2025-regular-113/65C, 2026-regular-113/50A, 2026-regular-113/50C, 2026-regular-113/50D, 2026-regular-113/51A, 2026-regular-113/51C, 2026-regular-113/51D
- porcentaje (4): 2024-regular-113/13A, 2024-regular-113/13B, 2024-regular-113/13D, 2025-regular-113/15B
- expresiones-algebraicas (6): 2024-regular-113/25A, 2024-regular-113/25C, 2024-regular-113/25D, 2026-regular-113/14A, 2026-regular-113/14B, 2026-regular-113/14C
- proporcionalidad (6): 2024-regular-113/29B, 2026-regular-113/30B, 2026-regular-113/30D, 2027-invierno-111/28A, 2027-invierno-111/28C, 2027-invierno-111/28D
- ecuaciones-e-inecuaciones-primer-grado (2): 2024-regular-113/32A, 2024-regular-113/32B
- funcion-cuadratica (9): 2024-regular-113/41A, 2024-regular-113/41B, 2024-regular-113/41D, 2024-regular-113/42A, 2024-regular-113/42C, 2024-regular-113/42D, 2025-regular-113/42A, 2025-regular-113/42C, 2025-regular-113/42D
- figuras-geometricas (6): 2027-invierno-111/40A, 2027-invierno-111/40C, 2027-invierno-111/40D, 2027-invierno-111/41A, 2027-invierno-111/41B, 2027-invierno-111/41D

## Lista D: sin mecanismo reconocible (175)

El razonamiento de cada uno está en `frecuencia-demre-v2.json`. Referencias:

- enteros-y-racionales (27): 2024-invierno-111/1A, 2024-invierno-111/7A, 2024-invierno-111/7C, 2024-invierno-111/7D, 2024-regular-113/1C, 2024-regular-113/3C, 2024-regular-113/3D, 2024-regular-113/5A, 2024-regular-113/8C, 2024-regular-113/8D, 2024-regular-113/9B, 2025-regular-113/2C, 2025-regular-113/2D, 2026-regular-113/1C, 2026-regular-113/1D, 2026-regular-113/4B, 2027-invierno-111/2A, 2027-invierno-111/2B, 2027-invierno-111/2D, 2027-invierno-111/3A, 2027-invierno-111/5B, 2027-invierno-111/5C, 2027-invierno-111/5D, 2027-invierno-111/8A, 2027-invierno-111/8D, 2027-invierno-111/11D, 2027-invierno-111/14B
- potencias-y-raices (21): 2024-invierno-111/3B, 2024-invierno-111/10D, 2024-invierno-111/17D, 2024-invierno-111/18D, 2024-invierno-111/19B, 2024-invierno-111/19C, 2024-invierno-111/36A, 2024-regular-113/17A, 2024-regular-113/18B, 2024-regular-113/18D, 2024-regular-113/20A, 2024-regular-113/20D, 2024-regular-113/21A, 2024-regular-113/23B, 2024-regular-113/23D, 2027-invierno-111/7B, 2027-invierno-111/7C, 2027-invierno-111/7D, 2027-invierno-111/22B, 2027-invierno-111/22C, 2027-invierno-111/22D
- ecuaciones-e-inecuaciones-primer-grado (12): 2024-invierno-111/5C, 2024-invierno-111/5D, 2024-invierno-111/30A, 2024-invierno-111/30B, 2024-invierno-111/30C, 2024-invierno-111/32A, 2024-regular-113/31D, 2025-regular-113/35A, 2025-regular-113/38A, 2025-regular-113/38D, 2026-regular-113/31A, 2026-regular-113/33D
- porcentaje (19): 2024-invierno-111/12C, 2024-invierno-111/12D, 2024-invierno-111/13A, 2024-invierno-111/14D, 2024-invierno-111/15D, 2024-regular-113/14B, 2024-regular-113/15A, 2024-regular-113/22A, 2024-regular-113/37A, 2024-regular-113/37B, 2024-regular-113/37D, 2027-invierno-111/10A, 2027-invierno-111/10B, 2027-invierno-111/13A, 2027-invierno-111/13B, 2027-invierno-111/13C, 2027-invierno-111/15B, 2027-invierno-111/15D, 2027-invierno-111/20D
- proporcionalidad (14): 2024-invierno-111/25B, 2024-invierno-111/27D, 2024-invierno-111/28C, 2024-regular-113/33C, 2024-regular-113/33D, 2025-regular-113/26D, 2025-regular-113/28B, 2026-regular-113/2B, 2026-regular-113/3A, 2026-regular-113/3C, 2027-invierno-111/27A, 2027-invierno-111/27B, 2027-invierno-111/29C, 2027-invierno-111/29D
- expresiones-algebraicas (12): 2024-invierno-111/26D, 2024-invierno-111/46B, 2024-regular-113/26B, 2024-regular-113/27A, 2024-regular-113/27B, 2025-regular-113/24A, 2025-regular-113/24B, 2025-regular-113/32A, 2025-regular-113/32D, 2026-regular-113/26C, 2026-regular-113/27C, 2026-regular-113/27D
- funcion-lineal-y-afin (9): 2024-invierno-111/35B, 2024-invierno-111/35D, 2024-regular-113/10C, 2024-regular-113/10D, 2024-regular-113/38C, 2024-regular-113/38D, 2024-regular-113/39A, 2024-regular-113/39D, 2027-invierno-111/35C
- funcion-cuadratica (12): 2024-invierno-111/37A, 2024-invierno-111/37C, 2024-invierno-111/37D, 2024-invierno-111/40C, 2024-regular-113/40A, 2024-regular-113/40C, 2026-regular-113/41D, 2026-regular-113/42A, 2026-regular-113/42C, 2027-invierno-111/34A, 2027-invierno-111/34D, 2027-invierno-111/39A
- figuras-geometricas (13): 2024-invierno-111/41B, 2024-invierno-111/42A, 2024-regular-113/43A, 2024-regular-113/43B, 2024-regular-113/44C, 2024-regular-113/44D, 2024-regular-113/45B, 2025-regular-113/57B, 2025-regular-113/57C, 2025-regular-113/58A, 2027-invierno-111/42A, 2027-invierno-111/42D, 2027-invierno-111/51B
- cuerpos-geometricos (11): 2024-invierno-111/44D, 2024-regular-113/47A, 2024-regular-113/48D, 2025-regular-113/60B, 2026-regular-113/48C, 2026-regular-113/48D, 2027-invierno-111/43A, 2027-invierno-111/43D, 2027-invierno-111/44C, 2027-invierno-111/45C, 2027-invierno-111/45D
- transformaciones-isometricas (13): 2024-invierno-111/51C, 2024-invierno-111/51D, 2024-regular-113/49A, 2024-regular-113/49D, 2024-regular-113/51A, 2024-regular-113/51D, 2025-regular-113/62C, 2025-regular-113/62D, 2025-regular-113/64A, 2025-regular-113/64B, 2025-regular-113/64D, 2025-regular-113/65B, 2026-regular-113/52D
- semejanza-y-proporcionalidad (5): 2024-invierno-111/53D, 2024-invierno-111/54C, 2024-invierno-111/54D, 2027-invierno-111/26B, 2027-invierno-111/26D
- sistemas-2x2 (7): 2024-regular-113/34B, 2024-regular-113/34C, 2024-regular-113/35B, 2024-regular-113/35C, 2027-invierno-111/33A, 2027-invierno-111/33B, 2027-invierno-111/33C
