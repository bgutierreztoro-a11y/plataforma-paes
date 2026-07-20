# Lección 1: El patrón que se repite

**Módulo:** Funciones lineales y afines (M1)
**Micro-tema:** Reconocimiento intuitivo de patrones de cambio constante
**Posición:** Lección 1 de 4. Precede a "Pendiente e intercepto" (Lección 2).
**Duración estimada:** 20 a 25 minutos
**Estado:** Guión completo, listo para convertir a JSON e implementar.

---

## Objetivo de aprendizaje

Al terminar, el estudiante puede: (1) detectar si una situación o tabla tiene cambio constante mirando las diferencias entre valores consecutivos, (2) predecir valores futuros usando la estructura "valor inicial + cambio por paso × cantidad de pasos", y (3) distinguir cambio constante de otros tipos de crecimiento.

**Lo que esta lección NO enseña todavía:** la palabra "pendiente", la notación f(x) = mx + b, ni gráficos en el plano cartesiano. Eso es Lección 2. Aquí se construye la intuición sobre la que Lección 2 pondrá nombres.

**Conexión con el temario DEMRE:** eje Álgebra y funciones, unidad "Función lineal y afín" (concepto, tablas, problemas en contextos diversos). Habilidades: Representar (interpretar tablas, traducir entre lenguaje natural y matemático), Resolver problemas, Modelar (usar e interpretar un modelo en una situación).

## Prerrequisitos

Operatoria básica con enteros (suma, resta, multiplicación). Nada más. Esta es la puerta de entrada al módulo.

---

# PASO 1 — CURIOSIDAD (gancho)

**Pantalla 1.1** (texto + imagen simple de un bidón llenándose)

> Un bidón se está llenando con una manguera. Alguien anota cuánta agua tiene cada minuto:
>
> | Minuto | Litros |
> |--------|--------|
> | 0      | 4      |
> | 1      | 7      |
> | 2      | 10     |
>
> Sin calcular nada todavía: ¿te atreves a adivinar cuántos litros tendrá en el **minuto 5**?

**Interacción:** tipo `prediccion` (el estudiante escribe un número; no hay "correcto/incorrecto" en esta pantalla, solo registro de la predicción).

**Pantalla 1.2** (revelación animada: la tabla se completa fila por fila)

> | Minuto | Litros |
> |--------|--------|
> | 3      | 13     |
> | 4      | 16     |
> | 5      | **19** |
>
> Si dijiste 19, ya viste el patrón sin que nadie te lo explicara. Si dijiste otro número, en un par de pantallas vas a ver exactamente qué se te escapó. En ambos casos: lo que acabas de hacer (o intentar) es la habilidad central de esta lección.

**Nota de diseño:** no se corrige aún. La predicción crea inversión emocional; la corrección llega con el descubrimiento del Paso 5.

---

# PASO 2 — PROBLEMA CENTRAL

**Pantalla 2.1**

> Camila y Diego deciden ahorrar para el mismo festival.
>
> **Camila** parte con $5.000 guardados y deposita $2.000 cada semana, siempre lo mismo.
>
> **Diego** parte con $0. La semana 1 deposita $1.000, la semana 2 deposita $2.000, la semana 3 deposita $3.000... cada semana deposita $1.000 más que la anterior.
>
> Pregunta: ¿el ahorro de cuál de los dos crece con un **patrón que se repite igual** semana a semana?

**Interacción:** tipo `seleccion` con 3 opciones:

- **(a) Camila** ✅
- **(b) Diego**
- **(c) Los dos**

**Feedback por opción:**
- **(a) correcto:** "Exacto. El total de Camila sube $2.000 cada semana, sin excepción. Eso es lo que vamos a llamar cambio constante. Diego también sigue un patrón, pero no es el mismo salto cada vez: sus depósitos crecen."
- **(b):** "Diego sí sigue un patrón, pero fíjate en sus saltos: su total sube $1.000, luego $2.000, luego $3.000... El salto cambia cada semana. Compáralo con Camila: ¿cuánto sube el total de ella entre una semana y la siguiente?"
- **(c):** "Los dos siguen un patrón, es verdad. Pero la pregunta es más fina: ¿cuál de los dos repite **el mismo salto** cada semana? Anota los totales de cada uno semana a semana y resta valores consecutivos."

