# Publicar L2 y L3: qué falta y en qué orden

Objetivo: que subir `l2-pendiente-e-intercepto` y `l3-ecuaciones-lineales` de
`borrador` a `publicable` sea mecánico cuando el profesor devuelva la revisión
matemática — sin tener que releer el schema ni el validador esa noche.

**Nada de esto se ejecutó.** Es un mapa, no una acción. Los dos JSON siguen en
`borrador`, sin tocar. Generado corriendo `validarDatos()` (el mismo validador
de `npm run validar`) contra una copia en memoria de cada archivo con distintos
valores de `estado` — nunca contra el archivo en disco.

## Lo bueno: las dos ya pasan el nivel `revision` completo

Corrí el validador con `estado: "revision"` sobre una copia en memoria de cada
archivo. **Cero errores en las dos.** El contrato completo —10 pasos en orden,
`objetivo`, `tiempoEstimadoMin`, `prerrequisitos[]`, `conceptos[]`, 3
`itemsPAES` con las 4 alternativas A–D, exactamente una correcta, y feedback
artesanal en cada distractor— ya está escrito y estructuralmente correcto en
las dos. Lo que falta para `publicable` es exclusivamente la firma, no
contenido.

## Lo que falta, exacto, por archivo

Corrí el mismo validador con `estado: "publicable"`.

### `l2-pendiente-e-intercepto.json` — 7 errores, todos de firma

| Campo | Hoy | Falta |
| --- | --- | --- |
| `checklistOriginalidad.enunciadosOriginales` | `false` | `true` |
| `checklistOriginalidad.diagramasOriginales` | `false` | `true` |
| `checklistOriginalidad.secuenciaOriginal` | `false` | `true` |
| `checklistOriginalidad.provenienciaRegistrada` | `false` | `true` |
| `checklistOriginalidad.revisadoPor` | `""` | nombre de quien auditó |
| `revisionMatematica.aprobada` | `false` | `true` |
| `revisionMatematica.revisadoPor` | `""` | nombre de quien recalculó |

Nota de contenido, no de publicación: `proveniencia.fuentesAnalisis` de `l2`
ya trae una entrada marcada **"PENDIENTE: verificación de originalidad
profunda... antes de pasar a 'publicable'"** (el ítem `l2-item-2`, dominio
huerta escolar). Es la propia lección recordándose a sí misma el paso (b) de
abajo — no un error del validador, que no la marca porque "pendiente" en
minúscula no colisiona con el patrón de placeholders.

### `l3-ecuaciones-lineales.json` — 8 errores: los mismos 7, más uno de contenido

Los mismos siete campos de firma, más:

```
publicable no admite marcadores de trabajo pendiente (TODO, FIXME, [PENDIENTE], XXX, lorem ipsum)
```

**Ubicación exacta:** `itemsPAES[2].alternativas[2].feedback` (ítem 3, la
alternativa C):

> "Dividiste solo una parte del lado izquierdo. Para dividir por 3 hay que
> dividir **TODO** cada lado (los tres términos), no solo el 3x..."

Falso positivo de estilo, no un placeholder real: "TODO" en mayúsculas es la
palabra española "todo" usada para dar énfasis, y el validador la detecta
como marcador de trabajo pendiente en inglés a propósito —el propio script
distingue "todo"/"pendiente" en minúscula (palabras normales del idioma) de
`TODO`/`[PENDIENTE]` en mayúscula (marcadores)—.

**Decisión explícita (2026-07-27): no se toca ni el JSON ni el detector.**
Relajar el patrón de placeholders para que ignore "TODO" en mayúsculas
debilitaría la certificación de originalidad para todo el resto del
contenido, presente y futuro, a cambio de ahorrarse reescribir una frase.
La palabra se reescribe; el candado que la atrapó se queda exactamente como
está.

## Para el revisor: la reescritura del "TODO" de `l3` — dos propuestas

Esto **no es una revisión matemática ni de originalidad** — es una elección
de redacción, y por eso queda en una sección aparte en vez de mezclada con
el checklist. Ninguna de las dos cambia el error que la alternativa describe
ni el paso donde el estudiante se equivocó; ambas dicen exactamente lo mismo
que dice hoy el texto, sin la palabra en mayúsculas.

**Texto actual** (`itemsPAES[2].alternativas[2].feedback`, ítem 3,
alternativa C):

> "Dividiste solo una parte del lado izquierdo. Para dividir por 3 hay que
> dividir TODO cada lado (los tres términos), no solo el 3x. Al hacerlo a
> medias cambias la solución: x + 5 = 20 no equivale a la original."

**Propuesta A — cursiva, cambio mínimo:**

> "Dividiste solo una parte del lado izquierdo. Para dividir por 3 hay que
> dividir *todo* cada lado (los tres términos), no solo el 3x. Al hacerlo a
> medias cambias la solución: x + 5 = 20 no equivale a la original."

Un solo cambio: mayúsculas → cursiva. El énfasis se conserva casi igual de
fuerte; el resto de la frase queda idéntico, palabra por palabra.

**Propuesta B — sin la palabra "todo", más explícita:**

> "Dividiste solo una parte del lado izquierdo. Para dividir por 3 hay que
> dividir cada término del lado izquierdo, no solo el 3x. Al hacerlo a
> medias cambias la solución: x + 5 = 20 no equivale a la original."

