# Diseño del módulo "Potencias y raíces enésimas"

Eje: Números. 3° de 3 módulos del eje, y el último que falta para cerrarlo. El
tema ya existe en `lib/modulos.ts` (`potencias-y-raices`, líneas 206-218) con sus
tres ids declarados y **sin** `cierreId`. Ningún archivo en `content/`.

Prefijo de id del módulo: `potencias-` (misma convención que `enteros-`,
`lineal-`, `ecuaciones-`; MOS §13.6).

Este documento es la fuente de redacción del módulo: fija el arco de cada
lección, el catálogo de errores completo, el reparto de habilidades y los
contextos. Ningún JSON se escribe antes de que esté firmado y de que vuelvan las
consultas de colisión de la sección (f).

---

## 0) Decisiones de alcance ya tomadas

**Asignación descriptor ↔ lección: 1:1 (firmada).** Cada una de las tres
lecciones lleva por título un descriptor del temario, y el orden pedagógico
coincide con el del temario. Implica **un rename** antes de escribir contenido:

| Orden | id | Cambio |
|---|---|---|
| L1 | `potencias-multiplicar-corto` | sin cambio |
| L2 | `potencias-raiz-escondida` | sin cambio (pasa de 3ª a 2ª posición) |
| L3 | `potencias-exponente-racional` → `potencias-problemas-en-contexto` | **rename** |

El id no tiene archivo, así que renombrar es gratis ahora y caro después
(`docs/mapa-modulos-m1.md`, §"Los ids no siempre se parecen a su título", admite
exactamente este caso). Dejar un id llamado `exponente-racional` sobre la lección
de problemas sería un id que miente. Toca `lib/modulos.ts` (`IDS_LECCION` y el
orden de `lecciones` del tema) y el mapa, en **commit propio, antes** de
cualquier contenido.

**`catalogoErrores`: subconjunto embebido por archivo.** El catálogo completo del
módulo se diseña una sola vez —acá, sección (c)— pero cada JSON embebe solo las
entradas que sus propios distractores usan, copiadas carácter a carácter. No es
preferencia: `lib/sanitizar.ts:98` resuelve `errorCatalogado` estrictamente
contra el catálogo del mismo archivo («sin `catalogoErrores`, no se resuelve
nada»), así que una lección que solo referencia ids no muestra la Capa 2 del
feedback ni el paso de autoexplicación; y `scripts/auditar-leccion.mjs:183` marca
🔴 `catalogo-sin-usar` toda entrada que ningún distractor del mismo archivo use,
o sea que guardar en L1 lo que necesita L2 deja a L1 en rojo. Es la regla 5 de
`docs/reglas-modulo.md` tal como quedó tras la corrección del 2026-08-14.

Corolarios: **no** se crea `content/errores/potencias-raices.json` (la regla 5 lo
prohíbe para módulos nuevos), **no** se agrega entrada a `MAPEO_LECCION_UNIDAD`
del validador, y sí se agregan las tres lecciones a `MODULO_POR_LECCION` de
`scripts/auditar-leccion.mjs` con el módulo `potencias-raices`, para que el guard
`catalogo-divergente` compare las copias entre sí.

**El módulo no lleva diagnóstico propio.** El diagnóstico es global: un único
`content/diagnostico.json` (`diagnostico-v0`, 5 ítems) servido por una sola ruta
`app/diagnostico/page.tsx`; el tipo `Tema` de `lib/modulos.ts` solo tiene
`lecciones` y `cierreId` opcional, y no existe ninguna ruta por tema. La frase
«diagnóstico → lecciones → cierre» de CLAUDE.md describe la unidad de producción
del MOS, no una pieza por módulo.

**Este módulo no declara `auditoria.constante`.** No tiene una constante numérica
de descubrimiento —lo que se descubre es un patrón, no una cifra—, igual que
Expresiones algebraicas. El chequeo de filtración quedará reportado como omitido
por el auditor, que es su comportamiento diseñado. Se registra el motivo en
`_notasInternas` de cada archivo para que no parezca un olvido.

