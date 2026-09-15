# Candidatos de ids por unidad

> **ESTADO: NO FIRMADO.** Lista de trabajo, nada de esto existe en `content/errores/`.

Origen: `docs/analisis/frecuencia-demre-v2.json`, distractores con `errorId: null` clasificados como (B) en la reasignación del 2026-09-15 (commit ffc7c5e): 155 distractores en 81 grupos, agrupados por unidadId y mecanismo. Los 19 grupos con 3 o más distractores llevan id provisional y descripción propuesta en el estilo del catálogo de su unidad; los 62 grupos menores (2 o 1) llevan solo mecanismo y refs.

Las etiquetas de trabajo (E-b1, P-s3, CG-b2, etc.) que aparecen en las tablas de la sesión son códigos internos de la clasificación, no ids de catálogo. Regla vigente: el texto lo propone CC, el id lo fija Benja. Conforme a ADR-001, cada id pertenece a la unidad del distractor; ningún grupo cruza unidades.

Convención de refs: `forma/numeroPregunta` + clave del distractor (por ejemplo `2024-invierno-111/8A`).

## Grupos con 3 o más distractores (19, ordenados por cantidad)

### 1. expresiones-algebraicas/arma-la-operacion-equivocada-al-modelar (7)

Arma la expresión con la operación equivocada al traducir un enunciado: multiplica donde va dividir, resta donde va dividir, o invierte el cociente o la razón entre las dos cantidades (escribe 350000·A, 350000 − A o A/350000 donde va 350000/A; escribe x = p + 10 donde va p = x + 10). Cada expresión está bien formada; describe otra relación. Distinto de proporcionalidad/invierte-el-cociente, que es sobre la constante de una tabla: acá no hay tabla, es la expresión literal que se pide.

Refs: 2024-invierno-111/23B, 2024-invierno-111/23C, 2024-invierno-111/23D, 2024-invierno-111/26C, 2024-invierno-111/46D, 2025-regular-113/27B, 2025-regular-113/32C.

Nota: bolsa de tres operaciones (invierte, multiplica por dividir, resta por dividir); se puede partir en dos ids si se prefiere.

### 2. potencias-y-raices/cuenta-mal-las-repeticiones-del-factor (6)

Contar mal cuántas veces se aplica el factor en un crecimiento o decrecimiento repetido: un rebote o una duplicación de más o de menos, o aplicar el factor una sola vez cuando el enunciado lo repite (100·(4/5)² con tres rebotes; 20·2¹⁰ cuando el primer día no se duplica; 2ⁿ⁻¹ donde va 2ⁿ; olvidar el día adicional al final). El factor está bien; lo que falla es el exponente que le corresponde. Distinto de multiplica-base-por-exponente, donde el exponente se lee como un factor más.

Refs: 2024-invierno-111/10B, 2024-invierno-111/10C, 2024-invierno-111/20D, 2025-regular-113/23A, 2027-invierno-111/23A, 2027-invierno-111/23C.

### 3. ecuaciones-e-inecuaciones-primer-grado/traduce-mal-coeficientes-y-cantidades (6)

Al traducir el enunciado a una ecuación, poner en un término el coeficiente o la cantidad equivocada: omitir el factor que indica "triple" o "doble", o cobrar un ítem a una cantidad de personas distinta de la que dice el enunciado (x + 10 = 37 donde va 3x + 10 = 37; 4000·5 + 4x donde va 4000·4 + 5x). Distinto de omite-cantidad-inicial-en-inecuacion, que deja fuera el término constante: acá los términos están todos, con el número equivocado.

Refs: 2025-regular-113/33A, 2025-regular-113/33B, 2025-regular-113/33C, 2025-regular-113/34B, 2025-regular-113/34C, 2025-regular-113/34D.

Nota: dos preguntas.

### 4. enteros-y-racionales/cuenta-intervalos-de-mas-o-de-menos (5)

Contar de más o de menos los intervalos, las repeticiones o las personas de una situación: 17 bajadas de 3 °C donde hay 16, tres comisiones donde hay dos, un año de más al pasar del año −1 al 1, o repartir entre nueve cuando uno de los nueve ya se quedó con su parte. Las sumas y restas están bien; el número de veces, no. Distinto de funcion-lineal-y-afin/cuenta-mal-los-saltos: acá no hay modelo lineal.

