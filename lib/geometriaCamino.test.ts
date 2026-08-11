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
  alturaSegura,
  alturaSeguraArriba,
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

/** Una banda de eje. Por omisión **no** es un control: es el caso de un eje con
 *  contenido (Números, Álgebra y funciones), que rinde un `<span>`. Los ejes
 *  plegables —los únicos que rinden un `<button>` y por lo tanto los únicos que
 *  pueden perder un clic— se piden con `banda()`. */
const encabezado = (): ElementoColumna => ({ tipo: "encabezado", control: false });

/** Una banda de eje **plegable**: un `<button>` que despliega sus unidades. Es
 *  la única que hace voltear la tarjeta. */
const banda = (): ElementoColumna => ({ tipo: "encabezado", control: true });

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
      encabezado(), // Números, con contenido
      ...nodos(3),
      encabezado(), // Álgebra y funciones, con contenido
      ...nodos(6),
      banda(), // Geometría, plegable
      banda(), // Probabilidad y estadística, plegable
    ];
    assert.equal(tapariaUnaBanda(columna, 9), true);
  });

  test("la banda inmediatamente siguiente se tapa", () => {
    assert.equal(tapariaUnaBanda([nodo(), banda(), nodo()], 0), true);
  });

  /* Con tres filas de por medio (228px) la tarjeta ya no llega: voltearla ahí
     sería taparle el título a los nodos de arriba sin ganar nada. */
  test("una banda fuera del alcance de la tarjeta no cuenta", () => {
    const columna = [...nodos(4), banda(), nodo()];
    assert.equal(tapariaUnaBanda(columna, 0), false);
    assert.equal(RESERVA_TARJETA < 4 * PASO_FILA, true);
  });

  test("sin bandas debajo, nunca voltea", () => {
    assert.equal(tapariaUnaBanda(nodos(5), 0), false);
    assert.equal(tapariaUnaBanda([encabezado(), ...nodos(3)], 1), false);
  });

  /**
   * El caso que motivó la distinción: la banda de un eje **con contenido** es un
   * `<span>`, no se come ningún clic, y taparla cuesta lo mismo que taparle el
   * título a un nodo. Antes devolvía `true` y volteaba la tarjeta.
   */
  test("una banda que no es control no hace voltear", () => {
    assert.equal(tapariaUnaBanda([nodo(), encabezado(), nodo()], 0), false);
  });

  /**
   * Y no solo no cuenta: **suma su alto y la caminata sigue**. Si en vez de eso
   * se la salteara sin sumar, la tarjeta parecería llegar 44px más lejos de lo
   * que llega y voltearía por una banda-control que en realidad no alcanza.
   *
   * Las distancias se miden desde el borde inferior del nodo activo.
   *
   * La primera afirmación fija que **no corta**: pasando por una banda-rótulo,
   * 44 + 76 = 120 < 216, la banda-control del final sigue estando al alcance.
   *
   * La segunda fija que **suma**, y necesita dos bandas-rótulo para poder
   * distinguirlo: 88 + 2×76 = 240 ≥ 216, la caminata se corta y la
   * banda-control queda fuera. Sin sumar esos 88px daría 152 < 216 y esta
   * misma columna diría `true`. Con una sola banda-rótulo no hay conteo de
   * filas que separe los dos comportamientos —los 44px nunca cruzan la cota
   * solos—, así que la columna es sintética a propósito: acá se verifica
   * aritmética, y el caso real de /camino tiene su propio test más abajo.
   */
  test("una banda que no es control suma su alto y la caminata sigue", () => {
    assert.equal(tapariaUnaBanda([nodo(), encabezado(), nodo(), banda()], 0), true);
    assert.equal(
      tapariaUnaBanda([nodo(), encabezado(), encabezado(), nodo(), nodo(), banda()], 0),
      false,
    );
  });

  /**
   * El caso real de /camino, con el nodo que la pantalla trae activo de
   * entrada: "Enteros y racionales", índice 1, primer nodo del primer eje.
   * Debajo van sus dos hermanos y después la banda de Álgebra —que tiene
   * contenido y por lo tanto es un rótulo—. No hay que voltear: arriba solo hay
   * 44px de columna y la tarjeta pide `RESERVA_TARJETA`, así que volteada se
   * desborda por encima de la columna y termina debajo de la barra de
   * navegación pegada.
   */
  test("el primer nodo del primer eje no voltea por la banda del eje siguiente", () => {
    const columna: ElementoColumna[] = [
      encabezado(), // Números
      ...nodos(3), // Enteros y racionales, Porcentaje, Potencias y raíces
      encabezado(), // Álgebra y funciones, con contenido
      ...nodos(6),
      banda(), // Geometría, plegable
      banda(), // Probabilidad y estadística, plegable
    ];
    assert.equal(tapariaUnaBanda(columna, 1), false);

    // Y el espacio que hay arriba es, en efecto, insuficiente: es la razón por
    // la que voltear ahí era el problema y no la solución.
    assert.equal(desplazamientoVertical(columna, 0) < RESERVA_TARJETA, true);
  });

  test("el último elemento no tiene nada debajo", () => {
    const columna = [encabezado(), ...nodos(2)];
    assert.equal(tapariaUnaBanda(columna, columna.length - 1), false);
  });

  test("índice inválido no explota", () => {
    assert.equal(tapariaUnaBanda([encabezado(), nodo()], -1), false);
  });
});

