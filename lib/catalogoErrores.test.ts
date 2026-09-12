import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarDatosCatalogoErrores } from "../scripts/validar-contenido.mjs";
import { catalogoCompletoDelModulo, catalogoDelModulo } from "./catalogoErrores.ts";

/* La primera mitad prueba el contrato de forma del catálogo sobre datos en
   memoria (F4b: titulo, apoyo y repaso opcionales). La segunda toca
   content/errores/porcentaje.json de verdad, con el mismo criterio que
   lib/sanitizar.test.ts: contra un stub no se sabría si la ruta, el prefijo de
   ids y la proyección de catalogoDelModulo están bien resueltos. */

const REPASO = { camino: "Cómo se llega.", correcto: "Lo correcto.", ejemplo: "Un ejemplo." };

function catalogo(...errores: Record<string, unknown>[]) {
  return { unidad: "prueba", errores };
}

function entrada(extra: Record<string, unknown> = {}, n = 1) {
  return { id: `prueba/error-${n}`, descripcion: `Descripción ${n}.`, ...extra };
}

describe("validarDatosCatalogoErrores", () => {
  it("acepta una entrada con titulo, apoyo y repaso completos", () => {
    assert.deepEqual(
      validarDatosCatalogoErrores(catalogo(entrada({ titulo: "Título", apoyo: "Apoyo.", repaso: REPASO }))),
      [],
    );
  });

  it("acepta una entrada solo con id y descripcion: los otros catálogos no cambian", () => {
    assert.deepEqual(validarDatosCatalogoErrores(catalogo(entrada())), []);
  });

  it("repaso sin ejemplo nombra el campo que falta", () => {
    const sinEjemplo = { camino: REPASO.camino, correcto: REPASO.correcto };
    const errores = validarDatosCatalogoErrores(catalogo(entrada({ repaso: sinEjemplo })));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^errores\[0\]\.repaso\.ejemplo/);
  });

  it("repaso con camino vacío nombra el campo", () => {
    const errores = validarDatosCatalogoErrores(catalogo(entrada({ repaso: { ...REPASO, camino: "  " } })));
    assert.deepEqual(
      errores.map((e) => e.split(":")[0]),
      ["errores[0].repaso.camino"],
    );
  });

  it("repaso que no es objeto se rechaza entero", () => {
    for (const malo of ["texto", 7, ["camino"], null]) {
      const errores = validarDatosCatalogoErrores(catalogo(entrada({ repaso: malo })));
      assert.equal(errores.length, 1, JSON.stringify(malo));
      assert.match(errores[0], /^errores\[0\]\.repaso: si está, es un objeto/);
    }
  });

  it("titulo vacío y apoyo que no es texto se rechazan, cada uno con su nombre", () => {
    const errores = validarDatosCatalogoErrores(catalogo(entrada({ titulo: "", apoyo: 42 })));
    assert.deepEqual(
      errores.map((e) => e.split(":")[0]),
      ["errores[0].titulo", "errores[0].apoyo"],
    );
  });

  it("los campos nuevos no relajan las reglas viejas", () => {
    assert.match(validarDatosCatalogoErrores(catalogo({ id: "error-1", descripcion: "x" }))[0], /debe empezar con "prueba\/"/);
    assert.match(validarDatosCatalogoErrores(catalogo({ id: "prueba/error-1" }))[0], /falta descripcion/);
    assert.match(validarDatosCatalogoErrores(catalogo(entrada(), entrada()))[0], /id local "error-1" duplicado/);
    assert.deepEqual(validarDatosCatalogoErrores({ unidad: "prueba", errores: [] }), ['falta "errores"[] con al menos un error']);
  });
});

describe("catalogoCompletoDelModulo", () => {
  const completo = catalogoCompletoDelModulo("porcentaje");
  const simple = catalogoDelModulo("porcentaje");

  it("catalogoDelModulo es su proyección: mismas claves, misma descripcion", () => {
    assert.ok(completo.size > 0);
    assert.deepEqual([...completo.keys()], [...simple.keys()]);
    for (const [clave, e] of completo) assert.equal(e.descripcion, simple.get(clave));
  });

  it("el id de cada entrada es local y coincide con su clave", () => {
    for (const [clave, e] of completo) {
      assert.equal(e.id, clave);
      assert.match(clave, /^error-\d+$/);
    }
  });

  it("toda entrada con titulo trae también apoyo y repaso completo (copy para el estudiante, F4b)", () => {
    /* 2026-09-12: 9 de 9 entradas de porcentaje lo traen. El assert es la
       relación, no el número: si un catálogo agrega titulo a medias, falla acá. */
    let conTitulo = 0;
    for (const e of completo.values()) {
      if (e.titulo === undefined) continue;
      conTitulo += 1;
      assert.ok(e.apoyo, `${e.id}: titulo sin apoyo`);
      assert.ok(e.repaso, `${e.id}: titulo sin repaso`);
      for (const campo of ["camino", "correcto", "ejemplo"] as const) {
        assert.ok(e.repaso[campo].trim().length > 0, `${e.id}: repaso.${campo} vacío`);
      }
    }
    assert.ok(conTitulo > 0, "porcentaje ya tiene copy para el estudiante; si esto falla, se perdió");
  });

  it("un módulo sin catálogo canónico, o sin moduloId, da un Map vacío", () => {
    assert.equal(catalogoCompletoDelModulo("modulo-inexistente").size, 0);
    assert.equal(catalogoCompletoDelModulo(undefined).size, 0);
  });
});
