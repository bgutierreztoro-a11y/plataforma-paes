# Rediseño de ítems con alternativas tipo veredicto

Fecha: 2026-09-11. Fase 2: propuesta, sin edición de `content/`. Insumo: `docs/auditoria-distractores-veredicto.md` (16 CRÍTICO + 13 REVISAR).

Nota (2026-09-13): los ids `error-N` que quedan en este documento son propuestas nunca creadas o un id ya borrado; esa numeración es preexistente a la migración a slugs (`docs/analisis/mapa-migracion-ids.json`) y se conserva como registro. Los ids vivos aparecen ya con su slug.

## Reglas aplicadas

1. Split 2-2, o molde de 4 combinaciones reales (resultado × argumento, como `cierre-cuadratica-5`).
2. Cada distractor corresponde a un error de cálculo o de concepto real y verificable. Sin condiciones decorativas.
3. Ninguna sobregeneralización repetida dentro del mismo ítem.
4. Ningún distractor de relleno reciclado entre lecciones del mismo módulo.
5. Todo distractor nuevo mapea a un `errorCatalogado` existente en `content/errores/<módulo>.json`. Si no existe, se propone un id nuevo (no se asigna) y el ítem queda BLOQUEADO hasta aprobación.

Convenciones: ✔ marca la correcta. Los ids de error se escriben con módulo por claridad; en el JSON van sin prefijo (`error-N`). El feedback de cada alternativa se redacta en la fase de escritura, no aquí.

## Tres moldes usados

- **2-2**: dos alternativas del lado "Sí" y dos del lado "No", con la correcta en cualquiera de los dos lados.
- **Resultado × argumento**: cuatro combinaciones de (resultado bien/mal, argumento bien/mal), sin prefijo Sí/No.
- **Numérico con razón** (variante del anterior, requiere aprobación, decisión 1): cada alternativa es un valor + la razón que lo produce, y el valor del estudiante es una de ellas. Elegirlo equivale a decir "Sí". Se usa cuando el ítem tiene un número concreto y no existen dos errores distintos que lleven a ese mismo número (sin coincidencia no hay segundo "Sí" honesto).

## Hallazgo transversal

En 12 de los 29 ítems el estudiante del enunciado comete UN error catalogado y afirma UN número. Para tener dos "Sí" con errores distintos hace falta que dos errores distintos produzcan el mismo número. Eso ocurre solo por coincidencia numérica; cuando no ocurre, las opciones son: (a) cambiar los números del enunciado para forzar la coincidencia (propuesto en 3 ítems, marcados "cambia enunciado"), (b) usar el molde numérico con razón, o (c) aceptar 1-3 (descartado por regla 1).

## Ids propuestos: ver tabla consolidada al final

Esta sección listaba un borrador parcial de ids nuevos; quedó superada por las decisiones D1-D9 (usuario, 2026-09-11) y por la resolución por defecto de los lotes 5-10. El listado único y final está en **"Tabla consolidada de errorCatalogado propuestos"**, al cierre de este documento — es la tabla que espera aprobación, no esta.

Nota que se mantiene: la lección 3 de cuadrática (discriminante) y las lecciones 1 y 2 de sistemas no tienen ningún error conceptual catalogado; sus ítems actuales llevan distractores sin `errorCatalogado`. Es un vacío del catálogo, no de este rediseño.

---

## Lote 1: enteros-racionales (3 ítems, todos CRÍTICO)

### 1.1 `lecciones/enteros-operar-y-ordenar.json` · itemsPAES[2] `l1-item-3`

Enunciado (sin cambio): "Restar siempre achica el número, así que (−8) − (−20) tiene que dar un resultado menor que −8." ¿Es correcta?

Actuales (3 Sí / 1 No):
- A Sí, porque restar un número siempre reduce el resultado, sin excepciones. [pierde-signo-al-restar-negativo]
- B ✔ No: (−8) − (−20) = 12, que es mayor que −8, porque restar un negativo equivale a sumar su opuesto.
- C Sí, porque −20 es menor que −8, y restar un número menor siempre da un resultado menor. [invierte-orden-de-la-diferencia]
- D Sí, porque hay que tratar las profundidades como distancias: sumando 8 y 20 se obtiene 28, un número mayor, que en profundidad significa 'más chico'. [trata-negativo-como-distancia]

Propuestas (2-2):
- A ✔ No: (−8) − (−20) = −8 + 20 = 12, y 12 es mayor que −8. Restar un negativo equivale a sumar su opuesto.
- B Sí: (−8) − (−20) = −8 − 20 = −28, y −28 es menor que −8. [enteros-y-racionales/pierde-signo-al-restar-negativo: trata a − (−b) como a − b]
- C Sí: tomando las profundidades como distancias, 8 − 20 = −12, y −12 es menor que −8. [enteros-y-racionales/trata-negativo-como-distancia: pierde el signo y opera con magnitudes]
- D No: el resultado es −28, pero −28 no es menor que −8, porque entre negativos el de mayor valor absoluto es el mayor. [enteros-y-racionales/compara-negativos-como-positivos: ordena negativos como positivos]

Nota: D lleva −28 (que sale de pierde-signo-al-restar-negativo) porque toda ruta de cálculo errada da un número negativo; el único positivo es la respuesta correcta, así que un "No" errado tiene que fallar en el orden, no en la resta. Se marca como distractor de dos pasos; el error que decide el veredicto es compara-negativos-como-positivos.

### 1.2 `lecciones/enteros-problemas-en-contexto.json` · itemsPAES[2] `l3-item-2`

Enunciado (sin cambio): "Como 5,4 es mayor que 2,9, entonces −5,4 °C es una temperatura mayor que −2,9 °C." ¿Es correcta?

Actuales (3 Sí / 1 No):
- A Sí, porque el número 'sin signo' más grande es siempre el mayor, tenga o no signo negativo. [compara-negativos-como-positivos]
- B ✔ No: −5,4 °C es menor que −2,9 °C, porque en la recta numérica −5,4 está más a la izquierda (más lejos de 0 hacia los negativos) que −2,9.
- C Sí, porque −5,4 representa una temperatura más baja, y 'más baja' siempre significa 'matemáticamente mayor'. [compara-negativos-como-positivos]
- D Sí, porque en un termómetro, mientras más lejos esté la aguja del cero, mayor es el número que marca, sin importar hacia qué lado apunte. [compara-negativos-como-positivos]

Propuestas (2-2):
- A ✔ No: −5,4 está más a la izquierda que −2,9 en la recta numérica, así que −5,4 < −2,9.
- B Sí: entre dos negativos, el de mayor valor absoluto es el mayor, igual que con los positivos. [enteros-y-racionales/compara-negativos-como-positivos]
- C Sí: la diferencia −2,9 − (−5,4) = 2,5 es positiva, y una diferencia positiva confirma que el segundo, −5,4, es el mayor. [enteros-y-racionales/invierte-orden-de-la-diferencia: lee al revés qué se resta de qué]
- D No: −5,4 − (−2,9) = −5,4 − 2,9 = −8,3, y un resultado negativo indica que −5,4 es el menor. [enteros-y-racionales/pierde-signo-al-restar-negativo: veredicto correcto por un cálculo errado (el correcto es −2,5)]

### 1.3 `cierres/cierre-enteros-racionales.json` · items[5] `cierre-enteros-6`

Enunciado (sin cambio): "Como 0,6 es menor que 3,8, entonces −0,6 °C es una temperatura menor que −3,8 °C." ¿Es correcta?

Actuales (3 Sí / 1 No):
- A ✔ No es correcta: −0,6 °C es MAYOR que −3,8 °C, porque en la recta numérica −0,6 está más cerca de 0.
- B Sí es correcta, porque el número con menor valor absoluto siempre es el menor, tenga o no signo negativo. [compara-negativos-como-positivos]
- C Sí es correcta, porque −0,6 representa una temperatura más alta, y 'más alta' siempre significa 'matemáticamente menor'. [compara-negativos-como-positivos]
- D Sí es correcta, porque en la recta numérica los números negativos se ordenan igual que los positivos: mientras más chico el número sin signo, más a la izquierda queda. [compara-negativos-como-positivos]

Propuestas (2-2):
- A ✔ No: −0,6 está más cerca de 0 que −3,8, así que −0,6 > −3,8.
- B Sí: los negativos se ordenan igual que los positivos; como 0,6 < 3,8, también −0,6 < −3,8. [enteros-y-racionales/compara-negativos-como-positivos]
- C Sí: −0,6 − (−3,8) = 3,2 es positivo, así que desde −0,6 hay que "subir" 3,2 para llegar a −3,8: −3,8 es el mayor. [enteros-y-racionales/invierte-orden-de-la-diferencia]
- D No: −3,8 − (−0,6) = −3,8 − 0,6 = −4,4, y ese resultado negativo confirma que −3,8 es la menor. [enteros-y-racionales/pierde-signo-al-restar-negativo: veredicto correcto, cálculo errado (el correcto es −3,2)]

Nota: 1.2 y 1.3 comparten estructura (compara-negativos-como-positivos / invierte-orden-de-la-diferencia / pierde-signo-al-restar-negativo) porque el catálogo de enteros tiene solo tres errores aplicables a comparar dos negativos. **D2 aplicada: rechazada.** Se mantiene el paralelo con 1.2 tal como estaba, sin romperlo.

---

