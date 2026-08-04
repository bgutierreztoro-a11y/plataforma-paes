# Guion de contenido — Inecuaciones 2: problemas en contexto

**Módulo:** Ecuaciones e inecuaciones de primer grado (eje Álgebra y funciones, M1)
**Micro-tema:** Modelamiento de situaciones con inecuaciones lineales e interpretación de la solución en el contexto
**Posición:** Lección 3 del módulo. Sucede a "Inecuaciones 1: resolver y representar". Cierra el módulo.
**Duración estimada:** 24 a 28 minutos
**Estado:** Guion. NO convertido a JSON. Sin `checklistOriginalidad` ni `revisionMatematica`.

Contenido original. Fuentes de análisis: temario oficial PAES M1 (DEMRE/UCE) solo para alcance y formato de ítems. Ningún enunciado, ejemplo numérico ni feedback proviene de material de terceros.

Cada feedback de error NO revela la respuesta: nombra la confusión específica y redirige la atención.

---

## Objetivo de aprendizaje

Al terminar, el estudiante puede: (1) traducir enunciados en lenguaje natural a una inecuación lineal, distinguiendo el sentido (`<`, `>`) del borde (`≤`, `≥`), (2) resolver esa inecuación con el método de la lección anterior, y (3) **interpretar el conjunto solución de vuelta en el contexto**, incluyendo decidir cuándo la respuesta debe ser un número entero y en qué dirección se redondea.

**Lo que esta lección NO enseña:** el mecanismo de resolución (viene dado de la lección anterior) ni sistemas de inecuaciones. Acá el trabajo difícil está antes y después de resolver, no durante.

**Conexión con el temario DEMRE:** eje Álgebra y funciones, tema "Ecuaciones e inecuaciones de primer grado". Habilidades: Modelar, Resolver problemas, Argumentar.

## Prerrequisitos

1. `ecuaciones-lineales`: modelar una situación con una ecuación.
2. "Inecuaciones 1": resolver una inecuación lineal, la inversión del sentido con negativos, y la diferencia entre borde abierto y cerrado.

---

## Nota de diseño obligatoria: dónde está realmente la dificultad

En esta lección la matemática es **más fácil** que en la anterior — casi todas las inecuaciones se resuelven en dos pasos y sin inversión de sentido. El error no está en resolver. Está en los dos extremos:

**Extremo de entrada (traducir).** El castellano codifica dos decisiones independientes en una sola frase, y las esconde:

1. **La dirección:** ¿el conjunto va hacia arriba o hacia abajo?
2. **El borde:** ¿el número mencionado pertenece o no al conjunto?

"A lo más 30" y "menos de 30" apuntan en la misma dirección pero difieren en el borde. "Al menos 30" y "a lo más 30" comparten el borde (ambas lo incluyen) y difieren en la dirección. Un estudiante que trata la traducción como una sola decisión acierta la mitad de las veces por azar. La lección separa las dos decisiones explícitamente y las hace visibles en una tabla de dos entradas.

**Extremo de salida (interpretar).** El conjunto solución es continuo (infinitos valores, muchos con decimales), pero el contexto casi siempre exige un entero — y **la dirección del redondeo la decide el contexto, no la matemática**. El Paso 8 lo demuestra con el caso más duro posible: la misma división, `150 ÷ 12 = 12,5`, redondeada hacia arriba en una pregunta y hacia abajo en la otra, con los mismos números y el mismo escenario. Ninguna regla mecánica de redondeo sobrevive a ese par. La única salida es volver a leer qué se está contando.

---

# PASO 1 — CURIOSIDAD

**Pantalla 1.1** — bloque `prediccion` (`tipoRespuesta: "seleccionSimple"`)

> Dos carteles. El mismo número en los dos.
>
> **Cartel A** (en un ascensor de carga): *"La carga no puede superar los 450 kg."*
> **Cartel B** (en las bases de un torneo): *"Para clasificar se necesitan al menos 450 puntos."*
>
> Pregunta: si tienes **exactamente 450** —450 kg de carga, o 450 puntos—, ¿en cuál de los dos casos cumples la condición?

Opciones: `["Solo en el cartel A", "Solo en el cartel B", "En los dos", "En ninguno"]`.

**Pantalla 1.2** — bloque `texto`

> **En los dos.**
>
> "No puede superar 450" significa *hasta 450 inclusive*: 450 no lo supera. "Al menos 450" significa *450 o más*: 450 alcanza justo.
>
> Y sin embargo los dos carteles describen conjuntos **opuestos**. El del ascensor deja pasar 300 kg y rechaza 600. El del torneo rechaza 300 puntos y acepta 600.
>
> Ahí está el asunto de esta lección: cada frase del castellano esconde **dos decisiones distintas** —hacia qué lado va, y si el número que menciona entra o no—, y hay que tomarlas por separado. Confundir una sola de las dos te cambia la respuesta completa.
>
> Ya sabes resolver inecuaciones. Lo que falta es lo de antes y lo de después.

**Nota de diseño:** el gancho es que el número obvio (450) NO es el que discrimina. Los que responden "solo A" o "solo B" están leyendo la dirección y proyectándola sobre el borde. Los que responden "en ninguno" leen ambas frases como estrictas. Las tres respuestas incorrectas son informativas y las tres se corrigen con la misma tabla del Paso 5.

---

# PASO 2 — PROBLEMA CENTRAL

**Pantalla 2.1** — bloque `seleccion`

> Un equipo de un **torneo escolar de robótica** lleva **34 puntos** acumulados de las rondas anteriores. En la ronda final, **cada desafío que resuelvan suma 7 puntos**. Para clasificar a la etapa siguiente necesitan **al menos 90 puntos** en total.
>
> Antes de calcular nada: ¿cuál de estas expresiones representa la condición "clasifican"?

- **(a)** 34 + 7d ≥ 90 ✅
- **(b)** 34 + 7d > 90
- **(c)** 34 + 7d ≤ 90
- **(d)** 7d ≥ 90

**Feedback por opción:**

