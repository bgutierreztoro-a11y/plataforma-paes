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
| `error-1` multiplicar base por exponente | ✓ | ✓ | |
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
| `error-13` responder otra magnitud | | ✓ | ✓ |

**Revisión completa del catálogo (2026-08-17).** Las 13 descripciones se
sometieron una por una a casos borde —bases 0, 1 y negativas; exponentes 0,
negativos y fraccionarios; radicandos no cuadrados; índices pares e impares— en
una auditoría corrida en hilo aislado, después de que la redacción de L2
destapara tres afirmaciones falsas de corrido. Resultado: **cinco entradas
quedaron intactas** (`error-6`, `error-7`, `error-8`, `error-10`, `error-13`) —con
la salvedad de `error-7`, que salió intacto de **esta** revisión pero se corrigió
poco después, en el mismo commit `74b493d`, cuando la tercera corrida de la
auditoría matemática mostró que «salvo en el caso en que m = n» seguía siendo
falso con bases negativas; su redacción vigente es la de la lista de abajo— y
**ocho se corrigieron** (`error-1` a `error-5`, `error-9`, `error-11`,
`error-12`). Ningún ejemplo numérico estaba mal calculado: los 13 recálculos
desde cero dan lo que su descripción dice. Todos los defectos estaban en las
frases explicativas y en los cuantificadores absolutos —«nunca», «solo»,
«ningún»—, que es donde una regla escrita para que se entienda se vuelve una
promesa que no se cumple. El más grave era `error-3`, cuya frontera con
`error-2` estaba invertida y afirmaba de `error-2` lo contrario de su propia
definición dos entradas más arriba; es además el texto que alimenta el paso de
autoexplicación, cuya única función es separar esos dos errores.

**Restricciones de diseño de distractores que dejó esa revisión.** No son
defectos de redacción, pero si se pierden entre el documento y el JSON producen
ítems con dos respuestas correctas (`colision-distractor-correcta`, 🔴):

- **`error-9`:** `2√18` **vale exactamente lo mismo** que `6√2`. Todo ítem que
  use este error tiene que pedir la expresión completamente descompuesta, nunca
  «¿cuánto vale?».
- **`error-12`:** con `√4` y `√0` el método equivocado acierta por casualidad
  (`4 ÷ 2 = 2 = √4`). Prohibidos como radicandos de este error.
- **`error-3`:** con `m = n = 2`, o con base 0 o 1, sumar y multiplicar
  exponentes dan el mismo resultado. Prohibidos.

**Convención de conteo, para toda copia al JSON:** se escribe «aparece N veces»
o «usado como factor N veces», que se lee sin ambigüedad como N factores. **No
se usa «multiplicado por sí mismo N veces»**, que se lee como N+1 factores. La
única forma admitida de esa expresión es el idiom de dos factores, «el número
que multiplicado por sí mismo da 5».

**Descripciones (redacción final, se copian literales al JSON):**

- **`error-1`** — Leer la potencia como una multiplicación entre la base y el
  exponente: calcular `2⁵` como `2 · 5 = 10`, o `3⁴` como `12`. El exponente no
  es un factor: cuando es un número natural dice cuántas veces aparece la base
  multiplicándose, no por cuánto se multiplica.

- **`error-2`** — Sumar los exponentes cuando las bases no son la misma: tratar
  `2³ · 3⁴` como si fuera una sola potencia de exponente 7. La regla de sumar
  exponentes describe qué pasa cuando **se repite el mismo factor**; para usarla,
  las dos potencias tienen que estar escritas con la misma base, y 2 y 3 no lo
  están.

- **`error-3`** — Aplicar a la operación equivocada la regla que corresponde a la
  otra: el mecanismo es uno solo, no saber cuál operación entre potencias se
  traduce en cuál operación entre exponentes. Aparece igual en las dos
  direcciones —convertir `aᵐ · aⁿ` en `a^(m·n)` o convertir `(aᵐ)ⁿ` en
  `a^(m+n)`— y la señal es siempre la misma: se eligió la operación de exponentes
  antes de mirar qué se estaba haciendo con las potencias. Se distingue de
  `error-2` en que acá la base **sí** es la misma: lo que falló no es cuál base,
  sino cuál regla.

- **`error-4`** — Leer el exponente negativo como si el signo pasara al
  resultado: calcular `2⁻³` como `−8` en vez de `1/8`. Con base positiva, bajar
  escalones nunca cambia de signo, solo divide: el signo menos del exponente dice
  «dividir», no «negativo».

- **`error-5`** — Dar `a⁰ = 0`, leyendo el exponente cero como «no queda nada».
  Con cualquier base distinta de 0, bajar un escalón divide por la base: desde
  `5¹ = 5`, bajar uno da `5 ÷ 5 = 1`. El escalón cero vale 1, no 0. Se distingue
  de `error-4`, que es sobre el signo de los escalones de más abajo.

- **`error-6`** — En una potencia o raíz de base fraccionaria, operar solo una
  parte de la fracción: al elevar, dar `(2/3)³ = 8/3` (solo el numerador) o
  `= 2/27` (solo el denominador); al sacar raíz, dar `√(9/25) = 3/25` (solo el
  numerador) o `= 9/5` (solo el denominador). La base o el radicando es la
  fracción completa: el exponente o la raíz se aplica arriba y abajo.

