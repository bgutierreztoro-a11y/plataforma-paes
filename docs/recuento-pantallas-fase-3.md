# Recuento: las 11 pantallas del HTML de referencia y qué las implementa

Fuente: `docs/referencia/B-linea-interfaz-completa.html` (once bloques `<!-- 01 -->`
… `<!-- 11 -->`). Estado al cierre de la fase 3F (2026-09-02).

"Completa" = la ruta existe y sigue la maqueta con los tokens de la dirección
"Línea". "Parcial" = la ruta existe y funciona, pero la migración a "Línea" está a
medias (normalmente: color de eje instalado en fase 2, marco de la maqueta sin
rehacer).

| # | Pantalla (HTML) | Ruta / componente | Estado |
|---|---|---|---|
| 01 | Entrada | `app/page.tsx` → `components/PuntoDePartida.tsx` (marco `Entrada` + `TiraKPI` + `EnlaceBoton` de `ui/linea/`) | **Completa** — fase 3F |
| 02 | La red | `app/camino/page.tsx` → `components/camino/Camino.tsx` / `CaminoVertical.tsx` + `ui/linea/NavInferior` | **Completa** — fase 2 + 3A |
| 03 | Línea | `app/linea/[ejeId]/page.tsx` → `components/camino/LineaDelEje.tsx` + `ui/linea/PlacaLinea` + `ui/linea/RielEstaciones` | **Completa** — fase 3B |
| 04 | Estación | `app/tema/[id]/page.tsx` → `components/camino/DetalleTema.tsx` | **Parcial** (ver nota 1) |
| 05 | Lección, descubrimiento | `app/leccion/[id]/page.tsx` → `components/RunnerLeccion.tsx` + `components/bloques/*` | **Parcial** (ver nota 2) |
| 06 | Lección, acierto | `components/RunnerLeccion.tsx` → `components/FeedbackEnCapas.tsx` | **Parcial** (ver nota 2) |
| 07 | Lección, error catalogado | `components/FeedbackEnCapas.tsx` + `components/ui/linea/TarjetaError.tsx` (disparado desde `ItemPAES` / `bloques/BloquePregunta`) | **Completa** — fase 3C (ver nota 3) |
| 08 | Cierre PAES | `app/cierre/[temaId]/page.tsx` → `components/Cierre.tsx` | **Completa** — fase 2E |
| 09 | Resultado | `components/CierreFinal.tsx` (`ui/linea/Puntaje` + `ui/linea/FranjaDeItems` + `ui/linea/TarjetaLoQueFallo`) | **Completa** — fase 2E |
| 10 | Errores | `app/errores/page.tsx` → `components/errores/ErroresVivos.tsx` / `ListaErroresVivos.tsx` + `ui/linea/NavInferior` | **Completa** — fase 3D (ver nota 4) |
| 11 | Tú | `app/tu/page.tsx` → `components/tu/AvancePersonal.tsx` + `ui/linea/TiraKPI` + `ui/linea/NavInferior` | **Completa** — fase 3E (ver nota 5) |

## Notas

**1 · Pantalla 04 (Estación) — parcial.** `DetalleTema.tsx` recibió el color de
eje en la fase 2C (`estiloDeLinea`), pero el marco de la maqueta —tira de tres
cifras (Lecciones / Ítems / Min) y el riel de estaciones con el estado por
lección— no está montado ahí. El riel existe como componente
(`ui/linea/RielEstaciones` + `ui/linea/Estacion`, fase 3B) pero hoy solo lo usan
`/linea/[ejeId]` y `/_design`. `DetalleTema` sigue con tokens de la capa anterior
(`bg-surface`, `border-border`, `rounded-tarjeta`, `text-ink-suave`).

**2 · Pantallas 05 y 06 (Lección) — parciales.** El runner funciona y toma el
color de eje desde la fase 2D (`estiloDeLinea` en `RunnerLeccion`), y el feedback
en capas de la pantalla 06 existe (`FeedbackEnCapas`). Lo que no se hizo es
rehacer el cromo de cada paso contra la maqueta pieza por pieza (barra de
progreso "2/7" con "Salir", tarjeta "Lo que estás viendo", el par "¿Te hizo
sentido? Sí / Todavía no"). No hay una deuda escrita para esto: es alcance de una
fase de migración del runner que todavía no se abrió.

**3 · Pantalla 07.** El tercer párrafo del banner de error (el que rehace el
cálculo paso a paso) tiene deuda propia en `docs/deuda-banner-error-desarrollo.md`
y `docs/deuda-catalogo-errores-crossfile.md`.

**4 · Pantalla 10.** El conteo de la sesión no distingue id ni eje; detalle en
`docs/deuda-errores-vivos.md`.

**5 · Pantalla 11.** Racha, ítems acumulados y el conteo de *estaciones* (en vez
de lecciones) no tienen fuente que los sostenga; detalle en
`docs/deuda-avance-por-linea.md`, que además documenta el bug del balde único
`"cierre"` en `estadoDeNodo`.

## Fuera de las 11

`docs/deuda-navegacion.md` lista las rutas que no son ninguna de las 11 y quedaron
sin `NavInferior` tras sacarla del layout: `/inicio` (redirige a `/`),
`/lecciones`, `/diagnostico`, `/cuenta`, `/ingresar`, `/registrarse`,
`/privacidad`, `/preventa` y las tres de `/vista-previa/*`.
