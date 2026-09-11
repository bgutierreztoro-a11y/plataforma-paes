# Fobos Advance

Manual de construcción. Documento vivo, vive en `docs/fobos-advance.md`.

Versión 1, 06-09-2026. Reemplaza a `V1 — Definición y construcción del Modo PAES de Fobos.md`, que queda archivado como referencia histórica.

---

## 0. Qué es Fobos Advance

Fobos (gratis) enseña la materia. Fobos Advance enseña a **rendir la prueba**.

Esa frase no es marketing, es el criterio de admisión de cada feature. Si algo que se propone construir también tendría sentido dentro de una lección gratis, no pertenece a Advance.

### La tesis

Advance no compite en inventario de ejercicios. SimplePAES ya tiene más de 4.600 y los regala. Advance compite en **granularidad del diagnóstico**: el catálogo de aproximadamente 25 errores por módulo, mapeado a nivel de distractor individual, es la única pieza que nadie más tiene y que no se puede copiar sin rehacerla desde cero.

Todo lo que se construya en Advance tiene que consumir ese catálogo. Si una feature no toca `catalogoErrores`, probablemente no es Advance.

### Qué es

Una capa de entrenamiento posterior al aprendizaje, con cinco mecánicas:

1. **Modo descarte.** Eliminar alternativas en vez de resolver.
2. **Panel de desempeño 2×2.** Acierto cruzado con tiempo.
3. **Ciclo de vida del error.** Abierto, en observación, cerrado.
4. **Mapa de recuperables.** Qué preguntas estás perdiendo hoy por errores abiertos.
5. **Triage de 20 segundos.** Decidir si una pregunta se resuelve, se deja o se marca.

### Qué no es

No es más contenido. No es un curso paralelo. No es un tutor de IA. No es gamificación. No hay XP, monedas, rachas, ni confeti. No hay ranking. No hay video.

### Modelo comercial

Suscripción por temporada PAES. Se activa al contratar y termina con la rendición. No es mensualidad indefinida ni compra única.

Razones: la compra única choca con el derecho a retracto en contratos de educación; la mensualidad indefinida obliga a un flujo de cancelación que un menor no debería tener que administrar. La temporada tiene fin natural y es honesta sobre lo que se vende.

Techo de precio: bajo $8.000 CLP mensuales equivalentes, que es lo que cobra SimplePAES.

---

## 1. Cómo trabajamos

### División de roles

**Benja decide y firma. CC ejecuta en el repo. Este chat es la capa de arquitectura y revisión.**

| Tarea | Quién |
|---|---|
| Decisiones pedagógicas y de producto | Benja |
| Firma de cualquier cambio en `content/`, `schema`, o migraciones | Benja |
| `git push` | Benja, siempre, sin excepción |
| Edición de `CLAUDE.md` | Benja, CC nunca lo toca |
| Correr `consultar-fuentes.mjs` | Benja, fuera de toda sesión de CC |
| Actualizar el MOS | Benja |
| Trámites legales y contables | Benja |
| Escribir código, tests, docs técnicos | CC |
| Proponer arquitectura en Plan Mode | CC |
| Auditorías de contenido | CC, en hilos `/clear` aislados |

### Semáforo de autonomía de CC

- 🟢 **Sin consultar:** CSS, tokens, documentación técnica, tests, refactor interno sin cambio de props.
- 🟡 **Requiere aprobación:** componentes nuevos, cambios de props, rutas nuevas, dependencias.
- 🔴 **Requiere firma explícita de Benja:** `content/`, schema, migraciones de base de datos, `git push`, cualquier promesa de persistencia, cualquier texto que hable de precio.

### Protocolo de sesión

1. `git fetch` al inicio, siempre. Conocer el estado real de origin antes de tocar nada.
2. CC entra en Plan Mode y propone. No escribe archivos antes de la aprobación.
3. Paradas explícitas entre sub-fases (PARADA 1, PARADA 2). En cada parada CC muestra lo hecho y espera.
4. Verificación real, no calculada: clic de mouse a 390×844, `prefers-reduced-motion` emulado, contraste medido, `npm run validar`, `tsc`, `lint`, `npm run capturas`.
5. Commits separados por concern. Prefijo `advance:` en todos los commits de esta línea de trabajo.
6. `git add` por path explícito. Nunca `-A`, nunca `.`.
7. Push manual de Benja tras revisar diffs.

### Regla de aislamiento (nueva, crítica)

**Ningún commit de Advance toca `components/leccion/`, `components/camino/` ni `content/lecciones/`.**

La única excepción es el punto de entrada en el riel (fase 1.3), que es un commit propio, revisado aparte, y que solo agrega un componente sin modificar la lógica existente de `RielEstaciones.tsx`.

Si Advance necesita algo de un componente de la capa gratis, primero se extrae a `components/ui/` en un commit separado, y recién después se usa. Esto mantiene la capa gratis auditable por sí sola y evita que una regresión de Advance rompa lo que ya está en producción.

