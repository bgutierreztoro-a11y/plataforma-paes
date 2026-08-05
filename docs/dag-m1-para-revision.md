# Mapa de prerrequisitos de Matemática M1 — para revisión

**Para:** revisión pedagógica
**Fecha:** 2026-08-05
**Qué se pide:** que alguien que enseña M1 diga si el orden en que este mapa obliga a estudiar los 16 temas es el correcto.

---

## Cómo leer esto (en 30 segundos)

El sistema tiene anotado, para cada uno de los 16 temas de M1, **qué temas hay que saber antes**. A cada una de esas relaciones la llamamos **una flecha**. Hay 22 flechas.

Se leen así:

> **Potencias y raíces** ← necesita **Enteros y racionales**

Con esas 22 flechas, el sistema calcula solo dos cosas: en qué orden ofrecerle los temas al estudiante, y qué tan grave es que falle uno (si un tema abre muchos otros, fallarlo bloquea más).

**Lo que se necesita revisar es si las 22 flechas son ciertas.** Nada más.

### Un aviso importante sobre este documento

Junto a cada flecha aparece una cita del temario oficial DEMRE. Esa cita **no sale del PDF oficial**: sale de un resumen de una línea por tema que está en `docs/calibracion-lecciones-e-items.md`, porque el PDF del temario no está guardado en este proyecto. Es la mejor fuente disponible hoy, pero es un resumen.

Y hay algo más de fondo: **el temario enumera contenidos, no dice qué va antes de qué.** Por eso muchas flechas —12 de las 22— no tienen ninguna frase del temario que las respalde. No están mal: son juicio pedagógico razonable, pero sin respaldo escrito. Están todas juntas en la sección 3, y son las que de verdad hay que dirimir.

---

## 1. Los 16 temas en orden de estudio

Los temas están agrupados por **etapa**. Los de una etapa solo se pueden estudiar cuando están listos todos los de las etapas anteriores de los que dependen. La columna "abre" dice cuántos temas quedan habilitados al dominar ese.

### Etapa 0 — el punto de partida

| Tema | Abre |
|---|---|
| Enteros y racionales | 15 |

Es el único tema sin prerrequisitos: todo el resto del temario cuelga de él, directa o indirectamente.

### Etapa 1 — se pueden tomar apenas termina el anterior

| Tema | Abre |
|---|---|
| Potencias y raíces | 5 |
| Expresiones algebraicas | 4 |
| Proporcionalidad | 4 |
| Porcentaje | 2 |
| Reglas de probabilidad | 0 |

### Etapa 2

| Tema | Abre |
|---|---|
| Ecuaciones e inecuaciones | 3 |
| Figuras geométricas | 3 |
| Tablas y gráficos | 1 |

### Etapa 3

| Tema | Abre |
|---|---|
| Función lineal y afín | 2 |
| Cuerpos geométricos | 0 |
| Transformaciones isométricas | 0 |
| Semejanza y proporcionalidad | 0 |
| Medidas de posición | 0 |

### Etapa 4 — lo último

| Tema | Abre |
|---|---|
| Sistemas de ecuaciones 2×2 | 0 |
| Función cuadrática | 0 |

**El camino más largo del mapa tiene 4 pasos:**
Enteros y racionales → Expresiones algebraicas → Ecuaciones e inecuaciones → Función lineal y afín → Sistemas 2×2

**Dos cosas que llaman la atención de esta lista y conviene mirar con calma:**

1. **Reglas de probabilidad queda en la etapa 1**, disponible casi al principio, con solo Enteros y racionales por delante. ¿Es correcto que un estudiante pueda entrar a probabilidades tan temprano?
2. **Porcentaje abre solo 2 temas**, muy poco para lo transversal que suele ser en la prueba. Depende de una sola flecha saliente (hacia Tablas y gráficos), y esa flecha además es de las que no tienen respaldo.

---

## 2. Las 10 flechas que el temario sí respalda

Para cada una: la cita del temario del tema que **necesita** al otro, y por qué.

**1. Potencias y raíces ← Enteros y racionales**
> *"Propiedades de potencias de base y exponente **racional**; descomposición y propiedades de raíces en ℝ; problemas"*

El temario nombra el prerrequisito con todas sus letras: "exponente racional". No se puede elevar a un exponente de ℚ sin manejar ℚ antes.

**2. Sistemas 2×2 ← Ecuaciones e inecuaciones**
> *"Sistemas de ecuaciones **lineales** (2×2) — Resolución; problemas"*

El nombre del tema en el temario dice "ecuaciones lineales", que es exactamente lo que introduce el tema anterior. Un sistema 2×2 es un par de ecuaciones lineales resueltas a la vez.

