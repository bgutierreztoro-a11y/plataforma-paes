# Hallazgos de auditoría para F0.1 y F0.2

Inventario de la salida de `npm run auditar` medido el 2026-09-14 sobre
`master` en `85efbc2` (al día con `origin/master`), para cerrar F0.1 y
F0.2 de `docs/fobos-advance.md` §4 con datos de hoy y no con los conteos
de la corrida original.

## Resumen

El conteo de referencia de F0 (22 hallazgos mecánicos en F0.1, 41 con
decisión pedagógica en F0.2, 63 en total) **no es reproducible hoy**. La
corrida actual da **0 hallazgos 🔴 en cualquier categoría**. Las tres
secciones A, B y C quedan en cero filas de trabajo pendiente, y el único
ruido que imprime el auditor son 242 advertencias 🟡 de
`colision-entre-archivos`, una categoría que F0 nunca nombró y que el
propio manual ya trata como cifra aparte (ver "Fuera de alcance").

Qué cambió respecto de la corrida vieja: los 63 se resolvieron por lotes
entre el 2026-09-07 y el 2026-09-08 (commits en la tabla de evidencia),
antes de que F0 se marcara cerrada el 2026-09-09. No existe una lista
archivada de los 63 ítems uno por uno; el registro de cierre y esos
commits son la evidencia disponible.

Alcance del auditor, para leer bien los números: `scripts/auditar-leccion.mjs`
recorre solo `content/lecciones/*.json` con `tipo: "leccion"`
(`archivosDeLeccion`, líneas 426-433). No toca `content/cierres/`,
`content/advance/` ni `content/errores/`. Hoy son 49 archivos: 12 sin
hallazgos, 37 con advertencias, 0 con bloqueantes.

## A) Hallazgos mecánicos (sin decisión pedagógica)

| Archivo | Línea | Categoría | Valor actual | Valor corregido | Verificación |
|---|---|---|---|---|---|
| (sin filas) | | | | | |

Cero hallazgos 🔴 hoy en todas las categorías mecánicas del auditor
(`colision-distractor-correcta`, `campo-sin-unidad`, `slider-no-justificado`,
`orden-pasos`, `json`, `tipo`). Verificación:

```
npm run auditar 2>&1 | node -e '
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  const rojos = s.split(/\r?\n/).filter(l => /^\s+🔴 \[/.test(l));
  console.log("A) hallazgos 🔴 mecánicos:", rojos.length);
});'
```

Salida esperada: `A) hallazgos 🔴 mecánicos: 0`.

## B) Hallazgos con decisión pedagógica, agrupados por tipo

Ningún grupo. Las cinco categorías que nombra F0.2 están en cero:

| Categoría | Hallazgos hoy | Estado del chequeo |
|---|---|---|
| `colision-distractor-correcta` | 0 | activo, `auditar-leccion.mjs:204` |
| `catalogo-divergente` | 0 | retirado, ver C) |
| `campo-sin-unidad` | 0 | activo, `auditar-leccion.mjs:307` |
| `dificultad` | 0 | activo, `auditar-leccion.mjs:370-376` |
| `habilidades` | 0 | activo, `auditar-leccion.mjs:357-365` |

No hay lote que firmar. Verificación:

```
npm run auditar 2>&1 | node -e '
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  const cats = ["colision-distractor-correcta","catalogo-divergente",
    "campo-sin-unidad","dificultad","habilidades"];
  for (const c of cats) {
    const n = s.split(/\r?\n/).filter(l => l.includes("[" + c + "]")).length;
    console.log("B)", c + ":", n);
  }
});'
```

Salida esperada: las cinco líneas en `0`.

## C) Hallazgos que ya no aplican

Una sola entrada, la única categoría cuyo chequeo dejó de existir:

| Categoría | Por qué ya no aplica |
|---|---|
| `catalogo-divergente` | Retirada del auditor el 2026-09-08. La migración a catálogo canónico único (`content/errores/<moduloId>.json`, commits `3958991` y `643998d`) dejó una sola fuente por módulo, así que un id no puede tener dos descripciones y no hay divergencia posible. El chequeo `chequearDivergenciaDeCatalogo` y su tabla `MODULO_POR_LECCION` salieron en `643998d`; queda solo el comentario que explica el retiro (`auditar-leccion.mjs:380-387`). Detalle en `docs/deuda-catalogo-errores-crossfile.md`. |

Nota sobre la cita del registro de cierre: `docs/fobos-advance.md:216`
atribuye el retiro a `6c8eedc`/`3958991`. `6c8eedc` es el commit de docs
que cierra la deuda; el retiro del código está en `643998d`. Gana el
código.

Las otras cuatro categorías de F0.2 no van aquí porque siguen activas en
el auditor y simplemente no encuentran nada hoy. Su cero es resultado de
correcciones reales, no de un chequeo retirado:

| Categoría | Commit de cierre | Qué se corrigió |
|---|---|---|
| `colision-distractor-correcta` | registro de cierre, `fobos-advance.md:215` | 0 al cerrar F0 el 2026-09-09; el chequeo sigue activo. |
| `campo-sin-unidad` | `747b8c4` (2026-09-08) | `porcentaje-concepto`, `porcentaje-rebaja-doble`, `porcentaje-volver-atras`: factores adimensionales declarados en `auditoria.camposAdimensionales`. `lineal-patrones-de-cambio`: campo `estampillasMartinaTotal` con unidad "estampillas". |
| `dificultad` | `747b8c4` + Lote C (`aea0c76`, `f776960`, `7269a77`) | `enteros-problemas-en-contexto` reordena `itemsPAES` a la terna baja/media/alta. Lote C reescribe tres cierres (`docs/pendientes.md:309-331`). |
| `habilidades` | Lote C (`aea0c76`, `f776960`, `7269a77`) | Los mismos tres cierres de Lote C cubren habilidades y dificultad a la vez. |
| `slider-no-justificado` (no nombrada en F0.2) | `747b8c4` | `l0-demo.json` declara `auditoria.sliderJustificado`. |

Verificación de que el chequeo retirado no está en el código activo:

```
node -e '
const s = require("fs").readFileSync("scripts/auditar-leccion.mjs","utf8");
const activo = /add\(.🔴., .catalogo-divergente./.test(s);
const funcion = /function chequearDivergenciaDeCatalogo/.test(s);
console.log("C) catalogo-divergente activo:", activo, "| función presente:", funcion);'
```

Salida esperada: `C) catalogo-divergente activo: false | función presente: false`.

## D) Conteo verificado

Regla de suma: A + B + C debe ser igual al total de hallazgos 🔴 que
imprime `npm run auditar`. Los 🟡 de `colision-entre-archivos` no entran
porque F0 nunca los contó (ver abajo).

```
npm run auditar 2>&1 | node -e '
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  const L = s.split(/\r?\n/);
  let archivos = 0, rojos = 0, amarillos = 0; const cat = {};
  for (const l of L) {
    const m = l.match(/(\d+) bloqueante\(s\), (\d+) advertencia\(s\)/);
    if (m) { archivos++; rojos += +m[1]; amarillos += +m[2]; }
    if (/sin hallazgos/.test(l)) archivos++;
    const c = l.match(/\[([a-z-]+)\]/); if (c) cat[c[1]] = (cat[c[1]]||0)+1;
  }
  const A = 0, B = 0, C = 0;
  console.log({ archivos, rojos, amarillos, cat });
  console.log("A+B+C =", A+B+C, "| total 🔴 =", rojos, "| cuadra:", A+B+C === rojos);
});'
```

Salida medida el 2026-09-14:

```
{ archivos: 49, rojos: 0, amarillos: 242, cat: { "colision-entre-archivos": 242 } }
A+B+C = 0 | total 🔴 = 0 | cuadra: true
```

