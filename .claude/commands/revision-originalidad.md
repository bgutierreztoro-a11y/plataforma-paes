---
description: Aplica el checklist de originalidad y el protocolo legal (MOS §7) antes de commitear contenido
---
Lanza el subagente `auditor-originalidad` sobre: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente aplica las 4 preguntas del checklist del MOS §7.3:
1. ¿Algún enunciado o ejercicio es sustancialmente similar a una fuente conocida, aunque cambien palabras o números?
2. ¿Algún diagrama o visualización replica la composición de uno existente?
3. ¿La secuencia interna copia la estructura expresiva de una guía específica, más allá del orden lógico natural?
4. ¿Queda registrada la proveniencia (fuentes de análisis + declaración de originalidad)?

Además verifica: uso solo descriptivo de "PAES" y "DEMRE", ausencia de datos personales, y feedback artesanal escrito en todos los distractores (nada de placeholders).

Regla dura: ante duda razonable, el veredicto es NO COMMITEAR, con una alternativa propuesta. El subagente NO edita el JSON; solo entrega el veredicto.

**Aislamiento (obligatorio).** Esta auditoría corre en un hilo abierto con `/clear`, nunca en el que redactó el contenido. No existe campo `estado` ni `checklistOriginalidad` que firmar (eliminados el 2026-08-12): lo que respalda el contenido es que la auditoría se haya corrido con contexto limpio y sus hallazgos se hayan corregido antes del commit — ver `CLAUDE.md`, regla 5.
