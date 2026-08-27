import type { BloqueVisualizacion as BloqueVisualizacionTipo } from "@/lib/tipos";
import { IlustracionBandas } from "@/components/ilustraciones/IlustracionBandas";
import { IlustracionEjeVertical } from "@/components/ilustraciones/IlustracionEjeVertical";
import { IlustracionParticion } from "@/components/ilustraciones/IlustracionParticion";
import {
  FIGURAS_GEOMETRICAS_VALIDAS,
  IlustracionFiguraGeometrica,
  type DatosCirculo,
  type DatosFiguraGeometrica,
  type DatosParalelogramo,
  type DatosTrapecio,
  type DatosTriangulo,
  type DatosTrianguloPitagoras,
} from "@/components/ilustraciones/IlustracionFiguraGeometrica";
import {
  CUERPOS_GEOMETRICOS_VALIDOS,
  ENFASIS_VALIDOS,
  IlustracionCuerpoGeometrico,
  type DatosCilindro,
  type DatosCubo,
  type DatosCuerpoGeometrico,
  type DatosParalelepipedo,
  type EnfasisCuerpo,
} from "@/components/ilustraciones/IlustracionCuerpoGeometrico";
import { TablaReglaSigno } from "@/components/ilustraciones/TablaReglaSigno";
import { motivoRechazoCilindro, motivoRechazoParalelepipedo } from "@/lib/cuerposGeometricos";
import { conEnfasis, esNumeroPuro } from "@/lib/markdownSimple";

interface DatosTabla {
  columnas: string[];
  filas: (string | number)[][];
}

interface DatosParticion {
  tazasTotal: number;
  partesPorTaza: number;
  partesTotales: number;
  partesPorGrupo: number;
  gruposCompletos: number;
}

interface DatosEjeVertical {
  puntos: { etiqueta: string; profundidad: number }[];
  tramoDestacado?: { desde: number; hasta: number; longitud: number };
}

interface DatosReglaSignos {
  signos: {
    signo: string;
    lectura: string;
    incluido: boolean;
    direccion: "izquierda" | "derecha";
  }[];
}

interface DatosBandas {
  bandas: { operacion: string; queSeVe?: string; puntos: number[]; orden?: string }[];
}

/* Diagrama por etapas: cada paso es un estado con dos lados y la acción que
   lleva de uno al siguiente. Se usa para la secuencia de balanzas de la
   Lección 3, pero no menciona balanzas: sirve para cualquier proceso de dos
   lados que se transforma paso a paso. */
interface PasoDiagrama {
  izquierda: string;
  derecha: string;
  accion?: string;
}

interface DatosPasos {
  pasos: PasoDiagrama[];
}

function esDatosTabla(datos: unknown): datos is DatosTabla {
  return (
    typeof datos === "object" &&
    datos !== null &&
    Array.isArray((datos as DatosTabla).columnas) &&
    Array.isArray((datos as DatosTabla).filas)
  );
}

function esDatosPasos(datos: unknown): datos is DatosPasos {
  const pasos = (datos as DatosPasos | null)?.pasos;
  return (
    Array.isArray(pasos) &&
    pasos.length > 0 &&
    pasos.every((p) => typeof p?.izquierda === "string" && typeof p?.derecha === "string")
  );
}

function esDatosParticion(datos: unknown): datos is DatosParticion {
  const d = datos as DatosParticion | null;
  return (
    typeof d?.partesPorTaza === "number" &&
    typeof d.tazasTotal === "number" &&
    typeof d.partesTotales === "number" &&
    typeof d.partesPorGrupo === "number" &&
    typeof d.gruposCompletos === "number"
  );
}

function esDatosEjeVertical(datos: unknown): datos is DatosEjeVertical {
  const puntos = (datos as DatosEjeVertical | null)?.puntos;
  return (
    Array.isArray(puntos) &&
    puntos.length > 0 &&
    puntos.every((p) => typeof p?.profundidad === "number" && typeof p?.etiqueta === "string")
  );
}

function esDatosReglaSignos(datos: unknown): datos is DatosReglaSignos {
  const signos = (datos as DatosReglaSignos | null)?.signos;
  return (
    Array.isArray(signos) &&
    signos.length > 0 &&
    signos.every(
      (s) =>
        typeof s?.signo === "string" &&
        typeof s?.lectura === "string" &&
        typeof s?.incluido === "boolean" &&
        (s?.direccion === "izquierda" || s?.direccion === "derecha"),
    )
  );
}

