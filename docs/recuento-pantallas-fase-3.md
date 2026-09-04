# Recuento: las 11 pantallas del HTML de referencia y qué las implementa

Fuente: `docs/referencia/B-linea-interfaz-completa.html` (once bloques `<!-- 01 -->`
… `<!-- 11 -->`). Estado al cierre de la fase 3I (2026-09-03).

"Completa" = la ruta existe y sigue la maqueta con los tokens de la dirección
"Línea". "Parcial" = la ruta existe y funciona, pero la migración a "Línea" está a
medias — en los dos casos que quedan, eso significa que tiene el color de eje de
la fase 2 y no el marco de la maqueta.

**Este recuento se rehizo midiendo contra el código, no contra la versión
anterior de este mismo archivo.** La edición del cierre de la 3H daba las once
por completas; dos no lo estaban. El criterio de "completa" nunca cambió: lo que
faltaba era pasar cada ruta por él.

| # | Pantalla (HTML) | Ruta / componente | Estado |
|---|---|---|---|
| 01 | Entrada | `app/page.tsx` → `components/PuntoDePartida.tsx` (marco `Entrada` + `TiraKPI` + `EnlaceBoton` de `ui/linea/`) | **Completa** — fase 3F |
| 02 | La red | `app/camino/page.tsx` → `components/camino/Camino.tsx` / `CaminoVertical.tsx` + `ui/linea/NavInferior` | **Parcial** (ver nota 1) |
| 03 | Línea | `app/linea/[ejeId]/page.tsx` → `components/camino/LineaDelEje.tsx` + `ui/linea/PlacaLinea` + `ui/linea/RielEstaciones` | **Completa** — fase 3B (ver nota 2) |
| 04 | Estación | `app/tema/[id]/page.tsx` → `components/camino/DetalleTema.tsx` + `ui/linea/TiraKPI` + `ui/linea/RielEstaciones` | **Completa** — fase 3G (ver nota 3) |
| 05 | Lección, descubrimiento | `app/leccion/[id]/page.tsx` → `components/RunnerLeccion.tsx` + `components/leccion/HeaderLeccion.tsx` + `components/bloques/*` | **Completa** — fase 3H (ver nota 4) |
| 06 | Lección, acierto | `components/RunnerLeccion.tsx` → `components/FeedbackEnCapas.tsx` + `components/ui/PanelFeedback.tsx` | **Completa** — fase 3H (ver nota 4) |
| 07 | Lección, error catalogado | `components/FeedbackEnCapas.tsx` + `components/ui/linea/TarjetaError.tsx` (disparado desde `ItemPAES` / `bloques/BloquePregunta`) | **Completa** — fase 3C (ver nota 5) |
| 08 | Cierre PAES | `app/cierre/[temaId]/page.tsx` → `components/Cierre.tsx` → `EjecutorSetItems` → `ItemPAES` | **Parcial** (ver nota 6) |
| 09 | Resultado | `components/CierreFinal.tsx` (`ui/linea/Puntaje` + `ui/linea/FranjaDeItems` + `ui/linea/TarjetaLoQueFallo` + `ui/linea/Boton`) | **Completa** — fase 3I (ver nota 7) |
| 10 | Errores | `app/errores/page.tsx` → `components/errores/ErroresVivos.tsx` / `ListaErroresVivos.tsx` + `ui/linea/NavInferior` | **Completa** — fase 3D (ver nota 8) |
| 11 | Tú | `app/tu/page.tsx` → `components/tu/AvancePersonal.tsx` + `ui/linea/TiraKPI` + `ui/linea/NavInferior` | **Completa** — fase 3E (ver nota 9) |

## Notas

**1 · Pantalla 02 (La red) — parcial.** Tiene el color de eje por sección (fase
2C, `lineaDeEje` en `Camino.tsx:139-142`) y la `NavInferior` de la fase 3A. Lo
que falta es el marco entero: `Camino.tsx` sigue montando la franja fija con
`TituloDePantalla` ("Tu camino") y `ContadorDePantalla`, y debajo la columna de
nodos de `CaminoVertical` dentro de un `rounded-panel`.

La maqueta es otra cosa: titular "Tu red / Vas en la N" con la racha a la
derecha, subtítulo "16 estaciones repartidas en 4 líneas", y **cuatro filas
compactas** —una por línea, con barra de color a la izquierda, nombre, "N de M
estaciones" y una fila de puntos— más el CTA "Ir a mi estación". Es decir: la
maqueta resume por línea y la implementación lista los 16 temas.

