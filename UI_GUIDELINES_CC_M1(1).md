# UI / UX Guideline para CC — Plataforma M1

**Propósito:** este documento define cómo debe verse y sentirse la interfaz del MVP de Matemática M1.  
**Alcance:** solo UI/UX del módulo M1 ya definido. No agrega funciones nuevas. No introduce gamificación vetada. No cambia la arquitectura funcional del producto.  
**Uso:** Claude Code debe tratar este documento como guía de construcción visual y de experiencia. Si algo no está explícito acá, elegir la opción más sobria, clara y coherente con estas reglas.

---

## 1) Qué problema resuelve este documento

La plataforma ya tiene una base sólida: el contenido, el flujo pedagógico y las restricciones del producto están definidos. El problema actual no es de funciones; es de presencia visual.

Hoy la UI debe pasar de:

- correcta → intencional
- funcional → memorable
- neutra → con identidad
- plana → profunda sin ser ruidosa
- genérica → propia del producto

La meta no es “decorar” la plataforma. La meta es que el estudiante sienta:

1. que entiende dónde está,
2. que sabe qué hacer ahora,
3. que avanzar requiere poco esfuerzo cognitivo,
4. que la plataforma tiene criterio visual propio.

---

## 2) Principio rector

**La interfaz debe desaparecer mientras el estudiante aprende.**

Eso no significa que sea aburrida. Significa que la UI no compite con el contenido.

La pantalla debe ayudar a que el foco caiga en:

- el concepto,
- el siguiente paso,
- la interacción activa,
- el feedback.

Todo lo demás debe ser soporte.

---

## 3) Qué sí debe transmitir la plataforma

La experiencia visual debe sentirse:

- **clara**
- **calma**
- **confiable**
- **actual**
- **seria sin ser institucional**
- **cálida sin ser infantil**
- **premium sin parecer ostentosa**
- **didáctica sin parecer escolar**

En términos prácticos: no debe verse como un preuniversitario tradicional, ni como una app de juego, ni como un panel técnico frío. Debe verse como una herramienta moderna para aprender con comprensión real.

---

## 4) Referencias de producto que sí sirven

No se trata de copiar pantallas completas. Se trata de extraer principios.

### 4.1 Brilliant
Tomar de Brilliant:
- aprendizaje interactivo como centro visual,
- aire generoso,
- jerarquía elegante,
- bloques que parecen “hechos con intención”,
- sensación de producto de alto nivel.

No tomar:
- exceso de teatralidad,
- sensación de “curso de entretenimiento”,
- cualquier cosa que haga que la interfaz parezca más importante que el concepto.

### 4.2 Khan Academy
Tomar de Khan:
- claridad para el “siguiente paso”,
- navegación legible,
- aprendizaje progresivo,
- dashboard entendido como punto de entrada útil, no como panel decorativo.

No tomar:
- estética demasiado institucional,
- exceso de neutralidad visual,
- sensación de plataforma escolar genérica.

### 4.3 Linear
Tomar de Linear:
- disciplina visual,
- espaciado impecable,
- consistencia de componentes,
- microinteracciones precisas,
- densidad bien controlada,
- software que se siente “limpio” y bien construido.

No tomar:
- frialdad excesiva,
- complejidad técnica visible,
- sobrecarga de elementos por pantalla.

### 4.4 Stripe
Tomar de Stripe:
- superficies sobrias,
- jerarquía profesional,
- confianza,
- sensación de producto cuidado,
- UI donde la estructura manda más que el adorno.

No tomar:
- look financiero,
- rigidez excesiva,
- UI corporativa dura.

### 4.5 Duolingo
Tomar de Duolingo solo lo útil:
- claridad del progreso,
- feedback inmediato,
- microcopy cercano,
- sensación de avance visible.

No tomar:
- rachas,
- monedas,
- cofres,
- recompensas artificiales,
- presión por volver,
- gamificación que compita con el aprendizaje,
- estética infantil.

---

## 5) Lo que no debe hacer la UI

La plataforma no debe:

- parecer vacía por falta de intención,
- parecer cargada por miedo al espacio en blanco,
- multiplicar colores sin sistema,
- usar animaciones por adorno,
- usar más de una acción principal por pantalla,
- mezclar señales de “error técnico” con “respuesta incorrecta”,
- mostrar bloques que no ayudan a decidir qué hacer ahora,
- depender de premios visuales para retener al usuario,
- verse “chica” o “de colegio”,
- verse “empresa seria” de forma fría y distante,
- verse genérica y reemplazable.

---

## 6) Tres reglas de composición que mandan sobre todo lo demás

### Regla 1: una pantalla tiene un protagonista
Cada vista debe tener un único foco dominante.