function esDatosFiguraGeometrica(datos: unknown): datos is DatosFiguraGeometrica {
  const d = datos as { figura?: unknown } | null;
  if (typeof d !== "object" || d === null) return false;
  if (!FIGURAS_GEOMETRICAS_VALIDAS.includes(d.figura as (typeof FIGURAS_GEOMETRICAS_VALIDAS)[number])) {
    return false;
  }
  switch (d.figura) {
    case "trianguloPitagoras": {
      const t = d as Partial<DatosTrianguloPitagoras>;
      return (
        typeof t.catetoA === "number" &&
        typeof t.catetoB === "number" &&
        typeof t.etiquetaCatetoA === "string" &&
        typeof t.etiquetaCatetoB === "string" &&
        typeof t.etiquetaHipotenusa === "string"
      );
    }
    case "triangulo": {
      const t = d as Partial<DatosTriangulo>;
      if (!(typeof t.base === "number" && t.base > 0)) return false;
      if (!(typeof t.altura === "number" && t.altura > 0)) return false;
      if (t.etiquetaAltura !== undefined) {
        // Modo área: base + altura visibles. Los lados son opcionales.
        return typeof t.etiquetaAltura === "string" && typeof t.etiquetaBase === "string";
      }
      // Sin etiquetaAltura: modo perímetro, exige los 3 lados juntos (sin mezcla parcial).
      return (
        typeof t.etiquetaBase === "string" &&
        typeof t.etiquetaLadoIzquierdo === "string" &&
        typeof t.etiquetaLadoDerecho === "string"
      );
    }
    case "paralelogramo": {
      const p = d as Partial<DatosParalelogramo>;
      return (
        typeof p.base === "number" &&
        p.base > 0 &&
        typeof p.altura === "number" &&
        p.altura > 0 &&
        typeof p.etiquetaBase === "string"
      );
    }
    case "trapecio": {
      const t = d as Partial<DatosTrapecio>;
      if (
        !(
          typeof t.baseMayor === "number" &&
          typeof t.baseMenor === "number" &&
          t.baseMayor > t.baseMenor &&
          t.baseMenor > 0
        )
      ) {
        return false;
      }
      if (!(typeof t.altura === "number" && t.altura > 0)) return false;
      if (
        t.desplazamientoIzquierdo !== undefined &&
        !(t.desplazamientoIzquierdo >= 0 && t.desplazamientoIzquierdo <= t.baseMayor - t.baseMenor)
      ) {
        return false;
      }
      if (t.etiquetaLadoIzquierdo !== undefined || t.etiquetaLadoDerecho !== undefined) {
        // Sin mezcla parcial: si se etiqueta un lado no paralelo, se etiquetan los dos.
        if (typeof t.etiquetaLadoIzquierdo !== "string" || typeof t.etiquetaLadoDerecho !== "string") {
          return false;
        }
      }
      return typeof t.etiquetaBaseMayor === "string" && typeof t.etiquetaBaseMenor === "string";
    }
    case "circulo": {
      const c = d as Partial<DatosCirculo>;
      return typeof c.radio === "number" && c.radio > 0;
    }
    default:
      return false;
  }
}

/* Mismo viewBox que usa IlustracionCuerpoGeometrico. La guarda de legibilidad
   mide píxeles, así que necesita saber contra qué lienzo se va a dibujar. */
const VIEW_BOX_CUERPOS = { ancho: 240, alto: 200, margen: 28 };

function esEnfasisValido(v: unknown): v is EnfasisCuerpo {
  return ENFASIS_VALIDOS.includes(v as EnfasisCuerpo);
}

/**
 * Calcado de `esDatosFiguraGeometrica`, con una diferencia de fondo: además de
 * la forma del JSON verifica que el cuerpo sea DIBUJABLE, delegando en
 * `motivoRechazo*` de `lib/cuerposGeometricos`. Una caja de 100×100×10 tiene
 * los tres campos bien tipados y aun así colapsa a 7 px en pantalla.
 *
 * Devolver `false` en ese caso —en vez de dejar que el componente lance— hace
 * que el bloque caiga al `<figure>` de texto de más abajo, que sigue siendo
 * contenido legible para el estudiante.
 */
function esDatosCuerpoGeometrico(datos: unknown): datos is DatosCuerpoGeometrico {
  const d = datos as { cuerpo?: unknown; enfasis?: unknown } | null;
  if (typeof d !== "object" || d === null) return false;
  if (!CUERPOS_GEOMETRICOS_VALIDOS.includes(d.cuerpo as (typeof CUERPOS_GEOMETRICOS_VALIDOS)[number])) {
    return false;
  }
  // `enfasis` es obligatorio y explícito: a diferencia del triángulo —donde la
  // presencia de `etiquetaAltura` distingue modo área de modo perímetro—, acá
  // superficie y volumen piden exactamente las mismas cotas, así que no hay
  // ningún campo cuya presencia pueda desambiguarlos.
  if (!esEnfasisValido(d.enfasis)) return false;

  switch (d.cuerpo) {
    case "paralelepipedo": {
      const p = d as Partial<DatosParalelepipedo>;
      if (typeof p.largo !== "number" || typeof p.ancho !== "number" || typeof p.alto !== "number") {
        return false;
      }
      // Sin mezcla parcial: las tres cotas van siempre, o el bloque no se dibuja.
      if (
        typeof p.etiquetaLargo !== "string" ||
        typeof p.etiquetaAncho !== "string" ||
        typeof p.etiquetaAlto !== "string"
      ) {
        return false;
      }
      return motivoRechazoParalelepipedo(p.largo, p.ancho, p.alto, VIEW_BOX_CUERPOS) === null;
    }
    case "cubo": {
      const c = d as Partial<DatosCubo> & Record<string, unknown>;
      if (typeof c.arista !== "number" || typeof c.etiquetaArista !== "string") return false;
      // Un cubo que además trae largo/ancho/alto es ambiguo: no se adivina cuál
      // gana. Es el análogo del `baseMayor > baseMenor` del trapecio — coherencia
      // del tipo, no solo presencia de campos.
      if ("largo" in c || "ancho" in c || "alto" in c) return false;
      return motivoRechazoParalelepipedo(c.arista, c.arista, c.arista, VIEW_BOX_CUERPOS) === null;
    }
    case "cilindro": {
      const c = d as Partial<DatosCilindro>;
      if (typeof c.radio !== "number" || typeof c.altura !== "number") return false;
      if (typeof c.etiquetaRadio !== "string" || typeof c.etiquetaAltura !== "string") return false;
      return motivoRechazoCilindro(c.radio, c.altura) === null;
    }
    default:
      return false;
  }
}