## Lote 2: cuerpos-geometricos (3 ítems, todos CRÍTICO)

### 2.1 `lecciones/cuerpos-cuanto-cabe-adentro.json` · itemsPAES[2] `l2-item-3`

Enunciado (sin cambio): acuario cúbico de 11 dm de arista, el estudiante calcula 11 × 3 = 33 y responde 33 litros. ¿Es correcto?

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: multiplicó la arista por 3. El volumen de un cubo es la arista multiplicada por sí misma tres veces: 11 × 11 × 11 = 1331 litros.
- B Sí es correcto: 33 litros. [triplica-arista-como-volumen]
- C No es correcto: es 11 × 11 = 121 litros, la arista al cuadrado. [entrega-area-base-como-volumen]
- D No es correcto: es 6 × 11² = 726 litros. [sin err]

Propuestas (2-2, coincidencia numérica real: 11 × 3 = 11 + 11 + 11 = 33):
- A ✔ No: el volumen es 11 × 11 × 11 = 1.331 dm³ = 1.331 litros.
- B Sí: un cubo tiene tres dimensiones iguales, así que el volumen es la arista por 3: 11 × 3 = 33. [cuerpos-geometricos/triplica-arista-como-volumen]
- C Sí: el volumen se obtiene sumando las tres dimensiones, 11 + 11 + 11 = 33, que coincide con lo que calculó. [cuerpos-geometricos/suma-dimensiones-como-volumen]
- D No: es 11 × 11 = 121 litros, el área de la base. [cuerpos-geometricos/entrega-area-base-como-volumen]

### 2.2 `lecciones/cuerpos-desarmar-la-caja.json` · itemsPAES[2] `l1-item-3`

Enunciado actual: farol cúbico de 10 cm de arista, el estudiante calcula 4 × 10² = 400 cm². ¿Es correcto?

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: contó solo las cuatro caras de los lados. El cubo tiene seis caras iguales, así que la superficie es 6 × 10² = 600 cm².
- B Sí es correcto: 400 cm² es la superficie del cubo. [omite-tapa-y-base]
- C No es correcto: la superficie real es 300 cm², porque el cubo tiene tres pares de caras y basta sumar una de cada par. [cuenta-solo-caras-visibles]
- D No es correcto: la superficie real es 1000 cm², porque hay que elevar la arista al cubo. [sin err]

Con arista 10 no hay ningún segundo error que produzca 400 (cuenta-solo-caras-visibles da 300, confunde-superficie-con-volumen da 1.000, suma-aristas-como-superficie da 60). Con arista 4 sí: 4 × 4² = 64 = 4³.

Propuesta (2-2, CAMBIA ENUNCIADO): "Para forrar con papel una cajita cúbica de 4 cm de arista, un estudiante calcula 4 × 4² y obtiene 64 cm². ¿Es correcto este cálculo?"
- A ✔ No: el cubo tiene seis caras de 16 cm²: 6 × 16 = 96 cm².
- B Sí: el papel cubre las cuatro caras de los costados, 4 × 16 = 64 cm². [cuerpos-geometricos/omite-tapa-y-base]
- C Sí: como el papel cubre el cubo completo, se eleva la arista al cubo: 4³ = 64 cm². [cuerpos-geometricos/confunde-superficie-con-volumen: volumen donde se pide superficie]
- D No: son 48 cm², una cara de cada par: 3 × 16. [cuerpos-geometricos/cuenta-solo-caras-visibles]

**D3 aplicada: aprobado, se usa la cajita de 4 cm.** El objeto pasa de "farol" a "cajita" porque un farol de 4 cm no es creíble.

**PARADA — colisión de contexto pendiente.** Por la regla dura de `CLAUDE.md` ("Aislamiento de fuentes externas"), este hilo no ejecuta `consultar-fuentes.mjs` ni lee `fuentes-analisis-aisladas/` por ningún medio propio. Antes de escribir este ítem en `content/`, correr fuera de esta sesión:

```
node scripts/consultar-fuentes.mjs "cajita cúbica" "forrar con papel" "papel de regalo"
```

Pega acá el resultado tal cual lo imprime el script (LIMPIO/COLISIÓN + archivos + subcarpeta), sin reformular. Hasta tener ese resultado, 2.2 queda con el texto propuesto pero no se escribe en `content/`.

### 2.3 `lecciones/cuerpos-problemas-en-contexto.json` · itemsPAES[2] `l3-item-3`

Enunciado actual: cámara de frío de 2,5 m × 2 m × 2 m; el estudiante calcula 10 m³ y luego 10 × 100 = 1.000 litros. ¿Es correcto?

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: 1 m³ son 1.000 litros, no 100. El volumen es 10 m³, así que son 10 × 1.000 = 10.000 litros.
- B Sí es correcto: son 1.000 litros. [convierte-metros-cubicos-por-cien]
- C No es correcto: son 10 litros, porque 10 m³ ya está en litros. [sin err]
- D No es correcto: primero hay que calcular la superficie de la cámara, que es 28 m². [confunde-superficie-con-volumen]

Con 2,5 × 2 × 2 no hay segundo error que dé 1.000. Buscando dimensiones donde suma-dimensiones-como-volumen (sumar) con conversión correcta coincida con convierte-metros-cubicos-por-cien (×100) sobre el volumen correcto: a + b + c = abc / 10, por ejemplo 9 × 5 × 4 (suma 18, producto 180).

Propuesta (2-2, CAMBIA ENUNCIADO): "Una cámara de frío con forma de caja mide 9 m de largo, 5 m de ancho y 4 m de alto. Para saber cuántos litros de aire contiene, un estudiante calcula 9 × 5 × 4 = 180 y luego 180 × 100 = 18.000, y responde 18.000 litros. ¿Es correcto?"
- A ✔ No: el volumen es 180 m³ y 1 m³ = 1.000 litros: 180.000 litros.
- B Sí: 1 m³ son 100 litros, así que 180 × 100 = 18.000. [cuerpos-geometricos/convierte-metros-cubicos-por-cien]
- C Sí: el volumen es 9 + 5 + 4 = 18 m³, y 18 × 1.000 = 18.000 litros: coincide. [cuerpos-geometricos/suma-dimensiones-como-volumen]
- D No: el volumen es 9 × 5 = 45 m³, así que son 45.000 litros. [cuerpos-geometricos/entrega-area-base-como-volumen: solo la base]

Nota: la coincidencia 18.000 es el punto del ítem: dos rutas erradas llegan al mismo número. **D4 aplicada: aprobado, se usa la cámara 9 × 5 × 4 m.**

---

## Lote 3: figuras-geometricas (4 ítems, todos CRÍTICO)

### 3.1 `lecciones/figuras-borde-y-superficie.json` · itemsPAES[2] `l2-item-3`

Enunciado (sin cambio): ollao circular de 8 cm de radio; el estudiante calcula 2 × 3,14 × 8 = 50,24 cm² como área. ¿Es correcto?

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: usó la fórmula de la circunferencia (2 × π × radio, que mide el borde) en vez de la del área (π × radio², que mide la superficie). El área real es 3,14 × 8² = 200,96 cm².
- B Sí es correcto: 50,24 cm² es el área del ollao. [confunde-circunferencia-con-area]
- C No es correcto: el área real es 25,12 cm², porque el área se calcula como π × radio, sin elevar el radio al cuadrado. [sin err]
- D No es correcto: el área real es 8 cm², el mismo radio dado en el enunciado. [sin err]

Propuestas (2-2, coincidencia real: bajo duplica-en-vez-de-elevar-al-cuadrado, "8²" = 2 × 8 = 16, y 3,14 × 16 = 50,24):
- A ✔ No: el área es π × 8² = 3,14 × 64 = 200,96 cm². Lo que calculó es la circunferencia, un borde en cm.
- B Sí: 2 × π × radio es la fórmula del círculo, y da 50,24. [figuras-geometricas/confunde-circunferencia-con-area]
- C Sí: π × radio² = 3,14 × 16 = 50,24, porque 8² = 16. [figuras-geometricas/duplica-en-vez-de-elevar-al-cuadrado: calcula a² como 2a]
- D No: el área es π × radio = 3,14 × 8 = 25,12 cm². [BLOQUEADO: figuras-geometricas/error-13 propuesto, espejo de cuerpos-geometricos/omite-cuadrado-del-radio-cilindro]

**D5 aplicada: aprobado.** Se crea `figuras-geometricas/error-13` (espejo de `cuerpos-geometricos/omite-cuadrado-del-radio-cilindro`). La alternativa sin id nuevo ("No: el área es 8² = 64 cm²; el π es solo para el borde") mapearía a usa-circunferencia-en-volumen, ya usado en B, y no cumple regla 3.

### 3.2 `lecciones/figuras-problemas-con-forma.json` · itemsPAES[2] `l3-item-3`

Enunciado (sin cambio): muro 42 × 4, techo con cumbrera 75 a cada lado (altura del techo 72); el estudiante suma perímetros: 92 + 192 = 284 m.

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: sumó el perímetro de cada pieza por separado, contando el ancho del invernadero (42 m) dos veces —una como techo del muro, otra como base del techo—, cuando ese borde es interior. El marco real es 42 + 2 × 4 + 2 × 75 = 200 m.
- B Sí es correcto: 284 metros es el marco total del invernadero. [cuenta-borde-interior-en-figura-compuesta]
- C No es correcto: el marco real es 194 metros, usando la altura del techo (72 m) en vez de la cumbrera (75 m) para los dos lados inclinados. [usa-altura-como-lado-inclinado]
- D No es correcto: el marco real es 75 metros, la medida de la cumbrera. [sin err]

