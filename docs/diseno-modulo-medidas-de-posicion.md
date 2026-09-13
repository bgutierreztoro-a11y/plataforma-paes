# Diseño del módulo: Medidas de posición

**Id de tema:** `medidas-de-posicion`. Eje: Probabilidad y estadística (módulo #15 de `docs/mapa-modulos-m1.md`). **`moduloId` de los archivos de contenido:** `medidas-de-posicion`, el id de tema, con catálogo canónico en `content/errores/medidas-de-posicion.json` (el slug del DAG, `medidas-posicion`, quedó fuera de la migración del 2026-09-13; ver `docs/pendientes.md`).

**Verificación de colisión: pendiente.** Misma situación que el módulo 14: producción sin PARADA, dominios elegidos por exclusión contra `content/` y los descartados previos, palabras clave al final para que Benja corra `scripts/consultar-fuentes.mjs` fuera de sesión.

Descriptores del temario (`docs/temario-demre-m1-2027.md:124-126`), citados textual:

```
- Cuartiles y percentiles de uno o más grupos de datos.
- Diagrama de cajón para representar distribución de datos.
- Problemas que involucren medidas de posición en diversos contextos.
```

Fuera de alcance: desviación estándar, varianza, histogramas, moda, reglas de probabilidad.

---

## Objetivo del módulo

Que el estudiante ordene un conjunto de datos, encuentre la mediana y los cuartiles con una convención fija, calcule y lea percentiles, construya y lea un diagrama de cajón (cada tramo tiene el 25 % de los datos aunque mida distinto), compare dos grupos por sus cajones sobre la misma escala y ubique un dato individual dentro de un grupo ("sobre el percentil 90" significa que el 90 % quedó bajo él).

Lo que el módulo aporta de nuevo al eje: el módulo 14 resumía con un número (el promedio); este reparte los datos en posiciones y muestra la dispersión, que el promedio esconde.

## Orden y títulos de las lecciones (decisión registrada)

`docs/mapa-modulos-m1.md` declaraba los ids en el orden `posicion-donde-quedaste-tu`, `posicion-partir-en-cuatro`, `posicion-caja-que-resume`. El diseño firmado va cuartiles → percentiles y cajón → uno o más grupos en contexto, y cada slug calza con una lección: `posicion-partir-en-cuatro` es la de cuartiles (repartir 12 datos en cuatro grupos), `posicion-caja-que-resume` es la de percentiles y cajón, y `posicion-donde-quedaste-tu` es la de posición relativa de un dato en contexto. Ids sin renombrar; `lecciones` reordenado en `lib/modulos.ts`; títulos alineados con los descriptores del temario, mismo criterio que el módulo 14.

| Posición | id | Título |
|---|---|---|
| L1 | `posicion-partir-en-cuatro` | Cálculo de cuartiles en conjuntos de datos |
| L2 | `posicion-caja-que-resume` | Percentiles y diagrama de cajón |
| L3 | `posicion-donde-quedaste-tu` | Problemas que involucren medidas de posición en diversos contextos |

Cierre: `cierre-medidas-de-posicion`.

## Prerrequisitos reales, ya cubiertos

- `datos-leer-antes-de-calcular` y `datos-numero-que-representa` (módulo #14): frecuencia relativa como porcentaje del total, promedio.
- `enteros-operar-y-ordenar` (módulo #1): ordenar números.

---

## Convenciones del módulo (las que usa este curso, nombradas así en las lecciones)

- Mediana: dato central; con n par, promedio de los dos centrales.
- Cuartiles: Q2 es la mediana; Q1 y Q3 son las medianas de las dos mitades, y con n impar la mediana no entra en ninguna. Es `cuartiles()` de `lib/estadistica.ts`.
- Percentil k: posición p = k · n / 100; si p es entero, promedio de los datos en las posiciones p y p + 1; si no, el dato en la posición ⌈p⌉. Es `percentil()`.
- Todo ítem que pida Q1 o Q3 usa n en {8, 12, 16, 20}, y se verifica con `node -e` que `cuartiles()` y `cuartilesIncluyendo()` dan lo mismo (con n par coinciden siempre). Todo ítem que pida un percentil se verifica con `percentil()` y `percentilAlternativo()`: coinciden cuando k · n / 100 no es entero, así que los percentiles de los ítems son P70, P80, P90 sobre n = 12 o 16, nunca P25/P50/P75 sobre n múltiplo de 4 (ahí se pide el cuartil).
- Datos enteros. En el enunciado vienen ordenados solo desde que la lección pasó por "ordenar" (L1 paso `generalizacion` en adelante, L2, L3 y cierre); antes vienen desordenados a propósito.
- Cajones siempre con los cinco valores rotulados; dos cajones comparados siempre sobre la misma escala (`DiagramaCajon` con dos `cajones` en un bloque). Dos bloques separados tienen escalas distintas: eso se usa una sola vez, a propósito, en L3 para mostrar el error.
- Visual en un ítem solo cuando el cajón ES el estímulo (leer un tramo, comparar dos grupos); nunca cuando rotula el valor que se pide.

---

## Objetivos por lección y progresión conceptual

**1. L1 `posicion-partir-en-cuatro`, Cálculo de cuartiles en conjuntos de datos.**

*Dominio:* tiempos, en segundos, de resolver un cubo de tres por tres, de una persona que registra sus intentos.

*Objetivo:* ordenar; mediana con n par e impar; Q1 y Q3 como medianas de las mitades con la convención del curso; qué significa "el 25 % de los datos está bajo Q1"; rango intercuartil como ancho del 50 % central.

*Concepto clave:* los cuartiles son cortes en la lista ordenada, no fracciones del rango de valores.

*Descubrimiento:* 12 tiempos ordenados (22, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35, 38) repartidos en cuatro grupos de 3. El estudiante ubica los tres cortes (entre 25 y 26, entre 28 y 29, entre 31 y 33) y calcula cada uno como el promedio de los vecinos: 25,5; 28,5; 32. El nombre "cuartil" aparece después.

*Contraste P2 (paso `consolidacion`):* "Mucha gente calcula la mediana con la lista tal como viene. Falla porque el dato del medio de una lista desordenada es cualquiera. Lo que funciona es ordenar primero." Se nombran además confundir mediana con promedio (confunde-mediana-con-promedio) y tomar Q1 como mínimo más un cuarto del rango (toma-cuartil-como-fraccion-del-rango).

*Visual:* barras de los 12 tiempos en orden (`descubrimiento`), y el primer cajón del módulo, sin nombrarlo todavía, en `generalizacion` (los cinco valores del conjunto de 8).

*Pregunta abierta con que cierra, que resuelve L2:* ¿y si en vez de cuatro partes quisieras saber dónde queda el 90 %? ¿Y se puede dibujar todo esto?

**2. L2 `posicion-caja-que-resume`, Percentiles y diagrama de cajón.**

*Dominio:* pasos diarios registrados por una pulsera durante 16 días, de dos personas (A y B).

*Objetivo:* percentil k como el valor bajo el cual queda el k % de los datos; Q1 = P25, Q2 = P50, Q3 = P75; construir el cajón desde el resumen de cinco números; leer un cajón: cada tramo tiene el 25 % de los datos aunque mida distinto.

*Concepto clave:* el largo de un tramo del cajón es dispersión, no cantidad.

*Descubrimiento:* dos cajones con la misma cantidad de datos (16 y 16) y la misma mediana (6.900), con tramos de distinto largo. El estudiante cuenta los datos de cada tramo en las dos listas y descubre que siempre son 4, aunque en B el bigote derecho mida más del doble.

*Contraste P2 (paso `consolidacion`):* "Mucha gente lee un bigote largo como 'más días'. Falla porque cada tramo del cajón tiene el 25 % de los datos, siempre; lo largo dice que esos 4 días están más repartidos. Lo que funciona es contar tramos, no medir largos." Se nombran además leer la caja como el 50 % de la escala (lee-caja-como-valores-posibles) y poner la mediana al centro de la caja (ubica-mediana-en-centro-de-caja).

*Visual:* dos cajones sobre la misma escala (`curiosidad`, `descubrimiento`, `consolidacion`), cajón de un conjunto de 8 para construir (`practica`).

*Pregunta abierta con que cierra, que resuelve L3:* con dos grupos en la misma escala, ¿cómo se decide cuál "es mejor"? ¿Y dónde quedas tú?

**3. L3 `posicion-donde-quedaste-tu`, Problemas que involucren medidas de posición en diversos contextos.**

*Dominio:* club de atletismo con dos sedes; salto largo en centímetros (16 atletas por sede); una prueba física con puntaje; una carrera de 100 metros donde menor tiempo es mejor.

*Objetivo:* comparar dos grupos por sus cajones sobre la misma escala; decidir con evidencia (mediana, rango intercuartil, extremos); posición relativa de un dato ("sobre el percentil 90"); percentil de un dato dentro de un grupo.

*Concepto clave:* la posición de un dato se mide contra el grupo, no contra la escala ni contra un puntaje.

*Descubrimiento:* con las dos listas ordenadas, el estudiante ubica un salto de 390 cm en la sede norte: 12 de 16 quedaron en o bajo él, 75 %. Repite con otros dos saltos y descubre que el percentil de un dato es su posición relativa, y que "está sobre el percentil 90" dice cuántos quedaron abajo, no cuánto mide.

*Contraste P2 (paso `consolidacion`):* "Mucha gente lee 'percentil 90' como 90 % de aciertos o 90 puntos. Falla porque el percentil no mide cuánto sacaste sino cuántos quedaron bajo ti. Lo que funciona es preguntarse qué porcentaje del grupo está abajo." Se nombran además concluir sobre el promedio desde la mediana (concluye-promedio-desde-mediana) y comparar cajones en escalas distintas (compara-cajones-en-escalas-distintas).

*Visual:* dos cajones sobre la misma escala (`curiosidad`, `generalizacion`), los mismos dos cajones en bloques separados con escalas distintas (`practica`, para el error), cajón con un dato marcado (`aplicacion`).

**Un descubrimiento por lección:** L1 fija "ordenar y cortar la lista"; L2 fija "cada tramo tiene el 25 %, el largo es dispersión"; L3 fija "el percentil es posición dentro del grupo". El cierre integra los tres.

---

## Catálogo de errores (definitivo, `content/errores/medidas-de-posicion.json`, 15 ids)

Caso base de L1: tiempos 31, 24, 28, 35, 22, 27, 33, 26, 30, 25, 29, 38 (ordenados 22 … 38; mediana 28,5; Q1 25,5; Q3 32; promedio 29; rango 16). Caso base de L2: persona A, 16 días, resumen 4.200, 6.200, 6.900, 7.700, 9.200 (rango 5.000); persona B, 3.300, 6.500, 6.900, 7.300, 9.700. Caso base de L3: sede norte, salto de 390 cm en la posición 12 de 16.

| id | Nace en | Mecanismo | Produce sobre el caso base |
|---|---|---|---|
| `calcula-cuartiles-sin-ordenar` | L1 | Calcular mediana o cuartiles sobre la lista en el orden en que viene, sin ordenarla. | (27 + 33) / 2 = 30 en vez de 28,5. |
| `confunde-mediana-con-promedio` | L1 | Entregar el promedio donde se pide la mediana o un cuartil, o al revés. | 348 / 12 = 29 en vez de 28,5. |
| `toma-cuartil-como-fraccion-del-rango` | L1 | Tomar un cuartil o percentil como fracción del rango de valores (mín + k % · (máx − mín)) en vez de una posición en los datos. | 22 + 0,25 · 16 = 26 en vez de 25,5; Q3 = 34 en vez de 32. |
| `toma-dato-central-sin-promediar` | L1 | Con n par, tomar uno de los dos datos centrales como mediana en vez de promediarlos. | 28 (o 29) en vez de 28,5. |
| `confunde-rango-con-intercuartil` | L1 | Entregar máx − mín (rango) donde se pide Q3 − Q1, o al revés. | 16 en vez de 6,5. |
| `lee-cuartil-como-posicion-entera` | L1 | Tomar el dato en la posición k · n / 100 truncada (n / 4, 3n / 4) sin promediar con el siguiente cuando corresponde. | Q1 = 25 (posición 3) en vez de 25,5; P90 con n = 16 leído en la posición 14 en vez de la 15. |
| `lee-bigote-largo-como-mas-datos` | L2 | Leer el largo de un tramo del cajón como cantidad de datos: un bigote largo como "más datos", una caja angosta como "menos". | "B tiene más días con muchos pasos porque su bigote derecho es más largo." |
| `lee-caja-como-valores-posibles` | L2 | Leer la caja (o un tramo) como porcentaje de la escala de valores en vez del porcentaje de los datos. | Caja de A: (7.700 − 6.200) / 5.000 = 30 % en vez de 50 %. |
| `ubica-mediana-en-centro-de-caja` | L2 | Ubicar la mediana en el punto medio geométrico de la caja, (Q1 + Q3) / 2. | (6.200 + 7.700) / 2 = 6.950 en vez de 6.900. |
| `cuenta-datos-sobre-en-vez-de-bajo` | L2 | Contar los datos que quedan sobre el valor, en vez de bajo él, al calcular su percentil (entrega 100 − p), o leer el percentil k desde arriba. | 4 / 16 = 25 % en vez de 75 %; P90 de A leído como P10 = 5.400. |
| `confunde-percentil-con-valor` | L2 | Confundir el percentil con el valor del dato o con su posición: "percentil 90" como 90 cm, o "percentil 9" para el dato que ocupa la posición 9. | "Percentil 12" para el salto de la posición 12. |
| `lee-percentil-como-porcentaje-de-aciertos` | L3 | Leer "percentil 90" como 90 % de aciertos, 90 puntos o 90 % del máximo. | "Acertó 36 de 40 preguntas." |
| `concluye-promedio-desde-mediana` | L3 | Concluir sobre el promedio a partir de la mediana o del cajón. | "Las dos sedes tienen el mismo promedio porque tienen la misma mediana." |
| `compara-cajones-en-escalas-distintas` | L3 | Comparar dos cajones dibujados en escalas distintas por su largo visual. | "La caja de sur es más ancha que la de norte" cuando su rango intercuartil es 26 contra 46. |
| `invierte-lectura-cuando-menor-es-mejor` | L3 | Con una variable donde menor es mejor (tiempos), leer un percentil alto como buen desempeño, o uno bajo como malo. | "Percentil 20 en una carrera: quedó entre los más lentos." |

**Errores sin id.** Los conceptuales sin resultado reproducible ("no se puede saber porque no dice cuántos datos hay") van con feedback artesanal y sin `errorCatalogado`, solo en bloques `seleccion`.

---

## Plan de ítems

### L1, `posicion-partir-en-cuatro`

Números reservados (segundos): 12 tiempos 31, 24, 28, 35, 22, 27, 33, 26, 30, 25, 29, 38; 8 tiempos 41, 36, 45, 39, 50, 38, 43, 48 (mediana 42, Q1 38,5, Q3 46,5, rango intercuartil 8, promedio 42,5); 20 tiempos ordenados 24, 25, 26, 27, 27, 28, 29, 29, 30, 30, 31, 31, 32, 33, 34, 35, 36, 37, 38, 40 (Q1 27,5, mediana 30,5, Q3 34,5); 16 tiempos 33, 41, 28, 37, 45, 31, 39, 35, 48, 34, 30, 42, 36, 52, 38, 44 (Q1 33,5, mediana 37,5, Q3 43); consolidación: 23, 29, 26, 34, 22, 25, 31, 27 (Q3 30).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `posicion-l1-item-1` | resolver | baja | mediana de 44, 37, 51, 40, 55, 39, 46, 42, 48, 43 (n = 10) | 43,5 | 43 `toma-dato-central-sin-promediar`; 44,5 `confunde-mediana-con-promedio`; 47 `calcula-cuartiles-sin-ordenar` |
| `posicion-l1-item-2` | representar | media | Q1 de 19, 26, 22, 31, 24, 28, 20, 35, 23, 29, 27, 33 (n = 12) | 22,5 | 22 `lee-cuartil-como-posicion-entera`; 23 `toma-cuartil-como-fraccion-del-rango`; 25 `calcula-cuartiles-sin-ordenar` |
| `posicion-l1-item-3` | argumentar | alta | veredicto sobre "Q1 es el mínimo más un cuarto del rango" con 36, 38, 39, 41, 43, 45, 48, 50 | No: Q1 = 38,5 y 36 + 3,5 = 39,5 | Sí `toma-cuartil-como-fraccion-del-rango`; No, Q1 es 38 `lee-cuartil-como-posicion-entera`; No, Q1 es 42,5 (el promedio) `confunde-mediana-con-promedio` |

### L2, `posicion-caja-que-resume`

Números reservados (pasos): A = 4.200, 5.400, 5.800, 6.100, 6.300, 6.500, 6.700, 6.800, 7.000, 7.200, 7.400, 7.600, 7.800, 8.300, 8.700, 9.200 (P90 8.700, P10 5.400); B = 3.300, 4.500, 5.600, 6.400, 6.600, 6.700, 6.700, 6.800, 7.000, 7.100, 7.100, 7.200, 7.400, 8.000, 8.900, 9.700 (P90 8.900, P10 4.500); C (n = 8) = 5.100, 5.500, 6.000, 6.200, 6.400, 6.900, 7.300, 8.100 (5.750, 6.300, 7.100).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `posicion-l2-item-1` | resolver | baja | P90 de 3.800, 4.300, 4.700, 5.000, 5.400, 5.700, 6.000, 6.300, 6.600, 7.100, 7.700, 8.400 (n = 12) | 7.700 | 4.300 `cuenta-datos-sobre-en-vez-de-bajo`; 7.100 `lee-cuartil-como-posicion-entera`; 7.940 `toma-cuartil-como-fraccion-del-rango` |
| `posicion-l2-item-2` | representar | media | resumen de cinco números correcto de 4.900, 5.300, 5.600, 5.800, 6.100, 6.500, 7.200, 7.900 | 4.900, 5.450, 5.950, 6.850, 7.900 | mediana 6.150 `ubica-mediana-en-centro-de-caja`; Q1 5.300 y Q3 6.500 `lee-cuartil-como-posicion-entera`; Q1 5.650 y Q3 7.150 `toma-cuartil-como-fraccion-del-rango` |
| `posicion-l2-item-3` | argumentar | alta | dos cajones dibujados (A y B): veredicto sobre "B tuvo más días con muchos pasos porque su bigote derecho es más largo" | No: cada tramo tiene 4 días | Sí `lee-bigote-largo-como-mas-datos`; No, porque la caja de B es el 12,5 % de su escala `lee-caja-como-valores-posibles`; No, porque la mediana de B no está al centro de su caja `ubica-mediana-en-centro-de-caja` |

### L3, `posicion-donde-quedaste-tu`

Números reservados (cm): norte = 312, 325, 338, 344, 350, 357, 362, 368, 372, 377, 383, 390, 396, 405, 418, 433 (347, 370, 393; IQR 46; P90 418); sur = 330, 341, 349, 355, 359, 363, 366, 369, 371, 374, 378, 381, 385, 392, 401, 415 (357, 370, 383; IQR 26; P90 401); prueba física de 40 preguntas; carrera de 100 m.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `posicion-l3-item-1` | resolver | baja | percentil de un salto de 367 cm en 302, 318, 326, 335, 342, 349, 356, 361, 367, 374, 388, 402 | 75 | 9 `confunde-percentil-con-valor`; 25 `cuenta-datos-sobre-en-vez-de-bajo`; 65 `toma-cuartil-como-fraccion-del-rango` |
| `posicion-l3-item-2` | modelar | media | dos cajones dibujados (norte y sur): qué se puede afirmar con evidencia | misma mediana, sur más concentrada (IQR 26 contra 46) | norte con mayor promedio `concluye-promedio-desde-mediana`; norte con más atletas sobre 393 `lee-bigote-largo-como-mas-datos`; sur salta más lejos porque su caja es más angosta `compara-cajones-en-escalas-distintas` |
| `posicion-l3-item-3` | argumentar | alta | veredicto sobre "quedó sobre el percentil 90 de la prueba, así que acertó al menos 36 de 40" | No: el percentil habla del grupo, no del puntaje | Sí `lee-percentil-como-porcentaje-de-aciertos`; No, sacó 90 puntos `confunde-percentil-con-valor`; No, el 90 % lo superó `cuenta-datos-sobre-en-vez-de-bajo` |

### Cierre, `cierre-medidas-de-posicion` (8 ítems)

Dominios: sacos de papas de un productor; tiempos de cubo (dominio de L1, números nuevos); pasos diarios (dominio de L2, números nuevos); salto largo (dominio de L3, números nuevos); mochilas escolares en kilos; minutos de espera de la micro en dos paraderos; corrida de 10 kilómetros.

| ítem | habilidad | dificultad | cubre | correcta | distractores (id) |
|---|---|---|---|---|---|
| `cierre-posicion-1` | resolver | baja | mediana de 46, 52, 49, 58, 47, 51, 53, 48, 50, 54 kg (n = 10) | 50,5 | 49 `calcula-cuartiles-sin-ordenar`; 50 `toma-dato-central-sin-promediar`; 50,8 `confunde-mediana-con-promedio` |
| `cierre-posicion-2` | resolver | baja | Q3 de 19, 24, 21, 27, 18, 23, 30, 25 s (n = 8) | 26 | 25 `lee-cuartil-como-posicion-entera`; 26,5 `calcula-cuartiles-sin-ordenar`; 27 `toma-cuartil-como-fraccion-del-rango` |
| `cierre-posicion-3` | modelar | media | rango intercuartil de 12 días de pasos ordenados (3.900 … 8.100) | 1.750 | 1.700 `lee-cuartil-como-posicion-entera`; 2.100 `toma-cuartil-como-fraccion-del-rango`; 4.200 `confunde-rango-con-intercuartil` |
| `cierre-posicion-4` | modelar | media | P80 de 12 saltos ordenados (320 … 410 cm) | 386 | 336 `cuenta-datos-sobre-en-vez-de-bajo`; 379 `lee-cuartil-como-posicion-entera`; 392 `toma-cuartil-como-fraccion-del-rango` |
| `cierre-posicion-5` | representar | media | resumen de cinco números de 41, 48, 44, 52, 39, 46, 50, 43 kg | 39, 42, 45, 49, 52 | mediana 45,5 `ubica-mediana-en-centro-de-caja`; 41 y 48 `lee-cuartil-como-posicion-entera`; 42,25 y 48,75 `toma-cuartil-como-fraccion-del-rango` |
| `cierre-posicion-6` | representar | media | cajón dibujado (mochilas 2,4; 3,6; 4,2; 5,0; 6,4 kg): porcentaje que pesa más de 5,0 kg | 25 % | 35 % `lee-caja-como-valores-posibles`; 50 % `lee-bigote-largo-como-mas-datos`; 75 % `cuenta-datos-sobre-en-vez-de-bajo` |
| `cierre-posicion-7` | argumentar | alta | dos cajones dibujados (paraderos A: 2, 5, 8, 12, 22; B: 4, 7, 8, 9, 14): veredicto sobre "en B la espera es más predecible" | Sí: misma mediana, IQR 2 contra 7 | Sí, y el promedio es igual `concluye-promedio-desde-mediana`; No, A tiene más esperas cortas `lee-bigote-largo-como-mas-datos`; No, A concentra más datos (35 % contra 20 % de la escala) `lee-caja-como-valores-posibles` |
| `cierre-posicion-8` | argumentar | alta | veredicto sobre "percentil 20 de los tiempos de la corrida: quedó entre los más lentos" | No: el 20 % fue más rápido, superó al 80 % | Sí `invierte-lectura-cuando-menor-es-mejor`; Sí, es como 20 de 100 `lee-percentil-como-porcentaje-de-aciertos`; No, llegó en el lugar 20 `confunde-percentil-con-valor` |

Matriz habilidad × dificultad del cierre: resolver baja ×2 (1, 2); modelar media ×2 (3, 4); representar media ×2 (5, 6); argumentar alta ×2 (7, 8). Total: 2 baja, 4 media, 2 alta; las cuatro habilidades, dos veces cada una. Cobertura por lección: L1 en 1, 2, 3 y 5; L2 en 4, 5 y 6; L3 en 7 y 8.

Verificación de convenciones, con `node -e` sobre `lib/estadistica.ts`: en los ítems 2, 3, 4 y 5 del cierre, en los ítems 2 y 3 de L1 y en los ítems 1 y 2 de L2, `cuartiles()` y `cuartilesIncluyendo()` coinciden (todos con n par); en L2 ítem 1 (n = 12, k = 90, p = 10,8), L3 ítem 1 (percentil de un dato) y cierre ítem 4 (n = 12, k = 80, p = 9,6), `percentil()` y `percentilAlternativo()` coinciden. La salida cruda va en el informe final de la sesión.

---

## Lista de prohibidos

- Contextos gastados: notas de un curso, edades, estaturas, goles. La única "prueba con puntaje" del módulo existe para nombrar el error de leer percentil como porcentaje de aciertos, y no entrega datos de ningún curso.
- Dominios ya usados en el corpus: buceo y piscina (COLISIÓN registrada en cuerpos), bicicletas, camping, huerto, museo, biblioteca, laguna, parque nacional, robótica, videojuego, feria, kiosco, bus interurbano. Por eso los tiempos son de un cubo y no de natación, los pasos son de una pulsera y no de una cicletada, y la carrera es una corrida de 10 km y no de montaña.
- n impar en ítems de cuartil; percentiles con k · n / 100 entero; cajones sin alguno de los cinco rótulos; dos cajones en escalas distintas fuera del bloque de L3 que enseña el error.
- Rotular en un visual el valor que el ítem pide.

## Palabras clave para `consultar-fuentes.mjs` (las corre Benja)

```
node scripts/consultar-fuentes.mjs "cubo" "cubo de tres por tres" "cubo magico" "segundos" "intentos" "pasos" "pasos diarios" "pulsera" "reloj" "atletismo" "salto largo" "sede" "club" "centimetros" "prueba fisica" "carrera de 100 metros" "sacos" "papas" "productor" "mochila" "mochilas" "paradero" "micro" "espera" "corrida" "10 kilometros" "percentil" "cuartil" "cajon"
```

## Estado de las firmas

Firmado por adelantado por Benja (brief de la sesión 2026-09-13): JSON de contenido, extensiones aditivas de schema, catálogo canónico y commits. Pendiente de Benja: la consulta de colisión con las palabras clave de arriba y las dos auditorías en hilos aislados (`/clear`) antes de cualquier `git push`.
