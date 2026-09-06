# Deuda: iconos animados de terceros (itshover), evaluado y descartado

Estado: **cerrado, no volver a evaluar sin dato nuevo.** No es deuda de código:
no hay nada instalado ni que revertir. Es deuda de decisión. El hallazgo se
escribe acá para que la próxima sesión no repita la evaluación desde cero.

Evaluado: 2026-09-06, en fase 0 de solo lectura. Nada se instaló.

Catálogo evaluado: `https://www.itshover.com/icons`, iconos SVG animados con
Motion, instalables con `npx shadcn@latest add https://itshover.com/r/<slug>-icon.json`.

## Lo medido, no lo supuesto

La fuente es el registry real, no la página de marketing:
`https://itshover.com/r/double-check-icon.json` (leído). El registry de
`right-chevron` devuelve **404**: los slugs del catálogo no coinciden uno a uno
con los del registry, así que ni siquiera la lista publicada es confiable como
índice.

`npm view` sobre los paquetes, sin instalarlos:

```
motion@13.2.0          unpackedSize   717.776 B  (~701 KB)
  ├── framer-motion@13.2.0            4.830.823 B (~4,6 MB)
  │     ├── motion-dom@13.2.0
  │     └── motion-utils@13.0.0
  └── tslib@2.8.1                        90.359 B  (~88 KB)
```

`motion` **no es un runtime chico e independiente: depende de `framer-motion`
entero.** Total ~5,6 MB en disco, 5 paquetes nuevos, para un producto que hoy
tiene 6 dependencias de runtime.

**No medido:** el peso en el bundle servido. Requiere instalar y correr `next
build`, que es justo lo que se decidió no hacer. No hay número de KB gzipped acá
porque nadie lo midió. Lo que sí es estructural: `useAnimate` es hook de cliente,
así que cada icono es `"use client"` y arrastra el runtime de animación al bundle
de toda ruta que lo monte.

## Las tres paradas rojas

1. **Los archivos caen fuera de `components/`.** Los `target` del registry son
   `icons/<nombre>-icon.tsx` y `icons/types.ts`, un directorio nuevo en la raíz.
   El repo tiene una sola casa para componentes y esto abre una segunda.

2. **No existe `components.json`.** El proyecto nunca corrió `shadcn init`.
   `npx shadcn@latest add` exige inicializar primero, y ese init escribe config
   nueva y toca `app/globals.css`, 1.350+ líneas donde vive todo el sistema de
   tokens, las curvas de motion y el contraste medido línea por línea. El costo
   de entrada no es el icono: es dejar que una CLI de terceros edite el archivo
   más cargado del repo.

3. **Cero `prefers-reduced-motion` y `hover` sin `focus`.** El componente no
   consulta la preferencia en ninguna parte (`useAnimate` de Motion no la respeta
   solo; haría falta `<MotionConfig reducedMotion="user">`). Y la animación
   cuelga de `onHoverStart` / `onHoverEnd` sobre un `motion.div`: **a 390×844,
   el dispositivo del estudiante, no hay hover, así que no se dispara nunca**, y un
   usuario de teclado tampoco la ve. Se paga el runtime completo por un gesto que
   el usuario objetivo no tiene.

## Los choques menores

- **Geometría.** viewBox 48 con `strokeWidth` escalado,
  `strokeLinecap="square"`, `strokeMiterlimit="10"`. Todo el sistema va en
  viewBox 16/20/24 con `round` en cap y join (`components/ui/linea/IconosNav.tsx:18-24`
  lo declara como contrato: *"la fila tiene que leerse de un solo peso"*).
- **Sin `aria-hidden`.** Los diez glifos del repo lo llevan sin excepción.
- **Clases hardcodeadas:** `inline-flex cursor-pointer` en el wrapper.
  `cursor-pointer` sobre un icono que no es el control es incorrecto.
- **Frontera de cliente.** `NavInferior`, `BotonVolver`, `PlacaLinea` y
  `RielEstaciones` son componentes de servidor hoy; montar un icono animado los
  pasa a `"use client"`.
- **Una cuarta familia de glifos.** `IconosNav.tsx:12-14` ya registra que
  conviven dos familias (16px/trazo 2 y 24px/trazo 1.75) más los glifos de
  `camino/NodoTema.tsx`. Sumar viewBox 48 con cap `square` empeora ese eje.

Lo único compatible es el color: `stroke={color}` con default `currentColor`
funciona con `--linea-*` sin tocar nada. Un punto de nueve.

## Por qué se cerró

- CLAUDE.md: *"Sin dependencias nuevas sin justificar qué incertidumbre reducen.
  Preferir cero dependencias."* Ésta no reduce ninguna incertidumbre pedagógica
  ni comercial (MOS §2).
- El inventario de la fase 0 **no encontró el problema que la evaluación
  asumía**. Se revisaron 15 componentes buscando "texto sin apoyo visual": en 11
  no hay hueco, y en 3 el hueco está cerrado por una decisión escrita y fechada
  que dice explícitamente que ahí no va icono:
  `components/ui/PanelFeedback.tsx:102-104` (*"El rótulo hace el trabajo que
  hacía el ícono… Por eso no van los dos"*) y
  `components/AnuncioPrevioItems.tsx:159-161` (*"Dato, no advertencia: sin caja,
  sin ícono y sin verbo de aviso"*).
- Lo que se puede animar acá ya está resuelto con cero dependencias: `.canto`,
  `--dur-tacto` y `--dur-salida` en `app/globals.css`, que además ya respetan
  `prefers-reduced-motion` en los seis bloques `@media` que el archivo declara.

## Qué queda abierto

**Único hallazgo real de legibilidad:** `components/ItemsPAESFinal.tsx:212-217` y
`:234-239` montan dos enlaces de texto casi idénticos ("Repasar esta lección" y
"Repetir solo las preguntas") con la misma clase `CLASE_ENLACE_DISCRETO`
(`:19-20`), distinguibles solo leyéndolos completos. Se resuelve con un glifo
propio, dibujado en el repo con el contrato de `IconosNav.tsx` y reusando el
dibujo de `GlifoRepasar` (`components/camino/NodoTema.tsx:45`) en vez de inventar
otro para el mismo concepto. Sin dependencia.

**Fuera de alcance, anotado y sin tocar:** `app/error.tsx` es la única pantalla
de nada **sin** ilustración, mientras `app/not-found.tsx:9-11` sí la tiene. El
comentario de `not-found.tsx:12-14` documenta la simetría de *rótulo* entre las
dos, pero no la de ilustración. Es un slot de `components/ilustraciones/`, no de
iconos, y pide su propio commit y su propia decisión de qué se dibuja ahí.

## Qué haría reabrir esto

Un dato nuevo, no una preferencia. Por ejemplo: que el registry pase a apuntar
dentro de `components/`, que los componentes traigan `prefers-reduced-motion` y
`focus` de fábrica, o que aparezca una necesidad de animación que
`stroke-dashoffset` en CSS no cubra. Ninguna de las tres es el caso hoy.
