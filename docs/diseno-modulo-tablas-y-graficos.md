# Diseño del módulo: Representación de datos a través de tablas y gráficos

**Id de tema:** `tablas-y-graficos`. Eje: Probabilidad y estadística (módulo #14 de `docs/mapa-modulos-m1.md`). **`moduloId` de los archivos de contenido:** `tablas-y-graficos`, el id de tema, con catálogo canónico en `content/errores/tablas-y-graficos.json`. Desde la migración del 2026-09-13 el `moduloId` y la `unidad` del catálogo son el id de tema y no el slug del DAG (`tablas-graficos` en `content/diagnostico/dag-m1.json`, que quedó fuera de esa migración; ver `docs/pendientes.md`).

**Verificación de colisión: pendiente.** Producción sin PARADA (brief del 2026-09-13, firmas por adelantado): los dominios se eligieron por exclusión contra todos los `contextosNumericos` de `content/` y contra los descartados de los `docs/diseno-modulo-*.md` anteriores, y las palabras clave quedan listadas al final para que Benja corra `scripts/consultar-fuentes.mjs` fuera de sesión. Un dominio que dé SI se reemplaza entero, nunca se ajusta.

Descriptores del temario (`docs/temario-demre-m1-2027.md:117-120`), citados textual:

```
- Tablas de frecuencia absoluta y relativa.
- Tipos de gráficos que permitan representar datos.
- Promedio de un conjunto de datos.
- Problemas que involucren tablas y gráficos en diversos contextos.
```

Fuera de alcance, no se construye: desviación estándar, varianza, moda como tema central, histogramas con intervalos, reglas de probabilidad.

---

## Objetivo del módulo

Que el estudiante pase de una lista de datos brutos a una tabla de frecuencias absolutas y relativas, elija y lea el gráfico que corresponde a cada pregunta (barras, circular, líneas, pictograma con clave), sepa qué muestra y qué esconde cada uno, detecte un gráfico engañoso por su eje, y calcule promedios desde datos sueltos, desde una tabla (ponderando) y desde la unión de grupos.

Lo que el módulo aporta de nuevo al eje: es el primero de Probabilidad y estadística. Todo lo que sigue (medidas de posición, probabilidad) presupone datos ya organizados en tabla y una lectura de gráfico con criterio.

## Orden y títulos de las lecciones (decisión registrada)

`docs/mapa-modulos-m1.md` declaraba los tres ids en el orden `datos-grafico-puede-mentir`, `datos-numero-que-representa`, `datos-leer-antes-de-calcular`, con los títulos "Tablas de frecuencia y tipos de gráficos", "Promedio de un conjunto de datos" y "Problemas con tablas y gráficos". El diseño pedagógico firmado del brief va tablas → gráficos → promedio, y cada slug calza con exactamente una de esas lecciones: `datos-leer-antes-de-calcular` es la de tablas (leer los datos antes de calcular relativas), `datos-grafico-puede-mentir` es la de gráficos (el eje que no parte de 0) y `datos-numero-que-representa` es la de promedio. Los ids no se renombran (son opacos y estables); se reordena `lecciones` en `lib/modulos.ts` como ya se hizo en `expresiones-algebraicas`, y los títulos pasan a los descriptores literales del temario, como en `potencias-y-raices` (2026-08-15) y `cuerpos-geometricos` (2026-08-26). El cuarto descriptor ("Problemas… en diversos contextos") se cubre en L3 y en el cierre, no con una lección propia.

| Posición | id | Título (descriptor DEMRE) |
|---|---|---|
| L1 | `datos-leer-antes-de-calcular` | Tablas de frecuencia absoluta y relativa |
| L2 | `datos-grafico-puede-mentir` | Tipos de gráficos que permitan representar datos |
| L3 | `datos-numero-que-representa` | Promedio de un conjunto de datos |

Cierre: `cierre-tablas-y-graficos`.

## Prerrequisitos reales, ya cubiertos

- `enteros-operar-y-comparar` (módulo #1): fracciones, decimales y su equivalencia (1/4 = 0,25).
- `porcentaje-concepto` (módulo #2): fracción → porcentaje, porcentaje de una cantidad. Arista facilitadora del DAG, no bloqueante.

---

## Convenciones del módulo

- n entre 8 y 40; fracciones que reducen limpio: n en {8, 10, 12, 16, 20, 24, 25, 40}.
- Porcentajes enteros o con un decimal; ángulos enteros; promedios enteros o con un decimal.
- Todo valor de un gráfico se rotula (barra, punto, sector, cajón). Solo el rótulo es autoritativo: ningún bloque ni ítem pide leer una altura o un sector a ojo.
- El eje vertical parte de 0. `ejeTruncado: true` solo en bloques `ejemploEnganoso: true`, que existen para enseñar a desconfiar.
- Visual en un ítem (`lib/visualesItems.tsx`) solo cuando el gráfico ES el estímulo; nunca cuando entrega la respuesta.
- Pictograma con clave: se representa con `variante: "tabla"` (una fila por categoría, símbolos ▲ repetidos y la clave en la descripción). No hay componente de pictograma y no hace falta.

---

## Objetivos por lección y progresión conceptual

**1. L1 `datos-leer-antes-de-calcular`, Tablas de frecuencia absoluta y relativa.**

*Dominio:* una panadería de barrio con un local chico y una sucursal grande; los pedidos de pan (marraqueta, hallulla, dobladita, integral) de una mañana.

*Objetivo:* que el estudiante cuente datos brutos y arme la tabla de frecuencias absolutas, calcule la frecuencia relativa como fracción, decimal y porcentaje sobre el total propio, verifique que las relativas suman 1 (100 %), y compare dos grupos de distinto tamaño solo con relativas.

*Concepto clave:* la frecuencia absoluta cuenta; la relativa compara con el total, y solo ella permite comparar grupos de distinto n.

*Descubrimiento:* el estudiante tabula el local chico (20 pedidos: 10, 5, 3, 2) y el grande (40 pedidos: 14, 12, 8, 6). En absoluta la marraqueta "gana" en el grande (14 contra 10); al dividir por el total propio, 10/20 = 50 % contra 14/40 = 35 %: pesa más en el chico. La palabra "relativa" aparece recién después de esa cuenta.

*Contraste P2 (paso `consolidacion`):* "Mucha gente compara los conteos de dos grupos de distinto tamaño. Falla porque 14 de 40 es menos proporción que 10 de 20. Lo que funciona es dividir cada conteo por su propio total." Se nombran además dividir por el total equivocado (divide-por-total-equivocado) y entregar 0,375 donde va 37,5 % (olvida-el-factor-cien), con un `pregunta` que lleva esos ids.

*Visual:* tabla de frecuencias (`variante: "tabla"`) en `descubrimiento` y `aplicacion`; gráfico de barras agrupadas (los dos locales) en `descubrimiento`, que es el primer bloque visual nuevo del módulo.

*Pregunta abierta con que cierra, que resuelve L2:* ¿se puede leer la misma tabla sin números, en un dibujo? ¿Y qué se pierde al dibujarla?

**2. L2 `datos-grafico-puede-mentir`, Tipos de gráficos que permitan representar datos.**

*Dominio:* una quesería artesanal del sur: quesos vendidos por tipo (mantecoso, chanco, gouda, de cabra) en una semana, kilos vendidos por mes, precio del kilo en cuatro locales.

*Objetivo:* que el estudiante lea barras, circular, líneas y pictograma con clave; sepa qué muestra y qué esconde cada uno (el circular no muestra el total; las líneas son para evolución en el tiempo); calcule el sector como fRel · 360° y recupere la cantidad desde el sector y el total; y detecte el gráfico engañoso por el eje que no parte de 0.

*Concepto clave:* el mismo conjunto de datos cabe en varios gráficos, pero cada gráfico responde una pregunta distinta, y el circular solo devuelve cantidades si se conoce el total.

*Descubrimiento:* el mismo conjunto (16, 12, 8, 4 de un total de 40) en barras y en circular, uno al lado del otro. El estudiante nota que desde el circular no puede decir cuántos quesos gouda hubo hasta que se le da el total; con el total, 20 % de 40 = 8, que es la barra.

*Contraste P2 (paso `consolidacion`):* "Mucha gente lee un sector de 20 % como 20 quesos. Falla porque el circular reparte el 100 %, no cuenta: 20 % de 40 es 8 y 20 % de 200 es 40. Lo que funciona es multiplicar el porcentaje por el total." Se nombran además leer barras por su altura en un eje truncado (lee-altura-en-eje-truncado) y usar líneas para categorías sin orden (usa-lineas-para-categorias).

*Visual:* barras y circular del mismo conjunto (`descubrimiento`), pictograma como tabla con clave (`descubrimiento`), líneas de kilos por mes (`generalizacion`), barras con eje truncado marcadas `ejemploEnganoso` junto a las mismas barras desde 0 (`practica`).

*Pregunta abierta con que cierra, que resuelve L3:* si hay que resumir toda la tabla en un solo número, ¿cuál?

**3. L3 `datos-numero-que-representa`, Promedio de un conjunto de datos.**

*Dominio:* un gallinero familiar: huevos recogidos por día, durante 8, 12 o 20 días, y dos gallineros que se juntan.

*Objetivo:* que el estudiante calcule el promedio de datos sueltos, desde una tabla de frecuencias (ponderando por la frecuencia), el promedio de la unión de dos grupos (ponderando por n), el dato que falta para alcanzar un promedio objetivo, y prediga el efecto de un dato extremo.

*Concepto clave:* el promedio reparte la suma total entre todos los datos: Σ valor · frecuencia dividido por n, nunca el promedio de los valores distintos ni de los promedios.

*Descubrimiento:* el estudiante expande la tabla (10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 14, 14), suma los 12 datos y divide; luego descubre que 10 · 3 + 11 · 4 + 12 · 3 + 14 · 2 es la misma suma, y que dividir por 12 (los datos) y no por 4 (las filas) es lo que la hace promedio.

*Contraste P2 (paso `consolidacion`):* "Mucha gente promedia los valores distintos de la tabla, (10 + 11 + 12 + 14) / 4. Falla porque el 11 apareció cuatro veces y el 14 dos: pesan distinto. Lo que funciona es multiplicar cada valor por su frecuencia y dividir por n." Se nombran además promediar promedios de grupos de distinto tamaño (promedia-promedios-sin-ponderar) y creer que un día extremo no mueve el promedio (cree-que-extremo-no-afecta-promedio).

*Visual:* tabla de frecuencias expandida (`descubrimiento`), barras de huevos por día (`curiosidad`), barras agrupadas de los dos gallineros (`generalizacion`).

**Un descubrimiento por lección:** L1 fija "se compara con relativas, sobre el total propio"; L2 fija "el circular no tiene total; la altura solo se lee desde 0"; L3 fija "Σ valor · f / n". El cierre integra los tres.

---

## Catálogo de errores (definitivo, `content/errores/tablas-y-graficos.json`, 19 ids)

Los ids nacen acá y se copian tal cual al catálogo canónico. Cada uno produce un resultado reproducible sobre un caso base, verificado con `node -e` sobre `lib/estadistica.ts` antes de escribir cualquier distractor. Caso base de L1: hallulla 5 de 20 en el local chico y 12 de 40 en el grande. Caso base de L2: chanco 12 de 40 (30 %, 108°); kilos por mes marzo 140 y abril 180. Caso base de L3: tabla 10 ×3, 11 ×4, 12 ×3, 14 ×2 (n = 12); grupos de 8 días con promedio 12 y 24 días con promedio 10.

| id | Nace en | Mecanismo | Produce sobre el caso base |
|---|---|---|---|
| `compara-absolutas-de-grupos-distintos` | L1 | Comparar frecuencias absolutas entre grupos de distinto tamaño y concluir "más" donde la proporción es menor. | "La marraqueta es más popular en el grande: 14 > 10" (35 % contra 50 %). |
| `divide-por-total-equivocado` | L1 | Calcular la frecuencia relativa dividiendo por el total de otro grupo o por otro número que no es el n propio. | 5/40 = 0,125 en vez de 5/20 = 0,25. |
| `olvida-el-factor-cien` | L1 | Olvidar el factor 100 al pasar entre decimal y porcentaje, o multiplicar un total por el porcentaje sin dividir por 100. | 0,25 % en vez de 25 %; 40 · 25 = 1.000 en vez de 10. |
| `confunde-frecuencia-con-valor` | L1 | Confundir la frecuencia (cuántas veces) con el valor del dato: sumar valores donde se cuentan casos, o promediar frecuencias. | "2 pedidos llevaron 2 panes" (el valor) en vez de 4 (la frecuencia); (3 + 4 + 3 + 2) / 4 = 3 como promedio. |
| `divide-por-categorias-en-vez-de-n` | L1 | Dividir por el número de categorías (filas de la tabla, grupos) en vez de por n. | 5/4 = 1,25; (30 + 44 + 36 + 28) / 4 = 34,5. |
| `lee-sector-como-cantidad-sin-total` | L2 | Confundir la cantidad de un grupo con su porcentaje o ángulo: leer 30 % como 30 quesos, o tratar 12 quesos como 12 %. | "30 quesos chanco"; 12 · 3,6 = 43,2°. |
| `calcula-angulo-con-cien` | L2 | Calcular el ángulo del sector con 100 en vez de 360 (el porcentaje leído como grados), o el porcentaje leyendo los grados como por ciento. | 30° en vez de 108°; 45° leído como 45 %. |
| `usa-complemento-del-sector` | L2 | Calcular el sector o la cantidad con los datos que NO cumplen (n − f) en vez de con f. | 28/40 · 360 = 252°; 40 − 8 = 32 quesos. |
| `lee-altura-en-eje-truncado` | L2 | Comparar barras por su altura visible cuando el eje no parte de 0, o recomendar truncar el eje "para que se note". | 9.000 contra 8.400 leído como "siete veces más" porque la barra mide 7 escalones contra 1. |
| `usa-lineas-para-categorias` | L2 | Elegir un gráfico de líneas para categorías sin orden en el tiempo, o leer la pendiente entre dos categorías como tendencia. | "Una línea de mantecoso a cabra muestra que las ventas caen." |
| `elige-circular-para-comparar-totales` | L2 | Elegir un circular para comparar cantidades entre dos grupos, cuando el circular reparte el 100 % y esconde el total. | "Dos circulares muestran qué local vendió más." |
| `toma-valor-final-como-variacion` | L2 | Entregar el valor del segundo periodo (o del primero) como la variación entre dos periodos. | Variación marzo → abril "= 180". |
| `acumula-en-vez-de-variar` | L2 | Sumar los valores de los dos periodos donde se pide la variación entre ellos. | 140 + 180 = 320. |
| `resta-periodos-al-reves` | L2 | Restar inicial menos final y entregar una subida donde hubo baja, o al revés. | 140 − 180 = −40: "bajó 40". |
| `promedia-valores-distintos-sin-ponderar` | L3 | Promediar los valores distintos de la tabla sin multiplicar por la frecuencia. | (10 + 11 + 12 + 14) / 4 = 11,75 en vez de 11,5. |
| `promedia-promedios-sin-ponderar` | L3 | Promedio de la unión como promedio de los promedios cuando los n difieren; o promediar el promedio viejo con un dato nuevo. | (12 + 10) / 2 = 11 en vez de (96 + 240) / 32 = 10,5. |
| `deja-un-dato-fuera-del-conteo` | L3 | Contar n − 1 datos donde hay n: dividir la suma por n − 1, o multiplicar el promedio objetivo por los conocidos (n − 1) al buscar el que falta. | 12 · 4 − 46 = 2 en vez de 12 · 5 − 46 = 14; 108 / 8 = 13,5. |
| `entrega-promedio-como-dato-faltante` | L3 | Responder el propio promedio objetivo como el dato que falta, o tratarlo como un dato más. | "El quinto día tienen que ser 12 huevos" (el objetivo). |
| `cree-que-extremo-no-afecta-promedio` | L3 | Afirmar que un dato extremo no cambia el promedio, o que lo cambia en toda su distancia, sin repartirla entre los n datos. | "Sigue en 12" o "sube a 30" en vez de (96 + 30) / 9 = 14. |

**Errores sin id.** Los conceptuales que no producen un resultado reproducible ("da lo mismo, en los dos es la más pedida") van con feedback artesanal y sin `errorCatalogado`, solo en bloques `seleccion` (nunca en `itemsPAES` ni en `items` del cierre, donde los tres distractores llevan id).

---

## Plan de ítems

### L1, `datos-leer-antes-de-calcular`

Números reservados: sábado, local chico n = 20 (10, 5, 3, 2) y grande n = 40 (14, 12, 8, 6); domingo, chico n = 24 (hallulla 9, integral 3) y grande n = 40 (16, 12, 8, 4); panes por pedido n = 10 (1 ×2, 2 ×4, 3 ×3, 4 ×1); consolidación: mañana 6 de 16, tarde 10 de 40.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `datos-l1-item-1` | resolver | baja | fRel de hallulla en un local con 25 pedidos (10, 8, 5, 2), dado también el total 40 del otro | 32 % | 0,32 % `olvida-el-factor-cien`; 20 % `divide-por-total-equivocado`; 200 % `divide-por-categorias-en-vez-de-n` |
| `datos-l1-item-2` | representar | media | tabla de panes por pedido (1 ×4, 2 ×8, 3 ×6, 4 ×2, n = 20): porcentaje de pedidos con más de 2 panes | 40 % | 0,4 % `olvida-el-factor-cien`; 35 % `confunde-frecuencia-con-valor`; 200 % `divide-por-categorias-en-vez-de-n` |
| `datos-l1-item-3` | argumentar | alta | veredicto sobre "la marraqueta es más popular en el grande porque vendió 14 contra 10" (40 contra 20 pedidos) | No: 35 % contra 50 % | Sí, 14 > 10 `compara-absolutas-de-grupos-distintos`; Sí, 14/20 = 70 % `divide-por-total-equivocado`; No, es 1 de 4 tipos en ambos `divide-por-categorias-en-vez-de-n` |

### L2, `datos-grafico-puede-mentir`

Números reservados: quesos por tipo n = 40 (16, 12, 8, 4: 40 %, 30 %, 20 %, 10 %; 144°, 108°, 72°, 36°); pictograma con clave ▲ = 4; kilos por mes enero a junio 120, 150, 140, 180, 170, 200; precio del kilo en cuatro locales 8.400, 8.600, 8.800, 9.000; mes con 60 quesos (cabra 10 % = 6); mes con 24 quesos (sector de 45° = 3 = 12,5 %).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `datos-l2-item-1` | resolver | baja | cantidad de quesos de cabra si su sector es 25 % y se vendieron 32 | 8 | 24 `usa-complemento-del-sector`; 25 `lee-sector-como-cantidad-sin-total`; 800 `olvida-el-factor-cien` |
| `datos-l2-item-2` | representar | media | líneas dibujadas de kilos por mes (90, 110, 100, 130, 150): variación entre febrero y marzo | bajó 10 kg | bajó 100 kg `toma-valor-final-como-variacion`; subió 10 kg `resta-periodos-al-reves`; subió 210 kg `acumula-en-vez-de-variar` |
| `datos-l2-item-3` | argumentar | alta | barras con eje truncado dibujadas (precios 8.400 a 9.000, eje desde 8.300): veredicto sobre "el local D cobra casi el doble" | No: 600 sobre 8.400, un 7 % | Sí, la barra es siete veces más alta `lee-altura-en-eje-truncado`; No, es 0,07 % `olvida-el-factor-cien`; No, debió ser de líneas `usa-lineas-para-categorias` |

### L3, `datos-numero-que-representa`

Números reservados: 8 días 12, 10, 11, 13, 12, 12, 11, 15 (promedio 12); tabla n = 12 (10 ×3, 11 ×4, 12 ×3, 14 ×2, promedio 11,5); tabla n = 20 (9 ×3, 10 ×6, 11 ×7, 12 ×4, promedio 10,6); unión 8 días a 12 con 24 días a 10 (10,5); dato faltante 5 días a 12 con 11, 13, 10, 12 (14); extremo: 8 días a 12 más un día de 30 (14); unión 8 días a 12,5 con 24 a 10,5 (11); consolidación: 8 días a 11 más un día de 20 (12).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `datos-l3-item-1` | resolver | baja | promedio desde la tabla 8 ×2, 9 ×3, 10 ×4, 11 ×1 (n = 10) | 9,4 | 2,5 `confunde-frecuencia-con-valor`; 9,5 `promedia-valores-distintos-sin-ponderar`; 23,5 `divide-por-categorias-en-vez-de-n` |
| `datos-l3-item-2` | modelar | media | expresión del promedio de la unión: 12 días a 10 y 20 días a 12 | (12 · 10 + 20 · 12) / (12 + 20) | (10 + 12) / 2 `promedia-promedios-sin-ponderar`; (12 · 10 + 20 · 12) / 2 `divide-por-categorias-en-vez-de-n`; (12 + 20) / 2 `confunde-frecuencia-con-valor` |
| `datos-l3-item-3` | argumentar | alta | veredicto sobre "9 días a 10 y un décimo día de 20: el promedio sube a 15" | No: 110 / 10 = 11 | Sí, (10 + 20) / 2 `promedia-promedios-sin-ponderar`; No, no cambia `cree-que-extremo-no-afecta-promedio`; No, sube a 12,2 = 110 / 9 `deja-un-dato-fuera-del-conteo` |

### Cierre, `cierre-tablas-y-graficos` (8 ítems)

Dominios nuevos, distintos de las tres lecciones: pescado descargado por especie en dos caletas; calefacción de los hogares de un pueblo; consulta vecinal de un presupuesto participativo; inscritos por mes en una escuela de surf; cajas de uva por cuadrilla en una vendimia; puntos por ronda en tiro con arco; precio del kilo de palta en cuatro verdulerías.

| ítem | habilidad | dificultad | cubre | correcta | distractores (id) |
|---|---|---|---|---|---|
| `cierre-datos-1` | resolver | baja | fRel de merluza: 9 de 24 en la caleta A (la B descargó 40) | 37,5 % | 0,375 % `olvida-el-factor-cien`; 22,5 % `divide-por-total-equivocado`; 225 % `divide-por-categorias-en-vez-de-n` |
| `cierre-datos-2` | argumentar | media | dónde pesa más la reineta: 6 de 24 (A) contra 8 de 40 (B) | A: 25 % contra 20 % | B, 8 > 6 `compara-absolutas-de-grupos-distintos`; B, 6/40 = 15 % `divide-por-total-equivocado`; igual, 1 de 4 especies `divide-por-categorias-en-vez-de-n` |
| `cierre-datos-3` | representar | baja | ángulo del sector de gas: 12 de 40 hogares | 108° | 30° `calcula-angulo-con-cien`; 43,2° `lee-sector-como-cantidad-sin-total`; 252° `usa-complemento-del-sector` |
| `cierre-datos-4` | modelar | media | votos de áreas verdes: sector 35 % de 40 votos | 14 | 26 `usa-complemento-del-sector`; 35 `lee-sector-como-cantidad-sin-total`; 1.400 `olvida-el-factor-cien` |
| `cierre-datos-5` | representar | media | líneas dibujadas (inscritos 28, 36, 44, 32 de diciembre a marzo): variación febrero → marzo | bajó 12 | bajó 32 `toma-valor-final-como-variacion`; subió 12 `resta-periodos-al-reves`; subió 76 `acumula-en-vez-de-variar` |
| `cierre-datos-6` | resolver | media | promedio de cajas por cuadrilla: 12 ×3, 14 ×5, 15 ×6, 18 ×2 (n = 16) | 14,5 | 4 `confunde-frecuencia-con-valor`; 14,75 `promedia-valores-distintos-sin-ponderar`; 58 `divide-por-categorias-en-vez-de-n` |
| `cierre-datos-7` | modelar | alta | puntos de la sexta ronda para promediar 9, con 9, 7, 10, 8, 9 | 11 | 2 `deja-un-dato-fuera-del-conteo`; 8,8 `promedia-promedios-sin-ponderar`; 9 `entrega-promedio-como-dato-faltante` |
| `cierre-datos-8` | argumentar | alta | barras con eje truncado dibujadas (palta 3.900 a 4.200, eje desde 3.850): veredicto sobre "en D cuesta el doble que en A" | No: 300 sobre 3.900, un 7,7 % | Sí, siete veces más alta `lee-altura-en-eje-truncado`; No, 0,077 % `olvida-el-factor-cien`; No, debió ser circular `elige-circular-para-comparar-totales` |

Matriz habilidad × dificultad del cierre: resolver baja (1), media (6); representar baja (3), media (5); modelar media (4), alta (7); argumentar media (2), alta (8). Total: 2 baja, 4 media, 2 alta; las cuatro habilidades, dos veces cada una. Cobertura por lección: L1 en 1, 2 y 6; L2 en 3, 4, 5 y 8; L3 en 6 y 7.

---

## Lista de prohibidos

- Contextos gastados de estadística escolar: notas de un curso, edades de una familia, estaturas de un curso, goles por partido. Ninguno aparece.
- Dominios ya usados en el corpus: feria (de ciencias, del libro), campaña de reciclaje, bicicletas (taller, repartidores), huerto, museo, biblioteca, camping, kiosco y empanadas, helados, leche, apicultor, plantas de vivero, buceo, temperaturas, bus interurbano, boletería de cine, ajedrez, plaza (descartada por sobreexposición). Por eso el pan es de una panadería y no de un kiosco, los kilos son de queso y no de leche, y la vendimia reemplaza al huerto.
- Mecanismos DEMRE liberados con sus números; histogramas con intervalos; moda como pregunta central; promedios con dos decimales; ejes truncados fuera de un bloque `ejemploEnganoso`.
- Rotular en un visual el valor que el ítem pide.

## Palabras clave para `consultar-fuentes.mjs` (las corre Benja)

```
node scripts/consultar-fuentes.mjs "panaderia" "pan" "marraqueta" "hallulla" "dobladita" "pedidos" "sucursal" "queseria" "queso" "mantecoso" "chanco" "gouda" "queso de cabra" "kilos por mes" "precio del kilo" "gallinero" "huevos" "gallinas" "caleta" "pescado" "merluza" "reineta" "jurel" "congrio" "calefaccion" "lena" "parafina" "consulta vecinal" "presupuesto participativo" "areas verdes" "escuela de surf" "surf" "vendimia" "uva" "cuadrilla" "tiro con arco" "arco" "ronda" "palta" "verduleria"
```

## Estado de las firmas

Firmado por adelantado por Benja (brief de la sesión 2026-09-13): JSON de contenido, extensiones aditivas de schema, catálogo canónico y commits. Pendiente de Benja: la consulta de colisión con las palabras clave de arriba y las dos auditorías en hilos aislados (`/clear`) antes de cualquier `git push`.
