import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BANDA_INDECISION,
  GAMMA,
  K,
  MAX_ITEMS,
  MIN_ITEMS,
  UMBRAL_P_DOMINADA,
} from "../constantes.ts";
import { ancestros, centralidad, construirDag, descendientes } from "../dag.ts";
import {
  causaDeUnidad,
  crearEstado,
  debeTerminar,
  ejecutarDiagnostico,
  errorNombrable,
  probabilidad,
  registrarRespuesta,
  siguienteItem,
  type EstadoDiagnostico,
  type Respuesta,
} from "../motor.ts";
import { estimarBanda, generarPlan } from "../plan.ts";
import type { DominioSerializado, EstadoUnidad, ItemDiagnostico } from "../tipos.ts";
import {
  BANCO_FIXTURE,
  CLAVE_CORRECTA,
  DAG_FIXTURE,
  errorDe,
  generadorDeterminista,
  itemsDe,
  UNIDADES_FIXTURE,
} from "./fixtures.ts";

/**
 * El motor del diagnóstico es aritmética pura sobre un grafo: no toca red, DOM
 * ni base de datos, así que se verifica acá y no mirando pantallas. Corre con
 * el runner de Node (`node --test`) sobre TypeScript sin transpilar, usando el
 * type-stripping nativo. Cero dependencias nuevas (CLAUDE.md).
 *
 * Todo se prueba contra el DAG sintético de `fixtures.ts`. El DAG real todavía
 * no tiene aristas —las escribe una persona, no un modelo— y el único test que
 * lo mira comprueba justamente eso.
 */

/** Igualdad de flotantes con tolerancia: acá se suman potencias de 0,5. */
function casi(actual: number, esperado: number, mensaje?: string): void {
  assert.ok(
    Math.abs(actual - esperado) < 1e-9,
    mensaje ?? `esperaba ${esperado}, llegó ${actual}`,
  );
}

function unidadDe(estado: EstadoDiagnostico, id: string): EstadoUnidad {
  const unidad = estado.unidades.get(id);
  assert.ok(unidad, `el estado no tiene la unidad ${id}`);
  return unidad;
}

/** Responde siempre la misma clave con la misma confianza. */
function siempre(clave: string, confianza: Respuesta["confianza"]): () => Respuesta {
  return () => ({ clave, confianza });
}

const TODO_BIEN = siempre(CLAVE_CORRECTA, "lo-sabia");
const TODO_MAL = siempre("B", "lo-sabia");

describe("dag", () => {
  test("valida ids inexistentes, duplicados y ciclos", () => {
    assert.throws(
      () => construirDag([{ id: "a", nombre: "A", eje: "numeros", prerrequisitos: ["fantasma"] }]),
      /fantasma/,
    );
    assert.throws(
      () =>
        construirDag([
          { id: "a", nombre: "A", eje: "numeros", prerrequisitos: [] },
          { id: "a", nombre: "A otra vez", eje: "numeros", prerrequisitos: [] },
        ]),
      /duplicada/,
    );
    assert.throws(
      () =>
        construirDag([
          { id: "a", nombre: "A", eje: "numeros", prerrequisitos: ["b"] },
          { id: "b", nombre: "B", eje: "numeros", prerrequisitos: ["a"] },
        ]),
      /ciclo/,
    );
    assert.throws(() => construirDag([]), /no tiene unidades/);
  });

  test("ancestros y descendientes salen a la distancia mínima", () => {
    const deEpsilon = ancestros(DAG_FIXTURE, "epsilon");
    assert.deepEqual(
      [...deEpsilon.entries()].sort(),
      [
        ["alfa", 3],
        ["beta", 2],
        ["delta", 1],
        ["gamma", 2],
      ],
    );

    const deAlfa = descendientes(DAG_FIXTURE, "alfa");
    assert.deepEqual(
      [...deAlfa.entries()].sort(),
      [
        ["beta", 1],
        ["delta", 2],
        ["epsilon", 3],
        ["gamma", 1],
      ],
    );

    assert.equal(ancestros(DAG_FIXTURE, "zeta").size, 0);
    assert.equal(descendientes(DAG_FIXTURE, "zeta").size, 0);
  });

  test("la centralidad suma ancestros y descendientes", () => {
    assert.equal(centralidad(DAG_FIXTURE, "alfa"), 4);
    assert.equal(centralidad(DAG_FIXTURE, "delta"), 4);
    assert.equal(centralidad(DAG_FIXTURE, "epsilon"), 4);
    assert.equal(centralidad(DAG_FIXTURE, "beta"), 3);
    assert.equal(centralidad(DAG_FIXTURE, "zeta"), 0);
  });
});

