#!/usr/bin/env bash
# ============================================================
#  Instalador del kit Claude Code — Plataforma M1 (MOS v2)
#  Ejecutar en la RAÍZ del proyecto Next.js:  bash instalar-kit.sh
#  Es texto plano: puedes leer abajo exactamente qué archivos crea.
# ============================================================
set -euo pipefail

if [ -f "CLAUDE.md" ] && [ "${1:-}" != "--forzar" ]; then
  echo "Ya existe CLAUDE.md en esta carpeta. Para reemplazar el kit: bash instalar-kit.sh --forzar"
  exit 1
fi

echo "Creando el kit (14 archivos)..."

# ---------- CLAUDE.md ----------
cat > 'CLAUDE.md' << 'FIN_ARCHIVO_KIT_M1'
# Plataforma M1 — Reglas de operación para Claude Code

Eres el cofundador técnico de una plataforma de aprendizaje interactivo de Matemática M1 (PAES, Chile). La fuente de verdad del proyecto es `docs/mos-v2.md` (Master Operating System v2). Este archivo es su resumen operativo: ante dudas de alcance, estrategia o prioridades, lee el MOS antes de decidir. El MOS manda y reemplaza a cualquier prompt anterior.

## Rol
- Cofundador crítico: señala riesgos, contradicciones y alternativas más simples. Cero validación vacía.
- Toda tarea nueva debe declarar qué incertidumbre reduce (apuesta pedagógica o comercial, MOS §2). Si no reduce ninguna, recházala y explica por qué.
- Para decisiones de producto o estrategia usa la estructura: objetivo → hipótesis → riesgos → alternativas → recomendación → próximo paso.

## Alcance v1 (construir SOLO esto)
- Módulo de funciones lineales y afines: diagnóstico (5 ítems) → 4 lecciones → cierre (8 ítems formato PAES).
- Lección 2 lleva la interacción insignia: gráfico interactivo con sliders de pendiente e intercepto.
- Stack: Next.js (App Router, TypeScript), contenido en JSON dentro de `content/`, deploy en Vercel, analítica con PostHog. Sin backend, sin login, sin pagos automatizados; acceso al piloto por link.

## Lista negra (NO construir; requiere cruzar un gate, ver MOS §9–10)
Tutor IA o cualquier LLM en producción, autenticación, pagos automatizados, repetición espaciada, gamificación, grafo de conocimiento, pipeline de descomposición de guías, motor de variantes, dashboard del estudiante, app móvil, video, M2 u otras materias.
Si el usuario lo pide, recuérdale el gate correspondiente antes de escribir una línea de código.

## Reglas de contenido (innegociables)
1. Cada lección sigue los 10 pasos en este orden exacto: `curiosidad, problema, pensar, pistas, descubrimiento, generalizacion, practica, aplicacion, reflexion, consolidacion`.
2. Cada lección cierra con 2–3 ítems originales formato PAES M1: selección múltiple, respuesta única, 4 alternativas (A–D), habilidad etiquetada (`resolver`, `modelar`, `representar` o `argumentar`).
3. Cada alternativa incorrecta lleva feedback escrito a mano que explica el error específico que la produce. Nunca feedback generado en vivo.
4. Prohibido copiar, parafrasear o "inspirarse de cerca" en ítems DEMRE o material de terceros. DEMRE se usa solo para calibrar temario y formato. Si se analizó material externo, se aplicó clean-room (MOS §7.2): solo capa abstracta, nunca texto, ejemplos ni diagramas.
5. Todo archivo de contenido lleva `proveniencia` (fuentes de análisis + declaración de originalidad) y solo pasa a `"estado": "publicable"` con el checklist de originalidad (MOS §7.3) y la revisión matemática aprobadas. Ante duda razonable: se descarta y se crea de nuevo.
6. "PAES" y "DEMRE" solo en uso descriptivo; nunca en el nombre del producto ni sugiriendo afiliación.
7. Los usuarios son menores de edad: nada de nombres reales completos, RUT ni otra PII en código, contenido, eventos ni logs. Analítica anónima (MOS §7.5).

## Prioridades ante conflictos (MOS §11)
1 legal · 2 validación · 3 aprendizaje · 4 UX · 5 simplicidad · 6 iteración · 7 escalabilidad · 8 optimización.
Nunca sacrifiques una superior por una inferior. En la práctica: código aburrido y simple gana; nada de abstracciones "para el futuro".

## Convenciones técnicas
- Contenido en `content/lecciones/*.json`, `content/diagnostico.json` y `content/cierre.json`, conforme a `content/schema/leccion.schema.json`. Los archivos que empiezan con `_` son plantillas y no se validan.
- `npm run validar` debe pasar siempre. Un hook de Claude Code lo ejecuta automáticamente tras cada edición de contenido: si reporta errores, corrígelos antes de seguir. No desactives el hook.
- Estados del contenido = niveles de exigencia del validador: `borrador` (estructura básica, libertad para redactar) → `revision` (contrato completo: todos los campos, feedback en cada distractor) → `publicable` (checklist de originalidad + revisión matemática aprobadas, sin placeholders).
- Eventos PostHog, nombres exactos y nada más: `leccion_inicio`, `paso_inicio` (paso), `item_respuesta` (item_id, correcta, intento, tiempo_ms), `pista_usada` (paso), `leccion_fin`, `solicitud_siguiente_leccion`. Cualquier cambio a esta lista se hace primero aquí.
- Sin dependencias nuevas sin justificar qué incertidumbre reducen. Preferir cero dependencias.
- Matemática: toda solución se verifica recalculando desde cero. Antes de dar por lista una lección: `/revision-matematica` y `/revision-originalidad`. Un error matemático publicado destruye la confianza del mercado.
- Commits pequeños y frecuentes, mensajes en español. `npm run validar` y `npm run lint` en verde antes de cada commit.

## Flujo de sesión
1. Abre cada sesión con `/sesion`: si no hay entregable concreto ni dato nuevo, la sesión se cancela (regla de uso del MOS).
2. Features: primero plan mode, revisar el plan, luego ejecutar.
3. Contenido nuevo: `/nueva-leccion` → redactar → `/revision-matematica` → `/revision-originalidad` → publicable.
4. `/clear` entre tareas no relacionadas.
FIN_ARCHIVO_KIT_M1
echo "  + CLAUDE.md"

# ---------- SETUP.md ----------
cat > 'SETUP.md' << 'FIN_ARCHIVO_KIT_M1'
# SETUP — Plataforma M1 con Claude Code en Antigravity

Guía única de instalación y de flujos de trabajo. Léela una vez completa; después solo vas a necesitar la sección 5.

---

## 0. Qué es este kit

Archivos que convierten el MOS v2 en reglas ejecutables de Claude Code:

```
CLAUDE.md                          ← memoria de proyecto: Claude Code la lee en CADA sesión
SETUP.md                           ← esta guía
docs/mos-v2.md                     ← fuente de verdad (el MOS completo)
.claude/settings.json              ← permisos + hook que valida contenido tras cada edición
.claude/commands/sesion.md         ← /sesion: abre sesión con la regla del MOS (entregable o se cancela)
.claude/commands/nueva-leccion.md  ← /nueva-leccion: esqueleto de lección con los 10 pasos
.claude/commands/items-paes.md     ← /items-paes: ítems originales formato PAES M1
.claude/commands/revision-matematica.md   ← /revision-matematica: auditoría matemática independiente
.claude/commands/revision-originalidad.md ← /revision-originalidad: checklist legal MOS §7.3
.claude/agents/revisor-matematico.md      ← subagente que recalcula todo desde cero
.claude/agents/auditor-originalidad.md    ← subagente que busca razones para NO publicar
content/schema/leccion.schema.json ← contrato de todo archivo de contenido
content/lecciones/_esqueleto.json  ← plantilla de lección (no se valida: empieza con "_")
scripts/validar-contenido.mjs      ← validador cero-dependencias (manual + hook)
```

