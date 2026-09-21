import { DATO, FONDO } from "./lienzo";

/** El <pattern> rayado que usa `rellenoDe(1, id)`. Va dentro de <defs>, una vez por SVG. */
export function Rayas({ id }: { id: string }) {
  return (
    <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="5" height="5" fill={FONDO} />
      <line x1="0" y1="0" x2="0" y2="5" stroke={DATO} strokeWidth="1.75" />
    </pattern>
  );
}
