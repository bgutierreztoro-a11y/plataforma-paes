# Figuras de cuerpos geométricos: inventario de la unidad

Fecha: 2026-09-24. Insumo de la infraestructura de figuras de la Unidad 15 de Advance (`cuerpos-geometricos`): qué figuras traen los problemas de área y volumen de paralelepípedos, cubos y cilindros, con qué vista, cotas, aristas ocultas y composición, y qué de eso dibuja el tipo `cuerpo-geometrico` y qué va en `lienzo-geometrico`.

Método:

- **DEMRE.** Las 12 preguntas de la unidad salen de `docs/analisis/frecuencia-demre-v2.json` (`unidadId` = `cuerpos-geometricos`). La página de cada pregunta se ubicó con el texto del PDF y se rasterizó con pypdfium2, fuera del repo. 2027 invierno no tiene PDF: sus filas se leyeron en el `.md` y lo que el texto no afirma queda como no verificable (¿?).
- **Material UC.** `por-unidad.md` (sección `cuerpos-geometricos`) y `ap2.json` dan 3 conceptos y 23 problemas; `ap1.json` no tiene conceptos de la unidad. El tema está en Ap2 cap. 34 (teoría pp. 170-173, problemas pp. 174-183) y Reforzamiento 5 (pp. 218-220), con soluciones en S-Ap2 (pp. 132-140 y 170-172). Un subagente de sala limpia ubicó las páginas, las rasterizó fuera del repo y devolvió únicamente formas, vistas, rasgos, conteos y página; los rásteres y sus extractos de texto se borraron al terminar. En Ap2 y S-Ap2 la página impresa coincide con la del PDF.
- **Sala limpia.** De UC se toman solo formas, rasgos y página. Ningún dato, cifra, contexto ni texto de UC entra al repo, a la galería ni a los tests; todo caso de prueba usa datos inventados.
- **Umbral, el mismo de la Unidad 14** (`figuras-geometria-plana.md`): se construye todo rasgo que aparece al menos una vez en DEMRE o al menos tres veces en UC, contado por problema (un rasgo cuenta una vez por problema aunque aparezca en varias figuras de él).
- **Columna "con el contrato".** Qué dibuja el contrato firmado el 2026-09-24 (`docs/fobos-advance.md` §12.15) y qué queda fuera. Nada de lo 3D lo dibujaba Advance antes de ese contrato.

## Inventario, una fila por figura

Columnas: fuente, pregunta o ejercicio, cuerpos, vista, cotas, aristas ocultas, composición y lo que dibuja el contrato.

### DEMRE (12 preguntas, 8 con figura)

