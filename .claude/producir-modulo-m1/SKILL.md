---
name: producir-modulo-m1
description: Produce un módulo M1 completo (3 lecciones + cierre) o una lección suelta para plataforma-paes-clean, de punta a punta con CC, incluyendo verificación de colisión de fuentes, auditoría matemática y de originalidad, y registro. Úsalo cuando Benja pida "sigamos con el siguiente módulo", "crea la lección de X", o cualquier producción de contenido nuevo para la plataforma PAES M1.
---

# Producir módulo/lección M1 — plataforma-paes-clean

Skill para CC (Claude Code). Ejecuta el pipeline completo de forma autónoma entre las PARADAS marcadas, sin volver al chat de Claude a pedir prompts intermedios salvo en esos puntos exactos.

## 0. Verificación de entorno (SIEMPRE primero, cada sesión nueva)

Antes de tocar cualquier archivo:

```
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status
git fetch
```

- El toplevel DEBE ser `C:\Users\bguti\Desktop\plataforma-paes-clean`. Si es `Desktop\Plataforma PAES` (sin "-clean"), estás en el clon obsoleto — detente y avisa, no produzcas nada ahí.
- Si `git status` no está limpio o hay commits ahead/behind inesperados, repórtalo y espera instrucción antes de tocar nada. No hagas `git pull`, `stash`, `reset` ni cambios de rama por iniciativa propia sin preguntar — un pull mal timing puede parecer que "perdió" commits que en realidad siguen en el reflog. Si algo parece haber desaparecido: **antes de asumir pérdida**, corre `git reflog -30` y `git log --all --oneline | findstr <hash>`. Casi siempre está ahí.
- Si tu sesión de shell puede estar apuntando a un checkout/repo distinto al que Benja está mirando en su propia terminal, dilo explícitamente y pide que él corra el mismo `pwd`/`git rev-parse HEAD` en paralelo para comparar.

## 1. Reglas duras (no negociables, de CLAUDE.md)

1. `catalogoErrores` **nace** una sola vez, con su redacción original en el JSON de L1 del módulo. Pero cada archivo que lo usa (L2, L3, cierre) debe **embeber** el subconjunto exacto de entradas que sus propios distractores referencian vía `errorCatalogado`, copiado carácter a carácter desde donde nació — nunca solo el ID suelto sin el catálogo embebido (`docs/reglas-modulo.md` regla 5, corregida 2026-08-14; motivo técnico en la sección 2d de abajo). "No duplicar" se refiere a no reescribir una entrada con otro texto o significado en otro archivo, no a evitar embeberla.
2. La clave del schema para ítems de lección es `itemsPAES` (NO `paesItems`). El cierre usa `items`.
3. Nunca corras `scripts/consultar-fuentes.mjs` ni leas `fuentes-analisis-aisladas/` tú mismo (CC). Eso lo corre Benja manualmente y pega la salida cruda en el chat. Esto aplica también dentro de una sesión de auditoría: si el hook `check-fuentes-aisladas.mjs` te bloquea Read/Grep/Glob sobre esa carpeta, no lo rodees — repórtalo como NO CERTIFICABLE y sigue.
4. Si necesitas un error que no tiene ID en `catalogoErrores`: PARA, propone el texto exacto, espera aprobación. No inventes IDs sin autorización.
5. Nunca edites `CLAUDE.md`.
6. Commits de propósito único: contenido separado de registro, correcciones separadas de contenido nuevo.
7. Ningún archivo se marca "publicable" ni con campo `estado` (el campo fue eliminado del schema el 2026-08-12 — no lo reintroduzcas). El gate real de publicación es commit sin push + firma explícita de Benja.
8. Cero `git push` sin confirmación explícita de Benja en el chat, incluso si todo pasó auditoría.
9. Título de lección = nombre técnico DEMRE. Nada lúdico.
10. Toda afirmación de "quedó hecho" va con salida cruda verificable (`node -e "..."` sobre el JSON parseado, o `view`/`cat` con números de línea). "Ya lo resolví" sin evidencia no cuenta.
11. Antes de referenciar un agente en `.claude/agents/`, verifica que el archivo existe con ese nombre exacto (`ls .claude/agents/`). Nombres pueden diferir de lo esperado (ej. `revisor-matematico.md`, no `auditor-matematico.md`). Si el nombre que te dieron no existe, dilo y detente — no improvises con otro archivo sin confirmar.
12. Los subagentes de `.claude/agents/` pueden no estar invocables vía el tool Agent en este entorno. Si es así, lee el `.md` del agente y ejecuta sus instrucciones directamente en el hilo principal, dejando explícito que lo hiciste así.

## 2. Errores ya cometidos — no los repitas