Ejemplos:
- en portada/camino: el camino;
- en lección: el interactivo;
- en diagnóstico: la pregunta;
- en cierre: la evidencia de dominio.

Si dos cosas compiten, la pantalla pierde fuerza.

### Regla 2: el espacio en blanco comunica jerarquía
No llenar no es “dejar huecos”.  
El aire hace que el contenido se sienta más importante.

Antes de agregar un elemento, preguntar:
- ¿este bloque informa algo nuevo?
- ¿reduce fricción?
- ¿ordena la decisión del estudiante?

Si no, no entra.

### Regla 3: el color dirige, no decora
El color tiene que ayudar a identificar:
- acción principal,
- estado,
- feedback,
- progreso,
- foco.

No debe decorar cada superficie.

---

## 7) Sensación visual objetivo

La interfaz debe tener esta mezcla:

- fondo tranquilo,
- superficies limpias,
- bordes suaves,
- contraste suficiente,
- jerarquía clara,
- acentos precisos,
- movimiento breve,
- ritmo consistente.

La sensación correcta no es “wow” inmediato.  
La sensación correcta es:

> “Se ve muy bien, entiendo todo, y quiero seguir.”

---

## 8) Sistema de layout

### 8.1 Estructura general
- Construir con una grilla clara y repetible.
- Evitar layouts distintos por capricho.
- Usar una lógica de “columna principal + soporte” donde tenga sentido.
- En mobile, priorizar lectura vertical y toque fácil.
- En desktop, usar amplitud para mejorar la claridad, no para llenar con paneles innecesarios.

### 8.2 Ancho y densidad
- No estirar el contenido solo porque hay espacio.
- Las líneas de lectura deben mantenerse cómodas.
- Las pantallas de aprendizaje deben respirar.
- Las pantallas de control o navegación pueden ser algo más densas, pero siempre legibles.

### 8.3 Alineación
- Todo debe alinearse con intención.
- Evitar centrados arbitrarios en bloques largos.
- Evitar cambios de eje dentro de una misma pantalla sin motivo claro.

---

## 9) Tipografía

La tipografía debe priorizar legibilidad y tono.

### Criterios
- títulos con personalidad suficiente para verse modernos,
- cuerpo muy legible,
- números y valores estables visualmente,
- evitar excesos de peso o variedad.

### Reglas
- no usar demasiadas familias tipográficas,
- no usar demasiados tamaños distintos en una sola pantalla,
- no usar texto demasiado pequeño,
- no usar tracking llamativo salvo en casos puntuales,
- no centrar párrafos largos,
- no sobrecargar con mayúsculas.

### Tono tipográfico
- profesional,
- claro,
- sobrio,
- amigable,
- nunca infantil.

---

## 10) Color

No inventar una paleta nueva por pantalla.

### Reglas de uso
- mantener una identidad consistente,
- usar el color principal con mucha disciplina,
- reservar colores de estado para su función semántica,
- evitar saturación visual,
- no convertir la interfaz en un arcoíris,
- usar acentos solo donde realmente hay acción o foco.

### Principio útil
Mientras más importante sea algo, más selectivo debe ser el uso del color.

---

## 11) Superficies, bordes y profundidad

La profundidad debe sentirse por composición, no por ruido.

### Superficies
- usar tarjetas solo cuando haya una unidad de información real,
- evitar cajas innecesarias,
- no fragmentar por estética,
- agrupar contenido con lógica.

### Bordes
- suaves,
- consistentes,
- funcionales,
- no decorativos.

### Sombras
- sutiles,
- pocas,
- con un propósito claro.

La sombra no es estilo. Es lectura espacial.

---

## 12) Motion

El movimiento debe ayudar a entender cambios de estado.

### Qué sí animar
- entrada de tarjetas,
- transición de estado,
- avance de progreso,
- aparición de feedback,
- cambio de contenido activo,
- microfeedback de interacción.

### Qué no animar
- decoración permanente,
- loops visuales sin valor,
- celebraciones exageradas,
- movimientos que distraen del contenido.

### Duración
El movimiento debe ser breve y preciso.  
Nada debe sentirse lento, pesado o teatral.

### Regla
Si la animación no explica algo, sobra.

---

## 13) Estados visuales

Toda pieza importante debe tener estados claros:

- normal,
- hover,
- activo,
- completado,
- bloqueado,
- deshabilitado,
- error técnico,
- error pedagógico / respuesta incorrecta.

### Diferencias importantes
- **error técnico**: debe sentirse raro, serio, excepcional;
- **respuesta incorrecta**: debe sentirse guiada, no castigada.

No mezclar esos dos mundos.

---

## 14) Pauta para el M1 Camino

