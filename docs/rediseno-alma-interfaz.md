# Rediseño "alma de la interfaz" — cierre de las cuatro fases

**Estado:** cerrado, subido a producción el 2026-09-05. 20 commits.

Nota de cierre. No repite lo que está en los docs de deuda ni en los comentarios
de `app/globals.css`: los enlaza.

## Qué fue, y qué no

Capa visual. El problema que atacaba: todo en la plataforma estaba trazado a
regla, y ninguna marca parecía hecha por una persona — en un producto donde el
estudiante debería sentir que alguien le explica algo, no que una máquina lo
corrige.

Lo que **no** tocó, y sirve para descartarlo como causa de cualquier cambio de
contenido:

- **Cero archivos en `content/`.** Ninguna de las cuatro fases editó un JSON de
  lección, diagnóstico o cierre.
- **Cero cambios de schema.**
- **Cero dependencias.** `package.json` no se tocó. Todo es CSS y React.
- **Cero cambios en `components/ilustraciones/`.**

Sí hubo **copy de interfaz** en dos commits (`ad43ebb`, `f77f33b`): el verbo del
botón y el del título de destino pasaron a ser el mismo, y se retiró el punto
medio como separador. Nada de eso es contenido pedagógico; vive en componentes.

## Las cuatro fases

| Fase | Idea | Qué se ve |
|---|---|---|
| **A — el tacto** | Lo que se toca responde como si tuviera volumen | Canto que se hunde al presionar (botones de Línea, disco de las alternativas); el avance de la barra deja de saltar; la bandeja de feedback sube desde el borde |
| **C — el momento** | Lo que llega, llega por partes, y el orden significa algo | Tres pantallas con entrada escalonada: el paso de lección (el título antes que el cuerpo), el resultado del módulo, la celebración de tema |
| **E — las versalitas** | Una sola receta para las etiquetas | `text-etiqueta uppercase` como única forma; murió `--text-eyebrow` |
| **D — la mano** | Una marca que parezca hecha por una persona | El trazo de destacador sobre el término clave, con el color de su eje |

Hay una **fase B** citada en comentarios (nodos seleccionables del camino) que no
formó parte de este trabajo.

### Ojo con la numeración

Conviven **dos** numeraciones de fase y no son lo mismo. Nada lo decía hasta acá:

- **`3A`–`3J`** — el rediseño **"Línea"**, pantalla por pantalla. Su registro es
  `docs/recuento-pantallas-fase-3.md`.
- **A / B / C / D / E** — **este** trabajo, transversal a las pantallas. Vive en
  comentarios de código; este archivo es su único registro en prosa.

## Los tokens nuevos

Trece. Todos en `app/globals.css`.

| Token | Valor | Gobierna | Línea |
|---|---|---|---|
| `--canto-alto` | `2px` | Alto del canto y cuánto baja al presionar | 473 |
| `--canto-tinta` | `rgb(22 24 29 / 0.3)` | El canto sobre fondo oscuro | 474 |
| `--canto-papel` | `rgb(22 24 29 / 0.14)` | El canto sobre papel | 475 |
| `--canto-color` | `var(--canto-papel)` | Cuál de los dos aplica en contexto | 827, 832 |
| `--dur-tacto` | `90ms` | El hundimiento al presionar | 453 |
| `--dur-relleno` | `140ms` | El relleno del disco de alternativa | 454 |
| `--dur-bandeja` | `300ms` | La bandeja de feedback que sube | 455 |
| `--dur-avance` | `400ms` | El avance de la barra de progreso | 456 |
| `--ease-bandeja` | `cubic-bezier(0.16, 1, 0.3, 1)` | Curva que arranca rápido y frena largo | 457 |
| `--trazo-eje` | `var(--text-primary)` | Color del trazo; `RunnerLeccion` lo pisa con el eje | 181 |
| `--trazo-alfa` | `0.22` | Opacidad del trazo. **Global a los cuatro ejes** | 182 |
| `--trazo-tinta` | derivado | El color compuesto, dentro de `.trazo-destacado` | — |
| `--trazo-mascara` | derivado | Las seis capas de la máscara | — |

Clases nuevas: `.canto`, `.canto-relleno`, `.trazo-destacado`.

Los porqués de cada número están en el comentario que acompaña a cada bloque en
`globals.css`. No se repiten acá.

