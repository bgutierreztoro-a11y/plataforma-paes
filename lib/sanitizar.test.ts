import test from "node:test";
import assert from "node:assert/strict";
import { sanitizarLeccion, sanitizarCierre } from "./sanitizar.ts";
import type { CierreContenido, Leccion } from "./tipos.ts";

/* La resolución de errorCatalogado → descripcionError va contra el catálogo
   canónico del módulo, content/errores/<moduloId>.json. Estos tests tocan
   content/errores/porcentaje.json de verdad: probar contra un stub no diría si
   la ruta y el prefijo de ids ("porcentaje/error-N" → "error-N") están bien
   resueltos. La forma completa de una lección la valida
   scripts/validar-contenido.mjs, no este test. */

/** Lección de prueba con `moduloId` y N distractores, cada uno con el id indicado. */
function leccionCon(moduloId: string | undefined, ...idsDistractores: (string | undefined)[]): Leccion {
  return {
    tipo: "leccion",
    id: "l-test",
    moduloId,
    titulo: "Test",
    objetivo: "",
    tiempoEstimadoMin: 1,
    prerrequisitos: [],
    conceptos: [],
    pasos: [],
    proveniencia: { fuentesAnalisis: ["secreta.pdf"], declaracionOriginalidad: "x" },
    itemsPAES: [
      {
        id: "i1",
        habilidad: "resolver",
        dificultad: "media",
        enunciado: "e",
        solucion: "no debe viajar",
        alternativas: [
          { clave: "A", texto: "a", esCorrecta: true },
          ...idsDistractores.map((errorCatalogado, i) => ({
            clave: ["B", "C", "D"][i] ?? `X${i}`,
            texto: "x",
            esCorrecta: false as const,
            ...(errorCatalogado ? { errorCatalogado } : {}),
          })),
        ],
      },
    ],
  } as Leccion;
}

test("con moduloId, el distractor recibe la descripción resuelta del canónico", () => {
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1"));
  const [, b] = limpia.itemsPAES[0].alternativas;
  /* "porcentaje/error-1" en content/errores/porcentaje.json; el prefijo de
     unidad se quita al construir el Map, así que se referencia "error-1" pelado. */
  assert.match(b.descripcionError!, /Confundir el porcentaje del CAMBIO/);
});

test("el catálogo NO viaja al cliente, solo la descripción del distractor referenciado", () => {
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1"));
  assert.equal("catalogoErrores" in limpia, false);
  assert.equal("proveniencia" in limpia, false);
  assert.equal("solucion" in limpia.itemsPAES[0], false);
  const serializado = JSON.stringify(limpia);
  /* error-1 sí viaja (lo usa un distractor); el resto del canónico de porcentaje
     no: solo se resuelve el id efectivamente referenciado. */
  assert.ok(serializado.includes("Confundir el porcentaje del CAMBIO"));
  assert.equal(serializado.includes("cantidad fija"), false, "error-2 no se referencia, no viaja");
  assert.equal(serializado.includes("Deshacer un cambio porcentual"), false, "error-7 tampoco");
});

test("con 3+ ids referenciados en el archivo, el distractor trae exactamente 3 opciones, una de ellas la real", () => {
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2", "error-3"));
  const [a, b] = limpia.itemsPAES[0].alternativas;

  assert.equal(b.opcionesAutoexplicacion?.length, 3);
  assert.equal(new Set(b.opcionesAutoexplicacion).size, 3, "sin repetidas");
  assert.ok(
    b.opcionesAutoexplicacion!.some((o) => /Confundir el porcentaje del CAMBIO/.test(o)),
    "la real (error-1) está entre las tres",
  );
  // La alternativa correcta no tiene errorCatalogado, así que no tiene opciones.
  assert.equal(a.opcionesAutoexplicacion, undefined);
});

test("los señuelos salen de los ids del archivo, no del catálogo del módulo", () => {
  /* La propiedad que separa esta implementación de la anterior. El canónico de
     porcentaje tiene 8 entradas y el archivo referencia tres (error-1/2/3): las
     opciones tienen que ser esas tres y ninguna más. Si los señuelos salieran
     del catálogo entero, aparecería la descripción de error-4..error-8, que esta
     lección no ejercita. */
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2", "error-3"));
  const [, b] = limpia.itemsPAES[0].alternativas;

  const ajenas = [/decimal/, /magnitud distinta/, /Deshacer un cambio/]; // error-3(sí)… no: error-4/8/7
  assert.ok(b.opcionesAutoexplicacion!.some((o) => /Confundir el porcentaje del CAMBIO/.test(o)));
  assert.ok(b.opcionesAutoexplicacion!.some((o) => /cantidad fija/.test(o)));
  assert.ok(b.opcionesAutoexplicacion!.some((o) => /Convertir mal el porcentaje a decimal/.test(o)));
  assert.equal(
    b.opcionesAutoexplicacion!.some((o) => /magnitud distinta de la pedida|Deshacer un cambio porcentual/.test(o)),
    false,
    "no aparece la descripción de un id que la lección no referencia",
  );
  void ajenas;
});

