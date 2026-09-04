# Recuento: las 11 pantallas del HTML de referencia y qué las implementa

Fuente: `docs/referencia/B-linea-interfaz-completa.html` (once bloques `<!-- 01 -->`
… `<!-- 11 -->`). Estado al cierre de la fase 3H (2026-09-03).

"Completa" = la ruta existe y sigue la maqueta con los tokens de la dirección
"Línea". "Parcial" = la ruta existe y funciona, pero la migración a "Línea" está a
medias (normalmente: color de eje instalado en fase 2, marco de la maqueta sin
rehacer).

| # | Pantalla (HTML) | Ruta / componente | Estado |
|---|---|---|---|
| 01 | Entrada | `app/page.tsx` → `components/PuntoDePartida.tsx` (marco `Entrada` + `TiraKPI` + `EnlaceBoton` de `ui/linea/`) | **Completa** — fase 3F |
| 02 | La red | `app/camino/page.tsx` → `components/camino/Camino.tsx` / `CaminoVertical.tsx` + `ui/linea/NavInferior` | **Completa** — fase 2 + 3A |
| 03 | Línea | `app/linea/[ejeId]/page.tsx` → `components/camino/LineaDelEje.tsx` + `ui/linea/PlacaLinea` + `ui/linea/RielEstaciones` | **Completa** — fase 3B |
| 04 | Estación | `app/tema/[id]/page.tsx` → `components/camino/DetalleTema.tsx` + `ui/linea/TiraKPI` + `ui/linea/RielEstaciones` | **Completa** — fase 3G (ver nota 1) |
| 05 | Lección, descubrimiento | `app/leccion/[id]/page.tsx` → `components/RunnerLeccion.tsx` + `components/leccion/HeaderLeccion.tsx` + `components/bloques/*` | **Completa** — fase 3H (ver nota 2) |
| 06 | Lección, acierto | `components/RunnerLeccion.tsx` → `components/FeedbackEnCapas.tsx` + `components/ui/PanelFeedback.tsx` | **Completa** — fase 3H (ver nota 2) |
| 07 | Lección, error catalogado | `components/FeedbackEnCapas.tsx` + `components/ui/linea/TarjetaError.tsx` (disparado desde `ItemPAES` / `bloques/BloquePregunta`) | **Completa** — fase 3C (ver nota 3) |
| 08 | Cierre PAES | `app/cierre/[temaId]/page.tsx` → `components/Cierre.tsx` | **Completa** — fase 2E |
| 09 | Resultado | `components/CierreFinal.tsx` (`ui/linea/Puntaje` + `ui/linea/FranjaDeItems` + `ui/linea/TarjetaLoQueFallo`) | **Completa** — fase 2E |
| 10 | Errores | `app/errores/page.tsx` → `components/errores/ErroresVivos.tsx` / `ListaErroresVivos.tsx` + `ui/linea/NavInferior` | **Completa** — fase 3D (ver nota 4) |
| 11 | Tú | `app/tu/page.tsx` → `components/tu/AvancePersonal.tsx` + `ui/linea/TiraKPI` + `ui/linea/NavInferior` | **Completa** — fase 3E (ver nota 5) |

## Notas

**1 · Pantalla 04 (Estación) — completa desde la fase 3G (2026-09-03).** Hasta la
3F estaba parcial: tenía el color de eje de la 2C pero no el marco. Ahora sigue la
maqueta de arriba a abajo —etiqueta de línea, título, objetivo del tema, la tira
de tres cifras y el riel con las lecciones y el cierre—, con una sola acción al
pie. Salió el marco anterior (franja fija con volver a `/camino`,
`TituloDePantalla` y la columna de `CaminoVertical` con tarjeta flotante) y con él
`CaminoLecciones`, que quedó sin consumidor y se borró. `CaminoVertical` sigue en
pie: lo usa la pantalla 02.

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

Dos hechos que la migración deja anotados, sin actuar sobre ellos:

- **`presentacionDeLeccion` (`lib/descripcionesLecciones.tsx`) queda sin consumidor
  de runtime.** Su único llamador era `CaminoLecciones`. No se borra: tiene test
  propio con cobertura obligatoria (`lib/__tests__/descripcionesLecciones.test.ts`,
  que exige entrada por lección) y es copy escrito a mano. Qué hacer con él es
  decisión de contenido, no de esta migración. El marco nuevo, además, ya no
  muestra descripción por lección: la maqueta de la 04 no la trae.
- **La suite de Playwright está roja, y lo estaba antes de la 3G.** Ver nota 6.

**2 · Pantallas 05 y 06 (Lección) — completas desde la fase 3H (2026-09-03).**
Hasta la 3G estaban parciales: el runner tomaba el color de eje desde la 2D pero el
cromo del paso no seguía la maqueta. Ahora sí: barra `[Salir] [progreso] [n/N]` en
lugar del ícono de salida y el eyebrow "Paso N · tipo", enunciado con la tipografía
`.q`, tarjeta blanca para todo bloque visual, tarjeta teñida "Lo que estás viendo",
tarjeta "Correcto" en el acierto y el par "¿Te hizo sentido? Sí / Todavía no".

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

**3 · Pantalla 07.** El tercer párrafo del banner de error (el que rehace el
cálculo paso a paso) tiene deuda propia en `docs/deuda-banner-error-desarrollo.md`
y `docs/deuda-catalogo-errores-crossfile.md`.

**4 · Pantalla 10.** El conteo de la sesión no distingue id ni eje; detalle en
`docs/deuda-errores-vivos.md`.

**5 · Pantalla 11.** Racha, ítems acumulados y el conteo de *estaciones* (en vez
de lecciones) no tienen fuente que los sostenga; detalle en
`docs/deuda-avance-por-linea.md`, que además documenta el bug del balde único
`"cierre"` en `estadoDeNodo`.

**6 · La suite de Playwright está roja, y no la rompió la fase 3G.** Medido:
22 fallos, 46 en verde, 4 saltados, y el mismo resultado corriendo la suite
contra `15b7626` (cierre de la 3F). Once de esos fallos ni siquiera abren
`/tema/[id]`. Detalle y desglose por test en `docs/deuda-e2e-capturas.md`.

## Fuera de las 11

`docs/deuda-navegacion.md` lista las rutas que no son ninguna de las 11 y quedaron
sin `NavInferior` tras sacarla del layout: `/inicio` (redirige a `/`),
`/lecciones`, `/diagnostico`, `/cuenta`, `/ingresar`, `/registrarse`,
`/privacidad`, `/preventa` y las tres de `/vista-previa/*`.
