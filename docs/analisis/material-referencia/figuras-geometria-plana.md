# Figuras de geometría plana: inventario y convenciones de la unidad

Fecha: 2026-09-23. Insumo de la infraestructura de figuras de la Unidad 14 de Advance (`figuras-geometricas`): qué figuras de geometría plana traen los problemas de Pitágoras, perímetro y área de triángulos, paralelogramos, trapecios y círculos, regiones sombreadas y figuras compuestas; con qué rasgos; cómo tratan π, las unidades, las raíces y el redondeo; y qué procedimiento errado produce cada distractor DEMRE de la unidad.

Método:

- **DEMRE.** Las 15 preguntas de la unidad salen de `docs/analisis/frecuencia-demre-v2.json` (`unidadId` = `figuras-geometricas`). Se suman 11 preguntas de otras unidades cuya figura es de geometría plana y no lleva ejes: 7 de `transformaciones-isometricas`, 2 de `cuerpos-geometricos`, 1 de `semejanza-y-proporcionalidad` y 1 de `enteros-y-racionales`. La página de cada pregunta se ubicó con el `.md` de su forma y se rasterizó con pypdfium2, la herramienta de la Fase A. La escala se midió sobre el ráster con una grilla de 50 px y, en las figuras vectoriales, con las coordenadas de los trazos del PDF. 2027 invierno no tiene PDF: sus filas se leyeron en el `.md` y los rasgos que el texto no afirma quedan como no verificables (¿?).
- **Revisadas y fuera de la tabla.** Con plano cartesiano, que ya cubren `plano-isometrias` y `plano-funcion`: 2024 regular n.º 50 y 53; 2026 regular n.º 50, 51 y 52; 2027 invierno n.º 46 y 48. Solo cuerpo 3D, fotografía o ilustración, sin figura plana: 2024 invierno n.º 45 y 50; 2024 regular n.º 47 y 48; 2025 regular n.º 60, 63 y 64; 2027 invierno n.º 26, 43, 45 y 50. Sin figura: 2024 invierno n.º 44, 47, 49, 52, 53 y 54; 2024 regular n.º 49, 51 y 52; 2025 regular n.º 59; 2026 regular n.º 48. Las figuras de las demás unidades son tablas o gráficos de datos.
- **Material UC.** La carpeta "profesora" es una sola a tres niveles del escritorio: `C:\Users\bguti\Desktop\fuentes-analisis-aisladas\Material\profesora`. Dos subagentes de sala limpia (A: ángulos y Pitágoras; B: áreas, perímetros, círculo y repaso) ubicaron las páginas con los `.md` del material, `por-unidad.md` y `ap2.json`, rasterizaron solo esas páginas con pypdfium2 fuera del repo, midieron la escala con la misma grilla, devolvieron únicamente formas, rasgos, tipos de lectura, conteos y página, y borraron los rásteres al terminar. El tema está en Ap2 cap. 32 (pp. 145-156), cap. 33 (pp. 157-169), Reforzamiento 5 (pp. 217-219) y cap. 38 problema 8 (p. 226), con soluciones en S-Ap2 (pp. 110-131, 169-171 y 179-180). AP1 no tiene capítulo de geometría, pero trae 16 problemas de área o perímetro dentro de capítulos de números y álgebra. En Ap2 y S-Ap2 la página impresa coincide con la del PDF; en SAP1 se anota la impresa, que es la del PDF menos 2. Tres problemas los revisaron los dos subagentes y se cuentan una vez (Reforzamiento 5 ej. 1, AP1 9.B ej. 9 y 17.B ej. 6).
- **Sala limpia.** De UC se toman solo formas, rasgos, tipos de lectura y página. Ningún dato, cifra, contexto ni texto de UC entra al repo, a la galería ni a los tests; todo caso de prueba usa datos inventados.
- **Escala, el mismo criterio en DEMRE y UC.** Por cada segmento rotulado, la razón longitud dibujada / longitud rotulada. "Sí" si todas quedan a ±5 % de su mediana; "dudoso" si la peor queda entre 5 % y 15 %; "no" si alguna se aleja más de 15 %. Un ángulo rotulado cuenta "sí" hasta 5° de diferencia y "no" sobre 10°. Con un solo rótulo de longitud la figura es "no verificable"; sin rótulos de longitud, "sin longitudes".
- **Conteos.** Puntos: vértices y puntos marcados. Segmentos: trazos rectos entre dos puntos; un lado partido por un punto cuenta como dos. Rótulos: todo texto dentro de la figura. En UC los conteos de rasgos son por problema (un rasgo cuenta una vez aunque aparezca en varias figuras del mismo problema) y se separan en enunciado o alternativas y solución. El subagente B anotó las cotas con llave y las cotas con flechas con la misma etiqueta.

## Inventario, una fila por problema

Columnas: fuente, unidad (solo DEMRE), tipo de figura, ubicación, rótulos, marcas, auxiliares punteados, sombreado y su operación (unión, resta o intersección de formas), cuadrícula, nota "no está a escala", si está dibujada a escala (medido), cantidad de puntos, segmentos y rótulos, y otros rasgos. En UC, cuando las figuras de un problema difieren, la celda va por ubicación: E enunciado, A alternativas, S solución.

### DEMRE

