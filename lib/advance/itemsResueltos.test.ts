import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FilaAdvanceDescarte } from "../datos/advanceDescartes.ts";
import type { ItemAdvance } from "./descarte.ts";
import { itemsResueltosDe } from "./itemsResueltos.ts";

/* Banco en memoria, sin mezclar (claveOriginal = clave, como lo entrega
   obtenerBanco). Correcta C; A → error-1, B → error-2, D → error-3. */
function item(id: string, errores: [string, string, string] = ["error-1", "error-2", "error-3"]): ItemAdvance {
  return {
    id,
    unidadId: "prueba",
    moduloId: "prueba",
    habilidad: "resolver",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado: "Enunciado de prueba.",
    alternativas: [
      { clave: "A", claveOriginal: "A", texto: "a", esCorrecta: false, errorCatalogado: errores[0], feedbackDescarte: "f" },
      { clave: "B", claveOriginal: "B", texto: "b", esCorrecta: false, errorCatalogado: errores[1], feedbackDescarte: "f" },
      { clave: "C", claveOriginal: "C", texto: "c", esCorrecta: true, feedbackDescarteIncorrecto: "f" },
      { clave: "D", claveOriginal: "D", texto: "d", esCorrecta: false, errorCatalogado: errores[2], feedbackDescarte: "f" },
    ],
    solucion: "Solución de prueba.",
  };
}

const CREADO = new Date("2026-09-12T02:46:13.746Z");

function fila(
  itemId: string,
  ordenDescartes: string[],
  descarteFatal: string | null,
  creadoEn = CREADO,
): FilaAdvanceDescarte {
  return {
    id: `id-${itemId}-${creadoEn.getTime()}`,
    usuario_id: "user_prueba",
    sesion_id: "sesion-1",
    unidad_id: "prueba",
    item_id: itemId,
    orden_descartes: ordenDescartes,
    /* A propósito distinto de lo que dice el banco: el cruce no debe leerlo. */
    errores_identificados: ["error-99"],
    descarte_fatal: descarteFatal,
    tiempo_ms: 42_000,
    creado_en: creadoEn,
  };
}

const BANCO = [item("adv-prueba-001"), item("adv-prueba-002")];

describe("itemsResueltosDe", () => {
  it("fila normal: los tres distractores del banco en orden del JSON, sin la correcta, y enMs = creado_en", () => {
    const [r] = itemsResueltosDe([fila("adv-prueba-001", ["A", "B", "D"], null)], BANCO);
    assert.equal(r.itemId, "adv-prueba-001");
    assert.deepEqual(r.distractores, [
      { claveOriginal: "A", errorId: "error-1" },
      { claveOriginal: "B", errorId: "error-2" },
      { claveOriginal: "D", errorId: "error-3" },
    ]);
    assert.deepEqual(r.ordenDescartes, ["A", "B", "D"]);
    assert.equal(r.descarteFatal, null);
    assert.equal(r.enMs, CREADO.getTime());
  });

  it("los errores salen del banco, no de errores_identificados", () => {
    const [r] = itemsResueltosDe([fila("adv-prueba-001", ["A"], null)], BANCO);
    assert.ok(r.distractores.every((d) => d.errorId !== "error-99"));
  });

  it("fila con fatal: descarteFatal y ordenDescartes viajan tal cual", () => {
    const [r] = itemsResueltosDe([fila("adv-prueba-001", ["A", "C"], "C")], BANCO);
    assert.equal(r.descarteFatal, "C");
    assert.deepEqual(r.ordenDescartes, ["A", "C"]);
  });

  it("una fila de un ítem que no está en el banco se descarta y las demás siguen", () => {
    const resueltos = itemsResueltosDe(
      [
        fila("adv-prueba-001", ["A", "B", "D"], null),
        fila("adv-retirado-007", ["A", "B", "D"], null),
        fila("adv-prueba-002", ["B"], "C"),
      ],
      BANCO,
    );
    assert.deepEqual(
      resueltos.map((r) => r.itemId),
      ["adv-prueba-001", "adv-prueba-002"],
    );
  });

  it("un errorCatalogado fuera del catálogo se conserva con su id: la omisión es de pantalla (D12)", () => {
    const banco = [item("adv-prueba-003", ["error-1", "error-fantasma", "error-3"])];
    const [r] = itemsResueltosDe([fila("adv-prueba-003", ["B"], null)], banco);
    assert.deepEqual(
      r.distractores.map((d) => d.errorId),
      ["error-1", "error-fantasma", "error-3"],
    );
  });

  it("filas de dos sesiones conservan el orden de entrada, que es el cronológico de la consulta", () => {
    const despues = new Date(CREADO.getTime() + 2 * 24 * 60 * 60 * 1000);
    const resueltos = itemsResueltosDe(
      [
        fila("adv-prueba-002", ["A"], null, CREADO),
        fila("adv-prueba-001", ["A"], null, despues),
      ],
      BANCO,
    );
    assert.deepEqual(
      resueltos.map((r) => [r.itemId, r.enMs]),
      [
        ["adv-prueba-002", CREADO.getTime()],
        ["adv-prueba-001", despues.getTime()],
      ],
    );
  });

  it("sin filas devuelve vacío; sin banco descarta todo", () => {
    assert.deepEqual(itemsResueltosDe([], BANCO), []);
    assert.deepEqual(itemsResueltosDe([fila("adv-prueba-001", ["A"], null)], []), []);
  });
});