No existe segundo error que dé 284: cuenta-borde-interior-en-figura-compuesta suma exactamente el ancho (42) al perímetro real y ningún otro error del catálogo suma esa cantidad; cambiar números no ayuda porque la relación es estructural. Se propone el molde resultado × método con dos ejes reales: ¿el borde de unión se cuenta una vez o dos? ¿los lados inclinados miden 75 (cumbrera) o 72 (altura)?

Propuestas (4 combinaciones, sin prefijo Sí/No; enunciado termina en "¿Cuánto mide realmente el marco y dónde falla o acierta el cálculo?"):
- A ✔ 200 m: el borde de unión se cuenta una vez y los lados inclinados miden 75 m. El estudiante contó el ancho dos veces.
- B 284 m: el cálculo es correcto, cada pieza aporta su perímetro completo. [figuras-geometricas/cuenta-borde-interior-en-figura-compuesta]
- C 194 m: el borde de unión se cuenta una vez, pero los lados inclinados miden 72 m, la altura del techo. [figuras-geometricas/usa-altura-como-lado-inclinado]
- D 278 m: sumar los dos perímetros es correcto, pero los lados inclinados miden 72 m: 92 + (42 + 2 × 72). [figuras-geometricas/cuenta-borde-interior-en-figura-compuesta + usa-altura-como-lado-inclinado encadenados]

Nota: D es la única alternativa con dos errores en este lote; es la cuarta celda del molde y es verificable. **D6 aplicada: aprobado.** Se acepta D encadenado (cuenta-borde-interior-en-figura-compuesta + usa-altura-como-lado-inclinado).

### 3.3 `lecciones/figuras-triangulo-no-se-rompe.json` · itemsPAES[2] `l1-item-3`

Enunciado (sin cambio): patio 5 × 11; el estudiante afirma diagonal 13 "porque 5-12-13 y 11 está cerca de 12".

Actuales (1 Sí / 3 No):
- A ✔ No es correcta. 5 y 11 no forman un trío pitagórico. Aplicando el teorema: √(5² + 11²) = √(25 + 121) = √146 ≈ 12,1 m, un valor que no es entero.
- B Sí es correcta: como 5, 12, 13 es un trío conocido y 11 está a un paso de 12, la diagonal es 13 m. [asume-trio-pitagorico]
- C No es correcta: la diagonal mide 5 + 11 = 16 metros. [suma-lados-en-vez-de-cuadrados]
- D No es correcta: la diagonal mide 5² + 11² = 146 metros. [omite-raiz-final-pitagoras]

Ningún otro error del catálogo produce 13 con catetos 5 y 11, y no hay pareja de catetos "cercana a un trío" donde otro error caiga en la hipotenusa del trío. Molde numérico con razón.

Propuestas (numérico; enunciado termina en "¿Cuánto mide la diagonal?"):
- A ✔ √146 ≈ 12,1 m: 5² + 11² = 146, que no es un cuadrado perfecto; la diagonal no tiene por qué ser entera.
- B 13 m: 5-12-13 es un trío pitagórico y 11 está a un paso de 12. [figuras-geometricas/asume-trio-pitagorico]
- C 16 m: la diagonal es la suma de los lados, 5 + 11. [figuras-geometricas/suma-lados-en-vez-de-cuadrados]
- D 146 m: 5² + 11² = 25 + 121. [figuras-geometricas/omite-raiz-final-pitagoras]

Cambio mínimo: se quitan los prefijos y se reordena para que el valor del estudiante no quede primero. **D1 aplicada: molde numérico.**

### 3.4 `cierres/cierre-figuras-geometricas.json` · items[2] `cierre-figuras-3`

Enunciado (sin cambio): diagonal 53, lado 28; el estudiante propone √(53² + 28²).

Actuales (1 Sí / 3 No):
- A ✔ No es correcto: se suman los cuadrados solo cuando el lado buscado es la hipotenusa. Acá la hipotenusa (53 m) ya se conoce y falta un cateto, así que hay que restar: √(53² − 28²) = √(2.809 − 784) = √2.025 = 45 m.
- B Sí es correcto: el teorema de Pitágoras suma los cuadrados de los dos datos conocidos, sea cual sea el lado que falta. [suma-cuadrados-al-buscar-cateto]
- C No es correcto: el otro lado mide 25 metros, porque basta restar 53 − 28. [suma-lados-en-vez-de-cuadrados]
- D No es correcto: el otro lado mide 2.025 metros, que es 53² − 28². [omite-raiz-final-pitagoras]

Mismo caso que 3.3: solo suma-cuadrados-al-buscar-cateto lleva al método del estudiante. Molde numérico.

Propuestas (numérico; enunciado termina en "¿Cuánto mide el otro lado?"):
- A ✔ 45 m: la diagonal es la hipotenusa, así que se resta: √(53² − 28²) = √2.025.
- B ≈ 59,9 m: √(53² + 28²) = √3.593, el método del estudiante. [figuras-geometricas/suma-cuadrados-al-buscar-cateto]
- C 25 m: 53 − 28, restando los lados directamente. [figuras-geometricas/suma-lados-en-vez-de-cuadrados]
- D 2.025 m: 53² − 28², sin sacar la raíz. [figuras-geometricas/omite-raiz-final-pitagoras]

Nota: B ahora lleva el número que produce el método (59,9 m), mayor que la diagonal, lo que deja una pista de verificación real (un cateto no puede superar la hipotenusa). **D1 aplicada: molde numérico.**

---

## Lote 4: ecuaciones-inecuaciones (3 ítems: 2 CRÍTICO, 1 REVISAR)

### 4.1 `lecciones/inecuaciones-resolucion.json` · itemsPAES[2] `inecuaciones-resolucion-item-3` (CRÍTICO)

Enunciado (sin cambio): −3x + 2 > 14; Paso 1: −3x > 12; Paso 2: x > −4. ¿Es correcto?

Actuales (1 Sí / 3 No):
- A ✔ No: al dividir por −3, que es negativo, hay que invertir el sentido. El resultado correcto es x < −4.
- B Sí: los dos pasos aplican la misma operación a ambos lados, así que el desarrollo es válido. [maneja-mal-sentido-desigualdad]
- C No: el error está en el Paso 1, donde debió sumar 2 en vez de restarlo. [sin err]
- D No: al dividir por −3 hay que invertir el sentido y cambiar el signo del resultado, quedando x < 4. [sin err]

Solo maneja-mal-sentido-desigualdad valida x > −4; cualquier otro error produce otro conjunto solución. Molde numérico sobre el conjunto solución.

Propuestas (numérico; enunciado termina en "¿Cuál es la solución correcta?"):
- A ✔ x < −4: el Paso 1 está bien; al dividir por −3 se invierte el sentido.
- B x > −4: los dos pasos aplican la misma operación a ambos lados, el desarrollo del estudiante es válido. [ecuaciones-e-inecuaciones-primer-grado/maneja-mal-sentido-desigualdad]
- C x < −16/3: en el Paso 1 se suma 2, −3x > 16, y después se invierte el sentido. [ecuaciones-e-inecuaciones-primer-grado/invierte-signo-al-transponer]
- D x > 12: de −3x > 12 se pasa a x > 12 sin dividir por el coeficiente. [ecuaciones-e-inecuaciones-primer-grado/omite-dividir-por-coeficiente]

**D7 aplicada.** D usa `ecuaciones-e-inecuaciones-primer-grado/omite-dividir-por-coeficiente` (x > 12, sin dividir por el coeficiente), sin id nuevo. Queda descartada la alternativa "x < 4: se invierte el sentido y también el signo del 12 ÷ 3", que habría requerido un id nuevo.

### 4.2 `lecciones/inecuaciones-problemas.json` · itemsPAES[2] `inecuaciones-problemas-item-3` (REVISAR)

Enunciado (sin cambio): 58 puntos, +6 por desafío, se necesitan al menos 100. Sofía: "con 7 llegamos a 100 justos, pero como piden al menos 100 hay que resolver 8".

Actuales (2 Sí / 2 No):
- A ✔ No: "al menos 100" incluye los 100 exactos, así que 7 desafíos bastan.
- B Sí: "al menos 100" exige pasar de 100, así que se necesitan 8 desafíos. [traduce-mal-desigualdad-verbal]
- C No: su cálculo está mal, porque 58 + 6 · 7 = 94 y no 100. [sin err]
- D Sí, pero por otra razón: cuando el resultado no es exacto siempre hay que redondear hacia arriba. [redondea-contra-el-contexto]

D contradice el enunciado (el resultado es exacto). Ningún otro error catalogado concluye "8": invierte-signo-al-transponer concluye 27 y omite-cantidad-inicial-en-inecuacion concluye 17. Molde numérico sobre la cantidad de desafíos.

