---
description: Aplica el checklist de originalidad y el protocolo legal (MOS §7) antes de publicar
---
Lanza el subagente `auditor-originalidad` sobre: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente aplica las 4 preguntas del checklist del MOS §7.3:
1. ¿Algún enunciado o ejercicio es sustancialmente similar a una fuente conocida, aunque cambien palabras o números?
2. ¿Algún diagrama o visualización replica la composición de uno existente?
3. ¿La secuencia interna copia la estructura expresiva de una guía específica, más allá del orden lógico natural?
4. ¿Queda registrada la proveniencia (fuentes de análisis + declaración de originalidad)?

Además verifica: uso solo descriptivo de "PAES" y "DEMRE", ausencia de datos personales, y feedback artesanal escrito en todos los distractores (nada de placeholders).

Regla dura: ante duda razonable, el veredicto es NO PUBLICAR, con una alternativa propuesta. El subagente NO edita el JSON; solo entrega el veredicto.

`checklistOriginalidad` (los 4 booleanos, revisadoPor, fecha) y `estado` los escribe siempre a mano el autor humano, después de leer este veredicto con sus propios ojos. Ningún proceso automático los escribe.
