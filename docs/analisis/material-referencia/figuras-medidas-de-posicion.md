# Figuras de medidas-de-posicion: inventario y convención de cuartiles

Fecha: 2026-09-22. Insumo de la infraestructura de figuras de la Unidad 13 de Advance (`medidas-de-posicion`): qué representaciones usan los problemas de cuartiles, percentiles, diagrama de cajón y comparación de grupos, y con qué convención se calculan los cuartiles.

Método:

- **DEMRE.** Las preguntas de la unidad salen de `docs/analisis/frecuencia-demre-v2.json` (`unidadId` = `medidas-de-posicion`: 6 preguntas) más una de comparación de grupos etiquetada `tablas-y-graficos` (2024 regular, n.º 58). Las páginas se rasterizaron con pypdfium2 (la herramienta de las fases anteriores; `pdftoppm` no está en esta máquina) y se miraron. 2025 y 2026 no traen preguntas de la unidad: se revisó el texto de cada página de los dos PDF. 2027 invierno no tiene PDF, así que sus dos preguntas se leyeron en el `.md` y los rasgos de la figura quedan como no verificables.
- **Material UC.** Para ubicar las páginas se partió de `por-unidad.md` (sección `medidas-de-posicion`, 24 problemas) y de `ap2.json`. Un subagente clean-room revisó los cuatro PDF y rasterizó solo las páginas del tema. Devolvió únicamente rasgos de forma y la regla de cálculo con su página, sin datos, cifras, contextos ni texto. Todo el tema está en el apunte Ap2 (cap. 28, pp. 86-101, y Reforzamiento 4, pp. 139-140), con soluciones en S-Ap2. AP1 y SAP1 no tienen ninguna coincidencia. La página impresa coincide con el índice del PDF.
- Sala limpia: de UC se toman solo formas de figura y tipos de lectura. Ningún dato, cifra, contexto ni texto de UC entra al repo, a la galería ni a los tests.

## Inventario, una fila por problema

Columnas: representación, ubicación (enunciado o alternativas), orientación, cantidad de grupos (cajas en una misma figura), valores (rotulados en la figura o leídos del eje), grilla, atípicos y marca de promedio. Los rasgos de figura van solo cuando hay figura; "—" es no aplica y "¿?" es no verificable.

### DEMRE

| fuente | representación | ubicación | orientación | grupos | valores | grilla | atípicos | promedio |
|---|---|---|---|---|---|---|---|---|
| 2024 invierno, forma 111, n.º 62 (PDF p. 52) | otra: sin figura, criterio en texto | enunciado | — | — | — | — | — | — |
| 2024 regular, forma 113, n.º 58 (PDF p. 48)¹ | tabla de frecuencias (dos, una por grupo) | enunciado | — | 2 | — | — | — | — |
| 2024 regular, forma 113, n.º 60 (PDF p. 50) | otra: sin figura, criterio en texto | enunciado | — | — | — | — | — | — |
| 2024 regular, forma 113, n.º 61 (PDF p. 51) | diagrama de cajón | enunciado | vertical | 5 | leídos del eje | sí | no | no |
| 2024 regular, forma 113, n.º 62 (PDF p. 52) | lista de datos en el texto | enunciado | — | — | — | — | — | — |
| 2027 invierno, forma 111, n.º 61 (`.md` l. 1075-1085)² | diagrama de cajón | enunciado | ¿? | ¿? | rotulados (al menos uno, según el texto) | ¿? | ¿? | ¿? |
| 2027 invierno, forma 111, n.º 62 (`.md` l. 1086-1105)² | lista de datos en el texto + diagrama de cajón (el que construye la estudiante) | enunciado | ¿? | ¿? | ¿? | ¿? | ¿? | ¿? |

¹ Comparación de dos grupos por rango, moda y mediana. En `frecuencia-demre-v2.json` está etiquetada `tablas-y-graficos`, y entra acá por la comparación de grupos.
² Sin PDF. Lo que no afirma el texto no se puede verificar.

Rasgos del único cajón DEMRE visible (2024 regular, n.º 61): eje con etiqueta de unidad, grilla horizontal en cada marca, bigotes con remate, mediana del mismo grosor que el borde, cajas en dos tonos de gris alternados y nombres de grupo bajo cada caja.

### Material UC

