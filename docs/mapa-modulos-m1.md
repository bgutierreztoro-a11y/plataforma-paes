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
- **Archivo** — si existe o no `content/lecciones/{id}.json`, verificado el
  2026-08-22 con `ls` sobre `content/lecciones`. Es un hecho del disco, no un
  juicio de madurez: **no hay estados de contenido**. El pipeline `borrador → revision → publicable` y los campos
  `estado`, `checklistOriginalidad` y `revisionMatematica` se eliminaron el
  2026-08-12 (CLAUDE.md regla 5). Un archivo que existe y pasa `npm run validar`
  es contenido terminado; la revisión son las dos auditorías en hilos aislados.

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
>
> Volvió a pasar con `potencias-exponente-racional` → `potencias-problemas-en-contexto`
> el 2026-08-15, por la otra cara del mismo criterio: al repartir los tres
> descriptores del temario uno por lección, esa L3 pasó a ser la de problemas en
> contexto, y un id llamado «exponente-racional» sobre ella habría quedado
> mintiendo. Tampoco había archivo que romper. En el mismo cambio, `potencias-raiz-escondida`
> pasó de tercera a segunda posición y los tres títulos se alinearon con los
> descriptores del temario.

**Declarar no es escribir.** Los 48 ids están en el registro; 24 tienen archivo.
Un id sin archivo no rompe nada: `verificarRegistroDeTemas()` lo deja pasar como
lección planeada y su módulo se muestra como `sin-contenido` ("Pronto") en
`/camino`, fuera de `generateStaticParams`. Ver `lib/estadoModulo.ts`.

---

## Estado de los 16 módulos

| # | Eje | Módulo (nombre DEMRE) | id de tema | Estado |
|---|---|---|---|---|
| 1 | Números | Enteros y racionales | `enteros-y-racionales` | **completo** |
| 2 | Números | Porcentaje | `porcentaje` | **completo** |
| 3 | Números | Potencias y raíces enésimas | `potencias-y-raices` | **completo** |
| 4 | Álgebra y funciones | Expresiones algebraicas | `expresiones-algebraicas` | **completo** |
| 5 | Álgebra y funciones | Proporcionalidad | `proporcionalidad` | **completo** |
| 6 | Álgebra y funciones | Ecuaciones e inecuaciones de primer grado | `ecuaciones-e-inecuaciones-primer-grado` | **completo** |
| 7 | Álgebra y funciones | Sistemas de ecuaciones lineales (2x2) | `sistemas-2x2` | **completo** |
| 8 | Álgebra y funciones | Función lineal y afín | `funcion-lineal-y-afin` | **completo** |
| 9 | Álgebra y funciones | Función cuadrática | `funcion-cuadratica` | **completo** |
| 10 | Geometría | Figuras geométricas | `figuras-geometricas` | **completo** |
| 11 | Geometría | Cuerpos geométricos | `cuerpos-geometricos` | sin contenido |
| 12 | Geometría | Transformaciones isométricas | `transformaciones-isometricas` | sin contenido |
| 13 | Geometría | Semejanza y proporcionalidad de figuras | `semejanza-y-proporcionalidad` | sin contenido |
| 14 | Probabilidad y estadística | Representación de datos a través de tablas y gráficos | `tablas-y-graficos` | sin contenido |
| 15 | Probabilidad y estadística | Medidas de posición | `medidas-de-posicion` | sin contenido |
| 16 | Probabilidad y estadística | Reglas de las probabilidades | `reglas-de-probabilidades` | sin contenido |

10 completos · 6 sin contenido · 30 de 48 lecciones escritas (verificado el
2026-08-26 con `ls content/lecciones | grep -v l0-demo | grep -v '^_' | wc -l`).

El conteo decía 31 hasta el 2026-08-26. El comando que citaba
(`ls content/lecciones | grep -v l0-demo | wc -l`) contaba también
`_esqueleto.json`, que es plantilla y no lección — los archivos que empiezan con
`_` no se validan (CLAUDE.md, "Convenciones técnicas"). El comando de arriba los
excluye.

«Completo» = las 3 lecciones tienen archivo y el módulo tiene su cierre conectado
en `lib/modulos.ts`. No implica que no tenga deuda: `porcentaje` y
`funcion-lineal-y-afin` arrastran defectos de Capa 2 documentados en
`docs/pendientes.md`.

`potencias-y-raices` pasó a completo el 2026-08-22: sus 3 lecciones ya
existían y validaban desde antes (la tabla decía «sin contenido» hasta esa
fecha, corregido tras verificar contra el disco), y ese mismo día se agregó
`content/cierres/cierre-potencias-y-raices.json` y su `cierreId` en
`lib/modulos.ts`.

