import type { Metadata } from "next";
import { obtenerCierre } from "@/lib/contenido";
import { sanitizarCierre } from "@/lib/sanitizar";
import { Cierre } from "@/components/Cierre";

export const metadata: Metadata = {
  title: "Cierre",
  description: "Ocho preguntas formato PAES para ver cuánto avanzaste en el módulo.",
};

export default function PaginaCierre() {
  const cierre = obtenerCierre();
  return <Cierre cierre={sanitizarCierre(cierre)} />;
}
