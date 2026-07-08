#!/usr/bin/env node
// PreToolUse hook: bloquea Read/Grep/Glob sobre la carpeta de fuentes aisladas.
// El deny de "Read" en settings.json es best-effort para Grep/Glob (no soportan
// scoping por ruta en permission rules), así que este hook es la barrera real.
// Ver CLAUDE.md > "Aislamiento de fuentes externas".

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
      `pueden tocar esa ruta. Ver CLAUDE.md > Aislamiento de fuentes externas.\n`
  );
  process.exit(2);
});