La vista del camino debe sentirse como una progresión clara de estudio.

### Debe hacer bien estas cosas
- dejar claro qué viene primero,
- mostrar qué está disponible,
- dejar visible el avance sin sobreexplicar,
- orientar al estudiante con una sola acción principal,
- permitir lectura rápida en móvil,
- verse viva sin parecer juego.

### Debe evitar
- exceso de etiquetas,
- múltiples badges compitiendo,
- texto redundante,
- tarjetas demasiado verbosas,
- nodos que parezcan decorativos,
- barras y chips sin función real.

### Resultado buscado
El camino debe sentirse como un mapa de estudio serio y moderno, no como un tablero lleno de recuadros.

---

## 15) Pauta para la lección

La lección es donde la plataforma gana o pierde valor.

### Debe organizarse así
1. contexto breve,
2. concepto visible,
3. interacción protagonista,
4. feedback claro,
5. siguiente paso obvio.

### Jerarquía ideal
- primero el interactivo,
- luego la explicación,
- luego los soportes,
- luego el resto.

### Lo que debe sentirse
- el estudiante manipula algo real,
- la pantalla responde con precisión,
- el progreso cognitivo se ve,
- la explicación acompaña al descubrimiento.

### Lo que no debe sentirse
- bloque de texto largo con un ejercicio al final,
- tutorial pasivo,
- formulario disfrazado de aprendizaje.

---

## 16) Pauta para diagnóstico y cierre

Estas vistas deben verse más sobrias que la lección.

### Diagnóstico
- foco en resolución,
- menos ornamentación,
- claridad absoluta en la tarea,
- feedback limpio.

### Cierre
- sensación de síntesis,
- evidencia de dominio,
- cierre visual ordenado,
- sin celebración exagerada,
- sin “premios” inventados.

---

## 17) Componentes que sí deberían destacarse visualmente

### Botón principal
Debe ser muy claro cuál es la acción principal.  
No puede confundirse con botones secundarios.

### Tarjeta
Debe verse como una unidad real de información.  
No debe sentirse como un recuadro genérico.

### Progreso
Debe verse como avance comprensible, no como adorno.

### Interactivo
Debe dominar la pantalla cuando aparezca.

### Feedback
Debe ser inmediato, claro y específico.

---

## 18) Componentes que conviene simplificar

Si un bloque:

- repite información,
- no ayuda a decidir,
- mete ruido,
- ocupa espacio sin aportar comprensión,

entonces debe reducirse o eliminarse.

El objetivo no es “llenar la pantalla”.  
El objetivo es dejar solo lo que importa.

---

## 19) Microcopy y tono

La voz de la interfaz debe ser:

- directa,
- breve,
- alentadora,
- inteligente,
- sin exageración,
- sin lenguaje infantil,
- sin lenguaje corporativo vacío.

### Ejemplos del tono correcto
- “Continuar”
- “Revisar”
- “Empezar”
- “Repasar”
- “Siguiente”
- “Vuelve a intentarlo”

### Lo que evitar
- frases largas,
- frases demasiado emotivas,
- chistes innecesarios,
- lenguaje adolescente impostado,
- copy genérico de producto SaaS.

---

## 20) Accesibilidad y legibilidad

El diseño debe ser usable de verdad.

### Reglas mínimas
- contraste suficiente,
- foco visible,
- targets táctiles cómodos,
- lectura clara en mobile,
- motion reducido cuando el sistema lo pide,
- nada que dependa solo del color para entenderse.

La accesibilidad no es un add-on.  
Es parte de la calidad visual.

---

## 21) Qué debe hacer CC cuando construya cualquier pantalla

Antes de escribir UI, CC debe responder mentalmente:

1. ¿Cuál es el objetivo de esta pantalla?
2. ¿Cuál es su protagonista visual?
3. ¿Cuál es la acción principal?
4. ¿Qué información es imprescindible?
5. ¿Qué sobra?
6. ¿Qué puede simplificarse?
7. ¿La pantalla se entiende en 5 segundos?
8. ¿Se ve como un producto serio, moderno y propio?

Si alguna respuesta es débil, la pantalla no está lista.

---

## 22) Orden de prioridad al construir

Cuando haya conflicto entre opciones visuales:

1. claridad,
2. aprendizaje,
3. coherencia del sistema,
4. simplicidad,
5. estética,
6. novedad.

Si una mejora visual rompe claridad, se descarta.

---

## 23) Anti-patrones que hay que evitar

- paneles demasiado divididos,
- tarjetas por inercia,
- sombras pesadas,
- iconos por relleno,
- gradientes por moda,
- animaciones decorativas,
- badges sin significado,
- exceso de estados visibles al mismo tiempo,
- home saturada,
- sensación de “app escolar básica”,
- sensación de “juego”,
- sensación de “dashboard corporativo”.