describe("propagación por el DAG", () => {
  // Caso (f) del encargo.
  test("acertar un nodo hoja sube el logOdds de sus ancestros, atenuado por distancia", () => {
    const inicial = crearEstado(DAG_FIXTURE);
    const [item] = itemsDe("epsilon");
    const estado = registrarRespuesta(inicial, DAG_FIXTURE, item, CLAVE_CORRECTA, "lo-sabia");

    const delta = K * 1.0;
    casi(unidadDe(estado, "epsilon").logOdds, delta);
    casi(unidadDe(estado, "delta").logOdds, delta * GAMMA ** 1);
    casi(unidadDe(estado, "beta").logOdds, delta * GAMMA ** 2);
    casi(unidadDe(estado, "gamma").logOdds, delta * GAMMA ** 2);
    casi(unidadDe(estado, "alfa").logOdds, delta * GAMMA ** 3);

    for (const id of ["delta", "beta", "gamma", "alfa"]) {
      assert.ok(unidadDe(estado, id).logOdds > 0, `${id} debería haber subido`);
    }
    // La unidad aislada no se entera de nada.
    casi(unidadDe(estado, "zeta").logOdds, 0);
    // Propagar no cuenta como haber preguntado.
    assert.equal(unidadDe(estado, "alfa").itemsVistos, 0);
  });

  // Caso (g) del encargo.
  test("fallar un nodo raíz baja el logOdds de sus descendientes", () => {
    const inicial = crearEstado(DAG_FIXTURE);
    const [item] = itemsDe("alfa");
    const estado = registrarRespuesta(inicial, DAG_FIXTURE, item, "B", "lo-sabia");

    const delta = K * 1.0;
    casi(unidadDe(estado, "alfa").logOdds, -delta);
    casi(unidadDe(estado, "beta").logOdds, -delta * GAMMA ** 1);
    casi(unidadDe(estado, "gamma").logOdds, -delta * GAMMA ** 1);
    casi(unidadDe(estado, "delta").logOdds, -delta * GAMMA ** 2);
    casi(unidadDe(estado, "epsilon").logOdds, -delta * GAMMA ** 3);

    for (const id of ["beta", "gamma", "delta", "epsilon"]) {
      assert.ok(unidadDe(estado, id).logOdds < 0, `${id} debería haber bajado`);
    }
    casi(unidadDe(estado, "zeta").logOdds, 0);
  });

  test("el acierto sube solo hacia atrás y el fallo baja solo hacia adelante", () => {
    const inicial = crearEstado(DAG_FIXTURE);
    const [itemAlfa] = itemsDe("alfa");
    const acierto = registrarRespuesta(inicial, DAG_FIXTURE, itemAlfa, CLAVE_CORRECTA, "lo-sabia");
    // alfa es raíz: un acierto suyo no toca a nadie más.
    for (const id of ["beta", "gamma", "delta", "epsilon", "zeta"]) {
      casi(unidadDe(acierto, id).logOdds, 0, `${id} no debería moverse`);
    }

    const [itemEpsilon] = itemsDe("epsilon");
    const fallo = registrarRespuesta(inicial, DAG_FIXTURE, itemEpsilon, "B", "lo-sabia");
    // epsilon es hoja: un fallo suyo no arrastra a sus prerrequisitos.
    for (const id of ["alfa", "beta", "gamma", "delta", "zeta"]) {
      casi(unidadDe(fallo, id).logOdds, 0, `${id} no debería moverse`);
    }
  });

  test("la propagación se corta pasada PROFUNDIDAD_MAX", () => {
    // Cadena de 5 en línea: n5 queda a distancia 4 de n1 y no debe enterarse.
    const cadena = construirDag([
      { id: "n1", nombre: "N1", eje: "numeros", prerrequisitos: [] },
      { id: "n2", nombre: "N2", eje: "numeros", prerrequisitos: ["n1"] },
      { id: "n3", nombre: "N3", eje: "numeros", prerrequisitos: ["n2"] },
      { id: "n4", nombre: "N4", eje: "numeros", prerrequisitos: ["n3"] },
      { id: "n5", nombre: "N5", eje: "numeros", prerrequisitos: ["n4"] },
    ]);
    const item: ItemDiagnostico = {
      id: "cadena-1",
      unidadId: "n1",
      aislante: true,
      enunciado: "raíz de la cadena",
      alternativas: [
        { clave: "A", texto: "ok", esCorrecta: true },
        { clave: "B", texto: "mal", esCorrecta: false, errorCatalogado: "err-cadena" },
      ],
    };

    const estado = registrarRespuesta(crearEstado(cadena), cadena, item, "B", "lo-sabia");
    assert.ok(unidadDe(estado, "n4").logOdds < 0, "n4 está a distancia 3 y sí recibe");
    casi(unidadDe(estado, "n5").logOdds, 0, "n5 está a distancia 4 y no debe recibir");
  });

  test("los pesos por confianza son asimétricos entre acierto y fallo", () => {
    const [item] = itemsDe("zeta");
    const acertoAdivinando = registrarRespuesta(
      crearEstado(DAG_FIXTURE),
      DAG_FIXTURE,
      item,
      CLAVE_CORRECTA,
      "adivine",
    );
    const falloAdivinando = registrarRespuesta(
      crearEstado(DAG_FIXTURE),
      DAG_FIXTURE,
      item,
      "B",
      "adivine",
    );

    casi(unidadDe(acertoAdivinando, "zeta").logOdds, K * 0.25);
    casi(unidadDe(falloAdivinando, "zeta").logOdds, -K * 0.5);
    assert.ok(
      Math.abs(unidadDe(falloAdivinando, "zeta").logOdds) >
        Math.abs(unidadDe(acertoAdivinando, "zeta").logOdds),
      "fallar adivinando informa más que acertar adivinando",
    );
  });

  test("rechaza el ítem incoherente en vez de inventar evidencia", () => {
    const inicial = crearEstado(DAG_FIXTURE);
    const [item] = itemsDe("zeta");
    assert.throws(
      () => registrarRespuesta(inicial, DAG_FIXTURE, item, "Z", "lo-sabia"),
      /alternativa Z/,
    );

    const sinError: ItemDiagnostico = {
      ...item,
      alternativas: [
        { clave: "A", texto: "ok", esCorrecta: true },
        { clave: "B", texto: "mal y sin catalogar", esCorrecta: false },
      ],
    };
    assert.throws(
      () => registrarRespuesta(inicial, DAG_FIXTURE, sinError, "B", "lo-sabia"),
      /errorCatalogado/,
    );
  });

  test("registrarRespuesta no muta el estado que recibe", () => {
    const inicial = crearEstado(DAG_FIXTURE);
    const [item] = itemsDe("zeta");
    registrarRespuesta(inicial, DAG_FIXTURE, item, "B", "lo-sabia");
    casi(unidadDe(inicial, "zeta").logOdds, 0);
    assert.equal(inicial.itemsVistos, 0);
    assert.equal(unidadDe(inicial, "zeta").fallos.length, 0);
  });
});

