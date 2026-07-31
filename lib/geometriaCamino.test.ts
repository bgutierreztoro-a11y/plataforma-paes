import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ALTO_ENCABEZADO_EJE,
  PASO_FILA,
  PASO_FILA_META,
  RESERVA_TARJETA,
  altoDeElemento,
  desplazamientoVertical,
  desplazamientoDeNodo,
  tapariaUnaBanda,
  type ElementoColumna,
} from "./geometriaCamino.ts";

/**
 * El ancla de la tarjeta del nodo activo sale de `desplazamientoVertical`. Es
 * aritmética pura y sin DOM, así que se verifica acá y no mirando capturas: si
 * el número se desvía, la tarjeta se despega del nodo en escritorio y eso no
 * rompe ningún test de pantalla — simplemente se ve mal.
 *
 * Corre con el runner de Node (`node --test`) sobre TypeScript sin transpilar,
 * usando el type-stripping nativo. Cero dependencias nuevas (CLAUDE.md).
 */

const nodo = (meta = false): ElementoColumna => ({ tipo: "nodo", meta });
const encabezado = (): ElementoColumna => ({ tipo: "encabezado" });

/** Los `n` nodos normales seguidos que hacen falta para armar un caso. */
const nodos = (n: number): ElementoColumna[] => Array.from({ length: n }, () => nodo());

describe("altoDeElemento", () => {
  test("distingue los tres altos que existen", () => {
    assert.equal(altoDeElemento(nodo()), PASO_FILA);
    assert.equal(altoDeElemento(nodo(true)), PASO_FILA_META);
    assert.equal(altoDeElemento(encabezado()), ALTO_ENCABEZADO_EJE);
  });
});

describe("desplazamientoVertical", () => {
  /**
   * Caso 1 — regresión. Sin encabezados y sin metas, el resultado tiene que ser
   * exactamente el de antes de agrupar por eje: `(i + 1) * PASO_FILA`.
   *
   * Es el caso del segundo nivel (`CaminoLecciones`), que arma una columna de
   * puros nodos. Si esta afirmación se cae, la agrupación por ejes le cambió la
   * geometría a una pantalla que no participaba del rediseño.
   */
  test("columna de puros nodos: idéntica a la fórmula anterior", () => {
    const columna = nodos(6);
    for (let i = 0; i < columna.length; i++) {
      assert.equal(desplazamientoVertical(columna, i), (i + 1) * PASO_FILA);
    }
  });

  /** Caso 2 — la fila del cierre es más alta y suma su propio alto, no el
   *  normal. Es el único alto de fila distinto que existe. */
  test("la meta suma PASO_FILA_META", () => {
    const columna = [nodo(), nodo(), nodo(true)];
    assert.equal(desplazamientoVertical(columna, 1), 2 * PASO_FILA);
    assert.equal(desplazamientoVertical(columna, 2), 2 * PASO_FILA + PASO_FILA_META);
  });

  /** Caso 3 — un encabezado al inicio corre todos los nodos, exactamente su
   *  alto y ni un píxel más. */
  test("encabezado al inicio: corre toda la columna", () => {
    const columna = [encabezado(), ...nodos(3)];
    for (let i = 1; i < columna.length; i++) {
      assert.equal(
        desplazamientoVertical(columna, i),
        ALTO_ENCABEZADO_EJE + i * PASO_FILA,
      );
    }
  });

  /**
   * Caso 4 — el que R1 podía romper. Un encabezado a mitad de columna corre
   * **solo** los nodos que vienen después. Si corriera también los de arriba,
   * la tarjeta se despegaría de los nodos del primer eje.
   */
  test("encabezado intercalado: solo corre lo que viene después", () => {
    const columna = [nodo(), nodo(), encabezado(), nodo()];

    // Antes del encabezado: sin cambios respecto de la columna plana.
    assert.equal(desplazamientoVertical(columna, 0), PASO_FILA);
    assert.equal(desplazamientoVertical(columna, 1), 2 * PASO_FILA);

    // El encabezado mismo y el nodo que lo sigue.
    assert.equal(desplazamientoVertical(columna, 2), 2 * PASO_FILA + ALTO_ENCABEZADO_EJE);
    assert.equal(desplazamientoVertical(columna, 3), 3 * PASO_FILA + ALTO_ENCABEZADO_EJE);
  });

  /** Caso 5 — el primer elemento, que es donde un bucle `k <= i` se equivoca
   *  más fácil. */
  test("índice 0 devuelve el alto del primer elemento", () => {
    assert.equal(desplazamientoVertical([encabezado(), nodo()], 0), ALTO_ENCABEZADO_EJE);
    assert.equal(desplazamientoVertical([nodo(), nodo()], 0), PASO_FILA);
  });

  /**
   * Caso 6 — la columna real de /camino tras esta fase, con los 4 ejes del
   * temario M1: Números (3 unidades) y Álgebra y funciones (6) abiertos,
   * Geometría (4) y Probabilidad y estadística (3) colapsados.
   *
   * Los dos ejes colapsados van al final y por eso no corren ningún nodo; se
   * incluyen igual porque el día que se expanda uno, este número tiene que
   * seguir saliendo del mismo cálculo.
   */
  test("la columna real de /camino: 4 ejes, 2 abiertos", () => {
    const columna: ElementoColumna[] = [
      encabezado(), // Números
      ...nodos(3),
      encabezado(), // Álgebra y funciones
      ...nodos(6),
      encabezado(), // Geometría, colapsado
      encabezado(), // Probabilidad y estadística, colapsado
    ];

    // Último nodo de Números (índice 3): un encabezado y tres filas.
    assert.equal(
      desplazamientoVertical(columna, 3),
      ALTO_ENCABEZADO_EJE + 3 * PASO_FILA,
    );

    // Último nodo de Álgebra (índice 10): dos encabezados y nueve filas.
    assert.equal(
      desplazamientoVertical(columna, 10),
      2 * ALTO_ENCABEZADO_EJE + 9 * PASO_FILA,
    );

    // El total de la columna, con las dos bandas colapsadas del pie.
    assert.equal(
      desplazamientoVertical(columna, columna.length - 1),
      4 * ALTO_ENCABEZADO_EJE + 9 * PASO_FILA,
    );
  });

  /** Un índice fuera de rango no inventa filas: devuelve el alto total. */
  test("índice fuera de rango: devuelve el total, no filas fantasma", () => {
    const columna = nodos(2);
    assert.equal(desplazamientoVertical(columna, 99), 2 * PASO_FILA);
  });
});