Los tres archivos excluidos de siempre siguen excluidos: `docs/mapa-modulos-m1.md`, `lib/modulos.ts`, `content/cierres/cierre-cuerpos-geometricos.json`.

---

## 2. Arquitectura de separación

Advance es producto pago. La separación tiene que ser estructural, no una condición `if` regada por el código.

### 2.1 Plano de código

```
app/advance/                     ruta raíz propia, nunca anidada en /linea o /camino
  page.tsx                       portada: qué hacer ahora
  puerta/page.tsx                qué es Advance, para quien no tiene acceso
  descarte/[unidadId]/page.tsx   sesión de descarte
  errores/page.tsx               ciclo de vida de los errores
  entrenar/[sesionId]/page.tsx   sesión de entrenamiento
  desempeno/page.tsx             panel 2×2

components/advance/              todo lo exclusivo de Advance
  EjecutorDescarte.tsx
  AlternativaDescartable.tsx
  ResultadoDescarte.tsx
  TarjetaError.tsx
  PanelDesempeno.tsx
  MapaRecuperables.tsx
  TramoAdvance.tsx               el punto de entrada en el riel
  PuertaAdvance.tsx              estado bloqueado

lib/advance/                     motor
  acceso.ts                      única fuente de verdad del gate
  descarte.ts                    lógica de la mecánica
  dominio.ts                     p(L), ciclo de vida del error
  seleccion.ts                   armado de sesiones
  repositorio.ts                 acceso a datos (fase 3+)

content/advance/                 banco de ítems Advance
  schema/item-advance.schema.json
  <unidad-id>/banco.json
```

Reutilizables desde la capa gratis, sin duplicar: `Boton`, `PlacaLinea`, `BotonVolver`, `FranjaDeItems`, `SelloDeEstacion`, tokens de línea, `GlifoRepetir`, `PantallaCentrada`.

No se reutiliza `EjecutorSetItems` tal cual. El descarte tiene una máquina de estados distinta. Se escribe `EjecutorDescarte` nuevo, tomando de `EjecutorSetItems` la estructura de navegación entre ítems, no el manejo de respuesta.

### 2.2 Plano de acceso

`lib/advance/acceso.ts` es el único lugar donde se decide si alguien tiene Advance. Todo lo demás lo consume. Nunca un chequeo inline.

```ts
export type EstadoAdvance = "activo" | "sin-acceso" | "temporada-terminada";

export async function estadoAdvance(): Promise<EstadoAdvance>

export function advanceVisible(): boolean
```

Fase 1: `estadoAdvance` lee una variable de entorno (`NEXT_PUBLIC_ADVANCE_DEMO`) para poder construir y probar sin cuentas.
Fase 3 en adelante: lee Clerk y la base de datos.

`advanceVisible` es independiente del estado: dice si Advance existe en la interfaz. Lee `NEXT_PUBLIC_ADVANCE_VISIBLE`; sin ella, el tramo no se monta en el riel y toda ruta bajo `/advance` responde 404, así que producción queda idéntica a antes de F1 hasta que se decida mostrarlo. Se puede ver el tramo sin tener acceso, que es justamente el estado `sin-acceso`.

La firma de la función no cambia entre fases. Eso es deliberado: cuando llegue Clerk, no hay que tocar ninguna pantalla.

### 2.3 Plano de contenido

Advance tiene banco propio en `content/advance/`, con schema propio que es más estricto que el de lecciones.

Diferencia clave con el schema de lecciones: en Advance, **`errorCatalogado` es obligatorio en los tres distractores**. Sin eso el modo descarte no puede funcionar. El validador lo rechaza.

El banco Advance referencia el `catalogoErrores` del módulo correspondiente por id. No lo duplica y no inventa errores nuevos. Si un ítem Advance necesita un error que no está en el catálogo del módulo, CC se detiene y propone el texto del error nuevo a Benja antes de asignarle id.

---

## 3. Dónde aparece Advance en la experiencia

Decisión tomada: **opción A, cuarta capa de la metáfora**, más acceso secundario desde navegación.

El estudiante recorre la línea, completa las estaciones, y al final del riel aparece un tramo más. No es otra aplicación metida adentro, es continuación de la misma línea.

### 3.1 El tramo en el riel

`components/advance/TramoAdvance.tsx`, montado al final de `RielEstaciones.tsx` en `app/linea/[ejeId]/page.tsx`.

Dos estados:

**Sin acceso.** El tramo se ve, pero atenuado. Copy honesto de qué es, sin urgencia, sin cuenta regresiva, sin "última oportunidad". Precio visible y claro (ver sección 7.1). Un solo botón que lleva a la información completa.

**Con acceso.** El tramo es un destino más del riel, con su propio glifo y estado de progreso.

Restricción visual: el tramo bloqueado no puede dominar la pantalla ni interrumpir la lectura del riel. Es un tramo más allá del final, no un cartel.

### 3.2 Acceso secundario