Propuestas (numérico; enunciado termina en "¿Cuántos desafíos necesita el equipo?"):
- A ✔ 7: 58 + 6 · 7 = 100, y "al menos 100" incluye los 100 exactos.
- B 8: "al menos 100" exige superar los 100, así que 100 justos no alcanza. [ecuaciones-e-inecuaciones-primer-grado/traduce-mal-desigualdad-verbal]
- C 17: 6n ≥ 100 da n ≥ 16,7, así que 17 desafíos. [ecuaciones-e-inecuaciones-primer-grado/omite-cantidad-inicial-en-inecuacion: omite los 58 iniciales]
- D 27: 6n ≥ 100 + 58 = 158 da n ≥ 26,3, así que 27 desafíos. [ecuaciones-e-inecuaciones-primer-grado/invierte-signo-al-transponer: suma en vez de restar al mover el 58]

Nota: se pierde el "No: su cálculo está mal (94)" actual porque no mapea a ningún error (94 sería usar 6 desafíos). **D1 aplicada: molde numérico.**

### 4.3 `cierres/cierre-ecuaciones-lineales.json` · items[6] `cierre-inecuaciones-4` (CRÍTICO)

Enunciado (sin cambio): "Al multiplicar los dos lados de una desigualdad por un mismo número, el sentido siempre se mantiene, porque se le está haciendo lo mismo a ambos lados." ¿Es correcta?

Actuales (1 Sí / 3 No):
- A ✔ No: si el número es negativo, el sentido se invierte, porque multiplicar por un negativo refleja la recta numérica respecto del 0 e intercambia el orden.
- B Sí: mientras la operación sea idéntica en los dos lados, el sentido se conserva siempre. [maneja-mal-sentido-desigualdad]
- C No: el sentido se invierte cada vez que se multiplica, sea el número positivo o negativo. [maneja-mal-sentido-desigualdad]
- D No: si el número es negativo, el sentido se invierte, porque al multiplicar por un negativo los dos números se hacen más chicos. [sin err]

Propuestas (2-2):
- A ✔ No: si el número es negativo el sentido se invierte. Comprobación: 2 < 6; multiplicado por −1 queda −2 y −6, y −2 > −6.
- B Sí: es la misma regla que en las ecuaciones; lo que se hace a ambos lados conserva la relación. [ecuaciones-e-inecuaciones-primer-grado/maneja-mal-sentido-desigualdad: no invierte con factor negativo]
- C Sí: el sentido se mantiene; lo que cambia con un factor negativo es otro efecto —el borde de la desigualdad, o el tamaño de los números— y no el signo del factor. [BLOQUEADO: `ecuaciones-e-inecuaciones-primer-grado/error-12` propuesto]
- D No: el sentido se invierte cada vez que se multiplica, sea positivo o negativo el factor. [ecuaciones-e-inecuaciones-primer-grado/maneja-mal-sentido-desigualdad: invierte cuando no corresponde]

Nota: B y D comparten id (maneja-mal-sentido-desigualdad cubre las dos direcciones) pero son creencias opuestas, no la misma sobregeneralización. **D8 aplicada: rechazado el mapeo forzado a confunde-borde-abierto-y-cerrado.** Se propone `ecuaciones-e-inecuaciones-primer-grado/error-12` ("atribuir la inversión del sentido a otro efecto distinto del signo del factor: el borde de la desigualdad, o el tamaño de los números"), reocupando el número que había quedado libre en 4.1 tras D7.

---

## Lote 5: funcion-cuadratica (4 ítems: 2 CRÍTICO, 2 REVISAR). El catálogo del módulo solo cubre ecuaciones (5 errores); todo lo conceptual sobre discriminante, vértice y simetría requiere ids nuevos. **D9 aplicada en 5.1** (`funcion-cuadratica/error-11`, aprobado). Los otros tres ítems (5.2, 5.3, 5.4) quedan con ids bloqueados hasta que se apruebe la tabla consolidada del final.

### 5.1 `lecciones/cuadratica-sube-y-baja.json` · itemsPAES[2] `l1-item-3` (REVISAR)

Enunciado (sin cambio): (n − 7)(n + 9) = 0; el estudiante concluye que la única solución es n = 7 "porque aparece primero".

Actuales (2 Sí / 2 No):
- A ✔ No es correcto: el producto de dos factores es cero si CUALQUIERA de los dos lo es, así que también hay que considerar n = −9 como solución matemática.
- B Es correcto: en una multiplicación el primer factor escrito es el que determina la solución, así que solo importa (n − 7). [reporta-una-sola-raiz]
- C No es correcto: la solución correcta es n = 9, porque el factor (n + 9) es el que determina el signo de la respuesta. [invierte-signo-de-las-raices]
- D Es correcto: para que un producto sea cero, ambos factores deben ser cero AL MISMO TIEMPO, y eso ocurre en n = 7. [sin err]

Propuestas (2-2):
- A ✔ No: un producto es cero si cualquiera de los factores lo es. Las soluciones son n = 7 y n = −9.
- B Sí: basta con que un factor sea cero, y n − 7 = 0 ya lo logra; el segundo factor no aporta otra solución. [funcion-cuadratica/reporta-una-sola-raiz: reporta solo una raíz]
- C Sí: el otro factor daría n = 9, pero al comprobar, (9 − 7)(9 + 9) = 36 ≠ 0, así que n = 7 es la única. [funcion-cuadratica/invierte-signo-de-las-raices: lee la raíz de (n + 9) como 9; la comprobación fallida es real]
- D No: hay dos soluciones, n = 7 y n = −9, pero solo vale n = 7, porque una solución negativa no sirve en este problema. [`funcion-cuadratica/error-11`, aprobado D9: descarta una raíz negativa sin que el contexto lo exija; aquí no hay ninguna restricción de signo sobre n]

Nota: C usa invierte-signo-de-las-raices (invierte una raíz y la descarta). **D9 aplicada: aprobado.** Se crea `funcion-cuadratica/error-11` (descartar una raíz negativa sin contexto que lo exija) para D, en vez de repetir invierte-signo-de-las-raices invertido en las dos raíces.

### 5.2 `lecciones/cuadratica-punto-mas-alto.json` · itemsPAES[2] `l2-item-3` (REVISAR)

Enunciado actual: "El vértice de cualquier parábola es siempre su punto más alto, porque el vértice es el punto más destacado de la curva". ¿Es correcta?

Actuales (2 Sí / 2 No):
- A ✔ No es correcta: el vértice es siempre un punto extremo, pero es un máximo solo si a < 0; si a > 0, es un mínimo (el punto más bajo, no el más alto).
- B Es correcta: sin importar el signo de a, el vértice concentra siempre el valor más grande que puede tomar la función. [sin err]
- C No es correcta: en realidad el vértice nunca es ni el punto más alto ni el más bajo, es solo el punto donde la parábola cambia de dirección sin ser un extremo real. [sin err]
- D Es correcta, pero solo cuando b = 0. [sin err]

La afirmación abstracta admite un solo error real ("siempre máximo"). Para tener cuatro combinaciones verificables se propone anclar la afirmación a una función concreta con a > 0, de modo que el vértice sea un mínimo y haya un cálculo que revisar.

Propuesta (resultado × argumento, CAMBIA ENUNCIADO): "Para y = x² − 6x + 5, un estudiante calcula el vértice en (3, −4) y afirma: 'como es el vértice, −4 es el valor máximo de la función'. ¿Qué es correcto?"
- A ✔ El vértice (3, −4) está bien calculado, pero es un mínimo: a = 1 > 0, la parábola abre hacia arriba. Comprobación: y(2) = −3 > −4.
- B El vértice está bien calculado y es un máximo: el vértice siempre es el punto más alto. [BLOQUEADO: funcion-cuadratica/error-9 propuesto, ignora el signo de a]
- C El vértice es un máximo, pero está mal calculado: x = b/(2a) = 3 da y = 9 − 18 + 5 = −4, y con x = −3 sale y = 32, que es el valor máximo. [BLOQUEADO: error-10 propuesto (signo en −b/2a) + error-9 encadenados; verificable, y(−3) = 32]
- D El vértice está mal calculado, es (−3, 32), y ese punto es un mínimo. [BLOQUEADO: error-10 propuesto]

Nota: C encadena dos errores; es la cuarta celda del molde. La función y = x² − 6x + 5 se elige porque tiene vértice entero y ceros enteros (1 y 5), lo que permite comprobar a mano.

**Decisión por defecto aplicada (equivalente a D10):** se acepta el cambio de enunciado. Sobre la afirmación abstracta original no existe un segundo "Sí" real, mismo criterio que D1 (sin coincidencia no hay split honesto), y la regla 1 no admite dejar el ítem en 1-3.

**PARADA — colisión de contexto pendiente**, mismo mecanismo que 2.2:

```
node scripts/consultar-fuentes.mjs "vértice parábola" "y = x² − 6x + 5"
```

### 5.3 `lecciones/cuadratica-donde-toca-el-eje.json` · itemsPAES[2] `l3-item-3` (CRÍTICO)

Enunciado (sin cambio): y = 2x² + 3x + 10, Δ = −71; el estudiante concluye "debo haberme equivocado, una parábola no puede dar negativo aquí".

Actuales (1 Sí / 3 No):
- A ✔ No es correcta: un discriminante negativo es un resultado válido y significa que esa parábola no tiene ceros reales, no que hubo un error de cálculo.
- B Es correcta: el discriminante de una parábola siempre debe ser positivo o cero, así que un valor negativo indica un error en el cálculo. [sin err]
- C No es correcta: el discriminante está mal calculado, el valor correcto es Δ = 71 (positivo). [sin err]
- D No es correcta, pero solo porque el coeficiente c=10 es demasiado grande comparado con a y b. [sin err]