**Verificación aritmética (interna, no visible al estudiante):**
- Camila (total): 5.000, 7.000, 9.000, 11.000, 13.000 → diferencias +2.000 constantes.
- Diego (total): 0, 1.000, 3.000, 6.000, 10.000 → diferencias +1.000, +2.000, +3.000, +4.000, crecientes.

---

# PASO 3 — PENSAR (intento sin ayuda)

**Pantalla 3.1**

> Ahora tú. Completa la tabla del ahorro de Camila:
>
> | Semana | Total ahorrado |
> |--------|----------------|
> | 0      | $5.000         |
> | 1      | $7.000         |
> | 2      | $9.000         |
> | 3      | ?              |
> | 8      | ?              |

**Interacción:** tipo `numerica`, dos campos.

**Respuestas correctas:** semana 3 = **$11.000**; semana 8 = **$21.000**.

**Verificación:** 5.000 + 2.000×3 = 11.000 ✓ ; 5.000 + 2.000×8 = 21.000 ✓

**Feedback previsto por error frecuente:**
- **Semana 8 = $16.000** (calculó 2.000×8 y olvidó los $5.000 iniciales): "Te faltó algo: Camila no partió de cero. Ella ya tenía $5.000 antes de la primera semana. ¿Dónde entra ese monto inicial en tu cálculo?"
- **Semana 8 = $19.000** (contó 7 saltos en vez de 8): "Estás cerca. Cuenta con cuidado: de la semana 0 a la semana 8 hay 8 saltos de $2.000, no 7. Un truco: semana 1 tiene 1 salto, semana 2 tiene 2 saltos... semana 8 tiene 8."
- **Semana 8 = $23.000** (contó 9 saltos): "Te pasaste por un salto. De la semana 0 a la 8 hay exactamente 8 aumentos de $2.000. Revisa: ¿cuánto da 5.000 + 8 × 2.000?"
- **Cualquier otro valor:** "Revisa el patrón: cada semana el total sube exactamente $2.000. Parte de los $5.000 iniciales y avanza semana a semana si lo necesitas."

**Nota de diseño:** la semana 3 es alcanzable contando fila a fila. La semana 8 fuerza el salto conceptual: contar fila a fila se vuelve tedioso y el cerebro busca el atajo multiplicativo. Ese incentivo es deliberado.

---

# PASO 4 — PISTAS (solo si el estudiante las pide o falla dos veces)

**Pista 1 (suave):**
> Mira las diferencias: $7.000 − $5.000 = $2.000. Y $9.000 − $7.000 = $2.000 otra vez. ¿Qué te dice eso sobre cómo llegar a la semana 3?

**Pista 2 (media):**
> Para la semana 8 no necesitas escribir 8 filas. Piensa: ¿cuántas veces se sumaron $2.000 desde la semana 0 hasta la semana 8? ¿Y desde dónde partió Camila?

**Pista 3 (casi la respuesta):**
> Total = lo que ya tenía + (salto semanal × número de semanas). Es decir: 5.000 + 2.000 × 8. Calcula eso.

---

# PASO 5 — DESCUBRIMIENTO

**Pantalla 5.1** (el momento "ajá"; visual: la tabla de Camila con flechas de +$2.000 entre cada fila)

> Lo que encontraste tiene nombre: **cambio constante**.
>
> Una situación tiene cambio constante cuando, al avanzar un paso (un minuto, una semana, un kilómetro), la cantidad sube o baja **siempre lo mismo**.
>
> ¿Y cómo se detecta? Con una sola operación: **restar valores consecutivos**. Si todas las restas dan lo mismo, hay cambio constante. Si alguna da distinto, no lo hay. Así de directo.

**Pantalla 5.2** (aplicar el detector hacia atrás, cerrando el gancho del Paso 1)

> Volvamos al bidón del inicio: 4, 7, 10, 13...
>
> 7 − 4 = 3. 10 − 7 = 3. 13 − 10 = 3.
>
> Cambio constante de +3 litros por minuto. Por eso el minuto 5 tenía que ser 4 + 3×5 = **19**. Si tu predicción inicial falló, lo más probable es que haya sido por una de estas dos: olvidar los 4 litros con los que partió el bidón, o contar mal los saltos. Los dos errores van a reaparecer en la PAES, disfrazados de alternativas.