| fuente | unidad | tipo | ubicación | rótulos | marcas | punteados | sombreado | cuadrícula | nota «no está a escala» | a escala (medido) | puntos / segmentos / rótulos | otros rasgos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2024 invierno, forma 111, n.º 41 (PDF p. 33) | figuras-geometricas | esquema de contexto (poste o sombra: árbol, suelo y visual) | enunciado | longitud numérica | ángulo recto | no | no | no | no | no verificable: un solo rótulo de longitud | 3 / 4 / 1 | suelo achurado, cota con llave, objeto ilustrado |
| 2024 invierno, forma 111, n.º 42 (PDF p. 34) | figuras-geometricas | sin figura | — | — | — | — | — | — | — | — | — | — |
| 2024 invierno, forma 111, n.º 43 (PDF p. 35) | figuras-geometricas | región sombreada compuesta (cuadrado menos cuatro triángulos en las esquinas) | enunciado | — | — | no | resta | no | no | sin longitudes | 12 / 16 / 0 | — |
| 2024 regular, forma 113, n.º 36 (PDF p. 28) | figuras-geometricas | otra (tres segmentos sueltos) | enunciado | longitud algebraica | — | no | no | no | no | no verificable: rótulos algebraicos | 6 / 3 / 3 | — |
| 2024 regular, forma 113, n.º 43 (PDF p. 34) | figuras-geometricas | esquema de contexto (dos letras hechas de barras) | enunciado | longitud numérica | ángulo recto | sí (cotas punteadas) | no | no | no | dudoso: peor desvío 7 % | 9 / 8 / 4 | objeto ilustrado |
| 2024 regular, forma 113, n.º 44 (PDF p. 35) | figuras-geometricas | esquema de contexto (silla con el ángulo del respaldo) | enunciado | nombres de vértices | — | no | no | no | no | sin longitudes (los grados van en el enunciado, no en la figura) | 3 / 2 / 3 | objeto ilustrado |
| 2024 regular, forma 113, n.º 45 (PDF p. 36) | figuras-geometricas | otra (cuerpo 3D: tres cubos con una diagonal) | enunciado | — | — | no | no | no | no | sin longitudes | — | cuerpo 3D |
| 2024 regular, forma 113, n.º 46 (PDF p. 37) | figuras-geometricas | sin figura | — | — | — | — | — | — | — | — | — | — |
| 2025 regular, forma 113, n.º 57 (PDF p. 32) | figuras-geometricas | otra (cuerpo 3D ilustrado con un texto señalado) | enunciado | texto libre | — | no | no | no | no | sin longitudes | — | cuerpo 3D, flecha, texto libre |
| 2025 regular, forma 113, n.º 58 (PDF p. 33) | figuras-geometricas | sin figura | — | — | — | — | — | — | — | — | — | — |
| 2026 regular, forma 113, n.º 45 (PDF p. 23) | figuras-geometricas | cuadrilátero (trapecio rectángulo sin marca de ángulo recto) | enunciado | longitud numérica | — | no | no | no | no | sí: las bases a 0,4 % entre sí; la altura, sin rótulo, a 1,3 % de la que da el área | 4 / 4 / 2 | — |
| 2027 invierno, forma 111, n.º 40 (.md l. 725-742) | figuras-geometricas | esquema de contexto (rectángulo con su diagonal, según el texto) | enunciado | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? / ¿? / ¿? | — |
| 2027 invierno, forma 111, n.º 41 (.md l. 744-772) | figuras-geometricas | esquema de contexto (poste y dos cuerdas, según el texto) | enunciado | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? / ¿? / ¿? | — |
| 2027 invierno, forma 111, n.º 42 (.md l. 774-782) | figuras-geometricas | sin figura | — | — | — | — | — | — | — | — | — | — |
| 2027 invierno, forma 111, n.º 51 (.md l. 912-921) | figuras-geometricas | cuadrilátero (según el texto, con medidas en centímetros) | enunciado | longitud numérica (según el texto) | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? / ¿? / ¿? | — |
| 2024 invierno, forma 111, n.º 48 (PDF p. 39) | transformaciones-isometricas | otra (figura con un borde curvo, dos veces, dentro de un recuadro) | enunciado | texto libre | — | no | simple (sólido) | no | no | sin longitudes | 12 / 10 / 6 | arco, texto libre, objeto ilustrado |
| 2024 invierno, forma 111, n.º 51 (PDF p. 42) | transformaciones-isometricas | figura en cuadrícula (dos tableros con una ficha) | enunciado | texto libre | — | no | no | sí | no | sin longitudes | 2 / 8 / 8 | punto marcado, flecha, texto libre, objeto ilustrado |
| 2024 invierno, forma 111, n.º 55 (PDF p. 45) | semejanza-y-proporcionalidad | otra (triángulos en posición de Thales, con perspectiva punteada) | enunciado | longitud numérica, longitud algebraica | — | sí (perspectiva) | no | no | no | no: la base mide 24 % más que la mediana de los tramos | 16 / 21 / 5 | — |
| 2024 regular, forma 113, n.º 6 (PDF p. 6) | enteros-y-racionales | circunferencia o círculo (tres circunferencias concéntricas) | enunciado | texto libre | — | no | resta (anillos), dos estilos | no | no | sin longitudes | 0 / 0 / 3 | texto libre |
| 2025 regular, forma 113, n.º 61 (PDF p. 36) | cuerpos-geometricos | región sombreada compuesta (rectángulo menos rectángulo, junto a un cuerpo 3D) | enunciado | longitud numérica | — | no | resta | no | no | no: ancho y alto a 1 % entre sí, el grosor dibujado mide 44 % menos | 8 / 8 / 3 | cota con llave, flecha, cuerpo 3D |
| 2025 regular, forma 113, n.º 62 (PDF p. 37) | transformaciones-isometricas | figura en cuadrícula (figura de cuatro cuadros y su contorno en otra posición) | enunciado | texto libre | — | sí (contorno punteado) | simple (sólido) | sí | no | sin longitudes | 12 / 12 / 3 | cota con llave, texto libre |
| 2025 regular, forma 113, n.º 65 (PDF p. 40) | transformaciones-isometricas | otra (rectas que se cortan y puntos simétricos, sin ejes) | enunciado | nombres de vértices | — | sí (perpendiculares) | no | no | no | sin longitudes (los grados van en el enunciado) | 5 / 5 / 5 | — |
| 2026 regular, forma 113, n.º 47 (PDF p. 24) | cuerpos-geometricos | otra (red de un cubo, junto a cuerpos 3D) | enunciado | longitud numérica | — | no | no | no | no | no verificable: un solo rótulo en la red (los seis cuadrados miden igual) | 14 / 19 / 1 | cota con llave, flecha, cuerpo 3D |
| 2026 regular, forma 113, n.º 49 (PDF p. 26) | transformaciones-isometricas | otra (polígonos de un plegado en tres pasos; cuatro polígonos en las alternativas) | enunciado y alternativas | texto libre | — | sí (línea de pliegue) | simple (sólido) | no | no | sin longitudes | 24 / 24 / 4 (cada alternativa: 8 / 7 / 0) | flecha, texto libre, objeto ilustrado, alternativas con figura |
| 2027 invierno, forma 111, n.º 47 (.md l. 866-874) | transformaciones-isometricas | otra (hoja doblada con perforación triangular, según el texto) | enunciado y alternativas | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? / ¿? / ¿? | alternativas con figura |
| 2027 invierno, forma 111, n.º 49 (.md l. 889-900) | transformaciones-isometricas | otra (asientos con eje de simetría segmentado, según el texto) | enunciado y alternativas | ¿? | ¿? | sí (según el texto) | ¿? | ¿? | ¿? | ¿? | ¿? / ¿? / ¿? | alternativas con figura |

### Material UC

