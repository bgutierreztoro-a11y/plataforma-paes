#!/usr/bin/env node
/**
 * Consulta de colisión contra fuentes de análisis aisladas — Plataforma M1
 * Cero dependencias. Node 18+.
 *
 * Este script es la ÚNICA vía sancionada para consultar las carpetas
 * aisladas de fuentes externas, ambas un nivel sobre la raíz del repo:
 *   - fuentes-analisis-aisladas/ — material privado, movido fuera del
 *     árbol del proyecto tras el incidente de clean-room del 2026-07-07
 *     (ver CLAUDE.md).
 *   - fuentes-demre-liberadas/ — formas DEMRE liberadas, permitidas como
 *     base directa de ítems en Fobos Advance (MOS §7.1); se mantienen en
 *     el corpus de consulta para seguir detectando colisión de dominio o
 *     plantilla entre Advance y lo ya escrito.
 * Recorre todas las subcarpetas de cada una (pdv-terceros/,
 * mineduc-curriculum/, pendiente-clasificar/, etc.) — la clasificación
 * por fuente no cambia el alcance de la búsqueda de colisión.
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
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ_CONTENEDORA = resolve(__dirname, '..', '..');
const RUTAS_AISLADAS = [
  join(RAIZ_CONTENEDORA, 'fuentes-analisis-aisladas'),
  join(RAIZ_CONTENEDORA, 'fuentes-demre-liberadas'),
];

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

for (const raiz of RUTAS_AISLADAS) {
  if (!existsSync(raiz)) {
    console.error(`Aviso: no existe ${raiz} — se omite de la búsqueda.`);
  }
}

const raicesPresentes = RUTAS_AISLADAS.filter((raiz) => existsSync(raiz));

if (raicesPresentes.length === 0) {
  console.error(`No existe ninguna carpeta de fuentes aisladas: ${RUTAS_AISLADAS.join(', ')}`);
  console.error('Verifica que no hayan sido movidas de lugar sin actualizar este script.');
  process.exit(1);
}

// Cada archivo se lleva su ruta relativa ya prefijada con el nombre de su
// carpeta raíz, para que la salida diga de qué corpus vino la coincidencia.
const archivos = raicesPresentes.flatMap((raiz) =>
  [...archivosMarkdown(raiz)].map((abs) => ({
    abs,
    rel: `${basename(raiz)}/${abs.slice(raiz.length + 1)}`,
  }))
);

for (const palabra of palabras) {
  const needle = palabra.toLowerCase();
  const coincidencias = [];
  for (const { abs, rel } of archivos) {
    const contenido = readFileSync(abs, 'utf8').toLowerCase();
    if (contenido.includes(needle)) {
      coincidencias.push(rel);
    }
  }
  if (coincidencias.length === 0) {
    console.log(`${palabra}: NO`);
  } else {
    console.log(`${palabra}: SI (${coincidencias.length} archivo(s): ${coincidencias.join(', ')})`);
  }
}
