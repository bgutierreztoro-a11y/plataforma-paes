# Guion de contenido — Inecuaciones 1: resolver y representar

**Módulo:** Ecuaciones e inecuaciones de primer grado (eje Álgebra y funciones, M1)
**Micro-tema:** Resolución de inecuaciones lineales de una incógnita y representación del conjunto solución
**Posición:** Lección 2 del módulo. Sucede a `ecuaciones-lineales.json` ("La balanza que esconde un número"). Precede a "Inecuaciones 2: problemas en contexto".
**Duración estimada:** 22 a 26 minutos
**Estado:** Guion. NO convertido a JSON. Sin `checklistOriginalidad` ni `revisionMatematica`.

Contenido original. Fuentes de análisis: temario oficial PAES M1 (DEMRE/UCE) solo para alcance y formato de ítems. Ningún enunciado, ejemplo numérico ni feedback proviene de material de terceros.

Cada feedback de error NO revela la respuesta: nombra la confusión específica y redirige la atención. Regla del proyecto: el estudiante descubre, no se le entrega.

---

## Objetivo de aprendizaje

Al terminar, el estudiante puede: (1) resolver una inecuación lineal de una incógnita aplicando la misma operación a ambos lados, (2) reconocer y justificar que multiplicar o dividir por un número negativo invierte el sentido de la desigualdad, (3) representar el conjunto solución en la recta numérica, y (4) distinguir el borde cerrado (≤, ≥) del abierto (<, >).

**Lo que esta lección NO enseña todavía:** traducir enunciados en lenguaje natural a desigualdades, ni interpretar la solución de vuelta en un contexto. Eso es la lección siguiente. Aquí se construye el mecanismo; allá se aplica.

**Conexión con el temario DEMRE:** eje Álgebra y funciones, tema "Ecuaciones e inecuaciones de primer grado". Habilidades: Resolver problemas, Representar, Argumentar.

## Prerrequisitos

1. `ecuaciones-lineales` completa: el principio "la misma operación en ambos lados conserva la igualdad".
2. Orden en los enteros: saber comparar dos negativos (que −3 es mayor que −5).

---

## Nota de diseño obligatoria: por qué la balanza NO sirve acá, y qué la reemplaza

Esta decisión es el eje del guion y se documenta antes de los pasos porque condiciona todo lo demás.

**Por qué la balanza se queda corta.** La balanza de la lección anterior modela el signo `=`: dos platillos que pesan lo mismo. La extensión obvia sería una **balanza desequilibrada** (un platillo más pesado que el otro) para modelar `<`. Y funciona… hasta cierto punto:

- Agregar o quitar el mismo peso de ambos platillos: el lado pesado sigue siendo el pesado. ✓ El sentido se conserva.
- Duplicar o triplicar el contenido de ambos platillos: el lado pesado sigue siendo el pesado. ✓ El sentido se conserva.
- **Multiplicar ambos lados por −2: no existe.** No hay platillo con peso negativo, ni bolsa con −3 bolitas.

O sea: la balanza desequilibrada guarda silencio exactamente en el único caso donde la regla cambia. Peor todavía — al funcionar sin excepción en todos los casos que sí puede representar, **sugiere activamente la conclusión falsa** de que el sentido nunca se invierte. Sería un andamio que enseña el error que la lección quiere desmontar.

Esto no es una objeción nueva: la propia lección de ecuaciones ya la anticipó en su Paso 6 ("la balanza fue el andamio para entenderlo, pero tiene un límite: no existe una bolsa con −3 bolitas"). Esta lección arranca justo donde ese reconocimiento quedó abierto, y esa continuidad narrativa se explicita al estudiante en el Paso 5.

**Qué la reemplaza: la recta numérica con un espejo en el 0.**

La recta numérica modela `<` de forma nativa y sin metáfora: *a < b* significa literalmente "a está a la izquierda de b". Y cada operación permitida es una transformación geométrica visible de la recta:

| Operación | Qué le hace a la recta | ¿Se conserva izquierda/derecha? |
|-----------|------------------------|----------------------------------|
| Sumar o restar k | **Desliza** todo el mismo tramo | Sí — el orden no cambia |
| Multiplicar o dividir por un positivo | **Estira o encoge** desde el 0 | Sí — el orden no cambia |
| Multiplicar o dividir por un negativo | **Refleja** en un espejo puesto en el 0 (y además estira) | **No** — izquierda y derecha se intercambian |

La inversión del sentido deja de ser una regla que hay que memorizar y pasa a ser una consecuencia obligatoria: **un espejo intercambia izquierda con derecha; si "menor" significa "está a la izquierda", entonces reflejar intercambia menor con mayor.** El estudiante lo ve, no lo recibe enunciado.

Ventaja adicional: la misma recta numérica es el objeto donde después se dibuja el conjunto solución (Paso 6), así que la imagen central y la representación pedida por el temario son la misma cosa. No hay dos metáforas compitiendo.

---

# PASO 1 — CURIOSIDAD

**Pantalla 1.1** — bloque `prediccion` (`tipoRespuesta: "seleccionSimple"`)

> Sabes que esto es verdadero:
>
> **3 < 5**
>
> En la lección anterior aprendiste una regla que nunca fallaba: *puedes hacerle la misma operación a ambos lados, y la igualdad se conserva*. Probemos si sigue viva acá.
>
> Multiplica **ambos lados por −1**. La izquierda se convierte en −3. La derecha se convierte en −5.
>
> Antes de seguir, comprométete: ¿la afirmación **−3 < −5** es verdadera o falsa?

Opciones: `["Verdadera", "Falsa"]`.

**Pantalla 1.2** — bloque `texto` (revelación, sin explicar todavía)

> Es **falsa**. −3 no es menor que −5: es **mayor**. En la recta numérica, −5 queda más a la izquierda que −3.
>
> O sea: partimos de algo verdadero, le hicimos exactamente lo mismo a los dos lados —lo que la lección anterior declaró siempre seguro— y llegamos a algo falso.
>
> No es que la regla sea mentira. Es que estabas usando una versión de la regla que servía para el `=` y no para el `<`. En esta lección vas a encontrar **qué le falta** a la regla, y no te lo voy a decir: lo vas a acorralar tú.

**Nota de diseño:** el gancho es la traición de una regla en la que el estudiante ya confía. Eso genera más inversión que cualquier contexto cotidiano. No se corrige ni se explica: la explicación llega en el Paso 5.