**Interacción:** tipo `verdaderoFalso` como chequeo rápido:

> "La secuencia 2, 6, 10, 14, 18 tiene cambio constante."

**Correcta: Verdadero** (diferencias: +4, +4, +4, +4).
- **Feedback si responde Verdadero:** "Correcto: todas las diferencias dan +4."
- **Feedback si responde Falso:** "Resta consecutivos: 6−2, 10−6, 14−10, 18−14. Todas dan 4. Cuando todas las restas coinciden, el cambio es constante, aunque los números de la secuencia en sí vayan cambiando. Ojo con eso: lo constante es el salto, no los valores."

---
# PASO 6 — GENERALIZACIÓN

**Pantalla 6.1**

> El patrón que descubriste funciona igual en el bidón, en el ahorro de Camila y en cualquier situación con cambio constante. La receta general:
>
> **Total = valor inicial + (cambio por paso) × (número de pasos)**
>
> En el bidón: 4 + 3 × minutos.
> En el ahorro de Camila: 5.000 + 2.000 × semanas.
>
> Todavía no le pongas nombre técnico. En la próxima lección esta receta se va a convertir en una ecuación con gráfico propio, y el "cambio por paso" va a resultar ser una de las ideas más importantes de toda la PAES.

**Pantalla 6.2** (el caso que descoloca: cambio constante negativo)

> Una cosa más. El cambio constante también puede ser hacia abajo.
>
> Una vela mide 20 cm y se acorta 2 cm por hora. Misma receta, salto negativo:
>
> Largo = 20 − 2 × horas.
>
> ¿Cuánto mide la vela después de 7 horas?

**Interacción:** tipo `numerica`.

**Correcta: 6 cm.** Verificación: 20 − 2×7 = 20 − 14 = 6 ✓

**Feedback por error frecuente:**
- **14** (calculó solo 2×7, el total derretido): "Calculaste cuánto se derritió (14 cm), que es un paso intermedio correcto. Pero la pregunta es cuánto QUEDA. ¿Desde qué largo partió la vela?"
- **34** (sumó en vez de restar): "Sumaste, pero la vela se está acortando. Cuando el cambio es hacia abajo, se resta: 20 − 2×7."
- **8** (contó 6 horas): "Revisa el conteo de horas: son 7 horas completas, entonces 2×7 = 14 cm derretidos. 20 − 14 = ?"
- **Otro valor:** "Estructura: largo inicial (20) menos lo derretido (2 cm por cada una de las 7 horas)."

---

# PASO 7 — PRÁCTICA

**Pantalla 7.1** — Ítem P1, tipo `numerica`

> La tabla muestra el costo total de una impresión según el número de páginas:
>
> | Páginas | Costo  |
> |---------|--------|
> | 0       | $12    |
> | 1       | $19    |
> | 2       | $26    |
> | 3       | $33    |
>
> Nota: el costo en 0 páginas es el cargo fijo por usar la máquina. Si el patrón continúa, ¿cuál es el costo de imprimir 6 páginas?

**Correcta: $54.** Verificación: diferencias +7 constantes; 12 + 7×6 = 54 ✓

**Feedback por error:**
- **42** (7×6, ignoró el cargo fijo): "Calculaste bien el costo de las páginas ($42), pero la tabla parte en $12 con cero páginas: ese cargo fijo se paga siempre. Súmalo."
- **47** (12 + 7×5, contó 5 saltos): "Contaste un salto de menos. De 0 a 6 páginas hay 6 aumentos de $7."
- **Otro:** "Primero detecta el salto restando filas consecutivas. Luego: valor inicial + salto × 6."

**Pantalla 7.2** — Ítem P2, tipo `verdaderoFalso`

> Esta tabla tiene cambio constante:
>
> | x | y  |
> |---|----|
> | 1 | 5  |
> | 2 | 8  |
> | 3 | 12 |

**Correcta: Falso.** Verificación: 8−5 = 3, pero 12−8 = 4. Diferencias distintas ✓