Propuestas (2-2):
- A ✔ No: Δ = 9 − 80 = −71 está bien calculado, y un discriminante negativo significa que la parábola no corta el eje X.
- B Sí: toda parábola corta el eje X en algún punto, así que el discriminante nunca puede ser negativo; hay que revisar el cálculo. [BLOQUEADO: error-6 propuesto]
- C Sí, se equivocó: Δ = 3² + 4 · 2 · 10 = 89, restó donde debía sumar. [BLOQUEADO: error-7 propuesto, signo de 4ac]
- D No, pero por otra razón: Δ negativo no es un error, significa que la parábola toca el eje X en un solo punto sin cruzarlo. [BLOQUEADO: error-8 propuesto, confunde Δ < 0 con Δ = 0]

Nota: los tres distractores son verificables (B con cualquier parábola sin ceros, C recalculando, D con la definición de Δ = 0). Sin ids nuevos este ítem no se puede rediseñar: el catálogo no tiene ningún error sobre discriminante.

### 5.4 `cierres/cierre-funcion-cuadratica.json` · items[7] `cierre-cuadratica-8` (CRÍTICO)

Enunciado (sin cambio): h(x) = −x² + 8x − 12, ceros 2 y 6, vértice (4, 4); ¿el punto medio es coincidencia?

Actuales (1 Sí / 3 No):
- A ✔ No es coincidencia: la parábola es simétrica respecto de la recta vertical que pasa por el vértice, así que el vértice siempre queda exactamente a mitad de camino entre dos ceros reales.
- B Sí es una coincidencia; en general, el vértice no tiene ninguna relación con la posición de los ceros. [sin err]
- C No es coincidencia, pero solo porque a=−1 en este caso; con otros valores de a la relación no se cumpliría. [sin err]
- D No es coincidencia, pero el vértice está exactamente a mitad de camino solo cuando hay una raíz doble (un único cero). [sin err]

Solo existe un "Sí es coincidencia" real. Para llegar a cuatro combinaciones se propone convertir la observación en una predicción verificable sobre una segunda parábola.

Propuesta (2-2 sobre "¿es coincidencia?", CAMBIA ENUNCIADO, se agrega una frase): "...se pregunta si eso es una coincidencia, y prueba con g(x) = −x² + 10x − 21, que tiene ceros en 3 y 7. ¿Qué es correcto?"
- A ✔ No es coincidencia: el eje de simetría pasa por el vértice y por el punto medio de los ceros. En g, el vértice está en x = 5, y la fórmula lo confirma: −10/(2 · (−1)) = 5.
- B Sí es coincidencia: en g la fórmula también da x = 5, pero vértice y ceros se calculan con fórmulas independientes, sin relación entre sí. [BLOQUEADO: error-12 propuesto, desconoce la simetría]
- C No es coincidencia, pero el punto medio se calcula sumando: 3 + 7 = 10, así que el vértice de g está en x = 10. [BLOQUEADO: `funcion-cuadratica/error-13` propuesto: calcula el punto medio de dos ceros sumándolos sin dividir por 2; verificable, g(10) = −21]
- D Sí es coincidencia: para g la fórmula da x = 10/(2 · (−1)) = −5, que no es el punto medio de 3 y 7; en h(x) funcionó de casualidad. [BLOQUEADO: error-10 propuesto, signo en −b/(2a); la conclusión "coincidencia" nace de ese cálculo errado, verificable]

**Decisión por defecto aplicada (equivalente a D11):** se rechaza el mapeo forzado de C a distribuye-sobre-un-solo-termino (ese id es sobre distribuir al expandir binomios, no corresponde) y se propone `funcion-cuadratica/error-13` en su lugar, mismo criterio que D8.

**PARADA — colisión de contexto pendiente** (la frase agregada con g(x)):

```
node scripts/consultar-fuentes.mjs "vértice parábola" "g(x) = −x² + 10x − 21"
```

---

## Lote 6: funcion-lineal-afin (1 ítem, REVISAR)

### 6.1 `lecciones/lineal-pendiente-e-intercepto.json` · itemsPAES[2] `l2-item-3`

Enunciado (sin cambio): "Si dos rectas tienen la misma pendiente, entonces son la misma recta." ¿Es correcta?

Actuales (2 Sí / 2 No):
- A Sí, la pendiente determina completamente la recta. [confunde-pendiente-con-intercepto]
- B ✔ No: pueden tener el mismo m pero distinto n, y ser rectas paralelas diferentes.
- C Sí, siempre que ambas sean funciones afines. [confunde-pendiente-con-intercepto]
- D No, porque dos rectas nunca pueden tener la misma pendiente. [confunde-pendiente-con-intercepto]

Propuestas (2-2):
- A ✔ No: pueden tener el mismo m y distinto n; son rectas paralelas distintas, como y = 2x + 1 e y = 2x + 3.
- B Sí: la pendiente dice cuánto cambia y por cada unidad de x desde el origen, así que dos rectas con la misma m pasan por los mismos puntos. [funcion-lineal-y-afin/omite-coeficiente-de-posicion: asume n = 0, olvida el coeficiente de posición]
- C Sí: si tienen la misma m cortan el eje X en el mismo punto, y con ese punto y la inclinación la recta queda fija. [funcion-lineal-y-afin/lee-intercepto-en-eje-equivocado: confunde el eje X con el eje Y al leer dónde corta; verificable, y = 2x + 1 corta X en −0,5 e y = 2x + 3 en −1,5]
- D No, pero por otra razón: las dos cortan el eje Y en (0, m), y lo que puede diferir es la inclinación, que la da n. [funcion-lineal-y-afin/confunde-pendiente-con-intercepto: intercambia los papeles de m y n]

Nota: el actual mapea A, C y D a confunde-pendiente-con-intercepto aunque ninguna confunde m con n; el rediseño usa confunde-pendiente-con-intercepto solo donde efectivamente se intercambian.

---

## Lote 7: potencias-raices (1 ítem, CRÍTICO)

### 7.1 `lecciones/potencias-multiplicar-corto.json` · pasos[5].bloques[2] (generalizacion "La regla, con números puros")

Enunciado (sin cambio): ¿Cómo se escribe 2³ · 3⁴ como una sola potencia con exponente entero?

Actuales (3 Sí / 1 No):
- a ✔ No se puede: 2 y 3 no son la misma base, así que no hay exponentes que sumar
- b Sí se puede: sumando los exponentes se obtiene 2⁷ [suma-exponentes-con-distinta-base]
- c Sí se puede: multiplicando las bases y sumando los exponentes se obtiene 6⁷ [sin err]
- d Sí se puede: sumando las bases y dejando el exponente mayor se obtiene 5⁴ [sin err]

Propuestas (2-2):
- a ✔ No se puede: 2 y 3 no son la misma base, así que no hay un factor repetido cuyas apariciones contar.
- b Sí se puede: sumando los exponentes, 2⁷. [potencias-y-raices/suma-exponentes-con-distinta-base]
- c Sí se puede: multiplicando las bases y sumando los exponentes, 6⁷. [BLOQUEADO: potencias-y-raices/error-14 propuesto]
- d No se puede, porque 2³ · 3⁴ = 6 · 12 = 72, y 72 no es potencia de ningún número entero. [potencias-y-raices/multiplica-base-por-exponente: lee la potencia como base × exponente; veredicto correcto por un cálculo errado]

Nota: d da el veredicto correcto por una razón errada y verificable (2³ = 8, no 6). **Decisión por defecto aplicada (equivalente a D12):** se mantiene `potencias-y-raices/error-14` bloqueado para c, en vez de forzarlo bajo suma-exponentes-con-distinta-base (que ya lo usa b, lo que rompería la regla 3).

---

## Lote 8: proporcionalidad (4 ítems: 3 REVISAR, 1 CRÍTICO)

En los tres bloques de práctica, a y b (los dos "Sí") ya son errores reales y distintos; solo se reemplaza d, el "No, porque no son redondos" (decide-por-criterio-irrelevante), por un "No" con razón errada distinta en cada lección. El id decide-por-criterio-irrelevante sigue existiendo en el catálogo; simplemente deja de usarse como distractor en estos tres bloques.

### 8.1 `lecciones/proporcionalidad-directa.json` · pasos[6].bloques[2] (practica)

Enunciado (sin cambio): tabla pigmento/base 3→70, 6→115, 9→160. ¿Son directamente proporcionales?

Actuales (2 Sí / 2 No):
- a Sí, porque cuando una sube la otra también sube [trata-afin-como-proporcional]
- b Sí, porque 70 ÷ 3 da la constante de la tabla [verifica-un-solo-par]
- c ✔ No, porque el cociente cambia en cada fila
- d No, porque las cantidades no son números redondos [decide-por-criterio-irrelevante]

Propuestas (2-2; a, b y c sin cambio):
- d No, porque si fueran proporcionales a 6 g le corresponderían 70 + 23,3 = 93,3 mL, y hay 115. [proporcionalidad/suma-constante-en-vez-de-multiplicar: suma la constante una vez en vez de multiplicarla; veredicto correcto, predicción errada (la correcta sería 140)]

### 8.2 `lecciones/proporcionalidad-inversa.json` · pasos[6].bloques[2] (practica)

Enunciado (sin cambio): butacas/hileras 10→44, 15→39, 20→34. ¿Son inversamente proporcionales?