**Nota de verificación matemática:** 3 < 5 verdadero. 3·(−1) = −3; 5·(−1) = −5. En la recta, −5 está a la izquierda de −3, luego −5 < −3, equivalentemente −3 > −5. La afirmación "−3 < −5" es falsa. ✓

---

# PASO 2 — PROBLEMA CENTRAL

**Pantalla 2.1** — bloque `seleccion`

> Antes de arreglar la regla hay que saber **qué tan rota está**. Porque si se rompiera con cualquier operación, las inecuaciones serían inservibles.
>
> Partimos siempre de esto, que es verdadero: **4 < 10**.
>
> A cada fila se le aplicó la misma operación a los dos lados. ¿Cuál de estos grupos describe correctamente lo que pasó?

| Operación aplicada a ambos lados | Izquierda | Derecha | ¿Sigue siendo verdadera? |
|---|---|---|---|
| Sumar 6 | 10 | 16 | ¿? |
| Restar 14 | −10 | −4 | ¿? |
| Multiplicar por 3 | 12 | 30 | ¿? |
| Dividir por 2 | 2 | 5 | ¿? |
| Multiplicar por −1 | −4 | −10 | ¿? |
| Dividir por −2 | −2 | −5 | ¿? |

Opciones:

- **(a)** Se rompen solo las dos últimas: multiplicar por −1 y dividir por −2. ✅
- **(b)** Se rompen las tres que terminan con números negativos: restar 14, multiplicar por −1 y dividir por −2.
- **(c)** Se rompen todas las que involucran multiplicar o dividir; sumar y restar siempre son seguras.

**Feedback por opción:**

- **(a) correcta:** "Eso es. Y fíjate en lo que dejaste fuera: restar 14 llenó los dos lados de números negativos y aun así la afirmación siguió siendo verdadera (−10 < −4 es cierto). Entonces el problema NO son los negativos en general. Es algo más fino, y ya lo tienes cercado."
- **(b):** "Revisa la fila de restar 14 con cuidado: quedó −10 a la izquierda y −4 a la derecha. ¿Es cierto que −10 < −4? Sí lo es: −10 está más a la izquierda en la recta. Aparecieron negativos y la afirmación aguantó. Entonces 'que haya negativos' no puede ser el criterio. ¿Qué tienen en común las otras dos que sí se rompieron, y que esta no tiene?"
- **(c):** "Multiplicar por 3 dio 12 < 30, y dividir por 2 dio 2 < 5. Las dos siguen siendo verdaderas. Así que multiplicar y dividir no son peligrosos por sí solos. Compara esas dos filas con las dos últimas: ¿en qué se diferencia el número por el que multiplicaste o dividiste?"

**Nota de verificación matemática (recalculada desde cero, partiendo de 4 < 10):**

- Sumar 6: 4 + 6 = 10; 10 + 6 = 16. ¿10 < 16? **Sí.** Verdadera. ✓
- Restar 14: 4 − 14 = −10; 10 − 14 = −4. ¿−10 < −4? **Sí** (−10 está a la izquierda de −4). Verdadera. ✓
- Multiplicar por 3: 4·3 = 12; 10·3 = 30. ¿12 < 30? **Sí.** Verdadera. ✓
- Dividir por 2: 4÷2 = 2; 10÷2 = 5. ¿2 < 5? **Sí.** Verdadera. ✓
- Multiplicar por −1: 4·(−1) = −4; 10·(−1) = −10. ¿−4 < −10? **No** (−4 está a la derecha de −10). **Falsa.** ✓
- Dividir por −2: 4÷(−2) = −2; 10÷(−2) = −5. ¿−2 < −5? **No** (−2 está a la derecha de −5). **Falsa.** ✓

Exactamente dos filas se rompen, y ambas tienen en común que el multiplicador o divisor es negativo. La fila "restar 14" es el control experimental deliberado: produce dos números negativos sin romper nada, y es lo que descarta la hipótesis intuitiva "los negativos dan vuelta las desigualdades". Sin esa fila el estudiante saldría con la regla correcta por la razón equivocada.

---

# PASO 3 — PENSAR (intento sin ayuda)

**Pantalla 3.1** — bloque `numerica`, dos campos

> Todavía no arreglamos la regla, pero hay un montón de inecuaciones donde el problema ni siquiera aparece. Esta es una:
>
> **3x − 4 < 11**
>
> **Parte 1.** Resuélvela igual que una ecuación: deja la x sola aplicando la misma operación a ambos lados. ¿Cuál es el mayor número **entero** que cumple?
>
> **Parte 2 — comprobación.** Toma el entero que respondiste, súmale 1, y reemplaza ese nuevo valor en 3x − 4. ¿Cuánto da?

Campos: `mayorEntero` (respuesta correcta **4**), `comprobacion` (respuesta correcta **11**).

**Feedback por error previsto:**

- **mayorEntero = 5** → "Casi. Llegaste bien a que x tiene que ser menor que 5, pero fíjate en el signo: es `<`, no `≤`. ¿El propio 5 cumple? Reemplaza: 3·5 − 4 = 11, y 11 no es menor que 11. El 5 queda justo afuera."
- **mayorEntero = 14** → "Llegaste a 3x < 15 y te detuviste ahí. Pero 15 es el peso de las TRES equis juntas: todavía falta repartir, dividir ambos lados por 3." *(error-1..5 del módulo: **error-4**)*
- **mayorEntero = 2** → "Restaste el 4 cuando había que sumarlo. El término es −4, así que para eliminarlo se suma 4 en ambos lados: 3x < 11 + 4. Revisa esa dirección." *(**error-2**)*
- **comprobacion = 8** → "Reemplazaste el entero que ya habías respondido, no el siguiente. La Parte 2 pide sumarle 1 primero: si respondiste 4, evalúa en 5."

**Nota de verificación matemática:** 3x − 4 < 11. Se suma 4 a ambos lados (operación que desliza, no invierte): 3x < 15. Se divide por 3, que es **positivo**, así que el sentido se conserva: x < 5. Mayor entero que cumple: **4**. Comprobación: 3·4 − 4 = 12 − 4 = 8, y 8 < 11 ✓. El siguiente entero, 5: 3·5 − 4 = 15 − 4 = **11**, y 11 < 11 es falso ✓ — el 5 queda excluido, que es justo lo que la Parte 2 hace tocar con la mano. Distractor 14: proviene de 3x < 15 sin dividir (el mayor entero menor que 15). Distractor 2: proviene de 3x < 7 → x < 7/3 ≈ 2,33, mayor entero 2.