function esDatosBandas(datos: unknown): datos is DatosBandas {
  const bandas = (datos as DatosBandas | null)?.bandas;
  return (
    Array.isArray(bandas) &&
    bandas.length > 0 &&
    bandas.every(
      (b) =>
        typeof b?.operacion === "string" &&
        Array.isArray(b?.puntos) &&
        b.puntos.every((p) => typeof p === "number"),
    )
  );
}

export function BloqueVisualizacion({ bloque }: { bloque: BloqueVisualizacionTipo }) {
  if (bloque.variante === "tabla" && esDatosTabla(bloque.datos)) {
    const { columnas, filas } = bloque.datos;
    return (
      <div className="overflow-x-auto rounded-panel border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columnas.map((c, i) => (
                <th
                  key={i}
                  className="border-b border-border bg-accent-suave px-3.5 py-2.5 text-left align-top font-medium text-ink"
                >
                  {conEnfasis(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i}>
                {fila.map((c, j) => (
                  <td
                    key={j}
                    className={`border-b border-border px-3.5 py-2.5 align-top leading-relaxed ${
                      esNumeroPuro(c) ? "num" : ""
                    }`}
                  >
                    {conEnfasis(String(c))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (bloque.variante === "diagrama" && esDatosPasos(bloque.datos)) {
    return (
      <figure className="space-y-3">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        {bloque.datos.pasos.map((paso, i) => (
          <div key={i} className="space-y-2">
            {i > 0 && paso.accion && (
              <p className="px-1 text-center text-sm text-ink-suave">↓ {paso.accion}</p>
            )}
            <div className="flex items-stretch gap-2 rounded-tarjeta border border-border bg-surface p-3">
              <p className="flex flex-1 items-center justify-center rounded-tarjeta bg-accent-suave px-3 py-3 text-center text-sm text-ink">
                {paso.izquierda}
              </p>
              <span
                aria-hidden="true"
                className="flex items-center px-1 text-xl text-ink-suave"
              >
                =
              </span>
              <p className="flex flex-1 items-center justify-center rounded-tarjeta bg-accent-suave px-3 py-3 text-center text-sm text-ink">
                {paso.derecha}
              </p>
            </div>
            {i === 0 && paso.accion && (
              <p className="px-1 text-center text-sm text-ink-suave">{paso.accion}</p>
            )}
          </div>
        ))}
      </figure>
    );
  }

  if (esDatosParticion(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <IlustracionParticion {...bloque.datos} />
      </figure>
    );
  }

  if (esDatosEjeVertical(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <IlustracionEjeVertical
          puntos={bloque.datos.puntos}
          tramoDestacado={bloque.datos.tramoDestacado}
        />
      </figure>
    );
  }

  if (esDatosReglaSignos(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <TablaReglaSigno filas={bloque.datos.signos} />
      </figure>
    );
  }

  if (esDatosBandas(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <IlustracionBandas bandas={bloque.datos.bandas} />
      </figure>
    );
  }

  if (esDatosFiguraGeometrica(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <IlustracionFiguraGeometrica {...bloque.datos} />
      </figure>
    );
  }

  if (esDatosCuerpoGeometrico(bloque.datos)) {
    return (
      <figure className="rounded-panel border border-border bg-surface p-4">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        <IlustracionCuerpoGeometrico {...bloque.datos} />
      </figure>
    );
  }

  // Sin datos de tabla, la descripción ES el contenido que lee el estudiante
  // (y el texto alternativo de la figura). Se presenta como figura descrita,
  // no como recuadro punteado de "falta algo".
  return (
    <figure className="rounded-panel border border-border bg-surface p-4">
      <figcaption className="mb-1.5 text-sm font-medium text-ink-tenue">Figura</figcaption>
      <p className="text-sm leading-relaxed text-ink-suave">{bloque.descripcion}</p>
    </figure>
  );
}
