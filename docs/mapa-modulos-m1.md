# Mapa de módulos M1 — 16 módulos × 3 lecciones

**Fuente única de nombres.** Ninguna lección nueva se escribe sin consultar este
archivo primero: el `id` y el `titulo` de una lección se deciden acá, no al
momento de redactarla. Si una lección necesita otro nombre, se cambia acá
primero y después en el JSON.

**El título es el nombre técnico DEMRE.** No hay dos nombres por lección: el
`titulo` que ve el estudiante es la unidad temática del temario, tal cual. La
separación entre un nombre lúdico de portada y un nombre técnico de revisión
existió brevemente como campo `subtitulo` y se revirtió — un solo nombre, el que
un profesor puede auditar contra el temario.

**Qué es cada columna:**

- **id** — kebab-case, formato `{modulo}-{slug}` (Enmienda 2, MOS §13). Es el
  nombre del archivo (`content/lecciones/{id}.json`) y el segmento de URL
  (`/leccion/{id}`). Está declarado en `IDS_LECCION` de `lib/modulos.ts`.
- **Título** — el nombre técnico DEMRE, campo `titulo` del JSON. Es lo único que
  se muestra y lo único que se audita.
- **Estado** — el real, leído de `content/lecciones/` el 2026-08-11.
  `— sin archivo —` significa que el id está declarado y planificado, pero el
  JSON todavía no existe.

> **Los ids no siempre se parecen a su título.** Varios slugs
> (`sistemas-dos-historias`, `cuadratica-sube-y-baja`, `posicion-caja-que-resume`,
> `datos-grafico-puede-mentir`…) se acuñaron cuando cada lección iba a llevar un
> nombre lúdico, y se conservan: el id es un identificador opaco y estable, y
> renombrarlo cambiaría archivos, URLs y el registro sin ganar nada. No es una
> inconsistencia que haya que arreglar.
>
> La excepción es un id que todavía no tiene archivo y cuyo slug alude a un
> motivo ya usado por otra lección: ahí sí conviene renombrarlo antes de escribir
> el JSON, porque no hay nada que romper. Pasó con `porcentaje-cartel` → 
> `porcentaje-concepto` el 2026-08-11: el motivo «cartel» ya estructura dos pasos
> de `inecuaciones-problemas`, y el contenido real de la lección resultó ser una
> encuesta de asistencia, no un cartel.

**Declarar no es escribir.** Los 48 ids están en el registro; 10 tienen archivo.
Un id sin archivo no rompe nada: `verificarRegistroDeTemas()` lo deja pasar como
lección planeada y su módulo se muestra como `sin-contenido` ("Pronto") en
`/camino`, fuera de `generateStaticParams`. Ver `lib/estadoModulo.ts`.

---

## Estado de los 16 módulos

| # | Eje | Módulo (nombre DEMRE) | id de tema | Estado |
|---|---|---|---|---|
| 1 | Números | Enteros y racionales | `enteros-y-racionales` | **completo** |
| 2 | Números | Porcentaje | `porcentaje` | en preparación |
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

3 completos · 1 en preparación · 12 sin contenido · 10 de 48 lecciones escritas.

Los `id` de tema **no** cambian aunque cambie el `nombre`: son rutas
(`/tema/{id}`, `/cierre/{id}`) y renombrarlas rompe enlaces sin ganancia.

---

## NÚMEROS

### 1. Enteros y racionales — `enteros-y-racionales`

| id | Título | Estado |
|---|---|---|
| `enteros-operar-y-ordenar` | Operatoria y orden en los números enteros | publicable |
| `enteros-operar-y-comparar` | Operatoria y comparación de números racionales | publicable |
| `enteros-problemas-en-contexto` | Problemas que involucren el conjunto de los números enteros y racionales en diversos contextos | publicable |

Cierre: `cierre-enteros-racionales`.

### 2. Porcentaje — `porcentaje`

| id | Título | Estado |
|---|---|---|
| `porcentaje-concepto` | Concepto y cálculo de porcentaje | borrador |
| `porcentaje-rebaja-doble` | Porcentaje aplicado sucesivamente en contextos de precio | — sin archivo — |
| `porcentaje-volver-atras` | Cálculo del valor original a partir de un porcentaje | — sin archivo — |

### 3. Potencias y raíces enésimas — `potencias-y-raices`

| id | Título | Estado |
|---|---|---|
| `potencias-multiplicar-corto` | Propiedades de potencias de base racional | — sin archivo — |
| `potencias-exponente-racional` | Exponente racional y su relación con las raíces | — sin archivo — |
| `potencias-raiz-escondida` | Descomposición y propiedades de raíces enésimas | — sin archivo — |

---

## ÁLGEBRA Y FUNCIONES

### 4. Expresiones algebraicas — `expresiones-algebraicas`

| id | Título | Estado |
|---|---|---|
| `expresiones-rectangulo` | Productos notables | — sin archivo — |
| `expresiones-deshacer-producto` | Factorización de expresiones algebraicas | — sin archivo — |
| `expresiones-sumar-lo-que-se-parece` | Operatoria con expresiones algebraicas | — sin archivo — |

### 5. Proporcionalidad — `proporcionalidad`

| id | Título | Estado |
|---|---|---|
| `proporcionalidad-directa` | Proporcionalidad directa | — sin archivo — |
| `proporcionalidad-inversa` | Proporcionalidad inversa | — sin archivo — |
| `proporcionalidad-reconocer` | Reconocimiento de proporcionalidad en contexto | — sin archivo — |

### 6. Ecuaciones e inecuaciones de primer grado — `ecuaciones-e-inecuaciones-primer-grado`

