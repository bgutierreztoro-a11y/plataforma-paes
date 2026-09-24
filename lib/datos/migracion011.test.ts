import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

/* Sin Postgres en el repo, esto lee el SQL: prueba que la restricción está escrita, no que Postgres la cumpla.
   La prueba de comportamiento va en la PARADA de la Fase 3 (bloque SQL con ROLLBACK para una rama de Neon). */
const sql = readFileSync(path.join(process.cwd(), "db", "migraciones", "011_recorrido_prueba_y_perfil.sql"), "utf8")
  .split("\n")
  .map((linea) => linea.replace(/--.*$/, ""))
  .join(" ")
  .replace(/\s+/g, " ");

describe("migración 011", () => {
  it("entitlements acepta 'prueba' y conserva los tres orígenes anteriores", () => {
    assert.match(sql, /CHECK \(origen IN \('gratis', 'cortesia', 'compra', 'prueba'\)\)/);
  });

  it("una sola prueba por usuario, sea cual sea el producto", () => {
    assert.match(sql, /CREATE UNIQUE INDEX \w+ ON entitlements \(usuario_id\) WHERE origen = 'prueba'/);
  });

  it("perfil_inicio cuelga de usuarios con cascada y tiene parada_iniciada_en nula", () => {
    assert.match(sql, /usuario_id text PRIMARY KEY REFERENCES usuarios\(id\) ON DELETE CASCADE/);
    assert.match(sql, /parada_iniciada_en timestamptz,/);
  });

  it("app_m1 no puede borrar perfiles ni corregir otra columna que parada_iniciada_en", () => {
    const grants = sql.match(/GRANT [^;]+ ON perfil_inicio TO app_m1/g) ?? [];
    assert.deepEqual(grants, [
      "GRANT INSERT, SELECT ON perfil_inicio TO app_m1",
      "GRANT UPDATE (parada_iniciada_en) ON perfil_inicio TO app_m1",
    ]);
  });

  it("los valores cerrados del CHECK son los de lib/eventos.ts y el formato del video el de lib/recorrido/video.ts", () => {
    assert.match(sql, /p1 IN \('me_cuestan', 'mas_o_menos', 'me_va_bien'\)/);
    assert.match(sql, /p2 IN \('entender_base', 'practicar_prueba', 'encontrar_errores'\)/);
    assert.match(sql, /p3 IN \('si', 'no'\)/);
    assert.match(sql, /video ~ '\^v\[0-9\]\{3\}-\[a-z0-9-\]\+\$' AND length\(video\) <= 60/);
  });
});
