# Calibración de lecciones e ítems — Plataforma M1

**Estado:** documento interno de referencia
**Ámbito:** guía obligatoria para toda lección nueva (L2 en adelante) y para toda regeneración de ítems
**Última actualización:** 2026-07-22

---

## 0. Estatus legal de las fuentes usadas para escribir este documento

Este documento se construyó a partir de tres insumos con estatus muy distinto. La distinción no es burocrática: determina qué se puede escribir en la plataforma y qué no.

| Fuente | Estatus | Uso permitido |
|---|---|---|
| **Temario oficial DEMRE M1** (documento público de acceso libre) | Referencia de scope y secuencia | Definir qué ejes/unidades cubrir, qué habilidades declarar. **No** copiar redacción de ítems liberados. |
| **Bases Curriculares Mineduc / UCE** | Referencia curricular pública | Progresión de aprendizajes, nivel esperado por curso. |
| **Ensayo comercial de tercero** (editorial privada, material con copyright) | **Solo análisis estadístico agregado** | Calibración de proporciones, formato y dificultad. **Prohibido**: copiar, adaptar, reformular o "inspirarse de cerca" en cualquier enunciado, contexto, cifra o estructura de pregunta específica. |

> **Regla dura.** Ningún enunciado, contexto narrativo, conjunto de cifras ni estructura de alternativas proveniente de material de terceros entra a `content/`. Lo único que se extrajo del ensayo comercial son **números agregados** (cuántas preguntas por eje, qué rango de dificultad, qué formato) y **patrones pedagógicos genéricos** que son de dominio común en didáctica de la matemática. Esa frontera se respeta sin excepción.
>
> Si al escribir un ítem aparece la sensación de "esto se parece a algo que vi", el ítem se descarta y se reescribe desde otro contexto. No se negocia con esa señal.

---

## 1. Por qué existe este documento

La Lección 1 costó cuatro rondas de rechazo por colisión con el corpus DEMRE/Mineduc. La causa raíz no fue mala suerte: fue **escribir primero y verificar después**, sin un marco previo que dijera qué espacio de diseño estaba ya saturado.

Este documento invierte ese orden. Antes de escribir una lección nueva, se pasa por aquí:

1. Se elige el eje y la unidad del temario (§4).
2. Se define el **descubrimiento** — el insight central (§2, paso 5).
3. Se elige un dominio de contexto **fuera de las zonas saturadas** (§6).
4. Se distribuyen las habilidades entre los ítems PAES (§3).
5. Se calibra la dificultad (§5).
6. Se construyen los distractores desde el catálogo de errores (§7).
7. Se pasa el checklist de publicación (§9).

---

## 2. La arquitectura de 10 pasos

El orden es fijo y el validador lo exige (`ORDEN_PASOS` en `scripts/validar-contenido.mjs`). Lo que sigue no cambia la estructura: la hace más exigente en lo que cada paso debe lograr.

### La lógica del arco completo

Los 10 pasos no son diez pantallas: son **un solo movimiento** que va de "no sé que tengo un problema" a "tengo una herramienta que puedo usar en la prueba". El error más común al escribir lecciones es tratar cada paso como una casilla que llenar. La prueba de que el arco funciona es simple: **si el estudiante pudiera saltarse el paso 5 y aún así hacer los ejercicios, la lección falló** — significa que enseñamos el procedimiento antes de que el estudiante sintiera la necesidad de tenerlo.

