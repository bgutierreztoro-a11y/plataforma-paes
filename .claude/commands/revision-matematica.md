---
description: Auditoría matemática independiente de una lección o set de ítems
---
Lanza el subagente `revisor-matematico` para auditar: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente debe: recalcular cada solución desde cero sin mirar la solución escrita; verificar que la alternativa marcada como correcta lo es; comprobar que cada distractor es incorrecto exactamente por el error que su feedback describe; revisar unidades, dominios, casos borde y consistencia de los datos del enunciado.

Entrega una tabla ítem → veredicto → hallazgos. El subagente NO edita el JSON. Cualquier discrepancia bloquea el estado publicable y se corrige antes de cerrar la sesión.

`revisionMatematica` (aprobada, revisadoPor, fecha) y `estado` los escribe siempre a mano el autor humano, después de leer este resultado con sus propios ojos. Ningún proceso automático los escribe.