Estos son bugs y confusiones reales que ocurrieron produciendo el módulo sistemas-2x2. Revísalos antes de empezar:

**a) Distractores "inventados", no derivados.** Un `errorCatalogado` en un ítem debe producir el número exacto de esa alternativa mediante el mecanismo de error descrito — verificado con `node -e`, no solo plausible a ojo. Antes de escribir cualquier distractor: calcula primero qué valor produce el mecanismo con los datos base, y usa ESE valor. No ajustes el mecanismo declarado al número que ya escribiste — al revés. Casos concretos de error-2 (sustitución circular) mostraron que hay mecanismos que estructuralmente NO producen ningún número (dan una identidad tipo 40=40); si eso pasa, no fuerces un distractor "arbitrario" atribuido a ese error — o encuentra un mecanismo distinto que sí sea numérico, o deja el distractor sin `errorCatalogado` con feedback propio, o (si el error sin uso queda huérfano y rompe el chequeo mecánico `catalogo-sin-usar`) elimina esa entrada del catálogo.

**b) `errorCatalogado` mal mapeado semánticamente.** No basta con que el distractor tenga un error — el MECANISMO tiene que calzar exactamente con la descripción del ID referenciado. "No calcular la otra incógnita" (error-4) no es lo mismo que "no cerrar un desplazamiento en la misma incógnita". "Swap entre ecuaciones/totales" (error-6) no es lo mismo que "invertir coeficiente y constante dentro de una misma expresión". Verifica cada mapeo leyendo la descripción del ID, no solo copiándolo de un ítem similar.

**c) Colisión de fuentes: buscar solo la frase compuesta no basta.** `consultar-fuentes.mjs "estanques de agua"` puede dar NO mientras las palabras sueltas "estanque" y "agua" por separado dan SI en el material fuente. Al generar candidatos de contexto para Fase 1, incluye SIEMPRE también las palabras clave sueltas más distintivas de cada candidato, no solo la frase completa. Prioriza como alto riesgo cualquier término que aparezca en archivos con nombre relacionado directamente al tema de la lección (ej. `MOD-06_Ecuacion_Recta_Sistemas.md` para un módulo de sistemas de ecuaciones) — eso es señal de arquetipo específico, no ruido de vocabulario genérico.

**d) `catalogoErrores` no se resuelve cross-file en runtime — por eso la regla es embeber, no solo referenciar.** `lib/sanitizar.ts` resuelve `errorCatalogado` → descripción SOLO contra el `catalogoErrores` del mismo archivo que se está sanitizando (`catalogoDe(contenido)` usa `contenido.catalogoErrores ?? []`, sin fusionar el de la L1 del módulo). Por eso `docs/reglas-modulo.md` regla 5 (corregida 2026-08-14) es una regla vigente y activa, no una nota de deuda: **cada archivo que referencia un error DEBE embeber su propio subconjunto exacto**, copiado carácter a carácter desde donde la entrada nació. Esta regla anula la #1 de más arriba en cuanto a "vive una sola vez" — el catálogo *nace* una sola vez (en L1), pero se *embebe* en cada archivo que lo usa. Si encuentras un módulo antiguo que no lo hace (`porcentaje`, `enteros-racionales`, `ecuaciones-inecuaciones`, `funcion-lineal-afin`, `sistemas-2x2` — ver `docs/deuda-catalogo-errores-crossfile.md`), es contenido desactualizado pendiente de corrección, no un patrón aceptable a replicar. No lo arregles sin autorización (es trabajo aparte sobre módulos ya publicados), pero nunca repitas el patrón sin embeber en contenido nuevo.

**e) Confusión de repositorio/checkout.** Hay dos clones en el disco de Benja: `Desktop\plataforma-paes-clean` (canónico, el único válido) y `Desktop\Plataforma PAES` (obsoleto). Si en algún punto "los archivos no existen" pero Benja jura que sí, lo primero es comparar `pwd` y `git rev-parse HEAD` entre tu sesión y la de Benja antes de asumir pérdida de trabajo o hacer cualquier operación destructiva.

**f) Auditoría rechazada no se corrige en el mismo hilo que la generó.** Corrección de hallazgos va en un hilo de trabajo normal; pero la re-auditoría posterior SIEMPRE en hilo `/clear` nuevo, auditando los 4 archivos completos de nuevo (no solo el diff), porque el mismo hilo que cometió el error no puede certificar que lo corrigió bien.

**g) Notas internas (`_notasInternas`) que contradicen el contenido real.** Si listas qué IDs de error usa un archivo en una nota, y luego agregas o cambias un `errorCatalogado`, actualiza la nota en el mismo commit. Un auditor lo va a comparar línea por línea contra el JSON real.

## 3. Pipeline completo (Fases 0–8)