| # | Paso | Función | Criterio de aprobación |
|---|---|---|---|
| 1 | `curiosidad` | Enganchar sin enseñar nada | El estudiante quiere saber la respuesta antes de que se le pida hacer algo |
| 2 | `problema` | Crear la necesidad del método | Adivinar deja de ser viable. La dificultad sube lo justo para que la intuición no alcance |
| 3 | `pensar` | Registrar el intento genuino | Hay respuesta del estudiante ANTES de cualquier ayuda. Este es el dato pedagógico más valioso de la lección |
| 4 | `pistas` | Reorientar sin regalar | 2–3 pistas graduadas. Ninguna contiene la respuesta ni el nombre del concepto |
| 5 | `descubrimiento` | **El corazón.** El insight se construye | El estudiante puede explicar el porqué, no solo el cómo. Se diseña PRIMERO, antes que el resto |
| 6 | `generalizacion` | Recién aquí se nombra el concepto | Aparece la definición, notación y fórmula. Ni un paso antes |
| 7 | `practica` | Automatizar con feedback inmediato | Dificultad progresiva. Cada error tiene feedback que nombra el error |
| 8 | `aplicacion` | Transferir a contexto nuevo | Contexto **distinto** al del descubrimiento. Si es el mismo contexto, no hay transferencia |
| 9 | `reflexion` | Metacognición | El estudiante compara su intento del paso 3 con lo que sabe ahora |
| 10 | `consolidacion` | Puente explícito al formato PAES | Síntesis breve + transición a los `itemsPAES` |

### Reglas de escritura por paso

**Paso 1 — `curiosidad`.** Bloque `prediccion` o `texto`. Nunca introduce notación. La predicción crea inversión emocional: el estudiante que apostó un número quiere saber si acertó. Si el estudiante puede acertar "a ojo", está bien — el punto es que en el paso 2 descubra que "a ojo" no escala.

**Paso 2 — `problema`.** Sube la escala del mismo fenómeno del paso 1, no cambia de tema. La continuidad narrativa importa: es el mismo mundo, más difícil.

**Paso 3 — `pensar`.** Bloque de respuesta abierta o de selección. **Se registra el intento en PostHog.** Este es el único punto de la lección donde el error del estudiante es información limpia, sin contaminar por ayuda previa.

**Paso 4 — `pistas`.** Gradación real: pista 1 reorienta la atención, pista 2 sugiere una estrategia, pista 3 (si existe) da el primer movimiento. Ninguna nombra el concepto — eso es del paso 6.

**Paso 5 — `descubrimiento`.** Preferentemente bloque `interactivo` (slider) o `visualizacion`. El estudiante manipula y observa el patrón. **Este paso se escribe primero y se valida antes de redactar el resto de la lección.** Si el descubrimiento no está claro, la lección no existe todavía.

**Paso 6 — `generalizacion`.** Aquí y solo aquí aparecen: el nombre del concepto, la definición formal, la notación, la fórmula. Incluye un ejemplo trabajado y un ejercicio con cifras **distintas a las del ejemplo** (esta fue una corrección real aplicada en L3).

**Paso 7 — `practica`.** 2–4 ejercicios cortos, dificultad creciente. Feedback inmediato por error, referenciado al `catalogoErrores`.

**Paso 8 — `aplicacion`.** Contexto realista **nuevo**. El chequeo es: si cambio el contexto del paso 5 por el del paso 8 y la lección sigue funcionando igual, no hay transferencia real.

**Paso 9 — `reflexion`.** Pregunta abierta que fuerza la comparación con el paso 3. No se corrige: se guarda.

**Paso 10 — `consolidacion`.** Síntesis de 3–5 líneas + frase de puente que anuncia explícitamente que lo que viene es formato de prueba real.

---

## 3. Las 4 habilidades PAES

Definiciones tomadas del temario oficial DEMRE. Todo ítem declara exactamente una en el campo `habilidad`.

### 3.1 Resolver problemas
Solucionar una situación problemática, contextualizada o no, rutinaria o no, con o sin procedimiento indicado. Incluye realizar cálculos, aplicar conocimientos y estrategias, e interpretar y evaluar los resultados.

*Criterios oficiales:* resuelve situaciones rutinarias con operatoria básica; resuelve situaciones que requieren estrategia; evalúa la validez del resultado obtenido.

**Cómo se ve un ítem de esta habilidad:** hay un dato objetivo que encontrar. El estudiante ejecuta un procedimiento y llega a un número o expresión.