| Sección | Conteo viejo (F0 original) | Conteo hoy |
|---|---|---|
| A) mecánicos | 22 | 0 |
| B) con decisión | 41 | 0 |
| C) ya no aplican | (no existía) | 1 categoría, 0 hallazgos |
| Total 🔴 | 63 | 0 |

## Fuera de alcance: `colision-entre-archivos`

242 advertencias 🟡 en 37 archivos. No entra en A, B ni C porque no es
ninguna de las categorías que nombran F0.1 y F0.2, no es 🔴 y no forma
parte del criterio de salida de F0 (`fobos-advance.md:211`). El auditor
lo marca 🟡 a propósito (`auditar-leccion.mjs:391-398`): un mismo número
reaparece con otro significado y otras unidades, y el script no distingue
"240 estudiantes" de "240 mL". Es una lista para revisar a ojo, no un
veredicto.

Precedente de tratarlo como cifra aparte:

- Cierre de F1 (`fobos-advance.md:259`): "cero 🔴 y 128 🟡 de
  `colision-entre-archivos`".
- `docs/pendientes.md:329`: "deja solo 🟡 `colision-entre-archivos`
  preexistentes".

De 128 en el cierre de F1 (2026-09-11) a 242 hoy. El delta está medido
archivo por archivo en la sección 9. No hay entrada de deuda dedicada; si
se quiere una, es tarea aparte y no bloquea el cierre de F0.1 y F0.2.

## 9. Lo que queda abierto y NO es F0

Solo registro. Nada de esta sección propone arreglo ni entra en el
criterio de salida de F0.

### 9.1 `colision-entre-archivos`: 128 en el cierre de F1, 242 hoy

Medido corriendo `scripts/auditar-leccion.mjs` en un worktree temporal
sobre `461e99f` (último commit de F1, 2026-09-11) y sobre `85efbc2` (hoy):

| Corrida | Lecciones | 🟡 `colision-entre-archivos` |
|---|---|---|
| `461e99f` (cierre F1) | 34 | 128 |
| `85efbc2` (hoy) | 49 | 242 |
| Delta | +15 | +114 |

Las 128 advertencias de F1 siguen idénticas hoy: mismos 128 pares de
archivos, mismas cifras compartidas, ninguna desapareció y ninguna cambió
de cifras. Cinco lecciones viejas editaron `contextosNumericos` después de
F1 (`cuerpos-problemas-en-contexto`, `potencias-multiplicar-corto`,
`potencias-problemas-en-contexto`, `potencias-raiz-escondida`,
`proporcionalidad-reconocer`) sin alterar ningún par.

Las 114 nuevas involucran al menos una de las 15 lecciones que entraron
después de `461e99f` (módulos tablas y gráficos, transformaciones
isométricas, medidas de posición, reglas de probabilidades, semejanza y
proporcionalidad). Advertencias impresas bajo cada archivo nuevo, tal
como salen en la corrida de hoy:

| Archivo nuevo | 🟡 impresas bajo el archivo |
|---|---|
| `semejanza-plano-y-realidad.json` | 14 |
| `posicion-donde-quedaste-tu.json` | 10 |
| `datos-grafico-puede-mentir.json` | 8 |
| `semejanza-misma-forma-otro-tamano.json` | 8 |
| `datos-leer-antes-de-calcular.json` | 7 |
| `posicion-caja-que-resume.json` | 7 |
| `probabilidad-posible-y-probable.json` | 4 |
| `probabilidad-esto-o-esto-otro.json` | 3 |
| `semejanza-medir-sin-acercarse.json` | 3 |
| `datos-numero-que-representa.json` | 2 |
| `isometrias-girar-reflejar-trasladar.json` | 2 |
| `posicion-partir-en-cuatro.json` | 2 |
| `isometrias-figura-y-su-imagen.json` | 0 |
| `isometrias-mover-sin-deformar.json` | 0 |
| `probabilidad-antes-de-apostar.json` | 0 |
| Suma | 70 |

