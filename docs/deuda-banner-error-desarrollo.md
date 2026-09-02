# Deuda técnica: el banner de error catalogado sale con dos párrafos, no tres

Estado: **registrado, sin corregir.** No bloquea la Fase 3C — el banner funciona con
los dos párrafos que sí tienen dato. Se documenta acá para decidir el tercero aparte,
con su propio alcance.

Descubierto: 2026-09-02, al planificar la Fase 3C (pantalla 07 del HTML de referencia).

## Qué falta

El bloque `<!-- 07 -->` de `docs/referencia/B-linea-interfaz-completa.html:291-308`
define el banner (`.bnr`) con **tres** párrafos:

| Parte del HTML | Clase | Qué dice en el mock | Dato en el repo |
|---|---|---|---|
| Versalitas verdes | `.bnr .k` | `Error 07 · te ha pasado 3 veces` | el id sí (`errorCatalogado`); el conteo, ver abajo |
| Frase 15px | `.bnr .v` | `Sumaste las bases y multiplicaste por la altura, pero olvidaste dividir por 2.` | `descripcionError` (Capa 2) |
| Párrafo gris | `.bnr p` | `(8 + 12) × 5 = 100 → ese es el rectángulo completo. El trapecio es la mitad: 100 ÷ 2 = 50.` | **no existe** |

El tercer párrafo es el **desarrollo numérico que corrige el error**. No hay ningún
campo de contenido que lo contenga.

## Por qué no se puede sacar de lo que ya hay

Verificado archivo por archivo, no inferido de la documentación:

- **El catálogo no tiene dónde ponerlo.** `content/schema/leccion.schema.json:35-47`
  define `catalogoErrores.items` como `{ id, descripcion }` con
  `"additionalProperties": false`. Un campo nuevo lo rechaza `npm run validar`.
- **La alternativa tampoco.** `lib/tipos.ts:24-30` — `Alternativa` es
  `{ clave, texto, esCorrecta, feedback?, errorCatalogado? }`. Es el espejo manual del
  schema (regla del proyecto: sin codegen), así que agregar el campo son dos archivos
  a la vez.
- **`item.solucion` sí tiene ese desarrollo**, y es exactamente la forma correcta
  (`content/lecciones/figuras-borde-y-superficie.json`, `l2-item-1`:
  `"Área de un triángulo = (base × altura) ÷ 2. Con base 11 m y altura 6 m: (11 × 6) ÷ 2 = 66 ÷ 2 = 33 m²…"`).
  Pero es **CLAVE_INTERNA** (`lib/sanitizar.ts:28-36`) y no cruza al cliente **a
  propósito**: publicarla entregaría la solución de todos los ítems del módulo en el
  payload RSC, incluidos los que el estudiante no respondió. Además es la solución
  **del ítem**, no la corrección **del error** — un error del catálogo lo comparten
  varios ítems.
- **`alternativa.feedback` tiene los números** (`"66 m² es base × altura sin dividir
  por 2: es el área de un rectángulo de 11 m por 6 m…"`), pero **ya es la Capa 1** y
  está visible en pantalla en ese mismo momento (`lib/capasFeedback.ts:23-27` →
  `components/FeedbackEnCapas.tsx`, panel anclado). Usarlo también como tercer párrafo
  del banner pondría el mismo texto dos veces en el mismo viewport.

## Qué se hizo en su lugar

`detalle` pasó a opcional en `components/ui/linea/TarjetaError.tsx` y el banner se
renderiza con dos párrafos. No se generó el texto: la regla de contenido 3 de
`CLAUDE.md` exige feedback escrito a mano, y el desarrollo numérico de una corrección
es exactamente eso.

## Qué costaría cerrarlo

En este orden, y **no es trabajo de código**:

1. Agregar `desarrollo` (opcional) a `catalogoErrores.items` en el schema y a
   `ErrorCatalogado` en `lib/tipos.ts:218-221`.
2. Propagar la descripción resuelta en `lib/sanitizar.ts:122-145`, junto a
   `descripcionError`, con su test en `lib/sanitizar.test.ts`.
3. **Escribir a mano el desarrollo de cada error de los 22 archivos de
   `content/lecciones/` que hoy tienen `catalogoErrores`** (más los 6 cierres que
   tienen catálogo propio), y pasarlos por las dos auditorías del flujo de contenido.
   Ese es el grueso, y es redacción, no ingeniería.

Mientras tanto el banner con dos párrafos no miente ni deja un hueco visible: la Capa 2
es una frase completa por sí sola.

---

## Hallazgos colaterales, verificados y no corregidos

Registrados acá porque salieron de la misma revisión y quedaron fuera del alcance de la
Fase 3C.

### 1. Hay tres juegos de estados de alternativa, no uno

1. `components/ui/alternativa.ts` — constantes compartidas. **Es lo que se ve en
   producción**: lo usan `components/ItemPAES.tsx:6-12` y
   `components/ui/SelectorOpciones.tsx:4-7`.
2. `components/ui/linea/Alternativa.tsx:38-49` — componente del sistema Línea, escrito
   en la Fase 3B. **Solo se usa en `/_design`** (`app/%5Fdesign/page.tsx:3`).
