/**
 * Geometría del camino, en un módulo puro.
 *
 * Vive fuera de `lib/camino.ts` a propósito: ese módulo es server-only porque
 * lee `content/` del disco, y estos números los necesitan tres piezas de
 * cliente —el camino de /camino, el de lecciones de /tema/[id] y el fondo de la
 * portada—. Si cada una calculara los suyos, la portada dibujaría algo
 * *parecido* al camino en vez de ser el camino, y se desincronizarían a la
 * primera vez que alguien mueva un número.
 *
 * **El camino baja (enmienda del 2026-07-27).** Antes los nodos iban sobre una
 * recta ascendente, de abajo-izquierda a arriba-derecha, porque el módulo
 * enseña funciones lineales. Se revirtió tras probarlo en un teléfono real: la
 * progresión peleaba con el orden de lectura y con el scroll, que baja. La
 * metáfora de la función vive en el contenido de las lecciones, no en la
 * dirección en que se recorre la pantalla. Ver MASTER.md §3.2.
 */

/**
 * Alto de cada fila del camino, en píxeles, igual en móvil y en escritorio.
 *
 * Es un número compartido y no una clase de Tailwind porque la tarjeta del nodo
 * activo se ancla en `indice * PASO_FILA`: si el alto viviera solo en el CSS,
 * la tarjeta se despegaría del nodo en cuanto alguien lo cambiara.
 *
 * 76px es lo que permite el objetivo de densidad —6 nodos visibles sin scroll
 * en una pantalla de 360×800— una vez descontados el encabezado fijo (61px), la
 * tarjeta al pie (~150px) y la barra de navegación (56px). Medido en el
 * navegador, no estimado: con 84px entraban 5.
 */
export const PASO_FILA = 76;

/**
 * Alto de la fila del cierre. Más que las demás porque su disco mide ~1,4× y
 * con el paso normal quedaba pegado al de arriba: el tramo de trazo que los une
 * medía cuatro píxeles y el recorrido se leía cortado justo en la meta.
 *
 * Es el único alto distinto que existe, y por eso el ancla de la tarjeta suma
 * alturas (`desplazamientoVertical`) en vez de multiplicar por el paso.
 */
export const PASO_FILA_META = 100;

/** Alto de la fila `i`, en píxeles. */
export function altoDeFila(esMeta: boolean): number {
  return esMeta ? PASO_FILA_META : PASO_FILA;
}

/**
 * Alto de la banda de encabezado de eje, en píxeles.
 *
 * **El CSS tiene que fijar `height: 44px` exacto, nunca derivarlo de padding +
 * line-height.** Es el mismo contrato que `PASO_FILA`: este número entra en el
 * ancla de la tarjeta del nodo activo, así que si el alto real del encabezado
 * se separa de esta constante, la tarjeta se despega del nodo — y lo hace en
 * silencio, sin que nada falle. Un padding que cambie con el tamaño de fuente
 * del sistema es exactamente esa deriva.
 *
 * 44px es además el mínimo táctil de MASTER.md §5, que el encabezado del eje
 * colapsado necesita por ser un botón.
 */
export const ALTO_ENCABEZADO_EJE = 44;

/**
 * Alto de la franja fija de /camino (eyebrow, "Tu camino" y el contador), en
 * píxeles.
 *
 * No entra en el ancla de la tarjeta —la franja vive fuera de la columna— pero
 * sí lo comparten dos piezas: la franja lo usa para fijar su alto y las bandas
 * de eje para saber a qué altura pegarse debajo de ella. Si se separaran, las
 * bandas quedarían tapadas por la franja o flotando bajo un hueco.
 *
 * Mismo patrón compacto que el encabezado de /tema/[id], que es lo que permite
 * que esa pantalla cumpla el objetivo de densidad de MASTER.md §3.2.
 */
export const ALTO_FRANJA_CAMINO = 60;

/**
 * Un elemento de la columna, en orden visual.
 *
 * La columna dejó de ser una lista de nodos cuando /camino pasó a agrupar las
 * 16 unidades por eje: ahora intercala bandas de encabezado. El ancla de la
 * tarjeta se calcula sumando altos en orden, así que tiene que poder sumar los
 * dos tipos de elemento.
 *
 * `position: sticky` **no saca al elemento del flujo** — un encabezado pegado
 * arriba sigue ocupando su alto. Por eso sumarlo es correcto esté quieto o
 * pegado, y no hace falta medir nada en el navegador.
 */