Dos de esos datos no tienen fuente hoy y habría que resolverlos antes de armar la
pantalla: la **racha** (mismo hueco que en /tu, `docs/deuda-avance-por-linea.md`
punto 1) y el conteo por **estaciones** en vez de lecciones, que pasa por el
balde único del `contextoId` (ver "Lo que queda abierto", punto 1).

**2 · Pantalla 03 (Línea).** Completa, con una omisión declarada: no se pinta la
estación de combinación que cierra la línea en la maqueta ("Combinación · cierre
de línea · 12 ítems PAES"). `lib/modulos.ts` declara `cierreId` por **tema**,
`FormaEje` no tiene ningún campo de cierre y la ruta es `/cierre/[temaId]`: el
título, el conteo y el destino habría que inventarlos los tres. El estado
`combinacion` de `<Estacion>` queda soportado por el riel y visible en
`/_design`. Ver `LineaDelEje.tsx:400-415`.

**3 · Pantalla 04 (Estación) — completa desde la fase 3G.** Sigue la maqueta de
arriba a abajo: etiqueta de línea, título, objetivo del tema, la tira de tres
cifras y el riel con las lecciones y el cierre, con una sola acción al pie. Salió
el marco anterior (franja fija con volver a `/camino`, `TituloDePantalla` y la
columna de `CaminoVertical` con tarjeta flotante) y con él `CaminoLecciones`, que
quedó sin consumidor y se borró. `CaminoVertical` sigue en pie: lo usa la 02.

Tres cosas que la migración decidió y conviene no re-discutir a ciegas:

- **La lección aún no alcanzada va en `proxima`, no apagada**, y el cierre va en
  `combinacion` a secas y no en `combinacion + apagado`. La maqueta las pinta con
  `.stn.lock`, pero en este producto no hay puerta por prerrequisitos: apagarlas
  prometería un candado que no existe.
- **El párrafo bajo el título es `tema.objetivo`.** El modelo de tema no tiene
  campo `descripcion` ni `resumen` (`FormaTema` en `lib/modulos.ts`), y `objetivo`
  es el único texto descriptivo que ya existía — el mismo que la ruta usa como
  `description`. No se redactó copy nuevo.
- **Sin `NavInferior`**, igual que la 03: la 04 es profundidad dentro de la red,
  no un destino de la barra.

**4 · Pantallas 05 y 06 (Lección) — completas desde la fase 3H.** Barra
`[Salir] [progreso] [n/N]` en lugar del ícono de salida y el eyebrow "Paso N ·
tipo", enunciado con la tipografía `.q`, tarjeta blanca para todo bloque visual,
tarjeta teñida "Lo que estás viendo", tarjeta "Correcto" en el acierto y el par
"¿Te hizo sentido? Sí / Todavía no".

**La salida va a `/tema/[id]`, no a `/camino`.** El destino se resuelve por dato
—el tema ya baja desde el servidor a `RunnerLeccion`—, no con `history.back()`,
que devolvería a donde venga el navegador: una recarga o un enlace pegado no
tienen historia que deshacer.

Cinco desvíos deliberados de la maqueta, cada uno con su motivo:

- **El acierto se queda en el verde de `success`, no en el color del eje.** La
  maqueta pinta "Correcto" y la alternativa correcta con `--acc`, que en su
  pantalla de ejemplo es el verde de la línea 03. Copiarlo literal pintaría de
  rojo (línea 01) o de amarillo (línea 02) una respuesta correcta, y eso no
  significa "correcto" en ninguna convención. El color del eje dice *dónde* estás;
  el veredicto es otra cosa. La elegida incorrecta sí toma el `.opt.no` de la
  maqueta —tinta, fondo hundido, disco en negativo—, que antes quedaba teñida con
  el color del eje, o sea idéntica a estar simplemente elegida.
- **El rótulo de la tarjeta teñida no va en `var(--linea)` crudo.** Medido: sobre
  el tinte de su propia línea da 4,06 (01), 1,63 (02) y 4,30 (03) — bajo AA para
  10px. Va en `--linea-sobre-tinte`, un token nuevo de la 3H. La maqueta falla ahí
  (su rótulo verde sobre `#EAF5EE` da 4,30) y "AA o no se usa".
- **"Salir" y el contador van en `--text-primary`,** no en el `--ink2` de `.lbl`:
  sobre el fondo de página ese gris da 4,42. Ver `docs/deuda-contraste-etiquetas.md`.
- **La tarjeta teñida solo envuelve el texto que va después del primer bloque
  visual.** Medido sobre el corpus: de los 38 pasos que mezclan visual con texto,
  27 tienen texto después del visual y 11 lo tienen solo antes. Esos 11 quedan sin
  tarjeta: ahí el texto es el planteo y rotularlo "Lo que estás viendo" sería falso.
- **"Ya lo vi" no alcanza al último paso.** Son 44 pasos (de 340) los que no abren
  ningún panel de feedback sin ser el último del archivo. El último conserva
  "Terminar lección": es otra acción, y en 27 de las 34 lecciones tampoco tiene
  pregunta, así que la regla se habría comido ese copy casi siempre.

Dos hechos que la migración deja anotados, sin actuar sobre ellos:

- **Los controles *dentro* de los bloques siguen en índigo** ("Revisar respuesta",
  "¿Por qué?", "Intentar de nuevo"), igual que el `bg-accent-suave` de tablas y
  diagramas. La 3H migró el marco del paso, no la paleta de los bloques.
- **El panel de acierto con rótulo "Correcto" llega a `pregunta` y a los
  `itemsPAES`** (los dos pasan por `FeedbackEnCapas`). Los bloques `seleccion`,
  `numerica` y `verdaderoFalso` conservan su panel teñido de antes: son 192 pasos
  con veredicto contra los 20 que tienen bloque `pregunta`, y unificarlos es
  decidir qué pasa con el ícono y el fondo verde en todos ellos a la vez.

**5 · Pantalla 07.** El tercer párrafo del banner de error (el que rehace el
cálculo paso a paso) tiene deuda propia en `docs/deuda-banner-error-desarrollo.md`
y `docs/deuda-catalogo-errores-crossfile.md`.

**6 · Pantalla 08 (Cierre PAES) — parcial.** La cadena que la dibuja
—`EjecutorSetItems` → `ItemPAES`— **no importa nada de `ui/linea/`**: usa
`components/ui/BarraProgreso`, `components/ui/Boton` y los tokens de
`components/ui/alternativa.ts`. Lo único de la dirección que llegó ahí es el
color de eje en el chip de la alternativa marcada (`ItemPAES.tsx:233`, fase 2D).

Contra la maqueta faltan: la pill "Cierre PAES" y el rótulo "Ítem N de M" en la
fila superior, la barra fina debajo, y las alternativas del kit (`ui/linea/
Alternativa`, hoy instanciado solo en `/_design`). En su lugar hay "Habilidad: X"
a la izquierda, el cronómetro a la derecha y el CTA "Revisar respuesta".

Dos cosas a decidir antes de migrarla, y por eso no se hizo de paso:

- El cronómetro visible y "Habilidad: X" no están en la maqueta pero son
  decisiones pedagógicas anteriores (entrenar el ritmo de ~2 min por pregunta).
  Sacarlos es una decisión de producto, no de estilo.
- La maqueta ofrece "Marcar y seguir" además de "Responder". Eso es saltar un
  ítem y volver, que el reducer de `lib/estadoSetItems.ts` no soporta: hoy avanza
  y no retrocede. Es funcionalidad nueva, no marco.

`ItemPAES` lo comparten /diagnostico, el cierre y la fase de ítems de una
lección, así que cualquier cambio ahí toca las tres.

**7 · Pantalla 09 (Resultado) — completa desde la fase 3I (2026-09-03).** La
franja de ocho celdas y la tarjeta "Lo que falló" ya estaban desde la 2E
(`ui/linea/FranjaDeItems`, `ui/linea/TarjetaLoQueFallo`): acierto en color de eje
y error en tinta sobre superficie hundida, pill del error en tinta, descripción
cuando el catálogo la resolvió, y los números de ítem donde cayó. La 3I cerró el
pie, que tenía un solo botón ("Quiero la próxima lección" hacia la portada) donde
la maqueta tiene dos:

- **"Repasar ese error"**, deshabilitado con el mismo control que el "Repasar" de
  /errores (`ListaErroresVivos.tsx:64`): no existe ruta de repaso dirigido. Se
  renderiza solo cuando hay grupos — sin error catalogado, "ese error" no nombra
  nada, y la tarjeta de arriba tampoco se dibujó. Sin el "· 3 min" de la maqueta,
  que no tiene fuente.
- **"Ir a la siguiente estación"**, con el destino resuelto en servidor por
  `siguienteTemaConNodo` (`lib/camino.ts`), que recorre `temasConNodo()` — ya en
  orden de temario y sin los temas que no tienen página. Sin siguiente estación
  el botón dice "Volver a la red".

Dos decisiones que conviene no re-discutir a ciegas:

- **`solicitud_siguiente_leccion` conserva su significado** —"no queda nada
  abierto y quiero más"— y por eso solo se emite en la rama sin estación
  siguiente. Con una estación real el estudiante no está pidiendo contenido que
  falta, y contarlo ahí convertiría una señal de demanda en un contador de
  navegación. La lista de eventos de `CLAUDE.md` no cambió.
- **La tarjeta no se alimenta de `lib/erroresVivos.ts`**, el agregador de
  /errores, y no es duplicación. Son dos preguntas distintas sobre entradas
  distintas: `agruparErroresDelCierre` opera sobre **una corrida** (`items` +
  `respuestas` del reducer) y devuelve id + números de ítem;
  `erroresVivosDeSesion` opera sobre la **sesión entera** —lecciones y otros
  cierres incluidos—, cuña por descripción y no guarda ni id ni posición
  (`lib/progresoSesion.ts:57`, y la nota de `lib/erroresVivos.ts:20-24`).
  Alimentarla desde ahí borraría el pill y los números de ítem, y la tarjeta
  hablaría de errores que no ocurrieron en este cierre.

Queda sin migrar el **marco superior** de la pantalla: `PantallaCentrada` con
`IlustracionCierre` y el encabezado "Cierre del módulo / Terminaste el módulo".
La maqueta abre con la etiqueta de línea "Cierre · {estación}" y la cifra grande
sola. Además ese copy quedó viejo: desde la Enmienda 2 la ruta cierra **una
estación**, no el módulo, y hay once cierres. No estaba en el alcance de la 3I.

**8 · Pantalla 10.** El conteo de la sesión no distingue id ni eje; detalle en
`docs/deuda-errores-vivos.md`.

**9 · Pantalla 11.** Racha, ítems acumulados y el conteo de *estaciones* (en vez
de lecciones) no tienen fuente que los sostenga; detalle en
`docs/deuda-avance-por-linea.md`, que además documenta el bug del balde único
`"cierre"` en `estadoDeNodo`.

## Lo que queda deliberadamente abierto

Nada de esta lista se tocó en la 3I. Está acá para que se decida a propósito y no
por descuido.

1. **El bug del `contextoId`.** `Cierre.tsx:56` escribe `contextoId="cierre"`
   para los once cierres, y `estadoDeNodo` lee ese balde único
   (`lib/estadoNodo.ts:118`), así que rendir un cierre marca completos temas
   ajenos. Es lo que obliga a /tu a contar lecciones en vez de estaciones y lo
   que bloquea el "N de M estaciones" de la pantalla 02. Detalle en
   `docs/deuda-avance-por-linea.md` §3.
2. **Ensayo sin ruta.** `ENLACES_NAV` (`ui/linea/NavInferior.tsx:25-29`) no
   declara `ensayo`: el tab se dibuja pero no es interactivo. No hay producto de
   ensayo, y ni /diagnostico ni /cierre lo son.
3. **Tres CTA deshabilitados**, cada uno por falta de destino real y no por
   estilo: "Repasar" en /errores (no hay repaso dirigido), "Enviar reporte al
   apoderado" en /tu (sin destinatario ni decisión de consentimiento sobre un
   menor) y "Repasar ese error" en la 09 (mismo motivo que el primero).