- **`error-7`** — Cambiar de lugar el índice y el exponente al pasar entre raíz y
  potencia: leer `a^(m/n)` como `ᵐ√(aⁿ)` en vez de `ⁿ√(aᵐ)`. El denominador del
  exponente es el índice de la raíz y el numerador es el exponente del radicando;
  invertirlos da otro número: con una base positiva distinta de 1, las dos
  lecturas solo coinciden cuando `m = n`.

- **`error-8`** — Repartir la raíz sobre una suma o una resta: dar
  `√(a + b) = √a + √b`. Las propiedades heredadas de las potencias reparten sobre
  productos y cocientes, no sobre sumas: primero se resuelve lo que está dentro de
  la raíz y después se saca la raíz.

- **`error-9`** — Descomponer a medias: extraer un factor con raíz exacta que no
  es el mayor posible y quedarse ahí, como dar `√72 = 2√18` sin notar que 18
  todavía tiene un factor cuadrado. La extracción está bien hecha; lo que falta es
  seguir hasta que el radicando ya no tenga ningún factor mayor que 1 cuya raíz
  **de ese mismo índice** sea exacta. Se distingue de `error-10`, donde el paso
  mal hecho es la extracción misma.

- **`error-10`** — Sacar el factor de la raíz sin sacarle la raíz: pasar de
  `√(36 · 2)` a `36√2` en vez de `6√2`. Lo que sale afuera es la raíz del factor,
  no el factor.

- **`error-11`** — Sumar radicales que no son el mismo, como si fueran términos
  semejantes: dar `2√3 + 3√2 = 5√5`. Solo se pueden juntar los que, **ya
  descompuestos**, quedan con el mismo índice y el mismo radicando; `√3` y `√2` no
  se pueden descomponer más y son dos números distintos, igual que `x` e `y` en
  álgebra.

