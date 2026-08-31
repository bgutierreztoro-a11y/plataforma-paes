# Deuda de navegación tras adoptar `NavInferior`

Origen: fase de andamiaje de navegación "Línea", 2026-08-30.

La barra de la dirección "Línea" (`components/ui/linea/NavInferior`) reemplazó a
`components/navegacion/Navegacion.tsx`, que se borró junto con sus iconos. La
barra vieja se montaba global en `app/layout.tsx` y se escondía sola en
`/leccion/`; la nueva la monta explícitamente cada pantalla que la lleva, porque
en el HTML de referencia solo las pantallas 02 (La red), 10 (Errores) y 11 (Tú)
traen barra.

Esto es lo que quedó abierto. Nada de acá es un descubrimiento posterior: son
consecuencias aceptadas de una decisión tomada con los números a la vista.

---

## 1. Doce rutas quedaron sin ninguna navegación

Antes, 17 de 18 rutas mostraban la barra. Ahora la muestran 3: `/camino` (Red),
`/errores` y `/tu`.

Seis la perdieron **correctamente**, porque el HTML tampoco se la da:
`/leccion/[id]`, `/cierre`, `/cierre/[temaId]`, `/tema/[id]`,
`/tema/[id]/completado` y `/linea/[ejeId]`.

Las otras doce la perdieron **sin criterio en la fuente de verdad**, porque no
tienen contraparte entre las once pantallas del HTML:

`/` · `/inicio` · `/lecciones` · `/diagnostico` · `/preventa` · `/privacidad` ·
`/ingresar` · `/registrarse` · `/vista-previa/cuerpos-geometricos` ·
`/vista-previa/interactivo-dos-variables` · `/vista-previa/interactivo-parabola` ·
`/_design`

Se descartó montar las dos barras en paralelo durante la transición: dos
navegaciones distintas conviviendo enseñan una interfaz que no existe.

**Qué falta:** decidir, pantalla por pantalla, cuáles migran a una de las once y
cuáles dejan de existir. `/inicio` y `/lecciones` son las candidatas obvias a
colapsar contra `/camino`; `/preventa` y `/privacidad` probablemente nunca
lleven barra.

---

## 2. La superficie de cuenta quedó alcanzable solo por URL

`Navegacion.tsx` tenía una tercera pestaña, "Perfil", que era el **único** punto
de entrada en toda la interfaz a `openUserProfile()` (con sesión) y a
`/ingresar` (sin ella). Los cuatro destinos de `NavInferior` son producto —Red,
Ensayo, Errores, Tú— y ninguno es la cuenta.

Se creó `/cuenta` para no perder la función, y `components/cuenta/EnlaceCuenta`
la enlaza desde el pie de `/ingresar` y `/registrarse`. Pero esas dos páginas
tampoco tienen ya enlace entrante, así que la cadena completa
(`/ingresar` → `/cuenta`) se alcanza escribiendo la URL o cayendo por el propio
flujo de Clerk.

**El costo concreto: cerrar sesión pasó a ser una acción solo-por-URL.** Los
usuarios son menores que pueden estar en un computador compartido del colegio.

Hoy el daño está acotado porque la cuenta casi no hace nada —crea una fila en
`usuarios` y un entitlement gratis; el progreso pedagógico no sobrevive a un
reload, con cuenta o sin ella (`docs/plan-fase-3-navegacion.md:14-31`)—. **Deja
de estar acotado en el momento en que `guardarProgreso` se cablee de verdad**, y
ese es el gatillo para resolverlo, no antes.

**Salida mínima si urge:** una línea en `components/ui/PieLegal.tsx`, que sí se
monta global.

---

## 3. `PieLegal` queda por debajo de la barra

`NavInferior` no es `fixed`: es `flex w-full border-t`. En las tres pantallas
que la llevan se monta con `sticky bottom-0 z-40`, que devuelve la superposición
que antes daba el `fixed`. Pero `PieLegal` se sigue montando desde el layout,
después de `children`, así que en el scroll queda **debajo** de la barra.

Aceptado para andamiaje. Se resuelve cuando las pantallas 10 y 11 tengan
contenido real y haya que decidir si el pie legal vive dentro o fuera de la
columna que la barra cierra.

---

## 4. `docs/plan-fase-3-navegacion.md` quedó desactualizado

Ese doc describe la barra vieja, la de julio. Sigue siendo insumo válido en tres
puntos que esta fase respetó —§1 (ninguna copy puede insinuar que la cuenta
guarda el avance), §6.1 (no romper el prerender) y §9 (los cuatro checks de
cierre)—, pero contradice al repo en otros tres:

- `:9` — dice "Estado: aprobado, sin ejecutar. Ninguna línea de código de esta
  fase está escrita." Falso desde que `Navegacion.tsx` se escribió y se montó.
- `:113` — manda Camino a `/lecciones`; el código usaba `/camino`.
- `:199` — razona sobre el campo `estado: revision`, eliminado el 2026-08-12
  (`CLAUDE.md`, convenciones técnicas).

No se corrigió el doc en esta fase: describe una fase cerrada y reescribirlo
borraría el registro de lo que se decidió entonces. Si estorba, se archiva; no se
edita en el lugar.

---

## 5. Se eliminó el par `pb-14` / `-mb-14`, sin cambio de comportamiento

No es deuda abierta. Queda anotado porque el cambio viajó dentro del commit de
la barra y toca tres archivos que no son de navegación.

`<body>` reservaba el alto de la barra fija con `pb-14 sm:pb-0`, y
`components/ui/ZonaAnclada.tsx` lo devolvía con `-mb-14 sm:mb-0` a través de una
prop `modoFoco`. Eran un par: sin la barra global, el primero no reserva nada y
el segundo queda como margen negativo suelto. Se eliminaron los dos, y con ellos
la prop `modoFoco` y sus dos usos.

**Durante la revisión se sospechó un bug latente acá y no lo había.** La
hipótesis era que `EjecutorSetItems` pasaba `modoFoco` incondicionalmente y que
sus consumidores `Diagnostico.tsx` y `Cierre.tsx` —rutas que sí montaban la
barra— caían en el caso que el comentario de `ZonaAnclada` declaraba
inaceptable. Es falso: `EjecutorSetItems.tsx:76` corta antes con
`if (!anclarAcciones) return contenido;`, `anclarAcciones` es `false` por
defecto y **solo lo pasa `RunnerLeccion.tsx:171`**. O sea, `CascaronAnclado`
solo se montaba en `/leccion/[id]`, que es justo donde `modoFoco` era correcto.

Verificado en el navegador a 390×844, no deducido:

- `/leccion/enteros-operar-y-ordenar` — el cascarón mide `top 0 / bottom 844`
  con `margin-bottom: 0px`, exactamente el viewport, y `scrollHeight` 844: ni
  banda muerta ni scroll de más.
- `/diagnostico` (ítem 1 en pantalla), `/cierre/enteros-y-racionales` y
  `/tema/enteros-y-racionales/completado` — no montan `CascaronAnclado` en
  absoluto, y reinyectar `padding-bottom: 56px` en `<body>` da geometría
  idéntica al píxel. Quitar `pb-14` no les cambió nada.