export type ElementoColumna =
  | {
      tipo: "encabezado";
      /** La banda es un **control** y no un rótulo: la de un eje plegable es un
       *  `<button>` que despliega sus unidades, la de un eje con contenido es un
       *  `<span>`. Solo lo usa `tapariaUnaBanda`, y ahí es la diferencia entre
       *  taparle el clic a un control y taparle el texto a un encabezado. El
       *  alto es el mismo en los dos casos, así que el resto de la geometría no
       *  lo mira. */
      control: boolean;
    }
  | { tipo: "nodo"; meta: boolean };

/** Alto de un elemento de la columna, en píxeles. */
export function altoDeElemento(elemento: ElementoColumna): number {
  return elemento.tipo === "encabezado"
    ? ALTO_ENCABEZADO_EJE
    : altoDeFila(elemento.meta);
}

/**
 * Distancia desde el inicio de la columna hasta el borde inferior del elemento
 * `i`. Es donde se cuelga la tarjeta del nodo activo en escritorio.
 *
 * Los índices fuera de rango se ignoran en vez de sumar un alto por omisión: un
 * `i` mayor que la columna es un error de quien llama, y devolver el alto total
 * es más honesto que inventar filas que no existen.
 */
export function desplazamientoVertical(
  elementos: readonly ElementoColumna[],
  i: number,
): number {
  let y = 0;
  for (let k = 0; k <= i; k++) {
    const elemento = elementos[k];
    if (elemento) y += altoDeElemento(elemento);
  }
  return y;
}

/**
 * Cuánto alto ocupa la tarjeta del nodo activo, en píxeles.
 *
 * Se usa como **cota**, no como posición: la tarjeta se posiciona con
 * `-translate-y-full`, que resuelve el navegador conociendo el alto real. Un
 * valor de más solo hace que se voltee alguna vez sin necesidad, que es
 * inofensivo; uno de menos deja que la tarjeta le tape el clic a una banda de
 * eje, que es el defecto que `tapariaUnaBanda` existe para evitar.
 *
 * **Medido, no estimado, y verificado por un test.** Arrancó en 176 (el `h-44`
 * que reserva la columna al pie) y la Fase B del rediseño lo desfasó sin que
 * nada fallara: el botón full-width en su propia línea llevó la tarjeta a
 * 204,5px. Ese es justo el modo de falla silencioso que hace falta atrapar, así
 * que `e2e/capturas.spec.ts` mide la tarjeta real y falla si pasa esta cota.
 *
 * 216 son los 204,5 medidos más un colchón: el alto depende de cuánto envuelva
 * la descripción, y el ancho angosto (360px) es el caso que más envuelve.
 */
export const RESERVA_TARJETA = 216;

/**
 * La misma cota, para el alto reservado en **escritorio**.
 *
 * `RESERVA_TARJETA` está calibrada a 360px, que es el ancho donde la
 * descripción más envuelve — y es el ancho donde la tarjeta va `fixed` al pie y
 * no reserva nada. En escritorio la tarjeta es mucho más estable: la columna
 * tiene `max-width` fijo (`ANCHO_COLUMNA`) y la canaleta también, así que entre
 * 640px y 1440px la tarjeta mide entre 439 y 456 de ancho y **188px de alto en
 * el peor caso** (título de dos líneas más contador). Medido en el navegador
 * anulando el mínimo, en los dos extremos del rango.
 *
 * Reservar los 216 de móvil acá salía caro: `alturaSegura` redondea hacia
 * arriba al siguiente borde de elemento, y esos 28px de más empujaban el
 * redondeo un borde más allá del necesario. Con "Enteros y racionales" activo
 * pedía 272 —tres filas y una banda— para un contenido de 188, y ese sobrante
 * se veía como aire de sobra. Con 192 el redondeo cae en 196: la fila de
 * Porcentaje, la de Potencias y la banda de Álgebra, que es exactamente donde
 * termina el contenido.
 *
 * 192 son los 188 medidos más 4 de colchón. Es un margen chico a propósito: lo
 * que protege del error no es el colchón sino que `alturaSegura` **siempre
 * redondea hacia arriba**, así que el alto reservado nunca es menor que este
 * número. Si el contenido de la tarjeta creciera por encima de 192 —un título
 * que pase a tres líneas, una línea nueva en el panel—, la tarjeta se saldría
 * de lo reservado y volvería a cortar una fila; lo atrapa el recorrido de los
 * 16 nodos en `e2e/capturas.spec.ts`, que mide la tarjeta real.
 */