- **`error-12`** — Confundir sacar la raíz con dividir por el índice: dar
  `√36 = 18` o `³√27 = 9`. La raíz busca un número que, usado como factor tantas
  veces como dice el índice, dé el radicando —`6 · 6 = 36`, `3 · 3 · 3 = 27`—;
  dividir no responde esa pregunta.

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
(que sí miden algo) y salvo dos campos de L2 —`baldosasPorLadoDelPatio` y
`baldosasPorLadoTrasRearmar`— que cuentan baldosas y sí llevan `unidad`, excepción
declarada al redactar L2 (2026-08-17) porque adimensionalizarlos habría hecho
pasar el chequeo mintiendo, exactamente lo que este párrafo prohíbe en la
dirección opuesta. Cada campo adimensional se declara en
`auditoria.camposAdimensionales` con su motivo de ≥20 caracteres; inventarles
una unidad haría pasar el chequeo
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
| L2 | **(a)** patio cuadrado embaldosado: lado a partir del total de baldosas. — **LIMPIO** (ver nota de reemplazo abajo). **(b)** diagonal de una pantalla a partir de sus lados. — **LIMPIO**. **(c)** arista de un envase cúbico a partir de su volumen. — **LIMPIO**. | En (a) la consulta original dio hit en «lado del cuadrado» y el veredicto LIMPIO se obtuvo **reinterpretando ese hit**; ese veredicto queda **anulado**. Se rehizo excluyendo el término (2026-08-17, NO en los cinco) y ese hit terminó resuelto por lectura real de los tres archivos donde aparece, sin similitud sustancial en ninguno (2026-08-18). Detalle abajo. En (b) «pulgadas» da hit en `TR01_Numeros_Taller_Repaso`, pero es un problema de escala de mapa/proporcionalidad — dominio distinto. (c) sin hits, pero sigue reservado: pisa el terreno del módulo 11 (Cuerpos geométricos), motivo de reparto interno, no de colisión. Dominio elegido: (a). |
| L3 | **(a)** escalas de tamaño en potencias de diez, de lo microscópico a lo grande — **LIMPIO, aprobado inicialmente**. **(b)** ~~capacidad de almacenamiento digital en potencias de dos~~ — **BOTADO (colisión)**. **(c)** ~~códigos de un casillero: `sᵏ` y su raíz `k`-ésima~~ — **BOTADO (veredicto manual)**. **(d)** ~~rebote de una pelota en el gimnasio del colegio~~ — **BOTADO (colisión real, post-redacción, ver nota abajo)**. **(e)** *dominio elegido* — **LIMPIO**: medicamento que se elimina del organismo por intervalos. Se conoce la dosis inicial y, cada intervalo, el organismo elimina una fracción fija de la dosis presente, dejando cada vez una fracción fija `r` respecto al intervalo anterior — dato entregado en el enunciado, no un modelo de vida media real. Ida: dosis tras `n` intervalos = `D·rⁿ`, con `r` racional simple (1/4, 1/5, 1/3). Vuelta: se conocen dosis inicial, dosis final y cuántos intervalos hubo, y falta `r = ⁿ√(D_final / D_inicial)`. | **(a)** volvió limpio en las dos tandas y quedó aprobado en este documento, pero **no fue el dominio que terminó redactado**: en la sesión de redacción se usó (d) en su lugar, por decisión explícita de Benja (ver nota de la lección, `_notasInternas` del JSON hasta el reemplazo) — (a) sigue limpio y disponible pero no se usó. **(b)** COLISIÓN contra `MA-03_Numeros_Reales.md` (subcarpeta `Material/`): la fuente ya cubre el mismo escenario de capacidades en potencias de dos que la lección iba a montar. Se abandona entero, no se ajusta (§6.1). **(c)** no lo bota el script sino el veredicto manual: el corpus (`06-bibliografia-y-anexos.md`, subcarpeta `mineduc-curriculum/`) ancla la expresión «combinaciones posibles» al conteo sin orden del eje de Combinatoria, y un código de candado es multiplicativo **con** orden y repetición; el riesgo es que el estudiante importe la fórmula equivocada desde otro eje. **(d)** volvió LIMPIO en las dos tandas de consulta léxica de esta sección (líneas de abajo) y se redactó el archivo completo sobre este dominio — pero **tuvo colisión real, detectada después de redactado**: un ítem DEMRE 2024 en `Material/MA-02_Numeros_Racionales.md:106` cubre el mismo escenario de rebote con el mismo mecanismo. El chequeo léxico de esta sección no lo detectó porque las frases consultadas («rebote de la pelota», «altura del rebote», etc.) no coinciden con cómo está redactado ese ítem — la colisión real es de mecanismo y escenario, no de las palabras exactas consultadas. Se descartó el archivo completo (2026-08-21), sin ajustar ninguna cifra (§6.1: un candidato que colisiona se abandona entero). **(e)** hereda el rol de (d): potencia y raíz en las dos direcciones, sin constante física —`r` es un dato medido que entrega el enunciado, no una cifra del mundo—, sin combinatoria y sin almacenamiento digital. Verificado LIMPIO en la primera tanda (medicamento, dosis, torrente sanguíneo, metabolismo, eliminación, fármaco: NO; organismo: SI con 3 hits, resueltos LIMPIO por lectura profunda del subagente `auditor-originalidad`, único con permiso sobre `fuentes-analisis-aisladas/`: los tres hits son lenguaje curricular genérico o de otro mecanismo). Es el dominio con el que se redactó la lección el 2026-08-21. Riesgo que se arrastra igual que (d): su mecanismo (multiplicar repetidamente por un factor fijo) es el mismo de «población que se duplica» y de un modelo de vida media real, así que el enunciado cuida explícitamente que `r` sea un dato entregado, nunca derivado de una fórmula de decaimiento. **Regla que dejan los cuatro descartes:** un dominio sirve para L3 solo si su pregunta inversa natural es «¿por cuánto multiplica cada paso?» —raíz enésima— y no «¿cuántos pasos?», que es logaritmo y está fuera del temario M1; y un veredicto LIMPIO de consulta léxica no blinda contra una colisión de mecanismo/escenario descubierta por lectura real — (d) es el caso de referencia. |

**Comandos para correr fuera de la sesión** (uno por candidato; la sesión de
redacción no los ejecuta, y la salida se pega tal cual la imprime el script):

```
node scripts/consultar-fuentes.mjs "microscopio" "aumento" "escalones de aumento" "objetivo del microscopio" "imagen a tamaño real"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "copia de una imagen" "resolución de la imagen" "mitad del lado" "cada copia"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "campeonato de ajedrez" "rondas de eliminación" "octavos de final" "equipos que quedan"   # corrido: LIMPIO

node scripts/consultar-fuentes.mjs "baldosas" "patio cuadrado" "lado del cuadrado" "cuántas baldosas por lado"   # ANULADA, ver §f "Ronda 1 rehecha"
node scripts/consultar-fuentes.mjs "diagonal de la pantalla" "pulgadas" "ancho y alto de la pantalla"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "envase cúbico" "arista del cubo" "volumen del envase"   # corrido: LIMPIO

node scripts/consultar-fuentes.mjs "potencias de diez" "orden de magnitud" "notación científica" "tamaño de una célula"   # corrido: LIMPIO
node scripts/consultar-fuentes.mjs "rebote de la pelota" "altura del rebote" "cada rebote alcanza" "altura inicial"   # corrido: LIMPIO — colisión real igual, ver §f
```

**Reemplazo de dominio L3 (2026-08-21) — primera tanda del candidato (e).** Corrida por
Benja fuera de esta sesión, mecanismo 2 de `CLAUDE.md`:

```
node scripts/consultar-fuentes.mjs "medicamento" "dosis" "torrente sanguíneo" "metabolismo" "eliminación" "fármaco" "organismo"
```

```
medicamento: NO
dosis: NO
torrente sanguíneo: NO
metabolismo: NO
eliminación: NO
fármaco: NO
organismo: SI (3 archivo(s): Material/MA-34_Potencia_Ecuacion_Exponencial.md, mineduc-curriculum/2027-26-03-19-temario-paes-regular-m1.md, pdv-terceros/MA-34_Potencia_Ecuacion_Exponencial.md)
```