### 3.2 Modelar
Usar, entender y comparar expresiones matemáticas que describen las características relevantes de una situación real, para estudiarla y obtener soluciones.

*Criterios oficiales:* usa modelos matemáticos en una situación planteada; interpreta parámetros y supuestos de un modelo; ajusta modelos según la situación; evalúa modelos según la situación.

**Cómo se ve:** el estudiante NO calcula el resultado — **elige o construye la expresión** que representa la situación. La alternativa correcta es una fórmula o ecuación, no un número.

### 3.3 Representar
Transferir información entre sistemas de representación mediante símbolos matemáticos: tablas, gráficos, diagramas, recta numérica, plano cartesiano.

*Criterios oficiales:* traduce del lenguaje natural al matemático y viceversa; interpreta información de distintos tipos de representación; transfiere una situación de un sistema de representación a otro.

**Cómo se ve:** las alternativas son tablas, gráficos o diagramas. El estudiante lee o traduce, no calcula.

### 3.4 Argumentar
Reconocer, explicar y justificar la validez de un procedimiento o deducción; y detectar argumentos erróneos del tipo "si se tiene esto, entonces se cumple esto otro".

*Criterios oficiales:* evalúa la validez de argumentos; identifica errores en procedimientos o demostraciones; evalúa la validez de una deducción.

**Cómo se ve:** las alternativas son afirmaciones. La pregunta suele ser "¿cuál es verdadera?" o "¿cuál es FALSA?". El estudiante evalúa, no calcula.

### 3.5 Regla de distribución en `itemsPAES`

Cada lección cierra con 2–3 ítems. La distribución mínima:

- **Con 2 ítems:** uno de `resolver` + uno de `representar` o `argumentar`.
- **Con 3 ítems:** uno de `resolver` + uno de `modelar` o `representar` + uno de `argumentar`.

**Nunca los 2–3 ítems de la misma habilidad.** Un cierre de lección con tres ítems de `resolver` entrena aritmética, no competencia matemática — y deja al estudiante sin preparación para el ~50% de la prueba real que no es cálculo directo.

**Nota sobre `argumentar`:** es la habilidad peor entrenada en el mercado y la que más diferencia puede hacer. Un ítem de argumentar bien construido (4 afirmaciones, 3 falsas por razones *distintas y catalogadas*) enseña más que cinco ejercicios de cálculo. Se prioriza incluirla.

---

## 4. Matriz de cobertura del temario M1

### 4.0 Alcance vigente — módulo "Función lineal y afín" (Enmienda 2, mos-v2.md §13, 2026-07-28)

**Vocabulario:** eje → módulo → lección. 4 ejes, 16 módulos, N lecciones por módulo. "Módulo"
reemplaza a "tema" en todo este documento; "lección" se conserva.

**Alcance:** el MVP v1 ya no está acotado a un solo módulo. La plataforma cubre los 16 módulos
del temario M1 (matriz en §4.1, que deja de ser referencia post-Gate 2 y pasa a ser el mapa de
trabajo vigente). La unidad de producción es el módulo completo (diagnóstico → lecciones →
cierre); no se abre un módulo nuevo antes de cerrar el anterior. Derogada: "ninguna lección
fuera de esta secuencia se escribe antes del Gate 2".

Secuencia del módulo "Función lineal y afín" (el primero en construirse, sin cambios en esa
prioridad):

| Pieza | Contenido | Estado | Id nuevo |
|---|---|---|---|
| Diagnóstico | 5 ítems | — | — |
| **Lección 1** | Patrones de cambio | `publicable` | `funcion-lineal-y-afin-patrones-de-cambio` (antes `l1-patrones-de-cambio`) |
| **Lección 2** | Pendiente e intercepto, gráfico interactivo de sliders (**la interacción insignia**) | `publicable` | `funcion-lineal-y-afin-pendiente-e-intercepto` (antes `l2-pendiente-e-intercepto`) |
| **Lección 3** | Modelamiento PAES | por escribir | `funcion-lineal-y-afin-modelamiento-paes` (nueva) |
| Cierre | 8 ítems formato PAES | — | — |

