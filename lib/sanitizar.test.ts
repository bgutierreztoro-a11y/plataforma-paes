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

/* Igual que `leccionCon`, pero los tres distractores referencian tres errores
   distintos. Es el mínimo para que el paso de autoexplicación exista: los
   señuelos salen de los ids que el archivo referencia, no del catálogo. */
function leccionConTresIds(catalogoErrores: { id: string; descripcion: string }[]): Leccion {
  const leccion = leccionCon(catalogoErrores);
  const [, b, c, d] = leccion.itemsPAES[0].alternativas;
  b.errorCatalogado = "error-1";
  c.errorCatalogado = "error-2";
  d.errorCatalogado = "error-3";
  return leccion;
}

const CATALOGO_5 = [
  { id: "error-1", descripcion: "d1" },
  { id: "error-2", descripcion: "d2" },
  { id: "error-3", descripcion: "d3" },
  { id: "error-4", descripcion: "d4" },
  { id: "error-5", descripcion: "d5" },
];

test("con 3+ ids referenciados en el archivo, el distractor trae exactamente 3 opciones, una de ellas la real", () => {
  const limpia = sanitizarLeccion(leccionConTresIds(CATALOGO_5));
  const [a, b] = limpia.itemsPAES[0].alternativas;

  assert.equal(b.opcionesAutoexplicacion?.length, 3);
  assert.ok(b.opcionesAutoexplicacion!.includes("d1"));
  assert.equal(new Set(b.opcionesAutoexplicacion).size, 3, "sin repetidas");
  // La alternativa correcta no tiene errorCatalogado, así que no tiene opciones.
  assert.equal(a.opcionesAutoexplicacion, undefined);
});

test("los señuelos salen de los ids del archivo, no del catálogo del módulo", () => {
  /* La propiedad que separa esta implementación de la anterior. El catálogo trae
     cinco entradas y el archivo referencia tres: las opciones tienen que ser esas
     tres y ninguna más. Si los señuelos salieran del catálogo, aparecerían d4 o
     d5, que son errores que esta lección no ejercita. */
  const limpia = sanitizarLeccion(leccionConTresIds(CATALOGO_5));
  const [, b] = limpia.itemsPAES[0].alternativas;

  assert.deepEqual(new Set(b.opcionesAutoexplicacion), new Set(["d1", "d2", "d3"]));
  assert.equal(b.opcionesAutoexplicacion!.includes("d4"), false);
  assert.equal(b.opcionesAutoexplicacion!.includes("d5"), false);
});

test("crecer el catálogo del módulo no mueve los señuelos de un archivo", () => {
  /* El corolario operativo: la migración a catálogo canónico agranda el catálogo
     que ve cada archivo, y eso no puede cambiar lo que el estudiante ve. */
  const catalogoGrande = [
    ...CATALOGO_5,
    ...Array.from({ length: 11 }, (_, i) => ({ id: `error-${i + 6}`, descripcion: `d${i + 6}` })),
  ];
  const chico = sanitizarLeccion(leccionConTresIds(CATALOGO_5));
  const grande = sanitizarLeccion(leccionConTresIds(catalogoGrande));

  assert.deepEqual(
    grande.itemsPAES[0].alternativas[1].opcionesAutoexplicacion,
    chico.itemsPAES[0].alternativas[1].opcionesAutoexplicacion,
  );
});

test("con menos de 3 ids referenciados en el archivo, el ítem omite el paso de autoexplicación", () => {
  /* El catálogo tiene cinco entradas y alcanzaría de sobra; lo que no alcanza es
     lo que el archivo ejercita: `leccionCon` solo referencia error-1 y error-99. */
  const limpia = sanitizarLeccion(leccionCon(CATALOGO_5));
  const [, b] = limpia.itemsPAES[0].alternativas;
  assert.equal(b.descripcionError, "d1", "la Capa 2 sí sigue disponible");
  assert.equal(b.opcionesAutoexplicacion, undefined);
});

test("la posición de la opción real no es siempre la misma", () => {
  /* Si la verdadera cayera siempre primera, el patrón se aprende en dos ítems
     y la pregunta deja de medir nada. Se miran los tres distractores del mismo
     ítem: cada uno tiene su error real en una posición distinta de la lista. */
  const limpia = sanitizarLeccion(leccionConTresIds(CATALOGO_5));
  const [, ...distractores] = limpia.itemsPAES[0].alternativas;

  const posiciones = new Set<number>();
  for (const alt of distractores) {
    const real = CATALOGO_5.find((e) => e.id === alt.errorCatalogado)!.descripcion;
    posiciones.add(alt.opcionesAutoexplicacion!.indexOf(real));
  }
  assert.ok(posiciones.size > 1, "la real cae en distintas posiciones según el distractor");
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
