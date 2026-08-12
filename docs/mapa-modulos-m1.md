# Mapa de módulos M1 — 16 módulos × 3 lecciones

**Fuente única de nombres.** Ninguna lección nueva se escribe sin consultar este
archivo primero: el `id`, el `titulo` y el `subtitulo` de una lección se deciden
acá, no al momento de redactarla. Si una lección necesita otro nombre, se cambia
acá primero y después en el JSON.

**Qué es cada columna:**

- **id** — kebab-case, formato `{modulo}-{slug}` (Enmienda 2, MOS §13). Es el
  nombre del archivo (`content/lecciones/{id}.json`) y el segmento de URL
  (`/leccion/{id}`). Está declarado en `IDS_LECCION` de `lib/modulos.ts`.
- **Título** — el gancho que ve el estudiante. Lenguaje cotidiano, sin jerga.
- **Subtítulo técnico** — la unidad temática DEMRE en una línea. Es lo que lee
  un profesor al revisar. Campo `subtitulo` del schema, obligatorio desde
  `revision`.
- **Estado** — el real, leído de `content/lecciones/` el 2026-08-11.
  `— sin archivo —` significa que el id está declarado y planificado, pero el
  JSON todavía no existe.

**Declarar no es escribir.** Los 48 ids están en el registro; 9 tienen archivo.
Un id sin archivo no rompe nada: `verificarRegistroDeTemas()` lo deja pasar como
lección planeada y su módulo se muestra como `sin-contenido` ("Pronto") en
`/camino`, fuera de `generateStaticParams`. Ver `lib/camino.ts` (`EstadoModulo`).

---

## Estado de los 16 módulos

| # | Eje | Módulo (nombre DEMRE) | id de tema | Estado |
|---|---|---|---|---|
| 1 | Números | Enteros y racionales | `enteros-y-racionales` | **completo** |
| 2 | Números | Porcentaje | `porcentaje` | sin contenido |
| 3 | Números | Potencias y raíces enésimas | `potencias-y-raices` | sin contenido |
| 4 | Álgebra y funciones | Expresiones algebraicas | `expresiones-algebraicas` | sin contenido |
| 5 | Álgebra y funciones | Proporcionalidad | `proporcionalidad` | sin contenido |
| 6 | Álgebra y funciones | Ecuaciones e inecuaciones de primer grado | `ecuaciones-e-inecuaciones-primer-grado` | **completo** |
| 7 | Álgebra y funciones | Sistemas de ecuaciones lineales (2x2) | `sistemas-2x2` | sin contenido |
| 8 | Álgebra y funciones | Función lineal y afín | `funcion-lineal-y-afin` | **completo** |
| 9 | Álgebra y funciones | Función cuadrática | `funcion-cuadratica` | sin contenido |
| 10 | Geometría | Figuras geométricas | `figuras-geometricas` | sin contenido |
| 11 | Geometría | Cuerpos geométricos | `cuerpos-geometricos` | sin contenido |
| 12 | Geometría | Transformaciones isométricas | `transformaciones-isometricas` | sin contenido |
| 13 | Geometría | Semejanza y proporcionalidad de figuras | `semejanza-y-proporcionalidad` | sin contenido |
| 14 | Probabilidad y estadística | Representación de datos a través de tablas y gráficos | `tablas-y-graficos` | sin contenido |
| 15 | Probabilidad y estadística | Medidas de posición | `medidas-de-posicion` | sin contenido |
| 16 | Probabilidad y estadística | Reglas de las probabilidades | `reglas-de-probabilidades` | sin contenido |

3 completos · 13 sin contenido · 9 de 48 lecciones escritas.

Los `id` de tema **no** cambian aunque cambie el `nombre`: son rutas
(`/tema/{id}`, `/cierre/{id}`) y renombrarlas rompe enlaces sin ganancia.

---

## NÚMEROS

### 1. Enteros y racionales — `enteros-y-racionales`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `enteros-operar-y-ordenar` | Enteros: operar y ordenar ⚠️ | Operatoria y orden en los números enteros | publicable |
| `enteros-operar-y-comparar` | Racionales: operar y comparar | Operatoria y comparación de números racionales | publicable |
| `enteros-problemas-en-contexto` | Todo junto, en la vida real | Problemas que involucren el conjunto de los números enteros y racionales en diversos contextos | publicable |

Cierre: `cierre-enteros-racionales`.