describe("alturaSegura", () => {
  /**
   * El caso real que reveló que voltear no alcanza: con tres nodos seguidos
   * debajo del activo, 216 (`RESERVA_TARJETA`) cae 64px dentro del tercero.
   * El alto seguro tiene que ser exactamente la suma de los tres —228, no
   * 216— para que el borde libre de la tarjeta caiga en el borde inferior
   * del tercero y no a mitad de él.
   */
  test("el resto de 64px se resuelve sumando el elemento entero, no redondeando", () => {
    // `nodos(4)`: el activo (índice 0) más tres filas debajo, 76px cada una.
    assert.equal(alturaSegura(nodos(4), 0), 3 * PASO_FILA);
  });

  /** Con solo dos filas debajo (152px), ya alcanzan y sobran para cubrir
   *  `RESERVA_TARJETA`: el alto seguro es la cota misma, sin sumar una
   *  tercera fila que no hace falta. */
  test("dos filas ya cubren la cota: el alto seguro es la cota, no una fila de más", () => {
    assert.equal(alturaSegura(nodos(3), 0), RESERVA_TARJETA);
  });

  /** La columna se acaba antes de llegar a la cota: no queda nada que cortar,
   *  así que el alto seguro es la cota misma y no lo poco que alcanzó a
   *  sumar — no hay ninguna fila real después que necesite protección. */
  test("la columna se acaba antes de la cota: el alto seguro es la cota", () => {
    assert.equal(alturaSegura(nodos(5), 4), RESERVA_TARJETA);
  });

  /** Una banda de eje cuenta con su propio alto, igual que un nodo: lo que
   *  importa acá es no cortar ningún elemento, no distinguir tipos —esa
   *  distinción es de `tapariaUnaBanda`, que decide si hay que taparla o no
   *  del todo. */
  test("una banda intercalada suma su propio alto, no el de una fila", () => {
    const columna = [nodo(), nodo(), encabezado(), encabezado()];
    // 76 (nodo1) + 44 (encabezado1) = 120 < 216, sigue sumando el segundo
    // encabezado: 120 + 44 = 164 < 216, columna agotada → cae en la cota.
    assert.equal(alturaSegura(columna, 0), RESERVA_TARJETA);
  });

  test("índice inválido: devuelve la cota", () => {
    assert.equal(alturaSegura([encabezado(), nodo()], -1), RESERVA_TARJETA);
  });
});

describe("alturaSeguraArriba", () => {
  /** Espejo del caso real de `alturaSegura`: tres nodos **arriba** del activo
   *  (índice 3, el último de `nodos(4)`) piden el mismo alto seguro que hacia
   *  abajo. Es la garantía que hacía falta cuando `voltear` cuelga la tarjeta
   *  hacia arriba: sin esto, "Expresiones algebraicas" activo volteaba la
   *  tarjeta y cortaba "Porcentaje" dos filas más arriba — medido en el
   *  navegador real, no en la función pura. */
  test("el resto de 64px hacia arriba pide la misma fila completa de más", () => {
    assert.equal(alturaSeguraArriba(nodos(4), 3), 3 * PASO_FILA);
  });

  test("dos filas arriba ya cubren la cota", () => {
    assert.equal(alturaSeguraArriba(nodos(3), 2), RESERVA_TARJETA);
  });

  test("nada arriba del primer elemento: la cota, no cero", () => {
    assert.equal(alturaSeguraArriba(nodos(5), 0), RESERVA_TARJETA);
  });

  test("una banda arriba suma su propio alto", () => {
    const columna = [encabezado(), encabezado(), nodo(), nodo()];
    assert.equal(alturaSeguraArriba(columna, 3), RESERVA_TARJETA);
  });

  test("índice inválido: devuelve la cota", () => {
    assert.equal(alturaSeguraArriba([encabezado(), nodo()], -1), RESERVA_TARJETA);
    assert.equal(alturaSeguraArriba([encabezado(), nodo()], 5), RESERVA_TARJETA);
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