**3. Función cuadrática ← Ecuaciones e inecuaciones**
> *"**Ecuaciones de segundo grado**; tablas y gráficos y variación de parámetros; vértice, ceros e intersecciones; problemas"*

El descriptor abre nombrando "ecuaciones de segundo grado". La idea de ecuación y cómo resolverla la instala el tema de primer grado; segundo grado es la extensión del mismo objeto.

**4. Figuras geométricas ← Potencias y raíces**
> *"**Teorema de Pitágoras**; perímetro y área de triángulos, paralelogramos, trapecios y círculos; problemas"*

Pitágoras es una igualdad entre cuadrados y despejar el lado termina en una raíz. El área del círculo trae otra potencia.

**5. Cuerpos geométricos ← Figuras geométricas**
> *"**Área de superficie** y volumen de paralelepípedos, cubos y cilindros; problemas"*

La superficie de un cilindro se arma con dos círculos y un rectángulo; la de un cubo, con seis cuadrados. Esas áreas planas son justo las que declara el tema anterior.

**6. Transformaciones isométricas ← Figuras geométricas**
> *"**Puntos y vectores en el plano cartesiano**; rotación, traslación y reflexión; problemas"*

Dos cosas, y la primera es la razón por la que esta flecha se revisó:

- *En negativo:* el temario mete "puntos y vectores en el plano cartesiano" **dentro de este mismo tema**. O sea, el plano cartesiano **no** se hereda de Función lineal y afín: el tema lo trae consigo. Antes el mapa decía que sí y estaba equivocado.
- *En positivo:* rotar, trasladar y reflejar son operaciones sobre **una figura**, y reconocer esa figura es lo que entrega el tema anterior. Esta segunda mitad es lectura, no cita.

**7. Semejanza y proporcionalidad ← Proporcionalidad**
> *"Propiedades de semejanza y **proporcionalidad** aplicadas a modelos a escala y situaciones reales"*

El temario nombra el prerrequisito con la palabra exacta. Una escala es una razón constante.

**8. Semejanza y proporcionalidad ← Figuras geométricas**
> *"Semejanza y proporcionalidad **de figuras** — Propiedades de semejanza y proporcionalidad aplicadas a modelos a escala y situaciones reales"*

El nombre del tema termina en "de figuras": lo que se declara semejante son figuras, con sus lados y ángulos.

**9. Tablas y gráficos ← Enteros y racionales**
> *"Frecuencia absoluta y **relativa**; tipos de gráficos; **promedio**; problemas"*

La frecuencia relativa es, por definición, un cociente. El promedio es otra división.

**10. Medidas de posición ← Tablas y gráficos**
> *"Cuartiles y percentiles de uno o más grupos; **diagrama de cajón**; problemas"*

El diagrama de cajón es un tipo de gráfico, y los cuartiles se calculan sobre datos ya organizados en tabla de frecuencias.

---

## 3. Las 12 flechas SIN respaldo en el temario — las que hay que dirimir

**Esta es la sección que importa.** Estas 12 flechas están en el mapa porque parecen razonables, pero **no hay ninguna frase del temario que las sostenga**. No son errores: son decisiones pedagógicas que nadie firmó todavía.

Cada una se puede aprobar (queda como está), rechazar (se borra la flecha, el tema se libera antes) o modificar.

**1. Porcentaje ← Enteros y racionales**
Temario dice: *"Concepto y cálculo; problemas en diversos contextos"*.
Un porcentaje es una razón sobre 100, así que calcularlo es operar en ℚ. Pero el temario dice "concepto y cálculo" y nada más: no nombra los racionales ni ninguna operación concreta.

**2. Expresiones algebraicas ← Enteros y racionales**
Temario dice: *"Productos notables; factorizaciones y desarrollo; operatoria; problemas"*.
"Operatoria" con letras repite las reglas de la operatoria numérica, y los coeficientes son enteros y racionales. Pero el temario dice "operatoria" a secas, sin decir sobre qué conjunto.

**3. Proporcionalidad ← Enteros y racionales**
Temario dice: *"Proporción directa e inversa y sus representaciones; problemas"*.
Una proporción iguala dos razones, y una razón es un cociente. El temario nunca baja al conjunto numérico.

**4. Ecuaciones e inecuaciones ← Expresiones algebraicas**
Temario dice: *"Resolución de ecuaciones lineales; resolución de inecuaciones lineales; problemas de ambas"*.
Despejar una incógnita es manipular una expresión: reducir semejantes, transponer. **De las 12, es la más defendible** — y aun así el temario no la escribe.