### Fase 0 — Estado y elección del módulo/lección
- Corre la verificación de entorno de la sección 0.
- Lee `docs/mapa-modulos-m1.md` para el orden topológico y estado de módulos.
- Lee el switch de tipos de bloque soportados (componente `Bloque.tsx`) — lista los tipos reales disponibles hoy.
- Elige el primer módulo/lección pendiente en orden topológico. Si se puede construir al 100% con los tipos de bloque YA existentes, sin componentes React nuevos ni campos de schema nuevos, arranca directo en la Fase 1.
- **Si requiere infraestructura nueva** (un componente React de ilustración, un tipo de bloque, un campo de schema): no lo saltes — la infra va en una **fase previa**, con commits de propósito único, mergeada y testeada **antes de la Fase 3**. Recién con la infra en verde se empieza a escribir JSON de lección.
  - La regla vieja decía "sáltalo y documenta por qué". Se reescribió el 2026-08-26 porque estaba mal dirigida: su intención era **no dejar contenido bloqueado detrás de infra indefinida**, no prohibir infra. Como estaba, ningún módulo de Geometría, Probabilidad ni Estadística habría podido construirse jamás, y de hecho ya se había incumplido —`270cc37` creó `IlustracionFiguraGeometrica.tsx` para `figuras-geometricas`, que es justo el ejemplo que la regla mandaba saltar—. Una regla que la práctica incumple sin discutirla no gobierna nada.
  - Lo que la regla sí sigue prohibiendo: escribir contenido contra infra que todavía no existe o no está testeada. El JSON no se redacta "esperando" que después alguien dibuje el componente. Orden verificable en git para el módulo #10: `270cc37` (infra) antes de `2f5f66f` (L1).
  - La fase previa se reporta como cualquier otra: archivos, commits, y verificación en verde (`npm run test:unit`, `npm run lint`) antes de pasar a la Fase 1.
- Verifica si hay algún módulo marcado como "en progreso por otra sesión" (archivos en disco no reflejados en el mapa) — si lo hay, NO lo toques salvo instrucción explícita.
- Reporta: módulo/lección elegido, IDs de lección según el mapa, tipos de bloque a usar.

### Fase 1 — Candidatos de colisión
Genera la lista de candidatos de dominio (contextos, situaciones, objetos) para L1/L2/L3/cierre. Para cada candidato, incluye tanto la frase compuesta como sus palabras clave sueltas más distintivas (ver error (c) arriba). Numera la lista y da el comando exacto para que Benja lo corra:

```
node scripts/consultar-fuentes.mjs "candidato 1" "candidato 2" ...
```

>>> **PARADA 1.** Detente. No escribas JSON todavía. Espera que Benja pegue la salida cruda del script.

Al recibir el veredicto: cualquier candidato con SI se descarta por completo (no se usa modificado — cambiar números/palabras no basta). Si algún reemplazo también necesita verificación, repite la Fase 1 solo para esos, con otra PARADA si es necesario. Prioriza como reemplazo los candidatos que ya dieron NO en la ronda anterior si existen y no están usados aún.

### Fase 2 — Arquitectura
`docs/diseno-modulo-{nombre}.md`: objetivo del módulo, objetivos de cada lección, progresión conceptual L1→L2→L3, catálogo de errores propuesto (IDs + descripción REAL y verificable — nada inventado, cada uno debe corresponder a un mecanismo de error que produzca un resultado numérico reproducible), mapa de contextos numéricos por lección sin repetir.

### Fase 3 — L1
JSON con los 10 pasos en orden pedagógico fijo (`curiosidad → problema → pensar → pistas → descubrimiento → generalizacion → practica → aplicacion → reflexion → consolidacion`), `catalogoErrores` embebido, 2–3 `itemsPAES`.

Requisitos pedagógicos (estilo Brilliant, solo con bloques existentes):
- El estudiante descubre el patrón ANTES de recibir la regla formal — la notación formal aparece recién en el paso `generalizacion`.
- Al menos un check metacognitivo tipo "¿tiene sentido?" tras un descubrimiento clave.
- Todo input numérico usa `type="text"` + `inputMode="decimal"` + `aNumero()` (acepta coma decimal chilena).
- Cada distractor de cada ítem tiene `feedback` artesanal ≥40 caracteres, específico al error, referenciando un `errorCatalogado` válido y verificado (ver sección 2a/2b antes de escribir cada uno).

### Fase 4 — L2
Igual que L1, pero embebe su propio subconjunto de `catalogoErrores` — copiado carácter a carácter desde L1 para cada error que sus propios distractores usan. No basta con referenciar el ID: sin el subconjunto embebido, la Capa 2 del feedback queda muda (`lib/sanitizar.ts` resuelve solo contra el catálogo del mismo archivo).

