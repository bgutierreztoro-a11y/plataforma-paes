---
description: Auditoría matemática independiente de una lección o set de ítems
---
Lanza el subagente `revisor-matematico` para auditar: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente debe: recalcular cada solución desde cero sin mirar la solución escrita; verificar que la alternativa marcada como correcta lo es; comprobar que cada distractor es incorrecto exactamente por el error que su feedback describe; revisar unidades, dominios, casos borde y consistencia de los datos del enunciado.

Además: comprobar que cada distractor sea alcanzable simulando su error y produzca ese número exacto; que ninguna alternativa correcta sea ambigua ni haya dos alternativas con el mismo valor; y que el `errorCatalogado` de cada distractor corresponda al error realmente cometido, contra el catálogo de `content/errores/<unidad>.json`.

Entrega una tabla ítem → veredicto → hallazgos. El subagente NO edita el JSON. Cualquier discrepancia se corrige antes de commitear el contenido.

**Aislamiento (obligatorio).** Esta auditoría corre en un hilo abierto con `/clear`, nunca en el que redactó el contenido: el archivo se trata como ajeno y no se confía en ninguna nota interna ni feedback del propio JSON. Ese aislamiento es lo que hace válida la auditoría, ahora que no existe campo `estado` ni firma manual — ver `CLAUDE.md`, regla 5.
