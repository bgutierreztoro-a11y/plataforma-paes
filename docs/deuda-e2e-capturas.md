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

---

## Corrida de la fase 3J (2026-09-04) — el total pasa a 24 fallos, dos de ellos nuevos

**Hoy la suite tiene 24 fallos, 44 en verde y 4 saltados.** De esos 24, **22 ya
estaban** y **2 los agregó la 3J**.

`npm run capturas` sobre `249bbed` (cierre de la 3J), y la **misma suite corrida
contra `9b0edd1`** —el commit anterior, con el plan ya escrito y ningún código
tocado— para separar lo que rompió la 3J de lo que ya venía roto:

```
9b0edd1 (baseline)   22 failed · 4 skipped · 46 passed (5.6m)
249bbed (fase 3J)    24 failed · 4 skipped · 44 passed (6.5m)
```

**Dos fallos nuevos, los dos en `[movil]` y los dos por lo mismo:**

| Test | En `9b0edd1` | En `249bbed` |
|---|---|---|
| `caben 5 nodos sin scroll en /camino a 360px` (:374) | pasa (895ms) | falla (timeout 30s) |
| `a 390px la tarjeta no cuelga de un nodo, va fija al pie` (:524) | pasa (606ms) | falla (timeout 30s) |

**Ninguno de los dos es una regresión.** Los dos afirman sobre la **columna de
nodos** de /camino: cuántos discos entran sin scroll a 360px, y dónde se posa la
tarjeta flotante del nodo activo a 390px. La 3J reemplazó esa columna por cuatro
filas resumen —una por línea—, así que `CaminoVertical`, el disco de `NodoTema` en
/camino y la tarjeta flotante **ya no existen en esa ruta**.

O sea: son tests de una pantalla que dejó de existir, no un defecto que la 3J
haya introducido. La pantalla 02 funciona —verificada a mano en `npm run dev`—;
lo que caducó es lo que los tests daban por supuesto. Tampoco es un selector
desactualizado que se arregle cambiando un locator: **no hay nodos que contar ni
tarjeta que posicionar.** Reescribirlos es decidir de nuevo qué tiene que afirmar
cada uno, igual que con los otros 22.

**Los otros 22 fallos no se movieron, y ninguno de los que sí pasaban dejó de
pasar por otra causa:** el conjunto de fallos de `249bbed` es exactamente el de
`9b0edd1` más esos dos. Cero tests dejaron de fallar, cero cambiaron de motivo.

Vale la pena decirlo porque el plan de la 3J anticipaba que romperían **nueve**
tests de /camino —"camino", "camino con la lección a medias", "el camino muestra
las 16 unidades…", "un nodo bloqueado dice por qué…", los dos de la tarjeta
activa y los dos de celebración—. Medido: siete de esos nueve **ya fallaban en el
baseline** por las premisas vencidas que documenta la sección anterior, y los dos
de celebración pasan en las dos corridas. La 3J solo alcanzó a los dos que
todavía estaban en verde.

## Qué sigue sin cubrir este documento (sin cambios)

Lo de la sección anterior, más: qué debería afirmar `/camino` ahora que la
pantalla resume por línea en vez de listar los 16 temas. Los dos tests nuevos que
fallan entran en la misma unidad de trabajo que los otros 22 — no se arreglan por
partes, por el motivo que ya fijó la 3G.