- **(a) correcta:** "Exacto. Los 34 que ya tienen, más 7 por cada desafío resuelto, tienen que llegar a 90 **o más**: por eso `≥` y no `>`. Si terminan con exactamente 90 puntos, clasifican."
- **(b):** "La dirección está bien: necesitan llegar arriba de cierta cantidad. Pero fíjate en el borde: si terminan con exactamente 90 puntos, ¿clasifican o no? 'Al menos 90' significa 90 o más, así que 90 sirve. Tu expresión los dejaría fuera por un punto que sí tenían."
- **(c):** "Diste vuelta la dirección. Tu expresión dice que clasifican los que sacan 90 **o menos**, o sea que un equipo con 20 puntos clasificaría y uno con 100 no. Vuelve a leer: ¿qué lado del 90 es el bueno?"
- **(d):** "El ritmo está bien (7 puntos por desafío), pero perdiste el punto de partida: el equipo no arranca de cero, ya lleva 34 puntos acumulados. Esos 34 tienen que estar en la expresión."

**Nota de verificación matemática:** la condición es "puntaje total ≥ 90", con puntaje total = 34 + 7d, donde d es el número de desafíos resueltos. Luego 34 + 7d ≥ 90 ✓. Las expresiones alternativas se descartan con casos concretos: con d = 8 el total es 34 + 56 = 90, que **sí** clasifica según el enunciado; la opción (b) lo excluiría ✗. La opción (c) admitiría d = 0 (34 ≤ 90 verdadero), lo que significaría clasificar sin resolver ningún desafío ✗. La opción (d) admitiría d = 13 con 7·13 = 91 ≥ 90 sin contar los 34 iniciales, y también excluiría d = 8, que sí clasifica ✗.

---

# PASO 3 — PENSAR (intento sin ayuda)

**Pantalla 3.1** — bloque `numerica`, dos campos

> Con la expresión que elegiste: **34 + 7d ≥ 90**.
>
> **Parte 1.** ¿Cuál es el **mínimo** número de desafíos que el equipo debe resolver para clasificar?
> **Parte 2 — comprobación.** ¿Con cuántos puntos exactos terminan si resuelven ese número mínimo de desafíos?

Campos: `desafiosMinimos` (correcta **8**), `puntajeFinal` (correcta **90**).

**Feedback por error previsto:**

- **desafiosMinimos = 9** → "Estás a un desafío de distancia, y el motivo es el borde. Con 8 desafíos llegan a 34 + 56 = 90 puntos exactos. Como la condición dice 'al menos 90', esos 90 justos **sí** clasifican. El 9 sería necesario solo si pidieran superar los 90."
- **desafiosMinimos = 7** → "Con 7 desafíos suman 34 + 49 = 83 puntos, y 83 no llega a 90. Prueba con uno más."
- **desafiosMinimos = 56** → "Llegaste bien a 7d ≥ 56, pero ese 56 son los puntos que faltan, no los desafíos. Todavía falta repartir: cada desafío aporta 7 puntos." *(**error-4** del módulo)*
- **desafiosMinimos = 13** → "Repartiste los 90 puntos entre los 7 de cada desafío (90 ÷ 7 ≈ 12,9 → 13) sin descontar antes los 34 que el equipo ya tenía. Esos 34 no hay que ganarlos de nuevo." *(**error-3** del módulo)*
- **puntajeFinal = 56** → "Ese es el aporte de los 8 desafíos (7 × 8 = 56), pero la pregunta es el puntaje **total**: faltan los 34 con que venían."

**Nota de verificación matemática:** 34 + 7d ≥ 90. Restando 34 a ambos lados (desliza, no invierte): 7d ≥ 56. Dividiendo por 7, **positivo**, el sentido se conserva: d ≥ 8. Como d cuenta desafíos, es un entero ≥ 0, y el mínimo entero que cumple d ≥ 8 es **8**. Comprobación del borde: d = 8 → 34 + 7·8 = 34 + 56 = **90**, y 90 ≥ 90 **verdadero** ✓ clasifica. Comprobación del anterior: d = 7 → 34 + 49 = 83, y 83 ≥ 90 **falso** ✓ no clasifica. El 8 es efectivamente el mínimo.

*Plausibilidad de los distractores:* **9** es el error de borde (leer "al menos" como estricto), el mismo que el Paso 1 anticipó y el que reaparece en el Ítem PAES 3. **7** es el vecino por abajo, que aparece si se resuelve 34 + 7d ≥ 90 con un redondeo mecánico hacia abajo de 56/7. **56** y **13** son errores ya catalogados en la lección de ecuaciones (error-4 y error-3), que sobreviven intactos al cambiar de `=` a `≥`.

---

# PASO 4 — PISTAS

Bloque `pistas`, `condicionActivacion: "ambos"`.

**Pista 1 (suave):**
> Los 34 puntos ya están ganados: no dependen de cuántos desafíos resuelvan. ¿Qué operación los saca de la inecuación sin romperla?

**Pista 2 (media):**
> Restando 34 a ambos lados queda **7d ≥ 56**. Eso dice cuántos puntos les faltan conseguir, no cuántos desafíos. Falta un paso.

**Pista 3 (casi la respuesta):**
> Divide ambos lados por 7 —positivo, así que el `≥` no se da vuelta—: d ≥ 8. Ahora lo importante: como d cuenta desafíos, tiene que ser un número entero. ¿Cuál es el entero más chico que cumple d ≥ 8? Ojo con el borde: `≥` incluye al 8.

---

# PASO 5 — DESCUBRIMIENTO

**Pantalla 5.1** — bloque `seleccion` (el estudiante construye la tabla, no la recibe)

> Cuatro carteles reales, cuatro preguntas del mismo tipo. En cada uno: **¿el número que aparece cumple la condición?**
>
> 1. *"Cupo máximo: 30 personas."* — Llegan exactamente 30. ¿Pueden entrar?
> 2. *"Se necesitan al menos 30 firmas."* — Juntaron exactamente 30. ¿Alcanza?
> 3. *"Se requieren más de 30 votos."* — Obtuvieron exactamente 30. ¿Alcanza?
> 4. *"El grupo debe tener menos de 30 integrantes."* — El grupo tiene exactamente 30. ¿Cumple?
>
> ¿Cuál de estos resúmenes describe correctamente lo que pasó?

