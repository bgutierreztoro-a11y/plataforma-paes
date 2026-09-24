import { useId } from "react";
import { geometriaCuerpo } from "@/lib/advance/cuerpoGeometrico";
import type { FiguraCuerpoGeometrico } from "@/lib/advance/descarte";
import { DASH_AUXILIAR, LETRA, TRAZO_AUXILIAR, TRAZO_CONTORNO, TRAZO_MARCA, type ContextoLienzo } from "@/lib/advance/lienzoGeometrico";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { DATO, HALO, TINTA } from "./lienzo";

/**
 * Cuerpo geométrico de un ítem Advance (item-advance.schema.json,
 * figuraCuerpoGeometrico; reglas 41 a 50): cajas o cilindros en la caballera
 * del tier gratis. Dibuja lo que declara el banco y no calcula nada del
 * problema. Toda la geometría (qué aristas se ven, dónde va cada cota y cada
 * rótulo, la escala) sale de lib/advance/cuerpoGeometrico.ts, la misma que
 * miden las reglas del validador.
 *
 * Tamaño: el viewBox tiene el ancho del carril de la ubicación a 390 px
 * (358 en el enunciado, 330 en la solución), así que la letra de 12 unidades
 * se ve de 12 px; el alto nunca pasa de 320, porque la escala se ajusta a él.
 *
 * Trazos: las aristas visibles y las tapas en --linea-nav de 2 px, como el
 * contorno del lienzo; las ocultas en --linea-nav, más delgadas y punteadas
 * (no se dibujan con ocultas false); las juntas en --linea-nav, delgadas y
 * continuas; llaves y radio en tinta. Sin relleno de caras. Rótulos en tinta
 * con halo del fondo.
 *
 * Accesibilidad como el lienzo: role="img", <title> corto generado y <desc> =
 * descripcion. Los ids salen de useId: hay pantallas con varias figuras.
 */
export function CuerpoGeometrico({ figura, contexto = "enunciado" }: { figura: FiguraCuerpoGeometrico; contexto?: ContextoLienzo }) {
  const base = `cuerpo${useId()}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const idTitulo = `${base}-titulo`;
  const idDesc = `${base}-desc`;
  const g = geometriaCuerpo(figura, contexto);

  return (
    <svg
      viewBox={`0 0 ${g.ancho} ${Math.round(g.alto * 100) / 100}`}
      className="block h-auto w-full"
      style={{ maxWidth: g.ancho }}
      role="img"
      aria-labelledby={`${idTitulo} ${idDesc}`}
      focusable="false"
      data-cuerpo-geometrico={contexto}
    >
      <title id={idTitulo}>{TEXTOS_ADVANCE.figura.cuerpo}</title>
      <desc id={idDesc}>{figura.descripcion}</desc>

      {g.ocultas.length > 0 && (
        <g fill="none" stroke={DATO} strokeWidth={TRAZO_AUXILIAR} strokeDasharray={DASH_AUXILIAR} data-elemento="ocultas">
          {g.ocultas.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}

      {g.juntas.length > 0 && (
        <g fill="none" stroke={DATO} strokeWidth={TRAZO_AUXILIAR} strokeLinecap="round" data-elemento="juntas">
          {g.juntas.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}

      <g fill="none" stroke={DATO} strokeWidth={TRAZO_CONTORNO} strokeLinecap="round" strokeLinejoin="round" data-elemento="visibles">
        {g.visibles.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {g.radios.length > 0 && (
        <g fill="none" stroke={TINTA} strokeWidth={TRAZO_MARCA} strokeLinecap="round" data-elemento="radios">
          {g.radios.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}

      {g.llaves.length > 0 && (
        <g fill="none" stroke={TINTA} strokeWidth={TRAZO_MARCA} data-elemento="llaves">
          {g.llaves.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}

      <g fill={TINTA} fontSize={LETRA} textAnchor="middle" data-elemento="rotulos">
        {g.rotulos.map((r, i) => (
          <text key={i} {...HALO} x={Math.round(r.x * 100) / 100} y={Math.round(r.y * 100) / 100} dy="0.35em" data-rotulo="cota">
            {r.texto}
          </text>
        ))}
      </g>
    </svg>
  );
}
