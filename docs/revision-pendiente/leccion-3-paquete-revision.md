# Paquete de revisión matemática aislada — Lección 3 (l3-ecuaciones-lineales)

Generado siguiendo `docs/protocolo-revision-aislada.md`. Contiene únicamente enunciados y alternativas — nada de `esCorrecta`, `solucion`, `feedback`, `_notasInternas` ni `catalogoErrores`.

**Alcance:** los 3 ítems PAES del Paso 10, más los ejercicios de pasos intermedios que tienen una verificación numérica real (Paso 1, Paso 3, Paso 6/generalización, Paso 7 ejercicio 1, Paso 8). Quedaron fuera del paquete los bloques de opción múltiple / verdadero-falso sobre el principio de la balanza (Paso 2, Paso 5, Paso 7 ejercicios 2 y 3): son chequeos conceptuales, no cálculos que requieran recalcularse desde cero.

**Nota aparte, no para el revisor:** el paso "generalización" originalmente resolvía como ejemplo trabajado la misma ecuación (2x + 10 = 4) que luego pedía "resolver" al estudiante — un defecto pedagógico (regalaba la respuesta), no matemático. Se corrigió el 2026-07-20: el ejercicio que se le pide resolver al estudiante ahora es 2x + 7 = −1, distinto del ejemplo trabajado (misma estructura, coeficiente y signo de la solución, números distintos). Con la corrección aplicada, el ejercicio ya entra al paquete como Ejercicio 8.

---

## INSTRUCCIONES PARA LA SESIÓN AISLADA (pega esto primero, en una terminal nueva, sin historial)

Eres un profesor de matemática. A continuación hay 8 ejercicios independientes. Para cada uno:

1. Resuélvelo desde cero, mostrando tu procedimiento paso a paso, sin asumir cuál alternativa (si las hay) es la correcta.
2. Si el ejercicio tiene alternativas A–D, indica al final cuál es la correcta según tu propio cálculo, y para cada alternativa incorrecta indica qué error específico llevaría a marcarla.
3. Si el ejercicio pide un valor numérico (sin alternativas), entrega el valor y la comprobación (reemplaza tu respuesta en la ecuación/situación original y confirma que se cumple).

No mires ningún otro archivo del repo ni busques contexto adicional del proyecto. Resuelve únicamente con la información dada en cada ejercicio. Reporta tu respuesta y tu procedimiento completo para cada uno de los 8, numerados igual que aquí.

---

### Ejercicio 1 (Paso 1 — curiosidad)

Una balanza está en equilibrio: los dos platillos pesan exactamente lo mismo.

En el platillo izquierdo hay una bolsa cerrada (no sabes cuántas bolitas tiene adentro) más 3 bolitas sueltas.
En el platillo derecho hay 10 bolitas sueltas.

Todas las bolitas pesan igual y la bolsa por sí sola no pesa nada. ¿Cuántas bolitas hay dentro de la bolsa?

---

### Ejercicio 2 (Paso 3 — pensar)

Una balanza en equilibrio: 3 bolsas iguales (la misma cantidad desconocida de bolitas en cada una) más 6 bolitas sueltas, en el platillo izquierdo, equilibran 21 bolitas sueltas en el platillo derecho.

¿Cuántas bolitas hay dentro de cada bolsa?

---

### Ejercicio 3 (Paso 7 — práctica, ejercicio 1)

Resuelve:

**4x − 8 = 20**

¿Cuánto vale x?

---

### Ejercicio 4 (Paso 8 — aplicación, parte 1 y 2)

Un refugio de animales tiene el mismo número de gatos en cada una de sus 6 jaulas, y además 3 gatos en la enfermería (fuera de las jaulas). En total hay 27 gatos.

Parte 1: llamando x al número de gatos que hay en cada jaula, escribe la ecuación que representa la situación.

Parte 2: resuelve tu ecuación. ¿Cuántos gatos hay en cada jaula?

---

### Ejercicio 5 (Ítem PAES l3-item-1 — habilidad: resolver)

¿Cuál es el valor de x en la ecuación 5x + 8 = x − 4?

Alternativas:
A) x = −3
B) x = −12
C) x = −2
D) x = 3

---

### Ejercicio 6 (Ítem PAES l3-item-2 — habilidad: modelar)

Una bibliotecaria reparte la misma cantidad de cuentos a cada una de las 4 salas de un jardín infantil y aparta 8 cuentos para la sala de lectura. Si en total tiene 40 cuentos, ¿cuántos cuentos recibe cada sala?

Alternativas:
A) 8 cuentos
B) 10 cuentos
C) 12 cuentos
D) 32 cuentos

---

### Ejercicio 7 (Ítem PAES l3-item-3 — habilidad: argumentar)

Se quiere transformar la ecuación 3x + 5 = 20 en una ecuación más simple que tenga exactamente la misma solución. ¿Cuál de los siguientes pasos lo logra correctamente?

Alternativas:
A) Restar 5 en ambos lados, obteniendo 3x = 15.
B) Restar 5 solo al lado izquierdo, obteniendo 3x = 20.
C) Dividir por 3 solo el término 3x y dejar el 5 igual, obteniendo x + 5 = 20.
D) Sumar 5 en ambos lados para eliminar el +5, obteniendo 3x = 25.

---

### Ejercicio 8 (Paso 6 — generalización)

Contexto de referencia (ya resuelto en la lección, se muestra al estudiante como ejemplo trabajado — no es parte de lo que tienes que evaluar): **2x + 10 = 4**.

Ahora el ejercicio que sí debes resolver:

**2x + 7 = −1**

¿Cuánto vale x? Además, entre estos cuatro valores, indica cuál es el correcto y qué error específico llevaría a cada uno de los otros tres: **3, −8, 4, −4**.

---

## Después de obtener la respuesta de la sesión aislada

Sigue el paso 4 y 5 de `docs/protocolo-revision-aislada.md`:
1. Compara a mano cada resultado contra `esCorrecta`, `feedback` y `solucion` en `content/lecciones/l3-ecuaciones-lineales.json`.
2. Registra el resultado (coincide / discrepancia) en `_notasInternas` del paso o ítem correspondiente, citando este protocolo y la fecha.
3. Solo entonces, a mano, actualiza `revisionMatematica.aprobada`, `revisionMatematica.revisadoPor` y `revisionMatematica.fecha` en el archivo — ningún proceso automático debe escribirlos.