**Este módulo no usa `interactivoSlider`.** Ningún concepto de acá lo exige y la
regla 1 lo marca 🔴 sin justificación declarada. La escalera de potencias del
paso 5 de L1 es una `visualizacion`, no un slider.

---

## a) Mapa de las 3 lecciones y el cierre

### L1 — `potencias-multiplicar-corto` — «Propiedades de las potencias de base racional y exponente racional»

**Un solo descubrimiento: la escalera que baja.** Subir un escalón de exponente
multiplica por la base; bajar uno divide por la base. Si el patrón no se rompe al
llegar abajo, `a⁰ = 1` y `a⁻ⁿ = 1/aⁿ` dejan de ser convenciones que hay que
memorizar y pasan a ser lo único que puede ir ahí. El estudiante no aprende dos
reglas nuevas: aprende que la escalera no tiene un final arbitrario.

Cubre además, en los pasos 6 y 7: producto y cociente de potencias de igual base,
potencia de una potencia, y el comportamiento de una base racional (que el
exponente se aplica arriba **y** abajo).

**Lo que L1 NO resuelve, a propósito.** El medio escalón. El paso 10 cierra con
una pregunta abierta explícita: si bajar un escalón entero divide por la base,
¿qué número es `5^½`? El estudiante ya puede argumentar que `5^½ · 5^½` tiene que
dar `5`, y ahí se detiene. La lección declara que la respuesta llega en la
siguiente, y no la insinúa.

**Por qué el descriptor 1 se cubre entre L1 y L2.** El descriptor dice «base
racional **y exponente racional**». El exponente racional se puede *definir* en
L1 —`a^(m/n) = ⁿ√(aᵐ)`, tres líneas— pero definirlo ahí lo convierte en notación
que hay que creer: la raíz enésima todavía no existe como objeto en la lección,
así que el lado derecho de esa igualdad no significa nada para el estudiante. Se
paga con un segundo descubrimiento metido en la misma lección, que es justo lo
que la calibración §2 dice que rompe el arco («si el estudiante pudiera saltarse
el paso 5 y aún así hacer los ejercicios, la lección falló»). La alternativa es
la que se toma: L1 deja la pregunta abierta y **L2 la responde como su propio
descubrimiento**, cuando la raíz ya es un objeto manipulable. El descriptor queda
cubierto entre las dos lecciones, y el título de L1 lo anuncia entero porque es
la lección que abre la escalera completa, incluidos los exponentes no enteros.
Esto se registra también en el `objetivo` de L1 y en `_notasInternas`, para que
una auditoría futura no lo lea como cobertura faltante.

### L2 — `potencias-raiz-escondida` — «Descomposición y propiedades de las raíces enésimas en los números reales»

**Descubrimiento: la raíz es un exponente.** Arranca retomando la pregunta que
L1 dejó abierta. Si `5^½ · 5^½ = 5^1 = 5`, entonces `5^½` es el número que
multiplicado por sí mismo da 5 — o sea `√5`. La raíz no es una operación aparte
con reglas propias: es la misma escalera, con escalones fraccionarios. De ahí
sale todo lo demás sin memorizar nada nuevo:

- `ⁿ√a = a^(1/n)` y `ⁿ√(aᵐ) = a^(m/n)` (índice abajo, exponente arriba).
- `√(a·b) = √a · √b` y `√(a/b) = √a / √b` son las propiedades del producto y del
  cociente de potencias, heredadas.
- **`√(a+b) ≠ √a + √b`**, y ahora el estudiante puede decir *por qué* no: no hay
  ninguna propiedad de potencias que reparta un exponente sobre una suma.
- **Descomposición** (paso 7, práctica): `√72 = √(36·2) = 6√2`. Se extrae el
  **mayor** factor con raíz exacta, y se extrae sacándole la raíz, no copiándolo.

### L3 — `potencias-problemas-en-contexto` — «Problemas que involucren potencias y raíces enésimas en los números reales en diversos contextos»