| id | Título | Estado |
|---|---|---|
| `ecuaciones-lineales` | Resolución de ecuaciones lineales | publicable |
| `inecuaciones-resolucion` | Resolución de inecuaciones lineales | publicable |
| `inecuaciones-problemas` | Problemas que involucren inecuaciones lineales en diversos contextos | publicable |

Cierre: `cierre-ecuaciones-lineales`.

### 7. Sistemas de ecuaciones lineales (2x2) — `sistemas-2x2`

| id | Título | Estado |
|---|---|---|
| `sistemas-dos-historias` | Resolución de sistemas de ecuaciones 2x2 | — sin archivo — |
| `sistemas-rectas-no-se-cruzan` | Sistemas sin solución o con infinitas soluciones | — sin archivo — |
| `sistemas-plantear-antes-resolver` | Problemas con sistemas de ecuaciones 2x2 | — sin archivo — |

### 8. Función lineal y afín — `funcion-lineal-y-afin`

| id | Título | Estado |
|---|---|---|
| `lineal-patrones-de-cambio` | Concepto de función lineal y función afín | publicable |
| `lineal-pendiente-e-intercepto` | Tablas y gráficos de función lineal y afín | publicable |
| `lineal-modelamiento-paes` | Problemas que involucren función lineal y afín en diversos contextos | publicable |

Cierre: `cierre-v0`. Lleva la interacción insignia (slider de dos variables,
paso 5 de `lineal-pendiente-e-intercepto`).

### 9. Función cuadrática — `funcion-cuadratica`

| id | Título | Estado |
|---|---|---|
| `cuadratica-sube-y-baja` | Ecuaciones de segundo grado | — sin archivo — |
| `cuadratica-punto-mas-alto` | Vértice y parámetros de la función cuadrática | — sin archivo — |
| `cuadratica-donde-toca-el-eje` | Ceros e intersección con los ejes | — sin archivo — |

---

## GEOMETRÍA

### 10. Figuras geométricas — `figuras-geometricas`

| id | Título | Estado |
|---|---|---|
| `figuras-triangulo-no-se-rompe` | Teorema de Pitágoras | — sin archivo — |
| `figuras-borde-y-superficie` | Perímetro y área de triángulos, paralelogramos, trapecios y círculos | — sin archivo — |
| `figuras-problemas-con-forma` | Aplicaciones de perímetro y área en contexto | — sin archivo — |

### 11. Cuerpos geométricos — `cuerpos-geometricos`

| id | Título | Estado |
|---|---|---|
| `cuerpos-desarmar-la-caja` | Área de superficie de paralelepípedos, cubos y cilindros | — sin archivo — |
| `cuerpos-cuanto-cabe-adentro` | Volumen de paralelepípedos, cubos y cilindros | — sin archivo — |
| `cuerpos-hoja-al-cilindro` | Problemas de área y volumen en contexto | — sin archivo — |

### 12. Transformaciones isométricas — `transformaciones-isometricas`

| id | Título | Estado |
|---|---|---|
| `isometrias-mover-sin-deformar` | Puntos y vectores en el plano cartesiano | — sin archivo — |
| `isometrias-girar-reflejar-trasladar` | Rotación, traslación y reflexión de figuras | — sin archivo — |
| `isometrias-figura-y-su-imagen` | Problemas con transformaciones isométricas | — sin archivo — |

### 13. Semejanza y proporcionalidad de figuras — `semejanza-y-proporcionalidad`

| id | Título | Estado |
|---|---|---|
| `semejanza-misma-forma-otro-tamano` | Concepto de semejanza de figuras | — sin archivo — |
| `semejanza-medir-sin-acercarse` | Semejanza aplicada a escalas y modelos | — sin archivo — |
| `semejanza-plano-y-realidad` | Problemas de semejanza en contexto | — sin archivo — |

---

## PROBABILIDAD Y ESTADÍSTICA

### 14. Representación de datos a través de tablas y gráficos — `tablas-y-graficos`

| id | Título | Estado |
|---|---|---|
| `datos-grafico-puede-mentir` | Tablas de frecuencia y tipos de gráficos | — sin archivo — |
| `datos-numero-que-representa` | Promedio de un conjunto de datos | — sin archivo — |
| `datos-leer-antes-de-calcular` | Problemas con tablas y gráficos | — sin archivo — |

### 15. Medidas de posición — `medidas-de-posicion`

| id | Título | Estado |
|---|---|---|
| `posicion-donde-quedaste-tu` | Cuartiles y percentiles | — sin archivo — |
| `posicion-partir-en-cuatro` | Cálculo de cuartiles en conjuntos de datos | — sin archivo — |
| `posicion-caja-que-resume` | Diagrama de cajón | — sin archivo — |

### 16. Reglas de las probabilidades — `reglas-de-probabilidades`

| id | Título | Estado |
|---|---|---|
| `probabilidad-posible-y-probable` | Probabilidad de un evento | — sin archivo — |
| `probabilidad-esto-o-esto-otro` | Regla aditiva y multiplicativa | — sin archivo — |
| `probabilidad-antes-de-apostar` | Problemas con reglas de probabilidad en contexto | — sin archivo — |

---

## Fuera del temario

| id | Título | Estado | Nota |
|---|---|---|---|
| `l0-demo` | Lección de demostración | borrador | Andamiaje técnico, no contenido pedagógico. No pertenece a ningún módulo y está excluida del camino por `ID_DEMO` en `lib/contenido.ts`. Nunca pasa a `publicable`. |

Es la única lección con archivo en disco que legítimamente no aparece en el mapa
de 48.