export const RESERVA_TARJETA_ESCRITORIO = 192;

/**
 * ¿La tarjeta, colgando hacia abajo del elemento `i`, alcanzaría a tapar una
 * banda que además es un **control**?
 *
 * Existe porque tapar una banda no es lo mismo que tapar un nodo. La tarjeta es
 * un panel flotante y taparle el título a los nodos de abajo es su
 * comportamiento buscado: basta tocar otro nodo para moverla. Una banda de eje
 * plegado, en cambio, es un control —abre sus unidades—, y taparlo no lo
 * esconde: se come el clic. Playwright lo encontró intentando desplegar
 * Geometría con la tarjeta encima.
 *
 * **Solo las bandas-control cuentan (2026-08-11).** La primera versión devolvía
 * `true` ante cualquier `encabezado`, aunque su propio comentario ya decía que
 * el motivo era el clic de un eje *plegable*. Los ejes con contenido —Números,
 * Álgebra y funciones— rinden un `<span>`, no un `<button>`: no se comen ningún
 * clic, y taparles el rótulo es del mismo orden que taparle el título a un
 * nodo. Contarlos igual salía caro en el borde de arriba de la columna: con
 * "Enteros y racionales" activo —el primer nodo del primer eje y el que
 * /camino trae seleccionado de entrada— la banda de Álgebra forzaba un volteo
 * hacia arriba, y ahí solo hay 44px de columna contra los 216 que pide la
 * tarjeta. Se desbordaba 172px por encima de la columna, debajo de la barra de
 * navegación pegada: medido a 1440px, 79px de tarjeta inalcanzables y el
 * título tapado. Una banda que no es control ahora suma su alto y la caminata
 * sigue, igual que un nodo.
 *
 * No alcanza con mirar el elemento inmediatamente siguiente, que es lo que
 * hacía la primera versión: la tarjeta mide más que una fila, así que llega a
 * una banda que está dos elementos más abajo. El caso real es exactamente ese
 * —el nodo activo es "Función lineal y afín", debajo va "Función cuadrática" y
 * recién después la banda de Geometría, que sí es plegable.
 */
export function tapariaUnaBanda(
  elementos: readonly ElementoColumna[],
  i: number,
): boolean {
  if (i < 0) return false;
  const borde = desplazamientoVertical(elementos, i);
  const limite = borde + RESERVA_TARJETA;

  /* `techo` es el borde superior del elemento `k`, que arranca siendo el borde
     inferior del activo. Se recorre hacia abajo mientras la tarjeta siga
     llegando. */
  let techo = borde;
  for (let k = i + 1; k < elementos.length && techo < limite; k++) {
    const elemento = elementos[k];
    if (elemento.tipo === "encabezado" && elemento.control) return true;
    techo += altoDeElemento(elemento);
  }
  return false;
}

/**
 * Cuánto alto necesita la tarjeta, colgando hacia abajo del elemento `i`,
 * para que su borde libre —el que no queda pegado al nodo activo— caiga
 * siempre en un borde de elemento y nunca a mitad de un nodo.
 *
 * **Por qué esto y no una variante de `tapariaUnaBanda`.** Una primera
 * versión de esta fase intentaba decidir "¿cortaría?" y, si sí, voltear la
 * tarjeta hacia el otro lado. No alcanza: 216 (`RESERVA_TARJETA`) no es
 * múltiplo de 76 (`PASO_FILA`), así que el mismo resto de 64px que corta un
 * nodo hacia abajo corta uno hacia arriba si se voltea — la geometría es
 * simétrica, cambiar de lado no la arregla, solo la traslada (confirmado con
 * datos reales del navegador: "Expresiones algebraicas" activo cortaba
 * "Sistemas de ecuaciones 2×2" para abajo y "Porcentaje" para arriba). El
 * único borde que puede garantizarse en un límite de fila sin importar hacia
 * dónde cuelgue la tarjeta es el que depende del **alto real de la tarjeta**,
 * no de su posición. Por eso esta función no devuelve un booleano para
 * decidir un volteo: devuelve un alto, para usarlo como `min-height` de la
 * tarjeta. Sobra siempre algo: el alto pedido cae en un borde de elemento y el
 * contenido no mide eso, así que la diferencia se ve como aire dentro de la
 * tarjeta. Es geometría y no un descuido —con filas de 76px y contenido de
 * 165–188 no existe un alto sin sobrante—, pero el sobrante sí depende de qué
 * cota se use para redondear: por eso acá va `RESERVA_TARJETA_ESCRITORIO` (192,
 * el alto real medido en este rango de anchos) y no `RESERVA_TARJETA` (216,
 * calibrada a 360px, donde este mínimo ni siquiera se aplica). Redondear desde
 * 216 empujaba el corte un borde más allá del necesario y hacía el aire mucho
 * más visible: 272 en vez de 196 con "Enteros y racionales" activo.
 *
 * Camina igual que `tapariaUnaBanda` (sumando alto de elemento en elemento
 * mientras no se alcance la cota) pero el resultado es la suma misma, no una
 * pregunta sobre ella — por construcción cae siempre exacto en el borde
 * inferior del último elemento sumado, y nunca por debajo de la cota.
 */