**Sin concepto nuevo.** Lo que se aprende es a decidir: cuándo la situación pide
multiplicar repetidamente (potencia), cuándo pide deshacer esa multiplicación
(raíz), y cómo se ve cada una escrita. El descubrimiento del paso 5 es que
potencia y raíz son la misma relación leída en dos direcciones, y que el
enunciado es lo que dice cuál de las dos direcciones se está pidiendo. Peso alto
en `modelar` y `argumentar`; el estudiante elige o construye la expresión más
veces de las que calcula.

### Cierre — `cierre-potencias-y-raices`

8 ítems formato PAES, sin contexto nuevo: reutiliza los tres dominios de las
lecciones con cifras distintas. Cubre los tres descriptores. Distribución de
habilidades y dificultad en la sección (d).

---

## b) Cobertura del temario

| Descriptor (`docs/temario-demre-m1-2027.md:41-43`) | Dónde se cubre |
|---|---|
| Propiedades de las potencias de base racional y exponente racional | L1 (base racional, exponentes enteros incluidos 0 y negativos, producto/cociente/potencia de potencia) + L2 (exponente racional, `a^(m/n)`) |
| Descomposición y propiedades de las raíces enésimas en los números reales | L2 completa |
| Problemas que involucren potencias y raíces enésimas en los números reales en diversos contextos | L3 completa + cierre |

---

## c) `catalogoErrores` completo del módulo

Ids únicos a nivel de módulo, nunca reciclados con otro significado. La columna
de lección indica qué archivo embebe cada entrada; una entrada solo se embebe
donde algún distractor propio la usa (si al redactar cambia el reparto, se
actualiza esta tabla, no se improvisa en el JSON).

La descripción es **texto que el estudiante ve** (Capa 2 del feedback): nombra el
mecanismo, no reta, y marca la frontera con los errores vecinos para que el paso
de autoexplicación pueda distinguirlos.

| id | L1 | L2 | L3 |
|---|:--:|:--:|:--:|
| `error-1` multiplicar base por exponente | ✓ | | |
| `error-2` sumar exponentes de bases distintas | ✓ | | ✓ |
| `error-3` la regla no va con esa operación | ✓ | | ✓ |
| `error-4` el exponente negativo como signo | ✓ | | ✓ |
| `error-5` `a⁰ = 0` | ✓ | | |
| `error-6` base racional a medias | ✓ | ✓ | |
| `error-7` índice y exponente invertidos | | ✓ | ✓ |
| `error-8` repartir la raíz sobre una suma | | ✓ | ✓ |
| `error-9` descomposición incompleta | | ✓ | |
| `error-10` extraer el factor sin sacarle la raíz | | ✓ | |
| `error-11` sumar radicales distintos | | ✓ | ✓ |
| `error-12` la raíz como división por el índice | | ✓ | ✓ |
| `error-13` responder otra magnitud | | | ✓ |

**Descripciones (redacción final, se copian literales al JSON):**

- **`error-1`** — Leer la potencia como una multiplicación entre la base y el
  exponente: calcular `2⁵` como `2 · 5 = 10`, o `3⁴` como `12`. El exponente no
  es un factor: dice cuántas veces aparece la base multiplicándose, no por cuánto
  se multiplica.

- **`error-2`** — Sumar los exponentes cuando las bases no son la misma: tratar
  `2³ · 3⁴` como si fuera una sola potencia de exponente 7. La regla de sumar
  exponentes describe qué pasa cuando **se repite el mismo factor**; con bases
  distintas no hay un factor que se repita, así que no hay exponente que sumar.

- **`error-3`** — Aplicar a la operación equivocada la regla que corresponde a la
  otra: el mecanismo es uno solo, no saber cuál operación entre potencias se
  traduce en cuál operación entre exponentes. Aparece igual en las dos
  direcciones —convertir `aᵐ · aⁿ` en `a^(m·n)` o convertir `(aᵐ)ⁿ` en
  `a^(m+n)`— y la señal es siempre la misma: se eligió la operación de exponentes
  antes de mirar qué se estaba haciendo con las potencias. Se distingue de
  `error-2` en que ahí la base sí es la misma y el problema es haber sumado sin
  que correspondiera.

