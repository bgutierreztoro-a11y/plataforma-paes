# Plan semanal — idea en espera

**Estado: no construido. Cero código.** Este documento existe para que la idea
no se pierda y para que, cuando se retome, no se rediseñe desde cero ni se
confunda con una racha diaria.

Fecha: 2026-07-26

---

## Qué es

El estudiante elige el lunes qué días de esa semana va a estudiar. La plataforma
lleva la cuenta de **semanas cumplidas**, no de días seguidos.

Reglas, en el orden en que importan:

1. **El estudiante elige sus días.** No los asigna la plataforma. Un lunes se
   marcan los días de esa semana y ese es el compromiso.
2. **La unidad es la semana, nunca el día.** Lo que se cuenta y se muestra son
   semanas cumplidas. Un día suelto no es una unidad de nada.
3. **Una semana parcial no suma, pero NUNCA reinicia el historial.** Si el
   estudiante se comprometió a tres días e hizo dos, esa semana no cuenta como
   cumplida — y las semanas cumplidas anteriores siguen ahí, intactas.
4. **Se acumulan las semanas cumplidas.** El contador solo sube.

## Por qué no es una racha

La regla 3 es la idea entera, y es lo que separa esto de la mecánica que el MOS
tiene en lista negra. Una racha diaria castiga la ausencia: fallar un día borra
semanas de trabajo, y esa amenaza es justamente el mecanismo con que funciona.
Acá fallar una semana cuesta esa semana y nada más.

MASTER.md §3.6 lo dice sin ambigüedad: *"Sin rachas culposas. No implementamos
mecánicas que castiguen la ausencia. Celebramos terminar una lección, no
mantener el fuego."* Y §6 agrega, entre los anti-patrones: *"Gamificación
culpógena. Sin rachas que castiguen, sin notificaciones de te extrañamos."*

Un plan semanal con historial que no se borra celebra haber estudiado. Una racha
diaria amenaza con perderlo todo. La distancia entre ambas cosas es la regla 3,
y si alguna vez se negocia, esto pasa a ser lo que el MOS prohíbe.

## Cuándo activarlo

**Solo cuando el contenido no se agote en una sesión.** Hoy hay una lección
publicable: un plan semanal sobre eso le pediría al estudiante que se
comprometa a volver a una plataforma que no tiene a qué hacerlo volver. La idea
no falla por diseño, falla por falta de contenido.

Gatillo concreto: cuando un tema completo (varias lecciones más su cierre) no
quepa en una sola sesión de estudio.

## Dependencias, todas reales

**Clerk + Neon.** El plan tiene que sobrevivir al cambio de dispositivo o no
significa nada. Un compromiso guardado solo en `localStorage` desaparece al
cambiar de teléfono, y el estudiante ve su historial en cero sin haber fallado.
Eso requiere cuenta y persistencia en servidor — hoy existen las dos piezas,
pero la migración del progreso local al servidor todavía no está construida (ver
`docs/pendientes.md`, 2026-07-26).

**Política de privacidad, Ley 21.719.** El horario de estudio declarado es un
dato personal nuevo: dice cuándo una persona menor de edad está frente a la
pantalla. No está cubierto por la frontera actual del MOS §7.5 ("desempeño sí,
identidad no"), porque no es desempeño. Antes de recolectarlo hay que declararlo
explícitamente en la política publicada: qué se guarda, para qué, por cuánto
tiempo. La ley entra en vigencia el 1 de diciembre de 2026, dentro de la primera
temporada de venta.

**Recordatorio in-app, no push.** Las notificaciones push a menores de edad son
otra conversación legal y otro permiso del sistema operativo. El recordatorio
vive dentro de la aplicación, donde el estudiante ya decidió entrar. Además, una
notificación de "te extrañamos" es exactamente el anti-patrón de §6.

## Lo que este documento NO autoriza

No autoriza construir nada. No cruza ningún gate. Si alguien lo lee y quiere
implementarlo, el paso previo es el de siempre (MOS §11 #1): declarar qué
incertidumbre reduce, cómo se mide, y qué umbral lo mataría.