- **Feedback si responde Falso:** "Bien visto. De 5 a 8 hay +3, pero de 8 a 12 hay +4. Basta UNA diferencia distinta para que el cambio no sea constante."
- **Feedback si responde Verdadero:** "Aplica el detector: 8−5 = 3 y 12−8 = 4. No dan lo mismo. Que los números crezcan de forma 'pareja' a simple vista no basta: hay que restar y comparar."

**Pantalla 7.3** — Ítem P3, tipo `seleccion`

> ¿Cuál de estas situaciones tiene cambio constante?
>
> - (a) Una población de bacterias que se duplica cada hora.
> - (b) Un taxímetro parte marcando $300 apenas subes, y después agrega $130 cada 200 metros que avanza el auto. ✅
> - (c) Un auto que acelera: cada segundo avanza más metros que el segundo anterior.

**Feedback por opción:**
- **(a):** "Duplicarse no es sumar lo mismo. Si hay 100 bacterias, en una hora se suman 100; a la siguiente se suman 200. El salto crece. Eso es otro tipo de crecimiento (lo verás más adelante en el temario, con las potencias)."
- **(b) correcta:** "Eso es. Cada 200 metros el precio sube exactamente $130, siempre igual. Cargo fijo + salto constante: la misma estructura de la impresora y del ahorro de Camila."
- **(c):** "Si cada segundo avanza MÁS que el anterior, el salto está creciendo. Cambio, sí; constante, no."

**Nota de reescritura (auditoría de fidelidad, 2026-07-08):** la opción (b) original ("Un taxi que cobra $300 de bajada de bandera más $130 por cada 200 metros") compartía el esqueleto sintáctico "[sujeto] cobra $[fijo] de [descriptor] más $[variable] por cada [unidad]" — el mismo patrón que causó los dos bloqueos de Paso 8. No hubo colisión de frase literal, solo de familia estructural (hallazgo DUDOSO, no bloqueante), pero se reescribió preventivamente rompiendo ese esqueleto (sin "cobra", sin conector "más", verbos "parte marcando"/"agrega"), manteniendo los mismos números ($300, $130, 200 metros) y el mismo punto pedagógico (cargo fijo + salto constante).

---

# PASO 8 — APLICACIÓN (modelamiento)

**Pantalla 8.1**

> Martina ya tenía 18 estampillas en su álbum antes de empezar a coleccionar en serio. Desde entonces, consigue 5 estampillas nuevas cada semana, siempre la misma cantidad.
>
> Parte 1: escribe la receta del total de estampillas.
> Parte 2: después de 6 semanas, ¿cuántas estampillas tiene en total?

**Interacción:** parte 1 tipo `abierta` (se muestra una receta modelo al enviar); parte 2 tipo `numerica`.

**Receta modelo (parte 1):** Total = 18 + 5 × (semanas).

**Correcta (parte 2): 48 estampillas.** Verificación: 18 + 5×6 = 18 + 30 = 48 ✓

**Feedback por error:**
- **30** (solo lo variable): "Eso es solo lo que consiguió en las 6 semanas (5×6=30). Pero Martina no partió de cero: ya tenía 18 estampillas antes de empezar a coleccionar en serio."
- **43** (18 + 5×5, contó 5 semanas en vez de 6): "Contaste una semana de menos. Fueron 6 semanas completas: 18 + 5×6, no 18 + 5×5."
- **Otro:** "Usa tu receta de la parte 1 reemplazando las semanas por 6."