Reemplaza "TODO cada lado (los tres términos)" por "cada término del lado
izquierdo" — dice lo mismo con una palabra menos ambigua que "todo", que en
el contexto de una ecuación puede leerse como cantidad ("todo" = el lado
completo como bloque) en vez de como "cada uno" (los tres términos por
separado). Es la opción más precisa matemáticamente, a costa de una frase
un poco más larga.

**Recomendación de quien escribe esto:** Propuesta A, por cambio mínimo —
pero la decisión es del revisor, no de esta nota. Cualquiera de las dos se
escribe directo en `itemsPAES[2].alternativas[2].feedback` durante el mismo
paso de `/revision-originalidad` (paso 3 del orden más abajo), no antes:
así el auditor ve la versión final, no una intermedia.

## Qué NO hace falta tocar

- **Cero cambios de código.** `lib/temas.ts` ya declara las dos lecciones en
  su tema (`funcion-lineal-y-afin: ["l1-patrones-de-cambio",
  "l2-pendiente-e-intercepto"]`, `ecuaciones-e-inecuaciones-primer-grado:
  ["l3-ecuaciones-lineales"]`). En cuanto el JSON pase a `publicable`,
  `idsDeLecciones()` y `idsPublicables()` las recogen solas — son funciones
  puras sobre el contenido en disco, no hay ninguna lista aparte que
  actualizar a mano.
- **Cero cambios de schema.** El contrato de `publicable` ya existe
  (`content/schema/leccion.schema.json`, `checklistOriginalidad` y
  `revisionMatematica`); esperar la firma del profesor no requiere tocarlo.
- **Cero cambio a `pm1:progreso:v1`.** Publicar contenido no toca la forma
  del progreso guardado en el dispositivo del estudiante.

## El orden de pasos, una vez que la revisión matemática esté firmada

Mismo orden para cada archivo, uno a la vez — no se paralelizan porque
`/revision-originalidad` y `/revision-matematica` son juicios independientes
y mezclar los dos archivos en la misma sesión invita a copiar un veredicto al
otro por error.

1. **`/revision-matematica content/lecciones/l2-pendiente-e-intercepto.json`**
   (y luego lo mismo para `l3`). Lanza el subagente `revisor-matematico`:
   recalcula cada solución desde cero, verifica que la alternativa marcada
   correcta lo es, y que cada distractor falla exactamente por el error que
   su feedback describe. Entrega una tabla ítem → veredicto, no edita el JSON.
2. **Leer el veredicto con los propios ojos** y recién ahí escribir a mano
   `revisionMatematica: { aprobada: true, revisadoPor: "<nombre>", fecha:
   "<AAAA-MM-DD>" }`. Si el veredicto encuentra una discrepancia, se corrige
   el ítem en el JSON y se vuelve a correr el comando — no se firma sobre una
   discrepancia sin resolver.
3. **`/revision-originalidad content/lecciones/l2-pendiente-e-intercepto.json`**
   (y luego `l3`). Lanza `auditor-originalidad`: aplica las 4 preguntas del
   checklist (MOS §7.3), revisa uso descriptivo de "PAES"/"DEMRE", ausencia
   de PII, y que no queden placeholders. Regla dura: ante duda razonable, el
   veredicto es NO PUBLICAR con una alternativa propuesta. No edita el JSON.

   Para `l3`, este es el paso natural para decidir la reescritura del "TODO"
   en mayúsculas de arriba — el auditor puede confirmar que el reemplazo
   propuesto no cambia el sentido matemático antes de que se escriba.
4. **Leer el veredicto** y escribir a mano las 4 respuestas de
   `checklistOriginalidad` (`true` cada una si no hubo objeción) más
   `revisadoPor` y `fecha`.
5. **Cambiar `"estado": "borrador"` a `"estado": "publicable"`.** Es el único
   campo que le falta a la lección en sí; los dos objetos de firma ya quedaron
   completos en los pasos 2 y 4.
6. **`npm run validar`.** Debe salir `OK` para el archivo. Si falta algo, el
   propio mensaje de error nombra el campo exacto (mismo formato que las
   tablas de arriba).
7. **`/revision-matematica` y `/revision-originalidad` de nuevo, esta vez
   sobre `content/cierre.json`**, si el objetivo de la sesión es también
   destrabar la celebración del tema (`docs/pendientes.md`, punto b) y no solo
   publicar las lecciones sueltas — el cierre es un archivo aparte y su propio
   `estado` hoy es `revision`, no `borrador`, así que probablemente necesite
   menos pasos, pero sigue el mismo checklist.
8. **Commit** con `estado: "publicable"` y los dos objetos de firma completos.
   Es 🔴 en el protocolo de sesión: requiere la firma explícita del autor
   humano antes de pushear, igual que cualquier cambio a `content/`.

## Qué se destraba al publicar cada una

- **Solo `l2` publicable:** el tema `funcion-lineal-y-afin` pasa a tener sus
  dos lecciones declaradas completas y publicables; el nodo dejaría de
  pintarse "en construcción" para `l2` en `/tema/funcion-lineal-y-afin`. El
  tema completo (celebración) sigue dependiendo además de que `cierre.json`
  llegue a `publicable` — ver `docs/pendientes.md`, punto (b).
- **Solo `l3` publicable:** el tema `ecuaciones-e-inecuaciones-primer-grado`
  pasa de "en construcción" a tener su única lección abierta y navegable.
  No tiene `cierreId` declarado en `lib/temas.ts`, así que ese tema se
  completa con solo `l3` hecha — no depende de ningún otro archivo.
