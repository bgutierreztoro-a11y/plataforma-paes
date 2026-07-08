import { obtenerCierre } from "@/lib/contenido";
import { Cierre } from "@/components/Cierre";

export default function PaginaCierre() {
  const cierre = obtenerCierre();
  return <Cierre cierre={cierre} />;
}
