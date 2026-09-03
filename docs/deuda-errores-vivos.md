# Deuda: la pantalla 10 ("Errores") promete estado acumulado que la sesión no guarda

Estado: **registrado, sin corregir.** No bloquea la pantalla — `/errores` ya está
montada y funciona con lo que la sesión sí tiene (los errores catalogados de esta
pestaña, con su conteo). Lo que sigue son las promesas del HTML de referencia que
la capa de datos actual no puede sostener, para decidir la corrección aparte con
su propio alcance y prioridad.

Descubierto: 2026-09-02, al armar la pantalla 10 (fase 3D).

## Qué promete el HTML de referencia

`docs/referencia/B-linea-interfaz-completa.html:366-383` (pantalla 10):

- Titular "4 errores vivos" y un listado que **acumula entre sesiones** ("3
  veces", "2 veces", "1 vez").
- Cada fila: chip cuadrado con el **id del error a dos dígitos** ("07", "09"),
  título del error y una línea secundaria "N veces · **línea 0N**", con el nombre
  de la línea coloreado con el `--linea-nav` de su eje.
- Subtítulo con la regla de **extinción**: "Se apagan al resolverlas bien dos
  veces seguidas."
- CTA "Repasar los 4 · **6 min**".

## Qué puede sostener la sesión hoy, y por qué no el resto

El único registro de "cuántas veces cayó en cada error" es `ocurrenciasPorError`
en `lib/progresoSesion.ts`. La pantalla lo lee con `ocurrenciasDeErrorDeSesion()`
y lo agrega con `erroresVivosDeSesion()` (`lib/erroresVivos.ts`), que produce solo
`{ titulo, veces }`.

- **Muere al recargar.** Es un `Map` en memoria de módulo (cliente). La cabecera
  del archivo lo declara intencional: persistirlo exigiría guardar el error junto
  a la respuesta, y `RespuestaLocal.valor` (`lib/datos/progreso.ts`) solo guarda
  la clave A–D. Por eso la pantalla 10 muestra el estado vacío como caso normal
  —llegar desde la barra en una pestaña nueva— y lo pinta como tal, sin filas de
  ejemplo.
- **Cuenta por descripción, no por id.** Los ids del catálogo (`error-7`) son
  locales al archivo —el mismo id nombra errores distintos en dos lecciones,
  `docs/deuda-catalogo-errores-crossfile.md`—, así que no hay un id de dos
  dígitos estable que poner en un chip. → **El chip se omite.**
- **No guarda el eje.** El error se cuenta suelto, sin la lección/unidad de
  origen, así que no hay forma de derivar "línea 0N" ni de colorearla. Para
  recuperarlo haría falta un índice `descripción → unidad` sobre
  `content/errores/*.json` (hoy solo lo lee `scripts/validar-contenido.mjs`) más
  el árbol de `lib/modulos.ts`. → **El fragmento "· línea 0N" se omite.**
- **No hay tiempo por error.** `tiempoEstimadoMin` (`lib/tipos.ts`) es por
  lección, no por error. → **El "· N min" del CTA se omite.**

## Extinción ("dos veces seguidas")

No está implementada. En la pantalla es **copy** del subtítulo, nada más.
Requiere: (1) persistir el conteo entre sesiones, (2) registrar aciertos
consecutivos por error, (3) una regla de "apagado". Los tres dependen de la
persistencia que `docs/plan-fase-3-navegacion.md §1` posterga a Fase 5. No se
implementa sin decisión de producto y firma.

## CTA "Repasar"

No hay ruta de repaso dirigido. El botón queda `variante="deshabilitado"` (que
además pone `disabled`, `components/ui/linea/Boton.tsx`). Cuando exista el flujo,
se cambia por `EnlaceBoton` con su `href` y recién ahí se decide el "· N min".

## Qué no cubre este documento

Elegir si la pantalla 10 espera a la persistencia de Fase 5 para mostrar id,
línea y extinción, o si el chip y la línea se resuelven antes con el índice sobre
`content/errores/`. Este documento solo registra el desfase para que esa decisión
se tome con datos exactos.
