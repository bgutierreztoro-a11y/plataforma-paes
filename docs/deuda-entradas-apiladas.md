# Deuda: dos entradas corriendo a la vez sobre el mismo elemento

Estado: **registrado, sin corregir.** No rompe nada visible hoy —las dos
animaciones son fundidos cortos y el resultado se lee como una entrada algo más
lenta, no como un defecto—, pero es el mismo apilado que la Fase C prohíbe
explícitamente para los momentos que sí construye, y conviene que quede escrito
antes de que alguien lo copie como patrón.

Descubierto: 2026-09-05, al inventariar las clases de entrada para la Fase C
(momento).

## Qué es el apilado

Dos animaciones de entrada sobre el mismo elemento —o una dentro de otra— no se
suman, se **multiplican**. Dos fundidos anidados dan `opacity` 0,3 × 0,3 = 0,09 a
mitad de camino en vez de 0,3, y dos `translateY` anidados desplazan la suma de
los dos recorridos. El elemento tarda más en ser legible de lo que dice cualquiera
de las dos duraciones por separado, y ninguna de las dos es la culpable.

## Los dos casos

### 1. `components/AnuncioPrevioItems.tsx` — tres entradas simultáneas

| Línea | Clase | Duración |
|---|---|---|
| `:96` | `.transicion-paso` sobre la `PantallaCentrada` entera | 250ms |
| `:101` | `.entra-numero` sobre el número grande | 480ms |
| `:50` | `.entra-nodo` sobre cada punto del SVG, con `animationDelay: i*60` | 360ms + retraso |

Las tres arrancan en el mismo montaje y las tres corren a la vez. El número —que
es el punto de la pantalla, la revelación del conteo de preguntas— entra bajo un
fundido de página que ya lo está atenuando, así que su "pop" con sobregiro
(`cubic-bezier(0.34, 1.56, 0.64, 1)`, escrito para que se note) llega apagado.

### 2. `components/FeedbackEnCapas.tsx` — una entrada anidada dentro de otra

| Línea | Clase |
|---|---|
| `:123` | `.transicion-paso` sobre el contenedor |
| `:128` | `.entra-panel-anclado` sobre un hijo directo |

`.entra-panel-anclado` sube 24px (retemplado en la Fase A, `globals.css:716-725`)
y `.transicion-paso` sube 4px: el hijo recorre 28px, no 24, y con la opacidad
multiplicada.

Los otros tres `.transicion-paso` del mismo archivo (`:147`, `:199`, `:210`) no
apilan: son hermanos de ese contenedor, no descendientes suyos.

## Por qué no se arregla acá

Arreglarlo es decidir **cuál de las dos entradas se queda** en cada caso, y esa es
una decisión de composición de la pantalla, no un ajuste mecánico. En
`AnuncioPrevioItems` probablemente sobra `.transicion-paso` de la pantalla entera
—el número y los nodos ya tienen su gesto propio y mejor—, pero eso cambia cómo
entra esa pantalla completa, que es trabajo con criterio propio.

La Fase C toca `.transicion-paso` (le agrega `animation-delay: var(--retraso,
0ms)` y `backwards`), y ese cambio es neutro para los dos casos: con el default
`0ms` los cinco call sites existentes se comportan exactamente igual que hoy. El
apilado no empeora ni mejora.

## Observación adyacente, tampoco de esta fase

Dos clases de entrada llevan sus tiempos escritos a mano en vez de tomarlos de
`:root`:

- `.transicion-paso` (`globals.css:696`): `0.25s ease-out`.
- `.entra-nodo` / `.entra-en-secuencia` (`globals.css:902,909`): `360ms
  cubic-bezier(0.22, 1, 0.36, 1)` — esa curva **es** literalmente `--ease-salida`
  (`globals.css:418`), copiada.

Y `--dur-entrada` (320ms) y `--ease-salida` están declarados en `:root` y hoy no
los usa ni un solo call site del código fuente.

Engancharlos no es un cambio de notación: `0.25s → --dur-base` (200ms) y `360ms →
--dur-entrada` (320ms) mueven los tiempos de seis call sites repartidos en cinco
componentes, incluidas las dos pantallas del camino. Se hace en la fase que mida
esos seis, no de paso.

## Qué no cubre este documento

- Cuál de las dos entradas se queda en cada caso.
- Si `.transicion-paso` sobre una pantalla completa tiene sentido siquiera, ahora
  que la Fase C la usa como entrada de pieza y no de página.