Las otras 44 del delta se imprimen bajo lecciones viejas apuntando a una
nueva; el auditor emite cada colisión en los dos sentidos, así que 70 + 44
= 114 cuadra con 13 pares nuevo-nuevo (26 advertencias) más 44 pares
nuevo-viejo (88 advertencias).

Verificación del reparte 128 + 114 sobre la corrida de hoy:

```
npm run auditar 2>&1 | node -e '
const nuevos = new Set(["datos-grafico-puede-mentir","datos-leer-antes-de-calcular",
 "datos-numero-que-representa","isometrias-figura-y-su-imagen",
 "isometrias-girar-reflejar-trasladar","isometrias-mover-sin-deformar",
 "posicion-caja-que-resume","posicion-donde-quedaste-tu","posicion-partir-en-cuatro",
 "probabilidad-antes-de-apostar","probabilidad-esto-o-esto-otro",
 "probabilidad-posible-y-probable","semejanza-medir-sin-acercarse",
 "semejanza-misma-forma-otro-tamano","semejanza-plano-y-realidad"].map(f => f + ".json"));
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  let actual = null, viejoViejo = 0, conNuevo = 0;
  for (const l of s.split(/\r?\n/)) {
    const h = l.match(/^\S+ content[\\\/]lecciones[\\\/](\S+\.json)/); if (h) { actual = h[1]; continue; }
    const m = l.match(/\[colision-entre-archivos\] (\S+\.json)/); if (!m) continue;
    if (nuevos.has(actual) || nuevos.has(m[1])) conNuevo++; else viejoViejo++;
  }
  console.log("9.1) viejo-viejo:", viejoViejo, "| con archivo nuevo:", conNuevo, "| total:", viejoViejo + conNuevo);
});'
```

Salida medida el 2026-09-14: `9.1) viejo-viejo: 128 | con archivo nuevo: 114 | total: 242`.

### 9.2 `cierre-v0.json` 0/24 y `l0-demo.json` 0/9

Deuda diferida que el registro de cierre de F0 dejó abierta sin fecha
(`fobos-advance.md:233`). Medido hoy:

| Archivo | Distractores con `errorCatalogado` | Cambió desde `35fde73` |
|---|---|---|
| `content/cierres/cierre-v0.json` | 0/24 | no (diff de 2 líneas, sin tocar ítems) |
| `content/lecciones/l0-demo.json` | 0/9 (6 en `itemsPAES` + 3 en `bloquePregunta` de pasos) | no (diff de 2 líneas, sin tocar ítems) |

El denominador es el mismo que usa `npm run validar`
(`analizarCoberturaErrorCatalogado`, `scripts/validar-contenido.mjs:1281`):
`alternativas[]` de `itemsPAES`/`items` y de bloques `tipo: "pregunta"`
dentro de `pasos[]`. `l0-demo.json` tiene además 2 distractores en
`opciones[]` de `bloqueSeleccion`, que el validador excluye a propósito
("NO formato PAES", comentario en las líneas 1275-1279).

Contexto de cobertura, tal como lo imprime `npm run validar` hoy:
`funcion-lineal-y-afin: 27/63 (42.9%)`, igual que en el registro de cierre
de F0. El total global subió de 430/627 (68,6%) a 738/933 (79,1%) por los
módulos nuevos, no por movimiento en este módulo.

Verificación:

```
node -e '
const fs = require("fs");
function contar(ruta) {
  const d = JSON.parse(fs.readFileSync(ruta, "utf8"));
  let dis = 0, con = 0;
  const medir = (alts) => { for (const a of alts ?? []) if (a.esCorrecta !== true) { dis++; if (a.errorCatalogado) con++; } };
  for (const it of d.itemsPAES ?? d.items ?? []) medir(it.alternativas);
  for (const p of d.pasos ?? []) for (const b of p.bloques ?? []) if (b.tipo === "pregunta") medir(b.alternativas);
  console.log("9.2)", ruta + ":", con + "/" + dis);
}
contar("content/cierres/cierre-v0.json");
contar("content/lecciones/l0-demo.json");'
```

Salida medida el 2026-09-14: `0/24` y `0/9`.