Ítem en `NavInferior` que aparece solo cuando `estadoAdvance() === "activo"`. Sin acceso, el ítem no existe en la navegación. La puerta de entrada al pago es el riel, no la barra.

---

## 4. Las fases

Cada fase tiene criterio de salida verificable. No se pasa a la siguiente sin cumplirlo.

### F0 — Desbloqueo de datos (sin UI nueva) — CERRADA 2026-09-09

Sin esto, Advance es una carcasa. El modo descarte no funciona si un distractor no tiene error mapeado.

**0.1** Ejecutar los 22 hallazgos mecánicos de `npm run auditar`. Ya están identificados. Requieren firma 🔴 porque tocan `content/`.

**0.2** Resolver los 41 hallazgos con decisión pedagógica: `colision-distractor-correcta`, `catalogo-divergente`, `campo-sin-unidad`, `dificultad`, `habilidades`. Cada uno necesita decisión de Benja. Propuesta de método: CC agrupa los 41 por tipo y presenta lotes de decisión, no uno por uno.

**0.3** Crear `content/advance/schema/item-advance.schema.json` con `errorCatalogado` obligatorio en distractores.

**0.4** En el schema de lecciones, `errorCatalogado` sube de opcional a **advertencia** del validador (no error), con reporte de cobertura. Sube a obligatorio solo cuando la cobertura llegue a 100%. Si se hace obligatorio antes, se rompen los 11 módulos publicados.

**0.5** (Benja) Actualizar MOS §7.1. Hoy dice literal que ningún ítem DEMRE se copia al producto. Con el criterio del abogado, el material liberado de DEMRE es utilizable y el material de privados (preuniversitarios) no. Mientras el texto viejo siga ahí, CC y el auditor van a bloquear todo ítem proveniente de forma liberada.

**Criterio de salida:** `npm run auditar` reporta cero hallazgos 🔴 en las categorías `colision-distractor-correcta` y `catalogo-divergente`. Reporte de cobertura de `errorCatalogado` disponible por módulo.

**Registro de cierre (2026-09-09):**

1. `colision-distractor-correcta`: 0 🔴.
2. `catalogo-divergente`: 0 🔴. No es un chequeo activo que haya pasado: la categoría se retiró del auditor el 2026-09-08 (`scripts/auditar-leccion.mjs:380-387`, commits `6c8eedc`/`3958991`) porque la migración a catálogo canónico-único eliminó la posibilidad de divergencia entre fuentes. Es un cero estructural — no hay guard corriendo, no hay nada que pudiera reportar 🔴.
3. Reporte de cobertura por módulo: existe en `npm run validar` desde F0.4 (commit `745ee2e`). Total global 68,6% (430/627).

   | Módulo | Cobertura |
   |---|---|
   | porcentaje | 100.0% |
   | proporcionalidad | 100.0% |
   | enteros-racionales | 91.7% |
   | expresiones-algebraicas | 86.3% |
   | cuerpos-geometricos | 81.7% |
   | ecuaciones-inecuaciones | 75.4% |
   | potencias-raices | 70.4% |
   | figuras-geometricas | 68.3% |
   | funcion-lineal-afin | 42.9% |
   | sistemas-2x2 | 26.7% |
   | funcion-cuadratica | 25.0% |

**Deuda diferida, NO bloqueante de este cierre:** `cierre-v0.json` (cierre en producción de `funcion-lineal-afin` vía `lib/modulos.ts`) está en 0/24 distractores mapeados, y `l0-demo.json` en 0/9. Sin fecha de resolución todavía; queda como ítem abierto.

---

### F1 — Esqueleto de Advance (código, sin contenido nuevo) — CERRADA 2026-09-11

**1.1** `lib/advance/acceso.ts` con la firma final y implementación por variable de entorno.

**1.2** `app/advance/page.tsx`: portada mínima. Sin acceso, redirige a la puerta. Con acceso, muestra un estado vacío honesto ("todavía no hay entrenamientos disponibles").

**1.3** `TramoAdvance.tsx` montado en el riel, ambos estados. Commit propio, revisado aparte.

**1.4** `PuertaAdvance.tsx`: la pantalla de qué es Advance. Texto pendiente de la decisión legal de la sección 7.1.

**1.5** Sección en `app/_design/page.tsx` con el tramo en sus dos estados, sobre las cuatro líneas, para medir contraste.

**Criterio de salida:** con `NEXT_PUBLIC_ADVANCE_DEMO=1` se llega a `/advance` desde el riel; sin la variable, se llega a la puerta. Contraste AA medido en las cuatro líneas. Capturas e2e sin regresión respecto del baseline de `docs/deuda-e2e-capturas.md`.

**Registro de cierre F1, 2026-09-11.**