| fuente | tipo | ubicación | rótulos | marcas | punteados | sombreado | cuadrícula | nota «no está a escala» | a escala (medido) | puntos / segmentos / rótulos | otros rasgos |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ap2 p. 145, 32.A ejemplo 1 (sol. S-Ap2 p. 110) | otra (otra forma) | enunciado + solución | E: vértices · S: grados, vértices, letras de ángulo | E: — · S: arco de ángulo | sí (otro) | no | no | no | E: sin longitudes · S: dudoso | E: 5 / 12 / 5 · S: 5 / 12 / 9 | — |
| Ap2 p. 146, 32.A ejemplo 2 (sol. S-Ap2 p. 110) | E: esquema de contexto (objeto ilustrado) · S: triángulo rectángulo | enunciado + solución | longitud numérica, texto en región | ángulo recto | no | no | no | no | no | E: 6 / 9 / 3 · S: 3 / 3 / 3 | E: cota, suelo achurado · S: — |
| Ap2 p. 146, 32.A ejemplo 3 (sol. S-Ap2 p. 111) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 147, 32.A ejemplo 4 (sol. S-Ap2 p. 111) | A: otro triángulo · A: cuadrilátero · A: cuadrilátero · A: cuadrilátero | alternativas (4 alternativas) | longitud numérica, vértices | A: ángulo recto · A: — · A: — · A: — | no | no | no | no | no verificable | 4 / 5 / 5 | — |
| Ap2 p. 148, 32.A ejemplo 5 (sol. S-Ap2 p. 112) | esquema de contexto (escalera apoyada) | enunciado | longitud numérica | ángulo recto | sí (otro) | no | no | no | sí | 5 / 6 / 2 | cota, suelo achurado |
| Ap2 p. 149, 32.B ej. 1 (sol. S-Ap2 p. 113) | otro triángulo | enunciado + solución | grados, vértices, letras de ángulo | arco de ángulo | no | no | no | no | no | E: 4 / 5 / 7 · S: 4 / 5 / 9 | — |
| Ap2 p. 149, 32.B ej. 2 (sol. S-Ap2 p. 113) | otro triángulo | enunciado + solución | E: vértices, letras de ángulo · S: grados, vértices, letras de ángulo | ángulo recto, arco de ángulo | no | no | no | no | E: sin longitudes · S: dudoso | E: 5 / 7 / 7 · S: 5 / 7 / 10 | — |
| Ap2 p. 150, 32.B ej. 3 (sol. S-Ap2 p. 114) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 150, 32.B ej. 4 (sol. S-Ap2 p. 114) | otro triángulo | solución | vértices | arco de ángulo | no | no | no | no | sin longitudes | 3 / 3 / 3 | — |
| Ap2 p. 150, 32.B ej. 5 (sol. S-Ap2 p. 115) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 150, 32.B ej. 6 (sol. S-Ap2 p. 115) | triángulo rectángulo | solución | longitud numérica, longitud algebraica | ángulo recto | no | no | no | no | no verificable | 3 / 3 / 3 | — |
| Ap2 p. 151, 32.B ej. 7 (sol. S-Ap2 p. 116) | otro triángulo | enunciado | longitud numérica, longitud algebraica | ángulo recto | sí (altura) | no | no | no | no verificable | 4 / 5 / 3 | — |
| Ap2 p. 152, 32.B ej. 8 (sol. S-Ap2 p. 117) | otro triángulo | enunciado + solución | E: longitud numérica · S: longitud numérica, longitud algebraica | ángulo recto | no | no | no | no | E: dudoso · S: no | E: 4 / 5 / 2 · S: 4 / 5 / 6 | cota |
| Ap2 p. 152, 32.B ej. 9 (sol. S-Ap2 p. 117) | otro triángulo | enunciado + solución | longitud numérica, vértices | E: — · S: ángulo recto | E: sí (otro) · S: no | E: simple, rayado · S: no | no | no | no | E: 3 / 4 / 6 · S: 4 / 5 / 9 | cota |
| Ap2 p. 153, 32.B ej. 10 (sol. S-Ap2 p. 118) | polígono compuesto | enunciado + solución | E: longitud numérica, vértices · S: longitud numérica, longitud algebraica, vértices | ángulo recto | E: no · S: sí (altura) | no | no | no | E: sí · S: dudoso | E: 5 / 7 / 9 · S: 6 / 9 / 11 | — |
| Ap2 p. 153, 32.B ej. 11 (sol. S-Ap2 p. 119) | triángulo rectángulo | enunciado | vértices | ángulo recto | no | no | no | no | sin longitudes | 3 / 3 / 3 | — |
| Ap2 p. 154, 32.B ej. 12 (sol. S-Ap2 p. 119) | esquema de contexto (objeto ilustrado) | enunciado | longitud numérica | — | no | no | no | no | no | 4 / 4 / 2 | cota |
| Ap2 p. 155, 32.B ej. 13 (sol. S-Ap2 p. 119) | esquema de contexto (poste o sombra) | enunciado | longitud numérica, longitud algebraica | — | sí (otro) | no | no | no | dudoso | 4 / 2 / 3 | cota |
| Ap2 p. 155, 32.B ej. 14 (sol. S-Ap2 p. 119) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 156, 32.B ej. 15 (sol. S-Ap2 p. 121) | otro triángulo | enunciado + solución | longitud numérica, longitud algebraica | ángulo recto | no | no | no | no | sí | E: 4 / 5 / 4 · E: 4 / 5 / 5 · S: 4 / 5 / 4 · S: 4 / 5 / 6 | — |
| Ap2 p. 217, Reforzamiento 5 ej. 1 (sol. S-Ap2 p. 169) | polígono compuesto | enunciado + solución | E: vértices · S: longitud numérica, vértices | — | E: no · S: sí (diagonal) | no | no | no | E: sin longitudes · S: sí | E: 8 / 10 / 8 · S: 8 / 12 / 17 | figuras superpuestas |
| Ap2 p. 219, Reforzamiento 5 ej. 5 (sol. S-Ap2 p. 171) | otra (red de cuerpo) | enunciado | — | — | sí (otro) | simple, un tono | sí | no | sin longitudes | 4 / 9 / 0 | — |
| Ap2 p. 226, 38 problema 8 (sol. S-Ap2 p. 179) | E: esquema de contexto (otro contexto) · S: triángulo rectángulo | enunciado + solución | E: longitud numérica, texto en región · S: longitud numérica, longitud algebraica, texto en región | E: — · S: ángulo recto | no | no | no | no | no | E: 16 / 14 / 17 · S: 3 / 3 / 5 | E: flecha · S: — |
| AP1 p. 117, 9.B ej. 9 (sol. SAP1 p. 77) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 202, 17.B ej. 6 (sol. SAP1 p. 145) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 246, 21.B ej. 5 (sol. SAP1 p. 184) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 157, 33.2 ejemplo | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 159, 33.A ejemplo 1 (sol. S-Ap2 p. 122) | cuadrilátero | enunciado | longitud numérica | — | no | no | no | no | dudoso | 4 / 4 / 2 | — |
| Ap2 p. 159, 33.A ejemplo 2 (sol. S-Ap2 p. 122) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 160, 33.A ejemplo 3 (sol. S-Ap2 p. 123) | figura en cuadrícula | enunciado | — | — | no | simple, un tono | sí | no | sin longitudes | 12 / 12 / 0 | polígono cóncavo |
| Ap2 p. 161, 33.A ejemplo 4 (sol. S-Ap2 p. 123) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 161, 33.A ejemplo 5 (sol. S-Ap2 p. 124) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 162, 33.B ej. 1 (sol. S-Ap2 p. 125) | otro triángulo | enunciado | longitud numérica, vértices | — | no | no | no | no | no verificable | 3 / 5 / 2 | cota |
| Ap2 p. 162, 33.B ej. 2 (sol. S-Ap2 p. 125) | cuadrilátero | enunciado | longitud numérica, vértices | ángulo recto | no | no | no | no | no | 5 / 6 / 8 | cota |
| Ap2 p. 163, 33.B ej. 3 (sol. S-Ap2 p. 125) | cuadrilátero | enunciado | vértices | ángulo recto | no | no | no | no | sin longitudes | 5 / 6 / 5 | — |
| Ap2 p. 163, 33.B ej. 4 (sol. S-Ap2 p. 126) | polígono compuesto | enunciado + solución | longitud numérica, grados | ángulo recto, arco de ángulo | no | no | no | no | sí | E: 5 / 5 / 5 · S: 5 / 6 / 7 | polígono cóncavo |
| Ap2 p. 164, 33.B ej. 5 (sol. S-Ap2 p. 126) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 164, 33.B ej. 6 (sol. S-Ap2 p. 126) | región sombreada compuesta | enunciado | — | — | no | resta, rayado | no | no | sin longitudes | 4 / 4 / 0 | figura inscrita, 1 circunf. |
| Ap2 p. 165, 33.B ej. 7 (sol. S-Ap2 p. 127) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 165, 33.B ej. 8 (sol. S-Ap2 p. 127) | región sombreada compuesta | enunciado | vértices | — | no | resta, un tono | no | no | sin longitudes | 4 / 4 / 4 | 1 arco o sector |
| Ap2 p. 166, 33.B ej. 9 (sol. S-Ap2 p. 128) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 166, 33.B ej. 10 (sol. S-Ap2 p. 128) | esquema de contexto (otro contexto) | enunciado | longitud numérica | — | sí (otro) | no | no | no | no | 4 / 4 / 2 | tangencia, figura inscrita, 7 circunf. |
| Ap2 p. 167, 33.B ej. 11 (sol. S-Ap2 p. 129) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 167, 33.B ej. 12 (sol. S-Ap2 p. 129) | esquema de contexto (objeto ilustrado) | enunciado | longitud numérica, texto en región | — | sí (otro) | resta, dos estilos | no | no | sí | 0 / 10 / 20 | figuras superpuestas, 10 circunf. |
| Ap2 p. 168, 33.B ej. 13 (sol. S-Ap2 p. 130) | región sombreada compuesta | enunciado | longitud numérica, vértices | — | no | simple, un tono | no | no | no | 6 / 9 / 10 | cota, figura inscrita |
| Ap2 p. 168, 33.B ej. 14 (sol. S-Ap2 p. 130) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 169, 33.B ej. 15 (sol. S-Ap2 p. 131) | sin figura | — | — | — | — | — | — | — | — | — | — |
| Ap2 p. 217, Reforzamiento 5 ej. 2 (sol. S-Ap2 p. 169) | sector o arco | enunciado | vértices | ángulo recto | no | resta, un tono | no | no | sin longitudes | 5 / 4 / 5 | 2 arco o sector |
| Ap2 p. 218, Reforzamiento 5 ej. 3 (sol. S-Ap2 p. 170) | polígono compuesto | enunciado | longitud algebraica | — | sí (prolongación) | union, un tono | no | no | sin longitudes | 8 / 10 / 1 | cota, polígono cóncavo |
| AP1 p. 106, 8.B ej. 11 (sol. SAP1 p. 69) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 118, 9.B ej. 12 (sol. SAP1 p. 77) | circunferencia o círculo | enunciado | vértices | — | no | no | no | no | sin longitudes | 5 / 4 / 5 | 1 circunf. |
| AP1 p. 126, 10.B ej. 5 (sol. SAP1 p. 83) | región sombreada compuesta | enunciado | texto en región | — | no | resta, rayado | no | no | sin longitudes | 11 / 14 / 3 | polígono cóncavo |
| AP1 p. 127, 10.B ej. 7 (sol. SAP1 p. 84) | región sombreada compuesta | enunciado | — | — | no | simple, rayado | no | no | sin longitudes | 5 / 8 / 0 | — |
| AP1 p. 127, 10.B ej. 8 (sol. SAP1 p. 84) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 130, 10.B ej. 14 (sol. SAP1 p. 86) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 152, 13.B ej. 4 (sol. SAP1 p. 103) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 152, 13.B ej. 6 (sol. SAP1 p. 104) | región sombreada compuesta | enunciado + solución | E: longitud numérica, vértices · S: longitud numérica, longitud algebraica, vértices | — | no | resta, un tono | no | no | no | E: 7 / 8 / 9 · S: 7 / 8 / 11 | polígono cóncavo |
| AP1 p. 153, 13.B ej. 8 (sol. SAP1 p. 105) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 163, 14.B ej. 8 (sol. SAP1 p. 116) | región sombreada compuesta | enunciado | longitud algebraica | — | no | resta, un tono | no | no | sin longitudes | 8 / 8 / 3 | cota |
| AP1 p. 163, 14.B ej. 9 (sol. SAP1 p. 117) | sin figura | — | — | — | — | — | — | — | — | — | — |
| AP1 p. 165, 14.B ej. 12 (sol. SAP1 p. 117) | otra (varias figuras separadas) | enunciado | texto en región | — | no | no | no | no | sin longitudes | 10 / 11 / 3 | flecha |
| AP1 p. 166, 14.B ej. 14 (sol. SAP1 p. 118) | región sombreada compuesta | enunciado | longitud algebraica, texto en región | — | sí (prolongación) | resta, dos estilos | no | no | sin longitudes | 12 / 14 / 5 | cota |