Refs: 2024-invierno-111/8A, 2024-regular-113/5D, 2024-regular-113/7B, 2024-regular-113/7C, 2027-invierno-111/3A.

Nota: 2027-invierno-111/3A se infiere de los números (divide entre 9 cuando son 8 más José), no del texto del razonamiento.

### 5. cuerpos-geometricos/cuenta-mal-los-bloques-del-cuerpo (5)

Al contar los cubos o bloques que forman un cuerpo compuesto, contar de más o de menos: incluir dos veces la esquina que comparten dos brazos, contar como un bloque una pieza que ocupa dos, o dejar fuera un cubo de la base. El volumen de cada pieza está bien; lo que falla es cuántas piezas hay.

Refs: 2024-invierno-111/45A, 2024-invierno-111/45B, 2026-regular-113/47A, 2026-regular-113/47C, 2026-regular-113/47D.

### 6. proporcionalidad/lee-la-fila-equivocada-de-la-tabla (4)

Toma la constante de otra fila de la tabla: multiplica la cantidad pedida por el valor del rango vecino (12 kg por el 0,2 de la fila 10–20 en vez del 0,3 de la fila 20–30), o usa la dosis de otra fila. El procedimiento es el correcto; el dato entró de la fila equivocada. Distinto de confunde-constante-con-valor-de-tabla, que entrega un valor de la tabla como respuesta.

Refs: 2024-invierno-111/6A, 2024-invierno-111/6B, 2024-invierno-111/6D, 2025-regular-113/29C.

### 7. proporcionalidad/reparte-sobre-el-total-equivocado (4)

Reparte proporcionalmente sobre un total que no es el del enunciado: divide por las horas de la semana completa cuando la razón era sobre las de lunes a viernes, divide por la cantidad de partes equivocada, o aplica la razón al gasto total y no a la parte que la razón describe. La razón está bien leída; la base sobre la que se reparte, no.

Refs: 2024-invierno-111/9A, 2024-invierno-111/9B, 2024-invierno-111/29C, 2027-invierno-111/29B.

### 8. potencias-y-raices/cambia-la-operacion-entre-potencias (4)

Reemplazar la operación que la expresión pide entre potencias o radicales por otra: sumar dos factores que había que multiplicar (10³ + 10³ en vez de 10³·10³; (√5 + 1) + (√5 − 1) en vez de su producto), o multiplicar o restar donde había que dividir (2·√2 o 2 − √2 en vez de 2/√2). No es una regla de exponentes mal aplicada: la operación misma se cambió. Distinto de cruza-reglas-de-exponentes, donde la operación entre potencias sí se leyó bien y falló la regla.

Refs: 2024-invierno-111/17B, 2024-regular-113/21D, 2025-regular-113/21A, 2025-regular-113/21D.

Nota: bolsa de tres operaciones, igual que el grupo 1.

### 9. expresiones-algebraicas/traduce-mal-la-agrupacion-del-enunciado (4)

Traduce el enunciado a una expresión con la agrupación equivocada: toma "la tercera parte del sucesor" como la tercera parte y después el sucesor (p/3 + 1), triplica donde dice tercera parte, resta un tercio donde dice un tercio del número, o agrupa "el doble" sobre toda la resta cuando solo afecta al primer término. La expresión que resulta está bien escrita; describe otra frase. Distinto de reparte-factor-a-un-solo-termino, donde la expresión ya está armada y falla la distribución.

Refs: 2024-invierno-111/24A, 2024-invierno-111/24B, 2024-regular-113/26B, 2024-regular-113/26C.

### 10. enteros-y-racionales/traduce-mal-el-enunciado-numerico (4)

Traducir mal el enunciado a una expresión numérica: omitir el paréntesis de la diferencia (2·(1/3)·8 − 6 donde va 2·(1/3)·(8 − 6)), tomar "triple" donde dice "tercera parte", u operar con los números pelados sin los factores que el enunciado nombra (−10 − (−12) sin el quíntuplo ni el triple). Distinto de rompe-orden-de-operaciones: acá la expresión escrita ya es otra; allá la expresión es la correcta y se resuelve en el orden equivocado.

Refs: 2024-regular-113/3C, 2024-regular-113/4A, 2024-regular-113/4C, 2024-regular-113/4D.

### 11. enteros-y-racionales/responde-otra-magnitud-enteros (3)