Criterio de salida cumplido, con clic real a 390×844 sobre `next dev`, reiniciando el servidor por combinación porque `NEXT_PUBLIC_` se inlinea. Sin flags, `/linea/numeros` no monta el tramo y `/advance` responde 404. Con `NEXT_PUBLIC_ADVANCE_VISIBLE=1`, el clic en el tramo atenuado lleva a `/advance/puerta?eje=numeros`, el retorno vuelve a `/linea/numeros`, `/advance?eje=numeros` redirige a `/advance/puerta?eje=numeros`, y `/advance/puerta?eje=basura` ignora el eje y vuelve a `/camino`. Con `VISIBLE=1` y `DEMO=1`, el clic en el tramo activo lleva a `/advance?eje=numeros` con el estado vacío y el retorno vuelve a la línea. En el build de producción sin flags (`npm run build` y `next start`), `/advance` y `/advance/puerta` dan 404 y el HTML de `/linea/numeros` es byte a byte el de antes de F1, salvo el `buildId` y el hash del chunk de `LineaDelEje`. `npm run capturas` sin flags dio 24 fallos, 4 omitidos y 46 pasados, y `comm` contra la lista de `docs/deuda-e2e-capturas.md` devolvió cero líneas: el conjunto exacto del baseline, sin regresión. `prefers-reduced-motion` emulado en riel, puerta y portada: `document.getAnimations()` en cero, contra cinco animaciones sin la preferencia.

Contraste medido en render sobre `/_design` (colores computados en el navegador, fondo `#f7f7f5`), por línea y estado. Título y subtítulo del tramo, en `text-primary`: 16,56 en las cuatro líneas y los dos estados, umbral 4,5. Glifo en `--linea-nav`, umbral 3: mínimo 4,48 en la línea 03, luego 4,52 en la 01, 6,41 en la 04 y 16,56 en la 02, que cae a tinta. Segmento en `--linea`, umbral 3: 4,48 en la 03, 4,52 en la 01, 6,41 en la 04 y 1,64 en la 02. Ese 1,64 se acepta como decorativo: el segmento es continuidad del riel, que ya usa ese mismo color, y el estado lo dicen el glifo y el subtítulo en palabras, nunca el segmento solo. Área táctil del enlace del tramo, 60 px de alto, medida.

Desvíos respecto de lo planificado. Se agregó `advanceVisible()` con `NEXT_PUBLIC_ADVANCE_VISIBLE`, de modo que Advance queda invisible en producción hasta que se decida activarlo, y `/advance/*` responde 404 sin el flag. Existe la ruta `/advance/puerta`, que no estaba en el árbol de §2.1. El orden de ejecución fue 1.1, 1.4, 1.2, 1.5 y 1.3, distinto de la numeración, porque la portada redirige a la puerta y el tramo se mide en la galería antes de montarse. El montaje en el riel no fue directo en `RielEstaciones` ni en `page.tsx`, porque el riel vive dentro de la isla de cliente `components/camino/LineaDelEje.tsx`: esa isla ganó una prop opcional `despuesDelRiel` que se rinde justo después del riel, envuelta en la secuencia de entrada con el escalón siguiente a la última estación y con el CTA corrido un escalón, solo cuando hay algo montado (commits `abd75c8` y `461e99f`); `RielEstaciones.tsx` quedó sin diff. La galería vive en `app/%5Fdesign/page.tsx`, no en `app/_design/`, y los tokens reales son `--line-01` a `--line-04` con los roles `--linea` y `--linea-nav`, no `--e1` a `--e4` como decía este manual. Todo texto de Advance que cae sobre el fondo de página va en `text-primary`, porque `text-secondary` da 4,42 sobre el `body` y no llega a AA (`docs/deuda-contraste-etiquetas.md` §1); la jerarquía la dan tamaño y peso. El disclaimer de §7.3 lo cubre el pie del layout en todas las pantallas, así que la puerta no lo repite y la clave salió de `textos.ts`. Las constantes de geometría del riel (`CANALETA`, `EJE_DEL_RIEL`, `CENTRO_DEL_DISCO`) están duplicadas en `TramoAdvance.tsx` con referencia al origen, para no exportarlas desde la capa gratis. El ítem de `NavInferior` de §3.2 queda fuera de F1: no hay nada que entrenar todavía.

Pendientes que F1 deja abiertos. El texto de precio y el CTA de pago de la puerta (§7.1, §11.2, respuesta pendiente sobre la Ley 21.719): hoy la puerta no tiene ningún texto de precio ni marcador. El estado `temporada-terminada` existe en el tipo y se rinde como `sin-acceso` en el tramo y en la portada, sin interfaz propia. `npm run auditar` no imprime resumen por categoría; el criterio de F0 se verificó igual sobre la salida cruda, con cero 🔴 y 128 🟡 de `colision-entre-archivos`.

Commits de F1: `5b0422b`, `85151e1`, `290a738`, `87cf755`, `abd75c8`, `3375687`, `b72c0cc`, `461e99f`.

---

### F2 — Modo descarte

La mecánica que define el producto. Es la única de las cinco que funciona sin cuenta ni servidor.