describe("selección del siguiente ítem", () => {
  test("empieza por la unidad más central, con todo empatado en incertidumbre", () => {
    const item = siguienteItem(crearEstado(DAG_FIXTURE), DAG_FIXTURE, BANCO_FIXTURE);
    assert.ok(item);
    // |L| = 0 en todas; centralidad 4 en alfa, delta y epsilon; gana la primera declarada.
    assert.equal(item.unidadId, "alfa");
  });

  test("nunca entrega un ítem no aislante ni repite uno ya usado", () => {
    const usados: string[] = [];
    ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, (item) => {
      assert.ok(item.aislante, `${item.id} no es aislante y fue seleccionado`);
      assert.ok(!usados.includes(item.id), `${item.id} se preguntó dos veces`);
      usados.push(item.id);
      return TODO_MAL();
    });
    assert.ok(usados.length > 0);
  });

  test("la confirmación busca un ítem que apunte al mismo error ya registrado", () => {
    let estado = crearEstado(DAG_FIXTURE);
    const [primero] = itemsDe("zeta");
    estado = registrarRespuesta(estado, DAG_FIXTURE, primero, "C", "lo-sabia");
    assert.equal(unidadDe(estado, "zeta").requiereConfirmacion, true);

    const siguiente = siguienteItem(estado, DAG_FIXTURE, BANCO_FIXTURE);
    assert.ok(siguiente);
    assert.equal(siguiente.unidadId, "zeta", "la hipótesis abierta manda sobre la incertidumbre");
    const errorRegistrado = errorDe("zeta", "C");
    assert.ok(
      siguiente.alternativas.some((a) => a.errorCatalogado === errorRegistrado),
      "el ítem de confirmación debería poder reproducir el mismo error",
    );
  });

  test("devuelve null cuando no queda ítem aislante sin usar", () => {
    let estado = crearEstado(DAG_FIXTURE);
    for (const item of BANCO_FIXTURE.filter((i) => i.aislante)) {
      estado = registrarRespuesta(estado, DAG_FIXTURE, item, CLAVE_CORRECTA, "lo-sabia");
    }
    assert.equal(siguienteItem(estado, DAG_FIXTURE, BANCO_FIXTURE), null);
    assert.equal(debeTerminar(estado, DAG_FIXTURE, BANCO_FIXTURE), true);
  });
});

