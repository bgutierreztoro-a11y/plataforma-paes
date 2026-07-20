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