- **(a)** En los carteles 1 y 2 el número sí cumple; en los carteles 3 y 4, no. ✅
- **(b)** En los carteles 1 y 4 el número sí cumple; en los carteles 2 y 3, no.
- **(c)** El número nunca cumple: si el cartel lo menciona como límite, es porque queda afuera.
- **(d)** El número siempre cumple: mencionarlo significa que está permitido.

**Feedback por opción:**

- **(a) correcta:** "Eso es. Y mira lo que acabas de separar: los carteles 1 y 2 apuntan en direcciones **opuestas** (uno pone un techo, el otro un piso) y aun así los dos **incluyen** el 30. Los carteles 3 y 4 también apuntan en direcciones opuestas entre sí, y los dos lo **excluyen**. O sea: la dirección y el borde son dos preguntas independientes."
- **(b):** "Agrupaste por dirección, no por borde. Es cierto que 1 y 4 ponen un techo, y que 2 y 3 ponen un piso — pero esa no era la pregunta. La pregunta era si el 30 mismo cumple. Vuelve a leer solo el cartel 2: 'al menos 30 firmas', y juntaron 30. ¿Les falta alguna?"
- **(c):** "El cartel 1 dice 'cupo máximo 30'. Si entran 30 personas exactas, ¿se pasaron del cupo? No: llegaron justo al límite y el límite está permitido. Un máximo es un valor alcanzable, no prohibido."
- **(d):** "El cartel 3 dice 'más de 30 votos', y obtuvieron 30. ¿Es 30 más que 30? No: es igual que 30. Ahí el número mencionado queda afuera."

**Pantalla 5.2** — bloque `texto` (recién ahora se formaliza lo que el estudiante ya separó)

> Lo que acabas de descubrir se ordena en una tabla de **dos entradas**, porque son dos decisiones:

| | **El número mencionado SÍ entra** | **El número mencionado NO entra** |
|---|---|---|
| **Hacia abajo** (techo) | `≤` — "a lo más", "como máximo", "no más de", "no puede superar" | `<` — "menos de", "por debajo de" |
| **Hacia arriba** (piso) | `≥` — "al menos", "como mínimo", "no menos de", "a partir de" | `>` — "más de", "supera", "por sobre" |

> Dos preguntas, siempre en este orden:
>
> 1. **¿Hacia dónde?** ¿La condición pone un techo (no pasarse) o un piso (llegar)?
> 2. **¿El número entra?** Si la frase admite el empate exacto, lleva rayita (`≤`, `≥`). Si exige pasarse, no la lleva (`<`, `>`).
>
> La trampa más cara está en la primera fila: **"no puede superar 30" incluye el 30.** Suena a prohibición, pero prohíbe *superarlo*, no *alcanzarlo*. Es la frase que más ítems de la PAES arruina.

**Nota de verificación (lógica, no aritmética):** cartel 1, "cupo máximo 30" ⇒ p ≤ 30; con p = 30, 30 ≤ 30 verdadero ✓ entra. Cartel 2, "al menos 30 firmas" ⇒ f ≥ 30; con f = 30, 30 ≥ 30 verdadero ✓ entra. Cartel 3, "más de 30 votos" ⇒ v > 30; con v = 30, 30 > 30 falso ✓ no entra. Cartel 4, "menos de 30 integrantes" ⇒ i < 30; con i = 30, 30 < 30 falso ✓ no entra. Agrupación por borde: {1, 2} incluyen, {3, 4} excluyen ✓. Agrupación por dirección: {1, 4} techo, {2, 3} piso — cruzada respecto de la anterior, que es justo lo que prueba la independencia de las dos decisiones.

---

# PASO 6 — GENERALIZACIÓN

**Pantalla 6.1** — bloque `texto`

> Todo problema de este tipo tiene el mismo esqueleto de tres tiempos:
>
> 1. **Modelar** — poner nombre a la incógnita y escribir la inecuación. Acá se deciden la dirección y el borde.
> 2. **Resolver** — el método de la lección anterior. La misma operación a ambos lados; el sentido se invierte solo si multiplicas o divides por un negativo.
> 3. **Interpretar** — volver al contexto y responder lo que se preguntó.
>
> El paso 2 es el que practicaste hasta el cansancio. Los pasos 1 y 3 son donde se pierden los puntos.

**Pantalla 6.2** — bloque `texto` (el punto duro: el entero)

> Hay algo que la inecuación no sabe y tú sí: **qué estás contando.**
>
> Resuelves y te queda, digamos, **t ≥ 12,5**. Matemáticamente, 12,5 y 12,7 y 13,2 son todas soluciones válidas: el conjunto es continuo. Pero si t son **tarros de pintura**, no existe medio tarro que puedas comprar. La respuesta tiene que ser entera.
>
> ¿Y hacia dónde se redondea? **No hay regla.** Depende de qué se está contando:
>
> - Si necesitas **cubrir** una exigencia (`≥`), quedarte corto no sirve: se redondea **hacia arriba**. 12,5 tarros → **13 tarros**.
> - Si estás **limitado** por un recurso (`≤`), pasarse no está permitido: se redondea **hacia abajo**. 12,5 murales posibles → **12 murales**.
>
> Fíjate en lo incómodo del asunto: **el mismo número, 12,5, se redondea para lados distintos.** Lo que decide no es el decimal, es la pregunta. En el próximo paso lo vas a ver con los mismos números, en el mismo escenario, en dos preguntas seguidas.

---

# PASO 7 — PRÁCTICA

**Pantalla 7.1** — bloque `seleccion`

> Un letrero en un bote de remos dice: *"No puede llevar más de 8 personas."* Si **p** es el número de personas a bordo, ¿qué inecuación lo representa?

- **(a)** p ≤ 8 ✅
- **(b)** p < 8
- **(c)** p ≥ 8
- **(d)** p > 8

