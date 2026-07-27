# Revisión matemática — Lecciones 2 y 3

Para el profesor. No hace falta abrir una terminal, ni saber qué es un JSON,
ni tocar ningún archivo del proyecto. Este documento reúne todo lo que hace
falta revisar y decidir; el resultado se transcribe después.

## Cómo usar esto

Léelo de corrido. Para cada lección hay una sección "Qué revisar" con el
contenido matemático exacto, y al final una sección "Lo que tienes que
decidir" con las preguntas concretas que hay que responder que sí o que no.
Puedes escribir tus respuestas directamente en este documento, a mano o en
un correo — no hace falta que sepas dónde van técnicamente. Anota también la
fecha y tu nombre; los dos se necesitan para dejarlo firmado.

---

## Lección 2 — Pendiente e intercepto

La lección completa ya está escrita: 10 pasos, más 3 preguntas de cierre en
formato PAES. Se pide foco especial en **un paso concreto**, el que más
cambió en el proceso de escritura y el que tiene mayor riesgo de haber
quedado con un error de redacción, aunque el cálculo esté bien. El resto de
la lección también hay que aprobarlo o rechazarlo — solo que ese paso pide
una lectura más despacio.

### Foco principal: el paso de "los dos planes, ahora con precios"

Es un ejercicio sobre dos planes de datos para celular:

> Plan A: y = 900x + 1200 (donde x son los gigas que se usan en el mes, e y
> el costo total)
> Plan B: y = 300x + 4800

Se le pide al estudiante que, **sin calcular nada**, elija la afirmación
correcta entre cuatro opciones. La respuesta correcta dice: hay un consumo
en que los dos planes cuestan lo mismo; con menos gigas que ese conviene el
Plan A, y con más gigas conviene el Plan B.

**Qué verificar, en números:**

- Cargo fijo de cada plan (lo que se paga aunque no se use nada, x = 0):
  Plan A = $1.200, Plan B = $4.800. El Plan A parte más barato.
- Costo por giga adicional: Plan A = $900, Plan B = $300. El Plan A sube
  más rápido.
- Punto donde ambos planes cuestan lo mismo: con 6 gigas, los dos cuestan
  $6.600.
- Antes de las 6 gigas conviene el Plan A (parte más barato); después de
  las 6 gigas conviene el Plan B (sube más lento). La alternativa que dice
  lo contrario está marcada como incorrecta a propósito, y hay que
  confirmar que el texto que explica por qué está mal (el feedback) de
  verdad explica ese error y no otro.
- Las otras dos alternativas incorrectas confunden "cuánto cuesta partir"
  con "cuánto sube cada giga" — cada una al revés de la otra. Hay que
  confirmar que el texto que corrige a un estudiante que elige esa opción
  señala exactamente esa confusión.

**Por qué este paso pide atención extra:** se reescribió dos veces
(2026-07-22). La primera vez, para que dejara de pedir el mismo
procedimiento (despejar una incógnita igualando dos ecuaciones) que enseña
la Lección 3, que el estudiante todavía no ha visto en este punto del
curso — antes el paso exigía un método sin haberlo enseñado. La segunda,
porque los nombres "Plan A" y "Plan B" habían quedado invertidos respecto a
como se los presenta más atrás en la misma lección, y un estudiante que
recordara bien lo anterior habría respondido mal por eso, no por no saber
la materia. Las dos correcciones ya están hechas, pero un paso reescrito
dos veces es, en cualquier texto, el que más vale releer entero antes de
firmar.

### Además, un aviso sobre uno de los ítems de cierre

Uno de los tres ítems que cierran la lección (el que usa una huerta escolar
y plantines como contexto) quedó marcado por quien lo escribió como
pendiente de una verificación de originalidad más profunda — no es un
problema de matemática, es un tema de si el enunciado se parece demasiado a
algún material existente. Probablemente no te toque decidir esto a ti
directamente (depende de si la revisión de originalidad la haces tú o
alguien más), pero se avisa acá para que no se firme por alto.

---

## Lección 3 — Ecuaciones lineales

A diferencia de L2, acá se pide revisar **la lección completa**: los 10
pasos y las 3 preguntas de cierre. Quien la escribió ya hizo una
autoverificación paso por paso (dejó anotado el cálculo de cada ejercicio y
de cada alternativa incorrecta), pero eso no reemplaza una revisión
independiente — es exactamente lo que se te pide a ti: recalcular cada
cosa por tu cuenta, sin mirar la solución que ya está escrita, y confirmar
que coincide.

**El hilo conductor de la lección:** una ecuación es una balanza en
equilibrio — lo que se hace a un lado hay que hacerlo también al otro para
que se mantenga el equilibrio. Todos los ejemplos usan bolsas con bolitas
adentro (cantidad desconocida) para representar la incógnita.

**Los cálculos a confirmar, uno por paso:**

1. **Bolsa misteriosa:** 1 bolsa + 3 bolitas sueltas = 10 bolitas → la
   bolsa tiene 7.
2. **Tres bolsas:** 3 bolsas + 6 bolitas sueltas = 21 bolitas → cada bolsa
   tiene 5. Comprobación: 3 × 5 + 6 = 21.
