#!/usr/bin/env node
/**
 * Aplicador de migraciones — Plataforma M1
 * Sin dependencias propias más allá de @neondatabase/serverless. Node 22+.
 *
 * Uso:
 *   npm run migrar               aplica las migraciones pendientes
 *   npm run migrar -- --estado   lista qué está aplicado y qué falta, sin escribir
 *
 * Lee DATABASE_URL_MIGRACIONES de .env.local, de .env o del entorno, en ese
 * orden. Es la conexión del rol DUEÑO, distinta de la DATABASE_URL que usa la
 * app: el dueño crea y altera tablas, la app solo lee y escribe filas. Si este
 * script usara la conexión de la app, el rol restringido tendría que poder
 * hacer DDL y la separación no serviría de nada.
 *
 * Conviene que sea la cadena directa de Neon (sin "-pooler" en el host): el
 * pooler trabaja en modo transacción y el DDL se lleva mal con eso.
 *
 * Cómo decide qué aplicar: lleva un registro en la tabla _migraciones, con el
 * nombre del archivo y el sha256 de su contenido. Aplica en orden alfabético
 * lo que no esté registrado. Por eso los archivos van numerados.
 *
 * Una migración ya aplicada cuyo contenido cambió en disco es un error duro,
 * no algo que se reaplique: el estado real de la base ya no corresponde al
 * archivo que dice haberlo producido, y adivinar la diferencia es peor que
 * detenerse. Para corregir una migración aplicada se escribe una nueva.
 *
 * Cada archivo corre dentro de su propia transacción: si falla a la mitad, se
 * revierte entero y no queda registrado como aplicado.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_MIGRACIONES = join(RAIZ, 'db', 'migraciones');
const soloEstado = process.argv.includes('--estado');

const REGISTRO = `
  CREATE TABLE IF NOT EXISTS _migraciones (
    archivo     text        PRIMARY KEY,
    sha256      text        NOT NULL,
    aplicada_en timestamptz NOT NULL DEFAULT now()
  );
`;

function salirConError(mensaje) {
  console.error(`ERROR  ${mensaje}`);
  process.exit(1);
}

function cargarEnv() {
  for (const archivo of ['.env.local', '.env']) {
    const ruta = join(RAIZ, archivo);
    if (!existsSync(ruta)) continue;
    try {
      process.loadEnvFile(ruta);
    } catch {
      // Archivo con formato inválido: se ignora y se sigue con el entorno.
    }
  }
}

function migracionesEnDisco() {
  if (!existsSync(DIR_MIGRACIONES)) {
    salirConError(`No existe el directorio ${DIR_MIGRACIONES}`);
  }
  const archivos = readdirSync(DIR_MIGRACIONES).filter((n) => n.endsWith('.sql')).sort();
  if (archivos.length === 0) {
    salirConError(`No hay archivos .sql en ${DIR_MIGRACIONES}`);
  }
  return archivos.map((archivo) => {
    // Se normaliza CRLF a LF antes de hashear: si no, clonar el repo en
    // Windows con autocrlf cambiaría todos los checksums y el script se
    // negaría a correr sobre una base perfectamente sana.
    const sql = readFileSync(join(DIR_MIGRACIONES, archivo), 'utf8').replace(/\r\n/g, '\n');
    return { archivo, sql, sha256: createHash('sha256').update(sql).digest('hex') };
  });
}

async function abrirPool(url) {
  let neon;
  try {
    neon = await import('@neondatabase/serverless');
  } catch {
    salirConError('Falta @neondatabase/serverless. Instálalo con:\n         npm install @neondatabase/serverless');
  }
  // Node 22+ trae WebSocket global, así que no hace falta el paquete ws.
  if (typeof globalThis.WebSocket !== 'function') {
    salirConError(`Este Node (${process.version}) no expone WebSocket global. Usa Node 22 o superior.`);
  }
  neon.neonConfig.webSocketConstructor = globalThis.WebSocket;
  return new neon.Pool({ connectionString: url });
}

async function main() {
  cargarEnv();
  const url = process.env.DATABASE_URL_MIGRACIONES;
  if (!url) {
    salirConError(
      'Falta DATABASE_URL_MIGRACIONES (la conexión del rol dueño).\n' +
      '       Defínela en .env.local; ver .env.example. No sirve DATABASE_URL:\n' +
      '       esa es la del rol restringido de la app y no puede crear tablas.',
    );
  }

  const enDisco = migracionesEnDisco();
  const pool = await abrirPool(url);
  const cliente = await pool.connect();

  try {
    await cliente.query(REGISTRO);
    const { rows } = await cliente.query('SELECT archivo, sha256, aplicada_en FROM _migraciones');
    const aplicadas = new Map(rows.map((r) => [r.archivo, r]));

    for (const m of enDisco) {
      const previa = aplicadas.get(m.archivo);
      if (previa && previa.sha256 !== m.sha256) {
        salirConError(
          `${m.archivo} se aplicó el ${previa.aplicada_en.toISOString()} pero su contenido cambió.\n` +
          `       No edites una migración ya aplicada: escribe una nueva que corrija lo anterior.`,
        );
      }
    }

    if (soloEstado) {
      for (const m of enDisco) {
        const previa = aplicadas.get(m.archivo);
        console.log(
          previa
            ? `APLICADA   ${m.archivo}  (${previa.aplicada_en.toISOString()})`
            : `PENDIENTE  ${m.archivo}`,
        );
      }
      return;
    }

    const pendientes = enDisco.filter((m) => !aplicadas.has(m.archivo));
    if (pendientes.length === 0) {
      console.log('Nada que aplicar: la base está al día.');
      return;
    }

    for (const m of pendientes) {
      await cliente.query('BEGIN');
      try {
        await cliente.query(m.sql);
        await cliente.query('INSERT INTO _migraciones (archivo, sha256) VALUES ($1, $2)', [
          m.archivo,
          m.sha256,
        ]);
        await cliente.query('COMMIT');
        console.log(`OK  ${m.archivo}`);
      } catch (e) {
        await cliente.query('ROLLBACK');
        salirConError(`${m.archivo} falló y se revirtió entera:\n       ${e.message}`);
      }
    }
    console.log(`\n${pendientes.length} migración(es) aplicada(s).`);
  } finally {
    cliente.release();
    await pool.end();
  }
}

await main();
