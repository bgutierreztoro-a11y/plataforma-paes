# Brechas de los bancos Advance frente al material de referencia

Generado el 2026-09-21. Insumos: `ap1.json`, `ap2.json` y `por-unidad.md` (material) y `content/advance/<unidad>/banco.json` (leídos, no tocados). Ningún banco se edita desde aquí: cada reemplazo se firma en una sesión 🔴 separada, una por unidad.

Criterios: una tarea tipo se considera cubierta cuando algún ítem del banco tiene la misma estructura (qué se da, qué se pide, mecanismo), sin exigir el mismo formato numérico o literal. Las representaciones del banco se leen desde `figura` y desde tablas o rectas descritas en el enunciado (se indica cuando la representación va en texto). La distribución del material reparte el `conteo_problemas` de cada concepto entre sus `habilidades_demre` en partes iguales y asigna su `dificultad` completa; es una aproximación, no un conteo por ítem.

## ecuaciones-e-inecuaciones-primer-grado

Banco: 20 ítems. Material: 3 conceptos, 44 problemas, 27 tareas tipo (10 cubiertas, 17 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-ecuaciones-e-inecuaciones-primer-grado-010.

### a) Tareas tipo sin ningún ítem que las cubra (17)

- [0] dada una ecuación lineal con decimales en texto, obtener su solución
- [1] dado un contexto de compras con igual dinero en texto, obtener la ecuación que lo modela
- [2] dada una expresión lineal igualada a un valor en texto, obtener la incógnita
- [3] dada una ecuación con coeficiente fraccionario en texto, obtener su solución
- [4] dado un gráfico circular de fracciones y un dato en grafico-circular, obtener la ecuación del total
- [5] dado un modelo lineal con datos inicial y final en texto, obtener la variable desconocida
- [7] dado un esquema de medidas con incógnita en figura-plana, obtener el valor de la incógnita
- [8] dado un contexto de ingresos con aumento de usuarios en texto, obtener la expresión del nuevo total
- [9] dada una figura de tramos en fracciones de un total en figura-plana, obtener la ecuación del total
- [12] dada una ecuación con fracciones algebraicas en representación sin-representacion, obtener su solución
- [14] dada una ecuación con parámetro y su solución en representación sin-representacion, obtener el valor del parámetro
- [15] dada una ecuación con dos parámetros en representación sin-representacion, obtener la condición de solución única o infinitas
- [22] dadas dos inecuaciones en representación sin-representacion, obtener la cantidad de enteros comunes
- [23] dado el conjunto solución en representación sin-representacion, obtener los parámetros de la inecuación
- [24] dadas varias representaciones de una solución en representación texto, obtener la representación correcta
- [25] dado un procedimiento paso a paso en representación sin-representacion, obtener el paso con el primer error
- [26] dada una fórmula racional con doble cota en representación texto, obtener el rango de la variable

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, recta-numerica (descrita en texto: 012, 013, 014).

Material (conceptos que la declaran): sin-representacion (3), grafico-circular (1), figura-plana (1), recta-numerica (1).

Ausentes: grafico-circular (1), figura-plana (1).

### c) Candidatos de error sin id que el banco podría usar (13)

- confunde ecuación sin solución con solución cero
- olvida amplificar todos los términos por el mínimo común múltiplo (otra unidad: expresiones-algebraicas/reparte-factor-a-un-solo-termino)
- resta el vuelto en lugar de sumarlo al plantear la igualdad
- arrastra mal la coma decimal al dividir (otra unidad: enteros-y-racionales/corre-la-coma-al-operar-decimales)
- confunde la ecuación que da el total con la que da una parte
- cree que un paso es erróneo aunque todos sean correctos
- responde con el valor de la incógnita en vez de la cantidad derivada pedida
- al amplificar por el mínimo común múltiplo, no distribuye en uno de los lados (otra unidad: expresiones-algebraicas/reparte-factor-a-un-solo-termino)
- arrastra un error previo hasta el resultado final
- confunde la condición de infinitas soluciones con la de ninguna solución
- invierte el sentido al despejar un parámetro que multiplica
- restringe el conjunto solución a enteros cuando la incógnita es real
- no interseca ambos conjuntos al combinar dos inecuaciones

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 8 (40 %) | 4 (20 %) | 3 (15 %) | 5 (25 %) |
| material (44) | 12 (27 %) | 12 (27 %) | 8 (18 %) | 12 (27 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 6 (30 %) | 9 (45 %) | 5 (25 %) |
| material | 0 (0 %) | 44 (100 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-ecuaciones-e-inecuaciones-primer-grado-002 | [4] dado un gráfico circular de fracciones y un dato en grafico-circular, obtener la ecuación del total | cuarto 'plantear y resolver'; el gráfico circular de fracciones agrega una representación ausente |
| adv-ecuaciones-e-inecuaciones-primer-grado-013 | [22] dadas dos inecuaciones en representación sin-representacion, obtener la cantidad de enteros comunes | recta numérica duplicada con 014; dos inecuaciones simultáneas cubren el candidato 'no interseca ambos conjuntos' |
| adv-ecuaciones-e-inecuaciones-primer-grado-010 | [14] dada una ecuación con parámetro y su solución en representación sin-representacion, obtener el valor del parámetro | ítem sin tarea tipo en el material; el parámetro desde la solución es una tarea con doce problemas |
| adv-ecuaciones-e-inecuaciones-primer-grado-008 | [3] dada una ecuación con coeficiente fraccionario en texto, obtener su solución | cuarto contexto de reparto; no hay ningún coeficiente fraccionario en el banco |
| adv-ecuaciones-e-inecuaciones-primer-grado-014 | [23] dado el conjunto solución en representación sin-representacion, obtener los parámetros de la inecuación | tercera recta numérica; reconstruir los parámetros desde el conjunto solución es representar en sentido inverso |

## enteros-y-racionales

Banco: 20 ítems. Material: 14 conceptos, 94 problemas, 80 tareas tipo (7 cubiertas, 73 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-enteros-y-racionales-008, adv-enteros-y-racionales-011, adv-enteros-y-racionales-012, adv-enteros-y-racionales-014, adv-enteros-y-racionales-015.

### a) Tareas tipo sin ningún ítem que las cubra (73)

- [0] dado un intervalo de enteros en texto, obtener la cantidad de enteros de cierto tipo
- [1] dada la suma de enteros consecutivos en texto, obtener una propiedad siempre verdadera
- [2] dados dos enteros pares en texto, obtener la paridad de una combinación de sus vecinos
- [3] dado un impar en expresión algebraica, obtener la suma de sus vecinos impares
- [4] dada la suma de opuestos en texto, obtener el número desconocido
- [5] dado un número con una cifra desconocida en texto, obtener las cifras que cumplen un criterio de divisibilidad
- [6] dadas dos longitudes en texto, obtener la mayor medida común de corte
- [7] dadas cantidades por paquete en tabla-doble-entrada, obtener el mínimo de paquetes para igualar totales
- [8] dado un número en texto, obtener la suma de sus divisores
- [9] dados puntajes en grafico-barras, obtener la categoría con mayor variación absoluta
- [10] dada una expresión con valores absolutos y una condición de signo, obtener su forma simplificada
- [11] dada una boleta en tabla-doble-entrada, obtener el monto que corresponde a una persona
- [13] dada una variación constante en texto, obtener el tiempo para alcanzar un valor meta
- [14] dado un patrón de figuras en figura-plana, obtener el término enésimo
- [15] dados desarrollos de varios estudiantes en texto, obtener cuál es correcto
- [16] dado un movimiento repetido en texto, obtener la expresión de la distancia acumulada
- [17] dados valores de variables en texto, obtener el valor de una expresión entera
- [18] dadas variaciones sucesivas en texto, obtener el valor inicial
- [19] dadas temperaturas en tabla-doble-entrada, obtener el promedio o la mayor amplitud
- [20] dados enteros negativos consecutivos en texto, obtener la relación siempre verdadera
- [21] dadas expresiones con una variable en texto, obtener su orden creciente
- [22] dada una pirámide de sumas en texto, obtener los valores faltantes
- [23] dado un número acotado en texto, obtener el máximo de una cadena de operaciones
- [25] dada una secuencia de pasos de resolución en texto, obtener el paso con el primer error
- [26] dado un conteo de fichas en pictograma, obtener la expresión del puntaje total
- [27] dada una operación combinada con unidades en texto, obtener el significado del resultado
- [28] dada una tabla de masas atómicas en tabla-doble-entrada, obtener la expresión de la masa total
- [29] dado un crucigrama de operaciones en texto, obtener el valor más frecuente entre los faltantes
- [31] dado un producto de fracciones en texto, obtener la condición que garantiza una desigualdad
- [32] dados puntos que dividen un trazo en recta-numerica, obtener la operación que da cierto resultado
- [33] dada una fracción con signos variables en texto, obtener la afirmación siempre verdadera
- [35] dado un número mixto en texto, obtener su inverso multiplicativo
- [36] dados tiempos en números mixtos en texto, obtener la diferencia en otra unidad
- [37] dada una fracción compleja en texto, obtener su inverso
- [38] dada una secuencia de pasos con fracciones en texto, obtener el paso con el primer error
- [39] dado un producto de diferencias unitarias en texto, obtener su valor simplificado
- [40] dada una fracción de una fracción de un total en texto, obtener la fracción del total
- [41] dada una parte leída en texto, obtener la parte restante en cantidad
- [42] dada una receta en texto, obtener las cantidades escaladas
- [44] dadas fracciones sucesivas de un grupo en texto, obtener el subgrupo final
- [45] dada una regla de promedio por componentes en tabla-doble-entrada, obtener el elemento faltante
- [46] dadas dos estrategias de resolución en texto, obtener cuál es válida
- [47] dada una parte pintada y el resto en área en texto, obtener la superficie total
- [48] dado un decimal periódico en texto, obtener su fracción generatriz
- [49] dadas varias fracciones en texto, obtener la que genera un decimal periódico
- [50] dadas operaciones con decimales periódicos en texto, obtener cuál no da entero
- [51] dada una secuencia de pasos con un decimal periódico en texto, obtener el paso erróneo
- [52] dado un decimal periódico en texto, obtener una fracción de él
- [53] dados tiempos decimales en tabla-doble-entrada, obtener el orden de llegada
- [54] dada una fórmula de conversión en texto, obtener el equivalente en otra unidad
- [55] dada una fracción de una unidad de masa en texto, obtener el equivalente decimal
- [57] dados registros decimales en tabla-doble-entrada, obtener la mayor diferencia
- [58] dada una equivalencia de unidades en texto, obtener la expresión de conversión
- [59] dado un total y una capacidad decimal en texto, obtener la cantidad de envases
- [60] dados precios por kilo en tabla-doble-entrada, obtener la expresión del gasto total
- [61] dada una tabla de rangos en tabla-doble-entrada, obtener el valor mínimo requerido
- [62] dado un consumo por minuto en texto, obtener el total diario
- [63] dadas masas unitarias en tabla-doble-entrada, obtener qué agregar para alcanzar un total
- [64] dados tiempos en tabla-doble-entrada, obtener la afirmación correcta sobre el orden
- [65] dado un grosor unitario y tapas en texto, obtener el grosor total
- [66] dado un enunciado de costos de dos alternativas en texto, obtener el ahorro
- [67] dada una operación combinada con decimales periódicos en texto, obtener su valor
- [68] dado un reparto en fracciones sucesivas en texto, obtener la parte restante
- [69] dadas condiciones sobre divisores y múltiplos en texto, obtener el resultado de una operación
- [70] dadas reglas de puntaje de un juego en texto, obtener el puntaje máximo posible
- [72] dadas cantidades anidadas y un porcentaje de pérdida en texto, obtener la cantidad entera de productos
- [73] dado un procedimiento de probabilidad con un error en texto, obtener el paso erróneo
- [74] dadas dos tarifas con cuota fija y precio unitario en texto, obtener la cantidad mínima que conviene
- [75] dadas dos condiciones de masa total en texto, obtener las masas individuales en otra unidad
- [76] dada una fórmula de conteo en texto, obtener el significado de un factor
- [77] dados desplazamientos ortogonales sucesivos en figura-plana, obtener la expresión de la distancia directa
- [78] dada una tabla de límites en tabla-doble-entrada, obtener cuál afirmación es verdadera
- [79] dada una pieza en tablero en figura-plana, obtener la serie de movimientos hacia una casilla

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, recta-numerica (descrita en texto: 006, 014).

Material (conceptos que la declaran): sin-representacion (13), tabla-doble-entrada (8), recta-numerica (5), figura-plana (2), grafico-barras (1), pictograma (1).

Ausentes: tabla-doble-entrada (8), figura-plana (2), grafico-barras (1), pictograma (1).

### c) Candidatos de error sin id que el banco podría usar (57)

- confunde no positivo con negativo y omite el cero
- incluye el extremo excluido del intervalo al contar
- confunde el antecesor par con el antecesor inmediato
- toma un caso particular como prueba de una propiedad general
- confunde el opuesto de un número con el número mismo al despejar
- verifica solo una de las dos condiciones de divisibilidad requeridas
- confunde mcm con MCD según el tipo de pregunta
- olvida los divisores negativos o el propio número al listar divisores
- responde el múltiplo común en lugar de la cantidad de paquetes
- compara solo el valor final e ignora la variación
- aplica el caso incorrecto de la definición cuando la variable es negativa
- cree que el valor absoluto de una expresión es la expresión sin signo
- confunde la posición de un impar con su valor
- omite el opuesto al traducir una frase
- olvida un mes distinto al calcular un total anual
- cuenta solo el avance neto sin restar el retroceso
- aplica la regla del patrón a la figura equivocada
- ignora el signo al sumar enteros de distinto signo
- suma las variaciones sin invertirlas para volver al inicio
- divide el promedio por la cantidad incorrecta de datos
- supone que un producto de negativos es negativo
- confunde el cuadrado de un negativo con el opuesto del cuadrado (otra unidad: potencias-y-raices/eleva-negativo-sin-parentesis)
- comete un error aritmético en la suma final aunque el planteo sea correcto
- interpreta el cociente de dos razones con la unidad equivocada
- representa fichas negativas con resta en lugar de sumar el valor negativo
- olvida que el numerador puede ser cero al juzgar el signo
- cree que una fracción con denominador mayor es siempre menor
- toma la condición de la desigualdad sobre la fracción incorrecta
- simplifica una fracción compleja como si fuera cociente directo
- confunde opuesto con recíproco
- convierte la parte fraccionaria de hora a minutos con factor incorrecto
- aplica la segunda fracción al total en vez del resto
- confunde la fracción leída con la fracción que falta
- escala solo un ingrediente al cambiar la cantidad de personas
- olvida convertir unidades antes de multiplicar
- reconstruye el total desde la parte pintada en lugar de la restante
- olvida restar la parte entera al transformar un periódico
- usa nueves y ceros en cantidad equivocada según período y anteperíodo
- trata un periódico como finito al operar
- juzga el tipo de decimal sin simplificar la fracción
- compara decimales por cantidad de cifras y no por valor posicional
- divide en el orden inverso al convertir unidades
- toma la diferencia entre valores consecutivos y no entre máximo y mínimo
- interpreta el mayor tiempo como ganador de una carrera
- elige el rango equivocado de la tabla
- acepta una afirmación verdadera con justificación falsa
- olvida sumar las partes adicionales como las tapas
- confunde segundos con fracción decimal de minuto
- incluye el número excluido al sumar múltiplos
- aplica la fracción del resto sobre el total original
- convierte mal un decimal periódico a fracción
- ignora una condición del enunciado al elegir los casos favorables
- olvida que la respuesta debe ser un entero y redondea hacia arriba
- confunde exceder un límite con quedar bajo él
- convierte mal las unidades al final
- confunde el sentido de la desigualdad al comparar costos
- interpreta un factor fijo como variable del modelo

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 10 (50 %) | 3 (15 %) | 2 (10 %) | 5 (25 %) |
| material (94) | 39 (41 %) | 14 (15 %) | 12 (13 %) | 30 (32 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 7 (35 %) | 10 (50 %) | 3 (15 %) |
| material | 18 (19 %) | 76 (81 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-enteros-y-racionales-020 | [48] dado un decimal periódico en texto, obtener su fracción generatriz | cuatro ítems son cadenas de puntajes con signo y el banco no tiene ningún decimal periódico (cinco tareas en el material) |
| adv-enteros-y-racionales-004 | [40] dada una fracción de una fracción de un total en texto, obtener la fracción del total | misma familia que 003, 019 y 020; la fracción de una fracción de un total no aparece en el banco |
| adv-enteros-y-racionales-018 | [6] dadas dos longitudes en texto, obtener la mayor medida común de corte | tercera operatoria combinada pura; divisibilidad, mcm y MCD están ausentes del banco |
| adv-enteros-y-racionales-005 | [53] dados tiempos decimales en tabla-doble-entrada, obtener el orden de llegada | operatoria pura con decimales; una tabla de tiempos decimales suma la representación tabular, ausente en el banco |
| adv-enteros-y-racionales-001 | [25] dada una secuencia de pasos de resolución en texto, obtener el paso con el primer error | operatoria pura; el formato 'primer paso erróneo' cubre el patrón candidato 'opera de izquierda a derecha ignorando la jerarquía' |

## expresiones-algebraicas

Banco: 20 ítems. Material: 4 conceptos, 63 problemas, 31 tareas tipo (10 cubiertas, 21 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-expresiones-algebraicas-011.

### a) Tareas tipo sin ningún ítem que las cubra (21)

- [5] dada una tabla de valores literales en tabla-doble-entrada, obtener la fila con mayor variación
- [6] dada una expresión racional en texto, obtener el valor de la variable que la hace positiva
- [7] dada una expresión algebraica con sustitución de variables en texto, obtener la expresión resultante
- [8] dado un modelo lineal de consumo en texto, obtener el total en un período
- [10] dada una figura compuesta con lados literales en figura-plana, obtener la expresión del área sombreada
- [11] dado el perímetro literal de un cuadrado en texto, obtener la expresión de su área
- [12] dada una expresión cuadrática en texto, obtener la figura cuya área la representa
- [15] dada una tabla de áreas literales en tabla-frecuencias, obtener la diferencia entre sumas de áreas
- [16] dada una expresión con productos notables en texto, obtener los valores que producen un resultado dado
- [17] dado un contexto de crecimiento constante del lado en texto, obtener la expresión del área final
- [19] dada una lista de binomios en texto, obtener cuál no es factor de una expresión
- [20] dado un producto con un coeficiente desconocido en texto, obtener el valor del coeficiente
- [21] dada una figura con región sombreada de medidas literales en figura-plana, obtener su área factorizada
- [22] dados el área literal de un rombo y una diagonal en texto, obtener la otra diagonal
- [23] dado el volumen literal de un cuerpo en cuerpo-geometrico, obtener una arista desconocida
- [24] dada una secuencia de pasos de factorización en texto, obtener el paso erróneo
- [25] dado un cociente de fracciones algebraicas con cubos en texto, obtener su forma simplificada
- [26] dadas dos áreas literales que se unen en figura-plana, obtener las dimensiones del terreno total
- [27] dada una identidad algebraica en texto, obtener la factorización de una expresión que la sigue
- [29] dado un cubo de binomio en representación sin-representacion, obtener su desarrollo
- [30] dado un procedimiento de factorización paso a paso en representación sin-representacion, obtener el paso erróneo

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion.

Material (conceptos que la declaran): sin-representacion (4), figura-plana (2), tabla-doble-entrada (1), tabla-frecuencias (1), cuerpo-geometrico (1).

Ausentes: figura-plana (2), tabla-doble-entrada (1), tabla-frecuencias (1), cuerpo-geometrico (1).

### c) Candidatos de error sin id que el banco podría usar (11)

- invierte el orden en la semidiferencia o en el exceso
- evalúa en un valor que anula el denominador sin notarlo
- olvida aplicar el descuento sobre el total ya calculado
- confunde suma por diferencia con cuadrado de binomio
- pierde el exponente de un término al copiar
- confunde perímetro con lado al calcular el área
- toma el siguiente entero como impar consecutivo
- extrae un factor común incompleto
- confunde los signos de los binomios con término común
- acepta como factor un binomio de signo contrario
- olvida multiplicar la cantidad de monedas por su valor

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 12 (60 %) | 4 (20 %) | 0 (0 %) | 4 (20 %) |
| material (63) | 16 (25 %) | 16 (25 %) | 15 (24 %) | 16 (25 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 4 (20 %) | 9 (45 %) | 7 (35 %) |
| material | 0 (0 %) | 63 (100 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-expresiones-algebraicas-002 | [10] dada una figura compuesta con lados literales en figura-plana, obtener la expresión del área sombreada | tercer 'reducir'; el área sombreada con lados literales agrega figura-plana, ausente en el banco |
| adv-expresiones-algebraicas-007 | [19] dada una lista de binomios en texto, obtener cuál no es factor de una expresión | quinto cuadrado de binomio; la factorización solo tiene un ítem (008) frente a veinte problemas del material |
| adv-expresiones-algebraicas-012 | [20] dado un producto con un coeficiente desconocido en texto, obtener el valor del coeficiente | cuarto desarrollo de productos notables; el coeficiente desconocido exige leer la identidad al revés |
| adv-expresiones-algebraicas-005 | [29] dado un cubo de binomio en representación sin-representacion, obtener su desarrollo | cuadrado de binomio repetido; el cubo de binomio cubre el candidato 'eleva al cubo cada término sin los cruzados' |
| adv-expresiones-algebraicas-003 | [26] dadas dos áreas literales que se unen en figura-plana, obtener las dimensiones del terreno total | reducir con exponentes; unir dos áreas literales y factorizar es modelar, habilidad con solo cuatro ítems |

## funcion-cuadratica

Banco: 20 ítems. Material: 8 conceptos, 72 problemas, 58 tareas tipo (14 cubiertas, 44 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-funcion-cuadratica-008.

### a) Tareas tipo sin ningún ítem que las cubra (44)

- [0] dada una ecuación cuadrática sin término lineal en texto, obtener sus dos soluciones reales o su inexistencia
- [1] dada una ecuación cuadrática sin término independiente en texto, obtener sus soluciones por factor común
- [2] dado un despeje paso a paso de una ecuación pura con parámetros en texto, obtener el paso erróneo
- [4] dada una lista de ecuaciones cuadráticas en texto, obtener cuál carece de soluciones reales
- [5] dada una ecuación con un coeficiente desconocido y una solución conocida en texto, obtener la otra solución
- [6] dada una igualdad entre un producto de binomios y un trinomio en texto, obtener el valor de un parámetro
- [7] dada una ecuación cuadrática en texto, obtener la ecuación cuyas raíces son las originales multiplicadas por una constante
- [8] dado un cociente entre un trinomio y un binomio en texto, obtener el factor restante
- [9] dada una ecuación cuadrática sin soluciones reales en texto, obtener la justificación válida de ese hecho
- [11] dado un triángulo rectángulo con lados expresados en la incógnita en figura plana, obtener la ecuación que la determina
- [12] dado un cuerpo geométrico con volumen conocido y una arista literal en cuerpo geométrico, obtener la ecuación para la arista
- [13] dada una región compuesta con medidas literales en figura plana, obtener la medida desconocida a partir del área total
- [16] dada una figura con dimensiones literales y un recurso limitado en texto, obtener la expresión del sobrante
- [17] dado un cilindro con volumen y altura conocidos en texto, obtener el radio
- [18] dada una función cuadrática en texto, obtener cuál de varios puntos pertenece a su gráfica
- [20] dada una parábola en plano cartesiano con coeficientes literales, obtener los signos de los coeficientes
- [23] dada una función con parámetro y un punto de su gráfica en texto, obtener la intersección con el eje vertical
- [24] dada una parábola en plano cartesiano con vértice e intersección conocidos, obtener su expresión general
- [26] dadas dos funciones lineales en texto, obtener el bosquejo del gráfico de su producto
- [27] dadas condiciones de signo sobre los coeficientes en texto, obtener el bosquejo de la parábola en plano cartesiano
- [28] dado un modelo cuadrático de altura o población en texto, obtener el valor de la función en un instante
- [29] dado un modelo cuadrático con parámetro físico en texto, obtener el instante en que se alcanza un valor
- [30] dado un cuerpo geométrico con una dimensión variable y otra dependiente, obtener la función de volumen
- [31] dada una trayectoria parabólica en plano cartesiano, obtener la afirmación verdadera sobre alturas y distancias
- [32] dada una parábola con vértice marcado en plano cartesiano que pasa por el origen, obtener su expresión
- [33] dadas dos parábolas que se cortan en plano cartesiano, obtener la afirmación siempre verdadera sobre ambas
- [35] dado un perímetro fijo en texto, obtener la función que da el área según un lado
- [36] dada una plancha doblada en figura plana, obtener la medida del doblez que maximiza el volumen
- [37] dada una función en forma canónica en texto, obtener su vértice, recorrido o bosquejo en plano cartesiano
- [39] dado un vértice y otro punto de la parábola en texto, obtener la función que la representa
- [41] dados los vértices de dos parábolas en forma canónica en texto, obtener el perímetro del triángulo que forman con el origen
- [43] dados tres procedimientos para hallar el máximo en texto, obtener cuál es correcto
- [44] dado un mínimo y otro dato de producción en texto, obtener la función que modela la cantidad
- [45] dada una parábola en plano cartesiano con vértice y un punto leídos, obtener el valor aproximado en otra abscisa
- [46] dada una figura simétrica con dos parábolas en plano cartesiano, obtener la forma analítica de una de ellas
- [47] dada una función en forma factorizada en texto, obtener su eje de simetría y su valor extremo
- [49] dado un modelo de altura en forma factorizada en texto, obtener la afirmación verdadera sobre caída y máximo
- [51] dado un arco simétrico con ancho y altura en plano cartesiano, obtener la función que lo modela
- [52] dadas dos parábolas con vértices marcados en plano cartesiano, obtener la afirmación verdadera sobre sus expresiones
- [53] dada una parábola desplazada verticalmente en texto, obtener la distancia entre sus ceros
- [54] dada una pared con una ventana de medidas literales en figura plana, obtener la ecuación del área pintada
- [55] dada la solución mayor de una ecuación cuadrática en texto, obtener el parámetro de otra ecuación que la comparte
- [56] dada una función cuadrática sin término lineal en texto, obtener su bosquejo en plano cartesiano
- [57] dada una ganancia en forma canónica en texto, obtener el precio que la maximiza

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, plano-cartesiano (006, 009, 010, 012, 015, 019), tabla de valores, fuera del enum (003, 008).

Material (conceptos que la declaran): sin-representacion (8), plano-cartesiano (5), figura-plana (3), cuerpo-geometrico (2).

Ausentes: figura-plana (3), cuerpo-geometrico (2).

### c) Candidatos de error sin id que el banco podría usar (29)

- asume que un discriminante negativo aparece solo en ecuaciones completas
- confunde la suma de raíces con el producto al factorizar el trinomio
- cree que discriminante cero significa ausencia de soluciones
- confunde no poder factorizar con enteros con no tener soluciones reales
- comete errores de signo al trasladar términos a un mismo lado (otra unidad: ecuaciones-e-inecuaciones-primer-grado/invierte-signo-al-transponer)
- olvida que la solución de multiplicidad doble cuenta dos veces
- al multiplicar las raíces por una constante negativa, cambia el signo de la suma pero no del producto
- responde el valor de la incógnita en vez de la magnitud pedida
- omite el medio en el área del triángulo (otra unidad: figuras-geometricas/omite-mitad-en-area)
- asigna la hipotenusa a un cateto al aplicar Pitágoras (otra unidad: figuras-geometricas/trata-cateto-como-hipotenusa)
- confunde perímetro con área al plantear la igualdad
- convierte mal las unidades de superficie al cambiar de metros a centímetros
- plantea la ecuación con el largo cuando la incógnita definida es el ancho
- deduce el signo del coeficiente lineal sin considerar el signo del coeficiente principal
- asume que toda parábola corta el eje horizontal en dos puntos
- interpreta la intersección de dos curvas de distancia como colisión de los objetos
- convierte mal las unidades de tiempo antes de evaluar el modelo
- al despejar el tiempo olvida extraer la raíz cuadrada
- toma el alcance horizontal como el valor del vértice
- expresa la dimensión dependiente sumando en vez de restar la diferencia dada
- invierte el signo de la coordenada horizontal del vértice al leer la forma canónica
- aplica el vector de traslación con signos cambiados (otra unidad: transformaciones-isometricas/traslada-en-sentido-contrario)
- identifica mal los coeficientes cuando la función está escrita en orden no estándar
- olvida el coeficiente principal y asume que vale uno
- confunde el instante del máximo con el instante de caída
- toma la distancia entre ceros como la mitad del ancho real
- suma el área de la ventana en vez de restarla
- usa el diámetro como radio al calcular los semicírculos
- olvida que sin término lineal el eje de simetría es el eje vertical

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 6 (30 %) | 3 (15 %) | 6 (30 %) | 5 (25 %) |
| material (72) | 24 (33 %) | 13 (18 %) | 13 (18 %) | 22 (31 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 3 (15 %) | 10 (50 %) | 7 (35 %) |
| material | 3 (4 %) | 69 (96 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-funcion-cuadratica-001 | [0] dada una ecuación cuadrática sin término lineal en texto, obtener sus dos soluciones reales o su inexistencia | ceros de un trinomio ya se piden en 011 y 009; las ecuaciones incompletas (tres tareas) no están en el banco |
| adv-funcion-cuadratica-004 | [4] dada una lista de ecuaciones cuadráticas en texto, obtener cuál carece de soluciones reales | vértice duplicado con 002; decidir cuál ecuación carece de soluciones reales cubre 'cree que discriminante cero significa ausencia' |
| adv-funcion-cuadratica-002 | [47] dada una función en forma factorizada en texto, obtener su eje de simetría y su valor extremo | vértice duplicado con 004; la forma factorizada como punto de partida no aparece |
| adv-funcion-cuadratica-013 | [12] dado un cuerpo geométrico con volumen conocido y una arista literal en cuerpo geométrico, obtener la ecuación para la arista | área rectangular ya cubierta por 016; el cuerpo geométrico con arista literal agrega la representación ausente |
| adv-funcion-cuadratica-010 | [20] dada una parábola en plano cartesiano con coeficientes literales, obtener los signos de los coeficientes | lectura de gráfica duplicada con 015; los signos de los coeficientes desde la gráfica son un representar sin ítem |

## funcion-lineal-y-afin

Banco: 20 ítems. Material: 3 conceptos, 50 problemas, 34 tareas tipo (11 cubiertas, 23 sin cubrir).

### a) Tareas tipo sin ningún ítem que las cubra (23)

- [1] dada una función y una imagen en representación sin-representacion, obtener la preimagen
- [2] dada una función con parámetro y un par preimagen imagen en representación sin-representacion, obtener el parámetro
- [3] dada una función en representación sin-representacion, obtener el punto que pertenece a su gráfico
- [4] dada una función en representación sin-representacion, obtener la intersección con un eje
- [6] dada una función en representación sin-representacion, obtener la imagen de una expresión algebraica
- [7] dado el gráfico de una función en representación plano-cartesiano, obtener la afirmación verdadera sobre sus valores
- [10] dada una situación en representación texto, obtener el gráfico que la describe
- [11] dado un gráfico de magnitud versus tiempo en representación grafico-lineas, obtener la afirmación deducible
- [12] dada una función definida por argumento desplazado en representación sin-representacion, obtener la imagen de un valor
- [13] dada una función con raíz en representación sin-representacion, obtener el argumento que justifica su dominio
- [14] dadas varias evaluaciones ajenas en representación sin-representacion, obtener la evaluación errónea
- [17] dada una función afín y porcentajes de cambio en representación texto, obtener la nueva función
- [18] dadas dos funciones afines con parámetro en representación sin-representacion, obtener el parámetro que iguala sus valores
- [19] dada una función lineal y un par en representación sin-representacion, obtener la pendiente
- [20] dada una tabla de proporcionalidad en representación texto, obtener la imagen de un valor nuevo
- [21] dada una función afín con parámetro y una imagen en representación sin-representacion, obtener otra imagen
- [24] dada una lista de pares de magnitudes en representación texto, obtener la que no es lineal
- [25] dada una función con parámetro en representación sin-representacion, obtener el valor que la hace lineal
- [26] dada una composición con desplazamiento en representación sin-representacion, obtener el parámetro de un punto
- [28] dada una tabla de valores diarios en representación texto, obtener la proyección acumulada
- [30] dado un gráfico de varias rectas de distancia contra tiempo en plano cartesiano, obtener la afirmación verdadera
- [31] dada una tabla de valores de una función afín en texto, obtener su gráfico en plano cartesiano
- [33] dado un modelo lineal de costo y dos cantidades en texto, obtener el porcentaje de aumento

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, plano-cartesiano (014), tabla (en texto: 013, 016).

Material (conceptos que la declaran): plano-cartesiano (3), sin-representacion (3), grafico-lineas (1).

Ausentes: grafico-lineas (1).

### c) Candidatos de error sin id que el banco podría usar (15)

- confunde imagen con preimagen
- sustituye directamente el argumento en una función definida por argumento desplazado
- error de signo al evaluar potencias y raíces en negativos (otra unidad: potencias-y-raices/eleva-negativo-sin-parentesis)
- lee un gráfico de rapidez como si fuera de posición
- confunde descensos escalonados con una recta continua
- generaliza la restricción del radicando a raíces de índice impar
- no distribuye al evaluar en un binomio (otra unidad: expresiones-algebraicas/reparte-factor-a-un-solo-termino)
- invierte la razón al calcular la pendiente
- aplica el porcentaje a ambos parámetros cuando solo afecta a uno
- interpreta la pendiente con las variables invertidas
- no verifica que el parámetro hallado produzca una función lineal no nula
- toma una relación cuadrática como lineal
- reporta el porcentaje total en vez del porcentaje de aumento (otra unidad: porcentaje/reporta-descuento-en-vez-de-resto)
- asocia mayor distancia recorrida con menor rapidez
- generaliza una desigualdad entre funciones a partir de un solo valor

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 6 (30 %) | 6 (30 %) | 3 (15 %) | 5 (25 %) |
| material (50) | 13 (25 %) | 13 (25 %) | 13 (25 %) | 13 (25 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 3 (15 %) | 11 (55 %) | 6 (30 %) |
| material | 5 (10 %) | 45 (90 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-funcion-lineal-y-afin-010 | [17] dada una función afín y porcentajes de cambio en representación texto, obtener la nueva función | séptimo 'valor fijo y tasa'; aplicar porcentajes a un parámetro cubre un candidato y cruza con porcentaje |
| adv-funcion-lineal-y-afin-012 | [10] dada una situación en representación texto, obtener el gráfico que la describe | misma familia; elegir el gráfico que describe una situación agrega representar (solo tres en el banco) |
| adv-funcion-lineal-y-afin-009 | [4] dada una función en representación sin-representacion, obtener la intersección con un eje | misma familia; la intersección con un eje no se pide en ningún ítem |
| adv-funcion-lineal-y-afin-008 | [11] dado un gráfico de magnitud versus tiempo en representación grafico-lineas, obtener la afirmación deducible | misma familia; el gráfico magnitud contra tiempo cubre 'lee un gráfico de rapidez como posición' |
| adv-funcion-lineal-y-afin-001 | [1] dada una función y una imagen en representación sin-representacion, obtener la preimagen | evaluación directa; la preimagen invierte la tarea y cubre 'confunde imagen con preimagen' |

## porcentaje

Banco: 20 ítems. Material: 6 conceptos, 47 problemas, 32 tareas tipo (11 cubiertas, 21 sin cubrir).

### a) Tareas tipo sin ningún ítem que las cubra (21)

- [2] dada una figura dividida en partes iguales en figura-plana, obtener el porcentaje sombreado
- [3] dado un grafico-circular con cantidades, obtener la afirmación verdadera sobre porcentajes
- [4] dado un porcentaje en texto, obtener operaciones equivalentes
- [5] dada una fracción de una fracción en texto, obtener el porcentaje equivalente
- [6] dada la diferencia de dos porcentajes de una cantidad en texto, obtener la diferencia de tasas
- [7] dados porcentajes parciales y un resto numérico en texto, obtener el total
- [8] dadas dos expresiones algebraicas en texto, obtener qué porcentaje es una de la otra
- [10] dado un porcentaje del resto en texto, obtener el porcentaje del total
- [11] dada una ganancia como expresión en texto, obtener el monto tras descuentos sucesivos
- [14] dada una tabla de aciertos y totales en tabla-doble-entrada, obtener la afirmación verdadera sobre porcentajes
- [15] dados varios procedimientos de cálculo de porcentaje en texto, obtener cuáles son correctos
- [16] dada una tabla de frecuencias en tabla-doble-entrada, obtener el grafico-circular o grafico-barras que la representa
- [17] dada una tabla de conteos incompleta en tabla-doble-entrada, obtener la afirmación verdadera sobre porcentajes
- [21] dado un valor con impuesto incluido en texto, obtener la expresión del monto del impuesto
- [22] dados costo y precio de venta en texto, obtener el porcentaje de ganancia
- [23] dado un modelo con factor de crecimiento en texto, obtener el porcentaje de aumento por periodo
- [25] dada una fórmula geométrica y variaciones de sus variables en texto, obtener el factor de cambio del resultado
- [26] dados precios literales inicial y final en texto, obtener la expresión del porcentaje de cambio
- [27] dado un procedimiento con descuentos sucesivos en texto, obtener el paso erróneo
- [28] dados dos porcentajes de distintos periodos en texto, obtener el cambio en puntos porcentuales
- [31] dados un aumento y una baja porcentual sucesivos en texto, obtener la expresión del precio final

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, tabla-doble-entrada (011, 012).

Material (conceptos que la declaran): sin-representacion (6), grafico-circular (2), figura-plana (2), tabla-doble-entrada (1), grafico-barras (1), pictograma (1), tabla-frecuencias (1).

Ausentes: grafico-circular (2), figura-plana (2), grafico-barras (1), pictograma (1), tabla-frecuencias (1).

### c) Candidatos de error sin id que el banco podría usar (7)

- acepta una afirmación correcta con justificación incorrecta
- compara cantidades absolutas en vez de porcentajes cuando los totales difieren (otra unidad: tablas-y-graficos/compara-absolutas-de-grupos-distintos)
- lee un gráfico de porcentajes con los valores absolutos de la tabla
- confunde el factor de crecimiento con el porcentaje de aumento
- expresa la resta de dos porcentajes como un aumento porcentual
- confunde cambio en la proporción con cambio en la cantidad absoluta
- atribuye el cambio a una variable distinta de la medida en la encuesta

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 10 (50 %) | 5 (25 %) | 3 (15 %) | 2 (10 %) |
| material (47) | 17 (36 %) | 9 (19 %) | 7 (14 %) | 15 (31 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 4 (20 %) | 10 (50 %) | 6 (30 %) |
| material | 0 (0 %) | 47 (100 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-porcentaje-019 | [3] dado un grafico-circular con cantidades, obtener la afirmación verdadera sobre porcentajes | cuarto ítem de 'recuperar el valor original'; el gráfico circular es la representación más frecuente del material y falta en el banco |
| adv-porcentaje-006 | [14] dada una tabla de aciertos y totales en tabla-doble-entrada, obtener la afirmación verdadera sobre porcentajes | tercer ítem de 'valor original con descuento'; comparar porcentajes desde una tabla con totales distintos cubre un candidato de error |
| adv-porcentaje-002 | [21] dado un valor con impuesto incluido en texto, obtener la expresión del monto del impuesto | tercera cadena de porcentajes; el impuesto incluido en el precio cubre 'elige-mal-base' en una forma que el banco no tiene |
| adv-porcentaje-010 | [27] dado un procedimiento con descuentos sucesivos en texto, obtener el paso erróneo | cadena numérica ya cubierta por 007 y 014; el formato 'paso erróneo' agrega un argumentar (el banco tiene solo dos) |
| adv-porcentaje-004 | [28] dados dos porcentajes de distintos periodos en texto, obtener el cambio en puntos porcentuales | cálculo directo ya cubierto por 015; los puntos porcentuales tienen tres candidatos de error sin id |

## potencias-y-raices

Banco: 20 ítems. Material: 10 conceptos, 142 problemas, 64 tareas tipo (8 cubiertas, 56 sin cubrir).

### a) Tareas tipo sin ningún ítem que las cubra (56)

- [2] dada una expresión con varias bases en texto, obtener su forma como producto de potencias de primos
- [3] dado un procedimiento paso a paso con potencias en texto, obtener el paso erróneo
- [4] dados valores de dos variables en texto, obtener la expresión que cumple una condición numérica
- [5] dada una expresión con exponentes literales en texto, obtener la expresión equivalente
- [6] dados varios desarrollos de una misma expresión en texto, obtener el desarrollo correcto
- [8] dado un número en texto, obtener su descomposición en potencias de base diez
- [9] dada una tabla de unidades con equivalencias en tabla-doble-entrada, obtener el resultado de una operación entre ellas
- [10] dados dos números en notación científica en texto, obtener su diferencia en notación científica
- [11] dada una expresión con productos y cocientes de potencias de diez en texto, obtener el valor normalizado
- [12] dada una escalera de prefijos en texto, obtener la conversión entre dos unidades
- [13] dada una tabla de nombres de potencias negativas en tabla-doble-entrada, obtener el valor de una frase operatoria
- [14] dados datos de una situación científica en texto, obtener una magnitud en notación científica
- [15] dado un procedimiento de división en notación científica en texto, obtener el paso erróneo
- [18] dada una fracción de reducción por rebote en texto, obtener la altura tras cierto número de rebotes
- [19] dada una cantidad actual y una regla de reducción a la mitad en texto, obtener la expresión de la cantidad pasada
- [20] dada una tasa porcentual anual en texto, obtener el significado del exponente del modelo
- [21] dado un recorrido con duplicación en cada paso en figura-plana, obtener la potencia de la última posición
- [22] dado un periodo en minutos y un tiempo en horas en texto, obtener la expresión con el exponente correcto
- [23] dado un modelo con exponente negativo y un valor observado en texto, obtener la cantidad inicial
- [24] dada una tabla de valores año a año en tabla-doble-entrada, obtener la expresión del valor tras más periodos
- [25] dada una tabla de capital con interés por periodo en tabla-doble-entrada, obtener la expresión del capital final
- [26] dada una suma de raíces de distinto índice y radicando exacto en texto, obtener su valor
- [27] dada una expresión con raíces de potencias literales en texto, obtener la expresión simplificada
- [28] dada una lista de igualdades con exponentes fraccionarios en texto, obtener la verdadera
- [29] dada una raíz de raíz elevada a un exponente en texto, obtener la raíz equivalente
- [31] dada una raíz de índice mayor que dos en texto, obtener el factor que la convierte en entero
- [32] dado un producto de raíces de índices distintos con base literal en texto, obtener el exponente fraccionario resultante
- [33] dada una lista de raíces en texto, obtener la que ocupa la posición central al ordenarlas
- [34] dada una tabla de aproximaciones de raíces en tabla-doble-entrada, obtener la expresión que aproxima otra raíz
- [35] dada una tabla de términos alternantes en tabla-doble-entrada, obtener la expresión del término general
- [36] dado un cociente de potencias con exponentes fraccionarios en texto, obtener el valor
- [37] dada una raíz no exacta en texto, obtener su forma con factor extraído
- [38] dado un producto de un entero por una raíz en texto, obtener la raíz única equivalente
- [39] dada una raíz de un número compuesto en texto, obtener el producto de raíces de sus factores
- [41] dada la fórmula de la diagonal de un cuerpo-geometrico y su valor en texto, obtener la arista faltante
- [42] dada una fórmula física con raíz y unidades mixtas en texto, obtener el resultado en la unidad pedida
- [43] dado un lado con raíz en figura-plana, obtener el área del triángulo equilátero
- [44] dados masas expresadas con raíces en texto, obtener el porcentaje en masa simplificado
- [45] dada una combinación lineal de raíces en texto, obtener su forma reducida
- [46] dado un producto de binomios conjugados con raíces en texto, obtener su valor
- [47] dada una lista de expresiones con raíces en texto, obtener la que es racional
- [48] dado un cuadrado de binomio con raíces en texto, obtener el desarrollo
- [49] dada una figura con cuadrados de áreas dadas en figura-plana, obtener el área de la región restante
- [50] dada una suma de raíces de distinto índice en texto, obtener la expresión equivalente con un solo índice
- [51] dada una fracción con raíz cuadrada en el denominador en texto, obtener la expresión racionalizada
- [52] dada una fracción con raíz de índice mayor en el denominador en texto, obtener la expresión racionalizada
- [53] dada una fracción con binomio con raíz en el denominador en texto, obtener la expresión racionalizada
- [54] dada una expresión con denominador irracional en texto, obtener su forma racionalizada
- [55] dados el área y un lado irracional de un rectángulo en texto, obtener el otro lado
- [56] dada una figura con lados irracionales en figura-plana, obtener el área de una región
- [57] dada una secuencia de pasos de racionalización en texto, obtener el paso erróneo
- [58] dada una frase verbal sobre raíces en texto, obtener la expresión simbólica
- [59] dada una fórmula geométrica con un dato irracional en texto, obtener una medida con raíces
- [61] dada una tabla de desintegración por día en tabla-frecuencias, obtener el modelo exponencial por semana
- [62] dada una suma de raíces no semejantes en texto, obtener su forma reducida
- [63] dada una fórmula con raíz y datos de contexto en texto, obtener el valor simplificado

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion.

Material (conceptos que la declaran): sin-representacion (10), figura-plana (4), tabla-doble-entrada (3), cuerpo-geometrico (1), tabla-frecuencias (1).

Ausentes: figura-plana (4), tabla-doble-entrada (3), cuerpo-geometrico (1), tabla-frecuencias (1).

### c) Candidatos de error sin id que el banco podría usar (37)

- suma exponentes al sumar potencias de igual base
- asigna valor uno a cero elevado a cero
- divide potencias de exponente negativo con signo equivocado en la resta de exponentes
- asume propiedades para todos los valores cuando dependen de la paridad
- corre la coma en la dirección equivocada al normalizar el coeficiente
- suma coeficientes sin igualar los exponentes de diez
- olvida convertir unidades antes de operar con notación científica
- confunde la potencia de diez con la cantidad de ceros en decimales
- eleva la cantidad inicial junto con el factor
- arma el exponente con las unidades de tiempo sin convertir a periodos
- confunde el exponente cuando el conteo empieza en uno y no en cero
- confunde veces respecto al inicial con incremento respecto al inicial
- prolonga el patrón cuando el enunciado lo detiene en cierto momento
- introduce el signo negativo dentro de una raíz de índice par
- multiplica índices al multiplicar raíces del mismo índice
- opera raíces de distinto índice sin igualarlos
- suma los radicandos al multiplicar raíces
- omite el valor absoluto en raíz par de base negativa
- olvida el valor absoluto al extraer una base negativa con índice par
- introduce un factor sin elevarlo al índice
- sustituye sin convertir centímetros a metros
- eleva al cuadrado solo un lado al despejar bajo la raíz
- confunde el radio con el diámetro al leer la figura (otra unidad: cuerpos-geometricos/confunde-radio-con-diametro-cilindro)
- olvida el doble producto al elevar una diferencia con raíz (otra unidad: expresiones-algebraicas/reparte-cuadrado-sobre-la-suma)
- omite el doble producto al elevar al cuadrado un binomio con raíces (otra unidad: expresiones-algebraicas/reparte-cuadrado-sobre-la-suma)
- declara irracional toda expresión que contenga una raíz
- amplifica por la raíz cuadrada cuando el índice del denominador es mayor
- amplifica por el mismo binomio en vez del conjugado
- se equivoca en el signo al restar los cuadrados del conjugado
- deja el resultado sin simplificar o cambia el signo de la fracción
- omite los paréntesis al elevar al cuadrado un binomio con raíz
- multiplica por el radical equivocado al racionalizar raíces de índice mayor
- confunde el conjugado con el mismo binomio del denominador
- olvida el doble producto al elevar un binomio con raíz (otra unidad: expresiones-algebraicas/reparte-cuadrado-sobre-la-suma)
- confunde radio con diámetro después de despejar
- confunde el signo del exponente al cambiar la unidad de tiempo
- olvida convertir la demanda mensual a anual antes de reemplazar

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 10 (50 %) | 2 (10 %) | 1 (5 %) | 7 (35 %) |
| material (142) | 68 (48 %) | 18 (13 %) | 13 (9 %) | 43 (31 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 4 (20 %) | 13 (65 %) | 3 (15 %) |
| material | 6 (4 %) | 136 (96 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-potencias-y-raices-011 | [14] dados datos de una situación científica en texto, obtener una magnitud en notación científica | siete ítems 'cuál afirmación es verdadera'; la notación científica tiene veinte problemas en el material y cero en el banco |
| adv-potencias-y-raices-012 | [10] dados dos números en notación científica en texto, obtener su diferencia en notación científica | misma familia de siete; operar en notación científica cubre el candidato 'suma coeficientes sin igualar los exponentes' |
| adv-potencias-y-raices-013 | [37] dada una raíz no exacta en texto, obtener su forma con factor extraído | misma familia; la descomposición de raíces no aparece en el banco aunque el catálogo tiene dos ids para ella |
| adv-potencias-y-raices-014 | [45] dada una combinación lineal de raíces en texto, obtener su forma reducida | misma familia; la reducción de raíces semejantes usa suma-radicales-distintos, id con un solo ítem posible hoy |
| adv-potencias-y-raices-010 | [51] dada una fracción con raíz cuadrada en el denominador en texto, obtener la expresión racionalizada | misma familia; la racionalización tiene ocho problemas en el material y ninguno en el banco |

## proporcionalidad

Banco: 20 ítems. Material: 2 conceptos, 22 problemas, 15 tareas tipo (7 cubiertas, 8 sin cubrir).

### a) Tareas tipo sin ningún ítem que las cubra (8)

- [1] dado un segmento dividido en una razón en texto, obtener la medida de una parte
- [6] dado un gráfico de hipérbola con puntos marcados en plano-cartesiano, obtener la ecuación de la relación
- [7] dada una fórmula con varias variables en texto, obtener qué proporcionalidad se cumple al fijar una
- [9] dada una ley física con constante en texto, obtener la tabla de pares que la cumple
- [10] dada una proporcionalidad inversa al cuadrado en texto, obtener el valor asociado a otro dato
- [12] dada una razón de conversión entre unidades en texto, obtener la expresión de conversión
- [13] dado un gráfico de proporcionalidad directa en representación plano-cartesiano, obtener el valor asociado a un dato nuevo
- [14] dada una situación de proporcionalidad inversa en representación texto, obtener el incremento necesario

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, tabla-frecuencias (008, 009, 010, 020), plano-cartesiano (descrito en texto: 005, 016).

Material (conceptos que la declaran): sin-representacion (2), plano-cartesiano (2), tabla-frecuencias (1), grafico-puntos (1), grafico-lineas (1).

Ausentes: grafico-puntos (1), grafico-lineas (1).

### c) Candidatos de error sin id que el banco podría usar (5)

- confunde cuál variable se mantiene constante en una fórmula
- reparte el total en partes iguales en vez de proporcionalmente
- olvida convertir unidades antes de plantear la proporción
- reporta el total nuevo en vez del incremento pedido
- evalúa con un solo dato cuando la variable es una suma

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 8 (40 %) | 4 (20 %) | 2 (10 %) | 6 (30 %) |
| material (22) | 6 (27 %) | 5 (23 %) | 6 (27 %) | 5 (23 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 6 (30 %) | 9 (45 %) | 5 (25 %) |
| material | 2 (9 %) | 20 (91 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-proporcionalidad-019 | [6] dado un gráfico de hipérbola con puntos marcados en plano-cartesiano, obtener la ecuación de la relación | quinto cálculo directo de proporción directa; la hipérbola con puntos exige lectura en plano cartesiano, ausente como figura |
| adv-proporcionalidad-011 | [7] dada una fórmula con varias variables en texto, obtener qué proporcionalidad se cumple al fijar una | misma familia; decidir el tipo de proporcionalidad al fijar una variable de una fórmula es un argumentar distinto de las tablas |
| adv-proporcionalidad-015 | [1] dado un segmento dividido en una razón en texto, obtener la medida de una parte | misma familia; repartir un segmento en una razón no está en el banco |
| adv-proporcionalidad-001 | [10] dada una proporcionalidad inversa al cuadrado en texto, obtener el valor asociado a otro dato | misma familia; la proporcionalidad inversa al cuadrado no aparece en el banco |
| adv-proporcionalidad-020 | [12] dada una razón de conversión entre unidades en texto, obtener la expresión de conversión | quinta tabla '¿es proporcional?'; la expresión de conversión entre unidades es modelar con razón |

## reglas-de-probabilidades

Banco: 20 ítems. Material: 8 conceptos, 47 problemas, 44 tareas tipo (9 cubiertas, 35 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-reglas-de-probabilidades-003, adv-reglas-de-probabilidades-009, adv-reglas-de-probabilidades-014, adv-reglas-de-probabilidades-016, adv-reglas-de-probabilidades-020.

### a) Tareas tipo sin ningún ítem que las cubra (35)

- [0] Dada una tabla de probabilidades de un dado cargado, obtener cuál afirmación comparada con un dado común es verdadera
- [1] Dadas varias cajas con bolitas de dos colores en pictograma, obtener en cuál la probabilidad queda entre dos cotas
- [4] Dado un dado común en texto, obtener qué evento tiene la misma probabilidad que otro experimento
- [5] Dada una urna con bolitas de varios colores en texto, obtener la probabilidad de no obtener un color
- [6] Dado un cartón de bingo en pictograma, obtener la probabilidad de que el primer número esté en él
- [7] Dada una probabilidad de éxito y la cantidad de fracasos en texto, obtener la cantidad de éxitos del lote
- [8] Dado un total de números y una probabilidad deseada en texto, obtener cuántos números faltan por comprar
- [9] Dada una baraja completa en pictograma, obtener la probabilidad de la unión de dos eventos con intersección no vacía
- [10] Dados tres procedimientos para la probabilidad de una unión en texto, obtener cuál es correcto
- [11] Dado un procedimiento paso a paso para una unión de colores en texto, obtener el paso erróneo o su ausencia
- [13] Dada una ruleta con sectores iguales en pictograma, obtener la probabilidad de repetir un resultado en dos giros
- [14] Dado un experimento compuesto con dado y moneda en texto, obtener cuál afirmación sobre el espacio muestral o probabilidades conjuntas es verdadera
- [15] Dada una urna con fichas numeradas en texto, obtener la probabilidad de una intersección de dos condiciones
- [16] Dados dos dados con distinta cantidad de caras en texto, obtener la expresión algebraica de la probabilidad conjunta
- [18] dada una urna con cantidades literales en texto, obtener la expresión de una secuencia de extracciones con reposición
- [19] dados conteos de dos condiciones solapadas en texto, obtener la afirmación verdadera sobre probabilidades
- [21] dado un experimento compuesto en texto, obtener el espacio muestral en diagrama-arbol
- [22] dado un diagrama-arbol, obtener la probabilidad de un evento compuesto por conteo de ramas
- [24] dada una tabla-doble-entrada de sumas de dos dados, obtener el resultado más probable
- [25] dado un procedimiento con pasos en texto, obtener el paso donde se comete el error
- [27] dados dos grafico-circular encadenados, obtener la probabilidad de una categoría de segunda etapa
- [28] dados conteos de inscripción en dos actividades en texto, obtener el complemento de la unión
- [29] dado un esquema de tres conjuntos descrito en texto, obtener la probabilidad de la unión de regiones excluyentes
- [30] dados porcentajes de dos eventos y su intersección en texto, obtener la probabilidad de que no ocurra ninguno
- [32] dado el total y el tamaño de un conjunto en texto, obtener la probabilidad de la región exclusiva restante
- [34] dada una tabla-doble-entrada, obtener la probabilidad de una intersección de categorías
- [35] dada una tabla-doble-entrada, obtener la expresión de la unión de dos categorías no excluyentes
- [36] dada una tabla-doble-entrada con porcentajes, obtener una probabilidad marginal
- [37] dada una tabla-doble-entrada con cantidades literales, obtener la expresión de una probabilidad conjunta
- [38] dada una tabla-doble-entrada y varios argumentos, obtener el argumento no válido
- [39] dadas relaciones entre las probabilidades de las caras en texto, obtener la probabilidad de una cara
- [40] dado un dado cargado en texto, obtener la probabilidad de un evento en dos lanzamientos independientes
- [41] dada una razón entre probabilidades en texto, obtener la probabilidad de un resultado
- [42] dados varios procedimientos de estudiantes en texto, obtener cuáles contienen un error conceptual
- [43] dado un experimento en dos etapas con moneda cargada en texto, obtener la probabilidad de un resultado final

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, tabla-doble-entrada (en prosa: 012).

Material (conceptos que la declaran): sin-representacion (6), pictograma (3), tabla-doble-entrada (2), tabla-frecuencias (1), diagrama-arbol (1), grafico-circular (1).

Ausentes: pictograma (3), tabla-frecuencias (1), diagrama-arbol (1), grafico-circular (1).

### c) Candidatos de error sin id que el banco podría usar (17)

- olvida que el total incluye la incógnita al despejar
- responde la cantidad total requerida en vez de la faltante
- cree que todo procedimiento presentado contiene un error
- asume independencia entre condiciones sobre un mismo objeto sin verificarla
- confunde al menos con estrictamente mayor y a lo más con estrictamente menor
- trata extracción con reposición como si fuera sin reposición
- asigna a cada resultado elemental la probabilidad de todo el evento favorable
- confunde independencia con exclusión mutua
- no reduce la segunda etapa al subconjunto que corresponde
- confunde el total de un conjunto con la parte exclusiva
- olvida la región exterior al calcular el complemento
- confunde probabilidad conjunta con condicional
- categorías no excluyentes al construir la tabla
- interpreta la razón entre dos probabilidades como la fracción de la primera
- cuenta los términos de la razón como cantidad de resultados posibles
- olvida que todas las probabilidades deben sumar uno
- multiplica el peso de una cara por la cantidad de caras equivocada

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 9 (45 %) | 5 (25 %) | 1 (5 %) | 5 (25 %) |
| material (47) | 16 (34 %) | 10 (21 %) | 7 (14 %) | 15 (31 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 5 (25 %) | 8 (40 %) | 7 (35 %) |
| material | 0 (0 %) | 41 (87 %) | 6 (13 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-reglas-de-probabilidades-002 | [24] dada una tabla-doble-entrada de sumas de dos dados, obtener el resultado más probable | tercer Laplace directo; la tabla de doble entrada de sumas de dos dados agrega la representación más usada por el material |
| adv-reglas-de-probabilidades-010 | [21] dado un experimento compuesto en texto, obtener el espacio muestral en diagrama-arbol | misma familia; el diagrama de árbol no aparece en el banco (tres tareas en el material) |
| adv-reglas-de-probabilidades-001 | [39] dadas relaciones entre las probabilidades de las caras en texto, obtener la probabilidad de una cara | misma familia; el espacio no equiprobable cubre 'aplica Laplace sobre caras físicas sin ponderar' |
| adv-reglas-de-probabilidades-015 | [18] dada una urna con cantidades literales en texto, obtener la expresión de una secuencia de extracciones con reposición | sin reposición ya en 006, 013 y 017; la extracción con reposición como expresión literal falta |
| adv-reglas-de-probabilidades-003 | [38] dada una tabla-doble-entrada y varios argumentos, obtener el argumento no válido | ítem sin tarea tipo en el material; la tabla con argumentos a validar es argumentar con tabla-doble-entrada |

## sistemas-2x2

Banco: 20 ítems. Material: 1 conceptos, 23 problemas, 10 tareas tipo (5 cubiertas, 5 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-sistemas-2x2-016, adv-sistemas-2x2-017.

### a) Tareas tipo sin ningún ítem que las cubra (5)

- [1] dado un sistema en representación sin-representacion, obtener una operación entre sus incógnitas
- [4] dado un punto solución en representación sin-representacion, obtener el sistema que lo admite
- [5] dado un sistema con parámetros y su solución en representación sin-representacion, obtener los parámetros o una relación entre ellos
- [6] dadas dos rectas en representación plano-cartesiano, obtener el sistema correspondiente
- [7] dado un sistema que modela una situación en representación texto, obtener el significado de una variable

### b) Representaciones del material ausentes en el banco

Banco: sin-representacion, tabla-doble-entrada (en prosa: 005, 006, 014).

Material (conceptos que la declaran): plano-cartesiano (1), sin-representacion (1).

Ausentes: plano-cartesiano (1).

### c) Candidatos de error sin id que el banco podría usar (5)

- desplaza el tiempo en sentido equivocado al modelar edades
- trata un número de dos cifras como suma de sus dígitos
- responde con el valor de una variable en vez de la diferencia pedida
- invierte el orden de más que o menos que al modelar
- confunde los cortes con los ejes con el punto solución

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 10 (50 %) | 4 (20 %) | 3 (15 %) | 3 (15 %) |
| material (23) | 6 (25 %) | 6 (25 %) | 6 (25 %) | 6 (25 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 5 (25 %) | 8 (40 %) | 7 (35 %) |
| material | 0 (0 %) | 23 (100 %) | 0 (0 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-sistemas-2x2-004 | [6] dadas dos rectas en representación plano-cartesiano, obtener el sistema correspondiente | cuarto 'resolver en contexto' de la misma forma; dos rectas en plano cartesiano es la única representación gráfica del material y falta |
| adv-sistemas-2x2-003 | [5] dado un sistema con parámetros y su solución en representación sin-representacion, obtener los parámetros o una relación entre ellos | misma familia; el sistema con parámetros y solución conocida no aparece en el banco |
| adv-sistemas-2x2-008 | [1] dado un sistema en representación sin-representacion, obtener una operación entre sus incógnitas | duplicado de 007; pedir una operación entre incógnitas cubre 'responde con una variable en vez de la diferencia pedida' |
| adv-sistemas-2x2-002 | [4] dado un punto solución en representación sin-representacion, obtener el sistema que lo admite | misma familia; dar el punto solución y pedir el sistema invierte la tarea |
| adv-sistemas-2x2-012 | [7] dado un sistema que modela una situación en representación texto, obtener el significado de una variable | cuarto 'sistema dado, afirmación'; preguntar el significado de una variable cubre lee-coeficiente-como-cantidad en lectura |

## transformaciones-isometricas

Banco: 20 ítems. Material: 6 conceptos, 44 problemas, 38 tareas tipo (12 cubiertas, 26 sin cubrir). Ítems del banco sin tarea tipo en el material: adv-transformaciones-isometricas-003, adv-transformaciones-isometricas-004, adv-transformaciones-isometricas-005, adv-transformaciones-isometricas-006, adv-transformaciones-isometricas-010.

### a) Tareas tipo sin ningún ítem que las cubra (26)

- [0] dada una ecuación vectorial con un vector incógnita en texto, obtener sus componentes
- [1] dados dos vectores en plano-cartesiano, obtener cuál igualdad con operaciones entre ellos es verdadera
- [2] dado el módulo y el cuadrante de un vector en texto, obtener componentes posibles
- [5] dado un vector con componente desconocida y módulo conocido en texto, obtener otro vector con módulo igual a la incógnita
- [6] dadas dos fuerzas opuestas en texto, obtener la representación del vector resultante
- [7] dado un vector genérico en texto, obtener la familia de ponderaciones con sentido opuesto y magnitud acotada
- [8] dados varios vectores y afirmaciones sobre ellos en texto, obtener cuál afirmación es errónea
- [9] dados vectores dibujados en plano-cartesiano, obtener la combinación que produce otro vector
- [15] dada una circunferencia en plano-cartesiano, obtener un vector que la lleve completa a un cuadrante
- [16] dadas dos traslaciones sucesivas en texto, obtener la distancia entre punto inicial y final
- [17] dada una traslación por un múltiplo de un vector en texto, obtener el vector
- [18] dado un patrón de traslaciones alternadas en texto, obtener una propiedad de los puntos resultantes
- [19] dado un punto genérico en texto, obtener el cuadrante de su imagen tras un giro
- [20] dado un rectángulo en plano-cartesiano, obtener un vértice de su imagen tras un giro con centro fuera del origen
- [21] dado un triángulo en plano-cartesiano, obtener las abscisas de los vértices tras girar respecto a un punto dado
- [22] dada una figura con sectores sombreados en figura-plana, obtener la posición final tras giros sucesivos
- [23] dado un recorte en papel doblado en figura-plana, obtener la figura al desdoblar
- [24] dada la distancia de un punto a un eje en texto, obtener la distancia entre el punto y su reflejo
- [25] dados cuadriláteros con rectas punteadas en figura-plana, obtener cuál muestra sus ejes de simetría
- [26] dada una recta reflejada respecto a otra en figura-plana, obtener un ángulo del triángulo formado
- [29] dado un punto con coordenadas fraccionarias en texto, obtener su simétrico respecto al origen
- [30] dados un punto y un centro cualquiera en texto, obtener el simétrico
- [32] dada una flecha en plano-cartesiano, obtener la secuencia de isometrías que la orienta hacia un punto cardinal
- [34] dados punto inicial e imagen en texto, obtener la composición correcta entre varias propuestas
- [35] dado un punto genérico de un cuadrante en texto, obtener una condición de su imagen tras giro y traslación
- [37] dada una reflexión aplicada respecto a la recta equivocada en texto, obtener el vector que corrige la posición

### b) Representaciones del material ausentes en el banco

Banco: plano-cartesiano (19 figuras), sin-representacion (018).

Material (conceptos que la declaran): plano-cartesiano (6), sin-representacion (6), figura-plana (5).

Ausentes: figura-plana (5).

### c) Candidatos de error sin id que el banco podría usar (19)

- confunde dirección con sentido
- cree que vectores paralelos tienen siempre igual sentido
- olvida el valor absoluto del escalar al comparar magnitudes
- suma magnitudes en vez de componentes cuando los vectores no son colineales
- olvida el signo de las componentes según el cuadrante
- confunde los puntos cardinales con los signos de las componentes
- aplica la traslación a un solo vértice y generaliza mal
- olvida dividir por el escalar cuando la traslación es un múltiplo del vector
- olvida deshacer la traslación auxiliar cuando el centro no es el origen
- confunde el signo de las coordenadas al girar
- suma ángulos sin considerar el signo del sentido
- intercambia las reglas de la diagonal principal y la secundaria
- trata una recta vertical arbitraria como si fuera el eje
- atribuye ejes de simetría a las diagonales de todo cuadrilátero
- aplica la regla del origen aunque el centro sea otro punto
- olvida duplicar las coordenadas del centro en la fórmula general
- no deshace la traslación auxiliar antes de la siguiente isometría
- acepta un paso porque el resultado parcial parece razonable sin verificarlo
- confunde la imagen final con un paso intermedio

### d) Habilidad y dificultad: banco contra material

| | resolver | modelar | representar | argumentar |
|---|---|---|---|---|
| banco (20) | 8 (40 %) | 4 (20 %) | 2 (10 %) | 6 (30 %) |
| material (44) | 16 (36 %) | 3 (8 %) | 16 (36 %) | 9 (21 %) |

| | baja | media | alta |
|---|---|---|---|
| banco | 6 (30 %) | 9 (45 %) | 5 (25 %) |
| material | 2 (5 %) | 32 (73 %) | 10 (23 %) |

### e) Reemplazos sugeridos (máximo 5, se firman aparte)

| ítem a reemplazar | tarea tipo a cubrir | razón |
|---|---|---|
| adv-transformaciones-isometricas-003 | [24] dada la distancia de un punto a un eje en texto, obtener la distancia entre el punto y su reflejo | distancia entre puntos duplicada con 010; la distancia punto-reflejo desde la distancia al eje es argumentar sobre la reflexión |
| adv-transformaciones-isometricas-010 | [20] dado un rectángulo en plano-cartesiano, obtener un vértice de su imagen tras un giro con centro fuera del origen | misma duplicación; el giro con centro fuera del origen tiene cuatro problemas y cubre dos candidatos |
| adv-transformaciones-isometricas-004 | [30] dados un punto y un centro cualquiera en texto, obtener el simétrico | reflexión de un punto ya en 006 y 011; la simetría central no aparece en el banco |
| adv-transformaciones-isometricas-005 | [19] dado un punto genérico en texto, obtener el cuadrante de su imagen tras un giro | giro de un punto ya en 009 y 012; el cuadrante de la imagen de un punto genérico es argumentar con literales |
| adv-transformaciones-isometricas-002 | [16] dadas dos traslaciones sucesivas en texto, obtener la distancia entre punto inicial y final | traslación de un punto ya en 014; dos traslaciones sucesivas y la distancia final combinan traslación y distancia |

