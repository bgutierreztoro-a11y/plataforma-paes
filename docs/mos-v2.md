# Master Operating System v2
**Proyecto:** Plataforma de aprendizaje Matemática M1 (PAES)
**Fecha:** 5 de julio de 2026
**Estado:** Reemplaza al master prompt original. Este documento es la única fuente de verdad. El prompt anterior queda obsoleto y no debe volver a pegarse en ninguna conversación.

**Regla de uso:** las próximas sesiones de trabajo parten de datos o de un entregable concreto, no de este documento. Si una sesión no aporta datos nuevos ni produce un entregable, se cancela.

---

## 1. Tesis

Vendemos puntaje. Entregamos comprensión.

La comprensión es el mecanismo, no la promesa. El estudiante y su familia compran una sola cosa: más puntos en la PAES de fin de año. Nuestro método para lograrlo es el aprendizaje por descubrimiento, porque la PAES actual evalúa competencias (resolver problemas, modelar, representar, argumentar) y no memorización. Eso alinea comprensión con puntaje mucho más que en la era PSU, y es la razón por la que esta tesis puede funcionar hoy y no hace diez años.

Consecuencia de producto: el puente entre comprensión y puntaje debe ser visible en cada lección. Toda lección cierra con 2 o 3 ítems originales en formato PAES. El estudiante tiene que ver la transferencia, no creerla por fe.

El producto tiene dos capas. La capa núcleo es el aprendizaje interactivo. La segunda capa, más delgada y posterior, es ejecución de examen: manejo del tiempo, formato DEMRE, 65 preguntas en 2 horas 20. Negar esa capa por pureza pedagógica sería un error; se agrega cuando la capa núcleo esté validada.

## 2. Las cuatro apuestas

El proyecto son cuatro apuestas apiladas. Confundirlas es la fuente de casi todos los errores de planificación anteriores.

1. **Pedagógica:** el descubrimiento guiado produce mejor comprensión que el modelo preuniversitario. Se valida con el piloto.
2. **Comercial:** estudiantes bajo presión de puntaje (y sus apoderados) pagan por esto. Se valida con la preventa.
3. **De producción:** podemos fabricar contenido de calidad Brilliant a costo viable. No se valida ahora. Es un problema real, pero de una empresa que ya vendió.
4. **De sistema:** grafo de conocimiento, variantes generativas, multi-materia. No se valida ahora. Pertenece a los gates 3 en adelante.

El MVP existe para las apuestas 1 y 2. Cualquier trabajo que sirva a las apuestas 3 o 4 antes del Gate 2 se rechaza por defecto.

## 3. Cliente y segmento del piloto

Usuario: estudiante de 4° medio que rinde la PAES a fines de 2026. Quedan menos de cinco meses; la temporada es ahora. Comprador frecuente: el apoderado. El mensaje de venta habla de puntaje y le sirve a ambos.

Decisión de segmento: la preventa apunta a 4° medio porque es quien paga y quien define el mercado real. El piloto de aprendizaje puede incluir 3° medio, pero un resultado positivo solo con 3° medio no valida la apuesta comercial. Si el método no funciona con estudiantes a cinco meses del examen, el problema es del método, no de los estudiantes.

Canal inicial: confianza física. Colegio propio, compañeros de otros colegios, 2 o 3 profesores como puente. Es el canal que ya demostró convertir. TikTok e Instagram quedan para después: construir audiencia desde cero es una segunda startup y no se emprende ahora.

## 4. Producto: especificación del MVP v1

Cerrada. No se rediseña; se construye.

**Tema:** funciones lineales y afines. Micro-tema de entrada: pendiente como razón de cambio.

**Estructura:**
1. Diagnóstico de 5 ítems.
2. Lección 1: reconocimiento intuitivo de patrones de cambio constante.
3. Lección 2: pendiente e intercepto con gráfico interactivo de sliders (la interacción insignia).
4. Lección 3: traducción entre representaciones (tabla, gráfico, ecuación, enunciado).
5. Lección 4: modelamiento estilo PAES.
6. Cierre: 8 ítems en formato PAES.

Cada lección sigue la secuencia de 10 pasos (curiosidad, problema, pensar, pistas, descubrimiento, generalización, práctica, aplicación, reflexión, consolidación) y termina con 2 o 3 ítems formato PAES originales.

**Feedback:** artesanal, escrito a mano para cada distractor previsto. Sin LLM en vivo. Un error matemático de la plataforma destruye la confianza en este mercado, y el feedback pre-escrito es más barato, más rápido y más confiable. El tutor con IA es una funcionalidad del Gate 3.

