import { PlanoBase } from "@/components/grafico/PlanoBase";
import { escalaPara } from "@/lib/planoCartesiano";
import {
  ORIGEN,
  distancia,
  figurasDeEscena,
  puntosAuxiliares,
  rangoEscena,
  type DatosTransformacionEscena,
  type Poligono,
  type Punto,
  type Transformacion,
} from "@/lib/transformacionesIsometricas";
import type { DatosTransformacion } from "@/lib/tipos";

/**
 * Una figura del plano y su imagen bajo una o más transformaciones
 * isométricas, sobre el plano cartesiano de `PlanoBase` encuadrado a la
 * escena.
 *
 * Lenguaje visual, fijo para todo el módulo y nunca solo por color:
 * - original en trazo continuo con vértices A, B, C…; imagen en trazo
 *   discontinuo con A', B', C'…; las intermedias de una composición, más
 *   tenues, con una prima por paso.
 * - traslación: flecha con rótulo. Si la imagen se dibuja, va de A a A'; si
 *   no (el ítem pide justamente A'), va desde el origen, que es la forma
 *   habitual de mostrar un vector suelto.
 * - rotación: el centro marcado con un punto y, si la imagen se dibuja, un
 *   arco de A a A' con el ángulo y el sentido.
 * - reflexión: el eje en trazo discontinuo, con su ecuación si no es un eje
 *   coordenado; la reflexión respecto del origen marca el origen.
 *
 * Qué NO hace: decidir si el dibujo regala la respuesta. Eso es de quien
 * escribe el contenido (`mostrarImagen: false` cuando el ítem pide la imagen),
 * ver `lib/visualesItems.tsx`.
 */

const LETRAS = ["A", "B", "C", "D", "E"];
const PRIMA = "'";
const ROTULO_VECTOR = "v";

type Estilo = "original" | "intermedia" | "imagen";

const TRAZO: Record<Estilo, { stroke: string; dasharray?: string; opacidad: number; relleno: number }> = {
  original: { stroke: "var(--color-ink)", opacidad: 1, relleno: 0.45 },
  intermedia: { stroke: "var(--color-ink-suave)", dasharray: "3 4", opacidad: 0.8, relleno: 0.12 },
  imagen: { stroke: "var(--color-accent-fuerte)", dasharray: "6 4", opacidad: 1, relleno: 0.2 },
};

type Mapa = ReturnType<typeof escalaPara>;

const centroide = (fig: Poligono): Punto => [
  fig.reduce((s, p) => s + p[0], 0) / fig.length,
  fig.reduce((s, p) => s + p[1], 0) / fig.length,
];

/** Rótulo de vértice alejado del centro de la figura; en un punto suelto, arriba a la derecha. */
function posicionRotulo(p: Punto, fig: Poligono, mapa: Mapa): { x: number; y: number } {
  const px = mapa.xAPixel(p[0]);
  const py = mapa.yAPixel(p[1]);
  if (fig.length < 3) return { x: px + 7, y: py - 7 };
  const c = centroide(fig);
  const dx = mapa.xAPixel(p[0]) - mapa.xAPixel(c[0]);
  const dy = mapa.yAPixel(p[1]) - mapa.yAPixel(c[1]);
  const largo = Math.hypot(dx, dy) || 1;
  return { x: px + (dx / largo) * 12, y: py + (dy / largo) * 12 + 3 };
}