- **`error-4`** — Leer el exponente negativo como si el signo pasara al
  resultado: calcular `2⁻³` como `−8` en vez de `1/8`. Bajar escalones nunca
  cambia de signo, solo divide; el resultado de una potencia de base positiva es
  positivo aunque el exponente sea negativo.

- **`error-5`** — Dar `a⁰ = 0`, leyendo el exponente cero como «no queda nada».
  Bajar un escalón divide por la base, así que el escalón cero es el que está
  justo antes de multiplicar por la base ninguna vez: vale 1, no 0. Se distingue
  de `error-4`, que es sobre el signo de los escalones de más abajo.

- **`error-6`** — En una potencia de base fraccionaria, elevar solo una parte de
  la fracción: dar `(2/3)³ = 8/3` (solo el numerador) o `= 2/27` (solo el
  denominador). La base es la fracción completa, así que el exponente se aplica
  arriba y abajo.

- **`error-7`** — Cambiar de lugar el índice y el exponente al pasar entre raíz y
  potencia: leer `a^(m/n)` como `ᵐ√(aⁿ)` en vez de `ⁿ√(aᵐ)`. El denominador del
  exponente es el índice de la raíz y el numerador es el exponente del radicando;
  invertirlos da otro número, salvo en el caso en que `m = n`.

- **`error-8`** — Repartir la raíz sobre una suma o una resta: dar
  `√(a + b) = √a + √b`. Las propiedades heredadas de las potencias reparten sobre
  productos y cocientes, no sobre sumas: primero se resuelve lo que está dentro de
  la raíz y después se saca la raíz.

- **`error-9`** — Descomponer a medias: extraer un factor con raíz exacta que no
  es el mayor posible y quedarse ahí, como dar `√72 = 2√18` sin notar que 18
  todavía tiene un factor cuadrado. La extracción está bien hecha; lo que falta es
  seguir hasta que el radicando ya no tenga ningún factor con raíz exacta. Se
  distingue de `error-10`, donde el paso mal hecho es la extracción misma.

- **`error-10`** — Sacar el factor de la raíz sin sacarle la raíz: pasar de
  `√(36 · 2)` a `36√2` en vez de `6√2`. Lo que sale afuera es la raíz del factor,
  no el factor.

- **`error-11`** — Sumar radicales que no son el mismo, como si fueran términos
  semejantes: dar `2√3 + 3√2 = 5√5`. Solo se pueden juntar los que tienen el mismo
  índice y el mismo radicando; `√3` y `√2` son dos números distintos, igual que `x`
  e `y` en álgebra.

- **`error-12`** — Confundir sacar la raíz con dividir por el índice: dar
  `√36 = 18` o `³√27 = 9`. La raíz busca el número que multiplicado por sí mismo la
  cantidad de veces que dice el índice da el radicando; dividir no responde esa
  pregunta.

- **`error-13`** — Calcular bien y responder otra magnitud: entregar el área
  cuando la pregunta pide el lado, el total cuando pide el factor, o quedarse en la
  potencia cuando lo que se pedía era deshacerla. El procedimiento está completo y
  sin errores de operatoria; lo que falla es la lectura de qué está pidiendo el
  enunciado.

---

## d) Reparto de habilidades PAES y dificultad

`itemsPAES` de cada lección: 3 ítems (calibración §3.5 y §5.1; el auditor exige
`resolver` + uno de `modelar`/`representar` + `argumentar`, y dificultad
`(baja|media)`, `media`, `alta` **en ese orden**).

| | Ítem 1 | Ítem 2 | Ítem 3 |
|---|---|---|---|
| L1 | `resolver` / baja | `representar` / media | `argumentar` / alta |
| L2 | `resolver` / media | `representar` / media | `argumentar` / alta |
| L3 | `resolver` / media | `modelar` / media | `argumentar` / alta |