"Traducción entre representaciones" se elimina como lección propia. Razón: pendiente e
intercepto ya recorre tabla → gráfico → ecuación, y modelamiento PAES es por definición
traducir un enunciado a una representación; una lección dedicada duplicaría a las otras dos.

**Discrepancia de l3 (abierta 2026-07-22) — resuelta.** `l3-ecuaciones-lineales` no estaba
fuera de spec: estaba archivado en el módulo equivocado. Pertenece al módulo "Ecuaciones e
inecuaciones de primer grado", no a "Función lineal y afín". Se reubica; esto explica la
superposición L1/L3 detectada. Id nuevo: `ecuaciones-e-inecuaciones-primer-grado-ecuaciones-lineales`
(antes `l3-ecuaciones-lineales`).

**Namespace de ids.** Formato `{modulo}-{slug}`, sin número correlativo. El orden vive solo en
código (`lib/temas.ts` o su sucesor), nunca en el id. Esta tabla documenta el mapeo; el
renombrado real de archivos y de `lib/temas.ts` es trabajo aparte, no incluido en esta
enmienda (que es solo documentación).

**Gate 2.** Suspendido, sin criterio métrico. Revisión: 2026-10-31. Razón: no hay
instrumentación de comportamiento de usuarios por decisión explícita, así que un gate basado
en métricas sería letra muerta. No se inventa un criterio sustituto mientras eso siga así.

**Precedencia.** Esta sección es espejo operativo de `mos-v2.md` §13 (Enmienda 2). Ante
cualquier discrepancia futura, manda el MOS.

---

### 4.1 Matriz completa del temario M1 — mapa de trabajo vigente (16 módulos)

**Nota (2026-08-05): la columna "Contenidos" de esta tabla es un resumen de una línea por
módulo, derivado a mano en una sesión anterior — no es citable como fuente. Al menos 8 de los
16 resúmenes omiten, funden o alteran algo del descriptor real (detalle: sesión de trabajo del
DAG M1, 2026-08-05). La fuente citable es `docs/temario-demre-m1-2027.md`, transcripción
textual verificable con grep. Esta tabla no se reescribe todavía; sirve solo de referencia
rápida de alcance, no de texto a citar.**

Desde la Enmienda 2 (mos-v2.md §13, 2026-07-28), esta matriz **es** el mapa de trabajo: cada
fila es uno de los 16 módulos que se construyen, un módulo completo a la vez, en el orden que
se defina. La columna "Estado" ya no distingue "cubierto vs. excluido de alcance": distingue
construido vs. por construir.

Fuente: temario oficial DEMRE.

#### Eje: NÚMEROS

| Módulo | Contenidos | Estado |
|---|---|---|
| Conjunto de enteros y racionales | Operaciones y orden en ℤ; operaciones y comparación en ℚ; problemas en contexto | No |
| Porcentaje | Concepto y cálculo; problemas en diversos contextos | No |
| Potencias y raíces enésimas | Propiedades de potencias de base y exponente racional; descomposición y propiedades de raíces en ℝ; problemas | No |

#### Eje: ÁLGEBRA Y FUNCIONES

| Módulo | Contenidos | Estado |
|---|---|---|
| Expresiones algebraicas | Productos notables; factorizaciones y desarrollo; operatoria; problemas | No |
| Proporcionalidad | Proporción directa e inversa y sus representaciones; problemas | No |
| Ecuaciones e inecuaciones de primer grado | Resolución de ecuaciones lineales; resolución de inecuaciones lineales; problemas de ambas | Parcial — incluye la lección reubicada desde función lineal y afín (`ecuaciones-e-inecuaciones-primer-grado-ecuaciones-lineales`, ver §4.0) |
| Sistemas de ecuaciones lineales (2×2) | Resolución; problemas | No |
| **Función lineal y afín** | Concepto; tablas y gráficos; problemas | **En construcción — 3 lecciones (ver §4.0)** |
| Función cuadrática | Ecuaciones de segundo grado; tablas y gráficos y variación de parámetros; vértice, ceros e intersecciones; problemas | No |

