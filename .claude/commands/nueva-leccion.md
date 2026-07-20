---
description: Crea el esqueleto de una lección nueva conforme al schema y a los 10 pasos
---
Crea una lección nueva a partir de: $ARGUMENTS (usa un id corto en kebab-case, p. ej. l1-patrones-de-cambio).

Pasos:
1. Lee `content/schema/leccion.schema.json` y `content/lecciones/_esqueleto.json`.
2. Crea `content/lecciones/<id>.json` con los 10 pasos en orden, `"estado": "borrador"`, 2–3 ítems PAES con estructura completa (4 alternativas A–D, una sola correcta) y los bloques de proveniencia, checklist y revisión matemática vacíos o en falso.
3. Antes de redactar contenido final, propone al usuario el enfoque pedagógico del paso "descubrimiento" (cuál es el insight que el estudiante debe construir por sí mismo) y espera aprobación.
4. Redacta paso por paso. Los ítems PAES deben ser 100% originales, con contexto realista y feedback artesanal por cada distractor explicando el error específico que lo produce.
5. Ejecuta `npm run validar` y lista qué campos quedan pendientes.

Recuerda: nada de material DEMRE ni de terceros. Ante duda de originalidad, se descarta y se crea de nuevo.