El ítem de `representar` de L1 traduce entre la escalera (tabla) y la notación de
potencia; el de L2, entre raíz y exponente fraccionario. El de `modelar` de L3
pide elegir la expresión, no el número.

Cierre (8 ítems, sin chequeo mecánico —`auditar-leccion.mjs:514` solo audita
lecciones—, así que esta distribución se revisa a mano):

| # | Habilidad | Dificultad | Descriptor |
|---|---|---|---|
| 1 | resolver | baja | 1 |
| 2 | resolver | media | 1 |
| 3 | representar | media | 1 y 2 |
| 4 | modelar | media | 3 |
| 5 | argumentar | media | 2 |
| 6 | resolver | media | 2 |
| 7 | modelar | alta | 3 |
| 8 | argumentar | alta | 1 y 2 |

---

## e) Diferenciación estructural — bloques por paso

Ninguna de las tres secuencias repite paso a paso a otra del módulo ni a las 17
lecciones ya escritas (verificado contra el volcado de tipos de bloque de
`content/lecciones/`). El patrón más quemado del proyecto —`prediccion+texto |
seleccion | numerica | pistas | …`, presente en 11 de 17 lecciones— se evita en
las tres.

| Paso | **L1 (escalera)** | **L2 (raíz)** | **L3 (problemas)** |
|---|---|---|---|
| curiosidad | visualizacion + prediccion | texto + prediccion | prediccion + visualizacion |
| problema | seleccion + numerica | numerica | texto + seleccion |
| pensar | numerica | abierta | prediccion |
| pistas | pistas | pistas + visualizacion | pistas + numerica |
| descubrimiento | visualizacion + numerica + texto + verdaderoFalso | texto + numerica + visualizacion + texto | texto + numerica + abierta |
| generalizacion | texto + numerica + seleccion | texto + texto + numerica | texto + seleccion |
| practica | numerica + seleccion + numerica | seleccion + numerica + verdaderoFalso | seleccion + verdaderoFalso + numerica |
| aplicacion | seleccion + numerica | numerica | pregunta |
| reflexion | abierta | verdaderoFalso + abierta | abierta + verdaderoFalso |
| consolidacion | texto + abierta | texto | abierta + texto |

El `abierta` final de L1 es la pregunta del medio escalón que queda sin
responder; el `prediccion` de curiosidad de L2 la retoma. Es el único enganche
narrativo entre lecciones del módulo y es deliberado.

Todos los campos `numerica` de este módulo son adimensionales salvo los de L3
(que sí miden algo). Cada uno se declara en `auditoria.camposAdimensionales` con
su motivo de ≥20 caracteres; inventarles una unidad haría pasar el chequeo
mintiendo (`auditar-leccion.mjs:273-285`).

---

## f) Dominios candidatos y consultas de colisión

Procedimiento de calibración §6.1: tres candidatos por lección, el primero suele
ser el canónico, y un candidato que colisiona se abandona entero (no se ajusta).

**Descartados de entrada** por ser el molde canónico de potencias en el corpus:
interés compuesto y ahorro bancario, población de bacterias que se duplica,
plegado sucesivo de una hoja de papel, granos de trigo en el tablero de ajedrez.

**Descartados por colisión interna** (ya usados en la plataforma): buceo, tazas y
recetas, temperaturas, feria del libro y entradas con recargo, encuesta de
caminata al colegio, taller de esmaltes, auditorio de centro cultural, club de
cálculo mental, puerto fluvial, dron topográfico, ascensor de carga, torneo
escolar de robótica, bolsas y bolitas.