#### Eje: GEOMETRÍA

| Módulo | Contenidos | Estado |
|---|---|---|
| Figuras geométricas | Teorema de Pitágoras; perímetro y área de triángulos, paralelogramos, trapecios y círculos; problemas | No |
| Cuerpos geométricos | Área de superficie y volumen de paralelepípedos, cubos y cilindros; problemas | No |
| Transformaciones isométricas | Puntos y vectores en el plano cartesiano; rotación, traslación y reflexión; problemas | No |
| Semejanza y proporcionalidad de figuras | Propiedades de semejanza y proporcionalidad aplicadas a modelos a escala y situaciones reales | No |

#### Eje: PROBABILIDAD Y ESTADÍSTICA

| Módulo | Contenidos | Estado |
|---|---|---|
| Representación de datos (tablas y gráficos) | Frecuencia absoluta y relativa; tipos de gráficos; promedio; problemas | No |
| Medidas de posición | Cuartiles y percentiles de uno o más grupos; diagrama de cajón; problemas | No |
| Reglas de las probabilidades | Probabilidad de un evento; regla aditiva y multiplicativa; problemas | No |

### 4.2 Ponderación observada en pruebas completas

El benchmark de un ensayo completo de 65 ítems muestra esta distribución aproximada, consistente con lo esperable del temario:

| Eje | Proporción aproximada |
|---|---|
| Números | ~20 % |
| Álgebra y funciones | ~35 % |
| Geometría | ~23 % |
| Probabilidad y estadística | ~23 % |

**Cómo se usa este dato — y cómo no.**

*Uso correcto:* respalda la elección de tema del MVP v1. Álgebra y funciones es el eje de mayor peso de la prueba (~35 %), y dentro de él, función lineal y afín es la unidad con más superficie. Empezar ahí no fue arbitrario: es el punto de máximo retorno por lección construida. Sirve como argumento de venta concreto para la preventa.

*Uso incorrecto (previo a la Enmienda 2):* leer los ejes sin cubrir como alcance excluido. Desde el 2026-07-28 los huecos de esta matriz **sí son roadmap**: son los módulos que faltan construir, en el orden que se defina, un módulo completo a la vez. El criterio de secuencia no es de cobertura de examen sino de producción: no se abre un módulo nuevo antes de cerrar el anterior (§4.0).

---

## 5. Calibración de dificultad

El campo `dificultad` acepta `baja`, `media`, `alta`. Los criterios operativos:

| Nivel | Definición operativa | Señal de reconocimiento |
|---|---|---|
| `baja` | Un paso de razonamiento. Aplicación directa de una definición o una operación | El estudiante que sabe el concepto responde sin escribir nada intermedio |
| `media` | Dos a tres pasos encadenados, o un paso con traducción desde lenguaje natural | Requiere anotar un paso intermedio |
| `alta` | Tres o más pasos, o combinación de dos conceptos distintos, o requiere plantear una relación antes de resolver | El estudiante debe decidir una estrategia antes de calcular |

### 5.1 Perfil de dificultad dentro de una lección

En `practica` (paso 7) la progresión es estricta: **baja → media → media/alta**. Nunca empezar en alta: el objetivo del paso 7 es consolidar, no filtrar.

En `itemsPAES` la distribución objetivo es:

- Con 2 ítems: una `media` + una `media` o `alta`.
- Con 3 ítems: `baja`/`media`, `media`, `alta`.

**No incluir ítems de dificultad `baja` como único cierre.** El cierre debe ser representativo de lo que el estudiante va a enfrentar, no una recompensa fácil.

### 5.2 Observación del benchmark

En una prueba completa la dificultad no sube monotónicamente de la 1 a la 65: sube **dentro de cada bloque temático** y se reinicia al cambiar de eje. Los bloques de geometría y de álgebra concentran los ítems de mayor demanda cognitiva (varios teoremas encadenados, sistemas de dos relaciones). Los bloques de números y de estadística tienen más ítems de un paso.

