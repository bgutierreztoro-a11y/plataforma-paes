# Diseño del módulo "Enteros y racionales"

Eje: Números. 1° de 3 módulos del eje. Placeholder ya existe en `lib/modulos.ts`
(id `enteros-y-racionales`, `lecciones: []`, sin `cierreId`).

Prefijo de id propuesto para este módulo: `enteros-` (misma convención que `lineal-` para
Función lineal y afín y `ecuaciones-` para Ecuaciones lineales — sin correlativo, formato
`{prefijo-corto-del-módulo}-{slug}`, MOS §13.6).

---

## a) Mapa de las 3 lecciones

### Lección 1 — `enteros-operar-y-ordenar` — Enteros: operar y ordenar

**Contexto:** buceo, profundidad entre dos inmersiones. No se usa la frase "nivel del mar" ni
"altitud"; siempre profundidad de inmersión en metros bajo la superficie.

**Insight del paso 5 (descubrimiento) — fijado:** la resta como diferencia de profundidad
entre dos inmersiones, no como "quitar". El estudiante ve dos marcas de profundidad en un
perfil vertical, cuenta la diferencia directamente en el dibujo, y recién después la compara
con el resultado de la operación con negativos. Restar un negativo da más, y no es una regla
arbitraria: es literalmente cuánta distancia hay entre las dos inmersiones.

Cubre además: orden en la recta numérica.

