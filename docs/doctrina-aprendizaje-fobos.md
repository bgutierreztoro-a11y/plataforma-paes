# Doctrina de aprendizaje de Fobos

**Versión 1 — 2026-09-04**
Base empírica para la construcción de lecciones, feedback, catálogo de errores y Modo PAES.

---

## 0. Para qué sirve este documento

Este documento traduce ~30 trabajos empíricos a **reglas operativas verificables** sobre la arquitectura actual de Fobos (`pasos`, `bloques`, `catalogoErrores`, `itemsPAES`, `contextosNumericos`).

No es un marco teórico. Cada principio tiene cuatro partes:

1. **Qué dice la evidencia** (con la fuente)
2. **Regla operativa** (qué hacemos)
3. **Cómo se ve en el JSON** (dónde vive en el código)
4. **Cómo se verifica** (qué mira `validar-contenido.mjs` / `auditar-leccion.mjs` / el log de respuestas)

Si un principio no llega hasta el punto 4, no está listo para producción.

**Regla madre:** ninguna decisión de diseño entra a Fobos sin una fuente en la sección 11 o una nota explícita de que es una apuesta sin respaldo.

---

## 1. Resumen ejecutivo — las 11 decisiones que la evidencia obliga

| # | Decisión | Fuente principal |
|---|---|---|
| 1 | El estudiante intenta **antes** de recibir instrucción | Kapur 2008, 2014 |
| 2 | El paso de cierre **debe contrastar** los intentos erróneos con el canónico | Loibl, Roll & Rummel 2017 |
| 3 | El sistema **prompt**, no explica; la construcción la hace el estudiante | Chi et al. 2001 |
| 4 | La interacción es a **nivel de paso**, no de respuesta final | VanLehn 2011 |
| 5 | Presupuesto explícito de elementos por pantalla; andamiaje que **se retira** | Sweller 1988; Sweller et al. 2019 |
| 6 | Secuencia ejemplo → completar → resolver, con autoexplicación forzada | Renkl 2014 |
| 7 | La **conversión entre registros** es contenido enseñable, no un supuesto | Duval 2006; Ainsworth 2006 |
| 8 | Recuperar > releer. Todo repaso es recuperación con feedback | Roediger & Karpicke 2006; Dunlosky et al. 2013 |
| 9 | El espaciado se calibra contra la **fecha de la PAES**, no contra "cada 3 días" | Cepeda et al. 2006; Wozniak & Gorzelanczyk 1994 |
| 10 | Criterio de dominio **fijo**, tiempo **variable**, medido con knowledge tracing | Bloom 1968; Corbett & Anderson 1995 |
| 11 | El feedback es corto, sobre la tarea, elaborado y **sin nota al lado** | Shute 2008 |

---

## 2. Principios operativos

### P1 — Intento antes de instrucción (*productive failure*)

**Evidencia.** Kapur (2008, 2014) muestra que estudiantes que intentan resolver un problema novedoso *antes* de recibir instrucción superan a los que reciben instrucción primero — pero solo en **comprensión conceptual y transferencia**, no en fluidez procedimental. El efecto exige dos condiciones: el problema debe admitir múltiples representaciones o vías de solución, y la instrucción posterior debe existir.

**Regla operativa.**
- Toda lección abre con un paso donde el estudiante produce algo (predicción, estimación, clasificación, conjetura) **sin haber recibido la regla**.
- El problema inicial debe admitir al menos 2 caminos plausibles. Si solo hay un camino, no es descubrimiento: es un ejercicio disfrazado.
- El fracaso está permitido y es esperado. **No se penaliza ni se marca en rojo en este paso.**

**En el JSON.** `pasos[0].bloques[]` usa `BloquePrediccion` o `BloqueSeleccion`. Nunca `BloqueTexto` con la regla enunciada.

**Verificación.** Auditar: ninguna lección puede tener el enunciado de la regla formal antes del primer bloque interactivo.

**Límite honesto.** La productive failure **no mejora la fluidez procedimental**. Para eso se necesita práctica directa. En Fobos: descubrimiento para el concepto, práctica espaciada para la velocidad.

---

### P2 — La consolidación contrastiva es obligatoria