**Feedback:**

- **(a) correcta:** "Correcto. 'No puede llevar más de 8' prohíbe pasar de 8, pero permite llegar a 8. Con 8 personas el bote está en su límite y cumple."
- **(b):** "La dirección está bien, el borde no. Tu expresión deja fuera a las 8 personas justas, pero el letrero solo prohíbe llevar **más** de 8. Ocho personas no son más de ocho."
- **(c):** "Diste vuelta la dirección. Tu expresión dice que el bote debe llevar 8 personas **o más**, o sea que con 3 personas estaría infringiendo el letrero. Es al revés: 8 es un techo, no un piso."
- **(d):** "Escribiste justo lo que el letrero **prohíbe**. 'Más de 8' es la situación no permitida; lo que se pide es la condición que sí se cumple."

**Pantalla 7.2** — bloque `verdaderoFalso`

> "Las expresiones 'al menos 20' y 'más de 20' significan lo mismo."

**Correcta: Falso.**

- **Feedback si responde Falso:** "Correcto. Las dos apuntan hacia arriba, pero se diferencian en el borde: 'al menos 20' incluye el 20 (`≥`), 'más de 20' lo excluye (`>`). Con exactamente 20 cumples la primera y no la segunda."
- **Feedback si responde Verdadero:** "Pruébalo con el caso del borde, que es el único donde se distinguen: si tienes exactamente 20, ¿tienes al menos 20? ¿Y tienes más de 20? Las dos respuestas no coinciden — ahí está la diferencia."

**Pantalla 7.3** — bloque `numerica`, dos campos

> El instructivo de un ascensor de carga dice: *"El peso total no puede superar los 300 kg."* El operario que lo acompaña pesa **72 kg**.
>
> **Parte 1.** ¿Cuál es el mayor peso **entero**, en kg, que puede tener la carga?
> **Parte 2.** Si el instructivo dijera *"el peso total debe ser menor que 300 kg"*, ¿cuál sería entonces el mayor peso entero de la carga?

Campos: `cargaMaxCerrado` (correcta **228**), `cargaMaxAbierto` (correcta **227**).

**Feedback por error previsto:**

- **cargaMaxAbierto = 228** → "Las dos partes no pueden dar lo mismo: en eso consiste el ejercicio. Con 228 kg de carga el total es 72 + 228 = 300 exactos, y la Parte 2 exige que el total sea **menor** que 300. Ese kilo de más te deja afuera."
- **cargaMaxCerrado = 227** → "Te sobró cautela. En la Parte 1 la condición es 'no puede superar 300', y 300 no supera a 300: el total de 300 kg justos está permitido, así que la carga puede llegar a 228 kg."
- **cualquiera = 300** → "Ese es el límite del **total**, no de la carga. El operario también va arriba y pesa 72 kg: esos 72 ocupan parte del límite."
- **cualquiera = 372** → "Sumaste los 72 kg del operario en vez de descontarlos. Su peso consume parte de los 300 disponibles, no los amplía."

**Nota de verificación matemática:** *Parte 1.* Condición "peso total no puede superar 300" ⇒ 72 + c ≤ 300. Restando 72 a ambos lados: c ≤ 228. Comprobación del borde: c = 228 → total 72 + 228 = 300, y 300 ≤ 300 **verdadero** ✓ permitido; c = 229 → total 301, y 301 ≤ 300 falso ✓ excluido. Mayor entero: **228**. *Parte 2.* Condición "peso total menor que 300" ⇒ 72 + c < 300 ⇒ c < 228. Borde: c = 228 → total 300, y 300 < 300 **falso** ✓ excluido; c = 227 → total 299, y 299 < 300 ✓ permitido. Mayor entero: **227**. El par comparte todos los datos y difiere solo en el borde, aislando esa única variable.

---

# PASO 8 — APLICACIÓN

**Pantalla 8.1** — bloque `numerica`, dos campos (el contraste de redondeo, mismos números)

> Un grupo de vecinos va a pintar un **mural comunitario** de **150 m²**. Cada tarro de pintura alcanza para cubrir **12 m²**.
>
> **Parte 1.** ¿Cuántos tarros como **mínimo** tienen que comprar para poder pintar el mural completo?
> **Parte 2.** Otra pregunta, con los mismos datos: si ya tienen pintura suficiente para **150 m²** en total, ¿cuántos murales **completos** de 12 m² cada uno podrían pintar con ella?

Campos: `tarrosMinimos` (correcta **13**), `muralesCompletos` (correcta **12**).

**Feedback por error previsto:**

- **tarrosMinimos = 12** → "Con 12 tarros cubres 12 × 12 = 144 m², y el mural tiene 150. Te quedan 6 m² sin pintar. Cuando el resultado da 12,5 y lo que necesitas es **cubrir**, quedarse en 12 deja el trabajo a medias."
- **tarrosMinimos = 12,5** → "Matemáticamente 12,5 es correcto, pero la pregunta es cuántos tarros **comprar**, y no venden medio tarro. Falta el último paso: decidir hacia qué lado se redondea, y para eso hay que mirar qué pasa si te quedas corto."
- **muralesCompletos = 13** → "Ojo: acá la respuesta va para el otro lado. Con pintura para 150 m², trece murales necesitarían 13 × 12 = 156 m², y no tienes tanta. El decimotercero quedaría incompleto, y la pregunta pide murales **completos**."
- **muralesCompletos = 12,5** → "Mismo dato que en la Parte 1, misma división, pero acá tampoco puede quedar en decimal: no existe medio mural completo. Piensa qué significa el 0,5 sobrante en esta pregunta y si te sirve de algo."

**Pantalla 8.2** — bloque `abierta` (`mostrarRespuestaModelo: true`)

> Las dos partes salieron de la **misma** división: 150 ÷ 12 = 12,5. Y sin embargo una se redondeó a 13 y la otra a 12.
>
> En tus palabras: ¿qué fue lo que decidió la dirección del redondeo? No fue el 0,5.

