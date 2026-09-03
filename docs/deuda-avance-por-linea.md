# Deuda: la pantalla 11 ("Tú") promete tres cifras que el progreso no puede sostener

Estado: **registrado, sin corregir.** No bloquea la pantalla — `/tu` se monta con
lo único que el progreso del dispositivo sostiene sin inventar nada: lecciones
completadas, por línea y en total. Lo que sigue es el desfase entre lo que el
HTML de referencia promete y lo que la capa de datos puede afirmar hoy, más un
bug de agregación que se descubrió al medirlo.

Descubierto: 2026-09-02, al armar la pantalla 11 (fase 3E).

## Qué promete el HTML de referencia

`docs/referencia/B-linea-interfaz-completa.html:385-406` (pantalla 11):

- Tira de tres KPIs: **Racha 7**, **Estaciones 9**, **Ítems 112**.
- Bloque "Por línea" con `N/M` y barra por cada uno de los cuatro ejes.
- CTA "Enviar reporte al apoderado".

## 1 · Racha: no existe fuente, y la que se acerca miente

No hay ninguna noción de días de actividad en el código. Lo único cronológico es
`respondidaEn` (ISO) en `RespuestaLocal` (`lib/datos/progreso.ts:129`), y derivar
una racha de ahí produciría un número falso por tres razones independientes:

- `podar()` (`lib/progresoLocal.ts:185-186`) conserva las **últimas 500**
  respuestas y descarta las más antiguas. Una racha larga se trunca sola, sin
  aviso y sin forma de detectarlo desde la interfaz.
- Ante cuota llena, `guardar()` reescribe el progreso **sin** el array
  `respuestas` (`lib/progresoLocal.ts:203`). La racha caería a 0 con el avance
  por lección intacto: el estudiante vería su recorrido completo y su racha en
  cero el mismo día.
- "Racha" no está definida en ningún documento del repo. ¿Días calendario o
  ventanas de 24 h? ¿En qué zona horaria, si el registro es UTC? ¿Qué cuenta como
  actividad — abrir un paso, responder un ítem, cerrar una lección?

→ **La celda se pinta sin dato.** Requiere decisión de producto y una fuente
propia, no derivada del histórico podado.

## 2 · Ítems acumulados: misma raíz, más un problema de definición

El tope de 500 y el descarte por cuota aplican igual: el conteo se topa y puede
**bajar**, que es peor que quedarse quieto.

Encima, el registro **no distingue ítem PAES de pregunta de paso**.
`registrarRespuesta` se llama desde dos sitios con la misma forma:

- `components/ItemPAES.tsx:154` — ítems tipo prueba.
- `components/bloques/BloquePregunta.tsx:73` — preguntas dentro de un paso de
  lección.

`RespuestaLocal.contexto` (`"leccion" | "diagnostico" | "cierre"`) separa por
**dónde** se respondió, no por **qué clase de ítem** es: una pregunta de paso y
un ítem PAES de la misma lección llegan los dos como `contexto: "leccion"`. Así
que no hay un "112 ítems" que contar; hay dos números distintos mezclados.

→ **La celda se pinta sin dato.** Corregirlo pide un campo nuevo en
`RespuestaLocal` (y su espejo en `db/migraciones/003_respuestas.sql`), que es
cambio de esquema y no de pantalla.

## 3 · Estaciones completadas: el chequeo del cierre usa un balde único

Este es un bug, no una carencia.

`estadoDeNodo()` decide si el tema está completado exigiendo lecciones cerradas
**y** cierre rendido (`lib/estadoNodo.ts:117-121`). El chequeo del cierre es:

```ts
const cierreRendido =
  !tema.cierreId ||
  (resumen.itemsRespondidos.get("cierre")?.size ?? 0) >= tema.cierreTotalItems;
```

La clave es la cadena literal `"cierre"`, no `tema.cierreId`. Y del otro lado,
`components/Cierre.tsx:56` escribe `contextoId="cierre"` para **los once
cierres** declarados en `lib/modulos.ts`.

Los once comparten un solo balde de ids de ítem. Consecuencia: rendir el cierre
de Porcentaje deja marcado como "cierre rendido" a **cualquier** tema cuyo
`cierreTotalItems` sea menor o igual a los ítems acumulados en ese balde. El
error es monótono y creciente — cuantos más cierres se rinden, más temas se
marcan completos sin haberlo sido.

Alcanza a todo lo que pliega `estadoDeNodo`, no solo a la pantalla 11:
`temasCompletados()` (`lib/estadoNodo.ts:189`), el contador de /camino
(`components/camino/Camino.tsx:192`) y la celebración de tema
(`components/camino/CelebracionTema.tsx:117`).

La corrección tiene dos mitades y ninguna es local a esta fase: pasar el
`cierreId` real como `contextoId` en `Cierre.tsx`, y leerlo por ese id en
`estadoNodo.ts` — más decidir qué hacer con el progreso ya guardado bajo la clave
`"cierre"` en los dispositivos que la tengan.

→ **Por eso la pantalla 11 no cuenta estaciones.** Cuenta **lecciones
completadas**, con `avanceDeTema()` (`lib/estadoNodo.ts:54`), que solo mira
`ProgresoLocal.lecciones[].completada` y no toca el balde contaminado. El rótulo
dice "lecciones" y no "estaciones" precisamente porque es lo que el número mide.

## 4 · `estadoModulo` no mide avance del estudiante

Anotado acá porque es una confusión fácil de repetir. `estadoDelModulo()`
(`lib/estadoModulo.ts:33`) devuelve `completo | en-preparacion | sin-contenido`
comparando lecciones **declaradas** contra lecciones **en disco**: es el estado
de producción del contenido, y así lo usa `lib/camino.ts:88`.

Bajo un titular que dice "Tu avance" ese número sería honesto y estaría mal
etiquetado — diría cuánto llevamos escrito nosotros, no cuánto lleva recorrido el
estudiante. El avance del estudiante vive en `lib/estadoNodo.ts` y en ningún otro
lado.

## 5 · "Enviar reporte al apoderado"

Funcionalidad de Modo PAES, sin definir: no hay destinatario, ni contenido de
reporte, ni canal, ni la decisión de consentimiento que un envío a un tercero
sobre un menor exige. El botón queda `variante="deshabilitado"` (que además pone
`disabled`, `components/ui/linea/Boton.tsx:78`).

## Qué no cubre este documento

Priorizar las cuatro correcciones entre sí. El punto 3 es el único que produce un
número **incorrecto** hoy en pantallas ya montadas (/camino y la celebración);
los puntos 1 y 2 solo producen ausencia, que es visible y honesta. Este documento
registra el desfase para que esa priorización se haga con los datos exactos.