**Nota de reemplazo (auditoría de fidelidad, 2026-07-08 — cuarto intento):** historial completo de este paso. (1) "plan de celular" ($8.990 fijo + $50/minuto extra) — contexto original, descartado por colisión de DOMINIO con un ítem DEMRE 2020 real (`fuentes-analisis-aisladas/pdv-terceros/MA-32_Funciones.md`, ítem #17: "cargo fijo mensual de $9.000 más un cargo de $50 por minuto"). (2) "taller de cerámica" ($4.000 fijo + $900/hora) — descartado por colisión de PLANTILLA SINTÁCTICA con un ítem DEMRE 2014 distinto del mismo archivo (ítem #13: "Un técnico cobra un cargo fijo de $17.000 más $1.500 por hora de trabajo"). (3) "parque de trampolines" — sin colisión de plantilla ni cifras, pero descartado por colisión de DOMINIO con un ítem de "arriendo de juego inflable por hora" (`fuentes-analisis-aisladas/pdv-terceros/MA-10_Ecuaciones_Primer_Grado.md`, Ejercicio 21) — mismo nicho de "entretención infantil pagada por tiempo" que el archivo que ya había bloqueado los dos intentos anteriores. (4) "colección de estampillas" (vigente) — se abandonó por completo la familia "servicio/entretención pagado por tiempo o unidad" (saturada en el corpus) y se usó un dominio sin transacción comercial, sin "cobra" ni tarifa, siguiendo el mismo espíritu que la vela (que nunca tuvo problema de originalidad). Verificado sin colisión de dominio, cifras, plantilla sintáctica ni nombre propio contra el corpus completo de `fuentes-analisis-aisladas/` (demre/, mineduc-curriculum/, pdv-terceros/, pendiente-clasificar/, Material/) por el subagente auditor-originalidad, que confirmó por su cuenta la veracidad de los tres bloqueos previos antes de auditar este candidato.

---

# PASO 9 — REFLEXIÓN

**Pantalla 9.1** — tipo `abierta`

> En tus propias palabras: ¿cómo le explicarías a un compañero la forma más rápida de saber si una tabla tiene cambio constante, sin usar la palabra "constante"?

**Nota de diseño:** sin corrección automática. Se guarda la respuesta (anonimizada) para revisión del piloto: es el mejor termómetro de si el concepto se entendió o solo se ejecutó. Una respuesta tipo "restas los de al lado y ves si da siempre lo mismo" indica comprensión.

**Pantalla 9.2** (cierre metacognitivo, texto breve)

> Los dos errores que más se repiten con este tema, y que viste en carne propia:
>
> 1. Olvidar el valor inicial (el bidón partía con 4 litros; Camila, con $5.000).
> 2. Contar mal los saltos (de la semana 0 a la 8 hay 8 saltos, no 7 ni 9).
>
> La PAES construye alternativas incorrectas exactamente con esos dos errores. Ahora los conoces por dentro.

---

# PASO 10 — CONSOLIDACIÓN

**Pantalla 10.1** (resumen en una tarjeta)

> **Lo que te llevas:**
> - Cambio constante = el mismo salto en cada paso (puede ser hacia arriba o hacia abajo).
> - Detector: restar valores consecutivos; todas las restas deben coincidir.
> - Receta: Total = valor inicial + cambio por paso × número de pasos.
> - Trampas clásicas: valor inicial olvidado y saltos mal contados.
>
> **Lo que viene (Lección 2):** esta receta tiene un gráfico. El "cambio por paso" se va a llamar pendiente, el "valor inicial" se va a llamar intercepto, y vas a poder moverlos con tus propias manos.

---

# CIERRE — ÍTEMS FORMATO PAES (3 ítems originales)

Formato DEMRE: selección múltiple, 4 opciones (A-D), respuesta única, contexto cotidiano o matemático. Cada distractor codifica un error específico trabajado en la lección.

---

## Ítem PAES 1 — Habilidad: Resolver problemas / Representar

> Un estanque contiene 50 litros de agua y tiene una filtración que le hace perder la misma cantidad de agua cada minuto. La tabla muestra los primeros registros:
>
> | Minuto | Litros |
> |--------|--------|
> | 0      | 50     |
> | 1      | 46     |
> | 2      | 42     |
> | 3      | 38     |
>
> Si la filtración continúa igual, ¿cuántos litros de agua tendrá el estanque en el minuto 8?
>
> A) 32
> B) 22
> C) 18
> D) 14

**Correcta: C.** Verificación: pérdida constante de 4 L/min; 50 − 4×8 = 50 − 32 = 18 ✓

**Feedback por alternativa:**
- **A) 32:** "Calculaste 4×8 = 32, que es cuánta agua se PERDIÓ en total. La pregunta pide cuánta QUEDA: 50 − 32."
- **B) 22:** "Ese es el minuto 7 (50 − 4×7 = 22). De 0 a 8 hay 8 saltos de −4, no 7. El error de contar saltos de menos, otra vez."
- **C) correcta:** "Bien. Salto de −4 detectado, 8 saltos contados, valor inicial incluido: 50 − 4×8 = 18. Los tres reflejos de la lección en un solo ítem."
- **D) 14:** "Ese sería el minuto 9 (50 − 4×9 = 14). Contaste un salto de más. De 0 a 8 hay exactamente 8 saltos."