**Respuesta modelo:** "Lo decidió qué se está contando. En la Parte 1 los tarros tienen que **cubrir** una exigencia de 150 m² (12t ≥ 150), y 12 tarros se quedan cortos, así que hay que subir a 13. En la Parte 2 los murales están **limitados** por la pintura disponible (12m ≤ 150), y 13 murales se pasarían, así que hay que bajar a 12. Cuando la inecuación es `≥` se redondea hacia arriba; cuando es `≤`, hacia abajo."

**Nota de verificación matemática (ambas partes recalculadas desde cero):**

*Parte 1.* Sea t el número de tarros. Cada tarro cubre 12 m², así que cubren 12t m², y deben alcanzar los 150 m² del mural: **12t ≥ 150**. Dividiendo por 12 (positivo, sentido conservado): t ≥ 12,5. Como t es entero, el mínimo entero que cumple t ≥ 12,5 es **13**. Comprobación: 13 tarros → 13 × 12 = 156 m², y 156 ≥ 150 ✓ alcanza. 12 tarros → 144 m², y 144 ≥ 150 **falso** ✓ no alcanza. Respuesta 13 ✓.

*Parte 2.* Sea m el número de murales completos. Consumen 12m m², y no pueden pasarse de los 150 m² disponibles: **12m ≤ 150**. Dividiendo por 12: m ≤ 12,5. Como m es entero, el máximo entero que cumple m ≤ 12,5 es **12**. Comprobación: 12 murales → 144 m², y 144 ≤ 150 ✓ alcanza la pintura. 13 murales → 156 m², y 156 ≤ 150 **falso** ✓ no alcanza. Respuesta 12 ✓.

Misma división (150 ÷ 12 = 12,5), redondeos opuestos, ambos verificados por sustitución directa en los dos enteros vecinos.

**Nota de diseño:** este par es el corazón de la lección y la razón de que los números sean 150 y 12 y no otros — se eligieron para que la división dé un decimal **exactamente en el medio** (12,5). Con 12,3 o 12,8 un estudiante podría acertar por instinto de "redondeo normal" (hacia el entero más cercano) sin entender nada; con 12,5 el redondeo escolar es ambiguo y la única forma de decidir es leer el contexto. Si en revisión se cambian los números, **conservar la propiedad de que el decimal sea 0,5**, o el paso pierde su filo.

---

# PASO 9 — REFLEXIÓN

**Pantalla 9.1** — bloque `abierta` (sin corrección automática)

> Un compañero te dice: *"Si el problema dice 'a lo más', pongo el signo `≤`, y listo."* ¿Qué le falta a esa receta? Dale un ejemplo donde le falle.

**Nota de diseño:** se guarda anonimizada para el piloto. La receta del compañero no está **mal**, está **incompleta**: acierta el signo pero no dice nada del último paso (interpretar, redondear, responder lo que se preguntó). Una respuesta que apunte a eso —o que note que después hay que volver al contexto— indica que la lección se entendió como un ciclo de tres tiempos y no como una tabla de traducción. Una respuesta que solo repita la tabla indica que el Paso 6 y el 8 no aterrizaron.

**Pantalla 9.2** — bloque `texto`

> Los tres errores que más se repiten cuando un problema se modela con una inecuación:
>
> 1. **Errar el borde:** leer "al menos 90" o "no puede superar 450" como si el número mencionado quedara afuera.
> 2. **Errar la dirección:** poner un techo donde iba un piso, casi siempre por leer rápido la frase y no la situación.
> 3. **No aterrizar la respuesta:** entregar 12,5 tarros, o redondear para el lado equivocado.
>
> Los dos primeros se corrigen con la tabla de dos entradas. El tercero no se corrige con ninguna tabla: se corrige releyendo qué se preguntó.

---

# PASO 10 — CONSOLIDACIÓN

**Pantalla 10.1** — bloque `texto`

> **Lo que te llevas:**
> - Toda frase de condición esconde **dos** decisiones: la dirección (techo o piso) y el borde (¿entra el número mencionado?). Se toman por separado.
> - Incluyen el número: "a lo más", "como máximo", "no puede superar", "al menos", "como mínimo" → `≤`, `≥`.
> - Lo excluyen: "menos de", "más de", "supera", "por debajo de" → `<`, `>`.
> - La trampa cara: **"no puede superar 30" permite el 30.** Prohíbe superarlo, no alcanzarlo.
> - Tres tiempos siempre: modelar → resolver → **interpretar**. El tercero es el que más puntos cuesta.
> - El conjunto solución es continuo, pero la respuesta suele ser entera. **El contexto decide hacia qué lado se redondea:** hacia arriba si hay que cubrir una exigencia, hacia abajo si un recurso te limita.
>
> **Con esto cierras el módulo de ecuaciones e inecuaciones de primer grado:** sabes despejar una incógnita, sabes resolver una desigualdad y sabes cuándo un problema del mundo real pide una u otra.

---

# CIERRE — ÍTEMS FORMATO PAES (3 ítems originales)

Selección múltiple, 4 alternativas A–D, respuesta única, formato DEMRE M1. Números distintos a los de los pasos previos.

---

## Ítem PAES 1 — Habilidad: **modelar** · Dificultad: **media**

> Un ascensor de carga tiene un letrero que dice: *"El peso total no puede superar los 450 kg."* Adentro ya hay **120 kg** de herramientas fijas. Se quieren subir cajas iguales de **25 kg** cada una.
>
> Si **c** es el número de cajas, ¿cuál inecuación representa la condición del letrero?
>
> A) 120 + 25c ≤ 450
> B) 120 + 25c < 450
> C) 120 + 25c ≥ 450
> D) 25c ≤ 450

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | NUEVO — borde cerrado tratado como abierto |
| C | ❌ | NUEVO — dirección invertida al traducir |
| D | ❌ | NUEVO — omitir la constante al modelar |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. Las herramientas (120 kg) más las cajas (25 kg cada una) forman el peso total, que puede llegar hasta 450 pero no pasarlo: por eso `≤`."
- **B):** "La dirección y los términos están bien; falla el borde. 'No puede superar 450' prohíbe pasar de 450, no llegar a 450. Un total de exactamente 450 kg cumple el letrero, y tu expresión lo dejaría fuera."
- **C):** "Diste vuelta la dirección. Tu expresión pide que el peso total sea 450 kg **o más**, o sea que subir una sola caja sería una infracción y llenar el ascensor sería lo correcto. El letrero dice lo contrario: 450 es un techo."
- **D):** "Modelaste bien las cajas, pero dejaste fuera los 120 kg de herramientas, que ya están arriba y también pesan. El límite de 450 es para el **total**, no solo para lo que se sube después."