**2.1** Banco piloto: una unidad, 20 ítems, con los tres distractores mapeados. Ver sección 5 para el proceso de producción.

**2.2** `lib/advance/descarte.ts`: máquina de estados.

**2.3** `EjecutorDescarte.tsx` y `AlternativaDescartable.tsx`.

**2.4** `ResultadoDescarte.tsx`: pantalla de cierre de sesión.

**2.5** Eventos PostHog nuevos.

**Criterio de salida:** un estudiante recorre 5 ítems en descarte a 390×844 con clic real, recibe el nombre del error correcto en cada descarte acertado, y llega a una pantalla final que le dice qué error apareció más. Sin persistencia todavía.

---

### F3 — Persistencia

Es el gate más caro y no es principalmente técnico.

**3.1** (Benja) Dominio propio y Clerk en instancia de producción.

**3.2** (Benja) Política de privacidad y términos publicados **antes** de cobrarle a alguien desconocido. Exigencia del MOS §7.5 y de la Ley 21.719, que entra en vigencia el 1 de diciembre de 2026, dentro de la primera temporada de venta.

**3.3** Inventario de datos: qué se guarda, dónde, para qué, por cuánto tiempo. Documento, no código. Requisito de la ley.

**3.4** Esquema en Neon. Minimización estricta: sin nombre completo, sin RUT, sin colegio, sin fecha de nacimiento.

```
intento_advance
  id, usuario_id, item_id, unidad_id, modo,
  correcto, tiempo_ms, errores_identificados[], creado_en

estado_error
  usuario_id, error_id, modulo_id,
  fase ("abierto" | "observacion" | "cerrado"),
  p_dominio, observaciones, ultimo_intento_en

temporada
  usuario_id, inicio, fin, estado
```

**3.5** `lib/advance/repositorio.ts`.

**Criterio de salida:** un estudiante inicia sesión, hace una sesión de descarte, cierra el navegador, vuelve, y su historial está ahí. Política de privacidad publicada y accesible.

---

### F4 — Diagnóstico de desempeño

Recién aquí entran las mecánicas que dependen del historial.

**4.1** Panel 2×2 (sección 6.2).
**4.2** Ciclo de vida del error con p(L) (sección 6.3).
**4.3** Repaso de errores y sesiones de entrenamiento dirigidas.
**4.4** Re-diagnóstico.

**Criterio de salida:** un error pasa de abierto a cerrado por comportamiento real del estudiante, y la pantalla de errores lo refleja.

---

### F5 — Mapa de recuperables y triage

**5.1** Mapa de recuperables (sección 6.4).
**5.2** Triage de 20 segundos (sección 6.5).

---

### F6 — Reporte al apoderado

La palanca comercial más grande y la que menos código nueva necesita, porque consume lo construido en F4. El adulto es quien paga y hoy no recibe nada.

Fuera de V1, pero la arquitectura de F4 tiene que dejarlo posible: todo dato que se calcule para el panel debe poder renderizarse en un resumen legible por un adulto que no usa la plataforma.

---

## 5. Producción de contenido Advance

### 5.1 Origen del material

Permitido: temario oficial DEMRE, formas liberadas de aplicaciones anteriores, material propio.

Prohibido: material de preuniversitarios y otros privados. Sin excepciones y sin "retoques".

Material de la profesora: **más adelante**, y cuando entre, entra en el rol de análisis (qué errores ve en sala, qué distractor cae más, calibración de dificultad, verificación matemática), no como fuente de enunciados. Si en algún momento se usan enunciados suyos, hace falta cesión escrita, porque sin eso ella queda como titular de una pieza del producto pago.

### 5.2 Lo que hay que producir por ítem

El enunciado es la parte barata. El trabajo real es el mapeo.

```json
{
  "id": "adv-porcentaje-001",
  "unidadId": "porcentaje",
  "moduloId": "porcentaje",
  "habilidad": "resolver",
  "dificultad": "media",
  "tiempoReferenciaSeg": 120,
  "enunciado": "...",
  "alternativas": [
    { "clave": "A", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "error-3",
      "feedbackDescarte": "..." },
    { "clave": "B", "texto": "...", "esCorrecta": true,
      "feedbackDescarteIncorrecto": "..." },
    { "clave": "C", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "error-7",
      "feedbackDescarte": "..." },
    { "clave": "D", "texto": "...", "esCorrecta": false,
      "errorCatalogado": "error-12",
      "feedbackDescarte": "..." }
  ],
  "solucion": "...",
  "proveniencia": { ... }
}
```

Campos nuevos respecto del schema de lecciones:

- `tiempoReferenciaSeg`: obligatorio. Valores por defecto según dificultad: baja 80, media 120, alta 160. Base: 140 minutos para 65 preguntas da 129 segundos promedio. Se calibra con datos reales cuando exista F3.
- `errorCatalogado`: obligatorio en los tres distractores.
- `feedbackDescarte`: el texto que aparece cuando el estudiante descarta **correctamente** esa alternativa. No es el feedback de haberla elegido. Es distinto y hay que escribirlo aparte.
- `feedbackDescarteIncorrecto`: en la correcta. Aparece cuando el estudiante la descarta por error.