3. `components/bloques/BloquePregunta.tsx:104-113` — una tercera copia escrita a mano.
   Su propio comentario ya declara la deuda: *"estas clases son casi las de
   `components/ui/alternativa.ts` … unificarlos es un cambio de estructura y va en su
   propia tanda."*

### 2. El `.opt.no` del HTML está implementado en el componente que nadie usa

`.opt.no` del HTML (`B-linea-interfaz-completa.html:43-44`) es borde tinta, fondo gris
(`#EDEDEA`) y disco de la letra en tinta con texto blanco.

- `components/ui/linea/Alternativa.tsx:41,48` (`incorrecta`) lo reproduce exacto:
  `border-strong bg-sunken` + chip `bg-strong text-inverse`. **No está en el flujo real.**
- Lo que sí se ve al fallar es `ALTERNATIVA_ELEGIDA_REVELADA`
  (`components/ui/alternativa.ts:69-70`): `border-[var(--linea)] bg-[var(--linea-tinte)]`,
  o sea la fila queda marcada con el color del eje, no en gris, y el disco no cambia de
  estado al revelar.

La divergencia **está documentada como decisión** en el comentario de ese mismo bloque
("queda marcada como elegida y nada más — ni roja ni ámbar"), así que no es un bug:
es el HTML el que va por delante del código en un punto donde el código tiene una razón
escrita. Unificarlos exige decidir cuál gana, y esa decisión no es de esta fase.

### 3. `ALTERNATIVA_CORRECTA` sigue en `success`, y ahí el HTML está de acuerdo

`components/ui/alternativa.ts:58` es `border-success bg-success-suave` (verde), no
`--linea`. Se dejó tal cual.

Dato que conviene tener antes de cambiarlo: el HTML **también** pinta la correcta de
verde — `.opt.ok` usa `--acc`, y `--acc: #00843D` (`B-linea-interfaz-completa.html:12`),
que es el mismo verde de la línea 03. Quien se aparta de las dos cosas es
`components/ui/linea/Alternativa.tsx:40`, que usa `--linea` y documenta *"no hay verde
de correcto"*. Son tres posiciones distintas sobre el mismo píxel; conviene resolverlas
juntas y no de a una.

### 4. El banner alcanza también a `/cierre/[temaId]`

`components/FeedbackEnCapas.tsx` es compartido: lo usan `ItemPAES` (lecciones y cierres)
y `BloquePregunta` (bloques de lección). Cambiar la presentación de la Capa 2 ahí
instala el banner en las dos superficies.

Medido el 2026-09-02: **6 de los 11 archivos de `content/cierres/`** tienen
`catalogoErrores` propio y por lo tanto verán el banner. Los otros 5 y
`content/diagnostico.json` no tienen catálogo, así que `capaDos()` devuelve `undefined`
y el banner no se renderiza — el comportamiento de esas pantallas no cambia.

Se dejó compartido a propósito: un error catalogado es la misma pieza de información en
las dos pantallas, y el estudiante no distingue en cuál está respondiendo (mismo
argumento que ya justifica `components/ui/alternativa.ts`).

### 5. `contextoId` no sirve como espacio de nombres, y por eso el conteo se lleva por descripción

`components/Cierre.tsx:55` pasa `contextoId="cierre"` —una constante— para los once
archivos de `content/cierres/`. Es la deuda que registra el commit `62c1f9d`, y tiene
un efecto concreto sobre cualquier cosa que quiera agrupar por archivo de contenido:
no hay forma de distinguir un cierre de otro desde el punto de llamada.

Por eso el contador de `lib/progresoSesion.ts` se lleva **por la descripción resuelta
del error** y no por `${archivo}::${id}`. Es correcto por dos razones que conviene no
perder: los ids del catálogo son locales al archivo (hallazgo ya registrado en
`docs/deuda-catalogo-errores-crossfile.md`), y `docs/reglas-modulo.md §5` obliga a
copiar la descripción literalmente entre las lecciones de un módulo — así que dos
descripciones iguales son el mismo error en cualquier archivo. El efecto secundario es
deseable: el conteo cruza lecciones dentro de la sesión, que es lo que "te ha pasado
N veces" significa para el estudiante.

Si algún día se arregla `contextoId`, esto **no** hay que cambiarlo: contar por archivo
sería un retroceso, no la corrección.

### 6. El rótulo "Error 07" es un id local, no un número de la plataforma

El banner muestra la referencia del catálogo tal como la pide el HTML. Como los ids son
locales al archivo, el mismo `Error 07` puede nombrar mecanismos distintos en dos
módulos. Se mostró igual porque el rótulo nunca viaja solo: va pegado a su propia
descripción en la misma tarjeta, así que funciona como referencia para reencontrarlo y
no como una clasificación que el estudiante tenga que interpretar por su cuenta.

Queda anotado por si algún día se decide numerar los errores globalmente —hoy no
existe ese registro— o cambiar el rótulo por algo que no parezca un número de catálogo
compartido.
