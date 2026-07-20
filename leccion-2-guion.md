# Lección 2 — Guion de contenido: pendiente e intercepto

Contenido 100% original. Fuentes de análisis: temario DEMRE (alcance),
currículum nacional Mineduc/UCE (profundidad y secuencia). Ningún enunciado,
ejemplo numérico ni feedback proviene de material de terceros.

Objetivo declarado al estudiante: entender qué controla la forma de una
recta, para responder con seguridad los ítems de función lineal y afín de
la PAES M1.

Cada feedback de error NO revela la respuesta. Nombra la confusión
específica y redirige la atención. Regla del proyecto: el estudiante
descubre, no se le entrega.

---

## PASO 1 — Curiosidad (sin evaluación)

Pantalla: dos rectas ya dibujadas en el mismo plano, sin ecuación visible.
Recta 1 más inclinada, parte más arriba en el eje Y. Recta 2 menos
inclinada, parte más abajo.

Texto en pantalla:
> "Estas dos rectas son distintas. Sin calcular nada: ¿cuál sube más
> rápido? ¿Y cuál empieza más arriba? Guarda tu respuesta mental —
> vamos a volver a ella."

No hay input evaluado. Solo activa la intuición.

---

## PASO 2 — Problema (contexto, sin números limpios aún)

Texto:
> "Tienes que elegir entre dos planes de datos para el celular. El Plan A
> cobra un cargo fijo bajo pero cobra caro cada giga. El Plan B cobra un
> cargo fijo alto pero cada giga sale barato. ¿Cuál te conviene? Depende
> de cuánto uses... y ahí está el problema. Necesitamos una forma de
> comparar que no sea adivinar."

Sin números todavía. El objetivo es que el estudiante sienta la necesidad
de una herramienta, no que resuelva.

---

## PASO 3 — Pensar (predicción libre, no opción múltiple)

Input: campo de texto corto o selector de rango.

Texto:
> "Antes de ver cualquier gráfico: si usas MUY pocos datos al mes, ¿qué
> plan crees que conviene? ¿Y si usas muchísimos? Escribe tu corazonada."

No hay correcto/incorrecto. La predicción se guarda y se compara en el
paso 8. Evento PostHog: `prediccion_registrada`.

---

## PASO 4 — Pistas (slider de UNA sola variable)

Aparece el gráfico interactivo. **Solo se mueve la pendiente**; el
intercepto queda fijo en un valor visible.

Texto:
> "Mueve este control y observa la recta. ¿Qué cambia? ¿Qué se queda
> exactamente igual?"

Feedback por comportamiento:
- Si mueve el slider en menos de 3 valores distintos y trata de avanzar:
  > "Todavía no exploraste lo suficiente. Prueba llevarlo al mínimo, al
  > máximo y a un valor del medio antes de decidir qué cambia."
- Si describe el cambio como "la recta se mueve para el lado":
  > "Mira con cuidado: ¿la recta se traslada, o cambia su inclinación?
  > Fíjate en el punto donde toca el eje Y mientras mueves el control."

---

## PASO 5 — Descubrimiento (slider de dos variables + predicción)

Ahora se habilitan dos controles: pendiente e intercepto. Secuencia de
3 micro-preguntas tipo "predice → mueve → compara". Cada una con feedback
por distractor previsto.