---

## 24) Cómo saber que la UI va bien

La UI va bien si un usuario puede:

- entender la pantalla rápido,
- reconocer qué hacer,
- sentirse acompañado,
- avanzar sin fricción,
- percibir calidad,
- notar que el producto tiene identidad,
- no sentir que está peleando con la interfaz.

Si la pantalla exige demasiado esfuerzo visual, no está bien resuelta.

---

## 25) Instrucción final para CC

No cambiar la plataforma completa.  
No reimaginar el producto.  
No sumar features nuevas.

**Solo elevar la interfaz actual** para que se sienta:

- más intencional,
- más madura,
- más clara,
- más propia,
- más moderna,
- más fuerte visualmente.

La mejora debe venir de:
- composición,
- jerarquía,
- espaciado,
- tipografía,
- color disciplinado,
- profundidad sutil,
- motion preciso,
- microcopy claro.

No de inventar más cosas.

---

## 26) Protocolo de ejecución para CC

Cuando CC vaya a implementar este documento, debe seguir este orden:

### Fase 1: Plan mode obligatorio
Antes de tocar código:
1. leer este documento completo,
2. identificar qué pantallas/componentes se van a modificar,
3. listar qué archivos probablemente habrá que tocar,
4. separar lo que es UI de lo que sería cambio funcional,
5. confirmar que no se están introduciendo funciones nuevas.

**Regla:** si no puede explicar el cambio en una frase, todavía no está listo para implementarlo.

### Fase 2: Plan técnico corto
CC debe proponer un plan breve con:
- alcance exacto,
- archivos afectados,
- orden de implementación,
- riesgo principal,
- criterio de terminación.

No ejecutar cambios hasta que el plan esté claro.

### Fase 3: Implementación por capas
Orden recomendado:
1. layout y estructura,
2. jerarquía visual,
3. componentes base,
4. estados,
5. motion,
6. copy,
7. ajustes finos responsivos.

**No** empezar por animaciones ni por decoración.  
Primero la estructura; después el acabado.

### Fase 4: Validación
Antes de considerar terminado:
- revisar en mobile y desktop,
- revisar contraste,
- revisar espaciado,
- revisar estados,
- revisar que no haya features nuevas,
- revisar que la pantalla principal se entienda en pocos segundos.

### Fase 5: Deploy
Si el cambio pasa validación:
- correr build/lint si aplica al proyecto,
- dejar el código listo para deploy,
- documentar brevemente qué cambió,
- no dejar cambios visuales a medio terminar.

---

## 27) Checklist de implementación visual

CC debe revisar esta lista antes de cerrar cualquier cambio de UI:

- [ ] ¿La pantalla tiene un solo protagonista visual?
- [ ] ¿La acción principal es obvia sin leer demasiado?
- [ ] ¿Hay suficiente aire?
- [ ] ¿Hay alguna tarjeta, borde o sombra que exista solo por costumbre?
- [ ] ¿La tipografía mantiene jerarquía clara?
- [ ] ¿El color se usa con disciplina?
- [ ] ¿Hay alguna animación que no explique nada?
- [ ] ¿El estado activo/completado/bloqueado se entiende de inmediato?
- [ ] ¿La interfaz se ve moderna sin parecer decorativa?
- [ ] ¿La interfaz se siente seria sin volverse fría?
- [ ] ¿La pantalla funciona bien en mobile?
- [ ] ¿La pantalla no introduce gamificación vetada?
- [ ] ¿No se agregó ninguna función nueva?
- [ ] ¿La mejora es visual y de experiencia, no de alcance?

Si una respuesta es “no” y afecta claridad, hay que corregir antes de cerrar.

---

## 28) Checklist de salida antes de entregar a usuario

CC solo debe considerar el trabajo listo si puede decir “sí” a todo esto:

- [ ] La pantalla se entiende en menos de 5 segundos.
- [ ] El estudiante sabe qué hacer ahora.
- [ ] El diseño se ve intencional y no accidental.
- [ ] La identidad visual es más fuerte que antes.
- [ ] El contenido sigue siendo el protagonista.
- [ ] No hay ruido visual sobrante.
- [ ] No hay elementos nuevos que cambien el producto.
- [ ] No hay contradicción con el alcance M1.
- [ ] No hay contradicción con el criterio de sobriedad.
- [ ] El resultado mejora la plataforma sin reescribirla.

**Criterio final:** si el cambio se puede describir como “más claro, más sólido y más propio”, entonces sí sirve. Si solo se puede describir como “más bonito”, todavía falta trabajo.