## Conteos

DEMRE: 26 filas, 22 con figura (17 verificables en PDF y 5 de 2027 solo en texto) y 4 sin figura. UC: 62 problemas, 39 con figura y 56 figuras (37 en enunciados, 4 en alternativas y 15 en soluciones).

Por tipo de figura. DEMRE cuenta filas; UC cuenta problemas.

| tipo | DEMRE (unidad / otras unidades) | UC (enunciado o alternativas / solución / problemas) |
|---|---|---|
| triángulo rectángulo | 0 / 0 | 1 / 3 / 4 |
| otro triángulo | 0 / 0 | 8 / 6 / 9 |
| cuadrilátero | 2 / 0 | 4 / 0 / 4 |
| polígono compuesto | 0 / 0 | 4 / 3 / 4 |
| circunferencia o círculo | 0 / 1 | 1 / 0 / 1 |
| sector o arco | 0 / 0 | 1 / 0 / 1 |
| región sombreada compuesta | 1 / 1 | 8 / 1 / 8 |
| figura en cuadrícula | 0 / 2 | 1 / 0 / 1 |
| esquema de contexto | 5 / 0 | 7 / 0 / 7 |
| otra | 3 / 7 | 3 / 1 / 3 |

Por rasgo, con los mismos criterios.

| rasgo | DEMRE (unidad / otras unidades) | UC (enunciado o alternativas / solución / problemas) |
|---|---|---|
| rótulo: longitud numérica | 4 / 3 | 19 / 10 / 21 |
| rótulo: longitud algebraica | 1 / 1 | 6 / 6 / 11 |
| rótulo: grados | 0 / 0 | 2 / 4 / 4 |
| rótulo: nombres de vértices | 1 / 1 | 16 / 8 / 17 |
| rótulo: letras de ángulo | 0 / 0 | 2 / 3 / 3 |
| texto libre o en región | 1 / 5 | 6 / 2 / 6 |
| marca: ángulo recto | 2 / 0 | 13 / 9 / 16 |
| marca: arco de ángulo | 0 / 0 | 3 / 5 / 5 |
| marca: igualdad | 0 / 0 | 0 / 0 / 0 |
| marca: paralelismo | 0 / 0 | 0 / 0 / 0 |
| auxiliares punteados | 1 / 5 | 10 / 3 / 12 |
| sombreado simple | 0 / 3 | 5 / 0 / 5 |
| sombreado: unión | 0 / 0 | 1 / 0 / 1 |
| sombreado: resta | 1 / 2 | 8 / 1 / 8 |
| sombreado: intersección | 0 / 0 | 0 / 0 / 0 |
| sombreado en dos estilos | 0 / 1 | 2 / 0 / 2 |
| cuadrícula | 0 / 2 | 2 / 0 / 2 |
| suelo o muro achurado | 1 / 0 | 2 / 0 / 2 |
| cota (llave o flechas) | 1 / 3 | 12 / 2 / 12 |
| flecha | 1 / 4 | 2 / 0 / 2 |
| punto marcado | 0 / 1 | 0 / 0 / 0 |
| arco o sector | 0 / 1 | 2 / 0 / 2 |
| circunferencia | 0 / 1 | 4 / 0 / 4 |
| nota «no está a escala» | 0 / 0 | 0 / 0 / 0 |
| a escala: sí | 1 / 0 | 5 / 3 / 6 |
| a escala: dudoso | 1 / 0 | 3 / 3 / 6 |
| a escala: no | 0 / 2 | 9 / 6 / 10 |
| a escala: no verificable | 2 / 1 | 3 / 1 / 4 |
| a escala: sin longitudes | 4 / 6 | 17 / 1 / 18 |
| polígono cóncavo | 0 / 0 | 5 / 2 / 5 |
| figura inscrita | 0 / 0 | 3 / 0 / 3 |
| figuras superpuestas | 0 / 0 | 2 / 1 / 2 |
| tangencia | 0 / 0 | 1 / 0 / 1 |
| alternativas con figura | 0 / 3 | 1 / 0 / 1 |
| objeto ilustrado | 3 / 3 | 3 / 0 / 3 |
| cuerpo 3D | 2 / 2 | 0 / 0 / 0 |