Los tres hits de «organismo» se resolvieron con lectura profunda sancionada del
subagente `auditor-originalidad` (único con permiso sobre
`fuentes-analisis-aisladas/`): los tres son lenguaje curricular genérico o de otro
mecanismo — ninguno es un ítem con el mecanismo dato inicial → fracción fija
repetida n veces → valor final de este candidato. Veredicto: **LIMPIO**.

**Segunda tanda — cifras y frases exactas del archivo redactado, pendiente de
correr por Benja:**

```
node scripts/consultar-fuentes.mjs "dosis inicial de 1024 miligramos" "el organismo elimina" "cada intervalo de tiempo" "dosis que queda en el organismo" "medicamento que se elimina del organismo"
```

Salida todavía no registrada en este documento. Hasta que vuelva, el dominio (e)
queda LIMPIO en la primera tanda solamente — mismo estado en el que estaba (d)
antes de su colisión real, así que no se firma el módulo como aprobado sin este
segundo resultado.

Cuando esté elegido el dominio de cada lección se corre una segunda tanda con las
**cifras y frases exactas** del enunciado, antes de fijar los números en el JSON.

**Salida cruda de la fila L2(a), levantada por la 5ª corrida de la auditoría de
originalidad (2026-08-18).** La tabla de arriba resumía el resultado de las ocho
filas sin pegar la salida del script en ningún caso; `proveniencia` afirma que
las cinco rondas tienen «salida cruda completa», lo cual era falso para esta.
Reejecutada:

```
node scripts/consultar-fuentes.mjs "180 baldosas" "patio cuadrado" "lado del patio" "raíz cuadrada de 180"
```

```
180 baldosas: NO
patio cuadrado: NO
lado del patio: NO
raíz cuadrada de 180: NO
```

**Segunda tanda — cifras y frases exactas (Pendiente 4, resuelta).** Ocho de
ocho candidatos, **LIMPIO, sin hits** en los cuatro términos de cada uno. Las
cifras núcleo usadas en la consulta quedan confirmadas como base de redacción
para cada candidato; no se abren de nuevo salvo hallazgo en redacción.

| Candidato | Cifras/frases núcleo consultadas | Veredicto |
|---|---|---|
| L1(a) microscopio | «aumento 4 veces», «escalón del microscopio», «imagen a tamaño real», «1024 aumentos», «un dieciseisavo del aumento» | LIMPIO |
| L1(b) copia de imagen | «mitad del lado de la imagen», «copia guardada», «un octavo del lado original», «1024 píxeles de lado», «resolución original de la imagen» | LIMPIO |
| L1(c) campeonato de ajedrez | «64 jugadores de ajedrez», «ronda de eliminación», «octavos de final», «cuartos de final», «queda la mitad de los jugadores» | LIMPIO |
| L2(a) baldosas | «180 baldosas», «patio cuadrado», «lado del patio», «raíz cuadrada de 180» | LIMPIO |
| L2(b) diagonal de pantalla | «diagonal de 50 pulgadas», «pantalla cuadrada», «lado de la pantalla», «diagonal de la pantalla como raíz» | LIMPIO |
| L2(c) envase cúbico | «envase cúbico de 125 cm³», «arista del envase», «raíz cúbica del volumen», «volumen del envase en cm³» | LIMPIO |
| L3(a) potencias de diez | «10 elevado a menos 6 metros», «tamaño de una célula», «10 elevado a 9 metros», «orden de magnitud», «escala de tamaños» | LIMPIO |
| L3(d) rebote de pelota | «altura inicial de 2 metros», «cada rebote alcanza la mitad», «después de 4 rebotes», «altura final del rebote», «rebote de la pelota en el gimnasio» | LIMPIO en la consulta léxica — **colisión real igual, ver nota de descarte en §f: `Material/MA-02_Numeros_Racionales.md:106`, ítem DEMRE 2024, detectada por lectura, no por esta consulta** |
| L3(e) medicamento en el organismo | Primera tanda (términos genéricos, corrida por Benja): «medicamento», «dosis», «torrente sanguíneo», «metabolismo», «eliminación», «fármaco» → NO; «organismo» → SI, 3 hits, resueltos LIMPIO por `auditor-originalidad` (detalle en §f). Segunda tanda (cifras y frases exactas del archivo redactado): **pendiente**, comando abajo. | Primera tanda LIMPIO. Segunda tanda pendiente de correr. |

**Ronda 1 rehecha para L2(a) — el veredicto original era inválido (2026-08-17).**

**Qué estaba mal.** La ronda 1 sobre el dominio del patio embaldosado se registró
como LIMPIO, pero la consulta **había dado hit** en «lado del cuadrado». El
veredicto se obtuvo interpretando ese hit como «término técnico genérico de
Perímetros y Áreas, no del escenario baldosas/patio». Esa interpretación es
inválida por dos razones independientes, y la auditoría de originalidad de L2 la
levantó:

1. **`CLAUDE.md` lo prohíbe textualmente:** «Nunca inferir el tipo de colisión a
   partir del nombre de archivo o la subcarpeta». El script no distingue colisión
   de dominio de colisión de plantilla —esa clasificación exigiría leer el
   corpus, que está prohibido—, así que el único registro válido es el veredicto
   crudo.
2. **`docs/calibracion-lecciones-e-items.md` §6.1, paso 3:** «Si vuelve SÍ en
   cualquiera de las tres dimensiones, descartar el candidato completo — no
   ajustarlo», con la nota de §6.1 sobre que «salvar» un candidato
   reinterpretándolo ya había fallado dos veces en L1.

O sea que el dominio de L2 se estaba sosteniendo sobre exactamente el patrón de
fallo que el proyecto documentó y prohibió. **Ese veredicto queda anulado.**

**Ronda rehecha.** Se volvió a consultar con los términos del escenario tal como
quedaron en el archivo, **sin** «lado del cuadrado», sobre la premisa de que no
aparecía en el texto final de la lección. Mecanismo 2 de `CLAUDE.md`, corrida por
Benja fuera del hilo de redacción.

```
node scripts/consultar-fuentes.mjs "baldosas" "patio cuadrado" "baldosas por lado" "lado del patio" "patio del colegio"
```

Salida, pegada tal cual la imprime el script y sin reformular:

```
baldosas: NO
patio cuadrado: NO
baldosas por lado: NO
lado del patio: NO
patio del colegio: NO
```

**Veredicto: LIMPIO, cinco de cinco, sin hits y sin interpretación de por medio.**
Este resultado reemplaza al de la ronda 1 original y es el que sostiene la
elección del dominio (a) para L2.

**El estándar que deja este episodio.** Un hit no se argumenta: se registra crudo
y bota el candidato. Si se sospecha que el hit viene de un término genérico y no
del escenario, lo que se hace es **volver a consultar sin ese término** —como
acá— y no explicar por qué el hit no cuenta. La diferencia no es de forma: la
primera vía deja una decisión sin evidencia y la segunda produce evidencia nueva.

**Corrección de la premisa de exclusión, levantada por la cuarta corrida de la
auditoría de originalidad (2026-08-18).** La premisa de arriba —que «lado del
cuadrado» «no aparece en el texto final de la lección»— era falsa: el
`feedbackPorDefecto` del paso 8 dice literal «busca el lado del cuadrado que las
usa todas», texto que el estudiante lee. Excluir de la consulta un término que sí
está en el texto es exactamente la clase de argumento sin evidencia que este
episodio prohíbe, solo que en la dirección de la exclusión en vez de la
reinterpretación. Se corrige resolviendo el término por lectura, no
excluyéndolo de nuevo.

```
node scripts/consultar-fuentes.mjs "lado del cuadrado"
```

```
lado del cuadrado: SI (5 archivo(s): Material\1693-MA17_-_Perímetros_y_Áreas_I.md, Material\MOD-04_Vectores_Isometrias_Cuerpos.md, mineduc-curriculum\02-unidad-1-numeros.md, pdv-terceros\1693-MA17_-_Perímetros_y_Áreas_I.md, pdv-terceros\MOD-04_Vectores_Isometrias_Cuerpos.md)
```

Tres documentos únicos —`Material/` y `pdv-terceros/` vuelven a ser el mismo par
duplicado, confirmado con `cmp`—, los tres abiertos y leídos:

- `1693-MA17_-_Perímetros_y_Áreas_I.md:137` — «Si el lado del cuadrado mide *m*
  y el ancho del rectángulo mide *n*, ¿cuánto mide el largo del rectángulo?»,
  sobre un cuadrado y un rectángulo de igual perímetro. Incógnitas literales,
  sin baldosas ni conteo.
- `MOD-04_Vectores_Isometrias_Cuerpos.md:44` — traslación de un cuadrado
  mediante un vector de módulo igual al lado. Dominio de isometrías y vectores,
  ajeno por completo.
- `mineduc-curriculum/02-unidad-1-numeros.md:116-118` — el mismo tramo del OA 4
  que la ronda 5 ya examinó («Marco de madera», «¿Es cuadrado perfecto?»,
  «Tabla de raíces exactas»): descriptores de actividad curricular de una
  línea, sin enunciado redactado, área en m² y no baldosas.

**Veredicto: SIN SIMILITUD SUSTANCIAL en los tres.** Ninguno tiene patio,
baldosas contadas ni conserje; dos son de dominio matemático ajeno (perímetro
algebraico, isometrías) y el tercero es el descriptor curricular ya resuelto en
la ronda 5. El hit que anuló la ronda 1 original queda resuelto por lectura real
—el mismo mecanismo de las rondas 4 y 5—, no por la premisa falsa de que el
término no aparecía en el texto.

**Tercera tanda — cifras de L2 que la segunda no cubría (2026-08-17).** Al
redactar L2 se eligió el dominio (a), patio embaldosado, y los pasos 2 y 8
necesitaron totales que dieran lado entero: 196 y 225. La segunda tanda solo
había confirmado el 180, que es la cifra del paso 7. Se corrió una tercera
consulta con las cifras y frases nuevas, con el mecanismo 2 de `CLAUDE.md`
—ejecutada por Benja fuera del hilo de redacción—, **antes** de fijar esos
números en el JSON.