### Dos cosas que conviene saber antes de tocar el trazo

1. **`--trazo-eje` no reusa `--linea-tinte`.** La pantalla de lección no instala
   `estiloDeLinea()`, así que ahí ese token cae a blanco; e instalarlo entero
   recolorearía la selección de alternativas en las 34 lecciones, porque
   `BloquePregunta` la pinta desde `--linea` y `--linea-tinte`.
2. **`--trazo-alfa` tiene un gate.** `lib/contrasteTrazo.test.ts` lee los tokens
   del CSS y verifica que el texto sobre el trazo pase AA en las cuatro líneas y
   sobre los dos fondos. Es el único gate automático de contraste del repo. El
   margen llega hasta alfa `0.73` en el eje más frágil.

## Dónde decide qué se destaca

`lib/trazoDestacado.ts`. La clase **no se escribe a mano** en ningún componente
del producto: la pone el renderer sobre el `<strong>` que pasa cinco criterios.

Producen **160 trazos** sobre `content/` entero, mediana 6 por lección. La regla
es heurística y el módulo lo dice: sin una señal en `content/` que marque el
término, no hay forma de acertar siempre. Quedan 3 marcas de 160 sobre palabras
funcionales, aceptadas a sabiendas.

## Las tres deudas abiertas

Ninguna bloquea el deploy. Cada una tiene su doc:

- **[Asteriscos literales](deuda-asteriscos-literales.md)** — 61 marcas de
  `**negrita**` en campos que no pasan por `TextoEnriquecido` y se ven impresas
  en pantalla. Preexistente; la destapó el inventario de la Fase D.
- **[Entradas apiladas](deuda-entradas-apiladas.md)** — dos animaciones de
  entrada sobre el mismo elemento, que es lo que la Fase C prohíbe.
- **[E2E de capturas](deuda-e2e-capturas.md)** — `e2e/capturas.spec.ts` lleva
  roto desde antes de la fase 3G y **no es gate**: `npm run capturas` no corre en
  `next build`.

## Lo que quedó pendiente de revisión visual

Se subió a producción para poder mirarlo. Todo esto está verificado en su
mecánica, pero el juicio estético no lo tomé yo.

| Qué mirar | Dónde | Qué mover |
|---|---|---|
| El canto de 2px: ¿volumen o borde de caja? | Botones de Línea, disco de alternativas | `--canto-alto`, `globals.css:473` |
| La bandeja de 24px: ¿sube o se funde? | Panel de feedback al responder | `translateY(24px)` en `.entra-panel-anclado`, `globals.css:765`; duración en `--dur-bandeja` |
| Los tres momentos: ¿escalonado o lento? | Paso de lección · resultado de módulo · celebración | `RETRASO_CUERPO` (`PasoLeccion.tsx:61`), `RETRASO` (`CierreFinal.tsx:38`), `RETRASO` (`CelebracionTema.tsx:34`) — distintos a propósito |
| El amarillo de la línea 02: es el más tenue | Cualquier lección de álgebra | `--trazo-alfa`, `globals.css:182` |

Sobre el amarillo: a `0.22` la línea 02 mide **14,98:1**, el mejor contraste de
los cuatro. Se ve tenue porque el amarillo es claro, no porque esté mal
calibrado. Subir el alfa oscurece **los cuatro** ejes a la vez; un alfa por línea
sería un token nuevo y una tabla de cuatro.

## Un tropiezo que vale registrar

El trazo se construyó dos veces. La primera versión de la máscara usaba cuatro
elipses que, compuestas con `intersect`, se comían 4px arriba y 4px abajo de una
caja de 15px: lo que quedaba era una banda central que se leía como **tachado**,
no como destacador. Se vio en `/_design` y se rehizo entera.

Y un fallo que no se veía en pantalla: Lightning CSS **genera un fallback propio**
para `color-mix` que dejaba la tinta en el color de eje sólido, hundiendo tres de
los cuatro ejes bajo AA en navegadores viejos. Apareció leyendo el CSS compilado
antes de subir, no mirándolo. Los dos casos están comentados en el CSS con sus
números.

La lección de los dos: para una pieza visual, el gate verde no reemplaza ni
abrir el navegador ni leer lo que el build realmente emitió.