> ⚠️ **Discrepancia de título pendiente.** El plan de nombres asigna a
> `enteros-operar-y-ordenar` el título **"El termómetro que cruza el cero"**,
> pero el JSON en disco tiene **"Enteros: operar y ordenar"**. La tabla registra
> el valor real, no el planeado. El cambio no se aplicó porque la tarea que creó
> este documento tenía prohibido editar JSON de contenido. Al corregirlo, el
> título nuevo entra al JSON y esta nota se borra. Es la única discrepancia
> título↔disco de las 9 lecciones escritas.

### 2. Porcentaje — `porcentaje`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `porcentaje-cartel` | Lo que el cartel realmente dice | Concepto y cálculo de porcentaje | — sin archivo — |
| `porcentaje-rebaja-doble` | Rebaja sobre rebaja | Porcentaje aplicado sucesivamente en contextos de precio | — sin archivo — |
| `porcentaje-volver-atras` | Volver atrás desde el resultado | Cálculo del valor original a partir de un porcentaje | — sin archivo — |

### 3. Potencias y raíces enésimas — `potencias-y-raices`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `potencias-multiplicar-corto` | Multiplicar sin escribir tanto | Propiedades de potencias de base racional | — sin archivo — |
| `potencias-exponente-racional` | Un exponente que no es entero | Exponente racional y su relación con las raíces | — sin archivo — |
| `potencias-raiz-escondida` | Lo que se esconde bajo el signo | Descomposición y propiedades de raíces enésimas | — sin archivo — |

---

## ÁLGEBRA Y FUNCIONES

### 4. Expresiones algebraicas — `expresiones-algebraicas`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `expresiones-rectangulo` | Un rectángulo, cuatro términos | Productos notables | — sin archivo — |
| `expresiones-deshacer-producto` | Deshacer el producto | Factorización de expresiones algebraicas | — sin archivo — |
| `expresiones-sumar-lo-que-se-parece` | Sumar lo que se parece | Operatoria con expresiones algebraicas | — sin archivo — |

### 5. Proporcionalidad — `proporcionalidad`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `proporcionalidad-directa` | Dos cantidades que crecen juntas | Proporcionalidad directa | — sin archivo — |
| `proporcionalidad-inversa` | Cuando uno sube y el otro baja | Proporcionalidad inversa | — sin archivo — |
| `proporcionalidad-reconocer` | ¿Directa o inversa? | Reconocimiento de proporcionalidad en contexto | — sin archivo — |

### 6. Ecuaciones e inecuaciones de primer grado — `ecuaciones-e-inecuaciones-primer-grado`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `ecuaciones-lineales` | La balanza que esconde un número | Resolución de ecuaciones lineales | publicable |
| `inecuaciones-resolucion` | No un valor, sino un tramo | Resolución de inecuaciones lineales | publicable |
| `inecuaciones-problemas` | Todos los números que sirven | Problemas que involucren inecuaciones lineales en diversos contextos | publicable |

Cierre: `cierre-ecuaciones-lineales`.

### 7. Sistemas de ecuaciones lineales (2x2) — `sistemas-2x2`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `sistemas-dos-historias` | Dos historias, un mismo punto | Resolución de sistemas de ecuaciones 2x2 | — sin archivo — |
| `sistemas-rectas-no-se-cruzan` | Cuando las rectas no se cruzan | Sistemas sin solución o con infinitas soluciones | — sin archivo — |
| `sistemas-plantear-antes-resolver` | Plantear antes de resolver | Problemas con sistemas de ecuaciones 2x2 | — sin archivo — |

### 8. Función lineal y afín — `funcion-lineal-y-afin`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `lineal-patrones-de-cambio` | El patrón que se repite | Concepto de función lineal y función afín | publicable |
| `lineal-pendiente-e-intercepto` | Pendiente e intercepto | Tablas y gráficos de función lineal y afín | publicable |
| `lineal-modelamiento-paes` | Del enunciado al modelo | Problemas que involucren función lineal y afín en diversos contextos | publicable |

Cierre: `cierre-v0`. Lleva la interacción insignia (slider de dos variables,
paso 5 de `lineal-pendiente-e-intercepto`).

