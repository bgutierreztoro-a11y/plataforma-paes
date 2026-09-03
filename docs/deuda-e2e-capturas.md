# Deuda: `e2e/capturas.spec.ts` está roja, y lo estaba antes de la fase 3G

Estado: **registrado, sin corregir.** No bloquea nada — `npm run capturas` no es
un gate de commit (los gates son `validar`, `tsc`, `lint` y `build`) y `next
build` no lo corre. Ese es justamente el problema: la suite lleva tiempo roja sin
que nada lo diga en voz alta.

Descubierto: 2026-09-03, al migrar la pantalla 04 (fase 3G).

## Lo medido, no lo supuesto

`npm run capturas` sobre `2139697` (fase 3G):

```
22 failed
 4 skipped
46 passed (5.4m)
```

Los seis tests que tocan `/tema/[id]` se volvieron a correr **contra `15b7626`**
—el cierre de la fase 3F, antes de la migración— para saber qué rompió la 3G y
qué ya venía roto:

```
6 failed
  [movil] tema con los nodos enlazados
  [movil] el segundo nivel trata igual a una lección bloqueada
  [movil] caben 5 nodos sin scroll en 360px
  [movil] sin movimiento cuando el sistema lo pide
  [movil] abierta sin avanzar: las cuatro superficies dicen lo mismo
  [movil] terminada bajo el umbral: las cuatro superficies dicen lo mismo
```

**Los seis ya fallaban.** La fase 3G no rompió ninguno.

## Por qué falla cada uno — todas premisas vencidas, ningún bug de producto

El locator exacto sale de los `error-context.md` de la corrida contra `15b7626`.

| Test | Locator que expira en `15b7626` | Por qué |
|---|---|---|
| `tema con los nodos enlazados` (:541) | `getByText("Demostración")` | El chip venía del sistema de `estado`/`revision`, **borrado el 2026-08-12**. Ya no hay contenido "en revisión" que anunciar. |
| `el segundo nivel trata igual a una lección bloqueada` (:567) | `button "Enteros: operar y ordenar"` | Ese título ya no existe, y la premisa completa tampoco: sin sistema de `estado`, ninguna lección con archivo en disco está bloqueada. |
| `caben 5 nodos sin scroll en 360px` (:600) | `button "El patrón que se repite"` | Título vencido. Las lecciones de `funcion-lineal-y-afin` hoy se llaman "Concepto de función lineal y función afín", etc. |
| `sin movimiento cuando el sistema lo pide` (:641) | mismo título vencido | Igual que el anterior. |
| `abierta sin avanzar` (:689) | `link "Empezar la lección"` en la **portada** | Falla antes de llegar a `/tema`. |
| `terminada bajo el umbral` (:709) | `heading "Te conviene repasar una lección"` en la **portada** | Falla antes de llegar a `/tema`. |

Los otros once fallos ni abren `/tema/[id]`: son de la portada y de `/camino`
(`:174`, `:206`, `:231`, `:250`, `:335`, `:422`). No se investigaron acá.

## Qué agrega la fase 3G encima

La 3G **no** agrega fallos, pero sí invalida los selectores de los cuatro tests
de `/tema/[id]`, porque el marco cambió: las paradas del riel son enlaces y no
`button`, no hay `aside` con la tarjeta del nodo activo, no hay `header` con el
contador `N/M`, el nodo de cierre se llama "Cierre PAES" y su subtítulo dice
"8 ítems tipo prueba" en vez de "8 preguntas formato PAES".

O sea: **arreglarlos no es actualizar selectores.** Los tests afirman sobre un
producto que ya no existe —lecciones bloqueadas, chip de demostración, esos
títulos de lección— y la 3G además les cambió el DOM debajo. Reescribirlos es
decidir de nuevo qué tiene que afirmar cada uno, que es trabajo con criterio
propio y no un ajuste mecánico.

**Decisión de la 3G:** no se reescribe por partes. Arreglar 4 de 22 deja
`npm run capturas` igual de inservible como red y esconde que el resto sigue
roto. La suite se trata entera en su propia unidad de trabajo, y ahí se decide si
`npm run capturas` pasa a ser gate de commit.

## Qué no cubre este documento

- Los once fallos de la portada y `/camino`. Se listan y nada más.
- Qué debería afirmar cada test reescrito.
- Si `npm run capturas` tiene que pasar a ser un gate de commit. Hoy no lo es, y
  esa es la razón de que la suite pudiera quedarse roja sin que nadie se enterara.