**Evidencia.** Loibl, Roll & Rummel (2017) identifican los tres mecanismos por los que "problema antes de instrucción" funciona: (a) activa conocimiento previo, (b) genera **conciencia de la propia laguna**, (c) dirige la atención a los rasgos profundos. El tercero solo ocurre si la instrucción posterior **compara explícitamente las soluciones del estudiante con la canónica**.

**Esto es el hallazgo más importante del documento.** Sin el paso de contraste, el intento fallido no enseña nada. La failure sin consolidación es solo failure.

**Regla operativa.**
- Después de cada intento fallido, el paso siguiente **nombra el camino equivocado** antes de mostrar el correcto.
- El nombre del camino equivocado sale del `catalogoErrores`, no se inventa.
- Formato: *"Mucha gente hace X. X falla porque Y. Lo que sí funciona es Z."*

**En el JSON.** El bloque de consolidación referencia `errorCatalogado` de los distractores del paso anterior. Un paso de descubrimiento sin contraste posterior es un bug de contenido.

**Verificación.** Regla de auditoría nueva: todo `BloquePrediccion` / `BloqueSeleccion` con distractores catalogados debe tener, en el mismo `paso` o el siguiente, un bloque que mencione al menos un `errorCatalogado` de esos distractores.

---

### P3 — El estudiante construye; el sistema no explica

**Evidencia.** Chi, Siler, Jeong, Yamauchi & Hausmann (2001) hicieron el experimento decisivo: suprimieron las explicaciones del tutor humano y lo dejaron solo con prompts. **Los estudiantes aprendieron lo mismo.** La efectividad del tutoring viene de la construcción del estudiante, no de la calidad de la explicación del tutor.

Graesser, Person & Magliano (1995) describen el patrón de 5 pasos del tutoring real: pregunta → respuesta → feedback breve → **mejora colaborativa de la respuesta** → verificación. El paso 4 es donde ocurre el aprendizaje y es el que casi todas las plataformas omiten.

**Regla operativa.**
- Ninguna explicación de Fobos supera el largo de lo que el estudiante acaba de producir.
- Después de una respuesta parcialmente correcta, el sistema **mejora la respuesta con el estudiante**, no la reemplaza. Ese es un bloque, no un párrafo.
- Los prompts siguen la taxonomía de Paul & Elder (2006): clarificación, supuestos, evidencia, implicaciones, y la pregunta sobre la pregunta.

**Consecuencia estratégica.** Esto es la justificación empírica de que Fobos **no necesita un tutor de IA** para igualar a un tutor humano. El efecto no vive en la explicación.

---

### P4 — Interacción a nivel de paso, no de respuesta

**Evidencia.** VanLehn (2011) es el resultado más citado y el más malentendido del área. Tutoring humano: ~0.79 SD. Sistemas tutores inteligentes: ~0.76 SD. La diferencia entre ambos es **mucho menor de lo que se asume** (no hay 2 sigma). El factor que sí discrimina es la **granularidad de la interacción**: los sistemas *step-based* igualan al tutor humano; los *answer-based* (responder y ver si estuvo bien) son marcadamente peores.

**Regla operativa.**
- La unidad de interacción es el paso intermedio, no el resultado final.
- Un ítem PAES presentado como "elige A/B/C/D → correcto/incorrecto" es answer-based y desperdicia el efecto. En Modo PAES debe descomponerse en al menos una decisión intermedia (descarte, estimación, elección de estrategia, conversión de registro).

**Esto es la base pedagógica del modo descarte.** No es un truco de test-taking: es convertir un ítem answer-based en uno step-based.

---

### P5 — Carga cognitiva: presupuesto por pantalla

**Evidencia.** Sweller (1988) y Sweller, van Merriënboer & Paas (2019). Efectos aplicables directamente:

- **Atención dividida.** Texto y figura separados obligan a integrarlos en memoria de trabajo. Integrar el rótulo *dentro* de la figura.
- **Redundancia.** La misma información en dos formatos simultáneos **daña**. No repetir en prosa lo que la figura ya dice.
- **Reversión por pericia.** El andamiaje que ayuda al novato **perjudica** al que ya sabe. El apoyo debe retirarse.
- **Efecto goal-free.** Preguntar "encuentra X" fuerza análisis medios-fines, que consume casi toda la memoria de trabajo. Preguntar "¿qué puedes deducir de esto?" reduce la carga drásticamente y es **ideal para el paso de descubrimiento**.