**5. Sistemas 2×2 ← Función lineal y afín** ⚠️
Temario dice: *"Resolución; problemas"*.
Leer un sistema como el cruce de dos rectas exige la función afín. Pero el descriptor son dos palabras y no menciona gráficos ni rectas: el temario admite resolver un 2×2 por sustitución o igualación, puro álgebra, sin pasar nunca por la función.
**⚠️ Esta flecha es la que hace más largo todo el mapa.** Es la que estira el camino a 4 pasos. Si se rechaza, el mapa entero pasa a 3 pasos y Sistemas 2×2 se puede estudiar bastante antes.

**6. Función lineal y afín ← Proporcionalidad**
Temario dice: *"Concepto; tablas y gráficos; problemas"*.
La función lineal y = mx **es** la proporcionalidad directa escrita como función, y las "tablas y gráficos" son las mismas "representaciones" que pide Proporcionalidad. La conexión se ve cruzando los dos descriptores, no leyendo uno.

**7. Función lineal y afín ← Ecuaciones e inecuaciones**
Temario dice: *"Concepto; tablas y gráficos; problemas"*.
Evaluar la función o buscar dónde corta el eje x es resolver una ecuación. El temario no lo menciona: "concepto, tablas y gráficos" se puede tratar de forma descriptiva, sin resolver nada.

**8. Función cuadrática ← Expresiones algebraicas**
Temario dice: *"Ecuaciones de segundo grado; …; vértice, ceros e intersecciones; problemas"*.
Los ceros salen de factorizar y el vértice de completar el cuadrado. El temario nombra los **resultados** ("vértice", "ceros") y nunca las **técnicas**.

**9. Función cuadrática ← Potencias y raíces**
Temario dice: *"Ecuaciones de segundo grado; …; vértice, ceros e intersecciones; problemas"*.
La fórmula general trae una raíz cuadrada y el término cuadrático es una potencia. El temario no nombra ni potencias ni raíces en ningún punto.

**10. Función cuadrática ← Función lineal y afín**
Temario dice: *"Ecuaciones de segundo grado; tablas y gráficos y variación de parámetros; …"*.
"Tablas y gráficos" y variar parámetros repiten el trabajo hecho con la función afín, y sin la idea de función no hay dónde apoyar la parábola. Pero la continuidad es de método, no de cita.

**11. Tablas y gráficos ← Porcentaje**
Temario dice: *"Frecuencia absoluta y **relativa**; tipos de gráficos; promedio; problemas"*.
En la práctica la frecuencia relativa se lee en porcentaje y los gráficos circulares se reparten sobre 100. Pero el temario dice "relativa", no "porcentaje": admite tratarla como fracción o decimal.
*(Ojo: esta es la única flecha que sale de Porcentaje. Si se rechaza, Porcentaje queda sin abrir ningún tema.)*

**12. Reglas de probabilidad ← Enteros y racionales**
Temario dice: *"Probabilidad de un evento; regla aditiva y multiplicativa; problemas"*.
La probabilidad es casos favorables sobre totales —un racional entre 0 y 1— y las reglas aditiva y multiplicativa son suma y producto de fracciones. El temario nombra las operaciones pero nunca el conjunto numérico.

---

## 4. Flechas que faltarían — propuestas, NO aplicadas

Estas **no están** en el mapa. Aparecieron al revisar el temario y se dejan como propuesta. Ninguna se agregó.

**A. Porcentaje ← Proporcionalidad**
Un porcentaje es una proporción de denominador 100, y "tanto por ciento" es el caso más común de proporción directa. Hoy los dos temas están sueltos, ambos en la etapa 1. Agregarla empujaría Porcentaje a la etapa 2.
*Contra:* el temario los trata como temas separados y de ejes distintos (Números vs. Álgebra).

**B. Reglas de probabilidad ← Porcentaje**
La probabilidad se comunica casi siempre en porcentaje ("70% de posibilidades"). Hoy Reglas de probabilidad queda disponible en la etapa 1, muy temprano; esta flecha la correría más adelante.
*Contra:* el temario define la probabilidad como cociente, no como porcentaje.

**C. Semejanza y proporcionalidad ← Potencias y raíces**
Si dos figuras están en razón *k*, sus áreas están en razón *k²*. Ese salto al cuadrado es el error clásico en modelos a escala.
*Contra:* el temario dice solo "modelos a escala y situaciones reales", sin mencionar áreas ni potencias. Además hoy la relación ya llega indirecta, vía Figuras geométricas.