Máximos por figura:

| | puntos | segmentos | rótulos |
|---|---|---|---|
| DEMRE | 24 (2026 regular n.º 49, enunciado) | 24 (la misma) | 8 (2024 invierno n.º 51) |
| UC | 16 (Ap2 p. 226, cap. 38 problema 8) | 14 (la misma; también AP1 pp. 126 y 166) | 20 (Ap2 p. 167, 33.B ej. 12) |
| DEMRE, alternativas | 8 (2026 regular n.º 49) | 7 (la misma) | 0 |
| UC, alternativas | 4 (Ap2 p. 147, 32.A ejemplo 4) | 5 (la misma) | 5 (la misma) |

Formas por figura: UC llega a 10 circunferencias en una figura (Ap2 p. 167, 33.B ej. 12); DEMRE, a 5 polígonos (2024 invierno n.º 43: el cuadrado y cuatro triángulos).

Tipos de lectura en UC (por problema): rótulos directos 27, marca de ángulo recto 13, relación entre regiones 10, descomponer la figura 8, figura ilustrativa 7, conteo en cuadrícula 2, elegir la figura en las alternativas 1, sin figura en el enunciado ni en las alternativas 25.

## Convenciones de la unidad

### π

- **DEMRE.** Exacto en las alternativas de las tres preguntas de la unidad con círculo: 2024 invierno n.º 42 (π cm, 2π cm, 4π cm y 8π cm; PDF p. 34, `.md` l. 941-944), 2025 regular n.º 57 (de 225π cm² a 900π cm²; PDF p. 32) y n.º 58 (de 17π m² a (17)²π m²; PDF p. 33). Fuera de la unidad también: 2025 regular n.º 60 (5000π cm³, PDF p. 35) y 2027 invierno n.º 45 (0,72π m³, `.md` l. 845). La única aproximación del corpus la declara el enunciado y usa 3: 2024 regular n.º 47, "consideren π aproximado a 3" (`cuerpos-geometricos`, `.md` l. 1094).
- **UC.** Aparece exacto y aproximado. El valor declarado dentro de la unidad es 3 (AP1 p. 130); fuera de la unidad el apunte usa también 3 y 22/7 (Ap2 pp. 14, 176 y 182). Páginas con π en la unidad: Ap2 pp. 161, 164-168 y 217; S-Ap2 pp. 123, 126, 129 y 169; AP1 pp. 118 y 130; SAP1 p. 86.
- **Lección gratuita** (solo lectura). π ≈ 3,14, declarado en el enunciado: "Usa π ≈ 3,14" (`content/lecciones/figuras-borde-y-superficie.json` l. 476 y 615; `content/lecciones/figuras-problemas-con-forma.json` l. 539; también en el texto del paso, l. 524). Las respuestas son decimales, sin π: 94,2 cm y 314 cm² (`figuras-borde-y-superficie.json` l. 481 y 620) y 157 cm (`figuras-problemas-con-forma.json` l. 544).

### Área y unidades

- **DEMRE.** cm² y m² con superíndice (2024 invierno n.º 43, "en cm²", PDF p. 35; 2025 regular n.º 57 y 58; 2026 regular n.º 45, "0,76 m²", PDF p. 23) y en palabras ("en metros cuadrados", 2024 regular n.º 48, `.md` l. 1118). u² y "unidades cuadradas": cero apariciones en los ocho `.md` DEMRE.
- **UC.** cm² (Ap2 pp. 153, 160, 162-164, 166 y 168; S-Ap2 pp. 118, 125, 126 y 130; AP1 pp. 106, 117, 118 y 152; SAP1 pp. 77 y 104), m² (Ap2 pp. 159, 161, 168 y 217; S-Ap2 pp. 122, 124 y 169; AP1 p. 165), "unidades cuadradas" (Ap2 pp. 150, 152 y 169; S-Ap2 pp. 116 y 131) y resultado sin unidad (Ap2 pp. 151, 165, 167 y 217; S-Ap2 p. 116; AP1 pp. 126, 127, 163 y 166).
- **Lección.** m² y cm² con superíndice en el texto al estudiante (`figuras-borde-y-superficie.json` l. 122 y 210; `figuras-problemas-con-forma.json` l. 126 y 286). No usa u².