**Nota de verificación matemática:** peso total = 120 + 25c. La condición "no puede superar 450" se traduce como total ≤ 450, con borde cerrado porque *superar* significa estrictamente pasar. Luego **120 + 25c ≤ 450** ✓. Resolviendo (aunque el ítem pide el modelo, no el valor): 25c ≤ 330 → c ≤ 13,2 → como c es entero, c ≤ 13. Comprobación: c = 13 → 120 + 325 = 445, y 445 ≤ 450 ✓ permitido; c = 14 → 120 + 350 = 470, y 470 ≤ 450 falso ✓ excluido.

*Plausibilidad de cada distractor:* cada uno rompe exactamente **una** de las tres decisiones del modelado (borde, dirección, completitud de los términos) y deja las otras dos intactas, lo que permite diagnosticar cuál falló. **D** es además el eco directo del error que la opción (d) del Paso 2 ya había expuesto — si el estudiante lo repite acá, es señal de que no consolidó.

---

## Ítem PAES 2 — Habilidad: **resolver** · Dificultad: **alta**

> En el taller de un colegio queda **700 gramos** de filamento para la impresora 3D. Cada pieza que imprimen consume **45 gramos**. ¿Cuántas piezas **completas** alcanzan a imprimir con el filamento disponible?
>
> A) 15
> B) 16
> C) 15,5
> D) 14

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | NUEVO — redondear hacia arriba donde el recurso limita |
| C | ❌ | NUEVO — no interpretar que la respuesta debe ser entera |
| D | ❌ | NUEVO — estimar con un dato redondeado sin verificar el borde |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. La condición es 45p ≤ 700, que da p ≤ 15,55…. Como las piezas son enteras y el filamento **limita**, se redondea hacia abajo: 15 piezas usan 675 g, y sobran 25 g que no alcanzan para una más."
- **B):** "Redondeaste hacia arriba, pero acá el filamento es lo que te **limita**: no puedes usar más del que tienes. Comprueba 16 piezas: 16 × 45 = 720 g, y solo quedan 700. Te faltarían 20 g."
- **C):** "El cálculo está bien (700 ÷ 45 ≈ 15,55), pero la respuesta todavía no está aterrizada: media pieza no es una pieza completa, y el enunciado pide piezas completas. Falta decidir hacia qué lado se redondea, mirando si el filamento te limita o si tienes que cubrir algo."
- **D):** "Parece que redondeaste los 45 g a 50 para calcular más rápido (700 ÷ 50 = 14). El atajo cuesta caro acá: con los 45 g reales cada pieza consume menos, así que alcanzan más piezas de las que estimaste. Comprueba cuánto usan 15 piezas."

**Nota de verificación matemática:** sea p el número de piezas. Consumen 45p gramos y no pueden pasar de los 700 disponibles: **45p ≤ 700**. Dividiendo por 45 (positivo, sentido conservado): p ≤ 700/45 = 15,555… Como p es entero, el máximo entero que cumple es **15**. Comprobación por sustitución en los vecinos: p = 15 → 15 × 45 = 675 g, y 675 ≤ 700 ✓ alcanza (sobran 25 g). p = 16 → 16 × 45 = 720 g, y 720 ≤ 700 **falso** ✓ no alcanza (faltan 20 g). Respuesta **15** ✓.

*Plausibilidad de cada distractor:* **B (16)** es el redondeo hacia arriba, correcto en la Parte 1 del Paso 8 y equivocado acá — castiga exactamente a quien memorizó una dirección de redondeo en vez del criterio. **C (15,5)** es el truncamiento de 15,55… entregado como respuesta final, o sea el ciclo detenido antes de interpretar. **D (14)** proviene de estimar con 50 g por pieza (700 ÷ 50 = 14), un atajo mental muy común con números cercanos a una decena; el error es no volver a verificar con el dato real.

---

## Ítem PAES 3 — Habilidad: **argumentar** · Dificultad: **alta**

> Un equipo del torneo de robótica lleva **58 puntos**. Cada desafío resuelto suma **6 puntos**. Para clasificar se necesitan **al menos 100 puntos**.
>
> Sofía razona así: *"Con 7 desafíos llegamos a 100 puntos justos. Pero como piden AL MENOS 100, con 100 justos no basta: hay que resolver 8."*
>
> ¿Es correcto su razonamiento?
>
> A) No: "al menos 100" incluye los 100 exactos, así que 7 desafíos bastan.
> B) Sí: "al menos 100" exige pasar de 100, así que se necesitan 8 desafíos.
> C) No: su cálculo está mal, porque 58 + 6 · 7 = 94 y no 100.
> D) Sí, pero por otra razón: cuando el resultado no es exacto siempre hay que redondear hacia arriba.

| Alt | Correcta | Error asociado |
|-----|----------|----------------|
| A | ✅ | — |
| B | ❌ | NUEVO — borde cerrado tratado como abierto |
| C | ❌ | NUEVO — diagnóstico falso: atribuir a la aritmética un error de interpretación |
| D | ❌ | NUEVO — aplicar una regla de redondeo sin verificar si corresponde |

**Feedback por alternativa:**

