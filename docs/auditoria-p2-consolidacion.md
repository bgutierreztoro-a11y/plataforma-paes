# Auditoría P2 — consolidación contrastiva

**Fecha:** 2026-09-04 · **Commit auditado:** `1fff7bc` · **Rama:** master

Diagnóstico. No se modificó ningún archivo bajo `content/`. Este informe describe;
no propone texto nuevo ni correcciones.

## Qué se audita

P2 de la doctrina de aprendizaje (`docs/doctrina-aprendizaje-fobos.md`, línea 75):

> Regla de auditoría nueva: todo `BloquePrediccion` / `BloqueSeleccion` con
> distractores catalogados debe tener, en el mismo `paso` o el siguiente, un
> bloque que mencione al menos un `errorCatalogado` de esos distractores.

Criterio de "nombra el camino equivocado", en orden:

1. El bloque posterior referencia explícitamente el mismo id de `errorCatalogado`.
2. Si no, su texto reproduce la `descripcion` de ese error del `catalogoErrores`
   del propio archivo (frase o paráfrasis reconocible).
3. Si el texto solo afirma el camino correcto sin nombrar el equivocado → incumple.

**Regla de desempate usada en el criterio 3.** Un bloque *nombra* el camino
equivocado cuando su texto articula el razonamiento fallido ("mucha gente resta al
revés porque…"). Un bloque que solo presenta un valor incorrecto para juzgarlo
—un `verdaderoFalso` del tipo "¿es cierto que la diagonal mide 11 metros?"— no
nombra nada: presenta un número, no un mecanismo. Los dos casos aparecen en el
corpus y se clasificaron con esta línea.

## Alcance y universo

33 archivos: los 11 módulos completos de `docs/mapa-modulos-m1.md` × 3 lecciones
(`content/lecciones/*.json` menos `_esqueleto.json` y `l0-demo.json`).

Inventario mecánico de dónde vive `errorCatalogado` en esos 33 archivos:

| Contenedor | Tipo de bloque | Bloques | ¿Distractores? |
|---|---|---|---|
| `opciones[].errorCatalogado` | `seleccion` | 80 | sí |
| `alternativas[].errorCatalogado` | `pregunta` | 16 | sí |
| `feedbackPorError[]` y `campos[].feedbackPorError[]` | `numerica` | 116 | no |
| `secuenciaMicropreguntas[].feedbackPorPrediccion[]` | `interactivoSlider` | 1 | no |
| `opciones[]`, pero solo en la opción **correcta** | `seleccion` | 2 | no |

**Universo auditado: 96 bloques** (80 `seleccion` + 16 `pregunta`), los únicos con
distractores incorrectos catalogados. Los otros 119 van a "casos ambiguos".

Tres hechos estructurales que condicionan todo lo que sigue:

- **`prediccion` (51 bloques) y `verdaderoFalso` (45) nunca llevan `errorCatalogado`.**
  Dos de los cuatro tipos que la regla nombra quedan fuera de su propio alcance:
  el bloque de descubrimiento de P1 no puede, hoy, disparar la obligación de P2.
- **Ningún `BloqueTexto` lleva `errorCatalogado`** (0 de 224; sus únicas claves son
  `tipo` y `contenido`). El criterio 1 nunca se satisface con prosa: cuando se
  satisface, es siempre dentro de **feedback condicional** de un bloque de intento
  posterior — texto que el estudiante ve solo si vuelve a caer en ese error exacto.
- **10 archivos usan ids sin `catalogoErrores` propio.** Es la deuda de
  `docs/deuda-catalogo-errores-crossfile.md` (ahí, 10 sobre 26 archivos; sobre 33
  siguen siendo los mismos 10). En ellos el criterio 2 no es aplicable: no hay
  `descripcion` local contra la cual comparar. Se clasificaron con los criterios 1
  y 3 solamente, y van marcados `*`.

Método: el inventario de qué bloque sigue a cuál, qué ids trae cada distractor y
qué ids reaparecen en el alcance salió de scripts `node -e`; la lectura de si un
texto nombra o no el camino equivocado se hizo a mano sobre los 34 casos que el
criterio 1 no resolvió.

## 1. Tabla por archivo

`c1` = cumple por referencia explícita al id (criterio 1) · `c2/3` = cumple por
lectura de texto (criterios 2 o 3) · `inc` = incumple.

| Archivo | Creado | Universo | c1 | c2/3 | inc | Ambiguos |
|---|---|---|---|---|---|---|
| cuadratica-donde-toca-el-eje.json | 2026-08-24 | 2 | 1 | 0 | 1 | 0 |
| cuadratica-punto-mas-alto.json | 2026-08-24 | 0 | 0 | 0 | 0 | 0 |
| cuadratica-sube-y-baja.json | 2026-08-24 | 4 | 3 | 0 | 1 | 0 |
| cuerpos-cuanto-cabe-adentro.json | 2026-08-27 | 4 | 4 | 0 | 0 | 0 |
| cuerpos-desarmar-la-caja.json | 2026-08-27 | 4 | 4 | 0 | 0 | 0 |
| cuerpos-problemas-en-contexto.json | 2026-08-28 | 3 | 3 | 0 | 0 | 0 |
| ecuaciones-lineales.json | 2026-07-28 | 2 | 1 | 0 | 1 | 1 |
| enteros-operar-y-comparar.json \* | 2026-07-30 | 2 | 1 | 0 | 1 | 0 |
| enteros-operar-y-ordenar.json | 2026-07-30 | 2 | 0 | 0 | 2 | 0 |
| enteros-problemas-en-contexto.json \* | 2026-07-30 | 3 | 1 | 1 | 1 | 0 |
| expresiones-deshacer-producto.json | 2026-08-14 | 5 | 3 | 0 | 2 | 0 |
| expresiones-rectangulo.json | 2026-08-14 | 5 | 5 | 0 | 0 | 0 |
| expresiones-sumar-lo-que-se-parece.json | 2026-08-14 | 6 | 3 | 1 | 2 | 0 |
| figuras-borde-y-superficie.json | 2026-08-25 | 6 | 4 | 0 | 2 | 0 |
| figuras-problemas-con-forma.json | 2026-08-26 | 7 | 5 | 1 | 1 | 0 |
| figuras-triangulo-no-se-rompe.json | 2026-08-24 | 7 | 6 | 0 | 1 | 0 |
| inecuaciones-problemas.json \* | 2026-08-03 | 3 | 2 | 1 | 0 | 0 |
| inecuaciones-resolucion.json \* | 2026-08-03 | 2 | 1 | 0 | 1 | 1 |
| lineal-modelamiento-paes.json \* | 2026-08-02 | 3 | 2 | 1 | 0 | 0 |
| lineal-patrones-de-cambio.json | 2026-07-28 | 0 | 0 | 0 | 0 | 0 |
| lineal-pendiente-e-intercepto.json | 2026-07-28 | 2 | 1 | 0 | 1 | 0 |
| porcentaje-concepto.json \* | 2026-08-12 | 1 | 0 | 0 | 1 | 0 |
| porcentaje-rebaja-doble.json \* | 2026-08-12 | 3 | 3 | 0 | 0 | 0 |
| porcentaje-volver-atras.json \* | 2026-08-12 | 2 | 2 | 0 | 0 | 0 |
| potencias-multiplicar-corto.json | 2026-08-16 | 3 | 1 | 0 | 2 | 0 |
| potencias-problemas-en-contexto.json | 2026-08-21 | 3 | 1 | 1 | 1 | 0 |
| potencias-raiz-escondida.json | 2026-08-19 | 1 | 0 | 0 | 1 | 0 |
| proporcionalidad-directa.json | 2026-08-13 | 3 | 1 | 0 | 2 | 0 |
| proporcionalidad-inversa.json | 2026-08-14 | 3 | 3 | 0 | 0 | 0 |
| proporcionalidad-reconocer.json | 2026-08-14 | 2 | 1 | 0 | 1 | 0 |
| sistemas-dos-historias.json | 2026-08-19 | 2 | 0 | 0 | 2 | 0 |
| sistemas-plantear-antes-resolver.json \* | 2026-08-19 | 1 | 0 | 0 | 1 | 0 |
| sistemas-rectas-no-se-cruzan.json \* | 2026-08-19 | 0 | 0 | 0 | 0 | 0 |
| **Total** | | **96** | **62** | **6** | **28** | **2** |

\* archivo sin `catalogoErrores` propio: el criterio 2 no se pudo aplicar.

La columna "Ambiguos" cuenta solo los casos individuales; la clase de 117 bloques
`numerica` / `interactivoSlider` se trata aparte en la sección 3 y no se reparte
por archivo.

**68 de 96 cumplen (71 %), 28 incumplen (29 %).** Tres archivos no tienen ningún
bloque en el universo: `cuadratica-punto-mas-alto.json` (no usa `errorCatalogado`
en ninguna parte), `lineal-patrones-de-cambio.json` (solo lo usa en bloques
`numerica`) y `sistemas-rectas-no-se-cruzan.json` (sus tres `errorCatalogado` de
distractor están explícitamente en `null`).

## 2. Incumplimientos

Uno por línea: `archivo · ref · errores · qué hay hoy en el alcance · qué falta`.

1. `cuadratica-donde-toca-el-eje.json` · `pasos[4].bloques[1]` · {error-2} · el alcance formaliza el discriminante y afirma que una parábola puede tener dos, uno o ningún cero real · falta nombrar el camino de error-2: quedarse con una sola de las dos soluciones del producto nulo.
2. `cuadratica-sube-y-baja.json` · `pasos[1].bloques[0]` · {error-3} · un `verdaderoFalso` sobre si el método escala a números feos, y un `numerica` de práctica · falta nombrar el camino de error-3: plantear la suma en vez del producto.
3. `ecuaciones-lineales.json` · `pasos[1].bloques[0]` · {error-1} · un `verdaderoFalso` que reafirma la acción correcta ("quitar lo mismo de ambos platillos") · falta nombrar el camino de error-1: quitar de un solo platillo.
4. `enteros-operar-y-comparar.json` \* · `pasos[0].bloques[0]` · {error-7} · un `texto` que plantea la receta de bizcocho y un `prediccion`; nada sobre ningún error · falta cualquier contraste. Único caso del corpus en `pasos[0]`.
5. `enteros-operar-y-ordenar.json` · `pasos[7].bloques[0]` · {error-5} · una `abierta` metacognitiva sobre si restar siempre achica, que es otro error del módulo · falta nombrar el camino de error-5: comparar dos negativos por su valor absoluto.
6. `enteros-operar-y-ordenar.json` · `pasos[9].bloques[1]` · {error-2, error-1, error-3} · **alcance vacío**: último bloque del último paso · no existe bloque posterior donde contrastar.
7. `enteros-problemas-en-contexto.json` \* · `pasos[8].bloques[0]` · {error-2, error-3, error-1} · una `abierta` y un `texto` de cierre que sí nombran un camino equivocado, pero el de la comparación de negativos, no el de los tres ids del bloque · falta el contraste de los errores de resta con signo.
8. `expresiones-deshacer-producto.json` · `pasos[5].bloques[1]` · {error-16, error-15} · tres `seleccion` de práctica, sin prosa · falta el contraste del producto simétrico.
9. `expresiones-deshacer-producto.json` · `pasos[6].bloques[2]` · {error-13, error-9, error-14} · una `abierta` y un `numerica` sobre 4.896 ÷ 72 · falta nombrar la suma de cuadrados factorizada como diferencia.
10. `expresiones-sumar-lo-que-se-parece.json` · `pasos[1].bloques[1]` · {error-2, error-3} · un `numerica` con la tabla de las dos barcazas · falta el contraste de "pegar las letras" y "separar el coeficiente".
11. `expresiones-sumar-lo-que-se-parece.json` · `pasos[6].bloques[2]` · {error-7, error-5} · una `abierta` y un `seleccion` de aplicación · falta el contraste; el `texto` que sí nombra los cuatro errores está en `pasos[8]`, **dos pasos después**, fuera del alcance.
12. `figuras-borde-y-superficie.json` · `pasos[6].bloques[1]` · {error-7} · un `verdaderoFalso` que propone un área errónea sin explicar el mecanismo, y práctica · falta nombrar el olvido del ÷2. La lista de errores del archivo está en `pasos[8]`, fuera del alcance.
13. `figuras-borde-y-superficie.json` · `pasos[7].bloques[0]` · {error-12} · el `texto` de cierre en `pasos[8].bloques[1]` sí está en alcance, pero nombra otros tres errores (÷2, altura como lado inclinado, circunferencia vs. área) · falta el de error-12: dar por buena la hipotenusa de un trío parecido.
14. `figuras-problemas-con-forma.json` · `pasos[4].bloques[3]` · {error-1, error-2} · el alcance contrasta error-10 (usar la cumbrera como altura) en `pasos[4].bloques[9]` y `pasos[5].bloques[0]` · falta el de error-1 (sumar los lados en vez de elevarlos al cuadrado) y error-2 (omitir la raíz final).
15. `figuras-triangulo-no-se-rompe.json` · `pasos[6].bloques[0]` · {error-12} · un `verdaderoFalso` que propone "diagonal = 11 m" y un `prediccion` que invita a reconocer un trío · el texto presenta el valor equivocado pero no articula el mecanismo de error-12.
16. `inecuaciones-resolucion.json` \* · `pasos[1].bloques[0]` · {error-6} · un `numerica` que dice "todavía no arreglamos la regla" sin decir cuál es la regla rota · falta nombrar el camino equivocado.
17. `lineal-pendiente-e-intercepto.json` · `pasos[7].bloques[0]` · {error-1, error-4} · una única `abierta` metacognitiva ("¿qué parte te costó más?") · falta todo contraste.
18. `porcentaje-concepto.json` \* · `pasos[6].bloques[2]` · {error-4, error-2} · una `abierta` y un `numerica` en dos partes · falta todo contraste.
19. `potencias-multiplicar-corto.json` · `pasos[5].bloques[2]` · {error-2} · práctica de la regla del cociente y de la potencia de potencia · falta nombrar el camino de error-2: sumar exponentes con bases distintas.
20. `potencias-multiplicar-corto.json` · `pasos[6].bloques[1]` · {error-3, error-1} · un `numerica` con base racional y dos bloques del escalón del microscopio · falta el contraste de aplicar la regla de la otra operación.
21. `potencias-problemas-en-contexto.json` · `pasos[5].bloques[1]` · {error-13, error-7} · un `verdaderoFalso` que sí nombra un error, pero el de sumar exponentes con bases distintas · falta el de error-13 (responder otra magnitud) y error-7 (invertir índice y exponente).
22. `potencias-raiz-escondida.json` · `pasos[6].bloques[0]` · {error-9, error-10} · un `numerica` de raíz de fracción, un `verdaderoFalso` sobre √(36+64), y el problema de la terraza · falta el contraste de la extracción incompleta y de sacar el factor sin sacarle la raíz.
23. `proporcionalidad-directa.json` · `pasos[5].bloques[1]` · {error-8, error-6} · un `verdaderoFalso` que propone agregar 2 mL por 2 g, un movimiento equivocado distinto del catalogado en error-6 · falta nombrar el mecanismo de error-6 y el de error-8.
24. `proporcionalidad-directa.json` · `pasos[6].bloques[2]` · {error-7, error-3, error-11} · una `abierta` y un `numerica` en dos partes sobre el esmalte · falta todo contraste.
25. `proporcionalidad-reconocer.json` · `pasos[6].bloques[2]` · {error-7, error-3, error-11} · idéntico al anterior: `abierta` + `numerica` del esmalte · falta todo contraste.
26. `sistemas-dos-historias.json` · `pasos[7].bloques[0]` · {error-5, error-4} · una única `abierta` metacognitiva · falta todo contraste.
27. `sistemas-dos-historias.json` · `pasos[9].bloques[1]` · {error-5, error-1} · **alcance vacío**: último bloque del último paso · no existe bloque posterior donde contrastar.
28. `sistemas-plantear-antes-resolver.json` \* · `pasos[9].bloques[1]` · {error-5} · **alcance vacío**: último bloque del último paso · no existe bloque posterior donde contrastar.

## 3. Casos ambiguos

No se emitió veredicto sobre estos: su estructura no calza con el criterio.

### Clase A — el error catalogado no está en un distractor sino en el feedback (117 bloques)

116 bloques `numerica` y 1 `interactivoSlider`. `BloqueNumerica` está nombrado en
la regla de P2, pero en este repo **no tiene distractores**: es entrada abierta, y
sus `errorCatalogado` viven en `feedbackPorError[]`, que se dispara solo si el
estudiante escribe ese valor equivocado exacto. Decidir si eso cuenta como "bloque
de intento con distractores catalogados" es una decisión doctrinal, no de auditoría.

Cita representativa — `cuerpos-cuanto-cabe-adentro.json`, `pasos[5].bloques[8]`:

> **Ejercicio.** Otro arenero, más chico, mide 5 dm de largo, 2 dm de ancho y 4 dm de alto. ¿Cuántos decímetros cúbicos de arena caben?
> `feedbackPorError[error-7]`: "11 es 5 + 2 + 4: sumaste las tres medidas. El volumen las multiplica: (5 × 2) × 4."
> `feedbackPorError[error-10]`: "10 es 5 × 2, el área del fondo: una capa. El arenero tiene 4 dm de alto, así que son 4 capas: 10 × 4 = 40."

Nótese que ese feedback **sí tiene la forma del contraste de P2** ("mucha gente
hace X, X falla porque Y, lo que funciona es Z"), pero es condicional: solo lo lee
quien cae exactamente en ese valor.

### Clase B — el `errorCatalogado` está en la opción correcta (2 bloques)

Ítems de identificación de error, donde la respuesta correcta *es* el camino
equivocado. La regla habla de distractores; acá el id etiqueta el acierto.

- `ecuaciones-lineales.json` · `pasos[6].bloques[0]`:
  > "Para resolver **2x + 3 = 11**, ¿cuál de estos pasos **rompe** el equilibrio (y por lo tanto NO se puede hacer)?"
  > opción correcta, `errorCatalogado: "error-1"`: "Restar 3 solo al lado izquierdo, quedando 2x = 11."
- `inecuaciones-resolucion.json` · `pasos[6].bloques[0]`: misma estructura con
  `7x + 2 < 30`.

## 4. Patrón

**Por módulo.** El incumplimiento no se reparte parejo, pero los módulos con más
carga tienen tasas bajas y los extremos altos son módulos con muy pocos bloques en
el universo, así que la lectura por porcentaje engaña:

| Módulo | Universo | Incumple | % |
|---|---|---|---|
| cuerpos-geometricos | 11 | 0 | 0 % |
| porcentaje | 6 | 1 | 17 % |
| figuras-geometricas | 20 | 4 | 20 % |
| funcion-lineal-y-afin | 5 | 1 | 20 % |
| expresiones-algebraicas | 16 | 4 | 25 % |
| ecuaciones-e-inecuaciones | 7 | 2 | 29 % |
| funcion-cuadratica | 6 | 2 | 33 % |
| proporcionalidad | 8 | 3 | 38 % |
| enteros-y-racionales | 7 | 4 | 57 % |
| potencias-y-raices | 7 | 4 | 57 % |
| sistemas-2x2 | 3 | 3 | 100 % |

Hay dos concentraciones reales: **sistemas-2x2 incumple sus 3 bloques del universo**
(y sus otras 2 lecciones no aportan ninguno — 3 bloques en todo el módulo), y
**cuerpos-geometricos cumple sus 11**, la única racha limpia larga.

**Por fecha de autoría** (primer commit que agrega cada archivo). No hay tendencia
monótona: la tasa sube y baja entre tandas.

| Tanda | Universo | Incumple | % |
|---|---|---|---|
| 2026-07-28 a 07-30 | 11 | 6 | 55 % |
| 2026-08-01 a 08-14 | 38 | 9 | 24 % |
| 2026-08-15 a 08-21 | 10 | 7 | 70 % |
| 2026-08-22 a 08-28 | 37 | 6 | 16 % |

Las dos tandas grandes (agosto temprano y agosto tardío) están en 24 % y 16 %; las
dos chicas, en 55 % y 70 %. La tanda del 15–21 de agosto es potencias + sistemas,
que son justamente los dos módulos peor rankeados arriba: el "patrón temporal" es
el patrón por módulo visto desde otro eje, no un efecto de la fecha.

**Por tipo de bloque.** No discrimina: `seleccion` incumple 23 de 80 (29 %),
`pregunta` 5 de 16 (31 %).

**Por catálogo local.** Tampoco: los 10 archivos sin `catalogoErrores` propio
aportan 5 de los 28 incumplimientos sobre 20 bloques de universo (25 %), contra
23 de 76 (30 %) en los archivos con catálogo.

**El patrón que sí hay es de mecanismo, no de módulo.** De los 68 bloques que
cumplen, **62 lo hacen por el criterio 1** — y en los 62 la referencia al id ocurre
dentro de feedback condicional de un bloque de intento posterior, nunca en prosa
que el estudiante lea sí o sí: ningún `BloqueTexto` del corpus lleva
`errorCatalogado` (0 de 224). Solo **6 de 96 bloques** tienen el contraste en texto
incondicional, y son estos:

- `enteros-problemas-en-contexto.json` · `pasos[6].bloques[0]` \*
- `expresiones-sumar-lo-que-se-parece.json` · `pasos[7].bloques[1]`
- `figuras-problemas-con-forma.json` · `pasos[5].bloques[5]`
- `inecuaciones-problemas.json` · `pasos[4].bloques[0]` \*
- `lineal-modelamiento-paes.json` · `pasos[7].bloques[0]` \*
- `potencias-problemas-en-contexto.json` · `pasos[7].bloques[0]`

Los tres marcados `*` están en archivos sin catálogo local, así que su contraste no
se pudo cotejar contra ninguna `descripcion`.

Los otros dos hechos estructurales del corpus apuntan en la misma dirección:
`BloquePrediccion` y `BloqueVerdaderoFalso` no llevan `errorCatalogado` en ninguno
de los 33 archivos, y 3 de los 28 incumplimientos son bloques de intento colocados
como último bloque del último paso, sin ningún alcance posterior posible.