Implicación para nosotros: cuando construyamos un ensayo completo propio, el orden no es "fácil primero, difícil después" sino **agrupado por eje, con progresión interna**.

---

## 6. Zonas de contexto saturadas — evitar

Registro acumulado de dominios de contexto que colisionan con el corpus público (DEMRE liberado, Mineduc/UCE, material comercial de amplia circulación). Escribir en estas zonas produce rechazo casi garantizado.

| Zona saturada | Por qué | Estado |
|---|---|---|
| **"Cargo fijo + tarifa variable"** (planes de celular, taxi, empresas de transporte, arriendo de maquinaria) | Es el molde canónico de función afín en el corpus DEMRE/Mineduc. Causó 4 rondas de rechazo en L1 | **Prohibida** en dominios transaccionales/comerciales |
| **Caja de ahorro de curso / ahorro escolar** | Ecoa una actividad del currículum oficial Mineduc | Prohibida |
| **"Cuánto había antes de comenzar los registros"** (framing de backward-solve sobre un conteo) | Ecoa un ítem real DEMRE 2024 | Prohibida como framing |
| Comparación de dos empresas de servicio con tarifas distintas | Actividad Mineduc de transporte escolar | Prohibida |

### 6.1 Procedimiento antes de fijar un contexto

1. Proponer **3 candidatos** de dominio, no uno. El primero casi siempre es el canónico.
2. Correr `consultar-fuentes.mjs` sobre cada candidato (dominio, cifras y plantilla de enunciado).
3. Si vuelve SÍ en cualquiera de las tres dimensiones, descartar el candidato completo — no ajustarlo.
4. Registrar el contexto elegido y sus cifras en `contextosNumericos` para que ninguna otra lección los repita.

**Nota sobre el paso 3:** el patrón de fallo repetido en L1 fue intentar "salvar" un candidato ajustándole el sujeto o una frase. No funcionó ninguna de las dos veces. Un candidato que colisiona se abandona entero.

---

## 7. Catálogo transversal de patrones de distractor

Estos son mecanismos de error genéricos de la didáctica de la matemática — no contenido de nadie. Sirven como generadores: para cada ítem nuevo, recorrer esta lista y preguntarse "¿cuál de estos errores produciría un estudiante real aquí?".

**Regla:** cada distractor debe ser **el resultado de un error específico y nombrable**, registrado en `catalogoErrores` y referenciado con `errorCatalogado`. Un distractor que no corresponde a ningún error real es ruido: no enseña nada y baja la calidad del ítem.

### 7.1 Errores de operatoria

| Patrón | Mecanismo | Aplica a |
|---|---|---|
| Signo perdido o invertido | Omitir un negativo al despejar o al distribuir | Álgebra, ecuaciones |
| Orden de operaciones alterado | Dividir antes de restar, sumar antes de multiplicar | Números, álgebra |
| Coeficiente ignorado | Resolver `ax = c` y entregar `c` sin dividir por `a` | Ecuaciones |
| Incógnitas mal reunidas | Sumar en vez de restar al pasar términos de lado | Ecuaciones |

### 7.2 Errores de traducción y modelado

| Patrón | Mecanismo | Aplica a |
|---|---|---|
| Razón invertida | Plantear `a/b` cuando corresponde `b/a` | Proporcionalidad, escala, velocidad |
| Confusión parte/todo | Calcular el porcentaje sobre la parte y no sobre el total (o al revés) | Porcentaje |
| Unidades no convertidas | Mezclar horas con minutos, metros con centímetros | Números, geometría, proporcionalidad |
| Relación aditiva vs. multiplicativa | Sumar una diferencia constante donde hay factor constante, o al revés | Funciones, patrones |

### 7.3 Errores conceptuales