describe("tapariaUnaBanda", () => {
  /**
   * El caso real que encontró Playwright, reproducido con la columna de
   * /camino: el nodo activo es "Función lineal y afín" (índice 9), debajo va
   * "Función cuadrática" (10) y recién después la banda de Geometría (11).
   *
   * Una sola fila de 76px separa la tarjeta de la banda, y la tarjeta mide
   * ~176px: llega. Mirar solo el elemento siguiente —que es lo que hacía la
   * primera versión— decía que no, y el clic sobre Geometría se lo comía la
   * tarjeta.
   */
  test("la banda a dos elementos de distancia sí se tapa", () => {
    const columna: ElementoColumna[] = [
      encabezado(),
      ...nodos(3),
      encabezado(),
      ...nodos(6),
      encabezado(),
      encabezado(),
    ];
    assert.equal(tapariaUnaBanda(columna, 9), true);
  });

  test("la banda inmediatamente siguiente se tapa", () => {
    assert.equal(tapariaUnaBanda([nodo(), encabezado(), nodo()], 0), true);
  });

  /* Con tres filas de por medio (228px) la tarjeta ya no llega: voltearla ahí
     sería taparle el título a los nodos de arriba sin ganar nada. */
  test("una banda fuera del alcance de la tarjeta no cuenta", () => {
    const columna = [...nodos(4), encabezado(), nodo()];
    assert.equal(tapariaUnaBanda(columna, 0), false);
    assert.equal(RESERVA_TARJETA < 4 * PASO_FILA, true);
  });

  test("sin bandas debajo, nunca voltea", () => {
    assert.equal(tapariaUnaBanda(nodos(5), 0), false);
    assert.equal(tapariaUnaBanda([encabezado(), ...nodos(3)], 1), false);
  });

  test("el último elemento no tiene nada debajo", () => {
    const columna = [encabezado(), ...nodos(2)];
    assert.equal(tapariaUnaBanda(columna, columna.length - 1), false);
  });

  test("índice inválido no explota", () => {
    assert.equal(tapariaUnaBanda([encabezado(), nodo()], -1), false);
  });
});

describe("desplazamientoDeNodo", () => {
  /**
   * No cambia en esta fase, y hay que dejarlo afirmado: `CaminoFantasma` —el
   * fondo de la portada— importa esta función para *ser* el camino y no un
   * dibujo parecido. Si el zigzag se moviera acá, la portada se movería con él.
   */
  test("el zigzag alterna y la meta va centrada", () => {
    assert.equal(desplazamientoDeNodo(0), 38);
    assert.equal(desplazamientoDeNodo(1), 62);
    assert.equal(desplazamientoDeNodo(2), 38);
    assert.equal(desplazamientoDeNodo(3, true), 50);
  });
});