**Stack:** Next.js, contenido en archivos JSON, deploy en Vercel, PostHog para eventos. Sin backend, sin login, sin pagos automatizados. El acceso al piloto se entrega por link.

**Excluido de v1:** tutor IA, autenticación, repetición espaciada, gamificación, grafo de conocimiento, pipeline de descomposición de guías, motor de variantes, app móvil, cualquier materia distinta de M1.

## 5. Modelo de negocio

Pase de temporada, pago único: "Plan PAES 2027". Sin suscripción mensual.

Razones: (a) el churn es del 100% por diseño, todos rinden y se van; (b) los ingresos se concentran entre marzo y noviembre; (c) la única evidencia de pago que tenemos son transferencias únicas por acceso, no suscripciones. La matemática SaaS mensual no aplica a este mercado y se elimina del vocabulario del proyecto.

Precio hipótesis para la cohorte fundadora: $19.990 CLP por el curso completo de funciones M1. Mínimo aceptable como señal: $15.000. Un precio simbólico no valida nada; ya lo comprobamos. Referencia de mercado: las familias gastan cientos de miles de pesos al año en preuniversitario, así que el precio no es la barrera, la confianza sí.

Cobro en fase piloto: transferencia manual. Automatizar pagos antes de 30 clientes viola la prioridad 5 (simplicidad).

## 6. Plan de validación

Dos tests en paralelo, no en secuencia. El orden real de riesgo es distribución, luego pago, luego eficacia, y el plan anterior lo testeaba al revés.

**Test A. Preventa (apuesta comercial).** Oferta: "Curso intensivo Funciones M1, cohorte fundadora, cupos limitados, parte el [fecha], $19.990". Un párrafo, un precio, un link o número para reservar. Canal de confianza. Duración: 3 semanas.
- 10 o más pagos reales: continuar y construir con urgencia.
- Entre 5 y 9: reposicionar oferta o precio y repetir una vez.
- Menos de 5: detenerse y revisar la tesis antes de escribir una línea más de código.

**Test B. Piloto de aprendizaje (apuesta pedagógica).** 15 a 20 estudiantes reales, presencial o por videollamada, con la lección 1 terminada.
- Pre y post con ítems isomorfos (mismo concepto, números y contexto distintos) para reducir el efecto test-retest.
- Señal positiva: mejora pre/post en al menos 60% de los estudiantes, tasa de término de la lección de 70% o más, y al menos la mitad pide la lección siguiente sin que se la ofrezcamos.
- Una pregunta abierta al final: "¿qué cambiarías?".
- Limitaciones asumidas: sin grupo de control y con N chico. El resultado es direccional, no una prueba científica, y así se reporta.

Ninguna funcionalidad nueva entra al backlog sin responder: qué incertidumbre elimina, cómo se mide, y qué umbral la mataría.

## 7. Protocolo legal

Objetivo honesto: no existe el riesgo legal cero. Existe riesgo minimizado, documentado y revisado por un profesional. Este protocolo no es asesoría legal; es la preparación para que la revisión legal sea corta y barata.

**7.1 Fuentes de contenido.**
- Fuente canónica: temario oficial de la PAES publicado por DEMRE más las formas liberadas de aplicaciones anteriores. Definen qué se evalúa, con qué formato y a qué profundidad. Son públicas pero no de dominio público: sirven para análisis y calibración, y ningún ítem, enunciado o gráfico de DEMRE se copia al producto.
- Guías de terceros (Pedro de Valdivia u otras): quedan degradadas a opcionales. El temario DEMRE ya entrega el mapa de contenidos sin zona gris. Si aun así se analizan, se aplica el proceso clean-room de 7.2.

**7.2 Proceso clean-room en dos fases.**
- Fase de análisis: de cualquier material de terceros se extrae solo la capa abstracta a un schema estructurado: conceptos, prerrequisitos, secuencia, habilidades, errores frecuentes, nivel de dificultad. Nunca texto, enunciados, ejemplos numéricos, diagramas ni soluciones.
- Fase de creación: quien escribe contenido trabaja únicamente desde el schema y el temario DEMRE, sin el material original a la vista.
- Registro de proveniencia: cada lección lleva una nota de qué fuentes de análisis se usaron y una declaración de originalidad.
- La ley chilena de propiedad intelectual (17.336) protege la expresión, no las ideas, los métodos ni las secuencias pedagógicas. Aun así, sus excepciones son más estrechas que el fair use estadounidense, por eso la regla operativa es la del documento original: ante duda razonable, se descarta y se crea de nuevo.