**5.1** — "¿Cuál de los dos controles crees que mueve el punto donde la
recta cruza el eje Y? Predice, luego compruébalo."
- Si predice "el de la pendiente":
  > "Compruébalo tú: mueve solo el control de pendiente. ¿Se mueve el
  > punto donde la recta cruza el eje Y, o se queda clavado ahí?"
  (Error catalogado #1: confunde pendiente con intercepto.)

**5.2** — "¿Cuál control cambia la inclinación, o sea qué tan empinada
sube la recta? Predice y comprueba."
- Si predice "el del intercepto":
  > "Prueba mover solo el control de intercepto. ¿La recta se pone más o
  > menos empinada, o solo sube y baja completa sin cambiar su ángulo?"

**5.3** — "¿Qué pasa si llevas la pendiente a un valor negativo? Predice
antes de mover."
- Si predice "la recta se hace más corta":
  > "Una recta no se acorta. Lleva la pendiente a negativo y observa la
  > dirección: ¿sube de izquierda a derecha, o baja?"
  (Error catalogado #2: signo de la pendiente.)

---

## PASO 6 — Generalización (regla en palabras propias, luego notación)

Input: campo de texto corto.

Texto:
> "Con tus palabras, completa: la pendiente le hace ______ a la recta.
> El intercepto le hace ______."

El sistema no corrige gramática. Ofrece 2-3 formulaciones correctas para
que el estudiante compare la suya, y recién aquí introduce la notación:

> "Los matemáticos escriben esto como **y = mx + n**. La *m* es la
> pendiente (lo que cambia la inclinación). La *n* es el intercepto (dónde
> la recta cruza el eje Y). Nada nuevo — solo un nombre para lo que ya
> descubriste."

---

## PASO 7 — Práctica (opción múltiple, un paso, feedback por alternativa)

Enunciado:
> "La recta **y = 4x − 2** cruza al eje Y en el punto:"

| Alt | Opción | Correcta | Error asociado |
|-----|--------|----------|----------------|
| A | (0, −2) | ✅ | — |
| B | (0, 4) | ❌ | #1 confunde pendiente con intercepto |
| C | (−2, 0) | ❌ | #3 lee el intercepto en el eje X |
| D | (0, 2) | ❌ | #2 error de signo |

Feedback:
- **B:** "El 4 es lo que inclina la recta, no dónde cruza el eje Y. ¿Qué
  número en y = mx + n te dice el cruce con el eje Y?"
- **C:** "Ojo con los ejes: el intercepto que buscamos es el cruce con el
  eje Y, así que la primera coordenada del punto debe ser 0. Revisa cuál
  eje estás mirando."
- **D:** "Casi. Revisa el signo del término sin x en la ecuación. ¿La
  ecuación dice +2 o −2?"

**Nota de verificación matemática (para revisor-matematico):**
y = 4x − 2. Intercepto: cuando x = 0, y = 4·0 − 2 = −2. Punto (0, −2). ✓

---

## PASO 8 — Aplicación (dos pasos, "modelar", retoma el contexto del paso 2)

Ahora con números. Se retoma el problema de los planes de datos.

Enunciado:
> "Volvamos a tus dos planes, ahora con precios:
> **Plan A:** $4.800 fijo + $300 por giga.
> **Plan B:** $1.200 fijo + $900 por giga.
> ¿Con cuántos gigas al mes ambos planes cuestan exactamente lo mismo?"

| Alt | Opción | Correcta | Error asociado |
|-----|--------|----------|----------------|
| A | 4 gigas | ❌ | usa solo el variable del Plan B |
| B | 5 gigas | ❌ | suma en vez de restar |
| C | 6 gigas | ✅ | — |
| D | 12 gigas | ❌ | usa solo el variable del Plan A |

Feedback:
- **A:** "Fíjate que restaste bien los cargos fijos, pero al dividir usaste
  solo el precio por giga de un plan. La diferencia de precio por giga
  entre AMBOS planes es lo que importa. ¿Cuánto más caro es un giga en el
  Plan B respecto del Plan A?"
- **B:** "Cuidado: para igualar dos costos se RESTAN, no se suman. Escribe
  las dos ecuaciones de costo y déjalas iguales: ¿qué te queda al pasar
  todo a un lado?"
- **D:** "Mismo detalle que la alternativa A pero al revés: usaste solo el
  precio por giga de un plan. Necesitas la diferencia entre los dos."

**Nota de verificación matemática:**
Plan A: y = 300x + 4800. Plan B: y = 900x + 1200.
Igualar: 300x + 4800 = 900x + 1200 → 4800 − 1200 = 900x − 300x →
3600 = 600x → x = 6. ✓
Comprobación en x = 6: A = 300·6+4800 = 6600; B = 900·6+1200 = 6600. Iguales. ✓
Distractores: 3600/900 = 4 (A); 3600/300 = 12 (D); (4800+1200)/(900+300) =
6000/1200 = 5 (B). Todos enteros, cada uno mapea a un error real. ✓

---

## PASO 9 — Reflexión (pregunta abierta, no evaluada → PostHog)

> "¿Qué parte de esta lección te costó más? ¿Qué cambiarías?"

Dato cualitativo directo a instrumentación. Es la misma pregunta abierta
del Test B del MOS §6.

---

## PASO 10 — Consolidación: cierre formato PAES (3 ítems)

Selección múltiple, 4 alternativas, formato DEMRE. Números distintos a los
del paso 8 (nunca se repiten). Cubre 3 de las 4 habilidades.

### Ítem 10.1 — habilidad REPRESENTAR (tabla → ecuación)

Enunciado:
> "La siguiente tabla muestra una función afín. ¿Cuál es su ecuación?"
>
> | x | 0 | 1 | 2 | 3 |
> |---|---|---|---|---|
> | y | 5 | 8 | 11 | 14 |

| Alt | Opción | Correcta | Error |
|-----|--------|----------|-------|
| A | y = 3x + 5 | ✅ | — |
| B | y = 5x + 3 | ❌ | #1 invierte m y n |
| C | y = 3x | ❌ | #5 olvida el intercepto |
| D | y = 8x + 5 | ❌ | toma un valor de y como pendiente |

Feedback:
- **B:** "Revisa cuál número es la pendiente y cuál el intercepto. La
  pendiente es cuánto AUMENTA y cada vez que x sube de a 1. El intercepto
  es el valor de y cuando x = 0. ¿Cuál es cuál en tu tabla?"
- **C:** "Tu pendiente está bien, pero mira la tabla cuando x = 0: y no
  vale 0, vale otra cosa. Esa es la parte que te falta agregar."
- **D:** "El 8 es un valor de y, no el ritmo al que y crece. ¿Cuánto sube
  y cada vez que x avanza de a 1?"

**Nota de verificación:** diferencias de y: 8−5=3, 11−8=3, 14−11=3 →
pendiente 3. En x=0, y=5 → intercepto 5. y = 3x + 5. Comprobación x=2:
3·2+5 = 11 ✓.

### Ítem 10.2 — habilidad MODELAR (contexto → ecuación)

Enunciado:
> "Un estacionamiento cobra una tarifa fija de $1.500 por entrar, más $600
> por cada hora que el auto permanece estacionado. Si x es el número de
> horas e y el costo total, ¿qué ecuación modela el costo?"

| Alt | Opción | Correcta | Error |
|-----|--------|----------|-------|
| A | y = 600x + 1500 | ✅ | — |
| B | y = 1500x + 600 | ❌ | #1 invierte fijo y variable |
| C | y = 600x | ❌ | #5 olvida el cargo fijo |
| D | y = 2100x | ❌ | suma fijo y variable como una sola pendiente |

Feedback:
- **B:** "¿Qué costo se repite por cada hora, y cuál se paga una sola vez?
  El que se repite es la pendiente (va con la x). El que se paga una vez
  es el intercepto."
- **C:** "El costo por hora está bien, pero olvidaste algo que se paga
  aunque el auto esté estacionado 0 horas. ¿Cuánto cuesta solo entrar?"
- **D:** "No se pueden sumar en un solo número: uno depende de cuántas
  horas (va con x) y el otro es fijo. Son roles distintos en y = mx + n."

**Nota de verificación:** costo fijo (intercepto) = 1500; costo por hora
(pendiente) = 600. y = 600x + 1500. Comprobación x=2: 600·2+1500 = 2700. ✓

### Ítem 10.3 — habilidad ARGUMENTAR (evaluar validez)

Enunciado:
> "Un estudiante afirma: 'Si dos rectas tienen la misma pendiente,
> entonces son la misma recta.' ¿Es correcta esta afirmación?"

| Alt | Opción | Correcta |
|-----|--------|----------|
| A | Sí, la pendiente determina completamente la recta. | ❌ |
| B | No: pueden tener el mismo m pero distinto n, y ser rectas paralelas diferentes. | ✅ |
| C | Sí, siempre que ambas sean funciones afines. | ❌ |
| D | No, porque dos rectas nunca pueden tener la misma pendiente. | ❌ |

Feedback:
- **A:** "La pendiente fija la inclinación, pero no todo. Piensa en dos
  rectas igual de empinadas que cruzan el eje Y en puntos distintos:
  ¿son la misma recta?"
- **C:** "Ser afín no cambia el problema. Dos funciones afines pueden tener
  el mismo m y distinto n. ¿Qué serían entonces geométricamente?"
- **D:** "Al revés: sí pueden tener la misma pendiente. De hecho, eso es
  justo lo que define a las rectas paralelas."

**Nota de verificación:** rectas con igual m y distinto n son paralelas y
distintas (p. ej. y = 2x + 1 y y = 2x + 5 nunca se cruzan y no coinciden).
La afirmación es falsa; justificación correcta = B. ✓

---

## Catálogo de errores usado (referencia cruzada)

Todos los distractores de esta lección mapean a este catálogo, definido en
el archivo de diseño. No se inventaron errores nuevos en el cierre:

1. Confunde pendiente con intercepto. → 5.1, 7-B, 10.1-B, 10.2-B
2. Error de signo en la pendiente. → 5.3, 7-D
3. Confunde eje X con eje Y al leer el intercepto. → 7-C
5. Cree que una función "sin término independiente visible" no tiene
   intercepto / olvida el intercepto. → 10.1-C, 10.2-C

(Errores #4 y #6 del catálogo se ejercitan en las Lecciones 3 y 4.)

## Contextos numéricos usados (para evitar repetición entre lecciones)

- Planes de datos $4.800/$300 vs $1.200/$900 → cruce en 6. (Paso 8)
- Tabla 5, 8, 11, 14 → y = 3x + 5. (Ítem 10.1)
- Estacionamiento $1.500 + $600/hora. (Ítem 10.2)
- Rectas paralelas y = 2x + 1, y = 2x + 5. (Ítem 10.3)

Registrar estos en el log de proveniencia para que las Lecciones 3 y 4 no
reutilicen los mismos números ni contextos.