**Nota de diseño:** el ejercicio usa solo divisiones por positivo a propósito. El estudiante debe comprobar que el método viejo funciona intacto en la mayoría de los casos, para que la excepción del Paso 5 se sienta como una excepción y no como "todo lo anterior era mentira". La Parte 2 no es decorativa: es la primera vez que toca el borde abierto sin que se lo nombren.

---

# PASO 4 — PISTAS

Bloque `pistas`, `condicionActivacion: "ambos"`.

**Pista 1 (suave):**
> El −4 estorba para dejar la x sola. ¿Qué operación lo cancela? Y recuerda la regla de la lección anterior: háesela idéntica a los dos lados.

**Pista 2 (media):**
> Sumando 4 a ambos lados queda **3x < 15**. Ojo: eso dice que las tres equis juntas valen menos de 15, no que x valga menos de 15. Falta un paso.

**Pista 3 (casi la respuesta):**
> Divide ambos lados por 3 —y como 3 es positivo, el signo `<` se queda igual—: x < 5. Ahora la pregunta fina: ¿el 5 mismo cumple? Reemplázalo en 3x − 4 y compáralo con 11 antes de responder.

---

# PASO 5 — DESCUBRIMIENTO

**Pantalla 5.1** — bloque `texto`

> Hora de arreglar la regla. Y para eso hay que cambiar de dibujo.
>
> La balanza de la lección pasada servía para el `=`: dos platillos que pesan lo mismo. Para el `<` podrías imaginar una balanza **desnivelada**, y funcionaría… para sumar y restar, y para duplicar. Pero se cae justo donde la necesitas: **no existe un platillo con peso negativo**. La balanza no tiene nada que decir sobre multiplicar por −1, que es exactamente el caso que te traicionó en la primera pantalla.
>
> (Esto ya lo sabías: la lección de ecuaciones lo dijo con todas sus letras — "no existe una bolsa con −3 bolitas". Ahí ese límite era una nota al margen. Acá es el tema.)
>
> Cambiemos de imagen: **la recta numérica**.

**Pantalla 5.2** — bloque `visualizacion` (`variante: "diagrama"`)

> En la recta numérica, `a < b` no es una metáfora de nada: significa literalmente **"a está a la izquierda de b"**.
>
> Mira qué le hace cada operación a la recta completa:

Datos para el diagrama (tres bandas apiladas, cada una una recta numérica con los puntos 4 y 10 marcados):

| Banda | Operación | Qué se ve | Posición de los puntos |
|---|---|---|---|
| 1 | Original | Recta con 4 y 10 | 4 a la izquierda de 10 |
| 2 | Sumar 6 | Toda la recta **se desliza** 6 lugares a la derecha | 10 a la izquierda de 16 — mismo orden |
| 3 | Multiplicar por 3 | Toda la recta **se estira** desde el 0 | 12 a la izquierda de 30 — mismo orden |
| 4 | Multiplicar por −1 | Aparece un **espejo en el 0** y la recta se da vuelta | −4 a la **derecha** de −10 — orden intercambiado |

**Pantalla 5.3** — bloque `pregunta` (selección múltiple A–D, 4 alternativas)

> Con el espejo a la vista: ¿por qué multiplicar por un negativo invierte el sentido de la desigualdad?

| Alt | Opción | Correcta | Error asociado |
|-----|--------|----------|----------------|
| A | Porque el espejo del 0 intercambia izquierda con derecha, y "menor" significa "está a la izquierda". | ✅ | — |
| B | Porque los números negativos son más chicos, así que todo se hace más chico. | ❌ | NUEVO — "los negativos achican" |
| C | Porque al multiplicar por un negativo hay que cambiarle el signo también al resultado. | ❌ | NUEVO — confunde invertir el signo `<` con cambiar el signo del número |
| D | Porque multiplicar siempre invierte el sentido, sea por positivo o por negativo. | ❌ | NUEVO — generaliza de más |

**Feedback:**

- **B:** "Multiplicar por −1 no achica: −10 no es 'más chico' que 10 en tamaño, tiene exactamente el mismo tamaño. Lo que cambió no es el tamaño, es de qué lado del 0 quedó cada uno. Mira el diagrama otra vez y fíjate solo en el orden izquierda-derecha."
- **C:** "Cuidado con la palabra 'signo', que acá significa dos cosas distintas. Está el signo de un número (−4 tiene signo negativo) y está el signo de la desigualdad (`<` o `>`). Lo que se da vuelta es el segundo. Los números ya cambiaron de signo solos al multiplicar; no se les cambia dos veces."
- **D:** "Vuelve a la tabla del Paso 2: multiplicar por 3 dio 12 < 30, que sigue siendo verdadera. Multiplicar por un positivo estira la recta pero no la da vuelta. ¿Qué tenía de distinto el −1?"

**Nota de verificación matemática:** partiendo de 4 < 10. Multiplicar por 3: 12 y 30, |12| < |30|, 12 a la izquierda de 30, orden conservado ✓ — esto refuta D. Multiplicar por −1: −4 y −10, ambos con el mismo tamaño que sus originales (4 y 10), luego no hubo "achicamiento" ✓ — esto refuta B. La única transformación que intercambia el orden izquierda-derecha es la reflexión respecto de 0, que es precisamente lo que hace multiplicar por un negativo. Única correcta: A.

**Pantalla 5.4** — bloque `texto` (la regla, ya ganada)

> Ahí está la regla completa, la que le faltaba una línea:
>
> > **Puedes hacerle cualquier operación a una inecuación, siempre que se la hagas idéntica a los dos lados. El sentido se conserva… salvo si multiplicas o divides por un número negativo. En ese caso, y solo en ese, el sentido se da vuelta.**
>
> Fíjate en lo que la regla NO dice: no dice "si aparecen negativos". En el Paso 2 restaste 14 y te llenaste de negativos sin que pasara nada. Lo que importa es **por qué número** multiplicas o divides, no qué números terminan apareciendo.

---

# PASO 6 — GENERALIZACIÓN

**Pantalla 6.1** — bloque `texto` (la regla aplicada a un caso con inversión)