### Raíces en los resultados

- **DEMRE.** La raíz queda exacta en las alternativas, nunca con su decimal. Sin simplificar: √369 m (2024 invierno n.º 41, PDF p. 33), √(AO² + BO²) (2024 regular n.º 44, PDF p. 35), √20 + 2√10 (2024 regular n.º 50, PDF p. 41), (√29 + 15) cm (2027 invierno n.º 51, `.md` l. 920-922). Simplificada: h√2 (2024 regular n.º 45, PDF p. 36).
- **UC.** Las dos formas, sin decimales: a√b simplificada (Ap2 pp. 147, 152, 153, 162, 164, 168 y 217; S-Ap2 pp. 111, 117, 120, 121, 125, 126, 130 y 169; AP1 pp. 117, 126, 127 y 130; SAP1 pp. 77 y 86) y √n sin simplificar (Ap2 pp. 146, 153-156 y 226; S-Ap2 pp. 110, 118, 119, 121 y 180).
- **Lección.** La raíz irracional va con su aproximación a una décima: "√260 ≈ 16,1 m" como texto de una alternativa (`figuras-problemas-con-forma.json` l. 488), "√146 ≈ 12,1 m" (`content/lecciones/figuras-triangulo-no-se-rompe.json` l. 682), y en feedback √194 ≈ 13,9 (`figuras-borde-y-superficie.json` l. 526) y √117 ≈ 10,8 (`figuras-triangulo-no-se-rompe.json` l. 437).

### Redondeo

- **DEMRE.** En la unidad no redondea: los decimales de las alternativas son exactos (1,444 m y 0,722 m en 2026 regular n.º 45; 13,5 m en 2024 invierno n.º 41). "Aproximad-" aparece solo en otras unidades (2024 invierno `.md` l. 314; 2025 regular `.md` l. 442).
- **UC.** No redondea (Ap2 pp. 146, 148, 152-156, 159 y 226; S-Ap2 pp. 110-112, 115-122, 169 y 180; SAP1 p. 77).
- **Lección.** Redondea las raíces a una décima con ≈ (arriba). Con π ≈ 3,14 los resultados salen exactos porque los radios se eligieron para eso (`figuras-problemas-con-forma.json` l. 26, nota interna).

### Decimal con coma

- **DEMRE.** Coma decimal (13,5 m; 0,76 m²; 4,8 mm; 1,444 m) y espacio de miles (40 000 cm³, 2024 invierno n.º 44; 3 600 cm³, 2024 regular n.º 47).
- **UC.** Coma (Ap2 pp. 147, 154 y 159; S-Ap2 pp. 111, 119 y 122) y también punto decimal (Ap2 p. 167; S-Ap2 pp. 129 y 130): el material no es uniforme.
- **Lección.** Coma decimal y punto de miles ("1.962,5", `figuras-problemas-con-forma.json` l. 552), la convención del repo.

### Figuras a escala

- **DEMRE.** La instrucción general de todas las formas dice "Las figuras que aparecen son solo indicativas" (2024 invierno `.md` l. 73; 2024 regular l. 77; 2025 regular l. 43; 2026 regular l. 39; 2027 invierno l. 47). Ninguna figura trae nota propia. De las figuras con dos o más longitudes rotuladas, medido: 1 a escala (2026 regular n.º 45), 1 dudosa (2024 regular n.º 43) y 2 fuera de escala (2024 invierno n.º 55 y 2025 regular n.º 61).
- **UC.** Ninguna figura trae nota. Medido por problema: sí 6, dudoso 6, no 10, no verificable 4, sin longitudes 18.

### Hallazgos abiertos (no se toca la lección)

1. **π.** La lección aproxima siempre con 3,14 y responde en decimales. DEMRE pone π exacto en las cuatro alternativas de las tres preguntas de la unidad con círculo, y su única aproximación declarada usa 3.
2. **Raíces.** La lección escribe la raíz con su decimal (≈) en alternativas y feedback. DEMRE deja la raíz exacta en las alternativas, simplificada o no.
3. **Redondeo dentro de la lección.** La misma raíz sale con dos redondeos: √146 ≈ 12,1 m (`figuras-triangulo-no-se-rompe.json` l. 682, 690 y 704) y √146 ≈ 12,08 m (l. 684 y 708).

## Mecanismos de error en distractores DEMRE

Catálogo de la unidad, crudo:

```
$ node -e 'const c=require("./content/errores/figuras-geometricas.json"); for (const e of c.errores) console.log(e.id + "\n  " + e.descripcion)'
figuras-geometricas/suma-lados-en-vez-de-cuadrados
  Tratar el teorema de Pitágoras como una operación lineal entre los lados —sumarlos o restarlos directamente— en vez de elevarlos al cuadrado, combinarlos, y recién ahí aplicar la raíz cuadrada. Incluye tanto calcular la hipotenusa como cateto + cateto, como calcular un cateto como hipotenusa − cateto, como usar la suma o resta directa de los lados para verificar si la relación se cumple.
figuras-geometricas/omite-raiz-final-pitagoras
  Elevar al cuadrado y sumar o restar correctamente según corresponda, pero omitir la raíz cuadrada final, entregando la suma o resta de los cuadrados como si fuera la medida del lado buscado (por ejemplo, a² + b² en vez de √(a² + b²), o c² − a² en vez de √(c² − a²)).
figuras-geometricas/suma-cuadrados-al-buscar-cateto
  Al buscar un cateto desconocido conociendo la hipotenusa y el otro cateto, sumar los cuadrados de ambos valores dados (hipotenusa² + cateto²) en vez de restarlos, aplicando el mismo patrón de 'sumar cuadrados' del caso de buscar la hipotenusa, sin notar que aquí el valor desconocido ya no es la hipotenusa.
figuras-geometricas/trata-cateto-como-hipotenusa
  Al buscar un cateto desconocido, tratar el cateto ya conocido como si fuera la hipotenusa —despejando con ese valor en el lugar de c— en vez de identificar que la hipotenusa es siempre el lado más largo, opuesto al ángulo recto.
figuras-geometricas/duplica-en-vez-de-elevar-al-cuadrado
  Error aritmético al elevar un número al cuadrado: calcular a² como 2 × a (el doble del número) en vez de a × a, subestimando sistemáticamente el resultado.
figuras-geometricas/eleva-suma-de-catetos
  Suma los catetos antes de elevar al cuadrado: calcula (a+b)² en vez de a²+b², confundiendo la propiedad distributiva del cuadrado de una suma con el teorema de Pitágoras.
figuras-geometricas/omite-mitad-en-area
  Olvida el factor 1/2 (o la división por 2) en una fórmula de área que lo incluye: calcula el área de un triángulo como base×altura, en vez de base×altura÷2, o el área de un trapecio como (baseMayor+baseMenor)×altura, en vez de dividir esa suma por 2 antes de multiplicar por la altura — tratando la figura como si fuera un paralelogramo completo en vez de la mitad de uno.
figuras-geometricas/usa-altura-como-lado-inclinado
  Calcula el perímetro de una figura con al menos un lado inclinado (como un paralelogramo cortado con un desplazamiento horizontal) usando la altura vertical como si fuera la medida de ese lado inclinado, en vez de calcular su longitud real aplicando el teorema de Pitágoras sobre la altura y el desplazamiento.
figuras-geometricas/confunde-circunferencia-con-area
  Confunde la fórmula de la circunferencia de un círculo (su perímetro, 2×π×radio) con la fórmula de su área (π×radio²), aplicando una en el lugar de la otra sin notar que una mide un borde (una longitud) y la otra una superficie.
figuras-geometricas/usa-lado-inclinado-como-altura
  Usa el lado inclinado de la figura (por ejemplo, la cumbrera de un techo o un lado dado como hipotenusa) directamente como si fuera la altura al aplicar una fórmula de área o perímetro, en vez de calcular primero la altura real mediante el teorema de Pitágoras. Es el error inverso al de usa-altura-como-lado-inclinado: ahí se usaba la altura como si fuera el lado inclinado; aquí se usa el lado inclinado como si fuera la altura.
figuras-geometricas/cuenta-borde-interior-en-figura-compuesta
  Al calcular el perímetro (o el material de borde) de una figura compuesta por dos piezas —como un muro rectangular con un techo triangular encima—, suma el contorno de cada pieza por separado incluyendo el borde donde ambas piezas se unen, en vez de contar solo el borde exterior visible de la figura completa (esa unión no es un borde real de la figura compuesta).
figuras-geometricas/asume-trio-pitagorico
  Ver dos catetos parecidos a un trío pitagórico conocido —o a un múltiplo de uno— y dar por hecho que la hipotenusa es la de ese trío, sin comprobar que ambos catetos coincidan exactamente: por ejemplo, tratar un triángulo de catetos 8 y 16 como si fuera el trío 8-15-17 y responder 17. Incluye suponer que la hipotenusa siempre da un número entero. Cuando los catetos no calzan con ningún trío, la relación a² + b² = c² sigue valiendo, pero su resultado puede ser irracional.
```