### 5.3 Pipeline

1. Benja verifica estado real en disco antes de asumir nada.
2. Benja corre `consultar-fuentes.mjs` manualmente, fuera de toda sesión de CC.
3. CC propone el lote en Plan Mode. Espera aprobación.
4. CC escribe. Cada distractor tiene que apuntar a un error existente del catálogo del módulo. Si necesita uno nuevo, se detiene y propone texto.
5. Ronda 1 (verificación matemática) y Ronda 2 (originalidad) en hilos `/clear` separados.
6. Resultado de las auditorías escrito de vuelta en `proveniencia.declaracionOriginalidad` de inmediato. Si queda solo en el chat, la proveniencia se desincroniza.
7. Ningún conteo se escribe en proveniencia sin verificarlo antes con `node -e`.

### 5.4 Volumen mínimo

Para que el descarte tenga sentido en una unidad: **20 ítems**, con cobertura de al menos 12 errores distintos del catálogo de esa unidad.

Menos de eso y el estudiante ve repetición inmediata. Más de 20 en la primera unidad es desperdicio antes de validar la mecánica.

---

## 6. Especificación de las mecánicas

### 6.1 Modo descarte

**El cambio de tarea.** No es "elige la correcta". Es "elimina las que no pueden ser". Esa inversión es la que entrena la habilidad real de la PAES, donde el estudiante muchas veces no sabe resolver pero sí puede eliminar.

**Interacción.** Un tap sobre una alternativa la descarta. Un segundo tap la restaura, mientras no se haya confirmado. Área táctil mínima 44px.

**Estados de una alternativa:**

| Estado | Qué significa | Tratamiento visual |
|---|---|---|
| Intacta | Sin decisión | Normal |
| Descartada correcta | Era distractor | Tachada, atenuada, con el nombre del error |
| Descartada por error | Era la correcta | Se detiene el ítem |
| Sobreviviente | Única sin descartar | Se resalta antes de confirmar |

**Flujo de respuesta.**

Descarte acertado: aparece el `feedbackDescarte`. Breve, una o dos líneas, nombrando el error concreto. Ejemplo de tono: "Bien. Esa sale porque suma el 20% en vez de multiplicar por 1,2."

Descarte de la correcta: el ítem se cierra. Aparece `feedbackDescarteIncorrecto` y la solución. Este es el único error real de la mecánica y hay que tratarlo sin dramatismo: es información valiosa, no un castigo.

Cuando queda una sola: confirmación. Si acertó, cierre breve. Sin celebración ruidosa.

**Lo que se registra por ítem:**

```ts
{
  itemId: string;
  ordenDescartes: string[];        // ["C", "A", "D"]
  erroresIdentificados: string[];  // ids del catálogo
  descarteFatal: string | null;    // clave de la correcta, si la descartó
  tiempoMs: number;
}
```

`ordenDescartes` importa más de lo que parece. El estudiante que descarta primero el error más grosero está leyendo bien. El que descarta primero el distractor sutil está adivinando. Ese dato es materia prima para F4 y no cuesta nada capturarlo ahora.

**Pantalla final de sesión.** Responde tres preguntas, en este orden:

1. Cómo te fue (cuántos ítems, cuántos descartes acertados).
2. Qué error apareció más veces, por nombre.
3. Qué hacer ahora.

Sin gráficos. Sin porcentajes decorativos. Reutiliza `FranjaDeItems` para el eco visual de la sesión.

**Accesibilidad.** Cada alternativa es un `button` con `aria-pressed`. El estado descartado se anuncia por texto, no solo por tachado. `prefers-reduced-motion` elimina toda transición, no la acorta.

---

### 6.2 Panel 2×2 (requiere F3)

Cruce de acierto con tiempo, usando `tiempoReferenciaSeg`.

| | Dentro del tiempo | Sobre el tiempo |
|---|---|---|
| **Correcto** | Dominado | **Frágil** |
| **Incorrecto** | **Error conceptual** | Bloqueo |

Los dos cuadrantes que importan y que nadie más muestra:

**Frágil.** Correcto pero lento. Es el predictor de derrumbe: en la prueba real, con 140 minutos para 65 preguntas, lo frágil se cae. Un estudiante que ve 80% de aciertos en su ensayo y no sabe que la mitad son frágiles no tiene información útil.

**Error conceptual.** Incorrecto y rápido. Respondió con seguridad y estaba mal. Es el error más peligroso porque el estudiante no sabe que lo tiene.

Regla de honestidad: no clasificar con menos de 3 intentos en la habilidad. Un ítem lento no hace a nadie frágil.

---

### 6.3 Ciclo de vida del error (requiere F3)

Cada error del catálogo, para cada estudiante, tiene una fase.

```
abierto  →  observación  →  cerrado
   ↑                            |
   └────────── recaída ─────────┘
```