> Veámosla trabajar. Resuelve conmigo:
>
> **−2x + 1 ≥ 9**
>
> Resto 1 a ambos lados (deslizar, no invierte): **−2x ≥ 8**.
> Divido ambos lados por **−2**. Es negativo: el `≥` se da vuelta y queda `≤`.
> **x ≤ −4**
>
> Comprobación, siempre: probemos x = −5, que cumple x ≤ −4. Reemplazo: −2·(−5) + 1 = 10 + 1 = 11, y 11 ≥ 9 ✓. Ahora probemos x = −3, que NO cumple: −2·(−3) + 1 = 6 + 1 = 7, y 7 ≥ 9 es falso ✓. La solución quedó del lado correcto.

**Pantalla 6.2** — bloque `texto` (el conjunto solución y los bordes)

> Una diferencia grande con las ecuaciones: una ecuación lineal tiene **una** solución. Una inecuación tiene **infinitas**, y por eso no se responde con un número sino con un **conjunto solución**, que se dibuja en la recta.
>
> Y ahí importa el borde:
>
> | Signo | Se lee | El borde | Se dibuja |
> |---|---|---|---|
> | x < 5 | menor que 5 | **NO** incluido | punto **abierto** (círculo vacío) en 5, sombreado hacia la izquierda |
> | x ≤ 5 | menor o igual que 5 | **SÍ** incluido | punto **cerrado** (relleno) en 5, sombreado hacia la izquierda |
> | x > 5 | mayor que 5 | **NO** incluido | punto **abierto** en 5, sombreado hacia la derecha |
> | x ≥ 5 | mayor o igual que 5 | **SÍ** incluido | punto **cerrado** en 5, sombreado hacia la derecha |
>
> La rayita de abajo en `≤` y `≥` es literalmente el `=` escondido: dice "y también vale el que está justo ahí". Es lo que comprobaste en el Paso 3 cuando el 5 quedó afuera por un pelo.

**Pantalla 6.3** — bloque `numerica`, un campo

> Tu turno con inversión incluida. Resuelve:
>
> **−5x > 20**
>
> ¿Cuál es el mayor número **entero** que cumple?

Campo `mayorEntero`, respuesta correcta **−5**.

**Feedback por error previsto:**

- **−4** → "Dividiste bien por −5 y diste vuelta el signo, pero el borde te jugó una mala pasada: la solución es x < −4, y el `<` deja al −4 afuera. Reemplaza: −5·(−4) = 20, y 20 > 20 es falso. El mayor entero que sí cumple es el que viene justo antes."
- **−3** → "Revisa si diste vuelta el sentido. Al dividir por −5 (negativo) el `>` tiene que convertirse en `<`. Si lo dejaste como `>`, te quedaste con x > −4, que es el conjunto equivocado: prueba −3 en la inecuación original y mira qué pasa."
- **15** → "Restaste 5 en vez de dividir por −5. El −5 está **multiplicando** a la x, así que se cancela dividiendo, no restando." *(**error-4** del módulo, en su variante de no repartir por el coeficiente)*

**Nota de verificación matemática:** −5x > 20. Se divide por −5, negativo, luego el sentido se invierte: x < 20÷(−5) = −4, es decir **x < −4**. Comprobación del interior: x = −5 → −5·(−5) = 25, y 25 > 20 ✓ cumple. Comprobación del borde: x = −4 → −5·(−4) = 20, y 20 > 20 es **falso** ✓ el borde queda excluido, coherente con el `<`. Comprobación exterior: x = −3 → −5·(−3) = 15, y 15 > 20 es falso ✓. Mayor entero de x < −4: **−5**. El distractor −4 es el borde abierto tomado como incluido; el distractor −3 es el resultado de no invertir el sentido (daría x > −4, cuyo menor entero sería −3 y que un estudiante apurado puede leer como "el entero de la frontera por el otro lado").

---

# PASO 7 — PRÁCTICA

**Pantalla 7.1** — bloque `seleccion`

> Para resolver **7x + 2 < 30**, ¿cuál de estos pasos **rompe** la inecuación (o sea, da un conjunto solución distinto)?

- **(a)** Restar 2 en ambos lados, quedando 7x < 28.
- **(b)** Restar 2 solo al lado izquierdo, quedando 7x < 30. ✅
- **(c)** Dividir ambos lados por 7 después de tener 7x < 28, quedando x < 4.

**Feedback:**

- **(a):** "Ese paso es válido: restas lo mismo (2) a los dos lados, la recta se desliza entera y el orden se conserva. La pregunta pide el paso que SÍ rompe."
- **(b) correcta:** "Ese es. Le quitaste 2 a un lado y no al otro, así que ya no es la misma comparación. 7x < 30 da x < 30/7 ≈ 4,29, que no es lo mismo que x < 4." *(**error-1** del módulo)*
- **(c):** "Ese paso es válido: 7 es positivo, así que dividir por 7 estira la recta sin darla vuelta y el `<` se queda igual. Llegas a x < 4, que es correcto."

**Nota de verificación matemática:** 7x + 2 < 30 → 7x < 28 → x < 4 (7 positivo, sentido conservado). Comprobación: x = 3 → 21 + 2 = 23 < 30 ✓; x = 4 → 28 + 2 = 30 < 30 falso ✓ (borde abierto correcto). La opción (b) produce 7x < 30 → x < 30/7 ≈ 4,286, conjunto estrictamente mayor que el correcto (incluye por ejemplo x = 4,1, que en la original da 7·4,1 + 2 = 30,7, y 30,7 < 30 es falso) ✓ — efectivamente rompe.

**Pantalla 7.2** — bloque `verdaderoFalso`

> "Restar 9 a ambos lados de una inecuación invierte su sentido, porque los resultados pueden quedar negativos."

**Correcta: Falso.**

- **Feedback si responde Falso:** "Correcto. Restar desliza la recta completa: los dos puntos se mueven el mismo tramo en la misma dirección, así que el que estaba a la izquierda sigue a la izquierda. Que aparezcan números negativos no tiene nada que ver — es justo lo que comprobaste en el Paso 2 restando 14."
- **Feedback si responde Verdadero:** "Pruébalo con números antes de decidir: parte de 2 < 6, que es verdadera, y resta 9 a ambos lados. Quedan −7 y −3. ¿Es cierto que −7 < −3? Fíjate cuál está más a la izquierda en la recta. La inversión tiene una sola causa, y no es 'que aparezcan negativos'."

**Nota de verificación matemática:** 2 < 6 es verdadera. 2 − 9 = −7; 6 − 9 = −3. ¿−7 < −3? Sí (−7 está a la izquierda de −3) ✓. El sentido se conservó pese a que ambos resultados son negativos. La afirmación es falsa ✓.