4. **`e2e/capturas.spec.ts` está roja y no se tocó.** Medido en la 3G: 22 fallos,
   46 en verde, 4 saltados, y el mismo resultado corriendo la suite contra
   `15b7626` (cierre de la 3F). Once de esos fallos ni siquiera abren
   `/tema/[id]`. Desglose por test en `docs/deuda-e2e-capturas.md`.
5. **Las pantallas 02 y 08 siguen parciales.** Notas 1 y 6; ninguna de las dos es
   solo marco.
6. **`lib/descripcionesLecciones.tsx` es código muerto.** `presentacionDeLeccion`
   no tiene consumidor de runtime desde la 3G, cuando se borró `CaminoLecciones`.
   El 2026-09-03 su test dejó de exigir cobertura total —pedir copy de interfaz
   para un módulo que nadie monta es un contrato que nadie cumple— y hoy solo
   verifica que ninguna clave apunte a una lección sin archivo. Quedan 9
   lecciones con archivo y sin entrada, listadas en el comentario del test.
   Darle consumidor o borrarlo es decisión de contenido.

## Fuera de las 11

`docs/deuda-navegacion.md` lista las rutas que no son ninguna de las 11 y quedaron
sin `NavInferior` tras sacarla del layout: `/inicio` (redirige a `/`),
`/lecciones`, `/diagnostico`, `/cuenta`, `/ingresar`, `/registrarse`,
`/privacidad`, `/preventa` y las tres de `/vista-previa/*`.
