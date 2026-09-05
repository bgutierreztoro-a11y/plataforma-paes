# Deuda: la razón escrita de `--trazo-eje` es falsa

Estado: **registrado, sin corregir.** No hay ningún defecto visible: el trazo de
destacador se ve bien en las cuatro líneas y su gate de contraste
(`lib/contrasteTrazo.test.ts`) está en verde. Lo que está roto es el **porqué**
escrito al lado del código, que es lo que va a leer el próximo que lo toque.

Descubierto: 2026-09-05, planificando la Fase C2 (el sello de estación), al
verificar de dónde iba a sacar el color de línea.

## Qué dice el código, y qué es cierto

`components/RunnerLeccion.tsx:70-82` justifica que `--trazo-eje` se emita como
variable suelta con dos afirmaciones:

> Instalar el estilo de línea completo acá recolorearía la selección de
> alternativas en las 34 lecciones (…). Y leer `--linea-tinte` tampoco serviría,
> porque **la pantalla de lección no instala el estilo de línea** y ahí ese token
> cae a `--surface-card` —blanco—, que dejaría el trazo invisible.

Las dos son falsas. `estiloDeLinea(linea)` **ya está instalado** en
`/leccion/[id]`, en las tres fases del runner:

| Fase | Línea | Nodo |
|---|---|---|
| `anuncio` | `:209` | `<div className="flex min-h-full flex-col" style={estiloLinea}>` |
| `itemsPAES` | `:229` | `<div className="contents" style={estiloLinea}>` |
| `pasos` | `:394` | `<div className="contents" style={estiloLinea}>` |

y `estiloLinea` (`:83-85`) es literalmente `{ ...estiloDeLinea(linea),
"--trazo-eje": … }`. O sea que el trazo no se agregó *en vez* del estilo de
línea: se agregó **encima** de uno que ya estaba.

## No envejeció: nació falso

Es la parte que importa para no repetirlo. `01571b9` ("instalar línea del eje en
/leccion/[id]", fase 2D) es del **2026-08-29**; `61fb5b4` ("el trazo llega a la
lección y toma el color de su eje") es del **2026-09-05**. El comentario describía
un estado del repo que ya no existía una semana antes de escribirse.

`docs/rediseno-alma-interfaz.md` repite la misma afirmación en su sección "Dos
cosas que conviene saber antes de tocar el trazo". Ahí ya está corregida, con
puntero a este archivo.

## Qué queda en pie, y qué no

**Cae:** el argumento de que `--linea-tinte` "no serviría porque cae a blanco".
No cae a blanco; en la línea 02 vale `--line-02-tint` (#FFF6E0).

**Probablemente sigue en pie, pero sin verificar:** que `--linea-tinte` no sirva
igual, por otro motivo. El tinte es un color plano y opaco calibrado como fondo de
tarjeta; el trazo es un color de eje compuesto al 22% con `color-mix` sobre lo que
haya debajo, y `--trazo-alfa` tiene un gate de contraste que un token de tinte no
tiene. Es decir: **la decisión puede estar bien y la razón escrita está mal**, que
es el caso más incómodo de los dos porque no se cae ningún test.

**Sin verificar tampoco:** si instalar el estilo de línea recolorearía la selección
de alternativas. Como ya está instalado, `BloquePregunta` ya la pinta con el color
del eje hoy — el riesgo que el comentario describe como futuro es el
comportamiento actual, y nadie lo reportó como defecto.

## Por qué no se arregla acá

Reescribir la justificación exige medir si `--linea-tinte` como tinta de trazo
pasa el gate de `lib/contrasteTrazo.test.ts` en las cuatro líneas, y decidir con
ese dato si `--trazo-eje` se queda, se colapsa o cambia de argumento. Es trabajo
sobre la Fase D con criterio propio, y meterlo dentro de la Fase C2 —que no toca
el trazo por ningún lado— sería exactamente la mezcla que el semáforo de la sesión
evita.

## Qué no cubre este documento

- Si `--trazo-eje` debe existir. Solo dice que la razón escrita no lo sostiene.
- Si la selección de alternativas teñida con el color del eje es deseable o un
  efecto colateral que nadie miró.