```
node scripts/consultar-fuentes.mjs "196 baldosas" "225 baldosas" "patio rectangular de baldosas" "rearmar el patio"
```

Salida, pegada tal cual la imprime el script y sin reformular:

```
196 baldosas: NO
225 baldosas: NO
patio rectangular de baldosas: NO
rearmar el patio: NO
```

| Candidato | Cifras/frases consultadas | Veredicto |
|---|---|---|
| L2(a) baldosas, cifras de los pasos 2 y 8 | «196 baldosas», «225 baldosas», «patio rectangular de baldosas», «rearmar el patio» | LIMPIO |

**Por qué queda escrito acá y no solo en el JSON.** La auditoría de originalidad
de L2 (2026-08-17) rechazó el archivo por este punto exacto: la lección
declaraba en su `proveniencia` que la consulta se había corrido, pero no había
ningún rastro en el repositorio —ni entrada en esta sección, ni commit—, así que
el único respaldo era la afirmación del propio redactor, que es justo lo que la
regla de aislamiento manda no aceptar como evidencia. Las rondas 1 y 2 sí eran
verificables porque quedaron en el commit `fe410f5`. El estándar que deja este
hallazgo: **una consulta que no está en este documento no existe**, y la ronda se
registra acá antes de commitear el contenido que la usa.

**Cuarta ronda — el singular «baldosa» (2026-08-18).** Las tres tandas
anteriores consultaron siempre el plural, «baldosas», que es como aparece la
palabra en el texto de la lección. El script hace `includes` sobre el texto en
minúsculas, así que «baldosas» encuentra cualquier ocurrencia del plural pero
**no** las del singular. Ese hueco lo destapó la auditoría de originalidad y se
cerró con una cuarta corrida, mecanismo 2 de `CLAUDE.md`, ejecutada por Benja
fuera del hilo de redacción.

```
node scripts/consultar-fuentes.mjs "baldosa"
```

Salida, pegada tal cual la imprime el script y sin reformular:

```
baldosa: SI (4 archivo(s): Material\MA-11_Planteamientos.md, Material\MOD-07_Algebra_Funciones_III.md, pdv-terceros\MA-11_Planteamientos.md, pdv-terceros\MOD-07_Algebra_Funciones_III.md)
```

**Nota sobre el registro.** La primera vez que esta ronda se anotó acá, lo que
había entrado a la sesión era un resumen en prosa —«SI en 4 archivos, dos de
ellos…»— y no las líneas del script, así que quedó escrita como limitación
declarada. La auditoría de originalidad reejecutó el comando y la salida cruda de
arriba es la que corresponde; con ella el hueco se cierra. Los 4 archivos son 2
documentos en 2 copias: `Material/` y `pdv-terceros/` guardan el mismo par, y
`cmp` confirma que las dos copias de cada uno son **byte-idénticas**. Los dos
archivos que el veredicto examina cubren, por lo tanto, el 100 % del contenido
único con hit.

**Resolución del hit — veredicto crudo, pegado sin reformular:**

```
SIN SIMILITUD SUSTANCIAL

- En MA-11_Planteamientos.md:120 el hit es el verbo "embaldosa": terreno rectangular de lados algebraicos $(2x-1)$ y $(x+6)$ con una piscina interior; se da el área embaldosada (148 m²) y se pide $x$ resolviendo una ecuación cuadrática por diferencia de áreas.
- En MOD-07_Algebra_Funciones_III.md:209 es el mismo tipo de ítem DEMRE (2017): terreno $4x$ por $(2x+2)$, piscina interior, área embaldosada 136 m², y se pide cuál ecuación permite determinar $x$ — planteamiento algebraico, ni siquiera resolución.
- Ninguno menciona baldosas contadas, patio cuadrado, ni raíz cuadrada: no hay total de piezas, no hay lado, no hay conserje. La coincidencia es léxica ("embaldosar" como verbo de superficie) y el dominio matemático es distinto — producto de binomios / cuadrática con incógnita lineal, frente a $\sqrt{196}$ y $\sqrt{225}$ como número de baldosas por lado en L2(a).
```

**Por qué acá sí se resuelve leyendo y en la ronda 1 no se podía.** No es la misma
operación. En la ronda 1 lo que se hizo fue **argumentar un hit sin abrir nada**,
infiriendo el tipo de colisión desde el nombre del módulo de procedencia, que es
justo lo que `CLAUDE.md` prohíbe. Acá se abrieron los dos archivos y se comparó
enunciado contra enunciado, con permiso explícito de lectura profunda y en un hilo
separado del de redacción. La regla que deja el episodio de la ronda 1 sigue
intacta: un hit no se argumenta desde el metadato; o se bota el candidato, o se
consigue evidencia nueva —consultando de nuevo sin el término genérico, como en la
ronda 1 rehecha, o leyendo la fuente, como acá—.