- **A) correcta:** "Correcto. 'Al menos 100' significa 100 o más, así que 100 puntos justos clasifican. Sofía identificó bien el cálculo pero leyó 'al menos' como si exigiera superar los 100."
- **B):** "Esa es exactamente la lectura que hace fallar el ítem. 'Al menos 100' incluye el 100: si tuviera que superarlo, la frase sería 'más de 100'. Comprueba: con 7 desafíos el total es 100, y 100 ≥ 100 es verdadero."
- **C):** "Su cálculo está bien: 6 × 7 = 42, y 58 + 42 = 100. El 94 saldría de usar 6 desafíos, no 7. El error de Sofía no está en la aritmética, está en cómo interpretó la frase 'al menos'."
- **D):** "Acá no hay nada que redondear: 7 desafíos dan exactamente 100 puntos, sin decimales. Y aunque los hubiera, la dirección del redondeo no es siempre hacia arriba: depende de si hay que cubrir una exigencia o si un recurso te limita."

**Nota de verificación matemática:** condición de clasificación: 58 + 6d ≥ 100, con d entero ≥ 0. Restando 58 a ambos lados: 6d ≥ 42. Dividiendo por 6 (positivo, sentido conservado): d ≥ 7. Mínimo entero: **7**. Comprobación del borde: d = 7 → 58 + 6·7 = 58 + 42 = **100**, y 100 ≥ 100 **verdadero** ✓ clasifica, luego el razonamiento de Sofía es incorrecto. Comprobación del anterior: d = 6 → 58 + 36 = 94, y 94 ≥ 100 falso ✓ no clasifica — y ese 94 es justamente el número que aparece en la alternativa C, lo que la hace plausible: es el resultado real de un desafío menos.

*Plausibilidad de cada distractor:* **B** es el error central del tema con la respuesta "sí" que el enunciado invita a dar por cortesía con Sofía. **C** ataca el lugar equivocado con un número que **sí existe** en el problema (94 es el puntaje con 6 desafíos), lo que la vuelve creíble para quien recalcula apurado. **D** premia a quien memorizó "redondear hacia arriba" del Paso 8 sin la condición, y además introduce un redondeo donde no hay decimales — doble señal de aplicación mecánica.

---

# Catálogo de errores usado (referencia cruzada)

Errores reutilizados de `content/lecciones/ecuaciones-lineales.json` (los mismos cinco de `content/errores/ecuaciones-inecuaciones.json`). **No se creó ningún id nuevo en este guion.**

| Id | Descripción (abreviada) | Dónde se usa acá |
|----|--------------------------|------------------|
| error-3 | Dividir por el coeficiente antes de haber quitado la constante | Paso 3 (distractor 13) |
| error-4 | Olvidar dividir por el coeficiente | Paso 3 (distractor 56) |

Los errores 1, 2 y 5 no aparecen en este guion: son errores de **procedimiento algebraico**, y acá casi todas las inecuaciones se resuelven en dos pasos sin manipulación riesgosa. Forzar distractores artificiales para cubrirlos habría metido dificultad falsa en una lección cuyo foco declarado es traducir e interpretar, no despejar. Se ejercitan en la lección de ecuaciones, en "Inecuaciones 1" y en el cierre del módulo.

Todos los demás distractores de este guion corresponden a errores de **traducción, borde e interpretación**, que hoy no están catalogados. Ver la sección siguiente.

# Contextos numéricos usados (para no chocar entre lecciones)

Ninguna de estas expresiones aparece en `ecuaciones-lineales.json`, en `content/cierres/cierre-ecuaciones-lineales.json` ni en el guion de "Inecuaciones 1".

- Paso 1: dos carteles con el número 450 (kg de carga / puntos de torneo), sin operación.
- Paso 2–3: `34 + 7d ≥ 90` → d ≥ 8; puntaje en el borde = 90.
- Paso 5: cuatro carteles con el número 30 (cupo máximo, al menos firmas, más de votos, menos de integrantes), sin operación.
- Paso 7.1: `p ≤ 8` (bote de remos).
- Paso 7.2: comparación de "al menos 20" con "más de 20", sin operación.
- Paso 7.3: `72 + c ≤ 300` → c ≤ 228, y `72 + c < 300` → c ≤ 227.
- Paso 8: `12t ≥ 150` → t ≥ 12,5 → 13 tarros; y `12m ≤ 150` → m ≤ 12,5 → 12 murales.
- Ítem PAES 1: `120 + 25c ≤ 450` → c ≤ 13,2 → 13 cajas.
- Ítem PAES 2: `45p ≤ 700` → p ≤ 15,55… → 15 piezas.
- Ítem PAES 3: `58 + 6d ≥ 100` → d ≥ 7; puntaje en el borde = 100.

Nota deliberada: el número **450** aparece en el Paso 1 (cartel del ascensor) y en el Ítem PAES 1 (mismo ascensor, ahora con datos completos). Es intencional — el ítem cierra el gancho de la primera pantalla. El número **300** del Paso 7.3 y el **450** del ítem son ascensores distintos con datos distintos, así que no hay repetición de ejercicio.

---

# ERRORES NUEVOS PROPUESTOS

Ninguno tiene id asignado. Son propuestas de descripción para que **Benja decida el id y si entran al catálogo** de `content/errores/ecuaciones-inecuaciones.json`. Ningún distractor de este guion los referencia por id.

Los tres primeros se **superponen parcialmente** con los propuestos en el guion de "Inecuaciones 1" (borde y dirección). Se listan acá desde la perspectiva de la **traducción** —el error ocurre al escribir la inecuación, no al resolverla—, pero si al catalogar se prefiere un solo id por dimensión, conviene fusionarlos con los del otro guion en vez de duplicarlos. Esa decisión es tuya; acá quedan separados para que se vea de dónde sale cada uno.

1. **Al traducir una frase, excluir el número mencionado cuando la frase sí lo incluye: leer "al menos N", "a lo más N" o "no puede superar N" como si fueran estrictas.**
   *Aparece en:* Paso 1 (respuestas "solo A", "solo B", "en ninguno"), Paso 2-b, Paso 3 (distractor 9), Paso 5-c, Paso 7.1-b, Ítem PAES 1-B, Ítem PAES 3-B.
   *Nota:* es el error más frecuente del guion y el que más ítems arruina en formato PAES. Si solo se cataloga uno de esta lista, debería ser este.