| fuente | representación | ubicación | orientación | grupos | valores | grilla | atípicos | promedio |
|---|---|---|---|---|---|---|---|---|
| Ap2 p. 87, ejemplo 28.2 | lista de datos en el texto | enunciado | — | — | — | — | — | — |
| Ap2 p. 88, ejemplo 28.3 | tabla de frecuencias | enunciado | — | — | — | — | — | — |
| Ap2 p. 90, ejemplo 28.4 | diagrama de cajón | enunciado | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 91, ejemplo 1³ (sol. S-Ap2 p. 66) | datos agrupados | enunciado | — | — | — | — | — | — |
| Ap2 p. 91, ejemplo 2³ (sol. S-Ap2 p. 67) | otra: sin figura | enunciado | — | — | — | — | — | — |
| Ap2 p. 92, ejemplo 3³ (sol. S-Ap2 p. 67) | lista de datos en el texto | enunciado | — | — | — | — | — | — |
| Ap2 p. 92, ejemplo 4³ (sol. S-Ap2 p. 68) | diagrama de cajón | enunciado | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 93, ejemplo 5³ (sol. S-Ap2 p. 69) | lista de datos en el texto + diagrama de cajón | enunciado + alternativas | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 94, ej. 1 (sol. S-Ap2 p. 70) | lista de datos en el texto | enunciado | — | — | — | — | — | — |
| Ap2 p. 94, ej. 2 (sol. S-Ap2 p. 70) | otra: grilla de datos sueltos, sin frecuencias | enunciado | — | — | — | — | — | — |
| Ap2 p. 95, ej. 3 (sol. S-Ap2 p. 71) | datos agrupados | enunciado | — | — | — | — | — | — |
| Ap2 p. 95, ej. 4 (sol. S-Ap2 p. 72) | otra: sin figura | enunciado | — | — | — | — | — | — |
| Ap2 p. 96, ej. 5 (sol. S-Ap2 p. 72) | gráfico de barras | enunciado | — | — | — | — | — | — |
| Ap2 p. 96, ej. 6 (sol. S-Ap2 p. 73) | otra: sin figura | enunciado | — | — | — | — | — | — |
| Ap2 p. 97, ej. 7 (sol. S-Ap2 p. 73) | diagrama de cajón | enunciado | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 97, ej. 8 (sol. S-Ap2 p. 74) | diagrama de cajón | enunciado | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 98, ej. 9 (sol. S-Ap2 p. 74) | diagrama de cajón | enunciado | vertical | 2 | ninguno: líneas guía sin números | no | no | no |
| Ap2 p. 98, ej. 10 (sol. S-Ap2 p. 74) | lista de datos en el texto + diagrama de cajón | enunciado + alternativas | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 99, ej. 11 (sol. S-Ap2 p. 75) | diagrama de cajón | enunciado | vertical | 4 | leídos del eje | sí | no | no |
| Ap2 p. 99, ej. 12 (sol. S-Ap2 p. 75) | otra: sin figura | enunciado | — | — | — | — | — | — |
| Ap2 p. 100, ej. 13 (sol. S-Ap2 p. 76) | tabla de frecuencias | enunciado | — | — | — | — | — | — |
| Ap2 p. 100, ej. 14 (sol. S-Ap2 p. 76) | lista de datos en el texto | enunciado | — | — | — | — | — | — |
| Ap2 p. 101, ej. 15 (sol. S-Ap2 p. 77) | tabla de frecuencias + diagrama de cajón | enunciado + alternativas | horizontal | 1 | leídos del eje | no | no | no |
| Ap2 p. 139, Reforzamiento 4 ej. 6 (sol. S-Ap2 p. 107) | gráfico de barras + diagrama de cajón | enunciado + alternativas | horizontal | 1 | rotulados | no | no | no |
| Ap2 p. 140, Reforzamiento 4 ej. 7 (sol. S-Ap2 p. 108) | lista de datos en el texto | enunciado | — | — | — | — | — | — |

³ El apunte rotula cinco ejemplos como DEMRE, sin forma ni número. Pueden repetir preguntas de la tabla DEMRE y se cuentan en UC tal como aparecen.

En los cuatro problemas con cajones en las alternativas, cada alternativa es un cajón horizontal de una caja. En la fila con "+", la primera representación está en el enunciado y el cajón en las alternativas.

## Conteos

Por representación. Un problema con dos representaciones cuenta en las dos.

| representación | DEMRE | UC |
|---|---|---|
| diagrama de cajón | 3 (enunciado 3, alternativas 0) | 10 (enunciado 6, alternativas 4) |
| lista de datos en el texto | 2 | 7 |
| tabla de frecuencias | 1 | 3 |
| datos agrupados | 0 | 2 |
| gráfico de barras | 0 | 2 |
| ojiva | 0 | 0 |
| tallo y hojas | 0 | 0 |
| otra: sin figura | 2 | 4 |
| otra: grilla de datos sueltos | 0 | 1 |
| problemas | 7 | 25 |

