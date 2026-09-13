# Diseño del módulo: Transformaciones isométricas

**Id de tema:** `transformaciones-isometricas`. Eje: Geometría (módulo #12 de `docs/mapa-modulos-m1.md`). **`moduloId` de los archivos de contenido:** `transformaciones-isometricas` (unidad del DAG, `content/diagnostico/dag-m1.json`), con catálogo canónico en `content/errores/transformaciones-isometricas.json`.

**Verificación de colisión: pendiente.** Esta sesión (2026-09-13) se produjo completa sin PARADA: los dominios se eligieron por exclusión contra todos los `contextosNumericos` de `content/` y contra los descartados de los `docs/diseno-modulo-*.md` anteriores, y las palabras clave quedan listadas al final para que Benja corra `scripts/consultar-fuentes.mjs` fuera de sesión. Un dominio que dé SI se reemplaza entero (nunca se ajusta).

Descriptores del temario (`docs/temario-demre-m1-2027.md:101-105`), citados textual:

```
- Puntos y vectores en el plano cartesiano.
- Rotación, traslación y reflexión de figuras geométricas.
- Problemas que involucren rotación, traslación y reflexión en diversos contextos.
```

---

## Objetivo del módulo

Que el estudiante distinga un punto (una posición) de un vector (un desplazamiento), opere vectores por componentes, y aplique y reconozca las tres isometrías del plano (traslación, rotación en múltiplos de 90° y reflexión) sobre puntos y figuras, sabiendo qué se conserva (distancias, ángulos, área) y qué cambia (posición; orientación en la reflexión).

Lo que el módulo aporta de nuevo al eje: en figuras y cuerpos se medía; acá se mueve sin medir de nuevo. Que la figura movida siga midiendo lo mismo es la idea que le da nombre al módulo.

## Prerrequisitos reales, ya cubiertos

- `lineal-pendiente-e-intercepto` (módulo #8): coordenadas en el plano cartesiano y lectura de puntos.
- `figuras-triangulo-no-se-rompe` (módulo #10, L1): teorema de Pitágoras y tríos pitagóricos. La distancia entre dos puntos es Pitágoras sobre las componentes del vector, y este módulo lo usa como cálculo interno, sin reenseñarlo.
- `enteros-operar-y-ordenar` (módulo #1): operatoria con enteros negativos, que es todo lo que las reglas de coordenadas exigen.

---

## Convenciones del módulo

- Rotaciones en torno al origen salvo que el enunciado diga otra cosa; el **sentido siempre explícito** en el enunciado (nunca "gira 90°" a secas); ángulos solo 90, 180 y 270.
- Coordenadas enteras en [−10, 10], también las de toda imagen (lo exige `motivoRechazoDatosTransformacion`, en el validador y en el type guard).
- Polígonos de 3 a 5 vértices; original e imagen se nombran A → A'.
- Regla de vector entre puntos: **llegada menos partida**, B − A. Se escribe así en todos los pasos.
- Visual: solo cuando la figura ES el estímulo. Nunca se dibuja la imagen en un bloque cuyo campo o alternativa pide justamente las coordenadas de esa imagen (`mostrarImagen: false`).

---

## Objetivos por lección y progresión conceptual

**1. L1 `isometrias-mover-sin-deformar`, Puntos y vectores en el plano cartesiano.**

*Objetivo:* que el estudiante distinga punto de vector, calcule el vector entre dos puntos como llegada menos partida, opere vectores por componentes (suma, resta, ponderación por escalar) y calcule la distancia entre dos puntos con Pitágoras sobre las componentes.

*Concepto clave:* un vector es un desplazamiento, no un lugar. Se describe por cuánto se mueve en x y cuánto en y.

*Descubrimiento:* el mismo desplazamiento desde tres orígenes distintos da el mismo vector. Se construye tabulando (partida, llegada, llegada − partida) sobre tres puntos y viendo que la tercera columna se repite. Recién después se escribe v = B − A.

*Contraste P2 (paso `consolidacion`):* "Mucha gente resta partida menos llegada (A − B) y le queda el vector apuntando al revés. Falla porque un vector dice hacia dónde se va, y el signo es la dirección. Lo que funciona es llegada menos partida." Además se nombra la confusión punto/vector (dar la coordenada de B como si fuera el desplazamiento) y la suma cruzada de componentes. Un bloque `pregunta` en el mismo paso ejercita los tres, con `errorCatalogado` en cada distractor.

*Visual:* `{ tipo: "transformacion" }` con `trazo: "puntos"` (tres puntos, tres flechas iguales) en `descubrimiento`; una traslación de un punto con flecha en `curiosidad`.

*Pregunta abierta con que cierra, que resuelve L2:* si un vector mueve un punto, ¿qué pasa cuando se mueve una figura entera? ¿Y si en vez de moverla se la gira o se la voltea?

**2. L2 `isometrias-girar-reflejar-trasladar`, Rotación, traslación y reflexión de figuras.**

*Objetivo:* que el estudiante aplique a un punto y a una figura una traslación por vector, una reflexión respecto del eje x, del eje y o del origen, y una rotación en torno al origen de 90° (en los dos sentidos), 180° y 270°, y diga qué se conserva y qué cambia.

*Concepto clave:* una isometría mueve sin deformar. Las tres reglas de coordenadas se descubren tabulando ejemplos, nunca se entregan primero.

*Descubrimiento:* la regla de la rotación de 90° antihorario se construye con una tabla de puntos y sus imágenes, mirando el dibujo: (1, 0) → (0, 1), (0, 1) → (−1, 0), (2, 1) → (−1, 2), (3, −2) → (2, 3). El estudiante escribe (x, y) → (−y, x) él mismo. Las reflexiones se tabulan en `pistas` y `generalizacion` con el mismo método.

*Contraste P2 (paso `consolidacion`):* "Mucha gente refleja respecto del eje x cambiándole el signo a la x. Falla porque reflejar en el eje x es mirar hacia abajo: lo que cambia es la altura, la y. Lo que funciona es preguntarse qué coordenada mide la distancia al eje." Se nombran además el sentido horario contra antihorario (error-8) y la confusión origen/eje (error-9), con un `pregunta` cuyos distractores llevan esos ids.

*Visual:* rotación con centro y arco (`descubrimiento`), reflexión con eje discontinuo (`pistas`, `practica`), traslación de figura completa con flecha (`curiosidad`). En los bloques que piden la imagen, `mostrarImagen: false`.

*Pregunta abierta con que cierra, que resuelve L3:* hasta acá siempre se supo qué transformación aplicar. ¿Y si solo se ve la figura y su imagen? ¿Y si son dos transformaciones seguidas?

**3. L3 `isometrias-figura-y-su-imagen`, Problemas con transformaciones isométricas.**

*Objetivo:* que el estudiante componga dos transformaciones respetando el orden, identifique cuál transformación lleva una figura a su imagen, y halle el vector de traslación o el eje de reflexión a partir de un par figura e imagen, en contextos de diseño.

*Concepto clave:* el orden de una composición importa, y para identificar una transformación hay que mirar la orientación, no solo la posición.

*Descubrimiento:* la misma figura, con "trasladar por (−4, 0) y luego reflejar respecto del eje x" y con el orden contrario, tabulada vértice a vértice: los resultados difieren. Se construye con la visual `mostrarIntermedias: true`.

*Contraste P2 (paso `consolidacion`):* "Mucha gente aplica primero la segunda transformación, porque 'da lo mismo'. Falla porque la reflexión cambia de lado lo que la traslación ya movió, y la traslación mueve lo que la reflexión ya volteó: los dos caminos terminan en lugares distintos. Lo que funciona es aplicar exactamente en el orden dicho, y comprobar con un vértice." Se nombra además el error de identificar por posición (error-12) y el de emparejar A con B' (error-13).

*Visual:* composición con intermedias (`descubrimiento`), par figura e imagen para identificar (`pensar`, `practica`), par para hallar el eje (`generalizacion`).

**Un descubrimiento por lección:** L1 fija "el vector es llegada menos partida y no depende del origen"; L2 fija "la regla de cada isometría se lee en la tabla de coordenadas"; L3 fija "el orden de la composición importa". El cierre integra los tres.

---

## Catálogo de errores (definitivo, `content/errores/transformaciones-isometricas.json`)

Los ids nacen acá y se copian tal cual al catálogo canónico. Cada uno produce un resultado reproducible sobre un caso base, verificable con `node -e` antes de escribir cualquier distractor (SKILL.md §2a). Caso base de L1: A = (−3, −2), B = (2, 1), v = (3, 4). Caso base de L2: P = (3, 1). Caso base de L3: figura (1, 2) con traslación (2, 3) y reflexión eje y.

| id | Nace en | Mecanismo | Produce sobre el caso base |
|---|---|---|---|
| `error-1` | L1 | Confundir punto con vector: dar las coordenadas de un punto donde se pide un desplazamiento, o usar el punto de llegada como si fuera el desplazamiento. | Vector de A a B "= (2, 1)"; distancia "= √(2² + 1²)". |
| `error-2` | L1 | Vector de A a B calculado como A − B en vez de B − A. | (−5, −3) en vez de (5, 3). |
| `error-3` | L1 | Sumar o restar componentes cruzadas (x con y). | A + v = (−3 + 4, −2 + 3) = (1, 1) en vez de (0, 2). |
| `error-4` | L1 | Distancia como \|Δx\| + \|Δy\| en vez de √(Δx² + Δy²). | Para Δ = (3, 4): 7 en vez de 5. |
| `error-5` | L1 | Ponderar por un escalar multiplicando una sola componente. | 2 · (−3, 4) = (−6, 4) en vez de (−6, 8). |
| `error-6` | L1 | Trasladar restando el vector (sentido contrario). | A − v = (−6, −6) en vez de (0, 2). |
| `error-7` | L2 | Reflejar respecto de un eje cambiando el signo de la coordenada equivocada. | Reflejar (3, 1) en el eje x: (−3, 1) en vez de (3, −1). |
| `error-8` | L2 | Rotar 90° en el sentido contrario al pedido. | 90° antihorario de (3, 1): (1, −3) en vez de (−1, 3). |
| `error-9` | L2 | Confundir reflexión respecto del origen con reflexión respecto de un eje (una coordenada cambiada en vez de dos, o al revés). | Origen de (3, 1): (3, −1) en vez de (−3, −1). |
| `error-10` | L2 | Creer que la isometría cambia longitudes, perímetro o área. | "La imagen tiene el doble de área" (conceptual, en ítems de argumentar). |
| `error-11` | L3 | Componer en el orden contrario. | Reflejar y luego trasladar (1, 2): (1, 5) en vez de trasladar y luego reflejar: (−3, 5). |
| `error-12` | L2 | Identificar o ejecutar mirando solo la posición y no la orientación: llamar traslación a una reflexión; reflejar sin voltear. | "F' es una traslación de F" cuando es una reflexión. |
| `error-13` | L3 | Hallar el vector emparejando A con B' en vez de A con A'. | A(−3, 2), A'(1, −1), B'(4, 1): (7, −1) en vez de (4, −3). |
| `error-14` | L3 | Ubicar el eje de reflexión sobre la figura, sobre la imagen o a la distancia entre ambas, en vez de en el punto medio. | P(1, 3), P'(7, 3): x = 1, x = 7 o x = 6, en vez de x = 4. |
| `error-15` | L1 | Olvidar la raíz cuadrada en la distancia: entregar Δx² + Δy². | Para Δ = (3, 4): 25 en vez de 5. |
| `error-16` | L2 | Aplicar la regla de otra transformación: intercambiar donde solo cambia un signo, o cambiar signos sin intercambiar. | 90° antihorario de (3, 1): (−3, 1) o (−3, −1) en vez de (−1, 3). |

`error-12` nace en L2 (paso `problema`, opción "trasladó al otro lado sin voltear") y se reutiliza en L3 para identificar transformaciones: es el mismo mecanismo, ignorar la orientación.

**Errores sin id.** Los conceptuales que no producen un resultado reproducible van con feedback artesanal y sin `errorCatalogado`, solo en bloques `seleccion` (nunca en `itemsPAES` ni en `items` del cierre, donde los tres distractores llevan id).

---

## Plan de ítems

### L1, `isometrias-mover-sin-deformar`

Dominio: recorridos a pie por el centro de una ciudad de calles en cuadrícula. Cada cuadra es una unidad; el punto de referencia es el cruce de dos avenidas (el origen). Lugares: hostal, museo, estación, biblioteca. Números reservados: hostal (2, 1), museo (5, 5), vector (3, 4), estación (−3, −2), biblioteca (0, 2); tríos usados 3-4-5, 5-12-13, 8-15-17.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `isometrias-l1-item-1` | resolver | baja | vector de (−4, 3) a (2, −5) | (6, −8) | (−6, 8) `error-2`; (2, −5) `error-1`; (−1, −1) `error-3` |
| `isometrias-l1-item-2` | representar | media | distancia entre P(−2, −7) y Q(6, 8), con los puntos dibujados | 17 | 10 `error-1`; 23 `error-4`; 289 `error-15` |
| `isometrias-l1-item-3` | argumentar | alta | veredicto sobre "el vector de A(4, −2) a B(−1, 3) es (5, −5)" | No: B − A = (−5, 5) | Sí `error-2`; No, es (−1, 3) `error-1`; No, es (1, −1) `error-3` |

### L2, `isometrias-girar-reflejar-trasladar`

Dominio: patrón de bordado en punto cruz sobre una tela cuadriculada; el motivo se copia trasladado, volteado o girado. Números reservados: motivo A(1, 1), B(4, 1), C(1, 3); punto (3, 1); tabla (1, 0), (0, 1), (2, 1), (3, −2).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `isometrias-l2-item-1` | resolver | baja | reflejar (−6, 2) respecto del eje x | (−6, −2) | (6, 2) `error-7`; (6, −2) `error-9`; (2, −6) `error-16` |
| `isometrias-l2-item-2` | representar | media | imagen de A(1, 2), B(4, 2), C(1, 5) tras 90° antihorario, figura dibujada sin imagen | A'(−2, 1), B'(−2, 4), C'(−5, 1) | horario `error-8`; (−1, 2)… `error-16`; (−1, −2)… `error-16` |
| `isometrias-l2-item-3` | argumentar | alta | qué se conserva al reflejar un cuadrilátero respecto del eje y | misma área y perímetro, orientación invertida | área distinta `error-10`; perímetro distinto `error-10`; "es lo mismo que trasladar" `error-12` |

### L3, `isometrias-figura-y-su-imagen`

Dominios: (núcleo) estampado de un logo escolar armado a partir de un motivo que se traslada y refleja; (aplicación) nave de un videojuego 2D en una pantalla de píxeles que se gira y se mueve. Números reservados: punto (1, 2) con traslación (2, 3) y reflexión eje y; par A(−3, 2) → A'(1, −1), B(0, 4) → B'(4, 1); eje entre P(1, 3) y P'(7, 3).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `isometrias-l3-item-1` | resolver | baja | (−1, 4) reflejado en el eje x y luego trasladado por (3, 2) | (2, −2) | (2, −6) `error-11`; (4, 6) `error-7`; (−4, −6) `error-6` |
| `isometrias-l3-item-2` | modelar | media | qué transformación lleva F(1,1),(4,1),(4,3),(1,2) a F'(−1,1),(−4,1),(−4,3),(−1,2), ambas dibujadas | reflexión respecto del eje y | traslación `error-12`; reflexión eje x `error-7`; rotación 180° `error-9` |
| `isometrias-l3-item-3` | argumentar | alta | veredicto sobre "trasladar por (2, 0) y luego reflejar en el eje y da lo mismo que al revés" | No, con un vértice de prueba | Sí, conmutan `error-11`; Sí, la reflexión no mueve `error-12`; No, porque reflejar cambia el tamaño `error-10` |

### Cierre, `cierre-transformaciones-isometricas` (8 ítems)

| ítem | habilidad | dificultad | cubre | correcta | distractores (id) |
|---|---|---|---|---|---|
| `cierre-isometrias-1` | resolver | baja | operaciones con vectores: u + 2v, u = (−3, 5), v = (4, −2) | (5, 1) | (5, 3) `error-5`; (−7, 13) `error-3`; (−11, 9) `error-6` |
| `cierre-isometrias-2` | resolver | baja | rotación 90° horario de (−4, 3) | (3, 4) | (−3, −4) `error-8`; (4, 3) `error-16`; (4, −3) `error-16` |
| `cierre-isometrias-3` | representar | media | reflexión eje x de (2,2),(6,2),(2,5), figura dibujada sin imagen | (2,−2),(6,−2),(2,−5) | (−2,2)… `error-7`; (−2,−2)… `error-9`; (2,−2),(2,−6),(5,−2) `error-16` |
| `cierre-isometrias-4` | modelar | media | vector de traslación con A(−6, 1) → A'(−2, −5), B(−3, 3) → B'(1, −3) | (4, −6) | (−4, 6) `error-2`; (−2, −5) `error-1`; (7, −4) `error-13` |
| `cierre-isometrias-5` | representar | media | identificar: F(1,1),(3,1),(3,4) → F'(−1,−1),(−3,−1),(−3,−4), ambas dibujadas | rotación de 180° | traslación `error-12`; reflexión eje y `error-9`; rotación 90° antihorario `error-16` |
| `cierre-isometrias-6` | argumentar | media | eje de reflexión entre P(−5, 2) y P'(3, 2) | x = −1 | x = −5 `error-14`; x = 3 `error-14`; x = 4 `error-14` |
| `cierre-isometrias-7` | argumentar | alta | conservación bajo rotación de 90° | lados, ángulos y área iguales | lados cambian `error-10`; área cambia `error-10`; "es una traslación" `error-12` |
| `cierre-isometrias-8` | modelar | alta | contexto (nave): (−3, 4) rotado 90° horario y luego trasladado por (2, 5) | (6, 8) | (9, 1) `error-11`; (−2, 2) `error-8`; (2, −2) `error-6` |

Matriz habilidad × dificultad del cierre: resolver baja ×2 (1, 2); representar media ×2 (3, 5); modelar media (4), alta (8); argumentar media (6), alta (7). Total: 2 baja, 4 media, 2 alta; las cuatro habilidades, dos veces cada una. Cobertura por lección: L1 en 1 y 4; L2 en 2, 3, 5 y 7; L3 en 6 y 8.

---

## Lista de prohibidos

- Mecanismos DEMRE liberados que no se replican con sus números: placas cuyo lado se triplica; combinación u − 2w + v; rotar un segmento PQ 90° con esos puntos. Ninguna combinación de este módulo usa tres vectores con coeficiente −2, y ninguna rotación es de un segmento nombrado PQ.
- Dominios ya usados en el corpus (ver `contextosNumericos` de `content/`): entre ellos dron, robótica (torneo), baldosas/losetas/cerámica, plaza, caja de cartón, cancha, patio, mapa de senderismo queda para el módulo 13.
- Dominios sugeridos y descartados: teselado de azulejos (colinda con baldosas/losetas de proporcionalidad y potencias); brazo de robot (colinda con el torneo de robótica de inecuaciones).
- Ángulos distintos de 90, 180 y 270; centros de rotación no enteros; coordenadas fuera de [−10, 10].
- Dibujar la imagen en un bloque cuyo campo o alternativa pide esa imagen.

## Palabras clave para `consultar-fuentes.mjs` (las corre Benja)

```
node scripts/consultar-fuentes.mjs "ciudad en cuadricula" "cuadricula" "cuadras" "hostal" "museo" "estacion de trenes" "biblioteca" "avenida" "bordado" "punto cruz" "tela" "hilo" "aguja" "motivo" "logo" "estampado" "escudo" "videojuego" "nave" "pantalla" "pixel" "sprite"
```

## Estado de las firmas

Firmado por adelantado por Benja (brief de la sesión 2026-09-13): JSON de contenido, extensiones aditivas de schema y commits. Pendiente de Benja: la consulta de colisión con las palabras clave de arriba y las dos auditorías en hilos aislados (`/clear`) antes de cualquier `git push`.