**Pantalla 7.3** — bloque `numerica`, dos campos (el contraste `≤` vs `<`)

> Dos inecuaciones casi gemelas. La única diferencia está en el signo del medio.
>
> **Parte 1.** En **4x + 3 ≤ 19**, ¿cuál es el mayor número entero que cumple?
> **Parte 2.** En **4x + 3 < 19**, ¿cuál es el mayor número entero que cumple?

Campos: `mayorEnteroCerrado` (correcta **4**), `mayorEnteroAbierto` (correcta **3**).

**Feedback por error previsto:**

- **mayorEnteroAbierto = 4** → "Las dos partes no pueden dar lo mismo: esa es toda la gracia del ejercicio. Reemplaza x = 4 en la Parte 2: 4·4 + 3 = 19, y ¿19 es menor que 19? El `<` no admite el empate."
- **mayorEnteroCerrado = 3** → "Te pasaste de cauteloso. En la Parte 1 el signo es `≤`, que sí admite el empate: 4·4 + 3 = 19, y 19 ≤ 19 es verdadero. El 4 sí cumple."
- **cualquiera = 16** → "Llegaste a 4x ≤ 16 y respondiste ahí. Falta repartir: divide ambos lados por 4." *(**error-4**)*

**Nota de verificación matemática:** 4x + 3 ≤ 19 → 4x ≤ 16 → x ≤ 4 (4 positivo, sentido conservado). Borde: x = 4 → 16 + 3 = 19, y 19 ≤ 19 **verdadero** ✓, luego el 4 pertenece y es el mayor entero. Para 4x + 3 < 19 → 4x < 16 → x < 4. Borde: x = 4 → 19 < 19 **falso** ✓, el 4 queda excluido; x = 3 → 12 + 3 = 15 < 19 ✓, luego el mayor entero es **3**. El par comparte todos los números y difiere solo en el borde: es el aislamiento limpio de la variable "tipo de borde".

---

# PASO 8 — APLICACIÓN

**Pantalla 8.1** — bloque `numerica`, un campo

> Un refugio de montaña tiene **45 cm de nieve acumulada** en su ladera de práctica. Con el deshielo, la capa pierde **6 cm cada día**. La ladera solo puede usarse mientras queden **al menos 15 cm** de nieve.
>
> ¿Cuántos días completos, contando desde hoy, se puede seguir usando la ladera?

Campo `diasUtiles`, respuesta correcta **5**.

**Feedback por error previsto:**

- **10** → "Calculaste en cuántos días se acaba toda la nieve (45 ÷ 6 = 7,5) o algo parecido, pero la ladera deja de servir mucho antes: no se necesita que la nieve llegue a cero, se necesita que no baje de 15 cm. Vuelve a armar la inecuación con ese 15 adentro."
- **6** → "Estás a un día de distancia. Revisa el borde: al día 6 quedan 45 − 36 = 9 cm, y 9 no alcanza los 15 que se piden. Al día 5 quedan exactamente 15, y como el enunciado dice 'al menos 15', ese día todavía sirve."
- **4** → "Te quedaste corto por el borde. Al día 5 quedan exactamente 15 cm. 'Al menos 15' incluye el 15 justo, así que el día 5 todavía cuenta."
- **30** → "Ese es el resultado de 45 − 15, la nieve que puede perderse en total. Es un paso intermedio correcto, pero la pregunta es de **días**: falta repartir esos 30 cm entre los 6 cm que se pierden cada día." *(**error-4**)*

**Pantalla 8.2** — bloque `abierta` (`mostrarRespuestaModelo: true`)

> Escríbelo en símbolos. Llama **d** al número de días transcurridos y arma la inecuación que representa la condición "quedan al menos 15 cm".

**Respuesta modelo:** `45 − 6d ≥ 15`

**Nota de verificación matemática (dos caminos, ambos recalculados):**

*Camino 1 (con inversión):* 45 − 6d ≥ 15. Resto 45 a ambos lados: −6d ≥ −30. Divido por **−6**, negativo, luego invierto: d ≤ (−30)÷(−6) = **5**.

*Camino 2 (sin inversión):* 45 − 6d ≥ 15. Sumo 6d a ambos lados: 45 ≥ 15 + 6d. Resto 15: 30 ≥ 6d. Divido por 6, positivo: 5 ≥ d, o sea **d ≤ 5**.

Los dos caminos coinciden ✓. Comprobación directa: d = 5 → 45 − 30 = 15, y 15 ≥ 15 **verdadero** ✓ (el borde cerrado es el que hace que el día 5 cuente). d = 6 → 45 − 36 = 9, y 9 ≥ 15 **falso** ✓. d = 4 → 45 − 24 = 21 ≥ 15 ✓. Respuesta: **5 días**.

*Por qué cada distractor es plausible y no un número al azar:* **6** es el error de borde en la dirección permisiva (incluir un día que ya no cumple); **4** es el error de borde en la dirección restrictiva (excluir el día que cumple justo, por desconfiar del empate); **30** es el numerador de la última división, el mismo tipo de error que error-4 en la lección de ecuaciones (quedarse en `a·x = c` y entregar c); **10** proviene de ignorar el umbral de 15 y trabajar con la nieve total.

**Nota de diseño:** este paso es la primera vez que la inversión aparece dentro de un contexto y no en una inecuación pelada. Se muestran los dos caminos a propósito: **la inversión se puede evitar** moviendo el término en vez de dividir por el negativo. Saber eso es un seguro contra el error más caro del tema, y además le quita dramatismo a la regla — no es una trampa, es una de dos rutas.

---

# PASO 9 — REFLEXIÓN

**Pantalla 9.1** — bloque `abierta` (sin corrección automática)

> En tus palabras: ¿por qué multiplicar los dos lados por un número negativo obliga a dar vuelta el signo, si multiplicar por uno positivo no? Explícalo usando la recta numérica.

**Nota de diseño:** se guarda anonimizada para el piloto. Una respuesta tipo "porque el negativo da vuelta la recta como un espejo, y el que estaba a la izquierda queda a la derecha" indica que entendió el mecanismo. Una respuesta tipo "porque es la regla" indica memorización, que es exactamente lo que esta lección intenta evitar.

**Pantalla 9.2** — bloque `texto`

