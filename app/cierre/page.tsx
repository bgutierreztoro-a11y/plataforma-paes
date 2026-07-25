import type { Metadata } from "next";
import { idsPublicables, obtenerCierre } from "@/lib/contenido";
import { sanitizarCierre } from "@/lib/sanitizar";
import { Cierre } from "@/components/Cierre";

export const metadata: Metadata = {
  title: "Cierre",
  description: "Ocho preguntas formato PAES para ver cuánto avanzaste en el módulo.",
};

export default function PaginaCierre() {
  const cierre = obtenerCierre();
  /* Última lección abierta del camino: es la que el estudiante deja atrás
     cuando pide "la próxima". Se deriva acá, en servidor, para que el evento no
     quede atado a un id escrito a mano que el camino ya no incluye. */
  const ultimaLeccionId = idsPublicables().at(-1);
  return <Cierre cierre={sanitizarCierre(cierre)} ultimaLeccionId={ultimaLeccionId} />;
}