describe("parada", () => {
  // Caso (a) del encargo.
  test("el alumno que acierta todo con 'lo-sabia' termina corto y sin brechas", () => {
    const estado = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, TODO_BIEN);

    assert.ok(
      estado.itemsVistos <= 10,
      `debería terminar en 10 ítems o menos, terminó en ${estado.itemsVistos}`,
    );
    assert.ok(estado.itemsVistos >= MIN_ITEMS);

    const plan = generarPlan(estado, DAG_FIXTURE);
    assert.equal(plan.sinBrechas, true);
    assert.ok(plan.unidades.every((u) => u.estado === "dominada-inferida"));
    assert.ok(plan.unidades.every((u) => u.causa === null));
    assert.equal(plan.raizRecomendada, null, "sin brechas no hay por dónde empezar");
  });

  // Caso (b) del encargo.
  test("el alumno que falla todo no deja ninguna unidad dominada", () => {
    const estado = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, TODO_MAL);
    const plan = generarPlan(estado, DAG_FIXTURE);

    assert.ok(
      plan.unidades.every((u) => u.estado !== "dominada-inferida"),
      "ninguna unidad puede quedar dominada si el alumno falló todo",
    );
    assert.ok(plan.unidades.every((u) => u.p < UMBRAL_P_DOMINADA));
    assert.equal(plan.sinBrechas, false);
  });

  // Caso (c) del encargo.
  test("un fallo aislado obliga a un segundo ítem de esa unidad antes de poder terminar", () => {
    let yaFalle = false;
    const estados: EstadoDiagnostico[] = [];

    const estado = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, (item, actual) => {
      estados.push(actual);
      if (!yaFalle && item.unidadId === "zeta") {
        yaFalle = true;
        return { clave: "B", confianza: "lo-sabia" };
      }
      return TODO_BIEN();
    });

    assert.ok(yaFalle, "el fixture debería haber preguntado por zeta");
    assert.ok(
      unidadDe(estado, "zeta").itemsVistos >= 2,
      "zeta falló una vez: el test no puede cerrar sin volver a preguntarle",
    );

    // Y el bloqueo es explícito: con la hipótesis abierta, parar está prohibido.
    let conFalloAbierto = crearEstado(DAG_FIXTURE);
    const [item] = itemsDe("zeta");
    conFalloAbierto = registrarRespuesta(conFalloAbierto, DAG_FIXTURE, item, "B", "lo-sabia");
    assert.equal(unidadDe(conFalloAbierto, "zeta").requiereConfirmacion, true);
    assert.equal(debeTerminar(conFalloAbierto, DAG_FIXTURE, BANCO_FIXTURE), false);
  });

  // Caso (h) del encargo.
  test("ninguna estrategia de respuesta se sale de [MIN_ITEMS, MAX_ITEMS]", () => {
    const azar = generadorDeterminista(20260802);
    const estrategias: Array<[string, (item: ItemDiagnostico) => Respuesta]> = [
      ["todo bien", TODO_BIEN],
      ["todo mal", TODO_MAL],
      ["todo adivinado y bien", siempre(CLAVE_CORRECTA, "adivine")],
      ["todo adivinado y mal", siempre("B", "adivine")],
      ["deducido a medias", siempre("C", "lo-deduje")],
      [
        "alternando por unidad",
        (item) =>
          item.unidadId < "delta"
            ? { clave: CLAVE_CORRECTA, confianza: "lo-sabia" }
            : { clave: "D", confianza: "lo-deduje" },
      ],
      [
        "al azar determinista",
        () => {
          const claves = [CLAVE_CORRECTA, "B", "C", "D"];
          const confianzas = ["lo-sabia", "lo-deduje", "adivine"] as const;
          return {
            clave: claves[Math.floor(azar() * claves.length)],
            confianza: confianzas[Math.floor(azar() * confianzas.length)],
          };
        },
      ],
    ];

    for (const [nombre, responder] of estrategias) {
      const estado = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, responder);
      assert.ok(
        estado.itemsVistos <= MAX_ITEMS,
        `"${nombre}" pasó de MAX_ITEMS: ${estado.itemsVistos}`,
      );
      assert.ok(
        estado.itemsVistos >= MIN_ITEMS,
        `"${nombre}" terminó bajo MIN_ITEMS: ${estado.itemsVistos}`,
      );
    }
  });

  test("bajo MIN_ITEMS sigue aunque no quede indecisión", () => {
    let estado = crearEstado(DAG_FIXTURE);
    // Un acierto seguro por unidad deja las seis fuera de la banda con 6 ítems.
    for (const unidad of UNIDADES_FIXTURE) {
      const [item] = itemsDe(unidad.id);
      estado = registrarRespuesta(estado, DAG_FIXTURE, item, CLAVE_CORRECTA, "lo-sabia");
    }
    const [piso, techo] = BANDA_INDECISION;
    assert.ok(
      [...estado.unidades.values()].every((u) => u.logOdds < piso || u.logOdds > techo),
      "las seis unidades deberían estar fuera de la banda",
    );
    assert.equal(estado.itemsVistos, 6);
    assert.equal(debeTerminar(estado, DAG_FIXTURE, BANCO_FIXTURE), false);
  });
});