| Lección | Candidatos | Notas |
|---|---|---|
| L1 | **(a)** escalones de aumento de un microscopio escolar: cada escalón multiplica por 4, y el escalón 0 es «tal cual se ve» — el exponente 0 tiene significado físico, que es exactamente lo que necesita el descubrimiento. — **LIMPIO**. **(b)** copias sucesivas de una imagen que en cada guardado queda a la mitad de lado. — **LIMPIO**. **(c)** rondas de eliminación de un campeonato interescolar de ajedrez. — **LIMPIO**. | Los tres vuelven limpios. (a) sigue siendo el favorito. En (a) el término «aumento» da hits en el corpus, pero son de aumento porcentual (Porcentaje / Sistemas de Ecuaciones) — dominio distinto, no cuenta como colisión. (b) y (c) sin hits. (c) reutiliza el marco «torneo», que ya estructura `inecuaciones-problemas`; con veredicto limpio igual conviene preferir (a) o (b) por ese motivo de reparto interno, no por colisión de fuentes. Elección final entre los tres, pendiente. |
| L2 | **(a)** patio cuadrado embaldosado: lado a partir del total de baldosas. — **LIMPIO**. **(b)** diagonal de una pantalla a partir de sus lados. — **LIMPIO**. **(c)** arista de un envase cúbico a partir de su volumen. — **LIMPIO**. | Los tres vuelven limpios. En (a) «lado del cuadrado» da hits, pero es término técnico genérico de Perímetros y Áreas, no del escenario baldosas/patio. En (b) «pulgadas» da hit en `TR01_Numeros_Taller_Repaso`, pero es un problema de escala de mapa/proporcionalidad — dominio distinto. (c) sin hits, pero sigue reservado: pisa el terreno del módulo 11 (Cuerpos geométricos), motivo de reparto interno, no de colisión. Elección final entre (a) y (b), pendiente. |
| L3 | **(a)** escalas de tamaño en potencias de diez, de lo microscópico a lo grande — **LIMPIO, aprobado**: es el dominio de L3. **(b)** ~~capacidad de almacenamiento digital en potencias de dos~~ — **BOTADO (colisión)**. **(c)** ~~códigos de un casillero: `sᵏ` y su raíz `k`-ésima~~ — **BOTADO (veredicto manual)**. **(d)** *respaldo* — **LIMPIO**: rebote de una pelota en el gimnasio del colegio. Se registran la altura de partida y la de cada rebote, y el registro muestra que cada rebote alcanza una fracción fija `r` de la altura anterior — dato medido, no modelo. Ida: altura tras `n` rebotes = `h·rⁿ`, con `r` racional simple (1/2, 2/3, 3/4). Vuelta: se conocen altura inicial, altura final y cuántos rebotes hubo, y falta `r = ⁿ√(h_final / h_inicial)`. | **(a)** vuelve limpio y queda aprobado. **(b)** COLISIÓN contra `MA-03_Numeros_Reales.md` (subcarpeta `Material/`): la fuente ya cubre el mismo escenario de capacidades en potencias de dos que la lección iba a montar. Se abandona entero, no se ajusta (§6.1). **(c)** no lo bota el script sino el veredicto manual: el corpus (`06-bibliografia-y-anexos.md`, subcarpeta `mineduc-curriculum/`) ancla la expresión «combinaciones posibles» al conteo sin orden del eje de Combinatoria, y un código de candado es multiplicativo **con** orden y repetición; el riesgo es que el estudiante importe la fórmula equivocada desde otro eje, y ese riesgo no se arregla cambiando las palabras del enunciado. El candidato «tiempo de caída desde distintas alturas» ya estaba descartado antes (constante `g` en un módulo que no declara `auditoria.constante`). **(d)** hereda el rol que tenía (c): potencia y raíz en las dos direcciones, sin constante física —`r` es un dato medido que entrega el enunciado, no una cifra del mundo—, sin combinatoria y sin almacenamiento digital, y la raíz cae sobre una fracción, lo que además retoma la base racional de L1. (d) vuelve LIMPIO en los cuatro términos y queda confirmado como respaldo: se usa solo si (a) cae en la segunda tanda, la de cifras y frases exactas. Riesgo que se arrastra igual: su mecanismo (multiplicar repetidamente por un factor fijo) es el mismo de «población que se duplica», así que si se activa hay que cuidar que el enunciado no derive en modelo físico —`r` se entrega como dato medido, nunca se deduce. **Regla que dejan los tres descartes:** un dominio sirve para L3 solo si su pregunta inversa natural es «¿por cuánto multiplica cada paso?» —raíz enésima— y no «¿cuántos pasos?», que es logaritmo y está fuera del temario M1. |

