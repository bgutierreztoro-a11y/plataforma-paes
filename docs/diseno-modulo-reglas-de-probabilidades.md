# Diseño del módulo: Reglas de las probabilidades

**Id de tema:** `reglas-de-probabilidades`. Eje: Probabilidad y estadística (módulo #16 de `docs/mapa-modulos-m1.md`, el último del free tier). **`moduloId` de los archivos de contenido:** `reglas-de-probabilidades`, el id de tema, con catálogo canónico en `content/errores/reglas-de-probabilidades.json` (el slug del DAG, `reglas-probabilidad`, quedó fuera de la migración del 2026-09-13, igual que `tablas-graficos` y `medidas-posicion`; ver `docs/pendientes-estadistica-14-15.md`).

**Verificación de colisión: pendiente.** Misma situación que los módulos 14 y 15: producción sin PARADA, dominios elegidos por exclusión contra `content/` y los descartados de los docs de diseño anteriores, palabras clave al final para que Benja corra `scripts/consultar-fuentes.mjs` fuera de sesión.

Descriptores del temario (`docs/temario-demre-m1-2027.md:130-131`), citados textual:

```
- Problemas que involucren probabilidad de un evento en diversos contextos.
- Problemas que involucren la regla aditiva y multiplicativa de probabilidades en diversos contextos.
```

Fuera de alcance (no se construye): probabilidad condicional como tema o con notación P(A|B), combinatoria formal (factorial, permutaciones, combinaciones, C(n, k)), variable aleatoria, distribución binomial o normal, esperanza. Lo "sin reposición" se trabaja SOLO como árbol donde el total y los favorables cambian de etapa a etapa, sin nombrarlo condicional.

---

## Objetivo del módulo

Que el estudiante reconozca un experimento aleatorio y su espacio muestral, calcule la probabilidad de un evento como casos favorables sobre casos posibles cuando los resultados son igualmente probables, la exprese como fracción, decimal o porcentaje en la escala de 0 a 1, use el complemento, distinga la probabilidad frecuencial de la teórica, combine eventos con "o" (regla aditiva, con y sin casos comunes, incluida la tabla de doble entrada) y con "y luego" (regla multiplicativa, con etapas independientes y sin reposición, con el diagrama de árbol), y resuelva "al menos uno" por complemento o sumando caminos.

Lo que el módulo aporta de nuevo al eje: los módulos 14 y 15 describían datos ya ocurridos; este cuantifica lo que puede pasar, y su herramienta central es enumerar antes de calcular.

## Orden y títulos de las lecciones (decisión registrada)

`docs/mapa-modulos-m1.md` declara los ids `probabilidad-posible-y-probable`, `probabilidad-esto-o-esto-otro`, `probabilidad-antes-de-apostar`, en ese orden, con títulos «Probabilidad de un evento», «Regla aditiva y multiplicativa» y «Problemas con reglas de probabilidad en contexto». El diseño firmado reparte el segundo descriptor en dos lecciones (aditiva → multiplicativa), y cada slug calza con una: `probabilidad-posible-y-probable` es la de probabilidad de un evento, `probabilidad-esto-o-esto-otro` es la de la regla aditiva ("esto o esto otro"), y `probabilidad-antes-de-apostar` es la de la regla multiplicativa (decidir antes de jugar dos etapas). Ids sin renombrar y sin reordenar; los títulos pasan al nombre técnico de cada regla, alineados con el descriptor del temario y con el contenido real de cada lección, mismo criterio que los módulos 14 y 15 (`docs/mapa-modulos-m1.md`: «El título es el nombre técnico DEMRE»). Los títulos lúdicos del brief de la sesión («Lo que puede pasar y lo que suele pasar», «O una cosa o la otra», «Primero esto, después esto otro») quedan como nombre de trabajo de L1, L2 y L3 en este documento y no van al JSON.

| Posición | id | Título |
|---|---|---|
| L1 | `probabilidad-posible-y-probable` | Probabilidad de un evento |
| L2 | `probabilidad-esto-o-esto-otro` | Regla aditiva de probabilidades |
| L3 | `probabilidad-antes-de-apostar` | Regla multiplicativa de probabilidades |

Cierre: `cierre-reglas-de-probabilidades` (el mapa no declaraba cierre para el #16; convención `cierre-<id de tema>`).

## Prerrequisitos reales, ya cubiertos

- `enteros-operar-y-comparar` (módulo #1, prerrequisito del DAG): fracciones, comparar por valor, sumar y multiplicar fracciones.
- `porcentaje-concepto` (módulo #2): fracción ↔ decimal ↔ porcentaje.
- `datos-leer-antes-de-calcular` (módulo #14): frecuencia relativa y tabla de doble entrada como conteo.

---

## Convenciones del módulo (las que usa este curso, nombradas así en las lecciones)

- Toda probabilidad se escribe como fracción irreducible, y dentro de un mismo ítem todas las alternativas van en el mismo formato (todas fracción, o todas porcentaje, o todas decimal; nunca mezcladas). Alternativas numéricas en orden creciente por VALOR (comparado con `comparar` de `lib/probabilidad.ts`), no por numerador.
- Espacios muestrales enumerables de tamaño ≤ 36; totales de grupo o urna ≤ 20 en las lecciones y ≤ 25 en el cierre (audífonos, canciones); sin reposición máximo 2 etapas (3 solo en el bloque de práctica de L3, con dos ramas por nodo).
- Para cada ítem y cada bloque `pregunta` o `seleccion` con alternativas de probabilidad se verifica con `node -e` que `distintosEnValor(correcta + distractores)` es `true` (3/6 y 1/2 cuentan como iguales); ningún distractor menor que 0 ni mayor que 1 en alternativas numéricas (en un veredicto, la cifra mayor que 1 es la afirmación que se juzga, no una alternativa numérica).
- Frecuencial siempre con número de ensayos explícito (40 días, 200 lanzamientos, 400 lanzamientos).
- Diagrama de árbol: la probabilidad de cada rama viene escrita en el JSON (nunca la calcula el componente) y las hermanas de cada nodo suman exactamente 1 (`motivoRechazoDatosProbabilidad`); en un ítem, el árbol muestra solo las ramas, nunca la probabilidad del camino que se pide. Cuadrícula: celdas marcadas con trama y contador declarado; en un ítem, sin marcas ni contador cuando eso sea la respuesta.
- Objetos de azar gastados (dado, moneda, bolitas en bolsa, naipes, ruleta): solo en pasos de lección como mecanismo canónico (dos monedas en el descubrimiento de L1, dos dados en la práctica de L1 y en la generalización de L2). Ningún ítem de lección ni de cierre los usa. «Bolitas» no aparece en ningún lugar del módulo (objeto de `ecuaciones-lineales`).
- Sin `auditoria.constante`: ninguna lección gira en torno a una cifra única; el chequeo de filtración queda omitido y visible en `npm run auditar`.

---

## Objetivos por lección y progresión conceptual

**1. L1 `probabilidad-posible-y-probable`, Probabilidad de un evento (nombre de trabajo: lo que puede pasar y lo que suele pasar).**

*Dominio:* un curso de fotografía de 12 personas que sortea el orden de exposición sacando un papel numerado del 1 al 12 de una caja; dos monedas (descubrimiento); dos dados (práctica); un semáforo peatonal observado durante 40 días (frecuencial).

*Objetivo:* experimento aleatorio; resultados posibles (espacio muestral) y evento como parte de ellos; probabilidad = casos favorables / casos posibles cuando los resultados son igualmente probables; escala de 0 a 1 en fracción, decimal y porcentaje; evento imposible y seguro; complemento P(no A) = 1 − P(A); probabilidad frecuencial (frecuencia relativa tras muchos ensayos) frente a teórica, y por qué con pocos ensayos no coinciden.

*Concepto clave:* la probabilidad se calcula contando resultados igualmente probables; cuando no lo son (sumas, objetos asimétricos), hay que enumerar los pares o medir la frecuencia.

*Descubrimiento:* dos monedas, cara vale 1 punto y sello 0; la suma de puntos es 0, 1 o 2. El estudiante predice si los tres totales son igual de probables, después enumera los 4 pares en la cuadrícula 2 × 2 (celdas con la suma) y descubre que "1 punto" sale en 2 de los 4 pares y "0 puntos" y "2 puntos" en 1 cada uno: las sumas NO son igualmente probables. El nombre "casos favorables sobre casos posibles" aparece recién en `generalizacion`.

*Contraste P2 (paso `consolidacion`):* "Mucha gente reparte la probabilidad en partes iguales entre los resultados que puede nombrar (0, 1 o 2 puntos: un tercio cada uno). Falla porque los resultados igualmente probables son los pares, y 1 punto sale en dos pares. Lo que funciona es enumerar los pares antes de contar." Se nombran además dividir por los desfavorables (`divide-por-desfavorables`) y restar a 1 el conteo en vez de la fracción (`resta-conteo-a-uno-en-complemento`).

*Visual:* cuadrícula 2 × 2 de las dos monedas con la suma en cada celda (`descubrimiento`, sin marcas primero y con "1 punto" marcado después), cuadrícula 6 × 6 de dos dados con la suma en cada celda y sin marcas (`practica`).

*Pregunta abierta con que cierra, que resuelve L2:* ¿y si el evento es "esto o esto otro"? ¿Se suman las probabilidades?

**2. L2 `probabilidad-esto-o-esto-otro`, Regla aditiva de probabilidades (nombre de trabajo: o una cosa o la otra).**

*Dominio:* un edificio de 30 departamentos (orientación norte/sur × piso alto/bajo; balcón/sin balcón en la práctica) del que una app elige uno al azar para la inspección mensual; los números del 1 al 30 de esa misma app (aplicación y consolidación); dos dados (generalización).

*Objetivo:* eventos que no pueden ocurrir a la vez (excluyentes): P(A o B) = P(A) + P(B); eventos que sí pueden: restar lo contado dos veces, P(A o B) = P(A) + P(B) − P(A y B); tabla de doble entrada como herramienta de conteo; "al menos uno" y "ninguno" como complementos.

*Concepto clave:* "o" se cuenta sumando, pero lo que está en los dos lados se cuenta una sola vez.

*Descubrimiento:* con la tabla del edificio (norte 16: 9 alto y 7 bajo; sur 14: 6 alto y 8 bajo; alto 15, bajo 15), el estudiante suma "norte" + "piso alto" = 16 + 15 = 31, más que los 30 departamentos, y descubre que los 9 del norte en piso alto se contaron dos veces: 16 + 15 − 9 = 22. El nombre "A y B" (intersección) aparece después.

*Contraste P2 (paso `consolidacion`):* "Mucha gente suma P(A) + P(B) para 'A o B' y no mira si algo está en los dos. Falla porque lo común se cuenta dos veces, y hasta puede dar más que 1. Lo que funciona es sumar y restar lo que está en los dos." Se nombran además restar un producto cuando los eventos son excluyentes (`usa-producto-como-interseccion`), multiplicar en vez de sumar (`multiplica-en-vez-de-sumar`) y leer la fila equivocada de la tabla (`lee-fila-equivocada-en-tabla`).

*Visual:* tabla de doble entrada con totales (`descubrimiento`, `practica`), cuadrícula 6 × 6 de dos dados con "suma 5 o suma 9" marcado (excluyentes, 8 de 36) y con "6 en el primer dado o en el segundo" marcado (11 de 36, el (6, 6) una sola vez) en `generalizacion`.

*Pregunta abierta con que cierra, que resuelve L3:* ¿y si son dos experimentos seguidos, "primero esto y después esto otro"? ¿Se multiplican?

**3. L3 `probabilidad-antes-de-apostar`, Regla multiplicativa de probabilidades (nombre de trabajo: primero esto, después esto otro).**

*Dominio:* una banda escolar de 9 integrantes (3 de vientos, 6 de percusión) cuya app sortea día de ensayo (lunes a viernes) y sala (A, B, C), y sortea dos integrantes para tocar en un acto, con y sin repetir persona; tres días de ensayo con sección al azar (práctica); una caja de 7 cargadores de los que 2 no funcionan (consolidación).

*Objetivo:* dos experimentos independientes (o con reposición): P(A y luego B) = P(A) · P(B); sin reposición: la segunda etapa cambia porque el total y los favorables cambian; diagrama de árbol; combinar ramas ("una de cada", sumando los caminos que sirven); "al menos uno" vía complemento del camino "ninguno".

*Concepto clave:* "y luego" se calcula multiplicando, y en la segunda etapa se multiplica por lo que queda, no por lo que había.

*Descubrimiento:* el mismo sorteo de dos integrantes con reposición (puede repetirse la persona) y sin reposición, con los dos árboles a la vista. El estudiante compara la segunda etapa y descubre que sin reposición el denominador baja de 9 a 8 y el numerador de la clase extraída baja en uno: P(dos de vientos) = 3/9 · 2/8 = 1/12 y no 3/9 · 3/9 = 1/9.

*Contraste P2 (paso `consolidacion`):* "Mucha gente multiplica dos veces la misma razón aunque el primer sorteo saque a alguien del grupo. Falla porque en la segunda etapa quedan 8 y no 9, y de la sección extraída queda uno menos. Lo que funciona es escribir la segunda etapa con lo que queda." Se nombran además sumar en vez de multiplicar (`suma-en-vez-de-multiplicar-etapas`), bajar el total sin bajar los favorables (`baja-total-pero-no-favorables`) y olvidar el camino simétrico en "una de cada" (`olvida-camino-simetrico`).

*Visual:* cuadrícula 5 × 3 día × sala sin marcas (`problema`), dos árboles de dos etapas, con y sin reposición (`descubrimiento`), árbol sin reposición con los caminos "una de cada" resaltados y la probabilidad de cada camino escrita (`generalizacion`), árbol de tres etapas con dos ramas por nodo (`practica`), árbol sin reposición con las probabilidades de camino para "al menos uno" (`aplicacion`).

**Un descubrimiento por lección:** L1 fija "enumerar los pares antes de contar"; L2 fija "sumar y restar lo común"; L3 fija "la segunda etapa se escribe con lo que queda". El cierre integra los tres.

---

## Catálogo de errores (definitivo, `content/errores/reglas-de-probabilidades.json`, 23 ids)

Caso base de L1: 12 papeles numerados; 12 casilleros del segundo piso (del 25 al 36) entre 48 sorteados; 8 cupones con premio de 40; semáforo en verde 26 de 40 días; tapa de bebida boca arriba 130 de 200. Caso base de L2: edificio de 30 departamentos (norte 16: 9 alto, 7 bajo; sur 14: 6 alto, 8 bajo; balcón 18: 11 norte, 7 sur); 24 pulseras de entrada (verde 7, azul 12, naranja 5); lluvia 0,6 y 0,5. Caso base de L3: banda de 9 (3 vientos, 6 percusión); 4 colores × 5 figuras; 10 cápsulas (4 adhesivo, 6 figura); 8 delegados (2 de primero medio).

| id | Nace en | Mecanismo | Produce sobre el caso base |
|---|---|---|---|
| `divide-por-desfavorables` | L1 | Favorables sobre desfavorables (posibles − favorables) en vez de sobre los posibles. | 12/36 en vez de 12/48; 8/32 en vez de 8/40. |
| `asume-equiprobables-sin-enumerar` | L1 | Tratar como igualmente probables resultados que no lo son, sin enumerar los pares. | 1/3 para "1 punto" con dos monedas (es 1/2); 1/11 para suma 7 (es 1/6); 2/3 para "2 de 3 colores". |
| `suma-resultados-en-vez-de-multiplicar-total` | L1 | Total de pares = suma de los resultados de cada experimento en vez del producto. | 6/12 para suma 7 (6 + 6 = 12 en vez de 36); 1/8 para "viernes y C" (5 + 3). |
| `resta-conteo-a-uno-en-complemento` | L1 | P(no A) = 1 − conteo favorable en vez de 1 − P(A). | 1 − 4 = −3 para "no mayor que 8" (es 8/12). |
| `lee-conteo-como-porcentaje` | L1 | El conteo favorable escrito como porcentaje. | 8 % para 8 de 40 (20 %); 26 % para 26 de 40 días (65 %). |
| `usa-laplace-sin-equiprobabilidad` | L1 | 1/2 a cada uno de dos resultados solo porque son dos, en un objeto asimétrico. | 1/2 para la tapa (frecuencia 13/20); 1/2 para la chinche (3/8). |
| `espera-frecuencia-igual-a-teorica` | L1 | Exigir que pocos ensayos calcen exactamente con la probabilidad y concluir que el objeto está cargado. | 13 verdes justos en 20 días; 100 boca arriba justas en 200. |
| `cuenta-rango-restando-extremos` | L1 | Contar un tramo restando los extremos sin sumar uno. | 36 − 25 = 11 en vez de 12; 9 − 5 = 4 en vez de 5. |
| `confunde-evento-con-su-complemento` | L1 | Entregar P(A) donde se pide P(no A), o al revés. | 1/5 para "funciona" con 5 de 25 fallados (4/5); 5/8 para punta arriba (3/8). |
| `suma-sin-restar-interseccion` | L2 | P(A) + P(B) para "A o B" con casos comunes, sin restarlos. | 31 de 30 departamentos; 0,6 + 0,5 = 1,1. |
| `usa-producto-como-interseccion` | L2 | Restar P(A) · P(B) como "A y B", aunque los eventos sean excluyentes o dependan. | 253/576 para "verde o naranja" (es 1/2); 22/45 para "múltiplo de 3 o de 4" (es 1/2). |
| `multiplica-en-vez-de-sumar` | L2 | P(A) · P(B) donde se pide "A o B". | 1/900 para "el 12 o el 25" (es 2/30); 0,3 para "sábado o domingo". |
| `lee-fila-equivocada-en-tabla` | L2 | La celda o el total de la fila o columna que no corresponde al evento. | 7/30 (sur sin balcón) para "ni balcón ni sur" (5/30); restar 12 en vez de 6. |
| `divide-por-total-de-fila` | L2 | Dividir una celda por el total de su fila o columna en vez del total general. | 5/16 para "ni balcón ni sur" (5/30); 8/20 para "mañana y avanzado" (8/36). |
| `omite-ambos-en-al-menos-uno` | L2 | "Al menos uno" contado solo con "exactamente uno", sin los que cumplen los dos. | 10/36 para "un 6 en alguno de los dados" (es 11/36); 3/8 para "al menos un día de percusión" (7/8). |
| `resta-a-uno-un-solo-evento` | L2 | "Ninguno" (o "al menos uno") como complemento de un solo evento. | 1 − 16/30 = 14/30 para "ni norte ni alto" (8/30); 1 − 0,6 = 0,4. |
| `suma-en-vez-de-multiplicar-etapas` | L3 | P(A) + P(B) donde se pide que ocurran las dos etapas. | 8/15 para "viernes y C" (1/15); 9/20 para "rojo y estrella" (1/20). |
| `multiplica-como-independientes-sin-reposicion` | L3 | Multiplicar dos veces la razón de la primera etapa en un sorteo sin reposición. | 3/9 · 3/9 = 1/9 (es 1/12); 2/8 · 2/8 = 1/16 (es 1/28). |
| `baja-total-pero-no-favorables` | L3 | Bajar el total de la segunda etapa sin bajar los favorables de la clase extraída. | 3/9 · 3/8 = 1/8 (es 1/12); 6/10 · 6/9 = 2/5 (es 1/3). |
| `olvida-camino-simetrico` | L3 | Contar un solo camino cuando varios producen el evento. | 3/9 · 6/8 = 1/4 para "uno de cada" (es 1/2); 1/16 para "letras iguales" (4/16); 3 pares para suma 7. |
| `entrega-ninguno-en-vez-de-al-menos-uno` | L3 | P(ninguno) donde se pide P(al menos uno), sin el 1 −. | 1/8 en vez de 7/8; 5/12 en vez de 7/12; 1/100 en vez de 99/100. |
| `mantiene-denominador-sin-reposicion` | L3 | Bajar los favorables de la clase extraída pero dejar el total original. | 3/9 · 2/9 = 2/27 (es 1/12); 3/10 · 2/10 = 3/50 (es 1/15). |
| `usa-una-sola-etapa` | L3 | La probabilidad de una sola etapa como si fuera la de las dos. | 1/4 para "rojo y estrella" (1/20); 1/5 para "dos días seguidos la caja 3" (1/25). |

**Errores sin id.** Los conceptuales sin resultado reproducible ("no se puede saber sin más datos", "uno de los dos múltiplos") van con feedback artesanal y sin `errorCatalogado`, solo en bloques `seleccion` o `prediccion`.

**Ids que no aparecen en el cierre**, por diseño: `resta-conteo-a-uno-en-complemento` (procedimiento que da un número negativo, se ejercita como opción de una `seleccion` de L1), `cuenta-rango-restando-extremos` (ítem 1 de L1), `espera-frecuencia-igual-a-teorica` (ítem 3 de L1), `divide-por-total-de-fila` (ítem 2 de L2), `resta-a-uno-un-solo-evento` (ítem 3 de L2) y `omite-ambos-en-al-menos-uno` (bloques de L2 y L3). Los 23 quedan cubiertos entre L1, L2, L3 y cierre (se mide en el informe final).

---

## Plan de ítems

### L1, `probabilidad-posible-y-probable`

Números reservados: papeles 1 a 12 (par 6, mayor que 8: 4, múltiplo de 4: 3, del 5 al 9: 5, 13: 0, hasta 12: 12); dos monedas (4 pares: 0 puntos 1, 1 punto 2, 2 puntos 1); dos dados (36 pares: suma 7 en 6, ambos pares 9, suma par 18); semáforo 26 verdes de 40 días (65 %), 3 de 4 días en la muestra chica; 48 casilleros numerados, los del segundo piso del 25 al 36 (la rifa de 50 números original se reemplazó el 2026-09-13 por COLISIÓN de vestido con los ítems 63 de la forma 111 de 2024 y 65 de la forma 113 de 2024); 40 cupones, 8 con premio; tapa de bebida 130 boca arriba de 200.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `probabilidad-l1-item-1` | resolver | baja | sorteo de 48 casilleros numerados, los del segundo piso del 25 al 36: P(segundo piso) | 1/4 | 11/48 `cuenta-rango-restando-extremos`; 1/3 `divide-por-desfavorables`; 3/4 `confunde-evento-con-su-complemento` |
| `probabilidad-l1-item-2` | representar | media | 40 cupones, 8 con premio: P(premio) como porcentaje | 20 % | 8 % `lee-conteo-como-porcentaje`; 25 % `divide-por-desfavorables`; 80 % `confunde-evento-con-su-complemento` |
| `probabilidad-l1-item-3` | argumentar | alta | tapa lanzada 200 veces, 130 boca arriba: qué afirmación está justificada | la mejor estimación es 13/20, porque la tapa no es simétrica | 1/2 por ser dos resultados `usa-laplace-sin-equiprobabilidad`; debieron salir 100 justas, la tapa está defectuosa `espera-frecuencia-igual-a-teorica`; 7/20 porque 70 cayeron boca abajo `confunde-evento-con-su-complemento` |

### L2, `probabilidad-esto-o-esto-otro`

Números reservados: edificio de 30 (norte 16: 9 alto, 7 bajo; sur 14: 6 alto, 8 bajo; "norte o alto" 22, contados dos veces 9, ninguno 8); balcón 18 (11 norte, 7 sur), sin balcón 12 (5 norte, 7 sur), "balcón o sur" 25, "ni balcón ni sur" 5; números 1 a 30 (par 15, múltiplo de 5: 6, ambos 3, "par o múltiplo de 5" 18, ninguno 12; múltiplo de 3: 10, de 4: 7, de 12: 2, "de 3 o de 4" 15); dos dados (suma 5: 4, suma 9: 4; 6 en el primero 6, en el segundo 6, en ambos 1: 11); 24 pulseras de entrada de una jornada deportiva escolar (verde 7, azul 12, naranja 5; el dominio original, 20 tarjetas de una actividad de curso, se reemplazó el 2026-09-13 por COLISIÓN de vestido con el ítem 64 de la forma 113 de 2026); taller de serigrafía de 36 (mañana 20: 12 inicial, 8 avanzado; tarde 16: 10 inicial, 6 avanzado); lluvia 0,6 sábado y 0,5 domingo.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `probabilidad-l2-item-1` | resolver | baja | 24 pulseras de entrada de una jornada deportiva escolar (verde 7, azul 12, naranja 5): P(verde o naranja) | 1/2 | 35/576 `multiplica-en-vez-de-sumar`; 253/576 `usa-producto-como-interseccion`; 2/3 `asume-equiprobables-sin-enumerar` |
| `probabilidad-l2-item-2` | modelar | media | tabla del taller de serigrafía dibujada: P(turno mañana o nivel avanzado) | 13/18 | 2/5 `divide-por-total-de-fila`; 7/9 `lee-fila-equivocada-en-tabla`; 17/18 `suma-sin-restar-interseccion` |
| `probabilidad-l2-item-3` | argumentar | alta | veredicto sobre "P(llueve sábado o domingo) = 0,6 + 0,5 = 1,1, así que es seguro" | No: hay que restar los días con lluvia en ambos, y ninguna probabilidad supera 1 | Sí `suma-sin-restar-interseccion`; No, es 0,3 `multiplica-en-vez-de-sumar`; No, es 0,4 `resta-a-uno-un-solo-evento` |

### L3, `probabilidad-antes-de-apostar`

Números reservados: banda de 9 (3 vientos, 6 percusión): con reposición VV 1/9, VP 2/9, PV 2/9, PP 4/9; sin reposición VV 1/12, VP 1/4, PV 1/4, PP 5/12; "una de cada" 1/2; "al menos un vientos" 7/12; día (5) × sala (3) = 15 pares, "viernes y C" 1/15; tres días con sección al azar: "tres de vientos" 1/8, "al menos un día de percusión" 7/8; 7 cargadores con 2 malos: "dos buenos" 5/7 · 4/6 = 10/21; app de 4 colores × 5 figuras; 10 cápsulas (4 adhesivo, 6 figura); 8 delegados (2 de primero medio).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `probabilidad-l3-item-1` | resolver | baja | app que elige al azar un color entre 4 y una figura entre 5: P(rojo y estrella) | 1/20 | 1/9 `suma-resultados-en-vez-de-multiplicar-total`; 1/4 `usa-una-sola-etapa`; 9/20 `suma-en-vez-de-multiplicar-etapas` |
| `probabilidad-l3-item-2` | representar | media | 10 cápsulas (4 con adhesivo, 6 con figura), se compran 2: expresión de P(las dos con figura) | 6/10 · 5/9 | 6/10 · 5/10 `mantiene-denominador-sin-reposicion`; 6/10 · 6/10 `multiplica-como-independientes-sin-reposicion`; 6/10 · 6/9 `baja-total-pero-no-favorables` |
| `probabilidad-l3-item-3` | argumentar | alta | 8 delegados, 2 de primero medio, se sortean 2 sin repetir: veredicto sobre "P(los dos de primero medio) = 2/8 · 2/8 porque cada sorteo es igual" | No: es 2/8 · 1/7 = 1/28, bajan el total y los de primero medio | Sí `multiplica-como-independientes-sin-reposicion`; No, es 2/8 · 2/7 `baja-total-pero-no-favorables`; No, es 2/8 · 1/8 `mantiene-denominador-sin-reposicion` |

### Cierre, `cierre-reglas-de-probabilidades` (8 ítems)

Dominios: app que elige dos letras de A, B, C, D (cuadrícula dibujada); 25 audífonos de préstamo, 5 fallan; chinche lanzada 400 veces; app de música con 24 canciones (8 en español, 12 en inglés, 4 instrumentales); 40 voluntarios de una compañía de bomberos (tabla dibujada: menores de 30: 6 con licencia, 8 sin; 30 o más: 12 con, 14 sin); 5 cajas de un supermercado asignadas al azar dos días; patrulla scout de 10 con 3 recién llegados (árbol dibujado, sin probabilidades de camino); dos avisos de una app (correo y mensaje) que llegan con 9/10 cada uno.

| ítem | habilidad | dificultad | cubre | correcta | distractores (id) |
|---|---|---|---|---|---|
| `cierre-probabilidad-1` | representar | baja | Laplace con enumeración: P(las dos letras iguales) sobre la cuadrícula 4 × 4 | 1/4 | 1/16 `olvida-camino-simetrico`; 1/3 `divide-por-desfavorables`; 1/2 `suma-resultados-en-vez-de-multiplicar-total` |
| `cierre-probabilidad-2` | resolver | baja | complemento: P(el audífono funcione) con 5 de 25 fallados | 0,8 | 0,2 `confunde-evento-con-su-complemento`; 0,75 `divide-por-desfavorables`; 0,95 `lee-conteo-como-porcentaje` |
| `cierre-probabilidad-3` | representar | media | frecuencial frente a teórica: mejor estimación de P(punta arriba), 150 de 400 | 3/8 | 1/2 `usa-laplace-sin-equiprobabilidad`; 3/5 `divide-por-desfavorables`; 5/8 `confunde-evento-con-su-complemento` |
| `cierre-probabilidad-4` | resolver | media | aditiva excluyente: P(en español o instrumental) | 1/2 | 1/18 `multiplica-en-vez-de-sumar`; 4/9 `usa-producto-como-interseccion`; 2/3 `asume-equiprobables-sin-enumerar` |
| `cierre-probabilidad-5` | argumentar | alta | aditiva no excluyente desde la tabla: veredicto sobre "P(menor de 30 o con licencia) = 14/40 + 18/40" | No: es 26/40, los 6 que cumplen las dos cosas se contaron dos veces | Sí `suma-sin-restar-interseccion`; No, es 20/40 restando 12 `lee-fila-equivocada-en-tabla`; No, es 14/40 · 18/40 `multiplica-en-vez-de-sumar` |
| `cierre-probabilidad-6` | modelar | media | multiplicativa independiente: P(dos días seguidos la caja 3) entre 5 cajas | 1/25 | 1/10 `suma-resultados-en-vez-de-multiplicar-total`; 1/5 `usa-una-sola-etapa`; 2/5 `suma-en-vez-de-multiplicar-etapas` |
| `cierre-probabilidad-7` | modelar | media | sin reposición con árbol: P(los dos sorteados sean recién llegados), 3 de 10 | 1/15 | 3/50 `mantiene-denominador-sin-reposicion`; 9/100 `multiplica-como-independientes-sin-reposicion`; 1/10 `baja-total-pero-no-favorables` |
| `cierre-probabilidad-8` | argumentar | alta | al menos uno: veredicto sobre "P(al menos un aviso llega) = 9/10 + 9/10, así que es seguro" | No: es 1 − 1/100 = 99/100 | Sí `suma-sin-restar-interseccion`; No, es 81/100 `multiplica-en-vez-de-sumar`; No, es 1/100 `entrega-ninguno-en-vez-de-al-menos-uno` |

Matriz habilidad × dificultad del cierre: representar baja (1), media (3); resolver baja (2), media (4); modelar media (6, 7); argumentar alta (5, 8). Total: 2 baja, 4 media, 2 alta; las cuatro habilidades, dos veces cada una. Cobertura por lección: L1 en 1, 2 y 3; L2 en 4, 5 y 8; L3 en 6, 7 y 8.

Verificación de valores, con `node -e` sobre `lib/probabilidad.ts` (`laplace`, `complemento`, `union`, `multiplicar`, `probEvento`, `probSecuencia`, `tablaDobleEntrada`, `probUnionDesdeTabla`, `frecuenciaRelativa`, `distintosEnValor`, `enOrdenCreciente`): en los 17 ítems y en los 12 bloques `seleccion` o `pregunta` con alternativas de probabilidad, `distintosEnValor` da `true` y las alternativas numéricas quedan en orden creciente por valor. La salida cruda va en el informe final de la sesión.

---

## Lista de prohibidos

- Fuera del alcance DEMRE: P(A|B) y la palabra "condicional", factorial, permutaciones, combinaciones, C(n, k), variable aleatoria, binomial, normal, esperanza.
- Objetos de azar gastados en ítems: dado, moneda, naipes, ruleta (ningún ítem los usa); bolitas en ningún lugar del módulo (`ecuaciones-lineales`).
- Dominios ya usados en el corpus: feria (del libro, de ciencias), club de lectura y socios, juego de mesa con fichas, concierto y butacas, biblioteca, laboratorio de biología, camping, huerto, museo, bus interurbano, micro y paradero, bicicletas, cubo, pulsera, atletismo, panadería, quesería, gallinero, caleta, surf, vendimia, tiro con arco, palta, verdulería, temperaturas, estacionamiento, pila de cajas, llaveros, taller de esmaltes, auditorio, cuadernos y lápices, campeonato de tenis de mesa, piscina (COLISIÓN registrada). Por eso el sorteo es de un curso de fotografía y no de un taller, las pulseras son de entrada a una jornada deportiva y no tarjetas de un juego (las tarjetas boca abajo colisionan con el ítem 64 de la forma 113 de 2026), los recién llegados son de una patrulla scout y no socios de un club, y los cargadores y audífonos reemplazan a llaves, pilas y baterías.
- Contextos gastados de probabilidad escolar: urna con bolas de colores, baraja de 52 cartas, ruleta de casino, cumpleaños, calcetines en un cajón. Ninguno aparece.
- Rotular en un visual el valor que el ítem pide (la probabilidad de un camino, el contador de una cuadrícula).
- Totales con más de 20 elementos en un árbol sin reposición; árboles de tres etapas fuera del bloque de práctica de L3.

## Palabras clave para `consultar-fuentes.mjs` (las corre Benja)

```
node scripts/consultar-fuentes.mjs "fotografia" "curso de fotografia" "exposicion" "papel numerado" "papeles" "sorteo" "semaforo" "peatonal" "verde" "casillero" "casilleros numerados" "segundo piso" "pasillo" "cupon" "cupones" "premio" "tapa" "tapa de bebida" "boca arriba" "edificio" "departamentos" "piso alto" "orientacion norte" "balcon" "inspeccion" "app" "pulsera de entrada" "pulseras" "jornada deportiva" "zona verde" "naranja" "serigrafia" "taller de serigrafia" "turno manana" "nivel avanzado" "lluvia" "llueve" "sabado" "domingo" "banda" "banda escolar" "vientos" "percusion" "ensayo" "sala" "acto" "cargadores" "cargador" "colores" "figuras" "estrella" "capsulas" "maquina de capsulas" "adhesivo" "delegados" "primero medio" "letras" "audifonos" "prestamo" "chinche" "punta arriba" "canciones" "instrumental" "en espanol" "bomberos" "voluntarios" "licencia de conducir" "compania" "supermercado" "cajas" "caja registradora" "scout" "patrulla" "recien llegados" "aviso" "recordatorio" "correo" "mensaje" "probabilidad" "arbol" "espacio muestral" "con reposicion" "sin reposicion" "al menos uno"
```

## Estado de las firmas

Firmado por adelantado por Benja (brief de la sesión 2026-09-13, módulo 16): JSON de contenido, extensiones aditivas de schema, catálogo canónico y commits. Pendiente de Benja: la consulta de colisión con las palabras clave de arriba y las dos auditorías en hilos aislados (`/clear`) antes de cualquier `git push`. Decisiones propias registradas en `docs/pendientes-probabilidad-16.md`: títulos técnicos en vez de los lúdicos del brief, `moduloId` igual al id de tema y no al slug del DAG, y `descripcionesLecciones` en el commit de registro.
