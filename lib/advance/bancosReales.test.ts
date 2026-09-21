import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { figuraParaCliente, itemParaCliente, obtenerBanco, unidadesConBanco, type ItemEnDisco } from "./banco.ts";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";

/* Regresión sobre los bancos reales de content/advance/: todos validan y
   `itemParaCliente` no altera ninguna figura de los tipos anteriores a las
   figuras de datos. Se afirma la propiedad, no una captura: la comparación
   byte a byte contra la salida previa al cambio se hizo una vez, fuera del
   repo, al introducir las figuras de datos (2026-09-21, 11 bancos idénticos). */

const DIR = path.join(process.cwd(), "content", "advance");
const unidades = readdirSync(DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== "schema" && !e.name.startsWith("_"))
  .map((e) => e.name)
  .sort();

const TIPOS_ANTERIORES = new Set([undefined, "plano-funcion", "tabla-valores"]);

describe("bancos reales de content/advance/", () => {
  it("hay bancos y unidadesConBanco los sirve todos", () => {
    /* Medido el 2026-09-21: 11 bancos. El assert afirma que ninguno se cae, no el número. */
    assert.ok(unidades.length > 0);
    assert.deepEqual(unidadesConBanco().map((u) => u.unidadId), unidades);
  });

  for (const unidadId of unidades) {
    it(`${unidadId}: valida y la figura de cada ítem llega íntegra al cliente`, () => {
      const data = JSON.parse(readFileSync(path.join(DIR, unidadId, "banco.json"), "utf8")) as { items: ItemEnDisco[] };
      assert.deepEqual(validarDatosBancoAdvance(data, unidadId, path.join(process.cwd(), "content")), []);
      const banco = obtenerBanco(unidadId);
      assert.ok(banco);
      assert.equal(banco.items.length, data.items.length);
      data.items.forEach((item, i) => {
        const cliente = itemParaCliente(item);
        assert.deepEqual(banco.items[i], cliente);
        if (item.figura === undefined) {
          assert.equal("figura" in cliente, false);
          return;
        }
        /* Los bancos existentes solo traen figuras anteriores a las de datos, y esas viajan tal cual. */
        assert.ok(TIPOS_ANTERIORES.has(item.figura.tipo), `${unidadId} ${item.id}: tipo ${item.figura.tipo}`);
        assert.equal(figuraParaCliente(item.figura), item.figura);
        assert.equal(cliente.figura, item.figura);
      });
    });
  }
});