**Regla operativa.**
- Máximo un concepto nuevo por paso.
- Rótulos dentro del SVG, nunca en un párrafo aparte.
- El paso 1 de descubrimiento se formula goal-free siempre que sea posible.
- El andamiaje se retira a partir del tercer encuentro con la misma habilidad.

**En el JSON.** Los componentes `Ilustracion*` y `Grafico*` llevan los rótulos. Prohibido duplicar el dato en `BloqueTexto`.

---

### P6 — Ejemplo → completar → resolver

**Evidencia.** Renkl (2014): los ejemplos resueltos son eficaces **solo si el estudiante los autoexplica**; el estudio pasivo de ejemplos no produce aprendizaje. La secuencia óptima es *fading*: ejemplo completo → ejemplo con pasos omitidos → problema completo. Los pares ejemplo-problema superan a las series de problemas.

**Regla operativa.**
- Todo procedimiento nuevo entra como ejemplo resuelto con **un prompt de autoexplicación obligatorio** ("¿por qué en este paso se multiplicó y no se sumó?").
- Segundo encuentro: mismo ejemplo con un paso en blanco.
- Tercer encuentro: problema completo.
- Nunca lanzar al estudiante a un problema completo sin haber pasado por las dos etapas previas.

**En el JSON.** El paso de autoexplicación es un `BloqueSeleccion` con distractores catalogados, no un `BloqueAbierta` (no evaluable automáticamente).

---

### P7 — La conversión entre registros es contenido enseñable

**Evidencia.** Duval (2006) es el trabajo más subutilizado del set y el más rentable para la PAES M1. Los objetos matemáticos solo son accesibles a través de representaciones semióticas. Existen dos operaciones distintas:

- **Tratamiento:** transformar dentro de un mismo registro (despejar una ecuación).
- **Conversión:** pasar de un registro a otro (texto → ecuación, tabla → gráfico, gráfico → función).

Hallazgo central: **las conversiones son la principal fuente de fracaso y no se adquieren automáticamente con el tratamiento.** Un estudiante puede dominar el álgebra y fallar sistemáticamente cuando el enunciado viene en tabla.

Ainsworth (2006, DeFT) complementa: múltiples representaciones ayudan solo si el estudiante **traduce activamente entre ellas**. Mostrar tres representaciones lado a lado sin exigir traducción no sirve.

Paivio (1986) sostiene el porqué: los sistemas verbal e icónico son distintos y las conexiones referenciales entre ellos hay que construirlas.

**Regla operativa — y esto cambia el modelo de datos.**
- Cada `itemPAES` se clasifica también por **par de registros** (`origen` → `destino`): texto→algebraico, tabla→algebraico, gráfico→numérico, figura→numérico, algebraico→gráfico, etc.
- Existen bloques cuya tarea es **solo la conversión**, sin resolver: *"¿cuál de estas ecuaciones representa esta tabla?"*
- El diagnóstico distingue `no domina el contenido` de `no convierte de registro`. Son intervenciones distintas.

**Por qué importa comercialmente.** "Fallas en probabilidad" lo dice cualquiera. **"Sabes probabilidad, pero pierdes puntos cuando viene en tabla"** no lo dice nadie, y es accionable en una tarde.

---

### P8 — Recuperar, no releer

**Evidencia.** Roediger & Karpicke (2006) y Roediger & Butler (2011): recuperar desde la memoria produce retención muy superior a reestudiar, y la ventaja **crece con el intervalo de retención** — exactamente el escenario PAES. El feedback amplifica el efecto.

Dunlosky et al. (2013) clasifican por utilidad:

| Utilidad ALTA | Utilidad MODERADA | Utilidad BAJA |
|---|---|---|
| Práctica de recuperación | Autoexplicación | Resumir |
| Práctica distribuida | Interrogación elaborativa | Subrayar |
| | Práctica intercalada | Releer |
| | | Mnemotecnia de palabra clave |

**Regla operativa.**
- Fobos **no tiene resúmenes de contenido**. Ninguna pantalla es "leer para repasar".
- Todo repaso es una pregunta con feedback.
- **Intercalado:** las sesiones de repaso mezclan habilidades, no las agrupan. Agrupar entrena la ejecución; intercalar entrena **elegir el método**, que es lo que la PAES evalúa.