Actuales (2 Sí / 2 No):
- a Sí, porque cada vez que el ancho sube 5, las hileras bajan 5: el cambio es constante [compensa-con-resta]
- b Sí, porque 10 × 44 da la constante del auditorio [verifica-un-solo-par]
- c ✔ No, porque el producto cambia en cada configuración
- d No, porque las divisiones no dan exactas [decide-por-criterio-irrelevante]

Propuestas (2-2; a, b y c sin cambio):
- d No, porque si fueran inversamente proporcionales, al pasar de 10 a 20 butacas las hileras deberían duplicarse de 44 a 88, y bajan a 34. [proporcionalidad/aplica-directa-a-relacion-inversa: aplica el modelo directo a una relación inversa; veredicto correcto, criterio errado (lo esperable sería 22)]

### 8.3 `lecciones/proporcionalidad-reconocer.json` · pasos[6].bloques[2] (practica)

Enunciado (sin cambio): hielo derretido 2 h→166 g, 5 h→349 g, 8 h→532 g. ¿Son proporcionales?

Actuales (2 Sí / 2 No):
- a Sí, porque las dos cantidades suben juntas de forma pareja [trata-afin-como-proporcional]
- b Sí, porque 166 ÷ 2 = 83 es la constante [verifica-un-solo-par]
- c ✔ No, porque ni el cociente ni el producto se repiten en las tres filas
- d No, porque los números no son redondos [decide-por-criterio-irrelevante]

Propuestas (2-2; a, b y c sin cambio):
- d No, porque el cociente cambia (83; 69,8; 66,5), y con eso ya queda descartada. [proporcionalidad/aplica-una-sola-prueba: aplica una sola de las dos pruebas; el veredicto es correcto, pero la conclusión no está justificada sin probar el producto]

Nota: d es el "No" más sutil de los tres, porque el estudiante llegó a la conclusión correcta con la mitad de la prueba. La corrección ✔ (c) dice exactamente lo que falta.

Observación fuera de alcance: b ("Sí, porque X da la constante", verifica-un-solo-par) tiene la misma forma en las tres lecciones. No fue flaggeado en la auditoría y no se toca aquí; se deja anotado.

### 8.4 `cierres/cierre-proporcionalidad.json` · items[6] `cierre-proporcionalidad-7` (CRÍTICO)

Enunciado (sin cambio): 20 butacas por hilera → 45 hileras. "Si se duplican las butacas por hilera (a 40), las hileras también se duplican (a 90)." ¿Tiene razón?

Actuales (1 Sí / 3 No):
- A ✔ No: butacas por hilera y hileras son inversamente proporcionales, así que al duplicar una la otra se reduce a la mitad, no se duplica.
- B Sí: si una cantidad se duplica, la relacionada también se duplica, sin importar el tipo de relación. [aplica-directa-a-relacion-inversa]
- C No tiene razón, pero porque la constante 900 también se duplicaría a 1.800. [lee-constante-inversa-como-unitaria]
- D No tiene razón, porque la constante 900 es la que cambia de una configuración a otra. [confunde-constante-con-valor-de-tabla]

Propuestas (2-2):
- A ✔ No: el producto es constante (20 × 45 = 900), así que con 40 butacas por hilera quedan 900 ÷ 40 = 22,5 hileras, la mitad.
- B Sí: si una cantidad se duplica, la relacionada también, sea cual sea el tipo de relación. [proporcionalidad/aplica-directa-a-relacion-inversa]
- C Sí: la constante es 900 ÷ 20 = 45 hileras por cada 20 butacas, así que 40 butacas dan 90 hileras. [proporcionalidad/lee-constante-inversa-como-unitaria: lee la constante de la inversa como "lo que corresponde a una unidad" y la escala]
- D No: si las butacas por hilera suben 20 (de 20 a 40), las hileras bajan 20: quedan 25. [proporcionalidad/compensa-con-resta: compensa con resta lo que se compensa con división; veredicto correcto, número errado]

---

## Lote 9: porcentaje (1 ítem, REVISAR)

### 9.1 `cierres/cierre-porcentaje.json` · items[6] `cierre-porcentaje-7`

Enunciado (sin cambio): bajó 20% y quedó en $5.600; "para recuperar el original calculo 5.600 × 1,20".

Actuales (2 Sí / 2 No):
- A ✔ No: hay que dividir por 0,80, lo que da $7.000.
- B Sí: subir un 20% deshace exactamente una baja del 20%. [deshace-porcentaje-con-mismo-porcentaje]
- C No: hay que dividir, pero por 1,20. [deshace-porcentaje-con-mismo-porcentaje]
- D Sí, porque un 20% representa la misma cantidad de pesos se aplique sobre el precio original o sobre el rebajado. [trata-porcentaje-como-cantidad-fija]

B y D llegan al mismo número (6.720) por dos errores catalogados distintos, pero la auditoría los marcó como la misma sobregeneralización (D explica por qué alguien cree B). C repite el id de B. Molde numérico, que además abre el ítem a responde-otra-magnitud-porcentaje, hoy no representado.

Propuestas (numérico; enunciado termina en "¿Cuál era el precio original?"):
- A ✔ $7.000: el descuento multiplicó por 0,80, así que se deshace dividiendo: 5.600 ÷ 0,80. Comprobación: 7.000 × 0,80 = 5.600.
- B $6.720: 5.600 × 1,20, subir un 20% deshace la baja del 20%. [porcentaje/deshace-porcentaje-con-mismo-porcentaje]
- C $5.620: al precio rebajado se le devuelven los 20 del porcentaje. [porcentaje/trata-porcentaje-como-cantidad-fija: trata el porcentaje como cantidad fija]
- D $1.120: 5.600 × 0,20, el 20% del precio actual. [porcentaje/responde-otra-magnitud-porcentaje: aplica el p% al valor final cuando se pide el original]

Nota: **D1 aplicada.** Se usa el molde numérico (arriba), porque la alternativa 2-2 dejaría un "No" poco creíble (1.120 como precio original).

---

## Lote 10: sistemas-2x2 (5 ítems: 4 REVISAR, 1 CRÍTICO). El catálogo del módulo cubre solo operatoria (5 errores, sin error-2); nada sobre número de soluciones ni sobre planteo temporal. Cuatro de los cinco ítems quedan BLOQUEADOS hasta aprobar ids.

### 10.1 `lecciones/sistemas-dos-historias.json` · itemsPAES[2] `l1-item-3` (REVISAR)

Enunciado (sin cambio): "Como sé que a + n = 45, ya puedo saber cuántas entradas de adulto y de niño se vendieron, sin necesitar la ecuación del dinero." ¿Es correcta?

Actuales (2 Sí / 2 No):
- A ✔ No: a + n = 45 tiene infinitas parejas de valores posibles (0 y 45, 1 y 44, 2 y 43, y así sucesivamente); se necesita la segunda ecuación para encontrar la única pareja que también cumple con el total recaudado.
- B Sí: a + n = 45 ya determina un único par (a, n), igual que una ecuación con una sola incógnita determina un único valor. [sin err]
- C No es correcta, pero solo porque falta reemplazar el valor de a en la ecuación del dinero después de calcularlo con la primera ecuación; el resto del razonamiento del estudiante es válido. [sin err]
- D Sí, porque el problema ya dice que hay 45 entradas en total, así que esa sola condición determina exactamente cuántas son de adulto y cuántas de niño. [sin err]

Propuestas (2-2):
- A ✔ No: a + n = 45 tiene infinitas parejas (0 y 45, 1 y 44, ...); la ecuación del dinero es la que elige una sola.
- B Sí: una ecuación determina un valor por incógnita, igual que con una sola incógnita. [BLOQUEADO: sistemas-2x2/error-7 propuesto]
- C Sí: despejando n = 45 − a y reemplazando en a + n = 45 queda 45 = 45, lo que confirma que el sistema ya está resuelto. [BLOQUEADO: sistemas-2x2/error-8 propuesto, lee la identidad como "resuelto"; verificable]
- D No, pero por otra razón: la ecuación correcta es a + n = 252.000, el total recaudado, y con esa sí se determinan a y n. [sistemas-2x2/iguala-con-total-equivocado: iguala con el total equivocado; veredicto correcto, planteo errado]

### 10.2 `lecciones/sistemas-plantear-antes-resolver.json` · itemsPAES[2] `l3-item-3` (REVISAR)

Enunciado (sin cambio): "puedo usar las edades actuales directamente, porque al resolver el sistema los números se van a ajustar solos". ¿Es correcta?

Actuales (2 Sí / 2 No):
- A ✔ No: hay que restar o sumar n a cada edad ANTES de plantear la ecuación de esa condición; resolver el sistema no corrige un planteamiento que ya representa una condición distinta a la del enunciado.
- B Sí, porque el método de sustitución ya considera automáticamente cualquier desplazamiento en el tiempo que tenga el problema. [sin err]
- C Sí, porque las edades actuales y las de hace n años difieren en una constante que no afecta el resultado final del sistema. [sin err]
- D No es correcta, pero solo para problemas con 'dentro de n años', no para problemas con 'hace n años'. [sin err]