**7.3 Checklist de originalidad por lección, antes de publicar.**
1. ¿Algún enunciado o ejercicio es sustancialmente similar a una fuente conocida, aunque cambien palabras o números?
2. ¿Algún diagrama o visualización replica la composición de uno existente?
3. ¿La secuencia interna copia la estructura expresiva de una guía específica, más allá del orden lógico natural del contenido?
4. ¿Queda registrada la proveniencia?
Si alguna respuesta es dudosa, el contenido no se publica.

**7.4 Marcas.** "PAES" y "DEMRE" se usan solo de forma descriptiva ("preparación para la PAES"), nunca en el nombre del producto ni sugiriendo afiliación. Disclaimer permanente en el sitio: producto independiente, sin vínculo con DEMRE, la Universidad de Chile ni ningún preuniversitario.

**7.5 Datos personales.** Los usuarios serán en su mayoría menores de 18. Reglas desde el día uno:
- Minimización: para el piloto no se recolectan nombres completos, RUT ni datos sensibles. Analítica anonimizada.
- Consentimiento del apoderado para participantes menores de edad, por escrito aunque sea simple.
- La nueva ley de protección de datos (21.719) entra en vigencia el 1 de diciembre de 2026, justo en nuestra primera temporada de venta, con una agencia fiscalizadora ya operativa y multas altas. Las empresas pequeñas reciben amonestación en el primer año en vez de multa, pero diseñamos como si aplicara completa: inventario de qué datos guardamos, dónde, para qué y por cuánto tiempo, más política de privacidad y términos publicados antes de cobrar a desconocidos.

**7.6 Formalización.** Antes de cobrar fuera del círculo cercano: inicio de actividades ante el SII y boleta por cada venta. Si algún fundador es menor de 18 años, los actos legales (cuentas, contratos, formalización) requieren la participación de un adulto responsable; resolver esto es parte del Gate 1, no un detalle para después.

**7.7 Contenido asistido por IA.** El contenido se crea con asistencia de IA pero con autoría y curaduría humana documentada (borradores, decisiones, revisiones). Eso fortalece nuestra posición de titularidad y de originalidad.

**7.8 Hito obligatorio.** Revisión con abogado o abogada de propiedad intelectual en Chile antes del lanzamiento público. No es requisito para el piloto por canal de confianza, sí para vender abierto. Una consulta acotada con este protocolo ya preparado es un gasto chico.

## 8. Métricas e instrumentación

PostHog con eventos por pantalla: inicio, respuesta por ítem, uso de pistas, abandono por paso, tiempo por lección. Métricas que importan en esta fase: delta pre/post, tasa de término, punto exacto de abandono, y solicitudes espontáneas de la lección siguiente. Métricas prohibidas por ahora: MRR, DAU, retención mensual. Miden un negocio que todavía no existe y contaminan las decisiones.

## 9. Lo que no se construye todavía

Pipeline industrial de descomposición de guías, grafo de conocimiento, motor de variantes, tutor LLM, login, pagos automatizados, dashboard del estudiante, repetición espaciada, gamificación, app móvil, M2 y otras materias, contenido en video. Cada uno de estos ítems necesita pasar un gate y justificar qué incertidumbre elimina.

## 10. Gates del roadmap

- **Gate 1 (semanas 1 a 3):** preventa lanzada y lección 1 construida y testeada. Incluye resolver la formalización mínima.
- **Gate 2 (semanas 3 a 6):** piloto completo del módulo de funciones con la cohorte pagada. Umbrales de la sección 6 cumplidos.
- **Gate 3 (temporada 2026):** cohorte fundadora completa el curso, medimos su percepción de mejora en ensayos reales. Recién aquí se evalúan: segundo tema de M1, capa modo ensayo, tutor IA.
- **Gate 4 (2027):** decisión de escala con datos de una temporada completa: más temas, automatización, canal de distribución propio.

## 11. Reglas de trabajo

1. Toda decisión debe reducir incertidumbre; si no la reduce, no se toma todavía.
2. Orden de prioridades intacto: legal, validación, aprendizaje, UX, simplicidad, iteración, escalabilidad, optimización.
3. Ninguna sesión de estrategia sin datos nuevos.
4. La evidencia previa no se borra con un reset de proyecto: lo único que la gente nos ha pagado hasta hoy fue material curado cercano al examen. Esa señal se respeta y por eso cada lección conecta con formato PAES.
5. Este documento se actualiza solo cuando un gate se cruza o un test entrega resultados. No se reescribe por inquietud.