Calcular bien y responder otra magnitud: entregar la variación de temperatura como si fueran los minutos, lo gastado cuando se pide lo ahorrado, o la fracción de respuestas incorrectas cuando se pide la de correctas. El procedimiento está completo; lo que falla es la lectura de qué pide el enunciado. Mismo mecanismo que potencias-y-raices/responde-otra-magnitud-potencias y porcentaje/responde-otra-magnitud-porcentaje, con objetos de esta unidad.

Refs: 2024-invierno-111/8D, 2026-regular-113/25C, 2027-invierno-111/14C.

### 12. funcion-lineal-y-afin/lee-grafico-rapidez-tiempo-como-posicion (3)

Leer un gráfico de rapidez contra tiempo como si fuera de posición contra tiempo: tomar un tramo horizontal como "detenido" cuando es rapidez constante, contar los cambios de pendiente como cambios de dirección, o tomar el valor máximo del eje vertical como una distancia recorrida. La forma del gráfico se lee bien; lo que falla es qué magnitud representa cada eje.

Refs: 2024-invierno-111/38A, 2024-invierno-111/38B, 2024-invierno-111/38C.

Nota: una sola pregunta.

### 13. figuras-geometricas/confunde-radio-con-diametro-en-el-circulo (3)

Confunde el radio con el diámetro al calcular el perímetro o el área de un círculo: usa el radio en π·d, o usa el diámetro como radio en 2πr o en πr² (π·30² con diámetro 30). La fórmula es la correcta; la medida que entra en ella es la otra. Mismo mecanismo que cuerpos-geometricos/confunde-radio-con-diametro-cilindro, en figuras planas.

Refs: 2024-invierno-111/42B, 2024-invierno-111/42D, 2025-regular-113/57D.

### 14. cuerpos-geometricos/escala-mal-el-volumen-al-cambiar-dimensiones (3)

Escalar mal el volumen cuando cambian las dimensiones: multiplicar el volumen por k o por k² cuando las tres dimensiones se multiplican por k (2·200 o 4·200 en vez de 8·200), o aplicar el aumento a las tres dimensiones cuando el enunciado solo cambia una (3000·1,1³ cuando solo el alto sube un 10 %). Distinto de semejanza-y-proporcionalidad/aplica-k-al-area, que es sobre áreas.

Refs: 2024-invierno-111/44A, 2024-invierno-111/44B, 2027-invierno-111/43C.

### 15. transformaciones-isometricas/mide-mal-el-desplazamiento-en-aristas (3)

Al trasladar una figura una cantidad de aristas, contar mal cuántas unidades del plano son: desplazar media arista, una arista y media o dos aristas cuando el enunciado pide una. El sentido de la traslación está bien; la magnitud, no. Distinto de traslada-en-sentido-contrario.

Refs: 2024-invierno-111/47A, 2024-invierno-111/47C, 2024-invierno-111/47D.

Nota: una sola pregunta.

### 16. enteros-y-racionales/opera-sobre-el-total-en-vez-del-resto (3)

Aplicar la fracción o el reparto al total cuando el enunciado lo aplica al resto: 3/5 del total donde dice "3/5 de lo que faltaba", 2/3 de los 30 alumnos sin descontar a los ausentes, o repartir los 90 entre 8 sin descontar antes lo que uno se quedó. La fracción se opera bien; lo que falla es sobre qué cantidad.

Refs: 2024-regular-113/8A, 2025-regular-113/7D, 2027-invierno-111/3D.

### 17. transformaciones-isometricas/invierte-el-signo-de-una-direccion-cardinal (3)

Al escribir un desplazamiento dado en palabras como par ordenado, invertir el signo de una dirección cardinal o de las dos: 3 al este y 6 al sur como (−3, −6), (−3, 6) o (3, 6) donde va (3, −6). Distinto de calcula-vector-al-reves, donde el vector se calcula entre dos puntos: acá el desplazamiento viene dado en texto.

Refs: 2024-regular-113/53A, 2024-regular-113/53B, 2024-regular-113/53D.

Nota: una sola pregunta.

### 18. cuerpos-geometricos/descuenta-el-grosor-una-sola-vez (3)

Al calcular el interior de un cuerpo con paredes de cierto grosor, descontar el grosor una sola vez en una dimensión, o una sola vez en cada una, cuando afecta a los dos lados (largo − g en vez de largo − 2g). Distinto de descuenta-de-la-dimension-equivocada (grupo menor, 2): acá la dimensión es la correcta y falla cuántas veces se descuenta.