---

## Ítem PAES 2 — Habilidad: Modelar

> Un grupo de vecinos ya tenía 24 latas de aluminio juntadas de campañas de reciclaje anteriores. Desde esta semana, juntan 18 latas nuevas cada semana, siempre la misma cantidad. ¿Cuántas latas tendrán en total después de 5 semanas?
>
> A) 90
> B) 210
> C) 114
> D) 96

**Correcta: C.** Verificación: 24 + 18×5 = 24 + 90 = 114 ✓

**Feedback por alternativa:**
- **A) 90:** "Calculaste bien las latas nuevas (18×5=90), pero el grupo no partió de cero: ya tenían 24 latas juntadas de campañas anteriores. Ese punto de partida se suma siempre."
- **B) 210:** "Multiplicaste todo por 5, incluidas las 24 latas iniciales: (24+18)×5. Pero esas 24 ya estaban juntadas antes de esta semana; solo lo que se junta cada semana se multiplica por 5."
- **C) correcta:** "Correcto: 24 latas iniciales + 18 nuevas cada semana × 5 semanas = 24 + 90 = 114. La misma receta de la lección aplicada a una acumulación real."
- **D) 96:** "Contaste una semana de menos. Fueron 5 semanas completas: 24 + 18×5, no 24 + 18×4."

**Nota de reemplazo (auditoría de fidelidad, 2026-07-08 — tercera ronda):** el contexto original ("servicio de reparto, tarifa base $1.500 + $700/km") colisionaba por plantilla sintáctica con `fuentes-analisis-aisladas/pdv-terceros/MA-31_Inecuaciones.md:223` (frase literal compartida "por kilómetro recorrido"), reforzado por el mismo esqueleto en otras 2 fuentes. Dos candidatos con mecanismo distinto pero manteniendo la estructura comercial "cobra fijo + tarifa por unidad" también fueron bloqueados (uno colisionaba con un ítem DEMRE 2017 de backward-solve; el otro reproducía casi literalmente una actividad del currículum oficial Mineduc de comparación de dos empresas de transporte escolar). Se abandonó la familia comercial por completo: el contexto vigente (grupo de vecinos reciclando latas) tuvo dos rondas adicionales de ajuste — la primera versión (sujeto "un curso") ecoaba una actividad Mineduc de "caja de ahorro de curso"; la segunda versión (sujeto correcto, pero con la frase "antes de empezar a anotarlas en una lista") ecoaba el framing de un ítem real DEMRE 2024 ("...había antes de comenzar los registros"). La versión vigente (ronda 3) verificó limpia en dominio, cifras y plantilla contra el corpus completo.

---

## Ítem PAES 3 — Habilidad: Argumentar / Representar

> ¿Cuál de las siguientes tablas representa una cantidad con cambio constante?
>
> A)
> | x | 0 | 1 | 2  | 3  |
> |---|---|---|----|----|
> | y | 3 | 6 | 12 | 24 |
>
> B)
> | x | 0  | 1 | 2 | 3 |
> |---|----|---|---|---|
> | y | 10 | 8 | 7 | 5 |
>
> C)
> | x | 0 | 1 | 2 | 3 |
> |---|---|---|---|---|
> | y | 2 | 3 | 5 | 8 |
>
> D)
> | x | 0 | 1 | 2  | 3  |
> |---|---|---|----|----|
> | y | 5 | 9 | 13 | 17 |

**Correcta: D.** Verificación: diferencias +4, +4, +4 ✓
- A: +3, +6, +12 (se duplica) ✗
- B: −2, −1, −2 (baja, pero no siempre lo mismo) ✗
- C: +1, +2, +3 (saltos crecientes) ✗

