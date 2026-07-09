import { obtenerCierre } from "@/lib/contenido";
import { sanitizarCierre } from "@/lib/sanitizar";
import { Cierre } from "@/components/Cierre";

export default function PaginaCierre() {
  const cierre = obtenerCierre();
  return <Cierre cierre={sanitizarCierre(cierre)} />;
}