### 9. Función cuadrática — `funcion-cuadratica`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `cuadratica-sube-y-baja` | Sube y después baja | Ecuaciones de segundo grado | — sin archivo — |
| `cuadratica-punto-mas-alto` | El punto más alto o más bajo | Vértice y parámetros de la función cuadrática | — sin archivo — |
| `cuadratica-donde-toca-el-eje` | Dónde la curva toca el eje | Ceros e intersección con los ejes | — sin archivo — |

---

## GEOMETRÍA

### 10. Figuras geométricas — `figuras-geometricas`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `figuras-triangulo-no-se-rompe` | El triángulo que no se rompe | Teorema de Pitágoras | — sin archivo — |
| `figuras-borde-y-superficie` | Borde y superficie no son lo mismo | Perímetro y área de triángulos, paralelogramos, trapecios y círculos | — sin archivo — |
| `figuras-problemas-con-forma` | Problemas con forma | Aplicaciones de perímetro y área en contexto | — sin archivo — |

### 11. Cuerpos geométricos — `cuerpos-geometricos`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `cuerpos-desarmar-la-caja` | Desarmar la caja | Área de superficie de paralelepípedos, cubos y cilindros | — sin archivo — |
| `cuerpos-cuanto-cabe-adentro` | Cuánto cabe adentro | Volumen de paralelepípedos, cubos y cilindros | — sin archivo — |
| `cuerpos-hoja-al-cilindro` | De la hoja al cilindro | Problemas de área y volumen en contexto | — sin archivo — |

### 12. Transformaciones isométricas — `transformaciones-isometricas`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `isometrias-mover-sin-deformar` | Mover sin deformar | Puntos y vectores en el plano cartesiano | — sin archivo — |
| `isometrias-girar-reflejar-trasladar` | Girar, reflejar, trasladar | Rotación, traslación y reflexión de figuras | — sin archivo — |
| `isometrias-figura-y-su-imagen` | La figura y su imagen | Problemas con transformaciones isométricas | — sin archivo — |

### 13. Semejanza y proporcionalidad de figuras — `semejanza-y-proporcionalidad`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `semejanza-misma-forma-otro-tamano` | La misma forma, otro tamaño | Concepto de semejanza de figuras | — sin archivo — |
| `semejanza-medir-sin-acercarse` | Medir sin acercarse | Semejanza aplicada a escalas y modelos | — sin archivo — |
| `semejanza-plano-y-realidad` | El plano y la realidad | Problemas de semejanza en contexto | — sin archivo — |

---

## PROBABILIDAD Y ESTADÍSTICA

### 14. Representación de datos a través de tablas y gráficos — `tablas-y-graficos`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `datos-grafico-puede-mentir` | Un gráfico puede mentir | Tablas de frecuencia y tipos de gráficos | — sin archivo — |
| `datos-numero-que-representa` | Un número que representa a todos | Promedio de un conjunto de datos | — sin archivo — |
| `datos-leer-antes-de-calcular` | Leer antes de calcular | Problemas con tablas y gráficos | — sin archivo — |

### 15. Medidas de posición — `medidas-de-posicion`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `posicion-donde-quedaste-tu` | ¿Dónde quedaste tú? | Cuartiles y percentiles | — sin archivo — |
| `posicion-partir-en-cuatro` | Partir el grupo en cuatro | Cálculo de cuartiles en conjuntos de datos | — sin archivo — |
| `posicion-caja-que-resume` | Una caja que resume cien datos | Diagrama de cajón | — sin archivo — |

### 16. Reglas de las probabilidades — `reglas-de-probabilidades`

| id | Título | Subtítulo técnico | Estado |
|---|---|---|---|
| `probabilidad-posible-y-probable` | Lo posible y lo probable | Probabilidad de un evento | — sin archivo — |
| `probabilidad-esto-o-esto-otro` | Esto y esto, o esto o esto | Regla aditiva y multiplicativa | — sin archivo — |
| `probabilidad-antes-de-apostar` | Calcular antes de apostar | Problemas con reglas de probabilidad en contexto | — sin archivo — |

---

## Fuera del temario

| id | Título | Estado | Nota |
|---|---|---|---|
| `l0-demo` | Lección de demostración | borrador | Andamiaje técnico, no contenido pedagógico. No pertenece a ningún módulo y está excluida del camino por `ID_DEMO` en `lib/contenido.ts`. Nunca pasa a `publicable`. |

Es la única lección con archivo en disco que legítimamente no aparece en el mapa
de 48. No tiene `subtitulo` y no le corresponde: en `borrador` el validador no lo
exige.