Por rasgo, solo en diagramas de cajón. DEMRE tiene 3, pero solo el de 2024 regular n.º 61 es visible; los dos de 2027 cuentan como no verificables.

| rasgo | DEMRE | UC |
|---|---|---|
| horizontal | 0 (2 ¿?) | 8 |
| vertical | 1 | 2 |
| cajas en una misma figura | 5 (una figura) | 1 (8 figuras), 2 (1), 4 (1) |
| valores rotulados en la figura | 1 (2027 n.º 61, por el texto) | 7 |
| valores leídos del eje | 1 | 2 |
| sin valores | 0 | 1 |
| grilla | 1 | 1 |
| atípicos | 0 | 0 |
| marca de promedio | 0 | 0 |
| etiqueta de unidad en el eje | 1 | 5 |
| bigote con remate | 1 | 9, y 1 mixto (alternativas con y sin remate) |
| mediana más gruesa que el borde | 0 | en pp. 90, 97 y 98 (5 cajones); normal en pp. 92, 93, 99, 101 y 139 |
| dos de los cinco valores iguales en una caja | 0 observados | 0 |
| cajones como alternativas | 0 | 4 |

## Qué se construye

Umbral: se construye toda representación que aparezca al menos una vez en DEMRE o al menos tres en UC.

| representación | DEMRE / UC | decisión |
|---|---|---|
| diagrama de cajón | 3 / 10 | Se construye como tipo nuevo `diagrama-cajon`. Además, el temario lo nombra. |
| tabla de frecuencias | 1 / 3 | Pasa el umbral y la cubre `tabla-datos` sin cambios. Las dos tablas por grupo de 2024 regular n.º 58 caben como una tabla de 4 columnas. |
| lista de datos en el texto | 2 / 7 | Pasa el umbral y no es figura: va en el enunciado. |
| cajones como alternativas | 0 / 4 | Pasa el umbral (tres UC): se construye el bloque de alternativas con figura. |
| datos agrupados | 0 / 2 | Bajo el umbral, no se construye. `tabla-datos` ya acepta intervalos como texto. |
| gráfico de barras | 0 / 2 | Bajo el umbral en esta unidad; el tipo ya existe desde tablas-y-graficos. |
| otra: grilla de datos sueltos | 0 / 1 | Bajo el umbral, no se construye. |
| ojiva, tallo y hojas | 0 / 0 | No se construyen. |
| atípicos, marca de promedio | 0 / 0 | No se construyen: 11e los pide solo si el inventario los muestra. |

Rasgos del cajón: horizontal y vertical (los dos aparecen); grilla y etiqueta de unidad opcionales (DEMRE 1 y 1, UC 1 y 5); rótulos opcionales (UC 7 rotulados frente a 3 leídos del eje, incluido DEMRE). El máximo de cajas por figura es 5 (DEMRE) y el tope firmado es 4, así que 2024 regular n.º 61 no cabe tal cual: un ítem basado en él tiene que bajar a 4 grupos. Ninguna fuente muestra q1 igual a la mediana. El caso se construye igual por la decisión firmada 11d.

## Convención de cuartiles y percentiles

### Lo que dice cada fuente (datos no agrupados)

**Lección gratuita** (solo lectura; contrato ejecutable en `lib/estadistica.ts`):

- Cuartiles por mitades: Q2 es la mediana (con n par, el promedio de los dos centrales). Q1 y Q3 son las medianas de la mitad inferior y de la superior, y con n impar la mediana no entra en ninguna mitad. Fuentes: `content/lecciones/posicion-partir-en-cuatro.json` l. 15-16 (conceptos), l. 25 (nota interna) y l. 297 (texto al estudiante); `lib/estadistica.ts` l. 16-17 (cabecera) y l. 210-223 (`cuartiles`).
- Percentil k: posición p = k·n/100. Si p es entero, se promedian los datos de las posiciones p y p + 1; si no, se toma el de la posición ⌈p⌉. Fuentes: `content/lecciones/posicion-caja-que-resume.json` l. 24 (nota) y l. 306 (texto al estudiante); `lib/estadistica.ts` l. 18-19 (cabecera) y l. 244-260 (`percentil`).
- La lección afirma Q1 = P25 y Q3 = P75 (`posicion-caja-que-resume.json` l. 13 y l. 306). Todos sus conjuntos tienen n par (`posicion-partir-en-cuatro.json` l. 25, n = 8, 10, 12, 16, 20; `posicion-caja-que-resume.json` l. 24).

