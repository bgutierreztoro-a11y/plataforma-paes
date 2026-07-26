import { redirect } from "next/navigation";

/**
 * /lecciones se fusionó con /camino.
 *
 * La ruta no se borra porque ya circula en enlaces internos y posiblemente en
 * el historial de alguien: un 404 sería peor que una redirección. Tener dos
 * formas de navegar el mismo contenido era la deuda de diseño que el camino de
 * dos niveles vino a saldar.
 */
export default function IndiceLecciones() {
  redirect("/camino");
}
