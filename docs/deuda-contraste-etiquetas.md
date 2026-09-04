# Deuda técnica: las etiquetas grises no llegan a AA fuera de una tarjeta

Estado: **registrado, sin corregir.** No bloquea la Fase 3H — el marco nuevo de
`/leccion/[id]` evita el par que falla (usa `--text-primary` en "Salir" y en el contador
"n/N"). Lo que queda anotado acá es el par que ya está en pantalla en otras rutas y el
límite del token `--linea-nav`, para no repetirlos sin darse cuenta.

Descubierto: 2026-09-03, midiendo los contrastes de la tarjeta teñida de la pantalla 05.

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

## Qué costaría cerrar el punto 1

Una de dos, y ninguna es de esta fase:

1. **Oscurecer `--text-secondary`.** #6B6E74 da 4,82 sobre #F8F8FB, 4,77 sobre #F7F7F5 y
   5,11 sobre blanco. Alcanza a todo el producto: hay que revisar los call sites donde
   hoy actúa como gris de segundo plano y confirmar que la jerarquía sigue leyéndose.
2. **Que esos rótulos vivan siempre sobre tarjeta**, que es lo que ya hacen `TiraKPI` y
   las tarjetas del cierre. Los casos sueltos son el riel y los párrafos de encabezado.

Mientras tanto: **texto pequeño sobre el fondo de página va en `--text-primary`**, que da
16,75 contra #F8F8FB. Es lo que hace el marco de la lección.