| fuente | pregunta | cuerpos | vista | cotas | ocultas | compuesto | con el contrato |
|---|---|---|---|---|---|---|---|
| 2024 invierno, forma 111 | n.º 44 (PDF p. 36) | paralelepípedo (en el texto) | sin figura | — | — | — | — |
| 2024 invierno, forma 111 | n.º 45 (PDF p. 37) | cubos (bloques) en tres filas y cuatro columnas, uno central del ancho de dos | oblicua ilustrada: la cara grande no va en verdadera forma; profundidad arriba a la derecha | 1 numérica junto a una arista de profundidad, girada y sin llave | no se dibujan | bloques adosados con juntas visibles | sí, en caballera: 11 cajas con `juntas: true`, `ocultas: false` y la cota con `llave: false`. No: textura, dos rótulos señalados con flecha, rótulo girado |
| 2024 regular, forma 113 | n.º 47 (PDF p. 38) | dos cilindros, uno alto y angosto y otro bajo y ancho | frontal con tapa elíptica | ninguna (el dato va en el texto) | no se dibujan | dos cuerpos separados, lado a lado | sí: dos pilas separadas por 12 px o más, con `ocultas: false`. No: graduación, sombreado |
| 2024 regular, forma 113 | n.º 48 (PDF p. 39) | paralelepípedo | isométrica: arista vertical al frente y dos caras oblicuas | 3 algebraicas con llave (dos aristas de arriba y la altura) | no se dibujan | no | sí, en caballera, con sus tres cotas algebraicas. No: la vista isométrica, ventanas, sombra y suelo |
| 2025 regular, forma 113 | n.º 59 (PDF p. 34) | paralelepípedo (en el texto) | sin figura | — | — | — | — |
| 2025 regular, forma 113 | n.º 60 (PDF p. 35) | dos cilindros coaxiales de la misma altura, el de arriba más angosto | frontal con tapa elíptica | 3 numéricas con llave: diámetro de arriba sobre la tapa, diámetro de abajo bajo la base, altura del de abajo a la izquierda con rótulo vertical | no se dibujan | apilado | sí, con las tres cotas y `ocultas: false`. No: sombreado, rótulo vertical |
| 2025 regular, forma 113 | n.º 61 (PDF p. 36) | prisma rectangular hueco, partido, y su sección frontal | oblicua ilustrada del perfil; sección frontal plana | 3 numéricas con llave, solo en la sección | no se dibujan | hueco | no: el perfil hueco (fuera de los cuerpos del temario y de los compuestos), la flecha curva entre figuras y la textura. La sección sí, en `lienzo-geometrico` (`figuras-geometria-plana.md`, fila 2025 n.º 61) |
| 2026 regular, forma 113 | n.º 47 (PDF p. 24) | red de cubo en cruz, cubo armado y cuerpo en U | la red plana; el cubo y la U en caballera: cara frontal en verdadera forma, profundidad corta arriba a la derecha | red: 1 con llave sobre tres caras. U: 6 numéricas con llave (largo total abajo, alto a la izquierda, arista de arriba de la columna izquierda, piso interior, alto de la columna derecha por su lado derecho, profundidad abajo a la derecha) | no se dibujan | la U, tres cajas adosadas sin juntas; red y cubo, cuerpos separados | la U sí, con sus seis cotas y `ocultas: false`; la red sí, en `lienzo-geometrico`. No: red, flecha de bloque hueca y cubo en una misma figura (una figura por ítem, un tipo por figura), cara sombreada |
| 2026 regular, forma 113 | n.º 48 (PDF p. 25) | cubo (en el texto) | sin figura | — | — | — | — |
| 2027 invierno, forma 111 | n.º 43 (`.md` l. 784) | ¿? (el texto anuncia el diseño nuevo junto al original: dos cajas) | ¿? | ¿? | ¿? | ¿? | no verificable sin PDF |
| 2027 invierno, forma 111 | n.º 44 (`.md` l. 800) | prisma recto de base rectangular (en el texto) | el `.md` no anuncia figura | — | — | — | — |
| 2027 invierno, forma 111 | n.º 45 (`.md` l. 831) | ¿? (figura adjunta que explica dos medidas de un objeto real) | ¿?; por el texto, ilustración | ¿? | ¿? | ¿? | no verificable sin PDF |

Conteo DEMRE, 8 figuras: caballera 1, isométrica 1, frontal con tapa elíptica 2, oblicua ilustrada 2, no verificable 2. Aristas ocultas dibujadas: 0 de 8. Cotas con llave: 3 figuras. Compuestos: apilado 1, adosado 2 (uno sin juntas y otro con juntas), hueco 1, cuerpos separados 2 (2024 regular n.º 47; red y cubo en 2026 n.º 47). Redes: 1. Cuerpos fuera del temario de la unidad: 1 (el prisma hueco).

Fuera de la unidad, anotadas en `figuras-geometria-plana.md` (l. 8, 28 y 30) como cuerpo 3D, fotografía o ilustración: 2024 invierno n.º 50; 2024 regular n.º 45; 2025 regular n.º 57, 63 y 64; 2027 invierno n.º 26 y 50. No se abrieron para este inventario.

### UC, problemas (23: 16 con figura, 18 figuras)

