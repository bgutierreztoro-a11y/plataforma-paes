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

test("con catálogo de 3+, el distractor trae exactamente 3 opciones, una de ellas la real", () => {
  const catalogo = [
    { id: "error-1", descripcion: "d1" },
    { id: "error-2", descripcion: "d2" },
    { id: "error-3", descripcion: "d3" },
    { id: "error-4", descripcion: "d4" },
    { id: "error-5", descripcion: "d5" },
  ];
  const limpia = sanitizarLeccion(leccionCon(catalogo));
  const [a, b] = limpia.itemsPAES[0].alternativas;

  assert.equal(b.opcionesAutoexplicacion?.length, 3);
  assert.ok(b.opcionesAutoexplicacion!.includes("d1"));
  assert.equal(new Set(b.opcionesAutoexplicacion).size, 3, "sin repetidas");
  // La alternativa correcta no tiene errorCatalogado, así que no tiene opciones.
  assert.equal(a.opcionesAutoexplicacion, undefined);
});

test("con menos de 3 errores en el catálogo, el ítem omite el paso de autoexplicación", () => {
  const limpia = sanitizarLeccion(
    leccionCon([
      { id: "error-1", descripcion: "d1" },
      { id: "error-2", descripcion: "d2" },
    ]),
  );
  const [, b] = limpia.itemsPAES[0].alternativas;
  assert.equal(b.descripcionError, "d1", "la Capa 2 sí sigue disponible");
  assert.equal(b.opcionesAutoexplicacion, undefined);
});

test("la posición de la opción real no es siempre la misma", () => {
  /* Si la verdadera cayera siempre primera, el patrón se aprende en dos ítems
     y la pregunta deja de medir nada. */
  const catalogo = Array.from({ length: 6 }, (_, i) => ({
    id: `error-${i + 1}`,
    descripcion: `d${i + 1}`,
  }));
  const posiciones = new Set<number>();
  for (const id of ["error-1", "error-2", "error-3"]) {
    const leccion = leccionCon(catalogo);
    leccion.itemsPAES[0].alternativas[1].errorCatalogado = id;
    const [, b] = sanitizarLeccion(leccion).itemsPAES[0].alternativas;
    const real = catalogo.find((e) => e.id === id)!.descripcion;
    posiciones.add(b.opcionesAutoexplicacion!.indexOf(real));
  }
  assert.ok(posiciones.size > 1, "la real cae en distintas posiciones según el ítem");
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
