import { useId } from "react";
import type { FiguraLienzoGeometrico } from "@/lib/advance/descarte";
import {
  DASH_AUXILIAR,
  LETRA,
  RADIO_PUNTO_MARCADO,
  TRAZO_AUXILIAR,
  TRAZO_CONTORNO,
  TRAZO_MARCA,
  geometriaLienzo,
  type ContextoLienzo,
  type FormaPx,
} from "@/lib/advance/lienzoGeometrico";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { DATO, HAIRLINE, HALO, TINTA, TINTE } from "./lienzo";

/**
 * Lienzo geométrico de un ítem Advance (item-advance.schema.json,
 * figuraLienzoGeometrico; reglas 28 a 39): geometría plana sin ejes. Dibuja lo
 * que declara el banco y no calcula nada del problema. Toda la geometría (mundo
 * a píxeles, dónde va cada rótulo, llaves, achurados, marcas, regiones) sale de
 * lib/advance/lienzoGeometrico.ts, la misma que miden las reglas del validador.
 *
 * Tamaño: el viewBox tiene el ancho del carril de la ubicación a 390 px
 * (358 en el enunciado, 316 en una alternativa, 330 en la solución), así que
 * la letra de 12 unidades se ve de 12 px. El ancho máximo es ese mismo ancho
 * en píxeles: en pantallas más anchas la figura no crece, y el alto nunca pasa
 * de los 320 px que controla la regla 34.
 *
 * Trazos (13g): el contorno (polígonos, circunferencias, arcos y segmentos
 * continuos) en --linea-nav y 2 px; los auxiliares punteados en tinta, más
 * delgados. Rótulos en tinta con halo del fondo, para que se lean sobre tramas
 * y líneas. Las regiones se componen con una máscara (formas en blanco, huecos
 * en negro), no con evenodd, así que formas superpuestas componen bien; los
 * dos estilos se distinguen por trama (rayas o puntos), no por color.
 *
 * Accesibilidad como PlanoFuncion y el diagrama de cajón: role="img", <title>
 * corto generado y <desc> = descripcion del banco. Los ids de tramas y
 * máscaras salen de useId: hay pantallas con cinco figuras a la vez.
 */
export function LienzoGeometrico({ figura, contexto = "enunciado" }: { figura: FiguraLienzoGeometrico; contexto?: ContextoLienzo }) {
  const base = `lienzo${useId()}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const idTitulo = `${base}-titulo`;
  const idDesc = `${base}-desc`;
  const trama = { rayado: `${base}-rayado`, punteado: `${base}-punteado` };
  const g = geometriaLienzo(figura, contexto);
  const { figura: textos } = TEXTOS_ADVANCE;
  const titulo = figura.aEscala === false ? `${textos.lienzo}. ${textos.noAEscala}` : textos.lienzo;
  const forma = (f: FormaPx, fill: string, key: number) =>
    f.clase === "circulo" ? <circle key={key} cx={f.cx} cy={f.cy} r={f.r} fill={fill} /> : <path key={key} d={f.d} fill={fill} />;

  return (
    <svg
      viewBox={`0 0 ${g.ancho} ${Math.round(g.alto * 100) / 100}`}
      className="block h-auto w-full"
      style={{ maxWidth: g.ancho }}
      role="img"
      aria-labelledby={`${idTitulo} ${idDesc}`}
      focusable="false"
      data-lienzo-geometrico={contexto}
    >
      <title id={idTitulo}>{titulo}</title>
      <desc id={idDesc}>{figura.descripcion}</desc>

      {g.regiones.length > 0 && (
        <defs>
          <pattern id={trama.rayado} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={TINTE} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={DATO} strokeWidth="1.25" />
          </pattern>
          <pattern id={trama.punteado} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={TINTE} />
            <circle cx="3" cy="3" r="1.3" fill={DATO} />
          </pattern>
          {g.regiones.map((reg, i) => (
            <mask key={i} id={`${base}-region${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={g.ancho} height={g.altoDibujo}>
              <rect width={g.ancho} height={g.altoDibujo} fill="black" />
              {reg.formas.map((f, k) => forma(f, "white", k))}
              {reg.huecos.map((f, k) => forma(f, "black", reg.formas.length + k))}
            </mask>
          ))}
        </defs>
      )}

      {g.cuadricula.length > 0 && (
        <g stroke={HAIRLINE} strokeWidth="1" data-elemento="cuadricula">
          {g.cuadricula.map((l, i) => (
            <line key={i} {...l} />
          ))}
        </g>
      )}

      {g.regiones.map((reg, i) => (
        <rect key={i} width={g.ancho} height={g.altoDibujo} fill={`url(#${trama[reg.estilo]})`} mask={`url(#${base}-region${i})`} data-region={reg.estilo} />
      ))}

      <g fill="none" stroke={DATO} strokeWidth={TRAZO_CONTORNO} strokeLinejoin="round" data-elemento="contorno">
        {g.poligonos.map((d, i) => (
          <path key={`p${i}`} d={d} />
        ))}
        {g.circunferencias.map((c, i) => (
          <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
        {g.arcos.map((d, i) => (
          <path key={`a${i}`} d={d} />
        ))}
      </g>

      {g.segmentos.map((sg) => {
        const auxiliar = sg.trazo === "punteado";
        const color = auxiliar ? TINTA : DATO;
        return (
          <g key={sg.indice} data-segmento={sg.indice} data-trazo={sg.trazo}>
            {sg.achurado && <path d={sg.achurado} stroke={TINTA} strokeWidth="1" fill="none" data-elemento="achurado" />}
            <line
              x1={sg.p1.x}
              y1={sg.p1.y}
              x2={sg.p2.x}
              y2={sg.p2.y}
              stroke={color}
              strokeWidth={auxiliar ? TRAZO_AUXILIAR : TRAZO_CONTORNO}
              strokeDasharray={auxiliar ? DASH_AUXILIAR : undefined}
              strokeLinecap="round"
            />
            {sg.marcas.map((d, k) => (
              <path key={k} d={d} stroke={TINTA} strokeWidth={TRAZO_MARCA} fill="none" strokeLinecap="round" strokeLinejoin="round" data-elemento="marca" />
            ))}
            {sg.llave && <path d={sg.llave} stroke={TINTA} strokeWidth={TRAZO_MARCA} fill="none" data-elemento="llave" />}
            {sg.flecha && <path d={sg.flecha} fill={color} data-elemento="flecha" />}
          </g>
        );
      })}

      <g fill="none" stroke={TINTA} strokeWidth={TRAZO_MARCA} data-elemento="angulos">
        {g.angulos.map((a) => (
          <path key={a.indice} d={a.d} />
        ))}
      </g>

      {g.marcados.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={RADIO_PUNTO_MARCADO} fill={TINTA} data-elemento="punto" />
      ))}

      <g fill={TINTA} fontSize={LETRA} textAnchor="middle" data-elemento="rotulos">
        {g.rotulos.map((r, i) => (
          <text key={i} {...HALO} x={Math.round(r.x * 100) / 100} y={Math.round(r.y * 100) / 100} dy="0.35em" data-rotulo={r.origen}>
            {r.texto}
          </text>
        ))}
      </g>

      {g.nota && (
        <text {...HALO} x={g.nota.x} y={g.nota.y} dy="0.35em" fontSize={LETRA} fill={TINTA} data-elemento="nota">
          {textos.noAEscala}
        </text>
      )}
    </svg>
  );
}
