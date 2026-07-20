---
description: Redacta ítems originales en formato PAES M1 para un concepto dado
---
Redacta ítems originales en formato PAES M1 según: $ARGUMENTS (indica concepto y cantidad; por defecto 3).

Formato PAES M1: selección múltiple con respuesta única y 4 alternativas (A–D). Para cada ítem entrega, en el formato `item` del schema (`content/schema/leccion.schema.json`):
- habilidad evaluada: resolver, modelar, representar o argumentar (varía entre ítems),
- dificultad: baja, media o alta,
- enunciado con contexto realista chileno cuando aplique,
- 4 alternativas donde cada distractor encarna un error frecuente y documentado del concepto,
- feedback artesanal por distractor: nombra el error y reorienta sin regalar la respuesta,
- solución paso a paso verificada recalculando desde cero.

Prohibido: parecerse a ítems DEMRE o de terceros, usar datos personales reales, sugerir afiliación con marcas. Al final, autoevalúa cada ítem contra el checklist de originalidad del MOS §7.3 y declara el veredicto.