describe("causa y regla dura de nombrar el error", () => {
  function tras(respuestas: Array<[numero: number, clave: string]>): EstadoUnidad {
    let estado = crearEstado(DAG_FIXTURE);
    const items = itemsDe("zeta");
    for (const [numero, clave] of respuestas) {
      estado = registrarRespuesta(estado, DAG_FIXTURE, items[numero], clave, "lo-sabia");
    }
    return unidadDe(estado, "zeta");
  }

  // Caso (d) del encargo.
  test("dos fallos con el mismo errorCatalogado dan 'error-confirmado' y sí se nombra", () => {
    const zeta = tras([
      [0, "B"],
      [1, "B"],
    ]);
    assert.equal(causaDeUnidad(zeta), "error-confirmado");
    assert.equal(errorNombrable(zeta), errorDe("zeta", "B"));
  });

  test("dos fallos con errores distintos dan 'punto-debil' y no se nombra nada", () => {
    const zeta = tras([
      [0, "B"],
      [1, "C"],
    ]);
    assert.equal(causaDeUnidad(zeta), "punto-debil");
    assert.equal(errorNombrable(zeta), null);
  });

  // Caso (e) del encargo.
  test("un fallo y un acierto dan 'a-reforzar' y el error NO se nombra", () => {
    const zeta = tras([
      [0, "B"],
      [1, CLAVE_CORRECTA],
    ]);
    assert.equal(causaDeUnidad(zeta), "a-reforzar");
    assert.equal(
      errorNombrable(zeta),
      null,
      "un fallo abre una hipótesis, no un diagnóstico: nombrar el error sería inventar",
    );
    // El dato del fallo no se pierde, simplemente no se le muestra al alumno.
    assert.equal(zeta.fallos.length, 1);
    assert.equal(zeta.fallos[0].errorCatalogado, errorDe("zeta", "B"));
  });

  test("sin ítems la causa es 'sin-datos' y sin fallos no hay causa", () => {
    const intacta = unidadDe(crearEstado(DAG_FIXTURE), "zeta");
    assert.equal(causaDeUnidad(intacta), "sin-datos");
    assert.equal(errorNombrable(intacta), null);

    const soloAciertos = tras([
      [0, CLAVE_CORRECTA],
      [1, CLAVE_CORRECTA],
    ]);
    assert.equal(causaDeUnidad(soloAciertos), null);
    assert.equal(errorNombrable(soloAciertos), null);
  });

  test("ninguna causa distinta de 'error-confirmado' deja nombrar el error", () => {
    const estado = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, (item) =>
      item.unidadId === "beta"
        ? { clave: "B", confianza: "lo-sabia" }
        : { clave: "C", confianza: "lo-deduje" },
    );
    for (const unidad of generarPlan(estado, DAG_FIXTURE).unidades) {
      if (unidad.causa !== "error-confirmado") {
        assert.equal(
          unidad.errorNombrable,
          null,
          `${unidad.unidadId} tiene causa ${unidad.causa} y aun así nombró un error`,
        );
      }
    }
  });
});

