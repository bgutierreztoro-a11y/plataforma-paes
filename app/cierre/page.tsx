import { redirect } from "next/navigation";

/* Ruta vieja, previa a que cada tema tuviera su propio cierre (Enmienda 2).
   Se conserva como alias para no romper un link ya compartido; la lógica real
   vive en app/cierre/[temaId]/page.tsx. */
export default function PaginaCierreVieja() {
  redirect("/cierre/funcion-lineal-y-afin");
}
