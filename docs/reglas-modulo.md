# Reglas de módulo — lo que salió de auditar L1

Reglas de producción de contenido que no estaban en el MOS ni en `docs/calibracion-lecciones-e-items.md` porque nadie las había necesitado todavía. Salieron todas de escribir y auditar `proporcionalidad-directa.json` (L1 del módulo Proporcionalidad) entre el 2026-08-12 y el 2026-08-13.

Cada una lleva su origen. Eso importa: una regla sin la historia que la produjo se discute como opinión, y con ella se discute como evidencia.

**Relación con el resto:** el MOS manda sobre alcance y protocolo legal. `calibracion-lecciones-e-items.md` manda sobre arquitectura pedagógica (los 10 pasos, las 4 habilidades, la dificultad). Este documento manda sobre los detalles de construcción que rompen una lección en silencio. Donde haya conflicto, gana el MOS.

Las reglas 2, 3 (parcialmente), 4 y 5 están mecanizadas en `npm run auditar` (`scripts/auditar-leccion.mjs`). Las que no se pueden contar las revisa `auditor-matematico`.

---

## 1. Sin representación de función lineal donde el concepto no la exige

No se usa un gráfico, un plano cartesiano ni un slider de función lineal en una lección cuyo concepto no lo exige. Si el concepto se descubre en una tabla, se descubre en la tabla.

**Origen:** Benja, 2026-08-13. Un borrador de `proporcionalidad-directa.json` cerraba el paso 5 con un bloque interactivo de función lineal. Se eliminó por esta regla, **no por una limitación técnica** — el bloque funcionaba.

**Por qué:** la discriminación entre representaciones es el contenido evaluado de `proporcionalidad-reconocer` (L3), donde distinguir una forma de otra sí es lo que se aprende. Adelantarla a L1 no suma una representación: le quita a L3 su razón de existir, y le mete a L1 una carga cognitiva que su concepto no pide.

**Efecto en L1:** el paso 5 cierra reconstruyendo filas ausentes de la tabla, lo que ejercita la constante en los dos sentidos —de la cantidad al total y del total a la cantidad— sin salir del registro tabular.

**Mecanizada como:** `interactivoSlider` es un hallazgo 🔴 salvo que la lección declare `auditoria.sliderJustificado` con una justificación de ≥20 caracteres. La excepción existe porque L2 del módulo Función lineal y afín sí lleva la interacción insignia con sliders, y ahí es el concepto el que la exige.

---

## 2. La constante no circula antes del descubrimiento

La constante de la lección no aparece en ningún paso anterior al de descubrimiento (paso 5). Ni en enunciados, ni en bloques de texto, ni en pistas, ni en feedback de selección múltiple. El paso 5 es la primera vez que esa cifra existe en el archivo.

**Única excepción:** un `feedbackPorError` cuyo `valorObtenido` es la constante, porque solo se dispara cuando el estudiante ya escribió ese número por su cuenta. Aun así su `mensaje` no puede repetir la cifra — dice «ese número».

**Origen:** auditoría matemática de L1, 2026-08-13, y la decisión posterior de Benja (opción 1: purgar). La auditoría encontró que el 40 circulaba en cuatro lugares antes del paso 5: el bloque de texto del paso 1, el feedback del distractor 129 del paso 3, el feedback de la alternativa correcta del paso 2 —que además ejecutaba las dos divisiones— y, el más determinante, la pista de nivel 3 del paso 4, que entregaba `120 ÷ 3 = 40` servido. Una nota interna afirmaba lo contrario, que el 40 no se revelaba antes; la auditoría la desmintió.

**Por qué:** si el estudiante puede leer la constante antes, el paso 5 deja de ser un descubrimiento y pasa a ser una confirmación. Esa es exactamente la diferencia que separa a `proporcionalidad-directa` de `porcentaje-concepto`, donde el 30 % venía dado en el enunciado y el paso 5 solo verificaba que 0,30 se repetía.

**Contrapartida asumida:** la pista de nivel 3 ya no ejecuta la división, así que su gradación frente a la pista 2 se sostiene en nombrar los operandos y agregar el movimiento final, no en entregar el cálculo hecho. Si en el piloto se ve que la pista 3 no ayuda lo suficiente, **la vía no es devolverle el `120 ÷ 3 = 40`**.

**Mecanizada como:** `auditoria.constante` en el JSON (o `--constante=N`). Sin ella declarada el chequeo se omite y lo dice en la salida: se prefiere un chequeo saltado y visible a uno adivinado y silencioso.

---

## 3. Todo distractor: derivable y en banda

Un distractor tiene que cumplir las dos condiciones a la vez:

1. **Derivable** de un mecanismo de error del catálogo. Un número plausible sin origen es un defecto, aunque se vea razonable.
2. **En banda de magnitud indistinguible de la correcta.** Un número derivable pero que se descarta a ojo por tamaño también es un defecto: permite acertar sin hacer la operación.

**Origen:** historial del distractor duro del paso 2 de L1, cuatro iteraciones documentadas en sus `_notasInternas`:

| Intento | Valor | Por qué falló |
|---|---|---|
| 1 | 290 mL | No derivable de ningún procedimiento con los datos. Mapeado a `error-3`, que además es inalcanzable ahí: las dos filas comparten k, así que calcular la constante con un solo par sin verificar produce la respuesta **correcta** |
| 2 | 280 mL | Derivable, pero colisionaba con la respuesta correcta de `baseLote7` en el paso 5 (ver regla 3b) |
| 3 | 203 mL | Derivable y sin colisión, pero dejaba los dos distractores bajo 210 contra una correcta de 320: se acertaba por sentido de magnitud, sin dividir |
| 4 | 360 mL | Correcto. Se llegó cambiando las filas base a 3 g y 6 g, que era la vía real |

Con las filas 3 g / 6 g, el salto trasladado cae en 360, a **12,5 % de la correcta** (320), y además 360 es múltiplo de 40 — parece un lote legítimo, y lo es, pero de otra cantidad de pigmento.

**Corolario que costó una iteración entera:** cuando un distractor no queda en banda, la vía es **cambiar los datos base del problema**, no buscar otro número. Los tres primeros intentos fueron búsquedas de número; el cuarto fue un cambio de datos y funcionó a la primera.

### 3b. Ningún distractor vale lo mismo que una respuesta correcta del archivo

Se compara contra **todas** las respuestas correctas del archivo, no solo las del mismo paso: todos los `respuestaCorrecta` de campos numéricos más todas las alternativas con `esCorrecta: true`.

**Por qué:** un estudiante que escribe 280 en el paso 2 recibe feedback de error por un número que la lección va a declarar correcto tres pasos después. Eso no es un descuido de redacción, es una contradicción que el estudiante puede detectar y que destruye la confianza en el feedback.

**Excepción declarada:** si la colisión es deliberada se registra en `auditoria.colisionesPermitidas` con su motivo. El caso legítimo conocido es la constante misma, que es distractor antes del paso 5 (`error-4`, «entregó la constante en vez del resultado») y respuesta correcta en el paso 5. Declararla es obligatorio; que pase en silencio no.

---

## 4. Los ids de campo son neutros

Un `campos[].id` nunca contiene la cifra del problema. `baseLote12` está mal; `baseLoteGrande` o `baseLote` está bien.

**Origen:** L1, 2026-08-13.

**Por qué:** dos razones independientes. Primero, el id viaja al cliente y a los eventos de PostHog (`item_respuesta` lleva `item_id`), así que la cifra queda expuesta antes de que el estudiante responda. Segundo, y más caro en la práctica: cuando un ajuste de calibración cambia el número —y en L1 cambiaron los datos base del paso 2 y el lote ilegible del paso 5— el id queda mintiendo, y hay que elegir entre un id falso o una migración de datos de progreso ya persistidos.

**Deuda conocida:** las 14 lecciones existentes incumplen esta regla en 21 campos. Es backlog, no bloqueo de lo nuevo.

**Mecanizada como:** `id-con-cifra`, 🔴.

---

## 5. El catálogo de errores vive embebido en la L1 del módulo

El `catalogoErrores` de una unidad va **embebido en el archivo de su L1**. No se crea `content/errores/<unidad>.json` para módulos nuevos. L2, L3 y el cierre solo referencian los ids.

**Origen:** Benja, 2026-08-13, al escribir L1 de Proporcionalidad. Decisión explícita de no crear `content/errores/proporcionalidad.json`.

**Por qué es técnico, no de gusto:** `lib/sanitizar.ts` resuelve `errorCatalogado` estrictamente contra el catálogo del **mismo archivo**. Sin `catalogoErrores` embebido, la Capa 2 del feedback y el paso de autoexplicación no se resuelven. Las lecciones del módulo Porcentaje referencian `error-N` sin catálogo embebido y por eso hoy no muestran Capa 2 — es el síntoma que hizo visible la regla.

**Ojo con el validador:** `scripts/validar-contenido.mjs` mantiene un espejo antidivergencia entre `content/errores/<unidad>.json` y el catálogo embebido de su L1, vía `MAPEO_LECCION_UNIDAD`. Ese mapeo cubre unidades legadas (`enteros-racionales`, `funcion-lineal-afin`). **Un módulo nuevo no se agrega ahí**: no tiene artefacto en `content/errores/` que espejar.

---

## Cómo se verifica todo esto

| Herramienta | Qué cubre | Qué no |
|---|---|---|
| `npm run validar` | Contrato del schema: campos, formato PAES, feedback mínimo, proveniencia | Nada de este documento |
| `npm run auditar` | Reglas 1, 2, 3b, 4 + orden de pasos, habilidades, dificultad, unidades | Lo que exige recalcular o leer fuentes |
| `auditor-matematico` | Aritmética desde cero, derivabilidad de cada distractor (regla 3), banda de magnitud | Originalidad |
| `auditor-originalidad` | Checklist MOS §7.3, marcas, PII, proveniencia real | Matemática |

Los dos subagentes corren en contexto fresco. El aislamiento es la regla, no una formalidad: el hilo que escribió no puede juzgar lo que escribió.