> Los tres errores que más se repiten con inecuaciones, y que ya viste por dentro:
>
> 1. **No invertir el sentido** al multiplicar o dividir por un negativo.
> 2. **Invertirlo de más**: darlo vuelta cuando solo se sumó o restó, o cuando el número era positivo.
> 3. **Equivocarse de borde**: tratar `<` como si incluyera el extremo, o `≤` como si lo excluyera.
>
> Las alternativas incorrectas de la PAES se construyen casi siempre con uno de esos tres. Ahora los conoces por dentro.

---

# PASO 10 — CONSOLIDACIÓN

**Pantalla 10.1** — bloque `texto`

> **Lo que te llevas:**
> - Una inecuación se resuelve como una ecuación: la misma operación a ambos lados.
> - Con **una** excepción: multiplicar o dividir por un **negativo** invierte el sentido. Nada más lo invierte.
> - El porqué: en la recta numérica, "menor" es "está a la izquierda", y multiplicar por un negativo la refleja como un espejo puesto en el 0. Un espejo intercambia izquierda con derecha.
> - Que aparezcan números negativos en el resultado **no** invierte nada. Importa por qué número multiplicas, no qué números salen.
> - La respuesta no es un número sino un **conjunto solución**: infinitos valores, dibujados en la recta.
> - Borde **cerrado** (`≤`, `≥`, punto relleno) incluye el extremo; borde **abierto** (`<`, `>`, punto vacío) lo deja afuera.
> - Truco de seguridad: si te incomoda dividir por un negativo, muévelo al otro lado sumando y divide por un positivo. Se llega a lo mismo.
>
> **Lo que viene:** ahora sabes resolverlas. Falta lo otro: **darse cuenta de que un problema pide una inecuación**, traducir frases como "a lo más", "al menos" o "alcanza para", y leer la respuesta de vuelta en el contexto. Eso es la próxima lección.

---

# CIERRE — ÍTEMS FORMATO PAES (3 ítems originales)

Selección múltiple, 4 alternativas A–D, respuesta única, formato DEMRE M1. Números distintos a los usados en cualquier paso previo de esta lección y de `ecuaciones-lineales.json`.

---

## Ítem PAES 1 — Habilidad: **resolver** · Dificultad: **media**

> ¿Cuál es el conjunto solución de la inecuación **6x + 5 < 2x + 29**?
>
> A) x < 6
> B) x < 3
> C) x < 24
> D) x > 6

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | **error-5** (reunir las incógnitas sumando en vez de restar) |
| C | ❌ | **error-4** (no dividir por el coeficiente) |
| D | ❌ | NUEVO — inversión injustificada del sentido |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. Se resta 2x en ambos lados (6x − 2x = 4x): 4x + 5 < 29. Se resta 5: 4x < 24. Se divide por 4, que es positivo, así que el `<` se mantiene: x < 6."
- **B):** "Al juntar las equis de los dos lados las sumaste (6x + 2x = 8x) en vez de restarlas. La x de la derecha se pasa a la izquierda restando: 6x − 2x = 4x, no 8x."
- **C):** "Llegaste bien a 4x < 24, pero te detuviste ahí. Ese 24 es el peso de las cuatro equis juntas: falta dividir ambos lados por 4."
- **D):** "El resultado numérico está bien, pero diste vuelta el sentido sin motivo. Repasa cuándo se invierte: solo al multiplicar o dividir por un **negativo**. Acá restaste y dividiste por 4, que es positivo — nada se da vuelta."

**Nota de verificación matemática:** 6x + 5 < 2x + 29. Restando 2x: 4x + 5 < 29. Restando 5: 4x < 24. Dividiendo por 4 (positivo, sentido conservado): **x < 6**. Comprobación interior: x = 5 → izquierda 6·5 + 5 = 35; derecha 2·5 + 29 = 39; 35 < 39 ✓. Borde: x = 6 → izquierda 41; derecha 41; 41 < 41 **falso** ✓ (correctamente excluido). Exterior: x = 7 → 47 vs 43; 47 < 43 falso ✓.

*Plausibilidad de cada distractor:* **B (x < 3)** sale del camino 8x + 5 < 29 → 8x < 24 → x < 3, exactamente el error-5 ya catalogado en la lección de ecuaciones y ya usado en su ítem PAES 1. **C (x < 24)** es el estado intermedio 4x < 24 leído como respuesta final: error-4, el más frecuente del módulo. **D (x > 6)** es la respuesta correcta con el sentido invertido, y es el distractor específico de esta lección: castiga a quien aprendió "en las inecuaciones hay que dar vuelta el signo" sin la condición. Los números están elegidos para que los cuatro resultados sean enteros limpios y ninguno coincida con otro.

---

## Ítem PAES 2 — Habilidad: **representar** · Dificultad: **media**

> El conjunto solución de una inecuación es **x ≥ −2**. ¿Cuál de las siguientes representaciones en la recta numérica le corresponde?
>
> A) Un punto **relleno** en −2, con la recta sombreada **hacia la derecha**.
> B) Un punto **vacío** en −2, con la recta sombreada **hacia la derecha**.
> C) Un punto **relleno** en −2, con la recta sombreada **hacia la izquierda**.
> D) Un punto **relleno** en **2**, con la recta sombreada **hacia la derecha**.

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | NUEVO — borde abierto/cerrado confundido |
| C | ❌ | NUEVO — dirección del sombreado invertida |
| D | ❌ | NUEVO — se pierde el signo del extremo |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. El `≥` incluye al −2, y eso se dibuja con el punto relleno; 'mayor' es 'a la derecha' en la recta, y hacia allá va el sombreado."
- **B):** "La dirección está bien, pero el punto vacío dice que el −2 **no** pertenece a la solución. Fíjate en la rayita de abajo del `≥`: es un `=` escondido, y significa que el −2 sí cumple. Punto relleno."
- **C):** "El borde está bien marcado, pero sombreaste hacia el lado equivocado. 'x mayor o igual que −2' son los números que están **a la derecha** de −2 en la recta: −1, 0, 5… Los de la izquierda (−3, −7) son menores."
- **D):** "Marcaste el 2 en vez del −2. Son puntos distintos de la recta, en lados opuestos del 0: x ≥ 2 dejaría fuera al 0 y al −1, que sí cumplen x ≥ −2."

**Nota de verificación matemática:** x ≥ −2 tiene borde cerrado (el `≥` incluye la igualdad), luego punto relleno en −2 ✓. El conjunto son todos los números mayores o iguales que −2, que en la recta numérica quedan a la derecha de −2, luego sombreado hacia la derecha ✓. Verificaciones puntuales: x = −2 pertenece (−2 ≥ −2 verdadero) ✓; x = 0 pertenece (0 ≥ −2) ✓; x = −3 no pertenece (−3 ≥ −2 falso) ✓, y −3 está a la izquierda de −2, coherente con el sombreado. Única correcta: A.