La idea central: **las reglas del proyecto no viven en tu memoria ni en prompts pegados; viven en el repo.** Cada sesión de Claude Code arranca ya sabiendo el alcance, la lista negra, el protocolo legal y el flujo de contenido.

---

## 1. Requisitos

- **Node.js 18 o superior** y **git** (`node --version`, `git --version`).
- **Cuenta de Claude con plan de pago** (Pro, Max o Team) **o** una API key de Anthropic con créditos. Claude Code no funciona con la cuenta gratis.
- **Antigravity** instalado (antigravity.google) con tu cuenta de Google.

## 2. Instalar Claude Code

macOS / Linux / WSL (instalador nativo, recomendado):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows (PowerShell):
```powershell
irm https://claude.ai/install.ps1 | iex
```

Alternativa en cualquier sistema con Node:
```bash
npm install -g @anthropic-ai/claude-code
```

Verifica y autentica:
```bash
claude --version
claude          # la primera vez te pide iniciar sesión con tu cuenta de Claude
```

Si algo difiere de esta guía, la referencia viva es https://docs.claude.com/en/docs/claude-code/overview — Claude Code se actualiza seguido. `claude doctor` diagnostica problemas de instalación.

## 3. Crear el proyecto

```bash
# 1. Crear la app Next.js (acepta TypeScript, App Router, ESLint; sin src/ es más simple)
npx create-next-app@latest plataforma-m1
cd plataforma-m1

# 2. Poner instalar-kit.sh en esta carpeta (descárgalo del chat) y ejecutar:
bash instalar-kit.sh
```

El instalador crea los 14 archivos del kit (incluida la carpeta oculta `.claude/`), agrega el script `"validar"` a tu `package.json` automáticamente y ejecuta una autoprueba del validador. Es un script de texto plano: puedes abrirlo y leer exactamente qué crea antes de correrlo. Si ya existe un `CLAUDE.md` en la carpeta, se detiene para no sobrescribir nada (usa `bash instalar-kit.sh --forzar` si quieres reemplazar).

Deja el primer commit:
```bash
npm run validar
git add -A && git commit -m "kit inicial: reglas MOS v2 para Claude Code"
```

## 4. Antigravity + Claude Code: cómo conviven

Antigravity está construido sobre VS Code, así que hay dos formas de usar Claude Code adentro; funcionan igual con este kit porque todo vive en archivos del repo:

1. **Terminal integrada (recomendada para empezar):** abre la carpeta `plataforma-m1` en Antigravity, abre la terminal (`` Ctrl+` ``) y ejecuta `claude`. Claude Code detecta `CLAUDE.md`, `.claude/commands/` y `.claude/agents/` automáticamente.
2. **Extensión Claude Code:** instálala desde el marketplace de extensiones dentro de Antigravity si prefieres el panel visual.

**Regla de convivencia (importante):** en este proyecto hay dos agentes disponibles — el de Antigravity (Gemini) y Claude Code. **Solo uno escribe archivos a la vez.** Uso recomendado:

- **Claude Code = ejecutor principal.** Es quien conoce el MOS (vía CLAUDE.md), corre el validador y usa los subagentes de revisión. Todo el contenido pedagógico y el código pasan por él.
- **Antigravity/Gemini = editor, lectura y segunda opinión.** Úsalo para navegar código, revisar diffs o pedir una opinión alternativa sobre un plan. Si le pides que escriba, primero cierra lo que Claude Code tenga a medias y haz commit.
- **Commits frecuentes** son tu red de seguridad: si un agente rompe algo, `git checkout` te devuelve al último estado bueno.

## 5. Flujo de trabajo estándar (el corazón del sistema)

**Toda sesión:**
1. `claude` en la terminal del proyecto.
2. `/sesion <qué quieres lograr hoy>` — el comando aplica la regla del MOS: si no hay entregable concreto ni dato nuevo, la sesión se cancela. Si es válida, Claude propone un plan corto y espera tu confirmación.
3. `/clear` al cambiar a una tarea no relacionada (mantiene el contexto limpio y barato).

**Para features de código (el runner de lecciones, la landing, PostHog):**
1. Activa plan mode (Shift+Tab) y describe la feature. Revisa el plan ANTES de que toque archivos.
2. Ejecuta. El hook corre el validador tras cada edición de contenido automáticamente.
3. Cierre: `npm run validar` y `npm run lint` en verde → commit.

**Para contenido (lecciones e ítems) — el pipeline con doble revisión:**
```
/nueva-leccion l1-patrones-de-cambio
        ↓  (redactar; estado "borrador" = libertad, el validador solo exige estructura)
cambiar a "estado": "revision"
        ↓  (el validador ahora exige el contrato completo: campos, feedback por distractor)
/revision-matematica content/lecciones/l1-patrones-de-cambio.json
        ↓  (subagente independiente recalcula TODO desde cero)
/revision-originalidad content/lecciones/l1-patrones-de-cambio.json
        ↓  (checklist MOS §7.3, marcas, datos personales)
cambiar a "estado": "publicable"  → el validador verifica que ambas revisiones estén aprobadas
```
El validador es gradual a propósito: en `borrador` no te molesta mientras redactas; en `publicable` no deja pasar nada sin checklist, revisión matemática y feedback artesanal real en cada distractor.

**Contexto útil:** escribe `@content/lecciones/l1.json` o `@docs/mos-v2.md` en el prompt para incluir archivos exactos. Es mejor que pegar texto.

## 6. Primeras tres sesiones sugeridas (Gate 1)

Cada una produce un entregable, como exige el MOS. Ojo: la **preventa (Test A) corre en paralelo desde el día uno y no necesita código** — es un párrafo, un precio y un número de contacto por tu canal de confianza. No la pongas detrás de ninguna sesión técnica: el orden real de riesgo es distribución → pago → eficacia (MOS §6).

1. **Sesión 1 — Lección 1 en borrador.** `/sesion` → `/nueva-leccion l1-patrones-de-cambio` → definir el insight del paso "descubrimiento" → redactar los 10 pasos. Entregable: `l1-patrones-de-cambio.json` en estado `revision`.
2. **Sesión 2 — Runner de lecciones.** Plan mode: componente Next.js que lee un JSON de lección y renderiza los pasos con navegación y feedback por alternativa. Entregable: lección 1 navegable en `localhost`.
3. **Sesión 3 — Instrumentación + deploy.** PostHog con los eventos exactos de CLAUDE.md, deploy en Vercel, link privado listo para el piloto. Entregable: URL funcionando.

## 7. Problemas comunes

- **El hook reclama mientras redactas contenido** → revisa el mensaje: en estado `borrador` solo exige tipo/estado/orden de pasos válidos. Si de verdad estorba, coméntalo conmigo antes de tocar `.claude/settings.json`; quitarlo elimina la red de seguridad.
- **Claude Code propone construir algo de la lista negra** → CLAUDE.md ya lo frena, pero si insiste, responde "gate" y pídele releer `docs/mos-v2.md §9-10`.
- **Permisos: pregunta demasiado o muy poco** → `/permissions` dentro de Claude Code muestra y edita las reglas activas (vienen de `.claude/settings.json`).
- **Diagnóstico general** → `claude doctor`.
- **Los comandos / no aparecen** → verifica que `.claude/` se copió a la raíz (es carpeta oculta) y reinicia la sesión de Claude Code.
FIN_ARCHIVO_KIT_M1
echo "  + SETUP.md"

# ---------- .claude/settings.json ----------
mkdir -p '.claude'
cat > '.claude/settings.json' << 'FIN_ARCHIVO_KIT_M1'
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Bash(npm run validar:*)",
      "Bash(npm run validar)",
      "Bash(npm run dev:*)",
      "Bash(npm run build:*)",
      "Bash(npm run lint:*)",
      "Bash(npm test:*)",
      "Bash(node scripts/validar-contenido.mjs:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/scripts/validar-contenido.mjs\" --hook"
          }
        ]
      }
    ]
  }
}
FIN_ARCHIVO_KIT_M1
echo "  + .claude/settings.json"

# ---------- .claude/agents/auditor-originalidad.md ----------
mkdir -p '.claude/agents'
cat > '.claude/agents/auditor-originalidad.md' << 'FIN_ARCHIVO_KIT_M1'
---
name: auditor-originalidad
description: Auditor de originalidad, marcas y datos personales según el protocolo legal del MOS §7. Usar antes de publicar cualquier contenido.
tools: Read, Grep, Glob
---
Eres el auditor legal-operativo del proyecto. Tu misión es encontrar razones para NO publicar; el contenido debe ganarse la publicación. Trabajas sobre el protocolo de docs/mos-v2.md §7.

Verifica, citando evidencia del archivo:
1. Checklist §7.3 completo: enunciados y ejercicios sin similitud sustancial con fuentes conocidas (cambiar palabras o números NO basta); diagramas y visualizaciones con composición propia; secuencia interna que no copie la estructura expresiva de una guía específica; proveniencia registrada con declaración de originalidad.
2. Marcas: "PAES" y "DEMRE" solo en uso descriptivo. Nada que sugiera afiliación con DEMRE, la Universidad de Chile ni preuniversitarios.
3. Datos personales: cero nombres reales completos, RUT, contactos u otra PII en enunciados, ejemplos o metadatos. Los usuarios son menores de edad: estándar máximo.
4. Calidad de publicación: sin placeholders (TODO, PENDIENTE, lorem) y con feedback artesanal presente en todos los distractores.

Veredicto final: PUBLICABLE o NO PUBLICAR + lista de bloqueos. Regla del MOS: ante duda razonable, NO PUBLICAR y proponer crear de nuevo. No eres abogado y lo dices: la revisión con abogado/a de PI sigue siendo obligatoria antes del lanzamiento público (MOS §7.8).
FIN_ARCHIVO_KIT_M1
echo "  + .claude/agents/auditor-originalidad.md"

# ---------- .claude/agents/revisor-matematico.md ----------
mkdir -p '.claude/agents'
cat > '.claude/agents/revisor-matematico.md' << 'FIN_ARCHIVO_KIT_M1'
---
name: revisor-matematico
description: Auditor matemático independiente para contenido de M1. Usar proactivamente antes de marcar cualquier lección o ítem como publicable.
tools: Read, Grep, Glob, Bash
---
Eres un profesor de matemática experto en la PAES de Competencia Matemática 1 (Chile). Tu único trabajo es encontrar errores matemáticos antes de que lleguen a un estudiante: un solo error publicado destruye la confianza en el producto.

Método, en este orden:
1. Lee el archivo de contenido indicado.
2. Para cada ítem: resuelve el problema desde cero SIN leer la solución escrita ni mirar qué alternativa está marcada como correcta. Puedes usar Bash con node para verificar cálculos numéricos.
3. Recién entonces compara: ¿tu resultado coincide con la alternativa marcada como correcta y con la solución escrita?
4. Para cada distractor: reconstruye el error que lo produce y verifica que coincide con lo que su feedback describe. Un distractor que no proviene de un error plausible, o un feedback que describe otro error, es un hallazgo.
5. Revisa dominio y rango, unidades, redondeos, consistencia de datos del enunciado, y que ninguna pregunta tenga dos respuestas defendibles.

Reporta una tabla: ítem | veredicto (OK / ERROR / DUDOSO) | hallazgo y corrección propuesta. Sé implacable: si dudas, es DUDOSO, nunca OK. No corrijas el archivo tú mismo salvo que te lo pidan explícitamente; tu valor es el juicio independiente.
FIN_ARCHIVO_KIT_M1
echo "  + .claude/agents/revisor-matematico.md"

# ---------- .claude/commands/items-paes.md ----------
mkdir -p '.claude/commands'
cat > '.claude/commands/items-paes.md' << 'FIN_ARCHIVO_KIT_M1'
---
description: Redacta ítems originales en formato PAES M1 para un concepto dado
---
Redacta ítems originales en formato PAES M1 según: $ARGUMENTS (indica concepto y cantidad; por defecto 3).

Formato PAES M1: selección múltiple con respuesta única y 4 alternativas (A–D). Para cada ítem entrega, en el formato `item` del schema (`content/schema/leccion.schema.json`):
- habilidad evaluada: resolver, modelar, representar o argumentar (varía entre ítems),
- dificultad: baja, media o alta,
- enunciado con contexto realista chileno cuando aplique,
- 4 alternativas donde cada distractor encarna un error frecuente y documentado del concepto,
- feedback artesanal por distractor: nombra el error y reorienta sin regalar la respuesta,
- solución paso a paso verificada recalculando desde cero.

Prohibido: parecerse a ítems DEMRE o de terceros, usar datos personales reales, sugerir afiliación con marcas. Al final, autoevalúa cada ítem contra el checklist de originalidad del MOS §7.3 y declara el veredicto.
FIN_ARCHIVO_KIT_M1
echo "  + .claude/commands/items-paes.md"

# ---------- .claude/commands/nueva-leccion.md ----------
mkdir -p '.claude/commands'
cat > '.claude/commands/nueva-leccion.md' << 'FIN_ARCHIVO_KIT_M1'
---
description: Crea el esqueleto de una lección nueva conforme al schema y a los 10 pasos
---
Crea una lección nueva a partir de: $ARGUMENTS (usa un id corto en kebab-case, p. ej. l1-patrones-de-cambio).

Pasos:
1. Lee `content/schema/leccion.schema.json` y `content/lecciones/_esqueleto.json`.
2. Crea `content/lecciones/<id>.json` con los 10 pasos en orden, `"estado": "borrador"`, 2–3 ítems PAES con estructura completa (4 alternativas A–D, una sola correcta) y los bloques de proveniencia, checklist y revisión matemática vacíos o en falso.
3. Antes de redactar contenido final, propone al usuario el enfoque pedagógico del paso "descubrimiento" (cuál es el insight que el estudiante debe construir por sí mismo) y espera aprobación.
4. Redacta paso por paso. Los ítems PAES deben ser 100% originales, con contexto realista y feedback artesanal por cada distractor explicando el error específico que lo produce.
5. Ejecuta `npm run validar` y lista qué campos quedan pendientes.

Recuerda: nada de material DEMRE ni de terceros. Ante duda de originalidad, se descarta y se crea de nuevo.
FIN_ARCHIVO_KIT_M1
echo "  + .claude/commands/nueva-leccion.md"

# ---------- .claude/commands/revision-matematica.md ----------
mkdir -p '.claude/commands'
cat > '.claude/commands/revision-matematica.md' << 'FIN_ARCHIVO_KIT_M1'
---
description: Auditoría matemática independiente de una lección o set de ítems
---
Lanza el subagente `revisor-matematico` para auditar: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente debe: recalcular cada solución desde cero sin mirar la solución escrita; verificar que la alternativa marcada como correcta lo es; comprobar que cada distractor es incorrecto exactamente por el error que su feedback describe; revisar unidades, dominios, casos borde y consistencia de los datos del enunciado.

Entrega una tabla ítem → veredicto → hallazgos. Solo si todo está correcto, actualiza `revisionMatematica` en el JSON (aprobada: true, revisadoPor: "revisor-matematico", fecha de hoy). Cualquier discrepancia bloquea el estado publicable y se corrige antes de cerrar la sesión.
FIN_ARCHIVO_KIT_M1
echo "  + .claude/commands/revision-matematica.md"

# ---------- .claude/commands/revision-originalidad.md ----------
mkdir -p '.claude/commands'
cat > '.claude/commands/revision-originalidad.md' << 'FIN_ARCHIVO_KIT_M1'
---
description: Aplica el checklist de originalidad y el protocolo legal (MOS §7) antes de publicar
---
Lanza el subagente `auditor-originalidad` sobre: $ARGUMENTS (ruta del archivo JSON de contenido).

El subagente aplica las 4 preguntas del checklist del MOS §7.3:
1. ¿Algún enunciado o ejercicio es sustancialmente similar a una fuente conocida, aunque cambien palabras o números?
2. ¿Algún diagrama o visualización replica la composición de uno existente?
3. ¿La secuencia interna copia la estructura expresiva de una guía específica, más allá del orden lógico natural?
4. ¿Queda registrada la proveniencia (fuentes de análisis + declaración de originalidad)?

Además verifica: uso solo descriptivo de "PAES" y "DEMRE", ausencia de datos personales, y feedback artesanal escrito en todos los distractores (nada de placeholders).

Regla dura: ante duda razonable, el veredicto es NO PUBLICAR, con una alternativa propuesta. Si aprueba, actualiza `checklistOriginalidad` en el JSON con revisadoPor y fecha.
FIN_ARCHIVO_KIT_M1
echo "  + .claude/commands/revision-originalidad.md"

# ---------- .claude/commands/sesion.md ----------
mkdir -p '.claude/commands'
cat > '.claude/commands/sesion.md' << 'FIN_ARCHIVO_KIT_M1'
---
description: Abre una sesión de trabajo aplicando la regla del MOS (entregable o dato nuevo, o se cancela)
---
Vas a abrir una sesión de trabajo de la Plataforma M1. Antes de tocar código o contenido, establece con el usuario:

1. ¿Qué entregable concreto produce esta sesión, o qué dato nuevo aporta?
2. ¿Qué incertidumbre reduce (apuesta pedagógica o comercial, MOS §2)?
3. ¿En qué gate estamos y qué falta para cruzarlo? (si no lo tienes claro, lee docs/mos-v2.md §10)

Si la respuesta a la pregunta 1 es vaga o no existe, recomienda cancelar la sesión citando la regla de uso del MOS y no avances con trabajo especulativo.

Si la sesión es válida, propone un plan corto (máximo 5 pasos, cada uno verificable) y pide confirmación antes de ejecutar.

Contexto entregado por el usuario: $ARGUMENTS
FIN_ARCHIVO_KIT_M1
echo "  + .claude/commands/sesion.md"

# ---------- content/lecciones/_esqueleto.json ----------
mkdir -p 'content/lecciones'
cat > 'content/lecciones/_esqueleto.json' << 'FIN_ARCHIVO_KIT_M1'
{
  "tipo": "leccion",
  "id": "lx-nombre-corto-en-kebab-case",
  "titulo": "",
  "objetivo": "Qué será capaz de hacer el estudiante al terminar (verbo observable, no 'entender')",
  "tiempoEstimadoMin": 20,
  "prerrequisitos": [],
  "conceptos": [],
  "estado": "borrador",
  "pasos": [
    {
      "tipo": "curiosidad",
      "titulo": "",
      "_nota": "Gancho breve: un fenómeno, pregunta o situación que el estudiante quiera resolver. Sin teoría todavía.",
      "bloques": [{ "tipo": "texto", "contenido": "" }]
    },
    {
      "tipo": "problema",
      "titulo": "",
      "_nota": "Un problema concreto y original que el concepto resuelve. El estudiante aún no tiene la herramienta.",
      "bloques": [{ "tipo": "pregunta", "contenido": "" }]
    },
    {
      "tipo": "pensar",
      "titulo": "",
      "_nota": "Espacio para intentar. Pregunta abierta o de opción; se registra el intento antes de ayudar.",
      "bloques": [{ "tipo": "pregunta", "contenido": "" }]
    },
    {
      "tipo": "pistas",
      "titulo": "",
      "_nota": "2–3 pistas graduadas que reorientan sin regalar la respuesta.",
      "bloques": [{ "tipo": "pistas", "pistas": ["", ""] }]
    },
    {
      "tipo": "descubrimiento",
      "titulo": "",
      "_nota": "EL CORAZÓN DE LA LECCIÓN: el insight que el estudiante construye por sí mismo. Definir este paso ANTES de redactar el resto y validarlo con el usuario.",
      "bloques": [{ "tipo": "interactivo", "contenido": "" }]
    },
    {
      "tipo": "generalizacion",
      "titulo": "",
      "_nota": "Recién aquí se nombra y formaliza el concepto (definición, notación, fórmula).",
      "bloques": [{ "tipo": "texto", "contenido": "" }]
    },
    {
      "tipo": "practica",
      "titulo": "",
      "_nota": "Ejercicios cortos con feedback inmediato, dificultad progresiva.",
      "bloques": [{ "tipo": "pregunta", "contenido": "" }]
    },
    {
      "tipo": "aplicacion",
      "titulo": "",
      "_nota": "El concepto en un contexto realista distinto al del descubrimiento.",
      "bloques": [{ "tipo": "pregunta", "contenido": "" }]
    },
    {
      "tipo": "reflexion",
      "titulo": "",
      "_nota": "Metacognición: qué cambió en tu forma de ver el problema inicial.",
      "bloques": [{ "tipo": "pregunta", "contenido": "" }]
    },
    {
      "tipo": "consolidacion",
      "titulo": "",
      "_nota": "Síntesis breve + puente explícito al formato PAES (los itemsPAES de abajo).",
      "bloques": [{ "tipo": "texto", "contenido": "" }]
    }
  ],
  "itemsPAES": [
    {
      "id": "item-1",
      "habilidad": "resolver",
      "dificultad": "media",
      "enunciado": "",
      "alternativas": [
        { "clave": "A", "texto": "", "esCorrecta": false, "feedback": "" },
        { "clave": "B", "texto": "", "esCorrecta": true, "feedback": "" },
        { "clave": "C", "texto": "", "esCorrecta": false, "feedback": "" },
        { "clave": "D", "texto": "", "esCorrecta": false, "feedback": "" }
      ],
      "solucion": ""
    },
    {
      "id": "item-2",
      "habilidad": "representar",
      "dificultad": "media",
      "enunciado": "",
      "alternativas": [
        { "clave": "A", "texto": "", "esCorrecta": true, "feedback": "" },
        { "clave": "B", "texto": "", "esCorrecta": false, "feedback": "" },
        { "clave": "C", "texto": "", "esCorrecta": false, "feedback": "" },
        { "clave": "D", "texto": "", "esCorrecta": false, "feedback": "" }
      ],
      "solucion": ""
    }
  ],
  "proveniencia": {
    "fuentesAnalisis": ["Temario oficial DEMRE M1 (solo calibración de formato y cobertura)"],
    "declaracionOriginalidad": "",
    "autor": "",
    "fecha": ""
  },
  "checklistOriginalidad": {
    "enunciadosOriginales": false,
    "diagramasOriginales": false,
    "secuenciaOriginal": false,
    "provenienciaRegistrada": false,
    "revisadoPor": "",
    "fecha": ""
  },
  "revisionMatematica": {
    "aprobada": false,
    "revisadoPor": "",
    "fecha": ""
  }
}
FIN_ARCHIVO_KIT_M1
echo "  + content/lecciones/_esqueleto.json"

# ---------- content/schema/leccion.schema.json ----------
mkdir -p 'content/schema'
cat > 'content/schema/leccion.schema.json' << 'FIN_ARCHIVO_KIT_M1'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "leccion.schema.json",
  "title": "Contenido Plataforma M1 (lección, diagnóstico o cierre)",
  "$comment": "Este schema describe el contrato COMPLETO (lo que debe cumplir un archivo publicable). El validador (scripts/validar-contenido.mjs) aplica exigencia gradual según 'estado': borrador = estructura básica; revision = contrato completo; publicable = además checklist de originalidad, revisión matemática y cero placeholders. Los archivos cuyo nombre empieza con '_' son plantillas y no se validan.",
  "type": "object",
  "required": ["tipo", "id", "titulo", "estado", "proveniencia"],
  "properties": {
    "tipo": { "enum": ["leccion", "diagnostico", "cierre"] },
    "id": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$", "description": "kebab-case, p. ej. l2-pendiente-intercepto" },
    "titulo": { "type": "string", "minLength": 1 },
    "estado": {
      "enum": ["borrador", "revision", "publicable"],
      "description": "Nivel de madurez. Solo 'publicable' puede mostrarse a estudiantes."
    },
    "objetivo": { "type": "string", "description": "Qué será capaz de hacer el estudiante al terminar (solo lecciones)" },
    "tiempoEstimadoMin": { "type": "number", "exclusiveMinimum": 0 },
    "prerrequisitos": { "type": "array", "items": { "type": "string" } },
    "conceptos": { "type": "array", "items": { "type": "string" } },
    "pasos": {
      "type": "array",
      "minItems": 10,
      "maxItems": 10,
      "description": "Exactamente 10 pasos, en este orden pedagógico fijo (MOS §4)",
      "items": { "$ref": "#/definitions/paso" }
    },
    "itemsPAES": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "description": "Cierre de lección: 2–3 ítems originales formato PAES (solo lecciones)",
      "items": { "$ref": "#/definitions/item" }
    },
    "items": {
      "type": "array",
      "description": "Ítems del set: 5 para diagnostico, 8 para cierre",
      "items": { "$ref": "#/definitions/item" }
    },
    "proveniencia": { "$ref": "#/definitions/proveniencia" },
    "checklistOriginalidad": { "$ref": "#/definitions/checklistOriginalidad" },
    "revisionMatematica": { "$ref": "#/definitions/revisionMatematica" }
  },
  "definitions": {
    "paso": {
      "type": "object",
      "required": ["tipo", "titulo", "bloques"],
      "properties": {
        "tipo": {
          "enum": ["curiosidad", "problema", "pensar", "pistas", "descubrimiento", "generalizacion", "practica", "aplicacion", "reflexion", "consolidacion"]
        },
        "titulo": { "type": "string", "minLength": 1 },
        "bloques": {
          "type": "array",
          "minItems": 1,
          "description": "Unidades de pantalla. La forma interna es flexible mientras se itera la UI.",
          "items": {
            "type": "object",
            "required": ["tipo"],
            "properties": {
              "tipo": { "enum": ["texto", "pregunta", "interactivo", "visualizacion", "pistas"] }
            },
            "additionalProperties": true
          }
        }
      },
      "additionalProperties": true
    },
    "item": {
      "type": "object",
      "required": ["id", "habilidad", "dificultad", "enunciado", "alternativas", "solucion"],
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "habilidad": {
          "enum": ["resolver", "modelar", "representar", "argumentar"],
          "description": "Las 4 habilidades evaluadas por la PAES de Competencia Matemática"
        },
        "dificultad": { "enum": ["baja", "media", "alta"] },
        "enunciado": { "type": "string", "minLength": 1, "description": "100% original. Contexto realista cuando aplique. Jamás material DEMRE ni de terceros." },
        "alternativas": {
          "type": "array",
          "minItems": 4,
          "maxItems": 4,
          "description": "Formato PAES M1: exactamente 4 alternativas (A–D), respuesta única",
          "items": {
            "type": "object",
            "required": ["clave", "texto", "esCorrecta"],
            "properties": {
              "clave": { "enum": ["A", "B", "C", "D"] },
              "texto": { "type": "string", "minLength": 1 },
              "esCorrecta": { "type": "boolean" },
              "feedback": {
                "type": "string",
                "description": "OBLIGATORIO en distractores: feedback artesanal que nombra el error específico que produce esa alternativa y reorienta sin regalar la respuesta (MOS §4). Opcional en la correcta (refuerzo breve)."
              }
            },
            "additionalProperties": false
          }
        },
        "solucion": { "type": "string", "minLength": 1, "description": "Resolución paso a paso, verificada recalculando desde cero" }
      },
      "additionalProperties": false
    },
    "proveniencia": {
      "type": "object",
      "required": ["fuentesAnalisis", "declaracionOriginalidad"],
      "description": "Registro de proveniencia obligatorio (MOS §7.2)",
      "properties": {
        "fuentesAnalisis": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Qué fuentes se usaron SOLO para análisis/calibración (p. ej. 'temario DEMRE M1'). Nunca como origen de texto, ejemplos o diagramas."
        },
        "declaracionOriginalidad": { "type": "string", "description": "Declaración explícita de que todo el contenido fue creado desde cero" },
        "autor": { "type": "string" },
        "fecha": { "type": "string" }
      },
      "additionalProperties": false
    },
    "checklistOriginalidad": {
      "type": "object",
      "description": "Checklist MOS §7.3. Las 4 respuestas deben ser true (= sin problema) para publicar. Ante duda: no se publica.",
      "required": ["enunciadosOriginales", "diagramasOriginales", "secuenciaOriginal", "provenienciaRegistrada"],
      "properties": {
        "enunciadosOriginales": { "type": "boolean", "description": "Ningún enunciado/ejercicio es sustancialmente similar a una fuente conocida (cambiar palabras o números NO basta)" },
        "diagramasOriginales": { "type": "boolean", "description": "Ningún diagrama/visualización replica la composición de uno existente" },
        "secuenciaOriginal": { "type": "boolean", "description": "La secuencia interna no copia la estructura expresiva de una guía específica" },
        "provenienciaRegistrada": { "type": "boolean" },
        "revisadoPor": { "type": "string" },
        "fecha": { "type": "string" }
      },
      "additionalProperties": false
    },
    "revisionMatematica": {
      "type": "object",
      "description": "Revisión independiente: recalcular todo desde cero antes de publicar",
      "required": ["aprobada"],
      "properties": {
        "aprobada": { "type": "boolean" },
        "revisadoPor": { "type": "string" },
        "fecha": { "type": "string" }
      },
      "additionalProperties": false
    }
  }
}
FIN_ARCHIVO_KIT_M1
echo "  + content/schema/leccion.schema.json"

# ---------- docs/mos-v2.md ----------
mkdir -p 'docs'
cat > 'docs/mos-v2.md' << 'FIN_ARCHIVO_KIT_M1'
# Master Operating System v2
**Proyecto:** Plataforma de aprendizaje Matemática M1 (PAES)
**Fecha:** 5 de julio de 2026
**Estado:** Reemplaza al master prompt original. Este documento es la única fuente de verdad. El prompt anterior queda obsoleto y no debe volver a pegarse en ninguna conversación.

**Regla de uso:** las próximas sesiones de trabajo parten de datos o de un entregable concreto, no de este documento. Si una sesión no aporta datos nuevos ni produce un entregable, se cancela.

---

## 1. Tesis

Vendemos puntaje. Entregamos comprensión.

La comprensión es el mecanismo, no la promesa. El estudiante y su familia compran una sola cosa: más puntos en la PAES de fin de año. Nuestro método para lograrlo es el aprendizaje por descubrimiento, porque la PAES actual evalúa competencias (resolver problemas, modelar, representar, argumentar) y no memorización. Eso alinea comprensión con puntaje mucho más que en la era PSU, y es la razón por la que esta tesis puede funcionar hoy y no hace diez años.

Consecuencia de producto: el puente entre comprensión y puntaje debe ser visible en cada lección. Toda lección cierra con 2 o 3 ítems originales en formato PAES. El estudiante tiene que ver la transferencia, no creerla por fe.

El producto tiene dos capas. La capa núcleo es el aprendizaje interactivo. La segunda capa, más delgada y posterior, es ejecución de examen: manejo del tiempo, formato DEMRE, 65 preguntas en 2 horas 20. Negar esa capa por pureza pedagógica sería un error; se agrega cuando la capa núcleo esté validada.

## 2. Las cuatro apuestas

El proyecto son cuatro apuestas apiladas. Confundirlas es la fuente de casi todos los errores de planificación anteriores.

1. **Pedagógica:** el descubrimiento guiado produce mejor comprensión que el modelo preuniversitario. Se valida con el piloto.
2. **Comercial:** estudiantes bajo presión de puntaje (y sus apoderados) pagan por esto. Se valida con la preventa.
3. **De producción:** podemos fabricar contenido de calidad Brilliant a costo viable. No se valida ahora. Es un problema real, pero de una empresa que ya vendió.
4. **De sistema:** grafo de conocimiento, variantes generativas, multi-materia. No se valida ahora. Pertenece a los gates 3 en adelante.

El MVP existe para las apuestas 1 y 2. Cualquier trabajo que sirva a las apuestas 3 o 4 antes del Gate 2 se rechaza por defecto.

## 3. Cliente y segmento del piloto

Usuario: estudiante de 4° medio que rinde la PAES a fines de 2026. Quedan menos de cinco meses; la temporada es ahora. Comprador frecuente: el apoderado. El mensaje de venta habla de puntaje y le sirve a ambos.

Decisión de segmento: la preventa apunta a 4° medio porque es quien paga y quien define el mercado real. El piloto de aprendizaje puede incluir 3° medio, pero un resultado positivo solo con 3° medio no valida la apuesta comercial. Si el método no funciona con estudiantes a cinco meses del examen, el problema es del método, no de los estudiantes.

Canal inicial: confianza física. Colegio propio, compañeros de otros colegios, 2 o 3 profesores como puente. Es el canal que ya demostró convertir. TikTok e Instagram quedan para después: construir audiencia desde cero es una segunda startup y no se emprende ahora.

## 4. Producto: especificación del MVP v1

Cerrada. No se rediseña; se construye.

**Tema:** funciones lineales y afines. Micro-tema de entrada: pendiente como razón de cambio.

**Estructura:**
1. Diagnóstico de 5 ítems.
2. Lección 1: reconocimiento intuitivo de patrones de cambio constante.
3. Lección 2: pendiente e intercepto con gráfico interactivo de sliders (la interacción insignia).
4. Lección 3: traducción entre representaciones (tabla, gráfico, ecuación, enunciado).
5. Lección 4: modelamiento estilo PAES.
6. Cierre: 8 ítems en formato PAES.

Cada lección sigue la secuencia de 10 pasos (curiosidad, problema, pensar, pistas, descubrimiento, generalización, práctica, aplicación, reflexión, consolidación) y termina con 2 o 3 ítems formato PAES originales.

**Feedback:** artesanal, escrito a mano para cada distractor previsto. Sin LLM en vivo. Un error matemático de la plataforma destruye la confianza en este mercado, y el feedback pre-escrito es más barato, más rápido y más confiable. El tutor con IA es una funcionalidad del Gate 3.

**Stack:** Next.js, contenido en archivos JSON, deploy en Vercel, PostHog para eventos. Sin backend, sin login, sin pagos automatizados. El acceso al piloto se entrega por link.

**Excluido de v1:** tutor IA, autenticación, repetición espaciada, gamificación, grafo de conocimiento, pipeline de descomposición de guías, motor de variantes, app móvil, cualquier materia distinta de M1.

## 5. Modelo de negocio

Pase de temporada, pago único: "Plan PAES 2027". Sin suscripción mensual.

Razones: (a) el churn es del 100% por diseño, todos rinden y se van; (b) los ingresos se concentran entre marzo y noviembre; (c) la única evidencia de pago que tenemos son transferencias únicas por acceso, no suscripciones. La matemática SaaS mensual no aplica a este mercado y se elimina del vocabulario del proyecto.

Precio hipótesis para la cohorte fundadora: $19.990 CLP por el curso completo de funciones M1. Mínimo aceptable como señal: $15.000. Un precio simbólico no valida nada; ya lo comprobamos. Referencia de mercado: las familias gastan cientos de miles de pesos al año en preuniversitario, así que el precio no es la barrera, la confianza sí.

Cobro en fase piloto: transferencia manual. Automatizar pagos antes de 30 clientes viola la prioridad 5 (simplicidad).

## 6. Plan de validación

Dos tests en paralelo, no en secuencia. El orden real de riesgo es distribución, luego pago, luego eficacia, y el plan anterior lo testeaba al revés.

**Test A. Preventa (apuesta comercial).** Oferta: "Curso intensivo Funciones M1, cohorte fundadora, cupos limitados, parte el [fecha], $19.990". Un párrafo, un precio, un link o número para reservar. Canal de confianza. Duración: 3 semanas.
- 10 o más pagos reales: continuar y construir con urgencia.
- Entre 5 y 9: reposicionar oferta o precio y repetir una vez.
- Menos de 5: detenerse y revisar la tesis antes de escribir una línea más de código.

**Test B. Piloto de aprendizaje (apuesta pedagógica).** 15 a 20 estudiantes reales, presencial o por videollamada, con la lección 1 terminada.
- Pre y post con ítems isomorfos (mismo concepto, números y contexto distintos) para reducir el efecto test-retest.
- Señal positiva: mejora pre/post en al menos 60% de los estudiantes, tasa de término de la lección de 70% o más, y al menos la mitad pide la lección siguiente sin que se la ofrezcamos.
- Una pregunta abierta al final: "¿qué cambiarías?".
- Limitaciones asumidas: sin grupo de control y con N chico. El resultado es direccional, no una prueba científica, y así se reporta.

Ninguna funcionalidad nueva entra al backlog sin responder: qué incertidumbre elimina, cómo se mide, y qué umbral la mataría.

## 7. Protocolo legal

Objetivo honesto: no existe el riesgo legal cero. Existe riesgo minimizado, documentado y revisado por un profesional. Este protocolo no es asesoría legal; es la preparación para que la revisión legal sea corta y barata.

**7.1 Fuentes de contenido.**
- Fuente canónica: temario oficial de la PAES publicado por DEMRE más las formas liberadas de aplicaciones anteriores. Definen qué se evalúa, con qué formato y a qué profundidad. Son públicas pero no de dominio público: sirven para análisis y calibración, y ningún ítem, enunciado o gráfico de DEMRE se copia al producto.
- Guías de terceros (Pedro de Valdivia u otras): quedan degradadas a opcionales. El temario DEMRE ya entrega el mapa de contenidos sin zona gris. Si aun así se analizan, se aplica el proceso clean-room de 7.2.

**7.2 Proceso clean-room en dos fases.**
- Fase de análisis: de cualquier material de terceros se extrae solo la capa abstracta a un schema estructurado: conceptos, prerrequisitos, secuencia, habilidades, errores frecuentes, nivel de dificultad. Nunca texto, enunciados, ejemplos numéricos, diagramas ni soluciones.
- Fase de creación: quien escribe contenido trabaja únicamente desde el schema y el temario DEMRE, sin el material original a la vista.
- Registro de proveniencia: cada lección lleva una nota de qué fuentes de análisis se usaron y una declaración de originalidad.
- La ley chilena de propiedad intelectual (17.336) protege la expresión, no las ideas, los métodos ni las secuencias pedagógicas. Aun así, sus excepciones son más estrechas que el fair use estadounidense, por eso la regla operativa es la del documento original: ante duda razonable, se descarta y se crea de nuevo.

**7.3 Checklist de originalidad por lección, antes de publicar.**
1. ¿Algún enunciado o ejercicio es sustancialmente similar a una fuente conocida, aunque cambien palabras o números?
2. ¿Algún diagrama o visualización replica la composición de uno existente?
3. ¿La secuencia interna copia la estructura expresiva de una guía específica, más allá del orden lógico natural del contenido?
4. ¿Queda registrada la proveniencia?
Si alguna respuesta es dudosa, el contenido no se publica.

**7.4 Marcas.** "PAES" y "DEMRE" se usan solo de forma descriptiva ("preparación para la PAES"), nunca en el nombre del producto ni sugiriendo afiliación. Disclaimer permanente en el sitio: producto independiente, sin vínculo con DEMRE, la Universidad de Chile ni ningún preuniversitario.

**7.5 Datos personales.** Los usuarios serán en su mayoría menores de 18. Reglas desde el día uno:
- Minimización: para el piloto no se recolectan nombres completos, RUT ni datos sensibles. Analítica anonimizada.
- Consentimiento del apoderado para participantes menores de edad, por escrito aunque sea simple.
- La nueva ley de protección de datos (21.719) entra en vigencia el 1 de diciembre de 2026, justo en nuestra primera temporada de venta, con una agencia fiscalizadora ya operativa y multas altas. Las empresas pequeñas reciben amonestación en el primer año en vez de multa, pero diseñamos como si aplicara completa: inventario de qué datos guardamos, dónde, para qué y por cuánto tiempo, más política de privacidad y términos publicados antes de cobrar a desconocidos.

**7.6 Formalización.** Antes de cobrar fuera del círculo cercano: inicio de actividades ante el SII y boleta por cada venta. Si algún fundador es menor de 18 años, los actos legales (cuentas, contratos, formalización) requieren la participación de un adulto responsable; resolver esto es parte del Gate 1, no un detalle para después.

**7.7 Contenido asistido por IA.** El contenido se crea con asistencia de IA pero con autoría y curaduría humana documentada (borradores, decisiones, revisiones). Eso fortalece nuestra posición de titularidad y de originalidad.

**7.8 Hito obligatorio.** Revisión con abogado o abogada de propiedad intelectual en Chile antes del lanzamiento público. No es requisito para el piloto por canal de confianza, sí para vender abierto. Una consulta acotada con este protocolo ya preparado es un gasto chico.

## 8. Métricas e instrumentación

PostHog con eventos por pantalla: inicio, respuesta por ítem, uso de pistas, abandono por paso, tiempo por lección. Métricas que importan en esta fase: delta pre/post, tasa de término, punto exacto de abandono, y solicitudes espontáneas de la lección siguiente. Métricas prohibidas por ahora: MRR, DAU, retención mensual. Miden un negocio que todavía no existe y contaminan las decisiones.

## 9. Lo que no se construye todavía

Pipeline industrial de descomposición de guías, grafo de conocimiento, motor de variantes, tutor LLM, login, pagos automatizados, dashboard del estudiante, repetición espaciada, gamificación, app móvil, M2 y otras materias, contenido en video. Cada uno de estos ítems necesita pasar un gate y justificar qué incertidumbre elimina.

## 10. Gates del roadmap

- **Gate 1 (semanas 1 a 3):** preventa lanzada y lección 1 construida y testeada. Incluye resolver la formalización mínima.
- **Gate 2 (semanas 3 a 6):** piloto completo del módulo de funciones con la cohorte pagada. Umbrales de la sección 6 cumplidos.
- **Gate 3 (temporada 2026):** cohorte fundadora completa el curso, medimos su percepción de mejora en ensayos reales. Recién aquí se evalúan: segundo tema de M1, capa modo ensayo, tutor IA.
- **Gate 4 (2027):** decisión de escala con datos de una temporada completa: más temas, automatización, canal de distribución propio.

## 11. Reglas de trabajo

1. Toda decisión debe reducir incertidumbre; si no la reduce, no se toma todavía.
2. Orden de prioridades intacto: legal, validación, aprendizaje, UX, simplicidad, iteración, escalabilidad, optimización.
3. Ninguna sesión de estrategia sin datos nuevos.
4. La evidencia previa no se borra con un reset de proyecto: lo único que la gente nos ha pagado hasta hoy fue material curado cercano al examen. Esa señal se respeta y por eso cada lección conecta con formato PAES.
5. Este documento se actualiza solo cuando un gate se cruza o un test entrega resultados. No se reescribe por inquietud.
FIN_ARCHIVO_KIT_M1
echo "  + docs/mos-v2.md"

# ---------- scripts/validar-contenido.mjs ----------
mkdir -p 'scripts'
cat > 'scripts/validar-contenido.mjs' << 'FIN_ARCHIVO_KIT_M1'
#!/usr/bin/env node
/**
 * Validador de contenido — Plataforma M1
 * Cero dependencias. Node 18+.
 *
 * Uso:
 *   node scripts/validar-contenido.mjs                  valida todo content/
 *   node scripts/validar-contenido.mjs <ruta.json>      valida un archivo
 *   node scripts/validar-contenido.mjs --hook           modo hook de Claude Code
 *
 * Exigencia gradual según "estado":
 *   borrador   → estructura básica (tipo, estado, orden de los 10 pasos si existen)
 *   revision   → contrato completo (todos los campos, feedback en cada distractor)
 *   publicable → además: checklist de originalidad, revisión matemática,
 *                declaración de originalidad real y cero placeholders
 *
 * En modo hook lee el evento por stdin (tool_input.file_path) o CLAUDE_FILE_PATH.
 * Si el archivo editado es contenido y no valida, sale con código 2 para que
 * Claude Code reciba el error como feedback y lo corrija.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename, join, sep } from 'node:path';

const ORDEN_PASOS = [
  'curiosidad', 'problema', 'pensar', 'pistas', 'descubrimiento',
  'generalizacion', 'practica', 'aplicacion', 'reflexion', 'consolidacion',
];
const HABILIDADES = ['resolver', 'modelar', 'representar', 'argumentar'];
const DIFICULTADES = ['baja', 'media', 'alta'];
const CLAVES = ['A', 'B', 'C', 'D'];
const ITEMS_POR_TIPO = { leccion: [2, 3], diagnostico: [5, 5], cierre: [8, 8] };
const NIVEL = { borrador: 0, revision: 1, publicable: 2 };
// Solo marcadores explícitos en MAYÚSCULAS: en español "todo" y "pendiente" son
// palabras normales (¡"pendiente" es el concepto central del módulo!).
const PLACEHOLDERS = /\b(TODO|FIXME|PLACEHOLDER|XXX)\b|\[PENDIENTE\]|lorem ipsum/;
const MIN_FEEDBACK_PUBLICABLE = 40; // el feedback artesanal no puede ser un placeholder

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;

function validarItem(item, i, campo, nivel, errores) {
  const p = `${campo}[${i}]`;
  if (!esTexto(item?.id)) errores.push(`${p}: falta id`);
  if (!HABILIDADES.includes(item?.habilidad)) errores.push(`${p}: habilidad debe ser una de: ${HABILIDADES.join(', ')}`);
  if (!DIFICULTADES.includes(item?.dificultad)) errores.push(`${p}: dificultad debe ser una de: ${DIFICULTADES.join(', ')}`);
  if (!esTexto(item?.enunciado)) errores.push(`${p}: falta enunciado`);
  if (!esTexto(item?.solucion)) errores.push(`${p}: falta la solución paso a paso`);

  const alts = item?.alternativas;
  if (!Array.isArray(alts) || alts.length !== 4) {
    errores.push(`${p}: debe tener exactamente 4 alternativas A–D (formato PAES M1)`);
    return;
  }
  const claves = alts.map((a) => a?.clave);
  for (const c of CLAVES) if (!claves.includes(c)) errores.push(`${p}: falta la alternativa ${c}`);
  const correctas = alts.filter((a) => a?.esCorrecta === true);
  if (correctas.length !== 1) errores.push(`${p}: debe haber exactamente una alternativa correcta (hay ${correctas.length})`);
  for (const a of alts) {
    const q = `${p}.${a?.clave ?? '?'}`;
    if (!esTexto(a?.texto)) errores.push(`${q}: falta texto`);
    if (a?.esCorrecta !== true) {
      if (!esTexto(a?.feedback)) {
        errores.push(`${q}: distractor sin feedback artesanal (regla MOS §4: cada distractor explica el error que lo produce)`);
      } else if (nivel >= 2 && a.feedback.trim().length < MIN_FEEDBACK_PUBLICABLE) {
        errores.push(`${q}: feedback demasiado corto para publicar (<${MIN_FEEDBACK_PUBLICABLE} caracteres); debe explicar el error específico`);
      }
    }
  }
}

function validarArchivo(ruta) {
  const errores = [];
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }

  const tipo = data?.tipo;
  if (!(tipo in ITEMS_POR_TIPO)) {
    return [`"tipo" debe ser leccion, diagnostico o cierre (recibido: ${JSON.stringify(tipo)})`];
  }
  const nivel = NIVEL[data?.estado];
  if (nivel === undefined) {
    return [`"estado" debe ser borrador, revision o publicable (recibido: ${JSON.stringify(data?.estado)})`];
  }

  // El orden pedagógico se protege desde el borrador: si hay pasos, son 10 y en orden.
  if (tipo === 'leccion' && data.pasos !== undefined) {
    const pasos = data.pasos;
    if (!Array.isArray(pasos) || pasos.length !== 10) {
      errores.push(`pasos: deben ser exactamente 10 en el orden pedagógico del MOS (hay ${Array.isArray(pasos) ? pasos.length : 0})`);
    } else {
      pasos.forEach((paso, i) => {
        if (paso?.tipo !== ORDEN_PASOS[i]) {
          errores.push(`pasos[${i}].tipo: debe ser "${ORDEN_PASOS[i]}" (recibido: ${JSON.stringify(paso?.tipo)})`);
        }
        if (nivel >= 1) {
          if (!esTexto(paso?.titulo)) errores.push(`pasos[${i}]: falta titulo`);
          if (!Array.isArray(paso?.bloques) || paso.bloques.length === 0) {
            errores.push(`pasos[${i}]: falta bloques[] con al menos un bloque`);
          }
        }
      });
    }
  }

  if (nivel === 0) return errores; // borrador: libertad para redactar

  // revision y publicable: contrato completo
  if (!esTexto(data?.id)) errores.push('falta id');
  if (!esTexto(data?.titulo)) errores.push('falta titulo');

  if (tipo === 'leccion') {
    if (data.pasos === undefined) errores.push('faltan los 10 pasos');
    if (!esTexto(data?.objetivo)) errores.push('falta objetivo');
    if (!(Number.isFinite(data?.tiempoEstimadoMin) && data.tiempoEstimadoMin > 0)) errores.push('falta tiempoEstimadoMin (> 0)');
    if (!Array.isArray(data?.prerrequisitos)) errores.push('falta prerrequisitos[]');
    if (!Array.isArray(data?.conceptos)) errores.push('falta conceptos[]');
  }

  const campoItems = tipo === 'leccion' ? 'itemsPAES' : 'items';
  const items = data?.[campoItems];
  const [min, max] = ITEMS_POR_TIPO[tipo];
  if (!Array.isArray(items) || items.length < min || items.length > max) {
    const esperado = min === max ? `${min}` : `${min}–${max}`;
    errores.push(`${campoItems}: se esperan ${esperado} ítems (hay ${Array.isArray(items) ? items.length : 0})`);
  } else {
    items.forEach((it, i) => validarItem(it, i, campoItems, nivel, errores));
  }

  const prov = data?.proveniencia;
  if (!prov || !Array.isArray(prov.fuentesAnalisis) || typeof prov.declaracionOriginalidad !== 'string') {
    errores.push('falta proveniencia { fuentesAnalisis[], declaracionOriginalidad } (MOS §7.2)');
  }

  if (nivel >= 2) {
    if (!prov || prov.declaracionOriginalidad.trim().length < 30) {
      errores.push('publicable requiere una declaración de originalidad real (≥30 caracteres) en proveniencia');
    }
    const ck = data?.checklistOriginalidad || {};
    for (const campo of ['enunciadosOriginales', 'diagramasOriginales', 'secuenciaOriginal', 'provenienciaRegistrada']) {
      if (ck[campo] !== true) errores.push(`publicable requiere checklistOriginalidad.${campo} = true (MOS §7.3)`);
    }
    if (!esTexto(ck.revisadoPor)) errores.push('publicable requiere checklistOriginalidad.revisadoPor');
    if (data?.revisionMatematica?.aprobada !== true) {
      errores.push('publicable requiere revisionMatematica.aprobada = true (recalcular todo desde cero)');
    }
    if (PLACEHOLDERS.test(JSON.stringify(data))) {
      errores.push('publicable no admite marcadores de trabajo pendiente (TODO, FIXME, [PENDIENTE], XXX, lorem ipsum)');
    }
  }

  return errores;
}

function esContenido(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    !partes.includes('schema') &&
    !basename(ruta).startsWith('_')
  );
}

function* archivosDeContenido(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, ent.name);
    if (ent.isDirectory()) yield* archivosDeContenido(ruta);
    else if (esContenido(ruta)) yield ruta;
  }
}

function reportar(ruta, errores) {
  if (errores.length === 0) {
    console.log(`OK  ${ruta}`);
    return true;
  }
  console.error(`FALLA  ${ruta}`);
  for (const e of errores) console.error(`   - ${e}`);
  return false;
}

// ---------- entrada ----------
const arg = process.argv[2];

if (arg === '--hook') {
  let filePath = process.env.CLAUDE_FILE_PATH || '';
  if (!process.stdin.isTTY) {
    try {
      const stdin = readFileSync(0, 'utf8');
      if (stdin.trim()) {
        const evento = JSON.parse(stdin);
        filePath = evento?.tool_input?.file_path || evento?.tool_input?.path || filePath;
      }
    } catch {
      /* stdin sin JSON: seguimos con la variable de entorno */
    }
  }
  if (!filePath || !existsSync(filePath) || !esContenido(filePath)) process.exit(0);
  const errores = validarArchivo(filePath);
  if (errores.length) {
    console.error(`El archivo de contenido ${filePath} no pasa la validación:`);
    for (const e of errores) console.error(` - ${e}`);
    console.error('Corrige estos puntos antes de continuar (contrato: content/schema/leccion.schema.json).');
    process.exit(2); // Claude Code recibe este error como feedback y corrige
  }
  process.exit(0);
}

if (arg) {
  const ruta = resolve(arg);
  if (!existsSync(ruta)) {
    console.error(`No existe: ${ruta}`);
    process.exit(1);
  }
  process.exit(reportar(ruta, validarArchivo(ruta)) ? 0 : 1);
}

const raiz = resolve(process.cwd(), 'content');
if (!existsSync(raiz)) {
  console.error('No existe el directorio content/ en el directorio actual.');
  process.exit(1);
}
let ok = true;
let n = 0;
for (const ruta of archivosDeContenido(raiz)) {
  n++;
  if (!reportar(ruta, validarArchivo(ruta))) ok = false;
}
if (n === 0) console.log('Sin archivos de contenido que validar (los que empiezan con "_" son plantillas y se omiten).');
process.exit(ok ? 0 : 1);
FIN_ARCHIVO_KIT_M1
echo "  + scripts/validar-contenido.mjs"

# ---------- package.json: agregar script "validar" ----------
if [ -f package.json ]; then
  node - << 'JS'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.scripts = p.scripts || {};
if (!p.scripts.validar) {
  p.scripts.validar = 'node scripts/validar-contenido.mjs';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
  console.log('  + script "validar" agregado a package.json');
} else {
  console.log('  = package.json ya tenía el script "validar"');
}
JS
else
  echo '  ! No hay package.json aquí. Crea primero la app (npx create-next-app@latest) y vuelve a correr este instalador en su raíz.'
fi

# ---------- autoprueba del validador ----------
echo ""
echo "Autoprueba del validador:"
node scripts/validar-contenido.mjs || true

echo ""
echo "Listo. Próximos pasos:"
echo "  1. Lee SETUP.md (guía completa de flujos de trabajo)"
echo "  2. git add -A && git commit -m 'kit inicial: reglas MOS v2 para Claude Code'"
echo "  3. claude   →   /sesion lección 1"