**Consecuencia directa:** la "microlección de refuerzo" que aparecía en el documento V1 del Modo PAES es utilidad BAJA si es texto expositivo. Debe ser recuperación con feedback o no existir.

---

### P9 — Espaciado calibrado a la fecha de la PAES

**Evidencia.** Ebbinghaus (1885) estableció la curva del olvido y que el reaprendizaje es más rápido que el aprendizaje inicial. Cepeda, Pashler, Vul, Wixted & Rohrer (2006) dieron el resultado cuantitativo: **el intervalo óptimo entre repasos escala con el intervalo de retención deseado**, en el orden del 10–20% de este.

Wozniak & Gorzelanczyk (1994) aportan el algoritmo implementable (SM-2): un E-factor por ítem, intervalos I(1)=1 día, I(2)=6 días, I(n)=I(n−1)×EF, con piso EF=1.3.

**Regla operativa.**
- Fobos conoce la fecha de rendición. El intervalo objetivo se calcula contra ella, no contra una constante.
- `intervalo ≈ 0.15 × días_restantes_hasta_la_PAES`, acotado entre 1 y 30 días.
- A 6 meses de la prueba: repasos cada ~3–4 semanas. A 3 semanas: repasos cada 2–3 días.
- Se aplica SM-2 sobre el **error catalogado**, no sobre el ítem. El ítem se repite; el error es lo que se retiene.

**Diferenciador.** Nadie en el mercado chileno calibra el espaciado contra la fecha real de la rendición. Es barato, es defendible con la literatura, y es visible para el estudiante: *"esto te toca repasarlo el 14 de octubre, no antes."*

---

### P10 — Dominio: criterio fijo, tiempo variable

**Evidencia.** Bloom (1968, *Learning for Mastery*): el criterio se fija y lo que varía es el tiempo, con evaluación formativa + correctivos. Los correctivos deben ser **distintos** de la instrucción original, no una repetición.

Kulik, Kulik & Bangert-Drowns (1990), meta-análisis: efecto promedio ≈ **0.5 SD** en pruebas de logro, mayor en estudiantes de menor rendimiento previo. Los mismos autores señalan el costo: mastery learning **aumenta el tiempo requerido**.

Bloom (1984, *2 Sigma*) reporta 2 SD para tutoring 1:1 + mastery. **Ese resultado no se ha replicado y no debe usarse como promesa comercial.** El rango defendible es 0.5–0.8 SD.

Corbett & Anderson (1995) dan el instrumento: **knowledge tracing bayesiano**, 4 parámetros por habilidad.

**Implementación concreta para Fobos.**

Estado por error catalogado: `p(L)` = probabilidad de que el error esté corregido.

Parámetros iniciales (justificados por el formato PAES de 4 alternativas):

```
p(L0) = 0.30   conocimiento previo
p(T)  = 0.15   probabilidad de aprender por oportunidad
p(G)  = 0.25   adivinar (1/4 alternativas — dato del formato oficial)
p(S)  = 0.10   equivocarse sabiendo
umbral de dominio: p(L) >= 0.95
```

Actualización tras cada respuesta:

```
acierto:   p(L|ev) = p(L)(1-p(S)) / [ p(L)(1-p(S)) + (1-p(L))p(G) ]
error:     p(L|ev) = p(L)p(S)     / [ p(L)p(S)     + (1-p(L))(1-p(G)) ]
luego:     p(L') = p(L|ev) + (1 - p(L|ev)) * p(T)
```

**Esto es todo el "motor adaptativo".** Son cuatro líneas, no hay IA, y cada recomendación es explicable al estudiante: *"llevas 3 aciertos seguidos en este error; el sistema estima 96% de que ya lo cerraste."*

**Regla operativa.**
- El estado `abierto → en observación → cerrado` del error se deriva de `p(L)`, no de un contador de aciertos.
- El correctivo de un error cerrado que reaparece **debe usar un registro distinto** (Bloom: los correctivos son distintos de la instrucción original; aquí se une con P7).

---

### P11 — Feedback: reglas de Shute

**Evidencia.** Shute (2008) es la síntesis operativa del feedback formativo. Reglas que aplican a Fobos:

**Hacer:**
- Foco en la **tarea**, no en la persona. *"Este paso multiplicó donde correspondía sumar"*, nunca *"te apuraste"*.
- Específico y claro. La ambigüedad es peor que el silencio.
- **Feedback elaborado > verificación sola.** Decir solo "incorrecto" es la forma más débil.
- Presentar en unidades manejables. Feedback largo se ignora.
- Reducir la incertidumbre sobre "dónde estoy respecto de la meta".

**No hacer:**
- **No poner la nota al lado del feedback.** La calificación normativa junto al feedback anula el efecto del feedback: el estudiante mira el número y no lee.
- No elogiar la capacidad ("eres bueno en esto").
- No dar la respuesta demasiado pronto: elimina la recuperación.
- No comparar con otros estudiantes.

**Matiz relevante:** para estudiantes de bajo rendimiento funciona mejor el feedback **directivo y correctivo**; para los de alto rendimiento, el **facilitativo** (pistas). Fobos ya tiene la señal para distinguirlos: `p(L)` de P10.

**Regla operativa — estructura fija del feedback de error:**

```
1. Qué pasó        (1 frase, nombra el error del catálogo)
2. Por qué falla   (1-2 frases)
3. Resolución      (pasos, escaneable)
4. Idea clave      (1 frase, transferible)
```

Tope duro: **60 palabras** en los puntos 1, 2 y 4 combinados. La resolución no cuenta.

**Consecuencia de diseño:** en la pantalla de resultado de sesión, el puntaje y el feedback **no van juntos**. Primero el feedback por error; el marcador va después o en otra vista.

---

## 3. Anatomía de una lección Fobos

Secuencia derivada de P1, P2, P3, P5, P6 y P7. Es la estructura canónica; toda lección nueva la sigue salvo justificación escrita en `proveniencia`.

| Paso | Función | Base | Bloque típico |
|---|---|---|---|
| 1 | **Intento sin instrucción.** Goal-free si es posible. Falla permitida. | Kapur; Sweller (goal-free) | `BloquePrediccion` |
| 2 | **Contraste.** Nombra el camino equivocado desde `catalogoErrores`, después el correcto. | Loibl et al. | `BloqueTexto` + `errorCatalogado` |
| 3 | **Formalización mínima.** Un concepto. Rótulos dentro de la figura. | Sweller | `BloqueVisualizacion` |
| 4 | **Ejemplo resuelto + autoexplicación obligatoria.** | Renkl | `BloqueSeleccion` |
| 5 | **Ejemplo con paso omitido** (fading). | Renkl | `BloqueNumerica` |
| 6 | **Conversión de registro explícita.** Mismo objeto, otro registro. | Duval; Ainsworth | `BloqueSeleccion` |
| 7 | **Problema completo, sin andamiaje.** | Sweller (reversión por pericia) | `ItemPAES` |
| 8 | **Recuperación diferida** (aparece en sesión posterior, no aquí). | Roediger; Cepeda | motor de repaso |

Nota: el paso 8 no vive en el archivo de la lección. Es del motor de P9/P10.

---

## 4. Anatomía del catálogo de errores

El `catalogoErrores` de Fobos deja de ser una etiqueta de contenido y pasa a ser **el instrumento de medición del sistema**. Cada entrada necesita:

| Campo | Para qué | Principio |
|---|---|---|
| `id` | Identidad local del archivo | — |
| `descripcion` | Nombre del camino equivocado, usado en el contraste | P2 |
| `registroOrigen` / `registroDestino` | Distinguir laguna de contenido vs. falla de conversión | P7 |
| `nivelDeApoyo` | Directivo vs. facilitativo según `p(L)` | P11 |
| estado derivado `p(L)` | Abierto / en observación / cerrado | P10 |

**Regla que no cambia:** el catálogo se define una vez en L1 y cada archivo posterior embebe copia byte-a-byte del subconjunto que usa. Ninguna referencia global. Ningún ID inventado localmente.

---

## 5. El Modo PAES bajo esta doctrina

Reencuadre de las propuestas anteriores con su respaldo:

| Propuesta | Deja de ser | Pasa a ser | Base |
|---|---|---|---|
| **Modo descarte** | truco de rendición | conversión de un ítem *answer-based* en *step-based* | VanLehn 2011 |
| **2×2 acierto × tiempo** | métrica bonita | detección de automatización incompleta; "correcto y lento" = carga cognitiva no liberada | Sweller et al. 2019 |
| **Ciclo de vida del error** | gamificación blanda | knowledge tracing con umbral de dominio | Corbett & Anderson 1995; Bloom 1968 |
| **Sesión de 5 mixta** | límite de inventario | práctica deliberada: tarea acotada + feedback informativo + repetición correctiva | Ericsson et al. 1993 |
| **Repaso programado** | recordatorio | espaciado calibrado al intervalo de retención real | Cepeda et al. 2006 |
| **Sesiones cortas** | preferencia de UX | límite sostenible de práctica deliberada; es esfuerzo, no entretenimiento | Ericsson et al. 1993 |

**Sobre las 5 preguntas.** Ericsson et al. (1993) definen la práctica deliberada por cuatro condiciones: tarea bien definida en el nivel de dificultad apropiado, feedback informativo, oportunidad de repetir y corregir, y esfuerzo sostenido (no es placentera). También documentan que la cantidad diaria sostenible es limitada. **Sesiones cortas e intensas están respaldadas; sesiones largas no.** Pero el número 5 es arbitrario: lo que la evidencia exige es que la sesión sea corta, intercalada (P8) y con feedback por ítem (P11). El número se calibra con datos propios.

---

## 6. Lo que la evidencia NO respalda — guardarraíles

Cosas que suenan pedagógicas y no lo son. **No entran a Fobos sin evidencia nueva.**

| No hacer | Por qué |
|---|---|
| Resúmenes de contenido para "repasar" | Utilidad baja — Dunlosky et al. 2013 |
| Pantallas de relectura | Utilidad baja — ídem |
| Explicaciones largas después del error | Shute 2008; carga cognitiva |
| Nota/puntaje junto al feedback | Anula el efecto del feedback — Shute 2008 |
| Elogio de capacidad ("eres bueno en esto") | Shute 2008 |
| Andamiaje permanente | Reversión por pericia — Sweller et al. 2019 |
| Agrupar la práctica por tema (bloqueada) | Intercalar es superior para elegir método — Dunlosky et al. 2013 |
| Descubrimiento **sin** consolidación posterior | El mecanismo se rompe — Loibl et al. 2017 |
| Tres representaciones lado a lado sin exigir traducción | Ainsworth 2006 |
| Tutor de IA como requisito para igualar tutoring humano | VanLehn 2011: la granularidad importa más que el agente |
| Prometer "2 sigma" | No replicado — ver sección 7 |

---

## 7. Honestidad al comunicar la evidencia

Fobos va a decir públicamente que su método está respaldado. Eso obliga a precisión, y en Chile además es materia de publicidad (Ley 19.496).

**Se puede afirmar:**
- Que el diseño implementa mastery learning, práctica de recuperación, práctica distribuida, ejemplos con fading y consolidación contrastiva.
- Que estas técnicas tienen respaldo meta-analítico.
- Rango honesto para mastery learning bien implementado: **≈0.5 SD** (Kulik et al. 1990).

**No se puede afirmar:**
- "+2 desviaciones estándar" (Bloom 1984 no se ha replicado).
- Puntajes garantizados, "+100 puntos", o cualquier número de resultado individual.
- Cifras de Hattie (2009) como si fueran verdades duras: su metodología de promediar meta-análisis heterogéneos está seriamente cuestionada. **Úsalo para priorizar, no para prometer.**

**Formulación segura:** *"Fobos implementa técnicas con respaldo empírico. Los resultados dependen del uso."* Sin números de puntaje.

---

## 8. Métricas para verificar que la doctrina funciona

No sirve implementar sin medir. Sobre el log de respuestas (Fase 0):

| Métrica | Qué valida | Señal de alarma |
|---|---|---|
| % de errores que llegan a `p(L) ≥ 0.95` | P10 funciona | < 40% a los 30 días |
| Tiempo medio hasta cerrar un error | Costo del ciclo | creciente = correctivos malos |
| Reapertura de errores cerrados | Calidad del espaciado (P9) | > 20% = intervalos muy largos |
| Tasa de "correcto y lento" | Automatización incompleta (P5) | estable = no está mejorando |
| Aciertos en conversión vs. tratamiento | P7 | brecha grande = enseñar conversión |
| Lectura del feedback (tiempo en pantalla) | P11 | < 3 s = feedback muy largo o hay nota al lado |
| Retención a 30 días vs. inmediata | P8/P9 | caída > 30% = falta espaciado |