*Plausibilidad de cada distractor:* cada uno altera exactamente **una** de las tres decisiones del dibujo (tipo de borde, dirección, ubicación del extremo), dejando las otras dos correctas. Eso permite diagnosticar cuál de las tres decisiones falló, en vez de que un error se esconda detrás de otro.

---

## Ítem PAES 3 — Habilidad: **argumentar** · Dificultad: **alta**

> Un estudiante resuelve la inecuación **−3x + 2 > 14** de esta forma:
>
> > Paso 1: resto 2 a ambos lados → −3x > 12
> > Paso 2: divido ambos lados por −3 → x > −4
>
> ¿Es correcto su desarrollo?
>
> A) No: al dividir por −3, que es negativo, hay que invertir el sentido. El resultado correcto es x < −4.
> B) Sí: los dos pasos aplican la misma operación a ambos lados, así que el desarrollo es válido.
> C) No: el error está en el Paso 1, donde debió sumar 2 en vez de restarlo.
> D) No: al dividir por −3 hay que invertir el sentido **y** cambiar el signo del resultado, quedando x < 4.

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | NUEVO — no invertir al dividir por negativo |
| C | ❌ | **error-2** (equivocar la dirección al mover un término), aquí como diagnóstico falso |
| D | ❌ | NUEVO — invertir el sentido y además cambiarle el signo al número |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. El Paso 1 está bien: restar 2 a ambos lados desliza la recta y no invierte nada. El Paso 2 es el que falla: dividir por −3 refleja la recta, así que el `>` tiene que convertirse en `<`. Queda x < −4."
- **B):** "Es cierto que aplicó la misma operación a ambos lados, y esa parte del método está bien. Pero eso alcanzaba para las ecuaciones; para las inecuaciones falta la segunda mitad de la regla. Comprueba con un número: x = 0 cumple x > −4. Reemplaza x = 0 en la inecuación original: −3·0 + 2 = 2. ¿Es 2 > 14?"
- **C):** "El Paso 1 está correcto: el término es +2, así que para eliminarlo se resta 2 en ambos lados, y 14 − 2 = 12. Ahí no hubo error. Mira de nuevo el Paso 2 y qué tipo de número es el −3."
- **D):** "Acertaste que hay que invertir el sentido, pero le cambiaste el signo dos veces al mismo número. El 12 dividido por −3 ya da −4; ese signo negativo salió de la división. Invertir el sentido es dar vuelta el símbolo `>`, no volver a tocar el número."

**Nota de verificación matemática:** −3x + 2 > 14. Paso 1 (correcto): restar 2 a ambos lados → −3x > 12. Paso 2: dividir por −3, que es **negativo**, obliga a invertir → x < 12÷(−3) = **−4**. Comprobación del conjunto correcto: x = −5 → −3·(−5) + 2 = 15 + 2 = 17, y 17 > 14 ✓ pertenece, y en efecto −5 < −4. x = 0 → −3·0 + 2 = 2, y 2 > 14 **falso** ✓ no pertenece, y en efecto 0 no cumple x < −4 — esto es lo que refuta directamente la alternativa B, porque bajo x > −4 el 0 debería pertenecer. Borde: x = −4 → 12 + 2 = 14, y 14 > 14 falso ✓ correctamente excluido por el borde abierto. La alternativa D propone x < 4, que incluiría x = 0, ya descartado ✓.

*Plausibilidad de cada distractor:* **B** es el error puro del tema (aplicar el método de ecuaciones sin la excepción) y es la respuesta que daría quien no hizo esta lección. **C** es un diagnóstico falso dirigido a quien sabe que "algo está mal" pero busca el error en el lugar equivocado — el paso más familiar. **D** es el sobreajuste: quien aprendió la regla pero la aplica dos veces, confundiendo el signo de la desigualdad con el signo del número, que es exactamente la confusión que el Paso 5 alternativa C ya había anticipado.

---

# Catálogo de errores usado (referencia cruzada)

Errores reutilizados de `content/lecciones/ecuaciones-lineales.json` (los mismos cinco de `content/errores/ecuaciones-inecuaciones.json`). **No se creó ningún id nuevo en este guion.**

| Id | Descripción (abreviada) | Dónde se usa acá |
|----|--------------------------|------------------|
| error-1 | Operar en un solo lado, rompiendo el equilibrio | Paso 7.1-b |
| error-2 | Equivocar el signo o la dirección al mover un término | Paso 3 (distractor 2); Ítem PAES 3-C (como diagnóstico falso) |
| error-4 | Olvidar dividir por el coeficiente | Paso 3 (distractor 14); Paso 6.3 (distractor 15); Paso 7.3 (distractor 16); Paso 8 (distractor 30); Ítem PAES 1-C |
| error-5 | Al reunir las incógnitas, sumarlas en vez de restarlas | Ítem PAES 1-B |

`error-3` (repartir solo una parte de un lado) no aparece en este guion: ninguna situación diseñada lo produce de forma natural. Se ejercita en la lección de ecuaciones y reaparece en el cierre del módulo. No se forzó un distractor artificial con tal de cubrirlo.

# Contextos numéricos usados (para no chocar entre lecciones)

Ninguna de estas expresiones aparece en `ecuaciones-lineales.json` ni en `content/cierres/cierre-ecuaciones-lineales.json`.

- Paso 1: `3 < 5` multiplicado por −1 → −3 vs −5.
- Paso 2: `4 < 10` sometida a +6, −14, ×3, ÷2, ×(−1), ÷(−2).
- Paso 3: `3x − 4 < 11` → x < 5; mayor entero 4; comprobación en x = 5 da 11.
- Paso 5: `4 < 10` reutilizada en el diagrama del espejo (misma pareja del Paso 2, a propósito: el estudiante ya la calculó y acá solo la ve transformada).
- Paso 6.1: `−2x + 1 ≥ 9` → x ≤ −4.
- Paso 6.3: `−5x > 20` → x < −4; mayor entero −5.
- Paso 7.1: `7x + 2 < 30` → x < 4.
- Paso 7.2: `2 < 6` restando 9 → −7 < −3.
- Paso 7.3: `4x + 3 ≤ 19` → x ≤ 4 (mayor entero 4) y `4x + 3 < 19` → x < 4 (mayor entero 3).
- Paso 8: `45 − 6d ≥ 15` → d ≤ 5.
- Ítem PAES 1: `6x + 5 < 2x + 29` → x < 6.
- Ítem PAES 2: conjunto `x ≥ −2` en la recta numérica.
- Ítem PAES 3: `−3x + 2 > 14` → x < −4.