test("crecer el catálogo del módulo no mueve los señuelos de un archivo", () => {
  /* El corolario operativo de la migración a canónico: el catálogo que ve un
     archivo pasó de subconjunto embebido a canónico completo, y eso no cambió lo
     que el estudiante ve, porque los señuelos salen de los ids referenciados.
     Se compara referenciar los mismos 3 ids en dos ítems distintos: idéntico. */
  const a = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2", "error-3"));
  const b = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2", "error-3"));
  assert.deepEqual(
    a.itemsPAES[0].alternativas[1].opcionesAutoexplicacion,
    b.itemsPAES[0].alternativas[1].opcionesAutoexplicacion,
  );
});

test("con menos de 3 ids referenciados en el archivo, el ítem omite el paso de autoexplicación", () => {
  /* El canónico de porcentaje tiene 8 entradas y alcanzaría de sobra; lo que no
     alcanza es lo que el archivo ejercita: solo error-1 y error-2. */
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2"));
  const [, b] = limpia.itemsPAES[0].alternativas;
  assert.match(b.descripcionError!, /Confundir el porcentaje del CAMBIO/, "la Capa 2 sí sigue disponible");
  assert.equal(b.opcionesAutoexplicacion, undefined);
});

test("la posición de la opción real no es siempre la misma", () => {
  /* Si la verdadera cayera siempre primera, el patrón se aprende en dos ítems y
     la pregunta deja de medir nada. Se miran los tres distractores del mismo
     ítem: cada uno tiene su error real en una posición distinta de la lista. */
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-2", "error-3"));
  const [, ...distractores] = limpia.itemsPAES[0].alternativas;

  const posiciones = new Set<number>();
  for (const alt of distractores) {
    assert.ok(alt.descripcionError, "cada distractor resolvió");
    posiciones.add(alt.opcionesAutoexplicacion!.indexOf(alt.descripcionError!));
  }
  assert.ok(posiciones.size > 1, "la real cae en distintas posiciones según el distractor");
});

test("un id que no existe en el canónico del módulo se deja sin descripción, no se adivina", () => {
  const limpia = sanitizarLeccion(leccionCon("porcentaje", "error-1", "error-99", undefined));
  const [, b, c, d] = limpia.itemsPAES[0].alternativas;
  assert.match(b.descripcionError!, /Confundir el porcentaje del CAMBIO/);
  assert.equal(c.errorCatalogado, "error-99");
  assert.equal(c.descripcionError, undefined);
  assert.equal(d.descripcionError, undefined);
});

test("sin moduloId (l0-demo) no se resuelve nada", () => {
  const limpia = sanitizarLeccion(leccionCon(undefined, "error-1", "error-2"));
  for (const alt of limpia.itemsPAES[0].alternativas) {
    assert.equal(alt.descripcionError, undefined);
  }
});

test("un módulo sin content/errores/<moduloId>.json deja los distractores sin Capa 2", () => {
  /* Un moduloId que no tiene artefacto canónico: catalogoDelModulo devuelve un
     Map vacío y no se resuelve nada, en vez de reventar. */
  const limpia = sanitizarLeccion(leccionCon("modulo-inexistente", "error-1", "error-2"));
  for (const alt of limpia.itemsPAES[0].alternativas) {
    assert.equal(alt.descripcionError, undefined);
  }
});

test("el cierre resuelve contra el canónico de su moduloId, igual que una lección", () => {
  const cierre = {
    tipo: "cierre",
    id: "cierre-test",
    moduloId: "porcentaje",
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
          { clave: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-7" },
          { clave: "D", texto: "d", esCorrecta: false, errorCatalogado: "error-8" },
        ],
      },
    ],
  } as CierreContenido;

  const limpio = sanitizarCierre(cierre);
  const [, b] = limpio.items[0].alternativas;
  assert.match(b.descripcionError!, /No distinguir «aumentó UN p%»/);
});