| fuente | ejercicio | cuerpos | vista | cotas | ocultas | compuesto | con el contrato |
|---|---|---|---|---|---|---|---|
| Ap2 p. 174 | Ejemplo N°1, figura 1 | cubo | red en escalón y cubo chico en caballera, profundidad arriba a la derecha | 1 numérica con llave bajo la tira de la red | el cubo no las dibuja | red y cubo separados, con flecha hueca | la red sí, en `lienzo-geometrico`. No: red y cubo en una figura, flecha hueca, cara sombreada |
| Ap2 p. 174 | Ejemplo N°1, figura 2 | prisma recto de base en U hecho de cubos | caballera, arriba a la derecha | 6 numéricas con llave | no se dibujan | unión de cubos sin divisiones | sí, entera |
| S-Ap2 p. 132 | Ejemplo N°1, solución | la misma U dividida en cubos | caballera | las mismas 6 | alambre de los cubitos, continuo | unión de cubos con juntas | sí, con `juntas: true`, salvo las juntas de atrás (el contrato no dibuja juntas ocultas) |
| Ap2 p. 175 | Ejemplo N°2 | cajas de base cuadrada, poco profundas | ilustración proyectada en caballera | 1 numérica junto a la arista de profundidad, sin llave | no se dibujan | bloques en filas y columnas, uno central del lugar de dos | sí, con `juntas: true` y la cota con `llave: false`. No: textura, dos textos señalados con flecha |
| Ap2 p. 176 | Ejemplo N°4 | dos cilindros | ilustración con tapa elíptica | ninguna | no se dibujan | separados | sí, dos pilas separadas. No: graduación, ilustración |
| Ap2 p. 176 | Ejemplo N°5 | cajas de base cuadrada | caballera | ninguna | no se dibujan | adosado, en una secuencia de tres etapas con flechas | cada etapa sola sí (separadas, unidas con juntas, unidas sin juntas). No: la secuencia en una figura |
| Ap2 p. 178 | Ej. 4 | cubo | caballera | 2 numéricas junto a la arista | no aplica: la profundidad va como vectores | no | el cubo y sus dos cotas sí. No: vectores, planos sombreados detrás y debajo, cara trasera en trazo continuo |
| Ap2 p. 178 | Ej. 5 | caja abierta | red: plantilla cuadrada con las esquinas recortadas | 3: 1 con llave y 2 algebraicas junto al borde | no aplica | recortado | sí, en `lienzo-geometrico`: polígono, recortes punteados, región punteada, cota con llave y rótulos |
| Ap2 p. 179 | Ej. 6 | cilindro con un cilindro chato y más angosto encima | frontal con tapa elíptica | 2 numéricas con flecha doble (altura y diámetro) | sí, el arco de atrás de la base | apilado coaxial | sí, con las medidas en llave. No: flecha doble, texto señalado, sombreado |
| Ap2 p. 179 | Ej. 7 | dos cilindros, macizo y con vaciado coaxial | frontal con tapa elíptica | 4 (dos alturas, radio, grosor) | sí, el vaciado | hueco, y separados antes y después, con flecha | el cilindro macizo sí. No: el vaciado, el grosor, la flecha entre figuras |
| Ap2 p. 180 | Ej. 8 | cilindro hueco acostado | eje horizontal | 3 verbales con flecha | sí | hueco | no: eje horizontal, hueco, eje de simetría |
| Ap2 p. 180 | Ej. 9 | cilindro | frontal con tapa elíptica | 2 algebraicas junto a segmentos interiores (la altura del centro de la base al de la tapa, el radio en la base) | sí, el arco de atrás de la base | no | el cilindro sí, con el radio sobre la tapa. No: altura interior punteada, radio en la base, marca de ángulo recto |
| Ap2 p. 181 | Ej. 11 | paralelepípedo | caballera con la profundidad arriba a la izquierda | 3 numéricas con flecha doble | no se dibujan | no | la caja sí, con la profundidad a la derecha y las cotas con llave. No: profundidad a la izquierda, flecha doble |
| Ap2 p. 182 | Ej. 13 | dos cilindros coaxiales apilados, el de arriba más angosto | frontal con tapa elíptica | 2: altura total de la pila y diámetro de arriba | no se dibujan | apilado | sí, con el diámetro. No: la altura total de la pila en una sola cota |
| Ap2 p. 182 | Ej. 14 | tres cilindros coaxiales acostados | eje horizontal | 6 numéricas con flecha doble | no se dibujan | adosado coaxial | no: eje horizontal, textos señalados, sombreado |
| Ap2 p. 183 | Ej. 15 | dos cajas, de base cuadrada y rectangular | axonométrica | 2 algebraicas junto a la arista vertical; vértices con letras | alambre, continuas | separados | las dos cajas lado a lado sí, en caballera. No: vista axonométrica, vértices con letras, vectores, texturas |
| Ap2 p. 218 | Reforzamiento 5, ej. 4 | dos cilindros | frontal con tapa elíptica | 3 algebraicas con flecha doble (dos diámetros, altura del líquido) | sí, el arco de atrás de la base | separados | los dos cilindros con sus diámetros sí. No: líquido hasta un nivel, líneas guía, altura del líquido |
| Ap2 p. 219 | Reforzamiento 5, ej. 5 | cubo | red dentro de una cuadrícula | ninguna | no aplica (pliegues punteados) | no | sí, en `lienzo-geometrico`: cuadrícula, región y segmentos punteados |

Sin figura (7): Ejemplo N°3 (p. 175); Ej. 1, 2 y 3 (p. 177); Ej. 10 y 12 (p. 181); Reforzamiento 5 ej. 7 (p. 220). La única figura de solución de la unidad es la del Ejemplo N°1 (S-Ap2 p. 132).