Nota: `x < −4` aparece dos veces (Paso 6.3 y Ítem PAES 3), pero desde inecuaciones distintas (`−5x > 20` y `−3x + 2 > 14`). Se deja así deliberadamente: repetir el conjunto solución con otro camino refuerza que el resultado no depende de los números particulares. Si en revisión se prefiere que no se repita, el Ítem PAES 3 admite cambiar el 14 por 20 (`−3x + 2 > 20` → x < −6) sin tocar nada más de su estructura.

---

# ERRORES NUEVOS PROPUESTOS

Ninguno tiene id asignado. Son propuestas de descripción para que **Benja decida el id y si entran al catálogo** de `content/errores/ecuaciones-inecuaciones.json`. Ningún distractor de este guion los referencia por id.

1. **No invertir el sentido de la desigualdad al multiplicar o dividir ambos lados por un número negativo, aplicando el método de las ecuaciones sin su excepción.**
   *Aparece en:* Paso 6.3 (distractor −3), Ítem PAES 3-B.

2. **Invertir el sentido de la desigualdad sin que corresponda: al sumar o restar, o al multiplicar/dividir por un número positivo, por creer que "en las inecuaciones siempre se da vuelta el signo".**
   *Aparece en:* Paso 5.3-D, Paso 7.2 (respuesta Verdadero), Ítem PAES 1-D.

3. **Confundir el signo de la desigualdad con el signo del número: al invertir el sentido, cambiarle además el signo al resultado (o al revés, cambiar el signo del número creyendo que eso invierte el sentido).**
   *Aparece en:* Paso 5.3-C, Ítem PAES 3-D.

4. **Tratar un borde abierto como cerrado: incluir el valor extremo en el conjunto solución cuando el signo es `<` o `>`.**
   *Aparece en:* Paso 3 (distractor 5), Paso 6.3 (distractor −4), Paso 7.3 Parte 2 (distractor 4), Paso 8 (distractor 6), Ítem PAES 2-B.

5. **Tratar un borde cerrado como abierto: excluir el valor extremo cuando el signo es `≤` o `≥`, por desconfiar del caso de igualdad exacta.**
   *Aparece en:* Paso 7.3 Parte 1 (distractor 3), Paso 8 (distractor 4).

6. **Invertir la dirección del conjunto solución al representarlo en la recta numérica: sombrear hacia el lado contrario al que indica el signo.**
   *Aparece en:* Ítem PAES 2-C.

7. **Creer que la presencia de números negativos en el resultado invierte el sentido de la desigualdad, confundiendo "aparecieron negativos" con "multipliqué por un negativo".**
   *Aparece en:* Paso 2-b, Paso 7.2 (respuesta Verdadero).

Observación para la decisión: los errores 4 y 5 son la misma dimensión (el borde) en direcciones opuestas, igual que los errores 1 y 2 son la misma dimensión (la inversión) en direcciones opuestas. Podrían catalogarse como dos ids o como cuatro. La lección de ecuaciones optó por ids finos (error-2 cubre "sumar cuando corresponde restar, o restar cuando corresponde sumar" en un solo id, o sea el criterio ahí fue **una dimensión = un id**). Si se mantiene ese criterio, esto serían 4 ids nuevos, no 7. La decisión es tuya.

---

# CANDIDATOS A VERIFICAR

Sustantivos y dominios nuevos introducidos en este guion, uno por línea, listos para pasar por `scripts/consultar-fuentes.mjs`. **No se ejecutó el script desde esta sesión** (regla dura de CLAUDE.md: el hilo que redacta contenido no consulta las fuentes aisladas por ningún medio propio).

```
refugio de montaña
nieve acumulada
ladera de práctica
deshielo
espejo en el cero
recta numérica reflejada
```

Notas para quien corra la verificación:

- Los primeros cuatro términos son **el único dominio de contexto nuevo** del guion (Paso 8). Todo el resto de la lección es matemática pelada: inecuaciones sin escena, recta numérica y bordes. Eso reduce a un solo escenario la superficie que hay que verificar.
- Los dos últimos términos no son un dominio del mundo real sino la **imagen didáctica** central (el espejo en el 0). Se listan igual porque, si esa metáfora aparece formulada casi igual en alguna fuente del corpus, conviene saberlo antes de comprometerla: es el eje del guion y reescribirla después sería caro.
- Si "refugio de montaña" o "nieve acumulada" salen COLISIÓN, el Paso 8 necesita otro dominio con la misma estructura (una cantidad que **disminuye** a ritmo constante y un umbral mínimo que no puede cruzarse). La estructura es lo que importa; el escenario es reemplazable sin tocar la matemática ni los distractores.

---

# Notas de implementación

- **Tipos de bloque usados:** `prediccion` (1), `seleccion` (2), `numerica` (4), `verdaderoFalso` (1), `visualizacion` (1), `pregunta` (1), `pistas` (1), `abierta` (2), `texto` (varios). Todos existen en `TIPOS_BLOQUE_VALIDOS` (`lib/tipos.ts`); no requiere ampliar el schema.
- **El bloque `visualizacion` del Paso 5.2 es el único que necesita render nuevo:** una recta numérica con puntos marcados y una animación de reflexión. Si eso no está disponible al momento de implementar, degradar a `variante: "diagrama"` estático con las cuatro bandas apiladas — el punto pedagógico sobrevive sin animación, pero **no** sobrevive sin la imagen: no reemplazar por texto.
- **Pistas:** solo en el Paso 4 (el intento central), igual que en la lección de ecuaciones. En práctica y en los ítems PAES el feedback por distractor cumple esa función.
- **Estado al nacer:** `borrador`. Sin `checklistOriginalidad` ni `revisionMatematica` — los firma Benja a mano después de la revisión real, nunca Claude Code.
- **Antes de convertir a JSON:** correr `scripts/consultar-fuentes.mjs` con los CANDIDATOS A VERIFICAR de arriba, y decidir los ids de los ERRORES NUEVOS PROPUESTOS. Los distractores que hoy no llevan `errorCatalogado` quedan así hasta que esos ids existan.