Propuestas (2-2):
- A ✔ No: hay que sumar o restar n a cada edad antes de plantear esa ecuación; el sistema resuelve lo que se planteó, no lo que decía el enunciado.
- B Sí: la sustitución resuelve el sistema con lo que hay, y el desplazamiento en el tiempo queda considerado al resolver. [BLOQUEADO: sistemas-2x2/error-9 propuesto, omite el desplazamiento temporal]
- C Sí: al plantear S − 2 = 3(M − 2) y distribuir queda S − 2 = 3M − 2, y el −2 se cancela a ambos lados, así que da lo mismo que usar S = 3M con las edades actuales. [sistemas-2x2/distribuye-sobre-parte-de-expresion: distribuye solo sobre un término; verificable, 3(M − 2) = 3M − 6]
- D No, pero el ajuste va al revés: "hace n años" se traduce sumando n a cada edad. [BLOQUEADO: sistemas-2x2/error-10 propuesto, signo del desplazamiento]

### 10.3 `lecciones/sistemas-rectas-no-se-cruzan.json` · itemsPAES[2] `l2-item-3` (REVISAR)

Enunciado (sin cambio): "Si dos ecuaciones lineales tienen el mismo coeficiente para la incógnita, el sistema siempre tiene infinitas soluciones." ¿Es correcta?

Actuales (1 Sí / 2 No / 1 Depende):
- A ✔ No: depende también de los términos independientes. Si además coinciden, hay infinitas soluciones (rectas coincidentes); si no coinciden, no hay solución (rectas paralelas).
- B Sí, siempre, porque al restar las dos ecuaciones la incógnita desaparece por completo. [sin err]
- C No, en ese caso el sistema nunca tiene solución. [sin err]
- D Depende de si las ecuaciones están escritas en la misma unidad de medida. [sin err]

Propuestas (2-2):
- A ✔ No: depende de los términos independientes. Si coinciden, infinitas soluciones (misma recta); si no, ninguna (paralelas).
- B Sí: al restar las ecuaciones la incógnita desaparece, y cuando desaparece la incógnita cualquier valor sirve. [BLOQUEADO: sistemas-2x2/error-8 propuesto, no distingue 0 = 0 de 0 = k]
- C Sí: mismo coeficiente significa misma pendiente, y dos rectas con la misma pendiente son la misma recta. [BLOQUEADO: `sistemas-2x2/error-13` propuesto, manifestación gráfica: cree que misma pendiente implica misma recta, sin considerar el término independiente]
- D No: al restar 8.000 + 50m = 15.000 + 50m queda 100m = 7.000, así que hay una única solución, m = 70. [sistemas-2x2/pierde-signo-al-eliminar: no distribuye el signo al restar; veredicto correcto por un cálculo errado]

**Decisión por defecto aplicada (equivalente a D14):** se descarta la referencia cruzada a `funcion-lineal-y-afin/omite-coeficiente-de-posicion` y C queda con id propio del módulo, `sistemas-2x2/error-13`, para no abrir una dependencia entre catálogos de módulos distintos sin que el usuario la pida explícitamente (ver `docs/deuda-catalogo-errores-crossfile.md`). **Split aprobado por el usuario:** error-8 queda solo para la lectura de 0 = 0 / 0 = k al eliminar la incógnita (10.1, 10.5); la manifestación gráfica de este ítem pasa a error-13.

### 10.4 `cierres/cierre-sistemas-2x2.json` · items[3] `cierre-sistemas-4` (REVISAR)

Enunciado (sin cambio): C parte con 6 km de ventaja a 10 km/h; D desde el inicio a 8 km/h. "D alcanzará a C en algún momento, sin importar que sea más lento." ¿Es correcta?

Actuales (2 Sí / 2 No):
- A ✔ No: igualando 6 + 10t = 8t se obtiene t = −3, un tiempo negativo sin sentido en este problema. Como D es más lento que C y C ya llevaba ventaja, D nunca alcanza a C; la distancia entre ambos aumenta con el tiempo.
- B Sí, porque ambos avanzan a velocidad constante y todo trayecto con velocidad constante termina en un encuentro. [sin err]
- C No se puede saber sin conocer cuánto dura el trayecto. [sin err]
- D Sí, en el kilómetro 16, igual que en el caso de los drones A y B. [sin err]

Propuestas (2-2):
- A ✔ No: 6 + 10t = 8t da t = −3, un tiempo negativo; D es más lento y parte atrás, la distancia crece.
- B Sí: como los dos van a velocidad constante, en algún momento se encuentran; t = −3 solo indica que hay que mirar hacia adelante. [BLOQUEADO: sistemas-2x2/error-11 propuesto, no valida contra el contexto]
- C Sí: 6 + 10t = 8t da 2t = 6, t = 3 horas, en el kilómetro 24. [sistemas-2x2/pierde-signo-al-eliminar: no pasa el signo al reunir los términos en t; verificable, 6 + 30 = 36 ≠ 24]
- D No, pero por otra razón: como los dos parten del mismo lugar la ecuación es 10t = 8t, y solo coinciden en t = 0. [BLOQUEADO: `sistemas-2x2/error-12` propuesto: plantea el sistema sin considerar la ventaja o cabeza de partida de uno de los móviles]

**Decisión por defecto aplicada (equivalente a D15):** se rechaza el mapeo amplio a iguala-con-total-equivocado y la referencia cruzada a `funcion-lineal-y-afin/olvida-valor-inicial`; se propone `sistemas-2x2/error-12`, específico del contexto de dos móviles con ventaja inicial.

### 10.5 `cierres/cierre-sistemas-2x2.json` · items[7] `cierre-sistemas-8` (REVISAR)

Enunciado (sin cambio): entradas (24 adultos) y edades (Sofía 23) "se obtienen con el mismo tipo de razonamiento: plantear dos ecuaciones y sustituir". ¿Es correcta?

Actuales (2 Sí / 2 No):
- A ✔ Sí: en ambos casos hay dos condiciones sobre dos cantidades desconocidas, cada una se traduce a una ecuación, y se sustituye una en la otra. La diferencia es que el problema de las edades exige además ajustar por el desplazamiento temporal ('hace 2 años') antes de comparar.
- B No, porque un problema es sobre dinero y el otro sobre edades, así que los métodos matemáticos son distintos. [sin err]
- C No, porque el problema de las entradas tiene una única solución y el de las edades tiene infinitas soluciones. [sin err]
- D Sí, pero solo porque ambos números (24 y 23) son parecidos; si fueran muy distintos el método no funcionaría igual. [sin err]

Este ítem es una pregunta sobre el método, no sobre matemática; su valor como ítem de cierre es bajo y ninguna alternativa actual mapea a un error. Recomendación: reemplazarlo por un ítem de planteo con números. Si se conserva:

Propuestas (2-2):
- A ✔ Sí: dos condiciones, dos ecuaciones, sustitución en ambos; el de las edades exige además ajustar por "hace 2 años" antes de comparar.
- B Sí, y en las edades el ajuste por "hace 2 años" no hace falta, porque la diferencia de edades se mantiene igual en cualquier momento. [BLOQUEADO: sistemas-2x2/error-9 propuesto; verificable: la diferencia se mantiene, pero la razón entre edades no]
- C No: en las edades basta una ecuación, S = M + 14, que ya entrega la edad de Sofía sin sistema. [BLOQUEADO: sistemas-2x2/error-7 propuesto]
- D No: el sistema de las edades tiene infinitas soluciones, porque las dos ecuaciones describen la misma relación. [BLOQUEADO: sistemas-2x2/error-8 propuesto; verificable resolviendo]

**Decisión por defecto aplicada (equivalente a D16):** se conserva el ítem con las alternativas propuestas (con los ids bloqueados) en vez de reemplazarlo por uno distinto. Reemplazarlo es un cambio de alcance mayor que el criterio por defecto no cubre; la recomendación de reemplazo queda anotada arriba para que el usuario la retome si la prefiere sobre aprobar los tres ids nuevos de este ítem.

---

## Decisiones D1-D9 aplicadas (usuario, 2026-09-11)

| decisión | resolución | efecto |
|---|---|---|
| D1 | Aprobada | Molde numérico con razón, tercer molde válido; usado en 3.3, 3.4, 4.1, 4.2, 5.2 (vía resultado×argumento), 9.1 donde no hay segundo "Sí" honesto. |
| D2 | Rechazada | 1.3 mantiene el paralelo con 1.2 (invierte-valores-del-par / error-2 / distribuye-sobre-parte-de-expresion). |
| D3 | Aprobada | 2.2 usa la cajita de 4 cm. PARADA de colisión pendiente antes de escribir en `content/`. |
| D4 | Aprobada | 2.3 usa la cámara 9 × 5 × 4 m. |
| D5 | Aprobada | Se crea `figuras-geometricas/error-13`. |
| D6 | Aprobada | 3.2 usa D con dos errores encadenados (cuenta-borde-interior-en-figura-compuesta + usa-altura-como-lado-inclinado). |
| D7 | Aplicada | 4.1 usa `ecuaciones-e-inecuaciones-primer-grado/omite-dividir-por-coeficiente` para D, sin id nuevo. |
| D8 | Rechazado el mapeo forzado | 4.3 propone `ecuaciones-e-inecuaciones-primer-grado/error-12` en vez de forzar confunde-borde-abierto-y-cerrado. |
| D9 | Aprobada | Se crea `funcion-cuadratica/error-11`; usado en 5.1. |

## Decisiones por defecto aplicadas en lotes 5-10

