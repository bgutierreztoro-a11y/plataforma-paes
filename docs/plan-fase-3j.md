# Fase 3J — cerrar las dos pantallas parciales del rediseño "Línea" (02 y 08)

## Contexto

`docs/recuento-pantallas-fase-3.md` deja nueve de las once pantallas del HTML de
referencia en **Completa** y dos en **Parcial**: la 02 (`/camino`, "La red") y la
08 (`/cierre/[temaId]`, "Cierre PAES"). Las dos funcionan y tienen el color de eje
de la fase 2, pero ninguna tomó el marco de la maqueta. Esta fase migra ese marco
—y solo el marco— para que el recuento pueda decir once de once medido contra el
código.

Rama `master`, 10 commits ahead de `origin/master` (HEAD `ae47c50`), sin push.
Fetch hecho contra `origin`: no hay nada nuevo remoto. **No se hace push.**

Baseline verde medido en HEAD, antes de tocar nada: `tsc --noEmit` limpio,
`lint` limpio, `test:unit` 195/195, `validar` OK. (`auditar` está rojo por
contenido preexistente y no se toca.)

---

## 0 · Verificación previa de la pantalla 09 — **hecha, todo en orden**

Corrida en `npm run dev` (`localhost:3000`), fallando ítems a propósito en
`/cierre/figuras-geometricas` (3 de 8 correctas):

- Tarjeta **"Lo que falló"**: presente, cuatro grupos, cada uno con pill del
  error en tinta (`error-1`, `error-3`, `error-10`, `error-8`), los números de
  ítem ("Preguntas 1, 2") y la descripción resuelta del catálogo.
- **"Repasar ese error"**: presente y con `disabled` real —superficie hundida,
  texto tenue—, no solo apagado a la vista.
- **"Ir a la siguiente estación"**: enlaza a `/tema/cuerpos-geometricos`, la
  estación que sigue a `figuras-geometricas` en orden de temario.
- Franja de ocho celdas con el verde de la línea 03 en los aciertos.

Nada que parar. Dos cosas anotadas al pasar, **ninguna de esta fase y ninguna
deuda nueva**:

- El marco superior de la 09 sigue sin migrar ("Cierre del módulo / Terminaste el
  módulo"), tal como lo declara la nota 7 del recuento.
- La pantalla previa anuncia "8 preguntas de **Función lineal y afín**" para
  `figuras-geometricas`: es `Cierre.tsx:53` con `nombreModulo` literal, **ya
  registrado** en `docs/deuda-cierre.md` §1.

---

## Pantalla 02 — `/camino`

### Qué existe para reusar, medido

- **`estiloDeLinea()` por fila, no en la raíz.** Es el mecanismo de
  `AvancePersonal.tsx:138` (`style={id ? estiloDeLinea(id) : undefined}`); la
  ausencia en la raíz ya está documentada en `app/camino/page.tsx:29` — /camino
  cruza los cuatro ejes y no hay línea activa que instalar arriba.
- **`lineaDeEje(ejeId)`** (`ui/linea/colores.ts:66`); un eje fuera del mapa
  devuelve `undefined`, no se emite `style` y el subárbol cae a tinta.
- **`ejesDelCamino()`** (`lib/camino.ts:143`), ya baja del servidor, y
  **`estadoDeNodo` / `avanceDeTema` / `resumirRespuestas`** (`lib/estadoNodo.ts`).
- **`EnlaceBoton`** (`ui/linea/Boton.tsx:111`), **`NavInferior` + `ENLACES_NAV`**,
  **`useMontado()`**.

**Lo que NO existe y hay que escribir: la fila.** Medido, no supuesto:
`FilaDeLinea` de /tu (`AvancePersonal.tsx:126`) es **local, no exportada**, y es
otra fila —nombre + `N/M` + `BarraProgreso`—, sin barra vertical de color y sin
puntos. `LineaDelEje.tsx` (3B) **no define ningún subcomponente**: es
`RielEstaciones` + `Estacion` y nada más. Lo reusable es el mecanismo, no el
marcado.

### Decisión A — qué cuentan "N de M estaciones" y los puntos

La maqueta cuenta **estaciones**, y contar estaciones pasa por `estadoDeNodo`,
que lee el balde único `itemsRespondidos.get("cierre")` (`lib/estadoNodo.ts:118`)
contaminado por `Cierre.tsx:56` (`contextoId="cierre"` para los once cierres).
Efecto exacto, ya medido en `docs/deuda-cierre.md` §2: rendido **un** cierre, el
chequeo deja de filtrar, y cualquier tema con **todas sus lecciones cerradas** se
pinta `completado` aunque nadie haya abierto su cierre. No inventa avance de la
nada: exige las lecciones hechas.

**Recomendación: contar estaciones con `estadoDeNodo`, igual que hoy.**

- No es un número nuevo: `Camino.tsx:93` ya cuenta temas completados con
  `estadoDeNodo` para el `ContadorDePantalla`, y `docs/deuda-avance-por-linea.md:84-85`
  **ya nombra "el contador de /camino"** entre lo alcanzado por el bug. La
  migración conserva la cuenta que la pantalla ya hace; no la empeora.
- "Un punto por estación, relleno = pasada" y "Vas aquí · estación N" son
  afirmaciones sobre el tema. No hay equivalente por lección que signifique eso.
- /tu resolvió distinto porque ahí la celda era **una cifra agregada** y
  "Lecciones" era un rótulo verdadero para lo que sí podía medir. Acá la unidad
  de la fila **es** la estación.
- La alternativa de esquivar el balde definiendo "pasada" como
  `avanceDeTema().hechas === total` crearía una **segunda** definición de
  "estación completa" que discreparía de `estadoDeNodo` en el resto del producto.
  Peor que el bug conocido.

Si preferís lo contrario (relabelar a "lecciones", como /tu), rechazá el plan
diciéndolo: cambia el rótulo y la fuente del conteo, nada más.

### Qué se construye

**`components/camino/Camino.tsx`** — se reescribe el marco entero:

1. **Encabezado en dos columnas → una sola.** Izquierda: `text-etiqueta uppercase
   text-secondary` "Tu red" + `h1` en `text-display-m` "Vas en la N", con N la
   posición 1-based de la estación actual entre los 16 en orden de temario.
   **La racha se omite.** No hay fuente (`docs/deuda-avance-por-linea.md` §1) y
   acá no hay `TiraKPI` que sostenga un `SIN_DATO` con rótulo, como en /tu: el
   bloque no se dibuja. No se deriva ninguna racha nueva.
2. **Subtítulo** en `text-cuerpo-s text-secondary`: "N estaciones repartidas en M
   líneas", con `N = ejes.flatMap(e => e.temas).length` y `M = ejes.length`. Sin
   cablear el 16 ni el 4.
3. **Una fila por eje** (`FilaDeLinea`, nueva, local a `Camino.tsx`), en el orden
   de `ejesDelCamino()`:
   - `estiloDeLinea` en la fila, con la guarda de `lineaDeEje`.
   - Barra vertical `w-1.5 rounded-[3px] bg-[var(--linea)]`, 34px normal y 42px
     en el eje actual — la maqueta usa el alto como señal de eje activo.
   - Nombre en `text-titulo-s text-primary`.
   - Debajo: `"H de T estaciones"` en `text-cuerpo-xs text-secondary`, o, en el
     eje actual, `"Vas aquí · estación K"` en `text-[var(--linea-nav)]` con peso
     600. **`--linea-nav` y no `--linea`**: es texto sobre superficie clara y la
     02 (#FFB600) da 1,76:1 ahí; es la misma razón ya documentada en `colores.ts`
     para `NavInferior`.
   - Fila de puntos, uno por estación del eje, relleno = `estadoDeNodo ===
     "completado"`.
   - La fila entera es un `Link` a `/linea/[ejeId]` —el mismo destino que hoy
     tiene la banda de eje (`Camino.tsx:142`)— con el `focus-visible` del kit.
   - Un eje sin contenido (`eje.colapsado`) dice "Pronto" en `text-muted` en vez
     de "0 de N estaciones": mismo criterio que `AvancePersonal.tsx:145`.
4. **CTA al pie** (`mt-auto`): `EnlaceBoton variante="neutro"` "Ir a mi estación"
   → `/tema/{temaActivo.id}`, con `temaActivo` resuelto igual que hoy
   (`Camino.tsx:157-159`: `enCurso` manda sobre `disponible`). Sin estación
   activa no se dibuja.
5. **`camino_visto` se conserva** con sus mismos props. `nodo_tema_abierto`
   desaparece con los nodos; `lib/eventos.ts` no se toca (el evento sigue
   declarado y lo emiten otras pantallas).

**`components/ui/linea/PuntosDeLinea.tsx`** (nuevo, ~15 líneas):
`{ pasadas: boolean[]; etiqueta: string }` → la fila `.dots` de la maqueta,
círculos de 9px, borde de 1,5px en `currentColor`, relleno `bg-[var(--linea)]`
cuando la estación está pasada.

No se reusa `Estacion`: son 15px, cinco estados y geometría de riel
(`Estacion.tsx:31-37`); meterle un segundo tamaño obligaría a una tabla 2×5 con
ocho celdas muertas. El punto de la 02 no es una parada del riel — es un resumen
sin estado propio ni etiqueta.

**`app/camino/page.tsx`**: solo se ajusta el comentario del reparto de ancho (la
franja a sangre deja de existir). Sigue sin `estiloDeLinea()` en la raíz y con
`NavInferior activo="red"`.

### Qué queda sin consumidor (grep crudo hecho)

| Archivo | Consumidor de código hoy | Después |
|---|---|---|
| `components/camino/CaminoVertical.tsx` | solo `Camino.tsx` | **se borra** |
| `components/camino/EncabezadoEje.tsx` | solo `CaminoVertical.tsx` | **se borra** |
| `components/navegacion/EncabezadoPantalla.tsx` | solo `Camino.tsx` | **se borra** |
| `components/camino/NodoTema.tsx` | `CaminoVertical`, `Camino`, **`CelebracionTema.tsx:6`** | **se queda** |
| `lib/geometriaCamino.ts` | `Camino`, `CaminoVertical`, `EncabezadoEje` + `e2e/capturas.spec.ts:2` + su propio test | **se queda**, y se anota |

`lib/geometriaCamino.ts` quedaría vivo solo por `RESERVA_TARJETA` en el e2e y por
`lib/geometriaCamino.test.ts` (que aporta parte de los 195 unit tests). Borrarlo
es decisión aparte, mismo estatus que `lib/descripcionesLecciones.tsx` (punto 6
de "Lo que queda abierto"): se anota en el recuento, no se arrastra dentro de un
commit de diseño.

`COPY_EN_PREPARACION` y `razonDeBloqueo()` salen de `Camino.tsx`: la fila por eje
no tiene dónde decir por qué un tema no abre. Ese copy sigue vivo un nivel abajo.

---

## Pantalla 08 — `/cierre/[temaId]`

### Lo que la cadena usa hoy

`Cierre` → `EjecutorSetItems` → `ItemPAES`. No importa nada de `ui/linea/` salvo
el chip de la alternativa marcada: usa `ui/BarraProgreso` (segmentada),
`ui/Boton` (índigo con canto) y las constantes de `ui/alternativa.ts`.

`EjecutorSetItems` tiene **tres** llamadores: `Cierre.tsx:57`,
`Diagnostico.tsx:96` y `RunnerLeccion.tsx:176` (fase `itemsPAES`). `ItemPAES` solo
lo monta `EjecutorSetItems`. Cualquier cambio de marco ahí toca las tres rutas.

### "Habilidad: X" y el cronómetro — reportado antes de tocar nada

**Cronómetro.** Son **dos relojes distintos**:

- `transcurridoMs` (`ItemPAES.tsx:64`, intervalo en `:91-97`) alimenta **solo** el
  `<p>` de "Tiempo m:ss" (`:206`), que además va `aria-hidden`.
- `tiempoFinalMs` (`:65`, escrito una vez en `:138` como
  `performance.now() - inicio.current`) **es el dato**, y viaja a tres sitios:
  1. el evento `item_respuesta` con `tiempo_ms` (`:139-147`) — evento declarado
     en `CLAUDE.md` y en `lib/eventos.ts`;
  2. `registrarRespuesta({ tiempoMs })` → `localStorage` (`:152-160`), validado al
     releer en `lib/progresoLocal.ts:107`;
  3. `onSiguiente(...)` → reducer `REGISTRAR` → `RespuestaRegistrada.tiempoMs` →
     el **"Ritmo promedio" de `CierreFinal.tsx:46-49`**, que es lo que se vio en
     la verificación de la 09 ("Ritmo promedio: 0:03 por pregunta").

  Es decir: **el cronómetro alimenta un evento y un dato de resultado, así que se
  queda** — la regla de esta fase se aplica tal cual. Lo único separable sería el
  `<p>` visible, porque `revisar()` mide contra `inicio.current` y no contra el
  estado del reloj pintado; pero sacarlo es la decisión de producto que la nota 6
  del recuento ya identificó (entrenar el ritmo de ~2 min), no una de estilo.
  **No se saca. Se anota el desvío contra la maqueta.**

**"Habilidad: X".** Sale de `item.habilidad` del JSON de contenido
(`lib/tipos.ts:20,32` → `ItemCliente` en `lib/sanitizar.ts:73`), campo que
`CLAUDE.md` exige en cada ítem. Se renderiza en un solo sitio (`ItemPAES.tsx:196-198`)
y **no viaja a ningún evento ni a ningún dato de resultado**. Su otro consumidor
es `lib/intercalar.ts`, que la usa como clave de reparto para que los ítems del
cierre no queden agrupados por habilidad (test en `lib/intercalar.test.ts:59-75`)
— eso ocurre antes del render y no depende del `<p>`.

Borrar ese `<p>` no rompería ningún dato, pero es la misma decisión de producto
que el cronómetro. **Se queda, y se anota el desvío.**

### Decisión B — alcance del marco nuevo

El par pill + "Ítem N de M" + barra son propiedades del **set**, así que viven en
`EjecutorSetItems`, que comparten tres rutas.

**Recomendación: migrar el marco en `EjecutorSetItems` para las tres**, con la
pill detrás de una prop opcional:

- `rotulo?: string` — texto de la pill. Solo `Cierre.tsx` la pasa ("Cierre PAES").
  Sin ella la pill no se dibuja, así que /diagnostico no se anuncia como un cierre.
- `sustantivo?: string` (default `"Pregunta"`) — `Cierre` pasa `"Ítem"`, y las
  otras dos conservan su copy actual.

Por qué las tres y no solo el cierre: la fase `itemsPAES` de una lección **no es
ninguna de las once pantallas** (la 05/06 son `RunnerLeccion` + `HeaderLeccion` +
`bloques/*`), así que no se está deshaciendo nada declarado Completo; y sostener
la barra segmentada vieja junto a la nueva pediría una prop `variante` cuyo único
propósito sería conservar el look viejo — la abstracción "por si acaso" que
`CLAUDE.md` prohíbe. Efecto colateral querido:
**`components/ui/BarraProgreso.tsx` queda sin ningún consumidor y se borra**
(grep: `EjecutorSetItems.tsx:5` es el único).

Si preferís acotarlo solo a `/cierre`, rechazá el plan diciéndolo.

### Qué se construye

**`components/EjecutorSetItems.tsx`**

- Fila superior: `{rotulo && <pill>}` a la izquierda —`text-etiqueta uppercase`,
  `rounded-full`, fondo `--linea-fondo`, texto `--linea-contraste`, los mismos
  tokens medidos que usa `Boton variante="linea"`— y `"{sustantivo} N de M"` a la
  derecha en `text-etiqueta uppercase text-secondary`.
- Debajo, `ui/linea/BarraProgreso` (`valor={indiceActual} total={items.length}`,
  con `etiqueta` accesible), reemplazando a `ui/BarraProgreso`.
- Se saca la prop `encabezado`: **grep confirma cero llamadores** (`encabezado=`
  no aparece en ningún `.tsx`). No se reemplaza por nada.
- El resto del componente —reducer, `renderFinal`, `anclarAcciones`,
  `CascaronAnclado`— no se toca.

**`components/ui/alternativa.ts`** — se lleva al tratamiento cerrado en la 3H, que
hoy está escrito a mano en `BloquePregunta.tsx:143-163` y que ese mismo archivo
declara como deuda ("estas clases son casi las de `components/ui/alternativa.ts`
… unificarlos va en su propia tanda"). Esta es esa tanda, del lado de `ItemPAES`:

- `ALTERNATIVA_CORRECTA` → `border-[1.5px] border-success bg-success-suave`
  (ya está en verde de `success`; solo sube el borde a 1,5px).
- `ALTERNATIVA_ELEGIDA_REVELADA` → `border-[1.5px] border-strong bg-sunken`, el
  `.opt.no` de la maqueta. Hoy es `border-[var(--linea)] bg-[var(--linea-tinte)]`,
  o sea idéntica a estar simplemente elegida. **Sin `--linea` ahí**, como pide la
  decisión de la 3H.
- Constantes nuevas para el disco de la letra (`CHIP_*`), en los tres estados:
  neutro, `success` (con `text-inverse`, 4,85:1 medido en la 3H) y `strong`.

  **Riesgo verificado:** `ALTERNATIVA_ELEGIDA_REVELADA` y `ALTERNATIVA_DESCARTADA`
  tienen **un solo consumidor, `ItemPAES`**. `ui/SelectorOpciones.tsx` importa
  únicamente `BASE`, `CORRECTA`, `REPOSO` e `INTERACTIVA`, así que el cambio de
  la elegida-revelada no lo alcanza.

**`components/ItemPAES.tsx`**

- Las alternativas pasan a los tres estados de `BloquePregunta`
  (`abierta | correcta | fallada`), consumiendo las constantes de arriba.
  Esto además corrige un defecto real: hoy el chip emite `peer-checked:` **siempre**
  (`ItemPAES.tsx:233`), así que tras revelar se queda en `--linea-fondo` y tapa el
  estado revelado — exactamente lo que el comentario de `BloquePregunta.tsx:126-129`
  advierte.
- Los dos botones pasan a `ui/linea/Boton`: "Revisar respuesta" (`:245`) y el de
  avanzar del pie (`:122`), los dos `variante="linea"`. Fuera de un eje
  (/diagnostico) `--linea-fondo` cae a tinta por el default de `:root`.
- **No se toca** el flujo de respuesta, el orden de ítems, `revisar()`,
  `FeedbackEnCapas`, la mezcla de alternativas ni el registro de eventos.
- Se quedan la fila "Habilidad: X" y el cronómetro visible (ver arriba).

**`components/Cierre.tsx`**: solo suma `rotulo="Cierre PAES"` y `sustantivo="Ítem"`
al `EjecutorSetItems`. `contextoId="cierre"` **no se toca** — es la deuda de
`docs/deuda-cierre.md` §2 y arreglarla exige decidir qué pasa con el progreso ya
guardado. Tampoco se toca `nombreModulo` (§1 del mismo documento).

### Lo que la maqueta pide y no se hace, con motivo

- **"Marcar y seguir"**: `lib/estadoSetItems.ts` solo tiene `REGISTRAR` y
  `SIGUIENTE` — no hay marcar, ni retroceder, ni saltar. Es funcionalidad nueva,
  no marco. (Ya declarado en la nota 6 del recuento.)
- **Cinco alternativas (A–E)**: `ClaveAlternativa` es `"A"|"B"|"C"|"D"`
  (`lib/tipos.ts:22`) y `CLAUDE.md` regla 2 fija cuatro. La maqueta se aparta del
  producto, no al revés.
- **CTA "Responder"**: se conserva "Revisar respuesta". El botón revela feedback,
  no envía nada, y cambiar copy del flujo de respuesta está fuera del encargo.

---

## Límites de la fase

- `estiloDeLinea()` siempre con la guarda `linea ? … : undefined`. En /camino eso
  es **por fila**; en /cierre ya está en la raíz de `Cierre.tsx:48` y no se mueve.
- **e2e fuera de alcance.** Los tests de `e2e/capturas.spec.ts` que abren
  `/camino` asumen nodos, bandas de eje pegadas y tarjeta flotante, y van a
  romper: "camino", "camino con la lección a medias", "el camino muestra las 16
  unidades…", "un nodo bloqueado dice por qué…", "caben 5 nodos sin scroll en
  /camino a 360px", "la tarjeta activa nunca corta un nodo…", "a 390px la tarjeta
  no cuelga de un nodo…", más los dos de celebración que pasan por `/camino`. Se
  anotan en `docs/deuda-e2e-capturas.md` con el **conteo medido** de la corrida,
  no estimado.
- `npm run auditar` no se toca; se confirma con `git diff --name-only` que no se
  sumó nada bajo `content/`.
- Nada de persistencia nueva, ningún evento nuevo en `lib/eventos.ts`.
- Excluidos de siempre: `docs/mapa-modulos-m1.md`, `lib/modulos.ts`,
  `content/cierres/cierre-cuerpos-geometricos.json`.

---

## Verificación y cierre

1. En crudo, en este orden: `npm run validar`, `npx tsc --noEmit`,
   `npm run lint`, `npm run build`, `npm run test:unit`. Baseline a batir:
   195/195 y los cuatro primeros limpios.
2. `git diff --name-only` — cero archivos de `content/`.
3. A ojo en `npm run dev`:
   - `/camino`: cuatro filas, eje actual con la barra alta y "Vas aquí · estación
     K", cada fila entra a `/linea/[ejeId]`, CTA a la estación real, `NavInferior`.
   - Un cierre completo en `/cierre/figuras-geometricas`: pill + "Ítem N de 8" +
     barra de línea, alternativa correcta en verde y la elegida errada en tinta,
     botones de línea, y la 09 igual que en el paso 0.
   - `/diagnostico` y la fase de ítems de una lección, para confirmar que el marco
     compartido no rompió nada.
4. `git status --short` y `git log --oneline` de la sesión.
5. `docs/recuento-pantallas-fase-3.md`: 02 y 08 a **Completa**, notas 1 y 6
   reescritas con lo decidido y lo que quedó fuera, el estado final de las once, y
   `lib/geometriaCamino.ts` agregado a "Lo que queda deliberadamente abierto".

**Commits separados, sin push:**
(a) pantalla 02 · (b) pantalla 08 · (c) docs (recuento + deuda de e2e).