`funcion-cuadratica` pasó a completo el 2026-08-24: se escribieron sus 3
lecciones (`cuadratica-sube-y-baja`, `cuadratica-punto-mas-alto`,
`cuadratica-donde-toca-el-eje`) y `content/cierres/cierre-funcion-cuadratica.json`
en la misma sesión, todos verificados con `npm run validar` antes de este
registro; y se agregó `cierreId: "cierre-funcion-cuadratica"` en `lib/modulos.ts`.
Pendiente de las dos auditorías (matemática y de originalidad) en hilos
aislados antes de cualquier `git push`.

Los `id` de tema **no** cambian aunque cambie el `nombre`: son rutas
(`/tema/{id}`, `/cierre/{id}`) y renombrarlas rompe enlaces sin ganancia.

---

## NÚMEROS

### 1. Enteros y racionales — `enteros-y-racionales`

| id | Título | Archivo |
|---|---|---|
| `enteros-operar-y-ordenar` | Operatoria y orden en los números enteros | sí |
| `enteros-operar-y-comparar` | Operatoria y comparación de números racionales | sí |
| `enteros-problemas-en-contexto` | Problemas que involucren el conjunto de los números enteros y racionales en diversos contextos | sí |

Cierre: `cierre-enteros-racionales`.

### 2. Porcentaje — `porcentaje`

| id | Título | Archivo |
|---|---|---|
| `porcentaje-concepto` | Concepto y cálculo de porcentaje | sí |
| `porcentaje-rebaja-doble` | Porcentaje aplicado sucesivamente en contextos de precio | sí |
| `porcentaje-volver-atras` | Cálculo del valor original a partir de un porcentaje | sí |

Cierre: `cierre-porcentaje`.

### 3. Potencias y raíces enésimas — `potencias-y-raices`

| id | Título | Archivo |
|---|---|---|
| `potencias-multiplicar-corto` | Propiedades de las potencias de base racional y exponente racional | sí |
| `potencias-raiz-escondida` | Descomposición y propiedades de las raíces enésimas en los números reales | sí |
| `potencias-problemas-en-contexto` | Problemas que involucren potencias y raíces enésimas en los números reales en diversos contextos | sí |

Cierre: `cierre-potencias-y-raices`.

---

## ÁLGEBRA Y FUNCIONES

### 4. Expresiones algebraicas — `expresiones-algebraicas`

| id | Título | Archivo |
|---|---|---|
| `expresiones-sumar-lo-que-se-parece` | Operatoria con expresiones algebraicas | sí |
| `expresiones-rectangulo` | Productos notables | sí |
| `expresiones-deshacer-producto` | Factorización de expresiones algebraicas | sí |

Cierre: `cierre-expresiones-algebraicas`.

Las filas van en orden pedagógico, que aquí no coincide con el del temario:
factorizar es reconocer la forma que produce un producto notable, así que va
después. El orden lo impone `lecciones` en `lib/modulos.ts`; esta tabla lo
refleja.

### 5. Proporcionalidad — `proporcionalidad`

| id | Título | Archivo |
|---|---|---|
| `proporcionalidad-directa` | Proporcionalidad directa | sí |
| `proporcionalidad-inversa` | Proporcionalidad inversa | sí |
| `proporcionalidad-reconocer` | Reconocimiento de proporcionalidad en contexto | sí |

Cierre: `cierre-proporcionalidad`.

### 6. Ecuaciones e inecuaciones de primer grado — `ecuaciones-e-inecuaciones-primer-grado`

| id | Título | Archivo |
|---|---|---|
| `ecuaciones-lineales` | Resolución de ecuaciones lineales | sí |
| `inecuaciones-resolucion` | Resolución de inecuaciones lineales | sí |
| `inecuaciones-problemas` | Problemas que involucren inecuaciones lineales en diversos contextos | sí |

Cierre: `cierre-ecuaciones-lineales`.

### 7. Sistemas de ecuaciones lineales (2x2) — `sistemas-2x2`

| id | Título | Archivo |
|---|---|---|
| `sistemas-dos-historias` | Resolución de sistemas de ecuaciones 2x2 | sí |
| `sistemas-rectas-no-se-cruzan` | Sistemas sin solución o con infinitas soluciones | sí |
| `sistemas-plantear-antes-resolver` | Problemas con sistemas de ecuaciones 2x2 | sí |

Cierre: `cierre-sistemas-2x2`.

### 8. Función lineal y afín — `funcion-lineal-y-afin`

| id | Título | Archivo |
|---|---|---|
| `lineal-patrones-de-cambio` | Concepto de función lineal y función afín | sí |
| `lineal-pendiente-e-intercepto` | Tablas y gráficos de función lineal y afín | sí |
| `lineal-modelamiento-paes` | Problemas que involucren función lineal y afín en diversos contextos | sí |

Cierre: `cierre-v0`. Lleva la interacción insignia (slider de dos variables,
paso 5 de `lineal-pendiente-e-intercepto`).

### 9. Función cuadrática — `funcion-cuadratica`