Preguntas de la unidad con PDF y clavijero: 2024 invierno n.º 41, 42 y 43 (clavijero de invierno 2024, `.md` l. 130-132: A, C, D) y 2026 regular n.º 45 (clavijero regular 2026, `.md` l. 151: B). 2024 regular y 2025 regular no tienen clavijero; 2027 invierno no tiene PDF. Verificación:

```
$ node -e '
const r = (x) => Math.round(x * 1e6) / 1e6;
console.log("2024-invierno-111 n.º 41 · base 12, visual 15, clave A = 9");
console.log("  clave  √(15² − 12²) =", Math.sqrt(15 ** 2 - 12 ** 2));
console.log("  B      (12 + 15) / 2 =", (12 + 15) / 2);
console.log("  C      la visual tal cual =", 15);
console.log("  D      15² + 12² =", 15 ** 2 + 12 ** 2, "→ √369");
console.log("2024-invierno-111 n.º 42 · catetos 8 y 6, a + b = c + d, clave C = 4π");
const c = Math.hypot(8, 6), d = 8 + 6 - c;
console.log("  c =", c, " d =", d, " clave π·d =", d + "π");
console.log("  D      2π·d (el diámetro como radio) =", 2 * d + "π");
console.log("  B      π·(d/2) (el radio en π·d) =", d / 2 + "π");
console.log("  A      π·(d/2)² =", (d / 2) ** 2 + "π", " π·d/4 =", d / 4 + "π", " (ninguno sale de un paso escribible)");
console.log("2024-invierno-111 n.º 43 · lado p, catetos m y n, clave D = p² − 2mn (con p = 10, m = 2, n = 3)");
const p = 10, m = 2, n = 3;
console.log("  clave  p² − 4·(m·n/2) =", p * p - 4 * (m * n / 2), " p² − 2mn =", p * p - 2 * m * n);
console.log("  A      p² + 4mn =", p * p + 4 * m * n, " B p² − 4mn =", p * p - 4 * m * n, " C p² + 2mn =", p * p + 2 * m * n);
console.log("2026-regular-113 n.º 45 · área 0,76, bases 0,6 y 1,3, clave B = 0,80");
const A = 0.76, s = 0.6 + 1.3;
console.log("  clave  2A/(B + b) =", r(2 * A / s));
console.log("  A      A·(B + b) =", r(A * s));
console.log("  C      A·(B + b)/2 =", r(A * s / 2));
console.log("  D      A/(B + b) =", r(A / s));'
2024-invierno-111 n.º 41 · base 12, visual 15, clave A = 9
  clave  √(15² − 12²) = 9
  B      (12 + 15) / 2 = 13.5
  C      la visual tal cual = 15
  D      15² + 12² = 369 → √369
2024-invierno-111 n.º 42 · catetos 8 y 6, a + b = c + d, clave C = 4π
  c = 10  d = 4  clave π·d = 4π
  D      2π·d (el diámetro como radio) = 8π
  B      π·(d/2) (el radio en π·d) = 2π
  A      π·(d/2)² = 4π  π·d/4 = 1π  (ninguno sale de un paso escribible)
2024-invierno-111 n.º 43 · lado p, catetos m y n, clave D = p² − 2mn (con p = 10, m = 2, n = 3)
  clave  p² − 4·(m·n/2) = 88  p² − 2mn = 88
  A      p² + 4mn = 124  B p² − 4mn = 76  C p² + 2mn = 112
2026-regular-113 n.º 45 · área 0,76, bases 0,6 y 1,3, clave B = 0,80
  clave  2A/(B + b) = 0.8
  A      A·(B + b) = 1.444
  C      A·(B + b)/2 = 0.722
  D      A/(B + b) = 0.4
```

Una línea por distractor. "Calza" exige que el texto literal del id describa el procedimiento completo.

- **2024 invierno n.º 41** (clave A = 9 m).
  - B = 13,5 m: promedia las dos medidas dadas, (12 + 15) / 2. Sin id: candidato.
  - C = 15 m: da la visual (la hipotenusa) como la altura pedida. Calce parcial con `usa-lado-inclinado-como-altura`: el mecanismo es ese, pero su texto lo acota a "una fórmula de área o perímetro" y aquí la altura es la respuesta misma. Candidato: el mismo mecanismo sin esa restricción.
  - D = √369 m: suma los cuadrados de la hipotenusa y el cateto, 15² + 12², en vez de restarlos. Calza con `suma-cuadrados-al-buscar-cateto`.