Refs: 2025-regular-113/61A, 2025-regular-113/61B, 2025-regular-113/61C.

Nota: una sola pregunta.

### 19. funcion-cuadratica/ubica-mal-el-simetrico-respecto-de-x-igual-k (3)

Al usar el eje de simetría x = k para hallar el simétrico de x = a, ubicarlo mal: restar el eje una sola vez (a − k en vez de 2k − a), cambiarle el signo a esa diferencia, o reflejar respecto del eje Y (x = 0) en vez de respecto de x = k. El eje está bien identificado; lo que falla es cómo se refleja.

Refs: 2026-regular-113/42A, 2026-regular-113/42C, 2026-regular-113/42D.

Nota: una sola pregunta.

## Grupos menores (62: 17 de 2 distractores, 45 de 1), sin id propuesto

Mecanismo (cantidad): refs. Entre paréntesis, cuando aplica, el id existente de otra unidad que describe el mismo mecanismo, o el id propio que estuvo cerca.

### cuerpos-geometricos

- descuenta-de-la-dimension-equivocada (2): 2025-regular-113/59B, 2025-regular-113/59C
- omite-pi-en-el-volumen-del-cilindro (1): 2024-regular-113/47D
- toma-el-area-de-la-cara-como-arista (1): 2026-regular-113/48B
- trata-porcentaje-como-cantidad-fija-en-dimension (1): 2027-invierno-111/43D (porcentaje/trata-porcentaje-como-cantidad-fija)
- usa-la-dimension-equivocada (1): 2024-invierno-111/45D
- usa-perimetro-de-la-base-en-volumen (1): 2027-invierno-111/44C (usa-circunferencia-en-volumen es solo cilindro)

### ecuaciones-e-inecuaciones-primer-grado

- arma-la-operacion-equivocada-al-modelar (2): 2024-regular-113/31B, 2027-invierno-111/32B
- invierte-el-signo-del-recargo-al-modelar (1): 2025-regular-113/31D
- opera-fracciones-sin-amplificar (1): 2024-invierno-111/30B (enteros-y-racionales/suma-denominadores)
- pierde-signo-al-reducir-en-ecuacion (1): 2026-regular-113/33B (expresiones-algebraicas/pierde-signo-al-reducir)
- pone-la-variable-en-el-termino-fijo (1): 2025-regular-113/36B
- reparte-factor-a-un-solo-termino-al-modelar (1): 2025-regular-113/31B (expresiones-algebraicas/reparte-factor-a-un-solo-termino)

### enteros-y-racionales

- aplica-una-vez-lo-que-se-repite (1): 2026-regular-113/25D (porcentaje/aplica-una-vez-cambio-repetido)
- invierte-la-operacion (2): 2026-regular-113/4D, 2027-invierno-111/14D
- lee-mal-tabla-por-tramos (2): 2024-regular-113/9A, 2024-regular-113/9D
- se-queda-en-valor-intermedio (2): 2025-regular-113/7B, 2026-regular-113/25A
- usa-la-parte-como-total (1): 2027-invierno-111/14B

### expresiones-algebraicas

- entrega-una-parte-del-total (2): 2027-invierno-111/36A, 2027-invierno-111/36C
- invierte-el-signo-de-un-factor-al-factorizar (1): 2025-regular-113/24C (funcion-cuadratica/invierte-signo-de-las-raices)
- omite-un-termino-del-modelo (1): 2027-invierno-111/36B

### figuras-geometricas

- aplica-al-radio-la-razon-del-area (1): 2024-regular-113/46A (semejanza-y-proporcionalidad/aplica-k-al-area)
- aplica-la-mitad-dos-veces (1): 2027-invierno-111/42A
- eleva-la-suma-de-radios (1): 2025-regular-113/58A
- invierte-la-razon-entre-areas (1): 2024-regular-113/46B
- multiplica-en-vez-de-dividir-por-la-base-media (2): 2026-regular-113/45A, 2026-regular-113/45C
- omite-el-cuadrado-del-radio-en-area (1): 2025-regular-113/58D (cuerpos-geometricos/omite-cuadrado-del-radio-cilindro)
- saca-factor-sin-su-raiz-en-pitagoras (1): 2024-regular-113/45B (potencias-y-raices/saca-factor-sin-su-raiz)
- suma-en-vez-de-restar-el-area-descontada (1): 2024-invierno-111/43C

