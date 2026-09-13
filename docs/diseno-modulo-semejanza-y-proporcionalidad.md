# Diseño del módulo: Semejanza y proporcionalidad de figuras

**Id de tema:** `semejanza-y-proporcionalidad`. Eje: Geometría (módulo #13 de `docs/mapa-modulos-m1.md`). **`moduloId` de los archivos de contenido:** `semejanza-proporcionalidad` (unidad del DAG, `content/diagnostico/dag-m1.json`, sin la "y"), con catálogo canónico en `content/errores/semejanza-proporcionalidad.json`. El id de tema y el `moduloId` difieren, igual que `enteros-y-racionales` / `enteros-racionales`.

**Verificación de colisión: pendiente.** Misma situación que el módulo 12: producción sin PARADA, dominios elegidos por exclusión contra `content/` y los descartados previos, palabras clave al final para que Benja corra `scripts/consultar-fuentes.mjs` fuera de sesión.

Descriptor del temario (`docs/temario-demre-m1-2027.md:107-109`), citado textual:

```
- Aplicar propiedades de semejanza y de proporcionalidad a modelos a escala y otras situaciones de la vida diaria y otras asignaturas.
```

---

## Objetivo del módulo

Que el estudiante reconozca cuándo dos figuras son semejantes (misma forma, otro tamaño: ángulos iguales y lados homólogos proporcionales), calcule y use la razón de semejanza k, sepa que el perímetro escala por k y el área por k², y aplique todo eso a escalas (planos, mapas, maquetas, fotocopias) y a situaciones de medición indirecta (sombras, distancias inaccesibles).

Lo que el módulo aporta de nuevo al eje: en transformaciones isométricas la figura se movía sin cambiar de tamaño; acá cambia de tamaño sin cambiar de forma, y la pregunta pasa a ser cuánto.

## Requisito de diseño registrado

**Los tríos pitagóricos escalados son el hilo del módulo.** 3-4-5 → 6-8-10 → 9-12-15 es el descubrimiento de L1, y cuando un problema tiene hipotenusa se usa un trío escalado (5-12-13, 8-15-17, 7-24-25 y sus múltiplos). Así el estudiante ve la semejanza en números que ya reconoce de `figuras-triangulo-no-se-rompe`, y ninguna hipotenusa arrastra decimales.

## Prerrequisitos reales, ya cubiertos

- `proporcionalidad-directa` (módulo #5): razón constante y regla de tres; la proporción a/b = c/x se despeja como ahí.
- `figuras-triangulo-no-se-rompe` y `figuras-borde-y-superficie` (módulo #10): tríos pitagóricos, perímetro y área.
- `enteros-operar-y-comparar` (módulo #1): fracciones y decimales, para k = 3/2, 2/3, 5/4.

---

## Convenciones del módulo

- k siempre racional limpio: 2, 3, 1/2, 3/2, 2/3, 5/4, 5/3, 2,5. k = imagen ÷ original, en todos los pasos.
- Toda longitud rotulada en la figura; la incógnita se rotula con una letra. Ningún ítem pide comparar longitudes a ojo (regla heredada de figuras y cuerpos).
- Unidades chilenas coherentes: cm, m, km. Escalas realistas: 1:100 para planos de vivienda, 1:50 para planos de detalle, 1:40 para maquetas, 1:25.000 para mapas.
- Lados homólogos: mayor con mayor, menor con menor. Se dice así en cada lección.

---

## Objetivos por lección y progresión conceptual

**1. L1 `semejanza-misma-forma-otro-tamano`, Concepto de semejanza de figuras.**

*Objetivo:* que el estudiante reconozca figuras semejantes, calcule la razón k = lado imagen ÷ lado original, identifique lados homólogos y aplique el criterio de ángulos iguales y lados proporcionales (en triángulos, dos ángulos iguales bastan).

*Concepto clave:* misma forma, otro tamaño: todos los lados se multiplican por la misma razón y los ángulos no cambian.

*Descubrimiento:* tabla de 3-4-5, 6-8-10 y 9-12-15 con las razones 6/3, 8/4, 10/5 y 9/3, 12/4, 15/5: en cada fila la razón se repite. Contra 4-5-6 (sumar 1 a cada lado): 4/3, 5/4, 6/5 distintas. El estudiante concluye que la forma se conserva multiplicando, no sumando.

*Contraste P2 (paso `consolidacion`):* "Mucha gente agranda una figura sumándole lo mismo a cada lado. Falla porque 3-4-5 más 2 es 5-6-7, y ese triángulo ya no es rectángulo: las razones 5/3, 6/4 y 7/5 no coinciden. Lo que funciona es multiplicar todos los lados por la misma razón." Se nombran además invertir k (invierte-razon-de-semejanza) y emparejar lados no homólogos (empareja-lados-no-homologos), con un `pregunta` que lleva esos ids.

*Visual:* `{ tipo: "semejanza", disposicion: "ladoALado" }` con 3-4-5 y 6-8-10 (`descubrimiento`), con 6-8-10 y 9-12-15 (`generalizacion`), y un trapecio con un lado rotulado x en el ítem de representar.

*Pregunta abierta con que cierra, que resuelve L2:* si el lado se duplica, ¿el área también se duplica?

**2. L2 `semejanza-medir-sin-acercarse`, Semejanza aplicada a escalas y modelos.**

*Objetivo:* que el estudiante lea y use una escala 1:n en planos, mapas y maquetas, convierta unidades al pasar del dibujo a la realidad, y sepa que la razón de perímetros es k y la de áreas es k².

*Concepto clave:* 1:n significa que la realidad es n veces el dibujo; las áreas van con n², no con n.

*Descubrimiento:* tabla de cuadrados de lado 2, 4 y 6 (k = 2 y 3 respecto del primero) con sus áreas 4, 16 y 36: el área se multiplica por 4 y por 9. Se escribe k² recién después.

*Contraste P2 (paso `consolidacion`):* "Mucha gente multiplica el área por k. Falla porque el área crece en dos direcciones a la vez: el lado por k y el otro lado también por k. Lo que funciona es k · k." Se nombran además leer 1:50 al revés (usa-escala-al-reves) y no convertir unidades (mezcla-unidades-en-escala), con un `pregunta` que lleva esos ids.

*Visual:* cuadrados lado a lado con k = 2 y k = 3 (`descubrimiento`).

*Pregunta abierta con que cierra, que resuelve L3:* ¿y cuando no hay plano, sino un poste al sol y su sombra?

**3. L3 `semejanza-plano-y-realidad`, Problemas de semejanza en contexto.**

*Objetivo:* que el estudiante resuelva problemas de sombras y alturas, distancias inaccesibles, fotocopias al 150 % y planos de vivienda con área real, armando la proporción con cantidades homólogas y unidades coherentes.

*Concepto clave:* dos triángulos con los mismos ángulos son semejantes aunque uno sea un poste y el otro una persona; la proporción se arma altura con altura y sombra con sombra.

*Descubrimiento:* con la visual anidada (poste, persona, rayo común) se tabulan altura y sombra de la persona (1,6 m y 2 m) y la sombra del poste (7,5 m), y se descubre que altura ÷ sombra vale lo mismo en los dos triángulos (0,8), de donde sale la altura del poste (6 m). Luego se traslada el mismo esquema a la laguna (dos triángulos con vértice común en la orilla).

*Contraste P2 (paso `consolidacion`):* "Mucha gente arma la proporción cruzando la altura de la persona con la sombra del poste. Falla porque esa cuenta compara cosas que no se corresponden: son dos triángulos, y cada lado tiene su homólogo en el otro. Lo que funciona es altura con altura y sombra con sombra, en las mismas unidades." Se nombran además mezclar unidades (mezcla-unidades-en-escala) y leer el 150 % como k = 2,5 (lee-ampliacion-como-aumento).

*Visual:* `{ tipo: "semejanza", disposicion: "anidada" }` en `descubrimiento` y `practica`.

**Un descubrimiento por lección:** L1 fija "multiplicar, no sumar"; L2 fija "el área va con k²"; L3 fija "homólogo con homólogo, en la misma unidad". El cierre integra los tres.

---

## Catálogo de errores (definitivo, `content/errores/semejanza-proporcionalidad.json`, 11 ids)

Casos base: L1, triángulo 3-4-5 con k = 2. L2, plano 1:50 con lado de 4 cm; maqueta 1:40. L3, persona 1,6 m con sombra 2 m, sombra del poste 7,5 m.

| id | Nace en | Mecanismo | Produce sobre el caso base |
|---|---|---|---|
| `escala-sumando` | L1 | Escalar sumando una constante a cada lado en vez de multiplicar por la misma razón. | 3-4-5 + 3 = 6-7-8 en vez de 6-8-10; lado 4 "→ 7". |
| `invierte-razon-de-semejanza` | L1 | Invertir la razón: original ÷ imagen, o aplicar 1/k donde va k. | k "= 1/2"; lado 4 → 2 en vez de 8; poste 9,375 m en vez de 6 m. |
| `empareja-lados-no-homologos` | L1 | Emparejar lados no homólogos, o tomar la imagen de otro lado como la del lado pedido. | Con imagen 6-8-10 y original 3-4-5, "k = 10/3". |
| `asume-semejanza-por-tipo` | L1 | Dar por semejantes dos figuras solo por ser del mismo tipo (dos rectángulos, dos triángulos rectángulos). | "5-12-13 y 8-15-17 son semejantes porque ambos son rectángulos." |
| `aplica-k-al-area` | L2 | Aplicar al área la razón lineal k (o n) una sola vez, en vez de k² (n²). | Cuadrado 4 cm en 1:50: 16 cm² × 50 = 800 cm² = 0,08 m² en vez de 4 m². |
| `aplica-k-cuadrado-a-longitud` | L2 | Aplicar a una longitud (lado, perímetro) el factor k² del área. | Perímetro 16 cm en 1:40: 16 × 1.600 = 25.600 en vez de 640 cm. |
| `usa-escala-al-reves` | L2 | Usar la escala 1:n al revés: dividir el plano por n para obtener la realidad. | 8 cm en 1:40: 0,2 cm en vez de 320 cm. |
| `mezcla-unidades-en-escala` | L2 | No convertir unidades o mezclarlas dentro de la proporción. | 320 "m" en vez de 3,2 m; 150 cm frente a 1,2 m. |
| `cruza-altura-con-sombra-ajena` | L3 | Proporción con cantidades no homólogas: altura de uno con sombra del otro. | h = 1,6 × 2 ÷ 7,5 ≈ 0,43 en vez de 6. |
| `lee-ampliacion-como-aumento` | L3 | Leer "al 150 %" como k = 2,5 (un 150 % más) o como sumar 150. | 10 cm → 25 cm o 160 cm en vez de 15 cm. |
| `descarta-semejanza-por-orientacion` | L1 | Descartar la semejanza por posición u orientación distinta, o exigir la misma orientación. | "No son semejantes porque una está girada." |

**Errores sin id.** Los conceptuales que no producen un resultado reproducible van con feedback artesanal y sin `errorCatalogado`, solo en bloques `seleccion`.

**Descartado antes de nacer:** "despejar mal la proporción a/b = c/x (multiplicar en cruz el par equivocado)". Verificado con `node -e` sobre los casos base: sus dos salidas posibles coinciden siempre con las de `invierte-razon-de-semejanza` (2 × 7,5 ÷ 1,6 = 9,375) y de `cruza-altura-con-sombra-ajena` (1,6 × 2 ÷ 7,5 ≈ 0,43), así que no produce ningún número propio y no puede ser un id (SKILL.md §2a). Por eso el catálogo salta de `cruza-altura-con-sombra-ajena` a `lee-ampliacion-como-aumento`.

---

## Plan de ítems

### L1, `semejanza-misma-forma-otro-tamano`

Dominio: calcomanías triangulares y de otras formas para cuadernos, impresas en tres tamaños (chica, mediana, grande) desde el mismo diseño. Números reservados: 3-4-5 (chica), 6-8-10 (grande, k = 2), 9-12-15 (k = 3), 4,5-6-7,5 (mediana, k = 3/2); 5-12-13 y 10-24-26 (k = 2); 8-15-17 y 12-22,5-25,5 (k = 3/2); 7-24-25 y 10,5-36-37,5 (k = 3/2); 6-8-10 con lado mayor 25 (k = 2,5: 15-20-25).

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `semejanza-l1-item-1` | resolver | baja | lado menor de un triángulo semejante a 9-12-15 cuyo lado mayor mide 25 | 15 | 5,4 `invierte-razon-de-semejanza`; 18,75 `empareja-lados-no-homologos`; 19 `escala-sumando` |
| `semejanza-l1-item-2` | representar | media | trapecio 7-5-4-4 cm y su imagen por 3/2 dibujados, lado rotulado x | 7,5 cm | 3,3 cm `invierte-razon-de-semejanza`; 6 cm `empareja-lados-no-homologos`; 6,5 cm `escala-sumando` |
| `semejanza-l1-item-3` | argumentar | alta | veredicto sobre "5-12-13 y 8-15-17 son semejantes porque ambos son rectángulos" | No: 8/5, 15/12 y 17/13 son distintas | Sí, ángulo recto `asume-semejanza-por-tipo`; Sí, cada lado creció `escala-sumando`; No, por estar girados `descarta-semejanza-por-orientacion` |

### L2, `semejanza-medir-sin-acercarse`

Dominios: (núcleo) maqueta de un molino de viento a escala 1:40 para la exposición de fin de año; (aplicación) mapa de una ruta de trekking en un parque nacional a escala 1:25.000. Números reservados: torre 12 cm → 4,8 m; aspa 8 cm → 3,2 m; puerta 2 m → 5 cm; base 5 cm × 3 cm → 2 m × 1,2 m, perímetro 16 cm → 6,4 m; cuadrados de lado 2, 4, 6 cm (áreas 4, 16, 36); plano 1:50 con lado 4 cm → 2 m, área 4 m²; mapa 6 cm → 1,5 km; 9,6 cm → 2,4 km; 3 km → 12 cm.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `semejanza-l2-item-1` | resolver | baja | 14 cm en un mapa 1:25.000, en km | 3,5 km | 0,00056 km `usa-escala-al-reves`; 0,35 km `mezcla-unidades-en-escala`; 350 km `mezcla-unidades-en-escala` |
| `semejanza-l2-item-2` | modelar | media | área real de la base de una maqueta 1:40 que mide 15 cm × 10 cm | 24 m² | 0,015 m² `usa-escala-al-reves`; 0,6 m² `aplica-k-al-area`; 240.000 m² `mezcla-unidades-en-escala` |
| `semejanza-l2-item-3` | argumentar | alta | qué pasa con el área de cada cara si la maqueta pasa de 1:40 a 1:20 | se multiplica por 4 | por 2 `aplica-k-al-area`; se reduce a la cuarta parte `invierte-razon-de-semejanza`; se reduce a la mitad `usa-escala-al-reves` |

### L3, `semejanza-plano-y-realidad`

Dominios: poste de alumbrado y persona con sus sombras; ancho de una laguna medido con estacas en la orilla; fotocopia al 150 % de un dibujo; plano de vivienda 1:100 y área real de un dormitorio. Números reservados: persona 1,6 m, sombra 2 m, sombra del poste 7,5 m → 6 m; laguna: CD = 8 m, DE = 6 m, CA = 32 m → AB = 24 m; fotocopia 8 cm → 12 cm, 10 cm → 15 cm; dormitorio 3 cm × 4 cm → 12 m²; árbol: persona 150 cm, sombra 1,2 m, sombra del árbol 4,8 m → 6 m.

| ítem | habilidad | dificultad | qué pide | correcta | distractores (id) |
|---|---|---|---|---|---|
| `semejanza-l3-item-1` | resolver | baja | altura de un poste con sombra de 6 m, si una persona de 1,8 m proyecta 2,4 m | 4,5 m | 0,72 m `cruza-altura-con-sombra-ajena`; 5,4 m `escala-sumando`; 8 m `invierte-razon-de-semejanza` |
| `semejanza-l3-item-2` | modelar | media | área real de una sala de 4,5 cm × 6 cm en un plano 1:100 | 27 m² | 0,0027 m² `usa-escala-al-reves`; 2,7 m² `aplica-k-al-area`; 270.000 m² `mezcla-unidades-en-escala` |
| `semejanza-l3-item-3` | argumentar | alta | veredicto sobre "al 150 % el área se multiplica por 1,5" | No: por 2,25 | Sí `aplica-k-al-area`; No, por 2,5 `lee-ampliacion-como-aumento`; No, y el perímetro también por 2,25 `aplica-k-cuadrado-a-longitud` |

### Cierre, `cierre-semejanza-y-proporcionalidad` (8 ítems)

| ítem | habilidad | dificultad | cubre | correcta | distractores (id) |
|---|---|---|---|---|---|
| `cierre-semejanza-1` | resolver | baja | k desde lados: 6-8-10 → 15-20-25 | 2,5 | 0,4 `invierte-razon-de-semejanza`; 2,1 `escala-sumando`; 4,2 `empareja-lados-no-homologos` |
| `cierre-semejanza-2` | resolver | baja | lado faltante: 5-12-13 con lado mayor 39 | 15 | 5,6 `invierte-razon-de-semejanza`; 31 `escala-sumando`; 36 `empareja-lados-no-homologos` |
| `cierre-semejanza-3` | representar | media | factor de área: cuadrados de lado 3 y 9 dibujados | 9 | 3 `aplica-k-al-area`; 1/3 `invierte-razon-de-semejanza`; 27 `aplica-k-cuadrado-a-longitud` |
| `cierre-semejanza-4` | argumentar | media | factor de perímetro con k = 2/3 | se multiplica por 2/3 | por 4/9 `aplica-k-cuadrado-a-longitud`; por 3/2 `invierte-razon-de-semejanza`; se le resta 1/3 a cada lado sin multiplicar `escala-sumando` |
| `cierre-semejanza-5` | modelar | media | distancia real de 18 cm en un mapa 1:25.000 | 4,5 km | 0,00072 km `usa-escala-al-reves`; 0,45 km `mezcla-unidades-en-escala`; 450 km `mezcla-unidades-en-escala` |
| `cierre-semejanza-6` | modelar | media | área real de un living de 5 cm × 7 cm en 1:100 | 35 m² | 0,0035 m² `usa-escala-al-reves`; 3,5 m² `aplica-k-al-area`; 350.000 m² `mezcla-unidades-en-escala` |
| `cierre-semejanza-7` | representar | alta | sombra y altura con la figura anidada dibujada: persona 1,8 m, sombra 2,4 m, sombra del poste 10 m | h = 7,5 m | 1,8 × 2,4 ÷ 10 `cruza-altura-con-sombra-ajena`; 10 − 0,6 `escala-sumando`; 10 × 2,4 ÷ 1,8 `invierte-razon-de-semejanza` |
| `cierre-semejanza-8` | argumentar | alta | qué pares son semejantes: 3-4-5 y 9-12-15; 6-8-10 y 8-10-12; dos rectángulos 2×3 y 4×5 | solo 3-4-5 y 9-12-15 | 6-8-10 y 8-10-12 `escala-sumando`; los rectángulos `asume-semejanza-por-tipo`; ninguno, por orientación `descarta-semejanza-por-orientacion` |

Matriz habilidad × dificultad del cierre: resolver baja ×2 (1, 2); representar media (3), alta (7); modelar media ×2 (5, 6); argumentar media (4), alta (8). Total: 2 baja, 4 media, 2 alta; las cuatro habilidades, dos veces cada una. Cobertura por lección: L1 en 1, 2, 4 y 8; L2 en 3, 5 y 6; L3 en 7.

---

## Lista de prohibidos

- Mecanismos DEMRE liberados que no se replican con sus números: placas cuyo lado se triplica y cantidad de placas por caja. Ningún ítem cuenta cuántas figuras chicas caben en una grande.
- Dominios ya usados en el corpus: patio, cancha, techo/invernadero/galpón, baldosas/losetas, feria de ciencias, refugio de montaña, huerto, río fluvial (barcazas). Por eso la distancia inaccesible es una laguna y no un río, y el mapa es de un parque nacional y no de una montaña.
- k con decimales periódicos; hipotenusas irracionales; cotas sin rotular; comparar longitudes a ojo.
- Dibujar la cota pedida: la incógnita siempre va con letra.

## Palabras clave para `consultar-fuentes.mjs` (las corre Benja)

```
node scripts/consultar-fuentes.mjs "calcomania" "calcomanias" "cuaderno" "imprenta" "maqueta" "molino" "molino de viento" "aspa" "exposicion de fin de ano" "mapa" "trekking" "sendero" "parque nacional" "poste" "poste de alumbrado" "sombra" "laguna" "estacas" "orilla" "fotocopia" "150 %" "plano" "dormitorio" "living" "vivienda"
```

## Estado de las firmas

Firmado por adelantado por Benja (brief de la sesión 2026-09-13): JSON de contenido, extensiones aditivas de schema y commits. Pendiente de Benja: la consulta de colisión con las palabras clave de arriba y las dos auditorías en hilos aislados (`/clear`) antes de cualquier `git push`.
