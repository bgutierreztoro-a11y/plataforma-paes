# Recuento: las 11 pantallas del HTML de referencia y qué las implementa

Fuente: `docs/referencia/B-linea-interfaz-completa.html` (once bloques `<!-- 01 -->`
… `<!-- 11 -->`). Estado al cierre de la fase 3J (2026-09-04).

"Completa" = la ruta existe y sigue la maqueta con los tokens de la dirección
"Línea".

**Once de once, medido contra el código.** La 3J cerró las dos que quedaban
parciales —la 02 y la 08—, que tenían el color de eje de la fase 2 pero no el
marco de la maqueta. Este recuento se rehace midiendo el código, no editando la
versión anterior de este archivo: la edición del cierre de la 3H ya había dado
las once por completas cuando dos no lo estaban. El criterio de "completa" nunca
cambió; lo que faltaba era pasar cada ruta por él.

"Completa" no quiere decir "idéntica a la maqueta". Cada desvío deliberado está
en la nota de su pantalla, con el motivo.

| # | Pantalla (HTML) | Ruta / componente | Estado |
|---|---|---|---|
| 01 | Entrada | `app/page.tsx` → `components/PuntoDePartida.tsx` (marco `Entrada` + `TiraKPI` + `EnlaceBoton` de `ui/linea/`) | **Completa** — fase 3F |
| 02 | La red | `app/camino/page.tsx` → `components/camino/Camino.tsx` + `ui/linea/PuntosDeLinea` + `ui/linea/Boton` + `ui/linea/NavInferior` | **Completa** — fase 3J (ver nota 1) |
| 03 | Línea | `app/linea/[ejeId]/page.tsx` → `components/camino/LineaDelEje.tsx` + `ui/linea/PlacaLinea` + `ui/linea/RielEstaciones` | **Completa** — fase 3B (ver nota 2) |
| 04 | Estación | `app/tema/[id]/page.tsx` → `components/camino/DetalleTema.tsx` + `ui/linea/TiraKPI` + `ui/linea/RielEstaciones` | **Completa** — fase 3G (ver nota 3) |
| 05 | Lección, descubrimiento | `app/leccion/[id]/page.tsx` → `components/RunnerLeccion.tsx` + `components/leccion/HeaderLeccion.tsx` + `components/bloques/*` | **Completa** — fase 3H (ver nota 4) |
| 06 | Lección, acierto | `components/RunnerLeccion.tsx` → `components/FeedbackEnCapas.tsx` + `components/ui/PanelFeedback.tsx` | **Completa** — fase 3H (ver nota 4) |
| 07 | Lección, error catalogado | `components/FeedbackEnCapas.tsx` + `components/ui/linea/TarjetaError.tsx` (disparado desde `ItemPAES` / `bloques/BloquePregunta`) | **Completa** — fase 3C (ver nota 5) |
| 08 | Cierre PAES | `app/cierre/[temaId]/page.tsx` → `components/Cierre.tsx` → `EjecutorSetItems` (+ `ui/linea/BarraProgreso`) → `ItemPAES` (+ `ui/linea/Boton`) | **Completa** — fase 3J (ver nota 6) |
| 09 | Resultado | `components/CierreFinal.tsx` (`ui/linea/Puntaje` + `ui/linea/FranjaDeItems` + `ui/linea/TarjetaLoQueFallo` + `ui/linea/Boton`) | **Completa** — fase 3I (ver nota 7) |
| 10 | Errores | `app/errores/page.tsx` → `components/errores/ErroresVivos.tsx` / `ListaErroresVivos.tsx` + `ui/linea/NavInferior` | **Completa** — fase 3D (ver nota 8) |
| 11 | Tú | `app/tu/page.tsx` → `components/tu/AvancePersonal.tsx` + `ui/linea/TiraKPI` + `ui/linea/NavInferior` | **Completa** — fase 3E (ver nota 9) |

## Notas