describe("plan", () => {
  test("sin evidencia, lo que tiene prerrequisitos no dominados queda atenuado", () => {
    const plan = generarPlan(crearEstado(DAG_FIXTURE), DAG_FIXTURE);
    const porId = new Map(plan.unidades.map((u) => [u.unidadId, u]));

    assert.equal(porId.get("alfa")?.estado, "disponible");
    assert.equal(porId.get("zeta")?.estado, "disponible");
    for (const id of ["beta", "gamma", "delta", "epsilon"]) {
      assert.equal(porId.get(id)?.estado, "atenuada", `${id} debería estar atenuada`);
    }
    // Entre alfa y zeta gana alfa: desbloquea 4 descendientes contra 0.
    assert.equal(plan.raizRecomendada, "alfa");
    assert.ok(plan.unidades.every((u) => u.causa === "sin-datos"));
  });

  test("dominar un prerrequisito pone disponibles a sus dependientes", () => {
    const [item] = itemsDe("alfa");
    const estado = registrarRespuesta(
      crearEstado(DAG_FIXTURE),
      DAG_FIXTURE,
      item,
      CLAVE_CORRECTA,
      "lo-sabia",
    );
    const plan = generarPlan(estado, DAG_FIXTURE);
    const porId = new Map(plan.unidades.map((u) => [u.unidadId, u]));

    assert.equal(porId.get("alfa")?.estado, "dominada-inferida");
    assert.equal(porId.get("beta")?.estado, "disponible");
    assert.equal(porId.get("gamma")?.estado, "disponible");
    assert.equal(porId.get("delta")?.estado, "atenuada");
    // beta y gamma desbloquean 2 cada una y comparten eje: gana la primera declarada.
    assert.equal(plan.raizRecomendada, "beta");
  });

  test("estimarBanda es lineal, va de PUNTAJE_MIN a PUNTAJE_MAX y no se sale", () => {
    assert.deepEqual(estimarBanda(0), { min: 100, max: 140 });
    assert.deepEqual(estimarBanda(0.5), { min: 510, max: 590 });
    assert.deepEqual(estimarBanda(1), { min: 960, max: 1000 });
    // Fuera de rango se recorta en vez de escupir un puntaje imposible.
    assert.deepEqual(estimarBanda(-3), { min: 100, max: 140 });
    assert.deepEqual(estimarBanda(7), { min: 960, max: 1000 });
  });

  test("sinBrechas exige piso de ítems, todo dominado y cero fallos", () => {
    const conUnFallo = ejecutarDiagnostico(DAG_FIXTURE, BANCO_FIXTURE, (item) =>
      item.id === "fx-alfa-1" ? { clave: "B", confianza: "lo-sabia" } : TODO_BIEN(),
    );
    assert.ok(unidadDe(conUnFallo, "alfa").fallos.length > 0);
    assert.equal(generarPlan(conUnFallo, DAG_FIXTURE).sinBrechas, false);
  });

  test("probabilidad traduce log-odds a [0, 1]", () => {
    casi(probabilidad(0), 0.5);
    assert.ok(probabilidad(-100) >= 0);
    assert.ok(probabilidad(100) <= 1);
    assert.ok(probabilidad(K) > UMBRAL_P_DOMINADA, "un acierto seguro debe cruzar el umbral");
  });
});

describe("dag-m1.json", () => {
  test("trae las 16 unidades del temario y ninguna arista", () => {
    const ruta = new URL("../../../content/diagnostico/dag-m1.json", import.meta.url);
    const dominio = JSON.parse(readFileSync(ruta, "utf8")) as DominioSerializado;

    assert.equal(dominio.unidades.length, 16);
    assert.deepEqual(
      dominio.unidades.filter((u) => u.prerrequisitos.length > 0),
      [],
      "las aristas del DAG real las escribe una persona, no este motor",
    );

    // Aunque hoy esté sin aristas, tiene que ser un DAG construible: este test
    // pasa a ser el guardia de ciclos e ids rotos cuando se llenen a mano.
    const dag = construirDag(dominio.unidades);
    assert.equal(dag.unidades.length, 16);

    const porEje = new Map<string, number>();
    for (const unidad of dominio.unidades) {
      porEje.set(unidad.eje, (porEje.get(unidad.eje) ?? 0) + 1);
    }
    assert.deepEqual(
      [...porEje.entries()].sort(),
      [
        ["algebra", 6],
        ["geometria", 4],
        ["numeros", 3],
        ["probabilidad", 3],
      ],
    );
  });
});