Tres figuras de UC tienen la misma forma que una de DEMRE: el Ejemplo N°1 figura 2 con 2026 regular n.º 47 (la U), el Ejemplo N°2 con 2024 invierno n.º 45 (los bloques) y el Ejemplo N°4 con 2024 regular n.º 47 (los dos cilindros). Se cuentan, pero no son evidencia independiente.

### UC, teoría y otros capítulos (no son problemas)

- Teoría del cap. 34 (pp. 170-173), 12 figuras: 6 en caballera con las ocultas punteadas; 3 redes (cubo y paralelepípedo en cruz, cilindro con dos círculos tangentes al rectángulo); cuerpos fuera del temario de la unidad (prismas triangular, pentagonal y hexagonal, pirámide, esfera, cono); 2 con la diagonal espacial punteada; 1 cilindro con su eje y el rectángulo que lo genera achurado.
- Otros capítulos, 11 figuras: 6 en caballera, 4 ilustraciones y 1 frontal; 1 con ocultas punteadas; 3 con cuerpos fuera del temario (láminas y perfiles en U).

## Umbral aplicado

DEMRE / UC por problema, y la decisión.

| rasgo | DEMRE / UC | decisión |
|---|---|---|
| caja o cubo en caballera, profundidad arriba a la derecha | 1 / 3 (4 con la ilustración del Ejemplo N°2) | se construye |
| cilindro de eje vertical con tapa elíptica | 2 / 5 (6 con la ilustración del Ejemplo N°4) | se construye |
| cilindro acostado | 0 / 2 | no |
| vista isométrica o axonométrica | 1 / 1 | pasa el umbral, pero la proyección firmada es la caballera del tier gratis: no |
| profundidad arriba a la izquierda | 0 / 1 | no |
| aristas ocultas dibujadas | poliedros 0 / 0; cilindros 0 / 5 | por defecto se dibujan; `ocultas: false` las apaga (DEMRE 0 de 8) |
| apilado de cilindros coaxiales, el de arriba más angosto | 1 / 2 | se construye |
| cajas adosadas o apiladas que se leen como un cuerpo | 1 / 2 | se construye |
| juntas visibles entre cajas | 1 / 2 | se construye (`juntas: true`) |
| cuerpos separados lado a lado | 1 / 4 | se construye, de una sola familia |
| hueco con espesor | 1 (prisma, fuera del temario) / 2 (cilindros) | no |
| cuerpo dentro de otro | 0 / 0 | no |
| cota con llave | 3 / 2 | se construye |
| rótulo junto a la arista, sin llave | 1 / 4 | se construye (`llave: false`) |
| flecha doble con líneas de extensión | 0 / 6 | no: la misma medida va con llave o sin llave |
| diámetro de cilindro | 1 / 5 | se construye |
| radio de cilindro | 0 / 2 | bajo el umbral; se construye igual, como segmento sobre la tapa: el tier gratis lo dibuja así y el catálogo tiene `confunde-radio-con-diametro-cilindro` |
| altura total de una pila en una cota | 0 / 1 | no |
| rótulo señalado con flecha | 1 / 3 | pasa; no se construye: nombra una pieza que el enunciado puede nombrar |
| caras sombreadas | 1 / 3 | pasa; no se construye: es decoración, y el dibujo de líneas de 2026 n.º 47 no la usa |
| flecha entre figuras o secuencia de etapas | 2 / 3 | pasa; no se construye: exige varias figuras en una |
| cuerpo en una alternativa | 0 / 0 | no |
| vértices con letras | 0 / 1 | no |
| líquido hasta un nivel | 0 / 1 | no |
| diagonal espacial | 0 / 0 (solo teoría) | no |
| red de cuerpo | 1 / 3 | va en `lienzo-geometrico` |

## Redes sobre el lienzo

Las seis redes del inventario (cruz de cubo, cruz de paralelepípedo y red de cilindro de la teoría; escalón de cubo, plantilla con esquinas recortadas y red en cuadrícula de los problemas) se arman con lo que `lienzo-geometrico` ya tiene: polígonos, circunferencias, segmentos punteados, cota con llave, rótulo sin cota, cuadrícula y regiones rayadas o punteadas. No se agrega ningún campo. Lo único que no se puede es la composición de 2026 regular n.º 47 y del Ejemplo N°1: red, flecha de bloque y cubo armado en una misma figura. Un ítem tiene una sola figura y una figura tiene un solo tipo; el ítem que lo necesite lleva una de las dos al texto.