**1 · Pantalla 02 (La red) — completa desde la fase 3J (2026-09-04).** Sigue la
maqueta de arriba a abajo: eyebrow "Tu red", titular "Vas en la N", subtítulo
"16 estaciones repartidas en 4 líneas", **cuatro filas** —una por línea, con la
barra de color, el nombre, el estado y la fila de puntos— y el CTA "Ir a mi
estación" al pie. Salió el marco anterior (franja fija con `TituloDePantalla` y
`ContadorDePantalla`, y la columna de 16 nodos de `CaminoVertical` dentro de un
`rounded-panel`), y con él `CaminoVertical`, `EncabezadoEje` y
`navegacion/EncabezadoPantalla`, que quedaron sin consumidor y se borraron.
`NodoTema` se queda: `CelebracionTema.tsx:6` monta su `PuntoNodo`.

El cambio de fondo es que la pantalla **dejó de listar las 16 estaciones y pasó a
resumir por línea**. Ese detalle ya lo da /linea/[ejeId] (pantalla 03), que es a
donde entra cada fila —el mismo destino que antes tenía la banda de eje—, así que
la 02 estaba duplicando un nivel.

Cuatro decisiones que conviene no re-discutir a ciegas:

- **Las estaciones se cuentan con `estadoDeNodo`**, la misma función con la que
  esta pantalla ya alimentaba su contador. No es un número nuevo y
  `docs/deuda-avance-por-linea.md:84-85` ya nombraba "el contador de /camino"
  entre lo alcanzado por el balde único del `contextoId` (punto 1 de "Lo que
  queda abierto"). Esquivarlo definiendo "pasada" como
  `avanceDeTema().hechas === total` habría creado una **segunda** definición de
  estación completa, discrepante con `estadoDeNodo` en el resto del producto:
  peor que el bug conocido. /tu resolvió distinto porque ahí la celda era una
  cifra agregada y "Lecciones" era un rótulo verdadero para lo que sí podía
  medir; acá la unidad de la fila **es** la estación, y "un punto por estación,
  relleno = pasada" no tiene equivalente por lección que signifique eso.
- **La racha no se dibuja.** No tiene fuente (`deuda-avance-por-linea.md` §1) y
  acá no hay `TiraKPI` que sostenga un `SIN_DATO` con su rótulo, como sí la hay
  en /tu: el bloque no existe. No se derivó ninguna racha nueva para llenar el
  hueco de la maqueta.
- **"Vas aquí · estación K" va en `--linea-nav`, no en `--linea`.** Es texto
  sobre superficie clara y la 02 (#FFB600) da 1,76:1 ahí; misma razón ya
  documentada en `colores.ts` para `NavInferior`. La barra y los puntos, que son
  forma, sí van en `--linea`. `estiloDeLinea()` se instala **por fila** y no en
  la raíz: la pantalla cruza los cuatro ejes y no hay línea activa arriba.
- **`PuntosDeLinea` es nuevo y no reusa `<Estacion>`.** La estación mide 15px,
  tiene cinco estados y su geometría es la del riel; darle un segundo tamaño
  pediría una tabla de 2×5 con ocho celdas que nadie monta. El punto de la 02 es
  un resumen, no una parada.

Una cosa que la migración dejó anotada:

- **Sin estación activa** —todo lo que tiene contenido cerrado o por repasar— el
  CTA no se dibuja, porque apuntaría a una estación ya recorrida, y la N del
  titular pasa a la última estación con contenido: es hasta dónde llegó el
  recorrido, que es lo que la frase afirma. Los dos casos apuntan a una estación
  real; no se inventa un número.
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

**6 · Pantalla 08 (Cierre PAES) — completa desde la fase 3J (2026-09-04).** La
cadena que la dibuja —`Cierre` → `EjecutorSetItems` → `ItemPAES`— **no importaba
nada de `ui/linea/`** salvo el chip de la alternativa marcada: usaba
`components/ui/BarraProgreso` (segmentada), `components/ui/Boton` (índigo con
canto) y las constantes viejas de `components/ui/alternativa.ts`. Ahora tiene la
fila superior de la maqueta —pill "Cierre PAES" a la izquierda, "Ítem N de 8" a
la derecha—, la barra continua de `ui/linea/BarraProgreso` debajo, las
alternativas con el tratamiento revelado de la 3H y los dos botones en
`ui/linea/Boton`.

**El marco se migró en `EjecutorSetItems`, o sea para sus tres llamadores**
(`Cierre.tsx`, `Diagnostico.tsx` y la fase `itemsPAES` de `RunnerLeccion.tsx`), no
solo para el cierre. La pill va detrás de `rotulo?`, que solo pasa `Cierre`: sin
ella no se dibuja y /diagnostico no se anuncia como un cierre que no es.
`sustantivo?` (default `"Pregunta"`) deja a las otras dos con su copy. Sostener la
barra segmentada vieja al lado de la nueva habría pedido una prop `variante` cuyo
único propósito sería conservar el look anterior — la abstracción "por si acaso"
que `CLAUDE.md` prohíbe. Con eso `components/ui/BarraProgreso.tsx` quedó sin
consumidor y se borró. También salió la prop `encabezado`: cero llamadores.

`components/ui/alternativa.ts` absorbió el tratamiento revelado que la 3H ya había
resuelto y que `BloquePregunta.tsx:143-163` tenía escrito a mano, declarándolo
como deuda ("unificarlos va en su propia tanda"). Ésta fue esa tanda:
`ALTERNATIVA_CORRECTA` sube el borde a 1,5px; `ALTERNATIVA_ELEGIDA_REVELADA` pasa
a `border-strong` sobre `bg-sunken` —el `.opt.no` de la maqueta— cuando antes era
`--linea` + `--linea-tinte`, o sea **idéntica a estar simplemente elegida**; y
`CHIP_*` son nuevas.

Eso arregló un defecto real: el chip emitía `peer-checked:` **siempre**, así que
tras revelar seguía relleno en `--linea-fondo` y tapaba el estado revelado —un
disco del color del eje dentro de una fila ya verde o ya en tinta—, exactamente
lo que advierte `BloquePregunta.tsx:126-129`.

Tres desvíos deliberados de la maqueta, cada uno con su motivo:

- **Se quedan "Habilidad: X" y el cronómetro visible.** El cronómetro no es
  decoración: `tiempoFinalMs` alimenta el evento `item_respuesta`,
  `registrarRespuesta()` en `localStorage` y el "Ritmo promedio" de
  `CierreFinal`. "Habilidad: X" no viaja a ningún dato —su otro consumidor,
  `lib/intercalar.ts`, la usa antes del render—, pero sacarla es la misma
  decisión de producto que el cronómetro, no una de estilo.
- **"Marcar y seguir" no se hace.** `lib/estadoSetItems.ts` solo tiene
  `REGISTRAR` y `SIGUIENTE`: no hay marcar, ni retroceder, ni saltar. Es
  funcionalidad nueva, no marco.
- **Cuatro alternativas y no cinco**, y el CTA sigue diciendo "Revisar
  respuesta" y no "Responder". `ClaveAlternativa` es `"A"|"B"|"C"|"D"` y la regla
  2 de `CLAUDE.md` fija cuatro: ahí la maqueta se aparta del producto, no al
  revés. El botón revela feedback, no envía nada.

Un efecto colateral visible, anotado: al bajar el ancho del borde de
`ALTERNATIVA_BASE` a cada estado —`border` y `border-[1.5px]` son la misma
propiedad y con las dos puestas gana el orden de emisión de Tailwind—,
`ALTERNATIVA_DESCARTADA` pasó de un borde en `currentColor` (que heredaba del
`border` sin color de la base, y era tinta al 60%) a `border-border` explícito,
que es el neutro que ya usan los demás estados.

`contextoId="cierre"` **no se tocó**: es la deuda de `docs/deuda-cierre.md` §2 y
arreglarla exige decidir qué pasa con el progreso ya guardado en los
dispositivos. Tampoco `nombreModulo` (§1 del mismo documento).

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

Nada de esta lista se tocó en la 3J. Está acá para que se decida a propósito y no
por descuido.

1. **El bug del `contextoId`.** `Cierre.tsx:67` escribe `contextoId="cierre"`
   para los once cierres, y `estadoDeNodo` lee ese balde único
   (`lib/estadoNodo.ts:136`), así que rendir un cierre marca completos temas
   ajenos — exige las lecciones hechas, pero deja de filtrar por el cierre
   propio. Es lo que obliga a /tu a contar lecciones en vez de estaciones.
   La pantalla 02 **sí** cuenta estaciones y por lo tanto queda expuesta: fue
   decisión explícita de la 3J (ver nota 1), porque la alternativa creaba una
   segunda definición de "estación completa". Detalle en
   `docs/deuda-avance-por-linea.md` §3.
2. **Ensayo sin ruta.** `ENLACES_NAV` (`ui/linea/NavInferior.tsx:25-29`) no
   declara `ensayo`: el tab se dibuja pero no es interactivo. No hay producto de
   ensayo, y ni /diagnostico ni /cierre lo son.
3. **Tres CTA deshabilitados**, cada uno por falta de destino real y no por
   estilo: "Repasar" en /errores (no hay repaso dirigido), "Enviar reporte al
   apoderado" en /tu (sin destinatario ni decisión de consentimiento sobre un
   menor) y "Repasar ese error" en la 09 (mismo motivo que el primero).
4. **`e2e/capturas.spec.ts` está roja y no se tocó.** Medido en la 3J:
   **24 fallos, 44 en verde, 4 saltados**, contra **22 / 46 / 4** en el commit
   anterior (`9b0edd1`), corriendo la misma suite. La 3J agregó **exactamente
   dos**, los dos en `[movil]` y los dos sobre la columna de nodos que la
   pantalla 02 dejó de tener: `caben 5 nodos sin scroll en /camino a 360px` y
   `a 390px la tarjeta no cuelga de un nodo, va fija al pie`. Los otros 22 no se
   movieron y ninguno dejó de fallar. Desglose y atribución en
   `docs/deuda-e2e-capturas.md`.
5. **`lib/geometriaCamino.ts` quedó sin consumidor de producto.** Desde la 3J lo
   usan solo `RESERVA_TARJETA` en `e2e/capturas.spec.ts:2` y su propio
   `lib/geometriaCamino.test.ts`, que aporta parte de los 195 unit tests. Mismo
   estatus que `lib/descripcionesLecciones.tsx` (punto 7): borrarlo es decisión
   aparte y no se arrastra dentro de un commit de diseño. Está atado a la
   reescritura de la suite e2e, que es donde se decide si esos tests siguen
   existiendo.
6. **"Camino" sigue siendo copy visible en ocho sitios.** El `<title>` de /camino
   se alineó a "Tu red" (2026-09-04). El grep de copy visible —sin comentarios,
   sin identificadores y sin ids de ruta— deja estos ocho:

   | Sitio | Copy | Pantalla |
   |---|---|---|
   | `app/page.tsx:8` | `description`: "…o el **camino** completo si prefieres elegir tú" | 01 |
   | `PuntoDePartida.tsx:168` | "El **camino** todavía no abre" | 01 |
   | `PuntoDePartida.tsx:227` | CTA "Ver el **camino**" | 01 |
   | `PuntoDePartida.tsx:243` | "Te queda una lección del **camino**" | 01 |
   | `ItemsPAESFinal.tsx:89` | botón "Seguir al **camino**" | 05/06 |
   | `ItemsPAESFinal.tsx:185` | "…y el **camino** te espera igual" | 05/06 |
   | `Diagnostico.tsx:51` | CTA "Ver el **camino**" | fuera de las 11 |
   | `CelebracionTema.tsx:174` | CTA "Volver al **camino**" | fuera de las 11 |

   El cambio ya empezó sin declararse: `CierreFinal.tsx:173` dice **"Volver a la
   red"** desde la 3I, con el motivo escrito al lado ("La red es el destino
   honesto"). Son dos botones que van al mismo sitio y lo nombran distinto.

   **No es un descuido: no se tocaron a propósito.** Barrer "camino" →
   "red"/"estación" es una decisión de producto sobre tres pantallas más dos
   rutas de fuera, no un ajuste de cierre — los títulos de `PuntoDePartida` son
   copy que la 3F escribió deliberadamente, y "camino" como metáfora de recorrido
   puede seguir siendo válida aunque el destino de la barra se llame "Red". Va en
   su propia pasada de vocabulario, que además tendría que decidir qué hace el
   `description` de /camino, que sigue diciendo "por unidades" donde la pantalla
   ahora dice estaciones y líneas. **Los ids de ruta (`/camino`) no entran**: eso
   es routing.

7. **`lib/descripcionesLecciones.tsx` es código muerto.** `presentacionDeLeccion`
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
