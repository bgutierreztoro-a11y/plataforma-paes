# Deuda del flujo de cierre

Estado: **registrada, sin corregir.** Dos defectos encontrados el 2026-08-30 mientras se mapeaba
`/cierre/[temaId]` para la Fase 2E del rediseño "Línea" (instalar el color del eje + pantalla de
resultado). Ninguno de los dos lo introduce esa fase y ninguno se arregla en ella: son defectos de
contenido mostrado y de contabilidad de progreso, no de capa visual, y arreglarlos ahí habría metido
dos cambios de comportamiento dentro de un commit de diseño.

Se documentan acá para decidirlos aparte, con su propio alcance.

---

## 1. `AnuncioPrevioItems` anuncia siempre "Función lineal y afín"

**Dónde:** `components/Cierre.tsx:26`

```tsx
<AnuncioPrevioItems
  variante="modulo"
  cantidad={cierre.items.length}
  nombreModulo="Función lineal y afín"   // ← literal, no sale del tema
  onEmpezar={() => setFase("items")}
/>
```

**Síntoma medido:** `components/AnuncioPrevioItems.tsx:90` arma
`alcance = \`de ${nombreModulo}\`` y `:103-105` lo renderiza como `8 preguntas de Función lineal y
afín`. Como el literal está en `Cierre.tsx` y no sale de `tema.nombre`, esa frase aparece igual en
**los 11 temas que tienen `cierreId`** (`lib/modulos.ts:195,209,223,253,267,281,295,309,323,343,356`).
Entrar a `/cierre/porcentaje` anuncia "8 preguntas de Función lineal y afín" antes de mostrar ocho
preguntas de porcentaje.

**Origen:** el literal es correcto para el estado anterior a la Enmienda 2 (2026-07-28), cuando había
un solo módulo y un solo cierre. Al abrir los otros diez, `nombreModulo` no se parametrizó.

**Arreglo:** pasar `tema.nombre` desde `app/cierre/[temaId]/page.tsx:44` hasta la prop. `tema` ya está
resuelto en `:35` (`temaDelCaminoPorId(temaId)`), y `TemaDelCamino.nombre` existe en `lib/camino.ts:29`.
Son dos líneas.

**Por qué queda fuera de la Fase 2E:** esa fase pasa `ejeId` por el mismo camino, así que la
tentación de sumar `nombre` "ya que estamos" es real — pero es texto que el estudiante lee, no un
token de color. Cambiarlo dentro de un commit titulado "instalar la línea del eje" lo esconde de la
revisión y del changelog. Va en su propio commit, con su propia verificación en las 11 rutas.

---

## 2. Los 11 cierres comparten un bucket de progreso: rendir uno marca los once

**Dónde:** `components/Cierre.tsx:34`

```tsx
contexto="cierre"
contextoId="cierre"    // ← literal global, no `tema.id` ni `cierre.id`
```

**El mecanismo:** `contextoId` es la clave con la que se indexa todo el progreso.
`lib/estadoNodo.ts:32-33` agrupa por `r.contextoId`, y los dos consumidores del cierre leen la clave
literal `"cierre"`:

- `lib/estadoNodo.ts:183` — `estadoDelCierre()`: `resumen.itemsRespondidos.get("cierre")?.size ?? 0`,
  comparado contra `tema.cierreTotalItems` en `:184`.
- `lib/estadoNodo.ts:119` — `estadoDeNodo()`: mismo `get("cierre")`, que decide `cierreRendido` y con
  él si el tema entero se pinta `completado` (`:121`).

**Síntoma medido:** los 11 cierres tienen **exactamente 8 ítems cada uno** y sus **88 `itemId` son
todos distintos** (verificado con `node -e` sobre `content/cierres/`: 88 items, 88 ids únicos, 0
repetidos entre archivos). Como todos escriben en el bucket `"cierre"`, el `Set` acumula ids de
módulos distintos sin colisionar. Terminar **un** cierre deja el set en 8, y `8 >= cierreTotalItems`
se cumple para los 11 temas: **`estadoDelCierre()` devuelve `completado` para los once**, y
`estadoDeNodo()` da por rendido el cierre de cualquier tema cuyas lecciones estén completas.

Alcance del daño, en orden de visibilidad:

- `/camino` y `/tema/[id]` pintan como rendidos diez cierres que nadie abrió.
- `temasCompletados()` (`lib/estadoNodo.ts:189-194`) alimenta el denominador de avance de la portada,
  así que la cuenta de temas terminados sube de más.
- `aciertos` (`lib/estadoNodo.ts:43-48`) se agrupa por la misma clave: los aciertos al primer intento
  de los once cierres se suman en un solo número.

**Contraste con el diagnóstico:** `components/Diagnostico.tsx` usa su propio `contextoId` y no tiene
el problema; el cierre es el único set de ítems con un id de contexto literal compartido.

**Arreglo:** pasar `contextoId={cierre.id}` (o `tema.id`) y hacer que `estadoDelCierre()` y
`estadoDeNodo()` reciban esa clave en vez de la constante `"cierre"`. **No es un cambio de una línea:**
el progreso ya escrito en `localStorage` (clave `pm1:progreso:v1`, `lib/progresoLocal.ts:31`) quedó
guardado bajo `"cierre"`, así que hay que decidir qué pasa con él — migrarlo al id que corresponda
(no se puede: el registro no dice de qué cierre venía cada itemId sin cruzarlo contra
`content/cierres/`), descartarlo, o leer las dos claves durante una ventana. Esa decisión es el
verdadero alcance del arreglo, y por eso no cabe en una fase de diseño.

**Por qué queda fuera de la Fase 2E:** la fase no lee ni escribe progreso — su pantalla de resultado
se arma con el estado de sesión de `lib/estadoSetItems.ts`, que arranca vacío en cada corrida
(`:18`) y no toca `localStorage`. El defecto es anterior y ortogonal.

---

## Qué no cubre este documento

Cuál de los dos se arregla primero, y qué se hace con el progreso ya guardado bajo la clave
`"cierre"`. Este archivo solo registra el mecanismo y el alcance verificado para que esa decisión se
tome con datos exactos, igual que `docs/deuda-catalogo-errores-crossfile.md`.