Siguiendo la instrucción del usuario, estas decisiones (equivalentes en naturaleza a D1-D9) se resolvieron con el criterio por defecto más conservador —molde numérico o resultado×argumento cuando no hay segundo "Sí" honesto; id nuevo propuesto y bloqueado antes que mapeo forzado a un error que no corresponde— y quedan marcadas para revisión en este batch, no ítem por ítem:

- **5.2** (antes decisión 10): se acepta reescribir el enunciado con y = x² − 6x + 5, con `funcion-cuadratica/error-9` y `error-10` bloqueados. PARADA de colisión pendiente.
- **5.4** (antes decisión 11): se acepta la frase agregada con g(x); C pasa de distribuye-sobre-un-solo-termino forzado a `funcion-cuadratica/error-13` propuesto. PARADA de colisión pendiente.
- **7.1** (antes decisión 12): se mantiene `potencias-y-raices/error-14` bloqueado para c, en vez de forzarlo bajo suma-exponentes-con-distinta-base.
- **9.1** (antes decisión 13): molde numérico, por la misma lógica de D1.
- **10.3** (antes decisión 14): C queda como manifestación de `sistemas-2x2/error-8`, sin referencia cruzada a otro módulo.
- **10.4** (antes decisión 15): D propone `sistemas-2x2/error-12` en vez del mapeo amplio a iguala-con-total-equivocado o la referencia cruzada.
- **10.5** (antes decisión 16): se conserva el ítem con los tres ids bloqueados (error-7, error-8, error-9), en vez de reemplazarlo. La recomendación de reemplazo queda anotada en 10.5 para que el usuario la retome si prefiere esa vía.

## PARADAs de colisión pendientes

Ningún comando de estos se ejecutó desde esta sesión, por la regla dura de `CLAUDE.md`. Comando exacto para correr fuera de la sesión, uno por fila, resultado a pegar tal cual:

| ítem | comando |
|---|---|
| 2.2 | `node scripts/consultar-fuentes.mjs "cajita cúbica" "forrar con papel" "papel de regalo"` |
| 5.2 | `node scripts/consultar-fuentes.mjs "vértice parábola" "y = x² − 6x + 5"` |
| 5.4 | `node scripts/consultar-fuentes.mjs "vértice parábola" "g(x) = −x² + 10x − 21"` |

## Resumen por lote

| lote | módulo | ítems | sin id nuevo | con id nuevo (ya aprobado) | con id nuevo (pendiente) | cambian enunciado | molde numérico | PARADA colisión |
|---|---|---|---|---|---|---|---|---|
| 1 | enteros | 3 | 3 | 0 | 0 | 0 | 0 | 0 |
| 2 | cuerpos | 3 | 3 | 0 | 0 | 2 (2.2, 2.3) | 0 | 1 (2.2) |
| 3 | figuras | 4 | 3 | 1 (3.1) | 0 | 0 | 2 (3.3, 3.4) | 0 |
| 4 | ecuaciones | 3 | 2 | 0 | 1 (4.3) | 0 | 2 (4.1, 4.2) | 0 |
| 5 | cuadrática | 4 | 0 | 1 (5.1) | 3 (5.2, 5.3, 5.4) | 2 (5.2, 5.4) | 0 | 2 (5.2, 5.4) |
| 6 | lineal | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 7 | potencias | 1 | 0 | 0 | 1 (7.1) | 0 | 0 | 0 |
| 8 | proporcionalidad | 4 | 4 | 0 | 0 | 0 | 0 | 0 |
| 9 | porcentaje | 1 | 1 | 0 | 0 | 0 | 1 (9.1) | 0 |
| 10 | sistemas | 5 | 0 | 0 | 5 (todos) | 0 | 0 | 0 |

Total: 29 ítems. 17 sin necesidad de ningún id nuevo (algunos con enunciado modificado o en espera de PARADA de colisión). 12 dependen de al menos un id nuevo. Los 18 ids nuevos propuestos en total (tabla siguiente, incluye el split de sistemas-2x2/error-8 en error-8 + error-13) quedaron **todos aprobados** por el usuario el 2026-09-11; ninguno está aún escrito en `content/errores/` — eso espera aprobación de las descripciones finales y las 3 PARADAs de colisión.

Orden sugerido de escritura una vez aprobada la tabla consolidada: lote 1, lote 8, lote 6 (sin bloqueos ni PARADAs), luego lote 4 (tras aprobar `ecuaciones-e-inecuaciones-primer-grado/error-12`) y lote 3 (tras aprobar `figuras-geometricas/error-13`, ya aprobado), luego lote 2 (tras la PARADA de 2.2), luego lote 9, y al final los lotes 5, 7 y 10 cuando se aprueben sus ids y se resuelvan las PARADAs de 5.2 y 5.4.

## Tabla consolidada de errorCatalogado propuestos

Única tabla vigente de ids nuevos. Reemplaza cualquier listado parcial anterior en este documento. Ningún id está asignado en `content/errores/` todavía: por `feedback-errores-nuevos-catalogo`, Claude Code propone solo el texto; el usuario fija el id definitivo en una PARADA con el JSON exacto antes de que cualquiera de estos entre al catálogo.

### figuras-geometricas

| id propuesto | descripción | ítems que lo necesitan | estado |
|---|---|---|---|
| omite-cuadrado-del-radio-cilindro | Calcular el área del círculo como π × radio, sin elevar al cuadrado (espejo de `cuerpos-geometricos/omite-cuadrado-del-radio-cilindro`). | 3.1 | **Aprobado (D5)** |

### ecuaciones-inecuaciones

| id propuesto | descripción | ítems que lo necesitan | estado |
|---|---|---|---|
| error-12 | Atribuir la inversión del sentido de una desigualdad a un efecto distinto del signo del factor —el borde (≤ vs <), o el tamaño de los números— en vez de a que el factor sea negativo. | 4.3 | Propuesto (D8), pendiente de aprobación final |

### funcion-cuadratica

| id propuesto | descripción | ítems que lo necesitan | estado |
|---|---|---|---|
| error-6 | Leer un discriminante negativo como error de cálculo, creyendo que toda parábola corta el eje X. | 5.3 | Pendiente |
| error-7 | Calcular mal b² − 4ac: sumar 4ac en vez de restarlo, u omitir el factor 4. | 5.3 | Pendiente |
| error-8 | Confundir Δ < 0 (ningún cero real) con Δ = 0 (un cero, la parábola toca el eje). | 5.3 | Pendiente |
| error-9 | Decidir si el vértice es máximo o mínimo sin mirar el signo de a (asumir siempre máximo). | 5.2 | Pendiente |
| error-10 | Error de signo en x = −b/(2a): usar b/(2a). | 5.2, 5.4 | Pendiente |
| error-11 | Descartar una solución de la ecuación por ser negativa cuando no hay contexto que la excluya (inverso de reporta-raiz-fuera-del-contexto). | 5.1 | **Aprobado (D9)** |
| error-12 | Desconocer la simetría de la parábola respecto del eje que pasa por el vértice: tratar vértice y ceros como cálculos sin relación. | 5.4 | Pendiente |
| error-13 | Calcular el punto medio de dos ceros sumándolos sin dividir por 2. | 5.4 | Pendiente |

### potencias-raices

| id propuesto | descripción | ítems que lo necesitan | estado |
|---|---|---|---|
| error-14 | Combinar potencias de bases distintas multiplicando las bases y sumando los exponentes: 2³ · 3⁴ = 6⁷. | 7.1 | Pendiente |

### sistemas-2x2

| id propuesto | descripción | ítems que lo necesitan | estado |
|---|---|---|---|
| error-7 | Creer que una sola ecuación con dos incógnitas determina un valor único para cada una. | 10.1, 10.5 | **Aprobado** |
| error-8 | Interpretar mal lo que queda al eliminar la incógnita: leer 0 = 0 o 0 = k como "resuelto" o "única solución", o confundir cuál de los dos da infinitas soluciones y cuál ninguna. | 10.1, 10.3, 10.5 | **Aprobado** |
| error-9 | Omitir el desplazamiento temporal ("hace n años", "dentro de n años") al plantear la ecuación de esa condición. | 10.2, 10.5 | **Aprobado** |
| error-10 | Aplicar el desplazamiento temporal con el signo invertido, o a una sola de las dos personas. | 10.2 | **Aprobado** |
| error-11 | No validar la solución contra el contexto: aceptar t < 0 como un encuentro real, o asumir que dos móviles a velocidad constante siempre se encuentran. | 10.4 | **Aprobado** |
| error-12 | Plantea el sistema sin considerar la ventaja o cabeza de partida de uno de los móviles (usa solo las velocidades, ignorando el desplazamiento inicial). | 10.4 | **Aprobado** |
| error-13 | Manifestación gráfica de error-8: cree que dos rectas con la misma pendiente son siempre la misma recta, sin considerar el término independiente. | 10.3 | **Aprobado** (split del usuario sobre la propuesta original de error-8) |

Total: 18 ids nuevos propuestos, todos **aprobados por el usuario** (2026-09-11), en 5 módulos. Ninguno está aún en `content/errores/`: entran recién cuando el usuario apruebe las descripciones finales de funcion-cuadratica, potencias-raices, sistemas-2x2 y `ecuaciones-e-inecuaciones-primer-grado/error-12`, y cuando lleguen las 3 PARADAs de colisión pendientes (2.2, 5.2, 5.4).
