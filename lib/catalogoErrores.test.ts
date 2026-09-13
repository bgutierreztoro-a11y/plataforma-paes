import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarCoberturaCatalogo, validarDatosCatalogoErrores } from "../scripts/validar-contenido.mjs";
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
  return { id: `prueba/falla-${["uno","dos","tres"][n-1] ?? n}`, descripcion: `Descripción ${n}.`, ...extra };
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
    assert.match(validarDatosCatalogoErrores(catalogo({ id: "falla-uno", descripcion: "x" }))[0], /debe empezar con "prueba\/"/);
    assert.match(validarDatosCatalogoErrores(catalogo({ id: "prueba/falla-uno" }))[0], /falta descripcion/);
    assert.match(validarDatosCatalogoErrores(catalogo(entrada(), entrada()))[0], /id local "falla-uno" duplicado/);
    assert.deepEqual(validarDatosCatalogoErrores({ unidad: "prueba", errores: [] }), ['falta "errores"[] con al menos un error']);
  });

  it("reservado, si está, es un motivo real y no una marca vacía", () => {
    assert.deepEqual(validarDatosCatalogoErrores(catalogo(entrada({ reservado: "se guarda para el cierre del módulo" }))), []);
    for (const malo of ["", "   ", "pendiente", true, 7]) {
      const errores = validarDatosCatalogoErrores(catalogo(entrada({ reservado: malo })));
      assert.equal(errores.length, 1, JSON.stringify(malo));
      assert.match(errores[0], /^errores\[0\]\.reservado: si está, es un motivo de al menos 20 caracteres/);
    }
  });
});

describe("validarCoberturaCatalogo", () => {
  /* Gemelo del chequeo inverso: todo id que existe en el canónico lo usa
     alguna pieza del módulo, o dice por qué se guarda. Medido el 2026-09-13
     sobre los 13 catálogos reales: 0 ids sin uso. El assert es la relación. */
  const tres = catalogo(entrada({}, 1), entrada({}, 2), entrada({}, 3));

  it("con todos los ids referenciados no hay hallazgos", () => {
    const usados = new Set(["prueba/falla-uno", "prueba/falla-dos", "prueba/falla-tres"]);
    assert.deepEqual(validarCoberturaCatalogo(tres, usados), []);
  });

  it("un id que ningún archivo del módulo referencia se nombra por su id completo", () => {
    const errores = validarCoberturaCatalogo(tres, new Set(["prueba/falla-uno", "prueba/falla-tres"]));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^prueba\/falla-dos no lo referencia ningún errorCatalogado del módulo/);
  });

  it("un id reservado con motivo no cuenta como sin uso", () => {
    const conReserva = catalogo(entrada({}, 1), entrada({ reservado: "se guarda para el cierre del módulo" }, 2));
    assert.deepEqual(validarCoberturaCatalogo(conReserva, new Set(["prueba/falla-uno"])), []);
  });

  it("las referencias de otro módulo no cubren los ids de este", () => {
    const errores = validarCoberturaCatalogo(catalogo(entrada()), new Set(["otro/falla-uno"]));
    assert.equal(errores.length, 1);
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
      /* Slug descriptivo kebab-case (2026-09-13); la forma posicional error-N ya no existe. */
      assert.match(clave, /^[a-z0-9]+(-[a-z0-9]+)+$/);
      assert.doesNotMatch(clave, /^error-\d+$/);
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
