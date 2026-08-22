#!/usr/bin/env node
// PreToolUse hook: bloquea Read/Grep/Glob sobre la carpeta de fuentes aisladas.
// El deny de "Read" en settings.json es best-effort para Grep/Glob (no soportan
// scoping por ruta en permission rules), así que este hook es la barrera real.
// Ver CLAUDE.md > "Aislamiento de fuentes externas".
//
// Autolocalización (diagnóstico 2026-08-21): el comando de este hook en
// settings.json usaba "$CLAUDE_PROJECT_DIR/scripts/check-fuentes-aisladas.mjs".
// Esa variable puede llegar vacía según cómo haya arrancado la sesión, y con
// ella vacía el comando queda "node /scripts/check-fuentes-aisladas.mjs" — en
// Git Bash/MSYS esa ruta se reinterpreta como raíz de la instalación de Git,
// node tira MODULE_NOT_FOUND, el proceso muere con exit 1 (no con el exit 2 que
// esta lógica usa para bloquear) y el hook queda silenciosamente inactivo toda
// la sesión. El comando en settings.json ahora es la ruta relativa simple
// "node scripts/check-fuentes-aisladas.mjs"; este script ya no depende de esa
// variable para nada, y se ubica a sí mismo con import.meta.url (mismo patrón
// que consultar-fuentes.mjs) solo para poder reportar desde dónde corrió.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = dirname(__dirname); // scripts/ -> raíz del proyecto

const FORBIDDEN_SUBSTRING = "fuentes-analisis-aisladas";

// Únicos subagentes con permiso documentado para leer la carpeta aislada.
// Ver CLAUDE.md > "Aislamiento de fuentes externas".
const ALLOWED_AGENT_TYPES = new Set(["auditor-originalidad", "consulta-fuentes"]);

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // no se pudo parsear, no bloquear por un problema del hook
  }

  const toolInput = payload.tool_input || {};
  const candidates = [
    toolInput.file_path,
    toolInput.path,
    toolInput.pattern,
    toolInput.notebook_path,
  ].filter(Boolean);

  const hit = candidates.find((value) =>
    String(value).toLowerCase().includes(FORBIDDEN_SUBSTRING)
  );

  if (!hit) {
    process.exit(0);
  }

  if (ALLOWED_AGENT_TYPES.has(payload.agent_type)) {
    process.exit(0);
  }

  const caller = payload.agent_type
    ? `el subagente "${payload.agent_type}"`
    : "el hilo principal";
  process.stderr.write(
    `Bloqueado: ${caller} intentó usar ${payload.tool_name} sobre la carpeta de ` +
      `fuentes aisladas ("${hit}"). Solo auditor-originalidad o consulta-fuentes ` +
      `pueden tocar esa ruta. Ver CLAUDE.md > Aislamiento de fuentes externas.\n` +
      `(hook ejecutado desde ${PROJECT_ROOT})\n`
  );
  process.exit(2);
});