### Fase 5 — L3
Igual que L2: embebe su propio subconjunto de `catalogoErrores` — copiado carácter a carácter desde L1 para cada error que sus propios distractores usan. No basta con referenciar el ID: sin el subconjunto embebido, la Capa 2 del feedback queda muda (`lib/sanitizar.ts` resuelve solo contra el catálogo del mismo archivo). Mayor densidad de formato PAES, cierra la progresión.

### Fase 6 — Cierre
`content/cierres/cierre-{modulo}.json`, `tipo: "cierre"`, exactamente 8 `items`, cobertura balanceada de las 3 lecciones y de las 4 habilidades (resolver, modelar, representar, argumentar). Referencia IDs del catálogo de L1.

### Fase 7 — Registro
- `lib/modulos.ts`: agregar `cierreId` al tema y el ID a `IDS_CIERRE`.
- `docs/mapa-modulos-m1.md`: actualizar estado del módulo.
- Si existe `scripts/auditar-leccion.mjs` con una tabla `MODULO_POR_LECCION`, agrega ahí las lecciones nuevas para evitar advertencias 🟡 innecesarias.
- Verifica que la ruta de cierre resuelve (no reimplementes routing si ya existe infraestructura para múltiples cierres).

### Fase 8 — Validación y commits
- `npm run validar` y `npm run auditar` hasta verde. Pega salida cruda completa de la última corrida.
- Verifica a mano con `node -e`, salida cruda: (a) cada archivo embebe exactamente el subconjunto de `catalogoErrores` que sus propios distractores referencian —ni de más (🔴 `catalogo-sin-usar`) ni de menos (🔴 `catalogo-colgando`)—, copiado carácter a carácter desde donde la entrada nació; (b) todo `errorCatalogado` resuelve contra el catálogo del **propio** archivo; (c) clave `itemsPAES` en lecciones, `items` en cierre; (d) ningún archivo tiene campo `estado`.
- Commits de propósito único, en orden: arquitectura → L1 → L2 → L3 → cierre → registro.
- Reporte final: archivos creados con ruta, hashes de commits nuevos, total de commits ahead de origin, decisiones propias que Benja debería revisar.

**NO hagas push. NO marques nada como publicable.**

## 4. Auditoría (hilo `/clear` nuevo, separado de la construcción)

```
Antes de nada, corre y confirma con salida cruda:
git status
git log --oneline -1
[dir/ls de los archivos del módulo]

Los N archivos existen: [listar rutas]. No los generaste tú; trátalos como material ajeno.

Ronda 1 — Matemática: lee .claude/agents/revisor-matematico.md (verifica el nombre exacto del archivo primero) y ejecuta sus instrucciones directamente en este hilo sobre los archivos. Recalcula TODO desde cero con node -e, sin confiar en solucion/esCorrecta escritos.

Ronda 2 — Originalidad: lee .claude/agents/auditor-originalidad.md (si no existe, dilo y detente). Ejecuta sus instrucciones sobre los mismos archivos. Si el hook de aislamiento de fuentes te bloquea la lectura profunda, repórtalo como NO CERTIFICABLE en ese punto específico — no lo simules ni lo omitas. Si Benja ya verificó manualmente algún contexto vía consultar-fuentes.mjs y está documentado en proveniencia/_notasInternas, tómalo como ya verificado y no lo vuelvas a marcar NO CERTIFICABLE.

Entrega por ronda: APROBADA o RECHAZADA, con hallazgos exactos y ubicación precisa si RECHAZADA. No corrijas nada en este hilo.
```

Si RECHAZADA: arma un prompt de corrección específico por hallazgo (ubicación exacta, qué está mal, qué mecanismo debe cumplir), en un hilo de trabajo normal. Luego `/clear` de nuevo y repite la auditoría COMPLETA (los 4 archivos, ambas rondas) — no solo el diff.

Si APROBADA ambas rondas: reporta a Benja y espera confirmación explícita antes de cualquier `git push`.

## 5. Cuándo escalar al chat de Claude (fuera de CC)

- PARADA 1 (candidatos de colisión) — siempre.
- Cualquier error o ID de catálogo nuevo que no exista y necesites proponer.
- Cualquier señal de estar en el repo/checkout equivocado, o de haber "perdido" commits (antes de cualquier operación git destructiva).
- Auditoría RECHAZADA — reportar hallazgos crudos para armar el prompt de corrección.
- Cualquier decisión de arquitectura (ej. cómo arreglar el bug cross-file de catalogoErrores) — no la implementes solo.
- Antes de cualquier `git push`.

Fuera de estos puntos, ejecuta las fases de corrido sin pedir un prompt nuevo por cada paso.