---

## 9. Orden de adopción

La doctrina no se aplica toda de golpe. Orden por dependencia:

1. **Log de respuestas** con `ms`, `errorId`, `registroOrigen/Destino`. Sin esto nada es medible.
2. **P11 (feedback)** — reescritura de estructura, tope de palabras, separar nota de feedback. Barato, alto impacto, no requiere contenido nuevo.
3. **P10 (knowledge tracing)** — cuatro líneas de código sobre el log.
4. **P2 (consolidación contrastiva)** — auditar las 11 lecciones existentes; es el defecto más probable del contenido actual.
5. **P4 (modo descarte)** — nueva interacción sobre ítems existentes.
6. **P9 (espaciado calibrado)** — requiere 3 y la fecha PAES del estudiante.
7. **P7 (registros)** — requiere reclasificar el banco. Es el más caro y el más diferenciador.
8. **P6 (fading)** y **P8 (intercalado)** — al producir contenido nuevo.

---

## 10. Referencia rápida: fuente → decisión

| Fuente | Decisión que sostiene en Fobos |
|---|---|
| Bloom 1968 | Criterio fijo, tiempo variable; correctivos distintos de la instrucción original |
| Bloom 1984 | Techo teórico; **no usar como promesa** |
| Kulik, Kulik & Bangert-Drowns 1990 | Rango honesto ≈0.5 SD; mayor efecto en bajo rendimiento previo |
| Hattie 2009 | Heurística de priorización, no evidencia dura |
| Ericsson, Krampe & Tesch-Römer 1993 | Sesiones cortas, tarea acotada, feedback, repetición correctiva |
| Shute 2008 | Estructura y tope de largo del feedback; separar nota de feedback |
| Sweller 1988 | Un concepto por paso; goal-free en descubrimiento |
| Sweller, van Merriënboer & Paas 2019 | Atención dividida, redundancia, reversión por pericia, fading |
| Renkl 2014 | Ejemplo → completar → resolver con autoexplicación obligatoria |
| Piaget & Inhelder 1969 | Anclaje concreto antes de la forma simbólica |
| Vygotsky 1978 | Dificultad objetivo = lo alcanzable con apoyo; apoyo removible |
| Bransford, Brown & Cocking 2000 | Activar concepción previa; transferencia exige múltiples contextos |
| Paul & Elder 2006 | Taxonomía de prompts de descubrimiento |
| Chi et al. 2001 | El sistema promptea, no explica |
| Graesser, Person & Magliano 1995 | Paso de mejora colaborativa de la respuesta |
| Kapur 2008, 2014 | Intento antes de instrucción |
| Loibl, Roll & Rummel 2017 | **Consolidación contrastiva obligatoria** |
| Paivio 1986 | Emparejar verbal con icónico; construir la conexión |
| Ainsworth 2006 | Exigir traducción entre representaciones |
| Duval 2006 | Clasificar por conversión de registro; enseñarla como contenido |
| Chi, Roy & Hausmann 2008 | Aprendizaje vicario: mostrar razonamiento ajeno funciona si el observador está activo |
| VanLehn 2011 | Interacción a nivel de paso; no se requiere IA |
| Anderson, Corbett, Koedinger & Pelletier 1995 | Feedback inmediato al error; granularidad ajustable |
| Corbett & Anderson 1995 | Knowledge tracing bayesiano; umbral p(L) ≥ 0.95 |
| Roediger & Karpicke 2006 | Todo repaso es recuperación |
| Roediger & Butler 2011 | La ventaja crece con el intervalo — escenario PAES |
| Dunlosky et al. 2013 | Tabla de utilidad; intercalar; prohibir resúmenes |
| Ebbinghaus 1885 | Curva del olvido; el reaprendizaje es más rápido |
| Cepeda et al. 2006 | Intervalo ≈ 10–20% del intervalo de retención |
| Wozniak & Gorzelanczyk 1994 | SM-2 sobre el error catalogado |

---

## 11. Estado del documento

- **Pendiente de validación por la profesora:** P2 (formato del contraste), P7 (taxonomía de registros).
- **Pendiente de calibración con datos propios:** parámetros de P10, número de ítems por sesión, coeficiente de P9.
- **No implementado aún:** todo. Este documento precede al código.