| Patrón | Mecanismo | Aplica a |
|---|---|---|
| Confusión de objetos del mismo género | Intercambiar conceptos que se aprenden juntos y se parecen (por ejemplo, distintos centros notables de un triángulo, o media/mediana/moda) | Geometría, estadística |
| Complemento no aplicado | Entregar `P(A)` cuando se pide `P(no A)`, o viceversa | Probabilidad |
| Extremo de intervalo mal incluido | Tratar un intervalo abierto como cerrado | Inecuaciones, tablas de frecuencia |
| Patrón confundido con constancia | Detectar que "hay regularidad" y concluir que el cambio es constante, cuando el salto crece | Funciones, patrones |

### 7.4 Errores de lectura de representación

| Patrón | Mecanismo | Aplica a |
|---|---|---|
| Eje mal leído | Leer el valor del eje equivocado o el intercepto como pendiente | Gráficos |
| Frecuencia vs. valor | Confundir cuántos datos hay con cuánto valen | Tablas de frecuencia |
| Sobreinferencia de datos agrupados | Concluir un valor puntual desde datos agrupados en intervalos, donde no es determinable | Estadística |

### 7.5 Estructura del feedback de un distractor

El feedback no dice "incorrecto". Tiene tres partes:

1. **Nombra el error** en términos del razonamiento del estudiante, no del profesor.
2. **Reconoce lo que sí estaba bien**, si algo lo estaba.
3. **Reorienta** sin entregar la respuesta.

Ejemplo del formato (de L1, sobre una alternativa que baja pero con diferencias irregulares):

> "Esta es la trampa fina del ítem. La tabla baja, y bajar con cambio constante es posible. Pero resta: −2, −1, −2. La diferencia del medio es distinta. TODAS las restas deben coincidir, sin excepción."

Ese feedback vale más que el ítem. Es el punto donde efectivamente enseñamos.

---

## 8. Estándares de calidad — lecciones de un contraejemplo

El análisis del material comercial de referencia expuso fallas de control de calidad que definen, por contraste, nuestro estándar mínimo.

**Hallazgo: solucionario internamente contradictorio.** En al menos un ítem, la resolución llega a un resultado, declara una alternativa como correcta, y el propio texto admite que eso contradice la clave marcada antes — sin resolver la contradicción. El documento se publicó así.

**Qué implica para nosotros:**

1. **Toda solución se recalcula desde cero**, sin mirar la clave declarada. Si el recálculo no coincide con la clave, el ítem se corrige o se descarta; nunca se "ajusta la explicación".
2. **La clave se deriva de la solución, no al revés.** Escribir primero "la correcta es C" y después justificarlo es cómo se producen estas contradicciones.
3. **La verificación aritmética es un paso separado** de la redacción, ejecutado por el subagente `revisor-matematico`, y su resultado no es autocertificable.
4. **Ningún archivo pasa a `publicable` sin firma manual** de Benja en `checklistOriginalidad` y `revisionMatematica`, con nombre y fecha. Un agente no puede firmar por sí mismo, y no se acepta una nota interna que afirme haber sido "confirmada con el autor" sin firma real.

Este es el diferenciador real frente al material comercial disponible: no es tener más ejercicios, es que **cada ítem sea correcto y cada error tenga una explicación que enseñe**.

---

## 9. Checklist de publicación

Se corre completo antes de mover cualquier archivo a `estado: "publicable"`.

### Estructura
- [ ] Exactamente 10 pasos, en el orden de `ORDEN_PASOS`
- [ ] Cada paso tiene al menos un bloque, del tipo apropiado a su función
- [ ] El paso 5 (`descubrimiento`) fue diseñado y validado ANTES que el resto
- [ ] El contexto del paso 8 (`aplicacion`) es distinto al del paso 5
- [ ] El paso 10 (`consolidacion`) hace puente explícito al formato PAES

### Ítems
- [ ] 2–3 ítems en `itemsPAES`, exactamente 4 alternativas (A–D) cada uno
- [ ] Las habilidades están distribuidas según §3.5 (no todas iguales)
- [ ] La dificultad está distribuida según §5.1
- [ ] Cada distractor tiene `feedback` no vacío
- [ ] Cada distractor referencia un `errorCatalogado` existente en `catalogoErrores`
- [ ] Ningún distractor es arbitrario: todos son producto de un error nombrable

