#!/usr/bin/env node
/**
 * Consulta de colisión contra fuentes de análisis aisladas — Plataforma M1
 * Cero dependencias. Node 18+.
 *
 * Este script es la ÚNICA vía sancionada para consultar la carpeta aislada
 * de fuentes externas (fuentes-analisis-aisladas/, movida fuera del árbol
 * del proyecto tras el incidente de clean-room del 2026-07-07; ver CLAUDE.md).
 * Recorre todas las subcarpetas (pdv-terceros/, mineduc-curriculum/,
 * pendiente-clasificar/, etc.) — la clasificación por fuente no cambia
 * el alcance de la búsqueda de colisión.
 *
 * Uso:
 *   node scripts/consultar-fuentes.mjs "palabra clave 1" "palabra clave 2" ...
 *
 * Diseño deliberado: la salida está limitada por código, no por instrucción.
 * Nunca imprime líneas de texto, enunciados, números ni fragmentos de las
 * fuentes — solo si la palabra clave aparece y en qué archivo(s) (metadato,
 * no expresión protegida). Así el subagente/hilo que invoca este script no
 * puede terminar con contenido real de la fuente en su contexto aunque quiera.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_AISLADA = resolve(__dirname, '..', '..', 'fuentes-analisis-aisladas');

function* archivosMarkdown(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, ent.name);
    if (ent.isDirectory()) yield* archivosMarkdown(ruta);
    else if (/\.md$/i.test(ent.name)) yield ruta;
  }
}

const palabras = process.argv.slice(2);

if (palabras.length === 0) {
  console.error('Uso: node scripts/consultar-fuentes.mjs "palabra clave 1" "palabra clave 2" ...');
  process.exit(1);
}

if (!existsSync(RUTA_AISLADA)) {
  console.error(`No existe la carpeta de fuentes aisladas en: ${RUTA_AISLADA}`);
  console.error('Verifica que fuentes-analisis-aisladas/ no haya sido movida de lugar sin actualizar este script.');
  process.exit(1);
}

const archivos = [...archivosMarkdown(RUTA_AISLADA)];

for (const palabra of palabras) {
  const needle = palabra.toLowerCase();
  const coincidencias = [];
  for (const ruta of archivos) {
    const contenido = readFileSync(ruta, 'utf8').toLowerCase();
    if (contenido.includes(needle)) {
      coincidencias.push(ruta.slice(RUTA_AISLADA.length + 1));
    }
  }
  if (coincidencias.length === 0) {
    console.log(`${palabra}: NO`);
  } else {
    console.log(`${palabra}: SI (${coincidencias.length} archivo(s): ${coincidencias.join(', ')})`);
  }
}