2. **Al traducir una frase, incluir el número mencionado cuando la frase lo excluye: leer "más de N" o "menos de N" como si admitieran el empate.**
   *Aparece en:* Paso 5-d, Paso 7.2 (respuesta Verdadero).

3. **Invertir la dirección al traducir: escribir un techo (`≤`) donde la situación pide un piso (`≥`), o al revés.**
   *Aparece en:* Paso 2-c, Paso 5-b, Paso 7.1-c y 7.1-d, Ítem PAES 1-C.

4. **Omitir la cantidad inicial o fija al modelar, escribiendo solo el término variable.**
   *Aparece en:* Paso 2-d, Paso 7.3 (distractor 300), Ítem PAES 1-D.
   *Nota:* es pariente cercano de `error-3` del catálogo actual ("dividir por el coeficiente antes de haber quitado la constante"), pero no es el mismo: aquel es un error de **procedimiento** (la constante está en la ecuación y se ignora al resolver), este es de **modelado** (la constante nunca llega a escribirse). Si se decide que es el mismo id, conviene ampliar la descripción de error-3 en vez de crear uno nuevo.

5. **Entregar como respuesta final un valor decimal cuando el contexto exige un entero, dejando el ciclo detenido antes de interpretar.**
   *Aparece en:* Paso 8 (distractores 12,5 en ambas partes), Ítem PAES 2-C.

6. **Redondear en la dirección equivocada: hacia arriba cuando un recurso limita, o hacia abajo cuando hay que cubrir una exigencia.**
   *Aparece en:* Paso 8 (distractores 12 en la Parte 1 y 13 en la Parte 2), Ítem PAES 2-B, Ítem PAES 3-D.

7. **Responder una cantidad intermedia en vez de la preguntada: entregar los puntos que faltan en vez de los desafíos, o el peso total en vez de la carga.**
   *Aparece en:* Paso 3 (`puntajeFinal` = 56), Paso 7.3 (distractor 372).
   *Nota:* podría considerarse cubierto por `error-4` del catálogo actual, que ya describe "quedarse en a·x = c y entregar c". Revisar antes de crear un id nuevo.

---

# CANDIDATOS A VERIFICAR

Sustantivos y dominios nuevos introducidos en este guion, uno por línea, listos para pasar por `scripts/consultar-fuentes.mjs`. **No se ejecutó el script desde esta sesión** (regla dura de CLAUDE.md).

```
ascensor de carga
torneo escolar de robótica
desafío de robótica
impresora 3D
filamento
taller de colegio
mural comunitario
tarro de pintura
bote de remos
cupo máximo
```

Notas para quien corra la verificación:

- **Prioridad alta: `ascensor de carga` y `cupo máximo`.** Son las dos formulaciones con más riesgo de colisión: "límite de peso en un ascensor" es un escenario clásico de inecuaciones y "cupo máximo" es una frase hecha. Si alguna sale COLISIÓN, se reemplaza el escenario conservando la estructura (una cantidad fija + una variable, con un techo total).
- **`mural comunitario` y `tarro de pintura`** sostienen el Paso 8, que es el corazón de la lección. Si colisionan, hay que reemplazar el escenario **conservando** que la división dé un decimal de 0,5 exacto y que las dos preguntas redondeen para lados opuestos. Esa propiedad no es negociable; el escenario sí.
- **`torneo escolar de robótica`, `desafío de robótica`, `impresora 3D`, `filamento`, `taller de colegio`** forman un solo hilo temático (el taller del colegio) usado en el Paso 2–3 y en dos ítems PAES. Si el hilo colisiona, cae completo y hay que reemplazarlo entero, no por partes — el ítem PAES 3 depende de que el estudiante ya conozca el contexto del Paso 2.
- **`bote de remos`** es de bajo riesgo (aparece una sola vez, en un ejercicio de traducción sin números que resolver) y es el más barato de reemplazar.
- Se evitaron deliberadamente: la familia "cargo fijo + tarifa variable" (ningún escenario cobra dinero por unidad de tiempo o de consumo), los dominios del propio módulo (balanza y bolsas de bolitas, gatos por jaula, cuentos por sala) y los del módulo de funciones lineales (bidón, ahorro semanal, planes de datos, huerta con plantines y canteros). El escenario del torneo usa **puntos**, no pesos, precisamente para tener una estructura de "acumulado inicial + aporte por unidad" sin caer en la familia comercial saturada.

---

# Notas de implementación

- **Tipos de bloque usados:** `prediccion` (1), `seleccion` (3), `numerica` (3), `verdaderoFalso` (1), `pistas` (1), `abierta` (2), `texto` (varios). Todos existen en `TIPOS_BLOQUE_VALIDOS` (`lib/tipos.ts`); no requiere ampliar el schema. **Este guion no necesita ningún render nuevo** — a diferencia de "Inecuaciones 1", que pide una recta numérica reflejada.
- **La tabla de dos entradas del Paso 5.2** puede implementarse como bloque `texto` con markdown de tabla, igual que en otros contenidos del proyecto. No requiere `visualizacion`.
- **Pistas:** solo en el Paso 4, igual que en las dos lecciones anteriores del módulo.
- **Orden dentro del módulo:** este guion asume que "Inecuaciones 1" ya se hizo. Si se implementa primero por cualquier razón, el Paso 3 y el Paso 7.3 se caen: dan por sabido resolver y el criterio de borde.
- **Estado al nacer:** `borrador`. Sin `checklistOriginalidad` ni `revisionMatematica` — los firma Benja a mano después de la revisión real, nunca Claude Code.
- **Antes de convertir a JSON:** correr `scripts/consultar-fuentes.mjs` con los CANDIDATOS A VERIFICAR, y decidir los ids de los ERRORES NUEVOS PROPUESTOS (incluyendo si se fusionan con los del guion de "Inecuaciones 1", que se superponen en las dimensiones de borde y dirección). Los distractores que hoy no llevan `errorCatalogado` quedan así hasta que esos ids existan.