### funcion-cuadratica

- confunde-coeficiente-elevado-al-evaluar (1): 2027-invierno-111/39D (expresiones-algebraicas/confunde-coeficiente-elevado)
- divide-por-dos-en-vez-de-sacar-raiz (2): 2027-invierno-111/34A, 2027-invierno-111/34D (potencias-y-raices/divide-por-el-indice-como-raiz)
- evalua-menos-x-cuadrado-como-cuadrado-del-negativo (2): 2024-invierno-111/40D, 2024-regular-113/40D (potencias-y-raices/eleva-negativo-sin-parentesis)
- suma-en-vez-de-restar-al-volver-al-contexto (1): 2026-regular-113/41C

### funcion-lineal-y-afin

- aplica-el-cambio-a-un-solo-termino-del-modelo (1): 2024-regular-113/39B
- cuenta-piezas-compartidas-dos-veces (1): 2024-regular-113/10A
- divide-por-la-tasa-antes-de-quitar-el-valor-inicial (1): 2024-invierno-111/31B (ecuaciones-e-inecuaciones-primer-grado/divide-antes-de-quitar-constante)
- divide-por-la-tasa-en-vez-de-multiplicar (2): 2026-regular-113/40C, 2026-regular-113/40D
- trata-porcentaje-como-cantidad-fija-en-el-modelo (1): 2024-regular-113/39A (porcentaje/trata-porcentaje-como-cantidad-fija)

### porcentaje

- cuenta-mal-los-casos-del-porcentaje (2): 2024-invierno-111/12A, 2027-invierno-111/17C

### potencias-y-raices

- cancela-el-factor-con-su-raiz (1): 2025-regular-113/21B
- conserva-la-raiz-al-multiplicar-radicales-iguales (1): 2027-invierno-111/7C
- corre-una-posicion-el-exponente-de-diez (1): 2024-regular-113/19C
- eleva-solo-un-factor-del-producto (1): 2024-regular-113/18B
- invierte-el-orden-al-restar-exponentes (1): 2024-invierno-111/18D
- invierte-el-orden-de-la-resta-al-traducir (1): 2026-regular-113/15D
- lee-disminuye-a-como-disminuye-en (2): 2025-regular-113/23C, 2025-regular-113/23D (porcentaje/confunde-aumento-un-con-aumento-a; el rol del día adicional en 23D es ambiguo)
- multiplica-los-terminos-de-la-descomposicion (1): 2024-regular-113/19A
- omite-el-exponente (1): 2024-invierno-111/3D
- suma-en-vez-de-restar-al-multiplicar-conjugados (1): 2024-regular-113/21C
- trata-crecimiento-exponencial-como-aditivo (2): 2024-invierno-111/20A, 2024-invierno-111/20B

### proporcionalidad

- aplica-modelo-inverso-a-relacion-directa (2): 2024-invierno-111/28A, 2024-regular-113/33D
- corre-la-coma-al-convertir-unidades (1): 2026-regular-113/30B (enteros-y-racionales/corre-la-coma-al-operar-decimales)
- escala-solo-una-parte-sin-recomponer (2): 2024-invierno-111/28B, 2026-regular-113/2C
- reparte-en-partes-iguales-ignorando-la-razon (1): 2024-invierno-111/9D
- responde-otra-magnitud-proporcionalidad (1): 2025-regular-113/29D (potencias-y-raices/responde-otra-magnitud-potencias)
- toma-la-parte-equivocada-de-la-razon (2): 2024-invierno-111/29A, 2024-invierno-111/29D

### semejanza-y-proporcionalidad

- lee-mal-la-equivalencia-de-la-escala (1): 2027-invierno-111/26D

### transformaciones-isometricas

- cuenta-casillas-en-vez-de-desplazamiento (2): 2025-regular-113/62A, 2026-regular-113/52C
- deshace-solo-una-de-las-rotaciones (1): 2024-invierno-111/48D
- entrega-la-distancia-al-eje-en-vez-de-a-la-imagen (1): 2024-regular-113/51B
- intercambia-las-componentes-del-desplazamiento (1): 2025-regular-113/62D (cruza-componentes es para operar vectores)
- suma-los-vectores-que-debia-restar (1): 2024-regular-113/49B
- toma-la-mitad-del-angulo-entre-los-ejes (1): 2025-regular-113/65A