**Pendiente antes de fijar números exactos:** consulta puntual contra
`Material/MA-34_Potencia_Ecuacion_Exponencial.md` con la escena concreta (ej. "buzo desciende
15 metros", profundidades específicas) antes de escribir el JSON.

### Lección 2 — `enteros-operar-y-comparar` — Racionales: operar y comparar

**Contexto:** recetas de cocina con tazas. Se mantiene a pesar de la colisión de vocabulario
genérico contra `618-JMA-M1-01-2024.md` (receta/taza/tazas/ingrediente/ingredientes) — decisión
consciente de Benja, no un descuido. Lo que hay que verificar antes de fijar números no es el
vocabulario sino la escena concreta.

**Insight del paso 5 — fijado:** dividir puede agrandar. 3 tazas de harina, cada porción usa
3/4 de taza: 3 ÷ 3/4 = 4. El resultado es mayor que 3, choca con "dividir achica". Ese choque
es el motor de la lección.

Cubre además: comparación de fracciones.

**Pendiente antes de fijar números exactos:** consulta puntual contra
`Material/618-JMA-M1-01-2024.md` con cantidades, tipo de receta e ingrediente concretos antes
de escribir el JSON.

### Lección 3 — `enteros-problemas-en-contexto` — Problemas en contexto (enteros + racionales)

**Insight:** no fijado. Piso de partida entregado por Benja: comparar dos negativos invierte
la intuición de "más grande" — −3/4 es mayor que −4/5.

**Contexto — decidido:** Candidato A, clima. Comparar temperaturas bajo cero (con decimales)
entre dos ciudades a la misma hora, más variación fraccionaria de temperatura por hora.
Verificable con una recta numérica o un termómetro real: −2,8 °C es "más caliente" que
−3,5 °C aunque 3,5 > 2,8. Ciudades ficticias (no reales) para no generar problema de
marca/lugar.

Candidatos descartados, registrados por trazabilidad: B (finanzas personales, saldos
deudores) y C (golf bajo par, el más forzado matemáticamente de los tres).

**Pendiente:** consulta puntual contra el corpus completo (no un archivo puntual, porque L3 es
contenido nuevo sin colisión conocida todavía) con las temperaturas exactas, "temperatura",
"grados bajo cero" y las frases del enunciado, antes de fijar el contexto numérico definitivo.

---

## b) `catalogoErrores` compartido del módulo

| id | Descripción | Diferenciación de errores ya existentes |
|---|---|---|
| error-1 | Al restar un negativo, invertir el signo del resultado (trata `a − (−b)` como `a − b`, perdiendo el cambio de signo). | Distinto de `lineal-patrones-de-cambio` error-3/error-4 (esos son sobre despejar valores desconocidos o confundir el signo de una tasa de cambio hacia adelante, no sobre la mecánica de restar un negativo). |
| error-2 | Invertir el orden de la diferencia entre dos profundidades/valores (calcula B − A cuando corresponde A − B, o viceversa), sin error de signo en sí — es un error de qué se resta de qué. | Distinto de error-1: aquí el signo de cada término está bien tomado, lo que falla es el orden de la resta. |
| error-3 | Tratar el valor negativo como si fuera una distancia (magnitud) y perder el signo al usarlo en una operación posterior, aunque la resta inicial haya estado bien planteada. | No se solapa con errores de `ecuaciones-lineales` (esos son sobre equilibrio de la balanza, no sobre naturaleza del signo). |
| error-4 | Comparar dos fracciones fijándose solo en el numerador (cree que 3/4 > 2/3 porque 3 > 2, ignorando el denominador). | Error clásico de racionales, no cubierto en ningún catálogo existente del proyecto. |
| error-5 | Comparar dos números negativos como si fueran positivos (cree que −3/4 < −4/5 porque 3/4 < 4/5 en valor absoluto). | Específico de negativos + fracciones combinados; distinto de error-4, que es sobre fracciones positivas. |
| error-6 | Sumar denominadores al sumar o restar fracciones (calcula a/b + c/d como (a+c)/(b+d)). | Error clásico de racionales, no cubierto en ningún catálogo existente. |
| error-7 | Creer que dividir siempre achica (al ver 3 ÷ 3/4 = 4, rechaza el resultado o busca dónde "se perdió" un paso porque el resultado es mayor que 3). | Es el error que el insight del paso 5 de L2 está diseñado para desarmar directamente. |

Revisados contra `lineal-patrones-de-cambio.json`, `lineal-pendiente-e-intercepto.json` y
`ecuaciones-lineales.json`: ninguno de los 7 duplica semánticamente un error ya catalogado en
esos tres archivos.

---

## c) Reparto de habilidades PAES (resolver, modelar, representar, argumentar)

| | Resolver | Modelar | Representar | Argumentar |
|---|---|---|---|---|
| L1 (enteros, buceo) | ✔ operar con negativos | | ✔ recta numérica / perfil de profundidad | ✔ justificar por qué restar un negativo da más (paso reflexión) |
| L2 (racionales, recetas) | ✔ operar con fracciones | ✔ traducir "cada porción usa 3/4 de taza" a una división | | |
| L3 (problemas en contexto) | | ✔ traducir el contexto elegido a comparación/operación | | ✔ justificar por qué el número "más negativo" es menor, con el contexto elegido como evidencia |
| Cierre (8 ítems) | 2 ítems | 2 ítems | 2 ítems | 2 ítems |

Cobertura completa de las 4 habilidades entre las 3 lecciones y el cierre. Representar se
concentra en L1 (recta numérica es el vehículo natural); modelar se reparte entre L2 y L3;
argumentar aparece en L1 y L3 porque ambas tienen un insight contraintuitivo que hay que
defender con palabras, no solo calcular.

---

## d) Diferenciación estructural — secuencia de 10 pasos por lección

Motivo del requisito: L1 y el viejo `l3-ecuaciones-lineales` (antes de reubicarse, Enmienda 2
§4) compartieron 8/10 pasos casi idénticos y hubo que reescribir seis. Tabla de tipo de bloque
principal por paso, para las 3 lecciones nuevas, contrastada con las 3 lecciones ya escritas:

| Paso | `lineal-patrones` (existente) | `lineal-pendiente` (existente) | `ecuaciones-lineales` (existente) | **L1 buceo (nueva)** | **L2 recetas (nueva)** | **L3 contexto (nueva)** |
|---|---|---|---|---|---|---|
| curiosidad | prediccion + texto | texto | prediccion + texto | **visualizacion + prediccion** | **pregunta + texto** | **verdaderoFalso + texto** |
| problema | seleccion | texto | seleccion | **numerica** | **prediccion** | **texto** |
| pensar | numerica | abierta | verdaderoFalso | **abierta** | **numerica** | **prediccion** |
| pistas | pistas | interactivoSlider + pistas | pistas + numerica | **pistas + interactivoSlider** | **pistas + visualizacion** | **pistas + numerica** |
| descubrimiento | texto + texto + verdaderoFalso | texto + interactivoSlider | texto + prediccion + visualizacion | **visualizacion + texto** | **interactivoSlider + texto** | **texto + abierta** |
| generalizacion | texto + numerica | abierta + texto | texto + texto + numerica | **texto + verdaderoFalso** | **abierta + texto** | **numerica + texto** |
| practica | numerica | seleccion | seleccion + verdaderoFalso + numerica | **numerica** | **seleccion** | **seleccion + verdaderoFalso** |
| aplicacion | verdaderoFalso + seleccion | seleccion | numerica | **seleccion** | **numerica** | **seleccion** |
| reflexion | abierta + numerica | abierta | abierta | **abierta** | **verdaderoFalso** | **pregunta** |
| consolidacion | abierta + texto + texto | texto | texto + texto | **texto + pregunta** | **texto** | **abierta + texto** |

Las tres secuencias nuevas son distintas entre sí (ninguna columna se repite paso a paso) y
distintas de las tres ya escritas. Se usa el repertorio completo de 10 tipos de bloque
(texto, prediccion, seleccion, numerica, verdaderoFalso, abierta, pregunta,
interactivoSlider, pistas, visualizacion) repartido entre las tres lecciones:

- L1 aporta el uso fuerte de `visualizacion` (perfil vertical de inmersión) e
  `interactivoSlider` para explorar profundidades en la recta numérica.
- L2 aporta `interactivoSlider` aplicado a tamaño de porción/fracción (mecánica distinta a la
  de L1, que desliza sobre una recta numérica de profundidad) y `visualizacion` de tazas
  fraccionadas.
- L3 no usa ni `interactivoSlider` ni `visualizacion` — se apoya en `prediccion` +
  `verdaderoFalso` + `pregunta` para el choque de intuición sobre negativos, dejando la
  lección más liviana en mecánica interactiva y más cargada en juicio/argumentación, acorde a
  que es la lección de síntesis del módulo.

---

## e) `contextosNumericos` previstos (sin pisarse entre sí)

| Lección/cierre | Contexto | Rango numérico previsto (a confirmar tras consulta) |
|---|---|---|
| L1 | Buceo — profundidades en metros bajo la superficie, negativos | Profundidades entre −5 m y −40 m aprox.; diferencias de 5 a 25 m |
| L2 | Recetas de cocina con tazas | Fracciones simples (medios, tercios, cuartos) y mixtas de 1 a 5 tazas |
| L3 | A definir (clima / finanzas / golf, ver sección a) | Depende del candidato elegido; clima trabajaría con decimales negativos de un dígito, finanzas con montos negativos de miles/decenas de miles, golf con enteros pequeños negativos |
| Cierre | Mezcla de los tres contextos de arriba, sin contexto nuevo | Reutiliza los rangos de L1/L2/L3 con cifras distintas a los ejemplos de lección |

Ningún contexto se repite entre L1, L2, L3 y el cierre, y ninguno coincide con la lista de
contextos ya quemados en otras lecciones del proyecto (bidón, ahorro semanal, páginas de
libro, impresora, taxímetro, estampillas, fichas de juego de mesa, latas de reciclaje,
estacionamiento por hora, arriendo de bicicleta, planes de datos, huerta/plantines, balanza
con bolsas, gatos en jaulas, bibliotecaria repartiendo cuentos, planta que crece, estanque,
vela, piscina, bacterias, auto que acelera). Tampoco usa la familia saturada "cargo fijo +
tarifa variable".

---

## Pendientes antes de tocar cualquier JSON

1. Firma de este documento por Benja. **Hecho (2026-07-29).**
2. Consulta puntual contra `MA-34_Potencia_Ecuacion_Exponencial.md` con la escena numérica
   exacta de L1 (buceo). **Hecho (2026-07-29) — ver Apéndice de verificación.**
3. Consulta puntual contra `618-JMA-M1-01-2024.md` con la escena numérica exacta de L2
   (recetas). **Hecho (2026-07-29) — ver Apéndice de verificación.**
4. Contexto de L3 decidido (Candidato A, clima). Consulta de sus keywords contra el corpus
   completo. **Hecho (2026-07-29) — ver Apéndice de verificación.**

Solo después de (2), (3) y (4) se fijan números y situaciones concretas; recién ahí empieza la
redacción de los JSON, que sigue siendo 🔴 (Benja escribe, para, muestra — nunca se commitea ni
pushea desde el hilo).

---

## Apéndice de verificación — consultas ejecutadas manualmente por Benja (2026-07-29)

Mecanismo (2) de CLAUDE.md "Aislamiento de fuentes externas": Benja corrió
`scripts/consultar-fuentes.mjs` en su propia terminal, fuera de este hilo, y pegó los
veredictos tal cual los imprime el script. Este hilo no ejecutó el script ni leyó
`fuentes-analisis-aisladas/` por ningún medio.

**L1 — buceo, contra `Material/MA-34_Potencia_Ecuacion_Exponencial.md`.** Veredicto: **LIMPIO.**
Frases concretas corridas: "desciende a 12 metros" (NO), "27 metros bajo la superficie" (NO),
"diferencia de profundidad" (NO), "27 metros" (NO), "15 metros" (NO). Los números sueltos (12,
15, 27) pegaron en 80-90 archivos cada uno; Benja lo calificó como ruido de substring sin valor
de señal, no colisión real. Escenario aprobado tal cual se propuso: −12 m, −27 m, −5 m.

**L2 — recetas con tazas, contra `618-JMA-M1-01-2024.md`.** Veredicto: **LIMPIO CON UNA
CORRECCIÓN OBLIGATORIA.** Limpio: "3 tazas" (NO), "3/4 de taza" (NO), "tres cuartos" (NO),
"panqueques" (NO), "3/5" (NO), "3 tazas de harina" (NO), "cuántas porciones" (NO). Colisión
real detectada: "galletas" pega en `demre/paes-m1-2026-forma113.md` y
`Material/PAES-2026-Forma113-M1-Seleccion-Preguntas-DEMRE.md` — el examen DEMRE real. Acción
requerida antes de escribir el JSON de L2: reemplazar "galletas" por otro producto en el ítem
de comparación de fracciones (2/3 vs 3/5 de taza de azúcar), y verificar el reemplazo antes de
fijarlo. "harina" y "azúcar" pegan solo en `pdv-terceros` (MA-10, MA-32) y las frases completas
dieron NO — se mantienen sin cambios.

**L3 — clima, contra el corpus completo (contenido nuevo, sin archivo puntual conocido).**
Veredicto: **LIMPIO AL 100%.** Todo NO: `-2,8`, `-2.8`, `-4,3`, `-4.3`, "3/4 de grado", "grados
bajo cero", "Nortelva", "Valle Frío". Escenario aprobado tal cual se propuso.
