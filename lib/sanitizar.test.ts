import test from "node:test";
import assert from "node:assert/strict";
import { sanitizarLeccion, sanitizarCierre } from "./sanitizar.ts";
import type { CierreContenido, Leccion } from "./tipos.ts";

/* Mínimo viable para lo que se prueba acá: la resolución de errorCatalogado →
   descripcionError y el filtro de claves internas. La forma completa de una
   lección la valida scripts/validar-contenido.mjs, no este test. */
function leccionCon(catalogoErrores?: { id: string; descripcion: string }[]): Leccion {
  return {
    tipo: "leccion",
    id: "l-test",
    titulo: "Test",
    estado: "borrador",
    objetivo: "",
    tiempoEstimadoMin: 1,
    prerrequisitos: [],
    conceptos: [],
    pasos: [],
    proveniencia: { fuentesAnalisis: ["secreta.pdf"], declaracionOriginalidad: "x" },
    catalogoErrores,
    itemsPAES: [
      {
        id: "i1",
        habilidad: "resolver",
        dificultad: "media",
        enunciado: "e",
        solucion: "no debe viajar",
        alternativas: [
          { clave: "A", texto: "a", esCorrecta: true },
          { clave: "B", texto: "b", esCorrecta: false, errorCatalogado: "error-1" },
          { clave: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-99" },
          { clave: "D", texto: "d", esCorrecta: false },
        ],
      },
    ],
  } as Leccion;
}

test("con catalogoErrores, el distractor recibe la descripción resuelta", () => {
  const limpia = sanitizarLeccion(
    leccionCon([{ id: "error-1", descripcion: "Invirtió el signo al pasar el término." }]),
  );
  const [, b] = limpia.itemsPAES[0].alternativas;
  assert.equal(b.descripcionError, "Invirtió el signo al pasar el término.");
});

test("el catálogo NO viaja al cliente, solo la descripción del distractor", () => {
  const limpia = sanitizarLeccion(
    leccionCon([
      { id: "error-1", descripcion: "El que corresponde." },
      { id: "error-2", descripcion: "Este pertenece a otro ítem y no debe filtrarse." },
    ]),
  );
  assert.equal("catalogoErrores" in limpia, false);
  assert.equal("proveniencia" in limpia, false);
  assert.equal("solucion" in limpia.itemsPAES[0], false);
  const serializado = JSON.stringify(limpia);
  assert.equal(serializado.includes("Este pertenece a otro ítem"), false);
});

test("un id sin entrada en el catálogo se deja sin descripción, no se adivina", () => {
  const limpia = sanitizarLeccion(
    leccionCon([{ id: "error-1", descripcion: "El que corresponde." }]),
  );
  const [, , c, d] = limpia.itemsPAES[0].alternativas;
  assert.equal(c.errorCatalogado, "error-99");
  assert.equal(c.descripcionError, undefined);
  assert.equal(d.descripcionError, undefined);
});

test("sin catalogoErrores (caso de todos los cierres) no se resuelve nada", () => {
  const limpia = sanitizarLeccion(leccionCon(undefined));
  for (const alt of limpia.itemsPAES[0].alternativas) {
    assert.equal(alt.descripcionError, undefined);
  }
});

test("los ids locales NO se resuelven entre archivos: un cierre sin catálogo queda sin Capa 2", () => {
  /* "error-4" en un cierre que mezcla dos unidades es ambiguo por diseño del
     contenido actual. Resolverlo contra cualquier catálogo ajeno mostraría la
     descripción equivocada, que es peor que no mostrar ninguna. */
  const cierre = {
    tipo: "cierre",
    id: "cierre-test",
    titulo: "Cierre",
    estado: "borrador",
    proveniencia: { fuentesAnalisis: [], declaracionOriginalidad: "x" },
    items: [
      {
        id: "c1",
        habilidad: "resolver",
        dificultad: "baja",
        enunciado: "e",
        solucion: "s",
        alternativas: [
          { clave: "A", texto: "a", esCorrecta: true },
          { clave: "B", texto: "b", esCorrecta: false, errorCatalogado: "error-4" },
          { clave: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-4" },
          { clave: "D", texto: "d", esCorrecta: false, errorCatalogado: "error-7" },
        ],
      },
    ],
  } as CierreContenido;

  const limpio = sanitizarCierre(cierre);
  for (const alt of limpio.items[0].alternativas) {
    assert.equal(alt.descripcionError, undefined);
  }
});