**D. Medidas de posición ← Enteros y racionales (directa)**
Ordenar datos para sacar cuartiles exige orden en ℚ. Hoy la relación llega indirecta a través de Tablas y gráficos, así que **probablemente no haga falta** — se anota solo para dejar constancia de que se miró.

### Y una que se decidió NO proponer

**Transformaciones isométricas ← Función lineal y afín.** Estaba en el mapa y se quitó. Razón: el temario ubica "puntos y vectores en el plano cartesiano" **dentro del descriptor de Transformaciones isométricas**, así que el plano cartesiano no se importa desde Función lineal y afín. Ver la flecha 6 de la sección 2.

---

## 5. Hoja de firma

Marcar una casilla por flecha. En "modificar", escribir al lado qué debería decir.

### Las 12 sin respaldo — prioridad alta

| # | Flecha | Aprobar | Rechazar | Modificar |
|---|---|:---:|:---:|:---:|
| 1 | Porcentaje ← Enteros y racionales | ☐ | ☐ | ☐ |
| 2 | Expresiones algebraicas ← Enteros y racionales | ☐ | ☐ | ☐ |
| 3 | Proporcionalidad ← Enteros y racionales | ☐ | ☐ | ☐ |
| 4 | Ecuaciones e inecuaciones ← Expresiones algebraicas | ☐ | ☐ | ☐ |
| 5 | ⚠️ Sistemas 2×2 ← Función lineal y afín | ☐ | ☐ | ☐ |
| 6 | Función lineal y afín ← Proporcionalidad | ☐ | ☐ | ☐ |
| 7 | Función lineal y afín ← Ecuaciones e inecuaciones | ☐ | ☐ | ☐ |
| 8 | Función cuadrática ← Expresiones algebraicas | ☐ | ☐ | ☐ |
| 9 | Función cuadrática ← Potencias y raíces | ☐ | ☐ | ☐ |
| 10 | Función cuadrática ← Función lineal y afín | ☐ | ☐ | ☐ |
| 11 | Tablas y gráficos ← Porcentaje | ☐ | ☐ | ☐ |
| 12 | Reglas de probabilidad ← Enteros y racionales | ☐ | ☐ | ☐ |

### Las 10 con respaldo — confirmar

| # | Flecha | Aprobar | Rechazar | Modificar |
|---|---|:---:|:---:|:---:|
| 13 | Potencias y raíces ← Enteros y racionales | ☐ | ☐ | ☐ |
| 14 | Sistemas 2×2 ← Ecuaciones e inecuaciones | ☐ | ☐ | ☐ |
| 15 | Función cuadrática ← Ecuaciones e inecuaciones | ☐ | ☐ | ☐ |
| 16 | Figuras geométricas ← Potencias y raíces | ☐ | ☐ | ☐ |
| 17 | Cuerpos geométricos ← Figuras geométricas | ☐ | ☐ | ☐ |
| 18 | Transformaciones isométricas ← Figuras geométricas | ☐ | ☐ | ☐ |
| 19 | Semejanza y proporcionalidad ← Proporcionalidad | ☐ | ☐ | ☐ |
| 20 | Semejanza y proporcionalidad ← Figuras geométricas | ☐ | ☐ | ☐ |
| 21 | Tablas y gráficos ← Enteros y racionales | ☐ | ☐ | ☐ |
| 22 | Medidas de posición ← Tablas y gráficos | ☐ | ☐ | ☐ |

### Las 4 propuestas — ¿se agregan?

| # | Flecha propuesta | Agregar | Descartar |
|---|---|:---:|:---:|
| A | Porcentaje ← Proporcionalidad | ☐ | ☐ |
| B | Reglas de probabilidad ← Porcentaje | ☐ | ☐ |
| C | Semejanza y proporcionalidad ← Potencias y raíces | ☐ | ☐ |
| D | Medidas de posición ← Enteros y racionales (directa) | ☐ | ☐ |

### Dos preguntas de conjunto

**¿Está bien que Reglas de probabilidad se pueda estudiar en la etapa 1, casi al principio?**

☐ Sí ☐ No — debería ir después de: ____________________

**¿Falta alguna relación que no esté en ninguna lista?**

_______________________________________________________________

_______________________________________________________________

**Firma:** ____________________  **Fecha:** ____________

---

*Cambios en las flechas se hacen en `content/diagnostico/dag-m1.json`. Los tests de `lib/diagnostico/__tests__/` fijan los totales (22 flechas, 10 con respaldo, 12 sin), así que cualquier cambio obliga a actualizar esas cifras a mano — a propósito: para que ninguna flecha se mueva sin que alguien lo decida.*