| Candidato | Término consultado | Veredicto |
|---|---|---|
| L2(a) baldosas, singular | «baldosa» | HIT en 4 archivos → resuelto SIN SIMILITUD SUSTANCIAL sobre los 2 archivos nombrados |

**El dominio (a) se sostiene.** Con esto queda cerrado el punto de la ronda 1 que
la segunda corrida de la auditoría de originalidad dejó abierto.

**Quinta ronda — las cifras desnudas (2026-08-18).** La auditoría de originalidad
levantó que ninguna de las cuatro rondas anteriores había consultado nunca una
cifra sola. La ronda 3 consultó «196 baldosas» y «225 baldosas», compuestos que
por coincidencia literal tenían que dar NO, y las cifras de la tabla del paso 4
—100, 121, 144, 169— no aparecían en ninguna ronda.

```
node scripts/consultar-fuentes.mjs "196" "225" "121" "144" "169" "100" "180" "324" "lado de cuadrados" "área del cuadrado"
```

Salida, resumida solo en el recuento de archivos porque el script imprime la lista
completa y varias pasan de treinta entradas; los veredictos van tal cual:

```
196: SI (3 archivos)     225: SI (3 archivos)     121: SI (5 archivos)
144: SI (19 archivos)    169: SI (4 archivos)     100: SI (58 archivos)
180: SI (34 archivos)    324: NO
lado de cuadrados: SI (1 archivo: mineduc-curriculum\02-unidad-1-numeros.md)
área del cuadrado: SI (9 archivos)
```

**Lo primero que deja esta ronda es que una cifra sola no es una consulta de
colisión.** El script hace `includes` sobre el texto completo, así que «100»
encuentra también 1100, 100 %, 2100 y cualquier otro número que la contenga: 58
archivos de 60 y pico es ruido léxico, no señal de dominio. Lo mismo con 180 y
con 144. Esa clase de término no discrimina y **no se vuelve a correr sola**; la
consulta útil es la frase, como en las rondas 1 a 4. Queda escrito para que la
próxima lección no repita el barrido creyendo que prueba algo.

**El único término con señal, y su hit.** «lado de cuadrados» da exactamente 1
archivo. Leído a fondo: `mineduc-curriculum/02-unidad-1-numeros.md:118`, OA 4,
actividad 3, «Tabla de raíces exactas», que lista áreas en m² para calcular el
lado —entre ellas 121, 144 y 225—.

**Veredicto: SIN SIMILITUD SUSTANCIAL.** Es un descriptor de actividad del
currículum MINEDUC, o sea una tarea enunciada en una línea, sin enunciado
redactado, sin contexto y sin figura: idea, no expresión. Las cifras que se
solapan son 121, 144 y 225, que son 11², 12² y 15², hechos aritméticos y no
elecciones de redacción; de las cinco filas de la tabla del paso 4, 100 y 169 no
están en la lista del MINEDUC. Y la magnitud es distinta: allá son m² de área,
acá es conteo de baldosas. Del patio, las baldosas y el conserje no hay nada. Se
suma que el currículum MINEDUC es fuente de calibración autorizada por MOS §7.1,
igual que el temario DEMRE.

| Candidato | Términos consultados | Veredicto |
|---|---|---|
| L2(a), cifras desnudas y frases de cuadrado | 196, 225, 121, 144, 169, 100, 180, 324, «lado de cuadrados», «área del cuadrado» | Cifras solas: ruido léxico, sin valor de señal. «lado de cuadrados»: 1 hit → SIN SIMILITUD SUSTANCIAL |

**Sexta ronda — el segundo escenario y el vocabulario matemático propio
(2026-08-18).** La 5ª corrida de la auditoría de originalidad notó que ninguna
de las cinco rondas anteriores había consultado nunca el sustantivo del segundo
escenario del archivo —«terraza», del paso 8—, el personaje del primero
—«conserje», del paso 2—, ni el vocabulario técnico de la lección —radicando,
índice de la raíz, raíz enésima, exponente fraccionario, forma más simple—, que
por no tener dominio en los ítems PAES ninguna ronda había alcanzado.

```
node scripts/consultar-fuentes.mjs "terraza" "terraza rectangular" "conserje" "radicando" "raíz enésima" "exponente fraccionario" "índice de la raíz" "forma más simple"
```

```
terraza: NO
terraza rectangular: NO
conserje: NO
radicando: NO
raíz enésima: NO
exponente fraccionario: NO
índice de la raíz: NO
forma más simple: NO
```

**Veredicto: LIMPIO, ocho de ocho, sin hits.**

**Séptima ronda — cambio de cifras del paso 8 tras firmar el archivo
(2026-08-18).** La séptima corrida de la revisión matemática notó que el total
original del paso 8 —225 baldosas, terraza 5 por 45, lado 15— es exactamente la
fila `[15, 225]` de la tabla de referencia del paso 4. Esa fila es necesaria ahí
—acota 14 entre 13² y 15² en la pista de nivel 3, y no se puede quitar sin
romper esa pista—, así que el paso 8 terminaba mostrando su propia respuesta dos
pasos antes. Se cambiaron las cifras del paso 8 a 5 por 80 (400 en total, lado
20), consultadas antes de escribirlas en el JSON.

