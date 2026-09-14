import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import { MINIMO_INTENTOS, type Cuadrante, type PanelDeHabilidad } from "@/lib/advance/panel";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import type { Habilidad } from "@/lib/tipos";

interface PanelDosPorDosProps {
  habilidad: Habilidad;
  panel: PanelDeHabilidad;
}

/* Las celdas en el orden de lectura de la tabla de §6.2: fila correcto
   (dominado, frágil), fila incorrecto (error conceptual, bloqueo). */
const FILAS: { fila: "correcto" | "incorrecto"; celdas: readonly [Cuadrante, Cuadrante] }[] = [
  { fila: "correcto", celdas: ["dominado", "fragil"] },
  { fila: "incorrecto", celdas: ["error-conceptual", "bloqueo"] },
];

/**
 * El panel 2×2 de una habilidad (docs/fobos-advance.md §6.2): acierto por
 * tiempo, con el conteo de intentos en cada cuadrante y el que predomina
 * dicho con texto, no solo con borde.
 *
 * Componente puro: recibe el `PanelDeHabilidad` ya calculado y no consulta
 * nada. Hoy solo lo monta la galería `/_design` con datos de muestra: el
 * panel requiere modo clásico y ninguna ruta de producción lo alimenta (§4
 * F4, 4.1). Cuando exista el modo clásico, la ruta calcula el panel en el
 * servidor con `panelPorHabilidad` y lo pasa acá sin cambiar nada de esto.
 *
 * Es una `<table>` de verdad, con encabezados de fila y de columna: el cruce
 * es la información, y un lector de pantalla tiene que poder decir "Correcto,
 * sobre el tiempo: Frágil, 2". Sin clasificar (menos de `MINIMO_INTENTOS`),
 * no hay tabla ni conteos parciales: la regla de honestidad de §6.2 se cumple
 * no mostrando, y el texto dice cuántos intentos faltan.
 *
 * El rótulo de la habilidad va en `--linea-nav` sobre `bg-card`, el par ya
 * medido en `TarjetaEstadoError`. La celda que predomina sube a
 * `border-strong` y lleva la palabra "Predomina" debajo del número. Sin
 * transiciones: `prefers-reduced-motion` se cumple por ausencia.
 */
export function PanelDosPorDos({ habilidad, panel }: PanelDosPorDosProps) {
  const { panel: textos } = TEXTOS_ADVANCE;
  const nombre = textos.habilidad[habilidad];

  return (
    <section
      className={`${TARJETA_LINEA} p-4`}
      data-panel={habilidad}
      data-estado={panel.estado}
      aria-labelledby={`panel-${habilidad}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`panel-${habilidad}`} className="text-etiqueta uppercase text-[var(--linea-nav)]">
          {nombre}
        </h2>
        <p className="text-cuerpo-xs text-primary">
          <span className="num">{panel.intentos}</span> {textos.intentos(panel.intentos)}
        </p>
      </div>

      {panel.estado === "sin-clasificar" ? (
        <p className="mt-3 text-cuerpo-s text-primary" data-sin-clasificar>
          {textos.sinClasificar(panel.intentos, MINIMO_INTENTOS)}
        </p>
      ) : (
        <>
          <table className="mt-3 w-full border-collapse">
            <thead>
              <tr>
                <td className="w-[4.5rem] pb-1.5" />
                <th scope="col" className="pb-1.5 text-left text-cuerpo-xs font-normal text-primary">
                  {textos.columna.dentro}
                </th>
                <th scope="col" className="pb-1.5 text-left text-cuerpo-xs font-normal text-primary">
                  {textos.columna.sobre}
                </th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map(({ fila, celdas }) => (
                <tr key={fila}>
                  <th scope="row" className="pr-2 text-left align-top text-cuerpo-xs font-normal text-primary">
                    {textos.fila[fila]}
                  </th>
                  {celdas.map((cuadrante) => {
                    const predomina = panel.dominante === cuadrante;
                    return (
                      <td key={cuadrante} className="p-0.5 align-top">
                        <div
                          className={`rounded-sm border px-2.5 py-2 ${predomina ? "border-strong" : "border-hairline"}`}
                          data-cuadrante={cuadrante}
                          data-predomina={predomina ? "" : undefined}
                        >
                          <p className="text-cuerpo-xs text-primary">{textos.cuadrante[cuadrante]}</p>
                          <p className="mt-1 text-titulo-m num text-primary">{panel.porCuadrante[cuadrante]}</p>
                          {/* La línea va en las cuatro celdas y se oculta con
                              `invisible` (visibility) donde no predomina: así
                              las cajas de una fila miden lo mismo sin fijar
                              una altura a mano, y el texto oculto no llega al
                              lector de pantalla. */}
                          <p className={`mt-1 text-etiqueta uppercase text-primary ${predomina ? "" : "invisible"}`}>
                            {textos.predomina}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-cuerpo-s text-primary" data-explicacion>
            <span className="font-semibold">{textos.cuadrante[panel.dominante]}.</span>{" "}
            {textos.explicacion[panel.dominante]}
          </p>
        </>
      )}
    </section>
  );
}