**Feedback por alternativa:**
- **A:** "Cada valor es el doble del anterior. Las diferencias son +3, +6, +12: crecen. Duplicar no es sumar lo mismo."
- **B:** "Esta es la trampa fina del ítem. La tabla baja, y bajar con cambio constante es posible (la vela). Pero resta: −2, −1, −2. La diferencia del medio es distinta. TODAS las restas deben coincidir, sin excepción."
- **C:** "Las diferencias son +1, +2, +3. Igual que Diego con sus depósitos: hay patrón, pero el salto crece. Patrón no es lo mismo que cambio constante."
- **D) correcta:** "Todas las diferencias dan +4. Ese es el único criterio que importa, y lo aplicaste bien."

---

# Notas de implementación

- **Tipos de interacción usados:** prediccion (1), seleccion (3), numerica (5), verdaderoFalso (2), abierta (2), más los 3 ítems PAES (formato A-D). Coherente con la taxonomía pendiente de formalizar en el schema.
- **Eventos PostHog por pantalla:** inicio de lección, respuesta por ítem (con opción elegida), uso de pista (por nivel), abandono, tiempo por paso, término.
- **Pistas:** disponibles solo en Paso 3 (el intento central). En práctica y PAES no hay pistas: el feedback por distractor cumple esa función.
- **Ítems isomorfos para el pre/post del piloto:** los ítems PAES 1 y 2 tienen estructura clonable (cambiar contexto y números manteniendo el error codificado en cada distractor). Generar las variantes isomorfas ANTES del piloto y validar su aritmética con el subagente revisor-matematico.

# Registro de proveniencia y declaración de originalidad (MOS 7.2 y 7.3)

**Fuentes de análisis usadas:** temario oficial PAES M1 proceso 2027 (DEMRE/UCE) para alcance, habilidades y formato de ítems (65 preguntas, 4 opciones, respuesta única). Ningún ítem, enunciado, tabla ni contexto fue tomado de formas liberadas DEMRE ni de guías de terceros.

**Checklist 7.3:**
1. ¿Algún enunciado sustancialmente similar a una fuente conocida? **No** para la versión actual. Todos los contextos (bidón, ahorro de Camila y Diego, vela, impresora, taxi, colección de estampillas, estanque con filtración, latas de un grupo de vecinos, tablas del ítem 3) fueron creados desde cero para esta lección, con números propios verificados. Excepciones históricas, ambas resueltas: (a) Paso 8 tuvo 4 intentos de contexto — "plan de celular" (colisión de dominio con DEMRE 2020), "taller de cerámica" (colisión de plantilla con DEMRE 2014), "parque de trampolines" (colisión de dominio con un ítem de juego inflable, familia "entretención pagada por tiempo"), y "colección de estampillas" (vigente, dominio no comercial, verificado limpio); ver nota de reemplazo en el Paso 8. (b) Ítem PAES 2 tuvo 3 rondas — el contexto de reparto/km colisionó por plantilla con 3 fuentes de la familia "cobra fijo + tarifa por unidad"; dos candidatos de reemplazo con mecanismo distinto pero misma estructura comercial también colisionaron (uno con un ítem DEMRE 2017, otro con una actividad del currículum Mineduc); el contexto vigente (latas de un grupo de vecinos, dominio no comercial) tuvo dos ajustes adicionales de framing antes de verificar limpio; ver nota de reemplazo en el Ítem PAES 2. Además, el distractor "taxi" del Paso 7 fue reescrito por compartir el mismo esqueleto sintáctico que causó los bloqueos de Paso 8 (dudoso, no bloqueante, corregido preventivamente y verificado limpio).
2. ¿Algún diagrama replica composición existente? **No.** Las únicas visuales especificadas son tablas simples y flechas de diferencia, elementos genéricos del lenguaje matemático.
3. ¿La secuencia copia estructura expresiva de una guía específica? **No.** La secuencia sigue los 10 pasos definidos en el MOS v2, documento propio.
4. ¿Proveniencia registrada? **Sí,** en esta sección.

**Autoría:** contenido creado con asistencia de IA (Claude) bajo dirección, curaduría y revisión humana del autor del proyecto, conforme a MOS 7.7. Toda la aritmética fue verificada manualmente en las notas internas de cada ítem.

**Pendiente antes de publicar fuera del piloto de confianza:** revisión de abogado/a de PI en Chile (MOS 7.8).
