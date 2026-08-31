interface PuntajeProps {
  aciertos: number;
  total: number;
  /* Rótulo sobre la cifra ("Cierre", "Diagnóstico"). Sin él la cifra va sola. */
  rotulo?: string;
  /* Pie bajo la cifra ("tu punto de partida"). */
  pie?: string;
  className?: string;
}

/**
 * La cifra del resultado, en el tamaño en que se lee de una sola mirada.
 *
 * El denominador va apagado porque no es la noticia: lo que se busca al mirar es
 * cuántas salieron bien, y el total ya se sabe. Va en `--text-secondary` y no en
 * `--text-muted` —el `ink3` de la escala— por contraste medido: `#A9ABAF` da
 * 2,30:1 contra la tarjeta y no alcanza AA ni con el umbral de texto grande
 * (3:1), mientras que `#71747A` da 4,69:1 y sigue leyéndose apagado frente a los
 * 17,76:1 del numerador. La jerarquía se sostiene con la diferencia, no con el
 * valor absoluto.
 *
 * El `aria-label` lleva la frase entera y las dos cifras quedan `aria-hidden`:
 * leídas sueltas, "6" y "/ 8" se anuncian como dos números sin relación.
 */
export function Puntaje({ aciertos, total, rotulo, pie, className = "" }: PuntajeProps) {
  return (
    <div className={className}>
      {rotulo && <p className="text-etiqueta uppercase text-secondary">{rotulo}</p>}
      <p
        className="mt-1.5 flex items-baseline gap-1"
        aria-label={`${aciertos} de ${total} correctas`}
      >
        <span aria-hidden className="text-display-l num text-primary">
          {aciertos}
        </span>
        <span aria-hidden className="text-display-m num text-secondary">
          /{total}
        </span>
      </p>
      {pie && <p className="mt-1 text-cuerpo-s text-secondary">{pie}</p>}
    </div>
  );
}