| id | Título | Archivo |
|---|---|---|
| `cuadratica-sube-y-baja` | Ecuaciones de segundo grado | sí |
| `cuadratica-punto-mas-alto` | Vértice y parámetros de la función cuadrática | sí |
| `cuadratica-donde-toca-el-eje` | Ceros e intersección con los ejes | sí |

Cierre: `cierre-funcion-cuadratica`.

---

## GEOMETRÍA

### 10. Figuras geométricas — `figuras-geometricas`

| id | Título | Archivo |
|---|---|---|
| `figuras-triangulo-no-se-rompe` | Teorema de Pitágoras | sí |
| `figuras-borde-y-superficie` | Perímetro y área de triángulos, paralelogramos, trapecios y círculos | sí |
| `figuras-problemas-con-forma` | Aplicaciones de perímetro y área en contexto | sí |

Módulo completo desde el 2026-08-26 (commit `25e9adc`): sus 3 lecciones tienen
archivo y `content/cierres/cierre-figuras-geometricas.json` está conectado como
`cierreId` en `lib/modulos.ts`. Ronda 1 (matemática) y Ronda 2 (originalidad)
aprobadas en hilos aislados.

Hasta el 2026-08-26 esta nota decía «**El módulo NO está completo**: falta
`cierre-figuras-geometricas.json` y su `cierreId`», y la fila 10 de la tabla de
arriba decía «sin contenido». Las dos cosas quedaron desactualizadas cuando
`25e9adc` agregó el cierre y no tocó este documento.

Sigue en pie la observación de fondo que traía esa nota, porque no dependía del
cierre: `lib/estadoModulo.ts` calcula `EstadoModulo` contando solo lecciones
(`resueltas.length === declaradas`), sin mirar si existe cierre. Para este módulo
ya no hay discrepancia —tiene ambos—, pero el próximo módulo que llegue a 3
lecciones sin cierre se va a mostrar como `"completo"` en `/camino`
contradiciendo la definición en prosa de «Completo» de este mismo documento.

### 11. Cuerpos geométricos — `cuerpos-geometricos`

| id | Título | Archivo |
|---|---|---|
| `cuerpos-desarmar-la-caja` | Área de superficie de paralelepípedos, cubos y cilindros | no |
| `cuerpos-cuanto-cabe-adentro` | Volumen de paralelepípedos, cubos y cilindros | no |
| `cuerpos-hoja-al-cilindro` | Problemas de área y volumen en contexto | no |

### 12. Transformaciones isométricas — `transformaciones-isometricas`

| id | Título | Archivo |
|---|---|---|
| `isometrias-mover-sin-deformar` | Puntos y vectores en el plano cartesiano | no |
| `isometrias-girar-reflejar-trasladar` | Rotación, traslación y reflexión de figuras | no |
| `isometrias-figura-y-su-imagen` | Problemas con transformaciones isométricas | no |

### 13. Semejanza y proporcionalidad de figuras — `semejanza-y-proporcionalidad`

| id | Título | Archivo |
|---|---|---|
| `semejanza-misma-forma-otro-tamano` | Concepto de semejanza de figuras | no |
| `semejanza-medir-sin-acercarse` | Semejanza aplicada a escalas y modelos | no |
| `semejanza-plano-y-realidad` | Problemas de semejanza en contexto | no |

---

## PROBABILIDAD Y ESTADÍSTICA

### 14. Representación de datos a través de tablas y gráficos — `tablas-y-graficos`

| id | Título | Archivo |
|---|---|---|
| `datos-grafico-puede-mentir` | Tablas de frecuencia y tipos de gráficos | no |
| `datos-numero-que-representa` | Promedio de un conjunto de datos | no |
| `datos-leer-antes-de-calcular` | Problemas con tablas y gráficos | no |

### 15. Medidas de posición — `medidas-de-posicion`

| id | Título | Archivo |
|---|---|---|
| `posicion-donde-quedaste-tu` | Cuartiles y percentiles | no |
| `posicion-partir-en-cuatro` | Cálculo de cuartiles en conjuntos de datos | no |
| `posicion-caja-que-resume` | Diagrama de cajón | no |

### 16. Reglas de las probabilidades — `reglas-de-probabilidades`

| id | Título | Archivo |
|---|---|---|
| `probabilidad-posible-y-probable` | Probabilidad de un evento | no |
| `probabilidad-esto-o-esto-otro` | Regla aditiva y multiplicativa | no |
| `probabilidad-antes-de-apostar` | Problemas con reglas de probabilidad en contexto | no |

---

## Fuera del temario

| id | Título | Archivo | Nota |
|---|---|---|---|
| `l0-demo` | Lección de demostración | sí | Andamiaje técnico, no contenido pedagógico. No pertenece a ningún módulo y está excluida del camino por `ID_DEMO` en `lib/contenido.ts`. |

Es la única lección con archivo en disco que legítimamente no aparece en el mapa
de 48.
