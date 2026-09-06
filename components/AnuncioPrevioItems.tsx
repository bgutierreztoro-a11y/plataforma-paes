import { Boton } from "@/components/ui/linea/Boton";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";

interface AnuncioPrevioItemsProps {
  variante: "leccion" | "modulo";
  cantidad: number;
  /* Solo se usa (y en la práctica es obligatorio) cuando variante === "modulo". */
  nombreModulo?: string;
  onEmpezar: () => void;
}

/**
 * Guion de tiempos del anuncio previo. Mismo criterio y mismo escalón de 150ms
 * que el cierre de módulo (`CierreFinal.tsx:39`): estas dos pantallas son las
 * dos caras del mismo momento y el orden de lectura es el mismo argumento —
 * dónde estás, cuántas son, cuáles son, qué hacer.
 *
 * Los retrasos no son tokens de motion, por lo mismo que allá: un token es
 * cuánto dura un gesto, un escalón es el guion de esta pantalla. Las duraciones
 * y curvas sí salen de `:root`, vía `.entra-en-secuencia`.
 */
const RETRASO = {
  encabezado: 0,
  cifra: 150,
  franja: 300,
  acciones: 450,
} as const;

/**
 * Lo que hay antes de las preguntas: cuántas son y en qué forma van a aparecer.
 *
 * La pantalla se rehizo entera en la conversión a Línea. Antes traía un trazo
 * animado —recta con un punto por pregunta, en el índigo de `--color-accent`—
 * que no volvía a aparecer en ninguna otra parte del producto: era un dibujo
 * propio de esta pantalla, y la cuenta de preguntas quedaba dicha dos veces, en
 * el trazo y en la cifra.
 *
 * En su lugar va `FranjaDeItems`, la misma fila que el resultado del cierre
 * muestra llena (`CierreFinal.tsx:183`). Acá se muestra hueca: una casilla por
 * pregunta, vacías. **Ese eco es el punto de la pantalla** — lo que el
 * estudiante ve al empezar es exactamente la forma que va a ver rellena al
 * terminar, así que la pantalla promete un resultado legible en vez de
 * decorarse.
 *
 * **Sin placa oscura.** `PlacaLinea` existe, pero declara *qué línea es* a
 * partir de un `LineaId` que esta pantalla no recibe, y pedirlo sería una prop
 * nueva. El encabezado lo resuelve `EncabezadoDeEntrada`, que es lo que ya usan
 * las otras cuatro pantallas de una sola cosa.
 *
 * **Una sola entrada por elemento.** Los cuatro bloques son hermanos con
 * `.entra-en-secuencia` y ninguno está dentro de otro. Antes esta pantalla
 * apilaba tres animaciones simultáneas —`.transicion-paso` sobre la pantalla
 * entera, `.entra-numero` sobre la cifra y `.entra-nodo` sobre cada punto del
 * trazo—, que es el caso 1 de `docs/deuda-entradas-apiladas.md`: el "pop" de la
 * cifra llegaba apagado bajo el fundido de página que ya la estaba atenuando.
 */
export function AnuncioPrevioItems({
  variante,
  cantidad,
  nombreModulo,
  onEmpezar,
}: AnuncioPrevioItemsProps) {
  const sustantivo = cantidad === 1 ? "pregunta" : "preguntas";
  const titulo = variante === "leccion" ? "Repaso rápido" : "Cierre del módulo";
  const alcance = variante === "leccion" ? "de esta lección" : `de ${nombreModulo}`;

  return (
    <PantallaCentrada className="gap-6 text-center">
      {/* El rótulo dice el momento y no el alcance: el alcance ya lo dice la
          línea bajo la cifra ("preguntas de esta lección"), y repetirlo arriba
          haría que la pantalla se presentara dos veces antes de dar el dato. */}
      <div
        className="entra-en-secuencia"
        style={{ ["--retraso" as string]: `${RETRASO.encabezado}ms` }}
      >
        <EncabezadoDeEntrada rotulo="Antes de empezar" titulo={titulo} />
      </div>

      {/* La cifra en `display-l` (44px/700), el escalón más grande de la escala:
          es el único dato de la pantalla. Va en `--linea-nav` y no en `--linea`
          porque es texto sobre papel, el rol donde la 02 (#FFB600) cae a tinta;
          mismo par que el enlace de `CierreFinal.tsx:169`. `.num` deja las
          cifras tabulares, igual que en el resto del producto. */}
      <div
        className="entra-en-secuencia"
        style={{ ["--retraso" as string]: `${RETRASO.cifra}ms` }}
      >
        <p className="num text-display-l text-[var(--linea-nav)]">{cantidad}</p>
        <p className="mt-2 text-base leading-relaxed text-ink-suave">
          {sustantivo} {alcance}
        </p>
      </div>

      {/* Las casillas vacías. `w-full max-w-lg` acá y no en `PantallaCentrada`:
          dentro de su `items-center` un hijo sin ancho colapsa al contenido,
          igual que en `CierreFinal.tsx:129`. */}
      <div
        className="entra-en-secuencia w-full max-w-lg"
        style={{ ["--retraso" as string]: `${RETRASO.franja}ms` }}
      >
        <FranjaDeItems resultados={Array<"pendiente">(cantidad).fill("pendiente")} />
        {/* Dato, no advertencia: sin caja, sin ícono y sin verbo de aviso. Lo
            que cambia respecto de los pasos de la lección es que acá no hay
            pistas, y eso se dice y se sigue.

            `text-primary` y no el gris de rótulo: esto se monta sobre el fondo
            de página, donde `--text-secondary` da 4,42:1 y no llega a AA
            (`docs/deuda-contraste-etiquetas.md` §1). Mismo par que eligió
            `EncabezadoDeEntrada`. */}
        <p className="mt-3 text-etiqueta uppercase text-primary">
          En esta parte no hay pistas
        </p>
      </div>

      <div
        className="entra-en-secuencia w-full max-w-lg"
        style={{ ["--retraso" as string]: `${RETRASO.acciones}ms` }}
      >
        {/* `variante="linea"` toma el color del eje que instalan los dos call
            sites (`RunnerLeccion.tsx:208`, `Cierre.tsx:48`) y trae el canto de
            2px de la Fase A. Último escalón, y eso no lo hace inalcanzable:
            `opacity` y `transform` no bloquean `pointer-events`. */}
        <Boton variante="linea" type="button" onClick={onEmpezar}>
          Empezar
        </Boton>
      </div>
    </PantallaCentrada>
  );
}