**Abierto.** El estudiante cometió el error al menos una vez recientemente.

**Observación.** Acertó una vez en un ítem que codifica ese error. Todavía no está cerrado.

**Cerrado.** p(L) supera el umbral, con aciertos espaciados en el tiempo. No basta con acertar tres veces seguidas en la misma sesión.

**Modelo.** BKT simplificado. Parámetros iniciales, a calibrar con datos reales:

```
p(L0)    = 0,30   conocimiento previo
p(T)     = 0,25   probabilidad de aprender por intento
p(guess) = 0,25   4 alternativas
p(slip)  = 0,10   error por descuido
umbral de cierre = 0,85
```

Restricción: dos de los aciertos tienen que estar separados por al menos 24 horas. Sin eso, cerrar un error es cuestión de insistir en la misma sesión.

**Recaída.** Un error cerrado que vuelve a aparecer vuelve a abierto, y se marca como recaída. La recaída es información distinta de un error nuevo y se muestra distinto.

---

### 6.4 Mapa de recuperables (requiere F4)

Aquí hay una restricción legal que cambia el diseño. **Está prohibido prometer puntajes** (Ley 19.496, publicidad engañosa). "Cerrar estos 3 errores te da +40 puntos" es una promesa de resultado y es indefendible frente a un menor.

La versión que sí se puede construir es descriptiva, no predictiva:

> Tienes 3 errores abiertos en porcentaje.
> En las formas liberadas de la PAES M1, ese contenido aparece en promedio en 6 de 65 preguntas.

Eso es un hecho verificable sobre la prueba, no una promesa sobre el estudiante. La palanca sigue existiendo ("estos errores tocan 6 preguntas"), pero sin cruzar la línea.

Requiere: conteo real de frecuencia por unidad sobre formas liberadas de DEMRE. Es trabajo de análisis, no de código, y se puede hacer en paralelo desde ahora.

---

### 6.5 Triage de 20 segundos (requiere F4)

Entrenamiento de la habilidad de administración de tiempo, que ninguna plataforma entrena.

Se muestra una pregunta. 20 segundos. Tres decisiones:

- **La resuelvo.** Creo que puedo en tiempo razonable.
- **La dejo.** No es para mí hoy.
- **La marco y sigo.** Vuelvo si sobra tiempo.

No se resuelve nada. Solo se decide.

La evaluación es contra el historial propio: si el estudiante dijo "la resuelvo" en un ítem que codifica un error que él tiene abierto, la lectura fue mala. Si dijo "la dejo" en un ítem de una habilidad que domina, está regalando puntos.

Sin historial esto no se puede evaluar, por eso vive en F4 y no antes.

---

## 7. Legal y comercial

### 7.1 Precio: el bloqueo se levanta

Hallazgo de `preguntas-abogado-menores-precio.md`, circular del SERNAC sobre preuniversitarios:

- El alumno puede contratar y pagar directamente (art. 3° ter de la Ley del Consumidor).
- No existe prohibición de mostrar precio a un menor. Existe **obligación** de informarlo de forma transparente y sin inducir a error.

El bloqueo que arrastrábamos era precaución propia, no ley. **La puerta de Advance puede mostrar precio.**

Lo que sigue prohibido, y no es negociable:

- Urgencia falsa, cuenta regresiva, "quedan X cupos".
- Presión de venta dirigida a un adolescente. El documento los trata como consumidores hipervulnerables.
- Letra chica de cualquier tipo.
- Cláusulas abusivas: suspender el servicio a voluntad, limitar responsabilidad, renuncia anticipada de derechos.
- Prometer puntaje.

**Pendiente:** la pregunta sobre Ley 21.719 sigue sin respuesta y está redactada al final de ese archivo. Define si el flujo de pago necesita un adulto en el medio. Mandarla antes de escribir el texto definitivo de la puerta.

### 7.2 Retracto

El derecho a retracto aplica en contratos de educación. La suscripción por temporada lo hace manejable: se devuelve la proporción no consumida. Definir el mecanismo antes de cobrar, no después del primer reclamo.

### 7.3 Marcas

"PAES" y "DEMRE" solo de forma descriptiva. Nunca en el nombre del producto ni sugiriendo afiliación. Disclaimer permanente: producto independiente, sin vínculo con DEMRE, la Universidad de Chile ni ningún preuniversitario.

El nombre "Fobos Advance" no toca ninguna marca ajena.

### 7.4 Formalización

Antes de cobrarle a alguien fuera del círculo cercano: inicio de actividades ante el SII y boleta por cada venta.

---

## 8. Instrumentación

Eventos nuevos en `lib/eventos.ts`. Mismos principios de siempre: sin autocapture, sin session recording, sin datos identificables.

