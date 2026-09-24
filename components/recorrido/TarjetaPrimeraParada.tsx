"use client";

import Link from "next/link";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import { registrarEvento } from "@/lib/eventos";
import type { VistaParada, VistaPrimeraParada } from "@/lib/recorrido/servidor";
import { TEXTOS_PARADA } from "@/lib/recorrido/textosBienvenida";

/* Marca parada_iniciada_en (una sola vez, el servidor lo asegura) y deja el evento. keepalive: la navegación no lo corta. */
function iniciarParada(parada: VistaParada, fueLaRecomendada: boolean) {
  void fetch("/api/recorrido/inicio", { method: "POST", keepalive: true }).catch(() => {});
  registrarEvento({
    nombre: "primera_parada_iniciada",
    props: { tipo: parada.tipo, destino: parada.destino, fue_la_recomendada: fueLaRecomendada },
  });
}

/** "Tu primera parada" (§4). Se usa en /bienvenida y, desde la Fase 5, en la portada. */
export function TarjetaPrimeraParada({
  parada,
  registrar = true,
}: {
  parada: VistaPrimeraParada;
  /** false en /vista-previa: la galería nunca emite analítica ni escribe en la base. */
  registrar?: boolean;
}) {
  const r = parada.recomendada;
  const iniciar = (p: VistaParada, fueLaRecomendada: boolean) => {
    if (registrar) iniciarParada(p, fueLaRecomendada);
  };
  const detalle = [
    r.etiqueta,
    r.estacion,
    r.linea ? `Línea ${r.linea}` : null,
    r.minutos ? `unos ${r.minutos} minutos` : null,
  ].filter(Boolean);

  return (
    <section className="space-y-4">
      <div className={`${TARJETA_LINEA} space-y-3 px-4 py-4`}>
        <p className="text-etiqueta uppercase text-secondary">{TEXTOS_PARADA.rotulo}</p>
        <p className="text-titulo-m text-primary">{detalle.join(" · ")}</p>
        {parada.motivo && <p className="text-cuerpo-m text-secondary">{parada.motivo}</p>}
        <EnlaceBoton href={r.destino} variante="neutro" onClick={() => iniciar(r, true)}>
          {TEXTOS_PARADA.boton}
        </EnlaceBoton>
      </div>

      {parada.alternativas.length > 0 && (
        <div className="space-y-2">
          <p className="text-cuerpo-m text-secondary">{TEXTOS_PARADA.oSiPrefieres}</p>
          <ul className="space-y-1.5">
            {parada.alternativas.map((a) => (
              <li key={a.destino}>
                <Link
                  href={a.destino}
                  onClick={() => iniciar(a, false)}
                  className="text-titulo-s text-primary underline underline-offset-4 hover:text-secondary"
                >
                  {a.estacion ? `${a.etiqueta}: ${a.estacion}` : a.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-cuerpo-s text-secondary">{TEXTOS_PARADA.pie}</p>
    </section>
  );
}