3. **Registro del intento:** misma situación anterior (x = 5), con tres
   respuestas incorrectas típicas: 15 (quitó las 6 pero no repartió entre
   las 3 bolsas), 7 (repartió las 21 entre 3 sin sacar antes las 6 sueltas)
   y 9 (sumó las 6 en vez de restarlas).
4. **Pistas:** sin cálculo nuevo, guía hacia el método.
5. **La balanza (el paso central de la lección):** con la misma ecuación
   (3 bolsas + 6 = 21), se pregunta qué operación conserva el equilibrio
   sin necesariamente servir para resolver. La respuesta correcta es sumar
   5 a los dos lados (3x + 11 = 26; en x = 5, da 15 + 11 = 26 — el
   equilibrio se mantiene, aunque ese movimiento en particular no ayude a
   despejar). Las otras tres opciones sí cambian la solución: sumar 5 solo
   a un lado, mover números de lado sin más, o duplicar solo un lado — hay
   que confirmar que cada una, en efecto, da un resultado distinto de 5.
6. **La regla con números negativos:** ejemplo trabajado 2x + 10 = 4 →
   x = −3 (comprobación: 2 × −3 + 10 = 4). El ejercicio para el estudiante
   es distinto del ejemplo a propósito (2x + 7 = −1 → x = −4, comprobación:
   2 × −4 + 7 = −1), para que no pueda copiar el procedimiento sin
   razonar. Confirmar también los tres números incorrectos típicos que se
   ofrecen como alternativa.
7. **Tres ejercicios de práctica:** 4x − 8 = 20 → x = 7; verdadero/falso
   sobre si sumar el mismo número a ambos lados cambia la solución (la
   respuesta es que no la cambia); y cuál operación, en 2x + 3 = 11, rompe
   el equilibrio (restar 3 a un solo lado).
8. **Aplicación — los gatos del refugio:** escribir la ecuación
   6x + 3 = 27 y resolverla → x = 4 (comprobación: 6 × 4 + 3 = 27), con dos
   errores típicos ofrecidos como alternativa (24, por no dividir al
   final; y 5, por sumar en vez de restar).
9. **Reflexión:** pregunta abierta sobre por qué funciona el método, sin
   cálculo que verificar.
10. **Cierre:** resumen, sin cálculo nuevo.

**Las tres preguntas de cierre (formato PAES):**

1. 5x + 8 = x − 4 → despejar x.
2. Una bibliotecaria reparte la misma cantidad de cuentos entre varias
   salas — mismo tipo de ecuación que el resto de la lección, con reparto
   en partes iguales.
3. Transformar 3x + 5 = 20 en una versión más simple, conservando la misma
   solución.

**Un asunto de redacción, no de matemática, en el ítem 3 de estas tres:**
en la alternativa C de ese ítem hay una palabra escrita en mayúsculas por
énfasis ("dividir TODO cada lado") que hay que cambiar de forma — el
sistema que revisa el contenido la confunde con una anotación interna de
"trabajo pendiente" sin terminar, aunque no lo es. El error que esa
alternativa explica y el cálculo detrás no cambian en absoluto. Hay dos
formas de redactarlo sin ese problema, las dos con el mismo significado
exacto, en `docs/publicacion-l2-l3.md`, sección "Para el revisor". Puedes
elegir la que prefieras, o pedir una tercera — es una decisión de
redacción tuya, no una que ya esté tomada.

---

## Lo que tienes que decidir

Para cada lección (L2 y L3), por separado, contesta:

1. **¿Recalculaste cada ejercicio y cada alternativa desde cero, sin mirar
   la solución que ya estaba escrita, y coincide todo?** Sí / No. Si no
   coincide algo, anota exactamente qué paso o qué ítem y por qué.
2. **¿Cada alternativa incorrecta explica, en su texto de corrección
   (feedback), el error específico que un estudiante cometería para llegar
   a esa respuesta — no un error genérico?** Sí / No.
3. **Tu nombre y la fecha de hoy**, para dejar registrada quién revisó y
   cuándo.

Esas tres respuestas son todo lo que se necesita de vos para la parte
matemática. Quien programe esto se encarga de convertirlas al lugar técnico
que corresponde (son 7 datos en total contando también la parte de
originalidad, si te toca hacerla a ti también) — no hace falta que sepas
cuáles son esos 7 ni dónde van.

---

## Lo que NO tienes que revisar

- **Nada de código.** Ni cómo se muestran las lecciones en pantalla, ni
  cómo se guarda el progreso del estudiante, ni ningún archivo técnico del
  proyecto.
- **El orden de los pasos ni la estructura general** (10 pasos, 3 preguntas
  de cierre): eso ya está validado automáticamente y no puede estar mal sin
  que el sistema lo rechace solo.
- **Que las preguntas tengan 4 alternativas con una sola correcta:** mismo
  caso, se valida solo.
- **Nada de "PAES" o "DEMRE" en el nombre del producto:** no aparece en
  ningún lado de estas dos lecciones.
- **El resto del sitio** (la portada, el mapa de temas, la celebración al
  terminar un tema): nada de eso depende de esta revisión.