- **2024 invierno n.º 42** (clave C = 4π cm).
  - A = π cm: sin mecanismo identificado (π·(d/2)² da 4π, la clave; π·d/4 no sale de un paso escribible).
  - B = 2π cm: usa el radio en la fórmula π·d. Sin id en la unidad: candidato. En otra unidad, `cuerpos-geometricos/confunde-radio-con-diametro-cilindro` describe el mismo cambio, pero su texto lo acota al cilindro.
  - D = 8π cm: usa el diámetro como radio en 2π·r. Mismo caso que B, en el otro sentido: candidato.
- **2024 invierno n.º 43** (clave D = p² − 2mn).
  - A = p² + 4mn: omite la mitad del área del triángulo y además suma las piezas que se descuentan. Calce parcial con `omite-mitad-en-area` (cubre la mitad, no la suma). Candidato para la suma: toma la región que queda como la unión de las piezas.
  - B = p² − 4mn: omite la mitad del área de cada triángulo. Calza con `omite-mitad-en-area`.
  - C = p² + 2mn: suma las cuatro piezas en vez de restarlas. Sin id: mismo candidato que A.
- **2026 regular n.º 45** (clave B = 0,80 m).
  - A = 1,444 m: multiplica el área por la suma de las bases en vez de dividir al despejar la altura. Sin id: candidato.
  - C = 0,722 m: pone el área en el lugar de la altura dentro de la fórmula, 0,76 · (0,6 + 1,3) / 2. Sin id: candidato.
  - D = 0,40 m: omite la división por 2 del trapecio, 0,76 / 1,9. Calza con `omite-mitad-en-area`.

Candidatos sin id, sin escribir ids: promediar las medidas dadas; dar el lado inclinado como la altura pedida (fuera de una fórmula de área o perímetro); confundir radio con diámetro en el perímetro del círculo, en los dos sentidos; tomar como unión la región que se obtiene restando; despejar multiplicando en vez de dividir; poner un dato en el lugar de la incógnita dentro de la fórmula.

## Qué se construye

Umbral: se construye toda representación o rasgo que aparezca al menos una vez en DEMRE o al menos tres veces en UC (problemas). Antes de crear algo se revisó si lo cubre un tipo existente (`plano-isometrias`, `plano-funcion`, `tabla-valores`, las figuras de datos, `diagrama-cajon`): ninguno dibuja geometría sin ejes, así que todo lo de abajo va en el tipo nuevo `lienzo-geometrico`, firmado en la tarea.

| representación o rasgo | DEMRE (unidad / otras) · UC | decisión |
|---|---|---|
| triángulos, cuadriláteros, polígonos compuestos y cóncavos, circunferencias, sectores y arcos, varias figuras separadas | ver conteos por tipo | Primitivas del lienzo (13b). |
| región sombreada: simple, resta, unión | 1 / 5 · 14 | Regiones: unión de formas menos unión de huecos, con máscara (13c). |
| sombreado en dos estilos | 0 / 1 · 2 | Dos tramas distinguibles (13c). |
| sombreado por intersección | 0 / 0 · 0 | **No se construye.** |
| rótulos: longitud numérica, algebraica, grados, vértices, letras de ángulo | 4 / 3 · 21, 1 / 1 · 11, 0 / 0 · 4, 1 / 1 · 17, 0 / 0 · 3 | Rótulo de punto, de segmento, de arco y de ángulo (13b); el parser de 13d verifica los numéricos y los grados. |
| marcas: ángulo recto y arco de ángulo | 2 / 0 · 16, 0 / 0 · 5 | Marcas de ángulo (13b). |
| marcas de igualdad y paralelismo | 0 / 0 · 0 | Se construyen por la decisión firmada 13b, aunque el inventario no las muestra. |
| auxiliares punteados | 1 / 5 · 12 | Segmento punteado (13b). |
| cuadrícula | 0 / 2 · 2 | Cuadrícula opcional con paso declarado (13b). |
| esquema de contexto (poste o sombra, escalera, letras, silla) | 5 / 0 · 7 | Se dibuja su esquema con las primitivas y los rasgos de abajo; el objeto ilustrado no. |
| suelo o muro achurado | 1 / 0 · 2 | **Se construye**: `achurado` en el segmento. |
| cota | 1 / 3 · 12 | **Se construye**: `cota` en el segmento, con llave como en DEMRE (ninguna figura DEMRE usa cota con flechas). |
| texto libre o en región | 1 / 5 · 6 | **Se construye**: `textos`, en coordenadas del mundo. |
| flecha | 1 / 4 · 2 | **Se construye**: `flecha` en el segmento, con punta en `hasta`. |
| punto marcado | 0 / 1 · 0 | **Se construye**: `marca` en el punto. |
| figura fuera de escala | 0 / 2 · 10 | **Se construye** `aEscala: false` con la nota fija "Figura referencial, no está a escala" (13d). |
| nota propia "no está a escala" en la figura | 0 / 0 · 0 | No aparece: la nota la pone `aEscala: false`. |
| alternativas con figura | 0 / 3 · 1 | El lienzo va también en alternativas, con su ancho (reglas 25 y 26 vigentes). |
| figura inscrita, figuras superpuestas, tangencia, polígono cóncavo | 0 / 0 · 3, 2, 1, 5 | Sin campo nuevo: salen de las primitivas. |
| red plana de un cuerpo, triángulos en posición de Thales | 0 / 2 · 1 | Sin campo nuevo (13l). |
| circunferencia punteada | 0 / 0 · 1 | **No se construye** (bajo el umbral). |
| objeto ilustrado (árbol, silla, rosa de los vientos, tarjetas, tijera) | 3 / 3 · 3 | **No se dibuja**: el lienzo es declarativo y geométrico (13a). En su lugar va el esquema. |
| cuerpo 3D | 2 / 2 · 0 | **No se construye** (13l). |
| plano cartesiano | 7 preguntas fuera de la tabla | Lo cubren `plano-isometrias` y `plano-funcion`. |

Topes (13j): el máximo del inventario. Puntos 24 y segmentos 24 (2026 regular n.º 49), rótulos 20 (Ap2 p. 167) y formas 10 (Ap2 p. 167). En alternativas el máximo del inventario es 8 puntos, 7 segmentos, 5 rótulos y 1 forma; el tope se fija en 12, 12, 10 y 5, lo que cabe a 12 px en el carril de una alternativa (se comprueba en la galería con un caso en esos topes).

## Figura en la solución

Soluciones UC con una construcción auxiliar dibujada, sin duplicados: 8. Con altura trazada, 2 (S-Ap2 p. 117, 32.B ej. 9; S-Ap2 p. 118, 32.B ej. 10); con la figura partida por una diagonal o un segmento nuevo, 2 (S-Ap2 p. 169, Reforzamiento 5 ej. 1; S-Ap2 p. 126, 33.B ej. 4). Las otras 4 (S-Ap2 pp. 110, 114, 115 y 180) dibujan una figura nueva, el triángulo que se usa, y no una construcción sobre la original. Con 4 soluciones de los tipos que pide el umbral (altura trazada o descomposición) se construye `figuraSolucion`.