**Material UC:**

- Cuartiles por posición: se ordenan los datos y la posición de Qk es k·n/4. Si la posición es entera, se promedia ese dato con el siguiente; si es decimal, se redondea hacia arriba y se toma ese dato. No hay interpolación ni se distingue n par de impar (Ap2 p. 87). El solucionario repite la regla (S-Ap2 p. 107) y la aplica en S-Ap2 pp. 74 y 108.
- Percentiles: k·n/100 con la misma regla (Ap2 p. 88; S-Ap2 pp. 67 y 76). En una tabla de valores discretos, la posición se busca en la frecuencia acumulada (Ap2 p. 89; S-Ap2 p. 77).
- Excepción: una solución calcula Q1 y Q3 por mitades, sin la mediana (S-Ap2 p. 69). Cae en un caso donde los dos métodos coinciden.
- Datos agrupados: solo se ubica el intervalo por frecuencia acumulada, sin interpolar. El solucionario dice que el valor exacto no se puede calcular (S-Ap2 pp. 66, 67 y 71).

**DEMRE:** el corpus no trae soluciones desarrolladas, solo claves. Hay dos preguntas con cálculo:

- 2024 regular, forma 113, n.º 62 (n = 12, percentiles): con la regla de la lección, el primer percentil de las alternativas que supera el umbral es P40, clave D. Con k(n+1)/100 interpolado también sale D. La clave no está verificada en clavijero (`claveVerificada: false` en `frecuencia-demre-v2.json`).
- 2027 invierno, forma 111, n.º 62 (n = 9, cuartiles): las tres convenciones dan el mismo Q1 y el mismo Q3, y el paso que el enunciado declara errado es justamente el del Q1, clave C. No hay clavijero de 2027.

En los dos casos los datos están elegidos para que la convención no cambie la clave. No se encontró discrepancia entre DEMRE y la lección.

### Verificación con `node -e` (datos inventados)

```
node -e 'import("./lib/estadistica.ts").then(({cuartiles,cuartilesIncluyendo,percentil})=>{
const uc=(d,k)=>{const o=[...d].sort((a,b)=>a-b),n=o.length,p=k*n/4;return Number.isInteger(p)?(o[p-1]+o[p])/2:o[Math.ceil(p)-1];};
... })'
```

| conjunto (inventado) | lección, mitades sin mediana | mitades con mediana (`cuartilesIncluyendo`, oráculo) | UC, k·n/4 | lección, P25 / P50 / P75 |
|---|---|---|---|---|
| n = 8 (par): 3, 7, 8, 11, 14, 16, 19, 23 | 7,5 / 12,5 / 17,5 | 7,5 / 12,5 / 17,5 | 7,5 / 12,5 / 17,5 | 7,5 / 12,5 / 17,5 |
| n = 7 (impar, n ≡ 3 mód 4): 4, 6, 9, 13, 15, 18, 22 | 6 / 13 / 18 | 7,5 / 13 / 16,5 | 6 / 13 / 18 | 6 / 13 / 18 |
| n = 9 (impar, n ≡ 1 mód 4): 2, 5, 6, 10, 12, 17, 20, 21, 26 | **5,5** / 12 / **20,5** | 6 / 12 / 20 | 6 / 12 / 20 | 6 / 12 / 20 |

Con n par todas coinciden. Con n ≡ 3 (mód 4), la lección y UC coinciden, y el oráculo con la mediana incluida se separa. Con n ≡ 1 (mód 4), la lección se separa de todas las demás, incluida su propia regla de percentiles.

### Hallazgos abiertos (no se toca la lección)

1. **La lección no es consistente consigo misma cuando n ≡ 1 (mód 4).** Su Q1 por mitades no es su P25 por la regla k·n/100 (en el ejemplo, 5,5 frente a 6), aunque el texto afirma Q1 = P25. Hoy no se nota porque todos sus conjuntos tienen n par.
2. **UC y la lección difieren en ese mismo caso.** UC coincide con el P25 de la lección y no con su Q1. UC tampoco es uniforme: usa mitades en S-Ap2 p. 69 y k·n/4 en S-Ap2 p. 74, y en ese problema, con n ≡ 1 (mód 4), la clave solo sale con k·n/4.
3. **Consecuencia para el banco de Advance.** Todo ítem con cuartiles de datos no agrupados debería evitar n ≡ 1 (mód 4), o comprobar que las tres convenciones den lo mismo, como hacen las dos preguntas DEMRE. El diagrama de cajón es declarativo (los cinco números vienen en el JSON), así que la figura no toma partido: la convención se decide al escribir el ítem.