```
advance_puerta_vista        { eje_id, origen }
advance_descarte_inicio     { unidad_id, items }
advance_descarte_alternativa{ item_id, clave, acertado, posicion_en_orden, ms }
advance_descarte_fatal      { item_id, clave }
advance_descarte_fin        { unidad_id, aciertos, total, error_dominante }
advance_error_cambio_fase   { error_id, desde, hacia }   // F4
advance_triage_decision     { item_id, decision, ms }    // F5
```

`posicion_en_orden` es el dato que permite distinguir lectura de adivinanza. No sirve de nada hoy y va a ser valioso en F4. Capturarlo desde el primer día.

---

## 9. Lo que no se construye

No entra en ninguna fase de este documento. Si aparece como sugerencia, se anota como evolución futura y no se ejecuta:

Tutor de IA, chatbot, ranking, XP, monedas, rachas, badges, leaderboard, confeti, planes de estudio automáticos, video, sistema social, feedback generado por IA en tiempo de respuesta, banco masivo de ejercicios, app móvil nativa, M2, ensayos completos de 65 preguntas.

Dos que se difieren explícitamente aunque estén en el plan original:

**Ruta de 5 etapas** (Identificar, Interpretar, Elegir, Comprobar, Transferir). Exige ítems nuevos diseñados para aislar cada etapa. Es terreno de inventario y ahí no conviene competir todavía.

**MCP propio de Fobos** con el catálogo de errores por distractor. Es la jugada de distribución más interesante que tenemos, porque "mi alumno eligió la C, qué significa" solo lo puede responder Fobos. Pero exige F3 terminado y catálogo estable. Después de la primera temporada.

---

## 10. Riesgos abiertos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Clerk en producción bloqueado sin dominio propio | Bloquea F3 y todo lo que sigue | Comprar dominio ahora, no en F3 |
| Los 41 hallazgos con decisión pedagógica se estancan | Bloquea F0, bloquea todo | Lotes de decisión por tipo, no uno por uno |
| Ley 21.719 vigente el 1 de diciembre de 2026, dentro de la temporada de venta | Multas, aunque el primer año sea amonestación para empresas chicas | Diseñar como si aplicara completa desde F3 |
| El descarte no engancha | Se cae la tesis del producto | F2 es barata a propósito. Se mide con PostHog antes de invertir en F3 |
| SimplePAES copia el descarte | Pérdida de diferenciación | La mecánica es copiable, el catálogo no. Por eso el catálogo es la prioridad |
| 24 fallos e2e preexistentes | Ruido en la verificación de cada fase | Baseline documentado en `docs/deuda-e2e-capturas.md`. Comparar conjunto exacto de tests, no solo el número |

---

## 11. Decisiones pendientes de firma

1. Unidad piloto para F2. Candidatas: porcentaje (catálogo maduro, alta frecuencia en la prueba) o proporcionalidad.
2. Precio exacto y estructura de la temporada. Depende de la respuesta del abogado sobre 21.719.
3. Fecha de compra del dominio propio, que destraba Clerk.
4. Si `tiempoReferenciaSeg` se declara por ítem desde ahora (recomendado) o se difiere a calibración con datos reales.

---

## Anexo A. Plantilla de arranque de sesión de CC

```
Trabajo en Fobos Advance, fase F<n>, tarea <n.n> de docs/fobos-advance.md.

Antes de proponer nada:
1. git fetch y reporta el estado real de origin
2. Lee docs/fobos-advance.md, secciones 1, 2 y la de tu fase
3. Verifica en disco lo que la fase asume que existe. No asumas nada.

Reglas de esta sesión:
- Plan Mode obligatorio. No escribes archivos hasta que apruebe.
- Regla de aislamiento (sección 1): no tocas components/leccion/,
  components/camino/ ni content/lecciones/
- Los 3 archivos excluidos siguen excluidos
- git add por path explícito, nunca -A ni .
- No haces push. Nunca.
- CLAUDE.md no se toca
- Commits con prefijo advance:, separados por concern
- PARADA después de cada sub-tarea

Verificación exigida antes de decir que algo está listo:
npm run validar, tsc, lint, npm run capturas comparado contra el
baseline de docs/deuda-e2e-capturas.md (conjunto exacto de tests,
no solo el número), clic real a 390×844, prefers-reduced-motion emulado.

Si algo no se puede verificar, lo dices. No lo das por hecho.
```

## Anexo B. Checklist de cierre de fase

Antes de dar una fase por terminada:

- [ ] Criterio de salida de la fase cumplido y demostrado con salida cruda
- [ ] `npm run validar` verde
- [ ] `tsc` y `lint` verdes
- [ ] `npm run capturas`: mismo conjunto de fallos que el baseline, cero regresiones
- [ ] Contraste AA medido, no calculado, en las cuatro líneas
- [ ] Verificado con clic real a 390×844
- [ ] `prefers-reduced-motion` emulado en todos los estados nuevos
- [ ] Commits separados por concern, con prefijo `advance:`
- [ ] Diffs revisados por Benja
- [ ] Push manual, con confirmación explícita
- [ ] Este documento actualizado con lo que cambió respecto de lo planificado