### Matemática
- [ ] Cada solución fue recalculada desde cero, sin mirar la clave
- [ ] La clave declarada coincide con el recálculo independiente
- [ ] Las cifras del ejemplo trabajado y del ejercicio del paso 6 son distintas entre sí
- [ ] `revisionMatematica.aprobada` firmada manualmente con nombre y fecha

### Originalidad
- [ ] `consultar-fuentes.mjs` devolvió NO en dominio, cifras y plantilla
- [ ] El contexto no pertenece a ninguna zona saturada de §6
- [ ] Todos los contextos y cifras quedaron registrados en `contextosNumericos`
- [ ] `proveniencia.fuentesAnalisis` lista solo fuentes usadas para calibración, no como origen de texto
- [ ] `checklistOriginalidad` firmada manualmente con nombre y fecha

### Alcance
- [ ] La lección corresponde a una de las cuatro del MVP v1 (§4.0). Si no corresponde a ninguna, **no se construye**
- [ ] La lección se mantiene dentro del tema de funciones lineales y afines
- [ ] La tabla de §4.0 quedó actualizada con el nuevo estado de esta lección

---

## 10. Cómo usar este documento con Claude Code

Este documento es contexto de entrada, no algo que CC deba modificar por su cuenta.

**Al abrir una sesión de diseño de lección nueva**, el prompt a CC incluye:

1. La referencia a este archivo.
2. Cuál de las cuatro lecciones del MVP v1 se está construyendo (§4.0), citando su descripción textual del MOS §4.
3. La instrucción de proponer **3 candidatos de contexto** y verificarlos con `consultar-fuentes.mjs` **antes** de escribir una sola línea de contenido.
4. La instrucción de diseñar y presentar el paso 5 (`descubrimiento`) para aprobación **antes** de redactar los otros nueve.

**Lo que CC no puede hacer:**

- Marcar cualquier casilla de §9 por sí mismo.
- Cambiar `estado` a `publicable`.
- Escribir en `checklistOriginalidad` o `revisionMatematica`.
- Avanzar al paso siguiente sin aprobación explícita del paso anterior.
- Actualizar este documento sin instrucción directa.
- **Proponer o construir lecciones fuera de la secuencia del MVP v1**, ni siquiera como sugerencia. La especificación está cerrada; expandir alcance antes del Gate 2 se rechaza por defecto.

**Mantención:** §4.0 (estado de las lecciones del MVP) y §6 (zonas saturadas) se actualizan cada vez que se publica una lección o se detecta una colisión nueva. §4.1 y §4.2 solo cambian si cambia el temario oficial. El resto del documento cambia solo si cambia la metodología.

**Precedencia:** si algo en este documento contradice al MOS v2, **manda el MOS**. Este archivo lo implementa, no lo reemplaza.

---

## Anexo: formato de la prueba real

Datos del temario oficial, útiles como referencia al construir simulacros o comunicar a estudiantes.

- **65 preguntas** de selección múltiple, respuesta única, **4 opciones** (A–D)
- **60 preguntas** cuentan para el puntaje; **5** son de experimentación y no puntúan
- **2 horas 20 minutos** de duración
- **No se descuenta puntaje** por respuestas erradas
- Ejes evaluados: Números, Álgebra y funciones, Geometría, Probabilidad y estadística
- Habilidades evaluadas: Resolver problemas, Modelar, Representar, Argumentar
- Conocimientos de referencia: plan de formación general de **7° básico a 2° medio**
- Las figuras son solo indicativas; los gráficos van en ejes perpendiculares

**Implicación directa para el producto:** como no hay descuento por error, la estrategia óptima del estudiante es responder todas las preguntas. Vale la pena que la plataforma lo enseñe explícitamente en algún punto — es información de alto valor y bajo costo que muchos estudiantes no saben.