function Figura({
  puntos,
  rotulos,
  estilo,
  trazo,
  mapa,
}: {
  puntos: Poligono;
  rotulos: string[];
  estilo: Estilo;
  trazo: "poligono" | "puntos";
  mapa: Mapa;
}) {
  const t = TRAZO[estilo];
  const enPantalla = puntos.map((p) => `${mapa.xAPixel(p[0])},${mapa.yAPixel(p[1])}`).join(" ");
  const unir = trazo === "poligono" && puntos.length >= 2;
  return (
    <g opacity={t.opacidad}>
      {unir && puntos.length >= 3 && (
        <polygon
          points={enPantalla}
          fill="var(--color-accent-suave)"
          fillOpacity={t.relleno}
          stroke={t.stroke}
          strokeWidth={2}
          strokeDasharray={t.dasharray}
          strokeLinejoin="round"
        />
      )}
      {unir && puntos.length === 2 && (
        <polyline
          points={enPantalla}
          fill="none"
          stroke={t.stroke}
          strokeWidth={2}
          strokeDasharray={t.dasharray}
          strokeLinecap="round"
        />
      )}
      {puntos.map((p, i) => {
        const pos = posicionRotulo(p, puntos, mapa);
        return (
          <g key={i}>
            <circle cx={mapa.xAPixel(p[0])} cy={mapa.yAPixel(p[1])} r={3.5} fill={t.stroke} />
            <text
              x={pos.x}
              y={pos.y}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fill={t.stroke}
            >
              {rotulos[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Flecha de `desde` a `hasta`, en unidades del plano, con rótulo al medio. */
function Flecha({ desde, hasta, rotulo, mapa }: { desde: Punto; hasta: Punto; rotulo: string; mapa: Mapa }) {
  const x1 = mapa.xAPixel(desde[0]);
  const y1 = mapa.yAPixel(desde[1]);
  const x2 = mapa.xAPixel(hasta[0]);
  const y2 = mapa.yAPixel(hasta[1]);
  const largo = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / largo;
  const uy = (y2 - y1) / largo;
  const punta = 8;
  const base = { x: x2 - ux * punta, y: y2 - uy * punta };
  const cabeza = `${x2},${y2} ${base.x - uy * 4},${base.y + ux * 4} ${base.x + uy * 4},${base.y - ux * 4}`;
  // El rótulo va al costado izquierdo del sentido de avance, para no pisar la línea.
  const mx = (x1 + x2) / 2 - uy * 11;
  const my = (y1 + y2) / 2 + ux * 11 + 3;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={base.x}
        y2={base.y}
        stroke="var(--color-accent-fuerte)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <polygon points={cabeza} fill="var(--color-accent-fuerte)" />
      <text
        x={mx}
        y={my}
        fontSize={10}
        fontWeight={600}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fill="var(--color-accent-fuerte)"
      >
        {rotulo}
      </text>
    </g>
  );
}

/** Arco de rotación de `desde` a `hasta` en torno a `centro`, con el ángulo rotulado. */
function Arco({
  centro,
  desde,
  hasta,
  grados,
  sentido,
  mapa,
}: {
  centro: Punto;
  desde: Punto;
  hasta: Punto;
  grados: number;
  sentido: "antihorario" | "horario";
  mapa: Mapa;
}) {
  const radio = distancia(centro, desde) * mapa.pixelesPorUnidad;
  if (radio === 0) return null;
  const cx = mapa.xAPixel(centro[0]);
  const cy = mapa.yAPixel(centro[1]);
  const x1 = mapa.xAPixel(desde[0]);
  const y1 = mapa.yAPixel(desde[1]);
  const x2 = mapa.xAPixel(hasta[0]);
  const y2 = mapa.yAPixel(hasta[1]);
  /* En pantalla el eje y crece hacia abajo, así que el sentido antihorario de
     la matemática es el sweep 0 del SVG, y el horario el sweep 1. */
  const sweep = sentido === "horario" ? 1 : 0;
  const largeArc = grados > 180 ? 1 : 0;
  // Punto medio del arco, para el rótulo: se gira el vector centro→desde la mitad del ángulo.
  const signo = sentido === "horario" ? -1 : 1;
  const angulo0 = Math.atan2(desde[1] - centro[1], desde[0] - centro[0]);
  const anguloMedio = angulo0 + (signo * (grados / 2) * Math.PI) / 180;
  const r = distancia(centro, desde);
  const mx = mapa.xAPixel(centro[0] + Math.cos(anguloMedio) * r * 1.18);
  const my = mapa.yAPixel(centro[1] + Math.sin(anguloMedio) * r * 1.18);
  const flechaAngulo = Math.atan2(y2 - cy, x2 - cx) + (sentido === "horario" ? Math.PI / 2 : -Math.PI / 2);
  const cabeza = [
    [x2, y2],
    [x2 - Math.cos(flechaAngulo) * 8 + Math.sin(flechaAngulo) * 4, y2 - Math.sin(flechaAngulo) * 8 - Math.cos(flechaAngulo) * 4],
    [x2 - Math.cos(flechaAngulo) * 8 - Math.sin(flechaAngulo) * 4, y2 - Math.sin(flechaAngulo) * 8 + Math.cos(flechaAngulo) * 4],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
  return (
    <g>
      <path
        d={`M ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} ${sweep} ${x2} ${y2}`}
        fill="none"
        stroke="var(--color-accent-fuerte)"
        strokeWidth={1.5}
        strokeDasharray="2 3"
      />
      <polygon points={cabeza} fill="var(--color-accent-fuerte)" />
      <text
        x={mx}
        y={my + 3}
        fontSize={10}
        fontWeight={600}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fill="var(--color-accent-fuerte)"
      >
        {`${grados}° ${sentido === "horario" ? "↻" : "↺"}`}
      </text>
    </g>
  );
}

function Eje({ t, rango, mapa }: { t: Extract<Transformacion, { tipo: "reflexion" }>; rango: ReturnType<typeof rangoEscena>; mapa: Mapa }) {
  const eje = t.eje;
  const comun = {
    stroke: "var(--color-accent-fuerte)",
    strokeWidth: 2,
    strokeDasharray: "7 4",
    strokeLinecap: "round" as const,
  };
  if (eje === "origen") {
    return (
      <g>
        <circle cx={mapa.xAPixel(0)} cy={mapa.yAPixel(0)} r={5} fill="none" stroke="var(--color-accent-fuerte)" strokeWidth={2} />
        <circle cx={mapa.xAPixel(0)} cy={mapa.yAPixel(0)} r={2} fill="var(--color-accent-fuerte)" />
      </g>
    );
  }
  if (eje === "x") {
    return <line x1={mapa.xAPixel(rango.xMin)} y1={mapa.yAPixel(0)} x2={mapa.xAPixel(rango.xMax)} y2={mapa.yAPixel(0)} {...comun} />;
  }
  if (eje === "y") {
    return <line x1={mapa.xAPixel(0)} y1={mapa.yAPixel(rango.yMin)} x2={mapa.xAPixel(0)} y2={mapa.yAPixel(rango.yMax)} {...comun} />;
  }
  if ("vertical" in eje) {
    return (
      <g>
        <line x1={mapa.xAPixel(eje.vertical)} y1={mapa.yAPixel(rango.yMin)} x2={mapa.xAPixel(eje.vertical)} y2={mapa.yAPixel(rango.yMax)} {...comun} />
        <text x={mapa.xAPixel(eje.vertical) + 4} y={mapa.yAPixel(rango.yMax) + 11} fontSize={10} fontFamily="var(--font-sans)" fill="var(--color-accent-fuerte)">
          {`x = ${eje.vertical}`}
        </text>
      </g>
    );
  }
  return (
    <g>
      <line x1={mapa.xAPixel(rango.xMin)} y1={mapa.yAPixel(eje.horizontal)} x2={mapa.xAPixel(rango.xMax)} y2={mapa.yAPixel(eje.horizontal)} {...comun} />
      <text x={mapa.xAPixel(rango.xMax) - 4} y={mapa.yAPixel(eje.horizontal) - 4} fontSize={10} textAnchor="end" fontFamily="var(--font-sans)" fill="var(--color-accent-fuerte)">
        {`y = ${eje.horizontal}`}
      </text>
    </g>
  );
}

const coordenada = (p: Punto) => `(${p[0]}, ${p[1]})`;

function describirTransformacion(t: Transformacion): string {
  switch (t.tipo) {
    case "traslacion":
      return `una traslación por el vector (${t.vector[0]}, ${t.vector[1]})`;
    case "rotacion": {
      const centro = t.centro ?? ORIGEN;
      const donde = centro[0] === 0 && centro[1] === 0 ? "el origen" : `el punto ${coordenada(centro)}`;
      return `una rotación de ${t.grados} grados en sentido ${t.sentido} en torno a ${donde}`;
    }
    case "reflexion": {
      const eje = t.eje;
      if (eje === "x" || eje === "y") return `una reflexión respecto del eje ${eje}`;
      if (eje === "origen") return "una reflexión respecto del origen";
      if ("vertical" in eje) return `una reflexión respecto de la recta x = ${eje.vertical}`;
      return `una reflexión respecto de la recta y = ${eje.horizontal}`;
    }
  }
}

function etiquetaAccesible(datos: DatosTransformacionEscena, rotulos: string[], imagen: string[], mostrarImagen: boolean): string {
  const nombre = rotulos.join("");
  const vertices = datos.figura.map(coordenada).join(", ");
  const que = datos.figura.length === 1 ? `el punto ${nombre} en ${vertices}` : `la figura ${nombre} de vértices ${vertices}`;
  if (datos.transformaciones.length === 0) return `Plano cartesiano con ${que}.`;
  const lista = datos.transformaciones.map(describirTransformacion).join(" y luego ");
  if (!mostrarImagen) return `Plano cartesiano con ${que}, sobre el que se aplica ${lista}. La imagen no está dibujada.`;
  const final = figurasDeEscena(datos)[datos.transformaciones.length].map(coordenada).join(", ");
  return `Plano cartesiano con ${que} y su imagen ${imagen.join("")} en ${final}, tras ${lista}.`;
}

export function IlustracionTransformacion(datos: DatosTransformacion) {
  const escena = datos as DatosTransformacionEscena;
  const figuras = figurasDeEscena(escena);
  const n = escena.transformaciones.length;
  const mostrarImagen = (escena.mostrarImagen ?? true) && n > 0;
  const mostrarIntermedias = (escena.mostrarIntermedias ?? false) && n > 1;
  const trazo = escena.trazo ?? "poligono";
  const rotulos = escena.rotulos ?? escena.figura.map((_, i) => LETRAS[i]);
  const rotulosFinal = escena.rotulosImagen ?? rotulos.map((r) => r + (mostrarIntermedias ? PRIMA.repeat(n) : PRIMA));
  const rotuloVector = escena.rotuloVector ?? ROTULO_VECTOR;

  const dibujadas: number[] = [0];
  if (mostrarIntermedias) for (let k = 1; k < n; k++) dibujadas.push(k);
  if (mostrarImagen) dibujadas.push(n);

  /* El vector suelto (traslación sin imagen) se dibuja desde el origen, así
     que su extremo también tiene que caber en el cuadro. */
  const vectorSuelto: Punto[] =
    n === 1 && !mostrarImagen && escena.transformaciones[0].tipo === "traslacion"
      ? [escena.transformaciones[0].vector]
      : [];
  const encuadre = [...dibujadas.flatMap((k) => figuras[k]), ...puntosAuxiliares(escena), ...vectorSuelto];
  const rango = rangoEscena(encuadre);
  const mapa = escalaPara(rango);
  /* Los elementos dinámicos (flecha de A a A', arco) solo tienen sentido
     cuando las dos figuras del paso están dibujadas. */
  const pasoVisible = (k: number) => dibujadas.includes(k) && dibujadas.includes(k + 1);

  return (
    <PlanoBase ariaLabel={etiquetaAccesible(escena, rotulos, rotulosFinal, mostrarImagen)} rango={rango}>
      {escena.transformaciones.map((t, k) =>
        t.tipo === "reflexion" ? <Eje key={`eje${k}`} t={t} rango={rango} mapa={mapa} /> : null,
      )}
      {escena.transformaciones.map((t, k) => {
        if (t.tipo !== "rotacion") return null;
        const centro = t.centro ?? ORIGEN;
        return (
          <g key={`centro${k}`}>
            <circle cx={mapa.xAPixel(centro[0])} cy={mapa.yAPixel(centro[1])} r={4} fill="var(--color-accent-fuerte)" />
            {pasoVisible(k) && (
              <Arco centro={centro} desde={figuras[k][0]} hasta={figuras[k + 1][0]} grados={t.grados} sentido={t.sentido} mapa={mapa} />
            )}
          </g>
        );
      })}
      {dibujadas.map((k) => (
        <Figura
          key={`fig${k}`}
          puntos={figuras[k]}
          rotulos={k === 0 ? rotulos : k === n ? rotulosFinal : rotulos.map((r) => r + PRIMA.repeat(k))}
          estilo={k === 0 ? "original" : k === n ? "imagen" : "intermedia"}
          trazo={trazo}
          mapa={mapa}
        />
      ))}
      {escena.transformaciones.map((t, k) => {
        if (t.tipo !== "traslacion") return null;
        if (pasoVisible(k)) {
          const pares = trazo === "puntos" ? figuras[k].map((_, i) => i) : [0];
          return pares.map((i) => (
            <Flecha key={`v${k}-${i}`} desde={figuras[k][i]} hasta={figuras[k + 1][i]} rotulo={rotuloVector} mapa={mapa} />
          ));
        }
        if (n === 1) return <Flecha key={`v${k}`} desde={ORIGEN} hasta={t.vector} rotulo={rotuloVector} mapa={mapa} />;
        return null;
      })}
    </PlanoBase>
  );
}