```
node scripts/consultar-fuentes.mjs "400 baldosas" "5 por 80" "80 de largo" "terraza de 5 por 80"
```

```
400 baldosas: NO
5 por 80: NO
80 de largo: NO
terraza de 5 por 80: NO
```

**Veredicto: LIMPIO, cuatro de cuatro, sin hits.** El total anterior, 225,
seguía limpio (ronda 3): el cambio es de diseño pedagógico —evitar que la tabla
del paso 4 pre-responda el paso 8—, no una corrección de colisión.

Con las siete tandas cerradas, este documento queda **completo y firmado**: no
se reabre salvo hallazgo concreto en redacción, auditoría matemática o
auditoría de originalidad.

**Decisión de diseño sobre `_notasInternas` y `proveniencia` (potencias-raiz-escondida.json):**
después de varias corridas de auditoría cuyo único hallazgo eran desincronías
en cifras que las propias notas usaban para describirse a sí mismas —conteos
de entradas del catálogo, de distractores, de rondas de consulta, de corridas
de auditoría, shas de commit, fechas y nombre de autor—, se purgaron esos
números de ambos campos. Cada corrección de una cifra autorreferente creaba
una nueva desincronía en otra parte del mismo archivo: el defecto era del
diseño del archivo, no del contenido pedagógico. Los campos narrativos ahora
explican decisiones de diseño y su motivo (por qué este dominio, por qué esta
corrección, por qué esta excepción), pero no llevan cifras verificables sobre
el propio archivo o el repositorio. La verificación de esos hechos —cuántas
entradas tiene el catálogo, si un distractor colisiona, qué cambió y cuándo—
vive en los scripts (`npm run auditar`, `npm run validar`) y en el historial
de git, que son la fuente de verdad y no se duplican en prosa.

---

## g) `contextosNumericos` previstos

| Archivo | Contexto | Rango previsto (se cierra tras la consulta) |
|---|---|---|
| L1 | Dominio elegido en (f); números puros en los pasos 6 y 7 | Bases 2, 3, 4, 5 y fracciones simples (1/2, 2/3, 3/4); exponentes de −4 a 5 |
| L2 | Dominio elegido en (f) | Radicandos con factor cuadrado o cúbico exacto entre 8 y 200; índices 2 y 3 |
| L3 | Dominio con el que se redactó (2026-08-21): (e) medicamento en el organismo, tras el descarte por colisión real de (d) rebote de pelota | Fracciones simples 1/4, 1/5, 1/3; dosis en miligramos, potencias de esas fracciones entre exponente 1 y 12 |
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
   ajustando el enunciado. Dominio de L3 cerrado en este documento: (a) potencias
   de diez, con (d) rebote de la pelota como respaldo. Dominios de L1 y L2 siguen
   abiertos entre sus tres candidatos limpios cada uno; la elección final se hace
   al redactar cada lección, no bloquea el resto del documento.
7. **Reemplazo de dominio L3 (2026-08-21), no previsto al firmar este documento.**
   La lección se redactó con (d) rebote de la pelota en vez de (a), por decisión
   de Benja en la sesión de redacción. (d) tuvo colisión real confirmada, después
   de redactado, contra un ítem DEMRE 2024 en `Material/MA-02_Numeros_Racionales.md:106`
   — se descartó el archivo completo, sin ajustar cifras (§6.1). Dominio nuevo:
   (e) medicamento que se elimina del organismo por intervalos, LIMPIO en la
   primera tanda (detalle en §f). Pendiente la segunda tanda antes de dar el
   módulo por aprobado.
4. ~~Segunda tanda con las cifras y frases exactas del núcleo de cada
   lección.~~ **Resuelto.** Ocho de ocho candidatos LIMPIO (detalle en §f).
   Cifras núcleo confirmadas como base de redacción.
5. ~~Tercera tanda con las cifras de los pasos 2 y 8 de L2 (196 y 225), que la
   segunda no cubría.~~ **Resuelto el 2026-08-17.** Cuatro de cuatro términos
   NO (detalle y salida cruda en §f). Se agregó a raíz del rechazo de la
   auditoría de originalidad de L2, que detectó que la consulta se declaraba en
   el JSON sin dejar rastro verificable en el repositorio.
6. ~~Ronda 1 de L2(a), cuyo veredicto LIMPIO se había obtenido reinterpretando
   un hit en «lado del cuadrado».~~ **Anulada, rehecha el 2026-08-17 y ese hit
   resuelto por lectura el 2026-08-18** (los tres archivos donde aparece son
   ajenos: perímetro algebraico, isometrías, y el mismo descriptor curricular
   ya limpio de la ronda 5). Cinco
   de cinco términos NO, sin interpretación (detalle y salida cruda en §f).
   También sale del rechazo de la auditoría de originalidad de L2.

Con (1)-(4) resueltos, este documento de arquitectura queda completo y
cerrado. Empieza la redacción de L1. Cada lección va con `npm run validar` y
`npm run auditar` en verde y las dos auditorías —matemática y de
originalidad— corridas en hilo aislado del que redactó, antes de su commit.