**Comandos para correr fuera de la sesión** (uno por candidato; la sesión de
redacción no los ejecuta, y la salida se pega tal cual la imprime el script):

```
node scripts/consultar-fuentes.mjs "microscopio" "aumento" "escalones de aumento" "objetivo del microscopio" "imagen a tamaño real"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "copia de una imagen" "resolución de la imagen" "mitad del lado" "cada copia"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "campeonato de ajedrez" "rondas de eliminación" "octavos de final" "equipos que quedan"   # corrido: LIMPIO

node scripts/consultar-fuentes.mjs "baldosas" "patio cuadrado" "lado del cuadrado" "cuántas baldosas por lado"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "diagonal de la pantalla" "pulgadas" "ancho y alto de la pantalla"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "envase cúbico" "arista del cubo" "volumen del envase"   # corrido: LIMPIO

node scripts/consultar-fuentes.mjs "potencias de diez" "orden de magnitud" "notación científica" "tamaño de una célula"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "rebote de la pelota" "altura del rebote" "cada rebote alcanza" "altura inicial"   # corrido: LIMPIO
```

Cuando esté elegido el dominio de cada lección se corre una segunda tanda con las
**cifras y frases exactas** del enunciado, antes de fijar los números en el JSON.

---

## g) `contextosNumericos` previstos

| Archivo | Contexto | Rango previsto (se cierra tras la consulta) |
|---|---|---|
| L1 | Dominio elegido en (f); números puros en los pasos 6 y 7 | Bases 2, 3, 4, 5 y fracciones simples (1/2, 2/3, 3/4); exponentes de −4 a 5 |
| L2 | Dominio elegido en (f) | Radicandos con factor cuadrado o cúbico exacto entre 8 y 200; índices 2 y 3 |
| L3 | Dominio elegido en (f): (a) escalas de tamaño | Potencias de 10 entre −6 y 9 |
| Cierre | Mezcla de los tres, sin contexto nuevo | Cifras distintas de las usadas en las lecciones |

Regla que aplica al fijar cifras: ningún distractor puede valer lo mismo que una
respuesta correcta **de ningún paso del mismo archivo**
(`colision-distractor-correcta`, 🔴), y cuando un distractor no queda en banda de
magnitud, lo que se cambia son los datos base del problema, no el número del
distractor (regla 3 de `docs/reglas-modulo.md`).

---

## Pendientes antes de tocar cualquier JSON

1. Firma de este documento por Benja.
2. Rename `potencias-exponente-racional` → `potencias-problemas-en-contexto` y
   reorden de `lecciones`, en `lib/modulos.ts` + `docs/mapa-modulos-m1.md`.
   Commit propio, antes del contenido.
3. ~~Primera tanda de consultas de la sección (f), corrida por Benja fuera de la
   sesión; dominio elegido por lección.~~ **Resuelto.** Los ocho candidatos
   (3 de L1, 3 de L2, 2 de L3) tienen veredicto: siete LIMPIO, uno BOTADO
   —L3(b) capacidad de almacenamiento, por colisión con
   `MA-03_Numeros_Reales.md`— y uno adicional BOTADO por veredicto manual sin
   pasar por el script —L3(c) código de casillero, por el mismo motivo de
   riesgo de confusión con Combinatoria que el corpus no permite descartar
   ajustando el enunciado. Dominio de L3 cerrado: (a) potencias de diez, con
   (d) rebote de la pelota como respaldo. Dominios de L1 y L2 siguen abiertos
   entre sus tres candidatos limpios cada uno; la elección final se hace al
   redactar cada lección, no bloquea el resto del documento.
4. Segunda tanda con las cifras y frases exactas del núcleo de cada lección.

Recién después de (3) y (4) se fijan situaciones y números, y empieza la
redacción de L1. Cada lección va con `npm run validar` y `npm run auditar` en
verde y las dos auditorías —matemática y de originalidad— corridas en hilo
aislado del que redactó, antes de su commit.
