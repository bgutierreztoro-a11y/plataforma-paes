# Diseño del módulo: Cuerpos geométricos

**Id de tema:** `cuerpos-geometricos`. Eje: Geometría (módulo #11 de `docs/mapa-modulos-m1.md`).

**Verificación de colisión: NO ejecutada todavía.** Los candidatos de dominio de la sección correspondiente son propuestas para que Benja corra `node scripts/consultar-fuentes.mjs` fuera de sesión (mecanismo (2) de CLAUDE.md). Ningún JSON se escribe antes de ese veredicto.

**Este documento no asigna ids de `catalogoErrores`.** Los errores van numerados `P1`…`P12` («propuesta»), deliberadamente en otro namespace que `error-N`, y requieren firma aparte antes de convertirse en catálogo real (SKILL.md §1 regla 4).

Descriptores del temario (`docs/temario-demre-m1-2027.md:97-99`), citados textual:

```
- Área de superficies de paralelepípedos, cubos y cilindros.
- Volumen de paralelepípedos, cubos y cilindros.
- Problemas que involucren área y volumen de paralelepípedos, cubos y cilindros en diversos contextos.
```

---

## Objetivo del módulo

Que el estudiante calcule el área de superficie y el volumen de paralelepípedos, cubos y cilindros, entendiendo la superficie como la suma de las caras que aparecen al desplegar el cuerpo y el volumen como el área de la base repetida a lo alto; y que, ante un problema en contexto, decida **cuál de las dos magnitudes le están pidiendo** cuando el enunciado no la nombra.

Esa última capacidad es la que el módulo aporta de nuevo al eje. Las dos fórmulas son mecánicas; lo que se evalúa en PAES es que «cuánta pintura», «cuánto cabe», «cuánto cartón» y «cuánta agua» se traduzcan a la magnitud correcta.

## Prerrequisito real, ya cubierto

`figuras-borde-y-superficie` (módulo #10, L2) declara entre sus `conceptos`:

```
"circunferencia (2 × π × radio) y área (π × radio²) de un círculo, con π ≈ 3,14"
```

O sea que el cilindro llega con sus dos piezas servidas por la lección inmediatamente anterior del mismo eje, y no hay que enseñarlas acá. Eso es lo que hace viable meter el cilindro desde L1 en vez de postergarlo.

Hay además una continuidad de estructura que conviene explotar y no repetir: el `objetivo` de esa misma lección dice «según si se pide superficie (área) o borde (perímetro)». La decisión de L3 —superficie o volumen— es la misma pregunta un nivel más arriba. L3 debe apoyarse en eso explícitamente, no redescubrirlo desde cero.

---

## Reparto de las 12 combinaciones

La grilla `paralelepipedo|cubo|cilindro × superficie|volumen × solido|desarrollo` tiene 12 celdas. **Ninguna lección toma más de 6**, y dos celdas quedan deliberadamente sin usar en lecciones.

| | pp·sup | pp·vol | cubo·sup | cubo·vol | cil·sup | cil·vol |
|---|---|---|---|---|---|---|
| **sólido** | L1 | L2 | L1 | L2 | L1 | L2 |
| **desarrollo** | L1 | — | L1 | — | L1 | — |

- **L1 se lleva las 6 de `superficie`** (los 3 cuerpos × las 2 vistas). Es el único lugar donde el desarrollo plano hace trabajo pedagógico: la red *es* el mecanismo del que sale la fórmula.
- **L2 se lleva las 3 de `volumen` en `solido`.**
- **Las 3 celdas `volumen × desarrollo` no se usan.** Una red no dice nada sobre cuánto cabe adentro — mostrarla en una lección de volumen sería decoración, y decoración que además sugiere lo contrario de lo que se está enseñando. El componente las admite (el campo es ortogonal), pero el contenido no las pide.
- **L3 no estrena celdas.** Reusa las de L1 y L2 según lo que pida cada problema, con la diferencia de que en L3 el estudiante ya no sabe de antemano cuál le toca. Ese es su contenido.

### Por qué L1 puede tomar 6 celdas sin romper «un descubrimiento por lección»

Las 6 celdas de L1 son **un solo descubrimiento aplicado tres veces**: «la superficie es el área de la red». Paralelepípedo → 6 rectángulos. Cubo → el caso donde los 6 son iguales, `6a²`. Cilindro → el caso sorprendente, donde el manto desenrollado resulta ser un rectángulo de ancho `2πr`.

El cilindro no es un segundo descubrimiento: es la prueba más convincente del primero, y sin él la regla parece un truco para cajas. Lo que L1 deja como pregunta abierta —y que resuelve L2— es otra cosa: *ya sé cuánto material lo envuelve; ¿cuánto cabe adentro?*

---

## Ids de lección

**L1 `cuerpos-desarmar-la-caja` — confirmado.** El slug nombra exactamente el mecanismo del descubrimiento (desplegar la red y sumar las caras), no un contexto ni un motivo decorativo. No hay razón para tocarlo.

**L2 `cuerpos-cuanto-cabe-adentro` — confirmado.** «Cuánto cabe adentro» es volumen dicho en lenguaje de estudiante, y es además la pregunta abierta con que cierra L1. El id y la progresión se refuerzan.

**L3 `cuerpos-hoja-al-cilindro` — propongo renombrar a `cuerpos-problemas-en-contexto`.**

El motivo «hoja → cilindro» (una hoja rectangular que se enrolla y se convierte en el manto) **es el descubrimiento de L1**, no el de L3: es justamente cómo se llega a `2πrh`. Un id de L3 que aluda a un motivo que estructura la L1 queda mintiendo sobre qué enseña esa lección, y además le roba el nombre a la parte más memorable de la primera.

Es exactamente el caso que `docs/mapa-modulos-m1.md` describe como el único donde sí conviene renombrar:

> La excepción es un id que todavía no tiene archivo y cuyo slug alude a un motivo ya usado por otra lección: ahí sí conviene renombrarlo antes de escribir el JSON, porque no hay nada que romper.

`cuerpos-hoja-al-cilindro` no tiene archivo. Y el nombre propuesto sigue la convención que el propio corpus ya usa para este mismo descriptor del temario: `enteros-problemas-en-contexto`, `potencias-problemas-en-contexto`. Precedente de renombre idéntico: `potencias-exponente-racional` → `potencias-problemas-en-contexto`, 2026-08-15, por esta misma razón.

**Requiere tu firma** y toca `lib/modulos.ts` (`IDS_LECCION` línea 85 y el tema línea 353), `docs/mapa-modulos-m1.md` y `scripts/auditar-leccion.mjs` (`MODULO_POR_LECCION`, que ya lo registré con el nombre viejo en `15b6253`). Si prefieres conservarlo, se conserva y no pasa nada grave: el costo es un slug que apunta al descubrimiento de otra lección.

---

## Objetivos por lección y progresión conceptual

**1. L1 `cuerpos-desarmar-la-caja` — Área de superficie de paralelepípedos, cubos y cilindros.**

*Objetivo:* que el estudiante calcule el área de superficie desplegando el cuerpo, y reconozca que la fórmula `2(ab + bc + ac)` no es una regla que memorizar sino la cuenta de seis rectángulos que se pueden ver y contar.

*Descubrimiento fijado:* la superficie de un cuerpo es el área de su red. Se llega desarmando, no aplicando.

*Qué es nuevo:* todo el módulo empieza acá. Se estrena el vocabulario (cara, arista, vértice, red/desarrollo) y la idea de que un cuerpo tridimensional se puede medir con herramientas del plano que el estudiante ya tiene del módulo #10.

*Pregunta abierta con que cierra, que resuelve L2:* ya sabemos cuánto material lo envuelve; ¿cuánto cabe adentro? ¿Es lo mismo? (No lo es, y el cubo de arista 6 —donde ambos números dan 216— es la trampa perfecta para plantearlo sin resolverlo. Ver la advertencia en el mapa numérico.)

**2. L2 `cuerpos-cuanto-cabe-adentro` — Volumen de paralelepípedos, cubos y cilindros.**

*Objetivo:* que el estudiante calcule el volumen entendiéndolo como **área de la base × altura**, y no como «multiplicar los tres números».

*Descubrimiento fijado:* el volumen es una capa repetida. Cuántos cubos unitarios entran en una capa (= área de la base), por cuántas capas caben a lo alto.

*Por qué así y no `largo × ancho × alto`:* esa formulación funciona para la caja y deja al cilindro como una fórmula aparte que hay que memorizar. «Área de la base × altura» es **una sola idea que cubre los tres cuerpos**: base rectángulo → `abc`; base cuadrado → `a³`; base círculo → `πr²h`. Un descubrimiento, tres casos, igual que L1.

*Qué se acumula de L1:* el vocabulario y la lectura del dibujo en perspectiva. Y una distinción que L1 dejó instalada: la superficie se mide en unidades cuadradas y el volumen en cúbicas, lo que da el primer control de sentido barato («si te dio cm², no es volumen»).

*Qué es nuevo:* la tercera dimensión como repetición, y las unidades cúbicas.

*Pregunta abierta con que cierra, que resuelve L3:* ninguno de los enunciados de L1 y L2 tuvo que decidir nada — el título de la lección ya decía cuál de las dos calcular. ¿Y cuando el enunciado no lo dice?

**3. L3 `cuerpos-problemas-en-contexto` — Problemas que involucren área y volumen en diversos contextos.**

*Objetivo:* que el estudiante decida cuál magnitud pide un problema que no la nombra, y recién entonces calcule.

*Descubrimiento fijado:* la pregunta a hacerse es si lo que se pide vive **en el borde o en el interior** del cuerpo. Pintar, forrar, etiquetar y recubrir son borde → superficie. Llenar, caber, contener y vaciar son interior → volumen.

*Qué se acumula:* las dos fórmulas completas, ya sin andamiaje. L3 no introduce ninguna fórmula nueva — es explícitamente una lección de traducción y decisión, que es lo que su descriptor DEMRE pide.

*Qué es nuevo:* (a) el criterio borde/interior; (b) problemas de dos pasos, donde una magnitud es dato para obtener la otra (p. ej. conocer el volumen y una dimensión para deducir otra, y con eso calcular superficie); (c) conversión de unidades de volumen, que es donde PAES pone la mitad de la dificultad real.

*Continuidad explícita a aprovechar:* `figuras-borde-y-superficie` ya entrenó la misma decisión un nivel abajo (área vs perímetro). L3 debe nombrarlo, no reinventarlo: es la misma pregunta con un cuerpo en vez de una figura.

**Un descubrimiento por lección:** L1 fija «la superficie es la red desplegada»; L2 fija «el volumen es la base repetida a lo alto»; L3 fija «borde o interior decide la fórmula». El cierre integra las tres.

---

## Catálogo de errores propuesto

**Propuesta, no catálogo.** Ids `P1`…`P12` a propósito, para que no puedan confundirse con `error-N` ni copiarse por accidente a un JSON. Cada uno lleva su mecanismo y el número exacto que produce sobre un caso base, de modo que sea verificable con `node -e` antes de escribir cualquier distractor (SKILL.md §2a).

Casos base usados en la columna de verificación: **caja 6×3×4** (S = 108, V = 72), **cubo de arista 4** (S = 96, V = 64), **cilindro r = 5, h = 20** con π ≈ 3,14 (tapas = 157, manto = 628, S = 785, V = 1570).

### Superficie

| id | Mecanismo | Produce |
|---|---|---|
| `P1` | Contar solo las caras que se ven en el dibujo en perspectiva (3 de 6) y sumar `ab + bc + ac` sin duplicar. | 54 en vez de 108 — exactamente la mitad. |
| `P2` | Sumar las tres dimensiones y duplicar, `2(a+b+c)`, trasladando la estructura del perímetro a un cuerpo. | 26 en vez de 108. |
| `P3` | En el cubo, contar solo las 4 caras laterales (`4a²`), olvidando tapa y base. | 64 en vez de 96 — colisiona con el volumen del mismo cubo, ver nota de riesgo abajo. |
| `P4` | En el cilindro, sumar el manto y **una sola** tapa: `πr² + 2πrh`. | 706,5 en vez de 785. |
| `P5` | En el cilindro, calcular solo el manto y olvidar las dos tapas: `2πrh`. | 628 en vez de 785. |
| `P6` | En el cilindro, usar el área del círculo donde va la circunferencia: manto `= πr² · h` en vez de `2πr · h`. | 1570 de manto en vez de 628. |
| `P7` | Usar el diámetro como si fuera el radio (o al revés) en cualquier fórmula del cilindro. | Con `d = 10` leído como radio: tapas 628 y manto 1256. Factor 4 y 2 respectivamente. |

### Volumen

| id | Mecanismo | Produce |
|---|---|---|
| `P8` | Sumar las tres dimensiones en vez de multiplicarlas: `a + b + c`. | 13 en vez de 72. |
| `P9` | En el cubo, multiplicar la arista por 3 en vez de elevarla al cubo: `3a`. | 12 en vez de 64. |
| `P10` | En el cilindro, usar la circunferencia como área de la base: `2πr · h`. | 628 en vez de 1570. |
| `P11` | Calcular la magnitud equivocada: entregar el área de superficie cuando se pide volumen, o al revés, con la fórmula correctamente aplicada. | Sobre la caja base: 108 donde va 72, o 72 donde va 108. |
| `P12` | Al pasar de m³ a litros, multiplicar por 100 en vez de por 1000 (arrastrar el factor de las unidades cuadradas). | 250 L en vez de 2.500 L para 2,5 m³. |

### Notas sobre la propuesta, para tu revisión

**`P3` y `P11` tienen riesgo de colisión y hay que vigilarlos.** `P3` sobre un cubo de arista 4 produce 64, que es el volumen de ese mismo cubo — si L1 y L2 comparten el cubo de arista 4, un distractor de `P3` valdría lo mismo que una respuesta correcta y `regla 3b` lo marcaría 🔴. Se resuelve usando aristas distintas en L1 y L2, o declarando `auditoria.colisionesPermitidas` con el motivo. Se decide al escribir, no acá.

**`P11` es el error central de L3** y probablemente el más valioso del módulo, pero es el que más fácil se vuelve ambiguo: hay que redactarlo de modo que quede claro que el mecanismo es *elegir mal la magnitud*, no *equivocarse en la cuenta*. Si un ítem tiene ambos defectos posibles, el `errorCatalogado` no sirve.

**`P9` se parece semánticamente a `error-1` de `potencias-multiplicar-corto`** («leer la potencia como una multiplicación entre la base y el exponente»). Los ids son locales al módulo, así que no hay conflicto técnico, pero conviene que la redacción de `P9` sea específica de la arista del cubo y no una regla general sobre potencias — si no, estaríamos duplicando un error de otro módulo con otro nombre.

**Cuáles esperaría que nazcan en cada archivo:** L1 pare `P1`–`P7`; L2 pare `P8`–`P10`; L3 pare `P11`–`P12` y reusa los anteriores donde el mecanismo calce. La numeración final tendrá que ser correlativa dentro del módulo (`error-1`…`error-12`) y respetar que cada archivo embeba solo el subconjunto que sus propios distractores usan, carácter a carácter (`docs/reglas-modulo.md` regla 5).

**Errores sin id.** Los conceptuales que no producen un número reproducible van con feedback artesanal y **sin** `errorCatalogado`, mismo patrón que `sistemas-2x2` y `funcion-cuadratica`: p. ej. «creer que dos cuerpos con la misma superficie tienen el mismo volumen», o «pensar que duplicar todas las aristas duplica el volumen». Ese último es un error PAES clásico y muy bueno; si termina apareciendo en 3+ distractores, paro y propongo un id propio en vez de inventarlo.

---

## Candidatos de dominio por lección

**No verificados.** Cada bloque trae la frase compuesta **y** las palabras sueltas más distintivas, porque buscar solo la frase no basta (SKILL.md §2c). Ordenados por prioridad dentro de cada lección; los de reserva están para reemplazar sin volver a parar si alguno da SI.

### L1 — superficie

1. **Farol de papel cilíndrico para una fiesta de barrio** — `farol`, `farolito`, `papel de seda`, `armazón`
2. **Forrar un parlante cúbico con tela acústica** — `parlante`, `tela acústica`, `forrar`
3. **Pintar los bloques de hormigón de una plaza** — `bloque de hormigón`, `hormigón`, `plaza`
4. *(reserva)* **Serigrafía sobre la cara de un banco de plaza** — `serigrafía`, `banco`

### L2 — volumen

1. **Llenar una piscina inflable del patio de un jardín infantil** — `piscina inflable`, `piscina`, `inflable`
2. **Acuario del laboratorio de biología** — `acuario`, `pecera`, `laboratorio de biología`
3. **Silo cilíndrico de granos** — `silo`, `granos`, `acopio` ⚠️ ver advertencia de proporciones abajo
4. *(reserva)* **Cuánta arena entra en un arenero techado** — `arenero`, `arena`

### L3 — problemas en contexto

1. **Termo cilíndrico: cuánto líquido lleva y cuánto aislante lo recubre** — `termo`, `aislante`, `aislación` — *es el mejor candidato del módulo:* un mismo objeto que admite las dos preguntas, que es literalmente el contenido de L3
2. **Bodega de un camión de mudanza** — `bodega`, `mudanza`, `camión`
3. **Estanque de agua de un techo** — ⛔ **descartado de antemano**, sin necesidad de consultar: «bidón/estanque de agua» ya figura en la lista de dominios usados de `docs/diseno-modulo-funcion-cuadratica.md`
4. *(reserva)* **Cámara de frío de un local de helados** — `cámara de frío`, `helados`

### Dominios prohibidos por reutilización interna (no hace falta consultarlos, ya están ocupados)

Del propio eje Geometría: velas y náutica (`vela mayor`, `trinquete`, `pujamen`, `pena`, `ollao`), techo de caseta, invernadero, patio rectangular, cancha, diagonal del patio. De otros módulos: caja de cartón para manualidades y cajas apiladas (⚠️ **especialmente peligroso acá**, porque este módulo trata sobre cajas — hay que evitar el *contexto* «caja de cartón» aunque el cuerpo geométrico sea un paralelepípedo), taller de esmaltes, auditorio y butacas, patio con baldosas, microscopio y perilla graduada, medicamento y dosis, barcazas y contenedores, feria del libro, entradas a evento, boletería, buceo, termómetro y refugio de montaña, huerto escolar, letrero-arco de gimnasio, dron de reparto, llaveros, campeonato de tenis de mesa, carteles, murales y tarros de pintura (⚠️ **`tarros` también es peligroso**: «cuánta pintura» es un contexto natural de superficie), bolsas de bolitas, jaulas de gatos.

### Comando propuesto para la PARADA 1

```
node scripts/consultar-fuentes.mjs "farol de papel" "farol" "papel de seda" "parlante" "tela acustica" "forrar" "bloque de hormigon" "hormigon" "serigrafia" "piscina inflable" "piscina" "acuario" "pecera" "silo" "granos" "arenero" "termo" "aislante" "aislacion" "bodega" "mudanza" "camara de frio" "helados"
```

---

## Mapa de contextos numéricos

### Hallazgo que condiciona todo lo demás

**El espacio de enteros chicos está agotado.** Medido el 2026-08-26 sobre los `contextosNumericos` de los 31 archivos de `content/`: hay 461 cifras distintas ocupadas, y **de 1 a 60 el único entero libre es el 51**.

Esto no es negligencia evitable, es aritmética: si las aristas de una caja son 6, 3 y 4, entonces la superficie es 108 y el volumen 72, y esos números no se eligen. El módulo va a generar `🟡 colision-entre-archivos` sí o sí. Conviene decirlo ahora y no descubrirlo en la Fase 8.

Es la agudización de un pendiente ya abierto: *«🟡 El espacio de cuadrados de dos cifras sin colisión numérica está casi agotado (abierta 2026-08-14)»*, que ya proponía distinguir «cifras que son datos de un contexto» de «cifras que son resultados aritméticos inevitables». Este módulo es el caso más puro de lo segundo que va a tener el corpus.

**Qué sí se controla, y es lo que voy a controlar:**
- `colision-entre-archivos` es 🟡, no bloqueante (`scripts/auditar-leccion.mjs:509`). No se persigue.
- `colision-distractor-correcta` (regla 3b) es 🔴 y es **intra-archivo**. Eso sí se garantiza, eligiendo ternas cuyas piezas derivadas no choquen entre sí.
- No repetir **escena** entre lecciones ni con el cierre. Eso es lo que realmente protege la originalidad; la cifra compartida no dice nada.

### Restricción nueva: las medidas tienen que ser dibujables

La infraestructura visual (`lib/cuerposGeometricos.ts`) rechaza cuerpos que no se pueden rotular. **Esto acota el contenido, no solo el dibujo:**

- Caja: razón entre arista mayor y menor **≤ 4**, y arista más corta **≥ 14 px** en pantalla.
- Cilindro: **0,25 ≤ altura/radio ≤ 8**.

Consecuencia concreta y ya verificada: un **silo** de proporciones realistas (r = 2 m, h = 30 m → h/r = 15) **no se puede dibujar**. Si el candidato «silo» sobrevive a la consulta de fuentes, hay que darle proporciones achaparradas (r = 5, h = 20 → h/r = 4 ✓) o usarlo solo en ítems sin figura. Lo mismo vale para cualquier tubo, poste o chimenea.

### Ternas verificadas (dibujables, sin colisión interna)

Barrido con `motivoRechazoParalelepipedo` sobre a ≤ 15: **168 ternas** cumplen a la vez ser dibujables y tener las 10 piezas derivadas (`a`, `b`, `c`, `S`, `V`, `S/2`, `ab`, `ac`, `bc`, `2(a+b+c)`) todas distintas entre sí. Primeras:

```
4×2×3  S=52   V=24     5×3×4  S=94   V=60     6×3×4  S=108  V=72
5×2×3  S=62   V=30     6×2×5  S=104  V=60     6×3×5  S=126  V=90
5×2×4  S=76   V=40
```

Cilindros con cifras manejables (π ≈ 3,14), medidos:

```
r=5  h=20   h/r=4,0 ✓   tapas=157   manto=628    S=785    V=1570
r=10 h=20   h/r=2,0 ✓   tapas=628   manto=1256   S=1884   V=6280
r=4  h=5    h/r=1,3 ✓   tapas=100,48 manto=125,60 S=226,08 V=251,20
```

⚠️ **`r=10, h=10` queda descartado**: tapas y manto valen 628 los dos, colisión interna garantizada.

### ⚠️ El cubo de arista 6

`S = 216` y `V = 216`. **El mismo número.** Es una colisión interna asegurada si aparecen las dos magnitudes en el mismo archivo, y además 216 ya está ocupado en el corpus.

Pero es demasiado buen material pedagógico para descartarlo sin pensar: es la demostración de que superficie y volumen son cosas distintas aunque el número coincida —lo que las separa son las unidades— y es exactamente la pregunta abierta con que L1 tiene que cerrar. **Propongo usarlo a propósito**, en un bloque de texto o predicción sin ítem PAES asociado, declarándolo en `auditoria.colisionesPermitidas` con su motivo. Es una decisión tuya: si prefieres no arriesgarlo, se reemplaza por la pregunta abierta en abstracto y se pierde el ejemplo.

### Reparto de escenas (sin repetir entre lecciones ni con el cierre)

- **L1** — núcleo: el candidato 1 de L1 desplegado (la red). Aplicación: candidato 2 o 3. Cifras: ternas del barrido con `a ≤ 8`, cubo de arista 4 o 5, cilindro `r=5, h=20`.
- **L2** — núcleo: candidato 1 de L2. Aplicación: candidato 2. **Aristas y radios distintos de los de L1**, para no arrastrar `P3`/`P11` a una colisión.
- **L3** — núcleo: el termo (los dos sentidos sobre el mismo objeto). Aplicación: candidato 2. Suma la conversión m³ ↔ litros, que es donde vive `P12`.
- **Cierre** — reutiliza las escenas ya verificadas con cifras nuevas por ítem, más el candidato de reserva que haya quedado libre. La matriz de 8 ítems × 4 habilidades se define en Fase 6, no acá.

---

## Estructura de las 3 lecciones

Los 10 pasos del orden fijo en las tres. Bloques disponibles hoy, sin nada nuevo: la infraestructura de este módulo ya está mergeada y testeada (commits `16be93e` a `ab0b78f`).

- **L1** — el paso `descubrimiento` es el único del módulo que usa `vista: "desarrollo"` como pieza central: el estudiante ve el cuerpo armado, luego desplegado, y cuenta. `generalizacion` introduce `2(ab+bc+ac)` recién después. `practica` y `aplicacion` alternan los tres cuerpos. Sin `interactivoSlider` (no hay nada continuo que mover; `docs/reglas-modulo.md` regla 1 lo desaconseja además si el concepto no lo exige).
- **L2** — solo `vista: "solido"`. El descubrimiento se apoya en una tabla de «capas» antes que en la fórmula: cuántos cubos por capa × cuántas capas. Sin `interactivoSlider`.
- **L3** — mezcla las dos vistas según el problema, y es la única que usa `enfasis` en los dos valores dentro del mismo archivo. Densidad de formato PAES más alta, enunciados que no nombran la magnitud.

Los valores exactos de cada paso se calculan y verifican con `node -e` al escribir cada JSON (Fases 3–5), no acá.

## Campo `estado`

No se agrega. Fue eliminado del contrato el 2026-08-12 (CLAUDE.md regla 5). El gate de publicación es commit sin push más firma explícita.

---

## Lo que necesita tu firma antes de la Fase 3

1. **El reparto de las 12 celdas** y, en particular, que las 3 de `volumen × desarrollo` queden sin usar.
2. **El renombre de L3** `cuerpos-hoja-al-cilindro` → `cuerpos-problemas-en-contexto`, o su rechazo.
3. **Los 12 errores propuestos**, para convertirlos en `error-1`…`error-12` (SKILL.md §1 regla 4).
4. **El cubo de arista 6** con colisión declarada, o su reemplazo.
5. **La corrida de `consultar-fuentes.mjs`** con el comando de la PARADA 1.
