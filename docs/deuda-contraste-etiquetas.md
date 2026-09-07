# Deuda técnica: las etiquetas grises no llegan a AA fuera de una tarjeta

Estado: **registrado, sin corregir.** No bloquea la Fase 3H — el marco nuevo de
`/leccion/[id]` evita el par que falla (usa `--text-primary` en "Salir" y en el contador
"n/N"). Lo que queda anotado acá es el par que ya está en pantalla en otras rutas y el
límite del token `--linea-nav`, para no repetirlos sin darse cuenta.

Descubierto: 2026-09-03, midiendo los contrastes de la tarjeta teñida de la pantalla 05.

**No todo lo de este archivo es una falla.** El §1 sí lo es. El §2 es un límite ya
resuelto con un token propio. El §3 (agregado el 2026-09-06) documenta un caso que
**hoy pasa AA en las cuatro líneas** y se anota solo por lo angosto del margen, y el
§4 son dos hallazgos de otra naturaleza. Leer el título y asumir que todo lo de
abajo está roto llevaría a "arreglar" cosas que están bien.

## 1. `--text-secondary` sobre el fondo de página

`.lbl` del HTML de referencia (`B-linea-interfaz-completa.html:71`) es 10px/600 en
`--ink2` (#71747A). Medido contra los fondos del producto:

| Fondo | Contraste | AA (4,5:1 · texto normal) |
|---|---|---|
| `--surface-card` #FFFFFF | 4,69 | pasa |
| `--color-bg` #F8F8FB (el `<body>` de hoy) | **4,42** | **no pasa** |
| `--surface-screen` #F7F7F5 (el fondo "Línea") | **4,37** | **no pasa** |

El HTML de referencia tampoco pasa: su `.ph` es `--surf` #F7F7F5, o sea el segundo caso.

La frontera es exacta: **el par falla solo cuando el rótulo NO está sobre tarjeta.**
Verificado en los dos componentes que la Fase 3G dejó lado a lado en `/tema/[id]`:

- `components/ui/linea/TiraKPI.tsx:55,66` — la tira **es** una tarjeta (`bg-card`), así
  que sus rótulos dan 4,69 y pasan.
- `components/ui/linea/RielEstaciones.tsx:84` — el riel no tiene fondo propio: sus
  subtítulos ("Lección 01 · completa", 11px) caen sobre el fondo de página, 4,42.
- `components/camino/DetalleTema.tsx:176` — el objetivo del tema (12,5px), mismo caso.

`grep` encuentra 9 call sites más de `text-secondary` fuera de `components/ui/linea/`
(`LineaDelEje`, `ListaErroresVivos`, `PuntoDePartida`, `AvancePersonal`, `app/page.tsx`);
no se auditó el fondo de cada uno. No es una regresión de ninguna fase: viene de la
maqueta.

## 2. `--linea-nav` no sirve sobre el tinte de línea

`--linea-nav` es "el color de línea como texto sobre superficie clara", y está calibrado
contra `--surface-card` (blanco). Ahí pasa AA en las cuatro:

| | 01 | 02 | 03 | 04 |
|---|---|---|---|---|
| `--linea-nav` sobre #FFFFFF | 4,85 | 17,76 (tinta) | 4,81 | 6,87 |
| `--linea-nav` sobre `--linea-tinte` | **4,06** | 16,50 (tinta) | **4,30** | 5,84 |

Sobre el tinte de la propia línea, dos de las cuatro caen bajo 4,5. Por eso la Fase 3H
**no** reutilizó `--linea-nav` para el rótulo de la tarjeta teñida ni le cambió el valor:
tocar el primitivo para arreglar el tinte lo habría convertido en dos roles en un token y
habría arrastrado el cambio a `NavInferior` y a `Boton variante="texto"`, que están fuera
de su alcance. Se agregó `--linea-sobre-tinte` como token propio de ese rol (ver
`app/globals.css` y `components/ui/linea/colores.ts`).

Queda como límite escrito: **`--linea-nav` no se usa sobre superficies teñidas.** Sobre
blanco está bien y no hay nada que corregir ahí.

## 3. `--linea-nav` pasa AA en las cuatro líneas, pero dos pasan por muy poco

**Hoy no hay nada roto acá.** Las cuatro líneas pasan AA de texto chico sobre
todas las superficies que el producto pinta de verdad. Esto se anota como margen,
no como fallo, para que nadie lo lea como una deuda pendiente ni lo "arregle" sin
necesidad.

Descubierto: 2026-09-06, midiendo el glifo de repetir del cierre de lección.

Medido contra las tres superficies, cada una identificada:

| | 01 #E4002B | 02 (cae a tinta) | 03 #00843D | 04 #0057B8 |
|---|---|---|---|---|
| Blanco de `Tarjeta` (`bg-surface` #FFFFFF) | 4,85 | 17,76 | 4,81 | 6,87 |
| Fondo real del producto (`--color-bg` #F8F8FB) | **4,57** | 16,75 | **4,54** | 6,48 |
| `--surface-screen` #F7F7F5 | 4,52 | 16,56 | **4,48** | 6,41 |

Las dos filas que importan hoy son las dos primeras, y las dos pasan. Lo que se
anota es el tamaño del colchón: sobre el fondo real del producto la **03 pasa por
0,04** y la **01 por 0,07**. No hay margen para mover el fondo.

### Sobre qué superficie está cada call site

Se verificaron en el navegador, no por lectura del JSX:

- `components/camino/Camino.tsx:283` — "Vas aquí, estación K", 11px/600. El fondo
  que hereda es `rgb(248, 248, 251)`, o sea `--color-bg` #F8F8FB. Da 4,54 en la
  línea 03 y pasa.
- `components/CierreFinal.tsx:169` — el enlace al diagnóstico. Vive **dentro** de
  `<Tarjeta>` (`:132`), que es `bg-surface` blanco. Da 4,81 y pasa.
- `components/AnuncioPrevioItems.tsx:145` — la cifra en `display-l` (44px). Es
  texto grande, así que su piso es 3:1 y no 4,5. Sobra en las tres superficies.

### Por qué la tercera fila está en la tabla si no la usa nadie

`bg-screen` / `--surface-screen` (#F7F7F5) **hoy no lo pinta ninguna ruta del
producto**: el único consumidor es la galería interna `app/%5Fdesign/page.tsx` (la ruta `/_design`).
Se listaron todos los call sites para confirmarlo, no se dedujo del nombre.

Está en la tabla porque es la superficie que la dirección Línea propone, y ahí
está el riesgo real: **si el fondo del producto migra de #F8F8FB a
`--surface-screen`, la línea 03 cae a 4,48 y queda bajo AA de texto chico.** Ese
día hay que bajar el verde en `NAV_POR_LINEA` (`components/ui/linea/colores.ts`),
no antes. El token no se toca hoy: cambiarlo para un fondo que todavía no existe
sería recalibrar contra una superficie hipotética y arrastrar el cambio a
`NavInferior`, `BotonVolver` y `Boton variante="texto"`, que están bien como
están.

Ojo con medir en la galería y creerle: se pinta sobre #F7F7F5 y el producto sobre
#F8F8FB, así que los números salen distintos. Es la misma advertencia que la nota
de la tira de retorno ya lleva en `app/%5Fdesign/page.tsx` (la ruta `/_design`).

## 4. Dos cosas encontradas de paso, que no son de contraste

Van acá por no tener doc propio todavía. Ninguna es un bug.

### Tres tokens de motion sin consumidores

`--dur-base` (200ms), `--dur-entrada` (320ms) y `--dur-press` (120ms) están
declarados en el `@theme` de `app/globals.css` y **no los usa nadie**: `grep` sobre
`app/` y `components/` no devuelve un solo call site fuera de su propia
declaración. Son restos de la era índigo, anteriores a la familia de tacto
(`--dur-tacto`, `--dur-relleno`, `--dur-bandeja`, `--dur-avance`) que sí está viva.

No se borran acá porque borrar un token es su propia decisión: hay que confirmar
que ninguna pantalla sin migrar los referencie por CSS suelto. Se anota para que
la próxima pieza de Línea **no los use pensando que son parte del sistema**. Una
duración nueva se resuelve reusando la familia viva o proponiendo un token nuevo,
nunca resucitando uno muerto.

### El gesto del glifo de repetir se corta si el tap es muy corto

`.gesto-repetir` (`app/globals.css`) anima el trazo del glifo mientras el control
está en `:active` o `:focus-visible`. En un tap más corto que `--dur-relleno`
(140ms), el dedo se levanta antes y la animación se interrumpe.

**No es un bug y no hay que "arreglarlo".** Es la consecuencia directa de hacerlo
en CSS puro: al soltar, la regla deja de aplicar. Lo importante es que el estado
al que vuelve es el correcto. Sin la regla no hay `stroke-dasharray`, así que el
glifo queda completo, nunca a medias. Un gesto que se corta y termina bien es
mejor que sumar JS para garantizar una pasada completa que nadie está mirando.

## Qué costaría cerrar el punto 1

Una de dos, y ninguna es de esta fase:

1. **Oscurecer `--text-secondary`.** #6B6E74 da 4,82 sobre #F8F8FB, 4,77 sobre #F7F7F5 y
   5,11 sobre blanco. Alcanza a todo el producto: hay que revisar los call sites donde
   hoy actúa como gris de segundo plano y confirmar que la jerarquía sigue leyéndose.
2. **Que esos rótulos vivan siempre sobre tarjeta**, que es lo que ya hacen `TiraKPI` y
   las tarjetas del cierre. Los casos sueltos son el riel y los párrafos de encabezado.

Mientras tanto: **texto pequeño sobre el fondo de página va en `--text-primary`**, que da
16,75 contra #F8F8FB. Es lo que hace el marco de la lección.