export function alturaSegura(elementos: readonly ElementoColumna[], i: number): number {
  if (i < 0) return RESERVA_TARJETA_ESCRITORIO;
  const borde = desplazamientoVertical(elementos, i);
  let techo = borde;
  for (let k = i + 1; k < elementos.length && techo - borde < RESERVA_TARJETA_ESCRITORIO; k++) {
    techo += altoDeElemento(elementos[k]);
  }
  /* La columna se acabó antes de llegar a la cota: no queda nada más que
     cortar, así que el piso es la cota misma y no lo que alcanzó a sumar. */
  return Math.max(RESERVA_TARJETA_ESCRITORIO, techo - borde);
}

/**
 * La misma garantía que `alturaSegura`, para cuando la tarjeta cuelga hacia
 * **arriba** (`voltear` es `true` por la meta o por `tapariaUnaBanda`).
 *
 * Reutiliza `alturaSegura` sobre la columna invertida en vez de escribir la
 * misma caminata en la otra dirección: recorrer hacia arriba desde `i` es
 * recorrer hacia abajo desde el índice espejado en la columna al revés.
 */
export function alturaSeguraArriba(elementos: readonly ElementoColumna[], i: number): number {
  if (i < 0 || i >= elementos.length) return RESERVA_TARJETA_ESCRITORIO;
  const invertida = [...elementos].reverse();
  return alturaSegura(invertida, elementos.length - 1 - i);
}

/**
 * Ancho de la canaleta donde viven los discos y el trazo, en píxeles.
 *
 * Fijo a propósito. Tiene que caber lo más ancho de los dos casos: un disco
 * normal de 60px desplazado por el zigzag (60 + 2×12,5 = 85) y el disco de meta
 * de 84px con su contorno doble (84 + 2×6 = 96). Si la canaleta creciera con el
 * contenido, el trazo se doblaría justo en la fila del cierre.
 */
export const ANCHO_CANALETA = 104;

/** Ancho máximo de la columna. El escritorio no necesita un layout propio;
 *  necesita no estirarse. */
export const ANCHO_COLUMNA = 560;

/** Amplitud del zigzag, en porcentaje del ancho de la canaleta a cada lado del
 *  centro. Leve a propósito: lo justo para que el recorrido no se lea como una
 *  lista plana, no tanto como para que el trazo parezca una escalera. */
const ZIGZAG = 12;

/**
 * Desplazamiento horizontal del disco `i`, en porcentaje del ancho de la
 * canaleta. 50 es el centro.
 *
 * Se expresa en porcentaje y no en píxeles porque el mismo número posiciona el
 * disco (con `left`) y las puntas del trazo (en un SVG con
 * `preserveAspectRatio="none"`). Un solo número para las dos cosas es lo que
 * garantiza que el trazo toque el centro del disco y no pase cerca.
 */
export function desplazamientoDeNodo(i: number, esMeta = false): number {
  /* La meta no zigzaguea: va centrada. Es el punto donde el recorrido termina y
     centrarlo se lee como llegada; además es el disco más ancho, y desplazarlo
     encima lo sacaría de la canaleta. */
  if (esMeta) return 50;
  return i % 2 === 0 ? 50 - ZIGZAG : 50 + ZIGZAG;
}

/**
 * Retraso de entrada del nodo `i`, en milisegundos.
 *
 * El escalonamiento sigue el recorrido desde el primer nodo, que ahora es el de
 * arriba: el orden del DOM y el orden visual coinciden, así que el índice sirve
 * directo.
 */
export function retrasoDeEntrada(i: number): number {
  return i * 60;
}
